import React, { Component } from 'react';
import { Container, Box } from '@mui/material';
import ProductFilters2 from './ProductFilters2.js';
import ProductList2 from './ProductList2.js';

import { useParams } from 'react-router-dom';
const withRouter = (ClassComponent) => {
  return (props) => {
    const params = useParams();
    return <ClassComponent {...props} params={params} />;
  };
};

function getCachedCategoryData(categoryId) {
  if (!window.productCache) {
    window.productCache = {};
  }

  try {
    const cacheKey = `categoryProducts_${categoryId}`;
    const cachedData = window.productCache[cacheKey];
    
    if (cachedData) {
      const { timestamp } = cachedData;
      const cacheAge = Date.now() - timestamp;
      const tenMinutes = 10 * 60 * 1000; 
      if (cacheAge < tenMinutes) {
        return cachedData;
      }
    }
  } catch (err) {
    console.error('Error reading from cache:', err);
  }

  return null;
}

function getFilteredProducts(unfilteredProducts,attributes) {
  const attributeCookies = document.cookie.split(';').filter(cookie => cookie.trim().startsWith('filter_attribute_'));
  const manufacturerCookies = document.cookie.split(';').filter(cookie => cookie.trim().startsWith('filter_manufacturer_'));
  const attributeFilters = attributeCookies.map(cookie => cookie.split('=')[0].split('_')[2]);
  const manufacturerFilters = manufacturerCookies.map(cookie => cookie.split('=')[0].split('_')[2]);
  const uniqueAttributes = [...new Set(attributes.map(attr => attr.kMerkmalWert.toString()))];
  const uniqueManufacturers = [...new Set(unfilteredProducts.filter(product => product.manufacturerId).map(product => product.manufacturerId.toString()))];
  const activeAttributeFilters = attributeFilters.filter(filter => uniqueAttributes.includes(filter));
  const activeManufacturerFilters = manufacturerFilters.filter(filter => uniqueManufacturers.includes(filter)); 
  const filteredProducts = unfilteredProducts.filter(product => {
    const manufacturerMatch = activeManufacturerFilters.length === 0 || 
      (product.manufacturerId && activeManufacturerFilters.includes(product.manufacturerId.toString()));
    let attributeMatch = true;
    if (activeAttributeFilters.length > 0) {
      const productAttributes = attributes
        .filter(attr => attr.kArtikel === product.id)
        .map(attr => attr.kMerkmalWert.toString());
      attributeMatch = activeAttributeFilters.every(filter => productAttributes.includes(filter));
    }
    return manufacturerMatch && attributeMatch;
  });
  console.log('shouldComponentUpdateProducts',filteredProducts.length);
  return filteredProducts;
}

function setCachedCategoryData(categoryId, data) {
  if (!window.productCache) {
    window.productCache = {};
  }

  try {
    const cacheKey = `categoryProducts_${categoryId}`;
    window.productCache[cacheKey] = {
      ...data,
      timestamp: Date.now()
    };
  } catch (err) {
    console.error('Error writing to cache:', err);
  }
}

class Content2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      categoryName: null, 
      unfilteredProducts: [],
      filteredProducts: [],
      attributes: [],
      isMounted: false
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(!this.state.isMounted) return true;
    if(nextState.loaded && !this.state.loaded) return true;
    if((this.props.params.categoryId !== nextProps.params.categoryId) && (nextState.loaded == this.state.loaded)) {
      this.setState({loaded: false, unfilteredProducts: [], filteredProducts: [], attributes: [], categoryName: null}, () => {
        this.fetchCategoryData(nextProps.params.categoryId);
      });
      return false;
    }
    if(this.state.filteredProducts !== nextState.filteredProducts) return true;
    return this.props.params.categoryId !== nextProps.params.categoryId;
  }

  componentDidMount() {
    this.setState({ isMounted: true, loaded: false },()=>{this.fetchCategoryData(this.props.params.categoryId)});
  }

  processCategoryData(response) {
    const unfilteredProducts = response.products;
    this.setState({
      unfilteredProducts: unfilteredProducts,
      filteredProducts: getFilteredProducts(unfilteredProducts,response.attributes),
      attributes: response.attributes,
      categoryName: response.categoryName,
      loaded: true
    });
  }

  fetchCategoryData(categoryId) {
    const cachedData = getCachedCategoryData(categoryId);
    if (cachedData) {
      this.processCategoryData(cachedData);
      return;
    }

    this.props.socket.emit('getCategoryProducts', { categoryId: parseInt(categoryId) }, (response) => {
      setCachedCategoryData(categoryId, response);
      console.log('fetchCategoryData in Content2', response);
      if (response && response.products) {
        this.processCategoryData(response);
      } else {
        console.log('fetchCategoryData in Content2 failed', response);
      }
    });
  }

  filterProducts() {
    console.log('shouldComponentUpdate_filterProducts',this.state.unfilteredProducts.length);
    this.setState({ filteredProducts: getFilteredProducts(this.state.unfilteredProducts,this.state.attributes) });
  }

  render() {
    if (!this.state.isMounted) {
      return <div></div>;
    }
    console.log('shouldComponentUpdate render content2');
    return (
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1, height: '100%', display: 'grid', gridTemplateRows: '1fr' }}>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 3fr' }, 
          gap: 3
        }}>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100%'
          }}>
            <ProductFilters2 
              products={this.state.unfilteredProducts}
              attributes={this.state.attributes}
              onFilterChange={()=>{this.filterProducts()}}
            />
          </Box>

          <Box>
            <ProductList2
              socket={this.props.socket}
              totalProductCount={this.state.unfilteredProducts.length}
              products={this.state.filteredProducts}
            />
          </Box>
        </Box>
      </Container>
    );
  }
}

export default withRouter(Content2); 