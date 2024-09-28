import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interfaces';
import * as bcrypt from 'bcrypt';
import { MoodleService } from 'src/moodle/moodle.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly moodleService: MoodleService,
  ){}

  async validateUser(loginDto: LoginDto): Promise<any> {
    const { username, password } = loginDto;
    
    try {
      const moodleToken = await this.moodleService.authenticate(username, password);
      const moodleUserInfo = await this.moodleService.getUserInfo(moodleToken, username);

      let user = await this.userRepository.findOneBy({ username });
      
      if (!user) {
        user = this.userRepository.create({
          username: username,
          password: bcrypt.hashSync(password, 10),
          name: moodleUserInfo.fullname
        });
        await this.userRepository.save(user);
      } else if (user.name !== moodleUserInfo.fullname) {
        user.name = moodleUserInfo.fullname;
        await this.userRepository.save(user);
      }

      return {
        ...user,
        moodleToken
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error en la autenticación', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(user: any) {
    let payload = { username: user.username }
    const access_token = this.getJwtToken(payload);
    
    return {
      data: {
        message: "Inicio de sesión exitoso",
        user: {
          ...user,
          access_token
        }
      }
    };
  }

  private getJwtToken(payload: JwtPayload){
    const token = this.jwtService.sign( payload );
    return token;
  }
}
