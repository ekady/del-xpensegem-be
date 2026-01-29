import { Test, TestingModule } from '@nestjs/testing';

import { TransactionsController } from './transactions.controller';
import { TransactionsService } from '../services/transactions.service';
import { IJwtPayload } from '@/shared/interfaces/jwt-payload.interface';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: TransactionsService;

  const mockTransactionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      const createDto = {
        amount: 100,
        payee: 'Test',
        notes: 'Test notes',
        date: new Date().toISOString(),
        accountId: 'acc-1',
        categoryId: 'cat-1',
      };
      const userId = 'user-1';
      const jwtPayload: IJwtPayload = {
        id: userId,
        email: 'test@example.com',
        iat: 123,
        exp: 456,
      };
      const mockResult = { id: 'txn-1' };

      mockTransactionsService.create.mockResolvedValue(mockResult);

      const result = await controller.create(jwtPayload, createDto);

      expect(service.create).toHaveBeenCalledWith(userId, createDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAll', () => {
    it('should return paginated transactions', async () => {
      const userId = 'user-1';
      const jwtPayload: IJwtPayload = {
        id: userId,
        email: 'test@example.com',
        iat: 123,
        exp: 456,
      };
      const mockResult = {
        data: [],
        pagination: { limit: 10, page: 1, total: 0, totalPages: 1 },
      };

      mockTransactionsService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(jwtPayload, {
        limit: 10,
        page: 1,
      });

      expect(service.findAll).toHaveBeenCalledWith(userId, {
        limit: 10,
        page: 1,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('findOne', () => {
    it('should return a transaction', async () => {
      const userId = 'user-1';
      const id = 'txn-1';
      const jwtPayload: IJwtPayload = {
        id: userId,
        email: 'test@example.com',
        iat: 123,
        exp: 456,
      };
      const mockTransaction = { id, amount: 100 };

      mockTransactionsService.findOne.mockResolvedValue(mockTransaction);

      const result = await controller.findOne(jwtPayload, id);

      expect(service.findOne).toHaveBeenCalledWith(userId, id);
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('update', () => {
    it('should update a transaction', async () => {
      const userId = 'user-1';
      const id = 'txn-1';
      const updateDto = { amount: 200 };
      const jwtPayload: IJwtPayload = {
        id: userId,
        email: 'test@example.com',
        iat: 123,
        exp: 456,
      };
      const mockResult = { id };

      mockTransactionsService.update.mockResolvedValue(mockResult);

      const result = await controller.update(jwtPayload, id, updateDto);

      expect(service.update).toHaveBeenCalledWith(userId, id, updateDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('remove', () => {
    it('should remove a transaction', async () => {
      const userId = 'user-1';
      const id = 'txn-1';
      const jwtPayload: IJwtPayload = {
        id: userId,
        email: 'test@example.com',
        iat: 123,
        exp: 456,
      };
      const mockResult = { id };

      mockTransactionsService.remove.mockResolvedValue(mockResult);

      const result = await controller.remove(jwtPayload, id);

      expect(service.remove).toHaveBeenCalledWith(userId, id);
      expect(result).toEqual(mockResult);
    });
  });
});
