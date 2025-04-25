import React, { Component } from 'react';
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
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import parse, { domToReact } from 'html-react-parser';
import { Link } from 'react-router-dom';
// Initialize window object for storing messages
if (!window.chatMessages) {
  window.chatMessages = [];
}

// Function to convert markdown code blocks to HTML
const formatMarkdown = (text) => {
  // Replace code blocks with formatted HTML
  return text.replace(/```(.*?)\n([\s\S]*?)```/g, (match, language, code) => {
    return `<pre class="code-block" data-language="${language.trim()}"><code>${code.trim()}</code></pre>`;
  });
};

// Custom parser options to convert <a> tags to <Link> components and style code blocks
const parseOptions = {
  replace: (domNode) => {
    // Convert <a> tags to React Router Links
    if (domNode.name === 'a' && domNode.attribs && domNode.attribs.href) {
      const href = domNode.attribs.href;
      
      // Only convert internal links (not external URLs)
      if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('//')) {
        return (
          <Link to={href} style={{ color: 'inherit', textDecoration: 'underline' }}>
            {domToReact(domNode.children, parseOptions)}
          </Link>
        );
      }
    }
    
    // Style pre/code blocks
    if (domNode.name === 'pre' && domNode.attribs && domNode.attribs.class === 'code-block') {
      const language = domNode.attribs['data-language'] || '';
      return (
        <pre style={{ 
          backgroundColor: '#c0f5c0', 
          padding: '8px', 
          borderRadius: '4px',
          overflowX: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.9em',
          whiteSpace: 'pre-wrap',
          margin: '8px 0'
        }}>
          {language && <div style={{ marginBottom: '4px', color: '#666' }}>{language}</div>}
          {domToReact(domNode.children, parseOptions)}
        </pre>
      );
    }
  }
};

class ChatAssistant extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: window.chatMessages,
      inputValue: '',
      isTyping: false,
      isRecording: false,
      recordingTime: 0,
      mediaRecorder: null,
      audioChunks: []
    };
    
    this.messagesEndRef = React.createRef();
    this.recordingTimer = null;
  }
  
  componentDidMount() {
    // Set up socket event listener
    this.props.socket.on('aiassyResponse', this.handleBotResponse);
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (prevState.messages !== this.state.messages || prevState.isTyping !== this.state.isTyping) {
      this.scrollToBottom();
    }
  }
  
  componentWillUnmount() {
    // Clean up the event listener
    this.props.socket.off('aiassyResponse', this.handleBotResponse);
    this.stopRecording();
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
    }
  }
  
  handleBotResponse = (response) => {
    const newBotMessage = {
      id: Date.now(),
      sender: 'bot',
      text: response.content,
    };
    
    this.setState(prevState => {
      const updatedMessages = [...prevState.messages, newBotMessage];
      // Store in window object
      window.chatMessages = updatedMessages;
      return { 
        messages: updatedMessages,
        isTyping: false
      };
    });
  }
  
  scrollToBottom = () => {
    this.messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }
  
  handleInputChange = (event) => {
    this.setState({ inputValue: event.target.value });
  }
  
  handleSendMessage = () => {
    const userMessage = this.state.inputValue.trim();
    if (!userMessage) return;

    const newUserMessage = {
      id: Date.now(),
      sender: 'user',
      text: userMessage,
    };

    // Update messages in component state
    this.setState(prevState => {
      const updatedMessages = [...prevState.messages, newUserMessage];
      // Store in window object
      window.chatMessages = updatedMessages;
      return {
        messages: updatedMessages,
        inputValue: '',
        isTyping: true
      };
    }, () => {
      // Emit message to socket server after state is updated
      if (userMessage.trim()) this.props.socket.emit('aiassyMessage', userMessage);
    });
  }
  
  handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      this.handleSendMessage();
    }
  }
  
  startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];
      
      mediaRecorder.addEventListener("dataavailable", event => {
        audioChunks.push(event.data);
      });
      
      mediaRecorder.addEventListener("stop", () => {
        if (audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          this.sendAudioMessage(audioBlob);
        }
        
        // Stop all tracks on the stream to release the microphone
        stream.getTracks().forEach(track => track.stop());
      });
      
      // Start recording
      mediaRecorder.start();
      
      // Set up timer - limit to 60 seconds
      this.recordingTimer = setInterval(() => {
        this.setState(prevState => {
          const newTime = prevState.recordingTime + 1;
          
          // Auto-stop after 10 seconds
          if (newTime >= 10) {
            this.stopRecording();
          }
          
          return { recordingTime: newTime };
        });
      }, 1000);
      
      this.setState({
        isRecording: true,
        mediaRecorder,
        audioChunks,
        recordingTime: 0
      });
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check your browser permissions.");
    }
  };
  
  stopRecording = () => {
    const { mediaRecorder, isRecording } = this.state;
    
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
    }
    
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      this.setState({
        isRecording: false,
        recordingTime: 0
      });
    }
  };
  
  sendAudioMessage = async (audioBlob) => {
    // Create a URL for the audio blob
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Create a user message with audio content
    const newUserMessage = {
      id: Date.now(),
      sender: 'user',
      text: `<audio controls src="${audioUrl}"></audio>`,
      isAudio: true
    };
    
    // Update UI with the audio message
    this.setState(prevState => {
      const updatedMessages = [...prevState.messages, newUserMessage];
      // Store in window object
      window.chatMessages = updatedMessages;
      return {
        messages: updatedMessages,
        isTyping: true
      };
    });
    
    // Convert audio to base64 for sending to server
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      const base64Audio = reader.result.split(',')[1];
      // Send audio data to server
      this.props.socket.emit('aiassyAudioMessage', { 
        audio: base64Audio,
        format: 'wav'
      });
    };
  };
  
  formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  render() {
    const { open, onClose } = this.props;
    const { messages, inputValue, isTyping, isRecording, recordingTime } = this.state;
    
    if (!open) {
      return null;
    }

    console.log(this.formatTime(recordingTime));

    return (
      <Paper 
        elevation={4} 
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          width: 750,
          height: 700,
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
            Assistent - BETA
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
                  fontSize: '0.8em'
                }}
              >
                {message.text ? parse(formatMarkdown(message.text), parseOptions) : ''}
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
          <div ref={this.messagesEndRef} />
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
            autoComplete="off"
            autoFocus
            autoCapitalize="off"
            autoCorrect="off"
            placeholder={isRecording ? "Aufnahme läuft..." : "Nachricht eingeben..."} 
            value={inputValue}
            onChange={this.handleInputChange}
            onKeyDown={this.handleKeyDown}
            disabled={isRecording}
            slotProps={{
              input: { maxLength: 300 , endAdornment: isRecording && (
                <Typography variant="caption" color="primary" sx={{ mr: 1 }}>
                  {this.formatTime(recordingTime)}
                </Typography>
              )}
            }}
          />
          
          {isRecording ? (
            <IconButton 
              color="error"
              onClick={this.stopRecording}
              sx={{ ml: 1 }}
            >
              <StopIcon />
            </IconButton>
          ) : (
            <IconButton 
              color="primary"
              onClick={this.startRecording}
              sx={{ ml: 1 }}
              disabled={isTyping}
            >
              <MicIcon />
            </IconButton>
          )}
          
          <Button 
            variant="contained" 
            sx={{ ml: 1 }} 
            onClick={this.handleSendMessage}
            disabled={isTyping || isRecording}
          >
            Senden
          </Button>
        </Box>
      </Paper>
    );
  }
}

export default ChatAssistant; 