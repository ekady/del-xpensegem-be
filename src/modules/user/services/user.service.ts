import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AwsS3Service } from '@/common/aws/services/aws.s3.service';
import { UpdatePasswordDto } from '@/modules/user/dto/update-password.dto';
import { UpdateUserDto } from '@/modules/user/dto/update-user.dto';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { StatusMessageDto } from '@/shared/dto';
import HashHelper from '@/shared/helpers/hash.helper';
import { CredentialInvalidException } from '@/shared/http-exceptions/exceptions/credentials-invalid.exception';
import { DocumentNotFoundException } from '@/shared/http-exceptions/exceptions/document-not-found.exception';

const PROFILE_PICTURE_PREFIX = 'private/profile/';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async findMe(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  async findByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  async updateMe(
    userId: string,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ) {
    const user = await this.findMe(userId);
    if (!user) {
      throw new DocumentNotFoundException('User not found');
    }

    const payload: Partial<UserEntity> = {};

    if (updateUserDto.firstName !== undefined) {
      payload.firstName = updateUserDto.firstName;
    }
    if (updateUserDto.lastName !== undefined) {
      payload.lastName = updateUserDto.lastName;
    }

    if (file) {
      const extension = file.originalname.split('.').pop() ?? 'png';
      const picture = await this.awsS3Service.putItemInBucket(
        file.buffer,
        {
          extension,
          filename: file.originalname,
          mimetype: file.mimetype,
          fileSize: file.size,
        },
        { path: '/private/profile' },
      );
      payload.picture = picture.completedPath;

      if (user.picture?.startsWith(PROFILE_PICTURE_PREFIX)) {
        try {
          await this.awsS3Service.deleteItemInBucket(user.picture);
        } catch {
          // Non-blocking cleanup of old profile picture
        }
      }
    }

    if (Object.keys(payload).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    const { affected } = await this.userRepository.update(
      { id: userId },
      payload,
    );
    if (affected === 0) {
      throw new DocumentNotFoundException('User not found');
    }

    return this.findMe(userId);
  }

  async updatePassword(
    userId: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<StatusMessageDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        password: true,
        isViaProvider: true,
      },
    });

    if (!user) {
      throw new DocumentNotFoundException('User not found');
    }

    if (user.isViaProvider && !user.password) {
      throw new BadRequestException(
        'Password cannot be changed for OAuth-only accounts',
      );
    }

    const isCurrentPasswordValid = await HashHelper.compare(
      updatePasswordDto.currentPassword,
      user.password ?? '',
    );
    if (!isCurrentPasswordValid) {
      throw new CredentialInvalidException();
    }

    if (updatePasswordDto.password !== updatePasswordDto.passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedPassword = await HashHelper.encrypt(
      updatePasswordDto.password,
    );

    await this.userRepository.update(
      { id: userId },
      {
        password: hashedPassword,
        passwordChangedAt: new Date(),
        passwordConfirm: null,
        hashedRefreshToken: null,
      },
    );

    return { message: 'Success' };
  }
}
