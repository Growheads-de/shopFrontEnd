import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Chip,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PaletteIcon from '@mui/icons-material/Palette';

const ThemeCustomizerDialog = ({ open, onClose, theme, onThemeChange }) => {
  const [localTheme, setLocalTheme] = useState(theme);

  // @note Theme customizer for development - allows real-time theme changes
  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  const handleColorChange = (path, value) => {
    const pathArray = path.split('.');
    const newTheme = { ...localTheme };
    let current = newTheme;
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]];
    }
    current[pathArray[pathArray.length - 1]] = value;
    
    setLocalTheme(newTheme);
    onThemeChange(newTheme);
  };



  const resetTheme = () => {
    const defaultTheme = {
      palette: {
        mode: 'light',
        primary: {
          main: '#2E7D32',
          light: '#4CAF50',
          dark: '#1B5E20',
        },
        secondary: {
          main: '#81C784',
          light: '#A5D6A7',
          dark: '#66BB6A',
        },
        background: {
          default: '#C8E6C9',
          paper: '#ffffff',
        },
        text: {
          primary: '#33691E',
          secondary: '#558B2F',
        },
        success: {
          main: '#43A047',
        },
        error: {
          main: '#D32F2F',
        },
      },
      typography: {
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        h4: {
          fontWeight: 600,
          color: '#33691E',
        },
      },
    };
    setLocalTheme(defaultTheme);
    onThemeChange(defaultTheme);
  };

  const ColorPicker = ({ label, path, value }) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          type="color"
          value={value}
          onChange={(e) => handleColorChange(path, e.target.value)}
          sx={{ width: 50, height: 35 }}
        />
        <TextField
          value={value}
          onChange={(e) => handleColorChange(path, e.target.value)}
          size="small"
          sx={{ flex: 1, fontSize: '0.75rem' }}
        />
      </Box>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PaletteIcon />
        Theme Customizer (Development Mode)
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Chip 
            label="DEV ONLY" 
            color="warning" 
            size="small" 
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            This tool is only available in development mode for theme customization.
          </Typography>
        </Box>



        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Primary Colors</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <ColorPicker 
                  label="Main" 
                  path="palette.primary.main" 
                  value={localTheme.palette.primary.main} 
                />
              </Grid>
              <Grid item xs={4}>
                <ColorPicker 
                  label="Light" 
                  path="palette.primary.light" 
                  value={localTheme.palette.primary.light} 
                />
              </Grid>
              <Grid item xs={4}>
                <ColorPicker 
                  label="Dark" 
                  path="palette.primary.dark" 
                  value={localTheme.palette.primary.dark} 
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Secondary Colors</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <ColorPicker 
                  label="Main" 
                  path="palette.secondary.main" 
                  value={localTheme.palette.secondary.main} 
                />
              </Grid>
              <Grid item xs={4}>
                <ColorPicker 
                  label="Light" 
                  path="palette.secondary.light" 
                  value={localTheme.palette.secondary.light} 
                />
              </Grid>
              <Grid item xs={4}>
                <ColorPicker 
                  label="Dark" 
                  path="palette.secondary.dark" 
                  value={localTheme.palette.secondary.dark} 
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Background & Text</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <ColorPicker 
                  label="Background" 
                  path="palette.background.default" 
                  value={localTheme.palette.background.default} 
                />
                <ColorPicker 
                  label="Paper" 
                  path="palette.background.paper" 
                  value={localTheme.palette.background.paper} 
                />
              </Grid>
              <Grid item xs={6}>
                <ColorPicker 
                  label="Text Primary" 
                  path="palette.text.primary" 
                  value={localTheme.palette.text.primary} 
                />
                <ColorPicker 
                  label="Text Secondary" 
                  path="palette.text.secondary" 
                  value={localTheme.palette.text.secondary} 
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Status Colors</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <ColorPicker 
                  label="Success" 
                  path="palette.success.main" 
                  value={localTheme.palette.success.main} 
                />
              </Grid>
              <Grid item xs={6}>
                <ColorPicker 
                  label="Error" 
                  path="palette.error.main" 
                  value={localTheme.palette.error.main} 
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      <DialogActions>
        <Button onClick={resetTheme} color="warning">
          Reset to Default
        </Button>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ThemeCustomizerDialog; 