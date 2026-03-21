"use client"
import { EXPENSE_IMAGE, INCOME_IMAGE, TOTAL_BALANCE_IMAGE, TOTAL_TRANSACTION_IMAGE, USER_IMAGE } from '@/utils/constants';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Card from './Card';
import { useEffect, useMemo, useState } from 'react';
import * as Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import { formatAmount, getCategoryWiseValue, getMoneyFlowOptions, getMonthlyIncomeExpense, getPieChartOptions } from '@/utils/helpers';
import { alltransaction } from '@/services/transaction';
import Link from 'next/link';

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

    const loadDashboardData = async () => {
        try {
            const transactions = await alltransaction();
            if (!transactions) return;

            const incomeList = transactions.filter((t: any) => t.transactionType?.toLowerCase() === 'income');
            const expenseList = transactions.filter((t: any) => t.transactionType?.toLowerCase() === 'expense');

            const incomeValue = incomeList.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
            const expenseValue = expenseList.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
            
            setDashboardValues({
                incomeValue,
                expenseValue,
                totalBalance: incomeValue - expenseValue,
                totalTransaction: incomeValue + expenseValue
            });

            const { incomeSeries, expenseSeries, categories } = await getMonthlyIncomeExpense(
                incomeList, expenseList
            );
            setIncomeSeries(incomeSeries);
            setExpenseSeries(expenseSeries);
            setCategories(categories);

            const series = getCategoryWiseValue(transactions);
            setCategoriesSeries(series);

        } catch (error) {
            console.error("Failed to load dashboard data:", error);
            setDashboardValues(initialDashboardValues);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

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
                <div className='flex flex-col min-w-0'>
                    <div className='flex items-baseline gap-2 min-w-0'>
                        <span className='text-2xl font-medium whitespace-nowrap'>Welcome Back,</span>
                        <span className='text-2xl font-medium capitalize truncate max-w-[250px]' title={user?.username || user?.firstName || "User"}>
                            {user?.username || user?.firstName}
                        </span>
                    </div>
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
            {dashboardValues.totalTransaction > 0 && (
                <div className='flex flex-col xl:flex-row xl:items-stretch items-start justify-between gap-4 mt-8'>
                    {categories.length > 0 && (
                        <div className='border border-gray-300 
                        rounded-3xl flex-1 xl:flex-[2] pb-6 pt-6 
                        px-4 flex flex-col relative w-full min-w-0 overflow-hidden'>
                            <span className='font-medium text-xl mb-4'>Money Flow</span>
                            <div className='w-full'>
                                <HighchartsReact
                                    highcharts={Highcharts}
                                    options={moneyFlowOptions}
                                />
                            </div>
                        </div>
                    )}
                    {categoriesSeries.length > 0 && (
                        <div className='flex-1 border border-gray-300 rounded-3xl
                        pb-6 pt-6 px-4 flex flex-col relative w-full min-w-0 overflow-hidden
                        '>
                            <span className='font-medium text-xl mb-4'>
                                Category breakdown
                            </span>
                            <div className='pb-4 h-full w-full'>
                                <HighchartsReact
                                    highcharts={Highcharts}
                                    options={categoryOptions}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
            {dashboardValues.totalTransaction === 0 && (
                <div className='flex flex-col items-center justify-center py-20 px-4 mt-8 border-2 border-dashed border-gray-200 rounded-[2rem] bg-gray-50/50'>
                    <div className='bg-white p-4 rounded-full shadow-sm mb-4'>
                        <Image 
                            src={TOTAL_TRANSACTION_IMAGE}
                            alt='empty-state-icon'
                            width={48}
                            height={48}
                            className='opacity-60'
                        />
                    </div>
                    <h3 className='text-xl font-semibold text-gray-800'>No Transactions Yet</h3>
                    <p className='text-gray-500 text-center mt-2 max-w-xs'>
                        Start managing your finances by adding your first income or expense transaction.
                    </p>
                    <Link 
                        href='/transactions'
                        className='mt-6 bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors shadow-lg'
                    >
                        Get Started
                    </Link>
                </div>
            )}
        </div>
    )
}

export default Dashboard