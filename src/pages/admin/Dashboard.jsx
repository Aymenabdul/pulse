import { 
    Box,
    Typography
} from "@mui/material";
import SurveyNavigatorCards from "../../components/SurveyNavigatorCards";
import ProcessNavigatorCards from "../../components/ProcessNavigatorCards";

export default function Dashboard() {
    // const handleFilesChange = (files) => {
    //     console.log('Selected files:', files);
    // };

    return (
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, height: "100%", alignItems: "center", justifyContent: "center" }}>
            <SurveyNavigatorCards from="admin" />
            <ProcessNavigatorCards />
        </Box>
    );
}