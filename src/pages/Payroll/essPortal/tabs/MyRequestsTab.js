import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Chip,
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';

const STATUS_COLORS = {
  Pending: { bg: '#fff3e0', color: '#ed6c02' },
  pending: { bg: '#fff3e0', color: '#ed6c02' },
  Approved: { bg: '#e8f5e9', color: '#2e7d32' },
  approved: { bg: '#e8f5e9', color: '#2e7d32' },
  Rejected: { bg: '#ffebee', color: '#d32f2f' },
  rejected: { bg: '#ffebee', color: '#d32f2f' },
  Cancelled: { bg: '#f5f5f5', color: '#757575' },
};

const TYPE_CONFIG = {
  leave: { icon: <EventNoteIcon sx={{ fontSize: 16 }} />, label: 'Leave', color: '#1565c0', bg: '#e3f2fd' },
  permission: { icon: <AccessTimeIcon sx={{ fontSize: 16 }} />, label: 'Permission', color: '#7b1fa2', bg: '#f3e5f5' },
  profile_change: { icon: <PersonIcon sx={{ fontSize: 16 }} />, label: 'Profile Change', color: '#0d47a1', bg: '#e8eaf6' },
};

export default function MyRequestsTab() {
  const { EssPortalReducer: { myRequests } } = useSelector((s) => s);
  const requests = myRequests || [];

  return (
    <Box>
      <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>My Request Tracker</Typography>

      {requests.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            No requests found.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {requests.map((r, i) => {
            const tc = TYPE_CONFIG[r.request_type] || TYPE_CONFIG.leave;
            const sc = STATUS_COLORS[r.status] || STATUS_COLORS.Pending;
            return (
              <Grid key={`${r.request_type}-${r.request_id}-${i}`} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                    borderLeft: `3px solid ${tc.color}`,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <Chip size='small' icon={tc.icon} label={tc.label}
                        sx={{ fontSize: 10, height: 22, bgcolor: tc.bg, color: tc.color, fontWeight: 600,
                          '& .MuiChip-icon': { color: tc.color },
                        }} />
                    </Box>
                    <Chip size='small' label={r.status}
                      sx={{ fontSize: 10, height: 20, bgcolor: sc.bg, color: sc.color, fontWeight: 600 }} />
                  </Box>

                  <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{r.detail}</Typography>

                  {r.from_date && (
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>
                      {r.from_date}{r.to_date ? ` - ${r.to_date}` : ''}
                      {r.duration ? ` (${r.duration} day${r.duration > 1 ? 's' : ''})` : ''}
                    </Typography>
                  )}

                  {r.reason && (
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5, fontStyle: 'italic' }} noWrap>
                      {r.reason}
                    </Typography>
                  )}

                  <Typography sx={{ fontSize: 10, color: 'text.disabled', mt: 1 }}>
                    {r.request_date}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
