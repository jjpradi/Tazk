import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, Typography, Button, Chip, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    LinearProgress, Tooltip, Tab, Tabs, Paper,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import LockClockIcon from '@mui/icons-material/LockClock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { titleURL } from 'http-common';
import PeriodLockService from '../../services/periodLock_service';
import { OpenalertActions } from '../../redux/actions/alert_actions';
import { useDispatch } from 'react-redux';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const FY_MONTHS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

function getCurrentFYStartYear() {
    const now = new Date();
    return now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
}

function buildFYRow(fyStartYear, rowsByFy) {
    const existing = rowsByFy.get(fyStartYear);
    if (existing) return existing;

    const months = FY_MONTHS.map((m) => ({
        period_month: m,
        period_year: m >= 4 ? fyStartYear : fyStartYear + 1,
        month_label: `${MONTH_NAMES[m - 1]} ${m >= 4 ? fyStartYear : fyStartYear + 1}`,
        locked: false,
        locked_by: null,
        locked_at: null,
    }));
    return {
        financialYear: fyStartYear,
        label: `${fyStartYear}-${fyStartYear + 1}`,
        locked: false,
        months,
    };
}

function getDisplayFYs() {
    const current = getCurrentFYStartYear();
    const years = [];
    for (let i = 0; i >= -5; i--) {
        years.push(current + i);
    }
    years.unshift(current + 1);
    return years;
}

function fyStatus(fyRow) {
    const lockedCount = fyRow.months.filter((m) => m.locked).length;
    if (lockedCount === 12) return { label: 'Locked', color: 'error' };
    if (lockedCount === 0) return { label: 'Open', color: 'success' };
    return { label: `Partial (${lockedCount}/12)`, color: 'warning' };
}

function latestLockInfo(fyRow) {
    const lockedMonths = fyRow.months.filter((m) => m.locked && m.locked_at);
    if (lockedMonths.length === 0) return { by: null, at: null };
    const latest = lockedMonths.reduce((acc, m) => {
        return !acc || new Date(m.locked_at) > new Date(acc.locked_at) ? m : acc;
    }, null);
    return { by: latest?.locked_by || null, at: latest?.locked_at || null };
}

function formatAmount(val) {
    if (val === null || val === undefined || val === '') return '-';
    const n = Number(val);
    if (Number.isNaN(n)) return val;
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function FYRow({ fyRow, onAction, onView, formatDate }) {
    const status = fyStatus(fyRow);
    const { by, at } = latestLockInfo(fyRow);
    const fullyLocked = status.label === 'Locked';
    const rowBg = fullyLocked ? '#FFF8F8' : 'inherit';

    return (
        <TableRow hover sx={{ bgcolor: rowBg }}>
            <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>FY {fyRow.label}</TableCell>
            <TableCell>
                <Chip
                    icon={fullyLocked ? <LockIcon sx={{ fontSize: 14 }} /> : <LockOpenIcon sx={{ fontSize: 14 }} />}
                    label={status.label}
                    size="small"
                    color={status.color}
                    variant="outlined"
                    sx={{ fontSize: 11 }}
                />
            </TableCell>
            <TableCell sx={{ fontSize: 12, color: '#666' }}>{by || '-'}</TableCell>
            <TableCell sx={{ fontSize: 12, color: '#666' }}>{at}</TableCell>
            <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title="View pending records" arrow>
                        <IconButton size="small" color="primary" onClick={() => onView(fyRow)}>
                            <VisibilityIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                    {fullyLocked ? (
                        <Button
                            size="small" color="success" variant="outlined"
                            startIcon={<LockOpenIcon sx={{ fontSize: 14 }} />}
                            onClick={() => onAction('unlock', fyRow)}
                            sx={{ fontSize: 11, textTransform: 'none' }}
                        >
                            Unlock FY
                        </Button>
                    ) : (
                        <Button
                            size="small" color="error" variant="outlined"
                            startIcon={<LockIcon sx={{ fontSize: 14 }} />}
                            onClick={() => onAction('lock', fyRow)}
                            sx={{ fontSize: 11, textTransform: 'none' }}
                        >
                            Lock FY
                        </Button>
                    )}
                </Box>
            </TableCell>
        </TableRow>
    );
}

function SummaryCounts({ counts, loading }) {
    const cheques = counts?.unclearedCheques?.count ?? 0;
    const payments = counts?.unreconciledPayments?.count ?? 0;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {loading && <LinearProgress />}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Paper variant="outlined" sx={{ p: 1.5, flex: 1, bgcolor: cheques > 0 ? '#FFF8F0' : '#F8FAFC' }}>
                    <Typography sx={{ fontSize: 11, color: '#666' }}>Uncleared / Held Cheques</Typography>
                    <Typography sx={{ fontSize: 20, fontWeight: 700, color: cheques > 0 ? '#E65100' : '#2E3A59' }}>
                        {loading ? '—' : cheques}
                    </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 1.5, flex: 1, bgcolor: payments > 0 ? '#FFF8F0' : '#F8FAFC' }}>
                    <Typography sx={{ fontSize: 11, color: '#666' }}>Unreconciled Payments</Typography>
                    <Typography sx={{ fontSize: 20, fontWeight: 700, color: payments > 0 ? '#E65100' : '#2E3A59' }}>
                        {loading ? '—' : payments}
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
}

