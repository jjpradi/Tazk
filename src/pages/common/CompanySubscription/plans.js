import React, { useEffect, useState } from 'react';
import { Card, Grid, Typography, Button, Box, Divider, Dialog, DialogTitle, DialogContent, Tooltip, IconButton, Chip, FormControlLabel, DialogActions } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '@emotion/react';
import { getPlanDetailsAction } from 'redux/actions/subscription_action';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import RenewPlan from './renewPlan';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getsessionStorage } from 'pages/common/login/cookies';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import EmailIcon from '@mui/icons-material/Email';

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
          content: '"Y"', 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 'bold',
          width: '100%',
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
      content: '"M"', 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#fff',
      fontSize: '14px',
      fontWeight: 'bold',
      width: '100%', 
          height: '100%',
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#aab4be',
    borderRadius: 20 / 2,
  },
}));






const PricingTable = (plan_name) => {

    const theme = useTheme();
    const primaryColor = theme.palette.primary.main;
  const dispatch = useDispatch();
  const storage = getsessionStorage()
  const {
    SubscriptionReducer: { getPlanDetails }
} = useSelector((state) => state);

// console.log("plan_name",plan_name);
const [openBillBox, setopenBillBox] = useState(false);
const [openContactUsDialog, setopenContactUsDialog] = useState(false);
const [planData, setPlanData] = useState(false);
const [features, setFeatures] = useState([]);
const [type, setType] = useState('');
const [isYearly, setIsYearly] = useState(false);
const [renewingCost, setrenewingCost] = useState('');
// console.log("plan_name.type:",plan_name.type);

  useEffect(() => {
  const payload={
    Subscription_type: plan_name.plan_name,
    isTrial: plan_name.login === "superAdmin" ? plan_name.trial : storage.isTrial,
    company_id: plan_name.login === "superAdmin" ? plan_name.company_id : storage.company_id,
    company_type: plan_name.login === "superAdmin" ? plan_name.data.company_type_id : storage.company_type
  }
    dispatch(getPlanDetailsAction(payload))
    let type = plan_name.login === "superAdmin" ? "superAdmin" : "UPGRADE"
    setType(type)
  }, [])

  useEffect(() => {
    if (getPlanDetails && getPlanDetails.length > 0) {
      const availableFeatures = Object.keys(getPlanDetails[0].features).filter(
        (key) => ![
          "id", "Subscription_Type", "Price", "Original_Price", "Offer", 
          "Free_Trail", "createdAt", "updatedAt", "createdBy", "updatedBy","discountPercentageYearly","monthly_price","yearly_price","yearly_price_initial"
        ].includes(key)
      );
      setFeatures(availableFeatures);
    }
  }, [getPlanDetails]);

  const handleRenewClick = (planData) => {
    
    if(![8,12,16].includes(planData.features.id) && !isSpecialCompanyType){
      // const setRenewingCost =
    setrenewingCost(planData.Upgrade_Cost) 
    setopenBillBox(true)
    setPlanData(planData)
    setIsYearly("YEARLY");
  }else if(isSpecialCompanyType && plan_name.isYearly === "YEARLY"){
    const setRenewingCost = planData.Upgrade_Cost_yearly
    setrenewingCost(setRenewingCost) 
    setopenBillBox(true)
    setPlanData(planData)
    setIsYearly("YEARLY");
  }
  else{
    const setRenewingCost = isYearly === false ? planData.Upgrade_Cost_monthly : planData.Upgrade_Cost_yearly
    setrenewingCost(setRenewingCost) 
    setopenBillBox(true)
    setPlanData(planData)
  }

  };

  const handleCloseDialog = () => {
    setopenBillBox(false);
    setPlanData(null);
};

const handleToggleSubscription = () => {
  setIsYearly(!isYearly);
};

const handleContactUsClick = () => {
  setopenContactUsDialog(!openContactUsDialog)
};

const isSpecialCompanyType = [11, 3].includes(storage.company_type) || [11, 3].includes(plan_name.data?.company_type_id);
console.log("isYearly",isYearly,plan_name.isYearly);


return (
  <>
    <Card>
      <Tooltip title="Go back" placement="top">
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={plan_name.handleBack}
          sx={{ position: 'absolute', top: 8, right: 8, color: 'white',
            backgroundColor: primaryColor, 
            '&:hover': {
              backgroundColor: 'black',
              opacity: 0.9 
            } }}
          aria-label="Go back"
        >
          Back
        </Button>
      </Tooltip>

      <Box sx={{ padding: '20px' }} >
        <Typography variant="h3" textAlign="center" gutterBottom>
          Compare Plans
        </Typography>
        <Typography
    variant="h5"
    sx={{
      textAlign: 'right',
      fontWeight: 'bold',
    }}
    gutterBottom
  >
    *Exclusive of taxes
  </Typography>
        <Divider sx={{ marginY: '20px' }} />
       
{isSpecialCompanyType && (plan_name.isYearly === "MONTHLY" || plan_name.isYearly === "ISTRIAL") &&
<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
  <Typography variant="body1" sx={{ marginRight: '10px' }}>
    Monthly
  </Typography>
  <MonthlyYearlySwitch sx={{ m: 1 }}     checked={isYearly}
    onChange={handleToggleSubscription} />
  <Typography variant="body1" sx={{ marginLeft: '10px' }}>
    Yearly
  </Typography>
</Box>
}
        <Grid container spacing={2} alignItems="center">
          <Grid
            size={{
              xs: 12,
              sm: 3
            }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Features
            </Typography>
          </Grid>

          {getPlanDetails.map((plan, index) => (
            <Grid
              key={plan.features.id}
              size={{
                xs: 12,
                sm: 3,
                md: 2
              }}>
              <Card
                sx={{
                  padding: '16px',
                  textAlign: 'center',
                  borderColor:
                    plan.features.Subscription_Type === 'Comprehensive'
                      ? '#FFA500'
                      : 'inherit',
                  height: '180px', 
                  display:'flex',
                  justifyContent:'space-between',
                  alignItems : 'center',
                  flexDirection:'column',
                  
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {plan.features.Subscription_Type}
                </Typography>
                { isYearly === false && isSpecialCompanyType && (plan_name.isYearly === "MONTHLY" || plan_name.isYearly === "ISTRIAL") ? 
                 <Box sx={{ marginBottom: '10px' }}>
                 <Typography
                   variant="h6"
                   sx={{ fontWeight: 'bold' }}
                   >
                   ₹ {parseFloat(plan.Upgrade_Cost_monthly).toLocaleString()} / month
                 </Typography>
                 {/* </Box> */}
               </Box> : 
                
                // }
//  {
  ![8,12,16].includes(plan.features.id) && !isSpecialCompanyType ?
                <Box sx={{ marginBottom: '10px' }}>
        <Typography
          variant="body2"
          sx={{ textDecoration: 'line-through', color: 'grey' }}
        >
          ₹{plan.features.Original_Price}
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 'bold' }}
          >
          ₹ {parseFloat(plan.features.Price).toLocaleString()} / year
        </Typography>
        <Typography
            variant="body2"
            sx={{ color: 'red', fontWeight: 'bold' }}
          >
            Save {plan.features.Offer}%
          </Typography>
        {/* </Box> */}
      </Box> :
      <Box sx={{ marginBottom: '10px' }}>
      <Typography
        variant="body2"
        sx={{ textDecoration: 'line-through', color: 'grey' }}
      >
        ₹{plan.monthlyYearly}
      </Typography>
      <Typography
        variant="h6"
        sx={{ fontWeight: 'bold' }}
        >
        {plan.Upgrade_Cost_yearly 
    ? `₹ ${parseFloat(plan.Upgrade_Cost_yearly).toLocaleString()} / year` 
    : ''}
      </Typography>
      <Typography
          variant="body2"
          sx={{ color: 'red', fontWeight: 'bold' }}
        >
          Save {plan.discountPercentageYearly}%
        </Typography>
      {/* </Box> */}
    </Box> 
    }

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    marginBottom: '10px',
                    color:
                    index === 0 ? 'blue' : index === 1 ? 'green' : index === 2 ? 'orange' : 'red',
                      borderRadius: '20px' ,
                      borderColor: index === 0 ? 'blue' : index === 1 ? 'green' : index === 2 ? 'orange' : 'red',
                      backgroundColor: index === 0 ? 'lightblue' : index === 1 ? 'lightgreen' : index === 2 ? 'lightyellow' : 'lightcoral',
                  }}
                  onClick={() => [8,12,16].includes(plan.features.id) ? handleContactUsClick() : handleRenewClick(plan)}
                >
                  {[8,12,16].includes(plan.features.id) ? 'Contact Us' : 'Buy Now'}
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* <Divider sx={{ marginY: '20px' }} /> */}

        {features.map((feature, featureIndex) => (
          <React.Fragment key={featureIndex}>
            <Grid container spacing={2} alignItems="center">
              {/* Feature Name Column */}
              <Grid
                size={{
                  xs: 12,
                  sm: 3
                }}>
              <Typography variant="body2">
                {feature.replace(/_/g, ' ')}
              </Typography>
              </Grid>

              {getPlanDetails.map((plan) => (
                <Grid
                  key={plan.features.id}
                  sx={{
                    marginTop: '10px'
                  }}
                  size={{
                    xs: 12,
                    sm: 3,
                    md: 2
                  }}>
                  <Box sx={{ textAlign: 'center' }}>
                  {feature === 'Price' ? (
                `${plan.features[feature]} / Year`
              ) : feature === 'User_Count' ? (
                `Upto ${plan.features[feature]} users`
              ) : feature === 'Locations' ? (
                `Upto ${plan.features[feature]} locations`
              ) : plan.features[feature] === 1 ? (
                <TaskAltIcon color='success' fontSize='small' />
              ) : plan.features[feature] === 0 ? (
                <HighlightOffIcon color='disabled' fontSize='small' />
              ) : (
                plan.features[feature]
              )}
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* {featureIndex < features.length - 1 && (
              // <Divider sx={{ marginY: '10px' }} />
            )} */}
          </React.Fragment>
        ))}

        <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ marginTop: '20px' }}>
          {/* <Grid > */}

          {getPlanDetails.map((plan, index) => (
          <Grid
            key={plan.features.id}
            size={{
              xs: 12,
              sm: 3,
              md: 2
            }}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  // marginTop: '10px',
                  color:
                    index === 0 ? 'blue' : index === 1 ? 'green' : index === 2 ? 'orange' : 'red',
                    borderRadius: '20px',
                    borderColor: index === 0 ? 'blue' : index === 1 ? 'green' : index === 2 ? 'orange' : 'red',
                    backgroundColor: index === 0 ? 'lightblue' : index === 1 ? 'lightgreen' : index === 2 ? 'lightyellow' : 'lightcoral',
                }}
                onClick={() => [8,12,16].includes(plan.features.id) ? handleContactUsClick() : handleRenewClick(plan)}
              >
               {[8,12,16].includes(plan.features.id) ? 'Contact Us' : 'Buy Now'}
              </Button>
            </Grid>
          ))}
          </Grid>
        {/* </Grid> */}
      </Box>

      <Dialog
        open={openBillBox}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{plan_name.type === 'SUBSCRIBE' ? 'Subscription Plans' : 'Upgrade Plan'}</DialogTitle>
        <DialogContent>
          {planData && (
            <RenewPlan
              plan_name={planData.features.id}
              actualUpgradeCost={renewingCost}
              type={plan_name.type}
              onClose={handleCloseDialog}
              handleBack={plan_name.handleBack}
              data={plan_name.data}
              loginType={plan_name.login}
              monthlyOrYearly={isYearly === false ? "MONTHLY" : "YEARLY"}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={openContactUsDialog} onClose={handleContactUsClick}>
        <DialogTitle>Contact Information</DialogTitle>
        <DialogContent>
        <Box display="flex" alignItems="center" gap={1} marginBottom={2}>
            <PhoneIphoneIcon color="primary" />
            <Typography variant="body1">+91-9500000404</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <EmailIcon color="primary" />
            <Typography variant="body1" component="a"
    href={`mailto:support@example.com`}
    sx={{ textDecoration: 'none', color: 'inherit' }}>mail@tazk.in</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
    <Button onClick={handleContactUsClick} color="primary">
      Close
    </Button>
  </DialogActions>
      </Dialog>
    </Card>
  </>
);


};

export default PricingTable;
