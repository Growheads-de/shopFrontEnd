import React, { Component } from 'react';
import { 
  Container, 
  Paper, 
  Box, 
  Typography, 
  Tabs, 
  Tab
} from '@mui/material';
import { Navigate } from 'react-router-dom';
import SocketContext from '../contexts/SocketContext.js';

// Import extracted components
import OrdersTab from '../components/profile/OrdersTab.js';
import SettingsTab from '../components/profile/SettingsTab.js';
import CartTab from '../components/profile/CartTab.js';

// Main Profile Page Component
class ProfilePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0,
      user: null,
      loading: true,
      redirect: false
    };
    this.checkLoginInterval = null;
  }

  componentDidMount() {
    this.checkUserLoggedIn();
    
    // Set up interval to regularly check login status
    this.checkLoginInterval = setInterval(this.checkUserLoggedIn, 1000);

    // Add storage event listener to detect when user logs out in other tabs
    window.addEventListener('storage', this.handleStorageChange);
  }

  componentWillUnmount() {
    // Clear interval and remove event listeners
    if (this.checkLoginInterval) {
      clearInterval(this.checkLoginInterval);
    }
    window.removeEventListener('storage', this.handleStorageChange);
  }

  checkUserLoggedIn = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      this.setState({ redirect: true, user: null });
      return;
    }
    
    try {
      const userData = JSON.parse(storedUser);
      if (!userData) {
        this.setState({ redirect: true, user: null });
      } else if (!this.state.user) {
        // Only update user if it's not already set
        this.setState({ user: userData, loading: false });
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      this.setState({ redirect: true, user: null });
    }

    // Once loading is complete
    if (this.state.loading) {
      this.setState({ loading: false });
    }
  }

  handleStorageChange = (e) => {
    if (e.key === 'user' && !e.newValue) {
      // User was removed from localStorage in another tab
      this.setState({ redirect: true, user: null });
    }
  }

  handleTabChange = (event, newValue) => {
    this.setState({ tabValue: newValue });
  };

  render() {
    // Redirect to login if not logged in
    if (this.state.redirect || (!this.state.loading && !this.state.user)) {
      return <Navigate to="/" />;
    }

    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#2e7d32', p: 3, color: 'white' }}>
            <Typography variant="h5" fontWeight="bold">
              Mein Profil
            </Typography>
            {this.state.user && (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {this.state.user.email}
              </Typography>
            )}
          </Box>
          
          <Box>
            <Tabs
              value={this.state.tabValue}
              onChange={this.handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
              TabIndicatorProps={{
                style: { backgroundColor: '#2e7d32' }
              }}
            >
              <Tab 
                label="Warenkorb" 
                sx={{ 
                  color: this.state.tabValue === 0 ? '#2e7d32' : 'inherit',
                  fontWeight: 'bold'
                }}
              />
               <Tab 
                label="Bestellungen" 
                sx={{ 
                  color: this.state.tabValue === 1 ? '#2e7d32' : 'inherit',
                  fontWeight: 'bold'
                }}
              />
              <Tab 
                label="Einstellungen" 
                sx={{ 
                  color: this.state.tabValue === 2 ? '#2e7d32' : 'inherit',
                  fontWeight: 'bold'
                }}
              />
 
            </Tabs>

            {this.state.tabValue === 0 && <CartTab />}
            {this.state.tabValue === 1 && <OrdersTab />}
            {this.state.tabValue === 2 && <SettingsTab socket={this.props.socket} />}

          </Box>
        </Paper>
      </Container>
    );
  }
}

// Wrap with socket context
class ProfilePageWithSocket extends Component {
  render() {
    return (
      <SocketContext.Consumer>
        {socket => <ProfilePage {...this.props} socket={socket} />}
      </SocketContext.Consumer>
    );
  }
}

export default ProfilePageWithSocket; 