import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useSelector, useDispatch} from 'react-redux';
import apiCalls from 'utils/apiCalls';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {getAppConfigDataAction} from 'redux/actions/app_config_actions';
import moment from 'moment';
import { useCustomFetch } from 'utils/useCustomFetch';
import { ConvertNumberToWords } from '../../../utils/getTimeFormat';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Typography } from '@mui/material';
import API_URLS from 'utils/customFetchApiUrls';

const styles = {
  tg: {
    borderCollapse: 'collapse',
    borderSpacing: '0',
    width: '700px',
  },
  tg_cly1: {
    textAlign: 'left',
    verticalAlign: 'middle',
    border: '1px solid black',
  },
  tg_1wig: {
    textAlign: 'left',
    width: '70px',
    verticalAlign: 'top',
    border: '1px solid black',
    borderBottomStyle: 'none',
  },
  tg_baqh: {
    textAlign: 'center',
    verticalAlign: 'top',
    border: '1px solid black',
  },
  tg_lqy6: {
    textAlign: 'right',
    verticalAlign: 'top',
    border: '1px solid black',
  },
  tg_amwm: {
    fontWeight: 'bold',
    textAlign: 'center',
    verticalAlign: 'top',
    border: '1px solid black',
  },
  tg_0lax: {
    textAlign: 'left',
    verticalAlign: 'top',
    border: '1px solid black',
    borderBottomStyle: 'none',
  },
  tg_0lax_co: {
    textAlign: 'left',
    verticalAlign: 'top',
    border: '1px solid black',
    width: '170px',
  },
  tg_yla0: {
    fontWeight: 'bold',
    textAlign: 'left',
    verticalAlign: 'middle',
    border: '1px solid black',
  },
  tg_l2oz: {
    fontWeight: 'bold',
    textAlign: 'right',
    verticalAlign: 'top',
    border: '1px solid black',
  },
  tg_ufyb: {
    fontStyle: 'italic',
    textAlign: 'right',
    verticalAlign: 'top',
    border: '1px solid black',
  },
  tg_8zwo: {
    fontStyle: 'italic',
    textAlign: 'left',
    verticalAlign: 'top',
    border: '1px solid black',
  },
  tg_0laxSL: {
    fontStyle: 'italic',
    textAlign: 'left',
    verticalAlign: 'top',
    border: '1px solid black',
    width: '40px',
  },
};

