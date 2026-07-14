import React, { useContext, useEffect, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Checkbox,
  Button,
  Box,
  Grid,
  Switch,
  Card
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getAppConfigDataAction } from 'redux/actions/app_config_actions';
import { useDispatch, useSelector } from 'react-redux';
import { reminderConfiguration, reminderConfigurationAction } from 'redux/actions/configuration_actions';
import context from '../../../context/CreateNewButtonContext';
const ReminderConfiguration = () => {

    const dispatch = useDispatch()

    const {
        appConfigReducer: {app_config_data}
      } = useSelector(state => state)
      
        const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);

  const [checked, setChecked] = React.useState({
    sms:false,
    whatsapp:false,
    custDuedate: false,
    custOnDuedate: false,
    salesDuedate: false,
    salesOnDuedate: false,
    stockLevel: false,
    purchaseDuedate: false,
    purchaseOnDuedate: false,
    outstanding: false,
    yesterdaySales: false,
  });

  const [execute,setExecute] = useState(false)

  useEffect(()=>{
    if(app_config_data?.length){
      const customerConfigEntry = app_config_data.find((e) => e.key_name === 'customer_reminder');
const customerFilteredData = JSON.parse(customerConfigEntry?.value);

const adminConfigEntry = app_config_data.find((e) => e.key_name === 'admin_reminder');
const adminFilteredData = JSON.parse(adminConfigEntry?.value);
      console.log()
      setChecked({...setChecked,
      sms:customerFilteredData.sms,
      whatsapp:adminFilteredData.whatsapp,
      custDuedate: customerFilteredData.custDuedate,
      custOnDuedate: customerFilteredData.custOnDuedate,
      salesDuedate: adminFilteredData.salesDuedate,
      salesOnDuedate: adminFilteredData.salesOnDuedate,
      stockLevel: adminFilteredData.stockLevel,
      purchaseDuedate: adminFilteredData.purchaseDuedate,
      purchaseOnDuedate: adminFilteredData.purchaseOnDuedate,
      outstanding: adminFilteredData.outstanding,
      yesterdaySales: adminFilteredData.yesterdaySales
    })
    }
  },[app_config_data])

 const  customer_reminder = {
    sms : checked.sms,
    custDuedate : checked.custDuedate,
    custOnDuedate : checked.custOnDuedate
  }

   const  admin_reminder = {
    whatsapp : checked.whatsapp,
    salesDuedate: checked.salesDuedate,
    salesOnDuedate: checked.salesOnDuedate,
    stockLevel: checked.stockLevel,
    purchaseDuedate: checked.purchaseDuedate,
    purchaseOnDuedate: checked.purchaseOnDuedate,
    outstanding: checked.outstanding,
    yesterdaySales: checked.yesterdaySales,
  }


  const handleChange = (event) => {
    setExecute(true)
      console.log(event.target.name , event.target.checked,'consoleinjasdfdsf' )
    if(event.target.name === 'sms' && event.target.checked === false ){
        return setChecked({ ...checked, custDuedate : false ,custOnDuedate : false, sms : false});
    }
    else if(event.target.name === 'whatsapp' && event.target.checked === false){
       return  setChecked({ ...checked, salesDuedate : false ,salesOnDuedate : false,stockLevel : false,purchaseDuedate : false,purchaseOnDuedate : false,outstanding : false,yesterdaySales : false,whatsapp : false});
    }
    setChecked({ ...checked, [event.target.name]: event.target.checked });
};
console.log(customer_reminder,'custometrwetret',admin_reminder)



