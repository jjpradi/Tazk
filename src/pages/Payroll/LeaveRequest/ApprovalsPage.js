import React, { Component } from 'react';
import { connect } from 'react-redux';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import RequestApprovalCard from './RequestApprovalCard';
import Cookies from 'universal-cookie';
import { Typography, Grid, Box, Stack, IconButton, Tab, Tabs, Card, TextField, Alert, Tooltip, Chip, Badge, Avatar, List, ListItem, ListItemButton, ListItemAvatar, ListItemText } from '@mui/material';
import Divider from '@mui/material/Divider';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { getQuotationApprovalsAction } from 'redux/actions/quotation_actions';

import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';

import Button from '@mui/material/Button';

import { listAllLeaveRequestAction, ApproveLeaveRequestAction, updateConflictLeaveRequestAction, updateSeenAction, checkExistLogDetail, getLeaveTypeAction, checkStatusAction, getConflictLeaveRequestAction, cancelLeaveRequestAction, posRequestdata, PosrequpdateSeenAction, ApprovePosRequestAction, getEmployeeShiftDetailsAction, getUnseenCountAction } from '../../../redux/actions/leaveRequest_actions';
import moment from 'moment';

import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import dayjs from 'dayjs';
import personIcon from '../../../assets/dashboardIcons/total-clients.svg';
import apiCalls from 'utils/apiCalls';
import { Helmet } from "react-helmet-async";
import { CreateNotificationAction, getNotificationTokenAction } from 'redux/actions/notification_actions';
import { getLoginRoleAction, getTokenByEmpId, getAdminTokenByCompany } from 'redux/actions/userRole_actions';
import { sendNtfy } from 'firebase/firebase.service';
import { commonDateFormat, getDateTimeFormat } from 'utils/getTimeFormat';
import notificationType from '../../../firebase/notify_type'
import { getsessionStorage } from 'pages/common/login/cookies';

import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';

import { loanDetailsAction, loanSequenceAction, getLoanListAction, updateLoanStatusAction, updateSeenLoanAction, getTenureTypeAction, updateSeenClaimAndOthersAction, searchClaimAndOthersAction, getClaimsCategoryAction } from 'redux/actions/loan_actions';
import LoanApprovalCard from './LoanApprovalcard';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import ConflictLeaveDialog from './ConflictLeaveDialog';

import { clientwebsocket, titleURL } from 'http-common';
import CommonToolTip from 'components/ToolTip';
import { getEmpbasecompanyAction, getEmpbasecompanyFilterAction, get_search_company_based_employee, set_search_company_based_employee } from 'redux/actions/attendance_actions';
import FilterDialog from 'components/leaveRequest/filter';
import { roleType } from 'utils/roleType';
import ClaimApprovalCard from './ClaimApprovalcard';
import { getRequestConfig } from 'redux/actions/requestConfig';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DescriptionIcon from '@mui/icons-material/Description';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowLeftRoundedIcon from '@mui/icons-material/ArrowLeftRounded';
import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import QuotationApprovals from 'pages/crm/Quotation/oldQuotation/QuotationApprovals';
import AssetsApprovals from 'components/assetManagement/AssetsApprovals';
import { getScrapAssetApprovalsAction } from 'redux/actions/asset_actions';
import { maxBodyHeight, maxHeight } from 'utils/pageSize';
import SalesApprovals from 'pages/sales/salesApprovals/SalesApprovals';

const scrollBar = {
    '&::-webkit-scrollbar': {
        width: 5,
    },
    '&::-webkit-scrollbar-track': {
        backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#C4C4C4',
        borderRadius: 3,
    },
}

const avatarColors = [
    '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', '#f57c00',
    '#0097a7', '#5d4037', '#455a64', '#c2185b', '#00796b'
];

const getAvatarColor = (name) => {
    if (!name) return avatarColors[0];
    const charCode = name.charAt(0).toUpperCase().charCodeAt(0);
    return avatarColors[charCode % avatarColors.length];
};

const getInitials = (firstName, lastName) => {
    const f = firstName ? firstName.charAt(0).toUpperCase() : '';
    const l = lastName ? lastName.charAt(0).toUpperCase() : '';
    return f + l || '?';
};

const getStatusColor = (status) => {
    if (!status) return '#f57c00';
    const s = status.toLowerCase();
    if (s === 'approved') return '#2e7d32';
    if (s === 'rejected' || s === 'cancelled') return '#d32f2f';
    return '#f57c00'; // Pending / Waiting
};

const getStatusLabel = (status) => {
    if (!status) return 'Pending';
    const s = status.toLowerCase();
    if (s === 'approved') return 'Approved';
    if (s === 'rejected') return 'Rejected';
    if (s === 'cancelled') return 'Cancelled';
    if (s === 'waiting for approval') return 'Pending';
    if (s === 'pending') return 'Pending';
    return status;
};

const StatusChip = ({ status }) => {
    const color = getStatusColor(status);
    return (
        <Chip
            label={getStatusLabel(status)}
            size="small"
            sx={{
                bgcolor: `${color}14`,
                color: color,
                fontWeight: 600,
                fontSize: '11px',
                height: 22,
                borderRadius: '6px',
            }}
        />
    );
};
class ApprovalsPage extends Component {
    static contextType = CreateNewButtonContext;
    constructor(props) {
        super(props);
        let date = new Date();
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
            approvedBy: { approvedBy: this.storage?.first_name + (this.storage?.last_name ? this.storage.last_name !== null ? ' ' + this.storage.last_name : '' : '') },
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
            fromdate: "",
            todate: "",
            loading: true,
            statusCheck: false,
            statusLog: false,
            hasMore: true,
            request_type: null,
            leave_type: null,
            loanPage: 200,
            showUnseenRequests: false,
            showUnseenLoans: false,
            showUnseenClaims: false,
            query: {
                pageCount: 0,
                numPerPage: 20,
                lastId: 'MAX_NUMBER'
            },
            valueforEmployee: [],
            searchValEmployeeFilter: '',
            filteropen: false,
            claimAndOtherId: '',
            unseenCount: 0,
            tabIndex: 0,
            toolbarHeight: document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70,
            windowHeight: window.innerHeight,
            show: "viewAll",
            seenType:'leave'

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

    handleChangeEmployeeName = (val) => {
        // console.log("val",val.length)
        this.setState({ valueforEmployee: val })


    }

    setSearchValEmployeeFilter = (val) => {
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
        if (this.storage.role_name === 'Employee') {
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



    handleVisibilityRequest = () => {
        const context = this.context;
    if(this.storage.company_type == 5){
        let leaveData = {
            fromdate: null,
            todate: null,
            type: this.state.filterLeaveType,
            employee_id: this.storage.role_name === 'Employee' ? this.storage.employee_id : null,
            pageCount: 0,
            numPerPage: this.state.pageSize,
            key: 'ApprovalPage',
            unseen: this.state.show === "viewAll" ? 1 : 0
        }
 
        let data1 = {
            searchString: ""
        }

        let data2 = {

            pageCount: 0,
            numPerPage: 60,
            searchString: ""

        }

        let data = {
            type:'leave',
            fromdate: this.state.fromdate,
            todate: this.state.todate,
            seen:this.state.show === "viewAll" ? 0 : 0,
            typeOfLeave: this.state.filterLeaveType,
        }

        apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.listAllLeaveRequestAction(leaveData, context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler,
                (response) => {

                    if (response?.seen === 0) {
                        this.setState({ id: this.props.leave_request?.data?.length ? this.props.leave_request.data[0]?.leaveId : response?.data?.data[0]?.leaveId })
                    }
                    else {
                        this.setState({ id: this.props.leave_request?.data?.length ? this.props.leave_request.data[0]?.leaveId : response?.data?.data[0]?.leaveId })
                    }
                }),
                this.props.getUnseenCountAction( data),
                this.setState({seenType:'leave' }),
            this.props.getRequestConfig(context.setModalTypeHandler, context.setLoaderStatusHandler, data2),
        ).finally(() => this.setState({ isApiFinished: true }),
            this.props.getEmpbasecompanyFilterAction(data1, (res) => {
            }),
        );
    }
    if(this.storage.company_type == 2){
        let leaveData = {
            fromdate: null,
            todate: null,
            type: null,
            employee_id: this.storage.role_name === 'Employee' ? this.storage.employee_id : null,
            pageCount: 0,
            numPerPage: this.state.pageSize,
            key: 'ApprovalPage',
            unseen: this.state.show === "viewAll" ? 1 : 0
        }

        let data1 = {
            searchString: ""
        }

        let data2 = {

            pageCount: 0,
            numPerPage: 60,
            searchString: ""

        }

        apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.posRequestdata(leaveData, context.setModalTypeHandler, context.setLoaderStatusHandler,
                (response) => {

                    if (response?.seen === 0) {
                        this.setState({ id: this.props.pos_request?.data?.length ? this.props.pos_request.data[0]?.id : '' })
                    }
                    else {
                        this.setState({ id: this.props.pos_request?.data?.length ? this.props.pos_request.data[0]?.id : '' })
                    }
                }),
            this.props.getRequestConfig(context.setModalTypeHandler, context.setLoaderStatusHandler, data2),
        )
    }
       
    };

    handleUnseenViewAllState = () => {
    if(this.storage.company_type == 5){
        if(this.state.type === '1'){
        this.setState(
            (prevState) => ({
                showUnseenRequests: !prevState.showUnseenRequests,
                show: prevState.showUnseenRequests ? "viewAll" : "unSeen"
            }),
            () => {
                this.handleVisibilityRequest();  
            }
        );
    }else if(this.state.type === '2'){
        this.setState(
            (prevState) => ({
                showUnseenLoans: !prevState.showUnseenLoans,
                show: prevState.showUnseenLoans ? "viewAll" : "unSeen"
            }),
            () => {
                this.handleVisibilityLoans();  
            }
        );
    }else if(this.state.type === '5'){
        this.setState(
            (prevState) => ({
                showUnseenClaims: !prevState.showUnseenClaims,
                show: prevState.showUnseenClaims ? "viewAll" : "unSeen"
            }),
            () => {
                this.handleVisibilityClaims();  
            }
        );
    }
    }
    if(this.storage.company_type == 2){
        this.setState(
            (prevState) => ({
                showUnseenRequests: !prevState.showUnseenRequests,
                show: prevState.showUnseenRequests ? "viewAll" : "unSeen"
            }),
            () => {
                this.handleVisibilityRequest();  
            }
        );
    }
    };

    handleVisibilityLoans = () => {
        const context = this.context;

        const data = {
            tenure: "", frmdate: '', todate: '', emp_name: "", status: "",
            searchString: '',
            date: null,
            employeeId: null,
            pageCount: 0,
            numPerPage: this.state.pageSize,
            key: 'ApprovalPage',
            unseen: this.state.show === "viewAll" ? 1 : 0
        }
        let data1 = {
            type:'loans',
            fromdate: this.state.fromdate,
            todate: this.state.todate,
            seen:this.state.show === "viewAll" ? 0 : 0
        }
        this.setState({ ...this.state, createdAt: null, employee: null })
        apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.getLoanListAction(data,
                (response) => {
                    if (response.status === 200) {
                        this.props.getUnseenCountAction( data1),
                        this.setState({seenType:'loans' })
                        this.setState({ loanId: response.data?.data[0]?.id })
                    }
                }
            )
        )
    };

