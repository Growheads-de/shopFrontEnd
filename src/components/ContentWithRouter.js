import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import SocketContext from '../contexts/SocketContext.js';
import Content from './Content.js';
import { withRouter } from './withRouter.js';

// Helper function to get query parameters
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

// Apply router props to Content component
const ContentWithRouterProps = withRouter(Content);

// Wrapper component to convert class component to function component with hooks
const ContentWithRouter = () => {
  const location = useLocation();
  const params = useParams();
  const query = useQuery();
  
  const searchQuery = query.get('q');
  const categoryId = params.categoryId;
  
  // Debug URL parameters
  console.log('ContentWithRouter location:', location);
  console.log('URL params:', { searchQuery, categoryId });
  
  return (
    <SocketContext.Consumer>
      {socket => (
        <ContentWithRouterProps 
          searchQuery={searchQuery} 
          categoryId={categoryId}
          socket={socket}
        />
      )}
    </SocketContext.Consumer>
  );
};

export default ContentWithRouter; 