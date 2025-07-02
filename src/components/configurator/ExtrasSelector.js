import React, { Component } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

class ExtrasSelector extends Component {
  formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  renderExtraCard(extra) {
    const { selectedExtras, onExtraToggle, showImage = true } = this.props;
    const isSelected = selectedExtras.includes(extra.id);

    return (
      <Card 
        key={extra.id}
        sx={{ 
          height: '100%',
          border: '2px solid',
          borderColor: isSelected ? '#2e7d32' : '#e0e0e0',
          backgroundColor: isSelected ? '#f1f8e9' : '#ffffff',
          '&:hover': {
            boxShadow: 5,
            borderColor: isSelected ? '#2e7d32' : '#90caf9'
          },
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onClick={() => onExtraToggle(extra.id)}
      >
        {showImage && (
          <CardMedia
            component="img"
            height="160"
            image={extra.image}
            alt={extra.name}
            sx={{ objectFit: 'cover' }}
          />
        )}
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    onExtraToggle(extra.id);
                  }}
                  sx={{ 
                    color: '#2e7d32', 
                    '&.Mui-checked': { color: '#2e7d32' },
                    padding: 0
                  }}
                />
              }
              label=""
              sx={{ margin: 0 }}
              onClick={(e) => e.stopPropagation()}
            />
            <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
              {this.formatPrice(extra.price)}
            </Typography>
          </Box>
          
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            {extra.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {extra.description}
          </Typography>
          
          {isSelected && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                ✓ Hinzugefügt
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  render() {
    const { extras, title, subtitle, groupByCategory = true, gridSize = { xs: 12, sm: 6, md: 4 } } = this.props;

    if (groupByCategory) {
      // Group extras by category
      const groupedExtras = extras.reduce((acc, extra) => {
        if (!acc[extra.category]) {
          acc[extra.category] = [];
        }
        acc[extra.category].push(extra);
        return acc;
      }, {});

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
          
          {Object.entries(groupedExtras).map(([category, categoryExtras]) => (
            <Box key={category} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                {category}
              </Typography>
              <Grid container spacing={2}>
                {categoryExtras.map(extra => (
                  <Grid item {...gridSize} key={extra.id}>
                    {this.renderExtraCard(extra)}
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
      );
    }

    // Render without category grouping
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
          {extras.map(extra => (
            <Grid item {...gridSize} key={extra.id}>
              {this.renderExtraCard(extra)}
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }
}

export default ExtrasSelector; 