import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import http, { titleURL } from 'http-common';
import { Box, Button, CircularProgress, Divider, Drawer, FormControlLabel, Switch, TextField, Typography } from '@mui/material';
import {cashFlowAction} from '../../../redux/actions/accountsLedger';

const CashFlow = () => {
    const toInputDate = (date) => {
        const offset = date.getTimezoneOffset();
        const local = new Date(date.getTime() - offset * 60000);
        return local.toISOString().split('T')[0];
    };

    const now = useMemo(() => new Date(), []);
    const startOfMonth = useMemo(() => new Date(now.getFullYear(), now.getMonth(), 1), [now]);

    const [fromDate, setFromDate] = useState(toInputDate(startOfMonth));
    const [toDate, setToDate] = useState(toInputDate(now));
    const [includeZero, setIncludeZero] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [totals, setTotals] = useState({
        operatingTotal: 0,
        investingTotal: 0,
        financingTotal: 0,
        netCashChange: 0,
        unmappedTotal: 0
    });
    const [selectedNode, setSelectedNode] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState(null);
    const [detailsRows, setDetailsRows] = useState([]);
    const [detailsPaging, setDetailsPaging] = useState({ totalRows: 0, limit: 50, offset: 0 });
    const [detailsSearch, setDetailsSearch] = useState('');
    const [expandedIds, setExpandedIds] = useState(() => new Set());

    const fetchSummary = useCallback(async () => {
        if (!fromDate || !toDate) {
            setError('From Date and To Date are required.');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const res = await http.get('/accountsservice/api/cashflow/reports/cash-flow', {
                params: { fromDate, toDate, includeZero }
            });
            const data = res.data || {};
            const rows = Array.isArray(data.nodes) ? data.nodes : [];
            const totalsFromApi = data.totals || {};

            const computedTotals = rows.reduce(
                (acc, node) => {
                    const amount = Number(node.amount || 0);
                    if (node.section === 'Operating') acc.operatingTotal += amount;
                    else if (node.section === 'Investing') acc.investingTotal += amount;
                    else if (node.section === 'Financing') acc.financingTotal += amount;
                    else acc.unmappedTotal += amount;
                    return acc;
                },
                { operatingTotal: 0, investingTotal: 0, financingTotal: 0, unmappedTotal: 0 }
            );

            const netCashChange =
                totalsFromApi.netCashChange !== undefined
                    ? Number(totalsFromApi.netCashChange || 0)
                    : computedTotals.operatingTotal +
                      computedTotals.investingTotal +
                      computedTotals.financingTotal +
                      computedTotals.unmappedTotal;

            setNodes(rows);
            setTotals({
                operatingTotal: Number(totalsFromApi.operatingTotal || computedTotals.operatingTotal),
                investingTotal: Number(totalsFromApi.investingTotal || computedTotals.investingTotal),
                financingTotal: Number(totalsFromApi.financingTotal || computedTotals.financingTotal),
                netCashChange,
                unmappedTotal: Number(totalsFromApi.unmappedTotal || computedTotals.unmappedTotal)
            });
        } catch (err) {
            setNodes([]);
            setTotals({
                operatingTotal: 0,
                investingTotal: 0,
                financingTotal: 0,
                netCashChange: 0,
                unmappedTotal: 0
            });
            setError(err?.response?.data?.message || err.message || 'Failed to load cash flow data.');
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, includeZero]);

    useEffect(() => {
        if (fromDate && toDate) {
            fetchSummary();
        }
    }, []);

    // useEffect(() =>{
    //         cashFlowAction()
    // },[])

    const sectionDefinitions = useMemo(
        () => [
            { key: 'Operating', label: 'Operating Activities' },
            { key: 'Investing', label: 'Investing Activities' },
            { key: 'Financing', label: 'Financing Activities' },
            { key: 'Unmapped', label: 'Unmapped' }
        ],
        []
    );

    const { rootsBySection, childrenMap } = useMemo(() => {
        const byId = new Map();
        const children = new Map();
        nodes.forEach((node) => {
            byId.set(node.id, node);
            if (!children.has(node.parentId || null)) {
                children.set(node.parentId || null, []);
            }
            children.get(node.parentId || null).push(node);
        });

        const roots = new Map();
        sectionDefinitions.forEach((section) => roots.set(section.key, []));

        nodes.forEach((node) => {
            const parentId = node.parentId;
            const hasParent = parentId && byId.has(parentId);
            if (!hasParent) {
                const sectionKey = sectionDefinitions.some((section) => section.key === node.section)
                    ? node.section
                    : 'Unmapped';
                roots.get(sectionKey).push(node);
            }
        });

        return { rootsBySection: roots, childrenMap: children };
    }, [nodes, sectionDefinitions]);

    const formatAmount = (value) => Number(value || 0).toFixed(2);

    const fetchDetails = useCallback(
        async ({ cashFlowId, search = '', limit = 50, offset = 0 }) => {
            if (!cashFlowId || !fromDate || !toDate) return;
            setDetailsLoading(true);
            setDetailsError(null);
            try {
                const res = await http.get('/accountsservice/api/cashflow/reports/cash-flow/details', {
                    params: {
                        cashFlowId,
                        fromDate,
                        toDate,
                        search: search || undefined,
                        limit,
                        offset
                    }
                });
                const data = res.data || {};
                const rows = Array.isArray(data.rows) ? data.rows : [];
                const paging = data.paging || {};
                setDetailsRows(
                    rows.map((row) => ({
                        ...row,
                        debit: Number(row.debit || 0),
                        credit: Number(row.credit || 0),
                        netAmount: Number(row.netAmount !== undefined ? row.netAmount : Number(row.debit || 0) - Number(row.credit || 0))
                    }))
                );
                setDetailsPaging({
                    totalRows: Number(paging.totalRows || 0),
                    limit: Number(paging.limit || limit),
                    offset: Number(paging.offset || offset)
                });
            } catch (err) {
                setDetailsError(err?.response?.data?.message || err.message || 'Failed to load details.');
                setDetailsRows([]);
                setDetailsPaging({ totalRows: 0, limit, offset });
            } finally {
                setDetailsLoading(false);
            }
        },
        [fromDate, toDate]
    );

    const handleNodeClick = (node) => {
        setSelectedNode({ id: node.id, label: node.label || `CashFlow ${node.id}`, section: node.section });
        setDetailsOpen(true);
        setDetailsSearch('');
        const limit = 50;
        const offset = 0;
        setDetailsPaging((prev) => ({ ...prev, limit, offset }));
        fetchDetails({ cashFlowId: node.id, limit, offset });
    };

    const toggleExpanded = (nodeId) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            } else {
                next.add(nodeId);
            }
            return next;
        });
    };

    const renderNodeRows = (node, depth = 0, visited = new Set()) => {
        if (visited.has(node.id)) return [];
        visited.add(node.id);
        const rowsOutput = [];
        const children = childrenMap.get(node.id) || [];
        const hasChildren = children.length > 0;
        const isExpanded = expandedIds.has(node.id);
        const hasCycle = visited.has(node.id);
        const nextVisited = new Set(visited);
        nextVisited.add(node.id);

        rowsOutput.push(
            <tr key={`node-${node.id}`}>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee' }}>
                    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: `${depth * 16}px` }}>
                        {hasChildren ? (
                            <span
                                onClick={(event) => {
                                    event.stopPropagation();
                                    toggleExpanded(node.id);
                                }}
                                style={{ cursor: 'pointer', width: 18, display: 'inline-block' }}
                            >
                                {isExpanded ? '▼' : '▶'}
                            </span>
                        ) : (
                            <span style={{ width: 18, display: 'inline-block' }} />
                        )}
                        <span
                            onClick={() => handleNodeClick(node)}
                            style={{ cursor: 'pointer' }}
                        >
                            {node.label || `CashFlow ${node.id}`}
                            {node.txnCount ? ` (${node.txnCount})` : ''}
                            {hasCycle ? ' (Cycle detected)' : ''}
                        </span>
                    </div>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
                    {formatAmount(node.amount)}
                </td>
            </tr>
        );

        if (hasCycle || depth > 50) {
            return rowsOutput;
        }

        if (hasChildren && isExpanded) {
            children.forEach((child) => {
                rowsOutput.push(...renderNodeRows(child, depth + 1, nextVisited));
            });
        }

        return rowsOutput;
    };

    return (
        <>
            <Helmet>
                <meta charSet='utf-8' />
                <title> {titleURL} | Cash Flow Statement </title>
            </Helmet>

            <Box sx={{ p: 3 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Cash Flow Statement
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Basis: Accrual
                    </Typography>
                    <Typography variant="body2">
                        From {fromDate || '--'} To {toDate || '--'}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
                    <TextField
                        size="small"
                        label="From Date"
                        type="date"
                        value={fromDate}
                        onChange={(event) => setFromDate(event.target.value)}
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                    <TextField
                        size="small"
                        label="To Date"
                        type="date"
                        value={toDate}
                        onChange={(event) => setToDate(event.target.value)}
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={includeZero}
                                onChange={(event) => setIncludeZero(event.target.checked)}
                                color="primary"
                            />
                        }
                        label="Include Zero"
                    />
                    <Button variant="outlined" onClick={fetchSummary}>
                        Refresh
                    </Button>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={22} />
                        <Typography>Loading cash flow...</Typography>
                    </Box>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : nodes.length === 0 ? (
                    <Typography>No cash flow activity found for this period.</Typography>
                ) : (
                    <Box sx={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#fafafa' }}>
                                    <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #eee', color: '#5a5a5a' }}>
                                        PARTICULARS
                                    </th>
                                    <th style={{ textAlign: 'right', padding: '10px 12px', borderBottom: '1px solid #eee', color: '#5a5a5a' }}>
                                        AMOUNT
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sectionDefinitions.map((section) => {
                                    const sectionRoots = rootsBySection.get(section.key) || [];
                                    const sectionHasData = sectionRoots.length > 0 || (section.key === 'Unmapped' && totals.unmappedTotal !== 0);

                                    if (!sectionHasData) return null;

                                    const sectionTotal =
                                        section.key === 'Operating'
                                            ? totals.operatingTotal
                                            : section.key === 'Investing'
                                            ? totals.investingTotal
                                            : section.key === 'Financing'
                                            ? totals.financingTotal
                                            : totals.unmappedTotal;

                                    return (
                                        <React.Fragment key={`section-${section.key}`}>
                                            <tr>
                                                <td colSpan={2} style={{ padding: '12px', fontWeight: 700, borderBottom: '1px solid #eee' }}>
                                                    {section.label}
                                                </td>
                                            </tr>
                                            {sectionRoots.map((node) => renderNodeRows(node, 0))}
                                            <tr>
                                                <td style={{ padding: '10px 12px', borderBottom: '1px solid #eee', fontWeight: 600 }}>
                                                    Net Cash from {section.label}
                                                </td>
                                                <td style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #eee', fontWeight: 600 }}>
                                                    {formatAmount(sectionTotal)}
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Box>
                )}

                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    {totals.unmappedTotal !== 0 && (
                        <Typography variant="subtitle2">Unmapped Total: {formatAmount(totals.unmappedTotal)}</Typography>
                    )}
                    <Typography variant="subtitle2">Net Cash Change: {formatAmount(totals.netCashChange)}</Typography>
                </Box>
            </Box>

            <Drawer
                anchor="right"
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                PaperProps={{ sx: { width: { xs: '100%', sm: 620 } } }}
            >
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {selectedNode?.label || 'Cash Flow Details'}
                        </Typography>
                        <Typography variant="body2">
                            From {fromDate || '--'} To {toDate || '--'}
                        </Typography>
                    </Box>

                    <TextField
                        size="small"
                        label="Search"
                        value={detailsSearch}
                        onChange={(event) => setDetailsSearch(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                fetchDetails({
                                    cashFlowId: selectedNode?.id,
                                    search: detailsSearch,
                                    limit: detailsPaging.limit,
                                    offset: 0
                                });
                                setDetailsPaging((prev) => ({ ...prev, offset: 0 }));
                            }
                        }}
                    />

                    {detailsLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={20} />
                            <Typography>Loading details...</Typography>
                        </Box>
                    ) : detailsError ? (
                        <Typography color="error">{detailsError}</Typography>
                    ) : detailsRows.length === 0 ? (
                        <Typography>No transactions found.</Typography>
                    ) : (
                        <Box sx={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#fafafa' }}>
                                        <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #eee' }}>
                                            Date
                                        </th>
                                        <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #eee' }}>
                                            Transaction Code
                                        </th>
                                        <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #eee' }}>
                                            Account
                                        </th>
                                        <th style={{ textAlign: 'right', padding: '8px 10px', borderBottom: '1px solid #eee' }}>
                                            Debit
                                        </th>
                                        <th style={{ textAlign: 'right', padding: '8px 10px', borderBottom: '1px solid #eee' }}>
                                            Credit
                                        </th>
                                        <th style={{ textAlign: 'right', padding: '8px 10px', borderBottom: '1px solid #eee' }}>
                                            Net
                                        </th>
                                        <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #eee' }}>
                                            Note
                                        </th>
                                        <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #eee' }}>
                                            Entity/Refs
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detailsRows.map((row, idx) => (
                                        <tr key={`${row.transactionId}-${row.transactionEntryId}-${idx}`}>
                                            <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>
                                                {row.transactionDate || '-'}
                                            </td>
                                            <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>
                                                {row.transactionCode || '-'}
                                            </td>
                                            <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>
                                                {row.accountName ? `${row.accountName} (${row.accountCode || ''})` : row.accountCode || '-'}
                                            </td>
                                            <td style={{ padding: '8px 10px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
                                                {formatAmount(row.debit)}
                                            </td>
                                            <td style={{ padding: '8px 10px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
                                                {formatAmount(row.credit)}
                                            </td>
                                            <td style={{ padding: '8px 10px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
                                                {formatAmount(row.netAmount)}
                                            </td>
                                            <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>
                                                {row.transactionNote || '-'}
                                            </td>
                                            <td style={{ padding: '8px 10px', borderBottom: '1px solid #eee' }}>
                                                {row.entity || row.specialNumber || row.receipt_id || row.paymenttrans_id || row.sale_id || row.manualnote_id || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Box>
                    )}

                    <Divider />

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="body2">
                            {detailsPaging.totalRows > 0
                                ? `Showing ${detailsPaging.offset + 1}-${Math.min(
                                      detailsPaging.offset + detailsPaging.limit,
                                      detailsPaging.totalRows
                                  )} of ${detailsPaging.totalRows}`
                                : 'Showing 0'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                size="small"
                                disabled={detailsPaging.offset <= 0 || detailsLoading}
                                onClick={() => {
                                    const nextOffset = Math.max(detailsPaging.offset - detailsPaging.limit, 0);
                                    fetchDetails({
                                        cashFlowId: selectedNode?.id,
                                        search: detailsSearch,
                                        limit: detailsPaging.limit,
                                        offset: nextOffset
                                    });
                                    setDetailsPaging((prev) => ({ ...prev, offset: nextOffset }));
                                }}
                            >
                                Prev
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                disabled={detailsPaging.offset + detailsPaging.limit >= detailsPaging.totalRows || detailsLoading}
                                onClick={() => {
                                    const nextOffset = detailsPaging.offset + detailsPaging.limit;
                                    fetchDetails({
                                        cashFlowId: selectedNode?.id,
                                        search: detailsSearch,
                                        limit: detailsPaging.limit,
                                        offset: nextOffset
                                    });
                                    setDetailsPaging((prev) => ({ ...prev, offset: nextOffset }));
                                }}
                            >
                                Next
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Drawer>
        </>

    );
};

export default CashFlow;
