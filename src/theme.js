import { createTheme } from '@mui/material/styles';

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
      default: '#C8E6C9', // Darker green background
      paper: '#ffffff', // Darker gray
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

export default theme; 