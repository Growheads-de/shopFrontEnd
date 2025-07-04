import React, { Component } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Product from './Product.js';
import { removeSessionSetting } from '../utils/sessionStorage.js';

// Sort products by fuzzy similarity to their name/description
function sortProductsByFuzzySimilarity(products, searchTerm) {
  console.log('sortProductsByFuzzySimilarity',products,searchTerm);
  // Create an array that preserves the product object and its searchable text
  const productsWithText = products.map(product => {
    const searchableText = `${product.name || ''} ${product.description || ''}`;
    return { product, searchableText };
  });
  
  // Sort products based on their searchable text similarity
  productsWithText.sort((a, b) => {
    const scoreA = getFuzzySimilarityScore(a.searchableText, searchTerm);
    const scoreB = getFuzzySimilarityScore(b.searchableText, searchTerm);
    return scoreB - scoreA; // Higher scores first
  });
  
  // Return just the sorted product objects
  return productsWithText.map(item => item.product);
}

// Calculate a similarity score between text and search term
function getFuzzySimilarityScore(text, searchTerm) {
  const searchWords = searchTerm.toLowerCase().split(/\W+/).filter(Boolean);
  const textWords = text.toLowerCase().split(/\W+/).filter(Boolean);
  
  let totalScore = 0;
  for (let searchWord of searchWords) {
    // Exact matches get highest priority
    if (textWords.includes(searchWord)) {
      totalScore += 2;
      continue;
    }
    
    // Partial matches get scored based on similarity
    let bestMatch = 0;
    for (let textWord of textWords) {
      if (textWord.includes(searchWord) || searchWord.includes(textWord)) {
        const similarity = Math.min(searchWord.length, textWord.length) / 
                           Math.max(searchWord.length, textWord.length);
        if (similarity > bestMatch) bestMatch = similarity;
      }
    }
    totalScore += bestMatch;
  }
  
  return totalScore;
}


