import React, { Component } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  Divider
} from '@mui/material';

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
    const storedUser = sessionStorage.getItem('user');
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
  
  render() {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3}}>
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

export default SettingsTab; 