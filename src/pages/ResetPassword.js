import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';

const ResetPassword = ({ socket }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Extract token from URL query parameters
    const urlParams = new URLSearchParams(location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (!tokenFromUrl) {
      setError('Kein gültiger Token gefunden. Bitte verwenden Sie den Link aus Ihrer E-Mail.');
    } else {
      setToken(tokenFromUrl);
    }
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Bitte füllen Sie alle Felder aus');
      return;
    }

    if (newPassword.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein');
      return;
    }

    setLoading(true);
    setError('');

    // Emit verifyResetToken event
    socket.emit('verifyResetToken', { 
      token: token,
      newPassword: newPassword
    }, (response) => {
      setLoading(false);
      
      if (response.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/');
          // Open login drawer if available
          if (window.openLoginDrawer) {
            window.openLoginDrawer();
          }
        }, 3000);
      } else {
        setError(response.message || 'Fehler beim Zurücksetzen des Passworts');
      }
    });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <LockResetIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography component="h1" variant="h5" gutterBottom>
            Passwort zurücksetzen
          </Typography>
          
          {!token ? (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          ) : success ? (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Ihr Passwort wurde erfolgreich zurückgesetzt! Sie werden in Kürze zur Anmeldung weitergeleitet...
              </Alert>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="Neues Passwort"
                type="password"
                id="newPassword"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Passwort bestätigen"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  bgcolor: '#2e7d32',
                  '&:hover': { bgcolor: '#1b5e20' }
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Passwort zurücksetzen'
                )}
              </Button>
              
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="text"
                  onClick={() => navigate('/')}
                  sx={{ color: '#2e7d32' }}
                >
                  Zurück zur Startseite
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPassword; 