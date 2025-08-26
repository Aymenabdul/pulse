import { useEffect, useState } from "react";
import {
    Box,
    CircularProgress,
    Typography,
    Button 
} from "@mui/material";

import SuperFileUpload from "../../components/SuperFileUpload";
import SuperConstTable from "../../components/superConstTable";
import axiosInstance from "../../axios/axios"; 

export default function Files() {
    console.log("Files component rendering...");

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        console.log("Files useEffect: Fetching data...");
        handleFetchData();
    }, []);

    const handleFetchData = async () => {
        try {
            const response = await axiosInstance.get("/file/allfiledata");
            setData(response.data);
            console.log("Fetched data successfully:", response.data);
            
        } catch (error) {
            console.error("Error fetching survey responses:", error);
        } finally {
            setLoading(false); 
            console.log("Loading finished.");
        }
    };

    return (
        <Box 
            sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, height: "100%", alignItems: "center", justifyContent: "center" }}
        >
            {loading && <Typography>Loading data...</Typography>}
            {!loading && data.length === 0 && <Typography>No survey data available.</Typography>}

            <SuperFileUpload onUploadSuccess={handleFetchData}/>
            
            {loading ? (
                <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, height: "100%", alignItems: "center", justifyContent: "center" }}>
                    <CircularProgress /> 
                </Box>
            ) : (
                <SuperConstTable data={data} loading={loading} /> 
            )}
        </Box>
    );
}