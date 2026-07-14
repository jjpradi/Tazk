import React, {useContext, useEffect, useRef, useState} from 'react';
import {PaySlipTemp} from './paySlipTemp';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import {ConvertNumberToWords} from '../../utils/getTimeFormat';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {useDispatch, useSelector} from 'react-redux';
import apiCalls from 'utils/apiCalls';
import Context from '../../context/CreateNewButtonContext';
import {getAppConfigDataAction} from 'redux/actions/app_config_actions';
import moment from 'moment/moment';
import {baseURL,titleURL}  from '../../http-common';
import { getCompanybase64Logo, getCompanyLogo, getSignature } from 'redux/actions/company_actions';
import axios from 'axios';
import { useCustomFetch } from 'utils/useCustomFetch';
import API_URLS from '../../utils/customFetchApiUrls';

export default function PaySlip(props) {
  const dispatch = useDispatch();
  const myContainer = useRef(null);
  const payslipRef = useRef(null)
 const customFetch = useCustomFetch();
  const {open, handleClose, paySlipData , company_logo} = props;
  const [ ytdData , setYtd] =useState([]);
  const {setLoaderStatusHandler, setModalTypeHandler} = useContext(Context);
const[base64logo,setbase64logo]=useState("")
  const { appConfigReducer: app_config_data, CompanyReducers: { signature }, } = useSelector((s) => s);


  const ytd = async () => {
    try {
      let data={
            year: paySlipData?.salary_year,
            month: paySlipData?.salary_month,
            ytd: props?.ytd
      }
      const { data: resData, loading, error } = await customFetch(
        API_URLS.GET_YTD_SALARY,
        'POST',
        data
      );
      if (error) {
        console.error('Error fetching YTD data:', error);
      } else {
        setYtd(resData)
      }
    } catch (err) {
      console.error('Error in YTD function:', err);
    }
  };

  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      // dispatch(getAppConfigDataAction()),
      dispatch(getCompanyLogo()),
      dispatch(getCompanybase64Logo((val)=>{
if(val?.base64){
  setbase64logo(val?.base64)
}
      })),
      dispatch(getSignature()),
    );
    ytd()
  }, []);

  const companyLogo = company_logo[0]?.image
  console.log(companyLogo,"hjhj")
  const authSignature = signature[0]?.image

  const companyAddress = app_config_data?.app_config_data.find(
    (f) => f.key_name == 'address.fulladdress',
  );  
  const companyCity = app_config_data?.app_config_data.find(
    (f) => f.key_name == 'address.city',
  ); 
  const companyState = app_config_data?.app_config_data.find(
    (f) => f.key_name == 'address.state',
  ); 
  const companyPincode = app_config_data?.app_config_data.find(
    (f) => f.key_name == 'address.pincode',
  ); 
  const companyCountry = app_config_data?.app_config_data.find(
    (f) => f.key_name == 'address.country',
  ); 
  const currentDate = new Date();

  const yyyy = currentDate.getFullYear();
  let mm = currentDate.getMonth() + 1; // Months start at 0!
  let dd = currentDate.getDate();

  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;

  const formattedToday = dd + '/' + mm + '/' + yyyy;

  paySlipData.AmountInWords = ConvertNumberToWords(paySlipData.total_earnings - (paySlipData.total_deductions));
  paySlipData.date = formattedToday;
  paySlipData.companyLogo =base64logo ?base64logo: companyLogo;
  paySlipData.authSignature = authSignature;
  paySlipData.companyAddress = companyAddress?.value;
  paySlipData.companyCity = companyCity?.value;
  paySlipData.companyState = companyState?.value;
  paySlipData.companyPincode = companyPincode?.value;
  paySlipData.companyCountry = companyCountry?.value;

  // paySlipData.TotalEarnings = paySlipData.basic + paySlipData.hra + paySlipData.da + paySlipData.conveyance + paySlipData.ot_amount;

  const pt = Number(paySlipData.pt || 0);
  const lop = Number(paySlipData.lop || 0);
  const esic = Number(paySlipData.esic || 0);
  const tds = Number(paySlipData.tds || 0);
  const pf = Number(paySlipData.pf || 0);

  paySlipData.leave = paySlipData.leave_deduction;
  paySlipData.imgSize = '100px';

    paySlipData.monthIndex = paySlipData.month - 1;
    paySlipData.imgSize = '80px'
    paySlipData.TodayDate = moment(new Date()).format('DD-MM-YYYY')
    paySlipData.monthName = new Date(paySlipData.year, paySlipData.month - 1, 1).toLocaleString('default', { month: 'long' });
   
const handleDownload = () => {
  const input = myContainer.current;

  html2canvas(input).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('portrait', 'pt', 'a4');
    const pdfWidth = 595.28; // A4 width in points
    const pdfHeight = 841.89; // A4 height in points

    // Static image dimensions
    const imgWidth = 600; // Example static width
    const imgHeight = 800; // Example static height

    // Calculate centered position for the image in the PDF
    const imgX = (pdfWidth - imgWidth) / 2;
    const imgY = (pdfHeight - imgHeight) / 2;

    pdf.addImage(
      imgData,
      'PNG',
      imgX,
      imgY,
      imgWidth,
      imgHeight
    );

    pdf.save(`payslip_${paySlipData.first_name}.pdf`);
  }).catch((error) => {
    console.error("Error generating the PDF: ", error);
  });
};

    
    
    

  useEffect(() => {
    // console.log("payslipRef.current",payslipRef.current)
    if(payslipRef.current){
      payslipRef.current.innerHTML = PaySlipTemp(paySlipData,ytdData)
      
    }
    return () => {
      if(payslipRef.current){
        payslipRef.current.innerHTML = '<div></div>'
      }
    }
  },[payslipRef.current])

  return (
    <Dialog fullScreen open={open} onClose={() => handleClose()}>
      <DialogContent
        ref={myContainer}
        sx={{
          display: 'block',
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '100%',
          overflow: 'visible',
        }}
      >
        <Grid
          container
          spacing={5}
          display='flex'
          flexDirection='row'
          alignItems='center'
          p='20px'
        >
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            {/* <div key={new Date().getTime()} dangerouslySetInnerHTML={{__html: PaySlipTemp(paySlipData)}} /> */}
            <div key={new Date().getTime()} ref={payslipRef}> </div>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{mr: '40px'}}>
        <Button onClick={() => handleClose()}>
          <Typography>{'Back'}</Typography>
        </Button>
        {/* 
        <ReactToPdf targetRef={myContainer}>
          {({toPdf}) => <button onClick={toPdf}>Generate PDF</button>}
        </ReactToPdf> */}

        <Button onClick={() => handleDownload()}>
          <Typography>{'Download'}</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
}

PaySlip.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  paySlipData: PropTypes.object,
};
