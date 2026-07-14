import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Card, CardContent, Grid, TextField, Typography, Button, Autocomplete,
  CircularProgress, Snackbar, Alert, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { getsessionStorage } from 'pages/common/login/cookies';
import { returnActions } from 'redux/actions/sales_actions';
import { CreateAlert } from 'redux/actions/load';
import { getSearchByCustomerAction, setSearchByCustomersDataAction } from 'redux/actions/customer_actions';
import Salesservice from 'services/sales_services';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import useSalesReturn from './useSalesReturn';
import ReturnItemsTable from './ReturnItemsTable';
import ReturnSummary from './ReturnSummary';
import toMomentOrNull from 'utils/DateFixer';

export default function SalesReturn({ handleClose, cnInvoiceFunction, preloadData }) {
  const dispatch = useDispatch();
  const storage = getsessionStorage();
  const { headerLocationId, commoncookie } = useContext(CreateNewButtonContext);

  const { customerReducer: { customer } } = useSelector((state) => state);
  const stocklocations = useSelector((state) => state.stockLocationReducer?.stocklocation) || [];

  const isAllLocation = !headerLocationId || headerLocationId === 'null' || headerLocationId === '0';
  const initialLocationId = isAllLocation ? '' : headerLocationId;

  const [returnDate, setReturnDate] = useState(moment());
  const [customerId, setCustomerId] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [locationId, setLocationId] = useState(initialLocationId);
  const [comment, setComment] = useState('');
  const [reference, setReference] = useState('');
  const [barcodeScan, setBarcodeScan] = useState('');
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'info' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [changeConfirm, setChangeConfirm] = useState({ open: false, message: '', apply: null });
  const [customerSearchText, setCustomerSearchText] = useState('');
  const customerDebounceRef = useRef(null);
  const submittingRef = useRef(false);

  const {
    items, setItems, scanning, customerInvoices, invoiceProducts,
    loadCustomerInvoices, searchAndAddItem, selectProductForRow, selectInvoiceForRow,
    searchInvoices, enterSerialForRow,
    updateItemQty, removeItem, addEmptyRow, updateField,
    getUntaxedTotal, getTaxTotal, getGrandTotal,
  } = useSalesReturn();

  const handleCustomerSearch = useCallback((text) => {
    setCustomerSearchText(text);
    if (customerDebounceRef.current) clearTimeout(customerDebounceRef.current);
    if (!text || text.length < 2) {
      dispatch(setSearchByCustomersDataAction([]));
      return;
    }
    customerDebounceRef.current = setTimeout(() => {
      dispatch(getSearchByCustomerAction({ searchString: text }));
    }, 400);
  }, [dispatch]);

  // Guard against customer/location change when items exist
  const confirmIfItemsExist = (message, apply) => {
    if (items.length === 0) { apply(); return; }
    setChangeConfirm({ open: true, message, apply });
  };

  const handleChangeConfirmCancel = () => setChangeConfirm({ open: false, message: '', apply: null });

  const handleChangeConfirmContinue = () => {
    const { apply } = changeConfirm;
    setItems([]);
    if (typeof apply === 'function') apply();
    setChangeConfirm({ open: false, message: '', apply: null });
  };

  // Update location when header changes
  useEffect(() => {
    if (!isAllLocation) setLocationId(headerLocationId);
  }, [headerLocationId]);

  // Do NOT auto-fill location when title bar is "All-Location" — let user choose

  // Pre-load data when coming from Invoice ACTION → Return
  useEffect(() => {
    if (preloadData) {
      const { customer_id, customer_name, location_id, sale_id, invoice_number } = preloadData;
      if (customer_id) {
        setCustomerId(customer_id);
        setCustomerName(customer_name || '');
        setCustomerSearchText(customer_name || '');
        const loc = location_id || locationId;
        if (location_id) setLocationId(String(location_id));
        loadCustomerInvoices(customer_id, loc);

        // Pre-load items from the specific invoice
        if (sale_id) {
          (async () => {
            try {
              const res = await Salesservice.getAllCustomerUnreturnedItems({
                customer_id,
                location_id: loc,
                search_invoice: invoice_number || '',
                limit: 500,
              });
              const allItems = (res.data || []).filter(item => String(item.sale_id) === String(sale_id));
              if (allItems.length > 0) {
                const preItems = await Promise.all(allItems.map(async (item) => {
                  const unitPrice = parseFloat(item.item_unit_price) || 0;
                  const gst = parseFloat(item.tax_percentage) || 0;
                  const isSerialized = Number(item.is_serialized) === 1;

                  // Fetch available lots for serialized items
                  let availableLots = [];
                  if (isSerialized && item.sale_id && item.item_id) {
                    try {
                      const lotRes = await Salesservice.getItemLotsForSalesReturn({
                        sale_id: item.sale_id,
                        item_id: item.item_id,
                        location_id: loc,
                      });
                      availableLots = lotRes.data || [];
                    } catch (e) {
                      console.error('Failed to load lots for item:', item.item_id, e);
                    }
                  }

                  // Pre-select all available lots for serialized items
                  const preSelectedLots = isSerialized ? availableLots : [];
                  const preQty = isSerialized ? preSelectedLots.length : Number(item.available_return_qty || 0);

                  return {
                    _isManual: false,
                    sales_item_id: item.sales_item_id,
                    sale_id: item.sale_id,
                    invoice_number: item.invoice_number,
                    invoice_date: item.invoice_date,
                    item_id: item.item_id,
                    name: item.product_name,
                    item_number: item.item_number,
                    is_serialized: item.is_serialized,
                    category: item.category,
                    brand: item.brand,
                    hsn_code: item.hsn_code || '',
                    ordered_quantity: Number(item.ordered_quantity || 0),
                    return_quantity: Number(item.return_quantity || 0),
                    quantity: preQty,
                    item_cost_price: parseFloat(item.item_cost_price) || 0,
                    item_unit_price: unitPrice,
                    discount: parseFloat(item.discount) || 0,
                    tax_category_id: item.tax_category_id,
                    tax_category: item.tax_category_name,
                    gst,
                    returnQuantity: Number(item.available_return_qty || 0),
                    lots: preSelectedLots,
                    availableLots,
                    sub_total: parseFloat((unitPrice * preQty * (1 + gst / 100)).toFixed(2)),
                    tax_types: item.tax_types || '1',
                    tcs: item.tcs || '',
                    tds: item.tds || '',
                    tcs_percent: item.tcs_percent || '0%',
                    tds_percent: item.tds_percent || '0%',
                    tds_id: item.tds_id || null,
                    sub_company_id: item.sub_company_id || null,
                    lot_id: null,
                  };
                }));
                setItems(preItems);
              }
            } catch (err) {
              console.error('Failed to pre-load invoice items:', err);
            }
          })();
        }
      }
    }
  }, [preloadData]);

  const handleBarcodeScan = async (e) => {
    if (e.key !== 'Enter' || !barcodeScan.trim()) return;
    if (!customerId) {
      setSnack({ open: true, msg: 'Please select a Customer first', severity: 'warning' });
      return;
    }
    const result = await searchAndAddItem(customerId, barcodeScan, locationId);
    if (result.success) {
      setBarcodeScan('');
    } else {
      setSnack({ open: true, msg: result.error, severity: 'error' });
    }
  };

  const validatePayload = () => {
    if (!customerId) return 'Please select a Customer';
    if (!locationId) return 'Please select a Location';
    if (!returnDate || !moment(returnDate).isValid()) return 'Please pick a valid Return Date';
    if (moment(returnDate).isAfter(moment(), 'day')) return 'Return Date cannot be in the future';
    if (!Array.isArray(items) || items.length === 0) return 'Please add at least one item';

    const seenItemKeys = new Set();
    const seenLotIds = new Set();

    for (let idx = 0; idx < items.length; idx++) {
      const it = items[idx];
      const rowLabel = `Row ${idx + 1}`;

      if (!it.item_id) return `${rowLabel}: product is not selected`;
      if (!it.sale_id) return `${rowLabel}: invoice is not selected`;

      const qty = Number(it.quantity);
      if (!isFinite(qty) || qty <= 0) return `${rowLabel}: quantity must be greater than 0`;

      const max = Number(it.returnQuantity);
      if (isFinite(max) && max > 0 && qty > max) {
        return `${rowLabel}: quantity (${qty}) exceeds available (${max})`;
      }

      if (it.is_serialized === 1) {
        if (!Array.isArray(it.lots) || it.lots.length === 0) {
          return `${rowLabel}: please select at least one serial/lot`;
        }
        if (it.lots.length !== qty) {
          return `${rowLabel}: quantity (${qty}) must match selected serials (${it.lots.length})`;
        }
        for (const l of it.lots) {
          if (!l || !l.lot_id) return `${rowLabel}: lot_id missing`;
          if (seenLotIds.has(l.lot_id)) return `${rowLabel}: serial/lot already added`;
          seenLotIds.add(l.lot_id);
        }
      } else {
        const key = `${it.sale_id}-${it.item_id}`;
        if (seenItemKeys.has(key)) {
          return `${rowLabel}: duplicate product from the same invoice`;
        }
        seenItemKeys.add(key);
      }
    }

    const total = getGrandTotal();
    if (!isFinite(total) || total <= 0) return 'Return total must be greater than 0';
    return null;
  };

  const handleReturnClick = () => {
    const err = validatePayload();
    if (err) {
      setSnack({ open: true, msg: err, severity: 'warning' });
      return;
    }
    setConfirmOpen(true);
  };

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    const err = validatePayload();
    if (err) {
      submittingRef.current = false;
      setConfirmOpen(false);
      setSnack({ open: true, msg: err, severity: 'warning' });
      return;
    }
    setConfirmOpen(false);
    setSubmitting(true);

    const firstItem = items[0];
    const total_unit_price = items.reduce((sum, i) => sum + (i.item_unit_price * i.quantity), 0);
    const total_gst = items.reduce((sum, i) => sum + (i.item_unit_price * i.quantity * i.gst / 100), 0);
    const total_with_gst = total_unit_price + total_gst;

    const invoiceNumbers = [...new Set(items.map(i => i.invoice_number).filter(Boolean))];
    const invoiceNumberStr = invoiceNumbers.join(', ');

    // Use first item's sale_id as header (backend will use per-item sale_id)
    const headerSaleId = firstItem.sale_id;

    const payload = {
      sale_id: headerSaleId,
      customer_id: customerId,
      location_id: locationId,
      employee_id: commoncookie,
      comment,
      invoice_number: invoiceNumberStr,
      total: getGrandTotal(),
      tax_types: firstItem.tax_types || '1',
      tcs: firstItem.tcs || '',
      tds: firstItem.tds || '',
      tcs_percent: firstItem.tcs_percent || '0%',
      tds_percent: firstItem.tds_percent || '0%',
      tds_id: firstItem.tds_id || null,
      sub_company_id: firstItem.sub_company_id || null,
      so_number: '',
      payment_type: '',
      invoice_date: returnDate.format('YYYY-MM-DD'),
      transactionEntryData: {
        total_unit_price,
        total_cost_price: items.reduce((sum, i) => sum + (i.item_cost_price * i.quantity), 0),
        total_with_gst,
        gst_inter: (total_gst / 2).toFixed(2),
        tcs_inter: firstItem.tcs ? parseFloat(firstItem.tcs) || 0 : 0,
        tds_inter: firstItem.tds ? parseFloat(firstItem.tds) || 0 : 0,
        rounded_off: 0,
      },
      sales_items: (() => {
        const grouped = new Map();
        items.forEach((item) => {
          const key = `${item.sale_id}|${item.item_id}|${item.item_unit_price}`;
          const lots = (item.lots || []).map(l => ({ lot_id: l.lot_id, lot_number: l.lot_number }));
          const existing = grouped.get(key);
          if (existing) {
            existing.quantity += Number(item.quantity) || 0;
            existing.discount += Number(item.discount) || 0;
            existing.lots.push(...lots);
          } else {
            grouped.set(key, {
              sale_id: item.sale_id,
              invoice_number: item.invoice_number,
              item_id: item.item_id,
              name: item.name,
              is_serialized: item.is_serialized,
              lots,
              quantity: Number(item.quantity) || 0,
              item_cost_price: item.item_cost_price,
              item_unit_price: item.item_unit_price,
              discount: Number(item.discount) || 0,
              sales_item_taxes: item.tax_category_id ? { tax_category_id: item.tax_category_id } : {},
              hsn_code: item.hsn_code || '',
            });
          }
        });
        return Array.from(grouped.values()).map((row, idx) => ({ ...row, line: idx + 1 }));
      })(),
    };

    dispatch(returnActions(
      payload,
      null,
      storage?.employee_id,
      locationId,
      async (response) => {
        submittingRef.current = false;
        setSubmitting(false);

        // returnActions already dispatched ErrorAlert / NotAvailableAlert on failure.
        // Leave the form open so the user can correct and retry.
        if (!response || response?.status === 'error') return;

        CreateAlert(dispatch);
        handleClose(response);
      }
    ));
  };

  const filteredLocations = stocklocations.filter(l => l.location_name !== 'Scrap');
  const customerOptions = customer?.length > 0 ? customer.filter(c => c.company_name && c.customer_id) : [];

  return (
    <Card sx={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Sales Return</Typography>
        <IconButton onClick={handleClose}><CloseIcon /></IconButton>
      </Box>

      <CardContent sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 3 }}>
        {/* Form Fields */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                disableFuture
                label="Return Date"
                value={toMomentOrNull(returnDate)}
                format="DD/MM/YYYY"
                onChange={(v) => setReturnDate(v)}
                slotProps={{ textField: { fullWidth: true, size: 'small', variant: 'filled' } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Autocomplete
              size="small"
              freeSolo={customerSearchText.length <= 3}
              options={customerOptions}
              getOptionLabel={(opt) => opt.company_name || `${opt.first_name || ''} ${opt.last_name || ''}`.trim()}
              inputValue={customerSearchText}
              onInputChange={(event, newInputValue, reason) => {
                if (reason === 'input') {
                  handleCustomerSearch(newInputValue);
                }
              }}
              value={customerOptions.find(c => c.customer_id === customerId) || null}
              onChange={(e, val) => {
                if (!val) return;
                confirmIfItemsExist('Changing customer will clear all items. Continue?', () => {
                  setCustomerId(val.customer_id);
                  setCustomerName(val.company_name || `${val.first_name || ''} ${val.last_name || ''}`.trim());
                  setCustomerSearchText(val.company_name || `${val.first_name || ''} ${val.last_name || ''}`.trim());
                  loadCustomerInvoices(val.customer_id, locationId);
                });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select Customer *" variant="filled" />
              )}
              isOptionEqualToValue={(opt, val) => opt.customer_id === val.customer_id}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            {isAllLocation ? (
              <Autocomplete
                size="small"
                options={filteredLocations}
                getOptionLabel={(opt) => opt.location_name || ''}
                value={filteredLocations.find(l => String(l.location_id) === String(locationId)) || null}
                onChange={(e, val) => {
                  if (!val) return;
                  confirmIfItemsExist('Changing location will clear all items. Continue?', () => {
                    setLocationId(String(val.location_id));
                    if (customerId) loadCustomerInvoices(customerId, val.location_id);
                  });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Location *" variant="filled" />
                )}
              />
            ) : (
              <TextField
                label="Location *"
                value={filteredLocations.find(l => String(l.location_id) === String(locationId))?.location_name || locationId}
                variant="filled"
                size="small"
                fullWidth
                disabled
              />
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField label="Reference" value={reference} onChange={(e) => setReference(e.target.value)} variant="filled" size="small" fullWidth />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField label="Comments" value={comment} onChange={(e) => setComment(e.target.value)} variant="filled" size="small" fullWidth />
          </Grid>
        </Grid>

        {/* Return Items Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Return Items</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              size="small"
              placeholder="Barcode / Lot Number — press Enter"
              value={barcodeScan}
              onChange={(e) => setBarcodeScan(e.target.value)}
              onKeyDown={handleBarcodeScan}
              disabled={!customerId || scanning}
              sx={{ width: 300 }}
            />
            <Tooltip title="Add item manually">
              <IconButton
                onClick={addEmptyRow}
                disabled={!customerId}
                color="primary"
                sx={{ border: '1px solid', borderColor: 'primary.main' }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {scanning && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Items Table */}
        <ReturnItemsTable
          items={items}
          onUpdateQty={updateItemQty}
          onRemove={removeItem}
          onUpdateField={updateField}
          customerInvoices={customerInvoices}
          invoiceProducts={invoiceProducts}
          onInvoiceSelect={selectInvoiceForRow}
          onProductSelect={selectProductForRow}
          onInvoiceSearch={searchInvoices}
          onNotify={(n) => setSnack({ open: true, ...n })}
        />

        {/* Summary */}
        {items.length > 0 && (
          <ReturnSummary
            untaxed={getUntaxedTotal()}
            tax={getTaxTotal()}
            total={getGrandTotal()}
          />
        )}
      </CardContent>

      {/* Footer */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button variant="outlined" onClick={handleClose} disabled={submitting}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleReturnClick}
          disabled={submitting || items.length === 0}
        >
          {submitting ? <CircularProgress size={20} /> : 'Return'}
        </Button>
      </Box>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Sales Return</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {items.length} item(s) totalling ₹{getGrandTotal().toFixed(2)} will be returned.
            A Credit Note will be created. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : 'Confirm Return'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Confirm Dialog */}
      <Dialog open={changeConfirm.open} onClose={handleChangeConfirmCancel}>
        <DialogTitle>Change will clear items</DialogTitle>
        <DialogContent>
          <DialogContentText>{changeConfirm.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleChangeConfirmCancel}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleChangeConfirmContinue}>Continue</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} sx={{ zIndex: 9999 }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Card>
  );
}
