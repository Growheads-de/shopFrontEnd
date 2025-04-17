import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import parse from 'html-react-parser';
// Initialize window object for storing messages
if (!window.chatMessages) {
  window.chatMessages = [];
}


const ChatAssistant = ({ open, onClose, socket }) => {
  const [messages, setMessages] = useState(window.chatMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Set up socket event listener
    socket.on('aiassyResponse', (response) => {
      const newBotMessage = {
        id: Date.now(),
        sender: 'bot',
        text: response.content,
      };
      
      // Update messages in component state
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, newBotMessage];
        // Store in window object
        window.chatMessages = updatedMessages;
        return updatedMessages;
      });
      
      setIsTyping(false);
    });

    // Clean up the event listener
    return () => {
      socket.off('aiassyResponse');
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = () => {
    const userMessage = inputValue.trim();
    if (!userMessage) return;

    const newUserMessage = {
      id: Date.now(),
      sender: 'user',
      text: userMessage,
    };

    // Update messages in component state
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, newUserMessage];
      // Store in window object
      window.chatMessages = updatedMessages;
      return updatedMessages;
    });
    
    setInputValue('');
    setIsTyping(true);

    // Emit message to socket server
    socket.emit('aiassyMessage', userMessage);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <Paper 
      elevation={4} 
      sx={{
        position: 'fixed',
        bottom: 80,
        right: 16,
        width: 550,
        height: 500,
        bgcolor: 'background.paper',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1300,
        overflow: 'hidden'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 1, 
          borderBottom: 1, 
          borderColor: 'divider',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderTopLeftRadius: 'inherit',
          borderTopRightRadius: 'inherit',
          flexShrink: 0,
        }}
      >
        <Typography variant="h6" component="div">
          AI Assistant
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'primary.contrastText' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.map((message) => (
          <Box 
            key={message.id} 
            sx={{ 
              display: 'flex', 
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: 1,
            }}
          >
            {message.sender === 'bot' && (
              <Avatar sx={{ bgcolor: 'primary.main', width: 30, height: 30 }}>
                <SmartToyIcon fontSize="small" />
              </Avatar>
            )}
            <Paper 
              elevation={1}
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: message.sender === 'user' ? 'secondary.light' : 'grey.200',
                maxWidth: '75%',
              }}
            >
              <Typography variant="body2">{parse(message.text)}</Typography>
            </Paper>
            {message.sender === 'user' && (
              <Avatar sx={{ bgcolor: 'secondary.main', width: 30, height: 30 }}>
                <PersonIcon fontSize="small" />
              </Avatar>
            )}
          </Box>
        ))}
        {isTyping && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <Avatar sx={{ bgcolor: 'primary.main', width: 30, height: 30 }}>
                <SmartToyIcon fontSize="small" />
              </Avatar>
            <Paper elevation={1} sx={{ p: 1, borderRadius: 2, bgcolor: 'grey.200', display: 'inline-flex', alignItems: 'center' }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">Typing...</Typography>
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>
      <Box 
        sx={{ 
          display: 'flex', 
          p: 1, 
          borderTop: 1, 
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <TextField 
          fullWidth 
          variant="outlined" 
          size="small" 
          placeholder="Type your message..." 
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <Button 
          variant="contained" 
          sx={{ ml: 1 }} 
          onClick={handleSendMessage}
          disabled={isTyping || !inputValue.trim()}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatAssistant; 