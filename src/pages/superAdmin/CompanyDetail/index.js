import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, Chip, Typography, Tabs, Tab, IconButton, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Grid,
  Divider, CircularProgress, Menu, Autocomplete
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import TimelineIcon from '@mui/icons-material/Timeline';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import ExtensionIcon from '@mui/icons-material/Extension';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AddIcon from '@mui/icons-material/Add';
import NoteIcon from '@mui/icons-material/Note';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import GavelIcon from '@mui/icons-material/Gavel';
import ChatIcon from '@mui/icons-material/Chat';
import AlarmIcon from '@mui/icons-material/Alarm';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LinearProgress from '@mui/material/LinearProgress';
import RefreshIcon from '@mui/icons-material/Refresh';
import superAdminService from '../../../services/superAdmin_services';
import SubscriptionPlanService from '../../../services/subscriptionPlan_services';
import { useHasRight } from '../../../hooks/useUserRights';
import { getsessionStorage } from 'pages/common/login/cookies';

const STATUS_COLORS = {
  Active: '#4caf50', Expired: '#f44336', Trial: '#ff9800', Pending: '#9e9e9e',
};

const COMM_ICONS = {
  note: <NoteIcon fontSize="small" />,
  email: <EmailIcon fontSize="small" />,
  whatsapp: <WhatsAppIcon fontSize="small" />,
  call: <PhoneIcon fontSize="small" />,
  internal: <ChatIcon fontSize="small" />,
  approval: <GavelIcon fontSize="small" />,
  audit: <GavelIcon fontSize="small" />,
};

const COMM_COLORS = {
  note: '#2196f3', email: '#4caf50', whatsapp: '#25d366',
  call: '#ff9800', internal: '#607d8b', approval: '#9e9e9e', audit: '#9c27b0',
};

function getStatus(row) {
  if (!row.isApproved || row.isApproved === null) return 'Pending';
  if (row.sIsExpired === 1) return 'Expired';
  if (row.isApproved === 'Approved') return 'Active';
  return row.isApproved || 'Pending';
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-GB');
}

