import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, IconButton, Tooltip, Typography, Autocomplete,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const headerSx = { fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, py: 1, bgcolor: 'grey.50' };
const cellSx = { fontSize: 13, py: 1 };

export default function ReturnItemsTable({
  items, onUpdateQty, onRemove, onUpdateField,
  customerInvoices = [], invoiceProducts = {},
  onInvoiceSelect, onProductSelect, onInvoiceSearch,
  onNotify = () => {},
}) {
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

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...headerSx, width: 140 }}>Invoice</TableCell>
            <TableCell sx={{ ...headerSx, width: '22%' }}>Product</TableCell>
            <TableCell sx={{ ...headerSx, minWidth: 180 }}>Serial</TableCell>
            <TableCell sx={{ ...headerSx, width: 90 }} align="center">Return Qty</TableCell>
            <TableCell sx={{ ...headerSx, width: 100 }} align="right">Selling Price</TableCell>
            <TableCell sx={{ ...headerSx, width: 60 }} align="right">Tax %</TableCell>
            <TableCell sx={{ ...headerSx, width: 100 }} align="right">Sub Total</TableCell>
            <TableCell sx={{ ...headerSx, width: 40 }} align="center"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, idx) => {
            const invNo = item.invoice_number || '';
            const productOptions = invoiceProducts[invNo] || [];

            return (
              <TableRow key={item.sales_item_id || item.lot_id || item._tempId || idx} hover>
                {/* Invoice Number */}
                <TableCell sx={cellSx}>
                  {item._isManual ? (
                    <Autocomplete
                      size="small"
                      options={customerInvoices}
                      getOptionLabel={(opt) => opt.invoice_number || ''}
                      value={customerInvoices.find(b => b.invoice_number === invNo) || null}
                      onInputChange={(e, val, reason) => {
                        if (reason === 'input' && onInvoiceSearch) onInvoiceSearch(val);
                      }}
                      onChange={(e, val) => {
                        if (!val) return;
                        onInvoiceSelect(idx, val.invoice_number);
                      }}
                      isOptionEqualToValue={(opt, val) => opt.invoice_number === val.invoice_number}
                      renderInput={(params) => (
                        <TextField {...params} variant="standard" placeholder="Type to search" />
                      )}
                      renderOption={(props, option, { index }) => (
                        <li {...props} key={`inv-${option.sale_id || option.invoice_number || index}`}>
                          <div>
                            <Typography sx={{ fontSize: 12 }}>{option.invoice_number}</Typography>
                            <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>{option.invoice_date}</Typography>
                          </div>
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
                  ) : (
                    <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                      {item.invoice_number || '-'}
                    </Typography>
                  )}
                </TableCell>

                {/* Product */}
                <TableCell sx={cellSx}>
                  {item._isManual ? (
                    <Autocomplete
                      size="small"
                      options={productOptions}
                      getOptionLabel={(opt) => opt.product_name || opt.name || ''}
                      value={productOptions.find(p => p.sales_item_id === item.sales_item_id) || null}
                      onChange={(e, val) => {
                        if (val) onProductSelect(idx, val);
                      }}
                      renderInput={(params) => (
                        <TextField {...params} variant="standard" placeholder={invNo ? 'Select product' : 'Select invoice first'} />
                      )}
                      renderOption={(props, option, { index }) => (
                        <li {...props} key={`prod-${option.sales_item_id || option.item_id}-${index}`}>
                          <div>
                            <Typography sx={{ fontSize: 13 }}>{option.product_name || option.name}</Typography>
                            <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                              Available: {option.available_return_qty} | ₹{option.item_unit_price}
                            </Typography>
                          </div>
                        </li>
                      )}
                      sx={{ minWidth: 150 }}
                      disabled={!invNo}
                    />
                  ) : (
                    <>
                      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{item.name}</Typography>
                      {item.hsn_code && (
                        <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>HSN: {item.hsn_code}</Typography>
                      )}
                    </>
                  )}
                </TableCell>

                {/* Serial */}
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

                {/* Return Qty */}
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

                {/* Selling Price */}
                <TableCell align="right" sx={cellSx}>
                  {parseFloat(item.item_unit_price || 0).toFixed(2)}
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
