import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TableFooter,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  Grid,
  Typography,
  Menu,
  Button,
  Paper,
  Snackbar,
  Switch,
  FormControlLabel,
  Alert
} from "@mui/material";
import { useState, useMemo } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
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
  const [searchConstituency, setSearchConstituency] = useState("");
  const [userData, setUserData] = useState(users);
  const [anchorElStatus, setAnchorElStatus] = useState(null);
  const [anchorElRole, setAnchorElRole] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState({});

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleStatusChange = (id, newStatus) => {
    setUserData((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, status: newStatus } : user
      )
    );
  };

  const handleOpenStatusMenu = (e) => setAnchorElStatus(e.currentTarget);
  const handleOpenRoleMenu = (e) => setAnchorElRole(e.currentTarget);
  const handleCloseStatusMenu = () => setAnchorElStatus(null);
  const handleCloseRoleMenu = () => setAnchorElRole(null);

  const handleClearAll = () => {
    setSearchName("");
    setSearchEmail("");
    setSearchConstituency("");
    setStatusFilter("");
    setRoleFilter("");
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAcceptUser = async (email, userId) => {
    setLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await axiosInstance.put(`/activate-user?email=${email}`);
      
      setUserData(prev =>
        prev.map(user => 
          user.id === userId ? { ...user, accept: true } : user
        )
      );
      
      showSnackbar(response.data.message || "User accepted successfully", "success");
    } catch (e) {
      console.error("Error accepting user:", e);
      showSnackbar(e.response?.data?.message || "Error accepting user", "error");
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeclineUser = async (email, userId) => {
    setLoading(prev => ({ ...prev, [userId]: true }));
    console.log(email);
    try {
      const response = await axiosInstance.put(`/decline-user?email=${email}`);
      
      setUserData(prev =>
        prev.map(user => 
          user.id === userId ? { ...user, accept: false, declined: true } : user
        )
      );
      
      showSnackbar(response.data?.message || "User declined successfully", "success");
    } catch (e) {
      console.error("Error declining user:", e.response?.data);
      showSnackbar(e.response?.data?.message || "Error declining user", "error");
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const getUserStatus = (user) => {
    if (user.declined) return "Declined";
    return user.accept ? "Accepted" : "Pending";
  };

  return (
    <Box sx={{ width: { xs: "100%", md: "95%" } }} p={2}>
      <Grid container spacing={2} mb={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
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
        <Grid size={{ xs: 12, sm: 4 }}>
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
        <Grid size={{ xs: 12, sm: 4 }}>
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
        <Button variant="outlined" size="small" onClick={handleClearAll}>
          Clear All Filters
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#a9e7e5" }}>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell key={headCell.id} sx={{ fontSize: "1rem", fontWeight: 600 }} align="center">
                  <Box display="flex" alignItems="center">
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
                    {headCell.id === "status" && (
                      <>
                        <IconButton size="small" onClick={handleOpenStatusMenu}>
                          <FilterListIcon fontSize="small" />
                        </IconButton>
                        <Menu
                          anchorEl={anchorElStatus}
                          open={Boolean(anchorElStatus)}
                          onClose={handleCloseStatusMenu}
                        >
                          <MenuItem onClick={() => { setStatusFilter(""); handleCloseStatusMenu(); }}>All</MenuItem>
                          <MenuItem onClick={() => { setStatusFilter("pending"); handleCloseStatusMenu(); }}>Pending</MenuItem>
                          <MenuItem onClick={() => { setStatusFilter("accepted"); handleCloseStatusMenu(); }}>Accepted</MenuItem>
                          <MenuItem onClick={() => { setStatusFilter("declined"); handleCloseStatusMenu(); }}>Declined</MenuItem>
                        </Menu>
                      </>
                    )}
                    {headCell.id === "role" && (
                      <>
                        <IconButton size="small" onClick={handleOpenRoleMenu}>
                          <FilterListIcon fontSize="small" />
                        </IconButton>
                        <Menu
                          anchorEl={anchorElRole}
                          open={Boolean(anchorElRole)}
                          onClose={handleCloseRoleMenu}
                        >
                          <MenuItem onClick={() => { setRoleFilter(""); handleCloseRoleMenu(); }}>All</MenuItem>
                          <MenuItem onClick={() => { setRoleFilter("admin"); handleCloseRoleMenu(); }}>Admin</MenuItem>
                          <MenuItem onClick={() => { setRoleFilter("surveyor"); handleCloseRoleMenu(); }}>ESA User</MenuItem>
                        </Menu>
                      </>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user, index) => (
              <TableRow key={user?.id} sx={{ backgroundColor: index % 2 === 0 ? "#e0f7f9" : "#d0ebeaff", py: 2 }}>
                <TableCell sx={{ py: 2 }}>{user?.name}</TableCell>
                <TableCell sx={{ py: 2 }}>{user?.email}</TableCell>
                <TableCell sx={{ py: 2 }}>{user?.phoneNumber ? user?.phoneNumber : "No phone number given"}</TableCell>
                <TableCell sx={{ py: 2 }}>{user?.constituency}</TableCell>
                <TableCell sx={{ py: 2 }}>{user?.role}</TableCell>
                <TableCell sx={{ py: 2, textTransform: "capitalize" }}>{getUserStatus(user)}</TableCell>
                <TableCell sx={{ py: 2 }} align="center">
                  {user?.accept === true || user?.declined ? (
                    <Typography variant="body2" color="text.secondary">
                      {user.accept ? "Accepted" : "Declined"}
                    </Typography>
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeclineUser(user.email, user.id)}
                        disabled={loading[user.id]}
                      >
                        Decline
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleAcceptUser(user.email, user.id)}
                        disabled={loading[user.id]}
                      >
                        Accept
                      </Button>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {users?.length === 0 && (
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
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}