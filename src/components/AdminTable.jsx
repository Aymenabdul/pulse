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
  Typography,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  TablePagination,
  Menu
} from "@mui/material";
import { FilterList, Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";
import { useState, useEffect, useMemo } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import axiosInstance from "../axios/axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const headCells = [
  { id: "S.no", label: "S.no", sortable: true },
  { id: "name", label: "User", sortable: true },
  { id: "email", label: "Email", sortable: true },
  { id: "phone", label: "Phone", sortable: false },
  { id: "CreatedAt", label: "CreatedAt", sortable: true },
  { id: "constituency", label: "Constituency", sortable: true },
  { id: "role", label: "Role", sortable: false, filterable: true },
  { id: "status", label: "Status", sortable: false, filterable: true },
  { id: "actions", label: "Actions", sortable: false }
];

export default function AdminTable({ users }) {
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

  const [isEditing, setIsEditing] = useState({});
  // newConstituency state now stores an array for each user
  const [newConstituency, setNewConstituency] = useState({});

  const [constituencies, setConstituencies] = useState([]);

  const ConstituencyCell = ({ constituency, onEdit }) => {
  const userConstituencies = useMemo(() => (
    constituency ? constituency.split(', ') : []
  ), [constituency]);

  const displayLimit = 1;

  if (userConstituencies.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip label="Not Assigned" size="small" />
        <Tooltip title="Edit Constituency">
          <IconButton size="small" onClick={onEdit}>
            <EditIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  const tooltipTitle = (
    <div>
      {userConstituencies.map((c, i) => (
        <Typography key={i} variant="body2">{c}</Typography>
      ))}
    </div>
  );

  return (
    <Tooltip title={tooltipTitle} placement="top-start">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {userConstituencies.slice(0, displayLimit).map((c, i) => (
          <Chip key={i} label={c} color="primary" variant="outlined" size="small" />
        ))}
        {userConstituencies.length > displayLimit && (
          <Chip label={`+${userConstituencies.length - displayLimit}`} size="small" />
        )}
        <IconButton size="small" onClick={onEdit}>
          <EditIcon fontSize="inherit" />
        </IconButton>
      </Box>
    </Tooltip>
  );
};

  useEffect(() => {
    axiosInstance.get(`${BASE_URL}/file/constituencies`)
      .then((response) => {
        setConstituencies(response.data);
      })
      .catch((error) => {
        console.error('Error fetching constituencies:', error);
      });
  }, []);

  useEffect(() => {
    setUserData(users);
  }, [users]);

  const handleEditClick = (userId, currentConstituency) => {
    setIsEditing(prev => ({ ...prev, [userId]: true }));
    // Split the current constituency string into an array for the multi-select
    const currentConstituencyArray = currentConstituency ? currentConstituency.split(', ') : [];
    setNewConstituency(prev => ({ ...prev, [userId]: currentConstituencyArray }));
  };

  const handleChange = (event, userId) => {
    const {
      target: { value },
    } = event;
    // value can be a string or an array of strings. Handle both cases.
    setNewConstituency(prev => ({
      ...prev,
      [userId]: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleSave = async (email, userId) => {
    setLoading(prev => ({ ...prev, [userId]: true }));

    try {
      // Join the array of constituencies into a comma-separated string
      const constituenciesString = newConstituency[userId]?.join(', ');

      const response = await axiosInstance.put(
        `/updateConstituency?email=${email}&constituencies=${constituenciesString}`
      );
      
      const message = response.data?.message || "Constituency updated successfully";
      showSnackbar(message, "success");
      
      setUserData(prevData =>
        prevData.map(user =>
          user.id === userId ? { ...user, constituency: constituenciesString } : user
        )
      );

      setIsEditing(prev => ({ ...prev, [userId]: false }));
      
    } catch (error) {
      console.error("Error updating constituency:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Error updating constituency";
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleCancel = (userId) => {
    setIsEditing(prev => ({ ...prev, [userId]: false }));
    setNewConstituency(prev => ({ ...prev, [userId]: null }));
  };

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

  const refreshUserData = async () => {
    try {
      const response = await axiosInstance.get('/alladmin'); 
      setUserData(response.data);
    } catch (error) {
      console.error("Error refreshing user data:", error);
      showSnackbar("Error refreshing user data", "error");
    }
  };

  return (
     <Box sx={{ width: '100%', overflowX: 'auto' }} p={2}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3,textAlign:'center',textTransform:'uppercase' }}>
        Admin Details
      </Typography>
      
      <Grid container spacing={2} mb={2}>
        {/* Search fields remain the same */}
        <Grid size={{xs:12, sm:6, md:4}}>
          <TextField
            label="Search Name"
            variant="outlined"
            size="small"
            fullWidth
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            InputProps={{
              endAdornment: searchName && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchName("")} edge="end">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid size={{xs:12, sm:6, md:4}}>
          <TextField
            label="Search Email"
            variant="outlined"
            size="small"
            fullWidth
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            InputProps={{
              endAdornment: searchEmail && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchEmail("")} edge="end">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid size={{xs:12, sm:6, md:4}}>
          <TextField
            label="Search Constituency"
            variant="outlined"
            size="small"
            fullWidth
            value={searchConstituency}
            onChange={(e) => setSearchConstituency(e.target.value)}
            InputProps={{
              endAdornment: searchConstituency && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchConstituency("")} edge="end">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="outlined" size="small" onClick={clearAllFilters}>
          Clear All Filters
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="medium">
          <TableHead sx={{ bgcolor: "#a9e7e5" }}>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.align}
                  sx={{ fontWeight: 'bold' }}
                >
                  <Box display="flex" alignItems="center" justifyContent={headCell.align === 'center' ? 'center' : 'flex-start'}>
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
                    {(headCell.id === "role" || headCell.id === "status") && (
                      <IconButton size="small" onClick={headCell.id === 'role' ? handleRoleFilterClick : handleStatusFilterClick}>
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
                hover
                sx={{ backgroundColor: index % 2 === 0 ? "#d0ebeaff" : "#e0f7f9" }}
              >
                <TableCell align="center">{page * rowsPerPage + index + 1}</TableCell>
                <TableCell align="left">{user?.name}</TableCell>
                <TableCell align="left">{user?.email}</TableCell>
                <TableCell align="left">{user?.phoneNumber || "N/A"}</TableCell>
                <TableCell align="left">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</TableCell>
                <TableCell align="left" sx={{ minWidth: 250 }}> {/* Give constituency column enough space */}
                  {isEditing[user.id] ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControl variant="outlined" size="small" fullWidth>
                        <InputLabel>Constituency</InputLabel>
                        <Select
                          multiple
                          value={newConstituency[user.id] || []}
                          onChange={(e) => handleConstituencyChange(e, user.id)}
                          label="Constituency"
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => <Chip key={value} label={value} size="small"/>)}
                            </Box>
                          )}
                        >
                          {constituencies.map((c, i) => <MenuItem key={i} value={c}>{c}</MenuItem>)}
                        </Select>
                      </FormControl>
                      <Tooltip title="Save">
                        <IconButton color="primary" onClick={() => handleSave(user.email, user.id)} disabled={loading[user.id]}>
                          {loading[user.id] ? <CircularProgress size={24} /> : <SaveIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel">
                        <IconButton onClick={() => handleCancel(user.id)} disabled={loading[user.id]}>
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : (
                    <ConstituencyCell
                      constituency={user.constituency}
                      onEdit={() => handleEditClick(user.id, user.constituency)}
                    />
                  )}
                </TableCell>
                <TableCell align="center">{user?.role}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={getStatusText(user.accept)}
                    color={user.accept === "Accepted" ? "success" : "error"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    {loading[user.id] ? <CircularProgress size={24} /> : (
                      <>
                        {user.accept === "Accepted" ? (
                          <Button variant="outlined" color="error" size="small" onClick={() => handleDeactivateUser(user.email, user.id)}>
                            Deactivate
                          </Button>
                        ) : (
                          <Button variant="contained" color="success" size="small" onClick={() => handleActivateUser(user.email, user.id)}>
                            Activate
                          </Button>
                        )}
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {paginatedUsers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={headCells.length} align="center">
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
      
      {/* Menus and Snackbar remain the same */}
      <Menu anchorEl={roleMenuAnchor} open={Boolean(roleMenuAnchor)} onClose={handleRoleFilterClose}>
        <MenuItem onClick={() => handleRoleFilterChange("")}>All</MenuItem>
        <MenuItem onClick={() => handleRoleFilterChange("surveyor")}>Surveyor</MenuItem>
        <MenuItem onClick={() => handleRoleFilterChange("admin")}>Admin</MenuItem>
      </Menu>

      <Menu anchorEl={statusMenuAnchor} open={Boolean(statusMenuAnchor)} onClose={handleStatusFilterClose}>
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