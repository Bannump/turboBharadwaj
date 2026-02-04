import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { Role } from '@bturbovets/data';

const DEFAULT_PASSWORD = 'password123';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Organization) private orgRepo: Repository<Organization>
  ) {}

  async onModuleInit() {
    const userCount = await this.userRepo.count();
    if (userCount > 0) return;

    const root = this.orgRepo.create({
      name: 'Acme Corp',
      parentId: null,
    });
    await this.orgRepo.save(root);

    const child = this.orgRepo.create({
      name: 'Acme West',
      parentId: root.id,
    });
    await this.orgRepo.save(child);

    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    for (const [org, role, email] of [
      [root, Role.Owner, 'owner@acme.com'],
      [root, Role.Admin, 'admin@acme.com'],
      [root, Role.Viewer, 'viewer@acme.com'],
      [child, Role.Admin, 'admin@acmewest.com'],
    ] as const) {
      const user = this.userRepo.create({
        email,
        passwordHash: hash,
        role,
        organizationId: (org as Organization).id,
      });
      await this.userRepo.save(user);
    }

    console.log('[Seed] Default org and users created. Login with owner@acme.com / password123');
  }
}
