import Dashboard from "@/components/Dashboard";
import WithAuth from '@/hoc/WithAuth';

const App = async() => {
    return(<Dashboard/>)
};

export default WithAuth(App);