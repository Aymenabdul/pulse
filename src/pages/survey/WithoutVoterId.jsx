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
    CircularProgress,
    IconButton,
    Chip,
    TablePagination
} from "@mui/material";
import {
    ArrowBack,
    Clear,
    Edit
} from "@mui/icons-material";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import axiosInstance from "../../axios/axios";
import { useAuth } from "../../hooks/useAuth";

export default function WithoutVoterId() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [filters, setFilters] = useState({
        surveyName: searchParams.get('surveyName') || '',
        name: searchParams.get('name') || '',
        gender: searchParams.get('gender') || '',
        age: searchParams.get('age') || '',
        created_by: searchParams.get('created_by') || '',
        updated_by: searchParams.get('updated_by') || ''
    });
    
    const [surveys, setSurveys] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    
    const [page, setPage] = useState(parseInt(searchParams.get('page')) || 0);
    const [rowsPerPage, setRowsPerPage] = useState(parseInt(searchParams.get('rowsPerPage')) || 10);

    useEffect(() => {
        const fetchSurveys = async () => {
            try {
                const response = await axiosInstance.get('/file/active');
                setSurveys(response.data || []);
            } catch (error) {
                console.error('Error fetching surveys:', error);
                setSnackbarMessage(`Failed to load surveys: ${error.message}`);
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                setSurveys([]);
            }
        };

        const fetchData = async () => {
            if (!filters.surveyName) {
                setTableData([]);
                return;
            }

            try {
                setLoading(true);
                const response = await axiosInstance.get(`/survey/votersbyId?surveyName=${filters.surveyName}&userId=${user?.id}`);
                console.log(response.data);
                setTableData(response.data || []);
                setSnackbarMessage('Data loaded successfully!');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
            } catch (error) {
                console.error('Error fetching data:', error);
                setSnackbarMessage(`Failed to load data: ${error.message}`);
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                setTableData([]);
            } finally {
                setLoading(false);
            }
        };

        if (surveys.length === 0) {
            fetchSurveys();
        }

        if (filters.surveyName) {
            fetchData();
        }
    }, [filters.surveyName, user?.id, surveys.length]);

    useEffect(() => {
        const params = new URLSearchParams();
        
        if (filters.surveyName) params.set('surveyName', filters.surveyName);
        if (filters.name) params.set('name', filters.name);
        if (filters.gender) params.set('gender', filters.gender);
        if (filters.age) params.set('age', filters.age);
        if (filters.created_by) params.set('created_by', filters.created_by);
        if (filters.updated_by) params.set('updated_by', filters.updated_by);
        if (page > 0) params.set('page', page.toString());
        if (rowsPerPage !== 10) params.set('rowsPerPage', rowsPerPage.toString());
        
        setSearchParams(params);
    }, [filters, page, rowsPerPage, setSearchParams]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        if (field !== 'surveyName') {
            setPage(0);
        }
    };

    const handleClearFilters = () => {
        setFilters({
            surveyName: '',
            name: '',
            gender: '',
            age: '',
            created_by: '',
            updated_by: ''
        });
        setPage(0);
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
        const currentParams = searchParams.toString();
        const paramString = currentParams ? `?${currentParams}` : '';
        
        if (currentPath.includes('/admin')) {
            navigate(`/admin/without-voter-id/form${paramString}`);
        } else if (currentPath.includes('/surveyor')) {
            navigate(`/surveyor/without-voter-id/form${paramString}`);
        } else {
            navigate(`/survey/without-voter-id/form${paramString}`);
        }
    };

    const handleEditVoter = (voterId) => {
        const currentPath = location.pathname;
        const currentParams = searchParams.toString();
        const paramString = currentParams ? `&${currentParams}` : '';
        
        if (currentPath.includes('/admin')) {
            navigate(`/admin/without-voter-id/form?id=${voterId}${paramString}`);
        } else if (currentPath.includes('/surveyor')) {
            navigate(`/surveyor/without-voter-id/form?id=${voterId}${paramString}`);
        } else {
            navigate(`/survey/without-voter-id/form?id=${voterId}${paramString}`);
        }
    };

    const filteredData = tableData.filter(item => {
        const nameMatch = !filters.name || 
            (item.name && item.name.toLowerCase().includes(filters.name.toLowerCase()));
        
        const genderMatch = !filters.gender || 
            (item.gender && item.gender.toLowerCase() === filters.gender.toLowerCase());

        const ageMatch = !filters.age || 
            (item.age && item.age === filters.age);

        const createdByMatch = !filters.created_by || 
            (item.created_by && item.created_by.toLowerCase().includes(filters.created_by.toLowerCase()));

        const updatedByMatch = !filters.updated_by || 
            (item.updated_by && item.updated_by.toLowerCase().includes(filters.updated_by.toLowerCase()));

        return nameMatch && genderMatch && ageMatch && createdByMatch && updatedByMatch;
    });

    const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{ minHeight: '100vh', p: 3 }}>
            <Container maxWidth="xl">
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

                <Box sx={{ mb: 4 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                                <InputLabel>Survey Name *</InputLabel>
                                <Select
                                    value={filters.surveyName}
                                    label="Survey Name *"
                                    onChange={(e) => handleFilterChange('surveyName', e.target.value)}
                                >
                                    <MenuItem value="">Select Survey</MenuItem>
                                    {surveys.map((surveyName, index) => (
                                        <MenuItem key={index} value={surveyName}>
                                            {surveyName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TextField
                                fullWidth
                                label="Created By"
                                value={filters.created_by}
                                onChange={(e) => handleFilterChange('created_by', e.target.value)}
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
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TextField
                                fullWidth
                                label="Updated By"
                                value={filters.updated_by}
                                onChange={(e) => handleFilterChange('updated_by', e.target.value)}
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
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<Clear />}
                                onClick={handleClearFilters}
                                sx={{ textTransform: 'none', px: 4, py: 1, height: '100%' }}
                                fullWidth
                            >
                                Clear Filters
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {!filters.surveyName ? (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        minHeight: '300px',
                        flexDirection: 'column'
                    }}>
                        <Typography variant="h5" color="textSecondary" gutterBottom>
                            Select Survey Name to Display Data
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            Please choose a survey from the dropdown above to view voter data
                        </Typography>
                    </Box>
                ) : loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                        <Typography variant="body1" sx={{ ml: 2, alignSelf: 'center' }}>
                            Loading data...
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <TableContainer 
                            component={Paper} 
                            sx={{ 
                                background: 'rgba(255,255,255,0.9)',
                                borderRadius: 3,
                                backdropFilter: 'blur(10px)',
                                mb: 2
                            }}
                        >
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: 'rgba(25, 118, 210, 0.1)' }}>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            Name
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            Gender
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            Age
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            Survey Name
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            Voter Type
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            Created By
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            Created Date
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            Updated By
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            Updated Date
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((item, index) => (
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
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                                                        {item.name || 'N/A'}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center" sx={{ textTransform: 'capitalize' }}>
                                                    {item.gender || 'N/A'}
                                                </TableCell>
                                                <TableCell align="center">{item.age || 'N/A'}</TableCell>
                                                <TableCell align="center">{item.surveyName || 'N/A'}</TableCell>
                                                <TableCell align="center">
                                                    <Chip 
                                                        label={item?.voter_type || 'N/A'} 
                                                        size="small"
                                                        color={item?.voter_type === 'Public' ? 'primary' : 'default'}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">{item?.created_by || 'N/A'}</TableCell>
                                                <TableCell align="center">{item?.createdAt || 'N/A'}</TableCell>
                                                <TableCell align="center">{item?.updated_by || 'N/A'}</TableCell>
                                                <TableCell align="center">{item?.updatedDate || 'N/A'}</TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                        <IconButton 
                                                            size="small" 
                                                            color="primary"
                                                            onClick={() => handleEditVoter(item.id)}
                                                            title="Edit Voter"
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                                                <Typography variant="h6" color="textSecondary">
                                                    {tableData.length === 0 ? 'No data available' : 'No matching records found'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            component="div"
                            count={filteredData.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            sx={{
                                background: 'rgba(255,255,255,0.9)',
                                borderRadius: 3,
                                backdropFilter: 'blur(10px)'
                            }}
                        />
                    </>
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