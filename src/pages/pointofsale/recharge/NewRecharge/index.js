import React, {useContext, useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import CreateNewButtonContext from '../../../../context/CreateNewButtonContext';
import LocationGuard, {hasLocation} from '../LocationGuard';
import {
  Box, Paper, Typography, Grid, Stack, TextField, Button, Chip,
  ToggleButton, ToggleButtonGroup, Divider, Alert, LinearProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import MaterialTable from 'utils/SafeMaterialTable';
import {headerStyle, cellStyle} from 'utils/pageSize';
import {
  fetchOperators,
  fetchPaymentMethods,
  fetchTransactions,
  createRechargeTxn,
  clearRechargeError,
} from '../../../../redux/actions/recharge_actions';
import {formatINR, operatorColor} from '../rechargeUtils';

const STANDARD_PLANS = [
  19, 49, 99, 149, 199, 239, 269, 299, 349, 399,
  449, 479, 499, 549, 599, 666, 719, 799, 899, 999,
];

const statusColor = {
  SUCCESS: 'success',
  PENDING: 'warning',
  FAILED: 'error',
};

const paymentIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('cash')) return <PaymentsOutlinedIcon fontSize='small' />;
  if (n.includes('upi')) return <QrCode2OutlinedIcon fontSize='small' />;
  if (n.includes('card')) return <CreditCardOutlinedIcon fontSize='small' />;
  if (n.includes('bank') || n.includes('neft') || n.includes('rtgs')) return <AccountBalanceOutlinedIcon fontSize='small' />;
  return <ReceiptLongOutlinedIcon fontSize='small' />;
};

