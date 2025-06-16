import React, { Component } from 'react';
import { 
  Box, 
  Paper, 
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SocketContext from '../../contexts/SocketContext.js';
import OrderDetailsDialog from './OrderDetailsDialog.js';

// Orders Tab Content Component
class OrdersTab extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      orders: [],
      loading: true,
      error: null,
      selectedOrder: null,
      isDetailsDialogOpen: false
    };

    this.statusTranslations = {
      'new': 'in Bearbeitung',
    };

    // Emoji mapping for order status
    this.statusEmojis = {
      'in Bearbeitung': '⚙️',
      'Verschickt': '🚚',
      'Geliefert': '✅',
      'Storniert': '❌',
      'Retoure': '↩️',
      'Teil Retoure': '↪️',
      'Teil geliefert': '⚡'
    };
    
    // Status colors
    this.statusColors = {
      'in Bearbeitung': '#ed6c02', // orange
      'Verschickt': '#2e7d32', // green
      'Geliefert': '#2e7d32', // green
      'Storniert': '#d32f2f', // red
      'Retoure': '#9c27b0', // purple
      'Teil Retoure': '#9c27b0', // purple
      'Teil geliefert': '#009688' // teal
    };
  }

  componentDidMount() {
    if (this.context) {
      this.context.emit('getOrders', (response) => {
        if (response.success) {
          this.setState({ orders: response.orders, loading: false });
        } else {
          this.setState({ error: response.error || 'Failed to fetch orders.', loading: false });
        }
      });
    } else {
      this.setState({ error: 'Socket not connected.', loading: false });
    }
  }

  getStatusDisplay = (status) => {
    return this.statusTranslations[status] || status;
  }

  getStatusEmoji = (status) => {
    return this.statusEmojis[status] || '❓';
  }

  getStatusColor = (status) => {
    return this.statusColors[status] || '#757575'; // default gray
  }

  handleViewDetails = (orderId) => {
    const selectedOrder = this.state.orders.find(order => order.orderId === orderId);
    this.setState({ selectedOrder, isDetailsDialogOpen: true });
  }

  handleCloseDetailsDialog = () => {
    this.setState({ selectedOrder: null, isDetailsDialogOpen: false });
  };

  render() {
    const { orders, loading, error, selectedOrder, isDetailsDialogOpen } = this.state;

    if (loading) {
      return (
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 3 }}>

        {orders.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bestellnummer</TableCell>
                  <TableCell>Datum</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Artikel</TableCell>
                  <TableCell align="right">Summe</TableCell>
                  <TableCell align="center">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => {
                  const displayStatus = this.getStatusDisplay(order.status);
                  return (
                  <TableRow key={order.orderId} hover>
                    <TableCell>{order.orderId}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        color: this.getStatusColor(displayStatus)
                      }}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {this.getStatusEmoji(displayStatus)}
                        </span>
                        <Typography variant="body2" component="span" sx={{ fontWeight: 'medium' }}>
                          {displayStatus}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{order.items.reduce((acc, item) => acc + item.quantity_ordered, 0)}</TableCell>
                    <TableCell align="right">€{order.delivery_cost.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Details anzeigen">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => this.handleViewDetails(order.orderId)}
                        >
                          <SearchIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            Sie haben noch keine Bestellungen aufgegeben.
          </Alert>
        )}
        <OrderDetailsDialog
          open={isDetailsDialogOpen}
          onClose={this.handleCloseDetailsDialog}
          order={selectedOrder}
        />
      </Box>
    );
  }
}

OrdersTab.contextType = SocketContext;

export default OrdersTab; 