import React from 'react';
import { Typography, List, ListItem, ListItemText } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LegalPage from './LegalPage.js';

const Sitemap = () => {
  const sitemapLinks = [
    { title: 'Startseite', url: '/' },
    { title: 'Samen', url: '/category/689' },
    { title: 'Stecklinge', url: '/category/706' },
    { title: 'Mein Profil', url: '/profile' },
    { title: 'Datenschutz', url: '/datenschutz' },
    { title: 'AGB', url: '/agb' },
    { title: 'Impressum', url: '/impressum' },
    { title: 'Batteriegesetzhinweise', url: '/batteriegesetzhinweise' },
    { title: 'Widerrufsrecht', url: '/widerrufsrecht' },
  ];

  const content = (
    <>
      <Typography variant="body1" paragraph>
        Hier finden Sie eine Übersicht aller verfügbaren Seiten unserer Website.
      </Typography>
      
      <List>
        {sitemapLinks.map((link) => (
          <ListItem 
            button 
            component={RouterLink} 
            to={link.url}
            key={link.url}
            sx={{ 
              py: 1,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <ListItemText primary={link.title} />
          </ListItem>
        ))}
      </List>
    </>
  );

  return <LegalPage title="Sitemap" content={content} />;
};

export default Sitemap; 