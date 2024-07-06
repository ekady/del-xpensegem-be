import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ContinueProviderRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  jwtToken: string;
}
