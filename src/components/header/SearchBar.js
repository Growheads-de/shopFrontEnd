import React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate, useLocation } from "react-router-dom";
import SocketContext from "../../contexts/SocketContext.js";

const SearchBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {socket} = React.useContext(SocketContext);
  const searchParams = new URLSearchParams(location.search);

  // State management
  const [searchQuery, setSearchQuery] = React.useState(
    searchParams.get("q") || ""
  );
  const [suggestions, setSuggestions] = React.useState([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState(false);

  // Refs for debouncing and timers
  const debounceTimerRef = React.useRef(null);
  const autocompleteTimerRef = React.useRef(null);
  const isFirstKeystrokeRef = React.useRef(true);
  const inputRef = React.useRef(null);
  const suggestionBoxRef = React.useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    delete window.currentSearchQuery;
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const updateSearchState = (value) => {
    setSearchQuery(value);

    // Dispatch global custom event with search query value
    const searchEvent = new CustomEvent("search-query-change", {
      detail: { query: value },
    });
    // Store the current search query in the window object
    window.currentSearchQuery = value;
    window.dispatchEvent(searchEvent);
  };

  // @note Autocomplete function using getSearchProducts Socket.io API - returns objects with name and seoName
  const fetchAutocomplete = React.useCallback(
    (query) => {
      if (!socket || !query || query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        setLoadingSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);

      socket.emit(
        "getSearchProducts",
        {
          query: query.trim(),
          limit: 8,
        },
        (response) => {
          setLoadingSuggestions(false);

          if (response && response.products) {
            // getSearchProducts returns response.products array
            const suggestions = response.products.slice(0, 8); // Limit to 8 suggestions
            setSuggestions(suggestions);
            setShowSuggestions(suggestions.length > 0);
            setSelectedIndex(-1); // Reset selection
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
            console.log("getSearchProducts failed or no products:", response);
          }
        }
      );
    },
    [socket]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;

    // Always update the input field immediately for responsiveness
    setSearchQuery(value);

    // Clear any existing timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (autocompleteTimerRef.current) {
      clearTimeout(autocompleteTimerRef.current);
    }

    // Set the debounce timer for search state update
    const delay = isFirstKeystrokeRef.current ? 100 : 200;

    debounceTimerRef.current = setTimeout(() => {
      updateSearchState(value);
      isFirstKeystrokeRef.current = false;

      // Reset first keystroke flag after 1 second of inactivity
      debounceTimerRef.current = setTimeout(() => {
        isFirstKeystrokeRef.current = true;
      }, 1000);
    }, delay);

    // Set autocomplete timer with longer delay to reduce API calls
    autocompleteTimerRef.current = setTimeout(() => {
      fetchAutocomplete(value);
    }, 300);
  };

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selectedSuggestion = suggestions[selectedIndex];
          setSearchQuery(selectedSuggestion.name);
          updateSearchState(selectedSuggestion.name);
          setShowSuggestions(false);
          navigate(`/Artikel/${selectedSuggestion.seoName}`);
        } else {
          handleSearch(e);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle suggestion click - navigate to product page directly
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.name);
    updateSearchState(suggestion.name);
    setShowSuggestions(false);
    navigate(`/Artikel/${suggestion.seoName}`);
  };

  // Handle input focus
  const handleFocus = () => {
    if (suggestions.length > 0 && searchQuery.length >= 2) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur with delay to allow suggestion clicks
  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  // Clean up timers on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (autocompleteTimerRef.current) {
        clearTimeout(autocompleteTimerRef.current);
      }
    };
  }, []);

  // Close suggestions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Box
      component="form"
      onSubmit={handleSearch}
      sx={{
        flexGrow: 1,
        mx: { xs: 1, sm: 2, md: 4 },
        position: "relative",
      }}
    >
      <TextField
        ref={inputRef}
        placeholder="Produkte suchen..."
        variant="outlined"
        size="small"
        fullWidth
        value={searchQuery}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
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
          endAdornment: loadingSuggestions && (
            <InputAdornment position="end">
              <CircularProgress size={16} />
            </InputAdornment>
          ),
          sx: { borderRadius: 2, bgcolor: "background.paper" },
        }}
      />

      {/* Autocomplete Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Paper
          ref={suggestionBoxRef}
          elevation={4}
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: "300px",
            overflow: "auto",
            mt: 0.5,
            borderRadius: 2,
          }}
        >
          <List disablePadding>
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={suggestion.seoName || index}
                button
                selected={index === selectedIndex}
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "action.selected",
                    "&:hover": {
                      backgroundColor: "action.selected",
                    },
                  },
                  py: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" noWrap>
                      {suggestion.name}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar;
