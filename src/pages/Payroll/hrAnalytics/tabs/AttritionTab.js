import React, { useState, useContext, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  TrendingDown,
  PersonOff,
  Gavel,
  EmojiPeople,
  RunCircle,
  EventBusy,
  PercentOutlined,
  FilterAlt,
} from '@mui/icons-material';
import { format } from 'date-fns';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  getAttritionSummaryAction,
  getAttritionByDeptAction,
  getAttritionByTenureAction,
} from 'redux/actions/hrAnalytics.actions';

/* ------------------------------------------------------------------ */
/*  KPI Card                                                          */
/* ------------------------------------------------------------------ */
const KpiCard = ({ icon, label, value, color, bgColor }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      height: '100%',
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: bgColor || 'primary.50',
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 24, color: color || 'primary.main' } })}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, color: color || 'text.primary' }}>
        {value ?? '-'}
      </Typography>
      <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 500, whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
    </Box>
  </Paper>
);

/* ------------------------------------------------------------------ */
/*  Separation Type Chip                                              */
/* ------------------------------------------------------------------ */
const SEPARATION_TYPES = [
  { key: 'resignations', label: 'Resignations', color: '#ed6c02', bg: '#fff3e0', icon: <PersonOff /> },
  { key: 'terminations', label: 'Terminations', color: '#d32f2f', bg: '#ffebee', icon: <Gavel /> },
  { key: 'retirements', label: 'Retirements', color: '#0288d1', bg: '#e1f5fe', icon: <EmojiPeople /> },
  { key: 'absconding', label: 'Absconding', color: '#9c27b0', bg: '#f3e5f5', icon: <RunCircle /> },
  { key: 'contract_ends', label: 'Contract Ends', color: '#616161', bg: '#f5f5f5', icon: <EventBusy /> },
];

