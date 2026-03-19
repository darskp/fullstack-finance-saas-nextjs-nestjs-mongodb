import api from "./apiClient"

const alltransaction = async()=>{
     try {
        const response = await api.get(`get-alltransaction`)
        return response.data
    } catch (error) {
        console.log(error)
    }
}

export { alltransaction };