const NewRecharge = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {headerLocationId} = useContext(CreateNewButtonContext);

  const {operators, paymentMethods, transactions, loading, error} =
    useSelector((s) => s.rechargeReducer);

  const [operatorId, setOperatorId] = useState('');
  const [mobile, setMobile] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  useEffect(() => {
    if (hasLocation(headerLocationId)) {
      dispatch(fetchOperators(headerLocationId));
      dispatch(fetchPaymentMethods(headerLocationId));
      dispatch(fetchTransactions({limit: 500, header_location_id: headerLocationId}));
    }
    dispatch(clearRechargeError());
  }, [dispatch, headerLocationId]);

  const activeOperators = useMemo(
    () => (operators || []).filter((o) => o.is_active),
    [operators]
  );
  const selectedOperator = useMemo(
    () => activeOperators.find((o) => o.id === Number(operatorId)),
    [activeOperators, operatorId]
  );

  const preview = useMemo(() => {
    const amt = Number(amount || 0);
    if (!selectedOperator || !amt) {
      return {cost: 0, margin: 0, balanceAfter: selectedOperator?.wallet_balance || 0};
    }
    const cost = Math.round(amt * (1 - Number(selectedOperator.margin_percent) / 100) * 100) / 100;
    const margin = Math.round((amt - cost) * 100) / 100;
    const balanceAfter = Math.round((Number(selectedOperator.wallet_balance) - cost) * 100) / 100;
    return {cost, margin, balanceAfter};
  }, [amount, selectedOperator]);

  const canSubmit =
    operatorId && /^\d{10}$/.test(mobile) &&
    Number(amount) >= 10 && paymentMethodId && !loading;

  const handleSubmit = () => {
    dispatch(
      createRechargeTxn(
        {
          operator_id: Number(operatorId),
          mobile,
          sell_amount: Number(amount),
          payment_method_id: Number(paymentMethodId),
          header_location_id: headerLocationId,
        },
        (data) => {
          setSuccessInfo(data);
          setAmount('');
          setMobile('');
          dispatch(fetchOperators(headerLocationId));
          dispatch(fetchTransactions({limit: 500, header_location_id: headerLocationId}));
        }
      )
    );
  };

  const resetAfterSuccess = () => {
    setSuccessInfo(null);
    setOperatorId('');
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        height: 'calc(100vh - 50px)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Stack direction='row' justifyContent='space-between' alignItems='center' mb={3}>
        <Box>
          <Typography variant='h4' sx={{fontWeight: 600}}>New Recharge</Typography>
          <Typography variant='body2' color='text.secondary'>
            Capture a mobile recharge sale and deduct operator wallet
          </Typography>
        </Box>
        <Stack direction='row' spacing={1}>
          <Button variant='outlined' onClick={() => navigate('/pointofsale/recharge/dashboard')}>
            Dashboard
          </Button>
          <Button variant='outlined' onClick={() => navigate('/pointofsale/recharge/wallet')}>
            Wallet
          </Button>
        </Stack>
      </Stack>

      <LocationGuard headerLocationId={headerLocationId}>

      {loading && <LinearProgress sx={{mb: 2}} />}
      {error && (
        <Alert severity='error' onClose={() => dispatch(clearRechargeError())} sx={{mb: 2}}>
          {error}
        </Alert>
      )}
      {successInfo && (
        <Alert
          severity='success'
          icon={<CheckCircleIcon />}
          onClose={resetAfterSuccess}
          sx={{mb: 2}}
          action={
            <Button color='inherit' size='small' onClick={resetAfterSuccess}>
              New Recharge
            </Button>
          }
        >
          Recharge successful — <b>{successInfo.txn_code}</b> · Sell {formatINR(successInfo.sell_amount)} ·
          Margin {formatINR(successInfo.margin)} · Wallet balance after {formatINR(successInfo.wallet_balance_after)}
        </Alert>
      )}

      <Grid container spacing={2} alignItems='stretch'>
        <Grid size={{xs: 12, md: 7}} sx={{display: 'flex'}}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2,
              width: '100%', height: 240, display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Line 1 — Operator (full row) */}
            <Typography variant='caption' color='text.secondary' sx={{ml: 0.5}}>Operator</Typography>
            <ToggleButtonGroup
              value={operatorId}
              exclusive
              onChange={(_, v) => v && setOperatorId(v)}
              sx={{display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5, mb: 2}}
            >
              {activeOperators.map((o) => (
                <ToggleButton
                  key={o.id}
                  value={o.id}
                  sx={{
                    flex: '1 1 120px', minWidth: 120,
                    border: '1px solid !important',
                    borderColor: 'divider !important',
                    borderRadius: '10px !important',
                    px: 1.5, py: 1, textTransform: 'none',
                    justifyContent: 'flex-start',
                    '&.Mui-selected': {
                      bgcolor: operatorColor(o.code),
                      color: '#fff',
                      '&:hover': {bgcolor: operatorColor(o.code), opacity: 0.9},
                    },
                  }}
                >
                  <Stack alignItems='flex-start'>
                    <Typography variant='body2' sx={{fontWeight: 700}}>{o.code}</Typography>
                    <Typography variant='caption'>
                      {formatINR(o.wallet_balance)} · {o.margin_percent}%
                    </Typography>
                  </Stack>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {/* Standard plan chips */}
            <Typography variant='caption' color='text.secondary' sx={{ml: 0.5}}>Plans</Typography>
            <Box
              sx={{
                display: 'flex', gap: 0.75,
                overflowX: 'auto', overflowY: 'hidden',
                mt: 0.5, mb: 1.5, pb: 0.5,
                '&::-webkit-scrollbar': {height: 6},
                '&::-webkit-scrollbar-thumb': {bgcolor: 'action.disabled', borderRadius: 3},
              }}
            >
              {STANDARD_PLANS.map((p) => (
                <Chip
                  key={p}
                  label={`₹${p}`}
                  size='small'
                  variant={String(amount) === String(p) ? 'filled' : 'outlined'}
                  color={String(amount) === String(p) ? 'primary' : 'default'}
                  onClick={() => setAmount(String(p))}
                  sx={{fontWeight: 600, flexShrink: 0}}
                />
              ))}
            </Box>

            {/* Line 2 — Mobile + Amount */}
            <Stack direction='row' spacing={1.5} alignItems='flex-start' flexWrap='wrap' useFlexGap>
              <TextField
                label='Mobile Number'
                sx={{
                  flex: '1 1 360px', minWidth: 280,
                  '& .MuiInputBase-input': {
                    fontSize: 24, fontWeight: 600, letterSpacing: 1,
                    py: 2.5, lineHeight: 1.2,
                  },
                  '& .MuiInputLabel-root': {fontSize: 15},
                }}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                error={mobile.length > 0 && mobile.length !== 10}
                helperText={mobile.length > 0 && mobile.length !== 10 ? 'Must be 10 digits' : ' '}
                inputProps={{inputMode: 'numeric'}}
              />
              <TextField
                label='Amount'
                type='number'
                sx={{
                  width: 200,
                  '& .MuiInputBase-input': {
                    fontSize: 24, fontWeight: 600,
                    py: 2.5, lineHeight: 1.2,
                  },
                  '& .MuiInputLabel-root': {fontSize: 15},
                }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                error={amount !== '' && Number(amount) < 10}
                helperText={amount !== '' && Number(amount) < 10 ? 'Min ₹10' : ' '}
                inputProps={{min: 10}}
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{xs: 12, md: 5}} sx={{display: 'flex'}}>
          <Paper
            elevation={0}
            sx={{
              p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2,
              width: '100%', height: 240, display: 'flex', flexDirection: 'column',
            }}
          >
            <Stack direction='row' justifyContent='space-between' alignItems='center' mb={1.5}>
              <Typography variant='subtitle1' sx={{fontWeight: 600}}>Recharge Preview</Typography>
              {selectedOperator && (
                <Chip
                  size='small'
                  label={`${selectedOperator.code} · ${selectedOperator.margin_percent}%`}
                  sx={{bgcolor: operatorColor(selectedOperator.code), color: '#fff', fontWeight: 600}}
                />
              )}
            </Stack>

            {!selectedOperator ? (
              <Typography variant='body2' color='text.secondary' sx={{py: 1}}>
                Select an operator to see live cost, margin and projected wallet balance.
              </Typography>
            ) : (
              <Grid container spacing={1}>
                <Stat label='Sell' value={formatINR(Number(amount || 0))} />
                <Stat label='Cost' value={formatINR(preview.cost)} />
                <Stat label='Margin' value={formatINR(preview.margin)} accent />
                <Stat
                  label='Balance after'
                  value={formatINR(preview.balanceAfter)}
                  warn={preview.balanceAfter < 0}
                />
              </Grid>
            )}

            <Divider sx={{my: 1.5}} />

            {/* Payment Method tiles — scrolls if many */}
            <Box sx={{flex: 1, minHeight: 0, overflowY: 'auto', mb: 1.5, pr: 0.5}}>
              <ToggleButtonGroup
                value={paymentMethodId}
                exclusive
                size='small'
                onChange={(_, v) => v && setPaymentMethodId(v)}
                sx={{display: 'flex', flexWrap: 'wrap', gap: 0.75}}
              >
                {(paymentMethods || []).map((pm) => (
                  <ToggleButton
                    key={pm.id}
                    value={pm.id}
                    sx={{
                      flex: '1 1 100px',
                      border: '1px solid !important',
                      borderColor: 'divider !important',
                      borderRadius: '8px !important',
                      px: 1.5, py: 0.75, textTransform: 'none',
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: '#fff',
                        '&:hover': {bgcolor: 'primary.main', opacity: 0.92},
                      },
                    }}
                  >
                    <Stack direction='row' spacing={0.75} alignItems='center'>
                      {paymentIcon(pm.name)}
                      <Typography variant='body2' sx={{fontWeight: 600}}>{pm.name}</Typography>
                    </Stack>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            {/* Actions */}
            <Stack direction='row' spacing={1} justifyContent='flex-end'>
              <Button size='small' onClick={() => {
                setOperatorId('');
                setMobile(''); setAmount(''); setPaymentMethodId('');
              }}>
                Clear
              </Button>
              <Button
                variant='contained'
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                Process Recharge
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Recharge History */}
      <Box sx={{mt: 2, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
        <MaterialTable
          title='Recharge History'
          data={(transactions || []).map((t, i) => ({...t, _row: i}))}
          columns={[
            {
              title: 'Txn #',
              field: 'txn_code',
              headerStyle,
              cellStyle,
            },
            {
              title: 'Time',
              field: 'txn_time',
              headerStyle,
              cellStyle,
              render: (r) => new Date(r.txn_time).toLocaleString('en-IN', {hour12: false}),
              customFilterAndSearch: (term, r) =>
                new Date(r.txn_time).toLocaleString('en-IN').toLowerCase().includes(term.toLowerCase()),
            },
            {title: 'Mobile', field: 'mobile', headerStyle, cellStyle},
            {
              title: 'Operator',
              field: 'operator_code',
              headerStyle,
              cellStyle,
              render: (r) => (
                <Chip
                  size='small'
                  label={r.operator_code}
                  sx={{bgcolor: operatorColor(r.operator_code), color: '#fff'}}
                />
              ),
            },
            {
              title: 'Sell',
              field: 'sell_amount',
              headerStyle,
              cellStyle: {...cellStyle, textAlign: 'right'},
              render: (r) => formatINR(r.sell_amount),
              type: 'numeric',
            },
            {
              title: 'Cost',
              field: 'cost_amount',
              headerStyle,
              cellStyle: {...cellStyle, textAlign: 'right'},
              render: (r) => formatINR(r.cost_amount),
              type: 'numeric',
            },
            {
              title: 'Margin',
              field: 'margin',
              headerStyle,
              cellStyle: {...cellStyle, textAlign: 'right'},
              render: (r) => formatINR(r.margin),
              type: 'numeric',
            },
            {
              title: 'Status',
              field: 'status',
              headerStyle,
              cellStyle,
              render: (r) => (
                <Chip size='small' color={statusColor[r.status] || 'default'} label={r.status} />
              ),
            },
          ]}
          options={{
            search: true,
            toolbar: true,
            paging: true,
            pageSize: 20,
            pageSizeOptions: [20, 50, 100],
            emptyRowsWhenPaging: false,
            exportButton: true,
            maxBodyHeight: 'calc(100vh - 510px)',
            minBodyHeight: 'calc(100vh - 510px)',
            headerStyle: {
              ...headerStyle,
              backgroundColor: '#F4F7FE',
              position: 'sticky',
              top: 0,
              zIndex: 2,
            },
            searchFieldStyle: {width: 260},
          }}
          localization={{
            header: {actions: ''},
            toolbar: {searchPlaceholder: 'Search by txn #, mobile, operator, status'},
            body: {emptyDataSourceMessage: 'No recharges yet — process one above to see it here.'},
          }}
        />
      </Box>

      </LocationGuard>
    </Box>
  );
};

const Stat = ({label, value, accent, warn}) => (
  <Grid size={{xs: 6, sm: 3}}>
    <Box
      sx={{
        p: 1, borderRadius: 1.5, bgcolor: 'action.hover',
      }}
    >
      <Typography variant='caption' color='text.secondary' noWrap>{label}</Typography>
      <Typography
        variant='subtitle2'
        sx={{
          fontWeight: 700, lineHeight: 1.2,
          color: warn ? 'error.main' : accent ? 'success.main' : 'text.primary',
        }}
        noWrap
      >
        {value}
      </Typography>
    </Box>
  </Grid>
);

const Row = ({label, value, strong, warn}) => (
  <Stack direction='row' justifyContent='space-between'>
    <Typography variant='body2' color='text.secondary'>{label}</Typography>
    <Typography
      variant='body2'
      sx={{fontWeight: strong ? 700 : 500, color: warn ? 'error.main' : 'text.primary'}}
    >
      {value}
    </Typography>
  </Stack>
);

export default NewRecharge;