export default function CreditDebitNoteTemplate(props) {
  const { open, handleClose, templateData } = props;
  const myContainer = useRef(null);
  const dispatch = useDispatch();
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);
  const {
    appConfigReducer: {app_config_data},
  } = useSelector((state) => state);


  useEffect(() => {
    if (open) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        !app_config_data.length &&
          dispatch(
            getAppConfigDataAction(setModalTypeHandler, setLoaderStatusHandler),
          ),
      );
    }
  }, []);

  const appConfigData = useMemo(() => {
    const data = {};
    for (const d of app_config_data) {
      data[d.key_name] = d.value;
    }
    return data;
  }, [app_config_data]);

  const handleDownload = () => {
    const input = myContainer.current;

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4', true);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;
      pdf.addImage(
        imgData,
        'PNG',
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio,
      );
      pdf.save(`payslip_${''}.pdf`);
    });
  };



  return (
    <div>
      <Dialog
        fullWidth
        maxWidth='25px'
        // width='595px'
        // height = '842px'
        open={open}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogContent
          ref={myContainer}
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            padding: '100px 10px',
          }}
        >
          <DialogContentText id='alert-dialog-description'>
            {Object.keys(appConfigData).length > 0 ? (
              <Template
                appConfigData={appConfigData}
                templateData={templateData}
              />
            ) : null}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' onClick={handleDownload}>
            <Typography>{'Download'}</Typography>
          </Button>
          <Button variant='contained' onClick={handleClose}>
          {/* autoFocus */}
          <Typography>Close</Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function Template(props) {
  const customFetch = useCustomFetch();
  
  const {appConfigData, templateData,fullData} = props;
  const [data, setData] = useState({});
  const date = `${templateData.date.substring(
    3,
    5,
  )}-${templateData.date.substring(0, 2)}-${templateData.date.substring(6)}`;

  useEffect(() => { (async () => {
   const id = templateData.supplier_id ?? templateData.customer_id;
    const url = templateData.supplier_id === null
      ? API_URLS.GET_CUSTOMER_BY_ID(id)
      : API_URLS.GET_SUPPLIER_BY_ID(id);

    const { data, loading, error } = await customFetch(
      url,
      'GET',
      {},
      (res) => { setData(res); }
    );
  })();
}, []);

  const amountInWords = useMemo(() => ConvertNumberToWords(templateData.amount), []);


  

  return (
    <>
      <table style={styles.tg}>
        <thead>
          <tr>
            <th style={styles.tg_amwm} colSpan='10' rowSpan='2'>
              {`${templateData.type === 'C' ? 'Credit' : 'Debit'} Note`}
              <br />
            </th>
          </tr>
          <tr></tr>
        </thead>
        <tbody>
          <tr>
            <td style={styles.tg_1wig} colSpan='3' rowSpan='7'>
              <span style={{fontWeight: 'bold'}}>
              {appConfigData["company.name"] || "-"}
              </span>
              <br/>
              <span style={{width: '50px', wordWrap: 'break-word'}}>
                {appConfigData['address.fulladdress' || '-']}
              </span>
              <br />
              {(appConfigData['address.city'] || appConfigData['address.pincode']) && (
                <>
                  <span>
                    {appConfigData['address.city'] ? `${appConfigData['address.city']}` : ''}
                    {appConfigData['address.city'] && appConfigData['address.pincode'] ? ' - ' : ''}
                    {appConfigData['address.pincode'] ? appConfigData['address.pincode'] : ''}
                  </span>
                  <br />
                </>
              )}
              <br />
              GSTIN/UIN: {`${appConfigData['company.gstin/uin'] || " "}`}
              <br />
              State Name : {`${appConfigData['address.state'] || " - "}`}, Code : 33
              <br />
              E-Mail : {`${appConfigData['company.email'] || " "}`}
            </td>
            <td style={styles.tg_cly1} colSpan='3' rowSpan='2'>
            {`${templateData.type === 'C' ? 'Credit Note No.' : 'Debit Note No.'}`}
              <br />
              <br />
              {`${templateData.sequence_number}`}
            </td>
            <td style={styles.tg_cly1} colSpan='4' rowSpan='2'>
              Dated
              <br />
              <br />
              {`${moment(date).format('DD MMM YYYY')}`}
            </td>
          </tr>
          <tr></tr>
          <tr>
            <td style={styles.tg_cly1} colSpan='3' rowSpan='2'>Purchase Order No. <br/> {templateData.po_number}</td>
            <td style={styles.tg_cly1} colSpan='4' rowSpan='2'>
              Po Date
              <br/>
              { templateData?.sale_id === null && templateData?.receiving_id === null ? '' :templateData.po_date}
            </td>
          </tr>
          <tr></tr>
          <tr>
            <td style={styles.tg_0lax} colSpan='3' rowSpan='2'>
              Original Invoice No.
              <br/>
              {templateData.invoice_number}
            </td>
            <td style={styles.tg_0lax} colSpan='4' rowSpan='2'>
              Other References
            </td>
          </tr>
          <tr></tr>
          <tr>
            <td style={styles.tg_0lax} colSpan='3' rowSpan='2'>
              Buyer&apos;s Order No.
            </td>
            <td style={styles.tg_0lax} colSpan='4' rowSpan='2'>
              Mode of Payment
              <br />
              <p style={{ fontWeight: 'bold' }}>
                {templateData.payment_type}
              </p>
            </td>
          </tr>
          <tr>
            <td style={styles.tg_0lax_co} colSpan='3' rowSpan='5'>
              Consignee (Ship to)
              <br />
              <p style={{ fontWeight: 'bold' }}>
                {`${data?.company_name || data?.first_name + " " + (data?.last_name ?? '')}`}
              </p>
              <span style={{width: '50px', overflowWrap:'break-word'}}>
                {`${data?.address === null ? '': data?.address}`}
              </span>
              <br />
              <span>{`${data?.city} - ${data?.zip}`}</span>
              <br />
              {/* <br /> */}
              GSTIN/UIN: {`${data?.tax_id || ''}`}
              <br />
              State Name : {`${data?.state || ''}`}, Code : 33
            </td>
          </tr>
          <tr>
            <td style={styles.tg_0lax} colSpan='3' rowSpan='2'>
              Dispatch Doc No.
            </td>
            <td style={styles.tg_0lax} colSpan='4' rowSpan='2'>
              Destination
            </td>
          </tr>
          <tr></tr>
          <tr>
            <td style={styles.tg_0lax} colSpan='3' rowSpan='2'>
              Dispatched through
            </td>
            <td style={styles.tg_0lax} colSpan='4' rowSpan='2'>Terms of Delivery</td>
          </tr>
          <tr></tr>
          <tr>
            {/* <td style={styles.tg_0lax} colSpan='3' rowSpan='5'>
              Buyer (Bill to)
              <br />
              EAGLE ELECTRONICS
              <br />
              No.44, City Link Road, Adambakkam, Chennai - 600 088
              <br />
              <br />
              GSTIN/UIN: 33AOWPS4145N2Z3
              <br />
              State Name : Tamil Nadu, Code : 33
            </td>
            <td style={styles.tg_0lax} colSpan='7' rowSpan='5'>
              Terms of Delivery
            </td> */}
          </tr>
          <tr></tr>
          <tr></tr>
          <tr></tr>
          <tr></tr>
          <tr>
            <td style={styles.tg_0laxSL} >Sl No</td>
            <td style={styles.tg_baqh} colSpan='4'>
              Particulars
            </td>
            <td style={styles.tg_baqh}>HSN/SAC</td>
            <td style={styles.tg_baqh}>Quantity</td>
            <td style={styles.tg_baqh}>Rate</td>
            {/* <td style={styles.tg_baqh}>per</td> */}
            <td style={styles.tg_baqh}>Amount</td>
          </tr>
          <tr>
            <td style={styles.tg_cly1}>1</td>
            <td style={styles.tg_yla0} colSpan='4'>
              {templateData.product_name} &nbsp;
             {templateData.lot_number?.length > 0 ?<p> IMEI/Serial Number: {templateData?.lot_number}</p> : ''}
            </td>
            <td style={styles.tg_0lax}>{templateData.hsn_code}</td>
            <td style={styles.tg_l2oz}>{templateData.quantity}</td>
            <td style={styles.tg_ufyb}></td>
            {/* <td style={styles.tg_8zwo}></td> */}
            <td style={styles.tg_l2oz}>{`${templateData?.amount.toFixed(2)}`}</td>
          </tr>
          <tr>
            <td style={styles.tg_0lax}></td>
            <td style={styles.tg_lqy6} colSpan='4'>
              Total
            </td>
            <td style={styles.tg_baqh}></td>
            <td style={styles.tg_l2oz}></td>
            <td style={styles.tg_l2oz}></td>
            {/* <td style={styles.tg_1wig}></td> */}
            <td style={styles.tg_l2oz}>{`${templateData?.amount.toFixed(2)}`}</td>
          </tr>
          <tr>
            <td style={styles.tg_0lax} colSpan='3' rowSpan='4'>
              Amount Chargeable (in words)
              <br />
              <span style={{width: '50px', overflowWrap:'break-word'}}>
                {amountInWords}
              </span>
            </td>
            <td style={styles.tg_ufyb} colSpan='7'>
              E. &amp; O.E
            </td>
          </tr>
          <tr>
            <td style={styles.tg_amwm} colSpan='7' rowSpan='3'>
              for <span style={{fontWeight: 'bold'}}> {appConfigData['company.name']} </span>
              <br />
              <br />
              <br />
              <br />
              Authorised Signatory
            </td>
          </tr>
          <tr></tr>
          <tr></tr>
          <tr>
            <td style={styles.tg_baqh} colSpan='10'>
              This is a Computer Generated Document
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
