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
  ListItemText
} from '@mui/material';
import { Navigate } from 'react-router-dom';
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

    this.props.socket.on('cartUpdated', this.handleCartUpdated);
    this.checkUserLoggedIn(); 
    // Set up interval to regularly check login status
    this.checkLoginInterval = setInterval(this.checkUserLoggedIn, 1000);
    // Add storage event listener to detect when user logs out in other tabs
    window.addEventListener('storage', this.handleStorageChange);
  }

  componentWillUnmount() {
    this.props.socket.off('cartUpdated', this.handleCartUpdated);
    // Clear interval and remove event listeners
    if (this.checkLoginInterval) {
      clearInterval(this.checkLoginInterval);
    }
    window.removeEventListener('storage', this.handleStorageChange);
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
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
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
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  }

  getChartOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  })

  render() {
    const { users } = this.state;

    if (this.state.redirect || (!this.state.loading && !this.state.user)) {
      return <Navigate to="/" />;
    }

    const hasUsers = Object.keys(users).length > 0;

    const socketConnectionsData = this.getSocketConnectionsChartData();
    const productViewCallsData = this.getProductViewCallsChartData();

    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Analytics Charts Section */}
        {(socketConnectionsData || productViewCallsData) && (
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <BarChartIcon sx={{ mr: 1 }} />
              30-Day Analytics
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {socketConnectionsData && (
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                        <Line 
                          data={socketConnectionsData}                         
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              
              {productViewCallsData && (
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                        <Line 
                          data={productViewCallsData}                        
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ShoppingCartIcon sx={{ mr: 1 }} />
            Active User Carts
          </Typography>
          
          {!hasUsers && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
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
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                          {user}
                        </Typography>
                        
                        <Divider sx={{ mb: 2 }} />
                        
                        <List disablePadding>
                          {cartItems.map((item, j) => (
                            <ListItem 
                              key={j}
                              divider={j < cartItems.length - 1}
                              sx={{ py: 1 }}
                            >
                              <ListItemText 
                                primary={users[user][item].name}
                                secondary={users[user][item].quantity+' x '+this.formatPrice(users[user][item].price)}
                                primaryTypographyProps={{ fontWeight: 'medium' }}
                                secondaryTypographyProps={{ color: 'primary.dark', fontWeight: 'bold' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                        
                        <Box sx={{ mt: 2, textAlign: 'right' }}>
                          <Typography variant="subtitle1" fontWeight="bold">
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
    );
  }
}

export default AdminPage;
