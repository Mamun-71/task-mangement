import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

@Entity('task_levels')
export class TaskLevel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @OneToMany(() => Task, task => task.taskLevel)
  tasks: Task[];
}
