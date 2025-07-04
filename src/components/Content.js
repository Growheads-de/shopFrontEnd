import React, { Component } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ProductFilters from './ProductFilters.js';
import ProductList from './ProductList.js';
import CategoryBoxGrid from './CategoryBoxGrid.js';
import CategoryBox from './CategoryBox.js';

import { useParams, useSearchParams } from 'react-router-dom';
import { getAllSettingsWithPrefix } from '../utils/sessionStorage.js';

const isNew = (neu) => neu && (new Date().getTime() - new Date(neu).getTime() < 30 * 24 * 60 * 60 * 1000);

// @note SwashingtonCP font is now loaded globally via index.css

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
    
    // Check if there are any new products in the entire set
    const hasNewProducts = (unfilteredProducts || []).some(product => isNew(product.neu));
    
    // Only apply the new filter if there are actually new products and the filter is active
    const isNewMatch = availabilityFilters.includes('2') && hasNewProducts ? isNew(product.neu) : true;
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

  // Extract active availability filters
  const availabilityFilter = sessionStorage.getItem('filter_availability');
  const activeAvailabilityFilters = [];
  
  // Check if there are actually products with these characteristics
  const hasNewProducts = (unfilteredProducts || []).some(product => isNew(product.neu));
  const hasComingSoonProducts = (unfilteredProducts || []).some(product => !product.available && product.incoming);
  
  // Check for "auf Lager" filter (in stock) - it's active when filter_availability is NOT set to '1'
  if (availabilityFilter !== '1') {
    activeAvailabilityFilters.push({id: '1', name: 'auf Lager'});
  }
  
  // Check for "Neu" filter (new) - only show if there are actually new products and filter is active
  if (availabilityFilters.includes('2') && hasNewProducts) {
    activeAvailabilityFilters.push({id: '2', name: 'Neu'});
  }
  
  // Check for "Bald verfügbar" filter (coming soon) - only show if there are actually coming soon products and filter is active
  if (availabilityFilters.includes('3') && hasComingSoonProducts) {
    activeAvailabilityFilters.push({id: '3', name: 'Bald verfügbar'});
  }

  return {filteredProducts,activeAttributeFilters:activeAttributeFiltersWithNames,activeManufacturerFilters:activeManufacturerFiltersWithNames,activeAvailabilityFilters};
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
      attributes: [],
      childCategories: []
    };
  }

  componentDidMount() {
    if(this.props.params.categoryId) {this.setState({loaded: false, unfilteredProducts: [], filteredProducts: [], attributes: [], categoryName: null, childCategories: []}, () => {
        this.fetchCategoryData(this.props.params.categoryId);
    })}
    else if (this.props.searchParams?.get('q')) {
      this.setState({loaded: false, unfilteredProducts: [], filteredProducts: [], attributes: [], categoryName: null, childCategories: []}, () => {
        this.fetchSearchData(this.props.searchParams?.get('q'));
      })
    }
  }

  componentDidUpdate(prevProps) {
    if(this.props.params.categoryId && (prevProps.params.categoryId !== this.props.params.categoryId)) {
        window.currentSearchQuery = null;
        this.setState({loaded: false, unfilteredProducts: [], filteredProducts: [], attributes: [], categoryName: null, childCategories: []}, () => {
          this.fetchCategoryData(this.props.params.categoryId);
        }); 
    } 
    else if (this.props.searchParams?.get('q') && (prevProps.searchParams?.get('q') !== this.props.searchParams?.get('q'))) {
      this.setState({loaded: false, unfilteredProducts: [], filteredProducts: [], attributes: [], categoryName: null, childCategories: []}, () => {
        this.fetchSearchData(this.props.searchParams?.get('q'));
      })
    }

    // Handle socket connection changes
    const wasConnected = prevProps.socket && prevProps.socket.connected;
    const isNowConnected = this.props.socket && this.props.socket.connected;
    
    if (!wasConnected && isNowConnected && !this.state.loaded) {
      // Socket just connected and we haven't loaded data yet, retry loading
      if (this.props.params.categoryId) {
        this.fetchCategoryData(this.props.params.categoryId);
      } else if (this.props.searchParams?.get('q')) {
        this.fetchSearchData(this.props.searchParams?.get('q'));
      }
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
      childCategories: response.childCategories || [],
      loaded: true
    });
  }



  fetchCategoryData(categoryId) {
    const cachedData = getCachedCategoryData(categoryId);
    if (cachedData) {
      this.processDataWithCategoryTree(cachedData, categoryId);
      return;
    }

    if (!this.props.socket || !this.props.socket.connected) {
      // Socket not connected yet, but don't show error immediately on first load
      // The componentDidUpdate will retry when socket connects
      console.log("Socket not connected yet, waiting for connection to fetch category data");
      return;
    }
    console.log(`productList:${categoryId}`);
    this.props.socket.off(`productList:${categoryId}`);

    // Track if we've received the full response to ignore stub response if needed
    let receivedFullResponse = false;

    this.props.socket.on(`productList:${categoryId}`,(response) => {
      console.log("getCategoryProducts full response", response);
      receivedFullResponse = true;
      setCachedCategoryData(categoryId, response);
      if (response && response.products !== undefined) {
        this.processDataWithCategoryTree(response, categoryId);
      } else {
        console.log("fetchCategoryData in Content failed", response);
      }
    });

    this.props.socket.emit("getCategoryProducts", { categoryId: categoryId },
      (response) => {
        console.log("getCategoryProducts stub response", response);
        // Only process stub response if we haven't received the full response yet
        if (!receivedFullResponse) {
          setCachedCategoryData(categoryId, response);
          if (response && response.products !== undefined) {
            this.processDataWithCategoryTree(response, categoryId);
          } else {
            console.log("fetchCategoryData in Content failed", response);
          }
        } else {
          console.log("Ignoring stub response - full response already received");
        }
      }
    );
  }
  
  processDataWithCategoryTree(response, categoryId) {
    // Get child categories from the cached category tree
    let childCategories = [];
    try {
      const categoryTreeCache = window.productCache && window.productCache['categoryTree_209'];
      if (categoryTreeCache && categoryTreeCache.categoryTree) {
        // If categoryId is a string (SEO name), find by seoName, otherwise by ID
        const targetCategory = typeof categoryId === 'string' 
          ? this.findCategoryBySeoName(categoryTreeCache.categoryTree, categoryId)
          : this.findCategoryById(categoryTreeCache.categoryTree, categoryId);
        
        if (targetCategory && targetCategory.children) {
          childCategories = targetCategory.children;
        }
      }
    } catch (err) {
      console.error('Error getting child categories from tree:', err);
    }
    
    // Add child categories to the response
    const enhancedResponse = {
      ...response,
      childCategories
    };
    
    this.processData(enhancedResponse);
  }
  
  findCategoryById(category, targetId) {
    if (!category) return null;
    
    if (category.id === targetId) {
      return category;
    }
    
    if (category.children) {
      for (let child of category.children) {
        const found = this.findCategoryById(child, targetId);
        if (found) return found;
      }
    }
    
    return null;
  }

  fetchSearchData(query) {
    if (!this.props.socket || !this.props.socket.connected) {
      // Socket not connected yet, but don't show error immediately on first load
      // The componentDidUpdate will retry when socket connects
      console.log("Socket not connected yet, waiting for connection to fetch search data");
      return;
    }

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

  // Helper function to find category by seoName
  findCategoryBySeoName = (categoryNode, seoName) => {
    if (!categoryNode) return null;
    
    if (categoryNode.seoName === seoName) {
      return categoryNode;
    }
    
    if (categoryNode.children) {
      for (const child of categoryNode.children) {
        const found = this.findCategoryBySeoName(child, seoName);
        if (found) return found;
      }
    }
    
    return null;
  }

  // Helper function to get current category ID from seoName
  getCurrentCategoryId = () => {
    const seoName = this.props.params.categoryId;
    
    // Get the category tree from cache
    const categoryTreeCache = window.productCache && window.productCache['categoryTree_209'];
    if (!categoryTreeCache || !categoryTreeCache.categoryTree) {
      return null;
    }

    // Find the category by seoName
    const category = this.findCategoryBySeoName(categoryTreeCache.categoryTree, seoName);
    return category ? category.id : null;
  }

  renderParentCategoryNavigation = () => {
    const currentCategoryId = this.getCurrentCategoryId();
    if (!currentCategoryId) return null;
    
    // Get the category tree from cache
    const categoryTreeCache = window.productCache && window.productCache['categoryTree_209'];
    if (!categoryTreeCache || !categoryTreeCache.categoryTree) {
      return null;
    }

    // Find the current category in the tree
    const currentCategory = this.findCategoryById(categoryTreeCache.categoryTree, currentCategoryId);
    if (!currentCategory) {
      return null;
    }

    // Check if this category has a parent (not root category 209)
    if (!currentCategory.parentId || currentCategory.parentId === 209) {
      return null; // Don't show for top-level categories
    }

    // Find the parent category
    const parentCategory = this.findCategoryById(categoryTreeCache.categoryTree, currentCategory.parentId);
    if (!parentCategory) {
      return null;
    }

    // Create parent category object for CategoryBox
    const parentCategoryForDisplay = {
      id: parentCategory.id,
      seoName: parentCategory.seoName,
      name: parentCategory.name,
      image: parentCategory.image,
      isParentNav: true
    };

    return parentCategoryForDisplay;
  }

  render() {
    // Check if we should show category boxes instead of product list
    const showCategoryBoxes = this.state.loaded && 
                             this.state.unfilteredProducts.length === 0 && 
                             this.state.childCategories.length > 0;
    

    return (
      <Container maxWidth="xl" sx={{ py: { xs: 0, sm: 2 }, px: { xs: 0, sm: 3 }, flexGrow: 1, display: 'grid', gridTemplateRows: '1fr' }}>

        {showCategoryBoxes ? (
          // Show category boxes layout when no products but have child categories
          <CategoryBoxGrid 
            categories={this.state.childCategories}
            title={this.state.categoryName}
          />
        ) : (
          <>
            {/* Show subcategories above main layout when there are both products and child categories */}
            {this.state.loaded && 
             this.state.unfilteredProducts.length > 0 && 
             this.state.childCategories.length > 0 && (
              <Box sx={{ mb: 4 }}>
                {(() => {
                  const parentCategory = this.renderParentCategoryNavigation();
                  if (parentCategory) {
                    // Show parent category to the left of subcategories
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, flexWrap: 'wrap' }}>
                        {/* Parent Category Box */}
                        <Box sx={{ mt:2,position: 'relative', flexShrink: 0 }}>
                          <CategoryBox
                            id={parentCategory.id}
                            seoName={parentCategory.seoName}
                            name={parentCategory.name}
                            image={parentCategory.image}
                            height={130}
                            fontSize="1.0rem"
                          />
                          {/* Up Arrow Overlay */}
                          <Box sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(27, 94, 32, 0.8)',
                            borderRadius: '50%',
                            zIndex: 100,
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <KeyboardArrowUpIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
                          </Box>
                        </Box>
                        
                        {/* Subcategories Grid */}
                        <Box sx={{ flexGrow: 1 }}>
                          <CategoryBoxGrid categories={this.state.childCategories} />
                        </Box>
                      </Box>
                    );
                  } else {
                    // No parent category, just show subcategories
                    return <CategoryBoxGrid categories={this.state.childCategories} />;
                  }
                })()}
              </Box>
            )}

            {/* Show standalone parent category navigation when there are only products */}
            {this.state.loaded && 
             this.props.params.categoryId && 
             !(this.state.unfilteredProducts.length > 0 && this.state.childCategories.length > 0) && (() => {
              const parentCategory = this.renderParentCategoryNavigation();
              if (parentCategory) {
                return (
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ position: 'relative', width: 'fit-content' }}>
                      <CategoryBox
                        id={parentCategory.id}
                        seoName={parentCategory.seoName}
                        name={parentCategory.name}
                        image={parentCategory.image}
                        height={130}
                        fontSize="1.0rem"
                      />
                      {/* Up Arrow Overlay */}
                      <Box sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(27, 94, 32, 0.8)',
                        borderRadius: '50%',
                        zIndex: 100,
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <KeyboardArrowUpIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
                      </Box>
                    </Box>
                  </Box>
                );
              }
              return null;
            })()}

            {/* Show normal product list layout */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr', md: '1fr 3fr', lg: '1fr 4fr', xl: '1fr 4fr' }, 
              gap: { xs: 0, sm: 3 }
            }}>

            <Stack direction="row" spacing={0} sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              minHeight: { xs: 'min-content', sm: '100%' }
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

            {(this.getCurrentCategoryId() == 706 || this.getCurrentCategoryId() == 689) &&
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="h6" sx={{mt:3}}>
              Andere Kategorien
            </Typography>
          </Box>
          }

          {this.props.params.categoryId == 'Stecklinge' && <Paper
            component={Link}
            to="/Kategorie/Seeds"
            sx={{
              p:0,
              mt: 1,
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

            {this.props.params.categoryId == 'Seeds' && <Paper
            component={Link}
            to="/Kategorie/Stecklinge"
            sx={{
              p: 0,
              mt: 1,
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
                socketB={this.props.socketB}
                totalProductCount={(this.state.unfilteredProducts || []).length}
                products={this.state.filteredProducts || []}
                activeAttributeFilters={this.state.activeAttributeFilters || []}
                activeManufacturerFilters={this.state.activeManufacturerFilters || []}
                activeAvailabilityFilters={this.state.activeAvailabilityFilters || []}
                onFilterChange={()=>{this.filterProducts()}}
                dataType={this.state.dataType}
                dataParam={this.state.dataParam}
              />
            </Box>
          </Box>
          </>
        )}
      </Container>
    );
  }
}

export default withRouter(Content);