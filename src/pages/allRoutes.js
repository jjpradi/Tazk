import React, {useEffect} from 'react';
import {Navigate, useLocation, useNavigate, useParams} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {
  deleteQuotationAction,
  getQuotationByIdAction,
  quotationTimelineDataAction,
} from 'redux/actions/quotation_actions';
import {getAllLeadAccountsAction} from 'redux/actions/leadManagement_actions';
import Cookies from 'universal-cookie';
import { getsessionStorage } from './common/login/cookies';
import CustomerOutstandings from 'components/customer_erpDesign/CustomerOutstandings';
import OverviewForAllCustType from 'components/customer_erpDesign/overview';
import Transactions from 'components/customer_erpDesign/transactions';
import NewTransactions from 'components/customer_erpDesign/transactions/newTransaction';
import StatementOfAccount from 'components/customer_erpDesign/transactions/statementOfAccounts';
import PaymentReceipt from '../pages/sales/paymentReceipt';
import FeaturesMapping from './superAdmin/SuperAdmin/FeaturesMapping.js';

// --- React.lazy component imports ---

const Login = React.lazy(() => import('../pages/common/login'));
const Home = React.lazy(() => import('../pages/common/home'));
// //import Customer from '../pages/sales/customer';
const Customer = React.lazy(() => import('../pages/sales/customer'));
const Vendor = React.lazy(() => import('../pages/sales/vendor'));
const TaxCategory = React.lazy(() => import('../pages/sales/taxCategory'));
const TaxCustomerCategory = React.lazy(() => import('../pages/sales/taxCustomerCategory'));
const Tax = React.lazy(() => import('../pages/sales/tax'));
const ProductCategory = React.lazy(() => import('../pages/sales/productCategory'));
const Product = React.lazy(() => import('../pages/sales/product'));
const Inventory = React.lazy(() => import('../pages/sales/inventory'));
const StockLocation = React.lazy(() => import('../pages/common/stockLocation'));
const Sales = React.lazy(() => import('../pages/sales/sales/sales'));
const Purchases = React.lazy(() => import('../pages/sales/purchases'));
const PaymentsPurchases = React.lazy(() => import('../pages/sales/payments/index.js'));
const PaymentReportNew = React.lazy(() => import('../pages/sales/payments/PaymentReportNew'));
const ReceiptSales = React.lazy(() => import('../pages/sales/Receipt'));
const TaxCodes = React.lazy(() => import('../pages/sales/taxCodes'));
const TaxRate = React.lazy(() => import('../pages/sales/taxRate'));
const TaxJurisdiction = React.lazy(() => import('../pages/sales/taxJurisdiction'));
const PointOfSale = React.lazy(() => import('../pages/pointofsale/pointOfsale'));
const RechargeDashboard = React.lazy(() => import('../pages/pointofsale/recharge/Dashboard'));
const NewRecharge = React.lazy(() => import('../pages/pointofsale/recharge/NewRecharge'));
const RechargeWallet = React.lazy(() => import('../pages/pointofsale/recharge/Wallet'));
const Payment = React.lazy(() => import('../components/pos/payment_section'));
const Session = React.lazy(() => import('../components/pos/session/Session'));
const Reporting = React.lazy(() => import('../pages/common/reporting').then(m => ({ default: m.Reporting })));
const GeneratedReports = React.lazy(() => import('../pages/common/reporting/GeneratedReports'));
const Balancesheet = React.lazy(() => import('../pages/accounts/reports/BalanceSheetPage'));
const Profitloss = React.lazy(() => import('../pages/accounts/reports/ProfitLossPage'));
const VoucherReport = React.lazy(() => import('../pages/accounts/reports/VouchersPage'));
const LedgerReport = React.lazy(() => import('../pages/accounts/reports/LedgerPage'));

// import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
const ChartOfAccounts = React.lazy(() => import('../pages/accounts/ChartofAccounts'));
const GeneralLedger = React.lazy(() => import('../pages/accounts/GeneralLedger'));
const Transaction = React.lazy(() => import('../pages/accounts/transaction'));
const Leads = React.lazy(() => import('../pages/crm/leads'));
// import NewReport from '../pages/common/reporting/NewReport';
const Schemes = React.lazy(() => import('../pages/sales/Schemes'));
const SalesmanIncentive = React.lazy(() => import('../pages/Payroll/Incentive'));
const SalesTargetPeriods = React.lazy(() => import('../pages/sales/salesTarget'));
const SalesTargetAssignment = React.lazy(() => import('../pages/sales/salesTarget/TargetAssignment'));
const CustomerTargetAssignment = React.lazy(() => import('../pages/sales/salesTarget/CustomerTargetAssignment'));
const AchievementDashboard = React.lazy(() => import('../pages/sales/salesTarget/AchievementDashboard'));
const SalesLeaderboard = React.lazy(() => import('../pages/sales/salesTarget/Leaderboard'));
const IncentivePlanList = React.lazy(() => import('../pages/sales/salesTarget/incentive/IncentivePlanList'));
const IncentivePlanForm = React.lazy(() => import('../pages/sales/salesTarget/incentive/IncentivePlanForm'));
const IncentiveResults = React.lazy(() => import('../pages/sales/salesTarget/incentive/IncentiveResults'));
const MyTargetDashboard = React.lazy(() => import('../pages/sales/salesTarget/MyDashboard'));
const WhatIfCalculator = React.lazy(() => import('../pages/sales/salesTarget/incentive/WhatIfCalculator'));
const DocumentSequences = React.lazy(() => import('../pages/settings/DocumentSequences'));
const IncentiveChart = React.lazy(() => import('../pages/Payroll/Incentive/dashboard'));
const SalesManMainDashboard = React.lazy(() => import('../pages/Payroll/Incentive/salesmanDashboard'));
const ApexCharts = React.lazy(() => import('../pages/sales/Schemes/Chart'));
const PosInvoice = React.lazy(() => import('../pages/pointofsale/pos_invoice'));
const Receivable = React.lazy(() => import('../pages/sales/outstanding/receivable'));
const CodeGenerator = React.lazy(() => import('../pages/codeGenerator'));
const Payable = React.lazy(() => import('../pages/sales/outstanding/payable'));
const PosCreation = React.lazy(() => import('../pages/pointofsale/PosCreation'));
const Transfer = React.lazy(() => import('../pages/sales/inventory/transfer.js'));
const Receiver = React.lazy(() => import('../pages/sales/inventory/receiver.js'));
const InventoryManagementDashboard = React.lazy(() => import('../pages/sales/inventoryMD'));
const PaymentMethod = React.lazy(() => import('../pages/sales/paymentmethods'));
//import Trans from "../pages/trans";
const CashOutIn = React.lazy(() => import('../pages/accounts/cashOutIn'));
const CashBoxCreation = React.lazy(() => import('../pages/accounts/cashBoxCreation'));
const Ledger = React.lazy(() => import('../pages/accounts/Ledger/index'));
const AuditDashboard = React.lazy(() => import('../pages/accounts/AuditDashboard/index'));
const GstReturns = React.lazy(() => import('../pages/accounts/GstReturns/index'));
const PosSale = React.lazy(() => import('../pages/pointofsale/posSale'));
// const ClosingStock = React.lazy(() => import('../pages/sales/closingStock/index'));
const ClosingStock = React.lazy(() => import('../pages/sales/closingStock/ClosingStockNew'));
const Outstanding = React.lazy(() => import('../pages/sales/mailreport/outstanding'));
const SOTracking = React.lazy(() => import('../pages/sales/soTracking'));
const Attendance = React.lazy(() => import('../pages/Payroll/attendance'));
const Barchart = React.lazy(() => import('../components/dashboard/basicBarChart'));
const ExpanseAnalysis = React.lazy(() => import('../components/dashboard/expanseAnalysis'));
const Speedometer = React.lazy(() => import('../components/dashboard/speedometer'));
const TotalAccPayable = React.lazy(() => import('../components/dashboard/payable_receivable'));
const CategorySummary = React.lazy(() => import('../components/dashboard/inventoryDashboard/categorySummary'));
const BillsRow = React.lazy(() => import('../components/customer_erpDesign/billsRow'));
const ProductBrand = React.lazy(() => import('../components/erpDesign/productBrand'));
const ProductStockable = React.lazy(() => import('../components/erpDesign/productStockable'));
const PrimaryContact = React.lazy(() => import('../components/customer_erpDesign/primaryContact'));
const CollapsibleTable = React.lazy(() => import('../components/purchaseDetails/purchaseTable'));
const PurchaseCard = React.lazy(() => import('../components/purchaseDetails/purchaseCard'));
const SalesChart = React.lazy(() => import('../components/purchaseDetails/salesGraph'));
const PaymentConsolidated = React.lazy(() => import('../pages/sales/paymentConsolidated/index'));
const Linechart = React.lazy(() => import('../components/dashboard/linechart/linechart'));
// import CategorySummary from '../components/dashboard/inventoryDashboard/categorySummary'
const Payin = React.lazy(() => import('../pages/common/home/Payin'));
const PosRole = React.lazy(() => import('../pages/common/posrole/index'));
const ListEmployee = React.lazy(() => import('../pages/Payroll/listempverification'));
const LastBills = React.lazy(() => import('../components/customer_erpDesign/lastBills'));
const DaySales = React.lazy(() => import('../components/dashboard/DaySales'));
const CashInHand = React.lazy(() => import('../components/dashboard/CashInHand'));
// import LastBills from "../components/erpDesign/lastBills";
const BankCreation = React.lazy(() => import('../pages/accounts/BankCreation/index'));
// import LastBills from "../components/customer_erpDesign/lastBills";
const DiscountType = React.lazy(() => import('../pages/sales/discountType/index'));
const Usercreation = React.lazy(() => import('../pages/common/Usercreation/index'));
const CashBoxAdjustment = React.lazy(() => import('../pages/accounts/cashBoxAdjustment/index'));
const Account = React.lazy(() => import('../components/dashboard/Account_Payable/index'));
const PayableReceivable = React.lazy(() => import('../components/dashboard/payable_receivable/index'));
const ProfitAndLoss = React.lazy(() => import('../components/dashboard/ProfitAndLoss/index'));
const ManualNotes = React.lazy(() => import('../pages/sales/manualNotes'));
const DebitNotes = React.lazy(() => import('../pages/sales/manualNotes/debit.js'));
const StatementOfAccounts = React.lazy(() => import('../components/customer_erpDesign/statementOfAccounts'));
const StatementDialog = React.lazy(() => import('../components/customer_erpDesign/StatementDialog'));
const CompanyInfo = React.lazy(() => import('../pages/common/CompanyInfo/CompanyInfo'));

