import React, {useEffect, useState} from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {useTheme} from '@emotion/react';
import {useDispatch, useSelector} from 'react-redux';
import {getPlanRenewalDetailsAction, orderPlacedDetailsAction} from 'redux/actions/subscription_action';
import moment from 'moment';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { getsessionStorage } from 'pages/common/login/cookies';
import { initiatePaymentEaseBuzzPaymentAction } from 'redux/actions/easeBuzzPayment_actions';
import { useNavigate } from 'react-router-dom';
import { PaymentIcon } from 'pages/routesIcons';
import TazkLogo from '../../../../src/assets/user/Tazk-logo-horizontal.svg';
import ManualPayment from './manualPayment';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';

const MonthlyYearlySwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb': {
        backgroundColor: '#001e3c',
        '&::before': {
          content: '"Y"', // "Y" for Yearly
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 'bold',
          width: '100%', // Ensures the text takes up full space
          height: '100%',
        },
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#001e3c',
    width: 32,
    height: 32,
    '&::before': {
      content: '"M"', // "M" for Monthly
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#fff',
      fontSize: '14px',
      fontWeight: 'bold',
      width: '100%', // Ensures the text takes up full space
          height: '100%',
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#aab4be',
    borderRadius: 20 / 2,
  },
}));

function RenewPlan(props) {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  console.log('Subscription_typePlan', props);
  const storage = getsessionStorage()
  const dispatch = useDispatch();
  const {
    SubscriptionReducer: {getPlanRenewalDetails,getCompSubscriptionDetails},
    EaseBuzzPaymentReducer: {initiatePaymentUrl}
  } = useSelector((state) => state);

  const [planCost, setPlanCost] = useState('');
  const [openManualPayment, setopenManualPayment] = useState(false);
  const [monthlyYearlyType, setmonthlyYearlyType] = useState('');
  const [planCostWithGST, setplanCostWithGST] = useState('');
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    const payload = {
      Subscription_type: props.plan_name,
    };
    dispatch(getPlanRenewalDetailsAction(payload));
  }, []);
// console.log("initiatePaymentUrl",initiatePaymentUrl);

  useEffect(() => {
    if (initiatePaymentUrl?.payment_url) {
      window.open(initiatePaymentUrl.payment_url, '_self'); 
    }
  }, [initiatePaymentUrl]);
  
  useEffect(() => {
    // console.log(props.type, 'type')
    const isSpecialCompanyType = [11, 3].includes(storage.company_type) || [11, 3].includes(props.data?.company_type_id);

    if(props.type === 'RENEW' && isSpecialCompanyType){
      const setPrice = props.monthlyOrYearly === "MONTHLY" ? getPlanRenewalDetails.monthly_price : getPlanRenewalDetails.yearly_price;
      setplanCostWithGST((setPrice * 1.18).toFixed(2))
      setPlanCost(setPrice)
      setmonthlyYearlyType(props.monthlyOrYearly)
    }else if(props.type === 'RENEW'){
      setPlanCost(getPlanRenewalDetails.Price)
      setplanCostWithGST((getPlanRenewalDetails.Price * 1.18).toFixed(2))
    }else if(props.type === 'UPGRADE'){
      setPlanCost(props.actualUpgradeCost?.toFixed(2))
      setplanCostWithGST((props.actualUpgradeCost * 1.18).toFixed(2))
      setmonthlyYearlyType(props.monthlyOrYearly)
    }else if(props.type === 'TRIAL' && isSpecialCompanyType){
      // const setType = 
      const setPrice = props.monthlyOrYearly === "MONTHLY" ? getPlanRenewalDetails.monthly_price : getPlanRenewalDetails.yearly_price;
      // console.log("setPrice",setPrice);
      setmonthlyYearlyType(props.monthlyOrYearly)
      setPlanCost(setPrice)
      setplanCostWithGST((setPrice * 1.18).toFixed(2))

    }else{
      setmonthlyYearlyType(props.monthlyOrYearly)
      setPlanCost(props.actualUpgradeCost)
      setplanCostWithGST((props.actualUpgradeCost * 1.18).toFixed(2))

    }
  }, [props.type, getPlanRenewalDetails, props.actualUpgradeCost]);
  // console.log("props.type",props.type,planCost);
  
