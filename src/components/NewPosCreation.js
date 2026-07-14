import React, {useState, useEffect, useRef, useContext} from 'react';
// import MomentUtils from '@date-io/moment';
import _ from 'lodash';
import context from '../context/CreateNewButtonContext';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
// import { formLabelsTheme } from "./Asterisk";
import {
  Button,
  Autocomplete,
  TextField,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {getTrimmedData} from './trimFunction/index';
import AppHeader from '@crema/core/AppLayout/DefaultLayout/AppHeader';
import NewCashBox from './NewCashBox';
import Dialog from '@mui/material/Dialog'
import apiCalls from 'utils/apiCalls';
import { createCashBoxAction, listCashBoxAction } from 'redux/actions/cash_box_actions';
import { useDispatch, useSelector } from 'react-redux';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import { listPaymentMethodAction } from 'redux/actions/payment_method_actions';
import { listStockPosAction } from 'redux/actions/stock_Pos_actions';
import { posCreationPaginationAction } from 'redux/actions/pos_creations_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';

function NewPosCreation(props) {
  const dispatch = useDispatch();
  const { stockLocationReducer: { stocklocation }, paymentMethodReducer: { paymentMethod }, cashBoxReducer: {cash_box_list}, stockPosReducer: {stock_pos_list}, posCreationReducer : {pos_creation} } = useSelector(s => s)
  const { setModalTypeHandler,
    setLoaderStatusHandler, setModalStatusHandler,commoncookie, selectData, setselectData, headerLocationId} = useContext(context);
  const [formValues, setFormValues] = useState({
    employeeId: commoncookie,
    posCode: null,
    posName: null,
    taxInvoiceSequence: 1,
    taxInvoiceHeader: '',
    taxInvoiceFooter: '',
    stockLocation: null,
    cashBox: null,
    paymentId: [],
    closingDate: '',
    status: 'progress',
    reason: null,
    syncTime: 1000 * 60 * 30,
    preorder: 0,
    prefix: '',        
    format: 'NoValue', 
    startsFrom: '', 
});

  const [formErrors, setFormErrors] = useState({
    employeeId: null,
    posCode: null,
    posName: null,
    taxInvoiceSequence: null,
    taxInvoiceHeader: null,
    taxInvoiceFooter: null,
    stockLocation: null,
    cashBox: null,
    paymentId: null,
    closingDate: null,
    status: null,
    reason: null,
    prefix: null,       
    format: null,      
    startsFrom: null,   
  });

  const [open, setOpen] = useState(false);
  const [requiredFields] = useState([
    'posCode',
    'posName',
    'taxInvoiceSequence',
    'stockLocation',
    'cashBox',
    'paymentId',
    'startsFrom'
  ]);
  const [regex] = useState({});
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const [matchData, setMatchData] = useState({});
  const [oldCashBoxList, setOldCashBoxList] = useState([]);
  let storage = getsessionStorage()
  let company_type = storage?.company_type || ''

  // const [add_click, setAdd_click] = useState(false);
  // const addActionRef = useRef(null);
  // const cancelActionRef = useRef(null);
  const tempselectstock = useRef(null);
  const tempselectcash = useRef(null);
  const tempselectpayment = useRef(null);
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempempty = useRef(null);
  const [hidden, sethidden] = useState("false");
  const taxInvoicePattern = [
    {value: '1', pattern: '{S}/{cs+1}'},
    // {value: '2', pattern: '{S}/YYYY/{cs+1}'},
    {value: '3', pattern: 'posId-DDMMYYYY-{cs+1}'},
  ];

  // const [isApiFinished,setApiFinished]=useState(false)

  
  const handleCheck = (e) => {
    let {name, checked} = e.target;

    setStateHandler(name, checked);
  };

 
  const empty = () => {
    if (!_.isEmpty(props.edit_id_data)) {
      const updatedEditData = {
        ...props.edit_id_data,
        startsFrom: props.edit_id_data.startsFrom === null ? '/0' : props.edit_id_data.startsFrom
      };
      setFormValues((prev) => ({...prev, ...updatedEditData}));
      setInitialState((prev) => ({...prev, ...updatedEditData}));

    }
    // if (!stocklocation.length || !stock_pos_list.length || !cash_box_list.length || !paymentMethod.length || !pos_creation.length) {
      const body = {
        pageCount: 0,
        numPerPage: 20,
        searchString: '',
        employeeId: commoncookie,
        headerLocationId: headerLocationId
      }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(listStockLocationAction(commoncookie, headerLocationId)),
        // dispatch(listPaymentMethodAction()),
        dispatch(listStockPosAction()),
        dispatch(listCashBoxAction(headerLocationId)),
        dispatch(posCreationPaginationAction(body)),
        dispatch(listPaymentMethodAction())
      )
    // }
  };
  tempempty.current = empty;
  useEffect(() => {
    tempempty.current();
  }, []);

  const initsform = () => {
    setInitialState(formValues);
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, []);

  // useEffect(() => {
  //   if(oldCashBoxList.length !== props.cash_box_list.length){
  //     var nonMatchingItems = _.differenceBy(props.cash_box_list, oldCashBoxList, 'id')
  //     setFormValues({...formValues,cashBox: nonMatchingItems[0].name })
  //     // handleChange({target: {name: 'cashBox', value: nonMatchingItems[0].id}});
  //     // validationHandler('cashBox', nonMatchingItems[0].id);
  //   }

  // }, [props.cash_box_list])
  

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
    if (name === 'stockLocation') {
      setMatchData(value);
    }
    setStateHandler(name, value);
  };

  //stocklocation

  const selectstock = () => {
    if (selectData.stocklocation) {
      const filter = [...stocklocation];
      const popj = filter[0];
      setFormValues((prev) => ({...prev, stockLocation: popj.location_id}));
      setFormErrors({...formErrors, stockLocation: false});
      setselectData('stocklocation', false);
    }
  };
  tempselectstock.current = selectstock;
  useEffect(() => {
    tempselectstock.current();
  }, [selectData.stocklocation]);

  //cashbox

  const selectcash = () => {
    if (selectData.cash_box_list) {
      const filter = [...cash_box_list];
      const popj = filter[0];
        // setFormValues({...formValues, cashBox: popj.id});
      handleChange({target: {name: 'cashBox', value: popj?.id || null}});
      validationHandler('cashBox', popj?.id || null);
      setselectData('cash_box_list', true);
    }
  };
  tempselectcash.current = selectcash;
  useEffect(() => {
    tempselectcash.current();
  }, [selectData.cash_box_list]);


  // paymentMethod

  const selectpayment = () => {
    if (selectData.paymentMethod) {
      const filter = [...paymentMethod];
      const popj = filter.pop();
      // filter[0] filter.shift() filter[filter.length -1] filter.pop()
      setFormValues((prev) => ({...prev, paymentId: [{paymentId: popj.paymentId}]}));
      setFormErrors({...formErrors, paymentId: false});
      setselectData('paymentMethod', false);
    }
  };

  const responseDialog = async (res) => {
    if (res === true) {
      if (setModalStatusHandler) {
        setModalStatusHandler(false);
        setselectData('cash_box_list', true);
      }
    }
  };

  const handleClose = () => {
    setOpen(false)
  }

  const handle_Submit = (data) => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch (createCashBoxAction(
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
        responseDialog,
      ))
    );
    handleClose()
  }




  tempselectpayment.current = selectpayment;
  useEffect(() => {
    tempselectpayment.current();
  }, [selectData.paymentMethod]);

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
      [name]: value,
    };

    await setFormValues((prev) => ({ ...prev, [name]: value }));
    if (name !== 'paymentId') {
      validationHandler(name, value);
    } else if (name === 'paymentId' && value.length === 0) {
      validationHandler(name, null);
    } else if (name === 'paymentId' && value.length > 0) {
      validationHandler(name, value);
    }
  };

  const validationHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;
     if (name === 'prefix') {
    if (value && !/[/-]$/.test(value)) {
      setFormErrors({
        ...formErrors,
        [name]: 'Prefix must end with / or -',
      });
      return;
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
      return;
    }
  }

    if (name === 'startsFrom') {
    if (!/^[/\-]\d+$/.test(value)) {
    setFormErrors({
      ...formErrors,
      startsFrom: 'Must start with "/" or "-" followed by numbers',
    });
    return;
  } else {
    setFormErrors({
      ...formErrors,
      startsFrom: null,
    });
    return;
  }
}

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


