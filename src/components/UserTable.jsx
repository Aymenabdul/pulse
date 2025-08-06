import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  TextField,
  Button,
  Paper,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import { useState, useEffect } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import axiosInstance from "../axios/axios";

const headCells = [
  { id: "name", label: "User", sortable: true },
  { id: "email", label: "Email", sortable: true },
  { id: "phone", label: "Phone", sortable: false },
  { id: "constituency", label: "Constituency", sortable: true },
  { id: "role", label: "Role", sortable: false },
  { id: "status", label: "Status", sortable: false },
  { id: "actions", label: "Actions", sortable: false }
];

export default function UserTable({ users }) {
  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [userData, setUserData] = useState(users);
  const [searchConstituency, setSearchConstituency] = useState("");
  const [loading, setLoading] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Effect to update userData if the users prop changes
  useEffect(() => {
    setUserData(users);
  }, [users]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter and search functionality
  const getFilteredUsers = () => {
    return userData.filter(user => {
      // Search filters
      const nameMatch = user.name?.toLowerCase().includes(searchName.toLowerCase()) || searchName === "";
      const emailMatch = user.email?.toLowerCase().includes(searchEmail.toLowerCase()) || searchEmail === "";
      const constituencyMatch = user.constituency?.toLowerCase().includes(searchConstituency.toLowerCase()) || searchConstituency === "";
      
      // Status filter
      const statusMatch = statusFilter === "" || 
        (statusFilter === "active" && user.accept === "1") ||
        (statusFilter === "inactive" && user.accept === "0");
      
      // Role filter
      const roleMatch = roleFilter === "" || user.role?.toLowerCase() === roleFilter.toLowerCase();
      
      return nameMatch && emailMatch && constituencyMatch && statusMatch && roleMatch;
    });
  };

  // Sort functionality
  const getSortedUsers = (users) => {
    const filteredUsers = [...users];
    
    if (orderBy && headCells.find(cell => cell.id === orderBy)?.sortable) {
      filteredUsers.sort((a, b) => {
        let aValue = a[orderBy];
        let bValue = b[orderBy];
        
        // Handle null/undefined values
        if (aValue == null) aValue = "";
        if (bValue == null) bValue = "";
        
        // Convert to string for comparison
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
        
        if (order === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }
    
    return filteredUsers;
  };

  const refreshUserData = async () => {
    try {
      const response = await axiosInstance.get('/all'); 
      setUserData(response.data);
    } catch (error) {
      console.error("Error refreshing user data:", error);
      showSnackbar("Error refreshing user data", "error");
    }
  };

  const handleActivateUser = async (email, userId) => {
    setLoading(prev => ({ ...prev, [userId]: true }));

    try {
      const response = await axiosInstance.put(`/activate-user?email=${email}`);
      
      const message = response.data?.message || response.data || "User activated successfully";
      showSnackbar(message, "success");
      
      await refreshUserData();
    } catch (e) {
      console.error("Error activating user:", e);
      
      const errorMessage = e.response?.data?.message || e.response?.data?.error || e.response?.data || "Error activating user";
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeactivateUser = async (email, userId) => {
    setLoading(prev => ({ ...prev, [userId]: true }));

    try {
      const response = await axiosInstance.put(`/decline-user?email=${email}`);
      
      const message = response.data?.message || response.data || "User deactivated successfully";
      showSnackbar(message, "success");
      
      await refreshUserData();
    } catch (e) {
      console.error("Error deactivating user:", e);
      
      // Show the exact error message from backend
      const errorMessage = e.response?.data?.message || e.response?.data?.error || e.response?.data || "Error deactivating user";
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const getUniqueRoles = () => {
    const roles = [...new Set(userData.map(user => user.role).filter(Boolean))];
    return roles.sort();
  };

  const getStatusText = (acceptValue) => {
    return acceptValue === "Accepted" ? "Active" : "Inactive";
  };

  const clearAllFilters = () => {
    setSearchName("");
    setSearchEmail("");
    setSearchConstituency("");
    setStatusFilter("");
    setRoleFilter("");
  };

  const displayUsers = getSortedUsers(getFilteredUsers());

  return (
    <Box sx={{ width: { xs: "100%", md: "95%" } }} p={2}>
      <Grid container spacing={2} mb={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            label="Search Name"
            variant="outlined"
            size="small"
            fullWidth
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            slotProps={{
              input: {
                endAdornment: searchName && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchName("")}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            label="Search Email"
            variant="outlined"
            size="small"
            fullWidth
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            slotProps={{
              input: {
                endAdornment: searchEmail && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchEmail("")}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            label="Search Constituency"
            variant="outlined"
            size="small"
            fullWidth
            value={searchConstituency}
            onChange={(e) => setSearchConstituency(e.target.value)}
            slotProps={{
              input: {
                endAdornment: searchConstituency && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchConstituency("")}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              endAdornment={statusFilter && (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={() => setStatusFilter("")} 
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => setRoleFilter(e.target.value)}
              endAdornment={roleFilter && (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={() => setRoleFilter("")} 
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )}
            >
              <MenuItem value="">All</MenuItem>
              {getUniqueRoles().map(role => (
                <MenuItem key={role} value={role}>{role}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={clearAllFilters}
        >
        
          Clear All Filters
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#a9e7e5" }}>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell 
                  key={headCell.id} 
                  sx={{ 
                    fontSize: "1rem", 
                    fontWeight: 600,
                    cursor: headCell.sortable ? "pointer" : "default"
                  }} 
                  align="center"
                  onClick={() => headCell.sortable && handleSort(headCell.id)}
                >
                  {headCell.label}
                  {headCell.sortable && orderBy === headCell.id && (
                    <span style={{ marginLeft: '4px' }}>
                      {order === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {displayUsers.map((user, index) => (
              <TableRow 
                key={user?.id} 
                sx={{ 
                  backgroundColor: index % 2 === 0 ? "#e0f7f9" : "#d0ebeaff", 
                  py: 2 
                }}
              >
                <TableCell sx={{ py: 2 }}>{user?.name}</TableCell>
                <TableCell sx={{ py: 2 }}>{user?.email}</TableCell>
                <TableCell sx={{ py: 2 }}>{user?.phoneNumber || "No phone number given"}</TableCell>
                <TableCell sx={{ py: 2 }}>{user?.constituency}</TableCell>
                <TableCell sx={{ py: 2 }}>{user?.role}</TableCell>
                <TableCell sx={{ py: 2, textTransform: "capitalize" }}>
                  {getStatusText(user.accept)}
                </TableCell>
                <TableCell sx={{ py: 2 }} align="center">
                  {user.accept === "Declined" && (
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleActivateUser(user.email, user.id)}
                      disabled={loading[user.id]}
                      startIcon={loading[user.id] ? <CircularProgress size={16} /> : null}
                    >
                      Activate
                    </Button>
                  )}
                  {user.accept === "Accepted" && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDeactivateUser(user.email, user.id)}
                      disabled={loading[user.id]}
                      startIcon={loading[user.id] ? <CircularProgress size={16} /> : null}
                    >
                      Deactivate
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {displayUsers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}