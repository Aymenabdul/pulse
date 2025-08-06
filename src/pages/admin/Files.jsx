import { useEffect, useState } from "react";
import {
    Box
} from "@mui/material";
import FileUpload from "../../components/FileUpload";
import SurveyTable from "../../components/SurveyTable";
import axiosInstance from "../../axios/axios";

export default function Files() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const handleFetchData = async () => {
            try {
                const response = await axiosInstance.get("/file/survey-stats");
                setData(response.data);
                console.log(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        handleFetchData();
    })

    return (
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, height: "100%", alignItems: "center", justifyContent: "center" }}>
            <FileUpload
                // maxFiles={5}                    
                // maxFileSize={10 * 1024 * 1024}  
                // acceptedTypes={['.xlsx', '.xls', '.csv']}
                // onFilesChange={handleFilesChange}
            />
            {/* <SurveyTable data={sampleSurveys} loading={false}/> */}
        </Box>
    )
}