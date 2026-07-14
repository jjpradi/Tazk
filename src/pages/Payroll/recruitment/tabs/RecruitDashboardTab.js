import React, { useMemo } from 'react';
import {
  Box, Typography, Paper, Grid, IconButton, Tooltip, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const PIPELINE_COLORS = {
  applied: '#90a4ae',
  screening: '#42a5f5',
  shortlisted: '#7e57c2',
  interview: '#ff9800',
  offered: '#26a69a',
  accepted: '#66bb6a',
  rejected: '#ef5350',
  withdrawn: '#bdbdbd',
};

const SOURCE_COLORS = {
  'job portal': '#1976d2',
  'company website': '#7e57c2',
  referral: '#2e7d32',
  'social media': '#0288d1',
  'campus recruitment': '#ed6c02',
  'walk-in': '#d81b60',
  consultant: '#00838f',
  newspaper: '#5d4037',
  other: '#757575',
  linkedin: '#0077b5',
  naukri: '#ff5722',
  indeed: '#003a9b',
  internal: '#43a047',
  agency: '#8e24aa',
};

const getSourceColor = (source) => {
  if (!source) return '#757575';
  const key = source.toLowerCase().trim();
  return SOURCE_COLORS[key] || '#757575';
};

const kpiCardStyle = (color) => ({
  p: 2.5,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  transition: 'box-shadow 0.2s ease-in-out',
  '&:hover': { boxShadow: 3 },
});

const iconBoxStyle = (color) => ({
  width: 52,
  height: 52,
  borderRadius: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: `${color}18`,
  color,
  flexShrink: 0,
});

export default function RecruitDashboardTab({ dashboard, pipeline, sources, refreshDashboard }) {
  const d = dashboard || {};

  const kpiCards = [
    { label: 'Open Positions', value: d.open_positions ?? 0, icon: <WorkOutlineIcon />, color: '#2e7d32' },
    { label: 'Total Candidates', value: d.total_candidates ?? 0, icon: <PeopleOutlineIcon />, color: '#1976d2' },
    { label: 'Total Applications', value: d.total_applications ?? 0, icon: <AssignmentOutlinedIcon />, color: '#7e57c2' },
    { label: 'Upcoming Interviews', value: d.upcoming_interviews ?? 0, icon: <EventAvailableIcon />, color: '#ff9800' },
  ];

  const secondaryCards = [
    { label: 'Total Openings', value: d.total_openings ?? 0, icon: <BusinessCenterIcon />, color: '#0288d1' },
    { label: 'Pending Offers', value: d.pending_offers ?? 0, icon: <LocalOfferIcon />, color: '#ed6c02' },
    { label: 'Accepted Offers', value: d.accepted_offers ?? 0, icon: <CheckCircleOutlineIcon />, color: '#43a047' },
  ];

  const pipelineData = pipeline || [];
  const pipelineTotal = useMemo(
    () => pipelineData.reduce((sum, item) => sum + (Number(item.count) || 0), 0),
    [pipelineData],
  );

  const sourceData = sources || [];

  return (
    <Box>
      {/* Header with Refresh */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Recruitment Dashboard</Typography>
        {refreshDashboard && (
          <Tooltip title="Refresh Dashboard">
            <IconButton onClick={refreshDashboard} size="small" color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* KPI Cards Row - 4 columns */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {kpiCards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper elevation={2} sx={kpiCardStyle(card.color)}>
              <Box sx={iconBoxStyle(card.color)}>
                {React.cloneElement(card.icon, { sx: { fontSize: 28 } })}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, color: card.color }}>
                  {card.value}
                </Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'text.secondary', mt: 0.3 }}>
                  {card.label}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Secondary Row - 3 columns */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {secondaryCards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 4 }}>
            <Paper elevation={1} sx={kpiCardStyle(card.color)}>
              <Box sx={iconBoxStyle(card.color)}>
                {React.cloneElement(card.icon, { sx: { fontSize: 26 } })}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1.1, color: card.color }}>
                  {card.value}
                </Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary', mt: 0.3 }}>
                  {card.label}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Hiring Pipeline Section */}
      <Paper
        elevation={0}
        sx={{ p: 2.5, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Hiring Pipeline</Typography>

        {pipelineData.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
              No pipeline data available.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Stacked Bar */}
            {pipelineTotal > 0 && (
              <Box sx={{ mb: 2.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    height: 32,
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: '#f5f5f5',
                  }}
                >
                  {pipelineData.map((item) => {
                    const count = Number(item.count) || 0;
                    if (count === 0) return null;
                    const pct = (count / pipelineTotal) * 100;
                    const color = PIPELINE_COLORS[item.status?.toLowerCase()] || '#bdbdbd';
                    return (
                      <Tooltip
                        key={item.status}
                        title={`${item.status}: ${count} (${pct.toFixed(1)}%)`}
                        arrow
                      >
                        <Box
                          sx={{
                            width: `${pct}%`,
                            bgcolor: color,
                            minWidth: pct > 0 ? 4 : 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'width 0.4s ease',
                          }}
                        >
                          {pct >= 8 && (
                            <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#fff' }}>
                              {count}
                            </Typography>
                          )}
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Status Cards */}
            <Grid container spacing={1.5}>
              {pipelineData.map((item) => {
                const color = PIPELINE_COLORS[item.status?.toLowerCase()] || '#bdbdbd';
                const count = Number(item.count) || 0;
                return (
                  <Grid key={item.status} size={{ xs: 6, sm: 4, md: 1.5 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        textAlign: 'center',
                        borderTop: `3px solid ${color}`,
                        bgcolor: `${color}0D`,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderTopColor: color,
                      }}
                    >
                      <Typography sx={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1.2 }}>
                        {count}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: 'text.secondary',
                          textTransform: 'capitalize',
                          mt: 0.3,
                        }}
                      >
                        {item.status}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </Paper>

      {/* Source Effectiveness Section */}
      <Paper
        elevation={0}
        sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Source Effectiveness</Typography>

        {sourceData.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
              No source data available.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Source</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align="center">
                    Candidates
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align="center">
                    Applications
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align="center">
                    Hired
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }} align="center">
                    Conversion Rate
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sourceData.map((row) => {
                  const candidates = Number(row.candidate_count) || 0;
                  const applications = Number(row.application_count) || 0;
                  const hired = Number(row.hired_count) || 0;
                  const conversionRate =
                    candidates > 0 ? ((hired / candidates) * 100).toFixed(1) : '0.0';
                  const chipColor = getSourceColor(row.source);

                  return (
                    <TableRow key={row.source} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell>
                        <Chip
                          label={row.source || 'Unknown'}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: 11,
                            bgcolor: `${chipColor}1A`,
                            color: chipColor,
                            borderColor: chipColor,
                            border: '1px solid',
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{candidates}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{applications}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: hired > 0 ? '#2e7d32' : 'text.secondary' }}>
                          {hired}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${conversionRate}%`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: 11,
                            height: 24,
                            bgcolor:
                              Number(conversionRate) >= 20
                                ? '#e8f5e9'
                                : Number(conversionRate) >= 10
                                  ? '#fff3e0'
                                  : '#f5f5f5',
                            color:
                              Number(conversionRate) >= 20
                                ? '#2e7d32'
                                : Number(conversionRate) >= 10
                                  ? '#e65100'
                                  : 'text.secondary',
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
    </Box>
  );
}
