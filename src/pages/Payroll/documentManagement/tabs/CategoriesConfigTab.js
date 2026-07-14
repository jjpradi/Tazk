import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, Chip, Switch, FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  createDocumentCategoryAction,
  updateDocumentCategoryAction,
  deleteDocumentCategoryAction,
} from 'redux/actions/documentManagement.actions';

const emptyForm = { category_name: '', description: '', is_mandatory: false, sort_order: 0 };

export default function CategoriesConfigTab({ onRefresh }) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const { DocumentManagementReducer: { categories } } = useSelector((s) => s);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const catList = categories || [];

  const openAdd = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const openEdit = (cat) => {
    setEditId(cat.id);
    setForm({
      category_name: cat.category_name,
      description: cat.description || '',
      is_mandatory: !!cat.is_mandatory,
      sort_order: cat.sort_order || 0,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (editId) {
      await dispatch(updateDocumentCategoryAction(
        { id: editId, ...form },
        setModalTypeHandler, setLoaderStatusHandler,
      ));
    } else {
      await dispatch(createDocumentCategoryAction(form, setModalTypeHandler, setLoaderStatusHandler));
    }
    setOpen(false);
    onRefresh?.();
  };

  const handleDelete = async (id) => {
    await dispatch(deleteDocumentCategoryAction(id, setModalTypeHandler, setLoaderStatusHandler));
    onRefresh?.();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Document Categories</Typography>
        <Button size='small' variant='contained' startIcon={<AddIcon />} onClick={openAdd}
          sx={{ textTransform: 'none', fontSize: 12 }}>
          Add Category
        </Button>
      </Box>

      {catList.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            No document categories configured. Add categories like Identity, Address, Education, etc.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {catList.map((cat) => (
            <Grid key={cat.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{cat.category_name}</Typography>
                      {cat.is_mandatory ? (
                        <Chip size='small' label='Required'
                          sx={{ fontSize: 9, height: 18, bgcolor: '#ffebee', color: '#d32f2f', fontWeight: 600 }} />
                      ) : null}
                    </Box>
                    {cat.description && (
                      <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>{cat.description}</Typography>
                    )}
                    <Typography sx={{ fontSize: 10, color: 'text.disabled', mt: 0.5 }}>
                      Sort Order: {cat.sort_order}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.3 }}>
                    <Tooltip title='Edit'>
                      <IconButton size='small' onClick={() => openEdit(cat)}>
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='Delete'>
                      <IconButton size='small' color='error' onClick={() => handleDelete(cat.id)}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>
          {editId ? 'Edit Category' : 'Add Category'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField
            label='Category Name' size='small' fullWidth required
            value={form.category_name}
            onChange={(e) => setForm({ ...form, category_name: e.target.value })}
            placeholder='e.g. Identity, Address, Education'
          />
          <TextField
            label='Description' size='small' fullWidth multiline rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <TextField
            label='Sort Order' size='small' type='number' fullWidth
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
          />
          <FormControlLabel
            control={
              <Switch checked={form.is_mandatory}
                onChange={(e) => setForm({ ...form, is_mandatory: e.target.checked })} />
            }
            label={<Typography sx={{ fontSize: 13 }}>Required for onboarding</Typography>}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' onClick={handleSave}
            disabled={!form.category_name}
            sx={{ textTransform: 'none' }}>
            {editId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
