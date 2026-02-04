import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuditService {
  private logDir = process.env['AUDIT_LOG_DIR'] || path.join(process.cwd(), 'logs');

  constructor(
    @InjectRepository(AuditLog) private repo: Repository<AuditLog>
  ) {
    try {
      if (!fs.existsSync(this.logDir)) fs.mkdirSync(this.logDir, { recursive: true });
    } catch {
      // ignore
    }
  }

  async log(
    userId: string,
    userEmail: string,
    action: string,
    resource: string,
    resourceId: string | null,
    details: string | null
  ) {
    const entry = this.repo.create({
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      details,
    });
    const saved = await this.repo.save(entry);
    const line = `${new Date().toISOString()} | ${action} | ${resource} | ${resourceId ?? '-'} | ${userEmail} | ${details ?? ''}\n`;
    console.log(`[AUDIT] ${line.trim()}`);
    const filePath = path.join(this.logDir, `audit-${new Date().toISOString().slice(0, 10)}.log`);
    try {
      fs.appendFileSync(filePath, line);
    } catch {
      // ignore file write errors
    }
    return saved;
  }

  async getLogs(organizationId: string, limit = 100) {
    return this.repo.find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}
