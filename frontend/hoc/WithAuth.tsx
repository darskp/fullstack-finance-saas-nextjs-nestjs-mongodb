import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import React from "react"

export default function WithAuth<T extends object>(WrappedComponent:React.ComponentType<T>){
    const withAuthWrapper = async(props :T)=>{
        const user = await currentUser()
        if(!user){
            redirect('/sign-in')
        }
        return <WrappedComponent {...props} user={user}/>
    }
    return withAuthWrapper;
}