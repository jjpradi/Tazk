import * as React from 'react';
import _ from 'lodash';
import {Responsive, WidthProvider} from 'react-grid-layout';
const ResponsiveReactGridLayout = WidthProvider(Responsive);
import {Grid, ToggleButton, ToggleButtonGroup,Button, Tooltip, ButtonGroup, Box, FormControl, InputLabel, Select, MenuItem, ListSubheader, ListItemText, Checkbox, Typography, IconButton, Avatar, Menu, Divider, ListItemIcon, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Stack} from '@mui/material';
import DashboardDialog from './dashboardDialog';
import "../../../../node_modules/react-grid-layout/css/styles.css";
import "../../../../node_modules/react-resizable/css/styles.css";
import { getDashboardRoleDataAction, listDashboardAction, getDashboardLayoutActions, update_dashboardLayoutAction, resetDashboardPollingTimerIdsAction, reset_dashboardLayoutAction, getDashboardDataAction } from 'redux/actions/dashboard_role_actions';
import {connect, useDispatch} from 'react-redux';
import Cookies from 'universal-cookie';
import { sendNtfy } from 'firebase/firebase.service';
import TotalCard from 'components/dashboard/expanseAnalysis/totalCard';
import ExpenseCard from 'components/dashboard/expanseAnalysis/expenseCard';
import SpendingCard from 'components/dashboard/expanseAnalysis/spendingCard';
import PieChart from 'components/dashboard/expanseAnalysis/pieChart';
import AreaChart from 'components/dashboard/expanseAnalysis/areaChart';
import Filters from "components/dashboard/ProfitAndLoss/filters"; 
import RevenueAndCost from 'components/dashboard/ProfitAndLoss/revenue_and_cost';
import Profit from "components/dashboard/ProfitAndLoss/profit";
import BreakDown from "components/dashboard/ProfitAndLoss/break_down_cost";
import FilterButtonGroup from "components/dashboard/ProfitAndLoss/filterButtonGroup";
import TotalAccountsReceivables from "components/dashboard/payable_receivable/totalAccountsReceivables"
import TotalAccountsPayable from "components/dashboard/payable_receivable/totalAccountsPayables"
import TotalAccountsPayableReceivableAging from "components/dashboard/payable_receivable/receivableAndPayableAging"
import TotalReceivables from "components/dashboard/payable_receivable/totalReceivables";
import TotalPayables from "components/dashboard/payable_receivable/totalPayable";
import StockSummary from '../../sales/inventoryMD/StockSummary';
import LocateStock from "pages/sales/inventoryMD/LocateStock";
import AvailStock from "pages/sales/inventoryMD/AvailStock";
import NonmoveCategory from "pages/sales/inventoryMD/NonmoveCategory";
import Linechart from "components/dashboard/linechart/linechart";
import CashFlow from 'components/dashboard/CashFlow';
import AreaWiseSaleCard from "components/dashboard/SalesDashboard/areaWiseSale"
import TotalSales from 'components/dashboard/SalesDashboard/totalSales';
import BrandSales from 'components/dashboard/SalesDashboard/brandSales';
import TodaySales from "components/dashboard/SalesDashboard/todaySales&salesTillDate";
import SalesComparison from 'components/dashboard/SalesDashboard/salesComparison';
import SalesToday from "components/dashboard/PosUser/salesTodayCard";
import CashInHand from "components/dashboard/PosUser/cashInHandCard";
import TargetAchievement from "components/dashboard/PosUser/targetAchievementCard";
import PosSummary from "components/dashboard/PosUser/posSummary";
import CurrentSale from "components/dashboard/SalesManDashboard/SalesDetails/currentSale";
import TargetSale from "components/dashboard/SalesManDashboard/SalesDetails/targetSale";
import CustomerBilled from "components/dashboard/SalesManDashboard/SalesDetails/customerBilled";
import CustomerUnBilled from "components/dashboard/SalesManDashboard/SalesDetails/customerUnBilled";
import TopSales from "components/dashboard/SalesManDashboard/SalesDetails/topSales";
import TotalOutstandingCard from "components/dashboard/SalesManDashboard/outstandingReport.js/totalOutstandingCard";
import OverDueCard from "components/dashboard/SalesManDashboard/outstandingReport.js/overDueCard";
import CollectTodayCard from "components/dashboard/SalesManDashboard/outstandingReport.js/collectTodayCard";
import CollectOverDueCard from "components/dashboard/SalesManDashboard/outstandingReport.js/collectOverDueCard";
import CollectStatusCard from "components/dashboard/SalesManDashboard/outstandingReport.js/collectStausCard"
import TopTenOutstandingCard from "components/dashboard/SalesManDashboard/outstandingReport.js/topTenOutstandingCard";
import VisitsReport from "components/dashboard/visits";
import EmployeeCard from "components/Payroll/employeeCard";
import LateCheckCards from "components/Payroll/lateCheckCard";
import EarlyCheckoutCards from "components/Payroll/earlyCheckoutCard";
import HolidayCards from "components/Payroll/holidayCard";
import CheckedIn from "components/Payroll/checkedIn";
import NotCheckedIn from "components/Payroll/notCheckedIn";
import LateLogin from "components/Payroll/lateLogin";
import CompleteList from "components/Payroll/completeList";
import SaleCard from "components/widgetsDashboard/saleCard";
import WidgetGrossProfit from "components/widgetsDashboard/grossProfit";
import RoiCard from "components/widgetsDashboard/ROICard";
import NetProfit from "components/widgetsDashboard/netProfit";
import WidgetTopSales from "components/widgetsDashboard/topSales";
import ChequeBounces from "components/dashboard/SalesManDashboard/chequeBouncesCard"
import { getsessionStorage } from 'pages/common/login/cookies';
import Draggable from 'react-draggable';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Fab from '@mui/material/Fab';
import { CreateNotificationAction } from 'redux/actions/notification_actions';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import { styled } from '@mui/material/styles';
import PayrollDashboard from 'pages/Payroll/payrollDashboard';
import { getByDateAction } from 'redux/actions/profitLossDashboardAction';
import apiCalls from 'utils/apiCalls';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import LeavesStatus from 'components/Payroll/leavesStatus';
import TotalIssuesCard from 'pages/common/ErrorDashboardUsers/totalIssuesCard';
import FixedIssuesCard from 'pages/common/ErrorDashboardUsers/fixedIssuesCard';
import PendingIssuesCard from 'pages/common/ErrorDashboardUsers/pendingIssuesCard';
import { Logout, PersonAdd, Settings } from '@mui/icons-material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import BankBalance from 'components/dashboard/PosUser/bankBalance';
import UnReconciliate from 'components/dashboard/PosUser/unReconciliate';
import { Helmet } from 'react-helmet-async';
import AverageWorkHours from 'components/Payroll/averageWorkHours';
import EarlyCheckIn from '../../../components/Payroll/earlyCheckIn';
import AbsentCard from '../../../components/Payroll/absent';
import PresentCard from '../../../components/Payroll/present';
import ApprovedCard from '../../../components/Payroll/approvedLeavecard';
import LocationWiseAttendance from 'components/Payroll/locationWiseAttendance';
import Attendancerate from 'components/Payroll/attendanceRate';
import Experience from '../../../components/Payroll/experience';
import EmployeeLateCheckCards from '../../../components/Payroll/EmployeeDashboard/lateInCount';
import LeaveAndPermissionCardForDepartmentHead from '../../../components/Payroll/leaveAndPermisionCardForDepartmentHead';
import CheckInOutForDepartmentHead from '../../../components/Payroll/checkInOutForDepartmentHead';
import EarlyCheckoutEmp from '../../../components/Payroll/EmployeeDashboard/earlyCheckOut';
import EmployeeLeaveCountCards from '../../../components/Payroll/EmployeeDashboard/empLeaveCount';
import EmployeePermissionCountCard from '../../../components/Payroll/EmployeeDashboard/empPermissionCount';
import TotalDaysWorkedCountCard from '../../../components/Payroll/EmployeeDashboard/totalDayWorked';
import EmployeeRankScoreCard from '../../../components/Payroll/EmployeeDashboard/rankScoreCalculation';
import LeaveBalanceCard from '../../../components/Payroll/EmployeeDashboard/leaveBalance';
import TopEmpByAttendance from 'components/Payroll/topEmpByAttendance';
import { clientwebsocket, titleURL } from 'http-common';
import AnnouncementCard from 'components/Payroll/announcementCard';
import { checkedInAction, employeeCountAction, getAnnouncements, lateLoginEarlyCheckoutAction, notCheckedInAction } from 'redux/actions/payrollDashboard_actions';
import { roleType } from 'utils/roleType';
import dashboard_role_services from 'services/dashboard_role_services';
import CostSummary from 'components/Payroll/costSummary';
import { listErrorDashboardAction } from 'redux/actions/errorDashboard_actions';
import AssetCondition from 'components/dashboard/AssetManagement/AssetCondition';
import PendingAudit from 'components/dashboard/AssetManagement/PendingAudit';
import PendingAuditsCard from 'components/dashboard/AssetManagement/PendingAuditsCard';
import TotalAssetValueCard from 'components/dashboard/AssetManagement/TotalAssetValueCard';
import WarrantyExpireCount from 'components/dashboard/AssetManagement/WarrantyExpireCount';
import UnAssignedCard from 'components/dashboard/AssetManagement/UnAssignedCard';
import TotalAssets from 'components/dashboard/AssetManagement/TotalAssets';
import UnAuditedCard from 'components/dashboard/AssetManagement/UnAuditedCard';
import TopAssetsByValue from 'components/dashboard/AssetManagement/TopAssetsByValue';
import ServiceDueCountCard from 'components/dashboard/AssetManagement/ServiceDueCount';
import InsuranceRenewalCountCard from 'components/dashboard/AssetManagement/InsuranceRenewalCount';
import AssignedCountCard from 'components/dashboard/AssetManagement/AssignedCount';
import AssetStatusChart from 'components/dashboard/AssetManagement/AssetStatusCard';
import AssetLocationCard from 'components/dashboard/AssetManagement/AssetLocationCard';
import AssetTypeCountChart from 'components/dashboard/AssetManagement/AssetTypeCountChart';
import TotalYearValueCard from 'components/dashboard/AssetManagement/TotalYearValue';
import WorkLoadChart from '../../../components/Payroll/WorkLoadChart'
import CreatedAndResolved from '../../../components/Payroll/CreatedAndResolved';
// import CashBank from 'components/dashboard/cashBank';
import CashBank from 'components/dashboard/CashBank';
import WorkLog from '../../../components/Payroll/workLog';
import LogReport from '../../../components/Payroll/logReport';
import DetailPage from './detailPage';
import LandingPage from './landingPage';
import TodaysLeads from 'components/dashboard/LeadsManagement/TodaysLeads';
import MyMeetings from 'components/dashboard/LeadsManagement/MyMeetings';
import MyOpenTasks from 'components/dashboard/LeadsManagement/MyOpenTasks';
import TotalLeads from 'components/dashboard/LeadsManagement/TotalLeads';
import CustomerGrowthChart from 'components/dashboard/LeadsManagement/CustomerGrowthChart';
import Break_down_cost from 'components/dashboard/ProfitAndLoss/break_down_cost';
import ConvertedLeadsCountCard from 'components/dashboard/LeadsManagement/ConvertedLeadsCount';
import ConvertedLeadsValueCard from 'components/dashboard/LeadsManagement/ConvertedLeadsValue';
import ConvertedLeadsAndValuesChart from 'components/dashboard/LeadsManagement/ConvertedLeadsAndValues'
import LeadBySource from 'components/dashboard/LeadsManagement/LeadBySource';
import TotalLeadsValue from 'components/dashboard/LeadsManagement/TotalLeadsValue';
import LeadComparision from 'components/dashboard/LeadsManagement/LeadComparision';
import SalesLeadsChart from 'components/dashboard/LeadsManagement/SalesLeads'
import ClosedLeadsChart from 'components/dashboard/LeadsManagement/ClosedLeadsChart';
import SalesPipelineByLeadSource from 'components/dashboard/LeadsManagement/SalesPipelineByLeadSource';
import LeadsPineline from 'components/dashboard/LeadsManagement/LeadsPipeline';
import LeadsDailyReport from 'components/dashboard/LeadsManagement/LeadsDailyReport';
import WorkingContactedCard from 'components/dashboard/LeadsManagement/WorkingContacted';
import OpenNotContactedCard from 'components/dashboard/LeadsManagement/OpenNotContacted';
import ClosedNotConvertedCard from 'components/dashboard/LeadsManagement/ClosedNotConverted';
import { restrictNewCreationBasedOnPlanAction } from 'redux/actions/subscription_action';
import EmployeeSalaryByDept from 'components/Payroll/EmployeeSalaryByDept';
import GenderRatio from 'components/Payroll/GenderRatio';
import EmployeesByDepartment from 'components/Payroll/EmployeesByDepartment';
import OverallAttendance from 'components/Payroll/OverallAttendance';
import LeaveTypeDistribution from 'components/Payroll/LeaveTypeDistribution';
import AttendanceByDep from 'components/Payroll/attendanceByDep';
import AttendanceStatistics from 'components/Payroll/attendanceStatistics';
import LoanDueDashboard from 'pages/Payroll/AllLoans/loansCard';
import { staticDashboardData } from 'pages/common/dashboardData';
import { listroleAction } from 'redux/actions/role_actions';
import TotalCount from 'components/stact/totalCount';
import CheckedInClients from 'components/stact/checkedInClients';
import NotCkeckedInClients from 'components/stact/notCkeckedInClients';
import CheckInOut from 'components/stact/checkInOut';
import LocationAttendance from 'components/stact/locationAttendance';
import OutstandingReceivedCard from 'pages/sales/CustomerDashboard/OutstandingReceivedCard';
import UnusedCredits from 'pages/sales/CustomerDashboard/UnusedCredits';
import CreditDaysAndLimit from 'pages/sales/CustomerDashboard/CreditDaysAndLimit';
import TotalBills from 'pages/sales/CustomerDashboard/TotalBills';
import UnpaidBills from 'pages/sales/CustomerDashboard/UnpaidBills';
import AverageCreditDays from 'pages/sales/CustomerDashboard/AverageCreditDays';
import AverageBillingCycle from 'pages/sales/CustomerDashboard/AverageBillingCycle';
import Income from 'pages/sales/CustomerDashboard/Income';
import { getThemesAction } from 'redux/actions/userCreation_actions';
import Activeloans from '../../../components/Payroll/activeloans';
import AttendanceCombinedCard from 'components/Payroll/attendanceCombinedCard';
import OpenRequests from '../../../components/Payroll/openRequests'
import EventsCard from 'components/Payroll/eventsCard';
import EmployeeactiveLoans from '../../../components/Payroll/EmployeeDashboard/employeeActiveLoans';
import EmployeeRequestsCard from '../../../components/Payroll/EmployeeDashboard/employeeRequests'
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import EmployeeAttCorrection from '../../../components/Payroll/EmployeeDashboard/employeeAttendanceCorrection'
import EmployeeLeaveAndPermission from '../../../components/Payroll/EmployeeDashboard/employeeLeaveAndPermission'
import { getAppConfigDataAction } from 'redux/actions/app_config_actions';
import { listAllLeaveRequestAction } from 'redux/actions/leaveRequest_actions';


const WhiteTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: "white",
    color: 'black',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
    '&:hover': {
      boxShadow: '0 5px 10px rgba(0, 0, 0, 0.3)',
    },
    padding: '20px',
  },
});


