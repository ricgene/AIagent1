// network.ts - Converted from JavaScript to TypeScript

// Properly construct WebSocket URL with the correct host and port
const getWsUrl = (): string => {
  // Get the protocol, hostname, and port
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const hostname = window.location.hostname;
  
  // For standard ports (80/443), browsers often omit the port
  // So we need to determine if we should add it explicitly
  const port = window.location.port || 
               (window.location.protocol === 'https:' ? '443' : '80');
  
  // Only include non-standard ports in the URL
  const portSuffix = 
    (protocol === 'wss:' && port !== '443') || 
    (protocol === 'ws:' && port !== '80') 
      ? `:${port}` 
      : '';
  
  // Create WebSocket URL
  return `${protocol}//${hostname}${portSuffix}`;
};

// Safely construct WebSocket connection
function createWebSocketConnection(): WebSocket | null {
  try {
    const url = getWsUrl();
    console.log("Connecting to WebSocket at:", url);
    
    // Create the WebSocket with proper error handling
    const ws = new WebSocket(`${url}/ws`);
    
    // Add error handlers
    ws.addEventListener('error', (error: Event) => {
      console.error("WebSocket connection error:", error);
    });
    
    ws.addEventListener('open', () => {
      console.log("WebSocket connection established successfully");
    });
    
    ws.addEventListener('close', (event: CloseEvent) => {
      console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
    });
    
    return ws;
  } catch (error) {
    console.error("Error creating WebSocket connection:", error);
    return null;
  }
}

// Export the function to create WebSocket connections
export { createWebSocketConnection };