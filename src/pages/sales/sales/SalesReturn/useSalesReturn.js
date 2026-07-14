import { useState, useCallback, useRef } from 'react';
import Salesservice from 'services/sales_services';

export default function useSalesReturn() {
  const [items, setItems] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [customerInvoices, setCustomerInvoices] = useState([]);
  const [invoiceProducts, setInvoiceProducts] = useState({}); // { invoice_number: [products] }

  const invoiceDebounceRef = useRef(null);
  const currentCustomerId = useRef(null);
  const currentLocationId = useRef(null);
  const invoiceProductsRef = useRef({});

  // Called when customer changes
  const loadCustomerInvoices = useCallback((customerId, locationId) => {
    currentCustomerId.current = customerId;
    currentLocationId.current = locationId;
    setCustomerInvoices([]);
    setInvoiceProducts({});
    invoiceProductsRef.current = {};
    if (!customerId) return;
    fetchInvoices(customerId, locationId, '');
  }, []);

  // Fetch customer invoices with unreturned items
  const fetchInvoices = useCallback(async (customerId, locationId, searchText) => {
    try {
      const res = await Salesservice.getAllCustomerUnreturnedItems({
        customer_id: customerId,
        location_id: locationId || null,
        search_invoice: searchText || '',
        limit: 500,
      });
      const allItems = res.data || [];

      const invoiceMap = {};
      allItems.forEach(item => {
        const invNo = item.invoice_number;
        if (!invNo) return;
        if (!invoiceMap[invNo]) {
          invoiceMap[invNo] = {
            invoice_number: invNo,
            sale_id: item.sale_id || item.sales_item_id,
            invoice_date: item.invoice_date,
          };
        }
      });
      setCustomerInvoices(Object.values(invoiceMap));

      const prodMap = { ...invoiceProductsRef.current };
      allItems.forEach(item => {
        const invNo = item.invoice_number;
        if (!invNo) return;
        if (!prodMap[invNo]) prodMap[invNo] = [];
        else if (prodMap[invNo].find(p => p.sales_item_id === item.sales_item_id)) return;
        prodMap[invNo].push(item);
      });
      invoiceProductsRef.current = prodMap;
      setInvoiceProducts(prodMap);
    } catch (err) {
      console.error('Failed to load customer invoices:', err);
    }
  }, []);

  // Debounced invoice search
  const searchInvoices = useCallback((searchText) => {
    if (invoiceDebounceRef.current) clearTimeout(invoiceDebounceRef.current);
    if (!currentCustomerId.current) return;
    invoiceDebounceRef.current = setTimeout(() => {
      fetchInvoices(currentCustomerId.current, currentLocationId.current, searchText);
    }, 400);
  }, [fetchInvoices]);

  // Duplicate check
  const isDuplicate = useCallback((existingItems, incoming) => {
    const isSerialized = incoming.is_serialized === 1;
    if (isSerialized) {
      if (!incoming.lot_id) return null;
      return existingItems.find(d => d.is_serialized === 1 && d.lot_id === incoming.lot_id);
    }
    return existingItems.find(d =>
      d.sales_item_id === incoming.sales_item_id && d.sale_id === incoming.sale_id
    );
  }, []);

  // Barcode/lot scan
  const searchAndAddItem = useCallback(async (customerId, searchText, locationId) => {
    if (!customerId) return { success: false, error: 'Please select a customer first' };
    if (!locationId) return { success: false, error: 'Please select a location first' };
    const term = (searchText || '').trim();
    if (!term) return { success: false, error: 'Please enter a lot number' };

    setScanning(true);
    try {
      const res = await Salesservice.scanLotForSalesReturn({
        customer_id: customerId,
        location_id: locationId,
        lot_number: term,
      });
      const rows = res.data || [];

      if (rows.length === 0) {
        setScanning(false);
        return { success: false, error: `Lot "${term}" is not available or not sold to this customer` };
      }

      const item = rows[0];
      const built = buildItemFromScanResult(item);

      const dup = isDuplicate(items, built);
      if (dup) {
        setScanning(false);
        return { success: false, error: `"${built.name}" from invoice ${built.invoice_number} is already added` };
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

  // When user selects a product from product dropdown
  const selectProductForRow = useCallback(async (index, product) => {
    const built = buildItemFromProduct(product);

    let availableLots = [];
    if (Number(product.is_serialized) === 1 && product.sale_id) {
      try {
        const res = await Salesservice.getItemLotsForSalesReturn({
          sale_id: product.sale_id,
          item_id: product.item_id,
          location_id: currentLocationId.current,
        });
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

  // When user selects an invoice for a manual row
  const selectInvoiceForRow = useCallback((index, invoiceNumber) => {
    const invoice = customerInvoices.find(inv => inv.invoice_number === invoiceNumber);
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      return {
        ...item,
        invoice_number: invoiceNumber,
        sale_id: invoice?.sale_id || null,
        sales_item_id: null,
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
  }, [customerInvoices]);

  // Manual serial entry
  const enterSerialForRow = useCallback(async (index, serialText) => {
    const term = (serialText || '').trim();
    if (!term) return { success: false, error: 'Please enter a serial number' };
    if (!currentLocationId.current) return { success: false, error: 'Please select a location first' };
    if (!currentCustomerId.current) return { success: false, error: 'Please select a customer first' };

    try {
      const res = await Salesservice.scanLotForSalesReturn({
        customer_id: currentCustomerId.current,
        location_id: currentLocationId.current,
        lot_number: term,
      });
      const rows = res.data || [];
      if (rows.length === 0) {
        return { success: false, error: `Lot "${term}" is not available` };
      }

      const built = buildItemFromScanResult(rows[0]);
      setItems(prev => prev.map((item, i) => (i !== index ? item : { ...built, _isManual: true })));
      return { success: true, switched: true };
    } catch (err) {
      console.error('Serial lookup error:', err);
      return { success: false, error: 'Error while validating serial' };
    }
  }, []);

  const updateItemQty = useCallback((index, qty) => {
    let notice = null;
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      if (item.is_serialized === 1) return item;
      const raw = Number(qty);
      const rawSafe = Number.isFinite(raw) ? raw : 0;
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
        sub_total: parseFloat((item.item_unit_price * newQty * (1 + item.gst / 100)).toFixed(2)),
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
      sales_item_id: null,
      sale_id: null,
      invoice_number: '',
      invoice_date: '',
      item_id: null,
      name: '',
      is_serialized: 0,
      hsn_code: '',
      ordered_quantity: 0,
      return_quantity: 0,
      quantity: 1,
      item_cost_price: 0,
      item_unit_price: 0,
      discount: 0,
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
      if (['item_unit_price', 'quantity', 'gst', 'lots'].includes(field)) {
        updated.sub_total = parseFloat((updated.item_unit_price * updated.quantity * (1 + updated.gst / 100)).toFixed(2));
      }
      return updated;
    }));
  }, []);

  const getUntaxedTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + (item.item_unit_price * item.quantity), 0);
  }, [items]);

  const getTaxTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + (item.item_unit_price * item.quantity * item.gst / 100), 0);
  }, [items]);

  const getGrandTotal = useCallback(() => {
    return getUntaxedTotal() + getTaxTotal();
  }, [getUntaxedTotal, getTaxTotal]);

  return {
    items, setItems, scanning, customerInvoices, invoiceProducts,
    loadCustomerInvoices, searchAndAddItem, selectProductForRow, selectInvoiceForRow,
    searchInvoices, enterSerialForRow,
    updateItemQty, removeItem, addEmptyRow, updateField,
    getUntaxedTotal, getTaxTotal, getGrandTotal,
  };
}

