import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const LegalPage = ({ title, content }) => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ mt: 3 }}>
          {content}
        </Box>
      </Paper>
    </Container>
  );
};

export default LegalPage; 