
const ROUTE_PREFIXES = {

  //sales project

  iris: '/salesservice/api/iris',  

  purchase: '/salesservice/api/purchase',
  posSale: '/salesservice/api/posSale',
  posSession: '/salesservice/api/posSession',
  posCreation: '/salesservice/api/posCreation',
  salesReview: '/salesservice/api/salesReview',
  preOrders: '/salesservice/api/preOrders',
  discountType: '/salesservice/api/discountType',
  sales: '/salesservice/api/sales',
  priceList :'/salesservice/api/priceList',
  invoice:'/salesservice/api/invoice',
  quotations:'/salesservice/api/quotations',
  quotation:'/salesservice/api/quotation',
  outstanding_xml:'/salesservice/api/outstanding_xml',
  retailServices:'/salesservice/api/retailServices',
  defects:'/salesservice/api/defects',
  stockPos:'/salesservice/api/stockPos',
  salesMan:'/salesservice/api/salesMan',
  salesTarget:'/salesservice/api/salesTarget',
  recharge:'/salesservice/api/recharge',
  codeGenerator: '/salesservice/api/codeGenerator',


  //accounts project

  transaction:'/accountsservice/api/transaction',
  chartOfAccount:'/accountsservice/api/chartOfAccount',
  accountsLedger:'/accountsservice/api/accountsLedger',
  generalLedger:'/accountsservice/api/generalLedger',
  balanceSheet:'/accountsservice/api/balanceSheet',
  profitLoss:'/accountsservice/api/profitLoss',
  ledger:'/accountsservice/api/ledger',
  stockLedger:'/accountsservice/api/stockLedger',
  accounts:'/accountsservice/api/accounts',
  accountTransaction:'/accountsservice/api/accountTransaction',
  paymentMethod:'/accountsservice/api/paymentMethod',
  cashDenominaation:'/accountsservice/api/cashDenominaation',
  cashBox:'/accountsservice/api/cashBox',
  cashOutIn:'/accountsservice/api/cashOutIn',
  paymentReceipt:'/accountsservice/api/paymentReceipt',
  paymentConsolidated:'/accountsservice/api/paymentConsolidated',
  paymentCollection:'/accountsservice/api/paymentCollection',
  posSalesPayments:'/accountsservice/api/posSalesPayments',
  bankCreation:'/accountsservice/api/bankCreation',
  PosLedgerConfig:'/accountsservice/api/PosLedgerConfig',
  totalAccounts:'/accountsservice/api/totalAccount',
  manualNotes:'/accountsservice/api/manualNotes',
  advanceSheet:'/accountsservice/api/advanceSheet',
  manualSchemes:'/accountsservice/api/manualSchemes',
  sequencePattern:'/accountsservice/api/sequencePattern',
  expense:'/accountsservice/api/expense',
  easeBuzzPayment:'/accountsservice/api/easeBuzzPayment',
  accountsReports:'/accountsservice/api/reports',
  auditDashboard:'/accountsservice/api/audit',
  gstItcBlockReason:'/accountsservice/api/gstItcBlockReason',
  gstReturnPeriod:'/accountsservice/api/gstReturnPeriod',
  gstPayment:'/accountsservice/api/gstPayment',
  gstItcReversal:'/accountsservice/api/gstItcReversal',
  gst2b:'/accountsservice/api/gst2b',
  gstReport:'/accountsservice/api/gstReport',


  //product

  inventory:'/productservice/api/inventory',
  lotItems:'/productservice/api/lotItems',
  offers:'/productservice/api/offers',
  orders:'/productservice/api/orders',
  product:'/productservice/api/product',
  productCategory:'/productservice/api/productCategory',
  stockInHand:'/productservice/api/stockInHand',
  stockReconcilate:'/productservice/api/stockReconcilate',
  tax:'/productservice/api/tax',
  taxCategory:'/productservice/api/taxCategory',
  taxCodes:'/productservice/api/taxCodes',
  taxCustomerCategory:'/productservice/api/taxCustomerCategory',
  taxRates:'/productservice/api/taxRates',
  taxJurisdictions: '/productservice/api/taxJurisdictions',
  schemes:'/productservice/api/schemes',

  //payroll

  attendance:'/payrollservice/api/attendance',
  holidays:'/payrollservice/api/holidays',
  specialPermission:'/payrollservice/api/specialPermission',
  salary:'/payrollservice/api/salary',
  fuelAllowance:'/payrollservice/api/fuelAllowance',
  payrollDashboard:'/payrollservice/api/payrollDashboard',
  shifts:'/payrollservice/api/shifts',
  leaveRequest:'/payrollservice/api/leaveRequest',
  Visits:'/payrollservice/api/Visits',

  manualCheckout:'/payrollservice/api/manualCheckout',
  gpsTracking:'/payrollservice/api/gpsTracking',
  loan:'/payrollservice/api/loan',
  incentive:'/payrollservice/api/incentive',
  allLoans:'/accountsservice/api/allLoans',
  uploadPhoto:'/payrollservice/api/uploadPhoto',
  breaks:'/payrollservice/api/breaks',
  liveTracking:'/payrollservice/api/liveTracking',
  faceRegistration:'/payrollservice/api/faceRegistration',
  incometax:'/payrollservice/api/incometax',
  statutory:'/payrollservice/api/statutory',
  employeeProfile:'/payrollservice/api/employeeProfile',
  orgStructure:'/payrollservice/api/orgStructure',
  employeeLifecycle:'/payrollservice/api/employeeLifecycle',
  essPortal:'/payrollservice/api/essPortal',
  documentManagement:'/payrollservice/api/documentManagement',
  expenseManagement:'/payrollservice/api/expenseManagement',
  hrPolicies:'/payrollservice/api/hrPolicies',
  performance:'/payrollservice/api/performance',
  recruitment:'/payrollservice/api/recruitment',
  training:'/payrollservice/api/training',
  hrAnalytics:'/payrollservice/api/hrAnalytics',

  // communication services

  mail : '/comservice/api/mail',
  notification : '/comservice/api/notification',
  whatsapp : '/comservice/api/whatsapp',
  calender : '/comservice/api/calender',
  chat : '/comservice/api/chat',
  posMessage : '/comservice/api/posMessage',
  stockLocation : '/comservice/api/stockLocation',
  errorDashboard : '/comservice/api/errorDashboard',
  dashboard : '/comservice/api/dashboard',
  role: '/comservice/api/role',
  userRole: '/comservice/api/userRole',
  subscriptionPlans: '/comservice/api/subscriptionPlans',
  Subscription: '/comservice/api/Subscription',
  requestConfig: '/comservice/api/requestConfig',
  userCreation: '/comservice/api/userCreation',
  deletedLogDetails: '/comservice/api/deletedLogDetails',
  configuration: '/comservice/api/configuration',
  companyInfo:'/comservice/api/companyInfo',
  appConfig:'/comservice/api/appConfig',
  company:'/comservice/api/company',
  announcement:'/comservice/api/announcement',
  departmentHead:'/comservice/api/departmentHead',
  department :'/comservice/api/department',
  termsConditions:'/comservice/api/termsConditions',
  customer: '/comservice/api/customer',
  supplier: '/comservice/api/supplier',
  navigation: '/comservice/api/navigation',
  rbac: '/comservice/api/rbac',
  docTemplate: '/comservice/api/docTemplate',
  // superAdmin

  superAdmin: '/superadminservice/api/superAdmin',
  menuAdmin: '/superadminservice/api/menu',
  roleManager: '/superadminservice/api/roleManager',
  subscriptionPlanAdmin: '/superadminservice/api/subscriptionPlan',

  //Leads
  Leads: '/leadsservice/api/Leads',
  leadsManagement: '/leadsservice/api/leadsManagement',
  leadManagement: '/leadsservice/api/leadManagement',
  calls: '/leadsservice/api/calls',
  meetings: '/leadsservice/api/meetings',
  campaign: '/leadsservice/api/campaign',

  // Asset Management

  assets : '/assetservice/api/assets',
  insurance : '/assetservice/api/insurance',
  warranty : '/assetservice/api/warranty',
  serviceDue : '/assetservice/api/serviceDue',
  newItem : '/assetservice/api/newItem',
  renewals : '/assetservice/api/renewals',
  compliances : '/assetservice/api/compliances',
  audits : '/assetservice/api/audits',
  alerts : '/assetservice/api/alerts',
  timeline : '/assetservice/api/timeline',

  // projects

  projects:'/projectService/api/projects',

  //GrowRetail
  ProStorDashboard: '/growretailservice/api/ProStorDashboard',
  ProStorPaymentMethod: '/growretailservice/api/ProStorPaymentMethod',
  grUser: '/growretailservice/api/grUser',
  grProduct: '/growretailservice/api/grProduct',
  locstoProduct: '/growretailservice/api/locstoProduct',
  locstoUser: '/growretailservice/api/locstoUser',

  //Reports
  dailyReportMail: '/reportservice/api/dailyReportMail',
  pivotReports: '/reportservice/api/pivotReports',
  reports: '/reportservice/api/reports',
  marketOutStandings: '/reportservice/api/marketOutStandings',
  reportSchedules:'/reportservice/api/reportSchedules',


  // userauth

  login:'/userauthservice/api/login',
  logout:'/userauthservice/api/logout',
  renewAccessToken:'/userauthservice/api/renewAccessToken',
  forgetPassword:'/userauthservice/api/forgetPassword',
  loginAudit:'/userauthservice/api/loginAudit',


};

export default ROUTE_PREFIXES;
