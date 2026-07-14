import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, Typography, Grid, Tabs, Tab, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Select, MenuItem,
  FormControl, InputLabel, Skeleton, IconButton, LinearProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon, Refresh as RefreshIcon,
  CheckCircle as SentIcon, Error as FailedIcon, Block as BlockedIcon,
  Schedule as QueuedIcon, Speed as RateIcon,
} from '@mui/icons-material';
import http from '../../../http-common';

const CHANNEL_COLORS = { in_app: '#1976d2', push: '#9c27b0', email: '#0288d1', sms: '#ed6c02', whatsapp: '#2e7d32' };
const STATUS_COLORS = { sent: 'success', failed: 'error', blocked: 'warning', rate_limited: 'info', queued: 'default' };
const cellSx = { fontSize: 12, py: 0.75 };
const headerCellSx = { ...cellSx, fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 };

async function fetchAnalytics(days) {
  const res = await http.get(`/notifyservice/api/analytics?days=${days}`);
  return res.data;
}

function StatCard({ icon, label, value, color = 'text.primary', sub }) {
  return (
    <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ color, fontSize: 32, display: 'flex' }}>{icon}</Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color }}>{value ?? '-'}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        {sub && <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', fontSize: 10 }}>{sub}</Typography>}
      </Box>
    </Card>
  );
}

function BarChart({ data, labelKey, valueKey, maxVal, color = '#1976d2' }) {
  if (!data?.length) return <Typography color="text.secondary" sx={{ p: 2, fontSize: 12 }}>No data</Typography>;
  const max = maxVal || Math.max(...data.map(d => Number(d[valueKey]) || 0), 1);
  return (
    <Box sx={{ px: 2 }}>
      {data.map((d, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography sx={{ fontSize: 11, minWidth: 120, textAlign: 'right', fontFamily: 'monospace' }}>{d[labelKey]}</Typography>
          <Box sx={{ flex: 1, position: 'relative', height: 18, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(Number(d[valueKey]) / max) * 100}%`, bgcolor: color, borderRadius: 1, minWidth: Number(d[valueKey]) > 0 ? 2 : 0 }} />
          </Box>
          <Typography sx={{ fontSize: 11, minWidth: 40, fontWeight: 600 }}>{d[valueKey]}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function NotificationAnalytics() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchAnalytics(days);
      setData(result);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
    setLoading(false);
  }, [days]);

  useEffect(() => { load(); }, [load]);

  const s = data?.summary || {};

  return (
    <Box sx={{ p: 2, height: 'calc(100vh - 70px)', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Notification Analytics
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Period</InputLabel>
            <Select value={days} label="Period" onChange={e => setDays(e.target.value)}>
              <MenuItem value={1}>Today</MenuItem>
              <MenuItem value={7}>7 days</MenuItem>
              <MenuItem value={30}>30 days</MenuItem>
              <MenuItem value={90}>90 days</MenuItem>
            </Select>
          </FormControl>
          <IconButton size="small" onClick={load}><RefreshIcon /></IconButton>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <StatCard icon={<NotificationsIcon />} label="Total" value={s.total} color="text.primary" />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <StatCard icon={<SentIcon />} label="Sent" value={s.sent} color="success.main" sub={s.total ? `${((s.sent / s.total) * 100).toFixed(1)}%` : ''} />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <StatCard icon={<FailedIcon />} label="Failed" value={s.failed} color="error.main" />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <StatCard icon={<BlockedIcon />} label="Blocked" value={s.blocked} color="warning.main" />
        </Grid>
        <Grid size={{ xs: 6, md: 2.4 }}>
          <StatCard icon={<RateIcon />} label="Rate Limited" value={s.rate_limited} color="info.main" />
        </Grid>
      </Grid>

      {/* Queue Status */}
      {data?.queue && (
        <Card sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Queue Status ({data.queue.mode})</Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Chip label={`Waiting: ${data.queue.waiting}`} size="small" />
            <Chip label={`Active: ${data.queue.active}`} size="small" color="primary" />
            <Chip label={`Completed: ${data.queue.completed}`} size="small" color="success" />
            <Chip label={`Failed: ${data.queue.failed}`} size="small" color="error" />
          </Box>
        </Card>
      )}

      <Grid container spacing={2}>
        {/* Daily Trend */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Daily Trend</Typography>
            {data?.dailyTrend?.length ? (
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 150, px: 1 }}>
                {data.dailyTrend.map((d, i) => {
                  const max = Math.max(...data.dailyTrend.map(x => Number(x.total) || 0), 1);
                  const h = (Number(d.total) / max) * 130;
                  const failH = (Number(d.failed) / max) * 130;
                  return (
                    <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: 9, color: 'text.disabled', mb: 0.25 }}>{d.total}</Typography>
                      <Box sx={{ width: '100%', position: 'relative' }}>
                        <Box sx={{ height: h, bgcolor: 'primary.light', borderRadius: '2px 2px 0 0', position: 'relative' }}>
                          {failH > 0 && <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: failH, bgcolor: 'error.light', borderRadius: '0 0 2px 2px' }} />}
                        </Box>
                      </Box>
                      <Typography sx={{ fontSize: 8, color: 'text.disabled', mt: 0.25, writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 45 }}>
                        {d.date?.slice(5)}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            ) : <Typography color="text.secondary" sx={{ fontSize: 12 }}>No data</Typography>}
          </Card>
        </Grid>

        {/* By Channel */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>By Channel</Typography>
            {data?.byChannel?.map(ch => (
              <Box key={ch.channel} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Chip label={ch.channel} size="small" sx={{ bgcolor: CHANNEL_COLORS[ch.channel] + '20', color: CHANNEL_COLORS[ch.channel], fontWeight: 600, fontSize: 11 }} />
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{ch.total}</Typography>
                  <Typography sx={{ fontSize: 10, color: 'success.main' }}>{ch.sent} sent</Typography>
                  {Number(ch.failed) > 0 && <Typography sx={{ fontSize: 10, color: 'error.main' }}>{ch.failed} fail</Typography>}
                </Box>
              </Box>
            ))}
          </Card>
        </Grid>

        {/* Top Notification Keys */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Top Notification Keys</Typography>
            <BarChart data={data?.byKey?.slice(0, 10)} labelKey="notification_key" valueKey="total" color="#1976d2" />
          </Card>
        </Grid>

        {/* By Source Service */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>By Source Service</Typography>
            <BarChart data={data?.byService} labelKey="source_service" valueKey="total" color="#9c27b0" />
          </Card>
        </Grid>

        {/* Top Failures */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Top Failures</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Key</TableCell>
                    <TableCell sx={headerCellSx}>Channel</TableCell>
                    <TableCell sx={headerCellSx}>Reason</TableCell>
                    <TableCell sx={{ ...headerCellSx, width: 60 }}>Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.topFailed?.map((f, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ ...cellSx, fontFamily: 'monospace' }}>{f.notification_key}</TableCell>
                      <TableCell sx={cellSx}><Chip label={f.channel} size="small" sx={{ fontSize: 10 }} /></TableCell>
                      <TableCell sx={{ ...cellSx, color: 'error.main', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.failure_reason || '-'}</TableCell>
                      <TableCell sx={{ ...cellSx, fontWeight: 600 }}>{f.count}</TableCell>
                    </TableRow>
                  ))}
                  {(!data?.topFailed?.length) && (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>No failures</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
