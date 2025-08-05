import { useState } from "react";
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
    Alert
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

export default function WithVoterId() {
    const navigate = useNavigate();
    const location = useLocation();

    const [filters, setFilters] = useState({
        survey: '',
        constituency: '188-MELUR',
        boothNumber: '',
        district: '',
        name: '',
        houseNo: ''
    });

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedVoterId, setSelectedVoterId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [showAdditionalFilters, setShowAdditionalFilters] = useState(false);

    const [voters, setVoters] = useState([
        {
            id: 1,
            name: "Siva Balaji",
            voterId: "YSO2216778",
            serialNumber: 1,
            relative: "Sasi Kumar",
            boothNo: 1,
            houseNo: 101,
            voted: true,
            verified: true,
            survey: "2024-election",
            constituency: "188-MELUR",
            district: "madurai"
        },
        {
            id: 2,
            name: "Chinnasamy K",
            voterId: "YSO1367010",
            serialNumber: 2,
            relative: "Ariyan P",
            boothNo: 1,
            houseNo: 102,
            voted: false,
            verified: false,
            survey: "public-opinion",
            constituency: "188-MELUR",
            district: "madurai"
        },
        {
            id: 3,
            name: "Praween Kumar",
            voterId: "YSO1315563",
            serialNumber: 3,
            relative: "Jeyaraj M",
            boothNo: 1,
            houseNo: 103,
            voted: true,
            verified: true,
            survey: "2024-election",
            constituency: "188-MELUR",
            district: "madurai"
        },
        {
            id: 4,
            name: "Vasar Arafath",
            voterId: "YSO1315555",
            serialNumber: 4,
            relative: "Mohammed Ali",
            boothNo: 2,
            houseNo: 201,
            voted: false,
            verified: false,
            survey: "public-opinion",
            constituency: "188-MELUR",
            district: "madurai"
        },
        {
            id: 5,
            name: "Saranya Devi",
            voterId: "YSO2241008",
            serialNumber: 5,
            relative: "Raman S",
            boothNo: 2,
            houseNo: 202,
            voted: true,
            verified: true,
            survey: "2024-election",
            constituency: "188-MELUR",
            district: "madurai"
        },
        {
            id: 6,
            name: "Kaviyarasu T",
            voterId: "YSO1367077",
            serialNumber: 6,
            relative: "Kumaran R",
            boothNo: 2,
            houseNo: 203,
            voted: false,
            verified: false,
            survey: "constituency-feedback",
            constituency: "188-MELUR",
            district: "madurai"
        },
        {
            id: 7,
            name: "Anand M",
            voterId: "YSO1234567",
            serialNumber: 7,
            relative: "Mala V",
            boothNo: 3,
            houseNo: 301,
            voted: true,
            verified: false,
            survey: "public-opinion",
            constituency: "188-MELUR",
            district: "theni"
        },
        {
            id: 8,
            name: "Bhavani S",
            voterId: "YSO7654321",
            serialNumber: 8,
            relative: "Kumar P",
            boothNo: 3,
            houseNo: 302,
            voted: false,
            verified: true,
            survey: "2024-election",
            constituency: "188-MELUR",
            district: "dindigul"
        },
        {
            id: 9,
            name: "Ganesh K",
            voterId: "YSO9876543",
            serialNumber: 9,
            relative: "Lakshmi A",
            boothNo: 1,
            houseNo: 104,
            voted: true,
            verified: true,
            survey: "constituency-feedback",
            constituency: "189-MADURAI-EAST",
            district: "madurai"
        },
        {
            id: 10,
            name: "Deepa R",
            voterId: "YSO1122334",
            serialNumber: 10,
            relative: "Suresh B",
            boothNo: 2,
            houseNo: 204,
            voted: false,
            verified: false,
            survey: "2024-election",
            constituency: "188-MELUR",
            district: "madurai"
        },
        {
            id: 11,
            name: "Vikram P",
            voterId: "YSO3344556",
            serialNumber: 11,
            relative: "Priya V",
            boothNo: 3,
            houseNo: 303,
            voted: true,
            verified: true,
            survey: "public-opinion",
            constituency: "189-MADURAI-EAST",
            district: "theni"
        },
        {
            id: 12,
            name: "Prakash L",
            voterId: "YSO6677889",
            serialNumber: 12,
            relative: "Geetha M",
            boothNo: 1,
            houseNo: 105,
            voted: false,
            verified: false,
            survey: "constituency-feedback",
            constituency: "188-MELUR",
            district: "madurai"
        }
    ]);

    const selectedVoter = voters.find(voter => voter.id === selectedVoterId);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            survey: '',
            constituency: '188-MELUR',
            boothNumber: '',
            district: '',
            name: '',
            houseNo: ''
        });
        setShowAdditionalFilters(false);
    };

    // const handleVoterClick = (voter) => {
    //     if (voter.verified) {
    //         console.log(`Navigating to survey page for verified voter: ${voter.name} with ID: ${voter.voterId}`);
    //         window.location.href = `/survey/${voter.voterId}?edit=true`;
    //     } else {
    //         console.log(`Navigating to new survey page for unverified voter: ${voter.name} with ID: ${voter.voterId}`);
    //         window.location.href = `/survey/${voter.voterId}?new=true`;
    //     }
    // };

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

    const handleDelete = () => {
        setVoters(prev => prev.filter(voter => voter.id !== selectedVoterId));
        setSnackbarMessage('Entry deleted successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        handleMenuClose();
    };

    const handleVotedToggle = () => {
        setVoters(prev =>
            prev.map(voter =>
                voter.id === selectedVoterId
                    ? { ...voter, voted: !voter.voted }
                    : voter
            )
        );
        setSnackbarMessage(selectedVoter?.voted ? 'Voter unmarked as voted.' : 'Voter marked as voted!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        handleMenuClose();
    };

    const handleVerifiedToggle = () => {
        setVoters(prev =>
            prev.map(voter =>
                voter.id === selectedVoterId
                    ? { ...voter, verified: !voter.verified }
                    : voter
            )
        );
        setSnackbarMessage(selectedVoter?.verified ? 'Voter unmarked as verified.' : 'Voter marked as verified!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
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

    const isAnyFilterActive = Object.keys(filters).some(key => {
        if (key === 'constituency') {
            return filters[key] !== '188-MELUR';
        }
        return filters[key] !== '';
    });

    return (
        <Box
            sx={{
                minHeight: '100vh',
                p: 3
            }}
        >
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
                            <FormControl fullWidth size="small"
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
                                    '& .MuiSelect-icon': {
                                        color: 'rgba(0, 0, 0, 0.6)',
                                    }
                                }}>
                                <InputLabel>Survey</InputLabel>
                                <Select
                                    value={filters.survey}
                                    label="Survey"
                                    onChange={(e) => handleFilterChange('survey', e.target.value)}
                                >
                                    <MenuItem value="">Select Survey</MenuItem>
                                    <MenuItem value="2024-election">2024 Election Survey</MenuItem>
                                    <MenuItem value="public-opinion">Public Opinion Poll</MenuItem>
                                    <MenuItem value="constituency-feedback">Constituency Feedback</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl fullWidth size="small"
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
                                    '& .MuiSelect-icon': {
                                        color: 'rgba(0, 0, 0, 0.6)',
                                    }
                                }}>
                                <InputLabel>Constituency</InputLabel>
                                <Select
                                    value={filters.constituency}
                                    label="Constituency"
                                    onChange={(e) => handleFilterChange('constituency', e.target.value)}
                                >
                                    <MenuItem value="188-MELUR">188-MELUR</MenuItem>
                                    <MenuItem value="189-MADURAI-EAST">189-MADURAI-EAST</MenuItem>
                                    <MenuItem value="190-MADURAI-WEST">190-MADURAI-WEST</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl fullWidth size="small"
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
                                    '& .MuiSelect-icon': {
                                        color: 'rgba(0, 0, 0, 0.6)',
                                    }
                                }}>
                                <InputLabel>Booth Number</InputLabel>
                                <Select
                                    value={filters.boothNumber}
                                    label="Booth Number"
                                    onChange={(e) => handleFilterChange('boothNumber', e.target.value)}
                                >
                                    <MenuItem value="">Select Booth</MenuItem>
                                    <MenuItem value="1">Booth 1</MenuItem>
                                    <MenuItem value="2">Booth 2</MenuItem>
                                    <MenuItem value="3">Booth 3</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl fullWidth size="small"
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
                                    '& .MuiSelect-icon': {
                                        color: 'rgba(0, 0, 0, 0.6)',
                                    }
                                }}>
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
                                        placeholder="House number"
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
                            </>
                        )}
                    </Grid>

                    <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
                        <Button
                            variant="outlined"
                            startIcon={<Search />}
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
                                }
                            }}
                        >
                            Search
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

                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 'bold',
                            color: 'rgba(0, 0, 0, 0.85)',
                            mb: 2
                        }}
                    >
                        Voter Database
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                        {isAnyFilterActive || filteredVoters.length > 0 ? (
                            filteredVoters.length > 0 ?
                                `${filteredVoters.length} voters found in ${filters.constituency}` :
                                'No voters found matching your criteria.'
                        ) : (
                            'Select filters to display data.'
                        )}
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {(isAnyFilterActive || (filters.constituency === '188-MELUR' && !isAnyFilterActive)) && filteredVoters.length > 0 ? (
                        filteredVoters.map((voter) => (
                            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={voter.id}>
                                <Card
                                    onClick={() => navigate('/survey/with-voter-id/form')}
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
                                                    {voter.name}
                                                </Typography>
                                                {voter.verified && (
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
                                                {voter.voted && (
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
                                                <strong>Voter ID:</strong> {voter.voterId}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)', mb: 0.5 }}>
                                                <strong>Serial Number:</strong> {voter.serialNumber}
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
                    ) : (
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ textAlign: 'center', mt: 4, color: 'rgba(0, 0, 0, 0.6)' }}>
                                <Typography variant="h5">
                                    {isAnyFilterActive ?
                                        'No voters found matching your criteria.' :
                                        'Select filters to display data.'
                                    }
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