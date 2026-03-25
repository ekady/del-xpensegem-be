import { Injectable } from '@nestjs/common';
import { CurrencyDto } from '../dto/currency.dto';
import { CURRENCY } from '@/shared/constants/currency.constant';

@Injectable()
export class CurrencyService {
  constructor() {}

  async getCurrencies(): Promise<CurrencyDto[]> {
    return Object.values(CURRENCY);
  }
}
