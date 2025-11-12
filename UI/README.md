# MCP Chat Interface

A modern, beautiful chat interface for connecting to MCP (Model Context Protocol) servers.

## Features

- 🎨 Modern, gradient UI with Tailwind CSS
- 🔌 Real-time connection to MCP servers via WebSocket
- 🛠️ Dynamic tool discovery and usage
- 💬 Clean chat interface with message history
- ⚡ Built with React, TypeScript, and Vite

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:

```bash
npm install
```

### Running the Application

Start both the frontend and backend servers:

```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Connecting to an MCP Server

1. In the "MCP Connection" panel, enter the command and arguments for your MCP server
2. Click "Connect to MCP"

Example configurations:

**Everything Server (recommended for testing):**
- Command: `npx`
- Args: `-y @modelcontextprotocol/server-everything`

**Filesystem Server:**
- Command: `npx`
- Args: `-y @modelcontextprotocol/server-filesystem /path/to/directory`

**Git Server:**
- Command: `python`
- Args: `-m mcp_server_git`

### Using Tools

Once connected:
1. Available tools will appear in the "Available Tools" panel
2. Click a tool to select it
3. Type your message and send - it will use the selected tool
4. Click the tool again to deselect it

## Architecture

### Frontend (`/src`)
- **App.tsx**: Main application component with WebSocket connection
- **components/ChatMessage.tsx**: Individual chat message component
- **components/ConnectionPanel.tsx**: MCP connection configuration
- **components/ToolsPanel.tsx**: Tool selection interface

### Backend (`/server`)
- **index.ts**: Express server with Socket.IO for real-time communication
- Manages MCP client connections per socket
- Handles tool discovery and execution

## Development

### Run Frontend Only
```bash
npm run dev:client
```

### Run Backend Only
```bash
npm run dev:server
```

### Build for Production
```bash
npm run build
```

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, Socket.IO
- **MCP**: @modelcontextprotocol/sdk
- **Real-time Communication**: Socket.IO

## Troubleshooting

### Connection Issues
- Ensure the backend server is running on port 3001
- Check that the MCP server command is correct and the package is installed
- Verify Node.js version is 18 or higher

### Tool Execution Errors
- Make sure the tool accepts the parameters being sent
- Check the browser console for detailed error messages
- Verify the MCP server is running correctly

## License

MIT

