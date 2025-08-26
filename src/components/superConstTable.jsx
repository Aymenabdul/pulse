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
    TextField, // Import TextField
} from "@mui/material";
import { FilterList } from "@mui/icons-material";
import { useMemo, useState, useEffect } from "react";
import axiosInstance from "../axios/axios";
import EditPopup from "../pages/superadmin/EditPopup";

const headCells = [
    { id: "S.No", label: "S.No", sortable: false, align: 'center' },
    { id: "Constituency", label: "Constituency", sortable: true, align: 'center' },
    { id: "CreatedAt", label: "CreatedAt", sortable: true, align: 'center' },
    { id: "Booth", label: "Booth", sortable: true, align: 'center' },
    { id: "Total Data", label: "Total Data", sortable: true, align: 'center' },
    { id: "status", label: "Status", sortable: false, align: 'center' },
    { id: "activity", label: "Activity", sortable: false, align: 'center' },
];

export default function SuperConstTable({ data, loading }) {
    const [orderBy, setOrderBy] = useState("Constituency");
    const [order, setOrder] = useState("asc");
    const [selected, setSelected] = useState(new Set());
    const [anchorEl, setAnchorEl] = useState(null);
    const [tableData, setTableData] = useState(data || []);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isEditPopupOpen, setEditPopupOpen] = useState(false);
    const [selectedSurvey, setSelectedSurvey] = useState(null);

    // --- 1. NEW STATE FOR FILTERS ---
    const [statusFilter, setStatusFilter] = useState("");
    const [constituencyFilter, setConstituencyFilter] = useState("");
    const [boothFilter, setBoothFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");


    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const getRowId = (row) => `${row.assemblyConstituency}-${row.formattedCreateAt}-${row.booth}`;

    useEffect(() => {
        setTableData(data || []);
        setSelected(new Set());
    }, [data]);

    // --- 3. UPDATED FILTERING LOGIC ---
    const filteredData = useMemo(() => {
        if (!Array.isArray(tableData)) return [];
        return tableData.filter((row) => {
            const statusMatch = !statusFilter || (row.active ? "active" : "inactive") === statusFilter;
            const constituencyMatch = row.assemblyConstituency?.toLowerCase().includes(constituencyFilter.toLowerCase());
            const boothMatch = row.booth?.toLowerCase().includes(boothFilter.toLowerCase());
            const dateMatch = row.formattedCreateAt?.toLowerCase().includes(dateFilter.toLowerCase());

            return statusMatch && constituencyMatch && boothMatch && dateMatch;
        }).sort((a, b) => {
            if (!headCells.find((h) => h.id === orderBy)?.sortable) return 0;
            const aVal = a[orderBy];
            const bVal = b[orderBy];
            return order === "asc" ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
        });
    }, [tableData, statusFilter, constituencyFilter, boothFilter, dateFilter, order, orderBy]); // Add new filters to dependency array

    const isSelected = (rowId) => selected.has(rowId);
    const handleSort = (property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = new Set();
            paginatedData.forEach(row => newSelected.add(getRowId(row)));
            setSelected(newSelected);
        } else {
            setSelected(new Set());
        }
    };

    const handleCheckboxClick = (event, rowId) => {
        event.stopPropagation();
        setSelected((prevSelected) => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(rowId)) {
                newSelected.delete(rowId);
            } else {
                newSelected.add(rowId);
            }
            return newSelected;
        });
    };

    const handleClearFilters = () => {
        setConstituencyFilter("");
        setBoothFilter("");
        setDateFilter("");
    };

    // ... All your other handlers (handleChangePage, showSnackbar, handleToggleActiveStatus, etc.) remain the same ...
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const showSnackbar = (message, severity = "success") => setSnackbar({ open: true, message, severity });
    const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));
    const handleToggleActiveStatus = async (rowData) => {
        const { assemblyConstituency, formattedCreateAt, booth, active } = rowData;
        const rowId = getRowId(rowData);
        showSnackbar(`Toggling status for ${booth}...`, "info");
        try {
            const params = new URLSearchParams({ assemblyConstituency, createAt: formattedCreateAt, booth });
            const response = await axiosInstance.put(`/file/toggleActive?${params.toString()}`);
            if (response.status === 200) {
                const updated = tableData.map((row) => getRowId(row) === rowId ? { ...row, active: !active } : row);
                setTableData(updated);
                showSnackbar(response.data.message || "Status toggled successfully!", "success");
            } else {
                showSnackbar("Failed to toggle status.", "error");
            }
        } catch (error) {
            showSnackbar(error.response?.data?.message || "An error occurred.", "error");
        }
    };
    const handleBulkActivateDeactivate = async () => {
        if (selected.size === 0) {
            return showSnackbar("No items selected", "warning");
        }
        const selectedItems = tableData.filter(row => selected.has(getRowId(row)));
        showSnackbar(`Processing ${selectedItems.length} item(s)...`, "info");

        const successfulOperations = [];
        const failedItems = [];

        for (const item of selectedItems) {
            try {
                const { assemblyConstituency, formattedCreateAt, booth } = item;

                // This check ensures we don't send requests with missing data
                if (!assemblyConstituency || !formattedCreateAt || !booth) {
                    throw new Error("Row has missing data.");
                }

                const params = new URLSearchParams({
                    assemblyConstituency,
                    createAt: formattedCreateAt,
                    booth
                });

                const response = await axiosInstance.put(`/file/toggleActive?${params.toString()}`);

                if (response.status === 200) {
                    successfulOperations.push({ rowId: getRowId(item), newStatus: !item.active });
                } else {
                    throw new Error(`Request failed with status ${response.status}`);
                }
            } catch (error) {
                // --- THIS IS THE CRUCIAL CHANGE ---
                // We will now display the specific error for the failed item in the snackbar.
                const errorMessage = error.response?.data?.message || error.message;
                showSnackbar(`Error on Booth "${item.booth}": ${errorMessage}`, "error");

                // We also log to the console as a best practice, even if you don't see it.
                console.error(`Failed to toggle item: ${getRowId(item)}`, errorMessage);

                failedItems.push(item);

                // We stop the process on the first error to avoid spamming alerts.
                break;
            }
        }

        // This part only runs if the loop wasn't broken by an error
        if (failedItems.length === 0) {
            if (successfulOperations.length > 0) {
                setTableData(prevData =>
                    prevData.map(row => {
                        const op = successfulOperations.find(o => o.rowId === getRowId(row));
                        return op ? { ...row, active: op.newStatus } : row;
                    })
                );
            }
            setSelected(new Set());
            showSnackbar(`Successfully processed ${successfulOperations.length} item(s).`, "success");
        }
    };
    const handleFilterClick = (e) => setAnchorEl(e.currentTarget);
    const handleFilterClose = () => setAnchorEl(null);
    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        setPage(0);
        setSelected(new Set());
        handleFilterClose();
    };
    const handleOpenEditPopup = (surveyData) => { setSelectedSurvey(surveyData); setEditPopupOpen(true); };
    const handleCloseEditPopup = () => { setEditPopupOpen(false); setSelectedSurvey(null); };
    const paginatedData = useMemo(() => filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [filteredData, page, rowsPerPage]);
    const getSelectedStatus = () => {
        if (selected.size === 0) return null;
        const selectedItems = tableData.filter(row => selected.has(getRowId(row)));
        const hasActive = selectedItems.some(item => item.active);
        const hasInactive = selectedItems.some(item => !item.active);
        if (hasActive && hasInactive) return 'mixed';
        return hasActive;
    };


    const isAnyFilterActive = constituencyFilter || boothFilter || dateFilter;

    return (
        <Box sx={{ width: { xs: "100%", md: "98%" }, p: 2 }}>
            <Typography variant="h6" sx={{ flex: '1 1 100%',textTransform: 'uppercase',fontWeight:'700' }}>Surveys</Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, width: '70%' }}>
                <Box sx={{ width: '70%' }}>
                    <TextField
                        label="Filter Constituency"
                        variant="outlined"
                        size="small"
                        value={constituencyFilter}
                        onChange={(e) => setConstituencyFilter(e.target.value)}
                        fullWidth
                    />
                </Box>
                <Box sx={{ width: '70%' }}>
                    <TextField
                        label="Filter Booth"
                        variant="outlined"
                        size="small"
                        value={boothFilter}
                        onChange={(e) => setBoothFilter(e.target.value)}
                        fullWidth
                    />
                </Box>
                <Box sx={{ width: '70%' }}>
                    <TextField
                        label="Filter Date"
                        variant="outlined"
                        size="small"
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        fullWidth
                        InputLabelProps={{
                            shrink: true, // Ensures the label stays above the input even when there’s a value
                        }}
                    />
                </Box>
                {isAnyFilterActive && (
                    <Button variant="outlined" size="small" onClick={handleClearFilters}>
                        Clear
                    </Button>
                )}
            </Box>
            <Toolbar sx={{ flexDirection: { xs: 'row', md: 'row' }, alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                {selected.size > 0 && (
                    <Button variant="contained" size="small" color="primary" onClick={handleBulkActivateDeactivate}>
                        {getSelectedStatus() === 'mixed' ? 'Toggle' : getSelectedStatus() ? 'Deactivate' : 'Activate'} ({selected.size})
                    </Button>
                )}
            </Toolbar>

            <TableContainer>
                <Table size="small">
                    <TableHead sx={{ bgcolor: "#a9e7e5" }}>
                        <TableRow>
                            <TableCell padding="checkbox" align="center">
                                <Checkbox
                                    indeterminate={selected.size > 0 && selected.size < paginatedData.length}
                                    checked={paginatedData.length > 0 && selected.size === paginatedData.length}
                                    onChange={handleSelectAllClick}
                                />
                            </TableCell>
                            {headCells.map((headCell) => (
                                <TableCell key={headCell.id} sx={{ fontSize: "1rem", fontWeight: 600 }} align="center">
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {headCell.sortable ? (
                                            <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : "asc"} onClick={() => handleSort(headCell.id)}>
                                                {headCell.label}
                                            </TableSortLabel>
                                        ) : (headCell.label)}
                                        {headCell.id === "status" && (<IconButton size="small" onClick={handleFilterClick}><FilterList fontSize="small" /></IconButton>)}
                                    </Box>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={headCells.length + 1} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                        ) : (
                            paginatedData.map((row, index) => {
                                const rowId = getRowId(row);
                                const isItemSelected = isSelected(rowId);
                                return (
                                    <TableRow key={rowId} hover role="checkbox" tabIndex={-1} selected={isItemSelected} sx={{ backgroundColor: index % 2 === 0 ? "#e0f7f9" : "#d0ebeaff" }}>
                                        <TableCell padding="checkbox" align="center">
                                            <Checkbox checked={isItemSelected} onClick={(event) => handleCheckboxClick(event, rowId)} />
                                        </TableCell>
                                        <TableCell align="center">{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell align="center">{row?.assemblyConstituency}</TableCell>
                                        <TableCell align="center">{row?.formattedCreateAt}</TableCell>
                                        <TableCell align="center">{row?.booth}</TableCell>
                                        <TableCell align="center">{row?.dataCount}</TableCell>
                                        <TableCell align="center" sx={{ textTransform: "capitalize" }}>{row?.active ? "Active" : "Inactive"}</TableCell>
                                        <TableCell align="center">
                                            <Button variant="contained" size="small" color={row.active ? "error" : "success"} onClick={(e) => { e.stopPropagation(); handleToggleActiveStatus(row); }}>
                                                {row.active ? "Deactivate" : "Activate"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                        {paginatedData.length === 0 && !loading && (
                            <TableRow><TableCell colSpan={headCells.length + 1} align="center">No data found.</TableCell></TableRow>
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

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>

            <EditPopup
                open={isEditPopupOpen}
                onClose={handleCloseEditPopup}
                surveyData={selectedSurvey}
                onSubmit={async (originalSurveyName, updatedData) => { /* Edit logic may need refactoring */ }}
            />
        </Box>
    );
}