import React, { Component } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';

// Styled component for the router links
const StyledRouterLink = styled(RouterLink)(({ theme }) => ({
  color: 'inherit',
  fontSize: '13px',
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
  padding: theme.spacing(0.5),
}));

class Footer extends Component {
  render() {
    return (
      <Box 
        component="footer" 
        sx={{
          py: 2,
          px: 2,
          mt: 'auto',
          mb: 0,
          backgroundColor: 'primary.dark',
          color: 'white',
        }}
      >
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          sx={{ maxWidth: 'md', margin: 'auto' }} 
          spacing={{ xs: 3, md: 2 }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'center', md: 'flex-end' }}
        >
          {/* Legal Links Section */}
          <Stack 
            direction={{ xs: 'row', md: 'column' }} 
            spacing={{ xs: 2, md: 0 }} 
            justifyContent="center" 
            alignItems={{ xs: 'center', md: 'left' }}
            flexWrap="wrap"
          >
            <StyledRouterLink to="/datenschutz">Datenschutz</StyledRouterLink>
            <StyledRouterLink to="/agb">AGB</StyledRouterLink>
            <StyledRouterLink to="/sitemap">Sitemap</StyledRouterLink>
          </Stack>

          <Stack 
            direction={{ xs: 'row', md: 'column' }} 
            spacing={{ xs: 2, md: 0 }} 
            justifyContent="center" 
            alignItems={{ xs: 'center', md: 'left' }}
            flexWrap="wrap"
          >
            <StyledRouterLink to="/impressum">Impressum</StyledRouterLink>
            <StyledRouterLink to="/batteriegesetzhinweise">Batteriegesetzhinweise</StyledRouterLink>
            <StyledRouterLink to="/widerrufsrecht">Widerrufsrecht</StyledRouterLink>
          </Stack>
          
          {/* Payment Methods Section */}
          <Stack 
            direction="column" 
            spacing={1}
            justifyContent="center" 
            alignItems="center"
          >
            <Stack 
              direction="row" 
              spacing={{ xs: 1, md: 2 }} 
              justifyContent="center" 
              alignItems="center"
              flexWrap="wrap"
            >
              <Box component="img" src="/assets/images/cash.png" alt="Cash" sx={{ height: { xs: 25, md: 30 } }} />
              <Box component="img" src="/assets/images/giropay.png" alt="Giropay" sx={{ height: { xs: 25, md: 30 } }} />
              <Box component="img" src="/assets/images/mastercard.png" alt="Mastercard" sx={{ height: { xs: 25, md: 30 } }} />
            </Stack>
            <Stack 
              direction="row" 
              spacing={{ xs: 1, md: 2 }} 
              justifyContent="center" 
              alignItems="center"
              flexWrap="wrap"
            >
              <Box component="img" src="/assets/images/visa_electron.png" alt="Visa Electron" sx={{ height: { xs: 25, md: 30 } }} />
              <Box component="img" src="/assets/images/maestro.png" alt="Maestro" sx={{ height: { xs: 25, md: 30 } }} />
            </Stack>
          </Stack>
          
          {/* Copyright Section */}
          <Box sx={{ textAlign: 'center', opacity: 0.7 }}>
            <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '11px', md: '14px' } }}>
              * Alle Preise inkl. gesetzlicher USt., zzgl. Versand
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: '11px', md: '14px' } }}>
              © {new Date().getFullYear()} Seedheads
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  }
}

export default Footer;
