import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from '@/modules/account/controllers/account.controller';
import { AccountService } from '@/modules/account/services/account.service';
import { IJwtPayload } from '@/shared/interfaces/jwt-payload.interface';

describe('AccountController', () => {
  let controller: AccountController;
  let service: AccountService;

  const mockAccountService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    service = module.get<AccountService>(AccountService);
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
    it('should create an account', async () => {
      const createDto = {
        name: 'Cash',
        description: 'Cash account',
        icon: 'cash-icon',
      };
      const mockResult = { id: 'acc-1' };

      mockAccountService.create.mockResolvedValue(mockResult);

      const result = await controller.create(mockJwtPayload, createDto);

      expect(service.create).toHaveBeenCalledWith(mockJwtPayload.id, createDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAll', () => {
    it('should return paginated accounts', async () => {
      const mockResult = {
        data: [{ id: 'acc-1', name: 'Cash' }],
        pagination: { limit: 10, page: 1, total: 1, totalPages: 1 },
      };

      mockAccountService.findAll.mockResolvedValue(mockResult);

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
    it('should return a single account', async () => {
      const id = 'acc-1';
      const mockAccount = { id, name: 'Cash', description: 'Cash account' };

      mockAccountService.findOne.mockResolvedValue(mockAccount);

      const result = await controller.findOne(mockJwtPayload, id);

      expect(service.findOne).toHaveBeenCalledWith({
        userId: mockJwtPayload.id,
        id,
      });
      expect(result).toEqual(mockAccount);
    });
  });

  describe('update', () => {
    it('should update an account', async () => {
      const id = 'acc-1';
      const updateDto = { name: 'Updated Cash' };
      const mockResult = { id };

      mockAccountService.update.mockResolvedValue(mockResult);

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
    it('should remove an account', async () => {
      const id = 'acc-1';
      const mockResult = { id };

      mockAccountService.remove.mockResolvedValue(mockResult);

      const result = await controller.remove(mockJwtPayload, id);

      expect(service.remove).toHaveBeenCalledWith({
        userId: mockJwtPayload.id,
        id,
      });
      expect(result).toEqual(mockResult);
    });
  });
});
