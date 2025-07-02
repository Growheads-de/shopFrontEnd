import React, { useState, useEffect, useContext, useRef } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import { Link } from "react-router-dom";
import CategoryBox from "../components/CategoryBox.js";
import SocketContext from "../contexts/SocketContext.js";
import { getCombinedAnimatedBorderStyles } from "../utils/animatedBorderStyles.js";

// @note SwashingtonCP font is now loaded globally via index.css

// Carousel styles - Simple styles for JavaScript-based animation
const carouselStyles = `
  .carousel-wrapper {
    position: relative;
    overflow: hidden;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    z-index: 1;
  }
  
  
  .carousel-wrapper .carousel-container {
    position: relative;
    overflow: hidden;
    padding: 20px 0;
    width: 100%;
    max-width: 1080px;
    margin: 0 auto;
    z-index: 1;
  }
  
  .carousel-wrapper .home-carousel-track {
    display: flex;
    gap: 16px;
    transition: none;
    align-items: flex-start;
    width: 1200px;
    max-width: 100%;
    overflow: visible;
    position: relative;
    z-index: 1;
  }
  
  .carousel-wrapper .carousel-item {
    flex: 0 0 130px;
    width: 130px !important;
    max-width: 130px;
    min-width: 130px;
    height: 130px !important;
    max-height: 130px;
    min-height: 130px;
    box-sizing: border-box;
    position: relative;
    z-index: 2;
  }
  
  .carousel-nav-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 20;
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    width: 48px;
    height: 48px;
  }
  
  .carousel-nav-button:hover {
    background-color: rgba(255, 255, 255, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  .carousel-nav-left {
    left: 8px;
  }
  
  .carousel-nav-right {
    right: 8px;
  }
`;

// Generate combined styles for both seeds and cutlings cards
const animatedBorderStyle = getCombinedAnimatedBorderStyles([
  "seeds",
  "cutlings",
]);

