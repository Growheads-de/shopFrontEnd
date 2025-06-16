import React, { Component } from 'react';
import io from 'socket.io-client';
import SocketContext from '../contexts/SocketContext.js';
import { isUserLoggedIn } from '../components/LoginComponent.js';

class SocketProvider extends Component {
  constructor(props) {
    super(props);
    this.socket = null;
    this.state = {
      connected: false,
      usingFallback: false
    };
  }

  connectToSocket(url) {
    if (this.socket) {
      this.socket.disconnect();
    }

    console.log(`SocketProvider: Connecting to socket server... ${url}`);
    
    this.socket = io(url, {
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      
      const user = isUserLoggedIn();
      console.log('SocketProvider: connected',user);

      // Check for ID parameter in URL and emit setId if present
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      if (id) {
        console.log('SocketProvider: Emitting setId with ID:', id);
        this.socket.emit('setId', { id });
      }
      
      if(user && user.isLoggedIn && user.user.token) this.socket.emit('verifyToken', { token: user.user.token }, (response) => {
        console.log('SocketProvider: verifyToken', response);
        if (response.success) {
          try{
            window.cart = JSON.parse(response.user.cart);
            window.dispatchEvent(new CustomEvent('cart'));
          }catch(error){
            console.error('Error parsing cart  :',response.user, error);
          }
        }
        else{
          sessionStorage.removeItem('user');
          window.location.reload();
        }
      });
      this.setState({ connected: true });
      console.log('SocketProvider: Socket connected successfully');
    });

    this.socket.on('disconnect', () => {
      this.setState({ connected: false });
      console.log('SocketProvider: Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('SocketProvider: Connection error:', error);
      if (!this.state.usingFallback && this.props.fallbackUrl) {
        console.log('SocketProvider: Attempting to connect to fallback URL...');
        this.setState({ usingFallback: true });
        this.connectToSocket(this.props.fallbackUrl);
      }
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`SocketProvider: Reconnection attempt ${attemptNumber}`);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('SocketProvider: Failed to reconnect');
      if (!this.state.usingFallback && this.props.fallbackUrl) {
        console.log('SocketProvider: Attempting to connect to fallback URL...');
        this.setState({ usingFallback: true });
        this.connectToSocket(this.props.fallbackUrl);
      }
    });
  }

  componentDidMount() {
    this.connectToSocket(this.props.url);
  }

  componentWillUnmount() {
    if (this.socket) {
      console.log('SocketProvider: Disconnecting socket');
      this.socket.disconnect();
    }
  }

  render() {  
    return (
      <SocketContext.Provider value={this.socket}>
        {this.state.connected ? this.props.children : (this.props.fallback || null)}
      </SocketContext.Provider>
    );
  }
}

export default SocketProvider; 
