import React from 'react';
import { Typography } from '@mui/material';
import LegalPage from './LegalPage.js';

const NotFound404 = () => {
  const content = (
    <>
      <Typography variant="body1" paragraph>
        This page is no longer available.
      </Typography>
    </>
  );

  return <LegalPage title="Page Not Found" content={content} />;
};

export default NotFound404; 