"use client"
import React, { useEffect, useMemo, useState } from 'react'
import TransactionModal from './TransactionModal';
import { ChartTypes, ITransactionData } from '@/utils/types';
import { AddIncome, updateIncome, deleteIncome } from '@/services/income';
import { AddExpense, updateExpense, deleteExpense } from '@/services/expenses';
import { alltransaction } from '@/services/transaction';
import { toast } from 'sonner';
import { Spinner } from './ui/spinner';
import { SquarePen, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import * as Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import { fetchTransactionsList, formatAmount, getChartOptions, tableColumns } from '@/utils/helpers';
import { Button } from './ui/Button';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

const Transactions = () => {
    const [loading, setLoading] = useState(false);
    const [transactionList, setTransactionList] = useState<ITransactionData[]>([]);
    const [showTransactionAddModal, setShowTransactionAddModal] = useState<boolean>(false);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [transactionObj, setTransactionObj] = useState<ITransactionData | null>(null);
    const [seriesData, setSeriesData] = useState<any>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [chartType, setChartType] = useState<ChartTypes>('column');

    const fetchAllTransactions = async () => {
        try {
            setLoading(true);
            const response = await alltransaction();
            if (response) {
                setTransactionList(response);
                const {
                    newSeriesData,
                    newCategoriesData
                } = fetchTransactionsList(response);
                setCategories(newCategoriesData);
                setSeriesData(newSeriesData);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error("Error while getting transactions");
            console.log("Error while getting transactions", error);
        }
    }

    useEffect(() => {
        fetchAllTransactions();
    }, []);

    const handleAddTransaction = async (data: ITransactionData) => {
        try {
            const isIncome = data.transactionType === 'Income';
            const response = isIncome ? await AddIncome(data) : await AddExpense(data);

            if (response) {
                toast.success(`${isIncome ? 'Income' : 'Expense'} added Successfully`);
                setShowTransactionAddModal(false);
                setTransactionObj(null);
                setIsEditMode(false);
                await fetchAllTransactions();
            }
        } catch (error) {
            toast.error(`Error while adding ${data.transactionType}`);
            console.error(error);
        }
    }

    const handleUpdateTransaction = async (data: ITransactionData) => {
        try {
            const isIncome = data.transactionType === 'Income';
            const response = isIncome ? await updateIncome(data) : await updateExpense(data);

            if (response) {
                toast.success(`${isIncome ? 'Income' : 'Expense'} updated Successfully`);
                setShowTransactionAddModal(false);
                setTransactionObj(null);
                setIsEditMode(false);
                await fetchAllTransactions();
            }
        } catch (error) {
            toast.error(`Error while updating ${data.transactionType}`);
            console.error(error);
        }
    }

    const handleDeleteTransaction = async (id: string, type: string) => {
        try {
            const isIncome = type === 'Income';
            const response = isIncome ? await deleteIncome(id) : await deleteExpense(id);
            if (response) {
                toast.success(`${isIncome ? 'Income' : 'Expense'} deleted Successfully`);
                await fetchAllTransactions();
            }
        } catch (error) {
            toast.error(`Error while deleting ${type}`);
            console.error(error);
        }
    }

    const handleEditIcon = (transaction: ITransactionData) => {
        setIsEditMode(true);
        setShowTransactionAddModal(true);
        setTransactionObj(transaction);
    }

    const handleChartType = () => {
        if (chartType == 'column') {
            setChartType('line')
        } else {
            setChartType('column')
        }
    }

    const options: Highcharts.Options = useMemo(() => getChartOptions(categories, seriesData, chartType), [categories, seriesData, chartType]);

    return (
        <div className='flex-1 h-screen flex flex-col overflow-hidden px-8 py-6'>
            <div className='flex w-full justify-between'>
                <h1 className='text-xl font-medium'>Transactions</h1>
                <TransactionModal
                    type="Transaction"
                    handleAddTransaction={handleAddTransaction}
                    handleUpdateTransaction={handleUpdateTransaction}
                    showAddModal={showTransactionAddModal}
                    setShowAddModal={setShowTransactionAddModal}
                    transactionObj={transactionObj}
                    isEditMode={isEditMode}
                    setIsEditMode={setIsEditMode}
                />
            </div>

            {transactionList?.length ? (
                <>
                    <div className='border border-gray-300 mt-4 py-3 px-6 rounded-3xl'>
                        <div className='flex justify-between items-center'>
                            <div>
                                <div className='font-medium text-lg'>Transaction Overview</div>
                                <div className='text-sm text-gray-500'>
                                    Monitor your transactions (income & expenses) over time
                                </div>
                            </div>
                            <Button className='cursor-pointer' onClick={handleChartType}>
                                {chartType === 'column' ? 'Column' : 'Line'}
                            </Button>
                        </div>
                        <div className='mt-8'>
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={options}
                            />
                        </div>
                    </div>

                    <div className='border border-gray-300 mt-4 py-6 px-6 rounded-3xl flex-1 overflow-y-auto no-scrollbar'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {
                                        tableColumns.length > 0 && tableColumns.map((column:any) => (
                                            <TableHead key={column.id}>{column.name}</TableHead>
                                        ))
                                    }
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {
                                    tableColumns.length > 0 && transactionList.map((transaction: ITransactionData) => (
                                    <TableRow key={transaction._id}>
                                        <TableCell className='text-2xl'>{transaction.emoji}</TableCell>
                                        <TableCell className='font-medium max-w-[200px] truncate' title={transaction.title}>{transaction.title}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-md text-sm font-medium whitespace-nowrap ${transaction.transactionType === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {transaction.transactionType}
                                            </span>
                                        </TableCell>
                                        <TableCell className='max-w-[150px] truncate' title={transaction.category}>{transaction.category}</TableCell>
                                        <TableCell className='whitespace-nowrap'>{transaction.date ? new Date(transaction.date).toLocaleDateString() : ''}</TableCell>
                                        <TableCell className={`font-semibold whitespace-nowrap ${transaction.transactionType === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {transaction.transactionType === 'Income' ? '+' : '-'} ${formatAmount(Number(transaction.amount) || 0)}
                                        </TableCell>
                                        <TableCell>
                                            <div className='p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors w-fit' onClick={() => handleEditIcon(transaction)}>
                                                <SquarePen className='w-5 h-5 text-gray-500 hover:text-gray-700' />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className='p-2 hover:bg-red-50 rounded-full cursor-pointer transition-colors w-fit' onClick={() => handleDeleteTransaction(transaction._id!, transaction.transactionType!)}>
                                                <Trash2 className='text-red-400 w-5 h-5 hover:text-red-600' />
                                            </div>
                                        </TableCell>
                                    </TableRow>))
                                }
                            </TableBody>
                        </Table>
                    </div>
                </>
            ) : loading ? (
                <div className='flex items-center justify-center h-full w-full'>
                    <Spinner className='w-10 h-10' />
                </div>
            ) : (
                <div className='w-full h-full flex items-center justify-center font-medium'>
                    Click the &quot;Add Transaction&quot; button to add your first transaction
                </div>
            )}
        </div>
    )
}

export default Transactions;