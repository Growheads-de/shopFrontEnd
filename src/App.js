import { ThemeProvider } from '@mui/material/styles';
import React, { Component, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Content from './components/Content.js';
import ProductDetailWithSocket from './components/ProductDetailPage.js';
import SocketProvider from './providers/SocketProvider.js';
import SocketContext from './contexts/SocketContext.js';


import Header from './components/Header.js';
import Footer from './components/Footer.js';
import Home from './pages/Home.js';

const Cart = lazy(() => import('./pages/Cart.js'));
const Checkout = lazy(() => import('./pages/Checkout.js'));


// Import theme from separate file to reduce main bundle size
import theme from './theme.js';

// Loading component for suspense fallback
const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
    <CircularProgress color="primary" />
  </Box>
);

class App extends Component {

  render() {
    
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Suspense fallback={<Loading />}>
          <SocketProvider
            url="http://10.10.10.43:9303"
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
                              {socket => <Content someProp="someValue" socket={socket} />}
                            </SocketContext.Consumer>
                        }
                      />
                      {/* Single product page */}
                      <Route path="/product/:productId" element={<ProductDetailWithSocket />} />

                      {/* Cart page */}
                      <Route path="/cart" element={<Cart />} />

                      {/* Checkout page */}
                      <Route path="/checkout" element={<Checkout />} />

                      {/* Fallback for undefined routes */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Box>
                  <Footer />
                </Suspense>
              </Box>
          </SocketProvider>
        </Suspense>
      </ThemeProvider>
    );
  }
}

export default App;
