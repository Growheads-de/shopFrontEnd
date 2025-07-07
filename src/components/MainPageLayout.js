import React from "react";
import { useLocation } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import { Link } from "react-router-dom";
import SharedCarousel from "./SharedCarousel.js";
import { getCombinedAnimatedBorderStyles } from "../utils/animatedBorderStyles.js";

const MainPageLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Determine which page we're on
  const isHome = currentPath === "/";
  const isAktionen = currentPath === "/aktionen";
  const isFiliale = currentPath === "/filiale";

  // Get navigation config based on current page
  const getNavigationConfig = () => {
    if (isHome) {
      return {
        leftNav: { text: "Aktionen", link: "/aktionen" },
        rightNav: { text: "Filiale", link: "/filiale" }
      };
    } else if (isAktionen) {
      return {
        leftNav: { text: "Filiale", link: "/filiale" },
        rightNav: { text: "Home", link: "/" }
      };
    } else if (isFiliale) {
      return {
        leftNav: { text: "Home", link: "/" },
        rightNav: { text: "Aktionen", link: "/aktionen" }
      };
    }
    return { leftNav: null, rightNav: null };
  };

  // Define all titles for layered rendering
  const allTitles = {
    home: "ine annabis eeds & uttings",
    aktionen: "Aktionen", 
    filiale: "Filiale"
  };

  // Define all content boxes for layered rendering
  const allContentBoxes = {
    home: [
      {
        title: "Samen",
        image: "/assets/images/seeds.jpg",
        bgcolor: "#e1f0d3",
        link: "/Kategorie/Seeds"
      },
      {
        title: "Stecklinge",
        image: "/assets/images/cutlings.jpg",
        bgcolor: "#e8f5d6",
        link: "/Kategorie/Stecklinge"
      }
    ],
    aktionen: [
      {
        title: "Ölpresse ausleihen",
        image: "/assets/images/presse.jpg",
        bgcolor: "#e1f0d3",
        link: "/presseverleih"
      },
      {
        title: "THC Test",
        image: "/assets/images/purpl.jpg",
        bgcolor: "#e8f5d6",
        link: "/thc-test"
      }
    ],
    filiale: [
      {
        title: "Trachenberger Straße 14",
        image: "/assets/images/filiale1.jpg",
        bgcolor: "#e1f0d3",
        link: "/filiale"
      },
      {
        title: "01129 Dresden",
        image: "/assets/images/filiale2.jpg",
        bgcolor: "#e8f5d6",
        link: "/filiale"
      }
    ]
  };

  // Get opacity for each page layer
  const getOpacity = (pageType) => {
    if (pageType === "home" && isHome) return 1;
    if (pageType === "aktionen" && isAktionen) return 1;
    if (pageType === "filiale" && isFiliale) return 1;
    return 0;
  };

  const navConfig = getNavigationConfig();

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <style>{getCombinedAnimatedBorderStyles(['seeds', 'cutlings'])}</style>
      
      {/* Main Navigation Header */}
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        mb: 4,
        mt: 2,
        px: 0,
        transition: "all 0.3s ease-in-out"
      }}>
        {/* Left Navigation - Layered rendering */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          flexShrink: 0,
          justifyContent: "flex-start",
          position: "relative",
          mr: 2
        }}>
          {["Aktionen", "Filiale", "Home"].map((text, index) => {
            const isActive = navConfig.leftNav && navConfig.leftNav.text === text;
            const link = text === "Aktionen" ? "/aktionen" : text === "Filiale" ? "/filiale" : "/";
            
            return (
              <Box
                key={text}
                component={Link}
                to={link}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "all 0.3s ease",
                  opacity: isActive ? 1 : 0,
                  position: index === 0 ? "relative" : "absolute",
                  left: index !== 0 ? 0 : "auto",
                  pointerEvents: isActive ? "auto" : "none",
                  "&:hover": {
                    transform: "translateX(-5px)",
                    color: "primary.main"
                  }
                }}
              >
                <ChevronLeft sx={{ fontSize: "2rem", mr: 1 }} />
                <Typography
                  sx={{
                    fontFamily: "SwashingtonCP",
                    fontSize: { xs: "1.25rem", sm: "1.25rem", md: "2.125rem" },
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                    lineHeight: { xs: "1.2", sm: "1.2", md: "1.1" },
                    whiteSpace: "nowrap"
                  }}
                >
                  {text}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Center Title - Layered rendering - This defines the height for centering */}
        <Box sx={{ 
          flex: 1, 
          display: "flex", 
          justifyContent: "center",
          alignItems: "center",
          px: 0,
          position: "relative",
          minWidth: 0
        }}>
          {Object.entries(allTitles).map(([pageType, title]) => (
            <Typography
              key={pageType}
              variant="h3"
              component="h1"
              sx={{
                fontFamily: "SwashingtonCP",
                fontSize: { xs: "2.125rem", sm: "2.125rem", md: "3rem" },
                textAlign: "center",
                color: "primary.main",
                textShadow: "3px 3px 10px rgba(0, 0, 0, 0.4)",
                transition: "opacity 0.5s ease-in-out",
                opacity: getOpacity(pageType),
                position: pageType === "home" ? "relative" : "absolute",
                top: pageType !== "home" ? "50%" : "auto",
                left: pageType !== "home" ? "50%" : "auto",
                transform: pageType !== "home" ? "translate(-50%, -50%)" : "none",
                width: "100%",
                pointerEvents: getOpacity(pageType) === 1 ? "auto" : "none",
                lineHeight: { xs: "1.2", sm: "1.2", md: "1.1" },
                wordWrap: "break-word",
                hyphens: "auto"
              }}
            >
              {title}
            </Typography>
          ))}
        </Box>

        {/* Right Navigation - Layered rendering */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          flexShrink: 0,
          justifyContent: "flex-end",
          position: "relative",
          ml: 2
        }}>
          {["Aktionen", "Filiale", "Home"].map((text, index) => {
            const isActive = navConfig.rightNav && navConfig.rightNav.text === text;
            const link = text === "Aktionen" ? "/aktionen" : text === "Filiale" ? "/filiale" : "/";
            
            return (
              <Box
                key={text}
                component={Link}
                to={link}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "all 0.3s ease",
                  opacity: isActive ? 1 : 0,
                  position: index === 0 ? "relative" : "absolute",
                  right: index !== 0 ? 0 : "auto",
                  pointerEvents: isActive ? "auto" : "none",
                  "&:hover": {
                    transform: "translateX(5px)",
                    color: "primary.main"
                  }
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "SwashingtonCP",
                    fontSize: { xs: "1.25rem", sm: "1.25rem", md: "2.125rem" },  
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                    lineHeight: { xs: "1.2", sm: "1.2", md: "1.1" },
                    whiteSpace: "nowrap"
                  }}
                >
                  {text}
                </Typography>
                <ChevronRight sx={{ fontSize: "2rem", ml: 1 }} />
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Content Boxes - Layered rendering */}
      <Box sx={{ position: "relative", mb: 4 }}>
        {Object.entries(allContentBoxes).map(([pageType, contentBoxes]) => (
          <Grid 
            key={pageType}
            container 
            spacing={0} 
            sx={{ 
              transition: "opacity 0.5s ease-in-out",
              opacity: getOpacity(pageType),
              position: pageType === "home" ? "relative" : "absolute",
              top: 0,
              left: 0,
              width: "100%",
              pointerEvents: getOpacity(pageType) === 1 ? "auto" : "none"
            }}
          >
            {contentBoxes.map((box, index) => (
              <Grid key={`${pageType}-${index}`} item xs={12} sm={6} sx={{ p: 2, width: "50%" }}>
                <div className={`animated-border-card ${index === 0 ? 'seeds-card' : 'cutlings-card'}`}>
                  <Paper
                    component={Link}
                    to={box.link}
                    sx={{
                      p: 0,
                      textDecoration: "none",
                      color: "text.primary",
                      borderRadius: 2,
                      overflow: "hidden",
                      height: { xs: 150, sm: 200, md: 300 },
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
                    <Box
                      sx={{
                        height: "100%",
                        bgcolor: box.bgcolor,
                        backgroundImage: `url("${box.image}")`,
                        backgroundSize: "contain",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        position: "relative",
                      }}
                    >
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
                          {box.title}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </div>
              </Grid>
            ))}
          </Grid>
        ))}
      </Box>

      {/* Shared Carousel */}
      <SharedCarousel />
    </Container>
  );
};

export default MainPageLayout; 