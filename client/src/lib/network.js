const wsUrl = `wss://${window.location.host}`.replace(/\/+$/, '');

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
