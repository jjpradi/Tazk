import React, {useState, useEffect, useRef, useContext} from 'react';
import _ from 'lodash';
import {Country} from './Country_list';
import UnSavedChangesWarning from '../pages/common/unChangeswarning/index';
import CancelDialog from './CancelDialog';
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
  Dialog,
} from '@mui/material';
import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
import {Cities} from '../utils/cities';
import {getTrimmedData} from './trimFunction/index';
import {
  emailValidation,
  phoneValidation,
  passwordValidation,
  PWDRequisite,
  lanValidation,
  ifscValidation,
  bankAccountValidation,
  empIdValidation,
  dobValidation,
  esiValidation,
  uanValidation,
  accountNoValidation,
} from './regexFunction/index';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import './NewUser.css';
import {getLocationDataBasedOnPincode} from '../components/common';
import axios from 'axios';
import {requestForToken} from '../firebase/firebase.service';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import SimpleBackdrop from 'pages/common/Loader';
import moment from 'moment';
import {
  getAppConfigDataAction,
  getprefixAction,
} from '../../src/redux/actions/app_config_actions';
import {useDispatch, useSelector} from 'react-redux';
import AppHeader from '@crema/core/AppLayout/DefaultLayout/AppHeader';
import {
  getShiftListAction,
  listEmployeeCategoryAction,
} from 'redux/actions/shifts.actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {
  getEventNameAction,
  getUserRoleAction,
} from 'redux/actions/userRole_actions';
import {allListStockLocation} from 'redux/actions/stock_Location_actions';
import {getsessionStorage} from 'pages/common/login/cookies';
import {ProperCaseFunc} from 'utils/properCase';
import {
  bankTransactionTypeAction,
  departmentListAction,
  getReportingManagerAction,
  userCreationPaginationAction,
} from 'redux/actions/userCreation_actions';
import {enableDisableEmpLoginAction} from 'redux/actions/userCreation_actions';
import {Visibility, VisibilityOff} from '@mui/icons-material';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalance from '@mui/icons-material/AccountBalance';
import WidgetsIcon from '@mui/icons-material/Widgets';
import {designationAction} from 'redux/actions/userCreation_actions';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import {OpenalertActions} from 'redux/actions/alert_actions';
import {requiredFieldsAlertMessage} from 'utils/content';
import { getAllowanceType, getDeductionType, getSalaryTemplateAllAction, getStructureBasedTemplateAction, mapEmployeeBasedSalaryAction } from 'redux/actions/salary_actions';
import { pageSize } from 'utils/pageSize';
import NewSalaryStructure from 'pages/Payroll/salary/newsalary';
import EmployeeStatutory from './EmployeeStatutory';
import GavelIcon from '@mui/icons-material/Gavel';
import toMomentOrNull from 'utils/DateFixer';

