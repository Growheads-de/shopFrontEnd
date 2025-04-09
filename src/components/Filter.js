import React, { Component } from 'react';
import { 
  Box, 
  Typography, 
  Checkbox
} from '@mui/material';

class Filter extends Component {
  constructor(props) {
    super(props);
    const options = this.initializeOptions(props);
    const counts = this.initializeCounts(props,options);
    this.state = {
      options,
      counts
    };
  }

  initializeCounts = (props,options) => {
    const counts = {};

    if(props.filterType === 'availability'){
      const products = options[1] ? props.products : props.products;
      if(products) for(const product of products){
        if(product.available) counts[1] = (counts[1] || 0) + 1;
      }
    }
    if(props.filterType === 'manufacturer'){
      const uniqueManufacturers = [...new Set(props.products.filter(product => product.manufacturerId).map(product => product.manufacturerId))];
      const filteredManufacturers = uniqueManufacturers.filter(manufacturerId => options[manufacturerId] === true);
      const products = filteredManufacturers.length > 0 ? props.products : props.filteredProducts;
      for(const product of products){
        counts[product.manufacturerId] = (counts[product.manufacturerId] || 0) + 1;
      }
    }
    if(props.filterType === 'attribute'){
      console.log('countCaclulation for attribute filter',props.title,this.props.title);
      const optionIds = props.options.map(option => option.id);
      console.log('optionIds',optionIds);
      const attributeCount = {};
      for(const attribute of props.attributes){
        attributeCount[attribute.kMerkmalWert] = (attributeCount[attribute.kMerkmalWert] || 0) + 1;
      }
      const uniqueProductIds = props.filteredProducts.map(product => product.id);
      const attributesFilteredByUniqueAttributeProducts = props.attributes.filter(attribute => uniqueProductIds.includes(attribute.kArtikel));
      const attributeCountFiltered = {};
      for(const attribute of attributesFilteredByUniqueAttributeProducts){
        attributeCountFiltered[attribute.kMerkmalWert] = (attributeCountFiltered[attribute.kMerkmalWert] || 0) + 1;
      }
      let oneIsSelected = false;
      for(const option of optionIds) if(options[option]) oneIsSelected = true;
      for(const option of props.options){
        counts[option.id] = oneIsSelected?attributeCount[option.id]:attributeCountFiltered[option.id];
      }
    }
    return counts;
  }

  initializeOptions = (props) => {

    if(props.filterType === 'attribute'){
      const attributeCookies = document.cookie.split(';').filter(cookie => cookie.trim().startsWith('filter_attribute_'));;
      const attributeFilters = attributeCookies.map(cookie => cookie.split('=')[0].split('_')[2]);
      return attributeFilters.reduce((acc, filter) => {
        acc[filter] = true;
        return acc;
      }, {});
    }

    if(props.filterType === 'manufacturer'){
      const manufacturerCookies = document.cookie.split(';').filter(cookie => cookie.trim().startsWith('filter_manufacturer_'));
      const manufacturerFilters = manufacturerCookies.map(cookie => cookie.split('=')[0].split('_')[2]);
      return manufacturerFilters.reduce((acc, filter) => {
        acc[filter] = true;
        return acc;
      }, {});
    }

    if(props.filterType === 'availability'){
 
      const availabilityFilter = localStorage.getItem('filter_availability');
      const optionsState = {};
      if(availabilityFilter) optionsState[availabilityFilter] = true;

      const inStock = props.searchParams.get('inStock');
      if(inStock) optionsState[inStock] = true;
      return optionsState;
    }
 
  }

  componentDidUpdate(prevProps) {
    // make this more fine grained with dependencies on props

    if((prevProps.products !== this.props.products) || (prevProps.filteredProducts !== this.props.filteredProducts) || (prevProps.options !== this.props.options) || (prevProps.attributes !== this.props.attributes)){
      const options = this.initializeOptions(this.props);
      const counts = this.initializeCounts(this.props,options);
      this.setState({ 
        options,
        counts
      });
    }
  }

  handleOptionChange = (event) => {
    const { name, checked } = event.target;
    
    // Update local state first to ensure immediate UI feedback
    this.setState(prevState => ({
      options: {
        ...prevState.options,
        [name]: checked
      }
    }));
    
    // Then notify the parent component
    if (this.props.onFilterChange) {
      this.props.onFilterChange({ 
        type: this.props.filterType || 'default', 
        name: name, 
        value: checked 
      });
    }
  };

  resetFilters = () => {
    // Reset current filter's state
    const emptyOptions = {};
    Object.keys(this.state.options).forEach(option => {
      emptyOptions[option] = false;
    });
    
    this.setState({ options: emptyOptions });
    
    // Notify parent component to reset ALL filters (including other filter components)
    if (this.props.onFilterChange) {
      this.props.onFilterChange({ 
        type: 'RESET_ALL_FILTERS',
        resetAll: true
      });
    }
  };

  render() {
    const { options, counts } = this.state;
    const { title, options: optionsList = [] } = this.props;

    const tableStyle = { 
      width: '100%', 
      borderCollapse: 'collapse' 
    };
    
    const cellStyle = { 
      padding: '0px 0',
      fontSize: '0.85rem',
      lineHeight: '1'
    };
    
    const checkboxCellStyle = {
      ...cellStyle,
      width: '20px',
      verticalAlign: 'middle',
      paddingRight: '0'
    };
    
    const labelCellStyle = {
      ...cellStyle,
      cursor: 'pointer',
      verticalAlign: 'middle'
    };
    
    const countCellStyle = { 
      ...cellStyle, 
      textAlign: 'right', 
      color: 'rgba(0, 0, 0, 0.6)', 
      fontSize: '1rem',
      verticalAlign: 'middle'
    };

    const countBoxStyle = {
      display: 'inline-block',
      backgroundColor: '#f0f0f0',
      borderRadius: '4px',
      padding: '2px 6px',
      fontSize: '0.7rem',
      minWidth: '16px',
      textAlign: 'center',
      color: 'rgba(0, 0, 0, 0.7)'
    };

    const resetButtonStyle = {
      padding: '2px 8px',
      fontSize: '0.7rem',
      backgroundColor: '#f0f0f0',
      border: '1px solid #ddd',
      borderRadius: '4px',
      cursor: 'pointer',
      color: 'rgba(0, 0, 0, 0.7)',
      float: 'right'
    };
    return (  
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          {title}
          {/* Only show reset button on Availability filter */}
          {title === "Verfügbarkeit" && (
            <button 
              style={resetButtonStyle} 
              onClick={this.resetFilters}
            >
              Reset All
            </button>
          )}
        </Typography>
        <Box sx={{ width: '100%' }}>
          <table style={tableStyle}>
            <tbody>
              {optionsList.map((option) => (
                <tr key={option.id} style={{ height: '28px' }}>
                  <td style={checkboxCellStyle}>
                    <Checkbox 
                      checked={options[option.id] || false} 
                      onChange={this.handleOptionChange} 
                      name={option.id} 
                      color="primary"
                      size="small"
                      sx={{ 
                        padding: '0px',
                        '& .MuiSvgIcon-root': { fontSize: 18 } 
                      }}
                    />
                  </td>
                  <td style={labelCellStyle} onClick={() => {
                    const event = { target: { name: option.id, checked: !options[option.id] } };
                    this.handleOptionChange(event);
                  }}>
                    {option.name}
                  </td>
                  <td style={countCellStyle}>
                    {counts && counts[option.id] !== undefined && (
                      <span style={countBoxStyle}>
                        {counts[option.id]}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    );
  }
}

export default Filter; 