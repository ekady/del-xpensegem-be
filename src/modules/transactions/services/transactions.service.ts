import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { TransactionEntity } from '@/modules/transactions/entities/transaction.entity';
import { PAGINATION_LIMIT } from '@/shared/constants/pagination.constant';
import { DocumentNotFoundException } from '@/shared/http-exceptions/exceptions/document-not-found.exception';
import {
  IPaginationOptions,
  IPaginationResponse,
} from '@/shared/interfaces/pagination.interface';

import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';

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
    const { raw } = await this.transactionRepository.insert({
      user: { id: userId },
      account: { id: accountId },
      category: { id: categoryId },
      ...payload,
    });
    return raw;
  }

  async findAll(
    userId: string,
    {
      limit = PAGINATION_LIMIT,
      page = 1,
      disablePagination,
      search,
      sort,
    }: IPaginationOptions,
  ): Promise<IPaginationResponse<TransactionEntity[]>> {
    const isDisablePagination = disablePagination === 'true';
    const take = isDisablePagination ? undefined : Number(limit);
    const [column, order] = sort?.split('|') ?? [];
    const skip = (+page - 1 >= 0 ? +page - 1 : 0) * Number(limit);

    const [transactions, count] = await this.transactionRepository.findAndCount(
      {
        where: {
          user: { id: userId },
          ...(search ? { name: ILike(`%${search}%`) } : {}),
        },
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
    try {
      const transaction = await this.transactionRepository.findOneOrFail({
        where: { id, user: { id: userId } },
        relations: {
          account: true,
          category: true,
        },
      });
      return transaction;
    } catch (error) {
      throw new DocumentNotFoundException('Transaction not found');
    }
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
    return { id };
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
