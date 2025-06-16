import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Constants
const statusTranslations = {
  'new': 'in Bearbeitung',
};

const statusEmojis = {
  'in Bearbeitung': '⚙️',
  'Verschickt': '🚚',
  'Geliefert': '✅',
  'Storniert': '❌',
  'Retoure': '↩️',
  'Teil Retoure': '↪️',
  'Teil geliefert': '⚡'
};

const statusColors = {
  'in Bearbeitung': '#ed6c02', // orange
  'Verschickt': '#2e7d32', // green
  'Geliefert': '#2e7d32', // green
  'Storniert': '#d32f2f', // red
  'Retoure': '#9c27b0', // purple
  'Teil Retoure': '#9c27b0', // purple
  'Teil geliefert': '#009688' // teal
};

const currencyFormatter = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

// Orders Tab Content Component
const OrdersTab = ({ orderIdFromHash }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  
  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  const handleViewDetails = useCallback((orderId) => {
    const orderToView = orders.find(order => order.orderId === orderId);
    if (orderToView) {
      setSelectedOrder(orderToView);
      setIsDetailsDialogOpen(true);
    }
  }, [orders]);

  useEffect(() => {
    if (socket) {
      socket.emit('getOrders', (response) => {
        if (response.success) {
          setOrders(response.orders);
        } else {
          setError(response.error || 'Failed to fetch orders.');
        }
        setLoading(false);
      });
    } else {
      setError('Socket not connected.');
      setLoading(false);
    }
  }, [socket]);

  useEffect(() => {
    if (orderIdFromHash && orders.length > 0) {
      handleViewDetails(orderIdFromHash);
    }
  }, [orderIdFromHash, orders, handleViewDetails]);

  const getStatusDisplay = (status) => {
    return statusTranslations[status] || status;
  }

  const getStatusEmoji = (status) => {
    return statusEmojis[status] || '❓';
  }

  const getStatusColor = (status) => {
    return statusColors[status] || '#757575'; // default gray
  }

  const handleCloseDetailsDialog = () => {
    setIsDetailsDialogOpen(false);
    setSelectedOrder(null);
    navigate('/profile', { replace: true });
  };

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
                const displayStatus = getStatusDisplay(order.status);
                const subtotal = order.items.reduce((acc, item) => acc + item.price * item.quantity_ordered, 0);
                const total = subtotal + order.delivery_cost;
                return (
                <TableRow key={order.orderId} hover>
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      color: getStatusColor(displayStatus)
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>
                        {getStatusEmoji(displayStatus)}
                      </span>
                      <Typography variant="body2" component="span" sx={{ fontWeight: 'medium' }}>
                        {displayStatus}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{order.items.reduce((acc, item) => acc + item.quantity_ordered, 0)}</TableCell>
                  <TableCell align="right">{currencyFormatter.format(total)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Details anzeigen">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleViewDetails(order.orderId)}
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
        onClose={handleCloseDetailsDialog}
        order={selectedOrder}
      />
    </Box>
  );
}

export default OrdersTab; 