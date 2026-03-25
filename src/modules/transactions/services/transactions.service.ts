import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ILike,
  Repository,
  MoreThanOrEqual,
  LessThanOrEqual,
  Between,
} from 'typeorm';

import { TransactionEntity } from '@/modules/transactions/entities/transaction.entity';
import { PAGINATION_LIMIT } from '@/shared/constants/pagination.constant';
import { DocumentNotFoundException } from '@/shared/http-exceptions/exceptions/document-not-found.exception';
import { IPaginationResponse } from '@/shared/interfaces/pagination.interface';

import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { TransactionFiltersDto } from '../dto/transaction-filters.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
  ) {}
  async create(
    userId: string,
    { accountId, categoryId, ...payload }: CreateTransactionDto,
  ) {
    const { identifiers } = await this.transactionRepository.insert({
      user: { id: userId },
      account: { id: accountId },
      category: { id: categoryId },
      ...payload,
    });
    const transaction = await this.transactionRepository.findOneByOrFail({
      id: identifiers?.[0]?.id,
    });
    return transaction;
  }

  async findAll(
    userId: string,
    {
      limit = PAGINATION_LIMIT,
      page = 1,
      disablePagination,
      search,
      sort,
      categoryId,
      accountId,
      startDate,
      endDate,
      amountType,
    }: TransactionFiltersDto,
  ): Promise<IPaginationResponse<TransactionEntity[]>> {
    const isDisablePagination = disablePagination === 'true';
    const take = isDisablePagination ? undefined : Number(limit);
    const [column, order] = sort?.split('|') ?? [];
    const skip = (+page - 1 >= 0 ? +page - 1 : 0) * Number(limit);

    // Build where conditions
    const whereConditions: any = {
      user: { id: userId },
    };

    // Add search filter
    if (search) {
      whereConditions.payee = ILike(`%${search}%`);
    }

    // Add category filter
    if (categoryId) {
      whereConditions.category = { id: categoryId };
    }

    // Add account filter
    if (accountId) {
      whereConditions.account = { id: accountId };
    }

    // Add date range filters
    if (startDate && endDate) {
      whereConditions.date = Between(startDate, endDate);
    } else if (startDate) {
      whereConditions.date = MoreThanOrEqual(startDate);
    } else if (endDate) {
      whereConditions.date = LessThanOrEqual(endDate);
    }

    // Add amount type filter
    if (amountType !== undefined) {
      if (amountType === '1') {
        whereConditions.amount = MoreThanOrEqual(0);
      } else if (amountType === '-1') {
        whereConditions.amount = LessThanOrEqual(0);
      }
    }

    const [transactions, count] = await this.transactionRepository.findAndCount(
      {
        where: whereConditions,
        take,
        order: column && order ? { [column]: order } : {},
        skip: isDisablePagination ? 0 : skip,
        relations: {
          account: true,
          category: true,
        },
      },
    );

    const totalPages =
      isDisablePagination || count / Number(limit) <= 1
        ? 1
        : Math.ceil(count / Number(limit));

    return {
      data: transactions,
      pagination: {
        limit: isDisablePagination ? count : take,
        page: +page,
        total: count,
        totalPages,
      },
    };
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.transactionRepository.findOneOrFail({
      where: { id, user: { id: userId } },
      relations: {
        account: true,
        category: true,
      },
    });
    return transaction;
  }

  async update(
    userId: string,
    id: string,
    { accountId, categoryId, ...payload }: UpdateTransactionDto,
  ) {
    const { affected } = await this.transactionRepository.update(
      { id, user: { id: userId } },
      {
        account: { id: accountId },
        category: { id: categoryId },
        ...payload,
      },
    );
    if (affected === 0)
      throw new DocumentNotFoundException('Transaction not found');

    const transaction = await this.transactionRepository.findOneByOrFail({
      id,
    });
    return transaction;
  }

  async remove(userId: string, id: string) {
    const { affected } = await this.transactionRepository.delete({
      id,
      user: { id: userId },
    });
    if (affected === 0)
      throw new DocumentNotFoundException('Transaction not found');
    return { id };
  }
}
