import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Invoice from './Invoice';
import InvoiceForStockReturn from './InvoiceForStock'
import ReactToPrint from 'react-to-print';
import '../styles.css';
import PrintIcon from '@mui/icons-material/Print';
import MailIcon from '@mui/icons-material/Mail';
import CommonInvoiceTemplate from 'pages/sales/CommonInvoiceTemp/CommonInvoiceTemplate';

export default function IndexForStockReturn(props) {
//   console.log("sales_items",props.sales_items)
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
        {/* <DialogContent
          ref={(el) => (componentRef = el)}
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <div id='component' className='invoice_wrap'>
            <div className='invoice_wrap1'>
           <InvoiceForStockReturn
                sales_payments={props.sales_payments}
                appConfigData={props.appConfigData}
                note={props.note}
                custType={props.custType}
                custData={props.custData}
                invoice={props.invoice}
                soDate={props.soDate}
                sales_items={props.sales_items}
                posSale={props.posSale}
                manualnote = {props?.manualnote}
                debitSequence={props?.debitSequence}
              /> 

                
          
            </div>
          </div>
        </DialogContent> */}
        <CommonInvoiceTemplate />
        <DialogActions sx={{mr: '50px', ml: '35px'}}>
          <Button
            variant='outlined'
            onClick={(e) => {
             props.handleClose();
            //  alert('hii')
            }}
          >
            Close
          </Button>
           {props?.manualnote ===undefined &&
          <Button
            variant='contained'
            onClick={(e) => {
              props.createMail();
            }}
          >
            <MailIcon sx={{mr: 1}} fontSize='small' />
            {props.custType === 'CUSTOMER' ? 'Send cn' : 'send dn'}
          </Button>
           }

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
