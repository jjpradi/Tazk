import React from 'react';
import Invoice from './Invoice';
import ReactToPrint from 'react-to-print';
import './styles.css';
import {Button, Dialog, DialogActions, DialogContent} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
// import theme from '../../theme';
// import {ThemeProvider} from '@mui/material/styles';
import PrintIcon from '@mui/icons-material/Print';

export default function AlertDialog(props) {
  let componentRef;

  return (
    <div>
      {/* <ThemeProvider theme={theme}> */}
        <Dialog
          fullWidth
          maxWidth='md'
          open={props.open || false}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
        >
          <DialogContent
            ref={(el) => (componentRef = el)}
            style={{display: 'flex', justifyContent: 'center', width: '100%'}}
          >
            <div id='component'>
              <Invoice
                sales_items={props.categoryData}
                sourcelocation={props.sourcelocation}
                destinationlocation={props.destinationlocation}
                ponumber={props.ponumber}
                transfer={props.transfer}
              />
            </div>
          </DialogContent>
          <DialogActions sx={{mr: '50px'}}>
            <Button
              variant='outlined'
              onClick={(e) => {
                props.handleClose();
              }}
            >
              Cancel
            </Button>
            {!props.transfer && (
              <Button
                variant='contained'
                onClick={(e) => {
                  props.handlesubmit();
                }}
              >
                <EmailIcon sx={{mr: 1}} fontSize='small' /> Transfer
              </Button>
            )}

            <ReactToPrint
              onAfterPrint={() => props.setpoStatus && props.setpoStatus(true)}
              trigger={() => (
                <Button variant='contained'>
                  <PrintIcon sx={{mr: 1}} fontSize='small' /> Print
                </Button>
              )}
              content={() => componentRef}
            />
          </DialogActions>
        </Dialog>
      {/* </ThemeProvider> */}
    </div>
  );
}
