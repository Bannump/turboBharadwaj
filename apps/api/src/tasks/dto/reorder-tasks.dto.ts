import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class ReorderTasksDto {
  @IsArray()
  @ArrayMinSize(0)
  @IsUUID('4', { each: true })
  ids: string[] = [];
}
