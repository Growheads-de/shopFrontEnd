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
  Tabs,
  Tab
} from '@mui/material';
import { Navigate, Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ADMIN_COLORS, getAdminStyles } from '../theme/adminColors.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

class AdminPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      users: {},   
      user: null,
      stats: null,
      loading: true,
      redirect: false
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
  handleCartUpdated = (id,user,cart,id2) => {
    const users = this.state.users;
    if(user && user.email) id = user.email;
    if(id2) id=id2;
    if(cart) users[id] = cart;
    if(!users[id]) delete users[id];
    console.log(users);
    this.setState({ users });
  }



  componentDidMount() {
    this.loadInitialData();
    this.addSocketListeners();
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
      // Socket just connected, add listeners and reload data
      this.addSocketListeners();
      this.loadInitialData();
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

  loadInitialData = () => {
    if (this.props.socket && this.props.socket.connected) {
      this.props.socket.emit('getStats', (stats) => {
        console.log('AdminPage: getStats', JSON.stringify(stats,null,2));
        this.setState({stats: stats});
      });
      this.props.socket.emit('initialCarts', (carts) => {
        console.log('AdminPage: initialCarts', carts);
        if(carts && carts.success == true)
        {
          const users = {};
          for(const item of carts.carts){
            const user = {email:item.email};
            let id = item.clientUrlId || item.socketId;
            const cart = item.cart;
            if(user && user.email) id = user.email;
            if(cart) users[id] = cart;   
          }
          this.setState({ users: users });
        }
      });
    }
  }

  addSocketListeners = () => {
    if (this.props.socket && this.props.socket.connected) {
      // Remove existing listeners first to avoid duplicates
      this.removeSocketListeners();
      this.props.socket.on('cartUpdated', this.handleCartUpdated);
    }
  }

  removeSocketListeners = () => {
    if (this.props.socket) {
      this.props.socket.off('cartUpdated', this.handleCartUpdated);
    }
  }

  formatPrice = (price) => {
    return typeof price === 'number' 
      ? `€${price.toFixed(2)}` 
      : price;
  }

  prepareChartData = () => {
    if (!this.state.stats || !this.state.stats.data || !this.state.stats.data.last30Days) {
      return null;
    }

    const dailyData = this.state.stats.data.last30Days.dailyData || [];
    
    // Sort data by date to ensure proper chronological order
    const sortedData = [...dailyData].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const labels = sortedData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const socketConnections = sortedData.map(item => item.socket_connections || 0);
    const productViewCalls = sortedData.map(item => item.get_product_view_calls || 0);

    return {
      labels,
      socketConnections,
      productViewCalls
    };
  }

  getSocketConnectionsChartData = () => {
    const data = this.prepareChartData();
    if (!data) return null;

    return {
      labels: data.labels,
      datasets: [
        {
          label: 'Site Visits',
          data: data.socketConnections,
          borderColor: '#8be9fd', // terminal.ansiCyan
          backgroundColor: 'rgba(139, 233, 253, 0.2)', // terminal.ansiCyan with transparency
          tension: 0.1,
          pointBackgroundColor: '#8be9fd',
          pointBorderColor: '#8be9fd',
        },
      ],
    };
  }

  getProductViewCallsChartData = () => {
    const data = this.prepareChartData();
    if (!data) return null;

    return {
      labels: data.labels,
      datasets: [
        {
          label: 'Product Detail Page Visits',
          data: data.productViewCalls,
          backgroundColor: 'rgba(255, 121, 198, 0.2)', // terminal.ansiMagenta with transparency
          borderColor: '#ff79c6', // terminal.ansiMagenta
          borderWidth: 2,
          tension: 0.1,
          pointBackgroundColor: '#ff79c6',
          pointBorderColor: '#ff79c6',
        },
      ],
    };
  }

  getChartOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: ADMIN_COLORS.primaryText,
          font: {
            family: ADMIN_COLORS.fontFamily
          }
        }
      },
      title: {
        display: true,
        text: title,
        color: ADMIN_COLORS.primary,
        font: {
          family: ADMIN_COLORS.fontFamily,
          weight: 'bold'
        }
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: ADMIN_COLORS.primaryText,
          font: {
            family: ADMIN_COLORS.fontFamily
          }
        },
        grid: {
          color: ADMIN_COLORS.border
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: ADMIN_COLORS.primaryText,
          font: {
            family: ADMIN_COLORS.fontFamily
          }
        },
        grid: {
          color: ADMIN_COLORS.border
        }
      },
    },
    backgroundColor: ADMIN_COLORS.surfaceBackground,
    color: ADMIN_COLORS.primaryText
  })

  render() {
    const { users } = this.state;

    if (this.state.redirect || (!this.state.loading && !this.state.user)) {
      return <Navigate to="/" />;
    }

    // Check if current user is admin
    if (this.state.user && !this.state.user.admin) {
      return <Navigate to="/" />;
    }

    const hasUsers = Object.keys(users).length > 0;

    const socketConnectionsData = this.getSocketConnectionsChartData();
    const productViewCallsData = this.getProductViewCallsChartData();

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
            value={0}
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
                fontWeight: 'bold',
                color: ADMIN_COLORS.primary,
                fontFamily: ADMIN_COLORS.fontFamily
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
                color: ADMIN_COLORS.primaryText,
                fontFamily: ADMIN_COLORS.fontFamily,
                '&:hover': {
                  color: ADMIN_COLORS.primaryBright
                }
              }}
            />
          </Tabs>
        </Paper>
        {/* Analytics Charts Section */}
        {(socketConnectionsData || productViewCallsData) && (
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 4,
              ...styles.contentPaper
            }}
          >
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                ...styles.primaryHeading
              }}
            >
              <BarChartIcon sx={{ mr: 1, color: ADMIN_COLORS.primary }} />
              30-Day Analytics
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {socketConnectionsData && (
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Card 
                    variant="outlined"
                    sx={styles.card}
                  >
                    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                        <Line 
                          data={socketConnectionsData}
                          options={this.getChartOptions('Site Visits')}                         
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              
              {productViewCallsData && (
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Card 
                    variant="outlined"
                    sx={styles.card}
                  >
                    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                        <Line 
                          data={productViewCallsData}
                          options={this.getChartOptions('Product Detail Page Visits')}                        
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}

        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4,
            ...styles.contentPaper
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              ...styles.primaryHeading
            }}
          >
            <ShoppingCartIcon sx={{ mr: 1, color: ADMIN_COLORS.primary }} />
            Active User Carts
          </Typography>
          
          {!hasUsers && (
            <Typography 
              variant="body1" 
              sx={{ 
                mt: 2,
                ...styles.secondaryText
              }}
            >
              No active user carts at the moment.
            </Typography>
          )}
          
          {hasUsers && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {Object.keys(users).map((user, i) => {
                const cartItems = Object.keys(users[user]);
                const totalValue = cartItems.reduce((total, item) => {
                  return total + (parseFloat(users[user][item].price) || 0);
                }, 0);
                
                return (
                  <Grid size={{ xs: 12, md: 6 }} key={i}>
                    <Card 
                      variant="outlined"
                      sx={styles.card}
                    >
                      <CardContent>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 2,
                            ...styles.primaryHeading
                          }}
                        >
                          <PersonIcon sx={{ mr: 1, color: ADMIN_COLORS.primary }} />
                          {user}
                        </Typography>
                        
                        <Divider sx={{ mb: 2, borderColor: ADMIN_COLORS.border }} />
                        
                        <List disablePadding>
                          {cartItems.map((item, j) => (
                            <ListItem 
                              key={j}
                              divider={j < cartItems.length - 1}
                              sx={{ 
                                py: 1,
                                borderBottom: j < cartItems.length - 1 ? `1px solid ${ADMIN_COLORS.border}` : 'none'
                              }}
                            >
                              <ListItemText 
                                primary={users[user][item].name}
                                secondary={users[user][item].quantity+' x '+this.formatPrice(users[user][item].price)}
                                primaryTypographyProps={{ 
                                  fontWeight: 'medium',
                                  ...styles.primaryText
                                }}
                                secondaryTypographyProps={{ 
                                  color: ADMIN_COLORS.warning,
                                  fontWeight: 'bold',
                                  fontFamily: ADMIN_COLORS.fontFamily
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                        
                        <Box sx={{ mt: 2, textAlign: 'right' }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{
                              fontWeight: 'bold',
                              color: ADMIN_COLORS.primaryBright,
                              fontFamily: ADMIN_COLORS.fontFamily
                            }}
                          >
                            Total: {this.formatPrice(totalValue)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Paper>
        </Container>
      </Box>
    );
  }
}

export default AdminPage;
