-- ============================================================================
-- DB-Driven Page Tabs — Settings, Configuration, Contacts
-- INSERT-only migration. No schema changes, no new tables, no new columns.
-- Run manually against the database.
-- ============================================================================

-- ============================================================================
-- 1a. Missing Settings sidebar children (parent_id = 3385)
-- Existing children: 3433-3441 (Company Info, Taxes, Cash Box, Payment Methods,
--   Users, Migration, Themes, Support, Subscriptions)
-- ============================================================================

-- Standardize menu_key values for existing settings children
-- (ensures frontend settingsComponentMap keys match DB values)
UPDATE sa_menu_items SET menu_key = 'settings__company_info',    sort_order = 1  WHERE id = 3433; -- Company Info
UPDATE sa_menu_items SET menu_key = 'settings__taxes_and_gst',   sort_order = 2  WHERE id = 3434; -- Taxes
UPDATE sa_menu_items SET menu_key = 'settings__cash_box',        sort_order = 3  WHERE id = 3435; -- Cash Box
UPDATE sa_menu_items SET menu_key = 'settings__payment_methods', sort_order = 4  WHERE id = 3436; -- Payment Methods
UPDATE sa_menu_items SET menu_key = 'settings__users',           sort_order = 6  WHERE id = 3437; -- Users
-- sort_order 5 = User Roles (new, below)
UPDATE sa_menu_items SET menu_key = 'settings__migration',       sort_order = 7  WHERE id = 3438; -- Migration
UPDATE sa_menu_items SET menu_key = 'settings__themes',          sort_order = 8  WHERE id = 3439; -- Themes
-- sort_order 9  = Barcode Generator (new)
-- sort_order 10 = Templates (new)
-- sort_order 11 = Deleted Log (new)
-- sort_order 12 = Error Dashboard (new)
UPDATE sa_menu_items SET menu_key = 'settings__support',         sort_order = 13 WHERE id = 3440; -- Support
UPDATE sa_menu_items SET menu_key = 'settings__subscriptions',   sort_order = 14 WHERE id = 3441; -- Subscriptions

-- New settings sidebar children
INSERT INTO sa_menu_items (menu_key, message_id, parent_id, menu_type, sort_order, icon_name, url, is_active)
VALUES
  ('settings__user_roles',        'User Roles',        3385, 'item', 5,  'PersonIcon',           '/settings/user-roles',        1),
  ('settings__barcode_generator', 'Barcode Generator', 3385, 'item', 9,  'QrCodeScannerIcon',    '/settings/barcode-generator',  1),
  ('settings__templates',         'Templates',         3385, 'item', 10, 'DescriptionIcon',      '/settings/templates',          1),
  ('settings__deleted_log',       'Deleted Log',       3385, 'item', 11, 'DeleteOutlineIcon',    '/settings/deleted-log',        1),
  ('settings__error_dashboard',   'Error Dashboard',   3385, 'item', 12, 'BugReportIcon',        '/settings/error-dashboard',    1);


-- ============================================================================
-- 1b. Configuration sidebar children (parent_id = 3384)
-- ============================================================================

