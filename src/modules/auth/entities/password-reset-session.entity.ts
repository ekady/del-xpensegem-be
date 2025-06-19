import { Entity, Column } from 'typeorm';
import { AbstractEntity } from '@/common/database/abstracts/entity.abstract';

@Entity('password_reset_sessions')
export class PasswordResetSessionEntity extends AbstractEntity {
  @Column()
  email: string;

  @Column()
  token: string;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;
} 