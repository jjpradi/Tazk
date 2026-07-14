import { Box, Button, Card, Divider, Grid, Step, StepLabel, Stepper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Contact from '@crema/services/db/Contact';
import { useDispatch, useSelector } from 'react-redux';
import { useCustomFetch } from 'utils/useCustomFetch';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getSessionDetails } from 'redux/actions/userCreation_actions';
import { ErrorAlert } from 'redux/actions/load';
import General from './general';
import Location from './location';
import LeavePolicy from 'pages/common/configuration/leavePolicy';
import AddAttendancePolicy from 'pages/common/configuration/addAttendancePolicy';
import AddShift from 'pages/Payroll/Shift';
import generalImg from 'assets/dashboardIcons/generalImage.svg'
import locationImg from 'assets/dashboardIcons/image locations.svg'
// import lovImg from 'assets/dashboardIcons/listOf'
import leaveImg from 'assets/dashboardIcons/image leave policys.svg'
import attImg from 'assets/dashboardIcons/image attendance policy.svg'
import shiftImg from 'assets/dashboardIcons/image monthly shift.svg'
import conImg from 'assets/dashboardIcons/image contacts.svg'
import genIcon from 'assets/dashboardIcons/Icon General.svg'
import locIcon from 'assets/dashboardIcons/Icon Locations.svg'
import lovIcon from 'assets/dashboardIcons/Icon List of Values.svg'
import leaveIcon from 'assets/dashboardIcons/Icon Leave Policy.svg'
import attIcon from 'assets/dashboardIcons/Icon Attendance Polivy.svg'
import shiftIcon from 'assets/dashboardIcons/Icon Monthly Shift.svg'
import contIcon from 'assets/dashboardIcons/Icon Contacts.svg'
import Lov from './lov';
import { getusermenus, listroleAction } from 'redux/actions/role_actions';
import { attendancePolicyAction, getShiftListAction, leavePolicyAction } from 'redux/actions/shifts.actions';
import { stockLocationPaginationAction } from 'redux/actions/stock_Location_actions';
import context from '../../../context/CreateNewButtonContext'
import NewBankCreation from 'components/BankCreation';
import bankingIcon from 'assets/dashboardIcons/banking.svg';
import bankIcon from 'assets/dashboardIcons/bank_Icon.svg'
import bankImg from 'assets/dashboardIcons/bankImg.svg'
import cashboxImg from 'assets/dashboardIcons/cashboxpic.svg'
import cashboxIcon from 'assets/dashboardIcons/cashboxIcon.svg'
import paymentIcon from 'assets/dashboardIcons/paymentIcon.svg'
import paymentImg from 'assets/dashboardIcons/paymentImg.svg'
import NewCashBox from 'components/NewCashBox';
import BankCreation from 'pages/accounts/BankCreation';
import Paymentmethods from 'pages/sales/paymentmethods';
import CashBoxCreation from 'pages/accounts/cashBoxCreation';
import { cashBoxPaginationAction } from 'redux/actions/cash_box_actions';
import CompanyInfo from 'pages/common/CompanyInfo/CompanyInfo';
import companyInfoImg from 'assets/dashboardIcons/companyInfoImg.svg'
import API_URLS from '../../../utils/customFetchApiUrls';
import { singlePageScrollHostSx } from 'utils/pageScrollLayout';

