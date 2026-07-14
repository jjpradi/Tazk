import React, { useState } from "react";
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import AdminShell from "../layouts/AdminShell";
import { adminApproveBatch, adminMarkBatchPaid } from "../api/partnerApi";

export default function AdminPayoutActionsPage() {
  const [batchId, setBatchId] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const approve = async () => {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await adminApproveBatch(batchId.trim());
      setMsg("Batch approved");
    } catch (e) {
      setErr(e?.response?.data?.error || "Approve failed");
    } finally {
      setBusy(false);
    }
  };

  const markPaid = async () => {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await adminMarkBatchPaid(batchId.trim());
      setMsg("Batch marked as paid");
    } catch (e) {
      setErr(e?.response?.data?.error || "Mark paid failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell title="Payout Actions">
      <Card>
        <CardContent>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
            The initial backend only exposes **approve** and **mark-paid** for payout batches (no list endpoint yet).
            Enter a batchId to perform actions.
          </Typography>

          {err ? <Alert sx={{ mb: 2 }} severity="error">{err}</Alert> : null}
          {msg ? <Alert sx={{ mb: 2 }} severity="success">{msg}</Alert> : null}

          <Stack spacing={2} direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }}>
            <TextField
              label="Batch ID"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={approve} disabled={busy || !batchId.trim()}>
              Approve
            </Button>
            <Button variant="outlined" onClick={markPaid} disabled={busy || !batchId.trim()}>
              Mark Paid
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
