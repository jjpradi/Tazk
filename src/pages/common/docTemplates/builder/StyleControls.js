import React from 'react';
import {
    Box, TextField, Select, MenuItem, FormControl, InputLabel,
    ToggleButtonGroup, ToggleButton, Typography
} from '@mui/material';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import { FONT_FAMILIES, FONT_SIZES } from './builderConstants';

export default function StyleControls({ styles, onChange, compact = false }) {
    const update = (key, value) => {
        onChange({ ...styles, [key]: value });
    };

    const size = 'small';
    const gap = compact ? 0.5 : 1;

    return (
        <Box sx={{
            display: 'flex', flexDirection: 'column', gap,
            '& .MuiInputBase-root': { fontSize: '11px' },
            '& .MuiInputLabel-root': { fontSize: '11px' },
            '& .MuiInputBase-input': { fontSize: '11px' },
        }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, fontSize: '10px' }}>
                Styles
            </Typography>

            {/* Font Family */}
            <FormControl size={size} fullWidth>
                <InputLabel>Font</InputLabel>
                <Select value={styles.fontFamily || ''} label="Font"
                    onChange={(e) => update('fontFamily', e.target.value)}>
                    <MenuItem value="">Default</MenuItem>
                    {FONT_FAMILIES.map(f => (
                        <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Font Size + Color */}
            <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl size={size} sx={{ flex: 1 }}>
                    <InputLabel>Size</InputLabel>
                    <Select value={styles.fontSize || ''} label="Size"
                        onChange={(e) => update('fontSize', e.target.value)}>
                        <MenuItem value="">Default</MenuItem>
                        {FONT_SIZES.map(s => (
                            <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField size={size} label="Color" type="color"
                    value={styles.color || '#333333'}
                    onChange={(e) => update('color', e.target.value)}
                    sx={{ width: 70 }}
                    slotProps={{ input: { sx: { height: 40 } } }}
                />
            </Box>

            {/* Alignment */}
            <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Align</Typography>
                <ToggleButtonGroup size="small" exclusive
                    value={styles.textAlign || 'left'}
                    onChange={(e, v) => { if (v) update('textAlign', v); }}>
                    <ToggleButton value="left"><FormatAlignLeftIcon fontSize="small" /></ToggleButton>
                    <ToggleButton value="center"><FormatAlignCenterIcon fontSize="small" /></ToggleButton>
                    <ToggleButton value="right"><FormatAlignRightIcon fontSize="small" /></ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Margins */}
            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField size={size} label="Margin Top" value={styles.marginTop || ''}
                    onChange={(e) => update('marginTop', e.target.value)}
                    placeholder="0px" sx={{ flex: 1 }} />
                <TextField size={size} label="Margin Bottom" value={styles.marginBottom || ''}
                    onChange={(e) => update('marginBottom', e.target.value)}
                    placeholder="0px" sx={{ flex: 1 }} />
            </Box>

            {/* Padding */}
            <TextField size={size} label="Padding" value={styles.padding || ''}
                onChange={(e) => update('padding', e.target.value)}
                placeholder="e.g. 4px 8px" fullWidth />

            {/* Border */}
            <TextField size={size} label="Border" value={styles.borderBottom || styles.border || ''}
                onChange={(e) => update('borderBottom', e.target.value)}
                placeholder="e.g. 1px solid #ddd" fullWidth />

            {/* Background */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField size={size} label="Background" type="color"
                    value={styles.backgroundColor || '#ffffff'}
                    onChange={(e) => update('backgroundColor', e.target.value === '#ffffff' ? '' : e.target.value)}
                    sx={{ width: 70 }}
                    slotProps={{ input: { sx: { height: 40 } } }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {styles.backgroundColor || 'transparent'}
                </Typography>
            </Box>
        </Box>
    );
}
