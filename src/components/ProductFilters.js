import React, { Component } from 'react';
import { 
  Paper
} from '@mui/material';
import Filter from './Filter.js';

class ProductFilters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      availabilityValues: this.getAvailabilityFromStorage(),
      attributeFilters: {}
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

  componentDidUpdate(prevProps) {
    // Reset attribute filters when category changes
    if (prevProps.categoryId !== this.props.categoryId) {
      this.setState({ attributeFilters: {} });
    }
  }

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
    
    // Track attribute filter selections in component state
    if (filterData.type === 'attribute') {
      this.setState(prevState => {
        const newAttributeFilters = {...prevState.attributeFilters};
        
        if (!newAttributeFilters[filterData.attribute]) {
          newAttributeFilters[filterData.attribute] = {};
        }
        
        newAttributeFilters[filterData.attribute][filterData.name] = filterData.value;
        
        return { attributeFilters: newAttributeFilters };
      });
    }

    if (this.props.onFilterChange) {
      this.props.onFilterChange(filterData);
    }
  };

  generateAttributeFilters = () => {
    const { attributeGroups = {}, attributeCounts = {} } = this.props;
    const { attributeFilters } = this.state;
    
    // Convert each attribute Set to array
    return Object.entries(attributeGroups).map(([attributeName, valuesSet]) => {
      const values = Array.from(valuesSet);
      if (values.length <= 1) return null; // Skip if only one value or empty
      
      // Get current filter values for this attribute
      const initialValues = attributeFilters[attributeName] || {};
      
      // Get counts for this attribute
      const counts = attributeCounts[attributeName] || {};
      
      return (
        <Filter
          key={attributeName}
          title={attributeName}
          options={values}
          counts={counts}
          initialValues={initialValues}
          filterType="attribute"
          onFilterChange={(filterData) => this.handleFilterChange({
            ...filterData,
            attribute: attributeName
          })}
        />
      );
    }).filter(Boolean); // Remove null entries
  };

  render() {
    const { manufacturers = [], manufacturerProductCount = {} } = this.props;
    const { availabilityValues } = this.state;
    
    // Generate dynamic attribute filters
    const attributeFilters = this.generateAttributeFilters();

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

        {/* Dynamic Attribute Filters */}
        {attributeFilters}

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