import React, { Component, Profiler } from 'react';
import { Box, Container, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

class CategoryList extends Component {
  findCategoryById = (category, targetId) => {
    if (!category) return null;
    
    console.log('findCategoryById', category.seoName, targetId);

    if (category.seoName === targetId) {
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

  getPathToCategory = (category, targetId, currentPath = []) => {
    if (!category) return null;
    
    const newPath = [...currentPath, category];
    
    if (category.seoName === targetId) {
      return newPath;
    }
    
    if (category.children) {
      for (let child of category.children) {
        const found = this.getPathToCategory(child, targetId, newPath);
        if (found) return found;
      }
    }
    
    return null;
  }

  constructor(props) {
    super(props);
    
    // Check for cached data during SSR/initial render
    let initialState = {
      categoryTree: null,
      level1Categories: [], // Children of category 209 (Home) - always shown
      level2Categories: [], // Children of active level 1 category
      level3Categories: [], // Children of active level 2 category
      activePath: [], // Array of active category objects for each level
      fetchedCategories: false
    };
    
    // Try to get cached data for SSR
    try {
      if (typeof window !== 'undefined' && window.productCache) {
        const cacheKey = 'categoryTree_209';
        const cachedData = window.productCache[cacheKey];
        if (cachedData && cachedData.categoryTree) {
          const { categoryTree, timestamp } = cachedData;
          const cacheAge = Date.now() - timestamp;
          const tenMinutes = 10 * 60 * 1000;
          
          // Use cached data if it's fresh
          if (cacheAge < tenMinutes) {
            initialState.categoryTree = categoryTree;
            initialState.fetchedCategories = true;
            
            // Process category tree to set up navigation
            const level1Categories = categoryTree && categoryTree.id === 209 ? categoryTree.children || [] : [];
            initialState.level1Categories = level1Categories;
            
            // Process active category path if needed
            if (props.activeCategoryId) {
              const activeCategory = this.findCategoryById(categoryTree, props.activeCategoryId);
              if (activeCategory) {
                const pathToActive = this.getPathToCategory(categoryTree, props.activeCategoryId);
                initialState.activePath = pathToActive ? pathToActive.slice(1) : [];
                
                if (initialState.activePath.length >= 1) {
                  const level1Category = initialState.activePath[0];
                  initialState.level2Categories = level1Category.children || [];
                }
                
                if (initialState.activePath.length >= 2) {
                  const level2Category = initialState.activePath[1];
                  initialState.level3Categories = level2Category.children || [];
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error reading cache in constructor:', err);
    }
    
    this.state = initialState;
  }

  componentDidMount() {
    this.fetchCategories();
  }
  
  componentDidUpdate(prevProps) {
    // If socket becomes available or changes
    if (!prevProps.socket && this.props.socket) {
      this.setState({
        fetchedCategories: false
      }, () => {
        this.fetchCategories();
      });
    }
    
    // If activeCategoryId changes, update subcategories
    if (prevProps.activeCategoryId !== this.props.activeCategoryId && this.state.categoryTree) {
      this.processCategoryTree(this.state.categoryTree);
    }
  }
  
  fetchCategories = () => {
    const { socket } = this.props;
    if (!socket) {
      console.error('No socket available for CategoryList');
      return;
    }
    
    if (this.state.fetchedCategories) {
      //console.log('Categories already fetched, skipping');
      return;
    }
    
    // Initialize global cache object if it doesn't exist
    if (!window.productCache) {
      window.productCache = {};
    }
    
    // Check if we have a valid cache in the global object
    try {
      const cacheKey = 'categoryTree_209';
      const cachedData = window.productCache[cacheKey];
      if (cachedData) {
        const { categoryTree, timestamp, fetching } = cachedData;
        const cacheAge = Date.now() - timestamp;
        const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
        
        // If data is currently being fetched, wait for it
        if (fetching) {
          //console.log('CategoryList: Data is being fetched, waiting...');
          const checkInterval = setInterval(() => {
            const currentCache = window.productCache[cacheKey];
            if (currentCache && !currentCache.fetching) {
              clearInterval(checkInterval);
              if (currentCache.categoryTree) {
                this.processCategoryTree(currentCache.categoryTree);
              }
            }
          }, 100);
          return;
        }
        
        // If cache is less than 10 minutes old, use it
        if (cacheAge < tenMinutes && categoryTree) {
          //console.log('Using cached category tree, age:', Math.round(cacheAge/1000), 'seconds');
          // Defer processing to next tick to avoid blocking
          setTimeout(() => {
            this.processCategoryTree(categoryTree);
          }, 0);
          return;
        }
      }
    } catch (err) {
      console.error('Error reading from cache:', err);
    }
    
    // Mark as being fetched to prevent concurrent calls
    const cacheKey = 'categoryTree_209';
    window.productCache[cacheKey] = {
      fetching: true,
      timestamp: Date.now()
    };
    this.setState({ fetchedCategories: true });
    
    //console.log('CategoryList: Fetching categories from socket');
    socket.emit('categoryList', {categoryId: 209}, (response) => {
      if (response && response.categoryTree) {
        //console.log('Category tree received:', response.categoryTree);
        
        // Store in global cache with timestamp
        try {
          const cacheKey = 'categoryTree_209';
          window.productCache[cacheKey] = {
            categoryTree: response.categoryTree,
            timestamp: Date.now(),
            fetching: false
          };
        } catch (err) {
          console.error('Error writing to cache:', err);
        }
        
        this.processCategoryTree(response.categoryTree);
      } else {
        
        try {
            const cacheKey = 'categoryTree_209';
            window.productCache[cacheKey] = {
              categoryTree: null,
              timestamp: Date.now()
            };
          } catch (err) {
            console.error('Error writing to cache:', err);
          }
          
          this.setState({ 
            categoryTree: null,
            level1Categories: [],
            level2Categories: [],
            level3Categories: [],
            activePath: []
          });
      }
    });
  }

  processCategoryTree = (categoryTree) => {
    // Level 1 categories are always the children of category 209 (Home)
    const level1Categories = categoryTree && categoryTree.id === 209 ? categoryTree.children || [] : [];
    
    // Build the navigation path and determine what to show at each level
    let level2Categories = [];
    let level3Categories = [];
    let activePath = [];
    
    if (this.props.activeCategoryId) {
      const activeCategory = this.findCategoryById(categoryTree, this.props.activeCategoryId);
      if (activeCategory) {
        // Build the path from root to active category
        const pathToActive = this.getPathToCategory(categoryTree, this.props.activeCategoryId);
        activePath = pathToActive.slice(1); // Remove root (209) from path
        
        // Determine what to show at each level based on the path depth
        if (activePath.length >= 1) {
          // Show children of the level 1 category
          const level1Category = activePath[0];
          level2Categories = level1Category.children || [];
        }
        
        if (activePath.length >= 2) {
          // Show children of the level 2 category
          const level2Category = activePath[1];
          level3Categories = level2Category.children || [];
        }
      }
    }
    
    this.setState({
      categoryTree,
      level1Categories,
      level2Categories,
      level3Categories,
      activePath,
      fetchedCategories: true
    });
  }

  render() {
    const { level1Categories, level2Categories, level3Categories, activePath } = this.state;
    
    const renderCategoryRow = (categories, level = 1) => (
      <Box 
        sx={{ 
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          py: 0.5, // Add vertical padding to prevent border clipping
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {level === 1 && (
          <Button
            component={Link}
            to="/"
            color="inherit"
            size="small"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 'normal',
              textTransform: 'none',
              whiteSpace: 'nowrap',
              opacity: 0.9,
              mx: 0.5,
              my: 0.25, // Add consistent vertical margin to account for borders
              minWidth: 'auto',
              border: '2px solid transparent', // Always have border space
              borderRadius: 1, // Always have border radius
              ...(this.props.activeCategoryId === null && {
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                transform: 'translateY(-2px)',
                bgcolor: 'rgba(255,255,255,0.25)',
                borderColor: 'rgba(255,255,255,0.6)', // Change border color instead of adding border
                fontWeight: 'bold',
                opacity: 1
              }),
              '&:hover': {
                opacity: 1,
                bgcolor: 'rgba(255,255,255,0.15)',
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
              }
            }}
          >
            <HomeIcon sx={{ fontSize: '1rem' }} />
          </Button>
        )}
        {this.state.fetchedCategories && categories.length > 0 ? (
          <>
            {categories.map((category) => {
              // Determine if this category is active at this level
              const isActiveAtThisLevel = activePath[level - 1] && activePath[level - 1].id === category.id;
              
              return (
                <Button
                  key={category.id}
                  component={Link}
                  to={`/Kategorie/${category.seoName}`}
                  color="inherit"
                  size="small"
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 'normal',
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    opacity: 0.9,
                    mx: 0.5,
                    my: 0.25, // Add consistent vertical margin to account for borders
                    border: '2px solid transparent', // Always have border space
                    borderRadius: 1, // Always have border radius
                    ...(isActiveAtThisLevel && {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                      transform: 'translateY(-2px)',
                      bgcolor: 'rgba(255,255,255,0.25)',
                      borderColor: 'rgba(255,255,255,0.6)', // Change border color instead of adding border
                      fontWeight: 'bold',
                      opacity: 1
                    }),
                    '&:hover': {
                      opacity: 1,
                      bgcolor: 'rgba(255,255,255,0.15)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                    }
                  }}
                >
                  {category.name}
                </Button>
              );
            })}
          </>
        ) : (
          level === 1 && (
            <Typography 
              variant="caption" 
              color="inherit"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '30px', // Match small button height
                px: 1,
                fontSize: '0.75rem',
                opacity: 0.9
              }}
            >
              &nbsp;
            </Typography>
          )
        )}
      </Box>
    );
    
    const onRenderCallback = (id, phase, actualDuration) => {
      if (actualDuration > 50) {
        console.warn(`CategoryList render took ${actualDuration}ms in ${phase} phase`);
      }
    };
    
    return (
      <Profiler id="CategoryList" onRender={onRenderCallback}>
        <Box 
          sx={{ 
            width: '100%',
            bgcolor: 'primary.dark',
            px: 2,
            display: { xs: 'none', md: 'block' }
          }}
        >
          <Container maxWidth="lg">
            {/* Level 1 Categories Row - Always shown */}
            {renderCategoryRow(level1Categories, 1)}
            
            {/* Level 2 Categories Row - Show when level 1 is selected */}
            {level2Categories.length > 0 && (
              <Box sx={{ mt: 0.5 }}>
                {renderCategoryRow(level2Categories, 2)}
              </Box>
            )}
            
            {/* Level 3 Categories Row - Show when level 2 is selected */}
            {level3Categories.length > 0 && (
              <Box sx={{ mt: 0.5 }}>
                {renderCategoryRow(level3Categories, 3)}
              </Box>
            )}
          </Container>
        </Box>
      </Profiler>
    );
  }
}

export default CategoryList; 