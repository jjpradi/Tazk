import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box, Chip
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import MaterialTable from 'utils/SafeMaterialTable';
import { getVersionHistoryAction, rollbackDocTemplateAction } from 'redux/actions/docTemplate_actions';
import moment from 'moment';

function VersionHistory({ open, templateId, onClose, onRollback }) {
    const dispatch = useDispatch();
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (templateId) loadVersions();
    }, [templateId]);

    const loadVersions = async () => {
        setLoading(true);
        try {
            const data = await dispatch(getVersionHistoryAction(templateId));
            setVersions(data || []);
        } catch (err) { /* handled by action */ }
        setLoading(false);
    };

    const handleRollback = async (version) => {
        const result = await dispatch(rollbackDocTemplateAction(templateId, { target_version: version }));
        if (result) onRollback();
    };

    const columns = [
        {
            title: 'Version', field: 'version', width: 100,
            render: row => <Chip label={`v${row.version}`} size="small" variant="outlined" />
        },
        {
            title: 'Created At', field: 'created_at',
            render: row => moment(row.created_at).format('DD/MM/YYYY HH:mm')
        },
        { title: 'Note', field: 'publish_note', render: row => row.publish_note || '-' },
        {
            title: 'Action', width: 120,
            render: row => (
                <Button size="small" startIcon={<RestoreIcon />} variant="outlined"
                    onClick={() => handleRollback(row.version)}>
                    Rollback
                </Button>
            )
        }
    ];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Version History</DialogTitle>
            <DialogContent>
                <MaterialTable
                    columns={columns}
                    data={versions}
                    isLoading={loading}
                    options={{
                        pageSize: 10,
                        search: false,
                        toolbar: false,
                        paging: versions.length > 10,
                        headerStyle: { fontWeight: 600, fontSize: 12 },
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

export default VersionHistory;