function NewUser(props) {
  const textRef = useRef(null);
  const storage = getsessionStorage();
  const filter = createFilterOptions();

  // const StyledTextField = withStyles({
  //   root: {
  //     '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
  //       '-webkit-appearance': 'none',
  //       margin: 0,
  //     },
  //     // '& input[type="number"]': {
  //     //   '-moz-appearance': 'textfield',
  //     // },
  //   },
  // })(TextField);

  const [formValues, setFormValues] = useState({
    first_name: null,
    last_name: null,
    gender: null,
    phone_number: null,
    alternate_phone_number: null,
    dob: null,
    designation: null,
    email: null,
    address: null,
    area: null,
    city: null,
    state: null,
    zip: null,
    country: 'India',
    username: null,
    password: null,
    dateOfJoining: null,
    releiving_date: null,
    role_id: null,
    primary_location: [],
    location_id: [],
    bike_name: null,
    mileage: null,
    model: null,
    dl_number: null,
    role_name: null,
    expiry_date: null,
    latitude: null,
    longitude: null,
    attendance_restrictions: 0,
    department_id: [],
    employeeId: null,
    transaction_type: null,
    category_id: null,
    bank_name: null,
    beneficiary_account_no: null,
    ifsc_code: null,
    employee_name_in_bank: null,
    bank_branch: null,
    bank_address: null,
    beneficiary_code: null,
    pan_number: null,
    enableLiveLocation: 0,
    work_from_home: 0,
    selfie_attendance: 0,
    face_attendance: 0,
    manual_attendance: 1,
    attendance_via_app: 1,
    // shiftList_id:null,
    // shiftList_name:null,
    esi_number: null,
    uan_number: null,
    device_attendance: 0,
    client_code: null,
    payment_mode: null,
    reporting_manager: null,
    salary_template_id: null,
    salary_template_name: null,
    salary_temp_structure: null,
    grossAmount: null,
    monthly_ctc: null,
    ctc: null,
    net_pay: null,
    auto_calculation: false,
    // salary_components: {},
    allowanceAmounts: [],
    deductionAmounts: [],
  });
  console.log(
    'formValues',
    formValues.primary_location,
    formValues.location_id,
  );
  console.log(formValues);

  const [value, setValue] = useState(0);
  const [loader, setLoader] = useState(false);
  const [expandChips, setExpandChips] = useState(false);
  const [salaryComponents, setSalaryComponents] = useState([]);
  const [structureDialog, setStructureDialog] = useState(false);
  const [formErrors, setFormErrors] = useState({
    first_name: null,
    gender: null,
    phone_number: null,
    // alternate_phone_number: null,
    dob: null,
    designation: null,
    email: null,
    address: null,
    area: null,
    city: null,
    state: null,
    zip: null,
    country: null,
    username: null,
    password: null,
    dateOfJoining: null,
    role_id: null,
    location_id: null,
    department_id: null,
    // bike_name: null,
    // mileage:null,
    // model:null,
    // dl_number:null,
    expiry_date: null,
    event_id: null,
    employeeId: null,
    transaction_type: null,
    category_id: null,
    bank_name: null,
    beneficiary_account_no: null,
    ifsc_code: null,
    employee_name_in_bank: null,
    bank_branch: null,
    bank_address: null,
    beneficiary_code: null,
    pan_number: null,
    uan_number: null,
    esi_number: null,
    primary_location: null,
    releiving_date: null,
    reporting_manager: null,
    salary_template_id: null,
    salary_temp_structure: null,
    // shiftList_id:null,
  });

  const {
    UserRoleReducer: {userRole, eventName, designation},
    ShiftsReducer: {employeeCategoryList},
    UserCreationReducer: {searchUserCreationData, reportingManager},
    SalaryReducers: {salaryTemplateList, structureBasedTemplate, AllowanceType, deductionType},
  } = useSelector((state) => state);

  const fullyRestricted = [12];
  const partiallyRestricted = [2, 3, 9, 10, 11];
  const paymentOptions = ['Cash', 'Bank'];
  const normalizePaymentMode = (mode) => {
    if (mode === null || mode === undefined || mode === '') return null;
    if (typeof mode === 'number') {
      if (mode === 1) return 'Cash';
      if (mode === 2) return 'Bank';
      return null;
    }
    const value = String(mode).trim().toLowerCase();
    if (value === 'cash') return 'Cash';
    if (value === 'bank') return 'Bank';
    return null;
  };
  const isRestricted =
    fullyRestricted.includes(storage?.company_type) ||
    partiallyRestricted.includes(storage?.company_type);

  const isDobRequired = !isRestricted;
  const isEmployeeIdRequired = !isRestricted;
  const isDesignationRequired = !isRestricted;

  const isCategoryRequired = !isRestricted;
  const isLocationRequired = !isRestricted;
  const isPrimaryLocationRequired = !isRestricted;
  const isDateOfJoiningRequired = !isRestricted;
  const isDepartmentRequired =
  !isRestricted &&
  userRole.some(
    (role) =>
      role.role_id === formValues.role_id &&
      role.Department !== 'Disabled'
  );

  const getRequiredFields = () => {
    const fields = ['first_name', 'gender', 'phone_number', 'role_id', 'location_id'];
    if (!fullyRestricted.includes(storage?.company_type)) {
      fields.push('email', 'username', 'password');
      if (!partiallyRestricted.includes(storage?.company_type)) {
        fields.push(
          'dob',
          'primary_location',
          'department_id',
          'designation',
          'category_id',
          'dateOfJoining',
          'employeeId'
        );
      }
    }
    return fields;
  };



  //   const styles = {
  //     input[type = number]::- webkit - inner - spin - button,
  //     input[type = number]::-webkit - outer - spin - button {
  //     -webkit - appearance: none;
  //     margin: 0;
  //   }
  // };

  const [showPassword, setShowPassword] = useState(false);
  const [releiving_date, setreleiving_date] = useState('');
  const [relievingDateEnabled, setRelievingDateEnabled] = useState(false);
  const [appAccessEnabled, setAppAccessEnabled] = useState(true);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (e) => {
    e.preventDefault();
  };

  const handlePasswordChange = (e) => {
    const {name, value} = e.target;
    setFormValues({...formValues, [name]: value});
  };

  const [events, setEvents] = useState([
    {eventName: null, eventDate: null, event_id: null},
  ]);

  const deleteEvent = (index) => {
    const obj = events.filter((d) => d !== events[index]);
    setEvents(obj);
  };

  // useEffect(() => {
  //   if(formValues.role_name === 'Salesman')
  //     formValues.attendance_restrictions = "1"
  //   else
  //     formValues.attendance_restrictions = "0"
  // },[formValues.role_name]);

  const addEvent = () => {
    setEvents([...events, {eventName: '', eventDate: null}]);
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
      const updatedFormErrors = {...formErrors};
      delete updatedFormErrors[index];
      setFormErrors(updatedFormErrors);
    }
  };
  //   const [requiredFields, setRequiredFields] = useState([
  //     'first_name',
  //     'gender',
  //     'phone_number',
  //     'email',
  //     'address',
  //     'area',
  //     'zip',
  //     'state',
  //     'city',
  //     'username',
  //     'password',
  //     'role_id',
  //     'location_id',
  //     // 'shiftList_id,'
  // ]);

  // useEffect(() => {
  //     // Dynamically update the required fields based on company_type
  //     if (storage.company_type === 6) {
  //         setRequiredFields([
  //             'first_name',
  //             'gender',
  //             'phone_number',
  //             'email',
  //             'address',
  //             'area',
  //             'zip',
  //             'state',
  //             'city',
  //             'username',
  //             'password',
  //             'role_id',
  //             // 'shiftList_id,'
  //         ]);
  //     } else {
  //         setRequiredFields([
  //             'first_name',
  //             'gender',
  //             'phone_number',
  //             'email',
  //             'address',
  //             'area',
  //             'zip',
  //             'state',
  //             'city',
  //             'username',
  //             'password',
  //             'role_id',
  //             'location_id',
  //             // 'shiftList_id,'
  //         ]);
  //     }
  // }, [storage.company_type]);

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
    'employeeId',
    'designation',
    'category_id',
    // 'designation_id'
    // 'transaction_type',
    // 'bank_name',
    // 'beneficiary_account_no',
    // 'ifsc_code',
    // 'shiftList_id',
    // 'uan_number',
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
    'employeeId',
    'department_id',
    'designation',
    // 'transaction_type',
    // 'bank_name',
    // 'beneficiary_account_no',
    // 'ifsc_code',
  ]);
  const [validRegex, setValidRegex] = useState({
    email: false,
    phone_number: false,
    password: false,
    bankAccountNumber: false,
    ifscCodeNumber: false,
    dobValid: false,
    esiNumber: false,
    uan_number: false,
    dateOfJoining: false,
    releiving_date: false,
  });
  const [editvalidRegex, seteditValidRegex] = useState({
    email: false,
    phone_number: false,
    bankAccountNumber: false,
    ifscCodeNumber: false,
    dobValid: false,
    dateOfJoining: false,
    releiving_date: false,
  });
  const [unvalidRegex, setUnValidRegex] = useState({
    alternate_phone_number: true,
  });
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [unchangeform, setForm] = useState(false);
  const [initialState, setInitialState] = useState({});
  const [initialErrorState, setInitislErrorState] = useState({});
  const [dialog, setDialog] = useState(false);
  // const [open, setOpen] = useState(false)
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
  
  const stocklocation = useSelector(
    (state) => state.stockLocationReducer.allliststocklocation,
  );
  const tempinit = useRef(null);
  const tempinitform = useRef(null);
  const tempsubmitaction = useRef(null);
  const tempStatus = useRef(null);
  const [token, setToken] = useState('');
  const dispatch = useDispatch();
  const [concate, setconcate] = useState('');
  const [userName, setUserName] = useState(null);
  const [changedForm, setChangedForm] = useState(false);
  const [isLoadingLocationData, setIsLoadingLocationData] = useState(false);
  const [disabledFields, setDisabledFields] = useState(['department_id']);

  const toMomentValue = (dateValue) => {
    if (!dateValue) return null;
    if (moment.isMoment(dateValue)) return dateValue;
    const parsed = moment(dateValue);
    return parsed.isValid() ? parsed : null;
  };

  // let defaultStockLocation = stocklocation.filter(d => d.location_type === "Default Location").map((d) => {
  //   return {
  //     location_id: d.location_id,
  //     location_name: d.location_name,

  //   };
  // })

  // useEffect(() => {
  //  await setFormValues({...formValues , location_id : defaultStockLocation})
  // }, [])

  // useEffect(() => {
  //   if (props.status !== 'edit') {
  //     await setFormValues({ ...formValues, location_id: defaultStockLocation })
  //   }
  // }, [stocklocation,props.status])

  // const typeOfLocation = stocklocation?.filter(d => d.location_type === "Default Location")[0]?.location_name
  // // let dd =

  const bank_acc_no = searchUserCreationData?.map((acc) => {
    return acc.beneficiary_account_no;
  });

  const handleCityChange = (event, val) => {
    if (val !== null) {
      setFormValues({
        ...formValues,
        city: val.name,
        state: val.state,
      });
      setFormErrors({
        ...formErrors,
        city: null,
        state: null,
      });
    } else {
      setFormValues({
        ...formValues,
        city: null,
      });
      setFormErrors({
        ...formErrors,
        city: 'City is required',
      });
    }
  };

  const handleSwitchChange = async (e) => {
    // setChangedForm(true);
    let {name, checked} = e.target;
    setFormValues({...formValues, [name]: checked});
  };

  const handleStateChange = (event, val) => {
    // setChangedForm(true);
    if (val !== null) {
      setFormValues({
        ...formValues,
        state: val.state,
      });
      setFormErrors({
        ...formErrors,
        state: null, // Clear state error
      });
    } else {
      setFormValues({
        ...formValues,
        state: null,
      });
      setFormErrors({
        ...formErrors,
        state: 'State is required',
      });
    }
  };

  const {
    appConfigReducer: {getprefix_data, app_config_data},
    ShiftsReducer: {shiftList},
    UserCreationReducer: {departmentList, bankTransactionType},
  } = useSelector((state) => state);

  const [enableLiveLocation, setEnableLiveLocation] = useState(false);
  const [gpsAttendance, setGpsAttendance] = useState(false);
  const [enableWorkFromHome, setEnableWorkFromHome] = useState(false);
  const [enableSelfieAttendance, setSelfieAttendance] = useState(false);
  const [pf, setPf] = useState(false);
  const [esi, setEsi] = useState(false);
  const [enableFaceAttendance, setFaceAttendance] = useState(false);
  const [enableOfflineAttendance, setOfflineAttendance] = useState(false);
  const [enableManualAttendance, setEnableManualAttendance] = useState(false);
  const [enablettendance_via_app, setEnablettendance_via_app] = useState(true);
  const [enableDeviceAttendance, setEnableDeviceAttendance] = useState(false);
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
    selectData,
    setselectData,
  } = useContext(CreateNewButtonContext);

  useEffect(() => {
    let data = {
      type: 'LIST_CATEGORY',
    };
    let body = {
          pageCount: 0,
          numPerPage: pageSize,
          searchString: '',
          employeeId: commoncookie,
          headerLocationId: headerLocationId
        }
    dispatch(getprefixAction());
    dispatch(getReportingManagerAction())
    dispatch(getAllowanceType(storage.company_id))
    dispatch(getDeductionType(storage.company_id)),
    dispatch(getSalaryTemplateAllAction())
    // dispatch(getShiftListAction())
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      !userRole.length && dispatch(getUserRoleAction()),
      !eventName.length && dispatch(getEventNameAction()),
      !props.open && dispatch(allListStockLocation()),
      dispatch(departmentListAction((res) => {})),
      !bankTransactionType.length && dispatch(bankTransactionTypeAction()),
      // !employeeCategoryList.length &&
        dispatch(listEmployeeCategoryAction(data, () => {})),
      dispatch(designationAction()),

      dispatch(
        getAppConfigDataAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
          (response) => {
            if (response) {
              response.forEach((d) => {
                if (
                  d.key_name === 'company.enableLiveLocation' &&
                  d.value === 'true'
                ) {
                  setEnableLiveLocation(true);
                }
                if (
                  (d.key_name === 'gps.attendance' && d.value === 'true') ||
                  (d.key_name === 'qr.attendance' && d.value === 'true') ||
                  (d.key_name === 'wifi.attendance' && d.value === 'true')
                ) {
                  setGpsAttendance(true);
                }
                if (
                  d.key_name === 'company.enableWorkFromHome' &&
                  d.value === 'true'
                ) {
                  setEnableWorkFromHome(true);
                }
                if (d.key_name === 'selfie.attendance' && d.value === 'true') {
                  setSelfieAttendance(true);
                }
                if (d.key_name === 'pf' && d.value === 'true') {
                  setPf(true);
                }
                if (d.key_name === 'esi' && d.value === 'true') {
                  setEsi(true);
                }
                if (d.key_name === 'face.attendance' && d.value === 'true') {
                  setFaceAttendance(true);
                }
                if (d.key_name === 'manual.attendance' && d.value === 'true') {
                  setEnableManualAttendance(true);
                }
                if (d.key_name === 'offline.attendance' && d.value === 'true') {
                  setOfflineAttendance(true);
                }
                if (d.key_name === 'device.attendance' && d.value === 'true') {
                  setEnableDeviceAttendance(true);
                }
              });
            }
          },
        ),
      ),
    );
  }, []);

  useEffect(() => {}, [app_config_data]);

  useEffect(() => {
    const uniqueLocations = _.uniqBy(formValues.location_id, 'location_name');

    if (uniqueLocations.length === 1 && props.status !== 'edit') {
      setFormValues({
        ...formValues,
        primary_location: {
          location_id: uniqueLocations[0].location_id,
          location_name: uniqueLocations[0].location_name,
        },
      });
    }
    if (uniqueLocations.length > 1 && props.status != 'edit') {
      setFormValues({
        ...formValues,
        primary_location: null,
      });
      validationHandler('primary_location', uniqueLocations[0]);
    }
  }, [formValues.location_id]);
  // useEffect(() => {
  //   if(!enableLiveLocation){
  //     setFormValues({...formValues, enableLiveLocation: 0 })
  //   }
  // }, [enableLiveLocation])

  // useEffect(() => {
  //   if(!gpsAttendance){
  //     setFormValues({...formValues, attendance_restrictions: 0 })
  //   }
  // }, [gpsAttendance])

  const handleChangeRestriction = (e) => {
    // setChangedForm(true);
    let {name, checked} = e.target;

    if (e.target.checked === true) {
      setFormValues({...formValues, [name]: 1});
    } else {
      setFormValues({...formValues, [name]: 0});
    }
  };

  const validClose = () => {
    setDialog(true);
  };
  const initform = () => {
    setInitialState(formValues);
    setInitislErrorState(formErrors);
    requestForToken(() => {}, setToken);
  };
  tempinitform.current = initform;
  useEffect(() => {
    tempinitform.current();
    const body = {
      newUser: 'newUser',
    };
    dispatch(userCreationPaginationAction(body));
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
    if (props.status === 'edit') {
      // console.log("props.edit_id_data",props.edit_id_data)
      // dispatch(getStructureBasedTemplateAction({ id: props.edit_id_data.template_id }))
      // let salaryData = structureBasedTemplate?.filter((v) => props.edit_id_data.template_id = v.id)
      // console.log("hguy", salaryData, structureBasedTemplate, props.edit_id_data, formValues, props.status, salaryComponents)
      let editsdata = {
        ...props.edit_id_data,
        payment_mode: normalizePaymentMode(props.edit_id_data?.payment_mode),
      };
      delete editsdata.tabledata;
      // delete editsdata.Locations_name;
      // delete editsdata.Departments_name;

      let location_id =
        props.edit_id_data?.Locations_name?.filter(
          (d) => d.username === props.edit_id_data.username,
        ) || [];
      if (storage?.company_type == 12) {
        setFormValues({
          ...editsdata,
          location_id: [
            {
              location_id: props.edit_id_data?.location_id,
              location_name: props.edit_id_data?.location_name,
            },
          ],
        });
      } else {
        if (
          location_id?.length > 0 ||
          props.edit_id_data?.Departments_name?.length > 0
        ) {
          let primary_locationdata = location_id.filter(
            (f) => f.location_id == props.edit_id_data?.primary_location,
          );

          setFormValues({
            ...editsdata,
            location_id: location_id.length > 0 ? location_id : [],
            primary_location: primary_locationdata[0],
            alternate_phone_number: editsdata.office_number,
            department_id:
              props.edit_id_data?.Departments_name.length > 0
                ? props.edit_id_data?.Departments_name
                : [],
            reporting_manager: editsdata.reporting_manager || null,
            salary_template_id: editsdata?.template_id,
            salary_temp_structure: editsdata?.salary_structure_id ,
            // salary_components: 
          });
          if (structureBasedTemplate && structureBasedTemplate.length > 0) {
          const components = COMPONENT_KEYS.map(key => {
            const matched = structureBasedTemplate.find(
              s => s.allowance_type_id ? s.allowance_type_id === key : s.deduction_type_id === key
            );
            return {
              key,
              value: matched ? Number(matched.allowance_amount || matched.deduction_amount) : '',
              id: matched ? (matched.allowance_type_id || matched.deduction_type_id) : null
            };
          });
          setSalaryComponents(components);
        }
          setAppAccessEnabled(
            props.edit_id_data?.app_access === 1 ? true : false,
          );
        } else {
          setFormValues({...editsdata, alternate_phone_number: editsdata.office_number, reporting_manager: editsdata.reporting_manager || null,});
        }
      }

      seteditValidRegex({phone_number: true, email: true});
      setRelievingDateEnabled(true);

      // Set your events data

      if (props.edit_id_data?.Events?.length) {
        setEvents([...props.edit_id_data.Events]);
      }
    }
  }, [props.edit_id_data, props.status]);

  console.log(
    'enablettendance_via_app',
    enablettendance_via_app,
    formValues.attendance_via_app,
  );
  const handleChange = async (e) => {
    // setChangedForm(true);

    console.log('esi_numberesi3242_number');

    let {name, value} = e.target;
    setStateHandler(name, value);

    if (name === 'username' && value.length > 0) {
      const final = getprefix_data[0]?.value;
      const second = value;
      const setda = `your user name : "${final}` + '.' + `${second}"`;
      setconcate(setda);
      setUserName(final + '.' + second);
    }

    if (name === 'zip') {
      if (!isLoadingLocationData) {
        setIsLoadingLocationData(true);
        if (value !== '') {
          if (value.length === 6) {
            setLoader(true);
            const locationData = await getLocationDataBasedOnPincode(value);
            console.log(locationData, 'location');

            // Check if locationData is an empty object
            if (locationData && Object.keys(locationData).length > 0) {
              const {district, state} = locationData;
              if (district && state) {
                setFormValues({
                  ...formValues,
                  zip: value,
                  city: district,
                  state,
                });
                setFormErrors({
                  ...formErrors,
                  zip: null,
                  state: null,
                  city: null,
                });
                setLoader(false);
              } else {
                setLoader(false);
                setFormErrors({
                  ...formErrors,
                  zip: 'Location data is incomplete',
                });
              }
            } else {
              setLoader(false);
              setFormErrors({
                ...formErrors,
                zip: 'Pincode is not found',
              });
            }
          } else {
            setLoader(false);
            setFormErrors({
              ...formErrors,
              zip: 'Pincode maximum length is 6 digits',
            });
          }
        } else {
          setFormErrors({
            ...formErrors,
            zip: null,
          });
        }
        setIsLoadingLocationData(false);
      }
    }

    if (name === 'releiving_date') {
      setFormValues({
        ...formValues,
        releiving_date: value,
      });
      setreleiving_date(value);

      if (value !== '') {
        const y = value.split('-');
        const dString = `${parseInt(y[0])}-${y[1]}-${y[2]}`;

        if (!moment(dString, moment.ISO_8601).isValid()) {
          setFormErrors({
            ...formErrors,
            [name]: 'Relieving Date is Invalid!',
          });
        } else {
          const allValid = Object.values(formValues).every(
            (val) => val !== null && val !== '',
          );
          if (allValid) {
            setFormErrors(null);
          } else {
            setFormErrors({
              ...formErrors,
              [name]: null,
            });
          }
        }
      }
    }

    if (name === 'uan_number') {
      const uanPattern = /^\d{12}$/;
      if (uanPattern.test(value)) {
        setFormValues({
          ...formValues,
          uan_number: value,
        });
        setFormErrors({
          ...formErrors,
          uan_number: null,
        });
      }
      // else {
      //   setFormErrors({
      //     ...formErrors,
      //     uan_number: "UAN must be a 12-digit number",
      //   });
      // }
    }
    if (name === 'esi_number') {
      const esiPattern = /^\d{17}$/; // Example pattern for a 17-digit ESI number
      if (value === '' || value === null) {
        setFormValues({
          ...formValues,
          esi_number: null,
        });
        setFormErrors({
          ...formErrors,
          esi_number: null,
        });
      } else if (esiPattern.test(value)) {
        // ESI number is valid
        setFormValues({
          ...formValues,
          esi_number: value,
        });
        setFormErrors({
          ...formErrors,
          esi_number: null,
        });
      } else {
        // ESI number is invalid
        setFormErrors({
          ...formErrors,
          esi_number: 'ESI number must be a 17-digit number',
        });
      }
    }
  };

  console.log('dfasfsd', props?.data);

  const cancel = () => {
    setDialog(false);
  };

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

    if (name === 'location_id') {
      if (value && value.length > 0) {
        formErrors['location_id'] = null;
      } else {
        formErrors['location_id'] = 'Location is Required!';
      }
    }

    if (name === 'reporting_manager') {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }

    if (name === 'department_id') {
      if (formValues.role_name === 'Admin') {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      } else if (value.length === 0) {
        setFormErrors({
          ...formErrors,
          [name]: 'Department is required',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      }
    }

    // if (name === 'shiftList_id' && value.length > 0) {
    //   setFormErrors({
    //     ...formErrors,
    //     ['shiftList_id']: null,
    //   });
    // }
    // if (name === 'shiftList_id' && value.length === 0) {
    //   setFormErrors({
    //     ...formErrors,
    //     ['shiftList_id']: capitalize('shiftList_id') + ' is Required!',
    //   });
    //   return;
    // }

    if (
      props.status !== 'edit'
        ? formValues.role_name !== 'Salesman'
          ? getRequiredFields().includes(name) &&
            (value === null ||
              value === 'null' ||
              value === '' ||
              value === false ||
              (Object.keys(value) && value.value === null))
          : salesmanrequired.includes(name) &&
            (value === null ||
              value === 'null' ||
              value === '' ||
              value === false ||
              (Object.keys(value) && value.value === null))
        : editrequiredFields.includes(name) &&
          (value === null ||
            value === 'null' ||
            value === '' ||
            value === false ||
            (Object.keys(value) && value.value === null)) &&
          storage?.company_type !== 12
    ) {
      // if(name === 'zip'){
      //   setFormErrors({
      //     ...formErrors,
      //     [name]: 'Pincode is Required!',
      //   });
      // }
      // else{
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name.replace(/_/g, ' ')) + ' is Required!',
      });
      // }
    }
    // else if (regex[name]) {
    //   if (!regex[name].test(value)) {
    //     setFormErrors({
    //       ...formErrors,
    //       [name]: capitalize(name) + ' is Invalid!'
    //     });
    //   } else {
    //     setFormErrors({
    //       ...formErrors,
    //       [name]: null
    //     });
    //   }
    // }
    // else if (alter[name]) {
    //   if (!alter[name].test(value)) {
    //     setFormErrors({
    //       ...formErrors,
    //       [name]: capitalize(name) + ' is Invalid!'
    //     });
    //   } else {
    //     setFormErrors({
    //       ...formErrors,
    //       [name]: null
    //     });
    //   }
    // }
    else if (name === 'email') {
      if (storage.company_type === 12) {
        console.log("insideee")
        setFormErrors({
          ...formErrors,
          [ name ]: null,
        });
        setValidRegex({ ...validRegex, email: true });
      } else {
        if (emailValidation(value) !== true) {
          setValidRegex({ ...validRegex, email: false });
          setFormErrors({
            ...formErrors,
            [ name ]: capitalize(name) + ' is Invalid!',
          });
        } else {
          setFormErrors({
            ...formErrors,
            [ name ]: null,
          });
          setValidRegex({ ...validRegex, email: true });
        }
      }
    }else if (name === 'phone_number') {
      const accountExists = searchUserCreationData?.some(
        (acc) => String(value).trim() === String(acc.phone_number).trim(),
      );
      const EditaccountExists = searchUserCreationData?.some(
        (acc) =>
          String(value).trim() ===
          String(props?.edit_id_data.phone_number).trim(),
      );
      if (phoneValidation(value) !== true) {
        setValidRegex({...validRegex, phone_number: false});
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name.replace(/_/g, ' ')) + ' is Invalid!',
        });
      } else if (EditaccountExists) {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      } else if (accountExists) {
        setFormErrors({
          ...formErrors,
          [name]: 'Phone Number Exists!',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
        setValidRegex({...validRegex, phone_number: true});
      }
    } else if (name === 'dob') {
      if (value !== '') {
        const y = value.split('-');

        const dString = `${parseInt(y[0])}-${y[1]}-${y[2]}`;

        // if (moment(dString, moment.ISO_8601).isValid()) {

        // }

        if (!moment(dString, moment.ISO_8601).isValid()) {
          setValidRegex({...validRegex, dobValid: false});
          setFormErrors({
            ...formErrors,
            [name]: 'Date of birth is Invalid!',
          });
        } else {
          let date = moment(value);

          // Check if the date is in the future
          if (date.isAfter(moment(), 'day')) {
            setValidRegex({...validRegex, dobValid: false});
            setFormErrors({
              ...formErrors,
              [name]: 'Date of birth cannot be in the future!',
            });
          } else {
            // Check if all form values are valid, if yes, set formErrors to null
            const allValid = Object.values(formValues).every(
              (val) => val !== null && val !== '',
            );
            if (allValid) {
              setFormErrors(null);
            } else {
              setFormErrors({
                ...formErrors,
                [name]: null,
              });
            }
            setValidRegex({...validRegex, dobValid: true});
          }
        }
      }
    } else if (name === 'dateOfJoining') {
      if (value !== '') {
        const y = value.split('-');

        const dString = `${parseInt(y[0])}-${y[1]}-${y[2]}`;

        if (!moment(dString, moment.ISO_8601).isValid()) {
          setValidRegex({...validRegex, dateOfJoining: false});
          setFormErrors({
            ...formErrors,
            [name]: 'Date of Joining is Invalid!',
          });
        } else {
          const allValid = Object.values(formValues).every(
            (val) => val !== null && val !== '',
          );
          if (allValid) {
            setFormErrors(null);
          } else {
            setFormErrors({
              ...formErrors,
              [name]: null,
            });
          }
          setValidRegex({...validRegex, dateOfJoining: true});
        }
      }
    } else if (name === 'releiving_date') {
      setFormValues({
        ...formValues,
        releiving_date: value,
      });
      setreleiving_date(value);

      if (value !== '') {
        const y = value.split('-');
        const dString = `${parseInt(y[0])}-${y[1]}-${y[2]}`;

        if (!moment(dString, moment.ISO_8601).isValid()) {
          setValidRegex({...validRegex, releiving_date: false});
          setFormErrors({
            ...formErrors,
            [name]: 'Relieving Date is Invalid!',
          });
        } else {
          const allValid = Object.values(formValues).every(
            (val) => val !== null && val !== '',
          );
          if (allValid) {
            setFormErrors(null);
          } else {
            setFormErrors({
              ...formErrors,
              [name]: null,
            });
          }
          setValidRegex({...validRegex, releiving_date: true});
        }
      }
    } else if (name === 'ifsc_code') {
      const accountExists = searchUserCreationData?.some(
        (acc) => String(value).trim() === String(acc.ifsc_code).trim(),
      );
      const EditaccountExists = searchUserCreationData?.some(
        (acc) =>
          String(value).trim() === String(props?.edit_id_data.ifsc_code).trim(),
      );

      if (value !== '') {
        if (ifscValidation(value) !== true) {
          setValidRegex({...validRegex, ifscCodeNumber: false});
          setFormErrors({
            ...formErrors,
            [name]: 'Ifsc code is Invalid!',
          });
        } else {
          setFormErrors({
            ...formErrors,
            [name]: null,
          });
          setValidRegex({...validRegex, ifscCodeNumber: true});
        }

        //       else if(EditaccountExists){
        //         setFormErrors({
        //           ...formErrors,
        //           [name]: null,
        //         });
        //       }

        //        else if (accountExists) {

        //       setFormErrors({
        //         ...formErrors,
        //         [name]: 'IFSC Code Exists!',
        //       });
        //     }
        //        else {
        //         setFormErrors({
        //           ...formErrors,
        //           [name]: null,
        //         });
        //         setValidRegex({...validRegex, ifscCodeNumber: true});
        //       }
        //     } else{
        //       setFormErrors({
        //         ...formErrors,
        //         [name]: null,
        //       });
        //       setValidRegex({...validRegex, ifscCodeNumber: true});
      } else if (
        (formValues.bank_name !== '' &&
          formValues.bank_name !== null &&
          value === '') ||
        value === null
      ) {
        setFormErrors((prev) => ({...prev, [name]: 'IFSC Code is Required!'}));
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
        setValidRegex({...validRegex, ifscCodeNumber: true});
      }
    } else if (name === 'bank_name') {
      if (value === '' || value === null) {
        setFormErrors((prev) => ({...prev, ifsc_code: null}));
      }
    } else if (name === 'esi_number') {
      const accountExists = searchUserCreationData?.some(
        (acc) => String(value).trim() === String(acc.esi_number).trim(),
      );
      const EditaccountExists = searchUserCreationData?.some(
        (acc) =>
          String(value).trim() ===
          String(props?.edit_id_data.esi_number).trim(),
      );

      if (value !== '') {
        if (esiValidation(value) !== true) {
          setValidRegex({...validRegex, esiNumber: false});
          setFormErrors({
            ...formErrors,
            [name]: 'ESI No is Invalid!',
          });
        } else if (EditaccountExists) {
          setFormErrors({
            ...formErrors,
            [name]: null,
          });
        } else if (accountExists) {
          setFormErrors({
            ...formErrors,
            [name]: 'ESI No Exists!',
          });
        } else {
          setFormErrors({
            ...formErrors,
            [name]: null,
          });
          setValidRegex({...validRegex, esiNumber: true});
        }
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
        setValidRegex({...validRegex, esiNumber: true});
      }
    } else if (name === 'uan_number') {
      const accountExists = searchUserCreationData?.some(
        (acc) => String(value).trim() === String(acc.uan_number).trim(),
      );
      const EditaccountExists = searchUserCreationData?.some(
        (acc) =>
          String(value).trim() ===
          String(props?.edit_id_data.uan_number).trim(),
      );

      if (value !== '') {
        if (uanValidation(value) !== true) {
          setValidRegex({...validRegex, uan_number: false});
          setFormErrors({
            ...formErrors,
            [name]: 'UAN No is Invalid!',
          });
        } else if (EditaccountExists) {
          setFormErrors({
            ...formErrors,
            [name]: null,
          });
        } else if (accountExists) {
          setFormErrors({
            ...formErrors,
            [name]: 'UAN No Exists!',
          });
        } else {
          setFormErrors({
            ...formErrors,
            [name]: null,
          });
          setValidRegex({...validRegex, uan_number: true});
        }
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
        setValidRegex({...validRegex, uan_number: true});
      }
    } else if (name === 'password') {
      if (props.status !== 'edit') {
        if (passwordValidation(value) !== true) {
          setValidRegex({...validRegex, password: false});
          setFormErrors({
            ...formErrors,
            [name]: value.length < 6 ? 'Password must be at least 6 characters long.' : 'Password must not contain spaces.',
          });
        } else {
          setFormErrors({
            ...formErrors,
            [name]: null,
          });
          setValidRegex({...validRegex, password: true});
        }
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
        seteditValidRegex({...editvalidRegex, password: false});
      }
    } else if (name === 'employeeId') {
      if (props.status !== 'edit') {
        if (empIdValidation(value) !== true) {
          setValidRegex({...validRegex, password: false});
          setFormErrors({
            ...formErrors,
            [name]: 'Employee Code is invalid',
          });
        } else {
          setFormErrors({
            ...formErrors,
            [name]: null,
          });
          setValidRegex({...validRegex, password: true});
        }
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
        seteditValidRegex({...editvalidRegex, password: false});
      }
    } else if (name === 'zip') {
      if (value !== '') {
        if (value.length === 6) {
          setFormErrors({
            ...formErrors,
            zip: null,
          });
        } else {
          setLoader(false);
          setFormErrors({
            ...formErrors,
            zip: 'Pincode maximum length is 6 digits',
          });
        }
      } else {
        setFormErrors({
          ...formErrors,
          zip: null,
        });
      }
      // else {
      //   setFormErrors({
      //     ...formErrors,
      //     [name]: null,
      //   });
      // }
    } else if (name === 'beneficiary_account_no') {
      const accountExists = searchUserCreationData?.some(
        (acc) =>
          String(value).trim() === String(acc.beneficiary_account_no).trim(),
      );

      const EditaccountExists = searchUserCreationData?.some(
        (acc) =>
          String(value).trim() ===
          String(props?.edit_id_data.beneficiary_account_no).trim(),
      );
      console.log(
        accountExists,
        'accountExists',
        EditaccountExists,
        'searchUserCreationData',
        searchUserCreationData,
      );
      if (value !== '') {
        if (accountNoValidation(value) !== true) {
          setValidRegex({...validRegex, bankAccountNumber: false});
          setFormErrors({
            ...formErrors,
            [name]: 'Beneficiary Account No is Invalid!',
          });
        } else if (EditaccountExists) {
          setFormErrors({
            ...formErrors,
            [name]: null,
          });
        } else if (accountExists) {
          setFormErrors({
            ...formErrors,
            [name]: 'Beneficiary Account No Exists!',
          });
        } else {
          setFormErrors({
            ...formErrors,
            [name]: null,
          });
          setValidRegex({...validRegex, bankAccountNumber: true});
        }
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
        setValidRegex({...validRegex, bankAccountNumber: true});
      }
    } else {
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
    let formErrorsObj = {...formErrors};

    // Validate fields from first_name to email
    const fieldsToValidate = [
      'first_name',
      'phone_number',
      'gender',
      'dob',
      'email',
    ];

    fieldsToValidate.forEach((key) => {
       if (key === 'email' && storage?.company_type === 12) {
      formErrorsObj[key] = null;
      return;
       }
      const isRequired = formValues.role_name !== 'Salesman'
        ? getRequiredFields().includes(key)
        : salesmanrequired.includes(key);
      const isEmpty =
        formValues[key] === null ||
          formValues[key] === '' ||
        (typeof formValues[key] === 'object' && formValues[key].length === 0);

      if (isRequired && isEmpty) {
        isValid = false;
        formErrorsObj[key] =
          key === 'phone_number'
            ? 'Phone number is Required!'
            : capitalize(key) + ' is Required!';
        if (
          (props.status === 'edit' && key === 'password') ||
          key === 'username'
        ) {
          isValid = true;
          formErrorsObj[key] = null;
        }
      } else if (isRequired && formErrors[key] !== null) {
        isValid = false;
      }

      if (key === 'phone_number' && formValues[key] === null) {
        isValid = false;
        formErrorsObj.phone_number = 'Phone number is Required!';
      }

      if (
        key === 'gender' &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        isValid = false;
        formErrorsObj.dob = 'Date of birth is Required!';
      }

      if (
        props.status !== 'edit' &&
        key === 'password' &&
        passwordValidation(formValues['password']) === false
      ) {
        if (formErrors.password !== null) isValid = false;
        formErrorsObj[key] =
          key === 'password'
            ? 'Password is Required!'
            : capitalize(key) + ' invalid!';
      }

      if (
        key === 'phone_number' &&
        phoneValidation(formValues['phone_number']) === false
      ) {
        if (formErrors.phone_number !== null) {
          isValid = false;
          formErrorsObj[key] =
            key === 'phone_number'
              ? 'Phone number is invalid!'
              : capitalize(key) + ' invalid!';
        }
      }

      if (key === 'email' && emailValidation(formValues['email']) === false) {
        if (formErrors.email !== null) isValid = false;
        formErrorsObj[key] =
          key === 'email' ? 'Email is Required' : capitalize(key) + ' invalid!';
      }
    });
    console.log('formErrorsObj', formErrorsObj);
    await setFormErrors(formErrorsObj);
    console.log('Validation status:', isValid); // Add logging
    // console.log("Form errors:", formErrorsObj);
    if (isValid && value < 2) {
      setValue(value + 1);
    } else {
      const firstSpecificError = fieldsToValidate
        .map((k) => formErrorsObj[k])
        .find((msg) => msg && !/is Required!?$/i.test(msg));
      dispatch(
        OpenalertActions({
          msg: firstSpecificError || requiredFieldsAlertMessage,
          severity: 'warning',
        }),
      );
    }
  };

  const handleSecondTabChange = async () => {
    let isValid = true;
    let formErrorsObj = {...formErrors};

    const fieldsToValidate = ['password', 'role_id', 'location_id', 'primary_location'];

    fieldsToValidate.forEach((key) => {
      if (
        (formValues.role_name !== 'Salesman'
          ? getRequiredFields().includes(key)
          : salesmanrequired.includes(key)) &&
        (formValues[key] === null ||
          formValues[key] === '' ||
          formErrors[key] !== null ||
          (typeof formValues[key] === 'object' && formValues[key].length === 0))
      )
        if (
          (!formValues.username || formValues.username.trim() === '') &&
          storage?.company_type !== 12
        ) {
          isValid = false;
          formErrorsObj.username = 'User Name is Required';
        } else {
          formErrorsObj.username = null;
        }

      if (
        key === 'role_id' &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        isValid = false;
        formErrorsObj.role_id = 'User Role is Required!';
      }
      if (key === 'location_id') {
        if (
        !Array.isArray(formValues.location_id) ||
          formValues.location_id.length === 0
      ) {
        isValid = false;
        formErrorsObj.location_id = 'Location is Required!';
      } else {
        formErrorsObj.location_id = null;
        }
      }

      if (key === 'primary_location') {
        const pl = formValues[key];
        const isEmpty =
          pl === null ||
          pl === undefined ||
          pl === '' ||
          (typeof pl === 'string' && pl.length === 0) ||
          (Array.isArray(pl) && pl.length === 0) ||
          (typeof pl === 'object' &&
            !Array.isArray(pl) &&
            !pl.location_id);
        if (isEmpty) {
          isValid = false;
          formErrorsObj.primary_location = 'Primary Location is required!';
        } else {
          formErrorsObj.primary_location = null;
        }
      }

      if (
        props.status !== 'edit' &&
        key === 'password' &&
        passwordValidation(formValues['password']) === false
      ) {
        if (formErrors.password !== null) isValid = false;
        formErrorsObj[key] =
          key === 'password'
            ? 'Password is Required!'
            : capitalize(key) + ' invalid!';
      }
    });

    await setFormErrors(formErrorsObj);
    if (isValid && value < 2) {
      setValue(value + 1);
    } else {
      dispatch(
        OpenalertActions({
          msg: requiredFieldsAlertMessage,
          severity: 'warning',
        }),
      );
    }
  };

  const handleThirdTabChange = async () => {
    let isValid = true;
    let formErrorsObj = {...formErrors};

    const isRestricted = [2, 3, 9, 10, 11, 12].includes(storage?.company_type);

  const restrictedFields =
  storage?.company_type === 12
    ? [
        'dob',
        'designation',
        'dateOfJoining',
        'category_id',
        'department_id',
      ]
    : [
        'dob',
        'designation',
        'dateOfJoining',
        'location_id',
        'primary_location',
        'category_id',
        'department_id',
      ];

    if (isRestricted) {
      restrictedFields.forEach((field) => {
        formErrorsObj[field] = null;
      });
    }


    const fieldsToValidate = userRole.some(
      (role) =>
        role.role_id === formValues.role_id && role.Department === 'Disabled',
    )
      ? [
          'password',
          'role_id',
          'employeeId',
          'designation',
          'location_id',
          'primary_location',
          'dateOfJoining',
          'uan_number',
          'releiving_date'
        ]
      : [
          'password',
          'role_id',
          'department_id',
          'employeeId',
          'designation',
          'location_id',
          'primary_location',
          'dateOfJoining',
          'category_id',
          'uan_number',
          'releiving_date'
        ];

    const finalfieldsToValidate =
      formValues?.role_name === 'Administrator'
        ? fieldsToValidate?.filter((field) => field !== 'category_id')
        : fieldsToValidate;

    finalfieldsToValidate.forEach((key) => {
      if (isRestricted && restrictedFields.includes(key)) {
        return;
      }
      if (key === 'esi_number' && !esi) {
        return;
      }

      if (key === 'uan_number' && !pf) {
        return;
      }

      if (
        (formValues.role_name !== 'Salesman'
          ? getRequiredFields().includes(key)
          : salesmanrequired.includes(key)) &&
        (formValues[key] === null ||
          formValues[key] === '' ||
          formErrors[key] !== null ||
          (typeof formValues[key] === 'object' && formValues[key].length === 0))
      )
        if (
          key === 'department_id' &&
          (formValues[key] === null ||
            formValues[key] === '' ||
            formValues[key].length === 0)
        ) {
          isValid = false;
          formErrorsObj.department_id = 'Department is Required!';
        }

      if (
        key === 'department_id' &&
        userRole.some(
          (role) =>
            role.role_id === formValues.role_id &&
            role.Department === 'Disabled',
        )
      ) {
        formErrorsObj.department_id = null;
      }

      if (
        key === 'employeeId' &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        isValid = false;
        formErrorsObj.employeeId = 'Employee Id is Required!';
      }

      if (
        key === 'designation' &&
        (formValues[key] === null ||
          formValues[key] === '' ||
          formValues[key].length === 0)
      ) {
        isValid = false;
        formErrorsObj.designation = 'Designation is Required!';
      }

      if (
        key === 'dateOfJoining' &&
        (formValues[key] === null ||
          formValues[key] === '' ||
          formErrors.dateOfJoining === 'Date of Joining is Invalid!' ||
          formErrors.dateOfJoining === 'Date Of Joining is Required!')
      ) {
        isValid = false;
        formErrorsObj.dateOfJoining = 'Date Of Joining is Required!';
      }

      if (
        key === 'releiving_date' &&
        formErrors.releiving_date === 'Relieving Date is Invalid!'
      ) {
        isValid = false;
        formErrorsObj.releiving_date = 'Relieving Date is Invalid!';
      }

      if (
        key === 'location_id' &&
        (formValues[key] === null ||
          formValues[key] === '' ||
          formValues[key].length === 0)
      ) {
        isValid = false;
        formErrorsObj.location_id = 'Location is Required!';
      }

      if (
        key === 'primary_location' &&
        (formValues[key] === null ||
          formValues[key] === undefined ||
          formValues[key] === '' ||
          (typeof formValues[key] === 'string' &&
            formValues[key].length === 0) ||
          (Array.isArray(formValues[key]) && formValues[key].length === 0))
      ) {
        isValid = false;
        formErrorsObj.primary_location = 'Primary Location is required!';
      }

      if (
        key === 'category_id' &&
        (formValues[key] === null ||
          formValues[key] === '' ||
          formValues[key].length === 0)
      ) {
        isValid = false;
        formErrorsObj.category_id = 'Category is Required!';
      }
      console.log('mmmm', formValues[key], key);
      const esiPattern = /^\d{10}$|^\d{17}$/;
      if (
        key === 'esi_number' &&
        formValues[key] !== null &&
        formValues[key] !== '' &&
        !esiPattern.test(formValues[key])
      ) {
        //console.log('errpr mmm', formValues[key], key )
        isValid = false;
        formErrorsObj.esi_number = 'ESI number must be either 10 or 17 digits';
      }
      const pfPattern = /^\d{12}$/;
      // if (key === 'uan_number' && (formValues[key] === null || formValues[key] === '' || formValues[key].length === 0)) {
      //   isValid = false;
      //   formErrorsObj.uan_number = 'uan_number is Required!';
      // }
      // console.log("trgfdgfdg",formValues.uan_number,key === 'uan_number',!pfPattern.test(formValues.uan_number),(formValues.uan_number !== null ));

      if (
        key === 'uan_number' &&
        formValues.uan_number !== null &&
        !pfPattern.test(formValues[key])
      ) {
        isValid = false;
        formErrorsObj.uan_number = 'PF number must be a 12-digit number';
      }
    });

    await setFormErrors(formErrorsObj);

    console.log('Validation status:', isValid);
    console.log('Form errors:', formErrorsObj);
    if (isValid && value < 3) {
      setChangedForm(true);
      const nextValue =
        storage?.company_type !== 5 && formValues.role_name === 'Salesman'
          ? 4
          : value + 1;
      setValue(nextValue);
    } else {
      const firstSpecificError = finalfieldsToValidate
        .map((k) => formErrorsObj[k])
        .find((msg) => msg && !/is Required!?$/i.test(msg));
      dispatch(
        OpenalertActions({
          msg: firstSpecificError || requiredFieldsAlertMessage,
          severity: 'warning',
        }),
      );
    }
  };

  const handleFourthTabChange = async () => {
    setValue(4);
  };

  const isSingleDepartment = userRole.some(
    (role) =>
      role.role_id === formValues.role_id &&
      role.Department === 'EnabledWithSingleDepartment',
  );

  const isMultipleDepartments = userRole.some(
    (role) =>
      role.role_id === formValues.role_id &&
      role.Department === 'EnabledWithMultipleDepartments',
  );
  const handleSubmit = async (event) => {
    console.log('111');
    event.preventDefault();
    setChangedForm(true);

   


    let isValid = true;
    let formErrorsObj = {...formErrors};
    let setda = '';
    console.log('222');

     const isRestricted = [2, 3, 9, 10, 11, 12].includes(storage?.company_type);

    const restrictedFields =
      storage?.company_type === 12
        ? [
          'dob',
          'designation',
          'employeeId',
          'dateOfJoining',
          'category_id',
          'department_id',
        ]
        : [
          'dob',
          'designation',
          'employeeId',
          'dateOfJoining',
          'location_id',
          'primary_location',
          'category_id',
          'department_id',
        ];

    if (isRestricted) {
      restrictedFields.forEach((field) => {
        formErrorsObj[field] = null;
      });
    }
    // Iterate over form values
    await Object.keys(formValues).map((key, i) => {
      if (isRestricted && restrictedFields.includes(key)) {
        return null;
      }
      console.log('33');
      if (key === 'department_id') {
        if (formValues.role_name === 'Administrator') {
          // Admin role does not require department_id
          formErrorsObj[key] = null;
        } else if (
          formValues[key]?.length === 0 &&
          storage?.company_type !== 12
        ) {
          isValid = false;
          formErrorsObj[key] = 'Department is required!';
        } else {
          formErrorsObj[key] = null;
        }
      } else {
        const isRequired = formValues.role_name !== 'Salesman'
          ? getRequiredFields().includes(key)
          : salesmanrequired.includes(key);
        const isEmpty =
          formValues[key] === null ||
          formValues[key] === '' ||
          (typeof formValues[key] === 'object' && formValues[key].length === 0);

        if (isRequired && isEmpty) {
          isValid = false;
          formErrorsObj[key] =
            key === 'phone_number'
              ? 'Phone number is Required!'
              : capitalize(key) + ' is Required!';
          if (
            (props.status === 'edit' && key === 'password') ||
            key === 'username'
          ) {
            isValid = true;
            formErrorsObj[key] = null;
          }
        } else if (isRequired && formErrors[key] !== null) {
          isValid = false;
        }
      }

      if (key === 'phone_number' && formValues[key] === null) {
        isValid = false;
        formErrorsObj.phone_number = 'Phone number is Required!';
      }

      if (
        key === 'dob' &&
        (formValues[key] === null || formValues[key] === '') &&
        storage?.company_type !== 12
      ) {
        isValid = false;
        formErrorsObj.dob = 'Date of birth is Required!';
      }

      if (
        key === 'dateOfJoining' &&
        (formValues[key] === null ||
          formValues[key] === '' ||
          formErrors.dateOfJoining === 'Date of Joining is Invalid!' ||
          formErrors.dateOfJoining === 'Date Of Joining is Required!') &&
        storage?.company_type !== 12
      ) {
        isValid = false;
        formErrorsObj.dateOfJoining = 'Date of Joining is Required!';
      }

      if (
        key === 'releiving_date' &&
        formErrors.releiving_date === 'Relieving Date is Invalid!' &&
        storage?.company_type !== 12
      ) {
        isValid = false;
        formErrorsObj.releiving_date = 'Relieving Date is Invalid!';
      }

      if (
        props.status !== 'edit' &&
        key === 'password' &&
        passwordValidation(formValues['password']) === false &&
        storage?.company_type !== 12
      ) {
        if (formErrors.password !== null) isValid = false;
        formErrorsObj[key] =
          key === 'password'
            ? 'Password is Required!'
            : capitalize(key) + ' invalid!';
      }

      if (key === 'email' && storage?.company_type === 12) {
  formErrorsObj[key] = null;
  return;
}

      if (
        key === 'phone_number' &&
        phoneValidation(formValues['phone_number']) === false
      ) {
        if (formErrors.phone_number !== null) {
          isValid = false;
          formErrorsObj[key] =
            key === 'phone_number'
              ? 'Phone number is invalid!'
              : capitalize(key) + ' invalid!';
        } else {
          isValid = true;
        }
      }

if (
  key === 'email' &&
  storage?.company_type !== 12 && // ✅ Only validate if NOT type 12
  emailValidation(formValues['email']) === false
) {
  if (formErrors.email !== null) isValid = false;
  formErrorsObj[key] =
    key === 'email' ? 'Email is Required' : capitalize(key) + ' invalid!';
}



      if (key === 'zip' && formErrors.zip !== null) {
        isValid = false;
      }

      if (
        key === 'beneficiary_account_no' &&
        formValues[key] !== null &&
        accountNoValidation(formValues['beneficiary_account_no']) === false
      ) {
        isValid = false;
        formErrorsObj[key] = 'Beneficiary Account No is Invalid!';
      }
      const accExists = searchUserCreationData?.some(
        (acc) =>
          String(formValues.beneficiary_account_no).trim() ===
          String(acc.beneficiary_account_no).trim(),
      );

      if (
        key === 'beneficiary_account_no' &&
        formValues[key] !== null &&
        accExists
      ) {
        isValid = false;
        formErrorsObj[key] = 'Beneficiary Account No Exists!';
      }

      const esiExists = searchUserCreationData?.some(
        (acc) =>
          String(formValues.esi_number).trim() ===
          String(acc.esi_number).trim(),
      );

      if (key === 'esi_number' && formValues[key] !== null && esiExists) {
        isValid = false;
        formErrorsObj[key] = 'ESI No Exists!';
      }
      if (
        key === 'esi_number' &&
        formValues[key] !== null &&
        String(props?.edit_id_data.esi_number).trim() ===
          String(formValues.esi_number).trim()
      ) {
        isValid = true;
        formErrorsObj[key] = null;
      }

      if (
        key === 'beneficiary_account_no' &&
        formValues[key] !== null &&
        String(props?.edit_id_data.beneficiary_account_no).trim() ===
          String(formValues.beneficiary_account_no).trim()
      ) {
        isValid = true;
        formErrorsObj[key] = null;
      }

      // const ifscExists = searchUserCreationData?.some(
      //   (acc) =>
      //     String(formValues.ifsc_code).trim() === String(acc.ifsc_code).trim(),
      // );

      // if (key === 'ifsc_code' && formValues[key] !== null && ifscExists) {
      //   isValid = false;
      //   formErrorsObj[key] = 'IFSC No Exists!';
      // }
      if (
        key === 'ifsc_code' &&
        formValues[key] !== null &&
        String(props?.edit_id_data.ifsc_code).trim() ===
          String(formValues.ifsc_code).trim()
      ) {
        isValid = true;
        formErrorsObj[key] = null;
      }

      const uanExists = searchUserCreationData?.some(
        (acc) =>
          String(formValues.uan_number).trim() ===
          String(acc.uan_number).trim(),
      );

      if (key === 'uan_number' && formValues[key] !== null && uanExists) {
        isValid = false;
        formErrorsObj[key] = 'UAN No Exists!';
      }
      if (
        key === 'uan_number' &&
        formValues[key] !== null &&
        String(props?.edit_id_data.uan_number).trim() ===
          String(formValues.uan_number).trim()
      ) {
        isValid = true;
        formErrorsObj[key] = null;
      }

      if (key === 'ifsc_code') {
        if (
          (formValues[key] === null || formValues[key] === '') &&
          formValues.bank_name !== '' &&
          formValues.bank_name !== null
        ) {
          isValid = false;
          formErrorsObj[key] = 'IFSC code is Required!';
        } else if (
          formValues[key] !== null &&
          ifscValidation(formValues['ifsc_code']) === false
        ) {
          isValid = false;
          formErrorsObj[key] = 'Ifsc code is Invalid!';
        }
      }

      if (
        (!formValues.username || formValues.username.trim() === '') &&
        storage?.company_type !== 12
      ) {
        isValid = false;
        formErrorsObj.username = 'User Name is Required';
      } else {
        formErrorsObj.username = null;
      }

      return null;
    });

    if (
      storage?.company_type !== 12 &&
      (formValues.employeeId === null || formValues.employeeId === '')
    ) {
      isValid = false;
      formErrorsObj.employeeId = 'Employee Code is required!';
    }

    console.log('444', formErrorsObj);
    await setFormErrors(formErrorsObj);
    if (isValid) {
      // Check if the username field has been changed
      // if (formValues.username !== `${getprefix_data[0]?.value}.${formValues.username}`) {
      // console.log(getprefix_data[0],'prefix');
      const final = getprefix_data[0]?.value;
      const second = formValues.username;
      const setda = `${final}.${second}`;
      // }
      // console.log(formValues.username,'username');
      let browser_id = localStorage.getItem('tazk_browser_id')
      if (browser_id) {
        browser_id = JSON.parse(browser_id);
      }
      const {
        first_name,
        person_id,
        employee_id,
        user_role_id,
        last_name,
        gender,
        phone_number,
        alternate_phone_number,
        email,
        address,
        area,
        city,
        state,
        zip,
        country,
        username,
        password,
        dateOfJoining,
        releiving_date,
        role_id,
        primary_location,
        location_id,
        bike_name,
        model,
        mileage,
        dl_number,
        expiry_date,
        role_name,
        latitude,
        longitude,
        attendance_restrictions,
        dob,
        employeeId,
        transaction_type,
        category_id,
        designation,
        bank_name,
        beneficiary_account_no,
        ifsc_code,
        employee_name_in_bank,
        bank_branch,
        bank_address,
        beneficiary_code,
        pan_number,
        enableLiveLocation,
        work_from_home,
        selfie_attendance,
        face_attendance,
        manual_attendance,
        attendance_via_app,
        department_id,
        uan_number,
        esi_number,
        device_attendance,
        payment_mode,
        reporting_manager,
        salary_template_id,
        salary_template_name,
        salary_temp_structure,
        allowanceAmounts,
        deductionAmounts,
        grossAmount,
        monthly_ctc,
        ctc,
        net_pay,
        auto_calculation
        // salary_components
      } = formValues;

      let formDatas = {};
      const prefix = getprefix_data[0]?.value;
      let filteredEvents = events.filter((event) => event.event_id);
      formDatas = {
        first_name,
        person_id,
        employee_id,
        user_role_id,
        last_name,
        gender,
        phone_number,
        office_number: alternate_phone_number,
        designation,
        email,
        address,
        area,
        city,
        state,
        zip,
        country,
        username:
          storage?.company_type === 12
            ? (prefix+'.'+formValues?.phone_number)
            : userName === null
            ? formValues.username
            : userName,
        password:
          storage?.company_type === 12
            ? formValues?.phone_number
            : formValues?.password,
        dateOfJoining,
        releiving_date,
        role_id,
        token,
        primary_location: primary_location?.location_id,
        location_id,
        bike_name,
        model,
        mileage,
        dl_number,
        expiry_date,
        role_name,
        latitude,
        longitude,
        events: filteredEvents,
        attendance_restrictions,
        dob,
        employeeId,
        transaction_type,
        category_id,
        bank_name,
        beneficiary_account_no,
        ifsc_code,
        employee_name_in_bank,
        bank_branch,
        bank_address,
        beneficiary_code,
        pan_number,
        enableLiveLocation,
        work_from_home,
        selfie_attendance,
        face_attendance,
        manual_attendance,
        attendance_via_app,
        department_id:
          Array.isArray(department_id) && department_id.length > 0
            ? department_id
            : [],
        app_access: appAccessEnabled,
        uan_number,
        esi_number,
        device_attendance,
        browser_id : browser_id.id,
        browser_name : browser_id.browser,
        payment_mode,
        reporting_manager,
        salary_template_id,
        salary_template_name,
        salary_temp_structure,
        allowanceAmounts,
        deductionAmounts,
        grossAmount,
        monthly_ctc,
        ctc,
        net_pay,
        auto_calculation: formValues.auto_calculation === true ? 1 : 0
        // salary_components
      };
      console.log('55');
      if (props.status === 'edit') {
        formDatas.person_id = person_id;
        formDatas.department_id =
          Array.isArray(formValues.department_id) &&
          formValues.department_id.length > 0
            ? formValues.department_id
            : [];
        delete formDatas.password;
        if(props.edit_id_data.template_id) {
          delete formDatas.salary_template_id
        }
      }
      props.handleSubmit(getTrimmedData(formDatas));    
    } else {
      dispatch(
        OpenalertActions({
          msg: requiredFieldsAlertMessage,
          severity: 'warning',
        }),
      );
    }
  };

  console.log('evtrvbrtgv', app_config_data);

  // useEffect(()=>{

  //   if(props.StatusUserCreation.length > 0){

  //     props.StatusUserCreation.map((d,i) => {
  //       let formErrorsObj ={...formErrors}
  //       for(let o in d){
  //         if(d[o] === 'exist'){
  //           formErrorsObj[o] = capitalize(o) + ' is Already Exists..!';
  //         }
  //       }

  //       if(props.StatusUserCreation.length-1 ===i){
  //         setFormErrors(formErrorsObj)
  //       }

  //     })
  //   }
  // },[props.StatusUserCreation])

  // const initstatus = () => {
  //   if (props.StatusUserCreation.length > 0) {
  //     props.StatusUserCreation.map((d, i) => {
  //       let formErrorsObj = {...formErrors};
  //       for (let o in d) {
  //         if (d[o] === 'exist') {
  //           formErrorsObj[o] = capitalize(o) + ' is Already Exists..!';
  //         }
  //       }

  //       if (props.StatusUserCreation.length - 1 === i) {
  //         setFormErrors(formErrorsObj);
  //       }
  //     });
  //   }
  // };
  // tempStatus.current = initstatus;
  // useEffect(() => {
  //   tempStatus.current();
  // }, [props.StatusUserCreation]);

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
    setAppAccessEnabled(!appAccessEnabled);
    apiCalls(
      dispatch(
        enableDisableEmpLoginAction({
          employee_id: formValues?.employeeId,
          app_access: !appAccessEnabled,
        }),
      ),
    );
  };

  console.log(formValues, 'formValuesformValues');

  const handleRoleChange = (event, newValue) => {
    const isAdmin = newValue?.role_name === 'Admin';
    // console.log('lgdfgfd',isAdmin,newValue,departmentList);
    setFormValues({
      ...formValues,
      role_id: newValue === null ? null : newValue.role_id,
      role_name: newValue === null ? null : newValue.role_name,
      department_id: isAdmin
        ? null
        : newValue.role_name === 'HR Manager'
        ? [
            departmentList.find(
              (i) => i.department === 'Human Resource' && i.id,
            ),
          ]
        : null,
    });
    console.log('l', isAdmin, formValues, newValue?.role_name);
    if (newValue?.role_name === 'Administrator') {
      setFormErrors({
        ...formErrors,
        ['category_id']: null,
      });
    }
    console.log('l', isAdmin, formErrors, newValue?.role_name);
    if (newValue !== null) {
      setFormErrors({
        ...formErrors,
        ['role_id']: null,
      });
    }
    if (newValue === null) {
      setFormErrors({
        ...formErrors,
        ['role_id']: 'User Role is required',
      });
    }
    if (
      userRole.some(
        (role) =>
          role?.role_id === newValue?.role_id && role.Department === 'Disabled',
      )
    ) {
      setFormErrors({
        ...formErrors,
        ['department_id']: null,
        ['role_id']: null,
      });
    }

    // console.log(formValues.role_id,formErrors.department_id,'test');
    // validationHandler('role_id', newValue === null ? null : newValue.role_id);
  };
  console.log(formValues, 'hhhhh');

  const handleOnKeyUp = (e) => {
    const {value} = e.target;
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
      setPWDRquisite(false);
    } else {
      setPWDRquisite(true);
    }
  };

  // const dublicateRole = props.userRole?.filter((d) => (d.role_name,d.role_id)) || []

  // const shiftValue = shiftList.filter((f) => f.id === formValues.shiftList_id)[0].shift_name
  const keyPress = (e) => {
    if (e.key == 'm') {
      setFormValues({...formValues, gender: 1});
    }
    if (e.key == 'f') {
      setFormValues({...formValues, gender: 2});
    }
    if (e.key == 'o') {
      setFormValues({...formValues, gender: 0});
    }
    //console.log(e,'kk');
  };

  console.log(props, 'newUserProps');

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  const handleChange1 = (event, newValue) => {
    setValue(newValue);
    if(newValue == 4){
      setChangedForm(true);
    }
  };

  const handlePaymentChange = (event, newValue) => {
    setFormValues(prevValues => ({
      ...prevValues,
      payment_mode: newValue
    }));
  };

  const reportingManagerChange = (event, newValue) => {
    console.log("hgft1", newValue)
    setFormValues(prevValues => ({
      ...prevValues,
      reporting_manager: newValue?.employee_id
    }));
    setFormErrors(prevErrors => ({
      ...prevErrors,
      reporting_manager: null
    }));
  };

  const getReportingManagerValue = () => {
  if (!formValues.reporting_manager) return null;
  return reportingManager.find(val => 
    val.employee_id == formValues.reporting_manager
  );
};

  const COMPONENT_KEYS = React.useMemo(() => [
    ...AllowanceType.map(a => a.allowance_code),
    ...deductionType.map(d => d.deduction_code)
  ], [AllowanceType, deductionType]);

  const salaryTemplateChange = (event, newValue) => {
    console.log("hjgs", formValues, newValue)
    if (!newValue) {
      setFormValues(prev => ({
        ...prev,
        salary_template_id: null,
        salary_template_name: null,
        salary_temp_structure: null,
        allowanceAmounts: [],
        deductionAmounts: [],
        grossAmount: null,
        monthly_ctc: null,
        ctc: null,
        net_pay: null,
        auto_calculation: false
      }));
      setSalaryComponents(prev =>
        prev.map(item => ({
          ...item,
          value: ''
        }))
      );

      setFormErrors(prev => ({
        ...prev,
        salary_template_id: null
      }));

      return;
    }

    setFormValues({
      ...formValues,
      salary_template_id: newValue.id,
      salary_template_name: newValue.name,
      salary_temp_structure: null
    });

    setFormErrors({
      ...formErrors,
      salary_template_id: null
    });
    setStructureDialog(true)
    // dispatch(getStructureBasedTemplateAction({ id: newValue.id }));
    console.log("fgdh", newValue)
    const components = COMPONENT_KEYS
      .filter(key => newValue.hasOwnProperty(key))
      .map(key => ({
        key,
        value: newValue[key],
        id: newValue[`${key}_id`] || null
      }));
    setSalaryComponents(components);
  };

  // useEffect(() => {
  //   const componentMap = {};

  //   salaryComponents.forEach(item => {
  //     componentMap[item.key] = item.value === '' ? null : item.value;
  //   });

  //   setFormValues(prev => ({
  //     ...prev,
  //     salary_components: componentMap
  //   }));
  // }, [salaryComponents]);

  const uniqueStructures = React.useMemo(() => {
    if (!Array.isArray(structureBasedTemplate)) return [];

    const map = new Map();

    structureBasedTemplate.forEach(item => {
      // use salary_structure_id or id as unique key
      if (!map.has(item.salary_structure_id)) {
        map.set(item.salary_structure_id, {
          id: item.salary_structure_id,
          name: item.name
        });
      }
    });

    return Array.from(map.values());
  }, [structureBasedTemplate]);

  const handleSave = (data) => {
    setFormValues((prev) => ({
      ...prev,
      allowanceAmounts: data.allowanceAmounts,
      deductionAmounts: data.deductionAmounts,
      salary_temp_structure: data?.name?.id || data?.name,
      grossAmount: data.grossAmount,
      monthly_ctc: data.monthly_ctc,
      ctc: data.ctc,
      net_pay: data.net_pay,
      auto_calculation: data.grossAutoCalculation
    }))
    setStructureDialog(false)
    dispatch(OpenalertActions({ msg: 'Salary Structure Created Successfully', severity: 'success' }))
  }

  const hadleClose = () => {
    setFormValues((prev) => ({
      ...prev,
      salary_template_id: null,
      allowanceAmounts: [],
      deductionAmounts: [],
      salary_temp_structure: null
    }))
    setStructureDialog(false)
  }


  return (
    <>
      {/* <Box sx={{ position: 'relative', height: '100%', minHeight: '100vh'  }}> */}
      {/* <AppHeader hidden={false} /> */}
      {Prompt}
      <Typography
        className='page-title'
        variant='h6'
        align='left'
        style={{paddingBottom: '20px'}}
      >
        {props.open === undefined
          ? props.status === 'create'
            ? `New User`
            : 'Update User'
          : ''}
      </Typography>
      {storage?.company_type === 12 ? (
        <Tabs value={value} onChange={handleChange1} aria-label='tabs example'>
          <Tab icon={<PersonIcon />} label='Personal Info' value={0} />
          <Tab icon={<WidgetsIcon />} label='Application Info' value={1} />
        </Tabs>
      ) : (
        <Tabs value={value} onChange={handleChange1} aria-label='tabs example'>
          <Tab icon={<PersonIcon />} label='Personal Info' value={0} />
          <Tab icon={<WidgetsIcon />} label='Application Info' value={1} />
          <Tab icon={<ReceiptOutlinedIcon />} label='Payroll Info' value={2} />
          {storage.company_type === 5 && <Tab icon={<AccountBalance />} label='Payment Details' value={3} />}
          {formValues.role_id !== null &&
            userRole.some(
              (role) =>
                role.role_id === formValues.role_id &&
                role.role_name === 'Salesman',
            ) && (
              <Tab icon={<TwoWheelerIcon />} label='Vehicle Info' value={4} />
            )}
          {props.status === 'edit' && storage.company_type === 5 && (
              <Tab icon={<GavelIcon />} label='Statutory' value={5} />
            )}
        </Tabs>
      )}
      {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                          item
                        >
                          <Typography
                            variant='h6'
                            align='left'
                            pl='5px'
                          >
                            {'Personal Information'}
                          </Typography>
                        </Grid> */}
      {/* </>
            )
          } */}
      {/* <Grid size={12} display='flex' justifyContent={'flex-end'} pb={10} visibility='hidden'>
      </Grid> */}
      {value === 0 && (
        <div>
          <Grid
            sx={{mt: '13px'}}
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
                  required={true}
                  style={{}}
                  fullWidth={true}
                  placeholder='First Name'
                  label='First Name'
                  name='first_name'
                  value={
                    formValues.first_name === null ? '' : formValues.first_name
                  }
                  color='primary'
                  type='text'
                  regex=''
                  variant='filled'
                  error={formErrors.first_name === null ? false : true}
                  helperText={
                    formErrors.first_name === null
                      ? ''
                      : 'First Name is required!'
                  }
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
                  onChange={handleChange}
                  onBlur={handleChange}
                  style={{}}
                  fullWidth={true}
                  placeholder='Last Name'
                  label='Last Name'
                  name='last_name'
                  value={
                    formValues.last_name === null ? '' : formValues.last_name
                  }
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
                <Box sx={{minWidth: '100%'}}>
                  <FormControl
                    fullWidth={true}
                    required={true}
                    error={formErrors.gender === null ? false : true}
                    variant='filled'
                  >
                    <InputLabel htmlFor='uncontrolled-native'>
                      Gender
                    </InputLabel>
                    <Select
                      variant='filled'
                      name='gender'
                      label='Gender'
                      value={
                        formValues.gender === null ? '' : formValues.gender
                      }
                      onChange={handleChange}
                      onKeyPress={(e) => {
                        setTimeout(() => {
                          keyPress(e);
                        }, 1000);
                      }}
                      inputProps={{
                        name: 'gender',
                        id: 'uncontrolled-native',
                      }}
                    >
                      <MenuItem value={1}>Male</MenuItem>
                      <MenuItem value={2}>Female</MenuItem>
                      {/* <MenuItem value={0}>Others</MenuItem > */}
                    </Select>
                    <FormHelperText>{formErrors.gender}</FormHelperText>
                  </FormControl>
                </Box>
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <TextField
                  onChange={(e) => {
                    const value = e.target.value;
                    // Filter out non-numeric characters
                    const numericValue = value.replace(/[^0-9.-]/g, '');
                    // Update the form value with the filtered value
                    handleChange({
                      target: {name: 'phone_number', value: numericValue},
                    });
                  }}
                  onBlur={handleChange}
                  required={true}
                  style={{}}
                  fullWidth={true}
                  onWheel={(e) => e.target.blur()}
                  placeholder='Phone Number'
                  label='Phone Number'
                  name='phone_number'
                  value={
                    formValues.phone_number === null
                      ? ''
                      : formValues.phone_number
                  }
                  color='primary'
                  type='text'
                  // onKeyDown={(e) => {
                  //   if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                  //     e.preventDefault();
                  //   }
                  // }}
                  variant='filled'
                  error={formErrors.phone_number === null ? false : true}
                  helperText={
                    formErrors.phone_number === null
                      ? ''
                      : formErrors.phone_number
                  }
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
                  onChange={(e) => {
                    const value = e.target.value;

                    const numericValue = value.replace(/[^0-9.-]/g, '');

                    handleChange({
                      target: {
                        name: 'alternate_phone_number',
                        value: numericValue,
                      },
                    });
                  }}
                  onBlur={handleChange}
                  // required
                  style={{}}
                  fullWidth={true}
                  onWheel={(e) => e.target.blur()}
                  placeholder='Office Phone Number'
                  label='Office Phone Number'
                  name='alternate_phone_number'
                  value={
                    formValues.alternate_phone_number === null
                      ? ''
                      : formValues.alternate_phone_number
                  }
                  color='primary'
                  type='text'
                  onKeyDown={(e) => {
                    if (
                      !/^\d$/.test(e.key) &&
                      e.key !== 'Backspace' &&
                      e.key !== 'Delete'
                    ) {
                      e.preventDefault();
                    }
                  }}
                  variant='filled'
                  // error={formErrors.alternate_phone_number === null ? false : true}
                  // helperText={
                  //   formErrors.alternate_phone_number === null ? '' : 'Office Phone Number is required!'
                  // }
                />
              </Grid>
              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <DatePicker
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: isDobRequired,
                        error: isDobRequired && formErrors.dob !== null,
                        helperText: isDobRequired && formErrors.dob !== null ? formErrors.dob : '',
                        variant: 'filled',
                      },
                    }}
                    format='DD/MM/YYYY'
                    value={toMomentOrNull(formValues.dob)}
                    onChange={(e) => {
                      if (!e) {
                        if (isDobRequired) {
                          setFormErrors({
                            ...formErrors,
                            dob: 'Date of birth is required',
                          });
                        }
                        setFormValues({...formValues, dob: null});
                      } else if (e._d) {
                        setStateHandler(
                          'dob',
                          moment(e._d).format('YYYY-MM-DD'),
                        );
                      }
                    }}
                    views={['year', 'month', 'day']}
                    label='DOB'
                    disableFuture
                    maxDate={moment().subtract(18, 'years')} 
                    defaultCalendarMonth={moment().subtract(18, "years")}
                    shouldDisableDate={(day) => {
                      const eighteenYearsAgo = moment()
                        .subtract(18, 'years')
                        .startOf('day');
                      return moment(day).isAfter(eighteenYearsAgo);
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Typography variant='h6' align='left' pl='5px'>
                  {'Contact Information'}
                </Typography>
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <TextField
                  onChange={handleChange}
                  // onBlur={handleChange}
                  required={storage.company_type !== 12}
                  style={{}}
                  fullWidth={true}
                  label='Email'
                  placeholder='Email'
                  value={formValues.email === null ? '' : formValues.email}
                  name='email'
                  type='email'
                  color='primary'
                  regex='/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/'
                  variant='filled'
                  error={formErrors.email === null ? false : true}
                  helperText={formErrors.email === null ? '' : formErrors.email}
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
                  name='address'
                  label='Address'
                  multiline={true}
                  placeholder='Address'
                  rows={2}
                  value={formValues.address === null ? '' : formValues.address}
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
                  name='area'
                  label='Area'
                  multiline={true}
                  placeholder='Area'
                  rows={2}
                  value={formValues.area === null ? '' : formValues.area}
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
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                  // required={true}
                  onWheel={(e) => e.target.blur()}
                  style={{}}
                  fullWidth={true}
                  placeholder='PinCode'
                  label='Pincode'
                  name='zip'
                  inputProps={{maxLength: 6}}
                  value={formValues.zip === null ? '' : formValues.zip}
                  color='primary'
                  type='text'
                  onKeyDown={(e) => {
                    if (
                      !/^\d$/.test(e.key) &&
                      e.key !== 'Backspace' &&
                      e.key !== 'Delete'
                    ) {
                      e.preventDefault();
                    }
                  }}
                  regex=''
                  variant='filled'
                  error={formErrors.zip === null ? false : true}
                  helperText={formErrors.zip === null ? '' : formErrors.zip}
                />
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <Autocomplete
                  fullWidth={true}
                  value={{
                    name: formValues.city === null ? '' : formValues.city,
                  }}
                  name='city'
                  onChange={handleCityChange}
                  id='free-solo-dialog-demo'
                  options={[...Cities]}
                  getOptionLabel={(city) => city.name}
                  selectOnFocus
                  clearOnBlur
                  handleHomeEndKeys
                  freeSolo
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='City'
                      variant='filled'
                      // error={formErrors.city !== null}
                      // helperText={formErrors.city || ''}
                      // required={true}
                    />
                  )}
                />
              </Grid>

              <Grid
                value='one'
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <Autocomplete
                  fullWidth={true}
                  name='state'
                  // defaultValue={`${props.edit_id_data ? props.edit_id_data.map(m => m.state) : ""}`}
                  value={{
                    state: formValues.state === null ? '' : formValues.state,
                  }}
                  options={_.uniqBy(Cities, 'state')}
                  getOptionLabel={(options) => options.state}
                  onChange={handleStateChange}
                  autoHighlight={true}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='State'
                      variant='filled'
                      // error={formErrors.state === null ? false : true}
                      // helperText={formErrors.state === null ? '' : formErrors.state}
                      // required={true}
                    />
                  )}
                />
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <Autocomplete
                  fullWidth={true}
                  name='country'
                  //  defaultValue={`${props.edit_id_data ? props.edit_id_data.map(m =>m.country) : ""}`}
                  //defaultValue
                  value={{name: formValues.country}}
                  options={Country}
                  getOptionLabel={(options) => options.name}
                  // onChange={(e, v) => handleSelect(e, v, "country")}
                  autoHighlight={true}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Country'
                      variant='filled'
                      //error = { formErrors.country === null ? false : true } helperText = { formErrors.country === null ? '' : formErrors.country } required={true}
                    />
                  )}
                />
              </Grid>

              {storage?.company_type !== 12 && (
                <>
                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 4,
                      xs: 12
                    }}>
                    <TextField
                      fullWidth={true}
                      name='latitude'
                      label='Latitude'
                      placeholder='Latitude'
                      color='primary'
                      multiline={false}
                      onWheel={(e) => e.target.blur()}
                      type='text'
                      value={
                        formValues.latitude === null ? '' : formValues.latitude
                      }
                      variant='filled'
                      onChange={(e) => {
                        const value = e.target.value;
                        // Filter out non-numeric characters
                        const numericValue = value.replace(/[^0-9.-]/g, '');
                        // Update the form value with the filtered value
                        handleChange({
                          target: {name: 'latitude', value: numericValue},
                        });
                      }}
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
                      name='longitude'
                      label='Longitude'
                      placeholder='Longitude'
                      color='primary'
                      multiline={false}
                      onWheel={(e) => e.target.blur()}
                      type='text'
                      value={
                        formValues.longitude === null
                          ? ''
                          : formValues.longitude
                      }
                      variant='filled'
                      onChange={(e) => {
                        const value = e.target.value;
                        // Filter out non-numeric characters
                        const numericValue = value.replace(/[^0-9.-]/g, '');
                        // Update the form value with the filtered value
                        handleChange({
                          target: {name: 'longitude', value: numericValue},
                        });
                      }}
                      onBlur={handleChange}
                    />
                  </Grid>{' '}
                </>
              )}

              {/* <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: '100%' }}> */}

              <Grid size={{ xs: 12 }}>
                <Grid
                container
                spacing={2}
                direction='row'
                justifyContent='flex-end'
                sx={{
                  mt: 3,
                  pt: 2,
                  pb: 1,
                  pr: 2,
                  width: '100%',
                }}>
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
      </Button>
    </Grid>
  </Grid>
