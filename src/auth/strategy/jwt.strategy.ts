import { PrismaService } from './../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { PayloadType } from '../types';
import { Cookies, Messages } from 'src/common/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        let token = null;
        if (req && req.cookies) {
          token = req.cookies[Cookies.ACCESS_TOKEN];
        }
        return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: PayloadType) {
    const user = await this.prismaService.account.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      throw new NotFoundException(Messages.USER.FAILED.NOT_FOUND);
    }
    return {
      id: user.id,
      staffCode: user.staffCode,
      username: user.username,
      status: user.status,
      type: user.type,
      location: user.location,
    };
  }
}
