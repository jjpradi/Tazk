import { useState, useCallback, useRef } from 'react';
import purchaseService from '../../../../services/purchases_services';

// Sentinel constant identifying the "No Invoice" (opening stock) option in the invoice dropdown
export const OPENING_STOCK_INVOICE = 'No Invoice';

export default function usePurchaseReturn() {
  const [items, setItems] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [vendorBills, setVendorBills] = useState([]);
  const [billProducts, setBillProducts] = useState({}); // { invoice_number: [products] }
  const [openingStockProducts, setOpeningStockProducts] = useState([]);

  const invoiceDebounceRef = useRef(null);
  const currentSupplierId = useRef(null);
  const currentLocationId = useRef(null);
  const billProductsRef = useRef({});

  // Called when vendor changes — reset state, store IDs for later searches
  const loadVendorBills = useCallback((supplierId, locationId) => {
    currentSupplierId.current = supplierId;
    currentLocationId.current = locationId;
    setVendorBills([]);
    setBillProducts({});
    billProductsRef.current = {};
    if (!supplierId) return;
    fetchInvoices(supplierId, locationId, '');
    // Also pre-load opening stock products so they are ready for manual + flow
    loadOpeningStockProducts(locationId, '');
  }, []);

  // Fetch vendor invoices (top 20)
  const fetchInvoices = useCallback(async (supplierId, locationId, searchText) => {
    try {
      const res = await purchaseService.getAllVendorUnreturnedItems({
        supplier_id: supplierId,
        location_id: locationId || null,
        search_invoice: searchText || '',
        limit: 20,
      });
      const allItems = res.data || [];

      const invoiceMap = {};
      allItems.forEach(item => {
        const invNo = item.invoice_number || item.bill_number;
        if (!invoiceMap[invNo]) {
          invoiceMap[invNo] = {
            invoice_number: invNo,
            bill_number: item.bill_number,
            receiving_id: item.receiving_id,
            invoice_date: item.invoice_date,
          };
        }
      });
      setVendorBills(Object.values(invoiceMap));

      const prodMap = { ...billProductsRef.current };
      allItems.forEach(item => {
        const invNo = item.invoice_number || item.bill_number;
        if (!prodMap[invNo]) prodMap[invNo] = [];
        else if (prodMap[invNo].find(p => p.receiving_item_id === item.receiving_item_id)) return;
        prodMap[invNo].push(item);
      });
      billProductsRef.current = prodMap;
      setBillProducts(prodMap);
    } catch (err) {
      console.error('Failed to load vendor invoices:', err);
    }
  }, []);

  // Fetch opening stock products at the current location
  const loadOpeningStockProducts = useCallback(async (locationId, searchText) => {
    try {
      const res = await purchaseService.getOpeningStockProducts({
        location_id: locationId || null,
        search: searchText || '',
      });
      setOpeningStockProducts(res.data || []);
    } catch (err) {
      console.error('Failed to load opening stock products:', err);
      setOpeningStockProducts([]);
    }
  }, []);

  // Debounced invoice search
  const searchInvoices = useCallback((searchText) => {
    if (invoiceDebounceRef.current) clearTimeout(invoiceDebounceRef.current);
    if (!currentSupplierId.current) return;
    invoiceDebounceRef.current = setTimeout(() => {
      fetchInvoices(currentSupplierId.current, currentLocationId.current, searchText);
    }, 400);
  }, [fetchInvoices]);

  // Check if an item is a duplicate of an existing one.
  // For SERIALIZED items: match by lot_id — two different serials from the same
  // receiving_item_id are NOT duplicates (B2).
  // For NON-SERIALIZED: match by receiving_item_id (purchase) or item_id (opening stock).
  const isDuplicate = useCallback((existingItems, incoming) => {
    const isSerialized = incoming.is_serialized === 1;
    if (isSerialized) {
      if (!incoming.lot_id) return null;
      return existingItems.find(d => d.is_serialized === 1 && d.lot_id === incoming.lot_id);
    }
    // Non-serialized
    if (incoming.stock_type === 'opening_stock') {
      return existingItems.find(d =>
        d.stock_type === 'opening_stock' && d.item_id === incoming.item_id
      );
    }
    return existingItems.find(d =>
      d.stock_type !== 'opening_stock' && d.receiving_item_id === incoming.receiving_item_id
    );
  }, []);

  // Barcode/lot scan — auto-find and add via unified scanLotForReturn endpoint.
  // Also used by manual serial entry to validate+auto-switch invoice.
  const searchAndAddItem = useCallback(async (supplierId, searchText, locationId) => {
    if (!supplierId) return { success: false, error: 'Please select a vendor first' };
    if (!locationId) return { success: false, error: 'Please select a location first' };
    const term = (searchText || '').trim();
    if (!term) return { success: false, error: 'Please enter a lot number' };

    setScanning(true);
    try {
      const res = await purchaseService.scanLotForReturn({
        search: term,
        location_id: locationId,
      });
      const rows = res.data || [];

      if (rows.length === 0) {
        setScanning(false);
        return { success: false, error: `Lot "${term}" is not available` };
      }

      const item = rows[0];

      // B1: If it's a purchase lot, vendor must match the selected vendor.
      // Opening stock has no vendor link so it's always allowed.
      if (item.stock_type !== 'opening_stock') {
        const lotVendor = Number(item.original_supplier_id);
        const selected = Number(supplierId);
        if (lotVendor && lotVendor !== selected) {
          setScanning(false);
          return {
            success: false,
            error: `Lot "${term}" belongs to a different vendor. Please change the vendor or scan a lot that belongs to the selected vendor.`,
          };
        }
      }

      const built = buildItemFromScanResult(item);

      // Duplicate check
      const dup = isDuplicate(items, built);
      if (dup) {
        setScanning(false);
        const label = built.stock_type === 'opening_stock' ? 'Opening Stock' : `invoice ${built.invoice_number}`;
        return { success: false, error: `"${built.name}" from ${label} is already added` };
      }

      setItems(prev => [...prev, built]);
      setScanning(false);
      return { success: true };
    } catch (err) {
      console.error('Scan error:', err);
      setScanning(false);
      return { success: false, error: 'Error while searching lot' };
    }
  }, [items, isDuplicate]);

  // When user selects a product from product dropdown (manual +)
  const selectProductForRow = useCallback(async (index, product) => {
    // If the product came from the opening-stock list, treat it as opening stock.
    // (Products from the bill-specific list have a receiving_item_id; opening-stock products don't.)
    const isOpeningStock = product.stock_type === 'opening_stock' || !product.receiving_item_id;
    // Ensure the product carries the flag before build
    const normalized = { ...product, stock_type: isOpeningStock ? 'opening_stock' : 'purchase' };
    const built = buildItemFromProduct(normalized);

    // If serialized, fetch available lots
    let availableLots = [];
    if (Number(product.is_serialized) === 1) {
      try {
        const lotPayload = isOpeningStock
          ? { item_id: product.item_id, location_id: currentLocationId.current }
          : { receiving_item_id: product.receiving_item_id };
        const res = await purchaseService.getItemLotsForReturn(lotPayload);
        availableLots = res.data || [];
      } catch (e) {
        console.error('Failed to load lots:', e);
      }
    }

    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      return { ...item, ...built, _isManual: true, availableLots };
    }));
  }, []);

  // When user selects an invoice (or "No Invoice") for a manual row
  const selectBillForRow = useCallback((index, invoiceNumber) => {
    const isOpeningStock = invoiceNumber === OPENING_STOCK_INVOICE;
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      return {
        ...item,
        invoice_number: invoiceNumber,
        stock_type: isOpeningStock ? 'opening_stock' : 'purchase',
        // Reset product-related state when invoice changes
        receiving_item_id: null,
        receiving_id: null,
        item_id: null,
        name: '',
        item_cost_price: 0,
        item_unit_price: 0,
        tax_category_id: null,
        gst: 0,
        hsn_code: '',
        is_serialized: 0,
        lots: [],
        availableLots: [],
        lot_id: null,
        quantity: 1,
        returnQuantity: 999,
        sub_total: 0,
      };
    }));
  }, []);

  // Manual serial input — validates serial belongs to selected invoice OR auto-switches invoice.
  // Returns { success, error, switched } — switched=true means invoice was auto-switched.
  const enterSerialForRow = useCallback(async (index, serialText) => {
    const term = (serialText || '').trim();
    if (!term) return { success: false, error: 'Please enter a serial number' };
    if (!currentLocationId.current) return { success: false, error: 'Please select a location first' };

    try {
      const res = await purchaseService.scanLotForReturn({
        search: term,
        location_id: currentLocationId.current,
      });
      const rows = res.data || [];
      if (rows.length === 0) {
        return { success: false, error: `Lot "${term}" is not available` };
      }
      const scanned = rows[0];

      // Vendor match check for purchase lots
      if (scanned.stock_type !== 'opening_stock' && currentSupplierId.current) {
        const lotVendor = Number(scanned.original_supplier_id);
        const selected = Number(currentSupplierId.current);
        if (lotVendor && lotVendor !== selected) {
          return {
            success: false,
            error: `Lot "${term}" belongs to a different vendor.`,
          };
        }
      }

      const built = buildItemFromScanResult(scanned);

      // Auto-switch invoice for the row (Q6: case (b) — switch invoice)
      setItems(prev => prev.map((item, i) => (i !== index ? item : { ...built, _isManual: true })));
      return { success: true, switched: true };
    } catch (err) {
      console.error('Serial lookup error:', err);
      return { success: false, error: 'Error while validating serial' };
    }
  }, []);

  // Returns a clamp-notice object when the requested quantity had to be
  // adjusted (decimal → int, < 0 → 0, > max → max). The caller can surface a
  // toast so users understand why the number jumped.
  const updateItemQty = useCallback((index, qty) => {
    let notice = null;
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      if (item.is_serialized === 1) return item; // qty locked to lots.length
      const raw = Number(qty);
      const rawSafe = Number.isFinite(raw) ? raw : 0;
      // Purchase Return qty is always a whole count. Decimals sneak in from
      // paste / ⇑⇓ spinbutton on some locales — round down to integer.
      const rounded = Math.floor(rawSafe);
      const max = Number.isFinite(item.returnQuantity) ? item.returnQuantity : Infinity;
      const clampedHigh = rounded > max;
      const clampedLow = rounded < 0;
      const newQty = Math.max(0, Math.min(rounded, max));
      if (rawSafe !== rounded) {
        notice = { type: 'integer', original: rawSafe, adjusted: newQty };
      } else if (clampedHigh) {
        notice = { type: 'max', original: rawSafe, adjusted: newQty, max };
      } else if (clampedLow) {
        notice = { type: 'min', original: rawSafe, adjusted: newQty };
      }
      return {
        ...item,
        quantity: newQty,
        sub_total: parseFloat((item.item_cost_price * newQty * (1 + item.gst / 100)).toFixed(2)),
      };
    }));
    return notice;
  }, []);

  const removeItem = useCallback((index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addEmptyRow = useCallback(() => {
    setItems(prev => [...prev, {
      _isManual: true,
      _tempId: Date.now(),
      stock_type: 'purchase',
      receiving_item_id: null,
      receiving_id: null,
      bill_number: '',
      invoice_number: '',
      invoice_date: '',
      item_id: null,
      name: '',
      is_serialized: 0,
      hsn_code: '',
      barcode: '',
      ordered_quantity: 0,
      received_quantity: 0,
      return_quantity: 0,
      quantity: 1,
      item_cost_price: 0,
      item_unit_price: 0,
      tax_category_id: null,
      tax_category: '',
      gst: 0,
      returnQuantity: 999,
      lots: [],
      availableLots: [],
      lot_id: null,
      sub_total: 0,
    }]);
  }, []);

  const updateField = useCallback((index, field, value) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === 'lots' && updated.is_serialized === 1) {
        updated.quantity = (value || []).length;
      }
      if (['item_cost_price', 'quantity', 'gst', 'lots'].includes(field)) {
        updated.sub_total = parseFloat((updated.item_cost_price * updated.quantity * (1 + updated.gst / 100)).toFixed(2));
      }
      return updated;
    }));
  }, []);

  const getUntaxedTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + (item.item_cost_price * item.quantity), 0);
  }, [items]);

  const getTaxTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + (item.item_cost_price * item.quantity * item.gst / 100), 0);
  }, [items]);

  const getGrandTotal = useCallback(() => {
    return getUntaxedTotal() + getTaxTotal();
  }, [getUntaxedTotal, getTaxTotal]);

  return {
    items, setItems, scanning, vendorBills, billProducts, openingStockProducts,
    loadVendorBills, searchAndAddItem, selectProductForRow, selectBillForRow,
    searchInvoices, enterSerialForRow, loadOpeningStockProducts,
    updateItemQty, removeItem, addEmptyRow, updateField,
    getUntaxedTotal, getTaxTotal, getGrandTotal,
  };
}

