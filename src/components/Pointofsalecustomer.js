import React, { useState, useEffect, useRef, useContext } from 'react';
import _ from 'lodash';
import { Country } from './Country_list';
// import { State } from './State_List';
// import { Cities } from './City_list';
import Organization from '../pages/sales/customer/Organization';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
import { formLabelsTheme } from './Asterisk';
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
  FormControlLabel,
  Radio,
  RadioGroup,
  Select,
  InputLabel,
  MenuItem,
  Tab,
  Tabs,
  AppBar,
  FormLabel,
} from '@mui/material';
import { CollectionsOutlined } from '@mui/icons-material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { Cities } from '../utils/cities';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import { getTrimmedData } from './trimFunction/index';
import {
  emailValidation,
  phoneValidation,
  gstValidation,
} from './regexFunction/index';
import BankAndShipping from '../pages/sales/customer/shippingAndBankDetails';
import AddIcon from '@mui/icons-material/Add';
// import DiscountType from './NewDiscountType';
import { getLocationDataBasedOnPincode } from '../components/common';

import { useSelector, useDispatch } from 'react-redux';
import { getUserRoleAction } from 'redux/actions/userRole_actions';
import { allListStockLocation } from 'redux/actions/stock_Location_actions';
import { createUserCreationAction, updateUsercreationallAction } from 'redux/actions/userCreation_actions';
import { useNavigate } from 'react-router-dom';
import context from '../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { useTheme } from '@mui/material/styles';


