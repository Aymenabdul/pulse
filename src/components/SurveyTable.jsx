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
  const [selected, setSelected] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [tableData, setTableData] = useState(data || []);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    setTableData(data || []);
    setSelected(new Set());
  }, [data]);

  const isSelected = (surveyName) => selected.has(surveyName);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = new Set();
      paginatedData.forEach(row => newSelected.add(row.surveyName));
      setSelected(newSelected);
    } else {
      setSelected(new Set());
    }
  };

  const handleCheckboxClick = (event, surveyName) => {
    event.stopPropagation();

    const clickedRow = tableData.find(row => row.surveyName === surveyName);
    if (!clickedRow) return;

    setSelected((prevSelected) => {
      const newSelected = new Set(prevSelected);
      const isCurrentlySelected = newSelected.has(surveyName);
      
      if (!isCurrentlySelected) {
        newSelected.add(surveyName);
      } else {
        newSelected.delete(surveyName);
      }
      
      return newSelected;
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

  const handleBulkActivateDeactivate = async () => {
    if (selected.size === 0) {
      showSnackbar("No surveys selected", "warning");
      return;
    }

    const selectedSurveys = tableData.filter(row => selected.has(row.surveyName));
    
    if (selectedSurveys.length === 0) {
      showSnackbar("Selected surveys not found", "error");
      return;
    }

    const operationPromises = selectedSurveys.map(async (survey) => {
      try {
        const shouldActivate = !survey.isActive;
        const endpoint = shouldActivate 
          ? `/file/activate-survey?surveyName=${survey.surveyName}`
          : `/file/deactivate-survey?surveyName=${survey.surveyName}`;
        
        const response = await axiosInstance.put(endpoint);
        
        if (response.status === 200) {
          return {
            success: true,
            surveyName: survey.surveyName,
            action: shouldActivate ? 'activate' : 'deactivate',
            newStatus: shouldActivate
          };
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        return {
          success: false,
          surveyName: survey.surveyName,
          error: error.message
        };
      }
    });

    showSnackbar(`Processing ${selectedSurveys.length} survey(s)...`, "info");

    try {
      const results = await Promise.allSettled(operationPromises);
      
      const successfulOperations = [];
      const failedOperations = [];
      
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            successfulOperations.push(result.value);
          } else {
            failedOperations.push(result.value);
          }
        } else {
          failedOperations.push({
            success: false,
            error: result.reason?.message || 'Unknown error'
          });
        }
      });

      if (successfulOperations.length > 0) {
        setTableData(prevData => 
          prevData.map(survey => {
            const successfulOp = successfulOperations.find(op => op.surveyName === survey.surveyName);
            if (successfulOp) {
              return { ...survey, isActive: successfulOp.newStatus };
            }
            return survey;
          })
        );
      }

      setSelected(new Set());

      const successCount = successfulOperations.length;
      const failureCount = failedOperations.length;
      
      if (failureCount === 0) {
        showSnackbar(
          `Successfully processed ${successCount} survey(s)`, 
          "success"
        );
      } else if (successCount === 0) {
        showSnackbar(
          `Failed to process all surveys`, 
          "error"
        );
      } else {
        showSnackbar(
          `${successCount} survey(s) processed successfully, ${failureCount} failed`, 
          "warning"
        );
      }

    } catch (error) {
      console.error('Bulk operation error:', error);
      showSnackbar('An unexpected error occurred', "error");
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
    setPage(0); 
    setSelected(new Set());
    handleFilterClose();
  };

  const handleDelete = (surveyName) => {
    const updated = tableData.filter((s) => s.surveyName !== surveyName);
    setTableData(updated);
    
    setSelected(prevSelected => {
      const newSelected = new Set(prevSelected);
      newSelected.delete(surveyName);
      return newSelected;
    });
    
    showSnackbar("Survey deleted successfully", "success");
    console.log("Survey deleted locally:", surveyName);
  };

  const handleBulkDelete = () => {
    const selectedSurveyNames = Array.from(selected);
    selectedSurveyNames.forEach((surveyName) => {
      handleDelete(surveyName);
    });
    setSelected(new Set());
    showSnackbar(`${selectedSurveyNames.length} survey(s) deleted`, "success");
  };

  const filteredData = useMemo(() => {
    if (!Array.isArray(tableData)) return [];
    
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

  const getSelectedStatus = () => {
    if (selected.size === 0) return null;
    
    const selectedSurveys = tableData.filter(row => selected.has(row.surveyName));
    const hasActive = selectedSurveys.some(survey => survey.isActive);
    const hasInactive = selectedSurveys.some(survey => !survey.isActive);
    
    if (hasActive && hasInactive) {
      return 'mixed';
    } else if (hasActive) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <Box sx={{ width: { xs: "100%", md: "98%" }, p: 2 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Surveys
        </Typography>
        {selected.size > 0 && (
          <>
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={handleBulkActivateDeactivate}
              sx={{ mr: 1 }}
            >
              {getSelectedStatus() === 'mixed' ? 'Toggle Status' : getSelectedStatus() ? 'Deactivate All' : 'Activate All'} ({selected.size})
            </Button>
            <IconButton
              color="error"
              onClick={handleBulkDelete}
            >
              <Delete />
            </IconButton>
          </>
        )}
      </Toolbar>

      <TableContainer>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#a9e7e5" }}>
            <TableRow>
              <TableCell padding="checkbox" align="center">
                <Checkbox
                  indeterminate={
                    selected.size > 0 && 
                    selected.size < paginatedData.length &&
                    paginatedData.some(row => selected.has(row.surveyName)) &&
                    !paginatedData.every(row => selected.has(row.surveyName))
                  }
                  checked={
                    paginatedData.length > 0 &&
                    paginatedData.every(row => selected.has(row.surveyName))
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
                const isItemSelected = isSelected(row.surveyName);
                return (
                  <TableRow
                    key={row.surveyName}
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    selected={isItemSelected}
                    sx={{ backgroundColor: index % 2 === 0 ? "#e0f7f9" : "#d0ebeaff" }}
                  >
                    <TableCell padding="checkbox" align="center">
                      <Checkbox
                        checked={isItemSelected}
                        onClick={(event) => handleCheckboxClick(event, row.surveyName)}
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