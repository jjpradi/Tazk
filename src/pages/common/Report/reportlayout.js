import React, { useEffect, useState, useMemo } from 'react';
import { Grid, Card, CardContent, Typography, Link, Box, Drawer, IconButton, Chip, Tooltip, TextField, MenuItem, Button } from '@mui/material';
import LabelImportantIcon from '@mui/icons-material/LabelImportant';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getReportsBasedOnCategoryAction } from 'redux/actions/userRole_actions';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import ReportsService from '../../../services/reports_services';
import EditIcon from '@mui/icons-material/Edit';

const ReportCard = ({ title, items, handleClick }) => (
  <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
    <CardContent sx={{ p: 2.5 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#2E3A59', mb: 1.5 }}>
        {title}
      </Typography>
      {Array.isArray(items) ? (
        items.map((item, index) => (
          <Typography key={index} sx={{ display: 'flex', alignItems: 'center', py: 0.4 }}>
            <LabelImportantIcon sx={{ fontSize: 14, color: '#B0BEC5', mr: 0.5 }} />
            <Link
              onClick={() => handleClick(item?.url)}
              underline="hover"
              sx={{ cursor: 'pointer', fontSize: 13, color: '#1976d2', '&:hover': { color: '#0d47a1' } }}
            >
              {item.name}
            </Link>
          </Typography>
        ))
      ) : (
        <Typography color="textSecondary" sx={{ fontSize: 12 }}>No items available</Typography>
      )}
    </CardContent>
  </Card>
);

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly (Monday)' },
  { value: 'monthly', label: 'Monthly (1st)' },
  { value: 'quarterly', label: 'Quarterly' },
];

const CHANNELS = [
  { value: 'email', label: 'Email', icon: <EmailIcon sx={{ fontSize: 16 }} /> },
  { value: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon sx={{ fontSize: 16 }} /> },
];

const SchedulePanel = ({ open, onClose, reportOptions }) => {
  const [showForm, setShowForm] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ category: '', menuKey: '', reportName: '', frequency: 'daily', channel: 'email', time: '09:00', format: 'pdf' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (open) loadSchedules();
  }, [open]);

  const loadSchedules = async () => {
    try {
      const res = await ReportsService.listSchedules();
      setSchedules(res.data?.data || []);
    } catch (e) { setSchedules([]); }
  };

  const handleCategorySelect = (category) => {
    setForm({ ...form, category, menuKey: '', reportName: '' });
  };

  const handleReportSelect = (menuKey) => {
    const selected = reportOptions.find(r => r.menu_key === menuKey);
    setForm({ ...form, menuKey, reportName: selected?.name || '' });
  };

  // Get unique categories
  const categories = useMemo(() => {
    if (!reportOptions?.length) return [];
    return [...new Set(reportOptions.map(r => r.category))];
  }, [reportOptions]);

  // Filter reports by selected category
  const filteredReports = useMemo(() => {
    if (!form.category) return [];
    return reportOptions.filter(r => r.category === form.category);
  }, [reportOptions, form.category]);

  const handleAdd = async () => {
    if (!form.menuKey) return;
    setLoading(true);

    const payload = {
      report_key: form.menuKey,
      report_name: form.reportName,
      frequency: form.frequency,
      send_time: form.time,
      channel: form.channel,
      format: form.format,
    };

    try {
      if (editingId) {
        await ReportsService.editSchedule(editingId, payload);
      } else {
        await ReportsService.createSchedule(payload);
      }

      setForm({ category: '', menuKey: '', reportName: '', frequency: 'daily', channel: 'email', time: '09:00', format: 'pdf' });
      setEditingId(null);
      setShowForm(false);
      loadSchedules();
    } catch (e) {}
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await ReportsService.deleteSchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch (e) {}
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule.id);
    const matched = reportOptions.find(r => r.menu_key === schedule.report_key);
    setForm({
      category: matched?.category || '',
      menuKey: schedule.report_key,
      reportName: schedule.report_name,
      frequency: schedule.frequency,
      channel: schedule.channel,
      time: schedule.send_time,
      format: schedule.format,
    });
    setShowForm(true);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      sx={{ '& .MuiDrawer-paper': { width: 360, p: 0, boxShadow: '-4px 0 20px rgba(0,0,0,0.08)' } }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid #E8EDF5' }}>
        <ScheduleIcon sx={{ mr: 1, color: '#1976d2', fontSize: 20 }} />
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', flex: 1 }}>My Scheduled Reports</Typography>
        <Tooltip title="New Schedule">
          <IconButton size="small" onClick={() => { setShowForm(!showForm); if (showForm) { setEditingId(null); setForm({ category: '', menuKey: '', reportName: '', frequency: 'daily', channel: 'email', time: '09:00', format: 'pdf' }); } }} sx={{ bgcolor: '#1976d2', color: '#fff', '&:hover': { bgcolor: '#1565C0' }, width: 28, height: 28 }}>
            <AddIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <IconButton size="small" onClick={onClose} sx={{ ml: 0.5 }}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
      </Box>

      {showForm && (
        <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E8EDF5' }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#555', mb: 1 }}>{editingId ? 'Edit Schedule' : 'New Schedule'}</Typography>
          <TextField select fullWidth size="small" label="Report Type" value={form.category} disabled={Boolean(editingId)}
            onChange={(e) => handleCategorySelect(e.target.value)} sx={{ mb: 1, '& .MuiInputBase-input': { fontSize: 12 }, '& .Mui-disabled': { bgcolor: '#f0f0f0' } }}>
            {categories.map(cat => <MenuItem key={cat} value={cat} sx={{ fontSize: 12 }}>{cat}</MenuItem>)}
          </TextField>
          <TextField select fullWidth size="small" label="Report Name" value={form.menuKey} disabled={Boolean(editingId) || !form.category}
            onChange={(e) => handleReportSelect(e.target.value)} sx={{ mb: 1, '& .MuiInputBase-input': { fontSize: 12 }, '& .Mui-disabled': { bgcolor: '#f0f0f0' } }}>
            {filteredReports.map(r => <MenuItem key={r.menu_key} value={r.menu_key} sx={{ fontSize: 12 }}>{r.name}</MenuItem>)}
          </TextField>
          <TextField select fullWidth size="small" label="Frequency" value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })} sx={{ mb: 1, '& .MuiInputBase-input': { fontSize: 12 } }}>
            {FREQUENCIES.map(f => <MenuItem key={f.value} value={f.value} sx={{ fontSize: 12 }}>{f.label}</MenuItem>)}
          </TextField>
          <TextField select fullWidth size="small" label="Send Time" value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            sx={{ mb: 1, '& .MuiInputBase-input': { fontSize: 12 } }}>
            <MenuItem value="09:00" sx={{ fontSize: 12 }}>9:00 AM (Start of Day)</MenuItem>
            <MenuItem value="19:00" sx={{ fontSize: 12 }}>7:00 PM (End of Day)</MenuItem>
          </TextField>
          <TextField select fullWidth size="small" label="Send Via" value={form.channel}
            onChange={(e) => setForm({ ...form, channel: e.target.value })} sx={{ mb: 1, '& .MuiInputBase-input': { fontSize: 12 } }}>
            {CHANNELS.map(c => <MenuItem key={c.value} value={c.value} sx={{ fontSize: 12 }}>{c.label}</MenuItem>)}
          </TextField>
          <TextField select fullWidth size="small" label="File Format" value={form.format}
            onChange={(e) => setForm({ ...form, format: e.target.value })} sx={{ mb: 0.5, '& .MuiInputBase-input': { fontSize: 12 } }}>
            <MenuItem value="pdf" sx={{ fontSize: 12 }}>PDF (max 1,000 rows, formatted)</MenuItem>
            <MenuItem value="csv" sx={{ fontSize: 12 }}>CSV (all rows, raw data)</MenuItem>
          </TextField>
          <Typography sx={{ fontSize: 9, color: '#999', mb: 1 }}>
            {form.format === 'pdf' ? 'PDF includes up to 1,000 rows with formatted layout. For larger datasets, use CSV.' : 'CSV includes all rows as raw data. Opens in Excel/Sheets.'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small" onClick={() => { setShowForm(false); setEditingId(null); setForm({ category: '', menuKey: '', reportName: '', frequency: 'daily', channel: 'email', time: '09:00', format: 'pdf' }); }} sx={{ fontSize: 11, flex: 1 }}>Cancel</Button>
            <Button variant="contained" size="small" onClick={handleAdd} disabled={loading} sx={{ fontSize: 11, flex: 1 }}>
              {loading ? 'Saving...' : (editingId ? 'Update' : 'Schedule')}
            </Button>
          </Box>
        </Box>
      )}

      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        {schedules.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, color: '#B0BEC5' }}>
            <ScheduleIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography sx={{ fontSize: 12, color: '#999' }}>No scheduled reports yet</Typography>
            <Typography sx={{ fontSize: 11, color: '#bbb' }}>Click + to create one</Typography>
          </Box>
        ) : (
          schedules.map((s) => (
            <Card key={s.id} sx={{ mb: 1, p: 1.5, borderRadius: 1.5, border: '1px solid #E8EDF5', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, flex: 1, color: '#2E3A59' }}>{s.report_name}</Typography>
                <IconButton size="small" onClick={() => handleEdit(s)}><EditIcon sx={{ fontSize: 16, color: '#2867c6' }} /></IconButton>
                <IconButton size="small" onClick={() => handleDelete(s.id)}><DeleteOutlineIcon sx={{ fontSize: 16, color: '#C62828' }} /></IconButton>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, alignItems: 'center' }}>
                <Chip label={s.frequency} size="small" sx={{ fontSize: 9, height: 18, bgcolor: '#E3F2FD', color: '#1565C0' }} />
                <Chip label={String(s.send_time || '').substring(0, 5) === '09:00' ? '9 AM' : '7 PM'} size="small" sx={{ fontSize: 9, height: 18, bgcolor: '#F3E5F5', color: '#7B1FA2' }} />
                <Chip label={s.format === 'csv' ? 'CSV' : 'PDF'} size="small" sx={{ fontSize: 9, height: 18, bgcolor: s.format === 'csv' ? '#E8F5E9' : '#FFEBEE', color: s.format === 'csv' ? '#2E7D32' : '#C62828' }} />
                <Chip icon={s.channel === 'email' ? <EmailIcon sx={{ fontSize: 12 }} /> : <WhatsAppIcon sx={{ fontSize: 12 }} />}
                  label={s.channel} size="small" sx={{ fontSize: 9, height: 18, bgcolor: s.channel === 'email' ? '#FFF3E0' : '#E8F5E9', color: s.channel === 'email' ? '#E65100' : '#2E7D32' }} />
              </Box>
              <Typography sx={{ fontSize: 10, color: '#999', mt: 0.5 }}>
                {s.next_run_at ? `Next: ${new Date(s.next_run_at).toLocaleString()}` : 'Pending'}
              </Typography>
            </Card>
          ))
        )}
      </Box>
    </Drawer>
  );
};

const ReportPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const storage = getsessionStorage();
  const roleName = storage?.role_name;
  const [panelOpen, setPanelOpen] = useState(false);
  const companyReportsConfig = useSelector(
    (state) => state.UserRoleReducer?.companyReportsConfig || []
  );

  useEffect(() => {
    dispatch(getReportsBasedOnCategoryAction());
    dispatch(getMenuAccessAction(roleName));
  }, [dispatch, roleName]);

  const handleClick = (url) => {
    if (url) navigate(url, { state: { pageType: 'reportPage' } });
  };

  // Flatten all reports with menu_key for scheduler dropdown
  const reportOptions = useMemo(() => {
    if (!Array.isArray(companyReportsConfig)) return [];
    const options = [];
    for (const categoryObj of companyReportsConfig) {
      const [category, items] = Object.entries(categoryObj)[0];
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item.menu_key) {
            options.push({ category, name: item.name, menu_key: item.menu_key });
          }
        }
      }
    }
    return options;
  }, [companyReportsConfig]);

  if (!Array.isArray(companyReportsConfig) || !companyReportsConfig.length) {
    return <Typography variant="h6">No reports available</Typography>;
  }

  return (
    <>
      <Helmet><title>{titleURL} | Reports</title></Helmet>
      <Box sx={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#2E3A59', flex: 1 }}>Reports</Typography>
            <Tooltip title="Scheduled Reports">
              <IconButton onClick={() => setPanelOpen(true)} sx={{ bgcolor: '#F4F7FE', '&:hover': { bgcolor: '#E3F2FD' } }}>
                <ScheduleIcon sx={{ fontSize: 20, color: '#1976d2' }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Grid container spacing={2.5}>
            {companyReportsConfig.map((categoryObj, index) => {
              const [category, items] = Object.entries(categoryObj)[0];
              return (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <ReportCard title={category} items={items} handleClick={handleClick} />
                </Grid>
              );
            })}
          </Grid>
        </Box>
        <SchedulePanel open={panelOpen} onClose={() => setPanelOpen(false)} reportOptions={reportOptions} />
      </Box>
    </>
  );
};

export default ReportPage;
