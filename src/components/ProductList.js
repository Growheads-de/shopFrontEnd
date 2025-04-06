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
      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ 
          my: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Pagination 
          count={pageCount} 
          page={page} 
          onChange={this.handlePageChange} 
          color="primary" 
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

    // Determine if pagination should be shown
    const showPagination = !isLoading && !error && productList.length > 0 && pageCount > 1 && productsPerPage !== 'all';

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
        </Box>
        
        {/* Results count and dropdown */}
        {!isLoading && productList.length > 0 && (
          <Box sx={{ 
            mb: 2, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="body2" color="text.secondary">
              {productsPerPage === 'all' ? 
                `Showing all ${productList.length} products` : 
                `Showing ${(page - 1) * parseInt(productsPerPage) + 1}-${Math.min(page * parseInt(productsPerPage), productList.length)} of ${productList.length} products`
              }
            </Typography>
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="products-per-page-label">Per Page</InputLabel>
              <Select
                labelId="products-per-page-label"
                value={this.state.productsPerPage}
                onChange={this.handleProductsPerPageChange}
                label="Per Page"
              >
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value="all">All</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Top Pagination */}
        {showPagination && this.renderPagination(pageCount, page)}
        
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
                      socket={socket} 
                    />}
                  </SocketContext.Consumer>  
                </Grid>
              ))}
            </Grid>
          )
        )}
        
        {/* Bottom Pagination */}
        {showPagination && this.renderPagination(pageCount, page)}
      </Box>
    );
  }
}

export default ProductList; 