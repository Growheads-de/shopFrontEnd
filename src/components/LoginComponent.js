import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
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
import { Link, useNavigate } from 'react-router-dom';
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
  return { isLoggedIn: false, user: null };
};

const LoginComponent = ({ socket }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showGoogleAuth, setShowGoogleAuth] = useState(false);

  const resetForm = useCallback(() => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setLoading(false);
  }, []);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setLoading(false);
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    // Make the open function available globally
    window.openLoginDrawer = handleOpen;
    
    // Check if user is logged in
    const { isLoggedIn: userIsLoggedIn, user: storedUser } = isUserLoggedIn();
    if (userIsLoggedIn) {
      setUser(storedUser);
      setIsAdmin(!!storedUser.admin);
      setIsLoggedIn(true);
    }
    
    // Cleanup function to remove global reference when component unmounts
    return () => {
      window.openLoginDrawer = undefined;
    };
  }, [handleOpen]);

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = () => {
    if (!email || !password) {
      setError('Bitte füllen Sie alle Felder aus');
      return;
    }

    if (!validateEmail(email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return;
    }

    setLoading(true);
    setError('');

    // Call verifyUser socket endpoint
    socket.emit('verifyUser', { email, password }, (response) => {
      
      if (response.success) {
        response.user.password = password;
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        try{
          window.cart = JSON.parse(response.user.cart);
          window.dispatchEvent(new CustomEvent('cart'));
        }catch(error){
          console.error('Error parsing cart  :',response.user, error);
        }
        setIsLoggedIn(true);
        setIsAdmin(!!response.user.admin);
        handleClose(); // Close the dialog after successful login
        navigate('/profile'); // Navigate programmatically
      } else {
        setLoading(false);
        setError(response.message || 'Anmeldung fehlgeschlagen');
      }
    });
  };

  const handleRegister = () => {
    if (!email || !password || !confirmPassword) {
      setError('Bitte füllen Sie alle Felder aus');
      return;
    }

    if (!validateEmail(email)) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    setLoading(true);
    setError('');

    // Call createUser socket endpoint
    socket.emit('createUser', { email, password }, (response) => {
      setLoading(false);
      if (response.success) {
        setSuccess('Registrierung erfolgreich. Sie können sich jetzt anmelden.');
        setTabValue(0); // Switch to login tab
      } else {
        setError(response.message || 'Registrierung fehlgeschlagen');
      }
    });
  };

  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
    setAnchorEl(null);
    // Clear Google user data
    setShowGoogleAuth(false);
  };

  // Google login functionality
  const handleGoogleLoginSuccess = (credentialResponse) => {
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
        setUser(googleUser);
        setIsLoggedIn(true);
        setIsAdmin(response.user.admin);
        handleClose();
        navigate('/profile');
      });
    }
  };

  const handleGoogleLoginError = (error) => {
    console.error('Google Login Error:', error);
    setError('Google-Anmeldung fehlgeschlagen');
  };

  return (
    <>
      {isLoggedIn ? (
        <>
          <Button
            variant="text"
            onClick={handleUserMenuClick}
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
            onClose={handleUserMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem component={Link} to="/profile" onClick={handleUserMenuClose}>Profil</MenuItem>
            {isAdmin ? <MenuItem component={Link} to="/admin" onClick={handleUserMenuClose}>Admin</MenuItem> : null}
            <MenuItem onClick={handleLogout}>Abmelden</MenuItem>
          </Menu>
        </>
      ) : (
        <Button
          variant="outlined"
          color="inherit" 
          onClick={handleOpen}
          sx={{ my: 1, mx: 1.5 }}
        >
          Anmelden
        </Button>
      )}

      <Dialog 
        open={open} 
        onClose={handleClose}
        disableScrollLock
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ bgcolor: 'white', pb: 0 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="#2e7d32" fontWeight="bold">
              {tabValue === 0 ? 'Anmelden' : 'Registrieren'}
            </Typography>
            <IconButton edge="end" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
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
                  setShowGoogleAuth(true);
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
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
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
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            
            <TextField
              margin="dense"
              label="Passwort"
              type="password"
              fullWidth
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                onClick={tabValue === 0 ? handleLogin : handleRegister}
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
};

export default LoginComponent; 