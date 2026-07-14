import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, Paper, Button, Chip, CircularProgress, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent,
    Alert, LinearProgress, Tooltip, Divider, Autocomplete,
    Tabs, Tab,
} from '@mui/material';
import { useSelector } from 'react-redux';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CalculateIcon from '@mui/icons-material/Calculate';
import PaymentsIcon from '@mui/icons-material/Payments';
import UndoIcon from '@mui/icons-material/Undo';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import SyncIcon from '@mui/icons-material/Sync';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TableChartIcon from '@mui/icons-material/TableChart';
import DownloadIcon from '@mui/icons-material/Download';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import instance from '../../../http-common';
import { getsessionStorage } from '../../common/login/cookies';
import { exportCSV } from '../reports/reportUtils';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const RETURN_TYPES = ['GSTR-1', 'GSTR-3B'];
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/;

// Indian number formatting for ₹ amounts.
const formatINR = (v) => {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    const sign = n < 0 ? '-' : '';
    const [whole, frac] = Math.abs(n).toFixed(2).split('.');
    let x = whole, out = '';
    if (x.length > 3) {
        out = ',' + x.slice(-3); x = x.slice(0, -3);
        while (x.length > 2) { out = ',' + x.slice(-2) + out; x = x.slice(0, -2); }
        out = x + out;
    } else { out = x; }
    return sign + out + '.' + frac;
};

const currentFY = () => {
    const now = new Date();
    const m = now.getMonth() + 1;
    return m >= 4 ? now.getFullYear() : now.getFullYear() - 1;
};

const statusChip = (status) => {
    // Soft-fill palette: subtle background, saturated text. Reads cleaner than solid fills.
    const palette = {
        filed:     { bg: '#e6f4ea', fg: '#1e6c35' },
        revised:   { bg: '#fff4e5', fg: '#b05a00' },
        cancelled: { bg: '#fdecea', fg: '#a6281f' },
        draft:     { bg: '#eef1f5', fg: '#546e7a' },
        unfiled:   { bg: '#eef1f5', fg: '#546e7a' },
    };
    const p = palette[status] || palette.unfiled;
    return <Chip size="small" label={String(status).toUpperCase()}
        sx={{ bgcolor: p.bg, color: p.fg, fontWeight: 700, letterSpacing: 0.3, fontSize: 10, height: 22 }} />;
};

const emptyFigures = () => ({
    output_cgst: 0, output_sgst: 0, output_igst: 0, output_cess: 0,
    itc_cgst_claimed: 0, itc_sgst_claimed: 0, itc_igst_claimed: 0, itc_cess_claimed: 0,
    itc_cgst_reversed: 0, itc_sgst_reversed: 0, itc_igst_reversed: 0, itc_cess_reversed: 0,
    rcm_liability: 0, interest_paid: 0, late_fee_paid: 0, net_cash_payable: 0,
});

// Shared table styling — the tables are inlined (not MUI Table) because rows
// need custom coloring per cell; these constants keep the look uniform.
const tableHeaderRowStyle = {
    background: '#f7f9fc',
    position: 'sticky',
    top: 0,
    zIndex: 1,
};
const thStyle = (align = 'left') => ({
    textAlign: align,
    padding: '10px 12px',
    fontSize: 11,
    fontWeight: 700,
    color: '#607d8b',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    borderBottom: '1px solid #e0e4ea',
    whiteSpace: 'nowrap',
});
const tableRowStyle = { transition: 'background 120ms' };
const tdStyle = (align = 'left', opts = {}) => ({
    textAlign: align,
    padding: '10px 12px',
    fontSize: 13,
    color: opts.color || (opts.muted ? '#90a4ae' : '#263238'),
    fontFamily: opts.mono ? 'monospace' : undefined,
    fontWeight: opts.bold ? 600 : 400,
    borderBottom: '1px solid #eef1f5',
    ...(opts.fontSize ? { fontSize: opts.fontSize } : {}),
});

