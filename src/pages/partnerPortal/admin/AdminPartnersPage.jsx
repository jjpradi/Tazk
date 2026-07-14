import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Stack, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AdminShell from "../layouts/AdminShell";
import { adminApprovePartner, adminListPartners } from "../api/partnerApi";

export default function AdminPartnersPage() {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [status, setStatus] = useState("");

  const load = async () => {
    setBusy(true);
    setErr("");
    try {
      const data = await adminListPartners(status ? { status } : {});
      setRows(data?.items || data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load partners");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    setBusy(true);
    setErr("");
    try {
      await adminApprovePartner(id);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || "Approve failed");
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { field: "code", headerName: "Code", width: 120 },
    { field: "company_name", headerName: "Company", flex: 1, minWidth: 180 },
    { field: "owner_name", headerName: "Owner", width: 180 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "phone", headerName: "Phone", width: 160 },
    { field: "type", headerName: "Type", width: 140 },
    { field: "status", headerName: "Status", width: 140 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="contained"
          disabled={busy || params.row.status === "approved"}
          onClick={() => approve(params.row.id)}
        >
          Approve
        </Button>
      )
    }
  ];

  return (
    <AdminShell title="Partners">
      <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: "center" }}>
        <TextField
          label="Status filter"
          size="small"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder="pending / approved / rejected"
        />
        <Button onClick={load} disabled={busy}>Apply</Button>
      </Stack>

      {err ? <Alert sx={{ mb: 2 }} severity="error">{err}</Alert> : null}

      <Card>
        <CardContent>
          <Box sx={{ height: 560, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(r) => r.id || r.partner_id || r._id}
              disableRowSelectionOnClick
              loading={busy}
            />
          </Box>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
