import React, {useState, useEffect, useRef, useContext} from 'react';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
import DenominationDialog from './DenominationDialog';
import _ from 'lodash';
// import {formLabelsTheme} from "./Asterisk";
import {
  Button,
  TextField,
  InputLabel,
  FormHelperText,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Autocomplete,
} from '@mui/material';
import {getTrimmedData} from './trimFunction/index';
import {listCashBoxSummary} from '../redux/actions/cash_box_actions';
import {useDispatch, useSelector} from 'react-redux';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {Card} from '@mui/material';
import CardContent from '@mui/material/CardContent';
import Cookies from 'universal-cookie';
import { getLoginRoleAction } from 'redux/actions/userRole_actions';
import context from '../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import NoRecordFound from '../components/Layout/NoRecordFound';
import { getsessionStorage } from 'pages/common/login/cookies';
import {headerStyle,cellStyle,Width } from 'utils/pageSize';
import { roleType } from 'utils/roleType';




function NewCashBoxAdjustment(props) {
  const [formValues, setFormValues] = useState({
    taken_amount_val: null,
    given_amount_val: null,
    cash_box_id: null,
    cash_balance: null,
    update_denomination: null,
    options: null,
  });
  const [formErrors, setFormErrors] = useState({
    taken_amount_val: null,
    given_amount_val: null,
    cash_box_id: null,
    cash_balance: null,
    update_denomination: null,
  });
  const [requiredFields] = useState([
    'taken_amount_val',
    'given_amount_val',
    'cash_box_id',
    'cash_balance',
   'update_denomination'
  ]);

  const [denominationrequired] = useState(['update_denomination'])

  const [regex] = useState({});
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [openDenomination, setOpenDenomination] = useState(false);
  const [initialState, setInitialState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const [currentTarget, setCurrentTarget] = useState(null);
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempedits = useRef(null);
  const tempsummary = useRef(null);
  const [optionscashbox, setoptionscashbox] = useState('0');
  const [isApiFinished, setIsAiFinished] = useState(false);
  const dispatch = useDispatch();
  const [defaultcashbox, setdefaultcashbox] = useState(1)
  const [reset,setreset]= useState(true);
  // const cookies = new Cookies();
  let storage = getsessionStorage()
  const emp = storage?.employee_id || 0;

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    allData,
    headerLocationId,
    commoncookie,
  } = useContext(context);

  const {
    cashBoxReducer: {cash_box_summary},
  } = useSelector((store) => store);
 const [submitcashboxsummary, setsubmitcashboxsummary] = useState(null)
  const cash_box_denomination = props.cash_box_denomination;

  const initsform = () => {
    setInitialState(formValues);
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, []);

  useEffect(()=>{
    if(formValues.cash_box_id !== null && optionscashbox !== 1){
     props.cash_box_adjustment_list?.filter((d)=> d.id === formValues.cash_box_id).map((f)=>{
      setdefaultcashbox(f.allowdenomination)
     })
    }
   
  }, [formValues.cash_box_id])

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

  // useEffect(()=>{
 
  //     if(formValues.given_amount_val !== formValues.taken_amount_val){
  //         setFormErrors({
  //          ...formErrors,
  //          given_amount_val : 'Amount Not Equal!'
  //         //  [name]: capitalize(name) + ' not match!',
  //        })
  //       }
  //        else{
  //           setFormErrors({
  //          ...formErrors,
  //          given_amount_val : null
  //         //  [name]: capitalize(name) + ' not match!',
  //        })
  //        }
    
  // },[])

  const validationHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;
       const Adjustmentreq = ['taken_amount_val', 'given_amount_val'];

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
    } else if(
      denominationrequired.includes(name) && optionscashbox !== '1' &&
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
    }
    else if (regex[name]) {
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
    } 
    else if(formValues.given_amount_val !== null && formValues.taken_amount_val !== null &&
      parseInt(formValues.given_amount_val) !== parseInt(formValues.taken_amount_val)){
        setFormErrors({
          ...formErrors,
          given_amount_val: 'Amount Not Match With Amount Issued',
          // taken_amount_val: 'Amount Not Match'
        });
      }
      else if(formValues.cash_balance !== null && formValues.update_denomination !== null &&
        parseInt(formValues.cash_balance) !== parseInt(formValues.update_denomination)){
          setFormErrors({
            ...formErrors,
            // cash_balance: 'Amount Not Match',
            update_denomination: 'Amount Not Match With Cash Balance'
          });
        }
 
     else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
    // if(formValues.given_amount_val !== null && formValues.taken_amount_val !== null &&
    //    parseInt(formValues.given_amount_val) !== parseInt(formValues.taken_amount_val)) {
    //  setFormErrors({
    //   ...formErrors,
    //   given_amount_val: 'Amount Not Match',
    //   taken_amount_val: 'Amount Not Match'
    // });
  
    // } else {
    //   setFormErrors({
    //     ...formErrors,
    //     given_amount_val: null,
    //     taken_amount_val: null
    //   });
        
    // }
  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;
    let formErrorsObj = {...formErrors};

    const Adjust = ['taken_amount_val', 'given_amount_val', 'cash_box_id'];
    const Reset = ['cash_box_id', 'cash_balance', 'update_denomination'];

    await Object.keys(formValues).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        if (
          optionscashbox === '0' &&
          Reset.includes(key) &&
          (formValues[key] === null || formValues[key] === '')
        ) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Required!';
        } else if (
          optionscashbox === '1' &&
          Adjust.includes(key) &&
          (formValues[key] === null || formValues[key] === '')
        ) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Required!';
        }
        // isValid = false;
        // formErrorsObj[key] = capitalize(key) + " is Required!";
      } 
      else if(formValues.given_amount_val !== null && formValues.taken_amount_val !== null &&
        parseInt(formValues.given_amount_val) !== parseInt(formValues.taken_amount_val)){
        isValid = false;
        // formErrorsObj['taken_amount_val'] = 'Amount Not Match';
        formErrorsObj['given_amount_val'] = 'Amount Not Match With Amount Issued';
      }else if(formValues.cash_balance !== null && formValues.update_denomination !== null &&
        parseInt(formValues.cash_balance) !== parseInt(formValues.update_denomination)){
        isValid = false;
        formErrorsObj['update_denomination'] = 'Amount Not Match With Cash Balance';
      }
      else if (regex[key]) {
        if (!regex[key].test(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Invalid!';
        }
      }
      return null;
    });

    // await Object.keys(formValues).map((key, i) => {
    //   if (
    //     requiredFields.includes(key) &&
    //     (formValues[key] === null || formValues[key] === "")
    //   ) {
    //     isValid = false;
    //     formErrorsObj[key] = capitalize(key) + " is Required!";
    //   }
    //   else if (

    //     formValues.taken_amount_val !== formValues.given_amount_val
    //   ) {
    //     isValid = false;
    //     formErrorsObj['taken_amount_val'] = "Amount is not Equal!";
    //     formErrorsObj['given_amount_val'] = "Amount is not Equal!";
    //   }
    //   else if (regex[key]) {
    //     if (!regex[key].test(formValues[key])) {
    //       isValid = false;
    //       formErrorsObj[key] = capitalize(key) + " is Invalid!";
    //     }
    //   }
    //   return null;
    // });
 

    await setFormErrors(formErrorsObj);

    // alert("Is Form Valid - " + isValid);
    const emptyState = (status) => {
      if (status) setFormValues(initialState);
    };
    formValues.options = optionscashbox;

    // API call..
    if (isValid) 
    {
      setsubmitcashboxsummary(formValues.cash_box_id);
      props.handleSubmit(formValues, emptyState);}
  

  };
  const setAmountDialogToState = (Amount) => {
    if (typeof Amount !== 'undefined') {
      setFormValues({...formValues, taken_amount_val: Amount});
      setOpenDenomination(false);
    } else {
      setOpenDenomination(false);
    }
  };

  const Change = (e) => {
    let {value} = e.target;
    setoptionscashbox(value);
    setFormValues({
      taken_amount_val: null,
    given_amount_val: null,
    cash_box_id: null,
    cash_balance: null,
    update_denomination: null,
   

    })

    setFormErrors({
      taken_amount_val: null,
    given_amount_val: null,
    cash_box_id: null,
    cash_balance: null,
    update_denomination: null,
    })
  };