const KpiCard = ({ label, value, suffix, hint, accent = '#455a64', progressPct }) => (
    <Box sx={{
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: '1px solid #e0e4ea',
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 86,
    }}>
        <Typography variant="caption" sx={{ color: '#78909c', fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', fontSize: 10 }}>
            {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.25 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: accent, fontFamily: 'monospace', lineHeight: 1 }}>
                {value}
            </Typography>
            {suffix && <Typography variant="body2" sx={{ color: '#90a4ae', fontFamily: 'monospace' }}>{suffix}</Typography>}
        </Box>
        {typeof progressPct === 'number' && (
            <LinearProgress variant="determinate" value={progressPct}
                sx={{ mt: 0.75, height: 4, borderRadius: 2,
                      '& .MuiLinearProgress-bar': { bgcolor: accent } }} />
        )}
        {hint && <Typography variant="caption" sx={{ color: '#90a4ae', mt: 0.5, fontSize: 11 }}>{hint}</Typography>}
    </Box>
);

const GstReturns = () => {
    const storage = getsessionStorage();
    const role = storage?.role_name;
    const isAdmin = role === 'Administrator';
    const canFile = isAdmin || role === 'Accountant';

    // GSTIN sourced from pos_company / app_config_data via Redux — per decision 4.
    const { appConfigReducer: { app_config_data } } = useSelector((state) => state);
    const tenantGstin = useMemo(() => {
        if (!Array.isArray(app_config_data)) return '';
        const row = app_config_data.find((x) => x && (x.key_name === 'company.gstin/uin' || x.key_name === 'company.gstin'));
        return row && row.value ? String(row.value).toUpperCase().trim() : '';
    }, [app_config_data]);

    // Multi-GSTIN support — the active GSTIN scopes all list views. Default to
    // the tenant's primary GSTIN from app_config; user can switch if the tenant
    // has multiple registrations.
    const [activeGstin, setActiveGstin] = useState('');
    useEffect(() => {
        if (!activeGstin && tenantGstin) setActiveGstin(tenantGstin);
    }, [tenantGstin, activeGstin]);

    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Ledger list — fetched once on mount and reused by every ledger-picker on this page.
    // We filter to items with a stable id + name so the Autocomplete stays predictable.
    const [ledgers, setLedgers] = useState([]);

    // Source-row pickers for the ITC Reversal dialog (receiving / expense line /
    // vendor note). Loaded lazily the first time the dialog opens.
    const [revReceivings, setRevReceivings] = useState([]);
    const [revExpenses, setRevExpenses] = useState([]);
    const [revNotes, setRevNotes] = useState([]);
    const [revSourcesLoaded, setRevSourcesLoaded] = useState(false);

    // Net GST liability report — lazy-loaded when the user clicks "Refresh".
    const [report, setReport] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState(null);

    // Filters
    const [filterYear, setFilterYear] = useState(currentFY());
    const [filterReturn, setFilterReturn] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Main navigation — Periods / Liability / Reversals / 2B reconciliation.
    const [mainTab, setMainTab] = useState(0);
    const [helpOpen, setHelpOpen] = useState(false);

    // Mark Filed dialog
    const [markOpen, setMarkOpen] = useState(false);
    const [markSubmitting, setMarkSubmitting] = useState(false);
    const [markError, setMarkError] = useState(null);
    const [markForm, setMarkForm] = useState({
        gstin: '', return_type: 'GSTR-3B',
        period_year: currentFY(), period_month: (new Date()).getMonth() + 1,
        arn: '', notes: '',
        figures: emptyFigures(),
    });

    // Reopen dialog
    const [reopenTarget, setReopenTarget] = useState(null);
    const [reopenNote, setReopenNote] = useState('');

    // ITC Reversal list + dialog
    const [reversals, setReversals] = useState([]);
    const [revLoading, setRevLoading] = useState(false);
    const [revOpen, setRevOpen] = useState(false);
    const [revSubmitting, setRevSubmitting] = useState(false);
    const [revError, setRevError] = useState(null);
    const [revForm, setRevForm] = useState({
        rule: 'blocked_credit_17_5',
        period_year: currentFY(), period_month: (new Date()).getMonth() + 1,
        reversed_cgst: 0, reversed_sgst: 0, reversed_igst: 0, reversed_cess: 0,
        expense_ledger_id: '',
        source_receiving_id: '', source_expense_id: '', source_manual_note_id: '',
        notes: '',
    });

    // GSTR-2B uploads + reconciliation
    const [uploads, setUploads] = useState([]);
    const [uplLoading, setUplLoading] = useState(false);
    const [uplOpen, setUplOpen] = useState(false);
    const [uplSubmitting, setUplSubmitting] = useState(false);
    const [uplError, setUplError] = useState(null);
    const [uplForm, setUplForm] = useState({
        gstin: '', period_year: currentFY(), period_month: 1,
        file_name: '', json_content: '',
    });
    // Which upload is currently expanded (shows invoice-level detail).
    const [expandedUpload, setExpandedUpload] = useState(null);
    const [uplInvoices, setUplInvoices] = useState([]);
    const [uplInvFilter, setUplInvFilter] = useState('all');  // all | matched | mismatch | missing_in_books

    // Build Return Tables dialog — previews GSTR-1 / GSTR-3B tables for offline filing.
    const [rtOpen, setRtOpen] = useState(false);
    const [rtLoading, setRtLoading] = useState(false);
    const [rtError, setRtError] = useState(null);
    const [rtPayload, setRtPayload] = useState(null);
    const [rtContext, setRtContext] = useState({ type: 'GSTR-1', year: currentFY(), month: 1 });
    const [rtTab, setRtTab] = useState(0);

    // Record Challan Payment dialog
    const [payOpen, setPayOpen] = useState(false);
    const [paySubmitting, setPaySubmitting] = useState(false);
    const [payError, setPayError] = useState(null);
    const [payForm, setPayForm] = useState({
        gstin: '', period_year: currentFY(), period_month: 1,
        cin: '', challan_date: new Date().toISOString().slice(0, 10),
        bank_account_id: '', interest_ledger_id: '', late_fee_ledger_id: '',
        cgst_paid: 0, sgst_paid: 0, igst_paid: 0, cess_paid: 0,
        interest_paid: 0, late_fee_paid: 0, notes: '',
    });

    const fetchList = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await instance.get('/gstReturnPeriod/');
            setPeriods(Array.isArray(res.data && res.data.data) ? res.data.data : []);
        } catch (e) {
            setError((e && e.response && e.response.data && e.response.data.message) || e.message);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchList(); }, [fetchList]);

    // Load acc_account rows for the ledger pickers. Uses the dedicated GET
    // under gstItcReversal (returns {id, name, code}) — the original /ledger/
    // route is POST-shaped + paginated and returns acc_ledger_configuration.id,
    // which is NOT the FK target of acc_accounttransaction.accountId. Using the
    // wrong id caused posting failures in v4 when an accountant manually typed
    // a config id. This endpoint returns acc_account.id directly.
    useEffect(() => {
        (async () => {
            try {
                const res = await instance.get('/gstItcReversal/sources/accounts');
                const raw = Array.isArray(res.data && res.data.data) ? res.data.data : [];
                setLedgers(raw
                    .map((l) => ({ id: l.id, name: l.name || '', code: l.code || '' }))
                    .filter((l) => l.id && l.name));
            } catch (_) { /* dropdowns gracefully fall back to numeric input if load fails */ }
        })();
    }, []);

    // Header strip for full-screen "pages" (dialogs rendered with fullScreen prop).
    // Same visual language as the sticky toolbar above: white paper, thin bottom
    // border, title on the left, optional subtitle, X close button on the right.
    const FullScreenHeader = ({ title, subtitle, onClose, right }) => (
        <Box sx={{
            bgcolor: 'background.paper',
            borderBottom: '1px solid #e0e4ea',
            px: 3, py: 1.5,
            display: 'flex', alignItems: 'center', gap: 2,
            flexShrink: 0,
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>{title}</Typography>
                {subtitle && (
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', lineHeight: 1.3 }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
            {right}
            <IconButton size="small" onClick={onClose} aria-label="Close">
                <CloseIcon fontSize="small" />
            </IconButton>
        </Box>
    );

    // Inline full-screen subpage — renders as an absolute overlay inside the
    // GstReturns outer Box, so the app header + sidebar stay visible. Scroll
    // is internal to the body. Used in place of Dialog for the long forms +
    // table-viewer popups. The outer Box has `position: relative` so our
    // absolute positioning is bounded to the page content area.
    const SubPage = ({ title, subtitle, headerRight, onClose, children, footer }) => (
        <Box sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: '#f5f7fa',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 5,
        }}>
            <FullScreenHeader
                title={title}
                subtitle={subtitle}
                right={headerRight}
                onClose={onClose}
            />
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                {children}
            </Box>
            {footer && (
                <Box sx={{
                    bgcolor: 'background.paper',
                    borderTop: '1px solid #e0e4ea',
                    px: 3, py: 1.5,
                    display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: 'flex-end',
                    flexShrink: 0,
                }}>
                    {footer}
                </Box>
            )}
        </Box>
    );

    // One-shot derivation: exactly one of the 6 popup states may be open at a
    // time. When any is open, the main GST Returns page yields to the sub-page.
    const activeSubpage = markOpen ? 'markFiled'
        : revOpen ? 'itcReversal'
        : uplOpen ? 'upload2b'
        : payOpen ? 'challan'
        : rtOpen ? 'returnTables'
        : helpOpen ? 'help'
        : null;

    // Card-style section wrapper for subpage forms — gives each logical group
    // (Period, Output supplies, ITC claimed, …) a clear label + optional help
    // caption so the form reads like a document instead of a field dump.
    const Section = ({ title, hint, children, accent = '#607d8b' }) => (
        <Paper variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
            <Box sx={{
                px: 2, py: 1, bgcolor: '#f7f9fc',
                borderBottom: '1px solid #e0e4ea',
                display: 'flex', alignItems: 'center', gap: 1,
            }}>
                <Box sx={{ width: 3, height: 16, bgcolor: accent, borderRadius: 1 }} />
                <Typography variant="overline" sx={{ fontWeight: 700, color: '#37474f', lineHeight: 1 }}>
                    {title}
                </Typography>
                {hint && (
                    <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                        — {hint}
                    </Typography>
                )}
            </Box>
            <Box sx={{ p: 2 }}>{children}</Box>
        </Paper>
    );

    // Compact dd-MMM-yy date formatter for picker option labels.
    const formatDateShort = (d) => {
        if (!d) return '—';
        const dt = new Date(d);
        if (!Number.isFinite(dt.getTime())) return String(d).slice(0, 10);
        return `${String(dt.getDate()).padStart(2, '0')} ${MONTH_NAMES[dt.getMonth()]} ${String(dt.getFullYear()).slice(-2)}`;
    };

    // Generic source-row picker used by the ITC Reversal dialog. Falls back to
    // a plain number input if the option list hasn't loaded, so the form is
    // still usable if the /sources/* endpoints are unreachable.
    const SourcePicker = ({ label, options, getLabel, value, onChange }) => {
        if (!options || options.length === 0) {
            return (
                <TextField fullWidth size="small" type="number" label={label}
                    value={value || ''} onChange={(e) => onChange(e.target.value)}
                    helperText="list unavailable — enter id manually" />
            );
        }
        const current = value ? options.find((o) => String(o.id) === String(value)) : null;
        return (
            <Autocomplete
                size="small"
                options={options}
                getOptionLabel={(o) => (o ? getLabel(o) : '')}
                isOptionEqualToValue={(o, v) => o && v && String(o.id) === String(v.id)}
                value={current || null}
                onChange={(_, v) => onChange(v ? v.id : '')}
                renderInput={(params) => <TextField {...params} label={label} />}
            />
        );
    };

    // Reusable ledger picker. Falls back to a plain number input if the list
    // hasn't loaded — so the form still works even if /ledger/ is unreachable.
    const LedgerPicker = ({ label, value, onChange, helperText }) => {
        if (!ledgers || ledgers.length === 0) {
            return (
                <TextField fullWidth size="small" type="number" label={label}
                    value={value || ''} onChange={(e) => onChange(e.target.value)}
                    helperText={helperText || 'ledger list unavailable — enter id manually'} />
            );
        }
        const current = value ? ledgers.find((l) => String(l.id) === String(value)) : null;
        return (
            <Autocomplete
                size="small"
                options={ledgers}
                getOptionLabel={(o) => (o && o.name ? `${o.name}${o.code ? ` (${o.code})` : ''}` : '')}
                isOptionEqualToValue={(o, v) => o && v && String(o.id) === String(v.id)}
                value={current || null}
                onChange={(_, v) => onChange(v ? v.id : '')}
                renderInput={(params) => (
                    <TextField {...params} label={label} helperText={helperText} />
                )}
            />
        );
    };

    // ── Liability report ──
    const fetchReport = useCallback(async (fy) => {
        setReportLoading(true); setReportError(null);
        try {
            const res = await instance.get(`/gstReturnPeriod/liability-report/${fy}`);
            setReport((res.data && res.data.data) || null);
        } catch (e) {
            setReportError((e && e.response && e.response.data && e.response.data.message) || e.message);
        } finally { setReportLoading(false); }
    }, []);

    // Re-fetch report whenever the FY filter changes (or after a Mark Filed / Reopen).
    useEffect(() => { fetchReport(filterYear); }, [filterYear, fetchReport, periods.length]);

    // ── ITC Reversal list ──
    const fetchReversals = useCallback(async () => {
        setRevLoading(true);
        try {
            const res = await instance.get('/gstItcReversal/');
            setReversals(Array.isArray(res.data && res.data.data) ? res.data.data : []);
        } catch (e) { /* silent; section just stays empty */ }
        finally { setRevLoading(false); }
    }, []);

    useEffect(() => { fetchReversals(); }, [fetchReversals]);

    // Fetch source pickers the first time the user opens the ITC Reversal
    // dialog. All three lists are small (bounded to 300 rows) and the
    // Autocomplete filters client-side so no debounced search is needed.
    const loadRevSources = useCallback(async () => {
        try {
            const [recRes, expRes, noteRes] = await Promise.all([
                instance.get('/gstItcReversal/sources/receivings'),
                instance.get('/gstItcReversal/sources/expenses'),
                instance.get('/gstItcReversal/sources/notes'),
            ]);
            setRevReceivings((recRes.data && recRes.data.data) || []);
            setRevExpenses((expRes.data && expRes.data.data) || []);
            setRevNotes((noteRes.data && noteRes.data.data) || []);
            setRevSourcesLoaded(true);
        } catch (_) { /* silent; inputs fall back to raw number entry */ }
    }, []);

    useEffect(() => {
        if (revOpen && !revSourcesLoaded) loadRevSources();
    }, [revOpen, revSourcesLoaded, loadRevSources]);

    // ── GSTR-2B uploads list ──
    const fetchUploads = useCallback(async () => {
        setUplLoading(true);
        try {
            const res = await instance.get('/gst2b/uploads');
            setUploads(Array.isArray(res.data && res.data.data) ? res.data.data : []);
        } catch (_) { /* silent */ }
        finally { setUplLoading(false); }
    }, []);

    useEffect(() => { fetchUploads(); }, [fetchUploads]);

    // Fetch invoices for a specific upload (on expand). Pulls both the 2B side
    // AND the books-only pass in parallel so the "Books only" filter has data.
    const loadUploadInvoices = useCallback(async (uploadId) => {
        try {
            const [invRes, booksRes] = await Promise.all([
                instance.get(`/gst2b/uploads/${uploadId}/invoices`),
                instance.get(`/gst2b/uploads/${uploadId}/books-only`),
            ]);
            const twob = Array.isArray(invRes.data && invRes.data.data) ? invRes.data.data : [];
            const booksOnly = (Array.isArray(booksRes.data && booksRes.data.data) ? booksRes.data.data : [])
                // Tag each synthetic row so React can distinguish from 2B rows.
                .map((r) => ({ ...r, id: `books-${r.id}`, __books_only: true }));
            setUplInvoices([...twob, ...booksOnly]);
        } catch (_) { setUplInvoices([]); }
    }, []);

    const openUploadDialog = () => {
        setUplForm({
            gstin: activeGstin || tenantGstin,
            period_year: currentFY(),
            period_month: (new Date()).getMonth() + 1,
            file_name: '',
            json_content: '',
        });
        setUplError(null);
        setUplOpen(true);
    };

    const submitUpload = async () => {
        setUplError(null);
        if (!GSTIN_REGEX.test(uplForm.gstin)) { setUplError('GSTIN invalid'); return; }
        if (!uplForm.json_content || !uplForm.json_content.trim()) {
            setUplError('Paste the GSTN 2B JSON content'); return;
        }
        setUplSubmitting(true);
        try {
            const res = await instance.post('/gst2b/upload', uplForm);
            const newId = res.data && res.data.data && res.data.data.upload_id;
            // Immediately run reconcile so the user sees match results on return.
            if (newId) {
                try { await instance.post(`/gst2b/uploads/${newId}/reconcile`); }
                catch (_) { /* still show the upload even if reconcile failed */ }
            }
            setUplOpen(false);
            await fetchUploads();
            if (newId) {
                setExpandedUpload(newId);
                await loadUploadInvoices(newId);
            }
        } catch (e) {
            setUplError((e && e.response && e.response.data && e.response.data.message) || e.message);
        } finally { setUplSubmitting(false); }
    };

    const reconcileUpload = async (uploadId) => {
        try {
            await instance.post(`/gst2b/uploads/${uploadId}/reconcile`);
            await fetchUploads();
            if (expandedUpload === uploadId) await loadUploadInvoices(uploadId);
        } catch (e) {
            alert((e && e.response && e.response.data && e.response.data.message) || e.message);
        }
    };

    const deleteUpload = async (uploadId) => {
        if (!window.confirm('Delete this 2B upload? All invoices and match pointers will be cleared.')) return;
        try {
            await instance.delete(`/gst2b/uploads/${uploadId}`);
            if (expandedUpload === uploadId) { setExpandedUpload(null); setUplInvoices([]); }
            await fetchUploads();
        } catch (e) {
            alert((e && e.response && e.response.data && e.response.data.message) || e.message);
        }
    };

    const toggleExpandUpload = (uploadId) => {
        if (expandedUpload === uploadId) {
            setExpandedUpload(null);
            setUplInvoices([]);
        } else {
            setExpandedUpload(uploadId);
            loadUploadInvoices(uploadId);
        }
    };

    const matchStatusChip = (status) => {
        const map = {
            matched:          { bg: '#e6f4ea', fg: '#1e6c35', label: 'MATCHED' },
            mismatch:         { bg: '#fff4e5', fg: '#b05a00', label: 'MISMATCH' },
            missing_in_books: { bg: '#fdecea', fg: '#a6281f', label: 'MISSING IN BOOKS' },
            books_only:       { bg: '#eceff1', fg: '#455a64', label: 'BOOKS ONLY' },
            unmatched:        { bg: '#f5f5f5', fg: '#757575', label: 'UNMATCHED' },
        };
        const m = map[status] || map.unmatched;
        return <Chip size="small" label={m.label}
            sx={{ bgcolor: m.bg, color: m.fg, fontFamily: 'monospace', fontSize: 10, fontWeight: 700, height: 22 }} />;
    };

    // Filtered invoices for the expanded upload.
    const visibleUplInvoices = useMemo(() => {
        if (uplInvFilter === 'all') return uplInvoices;
        return uplInvoices.filter((i) => i.match_status === uplInvFilter);
    }, [uplInvoices, uplInvFilter]);

    const submitReversal = async () => {
        setRevError(null);
        const total = ['reversed_cgst','reversed_sgst','reversed_igst','reversed_cess']
            .reduce((acc, k) => acc + Number(revForm[k] || 0), 0);
        if (total <= 0) { setRevError('at least one reversed amount must be > 0'); return; }
        if (!revForm.expense_ledger_id) { setRevError('expense ledger id required'); return; }
        setRevSubmitting(true);
        try {
            const body = { ...revForm };
            ['source_receiving_id','source_expense_id','source_manual_note_id'].forEach((k) => {
                if (!body[k]) delete body[k];
            });
            await instance.post('/gstItcReversal/', body);
            setRevOpen(false);
            await fetchReversals();
        } catch (e) {
            setRevError((e && e.response && e.response.data && e.response.data.message) || e.message);
        } finally { setRevSubmitting(false); }
    };

    // Union of GSTINs discovered from tenant config + actual data seen so far.
    // Keeps the dropdown honest even if the user has filed under a GSTIN that
    // was later removed from app_config.
    const availableGstins = useMemo(() => {
        const set = new Set();
        if (tenantGstin) set.add(tenantGstin);
        for (const p of periods) if (p.gstin) set.add(p.gstin);
        for (const u of uploads) if (u.gstin) set.add(u.gstin);
        return Array.from(set).sort();
    }, [tenantGstin, periods, uploads]);

    // Derived: visible rows per filters + FY window + active GSTIN.
    const visiblePeriods = useMemo(() => {
        const inFY = (p) => {
            const y = Number(p.period_year); const m = Number(p.period_month);
            return (y === Number(filterYear) && m >= 4) || (y === Number(filterYear) + 1 && m <= 3);
        };
        return periods.filter((p) => inFY(p)
            && (!activeGstin || p.gstin === activeGstin)
            && (filterReturn === 'ALL' || p.return_type === filterReturn)
            && (filterStatus === 'ALL' || p.status === filterStatus));
    }, [periods, filterYear, filterReturn, filterStatus, activeGstin]);

    // Per-GSTIN filtered uploads (2B reconciliation).
    const visibleUploads = useMemo(
        () => uploads.filter((u) => !activeGstin || u.gstin === activeGstin),
        [uploads, activeGstin],
    );

    // Most recent past month with no filed return of the given type under the
    // active GSTIN. Default used whenever Mark Filed opens without a row prefill.
    // GSTR-1 and GSTR-3B have independent filing calendars — e.g. GSTR-3B for Mar
    // filed, GSTR-1 for Mar not filed — so the default must be type-aware to
    // avoid silently cross-filing the wrong month.
    const lastUnfiledMonthFor = useCallback((returnType) => {
        const type = returnType || 'GSTR-3B';
        const now = new Date();
        const curYear = now.getFullYear();
        const curMonth = now.getMonth() + 1;
        const filedSet = new Set();
        for (const p of periods) {
            if (p.return_type === type && p.status === 'filed'
                && (!activeGstin || p.gstin === activeGstin)) {
                filedSet.add(`${p.period_year}-${p.period_month}`);
            }
        }
        for (let i = 1; i <= 18; i++) {
            const d = new Date(curYear, curMonth - 1 - i, 1);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            if (y < 2017) break;
            if (!filedSet.has(`${y}-${m}`)) return { year: y, month: m };
        }
        const d = new Date(curYear, curMonth - 2, 1);
        return { year: d.getFullYear(), month: d.getMonth() + 1 };
    }, [periods, activeGstin]);

    // Backwards-compatible alias used by non-Mark-Filed callers.
    const lastUnfiledMonth = useMemo(() => lastUnfiledMonthFor('GSTR-3B'), [lastUnfiledMonthFor]);

    // Most recent *filed* GSTR-3B month — challan payments reconcile against a
    // filed period's declared figures, so "last filed" is the right default
    // rather than "last unfiled". Falls back to lastUnfiledMonth when nothing
    // has been filed yet (user is recording an advance payment).
    const lastFiledGstr3bMonth = useMemo(() => {
        const filed = periods
            .filter((p) => p.return_type === 'GSTR-3B' && p.status === 'filed'
                && (!activeGstin || p.gstin === activeGstin))
            .map((p) => ({ year: Number(p.period_year), month: Number(p.period_month) }))
            .sort((a, b) => (b.year - a.year) || (b.month - a.month));
        return filed[0] || lastUnfiledMonth;
    }, [periods, activeGstin, lastUnfiledMonth]);

    // Progress card — denominator is data-driven: count of months in the FY
    // that are (a) at or after the tenant's first-activity month, and (b)
    // before the current calendar month (i.e. the filing period is closed).
    // Multiplied by 2 when both GSTR-1 + GSTR-3B are in scope. Tenants who
    // onboarded mid-FY (e.g. May 2025) see 11 × 2 = 22, not 24.
    const progress = useMemo(() => {
        const firstActivityDate = report && report.first_activity_date;
        // Default activity start to April 1 of the FY when we don't know yet —
        // on first render before the liability report loads.
        const activityStart = firstActivityDate
            ? new Date(firstActivityDate)
            : new Date(filterYear, 3, 1); // Apr 1 of the FY
        const activityY = activityStart.getFullYear();
        const activityM = activityStart.getMonth() + 1;

        const now = new Date();
        const curY = now.getFullYear();
        const curM = now.getMonth() + 1;

        // Iterate the 12 months of the FY (Apr fy → Mar fy+1) and count the
        // ones that qualify. Tiny loop, cheap.
        let activeMonths = 0;
        for (let i = 0; i < 12; i++) {
            const m = ((i + 3) % 12) + 1;                // 4..12, 1..3
            const y = m >= 4 ? Number(filterYear) : Number(filterYear) + 1;
            const afterActivityStart = (y > activityY) || (y === activityY && m >= activityM);
            const beforeCurrent      = (y < curY)       || (y === curY       && m < curM);
            if (afterActivityStart && beforeCurrent) activeMonths += 1;
        }
        const multiplier = filterReturn === 'ALL' ? 2 : 1;
        const expected = activeMonths * multiplier;
        const filed = visiblePeriods.filter((p) => p.status === 'filed').length;
        const pct = expected > 0 ? Math.round(filed / expected * 100) : 0;
        return { filed, expected, pct };
    }, [visiblePeriods, filterReturn, filterYear, report]);

    // ── Mark Filed workflow ──
    const openMarkDialog = (prefill = null) => {
        const returnType = prefill && prefill.return_type ? prefill.return_type : 'GSTR-3B';
        const typeDefault = lastUnfiledMonthFor(returnType);
        const defaultYear = prefill ? Number(prefill.period_year) : typeDefault.year;
        const defaultMonth = prefill ? Number(prefill.period_month) : typeDefault.month;
        setMarkForm({
            gstin: activeGstin || tenantGstin,
            return_type: returnType,
            period_year: defaultYear,
            period_month: defaultMonth,
            arn: '', notes: '',
            figures: emptyFigures(),
        });
        setMarkError(null);
        setMarkOpen(true);

        // Immediately fetch books figures for the default month so the user
        // doesn't need to click "Compute from Books" for the common path.
        if (!prefill) {
            instance.post('/gstReturnPeriod/compute-books', {
                period_year: defaultYear, period_month: defaultMonth,
            }).then((res) => {
                const figs = (res.data && res.data.data) || null;
                if (figs) setMarkForm((prev) => ({ ...prev, figures: { ...emptyFigures(), ...figs } }));
            }).catch(() => { /* non-fatal — user can still click Compute */ });
        }
    };

    const computeBooks = async () => {
        setMarkError(null);
        try {
            const res = await instance.post('/gstReturnPeriod/compute-books', {
                period_year: markForm.period_year,
                period_month: markForm.period_month,
            });
            const figs = (res.data && res.data.data) || emptyFigures();
            setMarkForm((prev) => ({ ...prev, figures: { ...emptyFigures(), ...figs } }));
        } catch (e) {
            setMarkError((e && e.response && e.response.data && e.response.data.message) || e.message);
        }
    };

    const updateFigure = (key, val) => {
        const n = Number(val);
        setMarkForm((prev) => {
            const fig = { ...prev.figures, [key]: Number.isFinite(n) ? n : 0 };
            // Recompute net_cash_payable live.
            const output = fig.output_cgst + fig.output_sgst + fig.output_igst + fig.output_cess;
            const claimed = fig.itc_cgst_claimed + fig.itc_sgst_claimed + fig.itc_igst_claimed + fig.itc_cess_claimed;
            const reversed = fig.itc_cgst_reversed + fig.itc_sgst_reversed + fig.itc_igst_reversed + fig.itc_cess_reversed;
            fig.net_cash_payable = Number((output - claimed + reversed + fig.rcm_liability + fig.interest_paid + fig.late_fee_paid).toFixed(2));
            return { ...prev, figures: fig };
        });
    };

    const submitMarkFiled = async () => {
        setMarkError(null);
        if (!GSTIN_REGEX.test(markForm.gstin)) { setMarkError('GSTIN looks invalid'); return; }
        if (!RETURN_TYPES.includes(markForm.return_type)) { setMarkError('pick return type'); return; }
        setMarkSubmitting(true);
        try {
            await instance.post('/gstReturnPeriod/mark-filed', markForm);
            setMarkOpen(false);

            // Nav to the FY containing the filed period so the row is visible
            // on return — avoids the "did my filing actually save?" moment when
            // the selector was on a different FY.
            const m = Number(markForm.period_month);
            const y = Number(markForm.period_year);
            const filedFY = m >= 4 ? y : y - 1;
            if (filedFY !== filterYear) setFilterYear(filedFY);
            setMainTab(0);

            await fetchList();
        } catch (e) {
            setMarkError((e && e.response && e.response.data && e.response.data.message) || e.message);
        } finally { setMarkSubmitting(false); }
    };

    // ── Record Challan Payment workflow ──
    const openPayDialog = (prefill = null) => {
        setPayForm({
            gstin: activeGstin || tenantGstin,
            period_year: prefill ? Number(prefill.period_year) : lastFiledGstr3bMonth.year,
            period_month: prefill ? Number(prefill.period_month) : lastFiledGstr3bMonth.month,
            cin: '', challan_date: new Date().toISOString().slice(0, 10),
            bank_account_id: '', interest_ledger_id: '', late_fee_ledger_id: '',
            // Pre-fill with declared amounts if available on the prefill period row
            cgst_paid: prefill && prefill.declared ? prefill.declared.output_cgst - prefill.declared.itc_cgst_claimed + prefill.declared.itc_cgst_reversed : 0,
            sgst_paid: prefill && prefill.declared ? prefill.declared.output_sgst - prefill.declared.itc_sgst_claimed + prefill.declared.itc_sgst_reversed : 0,
            igst_paid: prefill && prefill.declared ? prefill.declared.output_igst - prefill.declared.itc_igst_claimed + prefill.declared.itc_igst_reversed : 0,
            cess_paid: prefill && prefill.declared ? prefill.declared.output_cess - prefill.declared.itc_cess_claimed + prefill.declared.itc_cess_reversed : 0,
            interest_paid: 0, late_fee_paid: 0, notes: '',
        });
        setPayError(null);
        setPayOpen(true);
    };

    const submitPayment = async () => {
        setPayError(null);
        if (!GSTIN_REGEX.test(payForm.gstin)) { setPayError('GSTIN invalid'); return; }
        if (!payForm.cin) { setPayError('CIN required'); return; }
        if (!payForm.bank_account_id) { setPayError('Bank account ledger id required'); return; }
        const total = ['cgst_paid','sgst_paid','igst_paid','cess_paid','interest_paid','late_fee_paid']
            .reduce((acc, k) => acc + Number(payForm[k] || 0), 0);
        if (total <= 0) { setPayError('at least one payment amount must be > 0'); return; }
        setPaySubmitting(true);
        try {
            const body = { ...payForm };
            // Drop empty optional ledger ids so the backend validator doesn't try to coerce ''.
            if (!body.interest_ledger_id) delete body.interest_ledger_id;
            if (!body.late_fee_ledger_id) delete body.late_fee_ledger_id;
            await instance.post('/gstPayment/', body);
            setPayOpen(false);
            await fetchList();
            await fetchReport(filterYear);
        } catch (e) {
            setPayError((e && e.response && e.response.data && e.response.data.message) || e.message);
        } finally { setPaySubmitting(false); }
    };

    // ── Build Return Tables (GSTR-1 / GSTR-3B preview) ──
    const openReturnTables = async (period) => {
        const type = period.return_type === 'GSTR-1' ? 'GSTR-1' : 'GSTR-3B';
        setRtContext({ type, year: Number(period.period_year), month: Number(period.period_month) });
        setRtTab(0);
        setRtOpen(true);
        setRtError(null);
        setRtPayload(null);
        setRtLoading(true);
        try {
            const path = type === 'GSTR-1' ? 'gstr1' : 'gstr3b';
            const res = await instance.get(`/gstReport/${path}/${period.period_year}/${period.period_month}`);
            setRtPayload((res.data && res.data.data) || null);
        } catch (e) {
            setRtError((e && e.response && e.response.data && e.response.data.message) || e.message);
        } finally { setRtLoading(false); }
    };

    // ── Reopen workflow ──
    const submitReopen = async () => {
        if (!reopenTarget) return;
        try {
            await instance.post(`/gstReturnPeriod/${reopenTarget.id}/reopen`, { note: reopenNote });
            setReopenTarget(null); setReopenNote('');
            await fetchList();
        } catch (e) {
            alert((e && e.response && e.response.data && e.response.data.message) || e.message);
        }
    };

    const declaredYtd = (report && report.total && report.total.declared_net_payable) || 0;
    const paidYtd = (report && report.total && report.total.total_paid) || 0;
    const outstandingYtd = (report && report.total && report.total.total_outstanding) || 0;
    const driftYtd = (report && report.total && report.total.total_drift) || 0;

    return (
        <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column',
            bgcolor: '#f5f7fa', overflow: 'hidden', position: 'relative' }}>
            {/* Sticky toolbar — wraps at narrow widths so button labels don't
                crunch to two lines at ≤1280. */}
            <Box sx={{
                bgcolor: 'background.paper', borderBottom: '1px solid #e0e4ea',
                px: 3, py: 1.25, display: 'flex', alignItems: 'center',
                gap: 1.5, rowGap: 1, flexWrap: 'wrap',
                flexShrink: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                '& .MuiButton-root': { whiteSpace: 'nowrap', flexShrink: 0 },
            }}>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1 }}>GST Returns</Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                        File GSTR-1 / GSTR-3B and reconcile with books
                    </Typography>
                </Box>

                <Box sx={{ flex: 1 }} />

                <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>FY</InputLabel>
                    <Select label="FY" value={filterYear}
                        onChange={(e) => setFilterYear(Number(e.target.value))}>
                        {[0, 1, 2, 3, 4].map((offset) => {
                            const y = currentFY() - offset;
                            return <MenuItem key={y} value={y}>FY {y}-{String(y + 1).slice(-2)}</MenuItem>;
                        })}
                    </Select>
                </FormControl>

                {availableGstins.length > 0 && (
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>GSTIN</InputLabel>
                        <Select label="GSTIN" value={activeGstin || ''}
                            onChange={(e) => setActiveGstin(e.target.value)}>
                            {availableGstins.map((g) => (
                                <MenuItem key={g} value={g} sx={{ fontFamily: 'monospace', fontSize: 13 }}>{g}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                <Tooltip title="Refresh"><span>
                    <IconButton size="small" disabled={loading}
                        onClick={() => {
                            // Refresh re-fetches every data slice the page shows —
                            // periods, liability report (drives KPIs), reversal log,
                            // 2B upload list. Previously only fetchList ran, so KPIs
                            // went stale after out-of-band mutations (another tab or
                            // a direct API call from a different user). BUG-18.
                            fetchList();
                            fetchReport(filterYear);
                            fetchReversals();
                            fetchUploads();
                        }}>
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                </span></Tooltip>

                <Tooltip title="How to use this page">
                    <IconButton size="small" onClick={() => setHelpOpen(true)}>
                        <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                {canFile && (
                    <>
                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                        <Button size="small" variant="outlined" startIcon={<CloudUploadIcon />}
                            onClick={openUploadDialog}>Upload 2B</Button>
                        <Button size="small" variant="outlined" startIcon={<UndoIcon />}
                            onClick={() => { setRevError(null); setRevOpen(true); }}>ITC Reversal</Button>
                        <Button size="small" variant="outlined" startIcon={<PaymentsIcon />}
                            onClick={() => openPayDialog(null)}>Challan</Button>
                        <Button size="small" variant="contained" startIcon={<PlayArrowIcon />}
                            onClick={() => openMarkDialog(null)}>Mark Filed</Button>
                    </>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ m: 2, mb: 0 }}>{error}</Alert>}

            {/* KPI row */}
            <Box sx={{
                px: 3, pt: 2, pb: 1.5, display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)', gap: 1.5, flexShrink: 0,
            }}>
                <KpiCard label="Filing Progress" value={`${progress.filed}`} suffix={`/ ${progress.expected}`}
                    hint={progress.expected === 0 ? 'no periods due yet'
                        : progress.filed === progress.expected ? 'all filed'
                        : `${progress.expected - progress.filed} pending`}
                    accent={progress.expected === 0 ? '#607d8b'
                        : progress.filed === progress.expected ? '#2e7d32'
                        : '#ef6c00'}
                    progressPct={progress.pct} />
                <KpiCard label="Declared YTD" value={`₹${formatINR(declaredYtd)}`}
                    hint="from filed snapshots" accent="#455a64" />
                <KpiCard label="Paid YTD" value={`₹${formatINR(paidYtd)}`}
                    hint="via recorded challans" accent="#2e7d32" />
                <KpiCard label="Outstanding" value={`₹${formatINR(outstandingYtd)}`}
                    hint="declared minus paid"
                    accent={outstandingYtd > 1 ? '#d32f2f' : '#2e7d32'} />
                <KpiCard label="Drift" value={`₹${formatINR(driftYtd)}`}
                    hint="books vs declared"
                    accent={Math.abs(driftYtd) > 1 ? '#d32f2f' : '#2e7d32'} />
            </Box>

            {/* Tab bar */}
            <Box sx={{ px: 3, bgcolor: 'background.paper',
                borderTop: '1px solid #e0e4ea', borderBottom: '1px solid #e0e4ea',
                flexShrink: 0 }}>
                <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)}
                    sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 600, fontSize: 13 } }}>
                    <Tab label={`Return Periods (${visiblePeriods.length})`} />
                    <Tab label="Net Liability" />
                    <Tab label={`ITC Reversal Log (${reversals.length})`} />
                    <Tab label={`GSTR-2B Recon (${visibleUploads.length})`} />
                </Tabs>
            </Box>

            {/* Scrollable content area */}
            <Box sx={{
                flex: 1, overflow: 'auto', p: 3,
                '& tbody tr:hover > td': { background: '#f7f9fc' },
            }}>
            {mainTab === 0 && (
            <>
            {/* Inline filters for Periods tab */}
            <Paper variant="outlined" sx={{ p: 1.5, mb: 2, display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="overline" sx={{ fontWeight: 700, color: '#607d8b' }}>Filter</Typography>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Return Type</InputLabel>
                    <Select label="Return Type" value={filterReturn} onChange={(e) => setFilterReturn(e.target.value)}>
                        <MenuItem value="ALL">All</MenuItem>
                        {RETURN_TYPES.map((rt) => <MenuItem key={rt} value={rt}>{rt}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Status</InputLabel>
                    <Select label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <MenuItem value="ALL">All</MenuItem>
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="filed">Filed</MenuItem>
                        <MenuItem value="revised">Revised</MenuItem>
                    </Select>
                </FormControl>
                <Box sx={{ flex: 1 }} />
                {activeGstin && <Chip size="small" variant="outlined" label={`GSTIN · ${activeGstin}`}
                    sx={{ fontFamily: 'monospace', fontSize: 11 }} />}
            </Paper>

            {/* ── Periods table ── */}
            <Paper variant="outlined">
                {loading ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box>
                ) : visiblePeriods.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center', color: '#90a4ae' }}>
                        <Typography variant="body2">No returns for this filter.</Typography>
                        <Typography variant="caption">Click <strong>Mark Filed</strong> above to record your first one.</Typography>
                    </Box>
                ) : (
                    <Box sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 360px)' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
                        <thead>
                            <tr style={tableHeaderRowStyle}>
                                <th style={thStyle('left')}>Period</th>
                                <th style={thStyle('left')}>Return</th>
                                <th style={thStyle('left')}>GSTIN</th>
                                <th style={thStyle('left')}>Status</th>
                                <th style={thStyle('left')}>ARN</th>
                                <th style={thStyle('right')}>Net Cash Payable</th>
                                <th style={thStyle('right')}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visiblePeriods.map((p) => (
                                <tr key={p.id} style={tableRowStyle}>
                                    <td style={tdStyle()}>{MONTH_NAMES[(p.period_month || 1) - 1]} {p.period_year}</td>
                                    <td style={tdStyle()}>{p.return_type}</td>
                                    <td style={tdStyle('left', { mono: true })}>{p.gstin}</td>
                                    <td style={tdStyle()}>{statusChip(p.status)}</td>
                                    <td style={tdStyle('left', { mono: true, muted: true })}>{p.arn || '—'}</td>
                                    <td style={tdStyle('right', { mono: true })}>
                                        {p.net_cash_payable != null ? `₹${formatINR(p.net_cash_payable)}` : '—'}
                                    </td>
                                    <td style={tdStyle('right')}>
                                        <Tooltip title={`Build ${p.return_type} tables for offline filing`}>
                                            <IconButton size="small" onClick={() => openReturnTables(p)}>
                                                <TableChartIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        {p.status === 'filed' ? (
                                            isAdmin && (
                                                <Tooltip title="Reopen (revised return)">
                                                    <IconButton size="small" onClick={() => setReopenTarget(p)}>
                                                        <LockOpenIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )
                                        ) : (
                                            canFile && (
                                                <Button size="small" variant="outlined" onClick={() => openMarkDialog(p)}>
                                                    Mark Filed
                                                </Button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </Box>
                )}
            </Paper>
            </>
            )}

            {mainTab === 1 && (
            <Paper variant="outlined">
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e4ea' }}>
                    <Typography variant="overline" sx={{ fontWeight: 700, color: '#455a64' }}>
                        Net GST Liability — FY {filterYear}-{String(filterYear + 1).slice(-2)} (GSTR-3B)
                    </Typography>
                    <Typography variant="caption" display="block" color="textSecondary">
                        Declared figures come from filed snapshots. A non-zero drift means the books no longer tie to what was declared.
                    </Typography>
                </Box>
                {reportError && <Alert severity="error" sx={{ m: 2 }}>{reportError}</Alert>}
                {reportLoading ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress size={24} /></Box>
                ) : !report ? (
                    <Box sx={{ p: 6, textAlign: 'center', color: '#90a4ae' }}>No liability data yet.</Box>
                ) : (
                    <Box sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 360px)' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
                        <thead>
                            <tr style={tableHeaderRowStyle}>
                                <th style={thStyle('left')}>Month</th>
                                <th style={thStyle('left')}>Status</th>
                                <th style={thStyle('right')}>Declared Payable</th>
                                <th style={thStyle('right')}>Paid</th>
                                <th style={thStyle('right')}>Outstanding</th>
                                <th style={thStyle('right')}>Current Payable</th>
                                <th style={thStyle('right')}>Drift</th>
                                <th style={thStyle('right')}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.rows.map((r) => {
                                const driftBad = r.drift !== null && Math.abs(r.drift) > 1;
                                const outstandingBad = r.outstanding !== null && r.outstanding > 1;
                                return (
                                    <tr key={`${r.period_year}-${r.period_month}`} style={tableRowStyle}>
                                        <td style={tdStyle()}>{MONTH_NAMES[r.period_month - 1]} {r.period_year}</td>
                                        <td style={tdStyle()}>{statusChip(r.status)}</td>
                                        <td style={tdStyle('right', { mono: true })}>
                                            {r.declared ? `₹${formatINR(r.declared.net_cash_payable)}` : '—'}
                                        </td>
                                        <td style={tdStyle('right', { mono: true, color: r.total_paid > 0 ? '#2e7d32' : '#90a4ae' })}>
                                            {r.total_paid > 0 ? `₹${formatINR(r.total_paid)}` : '—'}
                                        </td>
                                        <td style={tdStyle('right', {
                                            mono: true, bold: true,
                                            color: r.outstanding === null ? '#90a4ae' : outstandingBad ? '#d32f2f' : '#2e7d32',
                                        })}>
                                            {r.outstanding === null ? '—' : `₹${formatINR(r.outstanding)}`}
                                        </td>
                                        <td style={tdStyle('right', { mono: true })}>
                                            ₹{formatINR(r.current.net_cash_payable)}
                                        </td>
                                        <td style={tdStyle('right', {
                                            mono: true, bold: true,
                                            color: r.drift === null ? '#90a4ae' : driftBad ? '#d32f2f' : '#2e7d32',
                                        })}>
                                            {r.drift === null ? '—' : `₹${formatINR(r.drift)}`}
                                        </td>
                                        <td style={tdStyle('right')}>
                                            {canFile && r.declared && outstandingBad && (
                                                <Tooltip title="Record challan payment for this period">
                                                    <IconButton size="small" onClick={() => openPayDialog(r)}>
                                                        <PaymentsIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    </Box>
                )}
            </Paper>
            )}

            {/* ── Mark Filed — inline full-screen subpage ── */}
            {markOpen && (
            <SubPage
                title="Mark Period Filed"
                subtitle="Freezes books figures into a return snapshot and locks the month against back-dated posts."
                onClose={() => setMarkOpen(false)}
                footer={<>
                    <Button onClick={() => setMarkOpen(false)}>Cancel</Button>
                    <Button variant="contained" startIcon={<LockIcon />} onClick={submitMarkFiled} disabled={markSubmitting}>
                        {markSubmitting ? 'Filing…' : 'Mark Filed'}
                    </Button>
                </>}
            >
                    <Alert severity="info" icon={<LockIcon fontSize="small" />} sx={{ mb: 2 }}>
                        <strong>File on the GSTN portal first</strong>, then record it here. Marking filed freezes
                        these figures as the snapshot-of-record and locks the calendar month — back-dated posts to
                        this period will be blocked until an Administrator reopens it.
                    </Alert>
                    {markError && <Alert severity="error" sx={{ mb: 2 }}>{markError}</Alert>}

                    <Section title="Period" hint="which return and which month you're filing" accent="#1976d2">
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={3}>
                                <TextField fullWidth size="small" label="GSTIN" value={markForm.gstin}
                                    onChange={(e) => setMarkForm({ ...markForm, gstin: e.target.value.toUpperCase() })}
                                    helperText="From company config — verify before submit"
                                    InputProps={{ style: { fontFamily: 'monospace' } }} />
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Return Type</InputLabel>
                                    <Select label="Return Type" value={markForm.return_type}
                                        onChange={(e) => {
                                            const nextType = e.target.value;
                                            const def = lastUnfiledMonthFor(nextType);
                                            setMarkForm({
                                                ...markForm,
                                                return_type: nextType,
                                                period_year: def.year,
                                                period_month: def.month,
                                            });
                                        }}>
                                        {RETURN_TYPES.map((rt) => <MenuItem key={rt} value={rt}>{rt}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Year</InputLabel>
                                    <Select label="Year" value={markForm.period_year}
                                        onChange={(e) => setMarkForm({ ...markForm, period_year: Number(e.target.value) })}>
                                        {[0, 1, 2, 3, 4].map((offset) => {
                                            const y = (new Date()).getFullYear() - offset;
                                            return <MenuItem key={y} value={y}>{y}</MenuItem>;
                                        })}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Month</InputLabel>
                                    <Select label="Month" value={markForm.period_month}
                                        onChange={(e) => setMarkForm({ ...markForm, period_month: Number(e.target.value) })}>
                                        {MONTH_NAMES.map((n, i) => <MenuItem key={i} value={i + 1}>{n}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Tooltip title="Recomputes every figure below from the live ledger. Any manual overrides you made will be replaced.">
                                    <Button fullWidth variant="outlined" startIcon={<CalculateIcon />}
                                        onClick={computeBooks}>
                                        Recompute from Books
                                    </Button>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Section>

                    <Section title="Output supplies" hint="sales tax liability for this period — auto-computed from ledger, edit if portal differs"
                        accent="#0288d1">
                        <Grid container spacing={2}>
                            {[
                                { label: 'CGST', key: 'output_cgst' },
                                { label: 'SGST / UTGST', key: 'output_sgst' },
                                { label: 'IGST', key: 'output_igst' },
                                { label: 'Cess', key: 'output_cess' },
                            ].map((f) => (
                                <Grid item xs={6} md={3} key={f.key}>
                                    <TextField fullWidth size="small" type="number" label={f.label}
                                        value={markForm.figures[f.key]}
                                        onChange={(e) => updateFigure(f.key, e.target.value)}
                                        InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#90a4ae' }}>₹</Typography> }} />
                                </Grid>
                            ))}
                        </Grid>
                    </Section>

                    <Section title="ITC Claimed" hint="input tax credit being claimed this month from eligible purchases"
                        accent="#2e7d32">
                        <Grid container spacing={2}>
                            {[
                                { label: 'CGST', key: 'itc_cgst_claimed' },
                                { label: 'SGST / UTGST', key: 'itc_sgst_claimed' },
                                { label: 'IGST', key: 'itc_igst_claimed' },
                                { label: 'Cess', key: 'itc_cess_claimed' },
                            ].map((f) => (
                                <Grid item xs={6} md={3} key={f.key}>
                                    <TextField fullWidth size="small" type="number" label={f.label}
                                        value={markForm.figures[f.key]}
                                        onChange={(e) => updateFigure(f.key, e.target.value)}
                                        InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#90a4ae' }}>₹</Typography> }} />
                                </Grid>
                            ))}
                        </Grid>
                    </Section>

                    <Section title="ITC Reversed" hint="ineligible credits being reversed — Rule 37/37A/42/43, Sec 17(5), 2B mismatches"
                        accent="#c2185b">
                        <Grid container spacing={2}>
                            {[
                                { label: 'CGST', key: 'itc_cgst_reversed' },
                                { label: 'SGST / UTGST', key: 'itc_sgst_reversed' },
                                { label: 'IGST', key: 'itc_igst_reversed' },
                                { label: 'Cess', key: 'itc_cess_reversed' },
                            ].map((f) => (
                                <Grid item xs={6} md={3} key={f.key}>
                                    <TextField fullWidth size="small" type="number" label={f.label}
                                        value={markForm.figures[f.key]}
                                        onChange={(e) => updateFigure(f.key, e.target.value)}
                                        InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#90a4ae' }}>₹</Typography> }} />
                                </Grid>
                            ))}
                        </Grid>
                    </Section>

                    <Section title="Other liabilities" hint="RCM inward, interest, and late fee — add if applicable"
                        accent="#ef6c00">
                        <Grid container spacing={2}>
                            {[
                                { label: 'RCM liability', key: 'rcm_liability', hint: 'Reverse-charge tax on inward supplies you paid directly to GSTN' },
                                { label: 'Interest paid', key: 'interest_paid', hint: '@ 18% p.a. on late payment of tax' },
                                { label: 'Late fee paid', key: 'late_fee_paid', hint: '₹50/day (or ₹20 for nil returns)' },
                            ].map((f) => (
                                <Grid item xs={12} md={4} key={f.key}>
                                    <TextField fullWidth size="small" type="number" label={f.label}
                                        value={markForm.figures[f.key]}
                                        onChange={(e) => updateFigure(f.key, e.target.value)}
                                        helperText={f.hint}
                                        InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#90a4ae' }}>₹</Typography> }} />
                                </Grid>
                            ))}
                        </Grid>
                    </Section>

                    <Paper variant="outlined" sx={{
                        mb: 2, p: 2,
                        bgcolor: '#fff3e0', borderColor: '#ffb74d',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <Box>
                            <Typography variant="overline" sx={{ fontWeight: 700, color: '#e65100', lineHeight: 1 }}>
                                Net Cash Payable
                            </Typography>
                            <Typography variant="caption" display="block" color="textSecondary">
                                = Output − ITC Claimed + ITC Reversed + RCM + Interest + Late fee. Auto-recomputes as you edit.
                            </Typography>
                        </Box>
                        <Typography variant="h5" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#e65100' }}>
                            ₹{formatINR(markForm.figures.net_cash_payable)}
                        </Typography>
                    </Paper>

                    <Section title="Acknowledgement" hint="after the GSTN portal confirms filing — paste the ARN here"
                        accent="#455a64">
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <TextField fullWidth size="small" label="ARN (from GSTN portal)"
                                    value={markForm.arn}
                                    onChange={(e) => setMarkForm({ ...markForm, arn: e.target.value })}
                                    helperText="Acknowledgement Reference Number — e.g. AA0101240012345"
                                    InputProps={{ style: { fontFamily: 'monospace' } }} />
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <TextField fullWidth size="small" label="Notes (optional)" multiline rows={2}
                                    value={markForm.notes}
                                    onChange={(e) => setMarkForm({ ...markForm, notes: e.target.value })}
                                    helperText="e.g. revision reason, adjustments made, portal ref numbers" />
                            </Grid>
                        </Grid>
                    </Section>
            </SubPage>
            )}

            {mainTab === 2 && (
            <Paper variant="outlined">
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e4ea' }}>
                    <Typography variant="overline" sx={{ fontWeight: 700, color: '#455a64' }}>ITC Reversal Log</Typography>
                    <Typography variant="caption" display="block" color="textSecondary">
                        Cr GST Receivable + Dr expense — moves ineligible ITC off the asset side. Audit GS-5 flags sources still missing a reversal.
                    </Typography>
                </Box>
                {revLoading ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress size={24} /></Box>
                ) : reversals.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center', color: '#90a4ae' }}>No reversals recorded yet.</Box>
                ) : (
                    <Box sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 360px)' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
                        <thead>
                            <tr style={tableHeaderRowStyle}>
                                <th style={thStyle('left')}>Period</th>
                                <th style={thStyle('left')}>Rule</th>
                                <th style={thStyle('left')}>Source</th>
                                <th style={thStyle('right')}>CGST</th>
                                <th style={thStyle('right')}>SGST</th>
                                <th style={thStyle('right')}>IGST</th>
                                <th style={thStyle('right')}>Total</th>
                                <th style={thStyle('left')}>Txn</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reversals.map((r) => {
                                const source = r.source_receiving_id ? `receiving#${r.source_receiving_id}`
                                    : r.source_expense_id ? `expense_item#${r.source_expense_id}`
                                    : r.source_manual_note_id ? `note#${r.source_manual_note_id}`
                                    : r.source_2b_invoice_id ? `2b_inv#${r.source_2b_invoice_id}`
                                    : '—';
                                return (
                                    <tr key={r.id} style={tableRowStyle}>
                                        <td style={tdStyle()}>
                                            {r.period_year ? `${MONTH_NAMES[(r.period_month || 1) - 1]} ${r.period_year}` : '—'}
                                        </td>
                                        <td style={tdStyle()}>
                                            <Chip size="small" label={r.rule}
                                                sx={{ bgcolor: '#fce4ec', color: '#c2185b', fontFamily: 'monospace', fontSize: 10, fontWeight: 600 }} />
                                        </td>
                                        <td style={tdStyle('left', { mono: true, muted: true })}>{source}</td>
                                        <td style={tdStyle('right', { mono: true })}>₹{formatINR(r.reversed_cgst)}</td>
                                        <td style={tdStyle('right', { mono: true })}>₹{formatINR(r.reversed_sgst)}</td>
                                        <td style={tdStyle('right', { mono: true })}>₹{formatINR(r.reversed_igst)}</td>
                                        <td style={tdStyle('right', { mono: true, bold: true })}>₹{formatINR(r.reversed_total)}</td>
                                        <td style={tdStyle('left', { mono: true, muted: true })}>txn#{r.transaction_id || '—'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    </Box>
                )}
            </Paper>
            )}

            {/* ── ITC Reversal — inline full-screen subpage ── */}
            {revOpen && (
            <SubPage
                title="Record ITC Reversal"
                subtitle="Posts Cr CGST/SGST/IGST Receivable (releases the claim) + Dr an expense ledger (books the cost). Optionally links back to the source row."
                onClose={() => setRevOpen(false)}
                footer={<>
                    <Button onClick={() => setRevOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" startIcon={<UndoIcon />}
                        onClick={submitReversal} disabled={revSubmitting}>
                        {revSubmitting ? 'Recording…' : 'Record Reversal'}
                    </Button>
                </>}
            >
                    <Alert severity="info" icon={<UndoIcon fontSize="small" />} sx={{ mb: 2 }}>
                        Posts <strong>Cr CGST/SGST/IGST Receivable</strong> (releases the claim) +
                        <strong> Dr your chosen expense ledger</strong> (books the reversed ITC as cost).
                        The transaction is dated to the last day of the target month so it lands in the correct GSTR-3B.
                    </Alert>
                    {revError && <Alert severity="error" sx={{ mb: 2 }}>{revError}</Alert>}

                    <Section title="Reversal details" hint="which rule triggers this reversal, and which month it belongs to"
                        accent="#c2185b">
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Rule</InputLabel>
                                    <Select label="Rule" value={revForm.rule}
                                        onChange={(e) => setRevForm({ ...revForm, rule: e.target.value })}>
                                        <MenuItem value="blocked_credit_17_5">Sec 17(5) — blocked credits (motor vehicles, food, personal use…)</MenuItem>
                                        <MenuItem value="37">Rule 37 — unpaid vendor &gt; 180 days</MenuItem>
                                        <MenuItem value="37A">Rule 37A — vendor failed to file GSTR-3B</MenuItem>
                                        <MenuItem value="42">Rule 42 — exempt-supply proportional reversal</MenuItem>
                                        <MenuItem value="43">Rule 43 — capital goods proportional</MenuItem>
                                        <MenuItem value="missing_in_2b">Missing in GSTR-2B (Section 16(2)(aa))</MenuItem>
                                        <MenuItem value="mismatched_with_2b">Mismatched with GSTR-2B</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Year</InputLabel>
                                    <Select label="Year" value={revForm.period_year}
                                        onChange={(e) => setRevForm({ ...revForm, period_year: Number(e.target.value) })}>
                                        {[0, 1, 2, 3].map((offset) => {
                                            const y = (new Date()).getFullYear() - offset;
                                            return <MenuItem key={y} value={y}>{y}</MenuItem>;
                                        })}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Month</InputLabel>
                                    <Select label="Month" value={revForm.period_month}
                                        onChange={(e) => setRevForm({ ...revForm, period_month: Number(e.target.value) })}>
                                        {MONTH_NAMES.map((n, i) => <MenuItem key={i} value={i + 1}>{n}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <LedgerPicker
                                    label="Expense ledger (Dr side)"
                                    value={revForm.expense_ledger_id}
                                    onChange={(v) => setRevForm({ ...revForm, expense_ledger_id: v })}
                                    helperText="Where the reversed ITC lands as cost — typically the original expense head" />
                            </Grid>
                        </Grid>
                    </Section>

                    <Section title="Amounts to reverse" hint="these come out of your ITC asset side (Cr GST Receivable)"
                        accent="#c2185b">
                        <Grid container spacing={2}>
                            {[
                                { label: 'CGST', key: 'reversed_cgst' },
                                { label: 'SGST / UTGST', key: 'reversed_sgst' },
                                { label: 'IGST', key: 'reversed_igst' },
                                { label: 'Cess', key: 'reversed_cess' },
                            ].map((f) => (
                                <Grid item xs={6} md={3} key={f.key}>
                                    <TextField fullWidth size="small" type="number" label={f.label}
                                        value={revForm[f.key]}
                                        onChange={(e) => setRevForm({ ...revForm, [f.key]: Number(e.target.value) })}
                                        InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#90a4ae' }}>₹</Typography> }} />
                                </Grid>
                            ))}
                        </Grid>
                    </Section>

                    <Section title="Link to source row" hint="optional — pick at most one; selecting any one clears the others"
                        accent="#546e7a">
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1.5 }}>
                            Linking improves traceability and makes audit check GS-5 pass cleanly. For Rule 37/37A pick
                            the original Receiving bill; for expense-line reversals pick the Expense line; for vendor
                            credit notes pick the debit note.
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <SourcePicker
                                    label="Receiving bill"
                                    options={revReceivings}
                                    getLabel={(o) => `${o.invoice_number || '—'} · ${formatDateShort(o.date)} · ₹${formatINR(o.tax)}`}
                                    value={revForm.source_receiving_id}
                                    onChange={(v) => setRevForm({
                                        ...revForm,
                                        source_receiving_id: v, source_expense_id: '', source_manual_note_id: '',
                                    })}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <SourcePicker
                                    label="Expense line"
                                    options={revExpenses}
                                    getLabel={(o) => `#${o.id} · ${o.invoice_number || `exp#${o.expense_id}`} · ${formatDateShort(o.date)} · ₹${formatINR(o.tax)}`}
                                    value={revForm.source_expense_id}
                                    onChange={(v) => setRevForm({
                                        ...revForm,
                                        source_receiving_id: '', source_expense_id: v, source_manual_note_id: '',
                                    })}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <SourcePicker
                                    label="Vendor debit note"
                                    options={revNotes}
                                    getLabel={(o) => `${o.sequence_number || '—'} · ${o.note_type || ''} · ${formatDateShort(o.date)} · ₹${formatINR(o.tax)}`}
                                    value={revForm.source_manual_note_id}
                                    onChange={(v) => setRevForm({
                                        ...revForm,
                                        source_receiving_id: '', source_expense_id: '', source_manual_note_id: v,
                                    })}
                                />
                            </Grid>
                        </Grid>
                    </Section>

                    <Section title="Notes" hint="optional — rationale, cross-references, vendor info" accent="#455a64">
                        <TextField fullWidth size="small" multiline rows={2}
                            placeholder="e.g. Vendor XYZ failed to file GSTR-1 for Feb; reversing under Rule 37A."
                            value={revForm.notes}
                            onChange={(e) => setRevForm({ ...revForm, notes: e.target.value })} />
                    </Section>
            </SubPage>
            )}

            {mainTab === 3 && (
            <Paper variant="outlined">
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e4ea' }}>
                    <Typography variant="overline" sx={{ fontWeight: 700, color: '#455a64' }}>GSTR-2B Reconciliation</Typography>
                    <Typography variant="caption" display="block" color="textSecondary">
                        Upload 2B JSON from the GSTN portal. The matcher pairs each invoice against books (GSTIN + invoice number, ±₹1 tolerance). GS-2 flags books ITC on invoices missing from 2B.
                    </Typography>
                </Box>
                {uplLoading ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress size={24} /></Box>
                ) : visibleUploads.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center', color: '#90a4ae' }}>
                        <Typography variant="body2">No 2B uploads for this GSTIN yet.</Typography>
                        <Typography variant="caption">Click <strong>Upload 2B</strong> to paste the JSON downloaded from the portal.</Typography>
                    </Box>
                ) : (
                    <Box sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 360px)' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
                        <thead>
                            <tr style={tableHeaderRowStyle}>
                                <th style={thStyle('left')}>Uploaded</th>
                                <th style={thStyle('left')}>GSTIN</th>
                                <th style={thStyle('left')}>Period</th>
                                <th style={thStyle('right')}>Invoices</th>
                                <th style={thStyle('right')}>Matched</th>
                                <th style={thStyle('right')}>Mismatch</th>
                                <th style={thStyle('right')}>Missing in Books</th>
                                <th style={thStyle('right')}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleUploads.map((u) => (
                                <React.Fragment key={u.id}>
                                    <tr style={{
                                        ...tableRowStyle,
                                        background: expandedUpload === u.id ? '#e3f2fd' : undefined,
                                        cursor: 'pointer',
                                    }}
                                        onClick={() => toggleExpandUpload(u.id)}>
                                        <td style={tdStyle('left', { mono: true, fontSize: 11 })}>
                                            {u.uploaded_at ? new Date(u.uploaded_at).toLocaleString('en-IN', { hour12: false }) : '—'}
                                        </td>
                                        <td style={tdStyle('left', { mono: true })}>{u.gstin}</td>
                                        <td style={tdStyle()}>{MONTH_NAMES[u.period_month - 1]} {u.period_year}</td>
                                        <td style={tdStyle('right', { mono: true })}>{u.invoice_count}</td>
                                        <td style={tdStyle('right', { mono: true, color: u.matched_count > 0 ? '#2e7d32' : '#90a4ae' })}>
                                            {u.matched_count}
                                        </td>
                                        <td style={tdStyle('right', { mono: true, bold: u.mismatch_count > 0, color: u.mismatch_count > 0 ? '#ef6c00' : '#90a4ae' })}>
                                            {u.mismatch_count}
                                        </td>
                                        <td style={tdStyle('right', { mono: true, bold: u.missing_count > 0, color: u.missing_count > 0 ? '#d32f2f' : '#90a4ae' })}>
                                            {u.missing_count}
                                        </td>
                                        <td style={tdStyle('right')} onClick={(e) => e.stopPropagation()}>
                                            <Tooltip title={expandedUpload === u.id ? 'Hide invoices' : 'Show invoices'}>
                                                <IconButton size="small" onClick={() => toggleExpandUpload(u.id)}>
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Re-run reconciliation">
                                                <IconButton size="small" onClick={() => reconcileUpload(u.id)}>
                                                    <SyncIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {isAdmin && (
                                                <Tooltip title="Delete upload">
                                                    <IconButton size="small" onClick={() => deleteUpload(u.id)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </td>
                                    </tr>

                                    {/* Expanded: per-invoice detail */}
                                    {expandedUpload === u.id && (
                                        <tr>
                                            <td colSpan={8} style={{ padding: 0, borderTop: '1px solid #ddd', background: '#fafafa' }}>
                                                <Box sx={{ p: 2 }}>
                                                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                                                        {['all', 'matched', 'mismatch', 'missing_in_books', 'books_only'].map((f) => {
                                                            const count = f === 'all'
                                                                ? uplInvoices.length
                                                                : uplInvoices.filter((i) => i.match_status === f).length;
                                                            return (
                                                                <Chip key={f} size="small"
                                                                    label={`${
                                                                        f === 'all' ? 'All'
                                                                        : f === 'missing_in_books' ? 'Missing in books'
                                                                        : f === 'books_only' ? 'Books only'
                                                                        : f[0].toUpperCase() + f.slice(1)
                                                                    } (${count})`}
                                                                    color={uplInvFilter === f ? 'primary' : 'default'}
                                                                    onClick={() => setUplInvFilter(f)} />
                                                            );
                                                        })}
                                                    </Box>
                                                    {visibleUplInvoices.length === 0 ? (
                                                        <Typography variant="caption" color="textSecondary">No invoices in this bucket.</Typography>
                                                    ) : (
                                                        <Box sx={{ overflow: 'auto', maxHeight: 400 }}>
                                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                                                <thead>
                                                                    <tr style={{ background: '#eee' }}>
                                                                        <th style={{ padding: 8, textAlign: 'left' }}>Supplier GSTIN</th>
                                                                        <th style={{ padding: 8, textAlign: 'left' }}>Supplier</th>
                                                                        <th style={{ padding: 8, textAlign: 'left' }}>Invoice</th>
                                                                        <th style={{ padding: 8, textAlign: 'left' }}>Date</th>
                                                                        <th style={{ padding: 8, textAlign: 'right' }}>Taxable</th>
                                                                        <th style={{ padding: 8, textAlign: 'right' }}>CGST</th>
                                                                        <th style={{ padding: 8, textAlign: 'right' }}>SGST</th>
                                                                        <th style={{ padding: 8, textAlign: 'right' }}>IGST</th>
                                                                        <th style={{ padding: 8, textAlign: 'left' }}>Status</th>
                                                                        <th style={{ padding: 8, textAlign: 'left' }}>Reason</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {visibleUplInvoices.map((inv) => (
                                                                        <tr key={inv.id} style={{ borderTop: '1px solid #eee' }}>
                                                                            <td style={{ padding: 8, fontFamily: 'monospace' }}>{inv.supplier_gstin}</td>
                                                                            <td style={{ padding: 8 }}>{inv.supplier_name || '—'}</td>
                                                                            <td style={{ padding: 8, fontFamily: 'monospace' }}>{inv.invoice_no}</td>
                                                                            <td style={{ padding: 8 }}>{inv.invoice_date}</td>
                                                                            <td style={{ padding: 8, textAlign: 'right', fontFamily: 'monospace' }}>₹{formatINR(inv.taxable_value)}</td>
                                                                            <td style={{ padding: 8, textAlign: 'right', fontFamily: 'monospace' }}>₹{formatINR(inv.cgst)}</td>
                                                                            <td style={{ padding: 8, textAlign: 'right', fontFamily: 'monospace' }}>₹{formatINR(inv.sgst)}</td>
                                                                            <td style={{ padding: 8, textAlign: 'right', fontFamily: 'monospace' }}>₹{formatINR(inv.igst)}</td>
                                                                            <td style={{ padding: 8 }}>{matchStatusChip(inv.match_status)}</td>
                                                                            <td style={{ padding: 8, fontSize: 11, color: '#666' }}>{inv.match_reason || '—'}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                    </Box>
                )}
            </Paper>
            )}
            </Box>{/* end scrollable content */}

            {/* ── GSTR-2B Upload — inline full-screen subpage ── */}
            {uplOpen && (
            <SubPage
                title="Upload GSTR-2B JSON"
                subtitle="Download the 2B JSON from the GSTN portal (Returns → GSTR-2B → Download JSON) and paste its contents here. The matcher runs automatically after upload."
                onClose={() => setUplOpen(false)}
                footer={<>
                    <Button onClick={() => setUplOpen(false)}>Cancel</Button>
                    <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={submitUpload} disabled={uplSubmitting}>
                        {uplSubmitting ? 'Uploading…' : 'Upload & Reconcile'}
                    </Button>
                </>}
            >
                    <Alert severity="info" icon={<CloudUploadIcon fontSize="small" />} sx={{ mb: 2 }}>
                        <strong>How to get the 2B JSON:</strong> Log into the GSTN portal →
                        <strong> Returns Dashboard</strong> → select the return period → <strong>GSTR-2B</strong> →
                        <strong> Download JSON</strong>. Open the downloaded file in any text editor, copy the
                        entire contents, and paste below. Reconciliation runs automatically after upload.
                    </Alert>
                    {uplError && <Alert severity="error" sx={{ mb: 2 }}>{uplError}</Alert>}

                    <Section title="Period" hint="must match the rtnprd inside the 2B JSON"
                        accent="#1976d2">
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <TextField fullWidth size="small" label="GSTIN" value={uplForm.gstin}
                                    onChange={(e) => setUplForm({ ...uplForm, gstin: e.target.value.toUpperCase() })}
                                    helperText="Your registered GSTIN"
                                    InputProps={{ style: { fontFamily: 'monospace' } }} />
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Year</InputLabel>
                                    <Select label="Year" value={uplForm.period_year}
                                        onChange={(e) => setUplForm({ ...uplForm, period_year: Number(e.target.value) })}>
                                        {[0, 1, 2, 3].map((offset) => {
                                            const y = (new Date()).getFullYear() - offset;
                                            return <MenuItem key={y} value={y}>{y}</MenuItem>;
                                        })}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Month</InputLabel>
                                    <Select label="Month" value={uplForm.period_month}
                                        onChange={(e) => setUplForm({ ...uplForm, period_month: Number(e.target.value) })}>
                                        {MONTH_NAMES.map((n, i) => <MenuItem key={i} value={i + 1}>{n}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField fullWidth size="small" label="File name (optional)"
                                    value={uplForm.file_name}
                                    onChange={(e) => setUplForm({ ...uplForm, file_name: e.target.value })}
                                    helperText="For your own records, e.g. GSTR2B_033202526.json" />
                            </Grid>
                        </Grid>
                    </Section>

                    <Section title="2B JSON payload" hint="paste the full JSON downloaded from the GSTN portal"
                        accent="#0288d1">
                        <TextField fullWidth multiline minRows={18}
                            value={uplForm.json_content}
                            onChange={(e) => setUplForm({ ...uplForm, json_content: e.target.value })}
                            placeholder={'{\n  "gstin": "...",\n  "rtnprd": "032026",\n  "data": {\n    "docdata": {\n      "b2b":  [ ... ],\n      "b2ba": [ ... ],\n      "cdnr": [ ... ],\n      "cdnra":[ ... ]\n    }\n  }\n}'}
                            InputProps={{ style: { fontFamily: 'monospace', fontSize: 12 } }}
                            helperText="Accepted buckets: b2b, b2ba, cdnr, cdnra. Other buckets are ignored safely." />
                        <Alert severity="warning" variant="outlined" sx={{ mt: 1.5, fontSize: 12 }}>
                            <strong>Duplicate uploads are rejected</strong> per (GSTIN, period). If you need to
                            re-upload, delete the previous upload from the GSTR-2B Recon tab first.
                        </Alert>
                    </Section>
            </SubPage>
            )}

            {/* ── Record Challan Payment — inline full-screen subpage ── */}
            {payOpen && (
            <SubPage
                title="Record Challan Payment"
                subtitle={`Posts Dr CGST/SGST/IGST Payable (+ interest/late-fee expense) and Cr the bank ledger. Linked to the month so the Liability Report shows "Paid" against "Declared".`}
                onClose={() => setPayOpen(false)}
                footer={<>
                    <Button onClick={() => setPayOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="success" startIcon={<PaymentsIcon />}
                        onClick={submitPayment} disabled={paySubmitting}>
                        {paySubmitting ? 'Recording…' : 'Record Payment'}
                    </Button>
                </>}
            >
                    <Alert severity="info" icon={<PaymentsIcon fontSize="small" />} sx={{ mb: 2 }}>
                        After paying via the GSTN portal you receive a <strong>CIN</strong> (Challan Identification
                        Number). Enter it here along with the bank ledger — we post
                        <strong> Dr CGST/SGST/IGST Payable</strong> (+ interest / late-fee if any) and
                        <strong> Cr the bank</strong>, tagged to the filed period so the Liability Report shows "Paid"
                        against "Declared".
                    </Alert>
                    {payError && <Alert severity="error" sx={{ mb: 2 }}>{payError}</Alert>}

                    <Section title="Period & Challan" hint="which filed period this challan settles"
                        accent="#2e7d32">
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={3}>
                                <TextField fullWidth size="small" label="GSTIN" value={payForm.gstin}
                                    onChange={(e) => setPayForm({ ...payForm, gstin: e.target.value.toUpperCase() })}
                                    helperText="Must match the filed GSTR-3B"
                                    InputProps={{ style: { fontFamily: 'monospace' } }} />
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Year</InputLabel>
                                    <Select label="Year" value={payForm.period_year}
                                        onChange={(e) => setPayForm({ ...payForm, period_year: Number(e.target.value) })}>
                                        {[0, 1, 2, 3].map((offset) => {
                                            const y = (new Date()).getFullYear() - offset;
                                            return <MenuItem key={y} value={y}>{y}</MenuItem>;
                                        })}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Month</InputLabel>
                                    <Select label="Month" value={payForm.period_month}
                                        onChange={(e) => setPayForm({ ...payForm, period_month: Number(e.target.value) })}>
                                        {MONTH_NAMES.map((n, i) => <MenuItem key={i} value={i + 1}>{n}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <TextField fullWidth size="small" type="date" label="Challan date"
                                    InputLabelProps={{ shrink: true }}
                                    value={payForm.challan_date}
                                    onChange={(e) => setPayForm({ ...payForm, challan_date: e.target.value })}
                                    helperText="When the portal processed payment" />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <TextField fullWidth size="small" label="CIN"
                                    value={payForm.cin}
                                    onChange={(e) => setPayForm({ ...payForm, cin: e.target.value })}
                                    helperText="Must be unique per company (duplicate will reject)"
                                    InputProps={{ style: { fontFamily: 'monospace' } }} />
                            </Grid>
                        </Grid>
                    </Section>

                    <Section title="Ledgers" hint="where money leaves (bank) and where interest / late-fee are booked"
                        accent="#455a64">
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <LedgerPicker
                                    label="Bank / Cash ledger (Cr side)"
                                    value={payForm.bank_account_id}
                                    onChange={(v) => setPayForm({ ...payForm, bank_account_id: v })}
                                    helperText="Where the cash flowed from — required" />
                            </Grid>
                            <Grid item xs={6} md={4}>
                                <LedgerPicker
                                    label="Interest ledger"
                                    value={payForm.interest_ledger_id}
                                    onChange={(v) => setPayForm({ ...payForm, interest_ledger_id: v })}
                                    helperText="Required only if Interest paid > 0" />
                            </Grid>
                            <Grid item xs={6} md={4}>
                                <LedgerPicker
                                    label="Late-fee ledger"
                                    value={payForm.late_fee_ledger_id}
                                    onChange={(v) => setPayForm({ ...payForm, late_fee_ledger_id: v })}
                                    helperText="Required only if Late fee paid > 0" />
                            </Grid>
                        </Grid>
                    </Section>

                    <Section title="Tax paid (Dr side)" hint="per-head split paid against the declared liability"
                        accent="#0288d1">
                        <Grid container spacing={2}>
                            {[
                                { label: 'CGST paid', key: 'cgst_paid' },
                                { label: 'SGST / UTGST paid', key: 'sgst_paid' },
                                { label: 'IGST paid', key: 'igst_paid' },
                                { label: 'Cess paid', key: 'cess_paid' },
                            ].map((f) => (
                                <Grid item xs={6} md={3} key={f.key}>
                                    <TextField fullWidth size="small" type="number" label={f.label}
                                        value={payForm[f.key]}
                                        onChange={(e) => setPayForm({ ...payForm, [f.key]: Number(e.target.value) })}
                                        InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#90a4ae' }}>₹</Typography> }} />
                                </Grid>
                            ))}
                        </Grid>
                    </Section>

                    <Section title="Interest & late fee" hint="optional — only if your challan included these"
                        accent="#ef6c00">
                        <Grid container spacing={2}>
                            {[
                                { label: 'Interest paid', key: 'interest_paid', hint: '@ 18% p.a. simple interest' },
                                { label: 'Late fee paid', key: 'late_fee_paid', hint: '₹50/day (₹20/day for nil returns)' },
                            ].map((f) => (
                                <Grid item xs={12} md={6} key={f.key}>
                                    <TextField fullWidth size="small" type="number" label={f.label}
                                        value={payForm[f.key]}
                                        onChange={(e) => setPayForm({ ...payForm, [f.key]: Number(e.target.value) })}
                                        helperText={f.hint}
                                        InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: '#90a4ae' }}>₹</Typography> }} />
                                </Grid>
                            ))}
                        </Grid>
                    </Section>

                    <Paper variant="outlined" sx={{
                        mb: 2, p: 2,
                        bgcolor: '#e8f5e9', borderColor: '#81c784',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <Box>
                            <Typography variant="overline" sx={{ fontWeight: 700, color: '#1b5e20', lineHeight: 1 }}>
                                Total cash leaving the bank
                            </Typography>
                            <Typography variant="caption" display="block" color="textSecondary">
                                Sum of all six fields above. Debit legs will balance against this single Cr to the bank ledger.
                            </Typography>
                        </Box>
                        <Typography variant="h5" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#2e7d32' }}>
                            ₹{formatINR(
                                ['cgst_paid','sgst_paid','igst_paid','cess_paid','interest_paid','late_fee_paid']
                                    .reduce((acc, k) => acc + Number(payForm[k] || 0), 0)
                            )}
                        </Typography>
                    </Paper>

                    <Section title="Notes" hint="optional — any reference, bank reference, or remark" accent="#455a64">
                        <TextField fullWidth size="small" multiline rows={2}
                            placeholder="e.g. Paid via NEFT, UTR 12345; also covers interest for delayed filing."
                            value={payForm.notes}
                            onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })} />
                    </Section>
            </SubPage>
            )}

            {/* ── Build Return Tables — inline full-screen subpage ── */}
            {rtOpen && (
            <SubPage
                title={`${rtContext.type} — ${MONTH_NAMES[(rtContext.month || 1) - 1]} ${rtContext.year}`}
                subtitle="Preview of the tables to file on the GSTN portal. Numbers come from live books — file on the portal, then mark this period as Filed to freeze the snapshot."
                onClose={() => setRtOpen(false)}
                footer={<Button onClick={() => setRtOpen(false)}>Close</Button>}
            >
                {rtError && <Alert severity="error" sx={{ mb: 2 }}>{rtError}</Alert>}
                {rtLoading ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
                ) : !rtPayload ? (
                    <Box sx={{ p: 4, textAlign: 'center', color: '#999' }}>No data.</Box>
                ) : rtContext.type === 'GSTR-1' ? (
                    <Gstr1Tables payload={rtPayload} tab={rtTab} setTab={setRtTab}
                        onExport={exportCSV} month={rtContext.month} year={rtContext.year} />
                ) : (
                    <Gstr3bTables payload={rtPayload}
                        onExport={exportCSV} month={rtContext.month} year={rtContext.year} />
                )}
            </SubPage>
            )}

            {/* ── Help — inline full-screen subpage ── */}
            {helpOpen && (
            <SubPage
                title="How to use GST Returns"
                onClose={() => setHelpOpen(false)}
                footer={<Button onClick={() => setHelpOpen(false)} variant="contained">Got it</Button>}
            >
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        This page is your monthly GST filing control-panel. Follow the steps below each month — the banner shows the
                        <strong> last unfiled period</strong> as the default so you can start directly from the oldest one pending.
                    </Typography>

                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>1. Review liability</Typography>
                    <Typography variant="body2" component="div">
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                            <li>Open the <strong>Net Liability</strong> tab — see declared vs paid vs outstanding per month for the FY.</li>
                            <li><strong>Drift</strong> ≠ 0 means books no longer tie to what was declared — typically a back-dated post.</li>
                            <li><strong>Outstanding</strong> &gt; 0 means the challan hasn't been recorded for that month yet.</li>
                        </ul>
                    </Typography>

                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2 }}>2. Upload GSTR-2B and reconcile</Typography>
                    <Typography variant="body2" component="div">
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                            <li>Download the 2B JSON from the GSTN portal (Returns → GSTR-2B → Download JSON).</li>
                            <li>Click <strong>Upload 2B</strong> and paste the JSON. The matcher pairs each invoice with books (GSTIN + invoice no, ±₹1 tolerance).</li>
                            <li>Expand an upload row to see per-invoice status: <em>matched / mismatch / missing in books / books only</em>.</li>
                            <li>Anything in <em>missing in books</em> is ITC you're claiming but the vendor hasn't uploaded — reverse it under Rule 37A or chase the vendor.</li>
                        </ul>
                    </Typography>

                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2 }}>3. Record ITC reversals</Typography>
                    <Typography variant="body2" component="div">
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                            <li>Click <strong>ITC Reversal</strong> for anything ineligible (blocked credit 17(5), personal use, exempt-supply proportional, unpaid &gt; 180 days, 2B mismatch).</li>
                            <li>Posts <em>Cr GST Receivable + Dr expense</em> — removes the ITC from the asset side and books it as cost.</li>
                            <li>The log shows all reversals for the period. Audit check GS-5 flags ineligible source rows still missing a reversal.</li>
                        </ul>
                    </Typography>

                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2 }}>4. Build return tables</Typography>
                    <Typography variant="body2" component="div">
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                            <li>On the <strong>Return Periods</strong> tab, click the <TableChartIcon sx={{ fontSize: 14, verticalAlign: 'middle' }} /> icon on any row.</li>
                            <li>Preview GSTR-1 (Tables 4 B2B, 5 B2CL, 7 B2C-Others, 9B CN/DN, 12 HSN) or GSTR-3B (3.1(a), 3.1(d), 4(A), 4(B)).</li>
                            <li>Export any table as CSV for offline upload to the GSTN portal.</li>
                        </ul>
                    </Typography>

                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2 }}>5. Mark period filed</Typography>
                    <Typography variant="body2" component="div">
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                            <li>File on the GSTN portal first — you'll get an <strong>ARN</strong>.</li>
                            <li>Click <strong>Mark Filed</strong>. The dialog defaults to the <em>last unfiled month</em> with books figures pre-computed.</li>
                            <li>Enter the ARN and submit. This <strong>freezes the books snapshot</strong> into <code>gst_return_figures</code> and <strong>locks the month</strong> against back-dated posts.</li>
                            <li>If you need to revise, an Administrator can <em>Reopen</em> — this releases the lock and allows corrections.</li>
                        </ul>
                    </Typography>

                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2 }}>6. Record challan payment</Typography>
                    <Typography variant="body2" component="div">
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                            <li>Once you pay via the portal, grab the <strong>CIN</strong> (Challan Identification Number).</li>
                            <li>Click <strong>Challan</strong>. Enter CIN, bank ledger, and the split across CGST/SGST/IGST/Cess plus interest/late-fee ledgers.</li>
                            <li>Posts <em>Dr Payable + Dr interest/late-fee − Cr bank</em>. The <em>Paid</em> column on the liability report refreshes immediately.</li>
                        </ul>
                    </Typography>

                    <Box sx={{ mt: 3, p: 2, bgcolor: '#fff8e1', borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Rules & tips</Typography>
                        <Typography variant="body2" component="div">
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                <li><strong>Filing order matters</strong> — you can't file a later month until prior months are filed.</li>
                                <li>The period-lock middleware (<code>periodLockValidator</code>) blocks any post with a date inside a filed month — you'll see a 403 from every service.</li>
                                <li>Multi-GSTIN: the <strong>GSTIN</strong> selector in the toolbar scopes every view on this page.</li>
                                <li>Any <em>drift</em> you see on a filed month is real accounting — trace it via audit check GS-3 ("Posted in filed period").</li>
                                <li>Reopening a filed period is for <em>revised returns</em> only — file the corrected return on the portal first.</li>
                                <li>Roles: Administrator + Accountant can file, record reversals, upload 2B, record challans. Only Administrator can reopen a filed period.</li>
                            </ul>
                        </Typography>
                    </Box>
            </SubPage>
            )}

            {/* ── Reopen dialog ── */}
            <Dialog open={!!reopenTarget} onClose={() => setReopenTarget(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Reopen filed period</DialogTitle>
                <DialogContent dividers>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Reopening releases the period lock so back-dated edits can be posted.
                        This is for revised returns only — file a corrected return on the GSTN portal
                        before re-marking as filed.
                    </Alert>
                    {reopenTarget && (
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Reopening <strong>{reopenTarget.return_type}</strong> for <strong>{MONTH_NAMES[(reopenTarget.period_month || 1) - 1]} {reopenTarget.period_year}</strong> (ARN: {reopenTarget.arn || '—'})
                        </Typography>
                    )}
                    <TextField fullWidth size="small" label="Reason for reopening" multiline rows={2}
                        value={reopenNote} onChange={(e) => setReopenNote(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReopenTarget(null)}>Cancel</Button>
                    <Button variant="contained" color="warning" onClick={submitReopen}>Reopen</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

const TableGrid = ({ columns, rows, emptyMsg, onExport, exportName }) => {
    if (!Array.isArray(rows) || rows.length === 0) {
        return <Typography variant="caption" color="textSecondary">{emptyMsg || 'No rows.'}</Typography>;
    }
    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <Button size="small" startIcon={<DownloadIcon />}
                    onClick={() => onExport(rows, columns, exportName)}>
                    Export CSV ({rows.length} rows)
                </Button>
            </Box>
            <Box sx={{ overflow: 'auto', maxHeight: 420 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                        <tr style={{ background: '#f5f5f5', fontWeight: 700 }}>
                            {columns.map((c) => (
                                <th key={c.key} style={{ padding: 8, textAlign: c.numeric ? 'right' : 'left' }}>
                                    {c.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr key={i} style={{ borderTop: '1px solid #eee' }}>
                                {columns.map((c) => {
                                    const v = r[c.key];
                                    return (
                                        <td key={c.key} style={{
                                            padding: 8,
                                            textAlign: c.numeric ? 'right' : 'left',
                                            fontFamily: c.mono || c.numeric ? 'monospace' : undefined,
                                        }}>
                                            {c.numeric
                                                ? (v === null || v === undefined ? '—' : `₹${formatINR(v)}`)
                                                : (v === null || v === undefined || v === '' ? '—' : String(v))}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>
        </>
    );
};

const Gstr1Tables = ({ payload, tab, setTab, onExport, month, year }) => {
    const t = payload && payload.tables ? payload.tables : {};
    const periodTag = `${year}-${String(month).padStart(2, '0')}`;

    const tabs = [
        {
            label: `T4 B2B (${(t.table4_b2b || []).length})`,
            rows: t.table4_b2b || [],
            columns: [
                { key: 'customer_gstin', label: 'GSTIN of Recipient', mono: true },
                { key: 'company_name', label: 'Receiver Name' },
                { key: 'invoice_number', label: 'Invoice No', mono: true },
                { key: 'invoice_date', label: 'Invoice Date' },
                { key: 'invoice_value', label: 'Invoice Value', numeric: true },
                { key: 'place_of_supply', label: 'Place of Supply' },
                { key: 'taxable_value', label: 'Taxable Value', numeric: true },
                { key: 'igst', label: 'IGST', numeric: true },
                { key: 'cgst', label: 'CGST', numeric: true },
                { key: 'sgst', label: 'SGST', numeric: true },
            ],
            name: `gstr1_table4_b2b_${periodTag}.csv`,
        },
        {
            label: `T5 B2CL (${(t.table5_b2cl || []).length})`,
            rows: t.table5_b2cl || [],
            columns: [
                { key: 'invoice_number', label: 'Invoice No', mono: true },
                { key: 'invoice_date', label: 'Invoice Date' },
                { key: 'invoice_value', label: 'Invoice Value', numeric: true },
                { key: 'place_of_supply', label: 'Place of Supply' },
                { key: 'taxable_value', label: 'Taxable Value', numeric: true },
                { key: 'total_tax_amount', label: 'IGST', numeric: true },
            ],
            name: `gstr1_table5_b2cl_${periodTag}.csv`,
        },
        {
            label: `T7 B2C Others (${(t.table7_b2c_others || []).length})`,
            rows: t.table7_b2c_others || [],
            columns: [
                { key: 'place_of_supply', label: 'Place of Supply' },
                { key: 'tax_type', label: 'Tax Type' },
                { key: 'invoice_count', label: 'Invoices' },
                { key: 'taxable_value', label: 'Taxable Value', numeric: true },
                { key: 'igst', label: 'IGST', numeric: true },
                { key: 'cgst', label: 'CGST', numeric: true },
                { key: 'sgst', label: 'SGST', numeric: true },
            ],
            name: `gstr1_table7_b2c_${periodTag}.csv`,
        },
        {
            label: `T9B CN/DN (${(t.table9b_cndn || []).length})`,
            rows: t.table9b_cndn || [],
            columns: [
                { key: 'customer_gstin', label: 'GSTIN of Recipient', mono: true },
                { key: 'sequence_number', label: 'Note No', mono: true },
                { key: 'note_type', label: 'Type' },
                { key: 'date', label: 'Note Date' },
                { key: 'original_invoice_no', label: 'Orig. Invoice', mono: true },
                { key: 'original_invoice_date', label: 'Orig. Date' },
                { key: 'note_value', label: 'Note Value', numeric: true },
                { key: 'gst_amount', label: 'GST', numeric: true },
            ],
            name: `gstr1_table9b_cndn_${periodTag}.csv`,
        },
        {
            label: `T12 HSN (${(t.table12_hsn || []).length})`,
            rows: t.table12_hsn || [],
            columns: [
                { key: 'hsn_code', label: 'HSN', mono: true },
                { key: 'gst_rate_label', label: 'Rate' },
                { key: 'invoice_count', label: 'Invoices' },
                { key: 'total_qty', label: 'Qty' },
                { key: 'taxable_value', label: 'Taxable', numeric: true },
                { key: 'igst', label: 'IGST', numeric: true },
                { key: 'cgst', label: 'CGST', numeric: true },
                { key: 'sgst', label: 'SGST', numeric: true },
            ],
            name: `gstr1_table12_hsn_${periodTag}.csv`,
        },
    ];

    const active = tabs[tab] || tabs[0];
    return (
        <Box>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
                {tabs.map((tb, i) => <Tab key={i} label={tb.label} />)}
            </Tabs>
            <TableGrid columns={active.columns} rows={active.rows}
                emptyMsg="No rows in this table for the selected period."
                onExport={onExport} exportName={active.name} />
        </Box>
    );
};

const Gstr3bTables = ({ payload, onExport, month, year }) => {
    const t = payload && payload.tables ? payload.tables : {};
    const periodTag = `${year}-${String(month).padStart(2, '0')}`;

    const summaryRow = (src, label) => ([{
        section: label,
        taxable_value: Number(src && src.taxable_value) || 0,
        igst: Number(src && src.igst) || 0,
        cgst: Number(src && src.cgst) || 0,
        sgst: Number(src && src.sgst) || 0,
        cess: Number(src && src.cess) || 0,
    }]);
    const summaryCols = [
        { key: 'section', label: 'Nature' },
        { key: 'taxable_value', label: 'Taxable Value', numeric: true },
        { key: 'igst', label: 'IGST', numeric: true },
        { key: 'cgst', label: 'CGST', numeric: true },
        { key: 'sgst', label: 'SGST', numeric: true },
        { key: 'cess', label: 'Cess', numeric: true },
    ];

    const itcRow = [{
        section: 'All Other ITC',
        igst: Number(t.table_4a && t.table_4a.igst) || 0,
        cgst: Number(t.table_4a && t.table_4a.cgst) || 0,
        sgst: Number(t.table_4a && t.table_4a.sgst) || 0,
        cess: Number(t.table_4a && t.table_4a.cess) || 0,
    }];
    const itcCols = [
        { key: 'section', label: 'Nature' },
        { key: 'igst', label: 'IGST', numeric: true },
        { key: 'cgst', label: 'CGST', numeric: true },
        { key: 'sgst', label: 'SGST', numeric: true },
        { key: 'cess', label: 'Cess', numeric: true },
    ];

    const reversedCols = [
        { key: 'rule', label: 'Rule' },
        { key: 'igst', label: 'IGST', numeric: true },
        { key: 'cgst', label: 'CGST', numeric: true },
        { key: 'sgst', label: 'SGST', numeric: true },
        { key: 'cess', label: 'Cess', numeric: true },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="overline" sx={{ fontWeight: 700 }}>3.1(a) — Outward taxable supplies</Typography>
                <TableGrid columns={summaryCols} rows={summaryRow(t.table_3_1_a, 'Outward taxable (other than zero-rated)')}
                    onExport={onExport} exportName={`gstr3b_3_1_a_${periodTag}.csv`} />
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="overline" sx={{ fontWeight: 700 }}>3.1(d) — Inward supplies liable to RCM</Typography>
                <TableGrid columns={summaryCols} rows={summaryRow(t.table_3_1_d, 'Inward (RCM)')}
                    onExport={onExport} exportName={`gstr3b_3_1_d_${periodTag}.csv`} />
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="overline" sx={{ fontWeight: 700 }}>4(A) — ITC available (All Other ITC)</Typography>
                <TableGrid columns={itcCols} rows={itcRow}
                    onExport={onExport} exportName={`gstr3b_4a_${periodTag}.csv`} />
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="overline" sx={{ fontWeight: 700 }}>4(B) — ITC Reversed</Typography>
                <TableGrid columns={reversedCols} rows={t.table_4b || []}
                    emptyMsg="No reversals recorded for this period."
                    onExport={onExport} exportName={`gstr3b_4b_${periodTag}.csv`} />
            </Paper>
        </Box>
    );
};

export default GstReturns;
