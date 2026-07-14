import React from 'react';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const SLAB_COLORS = ['#E3F2FD', '#E8F5E9', '#FFF3E0', '#F3E5F5', '#FFEBEE', '#E0F7FA', '#EDE7F6'];
const SLAB_BORDER_COLORS = ['#1976D2', '#2E7D32', '#ED6C02', '#9C27B0', '#D32F2F', '#00838F', '#6A1B9A'];

const INCENTIVE_TYPES = [
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'percentage', label: '% of Sales' },
  { value: 'per_unit', label: 'Per Unit' },
];

const PERCENTAGE_OF_OPTIONS = [
  { value: 'achieved_value', label: 'Achieved Value' },
  { value: 'target_value', label: 'Target Value' },
  { value: 'incremental_value', label: 'Incremental (Achieved - Target)' },
];

const emptySlab = () => ({
  from_pct: '',
  to_pct: '',
  incentive_type: 'fixed',
  value: '',
  percentage_of: 'achieved_value',
  label: '',
});

export default function SlabEditor({ slabs = [], onChange, disabled = false, planTypeConfig }) {
  const ptc = planTypeConfig || {};
  const rows = slabs.length ? slabs : [emptySlab()];

  const handleChange = (index, field, val) => {
    const updated = rows.map((s, i) => (i === index ? { ...s, [field]: val } : s));
    onChange(updated);
  };

  const addRow = () => {
    const lastTo = rows.length ? Number(rows[rows.length - 1].to_pct) || 0 : 0;
    const newSlab = { ...emptySlab(), from_pct: lastTo };
    onChange([...rows, newSlab]);
  };

  const removeRow = (index) => {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, i) => i !== index));
  };

  const getRowError = (index) => {
    const row = rows[index];
    const from = Number(row.from_pct);
    const to = Number(row.to_pct);
    if (row.from_pct !== '' && row.to_pct !== '' && from >= to) return '"From" must be less than "To"';
    for (let i = 0; i < rows.length; i++) {
      if (i === index) continue;
      const oFrom = Number(rows[i].from_pct);
      const oTo = Number(rows[i].to_pct);
      if (rows[i].from_pct !== '' && rows[i].to_pct !== '' && from < oTo && to > oFrom) return 'Overlaps with another slab';
    }
    return null;
  };

  // Visual bar
  const validSlabs = rows.filter(s => s.from_pct !== '' && s.to_pct !== '' && Number(s.from_pct) < Number(s.to_pct));
  const maxTo = validSlabs.length ? Math.max(...validSlabs.map(s => Number(s.to_pct))) : 100;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Incentive Slabs</Typography>
        {ptc.slabLabel && (
          <Chip label={ptc.slabLabel} size="small" variant="outlined" color="info" sx={{ fontSize: 11 }} />
        )}
        <Tooltip title={ptc.slabHelp || "Define achievement % ranges and the incentive for each range."} arrow>
          <InfoOutlinedIcon sx={{ fontSize: 16, color: '#999', cursor: 'help' }} />
        </Tooltip>
      </Box>

      <Typography sx={{ fontSize: 12, color: '#888', mb: 2 }}>
        {ptc.slabHelp || 'Each slab defines what incentive a salesman earns when their achievement falls within that range.'}
      </Typography>

      {/* Visual slab bar */}
      {validSlabs.length > 0 && (
        <Box sx={{ display: 'flex', height: 32, borderRadius: 2, overflow: 'hidden', mb: 2, border: '1px solid #E0E0E0' }}>
          {validSlabs.map((slab, idx) => {
            const from = Number(slab.from_pct);
            const to = Number(slab.to_pct);
            const widthPct = ((to - from) / maxTo) * 100;
            const leftPct = idx === 0 ? (from / maxTo) * 100 : 0;
            const typeLabel = slab.incentive_type === 'fixed' ? `Rs.${slab.value || 0}`
              : slab.incentive_type === 'percentage' ? `${slab.value || 0}%`
              : `Rs.${slab.value || 0}/unit`;
            return (
              <Tooltip key={idx} title={`${from}% - ${to}%: ${slab.label || `Slab ${idx + 1}`} (${typeLabel})`} arrow>
                <Box sx={{
                  width: `${widthPct}%`, ml: idx === 0 ? `${leftPct}%` : 0,
                  bgcolor: SLAB_COLORS[idx % SLAB_COLORS.length],
                  borderLeft: `3px solid ${SLAB_BORDER_COLORS[idx % SLAB_BORDER_COLORS.length]}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600, color: SLAB_BORDER_COLORS[idx % SLAB_BORDER_COLORS.length],
                  minWidth: 40, transition: 'all 0.2s', px: 0.5,
                }}>
                  {slab.label || `${from}-${to}%`}
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      )}

      {/* Slab table */}
      <TableContainer sx={{ border: '1px solid #E8EDF5', borderRadius: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F5F7FA' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: 11, width: 40 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>
                <Tooltip title={ptc.fromTooltip || "Achievement percentage lower bound (inclusive)"} arrow>
                  <span>From %</span>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>
                <Tooltip title={ptc.toTooltip || "Achievement percentage upper bound (inclusive)"} arrow>
                  <span>To %</span>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Incentive Type</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Value</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>
                <Tooltip title="For percentage type: what amount is the % calculated on?" arrow>
                  <span>% Calculated On</span>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>
                <Tooltip title="A label for this slab (e.g., Bronze, Silver, Gold)" arrow>
                  <span>Label</span>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 11, width: 60 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((slab, idx) => {
              const error = getRowError(idx);
              const color = SLAB_BORDER_COLORS[idx % SLAB_BORDER_COLORS.length];
              return (
                <TableRow key={idx} sx={{
                  bgcolor: error ? '#FFF3F3' : (idx % 2 === 0 ? '#fff' : '#FAFBFC'),
                  borderLeft: `3px solid ${color}`,
                }}>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color }}>{idx + 1}</TableCell>
                  <TableCell sx={{ p: 0.5 }}>
                    <TextField type="number" size="small" fullWidth value={slab.from_pct}
                      onChange={(e) => handleChange(idx, 'from_pct', e.target.value)}
                      disabled={disabled} error={!!error} placeholder="0"
                      sx={{ '& input': { fontSize: 13, py: 0.75, textAlign: 'center' } }}
                      inputProps={{ min: 0 }} />
                  </TableCell>
                  <TableCell sx={{ p: 0.5 }}>
                    <TextField type="number" size="small" fullWidth value={slab.to_pct}
                      onChange={(e) => handleChange(idx, 'to_pct', e.target.value)}
                      disabled={disabled} error={!!error} placeholder="100"
                      sx={{ '& input': { fontSize: 13, py: 0.75, textAlign: 'center' } }}
                      inputProps={{ min: 0 }} />
                  </TableCell>
                  <TableCell sx={{ p: 0.5 }}>
                    <TextField select size="small" fullWidth value={slab.incentive_type}
                      onChange={(e) => handleChange(idx, 'incentive_type', e.target.value)}
                      disabled={disabled} sx={{ '& .MuiSelect-select': { fontSize: 13 } }}>
                      {INCENTIVE_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                    </TextField>
                  </TableCell>
                  <TableCell sx={{ p: 0.5 }}>
                    <TextField type="number" size="small" fullWidth value={slab.value}
                      onChange={(e) => handleChange(idx, 'value', e.target.value)}
                      disabled={disabled} placeholder="0"
                      sx={{ '& input': { fontSize: 13, py: 0.75, textAlign: 'right' } }}
                      slotProps={{ input: {
                        startAdornment: slab.incentive_type === 'percentage'
                          ? null
                          : <Typography sx={{ fontSize: 12, color: '#999', mr: 0.5 }}>Rs.</Typography>,
                        endAdornment: slab.incentive_type === 'percentage'
                          ? <Typography sx={{ fontSize: 12, color: '#999', ml: 0.5 }}>%</Typography>
                          : null,
                      }}}
                      inputProps={{ min: 0 }} />
                  </TableCell>
                  <TableCell sx={{ p: 0.5 }}>
                    {slab.incentive_type === 'percentage' ? (
                      <TextField select size="small" fullWidth
                        value={slab.percentage_of || 'achieved_value'}
                        onChange={(e) => handleChange(idx, 'percentage_of', e.target.value)}
                        disabled={disabled} sx={{ '& .MuiSelect-select': { fontSize: 12 } }}>
                        {PERCENTAGE_OF_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                      </TextField>
                    ) : (
                      <Typography sx={{ fontSize: 12, color: '#ccc', textAlign: 'center' }}>-</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ p: 0.5 }}>
                    <TextField size="small" fullWidth value={slab.label}
                      onChange={(e) => handleChange(idx, 'label', e.target.value)}
                      disabled={disabled} placeholder="e.g. Gold"
                      sx={{ '& input': { fontSize: 13, py: 0.75 } }} />
                  </TableCell>
                  <TableCell sx={{ p: 0.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.3 }}>
                      {rows.length > 1 && !disabled && (
                        <IconButton size="small" color="error" onClick={() => removeRow(idx)}>
                          <RemoveCircleOutlineIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {/* Add row button */}
            {!disabled && (
              <TableRow>
                <TableCell colSpan={8} sx={{ py: 1 }}>
                  <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={addRow}
                    sx={{ textTransform: 'none', fontSize: 12 }}>
                    Add Slab
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {rows.some((_, i) => getRowError(i)) && (
        <Typography sx={{ fontSize: 11, color: '#d32f2f', mt: 1 }}>
          Fix the highlighted errors before saving.
        </Typography>
      )}
    </Box>
  );
}
