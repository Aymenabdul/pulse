import {
  Box,
  Typography,
  Button,
  Paper,
  Grid
} from "@mui/material";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import axiosInstance from "../axios/axios";
import PostAdd from '@mui/icons-material/PostAdd';

export default function ProcessNavigatorCards() {
  const navigate = useNavigate();

  const [role, setRole] = useState(null);  // State to store the role

  useEffect(() => {
    // Fetch user details after login (assuming user details API gives us role)
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      // Fetch user details (make sure this endpoint returns user role)
      const response = await axiosInstance.get("/user-details");

      if (response.data && response.data.role) {
        setRole(response.data.role);  // Store the role in the state
      } else {
        console.error("Role not found in user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };


  const handleNavigation = () => {

    if (role === 'Admin') {
      navigate('/admin/users');  // Navigate to the admin users page
    } else if (role === 'SuperAdmin') {
      navigate('/superadmin/SuperUsers');  // Navigate to the superadmin table
    }
  };

  const handlefileNavigation = () => {

    if (role === 'Admin') {
      navigate('/admin/files');  // Navigate to the admin users page
    } else if (role === 'SuperAdmin') {
      navigate('/superadmin/superFiles');  // Navigate to the superadmin table
    }
  };

  const handleCreateSurvey = () => {
    navigate(`/superadmin/status/survey`); // Adjust the route as needed
  };

  return (
    <Box sx={{ width: { xs: '100%', md: '75%', lg: '60%' }, mt: 1, mx: 'auto', mb: 3 }}>
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
              <InsertDriveFileIcon sx={{ fontSize: 28, color: '#4CAF50' }} />
            </Box>

            <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 700 }}>
              ECI Voters Details
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
              Upload voters data in excel format
            </Typography>

            <Button
              variant="contained"
              onClick={handlefileNavigation}
              sx={{
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: 2,
                marginTop:'6%',
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
              VIEW & UPLOAD
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
              <ManageAccountsIcon sx={{ fontSize: 28, color: '#4CAF50' }} />
            </Box>

            <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 700 }}>
              Manage Users / Admins
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
              Activate or Deactivate users and admins
            </Typography>

            <Button
              variant="contained"
              onClick={handleNavigation}
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
              MANAGE USERS / ADMINS
            </Button>
          </Paper>
        </Grid>
        {role === 'SuperAdmin' && (
          <Grid  size={{ xs: 12, sm: 12 }}>
            <Paper
              sx={{
                borderRadius: 2.5, p: 3, textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease', minHeight: 260, display: 'flex',
                flexDirection: 'column', justifyContent: 'center',
                '&:hover': {
                  transform: 'translateY(-4px)', boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
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
                <PostAdd sx={{ fontSize: 28, color: '#4CAF50' }} />
              </Box>
              <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 700 }}>
                Surveys
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(0, 0, 0, 0.7)', mb: 2.5, fontSize: '0.9rem', lineHeight: 1.5, maxWidth: 250, mx: 'auto' }}>
                Create, Activate and Deactivate Surveys
              </Typography>
               <Button
              variant="contained"
              onClick={handleCreateSurvey}
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
              MANAGE SURVEYS
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}