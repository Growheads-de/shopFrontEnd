import React, { Component } from 'react';
import { Container, Typography, Breadcrumbs, Link, Box } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import ProductFilters from './ProductFilters.js';
import ProductList from './ProductList.js';
import { useLocation, useParams, Link as RouterLink } from 'react-router-dom';
import SocketContext from '../contexts/SocketContext.js';

// Helper function to get query parameters
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

// Wrapper component to convert class component to function component with hooks
const ContentWithRouter = () => {
  const location = useLocation();
  const params = useParams();
  const query = useQuery();
  
  const searchQuery = query.get('q');
  const categoryId = params.categoryId;
  
  return (
    <SocketContext.Consumer>
      {socket => (
        <Content 
          location={location} 
          searchQuery={searchQuery} 
          categoryId={categoryId}
          socket={socket}
        />
      )}
    </SocketContext.Consumer>
  );
};

class Content extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      activeCategory: "All Products",
      categories: {},
      products: [],
      filteredProducts: [],
      isLoading: true,
      error: null,
      activeFilters: {
        availability: {
          inStock: false
        }
      }
    };
  }

  componentDidMount() {
    this.initializeProducts();
  }
  
  componentDidUpdate(prevProps) {
    // If search query or category changed, update products
    if (prevProps.searchQuery !== this.props.searchQuery || 
        prevProps.categoryId !== this.props.categoryId) {
      this.initializeProducts();
    }
  }
  
  
  initializeProducts = () => {
    const { searchQuery, categoryId, socket } = this.props;
    
    this.setState({ isLoading: true, error: null });
    console.log('Initializing products with categoryId:', categoryId);
    
    if (categoryId && socket) {
      // Fetch products for specific category
      console.log('Fetching products for category:', categoryId);
      
      // Check if we have a valid cache in localStorage
      const cacheKey = `categoryProducts_${categoryId}`;
      try {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const { products, timestamp } = JSON.parse(cachedData);
          const cacheAge = Date.now() - timestamp;
          const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
          
          // If cache is less than 10 minutes old, use it
          if (cacheAge < tenMinutes && Array.isArray(products)) {
            console.log(`Using cached products for category ${categoryId}, age:`, Math.round(cacheAge/1000), 'seconds');
            let pageTitle = this.state.categories[categoryId] || "Category";
            let filteredProducts = products;
            
            // Filter by search query if provided
            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              filteredProducts = filteredProducts.filter(product => 
                product.name.toLowerCase().includes(query)
              );
              pageTitle = `Search Results for "${searchQuery}"`;
            }
            
            this.setState({ 
              products: products,
              filteredProducts,
              activeCategory: pageTitle,
              isLoading: false
            }, this.applyFilters);
            return;
          }
        }
      } catch (err) {
        console.error('Error reading category products from cache:', err);
      }
      
      socket.emit('getCategoryProducts', { categoryId: parseInt(categoryId) }, (response) => {
        console.log('getCategoryProducts response');
        if (response && response.products) {
          // Store in localStorage with timestamp
          try {
            localStorage.setItem(cacheKey, JSON.stringify({
              products: response.products,
              timestamp: Date.now()
            }));
          } catch (err) {
            console.error('Error writing category products to cache:', err);
          }
          
          let pageTitle = this.state.categories[categoryId] || "Category";
          let filteredProducts = response.products;
          
          // Filter by search query if provided
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredProducts = filteredProducts.filter(product => 
              product.name.toLowerCase().includes(query)
            );
            pageTitle = `Search Results for "${searchQuery}"`;
          }
          
          this.setState({ 
            products: response.products,
            filteredProducts,
            activeCategory: pageTitle,
            isLoading: false
          }, this.applyFilters);
        } else {
          console.error('Failed to get category products:', response);
          this.setState({ 
            error: "Failed to load products", 
            isLoading: false 
          });
        }
      });
    } else if (searchQuery) {
      // Handle search only
      console.log('Search query:', searchQuery);
      // In a real app, you would have a search API endpoint
      // For now, search across all products (would need to load all products first)
      this.setState({
        activeCategory: `Search Results for "${searchQuery}"`,
        isLoading: false
      });
    }

  }

  handleFilterChange = (filter) => {
    this.setState(prevState => {
      const newFilters = { ...prevState.activeFilters };
      
      switch (filter.type) {
        case 'availability':
          newFilters.availability = {
            ...newFilters.availability,
            [filter.name]: filter.value
          };
          break;
        case 'sortBy':
          // Handle sort type
          console.log('Sort by:', filter.value);
          break;
        default:
          break;
      }
      
      return { activeFilters: newFilters };
    }, this.applyFilters);
  };

  applyFilters = () => {
    const { activeFilters } = this.state;
    let products = [...this.state.products];
    
    // Apply availability filter only
    products = products.filter(product => {
      // Availability filter - only show in-stock items if checked
      if (product.available==0 && activeFilters.availability.inStock) {
        return false
      }
      
      return true;
    });
    
    this.setState({ filteredProducts: products });
  };

  generateBreadcrumbs = () => {
    const { searchQuery, categoryId } = this.props;
    const { categories } = this.state;
    
    if (searchQuery) {
      return (
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 4 }}
        >
          <Link
            component={RouterLink}
            to="/"
            color="inherit"
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
            Home
          </Link>
          <Typography color="text.primary">Search Results</Typography>
        </Breadcrumbs>
      );
    }
    
    if (categoryId) {
      const categoryName = categories[categoryId] || "Category";
      
      return (
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 4 }}
        >
          <Link
            component={RouterLink}
            to="/"
            color="inherit"
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
            Home
          </Link>
          <Link
            component={RouterLink}
            to="/products"
            color="inherit"
            sx={{ '&:hover': { color: 'primary.main' } }}
          >
            Products
          </Link>
          <Typography color="text.primary">{categoryName}</Typography>
        </Breadcrumbs>
      );
    }
    
    return (
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 4 }}
      >
        <Link
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            '&:hover': { color: 'primary.main' }
          }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
          Home
        </Link>
        <Typography color="text.primary">Products</Typography>
      </Breadcrumbs>
    );
  }

  render() {
    const { activeCategory, filteredProducts, isLoading, error } = this.state;

    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs Navigation */}
        {this.generateBreadcrumbs()}
        
        {/* Main Content Layout */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Filters - 1/3 width */}
          <Box sx={{ width: { xs: '100%', md: '25%', lg: '25%' } }}>
            <ProductFilters 
              onFilterChange={this.handleFilterChange}
              onFilterReset={this.handleFilterReset}
            />
          </Box>
          
          {/* Product List - 2/3 width */}
          <Box sx={{ width: { xs: '100%', md: '75%', lg: '75%' } }}>
            <ProductList 
              products={filteredProducts}
              title={activeCategory}
              isLoading={isLoading}
              error={error}
            />
          </Box>
        </Box>
      </Container>
    );
  }
}

export default ContentWithRouter; 
