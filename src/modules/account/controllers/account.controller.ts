import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AccountDto } from '@/modules/account/dto/account.dto';
import { JwtPayloadReq } from '@/modules/auth/decorators';
import { ApiResProperty } from '@/shared/decorators';
import { QueryPagination } from '@/shared/decorators/query-pagination.decorator';
import { BaseEntityDto, IdDto } from '@/shared/dto';
import { IJwtPayload } from '@/shared/interfaces/jwt-payload.interface';
import { IPaginationOptions } from '@/shared/interfaces/pagination.interface';

import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { AccountService } from '../services/account.service';

@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @ApiResProperty(BaseEntityDto, 201)
  create(
    @JwtPayloadReq() jwtPayload: IJwtPayload,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return this.accountService.create(jwtPayload.id, createAccountDto);
  }

  @Get()
  @ApiResProperty([AccountDto], 200, { isPagination: true })
  @QueryPagination()
  findAll(
    @JwtPayloadReq() jwtPayload: IJwtPayload,
    @Query() queries: IPaginationOptions,
  ) {
    return this.accountService.findAll(jwtPayload.id, queries);
  }

  @Get(':id')
  @ApiResProperty(AccountDto, 200)
  findOne(@JwtPayloadReq() jwtPayload: IJwtPayload, @Param('id') id: string) {
    return this.accountService.findOne({ userId: jwtPayload.id, id });
  }

  @Patch(':id')
  @ApiResProperty(BaseEntityDto, 200)
  update(
    @JwtPayloadReq() jwtPayload: IJwtPayload,
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountService.update(jwtPayload.id, id, updateAccountDto);
  }

  @Delete(':id')
  @ApiResProperty(IdDto, 200)
  remove(@JwtPayloadReq() jwtPayload: IJwtPayload, @Param('id') id: string) {
    return this.accountService.remove({ userId: jwtPayload.id, id });
  }
}
