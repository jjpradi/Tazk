import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
    Button, TextField, Box, Grid, Typography,
    FormControlLabel, Switch, Divider, Tabs, Tab, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PreviewIcon from '@mui/icons-material/Preview';
import PublishIcon from '@mui/icons-material/Publish';
import DOMPurify from 'dompurify';
import {
    getDocTemplateAction,
    saveDraftAction,
    publishDocTemplateAction,
    updateDocTemplateMetaAction
} from 'redux/actions/docTemplate_actions';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { OpenalertActions } from 'redux/actions/alert_actions';
import VisualBuilder from './builder/VisualBuilder';
import builderToHtml from './builder/builderToHtml';

function TemplateEditor({ templateId, onClose }) {
    const dispatch = useDispatch();
    const [template, setTemplate] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [htmlContent, setHtmlContent] = useState('');
    const [cssContent, setCssContent] = useState('');
    const [settings, setSettings] = useState({});
    const [builderJson, setBuilderJson] = useState(null);
    const [previewHtml, setPreviewHtml] = useState('');
    const [saving, setSaving] = useState(false);
    const [meta, setMeta] = useState({ template_name: '', document_type: '', paper_size: '' });

    useEffect(() => {
        if (templateId) loadTemplate();
    }, [templateId]);

    const loadTemplate = async () => {
        const data = await dispatch(getDocTemplateAction(templateId));
        if (data) {
            setTemplate(data);
            setHtmlContent(data.html_content || '');
            setCssContent(data.css_content || '');
            setSettings(data.settings_json || {});
            setBuilderJson(data.builder_json || null);
            setMeta({ template_name: data.template_name, document_type: data.document_type, paper_size: data.paper_size });
            if (data.builder_json && data.builder_json.blocks && data.builder_json.blocks.length > 0) {
                setActiveTab(1);
            }
        }
    };

    const handleSettingsChange = (key) => (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setSettings(prev => ({ ...prev, [key]: val }));
    };

    const handleBuilderChange = (newBuilderJson) => {
        setBuilderJson(newBuilderJson);
        const { html_content, css_content } = builderToHtml(newBuilderJson);
        setHtmlContent(html_content);
        setCssContent(css_content);
    };

    const handleSave = async () => {
        setSaving(true);
        // Save meta (name, document_type, paper_size)
        await dispatch(updateDocTemplateMetaAction(templateId, {
            template_name: meta.template_name,
            document_type: meta.document_type,
            paper_size: meta.paper_size,
            output_type: 'print'
        }));
        // Save content
        const result = await dispatch(saveDraftAction(templateId, {
            settings_json: settings,
            builder_json: builderJson,
            html_content: htmlContent,
            css_content: cssContent
        }));
        setSaving(false);
        if (result) {
            dispatch(OpenalertActions({ msg: 'Draft saved', severity: 'success' }));
        }
    };

    const handlePublish = async () => {
        const saveResult = await dispatch(saveDraftAction(templateId, {
            settings_json: settings,
            builder_json: builderJson,
            html_content: htmlContent,
            css_content: cssContent
        }));
        if (saveResult) {
            await dispatch(publishDocTemplateAction(templateId, { version: saveResult.version }));
            onClose();
        }
    };

    const handlePreview = () => {
        if (activeTab === 1 && builderJson) {
            const { html_content, css_content } = builderToHtml(builderJson);
            setHtmlContent(html_content);
            setCssContent(css_content);
            setPreviewHtml(`<style>${css_content}</style>${html_content}`);
        } else {
            setPreviewHtml(`<style>${cssContent}</style>${htmlContent}`);
        }
        setActiveTab(3);
    };

    if (!template) return null;

    return (
        <Box sx={{ p: 2, height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header with back button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={onClose} size="small">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6">{meta.template_name || template.template_name}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        v{template.current_version} | {meta.document_type} | {meta.paper_size}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<PreviewIcon />} onClick={handlePreview}>Preview</Button>
                    <Button size="small" startIcon={<SaveIcon />} variant="outlined"
                        onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button size="small" startIcon={<PublishIcon />} variant="contained"
                        color="success" onClick={handlePublish}>Publish</Button>
                </Box>
            </Box>

            {/* Tabs */}
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}
                sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 36, flexShrink: 0,
                    '& .MuiTab-root': { minHeight: 36, fontSize: '12px' } }}>
                <Tab label="Settings" />
                <Tab label="Visual Builder" />
                <Tab label="HTML / CSS" />
                <Tab label="Preview" />
            </Tabs>

            {/* Tab Content */}
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', mt: 1 }}>
                {/* Tab 0: Settings */}
                {activeTab === 0 && (
                    <Box sx={{ p: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Template Details</Typography>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField label="Template Name" size="small" fullWidth
                                    value={meta.template_name}
                                    onChange={(e) => setMeta(prev => ({ ...prev, template_name: e.target.value }))} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Document Type</InputLabel>
                                    <Select value={meta.document_type} label="Document Type"
                                        onChange={(e) => setMeta(prev => ({ ...prev, document_type: e.target.value }))}>
                                        <MenuItem value="sales_invoice">Sales Invoice</MenuItem>
                                        <MenuItem value="pos_receipt">POS Receipt</MenuItem>
                                        <MenuItem value="quotation">Quotation</MenuItem>
                                        <MenuItem value="sales_order">Sales Order</MenuItem>
                                        <MenuItem value="delivery_challan">Delivery Challan</MenuItem>
                                        <MenuItem value="credit_note">Credit Note</MenuItem>
                                        <MenuItem value="debit_note">Debit Note</MenuItem>
                                        <MenuItem value="proforma_invoice">Proforma Invoice</MenuItem>
                                        <MenuItem value="purchase_order">Purchase Order</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Paper Size</InputLabel>
                                    <Select value={meta.paper_size} label="Paper Size"
                                        onChange={(e) => setMeta(prev => ({ ...prev, paper_size: e.target.value }))}>
                                        <MenuItem value="A4_portrait">A4 Portrait</MenuItem>
                                        <MenuItem value="A4_landscape">A4 Landscape</MenuItem>
                                        <MenuItem value="A5_portrait">A5 Portrait</MenuItem>
                                        <MenuItem value="A5_landscape">A5 Landscape</MenuItem>
                                        <MenuItem value="thermal_80mm">Thermal 80mm</MenuItem>
                                        <MenuItem value="thermal_58mm">Thermal 58mm</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Section Visibility</Typography>
                        <Grid container spacing={1}>
                            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                                <FormControlLabel control={
                                    <Switch checked={!settings.hide_logo} onChange={(e) =>
                                        setSettings(prev => ({ ...prev, hide_logo: !e.target.checked }))} size="small" />
                                } label="Show Logo" />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                                <FormControlLabel control={
                                    <Switch checked={!settings.hide_gst} onChange={(e) =>
                                        setSettings(prev => ({ ...prev, hide_gst: !e.target.checked }))} size="small" />
                                } label="Show GST" />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                                <FormControlLabel control={
                                    <Switch checked={!settings.hide_signature} onChange={(e) =>
                                        setSettings(prev => ({ ...prev, hide_signature: !e.target.checked }))} size="small" />
                                } label="Show Signature" />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                                <FormControlLabel control={
                                    <Switch checked={!settings.hide_bank_details} onChange={(e) =>
                                        setSettings(prev => ({ ...prev, hide_bank_details: !e.target.checked }))} size="small" />
                                } label="Show Bank Details" />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                                <FormControlLabel control={
                                    <Switch checked={!settings.hide_terms} onChange={(e) =>
                                        setSettings(prev => ({ ...prev, hide_terms: !e.target.checked }))} size="small" />
                                } label="Show Terms" />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Custom Text</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Footer Note" size="small" fullWidth multiline rows={2}
                                    value={settings.footer_note || ''}
                                    onChange={handleSettingsChange('footer_note')} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Terms & Conditions" size="small" fullWidth multiline rows={2}
                                    value={settings.terms_text || ''}
                                    onChange={handleSettingsChange('terms_text')} />
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Tab 1: Visual Builder */}
                {activeTab === 1 && (
                    <Box sx={{ height: '100%', overflow: 'hidden' }}>
                        <VisualBuilder
                            builderJson={builderJson}
                            onChange={handleBuilderChange}
                            documentType={meta.document_type || template.document_type}
                            paperSize={meta.paper_size || template.paper_size}
                        />
                    </Box>
                )}

                {/* Tab 2: HTML/CSS Editor */}
                {activeTab === 2 && (
                    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>HTML Template</Typography>
                            <TextField fullWidth multiline rows={14} size="small"
                                value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)}
                                slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: 12 } } }}
                                placeholder="Use {{placeholder.key}} for dynamic values, {{#if field}}...{{/if}} for conditionals, {{#each items}}...{{/each}} for loops" />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>CSS Styles</Typography>
                            <TextField fullWidth multiline rows={8} size="small"
                                value={cssContent} onChange={(e) => setCssContent(e.target.value)}
                                slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: 12 } } }}
                                placeholder=".receipt { width: 72mm; font-family: monospace; }" />
                        </Box>
                    </Box>
                )}

                {/* Tab 3: Preview */}
                {activeTab === 3 && (
                    <Box sx={{ p: 1 }}>
                        <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2, bgcolor: '#fff', minHeight: 400 }}>
                            {previewHtml
                                ? <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewHtml) }} />
                                : <Typography color="text.secondary">Click "Preview" to render the template</Typography>
                            }
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default TemplateEditor;
