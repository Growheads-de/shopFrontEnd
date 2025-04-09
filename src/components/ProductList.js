import React, { Component } from 'react';
import { Box, Typography, Grid, Stack, Pagination, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Product from './Product.js';

class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewMode: 'grid',
      products:[],
      page:1,
      itemsPerPage:20,
      sortBy:'name'
    };
  }

  handlePageChange = (event, value) => {
    this.setState({ page: value });
  }

  shouldComponentUpdate(nextProps) {
    if((this.props.products !== nextProps.products)&&(this.state.page != 1)){
      this.setState({ page:1 });
      return false;
    }
    return true;
  }

  handleProductsPerPageChange = (event) => {
    const newItemsPerPage = event.target.value;
    const newState = { itemsPerPage: newItemsPerPage };
    if(newItemsPerPage!=='all'){
      const newTotalPages = Math.ceil(this.props.products.length / newItemsPerPage);
      if (this.state.page > newTotalPages) newState.page = newTotalPages; 
    }
    this.setState(newState);
  }

  handleSortChange = (event) => {
    this.setState({ sortBy: event.target.value });
  }

  renderPagination = (pages, page) => {
    return (
      ((this.state.itemsPerPage==='all')||(this.props.products.length<this.state.itemsPerPage))?null:<Stack spacing={2} sx={{ my: 2 }}>
        <Pagination 
          count={pages} 
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
    const unsortedProducts = this.state.itemsPerPage==='all'?[...this.props.products]:this.props.products.slice((this.state.page - 1) * this.state.itemsPerPage , this.state.page * this.state.itemsPerPage);
    const products = this.state.sortBy==='name'?unsortedProducts:unsortedProducts.sort((a,b)=>{
      if(this.state.sortBy==='price-low-high'){
        return a.price-b.price;
      }
      if(this.state.sortBy==='price-high-low'){
        return b.price-a.price;
      }
    });

    return (
      <Box sx={{ height: '100%' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
            <Typography variant="body2" color="text.secondary">
              {
                this.props.totalProductCount==this.props.products.length && this.props.totalProductCount>0 ?
              `${this.props.totalProductCount} Produkte`
              :
              `${this.props.products.length} von ${this.props.totalProductCount} Produkten`
              }
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {/* Sort Dropdown */}
              <FormControl variant="outlined" size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="sort-by-label">Sortierung</InputLabel>
                <Select
                  labelId="sort-by-label"
                  value={this.state.sortBy}
                  onChange={this.handleSortChange}
                  label="Sortierung"
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
                        mt: 0.5
                      }
                    }
                  }}
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="price-low-high">Preis: Niedrig zu Hoch</MenuItem>
                  <MenuItem value="price-high-low">Preis: Hoch zu Niedrig</MenuItem>
                </Select>
              </FormControl>
              
              {/* Per Page Dropdown */}
              <FormControl variant="outlined" size="small" sx={{ minWidth: 100 }}>
                <InputLabel id="products-per-page-label">pro Seite</InputLabel>
                <Select
                  labelId="products-per-page-label"
                  value={this.state.itemsPerPage}
                  onChange={this.handleProductsPerPageChange}
                  label="pro Seite"
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
                  <MenuItem value="all">Alle</MenuItem>
                </Select>
              </FormControl>
            </Box>
        </Box>

        { this.renderPagination(Math.ceil(this.props.products.length / this.state.itemsPerPage), this.state.page) }

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {products.map((product) => (
            <Grid 
              item 
              key={product.id} 
              xs={6} 
              sm={this.state.viewMode === 'list' ? 12 : 6} 
              md={this.state.viewMode === 'list' ? 12 : 4}
              lg={this.state.viewMode === 'list' ? 12 : 3}
              sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                mb: 1
              }}
            > 
                <Product 
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  currency={product.currency}
                  available={product.available}
                  manufacturer={product.manufacturer}
                  socket={this.props.socket} 
                />
            </Grid>
          ))}
        </Grid>

        { this.renderPagination(Math.ceil(this.props.products.length / this.state.itemsPerPage), this.state.page) }
      </Box>
    );
  }
}

export default ProductList; 