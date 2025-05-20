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
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

class AdminPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      users: {}
    };
  }

  handleCartUpdated = (id,user,cart) => {
    const users = this.state.users;
    if(user && user.email) id = user.email;
    if(cart) users[id] = cart;
    if(!users[id]) delete users[id];
    console.log(users);
    this.setState({ users });
  }

  componentDidMount() {
    this.props.socket.on('cartUpdated', this.handleCartUpdated);
  }
  componentWillUnmount() {
    this.props.socket.off('cartUpdated', this.handleCartUpdated);
  }

  formatPrice = (price) => {
    return typeof price === 'number' 
      ? `€${price.toFixed(2)}` 
      : price;
  }

  render() {
    const { users } = this.state;
    const hasUsers = Object.keys(users).length > 0;

    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
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
                  <Grid item xs={12} md={6} key={i}>
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
