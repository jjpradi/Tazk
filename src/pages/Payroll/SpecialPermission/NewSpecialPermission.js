import React, {useState, useEffect, useRef} from 'react';
import UnSavedChangesWarning from '../../common/unChangeswarning';
import CancelDialog from '../../../components/CancelDialog';
import _ from 'lodash';
import {Button, TextField, Typography, Grid, Checkbox, FormHelperText, MenuItem, FormControl, InputLabel, Select} from '@mui/material';
import {getTrimmedData} from '../../../components/trimFunction/index';
import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
import FormGroup from '@mui/material/FormGroup';
import { DatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { getDateFormat } from 'utils/getTimeFormat';
import { useDispatch, useSelector } from 'react-redux';
import { listEmployeeCategoryAction } from 'redux/actions/shifts.actions';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import toMomentOrNull from 'utils/DateFixer';


function NewSpecialPermission(props) {
  const textRef = useRef(null);
  const { declaredHolidays } = props;
  const [formValues, setFormValues] = useState({
   name:null,
   permission_date: null,
   category_id: [],
   start_time: null,
   end_time: null,
   hours: null
  });
  const [formErrors, setFormErrors] = useState({
    name:null,
    permission_date: null,
    category_id: null,
    start_time: null,
    end_time: null,
    hours: null
  });
  const [requiredFields] = useState([
    'name',
    'permission_date',
    'category_id'
  ]);

  const hasTimeRange = Boolean(formValues.start_time) || Boolean(formValues.end_time);
  const hasHours = formValues.hours !== null && formValues.hours !== '';
  const hoursRegex = /^(\d+h)(\s+\d+m)?$|^\d+m$/;
  const [regex] = useState({});
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [dialog, setDialog] = useState(false);
  const [initialState, setInitialState] = useState({});
  const [form, setForm] = useState(false);
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempedits = useRef(null);
  const {
    ShiftsReducer: { employeeCategoryList }
} = useSelector((state) => state);

const dispatch = useDispatch();

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
  }, [formValues, initialState]);

  const handleChange = async (e) => {
    let {name, value} = e.target;
    if(name !== '') {
      setStateHandler(name, value);
    }
  };

  const cancel = () => {
    setDialog(false);
  };

  const validClose = () => {
    setDialog(true);
  };

  useEffect(()=>{
    let data = {
      type :'LIST_CATEGORY'
    }
    dispatch(listEmployeeCategoryAction(data))
  },[])

  
  const handleSelectAll = () => {
    if (formValues.category_id.length === employeeCategoryList.length) {
      setFormValues({ ...formValues, category_id: [] });
    } else {
      setFormValues({ ...formValues, category_id: employeeCategoryList.map((item) => item.id) });
    }
    setFormErrors({ ...formErrors, category_id: null });
  };

  const handleCategoryChange = (event) => {
    const newValue = event.target.value;
    const isSelectAll = newValue.includes('selectAll');
  
    if (isSelectAll) {
      // Check if all categories are already selected
      const allIds = employeeCategoryList.map((cat) => cat.id);
      const allSelected = formValues.category_id.length === employeeCategoryList.length;
  
      // Toggle select all
      setFormValues({
        ...formValues,
        category_id: allSelected ? [] : allIds, // Deselect all if all are selected, otherwise select all
      });
  
      validationHandler('category_id', allSelected ? [] : allIds);
    } else {
      setFormValues({ ...formValues, category_id: newValue });
      validationHandler('category_id', newValue);
    }
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
    }  else {
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

  // const getTrimmedData = (obj) => {
  //   if (obj && typeof obj === "object") {
  //     Object.keys(obj).map(key => {
  //       if (typeof obj[key] === "object") {
  //         getTrimmedData(obj[key]);
  //       } else if (typeof obj[key] === "string") {
  //         obj[key] = obj[key].trim();
  //       }
  //     });
  //   }
  //   return obj;
  // };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;
    let formErrorsObj = {...formErrors};
    await Object.keys(formValues).map((key, i) => {
      if (requiredFields.includes(key)) {
        if (
          formValues[key] === null ||
          formValues[key] === '' ||
          (Array.isArray(formValues[key]) && formValues[key].length === 0)
        ) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Required!';
        } else if (regex[key]) {
          if (!regex[key].test(formValues[key])) {
            isValid = false;
            formErrorsObj[key] = capitalize(key) + ' is Invalid!';
          }
        }
      }
    });

    if (!hasHours) {
      if (!formValues.start_time) {
        isValid = false;
        formErrorsObj.start_time = 'Start Time is Required!';
      }
      if (!formValues.end_time) {
        isValid = false;
        formErrorsObj.end_time = 'End Time is Required!';
      }
      if (!formValues.start_time && !formValues.end_time) {
        formErrorsObj.hours = 'Enter Hours or Start/End Time';
      }
    } else if (!hoursRegex.test(String(formValues.hours).trim())) {
      isValid = false;
      formErrorsObj.hours = 'Invalid format. Use 1h, 2h or 1h 30m';
    }


    await setFormErrors(formErrorsObj);

    const payload = {
      ...formValues,
      permission_date: formValues.permission_date
        ? formValues.permission_date.format('YYYY-MM-DD')
        : null,
      start_time: hasHours
        ? null
        : formValues.start_time
        ? formValues.start_time.format('HH:mm:ss')
        : null,
      end_time: hasHours
        ? null
        : formValues.end_time
        ? formValues.end_time.format('HH:mm:ss')
        : null,
      hours: hasHours ? String(formValues.hours).trim() : null
    };

  
    if (isValid) {
      
      props.handleSubmit(getTrimmedData(payload), initialState);
    }
    else{
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
  };

  const edits = () => {
    if (props.edit_id_data && props.status === 'edit') {
      const editData = {
        ...props.edit_id_data,
        start_time: props.edit_id_data.start_time
          ? moment(props.edit_id_data.start_time, 'HH:mm:ss')
          : null,
        end_time: props.edit_id_data.end_time
          ? moment(props.edit_id_data.end_time, 'HH:mm:ss')
          : null,
        permission_date: props.edit_id_data.permission_date
          ? moment(props.edit_id_data.permission_date)
          : null,
        hours: props.edit_id_data.hours ?? null
      };
      setFormValues(editData);
      setInitialState(editData);
    }
  };
  tempedits.current = edits;
  useEffect(() => {
    tempedits.current();
  }, [props.edit_id_data]);


  const checkPast = (holidayDate) => {

    let currentDate = new Date();
    let today = currentDate.toISOString().slice(0, 10);
    return holidayDate <= today ? true : false
  };
  
  const onKeyDown = (e) => {
    e.preventDefault();
  };
  
  const formattedDates = declaredHolidays?.map(dateString => {
    const dateObject = new Date(dateString);
    dateObject.setUTCHours(0, 0, 0, 0);
    return dateObject.toISOString();
  });
  

  const shouldDisableDate = (date) => {
    if (!formattedDates) return false;
  
    return formattedDates.some((disabledDate) =>
      date.isSame(moment(disabledDate), 'day')
    );
  };
  
  console.log(formValues, "formValues")
  return (
    <>
      {Prompt}
      <Typography variant='h6' align='left' style={{paddingBottom: '20px'}}>
        {props.statue === 'edit'
          ? 'Edit Special Permission'
          : ' Special Permission'}
      </Typography>
      <Grid spacing={3} container direction='row'>
        <Grid container spacing={3} size={12}>
          <Grid
            size={{
              lg: 3,
              md: 4,
              sm: 12,
              xs: 12
            }}>
            <TextField
              onChange={handleChange}
              onBlur={handleChange}
              fullWidth
              required={true}
              style={{}}
              placeholder='Permission name'
              label='Permission Name'
              name='name'
              color='primary'
              multiline={false}
              type='text'
              regex=''
              variant='filled'
              value={formValues.name === null ? '' : formValues.name}
              error={formErrors.name === null ? false : true}
              helperText={formErrors.name === null ? '' : formErrors.name}
            />
          </Grid>
          <Grid
            size={{
              lg: 3,
              md: 4,
              sm: 12,
              xs: 12
            }}>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                name='permission_date'
                value={toMomentOrNull(formValues.permission_date)}
                format='DD/MM/YYYY'
                fullWidth
                style={{marginBottom: '16px'}}
                onChange={(newValue) => {
                  setStateHandler('permission_date', newValue);
                }}
                label='Permission Date'
                shouldDisableDate={shouldDisableDate}
                slotProps={{ textField: { onKeyDown: onKeyDown, variant: 'filled', fullWidth: true, required: true, onBlur: handleChange, error: formErrors.permission_date === null ? false : true, helperText: formErrors.permission_date === null
                        ? ''
                        : 'Date is required' } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid
            size={{
              lg: 5,
              md: 4,
              sm: 12,
              xs: 12
            }}>
            <FormControl variant='filled' fullWidth required>
              <InputLabel error={Boolean(formErrors.category_id)}>
                Employee Category
              </InputLabel>
              <Select
                multiple
                value={formValues.category_id}
                onChange={handleCategoryChange}
                renderValue={(selected) =>
                  selected.length === employeeCategoryList.length
                    ? 'All Categories Selected'
                    : employeeCategoryList
                        .filter((cat) => selected.includes(cat.id))
                        .map((cat) => cat.category_name)
                        .join(', ')
                }
                error={formErrors.category_id === null ? false : true}
                 helperText={
                      formErrors.category_id === null
                        ? ''
                        : 'Category is required'
                    }
              >
                <MenuItem value='selectAll'>
                  <Checkbox
                    checked={
                      formValues.category_id.length ===
                      employeeCategoryList.length
                    }
                  />
                  Select All
                </MenuItem>
                {employeeCategoryList.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    <Checkbox
                      checked={formValues.category_id.includes(category.id)}
                    />
                    {category.category_name}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.category_id && (
                <FormHelperText error>
                  {formErrors.category_id === null
                    ? ''
                    : 'Category is required'}
                </FormHelperText>
              )}
            </FormControl>
          </Grid>
        </Grid>

        <LocalizationProvider dateAdapter={DateAdapter}>
          <Grid container spacing={3} size={12}>
            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 12,
                xs: 12
              }}>
              <TimePicker
                label='Start Time'
                value={toMomentOrNull(formValues.start_time)}
                disabled={hasHours}
                onChange={(newValue) => {
                  setStateHandler('start_time', newValue);
                }}
                slotProps={{
                  textField: {
                    variant: 'filled', fullWidth: true, required: !hasHours, error: formErrors.start_time === null ? false : true, helperText: formErrors.start_time === null
                      ? ''
                      : 'Start Time is required'
                  }
                }}
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 12,
                xs: 12
              }}>
              <TimePicker
                label='End Time'
                required={!hasHours}
                disabled={hasHours}
                value={toMomentOrNull(formValues.end_time)}
                onChange={(newValue) => {
                  setStateHandler('end_time', newValue);
                }}
                slotProps={{
                  textField: {
                    variant: 'filled', fullWidth: true, required: !hasHours, error: formErrors.end_time === null ? false : true, helperText: formErrors.end_time === null
                      ? ''
                      : 'End Time is required'
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant='filled'
                    fullWidth
                    required={!hasHours}
                    error={formErrors.end_time === null ? false : true}
                    helperText={
                      formErrors.end_time === null ? '' : 'End Time is required'
                    }
                  />
                )}
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 12,
                xs: 12
              }}>
              <TextField
                onChange={handleChange}
                onBlur={handleChange}
                fullWidth
                disabled={hasTimeRange}
                required={!hasTimeRange}
                placeholder='e.g. 1h 30m'
                label='Hours'
                name='hours'
                color='primary'
                type='text'
                variant='filled'
                value={formValues.hours === null ? '' : formValues.hours}
                error={formErrors.hours === null ? false : true}
                helperText={formErrors.hours === null ? 'Format: 1h, 2h, 1h 30m' : formErrors.hours}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>

        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid
            spacing={7}
            container
            direction='row'
            display='flex'
            justifyContent='flex-start'
            paddingTop='25px'
          >
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
                  cancel
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

export default NewSpecialPermission;