function ChequesTable({ data, loading, page, rowsPerPage, onPageChange, onRowsPerPageChange, formatDate }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {loading && <LinearProgress />}
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 440 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Cheque No</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Party</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Bank</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA', textAlign: 'right' }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(!data?.items || data.items.length === 0) && !loading ? (
                            <TableRow>
                                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#999', fontSize: 12 }}>
                                    No uncleared cheques for this financial year
                                </TableCell>
                            </TableRow>
                        ) : (data?.items || []).map((row) => (
                            <TableRow key={`chq-${row.id}`} hover>
                                <TableCell sx={{ fontSize: 11 }}>{formatDate(row.date)}</TableCell>
                                <TableCell sx={{ fontSize: 11, fontWeight: 500 }}>{row.cheque_number || '-'}</TableCell>
                                <TableCell sx={{ fontSize: 11 }}>
                                    {row.party_name || '-'}
                                    {row.party_type && row.party_type !== '-' && (
                                        <Typography component="span" sx={{ fontSize: 10, color: '#999', ml: 0.5 }}>
                                            ({row.party_type})
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell sx={{ fontSize: 11 }}>{row.bankName || '-'}</TableCell>
                                <TableCell sx={{ fontSize: 11, textAlign: 'right' }}>{formatAmount(row.amount)}</TableCell>
                                <TableCell sx={{ fontSize: 11 }}>
                                    <Chip label={row.status || 'Pending'} size="small" color="warning" variant="outlined" sx={{ fontSize: 10 }} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={data?.count ?? 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                rowsPerPageOptions={[25, 50, 100]}
                sx={{ '& .MuiTablePagination-toolbar': { minHeight: 40 }, fontSize: 11 }}
            />
        </Box>
    );
}

function UnreconciledTable({ data, loading, page, rowsPerPage, onPageChange, onRowsPerPageChange, formatDate }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {loading && <LinearProgress />}
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 440 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Ledger</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Receipt Number</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Cheque No</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Bank</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Reference</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA', textAlign: 'right' }}>Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(!data?.items || data.items.length === 0) && !loading ? (
                            <TableRow>
                                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#999', fontSize: 12 }}>
                                    No unreconciled payments for this financial year
                                </TableCell>
                            </TableRow>
                        ) : (data?.items || []).map((row) => (
                            <TableRow key={`pay-${row.id}`} hover>
                                <TableCell sx={{ fontSize: 11 }}>{formatDate(row.date)}</TableCell>
                                <TableCell sx={{ fontSize: 11 }}>{row.ledger_name || '-'}</TableCell>
                                <TableCell sx={{ fontSize: 11 }}>{row.receipt_number || '-'}</TableCell>
                                <TableCell sx={{ fontSize: 11 }}>{row.chequeNumber || '-'}</TableCell>
                                <TableCell sx={{ fontSize: 11 }}>{row.bankName || '-'}</TableCell>
                                <TableCell sx={{ fontSize: 11 }}>{row.referenceNumber || row.purpose || '-'}</TableCell>
                                <TableCell sx={{ fontSize: 11, textAlign: 'right' }}>{formatAmount(row.amount)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={data?.count ?? 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                rowsPerPageOptions={[25, 50, 100]}
                sx={{ '& .MuiTablePagination-toolbar': { minHeight: 40 }, fontSize: 11 }}
            />
        </Box>
    );
}

export default function PeriodLock() {
    const dispatch = useDispatch();
    const [fyRows, setFyRows] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabIndex, setTabIndex] = useState(0);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, fyRow: null });
    const [reason, setReason] = useState('');
    const [saving, setSaving] = useState(false);

    // Summary counts (used by confirm dialog + view dialog header)
    const [summaryCache, setSummaryCache] = useState({});
    const [confirmSummary, setConfirmSummary] = useState({ loading: false, data: null });

    // View records dialog
    const [viewDialog, setViewDialog] = useState({ open: false, fyRow: null, returnToConfirm: null });
    const [viewTab, setViewTab] = useState(0);
    const [chequeData, setChequeData] = useState({ count: 0, items: [] });
    const [chequePage, setChequePage] = useState(0);
    const [chequeRowsPerPage, setChequeRowsPerPage] = useState(25);
    const [chequeLoading, setChequeLoading] = useState(false);
    const [unrecData, setUnrecData] = useState({ count: 0, items: [] });
    const [unrecPage, setUnrecPage] = useState(0);
    const [unrecRowsPerPage, setUnrecRowsPerPage] = useState(25);
    const [unrecLoading, setUnrecLoading] = useState(false);

    useEffect(() => {
        loadLocks();
    }, []);

    const loadLocks = async () => {
        setLoading(true);
        try {
            const res = await PeriodLockService.getAll();
            const data = res.data?.data || res.data || [];
            const received = Array.isArray(data) ? data : [];

            const byFy = new Map(received.map((r) => [r.financialYear, r]));
            const displayed = getDisplayFYs().map((fy) => buildFYRow(fy, byFy));

            for (const row of received) {
                if (!displayed.find((d) => d.financialYear === row.financialYear)) {
                    displayed.push(row);
                }
            }
            displayed.sort((a, b) => b.financialYear - a.financialYear);
            setFyRows(displayed);
        } catch (err) {
            console.error(err);
        }
        finally { setLoading(false); }
    };

    const loadAuditLogs = async () => {
        setLoading(true);
        try {
            const res = await PeriodLockService.getAuditLogs(100, 0);
            const data = res.data?.data || res.data || [];
            setAuditLogs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
        finally { setLoading(false); }
    };

    const fetchSummary = async (fyStartYear) => {
        if (summaryCache[fyStartYear]) return summaryCache[fyStartYear];
        const res = await PeriodLockService.getFYSummary(fyStartYear);
        const data = res.data?.data || null;
        setSummaryCache((prev) => ({ ...prev, [fyStartYear]: data }));
        return data;
    };

    const loadCheques = useCallback(async (fyStartYear, page, rowsPerPage) => {
        setChequeLoading(true);
        try {
            const res = await PeriodLockService.getUnclearedCheques(fyStartYear, rowsPerPage, page * rowsPerPage);
            const data = res.data?.data;
            setChequeData({
                count: data?.count ?? 0,
                items: data?.items ?? [],
            });
        } catch (err) {
            console.error(err);
            setChequeData({ count: 0, items: [] });
        } finally {
            setChequeLoading(false);
        }
    }, []);

    const loadUnreconciled = useCallback(async (fyStartYear, page, rowsPerPage) => {
        setUnrecLoading(true);
        try {
            const res = await PeriodLockService.getUnreconciledPayments(fyStartYear, rowsPerPage, page * rowsPerPage);
            const data = res.data?.data;
            setUnrecData({
                count: data?.count ?? 0,
                items: data?.items ?? [],
            });
        } catch (err) {
            console.error(err);
            setUnrecData({ count: 0, items: [] });
        } finally {
            setUnrecLoading(false);
        }
    }, []);

    const handleTabChange = (_, newVal) => {
        setTabIndex(newVal);
        if (newVal === 1) loadAuditLogs();
    };

    const handleAction = async (action, fyRow) => {
        setConfirmDialog({ open: true, action, fyRow });
        setReason('');
        setConfirmSummary({ loading: false, data: null });

        if (action === 'lock') {
            setConfirmSummary({ loading: true, data: null });
            try {
                const data = await fetchSummary(fyRow.financialYear);
                setConfirmSummary({ loading: false, data });
            } catch (err) {
                console.error(err);
                setConfirmSummary({ loading: false, data: null });
            }
        }
    };

    const handleView = async (fyRow, options = {}) => {
        setViewDialog({
            open: true,
            fyRow,
            returnToConfirm: options.returnToConfirm || null,
        });
        setViewTab(0);
        setChequePage(0);
        setUnrecPage(0);
        setChequeData({ count: 0, items: [] });
        setUnrecData({ count: 0, items: [] });
        loadCheques(fyRow.financialYear, 0, chequeRowsPerPage);
        loadUnreconciled(fyRow.financialYear, 0, unrecRowsPerPage);
    };

    const closeView = () => {
        const returnTo = viewDialog.returnToConfirm;
        setViewDialog({ open: false, fyRow: null, returnToConfirm: null });

        if (returnTo && returnTo.fyRow) {
            setConfirmDialog({ open: true, action: returnTo.action, fyRow: returnTo.fyRow });
            if (returnTo.action === 'lock') {
                setConfirmSummary({ loading: true, data: null });
                fetchSummary(returnTo.fyRow.financialYear)
                    .then((data) => setConfirmSummary({ loading: false, data }))
                    .catch((err) => {
                        console.error(err);
                        setConfirmSummary({ loading: false, data: null });
                    });
            }
        }
    };

    const handleChequePageChange = (_, newPage) => {
        setChequePage(newPage);
        if (viewDialog.fyRow) loadCheques(viewDialog.fyRow.financialYear, newPage, chequeRowsPerPage);
    };

    const handleChequeRowsPerPageChange = (e) => {
        const newRows = parseInt(e.target.value, 10);
        setChequeRowsPerPage(newRows);
        setChequePage(0);
        if (viewDialog.fyRow) loadCheques(viewDialog.fyRow.financialYear, 0, newRows);
    };

    const handleUnrecPageChange = (_, newPage) => {
        setUnrecPage(newPage);
        if (viewDialog.fyRow) loadUnreconciled(viewDialog.fyRow.financialYear, newPage, unrecRowsPerPage);
    };

    const handleUnrecRowsPerPageChange = (e) => {
        const newRows = parseInt(e.target.value, 10);
        setUnrecRowsPerPage(newRows);
        setUnrecPage(0);
        if (viewDialog.fyRow) loadUnreconciled(viewDialog.fyRow.financialYear, 0, newRows);
    };

    const handleConfirm = async () => {
        const { action, fyRow } = confirmDialog;
        if (!fyRow) return;
        setSaving(true);
        try {
            const payload = { financialYear: fyRow.financialYear, reason };
            if (action === 'lock') {
                await PeriodLockService.lock(payload);
                dispatch(OpenalertActions({
                    msg: `FY ${fyRow.label} locked successfully`,
                    severity: 'success',
                }));
            } else {
                await PeriodLockService.unlock(payload);
                dispatch(OpenalertActions({
                    msg: `FY ${fyRow.label} unlocked successfully`,
                    severity: 'success',
                }));
            }
            setConfirmDialog({ open: false, action: null, fyRow: null });
            setConfirmSummary({ loading: false, data: null });
            setSummaryCache((prev) => {
                const next = { ...prev };
                delete next[fyRow.financialYear];
                return next;
            });
            loadLocks();
        } catch (err) {
            dispatch(OpenalertActions({
                msg: err.response?.data?.message || 'Operation failed',
                severity: 'error',
            }));
        }
        finally { setSaving(false); }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const formatDateShort = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getActionChipColor = (action) => {
        switch (action) {
            case 'LOCK': return 'error';
            case 'UNLOCK': return 'success';
            default: return 'default';
        }
    };

    return (
        <>
            <Helmet><title>{titleURL} | Period Lock</title></Helmet>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', gap: 1.5 }}>

                <Card sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} elevation={0}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <LockClockIcon sx={{ color: '#1976d2' }} />
                        <Box>
                            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#2E3A59' }}>
                                Period Lock
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: '#999' }}>
                                Lock financial years to prevent create, update or delete on accounting transactions. All users — including administrators — are restricted from modifying transactions in a locked period.
                            </Typography>
                        </Box>
                    </Box>
                </Card>

                <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} elevation={0}>
                    <Tabs value={tabIndex} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 40 }}>
                        <Tab label="Financial Years" icon={<LockIcon sx={{ fontSize: 16 }} />} iconPosition="start"
                            sx={{ minHeight: 40, fontSize: 12, textTransform: 'none' }} />
                        <Tab label="Audit Log" icon={<HistoryIcon sx={{ fontSize: 16 }} />} iconPosition="start"
                            sx={{ minHeight: 40, fontSize: 12, textTransform: 'none' }} />
                    </Tabs>

                    {loading && <LinearProgress />}

                    {tabIndex === 0 && (
                        <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Financial Year</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Locked By</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Locked At</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', width: 200 }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fyRows.map((fyRow) => (
                                        <FYRow
                                            key={fyRow.financialYear}
                                            fyRow={fyRow}
                                            onAction={handleAction}
                                            onView={handleView}
                                            formatDate={formatDate}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {tabIndex === 1 && (
                        <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Action</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Financial Year</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>User</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA' }}>Reason</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {auditLogs.length === 0 && !loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: '#999' }}>
                                                No audit logs found
                                            </TableCell>
                                        </TableRow>
                                    ) : auditLogs.map((log) => {
                                        const fy = log.period_year;
                                        const fyLabel = `FY ${fy}-${fy + 1}`;
                                        return (
                                            <TableRow key={log.id} hover>
                                                <TableCell sx={{ fontSize: 12 }}>{formatDate(log.created_at)}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={log.action}
                                                        size="small"
                                                        color={getActionChipColor(log.action)}
                                                        variant="outlined"
                                                        sx={{ fontSize: 10 }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>
                                                    {fyLabel}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: 12 }}>
                                                    {[log.first_name, log.last_name].filter(Boolean).join(' ') || `Employee #${log.employee_id}`}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: 12, color: '#666', maxWidth: 240 }}>
                                                    <Tooltip title={log.reason || ''} arrow>
                                                        <Typography noWrap sx={{ fontSize: 12 }}>{log.reason || '-'}</Typography>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Card>
            </Box>

            {/* Lock / Unlock confirm dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={() => {
                    setConfirmDialog({ open: false, action: null, fyRow: null });
                    setConfirmSummary({ loading: false, data: null });
                }}
                maxWidth={confirmDialog.action === 'lock' ? 'sm' : 'xs'}
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {confirmDialog.action === 'lock' ? 'Lock Financial Year' : 'Unlock Financial Year'}
                    <IconButton size="small" onClick={() => {
                        setConfirmDialog({ open: false, action: null, fyRow: null });
                        setConfirmSummary({ loading: false, data: null });
                    }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Typography sx={{ fontSize: 13 }}>
                            {confirmDialog.action === 'lock'
                                ? `Are you sure you want to lock FY ${confirmDialog.fyRow?.label}? All 12 months (April ${confirmDialog.fyRow?.financialYear} to March ${confirmDialog.fyRow ? confirmDialog.fyRow.financialYear + 1 : ''}) will be locked. No user — including administrators — will be able to create, update or delete transactions, including Invoices, Bills, Receipts, Payments, Pay In, Pay Out, Contra, Journal Entry and additional entries from Bank Reconciliation in this period.`
                                : `Are you sure you want to unlock FY ${confirmDialog.fyRow?.label}? All 12 months will be unlocked and users will be able to post transactions again.`
                            }
                        </Typography>

                        {confirmDialog.action === 'lock' && (
                            <Box>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#2E3A59', mb: 1 }}>
                                    Pending items in this financial year
                                </Typography>
                                <SummaryCounts counts={confirmSummary.data} loading={confirmSummary.loading} />
                                <Button
                                    size="small"
                                    startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                                    onClick={() => {
                                        const fy = confirmDialog.fyRow;
                                        const action = confirmDialog.action;
                                        setConfirmDialog({ open: false, action: null, fyRow: null });
                                        setConfirmSummary({ loading: false, data: null });
                                        if (fy) handleView(fy, { returnToConfirm: { action, fyRow: fy } });
                                    }}
                                    sx={{ fontSize: 11, textTransform: 'none', mt: 1 }}
                                >
                                    View details
                                </Button>
                            </Box>
                        )}

                        <TextField
                            fullWidth size="small"
                            label="Remarks (optional)"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            multiline rows={2}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setConfirmDialog({ open: false, action: null, fyRow: null });
                        setConfirmSummary({ loading: false, data: null });
                    }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color={confirmDialog.action === 'lock' ? 'error' : 'success'}
                        onClick={handleConfirm}
                        disabled={saving}
                        startIcon={confirmDialog.action === 'lock' ? <LockIcon /> : <LockOpenIcon />}
                    >
                        {saving ? 'Processing...' : confirmDialog.action === 'lock' ? 'Lock FY' : 'Unlock FY'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View records dialog */}
            <Dialog
                open={viewDialog.open}
                onClose={closeView}
                maxWidth="md" fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Pending Records — FY {viewDialog.fyRow?.label}
                    <IconButton size="small" onClick={closeView}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Tabs
                        value={viewTab}
                        onChange={(_, v) => setViewTab(v)}
                        sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 40, mb: 2 }}
                    >
                        <Tab
                            label={`Uncleared Cheques (${chequeData.count})`}
                            sx={{ minHeight: 40, fontSize: 12, textTransform: 'none' }}
                        />
                        <Tab
                            label={`Unreconciled Payments (${unrecData.count})`}
                            sx={{ minHeight: 40, fontSize: 12, textTransform: 'none' }}
                        />
                    </Tabs>

                    {viewTab === 0 && (
                        <ChequesTable
                            data={chequeData}
                            loading={chequeLoading}
                            page={chequePage}
                            rowsPerPage={chequeRowsPerPage}
                            onPageChange={handleChequePageChange}
                            onRowsPerPageChange={handleChequeRowsPerPageChange}
                            formatDate={formatDateShort}
                        />
                    )}
                    {viewTab === 1 && (
                        <UnreconciledTable
                            data={unrecData}
                            loading={unrecLoading}
                            page={unrecPage}
                            rowsPerPage={unrecRowsPerPage}
                            onPageChange={handleUnrecPageChange}
                            onRowsPerPageChange={handleUnrecRowsPerPageChange}
                            formatDate={formatDateShort}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeView}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
