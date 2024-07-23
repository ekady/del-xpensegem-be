import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from '@/modules/user/dto/user.dto';
import { BaseEntityDto } from '@/shared/dto';

export class CategoryDto extends BaseEntityDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  icon: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}
