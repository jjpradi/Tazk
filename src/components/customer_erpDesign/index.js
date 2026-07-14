import React, {useEffect, useState, useRef, useContext} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {
  Grid,
  IconButton,
  Tooltip,
  Card,
  Button,
  Typography,
  Box,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
  DialogContentText,
  Tabs,
  Tab,
  Autocomplete
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import OptionButton from '../erpDesign/actionButton';
import CustomerTopCards from './customerTopOrders';
import {getCustomerErpDetails} from '../../redux/actions/erpDetails_actions';
import BillsRow from './billsRow';
import LastBills from './lastBills';
import SalesGraph from '../purchaseDetails/salesGraph';
import PaymentReceipt from './paymentReceipt';
import {base_url} from '../../http-common';
import PrimaryContact from './primaryContact';
import Divider from '@mui/material/Divider';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import useMediaQuery from '@mui/material/useMediaQuery';
import TimeLine from './timeLine';
import StatementOfAccounts from './statementOfAccounts';
import customer_services from 'services/customer_services';
import apiCalls from 'utils/apiCalls';
import RecentPurchase from './recentpurchase'
import RecentCreditDebitNotes from './recentCreditDebitNotes';
import { getAppConfigDataAction } from 'redux/actions/app_config_actions';
import { listSalesAction, listSalesOutstandingAction } from 'redux/actions/sales_actions';
import { customerDetailByIdAction, customerSalesDetailAction, get_searchContactsActionFinal, getSalesCustomersByIdAction, getSearchByCustomerAction, getSearchByCustomersDataAction, imageUpload, listCustomerAction, setSearchByCustomersDataAction } from 'redux/actions/customer_actions';
import LeavesStatus from 'components/Payroll/leavesStatus';
import LateLogin from 'components/Payroll/lateLogin';
import RecentLeaves from './recentLeaves'
import { useInView } from 'react-intersection-observer';
import Loans from 'pages/Payroll/Loans';
import {  listAllLeaveRequestAction, listEmployeeLeaveHistoryAction, listEmployeeLeaveRequestAction } from 'redux/actions/leaveRequest_actions';
import { averageWorkHourAction, employeeLateLoginEarlyCheckoutAction, getEmpLocationActiveAction, topEmpByAttendanceAction, updateLocationStatusAction, updatepasswordaction, getEmpLocationAction } from 'redux/actions/payrollDashboard_actions';
import { employeeLoansAction, getEmployeeLoansDueAction } from 'redux/actions/loan_actions';
import { getUserRoleAction } from 'redux/actions/userRole_actions';
import AvatarViewWrapper from '../../utils/imgUpload'
import { useDropzone } from 'react-dropzone';
import EditIcon from '@mui/icons-material/Edit';
import Avatar from '@mui/material/Avatar';
import { useCustomFetch } from 'utils/useCustomFetch';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PayrollCards from './payrollCards';
import { getsessionStorage } from 'pages/common/login/cookies';
import ActiveDevices from './activeDevices';
import { activeDevicesList } from '../../redux/actions/payrollDashboard_actions';
import RelieveDialog from './relieveDialog';
import ResetDialog from 'pages/sales/vendorPriceList/ResetDialog';
import DeleteDialog from './DeleteDialog';
import moment from 'moment';
import { pageSize } from 'utils/pageSize';
import { commonDateFormat } from 'utils/getTimeFormat';
import Emp_location from 'components/Payroll/emp_location';
import { Switch } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { enableDisableEmpLoginAction } from 'redux/actions/userCreation_actions';
import CustomerLeadCards from 'pages/crm/leadManagement/CustomerLeadCards';
import LeadManagement from 'pages/crm/leadManagement';
import QuotationTable from 'pages/crm/Quotation/QuotationTable';
import { deleteRegisteredUser, getFaceAttendanceUrlAction, getRecordsById } from 'redux/actions/face_registration_action';
import { io } from 'socket.io-client';
import { ErrorAlert } from 'redux/actions/load';
import Transactions from './transactions';
import OverviewForAllCustType from '../../../src/components/customer_erpDesign/overview'
import AccountsOfStatements from './AccoutOfStatements';
import StatementOfAccount from '../../../src/components/customer_erpDesign/transactions/statementOfAccounts';
import CustomerOutstandings from './CustomerOutstandings';
import { linkVendorToCustomerAction, listVendorAction, unlinkVendorToCustomerAction } from 'redux/actions/vendor_actions';
import NewTransactions from './transactions/newTransaction';
import Details from './otherDetails/details';
import API_URLS from '../../utils/customFetchApiUrls';
import { getRoleAuthorization } from '../../@crema/utility/helper/RoleAuthHelper';
import { getUserRightsByRoleIdAction } from '../../redux/actions/role_actions';
import { getVendosByIdDataAction } from '../../redux/actions/vendor_actions';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { searchErrorMessage } from 'utils/content';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';

export default function App({
  // statementOfAccount,
  rowIndex,
  handleEdit,
  sales_customer_id,
  rowPopupClose,
  handleDelete,
  type,
  mail_configuration,
  customertype,
  customerid,
  posSaleRowIndex,
  posSaleData,
  designType = 'customer',
  setEditfind,
  setOnbackClick,
  backToSales,
  salesOrder,
  purchaseOrder,
  sample
  
}) {
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const customFetch = useCustomFetch()
  const storage = getsessionStorage()


  const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setselectData,
    setModalTypeHandler,
    commoncookie,
    headerLocationId,} = useContext(CreateNewButtonContext);
  const dispatch = useDispatch();
  const {
    customerReducer: {customer_filter, customer_paginate, Get_customer_statement, customer, customerSalesDetailById, customerDetailById},
    erpDetailsReducer: {customer_erp_details},
    stockLocationReducer: {stocklocation},
    salesReducer: {sales},
    leaveRequestReducer : {employeeId},
    PayrolldashboardReducers : {averageWorkHour, activedeviceslist,topEmpByAttendance,getActiveLocation,getEmpLocationpModel},    
    LoanReducer : {employeeLoansDueAmount},
    FaceRegistrationConfig: { getEmployeeListById },
    vendorReducer : {vendor},
     roleReducer: { user_rights } ,
     rbacReducer: {menuAccess}
  } = useSelector((state) => state);



  const [customerData, setcustomer] = useState('');
  console.log(customerData,"customerData")
  const [customer_id, setCustomer_id] = useState('');
  const [index, setIndex] = useState(rowIndex);
  const [user, setUsers] = useState([]);
  const [face, setFace] = useState([]);
  const [pdfOpen, setPdfOpen] = useState(false);
  const matches = useMediaQuery('(min-width:600px)');
  const [posSaleRow, setPosSaleRow] = useState(0);
  const [isRowNext,setIsRowNext] = useState(false);
  const [customerErpDetails, setCustomerErpDetails] = useState({});  // setting redux state into local state
  const [contactType, setContactType] = useState('');

  const [isApiFinished, setIsApiFinished] = useState(false);
  const [srcImage, setSuppplierData] = useState({});
  const [relieveOpen, setRelieveOpen] = useState(false);
  const [status,setStatus] = useState() ;
  const [appAccessEnabled, setAppAccessEnabled] = useState(false); 
  const [selectedTab, setSelectedTab] = useState(0); 
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [customerLinkDialogOpen, setCustomerLinkDialogOpen] = useState(false);
  const [linkedCustomer, setLinkedCustomer] = useState(null)
  const [linkedCustomerError, setLinkedCustomerError] = useState(null)
  const [customerSearchText, setCustomerSearchText] = useState('')
console.log("customerDetailById",type)

const [open, setOpen] = useState(false);
const [IO, setIO] = React.useState(null);

const handleTabChange = (event, newValue) => {
  setSelectedTab(newValue);
};

const handleClickOpen = () => {
  setOpen(true);
};

const handleClose = () => {
  setOpen(false);
};

// console.log(rowIndex,'rowIndex76a7sd8asd')

// console.log(rowIndex,
//   type,'peoppsdatyatat')

const [onbackClick, setOnbackClickLocal] = useState(false);

  useEffect(()=>{ (async () => {
    if(salesOrder === 'salesOrder'){
      const body = {
        searchString: '',
        type_details: 'Customer',
        type: 1,
        pageCount: 0,
        numPerPage: 100,
      }
      // await dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler))
     await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
       dispatch(getSalesCustomersByIdAction(sales_customer_id,
        (response) => {
          const validCustomers = response.filter(c => c.customer_id && c.company_name !== null);
          if (validCustomers.length > 0) {
            const filtered = validCustomers.filter(c => c.company_name !== null);
            const index = filtered.findIndex(c => c.customer_id === sales_customer_id);
            setCustomer_id(sales_customer_id);
            setIndex(index)
            rowIndex = index
          } else {
            console.log("No valid customers with customer_id found.");
          }
      }
    ))
      )
    }

    if(purchaseOrder === 'purchaseOrder'){
      const body = {
        searchString: '',
        type_details: 'Supplier',
        type: 2,
        pageCount: 0,
        numPerPage: 100,
      }
     await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
      // await dispatch(get_searchContactsActionFinal(body, setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(getVendosByIdDataAction(sales_customer_id,
      (response) =>{
        const validSuppliers = response.filter(c => c.supplier_id);
        // console.log("validSuppliers",validSuppliers)
        if (validSuppliers.length > 0) {
          const filtered = validSuppliers.filter(c => c.company_name !== null);
          const index = filtered.findIndex(c => c.supplier_id === sales_customer_id);
          // console.log(index,'werrwerwe',sales_customer_id,filtered)
          setCustomer_id(sales_customer_id);
          setIndex(index)
          setcustomer(validSuppliers[0]);
          rowIndex = index
        } else {
          console.log("No valid customers with customer_id found.");
        }
      }
    )))
    }
  })();
},[salesOrder,purchaseOrder])

  useEffect(()=>{
    // dispatch(getUserRightsByRoleIdAction())
    dispatch(setSearchByCustomersDataAction([]))
  },[])

  const selectedRole = storage.role_name
  useEffect(() => {
    dispatch(getMenuAccessAction(selectedRole));
  }, [selectedRole, dispatch]);

  const custData =  customer?.filter(c => c.company_name !== null && c.customer_id)
  const custData1 =  vendor?.filter(c => c.company_name !== null && c.supplier_id)

  let customer_data = salesOrder === 'salesOrder' ? custData : purchaseOrder === 'purchaseOrder' ? custData1 :  customer_paginate  ;

  const [personId, setPersonId] = useState(customer_data?.[index]?.person_id || null)  


  useEffect(() => {
   
    if (typeof setOnbackClick === 'function') {
      setOnbackClick(onbackClick);
    }
  }, [onbackClick, setOnbackClick]);

  const handleBackButtonClick = () => {
    
    if (typeof setOnbackClick === 'function') {
      setOnbackClick(true);
    } else {
      setOnbackClickLocal(true);
    }
  };
