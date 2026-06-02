import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AwsS3Service } from '@/common/aws/services/aws.s3.service';
import { UserService } from '@/modules/user/services/user.service';
import { UserEntity } from '@/modules/user/entities/user.entity';
import HashHelper from '@/shared/helpers/hash.helper';
import { CredentialInvalidException } from '@/shared/http-exceptions/exceptions/credentials-invalid.exception';
import { DocumentNotFoundException } from '@/shared/http-exceptions/exceptions/document-not-found.exception';

describe('UserService', () => {
  let service: UserService;

  const mockUser = {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    picture: 'private/profile/old.png',
    password: 'hashed-password',
    isViaProvider: false,
  };

  const mockRepository = {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockAwsS3Service = {
    putItemInBucket: jest.fn(),
    deleteItemInBucket: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockRepository,
        },
        {
          provide: AwsS3Service,
          useValue: mockAwsS3Service,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateMe', () => {
    it('should update name fields only', async () => {
      const updateDto = { firstName: 'Jane', lastName: 'Smith' };
      const updatedUser = { ...mockUser, ...updateDto };

      mockRepository.findOneBy
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(updatedUser);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateMe('user-1', updateDto);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: 'user-1' },
        updateDto,
      );
      expect(result).toEqual(updatedUser);
    });

    it('should upload picture and delete old S3 key', async () => {
      const file = {
        buffer: Buffer.from('image'),
        originalname: 'avatar.png',
        mimetype: 'image/png',
        size: 1024,
      } as Express.Multer.File;
      const updatedUser = {
        ...mockUser,
        picture: 'private/profile/new.png',
      };

      mockRepository.findOneBy
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(updatedUser);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockAwsS3Service.putItemInBucket.mockResolvedValue({
        completedPath: 'private/profile/new.png',
      });
      mockAwsS3Service.deleteItemInBucket.mockResolvedValue(undefined);

      const result = await service.updateMe('user-1', {}, file);

      expect(mockAwsS3Service.putItemInBucket).toHaveBeenCalled();
      expect(mockAwsS3Service.deleteItemInBucket).toHaveBeenCalledWith(
        'private/profile/old.png',
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: 'user-1' },
        { picture: 'private/profile/new.png' },
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw DocumentNotFoundException when user not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.updateMe('user-1', { firstName: 'Jane' }),
      ).rejects.toThrow(DocumentNotFoundException);
    });

    it('should throw BadRequestException when no fields to update', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockUser);

      await expect(service.updateMe('user-1', {})).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updatePassword', () => {
    const updatePasswordDto = {
      currentPassword: 'oldPassword',
      password: 'newPassword1',
      passwordConfirm: 'newPassword1',
    };

    it('should update password successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(HashHelper, 'compare').mockResolvedValue(true);
      jest
        .spyOn(HashHelper, 'encrypt')
        .mockResolvedValue('new-hashed-password');
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updatePassword('user-1', updatePasswordDto);

      expect(HashHelper.compare).toHaveBeenCalledWith(
        'oldPassword',
        'hashed-password',
      );
      expect(HashHelper.encrypt).toHaveBeenCalledWith('newPassword1');
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: 'user-1' },
        expect.objectContaining({
          password: 'new-hashed-password',
          passwordConfirm: null,
          hashedRefreshToken: null,
        }),
      );
      expect(result).toEqual({ message: 'Success' });
    });

    it('should throw CredentialInvalidException for wrong current password', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(HashHelper, 'compare').mockResolvedValue(false);

      await expect(
        service.updatePassword('user-1', updatePasswordDto),
      ).rejects.toThrow(CredentialInvalidException);
    });

    it('should throw BadRequestException when passwords do not match', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(HashHelper, 'compare').mockResolvedValue(true);

      await expect(
        service.updatePassword('user-1', {
          ...updatePasswordDto,
          passwordConfirm: 'differentPassword',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for OAuth-only accounts', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockUser,
        isViaProvider: true,
        password: null,
      });

      await expect(
        service.updatePassword('user-1', updatePasswordDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