const StockReconcilate = React.lazy(() => import('../pages/sales/stockReconcilate/index'));
const DailyReport = React.lazy(() => import('../pages/pointofsale/DailyReport'));
// const SalesReport = React.lazy(() => import('./sales/salesReport'));
const SalesReport = React.lazy(() => import('./sales/salesReport/SalesReportNew'));
// const TodaySalesReport = React.lazy(() => import('./sales/todaySalesReport'));
const TodaySalesReport = React.lazy(() => import('./sales/todaySalesReport/PosSalesReportNew'));
// const PurchaseReport = React.lazy(() => import('../pages/sales/purchaseReport/index'));
const PurchaseReport = React.lazy(() => import('../pages/sales/purchaseReport/PurchaseReportNew'));
// const ReturnCreditNotesReport = React.lazy(() => import('./sales/returnCreditNotesReport/index'));
const ReturnCreditNotesReport = React.lazy(() => import('./sales/returnCreditNotesReport/CreditNotesNew'));
// const ManualCreditNotesReport = React.lazy(() => import('./sales/manualCreditNotesReport/index'));
const ManualCreditNotesReport = React.lazy(() => import('./sales/returnCreditNotesReport/CreditNotesNew'));
// const ReturnDebitNotesReport = React.lazy(() => import('./sales/returnDebitNotesReport/index'));
const ReturnDebitNotesReport = React.lazy(() => import('./sales/returnDebitNotesReport/DebitNotesNew'));
// const ManualDebitNotesReport = React.lazy(() => import('./sales/manualDebitNotesReport/index'));
const ManualDebitNotesReport = React.lazy(() => import('./sales/returnDebitNotesReport/DebitNotesNew'));
const CustomizeThemes = React.lazy(() => import('../pages/common/CustomizeThemes/index'));
// const ReceivableReport = React.lazy(() => import('../pages/sales/ReceivableReport/index'));
const ReceivableReport = React.lazy(() => import('../pages/sales/ReceivableReport/ReceivableNew'));
// PayableReport is now loaded inside TdsTcsReport via lazy import
// const StockAgeingReport = React.lazy(() => import('../pages/sales/StockAgeingReport/index'));
const StockAgeingReport = React.lazy(() => import('../pages/sales/StockAgeingReport/StockAgeingNew'));
const BankReconciliation = React.lazy(() => import('./accounts/BankReconciliation'));
const BR = React.lazy(() => import('./accounts/BankReconciliation/bankReconciliation'));
const MatchEntries = React.lazy(() => import('./accounts/BankReconciliation/MatchEntries'));
const BankDetails = React.lazy(() => import('./accounts/BankReconciliation/bankdetails'));
const AutoMatch = React.lazy(() => import('./accounts/BankReconciliation/automatch'));
// const BrandReport = React.lazy(() => import('../pages/sales/brandReport/index'));
const BrandReport = React.lazy(() => import('../pages/sales/brandReport/BrandMarginNew'));
// const ChequeReport = React.lazy(() => import('../pages/accounts/chequesReport/index'));
const ChequeReport = React.lazy(() => import('../pages/accounts/chequesReport/ChequesNew'));
const Chat = React.lazy(() => import('../@crema/services/db/Chat/index'));
const MyAccount = React.lazy(() => import('../pages/accounts/account/MyProfile'));
const Notification = React.lazy(() => import('../pages/common/notification/index'));
const SignUp = React.lazy(() => import('../pages/common/auth/Signup/index'));
const SalesDashboard = React.lazy(() => import('components/dashboard/SalesDashboard'));
const UnreadPanel = React.lazy(() => import('components/dashboard/unreadPanel/index'));
const StockMissedItems = React.lazy(() => import('../pages/sales/stockReconcilate/stockReconcilate'));
const Salesman = React.lazy(() => import('../pages/sales/salesman'));
const PayrollDashboard = React.lazy(() => import('./Payroll/payrollDashboard'));
const Editview = React.lazy(() => import('../pages/common/posrole/Editview'));
const SmsMailConfiguration = React.lazy(() => import('../pages/common/configuration/index'));
const Holidays = React.lazy(() => import('./Payroll/holiday/index'));
const FuelAllowance = React.lazy(() => import('./sales/FuelAllowance/index'));
const PosUserDashboard = React.lazy(() => import('components/dashboard/PosUser'));
const HistoryReport = React.lazy(() => import('./sales/HistoryReport/index'));
const LeaveReport = React.lazy(() => import('./Payroll/LeaveReport/index'));
const RequestReport = React.lazy(() => import('./Payroll/RequestReport/index'));
const SalaryReport = React.lazy(() => import('./Payroll/SalaryReport/index'));
const Salary = React.lazy(() => import('../pages/Payroll/salary/index'));
const SalaryStructure = React.lazy(() => import('../pages/Payroll/salary/salaryStructure'));
const Advancesheet = React.lazy(() => import('./accounts/advancesheet/index'));
const LeaveRequest = React.lazy(() => import('./Payroll/LeaveRequest/index.js'));
const AddShift = React.lazy(() => import('./Payroll/Shift'));
const ShiftList = React.lazy(() => import('./Payroll/Shift/shiftList'));
// import DashboardRole from './posrole/dashboardRole';
const SalesManDashboard = React.lazy(() => import('components/dashboard/SalesManDashboard'));
const VisitsReport = React.lazy(() => import('components/dashboard/visits'));
const ChequeBounces = React.lazy(() => import('components/dashboard/SalesManDashboard/chequeBounces'));
const CashBankSummary = React.lazy(() => import('./accounts/CashBankSummary'));
const InvoiceSetup = React.lazy(() => import('../pages/sales/invoiceSetup/index'));
const PriceList = React.lazy(() => import('./sales/PriceList/index'));
const InvoiceCreate = React.lazy(() => import('../pages/sales/invoiceSetup/invoiceCreate'));
const CommonUpload = React.lazy(() => import('../../src/components/pos/payment_section/CommonImport'));
const PriceListCustomerMapping = React.lazy(() => import('./sales/PriceListCustomerMapping'));
const StockGroup = React.lazy(() => import('../../src/pages/sales/StockGroupSummary/index'));
const SalesExecutiveVisitHistory = React.lazy(() => import('./sales/salesman/salesExecutiveVisitHistory'));
const SalesmanList = React.lazy(() => import('./sales/salesman/SalesmanList'));
const SalesmanTravelHistory = React.lazy(() => import('./sales/salesman/SalesmanTravelHistory'));
const ErrorDashboard = React.lazy(() => import('./common/ErrorDashboad/index'));
const CompanySubscription = React.lazy(() => import('./common/CompanySubscription/index'));
const ErrordashBoardUser = React.lazy(() => import('../pages/common/ErrorDashboardUsers/index'));
const DeveloperConfiguration = React.lazy(() => import('../pages/developer/Configuration/index'));
const SalesManLiveLocation = React.lazy(() => import('./sales/salesman/SalesManLiveLocation'));
const CustomerList = React.lazy(() => import('../@crema/services/db/Contact/index'));
// import SequencePattern from './sequencePattern';
const FindProduct = React.lazy(() => import('../pages/pointofsale/findProduct.js'));
const ManualSchemes = React.lazy(() => import('./sales/ManualSchemes/index'));
const DataGridTemp = React.lazy(() => import('components/dataGridTemp'));
// import DashBoardTest from './common/home/DashBoardTest';
const DashBoardTest = React.lazy(() => import('./common/home/dashboard'));
// import CustomerList from '../@crema/services/db/Contact/index'
const Dropzone = React.lazy(() => import('../../src/components/Dragfile/index'));
const ReportsPage = React.lazy(() => import('../../src/pages/common/Report/index'));
const Expenses = React.lazy(() => import('./accounts/Expenses'));
const Loans = React.lazy(() => import('./Payroll/Loans'));
const ProcessSalary = React.lazy(() => import('./Payroll/processSalary/index.js'));
const AttendanceCorrection = React.lazy(() => import('../pages/Payroll/AttendanceCorrection/index'));
const AttendanceView = React.lazy(() => import('../pages/Payroll/AttendanceView/index'));
const AttendanceProcess = React.lazy(() => import('../pages/Payroll/AttendanceProcess/index'));
const PaySlipReport = React.lazy(() => import('./Payroll/paySlip/index.js'));
const Projects = React.lazy(() => import('../pages/projects/Projects'));
const Tasks = React.lazy(() => import('../pages/projects/Tasks'));
const AssignTasks = React.lazy(() => import('../pages/projects/AssignTask'));
const AllLoans = React.lazy(() => import('./accounts/CompanyLoans'));
const TimeSheet = React.lazy(() => import('../pages/projects/index'));
const Migration = React.lazy(() => import('../pages/sales/Migration/index'));
const Followlist = React.lazy(() => import('../pages/Payroll/Follow/index'));
const SelfieAttendance = React.lazy(() => import('../pages/Payroll/SelfieAttendance'));
const MonthShift = React.lazy(() => import('./Payroll/monthShift/index'));
const VendorPriceList = React.lazy(() => import('./sales/vendorPriceList'));
const CollectionsMan = React.lazy(() => import('../pages/sales/salesman/collections/index'));
const PosPromotions = React.lazy(() => import('../pages/sales/promotions/index'));
const ApprovalRequests = React.lazy(() => import('./sales/salesman/approvalRequest'));
const ErpRequestAndApproval = React.lazy(() => import('./superAdmin/SuperAdmin/erpRequest'));
const Companies = React.lazy(() => import('./superAdmin/SuperAdmin/companies'));
const MenuBuilder = React.lazy(() => import('./superAdmin/MenuBuilder'));
const SubscriptionManager = React.lazy(() => import('./superAdmin/SubscriptionManager'));
const CompanyDetail = React.lazy(() => import('./superAdmin/CompanyDetail'));
const SuperAdminDashboard = React.lazy(() => import('./superAdmin/Dashboard'));
const SuperAdminAnalytics = React.lazy(() => import('./superAdmin/Analytics'));
const SuperAdminSettings = React.lazy(() => import('./superAdmin/Settings'));
const SuperAdminOnboarding = React.lazy(() => import('./superAdmin/Onboarding'));
const RoleManager = React.lazy(() => import('./superAdmin/RoleManager'));
const RoleAccessManager = React.lazy(() => import('./superAdmin/RoleAccessManager'));
const DefinitionManager = React.lazy(() => import('./superAdmin/DefinitionManager'));
const NotificationTemplateManager = React.lazy(() => import('./superAdmin/NotificationTemplateManager'));
const NotificationAnalytics = React.lazy(() => import('./superAdmin/NotificationAnalytics'));
const UserPermissions = React.lazy(() => import('./common/UserPermissions'));
const PayrollPolicy = React.lazy(() => import('./Payroll/policy'));
const ProcessInsentive = React.lazy(() => import('./Payroll/processIncentive'));
const QRAttendance = React.lazy(() => import('./Payroll/qrAttendance/index.js'));
const LiveLocation = React.lazy(() => import('./Payroll/liveLocation/index.js'));
const Support = React.lazy(() => import('./common/support'));
const ScheduleList = React.lazy(() => import('./Payroll/Shift/scheduleShift'));
const MapSalary = React.lazy(() => import('./Payroll/salary/mapSalary'));
const WorkDurationReport = React.lazy(() => import('./Payroll/WorkDurationReport/index'));
const WorkDurationReportTest = React.lazy(() => import('./Payroll/WorkDurationReport/workDurationReport'));
const AttendanceReports = React.lazy(() => import('../pages/Payroll/AttendanceReports/attendanceReports'));
const OverTimeReport = React.lazy(() => import('./Payroll/OverTimeReport'));
const SalaryReportForBank = React.lazy(() => import('../pages/Payroll/SalaryReportForBank/salaryReportForBank'));
const Announcement = React.lazy(() => import('./common/announcement'));
const Offers = React.lazy(() => import('../pages/sales/offers/index.js'));
const ScrumBoard = React.lazy(() => import('../pages/projects/apps/ScrumBoard/index'));
const AlertsTable = React.lazy(() => import('./assets/Alerts/AlertsTable.js'));
const AssetTransfer = React.lazy(() => import('./assets/Assets/AssetTransfer'));
const Assets = React.lazy(() => import('./assets/Assets/index'));
const EmployeeVerification = React.lazy(() => import('./Payroll/empverification/test'));
const PendingActivations = React.lazy(() => import('./superAdmin/SuperAdmin/pendingActivation'));
const EmployeeDocuments = React.lazy(() => import('../pages/Payroll/Employee Documents'));
const WhatsApp = React.lazy(() => import('./common/whatsapp'));
const NewTemp = React.lazy(() => import('../components/whatsapp/newTemp.js'));
const SalaryReportsPayroll = React.lazy(() => import('./Payroll/SalaryReport/salaryReportsPayroll'));
const RelievedEmployeeDetails = React.lazy(() => import('./Payroll/RelievedEmployee/relievedEmployeeDetails'));
const BarCodeGenerator = React.lazy(() => import('components/BarCodeGenerator'));
const AssignTemp = React.lazy(() => import('components/whatsapp/assignTemp'));
const TempList = React.lazy(() => import('components/whatsapp/tempList'));
const ComingSoon = React.lazy(() => import('./common/errorPages/ComingSoon/index.js'));
const ServiceMenu = React.lazy(() => import('../pages/service/serviceMenu'));
const JobCard = React.lazy(() => import('../pages/service/serviceMenu/jobCard'));
const AssetWarranty = React.lazy(() => import('./assets/Assets/AssetWarranty'));
const AssetWarrantyList = React.lazy(() => import('./assets/Assets/AssetWarrantyTable'));
const InsuranceTable = React.lazy(() => import('./assets/Insurance/InsuranceTable'));
const DynamicProperty = React.lazy(() => import('./assets/DynamicProperties/index'));
const Information = React.lazy(() => import('./common/information'));
const ServiceDueTable = React.lazy(() => import('./assets/ServiceDue/ServiceDueTable'));
const Audit = React.lazy(() => import('./assets/Audits/Audit'));
const Task = React.lazy(() => import('./projects/Task').then(m => ({ default: m.Task })));
const AuditRequest = React.lazy(() => import('./assets/Audits/Request'));
const EmployeeProfileList = React.lazy(() => import('./Payroll/employeeProfile'));
const OrgStructurePage = React.lazy(() => import('./Payroll/orgStructure'));
const EmployeeLifecyclePage = React.lazy(() => import('./Payroll/employeeLifecycle'));
const HRLettersPage = React.lazy(() => import('./Payroll/hrLetters'));
const EssPortalPage = React.lazy(() => import('./Payroll/essPortal'));
const MySalaryPage = React.lazy(() => import('./Payroll/mySalary'));
const MyTeamPage = React.lazy(() => import('./Payroll/myTeam'));
const DocumentManagementPage = React.lazy(() => import('./Payroll/documentManagement'));
const ExpenseManagementPage = React.lazy(() => import('./Payroll/expenseManagement'));
const HrPoliciesPage = React.lazy(() => import('./Payroll/hrPolicies'));
const PerformancePage = React.lazy(() => import('./Payroll/performance'));
const RecruitmentPage = React.lazy(() => import('./Payroll/recruitment'));
const TrainingPage = React.lazy(() => import('./Payroll/training'));
const HrAnalyticsPage = React.lazy(() => import('./Payroll/hrAnalytics'));
const EmployeeVerificationList = React.lazy(() => import('./Payroll/empverification/EmployeeVerificationList'));
const EmployeeDetailsList = React.lazy(() => import('./Payroll/empverification/EmployeeDetailsList'));
const RejectedRequest = React.lazy(() => import('./superAdmin/SuperAdmin/rejected'));
const Claims = React.lazy(() => import('./Payroll/Claims'));
const CallsTable = React.lazy(() => import('./crm/Calls/CallsTable'));
const Events = React.lazy(() => import('./Payroll/Events/index.js'));
const CallsForm = React.lazy(() => import('./crm/Calls/CallsForm'));
const TaskCreation = React.lazy(() => import('./crm/LeadTask/TaskCreation'));
const LeadTasksTable = React.lazy(() => import('./crm/LeadTask/LeadTasksTable'));
const LeadAccounts = React.lazy(() => import('./crm/LeadTask/LeadAccounts'));
const AccountsDetail = React.lazy(() => import('./crm/LeadTask/AccountsDetail'));
const AccountsTimeline = React.lazy(() => import('./crm/LeadTask/AccountsTimeline'));
const MeetingsTable = React.lazy(() => import('./crm/Meetings/MeetingsTable'));
const MeetingsForm = React.lazy(() => import('./crm/Meetings/MeetingsForm'));
const LeadManagement = React.lazy(() => import('./crm/leadManagement'));
const LeadConvertPage = React.lazy(() => import('./crm/leadManagement/LeadConvertPage'));
const LeadAccountsTable = React.lazy(() => import('./crm/LeadTask/LeadAccountsTable'));
const EmpShiftView = React.lazy(() => import('./Payroll/monthShift/empShiftView.js'));
const MonthView = React.lazy(() => import('./Payroll/monthShift/empShiftView.js'));
const ApprovalsPage = React.lazy(() => import('./Payroll/LeaveRequest/ApprovalsPage.js'));
const CalenderSubMenus = React.lazy(() => import('../pages/common/Calender/index'));
const LateAndEalyReport = React.lazy(() => import('./Payroll/lateLoginAndEarlyCheckOutReport/lateLoginAndEarlyCheckOutReport'));
const PunchExceptionReport = React.lazy(() => import('./Payroll/punchexceptions/punchexceptionsreport'));
const AttendanceEfficiencyReport = React.lazy(() => import('./Payroll/AttendanceEfficiencyReport/index'));
const CheckInCheckOutView = React.lazy(() => import('./Payroll/CheckinChectoutReports/CheckInCheckOutView'));
const FaceAttendance = React.lazy(() => import('./Payroll/FaceAttendance.js/index.js'));
// import LateInEarlyOut from './Payroll/LateInEarlyOut/LateInEarlyOut';
const ManualAttendance = React.lazy(() => import('./Payroll/manualAttendance/manualAttendance'));
const LateInEarlyOut = React.lazy(() => import('./Payroll/LateInEarlyOut/LateInEarlyOut'));
const LandingPage = React.lazy(() => import('./common/home/landingPage'));
const QuotationTable = React.lazy(() => import('./crm/Quotation/QuotationTable'));
const QuotationForm = React.lazy(() => import('./crm/Quotation/oldQuotation/QuotationForm'));
const PfReport = React.lazy(() => import('./Payroll/PF_Report/PfReport'));
const StatutoryReports = React.lazy(() => import('./Payroll/StatutoryReports/StatutoryReports'));
const QuotationApprovals = React.lazy(() => import('./crm/Quotation/oldQuotation/QuotationApprovals'));
const QuotationDetailPage = React.lazy(() => import('./crm/Quotation/quotationDetailPage'));
const NewQuotationForm = React.lazy(() => import('./crm/Quotation/NewQuotationForm'));
const QuotationTimeline = React.lazy(() => import('./crm/Quotation/oldQuotation/QuotationTimeline'));
const CampaignTable = React.lazy(() => import('./crm/Campaign/CampaignTable'));
const CampaignDetails = React.lazy(() => import('./crm/Campaign/CampaignDetails'));
const LeadsV2Page = React.lazy(() => import('./crm/leadsV2'));
const DealsPipelinePage = React.lazy(() => import('./crm/deals'));
const ProductCatalogPage = React.lazy(() => import('./crm/catalog/products'));
const PriceListsPage = React.lazy(() => import('./crm/catalog/priceLists').then(m => ({ default: m.PriceListsPage })));
const PriceListItemsPage = React.lazy(() => import('./crm/catalog/priceLists').then(m => ({ default: m.PriceListItemsPage })));
const QuotationFormPage = React.lazy(() => import('./crm/quotations').then(m => ({ default: m.QuotationFormPage })));
const QuotationListPage = React.lazy(() => import('./crm/quotations').then(m => ({ default: m.QuotationListPage })));
const QuotationViewPage = React.lazy(() => import('./crm/quotations').then(m => ({ default: m.QuotationViewPage })));
const TemplatesPage = React.lazy(() => import('./crm/templates'));
const AutomationPage = React.lazy(() => import('./crm/automation'));
const CrmSettingsPage = React.lazy(() => import('./crm/settings'));
const IntegrationsHub = React.lazy(() => import('./crm/integrations/IntegrationsHub'));
const IntegrationsApiKeysPage = React.lazy(() => import('./crm/integrations/IntegrationsApiKeysPage'));
const IntegrationsWebhooksPage = React.lazy(() => import('./crm/integrations/IntegrationsWebhooksPage'));
const IntegrationsWebsiteFormsPage = React.lazy(() => import('./crm/integrations/IntegrationsWebsiteFormsPage'));
const IntegrationsGenericWebhooksPage = React.lazy(() => import('./crm/integrations/IntegrationsGenericWebhooksPage'));
const IntegrationsCsvImportPage = React.lazy(() => import('./crm/integrations/IntegrationsCsvImportPage'));
const IntegrationsEmailInboundPage = React.lazy(() => import('./crm/integrations/IntegrationsEmailInboundPage'));
const SyncInventory = React.lazy(() => import('./sales/syncInventory'));
const CashHand = React.lazy(() => import('./accounts/CashHand/cashInHand'));
const DeletedLoggedDetails = React.lazy(() => import('./common/Utilities/DeletedLoggedDetails'));
const Form12BB = React.lazy(() => import('./Payroll/form12/index.js'));
const Form16 = React.lazy(() => import('./Payroll/form16'));
const BoardDetail = React.lazy(() => import('./projects/apps/ScrumBoard/BoardDetail'));
const RouteHomeAndSub = React.lazy(() => import('./common/CompanySubscription/routeHomeToSub'));
const SchemesReceivables = React.lazy(() => import('./sales/Schemes Receivables'));
const ServicePayment = React.lazy(() => import('../pages/service/serviceMenu/servicePayment'));
const ServiceDashboard = React.lazy(() => import('../pages/service/serviceMenu/serviceDashboard'));
const Activity = React.lazy(() => import('@crema/core/AppLayout/components/UserInfo/activity'));
const Renewals = React.lazy(() => import('./assets/Renewals'));
const CostSummaryReport = React.lazy(() => import('./Payroll/CostSummaryReport.js/CostSummaryReport'));
const PaymentCollectionReport = React.lazy(() => import('./sales/salesman/paymentCollection.js'));
const PayInOutContraReport = React.lazy(() => import('./sales/salesman/PayInOutContraNew'));
const PaymentCollectionOrReport = React.lazy(() => import('./sales/salesman/PaymentCollectionWrapper'));
const PaymentReportBasedEmp = React.lazy(() => import('./sales/salesman/paymentCollection.js/paymentReportBasedEmp'));
const CompliancesTable = React.lazy(() => import('./assets/Compliances/CompliancesTable'));
const CustomRenewalsTable = React.lazy(()=>import('./assets/CustomRenewals/CustomRenewalsTable'));
const ScrapAssetReport = React.lazy(() => import('./assets/AssetsReports/ScrapAssetReport'));
const SalaryStatement = React.lazy(() => import('./Payroll/SalaryReport/SalaryStatement'));
const DeletedEmployeeDetails = React.lazy(() => import('./Payroll/DeletedEmployees/DeletedEmployeeDetails'));
// const TransactionReport = React.lazy(() => import('./accounts/transaction/transactionReport'));
const TransactionReport = React.lazy(() => import('./accounts/transaction/AllTransactionsNew'));
// const MissingProducts = React.lazy(() => import('./sales/missingLot/missingProduct'));
// const ExcessProducts = React.lazy(() => import('./sales/excessLot/excessProducts'));
const MissingProducts = React.lazy(() => import('./sales/missingLot/MissingLotNew'));
const ExcessProducts = React.lazy(() => import('./sales/excessLot/ExcessLotNew'));
// const ProfitWiseReport = React.lazy(() => import('./sales/ROIReports/index'));
const ProfitWiseReport = React.lazy(() => import('./sales/misReports/BillProfitNew'));

