import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { ApiResProperty } from '@/shared/decorators/api-res-property.decorator';
import { StatusMessageDto } from '@/shared/dto';
import { IJwtPayload } from '@/shared/interfaces/jwt-payload.interface';

import { JwtPayloadReq, SkipAuth } from '../decorators';
import {
  ContinueProviderRequestDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SignInRequestDto,
  SignUpRequestDto,
  TokensDto,
  UserDataDto,
  ValidateOtpDto,
  ValidateOtpResponseDto,
} from '../dto';
import { AuthJwtRefreshGuard } from '../guard';
import { AuthService } from '../services/auth.service';
import { OtpService } from '../services/otp.service';
import { EStatusMessage } from '@/shared/enums/status-message.enum';

@Controller('authentication')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly otpService: OtpService,
    private readonly authService: AuthService,
  ) {}

  @Post('sign-in')
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @ApiResProperty(TokensDto, 200, { isDisableAuth: true })
  @SkipAuth()
  @HttpCode(200)
  signIn(@Body() body: SignInRequestDto): Promise<TokensDto> {
    return this.authService.signIn(body);
  }

  @Post('with-provider')
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @ApiResProperty(TokensDto, 200, { isDisableAuth: true })
  @SkipAuth()
  @HttpCode(200)
  continueWithProvider(
    @Body() providerDto: ContinueProviderRequestDto,
  ): Promise<TokensDto> {
    return this.authService.continueWithProvider(providerDto);
  }

  @Post('sign-up')
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @ApiResProperty(UserDataDto, 201, { isDisableAuth: true })
  @SkipAuth()
  async signUp(@Body() signUpDto: SignUpRequestDto): Promise<UserDataDto> {
    return this.authService.signUp(signUpDto);
  }

  @Post('sign-out')
  @ApiResProperty(StatusMessageDto, 200)
  @HttpCode(200)
  signOut(@JwtPayloadReq() jwtPayload: IJwtPayload): Promise<StatusMessageDto> {
    return this.authService.signOut(jwtPayload.id);
  }

  @Post('refresh')
  @ApiResProperty(TokensDto, 200)
  @SkipAuth()
  @UseGuards(AuthJwtRefreshGuard)
  @HttpCode(200)
  refresh(
    @JwtPayloadReq() jwtPayload: IJwtPayload & Pick<TokensDto, 'refreshToken'>,
  ): Promise<TokensDto> {
    const { id, refreshToken } = jwtPayload;
    return this.authService.refreshToken(id, refreshToken);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @ApiResProperty(StatusMessageDto, 200, { isDisableAuth: true })
  @SkipAuth()
  @HttpCode(200)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<StatusMessageDto> {
    await this.otpService.generateOtp(forgotPasswordDto.email);
    return { message: 'An OTP has been sent to your email.' };
  }

  @Post('validate-otp')
  @ApiResProperty(ValidateOtpResponseDto, 200, { isDisableAuth: true })
  @SkipAuth()
  @HttpCode(200)
  async validateOtp(@Body() validateOtpDto: ValidateOtpDto): Promise<ValidateOtpResponseDto | StatusMessageDto> {
    const resetToken = await this.otpService.validateOtpAndCreateSession(validateOtpDto.email, validateOtpDto.otp);
    if (!resetToken) {
      return { message: EStatusMessage.Failed };
    }
    return { resetToken };
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @ApiResProperty(StatusMessageDto, 200, { isDisableAuth: true })
  @SkipAuth()
  @HttpCode(200)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<StatusMessageDto> {
    const isValid = await this.otpService.validateResetSessionToken(resetPasswordDto.email, resetPasswordDto.resetToken);
    if (!isValid) {
      return { message: EStatusMessage.Failed };
    }
    await this.authService.resetPasswordWithOtp(resetPasswordDto.email, resetPasswordDto.newPassword);
    return { message: EStatusMessage.Success };
  }

  @Get('verify-reset-token')
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @ApiResProperty(StatusMessageDto, 200, { isDisableAuth: true })
  @SkipAuth()
  @HttpCode(200)
  verifyResetPasswordToken(
    @Query('token') token: string,
  ): Promise<StatusMessageDto> {
    return this.authService.verifyTokenResetPassword(token);
  }
}