// Build a row from the /scanLotForReturn result (the new unified lookup)
function buildItemFromScanResult(item) {
  const costPrice = parseFloat(item.item_cost_price) || 0;
  const gst = parseFloat(item.tax_percentage) || 0;
  const isOpeningStock = item.stock_type === 'opening_stock';
  // For serialized items, scan is per-lot; for non-serialized, scan returns the lot but user will edit qty
  const isSerialized = Number(item.is_serialized) === 1;
  // Cap available qty: for serialized scans use 1 (one lot), for non-serialized use receiving or opening stock available
  const availableQty = isSerialized
    ? 1
    : (isOpeningStock ? Number(item.available_return_qty || 0) : Number(item.receiving_available_qty || item.available_return_qty || 0));

  return {
    _isManual: false,
    stock_type: isOpeningStock ? 'opening_stock' : 'purchase',
    receiving_item_id: item.receiving_item_id || null,
    receiving_id: item.receiving_id || null,
    bill_number: isOpeningStock ? null : item.bill_number,
    invoice_number: isOpeningStock ? OPENING_STOCK_INVOICE : (item.invoice_number || item.bill_number),
    invoice_date: item.invoice_date,
    item_id: item.item_id,
    name: item.product_name,
    item_number: item.item_number,
    is_serialized: item.is_serialized,
    category: item.category,
    brand: item.brand,
    hsn_code: item.hsn_code || '',
    barcode: item.barcode || '',
    ordered_quantity: Number(item.received_quantity || item.available_return_qty || 0),
    received_quantity: Number(item.received_quantity || item.available_return_qty || 0),
    return_quantity: Number(item.return_quantity || 0),
    quantity: isSerialized ? 1 : (availableQty > 0 ? 1 : 0),
    item_cost_price: costPrice,
    item_unit_price: parseFloat(item.item_unit_price) || 0,
    tax_category_id: item.tax_category_id,
    tax_category: item.tax_category_name,
    gst,
    returnQuantity: availableQty,
    // Serialized: pre-fill the scanned lot so user doesn't have to re-select
    lots: isSerialized && item.lot_id
      ? [{ lot_id: item.lot_id, lot_number: item.lot_number, quantity: 1, available_quantity: 1 }]
      : [],
    availableLots: isSerialized && item.lot_id
      ? [{ lot_id: item.lot_id, lot_number: item.lot_number, quantity: 1, available_quantity: 1 }]
      : [],
    sub_total: parseFloat((costPrice * 1 * (1 + gst / 100)).toFixed(2)),
    tax_types: item.tax_types || '1',
    tcs: item.tcs || '',
    tds: item.tds || '',
    tcs_percent: item.tcs_percent || '0%',
    tds_percent: item.tds_percent || '0%',
    tds_id: item.tds_id || null,
    sub_company_id: item.sub_company_id || null,
    original_supplier_id: item.original_supplier_id || null,
    lot_id: item.lot_id || null,
  };
}

