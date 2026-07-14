import React, { Component } from 'react';
import { connect } from 'react-redux';
import MaterialTable from 'utils/SafeMaterialTable';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import ApprovalRequest from './RequestApprovalCard';
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import Cookies from 'universal-cookie';
import { Typography, Grid, Box, Stack, IconButton, Autocomplete, Select, InputLabel, FormControl, MenuItem, DialogContent, Dialog, Tab, Tabs, ButtonGroup, Tooltip, Card, TextField, Alert } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import Avatar from '@mui/material/Avatar';
import ImageIcon from '@mui/icons-material/Image';
import WorkIcon from '@mui/icons-material/Work';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import Divider from '@mui/material/Divider';
import DoneIcon from '@mui/icons-material/Done';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import CloseIcon from '@mui/icons-material/Close';
import NewRequest from './NewRequest';
import Button from '@mui/material/Button';
import _, { concat, filter, stubTrue } from 'lodash';
import { listAllLeaveRequestAction, createLeaveRequestAction, cancelLeaveRequestAction, ApproveLeaveRequestAction, getConflictLeaveRequestAction, updateConflictLeaveRequestAction, updateSeenAction, listpreLeaveRequestAction, listprePermissionRequestAction, getLeaveTypeAction, checkStatusAction, checkExistLogDetail,getPaidLeavecount, getpermissiondataAction } from '../../../redux/actions/leaveRequest_actions';
import moment from 'moment';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import dayjs from 'dayjs';
import personIcon from '../../../assets/dashboardIcons/total-clients.svg';
import apiCalls from 'utils/apiCalls';
import { Helmet } from "react-helmet-async";
import { CreateNotificationAction,getNotificationTokenAction } from 'redux/actions/notification_actions';
import { getLoginRoleAction, getTokenByEmpId, getAdminTokenByCompany } from 'redux/actions/userRole_actions';
import { sendNtfy } from 'firebase/firebase.service';
import { commonDateFormat, getDateTimeFormat } from 'utils/getTimeFormat';
import notificationType from '../../../firebase/notify_type'
import { getsessionStorage } from 'pages/common/login/cookies';
import CancelIcon from '@mui/icons-material/Cancel';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import NoRecordFound from 'components/Layout/NoRecordFound';
import AddIcon from '@mui/icons-material/Add';
import { loanDetailsAction, loanSequenceAction, getLoanListAction, updateLoanStatusAction, updateSeenLoanAction, getTenureTypeAction , updateSeenClaimAndOthersAction, searchClaimAndOthersAction,getClaimsCategoryAction} from 'redux/actions/loan_actions';
import { pageSize } from 'utils/pageSize';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ConflictLeaveDialog from './ConflictLeaveDialog';
import SimpleDialogDemo from './ConflictLeaveDialog';
import { idID } from '@mui/material/locale';
import { clientwebsocket, titleURL } from 'http-common';
import CommonToolTip from 'components/ToolTip';
import { getEmpbasecompanyAction, getEmpbasecompanyFilterAction, get_search_company_based_employee, set_search_company_based_employee } from 'redux/actions/attendance_actions';
import {AdapterDateFns as AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import { date } from 'yup';
import FilterDialog from 'components/leaveRequest/filter';
import { roleType } from 'utils/roleType';
import { getEmpDeptApproverVerifierAction, getRequestApproverVerifierType, getRequestConfig } from 'redux/actions/requestConfig';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DescriptionIcon from '@mui/icons-material/Description';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import '../../../index.css';
import ArrowLeftRoundedIcon from '@mui/icons-material/ArrowLeftRounded';
import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import ClaimCard from './ClaimCard';
import LoanCard from './LoanCard';
import RequestCard from './RequestCard';
//import { customFetch } from 'utils/useCustomFetch';


const scrollBar = {
  '&::-webkit-scrollbar': {
    width: 7,
  },
  '&::-webkit-scrollbar-track': {
    // backgroundColor: "#E0E0E0"
    '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#B2B2B2',
    borderRadius: 2,
    border: '2px solid white',
  },
}
class LeaveRequest extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    let date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth(), 30);
    this.state = {
      pageSize: 15,
      hrsformat: '',
      stock_location_data: [],
      open: false,
      edit_id_data: [],
      page: 0,
      dialog: { open: false, msg: '', severity: '' },
      status: '',
      delete: false,
      id: '',
      Moment: { _i: new Date() },
      from: moment(),//moment().format(), //new Date(moment().startOf('month').format()), 
      to: moment(),//new Date(moment().endOf('month').format()),  
      startTime: dayjs(date),
      endTime: dayjs(date),
      LoggedFromDate:  moment(),
      LoggedToDate:  moment(),
      halfDayLoggedDate:  moment(),
      approvedBy: { approvedBy:this.storage?.first_name + (this.storage?.last_name ? this.storage.last_name !== null ? ' ' + this.storage.last_name : '' : '') },
      type: '1',
      openFilter: false,
      value: '1',
      isApiFinished: false,
      requestButton: true,
      loanButton: false,
      dialogOpen: false,
      loanId: '',
      tabType: '1',
      EmpId: '',
      isAllDay: '',
      currentReq: '',
      alertopen: false,
      isHoliday: '',
      isFilterDialogOpen: false,
      employee: null,
      filterLeaveType: null,
      filterType:null,
      createdAt: null,
      fromdate:"",
      todate:"",
      loading: true,
      statusCheck: false,
      statusLog: false,
      hasMore: true,
      request_type : null,
      loanPage: 200,
      showUnseenRequests: false,
      showUnseenLoans: false,
      showUnseenClaims: false,
      query: {
        pageCount: 0,
        numPerPage: 20,
        lastId: 'MAX_NUMBER'
      },
      valueforEmployee : [],
      searchValEmployeeFilter:'',
      filteropen:false,
      claimAndOtherId: '',
      unseenCount: 0,
      tabIndex: 0,
      toolbarHeight: document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70,
      windowHeight: window.innerHeight,
      permission:[]
  
    };
    this.handleClose = this.handleClose.bind(this, false);
    this.cookies = new Cookies();
    this.storage = getsessionStorage()
    this.observer = React.createRef();
  }


  lastProductElementRef =
    (node) => {
      // if (loading) return;
      if (this.observer.current) this.observer.current.disconnect();
      this.observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          this.setState({
            query: {
              ...this.state.query,
              lastId: node.getAttribute('data-lastitemid'),
            }
          });
        }
      });
      if (node) this.observer.current.observe(node);
    }

  handleChangeEmployeeName =(val)=>{
    // console.log("val",val.length)
    this.setState({valueforEmployee : val})
    

}

