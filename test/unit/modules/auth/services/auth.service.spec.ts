import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import axios from 'axios';

import { AwsS3Service } from '@/common/aws/services/aws.s3.service';
import { EmailService } from '@/modules/email/services/email.service';
import { UserEntity } from '@/modules/user/entities/user.entity';
import HashHelper from '@/shared/helpers/hash.helper';
import { CredentialInvalidException } from '@/shared/http-exceptions/exceptions/credentials-invalid.exception';
import { EmailUsernameExistException } from '@/shared/http-exceptions/exceptions/email-username-exist.exception';
import { TokenInvalidException } from '@/shared/http-exceptions/exceptions/token-invalid.exception';

import { AuthService } from '@/modules/auth/services/auth.service';
import { TokenService } from '@/modules/auth/services/token.service';
import {
  SignInRequestDto,
  SignUpRequestDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ContinueProviderRequestDto,
} from '@/modules/auth/dto';

jest.mock('axios');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<UserEntity>;
  let tokenService: TokenService;
  let emailService: EmailService;
  let awsS3Service: AwsS3Service;
  let configService: ConfigService;

  const mockUserEntity = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    picture: 'https://example.com/pic.png',
    hashedRefreshToken: 'hashedRefreshToken',
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockTokenService = {
    generateAuthTokens: jest.fn(),
    verifyGoogleIdToken: jest.fn(),
    generateResetPasswordToken: jest.fn(),
    verifyResetPasswordToken: jest.fn(),
  };

  const mockEmailService = {
    sendMail: jest.fn(),
  };

  const mockAwsS3Service = {
    putItemInBucket: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: AwsS3Service,
          useValue: mockAwsS3Service,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    tokenService = module.get<TokenService>(TokenService);
    emailService = module.get<EmailService>(EmailService);
    awsS3Service = module.get<AwsS3Service>(AwsS3Service);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should return tokens on valid credentials', async () => {
      const signInDto: SignInRequestDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockTokens = {
        accessToken: 'at',
        refreshToken: 'rt',
        tokenType: 'Bearer',
      };

      jest.spyOn(HashHelper, 'compare').mockResolvedValue(true);
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUserEntity,
        password: 'hashedPassword',
      });
      mockTokenService.generateAuthTokens.mockResolvedValue(mockTokens);

      const result = await service.signIn(signInDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: signInDto.email },
        select: { password: true, email: true, picture: true, id: true },
      });
      expect(mockTokenService.generateAuthTokens).toHaveBeenCalledWith({
        id: mockUserEntity.id,
        email: mockUserEntity.email,
      });
      expect(result).toEqual(mockTokens);
    });

    it('should throw CredentialInvalidException on wrong password', async () => {
      const signInDto: SignInRequestDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(HashHelper, 'compare').mockResolvedValue(false);
      mockUserRepository.findOne.mockResolvedValue(mockUserEntity);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        CredentialInvalidException,
      );
    });

    it('should throw CredentialInvalidException if user not found', async () => {
      const signInDto: SignInRequestDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        CredentialInvalidException,
      );
    });
  });

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      const signUpDto: SignUpRequestDto = {
        email: 'newuser@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.insert.mockResolvedValue(undefined);
      mockEmailService.sendMail.mockResolvedValue(undefined);
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'GRAVATAR_URL') return 'https://gravatar.com';
        if (key === 'URL_CLIENT') return 'http://localhost:3000';
        return '';
      });

      const result = await service.signUp(signUpDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: signUpDto.email },
      });
      expect(mockUserRepository.insert).toHaveBeenCalled();
      expect(mockEmailService.sendMail).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Success' });
    });

    it('should throw EmailUsernameExistException if user already exists', async () => {
      const signUpDto: SignUpRequestDto = {
        email: 'existing@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUserEntity);

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        EmailUsernameExistException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens on valid refresh token', async () => {
      const userId = 'user-1';
      const refreshToken = 'valid-refresh-token';
      const mockTokens = {
        accessToken: 'new-at',
        refreshToken: 'new-rt',
        tokenType: 'Bearer',
      };

      mockUserRepository.findOne.mockResolvedValue({
        ...mockUserEntity,
        hashedRefreshToken: 'hashed-refresh-token',
      });
      jest.spyOn(HashHelper, 'compare').mockResolvedValue(true);
      mockTokenService.generateAuthTokens.mockResolvedValue(mockTokens);

      const result = await service.refreshToken(userId, refreshToken);

      expect(mockTokenService.generateAuthTokens).toHaveBeenCalledWith({
        id: userId,
        email: mockUserEntity.email,
      });
      expect(result).toEqual(mockTokens);
    });

    it('should throw TokenInvalidException if no hashed token found', async () => {
      const userId = 'user-1';
      const refreshToken = 'valid-refresh-token';

      mockUserRepository.findOne.mockResolvedValue({
        ...mockUserEntity,
        hashedRefreshToken: null,
      });

      await expect(service.refreshToken(userId, refreshToken)).rejects.toThrow(
        TokenInvalidException,
      );
    });

    it('should throw TokenInvalidException if tokens do not match', async () => {
      const userId = 'user-1';
      const refreshToken = 'wrong-refresh-token';

      mockUserRepository.findOne.mockResolvedValue({
        ...mockUserEntity,
        hashedRefreshToken: 'hashed-correct-token',
      });
      jest.spyOn(HashHelper, 'compare').mockResolvedValue(false);

      await expect(service.refreshToken(userId, refreshToken)).rejects.toThrow(
        TokenInvalidException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should process forgot password request', async () => {
      const forgotDto: ForgotPasswordDto = { email: 'test@example.com' };
      const mockResetToken = {
        resetToken: 'token',
        hashedResetToken: 'hashed-token',
        expiresToken: new Date(),
      };

      mockUserRepository.findOneBy.mockResolvedValue(mockUserEntity);
      mockTokenService.generateResetPasswordToken.mockReturnValue(
        mockResetToken,
      );
      mockEmailService.sendMail.mockResolvedValue(undefined);
      mockConfigService.get.mockReturnValue('http://localhost:3000');

      const result = await service.forgotPassword(forgotDto);

      expect(mockTokenService.generateResetPasswordToken).toHaveBeenCalled();
      expect(mockUserRepository.update).toHaveBeenCalled();
      expect(mockEmailService.sendMail).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Success' });
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const token = 'reset-token';
      const resetPasswordDto: ResetPasswordDto = {
        password: 'newpassword',
        passwordConfirm: 'newpassword',
      };
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
      };

      mockTokenService.verifyResetPasswordToken.mockResolvedValue(mockUser);
      mockEmailService.sendMail.mockResolvedValue(undefined);
      mockConfigService.get.mockReturnValue('http://localhost:3000');

      const result = await service.resetPassword(token, resetPasswordDto);

      expect(mockTokenService.verifyResetPasswordToken).toHaveBeenCalledWith(
        token,
      );
      expect(mockUserRepository.update).toHaveBeenCalled();
      expect(mockEmailService.sendMail).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Success' });
    });

    it('should throw TokenInvalidException if token is invalid', async () => {
      const token = 'invalid-token';
      const resetPasswordDto: ResetPasswordDto = {
        password: 'newpassword',
        passwordConfirm: 'newpassword',
      };

      mockTokenService.verifyResetPasswordToken.mockRejectedValue(
        new TokenInvalidException(),
      );

      await expect(
        service.resetPassword(token, resetPasswordDto),
      ).rejects.toThrow(TokenInvalidException);
    });
  });

  describe('signOut', () => {
    it('should successfully sign out user', async () => {
      const userId = 'user-1';

      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.signOut(userId);

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id: userId },
        { hashedRefreshToken: null },
      );
      expect(result).toEqual({ message: 'Success' });
    });

    it('should return success even if update fails', async () => {
      const userId = 'user-1';

      mockUserRepository.update.mockRejectedValue(new Error('DB error'));

      const result = await service.signOut(userId);

      expect(result).toEqual({ message: 'Success' });
    });
  });

  describe('verifyTokenResetPassword', () => {
    it('should return success for valid reset token', async () => {
      const token = 'valid-reset-token';
      const mockUser = { id: 'user-1', email: 'test@example.com' };

      mockTokenService.verifyResetPasswordToken.mockResolvedValue(mockUser);

      const result = await service.verifyTokenResetPassword(token);

      expect(mockTokenService.verifyResetPasswordToken).toHaveBeenCalledWith(
        token,
      );
      expect(result).toEqual({ message: 'Success' });
    });

    it('should throw TokenInvalidException for invalid token', async () => {
      const token = 'invalid-token';

      mockTokenService.verifyResetPasswordToken.mockResolvedValue(null);

      await expect(service.verifyTokenResetPassword(token)).rejects.toThrow(
        TokenInvalidException,
      );
    });
  });

  describe('continueWithProvider', () => {
    it('should sign in existing user via provider', async () => {
      const providerDto: ContinueProviderRequestDto = {
        jwtToken: 'google-jwt',
      };
      const mockUserJwt = {
        email: 'test@example.com',
        given_name: 'Test',
        family_name: 'User',
        picture: 'https://example.com/pic.png',
      };

      mockTokenService.verifyGoogleIdToken.mockResolvedValue(mockUserJwt);
      mockUserRepository.findOne.mockResolvedValue(mockUserEntity);
      mockTokenService.generateAuthTokens.mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt',
        tokenType: 'Bearer',
      });

      const result = await service.continueWithProvider(providerDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUserJwt.email },
      });
      expect(mockTokenService.generateAuthTokens).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'at',
        refreshToken: 'rt',
        tokenType: 'Bearer',
      });
    });

    it('should handle provider login with null picture (gravatar fallback)', async () => {
      const providerDto: ContinueProviderRequestDto = {
        jwtToken: 'google-jwt',
      };
      const mockUserJwt = {
        email: 'newuser@example.com',
        given_name: 'New',
        family_name: 'User',
        picture: null,
      };
      const newUserId = 'new-user-id';

      mockTokenService.verifyGoogleIdToken.mockResolvedValue(mockUserJwt);
      mockUserRepository.findOne.mockResolvedValue({
        id: newUserId,
        email: mockUserJwt.email,
        firstName: mockUserJwt.given_name,
        lastName: mockUserJwt.family_name,
        isViaProvider: true,
      });

      mockTokenService.generateAuthTokens.mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt',
        tokenType: 'Bearer',
      });

      const result = await service.continueWithProvider(providerDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUserJwt.email },
      });
      expect(mockTokenService.generateAuthTokens).toHaveBeenCalledWith({
        id: newUserId,
        email: mockUserJwt.email,
      });
      expect(result).toEqual({
        accessToken: 'at',
        refreshToken: 'rt',
        tokenType: 'Bearer',
      });
    });
  });
});
