import { useState, useCallback, useMemo, useEffect } from 'react';

// Consistent 2-decimal rounding to avoid floating point issues
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const emptyItem = () => ({
  _id: Date.now() + Math.random(),
  schemesLedgerId: '',
  ledgerName: '',
  description: '',
  hsn_code: '',
  amount: '',
  gst: false,
  gst_id: '',
  gst_amount: 0,
  sub_total: 0,
  schemes_amount: 0,
});

export default function useManualDebitNote({editData}) {
useEffect(() => {
  if (!editData) return;
  const isArray = Array.isArray(editData);
  const data = isArray ? editData[0] : editData;
  if (data?.manualNotes && data.manualNotes.length > 0) {
    const mappedItems = data.manualNotes.map(item => ({
      _id: Date.now() + Math.random(),
      schemesLedgerId: item.schemesLedgerId || '',
      ledgerName: item.ledgerName || '',
      description: item.description || '',
      hsn_code: item.hsn_code || '',
      amount: item.amount?.toString() || '',
      gst: !!item.gst_id,
      gst_id: item.gst_id || '',
      gst_amount: item.gst_amount || 0,
      sub_total: item.sub_total || 0,
      schemes_amount: item.schemes_amount || item.amount || 0,
    }));

    setItems(mappedItems);
  }
  else if (data) {
    const singleItem = {
      _id: Date.now() + Math.random(),
      schemesLedgerId: data.schemesLedgerId || '',
      ledgerName: data.name || '',
      description: data.description || data.name || '',
      hsn_code: data.hsn_code || '',
      amount: data.amount?.toString() || '',
      gst: !!data.gst_id,
      gst_id: data.gst_id || '',
      gst_amount: data.gst_amount || 0,
      sub_total: data.amount || 0,
      schemes_amount: data.amount || 0,
    };
    setItems([singleItem]);
  }

}, [editData]);
  const [items, setItems] = useState([emptyItem()]);
  const [showIGST, setShowIGST] = useState(false);

  // Add a new empty row
  const addRow = useCallback(() => {
    setItems(prev => [...prev, emptyItem()]);
  }, [showIGST]);

  // Remove a row (minimum 1 row)
  const removeRow = useCallback((index) => {
    setItems(prev => prev.length <= 1 ? prev : prev.filter((_, i) => i !== index));
  }, []);

  // Update a field in a row and recalculate
  const updateItem = useCallback((index, field, value) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };

      // Auto-fill description when ledger selected
      if (field === 'schemesLedgerId' && typeof value === 'object') {
        updated.schemesLedgerId = value.id || value.ledger_id || '';
        updated.ledgerName = value.name || '';
        updated.description = value.description || value.name || '';
      }

      // Recalculate when amount or GST changes
      if (['amount', 'gst', 'gst_id'].includes(field)) {
        const amt = parseFloat(updated.amount) || 0;
        const gstRate = updated.gst && updated.gst_id ? parseFloat(updated.gst_id) : 0;
        if (updated.gst && gstRate > 0) {
          if (showIGST) {
            updated.gst_amount = round2((amt * gstRate) / 100);
          } else {
            const halfTax = round2((amt * (gstRate / 2)) / 100);
            updated.gst_amount = round2(halfTax + halfTax);
          }
        } else {
          updated.gst_amount = 0;
        }
        updated.sub_total = round2(amt + updated.gst_amount);
        updated.schemes_amount = round2(amt);
      }

      // Reset GST fields when toggled off
      if (field === 'gst' && !value) {
        updated.gst_id = '';
        updated.gst_amount = 0;
        updated.sub_total = round2(parseFloat(updated.amount) || 0);
      }

      return updated;
    }));
  }, [showIGST]);

  // Totals
  const untaxedTotal = useMemo(() => {
    return round2(items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0));
  }, [items]);

  const totalGst = useMemo(() => {
    return round2(items.reduce((sum, i) => sum + (i.gst_amount || 0), 0));
  }, [items]);

  const subTotal = useMemo(() => {
    return round2(items.reduce((sum, i) => sum + (i.sub_total || 0), 0));
  }, [items]);

  // GST split for display and total calculation
  const cgstAmount = useMemo(() => (showIGST ? 0 : round2(totalGst / 2)), [showIGST, totalGst]);
  const sgstAmount = useMemo(() => (showIGST ? 0 : round2(totalGst / 2)), [showIGST, totalGst]);
  const halfGst = cgstAmount;
  const effectiveGstTotal = useMemo(
    () => (showIGST ? round2(totalGst) : round2(cgstAmount + sgstAmount)),
    [showIGST, totalGst, cgstAmount, sgstAmount]
  );

  // TDS calculation
  const calculateTds = useCallback((tdsConfig, manualTdsAmount) => {
    if (!tdsConfig) return 0;
    if (tdsConfig.category === 'Others') {
      return round2(parseFloat(manualTdsAmount) || 0);
    }
    const rate = parseFloat(tdsConfig.tds_rate) || 0;
    return round2((untaxedTotal * rate) / 100);
  }, [untaxedTotal]);

  // Round-off calculation
  const calculateRoundOff = useCallback((tdsAmount) => {
    const total = round2(untaxedTotal + effectiveGstTotal - tdsAmount);
    const rounded = Math.round(total);
    return round2(rounded - total);
  }, [untaxedTotal, effectiveGstTotal]);

  // Grand total
  const calculateGrandTotal = useCallback((tdsAmount, roundOff) => {
    return round2(untaxedTotal + effectiveGstTotal - tdsAmount + roundOff);
  }, [untaxedTotal, effectiveGstTotal]);

  // Validation
  const validate = useCallback(() => {
    const errors = [];
    items.forEach((item, idx) => {
      if (!item.schemesLedgerId) errors.push(`Row ${idx + 1}: Schemes Ledger required`);
      if (!item.amount || parseFloat(item.amount) <= 0) errors.push(`Row ${idx + 1}: Amount required`);
      if (item.gst && !item.gst_id) errors.push(`Row ${idx + 1}: GST percentage required`);
      if (item.gst_id && item.hsn_code && !/^99\d{4}$/.test(item.hsn_code)) {
        errors.push(`Row ${idx + 1}: HSN/SAC must be 6-digit service code (99XXXX)`);
      }
    });
    return errors;
  }, [items]);

  // Check if form is valid for submit button
  const isValid = useMemo(() => {
    return items.every(item =>
      item.schemesLedgerId &&
      item.amount && parseFloat(item.amount) > 0 &&
      (!item.gst || item.gst_id) &&
      (!item.hsn_code || !item.gst || /^99\d{4}$/.test(item.hsn_code))
    );
  }, [items]);

  // Build submission payload (matches existing manualNotesCreationAction format)
  const buildPayload = useCallback(({
    supplierId, locationId, date, reference, comments, note, purpose,
    tdsConfig, manualTdsAmount, roundOff, supplierDetails, userName,
    itcClassification,
  }) => {
    const tdsAmount = calculateTds(tdsConfig, manualTdsAmount);
    const grandTotal = calculateGrandTotal(tdsAmount, roundOff);

    // Use first item's GST and ledger for the main record (backward compat)
    const firstItem = items[0];
    const mainGstAmount = round2(totalGst);
    const mainGstId = firstItem.gst ? firstItem.gst_id : 0;

    return {
      supplier_details: supplierDetails || null,
      supplier_id: supplierId,
      customer_id: null,
      type: 'D',
      location_id: locationId,
      date,
      Reference: reference || null,
      comments: comments || null,
      note: note || null,
      purpose: purpose || null,
      amount: grandTotal,
      gst_amount: mainGstAmount,
      gst_id: mainGstId,
      hsn_code: firstItem.hsn_code || '',
      schemesLedgerId: firstItem.schemesLedgerId,
      description: firstItem.description || '',
      schemes_amount: untaxedTotal,
      tds_amount: tdsAmount,
      tds_id: tdsConfig ? parseFloat(tdsConfig.id) : null,
      tds_percent: tdsConfig ? `${tdsConfig.tds_rate}%` : null,
      rounded_off: roundOff,
      timelineData: JSON.stringify([`Created by ${userName || 'User'}`]),
      // Pagination params needed by backend searchCredit after insert
      pageCount: 0,
      numPerPage: 20,
      searchString: '',
      from: '2024-01-01',
      to: '2030-12-31',
      noteType: '',
      minValue: '',
      maxValue: '',
      // Multi-item data for backend
      manualNotes: items.map(item => ({
        schemesLedgerId: item.schemesLedgerId,
        ledgerName: item.ledgerName,
        description: item.description,
        hsn_code: item.hsn_code,
        amount: parseFloat(item.amount) || 0,
        gst: item.gst,
        gst_id: item.gst_id,
        gst_amount: item.gst_amount,
        sub_total: item.sub_total,
        schemes_amount: item.schemes_amount,
      })),
      // ITC classification (header-level, vendor-side note only). Backend
      // (manual_note.model.js:insertManualNotesPromise) unwraps body.gst and
      // writes the fields to manual_credit_debit_entry when supplier_id is set.
      gst: itcClassification
        ? {
            itc_eligible: itcClassification.itc_eligible === 0 ? 0 : 1,
            itc_block_reason_id: itcClassification.itc_block_reason_id != null
              ? Number(itcClassification.itc_block_reason_id) : null,
          }
        : undefined,
    };
  }, [items, totalGst, untaxedTotal, calculateTds, calculateGrandTotal]);

  return {
    items, addRow, removeRow, updateItem,
    untaxedTotal, totalGst, subTotal, halfGst, cgstAmount, sgstAmount, showIGST, setShowIGST,
    calculateTds, calculateRoundOff, calculateGrandTotal,
    validate, isValid, buildPayload,
  };
}
