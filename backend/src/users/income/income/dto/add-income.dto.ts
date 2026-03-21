import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class AddIncomeDto {
  @IsNotEmpty({ message: 'Transaction type is required' })
  @IsString({ message: 'Transaction type must be a string' })
  transactionType: string;

  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @IsNotEmpty({ message: 'Emoji is required' })
  @IsString({ message: 'Emoji must be a string' })
  emoji: string;

  @IsNotEmpty({ message: 'Category is required' })
  @IsString({ message: 'Category must be a string' })
  category: string;

  @IsNotEmpty({ message: 'Amount is required' })
  @IsString({ message: 'Amount must be a string' })
  amount: string;

  @IsNotEmpty({ message: 'Date is required' })
  @IsDateString({}, { message: 'Date must be a valid ISO date string' })
  date: string;
}