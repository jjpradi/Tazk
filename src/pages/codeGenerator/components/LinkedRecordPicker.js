import React, { useContext, useEffect, useMemo } from 'react';
import { Autocomplete, Box, Chip, TextField, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { listProductAction } from 'redux/actions/product_actions';
import { listCustomerAction } from 'redux/actions/customer_actions';
import { listVendorAction } from 'redux/actions/vendor_actions';
import { listUserCreationAction } from 'redux/actions/userCreation_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';

// Defensive label getters — different reducers expose different name fields,
// and customer/vendor company_name is RSA-OAEP encrypted at rest (per CLAUDE.md
// — the existing actions return decrypted versions).
const firstString = (...vals) => vals.find((v) => v != null && String(v).trim() !== '') || '';

// Type → record-source config.
const SOURCE_BY_TYPE = {
  product: {
    referenceTable: 'pos_items',
    idKey: 'item_id',
    getDisplay: (r) => r.name || '',
    getSecondary: (r) => [r.brand, r.model, r.sku].filter(Boolean).join(' • '),
    getChip: (r) => (r.max_price != null ? `₹${r.max_price}` : null),
    toPrefill: (r) => ({
      display_name: r.name || '',
      metadata: {
        mrp:         r.max_price != null  ? String(r.max_price)  : '',
        offer_price: r.unit_price != null ? String(r.unit_price) : '',
        brand:       r.brand || '',
      },
    }),
  },
  customer: {
    referenceTable: 'pos_customers',
    idKey: 'customer_id',
    getDisplay: (r) => firstString(r.companyName, r.company_name, r.name),
    getSecondary: (r) => firstString(r.phone, r.mobile, r.email, r.city),
    getChip: () => null,
    toPrefill: (r) => ({
      display_name: firstString(r.companyName, r.company_name, r.name),
      metadata: {
        phone: firstString(r.phone, r.mobile),
        email: r.email || '',
        city:  r.city || '',
        gstin: firstString(r.gstin, r.tax_id),
      },
    }),
  },
  vendor: {
    referenceTable: 'pos_suppliers',
    idKey: 'supplier_id',
    getDisplay: (r) => firstString(r.companyName, r.company_name, r.vendorName, r.name),
    getSecondary: (r) => firstString(r.contact, r.phone, r.email, r.city),
    getChip: () => null,
    toPrefill: (r) => ({
      display_name: firstString(r.companyName, r.company_name, r.vendorName, r.name),
      metadata: {
        gstin:   firstString(r.gstin, r.tax_id),
        contact: firstString(r.contact, r.phone),
        city:    r.city || '',
      },
    }),
  },
  employee: {
    referenceTable: 'pos_employees',
    idKey: 'employee_id',
    getDisplay: (r) => firstString(
      [r.first_name, r.last_name].filter(Boolean).join(' '),
      r.full_name, r.name, r.username,
    ),
    getSecondary: (r) => firstString(r.emp_code, r.designation, r.department, r.email),
    getChip: () => null,
    toPrefill: (r) => ({
      display_name: firstString(
        [r.first_name, r.last_name].filter(Boolean).join(' '),
        r.full_name, r.name, r.username,
      ),
      metadata: {
        emp_id:      firstString(r.emp_code, r.employee_code, r.employee_id ? String(r.employee_id) : ''),
        designation: r.designation || '',
        department:  r.department || '',
        phone:       firstString(r.phone, r.mobile),
      },
    }),
  },
  // asset / location / invoice / document / custom — no picker (no global list).
};

/**
 * Autocomplete that lets the user pick an existing record (Product, Customer,
 * Vendor, Employee) to link to the generated code. On select, the parent
 * receives reference_table + reference_id (sent to BE) plus a prefill
 * { display_name, metadata } used to populate the form.
 */
export default function LinkedRecordPicker({ codeType, value, onChange }) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const productList  = useSelector((s) => s?.productReducer?.product || []);
  const customerList = useSelector((s) => s?.customerReducer?.customer || []);
  const vendorList   = useSelector((s) => s?.vendorReducer?.vendor || []);
  const employeeList = useSelector((s) => s?.userCreationReducer?.createUser || []);

  const source = SOURCE_BY_TYPE[codeType];

  // Lazy-load the relevant list when the picker first becomes relevant.
  useEffect(() => {
    if (!source) return;
    try {
      if (codeType === 'product'  && productList.length === 0)  dispatch(listProductAction(setModalTypeHandler, setLoaderStatusHandler));
      if (codeType === 'customer' && customerList.length === 0) dispatch(listCustomerAction(setModalTypeHandler, setLoaderStatusHandler));
      if (codeType === 'vendor'   && vendorList.length === 0)   dispatch(listVendorAction(true, setModalTypeHandler, setLoaderStatusHandler));
      if (codeType === 'employee' && employeeList.length === 0) dispatch(listUserCreationAction(setModalTypeHandler, setLoaderStatusHandler));
    } catch (_e) { /* swallow — actions may have different signatures */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeType]);

  const options = useMemo(() => {
    if (!source) return [];
    if (codeType === 'product')  return Array.isArray(productList)  ? productList  : [];
    if (codeType === 'customer') return Array.isArray(customerList) ? customerList : [];
    if (codeType === 'vendor')   return Array.isArray(vendorList)   ? vendorList   : [];
    if (codeType === 'employee') return Array.isArray(employeeList) ? employeeList : [];
    return [];
  }, [source, codeType, productList, customerList, vendorList, employeeList]);

  if (!source) return null;

  const getOptionLabel = (opt) => {
    if (!opt || typeof opt !== 'object') return '';
    const display = source.getDisplay(opt);
    const secondary = source.getSecondary(opt);
    return secondary ? `${display} — ${secondary}` : display;
  };

  return (
    <Autocomplete
      size="small"
      fullWidth
      options={options}
      value={value || null}
      onChange={(_e, picked) => {
        if (!picked) {
          onChange({ picked: null, reference_table: null, reference_id: null, prefill: null });
          return;
        }
        onChange({
          picked,
          reference_table: source.referenceTable,
          reference_id: picked[source.idKey],
          prefill: source.toPrefill(picked),
        });
      }}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={(o, v) => o && v && o[source.idKey] === v[source.idKey]}
      renderOption={(props, opt) => {
        const display = source.getDisplay(opt);
        const secondary = source.getSecondary(opt);
        const chip = source.getChip(opt);
        return (
          <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {display}
              </Typography>
              {secondary ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {secondary}
                </Typography>
              ) : null}
            </Box>
            {chip ? <Chip size="small" sx={{ height: 20 }} label={chip} /> : null}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={`Link to existing ${codeType}`}
          placeholder={`Type to search ${codeType}s…`}
        />
      )}
      noOptionsText={`No ${codeType}s loaded yet`}
      clearOnEscape
    />
  );
}
