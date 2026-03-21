import { Controller, Get, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CurrentUser } from '../../clerk/current-user.decorator';
import { Expense } from '../schemas/expense.schema';
import { Income } from '../schemas/income.schema';
import { ClerkAuthGuard } from '../../clerk/clerk-auth.guard';

@Controller('api/')
@UseGuards(ClerkAuthGuard)
export class TransactionController {

    constructor(private readonly transactionService: TransactionService) { }

    @Get('get-alltransaction')
    async getAllTransactions(@CurrentUser() user: { id: string }): Promise<(Income | Expense)[]> {
        return this.transactionService.getAllTransaction(user.id)
    }

}
