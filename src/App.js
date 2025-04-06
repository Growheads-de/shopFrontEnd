import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import React, { Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.js';
import Content from './components/Content.js';
import Footer from './components/Footer.js';
import SocketProvider from './providers/SocketProvider.js';
import { ProductDetailPage } from './components/Product.js';

// Import pages
import Home from './pages/Home.js';
import Cart from './pages/Cart.js';
import Checkout from './pages/Checkout.js';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32', // Forest green
      light: '#4CAF50', // Regular green
      dark: '#1B5E20', // Dark green
    },
    secondary: {
      main: '#81C784', // Light green
      light: '#A5D6A7', // Very light green
      dark: '#66BB6A', // Mid green
    },
    background: {
      default: '#F1F8E9', // Very light green background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#33691E', // Dark green text
      secondary: '#558B2F', // Mid green text
    },
    success: {
      main: '#43A047', // Green success
    },
    error: {
      main: '#D32F2F', // Keep red for errors/out of stock
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 600,
      color: '#33691E',
    },
  },
});

// Main App Content
const AppContent = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      bgcolor: 'background.default',
    }}
  >
    <Header />
    <Routes>
      {/* Home page with text only */}
      <Route path="/" element={<Home />} />

      {/* Products page */}
      <Route path="/products" element={<Content />} />

      {/* Search results page */}
      <Route path="/search" element={<Content />} />

      {/* Category page */}
      <Route path="/category/:categoryId" element={<Content />} />

      {/* Single product page */}
      <Route path="/product/:productId" element={<ProductDetailPage />} />

      {/* Cart page */}
      <Route path="/cart" element={<Cart />} />

      {/* Checkout page */}
      <Route path="/checkout" element={<Checkout />} />

      {/* Fallback for undefined routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <Footer />
  </Box>
);

class App extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SocketProvider 
          url="http://192.168.178.58:9303"
          fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <CircularProgress color="primary" />
            </Box>
          }
        >
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </SocketProvider>
      </ThemeProvider>
    );
  }
}

export default App; 
