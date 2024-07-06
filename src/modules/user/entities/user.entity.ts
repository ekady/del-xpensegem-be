import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '@/common/database/abstracts/entity.abstract';

export const UserTableName = 'users';

@Entity({ name: UserTableName })
export class UserEntity extends AbstractEntity {
  @Column({ type: 'varchar', nullable: false })
  firstName: string;

  @Column({ type: 'varchar', nullable: false })
  lastName: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  picture: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  password: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  passwordConfirm: string;

  @Column({ type: 'timestamptz', nullable: true, select: false })
  passwordChangedAt: Date;

  @Column({ type: 'varchar', nullable: true, select: false })
  hashedRefreshToken: string;

  @Column({ type: 'boolean', default: false, select: false })
  isViaProvider: boolean;

  @Column({ type: 'varchar', nullable: true, select: false })
  passwordResetToken: string;

  @Column({ type: 'timestamptz', nullable: true, select: false })
  passwordResetExpires: Date;
}
