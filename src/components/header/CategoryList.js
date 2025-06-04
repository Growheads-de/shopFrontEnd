import React, { Component } from 'react';
import { Box, Container, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

class CategoryList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      parentCategory: null,
      fetchedCategories: false
    };
  }

  componentDidMount() {
    this.fetchCategories();
  }
  
  componentDidUpdate(prevProps) {
    // If socket becomes available or changes or categoryId changes
    if (!prevProps.socket && this.props.socket || prevProps.categoryId !== this.props.categoryId) {
      this.setState({
        fetchedCategories: false
      }, () => {
        this.fetchCategories();
      });
    }
  }
  
  fetchCategories = () => {
    const { socket } = this.props;
    if (!socket) {
      console.error('No socket available for CategoryList');
      return;
    }
    
    if (this.state.fetchedCategories) {
      console.log('Categories already fetched, skipping');
      return;
    }
    
    // Initialize global cache object if it doesn't exist
    if (!window.productCache) {
      window.productCache = {};
    }
    
    // Check if we have a valid cache in the global object
    try {
      const cacheKey = 'categoryList_' + this.props.categoryId;
      const cachedData = window.productCache[cacheKey];
      if (cachedData) {
        const { categories, parentCategory, timestamp } = cachedData;
        const cacheAge = Date.now() - timestamp;
        const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
        
        // If cache is less than 10 minutes old, use it
        if (cacheAge < tenMinutes && Array.isArray(categories)) {
          //console.log('Using cached categories, age:', Math.round(cacheAge/1000), 'seconds');
          this.setState({ 
            categories,
            parentCategory: parentCategory || null,
            fetchedCategories: true 
          });
          return;
        }
      }
    } catch (err) {
      console.error('Error reading from cache:', err);
    }
    
    //console.log('CategoryList: Fetching categories from socket');
    socket.emit('categoryList', {categoryId: this.props.categoryId}, (response) => {
      console.log('CategoryList response:', response);
      
      if (response && response.categories) {
        //console.log('Categories received:', response.categories.length);
        
        // Store in global cache with timestamp
        try {
          const cacheKey = 'categoryList_' + this.props.categoryId;
          window.productCache[cacheKey] = {
            categories: response.categories,
            parentCategory: response.parentCategory || null,
            timestamp: Date.now()
          };
        } catch (err) {
          console.error('Error writing to cache:', err);
        }
        
        this.setState({ 
          categories: response.categories,
          parentCategory: response.parentCategory || null,
          fetchedCategories: true 
        }, () => {
          //console.log('Categories in state:', this.state.categories);
        });
      } else {
        
        try {
            const cacheKey = 'categoryList_' + this.props.categoryId;
            window.productCache[cacheKey] = {
              categories: [],
              parentCategory: response.parentCategory || null,
              timestamp: Date.now()
            };
          } catch (err) {
            console.error('Error writing to cache:', err);
          }
          
          this.setState({ 
            categories: [],
            parentCategory: response.parentCategory || null,
            fetchedCategories: true 
          }, () => {
            //console.log('Categories in state:', this.state.categories);
          });
      }
    });
  }
  
  render() {
    const { categories } = this.state;
    //console.log('CategoryList render - categories:', categories);
    
    return (
      <Box 
        sx={{ 
          width: '100%',
          bgcolor: 'primary.dark',
          py: 0.75,
          px: 2,
          display: { xs: 'none', md: 'block' }
        }}
      >
        <Container maxWidth="lg">
          <Box 
            sx={{ 
              display: 'flex',
              justifyContent: this.props.categoryId === null ? 'center' : 'flex-start',
              alignItems: 'center',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {this.props.categoryId !== null && (
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
                  minWidth: 'auto',
                  '&:hover': {
                    opacity: 1,
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <HomeIcon sx={{ fontSize: '1rem' }} />
              </Button>
            )}
            {this.state.parentCategory && this.state.parentCategory.id && this.state.parentCategory.name && (
              <Button
                component={Link}
                to={`/category/${this.state.parentCategory.id}`}
                color="inherit"
                size="small"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 'normal',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  opacity: 0.9,
                  mx: 0.5,
                  minWidth: 'auto',
                  '&:hover': {
                    opacity: 1,
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
                title={`Up to ${this.state.parentCategory.name}`}
              >
                <ArrowUpwardIcon sx={{ fontSize: '1rem' }} />
              </Button>
            )}
            {this.state.fetchedCategories && categories.length > 0 ? (
              <>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    component={Link}
                    to={`/category/${category.id}`}
                    color="inherit"
                    size="small"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 'normal',
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      opacity: 0.9,
                      mx: 0.5,
                      '&:hover': {
                        opacity: 1,
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    {category.name}
                  </Button>
                ))}
              </>
            ) : (
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
            )}
          </Box>
        </Container>
      </Box>
    );
  }
}

export default CategoryList; 