import React, { Component } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  FormGroup, 
  FormControlLabel, 
  Checkbox
} from '@mui/material';

class ProductFilters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      availability: {
        inStock: true
      }
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

  render() {
    const { availability } = this.state;

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
      </Paper>
    );
  }
}

export default ProductFilters; 