// console.log("props.monthlyYearlyType",monthlyYearlyType);

  const renewingPlanExpiryDate =
    props.type === 'RENEW'
      ? props.planDetails.sEndDate
      : moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  console.log('renewingPlanExpiryDate', renewingPlanExpiryDate);
  // navigate(initiatePaymentUrl.payment_url)

  const datePart = renewingPlanExpiryDate.split(' ')[0];

  const expiryDate = new Date(datePart);

  const daysToAdd = monthlyYearlyType === 'MONTHLY' ? 30 : 365;

  expiryDate.setDate(expiryDate.getDate() + daysToAdd);

  const newExpiryDate = expiryDate.toISOString().split('T')[0] + ' 12:00:00';
  const options = {year: 'numeric', month: 'short', day: 'numeric'};
  const displayEndDate = expiryDate.toLocaleDateString('en-US', options);
  // const excistingPlanEndDate = new Date(props.planDetails.sEndDate).toLocaleDateString('en-US', options);

  // console.log('newExpiryDate', displayEndDate, newExpiryDate);

  console.log('getPlanRenewalDetailsAction', getPlanRenewalDetails);

  const generateTransactionId = () => {
    const timestamp = Date.now(); 
    const randomNum = Math.floor(Math.random() * 10000); 
    return `TXN${timestamp}${randomNum}`; 
  };
  
  const transactionId = generateTransactionId();
  const handlePayments = () => {
    if(props.loginType === "superAdmin"){
    //  setTrans_id()
     handleManualPayment(transactionId)
   }else{
     initiatePayment()
   }
 }

  const initiatePayment = ()=>{
  
  let base_url = 'http://localhost:3000'
// console.log(transactionId,"transactionId");

const productInfo = getPlanRenewalDetails.Subscription_Type === "Essential +" ? "Essential Plus" : getPlanRenewalDetails.Subscription_Type === "Premium +" ? "Premium Plus" : getPlanRenewalDetails.Subscription_Type

    const payload = {
      "txnid": transactionId,
      "amount": planCostWithGST,
      "email": storage.company_email,
      "phone": storage.company_phone_number,
      "name": storage.company_name,
      "udf1": storage.company_type,
      "udf2": monthlyYearlyType,
      "udf3": "",
      "udf4": "",
      "udf5": "",
      "productinfo": productInfo,
      "udf6": "",
      "udf7": "",
      "udf8": "",
      "udf9": "",
      "udf10": "",
      "surl": "http://localhost:4000/accountsservice/api/easeBuzzPayment/transaction_details", //this two url will be handled by backend
      "furl": "http://localhost:4000/accountsservice/api/easeBuzzPayment/transaction_details"
  }
    dispatch(initiatePaymentEaseBuzzPaymentAction(payload))
    console.log("props :",props.id,props.company_id);
    

    const orderPlacedPayload = {
      "txnid": transactionId,
      "amount": planCost,
      "plan_type": getPlanRenewalDetails.id,
      "company_id": storage.company_id
    }
     dispatch(orderPlacedDetailsAction(orderPlacedPayload))
  }

  const handleManualPayment = () => {
    // console.log("propss",props);
    setopenManualPayment(true)
  }

  const handleManualPaymentClose = () => {
    // console.log("propss",props);
    setopenManualPayment(false)
  }

  const handleToggleSubscription = () => {
    setIsYearly((prev) => {
        const newIsYearly = !prev;
// console.log("newIsYearly",newIsYearly);

        const newPrice = newIsYearly 
            ? getPlanRenewalDetails.yearly_price 
            : getPlanRenewalDetails.monthly_price;

        setplanCostWithGST((newPrice * 1.18).toFixed(2));
        setPlanCost(newPrice);

        return newIsYearly;
    });

    const setType = monthlyYearlyType === "MONTHLY" ? "YEARLY" : "MONTHLY"
    setmonthlyYearlyType(setType);
};


  const isSpecialCompanyType = [11, 3].includes(storage.company_type) || [11, 3].includes(props.data?.company_type_id);
  

  return (
    <>
      <Box display="flex" justifyContent="center" alignItems="center" bgcolor="#f7f7ff" >
      <Tooltip title="Close">
        <IconButton onClick={props.onClose} sx={{ position: 'absolute', top: 8, right: 8, color: 'red' }}>
          <HighlightOffIcon fontSize="large" />
        </IconButton>
      </Tooltip>
        <Card sx={{padding: 4, borderRadius: 3, width: '100%', maxWidth: 1200 }}>
          {/* Header with title, dropdown and close button */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
            {props.type === 'RENEW'
              ? `You are renewing plan.`
              : props.type === 'UPGRADE' ? `You are upgrading plan.` : `You are subscribing plan.`}
              </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="body2" sx={{ marginRight: 1 }}>{monthlyYearlyType === "MONTHLY" ? "Monthly" : "Yearly"}</Typography>
              
            </Box>
          </Box>
          {isSpecialCompanyType && props.monthlyOrYearly === "MONTHLY" && props.type === 'RENEW' &&
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <Typography variant="body1" sx={{ marginRight: '10px' }}>
      Monthly
    </Typography>
    <MonthlyYearlySwitch sx={{ m: 1 }}     checked={isYearly}
      onChange={() => handleToggleSubscription(monthlyYearlyType)} />
    <Typography variant="body1" sx={{ marginLeft: '10px' }}>
      Yearly
    </Typography>
  </Box>
  }
          {/* Payment Plan Details */}
          <Card
            sx={{
              backgroundColor: '#f1f1f1',
              borderRadius: 3,
              padding: 2,
              marginTop: 3,
              boxShadow: 'none',
            }}
          >
            <Grid container spacing={2}>
            <Grid display="flex" justifyContent="center" alignItems="center" size={3}>
    <img 
      src={TazkLogo} 
      alt="Tazk Logo" 
      style={{ 
        width: '100%', 
        maxWidth: 150, 
        maxHeight: 150, 
        padding: '15px' 
      }} 
    />
  </Grid>
  <Grid
    display="flex"
    justifyContent="center"
    alignItems="center"
    size={{
      lg: 6,
      md: 6,
      sm: 6,
      xs: 6
    }}>
  <Box display="flex" flexDirection="column" alignItems="center">
    <Chip 
      size="medium" 
      variant="contained" 
      label={getPlanRenewalDetails.Subscription_Type} 
      sx={{
        fontSize: '16px',
        padding: '10px 20px',  
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
        borderRadius: '13px' ,
        color: 'white',
        backgroundColor: primaryColor,
        borderColor: getPlanRenewalDetails.Subscription_Type === "Essential" ? 'blue' : getPlanRenewalDetails.Subscription_Type === "Essential +" ? 'green' : 'orange',
      }}
    />
    
    <button 
      style={{ 
        marginTop: '8px', 
        background: 'none', 
        border: 'none', 
        color: primaryColor,
        fontSize: '10px', 
        cursor: 'pointer', 
        borderBottom: '1px solid black',
        paddingBottom: '1px' 
      }}
      onClick={props.onClose}
    >
      Change Plan
    </button>
  </Box>
  </Grid>
              <Grid textAlign="right" size={3}>
                <Typography variant="h6">₹ {[11, 3, 4].includes(storage.company_type) || [11, 3].includes(props.data?.company_type_id) ? planCost : getPlanRenewalDetails.Price}</Typography>
              {/* </Grid> */}

              {/* <Grid size={12} 
    display="flex" 
    justifyContent="flex-end" 
    alignItems="center"
    pt={'20px'}
    > */}

                <Typography variant="caption" sx={{ whiteSpace: {
        xs: 'normal', 
        md: 'nowrap', 
      }, marginButton: 0  }}>The plan is valid till {displayEndDate}</Typography>
              </Grid>
            </Grid>
          </Card>

          <Box mt={3}>
            <Typography variant="subtitle2">Plan Details</Typography>
            <Box mt={2}>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="body2">Plan Type:</Typography>
                  <Typography variant="body1">{getPlanRenewalDetails.Subscription_Type}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2">Next Renewing Date:</Typography>
                  <Typography variant="body1">{displayEndDate}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2">User Creation:</Typography>
                  <Typography variant="body1">You can create upto {getPlanRenewalDetails.Users} users</Typography>
                </Grid>
                  {storage.company_type !== 10 &&
                    <Grid size={6}>
                      <Typography variant="body2">Location Creation:</Typography>
                      <Typography variant="body1">You can create upto {getPlanRenewalDetails.locations} locations</Typography>
                    </Grid>
                  }
                <Grid size={6}>
                  <Typography variant="body2">Plan Duration:</Typography>
  {props.type === 'UPGRADE' ? 
                  <Typography variant="body1">1 year from today</Typography> : monthlyYearlyType === "MONTHLY" ? <Typography variant="body1">1 month from {new Date(getCompSubscriptionDetails?.sEndDate).toLocaleDateString('en-US', options)}</Typography> : <Typography variant="body1">1 year from {new Date(getCompSubscriptionDetails?.sEndDate).toLocaleDateString('en-US', options)}</Typography>
                }
                </Grid>
                <Grid size={6}>
                  {/* <Typography variant="body2">Reference Number:</Typography>
                  <Typography variant="body1">4829475935</Typography> */}
                </Grid>
              </Grid>
            </Box>
          </Box>

          <Divider sx={{ marginY: 3 }} />

  <Grid container spacing={2} justifyContent="space-between">
    <Grid size={6}>
      <Typography variant="h6">Plan Cost :</Typography>
    </Grid>
    <Grid sx={{ textAlign: 'right' }} size={6}>
      <Typography variant="h6">₹ {planCost}</Typography>
    </Grid>

    <Grid sx={{ marginTop: '5px' }} size={6}>
      <Typography variant="h6">Taxes :</Typography>
    </Grid>

    <Grid sx={{ textAlign: 'right', marginTop: '5px' }} size={6}>
      <Typography variant="body2" color="text.secondary">
        GST (18%): ₹ {(planCost * 0.18).toFixed(2)}
      </Typography>
    </Grid>

    <Grid sx={{ marginTop: '10px' }} size={6}>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Total :</Typography>
    </Grid>

    <Grid sx={{ textAlign: 'right', marginTop: '5px' }} size={6}>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        ₹ {planCostWithGST}
      </Typography>
    </Grid>
  </Grid>


          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 3, backgroundColor: primaryColor }}
            onClick={handlePayments}
          >
            Purchase Plan
          </Button>

          <Dialog
          open={openManualPayment}
          // onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{'Manual Payment Details'}</DialogTitle>
          <DialogContent>
            {/* {planData && ( */}
              <ManualPayment
              onClose={props.onClose}
              type={props.type}
              data={props.data}
              handleBack={props.handleBack}
              plan_type_id={props.plan_name}
              transaction_Id={transactionId}
              monthlyYearlyType={monthlyYearlyType}
              />
            {/* )} */}
          </DialogContent>
        </Dialog>
        </Card>
      </Box>
    </>
  );
}

export default RenewPlan;
