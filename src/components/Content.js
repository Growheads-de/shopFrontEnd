import React, { Component } from 'react';
import { Container, Box } from '@mui/material';
import ProductFilters from './ProductFilters.js';
import ProductList from './ProductList.js';

import { useParams, useSearchParams } from 'react-router-dom';
import { getAllSettingsWithPrefix } from '../utils/sessionStorage.js';

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
  const attributeSettings = getAllSettingsWithPrefix('filter_attribute_');
  const manufacturerSettings = getAllSettingsWithPrefix('filter_manufacturer_');
  const availabilitySettings = getAllSettingsWithPrefix('filter_availability_');
  
  const attributeFilters = [];
  Object.keys(attributeSettings).forEach(key => {
    if (attributeSettings[key] === 'true') {
      attributeFilters.push(key.split('_')[2]);
    }
  });
  
  const manufacturerFilters = [];
  Object.keys(manufacturerSettings).forEach(key => {
    if (manufacturerSettings[key] === 'true') {
      manufacturerFilters.push(key.split('_')[2]);
    }
  });
  
  const availabilityFilters = [];
  Object.keys(availabilitySettings).forEach(key => {
    if (availabilitySettings[key] === 'true') {
      availabilityFilters.push(key.split('_')[2]);
    }
  });

  const uniqueAttributes = [...new Set((attributes || []).map(attr => attr.kMerkmalWert ? attr.kMerkmalWert.toString() : ''))];
  const uniqueManufacturers = [...new Set((unfilteredProducts || []).filter(product => product.manufacturerId).map(product => product.manufacturerId ? product.manufacturerId.toString() : ''))];
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
  
  let filteredProducts = (unfilteredProducts || []).filter(product => {
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
        .map(attr => attr.kMerkmalWert ? attr.kMerkmalWert.toString() : '');
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
function setCachedCategoryData(categoryId, data) {
  if (!window.productCache) {
    window.productCache = {};
  }
  if (!window.productDetailCache) {
    window.productDetailCache = {};
  }

  try {
    const cacheKey = `categoryProducts_${categoryId}`;
    if(data.products) for(const product of data.products) {
      window.productDetailCache[product.id] = product;
    }
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

    this.state = {
      loaded: false,
      categoryName: null, 
      unfilteredProducts: [],
      filteredProducts: [],
      attributes: []
    };
  }

  componentDidMount() {
    if(this.props.params.categoryId) {this.setState({loaded: false, unfilteredProducts: [], filteredProducts: [], attributes: [], categoryName: null}, () => {
      this.fetchCategoryData(this.props.params.categoryId);
    })}
    else if (this.props.searchParams?.get('q')) {
      this.setState({loaded: false, unfilteredProducts: [], filteredProducts: [], attributes: [], categoryName: null}, () => {
        this.fetchSearchData(this.props.searchParams?.get('q'));
      })
    }
    this.handleSearchQuery = (event) => {
      const query = event.detail.query;
      this.setState({ searchQuery: query }, () => {
        this.filterProducts();
      });
    };
    window.addEventListener('search-query-change', this.handleSearchQuery);
  }

  componentDidUpdate(prevProps) {
    if(this.props.params.categoryId && (prevProps.params.categoryId !== this.props.params.categoryId)) {
        this.setState({loaded: false, unfilteredProducts: [], filteredProducts: [], attributes: [], categoryName: null}, () => {
        this.fetchCategoryData(this.props.params.categoryId);
      }); 
    } 
    else if (this.props.searchParams?.get('q') && (prevProps.searchParams?.get('q') !== this.props.searchParams?.get('q'))) {
      this.setState({loaded: false, unfilteredProducts: [], filteredProducts: [], attributes: [], categoryName: null}, () => {
        this.fetchSearchData(this.props.searchParams?.get('q'));
      })
    }
  }

  componentWillUnmount() {
    window.removeEventListener('search-query-change', this.handleSearchQuery);
  }

  processData(response) {
    const unfilteredProducts = response.products;
    
    if (!window.individualProductCache) {
      window.individualProductCache = {};
    }
    if(unfilteredProducts) unfilteredProducts.forEach(product => {
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
      this.processData(cachedData);
      return;
    }

    this.props.socket.emit("getCategoryProducts", { categoryId: parseInt(categoryId) },
      (response) => {
        setCachedCategoryData(categoryId, response);
        if (response && response.products) {
          this.processData(response);
        } else {
          console.log("fetchCategoryData in Content failed", response);
        }
      }
    );
  }

  fetchSearchData(query) {
    this.props.socket.emit("getSearchProducts", { query },
      (response) => {
        if (response && response.products) {
          this.processData(response);
        } else {
          console.log("fetchSearchData in Content failed", response);
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
              totalProductCount={(this.state.unfilteredProducts || []).length}
              products={this.state.filteredProducts || []}
            />
          </Box>
        </Box>
      </Container>
    );
  }
}

export default withRouter(Content);