/*import { BiAlignLeft } from 'react-icons/bi';
import React, { useEffect, useState } from 'react';
import {
  Assessment,
  Dashboard,
  LocalGroceryStore,
  ShoppingBasket,
} from '@mui/icons-material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShoppingBag from '@mui/icons-material/ShoppingBag';
// import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BadgeIcon from '@mui/icons-material/Badge';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
// import AccountBoxIcon from '@mui/icons-material/AccountBox';
import {
  AddShoppingCart,
  Addchart,
  Payments,
  Report,
  AccountBalanceWallet,
  Wysiwyg,
  EventNote,
  AttachMoney,
} from '@mui/icons-material';

// import DashboardIcon from '@mui/icons-material/Dashboard';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import RedeemIcon from '@mui/icons-material/Redeem';
import InventoryIcon from '@mui/icons-material/Inventory';
import StorageIcon from '@mui/icons-material/Storage';
import MemoryIcon from '@mui/icons-material/Memory';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import SchemaIcon from '@mui/icons-material/Schema';
import DesktopAccessDisabledIcon from '@mui/icons-material/DesktopAccessDisabled';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
// import PaidIcon from '@mui/icons-material/Paid';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import GroupsIcon from '@mui/icons-material/Groups';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ArticleIcon from '@mui/icons-material/Article';
import NoteIcon from '@mui/icons-material/Note';
import ListIcon from '@mui/icons-material/List';
import BlenderIcon from '@mui/icons-material/Blender';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import PaymentIcon from '@mui/icons-material/Payment';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import HouseboatIcon from '@mui/icons-material/Houseboat';
import PollIcon from '@mui/icons-material/Poll';
import InfoIcon from '@mui/icons-material/Info';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { TuneSharp } from '@mui/icons-material';
import PaidIcon from '@mui/icons-material/Paid';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DescriptionIcon from '@mui/icons-material/Description';
import PixIcon from '@mui/icons-material/Pix';
import MailIcon from '@mui/icons-material/Mail';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import HistoryIcon from '@mui/icons-material/History';
// import Diversity2Icon from '@mui/icons-material/Diversity2';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
// import Person4Icon from '@mui/icons-material/Person4';
//import CreditCardOffIcon from '@mui/icons-material/CreditCardOff';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import PlaylistAddCircleIcon from '@mui/icons-material/PlaylistAddCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import paymentIcon from '../assets/dashboardIcons/10payment.svg';
// import AccountBalanceWallet from '@mui/icons-material';
import ReportIcon from '@mui/icons-material/Report';
import duedateIcon from '../assets/dashboardIcons/due-date.svg';
import dashboardIcon from '../assets/dashboardIcons/dashboard.svg';
import contactIcon from '../assets/dashboardIcons/contact_icon.png';
import posIcon from '../assets/dashboardIcons/pos.svg';
import posreportIcon from '../assets/dashboardIcons/reports.svg';
import salesmanIcon from '../assets/dashboardIcons/salesman.svg';
import checkmappingIcon from '../assets/dashboardIcons/checklist.svg';
import visitsIcon from '../assets/dashboardIcons/visitor.svg';
import trackingIcon from '../assets/dashboardIcons/tracking.svg';
import ReceivablesIcon from '../assets/dashboardIcons/receive-money.svg';
import pricelistIcon from '../assets/dashboardIcons/price-list.svg';
import purchaseIcon from '../assets/dashboardIcons/purchase.svg';
import purchaseorderIcon from '../assets/dashboardIcons/purchase-order.svg';
import payableIcon from '../assets/dashboardIcons/payable.svg';
import productIcon from '../assets/dashboardIcons/product-management.svg';
import transferIcon from '../assets/dashboardIcons/transfer.svg';
import reconciliationIcon from '../assets/dashboardIcons/reconciliation.svg'
import payIcon from '../assets/dashboardIcons/pay.svg';
import paymentreportIcon from '../assets/dashboardIcons/report.svg';
import cashboxIcon from '../assets/dashboardIcons/cashbox.svg';
import accountsIcon from '../assets/dashboardIcons/accounts.svg';
import creditcardIcon from '../assets/dashboardIcons/credit-card.svg';
import profitIcon from '../assets/dashboardIcons/profit.svg';
import balanceIcon from '../assets/dashboardIcons/balance.svg';
import bankstatementIcon from '../assets/dashboardIcons/bank-statement.svg';
import schemeIcon from '../assets/dashboardIcons/scheme.svg';
import settingsIcon from '../assets/dashboardIcons/settings.svg';
import bankingIcon from '../assets/dashboardIcons/banking.svg';
import messagesIcon from '../assets/dashboardIcons/messages.svg';
import themeIcon from '../assets/dashboardIcons/theme.svg';
import requestIcon from '../assets/dashboardIcons/request.svg';
import shiftIcon from '../assets/dashboardIcons/shift.svg';
import salaryIcon from '../assets/dashboardIcons/salary.svg';
import closeIcon from '../assets/dashboardIcons/close.svg';
import expenseIcon from '../assets/dashboardIcons/07salary.svg';
import sellerIcon from '../assets/dashboardIcons/seller.svg';
import ContactsIcon from '@mui/icons-material/Contacts';
import SellIcon from '@mui/icons-material/Sell';
import SavingsIcon from '@mui/icons-material/Savings';
import PinDropIcon from '@mui/icons-material/PinDrop';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ErrorIcon from '@mui/icons-material/Error';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
// import EditNoteIcon from '@mui/icons-material/EditNote';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EditRoadIcon from '@mui/icons-material/EditRoad';
import TaskIcon from '@mui/icons-material/Task';
import FeedIcon from '@mui/icons-material/Feed';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CameraFrontSharpIcon from '@mui/icons-material/CameraFrontSharp';
import CameraFrontIcon from '@mui/icons-material/CameraFront';
import QueuePlayNextIcon from '@mui/icons-material/QueuePlayNext';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CampaignIcon from '@mui/icons-material/Campaign';
import FlakyIcon from '@mui/icons-material/Flaky';
import FollowTheSignsIcon from '@mui/icons-material/FollowTheSigns';
import ApprovalIcon from '@mui/icons-material/HowToReg';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import { getsessionStorage } from './common/login/cookies';
import PolicyIcon from '@mui/icons-material/Policy';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { useCustomFetch } from 'utils/useCustomFetch';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
// import OverTimeReport from './OverTimeReport';
import OverTimeReportIcon from '@mui/icons-material/PendingActions';
import { MdOutlineDns } from 'react-icons/md';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import {  claims, FactCheckIcon, EventIcon,RequestPageIcon, HelpCenter, FaceRegistration, FaceAttendance,FlakyRoundedIcon ,MobiledataOffIcon,SummarizeIcon} from './routesIcons';
import GppGoodIcon from '@mui/icons-material/GppGood';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import RejectedRequestIcon from '../assets/dashboardIcons/rejected.png'
// import LayersIcon from '../assets/dashboardIcons/L';
import LayersIcon from '@mui/icons-material/Layers';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import SubscriptionIcon from '../assets/dashboardIcons/subscription.png';
import CalendarMonthIcon from '../assets/dashboardIcons/calendarIcon.png';



let storage = getsessionStorage();
const company_type = storage?.company_type
let roleName = storage?.role_name
let role_name = storage?.role_name

// const customFetch = useCustomFetch()



const routesConfig = [
  {
    id: 'app',
    title: 'Home',
    messageId: 'Menus',
    type: 'group',
    children: [
      {
        id: 'head_1',
        messageId: 'Dashboard',
        type: 'item',
        icon: <img src={dashboardIcon} height={20} width={20} />,
        url: '/home',
      },
      {
        id: 'head_2',
        messageId: 'Contacts',
        type: 'item',
        icon: <ContactsIcon style={{ color: 'black' }} height={10} width={10} />,
        url: '/apps/contacts',
      },
      {
        id: 'head_122',
        messageId: 'Chat',
        type: 'item',
        icon: <QuestionAnswerIcon style={{ color: 'black' }} height={10} width={10} />,
        url: '/chat',
      },
     
          {
            id: 'head_123',
            messageId: 'Assets',
            type: 'item',
            icon: <AssuredWorkloadIcon style={{ color: 'black' }} height={10} width={10} />,
            url: '/assets/assets',
          },
         
          {
            id: 'head_125',
            messageId: 'Insurance',
            type: 'item',
            icon: <HealthAndSafetyIcon style={{ color: 'black' }} height={10} width={10} />,
            url: '/assets/insurance',
          },
          {
            id: 'head_126',
            messageId: 'Warranty',
            type: 'item',
            icon: <GppGoodIcon style={{ color: 'black' }} height={10} width={10} />,
            url: '/assets/warranty',
          },
          {
            id: 'head_46',
            messageId: 'Audits',
            type: 'item',
            icon: <FindInPageIcon style={{ color: 'black' }} height={10} width={10} />,
            url: '/assets/audits'
          },
          {
            id: 'head_127',
            messageId: 'Service Due',
            type: 'item',
            icon: <ManageHistoryIcon style={{ color: 'black',height : 20,  width: 20 }}  />,
            url: '/assets/serviceDue',
          },
        
       
      
      
      {
        id: 'head_47',
        messageId: 'Alerts',
        type: 'item',
        icon: <AddAlertIcon style={{ color: 'black' }} height={10} width={10} />,
        url: '/assets/alerts'
      },
      {
        id: 'head_50',
        messageId: 'Audit Request',
        icon: <img src={requestIcon} height={20} width={20} />,
        url: '/assets/auditRequest',
        type: 'item',
      },
      //------ Leads menu ----
      // {
      //   id: 'head_53',
      //   messageId: 'Approvals',
      //   icon: <img src={RequestPageIcon} height={20} width={20} />,
      //   url: '/posApprovals',
      //   type: 'item'
      // },
      {
        id: 'head_54',
        messageId: 'Lead',
        icon: <LeaderboardIcon style={{ color: 'black' }} />,
        url: '/crm/leads',
        type: 'item',
      },
      {
        id: 'head_55',
        messageId: 'Lead Accounts',
        icon: <SupervisedUserCircleIcon style={{ color: 'black' }} height={10} width={10}/>,
        url: '/crm/leadAccounts',
        type: 'item',
      },
      {
        id: 'head_56',
        messageId: 'Quotation',
        icon: <ReceiptLongIcon/>,
        url: '/crm/quotation',
        type: 'item',
      },
      {
        id: 'head_57',
        messageId: 'Campaign',
        icon: <CampaignIcon />,
        url: '/crm/campaign',
        type: 'item',
      },
      {
        id: 'head_58',
        messageId: 'Tasks',
        icon: <TaskIcon style={{ color: 'black' }} height={10} width={10} />,
        url: '/crm/tasks',
        type: 'item',
      },
      {
        id: 'head_59',
        messageId: 'Calls',
        icon: <img src={requestIcon} height={20} width={20} />,
        url: '/crm/calls',
        type: 'item',
      },
      {
        id: 'head_60',
        messageId: 'Meetings',
        icon: <GroupsIcon style={{ color: 'black' }} height={10} width={10} />,
        url: '/crm/meetings',
        type: 'item',
      },
      {
        id: 'head_60_integrations',
        messageId: 'Integrations',
        icon: <IntegrationInstructionsIcon style={{ color: 'black' }} height={10} width={10} />,
        url: '/crm/integrations',
        type: 'item',
      },
    
     
      {
        id: 'head_123',
        messageId: 'Today Attendance',
        icon:  <CameraFrontIcon style={{ color: 'black' }} />,
        url: '/todayAttendance',
        type: 'item',
      },
      
      {
        id: 'head_3',
        messageId: 'Point Of Sale',
        type: 'collapse',
        icon: <img src={posIcon} height={20} width={20} />,
        children: [
          {
            id: '1',
            messageId: 'Sales Counter',
            type: 'item',
            icon: <img src={posIcon} height={20} width={20} />,
            url: '/pointofsale/session',
          },
          {
            id: '2',
            messageId: 'Pos Report',
            type: 'item',
            icon: <img src={posreportIcon} height={20} width={20} />,
            url: '/pointofsale/posSale',
          },
          {
            id: '3',
            messageId: 'Daily Report',
            icon: <DateRangeIcon style={{ color: 'black' }} />,
            url: '/pointofsale/dailyReport',
            type: 'item',
          },
          {
            id: '4',
            messageId: 'Find Product',
            icon: <img src={posreportIcon} height={20} width={20} />,
            url: '/pointofsale/findproduct',
            type: 'item',
          },
          {
            id: '5',
            messageId: 'Promotions',
            icon: <CampaignIcon />,
            url: '/promotions',
            type: 'item',
          },
        ]
      },
      {
        id: 'head_5',
        messageId: 'Sales',
        type: 'collapse',
        icon: <SellIcon style={{ color: 'black' }} />,
        children: [
          {
            id: '1',
            messageId: 'Sales Order',
            icon: <MoneyOffIcon />,
            url: '/sales/invoices',
            type: 'item',
          },
          {
            id: '2',
            type: 'item',
            messageId: 'SO Tracking',
            icon: <img src={trackingIcon} height={20} width={20} />,
            url: '/sales/soTracking',
          },
          {
            id: '3',
            type: 'item',
            messageId: 'Receivables',
            icon: <img src={ReceivablesIcon} height={20} width={20} />,
            url: '/sales/receivable',
          },
          {
            id: '4',
            type: 'item',
            messageId: 'Price List',
            icon: <img src={pricelistIcon} height={20} width={20} />,
            url: '/sales/priceList',
          },
          {
            id: '5',
            type: 'item',
            messageId: 'Receipt',
            icon: <img src={pricelistIcon} height={20} width={20} />,
            url: '/sales/ReceiptSales',
          },
        ],
      },
      {
        id: 'head_6',
        messageId: 'Purchases',
        icon: <img src={purchaseIcon} height={20} width={20} />,
        url: '/bills',
        type: 'collapse',
        children: [
          {
            messageId: 'Purchase Orders',
            icon: <img src={purchaseorderIcon} height={20} width={20} />,
            url: '/bills',
            type: 'item',
            id: '1',
          },
          {
            messageId: 'Payables',
            icon: <img src={payableIcon} height={20} width={20} />,
            url: '/payable',
            type: 'item',
            id: '2',
          },
          {
            messageId: 'Expenses',
            icon: <img src={expenseIcon} height={20} width={20} />,
            url: '/expenses',
            type: 'item',
            id: '3',
          },
          {
            messageId: 'Payments',
            icon: <img src={expenseIcon} height={20} width={20} />,
            url: '/PaymentsPurchases',
            type: 'item',
            id: '4',
          },
          {
            messageId: 'Vendor Price List',
            icon: <LocalOfferIcon />,
            url: '/vendorPriceList',
            type: 'item',
            id: '5',
          },
        ],
      },
      {
        id: 'head_17',
        messageId: 'Sales Man',
        type: 'collapse',
        icon: <img src={salesmanIcon} height={20} width={20} />,
        // url: '/salesman',
        children: [
          { 
            id: '2',
            messageId: 'SalesMan List',
            icon: <ListAltIcon />,
            url: '/SalesmanList',
            type: 'item',
          },
          {
            id: '3',
            messageId: 'Visits',
            icon: <img src={visitsIcon} height={20} width={20} />,
            url: '/salesmanvisits',
            type: 'item',
          },
          {
            id: '4',
            messageId: 'Fuel Allowance',
            icon: <AccountBalanceWallet />,
            url: '/fuelAllowance',
            type: 'item',
          },
          {
            id: '5',
            messageId: 'SalesMan Visits',
            icon: <AppRegistrationIcon />,
            url: '/SalesExecutiveHistory',
            type: 'item',
          },
          {
            id: '6',
            messageId: 'SalesMan Travel',
            icon: <DirectionsBikeIcon />,
            url: '/SalesmanTravelHistory',
            type: 'item',
          },
          {
            id: '7',
            messageId: 'Live Tracking',
            icon: <MyLocationIcon />,
            url: '/salesmanlivelocation',
            type: 'item',
          },
          {
            id: '8',
            messageId: 'SalesMan Collections',
            icon: <QueuePlayNextIcon />,
            url: '/salesmancollections',
            type: 'item',
          },
          {
            id: '9',
            messageId: 'Approval Requests',
            icon: <FlakyIcon />,
            url: '/approvalRequests',
            type: 'item',
          },
        ],
      },
      // Sales Target menu is DB-driven via sa_menu_items (superadmin menu builder)
      {
        id: 'head_7',
        messageId: 'Inventory',
        icon: <RedeemIcon style={{ color: 'black' }} />,
        url: '/sales/inventory',
        type: 'collapse',
        children: [
          {
            messageId: 'Product',
            icon: <img src={productIcon} height={20} width={20} />,
            url: '/sales/product',
            type: 'item',
            id: '1',
          },
          {
            messageId: 'Stocks',
            icon: <ShowChartIcon style={{ color: 'black' }} />,
            url: '/sales/inventory',
            type: 'item',
            id: '2',
          },
          {
            messageId: 'Stock Transfer',
            icon: <img src={transferIcon} height={20} width={20} />,
            url: '/sales/stocktransfer',
            type: 'item',
            id: '3',
          },
          {
            messageId: 'Stock Receive',
            icon: <ManageSearchIcon />,
            url: '/sales/stockreceive',
            type: 'item',
            id: '4',
          },
          {
            messageId: 'Stock Reconcilate',
            icon: <img src={reconciliationIcon} height={20} width={20} />,
            url: '/sales/stockReconcilate',
            type: 'item',
            id: '5',
          },
          {
            messageId: 'Sync Inventory',
            icon: <img src={LeaderboardIcon} height={20} width={20} />,
            url: '/sales/syncInventory',
            type: 'item',
            id: '6',
          },
        ],
      },
      {
        id: 'head_8',
        messageId: 'Payments',
        icon: <img src={payIcon} height={20} width={20} />,
        url: '/payments',
        type: 'collapse',
        children: [
          {
            id: 'payinout',
            messageId: 'Pay In / Pay Out',
            icon: <img src={payableIcon} height={20} width={20} />,
            url: '/payinout',
            type: 'item',
          },
          {
            id: 'paymentreport',
            messageId: 'Payment Report',
            icon: <img src={paymentreportIcon} height={20} width={20} />,
            url: '/paymentreport',
            type: 'item',
          },
          { id: 'cashboxAdjustment',
            messageId: 'CashBox Adjustment',
            icon: <img src={cashboxIcon} height={20} width={20} />,
            url: '/cashboxAdjustment',
            type: 'item',
          },
        ],
      },
      {
        id: 'head_9',
        messageId: 'Leads',
        icon: <LeaderboardIcon style={{ color: 'black' }} />,
        url: '/leads',
        type: 'item',
      },
      {
        id: 'head_10',
        messageId: 'Service',
        icon: <LeaderboardIcon style={{ color: 'black' }} />,
        url: '/service',
        type: 'item',
        children: [
          {
            id: '1',
            messageId: 'Dashboard',
            type: 'item',
            icon: <img src={posIcon} height={20} width={20} />,
            url: '/service/serviceDashboard',
          },
          {
            id: '2',
            messageId: 'New Service',
            type: 'item',
            icon: <img src={posreportIcon} height={20} width={20} />,
            url:'/service',
          },
          {
            id: '3',
            messageId: 'Payment',
            icon: <DateRangeIcon style={{ color: 'black' }} />,
            url:'/payment',
            type: 'item',
          }
        ]
      },
      {
        id: 'head_44',
        messageId: 'Offers',
        icon: <LocalOfferIcon />,
        url: '/offers',
        type: 'item',
      },
      // {
      //   id: 'head_49',
      //   messageId: 'BarCodeGenerator',
      //   icon: <LocalOfferIcon />,
      //   url: '/barCodeQrGenerator',
      //   type: 'item',
      // },
      {
        id: 'head_14345',
        messageId: 'Whats App',
        icon: <LocalOfferIcon />,
        url: '/wassup',
        type: 'item',
      },
      {
        id: 'head_10',
        messageId: 'Accounts',
        icon: <img src={accountsIcon} height={20} width={20} />,
        url: '/accounts',
        type: 'collapse',
        children: [
          {
            id: 'Account_Transaction',
            messageId: 'Journal Entry',
            icon: <img src={creditcardIcon} height={20} width={20} />,
            url: '/accounts/Journals',
            type: 'item',
          },
          {
            messageId: 'Cash / Bank Summary',
            icon: <SavingsIcon style={{ color: 'black' }} />,
            url: '/accounts/cashBankSummary',
            type: 'item',
          },
          {
            messageId: 'Credit / Debit Notes',
            icon: <img src={creditcardIcon} height={20} width={20} />,
            url: '/sales/CreditNotes',
            type: 'item',
          },
          {
            messageId: 'Ledgers',
            icon: <FormatListBulletedIcon style={{ color: 'black' }} />,
            url: '/accounts/generalLedger',
            type: 'item',
          },
          {
            messageId: 'Chart of Accounts',
            icon: <PollIcon style={{ color: 'black' }} />,
            url: '/accounts/chartOfAccounts',
            type: 'item',
          },
          {
            messageId: 'Profit & loss A/C',
            icon: <img src={profitIcon} height={20} width={20} />,
            url: '/reports/profit-loss',
            type: 'item',
          },
          {
            messageId: 'Balance Sheet',
            icon: <img src={balanceIcon} height={20} width={20} />,
            url: '/reports/balance-sheet',
            type: 'item',
          },
          {
            messageId: 'Bank Reconciliation',
            icon: <img src={bankstatementIcon} height={20} width={20} />,
            url: '/accounts/bankReconciliation',
            type: 'item',
          },
          {
            messageId: 'Cheque Bounce',
            icon: <AssignmentReturnedIcon style={{ color: 'black' }} />,
            url: '/accounts/cheques',
            type: 'item',
          },
          {
            messageId: 'CashInHand',
            icon: <AssignmentReturnedIcon style={{ color: 'black' }} />,
            url: '/accounts/cashInHand',
            type: 'item',
          },
          {
            messageId: 'Company Loans',
            icon: <img src={payIcon} height={20} width={20} />,
            url: '/accounts/companyLoans',
            type: 'item',
          },
        ],
      },
      {
        id: 'head_11',
        messageId: 'Schemes',
        icon: <img src={schemeIcon} height={20} width={20} />,
        url: '/sales/schemes',
        type: 'collapse',
        children: [
          {
            messageId: 'Schemes',
            icon: <img src={schemeIcon} height={20} width={20} />,
            url: '/sales/schemes',
            type: 'item',
          },
          {
            messageId: 'Schemes DashBoard',
            icon: <img src={dashboardIcon} height={20} width={20} />,
            url: '/sales/schemesdashboard',
            type: 'item',
          },
          {
            messageId: 'Manual Schemes',
            icon: <img src={schemeIcon} height={20} width={20} />,
            url: '/schemesManuals',
            type: 'item',
          },
          {
            messageId: 'Schemes Receivables',
            icon: <img src={schemeIcon} height={20} width={20} />,
            url: '/sales/schemesReceivables',
            type: 'item',
          },
        ],
      },
      {
        id: 'head_15',
        messageId: 'MyAccount',
        url: '/common/myaccount',
        type: 'item',
      },
      {
        id: 'head_85',
        messageId: 'Activity',
        url: '/common/activity',
        type: 'item',
      },
      {
        id: 'head_16',
        messageId: 'Message',
        url: '/message',
        type: 'item',
      },
      {
        id: 'head_18',
        messageId: 'Payroll',
        type: 'collapse',
        icon: <img src={sellerIcon} height={20} width={20} />,
        children: [
          {
            messageId: 'Dashboard',
            icon: <img src={dashboardIcon} height={20} width={20} />,
            url: '/payrollDashboard',
            type: 'item',
            id: '1',
          },
          {
            messageId: 'Requests',
            icon: <img src={requestIcon} height={20} width={20} />,
            url: '/leaveRequest',
            type: 'item',
            id: '2',
          },
          {
            messageId: 'Shift List',
            icon: <img src={shiftIcon} height={20} width={20} />,
            url: '/shiftlist',
            type: 'item',
            id: '3',
          },
          {
            messageId: 'Salary',
            icon: <img src={salaryIcon} height={20} width={20} />,
            url: '/salary',
            type: 'item',
            id: '4',
          },
          {
            messageId: 'Holidays & Special Permissions',
            icon: <HouseboatIcon style={{ color: 'black' }} />,
            url: '/holidays',
            type: 'item',
            id: '5',
          },
          {
            messageId: 'Loans',
            icon: <img src={payIcon} height={20} width={20} />,
            url: '/loans',
            type: 'item',
            id:'6'
          },
          
          // {
          //   messageId: 'LiveLocation',
          //   icon:     <img src={trackingIcon} height={20} width={20} />,
          //   url: '/LiveLocation',
          //   type: 'item',
          //   id:'15'
          // },
          {
            messageId: 'QR Attendance',
            icon:  <QrCodeScannerIcon style={{ color: 'black' }} />,
            url: '/qrAttendance',
            type: 'item',
            id:'14'
          },
          // {
          //   messageId: 'Follow List',
          //   icon: <FollowTheSignsIcon style={{ color: 'black' }} />,
          //   url: '/followlist',
          //   type: 'item',
          //   id:'15'
          // },
          {
            messageId: 'Process Salary',
            icon: <img src={salaryIcon} height={20} width={20} />,
            url: '/processSalary',
            type: 'item',
            id: '9',
          },
          {
            messageId: 'Attendance Correction',
            icon: <EditRoadIcon height={20} width={20} />,
            url: '/AttendanceCorrection',
            type: 'item',
            id: '10',
          },
          {
            messageId: 'Attendance View Report',
            icon: <AssignmentIndIcon height={20} width={20} />,
            url: '/AttendanceView',
            type: 'item',
            id: '11',
          },
          {
            messageId: 'Checkin Checkout Report',
            icon: <FlakyRoundedIcon height={20} width={20} />,
            url: '/CheckInCheckOut',
            type: 'item',
            id: '19',
          },
          // {
          //   messageId: 'LateIn EarlyOut Report',
          //   icon: <MobiledataOffIcon height={20} width={20} />,
          //   url: '/LateInEarlyOut',
          //   type: 'item',
          //   id: '20',
          // },
          {
            messageId: 'PF Report',
            icon: <SummarizeIcon height={20} width={20} />,
            url: '/PfReport',
            type: 'item',
            id: '21',
          },
          {
            messageId: 'Statutory Reports',
            icon: <SummarizeIcon height={20} width={20} />,
            url: '/StatutoryReports',
            type: 'item',
            id: '28',
          },
          {
            messageId: 'Attendance Process',
            icon: <AssessmentIcon height={20} width={20} />,
            url: '/AttendanceProcess',
            type: 'item',
            id: '12',
          },
          {
            messageId: 'Monthly Shift',
            icon: <AssessmentIcon height={20} width={20} />,
            url: '/monthShift',
            type: 'item',
            id: '13',
          },
          {
            messageId: 'Report',
            icon: <img src={paymentreportIcon}  />,
            type: 'collapse',
            id: '8',
            children: [
              {
                messageId: 'History',
                icon: <HistoryIcon style={{ color: 'black' }} />,
                url: '/historyReport',
                type: 'item',
                id: '1',
              },
              {
                messageId: 'WorkDuration Report',
                icon: <WorkHistoryIcon height={20} width={20} />,
                url: '/workDurationReport',
                type: 'item',
                id: '6',
              },
              {
                messageId: 'OverTime Report',
                icon: <OverTimeReportIcon height={20} width={20} />,
                url: '/overTimeReport',
                type: 'item',
                id: '7',
              },
              {
                messageId: 'Salary Report',
                icon: <PaidIcon />,
                url: '/salaryReports',
                type: 'item',
                id: '8',
              },
              {
                messageId: 'Leave',
                icon: <DesktopAccessDisabledIcon style={{ color: 'black' }} />,
                url: '/leaveReport',
                type: 'item',
                id: '2',
              },
              {
                messageId: 'Request',
                icon: <img src={requestIcon} height={20} width={20} />,
                url: '/requestReport',
                type: 'item',
                id: '3',
              },
              {
                messageId: 'Salary',
                icon: <img src={salaryIcon} height={20} width={20} />,
                url: '/salaryReport',
                type: 'item',
                id: '4',
              },
              {
                messageId: 'Pay Slip',
                icon: <img src={salaryIcon} height={20} width={20} />,
                url: '/paySlip',
                type: 'item',
                id: '5',
              },
            ]
          },
          
        ],
      },
     
      {
        id: 'head_21',
        messageId: 'Payroll Settings',
        type: 'collapse',
        icon: <img src={settingsIcon} height={20} width={20} />,
        url: '/openda',
        children: [
          // {
          //   messageId: 'Locations',
          //   icon: <PinDropIcon style={{ color: 'black' }} />,
          //   url: '/stockLocation',
          //   type: 'item',
          // },
          // {
          //   messageId: 'EmployeeVerification',
          //   icon: <PinDropIcon style={{ color: 'black' }} />,
          //   url: '/employeeverification',
          //   type: 'item',
          // },
          {
            messageId: 'Users Role',
            icon: <PeopleAltIcon style={{ color: 'black' }} />,
            url: '/posrole',
            type: 'item',
          },
          {
            messageId: 'Users',
            icon: <PeopleAltIcon style={{ color: 'black' }} />,
            url: '/usercreation',
            type: 'item',
          },
        ]
      },
      {
        id: 'head_42',
        messageId: 'Live Location',
        type: 'item',
        icon: <img src={trackingIcon} height={20} width={20} />,
        url: '/LiveLocation',
      },
      
      {
        id: 'head_39',
        messageId: 'Project',
        type: 'collapse',
        icon: <FeedIcon style={{ color: 'black' }} />,
        children: [
          {
            id: '1',
            messageId: 'Task',
            type: 'item',
            icon: <TaskIcon style={{ color: 'black' }} height={10} width={10}/>,
            url: '/projects/task',
          },
          {
            id: '2',
            messageId: 'Projects',
            type: 'item',
            icon: <LayersIcon style={{ color: 'black' }} height={10} width={10} />,
            url: '/projects/projects',
          },
          {
            id: '3',
            messageId: 'Task Summary',
            type: 'item',
            icon: <BrandingWatermarkIcon style={{ color: 'black' }} />,
            url: '/projects/tasklogs',
          },
         
          // {
          //   id: '3',
          //   messageId: 'Boards',
          //   type: 'item',
          //   icon: <MdOutlineDns style={{ color: 'black' }} />,
          //   url: '/apps/scrum-board',
          // },
        ]
      },
      {
        id: 'head_22',
        messageId: 'Requests',
        type: 'item',
        icon: <img src={requestIcon} height={20} width={20} />,
        url: '/leaveRequest',
      },
      {
        id: 'head_67',
        messageId: 'Approvals',
        type: 'item',
        icon:   <img src={RequestPageIcon} height={20} width={20} />,
        url: '/approvals',
      },
      {
        id: 'head_68',
        messageId: 'Face Registration',
        type: 'item',
        icon:   <img src={FaceRegistration} height={20} width={20} />,
        url: '/faceRegistration',
      },
      {
        id: 'head_70',
        messageId: 'Face Attendance',
        type: 'item',
        icon:   <img src={FaceAttendance} height={20} width={20} />,
        url: '/faceAttendance',
      },
      {
        id: 'head_43',
        messageId: 'Shifts',
        type: 'collapse',
        icon: <img src={shiftIcon} height={20} width={20} />,
        children: [
          {
            id: '1',
            messageId: 'Create Shift',
            type: 'item',
            icon: <img src={shiftIcon} height={20} width={20} />,
            url: '/shiftlist',
          },
          {
            id: '2',
            messageId: 'Monthly View',
            type: 'item',
            icon: <img src={requestIcon} height={20} width={20} />,
            url: '/monthShift',
          },
          {
            id: '3',
            messageId: 'Schedule Shift',
            type: 'item',
            icon:  <ArticleIcon style={{ color: 'black' }}/>,
            url: '/schedulelist',
          },
        ]
      },

  
      {
        id: 'head_24',
        messageId: 'Salary',
        type: 'collapse',
        icon: <img src={salaryIcon} height={20} width={20} />,
        children: [
          {
            id: '1',
            messageId: 'Salary Structure',
            type: 'item',
            icon: <img src={salaryIcon} height={20} width={20} />,
            url: '/salaryStructure',

          },
          {
            id: '2',
            messageId: 'Employee Salary',
            type: 'item',
            icon: <img src={salaryIcon} height={20} width={20} />,
            url: '/salary',
          },
          // {
          //   id: '3',
          //   messageId: 'Assign Salary Structure',
          //   type: 'item',
          //   icon: <img src={salaryIcon} height={20} width={20} />,
          //   url: '/assignsalary',
          // },
        ]
      },
      // {
      //   id: 'head_22',
      //   messageId: 'Requests',
      //   type: 'item',
      //   icon: <img src={requestIcon} height={20} width={20} />,
      //   url: '/leaveRequest',
      // },
      // {
      //   id: 'head_43',
      //   messageId: 'Monthly Shift',
      //   type: 'item',
      //   icon: <img src={requestIcon} height={20} width={20} />,
      //   url: '/monthShift',
      // },
      // {
      //   id: 'head_23',
      //   type: 'item',
      //   messageId: 'Shifts',
      //   icon: <img src={shiftIcon} height={20} width={20} />,
      //   url: '/shiftlist',
      // },
      // {
      //   id: 'head_24',
      //   type: 'item',
      //   messageId: 'Salary',
      //   icon: <img src={salaryIcon} height={20} width={20} />,
      //   url: '/salary',
      // },
      {
        id: 'head_26',
        type: 'item',
        messageId: 'Loans',
        icon: <img src={payIcon} height={20} width={20} />,
        url: '/loans',
      },
       {
        id: 'head_51',
        type: 'item',
        messageId: 'Claims',
        icon: <img src={claims} height={20} width={20} />,
        url: '/claims',
      },
      {
        id: 'head_52',
        type: 'item',
        messageId: 'Events',
        icon: <img src={EventIcon} height={20} width={20} />,
        url: '/events',
      },
      // {
      //   id: 'head_59',
      //   type: 'item',
      //   messageId: 'Subscriptions',
      //   icon: <img src={SubscriptionIcon} height={20} width={20} />,
      //   url: '/companySubscriptions',
      // },
      {
        id: 'head_69',
        type: 'item',
        messageId: 'Calendar',
        icon: <img src={CalendarMonthIcon} height={20} width={20} />,
        url: '/calendar',
      },
      {
        id: 'head_99',
        type: 'item',
        messageId: 'Rental And Tenants',
        icon: <img src={CalendarMonthIcon} height={20} width={20} />,
        url: '/rentalsAndTenants',
      },
      {
        id: 'head_98',
        type: 'item',
        messageId: 'Sales Requests',
        icon:<img src={requestIcon} height={20} width={20} />,
        url: '/salesRequests',
      },
      {
        id: 'head_25',
        type: 'item',
        messageId: 'Holidays & Special Permissions',
        icon: <HouseboatIcon style={{ color: 'black' }} />,
        url: '/holidays',
      },
      {
        id: 'head_68',
        type: 'item',
        messageId: 'Announcement',
        icon: <CampaignIcon style={{ color: 'black' }} />,
        url: '/announcement',
      },
      {
        id: 'head_59',
        type: 'item',
        messageId: 'Support',
        icon:  <img src={HelpCenter} height={20} width={20} />,
        url: '/support',
      },
      // {
      //   id: 'head_124',
      //   messageId: 'Custom Fields',
      //   type: 'item',
      //   icon: <DynamicFormIcon style={{ color: 'black' }} height={10} width={10} />,
      //   url: '/customFields',
      // },
      // {
      //   id: 'head_28',
      //   type: 'item',
      //   messageId: 'Attendance Correction',
      //   icon: <EditRoadIcon height={20} width={20} />,
      //   url: '/AttendanceCorrection',
      // },
      {
        id: 'head_43',
        type: 'item',
        messageId: 'Selfie Attendance',
        icon: <CameraFrontIcon height={20} width={20} />,
        url: '/todayAttendance',
      },
      {
        id: 'head_30',
        type: 'item',
        messageId: 'Attendance Process',
        icon: <AssessmentIcon height={20} width={20} />,
        url: '/AttendanceProcess',
      },
      {
        id: 'head_27',
        type: 'item',
        messageId: 'Salary process',
        icon: <img src={salaryIcon} height={20} width={20} />,
        url: '/processSalary',
      },
      {
        id: 'head_40',
        messageId: 'Process Incentive',
        icon: <img src={salaryIcon} height={20} width={20} />,
        url: '/processIncentive',
        type: 'item',
      },
     
      {
        id: 'head_30',
        type: 'item',
        messageId: 'Error List',
        icon: <img src={salaryIcon} height={20} width={20} />,
        url: '/ErrorList',
      },
      {
        id: 'head_31',
        messageId: 'Error Dashboard User',
        icon: <ErrorOutlineIcon style={{ color: 'black' }} />,
        url: '/UserErrLog',
        type: 'item',
      },
      {
        id:'head_41',
        messageId: 'QR Generator',
        icon:  <QrCodeScannerIcon style={{ color: 'black' }} />,
        url: '/qrAttendance',
        type: 'item',
      },
      {
        messageId: 'Employee Profile',
        icon: <AccountCircleIcon style={{ color: 'black' }} />,
        url: '/employeeProfile',
        type: 'item',
        id: 'head_200',
      },
      {
        messageId: 'Organization Structure',
        icon: <AccountTreeIcon style={{ color: 'black' }} />,
        url: '/orgStructure',
        type: 'item',
        id: 'head_201',
      },
      {
        messageId: 'Employee Lifecycle',
        icon: <AssignmentTurnedInIcon style={{ color: 'black' }} />,
        url: '/employeeLifecycle',
        type: 'item',
        id: 'head_202',
      },
      {
        messageId: 'HR Letters',
        icon: <DescriptionIcon style={{ color: 'black' }} />,
        url: '/hrLetters',
        type: 'item',
        id: 'head_203',
      },
      {
        messageId: 'ESS Portal',
        icon: <BadgeIcon style={{ color: 'black' }} />,
        url: '/essPortal',
        type: 'item',
        id: 'head_204',
      },
      {
        messageId: 'My Salary',
        icon: <AccountBalanceWallet style={{ color: 'black' }} />,
        url: '/mySalary',
        type: 'item',
        id: 'head_212',
      },
      {
        messageId: 'My Team',
        icon: <GroupsIcon style={{ color: 'black' }} />,
        url: '/myTeam',
        type: 'item',
        id: 'head_213',
      },
      {
        messageId: 'Document Management',
        icon: <FolderSharedIcon style={{ color: 'black' }} />,
        url: '/documentManagement',
        type: 'item',
        id: 'head_205',
      },
      {
        messageId: 'Expense Management',
        icon: <AccountBalanceWallet style={{ color: 'black' }} />,
        url: '/expenseManagement',
        type: 'item',
        id: 'head_206',
      },
      {
        messageId: 'HR Policies',
        icon: <Wysiwyg style={{ color: 'black' }} />,
        url: '/hrPolicies',
        type: 'item',
        id: 'head_207',
      },
      {
        messageId: 'Performance',
        icon: <Addchart style={{ color: 'black' }} />,
        url: '/performance',
        type: 'item',
        id: 'head_208',
      },
      {
        messageId: 'Recruitment',
        icon: <BadgeIcon style={{ color: 'black' }} />,
        url: '/recruitment',
        type: 'item',
        id: 'head_209',
      },
      {
        messageId: 'Training & LMS',
        icon: <SchemaIcon style={{ color: 'black' }} />,
        url: '/training',
        type: 'item',
        id: 'head_210',
      },
      {
        messageId: 'HR Analytics',
        icon: <LeaderboardIcon style={{ color: 'black' }} />,
        url: '/hrAnalytics',
        type: 'item',
        id: 'head_211',
      },
      {
        messageId: 'Employee Verification',
        icon: <FactCheckIcon style={{ color: 'black' }} />,
        url: '/payroll/employeeVerification',
        type: 'item',
        id: 'head_45',
      },
      {
        messageId: 'Employee Documents',
        icon: <PermMediaIcon style={{ color: 'black' }} />,
        url: '/employeeDocuments',
        type: 'item',
        id: 'head_48',
      },
      // {
      //   messageId: 'Subscriptions',
      //   icon: <img src={SubscriptionIcon} height={20} width={20} />,
      //   url: '/Subscriptions',
      //   id: 'head_59',
      //   type: 'item',
      // },
      // {
      //   id:'head_67',
      //   messageId: 'Follow List',
      //   icon: <FollowTheSignsIcon style={{ color: 'black' }} />,
      //   url: '/followlist',
      //   type: 'item',
      // },
      {
        id: 'head_12',
        messageId: 'Payroll Reports',
        icon: <HistoryIcon style={{ color: 'black', width: 22}} />,
        url: '/reporting',
        type: 'collapse',
        children: [
            {
              messageId: 'Attendance Logs',
              icon: <AssignmentIndIcon height={20} width={20} />,
              url: '/AttendanceView',
              type: 'item',
              id: '1',
            },
          {
            messageId: 'WorkDuration Report',
            icon: <WorkHistoryIcon height={20} width={20} />,
            url: '/workDurationReport',
            type: 'item',
            id: '2',
          },
          {
            messageId: 'OverTime Report',
            icon: <OverTimeReportIcon height={20} width={20} />,
            url: '/overTimeReport',
            type: 'item',
            id: '3',
          },
          {
            messageId: 'Request Report',
            icon: <img src={requestIcon} height={20} width={20} />,
            url: '/requestReport',
            type: 'item',
            id: '4',
          },
          {
            messageId: 'Leave Report',
            icon: <DesktopAccessDisabledIcon style={{ color: 'black' }} />,
            url: '/leaveReport',
            type: 'item',
            id: '5',
          },
        
          // {
          //   messageId: 'Salary Report',
          //   icon: <img src={salaryIcon} height={20} width={20} />,
          //   url: '/salaryReport',
          //   type: 'item',
          //   id: '3',
          // },
          {
            messageId: 'Payslips',
            icon: <img src={salaryIcon} height={20} width={20} />,
            url: '/paySlip',
            type: 'item',
            id: '6',
          },
          {
            messageId: 'Salary Report',
            icon: <PaidIcon />,
            url: '/salaryReports',
            type: 'item',
            id: '10',
          },
          {
            messageId: 'Attendance Reports',
            icon: <AssignmentIndIcon height={20} width={20} />,
            url: '/AttendanceReports',
            type: 'item',
            id: '8',
          },
          {
            messageId: 'Salary Report For Bank',
            icon: <img src={salaryIcon} height={20} width={20} />,
            url: '/SalaryReportForBank',
            type: 'item',
            id: '9',
          },
          {
            id: '9',
            type: 'item',
            messageId: 'Attendance Correction',
            icon: <EditRoadIcon height={20} width={20} />,
            url: '/AttendanceCorrection',
          },
          {
            id: '10',
            type: 'item',
            messageId: 'Relieved Employee',
            icon: <EditRoadIcon height={20} width={20} />,
            url: '/RelievedEmployeeDetails',
          },
          {
            id: '11',
            type: 'item',
            messageId: 'Device Register Report',
            icon: <EditRoadIcon height={20} width={20} />,
            url: '/DeviceRegisterReport',
          },
        ]
      },
      {
        id: 'head_32',
        type: 'item',
        messageId: 'Leave',
        icon: <DesktopAccessDisabledIcon style={{ color: 'black' }} />,
        url: '/leaveReport',
      },
      {
        id: 'head_33',
        type: 'item',
        messageId: 'Request',
        icon: <img src={requestIcon} height={20} width={20} />,
        url: '/requestReport',
      },
   
      {
        id: 'head_34',
        type: 'item',
        messageId: 'Salary Report',
        icon: <img src={CurrencyRupeeIcon} height={20} width={20} />,
        url: '/salaryReport',
      },
      {
        id: 'head_35',
        type: 'item',
        messageId: 'Payslip Report',
        icon: <img src={ApprovalIcon} height={20} width={20} />,
        url: '/paySlip',
      },
      {
        id: 'head_147',
        type: 'item',
        messageId: 'Salary Report',
        icon: <img src={ApprovalIcon} height={20} width={20} />,
        url: '/salaryReports',
      },
      {
        id: 'head_36',
        type: 'collapse',
        messageId: 'GrowRetail',
        icon: <ApprovalIcon height={20} width={20} />,
        url:'/superadmin/growretail',
        children: [
          {
            id: 'head_137',
            type: 'item',
            messageId: 'Request and Approval',
            icon: <LocationCityIcon height={20} width={20} />,
            url:'/superadmin/requestAndApproval',
          },
          {
            id: 'head_138',
            type: 'item',
            messageId: 'Products',
            icon: <img src={productIcon} height={20} width={20} />,
            url:'/superadmin/growretailproduct',
          },
        ]
      },
      {
        id: 'head_38',
        type: 'item',
        messageId: 'Tazk',
        icon: <ApprovalIcon height={20} width={20} />,
        url:'/superadmin/ErpRequest',
      },
      {
        id: 'head_39',
        type: 'item',
        messageId: 'PendingActivations',
        icon: <ApprovalIcon height={20} width={20} />,
        url:'/superadmin/pendingActivations',
      },
      {
        id: 'head_79',
        type: 'item',
        messageId: 'Rejected',
        icon: <img src={RejectedRequestIcon} height={20} width={20} />,
        url:'/superadmin/rejected',
      },
      {
        // id: 'head_37',
        // type: 'item',
        // messageId: 'Settings',
        // icon: <LocationCityIcon height={20} width={20} />,
        // url:'/companies',
        id: 'head_78',
        messageId: 'Super Admin Settings',
        icon: <img src={settingsIcon} height={20} width={20} />,
        url: '/superadmin/superAdminSettings',
        type: 'collapse',
        children: [
          {
            id: 'head_37',
            type: 'item',
            messageId: 'Subscriptions',
            icon: <LocationCityIcon height={20} width={20} />,
            url:'/superadmin/companies',
          },
        ]
      },

     ////Config
     {
      messageId: 'Configuration',
      icon: <img src={messagesIcon} height={20} width={20} />,
      url: '/configuration',
      type: 'item',
      id: '9',
    },
    {
      id: 'head_12',
      messageId: 'Reports',
      icon: <img src={posreportIcon} height={20} width={20} />,
      url: '/reporting',
      type: 'collapse',
      children: [
        {
          messageId: 'Purchase Report',
          icon: <ReportIcon style={{ color: 'black' }} />,
          url: '/purchaseReport',
          type: 'item',
        },
        {
          messageId: 'Sales Report',
          icon: <img src={posreportIcon} height={20} width={20} />,
          url: '/SalesReport',
          type: 'item',
        },
        {
          messageId: 'Payment Consolidated',
          icon: <ReportIcon style={{ color: 'black' }} />,
          url: '/paymentConsolidated',
          type: 'item',
        },
        {
          messageId: 'Outstanding Report',
          icon: <ReportIcon style={{ color: 'black' }} />,
          url: '/outstandingmailer',
          type: 'item',
        },
        {
          messageId: 'Closing Stock',
          icon: <img src={closeIcon} height={20} width={20} />,
          url: '/closingstock',
          type: 'item',
        },
        {
          messageId: 'Generated Reports',
          icon: <ReportIcon style={{ color: 'black' }} />,
          url: '/generated',
          type: 'item',
        },
        {
          messageId: 'NewReports',
          icon: <img src={posreportIcon} height={20} width={20} />,
          url: '/new-reports',
          type: 'item',
        },
        {
          messageId: 'Receivable Report',
          icon: <img src={posreportIcon} height={20} width={20} />,
          url: '/receivableReport',
          type: 'item',
        },
        {
          messageId: 'Payable Report',
          icon: <img src={posreportIcon} height={20} width={20} />,
          url: '/payableReport',
          type: 'item',
        },
        {
          messageId: 'Stock Ageing Report',
          icon: <img src={posreportIcon} height={20} width={20} />,
          url: '/stockAgeingReport',
          type: 'item',
        },
        {
          messageId: 'Brand Report',
          icon: <img src={posreportIcon} height={20} width={20} />,
          url: '/brandReport',
          type: 'item',
        },
        {
          messageId: 'Cheques Report',
          icon: <img src={posreportIcon} height={20} width={20} />,
          url: '/chequeReport',
          type: 'item',
        },
        {
          messageId: 'Stock Group',
          icon: <WorkspacesIcon style={{ color: 'black' }} />,
          url: '/stockgroup',
          type: 'item',
        },
      ],
    },
      // Settings 
      {
        id: 'head_13',
        messageId: 'Settings',
        icon: <img src={settingsIcon} height={20} width={20} />,
        url: '/settings',
        type: 'item',
        // children: [
          // {
          //   messageId: 'Locations',
          //   icon: <PinDropIcon style={{ color: 'black' }} />,
          //   url: '/stockLocation',
          //   type: 'item',
          //   id: '1',
          // },
          // {
          //   messageId: 'Employee Verification',
          //   icon: <PinDropIcon style={{ color: 'black' }} />,
          //   url: '/employeeverification',
          //   type: 'item',
          //   id: '2',
          // },
          // {
          //   messageId: 'EmployeeVerification',
          //   icon: <PinDropIcon style={{ color: 'black' }} />,
          //   url: '/employeeverification',
          //   type: 'item',
          //   id: '2',

          // },
          // {
          //   messageId: 'List Verification',
          //   icon: <PinDropIcon style={{ color: 'black' }} />,
          //   url: '/listVerification',
          //   type: 'item',
          //   id: '3',
          // },
          // {
          //   messageId: 'Bank Creation',
          //   icon: <img src={bankingIcon} height={20} width={20} />,
          //   url: '/bankcreation',
          //   type: 'item',
          //   id: '4',
          // },
          // {
          //   messageId: 'Tax Rate',
          //   icon: <PlaylistAddCircleIcon style={{ color: 'black' }} />,
          //   url: '/taxrate',
          //   type: 'item',
          //   id: '5',
          // },
          // {
          //   messageId: 'Cash Box',
          //   icon: <img src={cashboxIcon} height={20} width={20} />,
          //   url: '/cashBox',
          //   type: 'item',
          //   id: '6',
          // },
          // {
          //   messageId: 'Payment Method',
          //   icon: <img src={paymentIcon} height={20} width={20} />,
          //   url: '/paymentmethod',
          //   type: 'item',
          //   id: '8',
          // },
          // {
          //   messageId: 'POS Creation',
          //   icon: <AddCircleIcon style={{ color: 'black' }} />,
          //   url: '/posCreation',
          //   type: 'item',
          //   id: '7',
          // },
          
          // {
          //   messageId: 'Policy',
          //   icon: <PolicyIcon style={{ color: 'black' }} />,
          //   url: '/policy',
    //   type: 'item',
    // },
          // {
          //   messageId: 'Salary Structure',
          //   icon: <img src={salaryIcon} height={20} width={20} />,
          //   url: '/salaryStructure',
    //   type: 'item',
    // },
          // {
          //   messageId: 'Users',
          //   icon: <PeopleAltIcon style={{ color: 'black' }} />,
          //   url: '/usercreation',
    //   type: 'item',
          //   id: '10',
    // },
          // {
          //   messageId: 'Users Role',
          //   icon: <PeopleAltIcon style={{ color: 'black' }} />,
          //   url: '/posrole',
    //   type: 'item',
          //   id: '11',
    // },
          // {
          //   messageId: 'Migration',
          //   icon: <MonetizationOnIcon style={{ color: 'black' }} />,
          //   url: '/migration',
    //   type: 'item',
          //   id: '12',
          // },
          // {
          //   messageId: 'Company Info',
          //   icon: <InfoIcon style={{ color: 'black' }} />,
          //   url: '/companyInfo',
          //   type: 'item',
          //   id: '13',
    // },
          // {
          //   messageId: 'Company Info',
          //   icon: <InfoIcon style={{ color: 'black' }} />,
          //   url: '/information',
          //   type: 'item',
          //   id: '18',
          // },
          // {
          //   messageId: 'Customize Themes',
          //   icon: <img src={themeIcon} height={20} width={20} />,
          //   url: '/CustomizeThemes',
          //   type: 'item',
          //   id: '14',
          // },
          // {
          //   messageId: 'Support',
          //   icon: <ErrorOutlineIcon style={{ color: 'black' }} />,
          //   url: '/errorDashboard',
          //   type: 'item',
          //   id: '15',
          // },
          // {
          //   id: '16',
          //   messageId: 'Bar Code Generator',
          //   icon: <LocalOfferIcon />,
          //   url: '/barCodeQrGenerator',
          //   type: 'item',
          // },
        
        // ],
      },
    ]
  },
];


///////-----filtered routes based on company_type
const filteredRoutes = routesConfig.map(route => {
  if (company_type === 7) {
    return {
      ...route,
      children: route.children?.map(child => {
        if (child.id === "head_13" && child.children?.length > 0) {
          return {
            ...child,
            children: child.children.filter(subChild => subChild.messageId !== "Locations" && subChild.messageId !== "Cash Box")
          };
        }
        return child;
      })
    };
  } else if (company_type === 9) {
    return {
      ...route,
      children: route.children?.map(child => {
        if (child.id === "head_13" && child.children?.length > 0) {
          return {
            ...child,
            children: child.children.filter(subChild => ["Locations", "Users", "Users Role", "Preferences", "Company Info"].includes(subChild.messageId))
          };
        }
        return child;
      })
    };
  } else if (role_name === "Employee" || role_name === "Front Desk") {
    return {
      ...route,
      children: route.children?.map(child => {
        if (child.id === "head_13" && child.children?.length > 0) {
          return {
            ...child,
            children: child.children.filter(subChild => subChild.messageId === "Customize Themes")
          };
        }
        return child;
      })
    };
  } else if (company_type === 5 && roleName === "Employee") {
    return {
      ...route,
      children: route.children?.map(child => {
        if (child.children?.length > 0) {
          if (child.id === "head_12") {
            return {
              ...child,
              children: child.children.filter(subChild => subChild.messageId === "Payslips")
            };
          } else if (child.id === "head_39") {
            return {
              ...child,
              children: child.children.filter(subChild => subChild.messageId === "Task")
            };
          }
        }
        return child;
      })
    };
  }
  // else if (company_type === 5 && roleName === "Employee") {
  //   return {
  //     ...route,
  //     children: route.children?.map(child => {
  //       if (child.id === "head_12" && child.children?.length > 0) {
  //         // Filter out the "Payslips" item from child.children
  //         const filteredChildren = child.children.filter(subChild => subChild.messageId === "Payslips");
          
  //         // Return the updated child object with filtered children array
  //         return {
  //           ...child,
  //           children: filteredChildren
  //         };
  //       }
  //       return child; // Return unchanged child if conditions aren't met
  //     })
  //   };
  // }


  
  return route;
});




export default filteredRoutes;*/
