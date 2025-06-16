import React, { Component } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Container,
  Box
} from '@mui/material';

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
    const socket = this.context;
    const { isHomePage, isProfilePage } = this.props;

    return (
      <AppBar position="sticky" color="primary" elevation={0} sx={{ zIndex: 1100 }}>
        <Toolbar sx={{ minHeight: 64 }}>
          <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center' }}>
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
                justifyContent: { xs: 'space-between', sm: 'flex-start' }
              }}>
                <Logo />
                {/* SearchBar visible on sm and up */}
                <Box sx={{ display: { xs: 'none', sm: 'block' }, flexGrow: 1 }}>
                  <SearchBar />
                </Box>
                <ButtonGroupWithRouter socket={socket}/>
              </Box>
              
              {/* Second row: SearchBar only on xs */}
              <Box sx={{ 
                display: { xs: 'block', sm: 'none' }, 
                width: '100%',
                mt: 1,mb: 1
              }}>
                <SearchBar />
              </Box>
            </Box>
          </Container>
        </Toolbar>
        {(isHomePage || this.props.categoryId || isProfilePage) && <CategoryList categoryId={209} activeCategoryId={this.props.categoryId} socket={socket} />}
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
      {socket => <Header {...props} socket={socket} isHomePage={isHomePage} isProfilePage={isProfilePage} />}
    </SocketContext.Consumer>
  );
};

export default HeaderWithContext; 