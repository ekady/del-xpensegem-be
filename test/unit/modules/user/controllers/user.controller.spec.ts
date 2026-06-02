import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UserController } from '@/modules/user/controllers/user.controller';
import { UserService } from '@/modules/user/services/user.service';
import { IJwtPayload } from '@/shared/interfaces/jwt-payload.interface';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    findMe: jest.fn(),
    updateMe: jest.fn(),
    updatePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
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

  describe('getMe', () => {
    it('should return current user profile', async () => {
      const mockUser = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
      };

      mockUserService.findMe.mockResolvedValue(mockUser);

      const result = await controller.getMe(mockJwtPayload);

      expect(service.findMe).toHaveBeenCalledWith(mockJwtPayload.id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateMe', () => {
    it('should update profile via service', async () => {
      const updateDto = { firstName: 'Jane', lastName: 'Smith' };
      const mockUser = { id: 'user-1', ...updateDto };

      mockUserService.updateMe.mockResolvedValue(mockUser);

      const result = await controller.updateMe(
        mockJwtPayload,
        updateDto,
        undefined,
      );

      expect(service.updateMe).toHaveBeenCalledWith(
        mockJwtPayload.id,
        updateDto,
        undefined,
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException when no fields provided', () => {
      expect(() =>
        controller.updateMe(mockJwtPayload, {}, undefined),
      ).toThrow(BadRequestException);
    });
  });

  describe('updatePassword', () => {
    it('should update password via service', async () => {
      const updatePasswordDto = {
        currentPassword: 'oldPassword',
        password: 'newPassword1',
        passwordConfirm: 'newPassword1',
      };
      const mockResult = { message: 'Success' };

      mockUserService.updatePassword.mockResolvedValue(mockResult);

      const result = await controller.updatePassword(
        mockJwtPayload,
        updatePasswordDto,
      );

      expect(service.updatePassword).toHaveBeenCalledWith(
        mockJwtPayload.id,
        updatePasswordDto,
      );
      expect(result).toEqual(mockResult);
    });
  });
});
