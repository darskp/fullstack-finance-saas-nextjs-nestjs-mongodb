import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Income } from '../../schemas/income.schema';
import { User } from '../../schemas/user.schema';
import { AddIncomeDto } from './dto/add-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Injectable()
export class IncomeService {
    constructor(
        @InjectModel(Income.name) private incomeModel: Model<Income>,
        @InjectModel(User.name) private userModel: Model<User>,
    ) { }

    async findUserIncome(userId: string): Promise<Income[]> {
        try {
            return await this.incomeModel.find({ userId }).exec();
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Could not fetch income records');
        }
    }


    async addIncome(
        userId: string,
        addIncomeDto: AddIncomeDto,
    ): Promise<Income> {
        try {
            const newIncome = new this.incomeModel({
                ...addIncomeDto,
                transactionType: 'Income',
                userId,
            });

            const savedIncome = await newIncome.save();

            await this.userModel.findOneAndUpdate(
                { clerkId: userId },
                { $push: { income: savedIncome._id } },
            );

            return savedIncome;
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Could not save income');
        }
    }

    async updateIncome(
        id: string,
        userId: string,
        updateIncomeDto: UpdateIncomeDto,
    ): Promise<Income> {
        try {
            const updatedIncome = await this.incomeModel
                .findOneAndUpdate({ _id: id, userId }, updateIncomeDto, { new: true })
                .exec();

            if (!updatedIncome) {
                throw new NotFoundException(
                    `Income with ID ${id} not found or you do not have permission`,
                );
            }

            return updatedIncome;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error(error);
            throw new InternalServerErrorException('Could not update income record');
        }
    }

    async deleteIncome(id: string, userId: string): Promise<{ message: string }> {
        try {
            const result = await this.incomeModel
                .findOneAndDelete({ _id: id, userId })
                .exec();

            if (!result) {
                throw new NotFoundException(
                    `Income with ID ${id} not found or you do not have permission`,
                );
            }

            await this.userModel.findOneAndUpdate(
                { clerkId: userId },
                { $pull: { income: id } },
            );

            return { message: 'Income successfully deleted' };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error(error);
            throw new InternalServerErrorException('Could not delete income record');
        }
    }
}

