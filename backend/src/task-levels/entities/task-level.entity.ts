import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

@Entity('task_levels')
export class TaskLevel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  timeMultiplier: number;

  @OneToMany(() => Task, task => task.taskLevel)
  tasks: Task[];
}
