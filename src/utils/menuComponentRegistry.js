import React from 'react';

/**
 * Central Menu Component Registry
 *
 * Maps menu_key (from sa_menu_items) → React component for all panel-item pages.
 * Used by Settings, Company Info tabs, and any future panel-item pages.
 *
 * To add a new menu:
 *   1. Add the menu in MenuBuilder (DB)
 *   2. Add the mapping here: 'menu_key': React.lazy(() => import('path/to/component'))
 *   3. No other code changes needed (for Settings and Company Info)
 *
 * For Configuration and Contacts, see their own component maps
 * in configuration/index.js and ContactSideBar/index.js (Phase 2/3 migration).
 */

// ─── Settings sidebar-items ─────────────────────────────────────
export const settingsComponentMap = {
  settings__company_info: React.lazy(() => import('pages/common/information')),
  settings__taxes_and_gst: React.lazy(() => import('pages/sales/taxRate')),
  settings__cash_box: React.lazy(() => import('pages/accounts/cashAndBankInfo')),
  settings__payment_methods: React.lazy(() => import('pages/common/errorPages/ComingSoon')),
  settings__users: React.lazy(() => import('pages/common/Usercreation')),
  settings__user_roles: React.lazy(() => import('pages/common/posrole')),
  settings__migration: React.lazy(() => import('pages/sales/Migration')),
  settings__themes: React.lazy(() => import('pages/common/CustomizeThemes')),
  settings__barcode_generator: React.lazy(() => import('components/BarCodeGenerator')),
  settings__templates: React.lazy(() => import('pages/common/errorPages/ComingSoon')),
  settings__deleted_log: React.lazy(() => import('pages/common/Utilities/DeletedLoggedDetails')),
  settings__error_dashboard: React.lazy(() => import('pages/common/ErrorDashboad')),
  settings__support: React.lazy(() => import('pages/common/errorPages/ComingSoon')),
  settings__subscriptions: React.lazy(() => import('pages/common/CompanySubscription')),
  settings__document_sequences: React.lazy(() => import('pages/settings/DocumentSequences')),
  settings__period_lock: React.lazy(() => import('pages/settings/PeriodLock')),
};

// ─── Company Info tab-items ─────────────────────────────────────
export const infoComponentMap = {
  info__general: React.lazy(() => import('pages/common/CompanyInfo/CompanyInfo')),
  info__departments: React.lazy(() => import('pages/common/departments')),
  info__locations: React.lazy(() => import('pages/common/stockLocation')),
  info__dept_head: React.lazy(() => import('pages/common/DepartmentHead')),
  info__lov: React.lazy(() => import('pages/common/ListOfValues')),
  info__front_desk: React.lazy(() => import('pages/Payroll/frontDesk')),
};

// ─── Configuration sidebar-items ────────────────────────────────
// Maps menu_key → numeric listId used by configuration/index.js onGetMainComponent()
export const configMenuKeyToListId = {
  config__general: 1,
  config__preferences: 12,
  config__payroll: 2,
  config__epf: 13,
  config__esi: 14,
  config__pt: 16,
  config__attendance_policy: 3,
  config__leave_policy: 4,
  config__holidays: 11,
  config__approvals: 5,
  config__fraud_logs: 17,
  config__device_register: 18,
  config__custom_fields: 10,
  config__sms: 6,
  config__mail: 7,
  config__whatsapp: 8,
  config__reminder: 15,
  config__device_attendance: 9,
  config__salary_structure_percentage: 19,
};

export const listIdToConfigMenuKey = Object.fromEntries(
  Object.entries(configMenuKeyToListId).map(([key, id]) => [id, key])
);

// ─── Configuration > Holidays tab-items ─────────────────────────
export const holidaysComponentMap = {
  holidays__list: React.lazy(() => import('pages/Payroll/holiday/index')),
  holidays__special_permissions: React.lazy(() => import('pages/Payroll/SpecialPermission/index')),
};

// ─── Contacts sidebar-items ────────────────────────────────────
// Maps menu_key → contact folder shape used by ContactSideBar
export const contactTabMap = {
  contact__customer:   { type: 0, type_name: 'customer',   alias: 'customer' },
  contact__vendor:     { type: 2, type_name: 'vendor',     alias: 'vendor' },
  contact__employee:   { type: 3, type_name: 'employee',   alias: 'employee' },
  contact__starred:    { type: 0, type_name: 'starred',    alias: 'starred' },
  contact__client:     { type: 5, type_name: 'client',     alias: 'client' },
  contact__general:    { type: 3, type_name: 'general',    alias: 'general' },
  contact__individual: { type: 0, type_name: 'individual', alias: 'individual' },
};
