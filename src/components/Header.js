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
  Container
} from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import CartDropdown from './CartDropdown.js';
import SocketContext from '../contexts/SocketContext.js';
import { Link, useNavigate, useLocation } from 'react-router-dom';

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
  
  handleGoToCart = () => {
    this.setState({ anchorEl: null });
    // Navigation will be handled by Link component
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
          Warenkorb
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
          disableScrollLock={true}
          keepMounted
          slotProps={{
            backdrop: {
              invisible: false,
              sx: { 
                bgcolor: 'rgba(0, 0, 0, 0.4)', 
                backdropFilter: 'blur(2px)'
              }
            }
          }}
          transitionDuration={{ enter: 225, exit: 0 }}
        >
          {open && (
            <CartDropdown 
              cartItems={cartItems}
              onClose={this.handleCartClose}
              onQuantityChange={onQuantityChange}
              onRemoveItem={onRemoveItem}
              onGoToCart={this.handleGoToCart}
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
        <CartButton 
          cartItems={cartItems}
          onQuantityChange={onCartQuantityChange}
          onRemoveItem={onCartRemoveItem}
        />
      </Box>
    );
  }
}
console.log(ButtonGroup,SearchBarWithRouter)

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
            {/*<ButtonGroup 
              cartItems={cartItems}
              onCartQuantityChange={this.handleCartQuantityChange}
              onCartRemoveItem={this.handleCartRemoveItem}
            />*/}
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