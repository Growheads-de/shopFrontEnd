import React, { Component } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

import SocketContext from '../contexts/SocketContext.js';
import { useLocation } from 'react-router-dom';

// Import extracted components
import { Logo, SearchBar, ButtonGroupWithRouter, CategoryList } from './header/index.js';

// Main Header Component
class Header extends Component {
  static contextType = SocketContext;

  constructor(props) {
    super(props);
    this.state = {
      cartItems: []
    };
  }

  handleCartQuantityChange = (productId, quantity) => {
    this.setState(prevState => ({
      cartItems: prevState.cartItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    }));
  };

  handleCartRemoveItem = (productId) => {
    this.setState(prevState => ({
      cartItems: prevState.cartItems.filter(item => item.id !== productId)
    }));
  };

  render() {
    // Get socket directly from context in render method
    const {socket,socketB} = this.context;
    const { isHomePage, isProfilePage } = this.props;

    return (
      <AppBar position="sticky" color="primary" elevation={0} sx={{ zIndex: 1100 }}>
        <Toolbar sx={{ minHeight: 64, py: { xs: 0.5, sm: 0 } }}>
          <Container maxWidth="lg" sx={{ 
            display: 'flex', 
            alignItems: 'center',
            px: { xs: 0, sm: 3 }
          }}>
            {/* First row: Logo and ButtonGroup on xs, all items on larger screens */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              width: '100%',
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              {/* Top row for xs, single row for larger screens */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                width: '100%',
                justifyContent: { xs: 'space-between', sm: 'flex-start' },
                minHeight: { xs: 52, sm: 'auto' },
                px: { xs: 0, sm: 0 }
              }}>
                <Logo />
                {/* SearchBar visible on sm and up */}
                <Box sx={{ display: { xs: 'none', sm: 'block' }, flexGrow: 1 }}>
                  <SearchBar />
                </Box>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: { xs: 'flex-end', sm: 'center' },
                  transform: { xs: 'translateY(4px) translateX(9px)', sm: 'none' },
                  ml: { xs: 0, sm: 0 }
                }}>
                  <ButtonGroupWithRouter socket={socket}/>
                </Box>
              </Box>
              
              {/* Second row: SearchBar only on xs - make it wider */}
              <Box sx={{ 
                display: { xs: 'block', sm: 'none' }, 
                width: '100%',
                mt: { xs: 1, sm: 0 },
                mb: { xs: 0.5, sm: 0 },
                px: { xs: 0, sm: 0 }
              }}>
                <Box sx={{ width: '100%' }}>
                  <SearchBar />
                </Box>
              </Box>
            </Box>
          </Container>
        </Toolbar>
        {(isHomePage || this.props.categoryId || isProfilePage) && <CategoryList categoryId={209} activeCategoryId={this.props.categoryId} socket={socket} socketB={socketB} />}
      </AppBar>
    );
  }
}

// Use a wrapper function to provide context
const HeaderWithContext = (props) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isProfilePage = location.pathname === '/profile';
  
  return (
    <SocketContext.Consumer>
      {({socket,socketB}) => <Header {...props} socket={socket} socketB={socketB} isHomePage={isHomePage} isProfilePage={isProfilePage} />}
    </SocketContext.Consumer>
  );
};

export default HeaderWithContext; 