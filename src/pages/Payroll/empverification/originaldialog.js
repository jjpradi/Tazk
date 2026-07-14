import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

function OriginalDocument({ open, unmatched, matched, onClose, submit }) {


  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ style: { backgroundColor: 'white', padding: '20px' } }}
    >
      <DialogTitle>
        Original Document Verification
      </DialogTitle>
      <DialogContent style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <Typography variant="body2" color="textSecondary">
          <strong>1: Above Document is original and verified</strong>
       
        </Typography>

       
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        <Button onClick={submit} color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default OriginalDocument;
