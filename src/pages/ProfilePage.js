import React, { Component } from 'react';
import { 
  Container, 
  Paper, 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import { Navigate } from 'react-router-dom';
import SocketContext from '../contexts/SocketContext.js';
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

// Orders Tab Content Component
class OrdersTab extends Component {
  constructor(props) {
    super(props);
    
    // Mock order data with updated status values
    this.mockOrders = [
      /*{ id: '12345', date: '2023-10-15', status: 'Geliefert', total: '€120.50', items: 3 },
      { id: '12346', date: '2023-09-28', status: 'Wird bearbeitet', total: '€85.20', items: 2 },
      { id: '12347', date: '2023-08-05', status: 'Verschickt', total: '€210.00', items: 5 },
      { id: '12348', date: '2023-07-12', status: 'Neu', total: '€45.75', items: 1 },
      { id: '12349', date: '2023-06-22', status: 'Storniert', total: '€150.00', items: 4 },
      { id: '12350', date: '2023-05-18', status: 'Retoure', total: '€89.99', items: 2 },
      { id: '12351', date: '2023-04-10', status: 'Teil Retoure', total: '€125.50', items: 3 },
      { id: '12352', date: '2023-03-25', status: 'Teil geliefert', total: '€199.00', items: 5 },*/
    ];

    // Emoji mapping for order status
    this.statusEmojis = {
      'Neu': '🆕',
      'Wird bearbeitet': '⚙️',
      'Verschickt': '🚚',
      'Geliefert': '✅',
      'Storniert': '❌',
      'Retoure': '↩️',
      'Teil Retoure': '↪️',
      'Teil geliefert': '⚡'
    };
    
    // Status colors
    this.statusColors = {
      'Neu': '#1976d2', // blue
      'Wird bearbeitet': '#ed6c02', // orange
      'Verschickt': '#2e7d32', // green
      'Geliefert': '#2e7d32', // green
      'Storniert': '#d32f2f', // red
      'Retoure': '#9c27b0', // purple
      'Teil Retoure': '#9c27b0', // purple
      'Teil geliefert': '#009688' // teal
    };
  }

  getStatusEmoji = (status) => {
    return this.statusEmojis[status] || '❓';
  }

  getStatusColor = (status) => {
    return this.statusColors[status] || '#757575'; // default gray
  }

  handleViewDetails = (orderId) => {
    console.log(`View details for order: ${orderId}`);
    // Implementation for viewing order details
  }

  handleDownloadPdf = (orderId) => {
    console.log(`Download PDF for order: ${orderId}`);
    // Implementation for downloading order PDF
  }

  render() {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Meine Bestellungen</Typography>
        
        {this.mockOrders.length > 0 ? (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bestellnummer</TableCell>
                  <TableCell>Datum</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Artikel</TableCell>
                  <TableCell align="right">Summe</TableCell>
                  <TableCell align="center">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.mockOrders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        color: this.getStatusColor(order.status)
                      }}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {this.getStatusEmoji(order.status)}
                        </span>
                        <span style={{ fontWeight: 'medium' }}>
                          {order.status}
                        </span>
                      </Box>
                    </TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell align="right">{order.total}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Details anzeigen">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => this.handleViewDetails(order.id)}
                        >
                          <SearchIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="PDF herunterladen">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => this.handleDownloadPdf(order.id)}
                        >
                          <PictureAsPdfIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            Sie haben noch keine Bestellungen aufgegeben.
          </Alert>
        )}
      </Box>
    );
  }
}

