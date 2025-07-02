import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Divider, 
  Grid, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Stack,
  Button,
  Snackbar,
  Alert,
  Link as MuiLink
} from '@mui/material';
import { Navigate, Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GroupIcon from '@mui/icons-material/Group';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { ADMIN_COLORS, getAdminStyles } from '../theme/adminColors.js';

class UsersPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      users: [],
      totalCount: 0,
      totalOrders: 0,
      loading: true,
      redirect: false,
      switchingUser: false,
      notification: {
        open: false,
        message: '',
        severity: 'success'
      },
      currentlyImpersonating: null
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

  componentDidMount() {
    this.loadInitialData();
    this.checkUserLoggedIn(); 
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
      // Socket just connected, reload data
      this.loadInitialData();
    }
  }

  componentWillUnmount() {
    // Clear interval and remove event listeners
    if (this.checkLoginInterval) {
      clearInterval(this.checkLoginInterval);
    }
    window.removeEventListener('storage', this.handleStorageChange);
  }

  loadInitialData = () => {
    if (this.props.socket && this.props.socket.connected) {
      this.props.socket.emit('getUsers', (response) => {
        if (response.success) {
          console.log('Users:', response.data.users);
          console.log('Total count:', response.data.totalCount);
          console.log('Total orders:', response.data.totalOrders);
          this.setState({
            users: response.data.users,
            totalCount: response.data.totalCount,
            totalOrders: response.data.totalOrders
          });
        } else {
          console.error('Error:', response.error);
        }
      });
    }
  }

  formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if date is invalid
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original string if formatting fails
    }
  }

  getOrderStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
      case 'shipped':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  }

  getOrderStatusChipColor = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return ADMIN_COLORS.primary;
      case 'pending':
        return ADMIN_COLORS.warning;
      case 'processing':
      case 'shipped':
        return ADMIN_COLORS.secondary;
      case 'cancelled':
        return ADMIN_COLORS.error;
      default:
        return ADMIN_COLORS.secondaryText;
    }
  }

  formatPrice = (price) => {
    return typeof price === 'number' 
      ? `€${price.toFixed(2)}` 
      : price;
  }

  handleSwitchUser = (email) => {
    if (!this.props.socket || !this.props.socket.connected) {
      this.showNotification('Socket not connected', 'error');
      return;
    }

    this.setState({ switchingUser: true });

    this.props.socket.emit('switchUser', { email }, (response) => {
      console.log('Switch user response:', response);
      this.setState({ switchingUser: false });
      
      if (response.success) {
        this.setState({ currentlyImpersonating: response.data.targetUser });
        this.showNotification(`Successfully switched to user: ${email}`, 'success');
        
        // Update sessionStorage with the switched user info
        const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
        const switchedUser = {
          ...currentUser,
          id: response.data.targetUser.id,
          email: response.data.targetUser.email,
          admin: true, // Admin privileges are preserved
          originalAdmin: response.data.originalAdmin
        };
        sessionStorage.setItem('user', JSON.stringify(switchedUser));
        
        // Trigger userLoggedIn event to refresh other components
        window.dispatchEvent(new Event('userLoggedIn'));
      } else {
        this.showNotification(`Failed to switch user: ${response.error}`, 'error');
      }
    });
  }

  handleSwitchBackToAdmin = () => {
    if (!this.props.socket || !this.props.socket.connected) {
      this.showNotification('Socket not connected', 'error');
      return;
    }

    this.setState({ switchingUser: true });

    this.props.socket.emit('switchBackToAdmin', (response) => {
      console.log('Switch back to admin response:', response);
      this.setState({ switchingUser: false });
      
      if (response.success) {
        this.setState({ currentlyImpersonating: null });
        this.showNotification(`Switched back to admin`, 'success');
        
        // Restore original admin info in sessionStorage
        const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
        if (currentUser.originalAdmin) {
          const restoredAdmin = {
            ...currentUser,
            id: currentUser.originalAdmin.id,
            email: currentUser.originalAdmin.email,
            admin: true
          };
          delete restoredAdmin.originalAdmin;
          sessionStorage.setItem('user', JSON.stringify(restoredAdmin));
        }
        
        // Trigger userLoggedIn event to refresh other components
        window.dispatchEvent(new Event('userLoggedIn'));
      } else {
        this.showNotification(`Failed to switch back: ${response.error}`, 'error');
      }
    });
  }

  showNotification = (message, severity = 'success') => {
    console.log('Showing notification:', message, severity);
    this.setState({
      notification: {
        open: true,
        message,
        severity
      }
    });
  }

  handleCloseNotification = () => {
    this.setState({
      notification: {
        ...this.state.notification,
        open: false
      }
    });
  }

  render() {
    const { users, totalCount, totalOrders } = this.state;

    if (this.state.redirect || (!this.state.loading && !this.state.user)) {
      return <Navigate to="/" />;
    }

    // Check if current user is admin
    if (this.state.user && !this.state.user.admin) {
      return <Navigate to="/" />;
    }

    const hasUsers = users && users.length > 0;
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
            value={1}
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
                fontWeight: 'bold',
                color: ADMIN_COLORS.primary,
                fontFamily: ADMIN_COLORS.fontFamily
              }}
            />
            <Tab 
              label="Server Logs" 
              component={Link} 
              to="/admin/logs"
              sx={{ 
                textTransform: 'none',
                color: ADMIN_COLORS.primaryText,
                fontFamily: ADMIN_COLORS.fontFamily,
                '&:hover': {
                  color: ADMIN_COLORS.primaryBright
                }
              }}
            />
          </Tabs>
        </Paper>

        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4,
            ...styles.contentPaper
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                ...styles.primaryHeading
              }}
            >
              <GroupIcon sx={{ mr: 1, color: ADMIN_COLORS.primary }} />
              User Management
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {this.state.currentlyImpersonating && (
                <>
                  <Chip 
                    label={`Impersonating: ${this.state.currentlyImpersonating.email}`}
                    size="small"
                    sx={{ 
                      fontWeight: 'medium',
                      backgroundColor: ADMIN_COLORS.magenta,
                      color: ADMIN_COLORS.hoverBackground,
                      fontFamily: ADMIN_COLORS.fontFamily
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={this.handleSwitchBackToAdmin}
                    disabled={this.state.switchingUser}
                    sx={{ 
                      textTransform: 'none',
                      color: ADMIN_COLORS.primaryText,
                      borderColor: ADMIN_COLORS.border,
                      fontFamily: ADMIN_COLORS.fontFamily,
                      '&:hover': {
                        borderColor: ADMIN_COLORS.primary,
                        backgroundColor: 'rgba(80, 250, 123, 0.1)'
                      }
                    }}
                  >
                    Switch Back to Admin
                  </Button>
                </>
              )}

            </Box>
          </Box>
          
          <Stack direction="row" spacing={4} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <GroupIcon sx={{ mr: 1, color: ADMIN_COLORS.secondary }} />
              <Typography 
                variant="subtitle1" 
                sx={{
                  ...styles.primaryText
                }}
              >
                Total Users: <strong style={{ color: ADMIN_COLORS.warning }}>{totalCount}</strong>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ShoppingCartIcon sx={{ mr: 1, color: ADMIN_COLORS.secondary }} />
              <Typography 
                variant="subtitle1" 
                sx={{
                  ...styles.primaryText
                }}
              >
                Total Orders: <strong style={{ color: ADMIN_COLORS.warning }}>{totalOrders}</strong>
              </Typography>
            </Box>
          </Stack>
          
          {!hasUsers && (
            <Typography 
              variant="body1" 
              sx={{ 
                mt: 2,
                ...styles.secondaryText
              }}
            >
              No users found.
            </Typography>
          )}
          
          {hasUsers && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {users.map((user, i) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={user.id || i}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%',
                      ...styles.card
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '100%' }}>
                        <Avatar sx={{ 
                          mr: 2, 
                          bgcolor: user.admin ? ADMIN_COLORS.magenta : ADMIN_COLORS.secondary,
                          color: ADMIN_COLORS.hoverBackground
                        }}>
                          {user.admin ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                        </Avatar>
                        <Box sx={{ flexGrow: 1, minWidth: 0, overflow: 'hidden' }}>
                          <Typography 
                            variant="h6" 
                            component="div" 
                            noWrap
                            sx={{
                              ...styles.primaryHeading
                            }}
                          >
                            User #{user.id}
                          </Typography>
                          <MuiLink
                            component="button"
                            onClick={() => this.handleSwitchUser(user.email)}
                            disabled={this.state.switchingUser}
                            sx={{
                              color: ADMIN_COLORS.secondary,
                              textDecoration: 'underline',
                              textDecorationColor: 'transparent',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: 'medium',
                              border: 'none',
                              background: 'none',
                              padding: 0,
                              textAlign: 'left',
                              display: 'block',
                              width: '100%',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              fontFamily: ADMIN_COLORS.fontFamily,
                              '&:hover': {
                                textDecorationColor: ADMIN_COLORS.secondary,
                                color: ADMIN_COLORS.primaryBright
                              },
                              '&:disabled': {
                                color: ADMIN_COLORS.secondaryText,
                                cursor: 'not-allowed'
                              }
                            }}
                            title="Click to switch to this user"
                          >
                            {user.email}
                          </MuiLink>
                        </Box>
                        {user.admin == true&& (
                          <Box sx={{ flexShrink: 0, ml: 1 }}>
                            <Chip 
                              label="Admin" 
                              size="small"
                              sx={{
                                backgroundColor: ADMIN_COLORS.magenta,
                                color: ADMIN_COLORS.hoverBackground,
                                fontFamily: ADMIN_COLORS.fontFamily,
                                fontWeight: 'bold'
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                      
                      <Divider sx={{ mb: 2, borderColor: ADMIN_COLORS.border }} />
                      
                      <List disablePadding>
                        <ListItem sx={{ py: 0.5, px: 0 }}>
                          <ListItemText 
                            primary="Status"
                            secondary={user.admin ? "Administrator" : "User"}
                            primaryTypographyProps={{ 
                              fontSize: '0.875rem', 
                              fontWeight: 'medium',
                              color: ADMIN_COLORS.primaryText,
                              fontFamily: ADMIN_COLORS.fontFamily
                            }}
                            secondaryTypographyProps={{ 
                              color: user.admin ? ADMIN_COLORS.magenta : ADMIN_COLORS.secondary,
                              fontWeight: 'medium',
                              fontFamily: ADMIN_COLORS.fontFamily
                            }}
                          />
                        </ListItem>
                        
                        <ListItem sx={{ py: 0.5, px: 0 }}>
                          <ListItemText 
                            primary="Created"
                            secondary={this.formatDate(user.created_at)}
                            primaryTypographyProps={{ 
                              fontSize: '0.875rem', 
                              fontWeight: 'medium',
                              color: ADMIN_COLORS.primaryText,
                              fontFamily: ADMIN_COLORS.fontFamily
                            }}
                            secondaryTypographyProps={{ 
                              color: ADMIN_COLORS.warning,
                              fontFamily: ADMIN_COLORS.fontFamily
                            }}
                          />
                        </ListItem>

                        <ListItem sx={{ py: 0.5, px: 0 }}>
                          <ListItemText 
                            primary="Orders"
                            secondary={`${user.orderCount || 0} total`}
                            primaryTypographyProps={{ 
                              fontSize: '0.875rem', 
                              fontWeight: 'medium',
                              color: ADMIN_COLORS.primaryText,
                              fontFamily: ADMIN_COLORS.fontFamily
                            }}
                            secondaryTypographyProps={{ 
                              color: ADMIN_COLORS.warning,
                              fontFamily: ADMIN_COLORS.fontFamily
                            }}
                          />
                        </ListItem>
                      </List>



                      {/* All Orders */}
                      {user.orders && user.orders.length > 0 && (
                        <>
                          <Divider sx={{ my: 2, borderColor: ADMIN_COLORS.border }} />
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              mb: 1,
                              ...styles.primaryHeading
                            }}
                          >
                            Orders
                          </Typography>
                          <List disablePadding>
                            {user.orders
                              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort by newest first
                              .map((order, orderIndex) => (
                              <ListItem key={order.orderId || orderIndex} sx={{ py: 0.5, px: 0 }}>
                                <ListItemText 
                                  primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <Typography 
                                        variant="caption" 
                                        sx={{
                                          fontWeight: 'medium',
                                          color: ADMIN_COLORS.primaryText,
                                          fontFamily: ADMIN_COLORS.fontFamily
                                        }}
                                      >
                                        {order.orderId || 'N/A'}
                                      </Typography>
                                      <Chip 
                                        label={order.status || 'unknown'} 
                                        size="small" 
                                        sx={{ 
                                          fontSize: '0.65rem', 
                                          height: 'auto', 
                                          py: 0.25,
                                          backgroundColor: this.getOrderStatusChipColor(order.status),
                                          color: ADMIN_COLORS.hoverBackground,
                                          fontFamily: ADMIN_COLORS.fontFamily,
                                          fontWeight: 'bold'
                                        }}
                                      />
                                    </Box>
                                  }
                                  secondary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                      <Typography 
                                        variant="caption" 
                                        sx={{
                                          color: ADMIN_COLORS.warning,
                                          fontFamily: ADMIN_COLORS.fontFamily
                                        }}
                                      >
                                        {this.formatDate(order.created_at)}
                                      </Typography>
                                      <Typography 
                                        variant="caption" 
                                        sx={{
                                          color: ADMIN_COLORS.primaryBright,
                                          fontWeight: 'medium',
                                          fontFamily: ADMIN_COLORS.fontFamily
                                        }}
                                      >
                                        {order.totalCost ? this.formatPrice(order.totalCost) : 'N/A'}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        {/* Notification Snackbar */}
        <Snackbar
          open={this.state.notification.open}
          autoHideDuration={6000}
          onClose={this.handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={this.handleCloseNotification}
            severity={this.state.notification.severity}
            sx={{ 
              width: '100%',
              backgroundColor: ADMIN_COLORS.surfaceBackground,
              border: `1px solid ${ADMIN_COLORS.border}`,
              color: ADMIN_COLORS.primaryText,
              fontFamily: ADMIN_COLORS.fontFamily,
              '& .MuiAlert-icon': {
                color: this.state.notification.severity === 'success' 
                  ? ADMIN_COLORS.primary
                  : this.state.notification.severity === 'error'
                  ? ADMIN_COLORS.error
                  : ADMIN_COLORS.warning
              },
              '& .MuiAlert-action': {
                color: ADMIN_COLORS.primaryText
              }
            }}
          >
            {this.state.notification.message}
          </Alert>
        </Snackbar>
        </Container>
      </Box>
    );
  }
}

export default UsersPage; 