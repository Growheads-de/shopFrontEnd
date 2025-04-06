import React, { Component } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  FormControl, 
  FormGroup, 
  FormControlLabel, 
  Checkbox, 
  Radio, 
  RadioGroup
} from '@mui/material';

class ProductFilters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      availability: {
        inStock: true
      },
      sortBy: 'priceAsc'
    };
  }

  handleAvailabilityChange = (event) => {
    this.setState({
      availability: {
        ...this.state.availability,
        [event.target.name]: event.target.checked
      }
    });

    if (this.props.onFilterChange) {
      this.props.onFilterChange({ 
        type: 'availability', 
        name: event.target.name, 
        value: event.target.checked 
      });
    }
  };

  handleSortByChange = (event) => {
    this.setState({ sortBy: event.target.value });
    
    if (this.props.onFilterChange) {
      this.props.onFilterChange({ 
        type: 'sortBy', 
        value: event.target.value 
      });
    }
  };


  render() {
    const { availability, sortBy } = this.state;

    return (
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          borderRadius: 2, 
          height: '100%',
          bgcolor: 'background.paper'
        }}
      >
        {/* Availability Filter */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Availability
          </Typography>
          <FormGroup>
            <FormControlLabel 
              control={
                <Checkbox 
                  checked={availability.inStock} 
                  onChange={this.handleAvailabilityChange} 
                  name="inStock" 
                  color="primary"
                  size="small"
                />
              } 
              label="In Stock" 
            />
          </FormGroup>
        </Box>
        
        {/* Sort By Filter */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Sort By
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup 
              value={sortBy} 
              onChange={this.handleSortByChange}
            >
              <FormControlLabel 
                value="priceAsc" 
                control={<Radio size="small" color="primary" />} 
                label="Price: Low to High" 
              />
              <FormControlLabel 
                value="priceDesc" 
                control={<Radio size="small" color="primary" />} 
                label="Price: High to Low" 
              />
              <FormControlLabel 
                value="name" 
                control={<Radio size="small" color="primary" />} 
                label="Name" 
              />
            </RadioGroup>
          </FormControl>
        </Box>
      </Paper>
    );
  }
}

export default ProductFilters; 