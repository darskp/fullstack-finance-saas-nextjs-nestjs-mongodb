import { CardProps } from '@/utils/types'
import Image from 'next/image'

const Card = ({
    title, imgSrc, value
}: CardProps) => {
    return (
        <div key={title} className='flex flex-col gap-2 border border-gray-300 rounded-3xl p-4 w-[16.2rem] shadow'>
           <Image src={imgSrc}
                height={32}
                width={32}
                alt='card-img'
            />
            <span className='text-xl font-medium mt-1'>{title}</span>
            <span className='font-semibold text-2xl'>${value}</span>
        </div>
    )
}

export default Card