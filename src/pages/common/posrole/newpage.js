import React, {useState, useEffect, useRef} from 'react';
import _ from 'lodash';
// import { State } from './State_List';
// import { Cities } from './City_list';
import Organization from '../../pages/sales/sales/customer/Organization';
import UnSavedChangesWarning from '../../pages/common/unChangeswarning';
import CancelDialog from '../../../components/CancelDialog';
import {formLabelsTheme} from '../../../components/Asterisk';
import {
  Button,
  Box,
  Switch,
  NativeSelect,
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
} from '@mui/material';
import {CollectionsOutlined} from '@mui/icons-material';
import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
import {Cities} from '../../utils/cities';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import FormLabel from '@mui/material/FormLabel';

// const formLabelsTheme = createMuiTheme({
//   overrides: {
//     MuiFormLabel: {
//       asterisk: {
//         color: "#db3131",
//         "&$error": {
//           color: "#db3131"
//         }
//       }
//     }
//   }
// });

function NewCustomer(props) {
  const [formValues, setFormValues] = useState({
    role: null,
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
    comments: null,
    company_name: null,
    account_number: null,
    taxable: 0,
    tax_id: null,
    discount: null,
    discount_type: null,
    package_id: null,
    sales_person: null,
    designation: null,
    customer_type: null,
    credit_days: null,
    credit_value: null,
  });
  //const [formValues1, setFormValues1] = useState({ first_name: null, last_name: "", gender: null, phone_number: null, alternate_phone_number: null, email: null, address: null, area: null, city: null, state: null, zip: null,  comments: null, company_name: null, account_number: null, taxable: null, tax_id: null, discount: null, discount_type: null, package_id: null, sales_person: null, designation: null, customer_type: null });
  const [formErrors, setFormErrors] = useState({
    role: null,
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
  const [requiredFields] = useState([
    'role',
    'first_name',
    'gender',
    'phone_number',
    'email',
    'address',
    'area',
    'zip',
    'state',
    'city',
  ]);
  const [regex] = useState({
    phone_number: /^\d{10}$/,
    email:
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  });
  const [alter] = useState({alternate_phone_number: /^\d{10}$/});
  const [company] = useState(['company_name', 'tax_id']);
  const [single, setsingle] = useState('false');
  const [organizationdata, setorganizationdata] = useState([]);
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [unchangeform, setForm] = useState(false);
  const [initialState, setInitialState] = useState({});
  const [initialErrorState, setInitislErrorState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [viewgender] = useState(true);
  const [asVendor, setasVendor] = useState(false);
  const [state, setState] = React.useState({
    gilad: true,
    jason: false,
    antoine: false,
  });

  const {gilad, jason, antoine} = state;
  const error = [gilad, jason, antoine].filter((v) => v).length !== 2;

  const {leadsgender} = props;
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

  const commonStyles = {
    bgcolor: 'background.paper',
    m: 1,
    borderColor: 'text.primary',
    width: '5rem',
    height: '5rem',
  };

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
    let {name, value} = e.target;
    setStateHandler(name, value);
    //setInitialState(value)
    //setDirty();
  };
  // useEffect(()=>{
  //     setFormValues(initialState)
  //     setFormErrors(initialErrorState)
  // },[single])

  const cancel = () => {
    setDialog(false);
  };

  // const handleSelect = (e, value, targetName) => {
  //   setStateHandler(targetName, value);
  // };
  const Change = (e) => {
    let {value} = e.target;

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
          comments: null,
          company_name: null,
          account_number: null,
          taxable: 0,
          tax_id: null,
          discount: null,
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
        [name]: capitalize(name) + ' is Required!',
      });
    } else if (regex[name]) {
      if (!regex[name].test(value)) {
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Invalid!',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      }
    } else if (alter[name]) {
      if (!alter[name].test(value)) {
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Invalid!',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
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
    let {name, checked} = e.target;

    setStateHandler(name, checked);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;
    let formErrorsObj = {...formErrors};
    await Object.keys(formValues).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
        if (alter[key]) {
          if (!alter[key].test(formValues[key])) {
            isValid = false;
            formErrorsObj[key] = capitalize(key) + ' is Invalid!';
          }
        }
      } else if (regex[key]) {
        if (!regex[key].test(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Invalid!';
        }
      }
      return null;
    });
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
    await setFormErrors(formErrorsObj);
    // if (single === 'true') {
    //   if (!organizationdata.length && formValues.tax_id && formValues.company_name) {
    //     isValid = false
    //   }
    // }

    //  alert("Is Form Valid - " + isValid);

    // API call..
    if (isValid) {
      const customer_type = single === 'true' ? 1 : 0;

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
        discount,
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
        comments,
        supplier_id,
      } = formValues;
      let formDatas = {};

      formDatas = {
        company_name,
        account_number,
        taxable: single === 'true' ? 1 : taxable,
        tax_id,
        discount,
        discount_type,
        credit_days,
        credit_value,
        package_id,
        customer_type,
        pos_people: {
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
          comments,
          designation,
          person_id,
        },
        additional_contacts: organizationdata.map((d) => {
          const {tableData, gender_name, ...record} = d;
          record.seq = 1;
          return record;
        }),

        // first_name, last_name: null,gender: null,phone_number: null,email: null,address: null,area: null,city: null,state: null,zip: null,country: null,comments: null,company_name: null,account_number: null,taxable: null,tax_id: null,discount: null,discount_type: null,package_id: null,points: null,sales_person: null,package_name: null
      };

      if (props.status === 'edit') {
        formDatas.customer_id = customer_id;
        if (asVendor) {
          formDatas.supplier_id = supplier_id;
        }
      }
      props.handleSubmit(formDatas, asVendor);
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
      value.additional_contacts?.map((d) => {
        d.gender_name =
          d.gender === 1 ? 'Male' : d.gender === 2 ? 'Female' : 'Others';
      });
      // if(!Cities.includes(value.city)){
      //   Cities.push(value.city)
      // }
      setorganizationdata(value.additional_contacts);
      let customer_type = 'false';
      if (value.customer_type === '1') {
        customer_type = 'true';
      } else if (value.supplier_id) {
        customer_type = 'true';
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

  return (
    <>
      {Prompt}
      <Typography variant='h5' align='left' style={{paddingBottom: '10px'}}>
        {props.edit_id_data.length > 0
          ? `Edit-${props.edit_id_data[0].customer_id}-Customer`
          : 'NewRole'}
      </Typography>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <Grid
          container
          style={{paddingTop: '10px'}}
          spacing={3}
          direction='row'
        >
          <Box sx={{display: 'flex', justifyContent: 'center'}}>
            <Grid
              size={{
                lg: 2,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <Box sx={{...commonStyles, border: 1, width: '100%'}}>
                <FormControl
                  fullWidth={true}
                  required={true}
                  error={formErrors.role === null ? false : true}
                >
                  <InputLabel variant='standard' htmlFor='uncontrolled-native'>
                    Role
                  </InputLabel>
                  <NativeSelect
                    name='gender'
                    value={formValues.role === null ? '' : formValues.role}
                    onChange={handleChange}
                    inputProps={{
                      name: 'role',
                      id: 'uncontrolled-native',
                    }}
                  >
                    <option> Select</option>
                    <option value={1}>Role Name Module id</option>
                    <option value={2}>Administrator</option>
                    <option value={0}>Pos User</option>
                  </NativeSelect>
                  <FormHelperText>{formErrors.role}</FormHelperText>
                </FormControl>
              </Box>
            </Grid>

            <Grid
              size={{
                lg: 2,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              {' '}
              <Box sx={{...commonStyles, border: 1, width: '100%'}}>
                <FormControl
                  sx={{m: 3}}
                  component='fieldset'
                  variant='standard'
                >
                  <FormLabel component='legend'>Setting</FormLabel>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={gilad}
                          onChange={handleChange}
                          name='gilad'
                        />
                      }
                      label='Gilad Gray'
                    />
                  </FormGroup>
                </FormControl>
              </Box>
            </Grid>
            <Grid
              size={{
                lg: 2,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              {' '}
              <Box sx={{...commonStyles, border: 1, width: '100%'}}>
                <FormControl
                  sx={{m: 3}}
                  component='fieldset'
                  variant='standard'
                >
                  <FormLabel component='legend'>Reports</FormLabel>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={gilad}
                          onChange={handleChange}
                          name='gilad'
                        />
                      }
                      label='Gilad Gray'
                    />
                  </FormGroup>
                </FormControl>
              </Box>
            </Grid>
            <Grid
              size={{
                lg: 2,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              {' '}
              <Box sx={{...commonStyles, border: 1, width: '100%'}}>
                <FormControl
                  sx={{m: 3}}
                  component='fieldset'
                  variant='standard'
                >
                  <FormLabel component='legend'>Contacts</FormLabel>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={gilad}
                          onChange={handleChange}
                          name='gilad'
                        />
                      }
                      label='Gilad Gray'
                    />
                  </FormGroup>
                </FormControl>
              </Box>
            </Grid>
            <Grid
              size={{
                lg: 2,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              {' '}
              <Box sx={{...commonStyles, border: 1, width: '100%'}}>
                <FormControl
                  sx={{m: 3}}
                  component='fieldset'
                  variant='standard'
                >
                  <FormLabel component='legend'>PointofSale</FormLabel>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={gilad}
                          onChange={handleChange}
                          name='gilad'
                        />
                      }
                      label='Gilad Gray'
                    />
                  </FormGroup>
                </FormControl>
              </Box>
            </Grid>
            <Grid
              size={{
                lg: 2,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              {' '}
              <Box sx={{...commonStyles, border: 1, width: '100%'}}>
                <FormControl
                  sx={{m: 3}}
                  component='fieldset'
                  variant='standard'
                >
                  <FormLabel component='legend'>Sales</FormLabel>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={gilad}
                          onChange={handleChange}
                          name='gilad'
                        />
                      }
                      label='Gilad Gray'
                    />
                  </FormGroup>
                </FormControl>
              </Box>
            </Grid>
          </Box>

          <Grid
            style={{marginBottom: '10px'}}
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <Grid
              spacing={2}
              // lg={12}
              // md={12}
              // sm={12}
              // xs={12}
              //
              container={true}
              direction='row'
            >
              <Grid
                size={{
                  lg: 2,
                  md: 3,
                  sm: 6,
                  xs: 6
                }}>
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
              <Grid
                size={{
                  lg: 2,
                  md: 3,
                  sm: 6,
                  xs: 6
                }}>
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

export default NewCustomer;
