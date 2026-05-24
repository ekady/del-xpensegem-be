import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CategoriesService } from '@/modules/categories/services/categories.service';
import { CategoryEntity } from '@/modules/categories/entities/category.entity';
import { DocumentNotFoundException } from '@/shared/http-exceptions/exceptions/document-not-found.exception';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategoryEntity = {
    id: 'cat-1',
    name: 'Food',
    description: 'Food expenses',
    icon: 'food-icon',
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
        CategoriesService,
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a category', async () => {
      const createDto = {
        name: 'Food',
        description: 'Food expenses',
        icon: 'food-icon',
      };
      const userId = 'user-1';
      const mockInsertResult = { raw: { id: 'cat-1' } };

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
    it('should return paginated categories', async () => {
      const userId = 'user-1';
      const mockCategories = [mockCategoryEntity];
      const mockCount = 1;

      mockRepository.findAndCount.mockResolvedValue([
        mockCategories,
        mockCount,
      ]);

      const result = await service.findAll(userId, { page: 1, limit: 10 });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        take: 10,
        order: {},
        skip: 0,
      });
      expect(result.data).toEqual(mockCategories);
      expect(result.pagination.total).toBe(mockCount);
    });

    it('should search categories by name', async () => {
      const userId = 'user-1';
      const search = 'Food';

      mockRepository.findAndCount.mockResolvedValue([[mockCategoryEntity], 1]);

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
      const page = 2;

      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(userId, { limit, page });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: limit,
          skip: (page - 1) * limit,
        }),
      );
    });

    it('should return all categories when disablePagination is true', async () => {
      const userId = 'user-1';
      const mockCategories = [
        mockCategoryEntity,
        { ...mockCategoryEntity, id: 'cat-2' },
      ];

      mockRepository.findAndCount.mockResolvedValue([mockCategories, 2]);

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

    it('should sort categories', async () => {
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
    it('should return a category if found', async () => {
      const userId = 'user-1';
      const id = 'cat-1';

      mockRepository.findOneByOrFail.mockResolvedValue(mockCategoryEntity);

      const result = await service.findOne(userId, id);

      expect(mockRepository.findOneByOrFail).toHaveBeenCalledWith({
        id,
        user: { id: userId },
      });
      expect(result).toEqual(mockCategoryEntity);
    });

    it('should throw DocumentNotFoundException if not found', async () => {
      const userId = 'user-1';
      const id = 'non-existent';

      mockRepository.findOneByOrFail.mockRejectedValue(new Error());

      await expect(service.findOne(userId, id)).rejects.toThrow(
        DocumentNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a category successfully', async () => {
      const userId = 'user-1';
      const id = 'cat-1';
      const updateDto = { name: 'Updated Food' };
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
    it('should remove a category successfully', async () => {
      const userId = 'user-1';
      const id = 'cat-1';
      const mockDeleteResult = { affected: 1 };

      mockRepository.delete.mockResolvedValue(mockDeleteResult);

      const result = await service.remove(userId, id);

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

      await expect(service.remove(userId, id)).rejects.toThrow(
        DocumentNotFoundException,
      );
    });
  });
});
