import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
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
  ) {}

  async signup(signupDto: SignupDto) {
    const existingUser = await this.usersRepository.findOne({ where: { email: signupDto.email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    const user = this.usersRepository.create({
      ...signupDto,
      password: hashedPassword,
      provider: AuthProvider.LOCAL,
    });

    await this.usersRepository.save(user);
    return this.login({ email: user.email, password: signupDto.password });
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
      select: ['id', 'email', 'password', 'name', 'roles','provider'], // Request explicitly hidden password
      relations: ['roles', 'roles.permissions'],
    });

    if (!user || user.provider !== AuthProvider.LOCAL) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password!);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  async googleLogin(req) {
    if (!req.user) {
      throw new UnauthorizedException('No user from google');
    }
    const { email, firstName, lastName, picture, googleId } = req.user;
    
    let user = await this.usersRepository.findOne({ where: { email }, relations: ['roles', 'roles.permissions'] });
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
    
    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    };
  }
}
