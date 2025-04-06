import React, { Component } from 'react';
import { 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  IconButton, 
  Typography, 
  Box,
  ButtonGroup,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';

class CartItem extends Component {
  handleIncrement = () => {
    const { item, onQuantityChange } = this.props;
    onQuantityChange(item.quantity + 1);
  };

  handleDecrement = () => {
    const { item, onQuantityChange } = this.props;
    if (item.quantity > 1) {
      onQuantityChange(item.quantity - 1);
    }
  };

  render() {
    const { item, onRemove } = this.props;
    
    return (
      <>
        <ListItem 
          alignItems="flex-start"
          sx={{ py: 2 }}
        >
          <ListItemAvatar>
            <Avatar 
              variant="rounded" 
              alt={item.name} 
              src={item.image} 
              sx={{ 
                width: 60, 
                height: 60, 
                mr: 1,
                bgcolor: 'primary.light',
                color: 'white'
              }}
            >
              {item.name.charAt(0)}
            </Avatar>
          </ListItemAvatar>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, mr: 6 }}>
            <Typography 
              variant="subtitle1" 
              component="div" 
              sx={{ fontWeight: 'bold', mb: 0.5 }}
            >
              {item.name}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, mt: 1 }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                component="div"
              >
                ${item.price.toFixed(2)} x {item.quantity}
              </Typography>
              <Typography 
                variant="body2" 
                color="primary.dark"
                fontWeight="bold"
                component="div"
              >
                ${(item.price * item.quantity).toFixed(2)}
              </Typography>
            </Box>
            
            <ButtonGroup size="small" sx={{ mt: 0.5 }}>
              <IconButton 
                size="small" 
                onClick={this.handleDecrement}
                disabled={item.quantity <= 1}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Box 
                sx={{ 
                  px: 1, 
                  display: 'flex', 
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography 
                  variant="body2"
                  component="div"
                >
                  {item.quantity}
                </Typography>
              </Box>
              <IconButton 
                size="small" 
                onClick={this.handleIncrement}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </ButtonGroup>
          </Box>
          
          <IconButton 
            edge="end" 
            onClick={onRemove}
            size="small"
            sx={{ 
              color: 'error.main',
              position: 'absolute',
              right: 16,
              top: 16
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </ListItem>
        <Divider variant="inset" component="li" />
      </>
    );
  }
}

export default CartItem; 