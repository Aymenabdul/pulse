import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Menu,
    MenuItem,
    useMediaQuery,
    useTheme
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import TranslateIcon from '@mui/icons-material/Translate';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import GoogleTranslateWidget from "./GoogleTranslateWidget";

export default function Navbar() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [translateAnchorEl, setTranslateAnchorEl] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const { logout, user } = useAuth();

    const navigate = useNavigate();

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleTranslateMenuOpen = (event) => {
        setTranslateAnchorEl(event.currentTarget);
    };

    const handleTranslateMenuClose = () => {
        setTranslateAnchorEl(null);
    };

    useEffect(() => {
        if (!isMobile && anchorEl) {
            setAnchorEl(null);
        }
    }, [isMobile, anchorEl]);

    const adminNavItems = [
        { label: "Dashboard", href: "/admin/dashboard" },
        { label: "Files", href: "/admin/files" },
        { label: "Users", href: "/admin/users" },
        { label: "Statistics", href: "/admin/statistics" },
    ];

    const surveyorNavItems = [
        { label: "Home", href: "/surveyor/home" },
        // { label: "Survey", href: "/surveyor/home" }
    ];

    const navItems = user?.role.toLowerCase() === "admin" ? adminNavItems : surveyorNavItems;

    const handleNavClick = (href) => {
        navigate(href);
        handleMenuClose();
    };

    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate("/login");
    };

    return (
        <AppBar 
            position="static" 
            elevation={0}
            sx={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "linear-gradient(135deg, rgba(168, 237, 234, 0.1), rgba(254, 214, 227, 0.1))",
                    zIndex: -1
                }
            }}
        >
            <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
                <Typography
                    variant="h4"
                    component="div"
                    sx={{
                        flexGrow: 0,
                        fontWeight: 800,
                        color: "#333",
                        letterSpacing: "0.1em",
                        textShadow: "0 2px 4px rgba(255, 255, 255, 0.3)",
                        mr: 4
                    }}
                >
                    ESA
                </Typography>

                {!isMobile && (
                    <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
                        {navItems.map((item) => (
                            <Button
                                key={item.label}
                                onClick={() => handleNavClick(item.href)}
                                sx={{
                                    color: "#333",
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    textTransform: "none",
                                    px: 3,
                                    py: 1,
                                    borderRadius: 2,
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                                        transform: "translateY(-1px)",
                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                        backdropFilter: "blur(10px)"
                                    }
                                }}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </Box>
                )}

                <Box sx={{ flexGrow: isMobile ? 1 : 0, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2 }}>
                    {/* Google Translate Widget - Desktop */}
                    {!isMobile && (
                        <Box sx={{
                            '& #google_translate_element': {
                                '& .goog-te-gadget': {
                                    fontFamily: 'inherit !important',
                                    color: 'transparent !important'
                                },
                                '& .goog-te-gadget-simple': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.25) !important',
                                    border: '1px solid rgba(255, 255, 255, 0.2) !important',
                                    borderRadius: '8px !important',
                                    padding: '4px 8px !important',
                                    fontSize: '12px !important',
                                    backdropFilter: 'blur(10px)',
                                    color: '#333 !important'
                                },
                                '& .goog-te-gadget-simple .goog-te-menu-value': {
                                    color: '#333 !important',
                                    fontSize: '12px !important'
                                },
                                '& .goog-te-gadget-simple .goog-te-menu-value:hover': {
                                    color: '#555 !important'
                                },
                                '& .goog-te-gadget-icon': {
                                    display: 'none !important'
                                }
                            }
                        }}>
                            <GoogleTranslateWidget />
                        </Box>
                    )}

                    {/* Translate Icon Button for Mobile */}
                    {isMobile && (
                        <IconButton
                            onClick={handleTranslateMenuOpen}
                            sx={{
                                color: "#333",
                                backgroundColor: "rgba(255, 255, 255, 0.25)",
                                borderRadius: 2,
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.35)",
                                    transform: "translateY(-1px)"
                                },
                                transition: "all 0.3s ease"
                            }}
                        >
                            <TranslateIcon />
                        </IconButton>
                    )}

                    {!isMobile && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: "#555",
                                fontWeight: 500,
                                px: 2,
                                py: 1,
                                backgroundColor: "rgba(255, 255, 255, 0.25)",
                                borderRadius: 2,
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255, 255, 255, 0.2)"
                            }}
                        >
                            {user?.role}
                        </Typography>
                    )}

                    <Button
                        variant="outlined"
                        onClick={handleLogout}
                        sx={{
                            color: "#333",
                            borderColor: "rgba(51, 51, 51, 0.3)",
                            fontWeight: 600,
                            textTransform: "none",
                            borderRadius: 2,
                            px: { xs: 2, md: 3 },
                            "&:hover": {
                                borderColor: "#333",
                                backgroundColor: "rgba(51, 51, 51, 0.05)",
                                transform: "translateY(-1px)"
                            },
                            transition: "all 0.3s ease"
                        }}
                    >
                        Logout
                    </Button>
                </Box>

                {isMobile && (
                    <IconButton
                        size="large"
                        edge="end"
                        color="inherit"
                        aria-label="menu"
                        onClick={handleMenuOpen}
                        sx={{ 
                            color: "#333",
                            ml: 1
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}
            </Toolbar>

            {/* Main Navigation Menu for Mobile */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                slotProps={{
                    paper: {
                        sx: {
                            background: "rgba(255, 255, 255, 0.15)",
                            backdropFilter: "blur(20px)",
                            minWidth: 200,
                            mt: 1,
                            borderRadius: 2,
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                            border: "1px solid rgba(255, 255, 255, 0.2)"
                        }
                    }
                }}
            >
                {navItems.map((item) => (
                    <MenuItem
                        key={item.label}
                        onClick={() => handleNavClick(item.href)}
                        sx={{
                            color: "#333",
                            fontWeight: 600,
                            py: 1.5,
                            "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.25)"
                            }
                        }}
                    >
                        {item.label}
                    </MenuItem>
                ))}
                <MenuItem
                    sx={{
                        color: "#555",
                        fontWeight: 500,
                        py: 1,
                        fontSize: "0.875rem",
                        opacity: 0.8
                    }}
                >
                    Role: {user?.role || "User"}
                </MenuItem>
            </Menu>

            {/* Translate Menu for Mobile */}
            <Menu
                anchorEl={translateAnchorEl}
                open={Boolean(translateAnchorEl)}
                onClose={handleTranslateMenuClose}
                slotProps={{
                    paper: {
                        sx: {
                            background: "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(20px)",
                            minWidth: 200,
                            mt: 1,
                            borderRadius: 2,
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            '& #google_translate_element': {
                                padding: '16px',
                                '& .goog-te-gadget': {
                                    fontFamily: 'inherit !important',
                                    color: 'transparent !important'
                                },
                                '& .goog-te-gadget-simple': {
                                    backgroundColor: 'transparent !important',
                                    border: 'none !important',
                                    borderRadius: '8px !important',
                                    padding: '8px !important',
                                    fontSize: '14px !important',
                                    color: '#333 !important',
                                    width: '100% !important'
                                },
                                '& .goog-te-gadget-simple .goog-te-menu-value': {
                                    color: '#333 !important',
                                    fontSize: '14px !important'
                                },
                                '& .goog-te-gadget-icon': {
                                    display: 'none !important'
                                }
                            }
                        }
                    }
                }}
            >
                <Box>
                    <GoogleTranslateWidget />
                </Box>
            </Menu>
        </AppBar>
    );
}