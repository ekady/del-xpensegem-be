import { Module } from '@nestjs/common';

import { AwsModule } from '@/common/aws/aws.module';

import { FileStreamController } from './controllers/file-stream.controller';
import { FileStreamService } from './services/file-stream.service';

@Module({
  providers: [FileStreamService],
  controllers: [FileStreamController],
  imports: [AwsModule],
})
export class FileStreamModule {}
