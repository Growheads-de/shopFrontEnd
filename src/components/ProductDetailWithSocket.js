import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SocketContext from '../contexts/SocketContext.js';
import ProductDetailPage from './ProductDetailPage.js';

// Wrapper component for individual product detail page with socket
const ProductDetailWithSocket = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SocketContext.Consumer>
      {socket => <ProductDetailPage productId={productId} navigate={navigate} location={location} socket={socket} />}
    </SocketContext.Consumer>
  );
};

export default ProductDetailWithSocket; 