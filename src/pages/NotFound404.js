import React from 'react';
import { Typography, Box } from '@mui/material';
import LegalPage from './LegalPage.js';

const NotFound404 = () => {
  const content = (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <img
          src="/assets/images/404.png"
          alt="404 - Page Not Found"
          style={{
            maxWidth: '100%',
            height: 'auto',
            maxHeight: '300px',
          }}
        />
      </Box>
      <Typography variant="body1" paragraph align="center">
        This page is no longer available.
      </Typography>
    </>
  );

  return <LegalPage title="Page Not Found" content={content} />;
};

export default NotFound404; 