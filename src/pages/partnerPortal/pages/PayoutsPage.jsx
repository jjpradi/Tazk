import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Stack } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import PartnerShell from "../layouts/PartnerShell";
import { listPayouts } from "../api/partnerApi";

export default function PayoutsPage() {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    setBusy(true);
    setErr("");
    try {
      const data = await listPayouts();
      setRows(data?.items || data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load payouts");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { load(); }, []);

  const columns = [
    { field: "created_at", headerName: "Created", width: 200 },
    { field: "status", headerName: "Status", width: 140 },
    { field: "total_amount", headerName: "Total", width: 140 },
    { field: "currency", headerName: "Currency", width: 110 }
  ];

  return (
    <PartnerShell title="Payouts">
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button onClick={load} disabled={busy}>Refresh</Button>
      </Stack>
      {err ? <Alert sx={{ mb: 2 }} severity="error">{err}</Alert> : null}

      <Card>
        <CardContent>
          <Box sx={{ height: 540, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(r) => r.id || r.batch_id || r._id}
              disableRowSelectionOnClick
              loading={busy}
            />
          </Box>
        </CardContent>
      </Card>
    </PartnerShell>
  );
}
