import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  FormControl,
  FormHelperText,
  FormControlLabel,
  Radio,
  RadioGroup,
  Select,
  InputLabel,
  DialogTitle,
  Typography,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Invoice from './Invoice';
import ReactToPrint from 'react-to-print';
import './styles.css';
import PrintIcon from '@mui/icons-material/Print';
import MailIcon from '@mui/icons-material/Mail';
import NewInvoice from '../../../components/invoice/invoice';
import InvoicePos from '../../pointofsale/posSale/posinvoice';
import { baseURL } from '../../../http-common';
import jsPDF from 'jspdf';
import html2pdf from 'html2pdf.js';
import { useReactToPrint } from 'react-to-print';
import EWayBill from './Ewaybill';
import { useTheme } from '@mui/material/styles';
import CommonInvoiceTemplate from 'pages/sales/CommonInvoiceTemp/CommonInvoiceTemplate';
import { useSelector } from 'react-redux';
import posSaleService from 'services/posSale_services';
import docTemplateService from 'services/docTemplate_services';

// import NoteDialog from './NoteDialog'

export default function AlertDialog(props) {
  let invoice = props.invoicefile;
  const [headerview, setheaderview] = useState(true);
  const [papersize, setpapersize] = useState('0');
  const [disableValue, setDisableValue] = useState('');
  const theme = useTheme()

  const componentRef = useRef(null);
  const [templatePrinting, setTemplatePrinting] = useState(false);
  useEffect(() => {
    if (props.mail_configuration && typeof props.mail_configuration[0] !== 'undefined') {
      if (props.mail_configuration[0]?.mail_name === 'Purchase Order' && props.custType !== 'CUSTOMER') {
        setDisableValue(props.mail_configuration[0]?.isActive)

      } else if (props.mail_configuration[0]?.mail_name === 'Pos Sale' && props.posSale && props.sale_status !== 2 && props.sale_status !== 6) {
        setDisableValue(props.mail_configuration[0]?.isActive)

      } else if (props.mail_configuration[0]?.mail_name === 'Sale Order' && props.posSale && props.sale_status !== 2 && props.sale_status !== 6) {
        setDisableValue(props.mail_configuration[0]?.isActive)
      } else if (props.mail_configuration[0]?.mail_name === 'Sale Order' && props.sale_status === 1) {
        setDisableValue(props.mail_configuration[0]?.isActive)
      } else if (props.mail_configuration[0]?.mail_name === 'Sale Order' && props.custType === 'CUSTOMER') {
        setDisableValue(props.mail_configuration[0]?.isActive)
      } else {
        setDisableValue(0)
      }

    }


  }, [props.mail_configuration])
  const {
    vendorReducer: { vendor_id_data, po_temp },
  } = useSelector(state => state)

  // const convertpdf =()=>{
  //   var opt = {
  //     margin:       [3.5, 0.2, 0,0.2],
  //     filename:     'myfile.pdf',

  //     image:        { type: 'jpeg', quality: 0.98 },
  //     html2canvas:  { scale: 2 },
  //     pagebreak: { mode: ['css']},
  //     jsPDF:        { unit: 'in', format: 'a5', orientation: 'portrait' },

  //   };

  //   function pdfCallback(pdfObject) {
  //     var number_of_pages = pdfObject.internal.getNumberOfPages()
  //     var pdf_pages = pdfObject.internal.pages
  //     var myFooter = "Footer info"
  //     for (var i = 1; i < pdf_pages.length; i++) {
  //         // We are telling our pdfObject that we are now working on this page
  //         pdfObject.setPage(i)

  //         pdfObject.text("my header text", 10, 10)

  //         // The 10,200 value is only for A4 landscape. You need to define your own for other page sizes
  //         pdfObject.text(myFooter, 10, 200)
  //     }
  // }
  //   const element = document.getElementById('component')
  //   html2pdf().from(element).set(opt).toPdf().get('pdf').then((pdf) => {
  //     var totalPages = pdf.internal.getNumberOfPages();
  //     var myFooter = "Footer info"
  //     const headercontent = document.getElementById('page_header')
  //     const {companyName, companyAddress, companyEmail, gstin, companyMobile, web, city,state} = props.appConfigData

  //     for (let i = 1; i <= totalPages; i++) {
  //       // set footer to every page
  //       pdf.setPage(i)
  //       pdf.setFontSize(10);
  //     //  var image = <img src={"/photo.png"} alt="" />
  //       // pdf.text('Page ' + i + ' of ' + totalPages, 1,1)
  //       pdf.addImage(image, "PNG", 1,0.8, .8, 0,8);
  //       pdf.text(companyName, 2.8, 0.5 )
  //       pdf.setFontSize(8);
  //       var trty = `1/401, 200 Feet Road, Eachangadu Juction, Keelkattalai;`
  //       pdf.text(companyAddress.slice(0,54), 2.8, 0.7 )
  //       if(companyAddress.length>52){
  //       pdf.text(companyAddress.slice(54,companyAddress.length), 2.8, 0.9 )
  //       }
  //       pdf.text(city, 2.8, 1)
  //       pdf.text(state, 2.8, 1.2)
  //       pdf.text(`Email: ${companyEmail}`, 2.8, 1.35 )
  //       pdf.text(`GSTIN/UIN: ${gstin}`, 2.8, 1.65 )
  //       pdf.text(`Phone: ${companyMobile}`, 2.8, 1.85 )

  //       const custData = props.custData
  //       pdf.setFontSize(10);
  //       pdf.text(`Bill To:${custData.company_name || custData.first_name}`, 2.8, 2.09)
  //       pdf.setFontSize(8);
  //       pdf.text(`Address:  ${custData.address ? custData.address + ',' : ''}  `, 2.8, 2.30 )
  //       pdf.text(`${custData.city || ''},`,2.8, 2.50)
  //       pdf.text(`${custData.state ? custData.state + '' : ''}, ${custData.zip || ''}`, 2.8,2.70  )
  //       pdf.text(`Phone: ${custData.phone_number || ''}`, 2.8, 2.90 )
  //       pdf.text(`GSTIN/UIN: ${custData.tax_id || ''}`, 2.8, 3.10 )

  //       // The 10,200 value is only for A4 landscape. You need to define your own for other page sizes

  //       // pdf.line(0.2,7.80,8, 7.80)
  //       if(i === totalPages){
  //         pdf.text('Customer Signature', 0.2,7.80)

  //         if(companyName.length >39){
  //         pdf.text(`${companyName}`, 3.4,7.80)
  //       }
  //       else{
  //         pdf.text(`${companyName}`, 4.5,7.80)
  //       }
  //       pdf.text(`-------------------------------------------------------------------------------------------------------------------------------------------------------`, 0.2,7.90)
  //       }
  //       var footercontnt = `Phone:${companyMobile} Email:${companyEmail || ''} web:${web || ''}  GSTIN: ${gstin || ''}`
  //       // document.documentElement.style.setProperty("color", "red");
  //     //  element.css( { "page-break":"after", "background-color" : "#F5F5F5" });
  //       pdf.text(footercontnt.slice(0,104), 0.2,8)
  //       pdf.text(footercontnt.slice(104, footercontnt.length), 5,8.1)
  //       //  pdf.text( `phone:${companyMobile || '' }` `Email:${companyEmail || ''}` `web:${web || '' }` `GSTIN: ${gstin || '' }`,  5, 8)
  //        pdf.text('Page ' + i + ' of ' + totalPages, 5, 8.2);
  //     }

  //   }).output('blob').then(blob => {
  //     let iframe = document.createElement('iframe')
  //     iframe.src = window.URL.createObjectURL(blob)
  //     iframe.id = 'target-iframe'
  //     iframe.style.display = 'none'

  //     document.getElementById('posprint').insertBefore(iframe, document.getElementById('posprint').childNodes[0])
  //     setheaderview(true)
  //     document.getElementById('target-iframe').contentWindow.print()
  //     })

  // }
  // const printFunc = ()=>{
  //   setheaderview(true)
  // }
  // useEffect(()=>{
  // window.addEventListener('beforeprint', printFunc)
  // return ()=>{
  // window.removeEventListener('close', printFunc)

  // }
  // },[])
  const reviveLayout = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(reviveLayout);
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
          return [key, reviveLayout(value)];
        })
      );
    }
    if (typeof obj === 'string' && obj.trim().startsWith('(') && obj.includes('=>')) {
      return eval(`(${obj})`);
    }
    return obj;
  }
 const handlePrint = () =>{
  
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
    
    // try{
    //   pdfMake.fonts = {
    //     Poppins: {
    //       normal:   'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Regular.ttf',
    //       bold:     'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Bold.ttf',
    //       italics:  'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Italic.ttf',
    //       bolditalics: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-BoldItalic.ttf'
    //     }
    //   }
    //   let data = reviveLayout(po_temp)
    //   if (props.cancelStatus) {
    //     data.watermark = {
    //       text: 'CANCELLED',
    //       color: '#bfbfbf',
    //       opacity: 0.4,
    //       bold: true,
    //       italics: false,
    //       fontSize: 60,
    //       angle: -30,
    //       margin: [0, 300]
    //     };
    //   }

    //   pdfMake.createPdf(data).getBase64((base64Pdf) => {
    //     function base64ToBlob(base64, mimeType) {
    //      const byteChars = atob(base64);
    //      const byteNumbers = new Array(byteChars.length);
    //      for (let i = 0; i < byteChars.length; i++) {
    //        byteNumbers[i] = byteChars.charCodeAt(i);
    //      }
    //      const byteArray = new Uint8Array(byteNumbers);
    //      return new Blob([byteArray], { type: mimeType });
    //    }
       
    //    // 2. Generate Blob and object URL
    //    const pdfBlob = base64ToBlob(base64Pdf, 'application/pdf');
    //    const blobUrl = URL.createObjectURL(pdfBlob); 
       
    //    // 3. Create hidden iframe and print
    //    const iframe = document.createElement('iframe');
    //    iframe.style.display = 'none';
    //    iframe.src = blobUrl; // blob URL same origin
    //    document.body.appendChild(iframe);
       
    //    iframe.onload = () => {
    //      iframe.contentWindow.focus();
    //      iframe.contentWindow.print(); 
    //    };
    //    });
    // }catch(err){
    //  return err
    // }
  }

  const Change = (e) => {
    let { value } = e.target;
    setpapersize(value);
  };

  // Get sale_id from various prop shapes
  const getSaleId = () => {
    return props.sale_id || props.invoice?.sale_id || props.invoice?.saleId || props.saleId;
  };

  const handleTemplatePrint = async () => {
    try {
      const saleId = getSaleId();
      if (!saleId || templatePrinting) return;
      setTemplatePrinting(true);

      // 1. Fetch normalized payload
      const docType = props.invoicepos ? 'pos_receipt' : 'sales_invoice';
      const payloadRes = props.invoicepos
        ? await posSaleService.getReceiptPayload(saleId)
        : await posSaleService.getSalesInvoicePayload(saleId);

      // 2. Call server to render PDF (Puppeteer converts HTML→PDF)
      const renderRes = await docTemplateService.renderPreview({
        document_type: docType,
        paper_size: 'A4_portrait',
        output_type: 'print',
        location_id: props.invoice?.location_id,
        company_id: props.invoice?.company_id,
        payload: payloadRes.data
      });

      const { pdfBase64 } = renderRes.data;

      // 3. Open PDF in new tab — like Zoho/Freshworks
      if (pdfBase64) {
        const byteArray = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      }

      // 4. Log render event (non-blocking)
      docTemplateService.logRender({
        document_type: docType,
        document_id: saleId,
        template_id: renderRes.data.template_id,
        template_version: renderRes.data.version,
        output_type: 'print',
        paper_size: 'A4_portrait',
      }).catch(() => {});

    } catch (err) {
      console.error('Template print failed:', err);
    } finally {
      setTemplatePrinting(false);
    }
  };

