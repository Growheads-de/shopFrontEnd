import { ThemeProvider } from '@mui/material/styles';
import React, { Suspense, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Content from './components/Content.js';
import ProductDetailWithSocket from './components/ProductDetailWithSocket.js';
import SocketProvider from './providers/SocketProvider.js';
import SocketContext from './contexts/SocketContext.js';
import config from './config.js';
import ScrollToTop from './components/ScrollToTop.js';

import Header from './components/Header.js';
import Footer from './components/Footer.js';
import Home from './pages/Home.js';
import AdminPage from './pages/AdminPage.js';
// Import the new ChatAssistant component
import ChatAssistant from './components/ChatAssistant.js';
import ProfilePageWithSocket from './pages/ProfilePage.js';
import ResetPassword from './pages/ResetPassword.js';
// Import legal pages
import Datenschutz from './pages/Datenschutz.js';
import AGB from './pages/AGB.js';
import Sitemap from './pages/Sitemap.js';
import Impressum from './pages/Impressum.js';
import Batteriegesetzhinweise from './pages/Batteriegesetzhinweise.js';
import Widerrufsrecht from './pages/Widerrufsrecht.js';

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
  
  // Get current location
  const location = useLocation();
  
  // Extract categoryId from pathname if on category route
  const getCategoryId = () => {
    const match = location.pathname.match(/^\/category\/(.+)$/);
    return match ? match[1] : null;
  };
  
  const categoryId = getCategoryId();

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
              mb: 0,
              pb: 0,
              bgcolor: 'background.default'
            }}
          >
            <Suspense fallback={<Loading />}>
              <ScrollToTop />
              <Header active categoryId={categoryId} />
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

                  {/* Reset password page */}
                  <Route path="/resetPassword" element={
                    <SocketContext.Consumer>
                      {socket => <ResetPassword socket={socket} />}
                    </SocketContext.Consumer>
                  } />

                  {/* Admin page */ }
                  <Route path="/admin" element={<SocketContext.Consumer>{socket =><AdminPage socket={socket}/>}</SocketContext.Consumer>}/>

                  {/* Legal pages */}
                  <Route path="/datenschutz" element={<Datenschutz />} />
                  <Route path="/agb" element={<AGB />} />
                  <Route path="/sitemap" element={<Sitemap />} />
                  <Route path="/impressum" element={<Impressum />} />
                  <Route path="/batteriegesetzhinweise" element={<Batteriegesetzhinweise />} />
                  <Route path="/widerrufsrecht" element={<Widerrufsrecht />} />
                  
                  {/* Fallback for undefined routes */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>
              {/* Conditionally render the Chat Assistant */}
              <SocketContext.Consumer>
                {socket => <ChatAssistant  open={isChatOpen} onClose={handleChatClose} socket={socket} />}
              </SocketContext.Consumer>

              {/* Chat AI Assistant FAB */}
              <Fab 
                color="primary" 
                aria-label="chat"
                size="small" 
                sx={{ 
                  position: 'fixed', 
                  bottom: 31, 
                  right: 15 
                }}
                onClick={handleChatToggle} // Attach toggle handler
              >
                <SmartToyIcon sx={{ fontSize: '1.2rem' }} />
              </Fab>

              <Footer />


            </Suspense>
          </Box>
        </SocketProvider>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
