import { 
    Box,
    Typography
} from "@mui/material";
import SurveyNavigatorCards from "../../components/SurveyNavigatorCards";
import StatusNavigatorCards from "../../components/StatusNavigatorCards";


export default function Landing() {
    return (
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, justifyContent: "center", alignItems: "center", }}>
            <SurveyNavigatorCards from="surveyor" />
            <StatusNavigatorCards from="surveyor" />
        </Box>
    )
};