setSearchValEmployeeFilter =(val) =>{
  this.setState({ searchValEmployeeFilter: val })
  }
  
  handleTabChange = (event, newValue) => {
    let type;
    switch (newValue) {
      case 0:
        type = '1';
        break;
      case 1:
        type = '2';
        break;
      case 2:
        type = '5';
        break;
      default:
        type = '1';
    }
    this.setState({ tabIndex: newValue, type });
  };


  requestSearchEmployeeFilter = (val) => {
    if(this.storage.role_name === 'Employee') {
      return
    }
    const context = this.context;
    // let allDept = list_department.map((d) => d.department);

    this.setState({ searchValEmployeeFilter: val })

    this.props.set_search_company_based_employee([])


  

     if (!val) {
      return
    }

    let data = {

      searchString: val
    }

    this.props.get_search_company_based_employee(data,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler)


   




  };

  handleClickOpen = async(num) => {
    //const { useCustomFetch } = this.props;
    const context = this.context;

    this.setState({ open: true, tabType: num });
    const fromDate = new Date().toISOString().split("T")[0]
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.loanSequenceAction(),
      this.props.tenureMonths.length === 0 && this.props.getTenureTypeAction(),
      this.props.leaveType.length === 0 && this.props.getLeaveTypeAction(),
      // this.props.getPaidLeavecount(),
      this.props.getClaimsCategoryAction(),
      this.props.getpermissiondataAction(fromDate)
    )
   
  };

  handleVisibilityRequest = async() => {
  this.setState((prevState) => ({
    showUnseenRequests: !prevState.showUnseenRequests
  }));
  const context = this.context;
  let leaveData = {
    fromdate: null,
    todate: null,
    type: null,
    employee_id: this.storage.role_name === 'Employee' ? this.storage.employee_id : null,
    pageCount: 0,
    numPerPage: 15,
    unseen : this.state.showUnseenRequests ? "1" : "0"
  }

  let data1 = {
    searchString:""
  }

  let data2={
      
    pageCount: 0,
    numPerPage: 60,
    searchString: ""

}

let data3 = {
  type:'leave',
  fromdate: this.state.fromdate,
  todate: this.state.todate,
  seen:this.state.showUnseenRequests ? 1 : 0
}

  this.setState({pageCount: 0, numPerPage: 15})

  apiCalls(
    context.setModalTypeHandler,
    context.setLoaderStatusHandler,
    this.props.listAllLeaveRequestAction(leaveData, context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler,
      (response) => {
        if (response?.seen === 0) {
          this.setState({ id: this.props.leave_request?.data?.length ? this.props.leave_request.data[0]?.leaveId : '' })
        }
        else{
        this.setState({ id: this.props.leave_request?.data?.length ? this.props.leave_request.data[0]?.leaveId : '' })}
      }),
      this.props.getUnseenCountAction( data3),
      this.setState({seenType:'leave' }),
      this.props.getRequestConfig( context.setModalTypeHandler,context.setLoaderStatusHandler, data2),
  ).finally(() => this.setState({ isApiFinished: true }),
    this.props.getEmpbasecompanyFilterAction(data1,(res)=>{   
    }),
  );

  };
  
  handleVisibilityLoans = () => {
    this.setState((prevState) => ({
      showUnseenLoans: !prevState.showUnseenLoans
    }));
  };
  
  handleVisibilityClaims = () => {
    this.setState((prevState) => ({
      showUnseenClaims: !prevState.showUnseenClaims
    }));
    };

  resizeWindow = () => {
    const dynamicToolbarHeight_val = document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70
    this.setState({toolbarHeight: dynamicToolbarHeight_val, windowHeight: window.innerHeight})
  }

  storage = getsessionStorage()

  async componentDidMount() {
    const context = this.context;
    const data = {
      tenure: "", frmdate: '', todate: '', emp_name: "", status: "", numPerPage: null,
      pageCount: '',
      searchString: '',
      date: null,
      employeeId:  (this.storage.role_name === 'Employee'  || this.storage.role_name === "Manager" ) ? this.storage.employee_id : null
    }
    let leaveData = {
      fromdate: null,
      todate: null,
      type: null,
      employee_id:  (this.storage.role_name === 'Employee'  || this.storage.role_name === "Manager" ) ? this.storage.employee_id : null,
      pageCount: this.state.page,
      numPerPage: this.state.pageSize
    }
    let claimdata = {
      searchString: '',
      fromdate: '',
      todate: '',
      employeeId:  (this.storage.role_name === 'Employee'  || this.storage.role_name === "Manager" ) ? this.storage.employee_id : null
    }

    let data1 = {
      searchString:""
    }

    let data2={
      
        pageCount: 0,
        numPerPage: 60,
        searchString: ""
    
    }

    // this.UnseenCount();
    // this.handleClaimInitialData();

   let employee_id =  this.storage.employee_id
    console.log(this.state.fromdate,"gh")
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listAllLeaveRequestAction(leaveData, context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler,
        (response) => {
          // console.log('res',response);
          if (response?.seen === 0) {
            this.setState({ id: this.props.leave_request?.data?.length ? this.props.leave_request.data[0]?.leaveId : '' })
            // this.props.updateSeenAction(this.props.leave_request.data[0]?.leaveId, (response) => {
            //   if (response === 200) {
               
            //     this.props.listAllLeaveRequestAction(leaveData, context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler, (response) => {
            //       if (response.res === 200) {
            //         this.setState({ id: this.props.leave_request.data[0]?.leaveId })
            //         // console.log("ret",this.props.leave_request.data);
            //       }
            //     })
            //   }
            // })
          }
          else{
          this.setState({ id: this.props.leave_request?.data?.length ? this.props.leave_request.data[0]?.leaveId : '' })}
        }),
        this.props.getRequestConfig( context.setModalTypeHandler,context.setLoaderStatusHandler, data2),
    ).finally(() => this.setState({ isApiFinished: true }),
      this.props.getEmpbasecompanyFilterAction(data1,(res)=>{   
      }),
    );
    
    this.resizeWindow();
    window.addEventListener("resize", this.resizeWindow);
    return () => window.removeEventListener("resize", this.resizeWindow)
    // this.setState({ id : this.props.leave_request[0]?.leaveId })
    // if (this.props.setModalStatusHandler) this.setState({open: true});
  }

  

  componentWillUnmount() {
    this.props.clearState();

  }

  handleAttendanceCorrection = (correctionId) => {
    this.setState({ id: correctionId })
  }

  handleClose = () => {
    this.setState({
      open: false,
      from: moment(),
      to: moment(),
      LoggedFromDate:  moment(),
      LoggedToDate:  moment(),
      halfDayLoggedDate:  moment(),
    });
  };

  handleError = ()=>{
    this.setState({
      open: true
    });
  }
  componentDidUpdate(prevProps, prevState) {
    const context = this.context;
    // clientwebsocket.socket.onmessage = async (message) => {
    //   let { event } = JSON.parse(message.data);
    //   if (event === 'Request_status') {
    //     const data = {
    //       tenure: "", frmdate: '', todate: '', emp_name: "", status: "", numPerPage: null,
    //       pageCount: '',
    //       searchString: '',
    //       date: null,
    //       employeeId: null
    //     }
    //     const leaveData = {
    //       fromdate: this.state.fromdate,
    //       todate: this.state.todate,
    //       type: this.state.filterLeaveType,
    //       employee_id: this.storage.role_name === 'Employee' ? this.storage.employee_id : (this.state.valueforEmployee?.employee_id || null),
    //       pageCount:this.state.page,
    //       numPerPage:this.state.pageSize
    //     }
    //     const claimdata = {
    //       searchString: '',
    //       fromdate: '',
    //       todate: '',
    //       employeeId: null,
    //       pageCount: this.state.page,
    //       numPerPage: this.state.pageSize,
    //       type:this.state.filterType,
    //     }

    //     apiCalls(
    //       context.setModalTypeHandler,
    //       context.setLoaderStatusHandler,
    //       this.props.listAllLeaveRequestAction(leaveData, context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler,
    //         (response) => {
    //           // if (response === 200) {
    //           //   console.log('yes1');
    //           //   this.setState({ id: this.props.leave_request[0]?.leaveId })
    //           // }
    //         }),
    //       // this.props.getLoanListAction(data, context.setLoaderStatusHandler, context.setModalStatusHandler),
    //       this.props.getLoanListAction(data,
    //         (response) => {
    //           //console.log('yes2');
    //           // if (response.status === 200) {
    //           //   this.setState({ loanId: response.data?.data[0]?.id })
    //           // }
    //         }),
    //         this.props.searchClaimAndOthersAction(claimdata, 
    //           (responseCallback) => {
    //             // console.log('yes2');
    //             // if (response.status === 200) {
    //             //   this.setState({ loanId: response.data?.data[0]?.id })
    //             // }
    //           }),
              
    //     ).finally(() => this.setState({ isApiFinished: true }));
    //     // this.setState({ id : this.props.leave_request[0]?.leaveId })
    //     // if (this.props.setModalStatusHandler) this.setState({open: true});
    //   }
    // };
    if (prevState.type !== this.state.type) {
      if(this.state.type === '1' ){
        const leaveData = {
          date: null,
          type: null,
          employee_id: null,
          pageCount:this.state.page,
          numPerPage:this.state.pageSize
        }
        this.setState({...this.state, createdAt: null,employee: null,filterLeaveType: null})
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.listAllLeaveRequestAction(leaveData, context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler,
            (response) => {
              if (response.status === 200) {
                // console.log('yes3');
                this.setState({ id: this.props.leave_request?.data?.length > 0 ? this.props.leave_request.data[0]?.leaveId : '' })
                
              }
            }
          ),
        )
      }
      else if(this.state.type === '2'){
        const data = {
          tenure: "", frmdate: '', todate: '', emp_name: "", status: "", numPerPage: null,
          pageCount: '',
          searchString: '',
          date: null,
          employeeId: null
        }
        this.setState({...this.state, createdAt: null,employee: null})
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.getLoanListAction(data,
            (response) => {
              if (response.status === 200) {
                //console.log('yes4');
                this.setState({ loanId: response.data?.data?.length > 0 ? response.data.data[0].id : null })
              }
            }
          )
        )
      } else if (this.state.type === '5') {
        const claimdata = {
          searchString: '',
          fromdate: '',
          todate: '',
          employeeId: null,
          pageCount: this.state.page,
          numPerPage: this.state.pageSize,
          type:this.state.filterType,
        }
        this.setState({ createdAt: null, employee: null });
    
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.searchClaimAndOthersAction(claimdata, (responseCallback) => {
            console.log("thishere");
            
            if (responseCallback.status === 200) {
              this.setState({ claimAndOtherId: responseCallback.data?.data?.length ? responseCallback.data.data[0]?.unique_key : '' });
            }
          })
        );
      }
    }
    if (prevProps.searchClaim !== this.props.searchClaim) {
      //this.setState({ claimAndOtherId: this.props.searchClaim[0]?.claim_id });
      this.setState({ searchClaim: this.props.searchClaim  });
      this.setState({ claimAndOtherId: this.props.searchClaim?.data?.length ? this.props.searchClaim?.data[0]?.unique_key : '' });
    }
  }


  handleDelete = () => {
    let leaveData = {
      fromdate: null,
      todate: null,
      type: null,
      employee_id: ( this.storage.role_name === 'Employee'  || this.storage.role_name === "Manager" ) ? this.storage.employee_id : null,
      pageCount: this.state.page,
      numPerPage:this.state.pageSize
    }
    this.props.listAllLeaveRequestAction(leaveData, this.context.commoncookie, this.context.setModalTypeHandler, this.context.setLoaderStatusHandler, (response) => {
      if (response.res === 200) {
        this.setState({ id: this.props.leave_request.data[0]?.leaveId })
      }
    })
  }

  handleLoanDelete = () => {
       const data = {
      tenure: "",
      frmdate: '',
      todate: '',
      emp_name: "",
      status: "",
      numPerPage: null,
      pageCount: '',
      searchString: '',
      date: null,
      employeeId: null
    }
    this.props.getLoanListAction(data, (response) => {
      if (response.status === 200) {
        this.setState({ loanId: response.data?.data[0]?.id })
      }
    })
  }

  handleClaimDelete = () => {
    const claimdata = {
      searchString: '',
      fromdate: '',
      todate: '',
      employeeId: null,
      pageCount: this.state.page,
      numPerPage: this.state.pageSize,
      type:this.state.filterType,
    }
    this.props.searchClaimAndOthersAction(claimdata, (responseCallback) => {
      if (responseCallback.status === 200) {
        this.setState({ claimAndOtherId: responseCallback.data?.data?.length ? responseCallback.data.data[0]?.unique_key : '' })
      }
    })
  }
  

  handleChange = async (data) => {
    var date_val = data.target.value;
    await this.setState({ [data.target.name]: date_val });
  };

  handleShowNext = async ()=>{
    this.setState({page: this.state.page + 1})
    const context = this.context;
    let leaveData = {
      fromdate: this.state.fromdate,
      todate: this.state.todate,
      type: this.state.filterLeaveType,
      employee_id:  (this.storage.role_name === 'Employee'  || this.storage.role_name === "Manager" )  ? this.storage.employee_id : (this.state.valueforEmployee?.employee_id || null),
      pageCount: this.state.page + 1,
      numPerPage: this.state.pageSize
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listAllLeaveRequestAction(leaveData, context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler, (response) => {
        if (response.res === 200) {
          this.setState({ id: this.props.leave_request.data[0]?.leaveId })
        }
      }))
    }    
    
    handleShowPrev = async ()=>{
    this.setState({page: this.state.page === 0 ? 0 : this.state.page - 1})
    const context = this.context;
    let leaveData = {
      fromdate: this.state.fromdate,
      todate: this.state.todate,
      type: this.state.filterLeaveType,
      employee_id: (this.storage.role_name === 'Employee'  || this.storage.role_name === "Manager" ) ? this.storage.employee_id : (this.state.valueforEmployee?.employee_id || null),
      pageCount: this.state.page === 0 ? 0 : this.state.page - 1,
      numPerPage: this.state.pageSize
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listAllLeaveRequestAction(leaveData, context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler, (response) => {
        if (response.res === 200) {
          this.setState({ id: this.props.leave_request.data[0]?.leaveId })
        }
      }))
    }    
  handleAssignChange = async (event) => {
    const { name, value } = event.target

    await this.setState({ [name]: value })
  }

  resDataRequest = (formValue,value,reqId) => {
// console.log("adadada",formValue,value)


    let employee_id = this.storage?.employee_id || '';

    let type = formValue.request_type == 1 ? 'Leave Request' : formValue.request_type == 2 ?  'Permission Request' : 'Leave Request';
    let   request_type_id  =  type  == 'Leave Request' ? 1 :  type  == 'Permission Request' ? 2 : 1
    let data = {
      type,
      request_type_id,
      employee_id,
      fromDate: moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
      toDate:  formValue.halfDay ?  moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD') : (value == 1 ? moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD') : moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD')),
      reason: formValue.halfDayReason,
      leaveType: value == 1 ? formValue.leaveType : null
    }
    this.props.getNotificationTokenAction(data,
      (response) => {
        if (response?.status === 200) {
          this.props.CreateNotificationAction({ content_body: response?.data.body, title: response?.data?.title, time: getDateTimeFormat(new Date()), "active": "1" , type:type, type_id : reqId, receiver:response?.data?.receiver_id})


        }
      })

  }

  handleSubmit = async (formValue, value) => {
    this.setState({ isAllDay: formValue.request_type })
    const context = this.context;

    // console.log("formValue.request_type",formValue,value)
    
    const data = {
      
      employee_id: context.commoncookie,
      fromDate: moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
      toDate:  formValue.halfDay ?  moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD') : (value == 1 ? moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD') : moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD')),
      startTime: formValue.halfDay ? null : formValue.leaveType ? null : moment(formValue.startTime).format("HH:mm:00"),
      endTime: formValue.halfDay ? null : moment(formValue.endTime).format("HH:mm:00"),
      request_type: value == 2 ? 2 : (formValue.halfDay ? 4 : 1),
      leaveType: value == 1 ? formValue.leaveType : null,
      reason: formValue.halfDayReason,
      // restrictedHolidayDate: formValue.holidayDate,
      restrictedHolidayDatas: formValue.restrictedHolidayDatas,
      note: formValue.note,
      status: "Pending",
      correction_type: 0,
      seen: 0,
      halfday_type: formValue.halfDay ? (formValue.halfDayType === 'First Half' ? 1: 2) : null,
      halfDayReason: value == 1 ? formValue.halfDayReason : null,
      halfDayType: value == 1 ? formValue.halfDayType : null,
      permissionType: value == 2 ? formValue.permissionType :null,
      LoggedFromDate:   (formValue.leaveType === 'Compensatory Off '  &&  formValue.halfDay === false )   ?  moment(this.state.LoggedFromDate, 'year', 'month', 'day').format('yyyy-MM-DD') : null,
      LoggedToDate:  (formValue.leaveType === 'Compensatory Off '  &&  formValue.halfDay === false )  ?  moment(this.state.LoggedToDate, 'year', 'month', 'day').format('yyyy-MM-DD') : null,
      halfDayLoggedDate:  (formValue.leaveType === 'Compensatory Off '  &&  formValue.halfDay === true ) ?  moment(this.state.halfDayLoggedDate, 'year', 'month', 'day').format('yyyy-MM-DD') : null,
    }

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      value == 1 ?
        
                      this.props.createLeaveRequestAction(
                        data, context.setModalTypeHandler,
                        context.setLoaderStatusHandler,
                        (response) => {
                          if(response?.data?.response_code === 500 ){
                            this.setState({ open: true }); 
                          }
                          else{
                            if (response?.status === 200) {
                              const reqId = response?.data?.data[0]?.insertId
                              this.resDataRequest(formValue,value,reqId)
                              const leaveData = {
                                date: this.state.createdAt,
                                type: this.state.filterLeaveType,
                                employee_id: this.state.employee,
                                pageCount:this.state.page,
                                numPerPage:this.state.pageSize
                              }
                              this.props.listAllLeaveRequestAction(leaveData, context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler, (response) => {
                                
                                if (response.res === 200) {
                                  this.setState({ id: this.props.leave_request.data[0]?.leaveId, from: moment(), to: moment() })
                                }
                              })
                            }
                             this.setState({ open: false })
                          }
                 
                
                        }
                      )

        :
        this.props.listprePermissionRequestAction(context.commoncookie, data, context.setModalTypeHandler, context.setLoaderStatusHandler,

          (response) => {

            if (response.data === 'HOLIDAY') {
              this.setState({ alertopen: true, isHoliday: response.data })
              return
            }

            if (response.data === 'ANOTHER REQUEST EXISTS') {
              this.setState({ alertopen: true, isHoliday: response.data })
              return
            }
            if (response.data === 'Permission Exceeds Shift Time') {
              this.setState({ alertopen: true, isHoliday: response.data })
              return
            }
            this.props.createLeaveRequestAction(
              data, context.setModalTypeHandler,
              context.setLoaderStatusHandler,
              (response) => {
                // console.log("response",response)
                if(response?.data?.response_code === 500 ){
                  this.setState({ open: true }); 
                }
                else {
                  if (response?.status === 200) {
                    const reqId = response?.data?.data[0]?.insertId
                    this.resDataRequest(data,value,reqId)
                    const leaveData = {
                      date: this.state.createdAt,
                      type: this.state.filterLeaveType,
                      employee_id: this.state.employee,
                      pageCount:this.state.page,
                      numPerPage:this.state.pageSize
                    }
                    
                
                    this.props.listAllLeaveRequestAction(leaveData, context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler, (response) => {
                      if (response.res === 200) {
                        this.setState({ id: this.props.leave_request.data[0]?.leaveId, from: moment(), to: moment() })
                      }
                    })
                  }

                   this.setState({ open: false })
                }
               
                
      
              }
            )
          })
    )
    // this.setState({ open: false })
  };





  response = () => {
//console.log("sfsfsfsf")
    
    let emp_id = this.storage?.employee_id || '';
    let employee_id = this.state.EmpId
    let type = this.state.isAllDay == 1 ? 'Leave Rejection' : 'Permission Rejection';
    let data ={
      type,
      employee_id,
      key: 'Verifier'
    }
    this.props.getNotificationTokenAction(data,
      (response) => {
        if (response?.status === 200 ) {
          this.props.CreateNotificationAction({ content_body: response?.data.body, title: response?.data?.title, time: getDateTimeFormat(new Date()), "active": "1", receiver: employee_id })

  
  }
})
  }

  responseAtt = () => {
//console.log("asdada")
    let emp_id = this.storage?.employee_id || '';
    let employee_id = this.state.EmpId
    let type = 'Attendance Correction Rejection'
    let data ={
      type,
      employee_id,
      key: 'Verifier'
      
    }
    this.props.getNotificationTokenAction(data,
      (response) => {
        if (response?.status === 200 ) {
            
          this.props.CreateNotificationAction({ content_body: response?.data.body, title: response?.data?.title, time: getDateTimeFormat(new Date()), "active": "1", receiver: employee_id })

  
  }
})
    // let emp_id = this.storage?.employee_id || '';
    // let Emp_Id = this.state.EmpId
    // this.props.getTokenByEmpId(Emp_Id, (token, content) => {
    //   let notify_type = notificationType('Attendance Correction Rejection');
    //   let notify_content = content?.filter(
    //     (m) => m.notification_type === notify_type,
    //   );
    //   if (notify_content.length) {
    //     let content_body = notify_content[0].body_msg;
    //     sendNtfy(token, notify_content[0]?.title, content_body);
    //     this.props.CreateNotificationAction({ content_body: content_body, title: notify_content[0]?.title, time: getDateTimeFormat(new Date()), "active": "1", receiver: Emp_Id })
    //   }
    // })

  }

  handleClaimInitialData = () => {
    //console.log("this");
    const claimdata = {
      searchString: '',
      fromdate: '',
      todate: '',
      employeeId: null,
      pageCount: this.state.page,
      numPerPage: this.state.pageSize,
      type:this.state.filterType,
    }
    apiCalls(
      this.context.setModalTypeHandler,
      this.context.setLoaderStatusHandler,
      this.props.searchClaimAndOthersAction(claimdata, (responseCallback) => {
        if (responseCallback.status === 200) {
          this.setState({ claimAndOtherId: responseCallback.data?.data?.length ? responseCallback.data.data[0]?.unique_key : '' });
          //console.log(claimAndOtherId,"claimAndOtherId4542");
        }
      })
    );
  }

  handleCancel = async (data) => {
    this.setState({ EmpId: data.employee_id })

    const context = this.context;
    const cancelledBy = {
      cancelledBy: this.storage?.first_name + (this.storage?.last_name ? ' ' + this.storage.last_name : ''),
      reason_for_rejection: 'canceled by the initiator'
    }
    const leaveId = roleType.includes(this.storage?.role_name) ? data?.leaveId : data
    if (leaveId !== '') {
      if (data.correction_type === 1) {
        this.props.cancelLeaveRequestAction(context.commoncookie, leaveId, cancelledBy)
      } else {
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.cancelLeaveRequestAction(context.commoncookie, leaveId, cancelledBy)
        )
        this.setState({ dialogOpen: false })
      }

    }

  }

  handleCancelClaim = async (data) => {
    this.setState({ EmpId: data.employee_id })

    const context = this.context;
    const cancelledBy = {
      cancelledBy: this.storage?.first_name + (this.storage?.last_name ? ' ' + this.storage.last_name : ''),
      reason_for_rejection: 'canceled by the initiator'
    }
    const claim_id = roleType.includes(this.storage?.role_name) ? data?.claim_id : data
    if (claim_id !== '') {
      if (data.claim_id) {
        this.props.cancelLeaveRequestAction(context.commoncookie, claim_id, cancelledBy)
      } else {
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.cancelLeaveRequestAction(context.commoncookie, claim_id, cancelledBy)
        )
        this.setState({ dialogOpen: false })
      }

    }

  }
  // handleClear = () => {
  //   this.setState({
  //     selectedDate: null, 
  //     employee: null, 
  //     type3: '', 
  //   });
  // };

  // handleApprove = async (data) => {
  //   const context = this.context;
  //   const approvedBy = {
  //     approvedBy: this.storage?.first_name
  //   }
  //   if (data.id !== '') {

  //     let payloadData = { fromDate: data.fromDate, toDate: data.toDate, employee_id: data.employee_id }

  //     this.props.getConflictLeaveRequestAction(context.commoncookie, payloadData, context.setModalTypeHandler, context.setLoaderStatusHandler, (response) => {
  //       if (response.length === 1) {
  //         this.props.ApproveLeaveRequestAction(context.commoncookie, data.leaveId, approvedBy, context.setModalTypeHandler, context.setLoaderStatusHandler,
  //           (response) => {
  //             // const cookies = new Cookies();
  //             let emp_id = this.storage?.employee_id || '';
  //             if (response === 200) {
  //               this.props.getLoginRoleAction(emp_id, (role_name, token, content) => {
  //                 if (role_name === 'Administrator') {
  //                   let notify_type = notificationType('Payout');
  //                   let notify_content = content?.filter(
  //                     (m) => m.notification_type === notify_type,
  //                   );
  //                   if (notify_content.length) {
  //                     let content_body = `Hello Everyone`;
  //                     sendNtfy(token, notify_content[0]?.title, content_body);
  //                     this.props.CreateNotificationAction({ content_body: content_body, title: notify_content[0]?.title, time: getDateTimeFormat(new Date()), "active": "1" })
  //                   }
  //                 }
  //               })
  //             }
  //           }
  //         );
  //       }
  //       else {
  //         this.setState({ dialogOpen: true })
  //       }
  //     })
  //   }
  // }
  getRequestType = () => {

    let arr = {
      '1': "Leave Approval",
      '2': "Permission Approval",
      '3': "Attendance Correction Approval",
      '4': "Halfday"
    }
  return arr[this.state.request_type]
}


  resData = (value) => {
    let requestType = this.getRequestType()
    let emp_id = this.storage?.employee_id || '';
    let employee_id = this.state.EmpId
    let type = requestType
    let request_type_id =  type == 'Leave Approval' ? '1' : type == 'Permission Approval' ? 2 :  type == 'Attendance Correction Approval' ? 3 : 1
    let data = {
        type,
        employee_id,
        request_type_id
    }
    this.props.getNotificationTokenAction(data,
      (response) => {
        if (response?.status === 200 ) {
            
          this.props.CreateNotificationAction({ content_body: response?.data.body, title: response?.data?.title, time: getDateTimeFormat(new Date()), "active": "1", receiver: employee_id })

  
  }
})
    
    // let emp_id = this.storage?.employee_id || '';
    // let Emp_Id = this.state.EmpId
    // this.props.getTokenByEmpId(Emp_Id, (token, content) => {
    //   let requestType = this.getRequestType()
      
    //   let notify_type = notificationType(requestType);
    //   let notify_content = content?.filter(
    //     (m) => m.notification_type === notify_type,
    //   );
    //   if (notify_content.length) {
    //     let content_body = notify_content[0].body_msg;
    //     sendNtfy(token, notify_content[0]?.title, content_body);
    //     this.props.CreateNotificationAction({ content_body: content_body, title: notify_content[0]?.title, time: getDateTimeFormat(new Date()), "active": "1", receiver: Emp_Id })
    //   }
    // })
  }

  resDataLoan = (status, ApproveType) => {

    // let emp_id = this.storage?.employee_id || '';
    let employee_id = this.state.EmpId
    let type = 'Loan Approval'
    let data ={
      type,
      employee_id
    }
    this.props.getNotificationTokenAction(data,
      (response) => {
        if (response?.status === 200 ) {
            
          this.props.CreateNotificationAction({ content_body: response?.data.body, title: response?.data?.title, time: getDateTimeFormat(new Date()), "active": "1", receiver: employee_id })

  
  }
})
    // let emp_id = this.storage?.employee_id || '';
    // let Emp_Id = this.state.EmpId
    // this.props.getTokenByEmpId(Emp_Id, (token, content) => {
    //   let notify_type = notificationType('Loan Approval');
    //   let notify_content = content?.filter(
    //     (m) => m.notification_type === notify_type,
    //   );
    //   if (notify_content.length) {
    //     let content_body = notify_content[0].body_msg;
    //     sendNtfy(token, notify_content[0]?.title, content_body);
    //     this.props.CreateNotificationAction({ content_body: content_body, title: notify_content[0]?.title, time: getDateTimeFormat(new Date()), "active": "1", receiver: Emp_Id })
    //   }

    // })
  }

  resDataAtt = (status, ApproveType) => {

    // let emp_id = this.storage?.employee_id || '';
    let employee_id = this.state.EmpId
    let type = 'Attendance Correction Approval'
    let data ={
      type,
      employee_id
    }
    this.props.getNotificationTokenAction(data,
      (response) => {
        if (response?.status === 200 ) {
            
          this.props.CreateNotificationAction({ content_body: response?.data.body, title: response?.data?.title, time: getDateTimeFormat(new Date()), "active": "1", receiver: employee_id })

  
  }
})
    // let emp_id = this.storage?.employee_id || '';
    // let Emp_Id = this.state.EmpId
    // this.props.getTokenByEmpId(Emp_Id, (token, content) => {
    //   let notify_type = notificationType('Attendance Approval');
    //   let notify_content = content?.filter(
    //     (m) => m.notification_type === notify_type,
    //   );
    //   if (notify_content.length) {
    //     let content_body = notify_content[0].body_msg;
    //     sendNtfy(token, notify_content[0]?.title, content_body);
    //     this.props.CreateNotificationAction({ content_body: content_body, title: notify_content[0]?.title, time: getDateTimeFormat(new Date()), "active": "1", receiver: Emp_Id })
    //   }

    // })
  }

  resDataClaim = (status, ApproveType) => {

    // let emp_id = this.storage?.employee_id || '';
    let employee_id = this.state.EmpId
    let type = 'Claim Approval'
    let data = {
      type,
      employee_id
    }
    this.props.getNotificationTokenAction(data,
      (response) => {
        if (response?.status === 200) {

          this.props.CreateNotificationAction({ content_body: response?.data.body, title: response?.data?.title, time: getDateTimeFormat(new Date()), "active": "1", receiver: employee_id })


        }
      })
  }





  handleApprove = async (data) => {

    // console.log("data",data)
    this.setState({ EmpId: data.employee_id , request_type : data.request_type , id: data.leaveId})
    const context = this.context;

    const approvedBy = {
      approvedBy:this.storage?.first_name + (this.storage?.last_name ? this.storage.last_name !== null ? ' ' + this.storage.last_name : '' : ''),
      approverId:null,
      verifierId:null,
      request_type : data.request_type,
      department_id: data.department_id
    }
    // console.log("data.isApproverOrVerifier ",data.isApproverOrVerifier )
    if (data.isApproverOrVerifier === 'approveAndVerify') {
      approvedBy.approverId = this.storage?.employee_id
      approvedBy.verifierId = this.storage?.employee_id
    }
    else if(data.isApproverOrVerifier === 'approve'){
      approvedBy.approverId = this.storage?.employee_id
      
    }
    else if(data.isApproverOrVerifier === 'verify'){
      approvedBy.approverId = data.approverId
      
      approvedBy.verifierId = this.storage?.employee_id
      
    }
    else{
      approvedBy.approverId = this.storage?.employee_id
      approvedBy.verifierId = this.storage?.employee_id
    }


    // console.log("asdasd",approvedBy)
    
    if (data.id !== '') {

      let payloadData = { fromDate: data.fromDate, toDate: data.toDate, employee_id: data.employee_id }

      this.props.getConflictLeaveRequestAction(context.commoncookie, payloadData, context.setModalTypeHandler, context.setLoaderStatusHandler, (response) => {
        if (response.length === 1) {

          if (data.correction_type !== 1) {
            this.props.ApproveLeaveRequestAction(context.commoncookie, data.leaveId, approvedBy, context.setModalTypeHandler, context.setLoaderStatusHandler, this.resData);
          }
        }
        else {
          if(response[0]?.request_type == 3){
          const shiftIdCount = response.reduce((acc, request) => {
            acc[request.shift_id] = (acc[request.shift_id] || 0) + 1;
            return acc;
        }, {});
        
        // Step 2: Filter out objects where shift_id is repeated
        const repeatedShiftIdRequests = response.filter(request => shiftIdCount[request.shift_id] > 1);
        
        console.log('repeatedShiftIdRequests', repeatedShiftIdRequests);
          if(repeatedShiftIdRequests.length > 0){
          this.setState({ dialogOpen: true })
          }
        }else{
          this.setState({ dialogOpen: true })
        }
        }
      })
    }
  }

  handleCorrect = (data) => {
    console.log(data,"333333")
    this.setState({ EmpId: data.employee_id })
    const context = this.context;
    const approvedBy = {
      approvedBy: this.storage?.first_name + (this.storage?.last_name ? this.storage.last_name !== null ? ' ' + this.storage.last_name : '' : ''),
      approverId:null,
      verifierId:null,
      request_type: 3,
      department_id: data.department_id
    }
    if (data.isApproverOrVerifier === 'approveAndVerify') {
      approvedBy.approverId = this.storage?.employee_id
      approvedBy.verifierId = this.storage?.employee_id
    }
    else if(data.isApproverOrVerifier === 'approve'){
      approvedBy.approverId = this.storage?.employee_id
      
    }
    else if(data.isApproverOrVerifier === 'verify'){
      approvedBy.approverId = data.approverId
      
      approvedBy.verifierId = this.storage?.employee_id
      
    }
    else{
      approvedBy.approverId = this.storage?.employee_id
      approvedBy.verifierId = this.storage?.employee_id
    }
    
    if (data.correction_type === 1) {
      this.props.ApproveLeaveRequestAction(context.commoncookie, data.leaveId, approvedBy, context.setModalTypeHandler, context.setLoaderStatusHandler, this.resDataAtt);
    }
  }
  


  handleConflictApprove = (data) => {
    const context = this.context;
    const approvedBy = { approvedBy:this.storage?.first_name + (this.storage?.last_name ? this.storage.last_name !== null ? ' ' + this.storage.last_name : '' : '')}

    let payloadData = { fromDate: data.fromDate, toDate: data.toDate, employee_id: data.employee_id,
       approvedBy: this.storage?.first_name + (this.storage?.last_name ? ' ' + this.storage.last_name : ''), 
       leaveId: data.leaveId, FHday: data.allDay, startTime: data.startTime, endTime: data.endTime
       }

    if (data.leaveId !== '') {
      this.props.ApproveLeaveRequestAction(context.commoncookie, data.leaveId, approvedBy, context.setModalTypeHandler, context.setLoaderStatusHandler,
        (response) => {
          // const cookies = new Cookies();
          let emp_id = this.storage?.employee_id || '';
          if (response === 200) {
            this.props.getLoginRoleAction(emp_id, (role_name, token, content) => {
              if (!roleType.includes(role_name)) {
                let notify_type = notificationType('Leave Approval');
                let notify_content = content?.filter(
                  (m) => m.notification_type === notify_type,
                );
                if (notify_content.length) {

                  let content_body = `Hello Everyone`;
                  sendNtfy(token, notify_content[0]?.title, content_body);
                  this.props.CreateNotificationAction({ content_body: content_body, title: notify_content[0]?.title, time: getDateTimeFormat(new Date()), "active": "1" })
                }
              }
            })
            this.props.updateConflictLeaveRequestAction(context.commoncookie, data.leaveId, payloadData, context.setModalTypeHandler, context.setLoaderStatusHandler,
              (response) => {
                if (response === 200) {
                  const leaveData = {
                    date: this.state.createdAt,
                    type: this.state.filterLeaveType,
                    employee_id: this.state.employee,
                    pageCount:this.state.page,
                    numPerPage:this.state.pageSize
                  }
                  this.props.listAllLeaveRequestAction(leaveData, context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler, (response) => {
                    if (response.res === 200) {
                      this.setState({ id: this.props.leave_request.data[0]?.leaveId, from: moment(), to: moment() })
                    }
                  })
                }
              }
            )
          }
        }
      );
      this.setState({ dialogOpen: false })
    }
  }

  handleConflictClose = (val) => {
    this.setState({ dialogOpen: val })
  }

  DateWithDayMonthFormat = (date) => {
    let now = new Date(date);
    let day = now.getDate();
    let month = now.toLocaleString('default', { month: 'short' })
    // return month + ' ' + day
    return day + ' ' + month
  }

  handleApproveRequest = (f, name,allData) => {

    const context = this.context;
    this.setState({ currentReq: f });
  
    const data = {
      tenure: "", frmdate: '', todate: '', emp_name: "", status: "", numPerPage: null,
      pageCount: '',
      searchString: '',
      date: null,
      employeeId: null
    };

    let claimdata = {
      searchString: '',
      fromdate: '',
      todate: '',
      employeeId: null
    }
  
    if (name === 'leave') {
      this.setState({ id: f, tabType: '1' });
      if (roleType.includes(this.storage.role_name)) {
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.updateSeenAction(f, (response,unseenCount) => {
            if (response === 200) {
              const leaveData = {
                date: this.state.createdAt,
                type: this.state.filterLeaveType,
                employee_id: this.state.valueforEmployee?.employee_id || null,
                pageCount:this.state.page,
                numPerPage:this.state.pageSize
              };
              this.props.listAllLeaveRequestAction(leaveData, context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler, (response) => {
                if (response.res === 200) {
                  this.setState({ id: this.state.currentReq, from: moment(), to: moment(),unseenCount: unseenCount });
                }
              });
            }
          })
        );
      }
    } else if (name === 'loan') {
      this.setState({ loanId: f, tabType: '3' });
      if (roleType.includes(this.storage.role_name)) {
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.updateSeenLoanAction(f, (response) => {
            if (response === 200) {
              
              // Add any necessary loan related API calls here
  
              this.props.getLoanListAction(data,
                (response) => {
                  if (response) {
                    this.setState({ loanId: f })
                  }
                })
  
              // this.props.listAllLeaveRequestAction(context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler, (response) => {
              //   if (response === 200) {
              //     this.setState({ id: this.props.leave_request[0]?.leaveId, from: moment(), to: moment() })
              //   }
              // })
            }
          })
        );
      }
    } else if (name === 'claim') {
      this.setState({ claimAndOtherId: f, tabType: '4' });
      if (roleType.includes(this.storage.role_name)) {
          const id = allData.type === 'claims' ? allData.claim_id : allData.unique_id_emp_location
                const type = allData.type === 'claims' ? 'claims' : 'wfh'
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.updateSeenClaimAndOthersAction(id,type, (response) => {
            if (response === 200) {
              let claimdata = {
                searchString: '',
                fromdate: this.state.fromdate,
                todate: this.state.todate,
                employeeId: this.state.valueforEmployee?.employee_id || null,
                pageCount: this.state.page,
                numPerPage: this.state.pageSize,
                type:this.state.filterType,
              }
              this.props.searchClaimAndOthersAction(claimdata, (responseCallback) => {
                if (responseCallback.res === 200) {
                  this.setState({ claimAndOtherId: this.state.currentReq, from: moment(), to: moment() });
                }
              });
            }
          })
        );
      }
    }
  }
  


  handleStatus = (data, approvedBy, cancelledBy, allData) => {
     //console.log(data, approvedBy, cancelledBy, allData,'statuscheck');
     const requestType = allData.request_type;
    let reason;
    if (requestType === 1) {
        reason = 'Leave';
    } else if (requestType === 2) {
        reason = 'Permission';
    } else if (requestType === 3) {
        reason = 'Attendance Correction';
    } else if (requestType === 4) {
        reason = 'HalfDay';
    } else {
        reason = 'Claim';
    }
    if (data === 'Approved') {
      // return `${approvedBy.charAt(0).toUpperCase() + approvedBy.slice(1)} approved ${reason} request`
      const approvedByName = approvedBy ? approvedBy.charAt(0).toUpperCase() + approvedBy.slice(1) : '';
      return `${approvedByName} approved ${reason} request`;
    } else if (data === "Pending") {
      return `${allData?.first_name + (allData.last_name ? ' ' + allData.last_name : '')} Request ${allData.status} for ${reason}`
    } else {
      // return `${cancelledBy.charAt(0).toUpperCase() + cancelledBy.slice(1)} rejected ${reason} request`
      const cancelledByName = cancelledBy ? cancelledBy.charAt(0).toUpperCase() + cancelledBy.slice(1) : '';
      return `${cancelledByName} ${data} ${reason} request`;
    }
  }

  handleStatusClaim = (data, approvedBy, cancelledBy, allData) => {
    console.log(data, approvedBy, cancelledBy, allData,'statuscheck');
   let  reason = allData.type;
 
   if (data === 'Approved') {
     // return `${approvedBy.charAt(0).toUpperCase() + approvedBy.slice(1)} approved ${reason} request`
     const approvedByName = approvedBy ? approvedBy.charAt(0).toUpperCase() + approvedBy.slice(1) : '';
     return `${approvedByName} approved ${reason} request`;
   } else if (data === "Pending") {
     return `${allData?.full_name} Request ${allData.status} for ${reason}`
   } 
  //  else if (data === "Waiting for Approval") {
  //   return `${allData?.full_name} Request ${allData.status} for ${reason}`
  // } 
   
   else {
    console.log("9999",data,reason)
     // return `${cancelledBy.charAt(0).toUpperCase() + cancelledBy.slice(1)} rejected ${reason} request`
     const cancelledByName = cancelledBy ? cancelledBy.charAt(0).toUpperCase() + cancelledBy.slice(1) : '';
     return `${cancelledByName} ${data} ${reason} request`;
   }
 }

  ////loanhandle
  handleStatusLoan = (status, approvedBy, cancelledBy, f) => {
    console.log('loanStatus', status, approvedBy, cancelledBy, f.full_name)
    const reason = 'Loan'
    const approvedByName = approvedBy ? approvedBy.charAt(0).toUpperCase() + approvedBy.slice(1) : '';
    const cancelledByName = cancelledBy ? cancelledBy.charAt(0).toUpperCase() + cancelledBy.slice(1) : '';
    const emp_name = f?.full_name ; 
    if (status === 'Approved') {
      return `${approvedByName} Approved` //`${approvedBy} Approved`
    } else if (status === "Waiting for Approval") {
      return `${emp_name} Request ${status} for ${reason}`
    } else if (status === "Pending") {
      return `${emp_name} Request ${status} for ${reason}`
    } else {
      // return `${cancelledBy.charAt(0).toUpperCase() + cancelledBy.slice(1)} rejected ${reason} request`
      const cancelledByName = cancelledBy ? cancelledBy.charAt(0).toUpperCase() + cancelledBy.slice(1) : '';
      return `${cancelledByName} ${status} ${reason} request`;
    }
  }
 
  handleChangePagedata = (selectedValue) => {
    this.setState({ type3: selectedValue });
  };

  handleApprovalLoan = async (id, rowdata) => {
    console.log("rowdata",rowdata)
    this.setState({ EmpId: rowdata.emp_id })

    const context = this.context;
    const approvedBy = {
      approvedBy:this.storage?.first_name + (this.storage?.last_name ? this.storage.last_name !== null ? ' ' + this.storage.last_name : '' : ''),
     
      approverId:null,
      verifierId:null,
       department_id: rowdata.department_id,
       request_type : rowdata.request_type
    }

    if (rowdata.isApproverOrVerifier === 'approveAndVerify') {
      approvedBy.approverId = this.storage?.employee_id
      approvedBy.verifierId = this.storage?.employee_id
    }
    else if(rowdata.isApproverOrVerifier === 'approve'){
      approvedBy.approverId = this.storage?.employee_id
      
    }
    else if(rowdata.isApproverOrVerifier === 'verify'){
      approvedBy.approverId = rowdata.approverId
      
      approvedBy.verifierId = this.storage?.employee_id
      
    }
    else{
      approvedBy.approverId = this.storage?.employee_id
      approvedBy.verifierId = this.storage?.employee_id
    }
    
    const data = {
      tenure: "", frmdate: '', todate: '', emp_name: "", status: "", numPerPage: null,
      pageCount: '',
      searchString: '',
      date: this.state.createdAt,
      employeeId: this.state.employee,
    }
    await this.props.updateLoanStatusAction(id, { type: 'approve', Approvedby: approvedBy,request_type:'loan', outstanding: rowdata }, context.setModalTypeHandler, context.setLoaderStatusHandler, this.resDataLoan, (response) => {
      if(response === 200){
    // await this.props.getLoanListAction(data, context.setLoaderStatusHandler, context.setModalStatusHandler),
    this.props.getLoanListAction(data, (response) => {
      if (response.status === 200) {
        this.setState({ loanId: id })
      }
    })
      }
    })

  };

  // handleApprovalClaim = async (id, rowdata) => {
  //   this.setState({ EmpId: rowdata.emp_id })

  //   const context = this.context;
  //   const approvedBy = {
  //     approvedBy:this.storage?.first_name + (this.storage?.last_name ? this.storage.last_name !== null ? ' ' + this.storage.last_name : '' : '')
  //   }
   
  //   await this.props.updateClaimAndOtherStatusAction(id, { type: 'approve', Approvedby: approvedBy.approvedBy }, context.setModalTypeHandler, context.setLoaderStatusHandler, this.resDataClaim, (response) => {
  //     if(response === 200){
  //   // await this.props.getLoanListAction(data, context.setLoaderStatusHandler, context.setModalStatusHandler),
  //   this.props.searchClaimAndOthersAction(data, (response) => {
  //     if (response.status === 200) {
  //       this.setState({ claim_id: claim_id })
  //     }
  //   })
  //     }
  //   })

  // };

  handleRejectLoan = async (id, rowdata) => {
    const context = this.context;
    const approvedBy = {
      approvedBy:this.storage?.first_name + (this.storage?.last_name ? this.storage.last_name !== null ? ' ' + this.storage.last_name : '' : ''),
      rejectedById : this.storage?.employee_id,
    }
    const data = {
      tenure: "",
      frmdate: '',
      todate: '',
      emp_name: "",
      status: "",
      numPerPage: null,
      pageCount: '',
      searchString: '',
      date: null,
      employeeId: null
    }
    await this.props.updateLoanStatusAction(id, { type: 'Reject', cancelledBy: approvedBy, outstanding: rowdata }, context.setModalTypeHandler, context.setLoaderStatusHandler, this.resDataLoan, (response) => {
      if(response === 200){
    // await this.props.getLoanListAction(data, context.setLoaderStatusHandler, context.setModalStatusHandler),
    this.props.getLoanListAction(data, (response) => {
      if (response.status === 200) {
        this.setState({ loanId: response.data?.data[0]?.id })
      }
    })
      }
    })
    // await this.props.getLoanListAction(data, context.setLoaderStatusHandler, context.setModalStatusHandler),
    // await this.props.getLoanListAction(data, (response) => {
    //   if (response.status === 200) {
    //   }
    // })
  };

  handletype = async () => {
    const context = this.context;
    const data = {
      tenure: "",
      frmdate: '',
      todate: '',
      emp_name: "",
      status: "",
      numPerPage: null,
      pageCount: '',
      searchString: '',
      date: null,
      employeeId: null
    }
    // await this.props.getLoanListAction(data, context.setLoaderStatusHandler, context.setModalStatusHandler)
    await this.props.getLoanListAction(data, (response) => {
      if (response.status === 200) {
        this.setState({ loanId: this.props.searchloandata.data[0]?.id })
      }
    })
    await this.setState({ type: '2', loanButton: true })
  }
  handleChangetab = (e) => {
    this.setState({ type: e.target.value })
  };
  // a11yProps(index) {
  //   return {
  //     id: `full-width-tab-${index}`,
  //     'aria-controls': `full-width-tabpanel-${index}`,
  //   };
  // }
  handleClosepopup = () => {
    this.setState({ alertopen: false })
  }

  handleOpenPopUp = (data) => {
    this.setState({ alertopen: true, isHoliday: data })
  }

  statusIconAndColor = (status) => {

    if (status === 'Approved') {
      return <ThumbUpOffAltIcon fontSize='small' style={{ color: 'green' }} />
    }

    if (status === 'cancelled') {
      return <ThumbDownOffAltIcon fontSize='small' style={{ color: 'red' }} />
    }

    if (status === 'Cancelled') {
      return <ThumbDownOffAltIcon fontSize='small' style={{ color: 'red' }} />
    }

    if (status === 'Rejected') {
      return <ThumbDownOffAltIcon fontSize='small' style={{ color: 'red' }} />
    }

    if (status === 'Pending') {
      return <PendingOutlinedIcon fontSize='small' style={{ color: 'orange' }} />
    }

    if (status === 'Waiting for Approval') {
      return <PendingOutlinedIcon fontSize='small' style={{ color: 'orange' }} />
    }
  }


  handleSearchFilter = () => {
    const context = this.context;
    if(this.state.type === '1'){

      const dateObject = moment(this.state.createdAt);
      const formattedDate = dateObject.format("YYYY-MM-DD");
      const leaveData = {
        // date: this.state.createdAt,
        fromdate: this.state.fromdate,
        todate: this.state.todate,
        type: this.state.filterLeaveType,
        employee_id:  (this.storage.role_name === 'Employee'  || this.storage.role_name === "Manager" )  ? this.storage.employee_id : (this.state.valueforEmployee?.employee_id || null),
        pageCount:0,
        numPerPage:this.state.pageSize
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.listAllLeaveRequestAction(leaveData, context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler,
          (response) => {
            if (response.res === 200) {
              this.setState({ id: this.props.leave_request.length > 0 ?  this.props.leave_request?.data[0]?.leaveId : ''})
            }
          }
        ),
      )
    }
    else if(this.state.type === '2'){
      const data = {
        tenure: "", 
        frmdate: this.state.fromdate, 
        todate: this.state.todate, emp_name: "", status: "", numPerPage: null,
        pageCount: '',
        searchString: '',
        date: this.state.createdAt,
        type: 'Filter',
        employeeId:  (this.storage.role_name === 'Employee'  || this.storage.role_name === "Manager" )  ? this.storage.employee_id : (this.state.valueforEmployee?.employee_id || null)
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.getLoanListAction(data,
          (response) => {
            if (response.status === 200) {
              this.setState({ loanId: response.data?.data[0]?.id })
            }
          }
        )
      )
    }
    else if(this.state.type === '5'){
      const claimdata = {
        searchString: '',
        fromdate: this.state.fromdate,
        todate: this.state.todate,
        employeeId:  (this.storage.role_name === 'Employee'  || this.storage.role_name === "Manager" ) ? this.storage.employee_id : (this.state.valueforEmployee?.employee_id || null),
        pageCount: this.state.page,
        numPerPage: this.state.pageSize,
        type:this.state.filterType,
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.searchClaimAndOthersAction(claimdata,
          (responseCallback) => {
            if (responseCallback.status === 200) {
              this.setState({ claimAndOtherId: responseCallback.data?.data?.length ? responseCallback.data.data[0]?.unique_key : ''  })
            }
          }
        )
      )
    }
    this.handleDialogClose()

  }
  handleDialogClose = () => {
    this.setState({ isFilterDialogOpen: false })
  }
  handleDateChange = (newDate)=>{
    const formattedDate = newDate ? moment(newDate).format("YYYY-MM-DD") : null;
    //console.log("formattedDate",formattedDate);
    this.setState({ fromdate: formattedDate});
  }
  tpHandle = (newDate)=>{
    const formattedDate = newDate ? moment(newDate).format("YYYY-MM-DD") : null;
    this.setState({ todate :formattedDate});
  }
  handleClear = async() => {
    const context = this.context;
  

  

       if(this.state.type === '1'){
        const leaveData = {
          fromdate: null,
          todate: null,
          type: null,
          employee_id:  (this.storage.role_name === 'Employee'  || this.storage.role_name === "Manager" ) ? this.storage.employee_id : null,
          pageCount:this.state.page,
          numPerPage:this.state.pageSize
        }
        this.setState({...this.state, createdAt: null,employee: null,filterLeaveType: null,valueforEmployee :[] ,searchValEmployeeFilter:'', fromdate: "",
          todate: ""})
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.listAllLeaveRequestAction(leaveData, context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler,
            (response) => {
              if (response.res === 200) {
                //console.log('yes3');
                this.setState({ id: this.props.leave_request.data[0]?.leaveId })
              }
            }
          ),
        )
      }else if(this.state.type === '5'){
         const claimdata = {
           searchString: '',
           fromdate: '',
           todate: '',
           employeeId: null,
           pageCount: this.state.page,
           numPerPage: this.state.pageSize,
           type:null,
         }
        this.setState({...this.state, createdAt: null,employee: null,fromdate: "",
          todate: "",filterType:null,valueforEmployee :[] ,searchValEmployeeFilter:'',})
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.searchClaimAndOthersAction(claimdata,
            (responseCallback) => {
              if (responseCallback.status === 200) {
                //console.log('yes4');
                this.setState({ claimAndOtherId: responseCallback.data?.data?.length ? responseCallback.data.data[0]?.unique_key : '' })
              }
            }
          )
        )
      }
      else {
        const data = {
          tenure: "", frmdate: '', todate: '', emp_name: "", status: "", numPerPage: null,
          pageCount: '',
          searchString: '',
          date: null,
          employeeId:  (this.storage.role_name === 'Employee'  || this.storage.role_name === "Manager" ) ? this.storage.employee_id : null
        }
        this.setState({...this.state, createdAt: null,employee: null,valueforEmployee :[] ,searchValEmployeeFilter:'',fromdate: '',todate: ''})
        apiCalls(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.props.getLoanListAction(data,
            (response) => {
              if (response.status === 200) {
                //console.log('yes4');
                this.setState({ loanId: response.data?.data[0]?.id })
              }
            }
          )
        )
      }

       this.handleDialogClose()
    // await this.handleSearchFilter()
    // this.handleDialogClose()
  }

  handledata = () =>{
    if(this.storage.role_name === 'Employee'){

      let temp =  this.props.getCompanyBasedEmployeeFilter.filter((d)=> d.employee_id===this.storage.employee_id)

      return temp 
      
    }

    else{
     return this.props.getCompanyBasedEmployeeFilter
    }
     }
     
     
     render() {
       
       console.log(this.props.leave_request?.data?.length, 'length')
    
console.log("requestList",this.props.permissionData)
// console.log("leave_request",this.props.leave_request)
    let reqType;
    if (this.state.type === '1') {
      reqType = '1';
    } else if (this.state.type === '5') {
      reqType = '5';
    } else {
      reqType = '3';
    }
    const { type, claim_id, isFilterDialogOpen, searchClaim } = this.state;
    // console.log('filteredValue1',this.props.searchloandata)
    // console.log('dfwkweiw', this.props.searchClaim)
    

    let tempp =  (this.storage.role_name === 'Employee'  || this.storage.role_name === "Manager" ) ? this.props.getCompanyBasedEmployeeFilter.filter((d) => d.employee_id === this.storage.employee_id) : this.props.getCompanyBasedEmployeeFilter
    const { tabIndex } = this.state;

    return (
      <>
        <Helmet>
          <meta charSet="utf-8" />
          <title> {titleURL} | Requests </title>
        </Helmet>
        <CreateNewButtonContext.Consumer>
          {({ setModalStatusHandler, setModalTypeHandler, drawerOpen, commoncookie,
            headerLocationId,
            setLoaderStatusHandler, }) => (
            <React.Fragment>
              <NewRequest tabType={this.state.tabType} buttonType={reqType} handleClose={this.handleClose} handleError ={this.handleError}
                open={this.state.open} from={this.state.from} startTime={this.state.startTime} LoggedFromDate={this.state.LoggedFromDate} LoggedToDate={this.state.LoggedToDate} halfDayLoggedDate={this.state.halfDayLoggedDate}
                to={this.state.to} handleSubmit={this.handleSubmit} handleChange={this.handleChange}
                handletype={this.handletype} handleAttendanceCorrection={this.handleAttendanceCorrection}
                type={this.state.type} alertopen={this.state.alertopen} isHoliday={this.state.isHoliday}
                handleClosepopup={this.handleClosepopup} handleOpenPopUp={this.handleOpenPopUp} leave_request={this.props.leave_request.data} paidleavecount = {this.props.paidleavecount}
                handleClaimInitialData={this.handleClaimInitialData} permissionData={this.props.permissionData}/>
               {this.state.statusLog === true &&
                <Grid sx={{ display: 'flex', justifyContent: "end" }}>
                  <Alert
                    action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                          this.setState({ statusLog: false })
                        }}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                    sx={{ width: "30%" }}
                    severity="warning"
                    variant="filled"
                  >
                    Already Logged on this date
                  </Alert>
                </Grid>
              }
              {this.state.statusCheck === true &&
                <Grid sx={{ display: 'flex', justifyContent: "end" }}>
                  <Alert
                    action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                          this.setState({ statusCheck: false })
                        }}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                    sx={{ width: "30%" }}
                    severity="warning"
                    variant="filled"
                  >
                    you cannot request on this date salary processed
                  </Alert>
                </Grid>
              }
              {this.state.isFilterDialogOpen === true && (
                <FilterDialog
                  open={this.state.isFilterDialogOpen} 
                  searchVal={this.state.searchValEmployeeFilter}
                  setSearchValEmployeeFilter={this.setSearchValEmployeeFilter}
                  requestSearch={this.requestSearchEmployeeFilter}
                  value={this.state.valueforEmployee}
                  // roleName={'EMPLOYEE_FILTER'}
                  setValue={this.handleChangeEmployeeName}
                  applyFunc={this.handleSearchFilter} 
                  handleClose={this.handleDialogClose} 
                  handleClear={this.handleClear} 
                  get_empbasecompany={this.props.get_empbasecompany} 
                  searchCompanyBasedEmployeeFilter={this.props.searchCompanyBasedEmployeeFilter}
                  getCompanyBasedEmployeeFilter={tempp}
                  handleAssignChange={this.handleAssignChange}
                   filterLeaveType={this.state.filterLeaveType} 
                   role_name={this.storage.role_name}
                   createdAt={this.state.createdAt} 
                   fromdate={this.state.fromdate}
                   todate={this.state.todate}
                   employee={this.state.employee} 
                   employee_id={this.storage.employee_id} 
                   handleDateChange={this.handleDateChange} 
                   tpHandle = {this.tpHandle}
                   type={this.state.type}
                   key={'Request'}
                   filterType={this.state.filterType}

                />
              )}
            
              <Box sx={{ bgcolor: 'background.paper' }}>
{/*           
              <Grid container display='flex' flexDirection='row' spacing={3} p='6px 10px'>
                    <Grid size={{ xs: 12, sm: 5, md: 4, lg: 3.5 }} style={{
                      borderRight: '1px #d9dadc solid',}}>
                <Tabs
                  value={tabIndex} 
                  onChange={this.handleTabChange} 
                  aria-label="tabs example"
                  variant="fullWidth"
                  TabIndicatorProps={{ style: { height: '1px' } }}
                  textColor="inherit"
                  sx={{ minWidth: '50px' }}>
                <Tab icon={<ExitToAppIcon  fontSize="small"/>} label="Requests" className='table-title' />
                <Tab icon={<CreditScoreIcon fontSize="small"/>} label="Loans" className='table-title' />
                <Tab icon={<DescriptionIcon  fontSize="small"/>} label="Claims" className='table-title'/>
                </Tabs>
              </Grid>
              </Grid> */}

              
              {tabIndex === 0 && (
                <div>
                  <Grid container display='flex' flexDirection='row' spacing={3} p='6px 10px'>
                      <Grid
                        style={{
                        // boxShadow: '0 0 0 0.25px #d9dadc'
                        borderRight: '2px #d9dadc solid',
                        marginTop: '5px'
                        // padding: '6px',
                        // height: this.props.leave_request.length > 6 ? `${this.props.leave_request.length * 50}px` : '30px' //this.props.leave_request.length > 0 ? '1px #d9dadc solid' : '',
                      }}
                        size={{
                          lg: 3.5,
                          md: 4,
                          sm: 5,
                          xs: 12
                        }}>
                        <Grid container spacing={3} display='flex' direction={'row'} >
                          {/* <Grid size={{ xs: 12, md: 12 }} >
                          <h4>{this.state.type === '1' ? 'Requests' : this.state.type === '2' ? 'Loan Request' : 'Claims'}</h4>
                        </Grid> */}
                          {/* <Grid size={{ xs: 12, md: 12 }} >
                            <h4>{this.state.type === '1' ? 'Requests' : 'Loan Request'}</h4>
                          </Grid> */}
                          <Grid
                            size={{
                              lg: 12,
                              md: 12,
                              sm: 12,
                              xs: 12
                            }}>
                            <Tabs
                              value={tabIndex}
                              onChange={this.handleTabChange}
                              variant="fullWidth"
                              aria-label="tabs example"
                              sx={{ fontFamily: 'Poppins, sans-serif' }}>
                              <Tab icon={<ExitToAppIcon style={{ color: 'black' }} />} label="Requests" sx={{ fontSize: '12px', fontWeight: 600 }} />
                              {this.storage.subscription_type !== 1 && (
                              <Tab icon={<CreditScoreIcon style={{ color: 'black' }} />} label="Loans" sx={{ fontSize: '12px', fontWeight: 600 }} />
                            )}
                            {this.storage.subscription_type !== 1 && this.storage.subscription_type !== 2 && (
                              <Tab icon={<DescriptionIcon style={{ color: 'black' }} />} label="Others" sx={{ fontSize: '12px', fontWeight: 600 }} />
                            )}
                              </Tabs>
                          </Grid>
                          <Grid
                            size={{
                              md: 12,
                              xs: 12
                            }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="left" spacing={1}
                              sx={{
                                flexWrap: { xs: 'wrap', sm: "wrap", md: 'nowrap', lg: 'nowrap' }
                              }}>
                              {/* <ButtonGroup variant="outlined" aria-label="outlined primary button group">
                              <Button variant={this.state.type === '1' ? "contained" : "outlined"} onClick={() => this.setState({ type: '1' })}>{`Request ${this.props.leave_request.unseenCount?.length>0? this.props.leave_request.unseenCount[0]?.unseenCount:""}`}</Button>
                              <Button variant={this.state.type === '2' ? "contained" : "outlined"} onClick={() => this.setState({ type: '2', loanButton: true })}>Loan</Button>
                              <Button variant={this.state.type === '5' ? "contained" : "outlined"} onClick={() => this.setState({ type: '5' })}>Claims</Button>
                            </ButtonGroup> */}
                              <Grid container  >
                                <Grid>
                                  <Button
                                    onClick={this.handleShowPrev}
                                    style={{ cursor: 'pointer', transition: 'color 0.3s ease, transform 0.3s ease', }}
                                    variant='outlined'
                                    disabled={this.state.page === 0}
                                  >
                                    <ArrowLeftRoundedIcon color="black" />
                                  </Button>
                                </Grid>
                                <Grid>
                                  <Button
                                    onClick={this.handleShowNext}
                                    style={{ cursor: 'pointer', transition: 'color 0.3s ease, transform 0.3s ease', }}
                                    variant='outlined'
                                    disabled={!this.props.leave_request?.data?.length || this.props.leave_request?.data?.length < 15}
                                  >
                                    <ArrowRightRoundedIcon color="black" />
                                  </Button>
                                </Grid>
                              </Grid>
                              <Box flexGrow={1} />
                              <Stack direction="row">
                                <CommonToolTip title="Filter">
                                  <IconButton onClick={() => this.setState({ isFilterDialogOpen: true })}>
                                    <FilterAltIcon style={{ color: 'gray' }} />
                                  </IconButton>
                                </CommonToolTip>

                              <stack direction='row' alignItems='center' spacing={0}>
                              {/* <Tooltip title= {this.state.showUnseenRequests ? "View All" : "Unseen Requests"}>
                                <IconButton onClick={this.handleVisibilityRequest}>
                                      {this.state.showUnseenRequests ? (
                                        <VisibilityOffIcon color="action" />
                                      ) : (
                                        <VisibilityIcon color="action" />
                                      )}
                                  {this.props.leave_request?.unseenCount?.[0]?.unseenCount > 0 && (
                                <Typography variant="body2" style={{ color: 'black', fontWeight: 'bold' }} sx={{ ml: 2 }} >
                                  {this.props.leave_request.unseenCount[0].unseenCount}
                                </Typography>
                              )}
                              </IconButton>
                              </Tooltip> */}
                              </stack>

                              <Tooltip title='New Request'>
                                {this.storage.role_name !== "Administrator" && (
                                  <IconButton onClick={() => this.handleClickOpen('1')}>
                                    <AddCircleIcon color='primary' />
                                  </IconButton>
                                )}
                              </Tooltip>
                            </Stack>
                          </Stack>




                          {/* <Grid container display='flex' flexDirection='row' alignItems='center'>
                            <Grid size={{ xs: 10, sm: 8, md: 8, lg: 11 }}>
                              <ButtonGroup variant="outlined" aria-label="outlined primary button group">
                                <Button variant={this.state.requestButton === false ? "outlined" : "contained"} onClick={() => { this.setState({ type: '1' }) }}>Request </Button>
                                <Button onClick={() => { this.setState({ type: '2', loanButton: true }) }}>loan </Button>
                              </ButtonGroup>
                            </Grid>
                            <Grid size={{ xs: 2, sm: 2, md: 2, lg: 1 }} style={{ display: 'flex', justifyContent: 'left-end', mr:'5px' }} >
                            <CommonToolTip title="Filter">
                              <IconButton onClick={() => this.setState({ isFilterDialogOpen: true })}>
                               <FilterAltIcon style={{ color: 'gray' }} />
                              </IconButton>
                            </CommonToolTip>
                              <Tooltip title='New Request'>
                                {this.storage.role_name !== "Administrator" && (
                               <IconButton onClick={() => this.handleClickOpen('1')}>
                                   <AddCircleIcon color='primary' />
                               </IconButton>
                               )}
                              </Tooltip>
                            </Grid>
                          </Grid> */}
                        </Grid>

                        {/* </TabContext> */}

                        {this.props.leave_request?.data?.length > 0 ?
                          ( <Grid
                          style={{ display: 'flex', width: '100%', minHeight: '100%'}}
                          size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                          }}>
                            <Box sx={{ height: parseInt(this.state.windowHeight) - (parseInt(this.state.toolbarHeight) + 150), width:'100%'}}>
                              <Grid
                                style={{ height: '100%', flexGrow: '1', overflow: 'auto' }}
                                display='flex'
                                alignItems='flex-start'
                                justifyContent='flex-start'
                                sx={{ ...scrollBar }}
                                size={{
                                  lg: 12,
                                  md: 12,
                                  sm: 12,
                                  xs: 12
                                }}>
                                <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                  <nav aria-label="main mailbox folders">
                                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                      {this.props.leave_request?.data?.length > 0 ? this.props.leave_request?.data?.filter((f) => !this.state.showUnseenRequests || f.seen === 0)
                                       .map((f, i) => {
                                        return (
                                          <ListItem
                                            key={f.leaveId}
                                            // sx={{ pl: '6px' }}
                                            {...(this.props.leave_request?.data?.length === i + 1 && { ref: this.lastProductElementRef })}
                                            {...(this.props.leave_request?.data?.length === i + 1 && { 'data-lastitemid': f.leaveId })}
                                          >
                                            <ListItemButton selected={this.state.id === f.leaveId} onClick={() => this.handleApproveRequest(f.leaveId, 'leave')}>
                                              <ListItemAvatar>
                                                <Avatar>
                                                  <img src={personIcon} height={60} width={40} />
                                                </Avatar>
                                              </ListItemAvatar>
                                              <ListItemText
                                                disableTypography
                                                primary={
                                                  <Typography
                                                    style={{
                                                      fontSize: '13px',
                                                      fontWeight:
                                                        f.seen === 0 && roleType.includes(this.storage.role_name)
                                                          ? 'bold'
                                                          : 'normal',
                                                      textTransform: 'capitalize'
                                                    }}
                                                  >
                                                    {this.handleStatus(f.status, f.approvedBy, f.cancelledBy, f)}
                                                  </Typography>

                                                }
                                                secondary={
                                                  <Typography
                                                    style={{fontSize: '13px', fontWeight: f.seen === 0 && roleType.includes(this.storage.role_name) ? 'bold' : 'normal' }}
                                                  >
                                                    {f.request_type === 1 && "All day"}
                                                    {f?.remarks ? this.DateWithDayMonthFormat(f.createdAt.split(' ')[0]) :
                                                      (f.fromDate === f.toDate ? this.DateWithDayMonthFormat(f.fromDate) : this.DateWithDayMonthFormat(f.fromDate) + ' - ' + this.DateWithDayMonthFormat(f.toDate))
                                                    }
                                                    <span style={{ display: "flex", justifyContent: "end" }}>
                                                      {this.statusIconAndColor(f.status)}
                                                    </span>
                                                  </Typography>
                                                } />
                                            </ListItemButton>

                                          </ListItem>
                                        )
                                       }) : []}

                                      </List>
                                     
                                    </nav>
                                  </Box>
                                </Grid>
                              </Box>
                            </Grid>
                            ) :
                            (
                            this.state.isApiFinished ?

                              <Grid style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                                <Box sx={{height: parseInt(this.state.windowHeight) - (parseInt(this.state.toolbarHeight) + 150)}}>
                                  <Grid
                                    style={{ height: '100%', flexGrow: '1' }}
                                    display='flex'
                                    alignItems='center'
                                    justifyContent='center'
                                    size={{
                                      lg: 12,
                                      md: 12,
                                      sm: 12,
                                      xs: 12
                                    }}>
                                    <Typography sx={{
                                      fontSize: 13,
                                      fontWeight: 400,
                                    }}>
                                      {"No Record Found"}
                                      </Typography>
                                    </Grid>
                                  </Box>
                                  
                                </Grid>

                              :
                              ""
                          )
                        }
                      </Grid>
                    </Grid>
                    {this.props.leave_request?.data?.length > 0 ? this.props.leave_request?.data?.filter((f) => f.leaveId === this.state.id).map((f) => (

                       <Grid
                         key={f.id}
                         size={{
                           lg: 8,
                           md: 8,
                           sm: 7,
                           xs: 12
                         }}>
                        <Grid container spacing={3} display='flex' alignItems='center' pt='25px'>
                          <Grid
                            size={{
                              lg: 6,
                              md: 6,
                              sm: 6,
                              xs: 6
                            }}>
                            <Typography variant='h6' align='left' sx={{ fontFamily: 'Poppins, sans-serif' }} style={{}}>{f.correction_type === 1 ? 'Correction Request' : f.request_type == 2 ? 'Time Off' : "Leave Request"}</Typography>
                          </Grid>
                          <Grid
                            display='flex'
                            justifyContent='flex-end'
                            size={{
                              lg: 6,
                              md: 6,
                              sm: 6,
                              xs: 6
                            }}>
                            <Stack direction="row" alignItems="center" gap={1}>
                              {this.statusIconAndColor(f.status)}
                              <Typography variant='body2' align='right' sx={{ fontFamily: 'Poppins, sans-serif' }} > {f.status.charAt(0).toUpperCase() + f.status.slice(1)} </Typography>
                            </Stack>
                          </Grid>
                          <Grid
                            size={{
                              lg: 12,
                              md: 12,
                              sm: 12,
                              xs: 12
                            }}>
                            <Divider />
                          </Grid>
                          {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} >
                        <ApprovalRequest leave_request={this.props.leave_request} id={this.state.id} handleCancel={this.handleCancel} handleApprove={this.handleApprove} />
                      </Grid> */}

                        </Grid>
                        <Box sx={{ padding: '20px', paddingLeft: '20px', display: 'flex', justifyContent: 'center', maxWidth: '100%', minWidth: '100%',  fontFamily: 'Poppins, sans-serif' }}>
                          <Box width='100%' maxHeight={100}>
                            <RequestCard handleDelete = {this.handleDelete} leave_request={this.props.leave_request.data} requestConfigSearch={this.props.requestConfigSearch} id={this.state.id} handleCancel={this.handleCancel} handleApprove={this.handleApprove} handleCorrect={this.handleCorrect} />
                            {
                              this.state.dialogOpen &&
                              <ConflictLeaveDialog 
                              openDialog={this.state.dialogOpen} handleDialogClose={this.handleDialogClose} handleCancel={this.handleCancel} 
                              handleConflictClose={this.handleConflictClose}
                              handleConflictApprove={this.handleConflictApprove} />
                              // <SimpleDialogDemo />
                            }
                          </Box>
                        </Box>
                      </Grid>
                    )) : (
                      this.state.isApiFinished ?

                        <Grid
                          display='flex'
                          alignItems='center'
                          justifyContent='center'
                          sx={{marginTop: '100px'}}
                          size={{
                            lg: 8,
                            md: 8,
                            sm: 7,
                            xs: 12
                          }}>
                          < Typography sx={{
                            fontSize: 13,
                            fontWeight: 400
                          }}>
                            {"No Record Found"}
                          </Typography>
                        </Grid>

                        :
                        ""

                    )}
                  </Grid>
                  </div>
                )}

                {tabIndex === 1 && (
                 <div>
                  <Grid container display='flex' flexDirection='row' spacing={3} p='6px 10px'>
                    <Grid
                      style={{
                        borderRight: '2px #d9dadc solid',
                        marginTop: '5px',
                        // padding: '6px',
                        // height: this.props.searchloandata.data?.data?.length > 6 ? '730px' : '730px' //this.props.searchloandata.data?.data?.length > 0 ? '1px #d9dadc solid' : '',
                      }}
                      size={{
                        lg: 3.5,
                        md: 4,
                        sm: 5,
                        xs: 12
                      }}>
                      <Grid container spacing={3} display='flex' direction={'row'}>
                        {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 10 }} > */}
                          {/* style={{ marginLeft: '10px' }} */}
                          {/* <Button variant="outlined" onClick={this.handleClickOpen}>+ New Request</Button> */}
                          {/* <h4>Loan Request</h4> */}
                        {/* </Grid> */}
                        <Grid
                          size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                          }}>
                          <Tabs
                            value={tabIndex} 
                            onChange={this.handleTabChange}
                            variant="fullWidth" 
                            aria-label="tabs example"
                            sx={{ minWidth: '50px', fontFamily: 'Poppins, sans-serif' }}>
                              <Tab icon={<ExitToAppIcon style={{ color: 'black' }} />} label="Requests" sx={{fontSize: '12px', fontWeight: 600}} />
                              <Tab icon={<CreditScoreIcon style={{ color: 'black' }} />} label="Loans" sx={{fontSize: '12px', fontWeight: 600}} />
                              <Tab icon={<DescriptionIcon style={{ color: 'black' }}  />} label="Others" sx={{fontSize: '12px', fontWeight: 600}} />
                          </Tabs>
                        </Grid>
                        <Grid
                          size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                          }}>
                          {/* style={{ marginLeft: '20px' }} */}
                          <Stack direction='row' justifyContent="space-between" alignItems="center" spacing={1}>
                          {/* <ButtonGroup variant="outlined" aria-label="outlined primary button group">
                              <Button variant={this.state.type === '1' ? "contained" : "outlined"} onClick={() => this.setState({ type: '1' })}>Request</Button>
                              <Button variant={this.state.type === '2' ? "contained" : "outlined"} onClick={() => this.setState({ type: '2', loanButton: true })}>Loan</Button>
                              <Button variant={this.state.type === '5' ? "contained" : "outlined"} onClick={() => this.setState({ type: '5' })}>Claims</Button>
                            </ButtonGroup> */}
                            <Box flexGrow={1} />
                            <CommonToolTip title="Filter">
                              <IconButton onClick={() => this.setState({ isFilterDialogOpen: true })}>
                                <FilterAltIcon style={{ color: 'gray' }} />
                              </IconButton>
                              </CommonToolTip>
                              
                            <stack direction='row' alignItems='center' spacing={0}>
                              <Tooltip title= {this.state.showUnseenLoans ? "View All" : "Unseen Loans"}>
                                {/* <IconButton onClick={this.handleVisibilityLoans}>
                                      {this.state.showUnseenLoans ? (
                                        <VisibilityOffIcon color="action" />
                                      ) : (
                                        <VisibilityIcon color="action" />
                                      )}
                                  {this.props.searchloandata?.unseenLoanCount > 0 && (
                                <Typography variant="body2" style={{ color: 'black', fontWeight: 'bold' }} sx={{ ml: 2 }} >
                                  {this.props.searchloandata.unseenLoanCount}
                                </Typography>
                              )}
                              </IconButton> */}
                              </Tooltip>
                              </stack>
                              
                            <Tooltip title='New Request'>
                              {this.storage.role_name !== "Administrator" && (
                                <IconButton onClick={() => this.handleClickOpen('3')}>
                                  <AddCircleIcon color='primary' />
                                </IconButton>
                              )}
                            </Tooltip>
                          </Stack>

                        
                        </Grid>

                        {/* </TabContext> */}
                        {/* <Grid size={{ lg: 12 }} style={{paddingBottom: '15px'}}><Typography>Completed</Typography></Grid> */}
                        {this.props.searchloandata?.data?.length > 0 ?
                          (
                            <Grid
                              style={{ display: 'flex', width: '100%', minHeight: '100%' }}
                              size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                              }}>
                              {/* flexDirection: 'column', height: '100%',  */}
                              <Box sx={{ height: parseInt(this.state.windowHeight) - (parseInt(this.state.toolbarHeight) + 150), width:'100%' }}>
                                <Grid
                                  style={{ height: '100%', flexGrow: '1', overflow: 'auto' }}
                                  display='flex'
                                  alignItems='flex-start'
                                  justifyContent='flex-start'
                                  sx={{ ...scrollBar }}
                                  size={{
                                    lg: 12,
                                    md: 12,
                                    sm: 12,
                                    xs: 12
                                  }}>
                                  {/* height: 'calc(100vh - 190px)' */}
                                  <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                    {/* maxWidth: 360, */}
                                    <nav aria-label="main mailbox folders">
                                      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                        {/* , maxWidth: 360 */}
                                          {this.props.searchloandata?.data?.length > 0 ? this.props.searchloandata.data ?.filter((f) => !this.state.showUnseenLoans || f.seen === 0)
                                        .map((f, i) => (

                                          <ListItem key={f.id}
                                            // sx={{ pl: '6px' }}
                                            {...(this.props.searchloandata?.data?.length === i + 1 && { ref: this.lastProductElementRef })}
                                            {...(this.props.searchloandata?.data?.length === i + 1 && { 'data-lastitemid': f.id })}
                                          >
                                            <ListItemButton selected={this.state.loanId === f.id} onClick={() => this.handleApproveRequest(f.id, 'loan')}>
                                              <ListItemAvatar>
                                                <Avatar>
                                                  <img src={personIcon} height={60} width={40} />
                                                </Avatar>
                                              </ListItemAvatar>
                                              <ListItemText
                                                disableTypography
                                                primary={
                                                  <Typography
                                                    style={{
                                                      fontSize: '13px',
                                                      fontWeight:
                                                        f.seen === 0 && roleType.includes(this.storage.role_name)
                                                          ? 'bold'
                                                          : 'normal'
                                                    }}
                                                  >
                                                    {this.handleStatusLoan(f.status, f.approvedBy, f.cancelledBy,f)}
                                                  </Typography>
                                                }
                                                secondary={
                                                  <Typography
                                                    style={{
                                                      fontSize: '13px',
                                                      fontWeight:
                                                        f.seen === 0 && roleType.includes(this.storage.role_name)
                                                          ? 'bold'
                                                          : 'normal'
                                                    }}
                                                  >
                                                    {commonDateFormat(f.date)}
                                                    <span style={{ display: "flex", justifyContent: "end" }}>
                                                      {this.statusIconAndColor(f.status)}
                                                    </span>
                                                  </Typography>
                                                }
                                              />
                                            </ListItemButton>
                                          </ListItem>
                                        )) : []}

                                      </List>

                                    </nav>
                                  </Box>
                                </Grid>
                              </Box>
                            </Grid>
                          ) :
                          (<Grid style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                            <Box sx={{height: parseInt(this.state.windowHeight) - (parseInt(this.state.toolbarHeight) + 150)}}>
                            <Grid
                              style={{ height: '100%', flexGrow: '1' }}
                              display='flex'
                              alignItems='center'
                              justifyContent='center'
                              size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                              }}>
                                <Typography sx={{
                                  fontSize: 13,
                                  fontWeight: 400,
                                }}>
                                  {"No Record Found"}
                                </Typography>
                              </Grid>
                            </Box>
                          </Grid>
                          )
                        }
                      </Grid>
                    </Grid>
                    {this.props.searchloandata?.data?.length > 0 ? this.props.searchloandata?.data?.filter((f) => f.id === this.state.loanId).map((f) => (

                      <Grid
                        key={f.id}
                        size={{
                          lg: 8,
                          md: 8,
                          sm: 7,
                          xs: 12
                        }}>
                        <Grid container spacing={3} display='flex' alignItems='center' pt='25px'>
                          <Grid
                            size={{
                              lg: 6,
                              md: 6,
                              sm: 6,
                              xs: 6
                            }}>
                            <Typography variant='h6' align='left' style={{}}>{"Loan Request"}</Typography>
                          </Grid>
                          <Grid
                            display='flex'
                            justifyContent='flex-end'
                            size={{
                              lg: 6,
                              md: 6,
                              sm: 6,
                              xs: 6
                            }}>
                            {f.status === "Approved" ?
                              <Stack direction="row" alignItems="center" gap={1}>
                                <ThumbUpOffAltIcon fontSize='small' style={{ color: 'green' }} />
                                <Typography variant='body2' align='right' > Approved </Typography>
                              </Stack>
                              :
                              f.status === "Cancelled" ?
                                <Stack direction="row" alignItems="center" gap={1}>
                                  <ThumbDownOffAltIcon fontSize='small' style={{ color: 'red' }} />
                                  <Typography variant='body2' align='right' > Cancelled </Typography>
                                </Stack>
                                :
                                f.status === "Rejected" ?
                                  <Stack direction="row" alignItems="center" gap={1}>
                                    <ThumbDownOffAltIcon fontSize='small' style={{ color: 'red' }} />
                                    <Typography variant='body2' align='right' > Rejected </Typography>
                                  </Stack>
                                  :
                                  <Stack direction="row" alignItems="center" gap={1}>
                                    <PendingOutlinedIcon fontSize='small' style={{ color: 'orange' }} />
                                    <Typography variant='body2' align='right' > {"Pending"} </Typography>
                                  </Stack>}
                          </Grid>
                          <Grid
                            size={{
                              lg: 12,
                              md: 12,
                              sm: 12,
                              xs: 12
                            }}>
                            <Divider />
                          </Grid>
                          {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} >
                        <ApprovalRequest leave_request={this.props.leave_request} id={this.state.id} handleCancel={this.handleCancel} handleApprove={this.handleApprove} />
                      </Grid> */}

                        </Grid>
                        <Box sx={{ padding: '20px', paddingLeft: '20px', display: 'flex', justifyContent: 'center', maxWidth: '100%', minWidth: '100%' }}>
                          <Box width='100%' maxHeight={100}>
                            <LoanCard handleLoanDelete = {this.handleLoanDelete} searchloandata={this.props.searchloandata.data} requestConfigSearch={this.props.requestConfigSearch} id={this.state.loanId} handleCancel={this.handleRejectLoan} handleApprove={this.handleApprovalLoan} />
                          </Box>
                        </Box>
                      </Grid>
                    )) : (
                      <Grid
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                        sx={{marginTop: '100px'}}
                        size={{
                          lg: 8,
                          md: 8,
                          sm: 7,
                          xs: 12
                        }}>
                        <Typography sx={{
                          fontSize: 13,
                          fontWeight: 400
                        }}>
                          {"No Record Found"}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                  </div>
                )}

                {tabIndex === 2 && (
                 <div>
                  <Grid container display='flex' flexDirection='row' spacing={3} p='6px 10px'>
                    <Grid
                      style={{
                       borderRight: '2px #d9dadc solid',
                       marginTop: '5px',
                        // padding: '6px',
                        // height: this.props.searchloandata.data?.data?.length > 6 ? '730px' : '730px' //this.props.searchloandata.data?.data?.length > 0 ? '1px #d9dadc solid' : '',
                      }}
                      size={{
                        lg: 3.5,
                        md: 4,
                        sm: 5,
                        xs: 12
                      }}>
                      <Grid container spacing={3} display='flex' direction={'row'}>
                        {/* <Grid size={{ xs: 12, sm: 12, md: 10 }} > */}
                          {/* style={{ marginLeft: '10px' }} */}
                          {/* <Button variant="outlined" onClick={this.handleClickOpen}>+ New Request</Button> */}
                          {/* <h4>Claim Request</h4> */}
                        {/* </Grid> */}
                        <Grid
                          size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                          }}>
                          <Tabs
                            value={tabIndex} 
                            onChange={this.handleTabChange}
                            variant="fullWidth" 
                            aria-label="tabs example"
                            sx={{ minWidth: '50px', fontFamily: 'Poppins, sans-serif' }}>
                              <Tab icon={<ExitToAppIcon style={{ color: 'black' }} />} label="Requests" sx={{fontSize: '12px', fontWeight: 600}} />
                              <Tab icon={<CreditScoreIcon style={{ color: 'black' }} />} label="Loans" sx={{fontSize: '12px', fontWeight: 600}} />
                              <Tab icon={<DescriptionIcon style={{ color: 'black' }}  />} label="Others" sx={{fontSize: '12px', fontWeight: 600}} />
                          </Tabs>
                      </Grid> 
                        <Grid
                          size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                          }}>
                          {/* style={{ marginLeft: '20px' }} */}
                          <Stack direction='row' justifyContent="space-between" alignItems="center" spacing={1}>
                          {/* <ButtonGroup variant="outlined" aria-label="outlined primary button group">
                              <Button variant={this.state.type === '1' ? "contained" : "outlined"} onClick={() => this.setState({ type: '1' })}>Request</Button>
                              <Button variant={this.state.type === '2' ? "contained" : "outlined"} onClick={() => this.setState({ type: '2', loanButton: true })}>Loan</Button>
                              <Button variant={this.state.type === '5' ? "contained" : "outlined"} onClick={() => this.setState({ type: '5' })}>Claims</Button>
                            </ButtonGroup> */}
                            <Box flexGrow={1} />
                            <CommonToolTip title="Filter">
                              <IconButton onClick={() => this.setState({ isFilterDialogOpen: true })}>
                                <FilterAltIcon style={{ color: 'gray' }} />
                              </IconButton>
                            </CommonToolTip>
                            
                              
                            <stack direction='row' alignItems='center' spacing={0}>
                              {/* <Tooltip title= {this.state.showUnseenClaims ? "View All" : "Unseen Claims"}>
                              <IconButton onClick={this.handleVisibilityClaims}>
                                      {this.state.showUnseenClaims ? (
                                        <VisibilityOffIcon color="action" />
                                      ) : (
                                        <VisibilityIcon color="action" />
                                      )}
                                  {this.props.searchClaim?.unseenClaimsCount?.[0]?.unseenClaimsCount > 0 && (
                                <Typography variant="body2" style={{ color: 'black', fontWeight: 'bold' }} sx={{ ml: 2 }} >
                                  {this.props.searchClaim.unseenClaimsCount[0].unseenClaimsCount}
                                </Typography>
                              )}
                              </IconButton>
                              </Tooltip> */}
                              </stack>

                            <Tooltip title='New Request'>
                              {this.storage.role_name !== "Administrator" && (
                                <IconButton onClick={() => this.handleClickOpen('4')}>
                                  <AddCircleIcon color='primary' />
                                </IconButton>
                              )}
                            </Tooltip>
                          </Stack>
                        </Grid>

                        {/* </TabContext> */}
                        {/* <Grid size={{ lg: 12 }} style={{paddingBottom: '15px'}}><Typography>Completed</Typography></Grid> */}
                        {this.props.searchClaim?.data?.length > 0 ?
                          (
                            <Grid
                              style={{ display: 'flex', width: '100%', minHeight: '100%' }}
                              size={{
                                md: 12,
                                xs: 12
                              }}>
                              <Box sx={{ height: parseInt(this.state.windowHeight) - (parseInt(this.state.toolbarHeight) + 150),width : '100%' }}>
                                <Grid
                                  style={{ height: '100%', flexGrow: '1', overflow: 'auto' }}
                                  display='flex'
                                  alignItems='flex-start'
                                  justifyContent='flex-start'
                                  sx={{ ...scrollBar }}
                                  size={{
                                    lg: 12,
                                    md: 12,
                                    sm: 12,
                                    xs: 12
                                  }}>
                                  <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                    <nav aria-label="main mailbox folders">
                                      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                          {this.props.searchClaim?.data?.length > 0 ? this.props.searchClaim?.data?.filter((f) => !this.state.showUnseenClaims || f.seen === 0)
                                          .map((f, i) => {
                                           return (
                                          <ListItem key={f.unique_key}
                                            // sx={{ pl: '6px' }}
                                            {...(this.props.searchClaim?.length === i + 1 && { ref: this.lastProductElementRef })}
                                            {...(this.props.searchClaim?.length === i + 1 && { 'data-lastitemid': f.unique_key})}
                                          >
                                            <ListItemButton selected={this.state.claimAndOtherId === f.unique_key } onClick={() => this.handleApproveRequest(f.unique_key, 'claim',f)}>
                                              <ListItemAvatar>
                                                <Avatar>
                                                  <img src={personIcon} height={60} width={40} />
                                                </Avatar>
                                              </ListItemAvatar>
                                              <ListItemText
                                                disableTypography
                                                primary={
                                                  <Typography
                                                    style={{
                                                      fontSize: '13px',
                                                      fontWeight:
                                                        f.seen === 0 && roleType.includes(this.storage.role_name)
                                                          ? 'bold'
                                                          : 'normal',
                                                          textTransform: 'capitalize'
                                                    }}
                                                  >
                                                    {this.handleStatusClaim(f.status, f.approvedBy, f.cancelledBy,f)}
                                                  </Typography>
                                                }
                                                secondary={
                                                  <Typography
                                                    style={{
                                                      fontSize: '13px',
                                                      fontWeight:
                                                        f.seen === 0 && roleType.includes(this.storage.role_name)
                                                          ? 'bold'
                                                          : 'normal'
                                                    }}
                                                  >
                                                     {f?.remarks ? this.DateWithDayMonthFormat(f.createdAt.split(' ')[0]) : ''}
                                                    {/* {commonDateFormat(f.date)} */}
                                                    <span style={{ display: "flex", justifyContent: "end" }}>
                                                      {this.statusIconAndColor(f.status)}
                                                    </span>
                                                  </Typography>
                                                }
                                                />
                                              </ListItemButton>
                                            </ListItem>
                                          )
                                        }) : []}

                                      </List>

                                    </nav>
                                  </Box>
                                </Grid>
                              </Box>
                            </Grid>
                          ) :
                          (<Grid style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                            <Box sx={{height: parseInt(this.state.windowHeight) - (parseInt(this.state.toolbarHeight) + 150)}}>
                            <Grid
                              style={{ height: '100%' }}
                              display='flex'
                              alignItems='center'
                              justifyContent='center'
                              size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                              }}>
                                <Typography sx={{
                                  fontSize: 13,
                                  fontWeight: 400,
                                }}>
                                  {"No Record Found"}
                                </Typography>
                              </Grid>
                            </Box>
                          </Grid>
                          )
                        }
                      </Grid>
                    </Grid>
                    {searchClaim?.data?.length > 0 ? this.props.searchClaim?.data?.filter((f) => (f.unique_key) === this.state.claimAndOtherId).map((f) => (

                      <Grid
                        key={f.unique_key}
                        size={{
                          lg: 8,
                          md: 8,
                          sm: 7,
                          xs: 12
                        }}>
                        <Grid container spacing={3} display='flex' alignItems='center' pt='25px'>
                          <Grid
                            size={{
                              lg: 6,
                              md: 6,
                              sm: 6,
                              xs: 6
                            }}>
                            <Typography variant='h6' align='left' style={{fontFamily: 'Poppins, sans-serif'}}>{"Other Requests"}</Typography>
                          </Grid>
                          <Grid
                            display='flex'
                            justifyContent='flex-end'
                            size={{
                              lg: 6,
                              md: 6,
                              sm: 6,
                              xs: 6
                            }}>
                            {f.status === "Approved" ?
                              <Stack direction="row" alignItems="center" gap={1}>
                                <ThumbUpOffAltIcon fontSize='small' style={{ color: 'green' }} />
                                <Typography variant='body2' align='right' > Approved </Typography>
                              </Stack>
                              :
                              f.status === "Cancelled" ?
                                <Stack direction="row" alignItems="center" gap={1}>
                                  <ThumbDownOffAltIcon fontSize='small' style={{ color: 'red' }} />
                                  <Typography variant='body2' align='right' > Cancelled </Typography>
                                </Stack>
                                :
                                f.status === "Rejected" ?
                                  <Stack direction="row" alignItems="center" gap={1}>
                                    <ThumbDownOffAltIcon fontSize='small' style={{ color: 'red' }} />
                                    <Typography variant='body2' align='right' > Rejected </Typography>
                                  </Stack>
                                  :
                                  <Stack direction="row" alignItems="center" gap={1}>
                                    <PendingOutlinedIcon fontSize='small' style={{ color: 'orange' }} />
                                    <Typography variant='body2' align='right' > {"Pending"} </Typography>
                                  </Stack>}
                          </Grid>
                          <Grid
                            size={{
                              lg: 12,
                              md: 12,
                              sm: 12,
                              xs: 12
                            }}>
                            <Divider />
                          </Grid>
                          {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} >
      <ApprovalRequest leave_request={this.props.leave_request} id={this.state.id} handleCancel={this.handleCancel} handleApprove={this.handleApprove} />
    </Grid> */}

                        </Grid>
                        <Box sx={{ padding: '20px', paddingLeft: '20px', display: 'flex', justifyContent: 'center', maxWidth: '100%', minWidth: '100%' }}>
                          <Box width='100%' maxHeight={100}>
                            <ClaimCard handleClaimDelete ={this.handleClaimDelete} searchClaim={this.props.searchClaim}   
                            id={this.state.claimAndOtherId}
                            requestConfigSearch={this.props.requestConfigSearch} 
                            //  handleCancel={this.handleCancelClaim}
                            //   handleApprove={this.handleApprovalLoan}
                               />
                          </Box>
                        </Box>
                      </Grid>
                    )) : (
                      <Grid
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                        sx={{marginTop: '100px'}}
                        size={{
                          lg: 8,
                          md: 8,
                          sm: 7,
                          xs: 12
                        }}>
                        <Typography sx={{
                          fontSize: 13,
                          fontWeight: 500
                        }}>
                          {"No Record Found"}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                  </div>
                )}
              </Box>
            </React.Fragment>
          )}
        </CreateNewButtonContext.Consumer>
      </>
    );
  }
}


