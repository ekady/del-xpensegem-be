import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { UserDto } from '@/modules/user/dto/user.dto';
import { BaseEntityDto } from '@/shared/dto';

export class AccountDto extends BaseEntityDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  icon: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}
