import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import CashOutIn from 'pages/accounts/cashOutIn';
import Expenses from 'pages/accounts/Expenses';
import CollapsibleTable from 'pages/sales/Receipt';


function  ReceiptEntryDialog(props) {
  const {open, handleClose, type,requestMode,custType} = props;
  return (
    <Dialog open={open} onClose={handleClose} maxWidth='lg'>
      <DialogTitle>
        <Typography>{'Payment Page'}</Typography>
      </DialogTitle>
      <DialogContent>
        <CollapsibleTable handleClose={handleClose} custType={custType} newopen={open}/>
      </DialogContent>
      <DialogActions>
       {type !== 'BANKRECONCILIATION' && (
          <Button color="secondary" onClick={handleClose}>
            <Typography>{'Cancel'}</Typography>
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

ReceiptEntryDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
};

export default ReceiptEntryDialog;
