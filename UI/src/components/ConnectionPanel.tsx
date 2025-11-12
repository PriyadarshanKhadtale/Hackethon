import { useState } from 'react'

interface ConnectionPanelProps {
  connected: boolean
  onConnect: (command: string, args: string[]) => void
}

export default function ConnectionPanel({ connected, onConnect }: ConnectionPanelProps) {
  const [command, setCommand] = useState('npx')
  const [args, setArgs] = useState('-y @modelcontextprotocol/server-everything')

  const handleConnect = () => {
    const argsList = args.split(' ').filter(arg => arg.trim())
    onConnect(command, argsList)
  }

  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">MCP Connection</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Command
          </label>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            disabled={connected}
            placeholder="npx"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Arguments
          </label>
          <input
            type="text"
            value={args}
            onChange={(e) => setArgs(e.target.value)}
            disabled={connected}
            placeholder="-y @modelcontextprotocol/server-everything"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
          />
        </div>

        <button
          onClick={handleConnect}
          disabled={connected || !command.trim()}
          className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {connected ? 'Connected' : 'Connect to MCP'}
        </button>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Example MCP Servers:</strong>
          </p>
          <ul className="text-xs text-blue-700 mt-2 space-y-1">
            <li>• npx -y @modelcontextprotocol/server-everything</li>
            <li>• npx -y @modelcontextprotocol/server-filesystem</li>
            <li>• python -m mcp_server_git</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

