import React, {useState, useEffect, useRef, useContext} from 'react';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
// import {formLabelsTheme} from "./Asterisk";
import {Button, TextField, Grid, Typography, FormGroup, FormControlLabel, Switch, Autocomplete, Card} from '@mui/material';
import {getTrimmedData} from './trimFunction/index';
import AppHeader from '@crema/core/AppLayout/DefaultLayout/AppHeader';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import context from '../context/CreateNewButtonContext'
import apiCalls from 'utils/apiCalls';
import { getCreditDebitHintAction } from 'redux/actions/cash_box_actions';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import toMomentOrNull from 'utils/DateFixer';

function NewCashBox(props) {
  const dispatch = useDispatch()
  const { stockLocationReducer: { stocklocation }, cashBoxReducer: {searchCashBoxData, cashboxCreditDebitHint} } = useSelector(s => s)
  const { commoncookie, headerLocationId, setLoaderStatusHandler, setModalTypeHandler } = useContext(context)
  console.log(searchCashBoxData,'searchCashBoxData')
  const [formValues, setFormValues] = useState({
    name: null,
    status: 'A',
    denomination_id: 1,
    negativeDenomination: '',
    allowdenomination: '',
    location_id:null,
    credit: null,
    debit: null,
    trans_date: null
  });
  console.log(formValues,'formvalues')
  const [change, setChange] = useState(false)
  const [formErrors, setFormErrors] = useState({name: null,location_id:null});
  const [requiredFields] = useState(['name','location_id']);
  const [regex] = useState({});
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [check, setCheck] = useState(false);
  const [checked, setChecked] = useState(false);
  const [form, setForm] = useState(false);
  const [activeBalanceHint, setActiveBalanceHint] = useState('');
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempedits = useRef(null);

  const initsform = () => {
    setInitialState(formValues);
    if (!stocklocation.length) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(listStockLocationAction(commoncookie, headerLocationId))
      )
    }
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, []);

  useEffect(() => {
    const payload = {
      type: 'Cash',
      ledger_id: formValues.ledger_id || null,
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getCreditDebitHintAction(payload)),
    );
  }, [formValues.ledger_id]);

  useEffect(() => {
    if (searchCashBoxData?.length > 0 && props.pageType === "detailpage") {
      setFormValues({
        ...formValues,
        name: searchCashBoxData[0]?.name,
        status: 'A',
        denomination_id: 1,
        negativeDenomination: searchCashBoxData[0]?.negativeDenomination,
        allowdenomination: searchCashBoxData[0]?.allowdenomination,
        location_id: searchCashBoxData[0]?.location_id,
        credit: searchCashBoxData[0]?.credit,
        debit: searchCashBoxData[0]?.debit,
        trans_date: searchCashBoxData[0]?.transactionDate || null,
      })
  }
},[searchCashBoxData])

  const cashAccountRule = cashboxCreditDebitHint?.increaseOn && cashboxCreditDebitHint?.decreaseOn
    ? cashboxCreditDebitHint
    : null;

  const creditHintText = cashAccountRule
    ? `Hint: Credit will ${cashAccountRule.increaseOn === 'credit' ? 'increase' : 'decrease'} Cash Box balance.`
    : 'Hint: Credit effect depends on account type sign rules.';

  const debitHintText = cashAccountRule
    ? `Hint: Debit will ${cashAccountRule.increaseOn === 'debit' ? 'increase' : 'decrease'} Cash Box balance.`
    : 'Hint: Debit effect depends on account type sign rules.';

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

  const handleChecked = async (e) => {
    const {checked} = e.target
    await setCheck(checked)
    await setFormValues({...formValues, negativeDenomination: check === false ? 0 : 1})
  }

  const handleChecked1 = async (e) => {
    const {checked} = e.target
    await setChecked(checked)
    await setFormValues({...formValues, allowdenomination: checked === false ? 0 : 1})
  }

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
    setChange(false)
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
    let formErrorsObj = {...formErrors};
    await Object.keys(formValues).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + 'is Required!';
      } else if (regex[key]) {
        if (!regex[key].test(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + 'is Invalid!';
        }
      }
      return null;
    });
    await setFormErrors(formErrorsObj);
    // if(formValues.negativeDenomination === ''){
      formValues.negativeDenomination = check === true ? 1 : 0
      formValues.allowdenomination = checked === true ? 1 : 0
    // }
    // alert("Is Form Valid - " + isValid);
    // API call..
    if (isValid) { 
    const { transactionDate, ...submitData } = formValues;
    props?.handleSubmit(getTrimmedData(submitData));
    if(props.pageType === 'detailpage') {
      props.handleNext()
    }
  }
  else{
    dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
  }
  };

  const edits = async () => {
    if (Array.isArray(props?.edit_id_data) && props?.edit_id_data.length > 0 && props?.status === 'edit') {
      const editData = {
        ...props?.edit_id_data[0],
        trans_date: props?.edit_id_data[0]?.trans_date || props?.edit_id_data[0]?.transactionDate || null,
      };
      setChange(true);
      await setCheck(editData?.negativeDenomination === 1);
      await setChecked(editData?.allowdenomination === 1);
      await setFormValues(editData);
      await setInitialState(editData);
    }
  };
  
  tempedits.current = edits;
  useEffect(() => {
    tempedits?.current();
  }, [props?.edit_id_data]);

  return (
    <>
      {/* <AppHeader hidden={false} /> */}
      <Card sx={{ p: '20px', width: '100%',  height: 'calc(100vh - 80px) !important', minHeight: '100%',pb:'0px', overflow: 'auto' }}>
    <Grid
      spacing={3}
      // lg={12}
      // md={12}
      // sm={12}
      // xs={12}
      container
      direction='row'
      p='7px'
      //
    >
      {Prompt}
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <Typography variant='h6' align='left' >
          {props?.status === 'edit'? 'Update Cash Box' : 'Create Cash Box'}
        </Typography>
      </Grid>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
      <Grid container spacing={2}>
      <Grid
        size={{
          lg: 4,
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
          placeholder='Enter CashBox name'
          label='Enter CashBox name'
          name='name'
          color='primary'
          multiline={false}
          type='text'
          regex=''
          variant='filled'
          value={formValues.name === null ? '' : formValues.name}
          error={formErrors.name === null ? false : true}
          helperText={formErrors.name === null ? '' : 'CashBox name is Required!'}
        />
      </Grid>
      <Grid
        size={{
          lg: 4,
          md: 4,
          sm: 6,
          xs: 12
        }}>
        <Autocomplete
          limitTags={2}
          required={true}
          fullWidth={true}
          value={
            // !_.isEmpty(props.edit_id_data) && formValues.location_id
            //   ? 
            //   stocklocation?.filter(
            //       (s) =>
            //         s.location_id === props.edit_id_data[0]?.location_id
            //     )[0]
            //   : 
              formValues.location_id 
              ? stocklocation?.filter(
                  (f) => f.location_id === formValues.location_id,
                )[0]
              : {location_name : ''}
          }
          id='multiple-limit-tags'
          options={stocklocation?.filter(
            (s) => s.location_name !== 'scrap location',
          )}
          getOptionLabel={(option) => option.location_name}
          // onChange={(e, v) => v !== null && setFormValues({ ...formValues, stockLocation: v.location_id })}
          onChange={(e, v) =>
            handleChange({
              target: {name: 'location_id', value: v ? v.location_id : ''},
            })
          }
          // renderInput={(params) => (
          //     <TextField {...params} variant="outlined"  required={true} label="StockLocation" placeholder="Select Location" fullWidth={true}

          //     error={formErrors.stockLocation === null ? false : true}
          //     helperText={formErrors.stockLocation === null ? '' : formErrors.stockLocation}  />
          // )}
          renderInput={(params) => {
            const get = {...params};
            return (
              <TextField
                {...get}
                required={true}
                error={formErrors.location_id === null ? false : true}
                helperText={
                  formErrors.location_id === null
                    ? ''
                    : 'Location is Required!'
                }
                label='Select Location'
                variant='filled'
              />
            );
          }}
        />
      </Grid>
      <Grid
        size={{
          lg: 4,
          md: 4,
          sm: 6,
          xs: 12
        }}>
          <TextField
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                handleChange(e);
              }
            }}
            onBlur={(e) => { handleChange(e); setActiveBalanceHint(''); }}
            disabled={!!formValues.debit}
            fullWidth
            onWheel={(e) => e.target.blur()}
            placeholder="Amount"
            label="Credit - Opening Balance"
            onFocus={() => setActiveBalanceHint('credit')}
            name="credit"
            value={formValues.credit || ''}
            color="primary"
            multiline={false}
            type="text"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            variant="filled"
            error={!!formErrors.credit}
            helperText={formErrors.credit ? "Opening Balance is Required!" : activeBalanceHint === 'credit' ? creditHintText : ''}
          />
        </Grid>

        <Grid
          size={{
            lg: 4,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                handleChange(e);
              }
            }}
            onBlur={(e) => { handleChange(e); setActiveBalanceHint(''); }}
            disabled={!!formValues.credit}
            fullWidth
            onWheel={(e) => e.target.blur()}
            placeholder="Balance"
            label="Debit - Opening Balance"
            onFocus={() => setActiveBalanceHint('debit')}
            name="debit"
            value={formValues.debit || ''}
            color="primary"
            multiline={false}
            type="text"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            variant="filled"
            error={!!formErrors.debit}
            helperText={formErrors.debit ? "Opening Balance is Required!" : activeBalanceHint === 'debit' ? debitHintText : ''}
          />
        </Grid>
        <Grid
          size={{
            lg: 4,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <LocalizationProvider dateAdapter={DateAdapter}>
            <DatePicker
              disableFuture
              name='trans_date'
              label='Date'
              format='DD/MM/YYYY'
              disabled={(formValues.debit || formValues.credit) ? false : true}
              value={toMomentOrNull(formValues.trans_date)}
              views={['year', 'month', 'day']}
              onChange={(dates) => {
                handleChange({
                  target: { value: getDateTimeFormat(dates?.toDate()), name: 'trans_date' },
                })
              }}
              slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid
          size={{
            lg: 4,
            md: 4,
            sm: 6,
            xs: 12
          }}>
        <FormGroup>
          <FormControlLabel control={<Switch checked={checked} onChange={handleChecked1} name="allow_denomination" />} label="Allow Denomination" />
        </FormGroup>
      </Grid>
      <Grid
        size={{
          lg: 4,
          md: 4,
          sm: 6,
          xs: 12
        }}>
        <FormGroup>
          <FormControlLabel control={<Switch checked={check} onChange={handleChecked} name="negative_denomination" />} label="Allow Negative Denomination" />
        </FormGroup>
      </Grid>
      </Grid>
      </Grid>

      {/* <Grid size={{ xs: 2, sm: 2, md: 2, lg: 2 }}></Grid> */}

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
          {props.pageType === 'detailpage' ? <Grid>
              <Button
                onClick={() => props.handleBack()}
                style={{}}
                name='Cancel'
                variant='contained'
                color='secondary'
                size='medium'
                text='button'
                fullWidth={false}
                type='cancel'
              >
                Back
              </Button>
          </Grid> :
          <Grid>
            {form === false ? (
              <Button
                onClick={() => props.handleDialogClose()}
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
          </Grid> }

          <Grid>
            {props.pageType === 'detailpage' ? <Button
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
              Next
            </Button> :
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
              {props.status === 'edit'? 'UPDATE ' : 'SUBMIT'}
            </Button>}
          </Grid>
        </Grid>
      </Grid>
    <CancelDialog
      handle={cancel}
      delete={dialog}
      close={() => props.handleDialogClose()}
      ></CancelDialog>
      </Card>
    </>
  );
}

export default NewCashBox;


