import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  AfterLoad,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TaskLevel } from '../../task-levels/entities/task-level.entity';

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('text')
  description: string;

  @Column({ name: 'task_level_id', nullable: true })
  taskLevelId: number;

  @ManyToOne(() => TaskLevel, (taskLevel) => taskLevel.tasks, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'task_level_id' })
  taskLevel: TaskLevel;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'elapsed_minutes', type: 'int', nullable: true })
  elapsedMinutes: number;

  @Column({ name: 'adjusted_minutes', type: 'int', nullable: true })
  adjustedMinutes: number;

  // 🔧 Helper function
  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // 🔥 Auto calculate after load
  @AfterLoad()
  calculateElapsedTime() {
    if (this.startTime && this.endTime) {
      const startMinutes = this.parseTime(this.startTime);
      const endMinutes = this.parseTime(this.endTime);

      this.elapsedMinutes = Math.max(0, endMinutes - startMinutes);

      const multiplier = this.taskLevel?.timeMultiplier || 1;
      this.adjustedMinutes = Math.round(
          this.elapsedMinutes * multiplier,
      );
    }
  }

  // ✅ Formatted getters
  get formattedElapsedTime(): string {
    if (!this.elapsedMinutes) return '00:00';

    const hours = Math.floor(this.elapsedMinutes / 60);
    const minutes = this.elapsedMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`;
  }

  get formattedAdjustedTime(): string {
    if (!this.adjustedMinutes) return '00:00';

    const hours = Math.floor(this.adjustedMinutes / 60);
    const minutes = this.adjustedMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`;
  }
}