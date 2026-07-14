import React, { useContext, useEffect } from 'react';
import DataGridTemp from 'components/dataGridTemp';
import { get_search_company_based_employee, getEmpbasecompanyAction, getSearchOverTimeReportAction, set_search_company_based_employee, setSearchOverTimeReportAction } from 'redux/actions/attendance_actions';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import FilterPossale from 'pages/pointofsale/posSale/FilterPossale';
import CommonFilter from 'components/pos/payment_section/CommonFilter';
import moment from 'moment';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import { useNavigate } from 'react-router-dom';
import { Autocomplete, Box, Button, Card, Dialog, DialogContent, FormControl, FormControlLabel, Grid, IconButton, Menu, MenuItem, Radio, RadioGroup, TextField, Tooltip, Typography } from '@mui/material';
import JobCard from './jobCard';
import { addretailcustomerinteractionaction, addretailServiceAction, clearEditDataAction, getretailServiceAction, updateretailServiceAction } from 'redux/actions/retail_service_action';
import context from '../../../context/CreateNewButtonContext'
import { EDIT_RETAIL_SERVICE } from 'redux/actionTypes';
import AddIcon from '@mui/icons-material/Add';
import ProductDetail from './productDetail';
import MenuIcon from '@mui/icons-material/Menu';
import RepairAndParts from './repairAndParts';
import { Add } from '@mui/icons-material';
import IssueDetail from './issueDetail';
import CommonUserAutoCompleteForSingleUser from 'utils/commonAutoCompleteForSingleUser';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PaymentDialog from './paymentDialog'
import { getsessionStorage } from 'pages/common/login/cookies';
import ServiceFilter from './serviceFilter';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import apiCalls from 'utils/apiCalls';

const initialFormValues = {
  job_name: '',
  mobile_number: '',
  status: 'open',
  notes: '',
  customer_id: '',
  service_type_id: '',
  engineer_name: '',
  assigned_date: '',
  approx_estimate: '',
  product_condition: '',
  advance_amount: '',
  target_delivery: '',
  warranty: '',
  brand: '',
  model: '',
  serial: '',
  date_of_purchase: '',
  type: '',
  issue: '',
  remarks: '',
  quantity: '',
  issueDynamicProp: {},
}

