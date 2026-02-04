import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';
import { TaskStatus } from '@bturbovets/data';

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];

export class CreateTaskDto {
  @IsString()
  @MaxLength(500)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsIn(STATUSES)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}
