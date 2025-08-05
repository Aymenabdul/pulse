import { useState } from "react";
import {
    Box
} from "@mui/material";
import FileUpload from "../../components/FileUpload";
import SurveyTable from "../../components/SurveyTable";

export default function Files() {
    // const [uploadedFiles, setUploadedFiles] = useState([]);

    // const handleFilesChange = (files) => {
    //     console.log('Files selected:', files);
    //     setUploadedFiles(files);
    // }
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