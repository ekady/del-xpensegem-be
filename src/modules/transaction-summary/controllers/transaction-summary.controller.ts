import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import { JwtPayloadReq } from '@/modules/auth/decorators';
import { TransactionSummaryDto } from '@/modules/transaction-summary/dto/transaction-summary.dto';
import { ApiResProperty } from '@/shared/decorators';
import { IJwtPayload } from '@/shared/interfaces/jwt-payload.interface';

import { TransactionSummaryService } from '../services/transaction-summary.service';

@ApiTags('Transaction Summary')
@Controller('transaction-summary')
export class TransactionSummaryController {
  constructor(
    private readonly transactionSummaryService: TransactionSummaryService,
  ) {}

  @Get()
  @ApiResProperty(TransactionSummaryDto, 200)
  @ApiQuery({ name: 'from', type: 'string', required: false })
  @ApiQuery({ name: 'to', type: 'string', required: false })
  @ApiQuery({ name: 'accountId', type: 'string', required: false })
  async getSummary(
    @JwtPayloadReq() jwtPayload: IJwtPayload,
    @Query() queries: { from?: string; to?: string; accountId?: string },
  ) {
    return this.transactionSummaryService.getSummary(jwtPayload.id, queries);
  }
}