</Grid>

              {/* </Box> */}
            </Grid>
          </Grid>
        </div>
      )}
      {/* <Grid size={{ xs: 12, sm: 4, md: 4, lg: 3 }}> */}
      {/* <Autocomplete
                // multiple
                // limitTags={2}
                fullWidth={true}
                required
                value={
                  formValues.shiftList_id
                }                
                name='shiftList_id'
                onChange={(event, newValue) => {
                  setFormValues({
                    ...formValues,
                    shiftList_id: newValue === null ? null : newValue.id, 
                    shiftList_name: newValue === null ? null :newValue.shift_name
                  });
                  // validationHandler(
                  //   'shiftList_id', 
                  //   newValue === null ? null : newValue.shiftList_id,
                  // );
                }}
                id='multiple-limit-tags'
                options={_.uniqBy(shiftList, 'shift_name')}
                getOptionLabel={(option) => option.shift_name || ''}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant='outlined'
                    onBlur={handleChange}
                    required={true}
                    label='Shift'
                    error={formErrors.shiftList_id !== null ? true : false}
                    helperText={
                      formErrors.shiftList_id === null
                        ? ''
                        : 'Shift is invalid!'
                    }
                  />
                )}
              /> */}
      {/* <Autocomplete
                // sx={{ width: 300 }}
                fullWidth={true}
                // required            
                name='shiftList_id'
                onChange={(event, newValue) => {
                  setFormValues({
                    ...formValues,
                    shiftList_id: newValue === null ? null : newValue.id, 
                  });
                }}
                options={_.uniqBy(shiftList, 'shift_name')}
                getOptionLabel={(option) => option.shift_name || ''}
                renderInput={(params) => 
                  <TextField 
                    {...params} 
                    label="Shifts" 
                    required={true} 
                  />}
              /> */}
      {/* </Grid> */}
      {value === 1 && (
        <div>
          <Grid
            sx={{mt: '13px',height:'55vh'}}
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
                <Autocomplete
                  value={{
                    role_name:
                      formValues.role_id !== null
                        ? userRole.filter(
                            (f) => f.role_id === formValues.role_id,
                          )[0]?.role_name
                        : '',
                  }}
                  onChange={handleRoleChange}
                  disablePortal
                  name='role_id'
                  id='combo-box-demo'
                  // options={Array.from(new Set(dublicateRole.map((a) => a.role_name))).map(
                  //   (name) => {
                  //     return dublicateRole.find((a) => a.role_name === name);
                  //   }
                  // )}
                  options={_.uniqBy(
                     userRole.filter((role) => {
                      const excludedRoles = ['Front Desk', 'Customer'];
                      if (storage?.company_type === 12) {
                        excludedRoles.push('Employee');
                      }
                        return !excludedRoles.includes(role.role_name);
                      }),
                      'role_name'
                    )}
                  getOptionLabel={(option) => option.role_name || ''}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      onBlur={handleChange}
                      label='User Role'
                      variant='filled'
                      error={formErrors.role_id === null ? false : true}
                      helperText={
                        formErrors.role_id === null
                          ? ''
                          : 'User Role is required!'
                      }
                      required={true}
                    />
                  )}
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
                  inputRef={textRef}
                  fullWidth={true}
                  name='username'
                  label='User Name'
                  autoComplete='off'
                  placeholder='User Name'
                  type='text'
                  value={
                    storage.company_type === 12
                      ? formValues.phone_number || ''
                      : formValues.username
                      ? formValues.username.includes('.')
                        ? formValues.username.split('.')[1] || ''
                        : formValues.username
                      : ''
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        {getprefix_data[0]?.value + '.'}
                      </InputAdornment>
                    ),
                  }}
                  variant='filled'
                  required={
                    !(storage.company_type === 12) && props.status !== 'edit'
                  }
                  onChange={handleChange}
                  onBlur={handleChange}
                  error={
                    storage?.company_type !== 12 ? formErrors.username : false
                  }
                  helperText={
                    storage?.company_type !== 12 ? (
                      formErrors.username === null ? (
                        <div style={{color: 'green'}}>{concate}</div>
                      ) : (
                        formErrors.username
                      )
                    ) : (
                      ''
                    )
                  }
                  disabled={
                    storage.company_type === 12 && !!formValues.phone_number
                  }
                />
              </Grid>

              {props.status === 'edit' ? null : (
                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 4,
                    xs: 12
                  }}>
                  <form>
                    <TextField
                      onChange={handleChange}
                      onFocus={handleOnFocus}
                      onBlur={handleOnBlur}
                      onKeyUp={handleOnKeyUp}
                      fullWidth={true}
                      placeholder='Password'
                      label='Password'
                      name='password'
                      value={
                        storage.company_type === 12
                          ? formValues.phone_number || ''
                          : formValues.password || ''
                      }
                      color='primary'
                      type={showPassword ? 'text' : 'password'}
                      required={
                        !(storage.company_type === 12) &&
                        props.status !== 'edit'
                      }
                      variant='filled'
                      error={!!formErrors.password}
                      helperText={formErrors.password || ''}
                      autoComplete='off'
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton
                              aria-label='toggle password visibility'
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge='end'
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      disabled={
                        storage.company_type === 12 && !!formValues.phone_number
                      }
                    />
                    {pwdRequiste && (
                      <PWDRequisite
                        pwdLengthFlag={
                          checks.pwdLengthCheck ? 'valid' : 'invalid'
                        }
                        removeSpace={checks.removeSpace ? 'invalid' : 'valid'}
                      />
                    )}
                  </form>
                </Grid>
              )}

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <Autocomplete
                  multiple
                  limitTags={2}
                  fullWidth={true}
                  required
                  value={
                    formValues.location_id?.length > 0
                      ? formValues.location_id
                      : []
                  }
                  name='location_id'
                  sx={{
                    '& .MuiFilledInput-root': {
                      height: 'auto !important',
                      minHeight: '46px !important',
                      paddingTop: '20px !important',
                    }
                  }}
                  onChange={(event, newValue) => {
                    setFormValues((prevValues) => {
                      const updatedLocations =
                        newValue?.map((d) => ({
                          location_id: d.location_id,
                          location_name: d.location_name,
                        })) || [];

                      return {
                        ...prevValues,
                        location_id: updatedLocations,
                        primary_location:
                          updatedLocations.length > 0
                            ? updatedLocations[0]
                            : null, // Auto-set primary location
                      };
                    });

                    // Force validation update after setting state
                    setTimeout(() => {
                      validationHandler('location_id', newValue || null);
                      validationHandler(
                        'primary_location',
                        newValue?.[0] || null,
                      );
                    }, 100);
                  }}
                  id='multiple-limit-tags'
                  options={_.uniqBy(stocklocation, 'location_name').filter(
                    (d) =>
                      !formValues.location_id?.some(
                        (f) => d.location_id === f.location_id,
                      ),
                  )}
                  getOptionLabel={(option) => option.location_name || ''}
                  clearIcon={false}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant='filled'
                      onBlur={handleChange}
                      required={true}
                      label='Location'
                      error={formErrors.location_id !== null}
                      helperText={
                        formErrors.location_id === null
                          ? ''
                          : 'Location is required!'
                      }
                    />
                  )}
                />
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <Autocomplete
                  fullWidth={true}
                  required
                  value={formValues.primary_location || null} // Single value instead of array
                  name='primary_location'
                  onChange={(event, newValue) => {
                    setFormValues({
                      ...formValues,
                      primary_location: newValue
                        ? {
                            location_id: newValue.location_id,
                            location_name: newValue.location_name,
                          }
                        : null,
                    });
                    validationHandler('primary_location', newValue || null);
                  }}
                  id='single-location-select'
                  options={_.uniqBy(formValues.location_id, 'location_name')}
                  getOptionLabel={(option) => option.location_name || ''}
                  clearIcon={false}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant='filled'
                      onBlur={handleChange}
                      required={true}
                      label='Primary Location'
                      error={formErrors.primary_location !== null}
                      helperText={
                        formErrors.primary_location === null
                          ? ''
                          : 'Primary Location is required!'
                      }
                    />
                  )}
                />
              </Grid>

              {/* 
          <Grid size={{ xs: 12, sm: 4, md: 4, lg: 3 }}>
            <Autocomplete
              value={formValues.department === null ? '' : formValues.department}
              name='department'
              onChange={(event, newValue) => {
                if (typeof newValue === 'string') {
                  setFormValues({
                    ...formValues,
                    department: ProperCaseFunc(newValue),
                  });
                } else if (newValue && newValue.inputValue) {
                  setFormValues({
                    ...formValues,
                    department: ProperCaseFunc(newValue.inputValue),
                  });
                  setValue([...value, ProperCaseFunc(newValue.inputValue)]);
                } else if (newValue === null) {
                  setFormValues({
                    ...formValues,
                    department: newValue,
                  });
                } else {
                  setFormValues({
                    ...formValues,
                    department: newValue.department,
                  });
                }
                validationHandler('department', newValue?.department ?? '');
              }
              }
              filterOptions={(options, params) => {
                const filtered = filter(options, params);
                const { inputValue } = params;
                let input = ProperCaseFunc(inputValue)
                const isExisting = options.some(
                  (option) => input === option.category,
                );
                if (input !== '' && !isExisting) {
                  filtered.push({
                    inputValue,
                    department: `${input}`,
                  });
                }
                if (value.length) {
                  value.forEach((data) => {
                    filtered.push({
                      inputValue: data,
                      department: data,
                    });
                  });
                }
                return filtered;
              }}
              id='free-solo-dialog-demo'
              options={departmentList}
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return option;
                }
                if (option.inputValue) {
                  return option.department;
                }
                return option.department;
              }}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Department'
                  variant='filled'
                  error={formErrors.department === null ? false : true}
                  helperText={
                    formErrors.department === null ? '' : formErrors.department
                  }
                  required
                  onBlur={handleChange}
                  onChange={handleChange}
                  name='department'
                />
              )}
            />
          </Grid> */}

              {/* {formValues.role_name === 'Salesman' &&
                <> */}
              {/* <Grid size={{ xs: 12, sm: 4, md: 4, lg: 3 }}>
                    <TextField
                      inputRef={textRef}
                      fullWidth={true}
                      name='bike_name'
                      label='Bike Name'
                      placeholder='BikeName'
                      type='text'
                      value={
                        formValues.bike_name === null ? '' : formValues.bike_name
                      }
                      variant='filled'
                      required={formValues.role_name === 'Salesman' ? true : false}
                      onChange={handleChange}
                      onBlur={handleChange}
                      error={formErrors.bike_name === null ? false : true}
                      helperText={
                        formErrors.bike_name === null ? '' : formErrors.bike_name
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4, md: 4, lg: 3 }}>
                    <TextField
                      inputRef={textRef}
                      fullWidth={true}
                      name='model'
                      label='Bike Model'
                      placeholder='Model'
                      type='text'
                      value={
                        formValues.model === null ? '' : formValues.model
                      }
                      variant='filled'
                      required={formValues.role_name === 'Salesman' ? true : false}
                      onChange={handleChange}
                      onBlur={handleChange}
                      error={formErrors.model === null ? false : true}
                      helperText={
                        formErrors.model === null ? '' : formErrors.model
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4, md: 4, lg: 3 }}>
                    <TextField
                      inputRef={textRef}
                      fullWidth={true}
                      name='mileage'
                      label='mileage(km/l)'
                      placeholder='mileage'
                      onWheel={(e) => e.target.blur()}
                      type='number'
                      value={
                        formValues.mileage === null ? '' : formValues.mileage
                      }
                      variant='filled'
                      required={formValues.role_name === 'Salesman' ? true : false}
                      onChange={handleChange}
                      onBlur={handleChange}
                      error={formErrors.mileage === null ? false : true}
                      helperText={
                        formErrors.mileage === null ? '' : formErrors.mileage
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4, md: 4, lg: 3 }}>
                    <TextField
                      inputRef={textRef}
                      fullWidth={true}
                      name='dl_number'
                      label='DrivingLicenseNumber'
                      placeholder='DLNumber'
                      type='text'
                      value={
                        formValues.dl_number === null ? '' : formValues.dl_number
                      }
                      variant='filled'
                      required={formValues.role_name !== 'Salesman' ? false : true}
                      onChange={handleChange}
                      onBlur={handleChange}
                      error={formErrors.dl_number === null ? false : true}
                      helperText={
                        formErrors.dl_number === null ? '' : formErrors.dl_number
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4, md: 4, lg: 3 }}>
                    <LocalizationProvider dateAdapter={DateAdapter}>
                      <DatePicker

                        renderInput={(props) => (
                          <TextField
                            {...props}
                            fullWidth
                            required
                            error={formErrors.expiry_date === null ? false : true}
                            helperText={formErrors.expiry_date === null ? '' : "Expiry date is required"}
                            variant='filled'
                          />
                        )}
                        value={formValues.expiry_date}
                        //onChange={handleChange}
                        onChange={(e) => setStateHandler('expiry_date', moment(e._d).format('YYYY-MM-DD'))} //setFormValues({...formValues,sale_time:e.target.value});
                        label='Expiry Date'

                      />
                    </LocalizationProvider>
                  </Grid> */}
              {/* </> */}
              {/* {props.status === 'edit' ? (
            ''
          ) : (
            <> */}

              {storage?.company_type == 12 && (
                <>
                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 4,
                      xs: 12
                    }}>
                    <Autocomplete
                      multiple
                      limitTags={2}
                      fullWidth
                      required
                      value={formValues?.location_id || []}
                      // value={formValues.location_id?.length > 0 ? stocklocation.filter(loc =>
                      //   formValues.location_id.some(selected => selected.location_id === loc.location_id)) : []
                      // }
                      name='location_id'
                      onChange={(event, newValue) => {
                        setFormValues((prevValues) => {
                          const updatedLocations =
                            newValue?.map((d) => ({
                              location_id: d.location_id,
                              location_name: d.location_name,
                            })) || [];

                          return {
                            ...prevValues,
                            location_id: updatedLocations,
                            primary_location:
                              updatedLocations.length > 0
                                ? updatedLocations[0]
                                : null,
                          };
                        });

                        setTimeout(() => {
                          validationHandler('location_id', newValue || null);
                          validationHandler(
                            'primary_location',
                            newValue?.[0] || null,
                          );
                        }, 100);
                      }}
                      id='multiple-limit-tags'
                      options={_.uniqBy(stocklocation, 'location_id')}
                      getOptionLabel={(option) => option.location_name || ''}
                      clearIcon={false}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant='filled'
                          onBlur={handleChange}
                          required={true}
                          label='Location'
                          error={formErrors.location_id !== null}
                          helperText={
                            formErrors.location_id
                              ? 'Location is required!'
                              : ''
                          }
                        />
                      )}
                    />
                  </Grid>

                  {props.status == 'edit' && (
                    <Grid
                      size={{
                        lg: 3,
                        md: 4,
                        sm: 4,
                        xs: 12
                      }}>
                      <TextField
                        inputRef={textRef}
                        fullWidth={true}
                        name='client_code'
                        label='Client Code'
                        placeholder='Client Code'
                        type='text'
                        value={
                          formValues.client_code === null
                            ? ''
                            : formValues.client_code
                        }
                        variant='filled'
                        required
                        onChange={handleChange}
                        onBlur={handleChange}
                        disabled={true}
                      />
                    </Grid>
                  )}
                </>
              )}

              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Typography variant='h6' align='left' pl='5px'>
                  {''}
                </Typography>
              </Grid>

              {storage.company_type !== 9 && 
              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <FormControl
                  required={true}
                  component='fieldset'
                  // fullWidth={true}
                >
                  <Grid
                    container
                    alignItems='center'
                    direction='row'
                    wrap='nowrap'
                  >
                    <Grid>
                      <Switch
                        style={{}}
                        name='attendance_restrictions'
                        size='medium'
                        color='primary'
                        label='Restrict Location for Attendance'
                        // required={true}
                        disabled={gpsAttendance === true ? false : true}
                        onChange={handleChangeRestriction}
                        checked={
                          formValues.attendance_restrictions === 1
                            ? true
                            : false
                        }
                        // value={formValues.attendance_restrictions}
                      />
                    </Grid>
                    <Grid>
                      <Typography variant='body1' style={{marginLeft: 8}}>
                        Restrict Location for Attendance
                      </Typography>
                    </Grid>
                  </Grid>
                  <FormHelperText></FormHelperText>
                </FormControl>
              </Grid>
              }

              {(storage.subscription_type !== 1 ||
                storage?.company_type !== 12) &&
                app_config_data?.find(
                  (item) =>
                    item.key_name === 'company.enableLiveLocation' &&
                    item.value === 'false',
                ) === undefined && (
                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 4,
                      xs: 12
                    }}>
                    <FormControl
                      required={true}
                      component='fieldset'
                      fullWidth={true}
                    >
                      <Grid
                        container
                        alignItems='center'
                        direction='row'
                        wrap='nowrap'
                      >
                        <Grid>
                          <Switch
                            style={{}}
                            name='enableLiveLocation'
                            size='medium'
                            color='primary'
                            // required={true}
                            disabled={
                              enableLiveLocation === true ? false : true
                            }
                            onChange={handleChangeRestriction}
                            checked={
                              formValues.enableLiveLocation === 1 ? true : false
                            }
                            // value={formValues.enableLiveLocation}
                          />
                        </Grid>
                        <Grid>
                          <Typography variant='body1' style={{marginLeft: 8}}>
                            Enable Live Location
                          </Typography>
                        </Grid>
                      </Grid>
                      <FormHelperText>
                        {/* {formErrors.automatic_reorder_level} */}
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                )}

              {storage?.company_type !== 12 &&
                app_config_data?.find(
                  (item) =>
                    item.key_name === 'company.enableWorkFromHome' &&
                    item.value === 'false',
                ) === undefined && (
                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 4,
                      xs: 12
                    }}>
                    <FormControl
                      required={true}
                      component='fieldset'
                      fullWidth={true}
                    >
                      <Grid
                        container
                        alignItems='center'
                        direction='row'
                        wrap='nowrap'
                      >
                        <Grid>
                          <Switch
                            style={{}}
                            name='work_from_home'
                            size='medium'
                            color='primary'
                            // required={true}
                            disabled={
                              enableWorkFromHome === true ? false : true
                            }
                            onChange={handleChangeRestriction}
                            checked={
                              formValues.work_from_home === 1 ? true : false
                            }
                          />
                        </Grid>
                        <Grid>
                          <Typography variant='body1' style={{marginLeft: 8}}>
                            Work From Home
                          </Typography>
                        </Grid>
                      </Grid>
                      <FormHelperText>
                        {/* {formErrors.automatic_reorder_level} */}
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                )}

              {app_config_data?.find(
                (item) =>
                  item.key_name === 'selfie.attendance' &&
                  item.value === 'false',
              ) === undefined && (
                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 4,
                    xs: 12
                  }}>
                  <FormControl
                    required={true}
                    component='fieldset'
                    fullWidth={true}
                  >
                    <Grid
                      container
                      alignItems='center'
                      direction='row'
                      wrap='nowrap'
                    >
                      <Grid>
                        <Switch
                          style={{}}
                          name='selfie_attendance'
                          size='medium'
                          color='primary'
                          // required={true}
                          disabled={
                            enableSelfieAttendance === true ? false : true
                          }
                          onChange={handleChangeRestriction}
                          checked={
                            enableSelfieAttendance === true &&
                            formValues.selfie_attendance === 1
                              ? true
                              : false
                          }
                        />
                      </Grid>
                      <Grid>
                        <Typography variant='body1' style={{marginLeft: 8}}>
                          Selfie Attendance
                        </Typography>
                      </Grid>
                    </Grid>
                    <FormHelperText>
                      {/* {formErrors.automatic_reorder_level} */}
                    </FormHelperText>
                  </FormControl>
                </Grid>
              )}

              {storage.subscription_type === 3 ||
                (storage.subscription_type === 4 &&
                  app_config_data?.find(
                    (item) =>
                      item.key_name === 'offline.attendance' &&
                      item.value === 'false',
                  ) === undefined && (
                    <Grid
                      size={{
                        lg: 3,
                        md: 4,
                        sm: 4,
                        xs: 12
                      }}>
                      <FormControl
                        required={true}
                        component='fieldset'
                        // fullWidth={true}
                      >
                        <Grid
                          container
                          alignItems='center'
                          direction='row'
                          wrap='nowrap'
                        >
                          <Grid>
                            <Switch
                              style={{}}
                              name='face_attendance'
                              size='medium'
                              color='primary'
                              // required={true}
                              disabled={
                                !(
                                  enableFaceAttendance ||
                                  enableOfflineAttendance
                                )
                              }
                              onChange={handleChangeRestriction}
                              checked={
                                formValues.face_attendance === 1 ? true : false
                              }
                            />
                          </Grid>
                          <Grid>
                            <Typography variant='body1' style={{marginLeft: 8}}>
                              Face Attendance
                            </Typography>
                          </Grid>
                        </Grid>
                        <FormHelperText>
                          {/* {formErrors.automatic_reorder_level} */}
                        </FormHelperText>
                      </FormControl>
                    </Grid>
                  ))}

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <FormControl
                  required={true}
                  component='fieldset'
                  fullWidth={true}
                >
                  <Grid
                    container
                    alignItems='center'
                    direction='row'
                    wrap='nowrap'
                  >
                    <Grid>
                      <Switch
                        style={{}}
                        name='app_access'
                        size='medium'
                        color='primary'
                        onChange={handleToggleChange}
                        checked={appAccessEnabled}
                      />
                    </Grid>
                    <Grid>
                      <Typography variant='body1' style={{marginLeft: 8}}>
                        App Access
                      </Typography>
                    </Grid>
                  </Grid>
                  <FormHelperText>
                    {/* {formErrors.automatic_reorder_level} */}
                  </FormHelperText>
                </FormControl>
              </Grid>

              {storage?.company_type !== 12 &&
                app_config_data?.find(
                  (item) =>
                    item.key_name === 'manual.attendance' &&
                    item.value === 'false',
                ) === undefined && (
                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 4,
                      xs: 12
                    }}>
                    <FormControl
                      required={true}
                      component='fieldset'
                      // fullWidth={true}
                    >
                      <Grid
                        container
                        alignItems='center'
                        direction='row'
                        wrap='nowrap'
                      >
                        <Grid>
                          <Switch
                            style={{}}
                            name='manual_attendance'
                            size='medium'
                            color='primary'
                            // required={true}
                            disabled={
                              enableManualAttendance === true ? false : true
                            }
                            onChange={handleChangeRestriction}
                            checked={
                              enableManualAttendance === true &&
                              formValues.manual_attendance === 1
                                ? true
                                : false
                            }
                          />
                        </Grid>
                        <Grid>
                          <Typography variant='body1' style={{marginLeft: 8}}>
                            Manual Attendance
                          </Typography>
                        </Grid>
                      </Grid>
                      <FormHelperText>
                        {/* {formErrors.automatic_reorder_level} */}
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                )}
              {storage.company_type !== 9 && 
              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <FormControl required={true} component='fieldset'>
                  <Grid
                    container
                    alignItems='center'
                    direction='row'
                    wrap='nowrap'
                  >
                    <Grid>
                      <Switch
                        style={{}}
                        name='attendance_via_app'
                        size='medium'
                        color='primary'
                        disabled={
                          enablettendance_via_app === true ? false : true
                        }
                        onChange={handleChangeRestriction}
                        checked={
                          enablettendance_via_app === true &&
                          formValues.attendance_via_app === 1
                            ? true
                            : false
                        }
                      />
                    </Grid>

                    <Grid>
                      <Typography variant='body1' style={{marginLeft: 8}}>
                        Attendance Via App
                      </Typography>
                    </Grid>
                  </Grid>
                  <FormHelperText></FormHelperText>
                </FormControl>
              </Grid>
              }
              {[3, 4].includes(storage.subscription_type) && (
                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 4,
                    xs: 12
                  }}>
                  <FormControl required={true} component='fieldset'>
                    <Grid
                      container
                      alignItems='center'
                      direction='row'
                      wrap='nowrap'
                    >
                      <Grid>
                        <Switch
                          style={{}}
                          name='device_attendance'
                          size='medium'
                          color='primary'
                          disabled={
                            enableDeviceAttendance === true ? false : true
                          }
                          onChange={handleChangeRestriction}
                          checked={
                            enableDeviceAttendance === true &&
                            formValues.device_attendance === 1
                              ? true
                              : false
                          }
                        />
                      </Grid>

                      <Grid>
                        <Typography variant='body1' style={{marginLeft: 8}}>
                          Device Attendance
                        </Typography>
                      </Grid>
                    </Grid>
                    <FormHelperText></FormHelperText>
                  </FormControl>
                </Grid>
              )}
              <Grid size={{ xs: 12 }}>
                <Grid
                  container
                  spacing={2}
                  direction='row'
                  justifyContent='flex-end'
                  sx={{ mt: 3, pt: 2, pb: 1, pr: 2, width: '100%' }}
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

                  {storage?.company_type === 12 ? (
                    <Grid>
                      <Button
                        onClick={handleSubmit}
                        style={{}}
                        name='Submit'
                        variant='contained'
                        color='primary'
                        size='medium'
                        text='button'
                        fullWidth={false}
                        type='submit'
                        // disabled={!changedForm ? true : false}
                      >
                        Submit
                      </Button>
                    </Grid>
                  ) : (
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
                  )}
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
            sx={{mt: '13px',height:'55vh'}}
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
              {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                item
              >
                <Typography
                  variant='h6'
                  align='left'
                  pl='5px'
                >
                  {'Payroll Information'}
                </Typography>
              </Grid> */}

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <TextField
                  inputRef={textRef}
                  fullWidth={true}
                  name='employeeId'
                  label='Employee Code'
                  placeholder='Employee Code'
                  type='text'
                  value={
                    formValues.employeeId === null ? '' : formValues.employeeId
                  }
                  variant='filled'
                  required
                  onChange={handleChange} 
                  onBlur={handleChange}
                  error={formErrors.employeeId !== null}
                  helperText={
                    formErrors.employeeId
                      ? 'Employee Code is required!'
                      : ''
                  }
                />
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <Box
                  sx={{
                    width: '100%',
                    '& .MuiAutocomplete-inputRoot': {
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'flex-start',
                      minHeight: '56px',   
                      height: 'auto', 
                      overflow: 'visible', 
                    },
                    '& .MuiFilledInput-root': {
                      height: 'auto',
                      minHeight: 'unset',
                      alignItems: 'flex-start',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                    },

                    '& .MuiChip-root': {
                      margin: '4px 6px 4px 0',
                    },
                  }}
                >

                  <Autocomplete
                    multiple={isMultipleDepartments}
                    limitTags={expandChips ? -1 : 2}
                    onOpen={() => setExpandChips(true)}
                    onClose={() => setExpandChips(false)}
                    value={
                      isMultipleDepartments
                        ? formValues.department_id?.length > 0
                          ? formValues.department_id
                          : []
                        : formValues.department_id?.[0] || null
                    }
                    sx={{
                      width: '100%',
                      '& .MuiAutocomplete-inputRoot': {
                        flexWrap: 'wrap',
                        alignItems: 'flex-start',
                        minHeight: '56px',
                        height: 'auto',
                      },
                    }}
                    name='department'
                    onInputChange={(e, value) => {
                      // Update department_name as user types
                      let isNotNullDepartments =
                        formValues?.department_id?.filter((x) => x?.id) || [];
                      let isExist = departmentList?.some(
                        (x) =>
                          x?.department?.toLowerCase() == value?.toLowerCase(),
                      );
                      let dValues = [...(formValues?.department_id || [])]; // Ensure it's always an array

                      if (value) {
                        if (isNotNullDepartments.length > 0) {
                          if (!isExist) {
                            // Optionally push the new department if it doesn't exist
                            // dValues.push({ id: null, department: value });
                          }
                        } else {
                          if (!isExist) {
                            // Add the new department if none exist
                            dValues = [{ id: null, department: value }];
                          }
                        }
                      } else {
                        if (isNotNullDepartments.length > 0) {
                          // Keep only valid departments (ones with id)
                          dValues = dValues.filter((x) => x?.id);
                        } else {
                          dValues = [];
                        }
                      }

                      // Set the updated department values
                      setFormValues({ ...formValues, department_id: dValues });
                    }}
                    onChange={(event, newValue) => {
                      let updatedDepartment;

                      if (Array.isArray(newValue)) {
                        // Handle multiple departments selected
                        updatedDepartment =
                          newValue.length > 0
                            ? newValue.map((d) => ({
                              id: d.id,
                              department: d.department,
                            }))
                            : [];
                      } else if (newValue) {
                        // Handle single department selected
                        updatedDepartment = [
                          {
                            id: newValue.id,
                            department: newValue.department,
                          },
                        ];
                      } else {
                        // Handle when no department is selected
                        updatedDepartment = [];
                      }

                      setFormValues({
                        ...formValues,
                        department_id: updatedDepartment,
                      });

                      // Clear the error when value is filled
                      setFormErrors((prevErrors) => ({
                        ...prevErrors,
                        department_id:
                          isDepartmentRequired && updatedDepartment.length === 0
                            ? 'Department is required!'
                            : null,
                      }));

                    }}
                    id='multiple-limit-tags'
                    options={_.uniqBy(departmentList, 'department').filter(
                      (d) =>
                        !formValues.department_id?.some(
                          (f) => d.department === f.department,
                        ),
                    )}
                    getOptionLabel={(option) => option.department || ''}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    disabled={userRole.some(
                      (role) =>
                        role.role_id === formValues.role_id &&
                        role.Department === 'Disabled',
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label='Department'
                        sx={{
                          '& .MuiInputBase-root': {
                            alignItems: 'flex-start',
                          },
                        }}
                        variant='filled'
                        error={
                          isDepartmentRequired &&
                          Boolean(formErrors.department_id) &&
                          formValues.role_id !== null
                        }
                        helperText={
                          isDepartmentRequired &&
                            Boolean(formErrors.department_id) &&
                            formValues.role_id !== null &&
                            formValues.role_name !== 'Admin'
                            ? 'Department is required!'
                            : ''
                        }
                        required={isDepartmentRequired}
                        name='department'
                      />
                    )}
                  />
                </Box>
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <Autocomplete
                  options={reportingManager}
                  getOptionLabel={(option) =>
                    `${option.reporter || ''} • ${option.role_name || 'N/A'}`
                  }
                  value={getReportingManagerValue()}
                  onChange={reportingManagerChange}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, textTransform:'capitalize' }}>
                          {`${option.empcode || ""} ${option.empcode ? "-" : ""} ${option.reporter}`}
                        </Typography>
                
                        <Typography variant="caption" color="text.secondary">
                          {option.role_name || "N/A"} {option.department ? "•" : ""} {option.department || ""}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Reporting Manager"
                      variant="filled"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <Autocomplete
                  value={
                    designation.find(
                      (f) => f.designation === formValues.designation,
                    ) || {designation: formValues.designation || ''}
                  }
                  freeSolo
                  onChange={(event, newValue) => {
                    const selectedDesignation =
                      newValue?.designation || event.target.value;

                    setFormValues({
                      ...formValues,
                      designation: selectedDesignation,
                    });
                    if (newValue?.id) {
                      validationHandler('designation', newValue.id);
                    } else {
                      validationHandler(
                        'designation',
                        selectedDesignation ? true : null,
                      );
                    }
                  }}
                  onInputChange={(event, newInputValue) => {
                    setFormValues({
                      ...formValues,
                      designation: newInputValue,
                    });

                    // Validate manually entered text as non-empty
                    validationHandler(
                      'designation',
                      newInputValue ? true : null,
                    );
                  }}
                  onBlur={handleChange}
                  disablePortal
                  name='designation'
                  id='combo-box-demo'
                  required={isDesignationRequired}
                  options={_.uniqBy(designation, 'id')}
                  getOptionLabel={(option) => option.designation || ''}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Designation'
                      variant='filled'
                      required={isDesignationRequired}
                      error={
                        isDesignationRequired &&
                        formErrors.designation !== null
                      }
                      helperText={
                        isDesignationRequired && formErrors.designation
                          ? 'Designation is required!'
                          : ''
                      }
                    />
                  )}
                />
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <Autocomplete
                  value={
                    formValues.category_id
                      ? employeeCategoryList.find(
                          (f) => f.id === formValues.category_id,
                        )
                      : {category_name: ''}
                  }
                  // value={{
                  //   category_id: formValues.category_id !== null
                  //     ? employeeCategoryList?.filter(
                  //       (f) => f.id === formValues.category_id,
                  //     )[0]?.id
                  //     : '',

                  // }}
                  onChange={(event, newValue) => {
                    // console.log("newValue", newValue)
                    setFormValues({
                      ...formValues,
                      category_id: newValue?.id,
                    });
                    if (isCategoryRequired) {
                      validationHandler('category_id', newValue?.id || null);
                    }
                  }}
                  onBlur={handleChange}
                  disablePortal
                  name='category_id'
                  id='combo-box-demo'
                  options={_.uniqBy(employeeCategoryList, 'id')}
                  getOptionLabel={(option) => option.category_name || ''}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Employee Category'
                      variant='filled'
                      required={isCategoryRequired}
                      error={
                        isCategoryRequired &&
                        formErrors.category_id !== null
                      }
                      helperText={
                        isCategoryRequired && formErrors.category_id
                          ? 'Category is required!'
                          : ''
                      }
                    />
                  )}
                />
              </Grid>
              {/* <Grid size={{ xs: 12, sm: 4, md: 4, lg: 3 }}>
                <Autocomplete
                  multiple
                  limitTags={2}
                  fullWidth={true}
                  required={isLocationRequired}
                  value={
                    formValues.location_id?.length > 0
                      ? formValues.location_id
                      : []
                  }
                  name='location_id'
                  sx={{
                    '& .MuiFilledInput-root': {
                      height: 'auto !important',
                      minHeight: '46px !important',
                      paddingTop: '20px !important',
                    }
                  }}
                  onChange={(event, newValue) => {
                    setFormValues((prevValues) => {
                      const updatedLocations =
                        newValue?.map((d) => ({
                          location_id: d.location_id,
                          location_name: d.location_name,
                        })) || [];

                      return {
                        ...prevValues,
                        location_id: updatedLocations,
                        primary_location:
                          updatedLocations.length > 0
                            ? updatedLocations[0]
                            : null, // Auto-set primary location
                      };
                    });

                    // Force validation update after setting state
                    if (isLocationRequired) {
                      setTimeout(() => {
                        validationHandler('location_id', newValue || null);
                        validationHandler('primary_location', newValue?.[0] || null);
                      }, 100);
                    }
                  }}
                  id='multiple-limit-tags'
                  options={_.uniqBy(stocklocation, 'location_name').filter(
                    (d) =>
                      !formValues.location_id?.some(
                        (f) => d.location_id === f.location_id,
                      ),
                  )}
                  getOptionLabel={(option) => option.location_name || ''}
                  clearIcon={false}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant='filled'
                      onBlur={() => {
                        handleChange();
                      }}
                       required={isLocationRequired}
                      label='Location'
                      error={isLocationRequired && formErrors.location_id !== null}
                      helperText={
                        isLocationRequired && formErrors.location_id
                          ? 'Location is required!'
                          : ''
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4, md: 4, lg: 3 }}>
                <Autocomplete
                  fullWidth={true}
                  required={isPrimaryLocationRequired}
                  value={formValues.primary_location || null} // Single value instead of array
                  name='primary_location'
                  onChange={(event, newValue) => {
                    setFormValues({
                      ...formValues,
                      primary_location: newValue
                        ? {
                            location_id: newValue.location_id,
                            location_name: newValue.location_name,
                          }
                        : null,
                    });
                    if (isPrimaryLocationRequired) {
                      validationHandler('primary_location', newValue || null);
                    }
                  }}
                  id='single-location-select'
                  options={_.uniqBy(formValues.location_id, 'location_name')}
                  getOptionLabel={(option) => option.location_name || ''}
                  clearIcon={false}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant='filled'
                      onBlur={handleChange}
                      required={isPrimaryLocationRequired}
                      label="Primary Location"
                      error={
                        isPrimaryLocationRequired &&
                        formErrors.primary_location !== null
                      }
                      helperText={
                        isPrimaryLocationRequired && formErrors.primary_location
                          ? 'Primary Location is required!'
                          : ''
                      }
                    />
                  )}
                />
              </Grid> */}
              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <DatePicker
                    slotProps={{
                      textField: {
                        name: 'dateOfJoining',
                        fullWidth: true,
                        required: isDateOfJoiningRequired,
                        variant: 'filled',
                        error: isDateOfJoiningRequired && formErrors.dateOfJoining !== null,
                        helperText: isDateOfJoiningRequired && formErrors.dateOfJoining ? formErrors.dateOfJoining : '',
                      },
                    }}
                    format='DD/MM/YYYY'
                    value={toMomentOrNull(formValues.dateOfJoining)}
                    onChange={(e) => {
                      if (!e) {
                        if (isDateOfJoiningRequired) {
                          setFormErrors({
                            ...formErrors,
                            dateOfJoining: 'Date of Joining is required',
                          });
                        } else {
                          setFormErrors({
                            ...formErrors,
                            dateOfJoining: null,
                          });
                        }
                        setFormValues({...formValues, dateOfJoining: null});
                        // setChangedForm(true);
                      } else if (e._d) {
                        // setChangedForm(true);
                        setStateHandler(
                          'dateOfJoining',
                          moment(e._d).format('YYYY-MM-DD'),
                        );
                      }
                    }}
                    views={['year', 'month', 'day']}
                    label='Date Of Joining'
                  />
                </LocalizationProvider>
              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                {relievingDateEnabled ? (
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'filled',
                          label: 'Relieving Date',
                          disabled: !relievingDateEnabled,
                          error: formErrors.releiving_date === null ? false : true,
                          helperText: formErrors.releiving_date === null ? '' : formErrors.releiving_date,
                        },
                      }}
                      value={toMomentOrNull(formValues.releiving_date)}
                      format='DD/MM/YYYY'
                      onChange={(date) => {
                        // setChangedForm(true)
                        const formattedDate = date
                          ? moment(date).format('YYYY-MM-DD')
                          : '';
                        setreleiving_date(formattedDate);
                        setStateHandler('releiving_date', formattedDate);
                      }}
                      views={['year', 'month', 'day']}
                      minDate={toMomentValue(formValues.dateOfJoining) || undefined}
                    />
                  </LocalizationProvider>
                ) : (
                  <TextField
                    fullWidth
                    variant='filled'
                    label='Relieving Date'
                    disabled
                  />
                )}
              </Grid>
              {/* <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                {pf ? (
                  <TextField
                    fullWidth
                    variant='filled'
                    label='UAN Number'
                    type='text'
                    name='uan_number'
                    // required
                    value={formValues.uan_number || ''}
                    onChange={handleChange}
                    error={!!formErrors.uan_number}
                    helperText={
                      formErrors.uan_number ? formErrors.uan_number : ''
                    }
                  />
                ) : (
                  <TextField
                    fullWidth
                    variant='filled'
                    label='UAN Number'
                    disabled
                  />
                )}
              </Grid>
              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                {esi ? (
                  <TextField
                    fullWidth
                    variant='filled'
                    label='ESI Number'
                    type='text'
                    name='esi_number'
                    value={formValues.esi_number || ''}
                    onChange={handleChange}
                    // error={formErrors.esi_number !== null ? true : false}
                    error={!!formErrors.esi_number}
                    helperText={
                      formErrors.esi_number ? formErrors.esi_number : ''
                    }
                  />
                ) : (
                  <TextField
                    fullWidth
                    variant='filled'
                    label='ESI Number'
                    disabled
                  />
                )}
              </Grid> */}
                {
                  storage.company_type === 5 &&
                <Grid 
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                  <Autocomplete
                    options={salaryTemplateList}
                    getOptionLabel={(option) => option.name || 'N/A'}
                    disabled={props.edit_id_data?.template_id}
                    value={
                      salaryTemplateList.find(
                        (item) => item.id === formValues.salary_template_id
                      ) || null
                    }
                    onChange={salaryTemplateChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Template"
                        variant="filled"
                        fullWidth
                        error={formErrors.salary_template_id !== null}
                        helperText={formErrors.salary_template_id || ''}
                      />
                    )}
                  />
                </Grid>
                }

              {/* {formValues.salary_template_id && (
                <Grid item lg={3} md={4} sm={4} xs={12}>
                  <Autocomplete
                    options={uniqueStructures || []}
                    getOptionLabel={(option) => option?.name || ''}
                    disabled={props.edit_id_data?.salary_structure_id && props.edit_id_data?.template_id}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    value={
                      uniqueStructures?.find(
                        item => item.id === formValues.salary_temp_structure
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      if (!newValue) {
                        setFormValues(prev => ({
                          ...prev,
                          salary_temp_structure: null
                        }));
                        setSalaryComponents(prev =>
                          prev.map(item => ({
                            ...item,
                            value: ''
                          }))
                        );
                        return;
                      }

                      setFormValues(prev => ({
                        ...prev,
                        salary_temp_structure: newValue.id
                      }));

                      setSalaryComponents(prev =>
                        prev.map(item => {
                          const matched = structureBasedTemplate.find(
                            s => s.allowance_type_id ? s.allowance_type_id === item.id : s.deduction_type_id
                          );
                          console.log("hjgy", matched)
                          return {
                            ...item,
                            value: matched ? Number(matched.allowance_amount || matched.deduction_amount) : item.value
                          };
                        })
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Structure"
                        variant="filled"
                        disabled={props.edit_id_data?.salary_structure_id && props.edit_id_data?.template_id}
                        fullWidth
                      />
                    )}
                  />
                </Grid>
              )} */}

              {/* {formValues.salary_template_id && salaryComponents.map((item) => (
                <Grid item lg={3} md={4} sm={6} xs={12} key={item.key}>
                  <TextField
                    label={item.key}
                    variant="filled"
                    fullWidth
                    type="number"
                    value={item.value}
                    onChange={(e) => {
                      const val = e.target.value;

                      setSalaryComponents(prev =>
                        prev.map(comp =>
                          comp.key === item.key
                            ? {
                              ...comp,
                              value: val === '' ? '' : Number(val)
                            }
                            : comp
                        )
                      );
                    }}
                    InputProps={{
                      sx: {
                        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                          WebkitAppearance: 'none',
                          margin: 0,
                        },
                        '& input[type=number]': {
                          MozAppearance: 'textfield',
                        },
                      },
                    }}
                  />
                </Grid>
              ))} */}

              {/* <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: '100%' }}> */}
              <Grid size={{ xs: 12 }}>
                <Grid
                  container
                  spacing={2}
                  direction='row'
                  justifyContent='flex-end'
                  sx={{ mt: 3, pt: 2, pb: 1, pr: 2, width: '100%' }}
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

                  { (storage.company_type === 5 || formValues.role_name === 'Salesman') ? <Grid>
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
                  </Grid> :
                  <Grid>
                            <Button
                              onClick={handleSubmit}
                              style={{}}
                              name='Submit'
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
                    }
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
            sx={{mt: '13px',height:'55vh'}}
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
              {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                item
              >
                <Typography
                  variant='h6'
                  align='left'
                  pl='5px'
                >
                  {'Bank Details'}
                </Typography>
              </Grid> */}

              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <Autocomplete
                  options={paymentOptions}
                  value={normalizePaymentMode(formValues.payment_mode)}
                  isOptionEqualToValue={(option, value) =>
                    String(option).toLowerCase() ===
                    String(value || '').toLowerCase()
                  }
                  onChange={handlePaymentChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Mode of Payment"
                      variant="filled"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              {normalizePaymentMode(formValues.payment_mode) === 'Bank' && <>
              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <Autocomplete
                  value={{
                    transaction_type:
                      formValues.transaction_type !== null
                        ? bankTransactionType?.filter(
                            (f) => f.id == formValues.transaction_type,
                          )[0]?.transaction_type
                        : '',
                  }}
                  onChange={(event, newValue) => {
                    console.log('newValue', newValue);
                    setFormValues({
                      ...formValues,
                      transaction_type: newValue?.id,
                    });
                    validationHandler('transaction_type', newValue?.id || null);
                  }}
                  onBlur={handleChange}
                  disablePortal
                  name='transaction_type'
                  id='combo-box-demo'
                  options={_.uniqBy(bankTransactionType, 'id')}
                  getOptionLabel={(option) => option.transaction_type || ''}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Transaction Type'
                      variant='filled'
                    />
                  )}
                />
                {/* <TextField
              onChange={handleChange}
              onBlur={handleChange}
              // required
              style={{}}
              fullWidth={true}
              placeholder='Transaction Type'
              label='Transaction Type'
              name='transaction_type'
              value={
                formValues.transaction_type === null ? '' : formValues.transaction_type
              }
              color='primary'
              variant='filled'
              type='text'
              // error={formErrors.transaction_type === null ? false : true }
              // helperText={formErrors.transaction_type === null ? '' : 'Transaction Type is required!' }
            /> */}
              </Grid>

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
                  // required
                  style={{}}
                  fullWidth
                  placeholder='Bank Name'
                  label='Bank Name'
                  name='bank_name'
                  value={
                    formValues.bank_name === null ? '' : formValues.bank_name
                  }
                  color='primary'
                  variant='filled'
                  type='text'
                  // error={formErrors.bank_name === null ? false : true }
                  // helperText={formErrors.bank_name === null ? '' : 'Bank Name is required!' }
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
                  onChange={handleChange}
                  onBlur={handleChange}
                  // required
                  fullWidth={true}
                  placeholder='Beneficiary A/c No.'
                  label='Beneficiary A/c No.'
                  name='beneficiary_account_no'
                  value={
                    formValues.beneficiary_account_no === null
                      ? ''
                      : formValues.beneficiary_account_no
                  }
                  color='primary'
                  //type='number'
                  variant='filled'
                  error={
                    formErrors.beneficiary_account_no === null ? false : true
                  }
                  helperText={
                    formErrors.beneficiary_account_no === null
                      ? ''
                      : formErrors.beneficiary_account_no
                  }
                  // inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
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
                  onChange={handleChange}
                  onBlur={handleChange}
                  // required
                  style={{}}
                  fullWidth={true}
                  placeholder='IFSC Code'
                  label='IFSC Code'
                  name='ifsc_code'
                  value={
                    formValues.ifsc_code === null ? '' : formValues.ifsc_code
                  }
                  color='primary'
                  variant='filled'
                  error={formErrors.ifsc_code === null ? false : true}
                  helperText={
                    formErrors.ifsc_code === null ? '' : formErrors.ifsc_code
                  }
                />
              </Grid>

              {/* Employee Name in Bank */}
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
                  // required
                  style={{}}
                  fullWidth={true}
                  placeholder='Employee Name in Bank'
                  label='Employee Name in Bank'
                  name='employee_name_in_bank'
                  value={
                    formValues.employee_name_in_bank === null ? '' : formValues.employee_name_in_bank
                  }
                  color='primary'
                  variant='filled'
                  error={formErrors.employee_name_in_bank === null ? false : true}
                  helperText={
                    formErrors.employee_name_in_bank === null ? '' : formErrors.employee_name_in_bank
                  }
                />
              </Grid>

              {/* Bank Branch */}
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
                  // required
                  style={{}}
                  fullWidth={true}
                  placeholder='Bank Branch'
                  label='Bank Branch'
                  name='bank_branch'
                  value={
                    formValues.bank_branch === null ? '' : formValues.bank_branch
                  }
                  color='primary'
                  variant='filled'
                  error={formErrors.bank_branch === null ? false : true}
                  helperText={
                    formErrors.bank_branch === null ? '' : formErrors.bank_branch
                  }
                />
              </Grid>

              {/* Bank Address */}
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
                  // required
                  style={{}}
                  fullWidth={true}
                  placeholder='Bank Address'
                  label='Bank Address'
                  name='bank_address'
                  value={
                    formValues.bank_address === null ? '' : formValues.bank_address
                  }
                  color='primary'
                  variant='filled'
                  error={formErrors.bank_address === null ? false : true}
                  helperText={
                    formErrors.bank_address === null ? '' : formErrors.bank_address
                  }
                />
              </Grid>

              {/* Beneficiary Code */}
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
                  // required
                  style={{}}
                  fullWidth={true}
                  placeholder='Beneficiary Code'
                  label='Beneficiary Code'
                  name='beneficiary_code'
                  value={
                    formValues.beneficiary_code === null ? '' : formValues.beneficiary_code
                  }
                  color='primary'
                  variant='filled'
                  error={formErrors.beneficiary_code === null ? false : true}
                  helperText={
                    formErrors.beneficiary_code === null ? '' : formErrors.beneficiary_code
                  }
                />
              </Grid>

              {/* Pan Card */}
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
                  // required
                  style={{}}
                  fullWidth={true}
                  placeholder='Pan Number'
                  label='Pan Number'
                  name='pan_number'
                  value={
                    formValues.pan_number === null ? '' : formValues.pan_number
                  }
                  color='primary'
                  variant='filled'
                  error={formErrors.pan_number === null ? false : true}
                  helperText={
                    formErrors.pan_number === null ? '' : formErrors.pan_number
                  }
                />
              </Grid>

              </>}

              {value === 3 && (
                <Grid
                  style={{marginBottom: '10px'}}
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Grid
                    container
                    spacing={2}
                    direction='row'
                    justifyContent='flex-end'
                    sx={{ mt: 3, pt: 2, pb: 1, pr: 2, width: '100%' }}
                  >
                    {formValues.role_name === 'Salesman' ? (
                      <>
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
                      </>
                    ) : (
                      <>
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
                            onClick={handleSubmit}
                            style={{}}
                            name='Submit'
                            variant='contained'
                            color='primary'
                            size='medium'
                            text='button'
                            fullWidth={false}
                            type='submit'
                            disabled={!changedForm ? true : false}
                          >
                            Submit
                          </Button>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </div>
      )}
      {value === 4 && formValues.role_name === 'Salesman' && (
        <div>
          <Grid
            sx={{mt: '13px',height:'55vh'}}
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Grid container spacing={3} direction='row'>
              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <TextField
                  inputRef={textRef}
                  fullWidth={true}
                  name='bike_name'
                  label='Vehicle Name'
                  placeholder='Vehicle Name'
                  type='text'
                  value={
                    formValues.bike_name === null ? '' : formValues.bike_name
                  }
                  variant='filled'
                  onChange={handleChange}
                  onBlur={handleChange}
                  // error={formErrors.bike_name === null ? false : true}
                  // helperText={formErrors.bike_name === null ? '' : formErrors.bike_name}
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
                  inputRef={textRef}
                  fullWidth={true}
                  name='model'
                  label='Vehicle Model'
                  placeholder='Vehicle Model'
                  type='text'
                  value={formValues.model === null ? '' : formValues.model}
                  variant='filled'
                  onChange={handleChange}
                  onBlur={handleChange}
                  // error={formErrors.model === null ? false : true}
                  // helperText={formErrors.model === null ? '' : formErrors.model}
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
                  inputRef={textRef}
                  fullWidth={true}
                  name='mileage'
                  label='Mileage (km/l)'
                  placeholder='Mileage'
                  onWheel={(e) => e.target.blur()}
                  type='number'
                  value={formValues.mileage === null ? '' : formValues.mileage}
                  variant='filled'
                  onChange={handleChange}
                  onBlur={handleChange}
                  // error={formErrors.mileage === null ? false : true}
                  // helperText={formErrors.mileage === null ? '' : formErrors.mileage}
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
                  inputRef={textRef}
                  fullWidth={true}
                  name='dl_number'
                  label='Driving License Number'
                  placeholder='DL Number'
                  type='text'
                  value={
                    formValues.dl_number === null ? '' : formValues.dl_number
                  }
                  variant='filled'
                  onChange={handleChange}
                  onBlur={handleChange}
                  // error={formErrors.dl_number === null ? false : true}
                  // helperText={formErrors.dl_number === null ? '' : formErrors.dl_number}
                />
              </Grid>
              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 4,
                  xs: 12
                }}>
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <DatePicker
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: !!formValues.dl_number,
                        error: !!formValues.dl_number && formErrors.expiry_date !== null,
                        helperText: !!formValues.dl_number && formErrors.expiry_date !== null ? 'Expiry date is required' : '',
                        variant: 'filled',
                      },
                    }}
                    format='DD/MM/YYYY'
                    value={toMomentOrNull(formValues.expiry_date)}
                    onChange={(e) => {
                      setStateHandler(
                        'expiry_date',
                        e ? moment(e).format('YYYY-MM-DD') : null,
                      );
                    }}
                    label='Expiry Date'
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            style={{marginBottom: '10px'}}
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            {/* <Box sx={{width: '100px' }}> */}
            <Grid size={{ xs: 12 }}>
              <Grid
                container
                spacing={2}
                direction='row'
                justifyContent='flex-end'
                sx={{ mt: 3, pt: 2, pb: 1, pr: 2, width: '100%' }}
              >
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
                    onClick={handleSubmit}
                    style={{}}
                    name='Submit'
                    variant='contained'
                    color='primary'
                    size='medium'
                    text='button'
                    fullWidth={false}
                    type='submit'
                    disabled={!changedForm ? true : false}
                  >
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            {/* </Box> */}
          </Grid>
        </div>
      )}
      {value === 5 && props.status === 'edit' && storage.company_type === 5 && (
        <div>
          <Grid sx={{ mt: '13px' }} size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
            <EmployeeStatutory
              employeeId={formValues.employee_id}
              uanNumber={formValues.uan_number}
              esiNumber={formValues.esi_number}
            />
          </Grid>
        </div>
      )}
      <CancelDialog
        handle={cancel}
        delete={dialog}
        close={() => props.handleClose()}
      ></CancelDialog>

      {
        formValues.salary_template_id !== null &&
        <Dialog open={structureDialog} maxWidth='md' fullWidth>
          <NewSalaryStructure
            type='contactStructure'
            templateId={formValues.salary_template_id}
            handleSave={handleSave}
            handleClose={hadleClose}
          />
        </Dialog>
      }

      {loader && <SimpleBackdrop loader={loader} />}
      {/* </Box> */}
    </>
  );
}

export default NewUser;

