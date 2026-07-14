import React from 'react';
import { Box, Divider, Typography, TextField, IconButton, Tooltip, FormControlLabel, Switch } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import TdsSelector from './TdsSelector';

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export default function DebitNoteSummary({
  untaxedTotal, totalGst, halfGst, cgstAmount, sgstAmount, showIGST, onToggleIGST,
  tdsConfig, onTdsChange, manualTdsAmount, onManualTdsChange,
  tdsRates = [],
  roundOff, onRoundOffChange, editRoundOff, onToggleRoundOffEdit,
  grandTotal,
}) {
  const tdsAmount = tdsConfig
    ? (tdsConfig.category === 'Others'
      ? round2(parseFloat(manualTdsAmount) || 0)
      : round2((untaxedTotal * (parseFloat(tdsConfig.tds_rate) || 0)) / 100))
    : 0;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pr: 2 }}>
      <Box sx={{ minWidth: 320 }}>
        {/* Untaxed */}
        <Row label="Untaxed Amount" value={untaxedTotal} />

        {/* GST */}
        {totalGst > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', py: 0.25 }}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={!!showIGST}
                  onChange={(e) => onToggleIGST && onToggleIGST(e.target.checked)}
                />
              }
              label={<Typography variant="caption">Inter-state (IGST)</Typography>}
              labelPlacement="start"
              sx={{ m: 0 }}
            />
          </Box>
        )}
        {totalGst > 0 && !showIGST && (
          <>
            <Row label="CGST" value={cgstAmount ?? halfGst} />
            <Row label="SGST" value={sgstAmount ?? halfGst} />
          </>
        )}
        {totalGst > 0 && showIGST && (
          <Row label="IGST" value={totalGst} />
        )}

        {/* TDS */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, mr: 2 }}>
            <TdsSelector
              tdsConfig={tdsConfig}
              onTdsChange={onTdsChange}
              manualTdsAmount={manualTdsAmount}
              onManualTdsChange={onManualTdsChange}
              tdsRates={tdsRates}
            />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap', pt: 0.5 }}>
            {tdsAmount > 0 ? `- ₹ ${tdsAmount.toFixed(2)}` : '₹ 0.00'}
          </Typography>
        </Box>

        {/* Round Off */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Rounded Off</Typography>
            <Tooltip title="Edit round-off">
              <IconButton size="small" onClick={onToggleRoundOffEdit} sx={{ ml: 0.5, p: 0 }}>
                <EditIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
          {editRoundOff ? (
            <TextField
              size="small" variant="standard" type="number"
              value={roundOff}
              onChange={(e) => onRoundOffChange(parseFloat(e.target.value) || 0)}
              inputProps={{ style: { textAlign: 'right', width: 60 } }}
              autoFocus
            />
          ) : (
            <Typography variant="body2">₹ {roundOff.toFixed(2)}</Typography>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Total */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Total</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>₹ {grandTotal.toFixed(2)}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

function Row({ label, value }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2">₹ {value.toFixed(2)}</Typography>
    </Box>
  );
}
