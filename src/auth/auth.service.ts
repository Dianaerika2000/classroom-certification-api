import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MoodleService } from 'src/moodle/moodle.service';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from './interfaces/jwt-payload.interfaces';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly moodleService: MoodleService,
    private readonly userService: UserService,
  ){}

  async login(loginDto: LoginDto): Promise<any> {
    const { username, password } = loginDto;
    
    try {
      const user = await this.userService.findOneByUsername(username);
      const moodleToken = await this.moodleService.authenticate(username, password);
      const accessToken = this.getJwtToken({ username });
      
      return {
        user: {
          ...user,
          moodleToken,
          accessToken,
        }
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error en la autenticación con Moodle', HttpStatus.UNAUTHORIZED);
    }
  }

  private getJwtToken(payload: JwtPayload){
    const token = this.jwtService.sign( payload );
    return token;
  }
}
