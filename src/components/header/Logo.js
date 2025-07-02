import React from "react";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Box
      component={Link}
      to="/"
      aria-label="Zur Startseite"
      sx={{
        display: "flex",
        alignItems: "center",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <img
        src="/assets/images/sh.png"
        alt="SH Logo"
        style={{ height: "45px" }}
      />
    </Box>
  );
};

export default Logo;
