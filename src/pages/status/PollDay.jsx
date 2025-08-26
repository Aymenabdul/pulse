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
    Pagination,
    Stack
} from "@mui/material";
import {
    ArrowBack,
    Clear,
    FilterList,
    MoreVert
} from "@mui/icons-material";
import axiosInstance from "../../axios/axios";
import VoterCardSkeleton from "../../components/VoterCardSkeleton";
import { useAuth } from "../../hooks/useAuth";
export default function PollDay() {
    const [filters, setFilters] = useState({
        constituency: '',
        boothNumber: '',
        name: '',
        gender: '',
        votedStatus: ''
    });
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const [loading, setLoading] = useState({
        constituencies: false,
        booths: false,
        search: false
    });

    const [constituencyOptions, setConstituencyOptions] = useState([]);
    const [boothOptions, setBoothOptions] = useState([]);
    const [allVoters, setAllVoters] = useState([]);
    const [filteredVoters, setFilteredVoters] = useState([]);

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedVoterId, setSelectedVoterId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const selectedVoter = allVoters.find(voter => voter.id === selectedVoterId);
    const totalPages = Math.ceil(filteredVoters.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageVoters = filteredVoters.slice(startIndex, endIndex);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    useEffect(() => {
        // Check if the user object is available
        if (user) {
            // If the role is admin or surveyor, and they have a constituency assigned
            if (user && (user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'surveyor') && user.constituency) {
                displayedConstituencyOptions = [user.constituency];
            }
        }

        console.log("User role:", user?.role, "Constituency:", user?.constituency);
        
    }, [user]);

    const shouldShowVoters = filters.constituency && filters.boothNumber;

    const fetchAllConstituencies = useCallback(async () => {
        setLoading(prev => ({ ...prev, constituencies: true }));
        try {
            const response = await axiosInstance.get(`/file/distinct-constituencies`);
            setConstituencyOptions(response.data || []);
        } catch (error) {
            console.error('Error fetching constituencies:', error);
            showSnackbar('Error fetching constituencies', 'error');
        } finally {
            setLoading(prev => ({ ...prev, constituencies: false }));
        }
    }, []);

    const fetchBooths = useCallback(async (constituency) => {
        if (!constituency) return;
        setLoading(prev => ({ ...prev, booths: true }));
        try {
            const response = await axiosInstance.get(`/file/distinct-booths?Constituency=${encodeURIComponent(constituency)}`);
            setBoothOptions(response.data || []);
        } catch (error) {
            console.error('Error fetching booths:', error);
            showSnackbar('Error fetching booths', 'error');
        } finally {
            setLoading(prev => ({ ...prev, booths: false }));
        }
    }, []);

    const fetchVoters = useCallback(async (currentFilters) => {
        const { constituency, boothNumber } = currentFilters;

        if (!constituency || !boothNumber) {
            setAllVoters([]);
            setFilteredVoters([]);
            setCurrentPage(1);
            return;
        }

        setLoading(prev => ({ ...prev, search: true }));

        try {
            const params = new URLSearchParams({
                Constituency: constituency,
                booth: boothNumber
            });

            const response = await axiosInstance.get(`/file/filter2?${params.toString()}`);
            
            const transformedVoters = response.data.map((voter, index) => ({
                id: voter.id || index + 1, 
                name: voter.name || 'N/A',
                voterId: voter.voterId || voter.voterID || 'N/A',
                serialNumber: voter.serialNumber || voter.serialNo || 'N/A',
                relative: voter.relationName || 'N/A',
                boothNo: voter.booth,
                houseNo: voter.houseNumber || 'N/A',
                constituency: voter.constituency || voter.assemblyConstituency || constituency,
                district: voter.district || 'N/A',
                gender: voter.gender || 'N/A',
                voted: Boolean(voter.voted)
            }));
            
            setAllVoters(transformedVoters);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error searching voters:', error);
            if (error.response?.status === 404) {
                setAllVoters([]);
                setFilteredVoters([]);
                setCurrentPage(1);
            } else {
                showSnackbar('Error searching voters. Please try again.', 'error');
            }
        } finally {
            setLoading(prev => ({ ...prev, search: false }));
        }
    }, []);

    const applyFilters = useCallback(() => {
        let filtered = [...allVoters];

        if (filters.name.trim()) {
            filtered = filtered.filter(voter => 
                voter.name.toLowerCase().includes(filters.name.trim().toLowerCase())
            );
        }

        if (filters.gender && filters.gender !== '') {
            filtered = filtered.filter(voter => 
                voter.gender.toLowerCase() === filters.gender.toLowerCase()
            );
        }

        if (filters.votedStatus && filters.votedStatus !== '') {
            const isVoted = filters.votedStatus === 'voted';
            filtered = filtered.filter(voter => Boolean(voter.voted) === isVoted);
        }

        setFilteredVoters(filtered);
        setCurrentPage(1);
    }, [allVoters, filters.name, filters.gender, filters.votedStatus]);

    useEffect(() => {
        fetchAllConstituencies();
    }, [fetchAllConstituencies]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

   const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));

    // When a constituency is selected, fetch its booths.
    if (field === 'constituency') {
        fetchBooths(value);
    }
}, [fetchBooths]);

   useEffect(() => {
    // This hook will run whenever the main filters change.
    if (filters.constituency && filters.boothNumber) {
        fetchVoters(filters);
    } else {
        // Clear voters if the required filters are not set
        setAllVoters([]);
    }
}, [filters.constituency, filters.boothNumber, fetchVoters]);

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            constituency: '',
            boothNumber: '',
            name: '',
            gender: '',
            votedStatus: ''
        };

        setFilters(clearedFilters);
        setConstituencyOptions([]);
        setBoothOptions([]);
        setAllVoters([]);
        setFilteredVoters([]);
        setCurrentPage(1);
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

    const handleVotedToggle = async () => {
        try {
            const currentVoter = allVoters.find(voter => voter.id === selectedVoterId);
            const isCurrentlyVoted = Boolean(currentVoter?.voted);
            
            const response = await axiosInstance.put(`/file/markAsVoted/${selectedVoterId}`);
            if (response.status === 200) {
                setAllVoters(prev => 
                    prev.map(voter => 
                        voter.id === selectedVoterId 
                            ? { ...voter, voted: !voter.voted }
                            : voter
                    )
                );
                showSnackbar(
                    isCurrentlyVoted ? 'Voter unmarked as voted!' : 'Voter marked as voted!', 
                    'success'
                );
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

  let displayedConstituencyOptions = constituencyOptions; // Default for superadmin

if (user && user.role && user.constituency) {
    const role = user.role.toLowerCase();

    if (role === 'admin') {
        // This is the critical part: it splits the string into a real array.
        // The .trim() removes any accidental spaces around the comma.
        displayedConstituencyOptions = user.constituency.split(',').map(c => c.trim());
    } else if (role === 'surveyor') {
        // Surveyor logic remains the same.
        displayedConstituencyOptions = [user.constituency];
    }
}

    const renderSkeletonCards = () => {
        return Array.from({ length: 6 }).map((_, index) => (
            <VoterCardSkeleton key={`skeleton-${index}`} />
        ));
    };

   return (
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, height: "100%", alignItems: "center", justifyContent: "center" }}>
            <Container maxWidth="xl">
                <Box sx={{ mb: 6 }}>
                    <Grid container spacing={3} sx={{ mb: 3 }}>

                        <Grid size={{xs:12 ,sm:6 , md:4}}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Constituency</InputLabel>
                                <Select
                                    value={filters.constituency}
                                    label="Constituency"
                                    onChange={(e) => handleFilterChange('constituency', e.target.value)}
                                    // The dropdown is disabled if:
                                    // 1. No survey is selected, OR
                                    // 2. The constituencies are loading, OR
                                    // 3. The logged-in user is an admin or a surveyor.
                                    disabled={loading.constituencies}
                                    endAdornment={loading.constituencies && <CircularProgress size={20} />}
                                >
                                    <MenuItem value="">Select Constituency</MenuItem>

                                    {/* Map over the conditionally filtered options */}
                                    {displayedConstituencyOptions.map((constituency, index) => (
                                        <MenuItem key={index} value={constituency}>
                                            {constituency}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
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
                            <FormControl fullWidth size="small">
                                <InputLabel>Gender</InputLabel>
                                <Select
                                    value={filters.gender}
                                    label="Gender"
                                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                                >
                                    <MenuItem value="">All Genders</MenuItem>
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Voted Status</InputLabel>
                                <Select
                                    value={filters.votedStatus}
                                    label="Voted Status"
                                    onChange={(e) => handleFilterChange('votedStatus', e.target.value)}
                                >
                                    <MenuItem value="">All Status</MenuItem>
                                    <MenuItem value="voted">Voted</MenuItem>
                                    <MenuItem value="not-voted">Not Voted</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
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
                    </Box>
                </Box>

                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 600,
                            color: 'rgba(0, 0, 0, 0.85)',
                            mb: 2,
                            textTransform: 'uppercase'
                        }}
                    >
                        Voter Details
                    </Typography>
                    {filteredVoters.length > 0 && (
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'rgba(0, 0, 0, 0.6)',
                                mb: 2
                            }}
                        >
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredVoters.length)} of {filteredVoters.length} voters
                        </Typography>
                    )}
                </Box>

                <Grid container spacing={4}>
                    {loading.search ? (
                        renderSkeletonCards()
                    ) : shouldShowVoters && currentPageVoters.length > 0 ? (
                        currentPageVoters.map((voter) => (
                            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={voter.id}>
                                <Card
                                    sx={{
                                        background: 'rgba(255, 255, 255, 0.25)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        borderRadius: 3,
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                        transition: 'all 0.3s ease',
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
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {/* Fix: Properly check boolean voted status */}
                                                {Boolean(voter?.voted) && (
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
                                                <strong>Gender:</strong> {voter?.gender}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.7)', mb: 0.5 }}>
                                                <strong>Relative:</strong> {voter.relative}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ textAlign: 'center', mt: 4, color: 'rgba(0, 0, 0, 0.6)' }}>
                                {shouldShowVoters ? (
                                    <Typography variant="h6">
                                        No voters found matching your criteria.
                                    </Typography>
                                ) : (
                                    <Typography variant="h6">
                                        Please select constituency, and booth to search for voter details.
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    )}
                </Grid>

                {filteredVoters.length > 0 && totalPages > 1 && (
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