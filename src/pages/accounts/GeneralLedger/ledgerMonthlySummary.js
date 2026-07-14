import React, {useState, useEffect, useContext} from 'react';
import './styles.css';
import {useSelector, useDispatch} from 'react-redux';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import _ from 'lodash';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Grid,
  TableHead,
  TableRow,
  DialogContent,
  DialogActions,
  Dialog,
  DialogTitle,
  TextField,
  Box,
  IconButton,
  Typography,
  Card,
  Divider,
  Paper,
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material';
import LedgerVoucher from './ledgerVoucher';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';
import context from '../../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { font14_500, headerStyle } from 'utils/pageSize';
import { getsessionStorage } from 'pages/common/login/cookies';
import ShareIcon from '@mui/icons-material/Share';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { CSVLink } from "react-csv";
import { getCurrentFinancialYear } from 'utils/getTimeFormat';
import { getFYPresets } from 'pages/accounts/reports/reportUtils';
import SendMailDialog from './sendMailDialog'
import { listGeneralLedgerMonthlySummaryAction, monthlySummarySendMail } from 'redux/actions/generalLedger';
import toMomentOrNull from 'utils/DateFixer';
import Autocomplete from '@mui/material/Autocomplete';

const financialYear = getCurrentFinancialYear();

const StatCard = ({ label, value, color }) => {
  return (
    <Card
      variant='outlined'
      sx={{
        padding: '12px 10px', width: '100%', borderRadius: '6px', textAlign: 'center',
        bgcolor: `${color}14`, borderColor: `${color}40`, borderWidth: 1,
      }}
    >
      <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary', mb: 0.5 }}>{label}</Typography>
      <Typography sx={{ fontSize: 16, fontWeight: 700, color }}>{value}</Typography>
    </Card>
  );
};

