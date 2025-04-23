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
import DeleteIcon from '@mui/icons-material/Delete';

class AddToCartButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      quantity: window.cart && window.cart[this.props.id] ? window.cart[this.props.id].quantity : 0,
      isEditing: false,
      editValue: ''
    };
  }
  
  componentDidMount() { 
    this.cart = () => {
      const newQuantity = window.cart && window.cart[this.props.id] ? window.cart[this.props.id].quantity : 0;
      if(this.state.quantity != newQuantity) this.setState({quantity:  newQuantity});
    };
    window.addEventListener('cart', this.cart);
  }

  componentWillUnmount() {
    window.removeEventListener('cart', this.cart);
  }


  handleIncrement = () => {
    if(!window.cart) window.cart = {}; 

    if(!window.cart[this.props.id]){
      window.cart[this.props.id] = {name:this.props.name, pictureList:this.props.pictureList, price:this.props.price, quantity:1};
    }else{
      window.cart[this.props.id].quantity++;
    }
    window.dispatchEvent(new CustomEvent('cart'));
  };

  handleDecrement = () => {
    if(!window.cart) window.cart = {};
    
    if(window.cart[this.props.id] && window.cart[this.props.id].quantity > 1){
      window.cart[this.props.id].quantity--;
    }else{
      delete window.cart[this.props.id];
    }

    window.dispatchEvent(new CustomEvent('cart'));
  };

  handleClearCart = () => {
    if(!window.cart) window.cart = {};
    delete window.cart[this.props.id];
    window.dispatchEvent(new CustomEvent('cart'));
  };

  handleEditStart = () => {
    this.setState({ 
      isEditing: true, 
      editValue: this.state.quantity>0?this.state.quantity.toString():''
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
    if(!window.cart) window.cart = {};
    window.cart[this.props.id].quantity = newQuantity;
    window.dispatchEvent(new CustomEvent('cart', { detail: {id:this.props.id, quantity:newQuantity} }));
    this.setState({ isEditing: false });
  };

  handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.handleEditComplete();
    }
  };

  toggleCart = () => {
    // Dispatch an event that Header.js can listen for to toggle the cart
    window.dispatchEvent(new CustomEvent('toggle-cart'));
  };

  render() {
    const { quantity, isEditing, editValue } = this.state;
    const { available, size } = this.props;
    console.log('this.props', this.props);
    
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
                onFocus={(e) => e.target.select()}
                size="small"
                variant="standard"
                inputProps={{ 
                  style: { 
                    textAlign: 'center', 
                    width: '30px',
                    padding: '2px',
                    fontWeight: 'bold'
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
            

          </Box>
          
          <IconButton 
            color="inherit" 
            onClick={this.handleIncrement}
            sx={{ borderRadius: 0, flexGrow: 1 }}
          >
            <AddIcon />
          </IconButton>
          
          <Tooltip title="Aus dem Warenkorb entfernen" arrow>
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
          {this.props.cartButton && (
            <Tooltip title="Warenkorb öffnen" arrow>
              <IconButton 
                color="inherit"
                onClick={this.toggleCart}
                sx={{ 
                  borderRadius: 0,
                  '&:hover': { color: 'primary.light' }
                }}
              >
                <ShoppingCartIcon />
              </IconButton>
            </Tooltip>
          )}
        </ButtonGroup>
      </Box>
    );
  }
}

export default AddToCartButton; 