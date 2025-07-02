import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { UpdateAccountDto } from '@/modules/account/dto/update-account.dto';
import { AccountEntity } from '@/modules/account/entities/account.entity';
import { PAGINATION_LIMIT } from '@/shared/constants/pagination.constant';
import { DocumentNotFoundException } from '@/shared/http-exceptions/exceptions/document-not-found.exception';
import {
  IPaginationOptions,
  IPaginationResponse,
} from '@/shared/interfaces/pagination.interface';

import { CreateAccountDto } from '../dto/create-account.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,
  ) {}

  async create(userId: string, createAccountDto: CreateAccountDto) {
    const { identifiers } = await this.accountRepository.insert({
      ...createAccountDto,
      user: { id: userId },
    });
    const account = await this.accountRepository.findOneByOrFail({
      id: identifiers[0].id,
    });
    return account;
  }

  async findAll(
    userId: string,
    { limit, page, disablePagination, sort, search }: IPaginationOptions,
  ): Promise<IPaginationResponse<AccountEntity[]>> {
    const isDisablePagination = disablePagination === 'true';
    const take = isDisablePagination
      ? undefined
      : (Number(limit) ?? PAGINATION_LIMIT);
    const [column, order] = sort?.split('|') ?? [];
    const skip = (+page - 1 >= 0 ? +page - 1 : 0) * Number(limit);

    const [accounts, count] = await this.accountRepository.findAndCount({
      where: {
        user: { id: userId },
        ...(search ? { name: ILike(`%${search}%`) } : {}),
      },
      take,
      order: column && order ? { [column]: order } : {},
      skip: isDisablePagination ? 0 : skip,
    });

    const totalPages =
      isDisablePagination || count / Number(limit) <= 1
        ? 1
        : Math.ceil(count / Number(limit));

    return {
      data: accounts,
      pagination: {
        limit: isDisablePagination ? count : take,
        page: +page,
        total: count,
        totalPages,
      },
    };
  }

  async findOne({ userId, id }: { userId: string; id: string }) {
    const account = await this.accountRepository.findOneByOrFail({
      id,
      user: { id: userId },
    });
    return account;
  }

  async update(userId: string, id: string, updateAccountDto: UpdateAccountDto) {
    const { affected, raw } = await this.accountRepository.update(
      { id, user: { id: userId } },
      updateAccountDto,
    );
    if (affected === 0) {
      throw new DocumentNotFoundException('Account not found');
    }
    return raw?.[0];
  }

  async remove({ userId, id }: { userId: string; id: string }) {
    const { affected } = await this.accountRepository.delete({
      id,
      user: { id: userId },
    });
    if (affected === 0) {
      throw new DocumentNotFoundException('Account not found');
    }
    return { id };
  }
}