INSERT INTO sa_menu_items (menu_key, message_id, parent_id, menu_type, sort_order, icon_name, url, is_active)
VALUES
  ('config__general',            'General',                      3384, 'item', 1,  'DisplaySettingsOutlinedIcon',  '/configuration/general',            1),
  ('config__preferences',        'Preferences',                  3384, 'item', 2,  'SettingsIcon',                 '/configuration/preferences',        1),
  ('config__payroll',            'Payroll',                      3384, 'item', 3,  'ReceiptOutlinedIcon',          '/configuration/payroll',            1),
  ('config__epf',                'EPF Settings',                 3384, 'item', 4,  'GavelIcon',                    '/configuration/epf',                1),
  ('config__esi',                'ESI Settings',                 3384, 'item', 5,  'HealthAndSafetyIcon',          '/configuration/esi',                1),
  ('config__pt',                 'PT Settings',                  3384, 'item', 6,  'AccountBalanceIcon',           '/configuration/pt',                 1),
  ('config__attendance_policy',  'Attendance Policy',            3384, 'item', 7,  'PlaylistAddCircleIcon',        '/configuration/attendance-policy',   1),
  ('config__leave_policy',       'Leave Policy',                 3384, 'item', 8,  'ViewTimelineIcon',             '/configuration/leave-policy',       1),
  ('config__holidays',           'Holidays & Special Permissions', 3384, 'collapse', 9,  'HouseboatIcon',          '/configuration/holidays',           1),
  ('config__approvals',          'Approvals',                    3384, 'item', 10, 'RequestPageIcon',              '/configuration/approvals',          1),
  ('config__fraud_logs',         'Fraud Logs',                   3384, 'item', 11, 'RadarIcon',                    '/configuration/fraud-logs',         1),
  ('config__device_register',    'Device Register Logs',         3384, 'item', 12, 'AppRegistrationIcon',          '/configuration/device-register',    1),
  ('config__custom_fields',      'Custom Fields',                3384, 'item', 13, 'DynamicFormIcon',              '/configuration/custom-fields',      1),
  ('config__sms',                'Sms',                          3384, 'item', 14, 'SmsOutlinedIcon',              '/configuration/sms',                1),
  ('config__mail',               'Mail',                         3384, 'item', 15, 'EmailOutlinedIcon',            '/configuration/mail',               1),
  ('config__whatsapp',           'Whatsapp',                     3384, 'item', 16, 'MapsUgcOutlinedIcon',          '/configuration/whatsapp',           1),
  ('config__reminder',           'Reminder Settings',            3384, 'item', 17, 'NotificationsActiveIcon',      '/configuration/reminder',           1),
  ('config__device_attendance',  'Device  Attendance',           3384, 'item', 18, 'FingerprintIcon',              '/configuration/device-attendance',  1);


-- ============================================================================
-- 1c. Holidays sub-tabs (children of config__holidays)
-- NOTE: Replace @holidays_id with the actual auto-generated ID of config__holidays
-- ============================================================================

-- Get the ID of config__holidays for use as parent_id
SET @holidays_id = (SELECT id FROM sa_menu_items WHERE menu_key = 'config__holidays' LIMIT 1);

INSERT INTO sa_menu_items (menu_key, message_id, parent_id, menu_type, sort_order, icon_name, url, is_active)
VALUES
  ('holidays__list',                'Holidays',            @holidays_id, 'item', 1, NULL, '/configuration/holidays/list',               1),
  ('holidays__special_permissions', 'Special Permissions', @holidays_id, 'item', 2, NULL, '/configuration/holidays/special-permissions', 1);


-- ============================================================================
-- 1d. Info top tabs (children of settings__company_info, parent_id = 3433)
-- ============================================================================

INSERT INTO sa_menu_items (menu_key, message_id, parent_id, menu_type, sort_order, icon_name, url, is_active)
VALUES
  ('info__general',    'General',          3433, 'item', 1, 'PersonIcon',  '/settings/info/general',    1),
  ('info__departments','Departments',      3433, 'item', 2, 'StoreIcon',   '/settings/info/departments',1),
  ('info__locations',  'Locations',        3433, 'item', 3, 'PinDropIcon', '/settings/info/locations',  1),
  ('info__dept_head',  'Departments Head', 3433, 'item', 4, 'StoreIcon',   '/settings/info/dept-head',  1),
  ('info__lov',        'LOV',              3433, 'item', 5, 'StoreIcon',   '/settings/info/lov',        1),
  ('info__front_desk', 'Front Desk',       3433, 'item', 6, 'StoreIcon',   '/settings/info/front-desk', 1);


-- ============================================================================
-- 1e. Contacts sidebar children (parent_id = 3288)
-- ============================================================================

