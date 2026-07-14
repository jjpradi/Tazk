import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import _, { forEach } from 'lodash';
import { Country } from 'components/Country_list';
import UnSavedChangesWarning from 'pages/common/unChangeswarning';
import CancelDialog from 'components/CancelDialog';
import {
  Button,
  Box,
  NativeSelect,
  TextField,
  Typography,
  Grid,
  FormControl,
  FormHelperText,
  InputLabel,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Select,
  MenuItem,
  InputAdornment,
  Switch,
  FormControlLabel,
  Chip,
  Tabs,
  Tab,
  Input,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { getTrimmedData } from 'components/trimFunction';

import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
// import './NewUser.css';
import { requestForToken } from '../../../firebase/firebase.service';
import SimpleBackdrop from 'pages/common/Loader';
import { useDispatch, useSelector } from 'react-redux';
import { getShiftListAction, listEmployeeCategoryAction } from 'redux/actions/shifts.actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import { ProperCaseFunc } from 'utils/properCase';
import { bankTransactionTypeAction, departmentListAction, userCreationPaginationAction } from 'redux/actions/userCreation_actions';
import { enableDisableEmpLoginAction } from 'redux/actions/userCreation_actions';
import ConnectingAirportsSharpIcon from '@mui/icons-material/ConnectingAirportsSharp';
import CottageRoundedIcon from '@mui/icons-material/CottageRounded';
import DisplaySettingsSharpIcon from '@mui/icons-material/DisplaySettingsSharp';
import AccountBalance from '@mui/icons-material/AccountBalance';
import CommonUserAutoCompleteForSingleUser from 'utils/commonAutoCompleteForSingleUser';
import { getEmpbasecompanyAction, getEmpbasecompanyFilterAction, getEmpbasecompanyFormAction, get_search_company_based_employee, set_search_company_based_employee } from '../../../redux/actions/attendance_actions';
import { CreateForm12, ListForm12BB } from 'redux/actions/incometax_actions';

import { v4 as uuidv4 } from 'uuid';
import styled from '@emotion/styled';
import { useCustomFetch } from 'utils/useCustomFetch';
import AttachmentField from 'pages/common/Timesheet/Attachment';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import API_URLS from 'utils/customFetchApiUrls';
const deductionTypes = [
  { label: '80CC', value: '80CC' },
  { label: '80D', value: '80D' },
  { label: '80E', value: '80E' },
];
const CustomToggleButton = styled(ToggleButton)(({ theme }) => ({
  borderRadius: '4px',
  padding: '8px 20px',
  fontWeight: 'bold',
  transition: 'background-color 0.3s ease, color 0.3s ease',
  '&.Mui-selected': {
    backgroundColor: '#1976d2',
    color: '#fff',              // White text when selected
  },
  '&:hover': {
    backgroundColor: '#1565c0',  // Darker blue when hovered
    color: '#fff',               // White text when hovered
  },
  '&.Mui-disabled': {
    backgroundColor: '#ccc',     // Disabled state color
    color: '#9e9e9e',            // Disabled text color
  },
}));
function NewForm12BB(props) {
  const textRef = useRef(null);
  const storage = getsessionStorage()
  const filter = createFilterOptions();
  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');
  const [deductions, setDeductions] = useState([{ type: '', name: '', amount: '', deduction_filename: '' }]);

  const [images, setImages] = useState([]);
  const [formValues, setFormValues] = useState({
    financial_year: null,
    rent_paid_landlord: null,
    permanent_borrowing_num: null,
    address_borrowing_lender_name: null,
    deduction_borrowing_lender_name: null,
    interest_paid_lender: null,
    travel_concessions: null,
    address_landlord: null,
    name_landlord: null,
    travel_destination: null,
    lta_filename: '',
    hra_filename: '',
    ib_filename: '',
    deduction_filename: '',
    taxRegime: 1,
    effective_month:''

  });
  const [imgIndex, setImgIndex] = useState(0);
  const [value, setValue] = useState(0);
  const [selectedFile, setSelectedFile] = useState();
  const [imageStatus, setimageStatus] = useState();
  const [InterestimageStatus, setInterestimageStatus] = useState();
  const [ImgType, setImgType] = useState();
  const [imgName, setImgName] = useState("");
  const [deductionImage, setDeductionImage] = useState("");
  const [DeductionimgName, setDeductionimgName] = useState("");
  const [interestimgName, setinterestImgName] = useState("");
  const [value1, setValue1] = React.useState([]);
  const [value2, setValue2] = React.useState([]);
  const [open, setOpen] = useState(false);
  const [Interestopen, setInterestOpen] = useState(false);
  const [DeductionOpen, setDeductionOpen] = useState(false);
  const [loader, setLoader] = useState(false)
  const [userSelectError, setUserselectError] = useState('')
  const [formErrors, setFormErrors] = useState({
    financial_year: null,
    effective_month:null
    // shiftList_id:null,
  });
  const [decList, setDecList] = useState();
  const [requiredFields] = useState([
    "financial_year",
    "effective_month"
  ]);

  const [showPassword, setShowPassword] = useState(false);
  const [releiving_date, setreleiving_date] = useState('');
  const [relievingDateEnabled, setRelievingDateEnabled] = useState(false);
  const [appAccessEnabled, setAppAccessEnabled] = useState(true);
  const customFetch = useCustomFetch();



  const handleAddDeduction = () => {
    setDeductions([...deductions, { type: '', name: '', amount: '', deduction_filename: '' }]);
  };

  const handleDeductionChange = (index, field, value) => {
    const updatedDeductions = deductions.map((deduction, i) =>
      i === index ? { ...deduction, [field]: value } : deduction
    );
    setDeductions(updatedDeductions);
  };

  const handleRemoveDeduction = (index) => {
    setDeductions(deductions.filter((_, i) => i !== index));
  };

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


  const handleChangeEmployeeName = (val) => {
    setValue1(val)
    if (val?.length > 0) {
      setUserselectError('');
    }
    if (val?.length > 0) {
      setFormErrors({ ...formErrors, empName: null })
    }

  }



  // console.log('sdfweretr',formErrors.password)

  const [events, setEvents] = useState([
    { eventName: null, eventDate: null, event_id: null },
  ]);

  // console.log('eventsssss', events)

  const deleteEvent = (index) => {
    const obj = events.filter(d => d !== events[index]);
    setEvents(obj)
  }


  const addEvent = () => {
    setEvents([...events, { eventName: '', eventDate: null }]);
  };

  const handleEventChange = (index, field, value) => {
    const updatedEvents = [...events];
    updatedEvents[index][field] = value;
    setEvents(updatedEvents);

    // Validate the Event Name and Event Date fields
    if (!value) {
      setFormErrors({
        ...formErrors,
        [index]: 'This field is required',
      });
    } else {
      const updatedFormErrors = { ...formErrors };
      delete updatedFormErrors[index];
      setFormErrors(updatedFormErrors);
    }
  };


  const [editrequiredFields] = useState([
    'first_name',
    'gender',
    'phone_number',
    'email',
    // 'address',
    // 'area',
    // 'zip',
    // 'state',
    // 'city',
    'role_id',
    'location_id',
    'department_id',
    'bike_name',
    'mileage',
    'model',
    'dl_number',
    'employeeId',
    'designation',
    'category_id',
    // 'designation_id'
    // 'transaction_type',
    // 'bank_name',
    // 'beneficiary_account_no',
    // // 'ifsc_code',
    // 'shiftList_id',
    'uan_number',
    'esi_number'
  ]);
  const [salesmanrequired] = useState([
    'first_name',
    'gender',
    'phone_number',
    'email',
    // 'address',
    // 'area',
    // 'zip',
    // 'state',
    // 'city',
    'username',
    'password',
    'role_id',
    'location_id',
    'bike_name',
    'mileage',
    'model',
    'dl_number',
    'expiry_date',
    'employeeId',
    'department_id',
    'designation',
    // 'transaction_type',
    // 'bank_name',
    // 'beneficiary_account_no',
    // 'ifsc_code',
  ])
  const [validRegex, setValidRegex] = useState({
    email: false,
    phone_number: false,
    password: false,
    bankAccountNumber: false,
    ifscCodeNumber: false,
    dobValid: false,
    esiNumber: false,
    uan_number: false
  });
  const [editvalidRegex, seteditValidRegex] = useState({
    email: false,
    phone_number: false,
    bankAccountNumber: false,
    ifscCodeNumber: false,
    dobValid: false
  });
  const [unvalidRegex, setUnValidRegex] = useState({
    alternate_phone_number: true,
  });
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [unchangeform, setForm] = useState(false);
  const [initialState, setInitialState] = useState({});
  const [initialErrorState, setInitislErrorState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [ltaopen, setLtaOpen] = useState(false)
  const [pwdRequiste, setPWDRquisite] = useState(false);
  const [checks, setChecks] = useState({
    capsLetterCheck: false,
    numberCheck: false,
    removeSpace: true,
    pwdLengthCheck: false,
    specialCharCheck: false,
  });
  // const userRole = useSelector((state) => state.UserRoleReducer.userRole)
  // const eventName = useSelector((state) => state.UserRoleReducer.userRole)
  const {
    UserRoleReducer: { userRole, eventName, designation },
    ShiftsReducer: { employeeCategoryList },
    UserCreationReducer: { searchUserCreationData },

    attendanceReducer: { get_empbasecompanyform, searchCompanyBasedEmployeeFilter, getCompanyBasedEmployeeFilter },
  } = useSelector((state) => state);
  const stocklocation = useSelector((state) => state.stockLocationReducer?.allliststocklocation)
  const tempinit = useRef(null);
  const tempinitform = useRef(null);
  const tempsubmitaction = useRef(null);
  const tempStatus = useRef(null);
  const [token, setToken] = useState('');
  const dispatch = useDispatch();
  const [concate, setconcate] = useState('')
  const [name, setUserName] = useState(null)
  const [changedForm, setChangedForm] = useState(false);
  const [isLoadingLocationData, setIsLoadingLocationData] = useState(false);
  const [disabledFields, setDisabledFields] = useState(['department_id']);


  const bank_acc_no = searchUserCreationData?.map((acc) => {
    return acc.beneficiary_account_no
  })

  const currentYear = new Date().getFullYear();
  const financialYears = [];
  for (let i = 0; i < 5; i++) {
    const startYear = currentYear + i;
    const endYear = startYear + 1;
    financialYears.push(`${startYear}-${endYear}`);
  }
  const Month = [1,2,3,4,5,6,7,8,9,10,11,12]






  const {
    appConfigReducer: { getprefix_data, app_config_data }, ShiftsReducer: { shiftList }, UserCreationReducer: { departmentList, bankTransactionType }
  } = useSelector((state) => state);

  // console.log("formValues",formValues)

  const [enableLiveLocation, setEnableLiveLocation] = useState(false)
  const [gpsAttendance, setGpsAttendance] = useState(false)
  const [enableWorkFromHome, setEnableWorkFromHome] = useState(false)
  const [enableSelfieAttendance, setSelfieAttendance] = useState(false)
  const [pf, setPf] = useState(false)
  const [esi, setEsi] = useState(false)
  const [enableFaceAttendance, setFaceAttendance] = useState(false)
  const [enableManualAttendance, setEnableManualAttendance] = useState(false)
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
    selectData, setselectData
  } = useContext(CreateNewButtonContext);

 


  // console.log("enableWorkFromHome",enableWorkFromHome)
  useEffect(() => {

  }, [app_config_data])



  const handleChangeRestriction = (e) => {
    // setChangedForm(true);
    let { name, checked } = e.target;
    // console.log('sdffere', name, checked)
    if (e.target.checked === true) {
      setFormValues({ ...formValues, [name]: 1 });
    } else {
      setFormValues({ ...formValues, [name]: 0 });
    }
  }

  // console.log('asdfwewads',formValues.enableLiveLocation)

  const validClose = () => {
    setDialog(true);
  };
  const initform = () => {
    setInitialState(formValues);
    setInitislErrorState(formErrors);
    requestForToken(() => { }, setToken);
  };
  tempinitform.current = initform;
  useEffect(() => {
    tempinitform.current();
    const body = {
      newUser: 'newUser'
    }
    {userRole?.length === 0 && dispatch(userCreationPaginationAction(body))}
  }, []);

  const inits = () => {
    if (JSON.stringify(initialState) !== JSON.stringify(formValues)) {
      setDirty();
      setForm(true);
    } else {
      setPristine();
      setForm(false);
    }
  };

  tempinit.current = inits;
  useEffect(() => {
    tempinit.current();
  }, [formValues, initialState, props.open]);

  useEffect(() => {
    if (!get_empbasecompanyform.length) {
      dispatch(getEmpbasecompanyFormAction())
    }
  }, [])

  useEffect(() => {
    console.log(props,'props');
    
    if (props?.edit == 'true') {
      let editsdata = { ...props?.editData };
      delete editsdata.tabledata;
      // delete editsdata.Locations_name;
      // delete editsdata.Departments_name;

      // console.log("sfsf",editsdata)
      let location_id = props?.edit_id_data?.Locations_name?.filter(
        (d) => d.username === props.edit_id_data.username
      ) || [];

      console.log('location_id', props,location_id)
      // console.log("asda",props.edit_id_data?.Departments_name)

      if (location_id?.length > 0 || props.edit_id_data?.Departments_name?.length > 0) {
        let primary_locationdata = location_id.filter((f) => f.location_id == props.edit_id_data?.primary_location)

        console.log('primary_locationdata', primary_locationdata[0])
        setFormValues({
          ...editsdata,
          location_id: location_id.length > 0 ? location_id : [],
          primary_location: primary_locationdata[0],
          department_id: props.edit_id_data?.Departments_name.length > 0 ? props.edit_id_data?.Departments_name : [],
        });
      } else {
        setFormValues(editsdata);
      }


      seteditValidRegex({ phone_number: true, email: true });
      setRelievingDateEnabled(true);

      // Set your events data

      if (props.edit_id_data?.Events.length) {
        setEvents([...props.edit_id_data.Events]);
      }

    }
  }, [props.edit_id_data, props.status]);

  // console.log('propsddd', props.edit_id_data?.Events)

  const handleChange = async (e) => {
    // setChangedForm(true);

    console.log('esi_numberesi3242_number')

    let { name, value } = e.target;
    setStateHandler(name, value);

    if (name === 'username' && value.length > 0) {
      const final = getprefix_data[0]?.value;
      const second = value
      const setda = `your user name : "${final}` + '.' + `${second}"`
      setconcate(setda)
      setUserName(final + '.' + second)
    }
  };

  console.log('dfasfsd', props?.data)

  const cancel = () => {
    setDialog(false);
  };
  // console.log("sddsf",formValues,formErrors)
  const setStateHandler = async (name, value) => {
    let formObj = {};
    formObj = {
      ...formValues,
      [name]: value === '' ? null : value,
    };
    await setFormValues(formObj);

    validationHandler(name, value);
  };

  const validationHandler = (name, value) => {

    if (!Object.keys(formErrors).includes(name)) return;
    if (

      requiredFields.includes(name) &&
      (value === null ||
        value === 'null' ||
        value === '' ||
        value === false ||
        (Object.keys(value) && value.value === null))
    ) {

      setFormErrors({
        ...formErrors,
        [name]: capitalize(name.replace(/_/g, ' ')) + ' is Required!',
      });

    }

    else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  // console.log('sdfsdfg',formErrors.zip)
  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };



  const handleNext = () => {
    if (value < 2) {
      setValue(value + 1);
    }
  };

  const handlePrevious = () => {
    if (value > 0) {
      setValue(value - 1);
    }
  };

  const handleFirstTabChange = async () => {
    let isValid = true;
    let formErrorsObj = { ...formErrors };

    // Validate fields from first_name to email
    const fieldsToValidate = ["financial_year","effective_month"];

    fieldsToValidate.forEach(key => {
      if (
        (requiredFields.includes(key)) &&
        (formValues[key] === null || formValues[key] === '' ||
          formErrors[key] !== null ||
          (typeof formValues[key] === 'object' && formValues[key].length === 0))
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      }



    });
    if (storage?.role_name !== 'Employee' && value1?.length === 0 || value1 === null || !value1) {
      setUserselectError('Employee is required');
      isValid = false;    
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
      return
    } else {
      setUserselectError('');
    }
    // console.log("formErrorsObj", formErrorsObj)
    await setFormErrors(formErrorsObj);
    // console.log("Validation status:", formValues?.taxRegime, value1?.length, formValues?.financial_year); 
    // console.log("Form errors:", formErrorsObj); 
    if (formValues?.taxRegime && value1?.length && formValues?.financial_year && formValues?.effective_month) {
      let body = {
        employee_id: value1[0]?.employee_id,
        year: formValues?.financial_year,
        regime: formValues?.taxRegime
      };
      const { data: productData } = await customFetch(
        API_URLS.CHECK_INCOME_TAX_EXIST,
        'POST',
        body
      );
      // console.log(productData, value1[0], value, 'ivanda');
      if (productData?.length && !props.edit) {
        setFormErrors({
          ...formErrors,
          ['financial_year']: 'Already have TDS on this Year'
        });
        isValid = false;
        return
      }
      else {
        setFormErrors({
          ...formErrors,
          ['financial_year']: null
        });
      }
    }
    if (isValid && value < 2 && formValues.taxRegime == 1) {
      setValue(value + 1);
    }
    else{
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
  };

  const handleSecondTabChange = async () => {
    let isValid = true
    let formErrorsObj = { ...formErrors };

    const fieldsToValidate = [];


    fieldsToValidate.forEach(key => {
      if (
        (requiredFields.includes(key)) &&
        (formValues[key] === null || formValues[key] === '' ||
          formErrors[key] !== null ||
          (typeof formValues[key] === 'object' && formValues[key].length === 0))
      ) {
        isValid = false;
      }

    });

    await setFormErrors(formErrorsObj);
    if (isValid && value < 2) {
      setValue(value + 1);
    }

  };
  const handleFourthTabChange = async () => {
    setValue(value + 1);
  }

  const handleThirdTabChange = async () => {
    let isValid = true;
    if (isValid && value < 3) {
      setValue(value + 1);
    }
  }

  const isSingleDepartment = userRole.some(
    (role) => role.role_id === formValues.role_id && role.Department === "EnabledWithSingleDepartment"
  );

  const isMultipleDepartments = userRole.some(
    (role) => role.role_id === formValues.role_id && role.Department === "EnabledWithMultipleDepartments"
  );
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('1');
    let formdata = new FormData();    
    images.forEach((v, i) => {
      const modifiedName = v.name;
      const file = v.file;
      console.log("VALUE", modifiedName, file)

      if (file && file instanceof File) {
        const modifiedFile = new File([file], modifiedName, { type: file.type });

        formdata.append("images", modifiedFile);
      } else {
        console.error(`File is missing or invalid for image index ${i}`);
      }
    });

    setChangedForm(true);

    let isValid = true;
    let formErrorsObj = { ...formErrors };

    // Iterate over form values
    await Object.keys(formValues).map((key, i) => {
      if (
        (requiredFields.includes(key) &&
          (formValues[key] === null || formValues[key] === '' ||
            formErrors[key] !== null ||
            (typeof formValues[key] === 'object' && formValues[key].length === 0)))
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';

      }

      return null;
    });
    let body = {
      employee_id: value1[0]?.employee_id,
      year: formValues?.financial_year,
      //regime: formValues?.taxRegime === "old" ? 1 : 2
    };
     const { data: productData } = await customFetch(
        API_URLS.CHECK_INCOME_TAX_EXIST,
        'POST',
        body
      );
    // console.log(productData, value1[0], value, 'ivanda');
    if (productData?.length && !props.edit) {
      setFormErrors({
        ...formErrors,
        ['financial_year']: 'Already have TDS on this Year'
      });
      isValid = false;
      return
    }
    else {
      setFormErrors({
        ...formErrors,
        ['financial_year']: null
      });
    }
    await setFormErrors(formErrorsObj);
    console.log('2',isValid,formValues?.financial_year,formErrors);
    // if (isValid) {
    console.log('3');


      const {
        financial_year,
        rent_paid_landlord,
        permanent_borrowing_num,
        address_borrowing_lender_name,
        deduction_borrowing_lender_name,
        interest_paid_lender,
        travel_concessions,
        address_landlord,
        name_landlord,
        lta_filename,
        hra_filename,
        ib_filename,
        deduction_filename,
        taxRegime,
        effective_month

      } = formValues;

      let employee_id = storage?.role_name == 'Employee' ? storage?.employee_id : value1[0].employee_id
      let formDatas = {
        financial_year,
        rent_paid_landlord,
        permanent_borrowing_num,
        address_borrowing_lender_name,
        deduction_borrowing_lender_name,
        interest_paid_lender,
        travel_concessions,
        address_landlord,
        name_landlord,
        emp: employee_id,
        deductions,
        lta_filename,
        edit: props?.edit,
        form12bb_id: props?.editData?.form12bb_id,
        hra_filename,
        ib_filename,
        deduction_filename,
        taxRegime,
        effective_month
      };
      formdata.append("data", JSON.stringify(formDatas));
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(CreateForm12(formdata)),
        // dispatch(ListForm12BB())
      )
      props.handleClose()
      console.log('submit', getTrimmedData(formdata))
    // }
  };




  const handleOnFocus = () => {
    setPWDRquisite(true);
  };

  const handleOnBlur = () => {
    setPWDRquisite(false);
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleToggleChange = () => {
    setAppAccessEnabled(!appAccessEnabled)
    apiCalls(
      dispatch(enableDisableEmpLoginAction({
        employee_id: formValues?.employeeId,
        app_access: !appAccessEnabled
      }
      ))
    )
  };

  console.log(formValues, 'formValuesformValues')

  const handleRoleChange = (event, newValue) => {
    const isAdmin = newValue?.role_name === 'Admin';
    console.log('l', isAdmin);
    setFormValues({
      ...formValues,
      role_id: newValue === null ? null : newValue.role_id,
      role_name: newValue === null ? null : newValue.role_name,
      department_id: isAdmin ? null : null,
    });
    console.log('l', isAdmin, formValues, newValue?.role_name);
    if (newValue?.role_name === "Administrator") {
      setFormErrors({
        ...formErrors,
        ['category_id']: null
      });
    }
    console.log('l', isAdmin, formErrors, newValue?.role_name);
    if (newValue !== null) {
      setFormErrors({
        ...formErrors,
        ['role_id']: null
      });
    }
    if (newValue === null) {
      setFormErrors({
        ...formErrors,
        ['role_id']: 'User Role is required'
      });
    }
    if (userRole.some(role => role?.role_id === newValue?.role_id && role.Department === "Disabled")) {
      setFormErrors({
        ...formErrors,
        ['department_id']: null, ['role_id']: null
      });
    }

    // console.log(formValues.role_id,formErrors.department_id,'test');
    // validationHandler('role_id', newValue === null ? null : newValue.role_id);
  };
  console.log(formValues, 'hhhhh')

  const handleOnKeyUp = (e) => {
    const { value } = e.target;
    const capsLetterCheck = /[A-Z]/.test(value);
    const numberCheck = /[0-9]/.test(value);
    const pwdLengthCheck = value.length >= 6;
    const specialCharCheck = /[!@#$%^&*]/.test(value);
    const removeSpace = /\s/g.test(value);
    setChecks({
      capsLetterCheck,
      numberCheck,
      pwdLengthCheck,
      removeSpace,
      specialCharCheck,
    });
    if (pwdLengthCheck && !removeSpace) {
      setPWDRquisite(false)
    }
    else {
      setPWDRquisite(true)
    }
  };

  // const dublicateRole = props.userRole?.filter((d) => (d.role_name,d.role_id)) || []

  // const shiftValue = shiftList.filter((f) => f.id === formValues.shiftList_id)[0].shift_name
  const keyPress = (e) => {
    if (e.key == "m") {
      setFormValues({ ...formValues, gender: 1 })
    }
    if (e.key == "f") {
      setFormValues({ ...formValues, gender: 2 })
    }
    if (e.key == "o") {
      setFormValues({ ...formValues, gender: 0 })
    }
    //console.log(e,'kk');
  }

  console.log(props, 'newUserProps')

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  function get_url_extension(url) {
    return url?.split(/[#?]/)[0]?.split('.')?.pop()?.trim();
  }


  console.log("value", value)
  const handleChange1 = async(event, newValue) => {
   if (formValues?.taxRegime && value1?.length && formValues?.financial_year) {
      let body = {
        employee_id: value1[0]?.employee_id,
        year: formValues?.financial_year,
        //regime: formValues?.taxRegime === "old" ? 1 : 2
      };
       const { data: productData } = await customFetch(
        API_URLS.CHECK_INCOME_TAX_EXIST,
        'POST',
        body
      );
      console.log(productData, value1[0], value, 'ivanda');
      if (productData?.length && !props.edit) {
        setFormErrors({
          ...formErrors,
          ['financial_year']: 'Already have TDS on this Year'
        });
        return
      }
      else {
        setFormErrors({
          ...formErrors,
          ['financial_year']: null
        });
      }
    }
    setValue(newValue);
  };

  function encodeImageFileAsURL(name, element) {
    let file = element.target.files[0];
    if (!file) return;
    // var name = element.target.files[0].name;
    let fileName = `${uuidv4()}.${get_url_extension(file?.name)}`;
    let data = {
      name: fileName,
      file: file
    }
    console.log("DATA", data)

    var reader = new FileReader();
    reader.onloadend = function () {
      setFormValues({ ...formValues, [name]: fileName });
      data.url = reader.result;
      setImages((prev) => [...prev, data])
    };
    reader.readAsDataURL(file);
  }

  function mutipleencodeImageFileAsURL(element) {
    let file = element.target.files[0];
    console.log("INDEXXX", element, imgIndex);
    if (!file) return;
    let index = imgIndex;

    // var name = element.target.files[0].name;
    let fileName = `${uuidv4()}.${get_url_extension(file?.name)}`;
    let data = {
      name: fileName,
      file: file
    }
    console.log("DATA", data)

    var reader = new FileReader();
    reader.onloadend = function () {
      let arr = [...deductions]
      arr[index].lta_filename = fileName;
      setDeductions(arr);
      data.url = reader.result;
      setImages((prev) => [...prev, data])
    };
    reader.readAsDataURL(file);

  }


  function deleteFile(e) {
    setFormValues({ ...formValues, lta_filename: null });
    setImgName('');
    //setImgType(null);/
    setOpen(false);
  }
  function deleteInterestFile(e) {
    setFormValues({ ...formValues, hra_filename: null });
    setinterestImgName('');
    //setImgType(null);
    setInterestOpen(false);
  }
  function deleteDeductionFile(e) {
    setFormValues({ ...formValues, ib_filename: null });
    setDeductionimgName('');
    //setImgType(null);
    setDeductionOpen(false);
  }
  function deleteLtaFile(e) {
    setFormValues({ ...formValues, deduction_filename: null });
    //setImgType(null);
    setDeductionOpen(false);
  }

  const getImgUrl = useCallback((name) => {
    let val = images?.find(x => x?.name == name);
    return val?.url ?? '';
  }, [images]);

  useEffect(() => {
    // Check if the form is in edit mode (if props.editData is available)
    if (props.edit) {
      const {
          start_year,
          end_year,
          rent_paid,
          landlord_name,
          landlord_address,
          travel_amount,
          lender_name,
          interest_paid,
          deduction,
          processedFiles,
          employee_id,
          lender_address,
          tax_regime,
          images
      } = props.editData;
      setValue1(get_empbasecompanyform?.filter((v) => v.employee_id === employee_id));

      console.log("processedFiles:",props.editData, processedFiles);
  
      // Extract filenames from processedFiles
      const ltaFiles = images?.lta_images || [];
      const hraFiles = images?.hra_images || [];
      const ibFiles = images?.ib_images || [];
      const deductionFiles = images?.deduction_images || [];
  
      // Set form values
      setFormValues({
          taxRegime: tax_regime,
          financial_year: `${start_year}-${end_year}`,
          rent_paid_landlord: rent_paid,
          permanent_borrowing_num: '',
          address_borrowing_lender_name: lender_address,
          deduction_borrowing_lender_name: lender_name,
          interest_paid_lender: interest_paid,
          travel_concessions: travel_amount,
          address_landlord: landlord_address,
          name_landlord: landlord_name,
          lta_filename: ltaFiles,
          hra_filename: hraFiles,
          ib_filename: ibFiles,
          deduction_filename: deductionFiles,
      });
  
      // Properly map deductions
      const formattedDeductions = deduction.map((ded) => ({
          type: ded.deduction_type || '',
          name: ded.deduction_name || '',
          amount: ded.amount || 0,
          deduction_filename: deductionFiles, // Assign relevant file
      }));
      setDeductions(formattedDeductions);
  
      // Set employee data
  }
  
  }, [props.editData,get_empbasecompanyform]);
  useEffect(() => { (async () => {
    const fetchDeducList = async () => {
      try {
        const response = await customFetch(
          API_URLS.GET_DEDUCTION_LIST,
          'GET'
        );
        const data = response.data;
  
        if (value === 4 && formValues.taxRegime == 1) {
          setDecList(data);
        } else {
          setDecList(data?.filter((v) => v.id === 7));
        }
      } catch (error) {
        console.error('Error fetching deduction list:', error);
      }
    };
  
    fetchDeducList();
  })();
}, [value, formValues.taxRegime]);
  
  console.log(formValues, props.editData, "IMAGESSSSS")

  const handleFileUpdate = (index, updatedFile) => {
    console.log("updatedFile",updatedFile);
    
    setDeductions((prevDeductions) => {
      const updatedDeductions = [...prevDeductions]; // Clone the current deductions array
      updatedDeductions[index] = { // Update the specific deduction at `index`
        ...updatedDeductions[index], // Keep other fields intact
        deduction_filename: updatedFile, // Update only the filename
      };
      console.log("updatedDeductions",updatedDeductions);

      return updatedDeductions;
      
    });
  };

  const handleImageDelete = (index) => {
    console.log("indexdsfdsf",index);
    
  };
  console.log("deductionsdeductions",formValues.hra_filename);
  
  return (
    <>
      {/* <Box sx={{ position: 'relative', height: '100%', minHeight: '100vh'  }}> */}
      {/* <AppHeader hidden={false} /> */}
      {Prompt}
      {/* <Typography className='page-title' variant='h6' align='left' style={{ paddingBottom: '20px' }}>
        {props.open === undefined ? props.status === 'create' ? `New User` : 'Update User' : ''}
      </Typography> */}
      <Card sx={{ p: '10px', width: '100%', height: 'calc(100vh - 80px) !important', minHeight: '100%',overflow: 'auto' }}>
    {formValues.taxRegime == '1' && <Tabs value={value} onChange={handleChange1} aria-label="tabs example">
      <Tab icon={<DisplaySettingsSharpIcon />} label="General" value={0} />
      <Tab icon={<CottageRoundedIcon />} label="HRA" value={1} />
      <Tab icon={<ConnectingAirportsSharpIcon />} label="LTA" value={2} />
      <Tab icon={<ReceiptOutlinedIcon />} label="Interest Borrowing" value={3} />
      <Tab icon={<AccountBalance />} label="Deduction" value={4} />
    </Tabs>}
    {formValues.taxRegime == '2' && <Tabs value={value} onChange={handleChange1} aria-label="tabs example">
      <Tab icon={<DisplaySettingsSharpIcon />} label="General" value={0} />
      {/* <Tab icon={<AccountBalance />} label="Deduction" value={4} /> */}
    </Tabs>}

    {value === 0 && (
      <div>
        {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ mt: '13px' }}> */}
          <Grid
            container
            // style={{paddingTop: '10px'}}
            spacing={5}
            sx={{ mt: '13px' }}
            direction='row'
          >
            {storage?.role_name !== 'Employee' && !props.edit && <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <CommonUserAutoCompleteForSingleUser
                error={userSelectError}
                searchVal={searchValEmployeeFilter}
                setSearchValEmployeeFilter={setSearchValEmployeeFilter}
                requestSearch={requestSearchEmployeeFilter}
                value={value1[0]}
                setValue={(d) => {
                  handleChangeEmployeeName([d])
                }}
                type={get_empbasecompanyform}
                searchType={searchCompanyBasedEmployeeFilter}
                labelName="Select Employee"
                isMandatory={true}
              />
            </Grid>}

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <FormControl fullWidth variant="filled" error={formErrors.financial_year ? true : false}>
                <InputLabel id="financial-year-label">Financial Year</InputLabel>
                <Select
                  labelId="financial-year-label"
                  id="financial-year"
                  name="financial_year"
                  value={formValues.financial_year || ''}
                  onChange={handleChange}
                  onBlur={handleChange}
                  label="Financial Year"
                  required
                >
                  {financialYears.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.financial_year && (
                  <FormHelperText>{formErrors.financial_year === 'Already have TDS on this Year' ? formErrors.financial_year : 'Financial year is Required'}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <FormControl fullWidth variant="filled" error={formErrors.effective_month ? true : false}>
                <InputLabel id="financial-year-label">Effective Month</InputLabel>
                <Select
                  labelId="effective_month"
                  id="effective_month"
                  name="effective_month"
                  value={formValues.effective_month || ''}
                  onChange={handleChange}
                  onBlur={handleChange}
                  label="Effective Month"
                  required
                >
                  {Month.map((month) => (
                    <MenuItem key={month} value={month}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.effective_month && (
                  <FormHelperText>{'Effective Month is Required'}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <FormControl component="fieldset" sx={{ display: 'flex', alignItems: 'start' }}>
                <ToggleButtonGroup
                  value={formValues.taxRegime}
                  exclusive
                  onChange={(e, newValue) => setFormValues({ ...formValues, taxRegime: newValue })}
                  aria-label="Tax Regime"
                  // sx={{ marginTop: 2 }}
                >
                  <CustomToggleButton value= {1} aria-label="Old Tax Regime">Old Regime</CustomToggleButton>
                  <CustomToggleButton value= {2} aria-label="New Tax Regime">New Regime</CustomToggleButton>
                </ToggleButtonGroup>
              </FormControl>
            </Grid>
                     </Grid>
          <Grid
            container
            spacing={2}
            justifyContent="flex-end"
            sx={{ mt: 3, paddingRight: '25px', paddingTop: '70px' }}
          >

              <Grid>
                {unchangeform === false ? (
                  <Button
                    onClick={() => props.handleClose()}
                    style={{}}
                    name='Cancel'
                    variant='contained'
                    color='secondary'
                    size='medium'
                    text='button'
                    fullWidth={false}
                    type='cancel'
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    onClick={() => validClose()}
                    style={{}}
                    name='Cancel'
                    variant='contained'
                    color='secondary'
                    size='medium'
                    text='button'
                    fullWidth={false}
                    type='cancel'
                  >
                    Cancel
                  </Button>
                )}
              </Grid>

              <Grid>
              {formValues.taxRegime == '2' ? (<Button
                  onClick={handleSubmit}
                  style={{}}
                  name='submit'
                  variant='contained'
                  color='primary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  type='submit'
                >
                  Submit
                </Button>):(
                <Button
                  onClick={handleFirstTabChange}
                  style={{}}
                  name='Next'
                  variant='contained'
                  color='primary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  type='next'
                >
                  Next
                </Button>)}
              </Grid>
              
            {/* </Box> */}

        </Grid>
      </div>
    )}
    {value === 1 && (
      <div>
        <Grid
          sx={{ mt: '13px' }}
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid
            container
            // style={{paddingTop: '10px'}}
            spacing={3}
            direction='row'
          >


            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                onChange={handleChange}
                onBlur={handleChange}
                style={{}}
                fullWidth={true}
                placeholder='Rent Paid landlord'
                label='Rent Paid landlord'
                name='rent_paid_landlord'
                value={formValues.rent_paid_landlord === null ? '' : formValues.rent_paid_landlord}
                color='primary'
                type='text'
                regex=''
                variant='filled'
              // error={formErrors.last_name === null ? false : true }
              // helperText={formErrors.last_name === null ? '' : formErrors.last_name }
              />
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                name='name_landlord'
                label='Name of the landlord'
                multiline={true}
                placeholder='Name of the landlord'
                //   rows={2}
                value={formValues.name_landlord === null ? '' : formValues.name_landlord}
                variant='filled'
                // required={true}
                onChange={handleChange}
                onBlur={handleChange}
              // error={formErrors.address === null ? false : true}
              // helperText={formErrors.address === null ? '' : 'Address is required!'}
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                name='address_landlord'
                label='Address of the landlord'
                multiline={true}
                placeholder='Address of the landlord'
                rows={1}
                value={formValues.address_landlord === null ? '' : formValues.address_landlord}
                variant='filled'
                // required={true}
                onChange={handleChange}
                onBlur={handleChange}
              // error={formErrors.area === null ? false : true}
              // helperText={formErrors.area === null ? '' : 'Area is required!'}
              />
            </Grid>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
                  <AttachmentField
                    previews={formValues.hra_filename}
                    setPreviews={(updatedValue) => {
                      const updatedPreviews =
                        typeof updatedValue === "function"
                          ? updatedValue(formValues.hra_filename || [])
                          : updatedValue;
                    
                      console.log("Updated Previews:", updatedPreviews);
                    
                      setFormValues((prev) => ({
                        ...prev,
                        hra_filename: updatedPreviews,
                      }));
                    }}
                    status={1}
                    // handleImageDelete={handleImageDelete}
                  />
                </Grid>

              <Grid
                container
                spacing={2}
                justifyContent="flex-end"
                sx={{ mt: 3, paddingRight: '25px', paddingTop: '70px' }}
              >


              <Grid>
                {unchangeform === false ? (
                  <Button
                    onClick={() => props.handleClose()}
                    style={{}}
                    name='Cancel'
                    variant='contained'
                    color='secondary'
                    size='medium'
                    text='button'
                    fullWidth={false}
                    type='cancel'
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    onClick={() => validClose()}
                    style={{}}
                    name='Cancel'
                    variant='contained'
                    color='secondary'
                    size='medium'
                    text='button'
                    fullWidth={false}
                    type='cancel'
                  >
                    Cancel
                  </Button>
                )}
              </Grid>
              <Grid>
                <Button
                  onClick={handlePrevious}
                  style={{}}
                  name='Prev'
                  variant='contained'
                  color='primary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  type='prev'
                >
                  Prev
                </Button>
              </Grid>

              <Grid>
                <Button
                  onClick={handleSecondTabChange}
                  style={{}}
                  name='Next'
                  variant='contained'
                  color='primary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  type='next'
                >
                  Next
                </Button>
              </Grid>
            </Grid>
            {/* </Box> */}

          </Grid>
        </Grid>
      </div>
    )}
    {value === 2 && (
      <div>
        <Grid
          sx={{ mt: '13px' }}
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid
            container
            // style={{paddingTop: '10px'}}
            spacing={3}
            direction='row'
          >
            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                name='travel_destination'
                label='Travel Destination'
                multiline={true}
                placeholder='Travel Destination'
                //   rows={2}
                value={formValues.travel_destination === null ? '' : formValues.travel_destination}
                variant='filled'
                // required={true}
                onChange={handleChange}
                onBlur={handleChange}
              // error={formErrors.address === null ? false : true}
              // helperText={formErrors.address === null ? '' : 'Address is required!'}
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                name='travel_concessions'
                label='Leave travel concessions'
                multiline={true}
                placeholder='Leave travel concessions'
                rows={1}
                value={formValues.travel_concessions === null ? '' : formValues.travel_concessions}
                variant='filled'
                // required={true}
                onChange={handleChange}
                onBlur={handleChange}
              // error={formErrors.area === null ? false : true}
              // helperText={formErrors.area === null ? '' : 'Area is required!'}
              />
            </Grid>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
                  <AttachmentField
                    previews={formValues.lta_filename}
                    setPreviews={(updatedValue) => {
                      const updatedPreviews =
                        typeof updatedValue === "function"
                          ? updatedValue(formValues.lta_filename || [])
                          : updatedValue;
                    
                      console.log("Updated Previews:", updatedPreviews);
                    
                      setFormValues((prev) => ({
                        ...prev,
                        lta_filename: updatedPreviews,
                      }));
                    }}
                    status={1}
                    // handleImageDelete={handleImageDelete}
                  />
                </Grid>

              <Grid
                container
                spacing={2}
                justifyContent="flex-end"
                sx={{ mt: 3, paddingRight: '25px', paddingTop: '70px' }}
              >


              <Grid>
                {unchangeform === false ? (
                  <Button
                    onClick={() => props.handleClose()}
                    style={{}}
                    name='Cancel'
                    variant='contained'
                    color='secondary'
                    size='medium'
                    text='button'
                    fullWidth={false}
                    type='cancel'
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    onClick={() => validClose()}
                    style={{}}
                    name='Cancel'
                    variant='contained'
                    color='secondary'
                    size='medium'
                    text='button'
                    fullWidth={false}
                    type='cancel'
                  >
                    Cancel
                  </Button>
                )}
              </Grid>
              <Grid>
                <Button
                  onClick={handlePrevious}
                  style={{}}
                  name='Prev'
                  variant='contained'
                  color='primary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  type='prev'
                >
                  Prev
                </Button>
              </Grid>
              <Grid>
                <Button
                  onClick={handleThirdTabChange}
                  style={{}}
                  name='Next'
                  variant='contained'
                  color='primary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  type='next'
                >
                  Next
                </Button>
              </Grid>
            </Grid>
            {/* </Box> */}

          </Grid>
        </Grid>
      </div>
    )}
    {value === 3 && (
      <div>
        <Grid
          sx={{ mt: '13px' }}
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid
            container
            // style={{paddingTop: '10px'}}
            spacing={3}
            direction='row'
          >

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                name='interest_paid_lender'
                label='Interest payable/paid to the lender'
                //multiline={true}
                placeholder='Interest payable/paid to the lender'
                //   rows={2}
                value={formValues.interest_paid_lender === null ? '' : formValues.interest_paid_lender}
                variant='filled'
                onChange={handleChange}
                onBlur={handleChange}
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                name='deduction_borrowing_lender_name'
                label='Name of the lender'
                multiline={true}
                placeholder='Name of the lender'
                value={formValues.deduction_borrowing_lender_name === null ? '' : formValues.deduction_borrowing_lender_name}
                variant='filled'
                onChange={handleChange}
                onBlur={handleChange}
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                name='address_borrowing_lender_name'
                label='Address of the lender'
                multiline={true}
                placeholder='Address of the lender'
                value={formValues.address_borrowing_lender_name === null ? '' : formValues.address_borrowing_lender_name}
                variant='filled'
                onChange={handleChange}
                onBlur={handleChange}
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                name='permanent_borrowing_num'
                label='Permanent Account Number or Aadhaar'
                placeholder='Permanent Account Number or Aadhaar'
                value={formValues.permanent_borrowing_num === null ? '' : formValues.permanent_borrowing_num}
                variant='filled'
                onChange={handleChange}
                onBlur={handleChange}
              />
            </Grid>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
                  <AttachmentField
                    previews={formValues.ib_filename}
                    setPreviews={(updatedValue) => {
                      const updatedPreviews =
                        typeof updatedValue === "function"
                          ? updatedValue(formValues.ib_filename || [])
                          : updatedValue;
                    
                      console.log("Updated Previews:", updatedPreviews);
                    
                      setFormValues((prev) => ({
                        ...prev,
                        ib_filename: updatedPreviews,
                      }));
                    }}
                    status={1}
                    handleImageDelete={handleImageDelete}
                  />
                </Grid>
              <Grid
                container
                spacing={2}
                justifyContent="flex-end"
                sx={{ mt: 3, paddingRight: '25px', paddingTop: '70px' }}
              >
              <Grid>
                {unchangeform === false ? (
                  <Button
                    onClick={() => props.handleClose()}
                    style={{}}
                    name='Cancel'
                    variant='contained'
                    color='secondary'
                    size='medium'
                    text='button'
                    fullWidth={false}
                    type='cancel'
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    onClick={() => validClose()}
                    style={{}}
                    name='Cancel'
                    variant='contained'
                    color='secondary'
                    size='medium'
                    text='button'
                    fullWidth={false}
                    type='cancel'
                  >
                    Cancel
                  </Button>
                )}
              </Grid>

              <Grid>
                <Button
                  onClick={handlePrevious}
                  style={{}}
                  name='Prev'
                  variant='contained'
                  color='primary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  type='prev'
                >
                  Prev
                </Button>
              </Grid>

              <Grid>
                <Button
                  onClick={handleFourthTabChange}
                  style={{}}
                  name='Next'
                  variant='contained'
                  color='primary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  type='next'
                >
                  Next
                </Button>
              </Grid>
            </Grid>
            {/* </Box> */}
          </Grid>
        </Grid>
      </div>
    )}
    {formValues.taxRegime !== '2' && value === 4 && (
      <div>
        {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ mt: '13px' }}> */}
          <Grid
            container
            spacing={3}
            direction='row'
          >
            {deductions?.map((deduction, index) => {
              console.log("DEDUCTION INDEX", index, deduction?.lta_filename)
              return (
                <>
                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 4,
                      xs: 12
                    }}>
                    <TextField
                      select
                      label="Type"
                      value={deduction.type}
                      onChange={(e) => handleDeductionChange(index, 'type', e.target.value)}
                      fullWidth
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                             height: '56px',
                            '& fieldset': {
                                borderColor: '#333', // Default border color
                            },
                            '&:hover fieldset': {
                                borderColor: '#555', // Hover border color
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#777', // Focused border color
                            },
                        },
                        
                     
                    }}
                    >
                      {decList?.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name} {/* Display name from API */}
                        </MenuItem>
                      ))}
                    </TextField>

                  </Grid>

                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 4,
                      xs: 12
                    }}>
                    <TextField
                      label="Name"
                      value={deduction.name}
                      onChange={(e) => handleDeductionChange(index, 'name', e.target.value)}
                      fullWidth
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                            height: '56px',
                            '& fieldset': {
                                borderColor: '#333', // Default border color
                            },
                            '&:hover fieldset': {
                                borderColor: '#555', // Hover border color
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#777', // Focused border color
                            },
                        },
                        
                    }}
                    />
                  </Grid>

                  <Grid
                    size={{
                      lg: 2,
                      md: 3,
                      sm: 3,
                      xs: 12
                    }}>
                    <TextField
                      label="Amount"
                      value={deduction.amount}
                      onChange={(e) => handleDeductionChange(index, 'amount', e.target.value)}
                      fullWidth
                      required
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                             height: '56px',
                            '& fieldset': {
                                borderColor: '#333', // Default border color
                            },
                            '&:hover fieldset': {
                                borderColor: '#555', // Hover border color
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#777', // Focused border color
                            },
                        },
                        
                        
                    }}
                    />
                  </Grid>
                  <Grid
                    size={{
                      lg: 10,
                      md: 10,
                      sm: 12,
                      xs: 12
                    }}>
                    <AttachmentField
                      previews={deductions[0].deduction_filename}
                      setPreviews={(updatedValue) => {
                        const finalUpdatedValue =
        typeof updatedValue === 'function' ? updatedValue(deductions[0].deduction_filename || []) : updatedValue;
                        console.log("Updated value:", finalUpdatedValue);
                        handleFileUpdate(0, finalUpdatedValue); // Pass the updated file to the correct deduction (index 0 in this case)
                      }}
                      status={1}
                      // handleImageDelete={handleImageDelete}
                    />
                  </Grid>

                  {index > 0 && <Grid
                    sx={{alignContent:'center'}}
                    size={{
                      lg: 1,
                      md: 2,
                      sm: 2,
                      xs: 6
                    }}>
                    <IconButton color="secondary" onClick={() => handleRemoveDeduction(index)}>
                      <RemoveIcon />
                    </IconButton>
                  </Grid>}
                  <Grid
                    sx={{alignContent:'center'}}
                    size={{
                      lg: 1,
                      md: 2,
                      sm: 2,
                      xs: 6
                    }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddDeduction}
                      color="primary"
                    >

                    </Button>
                  </Grid>

                </>
              );
            }
            )}
          </Grid>
          
          <Grid
            container
            spacing={2}
            justifyContent="flex-end"
            sx={{ mt: 3, paddingRight: '25px', paddingTop: '70px' }}
          >

              <Grid>
                {unchangeform === false ? (
                  <Button
                    onClick={() => props.handleClose()}
                    style={{}}
                    name='Cancel'
                    variant='contained'
                    color='secondary'
                    size='medium'
                    text='button'
                    fullWidth={false}
                    type='cancel'
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    onClick={() => validClose()}
                    style={{}}
                    name='Cancel'
                    variant='contained'
                    color='secondary'
                    size='medium'
                    text='button'
                    fullWidth={false}
                    type='cancel'
                  >
                    Cancel
                  </Button>
                )}
              </Grid>

              <Grid>
                <Button
                  onClick={handlePrevious}
                  style={{}}
                  name='Prev'
                  variant='contained'
                  color='primary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  type='prev'
                >
                  Prev
                </Button>
              </Grid>

              <Grid>
                <Button
                  onClick={handleSubmit}
                  style={{}}
                  name='submit'
                  variant='contained'
                  color='primary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  type='submit'
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
            {/* </Box> */}


        {/* </Grid> */}
      </div>
    )}

    </Card>
      <CancelDialog
        handle={cancel}
        delete={dialog}
        close={() => props.handleClose()}
      ></CancelDialog>
      {loader && <SimpleBackdrop loader={loader} />}
      {/* </Box> */}
    </>
  );
}

export default NewForm12BB;