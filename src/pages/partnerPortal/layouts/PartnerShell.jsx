import React from "react";
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PARTNER_PORTAL_PREFIX } from "../config";
import { usePartnerAuth } from "../auth/PartnerAuthContext";

export default function PartnerShell({ title, children }) {
  const { me, logout } = usePartnerAuth();

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Partner Portal
          </Typography>
          {me?.partner?.code ? (
            <Typography variant="body2" sx={{ mr: 2, opacity: 0.9 }}>
              Code: {me.partner.code}
            </Typography>
          ) : null}
          <Button color="inherit" component={RouterLink} to={`${PARTNER_PORTAL_PREFIX}/dashboard`}>
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to={`${PARTNER_PORTAL_PREFIX}/leads`}>
            leads
          </Button>
          <Button color="inherit" component={RouterLink} to={`${PARTNER_PORTAL_PREFIX}/commissions`}>
            commissions
          </Button>
          <Button color="inherit" component={RouterLink} to={`${PARTNER_PORTAL_PREFIX}/payouts`}>
            payouts
          </Button>
          <Button color="inherit" component={RouterLink} to={`${PARTNER_PORTAL_PREFIX}/profile`}>
            profile
          </Button>
          {/* <Button color="inherit" onClick={logout}>Logout</Button> */}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {title ? <Typography variant="h5" sx={{ mb: 2 }}>{title}</Typography> : null}
        {children}
      </Container>
    </Box>
  );
}
