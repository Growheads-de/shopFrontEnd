import React, { useState, useEffect } from 'react';
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

const LoginComponent = ({ socket }) => {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleOpen = () => {
    setOpen(true);
    resetForm();
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setLoading(false);
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
      setLoading(false);
      if (response.success) {
        setSuccess('Erfolgreich angemeldet');
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        setIsLoggedIn(true);
        // Close dialog after a short delay
        setTimeout(() => {
          handleClose();
        }, 1000);
      } else {
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
    setAnchorEl(null);
  };

  return (
    <>
      {isLoggedIn ? (
        <>
          <Button
            variant="text"
            color="inherit"
            onClick={handleUserMenuClick}
            startIcon={<PersonIcon />}
            sx={{ my: 1, mx: 1.5 }}
          >
            {user?.email?.split('@')[0] || 'Benutzer'}
          </Button>
          <Menu
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
        maxWidth="xs"
        fullWidth
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