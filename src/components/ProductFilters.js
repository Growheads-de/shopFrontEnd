import React, { Component } from 'react';
import { 
  Paper
} from '@mui/material';
import Filter from './Filter.js';

class ProductFilters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      availabilityValues: this.getAvailabilityFromStorage()
    };
  }

  getAvailabilityFromStorage = () => {
    try {
      const storedValue = localStorage.getItem('availabilityFilter');
      if (storedValue) {
        return JSON.parse(storedValue);
      }
      // Default value if nothing in storage
      return { inStock: true };
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return { inStock: true };
    }
  };

  handleFilterChange = (filterData) => {
    if (filterData.type === 'availability') {
      // Update local state
      this.setState(prevState => {
        const newAvailabilityValues = {
          ...prevState.availabilityValues,
          [filterData.name]: filterData.value
        };
        
        // Store in localStorage
        try {
          localStorage.setItem('availabilityFilter', JSON.stringify(newAvailabilityValues));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
        }
        
        return { availabilityValues: newAvailabilityValues };
      });
    }

    if (this.props.onFilterChange) {
      this.props.onFilterChange(filterData);
    }
  };

  render() {
    const { manufacturers = [], manufacturerProductCount = {} } = this.props;
    const { availabilityValues } = this.state;

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
        <Filter 
          title="Availability"
          options={['in Stock']}
          initialValues={availabilityValues}
          filterType="availability"
          onFilterChange={this.handleFilterChange}
        />

        {/* Manufacturer Filter */}
        <Filter 
          title="Manufacturer"
          options={manufacturers}
          counts={manufacturerProductCount}
          filterType="manufacturer"
          onFilterChange={this.handleFilterChange}
        />
      </Paper>
    );
  }
}

export default ProductFilters; 