INSERT INTO sa_menu_items (menu_key, message_id, parent_id, menu_type, sort_order, icon_name, url, is_active)
VALUES
  ('contact__customer',   'Customer',   3288, 'item', 1, NULL, '/apps/contact/folder/customer',   1),
  ('contact__vendor',     'Vendor',     3288, 'item', 2, NULL, '/apps/contact/folder/vendor',     1),
  ('contact__employee',   'Employee',   3288, 'item', 3, NULL, '/apps/contact/folder/employee',   1),
  ('contact__starred',    'Starred',    3288, 'item', 4, NULL, '/apps/contact/folder/starred',    1),
  ('contact__client',     'Client',     3288, 'item', 5, NULL, '/apps/contact/folder/client',     1),
  ('contact__general',    'General',    3288, 'item', 6, NULL, '/apps/contact/folder/general',    1),
  ('contact__individual', 'Individual', 3288, 'item', 7, NULL, '/apps/contact/folder/individual', 1);


-- ============================================================================
-- 1f. Company type mappings (sa_menu_company_type)
-- Assigns each new menu item to the company types it should appear in.
-- Adjust company_type IDs as needed for your environment.
-- ============================================================================

-- Helper: get IDs of newly inserted items
-- Settings children
SET @id_user_roles        = (SELECT id FROM sa_menu_items WHERE menu_key = 'settings__user_roles' LIMIT 1);
SET @id_barcode_gen       = (SELECT id FROM sa_menu_items WHERE menu_key = 'settings__barcode_generator' LIMIT 1);
SET @id_templates         = (SELECT id FROM sa_menu_items WHERE menu_key = 'settings__templates' LIMIT 1);
SET @id_deleted_log       = (SELECT id FROM sa_menu_items WHERE menu_key = 'settings__deleted_log' LIMIT 1);
SET @id_error_dashboard   = (SELECT id FROM sa_menu_items WHERE menu_key = 'settings__error_dashboard' LIMIT 1);

-- Configuration children
SET @id_cfg_general       = (SELECT id FROM sa_menu_items WHERE menu_key = 'config__general' LIMIT 1);
SET @id_cfg_preferences   = (SELECT id FROM sa_menu_items WHERE menu_key = 'config__preferences' LIMIT 1);
SET @id_cfg_payroll       = (SELECT id FROM sa_menu_items WHERE menu_key = 'config__payroll' LIMIT 1);
SET @id_cfg_epf           = (SELECT id FROM sa_menu_items WHERE menu_key = 'config__epf' LIMIT 1);
SET @id_cfg_esi           = (SELECT id FROM sa_menu_items WHERE menu_key = 'config__esi' LIMIT 1);
SET @id_cfg_pt            = (SELECT id FROM sa_menu_items WHERE menu_key = 'config__pt' LIMIT 1);
SET @id_cfg_att_policy    = (SELECT id FROM sa_menu_items WHERE menu_key = 'config__attendance_policy' LIMIT 1);
SET @id_cfg_leave_policy  = (SELECT id FROM sa_menu_items WHERE menu_key = 'config__leave_policy' LIMIT 1);
SET @id_cfg_holidays      = (SELECT id FROM sa_menu_items WHERE menu_key = 'config__holidays' LIMIT 1);
SET @id_cfg_approvals     = (SELECT id FROM sa_menu_items WHERE menu_key = 'config__approvals' LIMIT 1);
SET @id_cfg_fraud         = (SELECT id FROM sa_menu_items WHERE menu_key = 'config__fraud_logs' LIMIT 1);
SET @id_cfg_dev_reg       = (SELECT id FROM sa_menu_items WHERE menu_key = 'config__device_register' LIMIT 1);
SET @id_cfg_custom_fields = (SELECT id FROM sa_menu_items WHERE menu_key = 'config__custom_fields' LIMIT 1);
SET @id_cfg_sms           = (SELECT id FROM sa_menu_items WHERE menu_key = 'config__sms' LIMIT 1);
SET @id_cfg_mail          = (SELECT id FROM sa_menu_items WHERE menu_key = 'config__mail' LIMIT 1);
SET @id_cfg_whatsapp      = (SELECT id FROM sa_menu_items WHERE menu_key = 'config__whatsapp' LIMIT 1);
SET @id_cfg_reminder      = (SELECT id FROM sa_menu_items WHERE menu_key = 'config__reminder' LIMIT 1);
SET @id_cfg_device_att    = (SELECT id FROM sa_menu_items WHERE menu_key = 'config__device_attendance' LIMIT 1);

