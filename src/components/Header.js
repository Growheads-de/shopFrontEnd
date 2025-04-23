import React, { Component } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Typography, 
  Box, 
  TextField, 
  InputAdornment,
  Container,
  Badge,
  Drawer,
  IconButton,
  Divider
} from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import SocketContext from '../contexts/SocketContext.js';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LoginComponent from './LoginComponent.js';
import CartDropdown from './CartDropdown.js';
import { isUserLoggedIn } from './LoginComponent.js';
// Logo Subcomponent
const Logo = () => {
  return (
    <Box 
      component={Link} 
      to="/"
      sx={{ 
        display: 'flex', 
        alignItems: 'center',
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      <LocalFloristIcon sx={{ mr: 1, fontSize: 28 }} />
      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
        GrowBNB
      </Typography>
    </Box>
  );
}

// SearchBar Subcomponent with hooks
const SearchBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get('q') || '');
  const debounceTimerRef = React.useRef(null);
  const isFirstKeystrokeRef = React.useRef(true);

  const handleSearch = (e) => {
    e.preventDefault();
    delete window.currentSearchQuery;
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const updateSearchState = (value) => {
    setSearchQuery(value);
    
    // Dispatch global custom event with search query value
    const searchEvent = new CustomEvent('search-query-change', { 
      detail: { query: value } 
    });
    // Store the current search query in the window object
    window.currentSearchQuery = value;
    window.dispatchEvent(searchEvent);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    
    // Always update the input field immediately for responsiveness
    setSearchQuery(value);
    
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set the debounce timer with appropriate delay
    const delay = isFirstKeystrokeRef.current ? 100 : 200;
    
    debounceTimerRef.current = setTimeout(() => {
      updateSearchState(value);
      isFirstKeystrokeRef.current = false;
      
      // Reset first keystroke flag after 1 second of inactivity
      debounceTimerRef.current = setTimeout(() => {
        isFirstKeystrokeRef.current = true;
      }, 1000);
    }, delay);
  };

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <Box 
      component="form" 
      onSubmit={handleSearch}
      sx={{ flexGrow: 1, mx: { xs: 1, sm: 2, md: 4 }, display: { xs: 'none', sm: 'block' } }}
    >
      <TextField
        placeholder="Produkte suchen..."
        variant="outlined"
        size="small"
        fullWidth
        value={searchQuery}
        onChange={handleSearchChange}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          sx: { borderRadius: 2, bgcolor: 'background.paper' }/*,
          endAdornment: (
            <InputAdornment position="end">
              <Button 
                variant="contained" 
                color="primary" 
                size="small" 
                type="submit"
                sx={{ borderRadius: 1, minWidth: 'unset', p: '4px 8px' }}
              >
                Suchen
              </Button>
            </InputAdornment>
          )*/
        }}
      />
    </Box>
  );
}

function getBadgeNumber() {
  let count = 0;
  if(window.cart) for(const item of Object.values(window.cart)){
    if(item.quantity) count += item.quantity;
  }
  return count;
}

// ButtonGroup Subcomponent
class ButtonGroup extends Component {
  constructor(props) {
    super(props);
    console.log("cart", window.cart, getBadgeNumber());
    this.state = {
      isCartOpen: false,
      badgeNumber: getBadgeNumber()
    };
  }

  componentDidMount() { 
    this.cart = () => {
      console.log("cart", window.cart, getBadgeNumber());

      this.setState({
        badgeNumber: getBadgeNumber()
      });
    };
    window.addEventListener('cart', this.cart);
    
    // Add event listener for the toggle-cart event from AddToCartButton
    this.toggleCartListener = () => this.toggleCart();
    window.addEventListener('toggle-cart', this.toggleCartListener);
  }

