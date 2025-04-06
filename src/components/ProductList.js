import React, { Component } from 'react';
import { Box, Grid, Typography, Pagination, Stack, Divider, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Product from './Product.js';
import SocketContext from '../contexts/SocketContext.js';

class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      productsPerPage: 20,
      viewMode: 'grid'
    };
  }

  componentDidMount() {
    // Load saved productsPerPage preference from localStorage
    const savedProductsPerPage = localStorage.getItem('productsPerPage');
    if (savedProductsPerPage) {
      this.setState({ productsPerPage: savedProductsPerPage === 'all' ? 'all' : parseInt(savedProductsPerPage) });
    }
  }

  componentDidUpdate(prevProps) {
    // Check if products array changed and current page is no longer valid
    if (prevProps.products !== this.props.products && this.props.products) {
      const { page, productsPerPage } = this.state;
      
      // Reset to page 1 if we navigated to a completely different product list
      // This can be detected by comparing product counts or title changes
      const prevProductCount = prevProps.products ? prevProps.products.length : 0;
      const currentProductCount = this.props.products.length;
      const titleChanged = prevProps.title !== this.props.title;
      
      // If title changed or product count changed significantly, this indicates
      // navigation to a new product page via route
      if (titleChanged || Math.abs(prevProductCount - currentProductCount) > 5) {
        this.setState({ page: 1 });
        return;
      }
      
      // Only check for invalid page if not showing all products
      if (productsPerPage !== 'all') {
        const perPage = parseInt(productsPerPage);
        const pageCount = Math.ceil(this.props.products.length / perPage);
        
        // If current page is greater than new page count, reset to last valid page
        if (page > pageCount && pageCount > 0) {
          this.setState({ page: pageCount });
        }
      }
    }
  }

  handlePageChange = (event, value) => {
    this.setState({ page: value });
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  handleProductsPerPageChange = (event) => {
    const value = event.target.value;
    this.setState({ 
      productsPerPage: value,
      page: 1 // Reset to first page when changing items per page
    });
    
    // Save preference to localStorage
    localStorage.setItem('productsPerPage', value);
  };

  renderPagination = (pageCount, page) => {
    return (
      <Stack spacing={2} sx={{ my: 2 }}>
        <Pagination 
          count={pageCount} 
          page={page} 
          onChange={this.handlePageChange} 
          color="primary" 
          sx={{ mx: 'auto' }}
          size="large"
          siblingCount={1}
          boundaryCount={1}
          hideNextButton={false}
          hidePrevButton={false}
          showFirstButton={true}
          showLastButton={true}
        />
      </Stack>
    );
  }

  render() {
    const { products, title, isLoading, error } = this.props;
    const { page, productsPerPage, viewMode } = this.state;
    
    // If no products provided, use empty array
    const productList = products || [];
    
    // Calculate pagination
    let currentProducts = productList;
    let pageCount = 1;
    
    if (productsPerPage !== 'all') {
      const perPage = parseInt(productsPerPage);
      const indexOfLastProduct = page * perPage;
      const indexOfFirstProduct = indexOfLastProduct - perPage;
      currentProducts = productList.slice(indexOfFirstProduct, indexOfLastProduct);
      pageCount = Math.ceil(productList.length / perPage);
    }

    return (
      <Box sx={{ height: '100%' }}>
        {/* Header with title */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h5" component="h1" color="text.primary">
            {title || 'All Products'}
          </Typography>
          
          {/* Per Page Dropdown */}
          {!isLoading && productList.length > 0 && (
            <FormControl variant="outlined" size="small" sx={{ minWidth: 100 }}>
              <InputLabel id="products-per-page-label">Per Page</InputLabel>
              <Select
                labelId="products-per-page-label"
                value={productsPerPage}
                onChange={this.handleProductsPerPageChange}
                label="Per Page"
                MenuProps={{
                  disableScrollLock: true,
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                  },
                  PaperProps: {
                    sx: { 
                      maxHeight: 200,
                      boxShadow: 3,
                      mt: 0.5,
                      position: 'absolute',
                      zIndex: 999
                    }
                  },
                  container: document.getElementById('root')
                }}
              >
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value="all">All</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
        
        {/* Results count and summary */}
        {!isLoading && productList.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {productsPerPage === 'all' ? 
                `Showing all ${productList.length} products` : 
                `Showing ${(page - 1) * parseInt(productsPerPage) + 1}-${Math.min(page * parseInt(productsPerPage), productList.length)} of ${productList.length} products`
              }
            </Typography>
          </Box>
        )}
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Top Pagination */}
        {!isLoading && !error && pageCount > 1 && productsPerPage !== 'all' && this.renderPagination(pageCount, page)}
        
        {/* Loading State */}
        {isLoading && (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Loading products...
            </Typography>
          </Box>
        )}
        
        {/* Error State */}
        {!isLoading && error && (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="error">
              {error}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Please try again later
            </Typography>
          </Box>
        )}
        
        {/* Empty State */}
        {!isLoading && !error && productList.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No products found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your filters or search criteria
            </Typography>
          </Box>
        ) : (
          /* Product grid */
          !isLoading && !error && (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {currentProducts.map((product) => (
                <Grid 
                  item 
                  key={product.id} 
                  xs={6} 
                  sm={viewMode === 'list' ? 12 : 6} 
                  md={viewMode === 'list' ? 12 : 3}
                  lg={viewMode === 'list' ? 12 : 3}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    mb: 1
                  }}
                >
                  <SocketContext.Consumer>
                    {socket => <Product 
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      available={product.available}
                      manufacturer={product.manufacturer}
                      socket={socket} 
                    />}
                  </SocketContext.Consumer>  
                </Grid>
              ))}
            </Grid>
          )
        )}
        
        {/* Bottom Pagination */}
        {!isLoading && !error && pageCount > 1 && productsPerPage !== 'all' && this.renderPagination(pageCount, page)}
      </Box>
    );
  }
}

export default ProductList; 