-- Holidays sub-tabs
SET @id_holidays_list     = (SELECT id FROM sa_menu_items WHERE menu_key = 'holidays__list' LIMIT 1);
SET @id_holidays_sp       = (SELECT id FROM sa_menu_items WHERE menu_key = 'holidays__special_permissions' LIMIT 1);

-- Info top tabs
SET @id_info_general      = (SELECT id FROM sa_menu_items WHERE menu_key = 'info__general' LIMIT 1);
SET @id_info_departments  = (SELECT id FROM sa_menu_items WHERE menu_key = 'info__departments' LIMIT 1);
SET @id_info_locations    = (SELECT id FROM sa_menu_items WHERE menu_key = 'info__locations' LIMIT 1);
SET @id_info_dept_head    = (SELECT id FROM sa_menu_items WHERE menu_key = 'info__dept_head' LIMIT 1);
SET @id_info_lov          = (SELECT id FROM sa_menu_items WHERE menu_key = 'info__lov' LIMIT 1);
SET @id_info_front_desk   = (SELECT id FROM sa_menu_items WHERE menu_key = 'info__front_desk' LIMIT 1);

-- Contact children
SET @id_ct_customer       = (SELECT id FROM sa_menu_items WHERE menu_key = 'contact__customer' LIMIT 1);
SET @id_ct_vendor         = (SELECT id FROM sa_menu_items WHERE menu_key = 'contact__vendor' LIMIT 1);
SET @id_ct_employee       = (SELECT id FROM sa_menu_items WHERE menu_key = 'contact__employee' LIMIT 1);
SET @id_ct_starred        = (SELECT id FROM sa_menu_items WHERE menu_key = 'contact__starred' LIMIT 1);
SET @id_ct_client         = (SELECT id FROM sa_menu_items WHERE menu_key = 'contact__client' LIMIT 1);
SET @id_ct_general        = (SELECT id FROM sa_menu_items WHERE menu_key = 'contact__general' LIMIT 1);
SET @id_ct_individual     = (SELECT id FROM sa_menu_items WHERE menu_key = 'contact__individual' LIMIT 1);

-- Settings new children → all company types (same as parent: 2,3,4,5,7,9,10,11,12)
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_user_roles, 2), (@id_user_roles, 3), (@id_user_roles, 4), (@id_user_roles, 5),
  (@id_user_roles, 7), (@id_user_roles, 9), (@id_user_roles, 10), (@id_user_roles, 11), (@id_user_roles, 12),
  (@id_barcode_gen, 2), (@id_barcode_gen, 3), (@id_barcode_gen, 4),
  (@id_templates, 2), (@id_templates, 3), (@id_templates, 4), (@id_templates, 5),
  (@id_templates, 7), (@id_templates, 9), (@id_templates, 10), (@id_templates, 11), (@id_templates, 12),
  (@id_deleted_log, 2), (@id_deleted_log, 3), (@id_deleted_log, 4), (@id_deleted_log, 5),
  (@id_deleted_log, 7), (@id_deleted_log, 9), (@id_deleted_log, 10), (@id_deleted_log, 11), (@id_deleted_log, 12),
  (@id_error_dashboard, 2), (@id_error_dashboard, 3), (@id_error_dashboard, 4), (@id_error_dashboard, 5),
  (@id_error_dashboard, 7), (@id_error_dashboard, 9), (@id_error_dashboard, 10), (@id_error_dashboard, 11), (@id_error_dashboard, 12);

