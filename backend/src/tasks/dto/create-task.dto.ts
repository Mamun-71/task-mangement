import { IsNotEmpty, IsString, IsNumber, IsDateString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNumber()
  taskLevelId: number;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty({ example: '10:00:00' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, { message: 'startTime must be valid time format HH:MM:SS' })
  startTime: string;

  @ApiProperty({ example: '12:00:00' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, { message: 'endTime must be valid time format HH:MM:SS' })
  endTime: string;
}
