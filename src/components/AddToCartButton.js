import React, { Component } from 'react';
import { 
  Button, 
  ButtonGroup, 
  IconButton, 
  Typography, 
  Box,
  Tooltip,
  TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';

class AddToCartButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      quantity: this.props.initialQuantity || 0,
      addedToCart: false,
      isEditing: false,
      editValue: ''
    };
  }

  handleIncrement = () => {
    this.setState(
      prevState => ({ 
        quantity: prevState.quantity + 1,
        addedToCart: true
      }),
      () => {
        if (this.props.onQuantityChange) {
          this.props.onQuantityChange(this.state.quantity);
        }
      }
    );
  };

  handleDecrement = () => {
    if (this.state.quantity > 0) {
      this.setState(
        prevState => ({ 
          quantity: prevState.quantity - 1,
          addedToCart: prevState.quantity - 1 > 0
        }),
        () => {
          if (this.props.onQuantityChange) {
            this.props.onQuantityChange(this.state.quantity);
          }
        }
      );
    }
  };

  handleClearCart = () => {
    this.setState(
      { 
        quantity: 0,
        addedToCart: false
      },
      () => {
        if (this.props.onQuantityChange) {
          this.props.onQuantityChange(0);
        }
      }
    );
  };

  handleEditStart = () => {
    this.setState({ 
      isEditing: true, 
      editValue: this.state.quantity.toString()
    });
  };

  handleEditChange = (event) => {
    // Only allow numbers
    const value = event.target.value.replace(/[^0-9]/g, '');
    this.setState({ editValue: value });
  };

  handleEditComplete = () => {
    let newQuantity = parseInt(this.state.editValue, 10);
    
    // Handle invalid input
    if (isNaN(newQuantity) || newQuantity < 0) {
      newQuantity = 0;
    }
    
    this.setState(
      { 
        quantity: newQuantity,
        addedToCart: newQuantity > 0,
        isEditing: false
      },
      () => {
        if (this.props.onQuantityChange) {
          this.props.onQuantityChange(this.state.quantity);
        }
      }
    );
  };

  handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.handleEditComplete();
    }
  };

  render() {
    const { quantity, addedToCart, isEditing, editValue } = this.state;
    const { available, size } = this.props;
    
    // Button is disabled if product is not available
    if (!available) {
      return (
        <Button 
          disabled
          fullWidth
          variant="contained" 
          size={size || "medium"}
          sx={{ 
            borderRadius: 2,
            fontWeight: 'bold',
          }}
        >
          Out of Stock
        </Button>
      );
    }
    
    // If no items in cart, show simple "Add to Cart" button
    if (quantity === 0) {
      return (
        <Button 
          fullWidth
          variant="contained" 
          color="primary"
          size={size || "medium"}
          onClick={this.handleIncrement}
          startIcon={<ShoppingCartIcon />}
          sx={{ 
            borderRadius: 2,
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: 'primary.dark',
            }
          }}
        >
          In den Korb
        </Button>
      );
    }
    
    // If items are in cart, show quantity controls
    return (
      <Box sx={{ width: '100%' }}>
        <ButtonGroup 
          fullWidth 
          variant="contained" 
          color="primary"
          size={size || "medium"}
          sx={{ 
            borderRadius: 2, 
            '& .MuiButtonGroup-grouped:not(:last-of-type)': {
              borderRight: '1px solid rgba(255,255,255,0.3)'
            }
          }}
        >
          <IconButton 
            color="inherit" 
            onClick={this.handleDecrement}
            sx={{ borderRadius: 0, flexGrow: 1 }}
          >
            <RemoveIcon />
          </IconButton>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              px: 2,
              flexGrow: 2,
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={this.handleEditStart}
          >
            {isEditing ? (
              <TextField
                autoFocus
                value={editValue}
                onChange={this.handleEditChange}
                onBlur={this.handleEditComplete}
                onKeyPress={this.handleKeyPress}
                size="small"
                variant="standard"
                inputProps={{ 
                  style: { 
                    textAlign: 'center', 
                    width: '30px',
                    padding: '2px',
                    fontWeight: 'bold',
                    color: 'white'
                  },
                  'aria-label': 'quantity' 
                }}
                sx={{ my: -0.5 }}
              />
            ) : (
              <Typography variant="button" sx={{ fontWeight: 'bold' }}>
                {quantity}
              </Typography>
            )}
            
            <Tooltip title="Added to cart!" placement="top" arrow>
              <CheckCircleIcon 
                sx={{ 
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  color: 'secondary.light',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  fontSize: 16,
                  animation: addedToCart ? 'pulse 1.5s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.2)' },
                    '100%': { transform: 'scale(1)' }
                  }
                }} 
              />
            </Tooltip>
          </Box>
          
          <IconButton 
            color="inherit" 
            onClick={this.handleIncrement}
            sx={{ borderRadius: 0, flexGrow: 1 }}
          >
            <AddIcon />
          </IconButton>
          
          <Tooltip title="Remove from cart" arrow>
            <IconButton 
              color="inherit"
              onClick={this.handleClearCart}
              sx={{ 
                borderRadius: 0,
                '&:hover': { color: 'error.light' }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </ButtonGroup>
      </Box>
    );
  }
}

export default AddToCartButton; 