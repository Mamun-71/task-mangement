import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, AuthProvider } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signup(signupDto: SignupDto) {
    const existing = await this.usersRepository.findOne({
      where: { email: signupDto.email },
    });
    if (existing) throw new BadRequestException('User with this email already exists');

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    const user = this.usersRepository.create({
      ...signupDto,
      password: hashedPassword,
      provider: AuthProvider.LOCAL,
    });
    await this.usersRepository.save(user);
    return this.issueTokens(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
      select: ['id', 'email', 'password', 'name', 'provider'],
      relations: ['roles', 'roles.permissions'],
    });

    if (!user || user.provider !== AuthProvider.LOCAL) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(loginDto.password, user.password!);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user);
  }

  async googleLogin(req: any) {
    if (!req.user) throw new UnauthorizedException('No user from Google');

    const { email, firstName, lastName, picture, googleId } = req.user;
    let user = await this.usersRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      user = this.usersRepository.create({
        email,
        name: `${firstName} ${lastName}`,
        profilePicture: picture,
        googleId,
        provider: AuthProvider.GOOGLE,
      });
      await this.usersRepository.save(user);
    }

    return this.issueTokens(user);
  }

  // Called by JwtRefreshStrategy when the refresh token is validated.
  async refreshTokens(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) throw new UnauthorizedException();
    return this.issueTokens(user);
  }

  async logout(userId: number) {
    // Invalidate the stored refresh token so it can never be reused.
    await this.usersRepository.update(userId, { refreshToken: null });
  }

  // ── Private helpers ───────────────────────────────────────────────────

  private async issueTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload);

    // Refresh token is signed with a DIFFERENT secret and longer expiry.
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    // Store raw refresh token so JwtRefreshStrategy can compare later.
    // In production consider hashing it: bcrypt.hash(refreshToken, 10)
    await this.usersRepository.update(user.id, { refreshToken });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    };
  }
}
