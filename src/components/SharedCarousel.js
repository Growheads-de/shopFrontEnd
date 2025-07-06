import React, { useContext, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import CategoryBox from "./CategoryBox.js";
import SocketContext from "../contexts/SocketContext.js";
import { useCarousel } from "../contexts/CarouselContext.js";

// Helper to process and set categories
const processCategoryTree = (categoryTree) => {
  if (
    categoryTree &&
    categoryTree.id === 209 &&
    Array.isArray(categoryTree.children)
  ) {
    return categoryTree.children;
  } else {
    return [];
  }
};

// Check for cached data
const getProductCache = () => {
  if (typeof window !== "undefined" && window.productCache) {
    return window.productCache;
  }
  if (
    typeof global !== "undefined" &&
    global.window &&
    global.window.productCache
  ) {
    return global.window.productCache;
  }
  return null;
};

// Initialize categories
const initializeCategories = () => {
  const productCache = getProductCache();

  if (productCache && productCache["categoryTree_209"]) {
    const cached = productCache["categoryTree_209"];
    if (cached.categoryTree) {
      return processCategoryTree(cached.categoryTree);
    }
  }
  return [];
};

const SharedCarousel = () => {
  const { carouselRef, filteredCategories, setFilteredCategories, moveCarousel } = useCarousel();
  const context = useContext(SocketContext);
  const [rootCategories, setRootCategories] = useState([]);

  useEffect(() => {
    const initialCategories = initializeCategories();
    setRootCategories(initialCategories);
  }, []);

  useEffect(() => {
    // Only fetch from socket if we don't already have categories
    if (
      rootCategories.length === 0 &&
      context && context.socket && context.socket.connected &&
      typeof window !== "undefined"
    ) {
      context.socket.emit("categoryList", { categoryId: 209 }, (response) => {
        if (response && response.categoryTree) {
          // Store in cache
          try {
            if (!window.productCache) window.productCache = {};
            window.productCache["categoryTree_209"] = {
              categoryTree: response.categoryTree,
              timestamp: Date.now(),
            };
          } catch (err) {
            console.error(err);
          }
          setRootCategories(response.categoryTree.children || []);
        }
      });
    }
  }, [context, context?.socket?.connected, rootCategories.length]);

  useEffect(() => {
    const filtered = rootCategories.filter(
      (cat) => cat.id !== 689 && cat.id !== 706
    );
    setFilteredCategories(filtered);
  }, [rootCategories, setFilteredCategories]);

  // Create duplicated array for seamless scrolling
  const displayCategories = [...filteredCategories, ...filteredCategories];

  if (filteredCategories.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: 2,
          fontFamily: "SwashingtonCP",
          color: "primary.main",
          textAlign: "center",
          textShadow: "3px 3px 10px rgba(0, 0, 0, 0.4)"
        }}
      >
        Kategorien
      </Typography>

      <div 
        className="carousel-wrapper"
        style={{
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          boxSizing: 'border-box'
        }}
      >
        {/* Left Arrow */}
        <IconButton
          onClick={() => moveCarousel("left")}
          aria-label="Vorherige Kategorien anzeigen"
          style={{
            position: 'absolute',
            top: '50%',
            left: '8px',
            transform: 'translateY(-50%)',
            zIndex: 1200,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            width: '48px',
            height: '48px',
            borderRadius: '50%'
          }}
        >
          <ChevronLeft />
        </IconButton>

        {/* Right Arrow */}
        <IconButton
          onClick={() => moveCarousel("right")}
          aria-label="Nächste Kategorien anzeigen"
          style={{
            position: 'absolute',
            top: '50%',
            right: '8px',
            transform: 'translateY(-50%)',
            zIndex: 1200,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            width: '48px',
            height: '48px',
            borderRadius: '50%'
          }}
        >
          <ChevronRight />
        </IconButton>

        <div 
          className="carousel-container"
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '20px 0',
            width: '100%',
            maxWidth: '1080px',
            margin: '0 auto',
            zIndex: 1,
            boxSizing: 'border-box'
          }}
        >
          <div 
            className="home-carousel-track" 
            ref={carouselRef}
            style={{
              display: 'flex',
              gap: '16px',
              transition: 'none',
              alignItems: 'flex-start',
              width: 'fit-content',
              overflow: 'visible',
              position: 'relative',
              transform: 'translateX(0px)',
              margin: '0 auto'
            }}
          >
            {displayCategories.map((category, index) => (
              <div
                key={`${category.id}-${index}`}
                className="carousel-item"
                style={{
                  flex: '0 0 130px',
                  width: '130px',
                  maxWidth: '130px',
                  minWidth: '130px',
                  height: '130px',
                  maxHeight: '130px',
                  minHeight: '130px',
                  boxSizing: 'border-box',
                  position: 'relative'
                }}
              >
                <CategoryBox
                  id={category.id}
                  name={category.name}
                  seoName={category.seoName}
                  image={category.image}
                  bgcolor={category.bgcolor}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Box>
  );
};

export default SharedCarousel; 