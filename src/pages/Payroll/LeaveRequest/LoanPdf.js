import React, {useContext, useEffect, useRef} from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import {ConvertNumberToWords} from '../../../utils/getTimeFormat';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {useDispatch, useSelector} from 'react-redux';
import apiCalls from 'utils/apiCalls';
import Context from '../../../context/CreateNewButtonContext';
import {getAppConfigDataAction} from 'redux/actions/app_config_actions';
import moment from 'moment/moment';
import {baseURL,titleURL}  from '../../../http-common';
import { getCompanyLogo, getSignature } from 'redux/actions/company_actions';
import { ClaimTemp } from './ClaimTemp';
import { LoanTemp } from './LoanTemp';

export default function LoanPdf(props) {
  const dispatch = useDispatch();
  const myContainer = useRef(null);
  const slipRef = useRef(null)

  const {open, handleClose, loanDownloadData } = props;

//   console.log("sdfs",loanDownloadData)
  const {setLoaderStatusHandler, setModalTypeHandler} = useContext(Context);

  const { appConfigReducer: app_config_data, CompanyReducers: { signature ,company_logo,}, } = useSelector((s) => s);

  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
    //   dispatch(getAppConfigDataAction()),
      dispatch(getCompanyLogo()),
    //   dispatch(getSignature()),
    );
  }, []);


  const companyLogo = company_logo[0]?.image
  loanDownloadData.companyLogo = companyLogo;





  const handleDownload = () => {
    const input = myContainer.current;
  
    html2canvas(input, { useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
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
      pdf.save(`Loan_${loanDownloadData.full_name}.pdf`);
    }).catch(error => {
      console.error("Error generating the PDF: ", error);
    });
  };

  useEffect(() => {
    // console.log("slipRef.current",slipRef.current)
    if(slipRef.current){
      slipRef.current.innerHTML = LoanTemp(loanDownloadData)
    }
    return () => {
      if(slipRef.current){
        slipRef.current.innerHTML = '<div></div>'
      }
    }
  },[slipRef.current])

  return (
    <Dialog  fullWidth  maxWidth="md"  open={open} onClose={() => handleClose()}>
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
            <div key={new Date().getTime()} ref={slipRef}> </div>
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

LoanPdf.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  loanDownloadData: PropTypes.object,
};
