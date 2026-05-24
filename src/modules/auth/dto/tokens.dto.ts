import { ApiResponseProperty } from '@nestjs/swagger';
import { UserDataDto } from './user-data.dto';

export class TokensDto {
  @ApiResponseProperty()
  accessToken: string;

  @ApiResponseProperty()
  refreshToken: string;

  @ApiResponseProperty()
  tokenType: string;

  @ApiResponseProperty()
  user: UserDataDto;
}
