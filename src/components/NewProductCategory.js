import React, {useState} from 'react';
// import {formLabelsTheme} from "./Asterisk";
import {Button, TextField, Typography, Grid} from '@mui/material';

function NewProductCategory(props) {
  const [formValues, setFormValues] = useState({name: null, percent: null});
  const [formErrors, setFormErrors] = useState({name: null, percent: null});
  const [requiredFields] = useState(['name', 'percent']);
  const [regex] = useState({});

  const handleChange = async (e) => {
    let {name, value} = e.target;

    setStateHandler(name, value);
  };

  const setStateHandler = async (name, value) => {
    let formObj = {};

    formObj = {
      ...formValues,
      [name]: value,
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

    // let isValid = true;
    let formErrorsObj = {...formErrors};
    await Object.keys(formValues).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        // isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      } else if (regex[key]) {
        if (!regex[key].test(formValues[key])) {
          // isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Invalid!';
        }
      }
      return null;
    });
    await setFormErrors(formErrorsObj);

    //alert("Is Form Valid - " + isValid);

    // API call..
  };

  return (
    <>
      <Typography variant='h5' align='left' style={{}}>
        Product Catagory
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
        // form={false}
      >
        <Grid
          form={false}
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
            placeholder=' Enter Product Category Name'
            label='Product Category Name'
            name='name'
            value={formValues.name === null ? '' : formValues.name}
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='standard'
            error={formErrors.name === null ? false : true}
            helperText={formErrors.name === null ? '' : formErrors.name}
          />
        </Grid>
        <Grid
          form={false}
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
            placeholder=' Enter Product  Percent'
            label='Product Percent'
            name='percent'
            value={formValues.percent === null ? '' : formValues.percent}
            color='primary'
            multiline={false}
            type='number'
            regex={null}
            variant='standard'
            error={formErrors.percent === null ? false : true}
            helperText={formErrors.percent === null ? '' : formErrors.percent}
          />
        </Grid>
        <Grid
          spacing={0}
          // lg={6}
          // md={6}
          // sm={12}
          // xs={12}
          container
          direction='row'
          //
          form={false}
        >
          <Grid
            form={false}
            size={{
              lg: 3,
              md: 4,
              sm: 6,
              xs: 6
            }}>
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
          </Grid>
          <Grid
            form={false}
            size={{
              lg: 3,
              md: 4,
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
    </>
  );
}

export default NewProductCategory;
