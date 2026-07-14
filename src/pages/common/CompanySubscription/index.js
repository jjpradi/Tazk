import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import React, {useEffect, useState, useRef} from 'react';
import CircleIcon from '@mui/icons-material/Circle';
import {cancelSubscriptionForTrialAction, getSubscriptionDetailsAction, paymentTransactionDetailsAction} from 'redux/actions/subscription_action';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment/moment';
import {useTheme} from '@emotion/react';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import PricingTable from './plans';
import RenewPlan from './renewPlan';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Slide from '@mui/material/Slide';
import { getsessionStorage } from 'pages/common/login/cookies';
import PanToolAltIcon from '@mui/icons-material/PanToolAlt';
import SubscribeNow from './subscribeNow';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CancelIcon from '@mui/icons-material/Cancel';
import PaymentHistoryTable from './paymentHistory';
import { useAuthMethod } from '@crema/utility/AuthHooks';

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

function CompanySubscription(props) {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const storage = getsessionStorage()
  const { logout } = useAuthMethod();
  const isTrial = storage.isTrial
  const {
    SubscriptionReducer: {getCompSubscriptionDetails,paymentHistoryDetails,cancelSubscriptionForTrial},
  } = useSelector((state) => state);
  const [searchParams, setSearchParams] = useSearchParams();
  const paymentType = searchParams.get("status");
  const subscriptionType = searchParams.get("type");

  const [paymentStatus, setPaymentStatus] = useState('');

  console.log("payrollVerification:",cancelSubscriptionForTrial);
  
  const status =
    getCompSubscriptionDetails.isActive === 1 ? 'Active' : 'Expired';

  const [openPlanDetails, setopenPlanDetails] = useState(false);
  const [openRenew, setopenRenew] = useState(false);
  const [openSubscribe, setopenSubscribe] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [type, setType] = useState('');
  const [loginType, setLoginType] = useState('');
const [isYearly, setIsYearly] = useState(false);
const [currentPlanCost, setcurrentPlanCost] = useState('');

  const planDetailsRef = useRef(null);
  const renewPlanRef = useRef(null);
  const location = window.location;
  useEffect(() => {
    const setType = paymentType === 'success' ? "SUCCESS" : paymentType === 'failure' ? "FAILED" : paymentType === 'userCancelled' ? "CANCELLED" : ''
    setPaymentStatus(setType)
    if (paymentType === 'success' && (subscriptionType === "Subscribed" || subscriptionType === "Upgraded" || subscriptionType === "Renewed" || [4].includes(storage.company_type))) {
      setOpenDialog(true);
      setTimeout(() => {
        handleLogout(); 
      }, 8000);
    }
  }, [paymentType]);

  useEffect(() => {
    if (cancelSubscriptionForTrial?.response === "success") {
      setOpenDialog(true);
      setTimeout(() => {
        handleLogout(); 
      }, 8000);
    }
  }, [cancelSubscriptionForTrial]);

  useEffect(() => {
    const data = {
      company_id: props.type === "superAdmin" ? props.data.company_id : storage.company_id
    }
    const data1 = {
      company_name: props.type === "superAdmin" ? props.data.company_name : storage.company_name
    }
    dispatch(getSubscriptionDetailsAction(data));
    dispatch(paymentTransactionDetailsAction(data1));
    
    // const type = getCompSubscriptionDetails.isTrial === 1 ? "TRIAL" : "UPGRADE"
    // setType(type)
    const login = storage.company_type === 8 ? "superAdmin" : "company"
    setLoginType(login)
  }, [dispatch]);

  useEffect(() => {
    const isSpecialCompanyType = [11, 3].includes(storage.company_type) || [11, 3].includes(props.data?.company_type_id);
    const type = getCompSubscriptionDetails.isTrial === 1 ? "TRIAL" : "UPGRADE"
    const check = getCompSubscriptionDetails.isYearly === 1 ? "YEARLY" : getCompSubscriptionDetails.isMonthly === 1 ? "MONTHLY" : "ISTRIAL"
    const checkPrice = getCompSubscriptionDetails.isYearly === 1 && isSpecialCompanyType ? getCompSubscriptionDetails.yearlyPrice : getCompSubscriptionDetails.isMonthly === 1 && isSpecialCompanyType ? getCompSubscriptionDetails.monthlyPrice : getCompSubscriptionDetails.Price
    setIsYearly(check)
    setType(type)
    setcurrentPlanCost(checkPrice)
  }, [getCompSubscriptionDetails])

  const handleLogout = () => {
    logout();
    setTimeout(() => {
      navigate('/signin');
    }, 500); 
  };

  const handleUpgradeClick = () => {
    setopenPlanDetails(true);
    setopenRenew(false);
    setType('UPGRADE')
    setTimeout(() => {
      planDetailsRef.current?.scrollIntoView({behavior: 'smooth'});
    }, 100); 
  };

  const handleRenewClick = () => {
    setopenRenew(true);
    setopenPlanDetails(false);
    setType('RENEW')
    // setTimeout(() => {
    //   renewPlanRef.current?.scrollIntoView({behavior: 'smooth'});
    // }, 100); 
  };

  const handleSubscribeClick = () => {
    if([4].includes(storage.company_type)){
      setopenRenew(true);
    }
    else{
      setopenPlanDetails(true)
    }
    setTimeout(() => {
      renewPlanRef.current?.scrollIntoView({behavior: 'smooth'});
    }, 100); 
  };

  const calculateRemainingDays = (endDate) => {
    const now = moment();
    const end = moment(endDate);
    const daysRemaining = end.diff(now, 'days');
    return daysRemaining >= 0 ? daysRemaining : 0;
  };

  const remainingDays = calculateRemainingDays(
    getCompSubscriptionDetails.sEndDate,
  );

  const handleClose = () =>{
    setPaymentStatus('');
  }
  console.log("locationPath",location);

  // const calculateStartEndDate = () =>{
    const now = moment();

    const start = moment(getCompSubscriptionDetails.sStartDate);
    const end = moment(getCompSubscriptionDetails.sEndDate);
    const overallDays = end.diff(start, 'days');
    const startDateFromNow = now.diff(start, 'days');

    const percentageRemaining = (startDateFromNow / overallDays) * 100;
    // return daysRemaining
  // }
  console.log("overallDays",overallDays,getCompSubscriptionDetails);
  
  const cancelTrialSubscription = () =>{
    dispatch(cancelSubscriptionForTrialAction());

  }

  const setDurationType = isYearly === "MONTHLY" ? 'Month' : 'Year'

  return (
    <>
      <Card sx={{ padding: '20px' }}>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
         <DialogTitle>Redirecting</DialogTitle>
         <DialogContent>
           <DialogContentText>
             You are being redirected to the sign-in page...
           </DialogContentText>
         </DialogContent>
         <DialogActions>
           <Button onClick={handleLogout} color="primary">
             Confirm Logout
           </Button>
         </DialogActions>
       </Dialog>

       <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)}>
         <DialogTitle>Cancel Subscription</DialogTitle>
         <DialogContent>
           <DialogContentText>
             Are you sure you want to cancel the subscription ?
           </DialogContentText>
         </DialogContent>
         <DialogActions>
           <Button onClick={() => setCancelDialog(false)} color="warning">
             No
           </Button>
           <Button onClick={cancelTrialSubscription} color="primary">
             Yes
           </Button>
         </DialogActions>
       </Dialog>
     <Grid container alignItems="center" sx={{ mb: 2 }}>
 {paymentStatus && (
   <Snackbar
     open={open}
     autoHideDuration={6000}
     onClose={handleClose}
     anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
   >
     <Alert
       onClose={handleClose}
       severity={
         paymentStatus === 'SUCCESS' ? 'success' :
         paymentStatus === 'FAILED' ? 'error' :
         'warning'
       }
       variant="filled"
       sx={{ width: '100%' }}
       TransitionComponent={SlideTransition}
     >
       {paymentStatus === 'SUCCESS' ? 'Payment was made Successfully' :
       paymentStatus === 'FAILED' ? 'Payment failed' : 'Payment Cancelled'}
     </Alert>
   </Snackbar>
 )}
 
 <Grid size={6}>
   <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
     {getCompSubscriptionDetails.plan_name}
     <Chip
       label={status === 'Active' ? 'Active' : 'Expired'}
       sx={{
         backgroundColor: status === 'Active' ? 'green' : 'red',
         color: 'white',
         fontSize: '12px',
         fontWeight: 'bold',
         ml: 1
       }}
       variant="outlined"
       size="small"
     />
   </Typography>
 </Grid>

 <Grid size={6}>
   <Grid container justifyContent="flex-end" spacing={1}>
     {getCompSubscriptionDetails.isTrial === 1 && (
       <Grid>
         <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => setCancelDialog(true)}>
           Cancel Subscription
         </Button>
       </Grid>
     )}
     {![4, 8, 12, 16, 20, 24].includes(getCompSubscriptionDetails.plan_type) && ![4].includes(storage.company_type) &&(
       <Grid>
         <Button
           variant="contained"
           startIcon={<UpgradeIcon />}
           onClick={handleUpgradeClick}
         >
           Upgrade Plan
         </Button>
       </Grid>
     )}
   </Grid>
 </Grid>
