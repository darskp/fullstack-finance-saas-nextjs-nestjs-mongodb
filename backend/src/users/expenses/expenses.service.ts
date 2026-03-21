import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { Expense } from '../schemas/expense.schema';
import { AddExpensesDto } from './dto/add-expenses.dto';
import { UpdateExpensesDto } from './dto/update-expenses.dto';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectModel(Expense.name) private expenseModel: Model<Expense>,
        @InjectModel(User.name) private userModel: Model<User>,
    ) { }

    async findUserExpenses(userId: string): Promise<Expense[]> {
        try {
            return await this.expenseModel.find({ userId }).exec();
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Could not fetch expense records');
        }
    }


    async addExpenses(
        userId: string,
        addExpensesDto: AddExpensesDto,
    ): Promise<Expense> {
        try {
            const newExpenses = new this.expenseModel({
                ...addExpensesDto,
                transactionType: 'Expense',
                userId,
            });

            const savedExpenses = await newExpenses.save();

            await this.userModel.findOneAndUpdate(
                { clerkId: userId },
                { $push: { expenses: savedExpenses._id } },
            );

            return savedExpenses;
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Could not save expenses');
        }
    }

    async updateExpenses(
        id: string,
        userId: string,
        updateExpensesDto: UpdateExpensesDto,
    ): Promise<Expense> {
        try {
            const updatedExpense = await this.expenseModel
                .findOneAndUpdate({ _id: id, userId }, updateExpensesDto, { new: true })
                .exec();

            if (!updatedExpense) {
                throw new NotFoundException(
                    `Expense with ID ${id} not found or you do not have permission`,
                );
            }

            return updatedExpense;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error(error);
            throw new InternalServerErrorException('Could not update expense record');
        }
    }

    async deleteExpenses(id: string, userId: string): Promise<{ message: string }> {
        try {
            const result = await this.expenseModel
                .findOneAndDelete({ _id: id, userId })
                .exec();

            if (!result) {
                throw new NotFoundException(
                    `Expense with ID ${id} not found or you do not have permission`,
                );
            }

            await this.userModel.findOneAndUpdate(
                { clerkId: userId },
                { $pull: { expenses: id } },
            );

            return { message: 'Expense successfully deleted' };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error(error);
            throw new InternalServerErrorException('Could not delete expense record');
        }
    }
}


