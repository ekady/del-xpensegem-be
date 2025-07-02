import { Column, Entity, ManyToOne } from 'typeorm';

import { AbstractEntity } from '@/common/database/abstracts/entity.abstract';
import { UserEntity } from '@/modules/user/entities/user.entity';

@Entity({ name: 'accounts' })
export class AccountEntity extends AbstractEntity {
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  icon: string;

  @Column({ type: 'varchar', nullable: true })
  color: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: false })
  user: UserEntity;
}
