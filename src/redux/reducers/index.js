import {combineReducers} from 'redux';
import gstItcBlockReasonReducer from './gstItcBlockReason_reducers';
import taxCategoryReducer from './tax_Category_reducers';
import customerReducer from './customer_reducers';
import taxCustomerCategoryReducer from './tax_Customer_Category_reducers';
import taxReducer from './tax_reducers';
import productCategoryReducer from './product_Category_reducers';
import productReducer from './product_reducers';
import inventoryReducer from './inventory_reducers';
import stockLocationReducer from './stock_Location_reducers';
import taxCodeReducer from './taxcode_reducers';
import vendorReducer from './vendor_reducers';
import salesReducer from './sale_reducers';
import purchasesReducer from './purchases_reducers';
import TaxRateReducer from './taxRate_reducers';
import taxjurisdictionReducer from './tax_Jurisdiction_reducers';
import productListReducer from './pos_product_list';
import reportsReducer from './reports_reducers';
import balancesheetReducer from './balancesheet_reducers';
import profitlossReducer from './profitloss_reducers';
import ChartOfAccountsReducer from './chartOfAccounts';
import accountsLedgerReducer from './accountsLedger';
import generalLedgerReducer from './generalLedger';
import transactionReducer from './transaction_reducers';
import posSessionReducer from './pos_session';
import leadsReducer from './leads_reducers';
import schemesReducer from './schemes_reducers';
import alertboxReducer from './alertbox_reducers';
import posCreationReducer from './pos_creation_reducers';
import paymentMethodReducer from './payment_method_reducers';
//import TransReducer from "./trans_reducers";
import CashOutInReducer from './cashOutIn_reducers';
import paymentReceiptReducer from './paymentReceipt_reducers';
import cashBoxReducer from './cashbox_reducers';
import ledgerReducer from './ledger_reducers';
import stockLedgerReducer from './stock_Ledger_reducers';
import stockPosReducer from './stock_Pos_reducers';
import posSaleReducer from './pos_sale_reducers';
import DrawerMenuReducer from './drawerMenu_reducers';
import appConfigReducer from './app_config_reducers';
import soTrackingReducer from './soTracking_reducers';
import attendanceReducer from './attendance_reducers';
import posSalesPaymentsReducer from './posSalesPayments_reducers';
import erpDetailsReducer from './erpDetails_reducers';
import purchaseTableReducer from './purchaseTable_reducers';
import roleReducer from './role_reducers';
import bankCreationReducer from './bank_creation_reducers';
import preOrderReducer from './pre_order_reducers';
import discountTypeReducer from './discountType_reducers';
import UserCreationReducer from './userCreation_reducers';
import TotAccReducer from './totAcc_reducers';
import UserRoleReducer from './userRole_reducers';
import manualNoteReducer from './manual_notes_reducers';
import stockReconcilateReducer from './stockReconcilate_reducers';
import Settings from './Setting';
import Common from './Common';
import ProfitLossDashboardReducer from './profitLossDashboardReducer';
import messageReducer from './message_reducers';
import NotificationReducer from './notification_reducers';
import PayrolldashboardReducers from './payrollDashboard_reducers';
import ConfigurationReducer from './configuration_reducers'
import HolidaysReducers from './holidays_reducers';
import SpecialPermissionReducers from './specialPermission_reducers';
import fuelAllowanceReducer from './fuelAllowance_reducers';
import SalaryReducers from './salary_reducers';
import AdvancesheetReducer from './advancesheet_reducers'
import DashboardRoleReducer from './dashboard_role_readucer'
import ShiftsReducer from './shifts.reducers'
import leaveRequestReducer from './leaveRequest_reducers'
import salesManReducer from './salesMan_reducers';
import VisitsReport from './visits_reducer';
import CompanyReducers from './company_reducers';
import PriceListReducer from './priceList_reducers';
import cashBalance from './cashBalanceReducer';
import contactApp from './ContactApp_reducers';
import   sequencePatternReducer from './sequencePattern_reducer';
import manualSchemesReducer from './manualSchemes_reducers';
import ErrorDashboardReducer from './errorDashboard_reducers';
import ExpenseReducer from './expense_reducers'
import LoanReducer from './loan_reducers';
import AllLoansReducer from './allLoans_reducers';
import chatReducer from './ChatApp';
import SuperAdminReducer from './superAdmin_reducers';
import incentiveReducer from './incentive_reducer';
import LiveLocationReducer from './liveLocation_reducer'
import OfferReducer from './offers_reducers'
import ScrumboardApp from './ScrumboardApp';
import assetManagementReducers from './assetManagement_reducer';
import AlertsReducers from './alerts_reducers';
import AssetReducers from './asset_reducers';
import Audits from './audit_reducers';
import WhatsappReducers from './whatsappReducers';
import DeleteLogReducer from './deleted_log_reducers';
import InsuranceReducers from './insurance_reducers';
import DepartmentHeadReducer from './departmentHead';
import retailServiceReducer from './retail_service_reducer';
import ServiceDueReducers from './serviceDue_reducers';
import NewItemReducers from './newItem_reducers';
import RequestConfigReducer from './requestConfig';
import LeadsTaskReducer from './Leads_task_reducer';
import CallsReducers from './calls.reducers'
import MeetingsReducers from './meetings_reducers'
import leadManagementReducers from './leadManagement_reducers';
import SubscriptionReducer from './subscription_reducers';
import CalenderReducers from './calender_reducers';
import EaseBuzzPaymentReducer from './easeBuzzPayment_reducers';
import FaceRegistrationConfig from './face_registration_reducer';
import TermsConditionsReducers from './termsConditions_reducers';
import quotationReducer from './quotation_reducer'
import CampaignReducers from './campaign_reducers';
import IncometaxReducers from './incometax_reducers';
import compliancesReducers from './compliances_reducers'
import RenewalsReducers from './renewals_reducers'
import ClientSubscriptionReducer from './clientSubscription_reducer';
import defectReducers from './defects_reducers';
import NavigationReducer from './navigation_reducers';
import rbacReducer from './rbac_reducers';
import docTemplateReducer from './docTemplate_reducers';
import cndnReportReducer from './cndn_report_reducers';
import EmployeeProfileReducer from './employeeProfile_reducers';
import OrgStructureReducer from './orgStructure_reducers';
import EmployeeLifecycleReducer from './employeeLifecycle_reducers';
import EssPortalReducer from './essPortal_reducers';
import DocumentManagementReducer from './documentManagement_reducers';
import ExpenseManagementReducer from './expenseManagement_reducers';
import HrPoliciesReducer from './hrPolicies_reducers';
import salesTargetReducer from './salesTarget_reducer';
import PerformanceReducer from './performance_reducers';
import RecruitmentReducer from './recruitment_reducers';
import TrainingReducer from './training_reducers';
import HrAnalyticsReducer from './hrAnalytics_reducers';
import TimelineReducers from './timeline_reducers'
import rechargeReducer from './recharge_reducer';

