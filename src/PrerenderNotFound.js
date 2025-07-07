const React = require('react');
const { 
  Box, 
  AppBar, 
  Toolbar, 
  Container 
} = require('@mui/material');
const Footer = require('./components/Footer.js').default;
const { Logo } = require('./components/header/index.js');
const NotFound404 = require('./pages/NotFound404.js').default;

class PrerenderNotFound extends React.Component {
  render() {
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
      React.createElement(
        AppBar,
        { position: 'sticky', color: 'primary', elevation: 0, sx: { zIndex: 1100 } },
        React.createElement(
          Toolbar,
          { sx: { minHeight: 64, py: { xs: 0.5, sm: 0 } } },
          React.createElement(
            Container,
            { 
              maxWidth: 'lg', 
              sx: { 
                display: 'flex', 
                alignItems: 'center',
                px: { xs: 0, sm: 3 }
              } 
            },
            React.createElement(
              Box,
              { sx: { 
                  display: 'flex', 
                  alignItems: 'center', 
                  width: '100%',
                  flexDirection: { xs: 'column', sm: 'row' }
                } 
              },
              React.createElement(
                Box,
                { sx: { 
                    display: 'flex', 
                    alignItems: 'center', 
                    width: '100%',
                    justifyContent: { xs: 'space-between', sm: 'flex-start' },
                    minHeight: { xs: 52, sm: 'auto' },
                    px: { xs: 0, sm: 0 }
                  } 
                },
                React.createElement(Logo)
              ),
              // Reserve space for SearchBar on mobile (invisible placeholder)
              React.createElement(
                Box,
                { sx: { 
                    display: { xs: 'block', sm: 'none' }, 
                    width: '100%',
                    mt: { xs: 1, sm: 0 },
                    mb: { xs: 0.5, sm: 0 },
                    px: { xs: 0, sm: 0 },
                    height: 40, // Reserve space for SearchBar
                    opacity: 0 // Invisible placeholder
                  } 
                }
              )
            )
          )
        )
      ),
      React.createElement(
        Box,
        { sx: { flexGrow: 1 } },
        React.createElement(NotFound404)
      ),
      React.createElement(Footer)
    );
  }
}

module.exports = { default: PrerenderNotFound }; 