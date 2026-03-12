import React from 'react'
import IncomeModal from './IncomeModal';

const Income = () => {
  return (
    <div className='w-[75%] ml-8 mt-6 mr-8'>
      <div className='flex w-full justify-between'>
        <h1 className='text-xl font-medium'>Incomes</h1>
        <IncomeModal />
      </div>

    </div>
  )
}

export default Income;