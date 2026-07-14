import { DatePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {useContext, useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getSearchByCustomerAction, getSearchByCustomersDataAction, listCustomerAction, setSearchByCustomersDataAction} from 'redux/actions/customer_actions';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import MaterialTable, {MTableAction} from 'utils/SafeMaterialTable';
import {headerStyle, cellStyle, maxBodyHeight, maxHeight} from 'utils/pageSize';
import {Close, Edit} from '@mui/icons-material';
import {listUserCreationAction} from 'redux/actions/userCreation_actions';
import {getsessionStorage} from 'pages/common/login/cookies';
import {
  createQuotationAction,
  getConfigAmountDiscountAction,
  getQuotationConfigAction,
  getQuotationSequenceAction,
} from 'redux/actions/quotation_actions';
import PropTypes from 'prop-types';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {getLeadCustomersAction} from 'redux/actions/leadManagement_actions';
import {Sales_Item_Taxes} from 'pages/sales/sales/sale_status_list';
import {listProductAction} from 'redux/actions/product_actions';
import {OpenalertActions} from 'redux/actions/alert_actions';
import {requiredFieldsAlertMessage, searchErrorMessage} from 'utils/content';
import {AdapterMoment as DataAdapter} from '@mui/x-date-pickers/AdapterMoment';
import ProductSelect from 'components/productAutoComplete';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getAppConfigDataBasedOnTypeAction } from 'redux/actions/app_config_actions';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import apiCalls from 'utils/apiCalls';

