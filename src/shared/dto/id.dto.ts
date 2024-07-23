import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IdDto {
  @ApiProperty()
  @IsString()
  id: string;
}