// Settings Tab Content Component
class SettingsTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      password: '',
      newEmail: '',
      passwordError: '',
      passwordSuccess: '',
      emailError: '',
      emailSuccess: '',
      loading: false
    };
  }

  componentDidMount() {
    // Load user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.setState({ newEmail: user.email || '' });
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
  }

  handleUpdatePassword = (e) => {
    e.preventDefault();
    
    // Reset states
    this.setState({
      passwordError: '',
      passwordSuccess: ''
    });
    
    // Validation
    if (!this.state.currentPassword || !this.state.newPassword || !this.state.confirmPassword) {
      this.setState({ passwordError: 'Bitte füllen Sie alle Felder aus' });
      return;
    }
    
    if (this.state.newPassword !== this.state.confirmPassword) {
      this.setState({ passwordError: 'Die neuen Passwörter stimmen nicht überein' });
      return;
    }
    
    if (this.state.newPassword.length < 8) {
      this.setState({ passwordError: 'Das neue Passwort muss mindestens 8 Zeichen lang sein' });
      return;
    }
    
    this.setState({ loading: true });
    
    // Call socket.io endpoint to update password
    this.props.socket.emit('updatePassword', 
      { oldPassword: this.state.currentPassword, newPassword: this.state.newPassword }, 
      (response) => {
        this.setState({ loading: false });
        
        if (response.success) {
          this.setState({
            passwordSuccess: 'Passwort erfolgreich aktualisiert',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        } else {
          this.setState({
            passwordError: response.message || 'Fehler beim Aktualisieren des Passworts'
          });
        }
      }
    );
  };
  
  handleUpdateEmail = (e) => {
    e.preventDefault();
    
    // Reset states
    this.setState({
      emailError: '',
      emailSuccess: ''
    });
    
    // Validation
    if (!this.state.password || !this.state.newEmail) {
      this.setState({ emailError: 'Bitte füllen Sie alle Felder aus' });
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.newEmail)) {
      this.setState({ emailError: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' });
      return;
    }
    
    this.setState({ loading: true });
    
    // Call socket.io endpoint to update email
    this.props.socket.emit('updateEmail', 
      { password: this.state.password, email: this.state.newEmail }, 
      (response) => {
        this.setState({ loading: false });
        
        if (response.success) {
          this.setState({
            emailSuccess: 'E-Mail-Adresse erfolgreich aktualisiert',
            password: ''
          });
          
          // Update user in localStorage
          try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              const user = JSON.parse(storedUser);
              user.email = this.state.newEmail;
              localStorage.setItem('user', JSON.stringify(user));
            }
          } catch (error) {
            console.error('Error updating user in localStorage:', error);
          }
        } else {
          this.setState({
            emailError: response.message || 'Fehler beim Aktualisieren der E-Mail-Adresse'
          });
        }
      }
    );
  };
  
  render() {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Kontoeinstellungen</Typography>
        
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Passwort ändern
          </Typography>
          
          {this.state.passwordError && <Alert severity="error" sx={{ mb: 2 }}>{this.state.passwordError}</Alert>}
          {this.state.passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>{this.state.passwordSuccess}</Alert>}
          
          <Box component="form" onSubmit={this.handleUpdatePassword}>
            <TextField
              margin="normal"
              label="Aktuelles Passwort"
              type="password"
              fullWidth
              value={this.state.currentPassword}
              onChange={(e) => this.setState({ currentPassword: e.target.value })}
              disabled={this.state.loading}
            />
            
            <TextField
              margin="normal"
              label="Neues Passwort"
              type="password"
              fullWidth
              value={this.state.newPassword}
              onChange={(e) => this.setState({ newPassword: e.target.value })}
              disabled={this.state.loading}
            />
            
            <TextField
              margin="normal"
              label="Neues Passwort bestätigen"
              type="password"
              fullWidth
              value={this.state.confirmPassword}
              onChange={(e) => this.setState({ confirmPassword: e.target.value })}
              disabled={this.state.loading}
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2, bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
              disabled={this.state.loading}
            >
              {this.state.loading ? <CircularProgress size={24} /> : 'Passwort aktualisieren'}
            </Button>
          </Box>
        </Paper>
        
        <Divider sx={{ my: 4 }} />
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            E-Mail-Adresse ändern
          </Typography>
          
          {this.state.emailError && <Alert severity="error" sx={{ mb: 2 }}>{this.state.emailError}</Alert>}
          {this.state.emailSuccess && <Alert severity="success" sx={{ mb: 2 }}>{this.state.emailSuccess}</Alert>}
          
          <Box component="form" onSubmit={this.handleUpdateEmail}>
            <TextField
              margin="normal"
              label="Passwort"
              type="password"
              fullWidth
              value={this.state.password}
              onChange={(e) => this.setState({ password: e.target.value })}
              disabled={this.state.loading}
            />
            
            <TextField
              margin="normal"
              label="Neue E-Mail-Adresse"
              type="email"
              fullWidth
              value={this.state.newEmail}
              onChange={(e) => this.setState({ newEmail: e.target.value })}
              disabled={this.state.loading}
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2, bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
              disabled={this.state.loading}
            >
              {this.state.loading ? <CircularProgress size={24} /> : 'E-Mail aktualisieren'}
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }
}

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
                label="Bestellungen" 
                sx={{ 
                  color: this.state.tabValue === 0 ? '#2e7d32' : 'inherit',
                  fontWeight: 'bold'
                }}
              />
              <Tab 
                label="Einstellungen" 
                sx={{ 
                  color: this.state.tabValue === 1 ? '#2e7d32' : 'inherit',
                  fontWeight: 'bold'
                }}
              />
            </Tabs>
            
            {this.state.tabValue === 0 && <OrdersTab />}
            {this.state.tabValue === 1 && <SettingsTab socket={this.props.socket} />}
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