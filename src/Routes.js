import React from 'react';
import {Navigate} from 'react-router-dom';
import Login from './pages/login';
import Home from './pages/home';
//import Customer from './pages/sales/customer';
import Customer from './pages/sales/customer';
import Vendor from './pages/vendor';
import TaxCategory from './pages/sales/taxCategory';
import TaxCustomerCategory from './pages/sales/taxCustomerCategory';
import Tax from './pages/sales/tax';
import ProductCategory from './pages/sales/productCategory';
import Product from './pages/sales/product';
import Inventory from './pages/sales/inventory';
import StockLocation from './pages/common/stockLocation';
import Sales from './pages/sales/sales';
import Purchases from './pages/sales/purchases';
import TaxCodes from './pages/sales/taxCodes';
import TaxRate from './pages/sales/taxRate';
import TaxJurisdiction from './pages/sales/taxJurisdiction';
import PointOfSale from './pages/sales/pointOfsale';
import Payment from './components/pos/payment_section';
import Session from './components/pos/session/Session';
import {Reporting} from './pages/reporting';
import GeneratedReports from './pages/reporting/GeneratedReports';
import Balancesheet from './pages/accounts/balancesheet';
import Profitloss from './pages/accounts/profitloss';
// import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ChartOfAccounts from './pages/accounts/ChartofAccounts';
import GeneralLedger from './pages/accounts/GeneralLedger';
import Transaction from './pages/accounts/transaction';
import Leads from './pages/leads';
import NewReport from './pages/reporting/NewReport';
import Cookies from 'universal-cookie';
import Schemes from './pages/Schemes';
import ApexCharts from './pages/Schemes/Chart';
import PosInvoice from './pages/pos_invoice';
import Receivable from './pages/outstanding/receivable';
import Payable from './pages/outstanding/payable';
import PosCreation from './pages/PosCreation';
import Transfer from './pages/inventory/transfer.js';
import Receiver from './pages/inventory/receiver.js';
import InventoryManagementDashboard from './pages/sales/inventoryMD';
import PaymentMethod from './pages/sales/paymentmethods';
//import Trans from "./pages/trans";
import CashOutIn from './pages/accounts/cashOutIn';
import PaymentReceipt from './pages/paymentReceipt';
import CashBoxCreation from './pages/accounts/cashBoxCreation'; 
import Ledger from './pages/accounts/Ledger/index';
import PosSale from './pages/pointofsale/posSale/index';
import ClosingStock from './pages/closingStock/index';
import Outstanding from './pages/mailreport/outstanding';
import SOTracking from './pages/soTracking';
import Attendance from './pages/attendance';
import Barchart from './components/dashboard/basicBarChart';
import ExpanseAnalysis from './components/dashboard/expanseAnalysis';
import Speedometer from './components/dashboard/speedometer';
import TotalAccPayable from './components/dashboard/payable_receivable';
import CategorySummary from './components/dashboard/inventoryDashboard/categorySummary';
import BillsRow from './components/customer_erpDesign/billsRow';
import ProductBrand from './components/erpDesign/productBrand';
import ProductStockable from './components/erpDesign/productStockable';
import PrimaryContact from './components/customer_erpDesign/primaryContact';
import CollapsibleTable from './components/purchaseDetails/purchaseTable';
import PurchaseCard from './components/purchaseDetails/purchaseCard';
import SalesChart from './components/purchaseDetails/salesGraph';
import PaymentConsolidated from './pages/paymentConsolidated/index';
import Linechart from './components/dashboard/linechart/linechart';
// import CategorySummary from './components/dashboard/inventoryDashboard/categorySummary'
import Payin from './pages/home/Payin';
import PosRole from './pages/common/posrole/index';
import LastBills from './components/customer_erpDesign/lastBills';
import DaySales from './components/dashboard/DaySales';
import CashInHand from './components/dashboard/CashInHand';
// import LastBills from "./components/erpDesign/lastBills";
import BankCreation from './pages/accounts/BankCreation/index';
// import LastBills from "./components/customer_erpDesign/lastBills";
import DiscountType from './pages/discountType/index';
import Usercreation from './pages/Usercreation/index';
import CashBoxAdjustment from './pages/accounts/cashBoxAdjustment/index';
import Account from './components/dashboard/Account_Payable/index';
import PayableReceivable from './components/dashboard/payable_receivable/index';
import ProfitAndLoss from './components/dashboard/ProfitAndLoss/index';
import ManualNotes from './pages/manualNotes';
import StatementOfAccounts from './components/customer_erpDesign/statementOfAccounts';
import StatementDialog from './components/customer_erpDesign/StatementDialog';
import CompanyInfo from './pages/common/CompanyInfo/CompanyInfo';
import Information from './pages/common/information/index';
import StockReconcilate from './pages/stockReconcilate/index';
import DailyReport from './pages/pointofsale/DailyReport/index';
import SalesReport from "./pages/salesReport";
import PurchaseReport from './pages/purchaseReport';
import ReceivableReport from './pages/ReceivableReport'
import CustomizeThemes from 'pages/CustomizeThemes';
import BankReconciliation from 'pages/accounts/BankReconciliation';
import BrandReport from './pages/brandReport';
import ChequeReport from './pages/chequesReport';
import { TrialBalancePage, ProfitLossPage, BalanceSheetPage, LedgerPage, VouchersPage, GstTdsPage } from './pages/accounts/reports';

