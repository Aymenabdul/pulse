import {
    Box, 
    Button,
    Container,
    FormControl,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
    MenuItem,
    Select,
    InputLabel,
    Snackbar,
    Alert
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Signup() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        constituency: '',
        role: ''
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' 
    });


    const navigate = useNavigate();

    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleInputChange = (field) => (event) => {
        setFormData({
            ...formData,
            [field]: event.target.value
        });
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.password || !formData.phoneNumber || !formData.constituency || !formData.role) {
            setSnackbar({
                open: true,
                message: "Please fill in all fields",
                severity: "error"
            });
            return;
        };

        try {
            const response = await axios.post(`${BASE_URL}/signup`, formData);

            if (response.status === 201) {
                setSnackbar({
                    open: true,
                    message: "Signup successful!",
                    severity: "success"
                });
                navigate("/login");
            } else {
                setSnackbar({
                    open: true,
                    message: response.data.error,
                    severity: "error"
                });

                // alert(`Signup failed: ${responseBody}`);
            }
        } catch (error) {
            console.error("Signup error:", error);
            setSnackbar({
                open: true,
                message: error.response?.data || 'Signup failed',
                severity: "error"
            });

        }
    };

    return (
        <Box 
            sx={{ 
                minHeight: "100%",
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center",
                padding: { xs: 2, md: 4 },
                background: "linear-gradient(135deg, #a8edea, #fed6e3)"
            }}
        >
            <Box 
                sx={{ 
                    display: "flex", 
                    flexDirection: { xs: "column", md: "row" },
                    bgcolor: "white",
                    width: { xs: "100%", sm: "90%", md: "900px" },
                    minHeight: { xs: "auto", md: "600px" },
                    borderRadius: 3,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                    overflow: "hidden"
                }}
            >
                <Box 
                    sx={{
                        flex: 1,
                        background: "linear-gradient(135deg, #a8edea, #fed6e3)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: { xs: 4, md: 6 },
                        color: "#333",
                        textAlign: "center"
                    }}
                >
                    <Typography 
                        variant="h3" 
                        sx={{ 
                            fontWeight: 700,
                            mb: 2,
                            fontSize: { xs: "2rem", md: "3rem" }
                        }}
                    >
                        Join Us Today
                    </Typography>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            opacity: 0.8,
                            lineHeight: 1.6,
                            fontSize: { xs: "1rem", md: "1.1rem" },
                            maxWidth: "300px"
                        }}
                    >
                        Create your account and start your journey with us. We're excited to have you on board!
                    </Typography>
                    <Box 
                        sx={{
                            width: 60,
                            height: 4,
                            bgcolor: "rgba(0,0,0,0.2)",
                            borderRadius: 2,
                            mt: 3
                        }}
                    />
                </Box>

                <Box 
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        padding: { xs: 4, md: 6 }
                    }}
                >
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 600,
                            mb: 1,
                            color: "#333",
                            fontSize: { xs: "1.5rem", md: "2rem" }
                        }}
                    >
                        Sign Up
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: "#666",
                            mb: 4
                        }}
                    >
                        Please fill in your information to create your account
                    </Typography>
                    
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                        <FormControl fullWidth>
                            <TextField 
                                label="Full Name"
                                variant="outlined"
                                type="text"
                                fullWidth
                                value={formData.name}
                                onChange={handleInputChange('name')}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover fieldset': {
                                            borderColor: '#a8edea',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#a8edea',
                                        }
                                    }
                                }}
                            />
                        </FormControl>

                        <FormControl fullWidth>
                            <TextField 
                                label="Email Address"
                                variant="outlined"
                                type="email"
                                fullWidth
                                value={formData.email}
                                onChange={handleInputChange('email')}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover fieldset': {
                                            borderColor: '#a8edea',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#a8edea',
                                        }
                                    }
                                }}
                            />
                        </FormControl>
                        
                        <FormControl fullWidth>
                            <TextField 
                                label="Password"
                                variant="outlined"
                                type={showPassword ? 'text' : 'password'}
                                fullWidth
                                value={formData.password}
                                onChange={handleInputChange('password')}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover fieldset': {
                                            borderColor: '#a8edea',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#a8edea',
                                        }
                                    }
                                }}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleClickShowPassword} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />
                        </FormControl>

                        <FormControl fullWidth>
                            <TextField 
                                label="Phone Number"
                                variant="outlined"
                                type="tel"
                                fullWidth
                                value={formData.phone}
                                onChange={handleInputChange('phone')}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover fieldset': {
                                            borderColor: '#a8edea',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#a8edea',
                                        }
                                    }
                                }}
                            />
                        </FormControl>

                        <FormControl fullWidth>
                            <TextField 
                                label="Constituency"
                                variant="outlined"
                                type="text"
                                fullWidth
                                value={formData.constituency}
                                onChange={handleInputChange('constituency')}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover fieldset': {
                                            borderColor: '#a8edea',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#a8edea',
                                        }
                                    }
                                }}
                            />
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel 
                                sx={{
                                    '&.Mui-focused': {
                                        color: '#a8edea',
                                    }
                                }}
                            >
                                Role
                            </InputLabel>
                            <Select
                                value={formData.role}
                                label="Role"
                                onChange={handleInputChange('role')}
                                sx={{
                                    borderRadius: 2,
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#a8edea',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#a8edea',
                                    }
                                }}
                            >
                                {["Admin", "Surveyor"].map((role) => (
                                    <MenuItem key={role} value={role}>
                                        {role}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleSubmit}
                            sx={{ 
                                mt: 2,
                                py: 1.5,
                                borderRadius: 2,
                                background: "linear-gradient(135deg, #a8edea, #fed6e3)",
                                color: "#333",
                                fontSize: "1.1rem",
                                fontWeight: 600,
                                textTransform: "none",
                                boxShadow: "0 4px 15px rgba(168, 237, 234, 0.3)",
                                '&:hover': {
                                    boxShadow: "0 6px 20px rgba(168, 237, 234, 0.4)",
                                    transform: "translateY(-1px)"
                                },
                                transition: "all 0.3s ease"
                            }}
                        >
                            Create Account
                        </Button>
                    </Box>
                    
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            textAlign: "center",
                            mt: 3,
                            color: "#666"
                        }}
                    >
                        Already have an account? <a href="/login" style={{ color: "#a8edea", cursor: "pointer", fontWeight: 500 }}>Sign in</a>
                    </Typography>
                </Box>
            </Box>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}