console.log("customerErpDetails",customerErpDetails)
  const [lateLogin, setLateLogin] = useState({
    page: 0,
    pageSize: 5
  });
  const [lp, setLP] = useState({
    page: 0,
    pageSize: 5
  });
  const [loan, setLoan] = useState({
    page: 0,
    pageSize: 5
  });
const [password,setpassword] = useState("")
  const handlePageChangeL = (page) => {
    setLateLogin({...lateLogin, page})
  }

  const handlePageSizeChangeL = (pageSize) => {
    setLateLogin({...lateLogin, pageSize})
  }

  const handlePageChangeLP = (page) => {
    setLP({...lp, page})
  }

  const handlePageSizeChangeLP = (pageSize) => {
    setLP({...lp, pageSize})
  }

  const handlePageChangeLoan = (page) => {
    setLoan({...lp, page})
  }

  const handlePageSizeChangeLoan = (pageSize) => {
    setLoan({...lp, pageSize})
  }

  const {ref, inView, entry} = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  
  useEffect(()=>{
    setCustomerErpDetails(customer_erp_details);
   
  },[customer_erp_details]);

  function generatePassword(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let pass = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        pass += characters[randomIndex];
    }
    return pass;
}
  const id = customerData?.employee_id
  // console.log("customerData?.employee_id",customerData)
  useEffect(() => { (async () => {
    if (id) {
    await  apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getRecordsById(id,(res)=>{
          // console.log("res",res)
          setUsers(res)
        })),
        dispatch(getFaceAttendanceUrlAction((res)=>{
          // console.log("sdasd7777",res)
          setFace(res)
        })),
      )
      setpassword(generatePassword(8))
    }
  })();
}, [id])
  
  // React.useEffect(() => {
  //   let ioconn
  //   let FACE_ATT_URL = face
  //   console.log("23sdd",FACE_ATT_URL)
  //   if(!FACE_ATT_URL && !id) return
    
  //   if(typeof FACE_ATT_URL !== 'string') return 
  //   ioconn = io.connect(FACE_ATT_URL, {
  //     reconnection: true,
  //     reconnectionAttempts: Infinity,
  //     reconnectionDelay: 1000,
  //     reconnectionDelayMax: 5000,
  //     randomizationFactor: 0.5,
  //     timeout: 20000,
  //   });
  //   ioconn?.on("connect", () => {
  //   });
  //   ioconn?.on("disconnect", () => {
  //   });

  //   setIO(ioconn);
  //   const handleResponse = (val) => {
  //     if (val?.status?.includes("successfully") || val?.status?.includes("please register newly")) {
  //       // console.log("00000",val)
  //       handleDeleteRegisteredUser()
  //     }
  //     else{
  //       ErrorAlert(dispatch, { message: 'Something Went Wrong. Please try again.' });
  //       handleClose();
  //     }
  //   }

  //   ioconn?.on("reregister_response", handleResponse);


  //   return () => {
  //     if (ioconn) {
  //       ioconn?.disconnect();
  //     }
  //   };

  // }, [face,id]);

  // const handleDeleteRegisteredUser = () => {
  //   const id = customerData?.employee_id
  //   // console.log("sds",id)
  //   if (id) {
  //     apiCalls(
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //       dispatch(
  //         deleteRegisteredUser(
  //           id,
  //           (res) => {
  //             if (res) {
  //               dispatch(getRecordsById(id, (res) => {
  //                 // console.log("res",res)
  //                 setUsers(res)
  //               }))
  //             }
  //           }
  //         ),
  //       )
  //     );
  //   }

  //   handleClose();
  // };

  const deleteSocketHandler = () => {

    if (IO?.connected) {
      IO?.emit("reregister", storage?.company_id, parseInt(customerData?.employee_id))
    }
    else {
      ErrorAlert(dispatch, { message: 'Something Went Wrong. Please try again.' });
    }
  }

  console.log(customerData,"lkl")

  useEffect(() => {
    if(activedeviceslist.length > 0){
      setAppAccessEnabled(activedeviceslist[0].app_access)
    }
  }, [activedeviceslist])

  const checkType = () => {
    let result = ''

    // console.log(customer_data,index,salesOrder,'salesOrderfwqedqwe')
    
    if (customer_data[index]?.customer_id || salesOrder === 'salesOrder' ) {
      // console.log('inc11111')
      result = 'Customer'
    }

    else if (customer_data[index]?.supplier_id || purchaseOrder === 'purchaseOrder') {
      // console.log('inc22222')
      result = 'Supplier'
    }
    else if(designType === 'posSale'){
       result = 'Possalecustomer'
    }

    else if ( !(customer_data[index]?.supplier_id) && !(customer_data[index]?.customer_id)) {
      result = 'Employee'
    }

    // else if (salesOrder === 'salesOrder'){
    //   result = 'Customer'
    // }

    return result
  }

  useEffect(() => {
    // console.log('next customer details', customerDetailById);
    if(customerDetailById.length > 0){
      setCustomer_id(customerDetailById[0].customer_id);
      setcustomer(customerDetailById[0]);
    }
  }, [customerDetailById])
  
  // console.log(customer_data,'custtype', checkType(), index, customerDetailById)
  const func1 = async () => {
    if (index !== '' && salesOrder !== 'salesOrder' && purchaseOrder !== 'purchaseOrder') {
      const customer_id = customer_data[index]?.customer_id
      ? customer_data[index]?.customer_id
      : customer_data[index]?.supplier_id;
      const type = customer_data[index]?.customer_id ? 'Customer' : 'Supplier';
      console.log(index,'indexasdasd',type)
      setContactType(type);
      setCustomerErpDetails({});  //Emptying state before getting new data
      await apiCalls(
       setModalTypeHandler,
       setLoaderStatusHandler,
        storage?.company_type !== 5 && customer_id && dispatch(getCustomerErpDetails(customer_id, type, setLoaderStatusHandler)),
        console.log('Customerdetaatata',customer_id),
        type === 'Customer' && dispatch(customerSalesDetailAction(customer_id, commoncookie)),
        type === 'Customer' && dispatch(customerDetailByIdAction(customer_id))
      );
      setCustomer_id(customer_id);
      setcustomer(customer_data[index]);
    }
    else if (salesOrder === 'salesOrder') {
      const customer_id = sales_customer_id
      const type =  'Customer';
      // console.log(index,'indexasdasd',type,sales_customer_id)
      setContactType(type);
      setCustomerErpDetails({});  //Emptying state before getting new data
     await apiCalls(
        setLoaderStatusHandler,
        setModalTypeHandler,
        storage?.company_type !== 5 && customer_id && dispatch(getCustomerErpDetails(customer_id, type, setLoaderStatusHandler)),
        // console.log('Customerdetaatata',customer_id),
        type === 'Customer' && dispatch(customerSalesDetailAction(customer_id, commoncookie)),
        type === 'Customer' && dispatch(customerDetailByIdAction(customer_id))
      );
      setCustomer_id(customer_id);
      // setcustomer(customer_data[index]);
    }
    else if (purchaseOrder === 'purchaseOrder') {
      const customer_id = sales_customer_id
      const type =  'Supplier';
      // console.log(index,'indexasdasd',type,sales_customer_id)
      setContactType(type);
      setCustomerErpDetails({});  //Emptying state before getting new data
      apiCalls(
        setLoaderStatusHandler,
        setModalTypeHandler,
        storage?.company_type !== 5 && customer_id && dispatch(getCustomerErpDetails(customer_id, type, setLoaderStatusHandler)),
        // console.log('Customerdetaatata',customer_id),
        type === 'Customer' && dispatch(customerSalesDetailAction(customer_id, commoncookie)),
        type === 'Customer' && dispatch(customerDetailByIdAction(customer_id))
      );
      setCustomer_id(customer_id);
      console.log(customer_data,'customer_data345345',index,rowIndex)
      setcustomer(customer_data[index]);
    }
    
    else {
    if (isRowNext) {
        const type = 'Customer'
        const posCustomerIndex = posSaleData?.find((e, i) => +i === +posSaleRow)
        setContactType(type);
        await apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          storage?.company_type !== 5 && dispatch(getCustomerErpDetails(posCustomerIndex.customer_id, type, setLoaderStatusHandler),
            type === 'Customer' && dispatch(customerSalesDetailAction(posCustomerIndex?.customer_id, commoncookie)),
            type === 'Customer' && dispatch(customerDetailByIdAction(posCustomerIndex?.customer_id))
          ));
         console.log('posCustomerIndex.customer_id', posCustomerIndex.customer_id, customerData)
        // const customerIndex = customerDetailById?.find(e => +e.customer_id === +posCustomerIndex.customer_id)
        // setCustomer_id(customerIndex.customer_id);
        // setcustomer(customerIndex);
      }
      else {
        const type = 'Customer'
        //const customerIndex = customerDetailById?.find(e => +e.customer_id === +customerid)
       await setContactType(type);
        console.log('hjjjjjjjjjjjjjj', type)
       await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
          dispatch(getCustomerErpDetails(customerid, type, setLoaderStatusHandler),
            type === 'Customer' && dispatch(customerSalesDetailAction(customerid, commoncookie)),
            type === 'Customer' && dispatch(customerDetailByIdAction(customerid, (response) =>{
              console.log('responseeeee', response)
              console.log('customerrrr', customerDetailById, response)
              // if(response.length > 0){
              //   const customerIndex = response?.find(e => +e.customer_id === +customerid)
              //   setcustomer(customerIndex);
              // }
            }))
          ));
          // console.log('customerrrr', customerIndex)
          //await setcustomer(customerIndex);
       await setCustomer_id(customerid);
       await setPosSaleRow(posSaleRowIndex)
      }
    }
  };
  // console.log('customerDataaaa', checkType)
 
  useEffect(() => {
    if (index !== '') {
      setPersonId(customer_data[index]?.person_id)
    }
  }, [index]);

  useEffect(() => {
    if (customertype === 3) {
      let data = {
        page: lateLogin.page,
        pageSize: lateLogin.pageSize
      }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(employeeLateLoginEarlyCheckoutAction(personId, data)),
      )
    }

  }, [personId, lateLogin]);

  useEffect(() => {
    if (customertype === 3) {
      let data = {
        page: lp.page,
        pageSize: lp.pageSize,
        leaveType: null
      }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(listEmployeeLeaveRequestAction(personId, data)),
      )
    }

  }, [personId, lp]);

  // useEffect(() => {
  //   if (customertype === 3) {
  //     let data = {
  //       page: loan.page,
  //       pageSize: loan.pageSize
  //     }
  //     apiCalls(
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //       dispatch(employeeLoansAction(personId, data))
  //     )
  //   }

  // }, [personId, loan]);

  useEffect(() => {
    if(customertype === 3){
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,

        dispatch(
          listEmployeeLeaveHistoryAction(
            personId,
            setModalTypeHandler,
            setLoaderStatusHandler,
          ),
        ),

        // dispatch(employeeLateLoginEarlyCheckoutAction(personId)),

        // dispatch(listEmployeeLeaveRequestAction(personId)),

        // dispatch(employeeLoansAction(personId)),

        dispatch(averageWorkHourAction(personId)),

        dispatch(getEmployeeLoansDueAction(personId)),

        // dispatch(topEmpByAttendanceAction("contact")),

        dispatch(
          activeDevicesList(
            personId,
            setModalTypeHandler,
            setLoaderStatusHandler,
          ),
        )

      ).finally(() => setIsApiFinished(true));
    }

  }, [personId]);

  // useEffect(() =>{
  //   dispatch(
  //     activeDevicesList(
  //       personId,
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //     ),
  //   )
  // },[personId])


  ref1.current = func1;
  useEffect(() => {
    ref1.current();
  }, [index,posSaleRow]);

  const func2 = () => {
    setIndex(rowIndex);
  };

  ref2.current = func2;

  useEffect(() => { 
    let customerindex=customer_data.findIndex((i) =>
       i.id === customerid
      )
      setIndex(customerindex);
  }, [customerid]);

  useEffect(() => { (async () => {
    await ref2.current();
  })();
}, [rowIndex]);

