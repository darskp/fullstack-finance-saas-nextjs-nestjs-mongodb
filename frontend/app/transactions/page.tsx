import Transactions from '@/components/Transactions'
import WithAuth from '@/hoc/WithAuth'

const TransactionsPage = () => <Transactions/>

export default WithAuth(TransactionsPage)