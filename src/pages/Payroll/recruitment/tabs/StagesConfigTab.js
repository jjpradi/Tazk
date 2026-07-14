import React, { useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, Chip, Avatar,
  List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  createStageAction, updateStageAction, deleteStageAction,
} from 'redux/actions/recruitment.actions';

const emptyForm = { stage_name: '', stage_order: '' };

export default function StagesConfigTab({ stages, refreshStages }) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteId, setDeleteId] = useState(null);

  const stageList = [...(stages || [])].sort((a, b) => (a.stage_order || 0) - (b.stage_order || 0));

  // Add / Edit
  const openAdd = () => {
    setEditId(null);
    setForm({ stage_name: '', stage_order: stageList.length + 1 });
    setOpen(true);
  };
  const openEdit = (s) => {
    setEditId(s.id);
    setForm({ stage_name: s.stage_name || '', stage_order: s.stage_order ?? '' });
    setOpen(true);
  };
  const handleSave = async () => {
    const payload = { ...form, stage_order: Number(form.stage_order) || 0 };
    if (editId) {
      await dispatch(updateStageAction({ id: editId, ...payload }, setModalTypeHandler, setLoaderStatusHandler));
    } else {
      await dispatch(createStageAction(payload, setModalTypeHandler, setLoaderStatusHandler));
    }
    setOpen(false);
    refreshStages?.();
  };

  // Delete
  const confirmDelete = async () => {
    await dispatch(deleteStageAction(deleteId, setModalTypeHandler, setLoaderStatusHandler));
    setDeleteId(null);
    refreshStages?.();
  };

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <Box>
      <Alert severity='info' sx={{ mb: 2, fontSize: 12 }}>
        Configure recruitment pipeline stages. Stages define the steps candidates move through during the hiring process.
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Pipeline Stages</Typography>
        <Button size='small' variant='contained' startIcon={<AddIcon />} onClick={openAdd}
          sx={{ textTransform: 'none', fontSize: 12 }}>
          Add Stage
        </Button>
      </Box>

      {stageList.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            No pipeline stages configured yet. Add stages to define your recruitment workflow.
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <List disablePadding>
            {stageList.map((s, idx) => (
              <ListItem
                key={s.id}
                divider={idx < stageList.length - 1}
                sx={{ py: 1.5, px: 2 }}
              >
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  <Avatar sx={{ width: 28, height: 28, fontSize: 12, fontWeight: 700, bgcolor: 'primary.main' }}>
                    {s.stage_order}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{s.stage_name}</Typography>
                      {s.is_default === 1 && (
                        <Chip size='small' label='Default'
                          sx={{ fontSize: 9, height: 18, bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }} />
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title='Edit'>
                    <IconButton size='small' onClick={() => openEdit(s)}>
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='Delete'>
                    <IconButton size='small' color='error' onClick={() => setDeleteId(s.id)}>
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>
          {editId ? 'Edit Stage' : 'Add Stage'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label='Stage Name' size='small' fullWidth required
            value={form.stage_name} onChange={(e) => set('stage_name', e.target.value)} />
          <TextField label='Stage Order' size='small' fullWidth type='number'
            value={form.stage_order} onChange={(e) => set('stage_order', e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' onClick={handleSave} disabled={!form.stage_name}
            sx={{ textTransform: 'none' }}>
            {editId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth='xs'>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>Delete Stage</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13 }}>
            Are you sure you want to delete this stage? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={confirmDelete}
            sx={{ textTransform: 'none' }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
