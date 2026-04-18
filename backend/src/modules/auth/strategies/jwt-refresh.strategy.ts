import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { User } from '../../users/entities/user.entity';

// Separate strategy for the long-lived REFRESH token.
// It reads the token from the Authorization header as a Bearer token,
// but uses a DIFFERENT secret (JWT_REFRESH_SECRET) so the two token
// types cannot be used interchangeably — this is a security boundary.
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: number; email: string }) {
    const refreshToken = req.headers.authorization?.replace('Bearer ', '');
    const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    return user;
  }
}
