/**
 * Main Visual Template Builder — three-panel layout:
 * Left: Block Palette + Placeholder Palette
 * Center: Draggable Canvas
 * Right: Properties Panel for selected block
 */
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Tabs, Tab, Divider, Typography, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';
import BlockPalette from './BlockPalette';
import PlaceholderPalette from './PlaceholderPalette';
import BuilderCanvas from './BuilderCanvas';
import BlockPropertiesPanel from './BlockPropertiesPanel';
import StyleControls from './StyleControls';
import { generateBlockId } from './blockDefaults';
import { getDefaultBuilderJson } from './blockDefaults';
import { listDocPlaceholdersAction } from 'redux/actions/docTemplate_actions';
import { FONT_FAMILIES, FONT_SIZES } from './builderConstants';

export default function VisualBuilder({ builderJson, onChange, documentType, paperSize }) {
    const dispatch = useDispatch();
    const [selectedBlockId, setSelectedBlockId] = useState(null);
    const [leftTab, setLeftTab] = useState(0); // 0=blocks, 1=placeholders
    const [placeholders, setPlaceholders] = useState([]);

    useEffect(() => {
        if (documentType) {
            dispatch(listDocPlaceholdersAction(documentType))
                .then(data => setPlaceholders(data || []))
                .catch(() => {});
        }
    }, [documentType]);

    // Initialize with defaults if empty
    useEffect(() => {
        if (!builderJson || !builderJson.blocks || builderJson.blocks.length === 0) {
            onChange(getDefaultBuilderJson(documentType, paperSize));
        }
    }, []);

    const blocks = builderJson?.blocks || [];
    const pageStyles = builderJson?.pageStyles || {};
    const selectedBlock = blocks.find(b => b.id === selectedBlockId) || null;

    // ── Handlers ──

    const updateBlocks = (newBlocks) => {
        onChange({ ...builderJson, blocks: newBlocks });
    };

    const updatePageStyles = (newPageStyles) => {
        onChange({ ...builderJson, pageStyles: newPageStyles });
    };

    const handleAddBlock = (type) => {
        const newBlock = {
            id: generateBlockId(type),
            type,
            enabled: true,
            styles: {},
            content: getDefaultContentForType(type),
        };
        updateBlocks([...blocks, newBlock]);
        setSelectedBlockId(newBlock.id);
    };

    const handleBlockChange = (updatedBlock) => {
        updateBlocks(blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b));
    };

    const handleDeleteBlock = () => {
        if (!selectedBlockId) return;
        updateBlocks(blocks.filter(b => b.id !== selectedBlockId));
        setSelectedBlockId(null);
    };

    const handleMoveUp = () => {
        const idx = blocks.findIndex(b => b.id === selectedBlockId);
        if (idx <= 0) return;
        const newBlocks = [...blocks];
        [newBlocks[idx - 1], newBlocks[idx]] = [newBlocks[idx], newBlocks[idx - 1]];
        updateBlocks(newBlocks);
    };

    const handleMoveDown = () => {
        const idx = blocks.findIndex(b => b.id === selectedBlockId);
        if (idx < 0 || idx >= blocks.length - 1) return;
        const newBlocks = [...blocks];
        [newBlocks[idx], newBlocks[idx + 1]] = [newBlocks[idx + 1], newBlocks[idx]];
        updateBlocks(newBlocks);
    };

    const handleReorder = (newBlocks) => {
        updateBlocks(newBlocks);
    };

    const handleDuplicateBlock = () => {
        if (!selectedBlockId) return;
        const srcBlock = blocks.find(b => b.id === selectedBlockId);
        if (!srcBlock) return;
        const idx = blocks.findIndex(b => b.id === selectedBlockId);
        const newBlock = {
            ...JSON.parse(JSON.stringify(srcBlock)),
            id: generateBlockId(srcBlock.type),
        };
        // For row blocks, regenerate child IDs
        if (newBlock.type === 'row' && newBlock.content?.children) {
            newBlock.content.children = newBlock.content.children.map(child => ({
                ...child,
                id: generateBlockId(child.type),
            }));
        }
        const newBlocks = [...blocks];
        newBlocks.splice(idx + 1, 0, newBlock);
        updateBlocks(newBlocks);
        setSelectedBlockId(newBlock.id);
    };

    const handleInsertPlaceholder = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            {/* ── Left Panel ── */}
            <Box sx={{
                width: 220, minWidth: 220, borderRight: '1px solid #e0e0e0',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}>
                <Tabs value={leftTab} onChange={(e, v) => setLeftTab(v)}
                    sx={{ minHeight: 32, '& .MuiTab-root': { minHeight: 32, fontSize: '11px', py: 0.5 } }}>
                    <Tab label="Blocks" />
                    <Tab label="Placeholders" />
                </Tabs>
                <Divider />
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                    {leftTab === 0 && <BlockPalette onAddBlock={handleAddBlock} />}
                    {leftTab === 1 && (
                        <PlaceholderPalette
                            placeholders={placeholders}
                            onInsertPlaceholder={handleInsertPlaceholder}
                        />
                    )}
                </Box>

                {/* Page-level styles */}
                <Divider />
                <Box sx={{ p: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block', fontSize: '10px' }}>
                        PAGE STYLES
                    </Typography>
                    <FormControl size="small" fullWidth sx={{ mb: 0.5, '& .MuiInputBase-root': { fontSize: '11px', height: 30 }, '& .MuiInputLabel-root': { fontSize: '11px' } }}>
                        <InputLabel>Font</InputLabel>
                        <Select value={pageStyles.fontFamily || ''} label="Font"
                            onChange={(e) => updatePageStyles({ ...pageStyles, fontFamily: e.target.value })}>
                            {FONT_FAMILIES.map(f => (
                                <MenuItem key={f.value} value={f.value} sx={{ fontSize: '11px' }}>{f.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <FormControl size="small" sx={{ flex: 1, '& .MuiInputBase-root': { fontSize: '11px', height: 30 }, '& .MuiInputLabel-root': { fontSize: '11px' } }}>
                            <InputLabel>Size</InputLabel>
                            <Select value={pageStyles.fontSize || '12px'} label="Size"
                                onChange={(e) => updatePageStyles({ ...pageStyles, fontSize: e.target.value })}>
                                {FONT_SIZES.map(s => (
                                    <MenuItem key={s} value={s} sx={{ fontSize: '11px' }}>{s}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField size="small" type="color" value={pageStyles.color || '#333333'}
                            onChange={(e) => updatePageStyles({ ...pageStyles, color: e.target.value })}
                            sx={{ width: 36, '& input': { p: '2px', height: 26, cursor: 'pointer' } }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* ── Center Canvas ── */}
            <BuilderCanvas
                blocks={blocks}
                selectedBlockId={selectedBlockId}
                onSelectBlock={setSelectedBlockId}
                onReorder={handleReorder}
                paperSize={paperSize}
            />

            {/* ── Right Panel ── */}
            <Box sx={{
                width: 280, minWidth: 280, borderLeft: '1px solid #e0e0e0',
                overflow: 'auto',
            }}>
                <BlockPropertiesPanel
                    block={selectedBlock}
                    onChange={handleBlockChange}
                    onDelete={handleDeleteBlock}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onDuplicate={handleDuplicateBlock}
                />
            </Box>
        </Box>
    );
}

// ── Default content for new blocks ──

function getDefaultContentForType(type) {
    switch (type) {
        case 'header':
            return { titleText: '{{company.name}}', subtitleLines: ['{{company.address}}'] };
        case 'company_info':
            return { titleText: '{{company.name}}', subtitleLines: ['{{company.address}}', 'Ph: {{company.phone}}'] };
        case 'document_info':
            return { fields: [{ label: 'Number', value: '{{document.number}}' }, { label: 'Date', value: '{{document.date}}' }] };
        case 'customer_info':
            return { fields: [{ label: 'Name', value: '{{customer.name}}' }, { label: 'Phone', value: '{{customer.phone}}' }] };
        case 'items_table':
            return {
                loopKey: 'items',
                columns: [
                    { key: '@index', label: '#', width: '30px', align: 'center' },
                    { key: 'this.name', label: 'Item', width: 'auto', align: 'left' },
                    { key: 'this.quantity', label: 'Qty', width: '50px', align: 'right' },
                    { key: 'this.unit_price', label: 'Price', width: '70px', align: 'right' },
                    { key: 'this.total', label: 'Total', width: '80px', align: 'right' },
                ],
                showSerialNumbers: false,
            };
        case 'tax_summary':
            return { showCGST: true, showSGST: true, showIGST: true };
        case 'totals':
            return { rows: [{ label: 'Subtotal', value: '{{totals.subtotal}}' }, { label: 'Grand Total', value: '{{totals.grand_total}}', bold: true }] };
        case 'payments':
            return { loopKey: 'payments.splits', rows: [{ label: 'Received', value: '{{payments.total_received}}' }] };
        case 'signature':
            return { leftLabel: 'Customer Signature', rightLabel: 'Authorized Signatory' };
        case 'terms':
            return { text: '{{settings.terms_text}}' };
        case 'bank_details':
            return {
                fields: [
                    { label: 'Bank Name', value: '{{company.bank_name}}' },
                    { label: 'Account No', value: '{{company.account_no}}' },
                    { label: 'IFSC Code', value: '{{company.ifsc_code}}' },
                    { label: 'Branch', value: '{{company.branch_name}}' },
                ],
            };
        case 'footer':
            return { text: '{{settings.footer_note}}' };
        case 'custom_text':
            return { html: '<p>Your text here</p>' };
        case 'shipping_info':
            return {
                conditionalWrap: 'ship_to.name',
                fields: [
                    { label: 'Ship To', value: '{{ship_to.name}}', bold: true },
                    { label: 'Address', value: '{{ship_to.address}}, {{ship_to.city}}, {{ship_to.state}} - {{ship_to.zip}}' },
                    { label: 'Phone', value: '{{ship_to.phone}}', conditional: 'ship_to.phone' },
                    { label: 'GSTIN', value: '{{ship_to.gstin}}', conditional: 'ship_to.gstin' },
                ],
            };
        case 'e_invoice':
            return {
                fields: [
                    { label: 'IRN', value: '{{document.irn}}' },
                    { label: 'Ack No', value: '{{document.ack_no}}' },
                    { label: 'Ack Date', value: '{{document.ack_date}}' },
                ],
            };
        case 'amount_in_words':
            return { text: '{{totals.amount_in_words}}', prefix: 'Amount in Words: ' };
        case 'declaration':
            return { text: '{{settings.declaration_text}}', title: 'Declaration' };
        case 'qr_code':
            return { placeholder: '{{document.qr_data}}', size: '120px', alignment: 'right' };
        case 'row':
            return {
                columns: 2,
                gap: '16px',
                children: [],
            };
        case 'divider':
        case 'spacer':
        default:
            return {};
    }
}
