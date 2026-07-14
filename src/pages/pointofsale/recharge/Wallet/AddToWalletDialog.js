import React, {useContext, useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Stack, MenuItem, Autocomplete, InputAdornment, Alert,
  FormControl, InputLabel, Select,
} from '@mui/material';
import CreateNewButtonContext from '../../../../context/CreateNewButtonContext';
import {listVendorIdAndNameAction} from '../../../../redux/actions/vendor_actions';
import {
  createWalletLoad, updateWalletLoad,
  fetchOperators, fetchWalletLoads, fetchPaymentMethods,
} from '../../../../redux/actions/recharge_actions';
import {formatINR, operatorColor} from '../rechargeUtils';

export default function AddToWalletDialog({open, onClose, operator, editLoad, operators}) {
  const dispatch = useDispatch();
  const {headerLocationId} = useContext(CreateNewButtonContext);
  const isEdit = !!editLoad;

  const [vendor, setVendor] = useState(null);
  const [amount, setAmount] = useState('');
  const [loadDate, setLoadDate] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [operatorId, setOperatorId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const vendorIdAndName = useSelector((s) => s.vendorReducer?.vendorIdAndName || []);
  const paymentMethods = useSelector((s) => s.rechargeReducer?.paymentMethods || []);

  useEffect(() => {
    if (!open) return;
    dispatch(listVendorIdAndNameAction());
    dispatch(fetchPaymentMethods(headerLocationId));
    setSubmitting(false);
    setLocalError(null);

    if (isEdit) {
      // Pre-fill from editLoad
      const v = (vendorIdAndName || []).find(
        x => (x.supplier_id || x.id) === editLoad.vendor_id
      ) || {supplier_id: editLoad.vendor_id, agency_name: editLoad.vendor_name};
      setVendor(v);
      setAmount(String(editLoad.amount));
      setLoadDate(String(editLoad.load_date).slice(0, 10));
      setReference(editLoad.reference_no || '');
      setPaymentMethodId(editLoad.payment_method_id || '');
      setOperatorId(editLoad.operator_id);
    } else {
      setVendor(null);
      setAmount('');
      setLoadDate(new Date().toISOString().slice(0, 10));
      setReference('');
      setPaymentMethodId('');
      setOperatorId(operator?.id || '');
    }
  }, [open, isEdit]);

  // When vendor list loads after dialog opens in edit mode, map vendor_id to full option
  useEffect(() => {
    if (!open || !isEdit || !vendorIdAndName?.length) return;
    const match = vendorIdAndName.find(
      x => (x.supplier_id || x.id) === editLoad.vendor_id
    );
    if (match) setVendor(match);
  }, [open, isEdit, vendorIdAndName]);

  const currentOperator = operator || (operators || []).find(o => o.id === operatorId);

  const canSubmit =
    operatorId && vendor && Number(amount) > 0 && loadDate && paymentMethodId && !submitting;

  const handleSubmit = () => {
    setLocalError(null);
    setSubmitting(true);
    const payload = {
      operator_id: Number(operatorId),
      vendor_id: vendor.supplier_id || vendor.id,
      amount: Number(amount),
      load_date: loadDate,
      reference_no: reference || null,
      payment_method_id: Number(paymentMethodId),
      header_location_id: headerLocationId,
    };
    const onSuccess = () => {
      dispatch(fetchOperators(headerLocationId));
      dispatch(fetchWalletLoads({header_location_id: headerLocationId}));
      onClose();
    };
    const onError = (msg) => {
      setSubmitting(false);
      setLocalError(msg);
    };
    if (isEdit) {
      dispatch(updateWalletLoad(editLoad.id, payload, onSuccess, onError));
    } else {
      dispatch(createWalletLoad(payload, onSuccess));
    }
  };

  const vendorOptions = (vendorIdAndName || []).map((v) => ({
    ...v,
    label:
      v.agency_name || v.company_name || v.vendor_name || v.name ||
      `Vendor #${v.supplier_id || v.id}`,
  }));

  const title = isEdit
    ? `Edit Wallet Load #${editLoad.id}`
    : `Add to ${operator?.code || ''} Wallet`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {currentOperator && (
          <Alert
            severity='info'
            sx={{mb: 2, bgcolor: operatorColor(currentOperator.code) + '15'}}
            icon={false}
          >
            {isEdit ? 'Editing a load — original ledger entry will be reversed and a new one posted.' : (
              <>Current balance: <b>{formatINR(currentOperator.wallet_balance)}</b> · Margin {currentOperator.margin_percent}%</>
            )}
          </Alert>
        )}
        {localError && <Alert severity='error' sx={{mb: 2}}>{localError}</Alert>}
        <Stack spacing={2} sx={{mt: 1}}>
          {isEdit && (
            <FormControl size='small' fullWidth>
              <InputLabel>Operator</InputLabel>
              <Select
                value={operatorId}
                label='Operator'
                onChange={(e) => setOperatorId(e.target.value)}
              >
                {(operators || []).filter(o => o.is_active).map((o) => (
                  <MenuItem key={o.id} value={o.id}>{o.code}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Autocomplete
            options={vendorOptions}
            value={vendor}
            onChange={(_, v) => setVendor(v)}
            getOptionLabel={(o) => o?.label || o?.agency_name || ''}
            isOptionEqualToValue={(a, b) =>
              (a.supplier_id || a.id) === (b.supplier_id || b.id)
            }
            renderInput={(params) => (
              <TextField {...params} label='Vendor' size='small' />
            )}
          />
          <TextField
            label='Amount to Load'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type='number'
            size='small'
            InputProps={{startAdornment: <InputAdornment position='start'>₹</InputAdornment>}}
            inputProps={{min: 1, step: 1}}
          />
          <FormControl size='small' fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethodId}
              label='Payment Method'
              onChange={(e) => setPaymentMethodId(e.target.value)}
            >
              {paymentMethods.map((pm) => (
                <MenuItem key={pm.id} value={pm.id}>{pm.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label='Load Date'
            type='date'
            value={loadDate}
            onChange={(e) => setLoadDate(e.target.value)}
            size='small'
            InputLabelProps={{shrink: true}}
          />
          <TextField
            label='Reference / Invoice #'
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            size='small'
            placeholder='optional'
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant='contained' disabled={!canSubmit} onClick={handleSubmit}>
          {isEdit ? 'Save Changes' : 'Load Wallet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
