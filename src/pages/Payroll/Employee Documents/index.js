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
  EmpDocumentsDetailAction,
  employeeDetailAction,
} from 'redux/actions/userCreation_actions';
import StepperDesign from '../../../components/employeeVerification/stepper';
import EmployeeDetails from '../../../components/employeeVerification/employeeDetails';
import Documents from 'components/employeeVerification/documents';
import {AppAnimate} from '../../../@crema';
import CommonUserAutoCompleteForSingleUser from 'utils/commonAutoCompleteForSingleUser';
import { GET_EMP_BASECOMPANY_FILTER } from 'redux/actionTypes';
import EmployeeDocumentView from './employeeDocument';

export default function EmployeeDocuments(props) {
  const {setOpenDetailsPage } = props;
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentFinancial = new Date(currentYear, 3, 1);
  const [financialStartDate, setFinancialStartDate] =
    useState(currentFinancial);
  const [accountDataList, setAccountDataList] = useState([]);
  const [empDetails, setEmpDetails] = useState([]);
  
  const [selectedAll, setSelectedAll] = useState(false);

  const [formValues, setFormValues] = useState({
    employee_id: null,
    name: null,
    file: null,
  });
  const [formErrors, setFormErrors] = useState({employee_id: null});

  

  const [userSelectError, setUserSelectError] = useState('');
  const [value, setValue] = React.useState([]);
  
  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');

  const dispatch = useDispatch();

  const {
    UserCreationReducer: { empDocumentsDetailList },
  } = useSelector((state) => state);

  const {setLoaderStatusHandler, setModalTypeHandler, headerLocationId} =
    useContext(context);

    useEffect(() => {
      console.log("Employee ID:", props.employeeId);
      const payload = {
        employee_id: props.employeeId
      }
      // if (props.employeeId) {
        console.log("comes here");
          apiCalls(
              setModalTypeHandler,
              setLoaderStatusHandler,
              dispatch(EmpDocumentsDetailAction(payload))
          );
          console.log("empDocumentsDetailList",empDocumentsDetailList);
          
      // }
  }, [props.employeeId]);
    

  const handleChangeEmployeeName =(val)=>{
    setValue(val)
    if(val?.length > 0){
      setUserSelectError('');
     
    }

}
  
  const requestSearchEmployeeFilter = (val) => {
  
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

  return (
    <>
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
                <FormControl variant='outlined' fullWidth>
                  
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
                </FormControl>
              </Box>
            </Grid> */}

              <Grid size={12}>
              <EmployeeDocumentView user={empDocumentsDetailList}
                setOpenDetailsPage={setOpenDetailsPage}
              />
            </Grid>
          </Grid>
        </Container>
      </AppAnimate>
    </>
  );
}
