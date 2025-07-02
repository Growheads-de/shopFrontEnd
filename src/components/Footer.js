import React, { Component } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

// Styled component for the router links
const StyledRouterLink = styled(RouterLink)(() => ({
  color: 'inherit',
  fontSize: '13px',
  textDecoration: 'none',
  lineHeight: '1.5',
  display: 'block',
  padding: '4px 8px',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

// Styled component for the domain link
const StyledDomainLink = styled(Link)(() => ({
  color: 'inherit',
  textDecoration: 'none',
  lineHeight: '1.5',
  '&:hover': {
    textDecoration: 'none',
  },
}));

// Styled component for the dark overlay
const DarkOverlay = styled(Box)(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  zIndex: 9998,
  pointerEvents: 'none',
  transition: 'opacity 0.9s ease',
}));

// Styled component for the info bubble
const InfoBubble = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
  padding: theme.spacing(3),
  zIndex: 9999,
  pointerEvents: 'none',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  minWidth: '280px',
  maxWidth: '400px',
  textAlign: 'center',
  transition: 'all 0.9s ease',
}));

class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMapsInfo: false,
      showReviewsInfo: false,
    };
  }

  handleMapsMouseEnter = () => {
    this.setState({ showMapsInfo: true });
  };

  handleMapsMouseLeave = () => {
    this.setState({ showMapsInfo: false });
  };

  handleReviewsMouseEnter = () => {
    this.setState({ showReviewsInfo: true });
  };

  handleReviewsMouseLeave = () => {
    this.setState({ showReviewsInfo: false });
  };

  render() {
    const { showMapsInfo, showReviewsInfo } = this.state;

    return (
      <>
        {/* Dark overlay for Maps */}
        <DarkOverlay sx={{ 
          opacity: showMapsInfo ? 1 : 0
        }} />

        {/* Dark overlay for Reviews */}
        <DarkOverlay sx={{ 
          opacity: showReviewsInfo ? 1 : 0
        }} />

                  {/* Info bubble */}
          <InfoBubble 
            elevation={8}
            sx={{
              opacity: showMapsInfo ? 1 : 0,
              visibility: showMapsInfo ? 'visible' : 'hidden',
              transform: showMapsInfo ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.8)'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 2, 
                color: 'primary.main',
                fontSize: '1.25rem'
              }}
            >
              Filiale
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                color: 'text.primary'
              }}
            >
              Öffnungszeiten:
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 1,
                color: 'text.secondary'
              }}
            >
              Mo-Fr 10-20
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 2,
                color: 'text.secondary'
              }}
            >
              Sa 11-19
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 1,
                color: 'text.primary'
              }}
            >
              Trachenberger Straße 14 - Dresden
            </Typography>
            
                         <Typography 
               variant="body2" 
               sx={{ 
                 fontStyle: 'italic',
                 color: 'text.secondary'
               }}
             >
               Zwischen Haltepunkt Pieschen und Trachenberger Platz
             </Typography>
           </InfoBubble>

          {/* Reviews Info bubble */}
          <InfoBubble 
            elevation={8}
            sx={{
              opacity: showReviewsInfo ? 1 : 0,
              visibility: showReviewsInfo ? 'visible' : 'hidden',
              transform: showReviewsInfo ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.8)',
              width: 'auto',
              minWidth: 'auto',
              maxWidth: '95vw',
              maxHeight: '90vh',
              padding: 2
            }}
          >
            <Box 
              component="img" 
              src="/assets/images/reviews.jpg" 
              alt="Customer Reviews" 
              sx={{ 
                width: '861px',
                height: '371px',
                maxWidth: '90vw',
                maxHeight: '80vh',
                borderRadius: '8px',
                objectFit: 'contain'
              }} 
            />
          </InfoBubble>

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
            sx={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',maxWidth: 'md', margin: 'auto' }} 
            spacing={{ xs: 3, md: 2 }} 
            justifyContent="space-between" 
            alignItems={{ xs: 'center', md: 'flex-end' }}
          >
            {/* Legal Links Section */}
            <Stack 
              direction={{ xs: 'row', md: 'column' }} 
              spacing={{ xs: 2, md: 0.5 }} 
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
              spacing={{ xs: 2, md: 0.5 }} 
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
                <Box component="img" src="/assets/images/cards.png" alt="Cash" sx={{ height: { xs: 80, md: 95 } }} />
              </Stack>
            </Stack>

            {/* Google Services Badge Section */}
            <Stack 
              direction="column" 
              spacing={1}
              justifyContent="center" 
              alignItems="center"
            >
              <Stack 
                direction="row" 
                spacing={{ xs: 1, md: 2 }} 
                sx={{pb: '10px'}}
                justifyContent="center" 
                alignItems="center"
              >
                <Link 
                  href="https://reviewthis.biz/growheads" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ 
                    textDecoration: 'none',
                    position: 'relative',
                    zIndex: 9999
                  }}
                  onMouseEnter={this.handleReviewsMouseEnter}
                  onMouseLeave={this.handleReviewsMouseLeave}
                >
                  <Box 
                    component="img" 
                    src="/assets/images/gg.png" 
                    alt="Google Reviews" 
                    sx={{ 
                      height: { xs: 50, md: 60 }, 
                      cursor: 'pointer',
                      transition: 'all 2s ease',
                      '&:hover': {
                        transform: 'scale(1.5) translateY(-10px)'
                      }
                    }} 
                  />
                </Link>
                <Link 
                  href="https://maps.app.goo.gl/D67ewDU3dZBda1BUA" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ 
                    textDecoration: 'none',
                    position: 'relative',
                    zIndex: 9999
                  }}
                  onMouseEnter={this.handleMapsMouseEnter}
                  onMouseLeave={this.handleMapsMouseLeave}
                >
                  <Box 
                    component="img" 
                    src="/assets/images/maps.png" 
                    alt="Google Maps" 
                    sx={{ 
                      height: { xs: 40, md: 50 }, 
                      cursor: 'pointer',
                      transition: 'all 2s ease',
                      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                      '&:hover': {
                        transform: 'scale(1.5) translateY(-10px)',
                        filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4))'
                      }
                    }} 
                  />
                </Link>
              </Stack>
            </Stack>
            
            {/* Copyright Section */}
            <Box sx={{ pb:'20px',textAlign: 'center', filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))', opacity: 0.7 }}>
              <Typography variant="body2" sx={{ mb: 1, fontSize: { xs: '11px', md: '14px' }, lineHeight: 1.5 }}>
                * Alle Preise inkl. gesetzlicher USt., zzgl. Versand
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '11px', md: '14px' }, lineHeight: 1.5 }}>
                © {new Date().getFullYear()} <StyledDomainLink href="https://growheads.de" target="_blank" rel="noopener noreferrer">GrowHeads.de</StyledDomainLink>
              </Typography>
            </Box>
          </Stack>
        </Box>
      </>
    );
  }
}

export default Footer;
