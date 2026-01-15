import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { IJwtPayload } from '@/shared/interfaces/jwt-payload.interface';
import { TokenInvalidException } from '@/shared/http-exceptions/exceptions/token-invalid.exception';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signIn: jest.fn(),
    continueWithProvider: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    refreshToken: jest.fn(),
    forgotPassword: jest.fn(),
    verifyTokenResetPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should return tokens on valid credentials', async () => {
      const signInDto = { email: 'test@example.com', password: 'password123' };
      const mockTokens = {
        accessToken: 'at',
        refreshToken: 'rt',
        tokenType: 'Bearer',
      };

      mockAuthService.signIn.mockResolvedValue(mockTokens);

      const result = await controller.signIn(signInDto);

      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
      expect(result).toEqual(mockTokens);
    });

    it('should propagate errors from auth service', async () => {
      const signInDto = { email: 'test@example.com', password: 'wrong' };

      mockAuthService.signIn.mockRejectedValue(
        new Error('Invalid credentials'),
      );

      await expect(controller.signIn(signInDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('continueWithProvider', () => {
    it('should return tokens for provider login', async () => {
      const providerDto = { jwtToken: 'google-jwt' };
      const mockTokens = {
        accessToken: 'at',
        refreshToken: 'rt',
        tokenType: 'Bearer',
      };

      mockAuthService.continueWithProvider.mockResolvedValue(mockTokens);

      const result = await controller.continueWithProvider(providerDto);

      expect(authService.continueWithProvider).toHaveBeenCalledWith(
        providerDto,
      );
      expect(result).toEqual(mockTokens);
    });
  });

  describe('signUp', () => {
    it('should return success message on sign up', async () => {
      const signUpDto = {
        email: 'new@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        firstName: 'New',
        lastName: 'User',
      };
      const mockResponse = { message: 'Success' };

      mockAuthService.signUp.mockResolvedValue(mockResponse);

      const result = await controller.signUp(signUpDto);

      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      const jwtPayload: IJwtPayload = {
        id: 'user-1',
        email: 'test@example.com',
        iat: 123,
        exp: 456,
      };
      const mockResponse = { message: 'Success' };

      mockAuthService.signOut.mockResolvedValue(mockResponse);

      const result = await controller.signOut(jwtPayload);

      expect(authService.signOut).toHaveBeenCalledWith(jwtPayload.id);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('refresh', () => {
    it('should return new tokens on refresh', async () => {
      const jwtPayload = {
        id: 'user-1',
        email: 'test@example.com',
        iat: 123,
        exp: 456,
        refreshToken: 'valid-refresh-token',
      };
      const mockTokens = {
        accessToken: 'new-at',
        refreshToken: 'new-rt',
        tokenType: 'Bearer',
      };

      mockAuthService.refreshToken.mockResolvedValue(mockTokens);

      const result = await controller.refresh(jwtPayload);

      expect(authService.refreshToken).toHaveBeenCalledWith(
        jwtPayload.id,
        jwtPayload.refreshToken,
      );
      expect(result).toEqual(mockTokens);
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password email', async () => {
      const forgotDto = { email: 'test@example.com' };
      const mockResponse = { message: 'Success' };

      mockAuthService.forgotPassword.mockResolvedValue(mockResponse);

      const result = await controller.forgotPassword(forgotDto);

      expect(authService.forgotPassword).toHaveBeenCalledWith(forgotDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('verifyResetPasswordToken', () => {
    it('should verify reset token successfully', async () => {
      const token = 'valid-reset-token';
      const mockResponse = { message: 'Success' };

      mockAuthService.verifyTokenResetPassword.mockResolvedValue(mockResponse);

      const result = await controller.verifyResetPasswordToken(token);

      expect(authService.verifyTokenResetPassword).toHaveBeenCalledWith(token);
      expect(result).toEqual(mockResponse);
    });

    it('should throw TokenInvalidException for invalid token', async () => {
      const token = 'invalid-token';

      mockAuthService.verifyTokenResetPassword.mockRejectedValue(
        new TokenInvalidException(),
      );

      await expect(controller.verifyResetPasswordToken(token)).rejects.toThrow(
        TokenInvalidException,
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const token = 'valid-reset-token';
      const resetDto = {
        password: 'newpassword',
        passwordConfirm: 'newpassword',
      };
      const mockResponse = { message: 'Success' };

      mockAuthService.resetPassword.mockResolvedValue(mockResponse);

      const result = await controller.resetPassword(token, resetDto);

      expect(authService.resetPassword).toHaveBeenCalledWith(token, resetDto);
      expect(result).toEqual(mockResponse);
    });

    it('should throw TokenInvalidException for invalid token', async () => {
      const token = 'invalid-token';
      const resetDto = {
        password: 'newpassword',
        passwordConfirm: 'newpassword',
      };

      mockAuthService.resetPassword.mockRejectedValue(
        new TokenInvalidException(),
      );

      await expect(controller.resetPassword(token, resetDto)).rejects.toThrow(
        TokenInvalidException,
      );
    });
  });
});
