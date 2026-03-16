import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from 'src/clerk/clerk-auth.guard';
import { ExpensesService } from './expenses.service';
import { CurrentUser } from 'src/clerk/current-user.decorator';
import { Expense } from '../schemas/expense.schema';
import { AddExpensesDto } from './dto/add-expenses.dto';
import { UpdateExpensesDto } from './dto/update-expenses.dto';

@Controller('')
@UseGuards(ClerkAuthGuard)
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }

    @Get('get-expenses')
    async getUserExpenses(@CurrentUser() user: { id: string }): Promise<Expense[]> {
        return this.expensesService.findUserExpenses(user.id);
    }


    @Post('add-expenses')
    @HttpCode(HttpStatus.CREATED)
    async addExpenses(
        @CurrentUser() user: { id: string },
        @Body() addExpensesDto: AddExpensesDto,
    ): Promise<Expense> {
        return this.expensesService.addExpenses(user.id, addExpensesDto);
    }

    @Put('update-expenses/:id')
    @HttpCode(HttpStatus.OK)
    async updateExpenses(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
        @Body() updateExpensesDto: UpdateExpensesDto,
    ): Promise<Expense> {
        return this.expensesService.updateExpenses(id, user.id, updateExpensesDto);
    }

    @Delete('delete-expenses/:id')
    @HttpCode(HttpStatus.OK)
    async deleteExpenses(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
    ): Promise<{ message: string }> {
        return this.expensesService.deleteExpenses(id, user.id);
    }

}

