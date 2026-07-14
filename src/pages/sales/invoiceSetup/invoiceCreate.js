import { Autocomplete, Button, capitalize, Card, createFilterOptions, FormControlLabel, FormGroup, Grid, IconButton, Paper, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import CommonFilter from 'components/pos/payment_section/CommonFilter'
import AddIcon from '@mui/icons-material/Add';
import React, { useContext, useEffect, useRef, useState } from 'react'
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { useDispatch, useSelector } from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { getVouchertypeAction, insertInvoicetypeAction, getallInvoicetypeAction } from 'redux/actions/pos_creations_actions';
import { getDateFormat } from 'utils/getTimeFormat';
import { async } from '@firebase/util';
import CancelDialog from 'components/CancelDialog';
import apiCalls from 'utils/apiCalls';
import toMomentOrNull from 'utils/DateFixer';


export default function invoiceCreate(props) {
  const [open, setOpen] = React.useState(false);
  const [close, setClose] = React.useState(false);
  const [pad, setPad] = useState(0);
  // const [prefi,setPrefi] = useState({'Yes' 'No'})
  const [regex] = useState({});
  const handleOpen = () => setClose(true);
  const handleClose = () => setClose(false);
  const [check, setCheck] = useState(false);
  const [dialog, setDialog] = useState(false);
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempedits = useRef(null);
  const [initialState, setInitialState] = useState({});
  const dispatch = useDispatch();
  const [value, setValue] = React.useState([]);
  const filter = createFilterOptions();
  const [form, setForm] = useState(false);


  const [formValues, setFormValues] = useState({
    digits: null,
    Voucher_type: null,
    date: null,
    starting_number: null,
    Period: null,
    prefix_format: null,
    suffix_format :null,
    pad_number: null,
    prefill: '',
  });


  const [formErrors, setFormErrors] = useState({
    digits: null,
    prefill: '',
    Voucher_type: null,
    date: null,
    starting_number: null,
    Period: null,
    prefix_format: null,
    suffix_format :null,
    pad_number: null
  });

  const [requiredFields] = useState([
    'digits',
    'Voucher_type',
    'starting_number',
    'date',
    'prefix_format',
    'Period'
  ]);
  useEffect(() => {

    if (formValues.digits !== null && formValues.starting_number !== null ) {

      const num = formValues.starting_number
      const places = formValues.digits

      const zeroPad = (num, places) => String(num).padStart(places, formValues.prefill)
      // setPad(zeroPad(num, places));
      setFormValues({...formValues, pad_number:zeroPad(num, places)})
    }


  }, [formValues.digits, formValues.starting_number, formValues.prefill])
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);


  const cancel = () => {
    setDialog(false);
  };

  const validClose = () => {
    setDialog(true);
  };

  const initsform = () => {
    setInitialState(formValues);
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, []);

  const handleChecked = async (e) => {
    const {checked,value} = e.target
    // await setCheck(checked,value)
    await setFormValues({...formValues, prefill: checked === true ? 0 : ''})
  }

  const {
    posCreationReducer: { get_voucher, post_voucher, getall_invoices }
  } = useSelector((state) => state);


  const handleChange = async (e) => {
    let { name, value } = e.target;

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

  const handleSubmit = async (event) => {

    event.preventDefault();

    let isValid = true;
    let formErrorsObj = { ...formErrors };
    await Object.keys(formValues).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
      ) {
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

    if (isValid) props.handleSubmit(formValues);
  }


  // const edits = () => {
  //   if (props.edit_id_data[0]) {
  //     setFormValues(props.edit_id_data[0]);
  //     setInitialState(props.edit_id_data[0]);
  //   }
  // };
  // tempedits.current = edits;
  // useEffect(() => {
  //   tempedits.current();
  // }, [props.edit_id_data]);


  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getVouchertypeAction(setModalTypeHandler, setLoaderStatusHandler))
    );
  }, []);


  return (
    <>
      <div>
        No of Digits :

        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            style={{}}
            fullWidth={true}
            onWheel={ (e) => e.target.blur()}
            placeholder='enter no of numbers'
            label='digits'
            name='digits'
            value={formValues.digits === null ? '' : formValues.digits}
            color='primary'
            type='number'
            variant='standard'
            required={true}
            error={formErrors.digits === null ? false : true}
            helperText={formErrors.digits === null ? '' : formErrors.digits}
          />
        </Grid>
      </div>
      <br />
      {/* <div>
        prefill with zero :

        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
         
        >
          <Autocomplete
            fullWidth={true}
            disablePortal
            id='combo-box-demo'
            options={['Yes', 'No']}
            onChange={handleChange}
            value={formValues.prefill === null ? '' : formValues.prefill}
            renderInput={(params) => (
              <TextField
                {...params}
                variant='outlined'
                label='Select'
                required={true}
              />
            )}
          />
        </Grid>
      </div> */}
      <Grid
        size={{
          lg: 6,
          md: 4,
          sm: 6,
          xs: 12
        }}>
      <FormGroup>
                  <FormControlLabel control={<Switch checked={formValues.prefill === 0} onChange={handleChecked}    name="  prefill with zero" />} label=":  prefill with zero ?" />
                </FormGroup>
              </Grid>
      <br />
      <br />
      {/* <Grid container direction='row'>
        <Grid size={{ xs: 12, md: 12, lg: 12 }}
          item
          style={{ border: ' 1px solid black' }}
        >
          <Grid size={{ xs: 12, lg: 12 }} style={{ border: ' 1px solid black' }}>
            <Grid container direction='row'>
              <Grid size={{ xs: 6, md: 6, lg: 6 }}
                item
                style={{ borderRight: '1px solid black' }}
              >
                <p style={{ textAlign: 'center' }}>
                  Restart Numbering
                </p>

                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                 
                >
                  <Autocomplete
                    fullWidth={true}
                    disablePortal
                    id='combo-box-demo'
                    options={['yearly', 'monthly']}
                    onChange={handleChange}
                    value={formValues.Period === null ? '' : formValues.Period}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant='outlined'
                        label='Select'

                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid size={{ xs: 6, md: 6, lg: 6 }}>
                <p style={{ textAlign: 'center' }}>
                  Prefix Details
                </p>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12} style={{ borderBottom: '1px solid black' }}>
            <Grid container direction='row'>
              <Grid size={6}>
                <Grid container direction='row'>
                  <Grid size={{ xs: 6, md: 6, lg: 6 }}
                    item
                    style={{
                      borderRight: '1px solid black',
                      borderLeft: '1px solid black',
                    }}
                  >
                    <p style={{ paddingLeft: '30px' }}>Applicable From</p>
                  </Grid>
                  <Grid size={{ xs: 6, md: 6, lg: 6 }}
                    item
                    style={{ borderRight: '1px solid black' }}
                  >
                    <p style={{ textAlign: 'center' }}>
                      Starting Number
                    </p>
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}

                     
                    >
                      <TextField
                        onChange={handleChange}

                        style={{}}
                        fullWidth={true}
                        placeholder='enter starting number'
                        label='starting_number'
                        name='starting_number'
                        value={formValues.starting_number === null ? '' : formValues.starting_number}
                        color='primary'
                        type='number'
                        variant='standard'
                        required={true}
                      />
                    </Grid>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                    <LocalizationProvider dateAdapter={DateAdapter}>
                      <DatePicker
                        name='from'
                        label='Financial Date'
                        inputVariant='outlined'
                        // inputFormat='DD/MM/yyyy'

                        value={formValues.date}
                        onChange={(e, v) => {
                          setFormValues({ ...formValues, date: getDateFormat(e) });
                        }}
                        fullWidth={true}
                        renderInput={(params) => (
                          <TextField {...params} fullWidth={true}
                            required={true}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>

                </Grid>
              </Grid>


              <Grid size={6}>
                <Grid container direction='row'>
                  <Grid size={{ xs: 6, md: 6, lg: 6 }}
                    item
                    style={{ borderRight: '1px solid black' }}
                  >
                    <p style={{ paddingLeft: '30px' }}>Format</p>

                    <Autocomplete
                      value={
                        formValues.Voucher_type !== null
                          ? formValues.Voucher_type
                          : []
                      }
                      onChange={(event, newValue) => {
                        setFormValues({
                          ...formValues,
                          Voucher_type: newValue || null
                        });
                      }}
                      name='select feild'
                      id='free-solo-dialog-demo'
                      options={_.uniqBy(get_voucher, 'title')}
                      getOptionLabel={(option) => option.title || ''}

                      freeSolo
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label='Voucher type'
                          variant='outlined'
                          required={true}
                          error={formErrors.Voucher_type === null ? false : true}
                          helperText={formErrors.Voucher_type === null ? '' : formErrors.Voucher_type}

                        />
                      )}
                    />

                  </Grid>
                  <Grid>
                    <Autocomplete
                      value={formValues.prefix_format === null ? '' : formValues.prefix_format}
                      name='prefix_format'
                      onChange={(event, newValue) => {
                        if (typeof newValue === 'string') {
                          setFormValues({
                            ...formValues,
                            prefix_format: newValue,
                          });
                        } else if (newValue && newValue.inputValue) {
                          setFormValues({
                            ...formValues,
                            prefix_format: newValue.inputValue,
                          });
                          setValue([...value, newValue.inputValue]);
                        } else if (newValue === null) {
                          setFormValues({
                            ...formValues,
                            prefix_format: newValue,
                          });
                        } else {
                          setFormValues({
                            ...formValues,
                            prefix_format: newValue.prefix_format,
                          });


                        }
                      }}
                      filterOptions={(options, params) => {

                        const filtered = filter(options, params);
                        const { inputValue } = params;
                        const isExisting = options.some(
                          (option) => inputValue === option.prefix_format,
                        );
                        if (inputValue !== '' && !isExisting) {
                          filtered.push({
                            inputValue,
                            prefix_format: `Add "${inputValue}"`,
                          });
                        }
                        if (value.length) {
                          value.forEach((data) => {
                            filtered.push({
                              inputValue: data,
                              prefix_format: data,
                            });
                          });
                        }
                        return filtered;
                      }}
                      id='free-solo-dialog-demo'
                      options={_.uniqBy(getall_invoices, 'prefix_format')}
                      getOptionLabel={(option) => {
                        if (typeof option === 'string') {
                          return option;
                        }
                        if (option.inputValue) {
                          return option.prefix_format;
                        }
                        return option.prefix_format;
                      }}
                      freeSolo
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label='Enter the type'
                          variant='outlined'
                          error={formErrors.prefix_format === null ? false : true}
                          helperText={
                            formErrors.prefix_format === null ? '' : formErrors.prefix_format
                          }
                          required={true}
                          onBlur={handleChange}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid>
                <TextField
                  onChange={(event, newValue) => {
                    setFormValues({
                      ...formValues,
                      pad_number: newValue || null
                    });
                  }}

                  style={{}}
                  fullWidth={true}
                  label='prefix id'
                  name='pad_number'
                  value={pad}
                  color='primary'
                  type='number'
                  variant='standard'
                  required={true}
                />
              </Grid>
            </Grid>
          </Grid>

        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
         
          style={{ marginBottom: '10px' }}
        >
          <Grid spacing={7} container={true} direction='row' display='flex' justifyContent='flex-end' paddingTop='25px'>
            <Grid>
              <Button
                onClose={handleClose}
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

            <Grid>
              <Button
                onClick={handleSubmit}
                name='Submit'
                size='medium'
                text='button'
                color='primary'
                style={{}}
                variant='contained'
                fullWidth={false}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid> */}
      <Grid container >
      <Table border="1" cellpadding="0" cellspacing="0">
    <TableRow height="50">
        <td align="center" width="150" rowspan="2">Voucher Type</td>
        <td align="center" width="300" colspan="3">Restart Numbering</td>
        <td align="center" width="150">Prefix Details</td>
        <td align="center" width="300" colSpan="2">Suffix Details</td>
    </TableRow>
    <TableRow height="50">
        <td align="center" width="150">Financial Date</td>
        <td align="center" width="150">Starting Number</td>
        <td align="center" width="150">Particulars</td>
        <td align="center" width="150">Format</td>
        <td align="center" width="150">Application Form</td>
        <td align="center" width="150">Format</td>
    </TableRow>
    <TableRow height="50">
        <td align="center" width="150">
        <Autocomplete
            value={
              formValues.Voucher_type !== null
                ? formValues.Voucher_type
                : []
            }
            onChange={(event, newValue) => {
              setFormValues({
                ...formValues,
                Voucher_type: newValue || null
              });
            }}
            name='select feild'
            id='free-solo-dialog-demo'
            options={_.uniqBy(get_voucher, 'title')}
            getOptionLabel={(option) => option.title || ''}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                label='Voucher type'
                variant='outlined'
                required={true}
                error={formErrors.Voucher_type === null ? false : true}
                helperText={formErrors.Voucher_type === null ? '' : formErrors.Voucher_type}
              />
            )}
          />
        </td>
        <td align="center" width="150">
        <LocalizationProvider dateAdapter={DateAdapter}>
            <DatePicker
              name='from'
              label='Financial Date'
              inputVariant='outlined'
              format='DD/MM/YYYY'

              // inputFormat='DD/MM/yyyy'

              value={toMomentOrNull(formValues.date)}
              onChange={(e, v) => {
                setFormValues({ ...formValues, date: getDateFormat(e) });
              }}
              fullWidth={true}
              slotProps={{ textField: { fullWidth: true, required: true, error: formErrors.date === null ? false : true, helperText: formErrors.date === null ? '' : formErrors.date } }}
            />
          </LocalizationProvider>
        </td>
        <td align="center" width="150">
        <TextField
            onChange={handleChange}

            style={{}}
            fullWidth={true}
            onWheel={ (e) => e.target.blur()}
            placeholder='enter starting number'
            label='starting_number'
            name='starting_number'
            value={formValues.starting_number === null ? '' : formValues.starting_number}
            color='primary'
            type='number'
            variant='standard'
            required={true}
            error={formErrors.starting_number === null ? false : true}
            helperText={formErrors.starting_number === null ? '' : formErrors.starting_number}
          />
        </td>

        <td align='center' width="150" >
        <Autocomplete
                    fullWidth={true}
                    disablePortal
                    id='combo-box-demo'
                   options={['Yearly', 'Monthly']}
                   onChange={(event, newValue) => {
                    setFormValues({
                      ...formValues,
                      Period: newValue || null
                    });
                  }}
                    value={formValues.Period === null ? '' : formValues.Period}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant='outlined'
                        label='Select'
                        required={true}
                        error={formErrors.Period === null ? false : true}
                        helperText={formErrors.Period === null ? '' : formErrors.Period}
                      />
                    )}
                  />
        </td>


        <td align="center" width="150">
        <Autocomplete
            value={formValues.prefix_format === null ? '' : formValues.prefix_format}
            name='prefix_format'
            onChange={(event, newValue) => {
              if (typeof newValue === 'string') {
                setFormValues({
                  ...formValues,
                  prefix_format: newValue,
                });
              } else if (newValue && newValue.inputValue) {
                setFormValues({
                  ...formValues,
                  prefix_format: newValue.inputValue,
                });
                setValue([...value, newValue.inputValue]);
              } else if (newValue === null) {
                setFormValues({
                  ...formValues,
                  prefix_format: newValue,
                });
              } else {
                setFormValues({
                  ...formValues,
                  prefix_format: newValue.prefix_format,
                });


              }
            }}
            filterOptions={(options, params) => {

              const filtered = filter(options, params);
              const { inputValue } = params;
              const isExisting = options.some(
                (option) => inputValue === option.prefix_format,
              );
              if (inputValue !== '' && !isExisting) {
                filtered.push({
                  inputValue,
                  prefix_format: `Add "${inputValue}"`,
                });
              }
              if (value.length) {
                value.forEach((data) => {
                  filtered.push({
                    inputValue: data,
                    prefix_format: data,
                  });
                });
              }
              return filtered;
            }}
            id='free-solo-dialog-demo'
            options={_.uniqBy(getall_invoices, 'prefix_format')}
            getOptionLabel={(option) => {
              if (typeof option === 'string') {
                return option;
              }
              if (option.inputValue) {
                return option.prefix_format;
              }
              return option.prefix_format;
            }}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                label='Enter the type'
                variant='outlined'
                required={true}
                error={formErrors.prefix_format === null ? false : true}
                helperText={
                  formErrors.prefix_format === null ? '' : formErrors.prefix_format
                }
                onBlur={handleChange}
              />
            )}
          />
        </td>

        <td align="center" width="150">

        <Typography>Prefix id</Typography>
        <Typography>{formValues.pad_number === null? '':formValues.pad_number}</Typography>
