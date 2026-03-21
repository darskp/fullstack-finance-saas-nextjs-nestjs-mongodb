import { ITransactionData } from "@/utils/types";
import { fetchIncome } from "./income";
import { fetchExpense } from "./expenses";

type DashboardValues = {
    incomeValue: number;
    expenseValue: number;
    totalBalance: number;
    totalTransaction: number;
};

export async function getDashboardValues(): Promise<DashboardValues> {
    const [incomeList, expenseList] = await Promise.all([
        fetchIncome(),
        fetchExpense(),
    ]);

    const incomeValue = incomeList?.reduce(
        (sum:number, item:ITransactionData) => sum + Number(item.amount),
        0
    );

    const expenseValue = expenseList?.reduce(
        (sum:number, item:ITransactionData) => sum + Number(item.amount),
        0
    );

    const totalBalance = incomeValue - expenseValue;
    const totalTransaction = incomeValue + expenseValue;

    return {
        incomeValue,
        expenseValue,
        totalBalance,
        totalTransaction,
    };
}

