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

import { AccountEntity } from '@/modules/account/entities/account.entity';
import { JwtPayloadReq } from '@/modules/auth/decorators';
import { ApiResProperty } from '@/shared/decorators';
import { QueryPagination } from '@/shared/decorators/query-pagination.decorator';
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
  @ApiResProperty(AccountEntity, 201)
  create(
    @JwtPayloadReq() jwtPayload: IJwtPayload,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return this.accountService.create(jwtPayload.id, createAccountDto);
  }

  @Get()
  @ApiResProperty(AccountEntity, 200)
  @QueryPagination()
  findAll(
    @JwtPayloadReq() jwtPayload: IJwtPayload,
    @Query() queries: IPaginationOptions,
  ) {
    return this.accountService.findAll(jwtPayload.id, queries);
  }

  @Get(':id')
  @ApiResProperty(AccountEntity, 200)
  findOne(@JwtPayloadReq() jwtPayload: IJwtPayload, @Param('id') id: string) {
    return this.accountService.findOne({ userId: jwtPayload.id, id });
  }

  @Patch(':id')
  @ApiResProperty(AccountEntity, 200)
  update(
    @JwtPayloadReq() jwtPayload: IJwtPayload,
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountService.update(jwtPayload.id, id, updateAccountDto);
  }

  @Delete(':id')
  @ApiResProperty(AccountEntity, 200)
  remove(@JwtPayloadReq() jwtPayload: IJwtPayload, @Param('id') id: string) {
    return this.accountService.remove({ userId: jwtPayload.id, id });
  }
}
