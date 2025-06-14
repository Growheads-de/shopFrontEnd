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
  Grid,
  Typography,
  List,
  ListItem
} from '@mui/material';

const CartSyncDialog = ({ open, localCart = [], serverCart = [], onClose, onConfirm }) => {
  const [option, setOption] = useState('merge');

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Warenkorb-Synchronisierung</DialogTitle>
      <DialogContent>
        <Typography paragraph>
          Sie haben lokal gespeicherte und serverseitige Warenkörbe. Bitte wählen Sie, wie Sie verfahren möchten:
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
            label="Warenkörbe zusammenführen (Merge)"
          />
        </RadioGroup>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <Typography variant="h6">Lokaler Warenkorb</Typography>
            <List>
              {localCart.length > 0
                ? localCart.map(item => (
                    <ListItem key={item.id}>
                      {item.name} x {item.quantity}
                    </ListItem>
                  ))
                : <Typography color="text.secondary">leer</Typography>}
            </List>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6">Server-Warenkorb</Typography>
            <List>
              {serverCart.length > 0
                ? serverCart.map(item => (
                    <ListItem key={item.id}>
                      {item.name} x {item.quantity}
                    </ListItem>
                  ))
                : <Typography color="text.secondary">leer</Typography>}
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