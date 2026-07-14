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

function ExpensesDialog(props) {
  const {open, handleClose, type,requestMode} = props;
  return (
    <Dialog open={open} onClose={handleClose} maxWidth='lg'>
      <DialogTitle>
        <Typography>{'Expenses'}</Typography>
      </DialogTitle>
      <DialogContent>
        <Expenses type={type} handleClose={handleClose} openNewExpense={open} />
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

ExpensesDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
};

export default ExpensesDialog;
