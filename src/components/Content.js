import React, { Component } from 'react';
import { Container, Box } from '@mui/material';
import ProductFilters from './ProductFilters.js';
import ProductList from './ProductList.js';

import { useParams, useSearchParams } from 'react-router-dom';

const isNew = (neu) => neu && (new Date().getTime() - new Date(neu).getTime() < 30 * 24 * 60 * 60 * 1000);

const withRouter = (ClassComponent) => {
  return (props) => {
    const params = useParams();
    const [searchParams] = useSearchParams();
    return <ClassComponent {...props} params={params} searchParams={searchParams} />;
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

// Sort products by fuzzy similarity to their name/description
function sortProductsByFuzzySimilarity(products, searchTerm) {
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

function getFilteredProducts(unfilteredProducts, attributes, searchQuery = '') {
  const attributeCookies = document.cookie.split(';').filter(cookie => cookie.trim().startsWith('filter_attribute_'));
  const manufacturerCookies = document.cookie.split(';').filter(cookie => cookie.trim().startsWith('filter_manufacturer_'));
  const availabilityCookies = document.cookie.split(';').filter(cookie => cookie.trim().startsWith('filter_availability_'));
  const attributeFilters = attributeCookies.map(cookie => cookie.split('=')[0].split('_')[2]);
  const manufacturerFilters = manufacturerCookies.map(cookie => cookie.split('=')[0].split('_')[2]);
  const availabilityFilters = availabilityCookies.map(cookie => cookie.split('=')[0].split('_')[2]);
  const uniqueAttributes = [...new Set(attributes.map(attr => attr.kMerkmalWert.toString()))];
  const uniqueManufacturers = [...new Set(unfilteredProducts.filter(product => product.manufacturerId).map(product => product.manufacturerId.toString()))];
  const activeAttributeFilters = attributeFilters.filter(filter => uniqueAttributes.includes(filter));
  const activeManufacturerFilters = manufacturerFilters.filter(filter => uniqueManufacturers.includes(filter)); 
  const attributeFiltersByGroup = {};
  for (const filterId of activeAttributeFilters) {
    const attribute = attributes.find(attr => attr.kMerkmalWert.toString() === filterId);
    if (attribute) {
      if (!attributeFiltersByGroup[attribute.cName]) {
        attributeFiltersByGroup[attribute.cName] = [];
      }
      attributeFiltersByGroup[attribute.cName].push(filterId);
    }
  }
  
  let filteredProducts = unfilteredProducts.filter(product => {
    const availabilityFilter = localStorage.getItem('filter_availability');
    const inStockMatch = availabilityFilter == 1 ? true : (product.available>0);
    const isNewMatch = availabilityFilters.includes('2') ?  isNew(product.neu) : true;
    const manufacturerMatch = activeManufacturerFilters.length === 0 || 
      (product.manufacturerId && activeManufacturerFilters.includes(product.manufacturerId.toString()));
    if (Object.keys(attributeFiltersByGroup).length === 0) {
      return manufacturerMatch && inStockMatch && isNewMatch;
    }
    const productAttributes = attributes
      .filter(attr => attr.kArtikel === product.id);
    const attributeMatch = Object.entries(attributeFiltersByGroup).every(([groupName, groupFilters]) => {
      const productGroupAttributes = productAttributes
        .filter(attr => attr.cName === groupName)
        .map(attr => attr.kMerkmalWert.toString());
      return groupFilters.some(filter => productGroupAttributes.includes(filter));
    });
    return manufacturerMatch && attributeMatch && inStockMatch && isNewMatch;
  });
  
  // Sort products by fuzzy similarity to search query instead of filtering them out
  if (searchQuery && searchQuery.trim() !== '') {
    filteredProducts = sortProductsByFuzzySimilarity(filteredProducts, searchQuery);
  }
  
  return filteredProducts;
}
/*
function getFilteredProducts(unfilteredProducts, attributes) {
  const getCookies = prefix => document.cookie.split(';').filter(c => c.trim().startsWith(prefix)).map(c => c.split('=')[0].split('_')[2]);
  const attributeFilters = getCookies('filter_attribute_');
  const manufacturerFilters = getCookies('filter_manufacturer_');
  const uniqueAttributeIds = [...new Set(attributes.map(a => a.kMerkmalWert.toString()))];
  const uniqueManufacturerIds = [...new Set(unfilteredProducts.filter(p => p.manufacturerId).map(p => p.manufacturerId.toString()))];
  const activeAttributeFilters = attributeFilters.filter(f => uniqueAttributeIds.includes(f));
  const activeManufacturerFilters = manufacturerFilters.filter(f => uniqueManufacturerIds.includes(f));
  const groupedAttributeFilters = {};
  for (const id of activeAttributeFilters) {
    const attr = attributes.find(a => a.kMerkmalWert.toString() === id);
    if (attr) (groupedAttributeFilters[attr.cName] ??= []).push(id);
  }
  const availabilityFilter = localStorage.getItem('filter_availability');
  return unfilteredProducts.filter(p => {
    const matchesStock = availabilityFilter != 1 || p.available > 0;
    const matchesManufacturer = !activeManufacturerFilters.length || (p.manufacturerId && activeManufacturerFilters.includes(p.manufacturerId.toString()));
    if (!Object.keys(groupedAttributeFilters).length) return matchesStock && matchesManufacturer;
    const productAttributes = attributes.filter(a => a.kArtikel === p.id);
    const matchesAttributes = Object.entries(groupedAttributeFilters).every(([name, filters]) => {
      const productValues = productAttributes.filter(a => a.cName === name).map(a => a.kMerkmalWert.toString());
      return filters.some(f => productValues.includes(f));
    });
    return matchesStock && matchesManufacturer && matchesAttributes;
  });
}
*/
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

class Content extends Component {
  constructor(props) {
    super(props);
    // Check if there's a global search query
    const initialSearchQuery = window.currentSearchQuery || '';
    
    this.state = {
      loaded: false,
      categoryName: null, 
      unfilteredProducts: [],
      filteredProducts: [],
      attributes: [],
      isMounted: false,
      searchQuery: initialSearchQuery
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
    
    // Add event listener for search queries
    this.handleSearchQuery = (event) => {
      const query = event.detail.query;
      this.setState({ searchQuery: query }, () => {
        this.filterProducts();
      });
    };
    
    window.addEventListener('search-query-change', this.handleSearchQuery);
  }
  
  componentWillUnmount() {
    // Remove event listener when component unmounts
    window.removeEventListener('search-query-change', this.handleSearchQuery);
  }

  processCategoryData(response) {
    const unfilteredProducts = response.products;
    
    if (!window.individualProductCache) {
      window.individualProductCache = {};
    }
    unfilteredProducts.forEach(product => {
      window.individualProductCache[product.id] = {
        data: product,
        timestamp: Date.now()
      };
    });

    this.setState({
      unfilteredProducts: unfilteredProducts,
      filteredProducts: getFilteredProducts(
        unfilteredProducts,
        response.attributes,
        this.state.searchQuery || ''
      ),
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

    this.props.socket.emit("getCategoryProducts", { categoryId: parseInt(categoryId) },
      (response) => {
        setCachedCategoryData(categoryId, response);
        if (response && response.products) {
          this.processCategoryData(response);
        } else {
          console.log("fetchCategoryData in Content failed", response);
        }
      }
    );
  }

  filterProducts() {
    this.setState({ 
      filteredProducts: getFilteredProducts(
        this.state.unfilteredProducts,
        this.state.attributes,
        this.state.searchQuery || ''
      ) 
    });
  }

  render() {
    if (!this.state.isMounted) {
      return <div></div>;
    }
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
            <ProductFilters 
              products={this.state.unfilteredProducts}
              filteredProducts={this.state.filteredProducts}
              attributes={this.state.attributes}
              searchParams={this.props.searchParams}
              onFilterChange={()=>{this.filterProducts()}}
            />
          </Box>

          <Box>
            <ProductList
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

export default withRouter(Content);