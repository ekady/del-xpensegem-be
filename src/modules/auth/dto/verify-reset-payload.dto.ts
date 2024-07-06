import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyResetDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
