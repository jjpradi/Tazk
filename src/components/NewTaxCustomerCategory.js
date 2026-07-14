import React, {useState, useEffect, useRef} from 'react';
import _ from 'lodash';
import {Button, TextField, Typography, Grid, Autocomplete} from '@mui/material';
// const useStyles = makeStyles(theme =>

function NewTaxCustomerCategory(props) {
  const [formValues, setFormValues] = useState({
    jurisdiction_name: null,
    tax_group: null,
    tax_type: null,
    reporting_authority: null,
    tax_group_sequence: null,
    cascade_sequence: null,
  });
  const [formErrors, setFormErrors] = useState({
    jurisdiction_name: null,
    tax_group: null,
    tax_type: null,
    reporting_authority: null,
    tax_group_sequence: null,
    cascade_sequence: null,
  });
  const [requiredFields] = useState([
    'jurisdiction_name',
    'tax_group',
    'tax_type',
    'reporting_authority',
    'tax_group_sequence',
    'cascade_sequence',
  ]);
  const [regex] = useState({});
  const tempempty = useRef(null);

  const options = [
    {label: 'Select One', value: null},
    {label: 'Option 1', value: 'Option 1'},
    {label: 'Option 2', value: 'Option 2'},
    {label: 'Option 3', value: 'Option 3'},
  ];

  const handleChange = async (e) => {
    let {name, value} = e.target;

    setStateHandler(name, value);
  };

  const handleSelect = (e, value, targetName) => {
    setStateHandler(targetName, value);
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
        [name]: capitalize(name) + 'is Required!',
      });
    } else if (regex[name]) {
      if (!regex[name].test(value)) {
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + 'is Invalid!',
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
        formErrorsObj[key] = capitalize(key) + 'is Required!';
      } else if (regex[key]) {
        if (!regex[key].test(formValues[key])) {
          // isValid = false;
          formErrorsObj[key] = capitalize(key) + 'is Invalid!';
        }
      }
      return null;
    });
    await setFormErrors(formErrorsObj);

    //alert("Is Form Valid - " + isValid);

    // API call..
  };
  const empty = () => {
    if (!_.isEmpty(props.edit_id_data)) {
      let ID_data = props.edit_id_data;
      // let id =ID_data.map(i => i.id)
      // setPut_id(id)
      var obj = ID_data;
      for (let key of Object.keys(obj)) {
        var value = obj[key];
        setFormValues(value);
      }
    }
  };
  tempempty.current = empty;
  useEffect(() => {
    tempempty.current();
  }, []);

  return (
    <>
      <Typography variant='h5' align='left' style={{paddingBottom: '50px'}}>
        {props.edit_id_data.length > 0
          ? `Edit-${props.edit_id_data[0].id}-TaxCustomerCategory`
          : 'NewTaxCustomerCategory'}
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
        form={false}
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
            placeholder='Enter Name'
            label='Name'
            name='jurisdiction_name'
            value={
              formValues.jurisdiction_name === null
                ? ''
                : formValues.jurisdiction_name
            }
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='standard'
            error={formErrors.jurisdiction_name === null ? false : true}
            helperText={
              formErrors.jurisdiction_name === null
                ? ''
                : formErrors.jurisdiction_name
            }
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
          <Autocomplete
            name='tax_group'
            defaultValue={options.find((v) => v.label[0])}
            options={options}
            getOptionLabel={(options) => options.label}
            onChange={(e, v) => handleSelect(e, v, 'tax_group')}
            autoHighlight={true}
            renderInput={(params) => (
              <TextField
                {...params}
                label='Tax Group'
                variant='outlined'
                error={formErrors.tax_group === null ? false : true}
                helperText={
                  formErrors.tax_group === null ? '' : formErrors.tax_group
                }
                required={true}
              />
            )}
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
          <Autocomplete
            name='tax_type'
            defaultValue={options.find((v) => v.label[0])}
            options={options}
            getOptionLabel={(options) => options.label}
            onChange={(e, v) => handleSelect(e, v, 'tax_type')}
            autoHighlight={true}
            renderInput={(params) => (
              <TextField
                {...params}
                label='Tax Type'
                variant='outlined'
                error={formErrors.tax_type === null ? false : true}
                helperText={
                  formErrors.tax_type === null ? '' : formErrors.tax_type
                }
                required={true}
              />
            )}
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
          <Autocomplete
            name='reporting_authority'
            defaultValue={options.find((v) => v.label[0])}
            options={options}
            getOptionLabel={(options) => options.label}
            onChange={(e, v) => handleSelect(e, v, 'reporting_authority')}
            autoHighlight={true}
            renderInput={(params) => (
              <TextField
                {...params}
                label='Reporting Authority'
                variant='outlined'
                error={formErrors.reporting_authority === null ? false : true}
                helperText={
                  formErrors.reporting_authority === null
                    ? ''
                    : formErrors.reporting_authority
                }
                required={true}
              />
            )}
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
            placeholder='Enter Tax Group Sequence'
            label='Tax Group Sequence'
            name='tax_group_sequence'
            value={
              formValues.tax_group_sequence === null
                ? ''
                : formValues.tax_group_sequence
            }
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='standard'
            error={formErrors.tax_group_sequence === null ? false : true}
            helperText={
              formErrors.tax_group_sequence === null
                ? ''
                : formErrors.tax_group_sequence
            }
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
            placeholder='Enter Cascade Sequence'
            label='Cascade Sequence'
            name='cascade_sequence'
            value={
              formValues.cascade_sequence === null
                ? ''
                : formValues.cascade_sequence
            }
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='standard'
            error={formErrors.cascade_sequence === null ? false : true}
            helperText={
              formErrors.cascade_sequence === null
                ? ''
                : formErrors.cascade_sequence
            }
          />
        </Grid>
        <Grid
          spacing={0}
          // lg={12}
          // md={12}
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
              lg: 2,
              md: 3,
              sm: 6,
              xs: 6
            }}>
            <Button
              onClick={() => props.handleClose()}
              style={{}}
              name='CANCEL'
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
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default NewTaxCustomerCategory;
