import React, { Component, lazy, Suspense } from 'react';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Tabs,
  Tab,
  TextField,
  Box,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  Menu
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import { Link } from 'react-router-dom';
import { withRouter } from './withRouter.js';
import GoogleLoginButton from './GoogleLoginButton.js';

// Lazy load GoogleAuthProvider
const GoogleAuthProvider = lazy(() => import('../providers/GoogleAuthProvider.js'));

// Function to check if user is logged in
export const isUserLoggedIn = () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      console.log('Parsed User:', parsedUser);
      return { isLoggedIn: true, user: parsedUser };
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('user');
    }
  }
  console.log('isUserLoggedIn', false);
  return { isLoggedIn: false, user: null };
};

class LoginComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      tabValue: 0,
      email: '',
      password: '',
      confirmPassword: '',
      error: '',
      loading: false,
      success: '',
      isLoggedIn: false,
      isAdmin: false,
      user: null,
      anchorEl: null,
      showGoogleAuth: false
    };
  }

  componentDidMount() {
    // Make the open function available globally
    window.openLoginDrawer = this.handleOpen;
    
    // Check if user is logged in
    const { isLoggedIn: userIsLoggedIn, user: storedUser } = isUserLoggedIn();
    if (userIsLoggedIn) {
      this.setState({
        user: storedUser,
        isAdmin: !!storedUser.admin,
        isLoggedIn: true
      });
    }
  }

  componentWillUnmount() {
    // Cleanup function to remove global reference when component unmounts
    window.openLoginDrawer = undefined;
  }

  resetForm = () => {
    this.setState({
      email: '',
      password: '',
      confirmPassword: '',
      error: '',
      success: '',
      loading: false
    });
  };

  handleOpen = () => {
    this.setState({
      open: true,
      loading: false
    });
    this.resetForm();
  };

  handleClose = () => {
    this.setState({ open: false });
    this.resetForm();
  };

  handleTabChange = (event, newValue) => {
    this.setState({
      tabValue: newValue,
      error: '',
      success: ''
    });
  };

  validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  handleLogin = () => {
    const { email, password } = this.state;
    const { socket, navigate } = this.props;

    if (!email || !password) {
      this.setState({ error: 'Bitte füllen Sie alle Felder aus' });
      return;
    }

    if (!this.validateEmail(email)) {
      this.setState({ error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' });
      return;
    }

    this.setState({ loading: true, error: '' });

    // Call verifyUser socket endpoint
    socket.emit('verifyUser', { email, password }, (response) => {
      
      if (response.success) {
        response.user.password = password;
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(response.user));
        this.setState({
          user: response.user,
          isLoggedIn: true,
          isAdmin: !!response.user.admin
        });
        try{
          window.cart = JSON.parse(response.user.cart);
          window.dispatchEvent(new CustomEvent('cart'));
        }catch(error){
          console.error('Error parsing cart  :',response.user, error);
        }
        this.handleClose(); // Close the dialog after successful login
        navigate('/profile'); // Navigate programmatically
      } else {
        this.setState({
          loading: false,
          error: response.message || 'Anmeldung fehlgeschlagen'
        });
      }
    });
  };

  handleRegister = () => {
    const { email, password, confirmPassword } = this.state;
    const { socket } = this.props;

    if (!email || !password || !confirmPassword) {
      this.setState({ error: 'Bitte füllen Sie alle Felder aus' });
      return;
    }

    if (!this.validateEmail(email)) {
      this.setState({ error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' });
      return;
    }

    if (password !== confirmPassword) {
      this.setState({ error: 'Passwörter stimmen nicht überein' });
      return;
    }

    if (password.length < 8) {
      this.setState({ error: 'Das Passwort muss mindestens 8 Zeichen lang sein' });
      return;
    }

    this.setState({ loading: true, error: '' });

    // Call createUser socket endpoint
    socket.emit('createUser', { email, password }, (response) => {
      if (response.success) {
        this.setState({
          loading: false,
          success: 'Registrierung erfolgreich. Sie können sich jetzt anmelden.',
          tabValue: 0 // Switch to login tab
        });
      } else {
        this.setState({
          loading: false,
          error: response.message || 'Registrierung fehlgeschlagen'
        });
      }
    });
  };

  handleUserMenuClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleUserMenuClose = () => {
    this.setState({ anchorEl: null });
  };

  handleLogout = () => {
    localStorage.removeItem('user');
    this.setState({
      user: null,
      isLoggedIn: false,
      isAdmin: false,
      anchorEl: null,
      showGoogleAuth: false
    });
  };

  // Google login functionality
  handleGoogleLoginSuccess = (credentialResponse) => {
    const { socket, navigate } = this.props;
    console.log('Google Login Success:', credentialResponse);
    
    // Decode the credential to get basic user info
    if (credentialResponse.credential) {
      socket.emit('verifyGoogleUser', credentialResponse, (response) => {
        console.log('Google Login Verify:', response);

        const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
        console.log('Google Decode:', decoded);
        const googleUser = {
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
          googleId: decoded.sub,
          admin: response.user.admin
        };
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(googleUser));
        this.setState({
          user: googleUser,
          isLoggedIn: true,
          isAdmin: response.user.admin
        });
        this.handleClose();
        navigate('/profile');
      });
    }
  };

  handleGoogleLoginError = (error) => {
    console.error('Google Login Error:', error);
    this.setState({ error: 'Google-Anmeldung fehlgeschlagen' });
  };

  render() {
    const { 
      open, 
      tabValue, 
      email, 
      password, 
      confirmPassword, 
      error, 
      loading, 
      success, 
      isLoggedIn, 
      isAdmin, 
      user, 
      anchorEl, 
      showGoogleAuth 
    } = this.state;

    return (
      <>
        {isLoggedIn ? (
          <>
            <Button
              variant="text"
              onClick={this.handleUserMenuClick}
              startIcon={<PersonIcon />}
              color={isAdmin ? 'secondary' : 'inherit'}
              sx={{ my: 1, mx: 1.5 }}
            >
              {user?.name || user?.email?.split('@')[0] || 'Benutzer'}
            </Button>
            <Menu
              disableScrollLock={true}
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.handleUserMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem component={Link} to="/profile" onClick={this.handleUserMenuClose}>Profil</MenuItem>
              {isAdmin ? <MenuItem component={Link} to="/admin" onClick={this.handleUserMenuClose}>Admin</MenuItem> : null}
              <MenuItem onClick={this.handleLogout}>Abmelden</MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            variant="outlined"
            color="inherit" 
            onClick={this.handleOpen}
            sx={{ my: 1, mx: 1.5 }}
          >
            Anmelden
          </Button>
        )}

        <Dialog 
          open={open} 
          onClose={this.handleClose}
          disableScrollLock
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle sx={{ bgcolor: 'white', pb: 0 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" color="#2e7d32" fontWeight="bold">
                {tabValue === 0 ? 'Anmelden' : 'Registrieren'}
              </Typography>
              <IconButton edge="end" onClick={this.handleClose} aria-label="close">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent>
            <Tabs 
              value={tabValue} 
              onChange={this.handleTabChange} 
              variant="fullWidth"
              sx={{ mb: 2 }}
              TabIndicatorProps={{
                style: { backgroundColor: '#2e7d32' }
              }}
              textColor="inherit"
            >
              <Tab 
                label="ANMELDEN" 
                sx={{ 
                  color: tabValue === 0 ? '#2e7d32' : 'inherit',
                  fontWeight: 'bold'
                }}
              />
              <Tab 
                label="REGISTRIEREN" 
                sx={{ 
                  color: tabValue === 1 ? '#2e7d32' : 'inherit',
                  fontWeight: 'bold'
                }}
              />
            </Tabs>


            {/* Google Sign In Button */}
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 2 }}>
              {!showGoogleAuth && (
                <Button
                  variant="contained"
                  startIcon={<PersonIcon />}
                  onClick={() => {
                    // Dynamically import and initialize Google Auth when button is clicked
                    this.setState({ showGoogleAuth: true });
                  }}
                  sx={{ width: '100%', backgroundColor: '#4285F4', color: 'white' }}
                >
                  Mit Google anmelden
                </Button>
              )}
              
              {showGoogleAuth && (
                <Suspense fallback={
                  <Button
                    variant="contained"
                    startIcon={<PersonIcon />}
                    sx={{ width: '100%', backgroundColor: '#4285F4', color: 'white' }}
                  >
                    Mit Google anmelden
                  </Button>
                }>
                  <GoogleAuthProvider clientId="928121624463-jbgfdlgem22scs1k9c87ucg4ffvaik6o.apps.googleusercontent.com">
                    <GoogleLoginButton
                      onSuccess={this.handleGoogleLoginSuccess}
                      onError={this.handleGoogleLoginError}
                      text="Mit Google anmelden"
                      style={{ width: '100%', backgroundColor: '#4285F4' }}
                      autoInitiate={true}
                    />
                  </GoogleAuthProvider>
                </Suspense>
              )}
            </Box>


            
            {/* OR Divider */}
            <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
              <Box sx={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
              <Typography variant="body2" sx={{ px: 2, color: '#757575' }}>ODER</Typography>
              <Box sx={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
            </Box>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            
            <Box sx={{ py: 1 }}>
              <TextField
                margin="dense"
                label="E-Mail"
                type="email"
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => this.setState({ email: e.target.value })}
                disabled={loading}
              />
              
              <TextField
                margin="dense"
                label="Passwort"
                type="password"
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => this.setState({ password: e.target.value })}
                disabled={loading}
              />
              
              {tabValue === 1 && (
                <TextField
                  margin="dense"
                  label="Passwort bestätigen"
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={confirmPassword}
                  onChange={(e) => this.setState({ confirmPassword: e.target.value })}
                  disabled={loading}
                />
              )}

              {loading ? (
                <Box display="flex" justifyContent="center" mt={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  onClick={tabValue === 0 ? this.handleLogin : this.handleRegister}
                  sx={{ mt: 2, bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
                >
                  {tabValue === 0 ? 'ANMELDEN' : 'REGISTRIEREN'}
                </Button>
              )}
            </Box>
          </DialogContent>
        </Dialog>
      </>
    );
  }
}

export default withRouter(LoginComponent); 