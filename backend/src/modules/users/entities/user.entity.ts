import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Task } from '../../tasks/entities/task.entity';

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  mobile: string;

  @Column({ nullable: true, select: false }) // Hide password by default
  password?: string;

  @Column({ name: 'google_id', nullable: true })
  googleId?: string;

  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.LOCAL })
  provider: AuthProvider;

  @Column({ name: 'profile_picture', nullable: true })
  profilePicture?: string;

  // Stored plain; null when the user has logged out.
  @Column({ name: 'refresh_token', type: 'text', nullable: true, select: false })
  refreshToken?: string | null;

  @ManyToMany(() => Role, role => role.users, { eager: true, cascade: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToMany(() => Task, task => task.user)
  tasks: Task[];
}