    handleVisibilityClaims = () => {
        const context = this.context;

        const claimdata = {
            searchString: '',
            fromdate: '',
            todate: '',
            employeeId: null,
            pageCount: this.state.page,
            numPerPage: this.state.pageSize,
            key: 'ApprovalPage',
            unseen: this.state.show === "viewAll" ? 1 : 0,
            type:this.state.filterType,
        }

        let data1 = {
            type:'claimsAndOthers',
            filter:this.state.filterType,
            fromdate: this.state.fromdate,
            todate: this.state.todate,
            seen:this.state.show === "viewAll" ? 0 : 0,
       
        }
        this.setState({ createdAt: null, employee: null });

        apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.searchClaimAndOthersAction(claimdata, (responseCallback) => {

                if (responseCallback.status === 200) {
                    this.props.getUnseenCountAction( data1),
                    this.setState({seenType:'claims' })
                    this.setState({ claimAndOtherId: responseCallback.data?.data?.length ? 
                        responseCallback.data.data[0]?.unique_key : '' });
                }
            })
        );
    };

    resizeWindow = () => {
        const dynamicToolbarHeight_val = document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70
        this.setState({ toolbarHeight: dynamicToolbarHeight_val, windowHeight: window.innerHeight })
    }

    storage = getsessionStorage()

    async componentDidMount() {
        const context = this.context;

        let leaveData = {
            fromdate: null,
            todate: null,
            type: null,
            employee_id: this.storage.role_name === 'Employee' ? this.storage.employee_id : null,
            pageCount: this.state.page,
            numPerPage: this.state.pageSize,
            key: 'ApprovalPage'
        }


        let data1 = {
            searchString: ""
        }

        let data2 = {

            pageCount: 0,
            numPerPage: 60,
            searchString: ""

        }
        let data = {
            type:'leave',
            fromdate: null,
            todate: null,
            seen:0,
            typeOfLeave: this.state.filterLeaveType,
        }
        let payload = {
            fromDate: this.state.fromdate,
            toDate: this.state.todate,
            searchVal: '',
            selectedEmployee: this.state.employee === null ? [] : this.state.employee,
            pageCount: this.state.page,
            numPerPage: this.state.pageSize
        }

        let scrapAssetPayload = {
            fromDate: this.state.fromdate,
            toDate: this.state.todate,
            searchVal: '',
            selectedEmployee: this.state.employee === null ? [] : this.state.employee,
            pageCount: this.state.page,
            numPerPage: this.state.pageSize
        }

        {this.storage.company_type === 5 &&
        apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.listAllLeaveRequestAction(leaveData, context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler,
                (response) => {
                    // console.log("response",response,)
                    // console.log("this.props.leave_request?.data",this.props.leave_request,this.props.leave_request?.data?.length)

                    if (response?.seen === 0) {
                        this.setState({ id: this.props.leave_request?.data?.length ? this.props.leave_request.data[0]?.leaveId : response?.data?.data[0]?.leaveId })
                    }
                    else {
                        this.setState({ id: this.props.leave_request?.data?.length ? this.props.leave_request.data[0]?.leaveId : response?.data?.data[0]?.leaveId })
                    }
                }),
            this.props.getRequestConfig(context.setModalTypeHandler, context.setLoaderStatusHandler, data2),
            this.props.getUnseenCountAction( data),
        ).finally(() => this.setState({ isApiFinished: true }),
            this.props.getEmpbasecompanyFilterAction(data1, (res) => {
            }),
        );
    }
        { this.storage.company_type === 2 && 
        apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.posRequestdata(leaveData,  context.setModalTypeHandler, context.setLoaderStatusHandler,
                (response) => {

                    if (response?.seen === 0) {
                        this.setState({ id: this.props.pos_request?.data?.length ? this.props.pos_request.data[0]?.id : '' })
                    }
                    else {
                        this.setState({ id: this.props.pos_request?.data?.length ? this.props.pos_request.data[0]?.id : '' })
                    }
                }
            ),
            this.props.getRequestConfig(context.setModalTypeHandler, context.setLoaderStatusHandler, data2),
            this.props.getEmpbasecompanyFilterAction(data1, (res) => {})
        ).finally(() => this.setState({ isApiFinished: true }))
       } 
       { this.storage.company_type === 10 && 
       
        apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.getQuotationApprovalsAction(payload)
        ).finally(() => this.setState({ isApiFinished: true }))
       } 
       {
            this.storage.company_type === 9 &&
            apiCalls(
                context.setModalStatusHandler,
                context.setLoaderStatusHandler,
                this.props.getScrapAssetApprovalsAction(scrapAssetPayload)
            ).finally(() => this.setState({ isApiFinished : true }))
       }

        this.resizeWindow();
        window.addEventListener("resize", this.resizeWindow);
        return () => window.removeEventListener("resize", this.resizeWindow)

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
        });
    };
    componentDidUpdate(prevProps, prevState) {
        // console.log("componentDidUpdate")

        const context = this.context;
        // clientwebsocket.socket.onmessage = async (message) => {
        //     let { event } = JSON.parse(message.data);
        //     // console.log("Request_status:",event === 'Request_status');
        //     if(this.storage.company_type == 5){
        //     if (event === 'Request_status') {
        //         // console.log("hh")
        //         const data = {
        //             tenure: "", frmdate: '', todate: '', emp_name: "", status: "", numPerPage: null,
        //             pageCount: '',
        //             searchString: '',

        //             employeeId: null,
        //             key: 'ApprovalPage'
        //         }
        //         const leaveData = {
        //             fromdate: this.state.fromdate,
        //             todate: this.state.todate,
        //             type: this.state.filterLeaveType,
        //             employee_id: this.state.employee,
        //             pageCount: this.state.page,
        //             numPerPage: this.state.pageSize,
        //             key: 'ApprovalPage'
        //         }
        //         const claimdata = {
        //             searchString: '',
        //             fromdate: '',
        //             todate: '',
        //             employeeId: null,
        //             pageCount: this.state.page,
        //             numPerPage: this.state.pageSize,
        //             key: 'ApprovalPage',
        //             type:this.state.filterType
                    
        //         }

                

        //         apiCalls(
        //             context.setModalTypeHandler,
        //             context.setLoaderStatusHandler,
        //             this.props.listAllLeaveRequestAction(leaveData, context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler,
        //                 (response) => {
        //                     let data = {
        //                         type:'leave',
        //                         fromdate: this.state.fromdate,
        //                         todate: this.state.todate,
        //                         seen:0,
        //                         typeOfLeave: this.state.filterLeaveType,
        //                     }
                          
        //                     if (response.status === 200) {
        //                     this.props.getUnseenCountAction( data),
        //                       this.setState({seenType:'leave' })
        //                     }

        //                 }),

        //             this.props.getLoanListAction(data,
        //                 (response) => {
        //                     let data = {
        //                         type:'loan',
        //                         fromdate: this.state.fromdate,
        //                         todate: this.state.todate,
        //                         seen:0
        //                     }
                          
        //                     if (response.status === 200) {
        //                     this.props.getUnseenCountAction( data),
        //                       this.setState({seenType:'loan' })
        //                     }
        //                 }),
        //             this.props.searchClaimAndOthersAction(claimdata,
        //                 (responseCallback) => {
        //                     let data = {
        //                         type:'claimsAndOthers',
        //                         filter:this.state.filterType,
        //                         fromdate: this.state.fromdate,
        //                         todate: this.state.todate,
        //                         seen:0
        //                     }
                          
        //                     if (responseCallback.status === 200) {
        //                     this.props.getUnseenCountAction( data),
        //                       this.setState({seenType:'claims' })
        //                     }
        //                 }),

        //         ).finally(() => this.setState({ isApiFinished: true }));

        //     }
        //     }
        //     if(this.storage.company_type == 2){
        //     if (event == 'ApprovalDiscount' || event == 'Request_status' || event == 'CancelDiscount'){
        //         const leaveData = {
        //             fromdate: this.state.fromdate,
        //             todate: this.state.todate,
        //             type: this.state.filterLeaveType,
        //             employee_id: this.state.employee,
        //             pageCount: this.state.page,
        //             numPerPage: this.state.pageSize,
        //             key: 'ApprovalPage'
        //         }
        //         apiCalls(
        //             context.setModalTypeHandler,
        //             context.setLoaderStatusHandler,
        //             this.props.posRequestdata(leaveData,  context.setModalTypeHandler, context.setLoaderStatusHandler,
        //                 (response) => {
        
        //                     if (response?.seen === 0) {
        //                         this.setState({ id: this.props.pos_request?.data?.length ? this.props.pos_request.data[0]?.id : '' })
        //                     }
        //                     else {
        //                         this.setState({ id: this.props.pos_request?.data?.length ? this.props.pos_request.data[0]?.id : '' })
        //                     }
        //                 }
        //             ),
        //             // this.props.getRequestConfig(context.setModalTypeHandler, context.setLoaderStatusHandler, data2),
        //             // this.props.getEmpbasecompanyFilterAction(data1, (res) => {})
        //         );
        //     }
        // }
        // };
        if (prevState.type !== this.state.type) {
            if(this.storage.company_type === 5){
            console.log("000011")
            this.setState({ page: 0, pageSize: 15 })
            setTimeout(() => {
                if (this.state.type === '1') {
                    console.log("0000022")
                    const leaveData = {
                        date: null,
                        type: null,
                        employee_id: null,
                        pageCount: this.state.page,
                        numPerPage: this.state.pageSize,
                        key: 'ApprovalPage'
                    }
                    let data = {
                        type:'leave',
                        date: null,
                        seen:0,
                        typeOfLeave: this.state.filterLeaveType,
                    }
                    this.setState({ ...this.state, createdAt: null, employee: null, filterLeaveType: null })
                    apiCalls(
                        context.setModalTypeHandler,
                        context.setLoaderStatusHandler,
                        this.props.listAllLeaveRequestAction(leaveData, context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler,
                            (response) => {
                                if (response.status === 200) {
                                    // console.log('yes3');
                                    this.setState({ id: this.props.leave_request?.data?.length ? this.props.leave_request.data[0]?.leaveId : response?.data?.data[0]?.leaveId })
                                    this.props.getUnseenCountAction( data),
                                    this.setState({seenType:'leave' })
                                }
                            }
                        ),
                    )
                }
                else if (this.state.type === '2') {
                    const data = {
                        tenure: "", frmdate: '', todate: '', emp_name: "", status: "",
                        // numPerPage: null,
                        // pageCount: '',
                        searchString: '',
                        date: null,
                        employeeId: null,
                        pageCount: this.state.page,
                        numPerPage: this.state.pageSize,
                        key: 'ApprovalPage'
                    }
                    let data1 = {
                        type:'loans',
                        date: null,
                        seen:0
                    }
                    this.setState({ ...this.state, createdAt: null, employee: null })
                    apiCalls(
                        context.setModalTypeHandler,
                        context.setLoaderStatusHandler,
                        this.props.getLoanListAction(data,
                            (response) => {
                                if (response.status === 200) {
                                    //console.log('yes4');
                                    this.props.getUnseenCountAction( data1),
                                    this.setState({seenType:'loans' })
                                    this.setState({ loanId: response.data?.data[0]?.id })
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
                        key: 'ApprovalPage',
                        type:this.state.filterType
                    }
                    let data = {
                        type:'claimsAndOthers',
                        filter:this.state.filterType,
                        date: null,
                        seen:0
                    }
                    this.setState({ createdAt: null, employee: null });

                    apiCalls(
                        context.setModalTypeHandler,
                        context.setLoaderStatusHandler,
                        this.props.searchClaimAndOthersAction(claimdata, (responseCallback) => {
                            // console.log("thishere");

                            if (responseCallback.status === 200) {
                                this.props.getUnseenCountAction( data),
                                this.setState({seenType:'claims' })
                                this.setState({ claimAndOtherId: responseCallback.data?.data?.length ? responseCallback.data.data[0]?.unique_key : ''  });
                            }
                        })
                    );
                }
            }, 1000);
        }
        if (this.storage.company_type == 2 ) {
            if (this.state.type === '2') {
                const payload = {
                    fromDate: this.state.fromdate,
                    toDate: this.state.todate,
                    searchVal: '',
                    selectedEmployee: [],
                    pageCount: this.state.page,
                    numPerPage: this.state.pageSize
                }
                setTimeout(() => {
                apiCalls (
                this.props.getQuotationApprovalsAction(payload, async (response) => {
                    const res = await response
                    console.log('res?.length', res)
                    if (res?.length > 0) {
                        if (response?.seen === 0) {
                            this.setState({ id: this.props.quotationApprovals?.data?.length ? this.props.pos_request.data[0]?.id : '' })
                        }
                        else {
                            this.setState({ id: this.props.quotationApprovals?.data?.length ? this.props.pos_request.data[0]?.id : '' })
                        }
                    }
                })
            ).finally(() => this.setState({ isApiFinished: true }))
            }, 1000);
            }

            }

        }
        if (prevProps.searchClaim !== this.props.searchClaim) {
            //this.setState({ claimAndOtherId: this.props.searchClaim[0]?.claim_id });
            this.setState({ searchClaim: this.props.searchClaim });
        }
    }


    handleDelete = () => {
        let leaveData = {
            fromdate: null,
            todate: null,
            type: null,
            employee_id: this.storage.role_name === 'Employee' ? this.storage.employee_id : null,
            pageCount: this.state.page,
            numPerPage: this.state.pageSize,
            key: 'ApprovalPage'
        }
        this.props.listAllLeaveRequestAction(leaveData, this.context.commoncookie, this.context.setModalTypeHandler, this.context.setLoaderStatusHandler, (response) => {
            if (response.res === 200) {
                // console.log("firstdata",this.props.leave_request.data[0]?.leaveId,response.data.data[1].leaveId,response.data);
                
                this.setState({ id: this.props.leave_request.data[1]?.leaveId })
                // this.setState({ id: response.data.data[1].leaveId })
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
            employeeId: null,
            key: 'ApprovalPage'
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
            key: 'ApprovalPage',
            pageCount: this.state.page,
            numPerPage: this.state.pageSize,
            type:this.state.filterType
        }
        this.props.searchClaimAndOthersAction(claimdata, (responseCallback) => {
            if (responseCallback.status === 200) {
                this.setState({ claimAndOtherId: responseCallback.data.data[0]?.unique_key   })
            }
        })
    }


    handleChange = async (data) => {
        var date_val = data.target.value;
        await this.setState({ [data.target.name]: date_val });
    };


    handleShowNext = async (type) => {
        if(this.storage.company_type == 5){
        this.setState({ page: this.state.page + 1 })
        const context = this.context;
        let leaveData = {
            fromdate: this.state.fromdate,
            todate: this.state.todate,
            type: this.state.filterLeaveType,
            employee_id: (this.state.valueforEmployee?.employee_id || null),
            pageCount: this.state.page + 1,
            numPerPage: this.state.pageSize,
            key: 'ApprovalPage'
        }
        const data = {
            tenure: "", frmdate: '', todate: '', emp_name: "", status: "", numPerPage: this.state.pageSize,
            pageCount: this.state.page + 1,
            searchString: '',
            date: null,
            employeeId: null,
            key: 'ApprovalPage'
        }
        const claimdata = {
            searchString: '',
            fromdate: '',
            todate: '',
            employeeId: null,
            pageCount: this.state.page + 1,
            numPerPage: this.state.pageSize,
            key: 'ApprovalPage',
            type:this.state.filterType
        }
        if (type?.type == "req") {
            apiCalls(
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                this.props.listAllLeaveRequestAction(leaveData, context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler, (response) => {
                    if (response.res === 200) {
                        this.setState({ id: this.props.leave_request.data[0]?.leaveId })
                    }
                }))
        }
        if (type?.type == "loan") {
            apiCalls(
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                this.props.getLoanListAction(data, (response) => {
                    if (response.status === 200) {
                        this.setState({ loanId: response.data?.data[0]?.id })
                    }
                }),
            )
        }
        if (type?.type == "claims") {
            apiCalls(
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                this.props.searchClaimAndOthersAction(claimdata, (responseCallback) => {
                    if (responseCallback.status === 200) {
                        this.setState({ claimAndOtherId: responseCallback.data?.data?.length ? responseCallback.data.data[0]?.unique_key : ''});
                    }
                })
            )
        }
     }
     if(this.storage.company_type == 2){
        const context = this.context;
        this.setState({page : this.state.page + 1})
        let leaveData = {
            fromdate: this.state.fromdate,
            todate: this.state.todate,
            type: this.state.filterLeaveType,
            employee_id: (this.state.valueforEmployee?.employee_id || null),
            pageCount: this.state.page + 1,
            numPerPage: this.state.pageSize,
            key: 'ApprovalPage'
        }
        apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.posRequestdata(leaveData,  context.setModalTypeHandler, context.setLoaderStatusHandler, (response) => {
                if (response.res === 200) {
                    this.setState({ id: this.props.pos_request.data[0]?.id })
                }
            }),
        )
     }
    }


    handleShowPrev = async (type) => {
        console.log(type, 'prev');
        if(this.storage.company_type == 5){
        this.setState({ page: this.state.page === 0 ? 0 : this.state.page - 1 })
        const context = this.context;
        let leaveData = {
            fromdate: this.state.fromdate,
            todate: this.state.todate,
            type: this.state.filterLeaveType,
            employee_id: (this.state.valueforEmployee?.employee_id || null),
            pageCount: this.state.page === 0 ? 0 : this.state.page - 1,
            numPerPage: this.state.pageSize,
            key: 'ApprovalPage'
        }
        const data = {
            tenure: "", frmdate: '', todate: '', emp_name: "", status: "",
            pageCount: this.state.page === 0 ? 0 : this.state.page - 1,
            numPerPage: this.state.pageSize,
            searchString: '',
            date: null,
            employeeId: null,
            key: 'ApprovalPage'
        }
        const claimdata = {
            searchString: '',
            fromdate: '',
            todate: '',
            employeeId: null,
            pageCount: this.state.page === 0 ? 0 : this.state.page - 1,
            numPerPage: this.state.pageSize,
            key: 'ApprovalPage',
            type:this.state.filterType 
        }
        if (type?.type == "req") {
            apiCalls(
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                this.props.listAllLeaveRequestAction(leaveData, context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler, (response) => {
                    if (response.res === 200) {
                        this.setState({ id: this.props.leave_request.data[0]?.leaveId })
                    }
                }),
            )
        }
        if (type?.type == "loan") {
            apiCalls(
                this.props.getLoanListAction(data, (response) => {
                    if (response.status === 200) {
                        this.setState({ loanId: response.data?.data[0]?.id })
                    }
                }),
            )
        }
        if (type?.type == "claims") {
            apiCalls(
                this.props.searchClaimAndOthersAction(claimdata, (responseCallback) => {
                    if (responseCallback.status === 200) {
                        this.setState({ claimAndOtherId: responseCallback.data?.data?.length ? responseCallback.data.data[0]?.unique_key : ''  });
                    }
                })
            )
        }
    }
    if(this.storage.company_type == 2){
        const context = this.context;
        this.setState({page : this.state.page - 1})

        let leaveData = {
            fromdate: this.state.fromdate,
            todate: this.state.todate,
            type: this.state.filterLeaveType,
            employee_id: (this.state.valueforEmployee?.employee_id || null),
            pageCount: this.state.page === 0 ? 0 : this.state.page - 1,
            numPerPage: this.state.pageSize,
            key: 'ApprovalPage'
        }
        apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.posRequestdata(leaveData, context.setModalTypeHandler, context.setLoaderStatusHandler, (response) => {
                if (response.res === 200) {
                    this.setState({ id: this.props.pos_request.data[0]?.id })
                }
            }),
        )
    }
       
      
    }  
    handleAssignChange = async (event) => {
        const { name, value } = event.target

        await this.setState({ [name]: value })
    }
    resDataRequest = (value) => {



        let employee_id = this.storage?.employee_id || '';

        let type = value == 1 ? 'Leave Request' : 'Permission Request';
        let data = {
            type,
            employee_id,
        }
        this.props.getNotificationTokenAction(data,
            (response) => {
                if (response?.status === 200) {

                    this.props.CreateNotificationAction({ content_body: response?.data.body, title: response?.data?.title, time: getDateTimeFormat(new Date()), "active": "1" })


                }
            })

    }







    response = () => {


        let emp_id = this.storage?.employee_id || '';
        let employee_id = this.state.EmpId
        let type = data?.request_type == 1 ? 'Leave Rejection' : data?.request_type == 2 ? 'Permission Rejection' : 'Leave Rejection';
        let data = {
            type,
            employee_id,
            keyForNotifications: 'Verifier'
        }
        this.props.getNotificationTokenAction(data,
            (response) => {
                if (response?.status === 200) {
                    this.props.CreateNotificationAction({ content_body: response?.data.body, title: response?.data?.title, time: getDateTimeFormat(new Date()), "active": "1", receiver: employee_id })


                }
            })
    }

    responseAtt = () => {

        let emp_id = this.storage?.employee_id || '';
        let employee_id = this.state.EmpId
        let type = 'Attendance Correction Rejection'
        let data = {
            type,
            employee_id,
            keyForNotifications: 'Verifier'
        }
        this.props.getNotificationTokenAction(data,
            (response) => {
                if (response?.status === 200) {

                    this.props.CreateNotificationAction({ content_body: response?.data.body, title: response?.data?.title, time: getDateTimeFormat(new Date()), "active": "1", receiver: employee_id })


                }
            })


    }

    handleClaimInitialData = () => {
        //console.log("this");
        const claimdata = {
            searchString: '',
            fromdate: '',
            todate: '',
            pageCount: this.state.page,
            numPerPage: this.state.pageSize,
            employeeId: null,
            key: 'ApprovalPage',
            type:this.state.filterType
            // pageCount: this.state.page,
            // numPerPage: this.state.pageSize,
        }
        apiCalls(
            this.context.setModalTypeHandler,
            this.context.setLoaderStatusHandler,
            this.props.searchClaimAndOthersAction(claimdata, (responseCallback) => {
                if (responseCallback.status === 200) {
                    this.setState({ claimAndOtherId:  responseCallback.data.data[0]?.unique_key   });

                }
            })
        );
    }

    handleCancel = async (data) => {
        this.setState({ EmpId: data.employee_id })
    
       if(this.storage.company_type == 5){
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


    getRequestType = () => {

        let arr = {
            '1': "Leave Approval",
            '2': "Permission Approval",
            '3': "Attendance Correction Approval",
            '4': "Halfday"
        }
        return arr[this.state.request_type]
    }


    resData = (key,details) => {
        if(this.storage.company_type == 5){
        let requestType = this.getRequestType()
        let emp_id = this.storage?.employee_id || '';
        let employee_id = this.state.EmpId
        let type = requestType == 'Leave Approval' ? 'Leave Approval' : requestType === 'Permission Approval' ? 'Permission Approval' : requestType === 'Attendance Correction Approval' ? 'Attendance Correction Approval' : 'Leave Approval'
        let request_type_id = type == 'Leave Approval' ? '1' : type == 'Permission Approval' ? 2 : type == 'Attendance Correction Approval' ? 3 : 1
        const fromDateOnly = details.fromDate.split('T')[0];
        const toDateOnly = details.toDate.split('T')[0];
        let data = {
            type,
            employee_id,
            keyForNotifications: key,
            request_type_id,
            approvedBy: this.storage?.first_name + (this.storage?.last_name ? this.storage.last_name !== null ? ' ' + this.storage.last_name : '' : ''),
            fromDate: fromDateOnly, 
            toDate: toDateOnly,
        }
        this.props.getNotificationTokenAction(data,
            (response) => {
                if (response?.status === 200) {
                    const receiverIdList = response?.data?.receiver_id;
                    const titleList = response?.data?.title;
                    const bodyList = response?.data?.body;
                    const idList = response?.data?.id;
                    if (Array.isArray(receiverIdList) && receiverIdList.length > 0) {
                        receiverIdList.forEach((rid, index) => {
                            this.props.CreateNotificationAction({
                                content_body: bodyList[index],
                                title: titleList[index],
                                time: getDateTimeFormat(new Date()),
                                active: "1",
                                receiver: rid,
                                type_id: idList[index],
                                type: type
                            });
                        });
                    }


                }
            })
        }

        if(this.storage.company_type == 2){
            
            let emp_id = this.storage?.employee_id || '';
            let employee_id = this.state.EmpId
            let type = 'discount';
            let request_type_id = 1;
            let data = {
                type,
                employee_id,
                keyForNotifications: key,
                request_type_id
            }
            this.props.getNotificationTokenAction(data,
                (response) => {
                    if (response?.status === 200) {
    
                        this.props.CreateNotificationAction({ content_body: response?.data.body, title: response?.data?.title, time: getDateTimeFormat(new Date()), "active": "1", receiver: employee_id })
    
    
                    }
                })
            }


    }

    resDataLoan = (key, emp_id,approvedBy,Required_Amount) => {


        let employee_id = emp_id
        let type = 'Loan Approval'


        let data = {
            type,
            employee_id,
            keyForNotifications: key,
            request_type_id: 5,
            approvername: approvedBy,
            Required_Amount:Required_Amount
        }

        this.props.getNotificationTokenAction(data,
            (response) => {
                if (response?.status === 200) {

                    this.props.CreateNotificationAction({ content_body: response?.data.body, title: response?.data?.title, time: getDateTimeFormat(new Date()), "active": "1", receiver: employee_id })


                }
            })

    }

    resDataAtt = (key) => {
        // console.log("999", key)
        // let emp_id = this.storage?.employee_id || '';
        let employee_id = this.state.EmpId
        let type = 'Attendance Correction Approval'
        let data = {
            type,
            employee_id,
            keyForNotifications: key,
            request_type_id: 3
        }
        // console.log("data", data)
        this.props.getNotificationTokenAction(data,
            (response) => {
                if (response?.status === 200) {

                    this.props.CreateNotificationAction({ content_body: response?.data.body, title: response?.data?.title, time: getDateTimeFormat(new Date()), "active": "1", receiver: employee_id })


                }
            })

    }

    resDataClaim = (key) => {

        // let emp_id = this.storage?.employee_id || '';
        let employee_id = this.state.EmpId
        let type = 'Claim Approval'
        let data = {
            type,
            employee_id,
            keyForNotifications: key,
            request_type_id: 6
        }
        this.props.getNotificationTokenAction(data,
            (response) => {
                if (response?.status === 200) {

                    this.props.CreateNotificationAction({ content_body: response?.data.body, title: response?.data?.title, time: getDateTimeFormat(new Date()), "active": "1", receiver: employee_id })


                }
            })
    }


handleSetRequest = async (data) => {

    const context = this.context;
    this.setState({ EmpId: data.employee_id, request_type: data.request_type, id: data.leaveId, leave_type: data.leave_type })
    let leaveData = {
        fromdate: null,
        todate: null,
        type: null,
        employee_id: this.storage.role_name === 'Employee' ? this.storage.employee_id : null,
        pageCount: this.state.page,
        numPerPage: this.state.pageSize,
        key: 'ApprovalPage'
    }
    
    this.props.listAllLeaveRequestAction(
        leaveData,
        context.commoncookie,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        (response) => {
            const leaveId = response?.data?.data?.filter((f) => f?.leaveId === data.leaveId);
            const id = leaveId?.length > 0 ? leaveId[0]?.leaveId : this.props.leave_request?.data[0]?.leaveId

            if (response?.seen === 0) {
                this.setState({ id: id });  
            } else {
                this.setState({ id: id });
            }
        }
    );
}


    handleApprove = async (data) => {
       if(this.storage.company_type === 5){
        console.log("data.employee_id", data,data.employee_id)
        this.setState({ EmpId: data.employee_id, request_type: data.request_type, id: data.leaveId, leave_type: data.leave_type })
        const context = this.context;

        const approvedBy = {
            approvedBy: this.storage?.first_name + (this.storage?.last_name ? this.storage.last_name !== null ? ' ' + this.storage.last_name : '' : ''),
            approverId: null,
            verifierId: null,
            request_type: data.request_type,
            department_id: data.department_id,
            leave_type: data.leave_type,
            EmpId: data.employee_id
        }
        // console.log("data.isApproverOrVerifier ",data.isApproverOrVerifier )
        if (data.isApproverOrVerifier === 'approveAndVerify') {
            approvedBy.approverId = this.storage?.employee_id
            approvedBy.verifierId = this.storage?.employee_id
            approvedBy.key = 'ApproverAndVerifier'
        }
        else if (data.isApproverOrVerifier === 'approve') {
            approvedBy.approverId = this.storage?.employee_id
            approvedBy.key = 'Approver'
        }
        else if (data.isApproverOrVerifier === 'verify') {
            approvedBy.approverId = data.approverId

            approvedBy.verifierId = this.storage?.employee_id
            approvedBy.key = 'Verifier'
        }
        else {
            approvedBy.approverId = this.storage?.employee_id
            approvedBy.verifierId = this.storage?.employee_id
        }
        console.log("asdasd",approvedBy)

        if (data.id !== '') {

            let payloadData = { fromDate: data.fromDate, toDate: data.toDate, employee_id: data.employee_id }

            apiCalls(
                context.setModalTypeHandler, context.setLoaderStatusHandler,
                this.props.getConflictLeaveRequestAction(context.commoncookie, payloadData, context.setModalTypeHandler, context.setLoaderStatusHandler, (response) => {
                    // if (response.length === 1) {
                        // console.log("lengthhh")
                        let leaveData = {
                            fromdate: null,
                            todate: null,
                            type: null,
                            employee_id: this.storage.role_name === 'Employee' ? this.storage.employee_id : null,
                            pageCount: this.state.page,
                            numPerPage: this.state.pageSize,
                            key: 'ApprovalPage'
                        }
                        if (data.correction_type !== 1) {
                            // ApproveLeaveRequestAction
                            this.props.ApproveLeaveRequestAction(
                                context.commoncookie,
                                data.leaveId,
                                approvedBy,
                                context.setModalTypeHandler,
                                context.setLoaderStatusHandler,
                                this.resData(approvedBy.key,data),
                                (response) => {
                                    if (response?.res === 200) {
                                        this.handleSetRequest(data);
                                    }
                                }
                            );
                    
                           
                        }
                    // }
                    
                    // else {
                    //     console.log("responsuiiiii")
                    //     if (response[0]?.request_type == 3) {
                    //         const shiftIdCount = response.reduce((acc, request) => {
                    //             acc[request.shift_id] = (acc[request.shift_id] || 0) + 1;
                    //             return acc;
                    //         }, {});
    
                    //         // Step 2: Filter out objects where shift_id is repeated
                    //         const repeatedShiftIdRequests = response.filter(request => shiftIdCount[request.shift_id] > 1);
    
                    //         // console.log('repeatedShiftIdRequests', repeatedShiftIdRequests);
                    //         if (repeatedShiftIdRequests.length > 0) {
                    //             this.setState({ dialogOpen: true })
                    //         }
                    //     } else {
                    //         this.setState({ dialogOpen: true })
                    //     }
                    // }
                })
            )
        }
    }
    if(this.storage.company_type == 2){
        this.setState({ EmpId: data.employee_id, request_type: data.request_type, id: data.id, leave_type: data.leave_type })
        const context = this.context;

        const approvedBy = {
            approvedBy: this.storage?.first_name + (this.storage?.last_name ? this.storage.last_name !== null ? ' ' + this.storage.last_name : '' : ''),
            approverId: null,
            verifierId: null,
            request_type: data.request_type,
            department_id: data.department_id,
            posId : data.pos_id
        }
        // console.log("data.isApproverOrVerifier ",data.isApproverOrVerifier )
        if (data.isApproverOrVerifier === 'approveAndVerify') {
            approvedBy.approverId = this.storage?.employee_id
            approvedBy.verifierId = this.storage?.employee_id
            approvedBy.key = 'ApproverAndVerifier'
        }
        else if (data.isApproverOrVerifier === 'approve') {
            approvedBy.approverId = this.storage?.employee_id
            approvedBy.key = 'Approver'
        }
        else if (data.isApproverOrVerifier === 'verify') {
            approvedBy.approverId = data.approverId

            approvedBy.verifierId = this.storage?.employee_id
            approvedBy.key = 'Verifier'
        }
        else {
            approvedBy.approverId = this.storage?.employee_id
            approvedBy.verifierId = this.storage?.employee_id
        }
        // console.log("asdasd",approvedBy)

        if (data.id !== '') {

            // let payloadData = { fromDate: data.fromDate, toDate: data.toDate, employee_id: data.employee_id }

                    if (data.request_type == 'discount') {
                        // console.log("ApproveLeaveRequestAction")
                        this.props.ApprovePosRequestAction(context.commoncookie, data.id, approvedBy, context.setModalTypeHandler, context.setLoaderStatusHandler, this.resData(approvedBy.key));
                    }
        }
    }
    }

    handleCorrect = (data) => {
        console.log(data, "333333")
        this.setState({ EmpId: data.employee_id })
        const context = this.context;
        const approvedBy = {
            approvedBy: this.storage?.first_name + (this.storage?.last_name ? this.storage.last_name !== null ? ' ' + this.storage.last_name : '' : ''),
            approverId: null,
            verifierId: null,
            request_type: 3,
            department_id: data.department_id
        }
        if (data.isApproverOrVerifier === 'approveAndVerify') {
            approvedBy.approverId = this.storage?.employee_id
            approvedBy.verifierId = this.storage?.employee_id
            approvedBy.key = 'ApproverAndVerifier'
        }
        else if (data.isApproverOrVerifier === 'approve') {
            approvedBy.approverId = this.storage?.employee_id
            approvedBy.key = 'Approver'
        }
        else if (data.isApproverOrVerifier === 'verify') {
            approvedBy.approverId = data.approverId

            approvedBy.verifierId = this.storage?.employee_id
            approvedBy.key = 'Verifier'
        }
        else {
            approvedBy.approverId = this.storage?.employee_id
            approvedBy.verifierId = this.storage?.employee_id

        }
        console.log("data.correction_type ", data.correction_type)
        if (data.correction_type === 1) {

            this.props.ApproveLeaveRequestAction(context.commoncookie, data.leaveId, approvedBy, context.setModalTypeHandler, context.setLoaderStatusHandler, this.resDataAtt(approvedBy.key));
        }
    }



    handleConflictApprove = (data) => {
        const context = this.context;
        const approvedBy = { approvedBy: this.storage?.first_name + (this.storage?.last_name ? this.storage.last_name !== null ? ' ' + this.storage.last_name : '' : '') }

        let payloadData = {
            fromDate: data.fromDate, toDate: data.toDate, employee_id: data.employee_id,
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
                                        pageCount: this.state.page,
                                        numPerPage: this.state.pageSize,
                                        key: 'ApprovalPage'
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
        console.log('currentreqqqq, f')
        const data = { 
            tenure: "", frmdate: '', todate: '', emp_name: "", status: "", numPerPage: null,
            pageCount: '',
            searchString: '',
            date: null,
            employeeId: null,
            key: 'ApprovalPage'
        };

        if (name === 'leave') {
            this.setState({ id: f, tabType: '1' });
            if (roleType.includes(this.storage.role_name)) {
                apiCalls(
                    context.setModalTypeHandler,
                    context.setLoaderStatusHandler,
                    this.props.updateSeenAction(f, (response, unseenCount) => {
                        if (response === 200) {
                            let data = {
                                type:'leave',
                                fromdate: this.state.fromdate,
                                todate: this.state.todate,
                                seen:0,
                                typeOfLeave: this.state.filterLeaveType,
                            }

                            
                            this.props.getUnseenCountAction(data,(response)=>{
                                this.setState({ id: this.state.currentReq, from: moment(), to: moment()  });
                                this.setState({seenType:'leave' })
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
                            let data = {
                                type:'loans',
                                fromdate: this.state.fromdate,
                                todate: this.state.todate,
                                seen:0
                            }
                          
                            this.props.getUnseenCountAction(data);
                            
                            this.setState({seenType:'leave' })
                            this.setState({ loanId: f })
                           
                        }
                    })
                )
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
                            let data = {
                                type:'claimsAndOthers',
                                filter:this.state.filterType,
                                fromdate: this.state.fromdate,
                                todate: this.state.todate,
                                seen:0,
                            }
                            this.props.getUnseenCountAction(data);
                            
                            this.setState({seenType:'claim' })
                            // this.setState({ id: this.state.currentReq, from: moment(), to: moment()  });
                           
                           
                        }
                    })
                );
            }
        }else if (name === 'posrequest') {
            this.setState({ id: f, tabType: '1' });
            if (roleType.includes(this.storage.role_name)) {
                apiCalls(
                    context.setModalTypeHandler,
                    context.setLoaderStatusHandler,
                    this.props.PosrequpdateSeenAction(f, (response, unseenCount) => {
                        if (response === 200) {
                            const leaveData = {
                                date: this.state.createdAt,
                                type: this.state.filterLeaveType,
                                employee_id: this.state.valueforEmployee?.employee_id || null,
                                pageCount: this.state.page,
                                numPerPage: this.state.pageSize,
                                key: 'ApprovalPage'
                            };
                            // this.props.posRequestdata(leaveData, context.setModalTypeHandler, context.setLoaderStatusHandler, 
                            //     (response) => {            
                            //     if (response.res === 200) {
                            //         this.setState({ id: this.state.currentReq, from: moment(), to: moment(), unseenCount: unseenCount });
                            //     }
                            // });
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
        } 
        else {
           reason = allData.type;
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
    poshandleStatus = (data, approvedBy, cancelledBy, allData) => {
        //console.log(data, approvedBy, cancelledBy, allData,'statuscheck');
        const requestType = allData.request_type;
        let reason;
   
         if(requestType === 'discount'){
            reason = 'PointofSale Discount';
        }
        else {
            reason = 'pending';
        }
        if (data === 'Approved') {
            // return `${approvedBy.charAt(0).toUpperCase() + approvedBy.slice(1)} approved ${reason} request`
            const approvedByName = approvedBy ? approvedBy.charAt(0).toUpperCase() + approvedBy.slice(1) : '';
            return `${approvedByName} approved ${reason} request`;
        } else if (data === "Pending") {
            return `${allData?.posName + (allData.location_name ? ' ' + allData.location_name : '')} Request ${allData.status} for ${reason}`
        } else {
            // return `${cancelledBy.charAt(0).toUpperCase() + cancelledBy.slice(1)} rejected ${reason} request`
            const cancelledByName = cancelledBy ? cancelledBy.charAt(0).toUpperCase() + cancelledBy.slice(1) : '';
            return `${cancelledByName} ${data} ${reason} request`;
        }
    }

    handleStatusClaim = (data, approvedBy, cancelledBy, allData) => {
        // console.log(data, approvedBy, cancelledBy, allData,'statuscheck');
        let  reason = allData.type;

        if (data === 'Approved') {
            const approvedByName = approvedBy ? approvedBy.charAt(0).toUpperCase() + approvedBy.slice(1) : '';
            if(reason === "WFH"){
                if(allData.requestedFor === "add"){
                  return `${approvedByName} approved Request to Add WFH Location`
                }else{
                  return `${approvedByName} approved Request to Remove WFH Location`
                }
            }else{
            return `${approvedByName} approved ${reason} request`;
            }
            
        } else if (data === "Pending") {
            if(reason === "WFH"){
                if(allData.requestedFor === "add"){
                  return `${allData?.full_name} Request to Add WFH Location ${allData.status} for ${reason}`
                }else{
                  return `${allData?.full_name} Request to Remove WFH Location ${allData.status} for ${reason}`
                }
            }else{
                return `${allData?.full_name} Request ${allData.status} for ${reason}`
            }
        }else if (data === "Waiting for Approval") {
            if(reason === "WFH"){
                if(allData.requestedFor === "add"){
                    return `${allData?.full_name} Request to Add WFH Location ${allData.status}`
                  }else{
                    return `${allData?.full_name} Request to Remove WFH Location ${allData.status}`
                  }
            }else{
                const cancelledByName = cancelledBy ? cancelledBy.charAt(0).toUpperCase() + cancelledBy.slice(1) : '';
            return `${cancelledByName} ${data} ${reason} request`;
            }
        }
         else {
            // return `${cancelledBy.charAt(0).toUpperCase() + cancelledBy.slice(1)} rejected ${reason} request`
            const cancelledByName = cancelledBy ? cancelledBy.charAt(0).toUpperCase() + cancelledBy.slice(1) : '';
            return `${cancelledByName} ${data} ${reason} request`;
        }
    }

    ////loanhandle
    handleStatusLoan = (status, approvedBy, cancelledBy, f) => {
        // console.log('loanStatus', status, approvedBy, cancelledBy, f.full_name)
        const reason = 'Loan'
        const approvedByName = approvedBy ? approvedBy.charAt(0).toUpperCase() + approvedBy.slice(1) : '';
        const cancelledByName = cancelledBy ? cancelledBy.charAt(0).toUpperCase() + cancelledBy.slice(1) : '';
        const emp_name = f?.full_name;
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
        // console.log("rowdata", rowdata)
        this.setState({ EmpId: rowdata.emp_id })

        const context = this.context;
        const approvedBy = {
            approvedBy: this.storage?.first_name + (this.storage?.last_name ? this.storage.last_name !== null ? ' ' + this.storage.last_name : '' : ''),

            approverId: null,
            verifierId: null,
            department_id: rowdata.department_id,
            request_type: rowdata.request_type
        }

        if (rowdata.isApproverOrVerifier === 'approveAndVerify') {
            approvedBy.approverId = this.storage?.employee_id
            approvedBy.verifierId = this.storage?.employee_id
            approvedBy.key = 'ApproverAndVerifier'
        }
        else if (rowdata.isApproverOrVerifier === 'approve') {
            approvedBy.approverId = this.storage?.employee_id
            approvedBy.key = 'Approver'
        }
        else if (rowdata.isApproverOrVerifier === 'verify') {
            approvedBy.approverId = rowdata.approverId

            approvedBy.verifierId = this.storage?.employee_id
            approvedBy.key = 'Verifier'
        }
        else {
            approvedBy.approverId = this.storage?.employee_id
            approvedBy.verifierId = this.storage?.employee_id
        }

        const data = {
            tenure: "", frmdate: '', todate: '', emp_name: "", status: "", numPerPage: this.state.pageSize,
            pageCount: this.state.page,
            searchString: '',
            date: this.state.createdAt,
            employeeId: this.state.employee,
            key: 'ApprovalPage'
        }

        // console.log("rowdata.emp_id",rowdata.emp_id)
        await this.props.updateLoanStatusAction(id, { type: 'approve', Approvedby: approvedBy, request_type: 'loan', outstanding: rowdata }, context.setModalTypeHandler, context.setLoaderStatusHandler, this.resDataLoan(approvedBy.key, rowdata.emp_id,approvedBy.approvedBy,rowdata.Required_Amount), (response) => {
            if (response === 200) {
                // await this.props.getLoanListAction(data, context.setLoaderStatusHandler, context.setModalStatusHandler),
                this.props.getLoanListAction(data, (response) => {
                    if (response.status === 200) {
                        this.setState({ loanId: id })
                    }
                })
            }
        })

    };



    handleRejectLoan = async (id, rowdata) => {
        const context = this.context;
        const approvedBy = {
            approvedBy: this.storage?.first_name + (this.storage?.last_name ? this.storage.last_name !== null ? ' ' + this.storage.last_name : '' : ''),
            rejectedById: this.storage?.employee_id,
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
            employeeId: null,
            key: 'ApprovalPage'
        }
        await this.props.updateLoanStatusAction(id, { type: 'Reject', cancelledBy: approvedBy, outstanding: rowdata }, context.setModalTypeHandler, context.setLoaderStatusHandler, this.resDataLoan, (response) => {
            if (response === 200) {

                this.props.getLoanListAction(data, (response) => {
                    if (response.status === 200) {
                        this.setState({ loanId: response.data?.data[0]?.id })
                    }
                })
            }
        })

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
            employeeId: null,
            key: 'ApprovalPage'
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
        if(this.storage.company_type == 5){
        if (this.state.type === '1') {

            const dateObject = moment(this.state.createdAt);
            const formattedDate = dateObject.format("YYYY-MM-DD");
            const leaveData = {
                // date: this.state.createdAt,
                fromdate: this.state.fromdate,
                todate: this.state.todate,
                type: this.state.filterLeaveType,
                filter: 'FilteredRecords',
                employee_id: (this.state.valueforEmployee?.employee_id || null),
                pageCount: 0,
                numPerPage: this.state.pageSize,
                key: 'ApprovalPage',
                
            }
            let data1 = {
                type:'leave',
                fromdate: this.state.fromdate,
                todate: this.state.todate,
                seen: 0,
                typeOfLeave: this.state.filterLeaveType,
            }
            apiCalls(
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                this.props.listAllLeaveRequestAction(leaveData, context.commoncookie, context.setModalTypeHandler, context.setLoaderStatusHandler,
                    (response) => {
                        if (response.res === 200) {
                            this.setState({ id: this.props.leave_request.data[0]?.leaveId })
                            this.props.getUnseenCountAction( data1),
                            this.setState({seenType:'leave' })
                        }
                    }
                ),
            )
        }
        else if (this.state.type === '2') {
            const data = {
                tenure: "",
                frmdate: this.state.fromdate,
                todate: this.state.todate, emp_name: "", status: "", numPerPage: null,
                pageCount: '',
                searchString: '',
                date: this.state.createdAt,
                type: 'Filter',
                employeeId: (this.state.valueforEmployee?.employee_id || null),
                key: 'ApprovalPage',
                filter: 'FilteredRecords',
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
        else if (this.state.type === '5') {
            const claimdata = {
                searchString: '',
                fromdate: this.state.fromdate,
                todate: this.state.todate,
                pageCount: this.state.page,
                numPerPage: this.state.pageSize,
                employeeId: (this.state.valueforEmployee?.employee_id || null),
                key: 'ApprovalPage',
                filter: 'FilteredRecords',
                type:this.state.filterType
                // pageCount: this.state.page,
                // numPerPage: this.state.pageSize,
            }
            apiCalls(
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                this.props.searchClaimAndOthersAction(claimdata,
                    (responseCallback) => {
                        if (responseCallback.status === 200) {
                            this.setState({ claimAndOtherId:  responseCallback.data.data[0]?.unique_key   })
                        }
                    }
                )
            )
        }
       }
       if(this.storage.company_type == 2){
            const dateObject = moment(this.state.createdAt);
            const formattedDate = dateObject.format("YYYY-MM-DD");
            const leaveData = {
                // date: this.state.createdAt,
                fromdate: this.state.fromdate,
                todate: this.state.todate,
                type: this.state.filterLeaveType,
                filter:'FilteredRecords',
                employee_id:(this.state.valueforEmployee?.employee_id || null),
                pageCount: 0,
                numPerPage: this.state.pageSize,
                key: 'ApprovalPage'
            }
            apiCalls(
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                this.props.posRequestdata(leaveData,  context.setModalTypeHandler, context.setLoaderStatusHandler,
                    (response) => {
                        if (response.res === 200) {
                            this.setState({ id: this.props.pos_request.data[0]?.id })
                        }
                    }
                ),
            )
        
       }
        this.handleDialogClose()

    }

    handleConflictClose = (val) => {
        this.setState({ dialogOpen: val })
    }

    handleDialogClose = () => {
        this.setState({ isFilterDialogOpen: false , valueforEmployee: ''})
    }
    handleDateChange = (newDate) => {
        const formattedDate = newDate ? moment(newDate).format("YYYY-MM-DD") : null;
        //console.log("formattedDate",formattedDate);
        this.setState({ fromdate: formattedDate });
    }
    tpHandle = (newDate) => {
        const formattedDate = newDate ? moment(newDate).format("YYYY-MM-DD") : null;
        this.setState({ todate: formattedDate });
    }
    handleClear = async () => {
        const context = this.context;




        if (this.state.type === '1') {
            const leaveData = {
                fromdate: null,
                todate: null,
                type: null,
                employee_id: this.storage.role_name === 'Employee' ? this.storage.employee_id : null,
                pageCount: this.state.page,
                numPerPage: this.state.pageSize,
                key: 'ApprovalPage'
            }
            this.setState({
                ...this.state, createdAt: null, employee: null, filterLeaveType: null, valueforEmployee: [], searchValEmployeeFilter: '', fromdate: "",
                todate: ""
            })
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
        } else if (this.state.type === '5') {
            const claimdata = {
                searchString: '',
                fromdate: '',
                todate: '',
                pageCount: this.state.page,
                numPerPage: this.state.pageSize,
                employeeId: null,
                key: 'ApprovalPage',
                type:null
            }
            this.setState({
                ...this.state, createdAt: null, employee: null, fromdate: "",
                todate: "",filterType:null
            })
            apiCalls(
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                this.props.searchClaimAndOthersAction(claimdata,
                    (responseCallback) => {
                        if (responseCallback.status === 200) {
                            //console.log('yes4');
                            this.setState({ claimAndOtherId:  responseCallback.data.data[0]?.unique_key   })
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
                employeeId: this.storage.role_name === 'Employee' ? this.storage.employee_id : null,
                key: 'ApprovalPage'
            }
            this.setState({ ...this.state, createdAt: null, employee: null, valueforEmployee: [], searchValEmployeeFilter: '', fromdate: '', todate: '' })
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

    handledata = () => {
        if (this.storage.role_name === 'Employee') {

            let temp = this.props.getCompanyBasedEmployeeFilter.filter((d) => d.employee_id === this.storage.employee_id)

            return temp

        }

        else {
            return this.props.getCompanyBasedEmployeeFilter
        }
    }



    render() {


        let reqType;
        if (this.state.type === '1') {
            reqType = '1';
        } else if (this.state.type === '5') {
            reqType = '5';
        } else {
            reqType = '3';
        }
        const { type, claim_id, isFilterDialogOpen, searchClaim } = this.state;



        let tempp = this.storage.role_name === 'Employee' ? this.props.getCompanyBasedEmployeeFilter.filter((d) => d.employee_id === this.storage.employee_id) : this.props.getCompanyBasedEmployeeFilter
        const { tabIndex } = this.state;
        // console.log("dsfjdsf",this.props.leave_request?.data?.length > 0,this.props.leave_request?.data ,this.state.id);
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
                                    filterType={this.state.filterType}
                                    role_name={this.storage.role_name}
                                    createdAt={this.state.createdAt}
                                    fromdate={this.state.fromdate}
                                    todate={this.state.todate}
                                    employee={this.state.employee}
                                    employee_id={this.storage.employee_id}
                                    handleDateChange={this.handleDateChange}
                                    tpHandle={this.tpHandle}
                                    type={this.state.type}
                                // key={'Approval'}
                                />
                            )}

                            {/* <Box sx={{ bgcolor: 'background.paper',maxHeight:`calc(${maxHeight} - 10px)`,minHeight:`calc(${maxHeight} - 10px)` }}> */}


                               {this.storage.company_type == 5 &&
                               <>
                                {tabIndex === 0 && (
                                    <div>
                                        <Grid container spacing={2} sx={{ py: 1.5, px: 0.25 }}>
                                            <Grid
                                                size={{
                                                    lg: 3.5,
                                                    md: 4,
                                                    sm: 5,
                                                    xs: 12
                                                }}>
                                              <Card sx={{ borderRadius: 2, height: 'calc(100vh - 100px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                                <Box sx={{ px: 0, pt: 0, pb: 0.5 }}>
                                                  <Tabs
                                                    value={tabIndex}
                                                    onChange={(e, v) => this.handleTabChange(null, v)}
                                                    variant="fullWidth"
                                                    sx={{
                                                      minHeight: 72,
                                                      '& .MuiTab-root': {
                                                        minHeight: 72,
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        fontSize: '13px',
                                                        color: 'text.primary',
                                                        '&.Mui-selected': { color: 'primary.main' },
                                                      },
                                                      '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
                                                    }}
                                                  >
                                                    <Tab icon={<ExitToAppIcon />} label="Requests" />
                                                    {this.storage.subscription_type !== 1 && <Tab icon={<CreditScoreIcon />} label="Loans" />}
                                                    {this.storage.subscription_type !== 1 && this.storage.subscription_type !== 2 && <Tab icon={<DescriptionIcon />} label="Others" />}
                                                  </Tabs>

                                                  {/* Summary counts */}
                                                  {this.props.leave_request?.data?.length > 0 && (
                                                    <Stack direction="row" spacing={1.5} sx={{ mb: 1, flexWrap: 'wrap', px: 2.5, pt: 1 }}>
                                                      {(() => {
                                                        const data = this.props.leave_request?.data || [];
                                                        const pending = data.filter(d => d.status === 'Pending' || d.status === 'Waiting for Approval').length;
                                                        const approved = data.filter(d => d.status === 'Approved').length;
                                                        const rejected = data.filter(d => d.status === 'Rejected' || d.status === 'cancelled' || d.status === 'Cancelled').length;
                                                        return (
                                                          <>
                                                            {pending > 0 && <Typography variant="caption" sx={{ color: '#f57c00', fontWeight: 600 }}>{pending} Pending</Typography>}
                                                            {approved > 0 && <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600 }}>{approved} Approved</Typography>}
                                                            {rejected > 0 && <Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: 600 }}>{rejected} Rejected</Typography>}
                                                          </>
                                                        );
                                                      })()}
                                                    </Stack>
                                                  )}

                                                  {/* Toolbar: pagination + filter + unseen */}
                                                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5, px: 2.5 }}>
                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                      <IconButton
                                                        size="small"
                                                        onClick={() => this.handleShowPrev({ type: 'req' })}
                                                        disabled={this.state.page === 0}
                                                      >
                                                        <ChevronLeftIcon fontSize="small" />
                                                      </IconButton>
                                                      <IconButton
                                                        size="small"
                                                        onClick={() => this.handleShowNext({ type: 'req' })}
                                                        disabled={!this.props.leave_request?.data?.length || this.props.leave_request?.data?.length < 15}
                                                      >
                                                        <ChevronRightIcon fontSize="small" />
                                                      </IconButton>
                                                    </Stack>
                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                      <CommonToolTip title="Filter">
                                                        <IconButton size="small" onClick={() => this.setState({ isFilterDialogOpen: true })}>
                                                          <FilterAltIcon sx={{ fontSize: 20, color: 'grey.600' }} />
                                                        </IconButton>
                                                      </CommonToolTip>
                                                      {this.storage.role_name === "Administrator" &&
                                                        <Tooltip title={this.state.showUnseenRequests ? "View All" : "Unseen Requests"}>
                                                          <IconButton size="small" onClick={this.handleUnseenViewAllState}>
                                                            <Badge badgeContent={this.props.getUnseenCount[0]?.unseenCount || 0} color="primary" max={99}
                                                              sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}
                                                            >
                                                              {this.state.showUnseenRequests ? (
                                                                <VisibilityOffIcon sx={{ fontSize: 20 }} color="action" />
                                                              ) : (
                                                                <VisibilityIcon sx={{ fontSize: 20 }} color="action" />
                                                              )}
                                                            </Badge>
                                                          </IconButton>
                                                        </Tooltip>
                                                      }
                                                    </Stack>
                                                  </Stack>
                                                </Box>

                                                <Divider />

                                                {/* List items */}
                                                {this.props.leave_request?.data?.length > 0 ?
                                                  <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2.5, py: 2, ...scrollBar }}>
                                                    <Stack spacing={2}>
                                                      {this.props.leave_request?.data?.filter((f) => !this.state.showUnseenRequests || f.seen === 0)
                                                        .map((f, i) => {
                                                          const isSelected = this.state.id === f.leaveId;
                                                          const isUnseen = f.seen === 0 && roleType.includes(this.storage.role_name);
                                                          return (
                                                            <Box
                                                              key={f.leaveId}
                                                              {...(this.props.leave_request?.data?.length === i + 1 && { ref: this.lastProductElementRef })}
                                                              {...(this.props.leave_request?.data?.length === i + 1 && { 'data-lastitemid': f.leaveId })}
                                                              onClick={() => this.handleApproveRequest(f.leaveId, 'leave')}
                                                              sx={{
                                                                p: 1.5,
                                                                borderRadius: 1.5,
                                                                cursor: 'pointer',
                                                                bgcolor: isSelected ? 'action.selected' : 'background.paper',
                                                                boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.08)',
                                                                borderLeft: `3px solid ${getStatusColor(f.status)}`,
                                                                position: 'relative',
                                                                transition: 'all 0.15s ease',
                                                                '&:hover': { bgcolor: 'action.hover', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' },
                                                              }}
                                                            >
                                                              {isUnseen && (
                                                                <Box sx={{ position: 'absolute', left: -1, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                                                              )}
                                                              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                                                <Avatar sx={{ width: 36, height: 36, bgcolor: getAvatarColor(f.first_name), fontSize: 14, fontWeight: 600 }}>
                                                                  {getInitials(f.first_name, f.last_name)}
                                                                </Avatar>
                                                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                                    <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
                                                                      {(f.first_name || '') + (f.last_name ? ' ' + f.last_name : '')}
                                                                    </Typography>
                                                                    <StatusChip status={f.status} />
                                                                  </Stack>
                                                                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                                                                    {f.permission_type || f.leave_type || f.half_day || (f.request_type === 3 ? 'Attendance Correction' : f.request_type === 1 ? 'Leave' : f.request_type === 2 ? 'Permission' : f.request_type === 4 ? 'Half Day' : 'Request')}
                                                                  </Typography>
                                                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                    {f?.remarks ? this.DateWithDayMonthFormat(f.createdAt.split(' ')[0]) :
                                                                      (f.fromDate === f.toDate ? this.DateWithDayMonthFormat(f.fromDate) : this.DateWithDayMonthFormat(f.fromDate) + ' - ' + this.DateWithDayMonthFormat(f.toDate))
                                                                    }
                                                                  </Typography>
                                                                </Box>
                                                              </Stack>
                                                            </Box>
                                                          );
                                                        })}
                                                    </Stack>
                                                  </Box>
                                                :
                                                (
                                                    this.state.isApiFinished ?
                                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                                                            <Typography sx={{
                                                                fontSize: 13,
                                                                fontWeight: 400,
                                                                color: 'text.secondary',
                                                            }}>
                                                                {"No Record Found"}
                                                            </Typography>
                                                      </Box>
                                                      : ""
                                                )
                                                }
                                              </Card>
                                            </Grid>
                                            {this.props.leave_request?.data?.length > 0 ? this.props.leave_request?.data?.filter((f) => f.leaveId === this.state.id).map((f) => (

                                                <Grid
                                                    key={f.id}
                                                    size={{
                                                        lg: 8.5,
                                                        md: 8,
                                                        sm: 7,
                                                        xs: 12
                                                    }}>
                                                    <Card sx={{ borderRadius: 2, height: 'calc(100vh - 100px)', overflow: 'auto', ...scrollBar }}>
                                                    <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
                                                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Typography variant='h6' sx={{ fontWeight: 600 }}>{f.correction_type === 1 ? 'Correction Request' : f.request_type == 2 ? 'Time Off' : "Leave Request"}</Typography>
                                                        <StatusChip status={f.status} />
                                                      </Stack>
                                                    </Box>
                                                    <Divider />
                                                    <Box sx={{ p: 2.5 }}>
                                                        <Box width='100%'>
                                                            <RequestApprovalCard handleDelete={this.handleDelete} leave_request={this.props.leave_request.data} requestConfigSearch={this.props.requestConfigSearch} id={this.state.id} handleCancel={this.handleCancel} handleApprove={this.handleApprove} handleCorrect={this.handleCorrect} handleSetRequest={this.handleSetRequest} />
                                                            {
                                                                this.state.dialogOpen &&
                                                                <ConflictLeaveDialog openDialog={this.state.dialogOpen} handleDialogClose={this.handleDialogClose} handleCancel={this.handleCancel} handleConflictApprove={this.handleConflictApprove} handleConflictClose={this.handleConflictClose}/>
                                                            }
                                                        </Box>
                                                    </Box>
                                                    </Card>
                                                </Grid>
                                            )) : (
                                                this.state.isApiFinished ?
                                                    <Grid
                                                        display='flex'
                                                        alignItems='center'
                                                        justifyContent='center'
                                                        size={{
                                                            lg: 8.5,
                                                            md: 8,
                                                            sm: 7,
                                                            xs: 12
                                                        }}>
                                                        <Typography sx={{ fontSize: 13, fontWeight: 400, color: 'text.secondary', mt: 10 }}>
                                                            {"No Record Found"}
                                                        </Typography>
                                                    </Grid>
                                                    : ""
                                            )}
                                        </Grid>
                                    </div>
                                )}
                                 {tabIndex === 1 && (
                                    <div>
                                        <Grid container spacing={2} sx={{ py: 1.5, px: 0.25 }}>
                                            <Grid size={{ lg: 3.5, md: 4, sm: 5, xs: 12 }}>
                                              <Card sx={{ borderRadius: 2, height: 'calc(100vh - 100px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                                <Box sx={{ px: 0, pt: 0, pb: 0.5 }}>
                                                  <Tabs
                                                    value={tabIndex}
                                                    onChange={(e, v) => this.handleTabChange(null, v)}
                                                    variant="fullWidth"
                                                    sx={{
                                                      minHeight: 72,
                                                      '& .MuiTab-root': {
                                                        minHeight: 72,
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        fontSize: '13px',
                                                        color: 'text.primary',
                                                        '&.Mui-selected': { color: 'primary.main' },
                                                      },
                                                      '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
                                                    }}
                                                  >
                                                    <Tab icon={<ExitToAppIcon />} label="Requests" />
                                                    <Tab icon={<CreditScoreIcon />} label="Loans" />
                                                    <Tab icon={<DescriptionIcon />} label="Others" />
                                                  </Tabs>
                                                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5, px: 1.5 }}>
                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                      <IconButton size="small" onClick={() => this.handleShowPrev({ type: 'loan' })} disabled={this.state.page === 0}>
                                                        <ChevronLeftIcon fontSize="small" />
                                                      </IconButton>
                                                      <IconButton size="small" onClick={() => this.handleShowNext({ type: 'loan' })} disabled={!this.props.searchloandata?.data?.length || this.props.searchloandata?.data?.length < 15}>
                                                        <ChevronRightIcon fontSize="small" />
                                                      </IconButton>
                                                    </Stack>
                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                      <CommonToolTip title="Filter">
                                                        <IconButton size="small" onClick={() => this.setState({ isFilterDialogOpen: true })}>
                                                          <FilterAltIcon sx={{ fontSize: 20, color: 'grey.600' }} />
                                                        </IconButton>
                                                      </CommonToolTip>
                                                      {this.storage.role_name === "Administrator" &&
                                                        <Tooltip title={this.state.showUnseenLoans ? "View All" : "Unseen Loans"}>
                                                          <IconButton size="small" onClick={this.handleUnseenViewAllState}>
                                                            <Badge badgeContent={this.props.getUnseenCount[0]?.unseenLoanCount || 0} color="primary" max={99}
                                                              sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}>
                                                              {this.state.showUnseenLoans ? <VisibilityOffIcon sx={{ fontSize: 20 }} color="action" /> : <VisibilityIcon sx={{ fontSize: 20 }} color="action" />}
                                                            </Badge>
                                                          </IconButton>
                                                        </Tooltip>
                                                      }
                                                    </Stack>
                                                  </Stack>
                                                </Box>
                                                <Divider />
                                                {this.props.searchloandata?.data?.length > 0 ?
                                                  <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2.5, py: 2, ...scrollBar }}>
                                                    <Stack spacing={2}>
                                                      {this.props.searchloandata.data?.filter((f) => !this.state.showUnseenLoans || f.seen === 0)
                                                        .map((f, i) => {
                                                          const isSelected = this.state.loanId === f.id;
                                                          const isUnseen = f.seen === 0 && roleType.includes(this.storage.role_name);
                                                          const name = f.emp_name || f.full_name || '';
                                                          const nameParts = name.split(' ');
                                                          return (
                                                            <Box key={f.id}
                                                              {...(this.props.searchloandata?.data?.length === i + 1 && { ref: this.lastProductElementRef })}
                                                              {...(this.props.searchloandata?.data?.length === i + 1 && { 'data-lastitemid': f.id })}
                                                              onClick={() => this.handleApproveRequest(f.id, 'loan')}
                                                              sx={{
                                                                p: 1.5, borderRadius: 1.5, cursor: 'pointer',
                                                                bgcolor: isSelected ? 'action.selected' : 'background.paper',
                                                                boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.08)',
                                                                borderLeft: `3px solid ${getStatusColor(f.status)}`,
                                                                position: 'relative', transition: 'all 0.15s ease',
                                                                '&:hover': { bgcolor: 'action.hover', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' },
                                                              }}
                                                            >
                                                              {isUnseen && <Box sx={{ position: 'absolute', left: -1, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />}
                                                              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                                                <Avatar sx={{ width: 36, height: 36, bgcolor: getAvatarColor(nameParts[0]), fontSize: 14, fontWeight: 600 }}>
                                                                  {getInitials(nameParts[0], nameParts[1])}
                                                                </Avatar>
                                                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                                    <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
                                                                      {name}
                                                                    </Typography>
                                                                    <StatusChip status={f.status} />
                                                                  </Stack>
                                                                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>Loan Request</Typography>
                                                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{commonDateFormat(f.date)}</Typography>
                                                                </Box>
                                                              </Stack>
                                                            </Box>
                                                          );
                                                        })}
                                                    </Stack>
                                                  </Box>
                                                  :
                                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 400, color: 'text.secondary' }}>{"No Record Found"}</Typography>
                                                  </Box>
                                                }
                                              </Card>
                                            </Grid>
                                            {this.props.searchloandata?.data?.length > 0 ? this.props.searchloandata?.data?.filter((f) => f.id === this.state.loanId).map((f) => (
                                                <Grid key={f.id} size={{ lg: 8.5, md: 8, sm: 7, xs: 12 }}>
                                                    <Card sx={{ borderRadius: 2, height: 'calc(100vh - 100px)', overflow: 'auto', ...scrollBar }}>
                                                      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
                                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                          <Typography variant='h6' sx={{ fontWeight: 600 }}>{"Loan Request"}</Typography>
                                                          <StatusChip status={f.status} />
                                                        </Stack>
                                                      </Box>
                                                      <Divider />
                                                      <Box sx={{ p: 2.5 }}>
                                                        <Box width='100%'>
                                                            <LoanApprovalCard handleLoanDelete={this.handleLoanDelete} searchloandata={this.props.searchloandata.data} requestConfigSearch={this.props.requestConfigSearch} id={this.state.loanId} handleCancel={this.handleRejectLoan} handleApprove={this.handleApprovalLoan} />
                                                        </Box>
                                                      </Box>
                                                    </Card>
                                                </Grid>
                                            )) : (
                                                <Grid display='flex' alignItems='center' justifyContent='center' size={{ lg: 8.5, md: 8, sm: 7, xs: 12 }}>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 400, color: 'text.secondary', mt: 10 }}>{"No Record Found"}</Typography>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </div>
                                )}

                                {tabIndex === 2 && (
                                    <div>
                                        <Grid container spacing={2} sx={{ py: 1.5, px: 0.25 }}>
                                            <Grid size={{ lg: 3.5, md: 4, sm: 5, xs: 12 }}>
                                              <Card sx={{ borderRadius: 2, height: 'calc(100vh - 100px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                                <Box sx={{ px: 0, pt: 0, pb: 0.5 }}>
                                                  <Tabs
                                                    value={tabIndex}
                                                    onChange={(e, v) => this.handleTabChange(null, v)}
                                                    variant="fullWidth"
                                                    sx={{
                                                      minHeight: 72,
                                                      '& .MuiTab-root': {
                                                        minHeight: 72,
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        fontSize: '13px',
                                                        color: 'text.primary',
                                                        '&.Mui-selected': { color: 'primary.main' },
                                                      },
                                                      '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
                                                    }}
                                                  >
                                                    <Tab icon={<ExitToAppIcon />} label="Requests" />
                                                    <Tab icon={<CreditScoreIcon />} label="Loans" />
                                                    <Tab icon={<DescriptionIcon />} label="Others" />
                                                  </Tabs>
                                                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5, px: 1.5 }}>
                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                      <IconButton size="small" onClick={() => this.handleShowPrev({ type: 'claims' })} disabled={this.state.page === 0}>
                                                        <ChevronLeftIcon fontSize="small" />
                                                      </IconButton>
                                                      <IconButton size="small" onClick={() => this.handleShowNext({ type: 'claims' })} disabled={!this.props.searchClaim?.data?.length || this.props.searchClaim?.data?.length < 15}>
                                                        <ChevronRightIcon fontSize="small" />
                                                      </IconButton>
                                                    </Stack>
                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                      <CommonToolTip title="Filter">
                                                        <IconButton size="small" onClick={() => this.setState({ isFilterDialogOpen: true })}>
                                                          <FilterAltIcon sx={{ fontSize: 20, color: 'grey.600' }} />
                                                        </IconButton>
                                                      </CommonToolTip>
                                                      {this.storage.role_name === "Administrator" &&
                                                        <Tooltip title={this.state.showUnseenClaims ? "View All" : "Unseen Claims"}>
                                                          <IconButton size="small" onClick={this.handleUnseenViewAllState}>
                                                            <Badge badgeContent={this.props.getUnseenCount[0]?.unseenClaimsAndOthersCount || 0} color="primary" max={99}
                                                              sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}>
                                                              {this.state.showUnseenClaims ? <VisibilityOffIcon sx={{ fontSize: 20 }} color="action" /> : <VisibilityIcon sx={{ fontSize: 20 }} color="action" />}
                                                            </Badge>
                                                          </IconButton>
                                                        </Tooltip>
                                                      }
                                                    </Stack>
                                                  </Stack>
                                                </Box>
                                                <Divider />
                                                {this.props.searchClaim?.data?.length > 0 ?
                                                  <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2.5, py: 2, ...scrollBar }}>
                                                    <Stack spacing={2}>
                                                      {this.props.searchClaim?.data?.filter((f) => !this.state.showUnseenClaims || f.seen === 0)
                                                        .map((f, i) => {
                                                          const isSelected = this.state.claimAndOtherId === f.unique_key;
                                                          const isUnseen = f.seen === 0 && roleType.includes(this.storage.role_name);
                                                          const name = f.full_name || f.emp_name || '';
                                                          const nameParts = name.split(' ');
                                                          return (
                                                            <Box key={f.unique_key}
                                                              {...(this.props.searchClaim?.length === i + 1 && { ref: this.lastProductElementRef })}
                                                              {...(this.props.searchClaim?.length === i + 1 && { 'data-lastitemid': f.unique_key })}
                                                              onClick={() => this.handleApproveRequest(f.unique_key, 'claim', f)}
                                                              sx={{
                                                                p: 1.5, borderRadius: 1.5, cursor: 'pointer',
                                                                bgcolor: isSelected ? 'action.selected' : 'background.paper',
                                                                boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.08)',
                                                                borderLeft: `3px solid ${getStatusColor(f.status)}`,
                                                                position: 'relative', transition: 'all 0.15s ease',
                                                                '&:hover': { bgcolor: 'action.hover', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' },
                                                              }}
                                                            >
                                                              {isUnseen && <Box sx={{ position: 'absolute', left: -1, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />}
                                                              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                                                <Avatar sx={{ width: 36, height: 36, bgcolor: getAvatarColor(nameParts[0]), fontSize: 14, fontWeight: 600 }}>
                                                                  {getInitials(nameParts[0], nameParts[1])}
                                                                </Avatar>
                                                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                                    <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
                                                                      {name}
                                                                    </Typography>
                                                                    <StatusChip status={f.status} />
                                                                  </Stack>
                                                                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>{f.type === 'claims' ? 'Claim' : 'WFH Request'}</Typography>
                                                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{f?.remarks ? this.DateWithDayMonthFormat(f.createdAt.split(' ')[0]) : ''}</Typography>
                                                                </Box>
                                                              </Stack>
                                                            </Box>
                                                          );
                                                        })}
                                                    </Stack>
                                                  </Box>
                                                  :
                                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 400, color: 'text.secondary' }}>{"No Record Found"}</Typography>
                                                  </Box>
                                                }
                                              </Card>
                                            </Grid>
                                            {searchClaim?.data?.length > 0 ? this.props.searchClaim?.data?.filter((f) => (f.unique_key) === this.state.claimAndOtherId).map((f) => (
                                                <Grid key={f.unique_key} size={{ lg: 8.5, md: 8, sm: 7, xs: 12 }}>
                                                    <Card sx={{ borderRadius: 2, height: 'calc(100vh - 100px)', overflow: 'auto', ...scrollBar }}>
                                                      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
                                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                          <Typography variant='h6' sx={{ fontWeight: 600 }}>{"Other Request"}</Typography>
                                                          <StatusChip status={f.status} />
                                                        </Stack>
                                                      </Box>
                                                      <Divider />
                                                      <Box sx={{ p: 2.5 }}>
                                                        <Box width='100%'>
                                                            <ClaimApprovalCard handleClaimDelete={this.handleClaimDelete} searchClaim={this.props.searchClaim}
                                                                id={this.state.claimAndOtherId}
                                                                requestConfigSearch={this.props.requestConfigSearch}
                                                            />
                                                        </Box>
                                                      </Box>
                                                    </Card>
                                                </Grid>
                                            )) : (
                                                <Grid display='flex' alignItems='center' justifyContent='center' size={{ lg: 8.5, md: 8, sm: 7, xs: 12 }}>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 400, color: 'text.secondary', mt: 10 }}>{"No Record Found"}</Typography>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </div>
                                )}
                                </>
                               }
{this.storage.company_type == 2 &&
    <>
        {tabIndex === 0 && (
            <div>
                <Grid container display='flex' flexDirection='row' spacing={3} p='6px 10px'  style={{minHeight:`calc(${maxHeight} - 20px)`,maxHeight:`calc(${maxHeight} - 20px)`}}>
                    <Grid
                        style={{
                            // boxShadow: '0 0 0 0.25px #d9dadc'
                            borderRight: '2px #d9dadc solid',
                            marginTop: '5px'

                        }}
                        size={{
                            lg: 3.5,
                            md: 4,
                            sm: 5,
                            xs: 12
                        }}>
                            <Card>
                          <Grid container spacing={3} alignItems='center' p={3} height='calc(100vh - 80px)' style={{ overflow: 'auto' }} sx={{ ...scrollBar }}>

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
                                    <Tab icon={<ExitToAppIcon style={{ color: 'black' }} />} label="PosRequests" sx={{ fontSize: '12px', fontWeight: 600 }} />
                                    <Tab icon={<ExitToAppIcon style={{ color: 'black' }} />} label="Quotation" sx={{ fontSize: '12px', fontWeight: 600 }} />

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
                                    <Grid container>
                                        <Grid container size={6}>
                                            <Grid>
                                                <Button
                                                    onClick={() => { this.handleShowPrev({ type: 'discount' }) }}
                                                    style={{ cursor: 'pointer', transition: 'color 0.3s ease, transform 0.3s ease', }}
                                                    variant='outlined'
                                                    disabled={this.state.page === 0}
                                                >
                                                    <ArrowLeftRoundedIcon color="black" />
                                                </Button>
                                            </Grid>
                                            <Grid>
                                                <Button
                                                    onClick={() => { this.handleShowNext({ type: 'discount' }) }}
                                                    style={{ cursor: 'pointer', transition: 'color 0.3s ease, transform 0.3s ease', }}
                                                    variant='outlined'
                                                    disabled={!this.props.pos_request?.data?.length || 
                                                        this.props.pos_request?.data?.length < 15 || 
                                                        (this.state.showUnseenRequests && this.props.pos_request?.data?.filter((f) => f.seen === 0).length < 15)
                                                    }
                                                >
                                                    <ArrowRightRoundedIcon color="black" />
                                                </Button>
                                            </Grid>
                                        </Grid>
                                        <Grid size={6}>
                                            <Box flexGrow={1} />
                                            <Stack direction="row" display='flex' justifyContent='end' alignItems="right">
                                                <CommonToolTip title="Filter">
                                                    <IconButton onClick={() => this.setState({ isFilterDialogOpen: true })}>
                                                        <FilterAltIcon style={{ color: 'gray' }} />
                                                    </IconButton>
                                                </CommonToolTip>
                                                {this.storage.role_name === "Administrator" &&
                                                    <stack direction='row' alignItems='center' spacing={0}>
                                                        <Tooltip title={this.state.showUnseenRequests ? "View All" : "Unseen Requests"}>
                                                            <IconButton onClick={this.handleUnseenViewAllState}>
                                                                {this.state.showUnseenRequests ? (
                                                                    <VisibilityOffIcon color="action" />
                                                                ) : (
                                                                    <VisibilityIcon color="action" />
                                                                )}
                                                                {this.props.pos_request?.unseenCount?.[0]?.unseenCount > 0 && (
                                                                    <Typography variant="body2" style={{ color: 'black', fontWeight: 'bold' }} sx={{ ml: 2 }} >
                                                                        {this.props.pos_request.unseenCount[0].unseenCount}
                                                                    </Typography>
                                                                )}
                                                            </IconButton>
                                                        </Tooltip>
                                                    </stack>
                                                }

                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </Grid>



                            {this.props.pos_request?.data?.length > 0 ?
                                (<Grid
                                style={{ display: 'flex', width: '100%', minHeight: '100%' }}
                                size={{
                                    lg: 12,
                                    md: 12,
                                    sm: 12,
                                    xs: 12
                                }}>
                                    <Box sx={{ height: parseInt(this.state.windowHeight) - (parseInt(this.state.toolbarHeight) + 150), width: '100%' }}>
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
                                                            {this.props.pos_request?.data?.filter((f) => !this.state.showUnseenRequests || f.seen === 0).length > 0 ? (
                                                                this.props.pos_request?.data?.filter((f) => !this.state.showUnseenRequests || f.seen === 0)
                                                            .map((f, i) => {
                                                                return (
                                                                    <ListItem
                                                                        key={f.id}
                                                                        // sx={{ pl: '6px' }}
                                                                        {...(this.props.pos_request?.data?.length === i + 1 && { ref: this.lastProductElementRef })}
                                                                        {...(this.props.pos_request?.data?.length === i + 1 && { 'data-lastitemid': f.id })}
                                                                    >
                                                                        <ListItemButton selected={this.state.id === f.id} onClick={() => this.handleApproveRequest(f.id, 'posrequest')}>
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
                                                                                            fontWeight:
                                                                                                f.seen === 0 && roleType.includes(this.storage.role_name)
                                                                                                    ? 'bold'
                                                                                                    : 'normal',
                                                                                            textTransform: 'capitalize'
                                                                                        }}
                                                                                    >
                                                                                        {this.poshandleStatus(f.status, f.approvedBy, f.cancelledBy, f)}
                                                                                    </Typography>

                                                                                }
                                                                                secondary={
                                                                                    <Typography
                                                                                        style={{ fontWeight: f.seen === 0 && roleType.includes(this.storage.role_name) ? 'bold' : 'normal' }}
                                                                                    >
                                                                                        {f.type === 'discount' && "Dicount For Sale"}
                                                                                        {f?.remarks && this.DateWithDayMonthFormat(f.createdAt.split(' ')[0])}
                                                                                        <span style={{ display: "flex", justifyContent: "end" }}>
                                                                                            {this.statusIconAndColor(f.status)}
                                                                                        </span>
                                                                                    </Typography>
                                                                                } />
                                                                        </ListItemButton>

                                                                    </ListItem>
                                                                )
                                                            }) 
                                                        ) : (
                                                            <Grid style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                                                                <Box sx={{ height: parseInt(this.state.windowHeight) - (parseInt(this.state.toolbarHeight) + 150) }}>
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
                                                                        <Typography sx={{ fontSize: 13, fontWeight: 400 }}>
                                                                            {"No Record Found"}
                                                                        </Typography>
                                                                    </Grid>
                                                                </Box>
                                                            </Grid>
                                                        )}

                                                    </List>


                                                </nav>
                                            </Box>
                                        </Grid>
                                    </Box>
                                </Grid>
                                ) :
                                (
                                    this.state.isApiFinished ? (
                                        <Grid style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                                            <Box sx={{ height: parseInt(this.state.windowHeight) - (parseInt(this.state.toolbarHeight) + 150) }}>
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

                                                                ) : ""
                                                            )}
                        </Grid>
                        </Card>
                    </Grid>
                    {this.props.pos_request?.data?.length > 0 ? 
    this.props.pos_request?.data?.filter((f) => (!this.state.showUnseenRequests || f.seen === 0) && f.id === this.state.id).length > 0 ?
        this.props.pos_request?.data?.filter((f) => (!this.state.showUnseenRequests || f.seen === 0) && f.id === this.state.id).map((f) => (

            <Grid
                size={{
                    xs: 12,
                    md: 8.5,
                    lg: 8.5
                }}>
                <Card sx={{ height: '100%', width: '100%' }}>
                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <Grid container spacing={3} display='flex' alignItems='center' p={3}>
                                <Grid
                                    size={{
                                        lg: 6,
                                        md: 6,
                                        sm: 6,
                                        xs: 6
                                    }}>
                                    <Typography variant='h6' align='left' sx={{ fontFamily: 'Poppins, sans-serif' }} style={{}}>{f.type === 'discount' && 'Pos Dicount Sale'}</Typography>
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
                        </Grid>

                        <Box>
                                    <RequestApprovalCard handleDelete={this.handleDelete} leave_request={this.props.pos_request.data} requestConfigSearch={this.props.requestConfigSearch} id={this.state.id} handleCancel={this.handleCancel} handleApprove={this.handleApprove} handleCorrect={this.handleCorrect} type={this.state.type}/>
                                    {/* {
                                this.state.dialogOpen &&
                                <ConflictLeaveDialog openDialog={this.state.dialogOpen} handleDialogClose={this.handleDialogClose} handleCancel={this.handleCancel} handleConflictApprove={this.handleConflictApprove} />
                                // <SimpleDialogDemo />
                            } */}
                             </Box>
                    </Grid>
                </Card>
            </Grid>
                    ))  : (
                        this.state.isApiFinished ? 
                                                            <Grid
                                                                size={{
                                                                    xs: 12,
                                                                    md: 8.5,
                                                                    lg: 8.5
                                                                }}>
                                                                <Card sx={{ height: '100%', width: '100%' }}>
                                                                    <Grid
                                                                        display='flex'
                                                                        alignItems='center'
                                                                        justifyContent='center'
                                                                        minHeight={'calc(100vh - 230px)'}
                                                                        size={{
                                                                            lg: 12,
                                                                            md: 12,
                                                                            sm: 12,
                                                                            xs: 12
                                                                        }}>
                                                                        <Typography sx={{ fontSize: '13px', fontWeight: 400 }}>
                                                                            No Record Found
                                                                        </Typography>
                                                                    </Grid>
                                                                </Card>
                                                            </Grid>
                        : null
                    )
                : (
                        this.state.isApiFinished ?

                                                        <Grid
                                                            size={{
                                                                lg: 8,
                                                                md: 8,
                                                                sm: 7,
                                                                xs: 12
                                                            }}>
                                                            <Card sx={{ height: '100%', width: '100%' }}>
                                                                <Grid
                                                                    display='flex'
                                                                    alignItems='center'
                                                                    justifyContent='center'
                                                                    minHeight={'calc(100vh - 230px)'}
                                                                    size={{
                                                                        lg: 12,
                                                                        md: 12,
                                                                        sm: 12,
                                                                        xs: 12
                                                                    }}>
                                                                    <Typography sx={{ fontSize: '13px', fontWeight: 400 }}>
                                                                        No Record Found
                                                                    </Typography>
                                                                </Grid>
                                                            </Card>
                                                        </Grid>

                            :
                            ""
                    )}
                </Grid>
            </div>
        )}

    {tabIndex == 1 && (
            <div>
                <Grid container display='flex' flexDirection='row' spacing={3} p='6px 10px'  style={{minHeight:`calc(${maxHeight} - 20px)`,maxHeight:`calc(${maxHeight} - 20px)`}}>
                    <Grid
                        style={{
                            // boxShadow: '0 0 0 0.25px #d9dadc'
                            borderRight: '2px #d9dadc solid',
                            marginTop: '5px'

                        }}
                        size={{
                            lg: 3.5,
                            md: 4,
                            sm: 5,
                            xs: 12
                        }}>
                            <Card>
                          <Grid container spacing={3} alignItems='center' p={3} height='calc(100vh - 80px)' style={{ overflow: 'auto' }} sx={{ ...scrollBar }}>

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
                                    <Tab icon={<ExitToAppIcon style={{ color: 'black' }} />} label="PosRequests" sx={{ fontSize: '12px', fontWeight: 600 }} />
                                    <Tab icon={<ExitToAppIcon style={{ color: 'black' }} />} label="Quotation" sx={{ fontSize: '12px', fontWeight: 600 }} />

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
                                    <Grid container>
                                        <Grid container size={6}>
                                            <Grid>
                                                <Button
                                                    onClick={() => { this.handleShowPrev({ type: 'discount' }) }}
                                                    style={{ cursor: 'pointer', transition: 'color 0.3s ease, transform 0.3s ease', }}
                                                    variant='outlined'
                                                    disabled={this.state.page === 0}
                                                >
                                                    <ArrowLeftRoundedIcon color="black" />
                                                </Button>
                                            </Grid>
                                            <Grid>
                                                <Button
                                                    onClick={() => { this.handleShowNext({ type: 'quotation' }) }}
                                                    style={{ cursor: 'pointer', transition: 'color 0.3s ease, transform 0.3s ease', }}
                                                    variant='outlined'
                                                                                disabled={
                                                                                    !this.props.quotationApprovals?.length ||
                                                                                    this.props.quotationApprovals?.length < 15 ||
                                                                                    (this.state.showUnseenRequests && this.props.quotationApprovals?.filter((f) => f.seen === 0).length < 15)
                                                                                }
                                                >
                                                    <ArrowRightRoundedIcon color="black" />
                                                </Button>
                                            </Grid>
                                        </Grid>
                                        <Grid size={6}>
                                            <Box flexGrow={1} />
                                            <Stack direction="row" display='flex' justifyContent='end' alignItems="right">
                                                <CommonToolTip title="Filter">
                                                    <IconButton onClick={() => this.setState({ isFilterDialogOpen: true })}>
                                                        <FilterAltIcon style={{ color: 'gray' }} />
                                                    </IconButton>
                                                </CommonToolTip>
                                                {this.storage.role_name === "Administrator" &&
                                                    <stack direction='row' alignItems='center' spacing={0}>
                                                        <Tooltip title={this.state.showUnseenRequests ? "View All" : "Unseen Requests"}>
                                                            <IconButton onClick={this.handleUnseenViewAllState}>
                                                                {this.state.showUnseenRequests ? (
                                                                    <VisibilityOffIcon color="action" />
                                                                ) : (
                                                                    <VisibilityIcon color="action" />
                                                                )}
                                                                                            {this.props.quotationUnseenCount?.[0]?.unseenCount > 0 && (
                                                                                                <Typography variant="body2" style={{ color: 'black', fontWeight: 'bold' }} sx={{ ml: 2 }} >
                                                                                                    {this.props.quotationUnseenCount[0].unseenCount}
                                                                                                </Typography>
                                                                                            )}
                                                            </IconButton>
                                                        </Tooltip>
                                                    </stack>
                                                }

                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </Grid>



                                 {this.props.quotationApprovals?.length > 0 ? (
                                <Grid
                                    style={{ display: 'flex', width: '100%', minHeight: '100%' }}
                                    size={{
                                        lg: 12,
                                        md: 12,
                                        sm: 12,
                                        xs: 12
                                    }}>
                                    <Box sx={{ height: parseInt(this.state.windowHeight) - (parseInt(this.state.toolbarHeight) + 150), width: '100%' }}>
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
                                                            {this.props.quotationApprovals?.data?.filter((f) => !this.state.showUnseenRequests || f.seen === 0).length > 0 ? (
                                                                this.props.quotationApprovals?.data?.filter((f) => !this.state.showUnseenRequests || f.seen === 0)
                                                            .map((f, i) => {
                                                                return (
                                                                    <ListItem
                                                                        key={f.id}
                                                                        // sx={{ pl: '6px' }}
                                                                        {...(this.props.quotationApprovals?.data?.length === i + 1 && { ref: this.lastProductElementRef })}
                                                                        {...(this.props.quotationApprovals?.data?.length === i + 1 && { 'data-lastitemid': f.id })}
                                                                    >
                                                                        <ListItemButton selected={this.state.id === f.id} onClick={() => this.handleApproveRequest(f.id, 'posrequest')}>
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
                                                                                            fontWeight:
                                                                                                f.seen === 0 && roleType.includes(this.storage.role_name)
                                                                                                    ? 'bold'
                                                                                                    : 'normal',
                                                                                            textTransform: 'capitalize'
                                                                                        }}
                                                                                    >
                                                                                        {this.poshandleStatus(f.status, f.approvedBy, f.cancelledBy, f)}
                                                                                    </Typography>

                                                                                }
                                                                                secondary={
                                                                                    <Typography
                                                                                        style={{ fontWeight: f.seen === 0 && roleType.includes(this.storage.role_name) ? 'bold' : 'normal' }}
                                                                                    >
                                                                                        {f.type === 'discount' && "Dicount For Sale"}
                                                                                        {f?.remarks && this.DateWithDayMonthFormat(f.createdAt.split(' ')[0])}
                                                                                        <span style={{ display: "flex", justifyContent: "end" }}>
                                                                                            {this.statusIconAndColor(f.status)}
                                                                                        </span>
                                                                                    </Typography>
                                                                                } />
                                                                        </ListItemButton>

                                                                    </ListItem>
                                                                )
                                                            }) 
                                                        ) : (
                                                            <Grid style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                                                                <Box sx={{ height: parseInt(this.state.windowHeight) - (parseInt(this.state.toolbarHeight) + 150) }}>
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
                                                                        <Typography sx={{ fontSize: 13, fontWeight: 400 }}>
                                                                            {"No Record Found"}
                                                                        </Typography>
                                                                    </Grid>
                                                                </Box>
                                                            </Grid>
                                                        )}

                                                    </List>


                                                </nav>
                                            </Box>
                                        </Grid>
                                    </Box>
                                </Grid>
                                ) :
                                (
                                    this.state.isApiFinished ? (
                                        <Grid style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                                            <Box sx={{ height: parseInt(this.state.windowHeight) - (parseInt(this.state.toolbarHeight) + 150) }}>
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

                                                                ) : ""
                                                            )}
                        </Grid>
                        </Card>
                    </Grid>
                                            {this.props.quotationApprovals?.data?.length > 0 ?
                                                this.props.quotationApprovals?.data?.filter((f) => (!this.state.showUnseenRequests || f.seen === 0) && f.id === this.state.id).length > 0 ?
                                                    this.props.quotationApprovals?.data?.filter((f) => (!this.state.showUnseenRequests || f.seen === 0) && f.id === this.state.id).map((f) => (

                                                        <Grid
                                                            size={{
                                                                xs: 12,
                                                                md: 8.5,
                                                                lg: 8.5
                                                            }}>
                                                            <Card sx={{ height: '100%', width: '100%' }}>
                                                                <Grid
                                                                    size={{
                                                                        lg: 12,
                                                                        md: 12,
                                                                        sm: 12,
                                                                        xs: 12
                                                                    }}>
                                                                    <Grid container spacing={3} display='flex' alignItems='center' p={3}>
                                                                        <Grid
                                                                            size={{
                                                                                lg: 6,
                                                                                md: 6,
                                                                                sm: 6,
                                                                                xs: 6
                                                                            }}>
                                                                            <Typography variant='h6' align='left' sx={{ fontFamily: 'Poppins, sans-serif' }} style={{}}>{f.type === 'discount' && 'Pos Dicount Sale'}</Typography>
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
                                                                    </Grid>

                                                                    <Box>
                                                                        <QuotationApprovals
                                                                            showUnseenRequests={this.state.showUnseenRequests}
                                                                            quotationApprovals={this.props.quotationApprovals}
                                                                        />
                                                                        {/* {
                                this.state.dialogOpen &&
                                <ConflictLeaveDialog openDialog={this.state.dialogOpen} handleDialogClose={this.handleDialogClose} handleCancel={this.handleCancel} handleConflictApprove={this.handleConflictApprove} />
                                // <SimpleDialogDemo />
                            } */}
                                                                    </Box>
                                                                </Grid>
                                                            </Card>
                                                        </Grid>
                                                    )) : (
                                                        this.state.isApiFinished ?
                                                            <Grid
                                                                size={{
                                                                    lg: 8,
                                                                    md: 8,
                                                                    sm: 7,
                                                                    xs: 12
                                                                }}>
                                                                <Card sx={{ height: '100%', width: '100%' }}>
                                                                    <Grid
                                                                        display='flex'
                                                                        alignItems='center'
                                                                        justifyContent='center'
                                                                        minHeight={'calc(100vh - 230px)'}
                                                                        size={{
                                                                            lg: 12,
                                                                            md: 12,
                                                                            sm: 12,
                                                                            xs: 12
                                                                        }}>
                                                                        <Typography sx={{ fontSize: '13px', fontWeight: 400 }}>
                                                                            No Record Found
                                                                        </Typography>
                                                                    </Grid>
                                                                </Card>
                                                            </Grid>
                                                            : null
                                                    )
                                                : (
                                                    this.state.isApiFinished ?

                                                        <Grid
                                                            size={{
                                                                lg: 8,
                                                                md: 8,
                                                                sm: 7,
                                                                xs: 12
                                                            }}>
                                                            <Card sx={{ height: '100%', width: '100%' }}>
                                                                <Grid
                                                                    display='flex'
                                                                    alignItems='center'
                                                                    justifyContent='center'
                                                                    minHeight={'calc(100vh - 230px)'}
                                                                    size={{
                                                                        lg: 12,
                                                                        md: 12,
                                                                        sm: 12,
                                                                        xs: 12
                                                                    }}>
                                                                    <Typography sx={{ fontSize: '13px', fontWeight: 400 }}>
                                                                        No Record Found
                                                                    </Typography>
                                                                </Grid>
                                                            </Card>
                                                        </Grid>

                                                        :
                                                        ""
                                                )}
                                        </Grid>
                                    </div>
                                )}

{/* {tabIndex === 1 && (
  <div>
    <Grid container display='flex' flexDirection='row' spacing={3} p='6px 10px' style={{ minHeight: `calc(${maxHeight} - 20px)`, maxHeight: `calc(${maxHeight} - 20px)` }}>
      <Grid size={{ xs: 12, sm: 5, md: 4, lg: 3.5 }} style={{ borderRight: '2px #d9dadc solid', marginTop: '5px' }}>
        <Card>
          <Grid container spacing={3} alignItems='center' p={3} height='calc(100vh - 80px)' style={{ overflow: 'auto' }} sx={{ ...scrollBar }}>
            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <Tabs
                value={tabIndex}
                onChange={this.handleTabChange}
                variant="fullWidth"
                aria-label="tabs example"
                sx={{ fontFamily: 'Poppins, sans-serif' }}>
                <Tab icon={<ExitToAppIcon style={{ color: 'black' }} />} label="PosRequests" sx={{ fontSize: '12px', fontWeight: 600 }} />
                <Tab icon={<ExitToAppIcon style={{ color: 'black' }} />} label="Quotation" sx={{ fontSize: '12px', fontWeight: 600 }} />
              </Tabs>
            </Grid>
            <Grid size={{ xs: 12, md: 12 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="left" spacing={1}
                sx={{
                  flexWrap: { xs: 'wrap', sm: "wrap", md: 'nowrap', lg: 'nowrap' }
                }}>
                <Grid container>
                  <Grid size={6} container>
                    <Grid>
                      <Button
                        onClick={() => { this.handleShowPrev({ type: 'quotation' }) }}
                        style={{ cursor: 'pointer', transition: 'color 0.3s ease, transform 0.3s ease', }}
                        variant='outlined'
                        disabled={this.state.page === 0}
                      >
                        <ArrowLeftRoundedIcon color="black" />
                      </Button>
                    </Grid>
                    <Grid>
                      <Button
                        onClick={() => { this.handleShowNext({ type: 'quotation' }) }}
                        style={{ cursor: 'pointer', transition: 'color 0.3s ease, transform 0.3s ease', }}
                        variant='outlined'
                        disabled={
                          !this.props.quotationApprovals?.length ||
                          this.props.quotationApprovals?.length < 15 ||
                          (this.state.showUnseenRequests && this.props.quotationApprovals?.filter((f) => f.seen === 0).length < 15)
                        }
                      >
                        <ArrowRightRoundedIcon color="black" />
                      </Button>
                    </Grid>
                  </Grid>
                  <Grid size={6}>
                    <Box flexGrow={1} />
                    <Stack direction="row" display='flex' justifyContent='end' alignItems="right">
                      <CommonToolTip title="Filter">
                        <IconButton onClick={() => this.setState({ isFilterDialogOpen: true })}>
                          <FilterAltIcon style={{ color: 'gray' }} />
                        </IconButton>
                      </CommonToolTip>
                      {this.storage.role_name === "Administrator" &&
                        <Stack direction='row' alignItems='center' spacing={0}>
                          <Tooltip title={this.state.showUnseenRequests ? "View All" : "Unseen Requests"}>
                            <IconButton onClick={this.handleUnseenViewAllState}>
                              {this.state.showUnseenRequests ? (
                                <VisibilityOffIcon color="action" />
                              ) : (
                                <VisibilityIcon color="action" />
                              )}
                              {this.props.quotationUnseenCount?.[0]?.unseenCount > 0 && (
                                <Typography variant="body2" style={{ color: 'black', fontWeight: 'bold' }} sx={{ ml: 2 }} >
                                  {this.props.quotationUnseenCount[0].unseenCount}
                                </Typography>
                              )}
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      }
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            </Grid>

            {this.props.quotationApprovals?.length > 0 ? (
              <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} style={{ display: 'flex', width: '100%', minHeight: '100%' }}>
                <Box sx={{ height: parseInt(this.state.windowHeight) - (parseInt(this.state.toolbarHeight) + 150), width: '100%' }}>
                  <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} style={{ height: '100%', flexGrow: '1', overflow: 'auto' }} display='flex' alignItems='flex-start' justifyContent='flex-start' sx={{ ...scrollBar }}>
                    <Box sx={{ width: '100%' }}>
                      <QuotationApprovals
                        showUnseenRequests={this.state.showUnseenRequests}
                        quotationApprovals={this.props.quotationApprovals}
                      />
                    </Box>
                  </Grid>
                </Box>
              </Grid>
            ) : (
              this.state.isApiFinished && (
                <Grid style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                  <Box sx={{ height: parseInt(this.state.windowHeight) - (parseInt(this.state.toolbarHeight) + 150) }}>
                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} style={{ height: '100%', flexGrow: '1' }} display='flex' alignItems='center' justifyContent='center'>
                      <Typography sx={{ fontSize: 13, fontWeight: 400 }}>
                        {"No Record Found"}
                      </Typography>
                    </Grid>
                  </Box>
                </Grid>
              )
            )}
          </Grid>
        </Card>
      </Grid>
    </Grid>
  </div>
)} */}

        {/* </Card> */}
    </>
}
{this.storage.company_type == 10  && 
    tabIndex == 0 && <>
 {this.props.quotationApprovals ? <div>
            <Grid container display='flex' flexDirection='row' spacing={3} p='6px 10px'>
                <Grid
                    style={{
                        // boxShadow: '0 0 0 0.25px #d9dadc'
                        borderRight: '2px #d9dadc solid',
                        marginTop: '5px'

                    }}
                    size={{
                        lg: 3.5,
                        md: 4,
                        sm: 5,
                        xs: 12
                    }}>
                    <Grid container spacing={3} display='flex' direction={'row'} >

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
                            <Tab icon={<ExitToAppIcon style={{ color: 'black' }} />} label="Quotation" sx={{ fontSize: '12px', fontWeight: 600 }} />
                            </Tabs>
                    </Grid>
                    
                    </Grid>
                </Grid>
            </Grid>        
            <QuotationApprovals 
                showUnseenRequests={this.state.showUnseenRequests} 
            >
                    </QuotationApprovals> 
 </div> :  <div>
                <Grid container display='flex' flexDirection='row' spacing={3} p='6px 10px'>
                    <Grid
                        style={{
                            // boxShadow: '0 0 0 0.25px #d9dadc'
                            borderRight: '2px #d9dadc solid',
                            marginTop: '5px'

                        }}
                        size={{
                            lg: 3.5,
                            md: 4,
                            sm: 5,
                            xs: 12
                        }}>
                        <Grid container spacing={3} display='flex' direction={'row'} >

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
                                    
                                    <Tab icon={<ExitToAppIcon style={{ color: 'black' }} />} label="Quotation" sx={{ fontSize: '12px', fontWeight: 600 }} />

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
                                    <Grid container>
                                        <Grid container size={6}>
                                            <Grid>
                                                <Button
                                                    onClick={() => { this.handleShowPrev({ type: 'discount' }) }}
                                                    style={{ cursor: 'pointer', transition: 'color 0.3s ease, transform 0.3s ease', }}
                                                    variant='outlined'
                                                    disabled={this.state.page === 0 || (this.state.showUnseenRequests && this.props.pos_request?.data?.filter((f) => f.seen === 0).length < 15)}
                                                >
                                                    <ArrowLeftRoundedIcon color="black" />
                                                </Button>
                                            </Grid>
                                            <Grid>
                                                <Button
                                                    onClick={() => { this.handleShowNext({ type: 'discount' }) }}
                                                    style={{ cursor: 'pointer', transition: 'color 0.3s ease, transform 0.3s ease', }}
                                                    variant='outlined'
                                                    disabled={!this.props.pos_request?.data?.length || this.props.pos_request?.data?.length < 15 || (this.state.showUnseenRequests && this.props.pos_request?.data?.filter((f) => f.seen === 0).length < 15)}
                                                >
                                                    <ArrowRightRoundedIcon color="black" />
                                                </Button>
                                            </Grid>
                                        </Grid>
                                        <Grid size={6}>
                                            <Box flexGrow={1} />
                                            <Stack direction="row" display='flex' justifyContent='end' alignItems="right">
                                                <CommonToolTip title="Filter">
                                                    <IconButton onClick={() => this.setState({ isFilterDialogOpen: true })}>
                                                        <FilterAltIcon style={{ color: 'gray' }} />
                                                    </IconButton>
                                                </CommonToolTip>
                                                {this.storage.role_name === "Administrator" &&
                                                    <stack direction='row' alignItems='center' spacing={0}>
                                                        <Tooltip title={this.state.showUnseenRequests ? "View All" : "Unseen Requests"}>
                                                            <IconButton onClick={this.handleUnseenViewAllState}>
                                                                {this.state.showUnseenRequests ? (
                                                                    <VisibilityOffIcon color="action" />
                                                                ) : (
                                                                    <VisibilityIcon color="action" />
                                                                )}
                                                                {this.props.pos_request?.unseenCount?.[0]?.unseenCount > 0 && (
                                                                    <Typography variant="body2" style={{ color: 'black', fontWeight: 'bold' }} sx={{ ml: 2 }} >
                                                                        {this.props.pos_request.unseenCount[0].unseenCount}
                                                                    </Typography>
                                                                )}
                                                            </IconButton>
                                                        </Tooltip>
                                                    </stack>
                                                }

                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </Grid>

                                   { this.state.isApiFinished ?

                                        <Grid style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                                            <Box sx={{ height: parseInt(this.state.windowHeight) - (parseInt(this.state.toolbarHeight) + 150) }}>
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
                                     }
                                
                            
                        </Grid>
                    </Grid>
                  
                </Grid>
            </div>}
    </>
}

