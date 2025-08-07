import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Chip,
    IconButton,
    Menu,
    MenuItem as MenuItemComponent,
    Container,
    Snackbar,
    Alert,
    CircularProgress
} from "@mui/material";
import {
    ArrowBack,
    Search,
    MoreVert,
    Check,
    Clear,
    FilterList,
    Delete
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router";
import axiosInstance from "../../axios/axios";

export default function WithVoterId() {
    const navigate = useNavigate();
    const location = useLocation();

    const [filters, setFilters] = useState({
        survey: '',
        constituency: '',
        boothNumber: '',
        district: '',
        name: '',
        houseNo: ''
    });

    const [loading, setLoading] = useState({
        surveys: false,
        constituencies: false,
        booths: false,
        search: false
    });

    const [surveyOptions, setSurveyOptions] = useState([]);
    const [constituencyOptions, setConstituencyOptions] = useState([]);
    const [boothOptions, setBoothOptions] = useState([]);

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedVoterId, setSelectedVoterId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [showAdditionalFilters, setShowAdditionalFilters] = useState(false);

    const [voters, setVoters] = useState([]);

    const selectedVoter = voters.find(voter => voter.id === selectedVoterId);

    useEffect(() => {
        const fetchSurveys = async () => {
            setLoading(prev => ({ ...prev, surveys: true }));
            try {
                const response = await axiosInstance.get('/file/active');
                setSurveyOptions(response.data || []);
            } catch (error) {
                console.error('Error fetching active surveys:', error);
                showSnackbar('Error fetching surveys', 'error');
            } finally {
                setLoading(prev => ({ ...prev, surveys: false }));
            }
        };

        fetchSurveys();
    }, []);

    useEffect(() => {
        if (filters.survey) {
            fetchConstituencies(filters.survey);
            setFilters(prev => ({
                ...prev,
                constituency: '',
                boothNumber: ''
            }));
            setBoothOptions([]);
            setVoters([]); 
        } else {
            setConstituencyOptions([]);
            setBoothOptions([]);
            setVoters([]);
        }
    }, [filters.survey]);

    useEffect(() => {
        if (filters.survey && filters.constituency) {
            fetchBooths(filters.survey, filters.constituency);
            setFilters(prev => ({
                ...prev,
                boothNumber: ''
            }));
            setVoters([]); 
        } else {
            setBoothOptions([]);
            setVoters([]);
        }
    }, [filters.constituency]);

    useEffect(() => {
        if (!filters.boothNumber) {
            setVoters([]);
        }
    }, [filters.boothNumber]);

    const fetchActiveSurveys = async () => {
        setLoading(prev => ({ ...prev, surveys: true }));
        try {
            const response = await axiosInstance.get('/file/active');
            setSurveyOptions(response.data || []);
        } catch (error) {
            console.error('Error fetching active surveys:', error);
            showSnackbar('Error fetching surveys', 'error');
        } finally {
            setLoading(prev => ({ ...prev, surveys: false }));
        }
    };

    const fetchConstituencies = async (surveyName) => {
        setLoading(prev => ({ ...prev, constituencies: true }));
        try {
            const response = await axiosInstance.get(`/file/distinct-constituencies?surveyName=${encodeURIComponent(surveyName)}`);
            setConstituencyOptions(response.data || []);
        } catch (error) {
            console.error('Error fetching constituencies:', error);
            showSnackbar('Error fetching constituencies', 'error');
        } finally {
            setLoading(prev => ({ ...prev, constituencies: false }));
        }
    };

    const fetchBooths = async (surveyName, constituency) => {
        setLoading(prev => ({ ...prev, booths: true }));
        try {
            const response = await axiosInstance.get(`/file/distinct-booths?surveyName=${encodeURIComponent(surveyName)}&Constituency=${encodeURIComponent(constituency)}`);
            setBoothOptions(response.data || []);
        } catch (error) {
            console.error('Error fetching booths:', error);
            showSnackbar('Error fetching booths', 'error');
        } finally {
            setLoading(prev => ({ ...prev, booths: false }));
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            survey: '',
            constituency: '',
            boothNumber: '',
            district: '',
            name: '',
            houseNo: ''
        });
        setConstituencyOptions([]);
        setBoothOptions([]);
        setVoters([]);
        setShowAdditionalFilters(false);
    };

    const handleMenuOpen = (event, voterId) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedVoterId(voterId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedVoterId(null);
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleDelete = () => {
        setVoters(prev => prev.filter(voter => voter.id !== selectedVoterId));
        showSnackbar('Entry deleted successfully!', 'success');
        handleMenuClose();
    };

    const handleVotedToggle = async () => {
        try {
            const response = await axiosInstance.post(`/file/markAsVoted/${selectedVoterId}`);
            if (response.status === 200) {
                setVoters(prev =>
                    prev.map(voter =>
                        voter.id === selectedVoterId
                            ? { ...voter, voted: true }
                            : voter
                    )
                );
                showSnackbar('Voter marked as voted!', 'success');
            } else {
                showSnackbar('Failed to mark as voted.', 'error');
            }
        } catch (error) {
            console.error('Error marking voted:', error);
            showSnackbar('Error marking voted.', 'error');
        } finally {
            handleMenuClose();
        }
    };

    const handleVerifiedToggle = () => {
        setVoters(prev =>
            prev.map(voter =>
                voter.id === selectedVoterId
                    ? { ...voter, verified: !voter.verified }
                    : voter
            )
        );
        showSnackbar(selectedVoter?.verified ? 'Voter unmarked as verified.' : 'Voter marked as verified!', 'success');
        handleMenuClose();
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

    const handleNavigateToSurvey = (id) => {
        const currentPath = location.pathname;

        if (currentPath.includes('/admin')) {
            navigate(`/admin/with-voter-id/form/${id}`);
        } else if (currentPath.includes('/surveyor')) {
            navigate(`/surveyor/with-voter-id/form/${id}`);
        } else {
            navigate('/');
        }
    }

    const handleSearch = async () => {
        if (!filters.survey || !filters.constituency || !filters.boothNumber) {
            showSnackbar('Please select survey, constituency, and booth number to search', 'warning');
            return;
        }

        setLoading(prev => ({ ...prev, search: true }));
        
        try {
            const params = new URLSearchParams({
                surveyName: filters.survey,
                Constituency: filters.constituency,
                booth: filters.boothNumber
            });

            if (filters.name.trim()) {
                params.append('name', filters.name.trim());
            }
            if (filters.houseNo.trim()) {
                params.append('houseNumber', filters.houseNo.trim());
            }

            const response = await axiosInstance.get(`/file/filter2?${params.toString()}`);
            console.log(response.data);
            
            const transformedVoters = response.data.map((voter, index) => ({
                id: voter.id || index + 1, 
                name: voter.name || 'N/A',
                voterId: voter.voterId || voter.voterID || 'N/A',
                serialNumber: voter.serialNumber || voter.serialNo || 'N/A',
                relative: voter.relationName || 'N/A',
                boothNo: voter.booth,
                houseNo: voter.houseNumber || 'N/A',
                constituency: voter.constituency || filters.constituency,
                survey: voter.survey || voter.surveyName || filters.survey,
                district: voter.district || filters.district || 'N/A',
                voted: voter.voted || false,
                verified: voter.verified || false
            }));

            setVoters(transformedVoters);
            
            if (transformedVoters.length === 0) {
                showSnackbar('No voters found matching your criteria', 'info');
            } else {
                showSnackbar(`Found ${transformedVoters.length} voter(s)`, 'success');
            }
        } catch (error) {
            console.error('Error searching voters:', error);
            if (error.response?.status === 404) {
                showSnackbar('No voters found matching your criteria', 'info');
                setVoters([]);
            } else {
                showSnackbar('Error searching voters. Please try again.', 'error');
            }
        } finally {
            setLoading(prev => ({ ...prev, search: false }));
        }
    };

    const filteredVoters = voters.filter(voter => {
        const nameMatch = !filters.name || voter.name.toLowerCase().includes(filters.name.toLowerCase());
        const houseNoMatch = !filters.houseNo || voter.houseNo.toString().includes(filters.houseNo);
        const boothNumberMatch = !filters.boothNumber ||
                                 (voter.boothNo !== undefined && voter.boothNo !== null &&
                                  voter.boothNo.toString() === filters.boothNumber.toString());
        const constituencyMatch = !filters.constituency || voter.constituency === filters.constituency;
        const surveyMatch = !filters.survey || voter.survey === filters.survey;
        const districtMatch = !filters.district || voter.district === filters.district;

        return nameMatch && houseNoMatch && boothNumberMatch && constituencyMatch && surveyMatch && districtMatch;
    });

    const isAnyFilterActive = Object.keys(filters).some(key => filters[key] !== '');
    const shouldShowVoters = filters.survey && filters.constituency && filters.boothNumber;

    return (
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, height: "100%", alignItems: "center", justifyContent: "center" }}>
            <Container maxWidth="xl">
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ArrowBack />}
                        onClick={handleBack}
                        sx={{ px: 4, py: 1.5, fontWeight: 600, textTransform: 'none' }}
                    >
                        Back
                    </Button>
                </Box>

                <Box sx={{ mb: 6 }}>
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Survey</InputLabel>
                                <Select
                                    value={filters.survey}
                                    label="Survey"
                                    onChange={(e) => handleFilterChange('survey', e.target.value)}
                                    disabled={loading.surveys}
                                    endAdornment={loading.surveys && <CircularProgress size={20} />}
                                >
                                    <MenuItem value="">Select Survey</MenuItem>
                                    {surveyOptions.map((survey) => (
                                        <MenuItem key={survey.id || survey} value={survey.surveyName || survey}>
                                            {survey.surveyName || survey}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Constituency</InputLabel>
                                <Select
                                    value={filters.constituency}
                                    label="Constituency"
                                    onChange={(e) => handleFilterChange('constituency', e.target.value)}
                                    disabled={!filters.survey || loading.constituencies}
                                    endAdornment={loading.constituencies && <CircularProgress size={20} />}
                                >
                                    <MenuItem value="">Select Constituency</MenuItem>
                                    {constituencyOptions.map((constituency, index) => (
                                        <MenuItem key={index} value={constituency}>
                                            {constituency}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Booth Number</InputLabel>
                                <Select
                                    value={filters.boothNumber}
                                    label="Booth Number"
                                    onChange={(e) => handleFilterChange('boothNumber', e.target.value)}
                                    disabled={!filters.constituency || loading.booths}
                                    endAdornment={loading.booths && <CircularProgress size={20} />}
                                >
                                    <MenuItem value="">Select Booth</MenuItem>
                                    {boothOptions.map((booth, index) => (
                                        <MenuItem key={index} value={booth}>
                                            Booth {booth}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>District</InputLabel>
                                <Select
                                    value={filters.district}
                                    label="District"
                                    onChange={(e) => handleFilterChange('district', e.target.value)}
                                >
                                    <MenuItem value="">Select District</MenuItem>
                                    <MenuItem value="madurai">Madurai</MenuItem>
                                    <MenuItem value="theni">Theni</MenuItem>
                                    <MenuItem value="dindigul">Dindigul</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid> */}

                        {showAdditionalFilters && (
                            <>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <TextField
                                        fullWidth
                                        label="Name"
                                        placeholder="Search by name"
                                        value={filters.name}
                                        onChange={(e) => handleFilterChange('name', e.target.value)}
                                        size="small"
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <TextField
                                        fullWidth
                                        label="House No"
                                        placeholder="House number"
                                        value={filters.houseNo}
                                        onChange={(e) => handleFilterChange('houseNo', e.target.value)}
                                        size="small"
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>

                    <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
                        <Button
                            variant="outlined"
                            startIcon={loading.search ? <CircularProgress size={16} /> : <Search />}
                            onClick={handleSearch}
                            disabled={!shouldShowVoters || loading.search}
                            sx={{
                                textTransform: 'none',
                                px: 4,
                                py: 1,
                                borderColor: '#03a9f4',
                                color: '#03a9f4',
                                '&:hover': {
                                    backgroundColor: 'rgba(3, 169, 244, 0.04)',
                                    borderColor: '#0288d1',
                                    color: '#0288d1'
                                },
                                '&:disabled': {
                                    borderColor: 'rgba(0, 0, 0, 0.12)',
                                    color: 'rgba(0, 0, 0, 0.26)'
                                }
                            }}
                        >
                            {loading.search ? 'Searching...' : 'Search'}
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<Clear />}
                            onClick={handleClearFilters}
                            sx={{
                                textTransform: 'none',
                                px: 4,
                                py: 1,
                                borderColor: '#ef4444',
                                color: '#ef4444',
                                '&:hover': {
                                    bgcolor: 'rgba(239, 68, 68, 0.04)',
                                    borderColor: '#dc2626',
                                    color: '#dc2626'
                                }
                            }}
                        >
                            Clear Filters
                        </Button>
                        <IconButton
                            onClick={() => setShowAdditionalFilters(prev => !prev)}
                            sx={{
                                ml: 2,
                                color: 'rgba(0, 0, 0, 0.6)',
                                '&:hover': {
                                    bgcolor: 'rgba(0, 0, 0, 0.04)'
                                }
                            }}
                        >
                            <FilterList />
                        </IconButton>
                    </Box>
                </Box>

                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 600,
                            color: 'rgba(0, 0, 0, 0.85)',
                            mb: 2
                        }}
                    >
                        Voter Details
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {shouldShowVoters && filteredVoters.length > 0 ? (
                        filteredVoters.map((voter) => (
                            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={voter.id}>
                                <Card
                                    onClick={() => handleNavigateToSurvey(voter?.id)}
                                    sx={{
                                        background: 'rgba(255, 255, 255, 0.25)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        borderRadius: 3,
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        height: '240px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                                            background: 'rgba(255, 255, 255, 0.35)'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                                <Typography
                                                    variant="h5"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: 'rgba(0, 0, 0, 0.85)',
                                                        mr: 1
                                                    }}
                                                >
                                                    {voter?.name}
                                                </Typography>
                                                {voter?.verified && (
                                                    <Box
                                                        sx={{
                                                            width: 20,
                                                            height: 20,
                                                            bgcolor: '#4ade80',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <Check sx={{ fontSize: 14, color: 'white' }} />
                                                    </Box>
                                                )}
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {voter?.voted && (
                                                    <Chip
                                                        label="Voted"
                                                        size="small"
                                                        sx={{
                                                            bgcolor: '#4ade80',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            fontSize: '0.75rem',
                                                            height: '24px'
                                                        }}
                                                    />
                                                )}
                                                <IconButton
                                                    onClick={(e) => handleMenuOpen(e, voter.id)}
                                                    sx={{
                                                        color: 'rgba(0, 0, 0, 0.6)',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(0, 0, 0, 0.04)'
                                                        }
                                                    }}
                                                >
                                                    <MoreVert />
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        <Box>
                                            <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)', mb: 0.5 }}>
                                                <strong>Voter ID:</strong> {voter?.voterId}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)', mb: 0.5 }}>
                                                <strong>Serial Number:</strong> {voter?.serialNumber}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)', mb: 0.5 }}>
                                                <strong>Relative:</strong> {voter.relative}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)', mb: 0.5 }}>
                                                <strong>Booth No:</strong> {voter.boothNo}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                                                <strong>House No:</strong> {voter.houseNo}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : shouldShowVoters ? (
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ textAlign: 'center', mt: 4, color: 'rgba(0, 0, 0, 0.6)' }}>
                                {loading.search ? (
                                    <CircularProgress />
                                ) : voters.length === 0 ? (
                                    <Typography variant="h6">
                                        Click "Search" to find voters matching your criteria.
                                    </Typography>
                                ) : (
                                    <Typography variant="h6">
                                        No voters found matching your criteria.
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    ) : (
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ textAlign: 'center', mt: 4, color: 'rgba(0, 0, 0, 0.6)' }}>
                                <Typography variant="h6">
                                    Please select survey, constituency, and booth to search for voter details.
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    slotProps={{
                        paper: {
                            sx: {
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: 2,
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                minWidth: 150
                            }
                        }
                    }}
                >
                    <MenuItemComponent onClick={handleVotedToggle}>
                        {selectedVoter?.voted ? 'Unmark Voted' : 'Mark Voted'}
                    </MenuItemComponent>
                    <MenuItemComponent onClick={handleVerifiedToggle}>
                        {selectedVoter?.verified ? 'Unmark Verified' : 'Mark Verified'}
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