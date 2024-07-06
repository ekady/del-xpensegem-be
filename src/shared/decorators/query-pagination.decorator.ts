import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export const QueryPagination = () =>
  applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      example: 1,
      type: Number,
    }),
    ApiQuery({
      name: 'limit',
      example: 5,
      required: false,
      type: Number,
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
    }),
    ApiQuery({
      name: 'sort',
      required: false,
      type: String,
    }),
    ApiQuery({
      name: 'disabledPagination',
      required: false,
      example: false,
      type: Boolean,
    }),
  );
