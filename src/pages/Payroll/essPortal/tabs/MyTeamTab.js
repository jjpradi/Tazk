import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Avatar, Chip, LinearProgress, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';

const STATUS_CHIP = {
  active: { color: '#2e7d32', bg: '#e8f5e9' },
  probation: { color: '#ed6c02', bg: '#fff3e0' },
  notice_period: { color: '#d32f2f', bg: '#ffebee' },
};

export default function MyTeamTab() {
  const { EssPortalReducer: { teamMembers, teamAttendance, teamPendingRequests } } = useSelector((s) => s);
  const [viewMember, setViewMember] = useState(null);

  const members = teamMembers || [];
  const attendance = teamAttendance || [];
  const pendingReqs = teamPendingRequests || [];

  const getAttendanceForMember = (empId) => attendance.find((a) => a.employee_id === empId);

  return (
    <Box>
      <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>My Team</Typography>

      {members.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            No team members reporting to you.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Team Summary */}
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: 'primary.main' }}>{members.length}</Typography>
                <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Total Members</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#ed6c02' }}>{pendingReqs.length}</Typography>
                <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Pending Requests</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Member Cards */}
          <Grid container spacing={1.5} sx={{ mb: 3 }}>
            {members.map((m) => {
              const att = getAttendanceForMember(m.employee_id);
              const sc = STATUS_CHIP[m.employee_status] || STATUS_CHIP.active;
              return (
                <Grid key={m.employee_id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                      cursor: 'pointer', transition: 'box-shadow 0.2s',
                      '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
                    }}
                    onClick={() => setViewMember(m)}
                  >
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Avatar
                        src={m.image || undefined}
                        sx={{ width: 40, height: 40, bgcolor: 'primary.light' }}
                      >
                        {(m.full_name || m.first_name || '?')[0]}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
                          {m.full_name || m.first_name}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.secondary' }} noWrap>
                          {m.employee_code} {m.designation ? `- ${m.designation}` : ''}
                        </Typography>
                      </Box>
                      {m.employee_status && (
                        <Chip size='small' label={m.employee_status}
                          sx={{ fontSize: 9, height: 20, bgcolor: sc.bg, color: sc.color, fontWeight: 600 }} />
                      )}
                    </Box>
                    {m.department_name && (
                      <Typography sx={{ fontSize: 10, color: 'text.disabled', mt: 1 }}>
                        {m.department_name}
                      </Typography>
                    )}
                    {att && (
                      <Box sx={{ mt: 1.5, display: 'flex', gap: 1.5 }}>
                        <Tooltip title='Present'>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <EventAvailableIcon sx={{ fontSize: 14, color: '#2e7d32' }} />
                            <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{att.present_days || 0}</Typography>
                          </Box>
                        </Tooltip>
                        <Tooltip title='Absent'>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <EventBusyIcon sx={{ fontSize: 14, color: '#d32f2f' }} />
                            <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{att.absent_days || 0}</Typography>
                          </Box>
                        </Tooltip>
                        <Tooltip title='Leave'>
                          <Typography sx={{ fontSize: 11, color: '#ed6c02', fontWeight: 600 }}>
                            L: {att.leave_days || 0}
                          </Typography>
                        </Tooltip>
                        <Tooltip title='Half Day'>
                          <Typography sx={{ fontSize: 11, color: '#9c27b0', fontWeight: 600 }}>
                            HD: {att.halfday_days || 0}
                          </Typography>
                        </Tooltip>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {/* Pending Requests */}
          {pendingReqs.length > 0 && (
            <>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5, color: '#ed6c02' }}>
                Pending Team Requests
              </Typography>
              <Grid container spacing={1.5}>
                {pendingReqs.map((r) => (
                  <Grid key={`${r.request_type}-${r.request_id}`} size={{ xs: 12, sm: 6 }}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                            {r.employee_name} ({r.employee_code})
                          </Typography>
                          <Chip size='small' label={r.request_type === 'leave' ? 'Leave' : 'Permission'}
                            sx={{ mt: 0.5, fontSize: 10, height: 20,
                              bgcolor: r.request_type === 'leave' ? '#e3f2fd' : '#f3e5f5',
                              color: r.request_type === 'leave' ? '#1565c0' : '#7b1fa2',
                            }} />
                        </Box>
                        <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>{r.request_date}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 12, mt: 1 }}>{r.detail}</Typography>
                      {r.from_date && (
                        <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>
                          {r.from_date}{r.to_date ? ` - ${r.to_date}` : ''}
                          {r.duration ? ` (${r.duration} day${r.duration > 1 ? 's' : ''})` : ''}
                        </Typography>
                      )}
                      {r.reason && (
                        <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5, fontStyle: 'italic' }}>
                          {r.reason}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </>
      )}

      {/* Member Detail Dialog */}
      <Dialog open={!!viewMember} onClose={() => setViewMember(null)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>Team Member Details</DialogTitle>
        <DialogContent>
          {viewMember && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                <Avatar src={viewMember.image || undefined} sx={{ width: 56, height: 56, bgcolor: 'primary.light' }}>
                  {(viewMember.full_name || viewMember.first_name || '?')[0]}
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 700 }}>{viewMember.full_name || viewMember.first_name}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{viewMember.employee_code}</Typography>
                </Box>
              </Box>
              {[
                ['Designation', viewMember.designation],
                ['Department', viewMember.department_name],
                ['Employment Type', viewMember.employment_type],
                ['Status', viewMember.employee_status],
                ['Email', viewMember.email],
                ['Phone', viewMember.phone_number],
                ['Date of Joining', viewMember.doj_formatted],
              ].map(([label, value]) => (
                <Box key={label} sx={{ display: 'flex', gap: 1 }}>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', minWidth: 130 }}>{label}:</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{value || '-'}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewMember(null)} sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
