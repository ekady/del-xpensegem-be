import { Readable } from 'stream';

import { Injectable, StreamableFile } from '@nestjs/common';

import { AwsS3Service } from '@/common/aws/services/aws.s3.service';

@Injectable()
export class FileStreamService {
  constructor(private awsS3Service: AwsS3Service) {}

  async getFileStream(filepath: string): Promise<StreamableFile> {
    const file = await this.awsS3Service.getItemInBucket(filepath);
    const fileBuffer = Readable.from(file.Body as unknown as Buffer);
    const streamFile = new StreamableFile(fileBuffer, {
      type: file.ContentType,
    });

    return streamFile;
  }
}
