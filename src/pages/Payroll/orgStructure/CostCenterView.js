import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, TextField, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Typography, Grid,
} from '@mui/material';
import MaterialTable from 'utils/SafeMaterialTable';
import { getStickyTableOptions, stickyTableComponents } from 'utils/stickyTableLayout';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PaidIcon from '@mui/icons-material/Paid';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {
  createCostCenterAction,
  updateCostCenterAction,
  deleteCostCenterAction,
} from 'redux/actions/orgStructure.actions';

const initialForm = {
  code: '',
  name: '',
  department_id: '',
  total_amount: '',
  description: '',
};

const getTotalAmountValue = (rowData = {}) =>
  rowData.total_amount ?? rowData.totalAmount ?? rowData.amount ?? '';

const formatCurrency = (value) => {
  if (value === '' || value === null || value === undefined) {
    return '-';
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return value;
  }

  return numericValue.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function CostCenterView() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const [formValues, setFormValues] = useState(initialForm);
  const [editId, setEditId] = useState(null);

  const dispatch = useDispatch();
  const { OrgStructureReducer: { costCenters, departmentTree } } = useSelector((state) => state);
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const handleAdd = () => {
    setMode('add');
    setFormValues(initialForm);
    setEditId(null);
    setDialogOpen(true);
  };

  const handleEdit = (rowData) => {
    setMode('edit');
    setFormValues({
      code: rowData.code || '',
      name: rowData.name || '',
      department_id: rowData.department_id || '',
      total_amount: getTotalAmountValue(rowData),
      description: rowData.description || '',
    });
    setEditId(rowData.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    await apiCalls(
      setModalTypeHandler, setLoaderStatusHandler,
      dispatch(deleteCostCenterAction(id, setModalTypeHandler, setLoaderStatusHandler)),
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const payload = {
      ...formValues,
      department_id: formValues.department_id || null,
      total_amount: formValues.total_amount === '' ? null : Number(formValues.total_amount),
    };

    if (mode === 'edit') {
      payload.id = editId;
      await apiCalls(
        setModalTypeHandler, setLoaderStatusHandler,
        dispatch(updateCostCenterAction(payload, setModalTypeHandler, setLoaderStatusHandler)),
      );
    } else {
      await apiCalls(
        setModalTypeHandler, setLoaderStatusHandler,
        dispatch(createCostCenterAction(payload, setModalTypeHandler, setLoaderStatusHandler)),
      );
    }
    setDialogOpen(false);
  };

  const columns = [
    { title: 'Code', field: 'code', cellStyle: { fontSize: 12, fontWeight: 500 } },
    { title: 'Name', field: 'name', cellStyle: { fontSize: 12 } },
    { title: 'Department', field: 'department_name', cellStyle: { fontSize: 12 } },
    {
      title: 'Total Amount',
      field: 'total_amount',
      cellStyle: { fontSize: 12, fontWeight: 600 },
      render: (rowData) => formatCurrency(getTotalAmountValue(rowData)),
    },
    { title: 'Description', field: 'description', cellStyle: { fontSize: 12, color: 'rgba(0,0,0,0.6)' } },
    {
      title: 'Actions',
      field: '',
      cellStyle: { width: 100 },
      render: (rowData) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size='small' onClick={() => handleEdit(rowData)}>
            <EditIcon fontSize='small' />
          </IconButton>
          <IconButton size='small' color='error' onClick={() => handleDelete(rowData.id)}>
            <DeleteIcon fontSize='small' />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button size='small' startIcon={<AddIcon />} onClick={handleAdd} variant='contained'>
          Add Cost Center
        </Button>
      </Box>

      {(!costCenters || costCenters.length === 0) ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <PaidIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
          <Typography variant='body2'>No cost centers configured yet</Typography>
        </Box>
      ) : (
        <MaterialTable
          columns={columns}
          data={costCenters || []}
          title=''
          components={{
            ...stickyTableComponents,
            Toolbar: () => null,
          }}
          options={getStickyTableOptions({
            bodyOffset: 200,
            headerStyle: { fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' },
            options: {
              cellStyle: { fontSize: 12 },
              paging: false,
              search: false,
              toolbar: false,
              tableLayout: 'auto',
            },
          })}
        />
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>
          {mode === 'edit' ? 'Edit Cost Center' : 'Add Cost Center'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name='code' label='Code' size='small' fullWidth required
                value={formValues.code} onChange={handleChange}
                placeholder='e.g. CC-001, TECH'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name='name' label='Name' size='small' fullWidth required
                value={formValues.name} onChange={handleChange}
                placeholder='e.g. Technology, Operations'
              />
            </Grid>
            <Grid size={12}>
              <TextField
                select name='department_id' label='Department (Optional)' size='small' fullWidth
                value={formValues.department_id} onChange={handleChange}
              >
                <MenuItem value=''>None</MenuItem>
                {(departmentTree || []).map((d) => (
                  <MenuItem key={d.department_id} value={d.department_id}>
                    {d.department_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                name='total_amount'
                label='Total Amount'
                size='small'
                fullWidth
                type='number'
                value={formValues.total_amount}
                onChange={handleChange}
                inputProps={{ min: 0, step: '0.01' }}
                placeholder='e.g. 25000'
              />
            </Grid>
            <Grid size={12}>
              <TextField
                name='description' label='Description' size='small' fullWidth multiline rows={2}
                value={formValues.description} onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color='error'>Cancel</Button>
          <Button onClick={handleSave} variant='contained' disabled={!formValues.code || !formValues.name}>
            {mode === 'edit' ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
