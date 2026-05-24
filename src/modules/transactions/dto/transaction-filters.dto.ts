import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';
import { IPaginationOptions } from '@/shared/interfaces/pagination.interface';

export class TransactionFiltersDto implements IPaginationOptions {
  @ApiProperty({ required: false })
  @IsOptional()
  limit: number;

  @ApiProperty({ required: false })
  @IsOptional()
  page: number;

  @ApiProperty({ required: false })
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  sort?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  disablePagination?: string;

  @ApiProperty({ required: false, description: 'Filter by category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ required: false, description: 'Filter by account ID' })
  @IsOptional()
  @IsString()
  accountId?: string;

  @ApiProperty({ required: false, description: 'Filter transactions from this date (ISO string)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, description: 'Filter transactions until this date (ISO string)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Filter by amount type: 1 for positive amounts, -1 for negative amounts',
    enum: ['1', '-1']
  })
  @IsOptional()
  @IsIn(['1', '-1'])
  amountType?: string;
} 