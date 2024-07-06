import { ObjectCannedACL } from '@aws-sdk/client-s3';

export interface IAwsS3PutItemOptions {
  path: string;
  acl?: ObjectCannedACL;
}

export interface IAwsS3ContentOptions {
  filename?: string;
  extension: string;
  fileSize?: number;
  mimetype: string;
}