const transactionNeeds = props.pageType !== undefined && props.pageType === "TRANSACTIONS"
console.log(props.invoicepos,'propsprops');

  return (
    <div>
      <Dialog
        fullWidth
        // maxWidth='md'
        open={props.open}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        sx={{
          '& .MuiDialog-paper': {
            // height: {
            //   xs: '700px',
            //   md: '900px',
            // },
            // maxHeight: '100vh',
            overflow: 'hidden',
            maxWidth: '845px'
          },
        }}
         PaperProps={{
    style: {
      backgroundColor: 'white',
      maxHeight: '100vh', 
    },
  }}
      >
        <DialogTitle sx={{backgroundColor: `${theme.palette.primary.main}`}}>
          <Typography
            sx={{
              color: 'rgb(255, 255, 255)',
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            {/* {props.custType === 'CUSTOMER'
              ? props.custType === 'CUSTOMER' &&
                props.E_invoice !== undefined &&
                props.E_invoice.length > 0
                ? 'E-Invoice'
                : props.invoice
                ? 'Tax Invoice' : props.dc_number ? 'Delivery Challan'
                : 'Sales Order'
              : 'Purchase Order'} */}
            {props.popupData?.Template?.content?.[0]?.text}
          </Typography>
        </DialogTitle>
        {props.invoicepos === true ? (
          <DialogContent
            ref={componentRef}
            style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              overflow: 'auto',
              padding: 2,
            }}
            //  className='tab_screen2'
          >
            {/* <div className= {props.invoicepos === true ? 'invoice_wrap1_pos': 'invoice_wrap1'}> */}
            {/* <div id = 'posprint'></div> */}
            {/* <div id='component' className='invoice_wrap'>
           <div className='invoice_wrap1'>
             {/* {props.invoicefile !== null && props.invoicefile !=='' && props.invoicefile?.includes("/") === false && props.invoicepos === true ?
              <div style={{height:'900px' , width:'600px'}}>
             <iframe src= {`${baseURL}/sales/invoice/${props.invoicefile}`}  height="100%" width="100%" />
           </div> :
           <Invoice sales_payments={props.sales_payments} appConfigData={props.appConfigData} note={props.note} custType={props.custType} custData={props.custData} invoice={props.invoice} soDate={props.soDate} sales_items={props.sales_items} posSale={props.posSale} />
           } */}
            {/* {props.invoicepos === true ? (
               <InvoicePos
                 sales_payments={props.sales_payments}
                 appConfigData={props.appConfigData}
                 note={props.note}
                 custType={props.custType}
                 custData={props.custData}
                 invoice={props.invoice}
                 soDate={props.soDate}
                 sales_items={props?.sales_items}
                 posSale={props.posSale}
                 headerview={headerview}
                 papersize={papersize}
               />
             ) : (<>
               <Invoice
                 sales_payments={props.sales_payments}
                 appConfigData={props.appConfigData}
                 note={props.note}
                 custType={props.custType}
                 custData={props.custData}
                 invoice={props.invoice}
                 soDate={props.soDate}
                 sales_items={props?.sales_items}
                 posSale={props.posSale}
                 E_invoice = {props.handle_Einvoice}
               />
               <EWayBill />
               </>
             )}
           </div> */}
            {/* </div>  */}
            <div id='component' className='invoice_wrap'>
              <div className='invoice_wrap1'>
                <InvoicePos
                  sales_payments={props.sales_payments}
                  appConfigData={props.appConfigData}
                  note={props.note}
                  custType={props.custType}
                  custData={props.custData}
                  invoice={props.invoice}
                  soDate={props.soDate}
                  sales_items={props?.sales_items}
                  posSale={props.posSale}
                  headerview={headerview}
                  papersize={papersize}
                  E_invoice={props.Einvoice}
                  sale_status={props.sale_status}
                />
              </div>
            </div>
          </DialogContent>
        ) : (
          <DialogContent
            // ref={(el) => (componentRef = el)}
            sx={{
      overflowY: 'hidden',
      maxHeight: '100vh', 
      backgroundColor: 'white',
    }}
            //  style={{
            //   display: 'block',
            //   //justifyContent: 'center',
            //   width: '100%',
            //   height: '100%',
            //   overflow: 'hidden',
            //   //padding: 2,
            // }}
          >
            {/* <div className= {props.invoicepos === true ? 'invoice_wrap1_pos': 'invoice_wrap1'}> */}
            {/* <div id = 'posprint'></div> */}
            {/* <div id='component' className='invoice_wrap'>
           <div className='invoice_wrap1'>
             {/* {props.invoicefile !== null && props.invoicefile !=='' && props.invoicefile?.includes("/") === false && props.invoicepos === true ?
              <div style={{height:'900px' , width:'600px'}}>
             <iframe src= {`${baseURL}/sales/invoice/${props.invoicefile}`}  height="100%" width="100%" />
           </div> :
           <Invoice sales_payments={props.sales_payments} appConfigData={props.appConfigData} note={props.note} custType={props.custType} custData={props.custData} invoice={props.invoice} soDate={props.soDate} sales_items={props.sales_items} posSale={props.posSale} />
           } */}
            {/* {props.invoicepos === true ? (
               <InvoicePos
                 sales_payments={props.sales_payments}
                 appConfigData={props.appConfigData}
                 note={props.note}
                 custType={props.custType}
                 custData={props.custData}
                 invoice={props.invoice}
                 soDate={props.soDate}
                 sales_items={props?.sales_items}
                 posSale={props.posSale}
                 headerview={headerview}
                 papersize={papersize}
               />
             ) : (<>
               <Invoice
                 sales_payments={props.sales_payments}
                 appConfigData={props.appConfigData}
                 note={props.note}
                 custType={props.custType}
                 custData={props.custData}
                 invoice={props.invoice}
                 soDate={props.soDate}
                 sales_items={props?.sales_items}
                 posSale={props.posSale}
                 E_invoice = {props.handle_Einvoice}
               />
               <EWayBill />
               </>
             )}
           </div> */}
            {/* </div>  */}
            {/* <div id="component" ref={(el) => (componentRef = el)} className="invoice_wrap">
           <div className="invoice_wrap1"> */}
            <CommonInvoiceTemplate 
            cancelStatus = {props.cancelStatus}
            />
            {/* <div className="page"> */}
            {/* <Invoice
              sales_payments={props.sales_payments}
              appConfigData={props.appConfigData}
              note={props.note}
              custType={props.custType}
              custData={props.custData}
              invoice={props.invoice}
              soDate={props.soDate}
              sales_items={props?.sales_items}
              posSale={props.posSale}
              E_invoice={props.handle_Einvoice}
              shipTo={props.shipTo}
              shipping_details={props.shipping_details}
              soNumber={props.soNumber}
              termsAndConditionsList={props.termsAndConditionsList}
              tcs={props?.tcs}
              tds={props?.tds}
              tcspercent={props?.tcspercent}
              tdspercent={props?.tdspercent}
              status={props.status}
              sale_status={props.sale_status}
              isRoundedOffNegative={props?.isRoundedOffNegative || 0}
              rounded_off={props?.rounded_off || 0}
              dc_number={props.dc_number}
            /> */}
            {/* </div> */}
            {/* E_invoice[0]?.invoice[0]?.EwbNo !== null && */}
            {/* {props.handle_Einvoice !== undefined &&
            props.handle_Einvoice.length &&
            props.handle_Einvoice[0]?.invoice.length > 0 &&
            props.handle_Einvoice[0]?.invoice[0]?.EwbNo !== null ? (
              <>
                <br />
                <div
                  className='page'
                  style={{
                    pageBreakBefore: 'always',
                    //width: '800px',
                    margin: '0 auto',
                    padding: 0,
                    lineHeight: 1.2,
                  }}
                >
                  <EWayBill
                    consignee={props.custData}
                    invoice={props.invoice}
                    items={props?.sales_items}
                    appConfigData={props.appConfigData}
                    E_invoice_sign={props.handle_Einvoice}
                  />
                </div>
              </>
            )  */}
            {/* : (
              ''
            )} */}

            {/* </div>
         </div> */}
          </DialogContent>
        )}

        <DialogActions sx={{mr: '50px', ml: '35px'}}>
          <Button
            variant='outlined'
            onClick={(e) => {
              props.handleClose();
              if (props.custType !== 'CUSTOMER') {
                props.tableHandleClose();
              }
            }}
          >
            Close
          </Button>

          {props.custType !== undefined &&
            props.custType === 'CUSTOMER' &&
            !transactionNeeds && (
              <Button
                variant='outlined'
                onClick={(e) => {
                  props.handleNewopen();
                  // if (props.custType !== 'CUSTOMER') {
                  //   props.tableHandleClose();
                  // }
                }}
              >
                New Create
              </Button>
            )}

          {/* <NoteDialog addNote={props.addNote} /> */}

          {(props.posSale && props.sale_status === 6) ||
            (props.sale_status === 2 && (
              <Button
                variant='contained'
                onClick={(e) => {
                  props.createMail();
                }}
              >
                <MailIcon sx={{mr: 1}} fontSize='small' /> send{' '}
                {props.posSale
                  ? 'INVOICE'
                  : props.custType === 'CUSTOMER'
                  ? 'SO'
                  : props.custType === 'COLLECTDEFECT' ? 'COLLECT DEFECT' : props.custType === 'SENDDEFECT' ? 'SEND DEFECT' : props.custType === 'CUSTOMERREPLACEMENT' ? 'ISSUE REPLACEMENT' : props.custType === 'VENDORREPLACEMENT' ? 'COLLECT REPLACEMENT' : 'PO'}
              </Button>
            ))}

          {props.posSale &&
            props.sale_status !== 2 &&
            props.sale_status !== 6 &&
            (
              <Button
                style={{visibility: disableValue === 0 ? 'hidden' : 'visible'}}
                variant='contained'
                onClick={(e) => {
                  props.createMail();
                }}
              >
                <MailIcon sx={{mr: 1}} fontSize='small' /> SEND INVOICE
              </Button>
            )}

          {props.custType !== 'CUSTOMER' && (
            <Button
              style={{visibility: disableValue === 0 ? 'hidden' : 'visible'}}
              variant='contained'
              onClick={(e) => {
                props.createMail();
              }}
            >
              <MailIcon sx={{mr: 1}} fontSize='small' />  {props.custType === 'COLLECTDEFECT' ? 'COLLECT DEFECT' : props.custType === 'SENDDEFECT' ? 'SEND DEFECT' : props.custType === 'CUSTOMERREPLACEMENT' ? 'ISSUE REPLACEMENT' : props.custType === 'VENDORREPLACEMENT' ? 'COLLECT REPLACEMENT' : props.custType === 'CUSTOMERDC' ? 'SEND DC' : 'SEND PO'}
            </Button>
          )}

          {props.sale_status === 1 && (
            <Button
              style={{visibility: disableValue === 0 ? 'hidden' : 'visible'}}
              variant='contained'
              onClick={(e) => {
                props.createMail();
              }}
            >
              <MailIcon sx={{mr: 1}} fontSize='small' /> SEND SO
            </Button>
          )}
          {/* {props.invoicepos === true ?
           <Button variant='contained' onClick={()=>{setheaderview(false);convertpdf();}} ><PrintIcon sx={{ mr: 1 }} fontSize='small' /> Print</Button>:
          <ReactToPrint
            trigger={() => <Button variant='contained'><PrintIcon sx={{ mr: 1 }} fontSize='small' /> Print</Button>}
            content={() => componentRef.current}
          />
          
          } */}
          <p></p>
          {props.invoicepos === true && (
            // <>
            // <Button variant='contained' onClick={e => { setpapersize(true)  }}><PrintIcon sx={{ mr: 1 }} fontSize='small' /> A4</Button>
            // <Button variant='contained' onClick={e => { setpapersize(false)  }}><PrintIcon sx={{ mr: 1 }} fontSize='small' /> A5</Button>
            // </>
            (<FormControl component='fieldset' style={{marginLeft: '5px'}}>
              <RadioGroup
                row
                aria-label='customer'
                value={papersize}
                name='customer_type'
                onChange={Change}
              >
                <FormControlLabel value='0' control={<Radio />} label='A5' />
                <FormControlLabel value='1' control={<Radio />} label='A4' />
              </RadioGroup>
            </FormControl>)
          )}
          {/* <Button variant='contained' onClick={handlePrint}>
                                    Print
                                  </Button> */}
          {(props.invoicepos === true && props.custType === 'CUSTOMER') && (
            <Button variant='outlined' onClick={handleTemplatePrint}
              disabled={templatePrinting}
              sx={{ mr: 1 }}>
              <PrintIcon sx={{mr: 1}} fontSize='small' /> {templatePrinting ? 'Generating...' : 'Template Print'}
            </Button>
          )}
          {props.invoicepos === true ? (
            <Button variant='contained' onClick={() => {
              const printContent = componentRef.current;
              if (!printContent) return;
              const printWindow = window.open('', '_blank');
              if (!printWindow) return;
              const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
                .map(s => s.outerHTML).join('');
              const isA5 = papersize === '0';
              const pageSize = isA5 ? 'A5' : 'A4';
              const fontSize = isA5 ? '9px' : '12px';
              const printStyles = `<style>
                @page { size: ${pageSize}; margin: 0mm; }
                @media print {
                  html, body { margin: 4mm 4mm 4mm 5mm; padding: 0; width: auto; box-sizing: border-box; font-size: ${isA5 ? '10px' : '13px'}; }
                  .p, .p_bold, .product, .small { font-size: ${isA5 ? '0.8rem' : '0.9rem'} !important; }
                  .totalwidth, .a4width { width: 100% !important; max-width: 100% !important; }
                  .terms, .a4terms { min-height: auto !important; }
                  .b_color_bottom { min-height: auto !important; }
                  img { max-width: ${isA5 ? '120px' : '150px'} !important; height: auto !important; }
                  .MuiTypography-root { font-size: ${isA5 ? '1.1rem' : '1.3rem'} !important; }
                  hr { margin: 2px 0 !important; }
                  .MuiGrid2-root { margin-top: 0 !important; padding-top: 0 !important; }
                }
              </style>`;
              printWindow.document.write(`<html><head><title>Invoice</title>${styles}${printStyles}</head><body>${printContent.innerHTML}</body></html>`);
              printWindow.document.close();
              const images = printWindow.document.querySelectorAll('img');
              const imagePromises = Array.from(images).filter(img => !img.complete).map(img =>
                new Promise(resolve => { img.onload = resolve; img.onerror = resolve; })
              );
              Promise.all(imagePromises).then(() => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
              });
            }}>
              <PrintIcon sx={{mr: 1}} fontSize='small' /> Print
            </Button>
          ) : (
            <Button variant='contained' onClick={handlePrint}>
              <PrintIcon sx={{mr: 1}} fontSize='small' /> Print
            </Button>
          )}
          {/* <Button color='primary' onClick={() => {setClick(true);setCashBoxClick(true);setOrderClick(true);
                  setTimeout(() => {
                    handlePrint()
                  }, 1000);
                }}> Print Summary</Button> */}
        </DialogActions>
      </Dialog>

    </div>
  );
}
