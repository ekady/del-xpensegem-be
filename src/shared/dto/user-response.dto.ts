import { ApiResponseProperty } from '@nestjs/swagger';

import { AwsS3Serialization } from '@/common/aws/serializations/aws.s3.serialization';

export class UserResponse {
  @ApiResponseProperty()
  _id?: string;

  @ApiResponseProperty()
  picture: AwsS3Serialization;

  @ApiResponseProperty()
  firstName: string;

  @ApiResponseProperty()
  lastName: string;

  @ApiResponseProperty()
  email: string;

  @ApiResponseProperty()
  createdAt: Date;

  @ApiResponseProperty()
  updatedAt: Date;
}
