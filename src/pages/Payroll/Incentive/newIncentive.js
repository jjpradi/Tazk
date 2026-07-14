import React, { useState, useEffect, useRef, useContext } from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import _ from 'lodash';
import UnSavedChangesWarning from '../../../pages/common/unChangeswarning';
import CancelDialog from '../../../../src/components/CancelDialog';
import {
  Button,
  TextField,
  Typography,
  Grid,
  Autocomplete,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Tooltip,
  IconButton,
  Card,
} from '@mui/material';
import moment from 'moment';
import apiCalls from 'utils/apiCalls';
import { useDispatch, useSelector } from 'react-redux';
import context from '../../../context/CreateNewButtonContext'
import { listProductAction } from 'redux/actions/product_actions';
import { listVendorIdAndNameAction } from 'redux/actions/vendor_actions';
import { listSalesManPaginateAction } from 'redux/actions/salesMan_action';
import { createIncentiveForSalesmanAction, getAllIncentivesAction, incentivePaginationAction, updateSalesmanIncentiveAction } from 'redux/actions/sales_actions';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import toMomentOrNull from 'utils/DateFixer';

function NewIncentive(props) {
  const [formValues, setFormValues] = useState({
    incentive_name: null,
    salesman_id: [],
    fromDate: moment(),
    toDate: moment(),
    description: null,
    target_status: 'volume',
    target_volume: null,
    target_value: null,
  });

  const [formErrors, setFormErrors] = useState({
    incentive_name: null,
    salesman_id: null,
    fromDate: null,
    toDate: null,
    target_status: null,
    target_volume: null,
    target_value: null,
  });

  const [requiredFields] = useState([
    'incentive_name',
    'salesman_id',
    'fromDate',
    'toDate',
    'target_status',
  ]);

  const [status, setStatus] = useState('')
  const [regex] = useState({});
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const [checkVal, setCheckVal] = useState()
  const [productData, setProductData] = useState([])
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempempty = useRef(null);
  const {
    setModalStatusHandler,
    setModalTypeHandler,
    selectData,
    setselectData,
    setLoaderStatusHandler,
    locationId,
    headerLocationId,
    commoncookie,
  } = useContext(context);

  const dispatch = useDispatch();

  const {
    productReducer: { product }, vendorReducer: { vendorIdAndName: vendor }, schemesReducer: { getSchemesStatus }, salesManReducer: { salesManByPagination, getAllSalesmanIncentive }
  } = useSelector((state) => state);

  const empty = () => {
    if (props.edit_id_data && props.edit_id_data.length > 0) {
      setFormValues({
        incentive_name: props.edit_id_data[0].incentive_name || null,
        salesman_id: props.edit_id_data[0].salesman_ids
          ? props.edit_id_data[0].salesman_ids.split(',').map(Number)
          : [],
        fromDate: props.edit_id_data[0].start_date ? moment(props.edit_id_data[0].start_date) : moment(),
        toDate: props.edit_id_data[0].end_date ? moment(props.edit_id_data[0].end_date) : moment(),
        description: props.edit_id_data[0].notes || null,
        target_status: props.edit_id_data[0].target_type ? props.edit_id_data[0].target_type.toLowerCase() : 'volume',
        target_volume: props.edit_id_data[0].target_volume ?? '',
        target_value: props.edit_id_data[0].target_value ?? '',
      });
      setInitialState(props.edit_id_data[0]);
      setStatus('edit');
    }
  };

  useEffect(() => {
    empty();
  }, [props.edit_id_data]);


  useEffect(() => {
    const paginationData = {
      pageCount: 0,
      numPerPage: 50,
      page: "SalesManList"
    }
    if (!product.length) {
      dispatch(listProductAction(setModalTypeHandler, setLoaderStatusHandler));
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listVendorIdAndNameAction()),
      dispatch(listSalesManPaginateAction(paginationData))
    )
  }, [])

  useEffect(() => {
    if (selectData.NewVendor === true) {
      const filter = [...vendor];
      const popc = filter[0]?.supplier_id;
      setStateHandler('supplier_id', popc);
      setModalStatusHandler(false);
      setselectData('NewVendor', false);
    }
  }, [selectData.NewVendor])

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
    let { name, value } = e.target;

    let updatedValues = { ...formValues };

    if (name === "target_status") {
      updatedValues = {
        ...updatedValues,
        target_status: value,
        target_volume: value === "value" ? null : updatedValues.target_volume,
        target_value: value === "volume" ? null : updatedValues.target_value,
      };
    } else {
      updatedValues = {
        ...updatedValues,
        [name]: value === "" ? null : value,
      };
    }

    await setFormValues(updatedValues);
    validationHandler(name, value);
  };

  useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      target_volume: prev.target_status === "value" ? "" : prev.target_volume,
      target_value: prev.target_status === "volume" ? "" : prev.target_value,
    }));
  }, [formValues.target_status]);

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
    let isValid = true;
    let formErrorsObj = { ...formErrors };

    Object.keys(formValues).forEach((key) => {
      if (requiredFields.includes(key)) {
        if (key === 'salesman_id' && (!Array.isArray(formValues[key]) || formValues[key].length === 0)) {
          isValid = false;
          formErrorsObj[key] = 'At least one Salesman is required!';
        } else if (
          key === 'target_volume' && formValues.target_status === 'volume' &&
          (formValues[key] === null || formValues[key] === '')
        ) {
          isValid = false;
          formErrorsObj[key] = 'Target Volume is required!';
        } else if (
          key === 'target_value' && formValues.target_status === 'value' &&
          (formValues[key] === null || formValues[key] === '')
        ) {
          isValid = false;
          formErrorsObj[key] = 'Target Value is required!';
        } else if (
          formValues[key] === null || formValues[key] === ''
        ) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Required!';
        } else if (regex[key] && !regex[key].test(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Invalid!';
        }
      }
    });

    if (!formValues.target_value && !formValues.target_volume) {
      isValid = false;
      formErrorsObj.target_value = "Target value is required!";
      formErrorsObj.target_volume = "Target Volume is required!";
    }

    setFormErrors(formErrorsObj);

    if (isValid) {
      console.log("cedcfcc");


      const payload = {
        incentive_name: formValues.incentive_name || null,
        salesman_id: Array.isArray(formValues.salesman_id) ? formValues.salesman_id : [],
        fromDate: formValues.fromDate ? moment(formValues.fromDate).format("YYYY-MM-DD") : null,
        toDate: formValues.toDate ? moment(formValues.toDate).format("YYYY-MM-DD") : null,
        description: formValues.description || null,
        target_status: formValues.target_status || null,
        target_volume: formValues.target_volume || null,
        target_value: formValues.target_value || null,
      };

      try {
        let response;
        if (props.edit_id_data && props.edit_id_data.length > 0 && props.edit_id_data[0]?.id) {
          response = await dispatch(updateSalesmanIncentiveAction({ ...payload, incentive_id: props.edit_id_data[0].id }));
        } else {
          response = await dispatch(createIncentiveForSalesmanAction(payload));
        }

        if (response && response.status === 200) {
          props.handleClose();
        } else {
          console.error("API failed, not closing modal.");
        }
      } catch (error) {
        console.error("Error in API call:", error);
      }
    }
    else{
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
  }

  return (
    <div>
      <Card sx={{ p: '20px', width: '100%',  height: 'calc(100vh - 80px) !important', minHeight: '100%', overflow: 'auto' }}>
     {Prompt}

     <Typography variant='h6' align='left' style={{ paddingBottom: '20px' }}>
       {!_.isEmpty(props.edit_id_data)
         ? `Edit Incentive - ${props.edit_id_data[0].id}`
         : 'New Incentive'}
     </Typography>

     <Grid
       spacing={3}
       container
       direction='row'
     >
       <Grid
         size={{
           lg: 10,
           md: 10,
           sm: 10,
           xs: 10
         }}>
       <Grid container spacing={3}>
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
           placeholder='Enter Incentive Name'
           label='Incentive Name'
           name='incentive_name'
           value={
             formValues.incentive_name === null ? '' : formValues.incentive_name
           }
           color='primary'
           multiline={false}
           type='text'
           regex=''
           variant='filled'
           error={formErrors.incentive_name === null ? false : true}
           helperText={
             formErrors.incentive_name === null ? '' : 'Scheme Name is Required!'
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
         <Autocomplete
           id="salesman-autocomplete"
           name="salesman_id"
           multiple
           required={true}
           value={
             formValues.salesman_id?.length
               ? salesManByPagination.filter((d) => formValues.salesman_id.includes(d.employee_id))
               : []
           }
           onChange={(e, val) =>
             handleChange({
               target: { name: "salesman_id", value: val.map((item) => item.employee_id) },
             })
           }
           options={salesManByPagination.filter((d) => d.full_name && d.employee_id)}
           getOptionLabel={(option) => option.full_name}
             sx={{
       '& .MuiFilledInput-root': { 
          height: 'auto !important', 
           minHeight: '46px !important', 
           paddingTop: '20px !important', 
       }
      }}
           renderInput={(params) => (
             <TextField
               {...params}
               label="Salesman"
               placeholder="Select Salesman"
               error={formErrors.salesman_id}
               fullWidth={true}
               required={true}
               variant="filled"
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
         <LocalizationProvider dateAdapter={DateAdapter}>
           <DatePicker
             slotProps={{
               textField: {
                 fullWidth: true,
                 variant: 'filled',
               },
             }}
             label='From'
             value={toMomentOrNull(formValues.fromDate)}
             format='DD/MM/YYYY'
             onChange={(e) => {
               setStateHandler('fromDate', moment(e._d).format("YYYY-MM-DDTHH:mm:ss"));
             }}
             views={['year', 'month', 'day']}
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
         <LocalizationProvider dateAdapter={DateAdapter}>
           <DatePicker
             slotProps={{
               textField: {
                 fullWidth: true,
                 variant: 'filled',
               },
             }}
             value={toMomentOrNull(formValues.toDate)}
             format='DD/MM/YYYY'
             onChange={(e) => {
               setStateHandler('toDate', moment(e._d).format("YYYY-MM-DDTHH:mm:ss"));
             }}
             views={['year', 'month', 'day']}
             label='To'
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
         <FormControl component='fieldset' style={{ paddingTop: '15px' }}>
           <RadioGroup
             row
             aria-label='customer'
             value={formValues.target_status}
             name='target_status'
             onChange={handleChange}
           >
             <FormControlLabel value='volume' control={<Radio />} label='Volume' />
             <FormControlLabel
               value='value'
               control={<Radio />}
               label='Value'
             />
           </RadioGroup>
         </FormControl>
       </Grid>

       <Grid
         align='Left'
         size={{
           lg: 3,
           md: 4,
           sm: 6,
           xs: 12
         }}>
         <TextField
           onChange={handleChange}
           onBlur={handleChange}
           multiline={false}
           style={{}}
           fullWidth={true}
           required
           placeholder={formValues.target_status === 'value' ? "Target Value" : "Target Volume"}
           label={formValues.target_status === 'value' ? "Target Value" : "Target Volume"}
           name={formValues.target_status === 'value' ? 'target_value' : 'target_volume'}
           value={formValues.target_status === 'value' ? formValues.target_value : formValues.target_volume}
           color='primary'
           type="number"
           variant='filled'
           disabled={formValues.target_status ? false : true}
           inputProps={{ inputMode: "numeric", pattern: "[0-9]*", min: 0 }}
           error={!!(formValues.target_status === 'value' ? formErrors.target_value : formErrors.target_volume)}
           helperText={
             formValues.target_status === 'value'
               ? formErrors.target_value || ""
               : formErrors.target_volume || ""
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
           multiline={true}
           fullWidth={true}
           placeholder=' Enter Description'
           label='Enter Description'
           name='description'
           value={
             formValues.description === null ? '' : formValues.description
           }
           color='primary'
           type='text'
           regex=''
           variant='filled'
         />
       </Grid>
       </Grid>
       </Grid>
       <Grid
         size={{
           lg: 2,
           md: 2,
           sm: 2,
           xs: 2
         }}></Grid>

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
           justifyContent='flex-end'
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
                 Cancel
               </Button>
             )}
           </Grid>

           <Grid>
             <Button
               onClick={handleSubmit}
               variant="contained"
               color="primary"
               size="medium"
               fullWidth={false}
               type="button"
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
     </Card>
    </div>
  );
}
export default NewIncentive;
