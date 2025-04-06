import React, { Component } from 'react';
import { Container, Typography, Breadcrumbs, Link, Box } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import ProductFilters from './ProductFilters.js';
import ProductList from './ProductList.js';

class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeCategory: "All Products",
      products: [
        { id: 1, name: 'Cannabis Seeds (OG Kush)', price: 49.99, available: true },
        { id: 2, name: 'LED Grow Light 1000W', price: 249.99, available: true },
        { id: 3, name: 'Hydroponic System Kit', price: 189.99, available: false },
        { id: 4, name: 'Nutrient Solution Pack', price: 39.99, available: true },
        { id: 5, name: 'Carbon Air Filter', price: 79.99, available: true },
        { id: 6, name: 'Grow Tent 4x4', price: 129.99, available: false },
        { id: 7, name: 'pH Meter Digital', price: 24.99, available: true },
        { id: 8, name: 'Trimming Scissors Set', price: 19.99, available: true },
        { id: 9, name: 'Plant Support Trellis', price: 15.99, available: true },
        { id: 10, name: 'Soil Mix Premium', price: 29.99, available: false },
        { id: 11, name: 'Ventilation Fan System', price: 89.99, available: true },
        { id: 12, name: 'Cannabis Drying Rack', price: 34.99, available: true },
      ],
      filteredProducts: [],
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
    // Initialize filtered products with all products
    this.setState({ filteredProducts: [...this.state.products] });
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
    const { products, activeFilters } = this.state;
    
    const filteredProducts = products.filter(product => {
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
      
      // Category filters would go here if we had category data on products
      // This is just a placeholder for demonstration
      
      return true;
    });
    
    this.setState({ filteredProducts });
  };

  handleCategoryChange = (category) => {
    this.setState({ activeCategory: category });
    // In a real application, this would also filter products by category
  };

  render() {
    const { activeCategory, filteredProducts } = this.state;

    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs Navigation */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 4 }}
        >
          <Link
            color="inherit"
            href="/"
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
            color="inherit"
            href="/products"
            sx={{ '&:hover': { color: 'primary.main' } }}
          >
            Products
          </Link>
          <Typography color="text.primary">{activeCategory}</Typography>
        </Breadcrumbs>
        
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
            />
          </Box>
        </Box>
      </Container>
    );
  }
}

export default Content; 