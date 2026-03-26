import AiChat from '@/components/AiChat'
import WithAuth from '@/hoc/WithAuth'

const AiChatPage = () => {
    return (
        <div className="flex-1 h-[calc(100vh-0px)] bg-tile flex flex-col transition-all duration-300">
            <div className='flex-1 min-h-0 overflow-hidden'>
                <AiChat />
            </div>
        </div>
    )
}

export default WithAuth(AiChatPage)
