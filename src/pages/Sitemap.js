import React, { useState, useEffect, useContext } from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Link as RouterLink } from 'react-router-dom';
import LegalPage from './LegalPage.js';
import SocketContext from '../contexts/SocketContext.js';

// Helper function to recursively collect all categories from the tree
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

const Sitemap = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const {socket} = useContext(SocketContext);


  const sitemapLinks = [
    { title: 'Startseite', url: '/' },
    { title: 'Mein Profil', url: '/profile' },
    { title: 'Datenschutz', url: '/datenschutz' },
    { title: 'AGB', url: '/agb' },
    { title: 'Impressum', url: '/impressum' },
    { title: 'Batteriegesetzhinweise', url: '/batteriegesetzhinweise' },
    { title: 'Widerrufsrecht', url: '/widerrufsrecht' },
    { title: 'Growbox Konfigurator', url: '/Konfigurator' },
    { title: 'API', url: '/api/', route:false },
  ];

  useEffect(() => {
    const fetchCategories = () => {
      // Try cache first
      if (window.productCache && window.productCache['categoryTree_209']) {
        const cached = window.productCache['categoryTree_209'];
        const cacheAge = Date.now() - cached.timestamp;
        const tenMinutes = 10 * 60 * 1000;
        if (cacheAge < tenMinutes && cached.categoryTree) {
          const allCategories = collectAllCategories(cached.categoryTree);
          setCategories(allCategories);
          setLoading(false);
          return;
        }
      }

      // Otherwise, fetch from socket if available
      if (socket) {
        socket.emit('categoryList', { categoryId: 209 }, (response) => {
          if (response && response.categoryTree) {
            // Store in cache
            try {
              if (!window.productCache) window.productCache = {};
              window.productCache['categoryTree_209'] = {
                categoryTree: response.categoryTree,
                timestamp: Date.now()
              };
            } catch (err) {
              console.error('Error caching category data:', err);
            }
            
            const allCategories = collectAllCategories(response.categoryTree);
            setCategories(allCategories);
            setLoading(false);
          } else {
            console.error('Failed to fetch categories');
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [socket]);

  const content = (
    <>
      <Typography variant="body1" paragraph>
        Hier finden Sie eine Übersicht aller verfügbaren Seiten unserer Website.
      </Typography>
      
      {/* @note Static site links */}
      <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
        Seiten
      </Typography>
      <List>
        {sitemapLinks.map((link) => (
          <ListItem 
            button 
            component={link.route === false ? 'a' : RouterLink}
            {...(link.route === false ? { href: link.url } : { to: link.url })}
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

      {/* @note Category links */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}>
        Kategorien
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {categories.map((category) => (
            <ListItem 
              button 
              component={RouterLink} 
              to={`/Kategorie/${category.seoName}`}
              key={category.id}
              sx={{ 
                py: 1,
                pl: 2 + (category.level * 2), // Indent based on category level
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <ListItemText 
                primary={category.name}
                sx={{
                  '& .MuiTypography-root': {
                    fontSize: category.level === 0 ? '1rem' : '0.9rem',
                    fontWeight: category.level === 0 ? 'bold' : 'normal',
                    color: category.level === 0 ? 'primary.main' : 'text.primary'
                  }
                }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </>
  );

  return <LegalPage title="Sitemap" content={content} />;
};

export default Sitemap; 