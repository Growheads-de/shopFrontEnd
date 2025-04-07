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
  }

  initializeOptions = (props) => {
    const { options = [], initialValues = {} } = props;
    const optionsState = {};
    
    options.forEach(option => {
      // If there's an initial value provided, use it, otherwise default to false
      optionsState[option] = initialValues[option] !== undefined ? initialValues[option] : false;
    });
    
    return optionsState;
  }

  componentDidMount() {
    // Nothing needed here anymore as initialization happens in constructor
  }

  componentDidUpdate(prevProps) {
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

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ width: '100%' }}>
          <table style={tableStyle}>
            <tbody>
              {optionsList.map((option) => (
                <tr key={option} style={{ height: '24px' }}>
                  <td style={checkboxCellStyle}>
                    <Checkbox 
                      checked={options[option] || false} 
                      onChange={this.handleOptionChange} 
                      name={option} 
                      color="primary"
                      size="small"
                      sx={{ 
                        padding: '0px',
                        '& .MuiSvgIcon-root': { fontSize: 18 } 
                      }}
                    />
                  </td>
                  <td style={labelCellStyle} onClick={() => {
                    const event = { target: { name: option, checked: !options[option] } };
                    this.handleOptionChange(event);
                  }}>
                    {option}
                  </td>
                  <td style={countCellStyle}>
                    {counts[option] !== undefined && `(${counts[option]})`}
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