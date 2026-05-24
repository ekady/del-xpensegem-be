import { Module } from '@nestjs/common';
import { CurrencyController } from './controllers/currency.controller';
import { CurrencyService } from './services/currency.service';

@Module({
  controllers: [CurrencyController],
  providers: [CurrencyService],
})
export class MiscellaneousModule {}
