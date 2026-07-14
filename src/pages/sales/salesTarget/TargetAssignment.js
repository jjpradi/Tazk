import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {
  Box, Card, Typography, Button, Chip, IconButton, Tooltip,
  CircularProgress, TextField, Collapse, MenuItem, Select, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CalculateIcon from '@mui/icons-material/Calculate';
import PublishIcon from '@mui/icons-material/Publish';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import HistoryIcon from '@mui/icons-material/History';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { titleURL } from 'http-common';
import { TargetLetterPdf } from './components/TargetPdf';
import SalesTargetService from '../../../services/salesTarget_services';
import {
  getPeriodByIdAction,
  getTargetsAction,
  computeAchievementAction,
  publishPeriodAction,
  lockPeriodAction,
  getPeriodsAction,
} from '../../../redux/actions/salesTarget_actions';
import { OpenalertActions } from '../../../redux/actions/alert_actions';

const STATUS_MAP = {
  draft: { label: 'Draft', color: 'default' },
  published: { label: 'Published', color: 'info' },
  locked: { label: 'Locked', color: 'warning' },
  closed: { label: 'Closed', color: 'success' },
};

export default function TargetAssignment() {
  const { periodId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const context = useContext(CreateNewButtonContext);
  const headerLocationId = context.headerLocationId;
  const { periodDetail } = useSelector((state) => state.salesTargetReducer);

  const [salesmenRows, setSalesmenRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [revisionLog, setRevisionLog] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [suggestions, setSuggestions] = useState({});
  const [suggestBasis, setSuggestBasis] = useState('');

  useEffect(() => {
  if (periodId) {
    const loadAll = async () => {
      await dispatch(getPeriodByIdAction(periodId));
      loadSalesmenWithTargets();
      loadRevisionLog();
    };
    loadAll();
  }
}, [periodId, headerLocationId]);

 const loadRevisionLog = async () => {
  try {
    const res = await SalesTargetService.getApprovalLog({ entity_type: 'target_period', entity_id: periodId });
    setRevisionLog(res.data?.data || []);
  } catch (err) {
    if (err?.response?.status === 403 && err?.response?.data?.message === 'token_expired') {
      try {
        await new Promise(r => setTimeout(r, 1500));
        const res = await SalesTargetService.getApprovalLog({ entity_type: 'target_period', entity_id: periodId });
        setRevisionLog(res.data?.data || []);
      } catch (_) { /* give up */ }
    }
  }
};


  const loadSalesmenWithTargets = async () => {
    setLoadingTeam(true);
    try {
      const locFilter = headerLocationId && headerLocationId !== 'null' ? { location_id: headerLocationId } : {};
      const teamRes = await SalesTargetService.getTeam(locFilter);
      const teamData = teamRes.data?.data?.rows || teamRes.data?.data || [];
      const teamList = Array.isArray(teamData) ? teamData : [];

      const targetParams = { period_id: periodId, ...locFilter };
      const targetRes = await SalesTargetService.getTargets(targetParams);
      const targetData = targetRes.data?.data?.rows || targetRes.data?.data || [];
      const existingTargets = Array.isArray(targetData) ? targetData : [];

      const targetMap = {};
      existingTargets.forEach(t => { if (t.employee_id) targetMap[t.employee_id] = t; });

      const rows = teamList.map((emp) => {
        const existing = targetMap[emp.employee_id] || {};
        return {
          employee_id: emp.employee_id,
          employee_name: emp.employee_name || `Employee ${emp.employee_id}`,
          location_id: emp.location_id,
          location_name: emp.location_name || '',
          role_name: emp.role_name || '',
          reporting_manager_id: emp.reporting_manager_id,
          target_value: existing.target_value || '',
          target_quantity: existing.target_quantity || '',
          target_collection: existing.target_collection || '',
          target_new_customers: existing.target_new_customers || '',
          achieved_value: existing.achieved_value || 0,
          achievement_pct: existing.achievement_pct || 0,
        };
      });

      setSalesmenRows(rows);
    } catch (err) {
      console.error('Failed to load team:', err);
    } finally {
      setLoadingTeam(false);
    }
  };

  const period = periodDetail;
  const statusCfg = STATUS_MAP[period?.status] || STATUS_MAP.draft;
  const isEditable = period?.status === 'draft' || period?.status === 'published';

  const handleCellChange = (employeeId, field, value) => {
    setSalesmenRows(prev => prev.map(row =>
      row.employee_id === employeeId ? { ...row, [field]: value } : row
    ));
  };

  const handleSave = async () => {
    const targetsToSave = salesmenRows
      .filter(r => r.target_value || r.target_quantity || r.target_collection || r.target_new_customers)
      .map(r => ({
        period_id: Number(periodId),
        target_level: 'salesman',
        employee_id: r.employee_id,
        location_id: r.location_id || null,
        target_value: Number(r.target_value) || 0,
        target_quantity: Number(r.target_quantity) || 0,
        target_collection: Number(r.target_collection) || 0,
        target_new_customers: Number(r.target_new_customers) || 0,
      }));

    if (targetsToSave.length === 0) {
      dispatch(OpenalertActions({ msg: 'Enter at least one target value', severity: 'warning' }));
      return;
    }

    setSaving(true);
    try {
      await SalesTargetService.createTargetsBulk({ targets: targetsToSave });
      dispatch(OpenalertActions({ msg: `${targetsToSave.length} targets saved`, severity: 'success' }));
      loadSalesmenWithTargets();
    } catch (err) {
      dispatch(OpenalertActions({ msg: 'Failed to save targets', severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  const handleComputeAchievement = () => {
    dispatch(computeAchievementAction(Number(periodId), () => loadSalesmenWithTargets()));
  };

  const handlePublish = () => {
    dispatch(publishPeriodAction(Number(periodId), () => {
      dispatch(getPeriodByIdAction(periodId));
      dispatch(getPeriodsAction());
    }));
  };

  const handleLock = () => {
    dispatch(lockPeriodAction(Number(periodId), () => {
      dispatch(getPeriodByIdAction(periodId));
      dispatch(getPeriodsAction());
    }));
  };

  const handleSuggest = async (basis) => {
    if (!period?.period_month || !period?.period_year) {
      dispatch(OpenalertActions({ msg: 'Period month/year not available', severity: 'warning' }));
      return;
    }
    setSuggestBasis(basis);
    try {
      const params = {
        period_month: period.period_month,
        period_year: period.period_year,
        basis,
      };
      // Pass location for history_ratio
      if (headerLocationId && headerLocationId !== 'null') {
        params.location_id = headerLocationId;
      }
      const res = await SalesTargetService.autoSuggest(params);
      const data = res.data?.data || [];
      const sugMap = {};
      (Array.isArray(data) ? data : []).forEach(s => { sugMap[s.employee_id] = s.suggested_value; });
      setSuggestions(sugMap);
    } catch (err) {
      dispatch(OpenalertActions({ msg: 'Failed to load suggestions', severity: 'error' }));
    }
  };

  const handleApplySuggestions = () => {
    setSalesmenRows(prev => prev.map(row => {
      const suggested = suggestions[row.employee_id];
      if (suggested !== undefined) {
        return { ...row, target_value: Math.round(suggested) };
      }
      return row;
    }));
    dispatch(OpenalertActions({ msg: 'Suggestions applied to Target Value. Review and Save.', severity: 'info' }));
  };

  const fileInputRef = useRef(null);

  const handleExportExcel = () => {
    const headers = ['Employee ID', 'Salesman Name', 'Location', 'Target Value', 'Target Qty', 'Collection', 'New Customers'];
    const titleRow = [period?.period_name || 'Target Assignment'];
    const wsData = [titleRow, [], headers];

    salesmenRows.forEach((row) => {
      wsData.push([
        row.employee_id,
        row.employee_name,
        row.location_name || '',
        Number(row.target_value) || 0,
        Number(row.target_quantity) || 0,
        Number(row.target_collection) || 0,
        Number(row.target_new_customers) || 0,
      ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Merge title row
    ws['!merges'] = [{ s: { c: 0, r: 0 }, e: { c: headers.length - 1, r: 0 } }];
    const titleCell = XLSX.utils.encode_cell({ c: 0, r: 0 });
    if (ws[titleCell]) {
      ws[titleCell].s = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } };
    }

    // Style header row (row index 2)
    headers.forEach((_, i) => {
      const addr = XLSX.utils.encode_cell({ c: i, r: 2 });
      if (ws[addr]) {
        ws[addr].s = { font: { bold: true, sz: 11 }, fill: { fgColor: { rgb: 'F5F7FA' } } };
      }
    });

    ws['!cols'] = [
      { wch: 14 }, // Employee ID
      { wch: 25 }, // Name
      { wch: 18 }, // Location
      { wch: 14 }, // Target Value
      { wch: 12 }, // Target Qty
      { wch: 14 }, // Collection
      { wch: 14 }, // New Customers
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Targets');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    const buf = new ArrayBuffer(wbout.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xff;
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `Targets_${period?.period_name || 'export'}.xlsx`);
  };

  const handleImportExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // reset so same file can be re-selected

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

        let matched = 0;
        const updated = salesmenRows.map((row) => {
          // Match by employee_id (column: "Employee ID")
          const importRow = rows.find((r) => String(r['Employee ID']) === String(row.employee_id));
          if (importRow) {
            matched++;
            return {
              ...row,
              target_value: importRow['Target Value'] !== '' ? Number(importRow['Target Value']) || 0 : row.target_value,
              target_quantity: importRow['Target Qty'] !== '' ? Number(importRow['Target Qty']) || 0 : row.target_quantity,
              target_collection: importRow['Collection'] !== '' ? Number(importRow['Collection']) || 0 : row.target_collection,
              target_new_customers: importRow['New Customers'] !== '' ? Number(importRow['New Customers']) || 0 : row.target_new_customers,
            };
          }
          return row;
        });

        setSalesmenRows(updated);
        dispatch(OpenalertActions({ msg: `Imported ${matched} of ${rows.length} rows. Review and click Save.`, severity: matched > 0 ? 'success' : 'warning' }));
      } catch (err) {
        console.error('Excel import failed:', err);
        dispatch(OpenalertActions({ msg: 'Failed to parse Excel file', severity: 'error' }));
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <Helmet><title>{titleURL} | Target Assignment</title></Helmet>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)', gap: 2 }}>
        {/* Top Bar */}
        <Card sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Tooltip title="Back to Periods">
                <IconButton size="small" onClick={() => navigate('/sales/targetPeriods')}>
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#2E3A59' }}>
                {period?.period_name || 'Target Assignment'}
              </Typography>
              <Chip label={statusCfg.label} color={statusCfg.color} size="small" variant="outlined" />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {salesmenRows.length > 0 && (
                <>
                  <Button variant="outlined" size="small" startIcon={<FileDownloadIcon />}
                    onClick={handleExportExcel} sx={{ textTransform: 'none' }}>
                    Export
                  </Button>
                  <TargetLetterPdf periodName={period?.period_name} rows={salesmenRows} />
                </>
              )}
              {isEditable && (
                <>
                  <Button variant="outlined" size="small" startIcon={<FileUploadIcon />}
                    onClick={() => fileInputRef.current?.click()} sx={{ textTransform: 'none' }}>
                    Import
                  </Button>
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls" hidden onChange={handleImportExcel} />
                </>
              )}
              {isEditable && (
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Auto-Suggest</InputLabel>
                  <Select label="Auto-Suggest" value="" onChange={(e) => handleSuggest(e.target.value)}>
                    <MenuItem value="avg_3m">Avg 3 Months</MenuItem>
                    <MenuItem value="avg_6m">Avg 6 Months</MenuItem>
                    <MenuItem value="last_year_same_month">Last Year Same Month</MenuItem>
                    <MenuItem value="growth_pct">Avg 3M + 10% Growth</MenuItem>
                    <MenuItem value="history_ratio">Split by Sales Ratio</MenuItem>
                    <MenuItem value="smart">Smart Suggest (AI)</MenuItem>
                  </Select>
                </FormControl>
              )}
              {isEditable && Object.keys(suggestions).length > 0 && (
                <Button variant="outlined" size="small" color="success"
                  onClick={handleApplySuggestions} sx={{ textTransform: 'none' }}>
                  Apply Suggestions
                </Button>
              )}
              {isEditable && (
                <Button
                  variant="contained" size="small"
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  onClick={handleSave} disabled={saving}
                  sx={{ textTransform: 'none' }}
                >
                  Save Targets
                </Button>
              )}
              {period?.status !== 'closed' && salesmenRows.some(r => r.target_value) && (
                <Button variant="outlined" size="small" startIcon={<CalculateIcon />}
                  onClick={handleComputeAchievement} sx={{ textTransform: 'none' }}>
                  Compute Achievement
                </Button>
              )}
              {period?.status === 'draft' && (
                <Button variant="contained" size="small" color="info" startIcon={<PublishIcon />}
                  onClick={handlePublish} sx={{ textTransform: 'none' }}>Publish</Button>
              )}
              {period?.status === 'published' && (
                <Button variant="contained" size="small" color="warning" startIcon={<LockIcon />}
                  onClick={handleLock} sx={{ textTransform: 'none' }}>Lock</Button>
              )}
              {(period?.status === 'locked' || period?.status === 'closed') && (
                <Button variant="outlined" size="small" color="warning" startIcon={<LockOpenIcon />}
                  onClick={async () => {
                    try {
                      await SalesTargetService.updatePeriodStatus(periodId, { status: 'draft' });
                      dispatch(OpenalertActions({ msg: 'Period reopened for revision', severity: 'success' }));
                      dispatch(getPeriodByIdAction(periodId));
                      dispatch(getPeriodsAction());
                      loadRevisionLog();
                    } catch (err) {
                      dispatch(OpenalertActions({ msg: 'Failed to reopen period', severity: 'error' }));
                    }
                  }}
                  sx={{ textTransform: 'none' }}>
                  Revise
                </Button>
              )}
              {revisionLog.length > 0 && (
                <Tooltip title="Revision History">
                  <IconButton size="small" onClick={() => setShowHistory(!showHistory)}>
                    <HistoryIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Card>

        {/* Revision History */}
        <Collapse in={showHistory}>
          <Card sx={{ p: 2 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#2E3A59', mb: 1 }}>
              Revision History
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>From</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>To</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>By</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 11, bgcolor: '#F5F7FA' }}>Comments</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {revisionLog.map((log, idx) => (
                  <TableRow key={log.id || idx}>
                    <TableCell sx={{ fontSize: 12 }}>
                      <Chip label={log.action} size="small" variant="outlined"
                        color={log.action === 'approve' ? 'success' : log.action === 'reject' ? 'error' : 'default'}
                        sx={{ fontSize: 10 }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{log.from_status || '-'}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{log.to_status || '-'}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{log.action_by_name || log.action_by || '-'}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{log.action_at ? new Date(log.action_at).toLocaleString() : '-'}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{log.comments || '-'}</TableCell>
                  </TableRow>
                ))}
                {revisionLog.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ color: '#999', fontSize: 12 }}>No history</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </Collapse>

        {/* Salesman Target Table */}
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 200 }}>Salesman Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 100 }}>Location</TableCell>
                  {Object.keys(suggestions).length > 0 && (
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#FFF8E1', minWidth: 120 }} align="right">
                      Suggested (₹)
                    </TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 140 }} align="right">Target Value (₹)</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 100 }} align="right">Target Qty</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 130 }} align="right">Collection (₹)</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 90 }} align="right">New Cust.</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 110 }} align="right">Achieved (₹)</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 70 }} align="right">Ach. %</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingTeam ? (
                  <TableRow><TableCell colSpan={Object.keys(suggestions).length > 0 ? 9 : 8} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
                ) : salesmenRows.length === 0 ? (
                  <TableRow><TableCell colSpan={Object.keys(suggestions).length > 0 ? 9 : 8} align="center" sx={{ py: 4, color: '#999' }}>No salesmen found in your team.</TableCell></TableRow>
                ) : (
                  salesmenRows.map((row) => {
                    const pct = Number(row.achievement_pct) || 0;
                    const pctColor = pct >= 100 ? '#2e7d32' : pct >= 70 ? '#ed6c02' : pct > 0 ? '#d32f2f' : '#999';
                    return (
                      <TableRow key={row.employee_id} hover>
                        <TableCell sx={{ fontSize: 13 }}>
                          <Typography
                            sx={{ fontWeight: 500, fontSize: 13, color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            onClick={() => navigate(`/sales/targetPeriods/${periodId}/salesman/${row.employee_id}/customers`)}
                          >
                            {row.employee_name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, color: '#666' }}>{row.location_name || '-'}</TableCell>
                        {Object.keys(suggestions).length > 0 && (
                          <TableCell align="right" sx={{ bgcolor: '#FFFDE7', fontSize: 13, color: '#F57F17', fontWeight: 500 }}>
                            {suggestions[row.employee_id] != null
                              ? `₹${Math.round(suggestions[row.employee_id]).toLocaleString('en-IN')}`
                              : '-'}
                          </TableCell>
                        )}
                        <TableCell align="right" sx={{ p: 0.5 }}>
                          {isEditable ? (
                            <TextField value={row.target_value} type="number" size="small" variant="outlined"
                              onChange={(e) => handleCellChange(row.employee_id, 'target_value', e.target.value)}
                              sx={{ width: 120, '& input': { fontSize: 13, py: 0.75, textAlign: 'right' } }} />
                          ) : <Typography sx={{ fontSize: 13 }}>{row.target_value || '-'}</Typography>}
                        </TableCell>
                        <TableCell align="right" sx={{ p: 0.5 }}>
                          {isEditable ? (
                            <TextField value={row.target_quantity} type="number" size="small" variant="outlined"
                              onChange={(e) => handleCellChange(row.employee_id, 'target_quantity', e.target.value)}
                              sx={{ width: 80, '& input': { fontSize: 13, py: 0.75, textAlign: 'right' } }} />
                          ) : <Typography sx={{ fontSize: 13 }}>{row.target_quantity || '-'}</Typography>}
                        </TableCell>
                        <TableCell align="right" sx={{ p: 0.5 }}>
                          {isEditable ? (
                            <TextField value={row.target_collection} type="number" size="small" variant="outlined"
                              onChange={(e) => handleCellChange(row.employee_id, 'target_collection', e.target.value)}
                              sx={{ width: 110, '& input': { fontSize: 13, py: 0.75, textAlign: 'right' } }} />
                          ) : <Typography sx={{ fontSize: 13 }}>{row.target_collection || '-'}</Typography>}
                        </TableCell>
                        <TableCell align="right" sx={{ p: 0.5 }}>
                          {isEditable ? (
                            <TextField value={row.target_new_customers} type="number" size="small" variant="outlined"
                              onChange={(e) => handleCellChange(row.employee_id, 'target_new_customers', e.target.value)}
                              sx={{ width: 70, '& input': { fontSize: 13, py: 0.75, textAlign: 'right' } }} />
                          ) : <Typography sx={{ fontSize: 13 }}>{row.target_new_customers || '-'}</Typography>}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: 13, color: '#2e7d32' }}>
                          {Number(row.achieved_value) > 0 ? `₹${Number(row.achieved_value).toLocaleString('en-IN')}` : '-'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: 13, fontWeight: 600, color: pctColor }}>
                          {pct > 0 ? `${pct}%` : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    </>
  );
}
