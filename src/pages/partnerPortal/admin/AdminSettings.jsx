import React, { useMemo, useState } from "react";
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import AdminShell from "../layouts/AdminShell";
import { PARTNER_ADMIN_TOKEN_KEY } from "../config";

export default function AdminSettings() {
  const initial = useMemo(() => window.localStorage.getItem(PARTNER_ADMIN_TOKEN_KEY) || "", []);
  const [token, setToken] = useState(initial);
  const [ok, setOk] = useState("");

  const save = () => {
    window.localStorage.setItem(PARTNER_ADMIN_TOKEN_KEY, token.trim());
    setOk("Saved admin token");
    setTimeout(() => setOk(""), 2000);
  };

  return (
    <AdminShell title="Settings">
      <Card>
        <CardContent>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
            Paste your **Admin JWT** here (must have `role=admin`). The Partner Service backend expects this.
          </Typography>
          {ok ? <Alert sx={{ mb: 2 }} severity="success">{ok}</Alert> : null}
          <Stack spacing={2}>
            <TextField
              label="Admin JWT"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              multiline
              minRows={4}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            />
            <Button variant="contained" onClick={save}>Save</Button>
          </Stack>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
