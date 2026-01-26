import { Test, TestingModule } from '@nestjs/testing';

import { TransactionSummaryController } from '../controllers/transaction-summary.controller';
import { TransactionSummaryService } from '../services/transaction-summary.service';
import { IJwtPayload } from '@/shared/interfaces/jwt-payload.interface';

describe('TransactionSummaryController', () => {
  let controller: TransactionSummaryController;
  let service: TransactionSummaryService;

  const mockTransactionSummaryService = {
    getSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionSummaryController],
      providers: [
        {
          provide: TransactionSummaryService,
          useValue: mockTransactionSummaryService,
        },
      ],
    }).compile();

    controller = module.get<TransactionSummaryController>(
      TransactionSummaryController,
    );
    service = module.get<TransactionSummaryService>(TransactionSummaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSummary', () => {
    it('should return transaction summary', async () => {
      const jwtPayload: IJwtPayload = {
        id: 'user-1',
        email: 'test@example.com',
        iat: 123,
        exp: 456,
      };
      const queries = {};
      const mockSummary = {
        remainingAmount: 3000,
        remainingChange: 20,
        incomeAmount: 5000,
        incomeChange: 10,
        expensesAmount: 2000,
        expensesChange: -5,
        categories: [{ name: 'Food', value: '1000' }],
        days: [],
      };

      mockTransactionSummaryService.getSummary.mockResolvedValue(mockSummary);

      const result = await controller.getSummary(jwtPayload, queries);

      expect(service.getSummary).toHaveBeenCalledWith(jwtPayload.id, queries);
      expect(result).toEqual(mockSummary);
    });

    it('should pass date range and accountId filters', async () => {
      const jwtPayload: IJwtPayload = {
        id: 'user-1',
        email: 'test@example.com',
        iat: 123,
        exp: 456,
      };
      const queries = {
        from: '2023-01-01',
        to: '2023-01-31',
        accountId: 'acc-1',
      };
      const mockSummary = {
        remainingAmount: 1000,
        remainingChange: 0,
        incomeAmount: 2000,
        incomeChange: 0,
        expensesAmount: 1000,
        expensesChange: 0,
        categories: [],
        days: [],
      };

      mockTransactionSummaryService.getSummary.mockResolvedValue(mockSummary);

      const result = await controller.getSummary(jwtPayload, queries);

      expect(service.getSummary).toHaveBeenCalledWith(jwtPayload.id, queries);
      expect(result).toEqual(mockSummary);
    });
  });
});
