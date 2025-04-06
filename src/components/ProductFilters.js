import React, { Component } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Divider, 
  Slider, 
  FormControl, 
  FormGroup, 
  FormControlLabel, 
  Checkbox, 
  Radio, 
  RadioGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

class ProductFilters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      priceRange: [0, 300],
      availability: {
        inStock: true,
        outOfStock: false
      },
      sortBy: 'popularity',
      categories: {
        seeds: false,
        lighting: false,
        hydroponic: false,
        nutrients: false,
        filters: false,
        ventilation: false
      }
    };
  }

  handlePriceChange = (event, newValue) => {
    this.setState({ priceRange: newValue });
    
    if (this.props.onFilterChange) {
      this.props.onFilterChange({ 
        type: 'price', 
        value: newValue 
      });
    }
  };

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

  handleCategoryChange = (event) => {
    this.setState({
      categories: {
        ...this.state.categories,
        [event.target.name]: event.target.checked
      }
    });

    if (this.props.onFilterChange) {
      this.props.onFilterChange({ 
        type: 'category', 
        name: event.target.name, 
        value: event.target.checked 
      });
    }
  };

  handleReset = () => {
    this.setState({
      priceRange: [0, 300],
      availability: {
        inStock: true,
        outOfStock: false
      },
      sortBy: 'popularity',
      categories: {
        seeds: false,
        lighting: false,
        hydroponic: false,
        nutrients: false,
        filters: false,
        ventilation: false
      }
    });

    if (this.props.onFilterReset) {
      this.props.onFilterReset();
    }
  };

  render() {
    const { priceRange, availability, sortBy, categories } = this.state;

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterAltIcon sx={{ mr: 1 }} />
            Filters
          </Typography>
          <Button 
            size="small" 
            color="primary" 
            onClick={this.handleReset}
            sx={{ textTransform: 'none' }}
          >
            Reset
          </Button>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {/* Price Range Filter */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Price Range
          </Typography>
          <Slider
            value={priceRange}
            onChange={this.handlePriceChange}
            valueLabelDisplay="auto"
            min={0}
            max={300}
            step={10}
            marks={[
              { value: 0, label: '$0' },
              { value: 300, label: '$300' }
            ]}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              ${priceRange[0]}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ${priceRange[1]}
            </Typography>
          </Box>
        </Box>
        
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
            <FormControlLabel 
              control={
                <Checkbox 
                  checked={availability.outOfStock} 
                  onChange={this.handleAvailabilityChange} 
                  name="outOfStock"
                  color="primary"
                  size="small"
                />
              } 
              label="Out of Stock" 
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
                value="popularity" 
                control={<Radio size="small" color="primary" />} 
                label="Popularity" 
              />
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
                value="newest" 
                control={<Radio size="small" color="primary" />} 
                label="Newest" 
              />
            </RadioGroup>
          </FormControl>
        </Box>
        
        {/* Categories Accordion */}
        <Accordion 
          disableGutters 
          elevation={0} 
          sx={{ 
            mb: 1,
            '&:before': { display: 'none' },
            bgcolor: 'transparent'
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ px: 0, py: 0 }}
          >
            <Typography variant="subtitle1" fontWeight="medium">
              Categories
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, py: 1 }}>
            <FormGroup>
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={categories.seeds} 
                    onChange={this.handleCategoryChange} 
                    name="seeds"
                    color="primary"
                    size="small"
                  />
                } 
                label="Seeds" 
              />
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={categories.lighting} 
                    onChange={this.handleCategoryChange} 
                    name="lighting"
                    color="primary"
                    size="small"
                  />
                } 
                label="Lighting" 
              />
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={categories.hydroponic} 
                    onChange={this.handleCategoryChange} 
                    name="hydroponic"
                    color="primary"
                    size="small"
                  />
                } 
                label="Hydroponic Systems" 
              />
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={categories.nutrients} 
                    onChange={this.handleCategoryChange} 
                    name="nutrients"
                    color="primary"
                    size="small"
                  />
                } 
                label="Nutrients" 
              />
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={categories.filters} 
                    onChange={this.handleCategoryChange} 
                    name="filters"
                    color="primary"
                    size="small"
                  />
                } 
                label="Filters" 
              />
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={categories.ventilation} 
                    onChange={this.handleCategoryChange} 
                    name="ventilation"
                    color="primary"
                    size="small"
                  />
                } 
                label="Ventilation" 
              />
            </FormGroup>
          </AccordionDetails>
        </Accordion>
      </Paper>
    );
  }
}

export default ProductFilters; 