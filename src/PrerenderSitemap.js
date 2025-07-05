const React = require('react');
const { 
  Box, 
  AppBar, 
  Toolbar, 
  Container,
  Typography,
  List,
  ListItem,
  ListItemText
} = require('@mui/material');
const Footer = require('./components/Footer.js').default;
const { Logo, CategoryList } = require('./components/header/index.js');
const LegalPage = require('./pages/LegalPage.js').default;

const PrerenderSitemap = ({ categoryData }) => {
  // Process category data to flatten the hierarchy
  const collectAllCategories = (categoryNode, categories = [], level = 0) => {
    if (!categoryNode) return categories;
    
    // Add current category (skip root category 209)
    if (categoryNode.id !== 209 && categoryNode.seoName) {
      categories.push({
        id: categoryNode.id,
        name: categoryNode.name,
        seoName: categoryNode.seoName,
        level: level
      });
    }
    
    // Recursively add children
    if (categoryNode.children) {
      for (const child of categoryNode.children) {
        collectAllCategories(child, categories, level + 1);
      }
    }
    
    return categories;
  };

  const categories = categoryData ? collectAllCategories(categoryData) : [];

  const sitemapLinks = [
    { title: 'Startseite', url: '/' },
    { title: 'Mein Profil', url: '/profile' },
    { title: 'Datenschutz', url: '/datenschutz' },
    { title: 'AGB', url: '/agb' },
    { title: 'Impressum', url: '/impressum' },
    { title: 'Batteriegesetzhinweise', url: '/batteriegesetzhinweise' },
    { title: 'Widerrufsrecht', url: '/widerrufsrecht' },
    { title: 'Growbox Konfigurator', url: '/Konfigurator' },
    { title: 'API', url: '/api/', route: false },
  ];

  const content = React.createElement(
    React.Fragment,
    null,
    React.createElement(
      Typography,
      { variant: 'body1', paragraph: true },
      'Hier finden Sie eine Übersicht aller verfügbaren Seiten unserer Website.'
    ),
    
    // Static site links
    React.createElement(
      Typography,
      { variant: 'h6', sx: { mt: 3, mb: 2, fontWeight: 'bold' } },
      'Seiten'
    ),
    React.createElement(
      List,
      null,
      sitemapLinks.map((link) => 
        React.createElement(
          ListItem,
          { 
            key: link.url,
            button: true,
            component: link.route === false ? 'a' : 'a',
            href: link.url,
            sx: { 
              py: 1,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }
          },
          React.createElement(ListItemText, { primary: link.title })
        )
      )
    ),

    // Category links
    React.createElement(
      Typography,
      { variant: 'h6', sx: { mt: 4, mb: 2, fontWeight: 'bold' } },
      'Kategorien'
    ),
    React.createElement(
      List,
      null,
      categories.map((category) => 
        React.createElement(
          ListItem,
          { 
            key: category.id,
            button: true,
            component: 'a',
            href: `/Kategorie/${category.seoName}`,
            sx: { 
              py: 1,
              pl: 2 + (category.level * 2), // Indent based on category level
              borderBottom: '1px solid',
              borderColor: 'divider'
            }
          },
          React.createElement(
            ListItemText,
            { 
              primary: category.name,
              sx: {
                '& .MuiTypography-root': {
                  fontSize: category.level === 0 ? '1rem' : '0.9rem',
                  fontWeight: category.level === 0 ? 'bold' : 'normal',
                  color: category.level === 0 ? 'primary.main' : 'text.primary'
                }
              }
            }
          )
        )
      )
    )
  );

  return React.createElement(LegalPage, { title: 'Sitemap', content: content });
};

module.exports = { default: PrerenderSitemap }; 