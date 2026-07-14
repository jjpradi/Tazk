import React from "react";
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PARTNER_ADMIN_PREFIX, PARTNER_ADMIN_TOKEN_KEY } from "../config";

export default function AdminShell({ title, children }) {
  const clearToken = () => window.localStorage.removeItem(PARTNER_ADMIN_TOKEN_KEY);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Partner Admin
          </Typography>
          <Button color="inherit" component={RouterLink} to={`${PARTNER_ADMIN_PREFIX}/partners`}>
            Partners
          </Button>
          <Button color="inherit" component={RouterLink} to={`${PARTNER_ADMIN_PREFIX}/payouts`}>
            Payouts
          </Button>
          <Button color="inherit" component={RouterLink} to={`${PARTNER_ADMIN_PREFIX}/settings`}>
            Settings
          </Button>
          <Button color="inherit" onClick={clearToken}>Clear Token</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {title ? <Typography variant="h5" sx={{ mb: 2 }}>{title}</Typography> : null}
        {children}
      </Container>
    </Box>
  );
}
