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
            width: '300px',
            height: '300px',
            maxWidth: '100%',
            display: 'block',
          }}
        />
      </Box>
      <Typography variant="body1" paragraph align="center">
        Diese Seite scheint es nicht mehr zu geben.
      </Typography>
    </>
  );

  return <LegalPage content={content} />;
};

export default NotFound404; 