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
  Alert
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
  const [userData, setUserData] = useState(users); // Initialize userData with the users prop
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

  const handleAcceptUser = async (email, userId) => {
    // Optimistic update
    setUserData(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, accept: "Accepted" } : user
      )
    );
    setLoading(prev => ({ ...prev, [userId]: true }));

    try {
      const response = await axiosInstance.put(`/activate-user?email=${email}`);
      showSnackbar(response.data.message || "User accepted successfully", "success");
    } catch (e) {
      console.error("Error accepting user:", e);
      showSnackbar(e.response?.data?.message || "Error accepting user", "error");
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeclineUser = async (email, userId) => {
  // Optimistic UI update - immediately change the status in the front-end
  setUserData(prev =>
    prev.map(user =>
      user.id === userId ? { ...user, accept: "Declined" } : user
    )
  );

  // Set the user as loading to prevent multiple actions on the same user
  setLoading(prev => ({ ...prev, [userId]: true }));

  try {
    // Make the API request to decline the user
    const response = await axiosInstance.put(`/decline-user?email=${email}`);
    // Show success message
    showSnackbar(response.data?.message || "User declined successfully", "success");
  } catch (e) {
    // Revert the UI status in case of error
    setUserData(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, accept: "Pending" } : user // or whatever the original status is
      )
    );
    console.error("Error declining user:", e);
    showSnackbar(e.response?.data?.message || "Error declining user", "error");
  } finally {
    // Hide loading state once the operation is complete
    setLoading(prev => ({ ...prev, [userId]: false }));
  }
};


  return (
    <Box sx={{ width: { xs: "100%", md: "95%" } }} p={2}>
      <Grid container spacing={2} mb={2}>
        {/* Search filters */}
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
        <Button variant="outlined" size="small" onClick={() => { setSearchName(""); setSearchEmail(""); setSearchConstituency(""); }}>
          Clear All Filters
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#a9e7e5" }}>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell key={headCell.id} sx={{ fontSize: "1rem", fontWeight: 600 }} align="center">
                  {headCell.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {userData.map((user, index) => (
              <TableRow key={user?.id} sx={{ backgroundColor: index % 2 === 0 ? "#e0f7f9" : "#d0ebeaff", py: 2 }}>
                <TableCell sx={{ py: 2 }}>{user?.name}</TableCell>
                <TableCell sx={{ py: 2 }}>{user?.email}</TableCell>
                <TableCell sx={{ py: 2 }}>{user?.phoneNumber || "No phone number given"}</TableCell>
                <TableCell sx={{ py: 2 }}>{user?.constituency}</TableCell>
                <TableCell sx={{ py: 2 }}>{user?.role}</TableCell>
                <TableCell sx={{ py: 2, textTransform: "capitalize" }}>
                  {user.accept || "Pending"}
                </TableCell>
                <TableCell sx={{ py: 2 }} align="center">
                  {user.accept === "Pending" && (
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
                  {user.accept === "Declined" && (
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleAcceptUser(user.email, user.id)}
                      disabled={loading[user.id]}
                    >
                      Accept
                    </Button>
                  )}
                  {user.accept === "Accepted" && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDeclineUser(user.email, user.id)}
                      disabled={loading[user.id]}
                    >
                      Decline
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {userData?.length === 0 && (
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
