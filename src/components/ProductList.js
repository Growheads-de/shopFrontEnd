import React, { Component } from 'react';
import { Box, Typography, Grid, Pagination, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Product from './Product.js';

class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewMode: window.productListViewMode || 'grid',
      products:[],
      page: window.productListPage || 1,
      itemsPerPage: window.productListItemsPerPage || 20,
      sortBy: window.productListSortBy || 'name'
    };
  }

  handleViewModeChange = (viewMode) => {
    this.setState({ viewMode });
    window.productListViewMode = viewMode;
  }

  handlePageChange = (event, value) => {
    this.setState({ page: value });
    window.productListPage = value;
  }

  componentDidUpdate() {
    const currentPageCapacity = this.state.itemsPerPage === 'all' ? Infinity : this.state.itemsPerPage;
    if(this.props.products.length > 0 ) if (this.props.products.length < (currentPageCapacity * (this.state.page-1)) ) {
      if(this.state.page != 1) this.setState({ page: 1 });
      window.productListPage = 1;
    }
  }

  handleProductsPerPageChange = (event) => {
    const newItemsPerPage = event.target.value;
    const newState = { itemsPerPage: newItemsPerPage };
    window.productListItemsPerPage = newItemsPerPage;
    
    if(newItemsPerPage!=='all'){
      const newTotalPages = Math.ceil(this.props.products.length / newItemsPerPage);
      if (this.state.page > newTotalPages) {
        newState.page = newTotalPages;
        window.productListPage = newTotalPages;
      }
    }
    this.setState(newState);
  }

  handleSortChange = (event) => {
    const sortBy = event.target.value;
    this.setState({ sortBy });
    window.productListSortBy = sortBy;
  }

  renderPagination = (pages, page) => {
    return (
      <Box sx={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
        {((this.state.itemsPerPage==='all')||(this.props.products.length<this.state.itemsPerPage))?null:
          <Pagination 
            count={pages} 
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
        }
      </Box>
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
          alignItems: 'center'
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

        <Grid container spacing={2}>
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
                vat={product.vat}
                massMenge={product.massMenge}
                massEinheit={product.massEinheit}
                incoming={product.incoming}
                neu={product.neu}
                thc={product.thc}
                socket={this.props.socket}
                pictureList={product.pictureList}
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