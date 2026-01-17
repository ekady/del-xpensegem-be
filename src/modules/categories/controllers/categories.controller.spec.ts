import { Test, TestingModule } from '@nestjs/testing';

import { CategoriesController } from './categories.controller';
import { CategoriesService } from '../services/categories.service';
import { IJwtPayload } from '@/shared/interfaces/jwt-payload.interface';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const mockJwtPayload: IJwtPayload = {
    id: 'user-1',
    email: 'test@example.com',
    iat: 123,
    exp: 456,
  };

  describe('create', () => {
    it('should create a category', async () => {
      const createDto = {
        name: 'Food',
        description: 'Food expenses',
        icon: 'food-icon',
      };
      const mockResult = { id: 'cat-1' };

      mockCategoriesService.create.mockResolvedValue(mockResult);

      const result = await controller.create(mockJwtPayload, createDto);

      expect(service.create).toHaveBeenCalledWith(mockJwtPayload.id, createDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAll', () => {
    it('should return paginated categories', async () => {
      const mockResult = {
        data: [{ id: 'cat-1', name: 'Food' }],
        pagination: { limit: 10, page: 1, total: 1, totalPages: 1 },
      };

      mockCategoriesService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(mockJwtPayload, {
        limit: 10,
        page: 1,
      });

      expect(service.findAll).toHaveBeenCalledWith(mockJwtPayload.id, {
        limit: 10,
        page: 1,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('findOne', () => {
    it('should return a single category', async () => {
      const id = 'cat-1';
      const mockCategory = { id, name: 'Food', description: 'Food expenses' };

      mockCategoriesService.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne(mockJwtPayload, id);

      expect(service.findOne).toHaveBeenCalledWith(mockJwtPayload.id, id);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const id = 'cat-1';
      const updateDto = { name: 'Updated Food' };
      const mockResult = { id };

      mockCategoriesService.update.mockResolvedValue(mockResult);

      const result = await controller.update(mockJwtPayload, id, updateDto);

      expect(service.update).toHaveBeenCalledWith(
        mockJwtPayload.id,
        id,
        updateDto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const id = 'cat-1';
      const mockResult = { id };

      mockCategoriesService.remove.mockResolvedValue(mockResult);

      const result = await controller.remove(mockJwtPayload, id);

      expect(service.remove).toHaveBeenCalledWith(mockJwtPayload.id, id);
      expect(result).toEqual(mockResult);
    });
  });
});
