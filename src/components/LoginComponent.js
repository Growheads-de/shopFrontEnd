import React, { lazy, Component, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box,
  Button,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Tabs,
  Tab,
  TextField,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  Menu,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import { withRouter } from './withRouter.js';
import GoogleLoginButton from './GoogleLoginButton.js';
import CartSyncDialog from './CartSyncDialog.js';
import { localAndArchiveServer, mergeCarts } from '../utils/cartUtils.js';

// Lazy load GoogleAuthProvider
const GoogleAuthProvider = lazy(() => import('../providers/GoogleAuthProvider.js'));

// Function to check if user is logged in
export const isUserLoggedIn = () => {
  const storedUser = sessionStorage.getItem('user');
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      console.log('Parsed User:', parsedUser);
      return { isLoggedIn: true, user: parsedUser, isAdmin: !!parsedUser.admin };

    } catch (error) {
      console.error('Error parsing user from sessionStorage:', error);
      sessionStorage.removeItem('user');
    }
  }
  console.log('isUserLoggedIn', false);
  return { isLoggedIn: false, user: null, isAdmin: false };
};

// Hilfsfunktion zum Vergleich zweier Cart-Arrays
function cartsAreIdentical(cartA, cartB) {
  console.log('Vergleiche Carts:', {cartA, cartB});
  if (!Array.isArray(cartA) || !Array.isArray(cartB)) {
    console.log('Mindestens eines der Carts ist kein Array');
    return false;
  }
  if (cartA.length !== cartB.length) {
    console.log('Unterschiedliche Längen:', cartA.length, cartB.length);
    return false;
  }
  const sortById = arr => [...arr].sort((a, b) => (a.id > b.id ? 1 : -1));
  const aSorted = sortById(cartA);
  const bSorted = sortById(cartB);
  for (let i = 0; i < aSorted.length; i++) {
    if (aSorted[i].id !== bSorted[i].id) {
      console.log('Unterschiedliche IDs:', aSorted[i].id, bSorted[i].id, aSorted[i], bSorted[i]);
      return false;
    }
    if (aSorted[i].quantity !== bSorted[i].quantity) {
      console.log('Unterschiedliche Mengen:', aSorted[i].id, aSorted[i].quantity, bSorted[i].quantity);
      return false;
    }
  }
  console.log('Carts sind identisch');
  return true;
}

export class LoginComponent extends Component {
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
      showGoogleAuth: false,
      cartSyncOpen: false,
      localCartSync: [],
      serverCartSync: [],
      pendingNavigate: null,
      privacyConfirmed: sessionStorage.getItem('privacyConfirmed') === 'true'
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

