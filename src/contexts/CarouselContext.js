import React, { createContext, useContext, useRef, useEffect, useState } from 'react';

const CarouselContext = createContext();

export const useCarousel = () => {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within a CarouselProvider');
  }
  return context;
};

export const CarouselProvider = ({ children }) => {
  const carouselRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const animationIdRef = useRef(null);
  const isPausedRef = useRef(false);
  const resumeTimeoutRef = useRef(null);
  
  const [filteredCategories, setFilteredCategories] = useState([]);

  // Initialize refs properly
  useEffect(() => {
    isPausedRef.current = false;
    scrollPositionRef.current = 0;
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (filteredCategories.length === 0) return;

    const startAnimation = () => {
      if (!carouselRef.current) {
        return false;
      }

      isPausedRef.current = false;
      
      const itemWidth = 146; // 130px + 16px gap
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
        return true;
      }
      return false;
    };

    // Try immediately, then with increasing delays
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

  // Additional effect for when ref becomes available
  useEffect(() => {
    if (filteredCategories.length > 0 && carouselRef.current && !animationIdRef.current) {
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
    const moveAmount = itemWidth * 3;
    const totalWidth = filteredCategories.length * itemWidth;

    if (direction === "left") {
      scrollPositionRef.current -= moveAmount;
      if (scrollPositionRef.current < 0) {
        scrollPositionRef.current = totalWidth + scrollPositionRef.current;
      }
    } else {
      scrollPositionRef.current += moveAmount;
      if (scrollPositionRef.current >= totalWidth) {
        scrollPositionRef.current = scrollPositionRef.current % totalWidth;
      }
    }

    // Apply smooth transition
    carouselRef.current.style.transition = "transform 0.5s ease-in-out";
    carouselRef.current.style.transform = `translateX(-${scrollPositionRef.current}px)`;

    // Remove transition after animation
    setTimeout(() => {
      if (carouselRef.current) {
        carouselRef.current.style.transition = "none";
      }
    }, 500);

    // Clear existing timeout
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

  const value = {
    carouselRef,
    scrollPositionRef,
    animationIdRef,
    isPausedRef,
    resumeTimeoutRef,
    filteredCategories,
    setFilteredCategories,
    moveCarousel
  };

  return (
    <CarouselContext.Provider value={value}>
      {children}
    </CarouselContext.Provider>
  );
};

export default CarouselContext; 