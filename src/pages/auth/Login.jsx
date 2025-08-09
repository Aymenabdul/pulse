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
import ArrowBack from "@mui/icons-material/ArrowBack";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";

export default function Login() {
    const { login, getUserDetails } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isResetMode, setIsResetMode] = useState(false);
    
    const [formData, setFormData] = useState({
        email: '', 
        password: '',
    });

    const [resetData, setResetData] = useState({
        email: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const resetParam = searchParams.get('reset-password');
        if (resetParam !== null) {
            setIsResetMode(true);
        }
    }, [searchParams]);

    const handleInputChange = (field) => (event) => {
        setFormData({
            ...formData,
            [field]: event.target.value
        });
        setError(''); 
        setSuccess('');
    };

    const handleResetInputChange = (field) => (event) => {
        setResetData({
            ...resetData,
            [field]: event.target.value
        });
        setError('');
        setSuccess('');
    };

    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleClickShowNewPassword = () => {
        setShowNewPassword((prev) => !prev);
    };

    const handleClickShowConfirmPassword = () => {
        setShowConfirmPassword((prev) => !prev);
    };

    const handleResetPasswordClick = () => {
        setIsResetMode(true);
        setSearchParams({ 'reset-password': 'true' });
        setError('');
        setSuccess('');
    };

    const handleBackToLogin = () => {
        setIsResetMode(false);
        setSearchParams({});
        setError('');
        setSuccess('');
        setResetData({
            email: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    const handleResetPassword = async () => {
        if (!resetData.email || !resetData.newPassword || !resetData.confirmPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (resetData.newPassword !== resetData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (resetData.newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            // Request for password reset.
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/reset-password`, {
                email: resetData.email,
                newPassword: resetData.newPassword
            });

            if (response.data.success) {
                setSuccess("Password reset successfully! You can now login with your new password.");
                setResetData({
                    email: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                // Optionally redirect to login after a delay
                setTimeout(() => {
                    handleBackToLogin();
                }, 3000);
            } else {
                setError(response.data.message || "Password reset failed");
            }
        } catch (err) {
            console.error("Password reset error:", err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Network error. Please check your internet connection.");
            }
        } finally {
            setLoading(false);
        }
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
            if (result.success) {
                const userDetails = await getUserDetails();
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
            setError(err?.response.data.message || "Network error. Make sure you have an active internet connection.");
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
                        {isResetMode ? "Reset Password" : "Welcome Back"}
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
                        {isResetMode 
                            ? "Enter your details to reset your password securely." 
                            : "Sign in to continue your journey with us. We're excited to have you back!"
                        }
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
                    {isResetMode && (
                        <Box sx={{ mb: 2 }}>
                            <Button
                                startIcon={<ArrowBack />}
                                onClick={handleBackToLogin}
                                sx={{
                                    color: "#666",
                                    textTransform: "none",
                                    '&:hover': {
                                        backgroundColor: "rgba(0,0,0,0.04)"
                                    }
                                }}
                            >
                                Back to Login
                            </Button>
                        </Box>
                    )}

                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 600,
                            mb: 1,
                            color: "#333",
                            fontSize: { xs: "1.5rem", md: "2rem" }
                        }}
                    >
                        {isResetMode ? "Reset Password" : "Login"}
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: "#666",
                            mb: 4
                        }}
                    >
                        {isResetMode 
                            ? "Enter your email and new password to reset your account"
                            : "Please enter your credentials to access your account"
                        }
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}
                    
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {isResetMode ? (
                            // Reset Password Form
                            <>
                                <FormControl fullWidth>
                                    <TextField 
                                        label="Email"
                                        variant="outlined"
                                        type="email"
                                        value={resetData.email}
                                        onChange={handleResetInputChange('email')}
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
                                        label="New Password"
                                        variant="outlined"
                                        value={resetData.newPassword}
                                        type={showNewPassword ? 'text' : 'password'}
                                        onChange={handleResetInputChange('newPassword')}
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
                                                            onClick={handleClickShowNewPassword} 
                                                            edge="end"
                                                            disabled={loading}
                                                        >
                                                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }
                                        }}
                                    />
                                </FormControl>

                                <FormControl fullWidth>
                                    <TextField 
                                        label="Confirm Password"
                                        variant="outlined"
                                        value={resetData.confirmPassword}
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        onChange={handleResetInputChange('confirmPassword')}
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
                                                            onClick={handleClickShowConfirmPassword} 
                                                            edge="end"
                                                            disabled={loading}
                                                        >
                                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }
                                        }}
                                    />
                                </FormControl>

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
                                    onClick={handleResetPassword}
                                >
                                    {loading ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        'Reset Password'
                                    )}
                                </Button>
                            </>
                        ) : (
                            // Login Form
                            <>
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

                                <Box sx={{ textAlign: 'right', mt: -1 }}>
                                    <Typography 
                                        variant="body2" 
                                        onClick={handleResetPasswordClick}
                                        sx={{ 
                                            color: "#a8edea", 
                                            cursor: "pointer", 
                                            fontWeight: 500,
                                            fontSize: "0.875rem",
                                            '&:hover': {
                                                textDecoration: 'underline'
                                            }
                                        }}
                                    >
                                        Forgot Password?
                                    </Typography>
                                </Box>
                                
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
                            </>
                        )}
                    </Box>
                    
                    {!isResetMode && (
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
                    )}
                </Box>
            </Box>
        </Box>
    );
}