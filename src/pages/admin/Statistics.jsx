import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Container,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Snackbar,
    Alert,
    CircularProgress
} from "@mui/material";
import {
    Clear,
    VerifiedUser,
    BarChart as BarChartIcon,
    People
} from "@mui/icons-material";
import axiosInstance from "../../axios/axios";

const initialStatistics = {
    totalConstituencies: 0,
    totalBooths: 0,
    totalVoters: 0
};

export default function Statistics() {
    const [filters, setFilters] = useState({
        constituency: '',
        boothNumber: '',
        surveyName: ''
    });

    const [statistics, setStatistics] = useState(initialStatistics);
    const [animatedStats, setAnimatedStats] = useState(initialStatistics);
    const [loading, setLoading] = useState({
        statistics: false,
        surveys: false,
        constituencies: false,
        booths: false
    });
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const [surveyOptions, setSurveyOptions] = useState([]);
    const [constituencyOptions, setConstituencyOptions] = useState([]);
    const [boothOptions, setBoothOptions] = useState([]);
    const [currentlyAnimating, setCurrentlyAnimating] = useState(false);

    const animateNumber = (target, statKey, duration = 1500, delay = 0) => {
        setTimeout(() => {
            const increment = target / (duration / 50);
            let current = 0;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    clearInterval(timer);
                    setAnimatedStats(prev => ({ ...prev, [statKey]: target }));
                    if (statKey === 'totalVoters') {
                        setCurrentlyAnimating(false);
                    }
                } else {
                    setAnimatedStats(prev => ({ ...prev, [statKey]: Math.floor(current) }));
                }
            }, 50);
        }, delay);
    };

    const startSequentialAnimation = (newStats) => {
        setAnimatedStats(initialStatistics);
        
        const sequence = [
            { key: 'totalConstituencies', value: newStats.totalConstituencies, duration: 1000 },
            { key: 'totalBooths', value: newStats.totalBooths, duration: 1200 },
            { key: 'totalVoters', value: newStats.totalVoters, duration: 1500 }
        ];

        sequence.forEach((animation, index) => {
            const delay = index * 800;
            animateNumber(animation.value, animation.key, animation.duration, delay);
        });

        setCurrentlyAnimating(true);
    };

    const fetchSurveys = async () => {
        setLoading(prev => ({ ...prev, surveys: true }));
        try {
            const response = await axiosInstance.get('/file/active');
            setSurveyOptions(Array.from(response.data) || []);
        } catch (error) {
            console.error('Error fetching surveys:', error);
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

    const fetchStatistics = async () => {
        setLoading(prev => ({ ...prev, statistics: true }));
        try {
            const params = new URLSearchParams();
            if (filters.surveyName) params.append('surveyName', filters.surveyName);
            if (filters.constituency) params.append('constituency', filters.constituency);
            if (filters.boothNumber) params.append('booth', filters.boothNumber);

            const response = await axiosInstance.get(`/file/filter-counts?${params.toString()}`);
            const data = response.data;

            const newStats = {
                totalConstituencies: data.constituencyCount || 0,
                totalBooths: data.boothCount || 0,
                totalVoters: data.voterCount || 0
            };

            setStatistics(newStats);
            startSequentialAnimation(newStats);

        } catch (error) {
            console.error('Error fetching statistics:', error);
            showSnackbar('Error fetching statistics', 'error');
            
            setStatistics(initialStatistics);
            startSequentialAnimation(initialStatistics);
        } finally {
            setLoading(prev => ({ ...prev, statistics: false }));
        }
    };

    useEffect(() => {
        const handleInitialAndFilterCascade = async () => {
            if (surveyOptions.length === 0) {
                await fetchSurveys();
            }

            if (!filters.surveyName) {
                setConstituencyOptions([]);
                setBoothOptions([]);
            } else {
                await fetchConstituencies(filters.surveyName);
                
                if (!filters.constituency) {
                    setBoothOptions([]);
                } else {
                    await fetchBooths(filters.surveyName, filters.constituency);
                }
            }
        };

        handleInitialAndFilterCascade();
    }, [filters.surveyName, filters.constituency, surveyOptions?.length]);

    useEffect(() => {
        fetchStatistics();
    }, [filters.surveyName, filters.constituency, filters.boothNumber]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [field]: value };
            
            if (field === 'surveyName') {
                newFilters.constituency = '';
                newFilters.boothNumber = '';
            } else if (field === 'constituency') {
                newFilters.boothNumber = '';
            }
            
            return newFilters;
        });
    };

    const handleClearFilters = () => {
        setFilters({
            constituency: '',
            boothNumber: '',
            surveyName: ''
        });
        setConstituencyOptions([]);
        setBoothOptions([]);
        showSnackbar('Filters cleared!', 'info');
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-IN').format(num);
    };

    return (
        <Box sx={{ minHeight: '100vh', p: 3 }}>
            <Container maxWidth="xl">
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography
                        variant="h2"
                        sx={{ 
                            fontWeight: 'bold', 
                            color: 'rgba(0, 0, 0, 0.85)', 
                            mb: 2,
                            fontSize: { xs: '2rem', md: '3.5rem' }
                        }}
                    >
                        Survey Statistics
                    </Typography>
                </Box>

                <Box sx={{ mb: 6 }}>
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Survey</InputLabel>
                                <Select
                                    value={filters.surveyName}
                                    label="Survey"
                                    onChange={(e) => handleFilterChange('surveyName', e.target.value)}
                                    disabled={loading.surveys}
                                >
                                    <MenuItem value="">All Surveys</MenuItem>
                                    {surveyOptions.map((survey, index) => (
                                        <MenuItem key={index} value={survey}>
                                            {survey}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {loading.surveys && <CircularProgress size={20} sx={{ mt: 1 }} />}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Constituency</InputLabel>
                                <Select
                                    value={filters.constituency}
                                    label="Constituency"
                                    onChange={(e) => handleFilterChange('constituency', e.target.value)}
                                    disabled={loading.constituencies}
                                >
                                    <MenuItem value="">All Constituencies</MenuItem>
                                    {constituencyOptions.map((constituency, index) => (
                                        <MenuItem key={index} value={constituency}>
                                            {constituency}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {loading.constituencies && <CircularProgress size={20} sx={{ mt: 1 }} />}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Booth</InputLabel>
                                <Select
                                    value={filters.boothNumber}
                                    label="Booth"
                                    onChange={(e) => handleFilterChange('boothNumber', e.target.value)}
                                    disabled={loading.booths}
                                >
                                    <MenuItem value="">All Booths</MenuItem>
                                    {boothOptions.map((booth, index) => (
                                        <MenuItem key={index} value={booth}>
                                            Booth {booth}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {loading.booths && <CircularProgress size={20} sx={{ mt: 1 }} />}
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <Button
                            variant="outlined"
                            startIcon={<Clear />}
                            onClick={handleClearFilters}
                            sx={{ 
                                textTransform: 'none', 
                                px: 4, 
                                py: 1
                            }}
                        >
                            Clear
                        </Button>
                    </Box>
                </Box>

                {loading.statistics && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                        <CircularProgress />
                        <Typography sx={{ ml: 2, alignSelf: 'center' }}>Loading statistics...</Typography>
                    </Box>
                )}

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ 
                            backdropFilter: 'blur(10px)', 
                            background: currentlyAnimating ? 'rgba(33, 150, 243, 0.2)' : 'rgba(255,255,255,0.15)', 
                            border: '1px solid rgba(255,255,255,0.3)', 
                            borderRadius: 3, 
                            minHeight: { xs: '80px', md: '130px' },
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            transition: 'all 0.3s ease',
                            transform: currentlyAnimating && animatedStats.totalConstituencies > 0 ? 'scale(1.02)' : 'scale(1)',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                background: 'rgba(255,255,255,0.2)'
                            }
                        }}>
                            <CardContent sx={{ 
                                p: { xs: 1, md: 2 }, 
                                '&:last-child': { pb: { xs: 1, md: 2 } },
                                width: '100%',
                                display: 'flex',
                                flexDirection: { xs: 'row', md: 'column' },
                                alignItems: 'center',
                                justifyContent: { xs: 'center' },
                                textAlign: { xs: 'left', md: 'center' }
                            }}>
                                <VerifiedUser sx={{ 
                                    fontSize: { xs: 25, md: 35 }, 
                                    color: 'primary.main', 
                                    mb: { xs: 0, md: 0.5 },
                                    mr: { xs: 2, md: 0 }
                                }} />
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, alignItems: { xs: 'center', md: 'center' } }}>
                                    <Typography 
                                        variant="h4" 
                                        sx={{ 
                                            fontWeight: 'bold', 
                                            color: 'primary.main', 
                                            lineHeight: 1.2,
                                            fontSize: { xs: '1.5rem', md: '2.125rem' },
                                            mr: { xs: 1, md: 0 }
                                        }}
                                    >
                                        {formatNumber(animatedStats.totalConstituencies)}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            color: 'rgba(0, 0, 0, 0.7)',
                                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                                            whiteSpace: { xs: 'nowrap', md: 'normal' }
                                        }}
                                    >
                                        Constituencies
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ 
                            backdropFilter: 'blur(10px)', 
                            background: currentlyAnimating && animatedStats.totalConstituencies === statistics.totalConstituencies ? 'rgba(156, 39, 176, 0.2)' : 'rgba(255,255,255,0.15)', 
                            border: '1px solid rgba(255,255,255,0.3)', 
                            borderRadius: 3, 
                            minHeight: { xs: '80px', md: '130px' },
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            transition: 'all 0.3s ease',
                            transform: currentlyAnimating && animatedStats.totalBooths > 0 ? 'scale(1.02)' : 'scale(1)',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                background: 'rgba(255,255,255,0.2)'
                            }
                        }}>
                            <CardContent sx={{ 
                                p: { xs: 1, md: 2 }, 
                                '&:last-child': { pb: { xs: 1, md: 2 } },
                                width: '100%',
                                display: 'flex',
                                flexDirection: { xs: 'row', md: 'column' },
                                alignItems: 'center',
                                justifyContent: { xs: 'center' },
                                textAlign: { xs: 'left', md: 'center' }
                            }}>
                                <BarChartIcon sx={{ 
                                    fontSize: { xs: 25, md: 35 }, 
                                    color: 'primary.main', 
                                    mb: { xs: 0, md: 0.5 },
                                    mr: { xs: 2, md: 0 }
                                }} />
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, alignItems: { xs: 'center', md: 'center' } }}>
                                    <Typography 
                                        variant="h4" 
                                        sx={{ 
                                            fontWeight: 'bold', 
                                            color: 'primary.main', 
                                            lineHeight: 1.2,
                                            fontSize: { xs: '1.5rem', md: '2.125rem' },
                                            mr: { xs: 1, md: 0 }
                                        }}
                                    >
                                        {formatNumber(animatedStats.totalBooths)}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            color: 'rgba(0, 0, 0, 0.7)',
                                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                                            whiteSpace: { xs: 'nowrap', md: 'normal' }
                                        }}
                                    >
                                        Booths
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ 
                            backdropFilter: 'blur(10px)', 
                            background: currentlyAnimating && animatedStats.totalBooths === statistics.totalBooths ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255,255,255,0.15)', 
                            border: '1px solid rgba(255,255,255,0.3)', 
                            borderRadius: 3, 
                            minHeight: { xs: '80px', md: '130px' },
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            transition: 'all 0.3s ease',
                            transform: currentlyAnimating && animatedStats.totalVoters > 0 ? 'scale(1.02)' : 'scale(1)',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                background: 'rgba(255,255,255,0.2)'
                            }
                        }}>
                            <CardContent sx={{ 
                                p: { xs: 1, md: 2 }, 
                                '&:last-child': { pb: { xs: 1, md: 2 } },
                                width: '100%',
                                display: 'flex',
                                flexDirection: { xs: 'row', md: 'column' },
                                alignItems: 'center',
                                justifyContent: { xs: 'center' },
                                textAlign: { xs: 'left', md: 'center' }
                            }}>
                                <People sx={{ 
                                    fontSize: { xs: 25, md: 35 }, 
                                    color: 'primary.main', 
                                    mb: { xs: 0, md: 0.5 },
                                    mr: { xs: 2, md: 0 }
                                }} />
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, alignItems: { xs: 'center', md: 'center' } }}>
                                    <Typography 
                                        variant="h4" 
                                        sx={{ 
                                            fontWeight: 'bold', 
                                            color: 'primary.main', 
                                            lineHeight: 1.2,
                                            fontSize: { xs: '1.5rem', md: '2.125rem' },
                                            mr: { xs: 1, md: 0 }
                                        }}
                                    >
                                        {formatNumber(animatedStats.totalVoters)}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            color: 'rgba(0, 0, 0, 0.7)',
                                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                                            whiteSpace: { xs: 'nowrap', md: 'normal' }
                                        }}
                                    >
                                        Voters
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
}