function PointofsaleCustomer(props) {
  const textRef = useRef(null);

  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);

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
    taxable: 0,
    tax_id: null,
    discount_type: null,
    package_id: null,
    sales_person: null,
    designation: null,
    customer_type: null,
    credit_days: null,
    credit_value: null,
    credit_days_value: null
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
    first_name: null,
    gender: null,
    state: null,
    city: null,
    credit_days_value: null,
  });
  const [customer_required] = useState(['credit_days_value'])
  const [requiredFields] = useState([
    'first_name',
    'gender',
    'phone_number',
    // 'email',
    'address',
    'area',
    'zip',
    'state',
    'city',
    customer_required

  ]);
  const [regex] = useState({}); // phone_number: /^\d{10}$/ email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  const alter = { alternate_phone_number: /^\d{10}$/, phone_number: /^\d{10}$/ };
  const [company] = useState(['company_name', 'tax_id']);
  const [single, setsingle] = useState('type:1');
  const [validRegex, setValidRegex] = useState({
    email: false,
    phone_number: true,
    alternate_phone_number: true,
  });
  const [unvalidRegex, setUnValidRegex] = useState({
    alternate_phone_number: true,
  });
  const [organizationdata, setorganizationdata] = useState([]);
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [unchangeform, setForm] = useState(false);
  const [initialState, setInitialState] = useState({});
  const [initialErrorState, setInitislErrorState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [viewgender] = useState(true);
  const [asVendor, setasVendor] = useState(true);
  const [shippingData, setShippingData] = useState([]);
  const [bankData, setBankData] = useState([]);
  const [isIndividual, setIsIndividual] = useState(0);
  const [status, setstatus] = useState('');
  const [edit_id_data, setedit_id_data] = useState([]);
  const [open, setopen] = useState(false);
  const userRole = useSelector((state) => state.UserRoleReducer.userRole)
  const StatusUserCreation = useSelector((state) => state.UserCreationReducer.StatusUserCreation)
  const stocklocation = useSelector((state) => state.stockLocationReducer.allliststocklocation)
  const dispatch = useDispatch();
  const [gst, setgst] = useState(false);
  const { leadsgender } = props;
  // const classes = useStyles();
  const tempinit = useRef(null);
  const tempinitform = useRef(null);
  const tempsubmitaction = useRef(null);
  // const [value, setValue] = React.useState([]);
  // const filter = createFilterOptions();
  // const dublicate = Cities.filter((d) => (d.Cities)) || []

  const initform = () => {
    setInitialState(formValues);
    setInitislErrorState(formErrors);
  };
  tempinitform.current = initform;
  useEffect(() => {
    tempinitform.current();
  }, []);
  //--Newcustomer type
  useEffect(() => {

    if (props.newcustomer_type !== 'type:3') {
      setasVendor(false)
    }
    setopen(props.newcustomer_type === 'type:1');
    setIsIndividual(props.newcustomer_type === 'type:2' ? 1 : 0); // 0 - individual / 1 - customer
  }, [props.newcustomer_type])


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

  const handleChange = async (e) => {
    let { name, value } = e.target;
    setStateHandler(name, value);

    if (name === 'zip') {
      if (value.length === 6) {
        const locationData = await getLocationDataBasedOnPincode(value);
        const { district, state } = locationData;
        if (district && state) {
          textRef.current.focus();
          setFormValues({ ...formValues, zip: value, city: district, state });
        }
      }
    }
    //setInitialState(value)
    //setDirty();
  };
  // handleChange()
  // useEffect(()=>{
  //     setFormValues(initialState)
  //     setFormErrors(initialErrorState)
  // },[single])

  const cancel = () => {
    setDialog(false);
  };


  const GST = (e) => {
    let { value } = e.target;
    setgst(value === 'true');
    // setyes(value === 'true' ? 1 : 0);
  }

  const handleSelect = (e, value, targetName) => {
    setStateHandler(targetName, value);
  };
  const Change = (e) => {
    let { value } = e.target;
    if (value === 'type:3') {
      setasVendor(true)
    } else {
      setasVendor(false)
    }
    // setopen(value === 'type:4');
    setIsIndividual(value === 'type:2' ? 1 : 0); // 0 - individual / 1 - customer

    // if(value ==='1'){

    let initstate = value === 'true' ? '1' : '0';
    if (props.status === 'edit') {
      if (props.edit_id_data[0].customer_type === initstate) {
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
        });
        setFormErrors({
          company_name: null,
          tax_id: null,
          phone_number: null,
          alternate_phone_number: null,
          email: null,
          address: null,
          area: null,
          zip: null,
          first_name: null,
          gender: null,
          state: null,
          city: null,
        });
      }
    } else {
      setFormValues(initialState);
      setFormErrors(initialErrorState);
    }

    // }
    setsingle(value);
    //setDirty();
  };

  const validClose = () => {
    setDialog(true);
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

  const validationHandler = async (name, value) => {
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
        [name]: capitalize(name) + ' is Required!',
      });
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
      if (emailValidation(value) !== true) {
        setValidRegex({ ...validRegex, email: false });
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Invalid!',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
        setValidRegex({ ...validRegex, email: true });
      }
    } else if (name === 'phone_number') {
      if (phoneValidation(value) !== true) {
        setValidRegex({ ...validRegex, phone_number: false });
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Invalid!',
        });
      } else if (formValues.alternate_phone_number === value) {
        setUnValidRegex({ ...unvalidRegex, phone_number: false });
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Should be unique',
        });
      } else if (
        formValues.alternate_phone_number !== value &&
        formValues.alternate_phone_number !== null &&
        formValues.alternate_phone_number !== ''
      ) {
        setUnValidRegex({ ...unvalidRegex, alternate_phone_number: true });
        setFormErrors({
          ...formErrors,
          alternate_phone_number: phoneValidation(
            formValues.alternate_phone_number,
          )
            ? null
            : capitalize('alternate_phone_number') + ' is Invalid!',
          phone_number: null,
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
        setValidRegex({ ...validRegex, phone_number: true });
      }
    } else if (name === 'tax_id') {
      if (gstValidation(value) !== true) {
        setValidRegex({ ...validRegex, tax_id: false });
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Invalid!',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
        setValidRegex({ ...validRegex, tax_id: true });
      }
    } else if (name === 'alternate_phone_number') {
      if (value !== '') {
        if (phoneValidation(value) !== true) {
          setUnValidRegex({ ...unvalidRegex, alternate_phone_number: false });
          setFormErrors({
            ...formErrors,
            [name]: capitalize(name) + ' is Invalid!',
          });
        } else if (formValues.phone_number === value) {
          setUnValidRegex({ ...unvalidRegex, alternate_phone_number: false });
          setFormErrors({
            ...formErrors,
            [name]: capitalize(name) + ' is Should be unique',
          });
        } else if (
          formValues.phone_number !== value &&
          formValues.phone_number !== null &&
          formValues.phone_number !== ''
        ) {
          setUnValidRegex({ ...unvalidRegex, phone_number: true });
          setFormErrors({
            ...formErrors,
            phone_number: phoneValidation(formValues.phone_number)
              ? null
              : capitalize('phone_number') + ' is Invalid!',
            alternate_phone_number: null,
          });
        } else {
          setFormErrors({
            ...formErrors,
            [name]: null,
          });
          setValidRegex({ ...validRegex, alternate_phone_number: true });
        }
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
        // setUnValidRegex({...unvalidRegex, alternate_phone_number:true})
      }
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const handleCheck = (e) => {
    let { name, checked } = e.target;

    setStateHandler(name, checked);
  };

  const creditdayscalculations = (days) => {
    if (days === 5) {
      let now = new Date();
      let todayDate = new Date().getDate() - 1;
      let numOfDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      let remainingDays = numOfDaysInMonth - todayDate
      return remainingDays;
    } else {
      let now = new Date();
      let todayDate = new Date().getDate() - 1;
      let numOfDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      let nextMonthTotalDays = new Date(now.getFullYear(), now.getMonth() + 2, 0).getDate()
      let remainingDays = nextMonthTotalDays + numOfDaysInMonth - todayDate
      return remainingDays;
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;
    let formErrorsObj = { ...formErrors };
    await Object.keys(formValues).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
        // if (alter[key]) {
        //   if (!alter[key].test(formValues[key])) {
        //     isValid = false;
        //     formErrorsObj[key] = capitalize(key) + ' is Invalid!';
        //   }
        // }
      } else if (alter[key]) {
        if (
          formValues[key] !== null &&
          formValues[key] !== '' &&
          !alter[key].test(formValues[key])
        ) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Invalid!';
        }
      }
      return null;
    });
    if (single === 'type:2') {
      await Object.keys(formValues).map((key, i) => {
        if (
          customer_required.includes(key) &&
          (formValues[key] === null || formValues[key] === '')
        ) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Required!';
        }
        return null;
      });
    }
    if (single === 'true') {
      await Object.keys(formValues).map((key, i) => {
        if (
          company.includes(key) &&
          (formValues[key] === null || formValues[key] === '')
        ) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Required!';
        }
        return null;
      });
    }

    await Object.keys(validRegex).map((key, i) => {
      if (
        validRegex[key] !== true &&
        formValues[key] !== null &&
        formValues[key] !== ''
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Invalid!';
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
    await setFormErrors(formErrorsObj);
    // if (single === 'true') {
    //   if (!organizationdata.length && formValues.tax_id && formValues.company_name) {
    //     isValid = false
    //   }
    // }

    //  alert("Is Form Valid - " + isValid);

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
      } = formValues;
      let formDatas = {};

      formDatas = {
        company_name,
        account_number,
        taxable: single === 'true' ? 1 : taxable,
        tax_id,
        discount_type,
        credit_days: formValues.credit_days_value === null ? 0 : formValues.credit_days_value === 0 ? formValues.credit_days = 0 :
          formValues.credit_days_value === 1 ? formValues.credit_days = 15 : formValues.credit_days_value === 2 ? formValues.credit_days = 30 : formValues.credit_days_value === 3 ? formValues.credit_days = 45 : formValues.credit_days_value === 4 ? formValues.credit_days = 60 : formValues.credit_days_value === 5 ? creditdayscalculations(5) : creditdayscalculations(6),
        credit_value,
        package_id,
        customer_type,
        location_id: props.location_id,
        pos_people: {
          first_name,
          last_name,
          gender,
          phone_number,
          office_number: alternate_phone_number,
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
        },
        additional_contacts: organizationdata.map((d) => {
          const { tableData, gender_name, ...record } = d;
          record.seq = 1;
          return record;
        }),
        bank_details: bankData,
        shipping_address: shippingData,

        // first_name, last_name: null,gender: null,phone_number: null,email: null,address: null,area: null,city: null,state: null,zip: null,country: null,comments: null,company_name: null,account_number: null,taxable: null,tax_id: null,discount: null,discount_type: null,package_id: null,points: null,sales_person: null,package_name: null
      };

      if (props.status === 'edit') {
        formDatas.customer_id = customer_id;
        if (asVendor) {
          formDatas.supplier_id = supplier_id;
        }
      }
      props.handleSubmit(getTrimmedData(formDatas), asVendor, isIndividual);
    }
  };
  const submitaction = () => {
    if (_.isEmpty(props.taxcategory)) {
      props.listTaxCategoryAction();
    }
    if (_.isEmpty(props.taxcode)) {
      props.listTaxCodesAction();
    }
    if (!_.isEmpty(props.edit_id_data)) {
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
      }
      setFormValues(value);
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
      setorganizationdata(value.additional_contacts);
      setShippingData(value.shipping_address);
      setBankData(value.bank_details);

      let customer_type = 'false';
      if (value.customer_type === '1') {
        customer_type = 'true';
        setIsIndividual(1);
      } else if (value.supplier_id) {
        customer_type = 'true';
        setIsIndividual(3);
        setasVendor(true);
      }
      setsingle(customer_type);
    }
  };
  tempsubmitaction.current = submitaction;
  useEffect(() => {
    // if (_.isEmpty(props.tax)) {
    //   props.listTaxAction()
    // }
    tempsubmitaction.current();
  }, []);
  const handleClose = (id) => {
    setopen(false);
  };

  const handle_Submit = async (data) => {
    let values = data;
    if (data.person_id) {
      dispatch(updateUsercreationallAction(
        data.person_id,
        values,
        setLoaderStatusHandler,
        setModalTypeHandler,
        () => { },
      ));
      // await this.props.listUserCreationAction(context.setModalTypeHandler, context.setLoaderStatusHandler)
    } else {
      dispatch(createUserCreationAction(
        data,
        setLoaderStatusHandler,
        setModalTypeHandler,
        () => { },
      ));
    }
    props.sample(false),
      await props.employeeSetState()
  };

  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getUserRoleAction()),
      dispatch(allListStockLocation())
    );
  }, [])

  const a11yProps = (index) => {
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
    '0': 'type:1',
    '1': 'type:2'
  }
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
    //console.log(e,'kk');
  }
  
  return (
    <>
      {Prompt}
      <Grid container display='flex' direction='row'>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Typography variant='h6' align='left' style={{ paddingBottom: '20px' }}>
            {props.edit_id_data.length === undefined
              ?
              //'Edit Contact'
              `Edit Contact - ${props.edit_id_data.customer_id === undefined ? props.edit_id_data.supplier_id : props.edit_id_data.customer_id}`
              : 'New Contact'}
          </Typography>
        </Grid>

        <Grid
          style={{
            // border: '2px solid grey',
            // borderRadius: '10px',
            justifyContent: 'center',
            display: 'flex',
            padding: '10px 0px'
            // padding: '0px 5px 0px 25px'
          }}
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          {/* <FormControl component='fieldset'>
          <RadioGroup
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
           
          </RadioGroup>
        </FormControl> */}

          <Box sx={{ bgcolor: 'background.paper', width: '100%' }}>
            <AppBar position="static">
              <Tabs
                value={parseInt(Object.keys(typeMapping).find(key => typeMapping[key] === single))}
                onChange={(e, newValue) => {
                  e.target.value = typeMapping[newValue]
                  Change(e);
                }}
                indicatorColor="secondary"
                textColor="inherit"
                variant="fullWidth"
                aria-label="full width tabs example"
              >
                <Tab label="Individual" {...a11yProps(0)} />
                <Tab label="Customer" {...a11yProps(1)} />
              </Tabs>
            </AppBar>
          </Box>
        </Grid>

      </Grid>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <Grid
          container
          style={{ padding: '10px 0px' }}
          spacing={3}
          direction='row'
        >
          {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
          
         
          value='two'> */}
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
                  // className ={ classes.labelAsterisk}
                  onChange={handleChange}
                  onBlur={handleChange}
                  required={true}
                  // InputLabelProps={{
                  //   shrink: true,
                  //   FormLabelClasses: {
                  //     asterisk: classes.labelAsterisk
                  //   }
                  // }}
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
                  variant='outlined'
                  error={formErrors.first_name === null ? false : true}
                  helperText={
                    formErrors.first_name === null ? '' : 'First name is Required!'
                  }
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
                  value={
                    formValues.last_name === null ? '' : formValues.last_name
                  }
                  color='primary'
                  type='text'
                  regex=''
                  variant='outlined'
                // error={formErrors.last_name === null ? false : true }
                // helperText={formErrors.last_name === null ? '' : formErrors.last_name }
                />
              </Grid>

              {leadsgender === undefined && (
                <>
                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 6,
                      xs: 12
                    }}>
                    <Box sx={{ minWidth: '100%' }}>
                      <FormControl
                        fullWidth={true}
                        required={true}
                        error={formErrors.gender === null ? false : true}
                        helperText={formErrors.gender === null ? '' : formErrors.gender}
                      >
                        <InputLabel
                          variant='outlined'
                          htmlFor='uncontrolled-native'
                        >
                          Gender
                        </InputLabel>
                        <Select
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
                          <MenuItem value={0}>Others</MenuItem>
                        </Select>
                        <FormHelperText>{formErrors.gender ? 'Gender is Required!' : ''}</FormHelperText>
                      </FormControl>
                    </Box>
                  </Grid>
                </>
              )}
            </>
          )}

          {(single === 'type:2' || single === 'type:3') && (
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
                  required={single === 'true' ? true : false}
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
                  variant='outlined'
                  error={single === 'true' && formErrors.company_name}
                  helperText={
                    single === 'true' && formErrors.company_name
                      ? formErrors.company_name
                      : ''
                  }
                />
              </Grid>

              {single === 'type:3' &&
                (
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
                      required={single === 'type:3' ? true : false}
                      style={{}}
                      fullWidth={true}
                      placeholder='Gst Number'
                      label='Gst Number '
                      name='tax_id'
                      value={formValues.tax_id === null ? '' : formValues.tax_id}
                      color='primary'
                      type='text'
                      regex='/\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/'
                      variant='outlined'
                      error={formErrors.tax_id === null ? false : true}
                      helperText={
                        formErrors.tax_id === null ? '' : formErrors.tax_id
                      }
                    />
                  </Grid>
                )}
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
                <FormControl>
                  <FormLabel id='demo-radio-buttons-group-label'>
                    Registered in GST
                  </FormLabel>

                  <RadioGroup
                    row
                    aria-label='customer'
                    value={gst === true ? 'true' : 'false'}
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
              {!gst ? (
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
                    placeholder='Gst Number'
                    label='Gst Number '
                    name='tax_id'
                    value={formValues.tax_id === null ? '' : formValues.tax_id}
                    disabled={gst === 'true' ? false : true}
                    color='primary'
                    type='text'
                    regex='/\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/'
                    variant='outlined'
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
                    regex='/\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/'
                    variant='outlined'
                    error={formErrors.tax_id === null ? false : true}
                    helperText={
                      formErrors.tax_id === null ? '' : formErrors.tax_id
                    }
                  />
                </Grid>
              )}

            </>
          )}
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
              onWheel={ (e) => e.target.blur()}
              style={{}}
              fullWidth={true}
              placeholder='Phone Number'
              label='Phone Number'
              name='phone_number'
              value={
                formValues.phone_number === null ? '' : formValues.phone_number
              }
              color='primary'
              type='number'
              regex={alter.phone_number}
              variant='outlined'
              error={formErrors.phone_number === null ? false : true}
              helperText={
                formErrors.phone_number === null ? '' : 'Phone number is Required!'
              }
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
              //onBlur={handleChange}
              style={{}}
              fullWidth={true}
              onWheel={ (e) => e.target.blur()}
              placeholder='Office Phone Number'
              label='Office Phone Number'
              name='alternate_phone_number'
              value={
                formValues.alternate_phone_number === null
                  ? ''
                  : formValues.alternate_phone_number
              }
              color='primary'
              type='number'
              regex={alter.alternate_phone_number}
              variant='outlined'
              error={formErrors.alternate_phone_number === null ? false : true}
              helperText={
                formErrors.alternate_phone_number === null
                  ? ''
                  : formErrors.alternate_phone_number
              }
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
                  placeholder='Designation'
                  label='Designation'
                  name='designation'
                  value={
                    formValues.designation === null
                      ? ''
                      : formValues.designation
                  }
                  color='primary'
                  variant='outlined'
                // error={formErrors.alternate_phone_number === null ? false : true }
                // helperText={formErrors.alternate_phone_number === null ? '' : formErrors.alternate_phone_number }
                />
              </Grid>
            </>
          )}

          <Grid
            size={{
              lg: 3,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <TextField
              onChange={handleChange}
              // onBlur={handleChange}
              // required={true}
              style={{}}
              fullWidth={true}
              placeholder='Email'
              label='Email'
              name='email'
              value={formValues.email === null ? '' : formValues.email}
              color='primary'
              type='email'
              regex='/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/'
              variant='outlined'
              error={formErrors.email === null ? false : true}
              helperText={formErrors.email === null ? '' : formErrors.email}
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
              name='address'
              label='Address'
              multiline={true}
              placeholder='Address'
              rows={2}
              value={formValues.address === null ? '' : formValues.address}
              variant='outlined'
              required={true}
              onChange={handleChange}
              onBlur={handleChange}
              error={formErrors.address === null ? false : true}
              helperText={formErrors.address === null ? '' : 'Address is Required!'}
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
              variant='outlined'
              required={true}
              onChange={handleChange}
              onBlur={handleChange}
              error={formErrors.area === null ? false : true}
              helperText={formErrors.area === null ? '' : 'Area is Required!'}
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
              type='number'
              regex=''
              variant='outlined'
              error={formErrors.zip === null ? false : true}
              helperText={formErrors.zip === null ? '' : 'Pincode is Required!'}
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
              value={{ name: formValues.city === null ? '' : formValues.city }}
              name='city'
              onChange={(e, val) =>
                val !== null
                  ? setFormValues({
                    ...formValues,
                    city: val.name,
                    state: val.state,
                  })
                  : ''
              }
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
                  variant='outlined'
                  error={formErrors.city === null ? false : true}
                  helperText={formErrors.city === null ? '' : 'City is Required!'}
                  required={true}
                />
              )}
            />
            {/* <Autocomplete
              fullWidth={true}
              name='city'
              defaultValue={`${props.edit_id_data ? props.edit_id_data.map(m => m.city) : formValues.city}`}
              value={formValues.city}
              options={Cities}
              // inputProps={{ value: formValues.city }}
              getOptionLabel={(options) => options}
              onChange={(e, v) => handleSelect(e, v, "city")}
              // autoHighlight={true}
              renderInput={(params) => (
                <TextField {...params} label="City" variant="outlined"
                  // error = { formErrors.city === null ? false : true } helperText = { formErrors.city === null ? '' : formErrors.city } 
                  required={false} />
              )}
            /> */}
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
              // defaultValue={`${props.edit_id_data ? props.edit_id_data.map(m => m.state) : ""}`}
              value={{ state: formValues.state === null ? '' : formValues.state }}
              options={_.uniqBy(Cities, 'state')}
              getOptionLabel={(options) => options.state}
              onChange={(e, v) =>
                v !== null
                  ? setFormValues({
                    ...formValues,
                    state: v.state,
                    city: '',
                  })
                  : ''
              }
              autoHighlight={true}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='State'
                  variant='outlined'
                  error={formErrors.state === null ? false : true}
                  helperText={formErrors.state === null ? '' : 'State is Required!'}
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
            {/* <Autocomplete
              fullWidth={true}
              name='country'
              //  defaultValue={`${props.edit_id_data ? props.edit_id_data.map(m =>m.country) : ""}`}
              //defaultValue
              value={{ name: formValues.country }}
              options={Country}
              getOptionLabel={(options) => options.name}
              // onChange={(e, v) => handleSelect(e, v, "country")}
              autoHighlight={true}
              renderInput={(params) => (
                <TextField {...params} label="Country" variant="outlined"
                //error = { formErrors.country === null ? false : true } helperText = { formErrors.country === null ? '' : formErrors.country } required={true} 
                />
              )}
            /> */}
            <Autocomplete
              fullWidth={true}
              name='country'
              //  defaultValue={`${props.edit_id_data ? props.edit_id_data.map(m =>m.country) : ""}`}
              //defaultValue
              value={{ name: formValues.country }}
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
                  variant='outlined'
                //error = { formErrors.country === null ? false : true } helperText = { formErrors.country === null ? '' : formErrors.country } required={true}
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
              inputRef={textRef}
              fullWidth={true}
              name='comments'
              label='Comments'
              multiline={true}
              placeholder='Comments'
              rows={2}
              value={formValues.comments === null ? '' : formValues.comments}
              variant='outlined'
              onChange={handleChange}
              onBlur={handleChange}
            // error={formErrors.comments === null ? false : true }
            // helperText={formErrors.comments === null ? '' : formErrors.comments }
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
                  variant='outlined'
                // error={formErrors.company_name === null ? false : true }
                // helperText={formErrors.company_name === null ? '' : formErrors.company_name }
                />
              </Grid>
            </>
          )}

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
              variant='outlined'
            // error={formErrors.account_number === null ? false : true }
            // helperText={formErrors.account_number === null ? '' : formErrors.account_number }
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
            // helperText={formErrors.discount === null ? '' : formErrors.discount } 
            />
          </Grid> */}
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
              value={
                !_.isEmpty(props.discount_type_list)
                  ? props.discount_type_list.filter(
                    (s) =>
                      s.discount_id ===
                      props.discount_type_list[0].discount_name,
                  )[0]
                  : formValues.discount_type !== ''
                    ? props.discount_type_list.filter(
                      (f) => f.discount_id === formValues.discount_type,
                    )[0]
                    : {}
              }
              // value={formValues.discount_type}
              id='multiple-limit-tags'
              options={props.discount_type_list.filter((f) => {
                return f;
              })}
              getOptionLabel={(option) => option.discount_name}
              onChange={(e, v) => {
                handleChange({
                  target: {
                    name: 'discount_type',
                    value: v?.discount_id || null,
                  },
                });
                validationHandler('discount_type', v?.discount_id || null);
              }}
              // renderInput={(params) => (
              //     <TextField {...params} variant="outlined" label="CashBox" placeholder="Select CashBox" fullWidth={true} />
              // )}
              renderInput={(params) => {
                const get = { ...params };

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
                    // helperText={formErrors.discount_type === null ? '' : formErrors.discount_type}
                    label='Discount Type'
                    variant='outlined'
                  />
                );
              }}
            />
            {/* <FormControl required={false}
              //error={formErrors.discount_type === null ? false : true}
              component='fieldset'
              fullWidth={true}>
              <InputLabel>
                Discount Type
              </InputLabel>
              <Select style={{}}
                name='discount_type'
                label='Discount Type'
                items={[{ "label": "Select one", "value": "" }, { "label": "one", "value": "one" }, { "label": "two", "value": "two" }]}
                required={false}
                onChange={handleChange}
                //defalutValue=''
                value={formValues.discount_type === null ? "" : formValues.discount_type}> */}
            {/* <MenuItem value=''>
                  Select one
                </MenuItem>
                <MenuItem value={1}>
                  option 1
                </MenuItem>
                <MenuItem value={2}>
                  option 2
                </MenuItem> */}
            {/* <icon><AddBoxIcon /></icon>

              </Select>
            </FormControl> */}
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
                {/* <TextField
                  onChange={handleChange}
                  onBlur={handleChange}
                  style={{}}
                  fullWidth={true}
                  placeholder='Enter credit days'
                  label='Credit days'
                  name='credit_days'
                  value={
                    formValues.credit_days === null
                      ? ''
                      : formValues.credit_days
                  }
                  color='primary'
                  type='number'
                  regex=''
                  variant='outlined'
                /> */}
                <FormControl
                  fullWidth={true}
                  required={(single === 'type:3' || single === 'type:2') && true}
                  error={formErrors.credit_days_value === null ? false : true}
                  helpertext={
                    formErrors.credit_days_value === null
                      ? ''
                      : formErrors.credit_days_value
                  }
                  component='fieldset'
                >
                  <InputLabel
                    variant='outlined'
                    htmlFor='uncontrolled-native'
                  >
                    Credit days
                  </InputLabel>
                  <Select
                    name='Credit days'
                    label="Credit days"
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
                    <MenuItem value={0}>Net 0</MenuItem >
                    <MenuItem value={1}>Net 15</MenuItem >
                    <MenuItem value={2}>Net 30</MenuItem >
                    <MenuItem value={3}>Net 45</MenuItem >
                    <MenuItem value={4}>Net 60</MenuItem >
                    <MenuItem value={5}>Due end of the month</MenuItem >
                    <MenuItem value={6}>Due end of next month</MenuItem >
                  </Select>
                  <FormHelperText>
                    {formErrors.credit_days_value}
                  </FormHelperText>
                </FormControl>
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
                  variant='outlined'
                />
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
                  //required={true}
                  style={{}}
                  fullWidth={true}
                  placeholder='Gst Number'
                  label='Gst Number'
                  name='tax_id'
                  value={formValues.tax_id === null ? '' : formValues.tax_id}
                  color='primary'
                  type='text'
                  regex='/\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/'
                  variant='outlined'
                // error={formErrors.tax_id === null ? false : true}
                // helperText={
                //   formErrors.tax_id === null ? '' : formErrors.tax_id
                // }
                // error={single === 'false' && formErrors.tax_id}
                // helperText={
                //   single === 'false' && formErrors.tax_id
                //     ? formErrors.tax_id
                //     : ''
                // }
                />
              </Grid>
            </>
          )}

          {(single === 'type:2' || single === 'type:3') && (
            <>
              <Grid
                size={{
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                {' '}
              </Grid>
              {/* <Grid
                // spacing={0}
                lg={3}
                md={4}
                sm={6}
                xs={12}
                // container={true}
                // direction='row'
               
              > </Grid>

              <Grid
                // spacing={0}
                lg={3}
                md={4}
                sm={6}
                xs={12}
                // container={true}
                // direction='row'
               
              > </Grid> */}
            </>
          )}

          {(single === 'type:2' || single === 'type:3') && (
            <>
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid
                  container
                  style={{ paddingTop: '10px', marginBottom: '10px' }}
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
                    <Typography
                      variant='h6'
                      align='left'
                      pl='5px'
                    >
                      {'Primary Contact'}
                    </Typography>
                  </Grid>
                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 6,
                      xs: 12
                    }}>
                    <TextField
                      // className ={ classes.labelAsterisk}
                      onChange={handleChange}
                      onBlur={handleChange}
                      required={true}
                      // InputLabelProps={{
                      //   shrink: true,
                      //   FormLabelClasses: {
                      //     asterisk: classes.labelAsterisk
                      //   }
                      // }}
                      style={{}}
                      fullWidth={true}
                      placeholder='Contact Person First Name'
                      label='Contact Person First Name'
                      name='first_name'
                      value={
                        formValues.first_name === null
                          ? ''
                          : formValues.first_name
                      }
                      color='primary'
                      type='text'
                      regex=''
                      variant='outlined'
                      error={formErrors.first_name === null ? false : true}
                      helperText={
                        formErrors.first_name === null
                          ? ''
                          : 'First name is Required!'
                      }
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
                      value={
                        formValues.last_name === null
                          ? ''
                          : formValues.last_name
                      }
                      color='primary'
                      type='text'
                      regex=''
                      variant='outlined'
                    // error={formErrors.last_name === null ? false : true }
                    // helperText={formErrors.last_name === null ? '' : formErrors.last_name }
                    />
                  </Grid>

                  {leadsgender === undefined && (
                    <>
                      <Grid
                        size={{
                          lg: 3,
                          md: 4,
                          sm: 6,
                          xs: 12
                        }}>
                        <Box sx={{ minWidth: '100%' }}>
                          <FormControl
                            fullWidth={true}
                            required={true}
                            error={formErrors.gender === null ? false : true}
                            helperText={formErrors.gender === null ? '' : formErrors.gender}
                          // component='fieldset'
                          >
                            <InputLabel
                              variant='outlined'
                              htmlFor='uncontrolled-native'
                            >
                              Contact Person Gender
                            </InputLabel>
                            {/* <Select
                            name='gender'
                            label='	Gender'
                          // items={[{ "label": "Male", "value": "one" }, { "label": "Female", "value": "two" }, { "label": "Others", "value": "three" }]}
                            required={true}
                            onChange={handleChange}
                            //defalutValue=''
                            value={formValues.gender === null ? "" : formValues.gender}>
                            <MenuItem value={1}>
                              Male
                            </MenuItem>
                            <MenuItem value={2}>
                              Female
                            </MenuItem>
                            <MenuItem value={0}>
                              Others
                            </MenuItem>
                          </Select> */}
                            <Select
                              name='gender'
                              label='Contact Person Gender'
                              value={
                                formValues.gender === null
                                  ? ''
                                  : formValues.gender
                              }
                              onChange={handleChange}
                              inputProps={{
                                name: 'gender',
                                id: 'uncontrolled-native',
                              }}
                            >
                              <MenuItem value={1}>Male</MenuItem>
                              <MenuItem value={2}>Female</MenuItem>
                              <MenuItem value={0}>Others</MenuItem>
                            </Select>
                            <FormHelperText>{formErrors.gender}</FormHelperText>
                          </FormControl>
                        </Box>
                      </Grid>
                    </>
                  )}

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
                      value={
                        formValues.designation === null
                          ? ''
                          : formValues.designation
                      }
                      color='primary'
                      variant='outlined'
                    // error={formErrors.alternate_phone_number === null ? false : true }
                    // helperText={formErrors.alternate_phone_number === null ? '' : formErrors.alternate_phone_number }
                    />
                  </Grid>
                </Grid>
              </Grid>
              <br />
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
                  />
                </Grid>
              </Grid>
              <Grid container direction='row' spacing={0}>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Organization
                    organizationdata={organizationdata}
                    setorganizationdata={setorganizationdata}
                    phone_num={formValues.phone_number}
                    email_da={formValues.email}
                  />
                </Grid>
              </Grid>
            </>
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
        </Grid>
      </Grid>
      <CancelDialog
        handle={cancel}
        delete={dialog}
        close={props.handleClose}
      ></CancelDialog>
      {/* </Grid> */}
    </>
  );
}

export default PointofsaleCustomer;
