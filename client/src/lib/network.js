// Properly construct WebSocket URL with the correct host and port
const getWsUrl = () => {
  // Get the base hostname without port
  const hostname = window.location.hostname;
  // Get the port if specified, or use default port
  const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
  
  // Create WebSocket URL, ensuring no trailing slashes
  return `wss://${hostname}${port !== '443' ? `:${port}` : ''}`.replace(/\/+$/, '');
};

const wsUrl = getWsUrl();
console.log("WebSocket URL:", wsUrl);

// Safely construct WebSocket URL with proper error handling
function createWebSocketConnection() {
  try {
    // Remove trailing slashes and ensure proper URL format
    const url = wsUrl;
    console.log("Connecting to WebSocket at:", url);
    return new WebSocket(url);
  } catch (error) {
    console.error("Error creating WebSocket connection:", error);
    // Return null instead of an invalid WebSocket
    return null;
  }
}

// Export the function to create WebSocket connections
export { createWebSocketConnection };
