import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleService } from '../role/role.service';
import { User } from './entities/user.entity';
import { MoodleService } from '../moodle/moodle.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly roleService:RoleService,
    private readonly moodleService: MoodleService,
    private readonly configService: ConfigService
  ){}

  async create(createUserDto: CreateUserDto) {
    const { username, roleId, name } = createUserDto;
    const rol = await this.roleService.findOne(roleId);

    const userExists = await this.userRepository.findOneBy({ username });
    if(userExists) throw new BadRequestException(`User with username ${username} already exists`);

    const passwordTemplate = this.configService.get<string>('GENERIC_PASSWORD_TEMPLATE', '.dedte.2024');
    const genericPassword = `${username}${passwordTemplate}`;

    const saltRounds = Number(this.configService.get('BCRYPT_SALT_ROUNDS', 10));
    const hashedPassword = await bcrypt.hash(genericPassword, saltRounds);

    const user = this.userRepository.create({
      name,
      username,
      password: hashedPassword,
      rol
    });
    
    return await this.userRepository.save(user);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOneByUsername(username: String) {
    const user = await this.userRepository.findOneBy({ username });

    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`)
    }

    return user;
  }

  async findOneById(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with username ${id} not found`)
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { roleId, password, ...userData } = updateUserDto;
    const role = await this.roleService.findOne(roleId);

    const user = await this.userRepository.preload({
      id: id,
      ...userData,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.rol = role;

    if (password) {
      const saltRounds = Number(this.configService.get('BCRYPT_SALT_ROUNDS', 10));
      user.password = await bcrypt.hash(password, saltRounds);
    }

    return await this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOneById(id);
  
    return await this.userRepository.remove(user);
  }
  
  async getAllMoodleUsers(token: string): Promise<any> {
    return await this.moodleService.getAllUsers(token);
  }
}
