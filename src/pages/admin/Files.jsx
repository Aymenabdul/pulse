import { useEffect, useState } from "react";
import {
    Box,
    CircularProgress
} from "@mui/material";
import FileUpload from "../../components/FileUpload";
import SurveyTable from "../../components/SurveyTable";
import axiosInstance from "../../axios/axios";

export default function Files() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        handleFetchData();
    }, []);

    const handleFetchData = async () => {
        try {
            const response = await axiosInstance.get("/file/survey-stats");
            setData(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false); 
        }
    };

    return (
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, height: "100%", alignItems: "center", justifyContent: "center" }}>
            <FileUpload onUploadSuccess={handleFetchData}/>
            
            {loading ? (
                <CircularProgress /> 
            ) : (
                <SurveyTable data={data} loading={loading} /> 
            )}
        </Box>
    )
}
