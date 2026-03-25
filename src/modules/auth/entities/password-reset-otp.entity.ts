import { Entity, Column } from 'typeorm';
import { AbstractEntity } from '@/common/database/abstracts/entity.abstract';

@Entity('password_reset_otps')
export class PasswordResetOtpEntity extends AbstractEntity {
  @Column()
  email: string;

  @Column()
  otp: string;

  @Column()
  expires_at: Date;

  @Column({ default: false })
  used: boolean;

  @Column({ default: false })
  is_expired: boolean;
} 