const appReducer = combineReducers({
  taxCategoryReducer,
  customerReducer,
  taxCustomerCategoryReducer,
  taxReducer,
  productCategoryReducer,
  productReducer,
  salesReducer,
  inventoryReducer,
  stockLocationReducer,
  taxCodeReducer,
  purchasesReducer,
  vendorReducer,
  TaxRateReducer,
  taxjurisdictionReducer,
  productListReducer,
  reportsReducer,
  balancesheetReducer,
  profitlossReducer,
  ChartOfAccountsReducer,
  accountsLedgerReducer,
  generalLedgerReducer,
  transactionReducer,
  posSessionReducer,
  leadsReducer,
  schemesReducer,
  alertboxReducer,
  posCreationReducer,
  paymentMethodReducer,
  //TransReducer,
  CashOutInReducer,
  paymentReceiptReducer,
  cashBoxReducer,
  ledgerReducer,
  stockLedgerReducer,
  stockPosReducer,
  posSaleReducer,
  DrawerMenuReducer,
  appConfigReducer,
  soTrackingReducer,
  attendanceReducer,
  posSalesPaymentsReducer,
  erpDetailsReducer,
  purchaseTableReducer,
  roleReducer,
  bankCreationReducer,
  preOrderReducer,
  discountTypeReducer,
  UserCreationReducer,
  TotAccReducer,
  UserRoleReducer,
  manualNoteReducer,
  stockReconcilateReducer,
  settings: Settings,
  common: Common,
  ProfitLossDashboardReducer,
  messageReducer,
  NotificationReducer,
  ConfigurationReducer,
  HolidaysReducers,
  SpecialPermissionReducers,
  AdvancesheetReducer,
  PayrolldashboardReducers,
  SalaryReducers,
  DashboardRoleReducer,
  ShiftsReducer,
  leaveRequestReducer,
  fuelAllowanceReducer,
  VisitsReport,
  salesManReducer,
  CompanyReducers,
  PriceListReducer,
  cashBalance,
  contactApp,
  sequencePatternReducer,
  manualSchemesReducer,
  ErrorDashboardReducer,
  ExpenseReducer,
  LoanReducer,
  AllLoansReducer,
  chatReducer,
  SuperAdminReducer,
  incentiveReducer,
  LiveLocationReducer,
  OfferReducer,
  scrumboardApp: ScrumboardApp,
  assetManagementReducers,
  AssetReducers,
  AlertsReducers,
  Audits,
  WhatsappReducers,
  DeleteLogReducer,
  InsuranceReducers,
  DepartmentHeadReducer,
  retailServiceReducer,
  ServiceDueReducers,
  NewItemReducers,
  RequestConfigReducer,
  LeadsTaskReducer,
  CallsReducers,
  MeetingsReducers,
  leadManagementReducers,
  SubscriptionReducer,
  CalenderReducers,
  EaseBuzzPaymentReducer,
  FaceRegistrationConfig,
  TermsConditionsReducers,
  quotationReducer,
  CampaignReducers,
  IncometaxReducers,
  compliancesReducers,
  RenewalsReducers,
  ClientSubscriptionReducer,
  defectReducers,
  NavigationReducer,
  rbacReducer,
  docTemplateReducer,
  cndnReportReducer,
  EmployeeProfileReducer,
  OrgStructureReducer,
  EmployeeLifecycleReducer,
  EssPortalReducer,
  DocumentManagementReducer,
  ExpenseManagementReducer,
  HrPoliciesReducer,
  PerformanceReducer,
  RecruitmentReducer,
  TrainingReducer,
  HrAnalyticsReducer,
  salesTargetReducer,
  TimelineReducers,
  rechargeReducer,
  gstItcBlockReasonReducer,
});



export default (state, action) =>
  appReducer(action.type === 'RESET_STORE' ? undefined : state, action);