const getFormattedSequencePreview = () => {
  const { prefix = '', format = '', startsFrom = '' } = formValues;
  if (!startsFrom) return '';

  const year = new Date().getFullYear().toString();
  const yy = year.slice(2);
  const nextYY = (Number(yy) + 1).toString().padStart(2, '0');
  const mm = String(new Date().getMonth() + 1).padStart(2, '0');

  let formatted = '';
  if (format && format !== 'NoValue') {
    switch (format) {
      case 'YYYY':
        formatted = year;
        break;
      case 'YY':
        formatted = yy;
        break;
      case 'MMYY':
        formatted = `${mm}${yy}`;
        break;
      case '(YY-YY)':
        formatted = `(${yy}-${nextYY})`;
        break;
    }
  }
  const parts = [];

  if (prefix) {
    const cleanPrefix = prefix.endsWith('/') ? prefix : prefix.endsWith('-') ? prefix: prefix + '/';
    parts.push(cleanPrefix);
  }

 if (formatted) {
  parts.push(
    formatted +
    (startsFrom.startsWith('/') ? '/' : '-')
  );
}


  const cleanStart = startsFrom.startsWith('/') ? startsFrom.slice(1) : startsFrom.startsWith('-') ? startsFrom.slice(1): startsFrom;
  parts.push(cleanStart);

  return parts.join('');
};






  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const handleSubmit = async (event) => {
    props.setMoreAnchorEl(null);
    props.setMoreClick(false);
    props.setCurrentTaregetKey(0);
    event.preventDefault();
    let isValid = true;
    let formErrorsObj = {...formErrors};
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
      } else if (key === 'paymentId' && formValues.paymentId.length === 0) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      }
      return null;
    });
    await setFormErrors(formErrorsObj);


    // API call..
    if (isValid) {
      props.handle_Submit(
        getTrimmedData({
          ...formValues,
          paymentId: [...new Set(formValues.paymentId)],
        }),
      );
    }
    else{
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
  };
  const updatePaymentId = () => {
    let arr = [];
    const Filtering = !_.isEmpty(props.edit_id_data)
      ? props.edit_id_data.paymentId.map((p) => {
    
          return arr.push(
            paymentMethod ?. filter((f) => f.paymentId === p.paymentId)[0],
          );
        })
      : [];
  
      return arr;
     
        
    
  };

  // const dat = props.matches.map((m) => {
  //     const loc = props.stockLocation.filter((l) => l.location_id === m.location_id){
  //         setCashbox(m.cashBox)
  //     }
  // })

  // props.cash_box_list,
  return (
    <div>
      {/* <AppHeader hidden={false} /> */}
      {Prompt}
      <Typography variant='h6' align='left' style={{paddingBottom: '20px'}}>
      {props.edit_id_data.posId ? 'Edit Pos Creation':  'New Pos Creation'}
      </Typography>
      <Grid
        spacing={4}
        justifyContent='left'
        alignContent='left'
        // lg={12}
        // md={12}
        // sm={12}
        // xs={12}
        container
        direction='row'>
        <Grid
          size={{
            lg: 4,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder='Pos Code'
            label='Pos Code'
            name='posCode'
            value={formValues.posCode === null ? '' : formValues.posCode}
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='filled'
            error={formErrors.posCode === null ? false : true}
            helperText={formErrors.posCode === null ? '' : 'Pos Code is Required!'}
          />
        </Grid>
        <Grid
          size={{
            lg: 4,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder='Pos Name'
            label='Pos Name'
            name='posName'
            value={formValues.posName === null ? '' : formValues.posName}
            color='primary'
            multiline={false}
            type='text'
            regex={null}
            variant='filled'
            error={formErrors.posName === null ? false : true}
            helperText={formErrors.posName === null ? '' : 'Pos Name is Required!'}
          />
        </Grid>
        <Grid
          size={{
            lg: 4,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          <Grid container spacing={2}>
            <Grid
              size={{
                lg: 4,
                md: 4,
                sm: 12,
                xs: 12
              }}>
              <Tooltip title="Enter Prefix & (/ or -)" arrow placement="top">
              <TextField
                fullWidth
                variant='filled'
                label='Prefix'
                // placeholder="Enter Prefix(/ or -)"
                name='prefix'
                value={formValues.prefix || ''}
                onChange={handleChange}
                error={!!formErrors.prefix}
                helperText={formErrors.prefix || ''}
                required
                 disabled={Object.keys(props.edit_id_data || {}).length > 0}
              />
              </Tooltip>
            </Grid>
            <Grid
              size={{
                lg: 4,
                md: 4,
                sm: 12,
                xs: 12
              }}>
              <TextField
                select
                fullWidth
                variant="filled"
                label="Format"
                name="format"
                 value={formValues.format === null ? 'NoValue' : formValues.format || ''}
                onChange={(e) => setFormValues((prev) => ({ ...prev, format: e.target.value }))}
                error={formErrors.format ? true : false}
                helperText={formErrors.format || ''}
                required
                 disabled={Object.keys(props.edit_id_data || {}).length > 0}
              >
                <MenuItem value="NoValue">None</MenuItem>
                <MenuItem value="YYYY">YYYY</MenuItem>
                <MenuItem value="YY">YY</MenuItem>
                <MenuItem value="MMYY">MMYY</MenuItem>
                <MenuItem value="(YY-YY)">(YY-YY) → FY</MenuItem>
              </TextField>
            </Grid>

            <Grid
              size={{
                lg: 4,
                md: 4,
                sm: 12,
                xs: 12
              }}>
              <Tooltip title="(/ or -) & Number Starts From" arrow placement="top">
                <TextField
                  fullWidth
                  variant="filled"
                  label="Start From"
                  // placeholder="(/ or -)Number Starts From"
                  name="startsFrom"

                  value={formValues.startsFrom === null ? '/0' : formValues.startsFrom || ''}
                  onChange={handleChange}
                  error={formErrors.startsFrom ? true : false}
                  helperText={formErrors.startsFrom || ''}
                  required
                   disabled={Object.keys(props.edit_id_data || {}).length > 0}
                />
              </Tooltip>
            </Grid>
            {formValues.format && formValues.startsFrom && (
              <Grid style={{ marginTop: 10 }} size={12}>
                <Typography variant="body2" color="textSecondary">
                  Sequence Pattern:&nbsp;
                  <strong>{getFormattedSequencePreview()}</strong>
                </Typography>
              </Grid>
            )}


          </Grid>


        </Grid>
        <Grid
          size={{
            lg: 4,
            md: 6,
            sm: 4,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            required={false}
            style={{}}
            minRows={2}
            fullWidth={true}
            placeholder='TaxInvoiceHeader'
            label='Tax Invoice Header'
            name='taxInvoiceHeader'
            value={
              formValues.taxInvoiceHeader === null
                ? ''
                : formValues.taxInvoiceHeader
            }
            color='primary'
            multiline={true}
            type='textarea'
            regex={null}
            variant='filled'
            error={formErrors.taxInvoiceHeader === null ? false : true}
            helperText={
              formErrors.taxInvoiceHeader === null
                ? ''
                : formErrors.taxInvoiceHeader
            }
          />
        </Grid>
        <Grid
          size={{
            lg: 4,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            required={false}
            style={{}}
            minRows={2}
            fullWidth={true}
            placeholder='Tax Invoice Footer'
            label='Tax Invoice Footer'
            name='taxInvoiceFooter'
            value={
              formValues.taxInvoiceFooter === null
                ? ''
                : formValues.taxInvoiceFooter
            }
            color='primary'
            multiline={true}
            type='textarea'
            regex={null}
            variant='filled'
            error={formErrors.taxInvoiceFooter === null ? false : true}
            helperText={
              formErrors.taxInvoiceFooter === null
                ? ''
                : formErrors.taxInvoiceFooter
            }
          />
        </Grid>
        <Grid
          size={{
            lg: 4,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          <Autocomplete
            limitTags={2}
            required={true}
            fullWidth={true}
            value={
              !_.isEmpty(props.edit_id_data)
                ? stocklocation.filter(
                    (s) =>
                      s.location_id === props.edit_id_data.stockLocation,
                  )[0]
                : formValues.stockLocation !== ''
                ? stocklocation.filter(
                    (f) => f.location_id === formValues.stockLocation,
                  )[0]
                : {}
            }
            id='multiple-limit-tags'
            options={stocklocation.filter(
              (s) => s.location_name !== 'scrap location',
            )}
            getOptionLabel={(option) => option?.location_name}
            // onChange={(e, v) => v !== null && setFormValues({ ...formValues, stockLocation: v.location_id })}
            onChange={(e, v) =>
              handleChange({
                target: {name: 'stockLocation', value: v ? v.location_id : ''},
              })
            }
            // renderInput={(params) => (
            //     <TextField {...params} variant="outlined"  required={true} label="StockLocation" placeholder="Select Location" fullWidth={true}

            //     error={formErrors.stockLocation === null ? false : true}
            //     helperText={formErrors.stockLocation === null ? '' : formErrors.stockLocation}  />
            // )}
            renderInput={(params) => {
              const get = {...params};
             
              get.InputProps = company_type !== 7 ? {
                ...params.InputProps,
                startAdornment: (
                  <Tooltip title='Create New'>
                    <IconButton
                      size='small'
                      onClick={() => {
                        setModalStatusHandler(true);
                        setModalTypeHandler('NewStockLocation');
                        // if (add_click) {
                        //   addActionRef.current.click()
                        //   setAdd_click(false)
                        // }
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ),
              
            }: { ...params.InputProps,
              // startAdornment: (
              //   <Tooltip title='Create New'>
              //     <IconButton
              //       size='small'
              //       onClick={() => {
              //         setModalStatusHandler(true);
              //         setModalTypeHandler('NewStockLocation');
              //         // if (add_click) {
              //         //   addActionRef.current.click()
              //         //   setAdd_click(false)
              //         // }
              //       }}
              //     >
              //       <AddIcon fontSize="small" />
              //     </IconButton>
              //   </Tooltip>
              // ),
            }
              return (
                <TextField
                  {...get} 
                  required={true}
                  error={formErrors.stockLocation === null ? false : true}
                  helperText={
                    formErrors.stockLocation === null
                      ? ''
                      : 'Stock Location is Required!'
                  }
                  label='Stock Location'
                  variant='filled'
                />
              );
            }}
          />
        </Grid>
        <Grid
          size={{
            lg: 4,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          <Autocomplete
            limitTags={2}
            required={true}
            fullWidth={true}
            value={
              !_.isEmpty(props.edit_id_data)
                ? cash_box_list.filter(
                    (s) => s.id === props.edit_id_data.cashBox,
                  )[0]
                : formValues.cashBox !== null
                ? cash_box_list.filter(
                    (f) => f.id === formValues.cashBox,
                  )[0]
                : {name:""}
            }
            id='multiple-limit-tags'
            options={cash_box_list.filter(
              (p1) => !pos_creation.some((s1) => p1.id === s1.cashBox),
            )}
            getOptionLabel={(option) => option?.name}
            onChange={(e, v) => {
              handleChange({target: {name: 'cashBox', value: v?.id || null}});
              validationHandler('cashBox', v?.id || null);
            }}
            // renderInput={(params) => (
            //     <TextField {...params} variant="outlined" label="CashBox" placeholder="Select CashBox" fullWidth={true} />
            // )}
            renderInput={(params) => {
              const get = {...params};

              get.InputProps = {
                ...params.InputProps,
                startAdornment: (
                  <Tooltip title='Create New'>
                    <IconButton
                      size='small'
                      onClick={() => {
                        // setOldCashBoxList(props.cash_box_list);
                        // props.setModalStatusHandler(true);
                        // props.setModalTypeHandler('NewCashBox');
                        // if (add_click) {
                        //   addActionRef.current.click()
                        //   setAdd_click(false)
                        // }
                        setOpen(true)
                      }}
                    >
                      <AddIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                ),
              };

              return (
                <TextField
                  {...get}
                  required={true}
                  error={formErrors.cashBox === null ? false : true}
                  helperText={
                    formErrors.cashBox === null ? '' : 'Cash Box is Required!'
                  }
                  label='CashBox'
                  variant='filled'
                />
              );
            }}
          />
        </Grid>
        <Grid
          size={{
            lg: 4,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          <Autocomplete
            multiple
            limitTags={2}
            fullWidth={true}
            required
            filterSelectedOptions
            defaultValue={
              Array.isArray(props.edit_id_data?.paymentId)
                ? props.edit_id_data.paymentId.map((item) =>
                    paymentMethod.find((method) => method.paymentId === item.paymentId)
                  ).filter(Boolean)
                : []
            }
            // value={!_.isEmpty(props.edit_id_data) ? props.cash_box_list.filter(s => s.id == props.edit_id_data[0].cashBox)[0] :formValues.cashBox !==""? props.cash_box_list.filter(f=>f.id ===formValues.cashBox)[0]:{}}
            id='multiple-limit-tags'
            options={paymentMethod}
            getOptionLabel={(option) => option?.paymentName}
            onChange={(e, v) => {
              handleChange({
                target: {
                  name: 'paymentId',
                  value: v?.map((p) => {
                    if (p?.paymentId) {
                      return { paymentId: p.paymentId };
                    }
                    return null;
                  }).filter(Boolean),
                },
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant='filled'
                required={true}
                label='Payment Method'
                placeholder='Select Payment Method'
                value={formValues.paymentId}
                fullWidth={true}
                error={formErrors.paymentId !== null ? true : false}
                helperText={
                  formErrors.paymentId === null ? '' : 'Payment Method is Required!'
                }
              />
            )}
            // renderInput={(params) => {
            //     const get = { ...params }

            //     get.InputProps = {
            //       ...params.InputProps, startAdornment: <Tooltip title="Create New"><IconButton size='small' onClick={() => {
            //         props.setModalStatusHandler(true);
            //         props.setModalTypeHandler("NewPaymentMethod");
            //         // if (add_click) {
            //         //   addActionRef.current.click()
            //         //   setAdd_click(false)
            //         // }
            //       }}><Add fontSize="small" /></IconButton></Tooltip>
            //     }

            //     return <TextField  {...get} error={props.value !== undefined ? props.error : false} label="PaymentMethod" variant="outlined" />
            //   }}
          />
        </Grid>
        <Grid
          size={{
            lg: 4,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          <FormControl fullWidth variant='filled'>
            <InputLabel id='demo-simple-select-label'>Sync Time</InputLabel>
            <Select
              labelId='demo-simple-select-label'
              id='demo-simple-select'
              value={formValues.syncTime}
              label='Sync Time'
              name='syncTime'
              onChange={handleChange}
            >
              <MenuItem value={1000 * 60 * 30}>30m</MenuItem>
              <MenuItem value={1000 * 60 * 60}>1h</MenuItem>
              <MenuItem value={1000 * 60 * 90}>1h30m</MenuItem>
              <MenuItem value={1000 * 60 * 120}>2h</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {/* <Grid
                        //   
                        lg={4}
                        md={6}
                        sm={6}
                        xs={12}
                        
                        
                       >
                        <TextField onChange={handleChange}
                            onBlur={handleChange}
                           
                            multiline={true}
                            style={{}}
                            fullWidth={true}
                            placeholder='Reason'
                            label='Reason'
                            name='reason'
                            value={formValues.reason === null ? '' : formValues.reason}
                            color='primary'
                            type='text'
                            regex=''
                            variant='outlined'
                        />
                    </Grid> */}
        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <FormControl component='fieldset' fullWidth={true} variant='filled'>
            <FormControlLabel
              control={
                <Checkbox
                  style={{}}
                  name='preorder'
                  checked={
                    formValues.preorder === null ? false : formValues.preorder
                  }
                  size='medium'
                  color='primary'
                  label='Enable Preorder'
                  required={false}
                  onChange={handleCheck}
                />
              }
              label='Enable Preorder'
              name='preorder'
            />
          </FormControl>
        </Grid>

        {/* <Grid
          // spacing={2}
          lg={12}
          md={12}
          sm={12}
          xs={12}
         
          style={{marginBottom: '10px'}}
          // container={true}
          // direction='row'
        > */}
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
        {/* </Grid> */}
      </Grid>
      <CancelDialog
        handle={cancel}
        delete={dialog}
        close={props.handleClose}
      ></CancelDialog>
      {
        <Dialog onClose={handleClose} open={open}>
          <div style={{ padding: 10 }}>
            <NewCashBox
              handleDialogClose={handleClose}            
              handleSubmit={handle_Submit}
              setModalStatusHandler={setModalStatusHandler}
              type='cashBoxCreation'
              setModalTypeHandler={setModalTypeHandler}
              {...props}
            />
          </div>
        </Dialog>
      }
    </div>
  );
}
export default NewPosCreation;