// MIS Reports
const CategoryMarginReport = React.lazy(() => import('./sales/misReports/CategoryMarginNew'));
const SalesmanPerfReport = React.lazy(() => import('./sales/misReports/SalesmanPerfNew'));
const LocationPLReport = React.lazy(() => import('./sales/misReports/LocationPLNew'));
const CustomerRevenueReport = React.lazy(() => import('./sales/misReports/CustomerRevenueNew'));
const SupplierPurchaseReport = React.lazy(() => import('./sales/misReports/SupplierPurchaseNew'));
const DailySalesSummaryReport = React.lazy(() => import('./sales/misReports/DailySalesSummaryNew'));
const MonthlyComparisonReport = React.lazy(() => import('./sales/misReports/MonthlyComparisonNew'));
const PaymentModeReport = React.lazy(() => import('./sales/misReports/PaymentModeNew'));
const InventoryTurnoverReport = React.lazy(() => import('./sales/misReports/InventoryTurnoverNew'));
const TaxSummaryReport = React.lazy(() => import('./sales/misReports/TaxSummaryNew'));
const CCCDashboardReport = React.lazy(() => import('./sales/misReports/CCCDashboardNew'));
const DailyNetProfitReport = React.lazy(() => import('./sales/misReports/DailyNetProfitNew'));
const ProfitLeakageReport = React.lazy(() => import('./sales/misReports/ProfitLeakageNew'));
const DataQualityReport = React.lazy(() => import('./sales/misReports/DataQualityNew'));
const CashFlowReport = React.lazy(() => import('./sales/misReports/CashFlowNew'));
const GeneralLedgerReport = React.lazy(() => import('./accounts/accountReports/GeneralLedgerNew'));
const AgeingSummaryReport = React.lazy(() => import('./accounts/accountReports/AgeingSummaryNew'));
const GroupSummaryReport = React.lazy(() => import('./accounts/accountReports/GroupSummaryNew'));
const CashFlowStatementReport = React.lazy(() => import('./accounts/accountReports/CashFlowStatementNew'));
const BalanceSheetNew = React.lazy(() => import('./accounts/accountReports/BalanceSheetNew'));
const ProfitLossNew = React.lazy(() => import('./accounts/accountReports/ProfitLossNew'));
const LotItemWise = React.lazy(() => import('./sales/closingStock/lotitemwise'));
// const DayBookReport = React.lazy(() => import('./sales/salesReport/DayBookReport'));
const DayBookReport = React.lazy(() => import('./sales/daybook/DaybookNew'));
const PurchaseSummary = React.lazy(() => import('./sales/salesReport/PurchaseSummary'));
const SalesSummary = React.lazy(() => import('./sales/salesReport/SalesSummary'));
// const StockGroupSummary = React.lazy(() => import('./sales/salesReport/StockGroupSummary'));
const StockGroupSummary = React.lazy(() => import('./sales/StockGroupSummary/StockGroupNew'));
const GST1Report = React.lazy(() => import('./sales/TaxesReport/GST1Report'));
const GST2Report = React.lazy(() => import('./sales/TaxesReport/GST2Report'));
const GST3BReport = React.lazy(() => import('./sales/TaxesReport/GST3BReport'));
const GST4Report = React.lazy(() => import('./sales/TaxesReport/GST4Report'));
const GST9Report = React.lazy(() => import('./sales/TaxesReport/GST9Report'));
const GST9AReport = React.lazy(() => import('./sales/TaxesReport/GST9AReport'));
const GSTReport = React.lazy(() => import('./sales/TaxesReport/GSTReport'));
const GSTRateReport = React.lazy(() => import('./sales/TaxesReport/GSTRateReport'));
const TdsTcsReport = React.lazy(() => import('./sales/TaxesReport/TdsTcsReport'));
const PayableReport = React.lazy(() => import('./sales/PayableReport/PayableNew'));
const TDSReport = React.lazy(() => import('../pages/accounts/reports/GstTdsPage'));
const TrialBalanceReport = React.lazy(() => import('./sales/salesman/trialBalance'));
const CashFlow = React.lazy(() => import('./sales/salesman/cashFlow'));
const Form27EQReport = React.lazy(() => import('./sales/TaxesReport/Form27EQReport'));
const SalesSummaryReport = React.lazy(() => import('./sales/TaxesReport/salesSummaryByHSN'));
const TaxReceivable = React.lazy(() => import('./sales/TaxReceivable/taxReceivable'));
const SACReport = React.lazy(() => import('./sales/TaxesReport/SACReport/'));
// const ExpiryDatereport = React.lazy(() => import('./sales/salesReport/ExpiryDateReport'));
const ExpiryDatereport = React.lazy(() => import('./sales/ExpiryDateReport/ExpiryDateNew'));
const AttendanceLog = React.lazy(() => import('./stact/attendanceLog'));
const SalesApprovals = React.lazy(() => import('./sales/salesApprovals/SalesApprovals'));
const AllPlansList = React.lazy(() => import('./stact/plansAndMembership/index'));
const NewPlan = React.lazy(() => import('./stact/plansAndMembership/planCreationForm'));
const SchedulePlan = React.lazy(() => import('./stact/plansAndMembership/listScheduledPlan'));
const ListSchedulePlan = React.lazy(() => import('./stact/plansAndMembership/listScheduledPlan'));
// const PreOrderReport = React.lazy(() => import('../pages/pointofsale/preOrderReport/preOrderReport'));
const PreOrderReport = React.lazy(() => import('../pages/sales/preOrderReport/PreOrderReportNew'));

const MatchedRecordPage = React.lazy(() => import('./accounts/BankReconciliation/matchedRecordPage'));
const UnMatchedRecordPage = React.lazy(() => import('./accounts/BankReconciliation/unMatchedRecordPage'));
const CustomerInvoice = React.lazy(() => import('components/customerLogin/Invoices'));
const CustomerQuotes = React.lazy(() => import('components/customerLogin/CustomerQuotes'));
const CustomerCreditNote = React.lazy(() => import('components/customerLogin/CustomerCreditNote'));
const CustomerSalesOrder = React.lazy(() => import('components/customerLogin/CustomerSalesOrder'));
const Customerpayment = React.lazy(() => import('components/customerLogin/CustomerPayment'));
const CustomerDeliveryChallan = React.lazy(() => import('components/customerLogin/CustomerDeliveryChallan'));
const SettingsIndex = React.lazy(() => import('../pages/common/settings/index'));
const DocTemplates = React.lazy(() => import('../pages/common/docTemplates'));
const Reconciled = React.lazy(() => import('./sales/reconciled/Reconciled'));
const NonReconciled = React.lazy(() => import('./sales/reconciled/NonReconciled'));
const ListDefects = React.lazy(() => import('./sales/defects/collectDefects/ListDefects'));
const SendDefects = React.lazy(() => import('./sales/defects/sendDefects/index'));
const AttendanceLogReport = React.lazy(() => import('../pages/Payroll/AttendanceLogReport/index'));
// const ReceiptReport = React.lazy(() => import('./sales/Receipt/ReceiptReport.js'));
const ReceiptReport = React.lazy(() => import('./sales/Receipt/ReceiptReportNew'));
const ListReplacements = React.lazy(() => import('./sales/defects/replacements/ListReplacements'));
const AssetEvents = React.lazy(() => import('./common/Calender/AssetEvents'));
const RentalAndTenants = React.lazy(() => import('./assets/RentalAndTenants/RentalAndTenants'));
const RenewalsNewForm = React.lazy(() => import('./assets/Renewals/RenewalsNewForm'));
const ChecklistTable = React.lazy(() => import('./assets/Audits/ChecklistTable'));
const DeviceRegisterReport = React.lazy(() => import('./Payroll/DeviceRegisterReport/DeviceRegisterReport.js'));
const FraudLogsReport = React.lazy(() => import('./Payroll/FraudLogsReport/FraudLogsreport.js'));
const NewCashInHand = React.lazy(() => import('../pages/accounts/CashHand/NewCashInHand'));
const PrivilegeLeaveReport = React.lazy(() => import('./Payroll/PrivilegeLeaveReport/privilegeleavereport'));
const WhatsappLogs = React.lazy(() => import('./superAdmin/SuperAdmin/whatsapplogs'));
const LoginAuditLogs = React.lazy(() => import('./reports/LoginAuditLogs'));
// const ScrapLots = React.lazy(() => import('./sales/scrapLots/ScrapLots'))
const ScrapLots = React.lazy(() => import('./sales/scrapLots/ScrapLotNew'))
const DeadSlowMoving = React.lazy(() => import('./sales/deadSlowMoving'))
const LowStockAlert = React.lazy(() => import('./sales/lowStockAlert'))
const DcOutstanding = React.lazy(() => import('./sales/dcOutstanding'))
const StockMovement = React.lazy(() => import('./sales/stockMovement'))
const StockValuation = React.lazy(() => import('./sales/stockValuation'))
const MessagePage = React.lazy(() => import('./common/message'))
const SalesRequests = React.lazy(() => import('./sales/salesApprovals/SalesApprovals'))
const CustomerReceipts = React.lazy(() => import('../../src/components/customer_erpDesign/customerReceipts'))
const CustomerOverView = React.lazy(() => import('../../src/components/customer_erpDesign/customerOverView'))
const Growretailproduct = React.lazy(() => import('./growretail/admin/growretailproduct'));
const GrowRetailRequestAndApproval  =  React.lazy(() => import('./growretail/admin/requestAndApproval'));



	function CrmQuotationCreateRoute() {
	  const navigate = useNavigate();
	  return <QuotationFormPage mode='create' onClose={() => navigate('/crm/quotation')} />;
	}

	function CrmQuotationApprovalsRoute() {
	  return <QuotationApprovals />;
	}

	function CrmQuotationDetailRoute() {
	  const {quotationId} = useParams();
	  const location = useLocation();
	  const navigate = useNavigate();
	  const mode = new URLSearchParams(location.search).get('mode');

	  if (mode === 'edit') {
	    return (
	      <QuotationFormPage
	        mode='edit'
	        quotationId={quotationId}
	        onClose={() => navigate(`/crm/quotation/${quotationId}`)}
	      />
	    );
	  }

	  return (
	    <QuotationViewPage
	      quotationId={quotationId}
	      onBack={() => navigate('/crm/quotation')}
	    />
	  );
	}

		function CrmQuotationTimelineRoute() {
		  const {quotationId} = useParams();
		  const dispatch = useDispatch();
		  const navigate = useNavigate();

	  const {quotationById, quotationTimelineData} = useSelector(
	    (state) => state.quotationReducer,
	  );

	  useEffect(() => {
	    if (quotationId) dispatch(getQuotationByIdAction(quotationId));
	  }, [dispatch, quotationId]);

	  const quotation = quotationById?.[0]?.quotation;
	  const quotationNumber = quotation?.quotation_number;

	  useEffect(() => {
	    if (quotationNumber)
	      dispatch(quotationTimelineDataAction({id: quotationNumber}));
	  }, [dispatch, quotationNumber]);

	  return (
	    <div style={{padding: 16}}>
	      <button
	        type='button'
	        onClick={() => navigate(`/crm/quotation/${quotationId}`)}
	      >
	        Back to Quotation Detail
	      </button>
	      <QuotationTimeline data={quotationTimelineData || []} />
	    </div>
		  );
		}

		function CrmTaskCreateRoute() {
		  const navigate = useNavigate();
		  return <TaskCreation handleClose={() => navigate('/crm/tasks')} />;
		}

		function CrmCallCreateRoute() {
		  const navigate = useNavigate();
		  return <CallsForm handleClose={() => navigate('/crm/calls')} />;
		}

		function CrmMeetingCreateRoute() {
		  const navigate = useNavigate();
		  return <MeetingsForm handleClose={() => navigate('/crm/meetings')} />;
		}

		function CrmLeadAccountDetailRoute() {
		  const {accountId} = useParams();
		  const dispatch = useDispatch();
		  const navigate = useNavigate();

		  const {leadManagementReducers} = useSelector((state) => state);
		  const getAllAccounts = leadManagementReducers?.getAllAccounts || [];

		  useEffect(() => {
		    dispatch(getAllLeadAccountsAction());
		  }, [dispatch]);

		  const rowData = getAllAccounts.find(
		    (a) => String(a?.customer_id) === String(accountId),
		  );

		  if (!rowData) return <div style={{padding: 16}}>Loading...</div>;

		  return (
		    <AccountsDetail
		      rowData={rowData}
		      index={rowData?.customer_id}
		      customerId={rowData?.customer_id}
		      length={getAllAccounts.length}
		      handleClose={() => navigate('/crm/leadAccounts')}
		    />
		  );
		}

		function CrmLeadAccountTimelineRoute() {
		  const {accountId} = useParams();
		  const navigate = useNavigate();
		  return (
		    <div style={{padding: 16}}>
		      <button type='button' onClick={() => navigate(`/crm/leadAccounts/${accountId}`)}>
		        Back to Account Detail
		      </button>
			      <AccountsTimeline data={Number(accountId)} />
			    </div>
			  );
			}

		function CrmCampaignDetailRoute() {
		  const {campaignId} = useParams();
		  const navigate = useNavigate();
		  return (
		    <CampaignDetails
		      index={Number(campaignId)}
		      handleClose={() => navigate('/crm/campaign')}
		    />
		  );
		}

		const modulesname =()=>{
		  // const cookies = new Cookies();
		  const storage = getsessionStorage()

   let modules= []
  if(storage){
    modules =storage?.modules || []
  }

   return modules
 }
 const storage = getsessionStorage()

