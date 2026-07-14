import React, { useState } from 'react';
import {
    Box, Chip, IconButton, Popover, FormControlLabel, Switch, Select,
    MenuItem, FormControl, InputLabel, Tooltip, Typography,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';

/**
 * Shared UI for classifying a row (purchase / expense line / vendor note) under GST:
 *   • itc_eligible (0/1) — is the ITC claimable?
 *   • itc_block_reason_id (FK → gst_itc_block_reason_lov) — required when itc_eligible=0
 *   • is_rcm (0/1) — reverse charge flag (hidden on credit/debit notes)
 *
 * Usage:
 *   // Popover (per-line, e.g. inside a MaterialTable cell)
 *   <ItcClassificationControl
 *     variant="popover"
 *     value={{ itc_eligible, itc_block_reason_id, is_rcm }}
 *     onChange={(v) => ...}
 *     reasons={reasons}
 *     showRcm
 *   />
 *
 *   // Inline (header-level strip on a form)
 *   <ItcClassificationControl variant="inline" ... />
 *
 *   // On customer CN/DN there's no ITC → just don't render the component.
 *
 * `reasons` is the array of { id, reason_label, reason_code } from the LOV API.
 */
const ItcClassificationControl = ({
    variant = 'inline',
    value = {},
    onChange,
    reasons = [],
    showRcm = true,
    disabled = false,
}) => {
    // Hooks at top — Rules of Hooks (popover anchor still allocated even when variant=inline).
    const [anchorEl, setAnchorEl] = useState(null);

    const itcEligible = value.itc_eligible === 0 || value.itc_eligible === false ? 0 : 1;
    const blockReasonId = value.itc_block_reason_id != null ? Number(value.itc_block_reason_id) : '';
    const isRcm = value.is_rcm === 1 || value.is_rcm === true ? 1 : 0;

    const emit = (patch) => {
        if (!onChange) return;
        onChange({
            itc_eligible: itcEligible,
            itc_block_reason_id: blockReasonId === '' ? null : Number(blockReasonId),
            is_rcm: isRcm,
            ...patch,
        });
    };

    const reasonLabel = (id) => {
        const r = reasons.find((x) => Number(x.id) === Number(id));
        return r ? r.reason_label : null;
    };

    const statusPill = () => {
        if (isRcm && !itcEligible) {
            const r = reasonLabel(blockReasonId);
            return <Chip size="small" label={`RCM · Blocked${r ? ` — ${r}` : ''}`} sx={{ bgcolor: '#ef6c00', color: '#fff' }} />;
        }
        if (isRcm) return <Chip size="small" label="RCM" sx={{ bgcolor: '#0d47a1', color: '#fff' }} />;
        if (!itcEligible) {
            const r = reasonLabel(blockReasonId);
            return <Chip size="small" label={r ? `Blocked — ${r}` : 'Blocked · pick reason'}
                sx={{ bgcolor: r ? '#d32f2f' : '#757575', color: '#fff' }} />;
        }
        return <Chip size="small" label="Eligible" sx={{ bgcolor: '#2e7d32', color: '#fff' }} />;
    };

    // ── Controls form (shared between inline + popover) ──
    const controls = (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
                control={
                    <Switch
                        size="small"
                        checked={itcEligible === 1}
                        disabled={disabled}
                        onChange={(e) => emit({
                            itc_eligible: e.target.checked ? 1 : 0,
                            // Clear reason when re-enabling eligibility; require it when blocking.
                            itc_block_reason_id: e.target.checked ? null
                                : (blockReasonId === '' ? null : Number(blockReasonId)),
                        })}
                    />
                }
                label="Claim ITC"
            />

            <FormControl size="small" sx={{ minWidth: 200 }} disabled={disabled || itcEligible === 1}>
                <InputLabel>Block reason</InputLabel>
                <Select
                    label="Block reason"
                    value={blockReasonId === '' ? '' : String(blockReasonId)}
                    onChange={(e) => emit({
                        itc_block_reason_id: e.target.value === '' ? null : Number(e.target.value),
                    })}
                >
                    <MenuItem value=""><em>— none —</em></MenuItem>
                    {reasons.map((r) => (
                        <MenuItem key={r.id} value={String(r.id)}>{r.reason_label}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {showRcm && (
                <FormControlLabel
                    control={
                        <Switch
                            size="small"
                            checked={isRcm === 1}
                            disabled={disabled}
                            onChange={(e) => emit({ is_rcm: e.target.checked ? 1 : 0 })}
                        />
                    }
                    label={
                        <Tooltip title="Reverse Charge Mechanism — buyer books both Receivable + Payable legs">
                            <span>RCM</span>
                        </Tooltip>
                    }
                />
            )}
        </Box>
    );

    if (variant === 'inline') return controls;

    // Popover variant — compact trigger showing the current status; click to edit.
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {statusPill()}
            <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} disabled={disabled}>
                <TuneIcon fontSize="inherit" />
            </IconButton>
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box sx={{ p: 2, minWidth: 360 }}>
                    <Typography variant="overline" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
                        GST · ITC classification
                    </Typography>
                    {controls}
                </Box>
            </Popover>
        </Box>
    );
};

export default ItcClassificationControl;
