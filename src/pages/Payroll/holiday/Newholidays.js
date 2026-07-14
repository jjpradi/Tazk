import React, {useState, useEffect, useRef} from 'react';
import UnSavedChangesWarning from '../../common/unChangeswarning';
import CancelDialog from '../../../components/CancelDialog';
// import {formLabelsTheme} from "./Asterisk";
import _ from 'lodash';
import {Button, TextField, Typography, Grid, Checkbox, FormControlLabel, Chip} from '@mui/material';
import {getTrimmedData} from '../../../components/trimFunction/index';
import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
import FormGroup from '@mui/material/FormGroup';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { getDateFormat } from 'utils/getTimeFormat';
import { useDispatch, useSelector } from 'react-redux';
import { listEmployeeCategoryAction } from 'redux/actions/shifts.actions';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import toMomentOrNull from 'utils/DateFixer';
 
function NewHolidays(props) {
  const textRef = useRef(null);
  const { declaredHolidays } = props;
  const [formValues, setFormValues] = useState({
   name:null,
   holiday_date: null,
   category_id: [],
   restricted_holiday: 0
  });
  const [formErrors, setFormErrors] = useState({
    name:null,
    holiday_date: null,
    category_id: null,
  });
  const [requiredFields] = useState([
    'name',
    'holiday_date',
    'category_id',
  ]);
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
 
  const normalizeHolidayPayload = (values) => ({
    ...values,
    holiday_date: values?.holiday_date
      ? moment.isMoment(values.holiday_date)
        ? values.holiday_date.format('YYYY-MM-DD')
        : moment(values.holiday_date).format('YYYY-MM-DD')
      : null,
  });
 
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
 
 const handleCategoryChange = (event, newValue) => {
  const isSelectAll = newValue.some((option) => option.id === 'selectAll');
  const allIds = employeeCategoryList.map((cat) => cat.id);
  const allSelected = formValues.category_id.length === employeeCategoryList.length;
 
  if (isSelectAll) {
    const updatedValues = allSelected ? [] : allIds;
    setFormValues({ ...formValues, category_id: updatedValues });
    validationHandler('category_id', updatedValues);
  } else {
    const selectedValues = newValue.map((option) => option.id);
    setFormValues({ ...formValues, category_id: selectedValues });
    validationHandler('category_id', selectedValues);
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
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '' ||  (Array.isArray(formValues[key]) && formValues[key].length === 0)))
       {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
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
      const payload = normalizeHolidayPayload(formValues);
      const normalizedInitialState = normalizeHolidayPayload(initialState);
     
      props.handleSubmit(getTrimmedData(payload), normalizedInitialState);
    }
    else{
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
  };
 
  const edits = () => {
    if (props.edit_id_data && props.status === 'edit') {
      const normalizedEditData = {
        ...props.edit_id_data,
        holiday_date: toMomentOrNull(props.edit_id_data.holiday_date),
      };
      setFormValues(normalizedEditData);
      setInitialState(normalizedEditData);
    }
  };
  tempedits.current = edits;
  useEffect(() => {
    tempedits.current();
  }, [props.edit_id_data]);
 
//  const onChangeDate = (e) =>{
//   setStateHandler('holiday_date', moment(e._d).format('YYYY-MM-DD'))
//  }
  // const handleSelect = (e, value, targetName) => {
  //   setStateHandler(targetName, value);
  // };
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
  return (
    <>
      {Prompt}
      <Typography variant='h6' align='left' style={{paddingBottom: '20px'}}>
       {props.statue === 'edit' ? 'Edit Holidays' : ' Holidays'}
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
      >
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
            placeholder='Holiday name'
            label='Holiday Name'
            name='name'
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='filled'
            value={
              formValues.name === null ? '' : formValues.name
            }
            error={formErrors.name === null ? false : true}
            helperText={
              formErrors.name === null ? '' : formErrors.name
            }
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
              // // inputFormat='DD/MM/yyyy'
              name='holiday_date'
              // disablePast
              value={toMomentOrNull(formValues.holiday_date)}
              format='DD/MM/YYYY'
              fullWidth
              style={{ marginBottom: '16px' }}
              //onChange={handleChange}
              //onBlur={(e) => setStateHandler('holiday_date', "")}
              onChange={(newValue) =>
                setStateHandler('holiday_date', newValue)
              }
              label='Holiday Date'
              // disabled={checkPast(formValues.holiday_date)}
              shouldDisableDate={shouldDisableDate}
              slotProps={{
                textField: {
                  onKeyDown: onKeyDown,
                  variant: 'filled',
                  fullWidth: true,
                  required: true,
                  error: formErrors.holiday_date === null ? false : true,
                  helperText:
                    formErrors.holiday_date === null ? '' : 'Date is required',
                },
              }}
            />
          </LocalizationProvider>
        </Grid>
 
<Grid
  size={{
    lg: 5,
    md: 6,
    sm: 12,
    xs: 12,
  }}
>
  <Autocomplete
    multiple
    disableCloseOnSelect
    options={[
      { id: "selectAll", category_name: "Select All" },
      ...(employeeCategoryList || []),
    ]}
    value={(formValues.category_id || [])
      .map((id) =>
        (employeeCategoryList || []).find((cat) => cat.id === id)
      )
      .filter(Boolean)}
    onChange={(event, newValue) => {
      const isSelectAll = newValue.some((opt) => opt.id === "selectAll");

      const allIds = (employeeCategoryList || []).map((c) => c.id);
      const allSelected =
        (formValues.category_id || []).length === allIds.length;

      let updatedValues;

      if (isSelectAll) {
        updatedValues = allSelected ? [] : allIds;
      } else {
        updatedValues = newValue.map((opt) => opt.id);
      }

      setFormValues({ ...formValues, category_id: updatedValues });
      validationHandler("category_id", updatedValues);
    }}
    getOptionLabel={(option) => option?.category_name || ""}
    isOptionEqualToValue={(option, value) => option.id === value.id}
    renderOption={(props, option, { selected }) => (
      <li {...props}>
        <Checkbox
          checked={
            option.id === "selectAll"
              ? (formValues.category_id || []).length ===
                (employeeCategoryList || []).length
              : selected
          }
        />
        {option.category_name}
      </li>
    )}
    renderTags={(value, getTagProps) =>
      value.map((option, index) => (
        <Chip
          {...getTagProps({ index })}
          key={option.id}
          label={option.category_name}
        />
      ))
    }
    renderInput={(params) => (
      <TextField
        {...params}
        label="Employee Category"
        variant="filled"
        required
        error={Boolean(formErrors.category_id)}
        helperText={
          formErrors.category_id ? "Employee Category is required" : ""
        }
      />
    )}
    sx={{
      "& .MuiFilledInput-root": {
        paddingTop: "20px !important",
        display: "flex",
        alignItems: "center !important",
      },
      "& .MuiAutocomplete-input": {
        padding: "4px !important",
      },
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
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formValues.restricted_holiday === 1}
                  onChange={(e) =>
                    setStateHandler('restricted_holiday', e.target.checked ? 1 : 0)
                  }
                  name="restricted_holiday"
                  color="primary"
                  sx={{
                    '& .MuiSvgIcon-root': {
                      borderRadius: '90%',
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2">Restrict Holiday</Typography>
              }
            />
          </FormGroup>
        </Grid>
 
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid
            spacing={7}
            // lg={12}
            // md={12}
            // sm={12}
            // xs={12}
            //
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
 
export default NewHolidays;