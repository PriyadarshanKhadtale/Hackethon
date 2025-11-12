interface Tool {
  name: string
  description?: string
  inputSchema?: any
}

interface ToolsPanelProps {
  tools: Tool[]
  selectedTool: string
  onSelectTool: (toolName: string) => void
  onRefresh: () => void
}

export default function ToolsPanel({ tools, selectedTool, onSelectTool, onRefresh }: ToolsPanelProps) {
  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Available Tools</h2>
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh tools"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {tools.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No tools available</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {tools.map((tool) => (
            <button
              key={tool.name}
              onClick={() => onSelectTool(tool.name === selectedTool ? '' : tool.name)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                selectedTool === tool.name
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="font-medium text-gray-800">{tool.name}</div>
              {tool.description && (
                <div className="text-sm text-gray-600 mt-1">{tool.description}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {selectedTool && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
          <p className="text-xs text-purple-800">
            <strong>Selected:</strong> {selectedTool}
          </p>
          <p className="text-xs text-purple-700 mt-1">
            Your next message will use this tool
          </p>
        </div>
      )}
    </div>
  )
}

