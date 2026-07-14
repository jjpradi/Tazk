import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Avatar, Chip, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  verifyDocumentAction,
  rejectDocumentAction,
} from 'redux/actions/documentManagement.actions';

export default function PendingVerificationsTab({ onRefresh }) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const { DocumentManagementReducer: { pendingVerifications } } = useSelector((s) => s);
  const [rejectDialog, setRejectDialog] = useState({ open: false, id: null, reason: '' });

  const pending = pendingVerifications || [];

  const handleVerify = async (id) => {
    await dispatch(verifyDocumentAction({ id }, setModalTypeHandler, setLoaderStatusHandler));
    onRefresh?.();
  };

  const handleReject = async () => {
    await dispatch(rejectDocumentAction(
      { id: rejectDialog.id, rejection_reason: rejectDialog.reason },
      setModalTypeHandler, setLoaderStatusHandler,
    ));
    setRejectDialog({ open: false, id: null, reason: '' });
    onRefresh?.();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
          Pending Verifications
          {pending.length > 0 && (
            <Chip size='small' label={pending.length}
              sx={{ ml: 1, fontSize: 10, height: 20, bgcolor: '#fff3e0', color: '#ed6c02', fontWeight: 700 }} />
          )}
        </Typography>
      </Box>

      {pending.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            No documents pending verification.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {pending.map((doc) => (
            <Grid key={doc.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                  borderLeft: '3px solid #ed6c02' }}
              >
                {/* Employee Info */}
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1.5 }}>
                  <Avatar src={doc.image || undefined} sx={{ width: 36, height: 36, bgcolor: 'primary.light' }}>
                    {(doc.employee_name || '?')[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }} noWrap>
                      {doc.employee_name} ({doc.employee_code})
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: 'text.secondary' }} noWrap>
                      {doc.document_type_name}{doc.category_name ? ` - ${doc.category_name}` : ''}
                    </Typography>
                  </Box>
                </Box>

                {/* File Info */}
                <Box sx={{ bgcolor: '#fafafa', borderRadius: 1, p: 1.5, mb: 1.5 }}>
                  {doc.file_name && (
                    <Typography sx={{ fontSize: 11, fontWeight: 500 }} noWrap>{doc.file_name}</Typography>
                  )}
                  <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                    Uploaded: {doc.uploaded_date}
                  </Typography>
                  {doc.file_url && (
                    <Chip
                      size='small' icon={<OpenInNewIcon sx={{ fontSize: 12 }} />}
                      label='View File' onClick={() => window.open(doc.file_url, '_blank')}
                      sx={{ mt: 0.5, fontSize: 10, height: 22, cursor: 'pointer' }}
                    />
                  )}
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    size='small' variant='outlined' color='error'
                    startIcon={<CancelIcon sx={{ fontSize: 14 }} />}
                    onClick={() => setRejectDialog({ open: true, id: doc.id, reason: '' })}
                    sx={{ textTransform: 'none', fontSize: 11, py: 0.3 }}
                  >
                    Reject
                  </Button>
                  <Button
                    size='small' variant='contained' color='success'
                    startIcon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                    onClick={() => handleVerify(doc.id)}
                    sx={{ textTransform: 'none', fontSize: 11, py: 0.3 }}
                  >
                    Verify
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, id: null, reason: '' })} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>Reject Document</DialogTitle>
        <DialogContent>
          <TextField
            label='Reason for Rejection' size='small' fullWidth multiline rows={3}
            value={rejectDialog.reason}
            onChange={(e) => setRejectDialog({ ...rejectDialog, reason: e.target.value })}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, id: null, reason: '' })} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleReject}
            disabled={!rejectDialog.reason} sx={{ textTransform: 'none' }}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
