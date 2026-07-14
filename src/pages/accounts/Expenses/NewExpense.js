import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useCallback,
} from 'react';
import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  Link,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import MaterialTable, {MTableAction} from 'utils/SafeMaterialTable';
import {Close, Edit, Search} from '@mui/icons-material';
import FilePicker from 'components/FilePicker';
import {Box} from '@mui/system';
import CancelDialog from 'components/CancelDialog';
import apiCalls from 'utils/apiCalls';
import {getPurchaseSuppliersByIdAction, getSearchByVendorAction, getSearchByVendorDataAction, listVendorIdAndNameAction, setSearchByVendorDataAction} from '../../../redux/actions/vendor_actions';
import {
  getExpenseLedgersAction,
  createExpenseAction,
  getExpenseItemsAction,
  UpdateExpenseAction,
  UpdateTransactionIdAction
} from '../../../redux/actions/expense_actions';
import {listTaxCategoryAction} from '../../../redux/actions/tax_Category_actions';
import {useDispatch, useSelector} from 'react-redux';
import {chartOfAccountsIdNameAction} from '../../../redux/actions/chartOfAccounts';
import {createTransactionAction} from '../../../redux/actions/transaction_actions';
import {EXPENSE_LAST_INSERT_ID} from '../../../redux/actionTypes';
import { base_url } from 'http-common';
import toMomentOrNull from 'utils/DateFixer';
import SearchIcon from '@mui/icons-material/Search';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { searchErrorMessage } from 'utils/content';
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../utils/stickyTableLayout';
import { GetTdsTaxes } from 'redux/actions/purchase_actions';
import { gstItcBlockReasonListAction } from 'redux/actions/gstItcBlockReason.actions';
import ItcClassificationControl from 'components/gst/ItcClassificationControl';

//data
// const vendorIdAndName = [
//   {
//     supplier_id: 1,
//     company_name: 'test',
//   },
// ];
const gst = [
  {id: 1, percent: 18},
  {id: 2, percent: 9},
  {id: 3, percent: 28},
];

// const ledger = [
//   {
//     ledger_id: 1,
//     ledger_name: 'stationary',
//   },
// ];

const taxHeadSx = {
  display: 'flex',
  justifyContent: 'flex-end',
};