</td>
    </TableRow>


</Table>

</Grid>
      {/* <Grid container direction={'row'}
        style={{ border: ' 1px solid black' }} >
        <Grid size={{ xs: 3, sm: 3, md: 3, lg: 3 }}
          style={{
            borderRight: '1px solid black',
            borderLeft: '1px solid black',
            textAlign: 'center'
          }}
        >
          <p style={{ textAlign: 'center' }}>
            Voucher Type
          </p>

          <Grid
          >
            <Grid size={{ xs: 3, sm: 3, md: 3, lg: 3 }}
              style={{display:'initial'}}
            >
              Type
            </Grid>
          </Grid>

          <hr />


          <Autocomplete
            value={
              formValues.Voucher_type !== null
                ? formValues.Voucher_type
                : []
            }
            onChange={(event, newValue) => {
              setFormValues({
                ...formValues,
                Voucher_type: newValue || null
              });
            }}
            name='select feild'
            id='free-solo-dialog-demo'
            options={_.uniqBy(get_voucher, 'title')}
            getOptionLabel={(option) => option.title || ''}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                label='Voucher type'
                variant='outlined'
                required={true}
                error={formErrors.Voucher_type === null ? false : true}
                helperText={formErrors.Voucher_type === null ? '' : formErrors.Voucher_type}
              />
            )}
          />

        </Grid>

        <Grid size={{ xs: 3, sm: 3, md: 3, lg: 3 }}
          style={{
            borderRight: '1px solid black',
            borderLeft: '1px solid black',
          }} >

          <p style={{ textAlign: 'center' }}>
            Restart Numbering
          </p>
          <Grid display='flex'
            justifyContent='space-between'
          >
            <Grid size={{ xs: 3, sm: 3, md: 3, lg: 3 }}>
              Financial Date
            </Grid>



            <Grid size={{ xs: 3, sm: 3, md: 3, lg: 3 }}>
              Starting Number
            </Grid>
          </Grid>

          <hr />
          <LocalizationProvider dateAdapter={DateAdapter}>
            <DatePicker
              name='from'
              label='Financial Date'
              inputVariant='outlined'
              // inputFormat='DD/MM/yyyy'

              value={formValues.date}
              onChange={(e, v) => {
                setFormValues({ ...formValues, date: getDateFormat(e) });
              }}
              fullWidth={true}
              renderInput={(params) => (
                <TextField {...params} fullWidth={true}
                  required={true}
                  error={formErrors.date === null ? false : true}
                  helperText={formErrors.date === null ? '' : formErrors.date}
                />
              )}
            />
          </LocalizationProvider>


          <TextField
            onChange={handleChange}

            style={{}}
            fullWidth={true}
            placeholder='enter starting number'
            label='starting_number'
            name='starting_number'
            value={formValues.starting_number === null ? '' : formValues.starting_number}
            color='primary'
            type='number'
            variant='standard'
            required={true}
            error={formErrors.starting_number === null ? false : true}
            helperText={formErrors.starting_number === null ? '' : formErrors.starting_number}
          />

<Autocomplete
                    fullWidth={true}
                    disablePortal
                    id='combo-box-demo'
                   options={['Yearly', 'Monthly']}
                   onChange={(event, newValue) => {
                    setFormValues({
                      ...formValues,
                      Period: newValue || null
                    });
                  }}
                    value={formValues.Period === null ? '' : formValues.Period}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant='outlined'
                        label='Select'
                        required={true}
                        error={formErrors.Period === null ? false : true}
                        helperText={formErrors.Period === null ? '' : formErrors.Period}
                      />
                    )}
                  />

        </Grid>
        <Grid size={{ xs: 3, sm: 3, md: 3, lg: 3 }}
          style={{
            borderRight: '1px solid black',
            borderLeft: '1px solid black',
            textAlign: 'center'
          }}>
          <p style={{ textAlign: 'center' }}>
          Prefix Details
          </p>
          <Grid 
          >
            <Grid size={{ xs: 3, sm: 3, md: 3, lg: 3 }} 
              style={{display:'initial'}}>
              Format
            </Grid>
          </Grid>
          <hr />

          <Autocomplete
            value={formValues.prefix_format === null ? '' : formValues.prefix_format}
            name='prefix_format'
            onChange={(event, newValue) => {
              if (typeof newValue === 'string') {
                setFormValues({
                  ...formValues,
                  prefix_format: newValue,
                });
              } else if (newValue && newValue.inputValue) {
                setFormValues({
                  ...formValues,
                  prefix_format: newValue.inputValue,
                });
                setValue([...value, newValue.inputValue]);
              } else if (newValue === null) {
                setFormValues({
                  ...formValues,
                  prefix_format: newValue,
                });
              } else {
                setFormValues({
                  ...formValues,
                  prefix_format: newValue.prefix_format,
                });


              }
            }}
            filterOptions={(options, params) => {

              const filtered = filter(options, params);
              const { inputValue } = params;
              const isExisting = options.some(
                (option) => inputValue === option.prefix_format,
              );
              if (inputValue !== '' && !isExisting) {
                filtered.push({
                  inputValue,
                  prefix_format: `Add "${inputValue}"`,
                });
              }
              if (value.length) {
                value.forEach((data) => {
                  filtered.push({
                    inputValue: data,
                    prefix_format: data,
                  });
                });
              }
              return filtered;
            }}
            id='free-solo-dialog-demo'
            options={_.uniqBy(getall_invoices, 'prefix_format')}
            getOptionLabel={(option) => {
              if (typeof option === 'string') {
                return option;
              }
              if (option.inputValue) {
                return option.prefix_format;
              }
              return option.prefix_format;
            }}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                label='Enter the type'
                variant='outlined'
                required={true}
                error={formErrors.prefix_format === null ? false : true}
                helperText={
                  formErrors.prefix_format === null ? '' : formErrors.prefix_format
                }
                onBlur={handleChange}
              />
            )}
          />
        </Grid>


        <Grid size={{ xs: 3, sm: 3, md: 3, lg: 3 }}
          style={{
            borderRight: '1px solid black',
            borderLeft: '1px solid black',
            textAlign: 'center'
          }} >
          <p style={{ textAlign: 'center' }}>
          Suffix Details
          </p>
          <Grid 
          >
            <Grid size={{ xs: 3, sm: 3, md: 3, lg: 3 }} 
              style={{display:'initial'}}>
            Format
            </Grid>
          </Grid>
          <hr />
          
     

  
        <Grid>
        <Typography>Prefix id</Typography>
        <Typography>{formValues.pad_number === null? '':formValues.pad_number}</Typography>
        </Grid>
        <br/>
   
        <Grid>
        <Autocomplete
            value={formValues.suffix_format === null ? '' : formValues.suffix_format}
            name='suffix_format'
            onChange={(event, newValue) => {
              if (typeof newValue === 'string') {
                setFormValues({
                  ...formValues,
                  suffix_format: newValue,
                });
              } else if (newValue && newValue.inputValue) {
                setFormValues({
                  ...formValues,
                  suffix_format: newValue.inputValue,
                });
                setValue([...value, newValue.inputValue]);
              } else if (newValue === null) {
                setFormValues({
                  ...formValues,
                  suffix_format: newValue,
                });
              } else {
                setFormValues({
                  ...formValues,
                  suffix_format: newValue.suffix_format,
                });


              }
            }}
            filterOptions={(options, params) => {

              const filtered = filter(options, params);
              const { inputValue } = params;
              const isExisting = options.some(
                (option) => inputValue === option.suffix_format,
              );
              if (inputValue !== '' && !isExisting) {
                filtered.push({
                  inputValue,
                  suffix_format: `Add "${inputValue}"`,
                });
              }
              if (value.length) {
                value.forEach((data) => {
                  filtered.push({
                    inputValue: data,
                    suffix_format: data,
                  });
                });
              }
              return filtered;
            }}
            id='free-solo-dialog-demo'
            options={_.uniqBy(getall_invoices, 'suffix_format')}
            getOptionLabel={(option) => {
              if (typeof option === 'string') {
                return option;
              }
              if (option.inputValue) {
                return option.suffix_format;
              }
              return option.suffix_format;
            }}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                label='Enter the type'
                variant='outlined'
                required={true}
                error={formErrors.suffix_format === null ? false : true}
                helperText={
                  formErrors.suffix_format === null ? '' : formErrors.suffix_format
                }
                onBlur={handleChange}
              />
            )}
          />
        </Grid>
        </Grid>
      </Grid> */}
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
      <CancelDialog
      handle={cancel}
      delete={dialog}
      close={props.handleClose}
    ></CancelDialog>
    </>
  );
}