// useEffect(()=>{
//   const type = 'Customer'
//       const customerIndex = customer?.find(e => +e.customer_id === +customerid)
//       setContactType(type);
//       dispatch(
//         getCustomerErpDetails(customerid, type, setLoaderStatusHandler),
//       );
//       setCustomer_id(customerid);
//       setcustomer(customerIndex);
// },[])  

  const handleCustomerChange = (option) => {
    const indexData = customer_data[index];
    if (option === 0) {
      handleEdit(indexData, index, 'erp');
    } else if (option === 1) {
        if(customertype === 3){ //----------------------------------------------------- employee ---------------------------------------------------------------
          handleDelete(indexData.person_id)
          // <DeleteDialog
          // handleDelete={handleDelete}
          // />
        }
        else { //------------------------------------------------------------------------ customer or vendor ---------------------------------------------------------------
          // handleDelete([indexData.customer_id], indexData.supplier_id);
          if(customer_data[index]?.linkedCustomer){
            setUnlinkDialogOpen(true)
          }
          else{
            setCustomerLinkDialogOpen(true)
            // dispatch(listCustomerAction(null,null))
          }
        }
    } else if (option === 2) {
      setRelieveOpen(true)
      // setPdfOpen(true);
    }
  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const checkIsValid = (val) => {
    if (typeof val === 'undefined') return '';
    if (val === null || val === 'null') return '';
    return val;
  };

  const nextClick = () => {
    if (index !== '') {
      setIndex(index + 1)
      // setPersonId(customer_data[index]?.person_id)
    }
    else {
      setIsRowNext(true)
      setPosSaleRow(posSaleRow + 1)
    }
  }

  const previousClick = () => {
    if (index !== '') {
      setIndex(index - 1)
    }
    else {
      setIsRowNext(true)
      setPosSaleRow(posSaleRow - 1)
    }
  }

  const [image, setImage] = useState(null)


const { getRootProps, getInputProps } = useDropzone({
  accept: {
    'image/jpeg': [],
    'image/png': [],
    'image/jpg': []
  },
  multiple: false,
  onDrop: (acceptedFiles) => {
    const file = acceptedFiles[0];

    if (!file) return;

    // 🔒 extra safety
    if (!file.type.startsWith('image/')) {
      alert('Only image files allowed!');
      return;
    }

    var reader = new FileReader();

    reader.onload = function (event) {
      const img = new Image();

      img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const jpegUrl = canvas.toDataURL('image/jpeg');

        setImage(jpegUrl);
        setImageStatus(false);
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  }
});
  const [imageStatus, setImageStatus] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isEnabled2, setIsEnabled2] = useState(false);
  const [location, setLocation] = useState()
  const [reset, setReset] = useState(false)
  const [reset_id, setReset_id] = useState()
  const [resetconfirm, setResetConfirm] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    
    if (image !== null) {
      setIsEnabled(true)
      
    }

  }, [image, imageStatus])


  // useEffect(() => {

  //   if (customerData[index]?.customer_id) {
  //     let CustId = customer_paginate[index]?.customer_id
  //     const { data: srcImage } = await customFetch(`/customer/customerDetailImgById/${CustId}`, 'GET', {})
  //     const suppData = srcImage
  //     setSuppplierData(suppData)
  //   }
  //   if (customerData[index]?.supplier_id) {
  //     let suppId = customer_paginate[index]?.supplier_id
  //     const { data: srcImage } = await customFetch(`/customer/vendorDetailsById/${suppId}`, 'GET', {})
  //     const suppData = srcImage
  //     setSuppplierData(suppData)
  //   }

  //   if (!(customer_data[index]?.supplier_id) && !(customer_data[index]?.customer_id)) {
  //     let personId = customer_paginate[index]?.person_id
  //     const { data: srcImage } = await customFetch(`/customer/EmployeeDetailsById/${personId}`, 'GET', {})
  //     const suppData = srcImage
  //     setSuppplierData(suppData)
  //   }

  // }, [])
  const updatepassword=async()=>{

    if (!password || password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
      }
    let data={
      employee_id:customer_data[index]?.employee_id,
      password
    }
    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
    dispatch(updatepasswordaction(data, setModalTypeHandler, setLoaderStatusHandler)))
    // setpassword('');
    setShowPassword(true);
    setTimeout(() => {
      setShowPassword(false);
    }, 60000);
  }
  useEffect(() => { (async () => {

    if (checkType() === 'Customer') {
      console.log('custttt11111')
      let CustId = salesOrder === 'salesOrder' ? sales_customer_id : customer_paginate[index]?.customer_id
      const { data: srcImage } = await customFetch(
        API_URLS.GET_CUSTOMER_IMAGE_BY_ID(CustId),
        'GET',
        {}
      );
      const suppData = {image: srcImage.images.length > 0 ? srcImage.images[0].img_url : ''}
      setSuppplierData(suppData)
    }
    if (checkType() === 'Possalecustomer') {
      console.log('custttt2222')
      // let CustId = customer_paginate[index]?.customer_id
      const { data: srcImage } = await customFetch(
        API_URLS.GET_CUSTOMER_IMAGE_BY_ID(customerid),
        'GET',
        {}
      );
      const suppData = {image: srcImage.images.length > 0 ? srcImage.images[0].img_url : ''}
      setSuppplierData(suppData)
    }

    if (checkType() === 'Supplier') {
      let suppId = purchaseOrder === 'purchaseOrder' ? sales_customer_id : customer_paginate[index]?.supplier_id
      const { data: srcImage } = await customFetch(
        API_URLS.GET_VENDOR_DETAILS_BY_ID(suppId),
        'GET',
        {}
      );
      const suppData = srcImage
      setSuppplierData(suppData)
    }

    if (checkType() === 'Employee') {
      let personId = customer_paginate[index]?.person_id
      const { data: srcImage } = await customFetch(
        API_URLS.GET_EMPLOYEE_DETAILS_BY_ID(personId),
        'GET',
        {}
      );
      const suppData = srcImage
      setSuppplierData(suppData)
    }

  })();
}, [])
  console.log('designType', designType)
  // useEffect(() => {
  //   const data = image || {}

  //   // dispatch(listUserByid(commoncookie, setModalTypeHandler, setLoaderStatusHandler));
  //   Object.keys(data).map((d)=>{
  //     setImage(d,  data[d])
  //   })
   
  // }, [image]);
  const handleChange = async (e) => {
    let { name, value } = e.target;
    setLocation(value);
  };

