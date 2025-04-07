import React, { Component } from 'react';
import { Container, Typography, Breadcrumbs, Link, Box } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import ProductFilters from './ProductFilters.js';
import ProductList from './ProductList.js';
import { Link as RouterLink } from 'react-router-dom';


class Content extends Component {
  constructor(props) {
    super(props);
    
    // Get initial availability filter value from localStorage
    let initialAvailability = { inStock: true, 'in Stock': true };
    try {
      const storedValue = localStorage.getItem('availabilityFilter');
      if (storedValue) {
        const parsedValue = JSON.parse(storedValue);
        
        // Handle both formats: old (inStock) and new ('in Stock')
        const inStockValue = parsedValue.inStock !== undefined ? 
                            parsedValue.inStock : 
                            parsedValue['in Stock'];
        
        if (inStockValue !== undefined) {
          initialAvailability = {
            inStock: inStockValue,
            'in Stock': inStockValue
          };
        }
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    
    this.state = {
      activeCategory: "All Products",
      categories: {},
      categoryName: "",
      products: [],
      filteredProducts: [],
      totalProductCount: 0,
      isLoading: true,
      error: null,
      attributeGroups: {},
      attributeCounts: {},
      activeFilters: {
        availability: initialAvailability
      },
      attributes: []
    };
    
    console.log('Initial state set with availability filter:', initialAvailability);
  }

  componentDidMount() {
    // URL parameters take precedence over localStorage
    this.initializeFiltersFromURL();
    this.initializeProducts();
  }
  
  componentDidUpdate(prevProps) {
    // If location changed, update filters from URL
    if (prevProps.location?.search !== this.props.location?.search) {
      this.initializeFiltersFromURL();
    }
    
    // If search query or category changed, update products
    if (prevProps.searchQuery !== this.props.searchQuery || 
        prevProps.categoryId !== this.props.categoryId) {
      this.setState({
        // Reset attribute filters when changing categories
        activeFilters: {
          ...this.state.activeFilters,
          attributes: {} // Reset attribute filters
        }
      }, this.initializeProducts);
    }
  }
  
  initializeFiltersFromURL = () => {
    const { location } = this.props;
    if (!location) return;
    
    const searchParams = new URLSearchParams(location.search);
    const inStockParam = searchParams.get('inStock');
    
    console.log('URL inStock parameter:', inStockParam);
    
    if (inStockParam !== null) {
      const inStockValue = inStockParam === 'true';
      console.log('Setting inStock filter to:', inStockValue);
      
      // Update activeFilters based on URL parameters
      this.setState(prevState => ({
        activeFilters: {
          ...prevState.activeFilters,
          availability: {
            ...prevState.activeFilters.availability,
            inStock: inStockValue,
            'in Stock': inStockValue  // Also set with the key that's used in the UI
          }
        }
      }), this.applyFilters); // Make sure to apply filters after changing
    }
  };
  
  initializeProducts = () => {
    const { searchQuery, categoryId, socket } = this.props;
    
    this.setState({ isLoading: true, error: null });
    console.log('Initializing products with categoryId:', categoryId);
    
    if (categoryId && socket) {
      // Fetch products for specific category
      console.log('Fetching products for category:', categoryId);
      
      // Initialize global cache object if it doesn't exist
      if (!window.productCache) {
        window.productCache = {};
      }
      
      try {
        const cacheKey = `categoryProducts_${categoryId}`;
        const cachedData = window.productCache[cacheKey];
        
        if (cachedData) {
          const { products, categoryName, timestamp, attributes } = cachedData;
          const cacheAge = Date.now() - timestamp;
          const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
          
          // If cache is less than 10 minutes old, use it
          if (cacheAge < tenMinutes && Array.isArray(products)) {
            console.log(`Using cached products for category ${categoryId}, age:`, Math.round(cacheAge/1000), 'seconds');
            let pageTitle = categoryName || "Category";
            let filteredProducts = products;
            
            // Filter by search query if provided
            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              filteredProducts = filteredProducts.filter(product => 
                product.name.toLowerCase().includes(query)
              );
              pageTitle = `Search Results for "${searchQuery}"`;
            }
            
            // Set products, then apply filters separately (to ensure in-stock filter is applied)
            this.setState({ 
              products: filteredProducts,
              totalProductCount: filteredProducts.length,
              activeCategory: pageTitle,
              categoryName: categoryName,
              attributes: attributes || [],
              isLoading: false
            }, this.applyFilters); // Apply filters after setting products
            return;
          }
        }
      } catch (err) {
        console.error('Error reading category products from cache:', err);
      }
      
      socket.emit('getCategoryProducts', { categoryId: parseInt(categoryId) }, (response) => {
        console.log('getCategoryProducts response');
        if (response && response.products) {
          console.log('getCategoryProducts response', response);   
          let pageTitle = response.categoryName || "Category";
          let products = response.products;
          
          // Filter by search query if provided
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            products = products.filter(product => 
              product.name.toLowerCase().includes(query)
            );
            pageTitle = `Search Results for "${searchQuery}"`;
          }
          
          // Store raw attributes instead of processing them here
          const attributes = response.attributes || [];
          
          // Set products, then apply filters separately (to ensure in-stock filter is applied)
          this.setState({ 
            products: products,
            totalProductCount: products.length,
            activeCategory: pageTitle,
            categoryName: response.categoryName,
            attributes: attributes,
            isLoading: false
          }, this.applyFilters); // Apply filters after setting products
          
          const manufacturers = products.map(product => product.manufacturer);
          const manufacturerProductCount = manufacturers.reduce((acc, manufacturer) => {
            acc[manufacturer] = (acc[manufacturer] || 0) + 1;
            return acc;
          }, {});

          // Store in global cache with timestamp - store raw attributes
          try {
            const cacheKey = `categoryProducts_${categoryId}`;
            window.productCache[cacheKey] = {
              products: response.products,
              categoryName: response.categoryName,
              manufacturerProductCount: manufacturerProductCount,
              attributes: response.attributes || [],
              timestamp: Date.now()
            };
          } catch (err) {
            console.error('Error writing category products to cache:', err);
          }
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
      }, this.applyFilters); // Apply filters after setting search results
    }
  }

  handleFilterChange = (filter) => {
    console.log('Filter change:', filter);
    
    this.setState(prevState => {
      const newFilters = { ...prevState.activeFilters };
      
      switch (filter.type) {
        case 'availability':
          if (filter.name === 'in Stock') {
            newFilters.availability = {
              ...newFilters.availability,
              inStock: filter.value,     // Used internally for filtering
              'in Stock': filter.value   // Used by the UI component
            };
            
            const { navigate, location } = this.props;
            if (navigate) {
              const searchParams = new URLSearchParams(location?.search || '');
              searchParams.set('inStock', filter.value.toString());
              
              navigate({
                search: searchParams.toString()
              }, { replace: true });
              
              console.log('Updated URL with inStock:', filter.value);
            }
          } else {
            newFilters.availability = {
              ...newFilters.availability,
              [filter.name]: filter.value
            };
          }
          break;
        case 'manufacturer':
          if (!newFilters.manufacturers) {
            newFilters.manufacturers = {};
          }
          newFilters.manufacturers = {
            ...newFilters.manufacturers,
            [filter.name]: filter.value
          };
          break;
        case 'attribute':
          if (!newFilters.attributes) {
            newFilters.attributes = {};
          }
          if (!newFilters.attributes[filter.attribute]) {
            newFilters.attributes[filter.attribute] = {};
          }
          newFilters.attributes[filter.attribute] = {
            ...newFilters.attributes[filter.attribute],
            [filter.name]: filter.value
          };
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
    
    console.log('Applying filters with activeFilters:', activeFilters);
    console.log('Initial products count:', products.length);
    
    // Apply filters
    products = products.filter(product => {
      // Availability filter - only show in-stock items if checked
      if (activeFilters.availability && activeFilters.availability['in Stock'] === true) {
        // If the filter is ON (true), filter out products that are not available
        if (product.available === 0 || product.available === false) {
          return false;
        }
      }
      
      // Manufacturer filter
      if (activeFilters.manufacturers) {
        const activeManufacturers = Object.entries(activeFilters.manufacturers)
          .filter(([_, isActive]) => isActive)
          .map(([manufacturer]) => manufacturer);
        
        // If any manufacturer is selected, filter by those manufacturers
        if (activeManufacturers.length > 0 && !activeManufacturers.includes(product.manufacturer)) {
          return false;
        }
      }
      
      // Attribute filters
      if (activeFilters.attributes) {
        const { attributes } = activeFilters;
        const productId = parseInt(product.id, 10);
        
        // For each attribute type (like "Typ", "Effekt", etc.)
        for (const attrName in attributes) {
          const activeValues = Object.entries(attributes[attrName])
            .filter(([_, isActive]) => isActive)
            .map(([value]) => value);
          
          // Skip if no values are selected for this attribute
          if (activeValues.length === 0) continue;
          
          // Use the raw attributes directly from state
          const allAttributes = this.state.attributes || [];
          
          // Find attributes for this product
          const productAttributes = allAttributes.filter(attr => parseInt(attr.kArtikel, 10) === productId);
          
          // Find attributes matching the current filter type
          const matchingAttrs = productAttributes.filter(attr => attr.cName === attrName);
          
          // If no matching attributes or none of the values match the selected values, filter out
          if (matchingAttrs.length === 0 || !matchingAttrs.some(attr => activeValues.includes(attr.cWert))) {
            return false;
          }
        }
      }
      
      return true;
    });
    
    console.log('Filtered products count:', products.length);
    this.setState({ filteredProducts: products });
  };

  generateBreadcrumbs = () => {
    const { searchQuery, categoryId } = this.props;
    const { categoryName } = this.state;
    
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
          <Typography color="text.primary">{categoryName || "Category"}</Typography>
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
        <Typography color="text.primary">All Products</Typography>
      </Breadcrumbs>
    );
  }

  render() {
    const { activeCategory, filteredProducts, totalProductCount, isLoading, error } = this.state;
    
    // Extract unique manufacturers from products and count products per manufacturer
    const manufacturers = this.state.products.map(product => product.manufacturer);
    const uniqueManufacturers = [...new Set(manufacturers)].filter(Boolean);
    
    // Calculate product count per manufacturer
    const manufacturerProductCount = manufacturers.reduce((acc, manufacturer) => {
      if (manufacturer) {
        acc[manufacturer] = (acc[manufacturer] || 0) + 1;
      }
      return acc;
    }, {});

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
              manufacturers={uniqueManufacturers}
              manufacturerProductCount={manufacturerProductCount}
              attributes={this.state.attributes || []}
              categoryId={this.props.categoryId}
              initialFilters={this.state.activeFilters}
              products={this.state.products}
            />
          </Box>
          
          {/* Product List - 2/3 width */}
          <Box sx={{ width: { xs: '100%', md: '75%', lg: '75%' } }}>
            <ProductList 
              products={filteredProducts}
              totalProductCount={totalProductCount}
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

export default Content; 
