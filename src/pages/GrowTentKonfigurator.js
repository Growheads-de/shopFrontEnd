import React, { Component } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { TentShapeSelector, ProductSelector, ExtrasSelector } from '../components/configurator/index.js';
import { tentShapes, tentSizes, lightTypes, ventilationTypes, extras } from '../data/configuratorData.js';

class GrowTentKonfigurator extends Component {
  constructor(props) {
    super(props);
    
    // Try to restore state from window object
    const savedState = window.growTentKonfiguratorState;
    
    this.state = {
      selectedTentShape: savedState?.selectedTentShape || '80x80',
      selectedTentSize: savedState?.selectedTentSize || 'tent_80x80x160',
      selectedLightType: savedState?.selectedLightType || 'led_quantum_board',
      selectedVentilationType: savedState?.selectedVentilationType || 'premium_ventilation',
      selectedExtras: savedState?.selectedExtras || [],
      totalPrice: savedState?.totalPrice || 0
    };
    
    this.handleTentShapeSelect = this.handleTentShapeSelect.bind(this);
    this.handleTentSizeSelect = this.handleTentSizeSelect.bind(this);
    this.handleLightTypeSelect = this.handleLightTypeSelect.bind(this);
    this.handleVentilationSelect = this.handleVentilationSelect.bind(this);
    this.handleExtraToggle = this.handleExtraToggle.bind(this);
    this.calculateTotalPrice = this.calculateTotalPrice.bind(this);
    this.saveStateToWindow = this.saveStateToWindow.bind(this);
  }

  saveStateToWindow() {
    // Save current state to window object for backup
    window.growTentKonfiguratorState = {
      selectedTentShape: this.state.selectedTentShape,
      selectedTentSize: this.state.selectedTentSize,
      selectedLightType: this.state.selectedLightType,
      selectedVentilationType: this.state.selectedVentilationType,
      selectedExtras: this.state.selectedExtras,
      totalPrice: this.state.totalPrice,
      timestamp: Date.now() // Add timestamp for debugging
    };
    }

  componentDidMount() {
    // @note Calculate initial total price with preselected products
    this.calculateTotalPrice();
  }

  componentDidUpdate(prevProps, prevState) {
    // Reset tent size selection if shape changes
    if (prevState.selectedTentShape !== this.state.selectedTentShape && this.state.selectedTentShape !== prevState.selectedTentShape) {
      this.setState({ selectedTentSize: '' });
    }
    
    // Recalculate total price when selections change
    if (
      prevState.selectedTentSize !== this.state.selectedTentSize ||
      prevState.selectedLightType !== this.state.selectedLightType ||
      prevState.selectedVentilationType !== this.state.selectedVentilationType ||
      prevState.selectedExtras !== this.state.selectedExtras
    ) {
      this.calculateTotalPrice();
    }

    // Save state to window object whenever selections change
    if (
      prevState.selectedTentShape !== this.state.selectedTentShape ||
      prevState.selectedTentSize !== this.state.selectedTentSize ||
      prevState.selectedLightType !== this.state.selectedLightType ||
      prevState.selectedVentilationType !== this.state.selectedVentilationType ||
      prevState.selectedExtras !== this.state.selectedExtras ||
      prevState.totalPrice !== this.state.totalPrice
    ) {
      this.saveStateToWindow();
    }
  }

  handleTentShapeSelect(shapeId) {
    this.setState({ selectedTentShape: shapeId });
  }

  handleTentSizeSelect(tentId) {
    this.setState({ selectedTentSize: tentId });
  }

  handleLightTypeSelect(lightId) {
    this.setState({ selectedLightType: lightId });
  }

  handleVentilationSelect(ventilationId) {
    this.setState({ selectedVentilationType: ventilationId });
  }

  handleExtraToggle(extraId) {
    const { selectedExtras } = this.state;
    const newSelectedExtras = selectedExtras.includes(extraId)
      ? selectedExtras.filter(id => id !== extraId)
      : [...selectedExtras, extraId];
    
    this.setState({ selectedExtras: newSelectedExtras });
  }



