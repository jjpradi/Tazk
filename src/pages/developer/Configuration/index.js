import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Button, Chip,
  Slider, IconButton, Snackbar, Alert, Tooltip, CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';
import errorDashboardService from '../../../services/errorDashboard_services';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

export default function DeveloperConfiguration() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [severities, setSeverities] = useState([]);
  const [thresholds, setThresholds] = useState([]);
  const [editedSeverities, setEditedSeverities] = useState({});
  const [editedThresholds, setEditedThresholds] = useState({});
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sevRes, thrRes] = await Promise.all([
        errorDashboardService.getSeverityConfig(),
        errorDashboardService.getThresholds(),
      ]);
      setSeverities(sevRes.data || []);
      setThresholds(thrRes.data || []);
    } catch (err) {
      console.error('Failed to load config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeverityChange = (id, field, value) => {
    setEditedSeverities(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value },
    }));
  };

  const handleThresholdChange = (id, field, value) => {
    setEditedThresholds(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value },
    }));
  };

  const getSeverityValue = (item, field) => {
    return editedSeverities[item.id]?.[field] ?? item[field];
  };

  const getThresholdValue = (item, field) => {
    return editedThresholds[item.id]?.[field] ?? item[field];
  };

  const saveSeverities = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(editedSeverities);
      for (const [id, changes] of updates) {
        const original = severities.find(s => s.id === Number(id));
        await errorDashboardService.updateSeverityConfig(id, {
          severity_weight: changes.severity_weight ?? original.severity_weight,
          display_name: changes.display_name ?? original.display_name,
          description: changes.description ?? original.description,
          is_active: changes.is_active ?? original.is_active,
        });
      }
      setEditedSeverities({});
      setSnack({ open: true, msg: 'Severity weights saved', severity: 'success' });
      loadData();
    } catch (err) {
      setSnack({ open: true, msg: 'Failed to save', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const saveThresholds = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(editedThresholds);
      for (const [id, changes] of updates) {
        const original = thresholds.find(t => t.id === Number(id));
        await errorDashboardService.updateThreshold(id, {
          min_score: changes.min_score ?? original.min_score,
          color: changes.color ?? original.color,
        });
      }
      setEditedThresholds({});
      setSnack({ open: true, msg: 'Thresholds saved', severity: 'success' });
      loadData();
    } catch (err) {
      setSnack({ open: true, msg: 'Failed to save', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const hasUnsavedSeverities = Object.keys(editedSeverities).length > 0;
  const hasUnsavedThresholds = Object.keys(editedThresholds).length > 0;

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 2, height: 'calc(100vh - 70px)', overflow: 'auto' }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Configuration</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 0 }}>
        <Tab label="Priority Score" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        {/* Formula explanation */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#f8f9fa' }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
            Priority Score Formula
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <code>score = severity_weight x min(occurrences, 100) x recency_factor</code>
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Recency: last 7 days = 1.5x &nbsp;|&nbsp; last 30 days = 1.0x &nbsp;|&nbsp; older = 0.5x
          </Typography>
        </Paper>

        {/* Severity Weights */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>Error Category Weights</Typography>
            {hasUnsavedSeverities && (
              <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={saveSeverities} disabled={saving}>
                Save Changes
              </Button>
            )}
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5' }}>Display Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5', width: 300 }}>
                    Weight (1-10)
                    <Tooltip title="Higher weight = higher priority. 10 = most critical." arrow>
                      <InfoIcon sx={{ fontSize: 14, ml: 0.5, verticalAlign: 'text-bottom', color: '#999' }} />
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5' }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {severities.map((s) => (
                  <TableRow key={s.id} hover sx={{ bgcolor: editedSeverities[s.id] ? '#fff8e1' : 'inherit' }}>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      <Chip label={s.meta_key} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small" variant="standard"
                        value={getSeverityValue(s, 'display_name')}
                        onChange={(e) => handleSeverityChange(s.id, 'display_name', e.target.value)}
                        sx={{ width: 160, '& input': { fontSize: '0.8rem' } }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Slider
                          min={1} max={10} step={1}
                          value={getSeverityValue(s, 'severity_weight')}
                          onChange={(_, v) => handleSeverityChange(s.id, 'severity_weight', v)}
                          valueLabelDisplay="auto"
                          marks
                          sx={{ flex: 1 }}
                        />
                        <Chip
                          label={getSeverityValue(s, 'severity_weight')}
                          size="small"
                          sx={{
                            fontWeight: 700, minWidth: 32,
                            bgcolor: getSeverityValue(s, 'severity_weight') >= 8 ? '#ffebee' :
                                     getSeverityValue(s, 'severity_weight') >= 5 ? '#fff8e1' : '#e8f5e9',
                            color: getSeverityValue(s, 'severity_weight') >= 8 ? '#c62828' :
                                   getSeverityValue(s, 'severity_weight') >= 5 ? '#f57f17' : '#2e7d32',
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small" variant="standard"
                        value={getSeverityValue(s, 'description')}
                        onChange={(e) => handleSeverityChange(s.id, 'description', e.target.value)}
                        sx={{ width: '100%', '& input': { fontSize: '0.75rem', color: '#666' } }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Priority Thresholds */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>Priority Thresholds</Typography>
            {hasUnsavedThresholds && (
              <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={saveThresholds} disabled={saving}>
                Save Changes
              </Button>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Score ranges that map to each priority level. Adjust the minimum score to change when a priority kicks in.
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5' }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5' }}>Min Score</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5' }}>Color</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: '#f5f5f5' }}>Preview</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {thresholds.map((t) => (
                  <TableRow key={t.id} hover sx={{ bgcolor: editedThresholds[t.id] ? '#fff8e1' : 'inherit' }}>
                    <TableCell sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.priority_name}</TableCell>
                    <TableCell>
                      <TextField
                        size="small" type="number" variant="standard"
                        value={getThresholdValue(t, 'min_score')}
                        onChange={(e) => handleThresholdChange(t.id, 'min_score', Number(e.target.value))}
                        sx={{ width: 80, '& input': { fontSize: '0.85rem', fontWeight: 600 } }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small" variant="standard"
                        value={getThresholdValue(t, 'color')}
                        onChange={(e) => handleThresholdChange(t.id, 'color', e.target.value)}
                        sx={{ width: 100, '& input': { fontSize: '0.8rem' } }}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <Box sx={{ width: 16, height: 16, borderRadius: 1, bgcolor: getThresholdValue(t, 'color'), mr: 1, flexShrink: 0 }} />
                            ),
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t.priority_name}
                        size="small"
                        sx={{ bgcolor: getThresholdValue(t, 'color') + '20', color: getThresholdValue(t, 'color'), fontWeight: 700, fontSize: '0.75rem' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack({ ...snack, open: false })}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
