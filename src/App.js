import { ThemeProvider } from '@mui/material/styles';
import React, { Component, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// Lazy load components and custom components
const Header = lazy(() => import('./components/Header.js'));
const Content = lazy(() => import('./components/ContentWithRouter.js'));
const Footer = lazy(() => import('./components/Footer.js'));
const ProductDetailPage = lazy(() => import('./components/ProductDetailPage.js').then(module => ({
  default: module.ProductDetailWithSocket
})));
const Home = lazy(() => import('./pages/Home.js'));
const Cart = lazy(() => import('./pages/Cart.js'));
const Checkout = lazy(() => import('./pages/Checkout.js'));
const SocketProvider = lazy(() => import('./providers/SocketProvider.js'));

// Import theme from separate file to reduce main bundle size
import theme from './theme.js';

// Loading component for suspense fallback
const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
    <CircularProgress color="primary" />
  </Box>
);

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
    <Suspense fallback={<Loading />}>
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
    </Suspense>
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
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </SocketProvider>
        </Suspense>
      </ThemeProvider>
    );
  }
}

export default App; 