-- Configuration children company types
-- General → all company types
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_cfg_general, 2), (@id_cfg_general, 3), (@id_cfg_general, 4), (@id_cfg_general, 5),
  (@id_cfg_general, 7), (@id_cfg_general, 9), (@id_cfg_general, 10), (@id_cfg_general, 11), (@id_cfg_general, 12);

-- Preferences → all
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_cfg_preferences, 2), (@id_cfg_preferences, 3), (@id_cfg_preferences, 4), (@id_cfg_preferences, 5),
  (@id_cfg_preferences, 7), (@id_cfg_preferences, 9), (@id_cfg_preferences, 10), (@id_cfg_preferences, 11), (@id_cfg_preferences, 12);

-- Payroll → company types 2, 3, 5 (not asset/hospital/etc)
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_cfg_payroll, 2), (@id_cfg_payroll, 3), (@id_cfg_payroll, 5);

-- EPF, ESI, PT → same as payroll
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_cfg_epf, 2), (@id_cfg_epf, 3), (@id_cfg_epf, 5),
  (@id_cfg_esi, 2), (@id_cfg_esi, 3), (@id_cfg_esi, 5),
  (@id_cfg_pt, 2), (@id_cfg_pt, 3), (@id_cfg_pt, 5);

-- Attendance Policy → all
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_cfg_att_policy, 2), (@id_cfg_att_policy, 3), (@id_cfg_att_policy, 4), (@id_cfg_att_policy, 5),
  (@id_cfg_att_policy, 7), (@id_cfg_att_policy, 9), (@id_cfg_att_policy, 10), (@id_cfg_att_policy, 11), (@id_cfg_att_policy, 12);

-- Leave Policy → all
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_cfg_leave_policy, 2), (@id_cfg_leave_policy, 3), (@id_cfg_leave_policy, 4), (@id_cfg_leave_policy, 5),
  (@id_cfg_leave_policy, 7), (@id_cfg_leave_policy, 9), (@id_cfg_leave_policy, 10), (@id_cfg_leave_policy, 11), (@id_cfg_leave_policy, 12);

-- Holidays → all
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_cfg_holidays, 2), (@id_cfg_holidays, 3), (@id_cfg_holidays, 4), (@id_cfg_holidays, 5),
  (@id_cfg_holidays, 7), (@id_cfg_holidays, 9), (@id_cfg_holidays, 10), (@id_cfg_holidays, 11), (@id_cfg_holidays, 12);

-- Holidays sub-tabs → all (inherit from parent)
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_holidays_list, 2), (@id_holidays_list, 3), (@id_holidays_list, 4), (@id_holidays_list, 5),
  (@id_holidays_list, 7), (@id_holidays_list, 9), (@id_holidays_list, 10), (@id_holidays_list, 11), (@id_holidays_list, 12),
  (@id_holidays_sp, 2), (@id_holidays_sp, 3), (@id_holidays_sp, 4), (@id_holidays_sp, 5),
  (@id_holidays_sp, 7), (@id_holidays_sp, 9), (@id_holidays_sp, 10), (@id_holidays_sp, 11), (@id_holidays_sp, 12);

-- Approvals → all
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_cfg_approvals, 2), (@id_cfg_approvals, 3), (@id_cfg_approvals, 4), (@id_cfg_approvals, 5),
  (@id_cfg_approvals, 7), (@id_cfg_approvals, 9), (@id_cfg_approvals, 10), (@id_cfg_approvals, 11), (@id_cfg_approvals, 12);

-- Fraud Logs → payroll types
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_cfg_fraud, 2), (@id_cfg_fraud, 3), (@id_cfg_fraud, 5);

-- Device Register → payroll types
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_cfg_dev_reg, 2), (@id_cfg_dev_reg, 3), (@id_cfg_dev_reg, 5);

