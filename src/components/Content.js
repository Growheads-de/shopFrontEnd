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
        priceRange: [0, 300],
        availability: {
          inStock: true,
          outOfStock: true
        },
        categories: {}
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
      socket.emit('getCategoryProducts', { categoryId: parseInt(categoryId) }, (response) => {
        console.log('getCategoryProducts response:', response);
        if (response && response.products) {
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
    } else {
      // Show all products or handle appropriately
      if (socket) {
        console.log('Fetching all products');
        socket.emit('getAllProducts', {}, (response) => {
          console.log('getAllProducts response:', response);
          if (response && response.products) {
            this.setState({ 
              products: response.products,
              filteredProducts: response.products,
              activeCategory: "All Products",
              isLoading: false
            }, this.applyFilters);
          } else {
            console.error('Failed to get all products:', response);
            this.setState({ 
              error: "Failed to load products", 
              isLoading: false 
            });
          }
        });
      } else {
        console.error('No socket available for product fetching');
        this.setState({ isLoading: false });
      }
    }
  }

  handleFilterChange = (filter) => {
    this.setState(prevState => {
      const newFilters = { ...prevState.activeFilters };
      
      switch (filter.type) {
        case 'price':
          newFilters.priceRange = filter.value;
          break;
        case 'availability':
          newFilters.availability = {
            ...newFilters.availability,
            [filter.name]: filter.value
          };
          break;
        case 'category':
          newFilters.categories = {
            ...newFilters.categories,
            [filter.name]: filter.value
          };
          break;
        default:
          break;
      }
      
      return { activeFilters: newFilters };
    }, this.applyFilters);
  };

  handleFilterReset = () => {
    this.setState({
      activeFilters: {
        priceRange: [0, 300],
        availability: {
          inStock: true,
          outOfStock: true
        },
        categories: {}
      }
    }, this.applyFilters);
  };

  applyFilters = () => {
    const { activeFilters } = this.state;
    let products = [...this.state.products];
    
    // Apply additional filters
    products = products.filter(product => {
      // Price filter
      if (
        product.price < activeFilters.priceRange[0] ||
        product.price > activeFilters.priceRange[1]
      ) {
        return false;
      }
      
      // Availability filter
      if (
        (product.available && !activeFilters.availability.inStock) ||
        (!product.available && !activeFilters.availability.outOfStock)
      ) {
        return false;
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