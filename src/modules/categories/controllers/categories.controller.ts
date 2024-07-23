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
import { CategoryDto } from '@/modules/categories/dto/category.dto';
import { ApiResProperty } from '@/shared/decorators';
import { QueryPagination } from '@/shared/decorators/query-pagination.decorator';
import { BaseEntityDto, IdDto } from '@/shared/dto';
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
  @ApiResProperty(BaseEntityDto, 201)
  create(
    @JwtPayloadReq() jwtPayload: IJwtPayload,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(jwtPayload.id, createCategoryDto);
  }

  @Get()
  @ApiResProperty([CategoryDto], 200, { isPagination: true })
  @QueryPagination()
  findAll(
    @JwtPayloadReq() jwtPayload: IJwtPayload,
    @Query() query: IPaginationOptions,
  ) {
    return this.categoriesService.findAll(jwtPayload.id, query);
  }

  @Get(':id')
  @ApiResProperty(CategoryDto, 200)
  findOne(@JwtPayloadReq() jwtPayload: IJwtPayload, @Param('id') id: string) {
    return this.categoriesService.findOne(jwtPayload.id, id);
  }

  @Patch(':id')
  @ApiResProperty(BaseEntityDto, 200)
  update(
    @JwtPayloadReq() jwtPayload: IJwtPayload,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(jwtPayload.id, id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiResProperty(IdDto, 200)
  remove(@JwtPayloadReq() jwtPayload: IJwtPayload, @Param('id') id: string) {
    return this.categoriesService.remove(jwtPayload.id, id);
  }
}
