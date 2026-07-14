import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

function YourDialogComponent({ open, unmatched, matched, onClose }) {
  const matchedCount = matched.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ style: { backgroundColor: 'white', padding: '20px' } }}
    >
      <DialogTitle>
        Unmatched / Existing Items ({unmatched.length}) - Matched Items ({matchedCount})
      </DialogTitle>
      <DialogContent style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <Typography variant="body2" color="textSecondary">
          <strong>1: Maybe the customer ledger is not in this company / Check for differences in capitalization (uppercase/lowercase) in the name.</strong>
          <ul>
            {unmatched
              .filter((item) => item.exist !== 'exists')
              .map((item, index) => (
                <li key={index}>
                  <strong>{item.ledgername}</strong>
                </li>
              ))}
          </ul>
          {unmatched.length === 0 ? (
            <li>
              <strong>No unmatched data found.</strong>
              </li>
          ) : null}
        </Typography>

        <Typography variant="body2" color="textSecondary">
          <strong>2: This ledger already contains existing transactions.</strong>
          <ul>
            {unmatched
              .filter((item) => item.exist === 'exists')
              .map((item, index) => (
                <li key={index}>
                  <strong>{item.ledgername}</strong>
                </li>
              ))}
          </ul>
          {unmatched.some((item) => item.exist === 'exists') ? null : (
            <li>
              <strong>No existing entries found.</strong></li>
          )}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default YourDialogComponent;
