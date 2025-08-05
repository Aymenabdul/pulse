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
    Alert
} from "@mui/material";
import {
    ArrowBack,
    Clear,
    VerifiedUser,
    BarChart as BarChartIcon,
    People
} from "@mui/icons-material";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const initialStatistics = {
    totalConstituencies: 0,
    totalBooths: 0,
    totalVoters: 0,
    partyPreferences: [],
    performanceRatings: 0
};

const sampleRawData = [
    { constituency: '188-MELUR', booth: 1, voters: 100, party1: 30, party2: 40, party3: 20, perfRating: 90, survey: '2024-election' },
    { constituency: '188-MELUR', booth: 1, voters: 120, party1: 50, party2: 30, party3: 10, perfRating: 85, survey: '2024-election' },
    { constituency: '188-MELUR', booth: 2, voters: 80, party1: 20, party2: 30, party3: 30, perfRating: 70, survey: 'public-opinion' },
    { constituency: '188-MELUR', booth: 2, voters: 150, party1: 60, party2: 40, party3: 20, perfRating: 95, survey: 'public-opinion' },
    { constituency: '189-MADURAI-EAST', booth: 1, voters: 200, party1: 70, party2: 80, party3: 30, perfRating: 75, survey: '2024-election' },
    { constituency: '189-MADURAI-EAST', booth: 3, voters: 180, party1: 40, party2: 50, party3: 60, perfRating: 80, survey: 'constituency-feedback' },
    { constituency: '190-MADURAI-WEST', booth: 1, voters: 90, party1: 30, party2: 20, party3: 40, perfRating: 65, survey: 'public-opinion' },
    { constituency: '190-MADURAI-WEST', booth: 2, voters: 110, party1: 50, party2: 30, party3: 20, perfRating: 90, survey: '2024-election' },
    { constituency: '188-MELUR', booth: 3, voters: 70, party1: 25, party2: 15, party3: 30, perfRating: 78, survey: 'constituency-feedback' },
    { constituency: '188-MELUR', booth: 1, voters: 110, party1: 45, party2: 35, party3: 20, perfRating: 92, survey: 'public-opinion' },
];

