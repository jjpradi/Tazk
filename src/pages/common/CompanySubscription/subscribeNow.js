import React, {useEffect, useState} from 'react';
import {
  Card,
  Grid,
  Typography,
  Button,
  Box,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '@emotion/react';
import {getPlanDetailsAction} from 'redux/actions/subscription_action';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import RenewPlan from './renewPlan';

const SubscribeNow = (plan_name) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const dispatch = useDispatch();
  const {
    SubscriptionReducer: {getPlanDetails},
  } = useSelector((state) => state);

  const [openBillBox, setopenBillBox] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    if (plan_name.type === 'SUBSCRIBE') {
      const payload = {
        Subscription_type: plan_name.plan_name,
        isTrial: 1
      };
      dispatch(getPlanDetailsAction(payload));
    }
  }, []);

  useEffect(() => {
    if (getPlanDetails && getPlanDetails.length > 0) {
      const availableFeatures = Object.keys(getPlanDetails[0].features).filter(
        (key) => ![
          "id", "Subscription_Type", "Price", "Original_Price", "Offer", 
          "Free_Trail", "createdAt", "updatedAt", "createdBy", "updatedBy"
        ].includes(key)
      );
      setFeatures(availableFeatures);
    }
  }, [getPlanDetails]);

  const handleRenewClick = (planData) => {
    setopenBillBox(true);
    setPlanData(planData);
  };

  const handleCloseDialog = () => {
    setopenBillBox(false);
    setPlanData(null);
  };

  return (
    <Card>
      <Box sx={{padding: '20px'}}>
        <Typography variant='h4' textAlign='center' gutterBottom>
          Compare Plans
        </Typography>

        <Grid container spacing={1}>
          {/* Header Row */}
          <Grid
            size={{
              xs: 12,
              sm: 3
            }}>
            <Typography variant='body2' sx={{fontWeight: 'bold'}}>
              Features
            </Typography>
          </Grid>
          {getPlanDetails.map((plan) => (
            <Grid
              key={plan.id}
              size={{
                xs: 12,
                sm: 3
              }}>
              <Typography
                variant='h5'
                textAlign='center'
                sx={{fontWeight: 'bold'}}
              >
                {plan.Subscription_Type}
              </Typography>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{marginY: '2px'}} />

        {features.map((feature, index) => (
          <React.Fragment key={index}>
            <Grid container spacing={1} alignItems='center'>
              <Grid
                size={{
                  xs: 12,
                  sm: 3
                }}>
                <Typography variant='body2'>
                  {feature.replace(/_/g, ' ')}
                </Typography>
              </Grid>
              {getPlanDetails.map((plan) => (
                <Grid
                  key={plan.id}
                  size={{
                    xs: 12,
                    sm: 3
                  }}>
                  <Card sx={{textAlign: 'center', boxShadow: 'none'}}>
                  <Typography>
              {feature === 'Price' ? (
                `${plan[feature]} / Year`
              ) : feature === 'User_Count' ? (
                `Upto ${plan[feature]} users`
              ) : feature === 'Locations' ? (
                `Upto ${plan[feature]} locations`
              ) : plan[feature] === 1 ? (
                <TaskAltIcon color='success' fontSize='small' />
              ) : plan[feature] === 0 ? (
                <HighlightOffIcon color='disabled' fontSize='small' />
              ) : (
                plan[feature]
              )}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {index < features.length - 1 && (
              <Divider sx={{marginY: '1px'}} />
            )}
          </React.Fragment>
        ))}

        <Grid container spacing={1}>
          <Grid
            size={{
              xs: 12,
              sm: 3
            }}>
            <Typography variant='body2'></Typography>
          </Grid>
          {getPlanDetails.map((plan) => (
            <Grid
              key={plan.id}
              sx={{textAlign: 'center'}}
              size={{
                xs: 12,
                sm: 3
              }}>
              <Button
                variant='contained'
                fullWidth
                sx={{marginTop: '10px'}}
                onClick={() => handleRenewClick(plan)}
              >
                {'Select Plan'}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Dialog
        open={openBillBox}
        onClose={handleCloseDialog}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Subscribe Plan</DialogTitle>
        <DialogContent>
          {planData && (
            <RenewPlan
              plan_name={planData.id}
              type={'SUBSCRIBE'}
              onclose={true}
              onClose={handleCloseDialog}
              actualUpgradeCost={planData.Price}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SubscribeNow;
