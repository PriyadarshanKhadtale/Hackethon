import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import ChatMessage from './components/ChatMessage'
import ConnectionPanel from './components/ConnectionPanel'
import ToolsPanel from './components/ToolsPanel'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

interface Tool {
  name: string
  description?: string
  inputSchema?: any
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [mcpConnected, setMcpConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [tools, setTools] = useState<Tool[]>([])
  const [selectedTool, setSelectedTool] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const newSocket = io('http://localhost:3002')
    setSocket(newSocket)

    newSocket.on('connect', () => {
      setConnected(true)
      addSystemMessage('Connected to server')
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
      setMcpConnected(false)
      addSystemMessage('Disconnected from server')
    })

    newSocket.on('mcp-connected', (data) => {
      setMcpConnected(true)
      setTools(data.tools || [])
      addSystemMessage(data.message)
    })

    newSocket.on('mcp-error', (data) => {
      addSystemMessage(`Error: ${data.message}`)
    })

    newSocket.on('message-response', (data) => {
      setIsProcessing(false)
      addMessage(data.role, data.content)
    })

    newSocket.on('message-error', (data) => {
      setIsProcessing(false)
      addSystemMessage(`Error: ${data.error}`)
    })

    newSocket.on('message-status', (data) => {
      if (data.status === 'processing') {
        setIsProcessing(true)
      }
    })

    newSocket.on('tools-list', (data) => {
      setTools(data.tools || [])
    })

    return () => {
      newSocket.close()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = (role: 'user' | 'assistant' | 'system', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date().toISOString()
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const addSystemMessage = (content: string) => {
    addMessage('system', content)
  }

  const handleConnectMCP = (command: string, args: string[]) => {
    if (socket) {
      socket.emit('connect-mcp', { command, args })
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputMessage.trim() || !socket || !mcpConnected) return

    addMessage('user', inputMessage)
    
    socket.emit('send-message', {
      message: inputMessage,
      toolName: selectedTool || undefined
    })

    setInputMessage('')
  }

  const handleRefreshTools = () => {
    if (socket && mcpConnected) {
      socket.emit('list-tools')
    }
  }

  return (
    <div className="min-h-screen flex flex-col p-4">
      <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col gap-4">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            MCP Chat Interface
          </h1>
          <div className="flex gap-3 mt-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {connected ? '● Server Connected' : '○ Server Disconnected'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              mcpConnected ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {mcpConnected ? '● MCP Connected' : '○ MCP Disconnected'}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Connection & Tools Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <ConnectionPanel 
              connected={mcpConnected}
              onConnect={handleConnectMCP}
            />
            {mcpConnected && (
              <ToolsPanel 
                tools={tools}
                selectedTool={selectedTool}
                onSelectTool={setSelectedTool}
                onRefresh={handleRefreshTools}
              />
            )}
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 bg-white/95 backdrop-blur rounded-2xl shadow-xl flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="mt-4 text-lg">No messages yet</p>
                    <p className="text-sm">Connect to an MCP server and start chatting</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))
              )}
              {isProcessing && (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                  <span>Processing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={mcpConnected ? "Type your message..." : "Connect to MCP server first..."}
                  disabled={!mcpConnected || isProcessing}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!mcpConnected || !inputMessage.trim() || isProcessing}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Send
                </button>
              </form>
              {selectedTool && (
                <div className="mt-2 text-sm text-gray-600">
                  Using tool: <span className="font-medium text-purple-600">{selectedTool}</span>
                  <button
                    onClick={() => setSelectedTool('')}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

