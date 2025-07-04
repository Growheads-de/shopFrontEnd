import React, { Component } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  Divider,
  IconButton,
  Snackbar
} from '@mui/material';
import { ContentCopy } from '@mui/icons-material';

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
      loading: false,
      // API Key management state
      hasApiKey: false,
      apiKey: '',
      apiKeyDisplay: '',
      apiKeyError: '',
      apiKeySuccess: '',
      loadingApiKey: false,
      copySnackbarOpen: false
    };
  }

  componentDidMount() {
    // Load user data
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.setState({ newEmail: user.email || '' });
        
        // Check if user has an API key
        this.props.socket.emit('isApiKey', (response) => {
          if (response.success && response.hasApiKey) {
            this.setState({ 
              hasApiKey: true,
              apiKeyDisplay: '************'
            });
          }
        });
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
          
          // Update user in sessionStorage
          try {
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
              const user = JSON.parse(storedUser);
              user.email = this.state.newEmail;
              sessionStorage.setItem('user', JSON.stringify(user));
            }
          } catch (error) {
            console.error('Error updating user in sessionStorage:', error);
          }
        } else {
          this.setState({
            emailError: response.message || 'Fehler beim Aktualisieren der E-Mail-Adresse'
          });
        }
      }
    );
  };
  
  handleGenerateApiKey = () => {
    this.setState({
      apiKeyError: '',
      apiKeySuccess: '',
      loadingApiKey: true
    });
    
    const storedUser = sessionStorage.getItem('user');
    if (!storedUser) {
      this.setState({ 
        apiKeyError: 'Benutzer nicht gefunden',
        loadingApiKey: false
      });
      return;
    }
    
    try {
      const user = JSON.parse(storedUser);
      
      this.props.socket.emit('createApiKey', user.id, (response) => {
        this.setState({ loadingApiKey: false });
        
        if (response.success) {
          this.setState({
            hasApiKey: true,
            apiKey: response.apiKey,
            apiKeyDisplay: response.apiKey,
            apiKeySuccess: response.message || 'API-Schlüssel erfolgreich generiert'
          });
          
          // After 10 seconds, hide the actual key and show asterisks
          setTimeout(() => {
            this.setState({ apiKeyDisplay: '************' });
          }, 10000);
        } else {
          this.setState({
            apiKeyError: response.message || 'Fehler beim Generieren des API-Schlüssels'
          });
        }
      });
    } catch (error) {
      console.error('Error generating API key:', error);
      this.setState({ 
        apiKeyError: 'Fehler beim Generieren des API-Schlüssels',
        loadingApiKey: false
      });
    }
  };
  
  handleCopyToClipboard = () => {
    navigator.clipboard.writeText(this.state.apiKey).then(() => {
      this.setState({ copySnackbarOpen: true });
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = this.state.apiKey;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.setState({ copySnackbarOpen: true });
    });
  };

  handleCloseSnackbar = () => {
    this.setState({ copySnackbarOpen: false });
  };
  
  render() {
    return (
      <Box sx={{ p: { xs: 1, sm: 3 } }}>
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
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
        
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
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
        
        <Divider sx={{ my: 4 }} />
        
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            API-Schlüssel
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Verwenden Sie Ihren API-Schlüssel für die Integration mit externen Anwendungen.
          </Typography>
          
          {this.state.apiKeyError && <Alert severity="error" sx={{ mb: 2 }}>{this.state.apiKeyError}</Alert>}
          {this.state.apiKeySuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {this.state.apiKeySuccess}
              {this.state.apiKey && this.state.apiKeyDisplay !== '************' && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Speichern Sie diesen Schlüssel sicher. Er wird aus Sicherheitsgründen in 10 Sekunden ausgeblendet.
                </Typography>
              )}
            </Alert>
          )}
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            API-Dokumentation: {' '}
            <a 
              href={`${window.location.protocol}//${window.location.host}/api/`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#2e7d32' }}
            >
              {`${window.location.protocol}//${window.location.host}/api/`}
            </a>
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
            <TextField
              label="API-Schlüssel"
              value={this.state.apiKeyDisplay}
              disabled
              fullWidth
              sx={{
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: this.state.apiKeyDisplay === '************' ? '#666' : '#000',
                }
              }}
            />
            
            {this.state.apiKeyDisplay !== '************' && this.state.apiKey && (
              <IconButton
                onClick={this.handleCopyToClipboard}
                sx={{ 
                  color: '#2e7d32',
                  '&:hover': { bgcolor: 'rgba(46, 125, 50, 0.1)' }
                }}
                title="In Zwischenablage kopieren"
              >
                <ContentCopy />
              </IconButton>
            )}
            
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleGenerateApiKey}
              disabled={this.state.loadingApiKey}
              sx={{ 
                minWidth: 120,
                bgcolor: '#2e7d32', 
                '&:hover': { bgcolor: '#1b5e20' }
              }}
            >
              {this.state.loadingApiKey ? (
                <CircularProgress size={24} />
              ) : (
                this.state.hasApiKey ? 'Regenerieren' : 'Generieren'
              )}
            </Button>
          </Box>
        </Paper>
        
        <Snackbar
          open={this.state.copySnackbarOpen}
          autoHideDuration={3000}
          onClose={this.handleCloseSnackbar}
          message="API-Schlüssel in Zwischenablage kopiert"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Box>
    );
  }
}

export default SettingsTab; 