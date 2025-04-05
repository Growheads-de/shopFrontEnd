import React, { Component } from 'react';
import { Box, Container, Grid, Pagination, Stack, Typography } from '@mui/material';
import Product from './Product.js';

class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      productsPerPage: 6
    };
    
    // Mock cannabis grow store product data
    this.products = [
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
    ];
  }

  handlePageChange = (event, value) => {
    this.setState({ page: value });
  };

  render() {
    const { page, productsPerPage } = this.state;
    const indexOfLastProduct = page * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = this.products.slice(indexOfFirstProduct, indexOfLastProduct);
    const pageCount = Math.ceil(this.products.length / productsPerPage);

    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Cannabis Growing Equipment
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" align="center" paragraph>
            Premium products for your cannabis growing needs
          </Typography>
        </Box>
        
        <Box sx={{ my: 4 }}>
          <Grid container spacing={4} justifyContent="center">
            {currentProducts.map((product) => (
              <Grid item key={product.id} xs={12} sm={6} md={4} lg={4} 
                sx={{ display: 'flex', justifyContent: 'center' }}>
                <Product
                  name={product.name}
                  price={product.price}
                  available={product.available}
                />
              </Grid>
            ))}
          </Grid>
          <Stack spacing={2} sx={{ mt: 4 }}>
            <Pagination 
              count={pageCount} 
              page={page} 
              onChange={this.handlePageChange} 
              color="primary" 
              sx={{ mx: 'auto' }}
            />
          </Stack>
        </Box>
      </Container>
    );
  }
}

export default Content; 