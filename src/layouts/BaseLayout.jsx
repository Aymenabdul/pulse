import { Outlet } from "react-router";
import Box from "@mui/material/Box";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";

export default function BaseLayout() {
    const { user } = useAuth();

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "linear-gradient(135deg, #a8edea, #fed6e3)" }}>
            <Navbar userRole={user?.role}/>
            <Outlet />
        </Box>
    )
}