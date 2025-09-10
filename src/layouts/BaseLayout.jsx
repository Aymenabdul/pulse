import { Outlet } from "react-router";
import Box from "@mui/material/Box";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";

export default function BaseLayout() {
    const { user } = useAuth();

    return (
        <Box
            sx={{
                background: "linear-gradient(135deg, #a8edea, #fed6e3)",
                minHeight: "100vh",
                minWidth: '100vw',
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: '100%',
                    minWidth: 0,
                }}
            >
                <Navbar userRole={user?.role} />
                <Outlet />
            </Box>
        </Box>
    );
}