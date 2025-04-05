import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import React, { Component } from 'react';
import Header from './components/Header.js';
import Content from './components/Content.js';
import Footer from './components/Footer.js';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32', // Forest green
      light: '#4CAF50', // Regular green
      dark: '#1B5E20', // Dark green
    },
    secondary: {
      main: '#81C784', // Light green
      light: '#A5D6A7', // Very light green
      dark: '#66BB6A', // Mid green
    },
    background: {
      default: '#F1F8E9', // Very light green background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#33691E', // Dark green text
      secondary: '#558B2F', // Mid green text
    },
    success: {
      main: '#43A047', // Green success
    },
    error: {
      main: '#D32F2F', // Keep red for errors/out of stock
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 600,
      color: '#33691E',
    },
  },
});


class App extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            bgcolor: 'background.default',
          }}
        >
          <Header />
          <Content />
          <Footer />
        </Box>
      </ThemeProvider>
    );
  }
}

export default App; 