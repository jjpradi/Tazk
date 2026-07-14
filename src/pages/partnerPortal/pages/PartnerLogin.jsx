import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { PARTNER_PORTAL_PREFIX } from "../config";
import { usePartnerAuth } from "../auth/PartnerAuthContext";

export default function PartnerLogin() {
  const { login, me, loading, error } = usePartnerAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [localErr, setLocalErr] = useState("");

  // ✅ SAFE REDIRECT (NO LOOP, NO BLANK SCREEN)
  
  useEffect(() => {
    if (!loading && me) {
      navigate(`${PARTNER_PORTAL_PREFIX}/dashboard`, { replace: true });
    }
  }, [me, loading, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setLocalErr("");

    try {
      await login({ email, password });
      // ❌ DO NOT navigate here
    } catch (e2) {
      setLocalErr(e2?.response?.data?.error || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null; // prevents flicker

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Card sx={{ width: "100%", maxWidth: 520 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Partner Login
          </Typography>

          <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
            Login requires approval (your backend blocks login until approved).
          </Typography>

          {error && <Alert sx={{ mb: 2 }} severity="warning">{error}</Alert>}
          {localErr && <Alert sx={{ mb: 2 }} severity="error">{localErr}</Alert>}

          <form onSubmit={onSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button type="submit" variant="contained" fullWidth disabled={busy}>
              {busy ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 2 }}>
            New partner?{" "}
            <Button
              component={RouterLink}
              to={`${PARTNER_PORTAL_PREFIX}/signup`}
              size="small"
            >
              Create account
            </Button>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
