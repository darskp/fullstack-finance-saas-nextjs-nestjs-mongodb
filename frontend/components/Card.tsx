import { CardProps } from '@/utils/types'
import { formatAmount } from '@/utils/helpers'
import Image from 'next/image'

const Card = ({
    title, imgSrc, value
}: CardProps) => {
    return (
        <div key={title} className='flex items-center gap-4 border border-gray-300 rounded-2xl p-3 flex-1 shadow-sm bg-white'>
            <div className='bg-gray-100 p-2 rounded-xl h-fit'>
                <Image src={imgSrc}
                    height={28}
                    width={28}
                    alt='card-img'
                    className='opacity-80'
                />
            </div>
            <div className='flex flex-col'>
                <span className='text-sm text-gray-500 font-medium whitespace-nowrap'>{title}</span>
                <span className='font-bold text-xl lg:text-2xl whitespace-nowrap'>${formatAmount(value)}</span>
            </div>
        </div>
    )
}

export default Card