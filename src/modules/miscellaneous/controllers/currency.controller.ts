import { Controller, Get } from '@nestjs/common';
import { CurrencyDto } from '../dto/currency.dto';
import { CurrencyService } from '../services/currency.service';
import { ApiResProperty } from '@/shared/decorators/api-res-property.decorator';
import { SkipAuth } from '@/modules/auth/decorators';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Miscellaneous')
@Controller('miscellaneous')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('currencies')
  @ApiResProperty(CurrencyDto, 200)
  @SkipAuth()
  async getCurrencies(): Promise<CurrencyDto[]> {
    return this.currencyService.getCurrencies();
  }
}
