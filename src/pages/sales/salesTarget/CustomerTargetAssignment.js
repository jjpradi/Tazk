import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, Typography, Button, Chip, IconButton, Tooltip, Tabs, Tab,
  CircularProgress, MenuItem, TextField, Select, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import { Helmet } from 'react-helmet-async';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { titleURL } from 'http-common';
import SalesTargetService from '../../../services/salesTarget_services';
import { getPeriodByIdAction } from '../../../redux/actions/salesTarget_actions';
import { OpenalertActions } from '../../../redux/actions/alert_actions';

const AUTO_ASSIGN_OPTIONS = [
  { value: 'last_month', label: 'Same as Last Month' },
  { value: 'hike_5', label: 'Last Month + 5%' },
  { value: 'hike_10', label: 'Last Month + 10%' },
  { value: 'hike_15', label: 'Last Month + 15%' },
  { value: 'hike_20', label: 'Last Month + 20%' },
];

export default function CustomerTargetAssignment() {
  const { periodId, employeeId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const gridApiRef = useGridApiRef();
  const { periodDetail } = useSelector((state) => state.salesTargetReducer);

  const [customerRows, setCustomerRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingMix, setSavingMix] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [productHierarchy, setProductHierarchy] = useState([]);
  const [productMixRows, setProductMixRows] = useState([]);
  const [salesmanTargetId, setSalesmanTargetId] = useState(null);

  const period = periodDetail;
  const isEditable = period?.status === 'draft' || period?.status === 'published';

  useEffect(() => {
    if (periodId) dispatch(getPeriodByIdAction(periodId));
  }, [periodId]);

  useEffect(() => {
    loadCustomers();
    loadProductData();
    loadSalesmanTargetId();
  }, [periodId, employeeId]);

  const loadSalesmanTargetId = async () => {
    try {
      const res = await SalesTargetService.getTargets({
        period_id: periodId, target_level: 'salesman', employee_id: employeeId,
      });
      const targets = res.data?.data?.rows || res.data?.data || [];
      const t = Array.isArray(targets) ? targets.find(t => String(t.employee_id) === String(employeeId)) : null;
      if (t) {
        setSalesmanTargetId(t.id);
        loadProductMix(t.id);
      }
    } catch (err) { /* ignore */ }
  };

  const loadProductMix = async (targetId) => {
    try {
      const res = await SalesTargetService.getProductMixForTarget({ target_id: targetId });
      const rows = res.data?.data?.rows || [];
      setProductMixRows(rows.map(r => ({
        ...r,
        id: r.id || Date.now() + Math.random(),
      })));
    } catch (err) { /* ignore */ }
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await SalesTargetService.getCustomersForTarget({ employee_id: employeeId, period_id: periodId });
      const data = res.data?.data?.rows || [];
      setCustomerRows(data.map((r, idx) => ({
        ...r,
        id: r.customer_id || idx,
        target_value: Number(r.target_value) || '',
        target_quantity: Number(r.target_quantity) || '',
        target_collection: Number(r.target_collection) || '',
      })));
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProductData = async () => {
    try {
      const res = await SalesTargetService.getProductCategoriesAndBrands();
      const data = res.data?.data || {};
      setCategories(data.categories || []);
      setBrands(data.brands || []);
      setModels(data.models || []);
      setProductHierarchy(data.hierarchy || []);
    } catch (err) { /* ignore */ }
  };

  const handleAutoAssign = (option) => {
    const multiplier = { last_month: 1, hike_5: 1.05, hike_10: 1.10, hike_15: 1.15, hike_20: 1.20 }[option] || 1;
    setCustomerRows(prev => prev.map(row => ({
      ...row,
      target_value: Math.round((Number(row.last_month_value) || 0) * multiplier),
      target_quantity: Math.round((Number(row.last_month_qty) || 0) * multiplier),
    })));
  };

  const handleCustomerCellChange = (customerId, field, value) => {
    setCustomerRows(prev => prev.map(row =>
      row.customer_id === customerId ? { ...row, [field]: value } : row
    ));
  };

  const handleSaveCustomerTargets = async () => {
    const targetsToSave = customerRows
      .filter(r => r.target_value || r.target_quantity || r.target_collection)
      .map(r => ({
        period_id: Number(periodId),
        target_level: 'customer',
        employee_id: Number(employeeId),
        customer_id: r.customer_id,
        target_value: Number(r.target_value) || 0,
        target_quantity: Number(r.target_quantity) || 0,
        target_collection: Number(r.target_collection) || 0,
        target_new_customers: 0,
      }));

    if (targetsToSave.length === 0) {
      dispatch(OpenalertActions({ msg: 'Enter at least one target', severity: 'warning' }));
      return;
    }

    setSaving(true);
    try {
      await SalesTargetService.createTargetsBulk({ targets: targetsToSave });
      dispatch(OpenalertActions({ msg: `${targetsToSave.length} customer targets saved`, severity: 'success' }));
      loadCustomers();
    } catch (err) {
      dispatch(OpenalertActions({ msg: 'Failed to save', severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  // Product mix
  const handleAddProductMixRow = () => {
    setProductMixRows(prev => [...prev, {
      id: Date.now(), category: '', brand: '', model: '', target_value: '', target_quantity: ''
    }]);
  };

  const getBrandsForCategory = (category) => {
    if (!category) return brands;
    const filtered = productHierarchy.filter(h => h.category === category && h.brand);
    return [...new Set(filtered.map(h => h.brand))].sort();
  };

  const getModelsForCategoryBrand = (category, brand) => {
    let filtered = productHierarchy.filter(h => h.model);
    if (category) filtered = filtered.filter(h => h.category === category);
    if (brand) filtered = filtered.filter(h => h.brand === brand);
    return [...new Set(filtered.map(h => h.model))].sort();
  };

  const handleProductMixChange = (id, field, value) => {
    setProductMixRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      // Clear dependent fields on parent change
      if (field === 'category') { updated.brand = ''; updated.model = ''; }
      if (field === 'brand') { updated.model = ''; }
      return updated;
    }));
  };

  const handleRemoveProductMixRow = (id) => {
    setProductMixRows(prev => prev.filter(r => r.id !== id));
  };

  const handleSaveProductMix = async () => {
    if (!salesmanTargetId) {
      dispatch(OpenalertActions({ msg: 'Salesman target not found. Save salesman target first.', severity: 'warning' }));
      return;
    }
    const validRows = productMixRows.filter(r => r.category || r.brand || r.model);
    setSavingMix(true);
    try {
      await SalesTargetService.saveProductMixTargets({
        target_id: salesmanTargetId,
        product_targets: validRows.map(r => ({
          category: r.category || null,
          brand: r.brand || null,
          model: r.model || null,
          target_value: Number(r.target_value) || 0,
          target_quantity: Number(r.target_quantity) || 0,
        })),
      });
      dispatch(OpenalertActions({ msg: `${validRows.length} product targets saved`, severity: 'success' }));
      loadProductMix(salesmanTargetId);
    } catch (err) {
      dispatch(OpenalertActions({ msg: 'Failed to save product targets', severity: 'error' }));
    } finally {
      setSavingMix(false);
    }
  };

  const custFileInputRef = useRef(null);

  const handleExportCustomerExcel = () => {
    const headers = ['Customer ID', 'Customer Name', 'Last Month (₹)', 'Target Value', 'Target Qty', 'Collection'];
    const titleRow = [`Customer Targets — ${period?.period_name || ''}`];
    const wsData = [titleRow, [], headers];

    customerRows.forEach((row) => {
      wsData.push([
        row.customer_id,
        row.customer_name || row.company_name || '',
        Number(row.last_month_value) || 0,
        Number(row.target_value) || 0,
        Number(row.target_quantity) || 0,
        Number(row.target_collection) || 0,
      ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!merges'] = [{ s: { c: 0, r: 0 }, e: { c: headers.length - 1, r: 0 } }];
    const titleCell = XLSX.utils.encode_cell({ c: 0, r: 0 });
    if (ws[titleCell]) ws[titleCell].s = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } };
    headers.forEach((_, i) => {
      const addr = XLSX.utils.encode_cell({ c: i, r: 2 });
      if (ws[addr]) ws[addr].s = { font: { bold: true, sz: 11 }, fill: { fgColor: { rgb: 'F5F7FA' } } };
    });
    ws['!cols'] = [{ wch: 14 }, { wch: 28 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 14 }];

    XLSX.utils.book_append_sheet(wb, ws, 'Customer Targets');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    const buf = new ArrayBuffer(wbout.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xff;
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `CustomerTargets_${period?.period_name || 'export'}.xlsx`);
  };

  const handleImportCustomerExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

        let matched = 0;
        const updated = customerRows.map((row) => {
          const importRow = rows.find((r) => String(r['Customer ID']) === String(row.customer_id));
          if (importRow) {
            matched++;
            return {
              ...row,
              target_value: importRow['Target Value'] !== '' ? Number(importRow['Target Value']) || 0 : row.target_value,
              target_quantity: importRow['Target Qty'] !== '' ? Number(importRow['Target Qty']) || 0 : row.target_quantity,
              target_collection: importRow['Collection'] !== '' ? Number(importRow['Collection']) || 0 : row.target_collection,
            };
          }
          return row;
        });

        setCustomerRows(updated);
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
      <Helmet><title>{titleURL} | Customer Targets</title></Helmet>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)', gap: 2 }}>
        {/* Top Bar */}
        <Card sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Tooltip title="Back to Salesman Targets">
                <IconButton size="small" onClick={() => navigate(`/sales/targetPeriods/${periodId}/assign`)}>
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#2E3A59' }}>
                Customer Targets
              </Typography>
              <Chip label={period?.period_name || ''} size="small" variant="outlined" />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              {tabValue === 0 && customerRows.length > 0 && (
                <Button variant="outlined" size="small" startIcon={<FileDownloadIcon />}
                  onClick={handleExportCustomerExcel} sx={{ textTransform: 'none' }}>
                  Export
                </Button>
              )}
              {isEditable && tabValue === 0 && (
                <>
                  <Button variant="outlined" size="small" startIcon={<FileUploadIcon />}
                    onClick={() => custFileInputRef.current?.click()} sx={{ textTransform: 'none' }}>
                    Import
                  </Button>
                  <input ref={custFileInputRef} type="file" accept=".xlsx,.xls" hidden onChange={handleImportCustomerExcel} />
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Auto-Assign</InputLabel>
                    <Select label="Auto-Assign" value="" onChange={(e) => handleAutoAssign(e.target.value)}>
                      {AUTO_ASSIGN_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained" size="small"
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    onClick={handleSaveCustomerTargets} disabled={saving}
                    sx={{ textTransform: 'none' }}
                  >
                    Save Targets
                  </Button>
                </>
              )}
              {isEditable && tabValue === 1 && (
                <Button variant="contained" size="small"
                  startIcon={savingMix ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  onClick={handleSaveProductMix} disabled={savingMix || productMixRows.length === 0}
                  sx={{ textTransform: 'none' }}>
                  Save Product Targets
                </Button>
              )}
            </Box>
          </Box>
        </Card>

        {/* Tabs + Content */}
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: '1px solid #e0e0e0', px: 2 }}>
            <Tab label="Customer Targets" sx={{ textTransform: 'none', fontWeight: 500, fontSize: 13 }} />
            <Tab label="Product / Category Targets" sx={{ textTransform: 'none', fontWeight: 500, fontSize: 13 }} />
          </Tabs>

          {/* Customer Targets Tab */}
          {tabValue === 0 && (
            <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 200 }}>Customer Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 120 }} align="right">Last Month (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 140 }} align="right">Target Value (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 100 }} align="right">Target Qty</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 130 }} align="right">Collection (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 110 }} align="right">Achieved (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 70 }} align="right">Ach. %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
                  ) : customerRows.length === 0 ? (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: '#999' }}>No customers assigned to this salesman.</TableCell></TableRow>
                  ) : (
                    customerRows.map((row) => {
                      const pct = Number(row.achievement_pct) || 0;
                      const pctColor = pct >= 100 ? '#2e7d32' : pct >= 70 ? '#ed6c02' : pct > 0 ? '#d32f2f' : '#999';
                      return (
                        <TableRow key={row.customer_id} hover>
                          <TableCell sx={{ fontSize: 13, fontWeight: 500 }}>{row.customer_name}</TableCell>
                          <TableCell align="right" sx={{ fontSize: 13, color: '#666' }}>
                            {Number(row.last_month_value) > 0 ? `₹${Number(row.last_month_value).toLocaleString('en-IN')}` : '-'}
                          </TableCell>
                          <TableCell align="right" sx={{ p: 0.5 }}>
                            {isEditable ? (
                              <TextField
                                value={row.target_value}
                                onChange={(e) => handleCustomerCellChange(row.customer_id, 'target_value', e.target.value)}
                                type="number" size="small" variant="outlined"
                                sx={{ width: 120, '& input': { fontSize: 13, py: 0.75, textAlign: 'right' } }}
                              />
                            ) : <Typography sx={{ fontSize: 13 }}>{row.target_value || '-'}</Typography>}
                          </TableCell>
                          <TableCell align="right" sx={{ p: 0.5 }}>
                            {isEditable ? (
                              <TextField
                                value={row.target_quantity}
                                onChange={(e) => handleCustomerCellChange(row.customer_id, 'target_quantity', e.target.value)}
                                type="number" size="small" variant="outlined"
                                sx={{ width: 80, '& input': { fontSize: 13, py: 0.75, textAlign: 'right' } }}
                              />
                            ) : <Typography sx={{ fontSize: 13 }}>{row.target_quantity || '-'}</Typography>}
                          </TableCell>
                          <TableCell align="right" sx={{ p: 0.5 }}>
                            {isEditable ? (
                              <TextField
                                value={row.target_collection}
                                onChange={(e) => handleCustomerCellChange(row.customer_id, 'target_collection', e.target.value)}
                                type="number" size="small" variant="outlined"
                                sx={{ width: 110, '& input': { fontSize: 13, py: 0.75, textAlign: 'right' } }}
                              />
                            ) : <Typography sx={{ fontSize: 13 }}>{row.target_collection || '-'}</Typography>}
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
          )}

          {/* Product / Category Targets Tab */}
          {tabValue === 1 && (
            <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', width: 40 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 160 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 140 }}>Brand</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 140 }}>Model</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 130 }}>Target Value (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 100 }}>Target Qty</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 110 }} align="right">Achieved (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', minWidth: 70 }} align="right">Ach. %</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: '#F5F7FA', width: 50 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productMixRows.map((row, idx) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ fontSize: 12, color: '#999' }}>{idx + 1}</TableCell>
                      <TableCell sx={{ p: 0.5 }}>
                        <FormControl size="small" fullWidth>
                          <Select value={row.category || ''} onChange={(e) => handleProductMixChange(row.id, 'category', e.target.value)}
                            displayEmpty sx={{ fontSize: 13 }}>
                            <MenuItem value=""><em>All</em></MenuItem>
                            {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell sx={{ p: 0.5 }}>
                        <FormControl size="small" fullWidth>
                          <Select value={row.brand || ''} onChange={(e) => handleProductMixChange(row.id, 'brand', e.target.value)}
                            displayEmpty sx={{ fontSize: 13 }}>
                            <MenuItem value=""><em>All</em></MenuItem>
                            {getBrandsForCategory(row.category).map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell sx={{ p: 0.5 }}>
                        <FormControl size="small" fullWidth>
                          <Select value={row.model || ''} onChange={(e) => handleProductMixChange(row.id, 'model', e.target.value)}
                            displayEmpty sx={{ fontSize: 13 }}>
                            <MenuItem value=""><em>All</em></MenuItem>
                            {getModelsForCategoryBrand(row.category, row.brand).map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell sx={{ p: 0.5 }}>
                        <TextField value={row.target_value} type="number" size="small" fullWidth
                          onChange={(e) => handleProductMixChange(row.id, 'target_value', e.target.value)}
                          sx={{ '& input': { fontSize: 13, py: 0.75, textAlign: 'right' } }} />
                      </TableCell>
                      <TableCell sx={{ p: 0.5 }}>
                        <TextField value={row.target_quantity} type="number" size="small" fullWidth
                          onChange={(e) => handleProductMixChange(row.id, 'target_quantity', e.target.value)}
                          sx={{ '& input': { fontSize: 13, py: 0.75, textAlign: 'right' } }} />
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 13, color: '#2e7d32' }}>
                        {Number(row.achieved_value) > 0 ? `₹${Number(row.achieved_value).toLocaleString('en-IN')}` : '-'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 13, fontWeight: 600 }}>
                        {(() => {
                          const tv = Number(row.target_value) || 0;
                          const av = Number(row.achieved_value) || 0;
                          if (tv <= 0) return '-';
                          const pct = (av / tv) * 100;
                          const color = pct >= 100 ? '#2e7d32' : pct >= 70 ? '#ed6c02' : pct > 0 ? '#d32f2f' : '#999';
                          return <span style={{ color }}>{pct.toFixed(1)}%</span>;
                        })()}
                      </TableCell>
                      <TableCell sx={{ p: 0.5 }}>
                        <IconButton size="small" color="error" onClick={() => handleRemoveProductMixRow(row.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Add Row button as last row */}
                  {isEditable && (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ py: 1 }}>
                        <Button size="small" startIcon={<AddIcon />} onClick={handleAddProductMixRow}
                          sx={{ textTransform: 'none', fontSize: 12, color: '#1976d2' }}>
                          Add Row
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                  {productMixRows.length === 0 && !isEditable && (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4, color: '#999' }}>
                        No product targets configured.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Box>
    </>
  );
}