-- Custom Fields → all
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_cfg_custom_fields, 2), (@id_cfg_custom_fields, 3), (@id_cfg_custom_fields, 4), (@id_cfg_custom_fields, 5),
  (@id_cfg_custom_fields, 7), (@id_cfg_custom_fields, 9), (@id_cfg_custom_fields, 10), (@id_cfg_custom_fields, 11), (@id_cfg_custom_fields, 12);

-- SMS → all
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_cfg_sms, 2), (@id_cfg_sms, 3), (@id_cfg_sms, 4), (@id_cfg_sms, 5),
  (@id_cfg_sms, 7), (@id_cfg_sms, 9), (@id_cfg_sms, 10), (@id_cfg_sms, 11), (@id_cfg_sms, 12);

-- Mail → all
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_cfg_mail, 2), (@id_cfg_mail, 3), (@id_cfg_mail, 4), (@id_cfg_mail, 5),
  (@id_cfg_mail, 7), (@id_cfg_mail, 9), (@id_cfg_mail, 10), (@id_cfg_mail, 11), (@id_cfg_mail, 12);

-- Whatsapp → all
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_cfg_whatsapp, 2), (@id_cfg_whatsapp, 3), (@id_cfg_whatsapp, 4), (@id_cfg_whatsapp, 5),
  (@id_cfg_whatsapp, 7), (@id_cfg_whatsapp, 9), (@id_cfg_whatsapp, 10), (@id_cfg_whatsapp, 11), (@id_cfg_whatsapp, 12);

-- Reminder → all
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_cfg_reminder, 2), (@id_cfg_reminder, 3), (@id_cfg_reminder, 4), (@id_cfg_reminder, 5),
  (@id_cfg_reminder, 7), (@id_cfg_reminder, 9), (@id_cfg_reminder, 10), (@id_cfg_reminder, 11), (@id_cfg_reminder, 12);

-- Device Attendance → all
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_cfg_device_att, 2), (@id_cfg_device_att, 3), (@id_cfg_device_att, 4), (@id_cfg_device_att, 5),
  (@id_cfg_device_att, 7), (@id_cfg_device_att, 9), (@id_cfg_device_att, 10), (@id_cfg_device_att, 11), (@id_cfg_device_att, 12);

-- Info top tabs
-- General → all company types
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_info_general, 2), (@id_info_general, 3), (@id_info_general, 4), (@id_info_general, 5),
  (@id_info_general, 7), (@id_info_general, 9), (@id_info_general, 10), (@id_info_general, 11), (@id_info_general, 12);

-- Departments → all except company type 12
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_info_departments, 2), (@id_info_departments, 3), (@id_info_departments, 4), (@id_info_departments, 5),
  (@id_info_departments, 7), (@id_info_departments, 9), (@id_info_departments, 10), (@id_info_departments, 11);

-- Locations → all except company type 10
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_info_locations, 2), (@id_info_locations, 3), (@id_info_locations, 4), (@id_info_locations, 5),
  (@id_info_locations, 7), (@id_info_locations, 9), (@id_info_locations, 11), (@id_info_locations, 12);

-- Departments Head → all except company types 10, 12
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_info_dept_head, 2), (@id_info_dept_head, 3), (@id_info_dept_head, 4), (@id_info_dept_head, 5),
  (@id_info_dept_head, 7), (@id_info_dept_head, 9), (@id_info_dept_head, 11);

-- LOV → all company types
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_info_lov, 2), (@id_info_lov, 3), (@id_info_lov, 4), (@id_info_lov, 5),
  (@id_info_lov, 7), (@id_info_lov, 9), (@id_info_lov, 10), (@id_info_lov, 11), (@id_info_lov, 12);

