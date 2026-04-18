import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  findAll() {
    return this.usersRepository.find({ relations: ['roles'] });
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, data: { name?: string; email?: string }) {
    const user = await this.findOne(id);
    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    return this.usersRepository.save(user);
  }

  async assignRoles(userId: number, roleIds: number[]) {
    const user = await this.findOne(userId);
    const roles = await this.rolesRepository.findBy({ id: In(roleIds) });
    user.roles = roles;
    return this.usersRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    return this.usersRepository.remove(user);
  }
}
