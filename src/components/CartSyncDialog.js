import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  List,
  ListItem,
  Box
} from '@mui/material';

const CartSyncDialog = ({ open, localCart = [], serverCart = [], onClose, onConfirm }) => {
  const [option, setOption] = useState('merge');

  // Helper function to determine if an item is selected in the result
  const isItemSelected = (item, cart, isResultCart = false) => {
    if (isResultCart) return true; // All items in result cart are selected
    
    switch (option) {
      case 'deleteServer':
        return cart === localCart;
      case 'useServer':
        return cart === serverCart;
      case 'merge':
        return true; // Both carts contribute to merge
      default:
        return false;
    }
  };



  const renderCartItem = (item, cart, isResultCart = false) => {
    const selected = isItemSelected(item, cart, isResultCart);
    
    return (
      <ListItem 
        key={item.id} 
        sx={{ 
          opacity: selected ? 1 : 0.4,
          backgroundColor: selected ? 'action.selected' : 'transparent',
          borderRadius: 1,
          mb: 0.5
        }}
      >
        <Typography variant="body2">
          {item.name} x {item.quantity}
        </Typography>
      </ListItem>
    );
  };



  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Warenkorb-Synchronisierung</DialogTitle>
      <DialogContent>
        <Typography paragraph>
          Sie haben einen gespeicherten Warenkorb in ihrem Account. Bitte wählen Sie, wie Sie verfahren möchten:
        </Typography>
        <RadioGroup value={option} onChange={e => setOption(e.target.value)}>
          {/*<FormControlLabel
            value="useLocalArchive"
            control={<Radio />}
            label="Lokalen Warenkorb verwenden und Serverseitigen Warenkorb archivieren"
          />*/}
          <FormControlLabel
            value="deleteServer"
            control={<Radio />}
            label="Server-Warenkorb löschen"
          />
          <FormControlLabel
            value="useServer"
            control={<Radio />}
            label="Server-Warenkorb übernehmen"
          />
          <FormControlLabel
            value="merge"
            control={<Radio />}
            label="Warenkörbe zusammenführen"
          />
        </RadioGroup>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6">Ihr aktueller Warenkorb</Typography>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {localCart.length > 0
                ? localCart.map(item => renderCartItem(item, localCart))
                : <Typography color="text.secondary" sx={{ p: 2 }}>leer</Typography>}
            </List>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6">In Ihrem Profil gespeicherter Warenkorb</Typography>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {serverCart.length > 0
                ? serverCart.map(item => renderCartItem(item, serverCart))
                : <Typography color="text.secondary" sx={{ p: 2 }}>leer</Typography>}
            </List>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button variant="contained" onClick={() => onConfirm(option)}>
          Weiter
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CartSyncDialog; 