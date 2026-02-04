import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Role } from '@bturbovets/data';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(Organization) private orgRepo: Repository<Organization>,
    private audit: AuditService
  ) {}

  private async getOrganizationIdsForUser(user: User): Promise<string[]> {
    const org = await this.orgRepo.findOne({ where: { id: user.organizationId } });
    if (!org) return [user.organizationId];
    const ids = [user.organizationId];
    if (org.parentId) ids.push(org.parentId);
    const children = await this.orgRepo.find({ where: { parentId: user.organizationId } });
    children.forEach((c) => ids.push(c.id));
    return ids;
  }

  async create(dto: CreateTaskDto, user: User) {
    const orgIds = await this.getOrganizationIdsForUser(user);
    if (!orgIds.includes(user.organizationId))
      throw new ForbiddenException('Cannot create task outside your organization');

    const maxOrder = await this.taskRepo
      .createQueryBuilder('t')
      .where('t.organizationId = :orgId', { orgId: user.organizationId })
      .select('MAX(t.orderIndex)', 'max')
      .getRawOne();

    const task = this.taskRepo.create({
      ...dto,
      category: dto.category ?? 'General',
      status: dto.status ?? 'todo',
      orderIndex: (maxOrder?.max ?? 0) + 1,
      organizationId: user.organizationId,
      createdById: user.id,
    });
    const saved = await this.taskRepo.save(task);
    await this.audit.log(user.id, user.email, 'CREATE', 'task', saved.id, JSON.stringify(dto));
    return saved;
  }

  async findAll(user: User, category?: string, status?: string) {
    const orgIds = await this.getOrganizationIdsForUser(user);
    const qb = this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .where('task.organizationId IN (:...orgIds)', { orgIds });

    if (category) qb.andWhere('task.category = :category', { category });
    if (status) qb.andWhere('task.status = :status', { status });

    qb.orderBy('task.orderIndex', 'ASC').addOrderBy('task.createdAt', 'DESC');
    return qb.getMany();
  }

  async findOne(id: string, user: User) {
    const orgIds = await this.getOrganizationIdsForUser(user);
    const task = await this.taskRepo.findOne({
      where: { id, organizationId: In(orgIds) },
      relations: ['createdBy'],
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, user: User) {
    const task = await this.findOne(id, user);
    Object.assign(task, dto);
    const saved = await this.taskRepo.save(task);
    await this.audit.log(user.id, user.email, 'UPDATE', 'task', id, JSON.stringify(dto));
    return saved;
  }

  async remove(id: string, user: User) {
    const task = await this.findOne(id, user);
    await this.taskRepo.remove(task);
    await this.audit.log(user.id, user.email, 'DELETE', 'task', id, null);
    return { deleted: true };
  }

  async reorder(ids: string[], user: User) {
    const orgIds = await this.getOrganizationIdsForUser(user);
    for (let i = 0; i < ids.length; i++) {
      await this.taskRepo.update(
        { id: ids[i], organizationId: In(orgIds) },
        { orderIndex: i }
      );
    }
    await this.audit.log(user.id, user.email, 'REORDER', 'task', null, JSON.stringify(ids));
    return this.findAll(user);
  }
}
