import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Income } from '../schemas/income.schema';
import { Model } from 'mongoose';
import { Expense } from '../schemas/expense.schema';

@Injectable()
export class TransactionService {

    constructor(
        @InjectModel(Income.name) private incomeModel: Model<Income>,
        @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    ) { }

    async getAllTransaction(userId: string): Promise<(Income | Expense)[]> {
        try {
            const [incomeData, expenseData] = await Promise.all([
                this.incomeModel.find({ userId }).lean().exec(),
                this.expenseModel.find({ userId }).lean().exec()
            ]);

            const allTransaction = [...incomeData, ...expenseData] as any[];

            allTransaction.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
            });

            return allTransaction;
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Could not fetch transaction records');
        }
    }
}