export default function ServiceMenu() {
  const navigate = useNavigate()
  const {
    commoncookie,
    setModalStatusHandler,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);
  const yesterday = new Date();
  const { retailServiceReducer: { listRetailService, numRows, editdata }, productReducer: { product }, attendanceReducer: { get_empbasecompany, searchCompanyBasedEmployeeFilter }, rbacReducer: { menuAccess } } = useSelector((state) => state);
  console.log(listRetailService, editdata, 'retailreducer')
  yesterday.setDate(yesterday.getDate() - 1);

  const date = new Date();
  const defaultFrom = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const lastDayOfPreviousMonth = new Date(date.getFullYear(), date.getMonth(), 0);
  const defaultTo = new Date(lastDayOfPreviousMonth.getFullYear(), lastDayOfPreviousMonth.getMonth(), lastDayOfPreviousMonth.getDate());
  const currentMonthFirstDate = new Date(date.getFullYear(), date.getMonth(), 1);

  const [filterDate, setFilterDate] = useState({
    from: defaultFrom,
    to: defaultTo
  });
  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');
  const [selectedPayment, setSelectedPayment] = useState({})
  const [dates, setDates] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [status, setStatus] = useState(null);
  const [searchVal, setSearchVal] = useState('')
  const [pageCount, setPageCount] = useState(0)
  const [openFilter, setOpenFilter] = useState(false);
  const [pageSize, setPageSize] = useState(20)
  const [editData, setEditData] = useState([])
  console.log(editData, 'editData')
  const [openNew, setOpenNew] = useState(false)
  const [Selectedproduct, setselectedProduct] = useState([]);
  const [productDynamicProp, setProductDynamicProp] = useState([])
  const [currentProduct, setCurrentProduct] = useState(null);
  const [value1, setValue1] = React.useState([]);
  const isValidValue1 = value1.length > 0 && !value1.every(item => item === null);
  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  // const [productOpen, setProductOpen] = useState(false);
  const [repairOpen, setRepairOpen] = useState(false);
  const [IssueOpen, setIssueOpen] = useState(false);
  const [AssignOpen, setAssignOpen] = useState(false);
  const [paymentCard, setPaymentCard] = useState(false)
  const [paymentType, setPaymentType] = useState('');
  const [partPaymentAmount, setPartPaymentAmount] = useState('');
  const [selectedDaysAgo, setSelectedDaysAgo] = useState(0);
  const [selectedRow, setSelectedRow] = useState(null);
  console.log(selectedRow, 'selerow')
  const [issuedata, setissuedata] = useState([]);
  const [serviceid, setserviceid] = useState(null)
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const formattedDate = moment(currentDateTime).format('DD-MM-YYYY');
  const formattedTime = moment(currentDateTime).format("hh:mm A");

  let user = getsessionStorage()
  
  const [formValues, setFormValues] = useState(initialFormValues)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [sales_items, setsales_items] = useState([])
  const [cusFormValues, setCusFormValues] = useState({
    customer_name: "",
    contact_by: "",
    note: ""
  });
  const [issueformData, setissueFormData] = useState({
    service_agent: null,
    service_assetName: null,
    service_startDateAndTime: null,
    service_endDateAndTime: null,
    service_dynamicPropValues: []
  })
  const [issueformErrors, setissueFormErrors] = useState({
    service_agent: null,
    service_assetName: null,
    service_startDateAndTime: null,
    service_endDateAndTime: null,
    serviceImage: null,
    service_dynamicPropErrors: []
  })
  const dispatch = useDispatch();

  useEffect(() => {
    let data = {
      page: pageCount,
      per_page: pageSize
    }
    dispatch(getretailServiceAction(data, setModalTypeHandler, setLoaderStatusHandler))
  }, [pageCount, pageSize])

  useEffect(() => {
    if (!get_empbasecompany.length) {
      dispatch(getEmpbasecompanyAction())
    }
  },[])
 const storage = getsessionStorage();
  const selectedRole = storage.role_name
    useEffect(() => {
      if (!selectedRole) return;
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
    }, [selectedRole, dispatch]);
  
  const serviceCreate =  UserRightsAuthorization(menuAccess[selectedRole], 'services__new_service', 'can_create')
  const serviceUpdate =  UserRightsAuthorization(menuAccess[selectedRole], 'services__new_service', 'can_update')
  const serviceDelete = UserRightsAuthorization(menuAccess[selectedRole], 'services__new_service', 'can_delete') 

  const quickDates = [
      { label: 'Today', daysAgo: 0 },
      { label: 'Yesterday', daysAgo: 1 },
      { label: moment().subtract(2, 'days').format('DD MMM'), daysAgo: 2 },
      { label: moment().subtract(3, 'days').format('DD MMM'), daysAgo: 3 },
      { label: moment().subtract(4, 'days').format('DD MMM'), daysAgo: 4 },
      { label: moment().subtract(5, 'days').format('DD MMM'), daysAgo: 5 },
    ];

  const handleClick = (event, row) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const requestSearchEmployeeFilter = (val) => {
    setSearchValEmployeeFilter(val);
    dispatch(set_search_company_based_employee([]));
    if (!val) {
      return
    }
    let data = {
      searchString: val
    }
    dispatch(
      get_search_company_based_employee(
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
  };
  const handleMenuItemClick = (option) => {
    if (option === 'Customer') {
      handleAdd(selectedRow);
    }
    // if (option === 'Product') {
    //   handleProduct(selectedRow);
    // }
    if (option === 'Repair') {
      handleRepair(selectedRow);
    }
    if (option === 'Issue') {
      handleIssue(selectedRow);
    }
    if (option === 'Assign') {
      handleAssign(selectedRow);
    }
    handleClose();
  };

  const handleChangeEmployeeName = (val) => {
    setValue1(val)
  }

  const handleApply = ({ fromDate, toDate, customer, status }) => {
  console.log('Filter values:', { fromDate, toDate, customer, status });

  setDates({ from: fromDate, to: toDate });
  setCustomer(customer);
  setStatus(status);
  let customerId = customer?.customer_id
  let data = {
      page: pageCount,
      per_page: pageSize,
      filter: {fromDate, toDate, customerId, status}
    }
  dispatch(getretailServiceAction(data, setModalTypeHandler, setLoaderStatusHandler))
};

  const pendingPayment = (data) => {


    if(headerLocationId === 'null'){
      setOpenAlert(true)
      return
    }

    // const {
    //   supplier_id,
    //   receivings_items: itemsData = [],
    //   paid_amount,
    //   receiving_id,
    //   status: oldStatus,
    //   receive_goods,
    //   total,
    // } = data;

    // dispatch(getSupplierDetailsByIdAction(data.supplier_id, (supplierDetails) => {
    //   const getVendor = supplierDetails || {};
    //   const getPay = purchase_outstanding.filter(
    //     (d) => d.supplier_id === supplier_id,
    //   )[0]?.childRow;

    //   dispatch(getManualNoteSchemesByIdAction('supplier', data.supplier_id, (response) => {
    //     setManualNoteSchemes(response.map(i => ({ ...i, selected: false })))
          
    //     setPayData({
    //       ...PayData,
    //       itemsData : data.receivings_items,
    //       getVendor,
    //       paymentOpen: true,
    //       paid_amount: +paid_amount,
    //       receiving_id,
    //       oldStatus,
    //       receive_goods,
    //       total: +total,
    //     });
    //     setstatus('edit');
    //     setgetPay(getPay);

    //   }));
  
    // }))

  };

  
  const paymentOption = (event, row) => {
    // console.log("row",row)
    event.stopPropagation();
    setPaymentCard(true)
    setSelectedPayment(row)
  };
  
  const payment = (event, row) => {
    console.log(row,'rowpay')
    setSelectedPayment(row)
    event.stopPropagation();
    setPaymentOpen(true)
  };

  const columns = [
    { field: 'service_id', headerName: 'job ID', width: 190 },
    { field: 'first_name', headerName: 'Customer Name', width: 190 },
    { field: 'phone_number', headerName: 'Mobile number', width: 190 },
    { field: 'engineer_name', headerName: 'Engineer Name', width: 190 },
    { field: 'notes', headerName: 'issue detail', width: 190 },
    { field: 'brand', headerName: 'Product Name', width: 190 },
    { field: 'status', headerName: 'Status', width: 190 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 190,
      renderCell: (params) => (
        <div>
          <IconButton
            color="black"
            aria-label="edit"
            onClick={(event) => handleClick(event, params.row)}
          >
            <AddIcon color='black' />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            sx={{
              "& .MuiPaper-root": {
                boxShadow: "none", // Removes the box shadow
              },
            }}
          >
            <MenuItem onClick={() => handleMenuItemClick('Customer')}>Customer Interaction</MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('Repair')}>Repair Parts Info</MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('Issue')}>Issue Details</MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('Assign')}>Assign Engineer</MenuItem>
            {/* <MenuItem onClick={() => handleMenuItemClick('Product')}>Product Details</MenuItem> */}
          </Menu>
          <IconButton
            color="black"
            aria-label="edit"
            onClick={(event)=> paymentOption(event, params.row)}
          >
            <AssignmentTurnedInIcon color='black' />
          </IconButton>
        </div>
      ),
    }
    // {
    //   field: 'actions',
    //   headerName: 'Actions',
    //   width: 190,
    //   renderCell: (params) => (
    //     <div>
    //       <IconButton
    //         color="black"
    //         aria-label="edit"
    //         onClick={(event) => {
    //           event.stopPropagation();
    //           handleAdd(params.row);
    //           console.log(params.row, params, 'pararow')
    //         }}
    //       >
    //         <AddIcon color='black' />
    //       </IconButton>
    //     </div>
    //   ),
    // },
  ];

  const handleAdd = (row) => {
    setForm(true);
    setReadOnly(false);
    setCusFormValues({
      customer_name: "",
      contact_by: user.last_name ? user.first_name + " " + user.last_name : user.first_name,
      note: ""
    });
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleInteractionChange = (e) => {
    const { name, value } = e.target;
    setCusFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };
  // const handleProduct = (row) => {
  //   console.log(row,'productrow')
  //   setProductOpen(true)
  // }

  const handleRepair = (row) => {
    console.log(row, 'repairrow')
    setRepairOpen(true)
  }

  const handleIssue = (row) => {
    console.log(row, 'issuerow')
    setIssueOpen(true)
  }

  const handleAssign = (row) => {
    console.log(row, 'issuerow')
    setAssignOpen(true)
  }

  const handlePageChange = async (page) => {
    setPageCount(page)
    let payLoad = {
      fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
      toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      pageCount: page,
      numPerPage: pageSize,
      searchString: searchVal
    }
  }

  const requestSearch = (e) => {
        let val = e;
        setSearchVal(val)

    let data = {
      page: pageCount,
      per_page: pageSize,
      // filter: { fromDate, toDate, customerId, status },
      searchString: val
    }
    dispatch(getretailServiceAction(data, setModalTypeHandler, setLoaderStatusHandler))
    };

    const cancelSearch = () => {
        setPageCount(0)
        setSearchVal('')
    let data = {
      page: pageCount,
      per_page: pageSize,
      // filter: { fromDate, toDate, customerId, status },
      searchString: ''
    }
    dispatch(getretailServiceAction(data, setModalTypeHandler, setLoaderStatusHandler))
    };

  const handlePageSizeChange = async (size) => {
    setPageSize(size)
    setPageCount(0)
    let payLoad = {
      fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
      toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      pageCount: size,
      numPerPage: pageSize,
      searchString: searchVal
    }
  };

  const dataWithId = listRetailService?.length ? listRetailService?.map((row, index) => ({ ...row, id: index })) : []
  const handleOpen = () => {
    setOpenNew(false)
    setFormValues(initialFormValues)
    dispatch(clearEditDataAction())
    navigate('/service/jobCard')
  }

  const handleCancel = () => {
    setForm(false);
  };


  const repairHandleChange = async (e) => {
    let { name, value } = e.target;
    setStateHandler(name, value);
  }

  const setStateHandler = async (name, value) => {
    let formObj = {};

    formObj = {
      ...formValues,
      [name]: value === '' ? '' : value,
    };

    await setFormValues(formObj);
  };

  const issueHandleChange = async (e) => {
    let { name, value } = e.target;
    setStateHandler(name, value);
  }

  const handleSubmit = () => {
    const data = { ...cusFormValues, service_id: editdata?.service_id };
    dispatch(addretailcustomerinteractionaction(data, setModalTypeHandler, setLoaderStatusHandler, () => {
      handleCancel();
    }));
  };

  const dialogHandleSubmit = (row) => {
    let data = {
      "service_id": row?.service_id,
      "customer_id": row?.customer_id,
      ...formValues,
      'product': Selectedproduct,
      'dynamic_fields': productDynamicProp
    }

    data.service_id = editdata?.service_id
    dispatch(updateretailServiceAction(data, setModalTypeHandler, setLoaderStatusHandler, () => { }))
    setRepairOpen(false)
    // setProductOpen(false)
    setIssueOpen(false)
    setAssignOpen(false)
  }

  const onRowClick = (row) => {
    console.log(row,'rowpay')
    setOpenNew(true)
    dispatch({ type: EDIT_RETAIL_SERVICE, payload: row?.row })
    navigate('/service/jobCard?type=edit')
  }

  const handleBlur = () => {
    // You can handle the blur event here, e.g., validation or formatting
    console.log('Input blurred');
  };


  const handleAddProduct = () => {
    if (currentProduct) {
      const updatedProduct = { ...currentProduct, quantity: formValues.quantity };
      setselectedProduct([...Selectedproduct, updatedProduct]);
      setCurrentProduct(null);
    }
    setFormValues({ ...formValues, quantity: '' })
  };

  const issueHandleDelete = (id) => {
    console.log('Delete:', id);
    setissuedata(prevData => prevData.filter((_, index) => index !== id));
  }

  const issueHandleEdit = (row) => {
    const itemToEdit = issuedata.find((item, index) => index === row?.id);
    console.log('Edit:', row, issuedata);
    if (!itemToEdit) {
      console.error('Item to edit not found:', row);
      setFormValues(prevValues => ({
        ...prevValues,
        type: itemToEdit.type,
        issue: itemToEdit.issue,
        remarks: itemToEdit.remarks
      }));
    }
    else {
      handleDelete(row?.id)
      setFormValues(prevValues => ({
        ...prevValues,
        id: row.length + 1,
        type: row.type,
        issue: row.issue,
        remarks: row.remarks
      }));
    }
  };

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Service </title>

      </Helmet>
      <Dialog open={paymentCard} onClose={() => setPaymentCard(false)}>
  <Card style={{ height: '300px', width: '500px', padding: '16px' }}>
    <Typography fontSize="14px" fontWeight="bold" marginBottom="10px">Bill Generation</Typography>
    <FormControl>
      <RadioGroup
        name="paymentType"
        value={paymentType}
        onChange={(e) => setPaymentType(e.target.value)}
      >
        <FormControlLabel value="part" control={<Radio />} label="Part Payment" />
        <FormControlLabel value="full" control={<Radio />} label="Full Payment" />
      </RadioGroup>
    </FormControl>
    {paymentType === 'part' && (
      <TextField
        fullWidth
        type="number"
        label="Enter Amount"
        value={partPaymentAmount}
        onChange={(e) => setPartPaymentAmount(e.target.value)}
        variant="outlined"
        style={{ marginTop: '10px' }}
      />
    )}
    {paymentType === 'full' && (
      <Typography style={{ marginTop: '10px', fontSize: '12px', fontWeight: 'bold' }}>
        Amount to Pay: {selectedPayment?.advance_amount || 0}
      </Typography>
    )}
    <div style={{display: 'flex', justifyContent: 'end'}}>
    <Button
      onClick={() => setPaymentCard(false)}
      variant="contained"
      color="secondary"
      style={{ marginTop: '20px', marginRight: '5px' }}
    >
      Close
    </Button>
    <Button
      onClick={() => {setPaymentCard(false)
        setPaymentOpen(true)}
      }
      variant="contained"
      color="primary"
      style={{ marginTop: '20px' }}
       disabled={!selectedPayment?.advance_amount}
    >
      Make Payment
    </Button>
    </div>
  </Card>
</Dialog>
      <Dialog open={AssignOpen} onClose={() => setAssignOpen(false)}  >
        <Card style={{ width: '600px', height: '230px' }}>
          <Grid container margin='20px'>
            <Grid
              marginBottom='10px'
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              <Typography style={{ fontSize: '12px', fontWeight: '700', color: 'black' }}> Assign Engineer </Typography>
            </Grid>
            <Grid
              style={{ display: 'flex', justifyContent: 'end', paddingRight: '30px' }}
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              {/* <div onClick={() => handleOpen('issue')}>
                  <MenuIcon style={{ height: '30px', width: '40px', cursor: 'pointer' }} />
                </div> */}
            </Grid>
            <Grid container marginBottom='30px'>
              <Grid
                size={{
                  lg: 6.3,
                  md: 6.3,
                  sm: 6.3,
                  xs: 6.3
                }}>
                {/* <Typography marginBottom='10px'>Assign Engineer</Typography> */}
                <FormControl fullWidth variant='filled'>
                  <CommonUserAutoCompleteForSingleUser
                    searchVal={searchValEmployeeFilter}
                    setSearchValEmployeeFilter={setSearchValEmployeeFilter}
                    requestSearch={requestSearchEmployeeFilter}
                    value={value1[0]}
                    setValue={(d) => {
                      handleChangeEmployeeName([d])
                    }}
                    type={get_empbasecompany}
                    searchType={searchCompanyBasedEmployeeFilter}
                    labelName="Select Engineer"

                  />

                </FormControl>
              </Grid>
              {isValidValue1 && <Grid
                display='flex'
                justifyContent='end'
                alignItems='center'
                size={{
                  lg: 6,
                  md: 6,
                  sm: 6,
                  xs: 6
                }}>
                <Typography> Assigned Date : <span style={{ fontsize: '12px' }}> {editdata?.assigned_date?.length > 0 ? moment(editdata?.assigned_date).format('DD-MM-YYYY') : formattedDate} </span> </Typography>
              </Grid>}
            </Grid>
          </Grid>
          <Grid
            gap={2}
            display='flex'
            justifyContent='end'
            margin='20px'
            size={{
              lg: 11,
              md: 11,
              sm: 11,
              xs: 11
            }}>
            <Button variant='contained' color='error' onClick={() => setAssignOpen(false)}> cancel </Button>
            <Button variant='contained' onClick={dialogHandleSubmit} > Save </Button>
          </Grid>
        </Card>
      </Dialog>
      <Dialog open={IssueOpen} onClose={() => setIssueOpen(false)} maxWidth style={{ height: '500px' }}>
        <Card style={{ height: "900px" }}>
          <Grid container margin='20px'>
            <Grid
              marginBottom='10px'
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              <Typography style={{ fontSize: '12px', fontWeight: '700', color: 'black' }}> Issue Details </Typography>
            </Grid>

            <Grid container>
            <Grid
              margin="10px 10px 10px 0px"
              size={{
                lg: 3.3,
                md: 3.3,
                sm: 3.3,
                xs: 6
              }}>
    <TextField
      style={{ fontSize: '12px' }}
      onChange={handleChange}
      onBlur={handleBlur}
      fullWidth
      placeholder="Type"
      label="Type"
      name="type"
      value={formValues.type || ''} // Ensure value is always a string
      color="primary"
      type="text"
      variant="filled"
    />
  </Grid>
              <Grid
                margin='10px'
                size={{
                  lg: 3.3,
                  md: 3.3,
                  sm: 3.3,
                  xs: 6
                }}>
                <TextField
                  style={{ fontSize: "12px" }}
                  onChange={handleChange}
                  onBlur={handleChange}
                  fullWidth={true}
                  placeholder='Issue'
                  label='Issue'
                  name='issue'
                  value={
                    formValues.issue === null ? '' : formValues.issue
                  }
                  color='primary'
                  type='text'

                  regex=''
                  variant='filled'
                  InputProps={{
                    style: { fontSize: '12px' }
                  }}
                />
              </Grid>
              <Grid
                margin='10px'
                display='flex'
                flexDirection='row'
                size={{
                  lg: 3.3,
                  md: 3.3,
                  sm: 3.3,
                  xs: 6
                }}>
                <TextField
                  style={{ fontsize: "12px" }}
                  onChange={handleChange}
                  onBlur={handleChange}
                  fullWidth={true}
                  placeholder='Remarks'
                  label='Remarks'
                  name='remarks'
                  value={
                    formValues.remarks === null ? '' : formValues.remarks
                  }
                  color='primary'
                  type='text'
                  regex=''
                  variant='filled'

                />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: '10px', height: '100px' }}

                  onClick={() => {
                    if (formValues.type !== "" && formValues.issue !== "" && formValues.remarks !== "") {
                      let data = { type: formValues.type, issue: formValues.issue, remarks: formValues.remarks }
                      setFormValues({ ...formValues, type: "", issue: "", remarks: "" })
                      setissuedata((prev) => [...prev, data])
                    }
                  }}>

                  <AddIcon style={{ cursor: 'pointer', alignItems: 'center', marginTop: '5px' }} />
                </div>
              </Grid>

            </Grid>



            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <IssueDetail issuedata={issuedata} handleDelete={issueHandleDelete} handleEdit={issueHandleEdit} editdata={editdata} />

            </Grid>

            <Grid
              gap={2}
              display='flex'
              justifyContent='end'
              margin='20px'
              size={{
                lg: 11,
                md: 11,
                sm: 11,
                xs: 11
              }}>
              <Button variant='contained' color='error' onClick={() => setIssueOpen(false)}> cancel </Button>
              <Button variant='contained' onClick={dialogHandleSubmit} > Save </Button>
            </Grid>
          </Grid>
        </Card>
      </Dialog>
      <Dialog open={repairOpen} onClose={() => setRepairOpen(false)} maxWidth style={{ height: '500px' }}>
        <Card style={{ margin: '5px 5px 5px 0px' }}>

          <Grid container margin='20px'>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Typography style={{ fontSize: '12px', fontWeight: '700', color: 'black' }}> Repair & Parts Information </Typography>
            </Grid>
            <Grid container gap={3} marginTop='10px'>
              <Grid
                marginBottom='20px'
                size={{
                  lg: 4,
                  md: 4,
                  sm: 4,
                  xs: 4
                }}>
                <Autocomplete
                  id='combo-box-demo'
                  name='supplier_id'
                  required={true}
                  onChange={(e, val) => {
                    setCurrentProduct(val);
                  }}
                  options={product}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => {
                    const get = { ...params };

                    get.InputProps = {
                      ...params.InputProps,
                      startAdornment: (
                        <Tooltip title='Create New'>
                          <IconButton
                            size='small'
                            onClick={() => {
                              setModalStatusHandler(true);
                              setModalTypeHandler('product');
                            }}
                          >
                            <Add fontSize='small' />
                          </IconButton>
                        </Tooltip>
                      ),
                    };

                    return (
                      <TextField
                        {...get}
                        label='Product'
                        placeholder='Select Product'
                        fullWidth={true}
                        required={true}
                        variant='filled'
                      />
                    );
                  }}
                />
              </Grid>
              <Grid
                marginBottom='20px'
                size={{
                  lg: 4,
                  md: 4,
                  sm: 4,
                  xs: 4
                }}>
                <TextField
                  style={{ fontsize: "12px" }}
                  onChange={repairHandleChange}
                  onBlur={repairHandleChange}
                  fullWidth={true}
                  placeholder='Qty'
                  label='Quantity'
                  name='quantity'
                  value={
                    formValues.quantity === null ? '' : formValues.quantity
                  }
                  color='primary'
                  type='number'
                  variant='filled'

                />
              </Grid>
              <Grid
                display='flex'
                alignItems='center'
                justifyContent='flex-end'
                size={{
                  lg: 2,
                  md: 2,
                  sm: 2,
                  xs: 2
                }}>
                <Button variant='contained' onClick={handleAddProduct}> Add </Button>
              </Grid>
            </Grid>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <RepairAndParts Selectedproduct={Selectedproduct} editdata={editdata} editData={editData} />
            </Grid>
            <Grid
              gap={2}
              display='flex'
              justifyContent='end'
              margin='10px 30px 0px 0px'
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Button variant='contained' color='error' onClick={() => setRepairOpen(false)}> cancel </Button>
              <Button variant='contained' onClick={dialogHandleSubmit} > Save </Button>
            </Grid>
          </Grid>
        </Card>
      </Dialog>
      <Dialog open={form} onClose={handleCancel} maxWidth style={{ height: '500px' }}>
        <Grid container gap={2} padding='20px'>
          <Grid
            marginBottom='10px'
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Typography style={{ fontSize: '20px', color: 'black' }}> Customer Interactions </Typography>
          </Grid>
          <Grid
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 6
            }}>
            <TextField
              fullWidth
              placeholder='Contact By'
              label='Contact By'
              name='contact_by'
              value={cusFormValues.contact_by}
              variant='outlined'
              onChange={(e) => e.preventDefault()}
              InputProps={{
                readOnly: readOnly
              }}
            />
          </Grid>
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <TextField
              fullWidth
              placeholder='Interaction Note'
              label='Interaction Note'
              name='note'
              value={cusFormValues.note}
              multiline
              minRows={2}
              variant='outlined'
              onChange={handleInteractionChange}
              InputProps={{
                readOnly: readOnly
              }}
            />
          </Grid>
          <Grid
            gap={2}
            display='flex'
            justifyContent='end'
            paddingRight='10px'
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Button variant='contained' color='error' onClick={handleCancel}> Cancel </Button>
            <Button variant='contained' onClick={handleSubmit}> Submit </Button>
          </Grid>
        </Grid>
      </Dialog>
      <PaymentDialog
        paymentOpen={paymentOpen}
        setPaymentOpen={setPaymentOpen}
        selectedPayment={selectedPayment}
        sales_items={sales_items}
      />
      <DataGridTemp
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            '& .MuiDataGrid-columnHeader:last-of-type .MuiDataGrid-columnSeparator': {
              display: 'none !important'
            }
          }
        }}
        columns={columns}
        onRowClick={serviceUpdate ? onRowClick : undefined}
        columnData={columns}
        exportData={true}
        data={dataWithId}
        pageSize={pageSize}
        pageType='task'
        page={pageCount}
        onPageChange={(page) => handlePageChange(page)}
        onPageSizeChange={(size) => handlePageSizeChange(size)}
        handleOpen={serviceCreate ? handleOpen : null}
        title={'Service'}
        serviceCreate={serviceCreate}
        rowCount={numRows ?? 0}
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
        requestSearch={(e) => requestSearch(e.target.value)}
        cancelSearch={cancelSearch}
        searchVal={searchVal}
      />
      {openFilter && 
      <ServiceFilter
      open={openFilter}
      onClose={() => setOpenFilter(false)}
      onApply={handleApply}
      date={dates}
      setDate={setDates}
      />
      }
    </>
  );
};

