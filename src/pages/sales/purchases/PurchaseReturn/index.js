import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Card, CardContent, Grid, TextField, Typography, Button, Autocomplete,
  CircularProgress, Snackbar, Alert, IconButton, Tooltip, Collapse, Link,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, HelpOutline as HelpIcon } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getSearchByVendorAction, setSearchByVendorDataAction, setInvoiceTempAction } from 'redux/actions/vendor_actions';
import { returnActions } from 'redux/actions/purchase_actions';
import { ManualSalesPurchase } from 'redux/actions/manualNotes_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import usePurchaseReturn from './usePurchaseReturn';
import ReturnItemsTable from './ReturnItemsTable';
import ReturnSummary from './ReturnSummary';

export default function PurchaseReturn({ handleClose, cnInvoiceFunction }) {
  const dispatch = useDispatch();
  const storage = getsessionStorage();
  const { headerLocationId } = useContext(CreateNewButtonContext);

  const { vendorReducer: { vendorIdAndName: vendors } } = useSelector((state) => state);
  const stocklocations = useSelector((state) => state.stockLocationReducer?.stocklocation) || [];

  // Resolve initial location: use header location if set and not "All"
  const isAllLocation = !headerLocationId || headerLocationId === 'null' || headerLocationId === '0';
  const initialLocationId = isAllLocation ? '' : headerLocationId;

  const [returnDate, setReturnDate] = useState(moment());
  const [supplierId, setSupplierId] = useState(null);
  const [locationId, setLocationId] = useState(initialLocationId);
  const [comment, setComment] = useState('');
  const [reference, setReference] = useState('');
  const [barcodeScan, setBarcodeScan] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'info' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [changeConfirm, setChangeConfirm] = useState({ open: false, message: '', apply: null });
  const vendorDebounceRef = useRef(null);
  // Synchronous guard against double-submit: state updates are batched, so the
  // Confirm button can be clicked twice before `submitting` flips. Ref is set
  // before any await, so the second invocation returns immediately.
  const submittingRef = useRef(false);

  const {
    items, setItems, scanning, vendorBills, billProducts, openingStockProducts,
    loadVendorBills, searchAndAddItem, selectProductForRow, selectBillForRow,
    searchInvoices, enterSerialForRow, loadOpeningStockProducts,
    updateItemQty, removeItem, addEmptyRow, updateField,
    getUntaxedTotal, getTaxTotal, getGrandTotal,
  } = usePurchaseReturn();

  // B3: guard against silent vendor/location change when items already exist.
  // Instead of breaking the state silently, warn the user if they try to change
  // vendor/location after adding items and require confirmation.
  const confirmIfItemsExist = (message, apply) => {
    if (items.length === 0) {
      apply();
      return;
    }
    setChangeConfirm({ open: true, message, apply });
  };

  const handleChangeConfirmCancel = () => {
    setChangeConfirm({ open: false, message: '', apply: null });
  };

  const handleChangeConfirmContinue = () => {
    const { apply } = changeConfirm;
    setItems([]);
    if (typeof apply === 'function') apply();
    setChangeConfirm({ open: false, message: '', apply: null });
  };

  // Debounced vendor search
  const handleVendorSearch = useCallback((text) => {
    setVendorSearch(text);
    if (vendorDebounceRef.current) clearTimeout(vendorDebounceRef.current);
    if (!text || text.length < 2) {
      dispatch(setSearchByVendorDataAction([]));
      return;
    }
    vendorDebounceRef.current = setTimeout(() => {
      dispatch(getSearchByVendorAction({ searchString: text }));
    }, 400);
  }, [dispatch]);

  // Update location when header changes
  useEffect(() => {
    if (!isAllLocation) {
      setLocationId(headerLocationId);
    }
  }, [headerLocationId]);

  // When operating under All-Location, the <select> visually shows the first
  // option as selected while state stays empty — submit then fails with
  // "Please select a Location". Seed state from the first available location
  // once the list loads.
  useEffect(() => {
    if (!locationId && stocklocations.length > 0) {
      const firstValid = stocklocations.find(l => l.location_name !== 'Scrap');
      if (firstValid) setLocationId(String(firstValid.location_id));
    }
  }, [stocklocations, locationId]);

  // Pre-load opening stock products whenever location changes so "No Invoice" dropdown is ready
  useEffect(() => {
    if (locationId) loadOpeningStockProducts(locationId, '');
  }, [locationId, loadOpeningStockProducts]);

  const handleBarcodeScan = async (e) => {
    if (e.key !== 'Enter' || !barcodeScan.trim()) return;
    if (!supplierId) {
      setSnack({ open: true, msg: 'Please select a Vendor first', severity: 'warning' });
      return;
    }
    const result = await searchAndAddItem(supplierId, barcodeScan, locationId);
    if (result.success) {
      setBarcodeScan('');
    } else {
      setSnack({ open: true, msg: result.error, severity: 'error' });
    }
  };

  // Comprehensive front-end validation. Returns null if OK, or error string.
  const validatePayload = () => {
    if (!supplierId) return 'Please select a Vendor';
    if (!locationId) return 'Please select a Location';
    if (!returnDate || !moment(returnDate).isValid()) return 'Please pick a valid Return Date';
    if (moment(returnDate).isAfter(moment(), 'day')) return 'Return Date cannot be in the future';
    if (!Array.isArray(items) || items.length === 0) return 'Please add at least one item';

    // Track duplicate keys to reject within submit as well (defensive)
    const seenReceivingItemIds = new Set();
    // lot_id is globally unique across purchase + opening stock, so a single Set
    // de-dups serialized lots regardless of row origin.
    const seenSerialLotIds = new Set();
    const seenOpeningStockNonSerial = new Set();

    for (let idx = 0; idx < items.length; idx++) {
      const it = items[idx];
      const rowLabel = `Row ${idx + 1}`;

      // Basic required fields
      if (!it.item_id) return `${rowLabel}: product is not selected`;
      if (!it.name) return `${rowLabel}: product name is missing`;
      if (it.stock_type !== 'opening_stock' && it.stock_type !== 'purchase') {
        return `${rowLabel}: invalid stock type`;
      }

      // Numeric sanity checks
      const cost = Number(it.item_cost_price);
      if (!isFinite(cost) || cost < 0) return `${rowLabel}: invalid buying cost`;
      const qty = Number(it.quantity);
      if (!isFinite(qty) || qty <= 0) return `${rowLabel}: quantity must be greater than 0`;
      const gst = Number(it.gst || 0);
      if (!isFinite(gst) || gst < 0) return `${rowLabel}: invalid tax %`;

      // returnQuantity cap (max available to return)
      const max = Number(it.returnQuantity);
      if (isFinite(max) && max > 0 && qty > max) {
        return `${rowLabel}: quantity (${qty}) exceeds available (${max})`;
      }

      // Stock-type-specific rules
      if (it.stock_type === 'purchase') {
        if (!it.receiving_item_id) return `${rowLabel}: please select a product from an invoice`;
        if (!it.receiving_id) return `${rowLabel}: invoice link (receiving_id) missing`;
        if (!it.invoice_number) return `${rowLabel}: invoice number missing`;
      } else {
        // opening_stock
        if (it.receiving_item_id) return `${rowLabel}: opening-stock rows should not have receiving_item_id`;
      }

      // Serialized: require lots, qty must match lots.length
      if (it.is_serialized === 1) {
        if (!Array.isArray(it.lots) || it.lots.length === 0) {
          return `${rowLabel}: please select at least one serial/lot`;
        }
        if (it.lots.length !== qty) {
          return `${rowLabel}: quantity (${qty}) must match number of selected serials (${it.lots.length})`;
        }
        const seenLotIds = new Set();
        for (const l of it.lots) {
          if (!l || !l.lot_id) return `${rowLabel}: selected lot is missing lot_id`;
          if (seenLotIds.has(l.lot_id)) return `${rowLabel}: duplicate serial selected`;
          seenLotIds.add(l.lot_id);
        }
      }

      // Duplicate detection
      if (it.stock_type === 'purchase') {
        if (it.is_serialized === 1) {
          // Two different serials from the same receiving_item_id are legitimate.
          // De-dup across ALL purchase serialized rows by lot_id.
          for (const l of it.lots) {
            if (seenSerialLotIds.has(l.lot_id)) {
              return `${rowLabel}: serial/lot already added`;
            }
            seenSerialLotIds.add(l.lot_id);
          }
        } else {
          // Non-serialized: one row per receiving_item_id
          const key = it.receiving_item_id;
          if (seenReceivingItemIds.has(key)) {
            return `${rowLabel}: duplicate product from the same invoice (add once and set total qty)`;
          }
          seenReceivingItemIds.add(key);
        }
      } else {
        // Opening stock: uniqueness is by item+lot for serialized, by item for non-serialized
        if (it.is_serialized === 1) {
          for (const l of it.lots) {
            if (seenSerialLotIds.has(l.lot_id)) {
              return `${rowLabel}: serial/lot already added`;
            }
            seenSerialLotIds.add(l.lot_id);
          }
        } else {
          const key = `${it.item_id}`;
          if (seenOpeningStockNonSerial.has(key)) {
            return `${rowLabel}: duplicate opening-stock product (add once and set the total qty)`;
          }
          seenOpeningStockNonSerial.add(key);
        }
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
    // Synchronous guard: refs update immediately, state does not. A double-click
    // on Confirm Return previously fired two POSTs before React re-rendered the
    // disabled state, creating duplicate debit notes.
    if (submittingRef.current) return;
    submittingRef.current = true;

    // Defensive: re-validate right before firing the request
    const err = validatePayload();
    if (err) {
      submittingRef.current = false;
      setConfirmOpen(false);
      setSnack({ open: true, msg: err, severity: 'warning' });
      return;
    }
    setConfirmOpen(false);
    setSubmitting(true);

    // Calculate transaction totals
    const firstItem = items[0];
    const total_cost_price = items.reduce((sum, i) => sum + (i.item_cost_price * i.quantity), 0);
    const total_gst = items.reduce((sum, i) => sum + (i.item_cost_price * i.quantity * i.gst / 100), 0);
    const total_with_gst = total_cost_price + total_gst;
    const tcs_val = firstItem.tcs ? parseFloat(firstItem.tcs) || 0 : 0;
    const tds_val = firstItem.tds ? parseFloat(firstItem.tds) || 0 : 0;

    // Build invoice_number: exclude opening stock items, show only purchase invoice numbers
    const purchaseInvoiceNumbers = [...new Set(
      items.filter(i => i.stock_type !== 'opening_stock')
        .map(i => i.invoice_number || i.bill_number)
        .filter(Boolean)
    )];
    const allOpeningStock = items.every(i => i.stock_type === 'opening_stock');
    const invoiceNumberStr = allOpeningStock ? 'No Invoice' : purchaseInvoiceNumbers.join(', ');

    // Use first purchase item's receiving_id, or null if all opening stock
    const firstPurchaseItem = items.find(i => i.stock_type !== 'opening_stock');
    const headerReceivingId = firstPurchaseItem?.receiving_id || null;

    // Determine type: if any opening stock item exists, backend handles per-item
    const hasOpeningStock = items.some(i => i.stock_type === 'opening_stock');

    const payload = {
      company_id: parseInt(storage?.company_id),
      receiving_id: headerReceivingId,
      // B5: always use the UI-selected supplier. original_supplier_id is kept for
      // backend cross-reference of purchase rows but MUST NOT override the header.
      supplier_id: supplierId,
      original_supplier_id: firstItem.original_supplier_id || supplierId,
      location_id: locationId,
      trans_location: locationId,
      comment,
      reference: [
        reference,
        ...new Set(items.filter(i => i.stock_type !== 'opening_stock').map(i => i.bill_number).filter(Boolean))
      ].filter(Boolean).join(', '),
      invoice_number: invoiceNumberStr,
      invoice_date: returnDate.format('YYYY-MM-DD'),
      total: getGrandTotal(),
      // `amount` is consumed by the backend's supplierUnusedCreditsUpdate.
      amount: getGrandTotal(),
      type: allOpeningStock ? 'returnFromInventory' : 'returnFromPurchase',
      tax_types: firstItem.tax_types || '1',
      tcs: firstItem.tcs || '',
      tds: firstItem.tds || '',
      tcs_percent: firstItem.tcs_percent || '0%',
      tds_percent: firstItem.tds_percent || '0%',
      tds_id: firstItem.tds_id || null,
      sub_company_id: firstItem.sub_company_id || null,
      transactionEntryData: {
        total_cost_price,
        total_with_gst,
        gst_inter: total_gst,
        tcs_inter: tcs_val,
        tds_inter: tds_val,
        rounded_off: 0,
      },
      itemsData: items.map((item, idx) => ({
        item_id: item.item_id,
        name: item.name,
        is_serialized: item.is_serialized,
        lots: (item.lots || []).map(l => ({ lot_id: l.lot_id, lot_number: l.lot_number, quantity: 1, available_quantity: l.available_quantity })),
        received_quantity: item.quantity,
        receiving_item_id: item.receiving_item_id,
        receiving_id: item.receiving_id,
        invoice_date: item.invoice_date,
        quantity: item.quantity,
        ordered_quantity: item.ordered_quantity || item.received_quantity || item.quantity,
        received_ordered_quantity: item.ordered_quantity || item.received_quantity || item.quantity,
        receiving_quantity: item.quantity,
        return_quantity: item.return_quantity || 0,
        sub_total: item.sub_total,
        item_cost_price: item.item_cost_price,
        item_unit_price: item.item_unit_price,
        category: item.category || '',
        brand: item.brand || '',
        tax_category_id: item.tax_category_id,
        hsn_code: item.hsn_code || '',
        bill_number: item.bill_number,
        barcode: item.barcode || '',
        line: idx + 1,
        trans_location: locationId,
        stock_type: item.stock_type || 'purchase',
        payment_type: '',
      })),
    };

    dispatch(returnActions(
      payload,
      null,
      storage?.employee_id,
      locationId,
      async (response) => {
        setSubmitting(false);
        setSubmitted(true);
        setSnack({ open: true, msg: 'Purchase return created successfully', severity: 'success' });

        // Close the form first
        handleClose();

        // Then fetch PDF and open popup
        try {
          const debitnoteId = response?.debitnote_id;
          const returnId = response?.purchaseReturn;
          if (debitnoteId) {
            const pdfPayload = {
              id: returnId,
              type: 'D',
              mc_id: debitnoteId,
              sequence: payload.dbSequence,
            };
            dispatch(ManualSalesPurchase(pdfPayload, (pdfData) => {
              if (pdfData) {
                dispatch(setInvoiceTempAction(pdfData));
              }
              if (cnInvoiceFunction) cnInvoiceFunction();
            }));
          } else {
            if (cnInvoiceFunction) cnInvoiceFunction();
          }
        } catch (e) {
          console.error('PDF fetch failed:', e);
          if (cnInvoiceFunction) cnInvoiceFunction();
        }
      },
      () => {
        // onError: unlock so the user can retry after a failure
        submittingRef.current = false;
        setSubmitting(false);
      }
    ));
  };

  const filteredLocations = stocklocations.filter(l => l.location_name !== 'Scrap');

  return (
    <Card sx={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Purchase Return</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="How to use Purchase Return">
            <IconButton onClick={() => setHelpOpen(h => !h)} size="small">
              <HelpIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={handleClose}><CloseIcon /></IconButton>
        </Box>
      </Box>

      {/* Collapsible help panel */}

      <CardContent sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 3, }}>
        <Collapse in={helpOpen} timeout="auto" unmountOnExit>
          <Box sx={{ px: 3, py: 2, bgcolor: 'info.lighter', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Alert severity="info" variant="outlined" onClose={() => setHelpOpen(false)} sx={{ bgcolor: 'background.paper' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>How to use Purchase Return</Typography>

              <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>1. Quick scan (recommended)</Typography>
              <Typography variant="caption" component="div" sx={{ mb: 1, color: 'text.secondary' }}>
                • Select a Vendor and Location.<br/>
                • Scan or type the serial/lot number in the "Barcode / Lot Number" box and press Enter.<br/>
                • The row auto-fills with invoice, product, serial and qty. Works for both purchase items and opening stock (shown as "No Invoice").
              </Typography>

              <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>2. Manual add — purchase item</Typography>
              <Typography variant="caption" component="div" sx={{ mb: 1, color: 'text.secondary' }}>
                • Click the "+" button to add an empty row.<br/>
                • In the Invoice column, type/pick the vendor's invoice number.<br/>
                • Pick the product from the dropdown (scoped to that invoice).<br/>
                • For serialized items, select serial numbers (qty auto-matches).<br/>
                • For non-serialized items, enter the return quantity.
              </Typography>

              <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>3. Manual add — opening stock (no invoice)</Typography>
              <Typography variant="caption" component="div" sx={{ mb: 1, color: 'text.secondary' }}>
                • Click the "+" button.<br/>
                • You can skip the invoice and go directly to the Product column — it defaults to opening stock products.<br/>
                • Pick the product. The invoice column will show "No Invoice" automatically.<br/>
                • For serialized, select lots; for non-serialized, enter qty.
              </Typography>

              <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>4. Mixed returns</Typography>
              <Typography variant="caption" component="div" sx={{ mb: 1, color: 'text.secondary' }}>
                You can mix purchase items and opening stock items in one return. Each row is independent.
              </Typography>

              <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>Rules & tips</Typography>
              <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                • Vendor and Location are required for every return.<br/>
                • Scanned purchase items must belong to the selected vendor; opening stock can be returned against any vendor.<br/>
                • Serialized items: one lot = qty 1; the qty field auto-matches the number of selected lots.<br/>
                • Non-serialized items: qty is capped at available stock.<br/>
                • Changing vendor or location after adding items will clear the list (with confirmation).<br/>
                • On submit, a debit note is generated and ledger entries are posted automatically.
              </Typography>
            </Alert>
          </Box>
        </Collapse>
        {/* Form Header */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                label="Return Date"
                value={returnDate}
                onChange={(val) => setReturnDate(val)}
                maxDate={moment()}
                slotProps={{ textField: { fullWidth: true, size: 'small', variant: 'filled' } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              options={(vendors || []).filter(d => d.company_name && d.supplier_id)}
              getOptionLabel={(opt) => opt.company_name || ''}
              isOptionEqualToValue={(opt, val) => opt.supplier_id === val.supplier_id}
              value={vendors?.find(v => v.supplier_id === supplierId) || null}
              inputValue={vendorSearch}
              onInputChange={(e, val, reason) => {
                if (reason === 'input') handleVendorSearch(val);
                if (reason === 'clear') { handleVendorSearch(''); setSupplierId(null); }
              }}
              onChange={(e, val) => {
                confirmIfItemsExist('Changing vendor will clear return items.', () => {
                  setSupplierId(val?.supplier_id || null);
                  setVendorSearch(val?.company_name || '');
                  loadVendorBills(val?.supplier_id || null, locationId);
                });
              }}
              renderOption={(props, option, { index }) => (
                <li {...props} key={`vendor-${option.supplier_id}-${index}`}>{option.company_name}</li>
              )}
              renderInput={(params) => (
                <TextField {...params} label="Vendor *" variant="filled" size="small"
                  placeholder="Type to search..." />
              )}
              noOptionsText={vendorSearch.length < 2 ? 'Type 2+ chars to search' : 'No vendors found'}
              filterOptions={(x) => x}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              variant="filled"
              label="Location *"
              value={locationId}
              onChange={(e) => {
                const newLoc = e.target.value;
                confirmIfItemsExist('Changing location will clear return items.', () => {
                  setLocationId(newLoc);
                  if (supplierId) loadVendorBills(supplierId, newLoc);
                });
              }}
              SelectProps={{ native: true }}
            >
              {filteredLocations.map(loc => (
                <option key={loc.location_id} value={loc.location_id}>{loc.location_name}</option>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField fullWidth size="small" variant="filled" label="Reference" value={reference} onChange={(e) => setReference(e.target.value)} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth size="small" variant="filled" label="Comments" value={comment} onChange={(e) => setComment(e.target.value)} multiline rows={1} />
          </Grid>
        </Grid>

        {/* Barcode Scan Toolbar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Return Items</Typography>
          <Box sx={{ flex: 1 }} />
          <TextField
            size="small"
            placeholder="Barcode / Lot Number — press Enter"
            value={barcodeScan}
            onChange={(e) => setBarcodeScan(e.target.value)}
            onKeyDown={handleBarcodeScan}
            disabled={scanning || !supplierId}
            sx={{ width: 300 }}
            variant="outlined"
            InputProps={{
              endAdornment: scanning ? <CircularProgress size={18} /> : null,
            }}
          />
          <Tooltip title="Add item manually">
            <IconButton size="small" color="primary" onClick={addEmptyRow}
              sx={{ border: '1px solid', borderColor: 'primary.main' }}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Items Table */}
        <ReturnItemsTable
          items={items}
          onUpdateQty={updateItemQty}
          onRemove={removeItem}
          onUpdateField={updateField}
          vendorBills={vendorBills}
          billProducts={billProducts}
          openingStockProducts={openingStockProducts}
          onBillSelect={selectBillForRow}
          onProductSelect={selectProductForRow}
          onInvoiceSearch={searchInvoices}
          hasLocation={Boolean(locationId)}
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

      {/* Footer Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button variant="outlined" onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleReturnClick}
          disabled={submitting || submitted || confirmOpen || items.length === 0}
        >
          {submitting ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
          Return
        </Button>
      </Box>

      {/* Vendor/Location change-clears-items confirmation */}
      <Dialog open={changeConfirm.open} onClose={handleChangeConfirmCancel}>
        <DialogTitle>Discard added items?</DialogTitle>
        <DialogContent>
          <DialogContentText>{changeConfirm.message}</DialogContentText>
          <DialogContentText sx={{ mt: 1 }}>
            This will clear {items.length} added item(s). Continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleChangeConfirmCancel}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleChangeConfirmContinue}>
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Purchase Return</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to return {items.length} item(s) with a total of &#8377; {getGrandTotal().toFixed(2)}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={submitting}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {submitting ? 'Submitting…' : 'Confirm Return'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))} variant="filled">{snack.msg}</Alert>
      </Snackbar>
    </Card>
  );
}
