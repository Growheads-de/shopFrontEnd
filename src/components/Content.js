import React, { Component } from 'react';
import { Container, Box, Paper, Typography, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import ProductFilters from './ProductFilters.js';
import ProductList from './ProductList.js';

import { useParams, useSearchParams } from 'react-router-dom';
import { getAllSettingsWithPrefix } from '../utils/sessionStorage.js';

const isNew = (neu) => neu && (new Date().getTime() - new Date(neu).getTime() < 30 * 24 * 60 * 60 * 1000);

const fontFaceStyle = `
@font-face {
  font-family: 'SwashingtonCP';
  src: url('/assets/fonts/SwashingtonCP.ttf') format('truetype');
}
`;

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



function getFilteredProducts(unfilteredProducts, attributes) {
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
  const uniqueManufacturersWithName = [...new Set((unfilteredProducts || []).filter(product => product.manufacturerId).map(product => ({id:product.manufacturerId ? product.manufacturerId.toString() : '',value:product.manufacturer})))];
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
    const availabilityFilter = sessionStorage.getItem('filter_availability');
    let inStockMatch = availabilityFilter == 1 ? true : (product.available>0);
    const isNewMatch = availabilityFilters.includes('2') ?  isNew(product.neu) : true;
    let soonMatch = availabilityFilters.includes('3') ? !product.available && product.incoming : true;

    const soon2Match = (availabilityFilter != 1)&&availabilityFilters.includes('3') ? (product.available) || (!product.available && product.incoming) : true;
    if( (availabilityFilter != 1)&&availabilityFilters.includes('3') && ((product.available) || (!product.available && product.incoming))){
      inStockMatch = true;
      soonMatch = true;
      console.log("soon2Match", product.cName);
    }

    const manufacturerMatch = activeManufacturerFilters.length === 0 || 

      (product.manufacturerId && activeManufacturerFilters.includes(product.manufacturerId.toString()));
    if (Object.keys(attributeFiltersByGroup).length === 0) {
      return manufacturerMatch && soon2Match && inStockMatch && soonMatch && isNewMatch;
    }
    const productAttributes = attributes
      .filter(attr => attr.kArtikel === product.id);
    const attributeMatch = Object.entries(attributeFiltersByGroup).every(([groupName, groupFilters]) => {
      const productGroupAttributes = productAttributes
        .filter(attr => attr.cName === groupName)
        .map(attr => attr.kMerkmalWert ? attr.kMerkmalWert.toString() : '');
      return groupFilters.some(filter => productGroupAttributes.includes(filter));
    });
    return manufacturerMatch && attributeMatch && soon2Match && inStockMatch && soonMatch && isNewMatch;
  });
  

  const activeAttributeFiltersWithNames = activeAttributeFilters.map(filter => {
    const attribute = attributes.find(attr => attr.kMerkmalWert.toString() === filter);
    return {name: attribute.cName, value: attribute.cWert, id: attribute.kMerkmalWert};
  });
  const activeManufacturerFiltersWithNames = activeManufacturerFilters.map(filter => {
    const manufacturer = uniqueManufacturersWithName.find(manufacturer => manufacturer.id === filter);
    return {name: manufacturer.value, value: manufacturer.id};
  });
  return {filteredProducts,activeAttributeFilters:activeAttributeFiltersWithNames,activeManufacturerFilters:activeManufacturerFiltersWithNames};
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
  }

  componentDidUpdate(prevProps) {
    if(this.props.params.categoryId && (prevProps.params.categoryId !== this.props.params.categoryId)) {
        window.currentSearchQuery = null;
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

  processData(response) {
    const unfilteredProducts = response.products;
    
    if (!window.individualProductCache) {
      window.individualProductCache = {};
    }
    //console.log("processData", unfilteredProducts);
    if(unfilteredProducts) unfilteredProducts.forEach(product => {
      window.individualProductCache[product.id] = {
        data: product,
        timestamp: Date.now()
      };
    });

    this.setState({
      unfilteredProducts: unfilteredProducts,
      ...getFilteredProducts(
        unfilteredProducts,
        response.attributes
      ),
      categoryName: response.categoryName || response.name || null,
      dataType: response.dataType,
      dataParam: response.dataParam,
      attributes: response.attributes,
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
      ...getFilteredProducts(
        this.state.unfilteredProducts,
        this.state.attributes
      )
    });
  }


  render() {
    return (
      <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1, height: '100%', display: 'grid', gridTemplateRows: '1fr' }}>
        <style>{fontFaceStyle}</style>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr', md: '1fr 3fr', lg: '1fr 4fr', xl: '1fr 4fr' }, 
          gap: 3
        }}>

          <Stack direction="row" spacing={0} sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: { xs: 'auto', sm: '100%' }
          }}> 

          <Box >
   
            <ProductFilters 
              products={this.state.unfilteredProducts}
              filteredProducts={this.state.filteredProducts}
              attributes={this.state.attributes}
              searchParams={this.props.searchParams}
              onFilterChange={()=>{this.filterProducts()}}
              dataType={this.state.dataType}
              dataParam={this.state.dataParam}
            />
          </Box>

          {this.props.params.categoryId == 706 && <Paper
            component={Link}
            to="/category/689"
            sx={{
              p:0,
              mt: 3,
              textDecoration: 'none',
              color: 'text.primary',
              borderRadius: 2,
              overflow: 'hidden',
              height: 300,
              transition: 'all 0.3s ease',
              boxShadow: 10,
              display: { xs: 'none', sm: 'block' },
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 20
              }
            }}
          >
            {/* Image Container - Place your seeds image here */}
            <Box sx={{
              height: '100%',
              bgcolor: '#e1f0d3',
              backgroundImage: 'url("/assets/images/seeds.jpg")',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              position: 'relative'
            }}>
              {/* Overlay text - optional */}
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'rgba(27, 94, 32, 0.8)',
                p: 2,
              }}>
                <Typography sx={{ fontSize: '1.3rem', color: 'white', fontFamily: 'SwashingtonCP' }}>
                  Seeds
                </Typography>
              </Box>
            </Box>
            </Paper>
          }

          {this.props.params.categoryId == 689 && <Paper
            component={Link}
            to="/category/706"
            sx={{
              p: 0,
              mt: 3,
              textDecoration: 'none',
              color: 'text.primary',
              borderRadius: 2,
              overflow: 'hidden',
              height: 300,
              boxShadow: 10,
              transition: 'all 0.3s ease',
              display: { xs: 'none', sm: 'block' },
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 20
              }
            }}
          >
            {/* Image Container - Place your cutlings image here */}
            <Box sx={{
              height: '100%',
              bgcolor: '#e8f5d6',
              backgroundImage: 'url("/assets/images/cutlings.jpg")',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              position: 'relative'
            }}>
              {/* Overlay text - optional */}
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'rgba(27, 94, 32, 0.8)',
                p: 2,
              }}>
                <Typography sx={{ fontSize: '1.3rem', color: 'white', fontFamily: 'SwashingtonCP' }}>
                  Stecklinge
                </Typography>
              </Box>
            </Box>
          </Paper>}
          </Stack>

          <Box>
            <ProductList
              socket={this.props.socket}
              totalProductCount={(this.state.unfilteredProducts || []).length}
              products={this.state.filteredProducts || []}
              activeAttributeFilters={this.state.activeAttributeFilters || []}
              activeManufacturerFilters={this.state.activeManufacturerFilters || []}
              onFilterChange={()=>{this.filterProducts()}}
              dataType={this.state.dataType}
              dataParam={this.state.dataParam}
            />
          </Box>
        </Box>
      </Container>
    );
  }
}

export default withRouter(Content);