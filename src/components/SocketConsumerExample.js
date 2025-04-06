import React, { Component } from 'react';
import SocketContext from '../contexts/SocketContext';

class SocketConsumerExample extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      messageInput: ''
    };
  }

  componentDidMount() {
    // Access the socket from context via props
    const { socket } = this.props;
    
    if (socket) {
      // Listen for incoming messages
      socket.on('message', (data) => {
        this.setState((prevState) => ({
          messages: [...prevState.messages, data]
        }));
      });
    }
  }

  componentWillUnmount() {
    const { socket } = this.props;
    if (socket) {
      socket.off('message');
    }
  }

  handleInputChange = (e) => {
    this.setState({ messageInput: e.target.value });
  }

  sendMessage = () => {
    const { socket } = this.props;
    const { messageInput } = this.state;
    
    if (socket && messageInput.trim()) {
      socket.emit('message', messageInput);
      this.setState({ messageInput: '' });
    }
  }

  render() {
    const { messages, messageInput } = this.state;
    const { socket } = this.props;
    
    return (
      <div>
        <h2>Socket.IO Example</h2>
        {socket ? (
          <div>
            <p>Socket Status: {socket.connected ? 'Connected' : 'Disconnected'}</p>
            
            <div>
              <h3>Messages:</h3>
              <ul>
                {messages.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <input 
                type="text" 
                value={messageInput}
                onChange={this.handleInputChange}
                placeholder="Type a message..."
              />
              <button onClick={this.sendMessage}>Send</button>
            </div>
          </div>
        ) : (
          <p>Socket not connected</p>
        )}
      </div>
    );
  }
}

// Create a higher-order component that wraps the consumer component 
// with the SocketContext.Consumer
export default function withSocket(Component) {
  return function SocketWrapper(props) {
    return (
      <SocketContext.Consumer>
        {socket => <Component {...props} socket={socket} />}
      </SocketContext.Consumer>
    );
  };
}

// Export the component wrapped with the socket context
export const SocketConsumerExampleWithSocket = withSocket(SocketConsumerExample); 