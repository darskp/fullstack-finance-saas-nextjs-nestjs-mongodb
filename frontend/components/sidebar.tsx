"use client"

import { cn } from '@/lib/utils';
import { SIDEBAR_CONSTANTS } from '@/utils/constants'
import { SignOutButton } from '@clerk/nextjs';
import { CircleDollarSign, LogOut } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

function SideBar() {
    const pathname = usePathname();
    const router = useRouter();
console.log("pathname",pathname);

    const handleSideBarClick = (id: string) => router.push(id);

    if(pathname == '/sign-in' || pathname==='/sign-up'){
        return null;
    }

    return (
        <div className='bg-[#101212] w-1/5 h-full flex flex-col justify-between p-4'>
            <div className='flex flex-col'>
                <div className='flex items-center gap-2'>
                    <CircleDollarSign className='text-white h-9 w-9' />
                    <span className='text-white font-semibold text-base'>
                        Expense Tracker
                    </span>
                </div>
                <span className='text-gray-300 text-sm font-medium mt-8 '>MENU</span>
                <div className='ml-2 mt-4 flex flex-col gap-3'>
                    {SIDEBAR_CONSTANTS.map((item) => {
                        const { icon: Icon, title, id } = item;

                        const selectedItemClass = (id === pathname) ? `bg-woodsmoke2 border-shark` : " ";
                        return (
                            <div key={id}
                                className={cn(`flex gap-2 cursor-pointer py-2 px-3 rounded-md w-[95%] border border-transparent`, selectedItemClass)}
                                onClick={()=>handleSideBarClick(id)}
                                >
                                <Icon className='w-5 h-5 text-gray-400' />
                                <span className='text-sm text-gray-400'>{title}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
            <SignOutButton redirectUrl='/sign-in'>
                <button className='flex gap-2 cursor-pointer bg-woodsmoke2 rounded-md py-2 px-3'>
                    <LogOut className='w-5 h-5 text-gray-400'/>
                    <span className='text-sm text-gray-400'>Log out</span>
                </button>
            </SignOutButton>
        </div>
    )
}

export default SideBar