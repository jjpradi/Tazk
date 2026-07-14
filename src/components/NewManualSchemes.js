import React, {useState, useEffect, useRef, useContext} from 'react';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
import {formLabelsTheme} from './Asterisk';
import {
  Button,
  Switch,
  TextField,
  Typography,
  Grid,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  FormHelperText,
  Link,
  RadioGroup,
  Radio,
  FormControlLabel,
} from '@mui/material';
import {getTrimmedData} from './trimFunction/index';
import Autocomplete from '@mui/material/Autocomplete';
import _ from 'lodash';
import { object } from 'yup';
import AppHeader from '@crema/core/AppLayout/DefaultLayout/AppHeader';
import { useDispatch, useSelector } from 'react-redux';
import { listCustomerAction } from 'redux/actions/customer_actions';
import context from '../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';


function NewManualSchemes(props) {
  const [formValues, setFormValues] = useState({
    mappingColumns:[],
    name: null,
    note_type: 'CN',
    scheme_amount: null,
    target_status:'total'
  });
  const [formErrors, setFormErrors] = useState({
    mappingColumns:null,
    name: null,
    note_type: null,
    scheme_amount: null,
  });
  const [requiredFields] = useState(['name', 'scheme_amount','mappingColumns']);
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);

  const initsform = () => {
    setInitialState(formValues);
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, []);

  const dispatch = useDispatch();

  const {customerReducer:{customer}} = useSelector(state => state)
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);

  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      !customer.length && dispatch(listCustomerAction(setModalTypeHandler, setLoaderStatusHandler)),
    );
}, [])
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
  }, [formValues, initialState]);

  const handleChange = async (e) => {
    let {name, value} = e.target;

    setStateHandler(name, value);
  };

  const cancel = () => {
    setDialog(false);
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
    }else {
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

    let isValid = true;
    let formErrorsObj = {...formErrors};
    await Object.keys(formValues).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '' || (typeof formValues[key]  === 'object' && formValues[key].length === 0))
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + 'is Required!';
      }

      return null;
    });
    await setFormErrors(formErrorsObj);
    // alert("Is Form Valid - " + isValid);

    // API call..
   if (isValid) props.handleSubmit(getTrimmedData(formValues));
  };
  return (
    <>
      {/* <AppHeader hidden={false} /> */}
      {Prompt}
      <Typography
        variant='h6'
        align='left'
        fontWeight='bold'
        style={{paddingBottom: '20px'}}
      >
        {props.status === 'edit' ? 'Update Manual Note' : 'New Manual Scheme'}
      </Typography>
      <div
        style={{
          border: '1px solid #b5b5b5',
          borderRadius: '10px',
          justifyContent: 'center',
          display: 'flex',
        }}
      >
        <FormControl component='fieldset'>
          {/* <FormLabel component="legend">Gender</FormLabel> */}
          <RadioGroup
            row
            aria-label='ManualNote Type'
            value={formValues.note_type}
            name='note_type'
            onChange={(e) => setStateHandler('note_type', e.target.value)}
            
          >
            <FormControlLabel
              value='CN'
              control={<Radio />}
              label='Credit Note'
              disabled={props.status === 'edit'}
            />
            <FormControlLabel
              value='DN'
              control={<Radio />}
              label='Debit Note'
              disabled={props.status === 'edit'}
            />
          </RadioGroup>
        </FormControl>
      </div>
      <Grid spacing={3} container direction='row' sx={{paddingTop: 5}}>
      <Grid
        size={{
          lg: 3,
          md: 3,
          sm: 4,
          xs: 12
        }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder='Scheme Name'
            label='Scheme Name'
            name='name'
            color='primary'
            type='text'
            regex=''
            variant='filled'
            value={

              formValues.name === null ? '' : formValues.name
            }
            error={formErrors.name === null ? false : true}
            helperText={
              formErrors.name === null ? '' : 'Scheme Name is Required!'
            }
          />
        </Grid>
        <Grid
          size={{
            lg: 3,
            md: 3,
            sm: 4,
            xs: 12
          }}>
          <Autocomplete
            id='multiple-limit-tags'
            disabled={props.status === 'edit' ? true : false}
            multiple
            defaultValue={
               customer.filter(
                    (d) => formValues.note_type === 'CN' ? d.customer_id !== null && formValues.mappingColumns.some(s => s.customer_id === d.customer_id) : d.supplier_id !== null && formValues.mappingColumns.some(s => s.supplier_id === d.supplier_id),
                  )
            }
           
            options=
            {customer.filter((c) =>
              formValues.note_type === 'CN'

                ? c.company_name !== null && c.customer_type === '1'
                : c.supplier_id,
            )}
            fullWidth
            getOptionLabel={(option) => option.company_name}
            onChange={(e, c) =>
              c !== null
                ? setStateHandler(
                      'mappingColumns',
                    formValues.note_type === 'CN' ? c.map(m =>  {return {customer_id:m.customer_id,supplier_id:null}}) :c.map(m =>  {return {supplier_id:m.supplier_id,customer_id:null}}),
                  )
                : ''
            }
            renderOption={(props, option) => {
              return (
                <li {...props} key={option.person_id}>
                  {option.company_name}
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth={true}
                required={true}
                variant='filled'
                label='Select Customer'
                placeholder='Select Cutomer'
                error={formErrors.mappingColumns === null ? false : true}
                helperText={
                  formErrors.mappingColumns === null ? '' : 'Customer is Required!'
                }
              />
            )}
          />
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 3,
            sm: 4,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder='Amount'
            label='Scheme Amount'
            name='scheme_amount'
            color='primary'
            type="number"
            regex=''
            variant='filled'
            value={formValues.scheme_amount === null ? '' : formValues.scheme_amount}
            error={formErrors.scheme_amount === null ? false : true}
            helperText={formErrors.scheme_amount === null ? '' : 'Scheme Amount is Required!'}
          />
        </Grid>
        <Grid
          size={{
            lg: 3,
            md: 3,
            sm: 4,
            xs: 12
          }}>
        <FormControl component='fieldset' style={{paddingLeft: '10px'}}>
            {/* <FormLabel component="legend">Gender</FormLabel> */}
            <RadioGroup
              row
              aria-label='customer'
              value={formValues.target_status}
              name='target_status'
              onChange={handleChange}
            >
              <FormControlLabel value='each' control={<Radio />} label='Each' />
              <FormControlLabel
                value='total'
                control={<Radio />}
                label='Total'
              />
            </RadioGroup>
          </FormControl>
          </Grid>

        <Grid
          style={{paddingTop: '25px'}}
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid spacing={7} container direction='row' display= 'flex' justifyContent= 'flex-end'>
            <Grid>
              {form === false ? (
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
      </Grid>
      <CancelDialog
        handle={cancel}
        delete={dialog}
        close={props.handleClose}
      ></CancelDialog>
    </>
  );
}

export default NewManualSchemes;
