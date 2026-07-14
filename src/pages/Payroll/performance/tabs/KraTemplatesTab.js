import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, Chip, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  createTemplateAction, updateTemplateAction, deleteTemplateAction,
  getTemplateItemsAction, createTemplateItemAction, updateTemplateItemAction, deleteTemplateItemAction,
} from 'redux/actions/performance.actions';

const emptyTemplate = { template_name: '', designation: '', department_id: '', grade_id: '', description: '' };
const emptyItem = { kra_name: '', kpi_name: '', weightage: '', target_description: '', measurement_type: 'rating', sort_order: 0 };

export default function KraTemplatesTab({ onRefresh }) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const { PerformanceReducer: { templates, templateItems } } = useSelector((s) => s);

  const [openTemplate, setOpenTemplate] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyTemplate });

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [openItem, setOpenItem] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [itemForm, setItemForm] = useState({ ...emptyItem });

  const tplList = templates || [];
  const items = templateItems || [];

  // Template CRUD
  const openAdd = () => { setEditId(null); setForm({ ...emptyTemplate }); setOpenTemplate(true); };
  const openEdit = (t) => {
    setEditId(t.id);
    setForm({ template_name: t.template_name, designation: t.designation || '',
      department_id: t.department_id || '', grade_id: t.grade_id || '', description: t.description || '' });
    setOpenTemplate(true);
  };
  const handleSave = async () => {
    const payload = { ...form };
    if (!payload.department_id) payload.department_id = null; else payload.department_id = Number(payload.department_id);
    if (!payload.grade_id) payload.grade_id = null; else payload.grade_id = Number(payload.grade_id);
    if (editId) {
      await dispatch(updateTemplateAction({ id: editId, ...payload }, setModalTypeHandler, setLoaderStatusHandler));
    } else {
      await dispatch(createTemplateAction(payload, setModalTypeHandler, setLoaderStatusHandler));
    }
    setOpenTemplate(false);
    onRefresh?.();
  };
  const handleDelete = async (id) => {
    await dispatch(deleteTemplateAction(id, setModalTypeHandler, setLoaderStatusHandler));
    onRefresh?.();
  };

  // View items
  const viewItems = (t) => {
    setSelectedTemplate(t);
    dispatch(getTemplateItemsAction(t.id, setModalTypeHandler, setLoaderStatusHandler));
  };

  // Item CRUD
  const openAddItem = () => { setEditItemId(null); setItemForm({ ...emptyItem }); setOpenItem(true); };
  const openEditItem = (it) => {
    setEditItemId(it.id);
    setItemForm({ kra_name: it.kra_name, kpi_name: it.kpi_name || '', weightage: it.weightage,
      target_description: it.target_description || '', measurement_type: it.measurement_type || 'rating',
      sort_order: it.sort_order || 0 });
    setOpenItem(true);
  };
  const handleSaveItem = async () => {
    const payload = { ...itemForm, weightage: Number(itemForm.weightage), sort_order: Number(itemForm.sort_order) || 0 };
    if (editItemId) {
      await dispatch(updateTemplateItemAction({ id: editItemId, ...payload }, setModalTypeHandler, setLoaderStatusHandler));
    } else {
      await dispatch(createTemplateItemAction({ template_id: selectedTemplate.id, ...payload }, setModalTypeHandler, setLoaderStatusHandler));
    }
    setOpenItem(false);
    dispatch(getTemplateItemsAction(selectedTemplate.id, setModalTypeHandler, setLoaderStatusHandler));
  };
  const handleDeleteItem = async (id) => {
    await dispatch(deleteTemplateItemAction(id, setModalTypeHandler, setLoaderStatusHandler));
    dispatch(getTemplateItemsAction(selectedTemplate.id, setModalTypeHandler, setLoaderStatusHandler));
  };

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>KRA/KPI Templates</Typography>
        <Button size='small' variant='contained' startIcon={<AddIcon />} onClick={openAdd}
          sx={{ textTransform: 'none', fontSize: 12 }}>
          New Template
        </Button>
      </Box>

      {tplList.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            No KRA templates yet. Create templates with KRAs/KPIs for different roles.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {tplList.map((t) => (
            <Grid key={t.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>{t.template_name}</Typography>
                    {t.designation && <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Role: {t.designation}</Typography>}
                    {t.department_name && <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Dept: {t.department_name}</Typography>}
                    {t.grade_name && <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Grade: {t.grade_name}</Typography>}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.2, flexShrink: 0 }}>
                    <Tooltip title='View KRAs'>
                      <IconButton size='small' color='primary' onClick={() => viewItems(t)}>
                        <ListAltIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='Edit'>
                      <IconButton size='small' onClick={() => openEdit(t)}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                    </Tooltip>
                    <Tooltip title='Delete'>
                      <IconButton size='small' color='error' onClick={() => handleDelete(t.id)}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                {t.description && (
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {t.description}
                  </Typography>
                )}
                <Chip size='small' label={`${t.item_count || 0} KRAs`}
                  sx={{ fontSize: 9, height: 18, mt: 1, bgcolor: '#e3f2fd', color: '#1565c0' }} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Template Add/Edit Dialog */}
      <Dialog open={openTemplate} onClose={() => setOpenTemplate(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>
          {editId ? 'Edit Template' : 'Create KRA Template'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label='Template Name' size='small' fullWidth required
            value={form.template_name} onChange={(e) => set('template_name', e.target.value)} />
          <TextField label='Designation (optional)' size='small' fullWidth
            value={form.designation} onChange={(e) => set('designation', e.target.value)} />
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Department ID' size='small' fullWidth type='number'
                value={form.department_id} onChange={(e) => set('department_id', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Grade ID' size='small' fullWidth type='number'
                value={form.grade_id} onChange={(e) => set('grade_id', e.target.value)} />
            </Grid>
          </Grid>
          <TextField label='Description' size='small' fullWidth multiline rows={2}
            value={form.description} onChange={(e) => set('description', e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTemplate(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' onClick={handleSave} disabled={!form.template_name}
            sx={{ textTransform: 'none' }}>
            {editId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* KRA Items Dialog */}
      <Dialog open={!!selectedTemplate} onClose={() => setSelectedTemplate(null)} maxWidth='md' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          KRA Items — {selectedTemplate?.template_name}
          <Button size='small' variant='contained' startIcon={<AddIcon />} onClick={openAddItem}
            sx={{ textTransform: 'none', fontSize: 11 }}>Add KRA</Button>
        </DialogTitle>
        <DialogContent>
          {items.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>No KRA items. Add KRAs/KPIs to this template.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>KRA</TableCell>
                    <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>KPI</TableCell>
                    <TableCell sx={{ fontSize: 11, fontWeight: 600 }} align='center'>Weight %</TableCell>
                    <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontSize: 11, fontWeight: 600 }} align='center'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell sx={{ fontSize: 12 }}>{it.kra_name}</TableCell>
                      <TableCell sx={{ fontSize: 11, color: 'text.secondary' }}>{it.kpi_name || '-'}</TableCell>
                      <TableCell align='center'>
                        <Chip size='small' label={`${it.weightage}%`}
                          sx={{ fontSize: 10, height: 20, bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: 11 }}>{it.measurement_type}</TableCell>
                      <TableCell align='center'>
                        <IconButton size='small' onClick={() => openEditItem(it)}><EditIcon sx={{ fontSize: 14 }} /></IconButton>
                        <IconButton size='small' color='error' onClick={() => handleDeleteItem(it.id)}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTemplate(null)} sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* KRA Item Add/Edit Dialog */}
      <Dialog open={openItem} onClose={() => setOpenItem(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>
          {editItemId ? 'Edit KRA' : 'Add KRA'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label='KRA Name' size='small' fullWidth required
            value={itemForm.kra_name} onChange={(e) => setItemForm({ ...itemForm, kra_name: e.target.value })} />
          <TextField label='KPI Name' size='small' fullWidth
            value={itemForm.kpi_name} onChange={(e) => setItemForm({ ...itemForm, kpi_name: e.target.value })} />
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label='Weightage %' size='small' fullWidth type='number' required
                value={itemForm.weightage} onChange={(e) => setItemForm({ ...itemForm, weightage: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label='Measurement Type' size='small' fullWidth select
                value={itemForm.measurement_type} onChange={(e) => setItemForm({ ...itemForm, measurement_type: e.target.value })}>
                <MenuItem value='rating'>Rating</MenuItem>
                <MenuItem value='numeric'>Numeric</MenuItem>
                <MenuItem value='percentage'>Percentage</MenuItem>
                <MenuItem value='boolean'>Yes/No</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label='Sort Order' size='small' fullWidth type='number'
                value={itemForm.sort_order} onChange={(e) => setItemForm({ ...itemForm, sort_order: e.target.value })} />
            </Grid>
          </Grid>
          <TextField label='Target Description' size='small' fullWidth multiline rows={2}
            value={itemForm.target_description} onChange={(e) => setItemForm({ ...itemForm, target_description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenItem(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' onClick={handleSaveItem}
            disabled={!itemForm.kra_name || !itemForm.weightage}
            sx={{ textTransform: 'none' }}>
            {editItemId ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
