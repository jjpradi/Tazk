import React from 'react';
import {
  Box, Typography, Paper, Grid, LinearProgress, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import BadgeIcon from '@mui/icons-material/Badge';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SchoolIcon from '@mui/icons-material/School';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ApartmentIcon from '@mui/icons-material/Apartment';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { format } from 'date-fns';

const kpiCards = (s) => [
  { label: 'Total Active', value: s.active || 0, color: '#1976d2', bg: '#e3f2fd', icon: <PeopleIcon /> },
  { label: 'On Probation', value: s.on_probation || 0, color: '#ed6c02', bg: '#fff3e0', icon: <HourglassEmptyIcon /> },
  { label: 'On Notice', value: s.on_notice || 0, color: '#f57c00', bg: '#ffe0b2', icon: <ExitToAppIcon /> },
  { label: 'Separated', value: s.separated || 0, color: '#d32f2f', bg: '#ffebee', icon: <PersonOffIcon /> },
];

const empTypeCards = (s) => [
  { label: 'Permanent', value: s.permanent || 0, color: '#2e7d32', bg: '#e8f5e9', icon: <BadgeIcon /> },
  { label: 'Contract', value: s.contract || 0, color: '#0288d1', bg: '#e1f5fe', icon: <HandshakeIcon /> },
  { label: 'Interns', value: s.interns || 0, color: '#7b1fa2', bg: '#f3e5f5', icon: <SchoolIcon /> },
  { label: 'Consultants', value: s.consultants || 0, color: '#00838f', bg: '#e0f7fa', icon: <SupportAgentIcon /> },
];

const sectionHeader = (icon, title) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
    {React.cloneElement(icon, { sx: { fontSize: 18, color: 'primary.main' } })}
    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{title}</Typography>
  </Box>
);

const tableCellSx = { fontSize: 11, py: 1, px: 1.5 };
const tableHeadCellSx = { ...tableCellSx, fontWeight: 700, bgcolor: '#f5f5f5' };

