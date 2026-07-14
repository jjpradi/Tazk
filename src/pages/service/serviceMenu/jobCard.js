import { Box, Grid, TextField, Typography, FormControl, InputLabel, Select, MenuItem, Dialog, Button, Autocomplete, Tooltip, IconButton, Divider, FormControlLabel, RadioGroup, Radio, Checkbox, FormLabel, useMediaQuery, TableContainer, Table, TableHead, TableRow, TableCell, Paper, TableBody, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import moment from 'moment';
import React, { useContext, useEffect, useMemo, useState } from 'react'
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import Header from './header';
import CustomerIntraction from './customerIntraction';
import TimeLine from './timeLine';
import ImageUpload from './imageUpload';
import NewDynamicProperties from 'pages/assets/DynamicProperties/DynamicProp';
import { useDispatch } from 'react-redux';
import { addretailServiceAction, getpreviousdateaction, getretailServiceAction, getretailServiceidAction, getservicebycustomeridaction, updateretailServiceAction } from 'redux/actions/retail_service_action';
import context from '../../../context/CreateNewButtonContext'
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductDetail from './productDetail';
import { useSelector } from 'react-redux';
import { Card } from '@mui/material';
import { Add } from '@mui/icons-material';
import { listProductAction } from 'redux/actions/product_actions';
import RepairAndParts from './repairAndParts';
import { getsessionStorage } from 'pages/common/login/cookies';
import { get_search_company_based_employee, getEmpbasecompanyAction, set_search_company_based_employee } from 'redux/actions/attendance_actions';
import CommonUserAutoCompleteForSingleUser from 'utils/commonAutoCompleteForSingleUser';
import IssueDetail from './issueDetail';
import { DatePicker, DateTimePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import AttachmentField from 'pages/common/Timesheet/Attachment';
import CancelDialog from '../../../../src/components/CancelDialog';
import { MailIcon } from 'pages/routesIcons';
import SendInvoiceButton from './SendInvoiceButton';
import PrintIcon from '@mui/icons-material/Print';
import toMomentOrNull from '../../../utils/DateFixer';

export default function JobCard({ openNew }) {

  const storage = getsessionStorage()
  const initialFormValues = {
    job_name: '',
    received_by: storage?.last_name,
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
    attachment: [],
    productDynamicProp: {},
    issueDynamicProp: {}
  }
  console.log(storage,'sessionstorage')
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [printopen, setprintopen] = useState(false)
  const [isSaved, setIsSaved] = useState(false);

  const smallscreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const { retailServiceReducer: { editdata, listRetailService }, productReducer: { product }, attendanceReducer: { get_empbasecompany, searchCompanyBasedEmployeeFilter }, customerReducer: { customer } } = useSelector((state) => state);
  const [editData, setEditData] = useState([])
  const matchingService = listRetailService.filter(
    (service) => service.service_id === editdata
);
  console.log(listRetailService, editdata, matchingService,customer, 'edlength1')
  //console.log(editData, 'edlength2')
  const [searchParams, setSearchParams] = useSearchParams();
  const [images, setImages] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [issuedata, setissuedata] = useState([]);
  const [assEmpVisible, setAssEmpVisible] = useState(false);
  console.log(assEmpVisible,editdata,'assemp')
  const [Selectedcustomer, setselectedCustomer] = useState(null);
  const [Selectedproduct, setselectedProduct] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  console.log(Selectedproduct, 'datagrid')
  const [DialogOpen, setDialogOpen] = useState(false)
  const [paymentCard, setPaymentCard] = useState(false)
  const [paymentType, setPaymentType] = useState('');
  const [partPaymentAmount, setPartPaymentAmount] = useState('');
  const [dynamicPropOpen, setDynamicPropOpen] = useState(false)
  const [taskStatus, setTaskStatus] = useState([
    { id: 'open', status_name: 'Open', color: '#ff99e6' }, // pink
    { id: 'assigned', status_name: 'Assigned', color: '#cccc00' }, // orange
    { id: 'work_in_progress', status_name: 'Work In Progress', color: '#2196f3' }, // blue
    { id: 'waiting_for_parts', status_name: 'Waiting for Parts', color: '#9c27b0' }, // purple
    { id: 'repair_done', status_name: 'Repair Done', color: '#4caf50' }, // green
    { id: 'delivered', status_name: 'Delivered', color: '#00bcd4' }, // cyan
    { id: 'closed', status_name: 'Closed', color: '#9e9e9e' }, // grey
  ]);
  
  const [formValues, setFormValues] = useState(initialFormValues)
  const [filteredata, setFilteredData] = useState()
  console.log(Selectedproduct,currentProduct, 'Selectedproduct')
  console.log(formValues, filteredata,initialFormValues, 'formvaluesssss')
  const [before_images, setBefore_Images] = useState([])
  const [services, setservices] = useState([])
  const [after_images, setAfter_Images] = useState([])
  const [pageCount, setPageCount] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [serviceid, setserviceid] = useState(null)
  const [variation, setVariation] = useState('')
  const [productDynamicProp, setProductDynamicProp] = useState([])
  const [issueDynamicProp, setIssueDynamicProp] = useState([])
  const [cusOpen, setCusOpen] = useState(false)
  const [open, setOpen] = useState(false);
  const [billSummary, setBillSummary] = useState(false);
  const [closeCard, setCloseCard] = useState(false);
  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');
  const [value1, setValue1] = React.useState([]);
  // console.log(formValues,'formValues')
  const [assignDate, setAssignDate] = useState(false)
  const [firstName, setFirstName] = useState('');
  const [customerData,setCustomerData] = useState(null)
  const isValidValue1 = value1.length > 0 && !value1.every(item => item === null);
  const [productformData, setproductFormData] = useState({
    service_agent: null,
    service_assetName: null,
    service_startDateAndTime: null,
    service_endDateAndTime: null,
    service_dynamicPropValues: []
  })
  const [productformErrors, setproductFormErrors] = useState({
    service_agent: null,
    service_assetName: null,
    service_startDateAndTime: null,
    service_endDateAndTime: null,
    serviceImage: null,
    service_dynamicPropErrors: []
  })

  const [formData, setFormData] = useState({
    service_agent: null,
    service_assetName: null,
    service_startDateAndTime: null,
    service_endDateAndTime: null,
    service_dynamicPropValues: []
  })
  const [formErrors, setFormErrors] = useState({
    service_agent: null,
    service_assetName: null,
    service_startDateAndTime: null,
    service_endDateAndTime: null,
    serviceImage: null,
    service_dynamicPropErrors: []
  })
  console.log(before_images,after_images,'imagesseses')
  const [papersize, setpapersize] = useState('0');
  const Change = (e) => {
    let {value} = e.target;
    setpapersize(value);
  };

  const cancelDialog = () => {
    setOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClickClose = () => {
    navigate('/service')
  };

  const email = 'recipient@example.com';
  
  const handleClose = () => {
    cancelDialog()
    navigate(-1);
  };
  const handelcreate = () => {
    navigate('/jobCard')
    setprintopen(false)
  }
  const handlePrint = () => {
    setprintopen(true)
  };

  const dialogHandlePrint = () => {
    window.print(true)
  };
  
  const dataWithId = listRetailService?.length ? listRetailService?.map((row, index) => ({ ...row, id: index })) : []

  // console.log("serviceid",serviceid)
  useEffect(() => {
    let prodetailDynamicPropObj = {}
    if (productDynamicProp > 0) {
      productDynamicProp.forEach((val) => {
        prodetailDynamicPropObj[val.name] = val.type === 'List' ? val.properties.default_value
          : val.type === 'Date' && val.properties.date_default_value ? newDate
            : val.type === 'Time' && val.properties.time_default_value ? newDate
              : val.type === 'Date & Time' && val.properties.dateTime_default_value ? newDate
                : val.type === 'CheckBox' ? false
                  : val.type === 'Radio' ? val.properties.options[0]
                    : val.properties.default_value
      })
      setproductFormData((prevState) => ({
        ...prevState,
        service_dynamicPropValues: { ...prodetailDynamicPropObj }
      }))
    }
    let issueDynamicPropObj = {}
    if (issueDynamicProp > 0) {
      issueDynamicProp.forEach((val) => {
        issueDynamicPropObj[val.name] = val.type === 'List' ? val.properties.default_value
          : val.type === 'Date' && val.properties.date_default_value ? newDate
            : val.type === 'Time' && val.properties.time_default_value ? newDate
              : val.type === 'Date & Time' && val.properties.dateTime_default_value ? newDate
                : val.type === 'CheckBox' ? false
                  : val.type === 'Radio' ? val.properties.options[0]
                    : val.properties.default_value
      })
      setproductFormData((prevState) => ({
        ...prevState,
        service_dynamicPropValues: { ...issueDynamicPropObj }
      }))
    }
  }, [productDynamicProp, issueDynamicProp])

  const {
    commoncookie,
    setModalStatusHandler,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);
  let type = searchParams.get("type")
  console.log(customerData,editdata, editdata.length ? editdata?.phone_number : customerData?.phone_number, 'typeedddd')
  
  useEffect(() => {
    if (editdata?.service_id && type == "edit") {
      console.log(type,editdata,'sdddssc')
      setserviceid(editdata?.service_id)
      setFormValues({
        job_name: editdata?.job_name,
        customer_id: editdata?.customer_id,
        received_by: editdata?.received_by,
        mobile_number: editdata?.mobile_number,
        status: editdata?.status,
        notes: editdata?.notes,
        engineer_name: editdata?.engineer_name,
        type: editdata?.type,
        issue: editdata?.issue,
        remarks: editdata?.remarks,
        approx_estimate: editdata?.approx_estimate,
        product_condition: editdata?.product_condition,
        advance_amount: editdata?.advance_amount,
        target_delivery: editdata?.target_delivery,
        warranty: editdata?.warranty,
        brand: editdata?.brand,
        model: editdata?.model,
        serial: editdata?.serial,
        date_of_purchase: editdata?.date_of_purchase,
        quantity: editdata?.quantity,
      })
      setProductDynamicProp(JSON.parse(editdata?.dynamic_fields ?? "[]"))
      setIssueDynamicProp(JSON.parse(editdata?.issue_dynamic_fields ?? "[]"))
    setEditData(editdata)
    setselectedProduct(editdata?.product_details)
    let data = JSON.parse(editdata?.issues || "[]")
    setissuedata(data)
    } else {
      console.log(type,'typeeelse')
      // Handle the case when editdata is empty or when it's a new job card
      setFormValues(initialFormValues);
      setProductDynamicProp([]);
      setIssueDynamicProp([]);
      setEditData([]);
      setselectedProduct([]);
      setissuedata([]);
    }
  }, [type, editdata])

  useEffect(() => {
    if (!get_empbasecompany.length) {
      dispatch(getEmpbasecompanyAction())
    }
  },[])

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setCurrentDateTime(new Date());
  //   }, 1000);

  //   return () => clearInterval(intervalId);
  // }, []);

  useEffect(() => {
    dispatch(listProductAction())
    if (type !== "edit") {
      dispatch(getretailServiceidAction(setModalTypeHandler, setLoaderStatusHandler, (data) => {
        // console.log(data, 'datatata')
        if (data?.service_id) {
          setserviceid(openNew === false ? Number(data?.service_id) + 1 : data?.service_id);
        }
        else {
          navigate(-1)
        }
      }))
    }
  }, [type]
  )
  // useEffect(()=>{
  // if (Selectedcustomer?.customer_id){
  //   dispatch(getpreviousdateaction( Selectedcustomer?.customer_id,setModalTypeHandler,setLoaderStatusHandler, (data) => {

  //         }))
  // }
  // },[Selectedcustomer?.customer_id])

  useEffect(() => {
    if (Selectedcustomer?.customer_id && type !== "edit") {
      dispatch(getservicebycustomeridaction(Selectedcustomer?.customer_id, setModalTypeHandler, setLoaderStatusHandler, (data) => {
        console.log(type,data,'typee1')
        if (data?.length > 0) {
          if (data?.length == 1) {
            console.log(type,data,'typee2')
            let service = data[0]
            setserviceid(service?.service_id)
            setFormValues({
              job_name: service?.job_name,
              received_by: service?.received_by,
              mobile_number: service?.length ? service?.mobile_number : customerData?.phone_number,
              status: service?.status,
              notes: service?.notes,
              engineer_name: service?.engineer_name,
              type: service?.type,
              issue: service?.issue,
              remarks: service?.remarks,
              approx_estimate: service?.approx_estimate,
              product_condition: service?.product_condition,
              advance_amount: service?.advance_amount,
              target_delivery: service?.target_delivery,
              warranty: service?.warranty,
              brand: service?.brand,
              model: service?.model,
              serial: service?.serial,
              date_of_purchase: service?.date_of_purchase,
              quantity: service?.quantity,
            })
            setProductDynamicProp(JSON.parse(service?.dynamic_fields ?? "[]"))
            setIssueDynamicProp(JSON.parse(service?.issue_dynamic_fields ?? "[]"))

          } else {
            console.log(type,data,'typee3')
            setservices(data)
          }
        }
      }))
    }
  }, [Selectedcustomer?.customer_id, type])
  const setStateHandler = async (name, value) => {
    let formObj = {};

    formObj = {
      ...formValues,
      [name]: value === '' ? '' : value,
    };
    console.log(formObj,'typee4')
    await setFormValues(formObj);
  };

  const handleAddProduct = () => {
    if (currentProduct) {
      const updatedProduct = { ...currentProduct, quantity: formValues.quantity };
      setselectedProduct([updatedProduct]);
      setCurrentProduct(null);
    }
    setFormValues({ ...formValues, quantity: '' })
  };

  const handleDelete = (id) => {
    console.log('Delete:', id);
    setissuedata(prevData => prevData.filter((_, index) => index !== id));
  };

  const handleProdDelete = (id) => {
    console.log('Delete:',Selectedproduct, id);
    setselectedProduct(prevData => prevData.filter((_, index) => index !== id));
  };

  const handleEdit = (row) => {
    const itemToEdit = issuedata.find((item, index) => index === row?.id);
    //console.log('Edit:', row, issuedata);
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
        id: row.length +1,
        type: row.type,
        issue: row.issue,
        remarks: row.remarks
      }));
    }
  };
  
  //console.log(openNew, "openNew");

  

  const handleSubmit = () => {
    setIsSaved(true);
    let updatedFormValues = { ...formValues, mobile_number: customerData?.phone_number, job_name: customerData?.first_name };
    console.log(updatedFormValues, formValues, 'hsfdnnhjm')
    if (assignDate) {
      updatedFormValues = {
        ...updatedFormValues,
        engineer_name: firstName,
        assigned_date: assignDate
      };
    } else {
      updatedFormValues = {
        ...updatedFormValues,
        engineer_name: "",
        assigned_date: ""
      };
    }
  
    let data = {
      "service_id": serviceid,
      ...updatedFormValues,
      'before_images': before_images,
      'after_images': after_images,
      'issues': issuedata,
      'dynamic_fields': productDynamicProp,
      'issues_dynamic_fields': issueDynamicProp,
      'product': Selectedproduct
    };
  
    if (editdata?.service_id && type === "edit") {
      delete data.before_images;
      delete data.product_details;
      data.service_id = editdata?.service_id;
      dispatch(updateretailServiceAction(data, setModalTypeHandler, setLoaderStatusHandler, (res)=>{
        if(res){
          let data1 = {
            page: pageCount,
            per_page: pageSize
          }
          dispatch(getretailServiceAction(data1, setModalTypeHandler, setLoaderStatusHandler))
        }
      }));
    } else {
      dispatch(addretailServiceAction(data, setModalTypeHandler, setLoaderStatusHandler,(res)=>{
        // console.log("1111",res)
        if(res.status === "created"){
          let data1 = {
            page: pageCount,
            per_page: pageSize
          }
          dispatch(getretailServiceAction(data1, setModalTypeHandler, setLoaderStatusHandler))
          handleClickClose()
        }

      }));

    }
    
    if(type == "edit") {
      setBillSummary(true)
    }
    // navigate('/service');
  };
  

  const handleChange = async (e) => {
    //console.log('custchange', e)
    let { name, value } = e.target;
    setStateHandler(name, value);
    setCusOpen(false)
  }

  const handleImageDelete = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
    // handleImageValidation(updatedImages);
  };

  const formattedDate = moment(currentDateTime).format('DD-MM-YYYY');
  const formattedTime = moment(currentDateTime).format("hh:mm A");

  const handleOpen = (variation) => {
    setVariation(variation)
    setDynamicPropOpen(true)
  }

  const handleDynamicChange = async (val, variation) => {
    console.log('valueeee', val, variation)
    if (variation === 'product') {
      await setProductDynamicProp([...productDynamicProp, val])
    }
    if (variation === 'issue') {
      await setIssueDynamicProp([...issueDynamicProp, val])
    }
  }
  //console.log("issuedynamicpros", issueDynamicProp)

  const handleFormClose = () => {
    setDynamicPropOpen(false)
  }

  const handleCustomer = () => {
    setCusOpen(true)
  }

  const requestSearchEmployeeFilter = (val) => {
    console.log('1');

    setSearchValEmployeeFilter(val);
    if (!val) {
      dispatch(set_search_company_based_employee([]));
      return
    }
    let data = {
      searchString: val
    }
    console.log('2');
    dispatch(
      get_search_company_based_employee(
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
  };

  const handleChangeEmployeeName = (val) => {
    if (Array.isArray(val) && val.length > 0 && val[0]) {
      const firstName = val[0].first_name || '';
      const assignedDate = moment().format('YYYY-MM-DD');
      setFirstName(firstName);
      setValue1(val);
      setFormValues((prevState) => ({
        ...prevState,
        engineer_name: firstName,
        assigned_date: assignedDate
      }));
    } else {
      setFirstName('')
      setValue1([]);
      setFormValues((prevState) => ({
        ...prevState,
        engineer_name: '',
        assigned_date: ''
      }));
    }
  };

  const handleDynamicPropChange = (name, value, required) => {

    if (required) {
      if (value !== null && value !== '' && value !== undefined) {
        setFormData({
          ...formData,
          service_dynamicPropValues: { ...formData.service_dynamicPropValues, [name]: value }
        })
        setFormErrors({
          ...formErrors,
          service_dynamicPropErrors: { ...formErrors.service_dynamicPropErrors, [name]: null }
        })
      }
      else {
        setFormData({
          ...formData,
          service_dynamicPropValues: { ...formData.service_dynamicPropValues, [name]: null }
        })
        setFormErrors({
          ...formErrors,
          service_dynamicPropErrors: { ...formErrors.service_dynamicPropErrors, [name]: `${name} is Required` }
        })
      }
    }
    else {
      setFormData({
        ...formData,
        service_dynamicPropValues: { ...formData.service_dynamicPropValues, [name]: value ? value : null }
      })
      setFormErrors({
        ...formErrors,
        service_dynamicPropErrors: { ...formErrors.service_dynamicPropErrors, [name]: null }
      })
    }
  }

  const handleAssignDate = () => {
    if(editdata?.engineer_name) {
      console.log('ifff')
      setAssEmpVisible(true)
    } else {
    if(isValidValue1) {
      console.log('else')
      setAssignDate(true)
      setAssEmpVisible(true)
      setFormValues(prevState => ({
        ...prevState,
        status: 'assigned'
      }));
    }
  }
  }

  const paymentOpen = () => {
    setDialogOpen(false)
    setCloseCard(true)
  }

  const billGenerate = () => {
    setBillSummary(false)
    setDialogOpen(true)
  }

  const closeJobcard = () => {
    setBillSummary(false)
    setFormValues(prevState => ({
      ...prevState,
      status: 'closed'
    }));
    let data = {
      "service_id": serviceid,
      ...formValues,
      'before_images': before_images,
      'after_images': after_images,
      'issues': issuedata,
      'dynamic_fields': productDynamicProp,
      'issues_dynamic_fields': issueDynamicProp,
      'product': Selectedproduct,
      'status': 'closed'
    };
    delete data.before_images;
      delete data.product_details;
      data.service_id = editdata?.service_id;
      dispatch(updateretailServiceAction(data, setModalTypeHandler, setLoaderStatusHandler, () => {}));
    setCloseCard(false)
    navigate('/service')
  }

  const selectedStatus = taskStatus.find(status => status.id === formValues.status)?.status_name || 'Open';


  const dedupeEmployees = (list) => {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    return list.filter((emp) => {
      const key =
        emp?.employee_id ??
        `${emp?.employee_code || ''}-${emp?.first_name || ''}-${emp?.last_name || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const dedupedEmployees = useMemo(
    () => dedupeEmployees(get_empbasecompany),
    [get_empbasecompany],
  );
  const dedupedSearchedEmployees = useMemo(
    () => dedupeEmployees(searchCompanyBasedEmployeeFilter),
    [searchCompanyBasedEmployeeFilter],
  );
  console.log(assignDate === true || editdata?.assigned_date || !isValidValue1, 'selectedcus')
  // console.log("storage?.first_name",storage?.first_name);
  
  return (
    <div
      style={{
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingRight: '4px',
      }}
        className="hide-scrollbar"
  >
    <style>
      {`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}
    </style>
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
        Amount to Pay: {editdata?.approx_estimate}
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
      // onClick={() => setDialogOpen(false)}
      variant="contained"
      color="primary"
      style={{ marginTop: '20px' }}
    >
      Make Payment
    </Button>
    </div>
  </Card>
</Dialog>
      <Dialog open={DialogOpen} onClose={() => setDialogOpen(false)}>
            <Card style={{ padding: '10px' }}>
              <div style={{fontSize: '12px', paddingBottom: '5px'}}>Service Details</div>
              <TableContainer component={Paper} style={{height: '200px'}}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Service ID</TableCell>
                      <TableCell>Date Created</TableCell>
                      <TableCell>Brand</TableCell>
                      <TableCell>Model</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
        {editdata?.product_details?.length > 0 ? (
          editdata?.product_details.map((v, i) => (
            <TableRow key={i}>
              <TableCell>{v?.service_id}</TableCell>
              <TableCell>{moment(v?.createdAt).format('DD-MM-YYYY')}</TableCell>
              <TableCell>{v?.product_name}</TableCell>
              <TableCell>{v?.quantity}</TableCell>
              <TableCell>{v?.unit_price}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} align="center">
              No Product Details Found
            </TableCell>
          </TableRow>
        )}
      </TableBody>

                </Table>
              </TableContainer>
              <Grid style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                <Button variant='outlined' onClick={paymentOpen} disabled={editdata?.product_details?.length === 0}> Close Jobcard </Button>
              </Grid>
            </Card>
          </Dialog>
      <Grid container>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Header
            Selectedcustomer={Selectedcustomer}
            jSetFormValues={setFormValues}
            handleCustomer={handleCustomer}
            JformValues={formValues}
            editdata={editdata}
            selectedStatus={selectedStatus}
            cusOpen={cusOpen}
            taskStatus={taskStatus}
            setCusOpen={setCusOpen}
            handleChange={handleChange}
            serviceid={serviceid}
            type={type}
            initialFormValues={initialFormValues}
            handlePrint={handlePrint}
            handleClickOpen={handleClickOpen}
            handleSubmit={handleSubmit}
            customerData={customerData}
            setCustomerData={setCustomerData}
          />
        </Grid>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Card style={{ padding: '10px', margin: '5px 0px 5px 0px' }}>
            <Grid container>
              <Grid container style={{ display: 'flex', flexDirection: 'row' }}>
                <Grid
                  margin='10px'
                  size={{
                    lg: 3.5,
                    md: 3.5,
                    sm: 5.5,
                    xs: 5.5
                  }}>
                <Typography sx={{ fontSize: '12px', fontFamily: 'Poppins' }}>
                  
    Job Id :  
    <span style={{ fontSize: '11px', fontFamily: 'Poppins' }}>
      {serviceid}
    </span>
  </Typography>
                </Grid>
                <Grid
                  margin='10px'
                  size={{
                    lg: 3.5,
                    md: 3.5,
                    sm: 5.5,
                    xs: 5.5
                  }}>
                  <Typography sx={{ fontSize: '12px', fontFamily: 'Poppins' }}> Received By : <span style={{ fontsize: '11px',  fontFamily: 'Poppins' }}> {`${storage?.first_name?.length ? storage?.first_name : ''} ${storage?.last_name?.length ? storage?.last_name : ''}`} </span> </Typography>
                </Grid>
                <Grid
                  style={{ display: 'flex', justifyContent: 'end' }}
                  size={{
                    lg: 3.5,
                    md: 3.5,
                    sm: 5.5,
                    xs: 5.5
                  }}>
                  <div>
                    <Typography sx={{ fontSize: '12px', fontFamily: 'Poppins' }}>Date :<span style={{ fontsize: '11px',  fontFamily: 'Poppins' }}> {editdata?.createdAt?.length > 0 ? moment(editdata?.createdAt).format('DD-MM-YYYY') : formattedDate} </span> </Typography>
                    <Typography sx={{ fontSize: '12px', fontFamily: 'Poppins' }}>Time :  <span style={{ fontsize: '11px',  fontFamily: 'Poppins' }}>{formattedTime} </span> </Typography>
                  </div>
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
      <Grid container>
        <Grid
          size={{
            lg: type !== 'edit' ? 12 : 8,
            md: type !== 'edit' ? 12 : 8,
            sm: 12,
            xs: 12
          }}>
          <Card style={{ margin: '5px 5px 5px 0px' }}>
            <Grid container margin='10px'>
              <Grid
                size={{
                  lg: 6,
                  md: 6,
                  sm: 6,
                  xs: 12
                }}>
                <Typography style={{ fontSize: '12px', fontWeight: '700', color: 'black' }}> Service Details </Typography>
              </Grid>
              <Grid
                style={{ display: 'flex', justifyContent: 'end', paddingRight: '30px' }}
                size={{
                  lg: 6,
                  md: 6,
                  sm: 6,
                  xs: 12
                }}>
                <div onClick={() => handleOpen('product')}>
                  <MenuIcon style={{ height: '30px', width: '40px', cursor: 'pointer' }} />
                </div>
              </Grid>
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <ProductDetail productDynamicProp={productDynamicProp} setProductDynamicProp={setProductDynamicProp} formData={productformData} setFormData={setproductFormData} formErrors={productformErrors} setFormErrors={setproductFormErrors} handleChange={handleChange} formValues={formValues} />
              </Grid>
            </Grid>
          </Card>
          <Card style={{ margin: '5px 5px 5px 0px' }}>
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
              <Grid
                style={{ display: 'flex', justifyContent: 'end', paddingRight: '30px' }}
                size={{
                  lg: 6,
                  md: 6,
                  sm: 6,
                  xs: 6
                }}>
                <div onClick={() => handleOpen('issue')}>
                  <MenuIcon style={{ height: '30px', width: '40px', cursor: 'pointer' }} />
                </div>
              </Grid>
              <Grid
                container
                spacing={4}
                marginBottom="20px"
                alignItems="center"
                sx={{ width: '100%' }}
              >
                <Grid
                  size="auto"
                  sx={{ display: 'flex', alignItems: 'center', pr: 1 }}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Assign Engineer:
                  </Typography>
                </Grid>

                <Grid
                  size={{ lg: 5, md: 5, sm: 12, xs: 12 }}
                  sx={{ minWidth: 0 }}
                >
                  {editdata?.engineer_name && !assEmpVisible ? (
                    <Typography
                      sx={{
                        minHeight: '56px',
                        display: 'flex',
                        alignItems: 'center',
                        px: 1.5,
                        borderRadius: 1,
                        bgcolor: '#f5f5f5',
                        fontSize: '14px',
                        width: '100%',
                      }}
                    >
                      {editdata?.engineer_name}
                    </Typography>
                  ) : (
                    <Box sx={{ width: '100%', minHeight: '56px' }}>
                      <CommonUserAutoCompleteForSingleUser
                        searchVal={searchValEmployeeFilter}
                        setSearchValEmployeeFilter={setSearchValEmployeeFilter}
                        requestSearch={requestSearchEmployeeFilter}
                        value={value1[0]}
                        setValue={(d) => handleChangeEmployeeName([d])}
                        type={dedupedEmployees}
                        searchType={dedupedSearchedEmployees}
                        labelName="Select Engineer"
                      />
                    </Box>
                  )}
                </Grid>

                <Grid
                  size={{ lg: 2, md: 2, sm: 6, xs: 6 }}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <Button
                    variant="contained"
                    onClick={handleAssignDate}
                    sx={{ minWidth: '110px', height: '40px' }}
                  >
                    {editdata?.engineer_name && !assEmpVisible ? 'Change' : 'Assign'}
                  </Button>
                </Grid>

                {(assignDate || editdata?.assigned_date || type !== null) && (
                  <Grid
                    size={{ lg: 3, md: 2, sm: 6, xs: 6 }}
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <Typography sx={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                      Assigned Date:{' '}
                      <span style={{ fontSize: '12px', fontWeight: 500 }}>
                        {editdata?.assigned_date
                          ? moment(editdata?.assigned_date).format('DD-MM-YYYY')
                          : moment().format('DD-MM-YYYY')}
                      </span>
                    </Typography>
                  </Grid>
                )}
              </Grid>

              <Grid container>
                <Grid
                  margin='10px 10px 10px 0px'
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
                    placeholder='Type'
                    label='Type'
                    name='type'
                    value={
                      formValues.type === null ? '' : formValues.type
                    }
                    color='primary'
                    type='text'
                    regex=''
                    variant='filled'
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
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: '10px' }}

                    onClick={() => {
                      if (formValues.type !== "" && formValues.issue !== "" && formValues.remarks !== "") {
                        let data = { type: formValues.type, issue: formValues.issue, remarks: formValues.remarks }
                        setFormValues({ ...formValues, type: "", issue: "", remarks: "" })
                        setissuedata((prev) => [...prev, data])
                      }
                    }}>
                    <AddIcon style={{ cursor: 'pointer' }} />
                  </div>
                </Grid>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  {issueDynamicProp?.length > 0
                    ? issueDynamicProp.map((prop) => {
                      return prop.type === 'List' ? (
                        <Grid
                          size={{
                            lg: 3,
                            md: 4,
                            sm: 4,
                            xs: 12
                          }}>
                          <Autocomplete
                            options={prop.property.options}
                            value={formData.service_dynamicPropValues[prop.name] || ''}
                            onChange={(event, value) =>
                              handleDynamicPropChange(prop.name, value, prop.property.required)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                required={prop.property.required}
                                label={prop.name}
                                variant='filled'
                                error={formErrors?.service_dynamicPropErrors[prop.name] &&
                                  formErrors.service_dynamicPropErrors[prop.name] !== null ? true : false
                                }
                                helperText={formErrors?.service_dynamicPropErrors[prop.name] &&
                                  formErrors.service_dynamicPropErrors[prop.name] !== null
                                  ? formErrors.service_dynamicPropErrors[prop.name] : ''
                                }
                              />
                            )}
                          />
                        </Grid>
                      ) : prop.type === 'Text Field' ? (

                        <Grid
                          size={{
                            lg: 3,
                            md: 4,
                            sm: 4,
                            xs: 12
                          }}>
                          <TextField
                            required={prop.property.required}
                            value={formData.service_dynamicPropValues[prop.name] || ''}
                            label={prop.name}
                            fullWidth
                            variant='filled'
                            onChange={(event) => handleDynamicPropChange(prop.name, event.target.value, prop.property.required)}
                            error={formErrors?.service_dynamicPropErrors[prop.name] && formErrors.service_dynamicPropErrors[prop.name] !== null ? true : false}
                            helperText={formErrors?.service_dynamicPropErrors[prop.name] && formErrors.service_dynamicPropErrors[prop.name] !== null ? formErrors.service_dynamicPropErrors[prop.name] : ''}
                          />
                        </Grid>
                      ) : prop.type === 'Date' ?

                        <Grid
                          size={{
                            lg: 3,
                            md: 4,
                            sm: 4,
                            xs: 12
                          }}>
                          <LocalizationProvider dateAdapter={DateAdapter}>
                            <DatePicker
                              label={prop.name}
                              value={toMomentOrNull(formData.service_dynamicPropValues[prop.name])}
                              format='DD/MM/YYYY'
                              required={prop.property.required}
                              onChange={(e) => {
                                if (e?._d) {
                                  handleDynamicPropChange(prop.name, moment(e._d).format(prop.property.dateFormat), prop.property.required)
                                }
                                else {
                                  handleDynamicPropChange(prop.name, null, prop.property.required)
                                }
                              }}
                              slotProps={{ textField: { fullWidth: true, variant: 'filled', required: prop.property.required, error: formErrors?.service_dynamicPropErrors[prop.name] && formErrors.service_dynamicPropErrors[prop.name] !== null ? true : false, helperText: formErrors?.service_dynamicPropErrors[prop.name] && formErrors.service_dynamicPropErrors[prop.name] !== null ? formErrors.service_dynamicPropErrors[prop.name] : '' } }}
                            />
                          </LocalizationProvider>
                        </Grid>
                        : prop.type === 'Date' ? (

                          <Grid
                            size={{
                              lg: 3,
                              md: 4,
                              sm: 4,
                              xs: 12
                            }}>
                            <LocalizationProvider dateAdapter={DateAdapter}>
                              <DatePicker
                                label={prop.name}
                                value={toMomentOrNull(formData.service_dynamicPropValues[prop.name])}
                                format='DD/MM/YYYY'
                                required={prop.property.required}
                                onChange={(e) => {
                                  if (e?._d) {
                                    handleDynamicPropChange(
                                      prop.name,
                                      moment(e._d).format('YYYY-MM-DD'),
                                      prop.property.required,
                                    );
                                  } else {
                                    handleDynamicPropChange(
                                      prop.name,
                                      null,
                                      prop.property.required,
                                    );
                                  }
                                }}
                                slotProps={{ textField: { fullWidth: true, variant: 'filled', required: prop.property.required, error: formErrors?.service_dynamicPropErrors[prop.name] &&
                                        formErrors.service_dynamicPropErrors[prop.name] !== null
                                        ? true
                                        : false, helperText: formErrors?.service_dynamicPropErrors[prop.name] &&
                                        formErrors.service_dynamicPropErrors[prop.name] !== null
                                        ? formErrors.service_dynamicPropErrors[prop.name]
                                        : '' } }}
                              />
                            </LocalizationProvider>
                          </Grid>
                        ) : prop.type === 'CheckBox' ? (

                          <Grid
                            size={{
                              lg: 3,
                              md: 4,
                              sm: 4,
                              xs: 12
                            }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={formData.service_dynamicPropValues[prop.name]}
                                  onChange={() =>
                                    setFormData({
                                      ...formData,
                                      service_dynamicPropValues: {
                                        ...formData.service_dynamicPropValues,
                                        [prop.name]:
                                          !formData.service_dynamicPropValues[prop.name],
                                      },
                                    })
                                  }
                                />
                              }
                              label={prop.name}
                            />
                          </Grid>
                        ) : prop.type === 'Radio' ? (

                          <Grid
                            size={{
                              lg: 3,
                              md: 4,
                              sm: 4,
                              xs: 12
                            }}>
                            <FormControl>
                              <FormLabel>{prop.name}</FormLabel>
                              <RadioGroup
                                value={formData.service_dynamicPropValues[prop.name]}
                                onChange={(event) =>
                                  handleDynamicPropChange(
                                    prop.name,
                                    event.target.value,
                                    false,
                                  )
                                }
                              >
                                {prop.property.options.map((option, index) => (
                                  <FormControlLabel
                                    key={index}
                                    value={option}
                                    control={<Radio />}
                                    label={option}
                                  />
                                ))}
                              </RadioGroup>
                            </FormControl>
                          </Grid>
                        ) : prop.type === 'Text Area' ?

                          <Grid
                            size={{
                              lg: 3,
                              md: 4,
                              sm: 4,
                              xs: 12
                            }}>
                            <TextField
                              fullWidth
                              required={prop.property.required}
                              value={formData.service_dynamicPropValues[prop.name] || ''}
                              label={prop.name}
                              variant='filled'
                              multiline={true}
                              onChange={(event) => handleDynamicPropChange(prop.name, event.target.value, prop.property.required)}
                              error={formErrors?.service_dynamicPropErrors[prop.name] && formErrors.service_dynamicPropErrors[prop.name] !== null ? true : false}
                              helperText={formErrors?.service_dynamicPropErrors[prop.name] && formErrors.service_dynamicPropErrors[prop.name] !== null ? formErrors.service_dynamicPropErrors[prop.name] : ''}
                            />
                          </Grid>
                          : prop.type === 'Time' ?

                            <Grid
                              size={{
                                lg: 3,
                                md: 4,
                                sm: 4,
                                xs: 12
                              }}>
                              <LocalizationProvider dateAdapter={DateAdapter}>
                                <TimePicker
                                  label={prop.name}
                                  value={toMomentOrNull(formData.service_dynamicPropValues[prop.name]) ? moment(formData.service_dynamicPropValues[prop.name]) : null}
                                  onChange={(e) => {
                                    if (e?._d) {
                                      handleDynamicPropChange(prop.name, moment(e._d).format(prop.property.timeFormat), prop.property.required)
                                    }
                                    else {
                                      handleDynamicPropChange(prop.name, null, prop.property.required)
                                    }
                                  }}
                                  slotProps={{ textField: { required: prop.property.required, variant: 'filled', fullWidth: true, error: formErrors?.service_dynamicPropErrors[prop.name] && formErrors.service_dynamicPropErrors[prop.name] !== null ? true : false, helperText: formErrors?.service_dynamicPropErrors[prop.name] && formErrors.service_dynamicPropErrors[prop.name] !== null ? formErrors.service_dynamicPropErrors[prop.name] : '' } }}
                                />
                              </LocalizationProvider>
                            </Grid>
                            : prop.type === 'Date & Time' ?

                              <Grid
                                size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12
                                }}>
                                <LocalizationProvider dateAdapter={DateAdapter}>
                                  <DateTimePicker
                                    label={prop.name}
                                    value={formData.service_dynamicPropValues[prop.name] ? moment(formData.service_dynamicPropValues[prop.name]) : null}
                                    onChange={(e) => {
                                      if (e?._d) {
                                        handleDynamicPropChange(prop.name, moment(e._d).format(prop.property.dateTimeFormat), prop.property.required)
                                      }
                                      else {
                                        handleDynamicPropChange(prop.name, null, prop.property.required)
                                      }
                                    }}
                                    slotProps={{ textField: { required: prop.property.required, variant: 'filled', fullWidth: true, error: formErrors?.service_dynamicPropErrors[prop.name] && formErrors.service_dynamicPropErrors[prop.name] !== null ? true : false, helperText: formErrors?.service_dynamicPropErrors[prop.name] && formErrors.service_dynamicPropErrors[prop.name] !== null ? formErrors.service_dynamicPropErrors[prop.name] : '' } }}
                                  />
                                </LocalizationProvider>
                              </Grid>
                              : null;
                    }) : null}
                </Grid>
                <Grid container>
                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    <IssueDetail issuedata={issuedata} handleDelete={handleDelete} handleEdit={handleEdit} editdata={editdata} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Card>

          {type === 'edit' && <Card style={{ margin: '5px 5px 5px 0px' }}>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Grid container margin='20px'>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Typography style={{ fontSize: '12px', fontWeight: '700', color: 'black' }}> Labor & Parts Information </Typography>
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
                        setselectedProduct(val);
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
                      lg: 3,
                      md: 3,
                      sm: 3,
                      xs: 3
                    }}>
                    <TextField
                      style={{ fontsize: "12px" }}
                      onChange={handleChange}
                      onBlur={handleChange}
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
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-end"
                    marginBottom="20px"
                    size={{
                      lg: 2,
                      md: 2,
                      sm: 2,
                      xs: 2
                    }}>
                    <TextField
                      style={{ fontsize: '12px' }}
                      fullWidth={true}
                      placeholder="Price"
                      label="Unit Price"
                      name="unit_price"
                      value={Selectedproduct?.unit_price || ''}
                      color="primary"
                      variant="filled"
                    />
                  </Grid>
                  <Grid
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    alignContent='center'
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
                  <RepairAndParts handleProdDelete={handleProdDelete} Selectedproduct={Selectedproduct} editdata={editdata} editData={editData}/>
                </Grid>
              </Grid>
            </Grid>
          </Card>}

          {type === 'edit' && <Card style={{ margin: '5px 5px 5px 0px' }}>
            <Grid container>
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Typography style={{ fontsize: '12px', fontWeight: '700', margin: '5px 0px 0px 10px' }}>Images</Typography>
              </Grid>
              <Grid
                gap={2}
                margin='10px'
                display='flex'
                flexDirection={smallscreen ? 'column' : 'row'}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid
                  size={{
                    lg: 5.9,
                    md: 5.9,
                    sm: 11.9,
                    xs: 11.9
                  }}>
                  <ImageUpload images={before_images} setImages={setBefore_Images} title='Before' editdata={editdata} />
                </Grid>
                <Grid
                  size={{
                    lg: 5.9,
                    md: 5.9,
                    sm: 11.9,
                    xs: 11.9
                  }}>
                  <ImageUpload images={after_images} setImages={setAfter_Images} title='After' editdata={editdata} />
                </Grid>
              </Grid>
            </Grid>
          </Card>}

          {type === 'edit' && <Card style={{ margin: '5px 5px 5px 0px' }}>
              <Grid
                padding='5px'
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <AttachmentField
                  previews={images}
                  setPreviews={setImages}
                  handleImageDelete={handleImageDelete}
                  handleChange={handleChange}
                  type='service'
                />
              </Grid>
            </Card>}

          {type !== 'edit' && <Grid container>
          <Grid
            size={{
              lg: 8,
              md: 8,
              sm: 12,
              xs: 12
            }}>
          <Card style={{ margin: '5px 5px 5px 0px' }}>
            <Grid container>
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Typography style={{ fontsize: '12px', fontWeight: '700', margin: '5px 0px 0px 10px' }}>Images</Typography>
              </Grid>
              <Grid
                gap={2}
                margin='10px'
                display='flex'
                flexDirection={smallscreen ? 'column' : 'row'}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid
                  size={{
                    lg: 5.9,
                    md: 5.9,
                    sm: 12,
                    xs: 12
                  }}>
                  <ImageUpload images={before_images} setImages={setBefore_Images} title='Before' editdata={editdata} />
                </Grid>
                <Grid
                  size={{
                    lg: 5.9,
                    md: 5.9,
                    sm: 12,
                    xs: 12
                  }}>
                  <ImageUpload images={after_images} setImages={setAfter_Images} title='After' editdata={editdata} />
                </Grid>
              </Grid>
            </Grid>
          </Card>
            </Grid>
          <Grid
            size={{
              lg: 4,
              md: 4,
              sm: 12,
              xs: 12
            }}>
          <Card style={{ margin: '5px 0px 5px 0px' }}>
              <Grid
                padding='10px 5px 40px 5px'
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <AttachmentField
                  previews={images}
                  setPreviews={setImages}
                  handleImageDelete={handleImageDelete}
                  handleChange={handleChange}
                  type='service'
                />
              </Grid>
            </Card>
            </Grid>
          </Grid>}

        </Grid>
        <Grid
          size={{
            lg: 4,
            md: 4,
            sm: 12,
            xs: 12
          }}>
          {type === 'edit' && <Card style={{ margin: '5px 0px' }}>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <CustomerIntraction />
            </Grid>
          </Card>}
          {type === 'edit' && <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Card style={{ margin: '5px 0px 5px 0px', p: '20px', width: '100%', height: '100%', }}>
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <TimeLine />
              </Grid>
            </Card>
          </Grid>}
        </Grid>
      </Grid>
      <CancelDialog
            delete={open}
            close={handleClose}
            handle={cancelDialog}
          ></CancelDialog>
      <Dialog
    open={billSummary}
    onClose={() => setBillSummary(false)}
    aria-labelledby='alert-dialog-title'
    aria-describedby='alert-dialog-description'
  >
    <DialogContent style={{width: 500}}>
      <DialogContentText
        id='alert-dialog-description'
        sx={{color: 'warning.main', font: '12px'}}
      >
        Do u want to generate bill summary
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setBillSummary(false)} color='secondary'>
        Cancel
      </Button>
      <Button onClick={billGenerate} color='primary' autoFocus>
        Ok
      </Button>
    </DialogActions>
  </Dialog>
      <Dialog
        open={closeCard}
        onClose={() => setCloseCard(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogContent style={{width: 500}}>
          <DialogContentText
            id='alert-dialog-description'
            sx={{color: 'warning.main', font: '12px'}}
          >
            Do u want to close the jobcard.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseCard(false)} color='secondary'>
            Cancel
          </Button>
          <Button onClick={closeJobcard} color='primary' autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={dynamicPropOpen}>
        <NewDynamicProperties type='proDynamicNewForm' handleClose={handleFormClose} dynamicProp={handleDynamicChange} variation={variation} />
      </Dialog>
      <Dialog open={printopen} onClose={() => setprintopen(false)} maxWidth="lg" >
    <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      <Card style={{ margin: '10px' }}>
        <Grid container>
          <Grid
            display='flex'
            justifyContent='center'
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <h4>SERVICE JOBSHEET</h4>
          </Grid>
          <Grid
            display='flex'
            flexDirection='row'
            justifyContent='end'
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              <Typography>Jobsheet Number : {serviceid}</Typography>
            </Grid>
            <Grid
              justifyContent='end'
              flexDirection='row'
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              <Typography>Date : {moment(editdata?.createdAt).format("DD-MM-YYYY")}</Typography>
              <Typography>Time : {moment(editdata?.createdAt).format("hh:mm A")}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Divider />
        <Grid
          display='flex'
          justifyContent='center'
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <h5>CARE CENTER DETAILS</h5>
        </Grid>

        {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} display='flex' flexDirection='row' > */}
        <Grid
          display='flex'
          justifyContent='end'
          flexDirection='column'
          size={{
            lg: 6,
            md: 6,
            sm: 6,
            xs: 6
          }}>
          <Typography>Care center code : </Typography>
          <Typography>Contact number : {editdata?.phone_number}</Typography>
          <Typography>E-mail :  {editdata?.email}</Typography>
          {/* </Grid> */}
        </Grid>

        <Divider />
        <Grid
          display='flex'
          justifyContent='center'
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <h5>CUSTOMER DETAILS</h5>
        </Grid>
        <Grid
          display='flex'
          flexDirection='row'
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid
            display='flex'
            justifyContent='start'
            flexDirection='column'
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 6
            }}>
            <Typography>Customer Name :  {editdata?.first_name} </Typography>
            <Typography>Contact number :  {editdata?.phone_number}</Typography>
          </Grid>
          <Grid
            display='flex'
            justifyContent='end'
            flexDirection='column'
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 6
            }}>
            <Typography>Address : {editdata?.address} </Typography>
            {/* <Typography>Alternate customer Number:</Typography> */}
            <Typography>E-mail : {editdata?.email}
            </Typography>
          </Grid>

        </Grid>


        <Divider />
        <Grid container>
          <Grid
            display='flex'
            justifyContent='center'
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <h5>PRODUCT DETAILS</h5>
          </Grid>
          <Grid
            display='flex'
            flexDirection='row'
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Grid
              display='flex'
              justifyContent='start'
              flexDirection='column'
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              <Typography>Model Name :  {formValues.model} </Typography>
              <Typography>Serial Number : {formValues.serial}  </Typography>
              <Typography>Brand Name : {formValues.brand}  </Typography>
              <Typography>Warranty Type : {formValues.warranty} </Typography>
            </Grid>
            <Grid
              display='flex'
              justifyContent='end'
              flexDirection='column'
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              <Typography>Advance Amount : {formValues.advance_amount} </Typography>
              <Typography>Target Delivery Date : {moment(formValues.target_delivery, 'YYYY-MM-DD').format('DD-MM-YYYY')} </Typography>
              <Typography>Recived Item : {formValues.model}</Typography>
              <Typography>Product Condition : {formValues.product_condition}</Typography>
              <Typography>Approx Estimate : {formValues.approx_estimate}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Divider />
        <Grid container>
          <Grid
            display='flex'
            justifyContent='center'
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <h5>PROBLEM DETAILS</h5>
          </Grid>
          <Grid
            display='flex'
            flexDirection='row'
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 6
            }}>





            <Grid
              display='flex'
              justifyContent='start'
              flexDirection='column'
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              <Typography>Repeat Repair : </Typography></Grid>

          </Grid>

          <Grid
            display='flex'
            justifyContent='end'
            flexDirection='column'
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 6
            }}>
            <Typography>Remarks : {formValues.remarks}</Typography>

          </Grid>
        </Grid>

        <Divider />


        <Grid container>

          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 3,
              xs: 3
            }}>
            <div>__________</div>

            <Typography>CCO Signature & Care Centre Stamp</Typography>
          </Grid>

          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 3,
              xs: 3
            }}>
            <div>_________</div>


            <Typography>Customer Signature on Receipt</Typography>
          </Grid>

          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 3,
              xs: 3
            }}>

            {/* <Typography>Do you allow flex to use personal information submitted in the Jobsheet to contact you for Tips & tricks or feedback on products & services? (YES)</Typography> */}

            <div>____________</div>

            <Typography>Customer Signature on Delivery</Typography>
          </Grid>



        </Grid>
        <Grid container>
          <Grid
            margin='10px'
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <TextField
              style={{}}
              onChange={handleChange}
              onBlur={handleChange}
              fullWidth={true}
              placeholder='Terms and Conditions'
              label='Terms and Conditions'
              name='terms and conditions'
              minRows={3}
              multiline

              color='primary'
              type='text'
              regex=''
              variant='filled'
              InputProps={{
                style: { fontSize: '12px' }
              }}
            />
          </Grid>
        </Grid>

        <Button onClick={dialogHandlePrint}
        >Print</Button>
        
        <Button onClick={handelcreate}>Create New</Button>
        <FormControl component='fieldset' style={{marginLeft: '5px'}}>
          <RadioGroup
            row
            aria-label='customer'
            value={papersize}
            name='customer_type'
            onChange={Change}
            
          >
            <FormControlLabel value='0' control={<Radio />} label='A5' />
            <FormControlLabel value='1' control={<Radio />} label='A4' />
          </RadioGroup>
        </FormControl>
        <Button>
       
        <SendInvoiceButton email={email}  />
        </Button>

      </Card>
    </div>
  </Dialog>
    </div>
  );
}
