import React from 'react';
import { 
  useLocation, 
  useNavigate, 
  useParams,
} from 'react-router-dom';

// HOC to provide router props to class components
export function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    
    return (
      <Component
        {...props}
        location={location}
        navigate={navigate}
        params={params}
      />
    );
  }

  return ComponentWithRouterProp;
} 