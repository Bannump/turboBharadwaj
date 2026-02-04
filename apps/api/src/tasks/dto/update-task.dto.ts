import { IsString, IsOptional, IsIn, IsInt, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus } from '@bturbovets/data';

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

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

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  orderIndex?: number;
}
