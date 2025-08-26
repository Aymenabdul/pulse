import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import dataEmperorLogo from '../assets/delogo.png'; // Make sure this import path is correct

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        // Responsive margin for better spacing on different screen sizes
        // marginTop: { xs: '-8%', sm: '-5%', md: '-3%' },
         paddingTop: { xs: 1, md:1 }, // Uses theme spacing (e.g., 8px, 16px)
        textAlign: 'center',
        borderTop: 1,
        height:30,
        background: "linear-gradient(135deg, #a8edea, #fed6e3)",
        // Use the theme's divider color for better light/dark mode compatibility
        borderColor: 'divider', 
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="body2"
          color="text.secondary"
          // Use Flexbox to align content and allow wrapping on small screens
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap', // Allows items to wrap onto the next line on small screens
            // Adjust font size for different breakpoints for better readability
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          }}
        >
          {'© 2025 Powered by '}

          {/* Responsive Logo */}
          <Box
            component="img"
            sx={{
              // Make the logo size responsive
              height: { xs: 15, sm: 20 },
              width: { xs: 15, sm: 20 },
              mx: 0.5, // Adds horizontal space around the logo
              verticalAlign: 'middle',
            }}
            alt="DataEmperor Logo"
            src={dataEmperorLogo}
          />

          <Link color="inherit" href="#" sx={{ fontWeight: 'bold' }}>
            DataEmperor
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;
