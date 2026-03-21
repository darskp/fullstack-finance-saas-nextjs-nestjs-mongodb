import Income from '@/components/Income';
import WithAuth from '@/hoc/WithAuth';

const UserIncome = async() => {
    return(<Income/>)
};

export default WithAuth(UserIncome);