import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class TransactionSummaryDto {
  @ApiProperty()
  @IsNumber()
  remainingAmount: number;

  @ApiProperty()
  @IsNumber()
  remainingChange: number;

  @ApiProperty()
  @IsNumber()
  incomeAmount: number;

  @ApiProperty()
  @IsNumber()
  incomeChange: number;

  @ApiProperty()
  @IsNumber()
  expensesAmount: number;

  @ApiProperty()
  @IsNumber()
  expensesChange: number;

  @ApiProperty({ example: [{ name: 'Category Name', value: 0 }] })
  categories: { name: string; value: string | number }[];

  @ApiProperty({
    example: [
      {
        date: new Date().toISOString(),
        income: 0,
        expenses: 0,
      },
    ],
  })
  days: { date: Date; income: number; expenses: number }[];
}
