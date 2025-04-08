import React, { Component } from 'react';
import { 
  Box, 
  Typography, 
  Checkbox
} from '@mui/material';

class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: this.initializeOptions(props)
    };
    console.log('WSXFilter',props);
  }

  initializeOptions = (props) => {
    console.log('initializeOptions',props);
    const { options = [], initialValues = {} } = props;
    let optionsState = {};
    
    options.forEach(option => {
      // If there's an initial value provided, use it, otherwise default to false
      optionsState[option.id] = initialValues[option.id] !== undefined ? initialValues[option.id] : false;
    });

    if(props.filterType === 'attribute'){
      const attributeCookies = document.cookie.split(';').filter(cookie => cookie.trim().startsWith('filter_attribute_'));;
      const attributeFilters = attributeCookies.map(cookie => cookie.split('=')[0].split('_')[2]);
      optionsState = attributeFilters.reduce((acc, filter) => {
        acc[filter] = true;
        return acc;
      }, {});
    }
    if(props.filterType === 'manufacturer'){
      const manufacturerCookies = document.cookie.split(';').filter(cookie => cookie.trim().startsWith('filter_manufacturer_'));
      const manufacturerFilters = manufacturerCookies.map(cookie => cookie.split('=')[0].split('_')[2]);
      optionsState = manufacturerFilters.reduce((acc, filter) => {
        acc[filter] = true;
        return acc;
      }, {});
    }
    return optionsState;
  }

  componentDidMount() {
    // Nothing needed here anymore as initialization happens in constructor
  }

  componentDidUpdate(prevProps) {
    console.log('WSXFilter componentDidUpdate',prevProps,this.props);
    // Check if initialValues actually changed (deep comparison)
    const prevInitialValues = JSON.stringify(prevProps.initialValues || {});
    const currentInitialValues = JSON.stringify(this.props.initialValues || {});
    
    // Check if options list changed
    const prevOptions = JSON.stringify(prevProps.options || []);
    const currentOptions = JSON.stringify(this.props.options || []);
    
    if (prevInitialValues !== currentInitialValues || prevOptions !== currentOptions) {
      // Debug what's happening
      console.log('Filter updating state from props:', 
                 { 
                   title: this.props.title,
                   prevValues: prevProps.initialValues, 
                   newValues: this.props.initialValues 
                 });
      
      this.setState({ 
        options: this.initializeOptions(this.props) 
      });
    }
  }

  handleOptionChange = (event) => {
    const { name, checked } = event.target;
    
    console.log(`Checkbox change: ${name} = ${checked}`);
    
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
    const { options } = this.state;
    const { title, options: optionsList = [], counts = {} } = this.props;

    // Debug render
    console.log(`Filter render: ${title}`, options);

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
      fontSize: '0.8rem',
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
          {title === "Availability" && (
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
                <tr key={option.id} style={{ height: '24px' }}>
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
                    {counts[option.id] !== undefined && (
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