import express from 'express';
import { createServer } from 'http';
import { setupWebSocketServer } from './websocket';
import type { Message } from '@shared/schema';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

// Set up WebSocket server
const wss = setupWebSocketServer(httpServer);

// CORS middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://prizmpoc.web.app'],
  credentials: true
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { fromId, content, isFirstMessage } = req.body;
    
    // Create user message
    const userMessage: Message = {
      id: Date.now(),
      fromId,
      toId: 0, // AI assistant ID
      content,
      timestamp: new Date(),
      isAiAssistant: false
    };

    // Create AI response
    const aiMessage: Message = {
      id: Date.now() + 1,
      fromId: 0, // AI assistant ID
      toId: fromId,
      content: isFirstMessage 
        ? "I'm your AI assistant. How can I help you today?"
        : `I received your message: "${content}". I'm here to help!`,
      timestamp: new Date(),
      isAiAssistant: true
    };

    // Return both messages
    res.json([userMessage, aiMessage]);
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 