"use client"

import { cn } from '@/lib/utils';
import { SIDEBAR_CONSTANTS } from '@/utils/constants'
import { SignOutButton } from '@clerk/nextjs';
import { CircleDollarSign, LogOut } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

function SideBar() {
    const pathname = usePathname();
    const router = useRouter();

    if (pathname == '/sign-in' || pathname === '/sign-up') {
        return null;
    }

    const handleSideBarClick = (id: string) => router.push(id);

    return (
        <div className={cn(
            'bg-[#101212] h-full flex flex-col justify-between p-4 transition-all duration-300 relative w-20 md:w-64'
        )}>
            <div className='flex flex-col'>
                <div className='flex items-center gap-2 mb-8'>
                    <CircleDollarSign className='text-white h-9 w-9 shrink-0' />
                    <span className='text-white font-semibold text-base hidden md:inline whitespace-nowrap overflow-hidden'>
                        Expense Tracker
                    </span>
                </div>

                <span className={cn(
                    'text-gray-300 text-sm font-medium mt-4 transition-opacity duration-200 hidden md:block'
                )}>
                    MENU
                </span>
                <div className='mt-4 flex flex-col gap-3'>
                    {SIDEBAR_CONSTANTS.map((item) => {
                        const { icon: Icon, title, id } = item;

                        const selectedItemClass = (id === pathname) ? `bg-woodsmoke2 border-shark` : " ";
                        return (
                            <div key={id}
                                title={title}
                                className={cn(
                                    `flex gap-3 cursor-pointer py-2 px-3 rounded-md border border-transparent transition-all justify-center md:justify-start`,
                                    selectedItemClass
                                )}
                                onClick={() => handleSideBarClick(id)}
                            >
                                <Icon className='w-5 h-5 text-gray-400 shrink-0' />
                                <span className='text-sm text-gray-400 hidden md:inline whitespace-nowrap overflow-hidden'>
                                    {title}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
            <SignOutButton redirectUrl='/sign-in'>
                <button className={cn(
                    'flex gap-3 cursor-pointer bg-woodsmoke2 rounded-md py-2 px-3 transition-all justify-center md:justify-start'
                )}>
                    <LogOut className='w-5 h-5 text-gray-400 shrink-0' />
                    <span className='text-sm text-gray-400 hidden md:inline whitespace-nowrap overflow-hidden'>
                        Log out
                    </span>
                </button>
            </SignOutButton>
        </div>
    )
}

export default SideBar