import Message from './pages/common/message/index';
import SalesDashboard from 'components/dashboard/SalesDashboard';
import Notification from 'pages/notification';
import Advancesheet from 'pages/Payroll/advancesheet';
import FuelAllowance from './pages/FuelAllowance/index';
import ErrorDashboard from './pages/ErrorDashboad/index';
import { getsessionStorage } from 'pages/common/login/cookies';
import Loans from 'pages/Loans';
import Loanpayments from 'pages/Loans/Loanpayments';
import ErrordashBoardUser from './pages/ErrorDashboardUsers/index'
import RequestAndApproval from 'pages/SuperAdmin/requestAndApproval';
import Companies from 'pages/SuperAdmin/companies';
import ShiftList from 'pages/Payroll/Shift/shiftList';
import AddShift from 'pages/Payroll/Shift';
import SelfieAttendance from 'pages/Payroll/SelfieAttendance';
import PendingActivations from 'pages/SuperAdmin/pendingActivation';
import Growretailproduct from 'pages/SuperAdmin/growretailproduct';
import BarCodeGenerator from 'components/BarCodeGenerator';
import ReportPage from 'pages/Report/index.js';
import RejectedRequest from 'pages/SuperAdmin/rejected'
import Claims from 'pages/common/Claims';
import Support from 'pages/common/support'
import LandingPage from 'pages/common/home/landingPage';
import CashHand from 'pages/CashHand/cashInHand';
import Activity from '@crema/core/AppLayout/components/UserInfo/activity';
import TodaySalesReport from "./pages/todaySalesReport";
import BR from './pages/accounts/BankReconciliation/bankReconciliation';
import Reconciled from 'pages/reconciled/Reconciled';
import NonReconciled from 'pages/reconciled/NonReconciled';


function redirect() {
  // const cookies = new Cookies();
  const storage = getsessionStorage()
  let modules = false;
  if (storage) {
    modules = storage?.accessToken || false;
  }
  // const resp = JSON.parse(cookies.get('login'))?.accessToken
  return modules;
}

// window.onbeforeunload = (event) => {
//     const e = event || window.event;
//     e.preventDefault();
//     if (e) {
//         const cookies = new Cookies();
//         cookies.remove('login')
//         e.returnValue = '';
//     }
//     return '';
//   };

