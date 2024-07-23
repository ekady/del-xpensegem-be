import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

import { AccountDto } from '@/modules/account/dto/account.dto';
import { CategoryDto } from '@/modules/categories/dto/category.dto';
import { UserDto } from '@/modules/user/dto/user.dto';
import { BaseEntityDto } from '@/shared/dto';

export class TransactionDto extends BaseEntityDto {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  payee: string;

  @ApiProperty()
  notes: string;

  @ApiProperty()
  @IsDateString()
  date: Date;

  @ApiProperty({ type: OmitType(AccountDto, ['user']) })
  account: AccountDto;

  @ApiProperty({ type: OmitType(CategoryDto, ['user']) })
  category: CategoryDto;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}
