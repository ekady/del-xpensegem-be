import { Module } from '@nestjs/common';

import { TransactionsModule } from '@/modules/transactions/transactions.module';

import { TransactionSummaryController } from './controllers/transaction-summary.controller';
import { TransactionSummaryService } from './services/transaction-summary.service';

@Module({
  imports: [TransactionsModule],
  controllers: [TransactionSummaryController],
  providers: [TransactionSummaryService],
})
export class TransactionSummaryModule {}
