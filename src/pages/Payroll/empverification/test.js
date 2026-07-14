import React, {useContext, useEffect, useState} from 'react';
import {
  Container,
  Grid,
  MenuItem,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Box,
  alpha,
  Button,
} from '@mui/material';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import AddCardIcon from '@mui/icons-material/AddCard';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import SchoolIcon from '@mui/icons-material/School';
import CardTravelIcon from '@mui/icons-material/CardTravel';
import InfoIcon from '@mui/icons-material/Info';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import {useDispatch, useSelector} from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {Helmet} from 'react-helmet-async';
import {titleURL} from 'http-common';
import {getEmpbasecompanyAction, getEmpbasecompanyFilterAction, get_search_company_based_employee, set_search_company_based_employee} from 'redux/actions/attendance_actions';
import {
  completedIndexValue,
  employeeDetailAction,
} from 'redux/actions/userCreation_actions';
import StepperDesign from '../../../components/employeeVerification/stepper';
import EmployeeDetails from '../../../components/employeeVerification/employeeDetails';
import Documents from 'components/employeeVerification/documents';
import {AppAnimate} from '../../../@crema';
import CommonUserAutoCompleteForSingleUser from 'utils/commonAutoCompleteForSingleUser';
import { GET_EMP_BASECOMPANY_FILTER } from 'redux/actionTypes';

const tabData = [
  {
    id: 1,
    icon: <AddCardIcon />,
    name: 'Identity Verification',
    infoIcon: (
      <Tooltip title='Pancard, DL, Aadhar original check and document upload'>
        <InfoIcon
          style={{fontSize: '1rem', color: 'gray', marginLeft: '0.5rem'}}
        />
      </Tooltip>
    ),
  },
  {
    id: 2,
    icon: <AddLocationAltIcon />,
    name: 'Address Verification',
    infoIcon: (
      <Tooltip title='VoterId,Pancard, DL, Aadhar, Ration Card, Gas Bill Verification and  document upload'>
        <InfoIcon
          style={{fontSize: '1rem', color: 'gray', marginLeft: '0.5rem'}}
        />
      </Tooltip>
    ),
  },
  {
    id: 3,
    icon: <AddCardIcon />,
    name: 'Employment Verification',
    infoIcon: (
      <Tooltip title='Mail and Phone call verification on previous employement'>
        <InfoIcon
          style={{fontSize: '1rem', color: 'gray', marginLeft: '0.5rem'}}
        />
      </Tooltip>
    ),
  },
  {
    id: 4,
    icon: <SchoolIcon />,
    name: 'Educational Qualification Check',
    infoIcon: (
      <Tooltip title='(TC, Marksheet, Graduation Certificate) Both school and college'>
        <InfoIcon
          style={{fontSize: '1rem', color: 'gray', marginLeft: '0.5rem'}}
        />
      </Tooltip>
    ),
  },
  {
    id: 5,
    icon: <CardTravelIcon />,
    name: 'Driving License Verification',
    infoIcon: (
      <Tooltip title='Driving License expiry date and original verification, License type'>
        <InfoIcon
          style={{fontSize: '1rem', color: 'gray', marginLeft: '0.5rem'}}
        />
      </Tooltip>
    ),
  },
  {
    id: 6,
    icon: <ConnectWithoutContactIcon />,
    name: 'Social Media Check',
    infoIcon: (
      <Tooltip title='facebook, linkedin, insta accounts check and page url'>
        <InfoIcon
          style={{fontSize: '1rem', color: 'gray', marginLeft: '0.5rem'}}
        />
      </Tooltip>
    ),
  },
  {
    id: 7,
    icon: <GraphicEqIcon />,
    name: 'Criminal Record Check',
    infoIcon: (
      <Tooltip title='Nearby police station verification'>
        <InfoIcon
          style={{fontSize: '1rem', color: 'gray', marginLeft: '0.5rem'}}
        />
      </Tooltip>
    ),
  },
  {
    id: 8,
    icon: <VaccinesIcon />,
    name: 'Drug Test Check',
  },
  {
    id: 9,
    icon: <EmojiPeopleIcon />,
    name: 'Family Background Verification',
  },
  {
    id: 10,
    icon: <DirectionsWalkIcon />,
    name: 'Current Residence Lat Long Check',
    infoIcon: (
      <Tooltip title='Match Lat Long with address proof'>
        <InfoIcon
          style={{fontSize: '1rem', color: 'gray', marginLeft: '0.5rem'}}
        />
      </Tooltip>
    ),
  },
  {
    id: 11,
    icon: <CreditScoreIcon />,
    name: 'Passport & Aadhar Verification',
  },
  {
    id: 12,
    icon: <CreditScoreIcon />,
    name: 'PAN Verification',
  },
];

