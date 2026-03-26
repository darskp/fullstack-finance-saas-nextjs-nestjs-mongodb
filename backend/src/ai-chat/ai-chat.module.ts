import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';
import { Income, IncomeSchema } from '../users/schemas/income.schema';
import { Expense, ExpenseSchema } from '../users/schemas/expense.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ClerkModule } from '../clerk/clerk.module';
import { IncomeModule } from '../users/income/income/income.module';
import { ExpensesModule } from '../users/expenses/expenses.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Income.name, schema: IncomeSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ClerkModule,
    IncomeModule,
    ExpensesModule,
  ],
  controllers: [AiChatController],
  providers: [AiChatService],
})
export class AiChatModule {}