const ROUTES = [


  // ---projects Menu Starts---

  {
    path: '/projects/projects',
    key: 'Projects',
    parentName: storage.company_type === 11 ? 'Projects' : 'Project',
    exact: true,
    element: <ScrumBoard/>,
  },
  // {
  //   path: ['/projects/:id', '/projects'],
  //   key: 'tasks',
  //   parentName: 'Project',
  //   exact: true,
  //   element: <ScrumBoard />,
  // },
  {
    path: '/projects/tasklogs' ,
    key: storage.company_type === 11 ? 'Task Summary' : 'Project',
    parentName: storage.company_type === 11 ? 'Task Summary' : 'Project',
    exact: true,
    element: <Tasks/>,
  },
  {
    path: '/projects/task' ,
    key: storage.company_type === 11 ? 'Issues' : 'Project',
    parentName: storage.company_type === 11 ? 'Issues' : 'Project',
    exact: true,
    element: <Task/>,
  },
  {
    path: '/projects/assigntask',
    key: 'tasks',
    parentName: 'Project',
    exact: true,
    element: <AssignTasks/>,
  },
     {
    path: '/projects/report',
    key: 'Reports',
    parentName: 'Reports',
    exact: true,
    element: <ReportsPage />
  },

  // ---projects Menu Ends---



  //---Assets Menu starts---

  {
    path: '/assets/assets',
    key: 'Assets',
    parentName: 'Assets',
    exact: true,
    element: <Assets/>
  },
  {
    path: '/assets/customFields',
    key: 'Assets',
    parentName: 'Custom Fields',
    exact: true,
    element: <DynamicProperty />,
  },

  {
    path: '/assets/insurance',
    key: 'Insurance',
    parentName: 'Renewals',
    exact: true,
    element : <Renewals/>
  },
  {
    path: '/assets/warranty',
    key: 'Warranty',
    parentName: 'Renewals',
    exact: true,
    element: <Renewals/>,

  },
  {
    path: '/assets/serviceDue',
    key: 'Service Due',
    parentName: 'Renewals',
    exact: true,
    element: <ServiceDueTable />,
  },
  {
    path: '/assets/subscription',
    key: 'Subscription',
    parentName: 'Subscription',
    exact: true,
    element : <Renewals/>
  },
  {
    path: '/assets/filings',
    key: 'Filings',
    parentName: 'Renewals',
    exact: true,
    element: <CompliancesTable />,
  },
  {
    path: '/assets/custom',
    key: 'Custom Renewals',
    parentName: 'Custom Renewals',
    exact: true,
    element: <CustomRenewalsTable/>,
  },
  {
    path: '/assets/audits',
    key: 'audits',
    parentName: 'Audits',
    exact: true,
    element: <Audit />,
  },
  {
    path: '/assets/alerts',
    key: 'alerts',
    parentName: 'Alerts',
    exact: true,
    element: <AlertsTable />, 
  },
  {
    path: '/assets/auditRequest',
    key: 'auditRequests',
    parentName: 'Audit Request',
    exact: true,
    element: <AuditRequest />,
  },
  {
    path: '/assets/auditChecklist',
    key: 'auditChecklist',
    parentName: 'Audit CheckList',
    exact: true,
    element: <ChecklistTable />,
  },
  {
    path : '/assets/scrapAsset',
    key : 'scrapAsset',
    parentName : 'Assets',
    exact : true,
    element : <ScrapAssetReport />
  },
   {
    path: '/assets/report',
    key: 'Reports',
    parentName: 'Reports',
    exact: true,
    element: <ReportsPage />
  },

  //---Assets Menu Ends---


  //---Leads Menu Starts---
  {
    path: '/crm/leads',
    key: 'crm_leads_page',
    parentName: 'Leads',
    exact: true,
    element: <LeadManagement />,
  },
  {
    path: '/crm/leads/:lead_id/convert',
    key: 'crm_leads_convert',
    parentName: 'Leads',
    exact: true,
    element: <LeadConvertPage />,
  },
  {
    path: '/crm/leads-v2',
    key: 'crm_leads_v2_page',
    parentName: 'Leads V2',
    exact: true,
    element: <LeadsV2Page />,
  },
  {
    path: '/crm/deals',
    key: 'Deals',
    parentName: 'Lead',
    exact: true,
    element: <DealsPipelinePage />,
  },
  {
    path: '/crm/deals/:deal_id',
    key: 'Deals_Detail',
    parentName: 'Lead',
    exact: true,
    element: <DealsPipelinePage />,
  },
  {
    path: '/crm/catalog/products',
    key: 'crm_catalog_products',
    parentName: 'Catalog Products',
    exact: true,
    element: <ProductCatalogPage />,
  },
  {
    path: '/crm/catalog/price-lists',
    key: 'crm_catalog_price_lists',
    parentName: 'Price Lists',
    exact: true,
    element: <PriceListsPage />,
  },
  {
    path: '/crm/catalog/price-lists/:price_list_id/items',
    key: 'crm_catalog_price_list_items',
    parentName: 'Price List Items',
    exact: true,
    element: <PriceListItemsPage />,
  },
  {
    path: '/crm/templates',
    key: 'crm_templates',
    parentName: 'Templates',
    exact: true,
    element: <TemplatesPage />,
  },
  {
    path: '/crm/automation',
    key: 'crm_automation',
    parentName: 'Automation',
    exact: true,
    element: <AutomationPage />,
  },
  {
    path: '/crm/settings',
    key: 'crm_settings',
    parentName: 'CRM Settings',
    exact: true,
    element: <CrmSettingsPage />,
  },
  {
    path: '/crm/settings/integrations',
    key: 'crm_settings_integrations',
    parentName: 'Integrations Hub',
    exact: true,
    element: <CrmSettingsPage />,
  },
  {
    path: '/common/IntegrationsHub',
    key: 'crm_integrations_hub',
    parentName: 'Integrations Hub',
    exact: true,
    element: <IntegrationsHub />,
  },
  {
    path: '/crm/integrations/api-keys',
    key: 'Integrations',
    parentName: 'Integrations Hub',
    exact: true,
    element: <IntegrationsApiKeysPage />,
  },
  
  {
    path: '/crm/integrations/webhooks',
    key: 'crm_integrations_webhooks',
    parentName: 'Integrations Hub',
    exact: true,
    element: <IntegrationsWebhooksPage />,
  },
  {
    path: '/crm/integrations/website-forms',
    key: 'crm_integrations_website_forms',
    parentName: 'Integrations Hub',
    exact: true,
    element: <IntegrationsWebsiteFormsPage />,
  },
  {
    path: '/crm/integrations/generic-webhooks',
    key: 'crm_integrations_generic_webhooks',
    parentName: 'Integrations Hub',
    exact: true,
    element: <IntegrationsGenericWebhooksPage />,
  },
  {
    path: '/crm/integrations/imports/leads-csv',
    key: 'crm_integrations_csv_import',
    parentName: 'Integrations Hub',
    exact: true,
    element: <IntegrationsCsvImportPage />,
  },
  {
    path: '/crm/integrations/email-inbound',
    key: 'crm_integrations_email_inbound',
    parentName: 'Integrations Hub',
    exact: true,
    element: <IntegrationsEmailInboundPage />,
  },
  // {
  //   path: '/crm/lead',
  //   key: 'crm_lead_page',
  //   parentName: 'Lead',
  //   exact: true,
  //   element: <LeadManagement />,
  // },
  {
    path: '/crm/leadAccounts',
    key: 'crm_lead_accounts',
    parentName: 'Lead Accounts',
    exact: true,
    element: <LeadAccountsTable />,
  },
  {
    path: '/crm/leadAccounts/:accountId/timeline',
    key: 'crm_lead_accounts_timeline',
    parentName: 'Account Timeline',
    exact: true,
    element: <CrmLeadAccountTimelineRoute />,
  },
  {
    path: '/crm/leadAccounts/:accountId',
    key: 'crm_lead_accounts_detail',
    parentName: 'Account Detail',
    exact: true,
    element: <CrmLeadAccountDetailRoute />,
  },
  {
    path: '/crm/quotation',
    key: 'crm_quotation',
    parentName: 'Quotation',
    exact: true,
    element: <QuotationListPage />,
  },
  {
    path: '/crm/quotation/new',
    key: 'crm_quotation_new',
    parentName: 'Quotation',
    exact: true,
    element: <CrmQuotationCreateRoute />,
  },
  {
    path: '/crm/quotations/new',
    key: 'crm_quotations_new_alias',
    parentName: 'Quotation',
    exact: true,
    element: <CrmQuotationCreateRoute />,
  },
  {
    path: '/crm/quotation/approvals',
    key: 'crm_quotation_approvals',
    parentName: 'Quotation Approvals',
    exact: true,
    element: <CrmQuotationApprovalsRoute />,
  },
  {
    path: '/crm/quotation/:quotationId/timeline',
    key: 'crm_quotation_timeline',
    parentName: 'Quotation Timeline',
    exact: true,
    element: <CrmQuotationTimelineRoute />,
  },
  {
    path: '/crm/quotation/:quotationId',
    key: 'crm_quotation_detail',
    parentName: 'Quotation Detail',
    exact: true,
    element: <CrmQuotationDetailRoute />,
  },
  {
    path: '/crm/campaign',
    key: 'crm_campaign',
    parentName: 'Campaign',
    exact: true,
    element: <CampaignTable />,
  },
  {
    path: '/crm/campaign/:campaignId',
    key: 'crm_campaign_detail',
    parentName: 'Campaign Detail',
    exact: true,
    element: <CrmCampaignDetailRoute />,
  },
  {
    path: '/crm/tasks',
    key: 'crm_tasks',
    parentName: 'Tasks',
    exact: true,
    element: <LeadTasksTable />,
  },
  {
    path: '/crm/tasks/new',
    key: 'crm_tasks_new',
    parentName: 'Tasks',
    exact: true,
    element: <CrmTaskCreateRoute />,
  },
  {
    path: '/crm/calls',
    key: 'crm_calls',
    parentName: 'Calls',
    exact: true,
    element: <CallsTable />,
  },
  {
    path: '/crm/calls/new',
    key: 'crm_calls_new',
    parentName: 'Calls',
    exact: true,
    element: <CrmCallCreateRoute />,
  },
  {
    path: '/crm/meetings',
    key: 'crm_meetings',
    parentName: 'Meetings',
    exact: true,
    element: <MeetingsTable />,
  },
  {
    path: '/crm/meetings/new',
    key: 'crm_meetings_new',
    parentName: 'Meetings',
    exact: true,
    element: <CrmMeetingCreateRoute />,
  },
  //---Leads Menu Ends---

  //---growRetailAdmin Menu Start---
 {
    path: '/growretailadmin/requestAndApproval',
    key: 'superAdmin',
    parentName: 'GrowRetail',
    exact: true,
    element: <GrowRetailRequestAndApproval />
  },
  {
    path: '/growretailadmin/growretailproduct',
    key: 'superAdmin',
    parentName: 'GrowRetail',
    exact: true,
    element: <Growretailproduct />
  },
 //---growRetailAdmin Menu End---
 
 //--- superAdmin Menu Start---

  {
    path: '/superadmin/dashboard',
    key: 'superAdmin',
    parentName: 'Dashboard',
    exact: true,
    element: <SuperAdminDashboard />
  },



  {
    path: '/superadmin/pendingActivations',
    key: 'superAdmin',
    parentName: 'PendingActivations',
    exact: true,
    element: <PendingActivations />
  },
  {
    path: '/superadmin/ErpRequest',
    key: 'Tazk',
    parentName: 'Tazk',
    exact: true,
    element: <ErpRequestAndApproval />
  },
  {
    path: '/superadmin/companies',
    key: 'superAdmin',
    parentName: 'Super Admin Settings',
    exact: true,
    element: <Companies />
  },
  {
    path: '/superadmin/rejected',
    key: 'superAdmin',
    parentName: 'Rejected',
    exact: true,
    element: <RejectedRequest />
  },
  
  {
    path: '/superadmin/menuBuilder',
    key: 'superAdmin',
    parentName: 'Menu Builder',
    exact: true,
    element: <MenuBuilder />
  },
  {
    path: '/superadmin/subscriptionManager',
    key: 'superAdmin',
    parentName: 'Subscription Manager',
    exact: true,
    element: <SubscriptionManager />
  },
  {
    path: '/superadmin/featuresMapping',
    key: 'superAdmin',
    parentName: 'Features Mapping',
    exact: true,
    element: <FeaturesMapping />
  },
  {
    path: '/superadmin/analytics',
    key: 'superAdmin',
    parentName: 'Analytics',
    exact: true,
    element: <SuperAdminAnalytics />
  },
  {
    path: '/superadmin/settings',
    key: 'superAdmin',
    parentName: 'Settings',
    exact: true,
    element: <SuperAdminSettings />
  },
  {
    path: '/superadmin/onboarding',
    key: 'superAdmin',
    parentName: 'Onboarding',
    exact: true,
    element: <SuperAdminOnboarding />
  },
  {
    path: '/superadmin/roleManager',
    key: 'superAdmin',
    parentName: 'Role Manager',
    exact: true,
    element: <RoleManager />
  },
  {
    path: '/superadmin/roleAccessManager',
    key: 'superAdmin',
    parentName: 'Role Access Manager',
    exact: true,
    element: <RoleAccessManager />
  },
  {
    path: '/superadmin/definitionManager',
    key: 'superAdmin',
    parentName: 'Definition Manager',
    exact: true,
    element: <DefinitionManager />
  },
  {
    path: '/superadmin/notificationTemplateManager',
    key: 'superAdmin',
    parentName: 'Notification Template Manager',
    exact: true,
    element: <NotificationTemplateManager />
  },
  {
    path: '/superadmin/notificationAnalytics',
    key: 'superAdmin',
    parentName: 'Notification Analytics',
    exact: true,
    element: <NotificationAnalytics />
  },
  {
    path: '/superadmin/whatsapplogs',
    key: 'superAdmin',
    parentName: 'WhatsApp Logs',
    exact: true,
    element: <WhatsappLogs />
  },
  {
    path: '/superadmin/growretail',
    key: 'superAdmin',
    parentName: 'Grow Retail',
    exact: true,
    element: <ErpRequestAndApproval />
  },
  {
    path: '/superadmin/companies/:id',
    key: 'superAdmin',
    parentName: 'Company Detail',
    exact: true,
    element: <CompanyDetail />
  },

  //--- superAdmin Menu end---


  //-- stact Menu start

 {
    path: '/stact/createPlans',
    key: 'Create Plans',
    parentName: 'Plans',
    exact: true,
    element: <AllPlansList />,
  },
  {
    path: '/stact/schedulePlans',
    key: 'Schedule Plans',
    parentName: 'Membership',
    exact: true,
    element: <ListSchedulePlan />,
  },

  {
    path: '/stact/attendancelog',
    key: 'Attendance Log',
    parentName: 'Attendance',
    exact: true,
    element: <AttendanceLog />,
  },


// --- stact Menu end


// --- payroll Menu starts

 {
    path: '/payroll/todayAttendance',
    key: 'Today Attendance',
    parentName: 'Today Attendance',
    exact: true,
    element: <SelfieAttendance />,
  },

  {
    path: '/payroll/LiveLocation',
    key: 'Live Location',
    parentName: 'Live Location',
    exact: true,
    element: <LiveLocation />,
  },

  {
    path: '/payroll/leaveRequest',
    key: 'Requests',
    parentName: 'Requests',
    exact: true,
    element: <LeaveRequest />,
  },

  {
    path: '/payroll/faceRegistration',
    key: 'Face Registration',
    parentName: 'Face Registration',
    exact: true,
    element: <ApprovalsPage />,
  },
   {
    path: '/payroll/manualAttendance',
    key: 'Manual Attendance',
    parentName: 'Manual Attendance',
    exact: true,
    element: <ManualAttendance/>,
  },
  {
    path: '/payroll/shiftlist',
    key: 'Create Shift',
    parentName: 'Shifts',
    exact: true,
    element: <ShiftList />,
  },
  {
    path: '/payroll/schedulelist',
    key: 'Schedule Shift',
    parentName: 'Shifts',
    exact: true,
    element: <ScheduleList />,
  },
  {
    path: '/payroll/monthShift',
    key: 'View Shift',
    parentName: 'Shifts',
    exact: true,
    element: <MonthShift />,
  },

   {
    path: '/payroll/salary',
    key: 'Assign Salary',
    parentName: 'Salary',
    exact: true,
    element: <Salary />,
  },
  {
    path: '/payroll/salaryStructure',
    key: 'Salary Structure',
    parentName: 'Salary',
    exact: true,
    element: <SalaryStructure />,
  },

  {
    path: '/payroll/loans',
    key: 'Loans',
    parentName: 'Loans',
    exact: true,
    element: <Loans />,
  },
  {
    path: '/payroll/claims',
    key: 'Claims',
    parentName: 'Claims',
    exact: true,
    element: <Claims />
  },
  {
    path: '/payroll/holidays',
    key: 'Holidays & Special Permissions',
    parentName: 'Holidays & Special Permissions',
    exact: true,
    element: <Holidays />,
  },


    {
    path: '/payroll/AttendanceProcess',
    key: 'Attendance Process',
    parentName: 'Attendance Process',
    exact: true,
    element: <AttendanceProcess />,
  },

   {
    path: '/payroll/processSalary',
    key: 'Salary Process',
    parentName: 'Salary Process',
    exact: true,
    element: <ProcessSalary />,
  },

    {
    path: '/payroll/qrAttendance',
    key: 'QR Generator',
    parentName: 'QR Generator',
    exact: true,
    element: <QRAttendance />,
  },


  {
    path: '/payroll/employeeProfile',
    key: 'Employee Profile',
    parentName: 'Employee Profile',
    exact: true,
    element: <EmployeeProfileList />,
  },
  {
    path: '/payroll/orgStructure',
    key: 'Organization Structure',
    parentName: 'Organization Structure',
    exact: true,
    element: <OrgStructurePage />,
  },
  {
    path: '/payroll/employeeLifecycle',
    key: 'Employee Lifecycle',
    parentName: 'Employee Lifecycle',
    exact: true,
    element: <EmployeeLifecyclePage />,
  },
  {
    path: '/payroll/hrLetters',
    key: 'HR Letters',
    parentName: 'HR Letters',
    exact: true,
    element: <HRLettersPage />,
  },
  {
    path: '/payroll/essPortal',
    key: 'ESS Portal',
    parentName: 'ESS Portal',
    exact: true,
    element: <EssPortalPage />,
  },
  {
    path: '/payroll/mySalary',
    key: 'My Salary',
    parentName: 'My Salary',
    exact: true,
    element: <MySalaryPage />,
  },
  {
    path: '/payroll/myTeam',
    key: 'My Team',
    parentName: 'My Team',
    exact: true,
    element: <MyTeamPage />,
  },
  {
    path: '/payroll/documentManagement',
    key: 'Document Management',
    parentName: 'Document Management',
    exact: true,
    element: <DocumentManagementPage />,
  },
  {
    path: '/payroll/expenseManagement',
    key: 'Expense Management',
    parentName: 'Expense Management',
    exact: true,
    element: <ExpenseManagementPage />,
  },
  {
    path: '/payroll/hrPolicies',
    key: 'HR Policies',
    parentName: 'HR Policies',
    exact: true,
    element: <HrPoliciesPage />,
  },
  {
    path: '/payroll/performance',
    key: 'Performance Management',
    parentName: 'Performance Management',
    exact: true,
    element: <PerformancePage />,
  },
  {
    path: '/payroll/recruitment',
    key: 'Recruitment',
    parentName: 'Recruitment',
    exact: true,
    element: <RecruitmentPage />,
  },
  {
    path: '/payroll/training',
    key: 'Training',
    parentName: 'Training',
    exact: true,
    element: <TrainingPage />,
  },
  {
    path: '/payroll/hrAnalytics',
    key: 'HR Analytics',
    parentName: 'HR Analytics',
    exact: true,
    element: <HrAnalyticsPage />,
  },
  {
    path: '/payroll/employeeVerification',
    key: 'Employee Verification',
    parentName: 'Employee Verification',
    exact: true,
    element: <EmployeeVerificationList />,
  },
  {
    path: '/payroll/employeeDocuments',
    key: 'Employee Documents',
    parentName: 'Employee Documents',
    exact: true,
    element: <EmployeeDetailsList />,
  },

 {
    path: '/payroll/AttendanceLogReport',
    key: 'Attendance Log Report',
    parentName: 'Reports',
    exact: true,
    element: <AttendanceLogReport />,
  },
    {
    path: '/payroll/AttendanceView',
    key: 'Attendance View Report',
    parentName: 'Reports',
    exact: true,
    element: <AttendanceView />,
  },
  {
    path: '/payroll/CheckInCheckOut',
    key: 'Checkin Checkout Report',
    parentName: 'Reports',
    exact: true,
    element: <CheckInCheckOutView />,
  },
    {
    path: '/payroll/requestReport',
    key: 'Request Report',
    parentName: 'Reports',
    exact: true,
    element: <RequestReport/>,
  },
   {
    path: '/payroll/workDurationReport',
    key: 'Work Duration Report',
    parentName: 'Reports',
    exact: true,
    element: <WorkDurationReportTest/>,
  },
  {
    path: '/payroll/overTimeReport',
    key: 'OverTime Report',
    parentName: 'Reports',
    exact: true,
    element: <OverTimeReport/>,
  },
   {
    path: '/payroll/AttendanceCorrection',
    key: 'Attendance Correction',
    parentName: 'Reports',
    exact: true,
    element: <AttendanceCorrection />,
  },
   {
    path: '/payroll/leaveReport',
    key: 'Leave Report',
    parentName: 'Reports',
    exact: true,
    element: <LeaveReport />,
  },
  {
    path: '/payroll/AttendanceReports',
    key: 'Attendance Reports',
    parentName: 'Reports',
    exact: true,
    element: <AttendanceReports />,
  },
  {
    path: '/payroll/lateLoginAndEarlyCheckOutReport',
    key: 'Late & Early Report',
    parentName: 'Reports',
    exact: true,
    element: <LateAndEalyReport/>,
  },
  {
    path: '/payroll/PunchExceptions',
    key: 'Punch Exceptions',
    parentName: 'Reports',
    exact: true,
    element: <PunchExceptionReport/>,
  },

  {
    path: '/payroll/paySlip',
    key: 'Payslips',
    parentName: 'Reports',
    exact: true,
    element: <PaySlipReport />,
  },
  {
    path: '/payroll/salaryReports',
    key: 'Salary Report',
    parentName: 'Reports',
    exact: true,
    element: <SalaryReportsPayroll/>,
  },

   {
    path: '/payroll/SalaryReportForBank',
    key: 'Salary Report For Bank',
    parentName: 'Reports',
    exact: true,
    element: <SalaryReportForBank />,
  },
    {
    path :'/payroll/PfReport',
    key : 'PF Report',
    parentName : 'Reports',
    exact:true,
    element:<PfReport/>
  },
 
  {
    path: '/payroll/CostSummaryReport',
    key: 'CostSummary Report',
    parentName: 'Reports',
    exact: true,
    element: <CostSummaryReport/>,
  },
  {
    path :'/payroll/SalaryStatement',
    key : 'Salary Structure Report',
    parentName : 'Reports',
    exact:true,
    element:<SalaryStatement/>
  },

  {
    path: '/payroll/RelievedEmployeeDetails',
    key: 'Relieved Employee',
    parentName: 'Reports',
    exact: true,
    element: <RelievedEmployeeDetails />,
  },

  
  {
    path: '/payroll/StatutoryReports',
    key: 'Statutory Summary',
    parentName: 'Reports',
    exact: true,
    element: <StatutoryReports reportType="summary" />,
  },

    {
    path: '/payroll/PT',
    key: 'PT Statement',
    parentName: 'Reports',
    exact: true,
    element: <StatutoryReports reportType='pt' />,
  },
   {
    path: '/payroll/PF',
    key: 'PF ECR Report',
    parentName: 'Reports',
    exact: true,
    element: <StatutoryReports reportType='pf' />,
  },
     {
    path: '/payroll/ESI',
    key: 'ESI Report',
    parentName: 'Reports',
    exact: true,
    element: <StatutoryReports reportType='esi' />,
  },

  {
    path: '/payroll/offlineAttendance',
    key: 'Offline Attendance',
    parentName: 'Offline Attendance',
    exact: true,
    element: <ManualAttendance/>,
  },

  {
    path: '/payroll/form16',
    key: 'Form16',
    parentName: 'TDS',
    exact: true,
    element: <Form16/>
  },
  {
    path: '/payroll/form12',
    key: 'Form12',
    parentName: 'TDS',
    exact: true,
   element: <Form12BB/>
  },
   {
    path: '/payroll/events',
    key: 'Events',
    parentName: 'Events',
    exact: true,
    element: <Events />
  },
  {
    path: '/payroll/employeeViewShift',
    key: 'View Shift',
    parentName: 'Shifts',
    exact: true,
    element: <MonthView />,
  },
     {
    path: '/payroll/report',
    key: 'Reports',
    parentName: 'Reports',
    exact: true,
    element: <ReportsPage />
  },
    {
    path: '/payroll/RelievedEmployeeDetails',
    key: 'RelievedEmployeeDetails',
    parentName: 'Requests',
    exact: true,
    element: <RelievedEmployeeDetails />,
  },

      {
    path: '/payroll/DeviceRegisterReport',
    key: 'DeviceRegisterReport',
    parentName: 'Requests',
    exact: true,
    element: <DeviceRegisterReport />,
  },
  {
    path: '/payroll/FraudLogs',
    key: 'FraudLogs',
    parentName: 'Requests',
    exact: true,
    element: <FraudLogsReport />,
  },
  {
    path: '/reports/loginAuditLogs',
    key: 'LoginAuditLogs',
    parentName: 'Logs',
    exact: true,
    element: <LoginAuditLogs />,
  },
  {
    path: '/reports/deletedLog',
    key: 'deletedLog',
    parentName: 'Logs',
    exact: true,
    element: <DeletedLoggedDetails />,
  },
       {
    path: '/payroll/PrivilegeLeave',
    key: 'PrivilegeLeave',
    parentName: 'Requests',
    exact: true,
    element: <PrivilegeLeaveReport />,
  },
       {
    path: '/payroll/AttendanceEfficiencyReport',
    key: 'Reports',
    parentName: 'Reports',
    exact: true,
    element: <AttendanceEfficiencyReport />,
  },


// --- payroll Menu ends

// -- Common Menu Starts


    {
    path: '/common/announcement',
    key: 'Announcement',
    parentName: 'Announcement',
    exact: true,
    element: <Announcement />,
  },


  //   {
  //     path: "/signup",
  //     key: "Sign_Up",
  //     exact: true,
  //     element: <SignUp />
  // },
  {
      path: '/common/home',
      key: 'HOME_PAGE',
      exact: true,
      element: <RouteHomeAndSub/>

  },
    {
    path: '/common/apps/contacts',
    key: 'CUSTOMER_PAGE_ALL_FOLDER',
    parentName: 'Contacts',
    // parentName:'Sales',
    exact: true,
    element: <CustomerList />,
  },

    {
    path: '/common/chat',
    key: 'Chat',
    parentName: 'Chat',
    exact: true,
    element: <Chat />,
  },

    {
    path: '/common/configuration',
    key: 'smsmailconfiguration',
    parentName: 'Settings',
    exact: true,
    element: <SmsMailConfiguration />,
  },
   {
    path: '/common/settings',
    key: 'settings',
    parentName: 'Settings',
    exact: true,
    element: <SettingsIndex />,
  },
  {
    path: '/common/doc-templates',
    key: 'docTemplates',
    parentName: 'Settings',
    exact: true,
    element: <DocTemplates />,
  },

    {
    path: '/common/calendar',
    key: 'Calendar',
    parentName: 'Calendar',
    exact: true,
    element:  <CalenderSubMenus />,
  },

   {
    path: '/common/support',
    key: 'support',
    parentName: 'Support',
    exact: true,
    element: <Support />
  },
    {
    path: '/common/approvals',
    key: 'Approvals',
    parentName: 'Approvals',
    exact: true,
    element: <ApprovalsPage />,
  },

    {
    path: '/common/subscriptions',
    key: 'Subscriptions',
    parentName: 'Subscriptions',
    exact: true,
    element: <CompanySubscription />
  },

    {
      path: '/common/activity',
      key: 'activity',
      parentName: 'activity',
      exact: true,
      element: <Activity />

  },
  {
    path: '/common/myaccount',
    key: 'My_Account',
    parentName: 'User Info',
    exact: true,
    element: <MyAccount />

},
  {
    path: '/common/ErrorList',
    key: 'ErrorList',
    parentName: 'Error List',
    exact: true,
    element: <ErrordashBoardUser/>
  },
  {
    path: '/developer/configuration',
    key: 'DeveloperConfiguration',
    parentName: 'Configuration',
    exact: true,
    element: <DeveloperConfiguration/>
  },




  // -- Common Menu Ends

  // -- Accounts menu starts

  {
    path: '/accounts/payinout',
    key: 'payInOut',
    parentName: 'Payments',
    exact: true,
    element: <PaymentReceipt />,
  },
  {
    path: '/accounts/auditDashboard',
    key: 'auditDashboard',
    parentName: 'Data Health',
    exact: true,
    element: <AuditDashboard />,
  },
  {
    path: '/accounts/gstReturns',
    key: 'gstReturns',
    parentName: 'Data Health',
    exact: true,
    element: <GstReturns />,
  },
    {

    path: '/accounts/expenses',
    key: 'expenses',
    parentName: 'Purchases',
    exact: true,
    element: <Expenses />

  },
    {
    path: '/accounts/cashInHand',
    key: 'cashInHand',
    parentName: 'Cash & Bank',
    exact: true,
    element: <NewCashInHand />,
  },
    {
    path: '/accounts/bankReconciliation',
    key: 'BankReconciliation',
    parentName: 'Cash & Bank',
    exact: true,
    element: <BR />,
  },
    {
    path: '/accounts/cheques',
    key: 'chequeBounces',
    parentName: 'Cash & Bank',
    exact: true,
    element: <ChequeBounces />,
  },
    {
    path: '/accounts/cashBankSummary',
    key: 'CashBankSummary',
    parentName: 'Cash & Bank',
    exact: true,
    element: <CashBankSummary/>
  },
    {
    path: '/accounts/companyLoans',
    key: 'ALL_LOANS_PAGE',
    parentName: 'Cash & Bank',
    exact: true,
    element: <AllLoans />,
  },
    {
    path: '/accounts/generalLedger',
    key: 'GeneralLedger',
    parentName: 'Accounts',
    exact: true,
    element: <GeneralLedger />,
  },
  {
    path: '/accounts/Journals',
    key: 'TRANSACTION_PAGE',
    parentName: 'Accounts',
    exact: true,
    element: <Transaction />,
    // element: <Transaction/>,
  },
    {
    path: '/accounts/chartOfAccounts',
    key: 'ChartOfAccounts',
    parentName: 'Accounts',
    exact: true,
    element: <ChartOfAccounts />,
  },
    {
    path: '/accounts/balancesheet',
    key: 'Balance Sheet',
    parentName: 'Reports',
    exact: true,
    element: <BalanceSheetNew />,
  },
   {
    path: '/reports/ledger/:accountId',
    key: 'REPORTS_LEDGER',
    parentName: 'Reports',
    exact: true,
    element: <LedgerReport />,
  },
   {
    path: '/reports/vouchers',
    key: 'REPORTS_VOUCHERS',
    parentName: 'Reports',
    exact: true,
    element: <VoucherReport />,
  },
  {
    path: '/accounts/profitloss',
    key: 'REPORTS_PROFIT_LOSS',
    parentName: 'Reports',
    exact: true,
    element: <Profitloss />,
  },
    {
    path: '/accounts/TrialBalance',
    key: 'Trial Balance',
    parentName: 'Reports',
    exact: true,
    element: <TrialBalanceReport />
  },
    {
    path: '/reports/profit-loss',
    key: 'REPORTS_PROFIT_LOSS',
    parentName: 'Reports',
    exact: true,
    element: <ProfitLossNew />,
  },
      {
    path: '/reports/trial-balance',
    key: 'Trial Balance',
    parentName: 'Reports',
    exact: true,
    element: <TrialBalanceReport />
  },
      {
    path: '/reports/balance-sheet',
    key: 'Balance Sheet',
    parentName: 'Reports',
    exact: true,
    element: <BalanceSheetNew />,
  },
  {
    path: '/accounts/CashFlow',
    key: 'Trial Balance',
    parentName: 'Reports',
    exact: true,
    element: <CashFlow />
  },

    {
    path: '/accounts/allTransactions',
    key: 'allTransactions',
    parentName: 'Reports',
    exact: true,
    element: <TransactionReport />,
  },

    {
    path: '/accounts/profitWiseReport',
    key: 'Profit Report',
    parentName: 'Reports',
    exact: true,
    element: <ProfitWiseReport />,
  },






  // -- Accounts menu ends


  // -- point of sales starts

  {
    path: '/pointofsale/session',
    key: 'SESSION_PAGE',
    parentName: 'Point Of Sale',
    exact: true,
    element: <Session />,
    // element: <PointOfSale />,
  },

    {
    path: '/pointofsale/findproduct',
    key: 'FIND_PRODUCT',
    parentName: 'Point Of Sale',
    exact: true,
    element: <FindProduct />,
    // element: <PointOfSale />,
  },
  {
    path: '/pointofsale',
    key: 'POINTOFSALE_PAGE',
    parentName: 'Point Of Sale',
    exact: true,
    // element: < Index/>,
    // element: <PointOfSale />,
    element: <PointOfSale />,
    // element: <PointOfSale />,
  },
    {
    path: '/pointofsale/payment/posInvoice',
    parentName: 'Point Of Sale',
    key: 'posInvoice',
    exact: true,
    element: <PosInvoice />,
  },
  {
    path: '/pointofsale/payment',
    parentName: 'Point Of Sale',
    key: 'PAYMENT_PAGE',
    exact: true,
    element: <Payment />,
  },

    {
    path: '/pointofsale/dailyReport',
    key: 'dailyReport',
    parentName: 'Point Of Sale',
    exact: true,
    element: <DailyReport />,
  },
    {
    path: '/pointofsale/recharge/dashboard',
    key: 'point_of_sale__recharge_dashboard',
    parentName: 'Point Of Sale',
    exact: true,
    element: <RechargeDashboard />,
  },
    {
    path: '/pointofsale/recharge/new',
    key: 'point_of_sale__recharge_new',
    parentName: 'Point Of Sale',
    exact: true,
    element: <NewRecharge />,
  },
    {
    path: '/pointofsale/recharge/wallet',
    key: 'point_of_sale__recharge_wallet',
    parentName: 'Point Of Sale',
    exact: true,
    element: <RechargeWallet />,
  },
    {
    path: '/pointofsale/posSale',
    key: 'POSSALE_PAGE',
    parentName: 'Pos Report',
    exact: true,
    element: <PosSale />,
  },
    {
    path: '/pointofsale/preOrderReport',
    key: 'preOrderReport',
    parentName: 'Reports',
    exact: true,
    element: <PreOrderReport />,
  },




  // -- point of sales ends


  //  -- sales starts

  {
    path: '/sales/salesOrders',
    key: 'SALES_PAGE',
    parentName: 'Sales',
    exact: true,
    element: <Sales />,
  },
  {
    path: '/sales/invoices',
    key: 'SALES_PAGE',
    parentName: 'Sales',
    exact: true,
    element: <Sales />,
  },
  {
    path: '/sales/deliveryChallan',
    key: 'SALES_PAGE',
    parentName: 'Sales',
    exact: true,
    element: <Sales />,
  },
  {
    path: '/sales/receivable',
    key: 'receivable',
    parentName: 'Sales',
    exact: true,
    element: <Receivable />,
  },
  {
    path: '/codes',
    key: 'codeGenerator',
    parentName: 'Point Of Sale',
    exact: true,
    element: <CodeGenerator />,
  },
  {
    path: '/sales/priceList',
    key: 'priceList',
    parentName: 'Sales',
    exact: true,
    element: <PriceList />
  },
  {

    path: '/sales/ReceiptSales',
    key: 'ReceiptSales',
    parentName: 'Sales',
    exact: true,
    element: <ReceiptSales />

  },
  {
    path: '/sales/CreditNotes',
    key: 'CreditNotes',
    parentName: 'Sales',
    exact: true,
    element: <ManualNotes />,
  },

  {
    path: '/sales/quotation',
    key: 'quotation',
    parentName: 'Sales',
    exact: true,
    element: <QuotationTable />,
  },
  {
    path: '/sales/purchasesOrders',
    key: 'PURCHASES_PAGE',
    parentName: 'Purchases',
    exact: true,
    element: <Purchases />,
  },
  {
    path: '/sales/bills',
    key: 'PURCHASES_PAGE',
    parentName: 'Purchases',
    exact: true,
    element: <Purchases />,
  },
  {
    path: '/sales/payable',
    key: 'Payable',
    parentName: 'Purchases',
    exact: true,
    element: <Payable />,
  },
  {

    path: '/sales/PaymentsPurchases',
    key: 'PaymentsPurchases',
    parentName: 'Purchases',
    exact: true,
    element: <PaymentsPurchases />

  },
  {
    path: '/sales/vendorPriceList',
    key: 'vendorPriceList',
    parentName: 'Purchases',
    exact: true,
    element: <VendorPriceList />,
  },

  {
    path: '/sales/DebitNotes',
    key: 'DebitNotes',
    parentName: 'Sales',
    exact: true,
    element: <DebitNotes />,
  },

  {
    path: '/sales/collectDefects',
    key: 'Defects',
    parentName: 'Defects',
    exact: true,
    element: <ListDefects />,
  },
  {
    path: '/sales/sendDefects',
    key: 'Defects',
    parentName: 'Defects',
    exact: true,
    element: <SendDefects />,
  },
  {
    path: '/sales/issueReplacement',
    key: 'Defects',
    parentName: 'Defects',
    exact: true,
    element: <ListReplacements />,
  },
  {
    path: '/sales/collectReplacement',
    key: 'Defects',
    parentName: 'Defects',
    exact: true,
    element: <ListReplacements />,
  },
  {
    path: '/sales/inventory',
    key: 'INVENTORY_PAGE',
    parentName: 'Inventory',
    exact: true,
    element: <Inventory />,
  },
  {
    path: '/sales/product',
    key: 'PRODUCT_PAGE',
    parentName: 'Inventory',
    exact: true,
    element: <Product />,
  },
  {
    path: '/sales/stocktransfer',
    key: 'Transfer',
    parentName: 'Inventory',
    exact: true,
    element: <Transfer />,
  },
  {
    path: '/sales/stockreceive',
    key: 'Receiver',
    parentName: 'Inventory',
    exact: true,
    element: <Receiver />,
  },
  {
    path: '/sales/stockReconcilate',
    key: 'STOCKRECONCILATE_PAGE',
    parentName: 'Inventory',
    exact: true,
    element: <StockReconcilate />,
  },

  {
    path: '/sales/syncInventory',
    key: 'Sync Inventory',
    parentName: 'Inventory',
    exact: true,
    element: <SyncInventory />,
  },
  {
    path: '/sales/schemes',
    key: 'SCHEMS',
    parentName: 'Schemes',
    exact: true,
    element: <Schemes />,
  },
  {
    path: '/sales/schemesdashboard',
    key: 'SCHEMS-DASHBOARD',
    parentName: 'Schemes',
    exact: true,
    element: <ApexCharts />,
  },

  {
    path: '/sales/schemesReceivables',
    key: 'SCHEMS-RECEIVABLES',
    parentName: 'Schemes',
    exact: true,
    element: <SchemesReceivables />,
  },
  {
    path: '/sales/salesmandashboard',
    key: 'incentivesdashboard',
    parentName: 'Incentives',
    exact: true,
    element: <IncentiveChart />,
  },
  {
    path: '/sales/salesmanIncentive',
    key: 'salesmanIncentive',
    parentName: 'Incentives',
    exact: true,
    element: <SalesmanIncentive />,
  },
  // Sales Target & Incentive Module
  {
    path: '/sales/targetPeriods',
    key: 'salesTarget',
    parentName: 'Sales Target',
    exact: true,
    element: <SalesTargetPeriods />,
  },
  {
    path: '/sales/targetPeriods/:periodId/assign',
    key: 'salesTargetAssign',
    parentName: 'Sales Target',
    exact: true,
    element: <SalesTargetAssignment />,
  },
  {
    path: '/sales/targetPeriods/:periodId/salesman/:employeeId/customers',
    key: 'customerTargetAssign',
    parentName: 'Sales Target',
    exact: true,
    element: <CustomerTargetAssignment />,
  },
  {
    path: '/sales/salesTarget/achievement',
    key: 'salesTargetAchievement',
    parentName: 'Sales Target',
    exact: true,
    element: <AchievementDashboard />,
  },
  {
    path: '/sales/salesTarget/leaderboard',
    key: 'salesTargetLeaderboard',
    parentName: 'Sales Target',
    exact: true,
    element: <SalesLeaderboard />,
  },
  {
    path: '/sales/incentivePlans',
    key: 'incentivePlans',
    parentName: 'Incentive Plans',
    exact: true,
    element: <IncentivePlanList />,
  },
  {
    path: '/sales/incentivePlans/new',
    key: 'incentivePlanNew',
    parentName: 'Incentive Plans',
    exact: true,
    element: <IncentivePlanForm />,
  },
  {
    path: '/sales/incentivePlans/:id/edit',
    key: 'incentivePlanEdit',
    parentName: 'Incentive Plans',
    exact: true,
    element: <IncentivePlanForm />,
  },
  {
    path: '/sales/incentiveResults',
    key: 'incentiveResults',
    parentName: 'Incentive Results',
    exact: true,
    element: <IncentiveResults />,
  },
  {
    path: '/sales/myTarget',
    key: 'myTarget',
    parentName: 'My Target',
    exact: true,
    element: <MyTargetDashboard />,
  },
  {
    path: '/sales/whatIfCalculator',
    key: 'whatIfCalculator',
    parentName: 'What-If Calculator',
    exact: true,
    element: <WhatIfCalculator />,
  },
  {
    path: '/sales/SalesmanList',
    key: 'salesmanList',
    parentName: 'Settings',
    exact: true,
    element: <SalesmanList />
  },
  {
    path: '/sales/salesmanvisits',
    key: 'Visits',
    parentName: 'Sales Man',
    exact: true,
    element: <Attendance />,
  },
  {
    path: '/sales/fuelAllowance',
    key: 'fuelAllowance',
    parentName: 'Settings',
    exact: true,
    element: <FuelAllowance />,
  },
  {
    path: '/sales/SalesExecutiveHistory',
    key: 'salesExecutiveHistory',
    parentName: 'Sales Man',
    exact: true,
    element: <SalesExecutiveVisitHistory />
  },

  {
    path: '/sales/SalesmanTravelHistory',
    key: 'SalesmanTravelHistory',
    parentName: 'Sales Man',
    exact: true,
    element: <SalesmanTravelHistory />
  },
  {
    path: '/sales/salesmanlivelocation',
    key: 'SalesManLiveTracking',
    parentName: 'Sales Man',
    exact: true,
    element: <SalesManLiveLocation />
  },

  {
    path: '/sales/salesmancollections',
    key: 'SalesManCollections',
    parentName: 'Sales Man',
    exact: true,
    element: <CollectionsMan />
  },
  {
    path: '/sales/salesReport',
    key: 'salesReport',
    parentName: 'Reports',
    exact: true,
    element: <SalesReport />,
  },
  {
    path: '/sales/dailySalesReport',
    key: 'todaySalesReport',
    parentName: 'Reports',
    exact: true,
    element: <TodaySalesReport />,
  },
  {
    path: '/sales/purchaseReport',
    key: 'purchaseReport',
    parentName: 'Reports',
    exact: true,
    element: <PurchaseReport />,
  },
  {
    path: '/sales/returnCreditNotesReport',
    key: 'returnCreditNotesReport',
    parentName: 'Reports',
    exact: true,
    element: <ReturnCreditNotesReport />,
  },
  {
    path: '/sales/manualCreditNotesReport',
    key: 'manualCreditNotesReport',
    parentName: 'Reports',
    exact: true,
    element: <ManualCreditNotesReport />,
  },
  {
    path: '/sales/returnDebitNotesReport',
    key: 'returnDebitNotesReport',
    parentName: 'Reports',
    exact: true,
    element: <ReturnDebitNotesReport />,
  },
  {
    path: '/sales/manualDebitNotesReport',
    key: 'manualDebitNotesReport',
    parentName: 'Reports',
    exact: true,
    element: <ManualDebitNotesReport />,
  },
  {
    path: '/sales/daybook',
    key: 'Daybook',
    parentName: 'Sales',
    exact: true,
    element: <DayBookReport />
  },

  {

    path: '/sales/paymentsReport',
    key: 'paymentsReport',
    parentName: 'Payments Report',
    exact: true,
    element: <PaymentReportNew />

  },
  {
    path: '/sales/PaymentCollection',
    key: 'Payment Collection',
    parentName: 'Sales',
    exact: true,
    element: <PaymentCollectionOrReport />
  },
  {
    path: '/sales/GSTR1',
    key: 'GSTR1',
    parentName: 'Reports',
    exact: true,
    element: <GST1Report />,
  },
  {
    path: '/sales/GSTR2',
    key: 'GSTR2',
    parentName: 'Reports',
    exact: true,
    element: <GST2Report />,
  },
  {
    path: '/sales/GSTR3B',
    key: 'GSTR3B',
    parentName: 'Reports',
    exact: true,
    element: <GST3BReport />,
  },
  {
    path: '/sales/GSTR4',
    key: 'GSTR4',
    parentName: 'Reports',
    exact: true,
    element: <GST4Report />,
  },
  {
    path: '/sales/GSTR9',
    key: 'GSTR9',
    parentName: 'Reports',
    exact: true,
    element: <GST9Report />,
  },
  {
    path: '/sales/GSTR9A',
    key: 'GSTR9A',
    parentName: 'Reports',
    exact: true,
    element: <GST9AReport />,
  },
  {
    path: '/sales/GSTReport',
    key: 'GST Report',
    parentName: 'Reports',
    exact: true,
    element: <GSTReport />,
  },
  {
    path: '/sales/GSTRateReport',
    key: 'GST Rate Report',
    parentName: 'Reports',
    exact: true,
    element: <GSTRateReport />,
  },
  {
    path: '/sales/TCSReceivable',
    key: 'TCS Receivable',
    parentName: 'Reports',
    exact: true,
    element: <TdsTcsReport />,
  },
  {
    path: '/reports/gst-tds',
    key: 'REPORTS_GST_TDS',
    parentName: 'Reports',
    exact: true,
    element: <TDSReport />,
  },
  {
    path: '/sales/SACReport',
    key: 'SAC Report',
    parentName: 'Reports',
    exact: true,
    element: <SACReport />
  },
  {
    path: '/sales/SalesSummary',
    key: 'Sales Summary By HSN',
    parentName: 'Reports',
    exact: true,
    element: <SalesSummaryReport />
  },

  {
    path: '/sales/27EQ',
    key: '27EQ',
    parentName: 'Reports',
    exact: true,
    element: <Form27EQReport />,
  },
  {
    path: '/sales/stockAgeingReport',
    key: 'stockAgeingReport',
    parentName: 'Reports',
    exact: true,
    element: <StockAgeingReport />,
  },

  {
    path: '/sales/closingstock',
    key: 'closingStock',
    parentName: 'Reports',
    exact: true,
    element: <ClosingStock />,
  },

  {
    path: '/sales/StockGroupSummary',
    key: 'Stock Group Summary',
    parentName: 'Sales',
    exact: true,
    element: <StockGroupSummary />
  },
  {
    path: '/sales/lotItemWiseReport',
    key: 'LotItemWise',
    parentName: 'Reports',
    exact: true,
    element: <Inventory />,
  },
  {
    path: '/sales/ExpiryDateReport',
    key: 'Expiry Date Report',
    parentName: 'Sales',
    exact: true,
    element: <ExpiryDatereport />
  },

    {
    path: '/sales/missingLots',
    key: 'missingLots',
    parentName: 'Reports',
    exact: true,
    element: <MissingProducts />,
  },
  {
    path: '/sales/ExcessProducts',
    key: 'ExcessProducts',
    parentName: 'Reports',
    exact: true,
    element: <ExcessProducts />,
  },
  {
    path: '/sales/scrapLots',
    key: 'ExcessProducts',
    parentName: 'Reports',
    exact: true,
    element: <ScrapLots />,
  },
  {
    path: '/sales/deadSlowMoving',
    key: 'DeadSlowMoving',
    parentName: 'Reports',
    exact: true,
    element: <DeadSlowMoving />,
  },
  {
    path: '/sales/lowStockAlert',
    key: 'LowStockAlert',
    parentName: 'Reports',
    exact: true,
    element: <LowStockAlert />,
  },
  {
    path: '/sales/dcOutstanding',
    key: 'DcOutstanding',
    parentName: 'Reports',
    exact: true,
    element: <DcOutstanding />,
  },
  {
    path: '/sales/stockMovement',
    key: 'StockMovement',
    parentName: 'Reports',
    exact: true,
    element: <StockMovement />,
  },
  {
    path: '/sales/stockValuation',
    key: 'StockValuation',
    parentName: 'Reports',
    exact: true,
    element: <StockValuation />,
  },
    {
    path: '/sales/receiptreport',
    key: 'receiptreport',
    parentName: 'Receipt Reports',
    exact: true,
    element: <ReceiptReport />,
  },
    {
    path: '/sales/soTracking',
    key: 'SO Tracking',
    parentName: 'Sales',
    exact: true,
    element: <SOTracking />,
  },

    {
    path: '/sales/ReconciledStock',
    key: 'missedItems',
    parentName: 'Inventory',
    exact: true,
    element: <Reconciled />,
  },
    {
    path: '/sales/nonReconciledStock',
    key: 'missedItems',
    parentName: 'Inventory',
    exact: true,
    element: <NonReconciled />,
  },
    {
    path: '/apps/CustomerOutstanding',
    key: 'customer_outstanding',
    parentName: 'Others',
    exact: true,
    element: <CustomerOutstandings />,
  },
  {
    path: '/apps/CustomerGeneralInfo',
    key: 'customer_generalinfo',
    parentName: 'Others',
    exact: true,
    element: <CustomerOverView />,
  },
  {
    path: '/apps/CustomerReceipts',
    key: 'customer_receipts',
    parentName: 'Others',
    exact: true,
    element: <CustomerReceipts />,
  },
  {
    path: '/apps/CustomerStatements',
    key: 'customer_statements',
    parentName: 'Others',
    exact: true,
    element: <StatementOfAccount />,
  },

  // -- sales ends

  //-- service starts

    {
    path: '/service/serviceDashboard',
    key: 'SERVICE',
    parentName: 'Services',
    exact: true,
    element: <ServiceDashboard/>,
  },
    {
    path: '/service/jobCard',
    key: 'SERVICE',
    parentName: 'Inventory',
    exact: true,
    element: <JobCard />,
  },
    {
    path: '/service/newService',
    key: 'SERVICE',
    parentName: 'Services',
    exact: true,
    element: <ServiceMenu/>,
  },
    {
    path: '/service/payment',
    key: 'SERVICE',
    parentName: 'Services',
    exact: true,
    element: <ServicePayment/>,
  },




  // service ends




  {
      path: '/setup',
      key: 'SET_UP',
      parentName: 'User Info',
      exact: true,
      element: <LandingPage/>

  },

{
  path: '/sellerman',
  key: 'SellarMan',
  parentName: 'Sales Man',
  exact: true,
  element: <Salesman />

},
{
  path: '/SalesApproval',
  key: 'Sales_Requests',
  parentName: 'Sales Requests',
  exact: true,
  element: <SalesApprovals />

},
  {
    path: '/payintotal',
    key: 'PAYIN_PAGE',
    parentName: 'Settings',
    exact: true,
    element: <Payin />,
  },
  {
    path: '/customer',
    key: 'CUSTOMER_PAGE',
    parentName: 'Contacts',
    // parentName:'Sales',
    exact: true,
    element: <Customer />,
  },

  {
    path: '/apps/contact/folder/frequent',
    key: 'CUSTOMER_PAGE_FREQUENT',
    parentName: 'Contacts',
    // parentName:'Sales',
    exact: true,
    element: <CustomerList />,
  },
  {
    path: '/apps/contact/folder/starred',
    key: 'CUSTOMER_PAGE_STARED',
    parentName: 'Contacts',
    // parentName:'Sales',
    exact: true,
    element: <CustomerList />,
  },
  {
    path: '/apps/contact/label/crema',
    key: 'CUSTOMER_PAGE_CREMA',
    parentName: 'Contacts',
    // parentName:'Sales',
    exact: true,
    element: <CustomerList />,
  },
  {
    path: '/apps/contact/label/personal',
    key: 'CUSTOMER_PAGE_PERSONAL',
    parentName: 'Contacts',
    // parentName:'Sales',
    exact: true,
    element: <CustomerList />,
  },
  {
    path: '/apps/contact/label/work',
    key: 'CUSTOMER_PAGE_WORK',
    parentName: 'Contacts',
    // parentName:'Sales',
    exact: true,
    element: <CustomerList />,
  },
  {
    path: '/vendor',
    key: 'NEWVENDAR_PAGE',
    exact: true,
    element: <Vendor />,
  },
  {
    path: '/taxCategory',
    key: 'TAXCATEGORY_PAGE',
    parentName: 'Settings',
    exact: true,
    element: <TaxCategory />,
  },
  {
    path: '/taxCustomerCategory',
    key: 'TAXCUSTOMERCATEGORY_PAGE',
    exact: true,
    element: <TaxCustomerCategory />,
  },
  {
    path: '/tax',
    key: 'TAX_PAGE',
    exact: true,
    element: <Tax />,
  },
  {
    path: '/taxJurisdiction',
    key: 'TAX_JURISDICTION_PAGE',
    parentName: 'Settings',
    exact: true,
    element: <TaxJurisdiction />,
  },
  {
    path: '/productCategory',
    key: 'PRODUCTCATEGORY_PAGE',
    exact: true,
    element: <ProductCategory />,
  },
  {
    path: '/InventoryManagementDashboard',
    key: 'INVENTORY_PAGE',
    parentName: 'Inventory',
    exact: true,
    element: <InventoryManagementDashboard />,
  },
  {
    path: '/stockLocation',
    key: 'STOCKLOCATION_PAGE',
    parentName: 'Settings',
    exact: true,
    element: <StockLocation />,
  },

  {
    path: '/PaymentCollectionReport',
    key: 'Payment Collection Report',
    parentName: 'Sales',
    exact: true,
    element: <PaymentReportBasedEmp />,
  },
  {
    path : '/purchaseSummary',
    key: 'purchaseSummary',
    parentName : 'Sales',
    exact : true,
    element : <PurchaseSummary/>
  },
  {
    path : '/salesSummary',
    key: 'salesSummary',
    parentName : 'Sales',
    exact : true,
    element : <SalesSummary/>
  },



  {
    path: '/taxcodes',
    key: 'TAXCODES_PAGE',
    parentName: 'Settings',
    exact: true,
    element: <TaxCodes />,
  },
  {
    path: '/taxrate',
    key: 'TAXRATE_PAGE',
    parentName: 'Settings',
    exact: true,
    element: <TaxRate />,
  },

  {
    path: '/wassup/:id',
    key: 'wassup',
    parentName: 'Leads',
    exact: true,
    element: <AssignTemp />,
  },
  {
    path:  '/wassup/new',
    key: 'wassup',
    parentName: 'Leads',
    exact: true,
    element: <NewTemp />,
  },
  {
    path: '/wassup',
    key: 'wassup',
    parentName: 'Leads',
    exact: true,
    element: <TempList />,
  },
  {
    path: '/offers',
    key: 'Offers',
    parentName: 'Offers',
    exact: true,
    element: <Offers />,
  },
  {
    path: '/ledger',
    key: 'LEDGER_PAGE',
    parentName: 'Accounts',
    exact: true,
    element: <Ledger />,
  },
  {
    path: '/new-reports',
    key: 'NEW_REPORT_PAGE',
    parentName: 'Reports',
    exact: true,
    element: <Reporting />,
  },
  {
    path: '/generated',
    key: 'GENERATED_REPORT_PAGE',
    parentName: 'Reports',
    exact: true,
    element: <GeneratedReports />,
  },
  {
    path: '/schemesManuals',
    key: 'SCHEMS-MANUAL',
    parentName: 'Schemes',
    exact: true,
    element: <ManualSchemes />,
  },


  {
    path: '/posCreation',
    key: 'posCreation',
    parentName: 'Settings',
    exact: true,
    element: <PosCreation />,
  },
  {
    path: '/paymentmethod',
    key: 'paymentMethod',
    parentName: 'Settings',
    exact: true,
    element: <PaymentMethod />,
  },
  {
    path: '/paymentreport',
    key: 'paymentReport',
    parentName: 'Payments',
    exact: true,
    element: <PaymentReceipt />,
  },
  {
    path: '/incentives',
    key: 'incentives',
    parentName: 'Incentives',
    exact: true,
    element: <PaymentReceipt />,
  },
  {
    path: '/salesmanmaindashboard',
    key: 'incentivesdashboard',
    parentName: 'Incentives',
    exact: true,
    element: <SalesManMainDashboard />,
  },
  {
    path: '/cashBox',
    key: 'CashBox',
    parentName: 'Settings',
    exact: true,
    element: <CashBoxCreation />,
  },
  {
    path: '/outstandingmailer',
    parentName: 'Reports',
    key: 'Outstanding',
    exact: true,
    element: <Outstanding />,
  },

  {
    path: '/paymentconsolidated',
    key: 'paymentConsolidated',
    parentName: 'Reports',
    exact: true,
    element: <PaymentConsolidated />,
  },
  {
    path: '/speedometer',
    key: 'Speed',
    parentName: 'Settings',
    exact: true,
    element: <Speedometer />,
  },
  {
    path: '/daySales',
    key: 'DAY_SALES',
    parentName: 'Settings',
    exact: true,
    element: <DaySales />,
  },

  {
    path: '/totalaccpayable',
    key: 'Accounts Payable',
    exact: true,
    element: <BillsRow />,
  },
  {
    path: '/barchart',
    parentName: 'Settings',
    key: 'Bar Chart',
    exact: true,
    element: <Barchart />,
  },
  {
    path: '/expenseanalysis',
    key: 'Expense Analysis',
    parentName: 'Settings',
    exact: true,
    element: <ExpanseAnalysis />,
  },
  {
    path: '/linechart',
    key: 'Chart',
    parentName: 'Settings',
    exact: true,
    element: <Linechart />,
  },
  {
    path: '/profitandloss',
    key: 'Chart',
    parentName: 'Settings',
    exact: true,
    element: <ProfitAndLoss />,
  },
  {
    path: '/categorySummary',
    key: 'Category Summary',
    exact: true,
    element: <CategorySummary />,
  },
  {
    path: '/purchaseTable',
    key: 'Purchase Table',
    exact: true,
    element: <CollapsibleTable />,
  },
  {
    path: '/purchaseCard',
    key: 'Purchase Card',
    exact: true,
    element: <PurchaseCard />,
  },
  {
    path: '/salesChart',
    key: 'Sales Chart',
    exact: true,
    element: <SalesChart />,
  },
  {
    path: '/productbrand',
    key: 'Product Brand',
    exact: true,
    element: <ProductBrand />,
  },
  {
    path: '/productstockable',
    key: 'Product Stockable',
    exact: true,
    element: <ProductStockable />,
  },
  {
    path: '/primarycontact',
    key: 'Primary Contact',
    exact: true,
    element: <PrimaryContact />,
  },
  {
    path: '/posrole',
    key: 'pos',
    exact: true,
    parentName: 'Settings',
    element: <PosRole />,
  },
  {
    path: '/bankcreation',
    key: 'Bank Creation',
    parentName: 'Settings',
    exact: true,
    element: <BankCreation />,
  },
  {
    path: '/discountType',
    key: 'Discount Type',
    parentName: 'Contacts',
    exact: true,
    element: <DiscountType />,
  },
  {
    path: '/usercreation',
    key: 'Users',
    parentName: 'Settings',
    exact: true,
    element: <Usercreation />,
  },
  {
    path: '/settings/userPermissions/:employeeId',
    key: 'Users',
    parentName: 'Settings',
    exact: true,
    element: <UserPermissions />,
  },
  {
    path: '/settings/documentSequences',
    key: 'documentSequences',
    parentName: 'Document Sequences',
    exact: true,
    element: <DocumentSequences />,
  },
  {
    path: '/cashboxAdjustment',
    key: 'CashBox Adjustment',
    parentName: 'Payments',
    exact: true,
    element: <CashBoxAdjustment />,
  },
  {
    path: '/accountpayable',
    key: 'Account Payable',
    parentName: 'Settings',
    exact: true,
    element: <Account />,
  },
  {
    path: '/totacc',
    key: 'Payable Receivable',
    parentName: 'Settings',
    exact: true,
    element: <PayableReceivable />,
  },

  {
    path: '/statementOfAccounts',
    key: 'StatementOfAccounts',
    parentName: 'Contacts',
    exact: true,
    element: <StatementOfAccounts />,
  },
  {
    path: '/StatementDialog',
    key: 'StatementDialog',
    parentName: 'Contacts',
    exact: true,
    element: <StatementDialog />,
  },
  {
    path: '/companyInfo',
    key: 'CompanyInfo',
    parentName: 'Settings',
    exact: true,
    element: <CompanyInfo />,
  },
  {
    path: '/information',
    key: 'Information',
    parentName: 'Settings',
    exact: true,
    element: <Information />,
  },
  {
    path: '/receivableReport',
    key: 'receivableReport',
    parentName: 'Reports',
    exact: true,
    element: <ReceivableReport /> ,
  },
  {
    path: '/payableReport',
    key: 'payableReport',
    parentName: 'Reports',
    exact: true,
    element: <PayableReport /> ,
  },


  {
    path: '/CustomizeThemes',
    key: 'CustomizeThemes',
    parentName: 'Settings',
    exact: true,
    element: <CustomizeThemes />,
  },

  {
    path: '/matchEntries',
    key: 'matchEntries',
    parentName: 'Accounts',
    exact: true,
    element: <MatchEntries/>,
  },
  {
    path: '/bankdetails',
    key: 'bankDetails',
    parentName: 'Accounts',
    exact: true,
    element: <BankDetails/>,
  },
  {
    path: '/matchedRecordPage',
    key: 'matchedRecordPage',
    parentName: 'Accounts',
    exact: true,
    element: <MatchedRecordPage/>,
  },
  {
    path: '/unMatchedRecordPage',
    key: 'unMatchedRecordPage',
    parentName: 'Accounts',
    exact: true,
    element: <UnMatchedRecordPage/>,
  },
  {
    path: '/autoMatch',
    key: 'autoMatch',
    parentName: 'Accounts',
    exact: true,
    element: <AutoMatch/>,
  },
  {
    path: '/brandReport',
    key: 'brandReport',
    parentName: 'Reports',
    exact: true,
    element: <BrandReport />,
  },
  // MIS Report Routes
  { path: '/mis/categoryMargin', key: 'categoryMargin', parentName: 'Reports', exact: true, element: <CategoryMarginReport /> },
  { path: '/mis/salesmanPerf', key: 'salesmanPerf', parentName: 'Reports', exact: true, element: <SalesmanPerfReport /> },
  { path: '/mis/locationPL', key: 'locationPL', parentName: 'Reports', exact: true, element: <LocationPLReport /> },
  { path: '/mis/customerRevenue', key: 'customerRevenue', parentName: 'Reports', exact: true, element: <CustomerRevenueReport /> },
  { path: '/mis/supplierPurchase', key: 'supplierPurchase', parentName: 'Reports', exact: true, element: <SupplierPurchaseReport /> },
  { path: '/mis/dailySalesSummary', key: 'dailySalesSummary', parentName: 'Reports', exact: true, element: <DailySalesSummaryReport /> },
  { path: '/mis/monthlyComparison', key: 'monthlyComparison', parentName: 'Reports', exact: true, element: <MonthlyComparisonReport /> },
  { path: '/mis/paymentMode', key: 'paymentMode', parentName: 'Reports', exact: true, element: <PaymentModeReport /> },
  { path: '/mis/inventoryTurnover', key: 'inventoryTurnover', parentName: 'Reports', exact: true, element: <InventoryTurnoverReport /> },
  { path: '/mis/taxSummary', key: 'taxSummary', parentName: 'Reports', exact: true, element: <TaxSummaryReport /> },
  { path: '/mis/cccDashboard', key: 'cccDashboard', parentName: 'Reports', exact: true, element: <CCCDashboardReport /> },
  { path: '/mis/dailyNetProfit', key: 'dailyNetProfit', parentName: 'Reports', exact: true, element: <DailyNetProfitReport /> },
  { path: '/mis/profitLeakage', key: 'profitLeakage', parentName: 'Reports', exact: true, element: <ProfitLeakageReport /> },
  { path: '/mis/dataQuality', key: 'dataQuality', parentName: 'Reports', exact: true, element: <DataQualityReport /> },
  { path: '/mis/cashFlow', key: 'cashFlow', parentName: 'Reports', exact: true, element: <CashFlowReport /> },
  { path: '/accounts/generalLedger2', key: 'generalLedger2', parentName: 'Reports', exact: true, element: <GeneralLedgerReport /> },
  { path: '/accounts/ageingSummary', key: 'ageingSummary', parentName: 'Reports', exact: true, element: <AgeingSummaryReport /> },
  { path: '/accounts/groupSummary', key: 'groupSummary', parentName: 'Reports', exact: true, element: <GroupSummaryReport /> },
  { path: '/accounts/cashFlowStatement', key: 'cashFlowStatement', parentName: 'Reports', exact: true, element: <CashFlowStatementReport /> },
  {
    path: '/chequeReport',
    key: 'chequeReport',
    parentName: 'Reports',
    exact: true,
    element: <ChequeReport />
  },


  {
    path: '/NotificationView',
    key: 'notificationView',
    parentName: storage?.company_type === 5 ?  'Requests' : 'Settings',
    exact: true,
    element: <Notification />,
  },
  {
    path: '/unreadPanel',
    key: 'unreadPanel',
    parentName: 'Settings',
    exact: true,
    element: <UnreadPanel />,
  },
  {
    path: '/stockReconcilate/missedItems',
    key: 'missedItems',
    parentName: 'Inventory',
    exact: true,
    element: <StockMissedItems />,
  },

  {
    path: '/payrollDashboard',
    key: 'payrollDashboard',
    parentName: 'Settings',
    exact: true,
    element: <PayrollDashboard />,
  },

  {
    path: '/editview',
    key: 'editview',
    parentName: 'Settings',
    exact: true,
    element: <Editview />,
  },
  {
    path: '/payrollDashboard',
    key: 'payrollDashboard',
    parentName: 'Payroll',
    exact: true,
    element: <PayrollDashboard />,
  },

  {
    path: '/assets/rentalsAndTenants',
    key: 'Rental And Tenants',
    parentName: 'Rental And Tenants',
    exact: true,
    element: <RentalAndTenants />,
  },
  {
    path: '/holidays',
    key: 'holiday',
    parentName: 'Payroll',
    exact: true,
    element: <Holidays />,
  },
  {
    path: '/policy',
    key: 'policy',
    parentName: 'Settings',
    exact: true,
    element: <PayrollPolicy />,
  },
  {
    path: '/advanceSheet',
    key: 'advanceSheet',
    parentName: 'Settings',
    exact: true,
    element: <Advancesheet />,
  },
  {
    path: '/addshift',
    key: 'addshift',
    parentName: 'Payroll',
    exact: true,
    element: <AddShift />,
  },
  {
    path: '/shiftlist',
    key: 'shiftslist',
    parentName: 'Payroll',
    exact: true,
    element: <ShiftList />,
  },
  {
    path: '/posUserDashboard',
    key: 'posUserDashboard',
    parentName: 'Settings',
    exact: true,
    element: <PosUserDashboard/>,
  },
  {
    path: '/historyReport',
    key: 'historyReport',
    parentName: 'Payroll',
    exact: true,
    element: <HistoryReport/>,
  },
  {
    path: '/leaveReport',
    key: 'leaveReport',
    parentName: 'Payroll',
    exact: true,
    element: <LeaveReport />,
  },
  {
    path: '/requestReport',
    key: 'requestReport',
    parentName: 'Payroll',
    exact: true,
    element: <RequestReport/>,
  },
  {
    path: '/workDurationReport',
    key: 'workDurationReport',
    parentName: 'Payroll',
    exact: true,
    element: <WorkDurationReportTest/>,
  },
  {
    path: '/overTimeReport',
    key: 'overTimeReport',
    parentName: 'Payroll',
    exact: true,
    element: <OverTimeReport/>,
  },
  {
    path: '/salaryReport',
    key: 'salaryReport',
    parentName: 'Payroll',
    exact: true,
    element: <SalaryReport/>,
  },
  {
    path: '/salesManDashboard',
    key: 'salesManDashboard',
    parentName: 'Settings',
    exact: true,
    element: <SalesManDashboard/>

  },
  {
    path: '/visitsReport',
    key: 'visitsReport',
    parentName: 'Settings',
    exact: true,
    element: <VisitsReport />
  },
  {
    path: '/invoiceSetup',
    key: 'invoiceSetup',
    parentName: 'Settings',
    exact: true,
    element: <InvoiceSetup/>
  },
  {
    path: '/invoicenew',
    key: 'invoicenew',
    parentName: 'Settings',
    exact: true,
    element: <InvoiceCreate/>
  },
  {
    path: '/commonUpload',
    key: 'commonUpload',
    parentName: 'Settings',
    exact: true,
    element: <CommonUpload/>
  },
  {
    path: '/stockgroup',
    key: 'stockgroup',
    parentName: 'Settings',
    exact: true,
    element: <StockGroup/>
  },
  {
    path: '/errorDashboard',
    key: 'ErrorDashboard',
    parentName: 'Settings',
    exact: true,
    element: <ErrorDashboard/>
  },
  {

    path: '/dataGrid',
    key: 'dataGrid',
    parentName: 'Reports',
    exact: true,
    element: <DataGridTemp />

  },
  {
    path: '/report',
    key: 'Reports',
    parentName: 'Reports',
    exact: true,
    element: <ReportsPage />
  },








  // {
  //   path: '/LateInEarlyOut',
  //   key: 'LateInEarlyOut',
  //   parentName: 'Requests',
  //   exact: true,
  //   element: <LateInEarlyOut />,
  // },

  {
    path: '/usercreation',
    key: 'creation',
    parentName: 'Payroll Settings',
    exact: true,
    element: <Usercreation />,
  },
  {
    path: '/stockLocation',
    key: 'creation',
    parentName: 'Payroll Settings',
    exact: true,
    element: <StockLocation />,
  },
  {
    path: '/posrole',
    key: 'creation',
    parentName: 'Payroll Settings',
    exact: true,
    element: <PosRole />,
  },
  {
    path: '/form12',
    key: 'employeeTDS',
    parentName: 'Employee TDS',
    exact: true,
    element: <Form12BB />,
  },
  {
    path: '/TaxReceivable',
    key: 'TaxReceivable',
    parentName: 'Requests',
    exact: true,
    element: <TaxReceivable />,
  },
  {
    path: '/DeletedEmployeeDetails',
    key: '/DeletedEmployeeDetails',
    parentName: 'Requests',
    exact: true,
    element: <DeletedEmployeeDetails />,
  },
  {
    path: '/ProcessIncentive',
    key: 'Process Incentive',
    parentName: 'Process Incentive',
    exact: true,
    element: <ProcessInsentive />,
  },
  {
    path: '/followlist',
    key: 'Follow List',
    parentName: 'Follow List',
    exact: true,
    element: <Followlist />,
  },
  {
    path: '/historyReport',
    key: 'historyReport',
    parentName: 'Requests',
    exact: true,
    element: <HistoryReport/>,
  },

  {
    path: '/migration',
    key: 'migration',
    parentName: 'Settings',
    exact: true,
    element: <Migration />,
  },
  {
    path: '/promotions',
    key: 'posPromotions',
    parentName: 'Point Of Sale',
    exact: true,
    element: <PosPromotions />,
  },
  {
    path: '/approvalRequests',
    key: 'approvalRequests',
    parentName: 'Sales Man',
    exact: true,
    element: <ApprovalRequests />
  },

  {
    path: '/workDurationReportTest',
    key: 'workDurationReportTest',
    parentName: 'Requests',
    exact: true,
    element: <WorkDurationReportTest />,
  },

  {
    path: '/serviceDue',
    key: 'Service Due',
    parentName: 'Renewals',
    exact: true,
    element: <ServiceDueTable />,
  },
  {
    path: '/subscription',
    key: 'Subscription',
    parentName: 'Renewals',
    exact: true,
    element : <Renewals/>
  },
  {
    path: '/filings',
    key: 'Filings',
    parentName: 'Renewals',
    exact: true,
    element: <CompliancesTable />,
  },
  {
    path: '/filings',
    key: 'Custom Renewals',
    parentName: 'Custom Renewals',
    exact: true,
    element: <CompliancesTable />,
  },
  {
    path: '/audits',
    key: 'audits',
    parentName: 'Audits',
    exact: true,
    element: <Audit />,
  },
  {
    path: '/alerts',
    key: 'alerts',
    parentName: 'Alerts',
    exact: true,
    element: <AlertsTable />,
  },
  {
    path: '/auditRequest',
    key: 'auditRequests',
    parentName: 'Audit Request',
    exact: true,
    element: <AuditRequest />,
  },
  {
    path: '/auditChecklist',
    key: 'auditChecklist',
    parentName: 'Audit CheckList',
    exact: true,
    element: <ChecklistTable />,
  },
  {
    path : '/scrapAsset',
    key : 'scrapAsset',
    parentName : 'Assets',
    exact : true,
    element : <ScrapAssetReport />
  },
  {
    path: '/documents',
    key: 'documents',
    parentName: 'Requests',
    exact: true,
    element: <></>,
  },
  {
    path: ['/wassup/:id', '/wassup/new', '/wassup'],
    key: 'wassup',
    parentName: 'Requests',
    exact: true,
    element: <WhatsApp />,
  },
  {
    path: ['/comingSoon/*', '/comingSoon'],
    key: 'Coming Soon',
    parentName: 'Settings',
    exact: true,
    element: <ComingSoon />,
  },
  {
    path: '/barCodeQrGenerator',
    key: 'barCodeQrGenerator',
    parentName: 'Settings',
    exact: true,
    element: <BarCodeGenerator />,
  },
  {
    path: '/posApprovals',
    key: 'posApprovals',
    parentName: 'Approvals',
    exact: true,
    element: <QuotationApprovals />
  },
  {
    path: '/posApprovals',
    key: 'posApprovals',
    parentName: 'Approvals',
    exact: true,
    element: <QuotationApprovals />
  },
  {
    path: '/deletedLog',
    key: 'deletedLog',
    parentName: 'Utilities',
    exact: true,
    element: <DeletedLoggedDetails />
  },
  {
    path : '/invoices',
    key : 'Invoices',
    parentName : 'Menus',
    exact : true,
    element : <CustomerInvoice/>
  },
  {
    path : '/quotations',
    key : 'quotation',
    parentName : 'Menus',
    exact : true,
    element : <CustomerQuotes/>
  },
  {
    path : '/CreditNote',
    key : 'CreditNote',
    parentName : 'Menus',
    exact : true,
    element : <CustomerCreditNote/>
  },
  {
    path : '/SalesOrder',
    key : 'SalesOrder',
    parentName : 'Menus',
    exact : true,
    element : <CustomerSalesOrder/>
  }
  ,
  {
    path : '/Payments',
    key : 'SalesOrder',
    parentName : 'Menus',
    exact : true,
    element : <Customerpayment/>
  }
  ,
  {
    path : '/deliveryChallan',
    key : 'DeliveryChallan',
    parentName : 'Menus',
    exact : true,
    element : <CustomerDeliveryChallan/>
  },


  // ---- Missing routes (DB-driven navigation) ----
  { path: '/activity', key: 'activity', parentName: 'Activity', exact: true, element: <Activity /> },
  { path: '/message', key: 'message', parentName: 'Message', exact: true, element: <MessagePage /> },
  { path: '/faceAttendance', key: 'faceAttendance', parentName: 'Face Attendance', exact: true, element: <FaceAttendance /> },
  { path: '/UserErrLog', key: 'errorDashboardUser', parentName: 'Error Dashboard User', exact: true, element: <ErrordashBoardUser /> },
  { path: '/leadAccounts', key: 'leadAccounts', parentName: 'Lead Accounts', exact: true, element: <LeadAccounts /> },
  { path: '/salesRequests', key: 'salesRequests', parentName: 'Sales Requests', exact: true, element: <SalesRequests /> },
  { path: '/manualNotes', key: 'manualNotes', parentName: 'Credit / Debit Notes', exact: true, element: <ManualNotes /> },
  { path: '/companyLoans', key: 'companyLoans', parentName: 'Company Loans', exact: true, element: <ManualNotes /> },
  { path: '/DeviceRegisterReport', key: 'deviceRegisterReport', parentName: 'Device Register Report', exact: true, element: <DeviceRegisterReport /> },
  { path: '/purchaseReport', key: 'purchaseReport', parentName: 'Purchase Report', exact: true, element: <PurchaseReport /> },
  { path: '/preOrderReport', key: 'preOrderReport', parentName: 'Pre Orders', exact: true, element: <PreOrderReport /> },
  { path: '/processSalary', key: 'processSalary', parentName: 'Process Salary', exact: true, element: <ProcessSalary /> },
  { path: '/salesmancollections', key: 'salesmanCollections', parentName: 'SalesMan Collections', exact: true, element: <SalesmanList /> },
  { path: '/SalesmanList', key: 'salesmanList', parentName: 'SalesMan List', exact: true, element: <SalesmanList /> },
  { path: '/payroll/PfReport', key: 'pfReport', parentName: 'PF Report', exact: true, element: <PfReport /> },
  { path: '/payroll/SalaryStatement', key: 'salaryStatement', parentName: 'Salary Structure Report', exact: true, element: <SalaryStatement /> },
  { path: '/assets/scrapAsset', key: 'scrapAsset', parentName: 'Scrap Asset Report', exact: true, element: <ScrapAssetReport /> },
  { path: '/accounts/accounts', key: 'accounts', parentName: 'Accounts', exact: true, element: <ManualNotes /> },
  { path: '/accounts/paymentreport', key: 'accountsPaymentReport', parentName: 'Payment Report', exact: true, element: <PaymentConsolidated /> },
  { path: '/accounts/payments', key: 'accountsPayments', parentName: 'Payments', exact: true, element: <ManualNotes /> },
  { path: '/sales/incentives', key: 'incentives', parentName: 'Incentives', exact: true, element: <SalesmanIncentive /> },
  { path: '/sales/scheme', key: 'scheme', parentName: 'Scheme', exact: true, element: <ManualNotes /> },
  { path: '/sales/purchases', key: 'purchases', parentName: 'Purchases', exact: true, element: <ManualNotes /> },
  { path: '/service', key: 'service', parentName: 'Service', exact: true, element: <ManualNotes /> },
];

// const allRoutesConfigs = ROUTES.filter(r => modulesname().some(m =>r.parentName === m.module_name) || r.path === '/home')
const allRoutesConfigs = ROUTES;

export {allRoutesConfigs};


