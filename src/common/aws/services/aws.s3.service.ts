import { Readable } from 'stream';

import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ObjectIdentifier,
  CreateMultipartUploadCommand,
  CreateMultipartUploadCommandInput,
  UploadPartCommandInput,
  UploadPartCommand,
  CompleteMultipartUploadCommandInput,
  CompleteMultipartUploadCommand,
  CompletedPart,
  GetObjectCommandInput,
  AbortMultipartUploadCommand,
  AbortMultipartUploadCommandInput,
  UploadPartRequest,
  HeadBucketCommand,
  HeadBucketCommandOutput,
  ListObjectsV2Output,
  GetObjectOutput,
  DeleteObjectsCommandInput,
  ListObjectsV2CommandInput,
  ListObjectsV2CommandOutput,
  DeleteObjectsCommandOutput,
  DeleteObjectCommandInput,
  DeleteObjectCommandOutput,
  HeadBucketCommandInput,
  GetObjectCommandOutput,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  CreateMultipartUploadCommandOutput,
  UploadPartCommandOutput,
  CompleteMultipartUploadCommandOutput,
  AbortMultipartUploadCommandOutput,
  _Object,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidV4 } from 'uuid';

import {
  IAwsS3ContentOptions,
  IAwsS3PutItemOptions,
} from '@/common/aws/interfaces/aws.interface';
import {
  AwsS3MultipartPartsSerialization,
  AwsS3MultipartSerialization,
} from '@/common/aws/serializations/aws.s3-multipart.serialization';
import { AwsS3Serialization } from '@/common/aws/serializations/aws.s3.serialization';