// Build a row from a product selected via the manual + dropdown
// Works for both vendor-invoice products and opening stock products.
function buildItemFromProduct(product) {
  const costPrice = parseFloat(product.item_cost_price) || 0;
  const gst = parseFloat(product.tax_percentage) || 0;
  const isOpeningStock = product.stock_type === 'opening_stock';

  return {
    stock_type: isOpeningStock ? 'opening_stock' : 'purchase',
    receiving_item_id: product.receiving_item_id || null,
    receiving_id: product.receiving_id || null,
    bill_number: isOpeningStock ? null : product.bill_number,
    invoice_number: isOpeningStock ? OPENING_STOCK_INVOICE : (product.invoice_number || product.bill_number),
    invoice_date: product.invoice_date,
    item_id: product.item_id,
    name: product.product_name,
    item_number: product.item_number,
    is_serialized: product.is_serialized,
    category: product.category,
    brand: product.brand,
    hsn_code: product.hsn_code || '',
    barcode: product.barcode || '',
    ordered_quantity: Number(product.received_quantity || product.available_return_qty || 0),
    received_quantity: Number(product.received_quantity || product.available_return_qty || 0),
    return_quantity: Number(product.return_quantity || 0),
    quantity: 1,
    item_cost_price: costPrice,
    item_unit_price: parseFloat(product.item_unit_price) || 0,
    tax_category_id: product.tax_category_id,
    tax_category: product.tax_category_name,
    gst,
    returnQuantity: Number(product.available_return_qty || 0),
    lots: [],
    availableLots: [],
    sub_total: parseFloat((costPrice * 1 * (1 + gst / 100)).toFixed(2)),
    tax_types: product.tax_types || '1',
    tcs: product.tcs || '',
    tds: product.tds || '',
    tcs_percent: product.tcs_percent || '0%',
    tds_percent: product.tds_percent || '0%',
    tds_id: product.tds_id || null,
    sub_company_id: product.sub_company_id || null,
    original_supplier_id: product.original_supplier_id || null,
    lot_id: null,
  };
}