  componentWillUnmount() {
    window.removeEventListener('cart', this.cart);
    window.removeEventListener('toggle-cart', this.toggleCartListener);
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
    console.log("badgeNumber", this.state.badgeNumber, cartItems);
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

// CategoryList Subcomponent
class CategoryList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      fetchedCategories: false
    };
  }

  componentDidMount() {
    this.fetchCategories();
  }
  
  componentDidUpdate(prevProps) {
    // If socket becomes available or changes
    if (!prevProps.socket && this.props.socket) {
      this.fetchCategories();
    }
  }
  
  fetchCategories = () => {
    const { socket } = this.props;
    if (!socket) {
      console.error('No socket available for CategoryList');
      return;
    }
    
    if (this.state.fetchedCategories) {
      console.log('Categories already fetched, skipping');
      return;
    }
    
    // Initialize global cache object if it doesn't exist
    if (!window.productCache) {
      window.productCache = {};
    }
    
    // Check if we have a valid cache in the global object
    try {
      const cacheKey = 'categoryList';
      const cachedData = window.productCache[cacheKey];
      if (cachedData) {
        const { categories, timestamp } = cachedData;
        const cacheAge = Date.now() - timestamp;
        const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
        
        // If cache is less than 10 minutes old, use it
        if (cacheAge < tenMinutes && Array.isArray(categories)) {
          console.log('Using cached categories, age:', Math.round(cacheAge/1000), 'seconds');
          this.setState({ 
            categories,
            fetchedCategories: true 
          });
          return;
        }
      }
    } catch (err) {
      console.error('Error reading from cache:', err);
    }
    
    console.log('CategoryList: Fetching categories from socket');
    socket.emit('categoryList', {}, (response) => {
      console.log('CategoryList response:', response);
      if (response && response.categories) {
        console.log('Categories received:', response.categories.length);
        
        // Store in global cache with timestamp
        try {
          const cacheKey = 'categoryList';
          window.productCache[cacheKey] = {
            categories: response.categories,
            timestamp: Date.now()
          };
        } catch (err) {
          console.error('Error writing to cache:', err);
        }
        
        this.setState({ 
          categories: response.categories,
          fetchedCategories: true 
        }, () => {
          console.log('Categories in state:', this.state.categories);
        });
      } else {
        console.error('No categories in response:', response);
      }
    });
  }
  
  render() {
    const { categories } = this.state;
    console.log('CategoryList render - categories:', categories);
    
    // Debug output to help diagnose the issue
    if (categories && categories.length > 0) {
      console.log('Categories should be visible, first category:', categories[0]);
    } else {
      console.log('Categories not visible, categories array:', categories);
    }
    
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
              justifyContent: categories.length <= 5 ? 'center' : 'space-between',
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
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((category) => (
                <Button
                  key={category.id}
                  component={Link}
                  to={`/category/${category.id}`}
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
                  {category.name}
                </Button>
              ))
            ) : (
              <Typography variant="caption" color="inherit">Loading categories...</Typography>
            )}
          </Box>
        </Container>
      </Box>
    );
  }
}

// Main Header Component
class Header extends Component {
  static contextType = SocketContext;

  constructor(props) {
    super(props);
    this.state = {
      cartItems: []
    };
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
    //const { cartItems } = this.state;
    // Get socket directly from context in render method
    const socket = this.context;

    return (
      <AppBar position="sticky" color="primary" elevation={0} sx={{ zIndex: 1100 }}>
        <Toolbar sx={{ minHeight: 64 }}>
          <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center' }}>
            <Logo />
            <SearchBarWithRouter />
            <ButtonGroupWithRouter socket={socket}/>
          </Container>
        </Toolbar>
        <CategoryList socket={socket} />
      </AppBar>
    );
  }
}

// Wrapper components for router hooks
const SearchBarWithRouter = () => <SearchBar />;

// Use a wrapper function to provide context
const HeaderWithContext = (props) => (
  <SocketContext.Consumer>
    {socket => <Header {...props} socket={socket} />}
  </SocketContext.Consumer>
);

export default HeaderWithContext; 