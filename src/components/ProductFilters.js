import React, { Component } from 'react';
import { 
  Paper
} from '@mui/material';
import Filter from './Filter.js';

class ProductFilters extends Component {
  constructor(props) {
    super(props);

    const uniqueManufacturerArray = this._getUniqueManufacturers(this.props.products);
    const attributeGroups = this._getAttributeGroups(this.props.attributes);

    this.state = {
      availabilityValues: [{id:1,name:'in Stock'}],
      uniqueManufacturerArray,
      attributeGroups
    };
  }

  componentDidMount() {
    // Measure the available space dynamically
    this.adjustPaperHeight();
    // Add event listener for window resize
    window.addEventListener('resize', this.adjustPaperHeight);
  }

  componentWillUnmount() {
    // Remove event listener when component unmounts
    window.removeEventListener('resize', this.adjustPaperHeight);
  }

  adjustPaperHeight = () => {
    // Get reference to our paper element
    const paperEl = document.getElementById('filters-paper');
    if (!paperEl) return;

    // Get viewport height
    const viewportHeight = window.innerHeight;
    
    // Get the offset top position of our paper element
    const paperTop = paperEl.getBoundingClientRect().top;
    
    // Estimate footer height (adjust as needed)
    const footerHeight = 80; // Reduce from 150px
    
    // Calculate available space and set height
    const availableHeight = viewportHeight - paperTop - footerHeight;
    // Add a smaller buffer margin to prevent scrolling but get closer to footer
    const heightWithBuffer = availableHeight - 20; // Reduce buffer from 50px to 20px
    paperEl.style.minHeight = `${heightWithBuffer}px`;
  }

  _getUniqueManufacturers = (products) => {
    const manufacturers = {};

    for (const product of products)
      if (!manufacturers[product.manufacturerId])
        manufacturers[product.manufacturerId] = product.manufacturer;

    const uniqueManufacturerArray = Object.entries(manufacturers)
      .filter(([_id, name]) => name !== null) // Filter out null names
      .map(([id, name]) => ({
        id: parseInt(id),
        name: name
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    console.log('WSXuniqueManufacturerArray', uniqueManufacturerArray, manufacturers);
    return uniqueManufacturerArray;
  }

  _getAttributeGroups = (attributes) => {
    const attributeGroups = {};
    for(const attribute of attributes) {
      if(!attributeGroups[attribute.cName]) attributeGroups[attribute.cName] = {name:attribute.cName, values:{}};
      attributeGroups[attribute.cName].values[attribute.kMerkmalWert] = {id:attribute.kMerkmalWert, name:attribute.cWert};
    }
    console.log('WSXattributeGroups', attributeGroups);
    return attributeGroups;
  }

  shouldComponentUpdate(nextProps) {
    console.log('WSXcomponentShouldUpdate',nextProps);
    if(nextProps.products !== this.props.products) {
      const uniqueManufacturerArray = this._getUniqueManufacturers(nextProps.products);
      this.setState({uniqueManufacturerArray});
    }
    if(nextProps.attributes !== this.props.attributes) {
      const attributeGroups = this._getAttributeGroups(nextProps.attributes);
      this.setState({attributeGroups});
    }
    return true;
  }

  generateAttributeFilters = () => {
    const filters = [];
    const sortedAttributeGroups = Object.values(this.state.attributeGroups)
      .sort((a, b) => a.name.localeCompare(b.name));

    for(const attributeGroup of sortedAttributeGroups) {
      const filter = (
        <Filter
          title={attributeGroup.name}
          options={Object.values(attributeGroup.values)}
          initialValues={[]}
          filterType="attribute"
          onFilterChange={(msg)=>{
            if(msg.value) {
              document.cookie = "filter_"+msg.type+"_"+msg.name+"=true";
            } else {
              document.cookie = "filter_"+msg.type+"_"+msg.name+"=false; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            }
            this.props.onFilterChange();
          }}
        />
      )
      filters.push(filter);
    }
    return filters;
  }

  render() {
    return (
      <Paper 
        id="filters-paper"
        elevation={1} 
        sx={{ 
          p: 2, 
          borderRadius: 2, 
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Filter 
          title="Availability"
          options={this.state.availabilityValues}
          initialValues={[]}
          filterType="availability"
          onFilterChange={(msg)=>{console.log('WSXonFilterChangeAV', msg)}}
        />

        {this.generateAttributeFilters()}

        <Filter 
          title="Manufacturer"
          options={this.state.uniqueManufacturerArray}
          counts={this.state.filteredManufacturerCounts}
          initialValues={[]}
          filterType="manufacturer"
          onFilterChange={(msg)=>{ 
            if(msg.value) {
              document.cookie = "filter_"+msg.type+"_"+msg.name+"=true";
            } else {
              document.cookie = "filter_"+msg.type+"_"+msg.name+"=false; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            }
            this.props.onFilterChange();
          }}
        />
      </Paper>
    );
  }
}

export default ProductFilters; 