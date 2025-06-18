const React = require('react');
const { 
  Container, 
  Typography, 
  Card, 
  CardMedia, 
  Grid, 
  Box,
  Chip,
  Stack,
  AppBar,
  Toolbar
} = require('@mui/material');
const Footer = require('./components/Footer.js').default;
const { Logo } = require('./components/header/index.js');

class PrerenderProduct extends React.Component {
  render() {
    const { productData } = this.props;
   
    if (!productData) {
      return React.createElement(
        Container,
        { maxWidth: 'lg', sx: { py: 4 } },
        React.createElement(
          Typography,
          { variant: 'h4', component: 'h1', gutterBottom: true },
          'Product not found'
        )
      );
    }

    const product = productData.product;
    const attributes = productData.attributes || [];
    const mainImage = product.pictureList && product.pictureList.trim() 
      ? `/assets/images/prod${product.pictureList.split(',')[0].trim()}.jpg`
      : '/assets/images/nopicture.jpg';

    // JSON-LD structured data for SEO
    const priceValidDate = new Date();
    priceValidDate.setMonth(priceValidDate.getMonth() + 3);
    
    const jsonLd = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": [
        `https://seedheads.de${mainImage}`
      ],
      "description": product.description ? product.description.replace(/<[^>]*>/g, '') : product.name,
      "sku": product.articleNumber,
      "brand": {
        "@type": "Brand",
        "name": product.manufacturer || "Unknown"
      },
      "offers": {
        "@type": "Offer",
        "url": `https://seedheads.de/product/${product.articleNumber}`,
        "priceCurrency": "EUR",
        "price": product.price.toString(),
        "priceValidUntil": priceValidDate.toISOString().split('T')[0],
        "itemCondition": "https://schema.org/NewCondition",
        "availability": product.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "SeedHeads"
        }
      }
    };

    return React.createElement(
      Box,
      {
        sx: {
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          mb: 0,
          pb: 0,
          bgcolor: 'background.default'
        }
      },
      // JSON-LD structured data script
      React.createElement(
        'script',
        {
          type: 'application/ld+json',
          dangerouslySetInnerHTML: { __html: JSON.stringify(jsonLd) }
        }
      ),
      React.createElement(
        AppBar,
        { position: 'sticky', color: 'primary', elevation: 0, sx: { zIndex: 1100 } },
        React.createElement(
          Toolbar,
          { sx: { minHeight: 64 } },
          React.createElement(
            Container,
            { maxWidth: 'lg', sx: { display: 'flex', alignItems: 'center' } },
            React.createElement(Logo)
          )
        )
      ),
      React.createElement(
        Container,
        { maxWidth: 'lg', sx: { py: 4, flexGrow: 1 } },
        React.createElement(
          Grid,
          { container: true, spacing: 4 },
        // Product Image
        React.createElement(
          Grid,
          { item: true, xs: 12, md: 6 },
          React.createElement(
            Card,
            { sx: { height: '100%' } },
            React.createElement(
              CardMedia,
              {
                component: 'img',
                height: '400',
                image: mainImage,
                alt: product.name,
                sx: { objectFit: 'contain', p: 2 }
              }
            )
          )
        ),
        // Product Details
        React.createElement(
          Grid,
          { item: true, xs: 12, md: 6 },
          React.createElement(
            Stack,
            { spacing: 3 },
            React.createElement(
              Typography,
              { variant: 'h3', component: 'h1', gutterBottom: true },
              product.name
            ),
            React.createElement(
              Typography,
              { variant: 'h6', color: 'text.secondary' },
              `Art.-Nr.: ${product.articleNumber}`
            ),
            React.createElement(
              Box,
              { sx: { mt: 1 } },
              React.createElement(
                Typography,
                { variant: 'h4', color: 'primary', fontWeight: 'bold' },
                new Intl.NumberFormat('de-DE', { 
                  style: 'currency', 
                  currency: 'EUR' 
                }).format(product.price)
              ),
              product.vat && React.createElement(
                Typography,
                { variant: 'body2', color: 'text.secondary' },
                `inkl. ${product.vat}% MwSt.`
              ),
              React.createElement(
                Typography,
                { 
                  variant: 'body1', 
                  color: product.available ? 'success.main' : 'error.main',
                  fontWeight: 'medium',
                  sx: { mt: 1 }
                },
                product.available ? '✅ Verfügbar' : '❌ Nicht verfügbar'
              )
            ),
            product.description && React.createElement(
              Box,
              { sx: { mt: 2 } },
              React.createElement(
                Typography,
                { variant: 'h6', gutterBottom: true },
                'Beschreibung'
              ),
              React.createElement(
                'div',
                { 
                  dangerouslySetInnerHTML: { __html: product.description },
                  style: { 
                    fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
                    fontSize: '1rem',
                    lineHeight: '1.5',
                    color: '#33691E'
                  }
                }
              )
            ),
            // Product specifications
            React.createElement(
              Box,
              { sx: { mt: 2 } },
              React.createElement(
                Typography,
                { variant: 'h6', gutterBottom: true },
                'Produktdetails'
              ),
              React.createElement(
                Stack,
                { direction: 'row', spacing: 1, flexWrap: 'wrap', gap: 1 },
                product.manufacturer && React.createElement(
                  Chip,
                  { label: `Hersteller: ${product.manufacturer}`, variant: 'outlined' }
                ),
                product.weight && product.weight > 0 && React.createElement(
                  Chip,
                  { label: `Gewicht: ${product.weight} kg`, variant: 'outlined' }
                ),
                ...attributes.map((attr, index) => 
                  React.createElement(
                    Chip,
                    { 
                      key: index,
                      label: `${attr.cName}: ${attr.cWert}`, 
                      variant: 'outlined',
                      color: 'primary'
                    }
                  )
                )
              )
            )
          )
        )
        )
      ),
      React.createElement(Footer)
    );
  }
}

module.exports = { default: PrerenderProduct }; 