const mapStateToProps = (state) => {
  return {

    leave_request: state.leaveRequestReducer.leave_request || [],
    searchloandata: state.LoanReducer.searchloandata || [],
    conflictLeaveRequest: state.leaveRequestReducer.conflictLeaveRequest || [],
    loansdetail: state.LoanReducer.loansdetail || [],
    create_data: state.leaveRequestReducer.create_data || [],
    pre_data: state.leaveRequestReducer.pre_data || [],
    leaveType: state.leaveRequestReducer.leaveType || [],
    get_empbasecompany: state.attendanceReducer.get_empbasecompany || [],
    getCompanyBasedEmployeeFilter: state.attendanceReducer.getCompanyBasedEmployeeFilter || [],
    searchCompanyBasedEmployeeFilter :state.attendanceReducer.searchCompanyBasedEmployeeFilter || [],
    tenureMonths: state.LoanReducer.tenureMonths || [],
    paidleavecount :  state.leaveRequestReducer.paidleavecount || [],
    searchClaim :  state.LoanReducer.searchClaim || [],
    requestConfigSearch : state.RequestConfigReducer.requestConfigSearch,
    permissionData : state.leaveRequestReducer.permissiondata || []
  };
};
const mapDispatchToProps = (dispatch) => {
  return {

    listAllLeaveRequestAction: (leaveData, employee_id, setModalTypeHandler, setLoaderStatusHandler, response) => {
      return dispatch(listAllLeaveRequestAction(leaveData, employee_id, setModalTypeHandler, setLoaderStatusHandler, response));
    },

    createLeaveRequestAction: (data, setModalTypeHandler, setLoaderStatusHandler, response) => {
      return dispatch(createLeaveRequestAction(data, setModalTypeHandler, setLoaderStatusHandler, response));
    },

    updateSeenAction: (leaveId, response) => {
      return dispatch(updateSeenAction(leaveId, response));
    },

    updateSeenLoanAction: (id, response) => {
      return dispatch(updateSeenLoanAction(id, response));
    },
    getRequestConfig: (setModalTypeHandler, setLoaderStatusHandler,data2) => {
      return dispatch(getRequestConfig(setModalTypeHandler, setLoaderStatusHandler,data2));
    },
    updateSeenClaimAndOthersAction: (id,type, response) => {
      return dispatch(updateSeenClaimAndOthersAction(id,type, response));
  },

    cancelLeaveRequestAction: (employee_id, leaveId, cancelledBy, response) => {
      return dispatch(cancelLeaveRequestAction(employee_id, leaveId, cancelledBy, response));
    },

    ApproveLeaveRequestAction: (employee_id, leaveId, approvedBy, setModalTypeHandler, setLoaderStatusHandler, resData) => {
      dispatch(ApproveLeaveRequestAction(employee_id, leaveId, approvedBy, setModalTypeHandler, setLoaderStatusHandler, resData));
    },

    getConflictLeaveRequestAction: (employee_id, data, setModalTypeHandler, setLoaderStatusHandler, response) => {
      dispatch(getConflictLeaveRequestAction(employee_id, data, setModalTypeHandler, setLoaderStatusHandler, response));
    },

    updateConflictLeaveRequestAction: (employee_id, leaveId, data, setModalTypeHandler, setLoaderStatusHandler, response) => {
      dispatch(updateConflictLeaveRequestAction(employee_id, leaveId, data, setModalTypeHandler, setLoaderStatusHandler, response));
    },

    CreateNotificationAction: (data) => {
      dispatch(CreateNotificationAction(data))
    },
    getNotificationTokenAction: (data,cb) => {
      dispatch(getNotificationTokenAction(data,cb))
    },
    getTokenByEmpId: (data, result) => {
      dispatch(getTokenByEmpId(data, result))
    },
    getAdminTokenByCompany: (resDataRequest) => {
      dispatch(getAdminTokenByCompany(resDataRequest))
    },

    getLoginRoleAction: (id, value) => {
      dispatch(getLoginRoleAction(id, value));
    },

    getLoanListAction: (data, response) => {
      dispatch(getLoanListAction(data, response));
    },

    searchClaimAndOthersAction: (claimdata, responseCallback) => {
      dispatch(searchClaimAndOthersAction(claimdata, responseCallback));
    },

    loanDetailsAction: (employee_id, data, response) => {
      dispatch(loanDetailsAction(employee_id, data, response))
    },

    loanSequenceAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      dispatch(loanSequenceAction(setModalTypeHandler, setLoaderStatusHandler))
    },
    getLeaveTypeAction: () => {
      dispatch(getLeaveTypeAction())
    },
    updateLoanStatusAction: (id, approvedBy, setModalTypeHandler, setLoaderStatusHandler, resDataLoan, response) => {
      dispatch(updateLoanStatusAction(id, approvedBy, setModalTypeHandler, setLoaderStatusHandler, resDataLoan, response))
    },
    listpreLeaveRequestAction: (employee_id, data, setModalTypeHandler, setLoaderStatusHandler, response) => {
      dispatch(listpreLeaveRequestAction(employee_id, data, setModalTypeHandler, setLoaderStatusHandler, response))
    },
    listprePermissionRequestAction: (employee_id, data, setModalTypeHandler, setLoaderStatusHandler, response) => {
      dispatch(listprePermissionRequestAction(employee_id, data, setModalTypeHandler, setLoaderStatusHandler, response))
    },
    getEmpbasecompanyAction: () => {
      dispatch(getEmpbasecompanyAction())
    },
    getEmpbasecompanyFilterAction: (data,response) => {
      dispatch(getEmpbasecompanyFilterAction(data,response))
    },
    checkStatusAction: (data, response) => {
      dispatch(checkStatusAction(data, response))
    },
    getTenureTypeAction: () => {
      dispatch(getTenureTypeAction())
    },
    getClaimsCategoryAction: () => {
      dispatch(getClaimsCategoryAction())
    },
    checkExistLogDetail: (data, response) => {
      dispatch(checkExistLogDetail(data, response))
    },
    // getPaidLeavecount : () => {
    //   dispatch(getPaidLeavecount())
    // },
    clearState : () => {
      dispatch({ type: 'LOAN_CLEAR_STATE' }); 
    },
    set_search_company_based_employee: (val ) => { 
      return dispatch(set_search_company_based_employee(val));
    },
    get_search_company_based_employee: (val,setModalTypeHandler,setLoaderStatusHandler) => { 
      return dispatch(get_search_company_based_employee(val, setModalTypeHandler,setLoaderStatusHandler));
    },
    getpermissiondataAction: (data) => {
      dispatch(getpermissiondataAction(data))
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LeaveRequest);

