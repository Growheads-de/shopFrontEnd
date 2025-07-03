import React, { useState, useEffect, useContext } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { Link } from 'react-router-dom';
import SocketContext from '../contexts/SocketContext.js';

// @note SwashingtonCP font is now loaded globally via index.css

// Initialize cache in window object if it doesn't exist
if (typeof window !== 'undefined' && !window.categoryImageCache) {
  window.categoryImageCache = new Map();
}

const CategoryBox = ({ 
  id, 
  name, 
  seoName,
  bgcolor, 
  fontSize = '0.8rem',
  ...props 
}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(SocketContext);

  useEffect(() => {
    let objectUrl = null;
    
    // Skip image loading entirely if prerender fallback is active
    // @note Check both browser and SSR environments for prerender flag
    const isPrerenderFallback = (typeof window !== 'undefined' && window.__PRERENDER_FALLBACK__) ||
                               (typeof global !== 'undefined' && global.window && global.window.__PRERENDER_FALLBACK__);
    
    if (isPrerenderFallback) {
      return;
    }
    
    // Check if we have the image data cached first
    if (typeof window !== 'undefined' && window.categoryImageCache.has(id)) {
      const cachedImageData = window.categoryImageCache.get(id);
      if (cachedImageData === null) {
        // @note Cached as null - this category has no image
        setImageUrl(null);
        setImageError(false);
      } else {
        // Create fresh blob URL from cached binary data
        try {
          const uint8Array = new Uint8Array(cachedImageData);
          const blob = new Blob([uint8Array], { type: 'image/jpeg' });
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
          setImageError(false);
        } catch (error) {
          console.error('Error creating blob URL from cached data:', error);
          setImageError(true);
          setImageUrl(null);
        }
      }
      return;
    }

    // If socket is available and connected, fetch the image
    if (context && context.socket && context.socket.connected && id && !isLoading) {
      setIsLoading(true);
      
      context.socket.emit('getCategoryPic', { categoryId: id }, (response) => {
        setIsLoading(false);
        
        if (response.success) {
          const imageData = response.image; // Binary image data or null
          
          if (imageData) {
            try {
              // Convert binary data to blob URL
              const uint8Array = new Uint8Array(imageData);
              const blob = new Blob([uint8Array], { type: 'image/jpeg' });
              objectUrl = URL.createObjectURL(blob);
              setImageUrl(objectUrl);
              setImageError(false);
              
              // @note Cache the raw binary data in window object (not the blob URL)
              if (typeof window !== 'undefined') {
                window.categoryImageCache.set(id, imageData);
              }
            } catch (error) {
              console.error('Error converting image data to URL:', error);
              setImageError(true);
              setImageUrl(null);
              // Cache as null to avoid repeated requests
              if (typeof window !== 'undefined') {
                window.categoryImageCache.set(id, null);
              }
            }
          } else {
            // @note No image available for this category
            setImageUrl(null);
            setImageError(false);
            // Cache as null so we don't keep requesting
            if (typeof window !== 'undefined') {
              window.categoryImageCache.set(id, null);
            }
          }
        } else {
          console.error('Error fetching category image:', response.error);
          setImageError(true);
          setImageUrl(null);
          // Cache as null to avoid repeated failed requests
          if (typeof window !== 'undefined') {
            window.categoryImageCache.set(id, null);
          }
        }
      });
    }
    
    // Clean up the object URL when component unmounts or image changes
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [context, context?.socket?.connected, id, isLoading]);

  return (
    <Paper
      component={Link}
      to={`/Kategorie/${seoName}`}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: '8px',
        overflow: 'hidden',
        width: '130px',
        height: '130px',
        minHeight: '130px',
        minWidth: '130px',
        maxWidth: '130px',
        maxHeight: '130px',
        display: 'block',
        position: 'relative',
        zIndex: 10,
        backgroundColor: bgcolor || '#f0f0f0',
        boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)'
      }}
      sx={{
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 8
        },
        ...props.sx
      }}
      {...props}
    >
      {/* Main content area - using flex to fill space */}
      <Box sx={{
        width: '130px',
        height: '130px',
        bgcolor: bgcolor || '#e0e0e0',
        position: 'relative',
        backgroundImage: ((typeof window !== 'undefined' && window.__PRERENDER_FALLBACK__) ||
                          (typeof global !== 'undefined' && global.window && global.window.__PRERENDER_FALLBACK__))
          ? `url("/assets/images/cat${id}.jpg")` 
          : (imageUrl && !imageError ? `url("${imageUrl}")` : 'none'),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        
        {/* Category name at bottom */}
        <div style={{
          position: 'absolute',
          bottom: '0px',
          left: '0px',
          width: '130px',
          height: '40px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'table',
          tableLayout: 'fixed'
        }}>
          <div style={{
            display: 'table-cell',
            textAlign: 'center',
            verticalAlign: 'middle',
            color: 'white',
            fontSize: fontSize,
            fontFamily: 'SwashingtonCP, "Times New Roman", Georgia, serif',
            fontWeight: 'normal',
            lineHeight: '1.2',
            padding: '0 8px'
          }}>
            {name}
          </div>
        </div>
      
        
      </Box>
    </Paper>
  );
};

export default CategoryBox;