"use client"
import { EXPENSE_IMAGE, INCOME_IMAGE, TOTAL_BALANCE_IMAGE, TOTAL_TRANSACTION_IMAGE, USER_IMAGE } from '@/utils/constants';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Card from './Card';
import { useEffect, useMemo, useState } from 'react';
import { getDashboardValues } from '@/services/dashboard';
import * as Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import { fetchIncome } from '@/services/income';
import { fetchExpense } from '@/services/expenses';
import { fetchTransactionsList, getCategoryWiseValue, getMoneyFlowOptions, getMonthlyIncomeExpense, getPieChartOptions } from '@/utils/helpers';
import { alltransaction } from '@/services/transaction';

const initialDashboardValues = {
    totalBalance: 0,
    incomeValue: 0,
    expenseValue: 0,
    totalTransaction: 0
}

const Dashboard = () => {
    const { user } = useUser();

    const [dashboardValues, setDashboardValues] = useState(initialDashboardValues)
    const [incomeSeries, setIncomeSeries] = useState<number[]>([])
    const [expenseSeries, setExpenseSeries] = useState<number[]>([])
    const [categories, setCategories] = useState<string[]>([])
    const [categoriesSeries, setCategoriesSeries] = useState<{ name: string, y: number }[]>([])

    const handleFetchDashboardValues = async () => {
        try {
            const data = await getDashboardValues();
            setDashboardValues(data);
        } catch (error) {
            console.error("Failed to fetch dashboard values:", error);
            setDashboardValues(initialDashboardValues);
        }
    };

    const handleMoneyFlowOptions = async () => {
        const incomeList = await fetchIncome()
        const expenseList = await fetchExpense()
        const { incomeSeries, expenseSeries, categories } = await getMonthlyIncomeExpense(
            incomeList, expenseList
        )
        setIncomeSeries(incomeSeries)
        setExpenseSeries(expenseSeries)
        setCategories(categories)
    }

    const handleCatSeries=async()=>{
        const transactions=await alltransaction();
        const series= getCategoryWiseValue(transactions);
        setCategoriesSeries(series)
    }

    useEffect(() => {
        handleFetchDashboardValues()
        handleMoneyFlowOptions()
        handleCatSeries()
    }, [])

    const moneyFlowOptions = useMemo(() => {
        return getMoneyFlowOptions(categories, incomeSeries, expenseSeries)
    }, [
        categories, incomeSeries, expenseSeries
    ]);

    const categoryOptions = useMemo(() => {
        return getPieChartOptions(categoriesSeries)
    }, [
        categoriesSeries
    ]);

    return (
        <div className='ml-4 md:ml-8 mt-6 mr-4 md:mr-8 mb-4 flex-1 overflow-y-scroll no-scrollbar'>
            <div className='flex items-center justify-between'>
                <div className='flex flex-col'>
                    <span className='text-2xl font-medium'>Welcome Back, {user?.firstName}</span>
                    <span className='text-gray-500 text-sm mt-0.5'>It is the best time to manage your finances</span>
                </div>
                {/* <div className='flex items-center justify-center shadow gap-2 border border-gray-300 rounded-full py-1.5 pr-4 pl-1.5'>
                    <Image
                        src={user?.imageUrl || USER_IMAGE}
                        alt='user-img'
                        className='rounded-full'
                        width={32}
                        height={32}
                    />
                    <div className='flex flex-col'>
                        <span className='text-base font-medium'>{user?.firstName}</span>
                    </div>
                </div> */}
            </div>
            <div className='mt-8 grid grid-cols-2 lg:grid-cols-4 justify-between gap-4'>
                <Card
                    title='Total Balance'
                    imgSrc={TOTAL_BALANCE_IMAGE}
                    value={dashboardValues.totalBalance}
                />
                <Card
                    title='Income'
                    imgSrc={INCOME_IMAGE}
                    value={dashboardValues.incomeValue}
                />
                <Card
                    title='Expense'
                    imgSrc={EXPENSE_IMAGE}
                    value={dashboardValues.expenseValue}
                />
                <Card
                    title='Total Transaction'
                    imgSrc={TOTAL_TRANSACTION_IMAGE}
                    value={dashboardValues.totalTransaction}
                />
            </div>
            <div className='flex flex-col xl:flex-row items-start justify-between gap-4 mt-8'>
                <div className='border border-gray-300 
                rounded-3xl flex-1 xl:flex-[2] pb-2 pt-6 
                px-4 flex flex-col relative w-full h-full'>
                    <span className='absolute top-6.5 font-medium text-xl'>Money Flow</span>
                    <div className='mt-12 h-full'>
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={moneyFlowOptions}
                        />
                    </div>
                </div>
                <div className='flex-1 border border-gray-300 rounded-3xl
                pb-2 pt-6 px-4 flex flex-col relative w-full
                '>
                    <span className='font-medium text-xl'>
                        Category breakdown
                    </span>
                    <div className='pb-4 h-full'>
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={categoryOptions}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard