import React from 'react';
import { Box, AppBar, Toolbar, Container, Typography, Grid, Card, CardMedia, CardContent } from '@mui/material';
import Footer from './components/Footer.js';
import { Logo, SearchBar, CategoryList } from './components/header/index.js';

const PrerenderCategory = ({ categoryId, categoryName, categorySeoName, productData }) => {
  const products = productData?.products || [];
  
  return (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      mb: 0,
      pb: 0,
      bgcolor: 'background.default'
    }}
  >
    <AppBar position="sticky" color="primary" elevation={0} sx={{ zIndex: 1100 }}>
      <Toolbar sx={{ minHeight: 64 }}>
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center' }}>
          {/* First row: Logo and ButtonGroup on xs, all items on larger screens */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: '100%',
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            {/* Top row for xs, single row for larger screens */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              width: '100%',
              justifyContent: { xs: 'space-between', sm: 'flex-start' }
            }}>
              <Logo />
              {/* SearchBar visible on sm and up */}
              <Box sx={{ display: { xs: 'none', sm: 'block' }, flexGrow: 1 }}>
                
              </Box>
             
            </Box>
            
            {/* Second row: SearchBar only on xs */}
            <Box sx={{ 
              display: { xs: 'block', sm: 'none' }, 
              width: '100%',
              mt: 1, mb: 1
            }}>
              <SearchBar />
            </Box>
          </Box>
        </Container>
      </Toolbar>
      <CategoryList categoryId={209} activeCategoryId={categorySeoName} />
    </AppBar>

    <Container maxWidth="xl" sx={{ py: 2, flexGrow: 1, height: '100%', display: 'grid', gridTemplateRows: '1fr' }}>                 
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr', md: '1fr 3fr', lg: '1fr 4fr', xl: '1fr 4fr' }, 
        gap: 3
      }}>
        <Box>
          {/* Category Info */}
          <Typography variant="h4" component="h1" sx={{ mb: 2, color: 'primary.main' }}>
            {categoryName || `Category ${categoryId}`}
          </Typography>
          

        </Box>
      
        <Box>
          {/* Product list */}
          <Box sx={{ 
            bgcolor: 'background.paper', 
            p: 2, 
            borderRadius: 1,
            minHeight: 400
          }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Products {products.length > 0 && `(${products.length})`}
            </Typography>
            
            {products.length > 0 ? (
              <Grid container spacing={2}>
                {products.map((product) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                    <a 
                      href={`/Artikel/${product.seoName}`}
                      style={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        display: 'block',
                        height: '100%'
                      }}
                    >
                      <Card sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }
                      }}>
                        <noscript>
                          <CardMedia
                            component="img"
                            height="200"
                            image={product.pictureList && product.pictureList.trim() 
                              ? `/assets/images/prod${product.pictureList.split(',')[0].trim()}.jpg` 
                              : '/assets/images/nopicture.jpg'
                            }
                            alt={product.name}
                            sx={{ objectFit: 'cover' }}
                          />
                        </noscript>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="h3" sx={{ 
                            mb: 1, 
                            fontSize: '0.9rem',
                            lineHeight: 1.2,
                            height: '2.4em',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Art.-Nr.: {product.articleNumber}
                          </Typography>
                          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                            {product.price ? `€${parseFloat(product.price).toFixed(2)}` : 'Preis auf Anfrage'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </a>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No products found in this category
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Container>

    <Footer />
  </Box>
  );
};

export default PrerenderCategory; 