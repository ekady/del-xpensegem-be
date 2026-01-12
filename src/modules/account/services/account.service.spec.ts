import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AccountService } from './account.service';
import { AccountEntity } from '../entities/account.entity';
import { DocumentNotFoundException } from '@/shared/http-exceptions/exceptions/document-not-found.exception';

describe('AccountService', () => {
  let service: AccountService;

  const mockAccountEntity = {
    id: 'acc-1',
    name: 'Cash',
    description: 'Cash account',
    icon: 'cash-icon',
    user: { id: 'user-1' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    insert: jest.fn(),
    findAndCount: jest.fn(),
    findOneByOrFail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: getRepositoryToken(AccountEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create an account', async () => {
      const createDto = {
        name: 'Cash',
        description: 'Cash account',
        icon: 'cash-icon',
      };
      const userId = 'user-1';
      const mockInsertResult = { raw: { id: 'acc-1' } };

      mockRepository.insert.mockResolvedValue(mockInsertResult);

      const result = await service.create(userId, createDto);

      expect(mockRepository.insert).toHaveBeenCalledWith({
        ...createDto,
        user: { id: userId },
      });
      expect(result).toEqual(mockInsertResult.raw);
    });
  });

  describe('findAll', () => {
    it('should return paginated accounts', async () => {
      const userId = 'user-1';
      const mockAccounts = [mockAccountEntity];
      const mockCount = 1;

      mockRepository.findAndCount.mockResolvedValue([mockAccounts, mockCount]);

      const result = await service.findAll(userId, { page: 1, limit: 10 });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        take: 10,
        order: {},
        skip: 0,
      });
      expect(result.data).toEqual(mockAccounts);
      expect(result.pagination.total).toBe(mockCount);
      expect(result.pagination.page).toBe(1);
    });

    it('should search accounts by name', async () => {
      const userId = 'user-1';
      const search = 'Cash';

      mockRepository.findAndCount.mockResolvedValue([[mockAccountEntity], 1]);

      await service.findAll(userId, { limit: 10, page: 1, search });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user: { id: userId },
          }),
        }),
      );
    });

    it('should handle pagination correctly', async () => {
      const userId = 'user-1';
      const limit = 5;
      const page = 3;

      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(userId, { limit, page });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: limit,
          skip: (page - 1) * limit,
        }),
      );
    });

    it('should return all accounts when disablePagination is true', async () => {
      const userId = 'user-1';
      const mockAccounts = [
        mockAccountEntity,
        { ...mockAccountEntity, id: 'acc-2' },
      ];

      mockRepository.findAndCount.mockResolvedValue([mockAccounts, 2]);

      const result = await service.findAll(userId, {
        page: 1,
        limit: 10,
        disablePagination: 'true',
      });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: undefined,
          skip: 0,
        }),
      );
      expect(result.pagination.limit).toBe(2);
    });

    it('should sort accounts', async () => {
      const userId = 'user-1';

      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(userId, { limit: 10, page: 1, sort: 'name|ASC' });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { name: 'ASC' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return an account if found', async () => {
      const userId = 'user-1';
      const id = 'acc-1';

      mockRepository.findOneByOrFail.mockResolvedValue(mockAccountEntity);

      const result = await service.findOne({ userId, id });

      expect(mockRepository.findOneByOrFail).toHaveBeenCalledWith({
        id,
        user: { id: userId },
      });
      expect(result).toEqual(mockAccountEntity);
    });

    it('should throw DocumentNotFoundException if not found', async () => {
      const userId = 'user-1';
      const id = 'non-existent';

      mockRepository.findOneByOrFail.mockRejectedValue(new Error());

      await expect(service.findOne({ userId, id })).rejects.toThrow(
        DocumentNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an account successfully', async () => {
      const userId = 'user-1';
      const id = 'acc-1';
      const updateDto = { name: 'Updated Cash' };
      const mockUpdateResult = { affected: 1 };

      mockRepository.update.mockResolvedValue(mockUpdateResult);

      const result = await service.update(userId, id, updateDto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id, user: { id: userId } },
        updateDto,
      );
      expect(result).toEqual({ id });
    });

    it('should throw DocumentNotFoundException if no rows affected', async () => {
      const userId = 'user-1';
      const id = 'non-existent';
      const updateDto = { name: 'Updated' };
      const mockUpdateResult = { affected: 0 };

      mockRepository.update.mockResolvedValue(mockUpdateResult);

      await expect(service.update(userId, id, updateDto)).rejects.toThrow(
        DocumentNotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an account successfully', async () => {
      const userId = 'user-1';
      const id = 'acc-1';
      const mockDeleteResult = { affected: 1 };

      mockRepository.delete.mockResolvedValue(mockDeleteResult);

      const result = await service.remove({ userId, id });

      expect(mockRepository.delete).toHaveBeenCalledWith({
        id,
        user: { id: userId },
      });
      expect(result).toEqual({ id });
    });

    it('should throw DocumentNotFoundException if no rows affected', async () => {
      const userId = 'user-1';
      const id = 'non-existent';
      const mockDeleteResult = { affected: 0 };

      mockRepository.delete.mockResolvedValue(mockDeleteResult);

      await expect(service.remove({ userId, id })).rejects.toThrow(
        DocumentNotFoundException,
      );
    });
  });
});
