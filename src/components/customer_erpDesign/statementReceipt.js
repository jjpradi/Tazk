import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import ReactToPrint from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
import StatementDialog from './StatementDialog';

export default function AlertDialog(props) {
  let componentRef;
  return (
    <div>
      <Dialog
        fullWidth
        maxWidth='md'
        open={props.open}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogContent
          ref={(el) => (componentRef = el)}
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <div id='component'>
            <div>
              <StatementDialog
                from={props.from}
                to={props.to}
                open={props.pdfOpen}
                data={props.data}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{mr: '50px', ml: '35px'}}>
          <Button variant='outlined' onClick={props.backBtn}>
            Close
          </Button>

          <ReactToPrint
            trigger={() => (
              <Button variant='contained'>
                <PrintIcon sx={{mr: 1}} fontSize='small' /> Print
              </Button>
            )}
            content={() => componentRef}
          />
        </DialogActions>
      </Dialog>
    </div>
  );
}