//  useEffect(()=>{
//  await  dispatch(getAppConfigDataAction(setModalTypeHandler, setLoaderStatusHandler))
//  },[])

 useEffect(() => {
  if(execute){
const customer_reminder = {
    sms : checked.sms,
    custDuedate : checked.custDuedate,
    custOnDuedate : checked.custOnDuedate
  };

  const admin_reminder = {
    whatsapp : checked.whatsapp,
    salesDuedate: checked.salesDuedate,
    salesOnDuedate: checked.salesOnDuedate,
    stockLevel: checked.stockLevel,
    purchaseDuedate: checked.purchaseDuedate,
    purchaseOnDuedate: checked.purchaseOnDuedate,
    outstanding: checked.outstanding,
    yesterdaySales: checked.yesterdaySales,
  };

  const data = {
    customer_reminder :   JSON.stringify(customer_reminder),
    admin_reminder : JSON.stringify(admin_reminder)
  }

  
  console.log(customer_reminder, 'checkeudhdghdgh', admin_reminder);
  dispatch(reminderConfigurationAction(data))
  }
  
}, [checked]);

  return (
    <Box sx={{ height: '80vh', overflowY: 'auto', p: 2 }}>
      {/* <Card sx={{ p: 4 }}> */}
      <Grid container direction="column" spacing={2}>
        <Grid padding={2}>
          <Typography variant="h3" padding={2}>Reminder Settings</Typography>
          <Typography variant="caption">
            Select which reminders are sent to you and your customers
          </Typography>
        </Grid>

        {/* Switch Options */}
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              md: 6
            }}>
            <Card variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography>Send Billing SMS to Customer</Typography>
                <Typography variant="caption">
                  Send SMS to your customer on creating any transaction
                </Typography>
              </Box>
              <Switch 
                checked={checked['sms']}
                onChange={handleChange}
                name="sms"
              />
            </Card>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 6
            }}>
            <Card variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography>Get payment reminders on WhatsApp</Typography>
                <Typography variant="caption">
                  Get WhatsApp alerts when you have to collect payment from customers
                </Typography>
              </Box>
              <Switch 
                checked={checked['whatsapp']}
                onChange={handleChange}
                name="whatsapp" 
                />
            </Card>
          </Grid>
        </Grid>

        {/* Accordion Section */}
        <Grid>
          <Accordion expanded={checked.sms} elevation={0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                TO Customer (Reminders will be sent through sms)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Card sx={{padding:5}}>
              <Typography variant="subtitle2">Sales Invoice</Typography>
              <Typography variant="caption">
                Get reminded to collect payments on time
              </Typography>

              <Box mt={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Checkbox
                    checked={checked['custDuedate']}
                    onChange={handleChange}
                    name="custDuedate"
                  />
                  <Typography>3 days before due date</Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <Checkbox
                    checked={checked['custOnDuedate']}
                    onChange={handleChange}
                    name="custOnDuedate"
                  />
                  <Typography>On due date</Typography>
                </Box>
              </Box>
              </Card>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={checked.whatsapp} elevation={0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                TO YOU (Reminders will be sent on mobile app and WhatsApp)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={5}>
                <Grid
                  size={{
                    lg: 6,
                    sm: 12,
                    xs: 12,
                    md: 6
                  }}>
                     <Card sx={{padding:5}}>
              <Typography variant="subtitle2">Sales Invoice</Typography>
              <Typography variant="caption">
                Get reminded to collect payments on time
              </Typography>

              <Box mt={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Checkbox
                    checked={checked['salesDuedate']}
                    onChange={handleChange}
                    name="salesDuedate"
                  />
                  <Typography>3 days before due date</Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <Checkbox
                    checked={checked['salesOnDuedate']}
                    onChange={handleChange}
                    name="salesOnDuedate"
                  />
                  <Typography>On due date</Typography>
                </Box>
              </Box>
              </Card>
                </Grid>
                
                <Grid
                  size={{
                    lg: 6,
                    sm: 12,
                    xs: 12,
                    md: 6
                  }}>
                     <Card sx={{padding:5}}>
              <Typography variant="subtitle2">Low Stock</Typography>
              <Typography variant="caption">
                Get reminded to buy stock
              </Typography>

              <Box mt={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Checkbox
                    checked={checked['stockLevel']}
                    onChange={handleChange}
                    name="stockLevel"
                  />
                  <Typography>When stock is below stock level</Typography>
                </Box>

                <Box sx={{ height: '46px' }} mb={1}/> 

              </Box>
              </Card>
                </Grid>

                <Grid
                  size={{
                    lg: 6,
                    sm: 12,
                    xs: 12,
                    md: 6
                  }}>
                     <Card sx={{padding:5}}>
              <Typography variant="subtitle2">Purchase Invoice</Typography>
              <Typography variant="caption">
                Get reminded to send payments on time
              </Typography>

              <Box mt={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Checkbox
                    checked={checked['purchaseDuedate']}
                    onChange={handleChange}
                    name="purchaseDuedate"
                  />
                  <Typography>3 days before due date</Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <Checkbox
                    checked={checked['purchaseOnDuedate']}
                    onChange={handleChange}
                    name="purchaseOnDuedate"
                  />
                  <Typography>On due date</Typography>
                </Box>
              </Box>
              </Card>
                </Grid>

                <Grid
                  size={{
                    lg: 6,
                    sm: 12,
                    xs: 12,
                    md: 6
                  }}>
                     <Card sx={{padding:5}}>
              <Typography variant="subtitle2">Daily Summary</Typography>
              <Typography variant="caption">
                Get daily updates about
              </Typography>

              <Box mt={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Checkbox
                    checked={checked['outstanding']}
                    onChange={handleChange}
                    name="outstanding"
                  />
                  <Typography>Outstanding Collection and Payments</Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <Checkbox
                    checked={checked['yesterdaySales']}
                    onChange={handleChange}
                    name="yesterdaySales"
                  />
                  <Typography>Yesterday's Sales</Typography>
                </Box>
              </Box>
              </Card>
                </Grid>
             </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
      {/* </Card> */}
    </Box>
  );
};

export default ReminderConfiguration;
