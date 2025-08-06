import {
    Box, 
    Button,
    Container,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    Menu, 
    MenuItem,
    Select,
    TextField,
    Typography,
    Alert,
    CircularProgress
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import { useNavigate, Navigate, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
    const { login, getUserDetails } = useAuth();
    const navigate = useNavigate();
    // const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '', 
        password: '',
        // role: ''
    });

    // const from = location.state?.from?.pathname || (user?.role === 'admin' ? '/admin/dashboard' : '/surveyor/home');
    // if (isAuthenticated && !authLoading) {
    //     return <Navigate to={from} replace />;
    // }

    const handleInputChange = (field) => (event) => {
        setFormData({
            ...formData,
            [field]: event.target.value
        });
        setError(''); 
    };

    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleLogin = async () => {
        if (!formData.email || !formData.password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await login(formData);
            console.log(result);
            if (result.success) {
                const userDetails = await getUserDetails();
                console.log(userDetails);
                // userDetails?.role === "Admin" || userDetails?.role === "admin" || userDetails?.role.toLowerCase() === "surveyor"
                if (userDetails?.role === "Admin" || userDetails?.role === "admin") {
                    navigate("/admin/dashboard");
                } else if (userDetails?.role === "Surveyor" || userDetails?.role === "surveyor") {
                    navigate("/surveyor/home");
                } else {
                    setError("Unrecognized user role");
                }
            } else {
                setError(result.message || "Login failed");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };


    return (
        <Box 
            sx={{ 
                minHeight: "100vh",
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
                    width: { xs: "100%", sm: "90%", md: "800px" },
                    minHeight: { xs: "auto", md: "500px" },
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
                        Welcome Back
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
                        Sign in to continue your journey with us. We're excited to have you back!
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
                        Login
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: "#666",
                            mb: 4
                        }}
                    >
                        Please enter your credentials to access your account
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <FormControl fullWidth>
                            <TextField 
                                label="Email"
                                variant="outlined"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange('email')}
                                fullWidth
                                disabled={loading}
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
                                value={formData.password}
                                type={showPassword ? 'text' : 'password'}
                                onChange={handleInputChange('password')}
                                fullWidth
                                disabled={loading}
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
                                                <IconButton 
                                                    onClick={handleClickShowPassword} 
                                                    edge="end"
                                                    disabled={loading}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />
                        </FormControl>

                        {/* <FormControl fullWidth>
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
                                disabled={loading}
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
                        </FormControl> */}
                        
                        <Button
                            variant="contained"
                            fullWidth
                            disabled={loading}
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
                                '&:disabled': {
                                    background: "#ccc",
                                    color: "#666"
                                },
                                transition: "all 0.3s ease"
                            }}
                            onClick={handleLogin}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Sign In'
                            )}
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
                        Don't have an account? <a href="/signup" style={{ color: "#a8edea", cursor: "pointer", fontWeight: 500 }}>Sign up</a>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}