import { Dialog, DialogContent, Grid, Typography, Box } from "@mui/material";
import { useEffect } from "react";

function NegativeCashWarning({ open, cash, onClose }) {
    
    useEffect(() => {
        if (!open) return

        const closePopup = () => onClose()

        window.addEventListener("keydown", closePopup)
        window.addEventListener("mousedown", closePopup)
        
        return () => {
            window.removeEventListener("keydown", closePopup)
            window.removeEventListener("mousedown", closePopup)
        }
    }, [open, onClose])

    return (
        <Dialog open={open} maxWidth="xs">
            <DialogContent sx={{ p: 0 }}>
                <Box
                    sx={{
                        overflow: "hidden",
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            textAlign: "center",
                            py: 1,
                        }}
                    >
                        <Typography fontWeight="bold">
                            Warning
                        </Typography>
                    </Box>

                    {/* Body */}
                    <Grid container spacing={1} sx={{ p: 2, textAlign: "center" }}>
                        <Grid size={12}>
                            <Typography fontWeight="bold">Negative Cash!</Typography>
                        </Grid>

                        <Grid size={12}>
                            <Typography fontSize={16}>
                                ₹ <b>(-) {Number(cash).toLocaleString("en-IN")}</b>
                            </Typography>
                        </Grid>

                        <Grid sx={{ mt: 1 }} size={12}>
                            <Typography fontSize={12} color="text.secondary">
                                Press any key to continue
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

export default NegativeCashWarning
