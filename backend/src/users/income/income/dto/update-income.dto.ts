import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateIncomeDto {
  @IsOptional()
  @IsString({ message: 'Transaction type must be a string' })
  transactionType?: string;

  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Emoji must be a string' })
  emoji?: string;

  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  category?: string;

  @IsOptional()
  @IsString({ message: 'Amount must be a string' })
  amount?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Date must be a valid ISO date string' })
  date?: string;
}