-- Front Desk → all company types
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_info_front_desk, 2), (@id_info_front_desk, 3), (@id_info_front_desk, 4), (@id_info_front_desk, 5),
  (@id_info_front_desk, 7), (@id_info_front_desk, 9), (@id_info_front_desk, 10), (@id_info_front_desk, 11), (@id_info_front_desk, 12);

-- Contact children
-- Customer → company types 2, 3, 4, 7
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_ct_customer, 2), (@id_ct_customer, 3), (@id_ct_customer, 4), (@id_ct_customer, 7);

-- Vendor → company types 2, 3, 4, 7
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_ct_vendor, 2), (@id_ct_vendor, 3), (@id_ct_vendor, 4), (@id_ct_vendor, 7);

-- Employee → all company types
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_ct_employee, 2), (@id_ct_employee, 3), (@id_ct_employee, 4), (@id_ct_employee, 5),
  (@id_ct_employee, 7), (@id_ct_employee, 9), (@id_ct_employee, 10), (@id_ct_employee, 11), (@id_ct_employee, 12);

-- Starred → sales company types
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_ct_starred, 2), (@id_ct_starred, 3), (@id_ct_starred, 4), (@id_ct_starred, 7), (@id_ct_starred, 10);

-- Client → company type 12 only
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_ct_client, 12);

-- General → asset company type 9
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_ct_general, 9);

-- Individual → company type 2 (when addAcc)
INSERT INTO sa_menu_company_type (menu_id, company_type_id) VALUES
  (@id_ct_individual, 2);


-- ============================================================================
-- 1g. Subscription plan mappings (subscription_plan_menus)
-- Gates items by subscription tier
-- ============================================================================

-- LOV not available on Starter tier (subscription_type = 1)
-- INSERT INTO subscription_plan_menus (menu_item_id, subscription_plan_id) VALUES
--   (@id_info_lov, 2), (@id_info_lov, 3), (@id_info_lov, 4);

-- Front Desk only on tiers 2,3,4
-- INSERT INTO subscription_plan_menus (menu_item_id, subscription_plan_id) VALUES
--   (@id_info_front_desk, 2), (@id_info_front_desk, 3), (@id_info_front_desk, 4);

-- Departments Head not on Starter tier
-- INSERT INTO subscription_plan_menus (menu_item_id, subscription_plan_id) VALUES
--   (@id_info_dept_head, 2), (@id_info_dept_head, 3), (@id_info_dept_head, 4);

-- NOTE: Uncomment and adjust the above once subscription_plan_menus table schema is confirmed.
-- The exact subscription_plan_id values need to be verified against your database.


-- ============================================================================
-- 1h. Role access mappings (sa_menu_role_access)
-- ============================================================================

-- NOTE: Role access mappings should be configured via the MenuBuilder UI
-- after the migration is run. The exact role IDs vary per deployment.
-- Example pattern:
-- INSERT INTO sa_menu_role_access (menu_item_id, role_id) VALUES
--   (@id_cfg_payroll, <administrator_role_id>),
--   (@id_cfg_payroll, <manager_role_id>);


-- ============================================================================
-- Verification queries
-- ============================================================================

-- Check settings children
-- SELECT id, menu_key, message_id, sort_order FROM sa_menu_items WHERE parent_id = 3385 ORDER BY sort_order;

-- Check configuration children
-- SELECT id, menu_key, message_id, sort_order FROM sa_menu_items WHERE parent_id = 3384 ORDER BY sort_order;

-- Check contacts children
-- SELECT id, menu_key, message_id, sort_order FROM sa_menu_items WHERE parent_id = 3288 ORDER BY sort_order;

-- Check info top tabs
-- SELECT id, menu_key, message_id, sort_order FROM sa_menu_items WHERE parent_id = 3433 ORDER BY sort_order;

-- Check holidays sub-tabs
-- SELECT m.id, m.menu_key, m.message_id FROM sa_menu_items m
-- JOIN sa_menu_items p ON m.parent_id = p.id
-- WHERE p.menu_key = 'config__holidays' ORDER BY m.sort_order;
