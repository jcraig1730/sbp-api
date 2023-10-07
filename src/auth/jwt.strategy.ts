import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req) => req.cookies.bearer,
      ignoreExpiration: false,
      secretOrKey: configService.get('AUTH_SECRET'),
    });
  }

  async validate(payload: any) {
    return payload.user;
  }
}
