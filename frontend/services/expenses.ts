import { ITransactionData } from "@/utils/types";
import api from "./apiClient";

const AddExpense = async (data: ITransactionData) => {
    try {
        const response = await api.post(`add-expense`, data)
        return response.data
    } catch (error) {
        console.log(error)
    }
}

const fetchExpense = async () => {
    try {
        const response = await api.get(`get-expense`)
        return response.data
    } catch (error) {
        console.log(error)
    }
}

const updateExpense = async (data: ITransactionData) => {
    const {_id,...otherUpdatedData}=data;
    try {
        const response = await api.put(`update-expense/${String(data._id)}`,otherUpdatedData)
        return response.data
    } catch (error) {
        console.log(error)
    }
}

const deleteExpense = async (id:string) => {
    try {
        const response = await api.delete(`delete-expense/${String(id)}`)
        return response.data
    } catch (error) {
        console.log(error)
    }
}

export { AddExpense, fetchExpense, updateExpense, deleteExpense }
