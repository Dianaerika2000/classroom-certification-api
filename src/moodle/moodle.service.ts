import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Injectable()
export class MoodleService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) { }

  private getMoodleApiUrl(): string {
    const apiUrl = this.configService.get<string>('MOODLE_API_URL');
    if (!apiUrl) {
      throw new HttpException('Configuración de Moodle incompleta', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return apiUrl;
  }

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
    const apiUrl = this.getMoodleApiUrl();

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
    const apiUrl = this.getMoodleApiUrl();

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

  async getCourseContents(courseId: number, token: string): Promise<any> {
    const apiUrl = this.getMoodleApiUrl();
    const queryParams = `wstoken=${token}&moodlewsrestformat=json&wsfunction=core_course_get_contents&courseid=${courseId}`;

    try {
      const response = await firstValueFrom(this.httpService.get(`${apiUrl}?${queryParams}`));
      return response.data;
    } catch (error) {
      console.error(error);
      throw new HttpException('Error al obtener contenidos del curso de Moodle', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getBookChapterContent(token: string, fileurl: string): Promise<any> {
    const baseurl = `${fileurl}?token=${token}`;

    try {
      const response = await firstValueFrom(this.httpService.get(baseurl));
      return response.data;
    } catch (error) {
      console.error('Error al obtener el contenido del capítulo:', error);
      throw new Error('No se pudo obtener el contenido del capítulo.');
    }
  }

  async getAssignmentsByCourse(courseId: number, token: string): Promise<any> {
    const apiUrl = this.getMoodleApiUrl();
    const queryParams = `wstoken=${token}&moodlewsrestformat=json&wsfunction=mod_assign_get_assignments&courseids[0]=${courseId}`;

    try {
      const response = await firstValueFrom(this.httpService.get(`${apiUrl}?${queryParams}`));
      return response.data;
    } catch (error) {
      console.error(error);
      throw new HttpException('Error al obtener actividades del curso de Moodle', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getForumsByCourse(courseId: number, token: string): Promise<any> {
    const apiUrl = this.getMoodleApiUrl();
    const queryParams = `wstoken=${token}&moodlewsrestformat=json&wsfunction=mod_forum_get_forums_by_courses&courseids[0]=${courseId}`;

    try {
      const response = await firstValueFrom(this.httpService.get(`${apiUrl}?${queryParams}`));
      return response.data;
    } catch (error) {
      console.error(error);
      throw new HttpException('Error al obtener actividades del curso de Moodle', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getLessonPages(lessonId: number, token: string): Promise<any[]> {
    const apiUrl = this.getMoodleApiUrl();
    const queryParams = `wstoken=${token}&moodlewsrestformat=json&wsfunction=mod_lesson_get_pages&lessonid=${lessonId}`;
  
    try {
      const response = await firstValueFrom(this.httpService.get(`${apiUrl}?${queryParams}`));
      return response.data.pages || [];
    } catch (error) {
      console.error('Error al obtener las páginas de la lección desde Moodle:', error);
      throw new HttpException('Error al obtener las páginas de la lección desde Moodle', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getLessonPageContent(lessonId: number, pageId: number, token: string): Promise<any> {
    const apiUrl = this.getMoodleApiUrl();
    const queryParams = `wstoken=${token}&moodlewsrestformat=json&wsfunction=mod_lesson_get_page_data&lessonid=${lessonId}&pageid=${pageId}`;
  
    try {
      const response = await firstValueFrom(this.httpService.get(`${apiUrl}?${queryParams}`));
      return response.data.page;
    } catch (error) {
      console.error('Error al obtener las páginas de la lección desde Moodle:', error);
      throw new HttpException('Error al obtener las páginas de la lección desde Moodle', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getQuizzesByCourse(courseId: number, token: string): Promise<any> {
    const apiUrl = this.getMoodleApiUrl();
    const queryParams = `wstoken=${token}&moodlewsrestformat=json&wsfunction=mod_quiz_get_quizzes_by_courses&courseids[0]=${courseId}`;
    
    try {
      const response = await firstValueFrom(this.httpService.get(`${apiUrl}?${queryParams}`));
      return response.data;
    } catch (error) {
      console.error(error);
      throw new HttpException('Error al obtener actividades del curso de Moodle', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async enrolUsers(courseId: number, token: string, userId?: number) {
    const apiUrl = this.getMoodleApiUrl();
    const userToEnroll = userId ?? 50;
    const queryParams = `wstoken=${token}&moodlewsrestformat=json&wsfunction=enrol_manual_enrol_users&enrolments[0][roleid]=1&enrolments[0][userid]=${userToEnroll}&enrolments[0][courseid]=${courseId}`;
    
    try {
      await firstValueFrom(this.httpService.get(`${apiUrl}?${queryParams}`));
      //return response.data;
    } catch (error) {
      console.error(error);
      throw new HttpException('Error al registrar el usuario en el curso', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async unenrolUsers(courseId: number, token: string, userId?: number) {
    const apiUrl = this.getMoodleApiUrl();
    const userToEnroll = userId ?? 50;
    const queryParams = `wstoken=${token}&moodlewsrestformat=json&wsfunction=enrol_manual_unenrol_users&enrolments[0][roleid]=1&enrolments[0][userid]=${userToEnroll}&enrolments[0][courseid]=${courseId}`;
    
    try {
      await firstValueFrom(this.httpService.get(`${apiUrl}?${queryParams}`));
      //return response.data;
    } catch (error) {
      console.error(error);
      throw new HttpException('Error al registrar el usuario en el curso', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getCourses(url: string, token: string) {
    const wsfunction = 'core_course_get_courses';
    const queryParams = `wstoken=${token}&moodlewsrestformat=json&wsfunction=${wsfunction}`;
    const endpoint = `${url}?${queryParams}`;

    try {
      const response = await firstValueFrom(this.httpService.get(endpoint));
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Error al obtener los cursos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getCourseContents2(url: string, token: string, courseid: number) {
    const wsfunction = 'core_course_get_contents';
    const queryParams = `wstoken=${token}&moodlewsrestformat=json&wsfunction=${wsfunction}&courseid=${courseid}`;
    const endpoint = `${url}?${queryParams}`;

    try {
      const response = await firstValueFrom(this.httpService.get(endpoint));
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Error al obtener los contenidos del curso',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getForumsByCourse2(url: string, token: string, courseId: number): Promise<any> {
    const wsfunction = 'mod_forum_get_forums_by_courses';
    const queryParams = `wstoken=${token}&wsfunction=${wsfunction}&moodlewsrestformat=json&courseids[0]=${courseId}`;
    const endpoint = `${url}?${queryParams}`;

    try {
      const response = await firstValueFrom(this.httpService.get(endpoint));
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Error al obtener foros del curso con ID ${courseId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
