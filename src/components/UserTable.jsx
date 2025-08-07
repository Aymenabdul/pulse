import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
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
  InputLabel,
  TablePagination,
  Menu
} from "@mui/material";
import { FilterList } from "@mui/icons-material";
import { useState, useEffect, useMemo } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import axiosInstance from "../axios/axios";

const headCells = [
  { id: "name", label: "User", sortable: true },
  { id: "email", label: "Email", sortable: true },
  { id: "phone", label: "Phone", sortable: false },
  { id: "constituency", label: "Constituency", sortable: true },
  { id: "role", label: "Role", sortable: false, filterable: true },
  { id: "status", label: "Status", sortable: false, filterable: true },
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
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [roleMenuAnchor, setRoleMenuAnchor] = useState(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);

  useEffect(() => {
    setUserData(users);
  }, [users]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleRoleFilterClick = (e) => {
    setRoleMenuAnchor(e.currentTarget);
  };

  const handleStatusFilterClick = (e) => {
    setStatusMenuAnchor(e.currentTarget);
  };

  const handleRoleFilterClose = () => {
    setRoleMenuAnchor(null);
  };

  const handleStatusFilterClose = () => {
    setStatusMenuAnchor(null);
  };

  const handleRoleFilterChange = (role) => {
    setRoleFilter(role);
    setPage(0); 
    handleRoleFilterClose();
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setPage(0); 
    handleStatusFilterClose();
  };

  const filteredUsers = useMemo(() => {
    return userData.filter(user => {
      const nameMatch = user.name?.toLowerCase().includes(searchName.toLowerCase()) || searchName === "";
      const emailMatch = user.email?.toLowerCase().includes(searchEmail.toLowerCase()) || searchEmail === "";
      const constituencyMatch = user.constituency?.toLowerCase().includes(searchConstituency.toLowerCase()) || searchConstituency === "";
      
      const statusMatch = statusFilter === "" || 
        (statusFilter === "active" && user.accept === "Accepted") ||
        (statusFilter === "inactive" && user.accept === "Declined");
      
      const roleMatch = roleFilter === "" || user.role?.toLowerCase() === roleFilter.toLowerCase();
      
      return nameMatch && emailMatch && constituencyMatch && statusMatch && roleMatch;
    });
  }, [userData, searchName, searchEmail, searchConstituency, statusFilter, roleFilter]);

  const sortedUsers = useMemo(() => {
    const users = [...filteredUsers];
    
    if (orderBy && headCells.find(cell => cell.id === orderBy)?.sortable) {
      users.sort((a, b) => {
        let aValue = a[orderBy];
        let bValue = b[orderBy];
        
        if (aValue == null) aValue = "";
        if (bValue == null) bValue = "";
        
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
        
        if (order === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }
    
    return users;
  }, [filteredUsers, order, orderBy]);

  const paginatedUsers = useMemo(() => {
    return sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedUsers, page, rowsPerPage]);

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
    setPage(0);
  };

  return (
    <Box sx={{ width: { xs: "100%", md: "95%" } }} p={2}>
      <Grid container spacing={2} mb={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                    fontWeight: 600
                  }} 
                  align="center"
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : "asc"}
                        onClick={() => handleSort(headCell.id)}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                    {headCell.id === "role" && (
                      <IconButton size="small" onClick={handleRoleFilterClick}>
                        <FilterList fontSize="small" />
                      </IconButton>
                    )}
                    {headCell.id === "status" && (
                      <IconButton size="small" onClick={handleStatusFilterClick}>
                        <FilterList fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedUsers.map((user, index) => (
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
            {paginatedUsers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={sortedUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Role Filter Menu */}
      <Menu 
        anchorEl={roleMenuAnchor} 
        open={Boolean(roleMenuAnchor)} 
        onClose={handleRoleFilterClose}
      >
        <MenuItem onClick={() => handleRoleFilterChange("")}>All</MenuItem>
        <MenuItem onClick={() => handleRoleFilterChange("surveyor")}>Surveyor</MenuItem>
        <MenuItem onClick={() => handleRoleFilterChange("admin")}>Admin</MenuItem>
      </Menu>

      {/* Status Filter Menu */}
      <Menu 
        anchorEl={statusMenuAnchor} 
        open={Boolean(statusMenuAnchor)} 
        onClose={handleStatusFilterClose}
      >
        <MenuItem onClick={() => handleStatusFilterChange("")}>All</MenuItem>
        <MenuItem onClick={() => handleStatusFilterChange("active")}>Active</MenuItem>
        <MenuItem onClick={() => handleStatusFilterChange("inactive")}>Inactive</MenuItem>
      </Menu>

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