import React, { Component } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

class ProductSelector extends Component {
  formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  renderProductCard(product) {
    const { selectedValue, onSelect, showImage = true } = this.props;
    const isSelected = selectedValue === product.id;

    return (
      <Card 
        key={product.id}
        sx={{ 
          cursor: 'pointer',
          border: '2px solid',
          borderColor: isSelected ? '#2e7d32' : '#e0e0e0',
          backgroundColor: isSelected ? '#f1f8e9' : '#ffffff',
          '&:hover': {
            boxShadow: 6,
            borderColor: isSelected ? '#2e7d32' : '#90caf9'
          },
          transition: 'all 0.3s ease',
          height: '100%'
        }}
        onClick={() => onSelect(product.id)}
      >
        {showImage && (
          <CardMedia
            component="img"
            height="180"
            image={product.image}
            alt={product.name}
            sx={{ objectFit: 'cover' }}
          />
        )}
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {product.description}
          </Typography>
          
          {/* Product specific information */}
          {this.renderProductDetails(product)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
              {this.formatPrice(product.price)}
            </Typography>
            {isSelected && (
              <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                ✓ Ausgewählt
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }

  renderProductDetails(product) {
    const { productType } = this.props;

    switch (productType) {
      case 'tent':
        return (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Maße:</strong> {product.dimensions}
            </Typography>
            <Typography variant="body2">
              <strong>Für:</strong> {product.coverage}
            </Typography>
          </Box>
        );
      
      case 'light':
        return (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Chip 
              label={product.wattage} 
              size="small" 
              sx={{ mr: 1, mb: 1, pointerEvents: 'none' }}
            />
            <Chip 
              label={product.coverage} 
              size="small" 
              sx={{ mr: 1, mb: 1, pointerEvents: 'none' }}
            />
            <Chip 
              label={product.spectrum} 
              size="small" 
              sx={{ mr: 1, mb: 1, pointerEvents: 'none' }}
            />
            <Chip 
              label={`Effizienz: ${product.efficiency}`} 
              size="small" 
              sx={{ mb: 1, pointerEvents: 'none' }}
            />
          </Box>
        );
      
      case 'ventilation':
        return (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Luftdurchsatz:</strong> {product.airflow}
            </Typography>
            <Typography variant="body2">
              <strong>Lautstärke:</strong> {product.noiseLevel}
            </Typography>
            {product.includes && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Beinhaltet:</strong>
                </Typography>
                {product.includes.map((item, index) => (
                  <Typography key={index} variant="body2" sx={{ fontSize: '0.8rem' }}>
                    • {item}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        );
      
      default:
        return null;
    }
  }

  render() {
    const { products, title, subtitle, gridSize = { xs: 12, sm: 6, md: 4 } } = this.props;

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {subtitle}
          </Typography>
        )}
        <Grid container spacing={2}>
          {products.map(product => (
            <Grid item {...gridSize} key={product.id}>
              {this.renderProductCard(product)}
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }
}

export default ProductSelector; 