import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string;

  @Column()
  resource: string;

  @Column({ nullable: true })
  resourceId: string | null;

  @Column()
  userId: string;

  @Column()
  userEmail: string;

  @Column({ type: 'text', nullable: true })
  details: string | null;

  @CreateDateColumn()
  timestamp: Date;
}
