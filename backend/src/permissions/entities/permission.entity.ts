import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // e.g., 'CREATE_TASK', 'UPDATE_TASK'

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];
}
