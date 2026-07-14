import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, IconButton, Tooltip, Typography, Autocomplete, MenuItem, Select,
  Box,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const headerSx = { fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, py: 1, bgcolor: 'grey.50' };
const cellSx = { fontSize: 13, py: 1, verticalAlign: 'top' };

const GST_OPTIONS = [
  { value: '5', label: '5%' },
  { value: '12', label: '12%' },
  { value: '18', label: '18%' },
];

export default function DebitNoteItemsTable({
  items, onUpdate, onRemove, onAdd,
  schemesLedgers = [], selectedLedgerIds = [], onCreateLedger,
}) {
  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Line Items</Typography>
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Add line item">
          <IconButton size="small" color="primary" onClick={onAdd}
            sx={{ border: '1px solid', borderColor: 'primary.main' }}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headerSx, minWidth: 180 }}>Schemes Ledger *</TableCell>
              <TableCell sx={{ ...headerSx, width: 160 }}>Description</TableCell>
              <TableCell sx={{ ...headerSx, width: 100 }}>HSN/SAC</TableCell>
              <TableCell sx={{ ...headerSx, width: 120 }} align="right">Amount *</TableCell>
              <TableCell sx={{ ...headerSx, width: 160 }}>GST</TableCell>
              <TableCell sx={{ ...headerSx, width: 100 }} align="right">Sub Total</TableCell>
              <TableCell sx={{ ...headerSx, width: 40 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, idx) => {
            // Filter out ledgers already used in other rows (but keep current row's selection)
            const otherSelectedIds = selectedLedgerIds.filter(id => id !== item.schemesLedgerId);
            const availableLedgers = schemesLedgers.filter(l => !otherSelectedIds.includes(l.id || l.ledger_id));

            return (
              <TableRow key={item._id} hover>
                {/* Schemes Ledger */}
                <TableCell sx={cellSx}>
                  <Autocomplete
                    size="small"
                    options={availableLedgers}
                    getOptionLabel={(opt) => opt.name || ''}
                    value={schemesLedgers.find(l => (l.id || l.ledger_id) === item.schemesLedgerId) || null}
                    onChange={(e, val) => onUpdate(idx, 'schemesLedgerId', val)}
                    isOptionEqualToValue={(opt, val) => (opt.id || opt.ledger_id) === (val.id || val.ledger_id)}
                    renderInput={(params) => (
                      <TextField {...params} variant="standard" placeholder="Select ledger"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {onCreateLedger && (
                                <Tooltip title="Create new ledger">
                                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); onCreateLedger(); }}
                                    sx={{ p: 0, mr: -0.5 }}>
                                    <AddIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option, { index }) => (
                      <li {...props} key={`ledger-${option.id || option.ledger_id}-${index}`}>
                        <Typography sx={{ fontSize: 13 }}>{option.name}</Typography>
                      </li>
                    )}
                  />
                  {item.schemesLedgerId && item.existingBalance > 0 && (
                    <Typography sx={{ fontSize: 10, color: 'warning.main', mt: 0.5 }}>
                      Existing balance: ₹{item.existingBalance.toFixed(2)}
                    </Typography>
                  )}
                </TableCell>

                {/* Description */}
                <TableCell sx={cellSx}>
                  <TextField
                    size="small" variant="standard" fullWidth
                    value={item.description}
                    onChange={(e) => onUpdate(idx, 'description', e.target.value)}
                    placeholder="Description"
                  />
                </TableCell>

                {/* HSN/SAC */}
                <TableCell sx={cellSx}>
                  <TextField
                    size="small" variant="standard" fullWidth
                    value={item.hsn_code}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      onUpdate(idx, 'hsn_code', val);
                    }}
                    placeholder="99XXXX"
                    error={item.gst_id && item.hsn_code && !/^99\d{4}$/.test(item.hsn_code)}
                    helperText={item.gst_id && item.hsn_code && !/^99\d{4}$/.test(item.hsn_code) ? 'Must be 99XXXX' : ''}
                    FormHelperTextProps={{ sx: { fontSize: 9, mt: 0 } }}
                    inputProps={{ inputMode: 'numeric' }}
                  />
                </TableCell>

                {/* Amount */}
                <TableCell sx={cellSx}>
                  <TextField
                    size="small" variant="standard" fullWidth
                    type="number"
                    value={item.amount}
                    onChange={(e) => onUpdate(idx, 'amount', e.target.value)}
                    placeholder="0.00"
                    inputProps={{ style: { textAlign: 'right' }, min: 0 }}
                  />
                </TableCell>

                {/* GST Toggle + Rate */}
                <TableCell sx={cellSx}>
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    <Select
                      size="small" variant="standard"
                      value={item.gst ? 'with' : 'without'}
                      onChange={(e) => onUpdate(idx, 'gst', e.target.value === 'with')}
                      sx={{ fontSize: 12, minWidth: 60 }}
                    >
                      <MenuItem value="without" sx={{ fontSize: 12 }}>W/O</MenuItem>
                      <MenuItem value="with" sx={{ fontSize: 12 }}>With</MenuItem>
                    </Select>
                    {item.gst && (
                      <Select
                        size="small" variant="standard"
                        value={item.gst_id || ''}
                        onChange={(e) => onUpdate(idx, 'gst_id', e.target.value)}
                        sx={{ fontSize: 12, minWidth: 50 }}
                        displayEmpty
                      >
                        <MenuItem value="" sx={{ fontSize: 12 }}>%</MenuItem>
                        {GST_OPTIONS.map(g => (
                          <MenuItem key={g.value} value={g.value} sx={{ fontSize: 12 }}>{g.label}</MenuItem>
                        ))}
                      </Select>
                    )}
                  </Box>
                </TableCell>

                {/* Sub Total */}
                <TableCell align="right" sx={{ ...cellSx, fontWeight: 600 }}>
                  {item.sub_total > 0 ? item.sub_total.toFixed(2) : '0.00'}
                </TableCell>

                {/* Delete */}
                <TableCell sx={cellSx}>
                  <Tooltip title={items.length <= 1 ? 'At least 1 row required' : 'Remove'}>
                    <span>
                      <IconButton size="small" onClick={() => onRemove(idx)}
                        disabled={items.length <= 1}
                        sx={{ '&:hover': { color: 'error.main' } }}>
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
