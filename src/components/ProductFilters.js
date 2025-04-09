import React, { Component } from 'react';
import { Paper } from '@mui/material';
import Filter from './Filter.js';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';

// HOC to provide router props to class components
const withRouter = (ClassComponent) => {
  return (props) => {
    const params = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    return <ClassComponent 
      {...props} 
      params={params} 
      searchParams={searchParams}
      navigate={navigate}
      location={location} 
    />;
  };
};

class ProductFilters extends Component {
  constructor(props) {
    super(props);

    const uniqueManufacturerArray = this._getUniqueManufacturers(this.props.products);
    const attributeGroups = this._getAttributeGroups(this.props.attributes);

    this.state = {
      availabilityValues: [{id:1,name:'auf Lager'}],
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
    return uniqueManufacturerArray;
  }

  _getAttributeGroups = (attributes) => {
    const attributeGroups = {};
    for(const attribute of attributes) {
      if(!attributeGroups[attribute.cName]) attributeGroups[attribute.cName] = {name:attribute.cName, values:{}};
      attributeGroups[attribute.cName].values[attribute.kMerkmalWert] = {id:attribute.kMerkmalWert, name:attribute.cWert};
    }
    return attributeGroups;
  }

  shouldComponentUpdate(nextProps) {
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
          key={`attr-filter-${attributeGroup.name}`}
          title={attributeGroup.name}
          options={Object.values(attributeGroup.values)}
          filterType="attribute"
          products={this.props.products}
          filteredProducts={this.props.filteredProducts}
          attributes={this.props.attributes}
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
          title="Verfügbarkeit"
          options={this.state.availabilityValues}
          searchParams={this.props.searchParams}
          products={this.props.products}
          filteredProducts={this.props.filteredProducts}
          attributes={this.props.attributes}
          filterType="availability"
          onFilterChange={(msg)=>{
            
            if(msg.resetAll) {
              localStorage.removeItem('filter_availability');
              const cookies = document.cookie.split(';');
              for(const cookie of cookies) {
                const [name, ] = cookie.split('=');
                if(name.startsWith('filter_')) document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
              }
              this.props.onFilterChange();
              return;
            }

            if(msg.value) {
              localStorage.setItem('filter_availability', msg.name);
              //this.props.navigate({
              //  pathname: this.props.location.pathname,
              //  search: `?inStock=${msg.name}`
              //}); 
            } else {
              localStorage.removeItem('filter_availability');
              //this.props.navigate({
              //  pathname: this.props.location.pathname,
              //  search: this.props.location.search.replace(/inStock=[^&]*/, '')
              //});
            }
            
            this.props.onFilterChange();
          
          
          }}
        />

        {this.generateAttributeFilters()}

        <Filter 
          title="Manufacturer"
          options={this.state.uniqueManufacturerArray}
          filterType="manufacturer"
          products={this.props.products}
          filteredProducts={this.props.filteredProducts}
          attributes={this.props.attributes}
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

export default withRouter(ProductFilters); 