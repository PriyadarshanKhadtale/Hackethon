import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"]
  }
});

// Store MCP client instances per socket connection
const mcpClients = new Map<string, Client>();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Connect to MCP server
  socket.on('connect-mcp', async (config: { command: string; args?: string[] }) => {
    try {
      const client = new Client(
        {
          name: 'mcp-chat-client',
          version: '1.0.0',
        },
        {
          capabilities: {}
        }
      );

      // Create transport based on the provided command
      const transport = new StdioClientTransport({
        command: config.command,
        args: config.args || [],
      });

      await client.connect(transport);
      mcpClients.set(socket.id, client);

      // Get available tools from the MCP server
      const tools = await client.listTools();
      
      socket.emit('mcp-connected', {
        success: true,
        tools: tools.tools,
        message: 'Successfully connected to MCP server'
      });

      console.log(`MCP client connected for socket ${socket.id}`);
    } catch (error) {
      console.error('Error connecting to MCP server:', error);
      socket.emit('mcp-error', {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to connect to MCP server'
      });
    }
  });

  // Handle chat messages
  socket.on('send-message', async (data: { message: string; toolName?: string }) => {
    const client = mcpClients.get(socket.id);
    
    if (!client) {
      socket.emit('message-error', { error: 'MCP client not connected' });
      return;
    }

    try {
      socket.emit('message-status', { status: 'processing' });

      // If a tool is specified, call it
      if (data.toolName) {
        const result = await client.callTool({
          name: data.toolName,
          arguments: { query: data.message }
        });

        socket.emit('message-response', {
          role: 'assistant',
          content: JSON.stringify(result.content, null, 2),
          timestamp: new Date().toISOString()
        });
      } else {
        // Otherwise, list available resources or provide info
        const resources = await client.listResources();
        
        socket.emit('message-response', {
          role: 'assistant',
          content: `Available resources: ${JSON.stringify(resources.resources, null, 2)}`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('message-error', {
        error: error instanceof Error ? error.message : 'Failed to process message'
      });
    }
  });

  // List available tools
  socket.on('list-tools', async () => {
    const client = mcpClients.get(socket.id);
    
    if (!client) {
      socket.emit('tools-error', { error: 'MCP client not connected' });
      return;
    }

    try {
      const tools = await client.listTools();
      socket.emit('tools-list', { tools: tools.tools });
    } catch (error) {
      console.error('Error listing tools:', error);
      socket.emit('tools-error', {
        error: error instanceof Error ? error.message : 'Failed to list tools'
      });
    }
  });

  // Disconnect handler
  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);
    
    const client = mcpClients.get(socket.id);
    if (client) {
      try {
        await client.close();
      } catch (error) {
        console.error('Error closing MCP client:', error);
      }
      mcpClients.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 3002;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

