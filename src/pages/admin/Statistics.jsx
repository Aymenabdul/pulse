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
    CircularProgress,
    Switch,
    FormControlLabel,
    Paper
} from "@mui/material";
import {
    Clear,
    VerifiedUser,
    BarChart as BarChartIcon,
    People
} from "@mui/icons-material";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    Customized,
    PieChart,
    Pie,
    CartesianGrid
} from "recharts";
import axiosInstance from "../../axios/axios";
import AIADMK from "../../assets/aiadmk.png";
import DMK from "../../assets/dmk.png";
import BJP from "../../assets/bjp.jpg";
import INC from "../../assets/inc.png";
import NTK from "../../assets/ntk.png";
import VCK from "../../assets/vck.png";
import MDMK from "../../assets/mdmk.jpg";
import TVK from "../../assets/tvk.jpg";
import ADMK from "../../assets/images.jpeg";
import CPI from "../../assets/cpi.png";
import CPM from "../../assets/cpi.png";
import PMK from "../../assets/pmk.jpg";
import DMDK from "../../assets/dmdk.png";
import NOTA from "../../assets/nota.png"

const initialStatistics = {
    totalConstituencies: 0,
    totalBooths: 0,
    totalVoters: 0
};

const partyLogos = {
    "AIADMK": AIADMK,
    "DMK": DMK,
    "BJP": BJP,
    "INC": INC,
    "NTK": NTK,
    "VCK": VCK,
    "MDMK": MDMK,
    "TVK": TVK,
    "ADMK": ADMK,
    "CPI": CPI,
    "CPM": CPM,
    "PMK": PMK,
    "DMDK": DMDK,
    "NOTA" : NOTA,
    "MUSLIM PARTIES (SPECIFY)": "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    "OTHERS (SPECIFY)": "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    "INDEPENDENT (SPECIFY)": "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
};

const partyColors = {
    "AIADMK": '#4ECDC4',
    "DMK": '#FF6B35',
    "BJP": '#FF8E53',
    "INC": '#45B7D1',
    "NTK": '#FFD700',
    "VCK": '#8B4513',
    "MDMK": '#FF1493',
    "TVK": '#9932CC',
    "ADMK": '#32CD32',
    "CPI": '#FF0000',
    "CPM": '#DC143C',
    "PMK": '#4169E1',
    "DMDK": '#FF4500',
    "MUSLIM PARTIES (SPECIFY)": '#9E9E9E',
    "OTHERS (SPECIFY)": '#9E9E9E',
    "INDEPENDENT (SPECIFY)": '#9E9E9E',
    "NOTA": '#607D8B',
    "Others": '#96CEB4'
};

const pieColors = {
    "very good": "#4CAF50",
    "good": "#8BC34A", 
    "average": "#FFC107",
    "bad": "#FF5722",
    "excellent": "#2E7D32",
    "poor": "#D32F2F",
    "fair": "#FF9800"
};

