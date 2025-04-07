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
      attributeFilters: {},
      manufacturerFilters: {},
      attributeGroups: {},
      attributeCounts: {},
      filteredManufacturerCounts: {}
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

  componentDidMount() {
    this.processAttributes(this.props.attributes, this.props.products);
  }

  componentDidUpdate(prevProps, prevState) {
    // Update filters when URL changes
    if (prevProps.location?.search !== this.props.location?.search) {
      const newAvailability = this.getAvailabilityFromRouteOrStorage();
      
      // Only update if the value has actually changed
      if (this.state.availabilityValues['in Stock'] !== newAvailability['in Stock']) {
        this.setState({ 
          availabilityValues: newAvailability
        }, () => {
          // Reprocess attributes when "in Stock" filter changes
          this.processAttributes(this.props.attributes, this.props.products);
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
      
      // Reprocess attributes when initialFilters change
      if (prevState.availabilityValues['in Stock'] !== initialFilters?.availability?.inStock) {
        this.processAttributes(this.props.attributes, this.props.products);
      }
    }
    
    // If attributes or products changed, reprocess them
    if (this.props.attributes !== prevProps.attributes || 
        this.props.products !== prevProps.products) {
      this.processAttributes(this.props.attributes, this.props.products);
    }
    
    // If attribute filters changed, reprocess attributes to update counts
    if (JSON.stringify(prevState.attributeFilters) !== JSON.stringify(this.state.attributeFilters) ||
        JSON.stringify(prevState.manufacturerFilters) !== JSON.stringify(this.state.manufacturerFilters)) {
      this.processAttributes(this.props.attributes, this.props.products);
    }
    
    // Reset attribute filters when category changes
    if (prevProps.categoryId !== this.props.categoryId) {
      this.setState({ 
        attributeFilters: {},
        manufacturerFilters: {}
      });
    }
  }

  processAttributes = (attributes, products) => {
    if (!attributes || !attributes.length) {
      this.setState({ attributeGroups: {}, attributeCounts: {}, filteredManufacturerCounts: {} });
      return;
    }

    // Apply "in Stock" filter if enabled - this affects ALL counts
    let stockFilteredProducts = [...products];
    const applyInStockFilter = this.state.availabilityValues['in Stock'];
    
    if (applyInStockFilter) {
      stockFilteredProducts = stockFilteredProducts.filter(product => product.available);
    }

    // Check groups where at least one item is selected
    const { attributeFilters, manufacturerFilters } = this.state;
    const groupsWithSelection = new Set();
    
    // Find which attribute groups have at least one selection
    for (const attrName in attributeFilters) {
      const activeValues = Object.entries(attributeFilters[attrName] || {})
        .filter(([_, isActive]) => isActive)
        .map(([value]) => value);
      
      if (activeValues.length > 0) {
        groupsWithSelection.add(attrName);
      }
    }
    
    // Check if any manufacturer is selected
    const manufacturerHasSelection = Object.values(manufacturerFilters).some(v => v);

    console.log('Processing attributes, count:', attributes.length);
    console.log('Groups with selection:', Array.from(groupsWithSelection));
    console.log('Manufacturer has selection:', manufacturerHasSelection);
    console.log('In Stock filter active:', applyInStockFilter);
    
    const attributeGroups = {};
    const attributeCounts = {};
    
    // Initialize attribute groups and counts from all attributes
    attributes.forEach(attr => {
      if (!attributeGroups[attr.cName]) {
        attributeGroups[attr.cName] = new Set();
        attributeCounts[attr.cName] = {};
      }
      attributeGroups[attr.cName].add(attr.cWert);
    });
    
    // Create map of all attributes by product
    const productToAttributes = new Map();
    attributes.forEach(attr => {
      const productId = parseInt(attr.kArtikel, 10);
      if (!productToAttributes.has(productId)) {
        productToAttributes.set(productId, []);
      }
      productToAttributes.get(productId).push(attr);
    });
    
    // Calculate manufacturer counts with only stock filter applied
    const stockFilteredManufacturerCounts = {};
    stockFilteredProducts.forEach(product => {
      const manufacturer = product.manufacturer;
      if (manufacturer) {
        stockFilteredManufacturerCounts[manufacturer] = 
          (stockFilteredManufacturerCounts[manufacturer] || 0) + 1;
      }
    });
    
    // First, calculate stock-filtered counts, applying only the "in Stock" filter
    const stockFilteredCounts = {};
    
    // Count products that pass the stock filter for each attribute
    for (const product of stockFilteredProducts) {
      const productId = parseInt(product.id, 10);
      const productAttrs = productToAttributes.get(productId) || [];
      
      // Group attributes by name
      const attrByName = {};
      for (const attr of productAttrs) {
        if (!attrByName[attr.cName]) {
          attrByName[attr.cName] = new Set();
        }
        attrByName[attr.cName].add(attr.cWert);
      }
      
      // Count each attribute value in stock-filtered products
      for (const [attrName, values] of Object.entries(attrByName)) {
        if (!stockFilteredCounts[attrName]) {
          stockFilteredCounts[attrName] = {};
        }
        
        for (const value of values) {
          stockFilteredCounts[attrName][value] = (stockFilteredCounts[attrName][value] || 0) + 1;
        }
      }
    }
    
    // Now apply additional filtering for attribute and manufacturer filters
    const fullyFilteredProductIds = new Set();
    
    // Filter products based on selected attribute groups and manufacturers
    for (const product of stockFilteredProducts) {
      const productId = parseInt(product.id, 10);
      const productAttrs = productToAttributes.get(productId) || [];
      let includeProduct = true;
      
      // Check all attribute groups that have selection
      for (const attrName of groupsWithSelection) {
        const activeValues = Object.entries(attributeFilters[attrName] || {})
          .filter(([_, isActive]) => isActive)
          .map(([value]) => value);
        
        // Skip if no values selected
        if (activeValues.length === 0) continue;
        
        // Get all values of this attribute for this product
        const productValues = productAttrs
          .filter(attr => attr.cName === attrName)
          .map(attr => attr.cWert);
        
        // Check if product has any of the selected values
        if (!productValues.some(val => activeValues.includes(val))) {
          includeProduct = false;
          break;
        }
      }
      
      // Check manufacturer filter if any manufacturer is selected
      if (includeProduct && Object.keys(manufacturerFilters).length > 0) {
        const activeManufacturers = Object.entries(manufacturerFilters)
          .filter(([_, isActive]) => isActive)
          .map(([name]) => name);
        
        if (activeManufacturers.length > 0 && !activeManufacturers.includes(product.manufacturer)) {
          includeProduct = false;
        }
      }
      
      if (includeProduct) {
        fullyFilteredProductIds.add(productId);
      }
    }
    
    // Calculate fully filtered manufacturer counts
    const fullyFilteredManufacturerCounts = {};
    for (const product of stockFilteredProducts) {
      // Skip products that don't match attribute filters
      if (!fullyFilteredProductIds.has(parseInt(product.id, 10))) continue;
      
      const manufacturer = product.manufacturer;
      if (manufacturer) {
        fullyFilteredManufacturerCounts[manufacturer] = 
          (fullyFilteredManufacturerCounts[manufacturer] || 0) + 1;
      }
    }
    
    // Calculate final counts
    for (const [attrName] of Object.entries(attributeCounts)) {
      // For groups with selection, use stock-filtered counts
      if (groupsWithSelection.has(attrName)) {
        // Use stock-filtered counts for groups with selection
        Object.assign(attributeCounts[attrName], stockFilteredCounts[attrName] || {});
      } else {
        // For groups without selection, apply full filtering
        for (const product of stockFilteredProducts) {
          const productId = parseInt(product.id, 10);
          
          // Skip products that don't match attribute filters
          if (!fullyFilteredProductIds.has(productId)) continue;
          
          const productAttrs = productToAttributes.get(productId) || [];
          const attrValues = productAttrs
            .filter(attr => attr.cName === attrName)
            .map(attr => attr.cWert);
          
          for (const value of attrValues) {
            attributeCounts[attrName][value] = (attributeCounts[attrName][value] || 0) + 1;
          }
        }
      }
    }
    
    // Choose which manufacturer counts to use based on selection
    const filteredManufacturerCounts = manufacturerHasSelection 
      ? stockFilteredManufacturerCounts 
      : fullyFilteredManufacturerCounts;
    
    this.setState({ 
      attributeGroups, 
      attributeCounts,
      filteredManufacturerCounts
    });
  };

  handleFilterChange = (filterData) => {
    // Handle reset all filters action
    if (filterData.type === 'RESET_ALL_FILTERS') {
      // Reset all filter states
      this.setState({
        availabilityValues: { 'in Stock': false },
        attributeFilters: {},
        manufacturerFilters: {}
      }, () => {
        // Reprocess attributes after resetting filters
        this.processAttributes(this.props.attributes, this.props.products);
        
        // Notify parent component about complete reset
        if (this.props.onFilterChange) {
          this.props.onFilterChange({
            type: 'RESET_ALL_FILTERS',
            resetAll: true
          });
        }
        
        // Clear localStorage
        try {
          localStorage.removeItem('availabilityFilter');
        } catch (error) {
          console.error('Error clearing localStorage:', error);
        }
      });
      return;
    }
    
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
      }, () => {
        // Reprocess attributes when "in Stock" filter changes
        this.processAttributes(this.props.attributes, this.props.products);
        
        // Then notify parent
        if (this.props.onFilterChange) {
          this.props.onFilterChange(filterData);
        }
      });
    } else if (filterData.type === 'attribute') {
      // Track attribute filter selections in component state
      this.setState(prevState => {
        const newAttributeFilters = {...prevState.attributeFilters};
        
        if (!newAttributeFilters[filterData.attribute]) {
          newAttributeFilters[filterData.attribute] = {};
        }
        
        newAttributeFilters[filterData.attribute][filterData.name] = filterData.value;
        
        return { attributeFilters: newAttributeFilters };
      }, () => {
        // Reprocess attributes when attribute filters change to update counts
        this.processAttributes(this.props.attributes, this.props.products);
        
        // Notify parent component
        if (this.props.onFilterChange) {
          this.props.onFilterChange(filterData);
        }
      });
    } else if (filterData.type === 'manufacturer') {
      // Track manufacturer filter selections in component state
      this.setState(prevState => {
        const newManufacturerFilters = {...prevState.manufacturerFilters};
        newManufacturerFilters[filterData.name] = filterData.value;
        
        return { manufacturerFilters: newManufacturerFilters };
      }, () => {
        // Reprocess attributes when manufacturer filters change
        this.processAttributes(this.props.attributes, this.props.products);
        
        // Notify parent component
        if (this.props.onFilterChange) {
          this.props.onFilterChange(filterData);
        }
      });
    } else {
      // For other filter types
      if (this.props.onFilterChange) {
        this.props.onFilterChange(filterData);
      }
    }
  };

  generateAttributeFilters = () => {
    const { attributeGroups = {}, attributeCounts = {} } = this.state;
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
    const { manufacturers = [] } = this.props;
    const { availabilityValues, filteredManufacturerCounts, manufacturerFilters } = this.state;
    
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
          counts={filteredManufacturerCounts}
          initialValues={manufacturerFilters}
          filterType="manufacturer"
          onFilterChange={this.handleFilterChange}
        />
      </Paper>
    );
  }
}

// Export with Router props
export default withRouter(ProductFilters); 