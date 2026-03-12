import IncomeModal from './IncomeModal';
import { SquarePen, Trash2, TrendingUp } from 'lucide-react';

const Income = () => {

  return (
    <div className='w-[75%] ml-8 mt-6 mr-8'>
      <div className='flex w-full justify-between'>
        <h1 className='text-xl font-medium'>Incomes</h1>
        <IncomeModal />
      </div>
      <div className='border border-gray-300 mt-6 py-6 px-6
      rounded-3xl h-83 overflow-y-scroll no-scrollbar
      '>
        <div className='grid grid-cols-2 gap-10'>
          <div className='flex gap-2 justify-between items-center'>
            <div className='flex gap-2'>
              <span className='bg-gray-100 shadow-2xl text-2xl w-12 h-12 rounded-full flex items-center justify-center'>
                🚀
              </span>
              <div className='flex flex-col'>
                <span className='font-medium'>Title</span>
                <span className='text-gray-500'>Category</span>
                <span className='text-xs text-gray-400 font-medium'>Date</span>
              </div>
            </div>
            <div className='flex items-center justify-center gap-3'>
              <div className='flex items-center justify-center gap-2 h-fit bg-green-100 rounded-md px-4 py-1'>
                <span className='text-green-800 font-medium'>+ $1000</span>
                <TrendingUp className='w-4 h-4 text-green-800 font-bold' />
              </div>
              <div className='flex items-center justify-center gap-2'>
                <SquarePen className='w-5 h-5 text-gray-500 cursor-pointer' />
                <Trash2 className='text-red-400 w-5 h-5 cursor-pointer' />
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}

export default Income;