import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/entities/user.entity';

@Entity('task_levels')
export class TaskLevel {
  @PrimaryGeneratedColumn()
  id: number;

  // Not globally unique — different users can create a level named 'Sprint'
  @Column()
  title: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  timeMultiplier: number;

  // null = global/system level (visible to all). Set = belongs to that user only.
  @Column({ name: 'user_id', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @OneToMany(() => Task, (task) => task.taskLevel)
  tasks: Task[];
}
