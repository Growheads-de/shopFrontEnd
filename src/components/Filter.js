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
    // Update state if initialValues change
    if (JSON.stringify(prevProps.initialValues) !== JSON.stringify(this.props.initialValues)) {
      this.setState({ 
        options: this.initializeOptions(this.props) 
      });
    }
  }

  handleOptionChange = (event) => {
    this.setState({
      options: {
        ...this.state.options,
        [event.target.name]: event.target.checked
      }
    });

    if (this.props.onFilterChange) {
      this.props.onFilterChange({ 
        type: this.props.filterType, 
        name: event.target.name, 
        value: event.target.checked 
      });
    }
  };

  render() {
    const { options } = this.state;
    const { title, options: optionsList = [], counts = {} } = this.props;

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