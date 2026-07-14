import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Chip, Button, TextField, MenuItem, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Switch, FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GavelIcon from '@mui/icons-material/Gavel';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {
  createChecklistTemplateAction,
  updateChecklistTemplateAction,
  deleteChecklistTemplateAction,
  getChecklistTemplatesAction,
} from 'redux/actions/employeeLifecycle.actions';

const categoryConfig = {
  documentation: { label: 'Documentation', color: '#1976d2' },
  it_setup: { label: 'IT Setup', color: '#9c27b0' },
  hr_formalities: { label: 'HR Formalities', color: '#2e7d32' },
  training: { label: 'Training', color: '#ed6c02' },
  compliance: { label: 'Compliance', color: '#d32f2f' },
};

const responsibleConfig = {
  hr: { label: 'HR', color: 'primary' },
  manager: { label: 'Manager', color: 'secondary' },
  employee: { label: 'Employee', color: 'default' },
  it: { label: 'IT', color: 'info' },
};

const initialForm = {
  item_name: '',
  item_description: '',
  category: 'hr_formalities',
  responsible_type: 'hr',
  sort_order: 0,
  is_mandatory: true,
  employee_name: '',
  department: '',
  validity_date: '',
};

export default function ChecklistConfigTab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const [formValues, setFormValues] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const dispatch = useDispatch();
  const { EmployeeLifecycleReducer: { checklistTemplates } } = useSelector((s) => s);
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const reload = async () => {
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(getChecklistTemplatesAction(setModalTypeHandler, setLoaderStatusHandler)));
  };

  const handleAdd = () => {
    setMode('add');
    setFormValues(initialForm);
    setEditId(null);
    setDialogOpen(true);
  };

  const handleEdit = (item) => {
    setMode('edit');
    setFormValues({
      item_name: item.item_name || '',
      item_description: item.item_description || '',
      category: item.category || 'hr_formalities',
      responsible_type: item.responsible_type || 'hr',
      sort_order: item.sort_order || 0,
      is_mandatory: !!item.is_mandatory,
      employee_name: item.employee_name || '',
      department: item.department || '',
      validity_date: item.validity_date || '',
    });
    setEditId(item.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(deleteChecklistTemplateAction(id, setModalTypeHandler, setLoaderStatusHandler)));
    reload();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    const payload = { ...formValues };
    if (mode === 'edit') {
      payload.id = editId;
      await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
        dispatch(updateChecklistTemplateAction(payload, setModalTypeHandler, setLoaderStatusHandler)));
    } else {
      await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
        dispatch(createChecklistTemplateAction(payload, setModalTypeHandler, setLoaderStatusHandler)));
    }
    setDialogOpen(false);
    reload();
  };

  const templates = checklistTemplates || [];
  const categories = ['documentation', 'it_setup', 'hr_formalities', 'training', 'compliance'];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
          Onboarding Checklist Templates ({templates.length} items)
        </Typography>
        <Button size='small' startIcon={<AddIcon />} variant='contained' onClick={handleAdd}
          sx={{ fontSize: 11, textTransform: 'none' }}>
          Add Item
        </Button>
      </Box>

      {templates.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <GavelIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
          <Typography variant='body2'>No checklist templates configured</Typography>
          <Typography sx={{ fontSize: 11, mt: 0.5 }}>
            Create checklist items that will be automatically assigned to new employees during onboarding
          </Typography>
        </Box>
      ) : (
        <Box>
          {categories.map((cat) => {
            const items = templates.filter((t) => t.category === cat);
            if (items.length === 0) return null;
            const cc = categoryConfig[cat];
            return (
              <Box key={cat} sx={{ mb: 2.5 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1, color: cc.color }}>
                  {cc.label} ({items.length})
                </Typography>
                {items.map((item) => {
                  const rc = responsibleConfig[item.responsible_type] || responsibleConfig.hr;
                  return (
                    <Paper
                      key={item.id}
                      elevation={0}
                      sx={{
                        p: 1.5, mb: 0.5, borderRadius: 1.5,
                        border: '1px solid', borderColor: 'divider',
                        display: 'flex', alignItems: 'center', gap: 1.5,
                      }}
                    >
                      <Box sx={{
                        width: 24, height: 24, borderRadius: 1, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        bgcolor: cc.color + '15', color: cc.color, fontSize: 11, fontWeight: 700,
                      }}>
                        {item.sort_order}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                          {item.item_name}
                          {item.is_mandatory ? <span style={{ color: '#d32f2f', marginLeft: 4 }}>*</span> : ''}
                        </Typography>
                        {item.item_description && (
                          <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                            {item.item_description}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
                          {item.employee_name && (
                            <Typography sx={{ fontSize: 9, color: 'primary.main', fontWeight: 500 }}>
                              👤 {item.employee_name}
                            </Typography>
                          )}
                          {item.department && (
                            <Typography sx={{ fontSize: 9, color: 'secondary.main', fontWeight: 500 }}>
                              🏢 {item.department}
                            </Typography>
                          )}
                          {item.validity_date && (
                            <Typography sx={{ fontSize: 9, color: 'warning.main', fontWeight: 500 }}>
                              📅 {item.validity_date}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Chip label={rc.label} size='small' color={rc.color} variant='outlined' sx={{ fontSize: 9, minWidth: 55 }} />
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size='small' onClick={() => handleEdit(item)}>
                          <EditIcon fontSize='small' />
                        </IconButton>
                        <IconButton size='small' color='error' onClick={() => handleDelete(item.id)}>
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>
          {mode === 'edit' ? 'Edit Checklist Item' : 'Add Checklist Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField
                name='item_name' label='Item Name' size='small' fullWidth required
                value={formValues.item_name} onChange={handleChange}
                placeholder='e.g. Submit ID proof copies'
              />
            </Grid>
            <Grid size={12}>
              <TextField
                name='item_description' label='Description' size='small' fullWidth multiline rows={2}
                value={formValues.item_description} onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select name='category' label='Category' size='small' fullWidth
                value={formValues.category} onChange={handleChange}
              >
                {Object.entries(categoryConfig).map(([key, val]) => (
                  <MenuItem key={key} value={key}>{val.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select name='responsible_type' label='Responsible Party' size='small' fullWidth
                value={formValues.responsible_type} onChange={handleChange}
              >
                {Object.entries(responsibleConfig).map(([key, val]) => (
                  <MenuItem key={key} value={key}>{val.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name='sort_order' label='Sort Order' size='small' fullWidth type='number'
                value={formValues.sort_order} onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formValues.is_mandatory}
                    onChange={(e) => setFormValues((p) => ({ ...p, is_mandatory: e.target.checked }))}
                  />
                }
                label={<Typography sx={{ fontSize: 12 }}>Mandatory</Typography>}
                sx={{ mt: 0.5 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name='employee_name' label='Employee Name' size='small' fullWidth
                value={formValues.employee_name} onChange={handleChange}
                placeholder='e.g. John Doe'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name='department' label='Department' size='small' fullWidth
                value={formValues.department} onChange={handleChange}
                placeholder='e.g. Engineering'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name='validity_date' label='Validity Date' size='small' fullWidth type='date'
                value={formValues.validity_date} onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color='error'>Cancel</Button>
          <Button onClick={handleSave} variant='contained' disabled={!formValues.item_name}>
            {mode === 'edit' ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
