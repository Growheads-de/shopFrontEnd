import React, { useState, useEffect, useRef, useContext, lazy, Suspense } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Fab from "@mui/material/Fab";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PaletteIcon from "@mui/icons-material/Palette";

import SocketProvider from "./providers/SocketProvider.js";
import SocketContext from "./contexts/SocketContext.js";
import config from "./config.js";
import ScrollToTop from "./components/ScrollToTop.js";
//import TelemetryService from './services/telemetryService.js';

import Header from "./components/Header.js";
import Footer from "./components/Footer.js";
import Home from "./pages/Home.js";

// Lazy load all route components to reduce initial bundle size
const Content = lazy(() => import(/* webpackChunkName: "content" */ "./components/Content.js"));
const ProductDetailWithSocket = lazy(() => import(/* webpackChunkName: "product-detail" */ "./components/ProductDetailWithSocket.js"));
const ProfilePageWithSocket = lazy(() => import(/* webpackChunkName: "profile" */ "./pages/ProfilePage.js"));
const ResetPassword = lazy(() => import(/* webpackChunkName: "reset-password" */ "./pages/ResetPassword.js"));

// Lazy load admin pages - only loaded when admin users access them
const AdminPage = lazy(() => import(/* webpackChunkName: "admin" */ "./pages/AdminPage.js"));
const UsersPage = lazy(() => import(/* webpackChunkName: "admin-users" */ "./pages/UsersPage.js"));
const ServerLogsPage = lazy(() => import(/* webpackChunkName: "admin-logs" */ "./pages/ServerLogsPage.js"));

// Lazy load legal pages - rarely accessed
const Datenschutz = lazy(() => import(/* webpackChunkName: "legal" */ "./pages/Datenschutz.js"));
const AGB = lazy(() => import(/* webpackChunkName: "legal" */ "./pages/AGB.js"));
const Sitemap = lazy(() => import(/* webpackChunkName: "sitemap" */ "./pages/Sitemap.js"));
const Impressum = lazy(() => import(/* webpackChunkName: "legal" */ "./pages/Impressum.js"));
const Batteriegesetzhinweise = lazy(() => import(/* webpackChunkName: "legal" */ "./pages/Batteriegesetzhinweise.js"));
const Widerrufsrecht = lazy(() => import(/* webpackChunkName: "legal" */ "./pages/Widerrufsrecht.js"));

// Lazy load special features
const GrowTentKonfigurator = lazy(() => import(/* webpackChunkName: "konfigurator" */ "./pages/GrowTentKonfigurator.js"));
const ChatAssistant = lazy(() => import(/* webpackChunkName: "chat" */ "./components/ChatAssistant.js"));

// Import theme from separate file to reduce main bundle size
import defaultTheme from "./theme.js";
// Lazy load theme customizer for development only
const ThemeCustomizerDialog = lazy(() => import(/* webpackChunkName: "theme-customizer" */ "./components/ThemeCustomizerDialog.js"));
import { createTheme } from "@mui/material/styles";

const deleteMessages = () => {
  console.log("Deleting messages");
  window.chatMessages = [];
};

// Component to initialize telemetry service with socket
const TelemetryInitializer = ({ socket }) => {
  const telemetryServiceRef = useRef(null);

  useEffect(() => {
    if (socket && !telemetryServiceRef.current) {
      //telemetryServiceRef.current = new TelemetryService(socket);
      //telemetryServiceRef.current.init();
    }

    return () => {
      if (telemetryServiceRef.current) {
        telemetryServiceRef.current.destroy();
        telemetryServiceRef.current = null;
      }
    };
  }, [socket]);

  return null; // This component doesn't render anything
};

