"use client"
import { EXPENSE_IMAGE, INCOME_IMAGE, TOTAL_BALANCE_IMAGE, TOTAL_TRANSACTION_IMAGE, USER_IMAGE } from '@/utils/constants';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Card from './Card';
import { useEffect,useState } from 'react';
import { getDashboardValues } from '@/services/dashboard';

const initialDashboardValues = {
    totalBalance: 0,
    incomeValue: 0,
    expenseValue: 0,
    totalTransaction: 0
}

const Dashboard = () => {
    const { user } = useUser();

    const [dashboardValues, setDashboardValues] = useState(initialDashboardValues)

    const handleFetchDashboardValues = async () => {
        try {
            const data = await getDashboardValues();
            setDashboardValues(data);
        } catch (error) {
            console.error("Failed to fetch dashboard values:", error);
            setDashboardValues(initialDashboardValues);
        }
    };

    useEffect(() => {
        handleFetchDashboardValues()
    }, [])

    return (
        <div className='ml-8 mt-6 mr-8 mb-4 w-[75%] overflow-y-scroll no-scrollbar'>
            <div className='flex items-center justify-between'>
                <div className='flex flex-col'>
                    <span className='text-2xl font-medium'>Welcome Back, {user?.firstName}</span>
                    <span className='text-gray-500 text-sm mt-0.5'>It is the best time to manage your finances</span>
                </div>
                <div className='flex items-center justify-center shadow gap-2 border border-gray-300 rounded-full py-1.5 pr-4 pl-1.5'>
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
                </div>
            </div>
            <div className='mt-8 flex justify-between gap-1'>
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
           
        </div>
    )
}

export default Dashboard