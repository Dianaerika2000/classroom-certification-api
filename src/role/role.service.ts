import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';


@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>
  ){}
  
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const rol = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(rol);
  }

  async findAll(): Promise<any> {
    return await this.roleRepository.find();
  }

  async findOne(id: number) {
    const role = await this.roleRepository.findOneBy({ id });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }
  
  async findByName(name: string): Promise<Role | undefined> {
    return await this.roleRepository.findOne({ where: { name } });
  }

  async remove(id: number): Promise<any> {
    const role = await this.findOne(id);  

    return await this.roleRepository.remove(role);
  }
}
