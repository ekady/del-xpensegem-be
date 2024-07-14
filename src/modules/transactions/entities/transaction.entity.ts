import { Column, Entity, ManyToOne } from 'typeorm';

import { AbstractEntity } from '@/common/database/abstracts/entity.abstract';
import { AccountEntity } from '@/modules/account/entities/account.entity';
import { CategoryEntity } from '@/modules/categories/entities/category.entity';
import { UserEntity } from '@/modules/user/entities/user.entity';

@Entity('transactions')
export class TransactionEntity extends AbstractEntity {
  @Column({ type: 'integer', nullable: false })
  amount: number;

  @Column({ type: 'varchar', nullable: false })
  payee: string;

  @Column({ type: 'varchar', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', nullable: false })
  date: Date;

  @ManyToOne(() => AccountEntity, { onDelete: 'CASCADE' })
  account: AccountEntity;

  @ManyToOne(() => CategoryEntity, { onDelete: 'SET NULL' })
  category: CategoryEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;
}
