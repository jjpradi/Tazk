/**
 * Sidebar panel: Grouped placeholder chips with click-to-insert.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { Box, Typography, Chip, Accordion, AccordionSummary, AccordionDetails, TextField, InputAdornment } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import { PLACEHOLDER_SECTIONS } from './builderConstants';

export default function PlaceholderPalette({ placeholders, onInsertPlaceholder }) {
    const [search, setSearch] = useState('');
    const [expandedSections, setExpandedSections] = useState({ document: true, customer: true });

    const toggleSection = useCallback((section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    }, []);

    // Filter and group by section
    const grouped = useMemo(() => {
        const result = {};
        const q = search.toLowerCase().trim();
        (placeholders || []).forEach(p => {
            if (q && !(p.placeholder_key || '').toLowerCase().includes(q) && !(p.display_label || '').toLowerCase().includes(q)) return;
            const section = p.section || 'other';
            if (!result[section]) result[section] = [];
            result[section].push(p);
        });
        return result;
    }, [placeholders, search]);

    const handleClick = (key) => {
        const text = `{{${key}}}`;
        if (onInsertPlaceholder) {
            onInsertPlaceholder(text);
        } else {
            navigator.clipboard.writeText(text);
        }
    };

    return (
        <Box sx={{ p: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', px: 0.5, mb: 1, display: 'block', fontSize: '10px' }}>
                PLACEHOLDERS
            </Typography>
            <Typography variant="caption" sx={{ color: '#999', px: 0.5, mb: 1, display: 'block', fontSize: '10px' }}>
                Click to copy, then paste into text fields
            </Typography>
            <TextField
                size="small"
                fullWidth
                placeholder="Search placeholders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16 }} /></InputAdornment> } }}
                sx={{ mb: 1, px: 0.5, '& .MuiInputBase-root': { fontSize: '11px', height: 30 } }}
            />
            {Object.entries(grouped).map(([section, items]) => (
                <Accordion key={section} disableGutters elevation={0}
                    expanded={search.trim() ? true : (expandedSections[section] || false)}
                    onChange={() => !search.trim() && toggleSection(section)}
                    sx={{ '&:before': { display: 'none' }, bgcolor: 'transparent' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />}
                        sx={{ minHeight: 28, px: 0.5, '& .MuiAccordionSummary-content': { my: 0.5 } }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px' }}>
                            {PLACEHOLDER_SECTIONS[section] || section}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0.5, pt: 0 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {items.map(p => (
                                <Chip
                                    key={p.placeholder_key}
                                    label={p.display_label || p.placeholder_key}
                                    size="small"
                                    icon={<ContentCopyIcon sx={{ fontSize: '10px !important' }} />}
                                    onClick={() => handleClick(p.placeholder_key)}
                                    sx={{
                                        fontSize: '10px', height: 22,
                                        cursor: 'pointer',
                                        bgcolor: '#e3f2fd',
                                        '&:hover': { bgcolor: '#bbdefb' },
                                        '& .MuiChip-icon': { ml: 0.5 },
                                    }}
                                />
                            ))}
                        </Box>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
}