const ROUTES = [
  {
    path: '/',
    key: 'ROOT',
    exact: true,
    component: () => {
      return redirect() ? <Navigate to='/common/home' /> : <Login />;
    },
  },
  // {
  //     path: "/home",
  //     key: "HOME_PAGE",
  //     exact: true,
  //     component: () => { return redirect() ? <Home /> : <Navigate to='/' /> }

  // },
  {
    path: '/common/home',
    key: 'HOME_PAGE',
    exact: true,
    component: () => {
      return redirect() ? <Home /> : <Navigate to='/' />;
    },
  },
  {
    path: '/setup',
    key: 'SET_UP',
    exact: true,
    component: () => {
      return redirect() ? <LandingPage /> : <Navigate to='/' />;
    },
  },
  {
    path: '/common/activity',
    key: 'ACTIVITY',
    exact: true,
    component: () => {
      return redirect() ? <Activity /> : <Navigate to='/' />;
    },
  },
  {
    path: '/payintotal',
    key: 'PAYIN_PAGE',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <Payin /> : <Navigate to='/' />;
    },
  },
 
  {
    path: '/customer',
    key: 'CUSTOMER_PAGE',
    parentName: 'Contacts',
    // parentName:'Sales',
    exact: true,
    component: () => {
      return redirect() ? <Customer /> : <Navigate to='/' />;
    },
  },
  {
    path: '/vendor',
    key: 'NEWVENDAR_PAGE',
    exact: true,
    component: () => {
      return redirect() ? <Vendor /> : <Navigate to='/' />;
    },
  },
  {
    path: '/taxCategory',
    key: 'TAXCATEGORY_PAGE',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <TaxCategory /> : <Navigate to='/' />;
    },
  },
  {
    path: '/taxCustomerCategory',
    key: 'TAXCUSTOMERCATEGORY_PAGE',
    exact: true,
    component: () => {
      return redirect() ? <TaxCustomerCategory /> : <Navigate to='/' />;
    },
  },
  {
    path: '/tax',
    key: 'TAX_PAGE',
    exact: true,
    component: () => <Tax />,
  },
  {
    path: '/taxJurisdiction',
    key: 'TAX_JURISDICTION_PAGE',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <TaxJurisdiction /> : <Navigate to='/' />;
    },
  },
  {
    path: '/productCategory',
    key: 'PRODUCTCATEGORY_PAGE',
    exact: true,
    component: () => {
      return redirect() ? <ProductCategory /> : <Navigate to='/' />;
    },
  },
  {
    path: '/product',
    key: 'PRODUCT_PAGE',
    parentName: 'Inventory',
    exact: true,
    component: () => {
      return redirect() ? <Product /> : <Navigate to='/' />;
    },
  },
  {
    path: '/inventory',
    key: 'INVENTORY_PAGE',
    parentName: 'Inventory',
    exact: true,
    component: () => {
      return redirect() ? <Inventory /> : <Navigate to='/' />;
    },
  },
  {
    path: '/InventoryManagementDashboard',
    key: 'INVENTORY_PAGE',
    parentName: 'Inventory',
    exact: true,
    component: () => {
      return redirect() ? (
        <InventoryManagementDashboard />
      ) : (
        <Navigate to='/' />
      );
    },
  },
  {
    path: '/stockLocation',
    key: 'STOCKLOCATION_PAGE',
    parentName: 'Inventory',
    exact: true,
    component: () => {
      return redirect() ? <StockLocation /> : <Navigate to='/' />;
    },
  },
  {
    path: '/stockReconcilate',
    key: 'STOCKRECONCILATE_PAGE',
    parentName: 'Inventory',
    exact: true,
    component: () => {
      return redirect() ? <StockReconcilate /> : <Navigate to='/' />;
    },
  },
  {
    path: '/invoices',
    key: 'SALES_PAGE',
    parentName: 'Sales',
    exact: true,
    component: () => {
      return redirect() ? <Sales /> : <Navigate to='/' />;
    },
  },
  {
    path: '/bills',
    key: 'PURCHASES_PAGE',
    parentName: 'Purchases',
    exact: true,
    component: () => {
      return redirect() ? <Purchases /> : <Navigate to='/' />;
    },
  },
  {
    path: '/taxcodes',
    key: 'TAXCODES_PAGE',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <TaxCodes /> : <Navigate to='/' />;
    },
  },
  {
    path: '/taxrate',
    key: 'TAXRATE_PAGE',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <TaxRate /> : <Navigate to='/' />;
    },
  },
  {
    path: '/leads',
    key: 'LEADS_PAGE',
    parentName: 'Leads',
    exact: true,
    component: () => {
      return redirect() ? <Leads /> : <Navigate to='/' />;
    },
  },
  {
    path: '/ledger',
    key: 'LEDGER_PAGE',
    parentName: 'Accounts',
    exact: true,
    component: () => {
      return redirect() ? <Ledger /> : <Navigate to='/' />;
    },
  },
  {
    path: '/posSale',
    key: 'POSSALE_PAGE',
    parentName: 'Pos Sale',
    exact: true,
    component: () => {
      return redirect() ? <PosSale /> : <Navigate to='/' />;
    },
  },
  {
    path: '/session',
    key: 'SESSION_PAGE',
    parentName: 'Point Of Sale',
    exact: true,
    component: () => {
      return redirect() ? <Session /> : <Navigate to='/' />;
    },
    // component: () => <PointOfSale />,
  },
  {
    path: '/pointofsale',
    key: 'POINTOFSALE_PAGE',
    parentName: 'Point Of Sale',
    exact: true,
    // component: () => < Index/>,
    // component: () => <PointOfSale />,
    component: () => {
      return redirect() ? <PointOfSale /> : <Navigate to='/' />;
    },
    // component: () => <PointOfSale />,
  },
  {
    path: '/pointofsale/payment',
    parentName: 'Point Of Sale',
    key: 'PAYMENT_PAGE',
    exact: true,
    component: () => {
      return redirect() ? <Payment /> : <Navigate to='/' />;
    },
  },
  {
    path: '/new-reports',
    key: 'NEW_REPORT_PAGE',
    parentName: 'Reports',
    exact: true,
    component: () => {
      return redirect() ? <Reporting /> : <Navigate to='/' />;
    },
  },
  // {
  //   path: '/report',
  //   key: 'Reports',
  //   parentName: 'Reports',
  //   exact: true,
  //   component: () => {
  //     return redirect() ? <ReportPage /> : <Navigate to='/' />;
  //   },
  // },
  {
    path: `/:type-reports`,
    key: 'TYPE_REPORT_PAGE',
    parentName: 'Reports',
    exact: true,
    component: () => {
      return redirect() ? <NewReport view={false} /> : <Navigate to='/' />;
    },
  },
  {
    path: `/edit-reports/:id`,
    key: 'EDIT_REPORT_PAGE',
    parentName: 'Reports',
    exact: true,
    component: () => {
      return redirect() ? <NewReport view={false} /> : <Navigate to='/' />;
    },
  },
  {
    path: `/view-reports/:id`,
    key: 'VIEW_REPORT_PAGE',
    parentName: 'Reports',
    exact: true,
    component: () => {
      return redirect() ? <NewReport view={true} /> : <Navigate to='/' />;
    },
  },
  {
    path: '/balancesheet',
    key: 'Balance Sheet',
    parentName: 'Accounts',
    exact: true,
    component: () => {
      return redirect() ? <Balancesheet /> : <Navigate to='/' />;
    },
  },
  {
    path: '/profitloss',
    key: 'Profit Loss',
    parentName: 'Accounts',
    exact: true,
    component: () => {
      return redirect() ? <Profitloss /> : <Navigate to='/' />;
    },
  },
  {
    path: '/chartOfAccounts',
    key: 'ChartOfAccounts',
    parentName: 'Accounts',
    exact: true,
    component: () => {
      return redirect() ? <ChartOfAccounts /> : <Navigate to='/' />;
    },
  },
  // {
  //     path: "/accountsLedger",
  //     key: "AccountsLedger",
  //     exact: true,
  //     component: () => {return redirect() ? <AccountsLedger /> : <Navigate to='/'/>},
  // },
  {
    path: '/generalLedger',
    key: 'GeneralLedger',
    parentName: 'Accounts',
    exact: true,
    component: () => {
      return redirect() ? <GeneralLedger /> : <Navigate to='/' />;
    },
  },
  {
    path: '/Journals',
    key: 'TRANSACTION_PAGE',
    parentName: 'Accounts',
    exact: true,
    component: () => {
      return redirect() ? <Transaction /> : <Navigate to='/' />;
    },
    // component: () => <Transaction/>,
  },
  {
    path: '/generated',
    key: 'GENERATED_REPORT_PAGE',
    parentName: 'Reports',
    exact: true,
    component: () => <GeneratedReports />,
  },
  {
    path: '/schemes',
    key: 'SCHEMS',
    parentName: 'Schemes',
    exact: true,
    component: () => <Schemes />,
  },
  {
    path: '/schemesdashboard',
    key: 'SCHEMS-DASHBOARD',
    parentName: 'Schemes',
    exact: true,
    component: () => <ApexCharts />,
  },
  {
    path: '/pointofsale/payment/posInvoice',
    parentName: 'Point Of Sale',
    key: 'posInvoice',
    exact: true,
    component: () => <PosInvoice />,
  },
  {
    path: '/payable',
    key: 'Payable',
    parentName: 'Purchases',
    exact: true,
    component: () => {
      return redirect() ? <Payable /> : <Navigate to='/' />;
    },
  },
  {
    path: '/receivable',
    key: 'receivable',
    parentName: 'Sales',
    exact: true,
    component: () => {
      return redirect() ? <Receivable /> : <Navigate to='/' />;
    },
  },
  {
    path: '/posCreation',
    key: 'posCreation',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <PosCreation /> : <Navigate to='/' />;
    },
  },
  {
    path: '/stocktransfer',
    key: 'Transfer',
    parentName: 'Inventory',
    exact: true,
    component: () => {
      return redirect() ? <Transfer /> : <Navigate to='/' />;
    },
  },
  {
    path: '/stockreceive',
    key: 'Receiver',
    parentName: 'Inventory',
    exact: true,
    component: () => {
      return redirect() ? <Receiver /> : <Navigate to='/' />;
    },
  },

  {
    path: '/paymentmethod',
    key: 'paymentMethod',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <PaymentMethod /> : <Navigate to='/' />;
    },
  },

  // {
  //     path: "/trans",
  //     key: "trans",
  //     exact: true,
  //     component: () => { return redirect() ? <Trans/> : <Navigate to='/' /> },
  // },

  {
    path: '/payinout',
    key: 'payInOut',
    parentName: 'Accounts',
    exact: true,
    component: () => {
      return redirect() ? <CashOutIn /> : <Navigate to='/' />;
    },
  },

  {
    path: '/paymentreport',
    key: 'paymentReport',
    parentName: 'Accounts',
    exact: true,
    component: () => {
      return redirect() ? <PaymentReceipt /> : <Navigate to='/' />;
    },
  },

  {
    path: '/cashBox',
    key: 'CashBox',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <CashBoxCreation /> : <Navigate to='/' />;
    },
  },
  {
    path: '/outstandingmailer',
    parentName: 'Reports',
    key: 'Outstanding',
    exact: true,
    component: () => {
      return redirect() ? <Outstanding /> : <Navigate to='/' />;
    },
  },

  {
    path: '/closingstock',
    key: 'closingStock',
    parentName: 'Reports',
    exact: true,
    component: () => {
      return redirect() ? <ClosingStock /> : <Navigate to='/' />;
    },
  },
  {
    path: '/soTracking',
    key: 'SO Tracking',
    parentName: 'Sales',
    exact: true,
    component: () => {
      return redirect() ? <SOTracking /> : <Navigate to='/' />;
    },
  },
  {
    path: '/attendance',
    key: 'Attendance',
    parentName: 'Attendance',
    exact: true,
    component: () => {
      return redirect() ? <Attendance /> : <Navigate to='/' />;
    },
  },
  {
    path: '/paymentconsolidated',
    key: 'paymentConsolidated',
    parentName: 'Reports',
    exact: true,
    component: () => {
      return redirect() ? <PaymentConsolidated /> : <Navigate to='/' />;
    },
  },
  {
    path: '/speedometer',
    key: 'Speed',
    exact: true,
    component: () => {
      return redirect() ? <Speedometer /> : <Navigate to='/' />;
    },
  },
  {
    path: '/daySales',
    key: 'DAY_SALES',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <DaySales /> : <Navigate to='/' />;
    },
  },
  {
    path: '/cashInHand',
    key: 'cashInHand',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <CashHand /> : <Navigate to='/' />;
    },
  },
  {
    path: '/totalaccpayable',
    key: 'Accounts Payable',
    exact: true,
    component: () => {
      return redirect() ? <BillsRow /> : <Navigate to='/' />;
    },
  },
  {
    path: '/barchart',
    parentName: 'Settings',
    key: 'Bar Chart',
    exact: true,
    component: () => {
      return redirect() ? <Barchart /> : <Navigate to='/' />;
    },
  },
  {
    path: '/expenseanalysis',
    key: 'Expense Analysis',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <ExpanseAnalysis /> : <Navigate to='/' />;
    },
  },
  {
    path: '/linechart',
    key: 'Chart',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <Linechart /> : <Navigate to='/' />;
    },
  },
  {
    path: '/profitandloss',
    key: 'Chart',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <ProfitAndLoss /> : <Navigate to='/' />;
    },
  },
  {
    path: '/categorySummary',
    key: 'Category Summary',
    exact: true,
    component: () => {
      return redirect() ? <CategorySummary /> : <Navigate to='/' />;
    },
  },
  {
    path: '/purchaseTable',
    key: 'Purchase Table',
    exact: true,
    component: () => {
      return redirect() ? <CollapsibleTable /> : <Navigate to='/' />;
    },
  },
  {
    path: '/purchaseCard',
    key: 'Purchase Card',
    exact: true,
    component: () => {
      return redirect() ? <PurchaseCard /> : <Navigate to='/' />;
    },
  },
  {
    path: '/salesChart',
    key: 'Sales Chart',
    exact: true,
    component: () => {
      return redirect() ? <SalesChart /> : <Navigate to='/' />;
    },
  },
  {
    path: '/productbrand',
    key: 'Product Brand',
    exact: true,
    component: () => {
      return redirect() ? <ProductBrand /> : <Navigate to='/' />;
    },
  },
  {
    path: '/productstockable',
    key: 'Product Stockable',
    exact: true,
    component: () => {
      return redirect() ? <ProductStockable /> : <Navigate to='/' />;
    },
  },
  {
    path: '/primarycontact',
    key: 'Primary Contact',
    exact: true,
    component: () => {
      return redirect() ? <PrimaryContact /> : <Navigate to='/' />;
    },
  },
  {
    path: '/posrole',
    key: 'pos',
    exact: true,
    parentName: 'Settings',
    component: () => {
      return redirect() ? <PosRole /> : <Navigate to='/' />;
    },
  },
  {
    path: '/bankcreation',
    key: 'Bank Creation',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <BankCreation /> : <Navigate to='/' />;
    },
  },
  {
    path: '/discountType',
    key: 'Discount Type',
    parentName: 'Contacts',
    exact: true,
    component: () => {
      return redirect() ? <DiscountType /> : <Navigate to='/' />;
    },
  },
  {
    path: '/usercreation',
    key: 'Users',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <Usercreation /> : <Navigate to='/' />;
    },
  },
  {
    path: '/cashboxAdjustment',
    key: 'CashBox Adjustment',
    parentName: 'Payments',
    exact: true,
    component: () => {
      return redirect() ? <CashBoxAdjustment /> : <Navigate to='/' />;
    },
  },
  {
    path: '/accountpayable',
    key: 'Account Payable',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <Account /> : <Navigate to='/' />;
    },
  },
  {
    path: '/totacc',
    key: 'Payable Receivable',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <PayableReceivable /> : <Navigate to='/' />;
    },
  },
  {
    path: '/manualNotes',
    key: 'ManualNotes',
    parentName: 'Accounts',
    exact: true,
    component: () => {
      return redirect() ? <ManualNotes /> : <Navigate to='/' />;
    },
  },
  {
    path: '/statementOfAccounts',
    key: 'StatementOfAccounts',
    parentName: 'Contacts',
    exact: true,
    component: () => {
      return redirect() ? <StatementOfAccounts /> : <Navigate to='/' />;
    },
  },
  {
    path: '/StatementDialog',
    key: 'StatementDialog',
    parentName: 'Contacts',
    exact: true,
    component: () => {
      return redirect() ? <StatementDialog /> : <Navigate to='/' />;
    },
  },
  {
    path: '/companyInfo',
    key: 'CompanyInfo',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <CompanyInfo /> : <Navigate to='/' />;
    },
  },

  {
    path: '/information',
    key: 'Information',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <Information /> : <Navigate to='/' />;
    },
  },
  {
    path: '/dailyReport',
    key: 'dailyReport',
    parentName: 'Reports',
    exact: true,
    component: () => {
      return redirect() ? <DailyReport /> : <Navigate to='/' />;
    },
  },
  {
    path: "/salesReport",
    key: "salesReport",
    parentName: 'Reports',
    exact: true,
    component: () => { return redirect() ? <SalesReport /> : <Navigate to='/' /> },
  },
  {
    path: "/dailySalesReport",
    key: "todaySalesReport",
    parentName: 'Reports',
    exact: true,
    component: () => { return redirect() ? <TodaySalesReport /> : <Navigate to='/' /> },
},
  {
    path: '/purchaseReport',
    key: 'purchaseReport',
    parentName: 'Reports',
    exact: true,
    component: () => {
      return redirect() ? <PurchaseReport /> : <Navigate to='/' />;
    },
  },
  {
    path: '/brandReport',
    key: 'brandReport',
    parentName: 'Reports',
    exact: true,
    component: () => {
      return redirect() ? <BrandReport /> : <Navigate to='/' />;
    },
  },
  {
    path: '/chequeReport',
    key: 'chequeReport',
    parentName: 'Reports',
    exact: true,
    component: () => {
      return redirect() ? <ChequeReport /> : <Navigate to='/' />;
    },
  },
  {
    path: '/receivableReport',
    key: 'receivableReport',
    parentName: 'Reports', 
    exact: true,
    component: () => {
      return redirect() ? <ReceivableReport /> : <Navigate to='/' />;
    },
  },
  {
    path: '/CustomizeThemes',
    key: 'CustomizeThemes',
    parentName: 'settings',
    exact: true,
    component: () => {
      return redirect() ? <CustomizeThemes /> : <Navigate to='/' />;
    },
  },
  {
    path: '/bankReconciliation',
    key: 'BankReconciliation',
    parentName: 'Accounts',
    exact: true,
    component: () => {
      return redirect() ? <BR /> : <Navigate to='/' />;
    },
  },
  {
    path: '/reports/trial-balance',
    key: 'REPORTS_TRIAL_BALANCE',
    parentName: 'Accounts',
    exact: true,
    component: () => {
      return redirect() ? <TrialBalancePage /> : <Navigate to='/' />;
    },
  },
  {
    path: '/reports/profit-loss',
    key: 'REPORTS_PROFIT_LOSS',
    parentName: 'Accounts',
    exact: true,
    component: () => {
      return redirect() ? <ProfitLossPage /> : <Navigate to='/' />;
    },
  },
  {
    path: '/reports/balance-sheet',
    key: 'REPORTS_BALANCE_SHEET',
    parentName: 'Accounts',
    exact: true,
    component: () => {
      return redirect() ? <BalanceSheetPage /> : <Navigate to='/' />;
    },
  },
  {
    path: '/reports/ledger/:accountId',
    key: 'REPORTS_LEDGER',
    parentName: 'Accounts',
    exact: true,
    component: () => {
      return redirect() ? <LedgerPage /> : <Navigate to='/' />;
    },
  },
  {
    path: '/reports/vouchers',
    key: 'REPORTS_VOUCHERS',
    parentName: 'Accounts',
    exact: true,
    component: () => {
      return redirect() ? <VouchersPage /> : <Navigate to='/' />;
    },
  },
  {
    path: '/reports/gst-tds',
    key: 'REPORTS_GST_TDS',
    parentName: 'Accounts',
    exact: true,
    component: () => {
      return redirect() ? <GstTdsPage /> : <Navigate to='/' />;
    },
  },
  {
    path: '/message',
    key: 'User Message',
    parentName: 'User Message',
    exact: true,
    component: () => {
      return redirect() ? <Message /> : <Navigate to='/' />;
    },
  },
  {
    path: '/salesDashboard',
    key: 'salesDashboard',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <SalesDashboard /> : <Navigate to='/' />;
    },
  },
  {
    path: '/NotificationView',
    key: 'NotificationView',
    parentName: 'Reports',
    exact: true,
    component: () => {
      return redirect() ? <Notification /> : <Navigate to='/' />;
    },
  },
  {
    path: '/advancesheet',
    key: 'advancesheet',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <Advancesheet /> : <Navigate to='/' />;
    },
  },

  {
    path: '/AddShift',
    key: 'AddShift',
    parentName: 'Shifts',
    exact: true,
    component: () => {
      return redirect() ? <AddShift /> : <Navigate to='/' />;
    },
  },
  {
    path: '/ShiftList',
    key: 'ShiftList',
    parentName: 'Shifts',
    exact: true,
    component: () => {
      return redirect() ? <ShiftList /> : <Navigate to='/' />;
    },
  },
  {
    path: '/ErrorDashboard',
    key: 'ErrorDashboard',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <ErrorDashboard /> : <Navigate to='/' />;
    },
  },
  {
    path: '/loans',
    key: 'loans',
    parentName: 'payroll',
    exact: true,
    component: () => {
      return redirect() ? <Loans /> : <Navigate to='/' />;
    },
  },
  {
    path: '/Claims',
    key: 'Claims', 
    parentName: 'payroll',
    exact: true,
    component: () => {
      return redirect() ? <Claims /> : <Navigate to='/' />;
    },
  },
  {
    path: '/ErrorList',
    key: 'ErrorList',
    parentName: 'Error List',
    exact: true,
    component: () => {
      return redirect() ? <ErrordashBoardUser /> : <Navigate to='/' />;
    },
  },
  {
    path: '/selfieAttendance',
    key: 'Selfie Attendance',
    parentName: 'payroll',
    exact: true,
    component: () => {
      return redirect() ? <SelfieAttendance /> : <Navigate to='/' />;
    },
  },
  {
    path: '/requestAndApproval',
    key: 'superAdmin',
    parentName: 'Request and Approval',
    exact: true,
    component: () => {
      return redirect() ? <RequestAndApproval /> : <Navigate to='/' />;
    }

  },
  {
    path: '/growretailproduct',
    key: 'superAdmin',
    parentName: 'Request and Approval',
    exact: true,
    component: () => {
      return redirect() ? <Growretailproduct /> : <Navigate to='/' />;
    }

  },
  {
    path: '/pendingActivations',
    key: 'superAdmin',
    parentName: 'PendingActivations',
    exact: true,
    component: () => {
      return redirect() ? <PendingActivations /> : <Navigate to='/' />;
    }

  },
  {
    path: '/rejected',
    key: 'superAdmin',
    parentName: 'RejectedRequest',
    exact: true,
    component: () => {
      return redirect() ? <RejectedRequest /> : <Navigate to='/' />;
    }

  },
  // {
  //   path: '/whatsappLogs',
  //   key: 'superAdmin',
  //   parentName: 'WhatsappLogs',
  //   exact: true,
  //   component: () => {
  //     return redirect() ? <WhatsappLogs /> : <Navigate to='/' />;
  //   }

  // },
  {
    path: '/companies',
    key: 'superAdmin',
    parentName: 'Companies',
    exact: true,
    component: () => {
      return redirect() ? <Companies /> : <Navigate to='/' />;
    }
  },
  {
    path: '/barCodeQrGenerator',
    key: 'barCodeQrGenerator',
    parentName: 'Settings',
    exact: true,
    component: () => {
      return redirect() ? <BarCodeGenerator /> : <Navigate to='/' />;
    },
  },
  {
    path: '/support', 
    key: 'support', 
    parentName: 'Support',
    exact: true,
    component: () => {
      return redirect() ? <Support /> : <Navigate to='/' />;
    },
  },

];

export default ROUTES;
