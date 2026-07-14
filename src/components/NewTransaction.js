import React, {useState, useEffect, useRef, useContext} from 'react';
import { Card, TableCell, TableFooter, TableRow } from "@mui/material";
import MaterialTable, {MTableAction, MTableBody} from 'utils/SafeMaterialTable';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
import context from '../context/CreateNewButtonContext';
import {Button, TextField, Typography, Grid, TableContainer, Table, TableHead, TableBody, IconButton, Alert, Snackbar} from '@mui/material';
import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
import {getTrimmedData} from './trimFunction/index';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import moment from 'moment';
// import AppHeader from '@crema/core/AppLayout/DefaultLayout/AppHeader';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import apiCalls from 'utils/apiCalls';
import { getCurrentJournalEntrySequenceAction, listChartOfAccountsdataAction, listJournalAccount } from 'redux/actions/chartOfAccounts';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import AttachmentField from './../pages/common/Timesheet/Attachment';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import NegativeCashWarning from './NegativeCashWarning';
import toMomentOrNull from 'utils/DateFixer';


function NewTransaction(props) {
  // const [TableData, setTableData] = useState({ id: '' })
  // const addActionRef = useRef(null);
  const [tableItems, setTableItems] = useState([]);
  const [formValues, setFormValues] = useState({
    transactionDate: moment(),
    specialNumber: '',
    note: null,
    voucherTypeId: 1,
    journal_type: 'manual',
  }); //,account : null ,debit : null , credit : null ,description : null
  const [attachment, setAttachment] = useState([])
  const [formErrors, setFormErrors] = useState({
    transactionDate: null,
    specialNumber: null,
    note: null,
    voucherTypeId: null,
    name: null,
    debit: null,
    credit: null,
    journal_type: null,
    attachment: null
  }); //, account : null ,debit : null , credit : null ,description : null
  const [requiredFields] = useState(['note']); //,"account","debit","credit","description"
  const tempInsert = {
    name: "",
    accountId: null,
    accountCode: "",
    debitSign: 0,
    creditSign: 0,
    debit: "",
    credit: "",
    currbal: 0,
    acc_name: "",
    amount: ""
}
  const [transData, setTransData] = useState([]);
  const [needNegativeCashAlert, setNeedNegativeCashAlert] = useState(false)
  const [negativeCashAlertOpen, setNegativeCashAlertOpen] = useState(false)
  const [totalCash, setTotalCash] = useState(0)
  // const [current_item_id,setCurrent_Item_ID] = useState('')
  const [regex] = useState({});
  const {selectData, setselectData, setModalTypeHandler, setLoaderStatusHandler,} = useContext(context);
  // const [value, setValue] = React.useState([]);
  // const [data, setData] = useState([
  //   // { name: 'Mehmet', surname: 'Baran', birthYear: 1987, birthCity: 63 },
  //   // { name: 'Zerya BetÃ¼l', surname: 'Baran', birthYear: 2017, birthCity: 34 },
  // ]);
  const { 
    ChartOfAccountsReducer: {chartOfAccounts, journalaccount, journalEntrySequence},
  } = useSelector((state) => state);
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempedits = useRef(null);
  const tempinitsformVal = useRef(null);
  const dispatch = useDispatch()
  const initsform = () => {
    setInitialState(formValues);
  };

  const [debtot, setdebitTotal] = useState(0)
  const [cretot, setcreditTotal] = useState(0)
  const [customAlert, setCustomAlert] = useState({ show: false, message: '', severity: 'warning' });
  const toCents = (value) => {
    const parsed = parseFloat(value) || 0;
    return Math.round(parsed * 100);
  };
  const centsToAmount = (valueInCents) => valueInCents / 100;

  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
        dispatch(listJournalAccount()),
       dispatch(getCurrentJournalEntrySequenceAction())
      // !chartOfAccounts.length && dispatch(listChartOfAccountsdataAction()),
    )
  }, []);

  useEffect(() => {
    if(attachment.length > 2){
      setFormErrors((prev) => ({ ...prev, attachment: 'Only 2 files are allowed' }))
    }
    else if(attachment.length > 0 && attachment.length <= 2){
      setFormErrors((prev) => ({ ...prev, attachment: null }))
    }
  }, [attachment])

  useEffect(() => {
    if( props.status !== 'edit'){
    // addActionRef.current.click();
    }
    calculateDebitTotal(),calculateCreditTotal()
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
    setStateHandler(name, value);
  };

  const cancel = () => {
    setDialog(false);
  };

  const validClose = () => {
    setDialog(true);
  };

  const filterOptions = createFilterOptions({
    stringify: (option) => option.accountCode + ' ' + option.name
  });

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
    if(needNegativeCashAlert){
      setNegativeCashAlertOpen(true)
      return
    }
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
      }
      return null;
    });
    const isTransDataInvalid = transData.some((item) => {
      return (item.debit === '' && item.credit === '') || (item.debit && item.credit);
    });

    if (isTransDataInvalid) {
      isValid = false;
      formErrorsObj.debit = 'Fill debit OR credit'
      formErrorsObj.credit = 'Fill debit OR credit'
    }
    await setFormErrors(formErrorsObj);

    const {
      specialNumber,
      note,
      voucherTypeId,
      id,
      transactionDate,
      journal_type,
    } = formValues;
    const data = {
      specialNumber,
      note,
      voucherTypeId,
      id,
      transactionDate,
      journal_type,
      attachment,
    };
    let checkamount = [];
  
    data.transData = transData


     if (isValid) {
      props.handleSubmit(getTrimmedData(data));
     }
     else{
      setCustomAlert({
        show: true,
        message: 'Please fill the required fields',
        severity: 'error',
      });
     }

    
  };
  // if(-1){
  // }
  const edits = () => {
    if (props.edit_id_data && props.status === 'edit' && journalaccount.length > 0) {
      setFormValues(props.edit_id_data);
      setInitialState(props.edit_id_data);
      setAttachment(props.edit_id_data.files || [])
      
      const amt = props.edit_id_data.accountTransaction?.map((data) => {
        const amtfin = journalaccount.find(
          (d) => d.id === data.accountId,
        );

        // data.accountCode = data.accountCode;
        data.name = amtfin?.accountCode + ' ' + data.account_name;
        data.acc_name = data.account_name
        data.currbal = amtfin?.amount
        data.debit = data.debit ? `${Math.abs(data.debit)}` : "";
        data.credit = data.credit ? `${Math.abs(data.credit)}` : "";
        data.creditSign = amtfin?.creditSign;
        data.debitSign = amtfin?.debitSign;
        return data;
      });
      // setTransData(props.edit_id_data.accountTransaction)
      setTransData(amt || []);
    }
    else{
      if(transData.length === 0){
        setTransData((prev) => ([...prev, tempInsert, tempInsert]))
      }
    }
  };
  tempedits.current = edits;
  useEffect(() => {
    tempedits.current();
  }, [props.edit_id_data, journalaccount]);

  // useEffect(() => {

  //   // setTransData(props.transaction)
  // }, []);

  // useEffect(()=>{
  //   if(selectData.chartOfAccounts){
  //     const filter = [...props.chartOfAccounts]
  //     const pops = filter.shift()
  //     setTransData({...transData,id:pops.name})
  //     // setFormErroqrs({...formErrors,accountId:false})
  //     setselectData('chartOfAccounts',false)
  //   }

  // },[selectData.chartOfAccounts])

  const initsformVal = () => {
    const filter = [...props.chartOfAccounts];
    const pops = filter.shift();
    setTransData({...transData, id: pops.name});
    // setFormErrors({...formErrors,accountId:false})
    setselectData('chartOfAccounts', false);
  };
  tempinitsformVal.current = initsformVal;
  useEffect(() => {
    if (selectData.chartOfAccounts) {
      tempinitsformVal.current();
    }
  }, [selectData.chartOfAccounts]);

  // const dublicate = props.product.map((d) => (d.category))

  // const dublicate = props.chartOfAccounts.map((d) => (d.name))

  // const debittotal= ()=>{
  //   let total = 0;
  //   transData?.filter((s) => s.debit)
  //   .forEach((d) => {
  //     total += + Number(d.debit);
  //   });
  //   let value = Math.sign(total)
  //   if(value > 0){
  //       setdebitTotal(total)
  //         return total;
  //   }
  //   else{
  //     let val1 = total*-1
  //     setdebitTotal(val1)
  //     return total*-1
  //   }
  // }
  // const credittotal= ()=>{
  //   let total = 0;
  
  //   transData?.filter((s) => s.credit)
  //   .forEach((d) => {
  //     total += + Number(d.credit);
  //   });
  //   let value = Math.sign(total)
  //   if(value > 0){
  //       setcreditTotal(total)
  //         return total;
  //   }
  //   else{
  //     setcreditTotal(total*-1)
  //     return total*-1
  //   }
  //  }
    const currbalance = (curbal) =>{
      let signvalue = Math.sign(curbal)
      if(signvalue > 0){
           return `${curbal} Cr`
      }else{
        let sign_change = -1*curbal;
        return `${sign_change} Dr`
      }

    }
  
  const handleImageDelete = (index) => {
    const updatedImages = [...attachment]
    updatedImages.splice(index, 1)
    setAttachment(updatedImages)

    if(updatedImages.length > 0 && updatedImages.length <= 2){
      setFormErrors((prev) => ({ ...prev, attachment: null }))
    }
  }

  const calculateDebitTotal = (newTransData) => {
    const source = newTransData || transData;
    const totalInCents = source.reduce((sum, item) => sum + toCents(item.debit), 0);
    setdebitTotal(centsToAmount(totalInCents));
  };

  const calculateCreditTotal = (newTransData) => {
    const source = newTransData || transData;
    const totalInCents = source.reduce((sum, item) => sum + toCents(item.credit), 0);
    setcreditTotal(centsToAmount(totalInCents));
  };

  const calculateDifference = () => {
      return centsToAmount(toCents(debtot) - toCents(cretot)).toFixed(2);
  };

  useEffect(() => {
    calculateDebitTotal(transData);
    calculateCreditTotal(transData);
  }, [transData]);

  const deleteTransactionData = async(index) => {
    if(transData.length > 2){
      const updatedTransaction = [...transData]
      updatedTransaction.splice(index, 1)
      await setTransData(updatedTransaction)
  
      calculateDebitTotal(updatedTransaction)
      calculateCreditTotal(updatedTransaction)
    }
  } 

  return (
    <>
      {/* <AppHeader hidden={false} /> */}
      {/* {Prompt} */}
      {customAlert.show && (
        <Snackbar
          open={customAlert.show}
          autoHideDuration={3000}
          onClose={() => setCustomAlert({ ...customAlert, show: false })}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            severity={customAlert.severity}
            variant="filled"
           sx={{
            width: "100%",
            backgroundColor: "#f44336 !important",
            color: "#fff !important",
            "& .MuiAlert-icon": {
              color: "#fff !important",
            },
          }}
          >
            {customAlert.message}
          </Alert>
        </Snackbar>
      )}
      <Card sx={{ p: '20px', width: '100%',  height: 'calc(100vh - 80px) !important', minHeight: '100%', overflow: 'auto', padding: '20px' }}>
          <Typography variant='h6' align='left' style={{paddingBottom: '20px', padding: '20px'}}>
            New Journal
          </Typography>
          <Grid
            spacing={3}
            container
            display='flex'
            flexDirection='row'
            padding={5}
            height={'calc(100vh - 190px)'}
              sx={{
                flex: 1,
                overflow: "auto"
              }}
          >
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Grid container spacing = {3}>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Grid container spacing={3}>
                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      disableFuture
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'filled',
                        },
                      }}
                      name='transactionDate'
                      label='Transaction Date'
                      inputVariant='outlined'
                      views={['year', 'month', 'day']}
                      format='DD/MM/YYYY'
                      value={toMomentOrNull(formValues.transactionDate)}
                      onChange={(date) =>
                        handleChange({
                          target: {value: moment(date).format('YYYY-MM-DD HH:MM:SS'), name: 'transactionDate'},
                        })
                      }
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
                  <TextField
                    fullWidth={true}
                    label='Journal'
                    value={journalEntrySequence.currentSeq}
                    variant='filled'
                    disabled
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
                    style={{}}
                    fullWidth={true}
                    placeholder='Enter reference Number'
                    label='Reference Number'
                    name='specialNumber'
                    value={
                      formValues.specialNumber === null ? '' : formValues.specialNumber
                    }
                    color='primary'
                    multiline={false}
                    type='text'
                    regex=''
                    variant='filled'
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
             
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <AttachmentField
                asset = 'journalEntry'
                previews = {attachment}
                setPreviews = {setAttachment}
                handleImageDelete = {handleImageDelete}
              />
              <Typography color = 'error'>{formErrors.attachment ? formErrors.attachment : ''}</Typography>
            </Grid>
            {/* <Grid size={{ xs: 12, sm: 4, lg: 4 }} md = {4}></Grid>
            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}> */}
              {/* <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  renderInput={(props) => <TextField fullWidth={true} {...props} variant='filled'/>}
                  name='transactionDate'
                  label='Transaction Date'
                  inputVariant='outlined'
                  value={formValues.transactionDate}
                  onChange={(date) =>
                    handleChange({
                      target: {value: moment(date).format('YYYY-MM-DD HH:MM:SS'), name: 'transactionDate'},
                    })
                  }
                />
              </LocalizationProvider> */}
            {/* </Grid> */}

           
          </Grid>
          <br />

          <Grid
            size={{
              xs: 12,
              sm: 12,
              md: 12,
              lg: 12
            }}>
              {/* <MaterialTable
                      editable={{
                        onRowAdd: (newData) =>
                          new Promise((resolve, reject) => {
                            setTimeout(() => {
                                        // delete newData['tableData']
                      let isvalid = false;
                      const error = formErrors;
                      for (let d of ['name']) {
                        // ,'bar_val'
                        if (!newData[d]) {
                          error[d] = true;
                          isvalid = true;
                        }
                      }
                      if (
                        (newData.credit === '' && newData.debit === '') ||
                        (newData.credit !== '' && newData.debit !== '')
                      ) {
                        setFormErrors({...error, credit: true, debit: true});
                        return reject();
                      }
                      if (isvalid) {
                        setFormErrors(error);
                        return reject();
                      }
                      setFormErrors(false);
                      if (!newData.debit && newData.credit) {
                        newData.amount =
                          Number(newData.creditSign) === 1
                            ? Math.sign(newData.credit) === 1
                              ? newData.credit
                              : newData.credit.splice(0, 1)
                            : Math.sign(newData.credit) === -1
                            ? newData.credit
                            : `-${newData.credit}`;
                      }
                      if (!newData.credit && newData.debit) {
                        newData.amount =
                          Number(newData.debitSign) === 1
                            ? Math.sign(newData.debit) === 1
                              ? newData.debit
                              : newData.debit.splice(0, 1)
                            : Math.sign(newData.debit) === -1
                            ? newData.debit
                            : `-${newData.debit}`;
                      }
                      setFormErrors({...error, credit: null, debit: null});
                      setTransData([...transData, newData]);
                    
                      // setCurrent_Item_ID(newData.id)
                      //  props.handleSubmit(newData);
                      resolve();
                             // setTableItems([...tableItems, newData]);
                              // calculateTotal([...tableItems, newData]);
                              setTimeout(() => {
                                addActionRef.current.click();
                              }, 0);
                              resolve();
                            }, 1000);
                          }),
                        onRowUpdate: (newData, oldData) =>
                        new Promise((resolve, reject) => {
                          setTimeout(() => {
                            const dataUpdate = [...transData];
                            // const index = oldData.tableData.id;
                            const index = dataUpdate.findIndex(
                              (x) => x.id === newData.id,
                            );
                            if (!newData.debit && newData.credit) {
                              newData.amount =
                                Number(newData.creditSign) === 1
                                  ? Math.sign(newData.credit) === 1
                                    ? newData.credit
                                    : newData.credit.splice(0, 1)
                                  : Math.sign(newData.credit) === -1
                                  ? newData.credit
                                  : `-${newData.credit}`;
                            }
                            if (!newData.credit && newData.debit) {
                              newData.amount =
                                Number(newData.debitSign) === 1
                                  ? Math.sign(newData.debit) === 1
                                    ? newData.debit
                                    : newData.debit.splice(0, 1)
                                  : Math.sign(newData.debit) === -1
                                  ? newData.debit
                                  : `-${newData.debit}`;
                            }
                            dataUpdate[index] = newData;
                            setTransData([...dataUpdate]);
                            resolve();
                          }, 1000);
                        }),
                        onRowDelete: (oldData) =>
                          new Promise((resolve, reject) => {
                            setTimeout(() => {
                              const dataDelete = [...transData];
                              const index = oldData.tableData.id;
                              dataDelete.splice(index, 1);
                              setTransData([...dataDelete]);
                              resolve();
                            }, 1000);
                          }),
                      }}
                      components={{
                        Action: (props) => {
                          if (
                            typeof props.action === typeof Function ||
                            props.action.tooltip !== 'Add'
                          ) {
                            return <MTableAction {...props} />;
                          } else {
                            return (
                              <div
                                ref={addActionRef}
                                onClick={props.action.onClick}
                              />
                            );
                          }
                        },
                        // Body: (props) => (
                        //   <>
                        //     <MTableBody {...props} />
                        //     <TableFooter>
                        //       <TableRow>
                        //         {console.log(debtot , cretot  ,'sasfsdfdsfsdfs' ,debittotal(),credittotal())}
                        //         {(debtot > 0 || cretot > 0  ) && <><TableCell colSpan={1} ><h4 style={{fontWeight:'bold'}}>Total</h4></TableCell>
                        //        <TableCell colSpan={1}>{debittotal()}</TableCell> 
                        //         <TableCell colSpan={1}>{credittotal()}</TableCell> 
                        //         </>}
                        //       </TableRow>
                        //     </TableFooter>
                        //   </>
                        // )

                      }}
                      actions={[
                        {
                          icon: 'add',
                          tooltip: 'add',
                          isFreeAction: true,
                          onClick: (event, rowData) => {
                            addActionRef.current.click();
                          },
                        },
                      ]}
                      options={{
                        headerStyle,
                        cellStyle,
                        search: false,
                        exportButton: true,
                        filtering: false,
                        pagination: false,
                        paging: false,
                        minBodyHeight: 'calc(116vh - 900px)',
                        //maxBodyHeight: 'calc(116vh - 600px)',
                        // pageSize: pageSize,
                        // pageSizeOptions: [10, 20, 30],
                        actionsColumnIndex: -1,
                      }}
                      columns={[
                       
                        {
                          title: 'Account',
                          field: 'name',
                          render: rowData=>(<>
                            <div>
                            <Typography variant='h1' sx={{fontWeight: 'bold'}}> { rowData.acc_name } </Typography>
                            </div>
                            <div>
                            <Typography variant='h1' sx={{fontWeight: 'bold'}}> {`Curr Bal: ${currbalance(rowData.currbal)}`} </Typography>
                            </div>
                          </>),
                          editComponent: (props) => (
                            
                            <Autocomplete
                              error={props.value !== undefined ? props.error : 'false'}
                              name='name'
                              value={{name: props.value === undefined ? '' : props.value}}
                              onChange={(e, newValue) => {
                                if(!newValue) return;

                                props.onRowDataChange({
                                  ...props.rowData,
                                  name: newValue.name,
                                  accountId: newValue.id,
                                  accountCode: newValue.accountCode,
                                  debitSign: newValue.debitSign,
                                  creditSign: newValue.creditSign,
                                  debit: '',
                                  credit: '',
                                  currbal: newValue.amount,
                                  acc_name : newValue.name
                                })
                              }}
                              // options={journalaccount.filter((d) => d.name)}
                              // options={journalaccount.map((d) => ({ opt: d.name }))}
                              // filterOptions={filterOptions}
                              options={_.uniqBy(journalaccount, 'name')}
                              getOptionLabel={(option) => option.name}
                              groupBy={(option) => option.accountGroupName}
                              freeSolo
                              renderInput={(params) => (
                                <TextField {...params} label='Account' variant='filled' />
                              )}
                            />
                          ),
                          validate: (rowData) => (!rowData.name ? 'false' : true),
                        },
                        {
                          title: 'Debit',
                          field: 'debit',
            
                          editComponent: (props) => (
                            <TextField
                            required='true'
                            disabled = { 
                              props.rowData.credit !== ''
                                ? true
                                : false }
                              id='standard-basic'
                              name='debit'
                              label='Debit'
                              variant='filled'
                              type = 'number'
                       
                              value={props.value}
                              error={
                                Object.keys(props.rowData).length > 0
                                  ? props.rowData.debit !== '' &&
                                    props.rowData.credit !== ''
                                    ? true
                                    : false
                                  : false
                              }
                              helperText={
                                props.rowData.debit || props.rowData.credit
                                  ? props.rowData.credit !== '' && props.value !== ''
                                    ? 'Fill debit OR credit'
                                    : ''
                                  : ''
                              }
                              onChange={(e) => {
                                props.onChange(e.target.value);
                              }}
                            />
                          ),
                          validate: (rowData) =>
                            (rowData.credit === '' && rowData.debit === '') ||
                            (rowData.credit !== '' && rowData.debit)
                              ? false
                              : true,
                        },
                        {
                          title: 'Credit',
                          field: 'credit',
                          editComponent: (props) => (
                            <TextField
                              required='true'
                             disabled = { 
                              props.rowData.debit !== ''
                                ? true
                                : false }
                              id='standard-basic'
                              name='credit'
                              label='Credit'
                              variant='filled'
                              type = 'number'
                              value={props.value}
                              error={
                                Object.keys(props.rowData).length > 0
                                  ? props.rowData.credit !== '' &&
                                    props.rowData.debit !== ''
                                    ? true
                                    : false
                                  : false
                              }
                              helperText={
                                props.rowData.credit || props.rowData.debit
                                  ? props.rowData.debit !== '' && props.value !== ''
                                    ? 'Fill debit OR credit'
                                    : ''
                                  : ''
                              }
                              onChange={(e) => {
                                props.onChange(e.target.value);
                              }}
                            />
                          ),
                          // validate: rowData => rowData.debit ==='' || rowData.credit ==='' ? false : true
                          validate: (rowData) =>
                            (rowData.credit === '' && rowData.debit === '') ||
                            (rowData.credit !== '' && rowData.debit)
                              ? false
                              : true,
                        },
                      ]}
                      data={transData}
                      title={
                        <Typography
                          variant='h6'
                          align='left'
                          style={{paddingTop: '10px', paddingBottom: '10px'}}
                        >
                          Particulars
                        </Typography>
                      }
                    /> */}

            <Card>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width='50%' style = {{ fontSize: '12px', fontWeight: 600 }}>Account</TableCell>
                    <TableCell width='20%' style = {{ fontSize: '12px', fontWeight: 600 }}>Debit</TableCell>
                    <TableCell width='20%' style = {{ fontSize: '12px', fontWeight: 600 }}>Credit</TableCell>
                    <TableCell width='1%'></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {
                    transData.length > 0 ? 
                      transData.map((rowData, index) => (
                        <TableRow key = {index}>
                          <TableCell>
                            <Autocomplete
                              value = {_.uniqBy(journalaccount, 'name').find((account) => account.id === rowData.accountId)}
                              options = {_.uniqBy(journalaccount, 'name')}
                              getOptionLabel = {(option) => option.name}
                              groupBy = {(option) => option.accountGroupName}
                              freeSolo
                              onChange = {(event, newValue) => {
                                if(!newValue) return

                                const updatedTransData = [...transData]
                                updatedTransData[index] = {
                                    ...updatedTransData[index],
                                    name: newValue.name,
                                    accountId: newValue.id,
                                    accountCode: newValue.accountCode,
                                    debitSign: newValue.debitSign,
                                    creditSign: newValue.creditSign,
                                    currbal: newValue.amount,
                                    acc_name: newValue.name,
                                };
                                setTransData(updatedTransData)
                              }}
                              renderInput = {(params) => (
                                <TextField
                                  {...params}
                                  label = 'Account'
                                  variant = 'filled'
                                />
                              )}
                            />
                          </TableCell>

                          <TableCell>
                            <TextField
                              required
                              disabled = {rowData.credit !== '' || rowData.accountId === null}
                              label = 'Debit'
                              variant = 'filled'
                              type = 'number'
                              value = {rowData.debit}
                              error = {rowData.credit === '' && rowData.debit === '' && formErrors.debit !== null}
                              helperText = {rowData.credit === '' && rowData.debit === '' && formErrors.debit ? 'Fill debit or credit' : ''}
                              onChange = {(event) => {
                                if(event.target.value === '' & rowData.credit === ''){
                                  setFormErrors((prev) => ({ ...prev, credit: 'Fill debit OR credit', debit: 'Fill debit OR credit' }))
                                }
                                else{
                                  setFormErrors((prev) => ({ ...prev, credit: null, debit: null }))
                                }

                                const updatedTransData = [...transData]
                                updatedTransData[index] = {
                                    ...updatedTransData[index],
                                    debit: event.target.value,
                                    amount: Number(rowData.debitSign) === 1
                                        ? Math.sign(event.target.value) === 1
                                            ? event.target.value
                                            : event.target.value.slice(0, 1)
                                        : Math.sign(event.target.value) === -1
                                            ? event.target.value
                                            : `-${event.target.value}`
                                }
                                setTransData(updatedTransData)
                              }}
                              onBlur = {() => calculateDebitTotal(null)}
                            />
                          </TableCell>

                          <TableCell>
                          <TextField
                              required
                              disabled = {rowData.debit !== '' || rowData.accountId === null}
                              label = 'Credit'
                              variant = 'filled'
                              type = 'number'
                              value = {rowData.credit}
                              error = {rowData.debit === '' && rowData.credit === '' && formErrors.credit !== null}
                              helperText = {rowData.debit === '' && rowData.credit === '' && formErrors.credit ? 'Fill debit or credit' : ''}
                              onChange = {(event) => {
                                if(event.target.value === '' & rowData.debit === ''){
                                  setFormErrors((prev) => ({ ...prev, credit: 'Fill debit OR credit', debit: 'Fill debit OR credit' }))
                                }
                                else{
                                  setFormErrors((prev) => ({ ...prev, credit: null, debit: null }))
                                }

                                const updatedTransData = [...transData]
                                updatedTransData[index] = {
                                    ...updatedTransData[index],
                                    credit: event.target.value,
                                    amount: Number(rowData.creditSign) === 1
                                        ? Math.sign(event.target.value) === 1
                                            ? event.target.value
                                            : event.target.value.slice(0, 1)
                                        : Math.sign(event.target.value) === -1
                                            ? event.target.value
                                            : `-${event.target.value}`
                                }
                                setTransData(updatedTransData)
                              }}
                              onBlur = {() => {
                                calculateCreditTotal(null)
                                if(_.uniqBy(journalaccount, 'name').find((account) => account.id === rowData.accountId).amount < Number(transData[index].credit) && transData[index].credit !== '' && ['Cash-in-hand', 'Petty Cash', 'Bank'].includes(_.uniqBy(journalaccount, 'name').find((account) => account.id === rowData.accountId).name)){
                                  setNeedNegativeCashAlert(true)
                                  setTotalCash((prev) => prev === 0 ? Math.abs(_.uniqBy(journalaccount, 'name').find((account) => account.id === rowData.accountId).amount - transData[index].credit) : Math.abs(prev - transData[index].credit))
                                }
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <IconButton onClick = {() => deleteTransactionData(index)}>
                              <CloseIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    : (
                      <TableRow>No Records Available</TableRow>
                    )
                  }
                </TableBody>
              </Table>
            </Card>
          </Grid>
          <br />
          <Grid
            // lg={12}
            // md={12}
            // sm={12}
            // xs={12}
            //
            spacing={2}
            container
            direction='row'
            display = 'flex'
            justifyContent = 'space-between'
          >
            <Grid
              size={{
                lg: 4,
                md: 4,
                sm: 4,
                xs: 4
              }}>
              <Button variant = 'outlined' onClick = {() => setTransData((prev) => ([...prev, tempInsert]))}>
                <AddIcon fontSize='small' />
                <Typography>Add New Row</Typography>
              </Button>
            </Grid>

            <Grid
              size={{
                lg: 4,
                md: 4,
                sm: 4,
                xs: 4
              }}>
              <Card>
                <Grid container rowSpacing={3} sx={{padding: 3}}>
                  <Grid
                    size={{
                      lg: 4.8,
                      md: 4.8,
                      sm: 4.8,
                      xs: 4.8
                    }}></Grid>

                  <Grid
                    display = 'flex'
                    justifyContent = 'center'
                    size={{
                      lg: 4.2,
                      md: 4.2,
                      sm: 4.2,
                      xs: 4.2
                    }}>
                    <Typography fontSize = '12px' fontWeight = '600'>Debit</Typography>
                  </Grid>

                  <Grid
                    display = 'flex'
                    justifyContent = 'center'
                    size={{
                      lg: 3,
                      md: 3,
                      sm: 3,
                      xs: 3
                    }}>
                    <Typography fontSize = '12px' fontWeight = '600'>Credit</Typography>
                  </Grid>

                  <Grid
                    size={{
                      lg: 4.8,
                      md: 4.8,
                      sm: 4.8,
                      xs: 4.8
                    }}>
                    <Typography width='100%' fontSize = '12px' fontWeight = '600'>{`Total (₹)`}</Typography>
                  </Grid>

                  <Grid
                    display = 'flex'
                    justifyContent = 'flex-end'
                    size={{
                      lg: 4.2,
                      md: 4.2,
                      sm: 4.2,
                      xs: 4.2
                    }}>
                    <Typography fontSize = '12px'>{debtot.toFixed(2)}</Typography>
                  </Grid>

                  <Grid
                    display = 'flex'
                    justifyContent = 'flex-end'
                    size={{
                      lg: 3,
                      md: 3,
                      sm: 3,
                      xs: 3
                    }}>
                    <Typography fontSize = '12px'>{cretot.toFixed()}</Typography>
                  </Grid>

                  <Grid
                    size={{
                      lg: 9,
                      md: 9,
                      sm: 9,
                      xs: 9
                    }}>
                    <Typography fontSize = '12px' fontWeight = '600'>Difference</Typography>
                  </Grid>

                  <Grid
                    display = 'flex'
                    justifyContent = 'flex-end'
                    size={{
                      lg: 3,
                      md: 3,
                      sm: 3,
                      xs: 3
                    }}>
                    <Typography fontSize = '12px'>{calculateDifference()}</Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
            {/* <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
              <TextField
                onChange={handleChange}
                onBlur={handleChange}
                // required={true}
                style={{}}
                fullWidth={true}
                placeholder='Enter special Number'
                label='Special Number'
                name='specialNumber'
                value={
                  formValues.specialNumber === null ? '' : formValues.specialNumber
                }
                color='primary'
                multiline={false}
                type='text'
                regex=''
                variant='filled'
                // error={formErrors.specialNumber === null ? false : true}
                // helperText={formErrors.specialNumber === null ? '' : formErrors.specialNumber}
              />
            </Grid> */}
            {/* <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
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
            </Grid> */}
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
          </Grid>
          </Grid>
          <Grid
            // lg={12}
            // md={12}
            // sm={12}
            // xs={12}
            //
            spacing={0}
            container
            direction='row'
          >
            <Grid
              size={{
                lg: 9,
                md: 8,
                sm: 6,
                xs: 6
              }}></Grid>

            <Grid
              spacing={7}
              container
              direction='row'
              style={{paddingTop: '25px',padding: '15px', display: 'flex', justifyContent: 'flex-end'}}
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
                  name='Submit'
                  size='medium'
                  text='button'
                  color='primary'
                  style={{}}
                  variant='contained'
                  fullWidth={false}
                  disabled = {debtot !== cretot }
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

          <NegativeCashWarning
                          open={negativeCashAlertOpen}
                          cash={totalCash}
                          onClose={() => {
                              setNegativeCashAlertOpen(false)
                              setNeedNegativeCashAlert(false)
                          }}
                      />
          </Card>
    </>
  );
}

export default NewTransaction;

