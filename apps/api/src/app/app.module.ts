import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TasksModule } from '../tasks/tasks.module';
import { AuditModule } from '../audit/audit.module';
import { SeedModule } from '../seed/seed.module';
import { AppController } from './app.controller';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { Task } from '../entities/task.entity';
import { AuditLog } from '../entities/audit-log.entity';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env['DB_PATH'] || 'data/tasks.db',
      entities: [User, Organization, Task, AuditLog],
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([User, Organization, Task, AuditLog]),
    AuthModule,
    TasksModule,
    AuditModule,
    SeedModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
