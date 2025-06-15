import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Typography,
  List,
  ListItem,
  Box,
  Chip
} from '@mui/material';
import { mergeCarts } from '../utils/cartUtils.js';

const CartSyncDialog = ({ open, localCart = [], serverCart = [], onClose, onConfirm }) => {
  const [option, setOption] = useState('merge');

  // Calculate the resulting cart based on the selected option
  const resultingCart = useMemo(() => {
    switch (option) {
      case 'deleteServer':
        return localCart;
      case 'useServer':
        return serverCart;
      case 'merge':
        return mergeCarts(localCart, serverCart);
      default:
        return localCart;
    }
  }, [option, localCart, serverCart]);

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

  // Helper function to get item status in merge
  const getItemMergeStatus = (item) => {
    if (option !== 'merge') return null;
    
    const isLocal = localCart.some(localItem => localItem.id === item.id);
    const isServer = serverCart.some(serverItem => serverItem.id === item.id);
    
    if (isLocal && isServer) {
      const localItem = localCart.find(localItem => localItem.id === item.id);
      const serverItem = serverCart.find(serverItem => serverItem.id === item.id);
      if (localItem.quantity !== serverItem.quantity) {
        return { type: 'merged', higher: Math.max(localItem.quantity, serverItem.quantity) };
      }
      return { type: 'both' };
    } else if (isLocal) {
      return { type: 'local' };
    } else if (isServer) {
      return { type: 'server' };
    }
    return null;
  };

  const renderCartItem = (item, cart, isResultCart = false) => {
    const selected = isItemSelected(item, cart, isResultCart);
    const mergeStatus = getItemMergeStatus(item, cart);
    
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
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">
              {item.name} x {item.quantity}
            </Typography>
            {mergeStatus && (
              <Box sx={{ ml: 1 }}>
                {mergeStatus.type === 'merged' && (
                  <Chip size="small" label={`Max: ${mergeStatus.higher}`} color="primary" variant="outlined" />
                )}
                {mergeStatus.type === 'both' && (
                  <Chip size="small" label="Beide" color="success" variant="outlined" />
                )}
                {mergeStatus.type === 'local' && (
                  <Chip size="small" label="Lokal" color="info" variant="outlined" />
                )}
                {mergeStatus.type === 'server' && (
                  <Chip size="small" label="Server" color="warning" variant="outlined" />
                )}
              </Box>
            )}
          </Box>
        </Box>
      </ListItem>
    );
  };

  const getOptionDescription = () => {
    switch (option) {
      case 'deleteServer':
        return 'Ihr lokaler Warenkorb wird beibehalten, der Server-Warenkorb wird gelöscht.';
      case 'useServer':
        return 'Der Server-Warenkorb wird übernommen, Ihr lokaler Warenkorb wird ersetzt.';
      case 'merge':
        return 'Beide Warenkörbe werden zusammengeführt. Bei gleichen Artikeln wird die höhere Anzahl verwendet.';
      default:
        return '';
    }
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

        <Box sx={{ mt: 2, p: 2, backgroundColor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            {getOptionDescription()}
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <Typography variant="h6">Ihr aktueller Warenkorb</Typography>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {localCart.length > 0
                ? localCart.map(item => renderCartItem(item, localCart))
                : <Typography color="text.secondary" sx={{ p: 2 }}>leer</Typography>}
            </List>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6">In Ihrem Profil gespeicherter Warenkorb</Typography>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {serverCart.length > 0
                ? serverCart.map(item => renderCartItem(item, serverCart))
                : <Typography color="text.secondary" sx={{ p: 2 }}>leer</Typography>}
            </List>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button variant="contained" onClick={() => onConfirm(option)}>
          Synchronisieren
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CartSyncDialog; 