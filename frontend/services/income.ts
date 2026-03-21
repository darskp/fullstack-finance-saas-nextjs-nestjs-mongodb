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

const fetchIncome = async () => {
    try {
        const response = await api.get(`get-income`)
        return response.data
    } catch (error) {
        console.log(error)
    }
}

const updateIncome = async (data: ITransactionData) => {
    const {_id,...otherUpdatedData}=data;
    try {
        const response = await api.put(`update-income/${String(data._id)}`,otherUpdatedData)
        return response.data
    } catch (error) {
        console.log(error)
    }
}

const deleteIncome = async (id:string) => {
    try {
        const response = await api.delete(`delete-income/${String(id)}`)
        return response.data
    } catch (error) {
        console.log(error)
    }
}



export { AddIncome, fetchIncome,updateIncome,deleteIncome }