export default function Statistics() {
    const [filters, setFilters] = useState({
        constituency: '',
        boothNumber: '',
        surveyName: ''
    });

    const [statistics, setStatistics] = useState(initialStatistics);
    // const [animatedStats, setAnimatedStats] = useState(initialStatistics);
    const [loading, setLoading] = useState({
        statistics: false,
        surveys: false,
        constituencies: false,
        booths: false,
        responses: false
    });
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const [surveyOptions, setSurveyOptions] = useState([]);
    const [constituencyOptions, setConstituencyOptions] = useState([]);
    const [boothOptions, setBoothOptions] = useState([]);
    // const [currentlyAnimating, setCurrentlyAnimating] = useState(false);
    const [responseData, setResponseData] = useState({});
    const [displayModes, setDisplayModes] = useState({
        ques1: 'count',
        ques2: 'count',
        ques3: 'count'
    });

    const useAnimatedCounter = (targetValue, duration = 2000) => {
        const [count, setCount] = useState(0);
        
        useEffect(() => {
            setCount(0);
            
            if (targetValue === 0) return;
            
            const startTime = Date.now();
            const endTime = startTime + duration;
            
            const updateCount = () => {
                const currentTime = Date.now();
                const progress = Math.min((currentTime - startTime) / duration, 1);
                
                const easeOutCubic = 1 - Math.pow(1 - progress, 3);
                const currentCount = Math.floor(easeOutCubic * targetValue);
                
                setCount(currentCount);
                
                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    setCount(targetValue);
                }
            };
            
            requestAnimationFrame(updateCount);
        }, [targetValue, duration]);
        
        return count;
    };

    const animatedConstituenciesCount = useAnimatedCounter(statistics.totalConstituencies);
    const animatedBoothsCount = useAnimatedCounter(statistics.totalBooths);
    const animatedVotersCount = useAnimatedCounter(statistics.totalVoters);

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

        } catch (error) {
            console.error('Error fetching statistics:', error);
            showSnackbar('Error fetching statistics', 'error');
            setStatistics(initialStatistics);
        } finally {
            setLoading(prev => ({ ...prev, statistics: false }));
        }
    };

    const fetchResponses = async () => {
        setLoading(prev => ({ ...prev, responses: true }));
        try {
            const params = new URLSearchParams();
            if (filters.surveyName) params.append('surveyName', filters.surveyName);
            if (filters.constituency) params.append('constituency', filters.constituency);
            if (filters.boothNumber) params.append('booth', filters.boothNumber);

            const response = await axiosInstance.get(`/survey/filterBySurveyNameAndConstituency?${params.toString()}`);
            setResponseData(response.data || {});
        } catch (error) {
            console.error('Error fetching responses:', error);
            showSnackbar('Error fetching responses', 'error');
            setResponseData({});
        } finally {
            setLoading(prev => ({ ...prev, responses: false }));
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
        if (filters.surveyName !== '' || filters.constituency !== '' || filters.boothNumber !== '')
            fetchResponses();
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

    const getPartyLogo = (party) => {
        const normalizedParty = party.trim().toUpperCase();
        const logo = partyLogos[normalizedParty];
        if (logo) {
            return logo;
        } else {
            return `https://via.placeholder.com/40x40/cccccc/666666?text=${normalizedParty.substring(0, 3)}`;
        }
    };

    const preparePoliticalChartData = (questionData) => {
        if (!questionData) return [];

        const sortedEntries = Object.entries(questionData)
            .filter(([party, votes]) => party !== "" && votes > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        if (sortedEntries.length === 0) return [];

        const totalVotes = sortedEntries.reduce((sum, [, votes]) => sum + votes, 0);

        const dataWithPercentage = sortedEntries.map(([party, votes]) => ({
            party,
            votes,
            percentage: ((votes / totalVotes) * 100).toFixed(1),
            fill: partyColors[party] || "#8884d8",
            logo: getPartyLogo(party)
        }));

        // Return data in proper order for bar chart positioning
        if (dataWithPercentage.length === 1) {
            return dataWithPercentage;
        } else if (dataWithPercentage.length === 2) {
            return [dataWithPercentage[1], dataWithPercentage[0]];
        } else if (dataWithPercentage.length === 3) {
            return [dataWithPercentage[2], dataWithPercentage[0], dataWithPercentage[1]];
        }

        return dataWithPercentage;
    };

    const preparePieChartData = (questionData) => {
        if (!questionData || typeof questionData !== 'object') {
            return [];
        }

        const entries = Object.entries(questionData)
            .filter(([category, votes]) => {
                return category !== "" && 
                       category !== null && 
                       category !== undefined && 
                       votes !== null && 
                       votes !== undefined &&
                       !isNaN(votes) &&
                       votes > 0;
            })
            .map(([category, votes]) => ({
                name: category.charAt(0).toUpperCase() + category.slice(1),
                value: parseInt(votes) || 0,
                fill: pieColors[category.toLowerCase()] || "#9E9E9E"
            }));

        return entries;
    };

    const getDisplayData = (question, mode) => {
        const data = responseData[question] || {};
        const chartData = preparePoliticalChartData(data);
        
        if (mode === 'percentage') {
            return chartData.map(item => ({
                ...item,
                displayValue: parseFloat(item.percentage)
            }));
        } else {
            return chartData.map(item => ({
                ...item,
                displayValue: item.votes
            }));
        }
    };

    const handleDisplayModeChange = (question, checked) => {
        setDisplayModes(prev => ({
            ...prev,
            [question]: checked ? 'percentage' : 'count'
        }));
    };

    const PoliticalTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{
                    backgroundColor: 'white',
                    padding: '15px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                            src={data.logo}
                            alt={label}
                            style={{ width: '30px', height: '30px', borderRadius: '4px' }}
                        />
                        <div>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{label}</p>
                            <p style={{ margin: 0, color: payload[0].color, fontSize: '12px' }}>
                                Votes: {data.votes} ({data.percentage}%)
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const PieTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].name}</p>
                    <p style={{ margin: 0, color: payload[0].color }}>
                        Count: {payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomBarShape = (props) => {
        const { fill, x, y, width, height, payload } = props;
        const logoSize = 35;
        const logoX = x + width / 2 - logoSize / 2;
        const logoY = y - logoSize - 5;

        return (
            <g>
                <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} ry={4} />
                <image
                    href={payload.logo}
                    x={logoX}
                    y={logoY}
                    width={logoSize}
                    height={logoSize}
                />
            </g>
        );
    };

    const renderBarChart = (question, title) => {
        const data = getDisplayData(question, displayModes[question]);
        const yAxisLabel = displayModes[question] === 'count' ? 'Votes' : 'Percentage (%)';
        const dataKey = 'displayValue';
        
        if (loading.responses) {
            return (
                <Box sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" sx={{ textAlign: 'center', mb: 2, fontSize: '1rem' }}>
                        {title}
                    </Typography>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                </Box>
            );
        }

        if (data.length === 0) {
            return (
                <Box sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" sx={{ textAlign: 'center', mb: 2, fontSize: '1rem' }}>
                        {title}
                    </Typography>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            No data available for this question
                        </Typography>
                    </Box>
                </Box>
            );
        }
        
        return (
            <Box sx={{ 
                height: '500px', 
                display: 'flex', 
                flexDirection: 'column',
            }}>
                <Typography
                    variant="h6"
                    component="h2"
                    gutterBottom
                    sx={{
                        textAlign: 'center',
                        color: '#34495e',
                        fontWeight: 'medium',
                        fontSize: '1rem',
                        mb: 2,
                        minHeight: '24px'
                    }}
                >
                    {title}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={displayModes[question] === 'percentage'}
                                onChange={(e) => handleDisplayModeChange(question, e.target.checked)}
                                disabled={loading.responses}
                                size="small"
                            />
                        }
                        label={displayModes[question] === 'count' ? 'Show Percentage' : 'Show Count'}
                        sx={{ fontSize: '0.875rem' }}
                    />
                </Box>
                <Box sx={{ flex: 1, minHeight: '350px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                            data={data} 
                            margin={{ top: 40, right: 20, left: 10, bottom: 60 }}
                            maxBarSize={60}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="party"
                                tick={{ fontSize: 9 }}
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
                            <Tooltip content={PoliticalTooltip} />
                            <Bar
                                dataKey={dataKey}
                                shape={CustomBarShape}
                                maxBarSize={60}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Box>
        );
    };

    const renderPieChart = (question, title) => {
        const chartData = preparePieChartData(responseData[question]);

        if (loading.responses) {
            return (
                <Box sx={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" sx={{ textAlign: 'center', mb: 2, fontSize: '1rem' }}>
                        {title}
                    </Typography>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                </Box>
            );
        }

        if (!chartData || chartData.length === 0) {
            return (
                <Box sx={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" sx={{ textAlign: 'center', mb: 2, fontSize: '1rem' }}>
                        {title}
                    </Typography>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            No data available for this question
                        </Typography>
                    </Box>
                </Box>
            );
        }

        const hasValidData = chartData.some(item => item.value > 0);
        if (!hasValidData) {
            return (
                <Box sx={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" sx={{ textAlign: 'center', mb: 2, fontSize: '1rem' }}>
                        {title}
                    </Typography>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            No votes recorded for this question
                        </Typography>
                    </Box>
                </Box>
            );
        }

        return (
            <Box sx={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                <Typography
                    variant="h6"
                    component="h2"
                    gutterBottom
                    sx={{
                        textAlign: 'center',
                        color: '#34495e',
                        fontWeight: 'medium',
                        fontSize: '1rem',
                        mb: 2,
                        minHeight: '24px'
                    }}
                >
                    {title}
                </Typography>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="45%"
                                outerRadius={70}
                                innerRadius={0}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                                labelStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip content={PieTooltip} />
                            <Legend
                                verticalAlign="bottom"
                                height={40}
                                iconType="rect"
                                wrapperStyle={{ 
                                    paddingTop: '15px', 
                                    fontSize: '11px',
                                    textAlign: 'center'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
            </Box>
        );
    };

    const getQuestionTitle = (questionKey) => {
        const titles = {
            "ques1": "Question 1 - Top 3 Parties",
            "ques2": "Question 2 - Top 3 Parties", 
            "ques3": "Question 3 - Top 3 Parties",
            "ques4": "Question 4 - Performance Rating",
            "ques5": "Question 5 - Performance Rating",
            "ques6": "Question 6 - Performance Rating"
        };
        return titles[questionKey] || questionKey;
    };

    const CounterBox = ({ title, count, icon, color }) => (
        <Paper
            elevation={3}
            sx={{
                p: 3,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${color}22, ${color}11)`,
                border: `2px solid ${color}33`,
                textAlign: 'center',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${color}33`
                }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: color, fontWeight: 'bold', mb: 1 }}>
                    {icon}
                </Typography>
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: 'bold',
                        color: color,
                        mb: 1,
                        fontFamily: 'monospace'
                    }}
                >
                    {formatNumber(count)}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
                    {title}
                </Typography>
            </Box>
        </Paper>
    );

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            width: "100%",
            background: "linear-gradient(135deg, #a8edea, #fed6e3)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 4
        }}>
            <Container maxWidth="xl" sx={{ flexGrow: 1 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                        textAlign: 'center',
                        mb: 4,
                        fontWeight: 'bold',
                        color: '#2c3e50'
                    }}
                >
                    Survey Statistics
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box sx={{ width: { xs: '100%', sm: '30%' }, mr: 2, mb: { xs: 2, sm: 0 } }}>
                        <FormControl fullWidth>
                            <InputLabel>Survey</InputLabel>
                            <Select
                                value={filters.surveyName}
                                label="Survey"
                                onChange={(e) => handleFilterChange('surveyName', e.target.value)}
                                disabled={loading.surveys}
                                sx={{ height: '56px' }}
                            >
                                <MenuItem value="">All Surveys</MenuItem>
                                {surveyOptions.map((survey, index) => (
                                    <MenuItem key={index} value={survey}>
                                        {survey}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ width: { xs: '100%', sm: '30%' }, mr: 2, mb: { xs: 2, sm: 0 } }}>
                        <FormControl fullWidth>
                            <InputLabel>Constituency</InputLabel>
                            <Select
                                value={filters.constituency}
                                label="Constituency"
                                onChange={(e) => handleFilterChange('constituency', e.target.value)}
                                disabled={loading.constituencies}
                                sx={{ height: '56px' }}
                            >
                                <MenuItem value="">All Constituencies</MenuItem>
                                {constituencyOptions.map((constituency, index) => (
                                    <MenuItem key={index} value={constituency}>
                                        {constituency}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ width: { xs: '100%', sm: '30%' }, mr: 2, mb: { xs: 2, sm: 0 } }}>
                        <FormControl fullWidth>
                            <InputLabel>Booth</InputLabel>
                            <Select
                                value={filters.boothNumber}
                                label="Booth"
                                onChange={(e) => handleFilterChange('boothNumber', e.target.value)}
                                disabled={loading.booths}
                                sx={{ height: '56px' }}
                            >
                                <MenuItem value="">All Booths</MenuItem>
                                {boothOptions.map((booth, index) => (
                                    <MenuItem key={index} value={booth}>
                                        Booth {booth}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="outlined"
                            startIcon={<Clear />}
                            onClick={handleClearFilters}
                            sx={{ 
                                textTransform: 'none', 
                                px: 4, 
                                py: 1,
                                height: '56px'
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

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{xs: 12, sm: 4}}>
                        <CounterBox
                            title="Total Constituencies"
                            count={animatedConstituenciesCount}
                            icon="🏛️"
                            color="#e74c3c"
                        />
                    </Grid>
                    <Grid size={{xs: 12, sm: 4}}>
                        <CounterBox
                            title="Total Booths"
                            count={animatedBoothsCount}
                            icon="🗳️"
                            color="#3498db"
                        />
                    </Grid>
                    <Grid size={{xs: 12, sm: 4}}>
                        <CounterBox
                            title="Total Voters"
                            count={animatedVotersCount}
                            icon="👥"
                            color="#2ecc71"
                        />
                    </Grid>
                </Grid>

                <Paper
                    elevation={3}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.25)",  
                        backdropFilter: "blur(10px)",  
                        border: '1px solid rgba(255,255,255,0.3)',
                        mb: 4
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            textAlign: 'center',
                            mb: 3,
                            fontWeight: 'bold',
                            color: '#2c3e50'
                        }}
                    >
                        Political Party Preferences
                    </Typography>
                    
                    <Grid container spacing={3}>
                        {["Vote 2016", "Vote 2021", "Vote 2026"].map((questionKey) => (
                            <Grid size={{xs: 12, md: 4}} key={questionKey}>
                                {renderBarChart(questionKey, getQuestionTitle(questionKey))}
                            </Grid>
                        ))}
                    </Grid>
                </Paper>

                <Paper
                    elevation={3}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.25)",  
                        backdropFilter: "blur(10px)",  
                        border: '1px solid rgba(255,255,255,0.3)',
                        mb: 4
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            textAlign: 'center',
                            mb: 3,
                            fontWeight: 'bold',
                            color: '#2c3e50'
                        }}
                    >
                        Performance Ratings
                    </Typography>
                    
                    <Grid container spacing={3}>
                        {["CM EPS (2017–2021)", "CM Stalin (2021–2026)", "Current MLA"].map((questionKey) => (
                            <Grid size={{xs: 12, md: 4}} key={questionKey}>
                                {renderPieChart(questionKey, getQuestionTitle(questionKey))}
                            </Grid>
                        ))}
                    </Grid>
                </Paper>

                <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
}