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

function PayInOutDialog(props) {
  const {open, handleClose, type,requestMode, reconciliateData, handleReconciliate, paymentData} = props;
  return (
    <Dialog open={open} onClose={handleClose} maxWidth='lg'>
      <DialogTitle>
        <Typography>{'Payment Page'}</Typography>
      </DialogTitle>
      <DialogContent>
        <CashOutIn type={type} handleClose={handleClose} requestMode={requestMode} reconciliateData={reconciliateData} handleReconciliate={handleReconciliate} paymentData={paymentData} bankId={props.bankId} />
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

PayInOutDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  handleReconciliate: PropTypes.func,
  type: PropTypes.string,
  requestMode: PropTypes.string,
  reconciliateData: PropTypes.object
};

export default PayInOutDialog;
