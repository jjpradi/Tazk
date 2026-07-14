import React, {useContext, useEffect, useRef, useState} from 'react';
import { Form16Details } from './form16Temp';
import MaterialTable from 'utils/SafeMaterialTable';
import { maxBodyHeight, maxHeight, pageSize, headerStyle, cellStyle, font14_500 } from 'utils/pageSize';
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
import { getCompanybase64Logo, getCompanyLogo, getSignature } from 'redux/actions/company_actions';
import axios from 'axios';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import { useCustomFetch } from 'utils/useCustomFetch';

export default function Form16Dialog(props) {
  const dispatch = useDispatch();
  const myContainer = useRef(null);
  const payslipRef = useRef(null)
  const CustomFetch = useCustomFetch()

  const {open, handleClose, paySlipData , company_logo,rowdata} = props;
  
  const {setLoaderStatusHandler, setModalTypeHandler} = useContext(Context);
const[base64logo,setbase64logo]=useState("")
  const { appConfigReducer: app_config_data, CompanyReducers: { signature }, } = useSelector((s) => s);


  const [updated, setUpdated] = useState(false);


   const currentDate = new Date();

  const yyyy = currentDate.getFullYear();
  let mm = currentDate.getMonth() + 1; // Months start at 0!
  let dd = currentDate.getDate();

  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;

  const formattedToday = dd + '/' + mm + '/' + yyyy;

  const handleDownload = () => {
    const input = myContainer.current;

    html2canvas(input).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size (210mm x 297mm)
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const padding = 10; // Padding around the content (in mm)
        const contentWidth = pdfWidth - padding * 2; // Adjusted width for padding
        const contentHeight = pdfHeight - padding * 4.2; // Adjusted height for padding

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        const ratio = contentWidth / imgWidth; // Scale the image to fit content width
        const scaledHeight = imgHeight * ratio;

        let yOffset = 0; // Y-offset to track the current position on the canvas

        // Split the content into pages
        while (yOffset < scaledHeight) {
            const sectionHeight = Math.min(scaledHeight - yOffset, contentHeight); // Content height for the current page
            const sectionCanvas = document.createElement('canvas');
            sectionCanvas.width = canvas.width;
            sectionCanvas.height = sectionHeight / ratio; // Scale back to original resolution

            const sectionCtx = sectionCanvas.getContext('2d');
            sectionCtx.drawImage(
                canvas,
                0, 
                yOffset / ratio, // Source Y on the original canvas
                canvas.width,
                sectionCanvas.height,
                0,
                0,
                sectionCanvas.width,
                sectionCanvas.height
            );

            const sectionImgData = sectionCanvas.toDataURL('image/png');

            if (yOffset > 0) pdf.addPage();
            pdf.addImage(
                sectionImgData,
                'PNG',
                padding, // X-coordinate with padding
                padding, // Y-coordinate with padding
                contentWidth, // Adjusted width for padding
                sectionHeight // Height scaled to fit the page
            );

            yOffset += sectionHeight; // Move to the next section
        }

        pdf.save(`TDS_${currentDate}.pdf`);
    }).catch((error) => {
        console.error("Error generating the PDF: ", error);
    });
};
const handle_verify = async()=>{
  const { data: resData} = await CustomFetch(`/payrollservice/api//incomeTax/updateStatus`,'POST',rowdata);
  handleClose()
}

  
    


  useEffect(() => {
    // console.log("slipRef.current",slipRef.current)
    setTimeout(() => {
    if (payslipRef.current) {
      payslipRef.current.innerHTML = Form16Details(rowdata)
    }
  },100)
    // return () => {
    //   if (payslipRef.current) {
    //     payslipRef.current.innerHTML = '<div></div>'
       
    //   }
    // }
  }, [payslipRef.current])

  return (
    <Dialog fullScreen  open={open} onClose={() => handleClose()}>
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
        {props.form16Approve && (
          rowdata?.status == "Approved" ?
            <Button disabled variant='contained' style={{ backgroundColor: 'green' }}>
              <Typography color='white'>Approved</Typography>
            </Button>
            :
            <Button variant='contained' onClick={handle_verify}>
              <Typography>Approve and Verify</Typography>
            </Button>
        )}

        <Button onClick={() =>handleClose()}>
          <Typography>{'Back'}</Typography>
        </Button>

        {props.form16Export && (
          <Button onClick={handleDownload}>
            <Typography>Download</Typography>
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

Form16Dialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  paySlipData: PropTypes.object,
};

