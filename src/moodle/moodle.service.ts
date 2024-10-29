import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { url } from 'inspector';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { FindClassroomMoodleDto } from './dto/find-classroom-moodle.dto';

@Injectable()
export class MoodleService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ){}

  async authenticate(username: string, password: string): Promise<string> {
    const urlMoodle = this.configService.get<string>('MOODLE_AUTH_URL');
    const service = this.configService.get<string>('MOODLE_SERVICE');

    if (!urlMoodle || !service) {
      throw new HttpException('Configuración de Moodle incompleta', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      const response = await lastValueFrom(this.httpService.post(urlMoodle, null, {
        params: {
          username,
          password,
          service
        }
      }));

      if (response.data && response.data.token) {
        return response.data.token;
      } else {
        throw new HttpException('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        throw new HttpException('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException('Error al autenticar con Moodle', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserInfo(token: string, username: string): Promise<any> {
    const apiUrl = this.configService.get<string>('MOODLE_API_URL');
    
    if (!apiUrl) {
      throw new HttpException('Configuración de Moodle incompleta', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  
    const queryParams = `wstoken=${token}&moodlewsrestformat=json&wsfunction=core_user_get_users_by_field&field=username&values[0]=${username}`;
  
    try {
      const response = await firstValueFrom(this.httpService.get(`${apiUrl}?${queryParams}`));
      if (response.data && response.data.length > 0) {
        return response.data[0];
      } else {
        throw new HttpException('Usuario no encontrado en Moodle', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error(error);
      throw new HttpException('Error al obtener información del usuario de Moodle', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async getAllUsers(token: string): Promise<any> {
    const apiUrl = this.configService.get<string>('MOODLE_API_URL');
    
    if (!apiUrl) {
      throw new HttpException('Configuración de Moodle incompleta', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const queryParams = `wstoken=${token}&moodlewsrestformat=json&wsfunction=core_user_get_users&criteria[0][key]=&criteria[0][value]=`;

    try {
      const response = await firstValueFrom(this.httpService.get(`${apiUrl}?${queryParams}`));
      if (response.data && response.data.users) {
        return response.data.users;
      } else {
        throw new HttpException('No se encontraron usuarios en Moodle', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error(error);
      throw new HttpException('Error al obtener la lista de usuarios de Moodle', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getCourseByField(findClassroomMoodleDto: FindClassroomMoodleDto): Promise<any> {
    const { token, field, value} = findClassroomMoodleDto;
    const apiUrl = this.configService.get<string>('MOODLE_API_URL');
    
    if (!apiUrl) {
      throw new HttpException('Configuración de Moodle incompleta', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  
    const queryParams = `wstoken=${token}&moodlewsrestformat=json&wsfunction=core_course_get_courses_by_field&field=${field}&value=${value}`;
  
    try {
      const response = await firstValueFrom(this.httpService.get(`${apiUrl}?${queryParams}`));
      if (response.data && response.data.courses.length > 0) {
        return response.data.courses;
      } else {
        throw new HttpException('Curso no encontrado en Moodle', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      console.error(error);
      throw new HttpException('Error al obtener el curso de Moodle', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  } 
}
