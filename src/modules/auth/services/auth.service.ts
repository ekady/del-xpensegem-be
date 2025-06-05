import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios, { AxiosResponse } from 'axios';
import { Repository } from 'typeorm';

import { AwsS3Service } from '@/common/aws/services/aws.s3.service';
import { EmailService } from '@/modules/email/services/email.service';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { StatusMessageDto } from '@/shared/dto';
import HashHelper from '@/shared/helpers/hash.helper';
import { CredentialInvalidException } from '@/shared/http-exceptions/exceptions/credentials-invalid.exception';
import { EmailUsernameExistException } from '@/shared/http-exceptions/exceptions/email-username-exist.exception';
import { TokenInvalidException } from '@/shared/http-exceptions/exceptions/token-invalid.exception';

import { TokenService } from './token.service';
import {
  ContinueProviderRequestDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SignInRequestDto,
  SignUpRequestDto,
  TokensDto,
  UserDataDto,
} from '../dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    // private userDeviceService: UserDeviceService,
    private tokenService: TokenService,
    private emailService: EmailService,
    private awsS3Service: AwsS3Service,
    private config: ConfigService,
  ) {}

  async signIn(signInDto: SignInRequestDto): Promise<TokensDto> {
    const user = await this.userRepository.findOne({
      where: { email: signInDto.email },
      select: { password: true, email: true, picture: true, id: true },
    });

    const userHashedPassword = user ? user.password : '';
    const isPasswordCorrect = await HashHelper.compare(
      signInDto.password,
      userHashedPassword,
    );

    if (!user || !isPasswordCorrect) throw new CredentialInvalidException();

    const tokens = await this.tokenService.generateAuthTokens({
      id: user?.id ?? '',
      email: user.email,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
      },
    };
  }

  async continueWithProvider(
    providerRequestDto: ContinueProviderRequestDto,
  ): Promise<TokensDto> {
    const userJwt = await this.tokenService.verifyGoogleIdToken(
      providerRequestDto.jwtToken,
    );

    if (!userJwt?.email || !userJwt.given_name)
      throw new TokenInvalidException();

    const user = await this.userRepository.findOne({
      where: { email: userJwt.email },
    });

    if (!user) {
      const imageUrl =
        userJwt.picture ??
        `${this.config.get('GRAVATAR_URL')}/${HashHelper.hashCrypto(
          userJwt.email,
        )}?s=300&d=identicon`;
      const blob: AxiosResponse<Buffer> = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });
      const picture = await this.awsS3Service.putItemInBucket(
        blob.data,
        {
          extension: 'png',
          filename: 'picture.png',
          mimetype: 'image/png',
        },
        { path: '/private/profile' },
      );
      await this.userRepository.insert({
        email: userJwt.email,
        firstName: userJwt.given_name,
        lastName: userJwt.family_name,
        isViaProvider: true,
        picture: picture.completedPath,
      });
      await this.emailService.sendMail({
        to: userJwt.email,
        subject: 'Welcome to Tracka Application',
        templateName: 'welcome',
        name: userJwt.given_name,
        url: this.config.get('URL_CLIENT'),
      });
    }

    const tokens = await this.tokenService.generateAuthTokens({
      id: user.id,
      email: user.email,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
      },
    };
  }

  async signUp(signUpDto: SignUpRequestDto): Promise<UserDataDto> {
    const userExists = await this.userRepository.findOne({
      where: { email: signUpDto.email },
    });
    if (userExists) throw new EmailUsernameExistException();

    const user: UserDataDto = {
      firstName: signUpDto.firstName,
      lastName: signUpDto.lastName,
      email: signUpDto.email,
      picture: `${this.config.get('GRAVATAR_URL')}/${HashHelper.hashCrypto(
        signUpDto.email,
      )}?s=300&d=identicon`,
    };

    const userCreated = await this.userRepository.insert({
      ...signUpDto,
      ...user,
    });
    await this.emailService.sendMail({
      to: signUpDto.email,
      subject: 'Welcome to Tracka Application',
      templateName: 'welcome',
      name: signUpDto.firstName,
      url: this.config.get('URL_CLIENT'),
    });

    return {
      id: userCreated?.identifiers[0]?.id,
      ...user,
    };
  }

  async signOut(userId: string): Promise<StatusMessageDto> {
    try {
      await this.userRepository.update(
        { id: userId },
        { hashedRefreshToken: null },
      );
    } catch {
      //
    }
    return { message: 'Success' };
  }

  async refreshToken(userId: string, refreshToken: string): Promise<TokensDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: { email: true, hashedRefreshToken: true },
    });
    if (!user?.hashedRefreshToken) {
      // TODO add device service
      // await this.userDeviceService.removeDevice(userId);
      throw new TokenInvalidException();
    }

    const isRefreshTokenMatch = await HashHelper.compare(
      refreshToken,
      user.hashedRefreshToken,
    );
    if (!isRefreshTokenMatch) {
      // TODO add device service
      // await this.userDeviceService.removeDevice(userId);
      throw new TokenInvalidException();
    }

    const tokens = await this.tokenService.generateAuthTokens({
      id: userId,
      email: user.email,
    });

    return {
      ...tokens,
      user: {
        id: userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
      },
    };
  }

  async forgotPassword({
    email,
  }: ForgotPasswordDto): Promise<StatusMessageDto> {
    const resetToken = this.tokenService.generateResetPasswordToken();
    const user = await this.userRepository.findOneBy({ email });
    await this.userRepository.update(
      { id: user.id },
      {
        passwordResetToken: resetToken.hashedResetToken,
        passwordResetExpires: resetToken.expiresToken,
      },
    );
    if (user) {
      await this.emailService.sendMail({
        to: email,
        subject: 'Reset Password',
        templateName: 'reset-password',
        name: user.firstName,
        url: `${this.config.get('URL_CLIENT')}/auth/reset-password?token=${
          resetToken.resetToken
        }`,
      });
    }
    return { message: 'Success' };
  }

  async verifyTokenResetPassword(token: string): Promise<StatusMessageDto> {
    const user = await this.tokenService.verifyResetPasswordToken(token);
    if (!user) throw new TokenInvalidException();

    return { message: 'Success' };
  }

  async resetPassword(
    token: string,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<StatusMessageDto> {
    const user = await this.tokenService.verifyResetPasswordToken(token);
    if (!user) throw new TokenInvalidException();

    await this.userRepository.update(
      { id: user.id },
      {
        password: resetPasswordDto.password,
        passwordConfirm: resetPasswordDto.passwordConfirm,
        passwordResetToken: null,
        passwordResetExpires: null,
        hashedRefreshToken: null,
      },
    );

    await this.emailService.sendMail({
      to: user.email,
      subject: 'Reset Password Successful',
      url: `${this.config.get('URL_CLIENT')}/auth/sign-in`,
      templateName: 'success-reset-password',
      name: user.firstName,
    });

    return { message: 'Success' };
  }
}
