import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Container,
    Snackbar,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress
} from "@mui/material";
import {
    ArrowBack,
    Clear
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router";

export default function WithoutVoterId() {
    const navigate = useNavigate();
    const location = useLocation();

    const [filters, setFilters] = useState({
        name: '',
        age: '',
        gender: ''
    });

    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/survey/');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const responseText = await response.text();
                console.log('Raw API Response:', responseText); // Log raw response
                
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    // console.error('JSON Parse Error:', parseError);
                    console.log('Response that failed to parse:', responseText);
                    throw new Error('Invalid JSON response from server');
                }
                
                console.log('Parsed API Response:', data); // Console log the parsed response
                
                setTableData(Array.isArray(data) ? data : []);
                setSnackbarMessage('Data loaded successfully!');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
            } catch (error) {
                console.error('Error fetching data:', error);
                setSnackbarMessage(`Failed to load data: ${error.message}`);
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                // Set empty array so component doesn't crash
                setTableData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            name: '',
            age: '',
            gender: ''
        });
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleBack = () => {
        const currentPath = location.pathname;

        if (currentPath.includes('/admin')) {
            navigate('/admin/dashboard');
        } else if (currentPath.includes('/surveyor')) {
            navigate('/surveyor/home');
        } else {
            navigate('/');
        }
    };

    const handleTakeSurvey = () => {
        const currentPath = location.pathname;
        
        if (currentPath.includes('/admin')) {
            navigate('/admin/without-voter-id/form');
        } else if (currentPath.includes('/surveyor')) {
            navigate('/surveyor/without-voter-id/form');
        } else {
            // Default fallback
            navigate('/survey/without-voter-id/form');
        }
    };

    // Helper function to get age range
    const getAgeRange = (age) => {
        if (!age || isNaN(age)) return 'Unknown';
        
        const ageNum = parseInt(age);
        if (ageNum >= 18 && ageNum <= 24) return '18-24';
        if (ageNum >= 25 && ageNum <= 30) return '25-30';
        if (ageNum >= 31 && ageNum <= 35) return '31-35';
        if (ageNum >= 36 && ageNum <= 40) return '36-40';
        if (ageNum > 40) return 'Above 40';
        return 'Below 18';
    };

    // Filter data based on search criteria
    const filteredData = tableData.filter(item => {
        const nameMatch = !filters.name || 
            (item.name && item.name.toLowerCase().includes(filters.name.toLowerCase()));
        
        const ageMatch = !filters.age || getAgeRange(item.age) === filters.age;
        
        const genderMatch = !filters.gender || 
            (item.gender && item.gender.toLowerCase() === filters.gender.toLowerCase());

        return nameMatch && ageMatch && genderMatch;
    });

    return (
        <Box sx={{ minHeight: '100vh', p: 3 }}>
            <Container maxWidth="xl">
                {/* Header with Back and Take Survey buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
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
                        onClick={handleTakeSurvey}
                        sx={{ px: 4, py: 1.5, fontWeight: 600, textTransform: 'none' }}
                    >
                        Take Survey
                    </Button>
                </Box>

                <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                    Without Voter ID Survey Data
                </Typography>

                {/* Filter Section */}
                <Box sx={{ mb: 4 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <TextField
                                fullWidth
                                label="Search by Name"
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
                                <InputLabel>Age Range</InputLabel>
                                <Select
                                    value={filters.age}
                                    label="Age Range"
                                    onChange={(e) => handleFilterChange('age', e.target.value)}
                                >
                                    <MenuItem value="">All Ages</MenuItem>
                                    <MenuItem value="18-24">18-24</MenuItem>
                                    <MenuItem value="25-30">25-30</MenuItem>
                                    <MenuItem value="31-35">31-35</MenuItem>
                                    <MenuItem value="36-40">36-40</MenuItem>
                                    <MenuItem value="Above 40">Above 40</MenuItem>
                                </Select>
                            </FormControl>
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
                                <InputLabel>Gender</InputLabel>
                                <Select
                                    value={filters.gender}
                                    label="Gender"
                                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                                >
                                    <MenuItem value="">All Genders</MenuItem>
                                    <MenuItem value="male">Male</MenuItem>
                                    <MenuItem value="female">Female</MenuItem>
                                    <MenuItem value="other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3 }}>
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

                {/* Table Section */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer 
                        component={Paper} 
                        sx={{ 
                            background: 'rgba(255,255,255,0.9)',
                            borderRadius: 3,
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'rgba(25, 118, 210, 0.1)' }}>
                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                        Name
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                        Age Range
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                        Gender
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((item, index) => (
                                        <TableRow 
                                            key={item.id || index}
                                            sx={{ 
                                                '&:nth-of-type(odd)': { 
                                                    backgroundColor: 'rgba(0, 0, 0, 0.04)' 
                                                },
                                                '&:hover': {
                                                    backgroundColor: 'rgba(25, 118, 210, 0.1)'
                                                }
                                            }}
                                        >
                                            <TableCell>{item.name || 'N/A'}</TableCell>
                                            <TableCell>{getAgeRange(item.age)}</TableCell>
                                            <TableCell sx={{ textTransform: 'capitalize' }}>
                                                {item.gender || 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                            <Typography variant="h6" color="textSecondary">
                                                {tableData.length === 0 ? 'No data available' : 'No matching records found'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
}