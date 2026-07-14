import { Button, FormControl, FormControlLabel, FormHelperText, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {LocalizationProvider} from '@mui/x-date-pickers';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { useDispatch, useSelector } from 'react-redux';
import { getDateFormat } from 'utils/getTimeFormat';
import { listCashBoxAdjustmentAction } from 'redux/actions/cash_box_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { getsessionStorage } from 'pages/common/login/cookies';
import { listPaymentMethodAction } from 'redux/actions/payment_method_actions';
import DenominationDialog from 'pages/accounts/cashOutIn/DenominationDialog';
import { getDenominationValidationByIdAction } from 'redux/actions/cashOutIn_actions';
import { createTransactionAction } from 'redux/actions/transaction_actions';
import { loanAccountsIdNameAction, payrollPaymentModeActions, searchLoanAction, updateLoanOutstandingAction } from 'redux/actions/loan_actions';
import { listBankCreationAdjustmentAction } from 'redux/actions/bankCreation_actions';
import apiCalls from 'utils/apiCalls';
import _ from 'lodash';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { roleType } from 'utils/roleType';
import stockLocation from 'pages/common/stockLocation';
import moment from 'moment';
import toMomentOrNull from 'utils/DateFixer';

function Loanpayments(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const storage = getsessionStorage()

    const firstTextFieldRef = useRef(null);
    const secondTextFieldRef = useRef(null);

    const handleFocus = () => {
        activeChip === 'cash' &&
        formValues.amount > 0 &&
        defaultcash === 1 &&
        formValues.amount <= props.rowdata?.outStanding &&
        setOpenDenomination(true);
        setCurrentTarget('Tendered')
    
        // Change focus to the second TextField
        if (secondTextFieldRef.current) {
          secondTextFieldRef.current.focus();
        }
      };

    const handleClose = () => {
        navigate('/payroll/loans')
    }
    
    const {
        setModalTypeHandler,
        setLoaderStatusHandler,
        headerLocationId,
        allData
    } = useContext(CreateNewButtonContext);

    const {
        UserRoleReducer: { loginRole },bankCreationReducer:{bank_creation_adjustment_list}, salesReducer:{stocklocation}
    } = useSelector((state) => state);

    const [openAlert, setOpenAlert] = useState(false);
    const [single, setsingle] = useState(1);
    const [activeChip, setActiveChip] = useState('cash');
    const [openDenomination, setOpenDenomination] = useState(false);
    const [currentTarget, setCurrentTarget] = useState('Tendered');
    const [amountNegativeValidation, setAmountNegativeValidation] = useState('');
    const [formValues, setFormValues] = useState({
        date: getDateFormat(new Date()),
        amount:  single === 1 ? "" : props.rowdata?.Required_Amount,

        // amount: loginRole[0]?.role_name !== 'Administrator' ? ( single === '0' ? props.rowdata?.Required_Amount :  (props.rowdata?.Required_Amount / props.rowdata?.tenure).toFixed() ): props.rowdata?.Required_Amount,
        amount_in_change: [],
        amount_in_denomination: [],
        paymentLedger: null,
        paymentId: null,
        paymentModeLedgerId: null
    });
    const [ defaultcash, setDefaultcash ] = useState(0);
    const [manualOrClose, setManualOrClose] = useState('MANUAL_PAYMENT');
    
    console.log(formValues.paymentLedger ,"paymentLedger")

    useEffect(() => {
        setFormValues({...formValues,  amount:  single === 1 ? "": props.rowdata?.Required_Amount})
    }, [single])



    useEffect(() => {

    }, [formValues])
    
    const [formErrors, setFormErrors] = useState({
        amount: null,
        date: null,
        paymentId: null,
    });

    // console.log("formErrors",formErrors)
    
    const [selectedValue, setSelectedValue] = useState('default');

    const [requiredFields] = useState([
        'amount',
        'paymentId'
    ]);

    const [regex] = useState({});

    const Change = (e) => {
        let { value } = e.target;
        // console.log(typeof value, "Value")
        setsingle(parseInt(value));
    };

    const {
        cashBoxReducer: { cash_box_adjustment_list }, paymentMethodReducer: { paymentMethod },LoanReducer:{payrollPaymentMode}
    } = useSelector((state) => state);

    const {
        ChartOfAccountsReducer: { chartOfAccounts_payOut_data, chartOfAccounts_payIn_data }
    } = useSelector((state) => state);

    const companyType = storage.company_type

    useEffect(() => {
        const id = storage.company_id
        dispatch(listBankCreationAdjustmentAction(storage.employee_id, setModalTypeHandler,
            setLoaderStatusHandler, headerLocationId))
        dispatch(listCashBoxAdjustmentAction(storage.employee_id, setModalTypeHandler,
            setLoaderStatusHandler, 'null'))
        dispatch(listPaymentMethodAction(setModalTypeHandler, setLoaderStatusHandler))
        companyType === 5 && dispatch(payrollPaymentModeActions(id,setModalTypeHandler, setLoaderStatusHandler))

        if(!roleType.includes(loginRole[0]?.role_name)){
         setsingle(1)
        }
    }, [])

    useEffect(() => {
        setFormErrors({amount: null,paymentId: null})
    }, [single])

    useEffect(()=>{
        if(formValues.payment_id !== null && activeChip === 'cash' && cash_box_adjustment_list.length > 0 ){
         cash_box_adjustment_list?.filter((f)=> f.id === formValues.payment_id)?.map((d) => setDefaultcash(d.allowdenomination))
        }
    },[formValues.payment_id])
    
//   useEffect(()=>{
     
//     if(formValues.paymentId
//         !== '' && formValues.paymentId !== null){
//       let getPaymentModeLedgerId = null 
//       if(activeChip === 'cash'){
//          getPaymentModeLedgerId = cash_box_adjustment_list.find(
//           (d) => d.id === formValues.paymentId,
//         );
//         setFormValues({...formValues,paymentModeLedgerId:getPaymentModeLedgerId?.ledger_id || null})
//         setAmountNegativeValidation(getPaymentModeLedgerId?.negativeDenomination)
//       }else{
//          getPaymentModeLedgerId = paymentMethod.find(
//           (d) => d.paymentId === formValues.paymentId,
//         );
//         setFormValues({...formValues,paymentModeLedgerId:getPaymentModeLedgerId?.ledger_id || null})
//       }
      
//      }
//   },[formValues.paymentId])

    const PaymentDenominationvalidation = (value) => {
        if (value) {
            apiCalls(
                dispatch(getDenominationValidationByIdAction(value))
            );
        }
    }

    const setStateHandler = async (name, value) => {
        let formObj = {};
        if (name === 'ledger_id' && value !== null) {
            const ledgerName = [...chartOfAccounts_payOut_data, ...chartOfAccounts_payIn_data].find((d) => d.id === value).name;
            formObj = {
                ...formValues,
                [name]: value === '' ? null : value,
                ledgerName,
            };
        }
        else if (name === 'paymentId') {
            if (activeChip !== 'cash') {
                if (single === 0) {
                    PaymentDenominationvalidation(value)
                } else {
                    PaymentDenominationvalidation(value)
                }
                const paymentData = paymentMethod.find(
                    (d) => d.paymentId === value,
                );
                const locationValue = bank_creation_adjustment_list.find(
                    (d) => d.bankAccountId === paymentData.bankAccountId,
                );
                const payName = paymentData.paymentName;
                props.setLocationId(locationValue.location_id);
                const data = { payment_id: value }
                props.PayOutAmountValidation(data)
                formObj = {
                    ...formValues,
                    [name]: value === '' ? null : value,
                    payName,
                };
            } else if (activeChip === 'cash') {

                PaymentDenominationvalidation(value, 'cash', single === 0 ? 'Out' : 'IN')

                const paymentData = cash_box_adjustment_list.find(
                    (d) => d.id === value,
                );
                const payName = paymentData.name;
                props.setLocationId(paymentData.location_id);
                const data = { cashboxId: value }
                props.PayOutAmountValidation(data)
                formObj = {
                    ...formValues,
                    [name]: value === '' ? null : value,
                    payName,
                };
            }
        }
        else if (name === 'amount' && single === 0) {
            formObj = {
                ...formValues,
                [name]: value === '' ? null : value,
            };
        }
        else {
            formObj = {
                ...formValues,
                [name]: value === '' ? null : value,
            };
        }

        setFormValues(formObj);
        validationHandler(name, value);
    };

    const setAmountDialogToState = (Amount) => {
        if (typeof Amount !== 'undefined') {
            setFormValues({ ...formValues, amount: Amount });
            setOpenDenomination(false);
            setStateHandler('amount', Amount);
        } else {
            setOpenDenomination(false);
        }
    };

    const handleChange = async (e) => {
        let { name, value } = e.target;

        if (headerLocationId !== 'null') {
            setStateHandler(name, value);
        } else {
            setOpenAlert(true)
        }
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
   
    // console.log('asdasdfae', )
    
    const HandleSubmit = async() => {
        event.preventDefault();

        let isValid = true;
        let formErrorsObj = {...formErrors};
        Object.keys(formValues).map((key, i) => {         
          if (
            requiredFields.includes(key) &&
            (formValues[key] === null || formValues[key] === '' || formValues.paymentLedger === '')
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

        if (formErrors.amount !== null || formErrors.paymentId !== null) {
            isValid = false;
        }

        // if (!formValues.paymentLedger || formValues.paymentLedger === '' || formValues.paymentLedger === undefined) {
        //     isValid = false;
        //     formErrorsObj.paymentLedger = 'Default-Cashbox is required!';
        // }
    

        await setFormErrors(formErrorsObj);

        if (isValid) {

         
                // console.log('aksasdd',activeChip, defaultcash, formValues.amount_in_denomination?.length, formValues.amount, formValues.paymentLedger)
                if (activeChip === 'cash' && defaultcash === 1 && formValues.amount_in_denomination?.length === 0 && formValues.amount > 0) {
                    // console.log('asdfsdf337')
                    setOpenDenomination(true);
                    setCurrentTarget('Tendered')
    
                    if (formValues.amount_in_denomination?.length) {
                        // console.log("ppp", formValues);
                        // return

                        let payload = {
                            "outstanding": props.rowdata?.outStanding,
                            "amount": formValues.amount,
                            "cash_type" : activeChip,
                            "pay_type" : single,
                            "entity": props.rowdata.loan_number,
                            "date" : props.rowdata.date,
                            "transactionDate": moment(formValues.date).format('YYYY-MM-DD HH:mm:ss'),
                            "tenure":props.rowdata.tenure,
                            "location_id": allData.filter((f)=> f.location_type == 'Default Location')[0]?.location_id,
                            "amount_in_denomination":formValues.amount_in_denomination,
                            "paymentLedger": formValues.paymentLedger,
                        }
                       await dispatch(updateLoanOutstandingAction(props.rowdata?.id, payload, async() => {
                            await props.close()
                           await dispatch(searchLoanAction(
                                props.filteredValue,
                                setModalTypeHandler,
                                setLoaderStatusHandler,
                            ))
                        }))


                    }
    
                } else {
                    // console.log('asdfsdf370')
                    let payload = {
                        "outstanding": props.rowdata?.outStanding,
                        "amount": formValues.amount,
                        "cash_type" : activeChip,
                        "pay_type" : single,
                        "entity": props.rowdata.loan_number,
                        "date" : props.rowdata.date,
                        "transactionDate": moment(formValues.date).format('YYYY-MM-DD HH:mm:ss'),
                        "tenure":props.rowdata.tenure,
                        "location_id": allData.filter((f)=> f.location_type == 'Default Location')[0]?.location_id,
                        "amount_in_denomination":formValues.amount_in_denomination,
                        "paymentLedger": formValues.paymentLedger,
                    }
                    dispatch(updateLoanOutstandingAction(props.rowdata?.id, payload, () => {
                        props.close()
                        dispatch(searchLoanAction(
                            props.filteredValue,
                            setModalTypeHandler,
                            setLoaderStatusHandler,
                        ))
                    }))

                }
    
            
}
        
      
    }

    const chipChange = (data) => {
        //setFormValues({...formValues, amount: null});
        setActiveChip(data);
    };
    
    useEffect(()=>{
        let payName =  cash_box_adjustment_list?.find(x => x?.name == 'Default-Cashbox' )?.name 

        // console.log("payName",payName)
        let payId =  cash_box_adjustment_list?.find(x => x?.name == 'Default-Cashbox' )?.ledger_id 
        
        setFormValues({ ...formValues, paymentLedger: payName, paymentId: payId })


    },[cash_box_adjustment_list])

    // console.log("paymentLedger",formValues.paymentLedger)

    // console.log('cashboxxxx',allData.filter((f)=> f.location_type == 'Default Location')[0]?.location_id);
    return (
        <>
            {openDenomination && (
                <DenominationDialog
                    openDenomination={openDenomination}
                    handleSubmit={setAmountDialogToState}
                    responseType={'cashIn'}
                    formValues={{ ...formValues }}
                    setFormValues={setFormValues}
                    setOpenDenomination={setOpenDenomination}
                    currentTarget={currentTarget}
                    setCurrentTarget={setCurrentTarget}
                    validationHandler={validationHandler}
                    total={formValues.amount}
                    amountNegativeValidation={amountNegativeValidation}
                //cashOutIn_denomination={props.cashOutIn_denomination}
                />
            )}
            <Grid container >
                <Grid
                    style={{
                        border: '2px solid grey',
                        borderRadius: '10px',
                        justifyContent: 'center',
                        display: 'flex',
                        maxWidth: '100%'
                    }}
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <FormControl component='fieldset'>
                        <RadioGroup
                            row
                            aria-label='customer'
                            name='cash_type'
                            value={manualOrClose}
                            onChange={(e) => {
                                const { value } = e.target
                                setManualOrClose(value)
                                const amt = value === 'MANUAL_PAYMENT' ? '' : props.rowdata?.outStanding
                                setFormValues({ ...formValues, amount: amt })
                            }}
                        >
                            <FormControlLabel value={'MANUAL_PAYMENT'} control={<Radio />} label='Manual Payment' />
                            <FormControlLabel value={'CLOSE_LOAN'} control={<Radio />} label='Close loan' />

                            {/* <FormControlLabel  value={0} control={<Radio />} label='PayOut' /> */}
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid container display="flex" justifyContent="space-between">
                    <Grid
                        size={{
                            lg: 6,
                            md: 6,
                            sm: 6,
                            xs: 12
                        }}></Grid>

                    <Grid
                        style={{ marginBottom: '25px', marginTop: '20px' }}
                    >
                        <Typography variant='h4'>Out Standing : Rs. {props.rowdata?.outStanding}</Typography>

                    </Grid>
                </Grid>
            </Grid>
            <Grid
                style={{ paddingTop: '15px' }}
                spacing={2}
                container
                direction='row'
            >


                <Grid
                    size={{
                        lg: 4,
                        md: 4,
                        sm: 4,
                        xs: 12
                    }}>
                    <Box>
                        <LocalizationProvider dateAdapter={DateAdapter}>
                            <DatePicker
                                disableFuture
                                label='Date'
                                // inputFormat='DD/MM/yyyy'
                                name='date'
                                value={toMomentOrNull(formValues.date)}
                                onChange={(e, v) => {
                                    setFormValues({ ...formValues, date: getDateFormat(e) });
                                }}
                                slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                            />
                        </LocalizationProvider>
                    </Box>
                </Grid>
                <Grid
                    size={{
                        lg: 4,
                        md: 4,
                        sm: 4,
                        xs: 12
                    }}>
                    <FormControl
                        required={true}
                        component='fieldset'
                        fullWidth={true} 
                    >
                        <TextField
                            label="Ledger"
                            value={props.rowdata?.loan_number}
                            variant='filled'
                            inputProps={{ "aria-readonly": true }}
                        />
                    </FormControl>
                </Grid>
                <Grid
                    size={{
                        lg: 4,
                        md: 4,
                        sm: 4,
                        xs: 12
                    }}>
                    <TextField
                        value={formValues.amount}
                        onChange={(e) => {
                            let num = e.target.value.replace(/[^0-9]/g, '');
                            // console.log("num", num)
                            if (num > (props.rowdata?.outStanding)) {
                                setFormErrors({ ...formErrors, amount: 'Amount should be less tha Outstanding Amount' })
                            } else if (num == '') {
                                setFormErrors({ ...formErrors, amount: 'Amount is Required' })
                            }
                            else if (num == 0) {
                                setFormErrors({ ...formErrors, amount: 'Amount Should be Greater Than Zero' })
                            }
                            else {
                                setFormErrors({ ...formErrors, amount: null })
                            }

                            // console.log("ggfgfg", parseInt(num), num);
                            setFormValues({ ...formValues, amount: parseInt(num) })
                        }}
                        onFocus={(e) => {
                            // handleFocus()
                        }}
                        required
                        fullWidth
                        onBlur={() => {
                            handleFocus()
                        }}
                        onWheel={(e) => e.target.blur()}
                        placeholder=' Enter Amount'
                        label='Amount'
                        name='amount'
                        color='primary'
                        type='number'
                        regex=''
                        variant='filled'
                        InputProps={{
                            readOnly: manualOrClose === 'CLOSE_LOAN',
                            max: 400,
                        }}
                        inputRef={firstTextFieldRef}
                        //value={formValues.amount === null ? '' : formValues.amount}
                        error={formErrors.amount === null ? false : true}
                        helperText={formErrors.amount === null ? '' : formErrors.amount}
                    />
                </Grid>
            </Grid>
            <Grid style={{ display: 'flex', paddingTop: '15px' ,paddingBottom :'15px' }}>
                <TextField
                    fullWidth
                    placeholder=' Note'
                    label='Note'
                    name='reason'
                    color='primary'
                    multiline={true}
                    variant='filled'
                    rows={2}
                    type='text'
                    inputRef={secondTextFieldRef}
                />
            </Grid>
            <Grid container style={{ display: 'flex', justifyContent: 'end', paddingTop: '10px' }}>
                <Grid style={{ paddingRight: '5px' }}>
                    <Button color='secondary' variant='contained' onClick={props.close}>
                        cancel
                    </Button>
                </Grid>
                <Grid>
                    <Button color='primary' variant='contained' onClick={HandleSubmit}>
                        submit
                    </Button>
                </Grid>
            </Grid>
            {
                openAlert &&
                (<LocationAlert open={openAlert} onClose={() => setOpenAlert(false)} />)
            }
        </>
    );
}

export default Loanpayments