export default function App(props) {
  const theme = useTheme();
  const [ledgerData, setLedgerData] = useState([]);
  const [ledgerName, setLedgerName] = useState('');
  const [monthName, setMonthName] = useState('');
  const [ledgerBarData, setLedgerBarData] = useState([]);
  const [openDateDialog, setOpenDateDialog] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const { setModalTypeHandler, setLoaderStatusHandler, headerLocationId } = useContext(context);
  const [emailOpen, setEmailOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState({ firstDate: '', lastDate: '' });
  const [filterOpen, setFilterOpen] = useState(false)
  const fyPresets = getFYPresets()
  const [filterData, setFilterData] = useState({
    range: fyPresets[0]?.label || '',
    fromDate: fyPresets[0]?.fromDate || '',
    toDate: fyPresets[0]?.toDate || '',
  })
  const activeFromDate = filterData.fromDate || fyPresets[0]?.fromDate || financialYear?.fromDate;
  const activeToDate = filterData.toDate || fyPresets[0]?.toDate || financialYear?.toDate;
  const formattedFromDate = activeFromDate ? moment(activeFromDate).format('DD-MMMM-YYYY') : '';
  const formattedToDate = activeToDate ? moment(activeToDate).format('DD-MMMM-YYYY') : '';
  const dateRangeLabel = formattedFromDate && formattedToDate ? `${formattedFromDate} to ${formattedToDate}` : '';

  let storage = getsessionStorage()
  const companyName = storage?.company_name || '';

  const dispatch = useDispatch();
  useEffect(() => {
    getStructure();
    if (props.generalLedger_monthly_summary?.ledgerName) {
      let ledger_name = props.generalLedger_monthly_summary?.ledgerName;
      setLedgerName(ledger_name[0]?.name);
    }
  }, [props.generalLedger_monthly_summary, props.generalLedger_monthly_summary?.ledgerName]);

  const fileName = `${ledgerName}_ledger_monthly_summary`

  const downloadCsvData = () => {
    const title = [['Particular', ledgerName, '', '']]
    const date = [['From : ', formattedFromDate], ['To : ', formattedToDate]]
    const emptyRow = (n) => Array(n || 1).fill([])
    const headers = [['Months', 'Debit', 'Credit', 'Closing Balance']]
    const data = ledgerData.map((f) => ([
      f.month,
      f.debit === 0 ? '' : f.debit,
      f.credit === 0 ? '' : f.credit,
      f.closingBalance ? `${f.closingBalance} Dr` : ''
    ]))
    const grandTotal = [[
      'Grand Total',
      ledgerData.reduce((a, b) => a + b.debit, 0),
      ledgerData.reduce((a, b) => a + b.credit, 0),
      ledgerData.reduce((a, b) => a + b.closingBalance, 0)
    ]]
    const debitCreditDifferenceTitle = [['Credit Debit Difference']]
    const debitCreditDifferenceHeader = [['Month', 'Amount']];
    const debitCreditDifference = ledgerBarData.map(f => ([f.xaxis, f.amount]))
    return [...title, ...date, ...emptyRow(2), ...headers, ...data, ...grandTotal, ...emptyRow(2), ...debitCreditDifferenceTitle, ...emptyRow(), ...debitCreditDifferenceHeader, ...debitCreditDifference]
  }

  const handleSendEmail = (email) => {
    const data = {
      email, attachmentData: downloadCsvData(), fileName,
      subject: `${ledgerName} ledger monthly summary ${dateRangeLabel}`,
      location_id: headerLocationId
    }
    apiCalls(setModalTypeHandler, setLoaderStatusHandler, dispatch(monthlySummarySendMail(data)))
      .then(() => setEmailOpen(false));
  }

  const backBtn = () => { props.handleVoucherOpen(false, []); };

  const handleClick = async (event) => {
    await props.handleVoucherOpen(true, event);
    await setMonthName(event.month);
    setSelectedDate({ firstDate: event.monthStart, lastDate: event.monthEnd })
  };

  const getStructure = () => {
    let rawData = { ...props.generalLedger_monthly_summary?.data };
    let data = [];
    let index = 1;
    for (let d in rawData) {
      data.push({
        id: index, month: d,
        debit: rawData[d]?.[0].debit, credit: rawData[d]?.[0].credit,
        closingBalance: rawData[d]?.[0].closingBalance,
        monthStart: rawData[d][0]?.firstDay || '', monthEnd: rawData[d][0]?.lastDay || '',
      });
      if (Object.keys(rawData).length === index) return setLedgerData(data);
      else index += 1;
    }
  };

  useEffect(() => {
    if (ledgerData.length > 0) {
      let tempArr = [];
      ledgerData.map((item) => {
        tempArr.push({ amount: item.closingBalance, xaxis: item.month });
      });
      setLedgerBarData(tempArr);
    }
  }, [ledgerData]);

  const handleSubmitCustomDate = () => {
    const data = { fromDate: moment(fromDate).format('YYYY-MM-DD'), toDate: moment(toDate).format('YYYY-MM-DD') };
    let months = monthsBetween(data.fromDate, data.toDate);
    let tempArr = [];
    months.map((item) => {
      let obj = ledgerData.filter((i) => i.month === item)[0];
      tempArr.push({ amount: obj.debit - obj.credit, xaxis: obj.month });
    });
    setLedgerBarData(tempArr);
    setOpenDateDialog(false);
  };

  const monthsBetween = (from, to) => {
    let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let arr = [];
    let datFrom = new Date(from);
    let datTo = new Date(to);
    let fromYear = datFrom.getFullYear();
    let toYear = datTo.getFullYear();
    let diffYear = 12 * (toYear - fromYear) + datTo.getMonth();
    for (let i = datFrom.getMonth(); i <= diffYear; i++) arr.push(monthNames[i % 12]);
    return arr;
  };

  const handleApplyFilter = () => {
    dispatch(listGeneralLedgerMonthlySummaryAction(props.ledger_id, filterData.fromDate, filterData.toDate, setModalTypeHandler, setLoaderStatusHandler))
    setFilterOpen(false)
  }

  const handleCancelFilter = () => {
    setFilterData((prev) => ({ ...prev, range: fyPresets[0]?.label || '', fromDate: fyPresets[0]?.fromDate || '', toDate: fyPresets[0]?.toDate || '' }))
    dispatch(listGeneralLedgerMonthlySummaryAction(props.ledger_id, fyPresets[0]?.fromDate, fyPresets[0]?.toDate, setModalTypeHandler, setLoaderStatusHandler))
    setFilterOpen(false)
  }

  const totalDebit = ledgerData.reduce((a, b) => a + b.debit, 0)
  const totalCredit = ledgerData.reduce((a, b) => a + b.credit, 0)
  const totalClosing = ledgerData.reduce((a, b) => a + b.closingBalance, 0)
  const openingBalance = ledgerData.length > 0 ? ledgerData[0].closingBalance - ledgerData[0].debit + ledgerData[0].credit : 0

  return (
    <div>
      {props.voucherOpen === true && (
        <LedgerVoucher
          backBtn={backBtn} props={props} month={monthName} companyName={companyName}
          date={selectedDate} ledger_id={props.ledger_id} exportRights={props.exportRights}
          onLedgerClick={props.onLedgerClick}
        />
      )}
      {props.voucherOpen === false && (
        <Card sx={{ height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
          {/* ---- Top Action Bar ---- */}
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 2.5, py: 1,
            borderBottom: `2px solid ${theme.palette.primary.main}`,
            bgcolor: `${theme.palette.primary.main}08`,
            flexShrink: 0,
          }}>
            <Box>
              <Typography component="span" sx={{ fontWeight: 600, fontSize: 14, color: theme.palette.primary.main }}>
                {ledgerName}
              </Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', ml: 1 }} component="span">
                {dateRangeLabel}
              </Typography>
            </Box>

            <Stack direction="row" alignItems="center" spacing={0.5}>
              {props.exportRights && (
                <CSVLink data={downloadCsvData()} filename={`${fileName}.csv`} style={{ display: 'flex' }}>
                  <Tooltip title="Download CSV">
                    <IconButton size="small"><SaveAltIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </CSVLink>
              )}
              <Tooltip title="Share">
                <IconButton size="small" onClick={() => setEmailOpen(true)}>
                  <ShareIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Filter">
                <IconButton size="small" onClick={() => setFilterOpen(true)}>
                  <FilterAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

              <Tooltip title="Close">
                <IconButton size="small" onClick={() => props.handleBackBtn()}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* ---- Scrollable Content ---- */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>

            {/* ---- Summary Stat Cards ---- */}
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard label="Opening Balance" value={openingBalance.toFixed(2)} color={theme.palette.info.main} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard label="Total Debit" value={totalDebit.toFixed(2)} color={theme.palette.warning.main} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard label="Total Credit" value={totalCredit.toFixed(2)} color={theme.palette.success.main} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard label="Closing Balance" value={totalClosing.toFixed(2)} color={theme.palette.error.main} />
              </Grid>
            </Grid>

            {/* ---- Transactions Table ---- */}
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2.5, borderRadius: '6px' }}>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F4F7FE' }}>
                    <TableCell sx={{ fontSize: headerStyle.fontSize, fontWeight: headerStyle.fontWeight }}>Month</TableCell>
                    <TableCell sx={{ fontSize: headerStyle.fontSize, fontWeight: headerStyle.fontWeight, textAlign: 'right' }}>Debit</TableCell>
                    <TableCell sx={{ fontSize: headerStyle.fontSize, fontWeight: headerStyle.fontWeight, textAlign: 'right' }}>Credit</TableCell>
                    <TableCell sx={{ fontSize: headerStyle.fontSize, fontWeight: headerStyle.fontWeight, textAlign: 'right' }}>Closing Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ledgerData.map((f) => {
                    const hasData = f.debit !== 0 || f.credit !== 0 || f.closingBalance !== 0
                    return (
                      <TableRow
                        key={f.id}
                        hover
                        style={{ cursor: 'pointer' }}
                        onClick={(event) => handleClick(f)}
                        sx={{
                          opacity: hasData ? 1 : 0.5,
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell sx={{ fontSize: 12 }}>{f.month}{f.monthStart ? ` ${moment(f.monthStart).format('YYYY')}` : ''}</TableCell>
                        <TableCell sx={{ fontSize: 12, textAlign: 'right', color: f.debit > 0 ? theme.palette.warning.dark : 'text.secondary' }}>
                          {f.debit === 0 ? '-' : f.debit.toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, textAlign: 'right', color: f.credit > 0 ? theme.palette.success.dark : 'text.secondary' }}>
                          {f.credit === 0 ? '-' : f.credit.toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, textAlign: 'right', fontWeight: hasData ? 500 : 400 }}>
                          {f.closingBalance ? `${f.closingBalance.toFixed(2)} Dr` : '-'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
                <TableBody sx={{ borderTop: `2px solid ${theme.palette.primary.main}` }}>
                  <TableRow sx={{ bgcolor: `${theme.palette.primary.main}08` }}>
                    <TableCell sx={{ fontSize: 12, fontWeight: 700 }}>Grand Total</TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 700, textAlign: 'right' }}>{totalDebit.toFixed(2)}</TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 700, textAlign: 'right' }}>{totalCredit.toFixed(2)}</TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 700, textAlign: 'right' }}>{totalClosing.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* ---- Chart ---- */}
            <Card variant="outlined" sx={{ p: 2, borderRadius: '6px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: theme.palette.primary.main }}>
                  Credit Debit Difference
                </Typography>
                <Tooltip title="Filter Chart">
                  <IconButton size="small" onClick={() => setOpenDateDialog(true)}>
                    <FilterAltIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <ReactApexChart
                options={{
                  chart: { type: 'bar', height: 350, toolbar: { show: false } },
                  colors: [theme.palette.primary.main],
                  dataLabels: { enabled: false },
                  yaxis: {
                    title: { text: 'Amount', style: { fontSize: '11px', color: '#999' } },
                    labels: { formatter: (y) => y.toFixed(2), style: { fontSize: '11px' } },
                  },
                  xaxis: {
                    title: { text: 'Month', style: { fontSize: '11px', color: '#999' } },
                    categories: _.map(ledgerBarData, 'xaxis'),
                    labels: { style: { fontSize: '10px' } },
                  },
                  plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
                  grid: { borderColor: '#f0f0f0' },
                }}
                series={[{ name: 'Amount', data: _.map(ledgerBarData, 'amount') }]}
                type='bar'
                height={320}
              />
            </Card>
          </Box>

          {/* ---- Dialogs ---- */}
          <SendMailDialog emailOpen={emailOpen} setEmailOpen={setEmailOpen} handleSendEmail={handleSendEmail} />

          <Dialog open={filterOpen} onClose={() => setFilterOpen(false)}>
            <DialogContent sx={{ p: 5, width: '400px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton onClick={() => setFilterOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>

              <Grid container spacing={2}>
                <Grid size={12}>
                  <Autocomplete
                    options={['Today', 'Yesterday', 'This Week', 'Last Week', 'Last 7 Days', 'This Month', 'Last Month', 'This Quarter', 'Last Quarter', 'Current Fiscal Year', 'Previous Fiscal Year', 'Last 365 days', ...getFYPresets().map(p => p.label)]}
                    value={filterData.range}
                    onChange={(e, newValue) => {
                      let startDate = null;
                      let endDate = null;
                      const fyMatch = getFYPresets().find(p => p.label === newValue);
                      if (fyMatch) {
                        setFilterData({ range: fyMatch.label, fromDate: fyMatch.fromDate, toDate: fyMatch.toDate });
                        return;
                      }
                      switch (newValue) {
                        case 'Today': startDate = endDate = moment().startOf('day'); break;
                        case 'Yesterday': startDate = endDate = moment().subtract(1, 'day').startOf('day'); break;
                        case 'This Week': startDate = moment().startOf('week'); endDate = moment().endOf('week'); break;
                        case 'Last Week': startDate = moment().subtract(1, 'week').startOf('week'); endDate = moment().subtract(1, 'week').endOf('week'); break;
                        case 'Last 7 Days': startDate = moment().subtract(6, 'days').startOf('day'); endDate = moment().endOf('day'); break;
                        case 'This Month': startDate = moment().startOf('month'); endDate = moment().endOf('month'); break;
                        case 'Last Month': startDate = moment().subtract(1, 'month').startOf('month'); endDate = moment().subtract(1, 'month').endOf('month'); break;
                        case 'This Quarter': startDate = moment().startOf('quarter'); endDate = moment().endOf('quarter'); break;
                        case 'Last Quarter': startDate = moment().subtract(1, 'quarter').startOf('quarter'); endDate = moment().subtract(1, 'quarter').endOf('quarter'); break;
                        case 'Current Fiscal Year':
                          startDate = moment().month() >= 3 ? moment().month(3).startOf('month') : moment().subtract(1, 'year').month(3).startOf('month');
                          endDate = startDate.clone().add(1, 'year').subtract(1, 'day'); break;
                        case 'Previous Fiscal Year':
                          startDate = moment().month() >= 3 ? moment().subtract(1, 'year').month(3).startOf('month') : moment().subtract(2, 'year').month(3).startOf('month');
                          endDate = startDate.clone().add(1, 'year').subtract(1, 'day'); break;
                        case 'Last 365 days': startDate = moment().subtract(364, 'days').startOf('day'); endDate = moment().endOf('day'); break;
                        default: break;
                      }
                      if (startDate && endDate) {
                        setFilterData({ range: newValue, fromDate: startDate.format('YYYY-MM-DD'), toDate: endDate.format('YYYY-MM-DD') });
                      }
                    }}
                    renderInput={(params) => <TextField {...params} fullWidth label='Select Date Range' variant='filled' />}
                  />
                </Grid>

                <Grid size={12}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      label='From Date' value={toMomentOrNull(filterData.fromDate)} format='DD/MM/YYYY'
                      onChange={(date) => setFilterData(prev => ({ ...prev, fromDate: date ? moment(date).format('YYYY-MM-DD') : '', range: '' }))}
                      slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid size={12}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      label='To Date' value={toMomentOrNull(filterData.toDate)} format='DD/MM/YYYY'
                      onChange={(date) => setFilterData(prev => ({ ...prev, toDate: date ? moment(date).format('YYYY-MM-DD') : '', range: '' }))}
                      slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid size={12}>
                  <Grid container spacing={5} justifyContent='center'>
                    <Grid>
                      <Button variant='contained' color='error' onClick={() => handleCancelFilter()}>Clear</Button>
                    </Grid>
                    <Grid>
                      <Button variant='contained' onClick={() => handleApplyFilter()}>Apply</Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
          </Dialog>

          <Dialog disableEscapeKeyDown open={openDateDialog} onClose={() => setOpenDateDialog(false)}>
            <Box style={{ padding: '10px' }}>
              <DialogTitle variant='h3'>Choose Date</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', width: '300px', gap: '20px', marginTop: '10px' }}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      label='From Date' value={toMomentOrNull(fromDate)} format='DD/MM/YYYY'
                      onChange={(e) => setFromDate(e._d)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      label='To Date' value={toMomentOrNull(toDate)}
                      onChange={(e) => setToDate(e._d)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDateDialog(false)}>Cancel</Button>
                <Button onClick={handleSubmitCustomDate} variant='contained'>Ok</Button>
              </DialogActions>
            </Box>
          </Dialog>
        </Card>
      )}
    </div>
  );
}
