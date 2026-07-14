import React, { useState, useEffect, useContext } from 'react';
import {
    Box, Typography, Paper, Button, Chip, CircularProgress, Accordion,
    AccordionSummary, AccordionDetails, Table, TableHead, TableBody, TableCell,
    TableRow, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
    Tooltip, Grid, Card, CardContent, Divider, Alert, LinearProgress,
    FormControlLabel, Switch,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import instance, { baseURL } from '../../../http-common';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { getAccessToken } from '../../common/login/cookies';

const SEVERITY_COLOR = {
    Critical: { bg: '#d32f2f', fg: '#fff' },
    High: { bg: '#ef6c00', fg: '#fff' },
    Medium: { bg: '#f9a825', fg: '#000' },
    Low: { bg: '#689f38', fg: '#fff' },
    Info: { bg: '#607d8b', fg: '#fff' },
};

const scoreColor = (score) => {
    if (score >= 8) return '#2e7d32';
    if (score >= 5) return '#ef6c00';
    return '#d32f2f';
};

const scoreLabel = (score) => {
    if (score >= 8) return 'GREEN';
    if (score >= 5) return 'AMBER';
    return 'RED';
};

const formatDate = (d) => {
    if (!d) return '-';
    try { return new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch (_) { return String(d); }
};

// Convert snake_case / camelCase column keys to Title Case.
const prettyHeader = (key) => String(key || '')
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b([a-z])/g, (c) => c.toUpperCase())
    .replace(/\bId\b/g, 'ID')
    .replace(/\bGst\b/gi, 'GST')
    .replace(/\bCgst\b/gi, 'CGST')
    .replace(/\bSgst\b/gi, 'SGST')
    .replace(/\bIgst\b/gi, 'IGST')
    .replace(/\bTds\b/gi, 'TDS')
    .replace(/\bTcs\b/gi, 'TCS')
    .replace(/\bCn\b/gi, 'CN')
    .replace(/\bDn\b/gi, 'DN');

// Indian numbering format (1,23,45,678). Handles negatives + decimals + null.
const formatINR = (v) => {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    const sign = n < 0 ? '-' : '';
    const [whole, frac] = Math.abs(n).toFixed(2).split('.');
    // Indian: last 3 digits, then groups of 2
    let x = whole;
    let out = '';
    if (x.length > 3) {
        out = ',' + x.slice(-3);
        x = x.slice(0, -3);
        while (x.length > 2) {
            out = ',' + x.slice(-2) + out;
            x = x.slice(0, -2);
        }
        out = x + out;
    } else {
        out = x;
    }
    return sign + out + '.' + frac;
};

// Money-like columns: render with ₹, Indian grouping, and 2 decimals.
// Word boundaries so "count" inside "accountId" doesn't accidentally match.
const isAmountCol = (key) => {
    const k = String(key || '').toLowerCase();
    return /(^|_)(amount|value|total|balance|debit|credit|sum|qty|quantity|gap|tax|gst|net|tds|tcs|price|paid|received)(_|$)/.test(k);
};

// Count-like columns: render as plain integer with thousands separator, no decimals.
// rows_count, issue_count, rows_n, without_receipt_n, times, etc.
const isCountCol = (key) => {
    const k = String(key || '').toLowerCase();
    return /(^|_)(count|cnt|rows|times|duplicates)(_|$)/.test(k) || /_n$/.test(k) || k === 'n';
};

// ID-like columns render as plain integers — no thousands separator, no decimals.
// Catches id, entry_id, transactionId, accountId, manualnote_id, etc. + code / voucher_code / sequence_number / ref.
const isIdCol = (key) => {
    const k = String(key || '').toLowerCase().replace(/_/g, '');
    if (/ids?$/.test(k)) return true;                          // id, ids, accountid, entryids, manualnoteid, etc.
    if (k === 'code' || k.endsWith('code')) return true;       // code, vouchercode, txncode
    if (k === 'ref' || k.endsWith('ref')) return true;         // ref, transactionref
    if (k === 'sequencenumber') return true;
    return false;
};

const isDateCol = (key) => /date|_at$|time/i.test(String(key || ''));

// Parse `drawerRecords` in the format used by IT-5 / IT-6 / IT-7 recordsQuery:
//   ▼/▲ <SectionHeader>   (value=null)
//   + <Contributor>       value=amount
//   − <Contributor>       value=negative amount (or positive — prefix tells direction)
//   = <Actual ledger>     value=amount
// Returns an array of { header, contributors: [{label, value}], actuals: [{label, value}] }
const parseComparisonSections = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const columns = Object.keys(rows[0]);
    const sourceCol = columns[0];
    const valueCol  = columns.find((k) => /^(value|net_value|signed_balance|total_value)$/i.test(k)) || columns[1];
    const rowsCol   = columns.find((k) => /rows_count|count$/i.test(k));

    const sections = [];
    let current = null;
    for (const r of rows) {
        const src = String(r[sourceCol] || '').trim();
        const rawVal = r[valueCol];
        const nbRows = rowsCol ? r[rowsCol] : null;
        const num = rawVal === null || rawVal === undefined || rawVal === '' ? null : Number(rawVal);

        // Explicit terminator — stops further rows from joining a section.
        if (/^──/.test(src) || /^▸/.test(src)) { current = null; continue; }

        if (/^[▼▲]/.test(src)) {
            current = { header: src.replace(/^[▼▲]\s*/, ''), contributors: [], actuals: [] };
            sections.push(current);
        } else if (current && /^[+\-−]/.test(src)) {
            current.contributors.push({ label: src.replace(/^[+\-−]\s*/, ''), sign: src.startsWith('-') || src.startsWith('−') ? -1 : 1, value: num, rows: nbRows });
        } else if (current && /^=/.test(src)) {
            current.actuals.push({ label: src.replace(/^=\s*/, ''), value: num, rows: nbRows });
        }
        // If current === null, the row is ignored by the card parser but still shows up in the raw table below.
    }
    if (sections.length === 0) return null;
    return sections;
};

