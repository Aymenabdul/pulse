import { 
    Box,
    Card,
    CardContent,
    Grid,
    Skeleton 
} from "@mui/material";

export default function VoterCardSkeleton() {
    return (     
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card
                sx={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    minHeight: '240px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                            <Skeleton variant="text" width={120} height={24} sx={{ mr: 1 }} />
                            <Skeleton variant="circular" width={20} height={20} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 12 }} />
                            <Skeleton variant="circular" width={24} height={24} />
                        </Box>
                    </Box>

                    <Box>
                        <Skeleton variant="text" width="80%" height={20} sx={{ mb: 0.5 }} />
                        <Skeleton variant="text" width="70%" height={20} sx={{ mb: 0.5 }} />
                        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
                        <Skeleton variant="text" width="50%" height={20} sx={{ mb: 0.5 }} />
                        <Skeleton variant="text" width="55%" height={20} />
                    </Box>
                </CardContent>
            </Card>
        </Grid>
    ); 
}
    