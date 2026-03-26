import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import React from "react"

export default function WithAuth<T extends object>(WrappedComponent: React.ComponentType<T>) {
    const withAuthWrapper = async (props: T) => {
        let user;
        try {
            user = await currentUser();
        } catch (error) {
            console.error('Clerk Auth Error in WithAuth:', error);
            user = null;
        }

        if (!user) {
            redirect('/sign-in');
        }

        return <WrappedComponent {...props} user={user} />;
    };
    return withAuthWrapper;
}