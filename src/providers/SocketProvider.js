import React, { Component } from 'react';
import io from 'socket.io-client';
import SocketContext from '../contexts/SocketContext.js';

class SocketProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: null,
      connected: false
    };
  }

  componentDidMount() {
    // Use http/https protocol for the URL, not ws
    const serverUrl = this.props.url;
    console.log('SocketProvider: Connecting to socket server...', serverUrl);
    
    // Connect to the Socket.IO server
    const socket = io(serverUrl, {
      transports: ['websocket']
    });

    // Set up event listeners
    socket.on('connect', () => {
      this.setState({ connected: true });
      console.log('SocketProvider: Socket connected successfully');
    });

    socket.on('disconnect', () => {
      this.setState({ connected: false });
      console.log('SocketProvider: Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('SocketProvider: Connection error:', error);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`SocketProvider: Reconnection attempt ${attemptNumber}`);
    });

    socket.on('reconnect_failed', () => {
      console.error('SocketProvider: Failed to reconnect');
    });

    // Store the socket instance in state
    this.setState({ socket });
  }

  componentWillUnmount() {
    // Clean up the socket connection when the component unmounts
    if (this.state.socket) {
      console.log('SocketProvider: Disconnecting socket');
      this.state.socket.disconnect();
    }
  }

  render() {
    console.log('SocketProvider: Rendering, connected =', this.state.connected);
    
    return (
      <SocketContext.Provider value={this.state.socket}>
        {this.state.connected ? this.props.children : (this.props.fallback || null)}
      </SocketContext.Provider>
    );
  }
}

export default SocketProvider; 
