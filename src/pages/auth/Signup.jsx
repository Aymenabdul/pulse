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
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Signup() {
    const [showPassword, setShowPassword] = useState(false);
    const [constituencies, setConstituencies] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        constituency: '',
        role: ''
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const navigate = useNavigate();

    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };
    useEffect(() => {
        // Fetch the constituencies when the component mounts
        axios.get(`${BASE_URL}/file/constituencies`)
            .then((response) => {
                setConstituencies(response.data);  // Update the constituencies state
            })
            .catch((error) => {
                console.error('There was an error fetching constituencies!', error);
            });
    }, []);
    // Phone number validation function
    const validatePhoneNumber = (number) => {
        if (!number) return "Phone number is required";

        if (!/^\d{10}$/.test(number)) {
            return "Phone number must be exactly 10 digits";
        }

        return null;
    };

    // Password validation function
    const validatePassword = (password) => {
        if (!password) return "Password is required";

        if (password.length < 8) {
            return "Password must be at least 8 characters long";
        }

        if (!/[A-Z]/.test(password)) {
            return "Password must contain at least 1 uppercase letter";
        }

        if (!/[0-9]/.test(password)) {
            return "Password must contain at least 1 number";
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return "Password must contain at least 1 special character";
        }

        return null;
    };

    // Email validation function
    const validateEmail = (email) => {
        if (!email) return "Email is required";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return "Please enter a valid email address";
        }

        return null;
    };

    // Update validation errors when form changes (only for touched fields)
    useEffect(() => {
        const errors = {};

        // Only validate fields that have been touched
        if (touchedFields.name && formData.name && !formData.name.trim()) {
            errors.name = "Name is required";
        }

        if (touchedFields.email) {
            const emailError = validateEmail(formData.email);
            if (emailError) errors.email = emailError;
        }

        if (touchedFields.password) {
            const passwordError = validatePassword(formData.password);
            if (passwordError) errors.password = passwordError;
        }

        if (touchedFields.phoneNumber) {
            const phoneError = validatePhoneNumber(formData.phoneNumber);
            if (phoneError) errors.phoneNumber = phoneError;
        }

        if (touchedFields.constituency && formData.constituency && !formData.constituency.trim()) {
            errors.constituency = "Constituency is required";
        }

        if (touchedFields.role && formData.role && !formData.role.trim()) {
            errors.role = "Role is required";
        }

        setValidationErrors(errors);
    }, [formData, touchedFields]);

    const handleInputChange = (field) => (event) => {
        let value = event.target.value;

        // Mark field as touched when user interacts with it
        setTouchedFields(prev => ({ ...prev, [field]: true }));

        // For phone number field, only allow digits and limit to 10 characters
        if (field === 'phoneNumber') {
            value = value.replace(/\D/g, '').slice(0, 10);
        }

        setFormData({
            ...formData,
            [field]: value
        });
    };

    const handleSubmit = async () => {
        // Define the required fields here
        const requiredFields = ['name', 'email', 'password', 'phoneNumber', 'constituency', 'role'];

        // Mark all fields as touched when submit is attempted
        const allFields = requiredFields;
        setTouchedFields(prev => {
            const newTouched = { ...prev };
            allFields.forEach(field => {
                newTouched[field] = true;
            });
            return newTouched;
        });

        // Check if all required fields are filled
        const emptyFields = requiredFields.filter(field => !formData[field]?.trim());

        // Admin should not have the constituency as required
        if (formData.role !== "Admin" && emptyFields.includes('constituency')) {
            setSnackbar({
                open: true,
                message: "Please fill in all fields",
                severity: "error"
            });
            return;
        }

        // Validate all fields regardless of touched state for submit
        const errors = {};

        const emailError = validateEmail(formData.email);
        if (emailError) errors.email = emailError;

        const passwordError = validatePassword(formData.password);
        if (passwordError) errors.password = passwordError;

        const phoneError = validatePhoneNumber(formData.phoneNumber);
        if (phoneError) errors.phoneNumber = phoneError;

        // Validate constituency only if role is not "Admin"
        if (formData.role !== "Admin" && !formData.constituency.trim()) {
            errors.constituency = "Constituency is required";
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setSnackbar({
                open: true,
                message: "Please fix the validation errors before submitting",
                severity: "error"
            });
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}/signup`, formData);

            if (response.status === 201) {
                setSnackbar({
                    open: true,
                    message: "Signup successful!",
                    severity: "success"
                });
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setSnackbar({
                    open: true,
                    message: response.data.error || "Signup failed",
                    severity: "error"
                });
            }
        } catch (error) {
            console.error("Signup error:", error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || error.response?.data || 'Signup failed',
                severity: "error"
            });
        }
    };

    const isFormValid = () => {
        // Define the required fields here
        const requiredFields = ['name', 'email', 'password', 'phoneNumber', 'role'];

        // If the role is not Admin, make constituency a required field
        if (formData.role !== 'Admin') {
            requiredFields.push('constituency');
        }

        // Check if all required fields are filled
        const allFieldsFilled = requiredFields.every(field => formData[field]?.trim());

        // Only check validation errors for touched fields
        const relevantErrors = Object.keys(validationErrors).filter(field => touchedFields[field]);
        const hasValidationErrors = relevantErrors.length > 0;

        // Return whether the form is valid based on fields and validation errors
        return allFieldsFilled && !hasValidationErrors;
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
                                error={!!(validationErrors.name && touchedFields.name)}
                                helperText={touchedFields.name ? validationErrors.name : ""}
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
                                error={!!validationErrors.email}
                                helperText={validationErrors.email}
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
                                error={!!validationErrors.password}
                                helperText={validationErrors.password}
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
                                value={formData.phoneNumber}
                                onChange={handleInputChange('phoneNumber')}
                                error={!!validationErrors.phoneNumber}
                                helperText={validationErrors.phoneNumber}
                                slotProps={{
                                    input: {
                                        inputMode: "numeric",
                                        maxLength: 10
                                    }
                                }}
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

                        <FormControl fullWidth error={!!validationErrors.constituency}>
                            <InputLabel>Constituency</InputLabel>
                            <Select
                                value={formData.constituency}
                                onChange={handleInputChange('constituency')}
                                disabled={formData.role === "Admin"}
                                label="Constituency"
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
                            >
                                {/* Map the fetched constituencies to menu items */}
                                {constituencies.map((constituency) => (
                                    <MenuItem key={constituency} value={constituency}>
                                        {constituency}
                                    </MenuItem>
                                ))}
                            </Select>
                            {validationErrors.constituency && (
                                <FormHelperText>{validationErrors.constituency}</FormHelperText>
                            )}
                        </FormControl>

                        <FormControl fullWidth error={!!validationErrors.role}>
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
                            {validationErrors.role && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                    {validationErrors.role}
                                </Typography>
                            )}
                        </FormControl>

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleSubmit}
                            disabled={!isFormValid()}
                            sx={{
                                mt: 2,
                                py: 1.5,
                                borderRadius: 2,
                                background: isFormValid()
                                    ? "linear-gradient(135deg, #a8edea, #fed6e3)"
                                    : "rgba(0, 0, 0, 0.12)",
                                color: isFormValid() ? "#333" : "rgba(0, 0, 0, 0.26)",
                                fontSize: "1.1rem",
                                fontWeight: 600,
                                textTransform: "none",
                                boxShadow: isFormValid()
                                    ? "0 4px 15px rgba(168, 237, 234, 0.3)"
                                    : "none",
                                '&:hover': {
                                    boxShadow: isFormValid()
                                        ? "0 6px 20px rgba(168, 237, 234, 0.4)"
                                        : "none",
                                    transform: isFormValid() ? "translateY(-1px)" : "none"
                                },
                                transition: "all 0.3s ease",
                                '&:disabled': {
                                    background: "rgba(0, 0, 0, 0.12)",
                                    color: "rgba(0, 0, 0, 0.26)"
                                }
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