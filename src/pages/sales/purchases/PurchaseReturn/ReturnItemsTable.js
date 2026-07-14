import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, IconButton, Tooltip, Typography, Chip, Autocomplete,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { OPENING_STOCK_INVOICE } from './usePurchaseReturn';

const headerSx = { fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, py: 1, bgcolor: 'grey.50' };
const cellSx = { fontSize: 13, py: 1 };

// Synthetic option representing the "No Invoice" (opening stock) entry in the invoice dropdown
const NO_INVOICE_OPTION = {
  invoice_number: OPENING_STOCK_INVOICE,
  bill_number: null,
  receiving_id: null,
  invoice_date: null,
  _isOpeningStock: true,
};

export default function ReturnItemsTable({
  items, onUpdateQty, onRemove, onUpdateField,
  vendorBills = [], billProducts = {}, openingStockProducts = [],
  onBillSelect, onProductSelect, onInvoiceSearch,
  hasLocation = true,
  onNotify = () => {},
}) {
  // Wrap onUpdateQty so we can surface the hook's clamp-notice as a toast to
  // the parent. Previously invalid quantities were silently coerced.
  const handleUpdateQty = (idx, rawQty) => {
    const notice = onUpdateQty(idx, rawQty);
    if (notice) {
      const msgs = {
        integer: `Quantity must be a whole number. Adjusted ${notice.original} → ${notice.adjusted}.`,
        max: `Quantity capped at available stock (${notice.max}).`,
        min: `Quantity cannot be negative. Set to 0.`,
      };
      onNotify({ severity: 'warning', msg: msgs[notice.type] || 'Quantity adjusted' });
    }
  };
  if (items.length === 0) {
    return (
      <Typography align="center" color="text.secondary" sx={{ py: 6 }}>
        Scan a barcode / lot number or click + to add items
      </Typography>
    );
  }

  // Options for the invoice dropdown: include "No Invoice" only if we have a location
  // (opening-stock products are scoped to a location — see B7)
  const invoiceOptions = hasLocation
    ? [NO_INVOICE_OPTION, ...vendorBills]
    : [...vendorBills];

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...headerSx, width: 140 }}>Invoice</TableCell>
            <TableCell sx={{ ...headerSx, width: '22%' }}>Product</TableCell>
            <TableCell sx={{ ...headerSx, minWidth: 180 }}>Serial</TableCell>
            <TableCell sx={{ ...headerSx, width: 90 }} align="center">Return Qty</TableCell>
            <TableCell sx={{ ...headerSx, width: 100 }} align="right">Buying Cost</TableCell>
            <TableCell sx={{ ...headerSx, width: 60 }} align="right">Tax %</TableCell>
            <TableCell sx={{ ...headerSx, width: 100 }} align="right">Sub Total</TableCell>
            <TableCell sx={{ ...headerSx, width: 40 }} align="center"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, idx) => {
            const invNo = item.invoice_number || '';
            const isOpeningStock = item.stock_type === 'opening_stock';
            // Product list depends on invoice type:
            //  - Opening stock row → openingStockProducts
            //  - Vendor invoice picked → that invoice's products
            //  - Nothing picked yet → default to opening stock products so the user can still pick something
            const productOptions = isOpeningStock || !invNo
              ? openingStockProducts
              : (billProducts[invNo] || []);

            return (
              <TableRow key={item.receiving_item_id || item.lot_id || item._tempId || idx} hover>
                {/* Invoice Number — dropdown with "No Invoice" option, or display for scanned rows */}
                <TableCell sx={cellSx}>
                  {item._isManual ? (
                    <Autocomplete
                      size="small"
                      options={invoiceOptions}
                      getOptionLabel={(opt) => opt.invoice_number || ''}
                      value={
                        isOpeningStock ? NO_INVOICE_OPTION :
                        vendorBills.find(b => b.invoice_number === invNo) || null
                      }
                      onInputChange={(e, val, reason) => {
                        if (reason === 'input' && onInvoiceSearch) onInvoiceSearch(val);
                      }}
                      onChange={(e, val) => {
                        if (!val) return;
                        onBillSelect(idx, val.invoice_number);
                      }}
                      isOptionEqualToValue={(opt, val) => opt.invoice_number === val.invoice_number}
                      renderInput={(params) => (
                        <TextField {...params} variant="standard" placeholder="Type to search" />
                      )}
                      renderOption={(props, option, { index }) => (
                        <li {...props} key={`inv-${option.receiving_id || option.invoice_number || index}`}>
                          {option._isOpeningStock ? (
                            <Chip label="No Invoice" size="small" color="info" variant="outlined" sx={{ fontSize: 11 }} />
                          ) : (
                            <Typography sx={{ fontSize: 12 }}>{option.invoice_number}</Typography>
                          )}
                        </li>
                      )}
                      filterOptions={(options, state) => {
                        const input = (state.inputValue || '').toLowerCase();
                        if (!input) return options;
                        return options.filter(o =>
                          (o.invoice_number || '').toLowerCase().includes(input)
                        );
                      }}
                      noOptionsText="Type invoice number..."
                      sx={{ minWidth: 140 }}
                    />
                  ) : isOpeningStock ? (
                    <Chip label="No Invoice" size="small" color="info" variant="outlined" sx={{ fontSize: 11 }} />
                  ) : (
                    <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                      {item.invoice_number || item.bill_number || '-'}
                    </Typography>
                  )}
                </TableCell>

                {/* Product — scoped to invoice selection */}
                <TableCell sx={cellSx}>
                  {item._isManual ? (
                    <Autocomplete
                      size="small"
                      options={productOptions}
                      getOptionLabel={(opt) => opt.product_name || opt.name || ''}
                      value={productOptions.find(p =>
                        isOpeningStock ? p.item_id === item.item_id : p.receiving_item_id === item.receiving_item_id
                      ) || null}
                      onChange={(e, val) => {
                        if (val) onProductSelect(idx, val);
                      }}
                      renderInput={(params) => (
                        <TextField {...params} variant="standard"
                          placeholder={
                            isOpeningStock ? 'Select opening stock product'
                            : invNo ? 'Select product'
                            : 'Opening stock product'
                          } />
                      )}
                      renderOption={(props, option, { index }) => (
                        <li {...props} key={`prod-${option.receiving_item_id || option.item_id}-${index}`}>
                          <div>
                            <Typography sx={{ fontSize: 13 }}>{option.product_name || option.name}</Typography>
                            <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                              Available: {option.available_return_qty} | ₹{option.item_cost_price}
                            </Typography>
                          </div>
                        </li>
                      )}
                      sx={{ minWidth: 150 }}
                    />
                  ) : (
                    <>
                      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{item.name}</Typography>
                      {item.barcode && (
                        <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>{item.barcode}</Typography>
                      )}
                    </>
                  )}
                </TableCell>

                {/* Serial — dropdown for serialized items (purchase OR opening stock) */}
                <TableCell sx={cellSx}>
                  {item.is_serialized === 1 && item.item_id ? (
                    <Autocomplete
                      multiple
                      size="small"
                      options={item.availableLots || []}
                      getOptionLabel={(opt) => opt.lot_number || String(opt.lot_id)}
                      value={item.lots || []}
                      onChange={(e, val) => {
                        onUpdateField(idx, 'lots', val);
                      }}
                      renderInput={(params) => (
                        <TextField {...params} variant="standard"
                          placeholder={item.availableLots?.length > 0 ? 'Select' : 'No lots'} />
                      )}
                      renderOption={(props, option, { index }) => (
                        <li {...props} key={`lot-${option.lot_id}-${index}`}>
                          <Typography sx={{ fontSize: 12 }}>{option.lot_number || option.lot_id}</Typography>
                        </li>
                      )}
                      isOptionEqualToValue={(opt, val) => opt.lot_id === val.lot_id}
                      sx={{ minWidth: 160 }}
                      limitTags={2}
                      disableCloseOnSelect
                      noOptionsText="No lots available"
                    />
                  ) : item.is_serialized === 1 ? (
                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>-</Typography>
                  ) : '-'}
                </TableCell>

                {/* Return Qty — disabled for serialized items */}
                <TableCell align="center" sx={cellSx}>
                  <TextField
                    type="number"
                    size="small"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQty(idx, parseInt(e.target.value, 10) || 0)}
                    disabled={item.is_serialized === 1}
                    inputProps={{
                      min: 0,
                      max: item.returnQuantity,
                      step: 1,
                      style: { textAlign: 'center', width: 50 },
                      readOnly: item.is_serialized === 1,
                    }}
                    variant="outlined"
                    helperText={
                      item.is_serialized === 1
                        ? 'Select lots'
                        : (item.returnQuantity < 999 ? `Max: ${item.returnQuantity}` : '')
                    }
                    FormHelperTextProps={{ sx: { fontSize: 9, mt: 0, textAlign: 'center' } }}
                  />
                </TableCell>

                {/* Buying Cost */}
                <TableCell align="right" sx={cellSx}>
                  {parseFloat(item.item_cost_price || 0).toFixed(2)}
                </TableCell>

                {/* Tax % */}
                <TableCell align="right" sx={cellSx}>
                  {item.gst || 0}%
                </TableCell>

                {/* Sub Total */}
                <TableCell align="right" sx={{ ...cellSx, fontWeight: 600 }}>
                  {(item.sub_total || 0).toFixed(2)}
                </TableCell>

                {/* Delete */}
                <TableCell align="center" sx={cellSx}>
                  <Tooltip title="Remove">
                    <IconButton size="small" onClick={() => onRemove(idx)} sx={{ '&:hover': { color: 'error.main' } }}>
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
