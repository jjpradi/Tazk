import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Stack } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import PartnerShell from "../layouts/PartnerShell";
import { listCommissions } from "../api/partnerApi";

export default function CommissionsPage() {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    setBusy(true);
    setErr("");
    try {
      const data = await listCommissions({ limit: 200, offset: 0 });
      setRows(data?.items || data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load commissions");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { load(); }, []);

  const columns = [
    { field: "created_at", headerName: "Created", width: 200 },
    { field: "tenant_id", headerName: "Tenant", width: 220 },
    { field: "event_type", headerName: "Type", width: 150 },
    { field: "status", headerName: "Status", width: 140 },
    { field: "amount", headerName: "Amount", width: 120 }
  ];

  return (
    <PartnerShell title="Commissions">
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
              getRowId={(r) => r.id || r.event_id || r._id}
              disableRowSelectionOnClick
              loading={busy}
            />
          </Box>
        </CardContent>
      </Card>
    </PartnerShell>
  );
}
