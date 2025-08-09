import { useEffect, useState } from "react";
import {
    Box,
    Button,
    FormControl,
    TextField,
} from "@mui/material";
import { Search, Clear } from "@mui/icons-material";
import UserTable from "../../components/UserTable";
import axiosInstance from "../../axios/axios";

export default function Users() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        handleFetchUsers();
    }, [])

    const handleFetchUsers = async () => {
        try {
            const response = await axiosInstance.get("/all");
            if (Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                console.error("Expected an array of users, but received:", response.data);
                setUsers([]); 
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsers([]); 
        }
    };

    return (
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, height: "100%", alignItems: "center", justifyContent: "center" }}>
            <UserTable users={users}/>
        </Box>
    )
}