console.log(location,'location');
  const handleImage = () => {
    const type = checkType();

    const Id = type === 'Customer' ? customer_data[index]?.customer_id : (type === 'Supplier' ? customer_data[index]?.supplier_id : type === 'Possalecustomer' ? customerid : customer_data[index]?.person_id   )

    let data = {
      customer_id: Id,
      image: image,
      customer_type:type
    }

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(imageUpload(data, () => {
        setSuppplierData(prevState => ({
            ...prevState,
            [Id]: image
        }));
    }))
    )
    setIsEnabled(false)
  }

  const handesetSaveTrue = () => {
    setIsEnabled(true)
  }

  const byteArray = new Uint8Array(customerDetailById[0]?.image?.data);
  const blob = new Blob([byteArray], { type: 'image/jpg' }); // Assuming it's a JPEG image

  const imageUrl = URL.createObjectURL(blob);

  const resetDialog = (id) => {
    // console.log(id,rowData, 'SSSSSSD')
    // this.setState({ reset: true, id: id });
    setReset(true);
    setReset_id(id)
  }
 

 const resetClose = () => {
  //  this.setState({open: false, dialog: false, reset: false});
    setReset(false)
  };
  console.log(customerData?.employee_id,'kgkhg');

  // const onInActive = (locationName) => {
  //   getActiveLocation.map((e)=>  {if(e.location_name === locationName){
  //       return setStatus(e.id)
  //   }})
  // }

  // useEffect(()=>{
  //   dispatch(updateLocationStatusAction(status))
  // },[status])



const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
};


const openInMaps = (lat, long) => {
  console.log("LatLong", lat, long)
  const url = `https://www.google.com/maps?q=${lat},${long}`;
  window.open(url, '_blank')
} 

const onInActiveButton = async(location_id, empId) => {
  
  await apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(updateLocationStatusAction(location_id)),
    dispatch(getEmpLocationAction(empId)),
    // dispatch(getEmpLocationActiveAction(empId))
)
}

const handleToggleChange = async() => {
  setAppAccessEnabled(!appAccessEnabled)
 await apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(enableDisableEmpLoginAction({
      employee_id :customerData?.employeeId,
      app_access : !appAccessEnabled
    }
    ))
  )
};

const handleCustomerLinkDialogClose = () => {
  setLinkedCustomer(null)
  setLinkedCustomerError(null)
  setCustomerLinkDialogOpen(false)
  dispatch(setSearchByCustomersDataAction([]))
  setCustomerSearchText('')
}

const handleCustomerLinkSubmit = async (event) => {
  event.preventDefault()

  if(linkedCustomer === null){
    setLinkedCustomerError('Customer is Required')
    return
  }
  else{
    const payload = {
      supplier_id: customer_id,
      customer_id: linkedCustomer.customer_id
    }
    await dispatch(linkVendorToCustomerAction(payload))
    handleCustomerLinkDialogClose()
    setLoaderStatusHandler(true)
    rowPopupClose()
    setLoaderStatusHandler(false)
    handleBackButtonClick()
  }
}

const handleUnlinkCustomer = async () => {
  const payload = {
    supplier_id: customer_id,
    customer_id: customer_data[index]?.linkedCustomer
  }
  await dispatch(unlinkVendorToCustomerAction(payload))
  setUnlinkDialogOpen()
  setLoaderStatusHandler(true)
  rowPopupClose()
  setLoaderStatusHandler(false)
  handleBackButtonClick()
}

let imagesArray = user.length > 0 && user[0]?.images ? JSON.parse(user[0].images) : [];
console.log("imagesArray",imagesArray)
let profileImage = imagesArray.length > 0 ? imagesArray[0] : '/default-profile.png';

// console.log(salesOrder,'salesOrder',checkType(),backToSales)


// console.log(index,'customerdasd',customer_paginate)

const handleCustomerSearchAPICall = (searchText) => {
  if(searchText.length >= 3) {
    const payload = {
      searchString: searchText
    }
    dispatch(getSearchByCustomersDataAction(payload))
    setCustomerSearchText('')
  }
  else {
    dispatch(OpenalertActions({msg: searchErrorMessage, severity: 'warning'}))
  }
}

const handleCloseCustomerDetails = () => {
  setLinkedCustomer(null)
  setCustomerSearchText('')
  dispatch(setSearchByCustomersDataAction([]))
}

