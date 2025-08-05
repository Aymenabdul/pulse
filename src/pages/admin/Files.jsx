import { useState } from "react";
import {
    Box
} from "@mui/material";
import FileUpload from "../../components/FileUpload";
import SurveyTable from "../../components/SurveyTable";

const sampleSurveys = [
  {
    id: 1,
    name: "Public Awareness Survey",
    createdAt: "2025-07-01",
    status: "active",
  },
  {
    id: 2,
    name: "Health & Hygiene Survey",
    createdAt: "2025-07-10",
    status: "inactive",
  },
  {
    id: 3,
    name: "Youth Employment Survey",
    createdAt: "2025-06-15",
    status: "active",
  },
  {
    id: 4,
    name: "Community Feedback Survey",
    createdAt: "2025-06-28",
    status: "inactive",
  },
];

export default function Files() {
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const handleFilesChange = (files) => {
        console.log('Files selected:', files);
        setUploadedFiles(files);
    }
    return (
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, height: "100%", alignItems: "center", justifyContent: "center" }}>
            <FileUpload
                maxFiles={5}                    
                maxFileSize={10 * 1024 * 1024}  
                acceptedTypes={['.xlsx', '.xls', '.csv']}
                onFilesChange={handleFilesChange}
            />
            <SurveyTable data={sampleSurveys} loading={false}/>
        </Box>
    )
}