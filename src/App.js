import { ThemeProvider } from '@mui/material/styles';
import React, { Suspense, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Content from './components/Content.js';
import ProductDetailWithSocket from './components/ProductDetailPage.js';
import SocketProvider from './providers/SocketProvider.js';
import SocketContext from './contexts/SocketContext.js';
import config from './config.js';

import Header from './components/Header.js';
import Footer from './components/Footer.js';
import Home from './pages/Home.js';
// Import the new ChatAssistant component
import ChatAssistant from './components/ChatAssistant.js';
import ProfilePageWithSocket from './pages/ProfilePage.js';


// Import theme from separate file to reduce main bundle size
import theme from './theme.js';

// Loading component for suspense fallback
const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
    <CircularProgress color="primary" />
  </Box>
);

const deleteMessages = () => {
  console.log('Deleting messages');
  window.chatMessages = [];
}

// Convert App to a functional component to use hooks
const App = () => {
  // State to manage chat visibility
  const [isChatOpen, setChatOpen] = useState(false);

  // Handler to toggle chat visibility
  const handleChatToggle = () => {
    if(isChatOpen) window.messageDeletionTimeout = setTimeout(deleteMessages, 1000 * 60);
    if(!isChatOpen && window.messageDeletionTimeout) clearTimeout(window.messageDeletionTimeout);
    setChatOpen(!isChatOpen);
  };

  // Handler to close the chat
  const handleChatClose = () => {
    window.messageDeletionTimeout = setTimeout(deleteMessages, 1000 * 60);
    setChatOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={<Loading />}>
        <SocketProvider
          url={config.apiBaseUrl}
          fallbackUrl={config.fallbackUrl}
          fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <CircularProgress color="primary" />
            </Box>
          }
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
              bgcolor: 'background.default',
            }}
          >
            <Suspense fallback={<Loading />}>
              <Header />
              <Box sx={{ flexGrow: 1 }}>
                <Routes>
                  {/* Home page with text only */}
                  <Route path="/" element={<Home />} />

                  {/* Category page - Render Content in parallel */}
                  <Route 
                    path="/category/:categoryId" 
                    element={
                        <SocketContext.Consumer>
                          {socket => <Content socket={socket} />}
                        </SocketContext.Consumer>
                    }
                  />
                  {/* Single product page */}
                  <Route path="/product/:productId" element={<ProductDetailWithSocket />} />

                  {/* Search page - Render Content in parallel */}
                  <Route 
                    path="/search" 
                    element={
                        <SocketContext.Consumer>
                          {socket => <Content socket={socket} />}
                        </SocketContext.Consumer>
                    }
                  />

                  {/* Profile page */}
                  <Route path="/profile" element={<ProfilePageWithSocket />} />
                  
                  {/* Fallback for undefined routes */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>
              <Footer />
              {/* Chat AI Assistant FAB */}
              <Fab 
                color="primary" 
                aria-label="chat"
                size="small" 
                sx={{ 
                  position: 'fixed', 
                  bottom: 15, 
                  right: 15 
                }}
                onClick={handleChatToggle} // Attach toggle handler
              >
                <SmartToyIcon sx={{ fontSize: '1.2rem' }} />
              </Fab>
              {/* Conditionally render the Chat Assistant */}
              <SocketContext.Consumer>
                {socket => <ChatAssistant  open={isChatOpen} onClose={handleChatClose} socket={socket} />}
              </SocketContext.Consumer>
            </Suspense>
          </Box>
        </SocketProvider>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
