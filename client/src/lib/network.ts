// network.ts - Converted from JavaScript to TypeScript

// Properly construct WebSocket URL for the correct environment
const getWsUrl = (): string => {
  // Check if we're in development mode
  if (process.env.NODE_ENV !== 'production') {
    // Use the deployed server WebSocket URL
    // Note: You might need to adjust this URL based on your actual WebSocket endpoint
    return 'wss://us-central1-prizmpoc.cloudfunctions.net/hello-world';
  }
  
  // In production, derive from the current location
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const hostname = window.location.hostname;
  
  // For standard ports (80/443), browsers often omit the port
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