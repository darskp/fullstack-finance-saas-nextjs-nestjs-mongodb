"use client"
import { ITransactionData, NewCategoriesDataType } from '@/utils/types';
import IncomeModal from './IncomeModal';
import { SquarePen, Trash2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { AddIncome, deleteIncome, fetchIncome, updateIncome } from '@/services/income';
import { useEffect, useMemo, useState } from 'react';
import { Spinner } from './ui/spinner';
import * as Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import { fetchTransactionsList, getChartOptions } from '@/utils/helpers';

const Income = () => {
  const [loading, setLoading] = useState(false);
  const [incomeList, setIncomeList] = useState<ITransactionData[]>([]);
  const [showIncomeAddModal, setShowIncomeAddModal] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [incomeObj, setIncomeObj] = useState<ITransactionData | null>(null);
  const [seriesData, setSeriesData] = useState<any>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const handleAddIncome = async (income: ITransactionData) => {
    try {
      const respose = await AddIncome(income)
      console.log(respose)
      if (respose) {
        toast.success("Income added Successfully")
        setShowIncomeAddModal(false)
        setIncomeObj(null)
        setIsEditMode(false)
        await handleGetIncome()
      }
    }
    catch (error) {
      toast.error("Error while adding income")
      console.log("Error while adding income");
    }
  }

  const handleUpdateIncome = async (income: ITransactionData) => {
    try {
      const respose = await updateIncome(income)
      console.log(respose)
      if (respose) {
        toast.success("Income updated Successfully")
        setShowIncomeAddModal(false)
        setIncomeObj(null)
        setIsEditMode(false)
        await handleGetIncome()
      }
    }
    catch (error) {
      toast.error("Error while updating income")
      console.log("Error while updating income");
    }
  }

  const handleGetIncome = async () => {
    try {
      setLoading(true)
      const response = await fetchIncome()
      console.log(response)
      if (response) {
        setIncomeList(response)
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
      toast.error("Error while getting income")
      console.log("Error while getting income");

    }
  }

  const handleDeleteIncome = async (id: string) => {
    try {
      const response = await deleteIncome(id)
      console.log(response)
      if (response) {
        toast.success("Income deleted Successfully")
        await handleGetIncome()
      }
    } catch (error) {
      toast.error("Error while deleting income")
      console.log("Error while deleting income");
    }
  }

  const handleUpdateIcon = (income: ITransactionData) => {
    setIsEditMode(true)
    setShowIncomeAddModal(true)
    setIncomeObj(income)
  }

  useEffect(() => {
    handleGetIncome()
  }, [])

  const options: Highcharts.Options = useMemo(() => getChartOptions(categories, seriesData), [categories, seriesData])

  return (
    <div className='flex-1 h-screen flex flex-col overflow-hidden px-8 py-6'>
      <div className='flex w-full justify-between'>
        <h1 className='text-xl font-medium'>Incomes</h1>
        <IncomeModal
          handleAddIncome={handleAddIncome}
          handleUpdateIncome={handleUpdateIncome}
          showIncomeAddModal={showIncomeAddModal}
          setShowIncomeAddModal={setShowIncomeAddModal}
          incomeObj={incomeObj!}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
        />
      </div>
      {incomeList?.length ? (
        <>
          <div className='border border-gray-300 mt-4 py-3 px-6 rounded-3xl'>
            <div className='font-medium text-lg'>Income Overview</div>
            <div className='text-sm text-gray-500'>
              Monitor your income over time and gain insights into your earnings
            </div>
            <div className='mt-8'>
              <HighchartsReact highcharts={Highcharts} options={options} />
            </div>
          </div>

          <div className='border border-gray-300 mt-6 py-6 px-6 rounded-3xl flex-1 overflow-y-auto no-scrollbar'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
              {incomeList.map((income: ITransactionData, index: number) => (
                <div key={index} className='flex gap-2 justify-between items-center'>
                  <div className='flex gap-2'>
                    <span className='bg-gray-100 shadow-2xl text-2xl w-12 h-12 rounded-full flex items-center justify-center'>
                      {income.emoji}
                    </span>
                    <div className='flex flex-col'>
                      <span className='font-medium'>{income.title}</span>
                      <span className='text-gray-500'>{income.category}</span>
                      <span className='text-xs text-gray-400 font-medium'>
                        {income.date ? new Date(income.date).toLocaleDateString() : ""}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center justify-center gap-3'>
                    <div className='flex items-center justify-center gap-2 h-fit bg-green-100 rounded-md px-4 py-1'>
                      <span className='text-green-800 font-medium'>+ ${income.amount}</span>
                      <TrendingUp className='w-4 h-4 text-green-800 font-bold' />
                    </div>
                    <div className='flex items-center justify-center gap-2'>
                      <SquarePen
                        onClick={() => handleUpdateIcon(income)}
                        className='w-5 h-5 text-gray-500 cursor-pointer'
                      />
                      <Trash2
                        className='text-red-400 w-5 h-5 cursor-pointer'
                        onClick={() => handleDeleteIncome(income._id!)}
                      />
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
          Click the &quot;Add Income&quot; button to add income
        </div>
      )}
    </div>
  )
}

export default Income;