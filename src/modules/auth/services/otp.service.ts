import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetOtpEntity } from '../entities/password-reset-otp.entity';
import { PasswordResetSessionEntity } from '../entities/password-reset-session.entity';
import { randomBytes } from 'crypto';
import { EmailService } from '@/modules/email/services/email.service';
import { UserService } from '@/modules/user/services/user.service';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(PasswordResetOtpEntity)
    private otpRepository: Repository<PasswordResetOtpEntity>,
    @InjectRepository(PasswordResetSessionEntity)
    private sessionRepository: Repository<PasswordResetSessionEntity>,
    private emailService: EmailService,
    private userService: UserService,
  ) {}

  async generateOtp(email: string, requestId?: string): Promise<void> {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Invalidate all previous unused OTPs for this email
      await this.otpRepository.update(
        { email, used: false, is_expired: false },
        { used: false, is_expired: true }
      );

      await this.otpRepository.save({
        email,
        otp,
        expires_at: expiresAt,
        used: false,
        is_expired: false,
      });

      // this.emailService.sendMail({
      //   to: email,
      //   subject: 'Reset Password - OTP',
      //   templateName: 'reset-password',
      //   name: user?.firstName || '',
      //   otp,
      // });
    } catch {
      throw new BadRequestException('Failed to generate OTP, make sure the email is correct');
    }
  }

  async validateOtpAndCreateSession(email: string, otp: string): Promise<string | null> {
    // Only validate the latest unused OTP for this email
    const otpRecord = await this.otpRepository.findOne({
      where: { email, used: false },
      order: { createdAt: 'DESC' },
    });

    if (!otpRecord || otpRecord.is_expired || otpRecord.otp !== otp || otpRecord.expires_at < new Date()) {
      throw new BadRequestException('Invalid OTP, please request a new OTP');
    }

    otpRecord.used = true;
    await this.otpRepository.save(otpRecord);

    // Invalidate previous unused sessions for this email
    await this.sessionRepository.update(
      { email, used: false },
      { used: true }
    );

    // Create a new reset session token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    await this.sessionRepository.save({
      email,
      token,
      expiresAt,
      used: false,
    });

    return token;
  }

  async validateResetSessionToken(email: string, token: string): Promise<boolean> {
    const session = await this.sessionRepository.findOne({
      where: { email, token, used: false },
      order: { createdAt: 'DESC' },
    });
    if (!session || session.expiresAt < new Date()) {
      return false;
    }
    session.used = true;
    await this.sessionRepository.save(session);
    return true;
  }
} 