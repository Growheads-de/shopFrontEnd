import React, { Component } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

class TentShapeSelector extends Component {
  // Generate plant layout based on tent shape
  generatePlantLayout(shapeId) {
    const layouts = {
      '60x60': [
        { x: 50, y: 50, size: 18 } // 1 large plant centered
      ],
      '80x80': [
        { x: 35, y: 35, size: 12 }, // 2x2 = 4 plants
        { x: 65, y: 35, size: 12 },
        { x: 35, y: 65, size: 12 },
        { x: 65, y: 65, size: 12 }
      ],
      '100x100': [
        { x: 22, y: 22, size: 10 }, // 3x3 = 9 plants
        { x: 50, y: 22, size: 10 },
        { x: 78, y: 22, size: 10 },
        { x: 22, y: 50, size: 10 },
        { x: 50, y: 50, size: 10 },
        { x: 78, y: 50, size: 10 },
        { x: 22, y: 78, size: 10 },
        { x: 50, y: 78, size: 10 },
        { x: 78, y: 78, size: 10 }
      ],
      '120x60': [
        { x: 30, y: 50, size: 14 }, // 1x3 = 3 larger plants
        { x: 50, y: 50, size: 14 },
        { x: 70, y: 50, size: 14 }
      ]
    };

    return layouts[shapeId] || [];
  }

  renderShapeCard(shape) {
    const { selectedShape, onShapeSelect } = this.props;
    const isSelected = selectedShape === shape.id;

    const plants = this.generatePlantLayout(shape.id);
    
    // Make visual sizes proportional to actual dimensions
    let visualWidth, visualHeight;
    switch(shape.id) {
      case '60x60':
        visualWidth = 90;
        visualHeight = 90;
        break;
      case '80x80':
        visualWidth = 110;
        visualHeight = 110;
        break;
      case '100x100':
        visualWidth = 130;
        visualHeight = 130;
        break;
      case '120x60':
        visualWidth = 140;
        visualHeight = 80;
        break;
      default:
        visualWidth = 120;
        visualHeight = 120;
    }

    return (
      <Card 
        key={shape.id}
        sx={{ 
          cursor: 'pointer',
          border: '3px solid',
          borderColor: isSelected ? '#2e7d32' : '#e0e0e0',
          backgroundColor: isSelected ? '#f1f8e9' : '#ffffff',
          '&:hover': {
            boxShadow: 8,
            borderColor: isSelected ? '#2e7d32' : '#90caf9',
            transform: 'translateY(-2px)'
          },
          transition: 'all 0.3s ease',
          height: '100%',
          minHeight: 300
        }}
        onClick={() => onShapeSelect(shape.id)}
      >
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            {shape.name}
          </Typography>
          
          {/* Enhanced visual representation with plant layout */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: visualHeight,
            mb: 2,
            position: 'relative'
          }}>
            <Box
              sx={{
                width: `${visualWidth}px`,
                height: `${visualHeight}px`,
                border: '3px solid #2e7d32',
                borderRadius: 2,
                backgroundColor: isSelected ? '#e8f5e8' : '#f5f5f5',
                position: 'relative',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                overflow: 'hidden'
              }}
            >
              {/* Grid pattern */}
              <svg
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0 }}
              >
                <defs>
                  <pattern id={`grid-${shape.id}`} width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e0e0e0" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#grid-${shape.id})`} />
                
                {/* Plants */}
                {plants.map((plant, index) => (
                  <circle
                    key={index}
                    cx={`${plant.x}%`}
                    cy={`${plant.y}%`}
                    r={plant.size}
                    fill="#4caf50"
                    fillOpacity="0.8"
                    stroke="#2e7d32"
                    strokeWidth="2"
                  />
                ))}
              </svg>
              
              {/* Dimensions label */}
              <Typography variant="caption" sx={{ 
                position: 'absolute',
                bottom: 4,
                left: '50%',
                transform: 'translateX(-50%)',
                fontWeight: 'bold',
                color: '#2e7d32',
                backgroundColor: 'rgba(255,255,255,0.8)',
                px: 1,
                borderRadius: 1,
                fontSize: '11px'
              }}>
                {shape.footprint}
              </Typography>

              {/* Plant count label */}
              <Typography 
                variant="caption" 
                sx={{ 
                  position: 'absolute', 
                  top: 4, 
                  right: 4, 
                  backgroundColor: 'rgba(46, 125, 50, 0.9)',
                  color: 'white',
                  px: 1,
                  borderRadius: 1,
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}
              >
                {plants.length} 🌱
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {shape.description}
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Chip 
              label={`${shape.minPlants}-${shape.maxPlants} Pflanzen`} 
              size="small" 
              sx={{ 
                bgcolor: isSelected ? '#2e7d32' : '#f0f0f0',
                color: isSelected ? 'white' : 'inherit',
                pointerEvents: 'none'
              }}
            />
          </Box>
          
          <Box sx={{ mt: 2, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#2e7d32', 
                fontWeight: 'bold',
                opacity: isSelected ? 1 : 0,
                transition: 'opacity 0.3s ease'
              }}
            >
              ✓ Ausgewählt
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  render() {
    const { tentShapes, title, subtitle } = this.props;

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
        <Grid container spacing={3}>
          {tentShapes.map(shape => (
            <Grid item xs={12} sm={6} md={3} key={shape.id}>
              {this.renderShapeCard(shape)}
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }
}

export default TentShapeSelector; 