{this.storage.company_type == 3  && 
    tabIndex == 0 && <>
 {this.props.quotationApprovals ? <div>
    
            {/* <Grid container display='flex' flexDirection='row' spacing={3} p='6px 10px'>
                <Grid size={{ xs: 12, sm: 5, md: 4, lg: 3.5 }}>
                    <Grid container spacing={3} display='flex' direction={'row'} >

                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>

                        <Tabs
                            value={tabIndex}
                            onChange={this.handleTabChange}
                            variant="fullWidth"
                            aria-label="tabs example"
                            sx={{ fontFamily: 'Poppins, sans-serif' }}>
                            <Tab icon={<ExitToAppIcon style={{ color: 'black' }} />} label="Approvals" sx={{ fontSize: '12px', fontWeight: 600 }} />
                            </Tabs>
                    </Grid>
                    
                    </Grid>
                </Grid>
            </Grid>         */}
            <SalesApprovals 
                showUnseenRequests={this.state.showUnseenRequests} 
                tabIndex={tabIndex}
                handleTabChange={this.handleTabChange}        
            >
                    </SalesApprovals> 
 </div> : 
  <div>
                <Grid container display='flex' flexDirection='row' spacing={3} p='6px 10px'>
                    <Grid
                        style={{
                            // boxShadow: '0 0 0 0.25px #d9dadc'
                            borderRight: '2px #d9dadc solid',
                            marginTop: '5px'

                        }}
                        size={{
                            lg: 3.5,
                            md: 4,
                            sm: 5,
                            xs: 12
                        }}>
                        <Grid container spacing={3} display='flex' direction={'row'} >

                            <Grid
                                size={{
                                    md: 12,
                                    xs: 12
                                }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="left" spacing={1}
                                    sx={{
                                        flexWrap: { xs: 'wrap', sm: "wrap", md: 'nowrap', lg: 'nowrap' }
                                    }}>
                                    <Grid container>
                                        <Grid container size={6}>
                                            <Grid>
                                                <Button
                                                    onClick={() => { this.handleShowPrev({ type: 'discount' }) }}
                                                    style={{ cursor: 'pointer', transition: 'color 0.3s ease, transform 0.3s ease', }}
                                                    variant='outlined'
                                                    disabled={this.state.page === 0 || (this.state.showUnseenRequests && this.props.pos_request?.data?.filter((f) => f.seen === 0).length < 15)}
                                                >
                                                    <ArrowLeftRoundedIcon color="black" />
                                                </Button>
                                            </Grid>
                                            <Grid>
                                                <Button
                                                    onClick={() => { this.handleShowNext({ type: 'discount' }) }}
                                                    style={{ cursor: 'pointer', transition: 'color 0.3s ease, transform 0.3s ease', }}
                                                    variant='outlined'
                                                    disabled={!this.props.pos_request?.data?.length || this.props.pos_request?.data?.length < 15 || (this.state.showUnseenRequests && this.props.pos_request?.data?.filter((f) => f.seen === 0).length < 15)}
                                                >
                                                    <ArrowRightRoundedIcon color="black" />
                                                </Button>
                                            </Grid>
                                        </Grid>
                                        <Grid size={6}>
                                            <Box flexGrow={1} />
                                            <Stack direction="row" display='flex' justifyContent='end' alignItems="right">
                                                <CommonToolTip title="Filter">
                                                    <IconButton onClick={() => this.setState({ isFilterDialogOpen: true })}>
                                                        <FilterAltIcon style={{ color: 'gray' }} />
                                                    </IconButton>
                                                </CommonToolTip>
                                                {this.storage.role_name === "Administrator" &&
                                                    <stack direction='row' alignItems='center' spacing={0}>
                                                        <Tooltip title={this.state.showUnseenRequests ? "View All" : "Unseen Requests"}>
                                                            <IconButton onClick={this.handleUnseenViewAllState}>
                                                                {this.state.showUnseenRequests ? (
                                                                    <VisibilityOffIcon color="action" />
                                                                ) : (
                                                                    <VisibilityIcon color="action" />
                                                                )}
                                                                {this.props.pos_request?.unseenCount?.[0]?.unseenCount > 0 && (
                                                                    <Typography variant="body2" style={{ color: 'black', fontWeight: 'bold' }} sx={{ ml: 2 }} >
                                                                        {this.props.pos_request.unseenCount[0].unseenCount}
                                                                    </Typography>
                                                                )}
                                                            </IconButton>
                                                        </Tooltip>
                                                    </stack>
                                                }

                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </Grid>

                                   { this.state.isApiFinished ?

                                        <Grid style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                                            <Box sx={{ height: parseInt(this.state.windowHeight) - (parseInt(this.state.toolbarHeight) + 150) }}>
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
                                     }
                                
                            
                        </Grid>
                    </Grid>
                  
                </Grid>
            </div>}
    </>
}

{
    this.storage.company_type == 9 &&
    tabIndex == 0 &&
    <>
        {
            this.props.scrapAssetApprovals ? 
            <div>
                <Grid container display='flex' flexDirection='row' spacing={3} p='6px 10px'>
                    <Grid
                        style = {{
                            borderRight : '2px #d9dadc solid',
                            marginTop : '5px'
                        }}
                        size={{
                            lg: 3.5,
                            md: 4,
                            sm: 5,
                            xs: 12
                        }}>
                        <Grid container spacing={3} display='flex' direction='row'>
                            <Grid
                                size={{
                                    lg: 12,
                                    md: 12,
                                    sm: 12,
                                    xs: 12
                                }}>
                                <Tabs
                                    value = {tabIndex}
                                    onChange = {this.handleTabChange}
                                    variant = 'fullWidth'
                                    aria-label = 'tabs example'
                                    sx = {{ fontFamily : 'Poppins, sans-serif' }}
                                >
                                    <Tab 
                                        icon = {
                                            <ExitToAppIcon style={{ color: 'black' }} />
                                        } 
                                        label = 'Scrap Asset'
                                        sx = {{ fontSize: '12px', fontWeight: 600 }}
                                    />
                                </Tabs>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <AssetsApprovals
                 showUnseenRequests={this.state.showUnseenRequests}
                 >

                </AssetsApprovals>
            </div> : <div>
            </div>
        }
    </>
}
                               
                            {/* </Box> */}
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
        pos_request: state.leaveRequestReducer.pos_request || [],
        searchloandata: state.LoanReducer.searchloandata || [],
        conflictLeaveRequest: state.leaveRequestReducer.conflictLeaveRequest || [],
        get_empbasecompany: state.attendanceReducer.get_empbasecompany || [],
        getCompanyBasedEmployeeFilter: state.attendanceReducer.getCompanyBasedEmployeeFilter || [],
        searchCompanyBasedEmployeeFilter: state.attendanceReducer.searchCompanyBasedEmployeeFilter || [],
        searchClaim: state.LoanReducer.searchClaim || [],
        requestConfigSearch: state.RequestConfigReducer.requestConfigSearch,
        getUnseenCount: state.leaveRequestReducer.getUnseenCount,
        getEmployeesShift: state.leaveRequestReducer.getEmployeesShift,
        quotationApprovals : state.quotationReducer.quotationApprovals,
        scrapAssetApprovals : state.AssetReducers.scrapAssetApprovals
    };
};
const mapDispatchToProps = (dispatch) => {
    return {

        listAllLeaveRequestAction: (leaveData, employee_id, setModalTypeHandler, setLoaderStatusHandler, response) => {
            return dispatch(listAllLeaveRequestAction(leaveData, employee_id, setModalTypeHandler, setLoaderStatusHandler, response));
        },

        posRequestdata: (leaveData, setModalTypeHandler, setLoaderStatusHandler, response) => {
            return dispatch(posRequestdata(leaveData, setModalTypeHandler, setLoaderStatusHandler, response));
        },

        getConflictLeaveRequestAction: (employee_id, data, setModalTypeHandler, setLoaderStatusHandler, response) => {
            dispatch(getConflictLeaveRequestAction(employee_id, data, setModalTypeHandler, setLoaderStatusHandler, response));
        },

        updateConflictLeaveRequestAction: (employee_id, leaveId, data, setModalTypeHandler, setLoaderStatusHandler, response) => {
            dispatch(updateConflictLeaveRequestAction(employee_id, leaveId, data, setModalTypeHandler, setLoaderStatusHandler, response));
        },

        updateSeenAction: (leaveId, response) => {
            return dispatch(updateSeenAction(leaveId, response));
        },
        PosrequpdateSeenAction: (id, response) => {
            return dispatch(PosrequpdateSeenAction(id, response));
        },

        
        getUnseenCountAction: (data, response) => {
            return dispatch(getUnseenCountAction(data, response));
        },

        getEmployeeShiftDetailsAction: (data, response) => {
            return dispatch(getEmployeeShiftDetailsAction(data, response));
        },

        updateSeenLoanAction: (id, response) => {
            return dispatch(updateSeenLoanAction(id, response));
        },
        getRequestConfig: (setModalTypeHandler, setLoaderStatusHandler, data2) => {
            return dispatch(getRequestConfig(setModalTypeHandler, setLoaderStatusHandler, data2));
        },
        updateSeenClaimAndOthersAction: (id,type, response) => {
            return dispatch(updateSeenClaimAndOthersAction(id,type, response));
        },


        ApproveLeaveRequestAction: (employee_id, leaveId, approvedBy, setModalTypeHandler, setLoaderStatusHandler, resData, response) => {
            dispatch(ApproveLeaveRequestAction(employee_id, leaveId, approvedBy, setModalTypeHandler, setLoaderStatusHandler, resData, response));
        },

        ApprovePosRequestAction: (employee_id, id, approvedBy, setModalTypeHandler, setLoaderStatusHandler, resData) => {
            dispatch(ApprovePosRequestAction(employee_id, id, approvedBy, setModalTypeHandler, setLoaderStatusHandler, resData));
        },

        cancelLeaveRequestAction: (employee_id, leaveId, cancelledBy, response) => {
            return dispatch(cancelLeaveRequestAction(employee_id, leaveId, cancelledBy, response));
        },



        CreateNotificationAction: (data) => {
            dispatch(CreateNotificationAction(data))
        },
        getNotificationTokenAction: (data, cb) => {
            dispatch(getNotificationTokenAction(data, cb))
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

        getEmpbasecompanyAction: () => {
            dispatch(getEmpbasecompanyAction())
        },
        getEmpbasecompanyFilterAction: (data, response) => {
            dispatch(getEmpbasecompanyFilterAction(data, response))
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

        clearState: () => {
            dispatch({ type: 'LOAN_CLEAR_STATE' });
        },
        set_search_company_based_employee: (val) => {
            return dispatch(set_search_company_based_employee(val));
        },
        get_search_company_based_employee: (val, setModalTypeHandler, setLoaderStatusHandler) => {
            return dispatch(get_search_company_based_employee(val, setModalTypeHandler, setLoaderStatusHandler));
        },
        getQuotationApprovalsAction : (data, response) =>{
            return dispatch(getQuotationApprovalsAction(data, response))
        },
        getScrapAssetApprovalsAction : (data, response) =>{
            return dispatch(getScrapAssetApprovalsAction(data, response))
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ApprovalsPage);
