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

import { JwtPayloadReq } from '@/modules/auth/decorators';
import { TransactionDto } from '@/modules/transactions/dto/transaction.dto';
import { ApiResProperty } from '@/shared/decorators';
import { QueryPagination } from '@/shared/decorators/query-pagination.decorator';
import { BaseEntityDto, IdDto } from '@/shared/dto';
import { IJwtPayload } from '@/shared/interfaces/jwt-payload.interface';
import { IPaginationOptions } from '@/shared/interfaces/pagination.interface';

import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { TransactionsService } from '../services/transactions.service';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiResProperty(BaseEntityDto, 201)
  create(
    @JwtPayloadReq() jwtPayload: IJwtPayload,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(jwtPayload.id, createTransactionDto);
  }

  @Get()
  @ApiResProperty([TransactionDto], 200, { isPagination: true })
  @QueryPagination()
  findAll(
    @JwtPayloadReq() jwtPayload: IJwtPayload,
    @Query() queries: IPaginationOptions,
  ) {
    return this.transactionsService.findAll(jwtPayload.id, queries);
  }

  @Get(':id')
  @ApiResProperty(TransactionDto, 200)
  findOne(@JwtPayloadReq() jwtPayload: IJwtPayload, @Param('id') id: string) {
    return this.transactionsService.findOne(jwtPayload.id, id);
  }

  @Patch(':id')
  @ApiResProperty(BaseEntityDto, 200)
  update(
    @JwtPayloadReq() jwtPayload: IJwtPayload,
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(
      jwtPayload.id,
      id,
      updateTransactionDto,
    );
  }

  @Delete(':id')
  @ApiResProperty(IdDto, 200)
  remove(@JwtPayloadReq() jwtPayload: IJwtPayload, @Param('id') id: string) {
    return this.transactionsService.remove(jwtPayload.id, id);
  }
}
