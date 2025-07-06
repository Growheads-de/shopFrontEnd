const React = require('react');
const { 
  Box, 
  AppBar, 
  Toolbar, 
  Container 
} = require('@mui/material');
const Footer = require('./components/Footer.js').default;
const { Logo, CategoryList } = require('./components/header/index.js');
const MainPageLayout = require('./components/MainPageLayout.js').default;

class PrerenderHome extends React.Component {
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
          { sx: { minHeight: 64 } },
          React.createElement(
            Container,
            { maxWidth: 'lg', sx: { display: 'flex', alignItems: 'center' } },
            React.createElement(
              Box,
              { 
                sx: { 
                  display: 'flex', 
                  alignItems: 'center', 
                  width: '100%',
                  flexDirection: { xs: 'column', sm: 'row' }
                }
              },
              React.createElement(
                Box,
                { 
                  sx: { 
                    display: 'flex', 
                    alignItems: 'center', 
                    width: '100%',
                    justifyContent: { xs: 'space-between', sm: 'flex-start' }
                  }
                },
                React.createElement(Logo)
              )
            )
          )
        ),
        React.createElement(CategoryList, { categoryId: 209, activeCategoryId: null })
      ),
      React.createElement(
        Box,
        { sx: { flexGrow: 1 } },
        React.createElement(MainPageLayout)
      ),
      React.createElement(Footer)
    );
  }
}

module.exports = { default: PrerenderHome }; 