const Home = () => {
  const carouselRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const animationIdRef = useRef(null);
  const isPausedRef = useRef(false);
  const resumeTimeoutRef = useRef(null);
  
  // @note Initialize refs properly
  useEffect(() => {
    isPausedRef.current = false;
    scrollPositionRef.current = 0;
  }, []);
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

  // Check for cached data - handle both browser and prerender environments
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

  // Initialize rootCategories from cache if available (for prerendering)
  const initializeCategories = () => {
    const productCache = getProductCache();

    if (productCache && productCache["categoryTree_209"]) {
      const cached = productCache["categoryTree_209"];
      //const cacheAge = Date.now() - cached.timestamp;
      //const tenMinutes = 10 * 60 * 1000;
      if (/*cacheAge < tenMinutes &&*/ cached.categoryTree) {
        return processCategoryTree(cached.categoryTree);
      }
    }
    return [];
  };

  const [rootCategories, setRootCategories] = useState(() =>
    initializeCategories()
  );
  const socket = useContext(SocketContext);

  useEffect(() => {
    // Only fetch from socket if we don't already have categories and we're in browser
    if (
      rootCategories.length === 0 &&
      socket &&
      typeof window !== "undefined"
    ) {
      socket.emit("categoryList", { categoryId: 209 }, (response) => {
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
  }, [socket, rootCategories.length]);

  // Filter categories (excluding specific IDs)
  const filteredCategories = rootCategories.filter(
    (cat) => cat.id !== 689 && cat.id !== 706
  );

  // Create duplicated array for seamless scrolling
  const displayCategories = [...filteredCategories, ...filteredCategories];

  // Auto-scroll effect
  useEffect(() => {
    if (filteredCategories.length === 0) return;

    // @note Add a small delay to ensure DOM is ready after prerender
    const startAnimation = () => {
      if (!carouselRef.current) {
        return false;
      }

      // @note Reset paused state when starting animation
      isPausedRef.current = false;
      
      const itemWidth = 146; // 130px + 16px gap
      const totalWidth = filteredCategories.length * itemWidth;

      const animate = () => {
        // Check if we should be animating
        if (!animationIdRef.current || isPausedRef.current) {
          return;
        }

        scrollPositionRef.current += 0.5; // Speed of scrolling

        // Reset position for seamless loop
        if (scrollPositionRef.current >= totalWidth) {
          scrollPositionRef.current = 0;
        }

        if (carouselRef.current) {
          const transform = `translateX(-${scrollPositionRef.current}px)`;
          carouselRef.current.style.transform = transform;
        }

        animationIdRef.current = requestAnimationFrame(animate);
      };

      // Only start animation if not paused
      if (!isPausedRef.current) {
        animationIdRef.current = requestAnimationFrame(animate);
        return true;
      }
      return false;
    };

    // Try immediately, then with increasing delays to handle prerender scenarios
    if (!startAnimation()) {
      const timeout1 = setTimeout(() => {
        if (!startAnimation()) {
          const timeout2 = setTimeout(() => {
            if (!startAnimation()) {
              const timeout3 = setTimeout(startAnimation, 2000);
              return () => clearTimeout(timeout3);
            }
          }, 1000);
          return () => clearTimeout(timeout2);
        }
      }, 100);
      
      return () => {
        isPausedRef.current = true;
        clearTimeout(timeout1);
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
        if (resumeTimeoutRef.current) {
          clearTimeout(resumeTimeoutRef.current);
        }
      };
    }

    return () => {
      isPausedRef.current = true;
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, [filteredCategories]);

  // Additional effect to handle cases where categories are available but ref wasn't ready
  useEffect(() => {
    if (filteredCategories.length > 0 && carouselRef.current && !animationIdRef.current) {
      // @note Reset paused state when starting animation
      isPausedRef.current = false;
      
      const itemWidth = 146;
      const totalWidth = filteredCategories.length * itemWidth;

      const animate = () => {
        if (!animationIdRef.current || isPausedRef.current) {
          return;
        }

        scrollPositionRef.current += 0.5;

        if (scrollPositionRef.current >= totalWidth) {
          scrollPositionRef.current = 0;
        }

        if (carouselRef.current) {
          const transform = `translateX(-${scrollPositionRef.current}px)`;
          carouselRef.current.style.transform = transform;
        }

        animationIdRef.current = requestAnimationFrame(animate);
      };

      if (!isPausedRef.current) {
        animationIdRef.current = requestAnimationFrame(animate);
      }
    }
  });

  // Manual navigation
  const moveCarousel = (direction) => {
    if (!carouselRef.current) return;

    // Pause auto-scroll
    isPausedRef.current = true;
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }

    const itemWidth = 146;
    const moveAmount = itemWidth * 3; // Move 3 items at a time
    const totalWidth = filteredCategories.length * itemWidth;

    if (direction === "left") {
      scrollPositionRef.current -= moveAmount;
      // Handle wrapping for infinite scroll
      if (scrollPositionRef.current < 0) {
        scrollPositionRef.current = totalWidth + scrollPositionRef.current;
      }
    } else {
      scrollPositionRef.current += moveAmount;
      // Handle wrapping for infinite scroll
      if (scrollPositionRef.current >= totalWidth) {
        scrollPositionRef.current = scrollPositionRef.current % totalWidth;
      }
    }

    // Apply smooth transition for manual navigation
    carouselRef.current.style.transition = "transform 0.5s ease-in-out";
    carouselRef.current.style.transform = `translateX(-${scrollPositionRef.current}px)`;

    // Remove transition after animation completes
    setTimeout(() => {
      if (carouselRef.current) {
        carouselRef.current.style.transition = "none";
      }
    }, 500);

    // Clear any existing resume timeout
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }

    // Resume auto-scroll after 3 seconds
    resumeTimeoutRef.current = setTimeout(() => {
      isPausedRef.current = false;

      const animate = () => {
        if (!animationIdRef.current || isPausedRef.current) {
          return;
        }

        scrollPositionRef.current += 0.5;

        if (scrollPositionRef.current >= totalWidth) {
          scrollPositionRef.current = 0;
        }

        if (carouselRef.current) {
          carouselRef.current.style.transform = `translateX(-${scrollPositionRef.current}px)`;
        }

        animationIdRef.current = requestAnimationFrame(animate);
      };

      animationIdRef.current = requestAnimationFrame(animate);
    }, 3000);
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 2, maxWidth: '1200px !important' }}>
      {/* Inject the animated border and carousel styles */}
      <style>{animatedBorderStyle}</style>
      <style>{carouselStyles}</style>

      <Typography
          variant="h3"
          component="h1"
          sx={{
            mb: 4,
            fontFamily: "SwashingtonCP",
            color: "primary.main",
            textAlign: "center",
            textShadow: "3px 3px 10px rgba(0, 0, 0, 0.4)"       
          }}
        >
          ine annabis eeds & uttings
        </Typography>

      <Grid container sx={{ display: "flex", flexDirection: "row" }}>
        {/* Seeds Category Box */}
        <Grid item xs={12} sm={6} sx={{ p: 2, width: "50%" }}>
          <div className="animated-border-card seeds-card">
            <Paper
              component={Link}
              to="/Kategorie/Seeds"
              sx={{
                p: 0,
                textDecoration: "none",
                color: "text.primary",
                borderRadius: 2,
                overflow: "hidden",
                height: { xs: 250, sm: 300 },
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                boxShadow: 10,
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 20,
                },
              }}
            >
              {/* Image Container - Place your seeds image here */}
              <Box
                sx={{
                  height: "100%",
                  bgcolor: "#e1f0d3",
                  backgroundImage: 'url("/assets/images/seeds.jpg")',
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  position: "relative",
                }}
              >
                {/* Overlay text - optional */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: "rgba(27, 94, 32, 0.8)",
                    p: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "1.6rem",
                      color: "white",
                      fontFamily: "SwashingtonCP",
                    }}
                  >
                    Seeds
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </div>
        </Grid>

        {/* Cutlings Category Box */}
        <Grid item xs={12} sm={6} sx={{ p: 2, width: "50%" }}>
          <div className="animated-border-card cutlings-card">
            <Paper
              component={Link}
              to="/Kategorie/Stecklinge"
              sx={{
                p: 0,
                textDecoration: "none",
                color: "text.primary",
                borderRadius: 2,
                overflow: "hidden",
                height: { xs: 250, sm: 300 },
                display: "flex",
                flexDirection: "column",
                boxShadow: 10,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 20,
                },
              }}
            >
              {/* Image Container - Place your cutlings image here */}
              <Box
                sx={{
                  height: "100%",
                  bgcolor: "#e8f5d6",
                  backgroundImage: 'url("/assets/images/cutlings.jpg")',
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  position: "relative",
                }}
              >
                {/* Overlay text - optional */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: "rgba(27, 94, 32, 0.8)",
                    p: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "1.6rem",
                      color: "white",
                      fontFamily: "SwashingtonCP",
                    }}
                  >
                    Stecklinge
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </div>
        </Grid>
      </Grid>

      {/* Continuous Rotating Carousel for Categories */}
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

        {filteredCategories.length > 0 && (
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
        )}
      </Box>
    </Container>
  );
};

export default Home;