export default function EmployeeVerification(props) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentFinancial = new Date(currentYear, 3, 1);
  const [financialStartDate, setFinancialStartDate] =
    useState(currentFinancial);
  const [accountDataList, setAccountDataList] = useState([]);
  const [empDetails, setEmpDetails] = useState({});
  
  const [selectedAll, setSelectedAll] = useState(false);

  const [formValues, setFormValues] = useState({
    employee_id: null,
    name: null,
    file: null,
  });
  const [formErrors, setFormErrors] = useState({employee_id: null});

  

  const [userSelectError, setUserSelectError] = useState('');
  const [value, setValue] = React.useState([]);
  const [selectedTab, setSelectedTab] = useState(null);
  
  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');

  const dispatch = useDispatch();

  const {
    attendanceReducer: { get_empbasecompany ,searchCompanyBasedEmployeeFilter,getCompanyBasedEmployeeFilter },
  } = useSelector((state) => state);

  const {setLoaderStatusHandler, setModalTypeHandler, headerLocationId} =
    useContext(context);

  useEffect(() => {
    let data1 = {
       searchString:""
     }
    dispatch(getEmpbasecompanyFilterAction(data1,(res)=>{
      console.log("resss",res)
      dispatch({
        type: GET_EMP_BASECOMPANY_FILTER,
        payload: res,
      });
    }))
  }, []);

  useEffect(() => {
    setValue(props.employeeId)
    console.log("value.length",value)
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(completedIndexValue(props.employeeId)),
        dispatch(
          employeeDetailAction(props.employeeId, (response) => {
            setEmpDetails(response);
          }),
        ),
      );
  }, []);


  const handleChangeEmployeeName =(val)=>{
    setValue(val)
    if(val?.length > 0){
      setUserSelectError('');
     
    }

}
  
  const requestSearchEmployeeFilter = (val) => {

    // let allDept = list_department.map((d) => d.department);
  
    setSearchValEmployeeFilter(val);
    dispatch(set_search_company_based_employee([]));
  
    if (!val) {
      return
    }
  
    let data = {
      
      searchString: val
    }
  
  
  
    dispatch(
      get_search_company_based_employee(
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
    

  
  };

  const handleClose = () => {
    props.setOpenDetailsPage(false);
  };

  const handleIconClick = (employeeId) => {
    dispatch(
      employeeDetailAction(employeeId, (response) => {
        setEmpDetails(response);
        setSelectedTab(tabData[0]);
      })
    );
  };

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value ? null : 'Field is required',
    }));
  };

  return (
    <div style={{
      padding: '0 10px',
      height: '88vh',
      overflowY: 'auto',
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',  
    }}
    className="hide-scrollbar"
  >
    <style>
      {`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}
    </style>
 
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Employee Verification </title>
      </Helmet>
      <AppAnimate animation='transition.slideUpIn' delay={500}>
        <Container maxWidth='lg'>
          <Grid
            container
            display='flex'
            flexDirection='row'
            alignItems='center'
            spacing={5}
          >
            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <Box
                width='100%'
                display='flex'
                flexDirection='row'
                alignItems='center'
                sx={{
                  backgroundColor: (theme) => theme.palette.background.paper,
                  backgroundImage: (theme) =>
                    `linear-gradient(${alpha(
                      theme.palette.common.white,
                      0.05,
                    )}, ${alpha(theme.palette.common.white, 0.05)})`,
                  boxShadow: '0px 10px 10px 4px rgba(0, 0, 0, 0.04)',
                  borderRadius: (theme) => theme.cardRadius / 4,
                  p: 5,
                }}
              >
                {/* <FormControl variant='outlined' fullWidth>
                  
                  <CommonUserAutoCompleteForSingleUser
                    searchVal={searchValEmployeeFilter}
                    setSearchValEmployeeFilter={setSearchValEmployeeFilter}
                    requestSearch={requestSearchEmployeeFilter}
                    value={value}
                    setValue={handleChangeEmployeeName}
                    type={getCompanyBasedEmployeeFilter}
                    searchType={searchCompanyBasedEmployeeFilter}

                    error={userSelectError}
                    selectedAll={selectedAll}
                    setSelectedAll={setSelectedAll}
                    labelName = "Select Employee"
                   
                  />
                </FormControl> */}
                {/* <Button
                  onClick={() => {
                    setEmpDetails({});
                    handleVClose();
                  }}
                >
                  Back
                </Button> */}
              {/* </Box>
            </Grid> */}

              <>
              <Grid container justifyContent="flex-end" alignItems="center">
                <Button
                  onClick={() => handleClose()}
                  style={{}}
                  name='Cancel'
                  variant='contained'
                  color='secondary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  type='cancel'
                >
                  Back
                </Button>
                </Grid>
                <Grid
                  key={value.employee_id}
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Grid
                    container
                    display='flex'
                    flexDirection='row'
                    alignItems='center'
                    spacing={5}
                  >
                    <Grid
                      size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <EmployeeDetails user={empDetails} />
                    </Grid>

                    <Grid
                      size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <StepperDesign userId={value?.employee_id} />
                    </Grid>

                    <Grid
                      size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <Documents tabs={tabData} user={empDetails} />
                    </Grid>
                  </Grid>
                </Grid>
              </>
          </Grid>
        </Container>
      </AppAnimate>
    </div>
  );
}
