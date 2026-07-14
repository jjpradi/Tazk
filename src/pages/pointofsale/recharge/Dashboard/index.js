import React, {useContext, useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import CreateNewButtonContext from '../../../../context/CreateNewButtonContext';
import LocationGuard, {hasLocation} from '../LocationGuard';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Button, Stack, Divider, Alert, Tooltip,
} from '@mui/material';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LocalAtmOutlinedIcon from '@mui/icons-material/LocalAtmOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ReactApexChart from 'react-apexcharts';
import {fetchDashboard} from '../../../../redux/actions/recharge_actions';
import {formatINR, operatorColor} from '../rechargeUtils';

const statusColor = {
  SUCCESS: 'success',
  PENDING: 'warning',
  FAILED: 'error',
};

const KpiCard = ({icon, label, value, sub, tint}) => (
  <Card elevation={0} sx={{border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%'}}>
    <CardContent>
      <Stack direction='row' spacing={2} alignItems='center'>
        <Box
          sx={{
            width: 44, height: 44, borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: tint, color: '#fff', flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{minWidth: 0}}>
          <Typography variant='caption' color='text.secondary'>{label}</Typography>
          <Typography variant='h6' sx={{fontWeight: 700, mt: 0.5, lineHeight: 1.2}} noWrap>{value}</Typography>
          {sub && <Typography variant='caption' color='text.secondary'>{sub}</Typography>}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const RechargeDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {headerLocationId} = useContext(CreateNewButtonContext);
  const {dashboard, loading} = useSelector((s) => s.rechargeReducer);

  useEffect(() => {
    if (hasLocation(headerLocationId)) {
      dispatch(fetchDashboard(headerLocationId));
    }
  }, [dispatch, headerLocationId]);

  const kpis = dashboard?.kpis || {};
  const operators = dashboard?.operators || [];
  const recent = dashboard?.recent_transactions || [];
  const trend = dashboard?.daily_trend || [];
  const operatorSplit = dashboard?.operator_split || [];
  const paymentSplit = dashboard?.payment_split || [];
  const statusSplit = dashboard?.status_split || {SUCCESS: 0, PENDING: 0, FAILED: 0};
  const lowBalance = kpis.low_balance_operators || [];

  // Trend chart (line + area for sales, line for margin)
  const trendOptions = useMemo(() => ({
    chart: {type: 'area', toolbar: {show: false}, zoom: {enabled: false}, fontFamily: 'inherit'},
    stroke: {curve: 'smooth', width: [3, 2]},
    colors: ['#1565C0', '#6A1B9A'],
    fill: {
      type: ['gradient', 'solid'],
      gradient: {shadeIntensity: 0.4, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 90, 100]},
    },
    dataLabels: {enabled: false},
    legend: {position: 'top', horizontalAlign: 'right'},
    grid: {borderColor: '#eee', strokeDashArray: 3},
    xaxis: {
      categories: trend.map(t => new Date(t.date).toLocaleDateString('en-IN', {day: '2-digit', month: 'short'})),
      labels: {style: {fontSize: '11px'}},
    },
    yaxis: [
      {title: {text: 'Sales (₹)'}, labels: {formatter: (v) => Math.round(v).toString()}},
    ],
    tooltip: {
      y: {formatter: (v) => formatINR(v)},
    },
  }), [trend]);

  const trendSeries = useMemo(() => ([
    {name: 'Sales', data: trend.map(t => t.sales)},
    {name: 'Margin', data: trend.map(t => t.margin)},
  ]), [trend]);

  // Donut: operator split (MTD sales)
  const operatorDonutOptions = useMemo(() => ({
    chart: {type: 'donut', fontFamily: 'inherit'},
    labels: operatorSplit.map(o => o.operator),
    colors: operatorSplit.map(o => operatorColor(o.operator)),
    legend: {position: 'bottom'},
    plotOptions: {
      pie: {donut: {labels: {show: true,
        total: {show: true, label: 'MTD Sales', formatter: (w) =>
          formatINR(w.globals.seriesTotals.reduce((a, b) => a + b, 0))}}}},
    },
    dataLabels: {enabled: false},
    tooltip: {y: {formatter: (v) => formatINR(v)}},
  }), [operatorSplit]);
  const operatorDonutSeries = operatorSplit.map(o => o.sales);

  // Donut: payment split (MTD)
  const paymentDonutOptions = useMemo(() => ({
    chart: {type: 'donut', fontFamily: 'inherit'},
    labels: paymentSplit.map(p => p.method),
    colors: ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#0288d1', '#d32f2f'],
    legend: {position: 'bottom'},
    plotOptions: {
      pie: {donut: {labels: {show: true,
        total: {show: true, label: 'MTD Received', formatter: (w) =>
          formatINR(w.globals.seriesTotals.reduce((a, b) => a + b, 0))}}}},
    },
    dataLabels: {enabled: false},
    tooltip: {y: {formatter: (v) => formatINR(v)}},
  }), [paymentSplit]);
  const paymentDonutSeries = paymentSplit.map(p => p.sales);

  // Status bar (MTD)
  const statusTotal = (statusSplit.SUCCESS || 0) + (statusSplit.PENDING || 0) + (statusSplit.FAILED || 0);

  const hasAnyData = statusTotal > 0 || trend.some(t => t.count > 0);

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        height: 'calc(100vh - 50px)',
        width: '100%',
        overflowY: 'auto',
      }}
    >
      <Box mb={3}>
        <Typography variant='h4' sx={{fontWeight: 600}}>Recharge Dashboard</Typography>
        <Typography variant='body2' color='text.secondary'>
          Mobile recharge operations overview
        </Typography>
      </Box>

      <LocationGuard headerLocationId={headerLocationId}>

      {loading && <LinearProgress sx={{mb: 2}} />}

      {lowBalance.length > 0 && (
        <Alert
          severity='warning'
          icon={<WarningAmberOutlinedIcon />}
          sx={{mb: 2}}
          action={
            <Button color='inherit' size='small' onClick={() => navigate('/pointofsale/recharge/wallet')}>
              Load Wallet
            </Button>
          }
        >
          Low balance on: <b>{lowBalance.join(', ')}</b>
        </Alert>
      )}

      {/* KPI row 1 — today + wallet */}
      <Grid container spacing={2} mb={2}>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <KpiCard
            icon={<AccountBalanceWalletOutlinedIcon />}
            label='Wallet float'
            value={formatINR(kpis.wallet_float || 0)}
            sub={`${kpis.active_operators || 0} active operators`}
            tint='#1565C0'
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <KpiCard
            icon={<PhoneAndroidOutlinedIcon />}
            label="Today's sales"
            value={formatINR(kpis.today_sales || 0)}
            sub={`${kpis.today_count || 0} recharges · avg ${formatINR(kpis.avg_ticket_today || 0)}`}
            tint='#2E7D32'
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <KpiCard
            icon={<TrendingUpOutlinedIcon />}
            label="Today's margin"
            value={formatINR(kpis.today_margin || 0)}
            sub={kpis.today_sales > 0
              ? `${((Number(kpis.today_margin || 0) / Number(kpis.today_sales)) * 100).toFixed(2)}% effective`
              : '—'}
            tint='#6A1B9A'
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <KpiCard
            icon={<CheckCircleOutlineIcon />}
            label='Success rate'
            value={`${kpis.success_rate || 0}%`}
            sub={`${statusSplit.SUCCESS || 0} ok · ${statusSplit.PENDING || 0} pending · ${statusSplit.FAILED || 0} failed (MTD)`}
            tint='#EF6C00'
          />
        </Grid>
      </Grid>

      {/* KPI row 2 — month-to-date */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <KpiCard
            icon={<CalendarMonthOutlinedIcon />}
            label='MTD sales'
            value={formatINR(kpis.mtd_sales || 0)}
            sub={`${kpis.mtd_count || 0} recharges`}
            tint='#0277BD'
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <KpiCard
            icon={<LocalAtmOutlinedIcon />}
            label='MTD margin'
            value={formatINR(kpis.mtd_margin || 0)}
            sub={kpis.mtd_sales > 0
              ? `${((Number(kpis.mtd_margin || 0) / Number(kpis.mtd_sales)) * 100).toFixed(2)}% of sales`
              : '—'}
            tint='#AD1457'
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <KpiCard
            icon={<ReceiptLongOutlinedIcon />}
            label='Avg ticket (today)'
            value={formatINR(kpis.avg_ticket_today || 0)}
            sub={kpis.today_count > 0 ? `${kpis.today_count} recharges` : 'no recharges yet'}
            tint='#00695C'
          />
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <KpiCard
            icon={<WarningAmberOutlinedIcon />}
            label='Low wallets'
            value={lowBalance.length ? lowBalance.length : 'All healthy'}
            sub={lowBalance.length ? lowBalance.join(', ') : '—'}
            tint={lowBalance.length ? '#C62828' : '#455A64'}
          />
        </Grid>
      </Grid>

      {/* Charts row */}
      <Grid container spacing={2} mb={2}>
        <Grid size={{xs: 12, lg: 8}}>
          <Paper elevation={0} sx={{p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2}}>
            <Stack direction='row' justifyContent='space-between' alignItems='center' mb={1}>
              <Typography variant='subtitle1' sx={{fontWeight: 600}}>Sales & Margin — last 14 days</Typography>
              <Chip size='small' label={`${trend.reduce((a, t) => a + t.count, 0)} recharges`} />
            </Stack>
            {trend.length > 0 && (
              <ReactApexChart options={trendOptions} series={trendSeries} type='area' height={280} />
            )}
          </Paper>
        </Grid>
        <Grid size={{xs: 12, lg: 4}}>
          <Paper elevation={0} sx={{p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%'}}>
            <Typography variant='subtitle1' sx={{fontWeight: 600, mb: 1}}>Operator split (MTD)</Typography>
            {operatorDonutSeries.some(v => v > 0) ? (
              <ReactApexChart options={operatorDonutOptions} series={operatorDonutSeries} type='donut' height={280} />
            ) : (
              <Typography variant='body2' color='text.secondary' sx={{textAlign: 'center', py: 8}}>
                No recharges this month yet.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Charts row 2 */}
      <Grid container spacing={2} mb={2}>
        <Grid size={{xs: 12, md: 6}}>
          <Paper elevation={0} sx={{p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2}}>
            <Typography variant='subtitle1' sx={{fontWeight: 600, mb: 1}}>Payment method split (MTD)</Typography>
            {paymentDonutSeries.some(v => v > 0) ? (
              <ReactApexChart options={paymentDonutOptions} series={paymentDonutSeries} type='donut' height={260} />
            ) : (
              <Typography variant='body2' color='text.secondary' sx={{textAlign: 'center', py: 8}}>
                No recharges this month yet.
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid size={{xs: 12, md: 6}}>
          <Paper elevation={0} sx={{p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2}}>
            <Typography variant='subtitle1' sx={{fontWeight: 600, mb: 2}}>Operator performance (MTD)</Typography>
            {operatorSplit.length > 0 ? (
              <Stack spacing={1.5}>
                {operatorSplit.map(op => {
                  const pct = statusTotal > 0 && kpis.mtd_sales > 0
                    ? Math.round((op.sales / Number(kpis.mtd_sales)) * 100) : 0;
                  return (
                    <Box key={op.operator}>
                      <Stack direction='row' justifyContent='space-between' mb={0.5}>
                        <Typography variant='body2' sx={{fontWeight: 600}}>
                          {op.operator} · <Box component='span' sx={{color: 'text.secondary', fontWeight: 400}}>{op.count} recharges</Box>
                        </Typography>
                        <Typography variant='body2' sx={{fontWeight: 600}}>
                          {formatINR(op.sales)} <Box component='span' sx={{color: 'success.main'}}>(+{formatINR(op.margin)})</Box>
                        </Typography>
                      </Stack>
                      <Tooltip title={`${pct}% of MTD sales`}>
                        <LinearProgress
                          variant='determinate'
                          value={Math.min(pct, 100)}
                          sx={{
                            height: 8, borderRadius: 4,
                            bgcolor: 'action.hover',
                            '& .MuiLinearProgress-bar': {bgcolor: operatorColor(op.operator)},
                          }}
                        />
                      </Tooltip>
                    </Box>
                  );
                })}
              </Stack>
            ) : (
              <Typography variant='body2' color='text.secondary' sx={{textAlign: 'center', py: 8}}>
                No operators yet.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Operator wallets + recent transactions */}
      <Grid container spacing={2}>
        <Grid size={{xs: 12, md: 4}}>
          <Paper elevation={0} sx={{p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2}}>
            <Typography variant='subtitle1' sx={{fontWeight: 600, mb: 2}}>Operator Wallets</Typography>
            <Stack spacing={1.5}>
              {operators.map((op) => (
                <Box key={op.id} sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                  <Box
                    sx={{
                      width: 36, height: 36, borderRadius: 1.5,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: operatorColor(op.code), color: '#fff',
                      fontSize: 12, fontWeight: 600,
                    }}
                  >
                    {op.code.slice(0, 2).toUpperCase()}
                  </Box>
                  <Box sx={{flexGrow: 1}}>
                    <Typography variant='body2' sx={{fontWeight: 600}}>{op.code}</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Margin {op.margin_percent}%
                    </Typography>
                  </Box>
                  <Stack alignItems='flex-end'>
                    <Typography variant='body2' sx={{fontWeight: 600}}>
                      {formatINR(op.wallet_balance)}
                    </Typography>
                    {op.low_balance && (
                      <Chip size='small' color='warning' variant='outlined' label='Low' />
                    )}
                  </Stack>
                </Box>
              ))}
              {!operators.length && (
                <Typography variant='body2' color='text.secondary'>No operators configured</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{xs: 12, md: 8}}>
          <Paper elevation={0} sx={{p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2}}>
            <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
              <Typography variant='subtitle1' sx={{fontWeight: 600}}>Recent Transactions</Typography>
              <Chip size='small' label={`${recent.length} shown`} />
            </Stack>
            <Divider />
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Txn #</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Mobile</TableCell>
                    <TableCell>Operator</TableCell>
                    <TableCell align='right'>Sell</TableCell>
                    <TableCell align='right'>Margin</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recent.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.txn_code}</TableCell>
                      <TableCell>{new Date(t.txn_time).toLocaleString('en-IN', {hour12: false})}</TableCell>
                      <TableCell>{t.mobile}</TableCell>
                      <TableCell>{t.operator_code}</TableCell>
                      <TableCell align='right'>{formatINR(t.sell_amount)}</TableCell>
                      <TableCell align='right'>{formatINR(t.margin)}</TableCell>
                      <TableCell>
                        <Chip size='small' color={statusColor[t.status] || 'default'} label={t.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {!recent.length && (
                    <TableRow>
                      <TableCell colSpan={7} align='center' sx={{py: 4, color: 'text.secondary'}}>
                        No transactions yet — click "New Recharge" to start.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      </LocationGuard>
    </Box>
  );
};

export default RechargeDashboard;
