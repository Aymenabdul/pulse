import { useState } from "react";
import {
    Box,
    Button,
    FormControl,
    TextField,
} from "@mui/material";
import { Search, Clear } from "@mui/icons-material";
import UserTable from "../../components/UserTable";

const sampleUsers = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "1234567890",
    constituency: "Greenfield",
    role: "surveyor",
    status: "pending"
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    phone: "2345678901",
    constituency: "Hilltop",
    role: "admin",
    status: "approved"
  },
  {
    id: 3,
    name: "Charlie Brown",
    email: "charlie@example.com",
    phone: "3456789012",
    constituency: "Riverside",
    role: "surveyor",
    status: "declined"
  }
];

export default function Users() {
    const [searchQuery, setSearchQuery] = useState({
        name: "",
        email: "",
        
    })

    const handleSearchChange = (field) => (e) => {
        setSearchQuery({
            ...searchQuery,
            [field]: e.target.value
        });
    };

    return (
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, height: "100%", alignItems: "center", justifyContent: "center" }}>
            {/* <Box
                sx={{
                    width: { xs: "100%", sm: "90%" },
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.2)', 
                    backdropFilter: 'blur(10px)',
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 2
                }}            
            >
                <FormControl sx={{ width: { xs: "100%", md: "42%" } }}>
                    <TextField
                        label="Search by Name"
                        variant="outlined"
                        size="small"
                        value={searchQuery.name}
                        onChange={handleSearchChange("name")}
                    />
                </FormControl>
                <FormControl sx={{ width: { xs: "100%", md: "42%" } }}>
                    <TextField
                        label="Search by Email"
                        variant="outlined"
                        size="small"
                        value={searchQuery.email}
                        onChange={handleSearchChange("email")}
                    />
                </FormControl>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Search />}
                        sx={{
                            textTransform: 'none',
                            px: 4,
                            py: 1,
                            borderColor: '#03a9f4',
                            color: '#03a9f4',
                            '&:hover': {
                                backgroundColor: 'rgba(3, 169, 244, 0.04)',
                                borderColor: '#0288d1',
                                color: '#0288d1'
                            }
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Clear />}
                        size="small"
                        // onClick={handleClearFilters}
                        sx={{
                            textTransform: 'none',
                            px: 4,
                            borderColor: '#ef4444',
                            color: '#ef4444',
                            '&:hover': {
                                bgcolor: 'rgba(239, 68, 68, 0.04)',
                                borderColor: '#dc2626',
                                color: '#dc2626'
                            }
                        }}
                    >
                        Clear
                    </Button>
                </Box>
            </Box> */}
            <UserTable users={sampleUsers}/>
        </Box>
    )
}