class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewMode: window.productListViewMode || 'grid',
      products:[],
      page: window.productListPage || 1,
      itemsPerPage: window.productListItemsPerPage || 20,
      sortBy: window.currentSearchQuery ? 'searchField' : 'name'
    };
  }
  componentDidMount() { 
    this.handleSearchQuery = () => {
      this.setState({ sortBy: window.currentSearchQuery ? 'searchField' : 'name' });
    };
    window.addEventListener('search-query-change', this.handleSearchQuery);
  }

  componentWillUnmount() {
    window.removeEventListener('search-query-change', this.handleSearchQuery);
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
  }

  renderPagination = (pages, page) => {
    return (
      <Box sx={{ 
        height: 64, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'left',
        width: '100%'
      }}>
        {(this.state.itemsPerPage==='all')?null:
          <Pagination 
            count={pages} 
            page={page} 
            onChange={this.handlePageChange} 
            color="primary"
            size={"large"}
            siblingCount={window.innerWidth < 600 ? 0 : 1}
            boundaryCount={window.innerWidth < 600 ? 1 : 1}
            hideNextButton={false}
            hidePrevButton={false}
            showFirstButton={window.innerWidth >= 600}
            showLastButton={window.innerWidth >= 600}
            sx={{
              '& .MuiPagination-ul': {
                flexWrap: 'nowrap',
                overflowX: 'auto',
                maxWidth: '100%'
              }
            }}
          />
        }
      </Box>
    );
  }

  render() {
    //console.log('products',this.props.activeAttributeFilters,this.props.activeManufacturerFilters,window.currentSearchQuery,this.state.sortBy);
    
    const filteredProducts = (this.state.sortBy==='searchField')&&(window.currentSearchQuery)?sortProductsByFuzzySimilarity(this.props.products, window.currentSearchQuery):this.state.sortBy==='name'?this.props.products:this.props.products.sort((a,b)=>{
      if(this.state.sortBy==='price-low-high'){
        return a.price-b.price;
      }
      if(this.state.sortBy==='price-high-low'){
        return b.price-a.price;
      }
    });
    const products = this.state.itemsPerPage==='all'?[...filteredProducts]:filteredProducts.slice((this.state.page - 1) * this.state.itemsPerPage , this.state.page * this.state.itemsPerPage);

    return (
      <Box sx={{ height: '100%', px: { xs: 0, sm: 0 } }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 },
          px: { xs: 0, sm: 0 },
          py: { xs: 1, sm: 0 },
          bgcolor: { xs: '#e8f5e8', sm: 'transparent' },
          mb: { xs: 0, sm: 0 }
        }}>


            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 0.5, sm: 1 }, 
              alignItems: 'center', 
              flexWrap: 'wrap',
              order: { xs: 2, sm: 1 },
              px: { xs: 1, sm: 0 }
            }}>
              {this.props.activeAttributeFilters.map((filter,index) => (
                <Chip 
                  size="medium"                
                  key={index} 
                  label={filter.value} 
                  onClick={() => {
                    removeSessionSetting(`filter_attribute_${filter.id}`);
                    this.props.onFilterChange();
                  }}
                  onDelete={() => {
                    removeSessionSetting(`filter_attribute_${filter.id}`);
                    this.props.onFilterChange();
                  }} 
                  clickable
                />
              ))}
              {this.props.activeManufacturerFilters.map((filter,index) => (
                <Chip 
                  size="medium"
                  key={index} 
                  label={filter.name} 
                  onClick={() => {
                    removeSessionSetting(`filter_manufacturer_${filter.value}`);
                    this.props.onFilterChange();
                  }}
                  onDelete={() => {
                    removeSessionSetting(`filter_manufacturer_${filter.value}`);
                    this.props.onFilterChange();
                  }} 
                  clickable
                />
              ))}
            </Box>

            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 1, sm: 2 }, 
              alignItems: 'center',
              order: { xs: 1, sm: 2 },
              width: { xs: '100%', sm: 'auto' },
              justifyContent: { xs: 'space-between', sm: 'flex-end' },
              px: { xs: 1, sm: 0 }
            }}>
              {/* Sort Dropdown */}
              <FormControl 
                variant={window.innerWidth < 600 ? 'standard' : 'outlined'} 
                size="small" 
                sx={{ 
                  minWidth: { xs: 120, sm: 140 }
                }}
              >
                <InputLabel id="sort-by-label">Sortierung</InputLabel>
                <Select
                  size="small"
                  labelId="sort-by-label"
                  value={(this.state.sortBy==='searchField')&&(window.currentSearchQuery)?this.state.sortBy:this.state.sortBy==='price-low-high'?this.state.sortBy:this.state.sortBy==='price-low-high'?this.state.sortBy:'name'}
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
                  {window.currentSearchQuery && <MenuItem value="searchField">Suchbegriff</MenuItem>}
                  <MenuItem value="price-low-high">Preis: Niedrig zu Hoch</MenuItem>
                  <MenuItem value="price-high-low">Preis: Hoch zu Niedrig</MenuItem>
                </Select>
              </FormControl>
              
              {/* Per Page Dropdown */}
              <FormControl 
                variant={window.innerWidth < 600 ? 'standard' : 'outlined'} 
                size="small" 
                sx={{ 
                  minWidth: { xs: 80, sm: 100 }
                }}
              >
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
              
              {/* Product count info - mobile only */}
              <Box sx={{ 
                display: { xs: 'block', sm: 'none' },
                ml: 1
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  {
                    this.props.totalProductCount==this.props.products.length && this.props.totalProductCount>0 ?
                    `${this.props.totalProductCount} Produkte`
                    :
                    `${this.props.products.length} von ${this.props.totalProductCount} Produkte`
                  }
                </Typography>
              </Box>
            </Box>
        </Box>
 
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          px: { xs: 0, sm: 0 },
          py: { xs: 1, sm: 0 },
          bgcolor: { xs: '#e8f5e8', sm: 'transparent' },
          mt: { xs: 0, sm: 0 }
        }}>
        <Box sx={{ px: { xs: 1, sm: 0 }, width: '100%' }}>
          { this.renderPagination(Math.ceil(filteredProducts.length / this.state.itemsPerPage), this.state.page) }
        </Box>
        <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', sm: 'flex' }, px: { xs: 1, sm: 0 } }}>
          <Typography variant="body2" color="text.secondary">
                {/*this.props.dataType == 'category' && (<>Kategorie: {this.props.dataParam}</>)}*/}
                {this.props.dataType == 'search' && (<>Suchergebnisse für: "{this.props.dataParam}"</>)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
                {
                  this.props.totalProductCount==this.props.products.length && this.props.totalProductCount>0 ?
                `${this.props.totalProductCount} Produkte`
                :
                `${this.props.products.length} von ${this.props.totalProductCount} Produkte`
                }
          </Typography>
        </Stack>
        </Box>

        <Grid container spacing={{ xs: 0, sm: 2 }}>
          {products.map((product, index) => (
            <Grid 
              key={product.id}
              sx={{
                display: 'flex', 
                justifyContent: { xs: 'stretch', sm: 'center' },
                mb: { xs: 0, sm: 1 },
                width: { xs: '100%', sm: 'auto' },
                borderBottom: { 
                  xs: index < products.length - 1 ? '16px solid #e8f5e8' : 'none', 
                  sm: 'none' 
                }
              }}
            > 
              <Product 
                id={product.id}
                name={product.name}
                seoName={product.seoName}
                price={product.price}
                currency={product.currency}
                available={product.available}
                manufacturer={product.manufacturer}
                vat={product.vat}
                massMenge={product.massMenge}
                massEinheit={product.massEinheit}
                incoming={product.incomingDate}
                neu={product.neu}
                thc={product.thc}
                floweringWeeks={product.floweringWeeks}
                versandklasse={product.versandklasse}
                weight={product.weight}
                socket={this.props.socket}
                socketB={this.props.socketB}
                pictureList={product.pictureList}
                availableSupplier={product.availableSupplier}
              />
            </Grid>
          ))}
        </Grid>
        
        {/* Bottom pagination */}
        <Box sx={{ 
          px: { xs: 0, sm: 0 },
          py: { xs: 1, sm: 1 },
          bgcolor: { xs: '#e8f5e8', sm: 'transparent' },
          mt: { xs: 0, sm: 2 }
        }}>
          <Box sx={{ px: { xs: 1, sm: 0 } }}>
            {this.renderPagination(Math.ceil(filteredProducts.length / this.state.itemsPerPage), this.state.page)}
          </Box>
        </Box>
      </Box>
    );
  }
}

export default ProductList; 