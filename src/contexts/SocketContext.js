import React from 'react';

// Create a new context for Socket.IO
const SocketContext = React.createContext(null);

export const SocketConsumer = SocketContext.Consumer;
export default SocketContext; 