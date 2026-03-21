import Expense from '@/components/Expense';
import WithAuth from '@/hoc/WithAuth';

const UserExpense = async() => {
    return(<Expense/>)

};

export default WithAuth(UserExpense);