import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CurrencyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name_plural: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  decimal_digits: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  rounding: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  symbol_native: string;
}
