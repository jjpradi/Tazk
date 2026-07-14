import React, { useState, useEffect, useRef, useContext } from 'react';
import _, { sample } from 'lodash';
import { Country } from './Country_list';
// import { State } from './State_List';
// import { Cities } from './City_list';
import Organization from '../pages/sales/customer/Organization';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
import { formLabelsTheme } from './Asterisk';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import * as XLSX from "xlsx-js-style";
import {
  Button,
  Box,
  Switch,
  NativeSelect,
  IconButton,
  Tooltip,
  TextField,
  Typography,
  Grid,
  FormControl,
  FormHelperText,
  FormLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  Select,
  InputLabel,
  MenuItem,
  ButtonGroup,
  Fab,
  Card,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { CollectionsOutlined, Visibility, VisibilityOff, WarningAmberRounded as WarningAmberRoundedIcon } from '@mui/icons-material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { Cities } from '../utils/cities';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import { getTrimmedData } from './trimFunction/index';
import {
  emailValidation,
  phoneValidation,
  gstValidation,
  PWDRequisite,
} from './regexFunction/index';
import BankAndShipping from '../pages/sales/customer/shippingAndBankDetails';
import AddIcon from '@mui/icons-material/Add';
// import DiscountType from './NewDiscountType';
import { getLocationDataBasedOnPincode } from '../components/common';
import NewUser from './NewUser';
import { useSelector, useDispatch } from 'react-redux';
import { getUserRoleAction } from 'redux/actions/userRole_actions';
import { getPriceListAction } from 'redux/actions/priceList_actions';
import { allListStockLocation } from 'redux/actions/stock_Location_actions';
import { createUserCreationAction, updateUsercreationallAction } from 'redux/actions/userCreation_actions';
import {read, utils} from 'xlsx-js-style';
import { useNavigate } from 'react-router-dom';
import context from '../context/CreateNewButtonContext';
import SimpleBackdrop from 'pages/common/Loader';
import Loader from '../pages/common/Loader';
import { listTaxCategoryAction } from 'redux/actions/tax_Category_actions';
import { listTaxCodesAction } from 'redux/actions/taxcodes_actions';
import apiCalls from 'utils/apiCalls';
import { async } from '@firebase/util';
//import { data2 } from './dashboard/payable_receivable/workingCapital';
import { SetCustomer } from 'redux/actions/pos_product_list';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { listDiscountTypeAction } from 'redux/actions/discountType_actions';
import { customerDetailByIdAction, get_searchContactsActionFinal, getCusCompanyNameAction, listCustomerAction } from 'redux/actions/customer_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { restrictNewCreationBasedOnPlanAction } from 'redux/actions/subscription_action';
import { getCreditDaysLovAction } from 'redux/actions/termsConditions_actions';
import { useCustomFetch } from 'utils/useCustomFetch';
import { getAppConfigDataAction, getprefixAction } from 'redux/actions/app_config_actions';
import { requestForToken } from 'firebase/firebase.service';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import { getIndustryTypeAction } from 'redux/actions/company_actions';
import API_URLS from '../utils/customFetchApiUrls';
import { mapEmployeeBasedSalaryAction } from 'redux/actions/salary_actions';
import { getSupplierDetailsByIdAction } from 'redux/actions/vendor_actions';
import VendorService from '../services/vendor_services';
import { getsearchSalesManListAction } from 'redux/actions/fuelAllowance_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import moment from 'moment';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import toMomentOrNull from 'utils/DateFixer';


function NewCustomer(props) {
 
  const textRef = useRef(null);
  const storage = getsessionStorage();
  const selectedRole = storage.role_name
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
    selectData, setselectData,type
  } = useContext(context);

  const [token, setToken] = useState('');

  const [locationAlert, setLocationAlert] = useState(false)
  const [formValues, setFormValues] = useState({
    first_name: null,
    last_name: null,
    gender: null,
    phone_number: null,
    alternate_phone_number: null,
    email: null,
    address: null,
    area: null,
    city: null,
    state: null,
    zip: null,
    country: 'India',
    comments: null,
    company_name: null,
    account_number: null,
    taxable: 1,
    tax_id: null,
    discount_type: null,
    package_id: null,
    sales_person: null,
    designation: null,
    customer_type: null,
    credit_days: null,
    credit_days_value: 0,
    credit_value: null,
    price_list: null,
    tcs: 0,
    latitude: null,
    longitude:null,
    pan:null,
    father_name:null,
    gst_type:null,
    username : null,
    password : null,
    turn_over: null,
    net_worth: null,
    industry_type: null,
    years_in_business: null,
    credit : null,
    debit : null,
    salesMan: null,
    opening_date: null
  });
  const [contacts, setContacts] = useState([]);
  const [loader, setLoader] = useState(false)
  const [appAccess,setAppAccess] = useState(false)
  const [webAccess,setWebAccess] = useState(false)
  const [pwdRequiste, setPWDRquisite] = useState(false);
   const [showPassword, setShowPassword] = useState(false);
     const [concate, setconcate] = useState('')
     const [userName, setUserName] = useState(null)
    const [checks, setChecks] = useState({
      capsLetterCheck: false,
      numberCheck: false,
      removeSpace: true,
      pwdLengthCheck: false,
      specialCharCheck: false,
    });

  //const [formValues1, setFormValues1] = useState({ first_name: null, last_name: "", gender: null, phone_number: null, alternate_phone_number: null, email: null, address: null, area: null, city: null, state: null, zip: null, country: 'India', comments: null, company_name: null, account_number: null, taxable: null, tax_id: null, discount: null, discount_type: null, package_id: null, sales_person: null, designation: null, customer_type: null });
  const [formErrors, setFormErrors] = useState({
    company_name: null,
    tax_id: null,
    phone_number: null,
    alternate_phone_number: null,
    email: null,
    address: null,
    area: null,
    zip: null,
    // first_name: null,
    // gender: null,
    state: null,
    city: null,
    // price_list: null,
    // credit_days_value: null,
    gst_type: null,
    username: null,
    password : null,
    credit: null,
    debit: null
  });

  // console.log("formErrors",formErrors)


  const [company] = useState(['company_name']);
  const [customer_required] = useState(['company_name'])

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
  
  const handleStateChange = (event, val) => {
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

  const [single, setsingle] = useState('');
  // let priceList = props.type_id  === 1 && 2 ? 'price_list' : '';
// console.log('wqeqweq',props?.edit_id_data)
  const [requiredFields,setRequiredFields] = useState([
    // 'first_name',
    // 'gender',
    'phone_number',
    'zip',
    'state',
    'city',
    company,
    customer_required,
    // ...((appAccess == true) ? ['username', 'password'] : [])
  ]);
  // if (storage?.company_type === 3 && single !== 'type:2' && appAccess === true || webAccess == true) {
  //   requiredFields.push('username', 'password');
  // }

  // console.log(appAccess,'appAccessgafaa',requiredFields,webAccess)

  const [type1RequiredFields] = useState([
    // 'first_name',
    'phone_number',
    'zip',
    // 'price_list',
    'city',
    'state'
  ])

  const [regex] = useState({}); // phone_number: /^\d{10}$/ email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  const alter = { alternate_phone_number: /^\d{10}$/, phone_number: /^\d{10}$/ };
  const [validRegex, setValidRegex] = useState({
    email: false,
    phone_number: true,
    alternate_phone_number: true,
  });
  const [unvalidRegex, setUnValidRegex] = useState({
    alternate_phone_number: true,
  });
  const [organizationdata, setorganizationdata] = useState([]);
  const [reOrganizationdata, setReRrganizationdata] = useState([]);
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [unchangeform, setForm] = useState(false);
  const [initialState, setInitialState] = useState({});
  const [initialErrorState, setInitislErrorState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [gstDuplicateDialog, setGstDuplicateDialog] = useState(false);
  const [gstDuplicateVendorName, setGstDuplicateVendorName] = useState('');
  const [pendingSubmitArgs, setPendingSubmitArgs] = useState(null);
  const [viewgender] = useState(true);
  const [asVendor, setasVendor] = useState(true);
  const [shippingData, setShippingData] = useState([]);
  const [bankData, setBankData] = useState([]);
  const [isIndividual, setIsIndividual] = useState(0);
  const [indi_customer_type, setIndiCustomer_type] = useState({ type: 1 })
  const [status, setstatus] = useState('');
  const [edit_id_data, setedit_id_data] = useState([]);
  const [open, setopen] = useState(false);
  const userRole = useSelector((state) => state.UserRoleReducer.userRole)
  const StatusUserCreation = useSelector((state) => state.UserCreationReducer.StatusUserCreation)
  const stocklocation = useSelector((state) => state.stockLocationReducer.allliststocklocation)
    const {
      appConfigReducer: {getprefix_data}, customerReducer: {customer_paginate},
      CompanyReducers: { getIndustryType },
      fuelAllowanceReducer: { searchSalesManList },
      rbacReducer: {menuAccess}
    } = useSelector((state) => state);
  const { PriceListReducer: { price_list }, appConfigReducer: {app_config_data} } = useSelector((state) => state);
  const dispatch = useDispatch();
  const [gst, setgst] = useState(
    false
  );
// console.log(customer_paginate, 'customer_paginate')
  const companyOptions = customer_paginate?.length > 0 ? customer_paginate.map(customer => (customer.company_name ?? '')) : [];
  const addAcc = app_config_data.find(item => item.key_name === "additional_acc")?.value == 1 ? 1 : 0;
  const [tcsvalue, settcs] = useState('Disabled');
  const [gsttypes,Setgsttypes] = useState([])
  const { leadsgender } = props;
  // const classes = useStyles();
  const tempinit = useRef(null);
  const tempinitform = useRef(null);
  const tempsubmitaction = useRef(null);
  // const [value, setValue] = React.useState([]);
  // const filter = createFilterOptions();
  // const dublicate = Cities.filter((d) => (d.Cities)) || []
  const [activeButton,setActiveButton] = useState('Individual')

  const [discountName, setDiscountName] = useState('');
  const {
    customerReducer: { customer,stared_edit_details, customerDetailById },discountTypeReducer:{discount_type_list},
    TermsConditionsReducers : { creditDaysLov }
  } = useSelector((state) => state);
 const customFetch = useCustomFetch();
  const initform = async () => {
    
    setInitialState(formValues);
    setInitislErrorState(formErrors);
     requestForToken(() => {}, setToken);
    dispatch(getCreditDaysLovAction({ searchString : "" }));
    dispatch(getUserRoleAction()), dispatch(allListStockLocation());
    dispatch(getprefixAction())
    dispatch(getIndustryTypeAction());
    if(props.status === 'edit' && props.edit_id_data.customer_id){
      await dispatch(customerDetailByIdAction(props.edit_id_data.customer_id))
    }
    if(props.status === 'edit' && props.edit_id_data.supplier_id){
      await dispatch(getSupplierDetailsByIdAction(props.edit_id_data.supplier_id, (supplierDetails) => {
        const getVendor = supplierDetails || {}
        setorganizationdata(getVendor?.additional_contacts ?? []);
        setShippingData(getVendor?.shipping_address ?? []);
        setBankData(getVendor?.bank_details ?? []);
      }))
    }
    
    const data = await customFetch(API_URLS.GET_GST_TYPES, 'GET');
//    console.log(data?.data, 'data123');
      Setgsttypes(data?.data)
  };
  tempinitform.current = initform;
  useEffect(() => {
    tempinitform.current();
  }, []);

  // useEffect(() => {
  // dispatch(getAppConfigDataAction());
  // }, [])

//   useEffect(() => {
//   if (props.edit_id_data && Object.keys(props.edit_id_data).length > 0) {
//     submitaction();
//   }
// }, [props.edit_id_data]);


  const hasTriggeredApiRef = useRef(false);

// useEffect(() => {
//   const companyNameLength = formValues.company_name?.length || 0;

//   if (companyNameLength === 3 && !hasTriggeredApiRef.current && single == 'type:2') {
//     hasTriggeredApiRef.current = true;

//     const body = {
//       searchString: "",
//       type_details: "customer",
//       type: 1,
//       pageCount: 0,
//       numPerPage: 15,
//     };

//     apiCalls(
//       setModalTypeHandler,
//       setLoaderStatusHandler,
//       dispatch(
//         getCusCompanyNameAction(
//           body,
//           setModalTypeHandler,
//           setLoaderStatusHandler
//         )
//       )
//     );
//   }

//   // Reset the flag if the length drops below 3
//   if (companyNameLength < 3) {
//     hasTriggeredApiRef.current = false;
//   }
// }, [formValues?.company_name]);
  
  // console.log(creditDaysLov, "creditDaysLov")

  
  //--Newcustomer typef
  // useEffect(() => {
  //   setFormValues({ ...formValues, price_list: price_list.length > 0 && price_list[0]?.price_list_name })
  // }, [price_list, props.status !== 'edit'])
  useEffect(() => {
    // console.log('working787')
   
    const defaultType = props.type_id === 2 ? 'type:3' :  props.type_id === 3 ? 'type:4'  :  props.type_id === 1 || (storage.company_type === 3 && props.type_id === 4) ? 'type:2' : 'type:1'; 
   
    setsingle(defaultType);
    if(storage?.company_type == 12)  {
      setsingle('type:4')
    } else if (props.type_id === 0) {
      setsingle('type:1')
      setIsIndividual(0);
    } else if (props.type_id === 1) {
      setsingle('type:2')
      setIsIndividual(1);
    } else if (props.type_id === 2) {
      setsingle('type:3')
      setasVendor(true);
    } else if (props.type_id === 3 && props.edit_id_data?.stared === 0) {
      setsingle('type:4')
      // setasVendor(true);
    } else if (props.type_id === 3 && props.edit_id_data?.stared === 1) {
      switch (props.edit_id_data?.customer_type) {
        case '0':
          setsingle('type:1');
          break;
        case '1':
          setsingle('type:2');
          break;
        case '2':
          setsingle('type:3');
          break;
        case '3':
          setsingle('type:4');
          break;
       
      }
      // setasVendor(true);
    }

  }, [props.type_id, props.edit_id_data.length > 0]);
  
  

  useEffect(() => {
    if (storage.company_type === 5 || storage.company_type === 6 || storage.company_type === 9) {
      setsingle("type:4")
    }
    setopen(single === 'type:4' && true);
    if(single !== 'type:3'){
      setasVendor(false)
    } 
    else{
      setasVendor(true)
    }
    if(single === 'type:2'){
      dispatch(getsearchSalesManListAction({searchString: ''}))
    }
  }, [single])


  useEffect(() => {
    let isMounted = true;

    const setDefaultPriceList = async () => {
      if (
        formValues.price_list === null &&
        price_list.length > 0 &&
        props.status !== 'edit'
      ) {
        const data = price_list.find(
          (item) => item.price_list_name === 'Default',
        );

        if (!isMounted) return;

        await handleChange({
          target: {
            name: 'price_list',
            value: data === null ? '' : data?.id,
          },
        });
      }
    };

    setDefaultPriceList();

    return () => {
      isMounted = false;
    };
  }, [props.status, price_list, formValues.price_list])
  
  const defaultCreditDaysOption = creditDaysLov.length > 0
  ? creditDaysLov[0]  
  : null;

  useEffect(() => {
    if(props.status === 'edit') {
      setFormValues({
        ...formValues,
        credit_days_value : creditDaysLov.find((d) => d.id === props.edit_id_data.credit_days_value),
        discount_type: props.edit_id_data.discount_type,
        industry_type :getIndustryType.find((d) => d.id === props.edit_id_data.industry_type)
      })
      if(Array.isArray(props.discount_type_list)){
        setDiscountName(props.discount_type_list?.find((d) => d.discount_id === props.edit_id_data.discount_type)?.discount_name || '')
      }
    } else {
    setFormValues(prev => ({
      ...prev,
      credit_days_value: prev.credit_days_value || defaultCreditDaysOption
    }));
  }
  }, [props.status, creditDaysLov, props.discount_type_list,getIndustryType])

  const creditdayscalculations = (days) => {
    if (days === 5) {
      let now = new Date();
      let todayDate = new Date().getDate() - 1;
      let numOfDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      let remainingDays = numOfDaysInMonth - todayDate
      return remainingDays;
    } else if(days === 6) {
      let now = new Date();
      let todayDate = new Date().getDate() - 1;
      let numOfDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      let nextMonthTotalDays = new Date(now.getFullYear(), now.getMonth() + 2, 0).getDate()
      let remainingDays = nextMonthTotalDays + numOfDaysInMonth - todayDate
      return remainingDays;
    }
    else if(days == undefined){
      return null
    }
    else{
      return creditDaysLov?.find(creditDays => creditDays.credit_days_value === days.credit_days_value)?.credit_days_value
    }
  }

  Array.isArray(props.discount_type_list) ? console.log(Array.isArray(props.discount_type_list) ) : "nullllll";
  
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

  const validationZipHandler = (name, value) => {
  if (!Object.keys(formErrors).includes(name)) return;

  if (name === 'zip') {
    const zipRegex = /^[1-9][0-9]{5}$/;

    if (!value || value.length === 0) {
      setFormErrors(prev => ({ ...prev, zip: "Zip is required" }));
    } else if (!zipRegex.test(value)) {
      setFormErrors(prev => ({ ...prev, zip: "Enter a valid 6-digit pincode" }));
    } else {
      setFormErrors(prev => ({ ...prev, zip: null }));
    }
  }
};


const handleChange = async (e) => {
  let { name, value } = e.target;
  if (name === 'zip') {
    value = value.replace(/\D/g, '');
    setFormValues(prev => ({ ...prev, zip: value }));
    if (value.length < 6) {
      setFormErrors(prev => ({
        ...prev,
        zip: "Pincode maximum length is 6 digits"
      }));
      return; 
    } else {
      setFormErrors(prev => ({
        ...prev,
        zip: null
      }));
    }
    if (/^[1-9][0-9]{5}$/.test(value)) {
      setLoader(true);
      const locationData = await getLocationDataBasedOnPincode(value);

      if (locationData && locationData.district && locationData.state) {
        textRef.current?.focus?.();
        setFormValues(prev => ({
          ...prev,
          city: locationData.district,
          state: locationData.state
        }));
        setFormErrors(prev => ({
          ...prev,
          city: null,
          state: null
        }));
      } else {
        setFormErrors(prev => ({
          ...prev,
          zip: "Pincode Not Found"
        }));
      }
      setLoader(false);
    }

    return;
  }

  // if (name === 'email') {
  //   setFormValues(prev => ({ ...prev, email: value }));

  //   if (value.trim() === '') {
  //     setFormErrors(prev => ({ ...prev, email: null }));
  //   }
  //   return;
  // }

  // Handle other fields
  setStateHandler(name, value);
  validationZipHandler(name, value);

  // Optional: username logic
  if (name === 'username' && value.length > 0) {
    const final = getprefix_data[0]?.value;
    const setda = `your user name : "${final}.${value}"`;
    setconcate(setda);
    setUserName(`${final}.${value}`);
  }
};



  const handleOnFocus = () => {
    setPWDRquisite(true);
  };

  const handleOnBlur = () => {
    setPWDRquisite(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (e) => {
    e.preventDefault();
  };

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
    if(pwdLengthCheck && !removeSpace){
      setPWDRquisite(false)
    }
    else{
    setPWDRquisite(true)
    }
  };

  // handleChange()
  // useEffect(()=>{
  //     setFormValues(initialState)
  //     setFormErrors(initialErrorState)
  // },[single])

  const cancel = () => {
    setDialog(false);
  };

useEffect(() => {
  if (props.status === 'edit') {
    setgst(Number(formValues?.gst_type) === 1);
  }
}, [props.status, formValues?.gst_type]);
  // console.log(formValues.gst_type,'weqardwerwe')

  // console.log(gst,props.status === 'edit',customerDetailById[0]?.gst == 1,customerDetailById[0]?.gst !== null,'unsdewrewer')

  const GST = (e) => {
    let { value } = e.target;
    const isGst = value === 'true'
    setgst(isGst)
    setFormValues({
      ...formValues,
      gst: isGst ? 1 : 0,
      ...(isGst ? {} : { tax_id: null, gst_type: null })
    })
    
    // setyes(value === 'true' ? 1 : 0);
  }
  const TCS = (event, value) => {
    // let { value } = e.target;
    settcs(value);
    // setyes(value === 'true' ? 1 : 0);
  }

  const handleSelect = (e, value, targetName) => {
    setStateHandler(targetName, value);
  };

  useEffect(() => {
    if(formValues.credit !== null) {
      if(props.status === 'edit') {
         setFormValues((prev) => ({
          ...prev,
          opening_date: props.edit_id_data.opening_date ?? moment()
        }))
      }
      else {
       setFormValues((prev) => ({
          ...prev,
          opening_date: moment()
        }))
      }
    }
    else {
      setFormValues((prev) => ({
        ...prev,
        opening_date: null
      }))
    }
  }, [formValues.credit, props.status])


  const Change = (e) => {
    let value = e.target.value
    
    if(value === 'type:3' || props.type_id === 2){
      setasVendor(true)
    } else {
      setasVendor(false)
    }
    setopen(value === 'type:4' || props.type_id === 3 && true);
    setIsIndividual(value === 'type:2' ? 1 : 0); // 0 - individual / 1 - customer

    // if(value ==='1'){

    let initstate = value === 'true' ? '1' : '0';
    if (props.status === 'edit') {
      if (props.edit_id_data[0]?.customer_type === initstate) {
        // console.log('inisttstststs')
        setFormValues(initialState);
        setFormErrors(initialErrorState);
      } else {
        setFormValues({
          first_name: null,
          last_name: null,
          gender: null,
          phone_number: null,
          alternate_phone_number: null,
          email: null,
          address: null,
          area: null,
          city: null,
          state: null,
          zip: null,
          country: 'India',
          comments: null,
          company_name: null,
          account_number: null,
          taxable: 0,
          tax_id: null,
          discount_type: null,
          package_id: null,
          sales_person: null,
          designation: null,
          customer_type: null,
          credit_days: null,
          credit_value: null,
          latitude: null,
          longitude:null,
          username : null,
          password : null,
          turn_over: null,
          net_worth: null,
          industry_type: null,
          years_in_business: null
        });
        setFormErrors({
          company_name: null,
          // tax_id: null,
          // phone_number: null,
          // alternate_phone_number: null,
          email: null,
          address: null,
          area: null,
          zip: null,
          // first_name: null,
          // gender: null,
          state: null,
          city: null,
          username : null,
          password : null
        });
      }
    } else {      
      setFormValues(initialState);
      setFormErrors(initialErrorState);
    }

    // }
    // console.log(value,props.edit_id_data,'sada887')
    setsingle(value);
    //setDirty();
  };

  const validClose = () => {
    setDialog(true);
  };

  useEffect(() => {
    if (gsttypes?.length > 0 && !formValues?.gst_type && gst === true) {
      // Set default to "Regular Taxpayer" (id: 1)
      setFormValues((prev) => ({
        ...prev,
        gst_type: 1
      }));
    }
  }, [gsttypes, gst]);

  const setStateHandler = async (name, value) => {
    let formObj = {};

    formObj = {
      ...formValues,
      [name]: value === '' ? null : value,
    };

    await setFormValues((prev) => ({...prev, [name]: value === '' ? null : value}));
    validationHandler(name, value);
  };
  const requiredValues = single === 'type:1' ? type1RequiredFields : requiredFields

  const validationHandler = (name, value) => {
  if (!Object.keys(formErrors).includes(name)) return;

  if (
    requiredValues.includes(name) &&
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
  } else if (name === 'email') {
    if (value !== '' && value !== null && emailValidation(value) !== true) {
      setValidRegex({ ...validRegex, email: false });
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name) + ' is Invalid!',
      });
    } else {
      setFormErrors({ ...formErrors, [name]: null });
      setValidRegex({ ...validRegex, email: true });
    }
  } else if (name === 'phone_number') {
    if (phoneValidation(value) !== true) {
      setValidRegex({ ...validRegex, phone_number: false });
      setFormErrors({
        ...formErrors,
        phone_number: "Phone number is Invalid! (Format: 10 digits only)",
      });
    } else if (value === formValues.alternate_phone_number && value) {
      setValidRegex({ ...validRegex, phone_number: false });
      setFormErrors({
        ...formErrors,
        phone_number: "Phone number should be unique",
      });
    } else {
      setFormErrors({ ...formErrors, phone_number: null });
      setValidRegex({ ...validRegex, phone_number: true });
    }
  } else if (name === 'tax_id') {
    if (gstValidation(value) !== true) {
      setValidRegex({ ...validRegex, tax_id: false });
      setFormErrors({
        ...formErrors,
        [name]: 'GST is Invalid!',
      });
    } else {
      setFormErrors({ ...formErrors, [name]: null });
      setValidRegex({ ...validRegex, tax_id: true });
    }
  } else if (name === 'alternate_phone_number') {
    if (value && value !== '') {
      if (phoneValidation(value) !== true) {
        setValidRegex({ ...validRegex, alternate_phone_number: false });
        setFormErrors({
          ...formErrors,
          alternate_phone_number: "Alternate phone number is Invalid! (Format: 10 digits only)",
        });
      } else if (value === formValues.phone_number) {
        setValidRegex({ ...validRegex, alternate_phone_number: false });
        setFormErrors({
          ...formErrors,
          alternate_phone_number: "Alternate phone number should be unique",
        });
      } else {
        setFormErrors({ ...formErrors, alternate_phone_number: null });
        setValidRegex({ ...validRegex, alternate_phone_number: true });
      }
    } else {
      setFormErrors({ ...formErrors, alternate_phone_number: null });
    }
  } else if (name === 'gst_type') {
    if (value === null || value === '') {
      setFormErrors({
        ...formErrors,
        [name]: 'GST Type is Required!',
      });
    } else {
      setFormErrors({ ...formErrors, [name]: null });
    }
  } else if (name === 'username' && storage?.company_type == 3 && single !== 'type:2') {
    if (value === null || value === '') {
      setFormErrors({
        ...formErrors,
        [name]: 'Username is Required!',
      });
    } else {
      setFormErrors({ ...formErrors, [name]: null });
    }
  } else if (name === 'password' && storage?.company_type == 3 && single !== 'type:2') {
    if (value === null || value === '') {
      setFormErrors({
        ...formErrors,
        [name]: 'Password is Required!',
      });
    } else {
      setFormErrors({ ...formErrors, [name]: null });
    }
  } else {
    setFormErrors({ ...formErrors, [name]: null });
  }
};

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const handleCheck = (e) => {
    let { name, checked } = e.target;
    // console.log('Switch toggled:', name, checked);
    setStateHandler(name, checked);
  };
  const checkGstDuplicate = async (taxId) => {
    try {
      const excludeId = props.status === 'edit' ? formValues.supplier_id : null;
      const res = await VendorService.getSuppliersByTaxId(taxId, excludeId);
      const vendors = Array.isArray(res?.data) ? res.data : [];
      return vendors.length > 0 ? vendors[0] : null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let isValid = true;
    let formErrorsObj = { ...formErrors };
    await Object.keys(formValues).map((key) => {
    if (
      requiredValues.includes(key) &&
      (formValues[key] === null || formValues[key] === '') &&
      !(storage?.company_type == 3 && single === 'type:2' && (key === 'username' || key === 'password'))
    ) {
      isValid = false;
      formErrorsObj[key] = capitalize(key.replace(/_/g, ' ')) + ' is Required!';
    } 
    else if(storage?.company_type === 2 && single === 'type:1') {
      if ((formValues.taxable === 1 || formValues.taxable === true) && gstValidation(formValues.tax_id) !== true) {
        isValid = false;
        formErrorsObj[key] = 'GST Number is Required!';
      }
      else {
        isValid = true
        formErrorsObj[key] = null
      }
    }
    else if (alter[key]) {
      if (
        key !== "alternate_phone_number" &&
        formValues[key] &&
        !alter[key].test(formValues[key])
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key.replace(/_/g, ' ')) + ' is Invalid! (Format: 10 digits only)';
      }
      if (
        key === "alternate_phone_number" &&
        formValues[key] &&
        !alter[key].test(formValues[key])
      ) {
        isValid = false;
        formErrorsObj[key] = "Alternate phone number is Invalid! (Format: 10 digits only)";
      }
    }
    return null;
  });
    // console.log(gst,formValues?.gst_type,formValues?.tax_id, "gst_typevv"  )
    if (gst === true && (!formValues?.gst_type || formValues?.gst_type === '' || !formValues?.tax_id || formValues?.tax_id === '')) {
      // console.log('123455');
      
      isValid = false;
      formErrorsObj['gst_type'] = 'GST Type is Required!';
    }
    
    
    if (single === 'type:3') {
      await Object.keys(formValues).map((key, i) => {
        if (
          company.includes(key) &&
          (formValues[key] === null || formValues[key] === '')
        ) {
          isValid = false;
          formErrorsObj[key] = capitalize(key.replace(/_/g, ' ')) + ' is Required!';
        }
        return null;
      });
    }
    if (single === 'type:2') {
      await Object.keys(formValues).map((key, i) => {
        if (
          customer_required.includes(key) &&
          (formValues[key] === null || formValues[key] === '')
        ) {
          isValid = false;
          formErrorsObj[key] = capitalize(key.replace(/_/g, ' ')) + ' is Required!';
        }
        return null;
      });
    }

   await Object.keys(validRegex).map((key) => {
    if (
      validRegex[key] !== true &&
      formValues[key] !== null &&
      formValues[key] !== ''
    ) {
      isValid = false;
      if (key === "phone_number" || key === "alternate_phone_number") {
        formErrorsObj[key] = capitalize(key.replace(/_/g, ' ')) + ' is Invalid! (Format: 10 digits only)';
      } else {
        formErrorsObj[key] = capitalize(key.replace(/_/g, ' ')) + ' is Invalid!';
      }
    }
    return null;
  });


    // if(validRegex.email !== true){
    //     isValid = false
    // }

    // if(validRegex.phone_number !== true){
    //   isValid = false
    // }

    // if(validRegex.alternate_phone_number !== true){
    //   isValid = false
    // }
    // console.log(formErrors,'formErrors');
    
     await setFormErrors(formErrorsObj);
     
     const hasErrors = Object.values(formErrorsObj).some(val => val !== null && val !== '');
    //  console.log("hasErrors",hasErrors)
    if (!isValid || hasErrors) {
      const firstError = Object.values(formErrorsObj).find(val => val);
      dispatch(OpenalertActions({
        msg: firstError || requiredFieldsAlertMessage,
        severity: 'warning'
      }));
      return;
    }

    // if (single === 'true') {
    //   if (!organizationdata.length && formValues.tax_id && formValues.company_name) {
    //     isValid = false
    //   }
    // }

    //  alert("Is Form Valid - " + isValid);

    if(headerLocationId === 'null'){
      setLocationAlert(true)
      return
    }

    // API call..
    if (isValid) {
      const customer_type = single === 'type:2' ? 1 : 0;
      // const taxsValue = single === 'true' ? 1 : formValues.taxable

      // if(single === 'true' ){
      //   // organizations
      //   setFormValues({ ...formValues , taxable : 1})
      // }
      // else{
      //   //individual
      //   setFormValues({ ...formValues , taxable : 0})
      // }

      const {
        company_name,
        customer_id,
        account_number,
        taxable,
        tax_id,
        discount_type,
        credit_days,
        credit_days_value,
        credit_value,
        package_id,
        designation,
        person_id,
        first_name,
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
        comments,
        supplier_id,
        price_list,
        tcs,
        latitude,
        longitude,
        father_name,
        pan,
        gst_type,
        username,
        password,
        turn_over,
        net_worth,
        industry_type,
        years_in_business,
        credit,
        debit,
        salesMan,
        opening_date
      } = formValues;
      let formDatas = {};
      const prefix = getprefix_data[0]?.value;
      formDatas = {
        company_name,
        account_number,
        taxable: single === 'true' ? 1 : taxable,
        tcs: tcsvalue === 'Enabled' ? 1 : 0,
        tax_id,
        discount_type,
        credit_days: creditdayscalculations(credit_days_value),
        credit_days_value : credit_days_value?.id || 0,
        credit_value,
        package_id,
        customer_type,
        price_list,
        gst_type,
        gst : gst === true ? 1 : 0,
        turn_over,
        net_worth,
        industry_type: industry_type?.id || null,
        years_in_business,
        location_id: headerLocationId,
        pos_people: {
          first_name,
          last_name,
          gender,
          phone_number,
          office_number : alternate_phone_number,
          email,
          address,
          area,
          city,
          state,
          zip,
          country,
          comments,
          designation,
          person_id,
          latitude,
          longitude,
          fatherName:father_name,
          pan
        },
        pos_employee : {
          token,
          userName: storage?.company_type === 3 && single == 'type:2' && (appAccess || webAccess)
          ? (prefix+'.'+formValues?.phone_number)
          : userName === null
          ? formValues.username
          : userName,
          password: storage?.company_type === 3 && single == 'type:2' && (appAccess || webAccess)
          ? formValues?.phone_number
          : formValues?.password,
          app_access : appAccess ? 1 : 0,
          customer_web_access  : webAccess ? 1 : 0,
          role_id : role_id?.length > 0 ?  role_id[0].role_id : null

        },
        additional_contacts: (organizationdata || []).map((d) => {
          const { tableData, gender_name, ...record } = d;
          record.seq = 1;
          return record;
        }),

        bank_details: bankData,
        shipping_address: shippingData,
        credit,
        debit,
        salesCustomer: props.salesCustomer === 'salesCustomer' ? 'salesCustomer' : null,
        opening_date: props.status === 'edit' ? opening_date : opening_date ? opening_date.format('YYYY-MM-DD HH:mm:ss') : null
        // first_name, last_name: null,gender: null,phone_number: null,email: null,address: null,area: null,city: null,state: null,zip: null,country: null,comments: null,company_name: null,account_number: null,taxable: null,tax_id: null,discount: null,discount_type: null,package_id: null,points: null,sales_person: null,package_name: null
      };
      if(single === 'type:2'){
        formDatas.salesMan = salesMan
      }

      if (props.status === 'edit') {
        formDatas.customer_id = customer_id;
        if (asVendor) {
          formDatas.supplier_id = supplier_id;
        }
      }
      // GST duplicate check for vendor/supplier records
      if (formDatas.tax_id && (single === 'type:3' || asVendor)) {
        const duplicateVendor = await checkGstDuplicate(formDatas.tax_id);
        if (duplicateVendor) {
          const vendorName = duplicateVendor.company_name || duplicateVendor.first_name || 'Unknown';
          setGstDuplicateVendorName(vendorName);
          setPendingSubmitArgs([getTrimmedData(formDatas), asVendor, isIndividual, indi_customer_type, single, props.type, props.modaltype]);
          setGstDuplicateDialog(true);
          return;
        }
      }
      props.handleSubmit(getTrimmedData(formDatas), asVendor, isIndividual, indi_customer_type, single, props.type, props.modaltype);
      // apiCalls(
      //         setModalTypeHandler,
      //         setLoaderStatusHandler,
      //          dispatch(listCustomerAction(setModalTypeHandler, setLoaderStatusHandler)),
      //       );
    }

  };

  const confirmGstDuplicateSubmit = () => {
    setGstDuplicateDialog(false);
    if (pendingSubmitArgs) {
      props.handleSubmit(...pendingSubmitArgs);
      setPendingSubmitArgs(null);
    }
  };

  const cancelGstDuplicateSubmit = () => {
    setGstDuplicateDialog(false);
    setPendingSubmitArgs(null);
  };

  // console.log(formErrors,'formErrorrs')

 
  //   useEffect (() => {
  //     if (props.selectData.NewDiscountType === true) {     
  //      const filter = [...props.discount_type_list];
  //      const popc = filter[0]?.discount_type;
  //      setStateHandler('discount_type',  popc);
  //      props.setModalStatusHandler(false);
  //      props.setselectData('NewDiscountType', false);
  //    }
  //  },[props.selectData.NewDiscountType])
// console.log(formErrors,gst,'form');

  const submitaction = () => {
    if (_.isEmpty(props.taxcategory)) {
      listTaxCategoryAction();
    }
    if (_.isEmpty(props.taxcode)) {
      listTaxCodesAction();
    }
    if (!_.isEmpty(props.edit_id_data)) {
      // console.log("props.edit_id_data",props.edit_id_data)
      let ID_data = props.edit_id_data;
      //let id = ID_data.map(i => i.id)
      // setPut_id(id)

      var value = ID_data;
      // for (let key of Object.keys(obj)) {
      //   var value = obj[key];

      // }
      for (let data in value) {
        if (data === 'taxable') {
          if (value[data] === 0) {
            value[data] = false;
          } else {
            value[data] = true;
          }
        }
        // if(data === 'tcs'){
        //   if (value[data] === 0) {
        //     value[data] = 'false';
        //   } else {
        //     value[data] = 'true';
        //   }
        // }
      }
      setFormValues(value);
      settcs(value.tcs === 1 ? 'Enabled' : 'Disabled')
      setInitialState(value);
      setValidRegex({
        ...validRegex,
        email: true,
        phone_number: true,
        alternate_phone_number: true,
        tax_id: true,
      });
      setUnValidRegex({ ...unvalidRegex, alternate_phone_number: true });
      value.additional_contacts?.map((d) => {
        d.gender_name =
          d.gender === 1 ? 'Male' : d.gender === 2 ? 'Female' : 'Others';
      });
      // if(!Cities.includes(value.city)){
      //   Cities.push(value.city)
      // }
      setorganizationdata(customerDetailById[0]?.additional_contacts ?? []);
      setShippingData(customerDetailById[0]?.shipping_address ?? []);
      setBankData(customerDetailById[0]?.bank_details ?? []);

      let customer_type = 'type:1';
      if (value.customer_type === '1' || value.customer_type === '0') {
        value.customer_type === '0' ? customer_type = 'type:1' : customer_type = 'type:2'
        setIsIndividual(1);
      } else if (value.supplier_id) {
        customer_type = 'type:3';
        setIsIndividual(3);
        setasVendor(true);
      }
      // setsingle(customer_type);
    }
  };
  tempsubmitaction.current = submitaction;
  // useEffect(() => {
  //  if(Object.keys(props.edit_id_data).length >0){

  //   setsingle(props.edit_id_data.customer_type === '0'?'type:1':'type:2')
  //  }

  // }, [props.edit_id_data]);
  useEffect(() => {
    // if (_.isEmpty(props.tax)) {
    //   props.listTaxAction()
    // }
    tempsubmitaction.current();
  }, []);

  const handleClose = (id) => {
    setopen(false);
  };
  //   useEffect (() => {
  //     if (props.selectData.NewDiscountType === true) {  
  //      const filter = [...props.discount_type_list];
  //      const popc = filter[0]?.discount_id;
  //      setStateHandler('discount_type',  popc);
  //      setFormValues({...formValues,discount_type : popc})
  //      props.setModalStatusHandler(false);
  //      props.setselectData('NewDiscountType', false);
  //    }
  //  },[props.selectData.NewDiscountType])


// const encodeImageFileAsURL = (file) => {
//   if(headerLocationId !== 'null'){
//   const promise = new Promise((resolve, reject) => {
//     const fileReader = new FileReader();
//     fileReader.readAsArrayBuffer(file);

//     fileReader.onload = (e) => {
//       const bufferArray = e.target.result;

//       const wb = XLSX.read(bufferArray, { type: "buffer" });

//       const wsname = wb.SheetNames[0];

//       const ws = wb.Sheets[wsname];

//       const data = XLSX.utils.sheet_to_json(ws);
//       const temp_1_xl_data = data.filter(i => i.company_name && i.phone_number && i.zip && i.city && i.state && i.first_name && i.gender)
//       const xl_data = temp_1_xl_data.map((i) => ({
//         ['company_name']: i.company_name,
//         ['first_name']: i.first_name,
//         ['phone_number']: parseInt(i.phone_number),
//         ['zip']: parseInt(i.zip),
//         ['city']: i.city,
//         ['state']: i.state,
//         ['credit_days']: parseInt(i.credit_days),
//         ['tcs']: parseInt(i.tcs),
//         ['taxable'] : i.gst_number === undefined  ? 0 : 1,
//         ['tax_id']: i.gst_number === undefined ? null : i.gst_number,
//         ['gender']: i.gender === 'Male' ? parseInt(1) : parseInt(2),
//         ['email']: i.email === undefined ? null : i.email,
//         ['address']: i.address === undefined ? null : i.address,
//         ['area']: i.area === undefined ? null : i.area,
//         ['customer_type'] : 1,
//         ['amount'] : i.opening_balance,
//         ['debit'] : Math.sign(i.opening_balance) === -1 ?  0 : (i.opening_balance)*-1,
//         ['credit'] : Math.sign(i.opening_balance) === -1 ? (i.opening_balance)*-1 : 0,
//         ['location_id'] : headerLocationId

//       }));
//       resolve(xl_data);
      
     
//     };
   
//     fileReader.onerror = (error) => {
//       reject(error);
//     };
//   });

//   promise.then((d) => {
//    // setContacts(d);
//     props.Bulkinsert(d);
//   });
// } else {
//   alert('please select location')
// }
// };
  const sampRes = (data) => {
    props.sample(false)
  }
  
const handle_Submit = async (data) => {
  let values = data;
  const body = storage?.company_type == 12
    ? {
        searchString: "",
        type_details: "client",
        type: 5,
        pageCount: 0,
        numPerPage: 15,
      }
    : {
        searchString: "",
        type_details: "employee",
        type: 3,
        pageCount: 0,
        numPerPage: 15,
      };

  if (data.person_id) {

    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(updateUsercreationallAction(
        data.person_id,
        values,
        setLoaderStatusHandler,
        setModalTypeHandler,
        sampRes,
      ))
    );

  } else {

    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(createUserCreationAction(
        data,
        setLoaderStatusHandler,
        setModalTypeHandler,
        sampRes,
      ))
    );
  }

  await Promise.all([
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(get_searchContactsActionFinal(body))
    ),
    dispatch(restrictNewCreationBasedOnPlanAction()),
    props.employeeSetState()
  ]);
};

  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      // !userRole.length > 0 && dispatch(getUserRoleAction()),
      // !stocklocation.length > 0 && dispatch(allListStockLocation()),
      !price_list.lenght > 0 && dispatch(getPriceListAction(setModalTypeHandler, setLoaderStatusHandler)),
      !discount_type_list.lenght > 0 && dispatch(listDiscountTypeAction()),
    );

  }, [])

  

  const selectcash = () => {
    if (selectData.newDiscountType) {
      let filter =Array.isArray(props.discount_type_list) ? props.discount_type_list.filter((e) => { return e}) : []
      const popj = filter[0];
      // fiter = [...props.discount_type_list]
      // setFormValues({...formValues, cashBox: popj.id});
      handleChange({ target: { name: 'discount_type', value: popj?.discount_id || null } });
      validationHandler('discount_type', popj?.discount_id || null);
      setselectData('newDiscountType', true);
      setDiscountName(popj?.discount_name)
    }
  };
  useEffect(() => {
    selectcash()
  }, [selectData.newDiscountType]);

  const keyPress = (e) => {
    if (e.key == "m") {
      setFormValues({ ...formValues, gender: 1 })
    }
    if (e.key == "f") {
      setFormValues({ ...formValues, gender: 2 })
    }
    if(e.key == "o") {
      setFormValues({ ...formValues, gender: 0 })
    }

  }


  function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        aria-labelledby={`full-width-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
        TabPanel.propTypes = {
          children: PropTypes.node,
          index: PropTypes.number.isRequired,
          value: PropTypes.number.isRequired,
        };


        function a11yProps(index) {
          // console.log(index,'index5545')
          return {
            id: `full-width-tab-${index}`,
            'aria-controls': `full-width-tabpanel-${index}`,
          };
        }
        const theme = useTheme();
        const [value, setValue] = useState(0);
      
        const handleTabChange = (event, newValue) => {
          setValue(newValue);
        };
      
        const handleChangeIndex = (index) => {
          setValue(index);
        };

        const typeMapping = {
          '0':'type:1',
          '1':'type:2',
          '2':'type:3',
          '3':'type:4',
        }

        const typeMapping1 = {
          '0':'type:2',
          '1':'type:4',
        }

        const typeMapping2 = {
          '0':'type:2',
          '1':'type:3',
          '2':'type:4',
          '3':'type:1',
        }

        const typeMapping3 = {
          '0':'type:1',
          '1':'type:3',
          '2':'type:4',
        }

        // console.log(props.type_id,'type554545')

    const role_id = userRole?.filter(
          (f) => f.role_name === 'Customer',
        )

        // useEffect(() => {
        //   if (appAccess || webAccess) {
        //     // setFormValues((prev) => ({ ...prev, username: null, password: null }));
        //     setRequiredFields((prev) => [...new Set([...prev, 'username', 'password'])]); 
        //     // setRequiredFields((prev) => prev.filter((field) => field !== 'username' && field !== 'password'));
        //   }
        //   // else if(!webAccess){
        //   //   setRequiredFields((prev) => prev.filter((field) => field !== 'username' && field !== 'password'));
        //   // }
        //   else {
        //     // setRequiredFields((prev) => [...new Set([...prev, 'username', 'password'])]); 
        //     setRequiredFields((prev) => prev.filter((field) => field !== 'username' && field !== 'password'));

        //   }
        // }, [appAccess,webAccess]);

        useEffect(()=>{
          if(formValues?.app_access === 1){
              setAppAccess(true)
          }
          if(customerDetailById[0]?.customer_web_access === 1){
              setWebAccess(true)
          }
          
        },[formValues?.app_access,formValues?.customer_web_access])

        const appAccessFunc = (e,name)=>{
          
          if(name === 'web'){
            setWebAccess(e.target.checked)
          }
          else if(name === 'app'){
            setAppAccess(e.target.checked)
          }

          if(e.target.checked === false && props.status !== 'edit'){
            setFormValues((prev) => ({ ...prev, username: null, password: null }));
            setconcate('')
          }
        }

        useEffect(()=>{
          // console.log(organizationdata,'organizationdata')
          if(organizationdata !== undefined && organizationdata.length > 0){
            const data = organizationdata.filter((e)=> e.status != 1)
            setReRrganizationdata(data)
          }
        },[organizationdata])

      const customerCreate = UserRightsAuthorization(menuAccess[selectedRole], 'contact__customer', 'can_create')
      const vendorCreate = UserRightsAuthorization(menuAccess[selectedRole], 'contact__vendor', 'can_create')
      const employeeCreate = UserRightsAuthorization(menuAccess[selectedRole], 'contact__employee', 'can_create')

        

  return (
    <>
      {Prompt}
      <Grid container display='flex' direction='row'>
        <LocationAlert open={locationAlert} onClose={() => setLocationAlert(false)} />
        {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} fullWidth='true' display='flex' justifyContent={'center'}>
          <Fab
            variant="extended"

            component='label'

          >
            <input type='file' hidden  onChange={(e) => {
          const file = e.target.files[0];
          encodeImageFileAsURL(file);
        }} />
            <UploadFileIcon sx={{ mr: 1 }} />
            <Typography style={{ fontSize: '15px' }}>Upload File</Typography>
          </Fab>

        </Grid> */}
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Typography variant='h6' align='left' style={{paddingBottom: '20px'}} fontFamily="sans-serif" fontSize="13px" fontWeight="600" color='rgba(0, 0, 0, 0.7)' >
            {props.edit_id_data.length === 0
              ? //'Edit Contact'
                `New Contact`
              : 'Edit Contact'}
          </Typography>
        </Grid>

        <Grid
          style={{
            // border: '2px solid grey',
            // borderRadius: '10px',
            justifyContent: 'center',
            display: 'flex',
            // padding: '0px 5px 0px 25px',
            padding: '10px 5px'
          }}
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          {/* <FormControl component='fieldset'> */}
            {/* <FormLabel component="legend">Gender</FormLabel> */}
            {/* <RadioGroup
              row
              aria-label='customer'
              value={single}
              name='customer_type'
              onChange={Change}
            >
              <FormControlLabel
                value='type:1'
                control={<Radio />}
                label='Individual'
              />
              <FormControlLabel
                value='type:2'
                control={<Radio />}
                label='Customer'
              />
              <FormControlLabel
                value='type:3'
                control={<Radio />}
                label='Vendor'
              />
              <FormControlLabel
                value='type:4'
                control={<Radio />}
                label='Employee'
              />
            </RadioGroup> */}

          {/* </FormControl> */}

          {/* <ButtonGroup
            variant = 'outlined' 
            fullWidth
            aria-label='outlined primary button group'
          >
            <Button
              variant={activeButton === 'Individual' ? 'contained' : 'outlined'}
              onClick={() => {
                setActiveButton('Individual')
                Change('type:1')
              }}
            >
              Individual
            </Button>
            <Button
              variant={activeButton === 'Customer' ? 'contained' : 'outlined'}
              onClick={() => {
                setActiveButton('Customer')
                Change('type:2')
              }}
            >
              Customer
            </Button>
            <Button
              variant={activeButton === 'Vendor' ? 'contained' : 'outlined'}
              onClick={() => {
                setActiveButton('Vendor')
                Change('type:3')
              }}
            >
              Vendor
            </Button>
            <Button
              variant={activeButton === 'Employee' ? 'contained' : 'outlined'}
              onClick={() => {
                setActiveButton('Employee')
                Change('type:4')
              }}
            >
              Employee
            </Button>
          </ButtonGroup> */}

<Box sx={{ bgcolor: 'background.paper', width: '100%' }}>
  <AppBar position="static">
  {storage.company_type === 12 ? (
  <Tabs
    indicatorColor="secondary"
    textColor="inherit"
    variant="fullWidth"
    aria-label="full width tabs example"
  >
    <Tab label="Client" {...a11yProps(3)} />
  </Tabs>
) : storage.company_type === 5 || storage.company_type === 6 || storage.company_type === 9 || storage.company_type === 11 ? (
      <Tabs
        value={parseInt(Object.keys(typeMapping).find(key => typeMapping[key] === single))}
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth"
        aria-label="full width tabs example"
      >
        <Tab label="Employee" {...a11yProps(3)} />
      </Tabs>
    ) : storage.company_type === 2 && addAcc == 1 ? (
      <Tabs
        value={parseInt(Object.keys(typeMapping3).find(key => typeMapping3[key] === single))}
        onChange={(e, newValue) => {
          e.target.value = typeMapping3[newValue];
          Change(e);
        }}
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth"
        aria-label="full width tabs example"
      >
        <Tab label="Individual" {...a11yProps(0)} />
        <Tab label="Vendor" {...a11yProps(1)} />
        <Tab label="Employee" {...a11yProps(2)} />
      </Tabs>
    ) : storage.company_type === 10 ? (
      props.edit_id_data.length === 0 ? (
        <Tabs
          value={parseInt(Object.keys(typeMapping1).find(key => typeMapping1[key] === single))}
          onChange={(e, newValue) => {
            e.target.value = typeMapping1[newValue];
            Change(e);
          }}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Customer" {...a11yProps(0)} />
          <Tab label="Employee" {...a11yProps(1)} />
        </Tabs>
      ) : props.type_id === 1 ? (
        <Tabs
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Customer" {...a11yProps(0)} />
        </Tabs>
      ) : (
        <Tabs
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Employee" {...a11yProps(1)} />
        </Tabs>
      )
    ) : storage.company_type === 3 ? (
      (props.edit_id_data.length === 0 ? (<Tabs
        value={parseInt(Object.keys(typeMapping2).find(key => typeMapping2[key] === single))}
        onChange={(e, newValue) => {
          e.target.value = typeMapping2[newValue];
          Change(e);
        }}
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth"
        aria-label="full width tabs example"
      >
        {customerCreate && <Tab label="Customer" {...a11yProps(0)} />}
        {vendorCreate && <Tab label="Vendor" {...a11yProps(1)} />}
        {employeeCreate && <Tab label="Employee" {...a11yProps(2)} />}
        {/* <Tab label="Individual" {...a11yProps(3)} /> */}
      </Tabs>) : props.type_id === 1 ? (
        <Tabs
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Customer" {...a11yProps(0)} />
        </Tabs>
     ) : props.type_id === 2 ? (
        <Tabs
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Vendor" {...a11yProps(1)} />
        </Tabs>
        
      ) :
        (
        <Tabs
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Employee" {...a11yProps(2)} />
        </Tabs>
        
      )) 
      // :
      //  (
      //   <Tabs
      //     indicatorColor="secondary"
      //     textColor="inherit"
      //     variant="fullWidth"
      //     aria-label="full width tabs example"
      //   >
      //     <Tab label="Individual" {...a11yProps(3)} />
      //   </Tabs>
      // )
    )
     : props.edit_id_data.length === 0 ? (
      <Tabs
        value={parseInt(Object.keys(typeMapping).find(key => typeMapping[key] === single))}
        onChange={(e, newValue) => {
          e.target.value = typeMapping[newValue];
          Change(e);
        }}
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth"
        aria-label="full width tabs example"
      >
        <Tab label="Individual" {...a11yProps(0)} />
        <Tab label="Customer" {...a11yProps(1)} />
        <Tab label="Vendor" {...a11yProps(2)} />
        <Tab label="Employee" {...a11yProps(3)} />
      </Tabs>
    ) : props.type_id === 0 ? (
      <Tabs
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth"
        aria-label="full width tabs example"
      >
        <Tab label="Individual" {...a11yProps(0)} />
      </Tabs>
    ) : props.type_id === 1 ? (
      <Tabs
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth"
        aria-label="full width tabs example"
      >
        <Tab label="Customer" {...a11yProps(1)} />
      </Tabs>
    ) : props.type_id === 2 ? (
      <Tabs
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth"
        aria-label="full width tabs example"
      >
        <Tab label="Vendor" {...a11yProps(2)} />
      </Tabs>
    ) : props.type_id === 3 && props.edit_id_data?.stared === 0 ? (
      <Tabs
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth"
        aria-label="full width tabs example"
      >
        <Tab label="Employee" {...a11yProps(3)} />
      </Tabs>
    ) : props.type_id === 3 && props.edit_id_data?.customer_type === "0" ? (
      <Tabs
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth"
        aria-label="full width tabs example"
      >
        <Tab label="Individual" {...a11yProps(0)} />
      </Tabs>
    ) : props.type_id === 3 && props.edit_id_data?.customer_type === "1" ? (
      <Tabs
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth"
        aria-label="full width tabs example"
      >
        <Tab label="Customer" {...a11yProps(1)} />
      </Tabs>
    ) : props.type_id === 3 && props.edit_id_data?.customer_type === "2" ? (
      <Tabs
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth"
        aria-label="full width tabs example"
      >
        <Tab label="Vendor" {...a11yProps(2)} />
      </Tabs>
    ) : props.type_id === 3 && props.edit_id_data?.stared === 1 && props.edit_id_data?.customer_type === "3" ? (
      <Tabs
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth"
        aria-label="full width tabs example"
      >
        <Tab label="Employee" {...a11yProps(3)} />
      </Tabs>
    ) : (
      " "
    )}
  </AppBar>
</Box>

        </Grid>
        
      </Grid>
      {/* <Card style={{padding:'8px 5px 0px 5px'}}> */}
      <Card sx={{borderRadius: "0px", p: '20px', mt:"-9px", mr:"5px", ml:"5px",height: 'calc(100vh - 180px)', overflow: 'auto'}}>
      {open === true ? (
          <NewUser
          open={open}
          edit_id_data={props.edit_id_data}
          status={props.status}
          handleClose={props.handleClose}
          handleSubmit={handle_Submit}
          setopen={setopen}
          // {...this.props}
          // userRole={userRole}
          StatusUserCreation={StatusUserCreation}
          // stocklocation={stocklocation}
        />
      ) : (
        <>
          <Grid
            container
            style={{padding: '10px 5px'}}
            spacing={3}
            direction='row'
          >
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Grid container spacing={3}>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Typography variant='h6'>Basic Details</Typography>
                </Grid>

                {
                  single === 'type:1' && (
                    <>
                      <Grid
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 6,
                          xs: 12
                        }}>
                        <TextField
                          onChange={handleChange}
                          onBlur={handleChange}
                          style={{}}
                          fullWidth={true}
                          placeholder='First Name'
                          label='First Name'
                          name='first_name'
                          value={formValues.first_name === null ? '' : formValues.first_name}
                          color='primary'
                          type='text'
                          regex=''
                          variant='filled'
                        />
                      </Grid>

                      <Grid
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 6,
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
                          value={formValues.last_name === null ? '' : formValues.last_name}
                          color='primary'
                          type='text'
                          regex=''
                          variant='filled'
                        />
                      </Grid>
                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                    onChange={handleChange}
                    onBlur={handleChange}
                    style={{}}
                    fullWidth={true}
                    placeholder='Pan'
                    label='Pan'
                    name='pan'
                    value={
                      formValues.pan === null ? '' : formValues.pan
                    }
                    color='primary'
                    type='text'
                    regex=''
                    variant='filled'
                    // disabled={!formValues.taxable}
                  />
                </Grid>
                {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                 
                >
                  <TextField
                    onChange={handleChange}
                    onBlur={handleChange}
                    style={{}}
                    fullWidth={true}
                    placeholder='Father Name'
                    label='Father Name'
                    name='father_name'
                    value={
                      formValues.father_name === null ? '' : formValues.father_name
                    }
                    color='primary'
                    type='text'
                    regex=''
                    variant='filled'
                    // disabled={!formValues.taxable}
                  />
                </Grid> */}

                {leadsgender === undefined && (
                  <>
                    <Grid
                      size={{
                        lg: 3,
                        md: 4,
                        sm: 6,
                        xs: 12
                      }}>
                      <Box sx={{minWidth: '100%'}}>
                        <FormControl
                          fullWidth={true}
                          // required={single === 'type:1' ? false : true}
                          // error={
                          //   formErrors.gender === null
                          //     ? false
                          //     : single === 'type:1'
                          //     ? false
                          //     : true
                          // }
                          // helpertext={
                          //   formErrors.gender === null ? '' : formErrors.gender
                          // }
                          variant='filled'
                        >
                          <InputLabel
                            variant='filled'
                            htmlFor='uncontrolled-native'
                          >
                            Gender
                          </InputLabel>
                          <Select
                            name='gender'
                            label='Gender'
                            value={
                              formValues.gender === null
                                ? ''
                                : formValues.gender
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
                            <MenuItem value={0}>Others</MenuItem>
                          </Select>
                          {/* <FormHelperText>{formErrors.gender}</FormHelperText> */}
                        </FormControl>
                      </Box>
                    </Grid>
                  </>
                )}

              </>
            )}

{single === 'type:1' && (
              <>
                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                    onChange={handleChange}
                    onBlur={handleChange}
                    style={{}}
                    fullWidth={true}
                    placeholder='Designation'
                    label='Designation'
                    name='designation'
                    value={
                      formValues.designation === null
                        ? ''
                        : formValues.designation
                    }
                    color='primary'
                    variant='filled'
                    // disabled={!formValues.taxable}
                    // error={formErrors.alternate_phone_number === null ? false : true }
                    // helpertext={formErrors.alternate_phone_number === null ? '' : formErrors.alternate_phone_number }
                  />
                </Grid>
              </>
            )}
                {single === 'type:2' && (
                    <>
                          <Grid
                            size={{
                              lg: 3,
                              md: 4,
                              sm: 6,
                              xs: 12
                            }}>
                            <Autocomplete
                              freeSolo
                              options={
                                (formValues.company_name?.length || 0) > 2
                                  ? companyOptions
                                  : []
                              }
                              onInputChange={(event, newInputValue) => {
                                handleChange({
                                  target: {
                                    name: 'company_name',
                                    value: newInputValue
                                  }
                                });
                              }}
                              inputValue={formValues.company_name || ''}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  fullWidth
                                  required={single === 'type:3' || single === 'type:2'}
                                  placeholder='Company Name'
                                  label='Company Name'
                                  name='company_name'
                                  variant='filled'
                                  error={!!formErrors.company_name}
                                  helperText={formErrors.company_name || ''}
                                  onBlur={(e) => {
                                    if (!formValues.company_name?.trim()) {
                                      setFormErrors((prev) => ({
                                        ...prev,
                                        company_name: 'Company name is required'
                                      }));
                                    } else {
                                      setFormErrors((prev) => ({
                                        ...prev,
                                        company_name: ''
                                      }));
                                    }
                                  }}
                                />
                              )}
                            />
                          </Grid>

                    </>
                  ) }
                   {single === 'type:3' && (
                    <>
                    <Grid
                      size={{
                        lg: 3,
                        md: 4,
                        sm: 6,
                        xs: 12
                      }}>
                        <TextField
                          onChange={handleChange}
                          onBlur={handleChange}
                          style={{}}
                          fullWidth={true}
                          required={single === 'type:3' || single === 'type:2' ? true : false}
                          placeholder='Company Name'
                          label='Company Name'
                          name='company_name'
                          value={formValues.company_name === null ? '' : formValues.company_name}
                          color='primary'
                          type='text'
                          regex=''
                          variant='filled'
                          error={formErrors.company_name === null ? false : true}
                          helpertext={formErrors.company_name === null ? '' : formErrors.company_name}
                        />
                        {
                          formErrors.company_name && (
                            <div 
                              style={{
                                color: theme.palette.error.main,
                                fontSize: '12px',
                                paddingLeft:'10px'
                              }}
                            >
                              <div>Company Name is Required!</div>
                            </div>
                          )
                        }
                      </Grid>
                    </>
                  )
                }

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                      <TextField
                        sx={{
                          '& input[type=number]::-webkit-inner-spin-button': {
                            display: 'none'
                          },
                          '& input[type=number]::-webkit-outer-spin-button': {
                            display: 'none'
                          },
                          '& input[type=number]': {
                            MozAppearance: 'textfield'
                          }
                        }}
                    onChange={handleChange}
                    onBlur={handleChange}
                    required={true}
                    style={{}}
                    fullWidth={true}
                    onWheel={ (e) => e.target.blur()}
                    placeholder='Phone Number'
                    label='Phone Number'
                    name='phone_number'
                    value={formValues.phone_number === null ? '' : formValues.phone_number}
                    color='primary'
                    type='number'
                    regex={alter.phone_number}
                    variant='filled'
                    error={formErrors.phone_number === null ? false : true}
                    helperText={formErrors.phone_number === null ? '' : 'Phone Number is Required!'}
                  />
                </Grid>

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                    onChange={handleChange}
                    style={{}}
                    fullWidth={true}
                    onWheel={ (e) => e.target.blur()}
                    placeholder='Office Phone Number'
                    label='Office Phone Number'
                    name='alternate_phone_number'
                    value={formValues.alternate_phone_number === null ? '': formValues.alternate_phone_number}
                    color='primary'
                    type='number'
                    regex={alter.alternate_phone_number}
                    variant='filled'
                    helpertext={formErrors.alternate_phone_number === null ? '' : formErrors.alternate_phone_number}
                  />
                </Grid>

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                    onChange={handleChange}
                    style={{}}
                    fullWidth={true}
                    placeholder='Email'
                    label='Email'
                    name='email'
                    value={formValues.email === null ? '' : formValues.email}
                    color='primary'
                    type='email'
                    regex='/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/'
                    variant='filled'
                    error={formValues.email === null ? false : formErrors.email === null ? false : true}
                    helperText={formValues.email === null ? false : formErrors.email === null ? '' : formErrors.email}
                  />
                </Grid>

                {
                  (single === 'type:2' || single === 'type:3') && (
                    <>
                      <Grid
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 6,
                          xs: 12
                        }}>
                        <TextField
                          onChange={handleChange}
                          onBlur={handleChange}
                          style={{}}
                          fullWidth={true}
                          placeholder='Contact Person First Name'
                          label='Contact Person First Name'
                          name='first_name'
                          value={formValues.first_name === null ? '' : formValues.first_name}
                          color='primary'
                          type='text'
                          regex=''
                          variant='filled'
                        />
                      </Grid>

                      <Grid
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 6,
                          xs: 12
                        }}>
                        <TextField
                          onChange={handleChange}
                          onBlur={handleChange}
                          style={{}}
                          fullWidth={true}
                          placeholder='Contact Person Last Name'
                          label='Contact Person Last Name'
                          name='last_name'
                          value={formValues.last_name === null ? '' : formValues.last_name}
                          color='primary'
                          type='text'
                          regex=''
                          variant='filled'
                        />
                      </Grid>

                      {
                        leadsgender === undefined && (
                          <>
                            <Grid
                              size={{
                                lg: 3,
                                md: 4,
                                sm: 6,
                                xs: 12
                              }}>
                              <Box sx={{minWidth: '100%'}}>
                                <FormControl fullWidth={true} variant='filled'>
                                  <InputLabel  htmlFor='uncontrolled-native'>
                                    Contact Person Gender
                                  </InputLabel>
                                  
                                  <Select
                                    variant='filled'
                                    name='gender'
                                    label='Contact Person Gender'
                                    value={formValues.gender === null ? '' : formValues.gender}
                                    onChange={handleChange}
                                    inputProps={{ name: 'gender', id: 'uncontrolled-native' }}
                                  >
                                    <MenuItem value={1}>Male</MenuItem>
                                    <MenuItem value={2}>Female</MenuItem>
                                    <MenuItem value={0}>Others</MenuItem>
                                  </Select>
                                </FormControl>
                              </Box>
                            </Grid>
                          </>
                        )
                      }

                      <Grid
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 6,
                          xs: 12
                        }}>
                        <TextField
                          onChange={handleChange}
                          onBlur={handleChange}
                          style={{}}
                          fullWidth={true}
                          placeholder='Contact Person Designation'
                          label='Contact Person Designation'
                          name='designation'
                          value={formValues.designation === null ? '' : formValues.designation}
                          color='primary'
                          variant='filled'
                        />
                      </Grid>
                    </>
                  )
                }

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                    inputRef={textRef}
                    fullWidth={true}
                    name='comments'
                    label='Comments'
                    multiline={true}
                    placeholder='Comments'
                    rows={2}
                    value={formValues.comments === null ? '' : formValues.comments}
                    variant='filled'
                    onChange={handleChange}
                    onBlur={handleChange}
                  />
                </Grid>

                {single === 'type:1' && (
              <>
                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                    onChange={handleChange}
                    onBlur={handleChange}
                    style={{}}
                    fullWidth={true}
                    placeholder='Company Name'
                    label='Company Name'
                    name='company_name'
                    value={
                      formValues.company_name === null
                        ? ''
                        : formValues.company_name
                    }
                    color='primary'
                    type='text'
                    regex=''
                    variant='filled'
                  />
                </Grid>
                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
              <TextField
                onChange={handleChange}
                onBlur={handleChange}
                style={{}}
                fullWidth={true}
                onWheel={ (e) => e.target.blur()}
                placeholder='Account Number '
                label='Account Number '
                name='account_number'
                value={
                  formValues.account_number === null
                    ? ''
                    : formValues.account_number
                }
                color='primary'
                type='number'
                regex=''
                variant='filled'
                // disabled={!formValues.taxable}
              />
            </Grid>
              </>
              
            )}
              </Grid>
            </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Grid container spacing={3}>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Typography variant='h6'>Address</Typography>
                </Grid>

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
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
                    onChange={handleChange}
                    onBlur={handleChange}
                  />
                </Grid>

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
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
                    onChange={handleChange}
                    onBlur={handleChange}
                  />
                </Grid>

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                    onChange={handleChange}
                    onBlur={handleChange}
                    required={true}
                    style={{}}
                    fullWidth={true}
                    onWheel={ (e) => e.target.blur()}
                    placeholder='PinCode'
                    label='Pincode'
                    name='zip'
                    value={formValues.zip === null ? '' : formValues.zip}
                    color='primary'
                     type='text'
                      inputProps={{
                        inputMode: 'numeric',       // brings up numeric keypad on mobile
                        pattern: '[0-9]*',          // restricts to digits
                        maxLength: 6                // actually enforces character limit
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
                    sm: 6,
                    xs: 12
                  }}>
                  <Autocomplete
                    fullWidth={true}
                    required={true}
                    value={{name: formValues.city === null ? '' : formValues.city}}
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
                        label='city'
                        variant='filled'
                        error={formErrors.city !== null}
                        helperText={formErrors.city || ''}
                        required={true}
                      />
                    )}
                  />
                </Grid>

                <Grid
                  value='one'
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <Autocomplete
                    fullWidth={true}
                    name='state'
                    value={{state: formValues.state === null ? '' : formValues.state}}
                    options={_.uniqBy(Cities, 'state')}
                    getOptionLabel={(options) => options.state}
                    onChange={handleStateChange}
                    autoHighlight={true}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label='State'
                        variant='filled'
                        error={formErrors.state === null ? false : true} 
                        helperText={formErrors.state === null ? '' : formErrors.state}
                        required={true}
                      />
                    )}
                  />
                </Grid>

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <Autocomplete
                    fullWidth={true}
                    name='country'
                    value={{name: formValues.country}}
                    options={Country}
                    getOptionLabel={(options) => options.name}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setFormValues({
                          ...formValues,
                          country: newValue.name,
                        });
                      }
                    }}
                    autoHighlight={true}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label='Country'
                        variant='filled'
                      />
                    )}
                  />
                </Grid>

                {
                  (single === 'type:1' ||single === 'type:2' ||single === 'type:3'  ) && (
                    <>
                      <Grid
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 6,
                          xs: 12
                        }}>
                        <TextField
                          onChange={handleChange}
                          onBlur={handleChange}
                          style={{}}
                          fullWidth={true}
                          onWheel={ (e) => e.target.blur()}
                          placeholder='Latitude'
                          label='Latitude'
                          name='latitude'
                          value={formValues.latitude === null ? '' : formValues.latitude}
                          color='primary'
                          type='number'
                          variant='filled'
                        />
                      </Grid>
                    </>
                  )
                }

                {
                  (single === 'type:1' ||single === 'type:2' ||single === 'type:3'  ) && (
                    <>
                      <Grid
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 6,
                          xs: 12
                        }}>
                        <TextField
                          onChange={handleChange}
                          onBlur={handleChange}
                          style={{}}
                          fullWidth={true}
                          onWheel={ (e) => e.target.blur()}
                          placeholder='Longitude'
                          label='Longitude'
                          name='longitude'
                          value={formValues.longitude === null ? '' : formValues.longitude}
                          color='primary'
                          type='number'
                          variant='filled'
                        />
                      </Grid>
                    </>
                  )
                }

              </Grid>
            </Grid>

            {addAcc !== 1 && <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Grid container spacing={3}>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Typography variant='h6'>Tax Details</Typography>
                </Grid>

                {
                  (single === 'type:2' || single === 'type:3') && (
                    <>
                      <Grid
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 6,
                          xs: 12
                        }}>
                        <FormControl>
                          <FormLabel id='demo-radio-buttons-group-label'>
                            Registered in GST
                          </FormLabel>

                          <RadioGroup
                            row
                            aria-label='customer'
                            value={gst ? 'true' : 'false'}
                            name='customer_type'
                            onChange={GST}
                          >
                            <FormControlLabel
                              value='true'
                              label='Yes'
                              control={<Radio />}
                            />
                            <FormControlLabel
                              value='false'
                              label='No'
                              control={<Radio />}
                            />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
               
                      {
                        !gst ? (
                          <Grid
                            size={{
                              lg: 3,
                              md: 4,
                              sm: 6,
                              xs: 12
                            }}>
                            <TextField
                              onChange={handleChange}
                              onBlur={handleChange}
                              required={false}
                              style={{}}
                              fullWidth={true}
                              placeholder='GST Number'
                              label='GST Number '
                              name='tax_id'
                              value={formValues.tax_id === null ? '' : formValues.tax_id}
                              disabled={gst === 'true' ? false : true}
                              color='primary'
                              type='text'
                              regex='/^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/'
                              variant='filled'
                              inputProps={{ maxLength: 15 }}
                            />
                          </Grid>
                        ) : (
                          <Grid
                            size={{
                              lg: 3,
                              md: 4,
                              sm: 6,
                              xs: 12
                            }}>
                            <TextField
                              onChange={handleChange}
                              onBlur={handleChange}
                              required={true}
                              style={{}}
                              fullWidth={true}
                              placeholder='Gst Number'
                              label='Gst Number '
                              name='tax_id'
                              value={formValues.tax_id === null ? '' : formValues.tax_id}
                              disabled={gst === 'false' ? true : false}
                              color='primary'
                              type='text'
                              regex='/^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/'
                              variant='filled'
                              error={formErrors.tax_id === null ? false : true}
                              helperText={formErrors.tax_id === null ? '' : formErrors.tax_id}
                              inputProps={{ maxLength: 15 }}
                            />
                          </Grid>
                        )
                      }

                      {
                        !gst ? (
                          <Grid
                            size={{
                              lg: 3,
                              md: 4,
                              sm: 6,
                              xs: 12
                            }}>
                            <Autocomplete
                              options={gsttypes}
                              getOptionLabel={(option) => option.name}
                              isOptionEqualToValue={(option, value) => option.id === value.id}
                              value={gsttypes?.find((type) => type.id === formValues.gst_type) || null}
                              onChange={(event, newValue) => {
                                handleChange({ target: { name: "gst_type", value: newValue ? newValue.id : "" } });
                              }}
                              disabled={gst === 'true' ? false : true}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select a GST treatments"
                                  variant="filled"
                                  fullWidth
                                  error={formErrors.gst_type !== null}
                                  helperText={formErrors.gst_type || ""}
                                />
                              )}
                              renderOption={(props, option) => (
                                <MenuItem {...props} key={option.id} value={option.id}>
                                  <div>
                                    <strong style={{ fontSize: '20px', color: "black" }}>{option.name}</strong>
                                    <br />
                                    <small style={{ fontSize: '14px', color: "gray" }}>{option.description}</small>
                                  </div>
                                </MenuItem>
                              )}
                            />
                          </Grid> 
                        ) : ( 
                          <Grid
                            size={{
                              lg: 3,
                              md: 4,
                              sm: 6,
                              xs: 12
                            }}> 
                            <Autocomplete
                              options={gsttypes}
                              getOptionLabel={(option) => option.name}
                              isOptionEqualToValue={(option, value) => option.id === value}
                              value={gsttypes?.find((type) => type.id === formValues.gst_type) || null}
                              onChange={(event, newValue) => {
                                handleChange({ target: { name: "gst_type", value: newValue ? newValue.id : "" } });
                              }}
                              disabled={gst === 'false' ? true : false}
                              renderInput={(params) => (
                                <TextField 
                                  {...params} 
                                  label="Select a GST treatment" 
                                  variant="filled" 
                                  fullWidth  
                                  error={formErrors.gst_type === null ? false : true}
                                  helpertext={formErrors.gst_type === null ? '' : formErrors.gst_type}
                                />
                              )}
                              renderOption={(props, option) => (
                                <MenuItem {...props} key={option.id} value={option.id}>
                                    <div>
                                    <strong className='cardheadervalue'>{option.name}</strong>
                                    <br />
                                    <small style={{ fontWeight: "5",fontSize:'11px', color: "gray" }}>{option.description}</small>
                                  </div>
                                </MenuItem>
                              )}
                            />
                        </Grid>
                        )
                      }
                  </>
                 )
               }

{single === 'type:1' && (
              <>
                <Grid
                  paddingLeft={5}
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContents: 'center',
                  }}
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <FormControl
                    required={true}
                    //error={formErrors.taxable === null ? false : true}
                    component='fieldset'
                    fullWidth={true}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          style={{}}
                          name='taxable'
                          checked={
                            formValues.taxable === null
                              ? false
                              : formValues.taxable
                          }
                          size='medium'
                          color='primary'
                          label='Taxable'
                          onChange={handleCheck}
                        />
                      }
                      label='Taxable'
                    />
                    {/* <FormHelperText>
            {formErrors.taxable}
            </FormHelperText> */}
                  </FormControl>
                </Grid>
              </>
            )}

{single === 'type:1' && (
              <>
                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                    onChange={handleChange}
                    onBlur={handleChange}
                    required={formValues.taxable === 1 || formValues.taxable === true}
                    style={{}}
                    fullWidth={true}
                    placeholder='GST Number'
                    label='GST Number'
                    name='tax_id'
                    value={formValues.tax_id === null ? '' : formValues.tax_id}
                    color='primary'
                    type='text'
                    regex='/\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/'
                    variant='filled'
                    error={formErrors.tax_id}
                    helperText={formErrors.tax_id}
                    // error={single === 'false' && formErrors.tax_id}
                    // helpertext={
                    //   single === 'false' && formErrors.tax_id
                    //     ? formErrors.tax_id
                    //     : ''
                    // }
                  />
                </Grid>
              </>
            )}
              </Grid>
            </Grid>}

                { (storage.company_type === 3 && single === 'type:2') && (<>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Grid container spacing={3}>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Typography variant='h6'>Portal Access</Typography>
                </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
            <FormControlLabel
              control={
                <Switch
                  checked={appAccess }
                  onChange={(e) => appAccessFunc(e,'app')}
                />
              }
              label='App Access'
            />
          </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
            <FormControlLabel
              control={
                <Switch
                  checked={webAccess }
                  onChange={(e) => appAccessFunc(e,'web')}
                />
              }
              label='Web Access'
            />
          </Grid>

          {(appAccess == true || webAccess == true) && <>
          <Grid
            size={{
              lg: 3,
              md: 4,
              sm: 6,
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
                      // value={formValues.username
                      //       ? formValues.username.includes('.')
                      //         ? formValues.username.split('.')[1] || ''
                      //         : formValues.username
                      //       : ''
                      // }
                      value={
                        storage.company_type === 3 && single == 'type:2' && (appAccess == true || webAccess == true)
                          ? formValues.phone_number || ''
                          : formValues.username
                          ? formValues.username.includes('.')
                            ? formValues.username.split('.')[1] || ''
                            : formValues.username
                          : ''
                      }
                      InputProps={{
                        startAdornment: <InputAdornment position="start">{getprefix_data[0]?.value + "."}</InputAdornment>,
                      }}
                      variant='filled'
                      required={ appAccess || webAccess}
                      onChange={handleChange}
                      onBlur={handleChange}
                      error={storage?.company_type !== 3 && single == 'type:2'? formErrors.username : false}
                      helperText={storage?.company_type !== 3 && single == 'type:2'? formErrors.username === null ? <div style={{ color: "green" }}>{concate}</div> : formErrors.username : ""}
                      disabled={
                        storage.company_type === 3 && single == 'type:2' && !!formValues.phone_number
                      }
                    />
                  </Grid>
                

                { props.status !== 'edit' && <Grid
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
                        // value={
                        //   formValues.password || ''
                        // }
                        value={
                          storage.company_type === 3 && single == 'type:2' && (appAccess == true || webAccess ==  true)
                            ? formValues.phone_number || ''
                            : formValues.password || ''
                        }
                        color='primary'
                        type={showPassword ? 'text' : 'password'}
                        required = {appAccess || webAccess}
                        variant='filled'
                        // error={!!formErrors.password}
                        // helperText={formErrors.password || ''}
                        error={
                          !!formErrors.password &&
                          !(storage?.company_type === 3 && single === 'type:2')
                        }
                        helperText={
                          storage?.company_type === 3 && single === 'type:2'
                            ? ''
                            : formErrors.password || ''
                        }
                        
                        disabled={
                          storage.company_type === 3 && single == 'type:2' && !!formValues.phone_number
                        }
                        autoComplete='off'
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        // disabled={storage.company_type === 12 && !!formValues.phone_number}
                      />
                      {pwdRequiste && (
                        <PWDRequisite
                          pwdLengthFlag={checks.pwdLengthCheck ? 'valid' : 'invalid'}
                          removeSpace={checks.removeSpace ? 'invalid' : 'valid'}
                        />
                      )}
                    </form>
                  </Grid>}
                  </>}
              </Grid>
            </Grid>
                  </>
                  )
                  
                  }

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Grid container spacing={3}>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Typography variant='h6'>Others</Typography>
                </Grid>
                
                <Grid
                  container={true}
                  direction='row'
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
              <Autocomplete
                limitTags={2}
                required={true}
                fullWidth={true}
                value={{discount_name: discountName || ''}}
                // value={formValues.discount_type}
                id='multiple-limit-tags'
                // options={props.discount_type_list.map((e)=>{
                //   return e;
                // })
                  
              //  }
              options={Array.isArray(props.discount_type_list) ? props.discount_type_list.filter((e) => { return e}) : []}
                
                getOptionLabel={(option) => option.discount_name}
                onChange={(e, v) => {
                  handleChange({
                    target: {
                      name: 'discount_type',
                      value: v?.discount_id || null,
                    },
                  });
                  validationHandler('discount_type', v?.discount_id || null);
                  setDiscountName(v?.discount_name);
                }}
                // renderInput={(params) => (
                //     <TextField {...params} variant="outlined" label="CashBox" placeholder="Select CashBox" fullWidth={true} />
                // )}
                renderInput={(params) => {
                  const get = {...params};
                  
                  get.InputProps = {
                    ...params.InputProps,
                    startAdornment: (
                      <Tooltip title='Create New'>
                        <IconButton
                          size='small'
                          onClick={() => {
                            props.setModalStatusHandler(true);
                            props.setModalTypeHandler('NewDiscountType');
                            // if (add_click) {
                            //   addActionRef.current.click()
                            //   setAdd_click(false)
                            // }
                          }}
                        >
                          <AddIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    ),
                  };

                  return (
                    <TextField
                      {...get}
                      // required={true}
                      // error={formErrors.discount_type === null ? false : true}
                      // helpertext={formErrors.discount_type === null ? '' : formErrors.discount_type}
                      label='Discount Type'
                      variant='filled'
                    />
                  );
                }}
              />
            </Grid>

            {(single === 'type:2' || single === 'type:3') && (
              <>
                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  {/* <FormControl
                    fullWidth={true}
                    component='fieldset'
                    variant='filled'
                  >
                    <InputLabel
                      variant='filled'
                      htmlFor='uncontrolled-native'
                    >
                      Credit days
                    </InputLabel>
                    <Select
                      name='Credit days'
                      label='Credit days'
                      value={
                        formValues.credit_days_value === null
                          ? ''
                          : formValues.credit_days_value
                      }
                      onChange={handleChange}
                      inputProps={{
                        name: 'credit_days_value',
                        id: 'uncontrolled-native',
                      }}
                    >
                      {
                        creditDaysLov.map((creditDays) => (
                          <MenuItem key={creditDays.id} value={creditDays.credit_days_value}>{creditDays.credit_days_name}</MenuItem>
                        ))
                      }
                    </Select>
                  </FormControl> */}
                  <Autocomplete
                    options = {creditDaysLov}
                    getOptionLabel = {(option) => option.credit_days_name || ''}
                    value = {formValues.credit_days_value || defaultCreditDaysOption}
                    onChange = {(name, value) => handleChange({target : {name: 'credit_days_value', value: value}})}
                    renderInput = {(params) => (
                      <TextField 
                        {...params}
                        label = 'Credit Days'
                        variant = 'filled'
                      />
                    )}
                    />
                </Grid>

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                    onChange={handleChange}
                    onBlur={handleChange}
                    style={{}}
                    fullWidth={true}
                    onWheel={ (e) => e.target.blur()}
                    placeholder='Enter credit value'
                    label='Credit value'
                    name='credit_value'
                    value={
                      formValues.credit_value === null
                        ? ''
                        : formValues.credit_value
                    }
                    color='primary'
                    type='number'
                    regex=''
                    variant='filled'
                  />
                </Grid>
                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  {/* <FormControl>
                    <RadioGroup
                      row
                      aria-label='customer'
                      value={tcsvalue}
                      name='tcs'
                      onChange={TCS}
                    >
                      <FormControlLabel
                        value='true'
                        label='Taxable'
                        control={<Radio />}
                      />
                      <FormControlLabel
                        value='false'
                        label='Tax Exempted'
                        control={<Radio />}
                      />
                    </RadioGroup>
                  </FormControl> */}
                  <Autocomplete 
                    options={['Enabled', 'Disabled']}
                    value={tcsvalue}
                    onChange={TCS}
                    renderInput = {(params) => (
                      <TextField 
                        {...params}
                        label = 'TCS'
                        variant='filled'
                      />
                    )}
                  />
                </Grid>
              </>
            )}

{( single === 'type:2' ) && (
              // {(single === 'type:1' || single === 'type:2') && (    //Removed pricelist for 'Individual'
              (<>
                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <Autocomplete
                   defaultValue={
                    price_list.length > 0 &&
                    price_list.find((item) => item.price_list_name === 'Default')
                  }
            
                    value={ 
                      // formValues.price_list === null
                      //   ? {price_list_name: ''}
                      //   : 
                       price_list.length > 0 && price_list.filter(
                            (item) => item.id === formValues.price_list,
                          )[0]
                    }
                    onChange={(e, val) => {
                      handleChange({
                        target: {
                          name: 'price_list',
                          value: val === null ? '' : val.id,
                        },
                      });
                      // val !== null
                      //   ? setFormValues({
                      //       ...formValues,
                      //       price_list: val.price_list_name,
                      //     })
                      //   : ''
                    }}
                    disablePortal
                    name='price_list'
                    options={_.uniqBy(price_list, 'price_list_name')}
                    getOptionLabel={(option) => option.price_list_name || ''}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label='Price List'
                        variant='filled'
                        // required={true}
                        // error={formErrors.price_list === null ? false : true}
                        // helpertext={"Price list is required!"}
                      />
                    )}
                  />

                  {/* <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                  style={{}}
                  fullWidth={true}
                  placeholder='Price list'
                  label='Price list'
                  name='price_list'
                  value={formValues.price_list === null ? '' : formValues.price_list}
                  color='primary'
                  type='number'
                  variant='outlined'
                /> */}
                </Grid>
              </>)
                )}

                {
                  (single === 'type:2' || single === 'type:3') && (
                    <>
                      <Grid
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 6,
                          xs: 12
                        }}>
                        <TextField 
                          fullWidth
                          variant='filled'
                          type='number'
                          label='Turn Over'
                          name='turn_over'
                          value={formValues.turn_over === null ? '' : formValues.turn_over}
                          onChange={handleChange}
                          onBlur={handleChange}
                          onWheel={(e) => e.target.blur()}
                        />
                      </Grid>

                      <Grid
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 6,
                          xs: 12
                        }}>
                        <TextField 
                          fullWidth
                          variant='filled'
                          type='number'
                          label='Net Worth'
                          name='net_worth'
                          value={formValues.net_worth === null ? '' : formValues.net_worth}
                          onChange={handleChange}
                          onBlur={handleChange}
                          onWheel={(e) => e.target.blur()}
                        />
                      </Grid>

                      <Grid size={{ lg: 3, md: 4, sm: 6, xs: 12 }}>
                        <LocalizationProvider dateAdapter={DateAdapter}>
                          <DateTimePicker 
                            label='Date'
                            name='date'
                            format="DD/MM/YYYY HH:mm:ss"
                            value={formValues.credit !== null ? toMomentOrNull(formValues.opening_date) : null}
                            inputVariant='contained'
                            onChange={(e, v) => {
                              setFormValues({...formValues, opening_date: e});
                            }}
                            slotProps={{ textField: { variant: 'filled' } }}
                          />
                        </LocalizationProvider>
                      </Grid>

                         <Grid
                           size={{
                             lg: 3,
                             md: 4,
                             sm: 6,
                             xs: 12
                           }}>
                            <TextField
                              onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) {
                                  handleChange(e);
                                }
                              }}
                              onBlur={handleChange}
                              // disabled={!!formValues.debit}
                              fullWidth
                              onWheel={(e) => e.target.blur()}
                              placeholder="Amount"
                              label="Opening Balance"
                              name="credit"
                              value={formValues.credit || ''}
                              color="primary"
                              multiline={false}
                              type="text"
                              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                              variant="filled"
                              error={!!formErrors.credit}
                              helperText={formErrors.credit ? "Opening Balance is Required!" : ''}
                            />
                          </Grid>

                          {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <TextField
                              onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) {
                                  handleChange(e);
                                }
                              }}
                              onBlur={handleChange}
                              disabled={!!formValues.credit}
                              fullWidth
                              onWheel={(e) => e.target.blur()}
                              placeholder="Balance"
                              label="Debit - Opening Balance"
                              name="debit"
                              value={formValues.debit || ''}
                              color="primary"
                              multiline={false}
                              type="text"
                              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                              variant="filled"
                              error={!!formErrors.debit}
                              helperText={formErrors.debit ? "Opening Balance is Required!" : ''}
                            />
                          </Grid> */}
                    </>
                  )
                }

                {
                  (single === 'type:2') && (
                    <>
                      <Grid
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 6,
                          xs: 12
                        }}>
                        <Autocomplete 
                          options={getIndustryType}
                          getOptionLabel={(option) => option.industry_type || ''}
                          value={formValues.industry_type}
                          onChange = {(name, value) => handleChange({target : {name: 'industry_type', value: value}})}
                          renderInput={(params) => (
                            <TextField 
                              {...params}
                              label='Industry Type'
                              variant='filled'
                            />
                          )}
                        />
                      </Grid>

                      <Grid
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 6,
                          xs: 12
                        }}>
                        <TextField 
                          fullWidth
                          variant='filled'
                          label='Years In Business'
                          name='years_in_business'
                          value={formValues.years_in_business === null ? '' : formValues.years_in_business}
                          onChange={handleChange}
                          onBlur={handleChange}
                          onWheel={(e) => e.target.blur()}
                        />
                      </Grid>
                    </>
                  )
                }

                {
                  single === 'type:2' &&
                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 6,
                      xs: 12
                    }}>
                      <Autocomplete
                        value={searchSalesManList.find(d => d.empId === formValues.salesMan)}
                        options={searchSalesManList}
                        getOptionLabel={option => `${option.last_name ? `${option.first_name} ${option.last_name}` : option.first_name} - ${option.employeeId}`}
                        onChange={(event, value) => handleChange({target: { name: 'salesMan', value: value?.empId ?? null }})}
                        renderInput={(params) => (
                          <TextField
                            { ...params }
                            label='Salesman'
                            variant='filled'
                          />
                        )}
                      />
                  </Grid>
                }
                
              </Grid>
            </Grid>

            


            
            
            

            

          
            
            

            

            

            

            {/* <Grid
            // spacing={0}
            lg={3}
            md={4}
            sm={6}
            xs={12}
            // container={true}
            // direction='row'
           
          >
            <TextField onChange={handleChange}
              onBlur={handleChange}
              style={{}}
              fullWidth={true}
              placeholder='Discount'
              label='Discount'
              name='discount'
              value={formValues.discount === null ? '' : formValues.discount}
              color='primary'
              type='number'
              regex=''
              variant='outlined'
            // error={formErrors.discount === null ? false : true }
            // helpertext={formErrors.discount === null ? '' : formErrors.discount } 
            />
          </Grid> */}
            
            
          </Grid>


        
{(single === 'type:2' || single === 'type:3') && (
  <Grid container direction='row' spacing={0}>
  <Grid
    size={{
      lg: 12,
      md: 12,
      sm: 12,
      xs: 12
    }}>
    <BankAndShipping
      shippingData={shippingData}
      setShippingData={setShippingData}
      bankData={bankData}
      setBankData={setBankData}
      status={props.status}
      organizationdata={organizationdata}
      setorganizationdata={setorganizationdata}
    />
  </Grid>
  <Grid
    size={{
      lg: 12,
      md: 12,
      sm: 12,
      xs: 12
    }}>
    <Organization
      organizationdata={reOrganizationdata}
      setorganizationdata={setorganizationdata}
      phone_num={formValues.phone_number}
      email_da={formValues.email}
    />
  </Grid>
</Grid>
)}

           <Grid
             spacing={7}
             // lg={12}
             // md={12}
             // sm={12}
             // xs={12}
             //
             container={true}
             direction='row'
             gap='20px'
             display='flex'
             justifyContent='flex-end'
             paddingTop='20px'
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
           </Grid>
        </>
      )}

      </Card>
      <CancelDialog
        handle={cancel}
        delete={dialog}
        close={props.handleClose}
      ></CancelDialog>
      <Dialog
        open={gstDuplicateDialog}
        onClose={cancelGstDuplicateSubmit}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              width: 460,
              maxWidth: 'calc(100% - 32px)',
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display='flex' alignItems='center' gap={1.25}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#fff4e5',
                color: '#b26a00',
              }}
            >
              <WarningAmberRoundedIcon />
            </Box>
            <Box>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                Duplicate GST Number
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Please confirm before continuing.
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2.5,
              border: '1px solid #ffe0b2',
              bgcolor: '#fffaf3',
            }}
          >
            <Typography variant='body1' sx={{ fontWeight: 600, mb: 0.5 }}>
              A vendor with this GST already exists: {gstDuplicateVendorName}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Continue anyway?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={cancelGstDuplicateSubmit} color='secondary' variant='contained'>
            Cancel
          </Button>
          <Button onClick={confirmGstDuplicateSubmit} color='primary' variant='contained' autoFocus>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
      {/* { loader&&<SimpleBackdrop loader={loader}/>} */}
      {/* </Grid> */}
    </>
  );
}

export default NewCustomer;
