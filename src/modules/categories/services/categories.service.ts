import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { CategoryEntity } from '@/modules/categories/entities/category.entity';
import { PAGINATION_LIMIT } from '@/shared/constants/pagination.constant';
import { DocumentNotFoundException } from '@/shared/http-exceptions/exceptions/document-not-found.exception';
import {
  IPaginationOptions,
  IPaginationResponse,
} from '@/shared/interfaces/pagination.interface';

import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
  ) {}
  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    const { raw } = await this.categoryRepository.insert({
      ...createCategoryDto,
      user: { id: userId },
    });
    return raw;
  }

  async findAll(
    userId: string,
    { limit, page, disablePagination, search, sort }: IPaginationOptions,
  ): Promise<IPaginationResponse<CategoryEntity[]>> {
    const isDisablePagination = disablePagination === 'true';
    const take = isDisablePagination
      ? undefined
      : Number(limit) || PAGINATION_LIMIT;
    const skip = (+page - 1 >= 0 ? +page - 1 : 0) * take;
    const [column, order] = sort?.split('|') ?? [];
    const searchQuery = search ? { name: ILike(`%${search}%`) } : {};

    const [categories, count] = await this.categoryRepository.findAndCount({
      where: { user: { id: userId }, ...searchQuery },
      skip: isDisablePagination ? 0 : skip,
      take,
      order: column && order ? { [column]: order } : {},
    });

    const totalPages =
      isDisablePagination || count / Number(limit) <= 1
        ? 1
        : Math.ceil(count / Number(limit));

    return {
      data: categories,
      pagination: {
        limit: isDisablePagination ? count : take,
        page: +page,
        total: count,
        totalPages,
      },
    };
  }

  async findOne(userId: string, id: string) {
    const category = await this.categoryRepository.findOneByOrFail({
      id,
      user: { id: userId },
    });

    if (!category) throw new DocumentNotFoundException('Category not found');

    return category;
  }

  async update(
    userId: string,
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    const { affected } = await this.categoryRepository.update(
      { id, user: { id: userId } },
      updateCategoryDto,
    );

    if (affected === 0)
      throw new DocumentNotFoundException('Category not found');

    return { id };
  }

  async remove(userId: string, id: string) {
    const { affected } = await this.categoryRepository.delete({
      id,
      user: { id: userId },
    });

    if (affected === 0)
      throw new DocumentNotFoundException('Category not found');

    return { id };
  }
}
