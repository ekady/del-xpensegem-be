import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { JwtPayloadReq } from '@/modules/auth/decorators';
import { UpdatePasswordDto } from '@/modules/user/dto/update-password.dto';
import { UpdateUserDto } from '@/modules/user/dto/update-user.dto';
import { UserDto } from '@/modules/user/dto/user.dto';
import { UserService } from '@/modules/user/services/user.service';
import { ApiResProperty } from '@/shared/decorators';
import { StatusMessageDto } from '@/shared/dto';
import { IJwtPayload } from '@/shared/interfaces/jwt-payload.interface';

const MAX_PICTURE_SIZE = 5 * 1024 * 1024;

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiResProperty(UserDto, 200)
  getMe(@JwtPayloadReq() jwtPayloadReq: IJwtPayload) {
    return this.userService.findMe(jwtPayloadReq.id);
  }

  @Put('me')
  @UseInterceptors(FileInterceptor('picture'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        picture: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResProperty(UserDto, 200)
  updateMe(
    @JwtPayloadReq() jwtPayloadReq: IJwtPayload,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_PICTURE_SIZE }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp)$/,
          }),
        ],
      }),
    )
    picture?: Express.Multer.File,
  ) {
    const hasTextFields =
      updateUserDto.firstName !== undefined ||
      updateUserDto.lastName !== undefined;

    if (!hasTextFields && !picture) {
      throw new BadRequestException('No fields to update');
    }

    return this.userService.updateMe(
      jwtPayloadReq.id,
      updateUserDto,
      picture,
    );
  }

  @Put('me/update-password')
  @ApiResProperty(StatusMessageDto, 200)
  updatePassword(
    @JwtPayloadReq() jwtPayloadReq: IJwtPayload,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(
      jwtPayloadReq.id,
      updatePasswordDto,
    );
  }
}
