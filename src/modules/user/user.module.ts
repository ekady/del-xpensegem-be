import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AwsModule } from '@/common/aws/aws.module';
import { UserController } from '@/modules/user/controllers/user.controller';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { UserService } from '@/modules/user/services/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AwsModule],
  exports: [UserService, TypeOrmModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