const handleAutoSearchApicall = (searchText) => {
  dispatch(setSearchByCustomersDataAction([]))
  const payload = {
    searchString: searchText
  }
  dispatch(getSearchByCustomerAction(
    payload,
    setModalTypeHandler,
    setLoaderStatusHandler
  ))
}


  return (
    <div
      style={{
        height: 'calc(100vh - 80px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {
        checkType() !== "Employee"  ? 
        <>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      
       <Tabs value={selectedTab} onChange={handleTabChange}>
         <Tab label="General" />
         <Tab label="Transactions" />
           {customertype !== 0 &&
         <Tab label="Statement" /> }
         {/* <Tab label="NewTransactions" /> */}
         {/* {
          checkType() !== "Supplier" && */}
          {customertype !== 0 && <Tab label='Outstanding' />}
          {customertype === 1 && <Tab label='Other Details' />}
         {/* } */}
       </Tabs>

     <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
         <Button
          variant="contained"
          color="inherit"
          onClick={() => {
            // setLoaderStatusHandler(true);
            // rowPopupClose();
            // setLoaderStatusHandler(false);
            // setEditfind(false);
            // handleBackButtonClick();
            if (salesOrder === 'salesOrder' || purchaseOrder === 'purchaseOrder') {
              backToSales();
            } else {
              setLoaderStatusHandler(true);
              rowPopupClose();
              setLoaderStatusHandler(false);
              setEditfind(false);
              handleBackButtonClick();
            }
          }}
        >
          Back
        </Button>

        {designType === "customer" && checkType() !== "Employee" && (
          <OptionButton
            handleCustomerChange={handleCustomerChange}
            type={type}
            customer_data={customer_data[index]?.person_id}
            checkType={checkType()}
            customerVendorLinked={customer_data[index]?.linkedVendor || customer_data[index]?.linkedCustomer || null}
            user_rights={menuAccess}
          />
        )}

        <Tooltip title="Previous">
          <IconButton
            color="primary"
            disabled={ (salesOrder === 'salesOrder') ||
                      (purchaseOrder === 'purchaseOrder') ||
                      (designType === 'posSale' ? posSaleRow === 0 : index === 0)
                    }
            onClick={() => previousClick()}
          >
            <ArrowBackIosIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Next">
          <IconButton
            color="primary"
            disabled={
              (salesOrder === 'salesOrder') ||
                      (purchaseOrder === 'purchaseOrder') ||
              (designType === "posSale"
                ? posSaleData.length - 1 === posSaleRow
                : customer_data.length - 1 === index)
            }
            onClick={() => nextClick()}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>

      {selectedTab === 0 && (<OverviewForAllCustType customerData={customerData} customerErpDetails={customerErpDetails} contactType={contactType} customer_data={customer_data} handleImage={handleImage} index={index} checkType={checkType} setEditfind={setEditfind} rowPopupClose={rowPopupClose} srcImage={srcImage} isEnabled={isEnabled} customerType={customertype} customer_id={customer_id} getInputProps={getInputProps} getRootProps={getRootProps} handleBackButtonClick={handleBackButtonClick} func1={func1} matches={matches}/>)}
      {selectedTab === 1 && (<NewTransactions customerErpDetails = {customerErpDetails}customerType={customertype}contactType={contactType}customer_id={customer_id}customerSalesDetailById={customerSalesDetailById}customerData={customerData}/>)}
      {selectedTab === 2 && customertype !== 0 &&  <StatementOfAccount customer_id={customer_id} supplier_id = {customer_id} type = {checkType()} customerVendorLinked={customer_data[index]?.linkedVendor || customer_data[index]?.linkedCustomer || null}/> }
      {selectedTab === 3 && <CustomerOutstandings customer_id={customer_id} type = {checkType()} contactType={contactType} customerVendorLinked={customer_data[index]?.linkedVendor || customer_data[index]?.linkedCustomer || null} />}
      {(selectedTab === 4 && customertype === 1) && <Details customerDetailById={customerDetailById} customer_id={customer_id} type = {checkType()} contactType={contactType} customerVendorLinked={customer_data[index]?.linkedVendor || customer_data[index]?.linkedCustomer || null} />}
        </> : <>
      <ResetDialog
                reset={reset}
                handleClose={resetClose}
                id={reset_id}
                setResetConfirm ={setResetConfirm}
              />
      {pdfOpen === true && (
        <StatementOfAccounts
          customer_id={customer_data[index].customer_id}
          Get_customer_statement={Get_customer_statement}
          setPdfOpen={setPdfOpen}
        />
      )}
      {pdfOpen === false && (
        <Grid container>
          <Grid
            display='flex'
            justifyContent='flex-end'
            mb='10px'
            size={{
              xs: 12,
              lg: 12,
              sm: 12,
              md: 12
            }}>
            <div style={{marginLeft: 'auto'}}>
              <Grid container spacing={2}>
                <Grid>
                  <Button
                    variant='contained'
                    onClick={() => {
                      if (salesOrder === 'salesOrder') {
                        backToSales();
                      } else {
                        setLoaderStatusHandler(true);
                        rowPopupClose();
                        setLoaderStatusHandler(false);
                        setEditfind(false);
                        handleBackButtonClick();
                      }
                    }}
                    sx={{}}
                    color='inherit'
                  >
                    Back
                  </Button>
                </Grid>

                {checkType() === "Employee" && (
                  <Grid>
                   { console.log("typeeee")}
                    <OptionButton
                      handleCustomerChange={handleCustomerChange}
                      type={type}
                      customer_data={customer_data[index]?.person_id}
                      checkType={checkType()}
                      user_rights={menuAccess}
                    />
                  </Grid>
                )}

                {designType === 'customer' && checkType() !== "Employee" && (
                  <Grid>
                    <OptionButton
                      handleCustomerChange={handleCustomerChange}
                      type={type}
                      customer_data={customer_data[index]?.person_id}
                      checkType={checkType()}
                      user_rights={menuAccess}
                    />
                  </Grid>
                )}
                
                <Grid>
                  <Tooltip title='Previous'>
                    <IconButton
                      color='primary'
                      disabled={
                          (salesOrder === 'salesOrder') ||
                          (purchaseOrder === 'purchaseOrder') ||
                          (designType === 'posSale' ? posSaleRow === 0 : index === 0)
                      }
                      component='span'
                      onClick={() => previousClick()}
                    >
                      <ArrowBackIosIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title='Next'>
                    <IconButton
                      color='primary'
                      disabled={
                        (salesOrder === 'salesOrder') ||
                      (purchaseOrder === 'purchaseOrder') ||
                        (designType === 'posSale'
                          ? posSaleData.length - 1 === posSaleRow
                          : customer_data.length - 1 === index)
                      }
                      component='span'
                      onClick={() => nextClick()}
                    >
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </div>
          </Grid>
          <Card variant='outlined' style={{width: '100%'}}>
            <Grid container direction='row'>
              {/* <Grid size={{ md: 12, lg: 12 }}> */}
              <Grid
                style={{
                  borderRight: matches && '1px #d9dadc solid',
                  padding: '6px',
                }}
                size={{
                  md: 12,
                  lg: 3,
                  sm: 12,
                  xs: 12
                }}>
                <div style={{minHeight: 40,paddingBottom:'10px'}}>
                    <Box sx={{minHeight: 19  ,  display:'flex' , justifyContent:'center'}}>
	                    <Card
	                      // variant='outlined'
	                      style={{ width: '100%', height: '12rem', padding: '10px', borderRadius: '50px' , backgroundColor: '#f5f5f5', overflow: 'visible' }}
	                    >
	                      <Grid onClick={ handesetSaveTrue } sx={{minHeight: 19  ,  display:'flex' , justifyContent:'center' , paddingBottom:'5px'}}>
	                      <AvatarViewWrapper {...getRootProps({ className: 'dropzone' })}>
	                        <input {...getInputProps()} />
	                        <label htmlFor='icon-button-file'>
                            <Avatar
                              sx={{
                                width: { xs: 120, lg: 150 },
                                height: { xs: 120, lg: 150 },
                                cursor: 'pointer',
                              }}  
                            src={(checkType() === 'Customer' || checkType() === 'Possalecustomer') && srcImage.image !== '' ? srcImage.image : imageStatus ? customerData?.image : image} 
                          />
                          <Box className='edit-icon'>
                            <EditIcon />
                          </Box>
                        </label>
	                      </AvatarViewWrapper>
	                      </Grid>
	                      {isEnabled ?
                        (<Grid style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button variant='outlined' sx={{   
                            height: '1.5rem', ':hover': {
	                                  bgcolor: '#0A8FDC',
	                                  color: 'white',
	                                },
                          }} onClick={handleImage}>{"Save"}</Button>
                        </Grid>)
	                        : <></>}

	                    </Card>
	                    </Box>
	                  </div>
                {/* <Card variant="outlined" sx={{ padding: "20px" }}> */}
                {customerData?.company_name ? (
                  <div style={{minHeight: 40}}>
                    <Box sx={{minHeight: 19}}>
                      <Card
                        variant='outlined'
                        style={{width: '100%', padding: '10px'}}
                      >
                        <Grid container spacing={2}>
                          <Grid
                            style={{minHeight: '70px'}}
                            size={{
                              xs: 6,
                              md: 2,
                              lg: 6,
                              sm: 2
                            }}>
                            <Typography className='contactscontent'>
                              Company Name :
                            </Typography>
                          </Grid>
                          <Grid
                            size={{
                              xs: 6,
                              md: 10,
                              lg: 6,
                              sm: 10
                            }}>
                            <Typography
                            >
                              {capitalize(customerData?.company_name)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Card>
                    </Box>
                  </div>
                  ) : customertype === 3 ?
                  (
                  <div style={{minHeight: 40}}>
                    <Box sx={{minHeight: 19}}>
                      <Card variant='outlined' sx={{padding: '10px'}}>
                        <Grid container spacing={2}>
                          <Grid
                            style={{minHeight: '70px'}}
                            size={{
                              xs: 6,
                              md: 2,
                              lg: 6,
                              sm: 2
                            }}>
                            <Typography className='contactscontent'>Employee Name :</Typography>
                            <Typography className='contactscontent'>Employee Code :</Typography>
                            <Typography className='contactscontent'>Designation :</Typography>
                            <Typography className='contactscontent'>Department :</Typography>
                            {/* <Typography className='contactscontent'>User Name :</Typography> */}
                          </Grid>
                          <Grid
                            style={{minHeight: '70px'}}
                            size={{
                              xs: 6,
                              md: 10,
                              lg: 6,
                              sm: 10
                            }}>
                            {/* name */}
                            <Typography className='contactscontent'
                            >
                                  {
                                    `${capitalize(customerData?.first_name || '')}${customerData?.last_name ? ' ' + capitalize(customerData?.last_name) : ''}`
                                  }
                            </Typography>
                            <Typography className='contactscontent'
                            >
                                  {
                                    customerData?.employee_code
                                  }
                            </Typography>
                            <Typography className='contactscontent'
                            >
                                  {
                                    capitalize(customerData?.designation)
                                  }
                            </Typography>
                                <Typography className='contactscontent'>
                                  {
                                    customerData?.Departments_name && customerData.Departments_name.length > 0
                                      ? customerData.Departments_name.map((dept) => dept.department).join(', ')
                                      : '-'
                                  }
                                </Typography>

                            {/* <Typography
                            >
                                  {
                                    customerData?.username
                                  }
                            </Typography> */}
                          </Grid>
                        </Grid>
                      </Card>
                    </Box>
                  </div>
                  ) :
                    (<div>
                  <div style={{minHeight: 40}}>
                    <Box sx={{minHeight: 19}}>
                      <Card variant='outlined' sx={{padding: '10px'}}>
                        <Grid container spacing={2}>
                          <Grid
                            style={{minHeight: '70px'}}
                            size={{
                              xs: 6,
                              md: 2,
                              lg: 6,
                              sm: 2
                            }}>
                                <Typography className='contactscontent'>Name :</Typography>
                                {storage?.company_type !== 12 && <> <Typography className='contactscontent'>
                                  Customer Score :{' '}
                                  <span style={{ fontWeight: '500' }}></span>
                                </Typography>
                                <Typography className='contactscontent'>
                                  Rank : <span style={{ fontWeight: '500' }}></span>
                                </Typography> </>}
                          </Grid>
                          <Grid
                            style={{minHeight: '70px'}}
                            size={{
                              xs: 6,
                              md: 10,
                              lg: 6,
                              sm: 10
                            }}>
                            <Typography
                              className='contactscontent'
                              style={{fontWeight: 'bold'}}
                            >
                              {capitalize(customerData?.first_name)}
                                </Typography>
                                
                          </Grid>
                        </Grid>
                      </Card>
                    </Box>
                      </div>
 
                    </div>

                  )
                }
                
                {
                  customertype !== 3 ?
                  <>
                  {/* <div style={{minHeight: 10, marginTop: '10px'}}>
                    <Box sx={{minWidth: 175, minHeight: '85px'}}>
                      <Card
                        variant='outlined'
                        sx={{padding: '10px', minHeight: '30px'}}
                      >
                        <Typography className='contactscontent'>
                          Customer Score :{' '}
                          <span style={{fontWeight: '500'}}></span>
                        </Typography>
                        <Typography className='contactscontent'>
                          Rank : <span style={{fontWeight: '500'}}></span>
                        </Typography>
                      </Card>
                    </Box>
                  </div> */}
                  <div style={{ marginTop: '10px'}}>
                    <PrimaryContact
                      phone_number={customerData?.phone_number}
                      email={customerData?.email}
                      designation={customerData?.designation}
                    />
                  </div>
                  <div style={{minHeight: 20, marginTop: '10px'}}>
                  
                        <Box xs={{ minWidth: 175 }}>
                          <Accordion defaultExpanded={true} >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls="panel1a-content"
                              id="panel1a-header"
                              // style={{ backgroundColor: '#dedede' }}
                              style={{
                                backgroundColor: '#dedede',
                                minHeight: '48px', 
                                maxHeight: '48px',  
                                overflow: 'hidden', 
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'max-height 0.2s ease-out'
                              }}
                            >
                              <Typography>Address</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{ minHeight: '3em' }}>
                              <Grid style={{ padding: '10px 0px 10px 0px' }}>
                                <Typography className='contactscontent'>
                                  Address :{' '}
                                  <span className='contactscontent'>
                                    {checkIsValid(customerData?.address)}
                                  </span>
                                </Typography>
                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                        </Box>
                  </div>
                  <div style={{ marginTop: '10px'}}>
                    <Box xs={{minWidth: 175}}>
                          
                          <Accordion defaultExpanded={true} >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls="panel1a-content"
                              id="panel1a-header"
                              style={{
                                backgroundColor: '#dedede',
                                minHeight: '48px', 
                                maxHeight: '48px',  
                                overflow: 'hidden', 
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'max-height 0.2s ease-out'
                              }}

                            >
                              <Typography>Other Info</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{minHeight:'3em'}}>
                              <Grid style={{ padding: '10px 0px 10px 0px' }}>
                              <Typography className='contactscontent'>
                                Other Info :{' '}
                                <span className='contactscontent'>
                                  {checkIsValid(customerData?.comments)}
                                </span>
                              </Typography>
                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                    </Box>
                  </div>
             
                  </>
                  : 
                  <>

{/* <div style={{ marginTop: '10px'}}>
                    <Box sx={{minWidth: 175}}>
                      
                          <Accordion defaultExpanded={true} >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls="panel1a-content"
                              id="panel1a-header"
                              style={{
                                backgroundColor: '#dedede',
                                minHeight: '48px', 
                                maxHeight: '48px',  
                                overflow: 'hidden', 
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'max-height 0.2s ease-out'
                              }}

                            >
                              <Typography className='cardheadervalue'>Face Attendance</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{ minHeight: '4em' }}>

                              {user.length > 0 ? (
                                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                                  <Avatar
                                    alt="User"
                                    src={profileImage}
                                    sx={{ width: 90, height: 90, mr: 5 }}
                                  />
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => {
                                     
                                      handleClickOpen();
                                    }}
                                  >
                                    Deregister
                                  </Button>
                                </Box>
                              ) : (
                                <Box display="flex" alignItems="center" justifyContent="center" width="100%" height="100%">
                                  <Typography className="contactscontent">
                                    Not Registered User
                                  </Typography>
                                </Box>
                              )}


                            </AccordionDetails>
                          </Accordion>
                    </Box>
                  </div> */}
                  {/* <div style={{ marginTop: '10px'}}>
                    <Box sx={{minWidth: 175}}>
                          <Accordion defaultExpanded={true} >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls="panel1a-content"
                              id="panel1a-header"
                              style={{
                                backgroundColor: '#dedede',
                                minHeight: '48px', 
                                maxHeight: '48px',  
                                overflow: 'hidden', 
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'max-height 0.2s ease-out'
                              }}

                            >
                              <Typography className='cardheadervalue'>Primary Lat & Long</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{minHeight:'4em'}}>
                              <Grid style={{ padding: '10px 0px 10px 0px' }}>
                              <Typography className='contactscontent'>
                                Latitude :{customerData?.latitude}
                                <span style={{ fontWeight: '500' }}>
                                  {checkIsValid(customerData?.latitude)}
                                </span>
                              </Typography>
                              <Typography className='contactscontent'>
                                Longitude :{' '}
                                <span className='contactscontent'>
                                  {checkIsValid(customerData?.longitude)}
                                </span>
                              </Typography>
                             </Grid>
                            </AccordionDetails>
                          </Accordion>
                    </Box>
                  </div> */}
                  {/* <div style={{minHeight: 120, marginTop: '10px'}}>
                    <PrimaryContact
                      phone_number={customerData?.phone_number}
                      email={customerData?.email}
                      designation={customerData?.designation}
                    />
                  </div> */}
                  {/* <div style={{minHeight: 10, marginTop: '10px'}}>
                    <Box sx={{minWidth: 175, minHeight: '85px'}}>
                      <Card
                        variant='outlined'
                        sx={{padding: '10px', minHeight: '30px'}}
                      >
                        <Typography variant='body1'>
                          Longitude :{' '}
                          <span style={{fontWeight: '500'}}>
                            {checkIsValid(customerData?.longitude)}
                          </span>
                        </Typography>
                      </Card>
                    </Box>
                  </div> */}

                            <div style={{ minHeight: 20, marginTop: '10px' }}>
                              <Box xs={{ minWidth: 175 }}>
                                <Accordion defaultExpanded={true} >
                                  <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                    style={{
                                      backgroundColor: '#dedede',
                                      minHeight: '48px',
                                      maxHeight: '48px',
                                      overflow: 'hidden',
                                      display: 'flex',
                                      alignItems: 'center',
                                      transition: 'max-height 0.2s ease-out'
                                    }}

                                  >
                                    <Typography className='cardheadervalue'>Employment</Typography>
                                  </AccordionSummary>
                                  <AccordionDetails style={{ minHeight: '3em' }}>
                                    <Grid className='contactscontent'>
                                      <Typography className='contactscontent'>
                                        Status :{' '}
                                        <span className='contactscontent'>
                                          {checkIsValid(customerData?.deleted == 0 ? 'Active' : 'Inactive')}
                                        </span>
                                      </Typography>
                                      <Typography className='contactscontent'>
                                        Join Date :{' '}
                                        <span className='contactscontent'>
                                          {customerData?.dateOfJoining && moment(customerData?.dateOfJoining).isValid() ? moment(customerData?.dateOfJoining).format("DD-MM-YYYY") : '  -'}
                                        </span>
                                      </Typography>
                                      <Typography className='contactscontent'>
                                        Category :{' '}
                                        <span className='contactscontent'>
                                          {checkIsValid(customerData?.category_name)}
                                        </span>
                                      </Typography>
                                      <Typography className='contactscontent'>
                                        Reporting Manager :{' '}
                                        <span className='contactscontent'>
                                          {checkIsValid(customerData?.reporter)}
                                        </span>
                                      </Typography>
                                    </Grid>
                                  </AccordionDetails>
                                </Accordion>
                              </Box>
                            </div>

                            <div style={{ minHeight: 20, marginTop: '10px' }}>
                              <Box xs={{ minWidth: 175 }}>
                                <Accordion defaultExpanded={true} >
                                  <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                    style={{
                                      backgroundColor: '#dedede',
                                      minHeight: '48px',
                                      maxHeight: '48px',
                                      overflow: 'hidden',
                                      display: 'flex',
                                      alignItems: 'center',
                                      transition: 'max-height 0.2s ease-out'
                                    }}

                                  >
                                    <Typography className='cardheadervalue'>Address</Typography>
                                  </AccordionSummary>
                                  <AccordionDetails style={{ minHeight: '3em' }}>
                                    <Grid className='contactscontent'>
                                      <Typography className='contactscontent'>
                                        Address :{' '}
                                        <span className='contactscontent'>
                                          {checkIsValid(customerData?.address)}
                                        </span>
                                      </Typography>
                                    </Grid>
                                  </AccordionDetails>
                                </Accordion>
                              </Box>
                            </div>

                  {/* <div style={{minHeight: 40, marginTop: '10px'}}>
                    <Box xs={{minWidth: 175}}>    
                          <Accordion defaultExpanded={true} >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls="panel1a-content"
                              id="panel1a-header"
                              style={{
                                backgroundColor: '#dedede',
                                minHeight: '48px', 
                                maxHeight: '48px',  
                                overflow: 'hidden', 
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'max-height 0.2s ease-out'
                              }}

                            >
                              <Typography>Other Info</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{minHeight:'3em'}}>
                              <Grid style={{ padding: '10px 0px 10px 0px' }}>
                                <Typography variant='body1'>
                                  Other Info :{' '}
                                  <span style={{ fontWeight: '500' }}>
                                    {checkIsValid(customerData?.comments)}
                                  </span>
                                </Typography>
                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                    </Box>
                  </div> */}

                      <div style={{ minHeight: 40, marginTop: '10px' }}>
                        <Box xs={{ minWidth: 175 }}>
                          <Accordion defaultExpanded={true} >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls="panel1a-content"
                              id="panel1a-header"
                              style={{
                                backgroundColor: '#dedede',
                                minHeight: '48px',
                                maxHeight: '48px',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'max-height 0.2s ease-out'
                              }}

                            >
                              <Typography className='cardheadervalue'>User Info</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{ minHeight: '3em' ,  display: 'flex', flexDirection: 'column'}}>
                              
                            <div style={{ marginBottom: '1em' }}>
                            <Typography className='contactscontent'>
                                User Name :{' '}
                                <span className='contactscontent'>
                                  {checkIsValid(customerData?.username)}
                                </span>
                              </Typography>
                              </div>

                              <div style={{ marginBottom: '1em' }}>
                              <Typography className='contactscontent'>
                                <TextField
                                  required={true}
                                  style={{}}
                                  fullWidth={true}
                                  placeholder='password'
                                  label='password'
                                  name='password'
                                  color='primary'
                                  type={showPassword ? 'text' : 'password'}
                                  regex=''
                                  variant='filled'
                                  value={password}
                                  onChange={(e) => {
                                    const newPassword = e.target.value.replace(/\s+/g, '');
                                    setpassword(newPassword)
                                  }
                                  }
                                  error={password.length > 0 && password.length < 6}
                                  helperText={
                                    password.length > 0 && password.length < 6
                                      ? 'Password must be at least 6 characters long.'
                                      : ''
                                  }
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <Button
                                          variant='outlined'
                                          color="error"
                                          style={{ padding: '6px 12px', fontSize: '0.75rem'  }}
                                          onClick={updatepassword}
                                          disabled={password.length < 6}
                                        >
                                          Reset Password
                                        </Button>
                                      </InputAdornment>
                                    )
                                  }}
                                  inputProps={{
                                    maxLength: 15, 
                                  }}
                                />
                              </Typography>
                              </div>
                      
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Typography className='contactscontent'>Enable App Access:</Typography>
                                <Switch
                                  checked={appAccessEnabled}
                                  onChange={handleToggleChange}
                                  inputProps={{ 'aria-label': 'toggle app access' }}
                                />
                              </div>
                              
                            </AccordionDetails>
                          </Accordion>
                    </Box>
                  </div> 


{/* <div style={{minHeight: 40, marginTop: '10px'}}>
                    <Box xs={{minWidth: 175}}>    
                          <Accordion defaultExpanded={true} >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls="panel1a-content"
                              id="panel1a-header"
                              style={{
                                backgroundColor: '#dedede',
                                minHeight: '48px', 
                                maxHeight: '48px',  
                                overflow: 'hidden', 
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'max-height 0.2s ease-out'
                              }}
 
                            >
                              <Typography>Change Password</Typography>
                            </AccordionSummary>
                            <AccordionDetails style={{minHeight:'3em'}}>
                              <Grid style={{ display: 'flex', justifyContent: 'center',flexDirection: "column", margin: '10px 0px' }}>
                              <TextField
             
             required={true}
             style={{}}
             fullWidth={true}
             placeholder='password'
             label='password'
             name='password'
           
             color='primary'
             type='text'
             regex=''
             variant='filled'
             value={password}
             onChange={(e) => {
               const newPassword = e.target.value.replace(/\s+/g, '');
               setpassword(newPassword);
             }}
             error={password.length > 0 && password.length < 6}
             helperText={
               password.length > 0 && password.length < 6
                 ? 'Password must be at least 6 characters long.'
                 : ''
             }
                                  <Button variant='outlined' color="error" style={{marginTop: "10px"}}onClick={updatepassword} >
                                  Update Password
                            </Button>
                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                    </Box>
                  </div> */}
                  </>
                } 
                {customertype === 3 &&
                (
                  <div style={{minHeight: 40,  marginTop: '10px'}}>
                    <Box sx={{minHeight: 19}}>
                    <Accordion defaultExpanded={true} >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls="panel1a-content"
                              id="panel1a-header"
                              style={{
                                backgroundColor: '#dedede',
                                minHeight: '48px', 
                                maxHeight: '48px',  
                                overflow: 'hidden', 
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'max-height 0.2s ease-out'
                              }}

                            >
                              <Typography  className='cardheadervalue'>Device Info</Typography>
                            </AccordionSummary>
                      <Card variant='outlined' sx={{padding: '10px'}}>
                        <Grid container spacing={2}>
                          <Grid
                            size={{
                              xs: 3.5,
                              md: 2,
                              lg: 3.5,
                              sm: 2
                            }}>
                            <Typography className='contactscontent'>Device Id </Typography>
                          </Grid>
                          <Grid
                            size={{
                              xs: 8.5,
                              md: 10,
                              lg: 8.5,
                              sm: 10
                            }}>
                            <Typography className='contactscontent'
                            > : {(activedeviceslist[0]?.registerDevice_withId == 0 ||  resetconfirm === true) ? 'Not Yet Registered' : activedeviceslist[0]?.device_id }
                                  {/* {
                                    `${capitalize(customerData?.first_name || '')}${customerData?.last_name ? ' ' + customerData?.last_name : ''}`
                                  } */}
                            </Typography>
                          </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                          <Grid
                            size={{
                              xs: 6,
                              md: 2,
                              lg: 6,
                              sm: 2
                            }}>
                            <Typography className='contactscontent'>Last Active Date :</Typography>
                          </Grid>
                          <Grid
                            size={{
                              xs: 6,
                              md: 10,
                              lg: 6,
                              sm: 10
                            }}>
                            <Typography className='contactscontent'
                            > {activedeviceslist[0]?.last_active_date !== null && moment(activedeviceslist[0]?.last_active_date).format('DD/MM/YYYY hh:mm A')}
                                  {/* {
                                    `${capitalize(customerData?.first_name || '')}${customerData?.last_name ? ' ' + customerData?.last_name : ''}`
                                  } */}
                            </Typography>
                          </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                          <Grid
                            size={{
                              xs: 6,
                              md: 2,
                              lg: 6,
                              sm: 2
                            }}>
                            <Typography className='contactscontent'>Last Login Date :</Typography>
                          </Grid>
                          <Grid
                            size={{
                              xs: 6,
                              md: 6,
                              lg: 6,
                              sm: 10
                            }}>
                           <Typography className='contactscontent'>
  {activedeviceslist[0]?.last_login_date !== null && moment(activedeviceslist[0]?.last_login_date).format('DD/MM/YYYY hh:mm A')}
</Typography>
                          </Grid>
                        </Grid>
                        <Grid container spacing={2} marginTop='20px'>
                        <Grid
                          size={{
                            xs: 2,
                            md: 2,
                            lg: 4,
                            sm: 2
                          }}></Grid>
                          <Grid
                            size={{
                              xs: 6,
                              md: 2,
                              lg: 6,
                              sm: 2
                            }}>
                            <Button 
                            className='cardheadervalue' 
                            color="error" 
                            variant="contained"
                            onClick={
                              () => {
                                resetDialog(activedeviceslist[0]?.employee_id)
                              }} disabled={activedeviceslist[0]?.active === 0 ? true : resetconfirm === true ? true :false}>
                              Deregister
                            </Button>
                          </Grid>
                        </Grid>
                      </Card>
                      </Accordion>
                    </Box>
                    <Box sx={{ minHeight: 20, marginTop: '10px' }}>
                      <Accordion defaultExpanded={true} >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel1a-content"
                          id="panel1a-header"
                          style={{
                            backgroundColor: '#dedede',
                            minHeight: '48px', 
                            maxHeight: '48px',  
                            overflow: 'hidden', 
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'max-height 0.2s ease-out'
                          }}

                        >
                          <Typography className='cardheadervalue' >Location Info</Typography>
                        </AccordionSummary>
                          {getEmpLocationpModel.length > 0 ? (
                            <Card variant="outlined" sx={{ padding: "10px" }}>
                              <Grid container spacing={2}>
                                {getEmpLocationpModel.map((location) => (
                                  <React.Fragment key={location.id}>
                                    
                                    {/* LOCATION DETAILS */}
                                    <Grid
                                      size={{
                                        xs: 12,
                                        md: 6,
                                        lg: 4
                                      }}>
                                      <Box p={2}>

                                        <Typography
                                          className="cardheadervalue"
                                          sx={{ display: "flex", gap: "6px", alignItems: "center", whiteSpace: "nowrap" }}
                                        >
                                          <strong>Location Name:</strong> {location.location_name}
                                        </Typography>

                                        <Typography
                                          className="cardheadervalue"
                                          sx={{ display: "flex", gap: "6px", alignItems: "center", whiteSpace: "nowrap" }}
                                        >
                                          <strong>Latitude:</strong> {location.lattitude}
                                        </Typography>

                                        <Typography
                                          className="cardheadervalue"
                                          sx={{ display: "flex", gap: "6px", alignItems: "center", whiteSpace: "nowrap" }}
                                        >
                                          <strong>Longitude:</strong> {location.longitude}
                                        </Typography>

                                      </Box>
                                    </Grid>

                                    {/* ACTION BUTTONS */}
                                    <Grid
                                      size={{
                                        xs: 12,
                                        md: 12,
                                        lg: 12
                                      }}>
                                      <Grid container spacing={5}>
                                        
                                        <Grid
                                          size={{
                                            lg: 12,
                                            md: 5,
                                            sm: 5,
                                            xs: 12
                                          }}>
                                          <Button
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            onClick={() => openInMaps(location.lattitude, location.longitude)}
                                          >
                                            Open in Maps
                                          </Button>
                                        </Grid>

                                        <Grid
                                          size={{
                                            lg: 5,
                                            md: 5,
                                            sm: 5,
                                            xs: 12
                                          }}>
                                          <Button
                                            size="small"
                                            color="error"
                                            variant="outlined"
                                            onClick={() => onInActiveButton(location.id, location.employee_id)}
                                          >
                                            InActive
                                          </Button>
                                        </Grid>

                                      </Grid>
                                    </Grid>

                                  </React.Fragment>
                                ))}
                              </Grid>
                            </Card>
                          ) : (
                            <Typography
                              className="cardheadervalue"
                              align="center"
                              style={{ paddingTop: "20px", paddingBottom: "20px" }}
                            >
                              No data available
                            </Typography>
                          )}
                        </Accordion>
                      </Box>
                    </div>
                  )
                }
                
              </Grid>
              <Grid
                style={{p: '0 10px', marginTop: '6px', padding: '6px'}}
                size={{
                  md: 12,
                  lg: 9,
                  xs: 12,
                  sm: 12
                }}>
                {/* <Card variant="outlined" sx={{ padding: "20px" }}> */}
                {/* <Grid size={{ sm: 12, md: 12, lg: 8 }} sx={12} > */}
                {console.log('dasdasd',storage.company_type)}
                { storage.company_type === 10 && (
                 
                  <>  
                    <CustomerLeadCards customer = {customer_data[index]}/>
                  </>
                )
                }

                {(customertype !== 3 )  ?
                  <>
                    {(customertype !== 0 &&  storage.company_type !== 10) ? (
                      <>
                        <div style={{marginTop: 20}}>
                          <LastBills
                            customer={customerDetailById}
                            sales={customerSalesDetailById}
                            stocklocation={stocklocation}
                            customer_erp_details={customerErpDetails}
                            contactType={contactType}
                            mail_configuration={mail_configuration}
                            rowPopupClose = {rowPopupClose}
                          />
                        </div>
                        <div>
                          <PaymentReceipt
                            customer={customerDetailById}
                            sales={customerSalesDetailById}
                            stocklocation={stocklocation}
                            customer_erp_details={customerErpDetails}
                            contactType={contactType}
                            mail_configuration={mail_configuration}
                          />
                        </div>
                      </>
                    ) : (storage.company_type === 10) ? <LeadManagement customer ={customerDetailById} type ='customerDetails'/> : (
                      <>
                        <div style={{marginTop: 20}}>
                          <RecentPurchase
                            sales={customerSalesDetailById}
                            customer_erp_details={customerErpDetails}
                            contactType={contactType}
                            mail_configuration={mail_configuration}
                            customer={customerDetailById}
                          />
                        </div>
                      </>
                    )}
                    {
                      storage.company_type !== 10 && storage.company_type !==12 ?  (
                    <div style={{marginTop: 20}}>
                     <RecentCreditDebitNotes
                        customer_erp_details={customerErpDetails}
                        customertype={customertype}
                        contactType={contactType}
                        customer_id={customer_id}
                      />
                    </div>
                      ) : storage.company_type !==12 ?
                      (
                         <div style={{marginTop: 20}}>
                          <QuotationTable customer ={customerDetailById}/>
                          </div>

                      ) : <></>

                    }
                    <div style={{minHeight: 200, marginTop: 20}}>
                       <TimeLine
                        customer_erp_details={customerErpDetails}
                        contactType={contactType}
                      /> 
                    </div>
                  
                  </>
                  :

                  <>

                    {/* {storage.company_type === 5 && ( */}
                    {storage.company_type !== 10 && (
                    
                      <PayrollCards
                      averageWorkHourEmployee={averageWorkHour}
                      employeeLoansDueAmount={employeeLoansDueAmount}
                      personId={personId}
                      isApiFinished={isApiFinished}
                      employee_id={customer_data?.[index]?.employee_id}
                      />

                        
                    )}
                    {/* )}  */}



                    {/* <div style={{marginTop: 20}}>
                      <RecentLeaves inView={inView} personId={personId} isApiFinished={isApiFinished}/>
                    </div> */}

                    <div style={{marginTop: 20}}>
                      <LateLogin
                        inView={inView}
                        purpose={'employee'}
                        personId={personId}
                        lateLoginApiFinished={isApiFinished}
                        handlePageChange={handlePageChangeL}
                        handlePageSizeChange={handlePageSizeChangeL}
                        page={lateLogin.page}
                      />
                    </div>

                    <div style={{marginTop: 20}}>
                      <LeavesStatus personId={personId} purpose={'employee'} leaveStatusApiFinished={isApiFinished} handlePageSizeChange={handlePageSizeChangeLP} handlePageChange={handlePageChangeLP} page={lp.page} />
                    </div>

                    <div style={{marginTop: 20}}>
                      <Loans
                       employee_id={customer_data[0]?.employee_id}
                        purpose={'employee'}
                        personId={personId}
                        loansApiFinished={isApiFinished}
                        handlePageSizeChangeLoan={handlePageSizeChangeLoan}
                        handlePageChangeLoan={handlePageChangeLoan}
                        page={loan.page}
                        pageSize={loan.pageSize}
                      />
                    </div>
                    {customerData.role_name !== 'Salesman' && <div style={{marginTop: 20}}>
                      <Emp_location type='list' customerData={customerData}/>
                    </div>}
                    {/* <div style={{marginTop: 20}}>
                      <ActiveDevices inView={inView} personId={personId} isApiFinished={isApiFinished}/>
                    </div> */}
                    {/* <div style={{marginTop: 20}}>
                      <Emp_location customerData={customerData} status={status} />
                    </div> */}

                  </>
                }

                {/* </Card> */}
                
    
            
         
          
              </Grid>
 
            </Grid>

            {relieveOpen && (
              <RelieveDialog
                open={relieveOpen}
                handleClose={() => setRelieveOpen(false)}
                employee_id={customer_data[index].employee_id}
                person_id={customer_data[index].person_id}
                relieving_date={customer_data[index].releiving_date}
                handle={() => {
                  setLoaderStatusHandler(true);
                  rowPopupClose();
                  setLoaderStatusHandler(false);
                  setEditfind(false);
                }}
              />
            )}
          
          </Card>
          {/* </Grid> */}
        </Grid>
      )}
        </>
      }
      <Grid>
                    <Dialog open={open} onClose={handleClose}>
                      <DialogTitle>{'Delete Alert'}</DialogTitle>
                      <DialogContent>
                        <DialogContentText>
                          Are you sure you want to Deregister this?
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button variant='contained' color='error' onClick={handleClose}>
                          Cancel
                        </Button>
                        <Button variant='contained' onClick={deleteSocketHandler} autoFocus>
                          Delete
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </Grid>
      <Dialog open={customerLinkDialogOpen} onClose={handleCustomerLinkDialogClose} maxWidth='sm' fullWidth>
        <DialogTitle>Link Vendor to Customer</DialogTitle>

        <DialogContent>
          <Autocomplete
            disableClearable
            freeSolo={customerSearchText?.length <= 3}
            options={customer?.filter(d => !d.supplier_id)}
            getOptionLabel={(option) => option.company_name}
            inputValue={customerSearchText}
            onInputChange={(event, newInputValue, reason) => {
              if(reason === 'input') {
                setCustomerSearchText(newInputValue)
                if(newInputValue !== '') {
                  handleAutoSearchApicall(newInputValue)
                }
                if(newInputValue === '') {
                  setLinkedCustomer(null)
                  dispatch(setSearchByCustomersDataAction([]))
                }
              }
            }}
            value={linkedCustomer}
            onChange={(event, newValue) => {
              setLinkedCustomer(newValue)
              setCustomerSearchText(newValue?.company_name || '') 
              if(newValue === null){
                setLinkedCustomerError('Customer is Required')
              }
              else{
                setLinkedCustomerError(null)
              }
            }}
            renderInput={(params) => {
              const get = {...params}
              let startAdornment = null
              return (
                <TextField
                  {...get}
                  required
                  fullWidth
                  label='Select Customer'
                  variant='filled'
                  error={linkedCustomerError}
                  helperText={linkedCustomerError}
                  slotProps={{
                    input: {
                      ...get.InputProps,
                      startAdornment: startAdornment,
                      endAdornment: (
                        <>
                          {
                            linkedCustomer === null ?
                            // <IconButton
                            //   size='small'
                            //   onClick={() => {
                            //     handleCustomerSearchAPICall(customerSearchText)
                            //   }}
                            // >
                            //   <SearchIcon />
                            // </IconButton> 
                            '' :
                            <IconButton
                              size='small'
                              onClick={() => {
                                handleCloseCustomerDetails()
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
        </DialogContent>

        <DialogActions>
          <Grid container spacing={3} display='flex' justifyContent='flex-end'>
            <Grid>
              <Button variant='contained' color='error' onClick={handleCustomerLinkDialogClose}>Cancel</Button>
            </Grid>

            <Grid>
              <Button variant='contained' onClick={handleCustomerLinkSubmit}>Submit</Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
      <Dialog open={unlinkDialogOpen} onClose={() => setUnlinkDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>ULinkCustomer</DialogTitle>

        <DialogContent>
          <Typography>Are you want to unlink customer for this vendor?</Typography>
        </DialogContent>

        <DialogActions>
          <Grid container spacing={3} display='flex' justifyContent='flex-end'>
            <Grid>
              <Button variant='contained' color='error' onClick={() => setUnlinkDialogOpen(false)}>Cancel</Button>
            </Grid>

            <Grid>
              <Button variant='contained' onClick={handleUnlinkCustomer}>Unlink</Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
      {/* <AccountsOfStatements
    customer_id={customer_data[index].customer_id}
    supplier_id = {customer_paginate[index]?.supplier_id}
    type = {checkType()}
  /> */}
    </div>
  );
}