export default function HeadcountTab({ headcountSummary, headcountByDept, headcountByGrade, headcountTrend, newJoiners }) {
  const summary = headcountSummary || {};
  const deptData = headcountByDept || [];
  const gradeData = headcountByGrade || [];
  const trendData = headcountTrend || [];
  const joiners = newJoiners || [];

  const maxDeptHeadcount = Math.max(...deptData.map((d) => d.headcount || 0), 1);
  const maxGradeHeadcount = Math.max(...gradeData.map((g) => g.headcount || 0), 1);
  const maxMonthlyJoiners = Math.max(...trendData.map((t) => t.joiners || 0), 1);

  const renderKpiCard = (card) => (
    <Grid key={card.label} size={{ xs: 6, sm: 6, md: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
          textAlign: 'center', borderTop: `3px solid ${card.color}`,
        }}
      >
        {React.cloneElement(card.icon, { sx: { fontSize: 28, color: card.color, mb: 0.5 } })}
        <Typography sx={{ fontSize: 24, fontWeight: 700, color: card.color, lineHeight: 1.2 }}>
          {card.value}
        </Typography>
        <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 500, mt: 0.3 }}>
          {card.label}
        </Typography>
      </Paper>
    </Grid>
  );

  const renderSmallCard = (card) => (
    <Grid key={card.label} size={{ xs: 6, sm: 6, md: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider',
          display: 'flex', alignItems: 'center', gap: 1.5,
          borderLeft: `3px solid ${card.color}`,
        }}
      >
        <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {React.cloneElement(card.icon, { sx: { fontSize: 18, color: card.color } })}
        </Box>
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: card.color, lineHeight: 1.2 }}>
            {card.value}
          </Typography>
          <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 500 }}>
            {card.label}
          </Typography>
        </Box>
      </Paper>
    </Grid>
  );

  const formatDate = (d) => {
    if (!d) return '-';
    try { return format(new Date(d), 'dd MMM yyyy'); } catch { return '-'; }
  };

  const statusChip = (status) => {
    const map = {
      active: { bg: '#e8f5e9', color: '#2e7d32' },
      probation: { bg: '#fff3e0', color: '#ed6c02' },
      notice: { bg: '#ffe0b2', color: '#f57c00' },
      separated: { bg: '#ffebee', color: '#d32f2f' },
    };
    const key = (status || '').toLowerCase().replace(/on_|on /g, '');
    const s = map[key] || { bg: '#f5f5f5', color: '#757575' };
    return (
      <Chip size='small' label={status || '-'}
        sx={{ fontSize: 9, height: 20, bgcolor: s.bg, color: s.color, textTransform: 'capitalize' }} />
    );
  };

  return (
    <Box>
      {/* Total Employees Banner */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <PersonIcon sx={{ fontSize: 20, color: 'primary.main' }} />
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Headcount Analytics</Typography>
        {summary.total_employees != null && (
          <Chip size='small' label={`Total Employees: ${summary.total_employees}`}
            sx={{ fontSize: 10, height: 22, fontWeight: 600, bgcolor: '#e3f2fd', color: '#1976d2', ml: 1 }} />
        )}
      </Box>

      {/* KPI Cards - Active, Probation, Notice, Separated */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {kpiCards(summary).map(renderKpiCard)}
      </Grid>

      {/* Employment Type Row */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {empTypeCards(summary).map(renderSmallCard)}
      </Grid>

      {/* Monthly Joining Trend */}
      {sectionHeader(<TrendingUpIcon />, 'Monthly Joining Trend (Last 12 Months)')}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        {trendData.length === 0 ? (
          <Typography sx={{ fontSize: 12, color: 'text.secondary', textAlign: 'center', py: 2 }}>
            No trend data available.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {trendData.map((t) => {
              const pct = maxMonthlyJoiners > 0 ? ((t.joiners || 0) / maxMonthlyJoiners) * 100 : 0;
              return (
                <Box key={t.month} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 500, minWidth: 70, color: 'text.secondary', textAlign: 'right' }}>
                    {t.month}
                  </Typography>
                  <Box sx={{ flex: 1, height: 20, bgcolor: '#f5f5f5', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                    <Box sx={{
                      height: '100%', width: `${Math.max(pct, 2)}%`, borderRadius: 2,
                      bgcolor: pct > 70 ? '#2e7d32' : pct > 40 ? '#1976d2' : '#42a5f5',
                      transition: 'width 0.4s ease',
                    }} />
                  </Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, minWidth: 28, textAlign: 'right', color: '#1976d2' }}>
                    {t.joiners || 0}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>

      {/* Department Breakdown */}
      {sectionHeader(<ApartmentIcon />, 'Department Breakdown')}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {deptData.length === 0 ? (
          <Typography sx={{ fontSize: 12, color: 'text.secondary', textAlign: 'center', py: 3 }}>
            No department data available.
          </Typography>
        ) : (
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeadCellSx}>Department</TableCell>
                  <TableCell sx={tableHeadCellSx} align='center'>Headcount</TableCell>
                  <TableCell sx={tableHeadCellSx} align='center'>Active</TableCell>
                  <TableCell sx={{ ...tableHeadCellSx, minWidth: 140 }}>Distribution</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deptData.map((d) => {
                  const pct = maxDeptHeadcount > 0 ? ((d.headcount || 0) / maxDeptHeadcount) * 100 : 0;
                  return (
                    <TableRow key={d.department_name} hover>
                      <TableCell sx={tableCellSx}>
                        <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{d.department_name}</Typography>
                      </TableCell>
                      <TableCell sx={tableCellSx} align='center'>
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{d.headcount || 0}</Typography>
                      </TableCell>
                      <TableCell sx={tableCellSx} align='center'>
                        <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#2e7d32' }}>{d.active_count || 0}</Typography>
                      </TableCell>
                      <TableCell sx={tableCellSx}>
                        <LinearProgress
                          variant='determinate' value={pct}
                          sx={{
                            height: 8, borderRadius: 4, bgcolor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': { bgcolor: '#1976d2', borderRadius: 4 },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Grade Distribution */}
      {sectionHeader(<WorkspacePremiumIcon />, 'Grade Distribution')}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {gradeData.length === 0 ? (
          <Typography sx={{ fontSize: 12, color: 'text.secondary', textAlign: 'center', py: 3 }}>
            No grade data available.
          </Typography>
        ) : (
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeadCellSx}>Grade (Code)</TableCell>
                  <TableCell sx={tableHeadCellSx}>Grade Name</TableCell>
                  <TableCell sx={tableHeadCellSx} align='center'>Headcount</TableCell>
                  <TableCell sx={{ ...tableHeadCellSx, minWidth: 140 }}>Distribution</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gradeData.map((g) => {
                  const pct = maxGradeHeadcount > 0 ? ((g.headcount || 0) / maxGradeHeadcount) * 100 : 0;
                  return (
                    <TableRow key={g.grade_code || g.grade_name} hover>
                      <TableCell sx={tableCellSx}>
                        <Chip size='small' label={g.grade_code || '-'}
                          sx={{ fontSize: 10, height: 22, fontWeight: 600, bgcolor: '#e8eaf6', color: '#3949ab' }} />
                      </TableCell>
                      <TableCell sx={tableCellSx}>
                        <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{g.grade_name}</Typography>
                        {g.level && (
                          <Typography sx={{ fontSize: 9, color: 'text.secondary' }}>Level {g.level}</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={tableCellSx} align='center'>
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{g.headcount || 0}</Typography>
                      </TableCell>
                      <TableCell sx={tableCellSx}>
                        <LinearProgress
                          variant='determinate' value={pct}
                          sx={{
                            height: 8, borderRadius: 4, bgcolor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': { bgcolor: '#7b1fa2', borderRadius: 4 },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* New Joiners List */}
      {sectionHeader(<PersonAddIcon />, 'New Joiners')}
      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {joiners.length === 0 ? (
          <Typography sx={{ fontSize: 12, color: 'text.secondary', textAlign: 'center', py: 3 }}>
            No new joiners in the selected period.
          </Typography>
        ) : (
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeadCellSx}>Name</TableCell>
                  <TableCell sx={tableHeadCellSx}>Emp Code</TableCell>
                  <TableCell sx={tableHeadCellSx}>Department</TableCell>
                  <TableCell sx={tableHeadCellSx}>Designation</TableCell>
                  <TableCell sx={tableHeadCellSx}>Grade</TableCell>
                  <TableCell sx={tableHeadCellSx}>DOJ</TableCell>
                  <TableCell sx={tableHeadCellSx}>Type</TableCell>
                  <TableCell sx={tableHeadCellSx}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {joiners.map((j) => (
                  <TableRow key={j.employee_id} hover>
                    <TableCell sx={tableCellSx}>
                      <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{j.employee_name || '-'}</Typography>
                    </TableCell>
                    <TableCell sx={tableCellSx}>
                      <Typography sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.secondary' }}>
                        {j.emp_code || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={tableCellSx}>
                      <Typography sx={{ fontSize: 11 }}>{j.department_name || '-'}</Typography>
                    </TableCell>
                    <TableCell sx={tableCellSx}>
                      <Typography sx={{ fontSize: 11 }}>{j.designation || '-'}</Typography>
                    </TableCell>
                    <TableCell sx={tableCellSx}>
                      <Typography sx={{ fontSize: 11 }}>{j.grade_name || '-'}</Typography>
                    </TableCell>
                    <TableCell sx={tableCellSx}>
                      <Typography sx={{ fontSize: 11, fontWeight: 500 }}>{formatDate(j.dateOfJoining)}</Typography>
                    </TableCell>
                    <TableCell sx={tableCellSx}>
                      <Chip size='small' label={j.employment_type || '-'}
                        sx={{ fontSize: 9, height: 20, textTransform: 'capitalize' }} />
                    </TableCell>
                    <TableCell sx={tableCellSx}>
                      {statusChip(j.employee_status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
