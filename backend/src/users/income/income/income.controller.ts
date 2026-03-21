import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { IncomeService } from './income.service';
import { Income } from '../../schemas/income.schema';
import { AddIncomeDto } from './dto/add-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { CurrentUser } from '../../../clerk/current-user.decorator';
import { ClerkAuthGuard } from '../../../clerk/clerk-auth.guard';

@Controller('api/')
@UseGuards(ClerkAuthGuard)
export class IncomeController {
    constructor(private readonly incomeService: IncomeService) { }

    @Get('get-income')
    async getUserIncome(@CurrentUser() user: { id: string }): Promise<Income[]> {
        return this.incomeService.findUserIncome(user.id);
    }


    @Post('add-income')
    @HttpCode(HttpStatus.CREATED)
    async addIncome(
        @CurrentUser() user: { id: string },
        @Body() addIncomeDto: AddIncomeDto,
    ): Promise<Income> {
        return this.incomeService.addIncome(user.id, addIncomeDto);
    }

    @Put('update-income/:id')
    @HttpCode(HttpStatus.OK)
    async updateIncome(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
        @Body() updateIncomeDto: UpdateIncomeDto,
    ): Promise<Income> {
        return this.incomeService.updateIncome(id, user.id, updateIncomeDto);
    }

    @Delete('delete-income/:id')
    @HttpCode(HttpStatus.OK)
    async deleteIncome(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
    ): Promise<{ message: string }> {
        return this.incomeService.deleteIncome(id, user.id);
    }

}