class ShowcaseLayout extends React.Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.draggableRef = React.createRef();
    this.state = {
      currentBreakpoint: 'lg',
      compactType: 'vertical',
      mounted: false,
      layouts: this.props.dashboardLayouts,
      _layout: [],
      load: false,
      cardVisibility: this.props.cardVisibility,
      mode: 'view',
      filters: this.props.month,
      breakdownfilters: this.props.breakdownmonth,
      activeButton: 'day',
      onHover: false,
      dashboardEnabledValue: [],
      //position: { x: 20, y: 40 },
      category: this.props.isCardEnabled,
      anchorEl: null,
      isModeButtonOpen:false,
      resetOpen:false,
      dashRoleData: [],
      apiStatus : false,
      detailDialog : false,
      landingDialog: false,
      editHovered: false,
      selected: "company"
    };
    this.cookies = new Cookies();
  }
  storage = getsessionStorage()
  
  static defaultProps = {
    className: 'layout',
    rowHeight: 30,
    onLayoutChange: function () { },
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
    verticalCompact: false
  };

  dashboardApiCalled = false;

  isDetailEnteredResolved = () => {

    if (this.props.getsessiondetail?.isDetailEntered === 1) return true;

    if (this.storage?.isDetailEntered === 1) return true;

    return false;
  };

  callDashboardAPIs = () => {
    if (this.dashboardApiCalled) return;

    this.dashboardApiCalled = true;

    const context = this.context;
    const empId = this.storage?.employee_id || context.commoncookie;

    this.props.getDashboardDataAction();
    this.props.getThemesAction(this.storage?.employee_id);


    if (this.storage?.company_type === 6) {
      this.props.listErrorDashboardAction(
        { company_id: 'currentCompany', dashboard: 'dashboard' },
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      );
    }

    this.props.getAnnouncements();

    const payload = {
      locationId: "null"
    }
    const payload2 = {
      date: "today",
      type: null,
      employee_id: null
    }

     const conditionalApis = [];

    if (this.storage?.company_type === 5) {
      conditionalApis.push(
        this.props.checkedInAction(payload),
        this.props.notCheckedInAction(payload),
        this.props.lateLoginEarlyCheckoutAction(),
        this.props.listAllLeaveRequestAction(
          payload2,
          empId,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler
        ),
        this.props.employeeCountAction(
          context.setModalTypeHandler,
          context.setLoaderStatusHandler
        )
      );
    }

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getDashboardRoleDataAction(this.storage?.role_id,
        (response) => {
          this.setState({ ...this.state, dashRoleData: Array.isArray(response) ? response : [], apiStatus: true })
        }
      ),
      this.props.listDashboardAction(),
      this.props.getDashboardLayoutActions({ dashboardType: this.state.selected }),
      this.props.restrictNewCreationBasedOnPlanAction(),
      this.props.listroleAction(),
      ...conditionalApis
    );

    // if ([11, 9, 5, 10, 2, 3].includes(this.storage?.company_type)) {
    //   this.pollingInterval = setInterval(() => {
    //     this.props.getDashboardDataAction();
    //   }, 100000);
    // }
  };


  componentDidMount() {

    if ((this.storage?.company_type == 5 || this.storage?.company_type == 2 || this.storage?.company_type == 9 || this.storage?.company_type == 10 || this.storage?.company_type == 4 || this.storage?.company_type == 3 || this.storage?.company_type == 11) && this.storage?.isDetailEntered === 0 && this.storage?.role_name === 'Administrator') {
      this.setState({ ...this.state, landingDialog: true })
    }
    apiCalls(
      this.storage?.company_type !== 13 && this.props.getAppConfigDataAction()
    )
    if (this.isDetailEnteredResolved()) {
      this.callDashboardAPIs();
    }
  }



  // getDashboardRoleDataAction = (id) => async () => {
  //   try {
  //     const res = await dashboard_role_services.getDashboardRoleData(id);
  //     console.log('asdfsf', res.data)
  //   } catch (err) {
  //     console.log('sdffdf', err);
  //   }
  // };

  componentDidUpdate(prevProps, prevState) {

    if (!_.isEqual(prevProps.dashboardLayouts, this.props.dashboardLayouts)) {
      this.setState({ layouts: this.props.dashboardLayouts, category: this.props.isCardEnabled })
    }
    if (!_.isEqual(prevProps.cardVisibility, this.props.cardVisibility)) {
      this.setState({ cardVisibility: this.props.cardVisibility, category: this.props.isCardEnabled })
    }
    if (
      this.props.getsessiondetail?.isDetailEntered === 1 &&
      !this.dashboardApiCalled
    ) {
      this.callDashboardAPIs();
    }
    //     clientwebsocket.socket.onmessage = async (message) => {
    //       let { event } = JSON.parse(message.data);
    // console.log(event,"eventeventevent");

    //       if (event === 'dashboardUpdate') {
    // console.log("websocket sent");

    //       }
    //     }
    // console.log(clientwebsocket,"clientwebsocket");
    // clientwebsocket.socket.onmessage = async (message) => {
    //   let { event } = JSON.parse(message.data)
    //   console.log(event,message.data,"eventevent");

    // }

  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.beforeUnLoad)
    if (this.props.dashboardPollTimerIds.length) {
      this.props.dashboardPollTimerIds.forEach(timerId => {
        clearInterval(timerId)
      })
      this.props.resetDashboardPollingTimerIdsAction()
    }
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    // let res = this.props.dashboardLayouts !== this.state.layouts || this.props.isCardEnabled !== this.state.category
    //   const result = res ? window.confirm('Do you want to save this layout?') : false;
    // if (result && res) {
    clearInterval(this.pollingInterval);
    let res = (this.props.dashboardLayouts !== this.state.layouts || this.props.isCardEnabled !== this.state.category)
    let role_name = this.storage?.role_name

    const result = res && roleType.includes(role_name) && this.state.mode === 'edit' ? window.confirm('Do you want to save this layout?') : false;

    if (result && res) {
      this.saveLayoutChanges()
    }


  }
  setStateHandler = (name,) => {
    let tempCardVisibility = {}
    const tempCat = [...this.state.category]
    let temp = []
    let index = 0;


    index = this.state.category.findIndex(i => {
      return i.childCards.some(j => j.cardName === name)
    })
// console.log(index,"cvbnm")
// console.log(this.state.cardVisibility,this.state.category,name,"ghjk")
    temp = [...tempCat[index].childCards].map(i => {
      // console.log("temp",temp)
      if (i.cardName === name) {
        return { ...i, isCardVisible: !i.isCardVisible }
      } else {
        return i
      }
    })

    if (temp.every(i => i.isCardVisible === true)) {
      tempCat[index].isGroupEnabled = true
    } else {
      tempCat[index].isGroupEnabled = false

    }


    const group1 = ['breakDownCard', 'profitCard', 'revenueCard', 'filterCard']

    if (group1.includes(name)) {

      if (temp.filter(i=> i.cardName !== 'filterButtonCard').some(i => i.isCardVisible === true)) {

        temp = [...temp].map(i => {
          if (i.cardName === 'filterButtonCard') {
            return { ...i, isCardVisible: true }
          } else {
            return i
          }
        })
      } else {
        temp = [...temp].map(i => {
          if (i.cardName === 'filterButtonCard') {
            return { ...i, isCardVisible: false }
          } else {
            return i
          }
        })
      }
    }


    

    tempCat[index].childCards = temp
    this.setState({ category: tempCat })

    
    const group = ['breakDownCard', 'profitCard', 'revenueCard', 'filterCard']
    const someCardsVisible = Object.keys(this.state.cardVisibility).filter(i => group.includes(i)).some(i => this.state.cardVisibility[i] === true);


    tempCardVisibility = { ...this.state.cardVisibility, [name]: !this.state.cardVisibility[name] }
 

    if (Object.keys(tempCardVisibility).filter(i => group.includes(i)).some(i => tempCardVisibility[i] === true)) {
      tempCardVisibility = { ...tempCardVisibility, ['filterButtonCard']: true }
    } else {
      tempCardVisibility = { ...tempCardVisibility, ['filterButtonCard']: false }
    }
      
    
    
    this.setState({ cardVisibility: tempCardVisibility });

    const tempData = {
      layouts: this.state.layouts,
      cardVisibility: tempCardVisibility,
      isCardEnabled:this.state.category
    }

    // this.props.update_dashboardLayoutAction(tempData)
    
  };

  handleChange = (event, newMode) => {
    this.setState({ mode: newMode });
  };

  onBreakpointChange = (breakpoint) => {

    this.setState({
      currentBreakpoint: breakpoint,
    });
  };

  onCompactTypeChange = () => {
    const { compactType: oldCompactType } = this.state;
    const compactType =
      oldCompactType === 'horizontal'
        ? 'vertical'
        : oldCompactType === 'vertical'
          ? null
          : 'horizontal';
    this.setState({ compactType });
  };

  onLayoutChange = (layout, layouts) => {
    
    let tempLayout = this.state.layouts[this.state.currentBreakpoint].map(old => {
      let newLayout = layout.filter(nL => nL.i === old.i);
      if (newLayout.length) {
        return newLayout[0];
      } else {
        return old
      }
    })
    
    let modifiedLayout = {
      ...this.state.layouts,
      [this.state.currentBreakpoint]: tempLayout
    }

    // setLayoutData(modifiedLayout);
    this.setState({ _layout: layout, layout: modifiedLayout });

    const tempData = {
      layouts: modifiedLayout,
      cardVisibility: this.state.cardVisibility
    }
    // this.props.update_dashboardLayoutAction(tempData) 
    
  };

  // onNewLayout = () => {
  //   this.setState({
  //     layouts: getLayoutData(),
  //   });
  // };

  onDrop = (elemParams) => {
    alert(`Element parameters: ${JSON.stringify(elemParams)}`);
  };

  stringifyLayout() {
    return this.state._layout.map(function (l) {
      return (
        <div className='layoutItem' key={l.i}>
          <b>{l.i}</b>: [{l.x}, {l.y}, {l.w}, {l.h}]
        </div>
      );
    });
  }


  getAccessDashBoard = (dashboardGroup, individualCards) => {
    // console.log(dashboardGroup, individualCards,"ertyuii")
    const isGroupAllowed = this.props.dashboardRoleData.some((d) => d.dashboard_name === dashboardGroup)
    const parent = this.state.category.find(a => a.groupName === dashboardGroup)
// console.log(this.props.dashboardRoleData,isGroupAllowed,parent,"ertyuii1")
    let flag = false
    if (parent) {
      flag = parent.childCards.find(b => b.cardName === individualCards)?.isCardVisible || false
      // console.log(parent,flag,"ertyuii2")
    }
// console.log(this.props.dashboardRoleData,isGroupAllowed, flag,"ertyuii3")
    return (isGroupAllowed && flag)
    // return (group && cards)


    // const isEnabled = this.state.cardVisibility[key];
    // const mode = this.state.mode;

    // if(!this.props.dashboardRoleData.some((d) => d.dashboard_name === dashboardGroup)){
    //   return false;
    // }

    // return isEnabled ? true : mode === 'edit' ? true : false
    
  };

  handleDate = async (fromDate, toDate) => {
    const context = this.context;
    let data = {
      fromDate: fromDate,
      totDate: toDate,
    };
    await apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
        
      this.props.getByDateAction(
        fromDate,
        toDate,
        context.headerLocationId,
        data,
      ),
        
    );
    await this.setState({ filters: this.props.getByDate, breakdownfilters: this.props.breakdownday })
  }

  divProps = (key) => {

    const isEnabled = this.state.cardVisibility[key];
    const mode = this.state.mode;

    const dataGrid = this.props.dashboardLayouts[this.state.currentBreakpoint]?.filter(i => i.i === key)?.[0] || { i: key, x: 0, y: 0, w: 3, h: 3 }

    let tempObj = {
      className: '',
      style: {
        filter: isEnabled ? '' : mode === 'edit' ? 'grayscale(100%)' : '',
        opacity: isEnabled ? '1' : mode === 'edit' ? '0.5' : '1',
        display: isEnabled ? 'block' : mode === 'edit' ? 'block' : 'none'
      },
      'data-grid': dataGrid,
    }

    return tempObj;
  }

  
  cardProps = (key) => {
    // console.log(this.state.cardVisibility,key,'this.state.cardVisibility');
// console.log(Array.isArray(this.props.dashboardData),this.props.dashboardData.length,this.props.dashboardData, "this.props.dashboardData");

    const data = this.props.dashboardData.length <= 0 ? staticDashboardData : this.props.dashboardData
    // console.log(data,this.props.dashboardData.length,this.props.dashboardData,"datafdfdsf");
    
    const isEnabled = this.state.cardVisibility[key];
    const mode = this.state.mode;
    const adjustedKey = key === 'averageWorkHoursCard' ? 'attendanceRate' : key === 'EmployeeLeaveCountCards' || key === 'EmployeePermissionCountCard' ? 'TotalDaysWorkedCountCard' : key === 'revenueCard' ? 'profitCard' : key;
    const matchedData = data.find((item) => item[adjustedKey])?.[adjustedKey] || [];
    
    let tempObj = {
      mode,
      isEnabled,
      data:matchedData,
      setCardClose: () => {
        this.setStateHandler(key)
      }
    }
    // console.log(tempObj,'tempObj');
    
    return tempObj;
  }
  ////////////-----------
  handleMouseEnter = () => {
    this.setState({
      onHover: true,
    });
  };
  
  handleMouseLeave = () => {
    this.setState({
      onHover: false,
    });
  }

  saveLayoutChanges = () => {

    const tempData = {
      layouts : this.state.layout,
      cardVisibility: this.state.cardVisibility,
      isCardEnabled : this.state.category,
      dashboardType : this.state.selected
    }

    this.props.update_dashboardLayoutAction(tempData);
    this.setState({ mode: 'view' });
  }
 
  handleOpenReasonDialog = () => {
        this.setState({resetOpen:true})
  }

  handleCloseReasonDialog = () => {
    this.setState({ resetOpen: false})
  }

  resetLayoutChanges = () => {
    this.props.reset_dashboardLayoutAction( { dashboardType: 'company' },result => {

      this.setState({
        layouts: '',
        cardVisibility: ''
      });
      
      setTimeout(() => {
        
        this.setState({
          layouts: result.layouts,
          cardVisibility: result.cardVisibility
        });
        
      }, 100);

      this.setState({resetOpen: false, mode: 'view' });

    });
  }

  cancelLayoutSet = () => {

    this.setState({
      layouts: '',
      cardVisibility: ''
    });

    setTimeout(() => {
      this.setState({
        layouts: this.props.dashboardLayouts,
        cardVisibility: this.props.cardVisibility
      });
    }, 100);
    this.setState({ mode: 'view', isModeButtonOpen: false });
  }


  //  notifyMessage = () => {
  //   let counter = 1;
  //   return () => {

  //     let temp = [`title-${counter}`, `body-${counter}`];
  //     counter++;
  //     return temp;
  //   }

  // }

  ////////////////----------

  
  generateMenuList = () => {

    const dashboardListName = this.props.dashboardRoleData.map(d => d.dashboard_name)
    const list = this.state.category.filter(i => dashboardListName.includes(i.groupName)).flatMap(i => {
      const temp = [];
      if (i.groupName) {
        const parentName = `parent_${i.groupName}`
        temp.push(<MenuItem key={i.id} style={{ height: '40px', backgroundColor: '#dedede' }}
          disabled={i.groupName === 'AnnouncementCard' ? true : false}
          value={parentName}>
          <Checkbox checked={i.isGroupEnabled}/>
          <ListItemText sx={{fontWeight:'bold'}} primary={i.groupName} />
        </MenuItem>)
      }

      i.childCards.forEach(j => {
        temp.push(<MenuItem style={{ height: '38px' }}
          disabled={j.cardName === 'filterButtonCard' ? true : false ||
          j.cardName === 'announcement' ? true : false}
          key={j.cardName}
          value={j.cardName}>
          <Checkbox sx={{paddingLeft:'40px'}} checked={j.isCardVisible} />
          <ListItemText primary={j.cardName} />
          
          </MenuItem>)
      })

      return temp;
    })


    return list


  }
  

  getSelectedMenuList = () => {
    const dashboardListName = this.props.dashboardRoleData.map(d => d.dashboard_name)


    const list = this.state.category.filter(i => dashboardListName.includes(i.groupName)).flatMap(i => {
      const temp = [];
      if (i.groupName && i.isGroupEnabled) {
        temp.push({name : i.groupName, isEnabled : i.isGroupEnabled})
      }


      i.childCards.forEach(j => {
        if (j.isCardVisible) {
          temp.push({name : j.cardName, isEnabled : j.isCardVisible})
        }
      })
      return temp;
    })


    return list


  }

  handleCardChange = (e, c) => {
    const value = c.props.value;

    const tempCat = [...this.state.category]
    let temp = []
    let index = 0;

    if (value.startsWith('parent_')) {
      // parent
      const pName = value.split('parent_')[1];
      index = this.state.category.findIndex(i => i.groupName === pName)
      tempCat[index].isGroupEnabled = !tempCat[index].isGroupEnabled
      temp = [...tempCat[index].childCards].map(i => ({ ...i, isCardVisible: tempCat[index].isGroupEnabled }))


    } else {
      // child

      index = this.state.category.findIndex(i => {
        return i.childCards.some(j => j.cardName === value)
      })

      temp = [...tempCat[index].childCards].map(i => {
        if (i.cardName === value) {
          return { ...i, isCardVisible: !i.isCardVisible }
        } else {
          return i
        }
      })

      if (temp.every(i => i.isCardVisible === true)) {
        tempCat[index].isGroupEnabled = true
      } else {
        tempCat[index].isGroupEnabled = false

      }


      const group = ['breakDownCard', 'profitCard', 'revenueCard', 'filterCard']

      if (group.includes(value)) {

        if (temp.filter(i=> i.cardName !== 'filterButtonCard').some(i => i.isCardVisible === true)) {

          temp = [...temp].map(i => {
            if (i.cardName === 'filterButtonCard') {
              return { ...i, isCardVisible: true }
            } else {
              return i
            }
          })
        } else {
          temp = [...temp].map(i => {
            if (i.cardName === 'filterButtonCard') {
              return { ...i, isCardVisible: false }
            } else {
              return i
            }
          })
        }
      }


      



    }
    tempCat[index].childCards = temp

    // Sync cardVisibility with the updated category state
    let tempCardVisibility = { ...this.state.cardVisibility }
    temp.forEach(card => {
      tempCardVisibility[card.cardName] = card.isCardVisible
    })

    this.setState({ category: tempCat, cardVisibility: tempCardVisibility })
  }

  handleDraggable = (e) => {
    e.stopPropagation(); 
    this.setState({isModeButtonOpen:e.currentTarget})
  }
  handleModeClose = (e) => {
    this.setState({isModeButtonOpen: false})
  }

  handleModeClick = (e) => {
    this.setState({isModeButtonOpen: null})
  }

  handleClose = (data) => {
    this.setState({ landingDialog: false, detailDialog: false  })
  }

  handleStart = () => {
    this.setState({ landingDialog: false, detailDialog: true });
  };

  handleDashboardType = (res) => {
    const context = this.context;

    this.setState({selected: res})
    const data = {
      dashboardType: res
    }

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
       
      this.props.getDashboardLayoutActions(data)
    )
  }

  render() {

    let announcementList = this.props.announcements_list.map(u => u.users)
    let person_id = this.storage?.employee_id
    let department_head = this.storage?.department_head
    let role_name = this.storage?.role_name
    // let person_id = 198

    const isPresent =  announcementList.some(innerArray => innerArray.includes(person_id));
    const dashboardScrollContainerStyle = {
      height: 'calc(100vh - 88px)',
      overflowY: 'auto',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    };
    const dashboardGridLayoutProps = {
      margin: [16, 16],
      containerPadding: [16, 16],
    };

    return (
      <div style={{ height: '100%', overflow: 'hidden' }}>
        <Dialog
          fullScreen
          style={{ margin: '10px' }}
          open={this.state.landingDialog}
          onClose={(event, reason) => {
            if (reason === 'backdropClick') {
              return;
            }
            this.setState({ ...this.state, landingDialog: false });
          }}
        >
          <LandingPage handleStart={this.handleStart} />
        </Dialog>
        <Dialog
          fullScreen
          style={{ margin: '10px' }}
          open={this.state.detailDialog}
          onClose={(event, reason) => {
            if (reason === 'backdropClick') {
              return;
            }
            this.setState({ ...this.state, detailDialog: false });
          }}
          disableEscapeKeyDown >
          <DetailPage handleClose={this.handleClose} />
        </Dialog>
        {(
          [2, 4, 5, 9, 10, 3, 11].includes(this.storage.company_type) &&
          this.storage.isDetailEntered === 1
        ) ||
          (
            ![2, 4, 5, 9, 10, 3, 11].includes(this.storage.company_type)
        ) ||
          (
            this.props.getsessiondetail?.isDetailEntered === 1 &&
            this.state.dashRoleData.length > 0
          ) ?
          <div style={dashboardScrollContainerStyle}>
          <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Dashboard </title>
        </Helmet>
        <div style={{ display: 'flex', justifyContent: 'end' }}>
            <Draggable nodeRef={this.draggableRef}>
              <div
                ref={this.draggableRef}
                style={{ position: 'fixed', zIndex: 1001 , display: 'flex',flexDirection: 'column', alignItems: 'center',gap: '10px'}}
              >
              <Grid>
                <Menu
                  
                  anchorEl={this.state.isModeButtonOpen}
                  id="account-menu"
                  open={Boolean(this.state.isModeButtonOpen)}
                  onClose={this.handleModeClose}
                  onClick={this.handleModeClick}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem  style={{backgroundColor: this.state.mode === 'edit' ? '#0A8FDC' : 'white' }}  onClick={()=> this.setState({mode:'edit'})}>
                    <EditIcon style={{color: this.state.mode === 'edit' ? 'white' : 'black' , paddingRight:'5px'}} />
                    <Typography style={{ color: this.state.mode === 'edit' ? 'white' : 'black' }}>Edit</Typography>
                  </MenuItem>
                  <MenuItem  style={{backgroundColor: this.state.mode === 'view' ? '#0A8FDC' : 'white'}}  onClick={()=> this.setState({mode:'view'})}>
                    <VisibilityIcon style={{color: this.state.mode === 'view' ? 'white' : 'black'  , paddingRight:'5px'}} />
                    <Typography style={{ color: this.state.mode === 'view' ? 'white' : 'black' }}>View</Typography>
                  </MenuItem>
                </Menu>
              </Grid>
              
              <Fab
                onClick={(e)=>this.handleDraggable(e)}
                color='primary'
                id='floating-button'
                size="small"
                    style={{
                      opacity: this.state.editHovered ? 1 : 0.7,
                      cursor: 'pointer',
                      transition: "opacity 0.3s"
                    }}
                onMouseEnter={() => this.setState({editHovered: true})}
                onMouseLeave={() => this.setState({editHovered: false})}
                  >
                    <EditRoundedIcon />
                  </Fab>
                   {(role_name === 'Manager' || role_name === 'HR Manager') && this.state.isModeButtonOpen === false && this.storage.company_type === 5 &&
                     <>
                     <Tooltip title="Company Mode" placement="left">
                    <Fab
                    size="small"
                    color="secondary"
                    onClick={() => this.handleDashboardType("company")}
                  >
                    <BusinessIcon />
                  </Fab>
                  </Tooltip>
                  <Tooltip title="Personal Mode" placement="left">
                  <Fab
                    size="small"
                    color="default"
                    onClick={() => this.handleDashboardType("individual")}
                  >
                    <PersonIcon />
                  </Fab>
                  </Tooltip>
                  </>
  }
              </div>
            </Draggable>

          </div>

          {/* {(role_name === 'Manager' || role_name === 'HR Manager') && this.state.isModeButtonOpen === false && this.storage.company_type === 5 &&
        <div style={{ display: 'flex', justifyContent: 'start' }}>

          <Stack direction="row" spacing={2}>
      <Button
        variant={this.state.selected === "company" ? "contained" : "outlined"}
        startIcon={<BusinessIcon />}
        onClick={() => this.handleDashboardType("company")}
      >
        Company
      </Button>

      <Button
        variant={this.state.selected  === "individual" ? "contained" : "outlined"}
        startIcon={<PersonIcon />}
        onClick={() => this.handleDashboardType("individual")}
      >
        Individual
      </Button>
    </Stack>
</div>
} */}
          <Grid
            container
            display='flex'
            alignItems='center'
            flexDirection='row'
            // paddingTop='15px'
            // paddingBottom='10px'
          >
            <Grid
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                // position: 'fixed',
                width: '100%',
                // zIndex: 999,
              }}
              size={{
                lg: 6,
                md: 6
              }}>
              {this.state.mode === 'edit' ? (
                <Grid container justifyContent='flex-start'>
                  {' '}
                  {/* Align the content to the start */}
                  <Grid sx={{ paddingRight: '10px' }}>
                    <Button
                      variant='contained'
                      onClick={() => this.saveLayoutChanges()}
                    >
                      Save Changes
                    </Button>
                  </Grid>
                  {this.storage?.role_name === 'Administrator' ? 
                  <Grid sx={{ paddingRight: '10px' }}>
                    <Button
                      variant='contained'
                      onClick={() => this.handleOpenReasonDialog()}
                    >
                      Reset
                    </Button>
                  </Grid>
                  : ''}
                  <Grid>
                    <Button
                      variant='contained'
                      onClick={() => this.cancelLayoutSet()}
                    >
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                null
              )}
            </Grid>
            <Grid
              sx={{ display: 'flex', justifyContent: 'flex-end' }}
              size={{
                lg: 11,
                md: 11,
                sm: 11,
                xs: 11
              }}>
              {this.state.mode === 'edit' ? (
                <FormControl
                  sx={{
                    maxWidth: 280,
                    '& .MuiInputLabel-root': {
                      // color: "red",
                      mt: '7px',
                    },
                  }}
                >
                  <InputLabel htmlFor='grouped-select'>Grouping</InputLabel>
                  <Select
                    defaultValue=''
                    id='grouped-select'
                    label='Grouping'
                    sx={{ width: '300px' }}
                    multiple
                    MenuProps={{ minHeight: '400px' }}
                    value={this.getSelectedMenuList()}
                    renderValue={(selected) =>
                      selected.map((x) => x.name).join(', ')
                    }
                    onChange={(e, c) => {
                      this.handleCardChange(e, c);
                    }}
                  >
                    {this.generateMenuList()}
                  </Select>
                </FormControl>
              ) : (
                null
              )}
            </Grid>
            </Grid>


            {this.props.announcements_list.length > 0 ? (
              roleType.includes(this.storage?.role_name) ? (
                <Grid padding={'0px 10px 0px 10px'}>

                  <AnnouncementCard />

                </Grid>
              ) : (
                isPresent ? (
                  <Grid padding={'0px 8px 0px 8px'}>
    
                    <AnnouncementCard />
    
                  </Grid>
                ) : (
                  null
                )
              )
            ) : null
            }



        
        {this.storage?.company_type === 6 ? (
          <>
            <div style={dashboardScrollContainerStyle}>
              {Object.keys(this.state.layouts).length > 0 &&
                Object.keys(this.state.cardVisibility).length > 0 ? (
                <ResponsiveReactGridLayout
                    {...this.props}
                  {...dashboardGridLayoutProps}
                  layouts={this.state.layouts}
                  onBreakpointChange={this.onBreakpointChange}
                  onLayoutChange={this.onLayoutChange}
                  onDrop={this.onDrop}
                  isBounded={true}
                  isResizable={Boolean(this.state.mode === 'edit')}
                  isDraggable={Boolean(this.state.mode === 'edit')}
                  measureBeforeMount={false}
                  compactType={this.state.compactType}
                  preventCollision={!this.state.compactType}
                  breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                  useCSSTransforms={this.state.mounted}
                >
                  {this.getAccessDashBoard('ErrorListDashboard', 'totalIssuesCard') ? (
                    <div key='totalIssuesCard' {...this.divProps('totalIssuesCard')}>
                      <TotalIssuesCard {...this.cardProps('totalIssuesCard')} />
                    </div>
                  ) : (
                    null
                  )}
                  {this.getAccessDashBoard('ErrorListDashboard', 'fixedIssuesCard' ) ? (
                    <div key='fixedIssuesCard' {...this.divProps('fixedIssuesCard')}>
                      <FixedIssuesCard {...this.cardProps('fixedIssuesCard')} />
                    </div>
                  ) : (
                    null
                  )}
                  {this.getAccessDashBoard('ErrorListDashboard', 'pendingIssuesCard' ) ? (
                    <div key='pendingIssuesCard' {...this.divProps('pendingIssuesCard')}>
                      <PendingIssuesCard {...this.cardProps('pendingIssuesCard')} />
                    </div>
                  ) : (
                    null
                  )}
                </ResponsiveReactGridLayout>
              ) : (
                <>Loading...</>
              )}
            </div>
          </>) : null
        }
        
        {this.storage?.company_type === 2323 ? (
          <>
            <div style={dashboardScrollContainerStyle}>
              {Object.keys(this.state.layouts).length > 0 &&
                Object.keys(this.state.cardVisibility).length > 0 ? (
                <ResponsiveReactGridLayout
                  {...this.props}
                  {...dashboardGridLayoutProps}
                  layouts={this.state.layouts}
                  onBreakpointChange={this.onBreakpointChange}
                  onLayoutChange={this.onLayoutChange}
                  onDrop={this.onDrop}
                  isBounded={true}
                  isResizable={Boolean(this.state.mode === 'edit')}
                  isDraggable={Boolean(this.state.mode === 'edit')}
                  measureBeforeMount={false}
                  compactType={this.state.compactType}
                  preventCollision={!this.state.compactType}
                  breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                  useCSSTransforms={this.state.mounted}
                >
                  {/* PayrollDashboard  --------------------------------------------------------------------------------------------------------*/}
                  {this.getAccessDashBoard(
                    'PayrollDashboard',
                    'employeeCard',
                  ) ? (
                    <div key='employeeCard' {...this.divProps('employeeCard')}>
                      <EmployeeCard {...this.cardProps('employeeCard')} />
                    </div>
                  ) : (
                    null
                  )}

                  {this.getAccessDashBoard(
                    'PayrollDashboard',
                    'lateCheckCard',
                  ) ? (
                    <div key='lateCheckCard' {...this.divProps('lateCheckCard')}>
                      <LateCheckCards {...this.cardProps('lateCheckCard')} />
                    </div>
                  ) : (
                    null
                  )}

                  {this.getAccessDashBoard(
                    'PayrollDashboard',
                    'earlyCheckoutCard',
                  ) ? (
                    <div key='earlyCheckoutCard' {...this.divProps('earlyCheckoutCard')}>
                      <EarlyCheckoutCards
                        {...this.cardProps('earlyCheckoutCard')}
                      />
                    </div>
                  ) : (
                    null
                  )}

                  {this.getAccessDashBoard(
                    'PayrollDashboard',
                    'holidayCard',
                  ) ? (
                    <div key='holidayCard' {...this.divProps('holidayCard')}>
                      <HolidayCards {...this.cardProps('holidayCard')} />
                    </div>
                  ) : (
                    null
                  )}

                  {this.getAccessDashBoard(
                    'PayrollDashboard',
                    'checkedInCard',
                  ) ? (
                    <div key='checkedInCard' {...this.divProps('checkedInCard')}>
                      <CheckedIn
                        {...this.cardProps('checkedInCard')}
                        type='DASHBOARD'
                      />
                    </div>
                  ) : (
                    null
                  )}

                  {/* {this.getAccessDashBoard(
                    'PayrollDashboard',
                    'notCheckedInCard',
                  ) ? (
                    <div key='notCheckedInCard' {...this.divProps('notCheckedInCard')}>
                      <NotCheckedIn
                        {...this.cardProps('notCheckedInCard')}
                        type='DASHBOARD'
                      />
                    </div>
                  ) : (
                    null
                  )} */}

                  {this.getAccessDashBoard(
                    'PayrollDashboard',
                    'lateLoginCard',
                  ) ? (
                    <div key='lateLoginCard' {...this.divProps('lateLoginCard')}>
                      <LateLogin
                        {...this.cardProps('lateLoginCard')}
                        type='DASHBOARD'
                      />
                    </div>
                  ) : (
                    null
                  )}

                  {this.getAccessDashBoard(
                    'PayrollDashboard',
                    'locationWiseAttendanceCard',
                  ) ? (
                    <div key='locationWiseAttendanceCard' {...this.divProps('locationWiseAttendanceCard')}>
                      <LocationWiseAttendance
                        {...this.cardProps('locationWiseAttendanceCard')}
                        type='DASHBOARD'
                      />
                    </div>
                  ) : (
                    null
                  )}

                  {/* {this.getAccessDashBoard('PayrollDashboard', 'completeListCard') ? (
                      <div key='completeListCard' {...this.divProps('completeListCard')}>
                        <CompleteList {...this.cardProps('completeListCard')} />
                      </div>
                    ) : (
                      null
                    )} */}

                  {this.getAccessDashBoard(
                    'PayrollDashboard',
                    'leavesStatusCard',
                  ) ? (
                    <div key='leavesStatusCard' {...this.divProps('leavesStatusCard')}>
                      <LeavesStatus
                        {...this.cardProps('leavesStatusCard')}
                        type='DASHBOARD'
                      />
                    </div>
                  ) : (
                    null
                  )}

                  {this.getAccessDashBoard(
                    'PayrollDashboard',
                    'averageWorkHoursCard',
                  ) ? (
                    <div key='averageWorkHoursCard' {...this.divProps('averageWorkHoursCard')}>
                      <AverageWorkHours
                        {...this.cardProps('averageWorkHoursCard')}
                        type='DASHBOARD'
                      />
                    </div>
                  ) : (
                    null
                  )}
                </ResponsiveReactGridLayout>
              ) : (
                <>Loading...</>
              )}
            </div>
          </>
        ) : (
          null
        )}

     

        {![6].includes(this.storage?.company_type) ? (
          <>
          
          <div style={dashboardScrollContainerStyle}>
            {/* <div>
                Current Breakpoint: {this.state.currentBreakpoint} (
                {this.props.cols[this.state.currentBreakpoint]} columns)
              </div>
              <div>
                Compaction type:{' '}
                {_.capitalize(this.state.compactType) || 'No Compaction'}
              </div>
              <button onClick={this.onNewLayout}>Generate New Layout</button>
              <button onClick={this.onCompactTypeChange}>
                Change Compaction Type
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                }}
              >
                Clear local storage
              </button>
              <button
                onClick={() => {
                  this.el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Scroll to bottom
              </button>
              <div className='layoutJSON'>
                Displayed as <code>[x, y, w, h]</code>:
                <div className='columns'>{this.stringifyLayout()}</div>
              </div> */}
            {Object.keys(this.state.layouts).length > 0 &&
              Object.keys(this.state.cardVisibility).length > 0 ? (
              <ResponsiveReactGridLayout
                {...this.props}
                {...dashboardGridLayoutProps}
                layouts={this.state.layouts}
                onBreakpointChange={this.onBreakpointChange}
                onLayoutChange={this.onLayoutChange}
                onDrop={this.onDrop}
                isBounded={true}
                isResizable={Boolean(this.state.mode === 'edit')}
                isDraggable={Boolean(this.state.mode === 'edit')}
                measureBeforeMount={false}
                compactType={this.state.compactType}
                preventCollision={!this.state.compactType}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                useCSSTransforms={this.state.mounted}
              >
                {/* ExpensesAnalysis -------------------------------------------------------------------------------------------------------- */}
                {this.getAccessDashBoard('ExpensesAnalysis', 'totalCard') ? (
                  <div key='totalCard' {...this.divProps('totalCard')}>
                    <TotalCard {...this.cardProps('totalCard')} />
                  </div>
                ) : (
                  null
                )}
              

                {this.getAccessDashBoard(
                  'ExpensesAnalysis',
                  'expenseCard',
                ) ? (
                  <div key='expenseCard' {...this.divProps('expenseCard')}>
                    <ExpenseCard {...this.cardProps('expenseCard')} />
                  </div>
                ) : (
                  null
                )}

              {this.getAccessDashBoard('AssetAnalysis', 'assetCondition') ? (
                                <div key='assetCondition' {...this.divProps('assetCondition')}>
                                  <AssetCondition {...this.cardProps('assetCondition')} />
                                </div>
                              ) : (
                                null
                              )}
              {this.getAccessDashBoard('AssetAnalysis', 'pendingAudits') ? (
                                <div key='pendingAudits' {...this.divProps('pendingAudits')}>
                                  <PendingAudit {...this.cardProps('pendingAudits')} />
                                </div>
                              ) : (
                                null
                              )}
                              

              {this.getAccessDashBoard('AssetAnalysis','auditCount') ? (
                                <div key='auditCount' {...this.divProps('auditCount')}>
                                  <PendingAuditsCard {...this.cardProps('auditCount')} />
                                </div>
                              ) :(
                                null
                              )
            
            }

            {
              this.getAccessDashBoard('AssetAnalysis', 'serviceDueCount') ? (
                <div key='serviceDueCount' {...this.divProps('serviceDueCount')}>
                  <ServiceDueCountCard {...this.cardProps('serviceDueCount')} />
                </div>
              ) : (
                null
              )
           }

           {
            this.getAccessDashBoard('AssetAnalysis', 'insuranceRenewalCount') ? (
              <div key='insuranceRenewalCount' {...this.divProps('insuranceRenewalCount')}>
                <InsuranceRenewalCountCard {...this.cardProps('insuranceRenewalCount')} />
              </div>
            ) : (
              null
            )
           }

           {
            this.getAccessDashBoard('AssetAnalysis', 'assignedCount') ? (
              <div key='assignedCount' {...this.divProps('assignedCount')}>
                <AssignedCountCard {...this.cardProps('assignedCount')} />
              </div>
            ) : (
              null
            )
           }

           {
            this.getAccessDashBoard('AssetAnalysis', 'assetStatus') ? (
              <div key='assetStatus' {...this.divProps('assetStatus')}>
                <AssetStatusChart {...this.cardProps('assetStatus')} />
              </div>
            ) : (
              null
            )
           }

           {
            this.getAccessDashBoard('AssetAnalysis', 'assetLocation') ? (
              <div key='assetLocation' {...this.divProps('assetLocation')}>
                <AssetLocationCard {...this.cardProps('assetLocation')} />
                </div>
            ) : (
              null
            )
           }  

           {
            this.getAccessDashBoard('AssetAnalysis', 'assetTypeCount') ? (
              <div key='assetTypeCount' {...this.divProps('assetTypeCount')}>
                <AssetTypeCountChart {...this.cardProps('assetTypeCount')} />
              </div>
            ) : (
              null
            )
           }

           {
            this.getAccessDashBoard('AssetAnalysis', 'totalFascalYear') ? (
              <div key='totalFascalYear' {...this.divProps('totalFascalYear')}>
                <TotalYearValueCard {...this.cardProps('totalFascalYear')} />
              </div>
            ) : (
              null
            )
           }

           

              {this.getAccessDashBoard('AssetAnalysis','totalAssetValue') ? (
                                              <div key='totalAssetValue' {...this.divProps('totalAssetValue')}>
                                                <TotalAssetValueCard {...this.cardProps('totalAssetValue')} />
                                              </div>
                                            ) :(
                                              null
                                            )
                          
                          }
              {this.getAccessDashBoard('AssetAnalysis','warrantyExpired') ? (
                                              <div key='warrantyExpired' {...this.divProps('warrantyExpired')}>
                                                <WarrantyExpireCount {...this.cardProps('warrantyExpired')} />
                                              </div>
                                            ) :(
                                              null
                                            )
                          
                          }  

                 {this.getAccessDashBoard('AssetAnalysis','unAssigned') ? (
                                              <div key='unAssigned' {...this.divProps('unAssigned')}>
                                                <UnAssignedCard {...this.cardProps('unAssigned')} />
                                              </div>
                                            ) :(
                                              null
                                            )
                          
                          } 

{this.getAccessDashBoard('AssetAnalysis','noOfAssets') ? (
                                              <div key='noOfAssets' {...this.divProps('noOfAssets')}>
                                                <TotalAssets {...this.cardProps('noOfAssets')} />
                                              </div>
                                            ) :(
                                              null
                                            )
                          
                          } 

                  {
                    this.getAccessDashBoard('AssetAnalysis','UnAudited') ? (
                      <div key='UnAudited' {...this.divProps('UnAudited')}>
                        <UnAuditedCard {...this.cardProps('UnAudited')}/>

                      </div>
                    )
                    :
                    null
                  }

                  {
                    this.getAccessDashBoard('AssetAnalysis','topAssetsByValue') ? (
                      <div key='topAssetsByValue' {...this.divProps('topAssetsByValue')}>
                        <TopAssetsByValue {...this.cardProps('topAssetsByValue')}
                          type='DASHBOARD'
                        />
                      </div>
                    )
                    :
                    null
                  }  

                  {/* ---------- leads -------------  */}

                  {
                    this.getAccessDashBoard('LeadsAnalysis','leadsBySource') ? (
                      <div key='leadsBySource' {...this.divProps('leadsBySource')}>
                        <LeadBySource {...this.cardProps('leadsBySource')}
                        type = 'DASHBOARD'
                        />

                      </div>
                    )
                    :
                    null
                  }

                  {
                    this.getAccessDashBoard('LeadsAnalysis','approxValueBySource') ? (
                      <div key='approxValueBySource' {...this.divProps('approxValueBySource')}>
                        <SalesPipelineByLeadSource {...this.cardProps('approxValueBySource')}
                        type = 'DASHBOARD'
                        />

                      </div>
                    )
                    :
                    null
                  }
                  {
                    this.getAccessDashBoard('LeadsAnalysis','todaysLeads') ? (
                      <div key='todaysLeads' {...this.divProps('todaysLeads')}>
                        <TodaysLeads {...this.cardProps('todaysLeads')}
                        type = 'DASHBOARD'
                        />

                      </div>
                    )
                    :
                    null
                  }

                  {
                    this.getAccessDashBoard('LeadsAnalysis','myOpenTasks') ? (
                      <div key='myOpenTasks' {...this.divProps('myOpenTasks')}>
                        <MyOpenTasks {...this.cardProps('myOpenTasks')}
                        type = 'DASHBOARD'
                        />

                      </div>
                    )
                    :
                    null
                  }

{
                    this.getAccessDashBoard('LeadsAnalysis','myMeetings') ? (
                      <div key='myMeetings' {...this.divProps('myMeetings')}>
                        <MyMeetings {...this.cardProps('myMeetings')}
                        type = 'DASHBOARD'
                        />

                      </div>
                    )
                    :
                    null
                  }

                  
                  {
                    this.getAccessDashBoard('LeadsAnalysis','totalLeads') ? (
                      <div key='totalLeads' {...this.divProps('totalLeads')}>
                        <TotalLeads {...this.cardProps('totalLeads')}
                        type = 'DASHBOARD'
                        />

                      </div>
                    )
                    :
                    null
                  }

                {this.getAccessDashBoard('LeadsAnalysis', 'customerGrowth') ? (
                  <div key='customerGrowth' {...this.divProps('customerGrowth')}>
                    <CustomerGrowthChart {...this.cardProps('customerGrowth')} />
                  </div>
                ) : (
                  null
                )}

                  {
                    this.getAccessDashBoard('LeadsAnalysis','totalLeadsValue') ? (
                      <div key='totalLeadsValue' {...this.divProps('totalLeadsValue')}>
                        <TotalLeadsValue {...this.cardProps('totalLeadsValue')}
                        type = 'DASHBOARD'
                        />

                      </div>
                    )
                    :
                    null
                  }

                  {
                    this.getAccessDashBoard('LeadsAnalysis','leadsComparision') ? (
                      <div key='leadsComparision' {...this.divProps('leadsComparision')}>
                        <LeadComparision {...this.cardProps('leadsComparision')}
                        type = 'DASHBOARD'
                        />

                      </div>
                    )
                    :
                    null
                  }

{
                    this.getAccessDashBoard('LeadsAnalysis','leadsPipeline') ? (
                      <div key='leadsPipeline' {...this.divProps('leadsPipeline')}>
                        <LeadsPineline {...this.cardProps('leadsPipeline')}
                        type = 'DASHBOARD'
                        />

                      </div>
                    )
                    :
                    null
                  }

                    {
                    this.getAccessDashBoard('LeadsAnalysis', 'convertedLeadsCount') ? (
                      <div key='convertedLeadsCount' {...this.divProps('convertedLeadsCount')}>
                        <ConvertedLeadsCountCard {...this.cardProps('convertedLeadsCount')} />
                      </div>
                    ) : (
                      null
                    )
                  }

                  {
                    this.getAccessDashBoard('LeadsAnalysis', 'convertedLeadsValue') ? (
                      <div key='convertedLeadsValue' {...this.divProps('convertedLeadsValue')}>
                        <ConvertedLeadsValueCard {...this.cardProps('convertedLeadsValue')} />
                      </div>
                    ) : (
                      null
                    )
                  }

                  {
                    this.getAccessDashBoard('LeadsAnalysis', 'convertedLeadsAndValues') ? (
                      <div key='convertedLeadsAndValues' {...this.divProps('convertedLeadsAndValues')}>
                        <ConvertedLeadsAndValuesChart {...this.cardProps('convertedLeadsAndValues')} />
                      </div>
                    ) : (
                      null
                    )
                  }

                  {
                    this.getAccessDashBoard('LeadsAnalysis', 'salesLeads') ? (
                      <div key='salesLeads' {...this.divProps('salesLeads')}>
                        <SalesLeadsChart {...this.cardProps('salesLeads')} />
                      </div>
                    ) : (
                      null
                    )
                  }

                  {
                    this.getAccessDashBoard('LeadsAnalysis', 'closedLeads') ? (
                      <div key='closedLeads' {...this.divProps('closedLeads')}>
                        <ClosedLeadsChart {...this.cardProps('convertedLeadsValue')} />
                      </div>
                    ) : (
                      null
                    )
                  }

                  {
                    this.getAccessDashBoard('LeadsAnalysis', 'leadsDailyReport') ? (
                      <div key='leadsDailyReport' {...this.divProps('leadsDailyReport')}>
                        <LeadsDailyReport {...this.cardProps('leadsDailyReport')} />
                      </div>
                    ) : (
                      null
                    )
                  }

                  {
                    this.getAccessDashBoard('LeadsAnalysis', 'workingContactedCount') ? (
                      <div key='workingContactedCount' {...this.divProps('workingContactedCount')}>
                        <WorkingContactedCard {...this.cardProps('workingContactedCount')} />
                      </div>
                    ) : (
                      null
                    )
                  }

                  {
                    this.getAccessDashBoard('LeadsAnalysis', 'openNotContactedCount') ? (
                      <div key='openNotContactedCount' {...this.divProps('openNotContactedCount')}>
                        <OpenNotContactedCard {...this.cardProps('openNotContactedCount')} />
                      </div>
                    ) : (
                      null
                    )
                  }

                  {
                    this.getAccessDashBoard('LeadsAnalysis', 'closedNotConvertedCount') ? (
                      <div key='closedNotConvertedCount' {...this.divProps('closedNotConvertedCount')}>
                        <ClosedNotConvertedCard {...this.cardProps('closedNotConvertedCount')} />
                      </div>
                    ) : (
                      null
                    )
                  }

                {this.getAccessDashBoard(
                  'ExpensesAnalysis',
                  'spendingCard',
                ) ? (
                  <div key='spendingCard' {...this.divProps('spendingCard')}>
                    <SpendingCard {...this.cardProps('spendingCard')} />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard('ExpensesAnalysis', 'pieCard') ? (
                  <div key='pieCard' {...this.divProps('pieCard')}>
                    <PieChart {...this.cardProps('pieCard')} />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard('ExpensesAnalysis', 'areaCard') ? (
                  <div key='areaCard' {...this.divProps('areaCard')}>
                    <AreaChart {...this.cardProps('areaCard')} />
                  </div>
                ) : (
                  null
                )}

                {/* ProfitLoss Dashboard  --------------------------------------------------------------------------------------------------------  */}
                {/* {this.getAccessDashBoard(
                  'ProfitLossDashboard',
                  'filterCard',
                ) ? (
                  <div key='filterCard' {...this.divProps('filterCard')}>
                    <Filters
                      {...this.cardProps('filterCard')}
                      handleDate={(fromDate, toDate) =>
                        this.handleDate(fromDate, toDate)
                      }
                      activeButton={this.state.activeButton}
                      setActiveButton={(val) => {
                        this.setState({ activeButton: val });
                      }}
                    />
                  </div>
                ) 
                : (
                  null
                )} */}

                {/* {this.getAccessDashBoard(
                  'ProfitLossDashboard',
                  'filterButtonCard',
                ) ? (
                  <div key='filterButtonCard' {...this.divProps('filterButtonCard')}>
                    <FilterButtonGroup
                      {...this.cardProps('filterButtonCard')}
                      filters={this.state.filters}
                      breakdownfilters={this.state.breakdownfilters}
                      setFilters={(val) => {
                        this.setState({ filters: val });
                      }}
                      setbreakdownFilters={(val) => {
                        this.setState({ breakdownfilters: val });
                      }}
                      activeButton={this.state.activeButton}
                      setActiveButton={(val) => {
                        this.setState({ activeButton: val });
                      }}
                    />
                  </div>
                ) : (
                  null
                )} */}

                {this.getAccessDashBoard(
                  'ProfitLossDashboard',
                  'revenueCard',
                ) ? (
                  <div key='revenueCard' {...this.divProps('revenueCard')}>
                    <RevenueAndCost
                      {...this.cardProps('revenueCard')}
                      RevenueAndCost={this.state.filters}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'ProfitLossDashboard',
                  'profitCard',
                ) ? (
                  <div key='profitCard' {...this.divProps('profitCard')}>
                    <Profit
                      {...this.cardProps('profitCard')}
                      profit={this.state.filters}
                      // breakDown={this.state.breakdownfilters}

                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'ProfitLossDashboard',
                  'breakDownCard',
                ) ? (
                  <div key='breakDownCard' {...this.divProps('breakDownCard')}>
                    <BreakDown
                      {...this.cardProps('breakDownCard')}
                      breakDown={this.state.breakdownfilters}
                    />
                  </div>
                ) : (
                  null
                )}

                {/* Payable Receivable Dashboard  -------------------------------------------------------------------------------------------------------- */}
                {this.getAccessDashBoard(
                  'PayableReceivableDashboard',
                  'receivablesCard',
                ) ? (
                  <div key='receivablesCard' {...this.divProps('receivablesCard')}>
                    <TotalAccountsReceivables
                      {...this.cardProps('receivablesCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'PayableReceivableDashboard',
                  'payableCard',
                ) ? (
                  <div key='payableCard' {...this.divProps('payableCard')}>
                    <TotalAccountsPayable
                      {...this.cardProps('payableCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'PayableReceivableDashboard',
                  'totalPayableReceivableCard',
                ) ? (
                  <div key='totalPayableReceivableCard' {...this.divProps('totalPayableReceivableCard')}>
                    <TotalAccountsPayableReceivableAging
                      {...this.cardProps('totalPayableReceivableCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'PayableReceivableDashboard',
                  'totalReceivableCard',
                ) ? (
                  <div key='totalReceivableCard' {...this.divProps('totalReceivableCard')}>
                    <TotalReceivables
                      {...this.cardProps('totalReceivableCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'PayableReceivableDashboard',
                  'totalPayableCard',
                ) ? (
                  <div key='totalPayableCard' {...this.divProps('totalPayableCard')}>
                    <TotalPayables {...this.cardProps('totalPayableCard')} />
                  </div>
                ) : (
                  null
                )}

                {/* InventoryMD  -------------------------------------------------------------------------------------------------------- */}
                {this.getAccessDashBoard(
                  'InventoryMD',
                  'stockSummaryCard',
                ) ? (
                  <div key='stockSummaryCard' {...this.divProps('stockSummaryCard')}>
                    <StockSummary {...this.cardProps('stockSummaryCard')} />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard('InventoryMD', 'locateStockCard') ? (
                  <div key='locateStockCard' {...this.divProps('locateStockCard')}>
                    <LocateStock {...this.cardProps('locateStockCard')} />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard('InventoryMD', 'availStockCard') ? (
                  <div key='availStockCard' {...this.divProps('availStockCard')}>
                    <AvailStock {...this.cardProps('availStockCard')} />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'InventoryMD',
                  'nonmoveCategoryCard',
                ) ? (
                  <div key='nonmoveCategoryCard' {...this.divProps('nonmoveCategoryCard')}>
                    <NonmoveCategory
                      {...this.cardProps('nonmoveCategoryCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                {/* LineChart  -------------------------------------------------------------------------------------------------------- */}
                {this.getAccessDashBoard('LineChart', 'linechartCard') ? (
                  <div key='linechartCard' {...this.divProps('linechartCard')}>
                    <Linechart {...this.cardProps('linechartCard')} />
                  </div>
                ) : (
                  null
                )}

                {/* Cashflow -------------------------------------------------------------------------------------------------------- */}
                {this.getAccessDashBoard('CashFlow', 'cashFlowCard') ? (
                  <div key='cashFlowCard' {...this.divProps('cashFlowCard')}>
                    <CashFlow {...this.cardProps('cashFlowCard')} />
                  </div>
                ) : (
                  null
                )}

                {/* Sales Dashboard  -------------------------------------------------------------------------------------------------------- */}
                {this.getAccessDashBoard(
                  'SalesDashboard',
                  'totalSalesCard',
                ) ? (
                  <div key='totalSalesCard' {...this.divProps('totalSalesCard')}>
                    <TotalSales {...this.cardProps('totalSalesCard')} />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'SalesDashboard',
                  'brandSalesCard',
                ) ? (
                  <div key='brandSalesCard' {...this.divProps('brandSalesCard')}>
                    <BrandSales {...this.cardProps('brandSalesCard')} />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'SalesDashboard',
                  'salesComparisonCard',
                ) ? (
                  <div key='salesComparisonCard' {...this.divProps('salesComparisonCard')}>
                    <SalesComparison
                      {...this.cardProps('salesComparisonCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'SalesDashboard',
                  'areaWiseSaleCard',
                ) ? (
                  <div key='areaWiseSaleCard' {...this.divProps('areaWiseSaleCard')}>
                    <AreaWiseSaleCard
                      {...this.cardProps('areaWiseSaleCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'SalesDashboard',
                  'todaySalesCard',
                ) ? (
                  <div key='todaySalesCard' {...this.divProps('todaySalesCard')}>
                    <TodaySales {...this.cardProps('todaySalesCard')} />
                  </div>
                ) : (
                  null
                )}

                {/* PosUserDashboard  --------------------------------------------------------------------------------------------------------*/}
                {this.getAccessDashBoard(
                  'PosUserDashboard',
                  'salesTodayCard',
                ) ? (
                  <div key='salesTodayCard' {...this.divProps('salesTodayCard')}>
                    <SalesToday {...this.cardProps('salesTodayCard')} />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'PosUserDashboard',
                  'cashInHandCard',
                ) ? (
                  <div key='cashInHandCard' {...this.divProps('cashInHandCard')}>
                    <CashInHand {...this.cardProps('cashInHandCard')} />
                  </div>
                ) : (
                  null
                    )}
                    
                {this.getAccessDashBoard(
                  'PosUserDashboard',
                  'bankBalanceCard',
                ) ? (
                  <div key='bankBalanceCard' {...this.divProps('bankBalanceCard')}>
                    <BankBalance {...this.cardProps('bankBalanceCard')} />
                  </div>
                ) : (
                  null
                    )}
                    
                {this.getAccessDashBoard(
                  'PosUserDashboard',
                  'unReconciliateCard',
                ) ? (
                  <div key='unReconciliateCard' {...this.divProps('unReconciliateCard')}>
                    <UnReconciliate {...this.cardProps('unReconciliateCard')} />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'PosUserDashboard',
                  'targetAchievementCard',
                ) ? (
                  <div key='targetAchievementCard' {...this.divProps('targetAchievementCard')}>
                    <TargetAchievement
                      {...this.cardProps('targetAchievementCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'PosUserDashboard',
                  'posSummaryCard',
                ) ? (
                  <div key='posSummaryCard' {...this.divProps('posSummaryCard')}>
                    <PosSummary {...this.cardProps('posSummaryCard')} />
                  </div>
                ) : (
                  null
                )}

                {/* SalesManDashboard  --------------------------------------------------------------------------------------------------------*/}
                {this.getAccessDashBoard(
                  'SalesManDashboard',
                  'currentSaleCard',
                ) ? (
                  <div key='currentSaleCard' {...this.divProps('currentSaleCard')}>
                    <CurrentSale {...this.cardProps('currentSaleCard')} />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'SalesManDashboard',
                  'targetSaleCard',
                ) ? (
                  <div key='targetSaleCard' {...this.divProps('targetSaleCard')}>
                    <TargetSale {...this.cardProps('targetSaleCard')} />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'SalesManDashboard',
                  'customerBilledCard',
                ) ? (
                  <div key='customerBilledCard' {...this.divProps('customerBilledCard')}>
                    <CustomerBilled
                      {...this.cardProps('customerBilledCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'SalesManDashboard',
                  'customerUnBilledCard',
                ) ? (
                  <div key='customerUnBilledCard' {...this.divProps('customerUnBilledCard')}>
                    <CustomerUnBilled
                      {...this.cardProps('customerUnBilledCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'SalesManDashboard',
                  'topSalesCard',
                ) ? (
                  <div key='topSalesCard' {...this.divProps('topSalesCard')}>
                    <TopSales {...this.cardProps('topSalesCard')} />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'SalesManDashboard',
                  'TotalOutstanding',
                ) ? (
                  <div key='TotalOutstanding' {...this.divProps('TotalOutstanding')}>
                    <TotalOutstandingCard
                      {...this.cardProps('TotalOutstanding')}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard('SalesManDashboard', 'OverDue') ? (
                  <div key='OverDue' {...this.divProps('OverDue')}>
                    <OverDueCard {...this.cardProps('OverDue')} />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'SalesManDashboard',
                  'CollectToday',
                ) ? (
                  <div key='CollectToday' {...this.divProps('CollectToday')}>
                    <CollectTodayCard {...this.cardProps('CollectToday')} />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'SalesManDashboard',
                  'CollectOverDue',
                ) ? (
                  <div key='CollectOverDue' {...this.divProps('CollectOverDue')}>
                    <CollectOverDueCard
                      {...this.cardProps('CollectOverDue')}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'SalesManDashboard',
                  'CollectStatus',
                ) ? (
                  <div key='CollectStatus' {...this.divProps('CollectStatus')}>
                    <CollectStatusCard {...this.cardProps('CollectStatus')} />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'SalesManDashboard',
                  'TopTenOutstanding',
                ) ? (
                  <div key='TopTenOutstanding' {...this.divProps('TopTenOutstanding')}>
                    <TopTenOutstandingCard
                      {...this.cardProps('TopTenOutstanding')}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'CustomerCard',
                  'outstandingReceivedCard',
                ) ? (
                  <div key='outstandingReceivedCard' {...this.divProps('outstandingReceivedCard')}>
                    <OutstandingReceivedCard
                      {...this.cardProps('outstandingReceivedCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'CustomerCard',
                  'unusedCreditsCard',
                ) ? (
                  <div key='unusedCreditsCard' {...this.divProps('unusedCreditsCard')}>
                    <UnusedCredits
                      {...this.cardProps('unusedCreditsCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'CustomerCard',
                  'creditDaysCard',
                ) ? (
                  <div key='creditDaysCard' {...this.divProps('creditDaysCard')}>
                    <CreditDaysAndLimit
                      {...this.cardProps('creditDaysCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'CustomerCard',
                  'totalBillsCard',
                ) ? (
                  <div key='totalBillsCard' {...this.divProps('totalBillsCard')}>
                    <TotalBills
                      {...this.cardProps('totalBillsCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'CustomerCard',
                  'unpaidBillsCard',
                ) ? (
                  <div key='unpaidBillsCard' {...this.divProps('unpaidBillsCard')}>
                    <UnpaidBills
                      {...this.cardProps('unpaidBillsCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'CustomerCard',
                  'averageCreditDaysCard',
                ) ? (
                  <div key='averageCreditDaysCard' {...this.divProps('averageCreditDaysCard')}>
                    <AverageCreditDays
                      {...this.cardProps('averageCreditDaysCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'CustomerCard',
                  'averageBillingCard',
                ) ? (
                  <div key='averageBillingCard' {...this.divProps('averageBillingCard')}>
                    <AverageBillingCycle
                      {...this.cardProps('averageBillingCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'CustomerCard',
                  'incomeCard',
                ) ? (
                  <div key='incomeCard' {...this.divProps('incomeCard')}>
                    <Income
                      {...this.cardProps('incomeCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                {/* visitsReport  --------------------------------------------------------------------------------------------------------*/}
                {this.getAccessDashBoard(
                  'visitsReport',
                  'visitsReportCard',
                ) ? (
                  <div key='visitsReportCard' {...this.divProps('visitsReportCard')}>
                    <VisitsReport {...this.cardProps('visitsReportCard')} />
                  </div>
                ) : (
                  null
                )}

                {/* PayrollDashboard  --------------------------------------------------------------------------------------------------------*/}
                {this.getAccessDashBoard(
                      'ApprovedCard',
                      'approvedCard',
                    ) ? ( 
                      <div key='approvedCard' {...this.divProps('approvedCard')}>
                        <ApprovedCard {...this.cardProps('approvedCard')} />
                      </div>
                    ) : (
                      null
                    )}
                {this.getAccessDashBoard(
                  'EmployeeCard',
                  'employeeCard',
                ) ? (
                  <div key='employeeCard' {...this.divProps('employeeCard')}>
                    <EmployeeCard {...this.cardProps('employeeCard')} />
                  </div>
                ) : (
                  null
                    )}
                    {this.getAccessDashBoard(
                      'EarlyLateLog',
                      'earlyCheckIn',
                    ) ? (
                      <div key='earlyCheckIn' {...this.divProps('earlyCheckIn')}>
                        <EarlyCheckIn {...this.cardProps('earlyCheckIn')} />
                      </div>
                    ) : (
                      null
                    )}
                    {this.getAccessDashBoard(
                      'AttendanceCard',
                      'absentCard',
                    ) ? (
                      <div key='absentCard' {...this.divProps('absentCard')}>
                        <AbsentCard {...this.cardProps('absentCard')} />
                      </div>
                    ) : (
                      null
                    )}
                     {this.getAccessDashBoard(
                      'AttendanceCard',
                      'attendanceCombinedCard',
                    ) ? (
                      <div key='attendanceCombinedCard' {...this.divProps('attendanceCombinedCard')}>
                        <AttendanceCombinedCard {...this.cardProps('attendanceCombinedCard')} />
                      </div>
                    ) : (
                      null
                    )}
                    {this.getAccessDashBoard(
                      'AttendanceCard',
                      'presentCard',
                    ) ? (
                      <div key='presentCard' {...this.divProps('presentCard')}>
                        <PresentCard {...this.cardProps('presentCard')} />
                      </div>
                    ) : (
                      null
                    )}
                {this.getAccessDashBoard(
                  'EarlyLateLog',
                  'lateCheckCard',
                ) ? (
                  <div key='lateCheckCard' {...this.divProps('lateCheckCard')}>
                    <LateCheckCards {...this.cardProps('lateCheckCard')} />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'EarlyLateLog',
                  'earlyCheckoutCard',
                ) ? (
                  <div key='earlyCheckoutCard' {...this.divProps('earlyCheckoutCard')}>
                    <EarlyCheckoutCards
                      {...this.cardProps('earlyCheckoutCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                        {this.getAccessDashBoard(
                          'LoansCard',
                          'activeLoans',
                        ) ? (
                          <div key='activeLoans' {...this.divProps('activeLoans')}>
                            <Activeloans
                              {...this.cardProps('activeLoans')}
                            />
                          </div>
                        ) : (
                          null
                        )}

                        {this.getAccessDashBoard(
                          'RequestCard',
                          'openRequests',
                        ) ? (
                          <div key='openRequests' {...this.divProps('openRequests')}>
                            <OpenRequests
                              {...this.cardProps('openRequests')}
                            />
                          </div>
                        ) : (
                          null
                        )}

                {this.getAccessDashBoard(
                  'HolidayCard',
                  'holidayCard',
                ) ? (
                  <div key='holidayCard' {...this.divProps('holidayCard')}>
                    <HolidayCards {...this.cardProps('holidayCard')} />
                  </div>
                ) : (
                  null
                        )}
                        {/* {
                          this.props.announcements_list.length > 0 ? (roleType.includes(this.storage?.role_name) ? (
                            this.getAccessDashBoard('AnnouncementCard', 'announcement') ? (
                              <div key='announcement' {...this.divProps('announcement')}>
                                <AnnouncementCard {...this.cardProps('announcement')} type='DASHBOARD' />
                              </div>
                            ) : (
                              null
                            )
                          ) : (
                            isPresent ? (
                              this.getAccessDashBoard('AnnouncementCard', 'announcement') ? (
                                <div key='announcement' {...this.divProps('announcement')}>
                                  <AnnouncementCard {...this.cardProps('announcement')} type='DASHBOARD' />
                                </div>
                              ) : (
                                null
                              )
                            ) : (
                              null
                            )
                          )) : null
                        } */}

                {this.getAccessDashBoard(
                  'CheckInOutLog',
                  'checkedInCard',
                ) ? (
                  <div key='checkedInCard' {...this.divProps('checkedInCard')}>
                    <CheckedIn
                      {...this.cardProps('checkedInCard')}
                      type='DASHBOARD'
                    />
                  </div>
                ) : (
                  null
                )}

                {/* {this.getAccessDashBoard(
                  'CheckInOutLog',
                  'notCheckedInCard',
                ) ? (
                  <div key='notCheckedInCard' {...this.divProps('notCheckedInCard')}>
                    <NotCheckedIn
                      {...this.cardProps('notCheckedInCard')}
                      type='DASHBOARD'
                            />
                          </div>
                        ) : (
                          null
                        )} */}
                        {this.getAccessDashBoard(
                          'EmployeeCard',
                          'experienceCard',
                        ) ? (
                          <div key='experienceCard' {...this.divProps('experienceCard')}>
                            <Experience
                              {...this.cardProps('experienceCard')}
                              type='DASHBOARD'
                            />
                          </div>
                        ) : (
                          null
                        )}
                         {this.getAccessDashBoard(
                          'EmployeeCard',
                          'GenderRatio',
                        ) ? (
                          <div key='GenderRatio' {...this.divProps('GenderRatio')}>
                            <GenderRatio
                              {...this.cardProps('GenderRatio')}
                            />
                          </div>
                        ) : (
                          null
                        )}
                         {this.getAccessDashBoard(
                          'EmployeeCard',
                          'EmployeeBasedDepartment',
                        ) ? (
                          <div key='EmployeeBasedDepartment' {...this.divProps('EmployeeBasedDepartment')}>
                            <EmployeesByDepartment
                              {...this.cardProps('EmployeeBasedDepartment')}
                            />
                          </div>
                        ) : (
                          null
                        )}
                         {this.getAccessDashBoard(
                          'EmployeeCard',
                          'eventsForAdminCard',
                        ) ? (
                          <div key='eventsForAdminCard' {...this.divProps('eventsForAdminCard')}>
                            <EventsCard
                              {...this.cardProps('eventsForAdminCard')}
                            />
                          </div>
                        ) : (
                          null
                        )}
                        {this.getAccessDashBoard(
                          'EmployeeCard',
                          'LeaveTypeDistribution',
                        ) ? (
                          <div key='LeaveTypeDistribution' {...this.divProps('LeaveTypeDistribution')}>
                            <LeaveTypeDistribution
                              {...this.cardProps('LeaveTypeDistribution')}
                            />
                          </div>
                        ) : (
                          null
                        )}
                        {this.getAccessDashBoard(
                          'AttendanceCard',
                          'AttendanceByDep',
                        ) ? (
                          <div key='AttendanceByDep' {...this.divProps('AttendanceByDep')}>
                            <AttendanceByDep
                              {...this.cardProps('AttendanceByDep')}
                            />
                          </div>
                        ) : (
                          null
                        )}
                         {this.getAccessDashBoard(
                          'EmployeeRoleCards',
                          'EmployeeLateCheckCards',
                        ) ? (
                          <div key='EmployeeLateCheckCards' {...this.divProps('EmployeeLateCheckCards')}>
                            <EmployeeLateCheckCards
                              {...this.cardProps('EmployeeLateCheckCards')}
                              type='DASHBOARD'
                            />
                          </div>
                        ) : (
                          null
                        )} 
                        {this.getAccessDashBoard(
                          'EmployeeRoleCards',
                          'EarlyCheckoutEmp',
                        ) ? (
                          <div key='EarlyCheckoutEmp' {...this.divProps('EarlyCheckoutEmp')}>
                            <EarlyCheckoutEmp
                              {...this.cardProps('EarlyCheckoutEmp')}
                              type='DASHBOARD'
                            />
                          </div>
                        ) : (
                          null
                        )}
                        {this.getAccessDashBoard(
                          'EmployeeRoleCards',
                          'EmployeeLeaveCountCards',
                        ) ? (
                          <div key='EmployeeLeaveCountCards' {...this.divProps('EmployeeLeaveCountCards')}>
                            <EmployeeLeaveCountCards
                              {...this.cardProps('EmployeeLeaveCountCards')}
                              type='DASHBOARD'
                            />
                          </div>
                        ) : (
                          null
                        )}
                         {this.getAccessDashBoard(
                          'EmployeeRoleCards',
                          'EmployeePermissionCountCard',
                        ) ? (
                          <div key='EmployeePermissionCountCard' {...this.divProps('EmployeePermissionCountCard')}>
                            <EmployeePermissionCountCard
                              {...this.cardProps('EmployeePermissionCountCard')}
                              type='DASHBOARD'
                            />
                          </div>
                        ) : (
                          null
                        )}
                        {this.getAccessDashBoard(
                          'EmployeeRoleCards',
                          'TotalDaysWorkedCountCard',
                        ) ? (
                          <div key='TotalDaysWorkedCountCard' {...this.divProps('TotalDaysWorkedCountCard')}>
                            <TotalDaysWorkedCountCard
                              {...this.cardProps('TotalDaysWorkedCountCard')}
                              type='DASHBOARD'
                            />
                          </div>
                        ) : (
                          null
                        )}
                         {this.getAccessDashBoard(
                          'EmployeeRoleCards',
                          'EmployeeActiveLoans',
                        ) ? (
                          <div key='EmployeeActiveLoans' {...this.divProps('EmployeeActiveLoans')}>
                            <EmployeeactiveLoans
                              {...this.cardProps('EmployeeActiveLoans')}
                              type='DASHBOARD'
                            />
                          </div>
                        ) : (
                          null
                        )}
                         {this.getAccessDashBoard(
                          'EmployeeRoleCards',
                          'EmployeeRankScoreCard',
                        ) ? (
                          <div key='EmployeeRankScoreCard' {...this.divProps('EmployeeRankScoreCard')}>
                            <EmployeeRankScoreCard
                              {...this.cardProps('EmployeeRankScoreCard')}
                              type='DASHBOARD'
                            />
                          </div>
                        ) : (
                          null
                        )}
                         {this.getAccessDashBoard(
                          'EmployeeRoleCards',
                          'LeaveBalanceCard',
                        ) ? (
                          <div key='LeaveBalanceCard' {...this.divProps('LeaveBalanceCard')}>
                            <LeaveBalanceCard
                              {...this.cardProps('LeaveBalanceCard')}
                              type='DASHBOARD'
                            />
                          </div>
                        ) : (
                          null
                        )}

                        {this.getAccessDashBoard(
                          'EmployeeRoleCards',
                          'EmployeeRequests',
                        ) ? (
                          <div key='EmployeeRequests' {...this.divProps('EmployeeRequests')}>
                            <EmployeeRequestsCard
                              {...this.cardProps('EmployeeRequests')}
                              type='DASHBOARD'
                            />
                          </div>
                        ) : (
                          null
                        )}
                        {this.getAccessDashBoard(
                          'EmployeeRoleCards',
                          'eventsCard',
                        ) ? (
                          <div key='eventsCard' {...this.divProps('eventsCard')}>
                            <EventsCard
                              {...this.cardProps('eventsCard')}
                              type='DASHBOARD'
                            />
                          </div>
                        ) : (
                          null
                        )}

                        
                        {this.getAccessDashBoard(
                          'EmployeeRoleCards',
                          'EmployeeAttendanceCorrection',
                        ) ? (
                          <div key='EmployeeAttendanceCorrection' {...this.divProps('EmployeeAttendanceCorrection')}>
                            <EmployeeAttCorrection
                              {...this.cardProps('EmployeeAttendanceCorrection')}
                              type='DASHBOARD'
                            />
                          </div>
                        ) : (
                          null
                        )}

                        {this.getAccessDashBoard(
                          'EmployeeRoleCards',
                          'EmployeeLeaveAndPermission',
                        ) ? (
                          <div key='EmployeeLeaveAndPermission' {...this.divProps('EmployeeLeaveAndPermission')}>
                            <EmployeeLeaveAndPermission
                              {...this.cardProps('EmployeeLeaveAndPermission')}
                              type='DASHBOARD'
                            />
                          </div>
                        ) : (
                          null
                        )}

                        {this.getAccessDashBoard(
                          'EarlyLateLog',
                          'lateLoginCard',
                ) ? (
                  <div key='lateLoginCard' {...this.divProps('lateLoginCard')}>
                    <LateLogin
                      {...this.cardProps('lateLoginCard')}
                      type='DASHBOARD'
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                    'AttendanceCard',
                    'locationWiseAttendanceCard',
                  ) ? (
                    <div key='locationWiseAttendanceCard' {...this.divProps('locationWiseAttendanceCard')}>
                      <LocationWiseAttendance
                        {...this.cardProps('locationWiseAttendanceCard')}
                        type='DASHBOARD'
                      />
                    </div>
                  ) : (
                    null
                  )}

                  {this.getAccessDashBoard(
                    'AttendanceCard',
                    'OverallAttendance',
                  ) ? (
                    <div key='OverallAttendance' {...this.divProps('OverallAttendance')}>
                      <OverallAttendance
                        {...this.cardProps('OverallAttendance')}
                        type='DASHBOARD'
                      />
                    </div>
                  ) : (
                    null
                  )}

                  {this.getAccessDashBoard(
                    'AttendanceCard',
                    'AttendanceStatistics',
                  ) ? (
                    <div key='AttendanceStatistics' {...this.divProps('AttendanceStatistics')}>
                      <AttendanceStatistics
                        {...this.cardProps('AttendanceStatistics')}
                        type='DASHBOARD'
                      />
                    </div>
                  ) : (
                    null
                  )}

{this.getAccessDashBoard(
                    'ManagerRoleCards',
                    'LeaveAndPermissionCardForDepartmentHead',
                  ) && department_head === 1 && role_name === 'Manager'  ? (
                    <div key='LeaveAndPermissionCardForDepartmentHead' {...this.divProps('LeaveAndPermissionCardForDepartmentHead')}>
                      <LeaveAndPermissionCardForDepartmentHead
                        {...this.cardProps('LeaveAndPermissionCardForDepartmentHead')}
                        type='DASHBOARD'
                      />
                    </div>
                  ) : (
                    null
                  )}
                  {this.getAccessDashBoard(
                    'ManagerRoleCards',
                    'CheckInOutForDepartmentHead',
                  ) && department_head === 1 && role_name === 'Manager' ? (
                    <div key='CheckInOutForDepartmentHead' {...this.divProps('CheckInOutForDepartmentHead')}>
                      <CheckInOutForDepartmentHead
                        {...this.cardProps('CheckInOutForDepartmentHead')}
                        type='DASHBOARD'
                      />
                    </div>
                  ) : (
                    null
                  )}
                {this.getAccessDashBoard(
                    'RatingCard',
                    'attendanceRate',
                  ) ? (
                    <div key='attendanceRate' {...this.divProps('attendanceRate')}>
                      <Attendancerate
                        {...this.cardProps('attendanceRate')}
                        type='DASHBOARD'
                      />
                    </div>
                  ) : (
                    null
                  )}

                {this.getAccessDashBoard(
                    'RatingCard',
                    'topEmpByAttendance',
                  ) ? (
                    <div key='topEmpByAttendance' {...this.divProps('topEmpByAttendance')}>
                      <TopEmpByAttendance
                        {...this.cardProps('topEmpByAttendance')}
                        type='DASHBOARD'
                      />
                    </div>
                  ) : (
                    null
                  )}
                        {this.getAccessDashBoard(
                          'RatingCard',
                          'costSummary',
                        ) ? (
                          <div key='costSummary' {...this.divProps('costSummary')}>
                            <CostSummary
                              {...this.cardProps('costSummary')}
                              type='DASHBOARD'
                            />
                          </div>
                        ) : (
                          null
                        )}

                {/* {this.getAccessDashBoard(
                  'PayrollDashboard',
                  'completeListCard',
                ) ? (
                  <div key='completeListCard' {...this.divProps('completeListCard')}>
                    <CompleteList
                      {...this.cardProps('completeListCard')}
                      type='DASHBOARD'
                    />
                  </div>
                ) : (
                  null
                )} */}

                {this.getAccessDashBoard(
                  'AttendanceCard',
                  'leavesStatusCard',
                ) ? (
                  <div key='leavesStatusCard' {...this.divProps('leavesStatusCard')}>
                    <LeavesStatus
                      {...this.cardProps('leavesStatusCard')}
                      type='DASHBOARD'
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'RatingCard',
                  'averageWorkHoursCard',
                ) ? (
                  <div key='averageWorkHoursCard' {...this.divProps('averageWorkHoursCard')}>
                    <AverageWorkHours
                      {...this.cardProps('averageWorkHoursCard')}
                      type='DASHBOARD'
                    />
                  </div>
                ) : (
                  null
                )}
                       
                       {
                          this.getAccessDashBoard('Salary', 'EmployeeSalaryByDepartmentAndCategory') ? (
                            <div key='EmployeeSalaryByDepartmentAndCategory' {...this.divProps('EmployeeSalaryByDepartmentAndCategory')}>
                              <EmployeeSalaryByDept {...this.cardProps('EmployeeSalaryByDepartmentAndCategory')} 
                              type='DASHBOARD'
                              />
                            </div>
                          ) : (
                            null
                          )}
                        {
                          this.getAccessDashBoard('Timesheet', 'WorkLoad') ? (
                            <div key='WorkLoad' {...this.divProps('WorkLoad')}>
                              <WorkLoadChart {...this.cardProps('WorkLoad')} />
                            </div>
                          ) : (
                            null
                          )
                        }

                        {
                          this.getAccessDashBoard('Timesheet', 'TaskCreatedAndResolved') ? (
                            <div key='TaskCreatedAndResolved' {...this.divProps('TaskCreatedAndResolved')}>
                              <CreatedAndResolved {...this.cardProps('TaskCreatedAndResolved')} />
                            </div>
                          ) : (
                            null
                          )
                        }

                        
                        {
                          this.getAccessDashBoard('Timesheet', 'WorkLogCard') ? (
                            <div key='WorkLogCard' {...this.divProps('WorkLogCard')}>
                              <WorkLog {...this.cardProps('WorkLogCard')} />
                            </div>
                          ) : (
                            null
                          )
                        }

                        {
                          this.getAccessDashBoard('Timesheet', 'LogReportCard') ? (
                            <div key='LogReportCard' {...this.divProps('LogReportCard')}>
                              <LogReport {...this.cardProps('LogReportCard')} />
                            </div>
                          ) : (
                            null
                          )
                        }
  {
                          this.getAccessDashBoard('LineChart', 'CashBankCard') ? (
                            <div key='CashBankCard' {...this.divProps('CashBankCard')}>
                              <CashBank {...this.cardProps('CashBankCard')} />
                            </div>
                          ) : (
                            null
                          )
                        }
                        

                {/* WidgetsDetails  --------------------------------------------------------------------------------------------------------*/}
                {this.getAccessDashBoard('WidgetsDetails', 'saleCard') ? (
                  <div key='saleCard' {...this.divProps('saleCard')}>
                    <SaleCard {...this.cardProps('saleCard')} />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'WidgetsDetails',
                  'widgetGrossProfitCard',
                ) ? (
                  <div key='widgetGrossProfitCard' {...this.divProps('widgetGrossProfitCard')}>
                    <WidgetGrossProfit
                      {...this.cardProps('widgetGrossProfitCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard('WidgetsDetails', 'roiCard') ? (
                  <div key='roiCard' {...this.divProps('roiCard')}>
                    <RoiCard {...this.cardProps('roiCard')} />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'WidgetsDetails',
                  'netProfitCard',
                ) ? (
                  <div key='netProfitCard' {...this.divProps('netProfitCard')}>
                    <NetProfit {...this.cardProps('netProfitCard')} />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'WidgetsDetails',
                  'widgetTopSalesCard',
                ) ? (
                  <div key='widgetTopSalesCard' {...this.divProps('widgetTopSalesCard')}>
                    <WidgetTopSales
                      {...this.cardProps('widgetTopSalesCard')}
                    />
                  </div>
                ) : (
                  null
                )}

                {/* ChequeBounces  --------------------------------------------------------------------------------------------------------*/}
                {this.getAccessDashBoard(
                  'WidgetsDetails',
                  'ChequeBounces',
                ) ? (
                  <div key='ChequeBounces' {...this.divProps('ChequeBounces')}>
                    <ChequeBounces {...this.cardProps('ChequeBounces')} />
                  </div>
                ) : (
                  null
                )}

                {this.getAccessDashBoard(
                  'WidgetsDetails',
                  'companyLoanDue',
                ) ? (
                  <div key='companyLoanDue' {...this.divProps('companyLoanDue')}>
                    <LoanDueDashboard {...this.cardProps('companyLoanDue')} type='DASHBOARD' />
                  </div>
                ) : (
                  null
                )}
                {this.getAccessDashBoard(
                          'AttendanceCard',
                          'InCount',
                        ) ? (
                          <div key='InCount' {...this.divProps('InCount')}>
                            <CheckedInClients
                              {...this.cardProps('InCount')}
                              type='DASHBOARD'
                            />
                          </div>
                        ) : (
                          null
                        )} 
                        {this.getAccessDashBoard(
                          'AttendanceCard',
                          'OutCount',
                        ) ? (
                          <div key='OutCount' {...this.divProps('OutCount')}>
                            <NotCkeckedInClients
                              {...this.cardProps('OutCount')}
                              type='DASHBOARD'
                            />
                          </div>
                        ) : (
                          null
                        )}
                        {this.getAccessDashBoard(
                          'AttendanceCard',
                          'LocationAttendance',
                        ) ? (
                          <div key='LocationAttendance' {...this.divProps('LocationAttendance')}>
                            <LocationAttendance
                              {...this.cardProps('LocationAttendance')}
                              type='DASHBOARD'
                            />
                          </div>
                        ) : (
                          null
                        )}
                         {this.getAccessDashBoard(
                          'AttendanceCard',
                          'CheckInDetails',
                        ) ? (
                          <div key='CheckInDetails' {...this.divProps('CheckInDetails')}>
                            <CheckInOut
                              {...this.cardProps('CheckInDetails')}
                              type='DASHBOARD'
                            />
                          </div>
                        ) : (
                          null
                        )}
                        {this.getAccessDashBoard(
                          'ClientDetailsCard',
                          'TotalClient',
                        ) ? (
                          <div key='TotalClient' {...this.divProps('TotalClient')}>
                            <TotalCount
                              {...this.cardProps('TotalClient')}
                              type='DASHBOARD'
                            />
                          </div>
                        ) : (
                          null
                        )}
              </ResponsiveReactGridLayout>
            ) : (
              <>Loading...</>
            )}
            {/* <button
                ref={el => { this.el = el; }}
                onClick={() => {
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                });
                }}
              >
                Scroll to Top
              </button> */}
          </div>
           </>
        ) : null}

        {
          <Grid>
            <Dialog
            open={this.state.resetOpen}
            // onClose={this.handleCloseReasonDialog}

            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="dashboard-dialog-title">
              {"Reset confirmation!"}
            </DialogTitle>
            <DialogContent style={{width: '25vw'}}>
              <DialogContentText id="dashboard-dialog-description">
                Are you sure want to reset?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button variant='contained' onClick={this.resetLayoutChanges}>Reset</Button>
              <Button variant='contained' onClick={this.handleCloseReasonDialog}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
          </Grid>
        }
          </div> 
        : ''
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    getalldashboarddata: state.DashboardRoleReducer.getalldashboarddata || [],
    dashboardRoleData: state.DashboardRoleReducer.dashboardRoleData || [],
    month : state.ProfitLossDashboardReducer.month,
    breakdownmonth : state.ProfitLossDashboardReducer.breakdownmonth,
    breakdownday : state.ProfitLossDashboardReducer.breakdownday,
    getByDate : state.ProfitLossDashboardReducer.getByDate,
    dashboardLayouts: state.DashboardRoleReducer.dashboardLayouts || {},
    cardVisibility: state.DashboardRoleReducer.cardVisibility || {},
    isCardEnabled: state.DashboardRoleReducer.isCardEnabled || [],
    dashboardPollTimerIds: state.DashboardRoleReducer.dashboardPollTimerIds || [],
    announcements_list : state.PayrolldashboardReducers.announcements_list || [],
    getsessiondetail : state.UserCreationReducer.getsessiondetail || [],
    dashboardData: state.DashboardRoleReducer.dashboardData || [],
    listrole:state.roleReducer.listrole,
    getThemes:state.UserCreationReducer.getThemes
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getDashboardRoleDataAction: (role_id, response) => {
      return dispatch(getDashboardRoleDataAction(role_id, response));
    },
    listroleAction: () => {
      return dispatch(listroleAction());
    },
    getAppConfigDataAction: () => {
      return dispatch(getAppConfigDataAction())
    },
    // getDashboardRoleDataAction: (role_id) => {
    //   dispatch(getDashboardRoleDataAction(role_id)).then((response) => {
    //     if (response && response.length) {
    //       // console.log('sdfefere',response)
    //       this.setState({ ...this.state, dashRoleData: true });
    //     }
    //   });
    // },

    listDashboardAction: () => {
      return dispatch(listDashboardAction());
    },

    getDashboardLayoutActions: (data) => {
      return dispatch(getDashboardLayoutActions(data));
    },
    checkedInAction: (data) => {
      return dispatch(checkedInAction(data));
    },
    notCheckedInAction: (data) => {
      return dispatch(notCheckedInAction(data));
    },
    listAllLeaveRequestAction: (leaveData, employee_id, setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(listAllLeaveRequestAction(leaveData, employee_id, setModalTypeHandler, setLoaderStatusHandler));
    },
    lateLoginEarlyCheckoutAction: () => {
      return dispatch(lateLoginEarlyCheckoutAction());
    },
    getAnnouncements: () => {
      return dispatch(getAnnouncements());
    },

    update_dashboardLayoutAction: (data) => {
      return dispatch(update_dashboardLayoutAction(data));
    },
    reset_dashboardLayoutAction: (data, result) => {
      return dispatch(reset_dashboardLayoutAction(data, result));
    },
    CreateNotificationAction: (data) => {
      return dispatch(CreateNotificationAction(data));
    },
    resetDashboardPollingTimerIdsAction: () => {
      return dispatch(resetDashboardPollingTimerIdsAction());
    },
    employeeCountAction: (setLoaderStatusHandler, setModalTypeHandler) => {
      return dispatch(employeeCountAction(setLoaderStatusHandler, setModalTypeHandler));
    },
    listErrorDashboardAction: (body, setLoaderStatusHandler, setModalTypeHandler) => {
      return dispatch(listErrorDashboardAction(body, setLoaderStatusHandler, setModalTypeHandler));
    },
    restrictNewCreationBasedOnPlanAction : () =>{
      return dispatch(restrictNewCreationBasedOnPlanAction());
     },
     getDashboardDataAction : () =>{
      return dispatch(getDashboardDataAction());
     },
     getThemesAction : (employee_id) =>{
      return dispatch(getThemesAction(employee_id));
     },

    getByDateAction:(
      fromDate,
      toDate,
      headerLocationId,
      data
    ) => {
        return dispatch(
          getByDateAction(
            fromDate,
            toDate,
            headerLocationId,
            data,
          ),
        )  
    }
  };
};

// const DispatchActions = () => {
//   const dispatch = useDispatch();
//   dispatch(getDashboardRoleDataAction(this.storage?.role_id, 
//     (response) => {
//       if(response.length){
//         this.setState({ ...this.state, dashRoleData : response })
//       }
//     }
//   ))
//   return null; 
// };

export default connect(mapStateToProps, mapDispatchToProps)(ShowcaseLayout);


function getLayoutData(){
  let data = localStorage.getItem(getKey());
  if(data){
    let layouts = JSON.parse(data).layouts;
    return layouts;
  }else{
    return setLayoutData();
  }
}


function setLayoutData(layout = null){
  let key = getKey()
  if(layout === null){
    let data = localStorage.getItem(key);
    if(!data){
      let temp = {
        layouts: {
          lg: generateLayout_lg(), 
          md: generateLayout_md(), 
          sm : generateLayout_sm(), 
          xs : generateLayout_xs(),
          xxs: generateLayout_xxs()
        }
      }
      localStorage.setItem(key, JSON.stringify(temp))
    }
  }else{
    localStorage.setItem(key, JSON.stringify({layouts: layout}))
  }
  return JSON.parse( localStorage.getItem(key) ).layouts;
}

function getKey(){
  let cookies = new Cookies();
  const {employee_id, company_id} = cookies.get('login')
  let key = `EMP_${employee_id}_COM_${company_id}`
  return key;
}

function getDefaultLayout(bp){
  switch(bp){
    case 'lg':
      return generateLayout_lg()
    case 'md':
    return generateLayout_md()
    case 'sm':
    return generateLayout_sm()
    case 'xs':
    return generateLayout_xs()
    case 'xxs':
    return generateLayout_xxs()
  }
}

function generateLayout_lg() { // lg : 12 col
  return [
    // ExpensesAnalysis
    { x: 0, y: 0, w: 4, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'totalCard'},
    { x: 4, y: 0, w: 4, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'expenseCard'},
    { x: 8, y: 0, w: 4, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'spendingCard'},
    { x: 0, y: 1, w: 6, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'pieCard'},
    { x: 6, y: 1, w: 6, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'areaCard'},
  
    // ProfitLossDashboard
    { x: 0, y: 2, w: 4, h: 27, minW: 3, maxW: 4, minH: 27, maxH: 30, i: 'filterCard'},
    { x: 4, y: 2, w: 8, h: 2, minW: 4, maxW: 12, minH: 2, maxH: 2, i: 'filterButtonCard'},
    { x: 4, y: 3, w: 8, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'revenueCard'},
    { x: 4, y: 4, w: 8, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'profitCard'},
    { x: 4, y: 5, w: 8, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'breakDownCard' },

    // PayableReceivableDashboard
    { x: 0, y: 6, w: 4, h: 6, minW: 3, maxW: 3, minH: 3, maxH: 3, i: 'receivablesCard' },
    { x: 0, y: 7, w: 4, h: 6, minW: 3, maxW: 3, minH: 3, maxH: 3, i: 'payableCard' },
    { x: 4, y: 6, w: 8, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'totalPayableReceivableCard' },
    { x: 0, y: 7, w: 6, h: 7, minW: 6, maxW: 12, minH: 3, maxH: 15, i: 'totalReceivableCard' },//-------
    { x: 6, y: 7, w: 6, h: 7, minW: 6, maxW: 12, minH: 3, maxH: 15, i: 'totalPayableCard' },//-------

    // InventoryMD
    { x: 0, y: 8, w: 6, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'locateStockCard'},
    { x: 6, y: 8, w: 6, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'stockSummaryCard'},
    { x: 0, y: 9, w: 12, h: 3, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'availStockCard'},//-------
    { x: 0, y: 9, w: 12, h: 14, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'nonmoveCategoryCard'},

    // LineChart
    { x: 0, y: 10, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'linechartCard'},

    // cashFlow
    { x: 0, y: 10, w: 12, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'cashFlowCard'},

    // SalesDashboard
    { x: 0, y: 11, w: 6, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'totalSalesCard'},
    { x: 6, y: 11, w: 6, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'brandSalesCard'},
    { x: 0, y: 12, w: 6, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'salesComparisonCard'},
    { x: 6, y: 12, w: 6, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'areaWiseSaleCard'},
    { x: 0, y: 13, w: 12, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'todaySalesCard'}, //-------


    // PosUserDashboard
    { x: 0, y: 13, w: 4, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'salesTodayCard'},
    { x: 4, y: 13, w: 4, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'cashInHandCard'},
    { x: 8, y: 13, w: 4, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'targetAchievementCard'},
    { x: 0, y: 14, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'posSummaryCard'},

    // SalesManDashboard
    { x: 0, y: 15, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'currentSaleCard'},
    { x: 3, y: 15, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'targetSaleCard'},
    { x: 6, y: 15, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'customerBilledCard'},
    { x: 9, y: 15, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'customerUnBilledCard'},
    { x: 0, y: 16, w: 12, h: 11, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'topSalesCard'},
    { x: 0, y: 17, w: 4, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'TotalOutstanding'},
    { x: 4, y: 17, w: 4, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'OverDue'},
    { x: 8, y: 17, w: 4, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'CollectToday'},
    { x: 2, y: 18, w: 4, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'CollectOverDue'},
    { x: 6, y: 18, w: 4, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'CollectStatus'},
    { x: 0, y: 19, w: 12, h: 11, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'TopTenOutstanding'},

    // visitsReport
    { x: 0, y: 19, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'visitsReportCard'},

    // PayrollDashboard
    { x: 0, y: 20, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'employeeCard'},
    { x: 3, y: 20, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'lateCheckCard'},
    { x: 6, y: 20, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'earlyCheckoutCard'},
    { x: 9, y: 20, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'holidayCard'},
    { x: 0, y: 21, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'checkedInCard'},
    { x: 0, y: 22, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'notCheckedInCard'},
    { x: 0, y: 23, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'lateLoginCard'},
    { x: 0, y: 24, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'completeListCard'},
    { x: 0, y: 23, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'leavesStatusCard'},
    { x: 0, y: 23, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'averageWorkHoursCard'},
    { x: 0, y: 25, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'locationWiseAttendanceCard'},

    // WidgetsDetails
    { x: 0, y: 25, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'saleCard'},
    { x: 3, y: 25, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'widgetGrossProfitCard'},
    { x: 6, y: 25, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'roiCard'},
    { x: 9, y: 25, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'netProfitCard'},
    { x: 0, y: 26, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'widgetTopSalesCard'},

    // ChequeBounces
    { x: 0, y: 27, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'ChequeBounces'},



  ];
}

function generateLayout_md() { // md : 10 col
  return [
    // ExpensesAnalysis
    { x: 0, y: 0, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'totalCard'},
    { x: 3, y: 0, w: 4, h: 3, minW: 4, maxW: 4, minH: 3, maxH: 3, i: 'expenseCard'},
    { x: 7, y: 0, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'spendingCard'},
    { x: 0, y: 1, w: 5, h: 10, minW: 5, maxW: 6, minH: 3, maxH: 12, i: 'pieCard'},
    { x: 5, y: 1, w: 5, h: 10, minW: 5, maxW: 6, minH: 3, maxH: 12, i: 'areaCard'},
  
    // ProfitLossDashboard
    { x: 0, y: 3, w: 3, h: 27, minW: 3, maxW: 4, minH: 27, maxH: 30, i: 'filterCard'},
    { x: 0, y: 2, w: 10, h: 2, minW: 4, maxW: 12, minH: 2, maxH: 2, i: 'filterButtonCard'},
    { x: 4, y: 3, w: 7, h: 9, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'revenueCard'},
    { x: 4, y: 4, w: 7, h: 9, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'profitCard'},
    { x: 4, y: 5, w: 7, h: 9, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'breakDownCard'},

    // PayableReceivableDashboard
    { x: 0, y: 6, w: 3, h: 6, minW: 3, maxW: 3, minH: 3, maxH: 3, i: 'receivablesCard' },
    { x: 0, y: 7, w: 3, h: 6, minW: 3, maxW: 3, minH: 3, maxH: 3, i: 'payableCard' },
    { x: 4, y: 6, w: 7, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'totalPayableReceivableCard' },
    { x: 0, y: 7, w: 5, h: 7, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'totalReceivableCard' },//-------
    { x: 5, y: 7, w: 5, h: 7, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'totalPayableCard' },//-------

    // InventoryMD
    { x: 0, y: 8, w: 5, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'locateStockCard'},
    { x: 5, y: 8, w: 5, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'stockSummaryCard'},
    { x: 0, y: 9, w: 10, h: 3, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'availStockCard'},//-------
    { x: 0, y: 9, w: 10, h: 14, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'nonmoveCategoryCard'},

    // LineChart
    { x: 0, y: 10, w: 10, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'linechartCard'},

    // cashFlow
    { x: 0, y: 10, w: 10, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'cashFlowCard'},

    // SalesDashboard
    { x: 0, y: 11, w: 5, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'totalSalesCard'},
    { x: 5, y: 11, w: 5, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'brandSalesCard'},
    { x: 0, y: 12, w: 5, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'salesComparisonCard'},
    { x: 5, y: 12, w: 5, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'areaWiseSaleCard'},
    { x: 0, y: 13, w: 12, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'todaySalesCard'}, //-------


    // PosUserDashboard
    { x: 0, y: 13, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'salesTodayCard'},
    { x: 3, y: 13, w: 4, h: 3, minW: 4, maxW: 4, minH: 3, maxH: 3, i: 'cashInHandCard'},
    { x: 7, y: 13, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'targetAchievementCard'},
    { x: 0, y: 14, w: 10, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'posSummaryCard'},

    // SalesManDashboard
    { x: 0, y: 15, w: 5, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'currentSaleCard'},
    { x: 5, y: 15, w: 5, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'targetSaleCard'},
    { x: 0, y: 16, w: 5, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'customerBilledCard'},
    { x: 5, y: 16, w: 5, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'customerUnBilledCard'},
    { x: 0, y: 17, w: 12, h: 11, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'topSalesCard'},
    { x: 0, y: 18, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'TotalOutstanding'},
    { x: 3, y: 18, w: 4, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'OverDue'},
    { x: 7, y: 18, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'CollectToday'},
    { x: 1, y: 19, w: 4, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'CollectOverDue'},
    { x: 5, y: 19, w: 4, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'CollectStatus'},
    { x: 0, y: 20, w: 12, h: 11, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'TopTenOutstanding'},

    // visitsReport
    { x: 0, y: 21, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'visitsReportCard'},

    // PayrollDashboard
    { x: 0, y: 22, w: 5, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'employeeCard'},
    { x: 5, y: 22, w: 5, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'lateCheckCard'},
    { x: 0, y: 23, w: 5, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'earlyCheckoutCard'},
    { x: 5, y: 23, w: 5, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'holidayCard'},
    { x: 0, y: 24, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'checkedInCard'},
    { x: 0, y: 25, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'notCheckedInCard'},
    { x: 0, y: 26, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'lateLoginCard'},
    { x: 0, y: 27, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'completeListCard'},
    { x: 0, y: 28, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'leavesStatusCard'},
    { x: 0, y: 29, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'averageWorkHoursCard'},

    { x: 0, y: 29, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'locationWiseAttendanceCard'},

    // WidgetsDetails
    { x: 0, y: 28, w: 5, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'saleCard'},
    { x: 5, y: 28, w: 5, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'widgetGrossProfitCard'},
    { x: 0, y: 29, w: 5, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'roiCard'},
    { x: 5, y: 29, w: 5, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'netProfitCard'},
    { x: 0, y: 30, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'widgetTopSalesCard'},

    // ChequeBounces
    { x: 0, y: 31, w: 12, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'ChequeBounces'},

  ];
}

function generateLayout_sm() { // sm : 6 col
  return [
    // ExpensesAnalysis
    { x: 0, y: 0, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'totalCard'},
    { x: 2, y: 0, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'expenseCard'},
    { x: 4, y: 0, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'spendingCard'},
    { x: 0, y: 1, w: 3, h: 10, minW: 3, maxW: 6, minH: 3, maxH: 12, i: 'pieCard'},
    { x: 3, y: 1, w: 3, h: 10, minW: 3, maxW: 6, minH: 3, maxH: 12, i: 'areaCard'},
  
    // ProfitLossDashboard
    { x: 0, y: 3, w: 2, h: 27, minW: 2, maxW: 4, minH: 27, maxH: 30, i: 'filterCard'},
    { x: 0, y: 2, w: 6, h: 2, minW: 4, maxW: 12, minH: 2, maxH: 2, i: 'filterButtonCard'},
    { x: 4, y: 3, w: 4, h: 9, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'revenueCard'},
    { x: 4, y: 4, w: 4, h: 9, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'profitCard'},
    { x: 4, y: 5, w: 4, h: 9, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'breakDownCard'},

    // PayableReceivableDashboard
    { x: 0, y: 6, w: 3, h: 6, minW: 3, maxW: 3, minH: 3, maxH: 3, i: 'receivablesCard' },
    { x: 3, y: 6, w: 3, h: 6, minW: 3, maxW: 3, minH: 3, maxH: 3, i: 'payableCard' },
    { x: 0, y: 7, w: 6, h: 11, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'totalPayableReceivableCard' },
    { x: 0, y: 7, w: 3, h: 7, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'totalReceivableCard' },//-------
    { x: 3, y: 7, w: 3, h: 7, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'totalPayableCard' },//-------

    // InventoryMD
    { x: 0, y: 8, w: 3, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'locateStockCard'},
    { x: 3, y: 8, w: 3, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'stockSummaryCard'},
    { x: 0, y: 9, w: 6, h: 3, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'availStockCard'},//-------
    { x: 0, y: 9, w: 6, h: 14, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'nonmoveCategoryCard'},

    // LineChart
    { x: 0, y: 9, w: 6, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'linechartCard'},

    // cashFlow
    { x: 0, y: 10, w: 6, h: 11, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'cashFlowCard'},

    // SalesDashboard
    { x: 0, y: 11, w: 3, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'totalSalesCard'},
    { x: 6, y: 11, w: 3, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'brandSalesCard'},
    { x: 0, y: 12, w: 3, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'salesComparisonCard'},
    { x: 6, y: 12, w: 3, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'areaWiseSaleCard'},
    { x: 0, y: 13, w: 6, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'todaySalesCard'}, //-------

    // PosUserDashboard
    { x: 0, y: 13, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'salesTodayCard'},
    { x: 2, y: 13, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'cashInHandCard'},
    { x: 4, y: 13, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'targetAchievementCard'},
    { x: 0, y: 14, w: 6, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'posSummaryCard'},

    // SalesManDashboard
    { x: 0, y: 15, w: 3, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'currentSaleCard'},
    { x: 3, y: 15, w: 3, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'targetSaleCard'},
    { x: 0, y: 16, w: 3, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'customerBilledCard'},
    { x: 3, y: 16, w: 3, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'customerUnBilledCard'},
    { x: 0, y: 17, w: 6, h: 11, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'topSalesCard'},
    { x: 0, y: 18, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'TotalOutstanding'},
    { x: 3, y: 18, w: 3, h: 3, minW: 3, maxW: 4, minH: 3, maxH: 3, i: 'OverDue'},
    { x: 0, y: 19, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'CollectToday'},
    { x: 2, y: 19, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'CollectOverDue'},
    { x: 4, y: 19, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'CollectStatus'},
    { x: 0, y: 20, w: 6, h: 11, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'TopTenOutstanding'},

    // visitsReport
    { x: 0, y: 21, w: 6, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'visitsReportCard'},

    // PayrollDashboard
    { x: 0, y: 22, w: 3, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'employeeCard'},
    { x: 3, y: 22, w: 3, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'lateCheckCard'},
    { x: 0, y: 23, w: 3, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'earlyCheckoutCard'},
    { x: 3, y: 23, w: 3, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'holidayCard'},
    { x: 0, y: 24, w: 6, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'checkedInCard'},
    { x: 0, y: 25, w: 6, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'notCheckedInCard'},
    { x: 0, y: 26, w: 6, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'lateLoginCard'},
    { x: 0, y: 27, w: 6, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'completeListCard'},
    { x: 0, y: 28, w: 6, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'leavesStatusCard'},
    { x: 0, y: 30, w: 6, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'averageWorkHoursCard'},
    { x: 0, y: 29, w: 6, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'locationWiseAttendanceCard'},
    
    // WidgetsDetails
    { x: 0, y: 28, w: 3, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'saleCard'},
    { x: 3, y: 28, w: 3, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'widgetGrossProfitCard'},
    { x: 0, y: 29, w: 3, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'roiCard'},
    { x: 3, y: 29, w: 3, h: 3, minW: 3, maxW: 5, minH: 3, maxH: 3, i: 'netProfitCard'},
    { x: 0, y: 30, w: 6, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'widgetTopSalesCard'},

    // ChequeBounces
    { x: 0, y: 30, w: 6, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'ChequeBounces'},
  
  
  ];
}
function generateLayout_xs() { // xs : 4 col
  return [
    // ExpensesAnalysis
    { x: 0, y: 0, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'totalCard'},
    { x: 2, y: 0, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'expenseCard'},
    { x: 1, y: 1, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'spendingCard'},
    { x: 0, y: 2, w: 2, h: 10, minW: 2, maxW: 6, minH: 3, maxH: 12, i: 'pieCard'},
    { x: 2, y: 3, w: 2, h: 10, minW: 2, maxW: 6, minH: 10, maxH: 12, i: 'areaCard'},
  
    // ProfitLossDashboard
    { x: 0, y: 5, w: 1, h: 27, minW: 2, maxW: 4, minH: 27, maxH: 30, i: 'filterCard'},
    { x: 0, y: 4, w: 4, h: 2, minW: 4, maxW: 12, minH: 2, maxH: 2, i: 'filterButtonCard'},
    { x: 4, y: 5, w: 3, h: 9, minW: 2, maxW: 12, minH: 3, maxH: 15, i: 'revenueCard'},
    { x: 4, y: 6, w: 3, h: 9, minW: 2, maxW: 12, minH: 3, maxH: 15, i: 'profitCard'},
    { x: 4, y: 7, w: 3, h: 9, minW: 2, maxW: 12, minH: 3, maxH: 15, i: 'breakDownCard'},

    // PayableReceivableDashboard
    { x: 0, y: 8, w: 2, h: 6, minW: 3, maxW: 3, minH: 3, maxH: 3, i: 'receivablesCard' },
    { x: 2, y: 8, w: 2, h: 6, minW: 3, maxW: 3, minH: 3, maxH: 3, i: 'payableCard' },
    { x: 0, y: 9, w: 4, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'totalPayableReceivableCard' },
    { x: 0, y: 9, w: 2, h: 6, minW: 6, maxW: 12, minH: 3, maxH: 15, i: 'totalReceivableCard' },//-------
    { x: 2, y: 9, w: 2, h: 6, minW: 6, maxW: 12, minH: 3, maxH: 15, i: 'totalPayableCard' },//-------

    // InventoryMD
    { x: 0, y: 8, w: 2, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'locateStockCard'},
    { x: 2, y: 8, w: 2, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'stockSummaryCard'},
    { x: 0, y: 9, w: 4, h: 3, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'availStockCard'},//-------
    { x: 0, y: 9, w: 4, h: 14, minW: 3, maxW: 12, minH: 3, maxH: 20, i: 'nonmoveCategoryCard'},

    // LineChart
    { x: 0, y: 9, w: 4, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 20, i: 'linechartCard'},

    // cashFlow
    { x: 0, y: 10, w: 4, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 20, i: 'cashFlowCard'},

    // SalesDashboard
    { x: 0, y: 11, w: 4, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'totalSalesCard'},
    { x: 0, y: 12, w: 4, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'brandSalesCard'},
    { x: 0, y: 13, w: 4, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'salesComparisonCard'},
    { x: 0, y: 14, w: 4, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'areaWiseSaleCard'},
    { x: 0, y: 15, w: 4, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'todaySalesCard'}, //-------

    // PosUserDashboard
    { x: 0, y: 15, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'salesTodayCard'},
    { x: 2, y: 15, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'cashInHandCard'},
    { x: 1, y: 16, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'targetAchievementCard'},
    { x: 0, y: 17, w: 4, h: 13, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'posSummaryCard'},

    // SalesManDashboard
    { x: 0, y: 18, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'currentSaleCard'},
    { x: 2, y: 18, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'targetSaleCard'},
    { x: 0, y: 19, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'customerBilledCard'},
    { x: 2, y: 19, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'customerUnBilledCard'},
    { x: 0, y: 20, w: 4, h: 11, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'topSalesCard'},
    { x: 0, y: 21, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'TotalOutstanding'},
    { x: 2, y: 21, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'OverDue'},
    { x: 0, y: 22, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'CollectToday'},
    { x: 2, y: 22, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'CollectOverDue'},
    { x: 1, y: 23, w: 4, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'CollectStatus'},
    { x: 0, y: 24, w: 4, h: 11, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'TopTenOutstanding'},

    // visitsReport
    { x: 0, y: 25, w: 4, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'visitsReportCard'},

    // PayrollDashboard
    { x: 0, y: 26, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'employeeCard'},
    { x: 2, y: 26, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'lateCheckCard'},
    { x: 0, y: 27, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'earlyCheckoutCard'},
    { x: 2, y: 27, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'holidayCard'},
    { x: 0, y: 28, w: 4, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'checkedInCard'},
    { x: 0, y: 29, w: 4, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'notCheckedInCard'},
    { x: 0, y: 30, w: 4, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'lateLoginCard'},
    { x: 0, y: 31, w: 4, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'completeListCard'},
    { x: 0, y: 30, w: 4, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'leavesStatusCard'},
    { x: 0, y: 31, w: 4, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'averageWorkHoursCard'},
    { x: 0, y: 32, w: 4, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'locationWiseAttendanceCard'},

    // WidgetsDetails
    { x: 0, y: 32, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'saleCard'},
    { x: 2, y: 32, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'widgetGrossProfitCard'},
    { x: 0, y: 33, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'roiCard'},
    { x: 2, y: 33, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'netProfitCard'},
    { x: 0, y: 34, w: 4, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'widgetTopSalesCard'},

    // ChequeBounces
    { x: 0, y: 35, w: 4, h: 12, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'ChequeBounces'},
  ];
}

function generateLayout_xxs(){ // xxs : 2 col
  return [
    // ExpensesAnalysis
    { x: 0, y: 0, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'totalCard'},
    { x: 0, y: 1, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'expenseCard'},
    { x: 0, y: 2, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'spendingCard'},
    { x: 0, y: 3, w: 2, h: 10, minW: 2, maxW: 6, minH: 3, maxH: 12, i: 'pieCard'},
    { x: 0, y: 4, w: 2, h: 10, minW: 2, maxW: 6, minH: 10, maxH: 12, i: 'areaCard'},

    // ProfitLossDashboard
    { x: 0, y: 5, w: 2, h: 27, minW: 2, maxW: 4, minH: 27, maxH: 30, i: 'filterCard'},
    { x: 0, y: 6, w: 2, h: 2, minW: 2, maxW: 12, minH: 2, maxH: 2, i: 'filterButtonCard'},
    { x: 0, y: 7, w: 2, h: 9, minW: 2, maxW: 12, minH: 3, maxH: 15, i: 'revenueCard'},
    { x: 0, y: 8, w: 2, h: 9, minW: 2, maxW: 12, minH: 3, maxH: 15, i: 'profitCard'},
    { x: 0, y: 9, w: 2, h: 9, minW: 2, maxW: 12, minH: 3, maxH: 15, i: 'breakDownCard'},

    // PayableReceivableDashboard
    { x: 0, y: 10, w: 2, h: 6, minW: 2, maxW: 3, minH: 3, maxH: 3, i: 'receivablesCard' },
    { x: 0, y: 11, w: 2, h: 6, minW: 2, maxW: 3, minH: 3, maxH: 3, i: 'payableCard' },
    { x: 0, y: 12, w: 2, h: 10, minW: 2, maxW: 12, minH: 3, maxH: 15, i: 'totalPayableReceivableCard' },
    { x: 0, y: 12, w: 2, h: 6, minW: 6, maxW: 12, minH: 3, maxH: 15, i: 'totalReceivableCard' },//-------
    { x: 0, y: 12, w: 2, h: 6, minW: 6, maxW: 12, minH: 3, maxH: 15, i: 'totalPayableCard' },//-------

    // InventoryMD
    { x: 0, y: 13, w: 2, h: 12, minW: 2, maxW: 12, minH: 3, maxH: 12, i: 'locateStockCard'},
    { x: 0, y: 14, w: 2, h: 12, minW: 2, maxW: 12, minH: 3, maxH: 12, i: 'stockSummaryCard'},
    { x: 0, y: 15, w: 2, h: 3, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'availStockCard'},//-------
    { x: 0, y: 15, w: 2, h: 15, minW: 2, maxW: 12, minH: 3, maxH: 35, i: 'nonmoveCategoryCard'},

    // LineChart
    { x: 0, y: 16, w: 2, h: 15, minW: 2, maxW: 12, minH: 3, maxH: 35, i: 'linechartCard'},

    // cashFlow
    {  x: 0, y: 17, w: 2, h: 20, minW: 2, maxW: 12, minH: 3, maxH: 35, i: 'cashFlowCard'},

    // SalesDashboard
    { x: 0, y: 18, w: 2, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'totalSalesCard'},
    { x: 0, y: 19, w: 2, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'brandSalesCard'},
    { x: 0, y: 20, w: 2, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'salesComparisonCard'},
    { x: 0, y: 21, w: 2, h: 10, minW: 3, maxW: 12, minH: 3, maxH: 12, i: 'areaWiseSaleCard'},
    { x: 0, y: 22, w: 2, h: 11, minW: 2, maxW: 12, minH: 3, maxH: 12, i: 'todaySalesCard'}, //-------

    // PosUserDashboard
    { x: 0, y: 22, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'salesTodayCard'},
    { x: 0, y: 23, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'cashInHandCard'},
    { x: 0, y: 24, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'targetAchievementCard'},
    { x: 0, y: 25, w: 2, h: 14, minW: 2, maxW: 12, minH: 3, maxH: 15, i: 'posSummaryCard'},

    
    // SalesManDashboard
    { x: 0, y: 26, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'currentSaleCard'},
    { x: 0, y: 27, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'targetSaleCard'},
    { x: 0, y: 28, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'customerBilledCard'},
    { x: 0, y: 29, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'customerUnBilledCard'},
    { x: 0, y: 30, w: 2, h: 11, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'topSalesCard'},
    { x: 0, y: 31, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'TotalOutstanding'},
    { x: 0, y: 32, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'OverDue'},
    { x: 0, y: 33, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'CollectToday'},
    { x: 0, y: 34, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'CollectOverDue'},
    { x: 0, y: 35, w: 2, h: 3, minW: 2, maxW: 4, minH: 3, maxH: 3, i: 'CollectStatus'},
    { x: 0, y: 36, w: 2, h: 11, minW: 3, maxW: 12, minH: 3, maxH: 15, i: 'TopTenOutstanding'},

    // visitsReport
    { x: 0, y: 37, w: 2, h: 11, minW: 2, maxW: 12, minH: 3, maxH: 12, i: 'visitsReportCard'},

    // PayrollDashboard
    { x: 0, y: 38, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'employeeCard'},
    { x: 0, y: 39, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'lateCheckCard'},
    { x: 0, y: 40, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'earlyCheckoutCard'},
    { x: 0, y: 41, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'holidayCard'},
    { x: 0, y: 42, w: 2, h: 11, minW: 2, maxW: 12, minH: 3, maxH: 12, i: 'checkedInCard'},
    { x: 0, y: 43, w: 2, h: 11, minW: 2, maxW: 12, minH: 3, maxH: 12, i: 'notCheckedInCard'},
    { x: 0, y: 44, w: 2, h: 11, minW: 2, maxW: 12, minH: 3, maxH: 12, i: 'lateLoginCard'},
    { x: 0, y: 45, w: 2, h: 11, minW: 2, maxW: 12, minH: 3, maxH: 12, i: 'completeListCard'},
    { x: 0, y: 44, w: 2, h: 11, minW: 2, maxW: 12, minH: 3, maxH: 12, i: 'leavesStatusCard'},
    { x: 0, y: 44, w: 2, h: 11, minW: 2, maxW: 12, minH: 3, maxH: 12, i: 'averageWorkHoursCard'},
    { x: 0, y: 46, w: 2, h: 11, minW: 2, maxW: 12, minH: 3, maxH: 12, i: 'locationWiseAttendanceCard'},
    
    // WidgetsDetails
    { x: 0, y: 46, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'saleCard'},
    { x: 0, y: 47, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'widgetGrossProfitCard'},
    { x: 0, y: 48, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'roiCard'},
    { x: 0, y: 49, w: 2, h: 3, minW: 2, maxW: 5, minH: 3, maxH: 3, i: 'netProfitCard'},
    { x: 0, y: 50, w: 2, h: 11, minW: 2, maxW: 12, minH: 3, maxH: 12, i: 'widgetTopSalesCard'},

    // ChequeBounces
    { x: 0, y: 50, w: 2, h: 11, minW: 2, maxW: 12, minH: 3, maxH: 12, i: 'ChequeBounces'},
  ]
}

function generateCardVisibility() {
  return {
    //EXPENSES ANALYSIS
    totalCard: true,
    expenseCard: true,
    spendingCard: true,
    pieCard: true,
    areaCard: true,

    // PROFIT & LOSS DASHBOARD
    filterCard: true,
    revenueCard: true,
    profitCard: true,
    breakDownCard: true,
    filterButtonCard: true,

    // TOTAL ACCOUNT PAYABLE AND RECEIVABLE DASHBOARD
    receivablesCard: true,
    payableCard: true,
    totalPayableReceivableCard: true,
    totalReceivableCard: true,

    // STOCKS DASHBOARD
    availStockCard: true,
    stockSummaryCard: true,
    locateStockCard: true,
    nonmoveCategoryCard: true,

    // CASH FLOW
    cashFlowCard: true,

    linechartCard: true,
    totalSalesCard: true,
    brandSalesCard: true,
    salesComparisonCard: true,
    areaWiseSaleCard: true,
    //POS USER DASHBOARD
    todaySalesCard: true,
    salesTodayCard: true,
    cashInHandCard: true,
    targetAchievementCard: true,
    posSummaryCard: true,
    //SALES MAN DASHBOARD
    currentSaleCard: true,
    targetSaleCard: true,
    customerBilledCard: true,
    customerUnBilledCard: true,
    topSalesCard: true,
    //OUTSTANDING REPORT DASHBOARD
    TotalOutstanding: true,
    OverDue: true,
    CollectToday: true,
    CollectOverDue: true,
    CollectStatus: true,
    TopTenOutstanding: true,

    ChequeBounces: true,
    //VISITS REPORT
    visitsReportCard: true,
    // Salesman Dashboard
    employeeCard: true,
    lateCheckCard: true,
    earlyCheckoutCard: true,
    holidayCard: true,
    checkedInCard: true,
    notCheckedInCard: true,
    lateLoginCard: true,
    leavesStatusCard: true,
    averageWorkHours: true,
    completeListCard: true,
    locationWiseAttendanceCard: true,
    // WIDGETS
    saleCard: true,
    widgetGrossProfitCard: true,
    roiCard: true,
    netProfitCard: true,
    widgetTopSalesCard: true,
    totalPayableCard: true,
    activeLoans: true
  };
}

