import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  Tabs,
  Tab,
  Stack,
  Button,
  Box
} from '@mui/material';
import { Navigate, Link } from 'react-router-dom';
import ArticleIcon from '@mui/icons-material/Article';
import { ADMIN_COLORS, getAdminStyles } from '../theme/adminColors.js';

class ServerLogsPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loading: true,
      redirect: false,
      logs: [],
      historicalLogsLoaded: false
    };
  }

  checkUserLoggedIn = () => {
    const storedUser = sessionStorage.getItem('user');
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
      console.error('Error parsing user from sessionStorage:', error);
      this.setState({ redirect: true, user: null });
    }

    // Once loading is complete
    if (this.state.loading) {
      this.setState({ loading: false });
    }
  }

  handleStorageChange = (e) => {
    if (e.key === 'user' && !e.newValue) {
      // User was removed from sessionStorage in another tab
      this.setState({ redirect: true, user: null });
    }
  }

  handleLogEntry = (logEntry) => {
    console.log(`[${logEntry.timestamp}] ${logEntry.level.toUpperCase()}: ${logEntry.message}`);
    this.setState(prevState => ({
      logs: [logEntry, ...prevState.logs].slice(0, 250) // Keep only last 250 logs
    }));
  }

  parseHistoricalLogLine = (logLine) => {
    // Try to parse JSON formatted log entries first
    try {
      const parsed = JSON.parse(logLine);
      if (parsed.level && parsed.message && parsed.timestamp) {
        return {
          timestamp: parsed.timestamp,
          level: parsed.level.toLowerCase(),
          message: parsed.message
        };
      }
    } catch {
      // Not JSON, try other formats
    }

    // Try to parse bracket format like: "[2024-01-01T12:00:00.000Z] INFO: message content"
    const match = logLine.match(/^\[(.+?)\]\s+(\w+):\s*(.*)$/);
    if (match) {
      return {
        timestamp: match[1],
        level: match[2].toLowerCase(),
        message: match[3]
      };
    }
    
    // Fallback for lines that don't match expected format
    return {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: logLine
    };
  }

  loadHistoricalLogs = () => {
    if (this.props.socket && this.props.socket.connected) {
      this.props.socket.emit('getLog', (response) => {
        if (response.success) {
          console.log('Last 50 historical logs:', response.data.lines);
          const historicalLogs = (response.data.lines || [])
            .map(line => this.parseHistoricalLogLine(line))
            .reverse(); // Reverse to have newest first
          
          this.setState(prevState => ({
            logs: [...historicalLogs, ...prevState.logs].slice(0, 250),
            historicalLogsLoaded: true
          }));
        } else {
          console.warn('Failed to load historical logs:', response);
          this.setState({ historicalLogsLoaded: true }); // Mark as attempted even if failed
        }
      });
    }
  }

  componentDidMount() {
    this.addSocketListeners();
    this.checkUserLoggedIn(); 
    this.loadHistoricalLogs(); // Load historical logs on mount
    // Set up interval to regularly check login status
    this.checkLoginInterval = setInterval(this.checkUserLoggedIn, 1000);
    // Add storage event listener to detect when user logs out in other tabs
    window.addEventListener('storage', this.handleStorageChange);
  }

  componentDidUpdate(prevProps) {
    // Handle socket connection changes
    const wasConnected = prevProps.socket && prevProps.socket.connected;
    const isNowConnected = this.props.socket && this.props.socket.connected;
    
    if (!wasConnected && isNowConnected) {
      // Socket just connected, add listeners and reload data
      this.addSocketListeners();
      if (!this.state.historicalLogsLoaded) {
        this.loadHistoricalLogs();
      }
    } else if (wasConnected && !isNowConnected) {
      // Socket just disconnected, remove listeners
      this.removeSocketListeners();
    }
  }

  componentWillUnmount() {
    this.removeSocketListeners();
    // Clear interval and remove event listeners
    if (this.checkLoginInterval) {
      clearInterval(this.checkLoginInterval);
    }
    window.removeEventListener('storage', this.handleStorageChange);
  }

  addSocketListeners = () => {
    if (this.props.socket && this.props.socket.connected) {
      // Remove existing listeners first to avoid duplicates
      this.removeSocketListeners();
      this.props.socket.on('log', this.handleLogEntry);
    }
  }

  removeSocketListeners = () => {
    if (this.props.socket) {
      this.props.socket.off('log', this.handleLogEntry);
    }
  }

  formatLogLevel = (level) => {
    const colors = {
      error: ADMIN_COLORS.error,
      warn: ADMIN_COLORS.warning,
      info: ADMIN_COLORS.primary,
      debug: ADMIN_COLORS.secondary,
      verbose: ADMIN_COLORS.secondaryText
    };
    return colors[level.toLowerCase()] || ADMIN_COLORS.primaryText;
  }

  clearLogs = () => {
    this.setState({ logs: [] });
  }

  render() {
    if (this.state.redirect || (!this.state.loading && !this.state.user)) {
      return <Navigate to="/" />;
    }

    // Check if current user is admin
    if (this.state.user && !this.state.user.admin) {
      return <Navigate to="/" />;
    }

    const styles = getAdminStyles();

    return (
      <Box sx={styles.pageContainer}>
        <Container 
          maxWidth="lg" 
          sx={{ 
            py: 6
          }}
        >
          {/* Admin Navigation Tabs */}
          <Paper 
            elevation={1} 
            sx={{ 
              mb: 3,
              ...styles.tabBar
            }}
          >
            <Tabs
              value={2}
              indicatorColor="primary"
              sx={{ 
                px: 2,
                '& .MuiTabs-indicator': {
                  backgroundColor: ADMIN_COLORS.primary
                }
              }}
            >
              <Tab 
                label="Dashboard" 
                component={Link} 
                to="/admin"
                sx={{ 
                  textTransform: 'none',
                  color: ADMIN_COLORS.primaryText,
                  fontFamily: ADMIN_COLORS.fontFamily,
                  '&:hover': {
                    color: ADMIN_COLORS.primaryBright
                  }
                }}
              />
              <Tab 
                label="Users" 
                component={Link} 
                to="/admin/users"
                sx={{ 
                  textTransform: 'none',
                  color: ADMIN_COLORS.primaryText,
                  fontFamily: ADMIN_COLORS.fontFamily,
                  '&:hover': {
                    color: ADMIN_COLORS.primaryBright
                  }
                }}
              />
              <Tab 
                label="Server Logs" 
                component={Link} 
                to="/admin/logs"
                sx={{ 
                  textTransform: 'none', 
                  fontWeight: 'bold',
                  color: ADMIN_COLORS.primary,
                  fontFamily: ADMIN_COLORS.fontFamily
                }}
              />
            </Tabs>
          </Paper>

          {/* Server Logs Content */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 4,
              ...styles.contentPaper
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  ...styles.primaryHeading
                }}
              >
                <ArticleIcon sx={{ mr: 1, color: ADMIN_COLORS.primary }} />
                Server Logs
              </Typography>
              
              <Button
                variant="outlined"
                onClick={this.clearLogs}
                size="small"
                sx={{
                  color: ADMIN_COLORS.warning,
                  borderColor: ADMIN_COLORS.warning,
                  fontFamily: ADMIN_COLORS.fontFamily,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: ADMIN_COLORS.warning,
                    color: ADMIN_COLORS.hoverBackground,
                    borderColor: ADMIN_COLORS.warning
                  }
                }}
              >
                Clear Logs
              </Button>
            </Box>
            
            {this.state.logs.length === 0 ? (
              <Typography 
                variant="body2" 
                sx={{ 
                  ...styles.secondaryText,
                  p: 2
                }}
              >
                {!this.state.historicalLogsLoaded 
                  ? "Loading historical logs..." 
                  : "No logs available. New logs will appear here in real-time."}
              </Typography>
            ) : (
              <Card 
                variant="outlined" 
                sx={{ 
                  ...styles.card,
                  borderRadius: 1
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <List dense sx={{ p: 0 }}>
                    {this.state.logs.map((log, index) => (
                      <ListItem 
                        key={index} 
                        sx={{ 
                          py: 0.25, 
                          px: 1,
                          borderBottom: index < this.state.logs.length - 1 ? `1px solid ${ADMIN_COLORS.hoverBackground}` : 'none',
                          '&:hover': {
                            backgroundColor: ADMIN_COLORS.hoverBackground
                          }
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ width: '100%', fontFamily: ADMIN_COLORS.fontFamily }}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: ADMIN_COLORS.secondaryText,
                              minWidth: 160,
                              fontSize: '0.75rem',
                              fontFamily: ADMIN_COLORS.fontFamily,
                              flexShrink: 0
                            }}
                          >
                            {log.timestamp}
                          </Typography>
                          <Typography 
                            variant="caption"
                            sx={{ 
                              color: this.formatLogLevel(log.level),
                              minWidth: 60,
                              fontSize: '0.75rem',
                              fontFamily: ADMIN_COLORS.fontFamily,
                              fontWeight: 'bold',
                              flexShrink: 0,
                              textTransform: 'uppercase'
                            }}
                          >
                            {log.level}:
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              flexGrow: 1, 
                              wordBreak: 'break-word',
                              color: ADMIN_COLORS.primaryText,
                              fontSize: '0.875rem',
                              fontFamily: ADMIN_COLORS.fontFamily,
                              lineHeight: 1.4
                            }}
                          >
                            {log.message}
                          </Typography>
                        </Stack>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Container>
      </Box>
    );
  }
}

export default ServerLogsPage; 