function formatDateTime(d) {
  if (!d) return '-';
  const dt = new Date(d);
  return `${dt.toLocaleDateString('en-GB')} ${dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
}

function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', py: 0.8, borderBottom: '1px solid #f0f0f0' }}>
      <Typography variant="body2" color="text.secondary" sx={{ width: 160, flexShrink: 0, fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value || '-'}</Typography>
    </Box>
  );
}

export default function CompanyDetail() {
  const { id: companyId } = useParams();
  const navigate = useNavigate();
  const storage = getsessionStorage()
  const canEditConfig = useHasRight('edit_company_config');
  const canDeactivate = useHasRight('deactivate_company');
  const canAddNote = useHasRight('add_company_note');
  const canManageSubs = useHasRight('manage_subscriptions');
  const canManageTags = useHasRight('manage_tags');
  const canSendComm = useHasRight('send_communication');
  const canManageFollowUps = useHasRight('manage_follow_ups');
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [subHistory, setSubHistory] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [configs, setConfigs] = useState([]);

  // Tags
  const [companyTags, setCompanyTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [tagAnchor, setTagAnchor] = useState(null);

  // Communications
  const [comms, setComms] = useState([]);
  const [commsTotal, setCommsTotal] = useState(0);
  const [commsPage, setCommsPage] = useState(0);
  const [commType, setCommType] = useState('note');
  const [commContent, setCommContent] = useState('');
  const [commSubject, setCommSubject] = useState('');
  const [commLoading, setCommLoading] = useState(false);

  // Follow-ups
  const [followUps, setFollowUps] = useState([]);

  // Onboarding
  const [onboarding, setOnboarding] = useState(null);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [fuTitle, setFuTitle] = useState('');
  const [fuDate, setFuDate] = useState('');
  const [fuTime, setFuTime] = useState('09:00');
  const [fuDesc, setFuDesc] = useState('');

  // Dialogs
  const [extendOpen, setExtendOpen] = useState(false);
  const [extendDays, setExtendDays] = useState('');
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [editingConfig, setEditingConfig] = useState(null);
  const [editConfigValue, setEditConfigValue] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    loadOverview();
    loadHealth();
    loadCompanyTags();
  }, [companyId]);

  useEffect(() => {
    if (tab === 1 && employees.length === 0) loadEmployees();
    if (tab === 2 && subHistory.length === 0) loadSubHistory();
    if (tab === 3 && comms.length === 0) loadCommunications();
    if (tab === 4 && configs.length === 0) loadConfig();
    if (tab === 5 && followUps.length === 0) loadFollowUps();
    if (tab === 6 && !onboarding) loadOnboarding();
  }, [tab]);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await superAdminService.getCompanyOverview(companyId);
      if (res.status === 200) setCompany(res.data);
    } catch (err) {
      console.error('Error loading company overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHealth = async () => {
    try {
      const res = await superAdminService.getCompanyHealth(companyId);
      if (res.status === 200) setHealth(res.data);
    } catch (err) { /* optional */ }
  };

  const loadEmployees = async () => {
    try {
      const res = await superAdminService.getCompanyEmployees(companyId);
      if (res.status === 200) setEmployees(res.data || []);
    } catch (err) { console.error(err); }
  };

  const loadSubHistory = async () => {
    try {
      const res = await superAdminService.getCompanySubscriptionHistory(companyId);
      if (res.status === 200) setSubHistory(res.data || []);
    } catch (err) { console.error(err); }
  };

  const loadCommunications = async (page = 0) => {
    try {
      const res = await superAdminService.getCommunications(companyId, page);
      if (res.status === 200) {
        if (page === 0) {
          setComms(res.data.data || []);
        } else {
          setComms(prev => [...prev, ...(res.data.data || [])]);
        }
        setCommsTotal(res.data.total || 0);
        setCommsPage(page);
      }
    } catch (err) { console.error(err); }
  };

  const loadTimeline = async () => {
    try {
      const res = await superAdminService.getCompanyTimeline(companyId);
      if (res.status === 200) setTimeline(res.data || []);
    } catch (err) { console.error(err); }
  };

  const loadConfig = async () => {
    try {
      const res = await superAdminService.getCompanyConfig(companyId);
      if (res.status === 200) setConfigs(res.data || []);
    } catch (err) { console.error(err); }
  };

  const loadCompanyTags = async () => {
    try {
      const res = await superAdminService.getCompanyTags(companyId);
      if (res.status === 200) setCompanyTags(res.data || []);
    } catch (err) { console.error(err); }
  };

  const loadAllTags = async () => {
    try {
      const res = await superAdminService.getAllTags();
      if (res.status === 200) setAllTags(res.data || []);
    } catch (err) { console.error(err); }
  };

  const loadFollowUps = async () => {
    try {
      const res = await superAdminService.getCompanyFollowUps(companyId);
      if (res.status === 200) setFollowUps(res.data || []);
    } catch (err) { console.error(err); }
  };

  const loadOnboarding = async () => {
    setOnboardingLoading(true);
    try {
      const res = await superAdminService.getCompanyOnboarding(companyId);
      if (res.status === 200) setOnboarding(res.data);
    } catch (err) { console.error(err); }
    finally { setOnboardingLoading(false); }
  };

  const handleToggleMilestone = async (milestoneId, currentlyAchieved) => {
    try {
      await superAdminService.markOnboardingMilestone(companyId, milestoneId, { is_achieved: !currentlyAchieved });
      loadOnboarding();
    } catch (err) { console.error(err); }
  };

  const handleRescanOnboarding = async () => {
    setOnboardingLoading(true);
    try {
      await superAdminService.scanCompanyOnboarding(companyId);
      loadOnboarding();
    } catch (err) { console.error(err); }
    finally { setOnboardingLoading(false); }
  };

  const handleAddTag = async (tagId) => {
    try {
      await superAdminService.addCompanyTag(companyId, { tag_id: tagId });
      loadCompanyTags();
      setTagAnchor(null);
    } catch (err) { console.error(err); }
  };

  const handleRemoveTag = async (tagId) => {
    try {
      await superAdminService.removeCompanyTag(companyId, tagId);
      setCompanyTags(prev => prev.filter(t => t.id !== tagId));
    } catch (err) { console.error(err); }
  };

  const handleOpenTagMenu = (e) => {
    loadAllTags();
    setTagAnchor(e.currentTarget);
  };

  const handleLogComm = async () => {
    if (!commContent.trim()) return;
    setCommLoading(true);
    try {
      await superAdminService.logCommunication(companyId, {
        comm_type: commType,
        content: commContent.trim(),
        subject: commSubject.trim() || undefined,
      });
      setCommContent('');
      setCommSubject('');
      loadCommunications(0);
    } catch (err) { console.error(err); }
    finally { setCommLoading(false); }
  };

  const handleCreateFollowUp = async () => {
    if (!fuTitle.trim() || !fuDate) return;
    try {
      await superAdminService.createFollowUp(companyId, {
        title: fuTitle.trim(),
        reminder_date: fuDate,
        reminder_time: fuTime + ':00',
        description: fuDesc.trim() || undefined,
        assigned_to: storage?.employee_id,
        created_by: storage?.employee_id
      });
      setFollowUpOpen(false);
      setFuTitle(''); setFuDate(''); setFuTime('09:00'); setFuDesc('');
      loadFollowUps();
    } catch (err) { console.error(err); }
  };

  const handleCompleteFollowUp = async (id) => {
    try {
      await superAdminService.updateFollowUp(id, { action: 'complete' });
      loadFollowUps();
    } catch (err) { console.error(err); }
  };

  const handleExtend = async () => {
    if (!extendDays || parseInt(extendDays) <= 0) return;
    try {
      await superAdminService.extendSubscription(companyId, { days: parseInt(extendDays) });
      setExtendOpen(false);
      setExtendDays('');
      loadOverview();
    } catch (err) { console.error(err); }
  };

  const handleChangePlan = async () => {
    if (!selectedPlan) return;
    try {
      await superAdminService.changeCompanyPlan(companyId, { plan_id: selectedPlan });
      setChangePlanOpen(false);
      setSelectedPlan('');
      loadOverview();
    } catch (err) { console.error(err); }
  };

  const openChangePlanDialog = async () => {
    if (company?.company_type) {
      try {
        const typeId = company.company_type.toString().split(',')[0];
        const res = await SubscriptionPlanService.getPlansByCompanyType(typeId);
        if (res.status === 200) setAvailablePlans(res.data || []);
      } catch (err) { console.error(err); }
    }
    setChangePlanOpen(true);
  };

  const handleSaveConfig = async () => {
    if (!editingConfig) return;
    try {
      await superAdminService.updateCompanyConfig(companyId, {
        key_name: editingConfig,
        value: editConfigValue,
      });
      setConfigs(prev => prev.map(c => c.key_name === editingConfig ? { ...c, value: editConfigValue } : c));
      setEditingConfig(null);
    } catch (err) { console.error(err); }
  };

  const handleDeactivate = async () => {
    if (!window.confirm(`Deactivate company "${company.company_name || companyId}"? This will prevent all users from logging in.`)) return;
    try {
      await superAdminService.deactivateCompany(companyId);
      loadOverview();
    } catch (err) { console.error(err); }
  };

  const handleReactivate = async () => {
    try {
      await superAdminService.reactivateCompany(companyId);
      loadOverview();
    } catch (err) { console.error(err); }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setNoteLoading(true);
    try {
      await superAdminService.addCompanyNote(companyId, { note: noteText.trim() });
      setNoteText('');
      loadCommunications(0);
    } catch (err) { console.error(err); }
    finally { setNoteLoading(false); }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!company) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
        <Typography sx={{ mt: 2 }}>Company not found.</Typography>
      </Box>
    );
  }

  const status = getStatus(company);
  const daysLeft = company.sRemainingDays != null ? Math.max(0, company.sRemainingDays) : null;
  const availableTagsToAdd = allTags.filter(t => !companyTags.some(ct => ct.id === t.id));

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ px: 3, py: 2, bgcolor: '#fafafa', borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h6" fontWeight={600}>
                {company.company_name || `Company #${companyId}`}
              </Typography>
              <Chip
                label={status}
                size="small"
                sx={{ bgcolor: STATUS_COLORS[status] || '#9e9e9e', color: '#fff', fontWeight: 500 }}
              />
              <Chip label={`ID: ${companyId}`} size="small" variant="outlined" />
              <Chip label={company.company_type_name || company.company_type} size="small" color="primary" variant="outlined" />
              {/* Company Tags */}
              {companyTags.map(tag => (
                <Chip
                  key={tag.id}
                  label={tag.tag_name}
                  size="small"
                  onDelete={canManageTags ? () => handleRemoveTag(tag.id) : undefined}
                  sx={{ bgcolor: tag.tag_color + '22', color: tag.tag_color, fontWeight: 500, border: `1px solid ${tag.tag_color}44` }}
                />
              ))}
              {canManageTags && (
                <IconButton size="small" onClick={handleOpenTagMenu} sx={{ width: 24, height: 24 }}>
                  <AddIcon fontSize="small" />
                </IconButton>
              )}
              <Menu anchorEl={tagAnchor} open={Boolean(tagAnchor)} onClose={() => setTagAnchor(null)}>
                {availableTagsToAdd.length === 0 ? (
                  <MenuItem disabled><Typography variant="body2">No more tags</Typography></MenuItem>
                ) : availableTagsToAdd.map(tag => (
                  <MenuItem key={tag.id} onClick={() => handleAddTag(tag.id)}>
                    <Chip label={tag.tag_name} size="small" sx={{ bgcolor: tag.tag_color + '22', color: tag.tag_color, mr: 1 }} />
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {company.plan_name ? `Plan: ${company.plan_name}` : 'No plan assigned'}
              {daysLeft !== null && ` | ${daysLeft} days remaining`}
              {company.email && ` | ${company.email}`}
              {company.phone && ` | ${company.phone}`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {canManageSubs && (
              <>
                <Button size="small" variant="outlined" startIcon={<ExtensionIcon />} onClick={() => setExtendOpen(true)}>
                  Extend
                </Button>
                <Button size="small" variant="outlined" startIcon={<SwapHorizIcon />} onClick={openChangePlanDialog}>
                  Change Plan
                </Button>
              </>
            )}
            {canDeactivate && (company.isActive !== 0 ? (
              <Button size="small" variant="outlined" color="error" onClick={handleDeactivate}>
                Deactivate
              </Button>
            ) : (
              <Button size="small" variant="outlined" color="success" onClick={handleReactivate}>
                Reactivate
              </Button>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ minHeight: 44 }} variant="scrollable" scrollButtons="auto">
          <Tab icon={<BusinessIcon />} iconPosition="start" label="Overview" sx={{ textTransform: 'none', minHeight: 44 }} />
          <Tab icon={<PeopleIcon />} iconPosition="start" label={`Employees (${company.employee_count || 0})`} sx={{ textTransform: 'none', minHeight: 44 }} />
          <Tab icon={<HistoryIcon />} iconPosition="start" label="Subscription History" sx={{ textTransform: 'none', minHeight: 44 }} />
          <Tab icon={<TimelineIcon />} iconPosition="start" label="Communications" sx={{ textTransform: 'none', minHeight: 44 }} />
          <Tab icon={<SettingsIcon />} iconPosition="start" label="Configuration" sx={{ textTransform: 'none', minHeight: 44 }} />
          <Tab icon={<AlarmIcon />} iconPosition="start" label="Follow-ups" sx={{ textTransform: 'none', minHeight: 44 }} />
          <Tab icon={<RocketLaunchIcon />} iconPosition="start" label="Onboarding" sx={{ textTransform: 'none', minHeight: 44 }} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
        {/* ===== OVERVIEW TAB ===== */}
        {tab === 0 && (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Company Info</Typography>
                <InfoRow label="Company Name" value={company.company_name} />
                <InfoRow label="Company ID" value={company.company_id} />
                <InfoRow label="Company Type" value={company.company_type_name} />
                <InfoRow label="Type ID(s)" value={company.company_type} />
                <InfoRow label="Registered" value={formatDate(company.createdAt)} />
                <InfoRow label="Approval Status" value={company.isApproved || 'Pending'} />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Contact Details</Typography>
                <InfoRow label="Phone" value={company.phone} />
                <InfoRow label="Email" value={company.email} />
                <InfoRow label="Address" value={company.address} />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Subscription</Typography>
                <InfoRow label="Current Plan" value={company.plan_name || 'None'} />
                <InfoRow label="Plan Price" value={company.plan_price ? `Rs. ${company.plan_price}` : '-'} />
                <InfoRow label="Duration" value={company.duration_days ? `${company.duration_days} days` : '-'} />
                <InfoRow label="Start Date" value={formatDate(company.sStartDate)} />
                <InfoRow label="End Date" value={formatDate(company.sEndDate)} />
                <InfoRow label="Days Remaining" value={
                  daysLeft !== null ? (
                    <span style={{ color: daysLeft <= 0 ? '#f44336' : daysLeft <= 30 ? '#ff9800' : '#4caf50', fontWeight: 600 }}>
                      {daysLeft}
                    </span>
                  ) : '-'
                } />
                <InfoRow label="Expired" value={company.sIsExpired ? 'Yes' : 'No'} />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Usage Stats</Typography>
                <InfoRow label="Total Employees" value={company.employee_count} />
                <InfoRow label="Active Employees" value={company.active_employee_count} />
              </Paper>
            </Grid>
            {health && (
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>Company Health</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Box sx={{
                      width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: health.health_score >= 75 ? '#e8f5e9' : health.health_score >= 50 ? '#fff3e0' : health.health_score >= 25 ? '#fff8e1' : '#ffebee',
                      border: `3px solid ${health.health_score >= 75 ? '#4caf50' : health.health_score >= 50 ? '#ff9800' : health.health_score >= 25 ? '#ffc107' : '#f44336'}`,
                    }}>
                      <Typography variant="h6" fontWeight={700} color={health.health_score >= 75 ? '#2e7d32' : health.health_score >= 50 ? '#e65100' : health.health_score >= 25 ? '#f57f17' : '#c62828'}>
                        {health.health_score}
                      </Typography>
                    </Box>
                    <Box>
                      <Chip
                        label={health.health_label}
                        size="small"
                        sx={{
                          fontWeight: 600, fontSize: '0.8rem',
                          bgcolor: health.health_score >= 75 ? '#e8f5e9' : health.health_score >= 50 ? '#fff3e0' : health.health_score >= 25 ? '#fff8e1' : '#ffebee',
                          color: health.health_score >= 75 ? '#2e7d32' : health.health_score >= 50 ? '#e65100' : health.health_score >= 25 ? '#f57f17' : '#c62828',
                        }}
                      />
                    </Box>
                  </Box>
                  <InfoRow label="Last Login" value={health.last_login ? formatDateTime(health.last_login) : 'Never'} />
                  <InfoRow label="Active / Total" value={`${health.active_employees} / ${health.total_employees}`} />
                  <InfoRow label="Total Renewals" value={health.total_renewals} />
                  <InfoRow label="Days Since Signup" value={health.days_since_registration} />
                </Paper>
              </Grid>
            )}
          </Grid>
        )}

        {/* ===== EMPLOYEES TAB ===== */}
        {tab === 1 && (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Joined</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No employees found</Typography>
                    </TableCell>
                  </TableRow>
                ) : employees.map((emp) => (
                  <TableRow key={emp.employee_id} hover>
                    <TableCell>{[emp.first_name, emp.last_name].filter(Boolean).join(' ') || '-'}</TableCell>
                    <TableCell>{emp.role_name || '-'}</TableCell>
                    <TableCell>{emp.phone_number || '-'}</TableCell>
                    <TableCell>{emp.email || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={emp.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{ bgcolor: emp.isActive ? '#e8f5e9' : '#ffebee', color: emp.isActive ? '#2e7d32' : '#c62828', fontSize: '0.75rem', height: 22 }}
                      />
                    </TableCell>
                    <TableCell>{formatDate(emp.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* ===== SUBSCRIPTION HISTORY TAB ===== */}
        {tab === 2 && (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Plan</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Period (days)</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No subscription history</Typography>
                    </TableCell>
                  </TableRow>
                ) : subHistory.map((sh) => (
                  <TableRow key={sh.id} hover>
                    <TableCell>{sh.plan_name || `Plan #${sh.plan_type}`}</TableCell>
                    <TableCell>{formatDate(sh.subscription_start_date)}</TableCell>
                    <TableCell>{formatDate(sh.subscription_end_date)}</TableCell>
                    <TableCell>{sh.subscription_period}</TableCell>
                    <TableCell>
                      <Chip
                        label={sh.status}
                        size="small"
                        sx={{
                          bgcolor: sh.status === 'ACTIVE_SUB' ? '#e8f5e9' : '#fff3e0',
                          color: sh.status === 'ACTIVE_SUB' ? '#2e7d32' : '#e65100',
                          fontSize: '0.75rem', height: 22
                        }}
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(sh.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* ===== COMMUNICATIONS TAB (unified timeline) ===== */}
        {tab === 3 && (
          <>
            {/* Communication Form */}
            {(canSendComm || canAddNote) && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Type</InputLabel>
                    <Select value={commType} onChange={(e) => setCommType(e.target.value)} label="Type">
                      <MenuItem value="note">Note</MenuItem>
                      <MenuItem value="call">Call Log</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="whatsapp">WhatsApp</MenuItem>
                      <MenuItem value="internal">Internal</MenuItem>
                    </Select>
                  </FormControl>
                  {commType !== 'note' && (
                    <TextField
                      size="small"
                      placeholder="Subject (optional)"
                      value={commSubject}
                      onChange={(e) => setCommSubject(e.target.value)}
                      sx={{ width: 200 }}
                    />
                  )}
                  <TextField
                    size="small"
                    multiline
                    maxRows={3}
                    placeholder={commType === 'note' ? 'Add a note...' : `Log ${commType} communication...`}
                    value={commContent}
                    onChange={(e) => setCommContent(e.target.value)}
                    sx={{ flex: 1, minWidth: 250 }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    disabled={!commContent.trim() || commLoading}
                    onClick={handleLogComm}
                    sx={{ textTransform: 'none', minWidth: 80, height: 40 }}
                  >
                    {commLoading ? 'Saving...' : 'Log'}
                  </Button>
                </Box>
              </Paper>
            )}

            {/* Unified Timeline */}
            <Box>
              {comms.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No communications yet</Typography>
                </Paper>
              ) : comms.map((item, idx) => {
                const iconType = item.source === 'audit' ? 'audit' : item.source === 'approval' ? 'approval' : item.comm_type;
                const color = COMM_COLORS[iconType] || '#607d8b';
                return (
                  <Box key={`${item.source}-${item.id}-${idx}`} sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      bgcolor: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: color, mt: 0.5,
                    }}>
                      {COMM_ICONS[iconType] || <ChatIcon fontSize="small" />}
                    </Box>
                    <Paper variant="outlined" sx={{ flex: 1, p: 1.5, borderLeft: `3px solid ${color}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Chip
                          label={item.source === 'audit' ? item.action_type?.replace(/_/g, ' ') : (item.subject || item.comm_type)}
                          size="small"
                          sx={{ fontSize: '0.7rem', height: 20, textTransform: 'capitalize', bgcolor: color + '15', color: color }}
                        />
                        {item.direction && item.direction !== 'internal' && (
                          <Chip label={item.direction} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                          {formatDateTime(item.createdAt)}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{item.content || '-'}</Typography>
                      {item.sent_to && (
                        <Typography variant="caption" color="text.secondary">To: {item.sent_to}</Typography>
                      )}
                    </Paper>
                  </Box>
                );
              })}
              {comms.length < commsTotal && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button size="small" variant="outlined" onClick={() => loadCommunications(commsPage + 1)}>
                    Show More
                  </Button>
                </Box>
              )}
            </Box>
          </>
        )}

        {/* ===== CONFIGURATION TAB ===== */}
        {tab === 4 && (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', width: 300 }}>Key</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Value</TableCell>
                  {canEditConfig && <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', width: 80 }} align="center">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {configs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canEditConfig ? 3 : 2} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No configuration found</Typography>
                    </TableCell>
                  </TableRow>
                ) : configs.map((cfg) => (
                  <TableRow key={cfg.key_name} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{cfg.key_name}</TableCell>
                    <TableCell>
                      {editingConfig === cfg.key_name ? (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <TextField
                            size="small"
                            value={editConfigValue}
                            onChange={(e) => setEditConfigValue(e.target.value)}
                            sx={{ flex: 1 }}
                            autoFocus
                          />
                          <IconButton size="small" color="primary" onClick={handleSaveConfig}><SaveIcon fontSize="small" /></IconButton>
                          <IconButton size="small" onClick={() => setEditingConfig(null)}><CloseIcon fontSize="small" /></IconButton>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                          {cfg.value || <span style={{ color: '#999' }}>empty</span>}
                        </Typography>
                      )}
                    </TableCell>
                    {canEditConfig && (
                      <TableCell align="center">
                        {editingConfig !== cfg.key_name && (
                          <IconButton
                            size="small"
                            onClick={() => { setEditingConfig(cfg.key_name); setEditConfigValue(cfg.value || ''); }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* ===== FOLLOW-UPS TAB ===== */}
        {tab === 5 && (
          <>
            {canManageFollowUps && (
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setFollowUpOpen(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Add Reminder
                </Button>
              </Box>
            )}
            {followUps.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No follow-ups scheduled</Typography>
              </Paper>
            ) : (
              <Grid container spacing={1.5}>
                {followUps.map(fu => (
                  <Grid size={{ xs: 12, md: 6 }} key={fu.id}>
                    <Paper variant="outlined" sx={{
                      p: 2,
                      borderLeft: `4px solid ${fu.status === 'completed' ? '#4caf50' : fu.reminder_date < new Date().toISOString().split('T')[0] ? '#f44336' : '#ff9800'}`,
                      opacity: fu.status === 'completed' ? 0.7 : 1,
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <ScheduleIcon fontSize="small" color="action" />
                        <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1 }}>{fu.title}</Typography>
                        <Chip
                          label={fu.status}
                          size="small"
                          sx={{
                            fontSize: '0.7rem', height: 20,
                            bgcolor: fu.status === 'completed' ? '#e8f5e9' : fu.status === 'cancelled' ? '#ffebee' : '#fff3e0',
                            color: fu.status === 'completed' ? '#2e7d32' : fu.status === 'cancelled' ? '#c62828' : '#e65100',
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(fu.reminder_date)} at {fu.reminder_time?.substring(0, 5)}
                        {fu.assigned_to_name && ` | Assigned: ${fu.assigned_to_name}`}
                      </Typography>
                      {fu.description && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>{fu.description}</Typography>
                      )}
                      {fu.status === 'pending' && canManageFollowUps && (
                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleCompleteFollowUp(fu.id)}
                            sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                          >
                            Complete
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {/* ===== ONBOARDING TAB ===== */}
        {tab === 6 && (
          <>
            {onboardingLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            ) : onboarding ? (
              <>
                {/* Score Overview */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                  <Box sx={{
                    width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `4px solid ${(onboarding.score?.onboarding_score || 0) >= 80 ? '#4caf50' : (onboarding.score?.onboarding_score || 0) >= 50 ? '#ff9800' : '#f44336'}`,
                    bgcolor: (onboarding.score?.onboarding_score || 0) >= 80 ? '#e8f5e9' : (onboarding.score?.onboarding_score || 0) >= 50 ? '#fff3e0' : '#ffebee',
                  }}>
                    <Typography variant="h5" fontWeight={700} color={(onboarding.score?.onboarding_score || 0) >= 80 ? '#2e7d32' : (onboarding.score?.onboarding_score || 0) >= 50 ? '#e65100' : '#c62828'}>
                      {onboarding.score?.onboarding_score || 0}%
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>Onboarding Progress</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {onboarding.score?.achieved_milestones || 0} of {onboarding.score?.total_milestones || 0} milestones completed
                      {onboarding.score?.days_since_signup != null && ` | ${onboarding.score.days_since_signup} days since signup`}
                    </Typography>
                    <Box sx={{ mt: 1, maxWidth: 300 }}>
                      <LinearProgress
                        variant="determinate"
                        value={onboarding.score?.onboarding_score || 0}
                        sx={{ height: 10, borderRadius: 5, bgcolor: '#f0f0f0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            bgcolor: (onboarding.score?.onboarding_score || 0) >= 80 ? '#4caf50' : (onboarding.score?.onboarding_score || 0) >= 50 ? '#ff9800' : '#f44336',
                          }
                        }}
                      />
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleRescanOnboarding}
                    sx={{ textTransform: 'none' }}
                  >
                    Rescan
                  </Button>
                </Box>

                {/* Milestone Checklist */}
                <Grid container spacing={1.5}>
                  {(onboarding.progress || []).map((m, idx) => (
                    <Grid size={{ xs: 12, md: 6 }} key={m.milestone_id || idx}>
                      <Paper variant="outlined" sx={{
                        p: 2, display: 'flex', alignItems: 'center', gap: 1.5,
                        borderLeft: `4px solid ${m.is_achieved ? '#4caf50' : '#e0e0e0'}`,
                        opacity: m.is_achieved ? 1 : 0.85,
                      }}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleMilestone(m.milestone_id, m.is_achieved)}
                          sx={{ color: m.is_achieved ? '#4caf50' : '#bdbdbd' }}
                        >
                          {m.is_achieved ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                        </IconButton>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600} sx={{ textDecoration: m.is_achieved ? 'none' : 'none' }}>
                            {m.milestone_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{m.milestone_desc}</Typography>
                          {m.is_achieved && m.achieved_at && (
                            <Typography variant="caption" display="block" color="success.main">
                              Achieved: {formatDateTime(m.achieved_at)}
                              {m.manually_marked_by && ' (manual)'}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={m.detection_type}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.65rem', height: 18 }}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                {(onboarding.progress || []).length === 0 && (
                  <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No milestones found. Click Rescan to initialize.</Typography>
                  </Paper>
                )}
              </>
            ) : (
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No onboarding data available. Click Rescan to initialize.</Typography>
                <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={handleRescanOnboarding} sx={{ mt: 1, textTransform: 'none' }}>
                  Rescan
                </Button>
              </Paper>
            )}
          </>
        )}
      </Box>

      {/* Extend Subscription Dialog */}
      <Dialog open={extendOpen} onClose={() => setExtendOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Extend Subscription</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Current end date: {formatDate(company.sEndDate)} ({daysLeft} days remaining)
          </Typography>
          <TextField
            label="Number of days to extend"
            type="number"
            fullWidth
            value={extendDays}
            onChange={(e) => setExtendDays(e.target.value)}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExtendOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleExtend} disabled={!extendDays || parseInt(extendDays) <= 0}>
            Extend
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanOpen} onClose={() => setChangePlanOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Change Subscription Plan</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Current plan: {company.plan_name || 'None'}
          </Typography>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Select Plan</InputLabel>
            <Select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              label="Select Plan"
            >
              {availablePlans.map((p) => (
                <MenuItem key={p.id} value={p.id} disabled={p.id === company.plan_type}>
                  {p.plan_name} {p.Price ? `- Rs. ${p.Price}` : ''} {p.id === company.plan_type ? '(current)' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePlanOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleChangePlan} disabled={!selectedPlan}>
            Change Plan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Follow-up Dialog */}
      <Dialog open={followUpOpen} onClose={() => setFollowUpOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Follow-up Reminder</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            value={fuTitle}
            onChange={(e) => setFuTitle(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Date"
              type="date"
              value={fuDate}
              onChange={(e) => setFuDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Time"
              type="time"
              value={fuTime}
              onChange={(e) => setFuTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Box>
          <TextField
            label="Description (optional)"
            fullWidth
            multiline
            rows={2}
            value={fuDesc}
            onChange={(e) => setFuDesc(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFollowUpOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateFollowUp} disabled={!fuTitle.trim() || !fuDate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
