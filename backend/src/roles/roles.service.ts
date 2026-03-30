import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(name: string, permissionIds: number[]) {
    const permissions = await this.permissionsRepository.findBy({ id: In(permissionIds) });
    const role = this.rolesRepository.create({ name, permissions });
    return this.rolesRepository.save(role);
  }

  findAll() {
    return this.rolesRepository.find({ relations: ['permissions'] });
  }

  async findOne(id: number) {
    const role = await this.rolesRepository.findOne({ where: { id }, relations: ['permissions'] });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  remove(id: number) {
    return this.rolesRepository.delete(id);
  }
}
