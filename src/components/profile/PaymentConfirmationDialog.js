import React, { Component } from "react";
import { Box, Typography, Button } from "@mui/material";

class PaymentConfirmationDialog extends Component {
  render() {
    const {
      paymentCompletionData,
      isCompletingOrder,
      completionError,
      orderCompleted,
      onContinueShopping,
      onViewOrders,
    } = this.props;

    if (!paymentCompletionData) return null;

    return (
      <Box sx={{ 
        mb: 3, 
        p: 3, 
        border: '2px solid', 
        borderColor: paymentCompletionData.isSuccessful ? '#2e7d32' : '#d32f2f',
        borderRadius: 2,
        bgcolor: paymentCompletionData.isSuccessful ? '#e8f5e8' : '#ffebee'
      }}>
        <Typography variant="h5" sx={{ 
          mb: 2, 
          color: paymentCompletionData.isSuccessful ? '#2e7d32' : '#d32f2f',
          fontWeight: 'bold'
        }}>
          {paymentCompletionData.isSuccessful ? 'Zahlung erfolgreich!' : 'Zahlung fehlgeschlagen'}
        </Typography>
        
        {paymentCompletionData.isSuccessful ? (
          <>
            {orderCompleted ? (
              <Typography variant="body1" sx={{ mt: 2, color: '#2e7d32' }}>
                🎉 Ihre Bestellung wurde erfolgreich abgeschlossen! Sie können jetzt Ihre Bestellungen einsehen.
              </Typography>
            ) : (
              <Typography variant="body1" sx={{ mt: 2, color: '#2e7d32' }}>
                Ihre Zahlung wurde erfolgreich verarbeitet. Die Bestellung wird automatisch abgeschlossen.
              </Typography>
            )}
          </>
        ) : (
          <Typography variant="body1" sx={{ mt: 2, color: '#d32f2f' }}>
            Ihre Zahlung konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut oder wählen Sie eine andere Zahlungsmethode.
          </Typography>
        )}

        {isCompletingOrder && (
          <Typography variant="body2" sx={{ mt: 2, color: '#2e7d32', p: 2, bgcolor: '#e8f5e8', borderRadius: 1 }}>
            Bestellung wird abgeschlossen...
          </Typography>
        )}

        {completionError && (
          <Typography variant="body2" sx={{ mt: 2, color: '#d32f2f', p: 2, bgcolor: '#ffcdd2', borderRadius: 1 }}>
            {completionError}
          </Typography>
        )}

        {orderCompleted && (
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button 
              onClick={onContinueShopping}
              variant="outlined"
              sx={{ 
                color: '#2e7d32', 
                borderColor: '#2e7d32',
                '&:hover': {
                  backgroundColor: 'rgba(46, 125, 50, 0.04)',
                  borderColor: '#1b5e20'
                }
              }}
            >
              Weiter einkaufen
            </Button>
            <Button 
              onClick={onViewOrders}
              variant="contained"
              sx={{ 
                bgcolor: '#2e7d32',
                '&:hover': { bgcolor: '#1b5e20' }
              }}
            >
              Zu meinen Bestellungen
            </Button>
          </Box>
        )}
      </Box>
    );
  }
}

export default PaymentConfirmationDialog; 