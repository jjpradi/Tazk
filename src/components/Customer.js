import React, {useState, useEffect} from 'react';
import {Country} from './Country_list';
import {State} from './State_List';
import {Cities} from './City_list';
import {Regions} from './Regions';
import './customer.css';
import Customerservice from '../services/customer_services';
import TaxCategoryservice from '../services/taxcategory_services';
import Taxservice from '../services/tax_services';
import _ from 'lodash';
import Alert from '@mui/material/Alert';
import {
  Button,
  Switch,
  Autocomplete,
  TextField,
  Grid,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogTitle,
} from '@mui/material';

function NewCustomer(props) {
  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setValues({...values, [name]: value});
    //validateForm()
  };
  function handleAutoCompleteChange(e, name) {
    setValues({...values, [name]: e.target.innerText});
    //validateForm()
  }

  function handleStatusChange(e) {
    if (e.target.checked === true) {
      setValues({...values, status: 'A'});
    } else {
      setValues({...values, status: 'I'});
    }
  }
  function handleVisibleChange(e) {
    if (e.target.checked === true) {
      setValues({...values, visible: 'Y'});
    } else {
      setValues({...values, visible: 'N'});
    }
  }

  // setValues({...values,[name]:e.target.checked})

  //~~~~Form Validations~~~~
  const [values, setValues] = useState({
    searchkey: '',
    name: '',
    taxkey: '',
    taxcategorykey: '',
    taxcode: '',
    maxdebt: '',
    address: '',
    address2: '',
    postalcode: '',
    city: '',
    state: '',
    region: '',
    country: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    phone2: '',
    fax: '',
    notes: '',
    visible: 'N',
    status: 'A',
  });
  const [Error, setIS_Error] = useState({
    searchkey: '',
    name: '',
    taxkey: '',
    taxcategorykey: '',
    taxcode: '',
    maxdebt: '',
    address: '',
    address2: '',
    postalcode: '',
    city: '',
    state: '',
    region: '',
    country: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    phone2: '',
    fax: '',
    notes: '',
    visible: 'N',
    status: 'A',
  });
  const [put_id, setPut_id] = useState('');
  //  const simpleValidator = useRef(new SimpleReactValidator())
  const [tax, setTax] = useState([]);
  const [tax_category, setTax_category] = useState([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!_.isEmpty(props.id_data)) {
      let ID_data = props.id_data;
      let id = ID_data.map((i) => i.id);
      setPut_id(id);

      var obj = ID_data;
      for (let key of Object.keys(obj)) {
        var value = obj[key];
        setValues(value);
      }
    }

    getData();
  }, [props.id_data]);
  const getData = async () => {
    await TaxCategoryservice.getAll()
      .then((response) => {
        let Url_data = response.data;
        setTax_category(Url_data);
      })
      .catch((e) => {});
    await Taxservice.getAll()
      .then((response) => {
        let Url_data = response.data;
        setTax(Url_data);
      })
      .catch((e) => {});
  };

  const handleSubmit = async (event) => {
    // event.preventDefault();
    event.preventDefault();
    // if (validateForm()) {
    //   // let values = {};
    //   // values["name"] = "";
    //   // values["email"] = "";
    //   // values["phone"] = "";
    //   // values["searchkey"] = "";
    //   // setValues({values});

    // }
    validateForm();
    if (_.isEmpty(Error)) {
      let id = put_id[0];
      let data = {
        table_name: 'customer',
        table_data: values,
      };
      if (put_id.length > 0) {
        await Customerservice.update(id, data).then((res) => {
          if (res.status === 200) {
            //alert("SuccessFully Updated")
            // muialert()
            setOpen(true);
          }
        });
      }

      if (put_id.length === 0) {
        await Customerservice.create(data).then((response) => {
          response.data.affectedRows === 1
            ? setOpen(true)
            : alert('Form Not Submitted Something went Wrong');
        });
      }
    }
  };

  const validateForm = () => {
    let value = values;
    let errors = {};
    let formIsValid = true;

    if (!value['name']) {
      formIsValid = false;
      errors['name'] = '*Please enter alphabet characters only.';
      //setIS_Error({...Error,name:"*Please enter alphabet characters only."})
    }
    if (typeof value['name'] !== 'undefined') {
      if (!value['name'].match(/^[a-zA-Z ]*$/)) {
        formIsValid = false;
        errors['name'] = '*Please enter alphabet characters only.';
      }
    }
    if (!value['address']) {
      formIsValid = false;
      errors['address'] = '*Please enter your House No.-780 this format only.';
      //setIS_Error({...Error,address:"*Please enter your House No.-780 this format only."})
    }
    if (typeof value['address'] !== 'undefined') {
      if (!value['address'].match(/^[a-zA-Z0-9\s,.'-]*$/)) {
        formIsValid = false;
        errors['address'] =
          '*Please enter your House No.-780 this format only.';
      }
    }

    if (!value['address2']) {
      formIsValid = false;
      errors['address2'] = '*Please enter your Address2.';
      //setIS_Error({...Error,address2:"*Please enter your Address2."})
    }

    if (typeof value['address2'] !== 'undefined') {
      if (!value['address2'].match(/^[a-zA-Z0-9\s,.'-]*$/)) {
        formIsValid = false;
        errors['address'] =
          '*Please enter your House No.-780 this format only.';
        //setIS_Error({...Error,address2:"*Please enter your House No.-780 this format only."})
      }
    }

    if (!value['email']) {
      formIsValid = false;
      errors['email'] = '*Please enter your email-ID.';
      //setIS_Error({...Error,email:"*Please enter your email-ID."})
    }
    if (typeof value['email'] !== 'undefined') {
      //regular expression for email validation
      var pattern = new RegExp(
        /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i,
      );
      if (!pattern.test(value['email'])) {
        formIsValid = false;
        errors['email'] = '*Please enter valid email-ID.';
      }
    }

    if (!value['phone']) {
      formIsValid = false;
      errors['phone'] = '*Please enter phone no.';
      // setIS_Error({...Error,phone:"*Please enter valid phone no."})
    }
    if (typeof value['phone'] !== 'undefined') {
      pattern = new RegExp(/^[0-9]{10}$/);
      if (!pattern.test(value['phone'])) {
        formIsValid = false;
        errors['phone'] = '*Please enter valid phone no.';
      }
    }
    if (!value['phone2']) {
      formIsValid = false;
      errors['phone2'] = '*Please enter your phone2 no.';
      //setIS_Error({...Error,phone2:"*Please enter your phone2 no."})
    }

    if (typeof value['phone2'] !== 'undefined') {
      pattern = new RegExp(/^[0-9]{10}$/);
      if (!pattern.test(value['phone2'])) {
        formIsValid = false;
        errors['phone2'] = '*Please enter valid phone2 no.';
        //setIS_Error({...Error,phone2:"*Please enter valid phone no."})
      }
    }
    if (!value['firstname']) {
      formIsValid = false;
      errors['firstname'] = '*Please enter alphabet characters only.';
    }
    if (typeof value['firstname'] !== 'undefined') {
      if (!value['firstname'].match(/^[a-zA-Z ]*$/)) {
        formIsValid = false;
        errors['firstname'] = '*Please enter alphabet characters only.';
      }
    }
    if (!value['lastname']) {
      formIsValid = false;
      errors['lastname'] = '*Please enter your lastname.';
      //setIS_Error({...Error,lastname:"*Please enter your lastname."})
    }

    if (typeof value['lastname'] !== 'undefined') {
      if (!value['lastname'].match(/^[a-zA-Z ]*$/)) {
        formIsValid = false;
        errors['lastname'] = '*Please enter alphabet characters only.';
      }
    }
    if (!value['taxkey']) {
      formIsValid = false;
      errors['taxkey'] = '*Please enter your taxkey.';
      // setIS_Error({...Error,taxkey:"*Please select your taxkey."});
    }
    if (!value['taxcategorykey']) {
      formIsValid = false;
      errors['taxcategorykey'] = '*Please enter your taxcategorykey.';
      // setIS_Error({...Error,taxcategorykey:"*Please select your taxcategorykey."});
    }
    if (!value['maxdebt']) {
      formIsValid = false;
      errors['maxdebt'] = '*Please enter your maxdebt.';
      //setIS_Error({...Error,maxdebt:"*Please enter your maxdebt."});
    }
    if (!value['postalcode']) {
      formIsValid = false;
      errors['postalcode'] = '*Please enter your postalcode.';
      // setIS_Error({...Error,postalcode:"*Please enter your postalcode."});
    }
    if (!value['city']) {
      formIsValid = false;
      errors['city'] = '*Please select your city.';
      //setIS_Error({...Error,city:"*Please select your city."});
    }
    if (!value['state']) {
      formIsValid = false;
      errors['state'] = '*Please select your state.';
      //setIS_Error({...Error,state:"*Please select your state."});
    }
    if (!value['region']) {
      formIsValid = false;
      errors['region'] = '*Please enter your region.';
      //setIS_Error({...Error,region:"*Please select your region."});
    }
    if (!value['country']) {
      formIsValid = false;
      errors['country'] = '*Please select your country.';
      //setIS_Error({...Error,country:"*Please select your country."});
    }

    if (!value['fax']) {
      formIsValid = false;
      errors['fax'] = '*Please enter your fax no.';
      // setIS_Error({...Error,region:"*Please enter your region."});
    }
    if (!value['notes']) {
      formIsValid = false;
      errors['notes'] = '*Please enter your notes.';
      //setIS_Error({...Error,notes:"*Please enter your notes."});
    }
    if (!value['searchkey']) {
      formIsValid = false;
      errors['searchkey'] = '*Please enter your searchkey.';
      //setIS_Error({...Error,notes:"*Please enter your notes."});
    }
    if (!value['taxcode']) {
      formIsValid = false;
      errors['taxcode'] = '*Please enter your taxcode.';
      //setIS_Error({...Error,notes:"*Please enter your notes."});
    }

    setIS_Error(errors);
    return formIsValid;
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {put_id.length > 0 ? (
          <h1> {put_id[0]} - Edit Customer Form</h1>
        ) : (
          <h1>New Customer Form</h1>
        )}
        <Grid
          style={{
            minHeight: '100px',
            width: '100%',
            backgroundColor: '',
            float: 'left',
          }}
          spacing={0}
          // lg={12}
          // sm={12}
          // md={12}
          // xs={12}
          container
          direction='row'
          //
          form={false}
        >
          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <TextField
              value={values.searchkey}
              style={{}}
              fullWidth={false}
              helperText={<div className='errorMsg'>{Error.searchkey}</div>}
              placeholder='Placeholder'
              label='Search Key'
              name='searchkey'
              color='primary'
              multiline={false}
              rows={1}
              rowsMax={1}
              type='text'
              variant='filled'
              onChange={handleInputChange}
            />
          </Grid>

          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <TextField
              value={values.name}
              style={{}}
              fullWidth={false}
              helperText={<div className='errorMsg'>{Error.name}</div>}
              placeholder='Placeholder'
              label='Name'
              name='name'
              color='primary'
              multiline={false}
              rows={1}
              rowsMax={1}
              type='text'
              variant='filled'
              onChange={handleInputChange}
            />
          </Grid>

          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <TextField
              style={{}}
              name='address'
              label='Address'
              width='300px'
              helperText={<div className='errorMsg'>{Error.address}</div>}
              multiline='true'
              rows={1}
              variant='filled'
              defaultValue={`${
                props.id_data ? props.id_data.map((i) => i.address) : ''
              }`}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <TextField
              style={{}}
              helperText={<div className='errorMsg'>{Error.address2}</div>}
              name='address2'
              label='Address 2'
              multiline='true'
              defaultValue={`${
                props.id_data ? props.id_data.map((i) => i.address2) : ''
              }`}
              rows={1}
              variant='filled'
              onChange={handleInputChange}
            />
          </Grid>
          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <TextField
              value={values.postalcode}
              style={{}}
              fullWidth={false}
              helperText={<div className='errorMsg'>{Error.postalcode}</div>}
              placeholder='Placeholder'
              label='Postal Code'
              name='postalcode'
              color='primary'
              multiline={false}
              rows={1}
              rowsMax={1}
              type='text'
              variant='filled'
              onChange={handleInputChange}
            />
          </Grid>
          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <Autocomplete
              style={{width: '200px'}}
              name='city'
              defaultValue={`${
                props.id_data ? props.id_data.map((i) => i.city) : ''
              }`}
              //onInputChange={handleCityChange}
              inputProps={{value: values.city}}
              onChange={(e) => handleAutoCompleteChange(e, 'city')}
              options={Cities}
              // getOptionLabel={(option) => option.title}
              getItemValue={(item) => item.title}
              // style={{"width": 300}}
              renderInput={(params) => (
                <TextField {...params} label='City' variant='filled' />
              )}
            />
            {<div className='errorMsg'>{Error.city}</div>}
          </Grid>
          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <Autocomplete
              style={{width: '200px'}}
              defaultValue={`${
                props.id_data ? props.id_data.map((i) => i.state) : ''
              }`}
              //  onInputChange={handleStateChange}
              inputProps={{value: values.state}}
              onChange={(e) => handleAutoCompleteChange(e, 'state')}
              options={State}
              // getOptionLabel={(option) => option.title}
              getItemValue={(item) => item.name}
              //    style={{"width": 300}}
              renderInput={(params) => (
                <TextField {...params} label='State' variant='filled' />
              )}
            />
            {<div className='errorMsg'>{Error.state}</div>}
          </Grid>
          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <Autocomplete
              style={{width: '200px'}}
              defaultValue={`${
                props.id_data ? props.id_data.map((i) => i.region) : ''
              }`}
              //   onInputChange={handleRegionChange}
              inputProps={{value: values.region}}
              onChange={(e) => handleAutoCompleteChange(e, 'region')}
              options={Regions}
              //getOptionLabel={(option) => option.title}
              getItemValue={(item) => item.name}
              // style={{"width": 300}}
              renderInput={(params) => (
                <TextField {...params} label='Region' variant='filled' />
              )}
            />
            {<div className='errorMsg'>{Error.region}</div>}
          </Grid>
          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <Autocomplete
              style={{width: '200px'}}
              defaultValue={`${
                props.id_data ? props.id_data.map((i) => i.country) : ''
              }`}
              //  onInputChange={handleCountryChange}
              inputProps={{value: values.country}}
              onChange={(e) => handleAutoCompleteChange(e, 'country')}
              options={Country.map((c) => c.name)}
              // getOptionLabel={(option) => option.name}
              getItemValue={(item) => item.name}
              //    style={{"width": 300}}
              renderInput={(params) => (
                <TextField {...params} label='Country' variant='filled' />
              )}
            />
            {<div className='errorMsg'>{Error.country}</div>}
          </Grid>
          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <TextField
              value={values.firstname}
              style={{}}
              fullWidth={false}
              helperText={<div className='errorMsg'>{Error.firstname}</div>}
              placeholder='Placeholder'
              label='First Name'
              name='firstname'
              color='primary'
              multiline={false}
              rows={1}
              rowsMax={1}
              type='text'
              variant='filled'
              onChange={handleInputChange}
            />
          </Grid>
          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <TextField
              value={values.lastname}
              style={{}}
              fullWidth={false}
              helperText={<div className='errorMsg'>{Error.lastname}</div>}
              placeholder='Placeholder'
              label='Last Name'
              name='lastname'
              color='primary'
              multiline={false}
              rows={1}
              rowsMax={1}
              type='text'
              variant='filled'
              onChange={handleInputChange}
            />
          </Grid>
          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <TextField
              value={values.email}
              style={{}}
              fullWidth={false}
              helperText={<div className='errorMsg'>{Error.email}</div>}
              placeholder='Placeholder'
              label='Email'
              name='email'
              color='primary'
              multiline={false}
              rows={1}
              rowsMax={1}
              type='text'
              variant='filled'
              onChange={handleInputChange}
            />
          </Grid>
          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <TextField
              value={values.phone}
              style={{}}
              fullWidth={false}
              onWheel={ (e) => e.target.blur()}
              helperText={<div className='errorMsg'>{Error.phone}</div>}
              placeholder='Placeholder'
              label='Phone'
              name='phone'
              color='primary'
              multiline={false}
              rows={1}
              rowsMax={1}
              type='number'
              variant='filled'
              onChange={handleInputChange}
            />
          </Grid>
          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <TextField
              value={values.phone2}
              style={{}}
              fullWidth={false}
              onWheel={ (e) => e.target.blur()}
              helperText={<div className='errorMsg'>{Error.phone2}</div>}
              placeholder='Placeholder'
              label='Phone 2'
              name='phone2'
              color='primary'
              multiline={false}
              rows={1}
              rowsMax={1}
              type='number'
              variant='filled'
              onChange={handleInputChange}
            />
          </Grid>
          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <TextField
              value={values.fax}
              style={{}}
              fullWidth={false}
              helperText={<div className='errorMsg'>{Error.fax}</div>}
              placeholder='Placeholder'
              label='Fax'
              name='fax'
              color='primary'
              multiline={false}
              rows={1}
              rowsMax={1}
              type='text'
              variant='filled'
              onChange={handleInputChange}
            />
          </Grid>
          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <Autocomplete
              style={{width: '200px'}}
              name='taxkey'
              defaultValue={`${
                props.id_data ? props.id_data.map((i) => i.taxkey) : ''
              }`}
              //onInputChange={handleCityChange}
              inputProps={{value: values.taxkey}}
              //getOptionLabel={() => values.taxkey ? values.taxkey : ""}
              onChange={(e) => handleAutoCompleteChange(e, 'taxkey')}
              options={tax.map((t) => t.taxkey)}
              // getOptionLabel={(option) => option.title}
              getItemValue={(item) => item.taxkey}
              // style={{"width": 300}}
              renderInput={(params) => (
                <TextField {...params} label='Tax_key' variant='filled' />
              )}
            />
            {<div className='errorMsg'>{Error.taxkey}</div>}
          </Grid>
          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <Autocomplete
              style={{width: '200px'}}
              defaultValue={`${
                props.id_data ? props.id_data.map((i) => i.taxcategorykey) : ''
              }`}
              //  onInputChange={handleStateChange}
              inputProps={{value: values.taxcategorykey}}
              onChange={(e) => handleAutoCompleteChange(e, 'taxcategorykey')}
              options={tax_category.map((t) => t.taxcategorykey)}
              // getOptionLabel={(option) => option.title}
              getItemValue={(item) => item.taxcategorykey}
              //    style={{"width": 300}}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Taxcategory_key'
                  variant='filled'
                />
              )}
            />
            {<div className='errorMsg'>{Error.taxcategorykey}</div>}
          </Grid>
          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <TextField
              value={values.taxcode}
              // style={{ minWidth: "200px", minHeight: "70.5px" }}
              fullWidth={false}
              helperText={<div className='errorMsg'>{Error.taxcode}</div>}
              placeholder='Tax Code'
              label='Tax Code'
              name='taxcode'
              color='primary'
              multiline={false}
              rows={1}
              rowsMax={1}
              type='text'
              variant='filled'
              onChange={handleInputChange}
            />
          </Grid>
          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <TextField
              value={values.maxdebt}
              // style={{ minWidth: "200px", minHeight: "70.5px" }}
              fullWidth={false}
              helperText={<div className='errorMsg'>{Error.maxdebt}</div>}
              placeholder='Max Debt'
              label='Max Debt'
              name='maxdebt'
              color='primary'
              multiline={false}
              rows={1}
              rowsMax={1}
              type='text'
              variant='filled'
              onChange={handleInputChange}
            />
          </Grid>

          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <TextField
              style={{}}
              helperText={<div className='errorMsg'>{Error.notes}</div>}
              name='notes'
              label='Notes'
              multiline='true'
              rows={1}
              variant='filled'
              defaultValue={`${
                props.id_data ? props.id_data.map((i) => i.notes) : ''
              }`}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <FormControlLabel
              control={
                <Switch
                  style={{}}
                  value={values.visible}
                  checked={values.visible === 'Y' ? true : false}
                  name='visible'
                  size='medium'
                  color='primary'
                  onChange={handleVisibleChange}
                />
              }
              label='Visible'
            />
          </Grid>
          <Grid
            style={{
              minHeight: '100px',
              width: '100%',
              backgroundColor: '',
              float: 'left',
            }}
            form={false}
            size={{
              lg: 3,
              sm: 6,
              md: 4,
              xs: 12
            }}>
            <FormControlLabel
              control={
                <Switch
                  style={{}}
                  value={values.status}
                  name='status'
                  checked={values.status === 'A' ? true : false}
                  size='medium'
                  color='primary'
                  onChange={handleStatusChange}
                />
              }
              label='Status'
            />
          </Grid>
        </Grid>
        <Grid
          style={{
            minHeight: '100px',
            width: '100%',
            padding: '15px',
            //"backgroundColor": "",
            float: 'right',
          }}
          form={false}
          size={{
            lg: 1,
            sm: 6,
            md: 2,
            xs: 12
          }}>
          <Button
            style={{}}
            variant='contained'
            color='primary'
            size='medium'
            text='button'
            type='submit'
            //onClick={(e) =>handleSubmit(e)}
            fullWidth={false}
          >
            Save
          </Button>
        </Grid>
        <Grid
          style={{
            minHeight: '100px',
            width: '100%',
            padding: '15px',
            //"backgroundColor": "",
            float: 'right',
          }}
          form={false}
          size={{
            lg: 1,
            sm: 6,
            md: 2,
            xs: 12
          }}>
          <Button
            style={{}}
            variant='contained'
            color='secondary'
            size='medium'
            text='button'
            onClick={() => props.handleClose()}
            fullWidth={false}
          >
            Back
          </Button>
          <Dialog
            open={open}
            onClose={!open}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
          >
            <DialogTitle>
              {put_id.length > 0 ? (
                <Alert variant='filled' severity='success'>
                  {' '}
                  {put_id[0]} - Updated Successfully{' '}
                </Alert>
              ) : (
                <Alert variant='filled' severity='success'>
                  {' '}
                  Succesfully Submitted
                </Alert>
              )}
            </DialogTitle>
            <DialogActions>
              <Button
                onClick={() => props.handleClose()}
                color='primary'
                autoFocus
              >
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </form>
    </>
  );
}

export default NewCustomer;
