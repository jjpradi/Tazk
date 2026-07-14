import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Card, CardContent, Grid, TextField, Typography, Button, Autocomplete,
  CircularProgress, Snackbar, Alert, IconButton,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getSearchByCustomerSupplierAction, setSearchByCustomerSupplierDataAction } from 'redux/actions/customer_actions';
import { getSchemesLedgerAction, ManualSalesPurchase } from 'redux/actions/manualNotes_actions';
import { setInvoiceTempAction } from 'redux/actions/vendor_actions';
import ManualNotesService from '../../../../services/manualNotes_services';
import { GetTdsTaxes } from 'redux/actions/purchase_actions';
import { createLedgerAction } from 'redux/actions/ledger_actions';
import NewLedger from 'components/Ledger';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import useManualDebitNote from './useManualDebitNote';
import DebitNoteItemsTable from './DebitNoteItemsTable';
import DebitNoteSummary from './DebitNoteSummary';
import ItcClassificationControl from 'components/gst/ItcClassificationControl';
import { gstItcBlockReasonListAction } from 'redux/actions/gstItcBlockReason.actions';

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export default function ManualDebitNote({ handleClose, cnInvoiceFunction, onRefreshList, from, status, editData }) {
  const dispatch = useDispatch();
  const storage = getsessionStorage();
  const { headerLocationId } = useContext(CreateNewButtonContext);

  // Redux state
  const vendors = useSelector((state) => state.customerReducer?.customerAsCompany) || [];
  const stocklocations = useSelector((state) => state.stockLocationReducer?.stocklocation) || [];
  const schemesLedgers = useSelector((state) => state.manualNoteReducer?.schemesLedger) || [];
  const tdsRates = useSelector((state) => state.purchasesReducer?.tds_taxrate) || [];
  const itcBlockReasons = useSelector((state) => state.gstItcBlockReasonReducer?.list) || [];

  const isAllLocation = !headerLocationId || headerLocationId === 'null' || headerLocationId === '0';

  // Form state
  const [noteDate, setNoteDate] = useState(moment());
  const [supplierId, setSupplierId] = useState(editData[0]?.supplier_id || null);
  const [supplierDetails, setSupplierDetails] = useState(null);
  const [vendorSearch, setVendorSearch] = useState('');
  const [locationId, setLocationId] = useState(isAllLocation ? '' : headerLocationId);
  const [reference, setReference] = useState('');
  const [comments, setComments] = useState('');
  const [note, setNote] = useState('');
  const [purpose, setPurpose] = useState('');
  const [tdsConfig, setTdsConfig] = useState(null);
  const [manualTdsAmount, setManualTdsAmount] = useState('');
  const [roundOff, setRoundOff] = useState(0);
  const [editRoundOff, setEditRoundOff] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'info' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ledgerCreateOpen, setLedgerCreateOpen] = useState(false);
  // Vendor-side ITC classification (no RCM on notes — RCM applies to the original invoice).
  const [itcClassification, setItcClassification] = useState({
    itc_eligible: 1,
    itc_block_reason_id: null,
  });
  const vendorDebounceRef = useRef(null);
  const stock_ledger_list = useSelector((state) => state.stockLedgerReducer?.stock_ledger_list) || [];

  const {
    items, addRow, removeRow, updateItem,
    untaxedTotal, totalGst, subTotal, halfGst, cgstAmount, sgstAmount, showIGST, setShowIGST,
    calculateTds, calculateRoundOff, calculateGrandTotal,
    validate, isValid, buildPayload,
  } = useManualDebitNote({editData});
  
  // Load schemes ledgers and TDS rates on mount
  useEffect(() => {
    dispatch(getSchemesLedgerAction({ type: 'Debit' }));
    dispatch(GetTdsTaxes('list','null'));
    if (!itcBlockReasons || itcBlockReasons.length === 0) {
      dispatch(gstItcBlockReasonListAction());
    }
  }, []);

  // Update location when header changes
  useEffect(() => {
    if (!isAllLocation) setLocationId(headerLocationId);
  }, [headerLocationId]);

  // Auto-calculate round-off when items/TDS change
  useEffect(() => {
    if (!editRoundOff) {
      const tdsAmount = calculateTds(tdsConfig, manualTdsAmount);
      setRoundOff(calculateRoundOff(tdsAmount));
    }
  }, [items, tdsConfig, manualTdsAmount, editRoundOff]);

  // Selected ledger IDs (to filter out from subsequent rows)
  const selectedLedgerIds = items.map(i => i.schemesLedgerId).filter(Boolean);
  useEffect(() => {
  if (editData?.[0]?.supplier_id && vendors.length > 0) {
    const supplier = vendors.find(
      v => v.supplier_id === editData[0].supplier_id
    );

    if (supplier) {
      setSupplierId(supplier.supplier_id);
      setSupplierDetails(supplier);
      setVendorSearch(supplier.company_name);
    }
  }
  }, [vendors, editData]);
  // Create new ledger
  const handleLedgerSubmit = async (data) => {
    try {
      const id = stock_ledger_list[0]?.sequence_id;
      const current_seq = stock_ledger_list[0]?.current_seq;
      await dispatch(createLedgerAction(data, null, null, id, { current_seq }));
      setLedgerCreateOpen(false);
      // Refresh schemes ledger list to include the newly created one
      dispatch(getSchemesLedgerAction({ type: 'Debit' }));
      setSnack({ open: true, msg: 'Ledger created successfully', severity: 'success' });
    } catch (e) {
      console.error('Ledger creation failed:', e);
      setSnack({ open: true, msg: 'Failed to create ledger', severity: 'error' });
    }
  };

  // Debounced vendor search
  const handleVendorSearch = useCallback((text) => {
    setVendorSearch(text);
    if (vendorDebounceRef.current) clearTimeout(vendorDebounceRef.current);
    if (!text || text.length < 2) {
      dispatch(setSearchByCustomerSupplierDataAction([]));
      return;
    }
    vendorDebounceRef.current = setTimeout(() => {
      dispatch(getSearchByCustomerSupplierAction({ searchString: text, type: 'supplier' }));
    }, 400);
  }, [dispatch]);

  const tdsAmount = calculateTds(tdsConfig, manualTdsAmount);
  const grandTotal = calculateGrandTotal(tdsAmount, roundOff);

  // Validation + confirmation
  const handleSubmitClick = () => {
    if (!supplierId) { setSnack({ open: true, msg: 'Please select a Vendor', severity: 'warning' }); return; }
    if (!locationId) { setSnack({ open: true, msg: 'Please select a Location', severity: 'warning' }); return; }
    const errors = validate();
    if (errors.length > 0) { setSnack({ open: true, msg: errors[0], severity: 'warning' }); return; }
    setConfirmOpen(true);
  };

  // Actual submission
  const handleSubmit = async () => {
    setConfirmOpen(false);
    setSubmitting(true);

    const payload = buildPayload({
      supplierId,
      locationId,
      date: noteDate.format('DD/MM/YYYY'),
      reference, comments, note, purpose,
      userName: storage?.first_name || storage?.username || 'User',
      tdsConfig, manualTdsAmount, roundOff,
      supplierDetails,
      itcClassification,
    });

    try {
      const res = await ManualNotesService.create(payload);
      const noteId = res.data?.created_note_id;

      setSubmitting(false);
      setSubmitted(true);
      setSnack({ open: true, msg: 'Debit Note created successfully', severity: 'success' });
      handleClose();

      if (noteId) {
        // Fetch PDF then open popup — same pattern as Purchase Return
        dispatch(ManualSalesPurchase({ id: null, type: 'D', mc_id: noteId }, (pdfData) => {
          if (pdfData) dispatch(setInvoiceTempAction(pdfData));
          if (cnInvoiceFunction) cnInvoiceFunction();
        }));
      } else {
        if (onRefreshList) onRefreshList();
      }
    } catch (err) {
      setSubmitting(false);
      const msg = err?.response?.data?.message || 'Failed to create debit note';
      setSnack({ open: true, msg, severity: 'error' });
    }
  };

  const filteredLocations = stocklocations.filter(l => l.location_name !== 'Scrap');

  return (
    <Card sx={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Manual Debit Note</Typography>
        <IconButton onClick={handleClose}><CloseIcon /></IconButton>
      </Box>

      <CardContent sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {/* Form Header */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker label="Date" value={noteDate} onChange={(v) => setNoteDate(v)} maxDate={moment()}
                slotProps={{ textField: { fullWidth: true, size: 'small', variant: 'filled' } }} />
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
                if (reason === 'clear') { handleVendorSearch(''); setSupplierId(null); setSupplierDetails(null); }
              }}
              onChange={(e, val) => {
                setSupplierId(val?.supplier_id || null);
                setSupplierDetails(val || null);
                setVendorSearch(val?.company_name || '');
              }}
              renderOption={(props, option, { index }) => (
                <li {...props} key={`v-${option.supplier_id}-${index}`}>{option.company_name}</li>
              )}
              renderInput={(params) => (
                <TextField {...params} label="Vendor *" variant="filled" size="small" placeholder="Type to search..." />
              )}
              noOptionsText={vendorSearch.length < 2 ? 'Type 2+ chars' : 'No vendors found'}
              filterOptions={(x) => x}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField select fullWidth size="small" variant="filled" label="Location *"
              value={locationId} onChange={(e) => setLocationId(e.target.value)}
              SelectProps={{ native: true }}>
              <option value="">Select location…</option>
              {filteredLocations.map(loc => (
                <option key={loc.location_id} value={loc.location_id}>{loc.location_name}</option>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField fullWidth size="small" variant="filled" label="Reference" value={reference} onChange={(e) => setReference(e.target.value)} />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth size="small" variant="filled" label="Comments" value={comments} onChange={(e) => setComments(e.target.value)} />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth size="small" variant="filled" label="Purpose" value={note} onChange={(e) => setNote(e.target.value)} />
          </Grid>

          {/* GST / ITC classification — vendor-side debit note. No RCM toggle:
              reverse charge applies to the original invoice, not the adjustment. */}
          <Grid size={{ xs: 12, md: 12 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                GST classification:
              </Typography>
              <ItcClassificationControl
                variant="inline"
                value={itcClassification}
                onChange={(v) => setItcClassification((prev) => ({ ...prev, ...v }))}
                reasons={itcBlockReasons || []}
                showRcm={false}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Items Table */}
        <DebitNoteItemsTable
          items={items}
          onUpdate={updateItem}
          onRemove={removeRow}
          onAdd={addRow}
          schemesLedgers={schemesLedgers}
          selectedLedgerIds={selectedLedgerIds}
          onCreateLedger={() => setLedgerCreateOpen(true)}
        />

        {/* Summary */}
        <DebitNoteSummary
          untaxedTotal={untaxedTotal}
          totalGst={totalGst}
          halfGst={halfGst}
          cgstAmount={cgstAmount}
          sgstAmount={sgstAmount}
          showIGST={showIGST}
          onToggleIGST={setShowIGST}
          tdsConfig={tdsConfig}
          onTdsChange={setTdsConfig}
          manualTdsAmount={manualTdsAmount}
          onManualTdsChange={setManualTdsAmount}
          tdsRates={tdsRates}
          roundOff={roundOff}
          onRoundOffChange={setRoundOff}
          editRoundOff={editRoundOff}
          onToggleRoundOffEdit={() => setEditRoundOff(prev => !prev)}
          grandTotal={grandTotal}
        />
      </CardContent>

      {/* Footer */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button variant="outlined" onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmitClick}
          disabled={submitting || submitted || !isValid}>
          {submitting ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
          Create Debit Note
        </Button>
      </Box>

      {/* New Ledger Dialog */}
      <Dialog open={ledgerCreateOpen} onClose={() => setLedgerCreateOpen(false)} maxWidth="md" fullWidth>
        <Card sx={{ m: 3, p: 2 }}>
          <NewLedger
            handleClose={() => setLedgerCreateOpen(false)}
            handleSubmit={handleLedgerSubmit}
            ledgerStatus="create"
            from="D"
          />
        </Card>
      </Dialog>

      {/* Confirmation */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Debit Note</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Create debit note for ₹{grandTotal.toFixed(2)}? This will create accounting entries.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>Confirm</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))} variant="filled">{snack.msg}</Alert>
      </Snackbar>
    </Card>
  );
}
