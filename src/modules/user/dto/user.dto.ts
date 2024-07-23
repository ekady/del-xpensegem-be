import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { BaseEntityDto } from '@/shared/dto/base-entity.dto';

export class UserDto extends BaseEntityDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  picture: string;
}
