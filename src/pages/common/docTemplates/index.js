import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Box, Typography, IconButton, Tooltip, Chip, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import PublishIcon from '@mui/icons-material/Publish';
import ArchiveIcon from '@mui/icons-material/Archive';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import MaterialTable from 'utils/SafeMaterialTable';
import  CreateNewButtonContext  from 'context/CreateNewButtonContext';
import { maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize';
import {
    listDocTemplatesAction,
    createDocTemplateAction,
    cloneDocTemplateAction,
    publishDocTemplateAction,
    deleteDocTemplateAction,
    getVersionHistoryAction,
    rollbackDocTemplateAction,
    getDocTemplateAction,
    saveDraftAction
} from 'redux/actions/docTemplate_actions';
import { OpenalertActions } from 'redux/actions/alert_actions';
import TemplateEditor from './TemplateEditor';
import VersionHistory from './VersionHistory';
import TemplatePreviewDialog from './TemplatePreviewDialog';

const DOC_TYPES = [
    { value: 'all', label: 'All' },
    { value: 'sales_invoice', label: 'Sales Invoice' },
    { value: 'pos_receipt', label: 'POS Receipt' },
    { value: 'sales_receipt', label: 'Sales Receipt' },
    { value: 'quotation', label: 'Quotation' },
    { value: 'sales_order', label: 'Sales Order' },
    { value: 'delivery_challan', label: 'Delivery Challan' },
    { value: 'credit_note', label: 'Credit Note' },
    { value: 'debit_note', label: 'Debit Note' },
    { value: 'proforma_invoice', label: 'Proforma Invoice' },
    { value: 'purchase_order', label: 'Purchase Order' },
    { value: 'receipt_voucher', label: 'Receipt Voucher' },
    { value: 'payment_voucher', label: 'Payment Voucher' },
    { value: 'payslip', label: 'Payslip' },
    { value: 'outstanding_report', label: 'Outstanding Report' },
    { value: 'defect_collection', label: 'Defect Collection' },
    { value: 'defect_send', label: 'Defect Send' },
    { value: 'offer_letter', label: 'Offer Letter' },
    { value: 'appointment_letter', label: 'Appointment Letter' },
    { value: 'confirmation_letter', label: 'Confirmation Letter' },
    { value: 'promotion_letter', label: 'Promotion Letter' },
    { value: 'increment_letter', label: 'Increment Letter' },
    { value: 'transfer_letter', label: 'Transfer Letter' },
    { value: 'warning_letter', label: 'Warning Letter' },
    { value: 'termination_letter', label: 'Termination Letter' },
    { value: 'relieving_letter', label: 'Relieving Letter' },
    { value: 'experience_letter', label: 'Experience Letter' },
    { value: 'internship_letter', label: 'Internship Letter' },
    { value: 'address_proof_letter', label: 'Address Proof Letter' },
    { value: 'salary_certificate', label: 'Salary Certificate' },
    { value: 'employment_certificate', label: 'Employment Certificate' },
    { value: 'noc_letter', label: 'NOC Letter' },
    { value: 'bonafide_letter', label: 'Bonafide Letter' },
];

const PAPER_SIZES = [
    { value: 'A4_portrait', label: 'A4 Portrait' },
    { value: 'A4_landscape', label: 'A4 Landscape' },
    { value: 'A5_portrait', label: 'A5 Portrait' },
    { value: 'A5_landscape', label: 'A5 Landscape' },
    { value: 'thermal_80mm', label: 'Thermal 80mm' },
    { value: 'thermal_58mm', label: 'Thermal 58mm' },
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
];

const statusColor = { draft: 'warning', published: 'success', archived: 'default' };
const modeColor = { system: 'primary', clone: 'secondary', custom: 'default' };

class DocTemplateList extends Component {
    static contextType = CreateNewButtonContext;

    state = {
        pageCount: 0,
        numPerPage: 20,
        filterDocType: 'all',
        filterStatus: 'all',
        createOpen: false,
        editorOpen: false,
        editTemplateId: null,
        versionOpen: false,
        versionTemplateId: null,
        previewOpen: false,
        previewTemplate: null,
        newTemplate: {
            template_name: '',
            document_type: 'sales_invoice',
            paper_size: 'A4_portrait',
            render_engine: 'html'
        }
    };

    componentDidMount() {
        this.loadData();
    }

    loadData = () => {
        const { pageCount, numPerPage, filterDocType, filterStatus } = this.state;
        this.props.listDocTemplates({
            document_type: filterDocType,
            status: filterStatus,
            pageCount,
            numPerPage
        });
    };

    handleClone = async (template_id) => {
        const result = await this.props.cloneDocTemplate(template_id);
        if (result) this.loadData();
    };

    handlePublish = async (template_id, current_version) => {
        const result = await this.props.publishDocTemplate(template_id, { version: current_version });
        if (result) this.loadData();
    };

    handleDelete = async (template_id) => {
        const result = await this.props.deleteDocTemplate(template_id);
        if (result) this.loadData();
    };

    handleCreate = async () => {
        const { newTemplate } = this.state;
        if (!newTemplate.template_name) {
            this.props.showAlert('Template name is required', 'warning');
            return;
        }
        const result = await this.props.createDocTemplate(newTemplate);
        if (result) {
            this.setState({
                createOpen: false,
                newTemplate: { template_name: '', document_type: 'sales_invoice', paper_size: 'A4_portrait', render_engine: 'html' }
            });
            this.loadData();
        }
    };

    handleEdit = (template_id) => {
        this.setState({ editorOpen: true, editTemplateId: template_id });
    };

    handleEditorClose = () => {
        this.setState({ editorOpen: false, editTemplateId: null });
        this.loadData();
    };

    handleVersions = (template_id) => {
        this.setState({ versionOpen: true, versionTemplateId: template_id });
    };

    handlePreview = (row) => {
        this.setState({ previewOpen: true, previewTemplate: row });
    };

    columns = [
        {
            title: 'Template Name', field: 'template_name',
            cellStyle: { ...cellStyle, minWidth: 200 }
        },
        {
            title: 'Document Type', field: 'document_type',
            render: row => {
                const dt = DOC_TYPES.find(d => d.value === row.document_type);
                return <Chip label={dt ? dt.label : row.document_type} size="small" variant="outlined" />;
            }
        },
        { title: 'Paper Size', field: 'paper_size', render: row => {
            const ps = PAPER_SIZES.find(p => p.value === row.paper_size);
            return ps ? ps.label : row.paper_size;
        }},
        {
            title: 'Mode', field: 'template_mode',
            render: row => <Chip label={row.template_mode} size="small" color={modeColor[row.template_mode] || 'default'} />
        },
        {
            title: 'Status', field: 'status',
            render: row => <Chip label={row.status} size="small" color={statusColor[row.status] || 'default'} />
        },
        {
            title: 'Default', field: 'is_default',
            render: row => row.is_default ? <Chip label="Default" size="small" color="info" /> : '-'
        },
        { title: 'Version', field: 'current_version', width: 80 },
        {
            title: 'Actions', width: 260,
            render: row => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {row.template_mode !== 'system' && (
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => this.handleEdit(row.template_id)}>
                            <EditIcon fontSize="small" /></IconButton></Tooltip>
                    )}
                    <Tooltip title="Preview"><IconButton size="small" color="primary" onClick={() => this.handlePreview(row)}>
                        <VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Clone"><IconButton size="small" onClick={() => this.handleClone(row.template_id)}>
                        <ContentCopyIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Versions"><IconButton size="small" onClick={() => this.handleVersions(row.template_id)}>
                        <HistoryIcon fontSize="small" /></IconButton></Tooltip>
                    {row.status === 'draft' && (
                        <Tooltip title="Publish"><IconButton size="small" color="success" onClick={() => this.handlePublish(row.template_id, row.current_version)}>
                            <PublishIcon fontSize="small" /></IconButton></Tooltip>
                    )}
                    {row.template_mode !== 'system' && (
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => this.handleDelete(row.template_id)}>
                            <DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    )}
                </Box>
            )
        }
    ];

    render() {
        const { templateList, numRows } = this.props;
        const { createOpen, newTemplate, editorOpen, editTemplateId, versionOpen, versionTemplateId } = this.state;

        // Full-screen editor mode
        if (editorOpen && editTemplateId) {
            return (
                <TemplateEditor
                    templateId={editTemplateId}
                    onClose={this.handleEditorClose}
                />
            );
        }

        return (
            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h6">Document Templates</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel>Document Type</InputLabel>
                            <Select value={this.state.filterDocType} label="Document Type"
                                onChange={(e) => this.setState({ filterDocType: e.target.value, pageCount: 0 }, this.loadData)}>
                                {DOC_TYPES.map(d => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Status</InputLabel>
                            <Select value={this.state.filterStatus} label="Status"
                                onChange={(e) => this.setState({ filterStatus: e.target.value, pageCount: 0 }, this.loadData)}>
                                {STATUS_OPTIONS.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <Button variant="contained" startIcon={<AddIcon />} size="small"
                            onClick={() => this.setState({ createOpen: true })}>
                            New Template
                        </Button>
                    </Box>
                </Box>

                <MaterialTable
                    columns={this.columns}
                    data={templateList || []}
                    totalCount={numRows}
                    page={this.state.pageCount}
                    onPageChange={(page) => this.setState({ pageCount: page }, this.loadData)}
                    options={{
                        pageSize: this.state.numPerPage,
                        search: false,
                        toolbar: false,
                        paging: true,
                        headerStyle,
                        maxBodyHeight,
                    }}
                />

                {/* Create Template Dialog */}
                <Dialog open={createOpen} onClose={() => this.setState({ createOpen: false })}
                    maxWidth="sm" fullWidth>
                    <DialogTitle>Create New Template</DialogTitle>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
                        <TextField label="Template Name" size="small" fullWidth required
                            value={newTemplate.template_name}
                            onChange={(e) => this.setState({ newTemplate: { ...newTemplate, template_name: e.target.value } })} />
                        <FormControl fullWidth size="small">
                            <InputLabel>Document Type</InputLabel>
                            <Select value={newTemplate.document_type} label="Document Type"
                                onChange={(e) => this.setState({ newTemplate: { ...newTemplate, document_type: e.target.value } })}>
                                {DOC_TYPES.filter(d => d.value !== 'all').map(d =>
                                    <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                            <InputLabel>Paper Size</InputLabel>
                            <Select value={newTemplate.paper_size} label="Paper Size"
                                onChange={(e) => this.setState({ newTemplate: { ...newTemplate, paper_size: e.target.value } })}>
                                {PAPER_SIZES.map(p =>
                                    <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({ createOpen: false })}>Cancel</Button>
                        <Button variant="contained" onClick={this.handleCreate}>Create</Button>
                    </DialogActions>
                </Dialog>

                {/* Version History Dialog */}
                {versionOpen && versionTemplateId && (
                    <VersionHistory
                        open={versionOpen}
                        templateId={versionTemplateId}
                        onClose={() => this.setState({ versionOpen: false, versionTemplateId: null })}
                        onRollback={() => { this.setState({ versionOpen: false, versionTemplateId: null }); this.loadData(); }}
                    />
                )}

                {/* Template Preview Dialog */}
                {this.state.previewOpen && this.state.previewTemplate && (
                    <TemplatePreviewDialog
                        open={this.state.previewOpen}
                        template={this.state.previewTemplate}
                        onClose={() => this.setState({ previewOpen: false, previewTemplate: null })}
                    />
                )}
            </Box>
        );
    }
}

const mapStateToProps = (state) => ({
    templateList: state.docTemplateReducer.templateList,
    numRows: state.docTemplateReducer.numRows
});

const mapDispatchToProps = (dispatch) => ({
    listDocTemplates: (data) => dispatch(listDocTemplatesAction(data)),
    createDocTemplate: (data) => dispatch(createDocTemplateAction(data)),
    cloneDocTemplate: (id) => dispatch(cloneDocTemplateAction(id)),
    publishDocTemplate: (id, data) => dispatch(publishDocTemplateAction(id, data)),
    deleteDocTemplate: (id) => dispatch(deleteDocTemplateAction(id)),
    showAlert: (msg, severity) => dispatch(OpenalertActions({ msg, severity }))
});

export default connect(mapStateToProps, mapDispatchToProps)(DocTemplateList);
