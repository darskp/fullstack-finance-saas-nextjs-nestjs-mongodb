"use client"
import { ITransactionData } from '@/utils/types';
import TransactionModal from './TransactionModal';
import { SquarePen, Trash2, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { AddExpense, deleteExpense, fetchExpense, updateExpense } from '@/services/expenses';
import { useEffect, useMemo, useState } from 'react';
import { Spinner } from './ui/spinner';
import * as Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import { fetchTransactionsList, formatAmount, getChartOptions } from '@/utils/helpers';

const Expense = () => {
  const [loading, setLoading] = useState(false);
  const [expenseList, setExpenseList] = useState<ITransactionData[]>([]);
  const [showExpenseAddModal, setShowExpenseAddModal] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [expenseObj, setExpenseObj] = useState<ITransactionData | null>(null);
  const [seriesData, setSeriesData] = useState<any>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const handleAddExpense = async (expense: ITransactionData) => {
    try {
      const response = await AddExpense(expense)
      if (response) {
        toast.success("Expense added Successfully")
        setShowExpenseAddModal(false)
        setExpenseObj(null)
        setIsEditMode(false)
        await handleGetExpense()
      }
    }
    catch (error) {
      toast.error("Error while adding expense")
      console.log("Error while adding expense");
    }
  }

  const handleUpdateExpense = async (expense: ITransactionData) => {
    try {
      const response = await updateExpense(expense)
      if (response) {
        toast.success("Expense updated Successfully")
        setShowExpenseAddModal(false)
        setExpenseObj(null)
        setIsEditMode(false)
        await handleGetExpense()
      }
    }
    catch (error) {
      toast.error("Error while updating expense")
      console.log("Error while updating expense");
    }
  }

  const handleGetExpense = async () => {
    try {
      setLoading(true)
      const response = await fetchExpense()
      if (response) {
        setExpenseList(response)
        const { 
           newSeriesData,
        newCategoriesData
        } = fetchTransactionsList(response);
        setCategories(newCategoriesData);
        setSeriesData(newSeriesData)
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      toast.error("Error while getting expense")
      console.log("Error while getting expense");
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await deleteExpense(id)
      if (response) {
        toast.success("Expense deleted Successfully")
        await handleGetExpense()
      }
    } catch (error) {
      toast.error("Error while deleting expense")
      console.log("Error while deleting expense");
    }
  }

  const handleUpdateIcon = (expense: ITransactionData) => {
    setIsEditMode(true)
    setShowExpenseAddModal(true)
    setExpenseObj(expense)
  }

  useEffect(() => {
    handleGetExpense()
  }, [])

  const options: Highcharts.Options = useMemo(() => getChartOptions(categories, seriesData, 'column', "#EF5350"), [categories, seriesData])

  return (
    <div className='flex-1 h-screen flex flex-col overflow-hidden px-8 py-6'>
      <div className='flex w-full justify-between'>
        <h1 className='text-xl font-medium'>Expenses</h1>
        <TransactionModal
          type="Expense"
          handleAddTransaction={handleAddExpense}
          handleUpdateTransaction={handleUpdateExpense}
          showAddModal={showExpenseAddModal}
          setShowAddModal={setShowExpenseAddModal}
          transactionObj={expenseObj}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
        />
      </div>
      {expenseList?.length ? (
        <>
          <div className='border border-gray-300 mt-4 py-3 px-6 rounded-3xl'>
            <div className='font-medium text-lg'>Expense Overview</div>
            <div className='text-sm text-gray-500'>
              Monitor your expenses over time and gain insights into your spending
            </div>
            <div className='mt-8'>
              <HighchartsReact highcharts={Highcharts} options={options} />
            </div>
          </div>

          <div className='border border-gray-300 mt-4 py-6 px-6 rounded-3xl flex-1 overflow-y-auto no-scrollbar'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
              {expenseList.map((expense: ITransactionData, index: number) => (
                <div key={index} className='flex gap-4 justify-between items-center min-w-0'>
                  <div className='flex gap-2 min-w-0 flex-1 items-center'>
                    <span className='bg-gray-100 shadow-2xl text-2xl w-12 h-12 rounded-full flex items-center justify-center shrink-0'>
                      {expense.emoji}
                    </span>
                    <div className='flex flex-col min-w-0'>
                      <span className='font-medium truncate'>{expense.title}</span>
                      <span className='text-gray-500 text-sm truncate'>{expense.category}</span>
                      <span className='text-xs text-gray-400 font-medium'>
                        {expense.date ? new Date(expense.date).toLocaleDateString() : ""}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center justify-center gap-3 shrink-0'>
                    <div className='flex items-center justify-center gap-2 h-fit bg-red-100 rounded-md px-4 py-1.5'>
                      <span className='text-red-800 font-medium whitespace-nowrap'>- ${formatAmount(Number(expense.amount) || 0)}</span>
                      <TrendingDown className='w-4 h-4 text-red-800 font-bold shrink-0' />
                    </div>
                    <div className='flex items-center justify-center gap-2'>
                        <div className='p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors' onClick={() => handleUpdateIcon(expense)}>
                            <SquarePen className='w-5 h-5 text-gray-500'/>
                        </div>
                        <div className='p-2 hover:bg-red-50 rounded-full cursor-pointer transition-colors' onClick={() => handleDeleteExpense(expense._id!)}>
                            <Trash2 className='text-red-400 w-5 h-5'/>
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : loading ? (
        <div className='flex items-center justify-center h-full w-full'>
          <Spinner className='w-10 h-10' />
        </div>
      ) : (
        <div className='w-full h-full flex items-center justify-center font-medium'>
          Click the &quot;Add Expense&quot; button to add expense
        </div>
      )}
    </div>
  )
}

export default Expense;
