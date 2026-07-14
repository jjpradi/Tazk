import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import PartnerShell from "../layouts/PartnerShell";
import { createLead, listLeads, updateLead } from "../api/partnerApi";

const STAGES = ["new", "contacted", "qualified", "demo", "won", "lost"];

export default function LeadsPage() {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({ name: "", email: "", phone: "", stage: "new", notes: "" });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const load = async () => {
    setBusy(true);
    setErr("");
    try {
      const data = await listLeads({ limit: 100, offset: 0 });
      setRows(data?.items || data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load leads");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { load(); }, []);

  const columns = useMemo(() => ([
    { field: "name", headerName: "Name", flex: 1, minWidth: 180 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    { field: "phone", headerName: "Phone", flex: 1, minWidth: 150 },
    { field: "stage", headerName: "Stage", width: 140 },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Button size="small" onClick={() => {
          setEditing(params.row);
          setForm({
            name: params.row.name || "",
            email: params.row.email || "",
            phone: params.row.phone || "",
            stage: params.row.stage || "new",
            notes: params.row.notes || ""
          });
          setOpen(true);
        }}>
          Edit
        </Button>
      )
    }
  ]), []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "", stage: "new", notes: "" });
    setOpen(true);
  };

  const save = async () => {
    setBusy(true);
    setErr("");
    try {
      if (editing?.id) {
        await updateLead(editing.id, form);
      } else {
        await createLead(form);
      }
      setOpen(false);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PartnerShell title="Leads">
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={openCreate}>New Lead</Button>
        <Button onClick={load} disabled={busy}>Refresh</Button>
      </Stack>

      {err ? <Alert sx={{ mb: 2 }} severity="error">{err}</Alert> : null}

      <Card>
        <CardContent>
          <Box sx={{ height: 520, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(r) => r.id || r.lead_id || r._id}
              disableRowSelectionOnClick
              loading={busy}
            />
          </Box>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit Lead" : "New Lead"}</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth sx={{ mt: 1 }} value={form.name} onChange={set("name")} />
          <TextField label="Email" fullWidth sx={{ mt: 2 }} value={form.email} onChange={set("email")} />
          <TextField label="Phone" fullWidth sx={{ mt: 2 }} value={form.phone} onChange={set("phone")} />
          <TextField select label="Stage" fullWidth sx={{ mt: 2 }} value={form.stage} onChange={set("stage")}>
            {STAGES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField label="Notes" fullWidth multiline minRows={3} sx={{ mt: 2 }} value={form.notes} onChange={set("notes")} />
          <Typography variant="caption" sx={{ display: "block", mt: 1, opacity: 0.7 }}>
            Note: stages are not enforced server-side yet; adjust per your pipeline rules later.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={busy}>
            {busy ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </PartnerShell>
  );
}
