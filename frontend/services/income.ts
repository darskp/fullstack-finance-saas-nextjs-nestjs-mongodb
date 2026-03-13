import { ITransactionData } from "@/utils/types";
import api from "./apiClient";

const AddIncome = async (data: ITransactionData) => {
    try {
        const response = await api.post(`add-income`, data)
        return response.data
    } catch (error) {
        console.log(error)
    }
}

export { AddIncome }