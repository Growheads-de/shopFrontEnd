import React, { Component } from 'react';
import { Box, Grid, Typography, Pagination, Stack, Divider, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Product from './Product.js';

class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      productsPerPage: 8,
      viewMode: 'grid'
    };
  }

  handlePageChange = (event, value) => {
    this.setState({ page: value });
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  handleViewModeChange = (event) => {
    this.setState({ viewMode: event.target.value });
  };

  handleProductsPerPageChange = (event) => {
    this.setState({ 
      productsPerPage: event.target.value,
      page: 1 // Reset to first page when changing items per page
    });
  };

  render() {
    const { products, title } = this.props;
    const { page, productsPerPage, viewMode } = this.state;
    
    // If no products provided, use empty array
    const productList = products || [];
    
    // Calculate pagination
    const indexOfLastProduct = page * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = productList.slice(indexOfFirstProduct, indexOfLastProduct);
    const pageCount = Math.ceil(productList.length / productsPerPage);

    return (
      <Box sx={{ height: '100%' }}>
        {/* Header with title and options */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h5" component="h1" color="text.primary">
            {title || 'All Products'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl variant="outlined" size="small">
              <InputLabel id="view-mode-label">View</InputLabel>
              <Select
                labelId="view-mode-label"
                id="view-mode"
                value={viewMode}
                onChange={this.handleViewModeChange}
                label="View"
                sx={{ minWidth: 100 }}
              >
                <MenuItem value="grid">Grid</MenuItem>
                <MenuItem value="list">List</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl variant="outlined" size="small">
              <InputLabel id="items-per-page-label">Show</InputLabel>
              <Select
                labelId="items-per-page-label"
                id="items-per-page"
                value={productsPerPage}
                onChange={this.handleProductsPerPageChange}
                label="Show"
                sx={{ minWidth: 80 }}
              >
                <MenuItem value={8}>8</MenuItem>
                <MenuItem value={12}>12</MenuItem>
                <MenuItem value={16}>16</MenuItem>
                <MenuItem value={24}>24</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        {/* Results count and summary */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, productList.length)} of {productList.length} products
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Product grid */}
        {productList.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No products found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your filters or search criteria
            </Typography>
          </Box>
        ) : (
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
                <Product
                  name={product.name}
                  price={product.price}
                  available={product.available}
                />
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Pagination */}
        {pageCount > 1 && (
          <Stack spacing={2} sx={{ mt: 4, mb: 2 }}>
            <Pagination 
              count={pageCount} 
              page={page} 
              onChange={this.handlePageChange} 
              color="primary" 
              sx={{ mx: 'auto' }}
              size="large"
            />
          </Stack>
        )}
      </Box>
    );
  }
}

export default ProductList; 