  calculateTotalPrice() {
    let total = 0;
    const { selectedTentSize, selectedLightType, selectedVentilationType, selectedExtras } = this.state;
    let itemCount = 0;
    
    // Add tent price
    if (selectedTentSize) {
      const tent = tentSizes.find(t => t.id === selectedTentSize);
      if (tent) {
        total += tent.price;
        itemCount++;
      }
    }
    
    // Add light price
    if (selectedLightType) {
      const light = lightTypes.find(l => l.id === selectedLightType);
      if (light) {
        total += light.price;
        itemCount++;
      }
    }
    
    // Add ventilation price
    if (selectedVentilationType) {
      const ventilation = ventilationTypes.find(v => v.id === selectedVentilationType);
      if (ventilation) {
        total += ventilation.price;
        itemCount++;
      }
    }
    
    // Add extras prices
    selectedExtras.forEach(extraId => {
      const extra = extras.find(e => e.id === extraId);
      if (extra) {
        total += extra.price;
        itemCount++;
      }
    });
    
    // Apply bundle discount
    let discountPercentage = 0;
    if (itemCount >= 3) discountPercentage = 15; // 15% for 3+ items
    if (itemCount >= 5) discountPercentage = 24; // 24% for 5+ items
    if (itemCount >= 7) discountPercentage = 36; // 36% for 7+ items
    
    const discountedTotal = total * (1 - discountPercentage / 100);
    this.setState({ totalPrice: discountedTotal });
  }







  formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  calculateSavings() {
    // Bundle discount calculation
    const { selectedTentSize, selectedLightType, selectedVentilationType, selectedExtras } = this.state;
    let itemCount = 0;
    let originalTotal = 0;
    
    // Calculate original total without discount
    if (selectedTentSize) {
      const tent = tentSizes.find(t => t.id === selectedTentSize);
      if (tent) {
        originalTotal += tent.price;
        itemCount++;
      }
    }
    
    if (selectedLightType) {
      const light = lightTypes.find(l => l.id === selectedLightType);
      if (light) {
        originalTotal += light.price;
        itemCount++;
      }
    }
    
    if (selectedVentilationType) {
      const ventilation = ventilationTypes.find(v => v.id === selectedVentilationType);
      if (ventilation) {
        originalTotal += ventilation.price;
        itemCount++;
      }
    }
    
    selectedExtras.forEach(extraId => {
      const extra = extras.find(e => e.id === extraId);
      if (extra) {
        originalTotal += extra.price;
        itemCount++;
      }
    });
    
    // Progressive discount based on number of selected items
    let discountPercentage = 0;
    if (itemCount >= 3) discountPercentage = 15; // 15% for 3+ items
    if (itemCount >= 5) discountPercentage = 24; // 24% for 5+ items
    if (itemCount >= 7) discountPercentage = 36; // 36% for 7+ items
    
    const savings = originalTotal * (discountPercentage / 100);
    
    return {
      savings: savings,
      discountPercentage: discountPercentage,
      hasDiscount: discountPercentage > 0
    };
  }

  renderTentShapeSection() {
    const { selectedTentShape } = this.state;
    
    return (
      <TentShapeSelector
        tentShapes={tentShapes}
        selectedShape={selectedTentShape}
        onShapeSelect={this.handleTentShapeSelect}
        title="1. Growbox-Form auswählen"
        subtitle="Wähle zuerst die Grundfläche deiner Growbox aus"
      />
    );
  }

  renderTentSizeSection() {
    const { selectedTentSize, selectedTentShape } = this.state;
    
    // Filter tents by selected shape
    const filteredTents = tentSizes.filter(tent => tent.shapeId === selectedTentShape);
    
    if (!selectedTentShape) {
      return null; // Don't show tent sizes until shape is selected
    }
    
    return (
      <ProductSelector
        products={filteredTents}
        selectedValue={selectedTentSize}
        onSelect={this.handleTentSizeSelect}
        productType="tent"
        title="2. Growbox Produkt auswählen"
        subtitle={`Wähle das passende Produkt für deine ${selectedTentShape} Growbox`}
        gridSize={{ xs: 12, sm: 6, md: 3 }}
      />
    );
  }

  renderLightSection() {
    const { selectedLightType } = this.state;
    
    return (
      <ProductSelector
        products={lightTypes}
        selectedValue={selectedLightType}
        onSelect={this.handleLightTypeSelect}
        productType="light"
        title="3. Beleuchtung wählen"
        gridSize={{ xs: 12, sm: 6 }}
      />
    );
  }

  renderVentilationSection() {
    const { selectedVentilationType } = this.state;
    
    return (
      <ProductSelector
        products={ventilationTypes}
        selectedValue={selectedVentilationType}
        onSelect={this.handleVentilationSelect}
        productType="ventilation"
        title="4. Belüftung auswählen"
        gridSize={{ xs: 12, md: 4 }}
      />
    );
  }

  renderExtrasSection() {
    const { selectedExtras } = this.state;
    
    return (
      <ExtrasSelector
        extras={extras}
        selectedExtras={selectedExtras}
        onExtraToggle={this.handleExtraToggle}
        title="5. Extras hinzufügen (optional)"
        groupByCategory={true}
        gridSize={{ xs: 12, sm: 6, md: 4 }}
      />
    );
  }

