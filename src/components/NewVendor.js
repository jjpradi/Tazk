import React, {useState, useEffect, useRef} from 'react';
import {Button, TextField, Typography, Grid} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import _ from 'lodash';
import {Country} from './Country_list';
// import { State } from './State_List';
import {Cities} from '../utils/cities';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
import {getTrimmedData} from './trimFunction/index';
import {emailValidation, gstValidation, phoneValidation} from './regexFunction/index';
import {getLocationDataBasedOnPincode} from '../components/common';

function NewVendor(props) {
  const textRef = useRef(null);

  const [formValues, setFormValues] = useState({
    company_name: null,
    tax_id: null,
    gender: null,
    phone_number: null,
    email: null,
    address: null,
    area: null,
    city: null,
    state: null,
    zip: null,
    country: 'India',
    comments: null,
    account_number: null,
    contact_person: null,
    contact_person_number: null,
    contact_person_designation: null,
    discount_type: null,
    designation: null,
  });
  const [formErrors, setFormErrors] = useState({
    company_name: null,
    tax_id: null,
    gender: null,
    phone_number: null,
    email: null,
    address: null,
    area: null,
    city: null,
    state: null,
    zip: null,
    country: null,
    comments: null,
    account_number: null,
    contact_person: null,
    contact_person_number: null,
    contact_person_designation: null,
    designation: null,
  });
  const [requiredFields] = useState([
    'company_name',
    'phone_number',
    'email',
    'address',
    'area',
    'city',
    'state',
    'zip',
    'country',
    'tax_id',
    'contact_person',
    'contact_person_number',
    'contact_person_designation',
  ]);
  const [regex] = useState({
    tax_id: /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/,
  });
  const [submitting, setSubmitting] = useState(false);
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [unchangeform, setForm] = useState(false);
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempedits = useRef(null);
  // const [value, setValue] = React.useState([]);
  // const filter = createFilterOptions();
  // const dublicate = Cities.filter((d) => (d.Cities)) || []

  const initsform = () => {
    setInitialState(formValues);
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
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
  tempinits.current = inits;
  useEffect(() => {
    tempinits.current();
  }, [formValues, initialState, props.open]);

  const cancel = () => {
    setDialog(false);
  };

  const validClose = () => {
    setDialog(true);
  };

  const handleChange = async (e) => {
    let {name, value} = e.target;
    setStateHandler(name, value);

    if (name === 'zip') {
      if (value.length === 6) {
        const locationData = await getLocationDataBasedOnPincode(value);
        const {district, state} = locationData;
        if (district && state) {
          textRef.current.focus();
          setFormValues({...formValues, zip: value, city: district, state});
        }
      }
    }
  };

  // const handleSelect = (e, value, targetName) => {
  //   setStateHandler(targetName, value);
  // };

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
    }
    else if (name === 'phone_number' || name === 'contact_person_number') {
      if (value && !phoneValidation(value)) {
        setFormErrors({
          ...formErrors,
          [name]: 'Phone number must be exactly 10 digits starting with 6-9',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      }
    } else if (name === 'email') {
      if (emailValidation(value, name) !== true) {
        setFormErrors({
          ...formErrors,
          [name]: 'Please enter a valid email address',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      }
    } else if (name === 'tax_id') {
      if (gstValidation(value, name) !== true) {
        setFormErrors({
          ...formErrors,
          [name]: 'Please enter a valid GST number',
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    let isValid = true;
    let formErrorsObj = {...formErrors};
    await Object.keys(formValues).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      } else if (key === 'phone_number' || key === 'contact_person_number') {
        if (formValues[key] && !phoneValidation(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = 'Phone number must be exactly 10 digits starting with 6-9';
        }
      } else if (key === 'email') {
        if (formValues[key] && !emailValidation(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = 'Please enter a valid email address';
        }
      } else if (key === 'tax_id') {
        if (formValues[key] && !gstValidation(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = 'Please enter a valid GST number';
        }
      } else if (regex[key]) {
        if (!regex[key].test(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Invalid!';
        }
      }
      return null;
    });
    await setFormErrors(formErrorsObj);

    // alert("Is Form Valid - " + isValid);

    // API call..
    if (isValid) {
      const {
        account_number,
        supplier_id,
        tax_id,
        contact_person,
        designation,
        contact_person_number,
        person_id,
        contact_person_id,
        contact_person_designation,
        company_name,
        phone_number,
        email,
        address,
        area,
        city,
        state,
        zip,
        country,
        comments,
      } = formValues;
      let formDatas = {};
      //   if(props.status==='edit'){
      //     formDatas = {
      //       company_name, account_number,tax_id:1,supplier_id,
      //       pos_people: {
      //           phone_number, email, address, area, city, state, zip, country, comments, designation, person_id
      //       },
      //       contact_person: {
      //         // first_name,phone_number,designation,seq
      //        first_name: contact_person, phone_number:contact_person_number,designation:contact_person_designation,seq:1, person_id
      //       }
      //   }
      // }else{

      formDatas = {
        company_name,
        account_number,
        tax_id,
        supplier_id: props.status === 'edit' ? supplier_id : null,
        pos_people: {
          phone_number,
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
        contact_person: {
          // first_name,phone_number,designation,seq
          first_name: contact_person,
          phone_number: contact_person_number,
          designation: contact_person_designation,
          seq: 1,
          person_id: contact_person_id,
        },
        // company_name, last_name: null,gender: null,phone_number: null,email: null,address: null,area: null,city: null,state: null,zip: null,country: null,comments: null,gst: null,account_number: null,taxable: null,contact_person: null,discount: null,discount_type: null,package_id: null,points: null,sales_tax_code_id: null,employee_id: null
      };
      //  }

      setSubmitting(true);
      try {
        await props.handleSubmit(getTrimmedData(formDatas));
      } finally {
        setSubmitting(false);
      }
    }
  };

  const edits = () => {
    if (!_.isEmpty(props.edit_id_data)) {
      let {contact_person, ...record} = props.edit_id_data[0];
      let id = {
        ...record,
        contact_person: contact_person[0].first_name,
        contact_person_id: contact_person[0].person_id,
        contact_person_number: contact_person[0].phone_number,
        contact_person_designation: contact_person[0].designation,
      };
      // setPut_id(id)
      // if(!Cities.includes(record.city)){
      //   Cities.push(record.city)
      // }

      setFormValues(id);
      setInitialState(id);
    }
  };
  tempedits.current = edits;
  useEffect(() => {
    tempedits.current();
  }, []);

  return (
    <>
      {Prompt}
      <Typography variant='h5' align='left' style={{paddingBottom: '15px'}}>
        {props.edit_id_data.length > 0
          ? `Edit-${props.edit_id_data[0].supplier_id}-Vendor`
          : 'NewVendor'}
      </Typography>
      <Grid
        spacing={3}
        // lg={12}
        // md={12}
        // sm={12}
        // xs={12}
        container
        direction='row'
        //

        value='two'
      >
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
            placeholder='Vendor Name'
            label='Vendor Name'
            name='company_name'
            value={
              formValues.company_name === null ? '' : formValues.company_name
            }
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='standard'
            error={formErrors.company_name === null ? false : true}
            helperText={
              formErrors.company_name === null ? '' : formErrors.company_name
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
            // required={true}
            style={{}}
            fullWidth={true}
            placeholder='Designation'
            label='Designation'
            name='designation'
            value={
              formValues.designation === null ? '' : formValues.designation
            }
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='standard'
            // error={formErrors.last_name === null ? false : true }
            // helperText={formErrors.last_name === null ? '' : formErrors.last_name }
          />
        </Grid>
        {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
  container={false}
  
 
  >
  <FormControl required={true}
  error={formErrors.gender === null ? false : true }
  component='fieldset'
  fullWidth={true}>
  <InputLabel>
     	Gender 
  </InputLabel>
  <Select style={{}}
    name='gender'
    label='	Gender'
    items={[{"label": "Male", "value": "one"}, {"label": "Female", "value": "two"}, {"label": "Others", "value": "three"}]}
    addnew={false}
    required={true}
    onChange={handleChange}
    defalutValue=''
    value={ formValues.gender === null ? "" : formValues.gender }>
    <MenuItem value={1}>
      Male
    </MenuItem>
    <MenuItem value={2}>
      Female
    </MenuItem>
    <MenuItem value={3}>
      Others
    </MenuItem>
  </Select>
  <FormHelperText>
    {formErrors.gender}
  </FormHelperText>
</FormControl>
</Grid> */}
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
            placeholder='Email'
            label='Email'
            name='email'
            value={formValues.email === null ? '' : formValues.email}
            color='primary'
            multiline={false}
            type='email'
            regex='/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/'
            variant='standard'
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
            onChange={handleChange}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder='Phone Number'
            label='Phone Number'
            name='phone_number'
            value={
              formValues.phone_number === null ? '' : formValues.phone_number
            }
            color='primary'
            multiline={false}
            type='tel'
            variant='standard'
            slotProps={{ htmlInput: { maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' } }}
            onKeyDown={(e) => { if (!/[0-9]/.test(e.key) && !['Backspace','Delete','Tab','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault(); }}
            error={formErrors.phone_number === null ? false : true}
            helperText={
              formErrors.phone_number === null ? '' : formErrors.phone_number
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
            helperText={formErrors.address === null ? '' : formErrors.address}
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
            helperText={formErrors.area === null ? '' : formErrors.area}
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
            value={{name: formValues.city === null ? '' : formValues.city}}
            name='city'
            onChange={(event, newValue) =>
              newValue !== null
                ? setFormValues({
                    ...formValues,
                    city: newValue.name,
                    state: newValue.state,
                  })
                : ''
            }
            id='free-solo-dialog-demo'
            options={Cities}
            getOptionLabel={(option) => option.name}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            // renderOption={(option) => option.city}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                label='city'
                variant='outlined'
                error={formErrors.city === null ? false : true}
                helperText={formErrors.city === null ? '' : formErrors.city}
                required={true}
                onBlur={handleChange}
              />
            )}
          />
          {/* <Autocomplete
            fullWidth={true}
            name='city'
            defaultValue={`${props.edit_id_data ? props.edit_id_data.map(m => m.city) : ""}`}
            options={Cities}
           // inputProps={{ value: formValues.city }}
           // getItemValue={(item) => item.city}
            onChange={(e, v) => handleSelect(e, v, "city")}
            autoHighlight={true}
            renderInput={(params) => (
              <TextField {...params} label="City" variant="outlined" error={formErrors.city === null ? false : true} helperText={formErrors.city === null ? '' : formErrors.city} required={true} />
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
            value={{state: formValues.state === null ? '' : formValues.state}}
            options={_.uniqBy(Cities, 'state')}
            getOptionLabel={(options) => options.state}
            onChange={(e, v) =>
              v !== null
                ? setFormValues({
                    ...formValues,
                    state: v.state,
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
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            required={true}
            onWheel={ (e) => e.target.blur()}
            style={{}}
            fullWidth={true}
            placeholder='PinCode'
            label='PinCode'
            name='zip'
            value={formValues.zip === null ? '' : formValues.zip}
            color='primary'
            multiline={false}
            type='number'
            regex=''
            variant='standard'
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
            name='country'
            value={{name: formValues.country}}
            options={Country}
            getOptionLabel={(options) => options.name}
            // onChange={(e, v) => handleSelect(e, v, "country")}
            autoHighlight={true}
            renderInput={(params) => (
              <TextField
                {...params}
                label='Country'
                variant='outlined'
                error={formErrors.country === null ? false : true}
                helperText={
                  formErrors.country === null ? '' : formErrors.country
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
            // required={true}
            onChange={handleChange}
            onBlur={handleChange}
            // error={formErrors.comments === null ? false : true }
            // helperText={formErrors.comments === null ? '' : formErrors.comments }
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
            // required={true}
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
            multiline={false}
            type='number'
            regex=''
            variant='standard'
            // error={formErrors.account_number === null ? false : true }
            // helperText={formErrors.account_number === null ? '' : formErrors.account_number }
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
            placeholder='GST'
            label='GST'
            name='tax_id'
            value={formValues.tax_id === null ? '' : formValues.tax_id}
            color='primary'
            multiline={false}
            type='text'
            regex='/\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/'
            variant='standard'
            error={formErrors.tax_id === null ? false : true}
            helperText={formErrors.tax_id === null ? '' : formErrors.tax_id}
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
            placeholder='Contact Person Name'
            label='Contact Person Name'
            name='contact_person'
            value={
              formValues.contact_person === null
                ? ''
                : formValues.contact_person
            }
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='standard'
            error={formErrors.contact_person === null ? false : true}
            helperText={
              formErrors.contact_person === null
                ? ''
                : formErrors.contact_person
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
            required={true}
            style={{}}
            fullWidth={true}
            placeholder='Contact Person Number'
            label='Contact Person Number'
            name='contact_person_number'
            value={
              formValues.contact_person_number === null
                ? ''
                : formValues.contact_person_number
            }
            color='primary'
            multiline={false}
            type='tel'
            variant='standard'
            slotProps={{ htmlInput: { maxLength: 10, inputMode: 'numeric', pattern: '[0-9]*' } }}
            onKeyDown={(e) => { if (!/[0-9]/.test(e.key) && !['Backspace','Delete','Tab','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault(); }}
            error={formErrors.contact_person_number === null ? false : true}
            helperText={
              formErrors.contact_person_number === null
                ? ''
                : formErrors.contact_person_number
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
            required={true}
            style={{}}
            fullWidth={true}
            placeholder='Contact Person_Designation'
            label='Contact Person Designation '
            name='contact_person_designation'
            value={
              formValues.contact_person_designation === null
                ? ''
                : formValues.contact_person_designation
            }
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='standard'
            error={
              formErrors.contact_person_designation === null ? false : true
            }
            helperText={
              formErrors.contact_person_designation === null
                ? ''
                : formErrors.contact_person_designation
            }
          />
        </Grid>
        {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
          
          
         
          >
          <TextField onChange={handleChange}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder='Enter Password'
            label='Password'
            name='password'
            value={formValues.password === null ? '' : formValues.password}
            color='primary'
            multiline={false}
            type='password'
            regex=''
            variant='standard'
            error={formErrors.password === null ? false : true}
            helperText={formErrors.password === null ? '' : formErrors.password} />
        </Grid> */}
        {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
  container={false}
  
 
  >
  <TextField onChange={handleChange}
  onBlur={handleChange}
  required={true}
  style={{}}
  fullWidth={true}
  placeholder='Agency Name'
  label='Agency Name'
  name='contact_person_number'
  value={formValues.contact_person_number === null ? '' : formValues.contact_person_number }
  color='primary'
  multiline={false}
  type='text'
  regex=''
  variant='standard'
  error={formErrors.contact_person_number === null ? false : true }
  helperText={formErrors.contact_person_number === null ? '' : formErrors.contact_person_number } />
</Grid> */}

        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid
            spacing={2}
            // lg={12}
            // md={12}
            // sm={12}
            // xs={12}
            //
            container
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
                name='SUBMIT'
                variant='contained'
                color='primary'
                size='medium'
                text='button'
                fullWidth={false}
                type='submit'
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit'}
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
    </>
  );
}

export default NewVendor;
