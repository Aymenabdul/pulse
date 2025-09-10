/* eslint-disable react-hooks/rules-of-hooks */
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
    CartesianGrid,
    LabelList,
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
import NOTA from "../../assets/nota.png";
import MNM from "../../assets/mnm.png";

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
    "MNM": MNM,
    "CPM": CPM,
    "PMK": PMK,
    "DMDK": DMDK,
    "NOTA": NOTA,
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

const categoricalColors = [
    '#4ECDC4', '#FF6B35', '#FFC107', '#45B7D1', '#96CEB4',
    '#E74C3C', '#3498DB', '#2ECC71', '#F1C40F', '#9B59B6'
];

const formatLabel = (label) => {
    if (!label || label === null || label === undefined) return '';

    const labelStr = String(label);

    let formatted = labelStr.replace(/['"[\]]/g, '');

    const parts = formatted.split(/[,/&-]/).map(part => {
        return part.trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    });

    return parts.join(' / ');
};

export default function Statistics() {
    const [filters, setFilters] = useState({
        constituency: '',
        boothNumber: '',
        surveyName: ''
    });

    const [statistics, setStatistics] = useState(initialStatistics);
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
            const response = await axiosInstance.get('/survey/getAllSurveyNames');
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
            console.log('Fetched booths:', response.data);

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

            console.log('Fetched statistics:', data);

            let newStats = { ...initialStatistics };

            // Handle the different API response structures
            if (data.hasOwnProperty('filedataTotalConstituencies')) {
                // Case: No filters applied (global counts)
                newStats = {
                    totalConstituencies: data.filedataTotalConstituencies || 0,
                    totalBooths: data.filedataTotalBooths || 0,
                    totalVoters: data.filedataTotalVoters || 0,
                };
            } else if (data.hasOwnProperty('constituencyCount') && data.hasOwnProperty('boothCount')) {
                // Case: Constituency filter applied (with or without survey)
                newStats = {
                    totalConstituencies: data.constituencyCount || 0,
                    totalBooths: data.boothCount || 0,
                    totalVoters: data.voterCount || 0,
                };
            } else if (data.hasOwnProperty('voterCount') && !data.hasOwnProperty('constituencyCount')) {
                // Case: Booth filter applied (with or without survey/constituency)
                newStats = {
                    // In this case, constituencyCount and boothCount would be 1
                    totalConstituencies: data.constituencyCount || 1, // Booth implies 1 constituency in the response.
                    totalBooths: data.boothCount || 1, // Booth implies 1 booth in the response.
                    totalVoters: data.voterCount || 0,
                };
            }

            // This is a catch-all for when only surveyName is provided, 
            // which might return specific keys like 'surveyTotalConstituencies'
            else if (data.hasOwnProperty('surveyTotalConstituencies')) {
                newStats = {
                    totalConstituencies: data.surveyTotalConstituencies || 0,
                    totalBooths: data.surveyTotalBooths || 0,
                    totalVoters: data.surveyTotalVotes || 0,
                };
            }

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

            console.log('Filters:', filters);

            if (filters.surveyName) params.append('surveyName', filters.surveyName);
            if (filters.constituency) params.append('constituency', filters.constituency);
            if (filters.boothNumber) params.append('booth', filters.boothNumber);

            const response = await axiosInstance.get(`/survey/filterBySurveyNameAndConstituency?${params.toString()}`);
            console.log('Fetched chart:', response.data);
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

    const PieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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

    // Custom Label for Bar Charts to prevent overflow
    const OverflowProtectedLabel = (props) => {
        const { x, y, width, height, value, displayMode } = props;
        const isPercentage = displayMode === 'percentage';
        const formattedValue = isPercentage ? `${value}%` : value;

        // Threshold to decide when to move the label outside
        // For rotated text, height is the limiting factor. 20px is a safe bet for a 16px font.
        const heightThreshold = 25;

        if (height < heightThreshold) {
            // Render label above the bar if bar is too short
            return (
                <text x={x + width / 2} y={y - 5} dy={12} fill="#000" textAnchor="middle" fontSize={18}>
                    {formattedValue}
                </text>
            );
        }

        // Render label inside the bar (rotated)
        return (
            <g transform={`rotate(-90, ${x + width / 2}, ${y + height / 2})`}>
                <text
                    x={x + width / 2}
                    y={y + height / 2}
                    dy={5} // Adjust vertical alignment of text inside bar
                    textAnchor="middle"
                    fill="white"
                    fontSize={16}
                    fontWeight="bolder"
                >
                    {formattedValue}
                </text>
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
                                size="medium"
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
                            margin={{ top: 40, right: 20, left: 20, bottom: 80 }}
                            maxBarSize={60}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="party"
                                tick={{ fontSize: 11, fontWeight: 'bold', fill: 'black', fontFamily: 'sans-serif' }}
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={70}
                                tickFormatter={formatLabel}
                            />
                            <YAxis
                                domain={displayModes[question] === 'percentage' ? [0, 100] : [0, 'auto']}
                                tick={{ fill: 'black', fontFamily: 'sans-serif' }}
                                label={{
                                    value: yAxisLabel,
                                    angle: -90,
                                    position: 'insideLeft',
                                    dx: -10,
                                    style: { fill: 'black', fontFamily: 'sans-serif' }
                                }}
                            />
                            <Tooltip content={PoliticalTooltip} />
                            <Bar
                                dataKey={dataKey}
                                shape={CustomBarShape}
                                maxBarSize={60}
                            >
                                <LabelList
                                    dataKey={dataKey}
                                    content={<OverflowProtectedLabel displayMode={displayModes[question]} />}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Box>
        );
    };

    const renderHorizontalBarChart = () => {
        const [selectedYear, setSelectedYear] = useState('');
        const [selectedParty, setSelectedParty] = useState('');
        const [displayMode, setDisplayMode] = useState('count');
        const [horizontalData, setHorizontalData] = useState([]);
        const [horizontalLoading, setHorizontalLoading] = useState(false);

        const yearOptions = [
            { value: 'ques1', label: '2016' },
            { value: 'ques2', label: '2021' },
            { value: 'ques3', label: '2026' }
        ];

        const partyOptions = [
            { value: 'AIADMK', label: 'AIADMK' },
            { value: 'DMK', label: 'DMK' },
            { value: 'BJP', label: 'BJP' },
            { value: 'INC', label: 'INC' },
            { value: 'NTK', label: 'NTK' },
            { value: 'TVK', label: 'TVK' },
            { value: 'VCK', label: 'VCK' },
            { value: 'MDMK', label: 'MDMK' },
            { value: 'CPI', label: 'CPI' },
            { value: 'CPM', label: 'CPM' },
            { value: 'PMK', label: 'PMK' },
            { value: 'DMDK', label: 'DMDK' },
            { value: 'MNM', label: 'MNM' },
            { value: 'MUSLIM PARTIES (SPECIFY)', label: 'Muslim Parties' },
            { value: 'OTHERS (SPECIFY)', label: 'Others' },
            { value: 'INDEPENDENT (SPECIFY)', label: 'Independent' },
            { value: 'NOTA', label: 'NOTA' }
        ];

        const fetchHorizontalData = async (year = '', party = '', surveyName = '', constituency = '', booth = '') => {
            setHorizontalLoading(true);
            try {
                console.log("📌 Fetching Horizontal Data with filters:", {
                    year,
                    party,
                    surveyName,
                    constituency,
                    booth
                });

                const params = new URLSearchParams();

                console.log('booth for occupation count', booth);

                if (year) params.append(year, party);
                if (surveyName) params.append('surveyName', surveyName);
                if (constituency) params.append('constituency', constituency);
                if (booth) params.append('booth', booth);

                console.log("📌 Final Request URL:", `/survey/occupation-counts?${params.toString()}`);

                const response = await axiosInstance.get(`/survey/occupation-counts?${params.toString()}`);
                console.log("✅ API Response Data:", response.data);

                const result = response.data;

                const processedData = Object.entries(result)
                    .filter(([occupation, count]) => occupation && count > 0 && occupation !== "Unknown")
                    .map(([occupation, count]) => ({
                        name: formatLabel(occupation),
                        value: Number(count) || 0
                    }))
                    .sort((a, b) => b.value - a.value);

                console.log("📊 Processed Data:", processedData);

                const total = processedData.reduce((sum, entry) => sum + entry.value, 0);

                const finalData = processedData.map(entry => ({
                    ...entry,
                    percentage: total > 0 ? parseFloat(((entry.value / total) * 100).toFixed(1)) : 0
                }));

                console.log("📊 Final Data with Percentages:", finalData);

                setHorizontalData(finalData);
            } catch (error) {
                console.error('❌ Error fetching horizontal data:', error);
                setHorizontalData([]);
            } finally {
                setHorizontalLoading(false);
            }
        };

        useEffect(() => {
            console.log("🎯 useEffect triggered with filters:", {
                selectedYear,
                selectedParty,
                surveyName: filters.surveyName,
                constituency: filters.constituency,
                booth: filters.boothNumber
            });

            if (filters.surveyName) {
                fetchHorizontalData(selectedYear, selectedParty, filters.surveyName, filters.constituency, filters.boothNumber);
            } else {
                setHorizontalData([]);
            }
        }, [selectedYear, selectedParty, filters.surveyName, filters.constituency, filters.boothNumber]);


        useEffect(() => {
            if (filters.surveyName) {
                fetchHorizontalData(selectedYear, selectedParty, filters.surveyName, filters.constituency, filters.boothNumber);
            } else {
                setHorizontalData([]);
            }
        }, [selectedYear, selectedParty, filters.surveyName, filters.constituency, filters.boothNumber]);


        const handleYearChange = (event) => {
            setSelectedYear(event.target.value);
        };

        const handlePartyChange = (event) => {
            setSelectedParty(event.target.value);
        };

        const handleHorizontalDisplayModeChange = (checked) => {
            setDisplayMode(checked ? 'percentage' : 'count');
        };

        const yAxisLabel = displayMode === 'count' ? 'Count' : 'Percentage (%)';
        const dataKey = displayMode === 'count' ? 'value' : 'percentage';
        const currentYearLabel = yearOptions.find(opt => opt.value === selectedYear)?.label || '';
        const currentPartyLabel = partyOptions.find(opt => opt.value === selectedParty)?.label || '';

        const chartTitle = selectedYear && selectedParty
            ? `${currentPartyLabel} SUPPORTERS BY OCCUPATION (${currentYearLabel})`
            : 'OCCUPATION DISTRIBUTION';

        const CustomHorizontalTooltip = ({ active, payload, label }) => {
            if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
                        <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                            Count: {data.value}
                            {data.percentage && (
                                <span> ({data.percentage.toFixed(1)}%)</span>
                            )}
                        </p>
                    </div>
                );
            }
            return null;
        };

        if (horizontalLoading) {
            return (
                <Box sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" sx={{ textAlign: 'center', mb: 2, fontSize: '1rem' }}>
                        {chartTitle}
                    </Typography>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                </Box>
            );
        }

        if (!filters.surveyName) {
            return (
                <Box sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" sx={{ textAlign: 'center', mb: 2, fontSize: '1rem' }}>
                        OCCUPATION DISTRIBUTION
                    </Typography>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Please select a survey first to view occupation data
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
                mt: 3
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
                    {chartTitle}
                </Typography>

                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    gap: { xs: 1, sm: 2 },
                    flexWrap: 'wrap'
                }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Year</InputLabel>
                        <Select
                            value={selectedYear}
                            onChange={handleYearChange}
                            disabled={horizontalLoading}
                            label="Year"
                        >
                            <MenuItem value="">All Years</MenuItem>
                            {yearOptions.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Party</InputLabel>
                        <Select
                            value={selectedParty}
                            onChange={handlePartyChange}
                            disabled={horizontalLoading}
                            label="Party"
                        >
                            <MenuItem value="">All Parties</MenuItem>
                            {partyOptions.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={displayMode === 'percentage'}
                                onChange={(e) => handleHorizontalDisplayModeChange(e.target.checked)}
                                disabled={horizontalLoading}
                                size="small"
                            />
                        }
                        label={displayMode === 'count' ? 'Show Percentage' : 'Show Count'}
                        sx={{ fontSize: '0.875rem' }}
                    />
                </Box>

                <Box sx={{ flex: 1, minHeight: '350px' }}>
                    {horizontalLoading ? (
                        // Display a loading indicator while the data is being fetched
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <CircularProgress />
                        </Box>
                    ) : horizontalData.length === 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Typography variant="body2" color="text.secondary">
                                No occupation data available
                            </Typography>
                        </Box>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={horizontalData}
                                margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    type="number"
                                    domain={displayMode === 'percentage' ? [0, 100] : [0, 'auto']}
                                    tick={{ fill: 'black', fontFamily: 'sans-serif' }}
                                    label={{ value: yAxisLabel || 'Occupation Count', position: 'insideBottom', offset: -10, style: { fill: 'black', fontFamily: 'sans-serif' } }}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={90}
                                    tick={{ fontSize: 14, fontWeight: '700', fill: 'black', fontFamily: 'sans-serif', }}
                                    tickFormatter={formatLabel}
                                />
                                <Tooltip content={<CustomHorizontalTooltip />} />
                                <Bar
                                    dataKey={dataKey}
                                    barSize={30}
                                >
                                    {horizontalData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={categoricalColors[index % categoricalColors.length]} />
                                    ))}
                                    <LabelList
                                        dataKey={dataKey}
                                        position="center"
                                        formatter={(value) => displayMode === 'percentage' ? `${value}%` : value}
                                        style={{
                                            fill: 'white',
                                            fontWeight: 'bolder',
                                            fontSize: 16,
                                            fontFamily: 'sans-serif',
                                            textShadow: '1px 1px 3px rgba(0,0,0,0.3)' // Optional: Adds a shadow for better visibility of labels
                                        }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Box>

            </Box>
        );
    };

    const renderPieChart = (question, title) => {
        const chartData = preparePieChartData(responseData[question]);
        const renderCustomPieLabel = (props) => {
            const { cx, cy, midAngle, outerRadius, fill, percent, name } = props;
            const RADIAN = Math.PI / 180;

            const sin = Math.sin(-RADIAN * midAngle);
            const cos = Math.cos(-RADIAN * midAngle);
            const sx = cx + (outerRadius + 10) * cos;
            const sy = cy + (outerRadius + 10) * sin;
            const mx = cx + (outerRadius + 30) * cos;
            const my = cy + (outerRadius + 30) * sin;
            const ex = mx + (cos >= 0 ? 1 : -1) * 22;
            const ey = my;
            const textAnchor = cos >= 0 ? 'start' : 'end';

            const labelText = `${name} ${(percent * 100).toFixed(0)}%`;

            return (
                <g>
                    <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
                    <circle cx={sx} cy={sy} r={2} fill={fill} stroke="none" />
                    <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        {labelText}
                    </text>
                </g>
            );
        };
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
                                outerRadius={60}
                                innerRadius={0}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={renderCustomPieLabel}
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
                                    textAlign: 'center',
                                    color: '#000000'
                                }}
                                formatter={(value) => {
                                    return <span style={{ color: "black" }}>{value}</span>;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
            </Box>
        );
    };

    const prepareSimpleBarData = (questionData, maxItems = 5, question = '') => {
        if (!questionData || typeof questionData !== 'object') {
            return [];
        }

        if (question === 'voterStatus') {
            const voterStatusOrder = [
                'Moved to different constituency',
                'Passed away',
                'Working abroad'
            ];

            const filteredEntries = voterStatusOrder
                .map(status => ({
                    name: formatLabel(status),
                    value: parseInt(questionData[status]) || 0
                }))
                .filter(entry => entry.value > 0);

            if (filteredEntries.length === 0) return [];

            const total = filteredEntries.reduce((sum, entry) => sum + entry.value, 0);
            return filteredEntries.map(entry => ({
                ...entry,
                percentage: total > 0 ? parseFloat(((entry.value / total) * 100).toFixed(1)) : 0
            }));
        }

        const entries = Object.entries(questionData)
            .filter(([key, value]) => key && value > 0)
            .map(([key, value]) => ({
                name: formatLabel(key),
                value: parseInt(value) || 0
            }))
            .sort((a, b) => b.value - a.value) // This line sorts in descending order.
            .slice(0, maxItems);

        const total = entries.reduce((sum, entry) => sum + entry.value, 0);

        let finalEntries = entries.map(entry => ({
            ...entry,
            percentage: total > 0 ? parseFloat(((entry.value / total) * 100).toFixed(1)) : 0
        }));

        // This block is removed to allow the default descending sort to apply to 'ques7'.
        // if (question === 'ques7') {
        //     finalEntries = arrangeDataCenterOut(finalEntries);
        // }

        return finalEntries;
    };

    // The arrangeDataCenterOut function is no longer called for 'ques7'
    const arrangeDataCenterOut = (sortedData) => {
        if (sortedData.length === 0) return [];
        if (sortedData.length === 1) return sortedData;

        const arranged = new Array(sortedData.length);
        const centerIndex = Math.floor(sortedData.length / 2);

        arranged[centerIndex] = sortedData[0];

        let leftIndex = centerIndex - 1;
        let rightIndex = centerIndex + 1;

        for (let i = 1; i < sortedData.length; i++) {
            if (i % 2 === 1) {
                if (rightIndex < arranged.length) {
                    arranged[rightIndex] = sortedData[i];
                    rightIndex++;
                } else if (leftIndex >= 0) {
                    arranged[leftIndex] = sortedData[i];
                    leftIndex--;
                }
            } else {
                if (leftIndex >= 0) {
                    arranged[leftIndex] = sortedData[i];
                    leftIndex--;
                } else if (rightIndex < arranged.length) {
                    arranged[rightIndex] = sortedData[i];
                    rightIndex++;
                }
            }
        }

        return arranged;
    };

    const ques7Colors = [
        "#A7E8E2",
        "#8FE2DA",
        "#77DBD2",
        "#5FD5CA",
        "#4ECDC4",
        "#44B9B0",
        "#3AA59D",
        "#30918A",
        "#267D77",
        "#1C6964"
    ]

    const renderSimpleBarChart = (question, title) => {
        const [showTop10, setShowTop10] = useState(false);
        const currentMaxItems = showTop10 ? 10 : 5;
        const data = prepareSimpleBarData(responseData[question], currentMaxItems, question);
        const displayMode = displayModes[question] || 'count';
        const yAxisLabel = displayMode === 'count' ? 'Count' : 'Percentage (%)';
        const dataKey = displayMode === 'count' ? 'value' : 'percentage';

        const CustomTooltip = ({ active, payload, label }) => {
            if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
                        <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                            Count: {data.value}
                            {displayMode === 'percentage' && (
                                <span> ({data.percentage.toFixed(1)}%)</span>
                            )}
                        </p>
                    </div>
                );
            }
            return null;
        };

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
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    gap: { xs: 1, sm: 2 }
                }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={displayMode === 'percentage'}
                                onChange={(e) => handleDisplayModeChange(question, e.target.checked)}
                                disabled={loading.responses}
                                size="small"
                            />
                        }
                        label={displayMode === 'count' ? 'Show Percentage' : 'Show Count'}
                        sx={{ fontSize: '0.875rem' }}
                    />
                    {question === 'ques7' && (
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showTop10}
                                    onChange={(e) => setShowTop10(e.target.checked)}
                                    disabled={loading.responses}
                                    size="small"
                                    color="secondary"
                                />
                            }
                            label={showTop10 ? 'Top 5' : 'Top 10'}
                            sx={{
                                fontSize: '0.875rem',
                                ml: { xs: 0, sm: 1 }
                            }}
                        />
                    )}
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
                                dataKey="name"
                                tick={{ fontSize: 12, fill: 'black', fontFamily: 'sans-serif' }}
                                interval={0}
                                angle={-40}
                                textAnchor="end"
                                height={80}
                                tickFormatter={formatLabel}
                            />
                            <YAxis
                                domain={displayMode === 'percentage' ? [0, 100] : [0, 'auto']}
                                tick={{ fill: 'black', fontFamily: 'sans-serif' }}
                                label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fill: 'black', fontFamily: 'sans-serif' } }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey={dataKey}
                                maxBarSize={60}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={question === "ques7" ? ques7Colors[index % ques7Colors.length]
                                            : categoricalColors[index % categoricalColors.length]}
                                    />
                                ))}
                                <LabelList
                                    dataKey={dataKey}
                                    content={<OverflowProtectedLabel displayMode={displayMode} />}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Box>
        );
    };

    const getQuestionTitle = (questionKey) => {
        const titles = {
            "ques1": "Voted Parties in 2016",
            "ques2": "Voted Parties in 2021",
            "ques3": "Preferred Parties for 2026",
            "ques4": "CM EPS (2017–2021)",
            "ques5": "CM Stalin (2021–2026)",
            "ques6": "Current MLA",
            "ques7": "Important Issues In The Constituency"
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
                        color: '#2c3e50',
                        transform: 'uppercase',
                    }}
                >
                    SURVEY ANALYTICS
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
                                {boothOptions
                                    .slice()
                                    .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }))
                                    .map((booth, index) => (
                                        <MenuItem key={index} value={booth}>
                                            {booth}
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
                        <Typography sx={{ ml: 2, alignSelf: 'center' }}>Loading Analytics...</Typography>
                    </Box>
                )}

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <CounterBox
                            title="Total Constituencies"
                            count={animatedConstituenciesCount}
                            icon="🏛️"
                            color="#e74c3c"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <CounterBox
                            title="Total Booths"
                            count={animatedBoothsCount}
                            icon="🗳️"
                            color="#3498db"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
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
                            color: '#2c3e50',
                            textTransform: 'uppercase'
                        }}
                    >
                        Political Party Preferences
                    </Typography>

                    <Grid container spacing={3} style={{ textTransform: 'uppercase', fontWeight: '700' }}>
                        {["ques1", "ques2", "ques3"].map((questionKey) => (
                            <Grid size={{ xs: 12, md: 4 }} key={questionKey}>
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
                            color: '#2c3e50',
                            textTransform: 'uppercase'
                        }}
                    >
                        Survey Demographics & Issues
                    </Typography>

                    <Grid container spacing={3} style={{ textTransform: 'uppercase', fontWeight: '700' }}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                                    Important Issues in Constituency
                                </Typography>
                                {renderSimpleBarChart('ques7', '', 5)}
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                                    Voter Status
                                </Typography>
                                {renderSimpleBarChart('voterStatus', '', 3)}
                            </Box>
                        </Grid>
                        {/* <Grid size={{xs:12, md:4}}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                                    Voter Type
                                </Typography>
                                {renderSimpleBarChart('voterType', '', 3)}
                            </Box>
                        </Grid> */}
                    </Grid>
                    <Box sx={{ mt: 4 }}>
                        {renderHorizontalBarChart()}
                    </Box>
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
                            color: '#2c3e50',
                            textTransform: 'uppercase'
                        }}
                    >
                        Performance Ratings
                    </Typography>

                    <Grid container spacing={3} style={{ textTransform: 'uppercase', fontWeight: '500', fontFamily: 'sans-serif' }}>
                        {["ques4", "ques5", "ques6"].map((questionKey) => (
                            <Grid size={{ xs: 12, md: 4 }} key={questionKey}>
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