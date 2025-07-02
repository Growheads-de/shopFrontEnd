import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

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