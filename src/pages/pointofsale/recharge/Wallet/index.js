import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import CreateNewButtonContext from '../../../../context/CreateNewButtonContext';
import LocationGuard, {hasLocation} from '../LocationGuard';
import {
  Box, Paper, Typography, Card, CardContent, Stack, Button,
  IconButton, TextField, LinearProgress, Alert, Chip, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress as ProgressBar, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import {
  fetchOperators, fetchWalletLoads, updateOperator,
  deleteOperator, deleteWalletLoad, clearRechargeError,
} from '../../../../redux/actions/recharge_actions';
import {formatINR, operatorColor} from '../rechargeUtils';
import AddOperatorDialog from './AddOperatorDialog';
import AddToWalletDialog from './AddToWalletDialog';

const RechargeWallet = () => {
  const dispatch = useDispatch();
  const {headerLocationId} = useContext(CreateNewButtonContext);
  const {operators, walletLoads, loading, error} = useSelector((s) => s.rechargeReducer);

  const [addOpOpen, setAddOpOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [loadOperator, setLoadOperator] = useState(null);
  const [editLoad, setEditLoad] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editMargin, setEditMargin] = useState('');
  const [confirm, setConfirm] = useState(null); // { kind: 'load'|'operator', target: obj }
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    if (hasLocation(headerLocationId)) {
      dispatch(fetchOperators(headerLocationId));
      dispatch(fetchWalletLoads({header_location_id: headerLocationId}));
    }
    dispatch(clearRechargeError());
  }, [dispatch, headerLocationId]);

  const openAddToWallet = (op) => {
    setLoadOperator(op);
    setEditLoad(null);
    setLoadOpen(true);
  };

  const openEditLoad = (w) => {
    setEditLoad(w);
    setLoadOperator(null);
    setLoadOpen(true);
  };

  const closeLoadDialog = () => {
    setLoadOpen(false);
    setEditLoad(null);
    setLoadOperator(null);
  };

  const isLoadEditable = (w) => {
    const op = (operators || []).find(o => o.id === w.operator_id);
    return op && Number(op.total_consumed || 0) === 0;
  };

  const startEditMargin = (op) => {
    setEditingId(op.id);
    setEditMargin(String(op.margin_percent));
  };

  const saveMargin = (op) => {
    const n = Number(editMargin);
    if (!Number.isFinite(n) || n < 0 || n > 100) return;
    dispatch(
      updateOperator(op.id, {margin_percent: n}, () => {
        setEditingId(null);
        dispatch(fetchOperators(headerLocationId));
      })
    );
  };

  const toggleActive = (op) => {
    dispatch(
      updateOperator(op.id, {is_active: op.is_active ? 0 : 1}, () => dispatch(fetchOperators(headerLocationId)))
    );
  };

  const askDelete = (kind, target) => {
    setDeleteError(null);
    setConfirm({kind, target});
  };

  const doDelete = () => {
    if (!confirm) return;
    const {kind, target} = confirm;
    const onSuccess = () => {
      setConfirm(null);
      dispatch(fetchOperators(headerLocationId));
      dispatch(fetchWalletLoads({header_location_id: headerLocationId}));
    };
    const onError = (msg) => setDeleteError(msg);
    if (kind === 'load') {
      dispatch(deleteWalletLoad(target.id, onSuccess, onError));
    } else if (kind === 'operator') {
      dispatch(deleteOperator(target.id, onSuccess, onError));
    }
  };

  const isOperatorDeletable = (op) =>
    Number(op.total_loaded || 0) === 0 && Number(op.total_consumed || 0) === 0;

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
          <Typography variant='h4' sx={{fontWeight: 600}}>Recharge Wallet</Typography>
          <Typography variant='body2' color='text.secondary'>
            Operator prepaid balance and vendor loads
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={() => setAddOpOpen(true)}
          disabled={!hasLocation(headerLocationId)}
        >
          Add Operator
        </Button>
      </Stack>

      <LocationGuard headerLocationId={headerLocationId}>

      {loading && <LinearProgress sx={{mb: 2}} />}
      {error && (
        <Alert severity='error' onClose={() => dispatch(clearRechargeError())} sx={{mb: 2}}>
          {error}
        </Alert>
      )}

      {/* Operator cards — horizontally scrollable row */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          overflowX: 'auto',
          overflowY: 'hidden',
          pb: 1,
          '&::-webkit-scrollbar': {height: 8},
          '&::-webkit-scrollbar-thumb': {bgcolor: 'action.disabled', borderRadius: 4},
        }}
      >
        {(operators || []).map((op) => {
          const loaded = Number(op.total_loaded || 0);
          const consumed = Number(op.total_consumed || 0);
          const pct = loaded > 0 ? Math.min(100, Math.round((consumed / loaded) * 100)) : 0;
          const isEditing = editingId === op.id;
          return (
            <Box key={op.id} sx={{flex: '0 0 260px', minWidth: 260}}>
              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: op.is_active ? 'divider' : 'action.disabledBackground',
                  borderRadius: 2, height: '100%',
                  opacity: op.is_active ? 1 : 0.6,
                }}
              >
                <Box sx={{height: 6, bgcolor: operatorColor(op.code)}} />
                <CardContent>
                  <Stack direction='row' justifyContent='space-between' alignItems='center' mb={1.5}>
                    <Stack direction='row' spacing={1.5} alignItems='center'>
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
                      <Typography variant='h6' sx={{fontWeight: 600}}>{op.code}</Typography>
                    </Stack>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <Tooltip title={op.is_active ? 'Deactivate' : 'Activate'}>
                        <Chip
                          size='small'
                          clickable
                          label={op.is_active ? 'Active' : 'Inactive'}
                          color={op.is_active ? 'success' : 'default'}
                          variant='outlined'
                          onClick={() => toggleActive(op)}
                        />
                      </Tooltip>
                      <Tooltip
                        title={
                          isOperatorDeletable(op)
                            ? 'Delete operator'
                            : 'Has loads or transactions — deactivate instead'
                        }
                      >
                        <span>
                          <IconButton
                            size='small'
                            color='error'
                            disabled={!isOperatorDeletable(op)}
                            onClick={() => askDelete('operator', op)}
                          >
                            <DeleteOutlineIcon fontSize='small' />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  <Typography variant='caption' color='text.secondary'>Wallet balance</Typography>
                  <Typography variant='h5' sx={{fontWeight: 700, mb: 1.5}}>
                    {formatINR(op.wallet_balance)}
                  </Typography>

                  <ProgressBar
                    variant='determinate'
                    value={pct}
                    sx={{
                      height: 6, borderRadius: 3, mb: 1,
                      '& .MuiLinearProgress-bar': {bgcolor: operatorColor(op.code)},
                    }}
                  />
                  <Stack direction='row' justifyContent='space-between'>
                    <Typography variant='caption' color='text.secondary'>
                      Consumed {formatINR(consumed)}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Loaded {formatINR(loaded)}
                    </Typography>
                  </Stack>

                  <Divider sx={{my: 1.5}} />

                  <Stack direction='row' alignItems='center' spacing={1}>
                    <Typography variant='caption' color='text.secondary' sx={{minWidth: 60}}>
                      Margin
                    </Typography>
                    {isEditing ? (
                      <>
                        <TextField
                          size='small'
                          value={editMargin}
                          onChange={(e) => setEditMargin(e.target.value)}
                          sx={{width: 90}}
                          inputProps={{min: 0, max: 100, step: 0.1}}
                          type='number'
                        />
                        <IconButton size='small' color='primary' onClick={() => saveMargin(op)}>
                          <CheckIcon fontSize='small' />
                        </IconButton>
                        <IconButton size='small' onClick={() => setEditingId(null)}>
                          <CloseIcon fontSize='small' />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <Typography variant='body2' sx={{fontWeight: 600, flexGrow: 1}}>
                          {op.margin_percent}%
                        </Typography>
                        <IconButton size='small' onClick={() => startEditMargin(op)}>
                          <EditIcon fontSize='small' />
                        </IconButton>
                      </>
                    )}
                  </Stack>

                  <Button
                    fullWidth
                    variant='contained'
                    startIcon={<AccountBalanceWalletOutlinedIcon />}
                    sx={{
                      mt: 2, bgcolor: operatorColor(op.code),
                      '&:hover': {bgcolor: operatorColor(op.code), opacity: 0.9},
                    }}
                    onClick={() => openAddToWallet(op)}
                    disabled={!op.is_active}
                  >
                    Add to Wallet
                  </Button>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2,
          flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
        }}
      >
        <Typography variant='subtitle1' sx={{fontWeight: 600, mb: 2}}>
          Vendor Wallet Load History
        </Typography>
        <TableContainer sx={{flex: 1, minHeight: 0, overflow: 'auto'}}>
          <Table size='small' stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Operator</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell align='right'>Amount</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell align='right' sx={{width: 110}}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(walletLoads || []).map((w) => {
                const posted = !!w.acc_transaction_id;
                return (
                  <TableRow key={w.id}>
                    <TableCell>{new Date(w.load_date).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>
                      <Chip
                        size='small'
                        label={w.operator_code}
                        sx={{bgcolor: operatorColor(w.operator_code), color: '#fff'}}
                      />
                    </TableCell>
                    <TableCell>{w.vendor_name || `#${w.vendor_id}`}</TableCell>
                    <TableCell align='right' sx={{fontWeight: 600}}>
                      {formatINR(w.amount)}
                    </TableCell>
                    <TableCell>{w.payment_method_name || '—'}</TableCell>
                    <TableCell>{w.reference_no || '—'}</TableCell>
                    <TableCell align='right'>
                      <Stack direction='row' justifyContent='flex-end' spacing={0.5}>
                        <Tooltip
                          title={
                            isLoadEditable(w)
                              ? 'Edit wallet load (posts reversal + new ledger entries)'
                              : 'Cannot edit: operator wallet already consumed by a recharge'
                          }
                        >
                          <span>
                            <IconButton
                              size='small'
                              color='primary'
                              disabled={!isLoadEditable(w)}
                              onClick={() => openEditLoad(w)}
                            >
                              <EditOutlinedIcon fontSize='small' />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip
                          title={
                            posted
                              ? 'Cannot delete: already posted to ledger'
                              : 'Delete wallet load'
                          }
                        >
                          <span>
                            <IconButton
                              size='small'
                              color='error'
                              disabled={posted}
                              onClick={() => askDelete('load', w)}
                            >
                              <DeleteOutlineIcon fontSize='small' />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!walletLoads?.length && (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{py: 4, color: 'text.secondary'}}>
                    No wallet loads yet — click "Add to Wallet" on an operator card above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      </LocationGuard>

      <AddOperatorDialog open={addOpOpen} onClose={() => setAddOpOpen(false)} />
      <AddToWalletDialog
        open={loadOpen}
        onClose={closeLoadDialog}
        operator={loadOperator}
        editLoad={editLoad}
        operators={operators}
      />

      <Dialog open={!!confirm} onClose={() => setConfirm(null)} maxWidth='xs' fullWidth>
        <DialogTitle>
          {confirm?.kind === 'load' ? 'Delete wallet load?' : 'Delete operator?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirm?.kind === 'load' && (
              <>
                Remove the load of <b>{formatINR(confirm?.target?.amount)}</b> to{' '}
                <b>{confirm?.target?.operator_code}</b> dated{' '}
                <b>{confirm?.target && new Date(confirm.target.load_date).toLocaleDateString('en-IN')}</b>?
                <br />This cannot be undone.
              </>
            )}
            {confirm?.kind === 'operator' && (
              <>
                Permanently remove operator <b>{confirm?.target?.code}</b>? Allowed only because
                it has no loads or transactions.
              </>
            )}
          </DialogContentText>
          {deleteError && (
            <Alert severity='error' sx={{mt: 2}}>{deleteError}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>Cancel</Button>
          <Button color='error' variant='contained' onClick={doDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RechargeWallet;
