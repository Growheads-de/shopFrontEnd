import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SocketContext from '../contexts/SocketContext.js';
import ProductDetailPage from './ProductDetailPage.js';

// Wrapper component for individual product detail page with socket
const ProductDetailWithSocket = () => {
  const { seoName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SocketContext.Consumer>
      {({socket,socketB}) => <ProductDetailPage seoName={seoName} navigate={navigate} location={location} socket={socket} socketB={socketB} />}
    </SocketContext.Consumer>
  );
};

export default ProductDetailWithSocket; 