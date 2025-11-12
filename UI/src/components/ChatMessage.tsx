interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-full">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isUser ? 'order-1' : 'order-2'}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          <div className="text-xs font-medium mb-1 opacity-75">
            {isUser ? 'You' : 'Assistant'}
          </div>
          <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
        </div>
        <div className="text-xs text-gray-400 mt-1 px-2">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}

