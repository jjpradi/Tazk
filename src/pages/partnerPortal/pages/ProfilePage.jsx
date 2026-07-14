import React, { useEffect, useState } from "react";
import { Alert, Button, Card, CardContent, Grid, TextField, Typography } from "@mui/material";
import PartnerShell from "../layouts/PartnerShell";
import { getPartnerMe, updatePartnerMe } from "../api/partnerApi";

export default function ProfilePage() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [form, setForm] = useState({
    company_name: "",
    owner_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: ""
  });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => { (async () => {
    (async () => {
      try {
        const data = await getPartnerMe();
        const p = data?.partner || data || {};
        setForm((prev) => ({
          ...prev,
          company_name: p.company_name || "",
          owner_name: p.owner_name || "",
          phone: p.phone || "",
          address_line1: p.address_line1 || "",
          address_line2: p.address_line2 || "",
          city: p.city || "",
          state: p.state || "",
          pincode: p.pincode || ""
        }));
      } catch {
        // ignore
      }
    })();
  })();
}, []);

  const save = async () => {
    setBusy(true);
    setErr("");
    setOk("");
    try {
      await updatePartnerMe(form);
      setOk("Saved");
    } catch (e) {
      setErr(e?.response?.data?.error || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PartnerShell title="Profile">
      {err ? <Alert sx={{ mb: 2 }} severity="error">{err}</Alert> : null}
      {ok ? <Alert sx={{ mb: 2 }} severity="success">{ok}</Alert> : null}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Partner details</Typography>

          <Grid container spacing={2}>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField label="Company Name" fullWidth value={form.company_name} onChange={set("company_name")} />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField label="Owner Name" fullWidth value={form.owner_name} onChange={set("owner_name")} />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField label="Phone" fullWidth value={form.phone} onChange={set("phone")} />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField label="Pincode" fullWidth value={form.pincode} onChange={set("pincode")} />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField label="Address line 1" fullWidth value={form.address_line1} onChange={set("address_line1")} />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField label="Address line 2" fullWidth value={form.address_line2} onChange={set("address_line2")} />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField label="City" fullWidth value={form.city} onChange={set("city")} />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField label="State" fullWidth value={form.state} onChange={set("state")} />
            </Grid>
          </Grid>

          <Button variant="contained" sx={{ mt: 2 }} onClick={save} disabled={busy}>
            {busy ? "Saving..." : "Save"}
          </Button>
        </CardContent>
      </Card>
    </PartnerShell>
  );
}
