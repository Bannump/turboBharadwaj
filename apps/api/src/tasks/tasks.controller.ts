import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '@bturbovets/auth';
import { Permission } from '@bturbovets/data';
import { User } from '../entities/user.entity';
import { ReqUser } from '../auth/decorators/req-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TasksController {
  constructor(private tasks: TasksService) {}

  @Post()
  @RequirePermission(Permission.TaskCreate)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() dto: CreateTaskDto, @ReqUser() user: User) {
    return this.tasks.create(dto, user);
  }

  @Get()
  @RequirePermission(Permission.TaskRead)
  findAll(
    @ReqUser() user: User,
    @Query('category') category?: string,
    @Query('status') status?: string
  ) {
    return this.tasks.findAll(user, category, status);
  }

  @Post('reorder')
  @RequirePermission(Permission.TaskUpdate)
  reorder(@Body() body: ReorderTasksDto, @ReqUser() user: User) {
    return this.tasks.reorder(body.ids ?? [], user);
  }

  @Get(':id')
  @RequirePermission(Permission.TaskRead)
  findOne(@Param('id') id: string, @ReqUser() user: User) {
    return this.tasks.findOne(id, user);
  }

  @Put(':id')
  @RequirePermission(Permission.TaskUpdate)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @ReqUser() user: User) {
    return this.tasks.update(id, dto, user);
  }

  @Delete(':id')
  @RequirePermission(Permission.TaskDelete)
  remove(@Param('id') id: string, @ReqUser() user: User) {
    return this.tasks.remove(id, user);
  }
}
