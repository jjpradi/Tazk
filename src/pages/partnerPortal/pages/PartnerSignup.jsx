import React, { useState } from "react";
import { Alert, Box, Button, Card, CardContent, MenuItem, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { PARTNER_PORTAL_PREFIX } from "../config";
import { partnerSignup } from "../api/partnerApi";
import TazkLogo from '../../../assets/user/Tazk-logo-horizontal.svg';
import { titleURL } from 'http-common';

export default function PartnerSignup() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(null);

  const [form, setForm] = useState({
    company_name: "",
    owner_name: "",
    phone: "",
    email: "",
    password: "",
    partner_type: "referral"
  });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setOk(null);
    try {
      const data = await partnerSignup(form);
      setOk(data);
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Signup failed");
    } finally {
      setBusy(false);
    }
  };

  return (
<Box
  sx={{
    minHeight: "100vh",
    width: "100%",
    display: "grid",
    placeItems: "center",
    p: 2,
  }}
>
  <Card sx={{ width: "100%", maxWidth: 900 }}>
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <CardContent sx={{ flex: 1 }}>
        {/* <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <img src={TazkLogo} alt="Logo" width={150} />
        </Box> */}

        <Typography variant="h2" sx={{ mb: 1,ml:30 }}>
          <img src={TazkLogo} alt="Logo" width={150} /> 
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, opacity: 1,mt:2 }}>
          After signup, an admin must approve your partner before you can login.
        </Typography>


        {err && <Alert sx={{ mb: 2 }} severity="error">{err}</Alert>}
        {ok && (
          <Alert sx={{ mb: 2 }} severity="success">
            Signup successful. Partner Code: <b>{ok.partner_code}</b>.
          </Alert>
        )}

        <form onSubmit={onSubmit}>
          <TextField label="Company Name" fullWidth sx={{ mb: 2 }} />
          <TextField label="Owner Name" fullWidth sx={{ mb: 2 }} />
          <TextField label="Phone" fullWidth sx={{ mb: 2 }} />
          <TextField label="Email" fullWidth sx={{ mb: 2 }} />
          <TextField label="Password" type="password" fullWidth sx={{ mb: 2 }} />

          <TextField select label="Partner Type" fullWidth sx={{ mb: 2 }}>
            <MenuItem value="referral">Referral</MenuItem>
            <MenuItem value="reseller">Reseller</MenuItem>
            <MenuItem value="agency">Agency</MenuItem>
          </TextField>

          <Button type="submit" variant="contained">
            Create Partner Account
          </Button>

          {/* <Button component={RouterLink} to="/signin" sx={{ ml: 2 }}>
            Back to login
          </Button> */}
          
        </form>
      </CardContent>

      <Box
        sx={{
          flex: 1,
          display: { xs: "none", sm: "flex" },
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          backgroundColor: (theme) => theme.palette.grey[900],
          color: "white",
          p: 6,
        }}
      >
        <Typography fontWeight="bold" fontSize={26} mb={2}>
          {`Welcome to ${titleURL}!`}
        </Typography>
        <Typography>We Elevate Your Business.</Typography>
      </Box>
    </Box>
  </Card>
</Box>

  );
}
