import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Income, IncomeSchema } from '../schemas/income.schema';
import { Expense, ExpenseSchema } from '../schemas/expense.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Income.name, schema: IncomeSchema },
      { name: Expense.name, schema: ExpenseSchema },
    ])
  ],
  controllers: [TransactionController],
  providers: [TransactionService]
})
export class TransactionModule { }
