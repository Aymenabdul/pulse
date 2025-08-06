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
  Switch
} from "@mui/material";
import { FilterList, Delete } from "@mui/icons-material";
import { useMemo, useState } from "react";


const headCells = [
  { id: "name", label: "Survey Name", sortable: true },
  { id: "createdAt", label: "Created At", sortable: true },
  { id: "status", label: "Status", sortable: false },
  { id: "activity", label: "Activity", sortable: false },
  { id: "actions", label: "Actions", sortable: false }
];

export default function SurveyTable({ data, loading }) {
  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [selected, setSelected] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [tableData, setTableData] = useState(data);
  const isSelected = (id) => selected.indexOf(id) !== -1;


  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredData.map((row) => row.id); // Select all filtered data
      setSelected(newSelecteds);
      return;
    }
    setSelected([]); // Deselect all if unchecked
  };

  const handleClick = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id]; // Add to selected
    } else {
      newSelected = selected.filter((sid) => sid !== id); // Remove from selected
    }

    setSelected(newSelected);
  };

  const handleFilterClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    handleFilterClose();
  };

  const handleToggleStatus = (id) => {
    const updated = tableData.map((s) =>
      s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s
    );
    setTableData(updated);
  };

  const handleDelete = (id) => {
    const updated = tableData.filter((s) => s.id !== id);
    setTableData(updated);
    setSelected(selected.filter((sid) => sid !== id));
  };


  const filteredData = useMemo(() => {
    return tableData
      .filter((row) => !statusFilter || row.status === statusFilter)
      .sort((a, b) => {
        if (!headCells.find((h) => h.id === orderBy)?.sortable) return 0;
        const aVal = a[orderBy];
        const bVal = b[orderBy];
        return order === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
  }, [tableData, statusFilter, order, orderBy]);

  return (
    <Box sx={{ width: { xs: "100%", md: "98%" }, p: 2 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Surveys
        </Typography>
        {selected.length > 0 && (
          <IconButton color="error" onClick={() => selected.forEach(id => handleDelete(id))}>
            <Delete />
          </IconButton>
        )}
      </Toolbar>

      <TableContainer>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#a9e7e5" }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.length > 0 && selected.length < filteredData.length
                  }
                  checked={
                    filteredData.length > 0 && selected.length === filteredData.length
                  }
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              {headCells.map((headCell) => (
                <TableCell key={headCell.id} sx={{ fontSize: "1rem", fontWeight: 600 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
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
              filteredData.map((row, index) => {
                const isItemSelected = isSelected(row.id);
                return (
                  <TableRow
                    key={row.id}
                    selected={isItemSelected}
                    onClick={() => handleClick(row.id)}
                    sx={{ backgroundColor: index % 2 === 0 ? "#e0f7f9" : "#d0ebeaff" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={isItemSelected} />
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.createdAt}</TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>{row.status}</TableCell>
                    <TableCell>
                      <Switch
                        checked={row.status === "active"}
                        onChange={() => handleToggleStatus(row.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleDelete(row.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
            {filteredData.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No surveys found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleFilterClose}>
        <MenuItem onClick={() => handleStatusFilterChange("")}>All</MenuItem>
        <MenuItem onClick={() => handleStatusFilterChange("active")}>Active</MenuItem>
        <MenuItem onClick={() => handleStatusFilterChange("inactive")}>Inactive</MenuItem>
      </Menu>
    </Box>
  );
}