function buildItemFromScanResult(item) {
  const unitPrice = parseFloat(item.item_unit_price) || 0;
  const gst = parseFloat(item.tax_percentage) || 0;
  const isSerialized = Number(item.is_serialized) === 1;

  return {
    _isManual: false,
    sales_item_id: item.sales_item_id || null,
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
    quantity: isSerialized ? 1 : 1,
    item_cost_price: parseFloat(item.item_cost_price) || 0,
    item_unit_price: unitPrice,
    discount: parseFloat(item.discount) || 0,
    tax_category_id: item.tax_category_id,
    tax_category: item.tax_category_name,
    gst,
    returnQuantity: Number(item.available_return_qty || (item.ordered_quantity - item.return_quantity) || 0),
    lots: isSerialized && item.lot_id
      ? [{ lot_id: item.lot_id, lot_number: item.lot_number, quantity: 1 }]
      : [],
    availableLots: isSerialized && item.lot_id
      ? [{ lot_id: item.lot_id, lot_number: item.lot_number, quantity: 1 }]
      : [],
    sub_total: parseFloat((unitPrice * 1 * (1 + gst / 100)).toFixed(2)),
    tax_types: item.tax_types || '1',
    tcs: item.tcs || '',
    tds: item.tds || '',
    tcs_percent: item.tcs_percent || '0%',
    tds_percent: item.tds_percent || '0%',
    tds_id: item.tds_id || null,
    sub_company_id: item.sub_company_id || null,
    customer_id: item.customer_id || null,
    lot_id: item.lot_id || null,
  };
}

function buildItemFromProduct(product) {
  const unitPrice = parseFloat(product.item_unit_price) || 0;
  const gst = parseFloat(product.tax_percentage) || 0;

  return {
    sales_item_id: product.sales_item_id || null,
    sale_id: product.sale_id,
    invoice_number: product.invoice_number,
    invoice_date: product.invoice_date,
    item_id: product.item_id,
    name: product.product_name,
    item_number: product.item_number,
    is_serialized: product.is_serialized,
    category: product.category,
    brand: product.brand,
    hsn_code: product.hsn_code || '',
    ordered_quantity: Number(product.ordered_quantity || 0),
    return_quantity: Number(product.return_quantity || 0),
    quantity: 1,
    item_cost_price: parseFloat(product.item_cost_price) || 0,
    item_unit_price: unitPrice,
    discount: parseFloat(product.discount) || 0,
    tax_category_id: product.tax_category_id,
    tax_category: product.tax_category_name,
    gst,
    returnQuantity: Number(product.available_return_qty || 0),
    lots: [],
    availableLots: [],
    sub_total: parseFloat((unitPrice * 1 * (1 + gst / 100)).toFixed(2)),
    tax_types: product.tax_types || '1',
    tcs: product.tcs || '',
    tds: product.tds || '',
    tcs_percent: product.tcs_percent || '0%',
    tds_percent: product.tds_percent || '0%',
    tds_id: product.tds_id || null,
    sub_company_id: product.sub_company_id || null,
    lot_id: null,
  };
}
