import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '@bturbovets/auth';
import { Permission } from '@bturbovets/data';
import { ReqUser } from '../auth/decorators/req-user.decorator';
import { User } from '../entities/user.entity';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private audit: AuditService) {}

  @Get()
  @RequirePermission(Permission.AuditLogRead)
  getLogs(@ReqUser() user: User, @Query('limit') limit?: string) {
    return this.audit.getLogs(user.organizationId, limit ? parseInt(limit, 10) : 100);
  }
}