</Grid>

     <Divider sx={{ my: 2 }} />

     <Grid container spacing={2} justifyContent="space-between" sx={{ mb: 3 }}>
       <Grid>
         <Typography variant="body2" color="textSecondary">Start Date</Typography>
         <Typography variant="body1">{moment(getCompSubscriptionDetails.sStartDate).format('DD MMM, YYYY')}</Typography>
       </Grid>
       <Grid>
         <Typography variant="body2" color="textSecondary">Valid Till</Typography>
         <Typography variant="body1">{moment(getCompSubscriptionDetails.sEndDate).format('DD MMM, YYYY')}</Typography>
       </Grid>
       <Grid>
         <Typography variant="body2" color="textSecondary">Next Billing Amount</Typography>
         <Typography variant="body1">₹{currentPlanCost} / {setDurationType}</Typography>
       </Grid>
       <Grid>
         <Typography variant="body2" color="textSecondary">Renew On</Typography>
         <Typography variant="body1">{moment(getCompSubscriptionDetails.sEndDate).add(1, 'days').format('DD MMM, YYYY')}</Typography>
       </Grid>
     </Grid>

     <Divider sx={{ my: 2 }} />

     <Box padding={'20px'} borderRadius={'4px'}
      sx={{ 
       border: '2px solid #e0e0e0',  
       boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',  
     }}>
     <Grid container justifyContent="space-between" alignItems="center">
       <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Account Plan Usage</Typography>
   
     </Grid>
     <Typography variant="body2" color="textSecondary">Valid Until: {moment(getCompSubscriptionDetails.sEndDate).format('DD MMM, YYYY')}</Typography>
     <Box mt={2}>
       <Typography variant="body2">Remaining Days: {getCompSubscriptionDetails.sRemainingDays} / {overallDays}</Typography>
       <LinearProgress 
       variant="determinate" 
       value={percentageRemaining} 
       sx={{ 
         height: 12, 
         borderRadius: 10, 
         backgroundColor: '#c6cdd1', 
         '& .MuiLinearProgress-bar': {
           backgroundColor: '#FFCA28' 
         }, 
         mt: 1 
       }} 
     />
{getCompSubscriptionDetails.isTrial === 1 ? (
             <Grid
               pt={'35px'}
               pb={'20px'}
               textAlign='center'
               size={{
                 lg: 12,
                 md: 12,
                 sm: 12,
                 xs: 12
               }}>
               <Button variant="contained" color="primary" startIcon={<PanToolAltIcon /> } onClick={handleSubscribeClick}>
                 Subscribe Now
               </Button>
               </Grid>
             ) : (
               <>
           <Grid
             pt={'35px'}
             pb={'20px'}
             textAlign='center'
             size={{
               lg: 12,
               md: 12,
               sm: 12,
               xs: 12
             }}>
             {![1, 5, 9, 13, 17, 21].includes(getCompSubscriptionDetails.plan_type) && (
               <Button variant="contained" startIcon={<CurrencyExchangeIcon />} onClick={handleRenewClick}>
               Renew
             </Button>
             )}
   </Grid>
   </>
             )}
     {/* <Typography variant="caption" color="textSecondary">
       {Math.round(percentageRemaining)}% Remaining
     </Typography> */}
     </Box>
     </Box>
     <Divider sx={{ my: 2 }} />

   </Card>
      <PaymentHistoryTable paymentHistoryDetails={paymentHistoryDetails}/>
      {/* <Card pt={"100px"}>
   <Grid container>
   {"Payment History"}
     </Grid> 

       </Card> */}
      <Dialog open={openPlanDetails} onClose={(event, reason) => {
    if (reason === 'backdropClick') {
      return;
    }
    setopenPlanDetails(false);
  }} maxWidth="lg" fullWidth fullScreen
  style={{ margin: '20px' }}>
        <DialogTitle>Upgrade Plan</DialogTitle>
        <DialogContent>
            <PricingTable
            plan_name={getCompSubscriptionDetails.plan_type}
            type={type}
            login={loginType}
            trial={getCompSubscriptionDetails.isTrial}
            company_id={getCompSubscriptionDetails.company_id}
            company_type_id={getCompSubscriptionDetails.company_type_id}
            handleBack={() =>setopenPlanDetails(false)}
            data={props.data}
            isYearly={isYearly}
            // currentPlanAmount={}
          />
        </DialogContent>
      </Dialog>
      {/* {openPlanDetails && (
        <div ref={planDetailsRef}>
          <PricingTable
            plan_name={getCompSubscriptionDetails.plan_type}
            type={'UPGRADE'}
            // currentPlanAmount={}
          />
        </div>
      )} */}
      <Dialog open={openRenew} onClose={(event, reason) => {
        if (reason === 'backdropClick') {
          return;
        }
        setopenRenew(false);
      }} maxWidth="lg" fullWidth>
            <DialogTitle>Renew Plan</DialogTitle>
            <DialogContent>
              {getCompSubscriptionDetails && (
                <RenewPlan plan_name={getCompSubscriptionDetails.plan_type} type={type}
                    monthlyOrYearly={isYearly}
                    data={props.data} loginType={loginType} planDetails={getCompSubscriptionDetails} remainingDays={remainingDays} onClose={() => setopenRenew(false) }/>
               )}
            </DialogContent>
          </Dialog>
      {/* 
            {openRenew && (
              <div ref={renewPlanRef}>
                <RenewPlan
                  plan_name={getCompSubscriptionDetails.plan_type}
                  planDetails={getCompSubscriptionDetails}
                  type={'RENEW'}
                />
              </div>
            )} */}
      {openSubscribe && (
              <div ref={renewPlanRef}>
                <SubscribeNow
                  plan_name={getCompSubscriptionDetails.plan_type}
                  planDetails={getCompSubscriptionDetails}
                  type={'SUBSCRIBE'}
                />
              </div>
            )}
    </>
  );
}

export default CompanySubscription;