export default function NewExpense(props) {
  const addActionRef = useRef(null);
  const vendorRef = useRef(null);
  const dispatch = useDispatch();

  const [formValues, setFormValues] = useState({
    date: new Date(),
    vendor_id: null,
    type: 'Goods',
    invoice_number: '',
    note: '',
    tax_types: '0',
    tcs: '',
    tds: '',
    tcs_percent: '0%',
    tds_percent: '',
    tds_value: null,
    tds_id : null,
  });

  

  const [tableItems, setTableItems] = useState([]);
  const [total, setTotal] = useState({
    total_amount: 0,
    gst_amount: 0,
    amount: 0,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [transactionLastInsertId,setTransactionId] = useState(0)
  const [toggleFilePicker, setToggleFilePicker] = useState(false);
  const [vendorSearchText, setVendorSearchText] = useState('')
  const {setModalTypeHandler, setLoaderStatusHandler, setModalStatusHandler,headerLocationId} =
    useContext(CreateNewButtonContext);
  const {
    ExpenseReducer: {expenseLedgers,expenseLastInsertId},
    taxCategoryReducer: {taxcategory},
    UserCreationReducer: { all_user_location },
    vendorReducer : {vendorIdAndName},
       purchasesReducer : { tds_taxrate },
    gstItcBlockReasonReducer: { list: itcBlockReasons },
  } = useSelector((state) => state);

  const triggerAddAction = useCallback(() => {
    addActionRef.current?.click();
  }, []);

  useEffect(() => {
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            !tds_taxrate?.length && dispatch(GetTdsTaxes('list','null')),
        )
        if (!itcBlockReasons || itcBlockReasons.length === 0) {
            dispatch(gstItcBlockReasonListAction());
        }
    }, [])


  useEffect(() => {
    if(props.status !== 'Edit'){
    setTimeout(() => {
      triggerAddAction();
    }, 0);
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      // !vendorIdAndName.length > 0 && dispatch(listVendorIdAndNameAction()),
      !expenseLedgers.length > 0 && dispatch(getExpenseLedgersAction()),
      !taxcategory.length > 0 && dispatch(listTaxCategoryAction()),
      dispatch(setSearchByVendorDataAction([]))
    );
  }, []);

  useEffect(()=>{
   
    if(props.status === 'Edit'){
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getExpenseItemsAction(props.EditData.id,(res)=>{
          setVendorSearchText(props.EditData.company_name)
          setFormValues({...props.EditData,tax_types:'0'});
          setTableItems(res);
          calculateTotal(res);
        })),
      );
    }
  },[props.status])
  useEffect(()=>{

    if(expenseLastInsertId !== 0 && transactionLastInsertId !== 0){
      apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(UpdateTransactionIdAction({id:expenseLastInsertId,transactionId:transactionLastInsertId})),
        )
        dispatch({
          type: EXPENSE_LAST_INSERT_ID,
          payload: 0,
        })

        setTransactionId(0)
    }
  },[expenseLastInsertId,transactionLastInsertId])


  useEffect(()=>{

    return ()=>{
      props.setEmptyToEditData()
    }
  },[])

  const handleChange = (e) => {
    const { name, value } = e.target;
    // console.log('nameeeeeeeeeeeeee', name, value)
    setFormValues({ ...formValues, [name]: value });
    if (name === 'tds_percent') {
      // console.log('valueeeeeeeeeeeeeeee', value)
      setFormValues((prev) => ({ ...prev, tds_percent: (value?.tds_rate || 0), tds_id: value?.id || null }))
    }
  };

  const getTransactionId = (status,insertObj) =>{

      if(Object.keys(insertObj).length){
        setTransactionId(insertObj.insertId)
      }
  }
  
  const handleSaveAndNew = () => {
    setFormValues({
      date: new Date(),
      vendor_id: null,
      type: 'Goods',
      invoice_number: '',
      note: '',
      tax_types: '0',
      tcs: '',
      tds: '',
      tcs_percent: '0%',
      tds_percent: '',
      tds_value: null,
      tds_id: null,
    });

    setVendorSearchText('');
    dispatch(setSearchByVendorDataAction([]));
    setUploadedFiles([]);
    setTableItems([]);
    setTotal({
      total_amount: 0,
      gst_amount: 0,
      amount: 0,
      
    });
  };

  const tcstaxes = () => {
    let total = 0;
    if (formValues.tcs && !isNaN(formValues.tcs)) {  // Check if not empty and is a valid number
      total = parseFloat(formValues.tcs) || 0; // Convert to number, default to 0
    }
    return total;
  };

  function calculatetdsTaxAmount() {
    let FinalTotal = 0
    if (formValues.tds_percent && !isNaN(formValues.tds_percent)) {
      //  total = ((untaxed() * formValues.tds_percent) / (100 + formValues.tds_percent)).toFixed(2)
      FinalTotal = (((total.amount * formValues.tds_percent) / 100)).toFixed(2)
      //  setFormValues({...formValues, tds : total})
      return Number(FinalTotal);
    }
    else {
      return FinalTotal;
    }
  }

  function calculateTcsTaxRate() {
    if (formValues.tcs && !isNaN(formValues.tcs)) {
      let taxableAmount = total.amount

      // Corrected tax rate calculation
      let taxRate = (parseFloat(formValues.tcs) / taxableAmount) * 100;
      let tax_value = taxRate.toFixed(2);
      // setFormValues({...formValues, tcs_percent : tax_value})
      return tax_value;
    } else {
      return "";
    }
  }


  const floatnum = (num) => {
    const parsedNum = Number(num)
    if (!Number.isFinite(parsedNum)) return 0
    const str = parsedNum.toFixed(2)
    const numarray = str.split('.')
    let convert = numarray[0]
    if (numarray[1]) {
      convert += '.' + numarray[1]
    }
    else {
      convert += '.00'
    }
    return parseFloat(convert)
  }




  const handleSubmit = async (type) => {
    if (headerLocationId === 'null') return alert("Please Select your location");
    const tcsValue = tcstaxes();
    const tdsValue = calculatetdsTaxAmount();

    const finalTotal = floatnum(
      Math.round(total.total_amount + tcsValue - tdsValue)
    );

    let transactionEntryData = {
      tcs_inter: tcsValue,
      tds_inter: tdsValue,
    };


    let data = {
      ...formValues,
      ...total,
      total_amount: finalTotal,
      pageCount: formValues.id ? props.searchConfig.page : 0,
      numPerPage: props.searchConfig.pageSize,
      date: moment(formValues.date).format('YYYY-MM-DD'),
      expense_items: tableItems.map(i => {
        const { itc_eligible, itc_block_reason_id, is_rcm, ...rest } = i;
        return {
          ...rest,
          ...(!rest.gst_inclusive && { gst_inclusive: 'no' }),
          total_amount: finalTotal,
          // Nested gst block per backend contract (expense.model.js reads item.gst.*)
          gst: {
            itc_eligible: itc_eligible === 0 || itc_eligible === false ? 0 : 1,
            itc_block_reason_id: itc_block_reason_id != null ? Number(itc_block_reason_id) : null,
            is_rcm: is_rcm === 1 || is_rcm === true ? 1 : 0,
          },
        };
      }),
      transactionEntryData: transactionEntryData,
      tcs: tcsValue,
      tcs_percent: calculateTcsTaxRate(),
      tds: tdsValue
    };


    let { ledger_id, tax_type } = vendorIdAndName.find(
      (d) => formValues.vendor_id === d.supplier_id,
    )
    data.vendorledger = ledger_id
    data.location_id = headerLocationId
    data.taxType = tax_type
    //   let ledgerDetails = await [...tableItems.map((d) => d.ledger_id), ledger_id]

    // const body = {
    //   id: ledgerDetails,
    //   name: null
    // }

    // const ledgerData = {
    //   // "code": "00",
    //   // "entity": "00",
    //   location_id: headerLocationId,
    //   specialNumber: '00',
    //   note: 'Purchase Expense',
    //   voucherTypeId: 1,
    // };

    // const accountTransaction = [];

    // dispatch(chartOfAccountsIdNameAction(body, (list) => {
    //     list.forEach((d) => {
    //       const { id, creditSign, debitSign } = d;
    //       const dd = { accountId: id, description: '' };

    //       if (ledger_id === id) {

    //         dd.amount = creditSign * data.total_amount || 0
    //         accountTransaction.push(dd);
    //       } else if (ledgerDetails.includes(id)) {
    //         let { total_amount } = tableItems.find(
    //           (l) => l.ledger_id === id,
    //         )
    //         dd.amount = debitSign * total_amount || 0
    //         accountTransaction.push(dd);
    //       }
    //     });

    //     ledgerData.accountTransaction = accountTransaction;
    //     // dispatch(createTransactionAction(ledgerData, true, setLoaderStatusHandler,getTransactionId))

    //     data.ledgerData = ledgerData;

    //     if (!data.id) {
    //       apiCalls(
    //         setModalTypeHandler,
    //         setLoaderStatusHandler,
    //         dispatch(createExpenseAction(data)),
    //       ).finally((res) => props.setIsApiFinished(false));
    //     }else {
    //       apiCalls(
    //         setModalTypeHandler,
    //         setLoaderStatusHandler,
    //         dispatch(UpdateExpenseAction(data.id,data)),
    //       ).finally((res) => props.setIsApiFinished(true))
    //     }
    //     props.setSearchConfig({
    //       ...props.searchConfig,
    //       ...(!data.id && {page : 0})
    //       })
    //   })
    // )
    if (!data.id) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        await dispatch(createExpenseAction(data)),
      ).finally((res) => props.setIsApiFinished(false));
    } else {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(UpdateExpenseAction(data.id, data)),
      ).finally((res) => props.setIsApiFinished(true))
    }
    props.setSearchConfig({
      ...props.searchConfig,
      ...(!data.id && { page: 0 })
    })

    if (type === 'save') {
      props.handleClose();
    } else {
      handleSaveAndNew();
    }

  };

  const handleSave = () => {
    props.handleClose();
  };

  const handleVendorSearchAPICall = (searchText) => {
    if(searchText.length >= 3) {
      const payload = {
        searchString: searchText
      }
      dispatch(getSearchByVendorDataAction(payload))
      setVendorSearchText('')
    }
    else {
      dispatch(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
    }
  }

  const handleCloseVendorDetails = () => {
    setFormValues((prev) => ({...prev, vendor_id: null}))
    setVendorSearchText('')
    dispatch(setSearchByVendorDataAction([]))
  }

  const handleAutoSearchApicall = (searchText) => {
    dispatch(setSearchByVendorDataAction([]))
    const payload = {
      searchString : searchText
    }
    dispatch(getSearchByVendorAction(payload, setModalTypeHandler, setLoaderStatusHandler))
  }
  
  useEffect(() => {
    if(props.status === 'Edit') {
      dispatch(getPurchaseSuppliersByIdAction(props?.EditData?.vendor_id))
    }
  }, [props.status])


  function readFileAsync(file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function calculateTotal(data) {
    const tempTotal = data.reduce(
      (acc, curr) => {
        return {
          gst_amount: acc.gst_amount + curr.gst_amount,
          amount: acc.amount + curr.amount,
          total_amount: acc.total_amount + curr.total_amount,
        };
      },
      {total_amount: 0, gst_amount: 0, amount: 0},
    );

    setTotal(tempTotal);
  }

  function calculateGstAndAmount(data) {
    const gst_percent = parseInt(data.gst_percent.match(/\d+/)[0]);
    if (data.gst_inclusive && data.gst_inclusive === 'yes') {
      let balAmt = data.total_amount * (100/(100+gst_percent)); 
      let gstAmt = data.total_amount - balAmt;
  
      return {
        amount: parseFloat(balAmt.toFixed(2)),
        gst_amount: parseFloat(gstAmt.toFixed(2)),
      };
    } else {
      let gstAmt = (gst_percent / 100) * data.amount;
      let balAmt = data.amount + gstAmt;
  
      return {
        total_amount: parseFloat(balAmt.toFixed(2)),
        gst_amount: parseFloat(gstAmt.toFixed(2)),
      };
    }
  }

  function checkInputs() {
    if (
      Boolean(formValues.vendor_id) &&
      Boolean(formValues.invoice_number) &&
      Boolean(formValues.type) &&
      Boolean(tableItems.length)
    ) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <>
      <Card sx={{
        height: '88vh',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {display: 'none',},
         scrollbarWidth: 'none', }}>
        <CardContent>
        <Grid container spacing={3}>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          {/* name and date */}
          <Grid display='flex' pb='10px' pt="10px">
            <Typography
              variant='h6'
              align='left'
              style={{
                paddingTop: '10px',
                paddingBottom: '30px',
              }}
            >
              {props.status !== 'Edit' ? 'New Expense' : 'Edit Expense'}
            </Typography>

            <Grid style={{marginLeft: 'auto'}}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  disableFuture
                  name='date'
                  label='Date'
                  inputVariant='outlined'
                  // inputFormat='DD/MM/yyyy'
                  value={toMomentOrNull(formValues.date)}
                  format='DD/MM/YYYY'
                  onChange={(date) =>
                    handleChange({
                      target: {
                        value: date._d,
                        name: 'date',
                      },
                    })
                  }
                  views={['year', 'month', 'day']}
                  fullWidth
                  slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>

          {/* 4 inputs */}
          <Grid
            container
            paddingBottom='20px'
            display='flex'
            flexDirection='row'
            // justifyContent='space-between'
            spacing={5}
          >
            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <Autocomplete
                // style={{width: '50%'}}
                disableClearable
                freeSolo={vendorSearchText.length <= 3}
                name='vendor_id'
                ref={vendorRef}
                fullWidth
                inputValue={vendorSearchText}
                onInputChange={(event, newInputValue, reason) => {
                  if(reason === 'input') {
                    setVendorSearchText(newInputValue)
                    if(newInputValue !== '') {
                      handleAutoSearchApicall(newInputValue)
                    }
                    if(newInputValue === '') {
                      setFormValues((prev) => ({...prev, vendor_id: null}))
                      dispatch(setSearchByVendorDataAction([]))
                    }
                  }
                }}
                value={
                   vendorIdAndName.find(
                    (d) => formValues.vendor_id === d.supplier_id,
                  ) || {company_name:''}
                }
                onChange={(e, val) => {
                  handleChange({
                    target: {
                      name: 'vendor_id',
                      value: val !== null ? val.supplier_id : null,
                    },
                  })
                  setVendorSearchText(val?.company_name || '')
                }}
                disabled={props.status === 'Edit'}
                options={vendorIdAndName.filter(
                  (d) =>
                    d.company_name &&
                    d.supplier_id &&
                    d.supplier_id !== null &&
                    d.company_name !== null,
                )}
                getOptionLabel={(option) => option.company_name}
                renderInput={(params) => {
                  const get = {...params}
                  let startAdornment = null
                  return (
                    <TextField
                      variant='filled'
                      {...get}
                      required
                      label='Vendor'
                      placeholder='Select Vendor'
                      fullWidth={true}
                      slotProps={{
                        input: (props.status !== 'Edit') && {
                          ...get.InputProps,
                          startAdornment: startAdornment,
                          endAdornment: (
                            <>
                              {
                                formValues.vendor_id === '' || formValues.vendor_id === null ?
                                // <IconButton
                                //   size='small'
                                //   onClick={() => {
                                //     handleVendorSearchAPICall(vendorSearchText)
                                //   }}
                                // >
                                //   <SearchIcon />
                                // </IconButton> 
                                '':
                                <IconButton
                                  size='small'
                                  onClick={() => {
                                    handleCloseVendorDetails()
                                  }}
                                >
                                  <CloseIcon />
                                </IconButton>
                              }
                              {get.InputProps.endAdornment}
                            </>
                          )
                        }
                      }}
                    />
                  )
                }}
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
                name='invoice_number'
                label='Invoice Number'
                value={formValues.invoice_number}
                variant='filled'
                fullWidth
                required
                onChange={(e) => {
                   const value = e.target.value;
                  if (/\s/.test(value)) return;
                  handleChange({
                    target: {
                      name: 'invoice_number',
                      value,
                    },
                  })
                }}
              />
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <Grid container
                display='flex'
                alignItems='center'
                justifyContent= 'center'
                gap='10px'
                // spacing={2}
                style={{
                  border: '1px solid rgb(193 193 193)',
                  borderRadius: '10px',
                  // padding: '0px 10px 0px 25px',
                  // minHeight: '54px',
                  // maxHeight: '84px',
                  // width: '100%',
                }}
              >
                <Grid><Typography variant='h5'>Type : </Typography></Grid>
                <Grid><FormControl component='fieldset' variant='filled'>
                  <RadioGroup
                    row
                    value={formValues.type}
                    name='type'
                    required
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: 'type',
                          value: e.target.value,
                        },
                      })
                    }
                  >
                    <FormControlLabel
                      value='Goods'
                      control={<Radio />}
                      label='Goods'
                    />
                    <FormControlLabel
                      value='Service'
                      control={<Radio />}
                      label='Service'
                    />
                  </RadioGroup>
                </FormControl></Grid>
              </Grid>
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <TextField
                name='note'
                label='Note'
                multiline={true}
                value={formValues.note}
                variant='filled'
                fullWidth={true}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: 'note',
                      value: e.target.value,
                    },
                  })
                }
              />
            </Grid>
            </Grid>
            </Grid>
          </Grid>

          {/* table and file picker */}
          <Grid container display='flex' paddingBottom='10px' spacing={6}>
            {/* table  */}
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Grid>
                <MaterialTable
                 style={{height: 'calc(100vh -70px)'}}
                  editable={{
                    onRowAdd: (newData) =>
                      new Promise((resolve, reject) => {
                        setTimeout(() => {
                          newData = {
                            ...newData,
                            ...calculateGstAndAmount(newData),
                          };
                          setTableItems([...tableItems, newData]);
                          calculateTotal([...tableItems, newData]);
                          setTimeout(() => {
                            triggerAddAction();
                          }, 0);
                          resolve();
                        }, 1000);
                      }),
                    onRowUpdate: (newData, oldData) =>
                      new Promise((resolve, reject) => {
                        setTimeout(() => {
                          const dataUpdate = [...tableItems];
                          const index = oldData.tableData.index
                          newData = {
                            ...newData,
                            ...calculateGstAndAmount(newData),
                          };
                          dataUpdate[index] = newData;
                          setTableItems([...dataUpdate]);
                          calculateTotal([...dataUpdate]);
                          resolve();
                        }, 1000);
                      }),
                    onRowDelete: (oldData) =>
                      new Promise((resolve, reject) => {
                        const rowIndex = oldData?.tableData?.index;
                        const dataDelete = Number.isInteger(rowIndex)
                          ? tableItems.filter((_, index) => index !== rowIndex)
                          : tableItems.filter((item) => item.id !== oldData?.id);

                        setTableItems(dataDelete);
                        calculateTotal(dataDelete);
                        resolve();
                      }),
                  }}
                  components={{
                    ...stickyTableComponents,
                    Action: (props) => {
                      const isAddAction =
                        props.action?.isFreeAction &&
                        typeof props.action !== 'function' &&
                        props.action?.tooltip?.toLowerCase() === 'add';

                      if (
                        !isAddAction
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
                  }}
                  actions={[
                    {
                      icon: 'add',
                      tooltip: 'add',
                      isFreeAction: true,
                      onClick: (event, rowData) => {
                        triggerAddAction();
                      },
                    },
                  ]}
                  options={getStickyTableOptions({
                    headerStyle,
                    bodyOffset: 200,
                    cellStyle,
                    options:{
                      showEmptyDataSourceMessage: false,    
                    search: false,
                    exportButton: true,
                    pagination: true,
                    maxBodyHeight: 'calc(116vh - 600px)',
                    pageSize: 5,
                     tableLayout: "auto",
                    toolbar: true,
                    pageSizeOptions: [5, 10, 15],
                    actionsColumnIndex: -1,
                    }
                  })}
                  columns={[
                    {
                      title: 'Ledger',
                      field: 'ledger_name',
                      readonly: true,
                      filtering: false,
                      sorting: false,
                      validate: (rowData) => Boolean(rowData.ledger_name),
                      cellStyle: {
                        minWidth: 300,
                      },
                      headerStyle: {
                        minWidth: 300,
                      },
                      editComponent: ({
                        value,
                        onChange,
                        rowData,
                        onRowDataChange,
                      }) => (
                        <Autocomplete
                          name='ledger_id'
                          value={
                            expenseLedgers.filter(
                              (d) => rowData.ledger_id === d.ledger_id,
                            )[0] || null
                          }
                          onChange={(e, val) =>
                            onRowDataChange({
                              ...rowData,
                              ledger_name: val.ledger_name,
                              ledger_id: val.ledger_id,
                            })
                          }
                          options={expenseLedgers}
                          getOptionLabel={(option) => option.ledger_name}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label='Ledger'
                              variant='filled'
                              placeholder='Select Ledger'
                              fullWidth
                              
                              sx={{paddingBottom:'17px'}}
                            />
                          )}
                        />
                      ),
                    },
                    {
                      title: 'GST %',
                      field: 'gst_percent',
                      readonly: true,
                      filtering: false,
                      sorting: false,
                      validate: (rowData) => Boolean(rowData.gst_percent),
                      editComponent: ({
                        value,
                        onChange,
                        rowData,
                        onRowDataChange,
                      }) => (
                        <Select
                          value={value}
                          style={{fontSize:headerStyle.fontSize}}
                          fullWidth
                          variant='standard'
                          onChange={(event) => {
                            onRowDataChange({
                              ...rowData,
                              gst_percent: event.target.value,
                              tax_category_id: taxcategory.filter(
                                (i) => i.tax_category === event.target.value,
                              )[0].tax_category_id,
                            });
                          }}
                        >
                          {taxcategory.map((item) => (
                            <MenuItem
                              key={item.tax_category_id}
                              value={item.tax_category}
                            >
                              {item.tax_category}
                            </MenuItem>
                          ))}
                          <MenuItem>
                            <Link
                              style={{paddingLeft: '15px'}}
                              onClick={() => {
                                setModalStatusHandler(true);
                                setModalTypeHandler('NewTaxCategory');
                              }}
                            >
                              CreateNew
                            </Link>
                          </MenuItem>
                        </Select>
                      ),
                    },
                    {
                      title: 'Incl. of GST',
                      field: 'gst_inclusive',
                      readonly: true,
                      filtering: false,
                      sorting: false,
                      render: (rowData) => {
                        return (
                          <Checkbox
                            color='primary'
                            checked={rowData.gst_inclusive === 'yes'}
                            inputProps={{
                              'aria-label': 'select all desserts',
                            }}
                          />
                        );
                      },
                      editComponent: ({
                        value,
                        onChange,
                        rowData,
                        onRowDataChange,
                      }) => (
                        <Checkbox
                          checked={value === 'yes'}
                          onChange={(e) => {
                            onRowDataChange({
                              ...rowData,
                              gst_inclusive: e.target.checked ? 'yes' : 'no',
                            });
                          }}
                          inputProps={{'aria-label': 'controlled'}}
                        />
                      ),
                    },

                    {
                      title: 'GST Amt',
                      field: 'gst_amount',
                      editable: 'never',
                      readonly: true,
                      filtering: false,
                      sorting: false,
                      type: 'numeric',
                      headerStyle: {
                        textAlign: 'center',
                      },
                      cellStyle: {
                        textAlign: 'center',
                        fontSize:cellStyle.fontSize,
                        fontWeight:cellStyle.fontWeight
                      },
                      render: (rowData) =>
                        parseFloat(rowData.gst_amount).toFixed(2),
                    },
                    {
                      title: 'Amount',
                      field: 'amount',
                      readonly: true,
                      filtering: false,
                      sorting: false,
                      headerStyle: {
                        textAlign: 'center',
                      },
                      validate: (rowData) => {
                        if(rowData.gst_inclusive !== 'yes'){
                          return rowData.amount > 0
                        }else{
                          return true
                        }
                      },
                      render: (rowData) =>
                        parseFloat(rowData.amount).toFixed(2),
                      editComponent: ({
                        value,
                        onChange,
                        rowData,
                        onRowDataChange,
                      }) => (
                        <TextField
                          value={value}
                          disabled={rowData.gst_inclusive === 'yes'}
                          type="text"
                          inputMode="decimal"
                          variant='standard'
                          // onChange={(e) => onChange(parseFloat(e.target.value))}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
                              onChange(val);
                            }
                          }}
                          onBlur={(e) => {
                            const raw = e.target.value;
                            const num = Number(raw);
                            if (!isNaN(num)) {
                              onChange(Number(num.toFixed(2)));
                            }
                          }}
                          InputProps={{
                            disableUnderline:
                              rowData.gst_inclusive === 'yes' ? true : false,
                          }}
                        />
                      ),
                    },
                    {
                      title: 'Total Amt',
                      field: 'total_amount',
                      type: 'numeric',
                      readonly: true,
                      filtering: false,
                      sorting: false,
                      headerStyle: {
                        textAlign: 'center',
                        padding: '0px',
                        minWidth: 120,
                      },
                      cellStyle: {
                        textAlign: 'right',
                        fontSize:cellStyle.fontSize,
                        fontWeight:cellStyle.fontWeight,
                        minWidth: 120,
                        whiteSpace: 'nowrap'
                      },
                      
                      validate: (rowData) => {
                        if (rowData.gst_inclusive !== 'yes') {
                          return true;
                        } else {
                          return rowData.total_amount > 0;
                        }
                      },
                      render: (rowData) =>
                        parseFloat(rowData.total_amount).toFixed(2),
                      editComponent: ({
                        value,
                        onChange,
                        rowData,
                        onRowDataChange,
                      }) => (
                        <TextField
                          value={value}
                          disabled={rowData.gst_inclusive !== 'yes'}
                          type='number'
                          variant='standard'
                          onChange={(e) => onChange(parseFloat(e.target.value))}
                          InputProps={{
                            disableUnderline:
                              rowData.gst_inclusive !== 'yes' ? true : false,
                          }}
                          inputProps={{
                            style: { textAlign: 'right' }
                         }}
                        />
                      ),
                    },
                    {
                      title: 'Reference',
                      field: 'reference',
                      readonly: true,
                      filtering: false,
                      sorting: false,
                      headerStyle: {
                        textAlign: 'center',
                      },
                      validate: (rowData) => {
                       
                      },
                      render: (rowData) =>
                       rowData.reference,
                      editComponent: ({
                        value,
                        onChange,
                        rowData,
                        onRowDataChange,
                      }) => (
                        <TextField
                          value={value}
                          type='text'
                          variant='standard'
                          onChange={(e) => onChange(e.target.value)}
                        />
                      ),
                    },
                    {
                      title: 'ITC',
                      field: 'itc_eligible',
                      filtering: false,
                      sorting: false,
                      // Non-edit rendering: compact pill + tune icon. Opens popover on click.
                      render: (rowData) => (
                        <ItcClassificationControl
                          variant="popover"
                          value={{
                            itc_eligible: rowData.itc_eligible,
                            itc_block_reason_id: rowData.itc_block_reason_id,
                            is_rcm: rowData.is_rcm,
                          }}
                          reasons={itcBlockReasons || []}
                          showRcm
                          onChange={(v) => {
                            const dataUpdate = [...tableItems];
                            const idx = rowData.tableData && rowData.tableData.index;
                            if (idx === undefined || idx < 0) return;
                            dataUpdate[idx] = { ...dataUpdate[idx], ...v };
                            setTableItems(dataUpdate);
                          }}
                        />
                      ),
                      // In inline-edit mode (onRowAdd / onRowUpdate draft), also show the control.
                      editComponent: ({ rowData, onRowDataChange }) => (
                        <ItcClassificationControl
                          variant="popover"
                          value={{
                            itc_eligible: rowData.itc_eligible,
                            itc_block_reason_id: rowData.itc_block_reason_id,
                            is_rcm: rowData.is_rcm,
                          }}
                          reasons={itcBlockReasons || []}
                          showRcm
                          onChange={(v) => onRowDataChange({ ...rowData, ...v })}
                        />
                      ),
                    },

                  ]}
                  data={tableItems}
                  title={
                    <Typography
                      variant='h6'
                      align='left'
                      style={{paddingTop: '10px', paddingBottom: '10px'}}
                    >
                      Particulars
                    </Typography>
                  }
                />
              </Grid>

              {/* Totals */}
              <Grid container spacing={2} alignItems="flex-start" paddingTop={4}>
                <>
                  <Grid
                    size={{
                      lg: 4,
                      md: 5,
                      sm: 6,
                      xs: 12
                    }}>
                    {props.status === 'Edit' && !toggleFilePicker ? (
                      <Box
                        p='30px'
                        display='flex'
                        justifyContent='center'
                        alignItems='center'
                        style={{
                          backgroundColor: '#F4F7FE',
                          width: '100%',
                          height: '80%',
                          borderRadius: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '20px'
                        }}
                      >
                        {props.EditData.recepit_file_name === 'noImage.jpg' ? (
                          <Typography
                            variant='h5'
                            style={{ margin: '5px', color: 'grey' }}
                          >
                            No image available
                          </Typography>
                        ) : (
                          <img
                            src={`${base_url}/recepits/${props.EditData.recepit_file_name}`}
                            alt={'No image'}
                            loading='lazy'
                            style={{
                              borderBottomLeftRadius: 4,
                              borderBottomRightRadius: 4,
                              display: 'block',
                              width: '100%',
                            }}
                          />
                        )}
                        <Button
                          variant='outlined'
                          style={{ color: 'grey' }}
                          onClick={() => {
                            setToggleFilePicker(true);
                          }}
                        >
                          {props.EditData.recepit_file_name === 'noImage.jpg' ? 'Add Photo' : 'Edit Photo'}
                        </Button>
                      </Box>
                    ) : (
                      // <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                      (<Box
                        // p='1px'
                        display='flex'
                        justifyContent='center'
                        alignItems='center'
                        style={{
                          backgroundColor: '#F4F7FE',
                          width: '100%',
                          height: '170px',
                          // borderRadius: '10px',
                          position: 'relative'
                        }}
                      >
                        {props.status === 'Edit' && toggleFilePicker && (
                          <IconButton
                            style={{ position: 'absolute', right: 0, top: 0 }}
                            onClick={() => {
                              setToggleFilePicker(false)
                            }}
                          >
                            <Close />
                          </IconButton>
                        )}
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            maxHeight: '180px', // inner box height control
                            overflow: 'auto',
                          }}
                        >
                          <FilePicker
                            setUploadedFiles={setUploadedFiles}
                            uploadedFiles={uploadedFiles}
                          />
                        </Box>
                      </Box>)
                      // </Grid>
                    )}

                  </Grid>
                  <Grid
                    size={{
                      lg: 8,
                      md: 7,
                      sm: 6,
                      xs: 12
                    }}>
                       <div style={{ width: '300px', marginLeft: 'auto' }}>
                    <div style={taxHeadSx}>
                      <Typography
                        variant='h6'
                        style={{ fontWeight: 'bold', margin: '5px' }}
                      >
                        Input GST :
                      </Typography>
                      <Typography
                        variant='h6'
                        style={{
                          width: '150px',
                          textAlign: 'end',
                          margin: '5px',
                        }}
                      >
                        {parseFloat(total.gst_amount).toFixed(2)} <span>₹</span>
                      </Typography>
                    </div>

                    <div style={taxHeadSx}>
                      <Typography
                        variant='h6'
                        style={{ fontWeight: 'bold', margin: '5px' }}
                      >
                        Amount :
                      </Typography>
                      <Typography
                        variant='h6'
                        style={{
                          width: '150px',
                          textAlign: 'end',
                          margin: '5px',
                        }}
                      >
                        {parseFloat(total.amount).toFixed(2)} <span>₹</span>
                      </Typography>
                    </div>
                  
                    <FormControl>
                      <RadioGroup
                        row
                        aria-label='Tax Rate'
                        value={formValues.tax_types}
                        name='tax_types'
                        onChange={handleChange}
                      >
                        <FormControlLabel value='1' control={<Radio />} label='TDS' />
                        <FormControlLabel value='0' control={<Radio />} label='TCS' />
                      </RadioGroup>
                    </FormControl>
                    {(formValues.tax_types === '1' ?
                      <>
                        <Autocomplete
                          name="tds_percent"
                          disabled={props.returnState}
                          options={tds_taxrate}
                          value={tds_taxrate.find(opt => opt.id === formValues.tds_id) || null}
                          getOptionLabel={(option) => `${option.category} [${option.tds_rate}] [${option.section}]`}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          onChange={(event, newValue) => handleChange({ target: { name: 'tds_percent', value: newValue } })}

                          renderInput={(props) => (
                            <TextField {...props} label="Select a Tax" />
                          )}
                        />
                      </> :
                      <TextField
                        id='standard-basic'
                        disabled={props.returnState}
                        value={formValues.tcs}
                        name='tcs'
                        label='TCS'
                        fullWidth={true}
                        onChange={handleChange}
                        variant='filled'
                        type='number'
                      />

                    )}
                    <hr style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} />

                    <div style={taxHeadSx}>
                      <Typography
                        variant='h6'
                        style={{ fontWeight: 'bold', margin: '5px' }}
                      >
                        Total Amount :
                      </Typography>
                      <Typography
                        variant='h6'
                        style={{
                          width: '150px',
                          textAlign: 'end',
                          margin: '5px',
                        }}
                      >
                        {floatnum(
                          Math.round(
                              total.total_amount +
                              (tcstaxes()) -
                              calculatetdsTaxAmount()
                            )
                        
                      )} <span>₹</span>
                      </Typography>
                    </div>
                    </div>
                   
                  </Grid>
                </>
              </Grid>
            </Grid>

            {/* file picker  */}
          </Grid>
          {/* </Grid>
          </Grid> */}
          
          {/* <Grid size={{ xs: 2, sm: 2, md: 2, lg: 2 }}></Grid> */}

          {/* buttons */}
          <Grid
            display='flex'
            justifyContent='end'
            gap='15px'
            paddingTop='0px'
          >
            <Button
              variant='contained'
              color='secondary'
              onClick={() => {
                setDialogOpen(true);
              }}
            >
              Close
            </Button>
            <Button
              variant='outlined'
              color='primary'
              disabled={checkInputs() ? false : true}
              onClick={() => {
                handleSubmit('save');
                
              }}
            >
              Save
            </Button>
            {props.status !== 'Edit' ? 
              <Button
                variant='contained'
                color='primary'
                disabled={checkInputs() ? false : true}
                onClick={() => {
                  handleSubmit('save_and_new');
                }}
              >
                Save & New
              </Button>  : <></>}
            
          </Grid>
        </CardContent>
        <CancelDialog
          delete={dialogOpen}
          handle={() => setDialogOpen(false)}
          close={props.handleClose}
        ></CancelDialog>
      </Card>
    </>
  );
}