@Injectable()
export class AwsS3Service {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_CREDENTIAL_KEY'),
        secretAccessKey: this.configService.get<string>(
          'AWS_CREDENTIAL_SECRET_KEY',
        ),
      },
      region: this.configService.get<string>('AWS_S3_REGION'),
    });

    this.bucket = this.configService.get<string>('AWS_S3_BUCKET');
    this.baseUrl = this.configService.get<string>('AWS_S3_BASE_URL');
  }

  private throwError(error: any): void {
    let errorMessage = 'Something went wrong';
    if (error instanceof Error) errorMessage = error.message;

    throw new InternalServerErrorException(errorMessage);
  }

  private async checkBucketExistence(): Promise<HeadBucketCommandOutput> {
    const command: HeadBucketCommand = new HeadBucketCommand({
      Bucket: this.bucket,
    });

    try {
      const check = await this.s3Client.send<
        HeadBucketCommandInput,
        HeadBucketCommandOutput
      >(command);

      return check;
    } catch (err: any) {
      this.throwError(err);
    }
  }

  async listItemInBucket(prefix?: string): Promise<AwsS3Serialization[]> {
    const command: ListObjectsV2Command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
    });

    try {
      await this.checkBucketExistence();

      const listItems: ListObjectsV2Output = await this.s3Client.send<
        ListObjectsV2CommandInput,
        ListObjectsV2CommandOutput
      >(command);

      const mapList = listItems.Contents.map((val: _Object) => {
        const lastIndex: number = val.Key.lastIndexOf('/');
        const path: string = val.Key.substring(0, lastIndex);
        const filename: string = val.Key.substring(
          lastIndex + 1,
          val.Key.length,
        );
        const mime: string = filename
          .substring(filename.lastIndexOf('.') + 1, filename.length)
          .toLocaleUpperCase();

        return {
          path,
          completedPath: val.Key,
          filename: filename,
          mime,
        };
      });

      return mapList;
    } catch (err: any) {
      this.throwError(err);
    }
  }

  async getItemInBucket(filename: string, path?: string) {
    if (path) path = path.startsWith('/') ? path.replace('/', '') : `${path}`;

    const key: string = path ? `${path}/${filename}` : filename;
    const command: GetObjectCommand = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await this.checkBucketExistence();

      const item: GetObjectOutput = await this.s3Client.send<
        GetObjectCommandInput,
        GetObjectCommandOutput
      >(command);

      return item;
    } catch (err: any) {
      this.throwError(err);
    }
  }

  async putItemInBucket(
    content: string | Uint8Array | Buffer | Readable | ReadableStream | Blob,
    contentOptions: IAwsS3ContentOptions,
    options?: IAwsS3PutItemOptions,
  ): Promise<AwsS3Serialization> {
    const filename = `${uuidV4()}.${contentOptions.extension}`;
    let path: string = options?.path;
    const acl: ObjectCannedACL = options?.acl ? options.acl : 'public-read';

    if (path) path = path.startsWith('/') ? path.replace('/', '') : `${path}`;

    const mime: string = filename
      .substring(filename.lastIndexOf('.') + 1, filename.length)
      .toUpperCase();
    const key: string = path ? `${path}/${filename}` : filename;
    const command: PutObjectCommand = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: content,
      ACL: acl,
      ContentType: contentOptions.mimetype,
    });

    try {
      await this.checkBucketExistence();
      await this.s3Client.send<PutObjectCommandInput, PutObjectCommandOutput>(
        command,
      );
    } catch (err: any) {
      throw err;
    }

    return {
      filename: filename,
      completedPath: key,
      mime,
      fileSize: contentOptions.fileSize ?? 0,
    };
  }

  async deleteItemInBucket(filename: string): Promise<void> {
    const command: DeleteObjectCommand = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: filename,
    });

    try {
      await this.checkBucketExistence();

      await this.s3Client.send<
        DeleteObjectCommandInput,
        DeleteObjectCommandOutput
      >(command);
      return;
    } catch (err: any) {
      this.throwError(err);
    }
  }

  async deleteItemsInBucket(filenames: string[]): Promise<void> {
    const keys: ObjectIdentifier[] = filenames.map((val: string) => ({
      Key: val,
    }));
    const command: DeleteObjectsCommand = new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: {
        Objects: keys,
      },
    });

    try {
      await this.checkBucketExistence();

      await this.s3Client.send<
        DeleteObjectsCommandInput,
        DeleteObjectsCommandOutput
      >(command);
      return;
    } catch (err: any) {
      throw err;
    }
  }

  async deleteFolder(dir: string): Promise<void> {
    const commandList: ListObjectsV2Command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: dir,
    });
    const lists = await this.s3Client.send<
      ListObjectsV2CommandInput,
      ListObjectsV2CommandOutput
    >(commandList);

    try {
      await this.checkBucketExistence();

      const listItems = lists.Contents.map((val) => ({
        Key: val.Key,
      }));
      const commandDeleteItems: DeleteObjectsCommand = new DeleteObjectsCommand(
        {
          Bucket: this.bucket,
          Delete: {
            Objects: listItems,
          },
        },
      );

      await this.s3Client.send<
        DeleteObjectsCommandInput,
        DeleteObjectsCommandOutput
      >(commandDeleteItems);

      const commandDelete: DeleteObjectCommand = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: dir,
      });
      await this.s3Client.send<
        DeleteObjectCommandInput,
        DeleteObjectCommandOutput
      >(commandDelete);

      return;
    } catch (err: any) {
      this.throwError(err);
    }
  }

  async createMultiPart(
    filename: string,
    options?: IAwsS3PutItemOptions,
  ): Promise<AwsS3MultipartSerialization> {
    let path: string = options?.path;
    const acl: ObjectCannedACL = options?.acl ? options.acl : 'public-read';

    if (path) path = path.startsWith('/') ? path.replace('/', '') : `${path}`;

    const mime: string = filename
      .substring(filename.lastIndexOf('.') + 1, filename.length)
      .toUpperCase();
    const key: string = path ? `${path}/${filename}` : filename;

    const multiPartCommand: CreateMultipartUploadCommand =
      new CreateMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        ACL: acl,
      });

    try {
      await this.checkBucketExistence();

      const response = await this.s3Client.send<
        CreateMultipartUploadCommandInput,
        CreateMultipartUploadCommandOutput
      >(multiPartCommand);

      return {
        uploadId: response.UploadId,
        completedPath: key,
        filename: filename,
        mime,
      };
    } catch (err: any) {
      this.throwError(err);
    }
  }

  async uploadPart(
    path: string,
    content: UploadPartRequest['Body'] | string | Uint8Array | Buffer,
    uploadId: string,
    partNumber: number,
  ): Promise<AwsS3MultipartPartsSerialization> {
    const uploadPartCommand: UploadPartCommand = new UploadPartCommand({
      Bucket: this.bucket,
      Key: path,
      Body: content,
      PartNumber: partNumber,
      UploadId: uploadId,
    });

    try {
      await this.checkBucketExistence();

      const { ETag } = await this.s3Client.send<
        UploadPartCommandInput,
        UploadPartCommandOutput
      >(uploadPartCommand);

      return {
        ETag,
        PartNumber: partNumber,
      };
    } catch (err: any) {
      this.throwError(err);
    }
  }

  async completeMultipart(
    path: string,
    uploadId: string,
    parts: CompletedPart[],
  ): Promise<void> {
    const completeMultipartCommand: CompleteMultipartUploadCommand =
      new CompleteMultipartUploadCommand({
        Bucket: this.bucket,
        Key: path,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts,
        },
      });

    try {
      await this.checkBucketExistence();

      await this.s3Client.send<
        CompleteMultipartUploadCommandInput,
        CompleteMultipartUploadCommandOutput
      >(completeMultipartCommand);

      return;
    } catch (err: any) {
      this.throwError(err);
    }
  }

  async abortMultipart(path: string, uploadId: string): Promise<void> {
    const abortMultipartCommand: AbortMultipartUploadCommand =
      new AbortMultipartUploadCommand({
        Bucket: this.bucket,
        Key: path,
        UploadId: uploadId,
      });

    try {
      await this.checkBucketExistence();

      await this.s3Client.send<
        AbortMultipartUploadCommandInput,
        AbortMultipartUploadCommandOutput
      >(abortMultipartCommand);

      return;
    } catch (err: any) {
      this.throwError(err);
    }
  }
}
