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
import { CategoryEntity } from '@/modules/categories/entities/category.entity';
import { ApiResProperty } from '@/shared/decorators';
import { QueryPagination } from '@/shared/decorators/query-pagination.decorator';
import { IJwtPayload } from '@/shared/interfaces/jwt-payload.interface';
import { IPaginationOptions } from '@/shared/interfaces/pagination.interface';

import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoriesService } from '../services/categories.service';

@Controller('categories')
@ApiTags('Categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiResProperty(CategoryEntity, 201)
  create(
    @JwtPayloadReq() jwtPayload: IJwtPayload,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(jwtPayload.id, createCategoryDto);
  }

  @Get()
  @ApiResProperty(CategoryEntity, 200)
  @QueryPagination()
  findAll(
    @JwtPayloadReq() jwtPayload: IJwtPayload,
    @Query() query: IPaginationOptions,
  ) {
    return this.categoriesService.findAll(jwtPayload.id, query);
  }

  @Get(':id')
  @ApiResProperty(CategoryEntity, 200)
  findOne(@JwtPayloadReq() jwtPayload: IJwtPayload, @Param('id') id: string) {
    return this.categoriesService.findOne(jwtPayload.id, id);
  }

  @Patch(':id')
  @ApiResProperty(CategoryEntity, 200)
  update(
    @JwtPayloadReq() jwtPayload: IJwtPayload,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(jwtPayload.id, id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiResProperty(CategoryEntity, 200)
  remove(@JwtPayloadReq() jwtPayload: IJwtPayload, @Param('id') id: string) {
    return this.categoriesService.remove(jwtPayload.id, id);
  }
}