    if (this.props.open) {
      this.setState({ open: true });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.open !== prevProps.open) {
      this.setState({ open: this.props.open });
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
      loading: false,
      privacyConfirmed: sessionStorage.getItem('privacyConfirmed') === 'true'
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
    const { socket, location } = this.props;

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
      console.log('LoginComponent: verifyUser', response);
      if (response.success) {
        sessionStorage.setItem('user', JSON.stringify(response.user));
        this.setState({
          user: response.user,
          isLoggedIn: true,
          isAdmin: !!response.user.admin
        });
        
        const redirectTo = location && location.hash ? `/profile${location.hash}` : '/profile';
        const dispatchLoginEvent = () => window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { redirectTo } }));

        try {
          const newCart = JSON.parse(response.user.cart);
          const localCartArr = window.cart ? Object.values(window.cart) : [];
          const serverCartArr = newCart ? Object.values(newCart) : [];

          if (serverCartArr.length === 0) {
            socket.emit('updateCart', window.cart);
            this.handleClose();
            dispatchLoginEvent();
          } else if (localCartArr.length === 0 && serverCartArr.length > 0) {
            window.cart = serverCartArr;
            window.dispatchEvent(new CustomEvent('cart'));
            this.handleClose();
            dispatchLoginEvent();
          } else if (cartsAreIdentical(localCartArr, serverCartArr)) {
            this.handleClose();
            dispatchLoginEvent();
          } else {
            this.setState({
              cartSyncOpen: true,
              localCartSync: localCartArr,
              serverCartSync: serverCartArr,
              pendingNavigate: dispatchLoginEvent
            });
          }
        } catch (error) {
          console.error('Error parsing cart:', response.user, error);
          this.handleClose();
          dispatchLoginEvent();
        }
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
    this.props.socket.emit('logout', (response) => {
      if(response.success){
        sessionStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { redirectTo: '/' } }));
        this.setState({
          user: null,
          isLoggedIn: false,
          isAdmin: false,
          anchorEl: null,
        });
      }
    });
  };

  handleForgotPassword = () => {
    const { email } = this.state;
    const { socket } = this.props;

    if (!email) {
      this.setState({ error: 'Bitte geben Sie Ihre E-Mail-Adresse ein' });
      return;
    }

    if (!this.validateEmail(email)) {
      this.setState({ error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' });
      return;
    }

    this.setState({ loading: true, error: '' });

    // Call resetPassword socket endpoint
    socket.emit('resetPassword', { 
      email, 
      domain: window.location.origin 
    }, (response) => {
      console.log('Reset Password Response:', response);
      if (response.success) {
        this.setState({
          loading: false,
          success: 'Ein Link zum Zurücksetzen des Passworts wurde an Ihre E-Mail-Adresse gesendet.'
        });
      } else {
        this.setState({
          loading: false,
          error: response.message || 'Fehler beim Senden der E-Mail'
        });
      }
    });
  };

  // Google login functionality
  handleGoogleLoginSuccess = (credentialResponse) => {
    const { socket, location } = this.props;
    this.setState({ loading: true, error: '' });

    socket.emit('googleLogin', { credential: credentialResponse.credential }, (response) => {
      if (response.success) {
        sessionStorage.setItem('user', JSON.stringify(response.user));
        this.setState({
          isLoggedIn: true,
          isAdmin: !!response.user.admin,
          user: response.user
        });

        const redirectTo = location && location.hash ? `/profile${location.hash}` : '/profile';
        const dispatchLoginEvent = () => window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { redirectTo } }));

        try {
          const newCart = JSON.parse(response.user.cart);
          const localCartArr = window.cart ? Object.values(window.cart) : [];
          const serverCartArr = newCart ? Object.values(newCart) : [];

          if (serverCartArr.length === 0) {
            socket.emit('updateCart', window.cart);
            this.handleClose();
            dispatchLoginEvent();
          } else if (localCartArr.length === 0 && serverCartArr.length > 0) {
            window.cart = serverCartArr;
            window.dispatchEvent(new CustomEvent('cart'));
            this.handleClose();
            dispatchLoginEvent();
          } else if (cartsAreIdentical(localCartArr, serverCartArr)) {
            this.handleClose();
            dispatchLoginEvent();
          } else {
            this.setState({
              cartSyncOpen: true,
              localCartSync: localCartArr,
              serverCartSync: serverCartArr,
              pendingNavigate: dispatchLoginEvent
            });
          }
        } catch (error) {
          console.error('Error parsing cart:', response.user, error);
          this.handleClose();
          dispatchLoginEvent();
        }
      } else {
        this.setState({ loading: false, error: 'Google-Anmeldung fehlgeschlagen' });
      }
    });
  };

  handleGoogleLoginError = (error) => {
    console.error('Google Login Error:', error);
    this.setState({ error: 'Google-Anmeldung fehlgeschlagen' });
  };

  handleCartSyncConfirm = async (option) => {
    const { localCartSync, serverCartSync, pendingNavigate } = this.state;
    switch (option) {
      case 'useLocalArchive':
        localAndArchiveServer(localCartSync, serverCartSync);
        break;
      case 'deleteServer':
        this.props.socket.emit('updateCart', window.cart) 
        break;
      case 'useServer':
        window.cart = serverCartSync;
        break;
      case 'merge':
      default: {
        const merged = mergeCarts(localCartSync, serverCartSync);
        console.log('MERGED CART RESULT:', merged);
        window.cart = merged;
        break;
      }
    }
    window.dispatchEvent(new CustomEvent('cart'));
    this.setState({ cartSyncOpen: false, localCartSync: [], serverCartSync: [], pendingNavigate: null });
    this.handleClose();
    if (pendingNavigate) pendingNavigate();
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
      showGoogleAuth,
      cartSyncOpen,
      localCartSync,
      serverCartSync,
      privacyConfirmed
    } = this.state;

    const { open: openProp, handleClose: handleCloseProp } = this.props;
    const isExternallyControlled = openProp !== undefined;

    return (
      <>
        {!isExternallyControlled && (
          isLoggedIn ? (
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
                <MenuItem component={Link} to="/profile#cart" onClick={this.handleUserMenuClose} sx={{ pl: 4 }}>Bestellabschluss</MenuItem>
                <MenuItem component={Link} to="/profile#orders" onClick={this.handleUserMenuClose} sx={{ pl: 4 }}>Bestellungen</MenuItem>
                <MenuItem component={Link} to="/profile#settings" onClick={this.handleUserMenuClose} sx={{ pl: 4 }}>Einstellungen</MenuItem>
                <Divider />
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
          )
        )}

        <Dialog 
          open={open} 
          onClose={handleCloseProp || this.handleClose}
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
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              {!privacyConfirmed && (
                <Typography variant="caption" sx={{ mb: 1, textAlign: 'center' }}>
                  Mit dem Click auf "Mit Google anmelden" akzeptiere ich die <Link to="/datenschutz" style={{ color: '#4285F4' }}>Datenschutzbestimmungen</Link>
                </Typography>
              )}
              {!showGoogleAuth && (
                <Button
                  variant="contained"
                  startIcon={<PersonIcon />}
                  onClick={() => {
                    sessionStorage.setItem('privacyConfirmed', 'true');
                    this.setState({ showGoogleAuth: true, privacyConfirmed: true });
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
              
              {tabValue === 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 1 }}>
                  <Button
                    variant="text"
                    size="small"
                    onClick={this.handleForgotPassword}
                    disabled={loading}
                    sx={{ 
                      color: '#2e7d32',
                      textTransform: 'none',
                      '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
                    }}
                  >
                    Passwort vergessen?
                  </Button>
                </Box>
              )}
              
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
        <CartSyncDialog
          open={cartSyncOpen}
          localCart={localCartSync}
          serverCart={serverCartSync}
          onClose={() => this.setState({ cartSyncOpen: false })}
          onConfirm={this.handleCartSyncConfirm}
        />
      </>
    );
  }
}

export default withRouter(LoginComponent); 