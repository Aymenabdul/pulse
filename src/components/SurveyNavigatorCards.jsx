import {
  Box,
  Typography,
  Button,
  Paper,
  Grid
} from "@mui/material";
import {
  Assignment,
  Group
} from "@mui/icons-material";
import { useNavigate, useLocation, useSearchParams } from "react-router";

export default function SurveyNavigatorCards({ from }) {
  const navigate = useNavigate();
  const location = useLocation(); // Use location hook here
  const [searchParams] = useSearchParams();

  const handleStartSurvey = (type) => {
    const currentParams = searchParams.toString();
    const paramString = currentParams ? `?${currentParams}` : '';

    // Use the same path logic for navigation based on type
    if (type === 'with-voter-id') {
      navigate(`/${from}/survey/with-voter-id`);
    } else if (type === 'without-voter-id') {
      if (location.pathname.includes('/admin')) {
        navigate(`/admin/without-voter-id/form${paramString}`);
      } else if (location.pathname.includes('/surveyor')) {
        navigate(`/surveyor/without-voter-id/form${paramString}`);
      } else {
        navigate(`/survey/without-voter-id/form${paramString}`);
      }
    }
  };

  return (
    <Box sx={{ width: { xs: '100%', md: '75%', lg: '60%' }, mt: 3, mx: 'auto', }}>
      <Grid container spacing={2.5} alignItems="stretch">
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper
            sx={{
              borderRadius: 2.5,
              p: 3,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              minHeight: 260,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
                background: 'rgba(255, 255, 255, 0.3)',
              }
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(76, 175, 80, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                border: '2px solid rgba(76, 175, 80, 0.2)'
              }}
            >
              <Assignment sx={{ fontSize: 28, color: '#4CAF50' }} />
            </Box>

            <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 700 }}>
              Voters Survey
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'rgba(0, 0, 0, 0.7)',
                mb: 2.5,
                fontSize: '0.9rem',
                lineHeight: 1.5,
                maxWidth: 250,
                mx: 'auto'
              }}
            >
              Conduct survey by verifying voter details
            </Typography>

            <Button
              variant="contained"
              onClick={() => handleStartSurvey('with-voter-id')}
              sx={{
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: 2,
                fontSize: '0.9rem',
                boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #45a049, #3d8b40)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 24px rgba(76, 175, 80, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              START SURVEY
            </Button>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper
            sx={{
              borderRadius: 2.5,
              p: 3,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              minHeight: 260,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
                background: 'rgba(255, 255, 255, 0.3)',
              }
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(76, 175, 80, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                border: '2px solid rgba(76, 175, 80, 0.2)'
              }}
            >
              <Group sx={{ fontSize: 28, color: '#4CAF50' }} />
            </Box>

            <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 700 }}>
              General Survey
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'rgba(0, 0, 0, 0.7)',
                mb: 2.5,
                fontSize: '0.9rem',
                lineHeight: 1.5,
                maxWidth: 250,
                mx: 'auto'
              }}
            >
              Conduct survey with common public
            </Typography>

            <Button
              variant="contained"
              onClick={() => handleStartSurvey('without-voter-id')}
              sx={{
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                py: 1,
                marginTop: '5%',
                borderRadius: 2,
                fontSize: '0.9rem',
                boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #45a049, #3d8b40)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 24px rgba(76, 175, 80, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              START SURVEY
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