const AppContent = ({ currentTheme, onThemeChange }) => {
  // State to manage chat visibility
  const [isChatOpen, setChatOpen] = useState(false);
  const [authVersion, setAuthVersion] = useState(0);
  // @note Theme customizer state for development mode
  const [isThemeCustomizerOpen, setThemeCustomizerOpen] = useState(false);

  // Get current location
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.hash && location.hash.startsWith("#ORD-")) {
      if (location.pathname !== "/profile") {
        navigate(`/profile${location.hash}`, { replace: true });
      }
    }
  }, [location, navigate]);

  useEffect(() => {
    const handleLogin = () => {
      setAuthVersion((v) => v + 1);
    };
    window.addEventListener("userLoggedIn", handleLogin);
    return () => {
      window.removeEventListener("userLoggedIn", handleLogin);
    };
  }, []);

  // Extract categoryId from pathname if on category route
  const getCategoryId = () => {
    const match = location.pathname.match(/^\/Kategorie\/(.+)$/);
    return match ? match[1] : null;
  };

  const categoryId = getCategoryId();

  // Handler to toggle chat visibility
  const handleChatToggle = () => {
    if (isChatOpen)
      window.messageDeletionTimeout = setTimeout(deleteMessages, 1000 * 60);
    if (!isChatOpen && window.messageDeletionTimeout)
      clearTimeout(window.messageDeletionTimeout);
    setChatOpen(!isChatOpen);
  };

  // Handler to close the chat
  const handleChatClose = () => {
    window.messageDeletionTimeout = setTimeout(deleteMessages, 1000 * 60);
    setChatOpen(false);
  };

  // @note Theme customizer handlers for development mode
  const handleThemeCustomizerToggle = () => {
    setThemeCustomizerOpen(!isThemeCustomizerOpen);
  };

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === "development";

  const socket = useContext(SocketContext);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        mb: 0,
        pb: 0,
        bgcolor: "background.default",
      }}
    >
      <ScrollToTop />
      <TelemetryInitializer socket={socket} />
      <Header active categoryId={categoryId} key={authVersion} />
      <Box sx={{ flexGrow: 1 }}>
        <Suspense fallback={
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "60vh",
            }}
          >
            <CircularProgress color="primary" />
          </Box>
        }>
          <Routes>
            {/* Home page with text only */}
            <Route path="/" element={<Home />} />

            {/* Category page - Render Content in parallel */}
            <Route
              path="/Kategorie/:categoryId"
              element={<Content socket={socket} />}
            />
            {/* Single product page */}
            <Route
              path="/Artikel/:seoName"
              element={<ProductDetailWithSocket />}
            />

            {/* Search page - Render Content in parallel */}
            <Route path="/search" element={<Content socket={socket} />} />

            {/* Profile page */}
            <Route path="/profile" element={<ProfilePageWithSocket />} />

            {/* Reset password page */}
            <Route
              path="/resetPassword"
              element={<ResetPassword socket={socket} />}
            />

            {/* Admin page */}
            <Route path="/admin" element={<AdminPage socket={socket} />} />
            
            {/* Admin Users page */}
            <Route path="/admin/users" element={<UsersPage socket={socket} />} />
            
            {/* Admin Server Logs page */}
            <Route path="/admin/logs" element={<ServerLogsPage socket={socket} />} />

            {/* Legal pages */}
            <Route path="/datenschutz" element={<Datenschutz />} />
            <Route path="/agb" element={<AGB />} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route
              path="/batteriegesetzhinweise"
              element={<Batteriegesetzhinweise />}
            />
            <Route path="/widerrufsrecht" element={<Widerrufsrecht />} />

            {/* Grow Tent Configurator */}
            <Route path="/Konfigurator" element={<GrowTentKonfigurator />} />

            {/* Fallback for undefined routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Box>
      {/* Conditionally render the Chat Assistant */}
      {isChatOpen && (
        <Suspense fallback={<CircularProgress size={20} />}>
          <ChatAssistant
            open={isChatOpen}
            onClose={handleChatClose}
            socket={socket}
          />
        </Suspense>
      )}

      {/* Chat AI Assistant FAB */}
      <Fab
        color="primary"
        aria-label="chat"
        size="small"
        sx={{
          position: "fixed",
          bottom: 31,
          right: 15,
        }}
        onClick={handleChatToggle} // Attach toggle handler
      >
        <SmartToyIcon sx={{ fontSize: "1.2rem" }} />
      </Fab>

      {/* Development-only Theme Customizer FAB */}
      {isDevelopment && (
        <Fab
          color="secondary"
          aria-label="theme customizer"
          size="small"
          sx={{
            position: "fixed",
            bottom: 31,
            right: 75,
          }}
          onClick={handleThemeCustomizerToggle}
        >
          <PaletteIcon sx={{ fontSize: "1.2rem" }} />
        </Fab>
      )}

      {/* Development-only Theme Customizer Dialog */}
      {isDevelopment && isThemeCustomizerOpen && (
        <Suspense fallback={<CircularProgress size={20} />}>
          <ThemeCustomizerDialog
            open={isThemeCustomizerOpen}
            onClose={() => setThemeCustomizerOpen(false)}
            theme={currentTheme}
            onThemeChange={onThemeChange}
          />
        </Suspense>
      )}

      <Footer />
    </Box>
  );
};

// Convert App to a functional component to use hooks
const App = () => {
  // @note Theme state moved to App level to provide dynamic theming
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);
  const [dynamicTheme, setDynamicTheme] = useState(createTheme(defaultTheme));

  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
    setDynamicTheme(createTheme(newTheme));
  };

  return (
    <ThemeProvider theme={dynamicTheme}>
      <CssBaseline />
      <SocketProvider
        url={config.apiBaseUrl}
        fallback={
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <CircularProgress color="primary" />
          </Box>
        }
      >
        <AppContent
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      </SocketProvider>
    </ThemeProvider>
  );
};

export default App;
export { AppContent };
