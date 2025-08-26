import { useEffect, useState } from "react";
import {
    Box,
    Button,
    FormControl,
    TextField,
} from "@mui/material";
import { Search, Clear } from "@mui/icons-material";
import UserTable from "../../components/UserTable";
import AdminTable from "../../components/admintable";
import axiosInstance from "../../axios/axios";

export default function superUsers() {
    const [allUsers, setAllUsers] = useState([]);  // Renamed for clarity
    const [admins, setAdmins] = useState([]);      // Renamed for clarity

    useEffect(() => {
        handleFetchUsers();
        handleFetchAdmins();
    }, []);

    const handleFetchUsers = async () => {
        try {
            const response = await axiosInstance.get("/all");
            if (Array.isArray(response.data)) {
                setAllUsers(response.data);
            } else {
                console.error("Expected an array of users, but received:", response.data);
                setAllUsers([]); 
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setAllUsers([]); 
        }
    };

    const handleFetchAdmins = async () => {
        try {
            const response = await axiosInstance.get("/alladmin");
            if (Array.isArray(response.data)) {
                setAdmins(response.data);
                console.log("Fetched admin data:", response.data);
            } else {
                console.error("Expected an array of admins, but received:", response.data);
                setAdmins([]); 
            }
        } catch (error) {
            console.error("Error fetching admins:", error);
            setAdmins([]); 
        }
    };

    return (
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, height: "100%", alignItems: "center", justifyContent: "center" }}>
            <UserTable users={allUsers} />
            <AdminTable users={admins} />
        </Box>
    );
}