// Small presentational component — renders an "Expected vs Actual" card per section.
const ComparisonCard = ({ section }) => {
    const expected = section.contributors.reduce((s, c) => s + (Number(c.value) || 0) * (c.sign || 1), 0);
    const actual   = section.actuals.reduce((s, a) => s + (Number(a.value) || 0), 0);
    const gap      = expected - actual;
    const gapAbs   = Math.abs(gap);
    const tol      = Math.max(Math.abs(expected) * 0.01, 10000);
    const ok       = gapAbs <= tol;

    return (
        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0d47a1', mb: 1.5 }}>
                {section.header}
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={5}>
                    <Typography variant="overline" color="textSecondary">Expected (from source docs)</Typography>
                    {section.contributors.map((c, i) => (
                        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', py: 0.25 }}>
                            <Typography variant="body2" sx={{ flex: 1 }}>
                                {c.sign === -1 ? '−\u00a0' : i === 0 ? '\u00a0\u00a0' : '+\u00a0'}
                                {c.label}
                                {c.rows !== null && c.rows !== undefined && (
                                    <Typography component="span" variant="caption" color="textSecondary" sx={{ ml: 0.5 }}>
                                        ({Number(c.rows).toLocaleString('en-IN')})
                                    </Typography>
                                )}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500, color: (Number(c.value) * (c.sign||1)) < 0 ? '#d32f2f' : 'inherit' }}>
                                ₹{formatINR(Math.abs(Number(c.value) || 0) * (c.sign || 1))}
                            </Typography>
                        </Box>
                    ))}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#e8f5e9', p: 1, borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Expected</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>₹{formatINR(expected)}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={5}>
                    <Typography variant="overline" color="textSecondary">Actual (GL ledgers)</Typography>
                    {section.actuals.map((a, i) => (
                        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', py: 0.25 }}>
                            <Typography variant="body2" sx={{ flex: 1 }}>
                                {a.label}
                                {a.rows !== null && a.rows !== undefined && (
                                    <Typography component="span" variant="caption" color="textSecondary" sx={{ ml: 0.5 }}>
                                        ({Number(a.rows).toLocaleString('en-IN')})
                                    </Typography>
                                )}
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500, color: Number(a.value) < 0 ? '#d32f2f' : 'inherit' }}>
                                ₹{formatINR(a.value)}
                            </Typography>
                        </Box>
                    ))}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#fff3e0', p: 1, borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Actual</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>₹{formatINR(actual)}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Typography variant="overline" color="textSecondary">Gap</Typography>
                    <Box sx={{
                        p: 2, borderRadius: 2, textAlign: 'center',
                        bgcolor: ok ? '#e8f5e9' : '#ffebee',
                        border: `2px solid ${ok ? '#2e7d32' : '#d32f2f'}`,
                    }}>
                        <Typography variant="h6" sx={{
                            fontFamily: 'monospace', fontWeight: 700,
                            color: ok ? '#2e7d32' : '#d32f2f',
                        }}>
                            ₹{formatINR(gap)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: ok ? '#2e7d32' : '#d32f2f', fontWeight: 600 }}>
                            {ok ? '✓ WITHIN TOLERANCE' : '⚠ EXCEEDS TOLERANCE'}
                        </Typography>
                        {Math.abs(expected) > 0 && (
                            <Typography variant="caption" display="block" color="textSecondary">
                                {(gapAbs / Math.abs(expected) * 100).toFixed(2)}% of expected
                            </Typography>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

const AuditDashboard = () => {
    const ctx = useContext(CreateNewButtonContext);
    const [run, setRun] = useState(null);
    const [findings, setFindings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(null);
    const [drawerFinding, setDrawerFinding] = useState(null);
    const [drawerRecords, setDrawerRecords] = useState([]);
    const [drawerLoading, setDrawerLoading] = useState(false);
    const [drawerTruncated, setDrawerTruncated] = useState(false);
    const [showPassing, setShowPassing] = useState(false);

    const notify = (type, message) => {
        try { ctx && ctx.setModalTypeHandler && ctx.setModalTypeHandler({ type, message }); }
        catch (_) { /* ignore */ }
    };

    const fetchLatest = async () => {
        setLoading(true); setError(null);
        try {
            const res = await instance.get('/auditDashboard/latest');
            if (res.data && res.data.data) {
                setRun(res.data.data.run);
                setFindings(res.data.data.findings || []);
            } else {
                setRun(null); setFindings([]);
            }
        } catch (err) {
            if (err && err.response && err.response.status === 404) {
                setRun(null); setFindings([]);
            } else {
                setError(err && err.message ? err.message : 'Failed to load audit');
            }
        } finally { setLoading(false); }
    };

    const POLL_INTERVAL_MS = 4000;
    const POLL_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes cap

    const pollUntilDone = async (runId) => {
        const started = Date.now();
        while (Date.now() - started < POLL_TIMEOUT_MS) {
            try {
                const res = await instance.get(`/auditDashboard/run/${runId}`);
                const run = res.data && res.data.data && res.data.data.run;
                if (run && run.status === 'completed') {
                    setRun(run);
                    setFindings((res.data.data.findings) || []);
                    return true;
                }
                if (run && run.status === 'failed') {
                    setError(`Audit failed: ${run.error_message || 'unknown error'}`);
                    return false;
                }
            } catch (e) { /* swallow transient errors, keep polling */ }
            await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        }
        setError('Audit is taking longer than expected. Check back shortly or refresh.');
        return false;
    };

    const runAudit = async () => {
        setRunning(true); setError(null);
        try {
            const res = await instance.post('/auditDashboard/run');
            const runId = res.data && res.data.runId;
            if (!runId) {
                setError('Audit did not return a run id');
                return;
            }
            notify('success', 'Audit started. Running checks…');
            await pollUntilDone(runId);
            notify('success', 'Audit completed');
        } catch (err) {
            const msg = err && err.response && err.response.data ? err.response.data.message : err.message;
            setError(`Run failed: ${msg}`);
        } finally { setRunning(false); }
    };

    const [drawerError, setDrawerErrorState] = useState(null);
    const openDrawer = async (finding) => {
        setDrawerFinding(finding); setDrawerRecords([]); setDrawerLoading(true); setDrawerTruncated(false); setDrawerErrorState(null);
        try {
            const res = await instance.get(`/auditDashboard/finding/${finding.id}/records?limit=500`);
            if (res.data && res.data.data) {
                setDrawerRecords(res.data.data.records || []);
                setDrawerTruncated(Boolean(res.data.data.truncated));
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to load records';
            setDrawerErrorState(msg);
            notify('error', msg);
        } finally { setDrawerLoading(false); }
    };

    const closeDrawer = () => { setDrawerFinding(null); setDrawerRecords([]); };

    const exportCsv = (findingId) => {
        const token = getAccessToken();
        const url = `${baseURL}/accountsservice/api/audit/finding/${findingId}/export`;
        fetch(url, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.blob(); })
            .then((blob) => {
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = `audit_finding_${findingId}.csv`;
                link.click();
            })
            .catch(() => notify('error', 'CSV export failed'));
    };

    useEffect(() => { fetchLatest(); }, []);

    // Groups of related checks — rendered as a single collapsible parent row in the table.
    // Key = group id (just for state), label = user-facing heading.
    const CHECK_GROUPS = {
        gst: {
            label: 'GST Reconciliation',
            description: 'Sales ↔ GST Payable, Purchases ↔ GST Receivable, intra vs inter, per-sale and per-entry drill-down',
            members: ['IT-5', 'IT-6', 'IT-7', 'IT-8'],
        },
    };
    const groupByCheckId = Object.fromEntries(
        Object.entries(CHECK_GROUPS).flatMap(([k, g]) => g.members.map((id) => [id, k])),
    );
    const [expandedGroups, setExpandedGroups] = useState({});

    const passingCount = findings.filter((f) => Number(f.issue_count) === 0 && !f.error_message).length;
    const visibleFindings = showPassing ? findings : findings.filter((f) => Number(f.issue_count) > 0 || f.error_message);

    const groups = visibleFindings.reduce((acc, f) => {
        acc[f.category] = acc[f.category] || [];
        acc[f.category].push(f);
        return acc;
    }, {});
    const orderedCategories = Object.keys(groups).sort();

    const categorySeverity = (items) => {
        const sev = { Critical: 0, High: 0, Medium: 0, Low: 0 };
        for (const i of items) {
            if (i.issue_count > 0 && sev[i.severity] !== undefined) sev[i.severity] += 1;
        }
        return sev;
    };

    const severityChip = (label, n) => n > 0 ? (
        <Chip key={label} size="small" label={`${n} ${label}`}
            sx={{ bgcolor: SEVERITY_COLOR[label].bg, color: SEVERITY_COLOR[label].fg, ml: 0.5, fontSize: 11 }} />
    ) : null;

    return (
        <Box sx={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Card sx={{ flexShrink: 0 }}>
                <CardContent>
            <Grid container spacing={2} alignItems="stretch">
                <Grid item xs={12} md={4}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="overline" color="textSecondary">Accounts Health Score</Typography>
                            {run ? (
                                <>
                                    <Typography variant="h2" sx={{ color: scoreColor(Number(run.score || 0)), fontWeight: 700 }}>
                                        {Number(run.score || 0).toFixed(1)}
                                        <Typography component="span" variant="h4" color="textSecondary">/10</Typography>
                                    </Typography>
                                    <Chip label={scoreLabel(Number(run.score || 0))}
                                        sx={{ bgcolor: scoreColor(Number(run.score || 0)), color: '#fff', fontWeight: 700 }} />
                                </>
                            ) : (
                                <Typography variant="h5" color="textSecondary">—</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={5}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="overline" color="textSecondary">Issue Counts</Typography>
                            {run ? (
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                    {severityChip('Critical', run.issues_critical)}
                                    {severityChip('High', run.issues_high)}
                                    {severityChip('Medium', run.issues_medium)}
                                    {severityChip('Low', run.issues_low)}
                                    {(!run.issues_critical && !run.issues_high && !run.issues_medium && !run.issues_low) && (
                                        <Chip label="No issues" color="success" />
                                    )}
                                </Box>
                            ) : <Typography variant="body2" color="textSecondary">No audit yet</Typography>}
                            {run && (
                                <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 2 }}>
                                    Last run: {formatDate(run.started_at)} · {run.total_checks} checks
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button variant="contained" color="primary" startIcon={<PlayArrowIcon />}
                                onClick={runAudit} disabled={running} fullWidth>
                                {running ? 'Running…' : 'Run Audit Now'}
                            </Button>
                            <Button variant="outlined" startIcon={<RefreshIcon />}
                                onClick={fetchLatest} disabled={loading || running} fullWidth>
                                Refresh
                            </Button>
                            {running && (
                                <>
                                    <LinearProgress />
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Running 49 checks — this usually takes 30-120 seconds.
                                    </Typography>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
                </CardContent>
            </Card>

            <Card sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', mt: 2 }}>
            <CardContent sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}><CircularProgress /></Box>}

            {!loading && !run && (
                <Alert severity="info" sx={{ mt: 3 }}>
                    No audit has run yet for your company. Click <b>Run Audit Now</b> to start the first scan.
                </Alert>
            )}

            {!loading && run && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2, mb: 1 }}>
                    <FormControlLabel
                        control={<Switch size="small" checked={showPassing} onChange={(e) => setShowPassing(e.target.checked)} />}
                        label={
                            <Typography variant="body2" color="textSecondary">
                                Show passing checks {passingCount > 0 ? `(${passingCount} hidden)` : ''}
                            </Typography>
                        }
                    />
                </Box>
            )}

            {!loading && run && orderedCategories.length === 0 && !showPassing && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    No issues found — all {passingCount} checks passed. Toggle <b>Show passing checks</b> to view everything that was validated.
                </Alert>
            )}

            {!loading && run && orderedCategories.map((cat) => {
                const items = groups[cat];
                const sev = categorySeverity(items);
                const withIssues = items.filter((i) => i.issue_count > 0).length;
                return (
                    <Accordion key={cat} expanded={expanded === cat}
                        onChange={(_, isExp) => setExpanded(isExp ? cat : null)}
                        sx={{ mt: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <Typography sx={{ flex: 1, fontWeight: 600 }}>{cat}</Typography>
                                <Typography variant="caption" color="textSecondary" sx={{ mr: 2 }}>
                                    {withIssues} / {items.length} issues
                                </Typography>
                                {severityChip('Critical', sev.Critical)}
                                {severityChip('High', sev.High)}
                                {severityChip('Medium', sev.Medium)}
                                {severityChip('Low', sev.Low)}
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Severity</TableCell>
                                        <TableCell>Check</TableCell>
                                        <TableCell align="right">Count</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(() => {
                                        // Build ordered render list: either a {groupKey, groupItems} row or a standalone finding.
                                        const emitted = new Set();
                                        const rows = [];
                                        for (const f of items) {
                                            if (emitted.has(f.id)) continue;
                                            const gKey = groupByCheckId[f.check_id];
                                            if (gKey && CHECK_GROUPS[gKey]) {
                                                const gMembers = items.filter((x) => groupByCheckId[x.check_id] === gKey);
                                                if (gMembers.length >= 2) {
                                                    rows.push({ type: 'group', key: gKey, members: gMembers });
                                                    for (const m of gMembers) emitted.add(m.id);
                                                    continue;
                                                }
                                            }
                                            rows.push({ type: 'row', item: f });
                                            emitted.add(f.id);
                                        }

                                        const renderRow = (f, nested = false) => (
                                            <TableRow key={f.id} hover
                                                sx={{
                                                    bgcolor: f.issue_count > 0 ? 'rgba(255,0,0,0.02)' : 'transparent',
                                                }}>
                                                <TableCell sx={nested ? { pl: 6 } : {}}>
                                                    <Chip size="small" label={f.severity}
                                                        sx={{
                                                            bgcolor: SEVERITY_COLOR[f.severity]?.bg,
                                                            color: SEVERITY_COLOR[f.severity]?.fg,
                                                            fontWeight: 600,
                                                        }} />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        <span style={{ fontFamily: 'monospace', color: '#666', marginRight: 8 }}>{f.check_id}</span>
                                                        {f.title}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">{f.description}</Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="h6" sx={{
                                                        color: f.issue_count > 0 ? '#d32f2f' : '#2e7d32',
                                                        fontWeight: 700,
                                                    }}>
                                                        {Number(f.issue_count).toLocaleString('en-IN')}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    {f.issue_count > 0 && (
                                                        <>
                                                            <Tooltip title="View records">
                                                                <IconButton size="small" onClick={() => openDrawer(f)}>
                                                                    <VisibilityIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Export CSV">
                                                                <IconButton size="small" onClick={() => exportCsv(f.id)}>
                                                                    <DownloadIcon fontSize="small" />
                                                                </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        );

                                        return rows.map((r, idx) => {
                                            if (r.type === 'row') return renderRow(r.item);
                                            const g = CHECK_GROUPS[r.key];
                                            const members = r.members;
                                            const totalIssues = members.reduce((s, m) => s + Number(m.issue_count || 0), 0);
                                            const sev = { Critical: 0, High: 0, Medium: 0, Low: 0 };
                                            for (const m of members) {
                                                if (m.issue_count > 0 && sev[m.severity] !== undefined) sev[m.severity] += 1;
                                            }
                                            const topSeverity = sev.Critical > 0 ? 'Critical' : sev.High > 0 ? 'High' : sev.Medium > 0 ? 'Medium' : sev.Low > 0 ? 'Low' : 'Info';
                                            const isOpen = !!expandedGroups[r.key];
                                            return (
                                                <React.Fragment key={'grp-' + r.key}>
                                                    <TableRow hover
                                                        onClick={() => setExpandedGroups((prev) => ({ ...prev, [r.key]: !prev[r.key] }))}
                                                        sx={{ cursor: 'pointer', bgcolor: totalIssues > 0 ? 'rgba(255,0,0,0.04)' : '#f5f5f5' }}>
                                                        <TableCell>
                                                            <Chip size="small" label={topSeverity}
                                                                sx={{ bgcolor: SEVERITY_COLOR[topSeverity]?.bg, color: SEVERITY_COLOR[topSeverity]?.fg, fontWeight: 600 }} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <ExpandMoreIcon fontSize="small" sx={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                                                                <Box>
                                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                                        {g.label}
                                                                        <Typography component="span" variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                                                                            ({members.length} checks: {members.map((m) => m.check_id).join(', ')})
                                                                        </Typography>
                                                                    </Typography>
                                                                    <Typography variant="caption" color="textSecondary">{g.description}</Typography>
                                                                </Box>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography variant="h6" sx={{
                                                                color: totalIssues > 0 ? '#d32f2f' : '#2e7d32',
                                                                fontWeight: 700,
                                                            }}>
                                                                {totalIssues.toLocaleString('en-IN')}
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', mt: 0.5 }}>
                                                                {severityChip('Critical', sev.Critical)}
                                                                {severityChip('High', sev.High)}
                                                                {severityChip('Medium', sev.Medium)}
                                                                {severityChip('Low', sev.Low)}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography variant="caption" color="textSecondary">
                                                                {isOpen ? 'Hide' : 'Show'} details
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                    {isOpen && members.map((m) => renderRow(m, true))}
                                                </React.Fragment>
                                            );
                                        });
                                    })()}
                                </TableBody>
                            </Table>
                        </AccordionDetails>
                    </Accordion>
                );
            })}

            </CardContent>
            </Card>

            <Dialog open={Boolean(drawerFinding)} onClose={closeDrawer} maxWidth="lg" fullWidth
                scroll="paper"
                PaperProps={{ sx: { maxHeight: 'calc(100vh - 48px)' } }}>
                <DialogTitle>
                    {drawerFinding && (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip size="small" label={drawerFinding.severity}
                                    sx={{
                                        bgcolor: SEVERITY_COLOR[drawerFinding.severity]?.bg,
                                        color: SEVERITY_COLOR[drawerFinding.severity]?.fg,
                                    }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {drawerFinding.check_id} — {drawerFinding.title}
                                </Typography>
                                <Chip size="small" label={`${Number(drawerFinding.issue_count).toLocaleString('en-IN')} rows`}
                                    sx={{ ml: 1, bgcolor: '#eee' }} />
                            </Box>
                            <Typography variant="caption" color="textSecondary">{drawerFinding.description}</Typography>
                        </>
                    )}
                </DialogTitle>
                <DialogContent dividers sx={{ overflowY: 'auto' }}>
                    {drawerFinding && (drawerFinding.impact || drawerFinding.fix_hint) && (
                        <Box sx={{ mb: 2, p: 2, bgcolor: '#fafafa', borderRadius: 1, borderLeft: '4px solid #d32f2f' }}>
                            {drawerFinding.impact && (
                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="overline" sx={{ fontWeight: 700, color: '#d32f2f' }}>Impact</Typography>
                                    <Typography variant="body2">{drawerFinding.impact}</Typography>
                                </Box>
                            )}
                            {drawerFinding.fix_hint && (
                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="overline" sx={{ fontWeight: 700, color: '#2e7d32' }}>How to fix</Typography>
                                    <Typography variant="body2">{drawerFinding.fix_hint}</Typography>
                                </Box>
                            )}
                            {drawerFinding.affected_tables && drawerFinding.affected_tables.length > 0 && (
                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="overline" sx={{ fontWeight: 700 }}>Tables</Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {drawerFinding.affected_tables.map((t) => (
                                            <Chip key={t} size="small" label={t} sx={{ fontFamily: 'monospace', fontSize: 11 }} />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                            {drawerFinding.code_pointers && drawerFinding.code_pointers.length > 0 && (
                                <Box>
                                    <Typography variant="overline" sx={{ fontWeight: 700 }}>Code references</Typography>
                                    {drawerFinding.code_pointers.map((c) => (
                                        <Typography key={c} variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                                            {c}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}
                    {!drawerLoading && drawerRecords.length > 0 && (() => {
                        const sections = parseComparisonSections(drawerRecords);
                        if (!sections || sections.length === 0) return null;
                        return (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="overline" sx={{ fontWeight: 700 }}>Reconciliation summary</Typography>
                                {sections.map((s, i) => <ComparisonCard key={i} section={s} />)}
                            </Box>
                        );
                    })()}

                    <Typography variant="overline" sx={{ fontWeight: 700 }}>Detailed records</Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                        Raw rows from the check. Rows starting with <code>──</code> mark sections. Rows after <code>── Difference records ──</code> show where the extra ledger entries come from.
                    </Typography>
                    {drawerError && (
                        <Alert severity="error" sx={{ mb: 1 }}>Records load failed: {drawerError}</Alert>
                    )}
                    {drawerLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                    ) : drawerRecords.length === 0 ? (
                        <Typography color="textSecondary">No detailed records available.</Typography>
                    ) : (
                        <>
                            {drawerTruncated && (
                                <Alert severity="warning" sx={{ mb: 1 }}>
                                    Showing the first 500 offending records only. Use CSV export for the full list.
                                </Alert>
                            )}
                            <Box sx={{ overflow: 'auto' }}>
                                <Table size="small" sx={{ '& td, & th': { fontSize: 13 } }}>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            {Object.keys(drawerRecords[0]).map((k) => (
                                                <TableCell key={k}
                                                    align={isAmountCol(k) || isCountCol(k) ? 'right' : 'left'}
                                                    sx={{ fontWeight: 700, color: '#424242' }}>
                                                    {prettyHeader(k)}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {drawerRecords.map((row, idx) => {
                                            const columns = Object.keys(drawerRecords[0]);
                                            // A "section header" row has first column containing text AND numeric columns are NULL/—
                                            const firstVal = row[columns[0]];
                                            const numericAllNull = columns
                                                .filter((k) => k !== columns[0] && isAmountCol(k))
                                                .every((k) => row[k] === null || row[k] === undefined);
                                            const isSection = typeof firstVal === 'string' && numericAllNull
                                                && /^[▼▲]|─|===|^▸|^#/.test(firstVal.trim().charAt(0) || '')
                                                ? true
                                                : (typeof firstVal === 'string'
                                                    && /^[▼▲]/.test(firstVal.trim()))
                                                    && numericAllNull;
                                            const bg = isSection ? '#e3f2fd' : (idx % 2 === 0 ? 'transparent' : '#fafafa');

                                            return (
                                                <TableRow key={idx} sx={{ bgcolor: bg, '&:hover': { bgcolor: '#fff9c4' } }}>
                                                    {columns.map((k) => {
                                                        const v = row[k];
                                                        const isNull = v === null || v === undefined || v === '';
                                                        let display;
                                                        let cellSx = {};

                                                        if (isNull) {
                                                            display = '—';
                                                            cellSx.color = '#bbb';
                                                        } else if (isSection) {
                                                            display = String(v);
                                                            cellSx = { fontWeight: 700, color: '#0d47a1' };
                                                        } else if (isIdCol(k)) {
                                                            // Plain integer-style: no decimals, no thousands separator
                                                            display = String(v);
                                                            cellSx = { fontFamily: 'monospace', color: '#666' };
                                                        } else if (isDateCol(k)) {
                                                            display = formatDate(v);
                                                        } else if (isCountCol(k)) {
                                                            // Counts: integer with thousands separator, no decimals
                                                            const num = Number(v);
                                                            display = Number.isFinite(num) ? Math.round(num).toLocaleString('en-IN') : String(v);
                                                            cellSx = { fontFamily: 'monospace', whiteSpace: 'nowrap' };
                                                        } else if (isAmountCol(k)) {
                                                            const num = Number(v);
                                                            display = Number.isFinite(num) ? formatINR(v) : String(v);
                                                            cellSx = {
                                                                fontFamily: 'monospace',
                                                                fontWeight: 500,
                                                                color: num < 0 ? '#d32f2f' : 'inherit',
                                                                whiteSpace: 'nowrap',
                                                            };
                                                        } else {
                                                            const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
                                                            display = s.length > 120 ? s.slice(0, 117) + '…' : s;
                                                        }

                                                        return (
                                                            <TableCell key={k}
                                                                align={isAmountCol(k) || isCountCol(k) ? 'right' : 'left'}
                                                                sx={cellSx}>
                                                                {display}
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    {drawerFinding && drawerFinding.issue_count > 0 && (
                        <Button startIcon={<DownloadIcon />} onClick={() => exportCsv(drawerFinding.id)}>
                            Export CSV
                        </Button>
                    )}
                    <Button onClick={closeDrawer}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AuditDashboard;
