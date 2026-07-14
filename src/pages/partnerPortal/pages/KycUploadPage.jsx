import React, { useState } from "react";
import { Alert, Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from "@mui/material";
import PartnerShell from "../layouts/PartnerShell";
import { uploadKycDoc } from "../api/partnerApi";

export default function KycUploadPage() {
  const [docType, setDocType] = useState("pan");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const submit = async () => {
    setBusy(true);
    setErr("");
    setOk("");
    try {
      if (!file) throw new Error("Select a file");
      await uploadKycDoc({ doc_type: docType, file });
      setOk("Uploaded");
      setFile(null);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PartnerShell title="KYC Upload">
      {err ? <Alert sx={{ mb: 2 }} severity="error">{err}</Alert> : null}
      {ok ? <Alert sx={{ mb: 2 }} severity="success">{ok}</Alert> : null}

      <Card>
        <CardContent>
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
            Upload PAN / GST / Bank / Agreement docs. Backend stores locally or S3 depending on env.
          </Typography>

          <Stack spacing={2}>
            <TextField select label="Document type" value={docType} onChange={(e) => setDocType(e.target.value)}>
              <MenuItem value="pan">PAN</MenuItem>
              <MenuItem value="gst">GST</MenuItem>
              <MenuItem value="bank">Bank</MenuItem>
              <MenuItem value="agreement">Agreement</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>

            <Button variant="outlined" component="label">
              Select file
              <input type="file" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </Button>

            {file ? <Typography variant="caption">Selected: {file.name}</Typography> : null}

            <Button variant="contained" onClick={submit} disabled={busy}>
              {busy ? "Uploading..." : "Upload"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </PartnerShell>
  );
}
