import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Expense, ExpenseSchema } from '../schemas/expense.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Expense.name, schema: ExpenseSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [ExpensesController],
    providers: [ExpensesService],
})

export class ExpensesModule { }
