import React from 'react';
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
// import AccountBoxIcon from '@mui/icons-material/AccountBox';
import {
  AddShoppingCart,
  Addchart,
  Payments,
  Report,
  AccountBalanceWallet,
  Wysiwyg,
  EventNote,
} from '@mui/icons-material';
// import DashboardIcon from '@mui/icons-material/Dashboard';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import InventoryIcon from '@mui/icons-material/Inventory';
import StorageIcon from '@mui/icons-material/Storage';
import MemoryIcon from '@mui/icons-material/Memory';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import SchemaIcon from '@mui/icons-material/Schema';
// import PaidIcon from '@mui/icons-material/Paid';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import GroupsIcon from '@mui/icons-material/Groups';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import ListAltIcon from '@mui/icons-material/ListAlt';
import NoteIcon from '@mui/icons-material/Note';
import ListIcon from '@mui/icons-material/List';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import PaymentIcon from '@mui/icons-material/Payment';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import AddCardIcon from '@mui/icons-material/AddCard';
import InfoIcon from '@mui/icons-material/Info';
import SummarizeIcon from '@mui/icons-material/Summarize';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const MenuList = [
  {
    id: 'head_1',
    item_label: 'Dashboard',
    icon: <Dashboard />,
    route_path: '/dashboard',
  },
  {
    id: 'head_2',
    item_label: 'Contacts',
    icon: <GroupsIcon />,
    route_path: '/customer',
  },
  {
    id: 'head_18',
    messageId: 'CUSTOMER_PAGE_ALL_FOLDER',
    type: 'item',
    icon: <GroupsIcon />,
    url: '/apps/contacts',
  },
  {
    id: 'head_3',
    item_label: 'Point Of Sale',
    icon: <PointOfSaleIcon />,
    route_path: '/session',
  },
  {
    id: 'head_4',
    item_label: 'Pos Sale',
    icon: <PointOfSaleIcon />,
    route_path: '/posSale',
  },
  {
    id: 'head_17',
    item_label: 'Sales Man',
    route_path: '/salesman',
  },
 
  {
    id: 'head_5',
    item_label: 'Sales',
    icon: <AddShoppingCart />,
    route_path: '/invoices',
    nested: [
      {
        item_label: 'Sales Order',
        icon: <AddShoppingCart />,
        route_path: '/invoices',
      },
      // {
      //   item_label: 'SO Tracking',
      //   icon: <Addchart />,
      //   route_path: '/soTracking',
      // },
      {
        item_label: 'Receivables',
        icon: <ListAltIcon />,
        route_path: '/receivable',
      },
    ],
  },
  {
    id: 'head_6',
    item_label: 'Purchases',
    icon: <ShoppingBasket />,
    route_path: '/bills',
    nested: [
      {
        item_label: 'Purchase Orders',
        icon: <Wysiwyg />,
        route_path: '/bills',
      },
      {
        item_label: 'Payables',
        icon: <ListAltIcon />,
        route_path: '/payable',
      },
    ],
  },
  {
    id: 'head_7',
    item_label: 'Inventory',
    icon: <InventoryIcon />,
    route_path: '/inventory',
    nested: [
      {
        item_label: 'Product',
        icon: <LocalGroceryStore />,
        route_path: '/product',
      },
      {
        item_label: 'Stocks',
        icon: <ShowChartIcon />,
        route_path: '/inventory',
      },
      {
        item_label: 'Stock Transfer',
        icon: <StackedLineChartIcon />,
        route_path: '/stocktransfer',
      },
      {
        item_label: 'Stock Receive',
        icon: <ManageSearchIcon />,
        route_path: '/stockreceive',
      },
      // {

      //     item_label: 'InventoryMD',
      //     icon: <InfoIcon />,
      //     route_path: '/InventoryManagementDashboard'

      // },
      {
        item_label: 'StockReconcilate',
        icon: <ShowChartIcon />,
        route_path: '/stockReconcilate',
      },
    ],
  },

  {
    id: 'head_8',
    item_label: 'Payments',
    icon: <PaymentIcon />,
    route_path: '/payments',
    nested: [
      {
        id: 'payinout',
        item_label: 'Pay In / Pay Out',
        icon: <MoneyOffIcon />,
        route_path: '/payinout',
      },
      {
        id: 'paymentreport',
        item_label: 'Payment Report',
        icon: <PaymentIcon />,
        route_path: '/paymentreport',
      },
      {
        item_label: 'CashBox Adjustment',
        icon: <AddCardIcon />,
        route_path: '/cashboxAdjustment',
      },
    ],
  },
  {
    id: 'head_9',
    item_label: 'Leads',
    icon: <LeaderboardIcon />,
    route_path: '/leads',
  },
  {
    id: 'head_10',
    item_label: 'Accounts',
    icon: <AccountBalanceIcon />,
    route_path: '/accounts',
    nested: [
      {
        id: 'Account_Transaction',
        item_label: 'Journal Entry',
        icon: <AccountBalanceWallet />,
        route_path: '/Journals',
      },
      {
        item_label: 'Credit / Debit Notes',
        icon: <AddCardIcon />,
        route_path: '/manualNotes',
      },
      {
        item_label: 'Ledgers',
        icon: <MemoryIcon />,
        route_path: '/generalLedger',
      },
      {
        item_label: 'Chart of Accounts',
        icon: <ListIcon />,
        route_path: '/chartOfAccounts',
      },
      {
        item_label: 'Profit & loss A/C',
        icon: <AttachMoneyIcon />,
        route_path: '/profitloss',
      },
      {
        item_label: 'Balance Sheet',
        icon: <ListAltIcon />,
        route_path: '/balancesheet',
      },
      {
        item_label: 'Trial Balance',
        icon: <SummarizeIcon />,
        route_path: '/reports/trial-balance',
      },
      {
        item_label: 'P&L (Schedule III)',
        icon: <AttachMoneyIcon />,
        route_path: '/reports/profit-loss',
      },
      {
        item_label: 'Balance Sheet (Sch III)',
        icon: <ListAltIcon />,
        route_path: '/reports/balance-sheet',
      },
    ],
  },
  {
    id: 'head_11',
    item_label: 'Schemes',
    icon: <SchemaIcon />,
    route_path: '/scheme',
    nested: [
      {
        item_label: 'Scheme',
        icon: <EventNote />,
        route_path: '/schemes',
      },
      {
        item_label: 'SchemesDashBoard',
        icon: <DashboardCustomizeIcon />,
        route_path: '/schemes/dashboard',
      },
    ],
  },
  {
    id: 'head_12',
    item_label: 'Reports',
    icon: <Report />,
    route_path: '/reporting',
    nested: [
      {
        item_label: 'Purchase Report',
        icon: <Report />,
        route_path: '/purchaseReport',
      },
      {
        item_label: 'Daily Report',
        icon: <Report />,
        route_path: '/dailyReport',
      },
      {
        item_label: 'Sales Report',
        icon: <Assessment />,
        route_path: '/salesReport'
    },
      {
        item_label: 'Payment Consolidated',
        icon: <GroupsIcon />,
        route_path: '/paymentConsolidated',
      },
      {
        item_label: 'Outstanding Report',
        icon: <Addchart />,
        route_path: '/outstandingmailer',
      },
      {
        item_label: 'Closing Stock',
        icon: <ShowChartIcon />,
        route_path: '/closingstock',
      },
      {
        item_label: 'GeneratedReports',
        icon: <NoteIcon />,
        route_path: '/generated',
      },
      {
        item_label: 'NewReportsss',
        icon: <Addchart />,
        route_path: '/new-reports',
      },
      {
        item_label: 'ReceivableReport',
        icon: <NoteIcon />,
        route_path: '/receivableReport',
      },
      {
        item_label: 'Brand Sales Report',
        icon: <Report />,
        route_path: '/brandReport',
      },
      {
        item_label: 'Cheques Report',
        icon: <Report />,
        route_path: '/chequeReport',
      },
    ],
  },
  {
    id: 'head_13',
    item_label: 'Settings',
    icon: <StorageIcon />,
    route_path: '/configuration',
    // nested: [
    //   {
    //     item_label: 'StockLocation',
    //     icon: <LocationOnIcon />,
    //     route_path: '/stockLocation',
    //   },
    //   {
    //     item_label: 'Bank Creation',
    //     icon: <AccountBalanceIcon />,
    //     route_path: '/bankcreation',
    //   },
    //   {
    //     item_label: 'TaxRate',
    //     icon: <Addchart />,
    //     route_path: '/taxrate',
    //   },
    //   {
    //     item_label: 'StockLocation',
    //     icon: <LocationOnIcon />,
    //     route_path: '/stockLocation',
    //   },
    //   {
    //     item_label: 'CashBox',
    //     icon: <ShoppingBag />,
    //     route_path: '/cashBox',
    //   },
    //   {
    //     item_label: 'POS Creation',
    //     icon: <PointOfSaleIcon />,
    //     route_path: '/posCreation',
    //   },
    //   {
    //     item_label: 'Payment Method',
    //     icon: <Payments />,
    //     route_path: '/paymentmethod',
    //   },
    //   {
    //     item_label: 'Users',
    //     icon: <GroupsIcon />,
    //     route_path: '/usercreation',
    //   },
    //   {
    //     item_label: 'Users Role',
    //     icon: <AccountBalanceIcon />,
    //     route_path: '/posrole',
    //   },   
    //   {
    //     item_label: 'Company Info',
    //     icon: <InfoIcon />,
    //     route_path: '/companyInfo',
    //   },
    // ],
  },
  {
    id: 'head_14',
    item_label: 'Attendance',
    icon: <AppRegistrationIcon />,
    route_path: '/attendance',
  },
  {
    id: 'head_15',
    item_label: 'User Info',
    route_path: '/common/myaccount',
  },
  {
    id: 'head_16',
    item_label: 'User Message',
    route_path: '/message',
  },
  
];

export default MenuList;
