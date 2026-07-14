/**
 * Right panel: content + style editing for the selected block.
 */
import React from 'react';
import {
    Box, Typography, TextField, Switch, FormControlLabel, Divider,
    IconButton, Select, MenuItem, FormControl, InputLabel, Button, Chip, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import StyleControls from './StyleControls';
import { BLOCK_TYPES } from './builderConstants';

export default function BlockPropertiesPanel({ block, onChange, onDelete, onMoveUp, onMoveDown, onDuplicate }) {
    if (!block) {
        return (
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>No block selected</Typography>
                <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
                    Click a block on the canvas to edit its content and styles, or add new blocks from the left panel.
                </Typography>
            </Box>
        );
    }

    const blockType = BLOCK_TYPES[block.type] || {};

    const updateContent = (key, value) => {
        onChange({ ...block, content: { ...block.content, [key]: value } });
    };

    const updateStyles = (newStyles) => {
        onChange({ ...block, styles: newStyles });
    };

    const updateEnabled = (enabled) => {
        onChange({ ...block, enabled });
    };

    // ── Content editors by block type ──
    const renderContentEditor = () => {
        const c = block.content || {};

        switch (block.type) {
            case 'header':
            case 'company_info':
                return (
                    <>
                        <FormControlLabel
                            control={<Switch size="small" checked={c.showLogo || false}
                                onChange={(e) => updateContent('showLogo', e.target.checked)} />}
                            label="Show Logo" sx={{ mb: 0.5 }} />
                        {c.showLogo && (
                            <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                                <FormControl size="small" sx={{ flex: 1 }}>
                                    <InputLabel>Logo Position</InputLabel>
                                    <Select value={c.logoPosition || 'top'} label="Logo Position"
                                        onChange={(e) => updateContent('logoPosition', e.target.value)}>
                                        <MenuItem value="left">Left</MenuItem>
                                        <MenuItem value="top">Top</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField size="small" label="Max Height" value={c.logoMaxHeight || '60px'}
                                    sx={{ width: '40%' }}
                                    onChange={(e) => updateContent('logoMaxHeight', e.target.value)} />
                            </Box>
                        )}
                        <TextField size="small" label="Title" fullWidth value={c.titleText || ''}
                            onChange={(e) => updateContent('titleText', e.target.value)}
                            helperText="Use {{placeholder}} syntax" sx={{ mb: 1 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>Subtitle Lines</Typography>
                        {(c.subtitleLines || []).map((line, i) => (
                            <Box key={i} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                                <TextField size="small" fullWidth value={line}
                                    onChange={(e) => {
                                        const lines = [...(c.subtitleLines || [])];
                                        lines[i] = e.target.value;
                                        updateContent('subtitleLines', lines);
                                    }} />
                                <IconButton size="small" onClick={() => {
                                    const lines = (c.subtitleLines || []).filter((_, j) => j !== i);
                                    updateContent('subtitleLines', lines);
                                }}><DeleteIcon fontSize="small" /></IconButton>
                            </Box>
                        ))}
                        <Button size="small" startIcon={<AddIcon />}
                            onClick={() => updateContent('subtitleLines', [...(c.subtitleLines || []), ''])}>
                            Add Line
                        </Button>
                    </>
                );

            case 'document_info':
            case 'customer_info':
            case 'shipping_info':
            case 'e_invoice':
                return (
                    <>
                        {(block.type === 'customer_info' || block.type === 'shipping_info') && (
                            <TextField size="small" label="Conditional Wrap" fullWidth value={c.conditionalWrap || ''}
                                onChange={(e) => updateContent('conditionalWrap', e.target.value)}
                                helperText="Show block only if this placeholder has value" sx={{ mb: 1 }} />
                        )}
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>Fields</Typography>
                        {(c.fields || []).map((f, i) => (
                            <Box key={i} sx={{ mb: 0.5 }}>
                                <Box sx={{ display: 'flex', gap: 0.5, mb: 0.25 }}>
                                    <TextField size="small" label="Label" value={f.label || ''}
                                        sx={{ width: '35%' }}
                                        onChange={(e) => {
                                            const fields = [...(c.fields || [])];
                                            fields[i] = { ...fields[i], label: e.target.value };
                                            updateContent('fields', fields);
                                        }} />
                                    <TextField size="small" label="Value" value={f.value || ''}
                                        sx={{ flex: 1 }}
                                        onChange={(e) => {
                                            const fields = [...(c.fields || [])];
                                            fields[i] = { ...fields[i], value: e.target.value };
                                            updateContent('fields', fields);
                                        }} />
                                    <IconButton size="small" onClick={() => {
                                        const fields = (c.fields || []).filter((_, j) => j !== i);
                                        updateContent('fields', fields);
                                    }}><DeleteIcon fontSize="small" /></IconButton>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 0.5, pl: 0.5 }}>
                                    <TextField size="small" label="Conditional" value={f.conditional || ''}
                                        sx={{ flex: 1 }}
                                        onChange={(e) => {
                                            const fields = [...(c.fields || [])];
                                            fields[i] = { ...fields[i], conditional: e.target.value };
                                            updateContent('fields', fields);
                                        }}
                                        placeholder="e.g. customer.email" />
                                    <FormControlLabel
                                        control={<Switch size="small" checked={f.bold || false}
                                            onChange={(e) => {
                                                const fields = [...(c.fields || [])];
                                                fields[i] = { ...fields[i], bold: e.target.checked };
                                                updateContent('fields', fields);
                                            }} />}
                                        label="B" sx={{ mx: 0 }} />
                                </Box>
                            </Box>
                        ))}
                        <Button size="small" startIcon={<AddIcon />}
                            onClick={() => updateContent('fields', [...(c.fields || []), { label: '', value: '' }])}>
                            Add Field
                        </Button>
                    </>
                );

            case 'items_table':
                return (
                    <>
                        <TextField size="small" label="Loop Key" fullWidth value={c.loopKey || 'items'}
                            onChange={(e) => updateContent('loopKey', e.target.value)}
                            sx={{ mb: 1 }} />
                        <FormControlLabel
                            control={<Switch size="small" checked={c.showSerialNumbers || false}
                                onChange={(e) => updateContent('showSerialNumbers', e.target.checked)} />}
                            label="Show Serial Numbers" />
                        <Typography variant="caption" sx={{ fontWeight: 600, mt: 1, display: 'block' }}>Columns</Typography>
                        {(c.columns || []).map((col, i) => (
                            <Box key={i} sx={{ display: 'flex', gap: 0.5, mb: 0.5, alignItems: 'center' }}>
                                <TextField size="small" label="Label" value={col.label || ''}
                                    sx={{ width: '25%' }}
                                    onChange={(e) => {
                                        const cols = [...(c.columns || [])];
                                        cols[i] = { ...cols[i], label: e.target.value };
                                        updateContent('columns', cols);
                                    }} />
                                <TextField size="small" label="Key" value={col.key || ''}
                                    sx={{ width: '30%' }}
                                    onChange={(e) => {
                                        const cols = [...(c.columns || [])];
                                        cols[i] = { ...cols[i], key: e.target.value };
                                        updateContent('columns', cols);
                                    }} />
                                <TextField size="small" label="Width" value={col.width || ''}
                                    sx={{ width: '20%' }}
                                    onChange={(e) => {
                                        const cols = [...(c.columns || [])];
                                        cols[i] = { ...cols[i], width: e.target.value };
                                        updateContent('columns', cols);
                                    }} />
                                <FormControl size="small" sx={{ width: '15%' }}>
                                    <Select value={col.align || 'left'}
                                        onChange={(e) => {
                                            const cols = [...(c.columns || [])];
                                            cols[i] = { ...cols[i], align: e.target.value };
                                            updateContent('columns', cols);
                                        }}>
                                        <MenuItem value="left">L</MenuItem>
                                        <MenuItem value="center">C</MenuItem>
                                        <MenuItem value="right">R</MenuItem>
                                    </Select>
                                </FormControl>
                                <IconButton size="small" onClick={() => {
                                    const cols = (c.columns || []).filter((_, j) => j !== i);
                                    updateContent('columns', cols);
                                }}><DeleteIcon fontSize="small" /></IconButton>
                            </Box>
                        ))}
                        <Button size="small" startIcon={<AddIcon />}
                            onClick={() => updateContent('columns', [...(c.columns || []), { key: '', label: '', width: 'auto', align: 'left' }])}>
                            Add Column
                        </Button>
                    </>
                );

            case 'totals':
                return (
                    <>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>Total Rows</Typography>
                        {(c.rows || []).map((r, i) => (
                            <Box key={i} sx={{ mb: 0.5 }}>
                                <Box sx={{ display: 'flex', gap: 0.5, mb: 0.25, alignItems: 'center' }}>
                                    <TextField size="small" label="Label" value={r.label || ''}
                                        sx={{ width: '30%' }}
                                        onChange={(e) => {
                                            const rows = [...(c.rows || [])];
                                            rows[i] = { ...rows[i], label: e.target.value };
                                            updateContent('rows', rows);
                                        }} />
                                    <TextField size="small" label="Value" value={r.value || ''}
                                        sx={{ flex: 1 }}
                                        onChange={(e) => {
                                            const rows = [...(c.rows || [])];
                                            rows[i] = { ...rows[i], value: e.target.value };
                                            updateContent('rows', rows);
                                        }} />
                                    <FormControlLabel
                                        control={<Switch size="small" checked={r.bold || false}
                                            onChange={(e) => {
                                                const rows = [...(c.rows || [])];
                                                rows[i] = { ...rows[i], bold: e.target.checked };
                                                updateContent('rows', rows);
                                            }} />}
                                        label="B" sx={{ mx: 0 }} />
                                    <IconButton size="small" onClick={() => {
                                        const rows = (c.rows || []).filter((_, j) => j !== i);
                                        updateContent('rows', rows);
                                    }}><DeleteIcon fontSize="small" /></IconButton>
                                </Box>
                                <TextField size="small" label="Show only if" value={r.conditional || ''}
                                    fullWidth
                                    onChange={(e) => {
                                        const rows = [...(c.rows || [])];
                                        rows[i] = { ...rows[i], conditional: e.target.value };
                                        updateContent('rows', rows);
                                    }}
                                    placeholder="e.g. totals.discount" sx={{ pl: 0.5 }} />
                            </Box>
                        ))}
                        <Button size="small" startIcon={<AddIcon />}
                            onClick={() => updateContent('rows', [...(c.rows || []), { label: '', value: '', bold: false }])}>
                            Add Row
                        </Button>
                    </>
                );

            case 'payments':
                return (
                    <>
                        <TextField size="small" label="Loop Key" fullWidth value={c.loopKey || 'payments.splits'}
                            onChange={(e) => updateContent('loopKey', e.target.value)} sx={{ mb: 1 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>Static Rows</Typography>
                        {(c.rows || []).map((r, i) => (
                            <Box key={i} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                                <TextField size="small" label="Label" value={r.label || ''}
                                    sx={{ width: '35%' }}
                                    onChange={(e) => {
                                        const rows = [...(c.rows || [])];
                                        rows[i] = { ...rows[i], label: e.target.value };
                                        updateContent('rows', rows);
                                    }} />
                                <TextField size="small" label="Value" value={r.value || ''}
                                    sx={{ flex: 1 }}
                                    onChange={(e) => {
                                        const rows = [...(c.rows || [])];
                                        rows[i] = { ...rows[i], value: e.target.value };
                                        updateContent('rows', rows);
                                    }} />
                                <IconButton size="small" onClick={() => {
                                    const rows = (c.rows || []).filter((_, j) => j !== i);
                                    updateContent('rows', rows);
                                }}><DeleteIcon fontSize="small" /></IconButton>
                            </Box>
                        ))}
                        <Button size="small" startIcon={<AddIcon />}
                            onClick={() => updateContent('rows', [...(c.rows || []), { label: '', value: '' }])}>
                            Add Row
                        </Button>
                    </>
                );

            case 'signature':
                return (
                    <>
                        <TextField size="small" label="Left Label" fullWidth value={c.leftLabel || ''}
                            onChange={(e) => updateContent('leftLabel', e.target.value)} sx={{ mb: 1 }} />
                        <TextField size="small" label="Right Label" fullWidth value={c.rightLabel || ''}
                            onChange={(e) => updateContent('rightLabel', e.target.value)} />
                    </>
                );

            case 'bank_details':
                return (
                    <>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>Bank Fields</Typography>
                        {(c.fields || []).map((f, i) => (
                            <Box key={i} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                                <TextField size="small" label="Label" value={f.label || ''}
                                    sx={{ width: '35%' }}
                                    onChange={(e) => {
                                        const fields = [...(c.fields || [])];
                                        fields[i] = { ...fields[i], label: e.target.value };
                                        updateContent('fields', fields);
                                    }} />
                                <TextField size="small" label="Value" value={f.value || ''}
                                    sx={{ flex: 1 }}
                                    onChange={(e) => {
                                        const fields = [...(c.fields || [])];
                                        fields[i] = { ...fields[i], value: e.target.value };
                                        updateContent('fields', fields);
                                    }} />
                                <IconButton size="small" onClick={() => {
                                    const fields = (c.fields || []).filter((_, j) => j !== i);
                                    updateContent('fields', fields);
                                }}><DeleteIcon fontSize="small" /></IconButton>
                            </Box>
                        ))}
                        <Button size="small" startIcon={<AddIcon />}
                            onClick={() => updateContent('fields', [...(c.fields || []), { label: '', value: '' }])}>
                            Add Field
                        </Button>
                    </>
                );

            case 'terms':
            case 'footer':
                return (
                    <TextField size="small" label="Text" fullWidth multiline rows={3}
                        value={c.text || ''}
                        onChange={(e) => updateContent('text', e.target.value)}
                        helperText="Use {{placeholder}} syntax" />
                );

            case 'amount_in_words':
                return (
                    <>
                        <TextField size="small" label="Prefix" fullWidth value={c.prefix || 'Amount in Words: '}
                            onChange={(e) => updateContent('prefix', e.target.value)} sx={{ mb: 1 }} />
                        <TextField size="small" label="Placeholder" fullWidth value={c.text || '{{totals.amount_in_words}}'}
                            onChange={(e) => updateContent('text', e.target.value)}
                            helperText="Use {{placeholder}} syntax" />
                    </>
                );

            case 'declaration':
                return (
                    <>
                        <TextField size="small" label="Title" fullWidth value={c.title || 'Declaration'}
                            onChange={(e) => updateContent('title', e.target.value)} sx={{ mb: 1 }} />
                        <TextField size="small" label="Text" fullWidth multiline rows={3}
                            value={c.text || ''}
                            onChange={(e) => updateContent('text', e.target.value)}
                            helperText="Use {{placeholder}} syntax" />
                    </>
                );

            case 'qr_code':
                return (
                    <>
                        <TextField size="small" label="Data Placeholder" fullWidth value={c.placeholder || '{{document.qr_data}}'}
                            onChange={(e) => updateContent('placeholder', e.target.value)}
                            helperText="Placeholder for QR image URL or data" sx={{ mb: 1 }} />
                        <TextField size="small" label="Size" fullWidth value={c.size || '120px'}
                            onChange={(e) => updateContent('size', e.target.value)} sx={{ mb: 1 }} />
                        <FormControl size="small" fullWidth>
                            <InputLabel>Alignment</InputLabel>
                            <Select value={c.alignment || 'right'} label="Alignment"
                                onChange={(e) => updateContent('alignment', e.target.value)}>
                                <MenuItem value="left">Left</MenuItem>
                                <MenuItem value="center">Center</MenuItem>
                                <MenuItem value="right">Right</MenuItem>
                            </Select>
                        </FormControl>
                    </>
                );

            case 'row':
                return (
                    <>
                        <FormControl size="small" fullWidth sx={{ mb: 1 }}>
                            <InputLabel>Columns</InputLabel>
                            <Select value={c.columns || 2} label="Columns"
                                onChange={(e) => updateContent('columns', e.target.value)}>
                                <MenuItem value={2}>2 Columns</MenuItem>
                                <MenuItem value={3}>3 Columns</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField size="small" label="Gap" fullWidth value={c.gap || '16px'}
                            onChange={(e) => updateContent('gap', e.target.value)}
                            helperText="Space between columns" sx={{ mb: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                            Row children are configured via the canvas. Drag blocks inside this row.
                        </Typography>
                    </>
                );

            case 'custom_text':
                return (
                    <TextField size="small" label="HTML Content" fullWidth multiline rows={4}
                        value={c.html || ''}
                        onChange={(e) => updateContent('html', e.target.value)}
                        helperText="HTML with {{placeholder}} syntax"
                        slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: 11 } } }} />
                );

            case 'tax_summary':
                return (
                    <>
                        <FormControlLabel control={<Switch size="small" checked={c.showCGST !== false}
                            onChange={(e) => updateContent('showCGST', e.target.checked)} />} label="Show CGST" />
                        <FormControlLabel control={<Switch size="small" checked={c.showSGST !== false}
                            onChange={(e) => updateContent('showSGST', e.target.checked)} />} label="Show SGST" />
                        <FormControlLabel control={<Switch size="small" checked={c.showIGST !== false}
                            onChange={(e) => updateContent('showIGST', e.target.checked)} />} label="Show IGST" />
                    </>
                );

            case 'spacer':
                return (
                    <TextField size="small" label="Height" fullWidth
                        value={block.styles?.height || '16px'}
                        onChange={(e) => updateStyles({ ...block.styles, height: e.target.value })}
                        helperText="e.g. 16px, 10mm" />
                );

            case 'divider':
                return (
                    <Typography variant="caption" color="text.secondary">
                        Style the divider using the border control below.
                    </Typography>
                );

            default:
                return null;
        }
    };

    return (
        <Box sx={{
            p: 1, overflow: 'auto', height: '100%',
            '& .MuiInputBase-root': { fontSize: '11px' },
            '& .MuiInputLabel-root': { fontSize: '11px' },
            '& .MuiFormControlLabel-label': { fontSize: '11px' },
            '& .MuiInputBase-input': { fontSize: '11px' },
            '& .MuiFormHelperText-root': { fontSize: '9px' },
            '& .MuiButton-root': { fontSize: '11px' },
        }}>
            {/* Block header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box>
                    <Typography variant="subtitle2" sx={{ fontSize: '12px', fontWeight: 600 }}>
                        {blockType.label || block.type}
                    </Typography>
                    <Chip label={block.type} size="small" variant="outlined" sx={{ fontSize: '9px', height: 18 }} />
                </Box>
                <Box sx={{ display: 'flex', gap: 0.25 }}>
                    <Tooltip title="Move Up" arrow><IconButton size="small" onClick={onMoveUp}><ArrowUpwardIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                    <Tooltip title="Move Down" arrow><IconButton size="small" onClick={onMoveDown}><ArrowDownwardIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                    <Tooltip title="Duplicate Block" arrow><IconButton size="small" onClick={onDuplicate}><ContentCopyIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                    <Tooltip title="Delete Block" arrow><IconButton size="small" color="error" onClick={onDelete}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                </Box>
            </Box>

            {/* Visibility toggle */}
            <FormControlLabel
                control={<Switch size="small" checked={block.enabled}
                    onChange={(e) => updateEnabled(e.target.checked)} />}
                label={<Typography variant="caption" sx={{ color: block.enabled ? 'success.main' : 'text.disabled' }}>
                    {block.enabled ? 'Visible in PDF' : 'Hidden from PDF'}
                </Typography>}
                sx={{ mb: 1 }} />

            <Divider sx={{ my: 1 }} />

            {/* Content editor */}
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
                Content
            </Typography>
            <Box sx={{ mb: 2 }}>
                {renderContentEditor()}
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Style controls */}
            <StyleControls styles={block.styles || {}} onChange={updateStyles} compact />
        </Box>
    );
}