export default function Statistics() {
    const [filters, setFilters] = useState({
        constituency: '',
        boothNumber: ''
    });

    const [statistics, setStatistics] = useState(initialStatistics);
    const [animatedStats, setAnimatedStats] = useState(initialStatistics);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const animateNumber = (target, statKey, duration = 1000) => {
        const increment = target / (duration / 50);
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                clearInterval(timer);
                setAnimatedStats(prev => ({ ...prev, [statKey]: target }));
            } else {
                setAnimatedStats(prev => ({ ...prev, [statKey]: Math.floor(current) }));
            }
        }, 50);
    };

    useEffect(() => {
        let filteredData = sampleRawData;

        if (filters.constituency) {
            filteredData = filteredData.filter(data => data.constituency === filters.constituency);
        }
        if (filters.boothNumber) {
            filteredData = filteredData.filter(data => data.booth === parseInt(filters.boothNumber));
        }

        const uniqueConstituencies = new Set(filteredData.map(data => data.constituency)).size;
        const uniqueBooths = new Set(filteredData.map(data => data.booth)).size;
        const totalVoters = filteredData.reduce((sum, data) => sum + data.voters, 0);

        const partyTotals = filteredData.reduce((acc, data) => {
            acc.party1 = (acc.party1 || 0) + data.party1;
            acc.party2 = (acc.party2 || 0) + data.party2;
            acc.party3 = (acc.party3 || 0) + data.party3;
            return acc;
        }, {});

        const partyArray = [
            { name: 'Party A', value: partyTotals.party1 || 0 },
            { name: 'Party B', value: partyTotals.party2 || 0 },
            { name: 'Party C', value: partyTotals.party3 || 0 }
        ];

        const performanceSum = filteredData.reduce((sum, data) => sum + data.perfRating, 0);
        const averagePerformance = filteredData.length > 0 ? (performanceSum / filteredData.length) : 0;

        setStatistics({
            totalConstituencies: uniqueConstituencies,
            totalBooths: uniqueBooths,
            totalVoters: totalVoters,
            partyPreferences: partyArray,
            performanceRatings: averagePerformance
        });

    }, [filters]);

    useEffect(() => {
        animateNumber(statistics.totalConstituencies, 'totalConstituencies');
        animateNumber(statistics.totalBooths, 'totalBooths');
        animateNumber(statistics.totalVoters, 'totalVoters');
    }, [statistics.totalConstituencies, statistics.totalBooths, statistics.totalVoters]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            constituency: '',
            boothNumber: ''
        });
        setSnackbarMessage('Filters cleared!');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    // const handleBack = () => {
    //     const currentPath = location.pathname;

    //     if (currentPath.includes('/admin')) {
    //         navigate('/admin/dashboard');
    //     } else if (currentPath.includes('/surveyor')) {
    //         navigate('/surveyor/home');
    //     } else {
    //         navigate('/');
    //     }
    // };

    const getBarChartData = (parties) => {
        const sortedParties = [...parties].sort((a, b) => b.value - a.value);
        const dataForChart = [];

        if (sortedParties[0]) dataForChart.push({ name: sortedParties[0].name, value: sortedParties[0].value, color: '#FF7300' });
        if (sortedParties[1]) dataForChart.push({ name: sortedParties[1].name, value: sortedParties[1].value, color: '#8884d8' });
        if (sortedParties[2]) dataForChart.push({ name: sortedParties[2].name, value: sortedParties[2].value, color: '#82ca9d' });

        const orderedData = [];
        if (dataForChart[2]) orderedData.push(dataForChart[2]);
        if (dataForChart[0]) orderedData.push(dataForChart[0]);
        if (dataForChart[1]) orderedData.push(dataForChart[1]);

        return orderedData;
    };

    const pieChartColors = ['#FFCD00', '#E0E0E0'];

    return (
        <Box sx={{ minHeight: '100vh', p: 3 }}>
            <Container maxWidth="xl">
                {/* <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ArrowBack />}
                        onClick={handleBack}
                        sx={{ px: 4, py: 1.5, fontWeight: 600, textTransform: 'none' }}
                    >
                        Back
                    </Button>
                </Box> */}

                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography
                        variant="h2"
                        sx={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.85)', mb: 2 }}
                    >
                        Survey Statistics
                    </Typography>
                </Box>

                <Box sx={{ mb: 6 }}>
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Constituency</InputLabel>
                                <Select
                                    value={filters.constituency}
                                    label="Constituency"
                                    onChange={(e) => handleFilterChange('constituency', e.target.value)}
                                >
                                    <MenuItem value="">All Constituencies</MenuItem>
                                    <MenuItem value="188-MELUR">188-MELUR</MenuItem>
                                    <MenuItem value="189-MADURAI-EAST">189-MADURAI-EAST</MenuItem>
                                    <MenuItem value="190-MADURAI-WEST">190-MADURAI-WEST</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Booth</InputLabel>
                                <Select
                                    value={filters.boothNumber}
                                    label="Booth"
                                    onChange={(e) => handleFilterChange('boothNumber', e.target.value)}
                                >
                                    <MenuItem value="">All Booths</MenuItem>
                                    <MenuItem value="1">Booth 1</MenuItem>
                                    <MenuItem value="2">Booth 2</MenuItem>
                                    <MenuItem value="3">Booth 3</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <Button
                            variant="outlined"
                            startIcon={<Clear />}
                            onClick={handleClearFilters}
                            sx={{ textTransform: 'none', px: 4, py: 1 }}
                        >
                            Clear
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={4} sx={{ mb: 6 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 3, height: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <VerifiedUser sx={{ fontSize: 35, color: 'primary.main', mb: 0.5 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', lineHeight: 1.2 }}>
                                    {animatedStats.totalConstituencies}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                                    Total Constituencies
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 3, height: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <BarChartIcon sx={{ fontSize: 35, color: 'secondary.main', mb: 0.5 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main', lineHeight: 1.2 }}>
                                    {animatedStats.totalBooths}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                                    Total Booths
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 3, height: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <People sx={{ fontSize: 35, color: 'success.main', mb: 0.5 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main', lineHeight: 1.2 }}>
                                    {animatedStats.totalVoters}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)' }}>
                                    Total Voters
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Box sx={{ mb: 6, py: 4, px: 3, borderRadius: 3, background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'rgba(0, 0, 0, 0.85)', mb: 3, textAlign: 'center' }}>
                        Political Party Preferences
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                        {[1, 2, 3].map((q, index) => (
                            <Grid size={{ xs: 12, md: 4 }} key={index}>
                                <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 2 }}>{`Question ${q} - Top 3 Parties`}</Typography>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={getBarChartData(statistics.partyPreferences)}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" name="Show Count">
                                                {
                                                    getBarChartData(statistics.partyPreferences).map((entry, idx) => (
                                                        <Cell key={`cell-${idx}`} fill={entry.color} />
                                                    ))
                                                }
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                <Box sx={{ py: 4, px: 3, borderRadius: 3, background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'rgba(0, 0, 0, 0.85)', mb: 3, textAlign: 'center' }}>
                        Performance Ratings
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                        {[4, 5, 6].map((q, index) => (
                            <Grid size={{ xs: 12, md: 4 }} key={index}>
                                <Box sx={{ height: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 2 }}>{`Question ${q} - Performance Rating`}</Typography>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[{ name: 'Average', value: statistics.performanceRatings }, { name: 'Remaining', value: 100 - statistics.performanceRatings }]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                isAnimationActive={true}
                                            >
                                                <Cell key="cell-0" fill={pieChartColors[0]} />
                                                <Cell key="cell-1" fill={pieChartColors[1]} />
                                            </Pie>
                                            <Tooltip formatter={(value, name, props) => [`${Math.round(value)}%`, props.payload.name]} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <Typography variant="h6" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', color: '#FFCD00' }}>
                                        {Math.round(statistics.performanceRatings)}%
                                    </Typography>
                                    <Typography variant="caption" sx={{ mt: 1, color: 'rgba(0,0,0,0.7)' }}>Average</Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
}