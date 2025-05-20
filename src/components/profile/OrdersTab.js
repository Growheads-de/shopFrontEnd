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
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

// Orders Tab Content Component
class OrdersTab extends Component {
  constructor(props) {
    super(props);
    
    // Mock order data with updated status values
    this.mockOrders = [
      /*{ id: '12345', date: '2023-10-15', status: 'Geliefert', total: '€120.50', items: 3 },
      { id: '12346', date: '2023-09-28', status: 'Wird bearbeitet', total: '€85.20', items: 2 },
      { id: '12347', date: '2023-08-05', status: 'Verschickt', total: '€210.00', items: 5 },
      { id: '12348', date: '2023-07-12', status: 'Neu', total: '€45.75', items: 1 },
      { id: '12349', date: '2023-06-22', status: 'Storniert', total: '€150.00', items: 4 },
      { id: '12350', date: '2023-05-18', status: 'Retoure', total: '€89.99', items: 2 },
      { id: '12351', date: '2023-04-10', status: 'Teil Retoure', total: '€125.50', items: 3 },
      { id: '12352', date: '2023-03-25', status: 'Teil geliefert', total: '€199.00', items: 5 },*/
    ];

    // Emoji mapping for order status
    this.statusEmojis = {
      'Neu': '🆕',
      'Wird bearbeitet': '⚙️',
      'Verschickt': '🚚',
      'Geliefert': '✅',
      'Storniert': '❌',
      'Retoure': '↩️',
      'Teil Retoure': '↪️',
      'Teil geliefert': '⚡'
    };
    
    // Status colors
    this.statusColors = {
      'Neu': '#1976d2', // blue
      'Wird bearbeitet': '#ed6c02', // orange
      'Verschickt': '#2e7d32', // green
      'Geliefert': '#2e7d32', // green
      'Storniert': '#d32f2f', // red
      'Retoure': '#9c27b0', // purple
      'Teil Retoure': '#9c27b0', // purple
      'Teil geliefert': '#009688' // teal
    };
  }

  getStatusEmoji = (status) => {
    return this.statusEmojis[status] || '❓';
  }

  getStatusColor = (status) => {
    return this.statusColors[status] || '#757575'; // default gray
  }

  handleViewDetails = (orderId) => {
    console.log(`View details for order: ${orderId}`);
    // Implementation for viewing order details
  }

  handleDownloadPdf = (orderId) => {
    console.log(`Download PDF for order: ${orderId}`);
    // Implementation for downloading order PDF
  }

  render() {
    return (
      <Box sx={{ p: 3 }}>

        {this.mockOrders.length > 0 ? (
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
                {this.mockOrders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        color: this.getStatusColor(order.status)
                      }}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {this.getStatusEmoji(order.status)}
                        </span>
                        <span style={{ fontWeight: 'medium' }}>
                          {order.status}
                        </span>
                      </Box>
                    </TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell align="right">{order.total}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Details anzeigen">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => this.handleViewDetails(order.id)}
                        >
                          <SearchIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="PDF herunterladen">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => this.handleDownloadPdf(order.id)}
                        >
                          <PictureAsPdfIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            Sie haben noch keine Bestellungen aufgegeben.
          </Alert>
        )}
      </Box>
    );
  }
}

export default OrdersTab; 