export default function DetailPage({ handleClose }) {
  const customFetch = useCustomFetch();
  const storage = getsessionStorage();
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(false)
  const [completedSteps, setCompletedSteps] = useState({});
  const { DashboardRoleReducer: { getalldashboarddata }, roleReducer: { pos_pages, listrole }, UserRoleReducer: { designation }, ShiftsReducer: { attendancePolicyList, leavePolicyList, lovData }, SalaryReducers: { salarystructurelist }, UserCreationReducer: { all_user_location } } = useSelector(state => (state));

  const steps = storage?.company_type == 5 ? [
    'General',
    'Location',
    'List Of Value',
    'Leave Policy',
    'Attendance Policy',
    'Shift',
  ] : storage?.company_type == 9 ? [
    'Location',
    'List Of Value',
  ] : storage?.company_type == 10 ? [
    'List Of Value',
  ] : storage?.company_type == 2 ? [
    'Bank',
    'Cash Box',
    'Payment Method'
  ] : storage?.company_type == 3 ? [
    'Company Info',
    'List Of Value',
  ] : storage?.company_type == 11 ? [
    'Company Info',
    'List Of Value',
  ] : storage?.company_type == 4 && [
    'General',
    'Location',
    'List Of Value'
  ]

  const icons = storage?.company_type == 5 ? {
    0: <img src={genIcon} alt="General" style={{ height: 24, width: 24 }} />,
    1: <img src={locIcon} alt="Location" style={{ height: 24, width: 24 }} />,
    2: <img src={lovIcon} alt="List Of Value" style={{ height: 24, width: 24 }} />,
    3: <img src={leaveIcon} alt="Leave Policy" style={{ height: 24, width: 24 }} />,
    4: <img src={attIcon} alt="Attendance Policy" style={{ height: 24, width: 24 }} />,
    5: <img src={shiftIcon} alt="Shift" style={{ height: 24, width: 24 }} />,
    // 6: <img src={contIcon} alt="Contacts" style={{ height: 24, width: 24 }} />,
  } : storage?.company_type == 10 ? {
    0: <img src={lovIcon} alt="List Of Value" style={{ height: 24, width: 24 }} />
  } : storage?.company_type == 9 ? {
    0: <img src={locIcon} alt="Location" style={{ height: 24, width: 24 }} />,
    1: <img src={lovIcon} alt="List Of Value" style={{ height: 24, width: 24 }} />
  } : storage?.company_type == 4 ? {
    0: <img src={genIcon} alt="General" style={{ height: 24, width: 24 }} />,
    1: <img src={locIcon} alt="Location" style={{ height: 24, width: 24 }} />,
    2: <img src={lovIcon} alt="List Of Value" style={{ height: 24, width: 24 }} />,
  } : storage?.company_type == 3 ? {
    0: <img src={genIcon} alt="General" style={{ height: 24, width: 24 }} />,
    1: <img src={locIcon} alt="Location" style={{ height: 24, width: 24 }} />,
    2: <img src={lovIcon} alt="List Of Value" style={{ height: 24, width: 24 }} />,
  } : storage?.company_type == 11 ? {
    0: <img src={genIcon} alt="General" style={{ height: 24, width: 24 }} />,
    1: <img src={locIcon} alt="Location" style={{ height: 24, width: 24 }} />,
    2: <img src={lovIcon} alt="List Of Value" style={{ height: 24, width: 24 }} />,
  } : storage?.company_type == 2 && {
    0: <img src={bankIcon} alt="Bank" style={{ height: 24, width: 24 }} />,
    1: <img src={cashboxIcon} alt="Cash Box" style={{ height: 24, width: 24 }} />,
    2: <img src={paymentIcon} alt="Payment Method" style={{ height: 24, width: 24 }} />,
  }

  const StepIcon = ({ icon, completed }) => {
    const iconStyle = {
      height: 24,
      width: 24,
      filter: completed ? 'invert(27%) sepia(81%) saturate(5200%) hue-rotate(210deg) brightness(100%) contrast(100%)' : 'none',
    };

    return (
      <div>
        {React.cloneElement(icons[icon - 1], { style: iconStyle })}
      </div>
    );
  };

  const stepImages = {
    'General': generalImg,
    'Location': locationImg,
    'List Of Value': locationImg,
    'Leave Policy': leaveImg,
    'Attendance Policy': attImg,
    'Shift': shiftImg,
    'Bank': bankImg,
    'Cash Box': cashboxImg,
    'Payment Method': paymentImg,
    'Company Info': companyInfoImg
  };

  const stepDescriptions = {
    'General': 'Provide basic details like Attendance option enable, Week off & holiday and other general information.',
    'Location': 'Specify the locations of the company, such as headquarters and branches.',
    'List Of Value': 'Add various values such as departments, category, designation or other relevant lists.',
    'Leave Policy': 'Define the leave policies for the company, including holiday and leave entitlements.',
    'Attendance Policy': 'Set up attendance rules and policies, including working hours and shifts.',
    'Shift': 'Manage shift schedules and assign shifts to employees.',
    'Bank': 'Add your bank account here for accounting transactions. You can skip this and set it up later.',
    'Cash Box': 'Create a cashbox to record cash entries and manage denominations.',
    'Payment Method': 'Define payment options like Cash, Cards, UPI, and Online transfers. You can skip this and set it up later.',
    'Company Info': 'Enter the provided company information to configure default settings.',
  };

  const validationFunctions = storage?.company_type == 5
    ? [
      () => true,
      () => true,
      () => true,
      () => true,
      () => true,
      () => true,
    ]
    : storage?.company_type == 10
      ? [
        () => true,
      ]
      : storage?.company_type == 9
        ? [
          () => true,
          () => true,
        ]
        : storage?.company_type == 3
        ? [
          () => true,
          () => true,
        ]
        : storage?.company_type == 11
        ? [
          () => true,
          () => true,
        ]
        : storage?.company_type == 2
          ? [
            () => true,
            () => true,
            () => true,
          ]
          : storage?.company_type == 4
            ? [
              () => true,
              () => true,
              () => true,
            ] : [];



  const lastIndex = validationFunctions.length - 1;

  const handleNext = () => {
    const isValid = validationFunctions[activeStep]();
    if (isValid) {
      setActiveStep((prev) => Math.min(prev + 1, lastIndex));
      setCompletedSteps((prevCompleted) => ({
        ...prevCompleted,
        [activeStep]: true,
      }));
    } else {
      handleValidationErrors(activeStep);
    }
  };

  useEffect(() => {
    const payload = {
      type: 'Get'
    }
    dispatch(leavePolicyAction(payload))
    const data = {
      type: 'Get'
    }
    dispatch(attendancePolicyAction(data))
    const body = {
      pageCount: 0,
      numPerPage: 20,
      searchString: '',
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    dispatch(stockLocationPaginationAction(body))
    dispatch(cashBoxPaginationAction(body))
    dispatch(getShiftListAction())
  }, [])

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleValidationErrors = (step) => {
    switch (step) {
      case 0:
        ErrorAlert(dispatch, { message: 'Kindly add at least one designation.' });
        break;
      case 1:
        if (attendancePolicyList?.length < 1) {
          ErrorAlert(dispatch, { message: 'Kindly add attendance policy.' });
        } else if (leavePolicyList?.length < 1) {
          ErrorAlert(dispatch, { message: 'Kindly add leave policy.' });
        }
        break;
      case 2:
        ErrorAlert(dispatch, { message: 'Kindly add the Employee role (HR, Manager, etc.).' });
        break;
      case 8:
        ErrorAlert(dispatch, { message: 'Kindly add at least one salary structure.' });
        break;
      default:
        ErrorAlert(dispatch, { message: 'Validation failed. Please check your inputs.' });
        break;
    }
  };

const handleSubmit = async () => {
  const isValid = validationFunctions[activeStep]();
  if (isValid) {
    if (activeStep === lastIndex) {
      const locationIds = all_user_location.map(item => item.location_id);
      let formData = {
        company_id: storage?.company_id,
        user_location: locationIds
      };

      try {
      
        const data = await customFetch(
          API_URLS.FIRST_LOGIN_DETAIL_UPDATE,
          'POST',
          formData
        );
        console.log(data, 'data');

        const storageString = sessionStorage.getItem('login');
        let cookieData = {};
        console.log("all_user_location",all_user_location,storageString)

        if (storageString) {
          try {
            cookieData = JSON.parse(storageString);
          } catch (err) {
            console.error("Failed to parse sessionStorage 'login'", err);
          }
        }

        setTimeout(async () => {
          let dashboard = getalldashboarddata.map(item => ({
            dashboard_id: item.dashboard_id,
            dashboard_name: item.dashboard_name
          }));

          let newData = {
            role_id: cookieData?.role_id || null,
            role_name: cookieData?.role_name || '',
            modules: listrole || [],
            dashboard: dashboard || [],
            notifications: pos_pages || []
          };

          // let oldModulesMap = {};
          // cookieData.modules?.forEach(mod => {
          //   oldModulesMap[ mod.module_name ] = {
          //     child_modules: mod.child_modules || [],
          //     messageId: mod.messageId || mod.module_name
          //   };
          // });

          // let updatedModules = newData.modules.map(mod => ({
          //   ...mod,
          //   child_modules: oldModulesMap[ mod.module_name ]?.child_modules || [],
          //   messageId: oldModulesMap[ mod.module_name ]?.messageId || mod.module_name
          // }));

          // cookieData.modules = updatedModules;
         
          cookieData.user_location = locationIds;
          cookieData.isDetailEntered = data?.data[0]?.isDetailEntered || false;
          //  console.log("data.accessToken",data?.data?.accessToken)
          if (data?.data?.accessToken) {
            cookieData.accessToken = data?.data?.accessToken;  
          }

          sessionStorage.setItem('login', JSON.stringify(cookieData));

           await dispatch(getSessionDetails(data?.data));

          await dispatch(getusermenus(cookieData));
        }, 500);

        handleClose(data);
      } catch (error) {
        console.error('Error during submission:', error);
        ErrorAlert(dispatch, { message: 'Submission failed. Please try again.' });
      }
    } else {
      setActiveStep((prev) => Math.min(prev + 1, lastIndex));
    }
  } else {
    handleValidationErrors(activeStep);
  }
};


  return (
    <div style={{ backgroundColor: '#f2f2f2' }}>
      <Grid container >
        <Card style={{ width: '100%' }}>
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Box height='50px' display='flex' alignItems='center'>
              <Typography variant='h4' fontWeight='bold' padding='10px'>
                {/* One Time Setup - {steps[activeStep]} */}
                Kindly proceed with the initial one-time basic setup
              </Typography>
            </Box>
          </Grid>
        </Card>
        {/* <Divider sx={{ 
      borderBottom: '1px solid black', 
      width: '100%', 
      marginY: 2
    }} /> */}
        <Grid
          display='flex'
          flexDirection='row'
          marginTop='10px'
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid
            gap={2}
            size={{
              lg: 3,
              md: 3,
              sm: 3,
              xs: 12
            }}>
            <Card style={{ height: '98.7%', margin: '5px 5px 10px 5px', padding: '10px' }}>
              <Grid
                height='20%'
                alignContent='flex-end'
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Typography className='page-title' variant='h4'>{stepDescriptions[steps[activeStep]]}</Typography>
              </Grid>
              {/* </Card>
        <Card style={{height: '60%', margin: '5px', padding: '10px', alignContent: 'center'}}> */}
              <Grid
                height='80%'
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <img src={stepImages[steps[activeStep]]} alt={steps[activeStep]} />
              </Grid>
            </Card>
          </Grid>
          <Grid
            margin='5px'
            size={{
              lg: 9,
              md: 9,
              sm: 9,
              xs: 12
            }}>
            <Card style={{ padding: '10px' }}>
              <Grid container>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Box sx={{ width: '100%', height: '100%' }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                      {steps.map((label, index) => (
                        <Step key={index}>
                          <StepLabel StepIconComponent={StepIcon}>{label}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                    {storage?.company_type == 5 && <>
                      {activeStep === 0 && <div style={{ height: '100%', padding: '10px', overflowY: 'auto' }}> <General setCompleted={setCompleted} handleNext={handleNext} handleBack={handleBack} activeStep={activeStep} /> </div>}
                      {activeStep === 1 && <div style={{ height: '100%', padding: '10px', overflowY: 'auto' }}> <Location handleNext={handleNext} handleBack={handleBack} pageType='detailpage' /> </div>}
                      {activeStep === 2 && <div style={{ height: '100%', padding: '10px', overflowY: 'auto' }}> <Lov pageType='detailpage' handleNext={handleNext} handleBack={handleBack} /> </div>}
                      {activeStep === 3 && <div style={{ height: '100%', padding: '10px', overflowY: 'auto' }}> <LeavePolicy mode='add' pageType='detailpage' handleNext={handleNext} handleBack={handleBack} /> </div>}
                      {activeStep === 4 && <div style={{ height: '100%', padding: '10px', overflowY: 'auto' }}> <AddAttendancePolicy pageType='detailpage' handleNext={handleNext} handleBack={handleBack} /> </div>}
                      {activeStep === 5 && <div style={{ height: '100%', padding: '10px', overflowY: 'auto' }}> <AddShift pageType='detailpage' handleSubmit={handleSubmit} handleBack={handleBack} /> </div>}
                      {/* {activeStep === 6 && <div style={{ height: '680px', overflowY: 'auto' }}> <Contact pageType='detailpage' handleSubmit={handleSubmit} handleBack={handleBack}/> </div>} */}
                    </>}
                    {storage?.company_type == 10 && <>
                      {activeStep === 0 && <div style={{ height: '100%', padding: '10px', overflowY: 'auto' }}> <Lov pageType='detailpage' handleSubmitLov={handleSubmit} handleBack={handleBack} /> </div>}
                    </>}
                    {storage?.company_type == 9 && <>
                      {activeStep === 0 && <div style={{ height: '100%', padding: '10px', overflowY: 'auto' }}> <Location handleNext={handleNext} handleBack={handleBack} pageType='detailpage' activeStep = {activeStep} /> </div>}
                      {activeStep === 1 && <div style={{ height: '100%', padding: '10px', overflowY: 'auto' }}> <Lov pageType='detailpage' assetHandleSubmit={handleSubmit} handleBack={handleBack} /> </div>}
                    </>}
                    {storage?.company_type == 2 && <>
                      {activeStep === 0 && <div style={{ padding: '10px', overflowY: 'auto' }}> <BankCreation handleNext={handleNext} handleBack={handleBack} pageType='detailpage' /> </div>}
                      {activeStep === 1 && <div style={{ padding: '10px', overflowY: 'auto' }}> <CashBoxCreation handleNext={handleNext} handleBack={handleBack} pageType='detailpage' /> </div>}
                      {activeStep === 2 && <div style={{ padding: '10px', overflowY: 'auto' }}> <Paymentmethods handleInitialSubmit={handleSubmit} handleBack={handleBack} pageType='detailpage' /> </div>}
                    </>}
                    {storage?.company_type == 4 && <>
                      {activeStep === 0 && <div style={{ height: '100%', padding: '10px', overflowY: 'auto' }}> <General setCompleted={setCompleted} handleNext={handleNext} handleBack={handleBack} activeStep={activeStep} /> </div>}
                      {activeStep === 1 && <div style={{ height: '100%', padding: '10px', overflowY: 'auto' }}> <Location handleNext={handleNext} handleBack={handleBack} pageType='detailpage' /> </div>}
                      {activeStep === 2 && <div style={{ height: '100%', padding: '10px', overflowY: 'auto' }}> <Lov pageType='detailpage' handleSubmitLov={handleSubmit} handleBack={handleBack} /> </div>}
                    </>}
                    {storage?.company_type == 3 && <>
                      {activeStep === 0 && <Box sx={{ ...singlePageScrollHostSx, p: '10px' }}> <CompanyInfo handleNext={handleNext} handleBack={handleBack} pageType='detailpage' /> </Box>}
                      {activeStep === 1 && <div style={{ height: '100%', padding: '10px', overflowY: 'auto' }}> <Lov pageType='detailpage' handleSubmitLov={handleSubmit} handleBack={handleBack} /> </div>}
                    </>}
                    {storage?.company_type == 11 && <>
                      {activeStep === 0 && <Box sx={{ ...singlePageScrollHostSx, p: '10px' }}> <CompanyInfo handleNext={handleNext} handleBack={handleBack} pageType='detailpage' /> </Box>}
                      {activeStep === 1 && <div style={{ height: '100%', padding: '10px', overflowY: 'auto' }}> <Lov pageType='detailpage' handleSubmitLov={handleSubmit} handleBack={handleBack} /> </div>}
                    </>}
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      {/* {activeStep === lastIndex && <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} display='flex' justifyContent='end' margin='10px'>
        <Box display='flex' margin='5px'>
          <Button
            style={{ marginRight: '10px' }}
            variant="contained"
            color='secondary'
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Grid>} */}
    </div>
  );
}
