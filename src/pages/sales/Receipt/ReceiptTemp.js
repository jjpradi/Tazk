import React, { useRef } from 'react'
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material'
import CommonInvoiceTemplate from 'pages/sales/CommonInvoiceTemp/CommonInvoiceTemplate'
import { useSelector } from 'react-redux'

const ReceiptTempDialog = (props) => {

    const componentRef = useRef(null)

    const {
        vendorReducer: { po_temp }
    } = useSelector(state => state)

    const handlePrint = () => {
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

    const handleDownload = () => {
        try {
            const base64 = po_temp.pdfBase64;

            const byteChars = atob(base64);
            const byteNumbers = new Array(byteChars.length);

            for (let i = 0; i < byteChars.length; i++) {
                byteNumbers[i] = byteChars.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });

            const blobUrl = URL.createObjectURL(blob);

            // Create an <a> element for download
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'quotation.pdf'; // <-- File name
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        }
        catch (err) {
            console.error('Download error:', err);
        }
    };

    return (
        <Dialog
            open={props.open}
            fullWidth
            maxWidth='md'
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            // sx={{
            //     '& .MuiDialog-paper' : {
            //         overflow : 'hidden',
            //         maxWidth : '845px'
            //     }
            // }}
             PaperProps={{
                style: {
                  backgroundColor: 'white',
                  maxHeight: '100vh', 
                },
              }}
        >
            <DialogContent
                ref={componentRef}
                // sx={{
                //     display : 'flex',
                //     overflow: 'hidden',
                //     backgroundColor : 'white',
                //     width : '845px',
                //     justifyContent : 'center'
                // }}
                sx={{
                      overflowY: 'hidden',
                      maxHeight: '100vh', 
                      backgroundColor: 'white',
                    }}
            >
                <CommonInvoiceTemplate />
            </DialogContent>

            <DialogActions sx={{ mr: '50px', ml: '35px' }}>
                <Button
                    variant='outlined'
                    onClick={props.handleClose}
                >
                    Close
                </Button>

                {po_temp?.pdfBase64 && (
                    <Button
                        variant='outlined'
                        onClick={handleDownload}
                    >
                        Download
                    </Button>
                )}

                {props.type !== 'Payslip' &&
                    <Button
                        variant='contained'
                        onClick={handlePrint}
                    >
                        Print
                    </Button>
                }

                {(props.type === 'Payslip' || props.type === 'Bills' || props.type === 'quotation') && (
                    <Button
                        variant='contained'
                        onClick={props.type === 'quotation' ? handleDownload : props.onclick}
                    >
                        Download
                    </Button>
                )}

            </DialogActions>
        </Dialog>
    )
}

export default ReceiptTempDialog