//------admin
 
const admin=()=>{
  // const cookies = new Cookies();
  let emp_id = storage?.employee_id || '';
dispatch(
  getLoginRoleAction(emp_id, (role_name) => {
    if (roleType.includes(role_name)) 
    return(setreset)
   } ))} 




  const initssummary = () => {
    const cashBox = formValues.cash_box_id|| submitcashboxsummary;
    //const cashBoxId = cashBox.length>0?cashBox[0].cashBox :null
    // if(cashBoxId !==null && cash_box_id ===''){
    //  setCashBoxId(cashBoxId)
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listCashBoxSummary(cashBox,submitcashboxsummary ))
    ).finally((res) => setIsAiFinished(true));
    // }
  };
  tempsummary.current = initssummary;
  useEffect(() => {
    tempsummary.current();
  }, [formValues.cash_box_id]);

  const totalAmount = () => {
    let total = 0;
    total = cash_box_summary.reduce(
      (acc, curr) =>
        acc +
        +curr.current_balance_count *
          cash_box_denomination.filter(
            (f) => f.id === curr.denomination_dtl_id,
          )[0]?.denomination,
      0,
    );

    return total;
  };

  return (
    <>
      {Prompt}
      {/* {openDenomination && (
        <DenominationDialog
          handleSubmit={setAmountDialogToState}
          responseType={'cashAdjustment'}
          formValues={{...formValues}}
          setFormValues={setFormValues}
          setOpenDenomination={setOpenDenomination}
          currentTarget={currentTarget}
          validationHandler={validationHandler}
        />
      )} */}
      <Typography variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
        CashBox Adjustment
      </Typography>
      <div
        style={{
          border: '2px solid grey',
          borderRadius: '10px',
          justifyContent: 'center',
          display: 'flex',
        }}
      >
      {reset ? <FormControl component='fieldset'>
          {/* <FormLabel component="legend">Gender</FormLabel> */}
          <RadioGroup
            row
            aria-label='customer'
            value={optionscashbox}
            name='customer_type'
            onChange={Change}
          >
            <FormControlLabel  value='0' control={<Radio />} label='Reset' />
            <FormControlLabel value='1' control={<Radio />} label='Adjust' />
          </RadioGroup>
        </FormControl>
        :  <FormControl component='fieldset'>
        {/* <FormLabel component="legend">Gender</FormLabel> */}
        <RadioGroup
          row
          aria-label='customer'
          value={optionscashbox}
          name='customer_type'
          onChange={Change}
        >
          <FormControlLabel disabled value='0' control={<Radio />} label='Reset' />
          <FormControlLabel value='1' control={<Radio />} label='Adjust' />
        </RadioGroup>
      </FormControl>
        }
      </div>
      <br />
      <br />
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
    lg: 4,
    md: 4,
    sm: 4,
    xs: 12
  }}>
          {/* <FormControl
            fullWidth
            error={formErrors.cash_box_id === null ? false : true}
            required={true}
            variant='outlined'
            component='fieldset'
          >
            <InputLabel id='demo-simple-select-label'>Cash Box</InputLabel>
            <Select
              name='cash_box_id'
              // labelId="ParentAccountId"
              id='cash_box_id'
              label='cash_box_id'
              required={true}
              value={
                formValues.cash_box_id === null ? '' : formValues.cash_box_id
              }
              onChange={handleChange}
            >
              {props.cash_box_adjustment_list
                .filter((d) => d)
                .map((d) => (
                  <MenuItem value={d.id} key={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
            </Select>
            <FormHelperText>{formErrors.cash_box_id}</FormHelperText>
          </FormControl> */}
          <Autocomplete
                  value={formValues.cash_box_id !== null? props.cash_box_adjustment_list.filter(f=>f.id === formValues.cash_box_id)[0] : {name:''}}
                  name='cash_box_id'
                  fullWidth={true}
                  onChange={(event, newValue) => {
                    if(newValue !== null){
                      handleChange({target : {name : 'cash_box_id' , value : newValue.id}})
                    }
                  }}
                  options={ optionscashbox === '0' ? _.uniqBy(props.cash_box_adjustment_list,'name') :  _.uniqBy(props.cash_box_adjustment_list.filter((f)=> f.allowdenomination !== 0),'name')}
                  getOptionLabel={(option) => option.name}                
                  renderInput={(params) => <TextField {...params}
                   variant='filled'
                    error={formErrors.cash_box_id === null ? false : true} 
                     helperText={formErrors.cash_box_id === null ? '' : 'Cashbox is Required!'}
                      label='Cash Box'
                       required={true} />}
              />

        </Grid>
      

        {optionscashbox === '0' && (
          <>

{openDenomination && (
        <DenominationDialog
          handleSubmit={setAmountDialogToState}
          responseType={'cashAdjustment'}
          formValues={{...formValues}}
          setFormValues={setFormValues}
          setOpenDenomination={setOpenDenomination}
          currentTarget={currentTarget}
          validationHandler={validationHandler}
          total={formValues.cash_balance}
        />
      )}


            <Grid
              size={{
                lg: 4,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                onChange={handleChange}
                //  onClick={(e) => { setOpenDenomination(true); setCurrentTarget(e.target.name) }}
                // onBlur={handleChange}
                required={true}
                style={{}}
                fullWidth={true}
                onWheel={ (e) => e.target.blur()}
                placeholder=' Enter Cash Balance'
                label='Cash Balance'
                name='cash_balance'
                color='primary'
                multiline={false}
                type='number'
                regex=''
                variant='filled'
                value={
                  formValues.cash_balance === null
                    ? ''
                    : formValues.cash_balance
                }
                error={formErrors.cash_balance === null ? false : true}
                helperText={
                  formErrors.cash_balance === null
                    ? ''
                    : 'Cash Balance is Required!'
                }
              />
            </Grid>
            <Grid
              size={{
                lg: 4,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                // onChange={handleChange}
                onBlur={handleChange}
                onClick={(e) => {
                  formValues.cash_balance > 0 && defaultcashbox === 1 &&
                  setOpenDenomination(true);
                  setCurrentTarget(e.target.name)
                }}
                required={ defaultcashbox === 1 ? true : false}
                style={{}}
                fullWidth={true}
                placeholder=' Enter Update Denomination'
                label='Update Denomination'
                name='update_denomination'
                color='primary'
                multiline={false}
                // type="number"
                type='text'
                regex=''
                variant='filled'
                value={
                  formValues.update_denomination === null
                    ? ''
                    : formValues.update_denomination
                }
                error={formErrors.update_denomination === null || defaultcashbox !==1  ? false : true}
                helperText={
                  formErrors.update_denomination === null || defaultcashbox !== 1
                    ? ''
                    :'Update Denomination is Required!'
                }
              />
            </Grid>
          </>
        )}
        {optionscashbox === '1' && (
          <>

{openDenomination && (
        <DenominationDialog
          handleSubmit={setAmountDialogToState}
          responseType={'cashAdjustment'}
          formValues={{...formValues}}
          setFormValues={setFormValues}
          setOpenDenomination={setOpenDenomination}
          currentTarget={currentTarget}
          validationHandler={validationHandler}
          total={formValues.taken_amount_val}
        />
      )}

            <Grid
              size={{
                lg: 4,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                // onChange={handleChange}
                onClick={(e) => {
                  
                  setOpenDenomination(true);
                  setCurrentTarget(e.target.name);
                }}
                onBlur={handleChange}
                required={true}
                style={{}}
                fullWidth={true}
                onWheel={ (e) => e.target.blur()}
                placeholder='Enter Taken Amount'
                label='Amount Issued'
                name='taken_amount_val'
                color='primary'
                multiline={false}
                type='number'
                regex=''
                variant='filled'
                value={
                  formValues.taken_amount_val === null
                    ? ''
                    : formValues.taken_amount_val
                }
                error={formErrors.taken_amount_val === null ? false : true}
                helperText={
                  formErrors.taken_amount_val === null
                    ? ''
                    :formErrors.taken_amount_val
                }
              />
            </Grid>
            <Grid
              size={{
                lg: 4,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                // onChange={handleChange}
                onBlur={handleChange}
                onClick={(e) => {
                  formValues.taken_amount_val > 0 &&
                  setOpenDenomination(true);
                  setCurrentTarget(e.target.name)
                }}
                required={true}
                style={{}}
                fullWidth={true}
                onWheel={ (e) => e.target.blur()}
                placeholder=' Enter Given Amount'
                label='Amount Received'
                name='given_amount_val'
                color='primary'
                multiline={false}
                // type="number"
                type='number'
                regex=''
                variant='filled'
                value={
                  formValues.given_amount_val === null
                    ? ''
                    : formValues.given_amount_val
                }
                error={formErrors.given_amount_val === null ? false : true}
                helperText={
                  formErrors.given_amount_val === null
                    ? ''
                    :   formErrors.given_amount_val
                }
              />
            </Grid>
          </>
        )}

        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid
            container
            direction='row'
            display='flex'
            justifyContent='flex-end'
            alignItem='center'
            padding='10px 0px'
          >
            {/* <Grid
              // spacing={0}
              lg={2}
              md={3}
              sm={6}
              xs={6}
              // container={true}
              // direction='row'
             
            >
              {form === false ? (
                <Button
                  onClick={() => props.handleClose()}
                  style={{}}
                  name="Cancel"
                  variant="contained"
                  color="secondary"
                  size="medium"
                  text="button"
                  fullWidth={false}
                  type="cancel"
                >
                  Cancel
                </Button>
              ) : (
                <Button
                  onClick={() => validClose()}
                  style={{}}
                  name="Cancel"
                  variant="contained"
                  color="secondary"
                  size="medium"
                  text="button"
                  fullWidth={false}
                  type="cancel"
                >
                  Cancel
                </Button>
              )}
            </Grid> */}

            <Grid
              display='flex'
              justifyContent='flex-end'
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
      </Grid>
      <br />
      <Card sx={{minWidth: '60vw', minHeight: '15vh'}}>
        <Typography variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px' ,marginLeft:'15px'}}>
          CASHBOX SUMMARY
        </Typography>

        <CardContent  style={{height:'40vh',overflow:'auto'}}>
          {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <Grid container direction="row" style={{ paddingBottom: '10px' }}>
              <Grid size={{ xs: 4, sm: 6, md: 3, lg: 4 }}>
                <Typography variant="body2" sx={{ fontSize: 18 }} gutterBottom style={{paddingLeft : '20px'}}>
                  CLOSING : {cash_box_summary.length > 0 ? cash_box_summary[0].closing_balance : 0}
                </Typography>
              </Grid>
              <Grid size={{ xs: 4, sm: 6, md: 3, lg: 4 }}>
                <Typography variant="body2" sx={{ fontSize: 18 }} gutterBottom style={{paddingLeft : '20px'}}>
                  OPENING : {cash_box_summary.length > 0 ? cash_box_summary[0].opening_balance : 0}
                </Typography>
              </Grid>
              <Grid size={{ xs: 4, sm: 6, md: 3, lg: 4 }}>
                <Typography variant="body2" sx={{ fontSize: 18 }} style={{paddingLeft : '20px'}}>
                  CLOSING DATE : {cash_box_summary.length > 0 ? cash_box_summary[0].closing_date : ''}
                </Typography>
              </Grid>
            </Grid>
          </Grid> */}

          <Grid
            size={{
              xs: 12,
              sm: 12,
              md: 12,
              lg: 12
            }}>
            <Grid container direction='row' spacing={2}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 6,
                  lg: 6
                }}>
                <TableContainer component={Paper}>
                  <Table sx={{minWidth: 200}} aria-label="a dense table">
                    <TableHead>
                      <TableRow >
                        <TableCell style={{fontSize:headerStyle.fontSize,textAlign:'center'}}>Denomination</TableCell>
                        <TableCell style={{fontSize:headerStyle.fontSize,textAlign:'center'}} >Count</TableCell>
                        <TableCell style={{fontSize:headerStyle.fontSize,textAlign:'center'}} >Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cash_box_summary.slice(0, 5).map((summary) => {
                        let denomination = cash_box_denomination.filter(
                          (f) => f.id === summary.denomination_dtl_id,
                        )[0]?.denomination;
                        return (
                          <TableRow
                            key={summary.denomination_dtl_id}
                            sx={{
                              '&:last-child td, &:last-child th': {border: 0},
                            }}
                          >
                            <TableCell style={{fontSize:cellStyle.fontSize,textAlign:'center'}} component='th' scope='row'>
                              {denomination}
                            </TableCell>
                            <TableCell style={{fontSize:cellStyle.fontSize,textAlign:'center'}}>
                              {summary.current_balance_count}
                            </TableCell>
                            <TableCell style={{fontSize:cellStyle.fontSize,textAlign:'center'}}>
                              {(summary.current_balance_count * denomination).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 6,
                  lg: 6
                }}>
                <TableContainer component={Paper}>
                  <Table sx={{minWidth: 200 }} aria-label='simple table'>
                    <TableHead style={{fontSize:headerStyle.fontSize}}>
                      <TableRow>
                        <TableCell style={{fontSize:headerStyle.fontSize,textAlign:'center'}}>Denomination</TableCell>
                        <TableCell style={{fontSize:headerStyle.fontSize,textAlign:'center'}}>Count</TableCell>
                        <TableCell style={{fontSize:headerStyle.fontSize,textAlign:'center'}}>Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cash_box_summary.slice(5, 10).map((summary) => {
                        let denomination = cash_box_denomination.filter(
                          (f) => f.id === summary.denomination_dtl_id,
                        )[0]?.denomination;
                        return (
                          <TableRow
                            key={summary.denomination_dtl_id}
                            sx={{
                              '&:last-child td, &:last-child th': {border: 0},
                            }}
                          >
                            <TableCell style={{fontSize:cellStyle.fontSize,textAlign:'center'}} component='th' scope='row'>
                              {denomination}
                            </TableCell>
                            <TableCell style={{fontSize:cellStyle.fontSize,textAlign:'center'}}>
                              {summary.current_balance_count}
                            </TableCell>
                            <TableCell style={{fontSize:cellStyle.fontSize,textAlign:'center'}}>
                              {(summary.current_balance_count * denomination).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Grid>
          <br />
          <Grid container direction='row' style={{paddingBottom: '10px'}}>
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 6,
                lg: 12
              }}>
              <Typography
                variant='h6'
                gutterBottom
                style={{paddingLeft: '20px'}}
              >
                Total : {totalAmount().toFixed(2)}
              </Typography>
            </Grid> 
          </Grid> 
          <br />
          <Grid>
            {
              totalAmount() === 0 && isApiFinished &&
                <NoRecordFound /> 
            }
            </Grid>                
        </CardContent>
      </Card>
      <CancelDialog
        handle={cancel}
        delete={dialog}
        close={props.handleClose}
      ></CancelDialog>
    </>
  );
}

export default NewCashBoxAdjustment;
