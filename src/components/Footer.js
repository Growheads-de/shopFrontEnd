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
          backgroundColor: 'primary.dark',
          color: 'white',
        }}
      >
         <Stack direction="row" sx={{maxWidth: 'md', margin: 'auto'}} spacing={2} justifyContent="space-between" alignItems="flex-end">
          <Stack 
            direction={'column'} 
            spacing={0} 
            justifyContent="center" 
            alignItems="left"
          >
            <StyledRouterLink to="/datenschutz">Datenschutz</StyledRouterLink>
            <StyledRouterLink to="/agb">AGB</StyledRouterLink>
            <StyledRouterLink to="/sitemap">Sitemap</StyledRouterLink>
          </Stack>

          <Stack 
            direction={'column'} 
            spacing={0} 
            justifyContent="center" 
            alignItems="left"
          >
            <StyledRouterLink to="/impressum">Impressum</StyledRouterLink>
            <StyledRouterLink to="/batteriegesetzhinweise">Batteriegesetzhinweise</StyledRouterLink>
            <StyledRouterLink to="/widerrufsrecht">Widerrufsrecht</StyledRouterLink>
          </Stack>  
          <Stack 
            direction="column" 
            spacing={1}
            justifyContent="center" 
            alignItems="center"
          >
            <Stack 
              direction="row" 
              spacing={2} 
              justifyContent="center" 
              alignItems="center"
            >
              <Box component="img" src="/assets/images/cash.png" alt="Cash" sx={{ height: 30 }} />
              <Box component="img" src="/assets/images/giropay.png" alt="Giropay" sx={{ height: 30 }} />
              <Box component="img" src="/assets/images/mastercard.png" alt="Mastercard" sx={{ height: 30 }} />
            </Stack>
            <Stack 
              direction="row" 
              spacing={2} 
              justifyContent="center" 
              alignItems="center"
            >
              <Box component="img" src="/assets/images/visa_electron.png" alt="Visa Electron" sx={{ height: 30 }} />
              <Box component="img" src="/assets/images/maestro.png" alt="Maestro" sx={{ height: 30 }} />
            </Stack>
          </Stack>
          
          <Box sx={{ textAlign: 'center', opacity: 0.7 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              * Alle Preise inkl. gesetzlicher USt., zzgl. Versand
            </Typography>
            <Typography variant="body2">
              © {new Date().getFullYear()} Growheads
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  }
}

export default Footer; 