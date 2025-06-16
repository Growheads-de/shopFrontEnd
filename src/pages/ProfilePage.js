import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Paper, 
  Box, 
  Typography, 
  Tabs, 
  Tab,
  CircularProgress
} from '@mui/material';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import SocketContext from '../contexts/SocketContext.js';

// Import extracted components
import OrdersTab from '../components/profile/OrdersTab.js';
import SettingsTab from '../components/profile/SettingsTab.js';
import CartTab from '../components/profile/CartTab.js';
import LoginComponent from '../components/LoginComponent.js';

// Functional Profile Page Component
const ProfilePage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [orderIdFromHash, setOrderIdFromHash] = useState(null);

  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.startsWith('#ORD-')) {
      const orderId = hash.substring(1);
      setOrderIdFromHash(orderId);
      setTabValue(1); // Switch to Orders tab
    }
  }, [location.hash]);

  useEffect(() => {
    const checkUserLoggedIn = () => {
      const storedUser = sessionStorage.getItem('user');
      if (!storedUser) {
        setShowLogin(true);
        setUser(null);
        return;
      }
      
      try {
        const userData = JSON.parse(storedUser);
        if (!userData) {
          setShowLogin(true);
          setUser(null);
        } else if (!user) {
          setUser(userData);
          setShowLogin(false); // Hide login on successful user load
        }
      } catch (error) {
        console.error('Error parsing user from sessionStorage:', error);
        setShowLogin(true);
        setUser(null);
      }

      if (loading) {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
    const checkLoginInterval = setInterval(checkUserLoggedIn, 1000);

    const handleStorageChange = (e) => {
      if (e.key === 'user' && !e.newValue) {
        // User was removed from sessionStorage in another tab
        setShowLogin(true);
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(checkLoginInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, loading]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleGoToOrders = () => {
    setTabValue(1);
  };

  const handleLoginClose = () => {
    setShowLogin(false);
    // If user closes login without logging in, redirect to home.
    const storedUser = sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/', { replace: true });
    }
  }

  if (showLogin) {
    return <LoginComponent open={showLogin} handleClose={handleLoginClose} location={location} socket={props.socket} />;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: '#2e7d32', p: 3, color: 'white' }}>
          <Typography variant="h5" fontWeight="bold">
            Mein Profil
          </Typography>
          {user && (
            <Typography variant="body1" sx={{ mt: 1 }}>
              {user.email}
            </Typography>
          )}
        </Box>
        
        <Box>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
            TabIndicatorProps={{
              style: { backgroundColor: '#2e7d32' }
            }}
          >
            <Tab 
              label="Warenkorb" 
              sx={{ 
                color: tabValue === 0 ? '#2e7d32' : 'inherit',
                fontWeight: 'bold'
              }}
            />
             <Tab 
              label="Bestellungen" 
              sx={{ 
                color: tabValue === 1 ? '#2e7d32' : 'inherit',
                fontWeight: 'bold'
              }}
            />
            <Tab 
              label="Einstellungen" 
              sx={{ 
                color: tabValue === 2 ? '#2e7d32' : 'inherit',
                fontWeight: 'bold'
              }}
            />
          </Tabs>

          {tabValue === 0 && <CartTab onOrderSuccess={handleGoToOrders}/>}
          {tabValue === 1 && <OrdersTab orderIdFromHash={orderIdFromHash} />}
          {tabValue === 2 && <SettingsTab socket={props.socket} />}

        </Box>
      </Paper>
    </Container>
  );
};

// Wrap with socket context
const ProfilePageWithSocket = (props) => {
  const socket = useContext(SocketContext);
  return <ProfilePage {...props} socket={socket} />;
};

export default ProfilePageWithSocket; 