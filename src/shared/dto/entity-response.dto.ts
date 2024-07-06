import { UserResponse } from './user-response.dto';

export interface IEntityResponseDto {
  _id?: string;
  createdBy?: UserResponse;
  updatedBy?: UserResponse;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
