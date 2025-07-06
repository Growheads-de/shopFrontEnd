import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const PresseverleihPage = () => {
  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 2, maxWidth: '1200px !important' }}>
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
        Ölpresse ausleihen
      </Typography>
      
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          textAlign: "center"
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "text.secondary",
            fontStyle: "italic"
          }}
        >
          Inhalt kommt bald...
        </Typography>
      </Box>
    </Container>
  );
};

export default PresseverleihPage; 