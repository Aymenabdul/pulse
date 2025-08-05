import { useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    IconButton,
    Menu,
    MenuItem as MenuItemComponent,
    Container,
    Snackbar,
    Alert
} from "@mui/material";
import {
    Edit,
    Delete,
    MoreVert,
    Search,
    ArrowBack,
    Clear
} from "@mui/icons-material";
import { useNavigate } from "react-router";

export default function WithoutVoterId() {
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        name: '',
        houseNo: '',
        boothNumber: ''
    });

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedCardId, setSelectedCardId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const [entries, setEntries] = useState([
        { id: 1, name: "Aarav", houseNo: "22", boothNo: "1", relativeName: "Sita Devi", relativeStatus: "Mother" },
        { id: 2, name: "Divya", houseNo: "45", boothNo: "2", relativeName: "Rajesh Kumar", relativeStatus: "Husband" },
        { id: 3, name: "Ravi", houseNo: "12", boothNo: "1", relativeName: "Priya Sharma", relativeStatus: "Sister" },
    ]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            name: '',
            houseNo: '',
            boothNumber: ''
        });
    };

    const handleMenuOpen = (event, id) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedCardId(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedCardId(null);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleDelete = () => {
        setEntries(prev => prev.filter(e => e.id !== selectedCardId));
        setSnackbarMessage('Entry deleted successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        handleMenuClose();
    };

    const handleEdit = () => {
        setSnackbarMessage('Edit functionality will be implemented soon!');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
        handleMenuClose();
    };

    const handleBack = () => {
        const userRole = 'surveyor';

        if (userRole === 'admin') {
            navigate('/admin/dashboard');
        } else if (userRole === 'surveyor') {
            navigate('/surveyor/home');
        } else {
            navigate('/');
        }
    };

    const filteredEntries = entries.filter(entry => {
        return (
            (!filters.name || entry.name.toLowerCase().includes(filters.name.toLowerCase())) &&
            (!filters.houseNo || entry.houseNo.includes(filters.houseNo)) &&
            (!filters.boothNumber || entry.boothNo === filters.boothNumber)
        );
    });

    return (
        <Box sx={{ minHeight: '100vh', p: 3 }}>
            <Container maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ArrowBack />}
                        onClick={handleBack}
                        sx={{ px: 4, py: 1.5, fontWeight: 600, textTransform: 'none' }}
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => navigate('/survey/without-voter-id/form')}
                        sx={{ px: 4, py: 1.5, fontWeight: 600, textTransform: 'none' }}
                    >
                        Take Survey
                    </Button>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <TextField
                                fullWidth
                                label="Name"
                                value={filters.name}
                                onChange={(e) => handleFilterChange('name', e.target.value)}
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        background: 'transparent',
                                        '& fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.23)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'rgba(0, 0, 0, 0.87)',
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(0, 0, 0, 0.6)',
                                    },
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <TextField
                                fullWidth
                                label="House No"
                                value={filters.houseNo}
                                onChange={(e) => handleFilterChange('houseNo', e.target.value)}
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        background: 'transparent',
                                        '& fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.23)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'rgba(0, 0, 0, 0.87)',
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(0, 0, 0, 0.6)',
                                    },
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl fullWidth size="small" sx={{
                                '& .MuiOutlinedInput-root': {
                                    background: 'transparent',
                                    '& fieldset': {
                                        borderColor: 'rgba(0, 0, 0, 0.23)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(0, 0, 0, 0.5)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    color: 'rgba(0, 0, 0, 0.87)',
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(0, 0, 0, 0.6)',
                                },
                                '& .MuiSelect-icon': {
                                    color: 'rgba(0, 0, 0, 0.6)',
                                }
                            }}>
                                <InputLabel>Booth Number</InputLabel>
                                <Select
                                    value={filters.boothNumber || ""}
                                    label="Booth Number"
                                    onChange={(e) => handleFilterChange('boothNumber', e.target.value)}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="1">Booth 1</MenuItem>
                                    <MenuItem value="2">Booth 2</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Search />}
                            sx={{ textTransform: 'none', px: 4, py: 1 }}
                        >
                            Search
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Clear />}
                            onClick={handleClearFilters}
                            sx={{ textTransform: 'none', px: 4, py: 1 }}
                        >
                            Clear Filters
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {filteredEntries.map(entry => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={entry.id}>
                            <Card
                                sx={{
                                    height: '200px',
                                    backdropFilter: 'blur(10px)',
                                    background: 'rgba(255,255,255,0.3)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: 3,
                                    cursor: 'pointer',
                                    transition: '0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                                    }
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography variant="h6">{entry.name}</Typography>
                                        <IconButton onClick={(e) => handleMenuOpen(e, entry.id)}>
                                            <MoreVert />
                                        </IconButton>
                                    </Box>
                                    <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)', mt: 1 }}>
                                        <strong>House No:</strong> {entry.houseNo}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)', mt: 1 }}>
                                        <strong>Booth No:</strong> {entry.boothNo}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)', mt: 1 }}>
                                        <strong>Relative Name:</strong> {entry.relativeName}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)', mt: 1 }}>
                                        <strong>Relative Status:</strong> {entry.relativeStatus}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    slotProps={{
                        paper: {
                            sx: {
                                background: 'rgba(255,255,255,0.95)',
                                borderRadius: 2,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                            }
                        }
                    }}
                >
                    <MenuItemComponent onClick={handleEdit}>
                        <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
                    </MenuItemComponent>
                    <MenuItemComponent onClick={handleDelete}>
                        <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
                    </MenuItemComponent>
                </Menu>

                <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
}