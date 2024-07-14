import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransactionEntity } from '@/modules/transactions/entities/transaction.entity';

import { TransactionsController } from './controllers/transactions.controller';
import { TransactionsService } from './services/transactions.service';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService],
  imports: [TypeOrmModule.forFeature([TransactionEntity])],
})
export class TransactionsModule {}
