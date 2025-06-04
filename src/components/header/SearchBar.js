import React from 'react';
import { Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate, useLocation } from 'react-router-dom';

const SearchBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get('q') || '');
  const debounceTimerRef = React.useRef(null);
  const isFirstKeystrokeRef = React.useRef(true);

  const handleSearch = (e) => {
    e.preventDefault();
    delete window.currentSearchQuery;
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const updateSearchState = (value) => {
    setSearchQuery(value);
    
    // Dispatch global custom event with search query value
    const searchEvent = new CustomEvent('search-query-change', { 
      detail: { query: value } 
    });
    // Store the current search query in the window object
    window.currentSearchQuery = value;
    window.dispatchEvent(searchEvent);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    
    // Always update the input field immediately for responsiveness
    setSearchQuery(value);
    
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set the debounce timer with appropriate delay
    const delay = isFirstKeystrokeRef.current ? 100 : 200;
    
    debounceTimerRef.current = setTimeout(() => {
      updateSearchState(value);
      isFirstKeystrokeRef.current = false;
      
      // Reset first keystroke flag after 1 second of inactivity
      debounceTimerRef.current = setTimeout(() => {
        isFirstKeystrokeRef.current = true;
      }, 1000);
    }, delay);
  };

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <Box 
      component="form" 
      onSubmit={handleSearch}
      sx={{ flexGrow: 1, mx: { xs: 1, sm: 2, md: 4 } }}
    >
      <TextField
        placeholder="Produkte suchen..."
        variant="outlined"
        size="small"
        fullWidth
        value={searchQuery}
        onChange={handleSearchChange}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          sx: { borderRadius: 2, bgcolor: 'background.paper' }
        }}
      />
    </Box>
  );
}

export default SearchBar; 