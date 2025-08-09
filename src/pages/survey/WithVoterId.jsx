import { useState, useEffect, useCallback } from "react";
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
    CircularProgress,
    Skeleton,
    Pagination,
    Stack
} from "@mui/material";
import {
    ArrowBack,
    Search,
    MoreVert,
    Check,
    Clear,
    FilterList,
    Delete,
    Verified
} from "@mui/icons-material";
import { useNavigate, useLocation, useSearchParams } from "react-router";
import axiosInstance from "../../axios/axios";

const VoterCardSkeleton = () => (
    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
        <Card
            sx={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                minHeight: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <CardContent sx={{ p: 3, flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                        <Skeleton variant="text" width={120} height={24} sx={{ mr: 1 }} />
                        <Skeleton variant="circular" width={20} height={20} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 12 }} />
                        <Skeleton variant="circular" width={24} height={24} />
                    </Box>
                </Box>

                <Box>
                    <Skeleton variant="text" width="80%" height={20} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="70%" height={20} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="50%" height={20} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="55%" height={20} />
                </Box>
            </CardContent>
        </Card>
    </Grid>
);

export default function WithVoterId() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const [filters, setFilters] = useState({
        survey: searchParams.get('survey') || '',
        constituency: searchParams.get('constituency') || '',
        boothNumber: searchParams.get('boothNumber') || '',
        district: searchParams.get('district') || '',
        name: searchParams.get('name') || '',
        houseNo: searchParams.get('houseNo') || ''
    });
    const [isUpdatingPage, setIsUpdatingPage] = useState(false);
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const itemsPerPage = 15;

    useEffect(() => {
        const savedFilters = localStorage.getItem('filters');
        if (savedFilters) {
            setFilters(JSON.parse(savedFilters));
        }
    }, []);

    const [loading, setLoading] = useState({
        surveys: false,
        constituencies: false,
        booths: false,
        search: false
    });

    const [surveyOptions, setSurveyOptions] = useState([]);
    const [constituencyOptions, setConstituencyOptions] = useState([]);
    const [boothOptions, setBoothOptions] = useState([]);
    const [surveyData, setSurveyData] = useState([]);

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedVoterId, setSelectedVoterId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [showAdditionalFilters, setShowAdditionalFilters] = useState(
        Boolean(searchParams.get('name') || searchParams.get('houseNo'))
    );
    const [allVoters, setAllVoters] = useState([]);
    const [voters, setVoters] = useState([]);

    const [isInitialized, setIsInitialized] = useState(false);
    const [hasAttemptedSearch, setHasAttemptedSearch] = useState(false);

    const selectedVoter = voters.find(voter => voter.id === selectedVoterId);
    const totalPages = Math.ceil(voters.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageVoters = voters.slice(startIndex, endIndex);

    const updateURLParams = useCallback((newFilters, page = currentPage) => {
        const params = new URLSearchParams();
        
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && value.trim()) {
                params.set(key, value);
            }
        });

        if (page > 1) {
            params.set('page', page.toString());
        }

        setSearchParams(params);
    }, [setSearchParams, currentPage]);

    const handlePageChange = (event, page) => {
        setIsUpdatingPage(true);
        setCurrentPage(page);
        updateURLParams(filters, page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setIsUpdatingPage(false), 100);
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const fetchSurveyData = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/survey/voters');
            setSurveyData(response.data || []);
        } catch (error) {
            console.error('Error fetching survey data:', error);
        }
    }, []);

    const fetchActiveSurveys = useCallback(async () => {
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
    }, []);

    const fetchConstituencies = useCallback(async (surveyName) => {
        if (!surveyName) return;
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
    }, []);

    const fetchBooths = useCallback(async (surveyName, constituency) => {
        if (!surveyName || !constituency) return;
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
    }, []);

    const isVoterVerified = useCallback((voterId) => {
        const isVerified = surveyData.some(survey => 
            survey.fileDataId === String(voterId) && survey.verified === true
        );
        return isVerified;
    }, [surveyData]);

    const fetchVoters = useCallback(async (currentFilters) => {
        const { survey, constituency, boothNumber, name, houseNo } = currentFilters;

        if (!survey || !constituency || !boothNumber) {
            setVoters([]);
            setCurrentPage(1);
            return;
        }

        setLoading(prev => ({ ...prev, search: true }));

        try {
            const params = new URLSearchParams({
                surveyName: survey,
                Constituency: constituency,
                booth: boothNumber
            });

            if (name.trim()) {
                params.append('name', name.trim());
            }
            if (houseNo.trim()) {
                params.append('houseNumber', houseNo.trim());
            }

            const response = await axiosInstance.get(`/file/filter2?${params.toString()}`);
            
            const transformedVoters = response.data.map((voter, index) => {
                const isVerified = isVoterVerified(voter.id);
                
                return {
                    id: voter.id || index + 1, 
                    name: voter.name || 'N/A',
                    voterId: voter.voterId || voter.voterID || 'N/A',
                    serialNumber: voter.serialNumber || voter.serialNo || 'N/A',
                    relative: voter.relationName || 'N/A',
                    boothNo: voter.booth,
                    houseNo: voter.houseNumber || 'N/A',
                    constituency: voter.constituency || constituency,
                    survey: voter.survey || voter.surveyName || survey,
                    district: voter.district || 'N/A',
                    voted: voter.voted || false,
                    verified: isVerified
                };
            });
            
            const filtered = transformedVoters.filter(voter => {
                const matchesName = name.trim()
                    ? voter.name.toLowerCase().includes(name.trim().toLowerCase())
                    : true;

                const matchesHouse = houseNo.trim()
                    ? voter.houseNo.toLowerCase().includes(houseNo.trim().toLowerCase())
                    : true;

                return matchesName && matchesHouse;
            });

            setAllVoters(transformedVoters);
            setVoters(filtered);
            
            const urlPage = parseInt(searchParams.get('page')) || 1;
            const maxPage = Math.ceil(filtered.length / itemsPerPage);

            if (urlPage > maxPage && maxPage > 0) {
                setCurrentPage(maxPage);
                updateURLParams(currentFilters, maxPage);
            } else if (urlPage <= maxPage) {
                setCurrentPage(urlPage);
            }
        } catch (error) {
            console.error('Error searching voters:', error);
            if (error.response?.status === 404) {
                setVoters([]);
                setCurrentPage(1);
            } else {
                showSnackbar('Error searching voters. Please try again.', 'error');
            }
        } finally {
            setLoading(prev => ({ ...prev, search: false }));
        }
    }, [isVoterVerified, updateURLParams]);

    useEffect(() => {
        const initializeData = async () => {
            await fetchActiveSurveys();
            await fetchSurveyData();
            setIsInitialized(true);
        };
        
        initializeData();
    }, [fetchActiveSurveys, fetchSurveyData]);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!isInitialized) return;

            if (filters.survey && !constituencyOptions.length) {
                await fetchConstituencies(filters.survey);
            }
        };

        loadInitialData();
    }, [isInitialized, filters.survey, constituencyOptions.length, fetchConstituencies]);

    useEffect(() => {
        const loadBooths = async () => {
            if (!isInitialized) return;

            if (filters.survey && filters.constituency && !boothOptions.length) {
                await fetchBooths(filters.survey, filters.constituency);
            }
        };

        loadBooths();
    }, [isInitialized, filters.survey, filters.constituency, boothOptions.length, fetchBooths]);

    useEffect(() => {
        if (!isInitialized) return;

        const delayDebounceFn = setTimeout(async () => {
            if (filters.survey && filters.constituency && filters.boothNumber) {
                setHasAttemptedSearch(true);
                await fetchVoters(filters);
            } else {
                setVoters([]);
                setAllVoters([]);
                setCurrentPage(1);
                if (!filters.survey && !filters.constituency && !filters.boothNumber) {
                    setHasAttemptedSearch(false);
                }
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [filters, isInitialized, surveyData, fetchVoters]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [field]: value };

            if (field === 'survey') {
                newFilters.constituency = '';
                newFilters.boothNumber = '';
                setConstituencyOptions([]);
                setBoothOptions([]);
                if (value) {
                    fetchConstituencies(value);
                }
            } else if (field === 'constituency') {
                newFilters.boothNumber = '';
                setBoothOptions([]);
                if (value && newFilters.survey) {
                    fetchBooths(newFilters.survey, value);
                }
            }

            localStorage.setItem('filters', JSON.stringify(newFilters));
            
            setCurrentPage(1);
            updateURLParams(newFilters, 1);

            return newFilters;
        });
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            survey: '',
            constituency: '',
            boothNumber: '',
            district: '',
            name: '',
            houseNo: ''
        };

        setFilters(clearedFilters);
        setConstituencyOptions([]);
        setBoothOptions([]);
        setAllVoters([]);
        setVoters([]);
        setShowAdditionalFilters(false);
        setHasAttemptedSearch(false);
        setCurrentPage(1);
        setSearchParams(new URLSearchParams());
        localStorage.removeItem('filters');
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

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/file/delete/${selectedVoterId}`);
            setVoters(prev => prev.filter(voter => voter.id !== selectedVoterId));
            showSnackbar('Entry deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting voter:', error);
            showSnackbar('Error deleting voter.', 'error');
        } finally {
            handleMenuClose();
        }
    };

    const handleVotedToggle = async () => {
        try {
            const currentVoter = voters.find(voter => voter.id === selectedVoterId);
            const isCurrentlyVoted = currentVoter?.voted;
            
            const response = await axiosInstance.put(`/file/markAsVoted/${selectedVoterId}`);
            if (response.status === 200) {
                showSnackbar(
                    isCurrentlyVoted ? 'Voter unmarked as voted!' : 'Voter marked as voted!', 
                    'success'
                );
                await fetchVoters(filters);
            } else {
                showSnackbar('Failed to update voted status.', 'error');
            }
        } catch (error) {
            console.error('Error toggling voted status:', error);
            showSnackbar('Error updating voted status.', 'error');
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
        const currentParams = searchParams.toString();
        const paramString = currentParams ? `?${currentParams}` : '';

        if (currentPath.includes('/admin')) {
            navigate(`/admin/dashboard${paramString}`);
        } else if (currentPath.includes('/surveyor')) {
            navigate(`/surveyor/home${paramString}`);
        } else {
            navigate(`/${paramString}`);
        }
    };

    const handleNavigateToSurvey = (id) => {
        const currentPath = location.pathname;
        const currentParams = searchParams.toString();
        const paramString = currentParams ? `?${currentParams}` : '';

        if (currentPath.includes('/admin')) {
            navigate(`/admin/with-voter-id/form/${id}${paramString}`);
        } else if (currentPath.includes('/surveyor')) {
            navigate(`/surveyor/with-voter-id/form/${id}${paramString}`);
        } else {
            navigate(`/${paramString}`);
        }
    };

    const shouldShowVoters = filters.survey && filters.constituency && filters.boothNumber;
    const shouldShowLoadingOrResults = shouldShowVoters || hasAttemptedSearch;

    const renderSkeletonCards = () => {
        return Array.from({ length: 6 }).map((_, index) => (
            <VoterCardSkeleton key={`skeleton-${index}`} />
        ));
    };

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
                    {voters.length > 0 && (
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'rgba(0, 0, 0, 0.6)',
                                mb: 2
                            }}
                        >
                            Showing {startIndex + 1}-{Math.min(endIndex, voters.length)} of {voters.length} voters
                        </Typography>
                    )}
                </Box>

                <Grid container spacing={4}>
                    {!isInitialized ? (
                        // Show loading skeleton during initial load
                        renderSkeletonCards()
                    ) : loading.search ? (
                        renderSkeletonCards()
                    ) : shouldShowVoters && currentPageVoters.length > 0 ? (
                        currentPageVoters.map((voter) => (
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
                                        opacity: loading.search ? 0 : 1,
                                        transition: 'all 0.3s ease, opacity 0.2s ease',
                                        minHeight: '240px',
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
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: 'rgba(0, 0, 0, 0.85)',
                                                        mr: 1,
                                                        mt: 1
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
                                                            justifyContent: 'center',
                                                            ml: 1,
                                                            mt: 1
                                                        }}
                                                    >
                                                        <Verified sx={{ fontSize: 14, color: 'success' }} />
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
                                                <strong>Booth No:</strong> {voter.boothNo}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)', mb: 0.5 }}>
                                                <strong>House No:</strong> {voter.houseNo}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)', mb: 0.5 }}>
                                            <strong>Voter ID:</strong> {voter?.voterId}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)', mb: 0.5 }}>
                                                <strong>Serial Number:</strong> {voter?.serialNumber}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)', mb: 0.5 }}>
                                                <strong>Relative:</strong> {voter.relative}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)', mb: 0.5 }}></Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ textAlign: 'center', mt: 4, color: 'rgba(0, 0, 0, 0.6)' }}>
                                {shouldShowVoters && hasAttemptedSearch ? (
                                    <Typography variant="h6">
                                        No voters found matching your criteria.
                                    </Typography>
                                ) : !shouldShowVoters ? (
                                    <Typography variant="h6">
                                        Please select survey, constituency, and booth to search for voter details.
                                    </Typography>
                                ) : null}
                            </Box>
                        </Grid>
                    )}
                </Grid>

                {voters.length > 0 && totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
                        <Stack spacing={2} alignItems="center">
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                                showFirstButton
                                showLastButton
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        '&.Mui-selected': {
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'primary.dark',
                                            }
                                        }
                                    }
                                }}
                            />
                            <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                Page {currentPage} of {totalPages}
                            </Typography>
                        </Stack>
                    </Box>
                )}

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