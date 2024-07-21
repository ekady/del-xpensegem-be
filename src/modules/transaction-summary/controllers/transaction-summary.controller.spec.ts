import { Test, TestingModule } from '@nestjs/testing';

import { TransactionSummaryController } from '../controllers/transaction-summary.controller';
import { TransactionSummaryService } from '../services/transaction-summary.service';

describe('TransactionSummaryController', () => {
  let controller: TransactionSummaryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionSummaryController],
      providers: [TransactionSummaryService],
    }).compile();

    controller = module.get<TransactionSummaryController>(
      TransactionSummaryController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
