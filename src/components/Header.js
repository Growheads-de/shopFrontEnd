import React, { Component } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Typography, 
  Box, 
  TextField, 
  InputAdornment, 
  Badge, 
  Popover,
  Divider,
  Container
} from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import CartDropdown from './CartDropdown.js';

// Logo Subcomponent
class Logo extends Component {
  render() {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <LocalFloristIcon sx={{ mr: 1, fontSize: 28 }} />
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
          Green Essentials
        </Typography>
      </Box>
    );
  }
}

// SearchBar Subcomponent
class SearchBar extends Component {
  render() {
    return (
      <Box sx={{ flexGrow: 1, mx: { xs: 1, sm: 2, md: 4 }, display: { xs: 'none', sm: 'block' } }}>
        <TextField
          placeholder="Search products..."
          variant="outlined"
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: { borderRadius: 2, bgcolor: 'background.paper' }
          }}
        />
      </Box>
    );
  }
}

// CartButton Subcomponent
class CartButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
    };
  }

  handleCartClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleCartClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { anchorEl } = this.state;
    const { cartItems, onQuantityChange, onRemoveItem } = this.props;
    const open = Boolean(anchorEl);
    
    // Calculate total items in cart
    const itemCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

    // Debug cart items
    console.log('CartButton render:', { cartItems, itemCount });

    return (
      <Box sx={{ position: 'relative' }}>
        <Button 
          color="inherit" 
          startIcon={
            <Badge badgeContent={itemCount} color="secondary" 
              sx={{ '& .MuiBadge-badge': { fontWeight: 'bold', fontSize: 10 } }}
            >
              <ShoppingCartIcon />
            </Badge>
          }
          onClick={this.handleCartClick}
          sx={{ 
            borderRadius: 2,
            fontWeight: 'bold',
            border: '1px solid rgba(255,255,255,0.5)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          Cart
        </Button>
        
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={this.handleCartClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: { 
              width: { xs: '100%', sm: 400 },
              mt: 0.5,
              boxShadow: 5,
              borderRadius: 2,
              overflow: 'hidden'
            }
          }}
        >
          {open && (
            <CartDropdown 
              cartItems={cartItems}
              onClose={this.handleCartClose}
              onQuantityChange={onQuantityChange}
              onRemoveItem={onRemoveItem}
            />
          )}
        </Popover>
      </Box>
    );
  }
}

// ButtonGroup Subcomponent
class ButtonGroup extends Component {
  render() {
    const { cartItems, onCartQuantityChange, onCartRemoveItem } = this.props;
    
    return (
      <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
        <Button 
          color="inherit" 
          startIcon={<ContactSupportIcon />}
          sx={{ 
            borderRadius: 2,
            display: { xs: 'none', md: 'flex' },
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          Contact
        </Button>
        <Button 
          color="inherit" 
          startIcon={<PersonIcon />}
          sx={{ 
            borderRadius: 2,
            display: { xs: 'none', sm: 'flex' },
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          Login
        </Button>
        
        <CartButton 
          cartItems={cartItems}
          onQuantityChange={onCartQuantityChange}
          onRemoveItem={onCartRemoveItem}
        />
      </Box>
    );
  }
}

// CategoryList Subcomponent
class CategoryList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [
        "Seeds",
        "Growing Equipment",
        "Lighting",
        "Hydroponic Systems",
        "Nutrients",
        "Ventilation",
        "Plant Care",
        "Harvesting Tools",
        "Accessories",
        "Deals"
      ]
    };
  }
  
  render() {
    const { categories } = this.state;
    
    return (
      <Box 
        sx={{ 
          width: '100%',
          bgcolor: 'primary.dark',
          py: 0.75,
          px: 2,
          display: { xs: 'none', md: 'block' }
        }}
      >
        <Container maxWidth="lg">
          <Box 
            sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {categories.map((category, index) => (
              <Button
                key={index}
                color="inherit"
                size="small"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 'normal',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  opacity: 0.9,
                  mx: 0.5,
                  '&:hover': {
                    opacity: 1,
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                {category}
              </Button>
            ))}
          </Box>
        </Container>
      </Box>
    );
  }
}

// Main Header Component
class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cartItems: []
    };
  }

  // This method would normally be connected to a global state
  // For now we'll just simulate cart functionality in the header
  componentDidMount() {
    // Mock cart data for testing
    setTimeout(() => {
      this.setState({
        cartItems: [
          { id: 1, name: 'Cannabis Seeds (OG Kush)', price: 49.99, quantity: 2 },
          { id: 2, name: 'LED Grow Light 1000W', price: 249.99, quantity: 1 }
        ]
      });
      console.log('Header: mock cart data loaded');
    }, 100);
  }

  handleCartQuantityChange = (productId, quantity) => {
    this.setState(prevState => ({
      cartItems: prevState.cartItems.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    }));
  };

  handleCartRemoveItem = (productId) => {
    this.setState(prevState => ({
      cartItems: prevState.cartItems.filter(item => item.id !== productId)
    }));
  };

  render() {
    const { cartItems } = this.state;
    
    // Debug cart items in header
    console.log('Header render:', { cartItems });
    
    return (
      <AppBar position="static" color="primary" elevation={3}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Logo />
          <SearchBar />
          <ButtonGroup 
            cartItems={cartItems}
            onCartQuantityChange={this.handleCartQuantityChange}
            onCartRemoveItem={this.handleCartRemoveItem}
          />
        </Toolbar>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <CategoryList />
      </AppBar>
    );
  }
}

export default Header; 