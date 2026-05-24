import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TransactionEntity } from '@/modules/transactions/entities/transaction.entity';

import { TransactionSummaryService } from '@/modules/transaction-summary/services/transaction-summary.service';

describe('TransactionSummaryService', () => {
  let service: TransactionSummaryService;
  let repository: Repository<TransactionEntity>;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
  };

  const mockRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionSummaryService,
        {
          provide: getRepositoryToken(TransactionEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionSummaryService>(TransactionSummaryService);
    repository = module.get<Repository<TransactionEntity>>(
      getRepositoryToken(TransactionEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummary', () => {
    it('should return summary data for current month by default', async () => {
      const userId = 'user-1';
      const mockFinancialData = {
        income: 5000,
        expenses: -2000,
        remaining: 3000,
      };
      const mockCategoryData = [
        { name: 'Food', value: '1000' },
        { name: 'Transport', value: '500' },
      ];
      const mockActiveDaysData = [
        { date: '2023-10-01', income: 100, expenses: 50 },
        { date: '2023-10-02', income: 200, expenses: 100 },
      ];

      // Mock fetchFinancialData (current period)
      mockQueryBuilder.getRawOne.mockResolvedValueOnce(mockFinancialData);
      // Mock fetchFinancialData (last period)
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({
        income: 4000,
        expenses: -1500,
        remaining: 2500,
      });
      // Mock category query
      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mockCategoryData);
      // Mock active days query
      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mockActiveDaysData);

      const result = await service.getSummary(userId, {});

      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      // The service uses .where() for user_id, not .andWhere()
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'transaction.user_id = :userId',
        { userId },
      );
      // Check that date conditions were added
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'transaction.date <= :endDate',
        expect.any(Object),
      );
      expect(result).toEqual({
        remainingAmount: 3000,
        remainingChange: expect.any(Number),
        incomeAmount: 5000,
        incomeChange: expect.any(Number),
        expensesAmount: -2000,
        expensesChange: expect.any(Number),
        categories: expect.any(Array),
        days: expect.any(Array),
      });
    });

    it('should filter by account ID if provided', async () => {
      const userId = 'user-1';
      const accountId = 'account-1';
      const mockFinancialData = {
        income: 3000,
        expenses: -1000,
        remaining: 2000,
      };

      mockQueryBuilder.getRawOne.mockResolvedValueOnce(mockFinancialData);
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({
        income: 0,
        expenses: 0,
        remaining: 0,
      });
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([]);
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([]);

      await service.getSummary(userId, { accountId });

      // Check if accountId was used in the query
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'transaction.account_id = :accountId',
        { accountId },
      );
    });

    it('should handle custom date range', async () => {
      const userId = 'user-1';
      const from = '2023-01-01';
      const to = '2023-01-31';
      const mockFinancialData = {
        income: 1000,
        expenses: -500,
        remaining: 500,
      };

      mockQueryBuilder.getRawOne.mockResolvedValueOnce(mockFinancialData);
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({
        income: 0,
        expenses: 0,
        remaining: 0,
      });
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([]);
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([]);

      await service.getSummary(userId, { from, to });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'transaction.date >= :startDate',
        expect.objectContaining({ startDate: expect.any(Date) }),
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'transaction.date <= :endDate',
        expect.objectContaining({ endDate: expect.any(Date) }),
      );
    });
  });
});
