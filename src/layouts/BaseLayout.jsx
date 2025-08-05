import { Outlet } from "react-router";
import Box from "@mui/material/Box";
import Navbar from "../components/Navbar";

export default function BaseLayout({ userRole }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "linear-gradient(135deg, #a8edea, #fed6e3)" }}>
            <Navbar userRole={userRole}/>
            <Outlet />
        </Box>
    )
}