/* ------------------------------------------------------------------ */
/*  Horizontal Bar (used in trend chart)                              */
/* ------------------------------------------------------------------ */
const HBar = ({ value, maxValue, color, label }) => {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Box sx={{ flex: 1, position: 'relative', height: 20, borderRadius: 1, bgcolor: 'grey.100' }}>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${Math.min(pct, 100)}%`,
            bgcolor: color,
            borderRadius: 1,
            transition: 'width 0.4s ease',
          }}
        />
      </Box>
      <Typography sx={{ fontSize: 12, fontWeight: 600, minWidth: 28, textAlign: 'right', color }}>
        {value ?? 0}
      </Typography>
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/*  Tenure risk color                                                 */
/* ------------------------------------------------------------------ */
const getTenureRiskColor = (band) => {
  const b = (band || '').toLowerCase();
  if (b.includes('0') || b.includes('<1') || b.includes('< 1') || b.includes('less than 1')) return '#d32f2f';
  if (b.includes('1') && (b.includes('-2') || b.includes('to 2'))) return '#ed6c02';
  if (b.includes('2') && (b.includes('-3') || b.includes('to 3'))) return '#f9a825';
  return '#2e7d32';
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */
export default function AttritionTab({
  attritionSummary = {},
  attritionTrend = [],
  attritionByDept = [],
  attritionByTenure = [],
  headcountSummary = {},
}) {
  const dispatch = useDispatch();
  const { setModalTypeHandler: s, setLoaderStatusHandler: l } = useContext(CreateNewButtonContext);

  /* ---- Date Range State ---- */
  const today = format(new Date(), 'yyyy-MM-dd');
  const firstDay = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(today);

  /* ---- Dispatch ---- */
  const handleApply = useCallback(() => {
    dispatch(getAttritionSummaryAction(fromDate, toDate, s, l));
    dispatch(getAttritionByDeptAction(fromDate, toDate, s, l));
    dispatch(getAttritionByTenureAction(fromDate, toDate, s, l));
  }, [dispatch, fromDate, toDate, s, l]);

  /* ---- Derived values ---- */
  const {
    total_separations = 0,
    resignations = 0,
    terminations = 0,
    retirements = 0,
    absconding = 0,
    contract_ends = 0,
  } = attritionSummary;

  const totalEmployees = headcountSummary?.total_employees || 0;
  const attritionRate = totalEmployees > 0
    ? ((total_separations / totalEmployees) * 100).toFixed(1)
    : '0.0';

  const summaryMap = { resignations, terminations, retirements, absconding, contract_ends };

  /* ---- Trend chart max value for scaling bars ---- */
  const trendMax = useMemo(() => {
    let mx = 0;
    attritionTrend.forEach((r) => {
      if ((r.voluntary || 0) > mx) mx = r.voluntary;
      if ((r.involuntary || 0) > mx) mx = r.involuntary;
    });
    return mx || 1;
  }, [attritionTrend]);

  /* ---- Dept max for bar scaling ---- */
  const deptMax = useMemo(
    () => Math.max(1, ...attritionByDept.map((d) => d.separations || 0)),
    [attritionByDept],
  );

  /* ---- Tenure totals ---- */
  const tenureTotal = useMemo(
    () => attritionByTenure.reduce((sum, r) => sum + (r.count || 0), 0) || 1,
    [attritionByTenure],
  );

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */
  return (
    <Box>
      {/* ---- 1. DATE RANGE FILTER ---- */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <FilterAlt sx={{ color: 'text.secondary' }} />
        <TextField
          label='From'
          type='date'
          size='small'
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 160 }}
        />
        <TextField
          label='To'
          type='date'
          size='small'
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 160 }}
        />
        <Button variant='contained' size='small' onClick={handleApply} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Apply
        </Button>
      </Paper>

      {/* ---- 2. KPI CARDS ---- */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            icon={<TrendingDown />}
            label='Total Separations'
            value={total_separations}
            color='#d32f2f'
            bgColor='#ffebee'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            icon={<PersonOff />}
            label='Resignations'
            value={resignations}
            color='#ed6c02'
            bgColor='#fff3e0'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            icon={<Gavel />}
            label='Terminations'
            value={terminations}
            color='#c62828'
            bgColor='#ffcdd2'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            icon={<EmojiPeople />}
            label='Retirements'
            value={retirements}
            color='#0288d1'
            bgColor='#e1f5fe'
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <KpiCard
            icon={<PercentOutlined />}
            label='Attrition Rate'
            value={`${attritionRate}%`}
            color={Number(attritionRate) > 15 ? '#d32f2f' : Number(attritionRate) > 8 ? '#ed6c02' : '#2e7d32'}
            bgColor={Number(attritionRate) > 15 ? '#ffebee' : Number(attritionRate) > 8 ? '#fff3e0' : '#e8f5e9'}
          />
        </Grid>
      </Grid>

      {/* ---- 3. SEPARATION TYPE BREAKDOWN ---- */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>
          Separation Type Breakdown
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {SEPARATION_TYPES.map((t) => (
            <Chip
              key={t.key}
              icon={React.cloneElement(t.icon, { sx: { fontSize: 18, color: `${t.color} !important` } })}
              label={`${t.label}: ${summaryMap[t.key] ?? 0}`}
              sx={{
                bgcolor: t.bg,
                color: t.color,
                fontWeight: 600,
                fontSize: 13,
                height: 36,
                px: 1,
                border: '1px solid',
                borderColor: t.color,
                '& .MuiChip-icon': { ml: 0.5 },
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* ---- 4. MONTHLY ATTRITION TREND ---- */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>
          Monthly Attrition Trend
        </Typography>
        {attritionTrend.length === 0 ? (
          <Typography variant='body2' color='text.secondary' sx={{ py: 3, textAlign: 'center' }}>
            No trend data available for the selected period
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Legend */}
            <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: '#2e7d32' }} />
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Voluntary</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: '#d32f2f' }} />
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Involuntary</Typography>
              </Box>
            </Box>
            {attritionTrend.map((row, idx) => (
              <Box key={row.month || idx}>
                <Typography sx={{ fontSize: 12, fontWeight: 500, mb: 0.5, color: 'text.secondary' }}>
                  {row.month}
                  <Typography component='span' sx={{ fontSize: 11, ml: 1, color: 'text.disabled' }}>
                    ({row.separations ?? ((row.voluntary || 0) + (row.involuntary || 0))} total)
                  </Typography>
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <HBar value={row.voluntary || 0} maxValue={trendMax} color='#2e7d32' label='Vol' />
                  <HBar value={row.involuntary || 0} maxValue={trendMax} color='#d32f2f' label='Invol' />
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* Bottom two-column layout */}
      <Grid container spacing={2.5}>
        {/* ---- 5. ATTRITION BY DEPARTMENT ---- */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>
              Attrition by Department
            </Typography>
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                    <TableCell align='right' sx={{ fontWeight: 600 }}>Separations</TableCell>
                    <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Distribution</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attritionByDept.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align='center'>
                        <Typography variant='body2' color='text.secondary' sx={{ py: 2 }}>
                          No department data available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    attritionByDept.map((row, idx) => {
                      const pct = deptMax > 0 ? ((row.separations || 0) / deptMax) * 100 : 0;
                      return (
                        <TableRow key={row.department_name || idx} hover>
                          <TableCell>
                            <Typography variant='body2' fontWeight={500}>
                              {row.department_name}
                            </Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <Typography variant='body2' fontWeight={600}>
                              {row.separations ?? 0}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title={`${row.separations ?? 0} separations`}>
                              <LinearProgress
                                variant='determinate'
                                value={Math.min(pct, 100)}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: 'grey.100',
                                  '& .MuiLinearProgress-bar': { bgcolor: '#d32f2f', borderRadius: 4 },
                                }}
                              />
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* ---- 6. ATTRITION BY TENURE BAND ---- */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 1.5 }}>
              Attrition by Tenure Band
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 2 }}>
              Early-tenure attrition (red) indicates onboarding or culture-fit issues
            </Typography>
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Tenure Band</TableCell>
                    <TableCell align='right' sx={{ fontWeight: 600 }}>Count</TableCell>
                    <TableCell align='right' sx={{ fontWeight: 600 }}>%</TableCell>
                    <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Distribution</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attritionByTenure.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align='center'>
                        <Typography variant='body2' color='text.secondary' sx={{ py: 2 }}>
                          No tenure data available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    attritionByTenure.map((row, idx) => {
                      const pct = ((row.count || 0) / tenureTotal) * 100;
                      const riskColor = getTenureRiskColor(row.tenure_band);
                      return (
                        <TableRow key={row.tenure_band || idx} hover>
                          <TableCell>
                            <Chip
                              label={row.tenure_band}
                              size='small'
                              sx={{
                                bgcolor: `${riskColor}18`,
                                color: riskColor,
                                fontWeight: 600,
                                fontSize: 12,
                                border: '1px solid',
                                borderColor: `${riskColor}40`,
                              }}
                            />
                          </TableCell>
                          <TableCell align='right'>
                            <Typography variant='body2' fontWeight={600}>
                              {row.count ?? 0}
                            </Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <Typography variant='body2' fontWeight={500}>
                              {pct.toFixed(1)}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title={`${row.tenure_band}: ${row.count ?? 0} (${pct.toFixed(1)}%)`}>
                              <LinearProgress
                                variant='determinate'
                                value={Math.min(pct, 100)}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: 'grey.100',
                                  '& .MuiLinearProgress-bar': { bgcolor: riskColor, borderRadius: 4 },
                                }}
                              />
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
