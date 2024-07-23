import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

export class BaseEntityDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsDateString()
  createdAt!: Date;

  @ApiProperty()
  @IsDateString()
  updatedAt!: Date;
}
