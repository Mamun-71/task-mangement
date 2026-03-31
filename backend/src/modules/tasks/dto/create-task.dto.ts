import { IsNotEmpty, IsString, IsNumber, IsDateString, Matches, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiProperty()
  @IsNumber({}, { message: 'Task level must be a valid number' })
  taskLevelId: number;

  @ApiProperty()
  @IsDateString({}, { message: 'Date must be a valid date' })
  date: string;

  @ApiProperty({ example: '10:00:00' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, { message: 'Start time must be valid time format HH:MM:SS' })
  startTime: string;

  @ApiProperty({ example: '12:00:00' })
  @ValidateIf((o) => o.startTime !== undefined)
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, { message: 'End time must be valid time format HH:MM:SS' })
  endTime: string;
}
