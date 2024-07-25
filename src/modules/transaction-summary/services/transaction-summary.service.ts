import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  differenceInDays,
  endOfDay,
  endOfMonth,
  parse,
  startOfDay,
  startOfMonth,
  subDays,
} from 'date-fns';
import { Repository } from 'typeorm';

import {
  calculatePercentageChange,
  fillMissingDays,
} from '@/modules/transaction-summary/helpers';
import { TransactionEntity } from '@/modules/transactions/entities/transaction.entity';

@Injectable()
export class TransactionSummaryService {
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
  ) {}

  private async fetchFinancialData({
    userId,
    startDate,
    endDate,
    accountId,
  }: {
    userId: string;
    accountId?: string;
    startDate: Date;
    endDate: Date;
  }) {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .select(
        'SUM(CASE WHEN transaction.amount >= 0 THEN transaction.amount ELSE 0 END)',
        'income',
      )
      .addSelect(
        'SUM(CASE WHEN transaction.amount < 0 THEN transaction.amount ELSE 0 END)',
        'expenses',
      )
      .addSelect('SUM(transaction.amount)', 'remaining')
      .where('transaction.user_id = :userId', { userId })
      .andWhere('transaction.date <= :endDate', { endDate })
      .andWhere('transaction.date >= :startDate', { startDate });

    if (accountId) {
      query.andWhere('transaction.account_id = :accountId', { accountId });
    }

    const financialData = await query.getRawOne();
    return financialData;
  }

  async getSummary(
    userId: string,
    query: { from?: string; to?: string; accountId?: string },
  ) {
    const defaultTo = endOfMonth(new Date());
    const defaultFrom = startOfMonth(new Date());

    const startDate = query.from
      ? startOfDay(parse(query.from, 'yyyy-MM-dd', new Date()))
      : defaultFrom;
    const endDate = query.to
      ? endOfDay(parse(query.to, 'yyyy-MM-dd', new Date()))
      : defaultTo;

    const periodLength = differenceInDays(endDate, startDate) + 1;
    const lastPeriodStart = subDays(startDate, periodLength);
    const lastPeriodEnd = subDays(endDate, periodLength);

    const currentPeriod = await this.fetchFinancialData({
      userId,
      startDate,
      endDate,
      accountId: query.accountId,
    });
    const lastPeriod = await this.fetchFinancialData({
      userId,
      accountId: query.accountId,
      startDate: lastPeriodStart,
      endDate: lastPeriodEnd,
    });

    const incomeChange = calculatePercentageChange(
      currentPeriod.income,
      lastPeriod.income,
    );
    const expensesChange = calculatePercentageChange(
      currentPeriod.expenses,
      lastPeriod.expenses,
    );
    const remainingChange = calculatePercentageChange(
      currentPeriod.remaining,
      lastPeriod.remaining,
    );

    const queryCategory = this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.category', 'category')
      .select('category.name', 'name')
      .addSelect('SUM(ABS(transaction.amount))', 'value')
      .where('transaction.user_id = :userId', { userId })
      .andWhere('transaction.date <= :endDate', { endDate })
      .andWhere('transaction.date >= :startDate', { startDate });

    if (query.accountId) {
      queryCategory.andWhere('transaction.account_id = :accountId', {
        accountId: query.accountId,
      });
    }

    const category = await queryCategory
      .groupBy('category.name')
      .orderBy('value', 'DESC')
      .getRawMany();

    const topCategories = category.slice(0, 3);
    const otherCategories = category.slice(3);
    const otherSum = otherCategories.reduce(
      (sum, current) => sum + +current.value,
      0,
    );

    if (otherCategories.length > 0) {
      topCategories.push({ name: 'Other', value: `${otherSum}` });
    }

    const activeDaysQuery = this.transactionRepository
      .createQueryBuilder('transaction')
      .select('transaction.date', 'date')
      .addSelect(
        'SUM(CASE WHEN transaction.amount >= 0 THEN transaction.amount ELSE 0 END)',
        'income',
      )
      .addSelect(
        'SUM(CASE WHEN transaction.amount < 0 THEN ABS(transaction.amount) ELSE 0 END)',
        'expenses',
      )
      .where('transaction.user_id = :userId', { userId })
      .andWhere('transaction.date <= :endDate', { endDate })
      .andWhere('transaction.date >= :startDate', { startDate });

    if (query.accountId) {
      activeDaysQuery.andWhere('transaction.account_id = :accountId', {
        accountId: query.accountId,
      });
    }

    const activeDays = await activeDaysQuery
      .groupBy('transaction.date')
      .orderBy('transaction.date')
      .getRawMany();

    const days = fillMissingDays(activeDays, startDate, endDate);

    return {
      remainingAmount: +currentPeriod.remaining,
      remainingChange: +remainingChange,
      incomeAmount: +currentPeriod.income,
      incomeChange: +incomeChange,
      expensesAmount: +currentPeriod.expenses,
      expensesChange: +expensesChange,
      categories: topCategories,
      days,
    };
  }
}
