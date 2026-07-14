import React, { useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Invoice from './Invoice';
import ReactToPrint from 'react-to-print';
import '../styles.css';
import PrintIcon from '@mui/icons-material/Print';
import MailIcon from '@mui/icons-material/Mail';
import invoicetemp from './invoicetemp';
import { useSelector } from 'react-redux';
import CommonInvoiceTemplate from 'pages/sales/CommonInvoiceTemp/CommonInvoiceTemplate';

export default function AlertDialog(props) {
  const componentRef = useRef(null);
  const invoiceRef = useRef(null);
    const {
    appConfigReducer: { app_config_data },
     vendorReducer : { po_temp }
  } = useSelector((state) => state);
  const [tcstaxvisible, setTcstaxvisible] = useState(false)
    // const { companyName, companyAddress, companyEmail, gstin, companyMobile } =
    // appConfigData || {};
    console.log('this is is is is');
    
  useEffect(() => {
    if (componentRef.current) {
      console.log('Container height:', componentRef.current.offsetHeight,props?.manualnote);
      console.log('Container width:', componentRef.current.offsetWidth);
    }
    if (invoiceRef.current) {
      invoiceRef.current.innerHTML = invoicetemp({
        sales_payments: props.sales_payments,
        appConfigData: props.appConfigData,
        note: props.note,
        custType: props.custType,
        custData: props.custData,
        invoice: props.invoice,
        soDate: props.soDate,
        sales_items: props.sales_items,
        posSale: props.posSale,
        manualnote: props?.manualnote,
        tcstaxvisible:tcstaxvisible
      });
    }
  
    return () => {
      if (invoiceRef.current) {
        invoiceRef.current.innerHTML = '<div></div>';
      }
    };
  }, [props]);
    useEffect(() => {
      if (props.custData?.tcs === 1) {
        setTcstaxvisible(true)
      } else {
        setTcstaxvisible(false)
      }
    })

    const handlePrintReceipt = () => {
      try {
          const base64 = po_temp.pdfBase64

          const byteChars = atob(base64)
          const byteNumbers = new Array(byteChars.length)

          for (let i = 0; i < byteChars.length; i++) {
              byteNumbers[i] = byteChars.charCodeAt(i)
          }

          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], { type: 'application/pdf' })

          const blobUrl = URL.createObjectURL(blob)

          const iframe = document.createElement('iframe')
          iframe.style.display = 'none'
          iframe.src = blobUrl
          document.body.appendChild(iframe)

          iframe.onload = () => {
              iframe.contentWindow.focus()
              iframe.contentWindow.print()
          }
      } 
      catch (err) {
          console.error('Print error:', err)
      }
    }

  return (
    <div>
      <Dialog
        fullWidth
        maxWidth='md'
        open={props.open}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        PaperProps={{
          style: {
            backgroundColor: 'white',
          },
        }}
      >
        <DialogContent
          ref={componentRef}
          style={{
            display: "block",
             overflow:'hidden',
             backgroundColor: 'white'
           }}
        >
          {/* <div id='component' className='invoice_wrap'> */}
          {/* {props?.manualnote !== undefined  ? (<div
            className='invoice_wrap1'
            key={new Date().getTime()}
            ref={invoiceRef}
            style={{height: '100vh', padding: 5}}
          ></div>):( */}
          {/* <div className='invoice_wrap1'> */}
              {/* <Invoice
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
              /> */}
            {/* </div> */}
          {/* </div> */}
          <CommonInvoiceTemplate/>
        </DialogContent>
        <DialogActions sx={{mr: '50px', ml: '35px'}}>
          <Button variant='outlined' onClick={props.handleClose}>
            Close
          </Button>
          {props?.manualnote === undefined && (
            <Button variant='contained' onClick={props.createMail}>
              <MailIcon sx={{mr: 1}} fontSize='small' />
              {props.custType === 'CUSTOMER' ? 'Send cn' : 'send dn'}
            </Button>
          )}
          {/* <ReactToPrint
            trigger={() => (
              <Button variant='contained'>
                <PrintIcon sx={{mr: 1}} fontSize='small' />
                Print
              </Button>
            )}
            content={() => componentRef.current}
            pageStyle={`
              @page {
                 size: auto;
                margin: 20mm 15mm 20mm 15mm;
                 }
            @page:first {
                margin-top: 5mm; 
                }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
            
                .print-page {
                  page-break-inside: avoid;
                  break-inside: avoid;
                }
            
                .print-page + .print-page {
                  page-break-before: always;
                }
            
                .MuiDialog-root,
                .MuiDialog-container,
                .MuiPaper-root {
                  box-shadow: none !important;
                  overflow: visible !important;
                }
            
                .MuiDialogContent-root {
                  overflow: visible !important;
                }
              }
            `}
          /> */}
          <Button variant='contained' onClick={handlePrintReceipt}>
            <PrintIcon sx={{mr: 1}} fontSize='small' />
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
  
}
