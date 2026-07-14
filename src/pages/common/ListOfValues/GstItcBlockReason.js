import React, { useState, useEffect, useContext } from 'react';
import {
    Grid, Typography, IconButton, Dialog, DialogContent, DialogContentText,
    DialogActions, Button, TextField, Tooltip, Chip,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import MaterialTable from 'utils/SafeMaterialTable';
import CommonSearch from 'utils/commonSearch';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getsessionStorage } from 'pages/common/login/cookies';
import {
    gstItcBlockReasonListAction,
    gstItcBlockReasonUpdateAction,
    gstItcBlockReasonDeleteAction,
} from 'redux/actions/gstItcBlockReason.actions';
import GstItcBlockReasonForm from './GstItcBlockReasonForm';

export default function GstItcBlockReason() {
    const dispatch = useDispatch();
    const storage = getsessionStorage();
    const selectedRole = storage.role_name;

    const {
        gstItcBlockReasonReducer: { list },
        rbacReducer: { menuAccess },
    } = useSelector((state) => state);

    // eslint-disable-next-line no-unused-vars
    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

    const [openAdd, setOpenAdd] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [editRowId, setEditRowId] = useState(null);
    const [editLabel, setEditLabel] = useState('');
    const [search, setSearch] = useState('');

    const canCreate = UserRightsAuthorization(menuAccess[selectedRole], 'info__lov', 'can_create');
    const canEdit   = UserRightsAuthorization(menuAccess[selectedRole], 'info__lov', 'can_edit');
    const canDelete = UserRightsAuthorization(menuAccess[selectedRole], 'info__lov', 'can_delete');

    useEffect(() => {
        dispatch(gstItcBlockReasonListAction());
    }, [dispatch]);

    const handleSaveEdit = (row) => {
        const label = editLabel.trim();
        if (!label) return;
        dispatch(gstItcBlockReasonUpdateAction(row.id, { reason_label: label }, () => {
            setEditRowId(null);
            setEditLabel('');
        }));
    };

    const handleDelete = () => {
        if (!confirmDelete) return;
        dispatch(gstItcBlockReasonDeleteAction(confirmDelete.id, () => {
            setConfirmDelete(null);
        }));
    };

    // Client-side search on label / code
    const visibleRows = (list || []).filter((r) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return String(r.reason_label || '').toLowerCase().includes(q)
            || String(r.reason_code || '').toLowerCase().includes(q);
    });

    const columns = [
        {
            field: 'reason_label',
            title: 'Reason',
            render: (row) => (
                editRowId === row.id ? (
                    <TextField
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        size="small"
                        autoFocus
                        fullWidth
                    />
                ) : (
                    <Grid container alignItems="center" spacing={1}>
                        <Grid>{row.reason_label}</Grid>
                        {row.is_system ? (
                            <Grid>
                                <Tooltip title="System-seeded — code locked; label can be edited">
                                    <LockIcon fontSize="inherit" sx={{ color: '#999' }} />
                                </Tooltip>
                            </Grid>
                        ) : null}
                    </Grid>
                )
            ),
        },
        {
            field: 'reason_code',
            title: 'Code',
            render: (row) => (
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#666' }}>
                    {row.reason_code}
                </Typography>
            ),
        },
        (canEdit || canDelete) && {
            title: 'Action',
            render: (row) => (
                <Grid container spacing={1}>
                    {editRowId === row.id ? (
                        <>
                            <IconButton onClick={() => handleSaveEdit(row)} title="Save">
                                <CheckIcon />
                            </IconButton>
                            <IconButton onClick={() => { setEditRowId(null); setEditLabel(''); }} title="Cancel">
                                <CloseIcon />
                            </IconButton>
                        </>
                    ) : (
                        <>
                            {canEdit && (
                                <IconButton
                                    onClick={() => { setEditRowId(row.id); setEditLabel(row.reason_label); }}
                                    title="Edit label"
                                >
                                    <EditIcon />
                                </IconButton>
                            )}
                            {canDelete && !row.is_system && (
                                <IconButton
                                    onClick={() => setConfirmDelete(row)}
                                    title="Delete"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            )}
                        </>
                    )}
                </Grid>
            ),
        },
    ].filter(Boolean);

    return (
        <>
            <style>
                {`
                /* Match the style used by sibling LOVs */
                .MuiTableBody-root .MuiTableRow-root td {
                  border-bottom: none !important;
                }
                `}
            </style>
            <MaterialTable
                columns={columns}
                title="ITC Block Reason"
                data={visibleRows}
                options={{
                    headerStyle,
                    cellStyle,
                    filtering: false,
                    actionsColumnIndex: -1,
                    paging: false,
                    search: false,
                    maxBodyHeight,
                    minBodyHeight: maxBodyHeight,
                }}
                components={{
                    Toolbar: () => (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
                                <Typography variant="h6" component="div">ITC Block Reason</Typography>
                                {canCreate && (
                                    <IconButton onClick={() => setOpenAdd(true)} title="Add">
                                        <AddIcon />
                                    </IconButton>
                                )}
                            </div>
                            <div style={{ padding: '8px 16px' }}>
                                <CommonSearch
                                    searchVal={search}
                                    cancelSearch={() => setSearch('')}
                                    requestSearch={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    ),
                }}
            />

            <Dialog open={openAdd}>
                <GstItcBlockReasonForm handleClose={() => setOpenAdd(false)} />
            </Dialog>

            <Dialog open={Boolean(confirmDelete)}>
                <Grid container>
                    <Grid size={{ lg: 6, md: 6 }}>
                        <DialogContent style={{ width: 500 }}>
                            <DialogContentText sx={{ color: 'warning.main' }}>
                                Delete reason <strong>{confirmDelete && confirmDelete.reason_label}</strong>?
                                Existing records still tagged with this reason will continue to
                                show the reason text until re-tagged.
                            </DialogContentText>
                        </DialogContent>
                    </Grid>
                </Grid>
                <DialogActions>
                    <Button variant="contained" color="error" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