function NewQuotationForm(props) {
  const storage = getsessionStorage();
  const dispatch = useDispatch();
  const {
    customerReducer: {customer},
    UserCreationReducer: {createUser},
    quotationReducer: {quotationSequence, quotationConfigAmountDiscount},
    leadManagementReducers: {getLeadsCustomers, allLeads},
    productReducer: {product},
    appConfigReducer: { app_config_data_based_on_type }
  } = useSelector((state) => state);
  const currentDate = moment();
  const cancelActionRef = useRef(null);
  const bulkEditRef = useRef(null);
  const addActionRef = useRef(null);
  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(
    CreateNewButtonContext,
  );

  const [editDate, setEditDate] = useState(false);
  const [hoverDate, setHoverDate] = useState(false);
  const [customerSearchText, setCustomerSearchText] = useState('')

  const [formValues, setFormValues] = useState({
    customer: null,
    quotationFor: null,
    reference: null,
    expiry: null,
    paymentTerms: null,
    deliveryTerms: null,
    quotationDate: currentDate,
    terms: null,
    contact: null,
    discount_type: null,
    discount: null
  });
  const [formErrors, setFormErrors] = useState({
    customer: null,
    expiry: null,
    quotationDate: null,
    terms: null,
    products: null,
    contact: null,
  });
  const requiredFields = [
    'customer',
    'expiry',
    'terms',
    'contact',
  ];
  const expiryOptions = [
    '1 Week',
    '2 Weeks',
    '3 Weeks',
    '30 Days',
    '60 Days',
    '90 Days',
    '120 Days',
  ];

  const [tempValues, setTempValues] = useState({
    product: null,
    description: null,
    quantity: null,
    price: null,
    discount_type: null,
    discount: null,
    net_price: null,
    total: null,
  });

  const [quotation, setQuotation] = useState([]);
  const [deleteDilaog, setDeleteDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(0);

  const tempInsert = {
    quantity: 0,
    description: '',
    discount: 0,
    discount_type: null,
    hsn_code: '',
    is_serialized: 0,
    cost_price: 0,
    item_id: 0,
    unit_price: '',
    price: '',
    cost_price_includes_gst: '',
    netPrice: 0,
    received_quantity: 0,
    receiving_quantity: 0,
    line: quotation.length + 1,
    lots: [],
    name: '',
    brand: '',
    qty_per_pack: 0,
    sales_item_taxes: [],
    stock_type: 0,
    sub_total: '',
    taxes: [],
    taxes_name: '',
    total: '',
  };

  useEffect(() => {
    const data = {
      searchString: '',
      type_details: 'customer',
      type: 1,
      pageCount: 0,
      numPerPage: 15,
    };
    // dispatch(listCustomerAction());
    dispatch(listUserCreationAction());
    dispatch(getConfigAmountDiscountAction());
    dispatch(
      getQuotationSequenceAction(setModalTypeHandler, setLoaderStatusHandler),
    );
    // dispatch(getLeadCustomersAction());
    dispatch(listProductAction());
    dispatch(setSearchByCustomersDataAction([]))

    if (props?.type === 'details') {
      setFormValues((prevData) => ({
        ...prevData,
        customer: props?.data?.customer_id,
      }));
    }
  }, []);

  useEffect(() => {
    setQuotation([tempInsert]);
  }, [formValues.products]);

  useEffect(() => {
    if (createUser.length > 0) {
      const userEmployeeId = storage?.employee_id;
      const user = createUser.find((d) => d?.employee_id === userEmployeeId);
      setFormValues((prev) => ({...prev, contact: user?.employee_id}));
    }
  }, [createUser]);

  const calculateTotal = (e, name, rowData, newValue) => {
        console.log(e.target.value, name, rowData, 'totallll');
    const discountType = name === 'discountType' ? newValue : rowData.discount_type;
    const price = name === 'price' ? e.target.value : rowData.price
    const quantity = name === 'quantity' ? e.target.value : rowData.quantity
    if (discountType === 1) {
      const discount = name === 'discount' ? e.target.value : rowData.discount || 0 ;
      const netPrice = price - discount;
      const total = netPrice * quantity;
      return total.toFixed(2);
    } else {
      const discount = name === 'discount' ? e.target.value : rowData.discount || 0 ;
      const discountPrice = (discount / 100) * price;
      const netPrice = price - discountPrice;
      const total = netPrice * quantity;
      return total.toFixed(2);
    }
  };

  const calculateNetPrice = (e, name, rowData, newValue) => {
    console.log(e.target.value, name, rowData, 'rowdTATATATQA');
    const discountType =
      name === 'discountType' ? newValue : rowData.discount_type;
    const price = name === 'price' ? e.target.value : rowData.price
    if (discountType === 1) {
      const discount =
        name === 'discount' ? e.target.value : rowData.discount || 0 ;
      const netPrice = price - discount;
      return netPrice.toFixed(2);
    } else {
      const discount =
        name === 'discount' ? e.target.value : rowData.discount || 0 ;
      const discountPrice = (discount / 100) * price;
      const netPrice = price - discountPrice;
      return netPrice.toFixed(2);
    }
  };

  const handleChange = (name, value) => {
    setFormValues((prev) => ({...prev, [name]: value}));
    if (requiredFields.includes(name)) {
      if (value !== null && value !== '') {
        setFormErrors((prev) => ({...prev, [name]: null}));
      } else {
        setFormErrors((prev) => ({...prev, [name]: `${name} is Required`}));
      }
    }
  };

  const handleDateChange = (name, value) => {
    if (value === null) {
      setFormValues({...formValues, [name]: null});
      setFormErrors({...formErrors, [name]: `Quotation Date is Required`});
    } else if (!value?._isValid) {
      setFormValues({...formValues, [name]: null});
      setFormErrors({...formErrors, [name]: `Quotation Date is Invalid`});
    } else {
      setFormValues({
        ...formValues,
        [name]: value,
      });
      setFormErrors({...formErrors, [name]: null});
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    let isValid = true;
    let formErrorsObj = {...formErrors};

    Object.keys(formValues).forEach((key) => {
      if (
        requiredFields.includes(key) && (formValues[key] === null ||
        formValues[key] === 'null' ||
        formValues[key] === '')
      ) {
        isValid = false;
        formErrorsObj[key] = `${key} is Required`;
      }
      if (quotation.length === 0) {
        isValid = false;
        formErrorsObj[key] = 'Products is Required';
      }
    });

    quotation.forEach((e) => {
  const isCompletelyEmpty =
    e.name === '' &&
    e.quantity === '' &&
    e.price === '' &&
    e.netPrice === 0 &&
    e.total === '';


  if (!isCompletelyEmpty) {
    if (
      e.name === '' ||
      e.quantity === 0 ||
      e.price === '' ||
      e.netPrice === 0 ||
      e.total === ''
    ) {
      isValid = false;
    }
  }
});

    setFormErrors(formErrorsObj);

    if (isValid) {
      let status = 'Approved';
      const isSalesmanUser =
        String(storage?.role_name || '').toLowerCase() === 'salesman';

      if (isSalesmanUser) {
        status = 'Waiting For Approval';
      }

      const total = quotation.reduce(
        (count, item) => count + parseInt(item.total || 0),
        0,
      );
      if (quotationConfigAmountDiscount.length > 0) {
        // For subTotal exceed
        if (
          quotationConfigAmountDiscount[0].maxQuotationAmount &&
          parseInt(total) >
            parseInt(quotationConfigAmountDiscount[0].maxQuotationAmount)
        ) {
          status = 'Waiting For Approval';
        }
        // For Discount exceed
        const isDiscountExceeded = quotation.some(
          (product) =>
            parseInt(product.discount) >
            parseInt(quotationConfigAmountDiscount[0].maxProductDiscount),
        );
        if (isDiscountExceeded) {
          status = 'Waiting For Approval';
        }
        console.log('jheu1', isDiscountExceeded, quotation.some(
          (product) =>
            parseInt(product.discount) >
            parseInt(quotationConfigAmountDiscount[0].maxProductDiscount),
        ))
      }
      console.log('jheu', quotationConfigAmountDiscount)
      let payload = {
        ...formValues,
        quotationDate: formValues.quotationDate ? moment(formValues.quotationDate).format('YYYY-MM-DD') : null,
        products: quotation.map((e) => ({
          ...e,
          product: e.name,
          item_id: e.item_id,
          description: e.description,
          discount: e.discount,
          discountType: e.discountType,
          netPrice: e.netPrice,
          price: e.price,
          quantity: e.quantity,
          total: e.total,
        })),
        quotation_number: quotationSequence?.sequence,
        status: status,
        subTotal: quotation.reduce(
          (count, item) => count + parseInt(item.total || 0),
          0,
        ),
      };
      await dispatch(createQuotationAction(payload));
      props.handleClose();
    } else {
      dispatch(
        OpenalertActions({
          msg: requiredFieldsAlertMessage,
          severity: 'warning',
        }),
      );
    }
  };

  const handleDeleteDialogOpen = (index) => {
    setDeleteDialog(true);
    setDeleteIndex(index);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialog(false);
  };

  const deleteProductRowData = async (index) => {
    if (quotation.length > 1) {
      const updatedTransaction = [...quotation];
      updatedTransaction.splice(index, 1);
      await setQuotation(updatedTransaction);
      setDeleteDialog(false);
    }
  };

  const handleCustomerSearchAPICall = (searchText) => {
    if(searchText.length >= 3) {
      const payload = {
          searchString: searchText
      }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getSearchByCustomersDataAction(payload))
      )
      setCustomerSearchText('')
    }
    else {
      dispatch(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
    }
  }

  const handleCloseCustomerDetails = () => {
    setFormValues((prev) => ({
      ...prev,
      customer: null
    }))
    setCustomerSearchText('')
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(setSearchByCustomersDataAction([]))
    )
  }

  const handleAutoSearchApicall = (searchText) => {
    dispatch(setSearchByCustomersDataAction([]))
    const payload = {
      searchString: searchText,
    }
    dispatch(getSearchByCustomerAction(
      payload,
      setModalTypeHandler,
      setLoaderStatusHandler
    ))
  }

  const disableSubmit = quotation.some((item) => {
    return (item.name === '' || item.quantity === '' || item.quantity === 0 || item.price === '')
  })

  return (
    <Card sx={{p: 3, overflow: 'scroll', height: 'calc(100vh - 80px)'}}>
      <Grid container spacing={3}>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid container spacing={3}>
            <Grid
              sx={{pt: 3, pl: 4}}
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              <Typography
                variant='h6'
                align='left'
                style={{margin: '0 0 5px 0'}}
              >
                New Quotation - {quotationSequence?.sequence || ''}
              </Typography>
            </Grid>

            <Grid
              sx={{ display: 'flex', justifyContent: 'flex-end'}}
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              {editDate ? (
                <ClickAwayListener
                  onClickAway={() => {
                    setEditDate(false);
                    setHoverDate(false);
                  }}
                >
                  <Box>
                    <LocalizationProvider dateAdapter={DataAdapter}>
                      <DateTimePicker
                        format='DD-MM-YYYY'
                        // disabled={props.status === 'edit'}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: 'filled',
                            onBlur: () => setEditDate(false),
                            inputProps: {
                              readOnly: true,
                            },
                          },
                        }}
                        value={
                          formValues.quotationDate
                            ? moment(formValues.quotationDate)
                            : moment()
                        }
                        onChange={(newValue) => {
                          if (newValue) {
                            handleDateChange('quotationDate', newValue);
                            setEditDate(false);
                            setHoverDate(false);
                          }
                        }}
                        label={'Quotation Date'}
                      />
                    </LocalizationProvider>
                  </Box>
                </ClickAwayListener>
              ) : (
                <Box
                  onClick={() => setEditDate(true)}
                  onMouseEnter={() => setHoverDate(true)}
                  onMouseLeave={() => setHoverDate(false)}
                  sx={{
                    display: 'inline-block',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: hoverDate ? '6px' : '0px',
                    border: hoverDate ? '1px solid #ccc' : 'none',
                    backgroundColor: hoverDate ? '#fff' : 'transparent',
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <Typography variant='h6' onClick={() => setEditDate(true)}>
                    {'QO'} : {moment(formValues.quotationDate).format('DD/MM/YYYY')}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Grid>

        <Grid
          size={{
            lg: props.type === 'details' ? 0 : 12,
            md: props.type === 'details' ? 0 : 12,
            sm: props.type === 'details' ? 0 : 12,
            xs: props.type === 'details' ? 0 : 12
          }}>
          <Grid container spacing={3}>
            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <Autocomplete
                disableClearable
                freeSolo={customerSearchText.length <= 3}
                inputValue={customerSearchText}
                onInputChange={(event, newInputValue, reason) => {
                  if(reason === 'input') {
                    setCustomerSearchText(newInputValue)
                    if(newInputValue !== '') {
                      handleAutoSearchApicall(newInputValue)
                    }
                    if(newInputValue === '') {
                      setFormValues((prev) => ({...prev, customer: null}))
                      apiCalls(
                          setModalTypeHandler,
                          setLoaderStatusHandler,
                          dispatch(setSearchByCustomersDataAction([]))
                      )
                    }
                  }
                }}
                value={
                  // customerSearchText
                  //   ? { company_name: customerSearchText } :
                  customer?.find(
                    (e) => formValues?.customer === e?.customer_id,
                  ) || null
                }
                options={(customer || []).filter(
                  (option) => option.company_name,
                )}
                getOptionLabel={(option) => option.company_name}
                disabled={props.type === 'details'}
                onChange={(event, newValue) => {
                  handleChange('customer', newValue.customer_id)
                  setCustomerSearchText(newValue?.company_name || '')
                }}
                renderInput={(params) => {
                  const { InputProps, ...rest } = params
                  let startAdornment = null
                  return (
                  <TextField
                    {...params}
                    label='Select Customer'
                    variant='filled'
                    required
                    fullWidth
                    error={formErrors.customer !== null}
                    helperText={
                      formErrors.customer !== null ? 'Customer is Required' : ''
                    }
                    slotProps={{
                      input: {
                        ...InputProps,
                        startAdornment: startAdornment,
                        endAdornment: (
                          <>
                              {
                                  formValues.customer === null ?
                                  // <IconButton
                                  //     size="small"
                                  //     onClick={() => {
                                  //         handleCustomerSearchAPICall(customerSearchText)
                                  //     }}
                                  // >
                                  //     <SearchIcon />
                                  // </IconButton> 
                                  '' : 
                                  <IconButton
                                      size="small"
                                      onClick={() => {
                                          handleCloseCustomerDetails()
                                      }}
                                  >
                                      <CloseIcon />
                                  </IconButton>
                              }
                              {InputProps.endAdornment}
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
                sm: 4,
                xs: 12
              }}>
              <TextField
                value={formValues.quotationFor}
                onChange={(event) =>
                  handleChange('quotationFor', event.target.value)
                }
                variant='filled'
                label='Subject'
                fullWidth
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                value={formValues.reference}
                onChange={(event) =>
                  handleChange('reference', event.target.value)
                }
                variant='filled'
                label='Reference'
                fullWidth
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <Autocomplete
                value={formValues.expiry}
                options={expiryOptions}
                onChange={(event, newValue) => handleChange('expiry', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Expiry'
                    variant='filled'
                    required
                    fullWidth
                    error={formErrors.expiry !== null}
                    helperText={
                      formErrors.expiry !== null ? 'Expiry is Required' : ''
                    }
                  />
                )}
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                value={formValues.paymentTerms}
                onChange={(event) =>
                  handleChange('paymentTerms', event.target.value)
                }
                variant='filled'
                label='Payment Terms'
                fullWidth
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                value={formValues.deliveryTerms}
                onChange={(event) =>
                  handleChange('deliveryTerms', event.target.value)
                }
                variant='filled'
                label='Delivery Terms'
                fullWidth
              />
            </Grid>

            {/* <Grid size={{ xs: 12, sm: 4, md: 4, lg: 3 }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  label = 'Quotation Date'
                  value = {formValues.quotationDate}
                  onChange = {(event) => handleDateChange('quotationDate', event)}
                  renderInput = {(params) => (
                    <TextField
                      {...params}
                      required
                      fullWidth
                      variant = 'filled'
                      error = {formErrors.quotationDate !== null}
                      helperText = {formErrors.quotationDate !== null ? formErrors.quotationDate : ''}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid> */}

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <Autocomplete
                value={
                  createUser.find(
                    (e) => formValues.contact === e?.employee_id,
                  ) || ''
                }
                options={createUser}
                getOptionLabel={(option) =>
                  option.last_name
                    ? `${option.first_name} ${option.last_name}`
                    : option.first_name || ''
                }
                onChange={(event, newValue) =>
                  handleChange('contact', newValue?.employee_id)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Contact'
                    variant='filled'
                    required
                    fullWidth
                    error={formErrors.contact !== null}
                    helperText={
                      formErrors.contact !== null ? 'Contact is Required' : ''
                    }
                  />
                )}
              />
            </Grid>

            {/* <Grid size={{ xs: 12, sm: 4, md: 4, lg: 3 }}>
              <TextField
                value = {formValues.terms}
                onChange = {(event) => handleChange('terms', event.target.value)}
                variant = 'filled'
                label = 'Terms'
                fullWidth
                rows = {3}
                multiline
                required
                error = {formErrors.terms !== null}
                helperText = {formErrors.terms !== null ? 'Terms is Required' : ''}
              />
            </Grid> */}

            <Grid
              sx={{'& .MuiPaper-root': {maxHeight: '500px !important'}}}
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Grid
                container
                display='flex'
                justifyContent='space-between'
                alignItems='center'
                mb={2}
              >
                <Grid>
                  <Typography variant='h6'>Product List</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Box>
            <Table>
              <TableHead style={{backgroundColor: '#e8e8e8'}}>
                <TableRow style={{marginLeft: '10px'}}>
                  <TableCell width='25%'>Product *</TableCell>
                  {
                    <>
                      <TableCell width='15%'>Desc</TableCell>
                    </>
                  }
                  {
                    <TableCell style={{textAlign: 'right'}} width='10%'>
                      {' '}
                      Qty *
                    </TableCell>
                  }
                  <TableCell style={{textAlign: 'right'}} width='10%'>
                    Price *
                  </TableCell>
                  { app_config_data_based_on_type.find(d => d.key_name === 'company.saleDiscount').value === 'At Item Level' &&
                    <>
                      <TableCell style={{textAlign: 'right'}} width='10%'>
                        Discount Type
                      </TableCell>
                    
                      <TableCell style={{textAlign: 'right'}} width='10%'>
                        Discount
                      </TableCell>
                    </>
                  }
                  <TableCell style={{textAlign: 'right'}} width='5%'>
                    Net Price
                  </TableCell>
                  <TableCell style={{textAlign: 'right'}} width='8%'>
                    Total
                  </TableCell>
                  <TableCell width='5%'>{''}</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {quotation.length > 0 &&
                  quotation.map((rowData, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell style={{height: '60px'}}>
                          <Autocomplete
                            options={product}
                            getOptionLabel={(option) => option?.name || ''}
                            value={
                              product.find(
                                (p) => p.item_id === rowData.item_id,
                              ) || null
                            }
                            onChange={(event, newValue) => {
                              if (newValue) {
                                setQuotation((prev) =>
                                  prev.map((d, i) => {
                                    if (i === index) {
                                      return {
                                        ...d,
                                        name: newValue.name,
                                        brand: newValue.brand,
                                        cost_price: newValue.cost_price,
                                        unit_price: newValue.unit_price,
                                        item_id: newValue.item_id,
                                        hsn_code: newValue.hsn_code,
                                        is_serialized: newValue.is_serialized,
                                        stock_type: newValue.stock_type,
                                        qty_per_pack: newValue.qty_per_pack,
                                        taxes: newValue.taxes,
                                        cost_price_includes_gst:
                                          newValue.cost_price_includes_gst,
                                      };
                                    }
                                    return d;
                                  }),
                                );
                              }
                            }}
                            renderInput={(params) => (
                              <TextField {...params} variant='standard' />
                            )}
                          />
                        </TableCell>

                        <TableCell style={{height: '60px'}}>
                          <TextField
                            value={rowData.description || ''}
                            variant='standard'
                            onChange={(e) => {
                              const value = e.target.value;
                              const updatedSaleItems = quotation.map((d, i) => {
                                if (index === i) {
                                  return {
                                    ...d,
                                    description: value,
                                  };
                                } else {
                                  return d;
                                }
                              });
                              setQuotation(updatedSaleItems);
                            }}
                          />
                        </TableCell>

                        <TableCell style={{height: '60px'}}>
                          <TextField
                            name='quantity'
                            value={rowData.quantity || ''}
                            inputProps={{ min: 0 }}
                            type='number'
                            InputProps={{
                              sx: {
                                textAlign: 'right',
                                input: {textAlign: 'right'},
                              },
                            }}
                            variant='standard'
                            onChange={(e) => {
                              const value = e.target.value;
                              const updatedSaleItems = quotation.map((d, i) => {
                                if (index === i) {
                                  return {
                                    ...d,
                                    quantity: value,
                                    total: calculateTotal(
                                      e,
                                      'quantity',
                                      rowData,
                                    )
                                  };
                                } else {
                                  return d;
                                }
                              });
                              setQuotation(updatedSaleItems);
                            }}
                            // error={}
                            // helperText={showError ? `Available ${availableQty} Qty` : ''}
                          />
                        </TableCell>

                        <TableCell style={{height: '60px'}}>
                          <TextField
                            name='price'
                            value={rowData.price || ''}
                            type='number'
                            inputProps={{ min: 0 }}
                            InputProps={{
                              sx: {
                                textAlign: 'right',
                                input: {textAlign: 'right'},
                              },
                            }}
                            variant='standard'
                            onChange={(e) => {
                              const value = e.target.value;
                              const updatedSaleItems = quotation.map((d, i) => {
                                if (index === i) {
                                  return {
                                    ...d,
                                    price: value,
                                    netPrice: calculateNetPrice(
                                      e,
                                      'price',
                                      rowData,
                                    ),
                                    total: calculateTotal(
                                      e,
                                      'price',
                                      rowData,
                                    )
                                  };
                                } else {
                                  return d;
                                }
                              });
                              setQuotation(updatedSaleItems);
                            }}
                          />
                        </TableCell>

                        {
                          app_config_data_based_on_type.find(d => d.key_name === 'company.saleDiscount').value === 'At Item Level' &&
                          <>
                            {/* <TableCell style={{height: '60px'}}>
                              <FormControl>
                                <RadioGroup
                                  row
                                  name='discountType'
                                  value={rowData.discount_type || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const updatedSaleItems = quotation.map(
                                      (d, i) => {
                                        if (index === i) {
                                          return {
                                            ...d,
                                            discount_type: value,
                                            netPrice: calculateNetPrice(
                                              e,
                                              'discountType',
                                              rowData,
                                            ),
                                            total: calculateTotal(
                                              e,
                                              'discountType',
                                              rowData,
                                            ),
                                          };
                                        } else {
                                          return d;
                                        }
                                      },
                                    );
                                    setQuotation(updatedSaleItems);
                                  }}
                                >
                                  <FormControlLabel
                                    value='percent'
                                    control={<Radio />}
                                    label='Perc %'
                                  />
                                  <FormControlLabel
                                    value='flat'
                                    control={<Radio />}
                                    label='Flat'
                                  />
                                </RadioGroup>
                              </FormControl>
                            </TableCell> */}

                            <TableCell>
                              <Autocomplete
                                value={[{id: 0, value: '%'}, {id: 1, value:'₹'}].find(d => d.id === rowData.discount_type)}
                                options={[{id: 0, value: '%'}, {id: 1, value:'₹'}]}
                                getOptionLabel={(option) => option.value}
                                onChange={(event, newValue) => {
                                  const updatedQuotation = quotation.map((d, i) => {
                                    if(index === i){
                                      return{
                                        ...d,
                                        discount_type: newValue.id,
                                        netPrice: calculateNetPrice(
                                          event,
                                          'discountType',
                                          rowData,
                                          newValue.id
                                        ),
                                        total: calculateTotal(
                                          event,
                                          'discountType',
                                          rowData,
                                          newValue.id
                                        ),
                                      }
                                    }
                                    else{
                                      return d
                                    }
                                  })
                                  setQuotation(updatedQuotation)
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        { ...params }
                                        variant='standard'
                                        fullWidth
                                    />
                                )}
                              />
                            </TableCell>

                            <TableCell style={{height: '60px'}}>
                              <TextField
                                name='discount'
                                value={rowData.discount || ''}
                                inputProps={{ min: 0 }}
                                type='number'
                                InputProps={{
                                  sx: {
                                    textAlign: 'right',
                                    input: {textAlign: 'right'},
                                  },
                                }}
                                variant='standard'
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const updatedSaleItems = quotation.map((d, i) => {
                                    if (index === i) {
                                      return {
                                        ...d,
                                        discount: value,
                                        netPrice: calculateNetPrice(
                                          e,
                                          'discount',
                                          rowData,
                                        ),
                                        total: calculateTotal(
                                          e,
                                          'discount',
                                          rowData,
                                        ),
                                      };
                                    } else {
                                      return d;
                                    }
                                  });
                                  setQuotation(updatedSaleItems);
                                }}
                              />
                            </TableCell>
                          </>
                        }

                        <TableCell sx={{ minWidth: 120, whiteSpace: 'nowrap' }}>
                          <TextField
                            name='netPrice'
                            value={rowData.netPrice || ''}
                            type='number'
                            inputProps={{ min: 0 }}
                            InputProps={{
                              sx: {
                                textAlign: 'right',
                                input: {textAlign: 'right'},
                              },
                            }}
                            variant='standard'
                            onChange={(e) => {
                              const value = e.target.value;
                              const updatedSaleItems = quotation.map((d, i) => {
                                if (index === i) {
                                  return {
                                    ...d,
                                    netPrice: value,
                                  };
                                } else {
                                  return d;
                                }
                              });
                              setQuotation(updatedSaleItems);
                            }}
                          />
                        </TableCell>

                        <TableCell sx={{ minWidth: 120, whiteSpace: 'nowrap' }}>
                          <TextField
                            name='total'
                            value={rowData.total || ''}
                            type='number'
                            inputProps={{ min: 0 }}
                            InputProps={{
                              sx: {
                                textAlign: 'right',
                                input: {textAlign: 'right'},
                              },
                            }}
                            variant='standard'
                            onChange={(e) => {
                              const value = e.target.value;
                              const updatedSaleItems = quotation.map((d, i) => {
                                if (index === i) {
                                  return {
                                    ...d,
                                    total: value,
                                  };
                                } else {
                                  return d;
                                }
                              });
                              setQuotation(updatedSaleItems);
                            }}
                          />
                        </TableCell>

                        <TableCell style={{height: '60px'}}>
                          <Stack flexDirection='row'>
                            {quotation.length > 1 && (
                              <IconButton
                                onClick={
                                  rowData.name.length > 0
                                    ? () => handleDeleteDialogOpen(index)
                                    : () => deleteProductRowData(index)
                                }
                              >
                                <DeleteIcon sx={{color: '#f04f47'}} />
                              </IconButton>
                            )}

                            {index === quotation.length - 1 && (
                              <IconButton
                                onClick={() =>
                                  setQuotation((prev) => [...prev, tempInsert])
                                }
                              >
                                <AddIcon />
                              </IconButton>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </Box>
        </Grid>

        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid
            container
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <Grid>
              <Typography variant='h6'>
                {`Sub Total : ${quotation.reduce(
                  (count, item) => count + parseInt(item.total || 0),
                  0,
                )}`}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

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
                lg: 6,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              <TextField
                fullWidth
                name='terms'
                variant='outlined'
                size='small'
                onChange={(event) => handleChange('terms', event.target.value)}
                value={formValues.terms}
                label='Terms'
                minRows={2}
                error={!!formErrors.terms}
                helperText={formErrors.terms}
                required
                multiline
              />
            </Grid>

            {
              app_config_data_based_on_type.find(d => d.key_name === 'company.saleDiscount').value === 'At Transaction Level' &&
              <Grid size={6}>
                <Grid container spacing={3} display='flex' justifyContent='flex-end'>
                  <Grid size={4}>
                    <Autocomplete
                      value={[{id: 0, value: '%'}, {id: 1, value:'₹'}].find(d => d.id === formValues.discount_type)}
                      options={[{id: 0, value: '%'}, {id: 1, value:'₹'}]}
                      getOptionLabel={(option) => option.value}
                      onChange={(event, newValue) => {
                        setFormValues((prev) => ({ ...prev, discount_type: newValue.id }))
                      }}
                      renderInput={(params) => (
                          <TextField
                              { ...params }
                              variant='filled'
                              label='Discount Type'
                              fullWidth
                          />
                      )}
                    />
                  </Grid>

                  <Grid size={4}>
                    <TextField
                      variant='filled'
                      type='number'
                      label='Discount'
                      fullWidth
                      value={formValues.discount}
                      onChange={(event) => {
                          setFormValues((prev) => ({ ...prev, discount: event.target.value }))
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            }
          </Grid>
        </Grid>

        <Grid
          size={{
            lg: props.type === 'details' ? 0 : 2,
            md: props.type === 'details' ? 0 : 2,
            sm: props.type === 'details' ? 0 : 2,
            xs: props.type === 'details' ? 0 : 2
          }}></Grid>

        <Dialog open={deleteDilaog}>
          <DialogContent style={{width: 500}}>
            <DialogContentText>
              Are you sure want to delete the product ?
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button
              variant='contained'
              color='error'
              onClick={handleDeleteDialogClose}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              color='error'
              onClick={() => deleteProductRowData(deleteIndex)}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid container display='flex' justifyContent='flex-end' spacing={3}>
            <Grid>
              <Button
                variant='contained'
                color='error'
                onClick={() => props.handleClose()}
              >
                Cancel
              </Button>
            </Grid>

            <Grid>
              <Button variant='contained' onClick={handleSubmit} disabled={disableSubmit}>
                Submit
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );
}

NewQuotationForm.propTypes = {
  handleClose: PropTypes.func,
};

export default NewQuotationForm;

