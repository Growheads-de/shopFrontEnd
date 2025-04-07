import React, { Component } from 'react';
import { 
  Paper
} from '@mui/material';
import Filter from './Filter.js';
import { withRouter } from './withRouter.js'; // Import withRouter HOC

class ProductFilters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      availabilityValues: this.getAvailabilityFromRouteOrStorage(),
      attributeFilters: {}
    };
  }

  getAvailabilityFromRouteOrStorage = () => {
    // First check URL query parameters
    const searchParams = new URLSearchParams(this.props.location?.search || '');
    const inStockParam = searchParams.get('inStock');
    
    if (inStockParam !== null) {
      // Convert string 'true'/'false' to boolean
      return { 'in Stock': inStockParam === 'true' };
    }
    
    // Next check props for initialFilters
    const { initialFilters } = this.props;
    if (initialFilters && initialFilters.availability && initialFilters.availability.inStock !== undefined) {
      return { 'in Stock': initialFilters.availability.inStock };
    }
    
    // Fall back to localStorage if not in URL or props
    try {
      const storedValue = localStorage.getItem('availabilityFilter');
      if (storedValue) {
        const parsed = JSON.parse(storedValue);
        // Convert old format if necessary
        if (parsed.inStock !== undefined) {
          return { 'in Stock': parsed.inStock };
        }
        return parsed;
      }
      // Default value if nothing in storage
      return { 'in Stock': true };
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return { 'in Stock': true };
    }
  };

  componentDidUpdate(prevProps) {
    // Update filters when URL changes
    if (prevProps.location?.search !== this.props.location?.search) {
      const newAvailability = this.getAvailabilityFromRouteOrStorage();
      
      // Only update if the value has actually changed
      if (this.state.availabilityValues['in Stock'] !== newAvailability['in Stock']) {
        this.setState({ 
          availabilityValues: newAvailability
        });
      }
    }
    
    // If initialFilters changed (from parent component)
    if (this.props.initialFilters !== prevProps.initialFilters) {
      const { initialFilters } = this.props;
      if (initialFilters?.availability?.inStock !== undefined) {
        const newAvailability = { 'in Stock': initialFilters.availability.inStock };
        
        // Only update if the value has actually changed
        if (this.state.availabilityValues['in Stock'] !== newAvailability['in Stock']) {
          this.setState({
            availabilityValues: newAvailability
          });
        }
      }
    }
    
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
        
        // Route update is now handled by the parent Content component
        
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

    // Debug log 
    console.log('ProductFilters render, availabilityValues:', availabilityValues);
    
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
          key={`avail-${availabilityValues['in Stock']}`} // Force re-render on value change
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

// Export with Router props
export default withRouter(ProductFilters); 