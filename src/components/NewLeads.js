import React, {useState, useEffect, useContext, useRef} from 'react';
import context from '../context/CreateNewButtonContext';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
// import {formLabelsTheme} from "./Asterisk";
import {Button, Autocomplete, TextField, Typography, Grid} from '@mui/material';
import {SetCustomer} from '../redux/actions/pos_product_list';
import {listCustomerAction, listPickCustomerAction} from '../redux/actions/customer_actions';
import Customer from '../pages/crm/leads/customer';
import {useDispatch, useSelector} from 'react-redux';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import {getTrimmedData} from './trimFunction/index';
import Context from '../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import AppHeader from '@crema/core/AppLayout/DefaultLayout/AppHeader';
import { listProductAction } from 'redux/actions/product_actions';
import { filterOptions } from 'utils/searchFunc';
import toMomentOrNull from 'utils/DateFixer';

function NewLeads(props, {posId}) {
  const {
    customerReducer: {pickCustomer},
    productListReducer: {tab_count, product_lists},
    productReducer:{product}
  } = useSelector((state) => state);
  const dispatch = useDispatch();
  const tempdis = useRef(null);
  const [formValues, setFormValues] = useState({note: null});
  const [formErrors, setFormErrors] = useState({
    item_id: null,
    note: null,
    other: null,
  });
  const [requiredFields] = useState(['item_id', 'note', 'other']);
  const [regex] = useState({});
  const [value, setValue] = React.useState({item_id: null, other: null});
  const [opentxt, setOpenTxt] = React.useState(false);
  const {selectData, setselectData} = useContext(context);
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const [pageCount, setPageCount] = useState(0)
  const [pageSize, setPageSize] = useState(100)
  const [form, setForm] = useState(false);
  const [dialog, setDialog] = useState(false);
  const tempinitform = useRef(null);
  const tempinits = useRef(null);
  const temptaxforms = useRef(null);
  const tempedits = useRef(null);
  const [open, setopen] = React.useState(false);
  const one = product_lists[tab_count].customer;
  const [formvisible, setformvisible] = useState(true);
  const [pickerror, setpickerror] = useState(false);
  const [date, setdate] = React.useState(moment());

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
    commoncookie,
  } = useContext(Context);

  const otherOption = {value: 'Other', label: 'Other', name: 'Other'};

  const initform = () => {
    setInitialState(formValues);
  };
  tempinitform.current = initform;
  useEffect(() => {
    tempinitform.current();
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

  useEffect(() => {
    const data = {
      pageCount: pageCount,
      numPerPage: pageSize,
      searchString: ''
    }
    // dispatch(listCustomerAction(setModalTypeHandler, setLoaderStatusHandler))
    apiCalls(
      setModalTypeHandler, 
      setLoaderStatusHandler,
      dispatch(listPickCustomerAction(data, true, setLoaderStatusHandler)),
    );
  }, [pageCount, pageSize]);

  const handlePageChange = async (page) => {
    setPageCount(page);
  }

  const handlePageSizeChange = async (size) => {
    setPageSize(size);
  };

  const handleChange = async (e) => {
    let {name, value} = e.target;
    if (name === 'other') {
      setValue({
        ...value,
        item_id: null,
        other: value,
      });
    }
    // setStateHandler({ [e.target.name]: e.target.value });
    setStateHandler(name, value);
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

  const cancel = () => {
    setDialog(false);
  };

  const validClose = () => {
    setDialog(true);
  };

  const validationHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;

    if (
      requiredFields.includes(name) &&
      (value === null ||
        value === 'null' ||
        value === '' ||
        value === false ||
        value === 'undefined' ||
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

  const handleDateChange = async (date) => {
    const dateVal = date;
    setdate(dateVal);
    let convertedDate = moment(dateVal, 'year', 'month', 'day').format(
      'yyyy-MM-DD',
    );
    // await props.listSalesDateAction(convertedDate);
    // setIsFilter(true)
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
        (formValues[key] === null ||
          formValues[key] === '' ||
          formValues[key] === 'undefined')
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      } else if (regex[key]) {
        if (!regex[key].test(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Invalid!';
        }
      }
      if(value.other === null){
        formErrorsObj.other = 'Other is Required!'
      }
      return null;
    });
    await setFormErrors(formErrorsObj);
    if (isValid === true) {
      setpickerror(false);
      setformvisible(true);
    }
    if (isValid === false) {
      setpickerror(true);
    }

    // API call..

    const {
      item_id,
      other,
      person_id = `${one.person_id}`,
      note = formValues.note,
      required_on = date,
    } = value;
    const data = {item_id, other, person_id, note, required_on};
    // const {description} = formValues
    // data.pos_people = {description}
    if (isValid) props.handleSubmit(getTrimmedData(data));
  };

  const edits = () => {
    if (props.edit_id_data[0] && props.status === 'edit') {
      setFormValues(props.edit_id_data[0]);
    }
  };
  tempedits.current = edits;

  useEffect(() => {
    tempedits.current();
  }, [props.edit_id_data]);

  const taxforms = () => {
    if (selectData.taxcategory) {
      const filter = [...props.taxcategory];
      const pops = filter.shift();
      setFormValues({...formValues, tax_category_id: pops.tax_category_id});
      setFormErrors({...formErrors, tax_category_id: false});
      setselectData('taxcategory', false);
    }
  };
  temptaxforms.current = taxforms;

  useEffect(() => {
    temptaxforms.current();
  }, [selectData.taxcategory]);

  // const addActionRef = useRef(null);

  const dublicatename = props.product.filter((d) => d.name);
  dublicatename.unshift(otherOption);
  //   const dublicatebrand = props.product.filter((d) => (d.brand))
  const customerClick = () => {
    setopen(true);
    // setformvisible(true)
  };
  const customerClickclose = () => {
    setopen(false);
    setformvisible(false);
  };

  const dis = () => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      // !customer.length && dispatch(listCustomerAction()),
      product.length === 0 && dispatch(listProductAction())
    );
    // if (!customer.length) {
    //   dispatch(listCustomerAction());
    // }
  };
  tempdis.current = dis;
  useEffect(() => {
    // if(!customer.length){
    tempdis.current();
    // }
  }, []);

  const setone = (data) => {
    dispatch(SetCustomer(data, posId));
    setformvisible(true);
  };


  return (
    <>
      {/* <AppHeader hidden={false} /> */}
      {Prompt}
      <Customer
        open={open}
        customer={pickCustomer}
        handleClose={customerClickclose}
        one={one}
        setone={setone}
        handlePageChange={handlePageChange}
        handlePageSizeChange={handlePageSizeChange}
        pageSize={pageSize}
        pageCount={pageCount}
      />
      <Typography variant='h6' align='left' style={{paddingBottom: '20px'}}>
        {props.edit_id_data.length > 0
          ? `Edit-${props.edit_id_data[0].item_id}-Leads`
          : 'New Leads'}
      </Typography>
      <Grid
        spacing={3}
        container={true}
        direction='row'
        paddingTop='10px'
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <Grid
          size={{
            lg: 4,
            md: 4,
            sm: 4,
            xs: 12
          }}>
          <Button
            variant='outlined'
            fullWidth
            sx={{height: '52px'}}
            onClick={(e) => {
              customerClick();
              setone({});
            }}
            color={pickerror === true ? 'secondary' : 'primary'}
          >
            <Typography variant='h9'>Pick Customer</Typography>
          </Button>
          {/* {formvisible === false && 
      <h2>Customer Name : {`${one.first_name}`}  </h2>
      } */}
        </Grid>
        {formvisible === false && (
          <>
            <Grid
              size={{
                lg: 4,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                id='outlined-read-only-input'
                fullWidth={true}
                label='Name'
                defaultValue={`${one.company_name || one.first_name}`}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid
              container={true}
              direction='row'
              size={{
                lg: 4,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                id='outlined-read-only-input'
                fullWidth={true}
                label='Phone Nuber'
                defaultValue={`${one.phone_number}`}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid
              spacing={0}
              container={true}
              direction='row'
              size={{
                lg: 4,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                id='outlined-read-only-input'
                fullWidth={true}
                label='Email'
                defaultValue={`${one.email || ''}`}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} 
    spacing={0}
    
    
   >
    <TextField
          fullWidth={true}
          id="leads-address-input"
          minRows={2}
          label="Address"
          defaultValue={`${one.address}`}
          InputProps={{
            readOnly: true,
          }}
        />
  </Grid> */}

            {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} 
    spacing={0}
    
    
   >
    <TextField
          fullWidth={true}
          id="leads-area-name-input"
          label="Name"
          defaultValue={`${one.area}`}
          InputProps={{
            readOnly: true,
          }}
        />
  </Grid> */}

            <Grid
              spacing={0}
              container={true}
              direction='row'
              size={{
                lg: 4,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                fullWidth={true}
                id='outlined-read-only-input'
                label='Area'
                defaultValue={`${one.area || ''}`}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
          </>
        )}
        <Grid
          spacing={0}
          container={true}
          direction='row'
          size={{
            lg: 4,
            md: 4,
            sm: 4,
            xs: 12
          }}>
          <Autocomplete
            defaultValue={value.item_id === null ? '' : value.item_id}
            options={Array.from(new Set(dublicatename.map((a) => a.name))).map(
              (name) => {
                return dublicatename.find((a) => a.name === name);
              },
            )}
            onChange={(event, newValue) => {
              if (newValue !== null && newValue.name !== 'Other') {
                setValue({
                  ...value,
                  item_id: newValue.item_id,
                });
                setOpenTxt(false);
              }
              if (newValue !== null && newValue.name === 'Other') {
                // setValue({
                //   ...value,other : newValue.value
                // })
                setOpenTxt(true);
              }
            }}
            // filterOptions={filterOptions}
            name='item_id'
            getOptionLabel={(option) => (option ? option.name : '')}
            filterOptions={filterOptions}
            fullWidth={true}
            // filterOption={() => true}
            renderInput={(params) => (
              <TextField
                {...params}
                label='Product'
                variant='filled'
                required={false}
              />
            )}
          />

          {/* {opentxt === true ? 
        <TextField onChange={handleChange}
          onBlur={handleChange}
          required={true}
          style={{}}
          fullWidth={true}
          placeholder='Enter Other'
          label='Other'
          name='other'
          value={value.other === null ? '' : value.other }
          color='primary'
          multiline={true}
          type='text'
          regex=''
          // disabled = {opentxt === true ? false : true}
          variant='standard'
          // error={formErrors.description === null ? false : true }
          // helperText={formErrors.description === null ? '' : formErrors.description }
        />: ""} */}
        </Grid>

        {opentxt === true ? (
          <Grid
            spacing={0}
            container={true}
            direction='row'
            size={{
              lg: 4,
              md: 4,
              sm: 4,
              xs: 12
            }}>
            <TextField
              onChange={handleChange}
              onBlur={handleChange}
              required={true}
              style={{}}
              fullWidth={true}
              placeholder='Enter Other'
              label='Other'
              name='other'
              value={value.other === null ? '' : value.other}
              color='primary'
              multiline={true}
              type='text'
              regex=''
              // disabled = {opentxt === true ? false : true}
              variant='filled'
              error={formErrors.other === null ? false : true}
              helperText={formErrors.other === null ? '' : formErrors.other}
            />
          </Grid>
        ) : (
          ''
        )}

        <Grid
          spacing={0}
          container={true}
          direction='row'
          size={{
            lg: 4,
            md: 4,
            sm: 4,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder='Enter Note'
            label='Note'
            name='note'
            value={formValues.note === null ? '' : formValues.note}
            color='primary'
            multiline={true}
            type='text'
            regex=''
            variant='filled'
            error={formErrors.note === null ? false : true}
            helperText={formErrors.note === null ? '' : formErrors.note}
          />
        </Grid>
        {formvisible === false && (
          <Grid
            spacing={0}
            container={true}
            direction='row'
            size={{
              lg: 4,
              md: 4,
              sm: 4,
              xs: 12
            }}>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                label='Required On'
                // format="yyyy/MM/DD"
                // inputFormat='DD/MM/yyyy'
                value={toMomentOrNull(date)}
                format='DD/MM/YYYY'
                inputVariant='contained'
                onChange={(e, v) => {
                  handleDateChange(e._d);
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
        )}
        <Grid
          spacing={7}
          container={true}
          direction='row'
          style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingTop: '20px'}}
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
      <CancelDialog
        handle={cancel}
        delete={dialog}
        close={props.handleClose}
      ></CancelDialog>
      {/* </form> */}
    </>
  );
}

export default NewLeads;
