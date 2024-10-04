import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../interfaces/jwt-payload.interfaces";
import { ConfigService } from '@nestjs/config';
import { Injectable } from "@nestjs/common";
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ){
  constructor(
    configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const { username } = payload;
    const user = await this.userService.findOneByUsername(username);
    
    return user;
  }
}