  renderInlineSummary() {
    const { selectedTentSize, selectedLightType, selectedVentilationType, selectedExtras, totalPrice } = this.state;
    
    const selectedTent = tentSizes.find(t => t.id === selectedTentSize);
    const selectedLight = lightTypes.find(l => l.id === selectedLightType);
    const selectedVentilation = ventilationTypes.find(v => v.id === selectedVentilationType);
    const selectedExtrasItems = extras.filter(e => selectedExtras.includes(e.id));
    const savingsInfo = this.calculateSavings();
    
    return (
      <Paper
        id="inline-summary" // @note Add ID for scroll targeting
        elevation={2}
        sx={{
          mt: 4,
          p: 3,
          bgcolor: '#f8f9fa',
          border: '2px solid #2e7d32',
          borderRadius: 2
        }}
      >
          <Typography variant="h5" sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
            🎯 Ihre Konfiguration
          </Typography>
          
          <List sx={{ '& .MuiListItem-root': { py: 1 } }}>
            {selectedTent && (
              <ListItem>
                <ListItemText
                  primary={`Growbox: ${selectedTent.name}`}
                  secondary={selectedTent.description}
                />
                <ListItemSecondaryAction>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {this.formatPrice(selectedTent.price)}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
            )}
            
            {selectedLight && (
              <ListItem>
                <ListItemText
                  primary={`Beleuchtung: ${selectedLight.name}`}
                  secondary={selectedLight.description}
                />
                <ListItemSecondaryAction>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {this.formatPrice(selectedLight.price)}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
            )}
            
            {selectedVentilation && (
              <ListItem>
                <ListItemText
                  primary={`Belüftung: ${selectedVentilation.name}`}
                  secondary={selectedVentilation.description}
                />
                <ListItemSecondaryAction>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {this.formatPrice(selectedVentilation.price)}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
            )}
            
            {selectedExtrasItems.map(extra => (
              <ListItem key={extra.id}>
                <ListItemText
                  primary={`Extra: ${extra.name}`}
                  secondary={extra.description}
                />
                <ListItemSecondaryAction>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {this.formatPrice(extra.price)}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          
          <Divider sx={{ my: 3 }} />
          
          {savingsInfo.hasDiscount && (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                Sie sparen: {this.formatPrice(savingsInfo.savings)} ({savingsInfo.discountPercentage}% Bundle-Rabatt)
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Gesamtpreis:
            </Typography>
            <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
              {this.formatPrice(totalPrice)}
            </Typography>
          </Box>
          
                     <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
             <Button
               variant="contained"
               size="large"
               startIcon={<ShoppingCartIcon />}
               sx={{
                 bgcolor: '#2e7d32',
                 '&:hover': { bgcolor: '#1b5e20' },
                 minWidth: 250
               }}
             >
               In den Warenkorb
             </Button>
           </Box>
        </Paper>
    );
  }



  render() {
    
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
              🌱 Growbox Konfigurator
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Stelle dein perfektes Indoor Grow Setup zusammen
            </Typography>
            
            {/* Bundle Discount Information */}
            <Paper 
              elevation={1} 
              sx={{ 
                mt: 3, 
                p: 2, 
                bgcolor: '#f8f9fa', 
                border: '1px solid #e9ecef',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 2 }}>
                🎯 Bundle-Rabatt sichern!
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    15%
                  </Typography>
                  <Typography variant="body2">
                    ab 3 Produkten
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#ed6c02', fontWeight: 'bold' }}>
                    24%
                  </Typography>
                  <Typography variant="body2">
                    ab 5 Produkten
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                    36%
                  </Typography>
                  <Typography variant="body2">
                    ab 7 Produkten
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
                Je mehr Produkte du auswählst, desto mehr sparst du!
              </Typography>
            </Paper>
          </Box>

          {this.renderTentShapeSection()}
          <Divider sx={{ my: 4 }} />
          
          {this.renderTentSizeSection()}
          {this.state.selectedTentShape && <Divider sx={{ my: 4 }} />}
          
          {this.renderLightSection()}
          <Divider sx={{ my: 4 }} />
          
          {this.renderVentilationSection()}
          <Divider sx={{ my: 4 }} />
          
          {this.renderExtrasSection()}
          
          {/* Inline summary section - expands when scrolling to bottom */}
          {this.renderInlineSummary()}
          

        </Paper>
      </Container>
    );
  }
}

export default GrowTentKonfigurator; 