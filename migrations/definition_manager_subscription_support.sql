-- ============================================================
-- Definition Manager — Subscription Tier Support Migration
-- Date: 2026-03-19
-- ============================================================
-- This adds subscription_tier gating for widgets and field
-- definitions, matching the pattern used by
-- sa_menu_subscription for menus.
-- Notifications are NOT subscription-gated.
-- ============================================================

-- 1. Ensure master tables have the right columns
-- (These tables should already exist from the initial RoleManager setup)

-- sa_dashboard_widgets: add is_active if missing
ALTER TABLE sa_dashboard_widgets
  ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1;

-- sa_notification_types: add is_active if missing
ALTER TABLE sa_notification_types
  ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1;

-- sa_field_definitions: add is_active if missing
ALTER TABLE sa_field_definitions
  ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1;


-- 2. Subscription tier mapping tables
-- Pattern: same as sa_menu_subscription
-- subscription_tier = minimum tier required (1-4), higher = more premium

-- Widget → Subscription Tier mapping
CREATE TABLE IF NOT EXISTS sa_widget_subscription (
  id INT AUTO_INCREMENT PRIMARY KEY,
  widget_id INT NOT NULL,
  company_type_id INT NOT NULL,
  subscription_tier INT NOT NULL DEFAULT 1 COMMENT '1=Starter/Basic, 2=Standard, 3=Premium, 4=Enterprise/Ultimate',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_widget_ct (widget_id, company_type_id),
  KEY idx_ct (company_type_id),
  CONSTRAINT fk_ws_widget FOREIGN KEY (widget_id) REFERENCES sa_dashboard_widgets(id) ON DELETE CASCADE,
  CONSTRAINT fk_ws_ct FOREIGN KEY (company_type_id) REFERENCES pos_company_types(company_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Field Definition → Subscription Tier mapping
CREATE TABLE IF NOT EXISTS sa_field_subscription (
  id INT AUTO_INCREMENT PRIMARY KEY,
  field_id INT NOT NULL,
  company_type_id INT NOT NULL,
  subscription_tier INT NOT NULL DEFAULT 1,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_field_ct (field_id, company_type_id),
  KEY idx_ct (company_type_id),
  CONSTRAINT fk_fs_field FOREIGN KEY (field_id) REFERENCES sa_field_definitions(id) ON DELETE CASCADE,
  CONSTRAINT fk_fs_ct FOREIGN KEY (company_type_id) REFERENCES pos_company_types(company_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 3. Default data: set all existing widgets/fields to tier 1 (available to all plans)
-- Run AFTER the tables above are created

INSERT IGNORE INTO sa_widget_subscription (widget_id, company_type_id, subscription_tier)
SELECT id, company_type_id, 1 FROM sa_dashboard_widgets WHERE is_active = 1;

INSERT IGNORE INTO sa_field_subscription (field_id, company_type_id, subscription_tier)
SELECT id, company_type_id, 1 FROM sa_field_definitions WHERE is_active = 1;
