import React, { useState, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Chip, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Autocomplete, IconButton, Tooltip, Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  getEmployeeDocumentsAction,
  createDocumentAction,
  deleteDocumentAction,
} from 'redux/actions/documentManagement.actions';
import EmployeeProfileService from 'services/employeeProfile.services';

const VERIFICATION_STATUS = {
  pending: { bg: '#fff3e0', color: '#ed6c02', label: 'Pending' },
  verified: { bg: '#e8f5e9', color: '#2e7d32', label: 'Verified' },
  rejected: { bg: '#ffebee', color: '#d32f2f', label: 'Rejected' },
  expired: { bg: '#f5f5f5', color: '#757575', label: 'Expired' },
};

export default function EmployeeDocsTab({ onRefresh }) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const { DocumentManagementReducer: { employeeDocuments, categories, verificationTypes } } = useSelector((s) => s);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);
  const [form, setForm] = useState({
    document_type: '', category_id: '', remarks: '', file_url: '', file_name: '', expiry_date: '',
  });

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await EmployeeProfileService.searchEmployees();
        if (res.status === 200) setEmployees(res.data || []);
      } catch (e) { /* ignore */ }
    };
    loadEmployees();
  }, []);

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    if (emp) {
      dispatch(getEmployeeDocumentsAction(emp.employee_id, setModalTypeHandler, setLoaderStatusHandler));
    }
  };

  const handleCreate = async () => {
    if (!selectedEmployee) return;
    await dispatch(createDocumentAction(
      { ...form, employee_id: selectedEmployee.employee_id },
      setModalTypeHandler, setLoaderStatusHandler,
    ));
    setAddOpen(false);
    setForm({ document_type: '', category_id: '', remarks: '', file_url: '', file_name: '', expiry_date: '' });
    dispatch(getEmployeeDocumentsAction(selectedEmployee.employee_id, setModalTypeHandler, setLoaderStatusHandler));
    onRefresh?.();
  };

  const handleDelete = async (id) => {
    await dispatch(deleteDocumentAction(id, setModalTypeHandler, setLoaderStatusHandler));
    if (selectedEmployee) {
      dispatch(getEmployeeDocumentsAction(selectedEmployee.employee_id, setModalTypeHandler, setLoaderStatusHandler));
    }
    onRefresh?.();
  };

  const docs = employeeDocuments || [];
  const grouped = docs.reduce((acc, doc) => {
    const cat = doc.category_name || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {});

  return (
    <Box>
      {/* Search */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <Autocomplete
          options={employees}
          getOptionLabel={(o) => `${o.first_name || ''} (${o.employeeId || ''})`}
          value={selectedEmployee}
          onChange={(_, v) => handleSelectEmployee(v)}
          size='small'
          sx={{ minWidth: 300 }}
          renderInput={(params) => (
            <TextField {...params} label='Search Employee' placeholder='Name or code...'
              InputProps={{ ...params.InputProps, startAdornment: <SearchIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} /> }} />
          )}
          renderOption={(props, option) => (
            <Box component='li' {...props} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Avatar src={option.image || undefined} sx={{ width: 28, height: 28 }}>
                {(option.first_name || '?')[0]}
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: 12 }}>{option.first_name} {option.last_name || ''}</Typography>
                <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>{option.employeeId} - {option.designation || ''}</Typography>
              </Box>
            </Box>
          )}
        />
        {selectedEmployee && (
          <Button size='small' variant='contained' startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)}
            sx={{ textTransform: 'none', fontSize: 12 }}>
            Add Document
          </Button>
        )}
      </Box>

      {!selectedEmployee ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            Select an employee to view their documents.
          </Typography>
        </Paper>
      ) : docs.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            No documents found for this employee.
          </Typography>
        </Paper>
      ) : (
        Object.entries(grouped).map(([category, catDocs]) => (
          <Box key={category} sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1, color: 'primary.main' }}>{category}</Typography>
            <Grid container spacing={1.5}>
              {catDocs.map((doc) => {
                const vs = VERIFICATION_STATUS[doc.verification_status] || VERIFICATION_STATUS.pending;
                return (
                  <Grid key={doc.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper
                      elevation={0}
                      sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                        borderLeft: `3px solid ${vs.color}` }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 600 }} noWrap>
                            {doc.document_type_name || doc.index_type_name || `Doc #${doc.id}`}
                          </Typography>
                          <Chip size='small' label={vs.label}
                            sx={{ mt: 0.5, fontSize: 9, height: 20, bgcolor: vs.bg, color: vs.color, fontWeight: 600 }} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.3 }}>
                          {doc.file_url && (
                            <Tooltip title='Open File'>
                              <IconButton size='small' onClick={() => window.open(doc.file_url, '_blank')}>
                                <OpenInNewIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title='View Details'>
                            <IconButton size='small' onClick={() => setViewDoc(doc)}>
                              <VisibilityIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Delete'>
                            <IconButton size='small' color='error' onClick={() => handleDelete(doc.id)}>
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      {doc.file_name && (
                        <Typography sx={{ fontSize: 10, color: 'text.secondary', mt: 0.5 }} noWrap>
                          {doc.file_name}
                        </Typography>
                      )}
                      {doc.expiry_date_formatted && (
                        <Typography sx={{ fontSize: 10, color: 'text.secondary', mt: 0.3 }}>
                          Expires: {doc.expiry_date_formatted}
                        </Typography>
                      )}
                      {doc.remarks && (
                        <Typography sx={{ fontSize: 10, color: 'text.secondary', mt: 0.3, fontStyle: 'italic' }} noWrap>
                          {doc.remarks}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ))
      )}

      {/* Add Document Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>Add Document</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField
            select label='Document Type' size='small' fullWidth
            value={form.document_type}
            onChange={(e) => setForm({ ...form, document_type: e.target.value })}
            SelectProps={{ native: true }}
          >
            <option value=''>Select type...</option>
            {(verificationTypes || []).map((vt) => (
              <option key={vt.id} value={vt.id}>{vt.verification_name}</option>
            ))}
          </TextField>
          <TextField
            select label='Category' size='small' fullWidth
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            SelectProps={{ native: true }}
          >
            <option value=''>Select category...</option>
            {(categories || []).map((c) => (
              <option key={c.id} value={c.id}>{c.category_name}</option>
            ))}
          </TextField>
          <TextField label='File URL' size='small' fullWidth
            value={form.file_url}
            onChange={(e) => setForm({ ...form, file_url: e.target.value })} />
          <TextField label='File Name' size='small' fullWidth
            value={form.file_name}
            onChange={(e) => setForm({ ...form, file_name: e.target.value })} />
          <TextField label='Expiry Date' size='small' fullWidth type='date'
            InputLabelProps={{ shrink: true }}
            value={form.expiry_date}
            onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
          <TextField label='Remarks' size='small' fullWidth multiline rows={2}
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' onClick={handleCreate} sx={{ textTransform: 'none' }}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={!!viewDoc} onClose={() => setViewDoc(null)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>Document Details</DialogTitle>
        <DialogContent>
          {viewDoc && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
              {[
                ['Document Type', viewDoc.document_type_name || '-'],
                ['Category', viewDoc.category_name || '-'],
                ['File Name', viewDoc.file_name || '-'],
                ['File Size', viewDoc.file_size ? `${(viewDoc.file_size / 1024).toFixed(1)} KB` : '-'],
                ['Status', viewDoc.verification_status || '-'],
                ['Verified By', viewDoc.verified_by_name || '-'],
                ['Verified Date', viewDoc.verified_date_formatted || '-'],
                ['Rejection Reason', viewDoc.rejection_reason || '-'],
                ['Expiry Date', viewDoc.expiry_date_formatted || '-'],
                ['Remarks', viewDoc.remarks || '-'],
                ['Uploaded', viewDoc.created_date || '-'],
              ].map(([label, value]) => (
                <Box key={label} sx={{ display: 'flex', gap: 1 }}>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', minWidth: 120 }}>{label}:</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{value}</Typography>
                </Box>
              ))}
              {viewDoc.file_url && (
                <Button size='small' variant='outlined' startIcon={<OpenInNewIcon />}
                  onClick={() => window.open(viewDoc.file_url, '_blank')}
                  sx={{ textTransform: 'none', mt: 1, alignSelf: 'flex-start' }}>
                  Open File
                </Button>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDoc(null)} sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
