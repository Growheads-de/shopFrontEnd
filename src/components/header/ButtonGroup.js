import React, { Component } from 'react';
import { Box, Badge, Drawer, IconButton, Divider, Typography } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import LoginComponent from '../LoginComponent.js';
import CartDropdown from '../CartDropdown.js';
import { isUserLoggedIn } from '../LoginComponent.js';

function getBadgeNumber() {
  let count = 0;
  if(window.cart) for(const item of Object.values(window.cart)){
    if(item.quantity) count += item.quantity;
  }
  return count;
}

class ButtonGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isCartOpen: false,
      badgeNumber: getBadgeNumber()
    };
  }

  componentDidMount() { 
    this.cart = () => {
      this.props.socket.emit('updateCart', window.cart);

      this.setState({
        badgeNumber: getBadgeNumber()
      });
    };
    window.addEventListener('cart', this.cart);
    
    // Add event listener for the toggle-cart event from AddToCartButton
    this.toggleCartListener = () => this.toggleCart();
    window.addEventListener('toggle-cart', this.toggleCartListener);
    this.props.socket.on('cartUpdated', this.handleCartUpdated);
  }

  componentWillUnmount() {
    window.removeEventListener('cart', this.cart); 
    this.props.socket.off('cartUpdated', this.handleCartUpdated);
    window.removeEventListener('toggle-cart', this.toggleCartListener);
  }

  handleCartUpdated = (id,user,cart) => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if(user && parsedUser &&user.email == parsedUser.email){
          window.cart = cart;
          this.setState({
            badgeNumber: getBadgeNumber()
          });
        }
      } catch (error) {
        console.error('Error parsing user from sessionStorage:', error);
      }
    }
  }


  toggleCart = () => {
    this.setState(prevState => ({
      isCartOpen: !prevState.isCartOpen
    }));
  }

  render() {
    const { socket, navigate } = this.props;
    const { isCartOpen } = this.state;
    const cartItems = window.cart || {};
    
    return (
      <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
        
        
        <LoginComponent socket={socket} />
                
        <IconButton 
          color="inherit" 
          onClick={this.toggleCart}
          sx={{ ml: 1 }}
        >
          <Badge badgeContent={this.state.badgeNumber} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
        
        <Drawer
          anchor="left"
          open={isCartOpen}
          onClose={this.toggleCart}
          disableScrollLock={true}
        >
          <Box sx={{ width: 420, p: 2 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 1
              }}
            >
              <IconButton 
                onClick={this.toggleCart} 
                size="small"
                sx={{ 
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
              <Typography variant="h6">Warenkorb</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <CartDropdown cartItems={cartItems} socket={socket} onClose={this.toggleCart} onCheckout={()=>{
              /*open the Drawer inside <LoginComponent */ 
              
              if (isUserLoggedIn().isLoggedIn) {
                this.toggleCart(); // Close the cart drawer
                navigate('/profile');
              } else if (window.openLoginDrawer) {
                window.openLoginDrawer(); // Call global function to open login drawer
                this.toggleCart(); // Close the cart drawer
              } else {
                console.error('openLoginDrawer function not available');
              }
            }}/>

          </Box>
        </Drawer>
      </Box>
    );
  }
}

// Wrapper for ButtonGroup to provide navigate function
const ButtonGroupWithRouter = (props) => {
  const navigate = useNavigate();
  return <ButtonGroup {...props} navigate={navigate} />;
};

export default ButtonGroupWithRouter; 