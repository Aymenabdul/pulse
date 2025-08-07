import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
  TablePagination,
} from "@mui/material";
import { FilterList, Delete } from "@mui/icons-material";
import { useMemo, useState, useEffect } from "react";
import axiosInstance from "../axios/axios";

const headCells = [
  { id: "surveyName", label: "Survey Name", sortable: true },
  { id: "createdAt", label: "Created At", sortable: true },
  { id: "status", label: "Status", sortable: false },
  { id: "activity", label: "Activity", sortable: false },
  { id: "actions", label: "Actions", sortable: false },
];

export default function SurveyTable({ data, loading }) {
  const [orderBy, setOrderBy] = useState("surveyName");
  const [order, setOrder] = useState("asc");
  const [selected, setSelected] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [tableData, setTableData] = useState(data);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = paginatedData.map((row) => row.id);
      setSelected(newSelecteds);
    } else {
      setSelected([]);
    }
  };

  const handleCheckboxClick = (event, id) => {
    event.stopPropagation();

    setSelected((prevSelected) => {
      const selectedIndex = prevSelected.indexOf(id);
      
      if (selectedIndex === -1) {
        // Add to selection
        return [...prevSelected, id];
      } else {
        // Remove from selection
        return prevSelected.filter((selectedId) => selectedId !== id);
      }
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleActivateSurvey = async (surveyName) => {
    try {
      const response = await axiosInstance.put(`/file/activate-survey?surveyName=${surveyName}`);
      if (response.status === 200) {
        const updated = tableData.map((s) =>
          s.surveyName === surveyName ? { ...s, isActive: true } : s
        );
        setTableData(updated);
        showSnackbar(response.data.message || "Survey activated successfully", "success");
      } else {
        showSnackbar("Failed to activate survey", "error");
      }
    } catch (error) {
      console.error("Error activating survey:", error);
      showSnackbar(error.response?.data?.message || "Error activating survey", "error");
    }
  };

  const handleDeactivateSurvey = async (surveyName) => {
    try {
      const response = await axiosInstance.put(`/file/deactivate-survey?surveyName=${surveyName}`);
      if (response.status === 200) {
        const updated = tableData.map((s) =>
          s.surveyName === surveyName ? { ...s, isActive: false } : s
        );
        setTableData(updated);
        showSnackbar(response.data.message || "Survey deactivated successfully", "success");
      } else {
        showSnackbar("Failed to deactivate survey", "error");
      }
    } catch (error) {
      console.error("Error deactivating survey:", error);
      showSnackbar(error.response?.data?.message || "Error deactivating survey", "error");
    }
  };

  const handleFilterClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setPage(0); // Reset to first page when filter changes
    handleFilterClose();
  };

  const handleDelete = (surveyName) => {
    const surveyToDelete = tableData.find((s) => s.surveyName === surveyName);
    
    if (surveyToDelete) {
      // Remove from table data
      const updated = tableData.filter((s) => s.surveyName !== surveyName);
      setTableData(updated);
      
      // Remove from selected if it was selected
      setSelected(prevSelected => prevSelected.filter((id) => id !== surveyToDelete.id));
      
      console.log("Survey deleted locally:", surveyName);
    }
  };

  const handleBulkDelete = () => {
    selected.forEach((id) => {
      const surveyToDelete = tableData.find((row) => row.id === id);
      if (surveyToDelete) {
        handleDelete(surveyToDelete.surveyName);
      }
    });
    // Clear selection after bulk delete
    setSelected([]);
  };

  const filteredData = useMemo(() => {
    return tableData
      .filter((row) => {
        if (!statusFilter) return true;
        const status = row.isActive ? "active" : "inactive";
        return status === statusFilter;
      })
      .sort((a, b) => {
        if (!headCells.find((h) => h.id === orderBy)?.sortable) return 0;
        const aVal = a[orderBy];
        const bVal = b[orderBy];
        return order === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
  }, [tableData, statusFilter, order, orderBy]);

  const paginatedData = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  return (
    <Box sx={{ width: { xs: "100%", md: "98%" }, p: 2 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Surveys
        </Typography>
        {selected.length > 0 && (
          <IconButton
            color="error"
            onClick={handleBulkDelete}
          >
            <Delete />
          </IconButton>
        )}
      </Toolbar>

      <TableContainer>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#a9e7e5" }}>
            <TableRow>
              <TableCell padding="checkbox" align="center">
                <Checkbox
                  indeterminate={
                    selected.length > 0 && selected.length < paginatedData.length
                  }
                  checked={
                    paginatedData.length > 0 &&
                    selected.length === paginatedData.length
                  }
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sx={{ fontSize: "1rem", fontWeight: 600 }}
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
                    {headCell.id === "status" && (
                      <IconButton size="small" onClick={handleFilterClick}>
                        <FilterList fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => {
                const isItemSelected = isSelected(row.id);
                return (
                  <TableRow
                    key={row.id}
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    selected={isItemSelected}
                    sx={{ backgroundColor: index % 2 === 0 ? "#e0f7f9" : "#d0ebeaff" }}
                  >
                    <TableCell padding="checkbox" align="center">
                      <Checkbox
                        checked={isItemSelected}
                        onClick={(event) => handleCheckboxClick(event, row.id)}
                      />
                    </TableCell>
                    <TableCell align="center">{row?.surveyName}</TableCell>
                    <TableCell align="center">{row?.createdAt}</TableCell>
                    <TableCell align="center" sx={{ textTransform: "capitalize" }}>
                      {row?.isActive ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        color={row.isActive ? "error" : "success"}
                        onClick={(e) => {
                          e.stopPropagation();
                          row.isActive
                            ? handleDeactivateSurvey(row.surveyName)
                            : handleActivateSurvey(row.surveyName);
                        }}
                      >
                        {row.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(row.surveyName);
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
            {paginatedData.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No surveys found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleFilterClose}>
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
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}