# Fully Dynamic DB-Driven Menu, Subscription & Permissions System

## Current State Analysis

### Architecture Overview

```
Frontend (tzk-tazk-ui)  →  Gateway (tzk-gat-way)  →  Backend Services
     React + Redux            Simple Proxy              ├─ tzk-userauth (login, JWT)
     MUI Sidebar              No auth logic             ├─ tzk-com-services (menus, subs, roles)
     routesConfig.js                                    └─ other microservices
```

### What's Hardcoded vs DB-Driven Today

| Component | Current State | Location |
|-----------|--------------|----------|
| **Menu structure** | HARDCODED in JS files, dumped as JSON blob into `pos_routes_config.routes_config` | `tzk-com-services/src/api/userRole/routesConfig/*.js` (16 files) + `tzk-userauth/src/api/routesConfig/*.js` (11 files) |
| **Subscription plans** | HARDCODED in JS files, stored as JSON blob in `subscription_plan.plan_details_config` | `tzk-com-services/src/api/subscription/*Subscriptions.js` (8 files) |
| **Module→Subscription mapping** | HARDCODED inside plan JS files via `module_name` property | Same subscription files |
| **Role-based module exclusions** | HARDCODED in `modules.js` | `tzk-com-services/src/api/userRole/routesConfig/modules.js` |
| **User rights config** | HARDCODED in `userRightsConfig.js`, stored as JSON blob in `pos_rights_config.user_rights` | `tzk-com-services/src/api/userRole/routesConfig/userRightsConfig.js` |
| **Company type→menu mapping** | HARDCODED switch/case in `routesConfig/index.js` | Both tzk-userauth and tzk-com-services |
| **Frontend menu rendering** | HARDCODED `routesConfig.js` (1889 lines) as fallback; DB routes feature-gated to specific company types | `tzk-tazk-ui/src/pages/routesConfig.js` |
| **Frontend route protection** | SEMI-DYNAMIC via `routesConfigFromDB[0].allowedRoutes` | `tzk-tazk-ui/src/@crema/core/AppContentView/index.js` |
| **Icons** | HARDCODED icon name→component mapping | `tzk-tazk-ui/src/pages/routesIcons.js` |

### Current Data Flow (3 separate paths, inconsistent)

```
PATH 1 - Login (tzk-userauth):
  Login → hardcoded routesConfig/*.js → filter by subscription_plan.plan_details_config JSON
  → returns modules[] and child_modules[] in login response
  → stored in sessionStorage.login

PATH 2 - Menu fetch (tzk-com-services):
  POST /userRole/getRoutesConfig → query pos_routes_config WHERE company_type + user_role
  → parse routes_config JSON blob → filter by subscription_plan.plan_details_config
  → apply role exclusions from modules.js → return filtered menu tree
  → stored in Redux routesConfigFromDB

PATH 3 - Frontend fallback:
  routesConfig.js hardcoded → filtered by company_type in JS → used when company_type
  not in newRoutesAllowed array or DB fetch fails
```

### Existing DB Tables (relevant)

| Table | Purpose | Records |
|-------|---------|---------|
| `pos_routes_config` | Stores full menu JSON per (company_type, user_role) | ~1090 |
| `pos_rights_config` | Stores user_rights JSON per (company_id, role_id) | ~824 |
| `pos_modules` | Module definitions per company | ~14K |
| `pos_sub_modules` | Sub-module definitions per company | ~5K |
| `pos_roles` | Role definitions per company | ~1.5K |
| `pos_roles_modules` | Role↔Module access mapping | ~58K |
| `pos_roles_sub_modules` | Role↔SubModule access mapping | ~26K |
| `pos_company_types` | Master company types | 13 |
| `pos_subscription` | Company subscription records | ~525 |
| `pos_subscription_modules` | Module availability per subscription tier | ~31 |
| `pos_subscription_menu` | Feature flags per subscription tier | ~4 |
| `subscription_plan` | Plan definitions with JSON config | varies |
| `pos_favourite_menus` | User's favorite/pinned menu items | ~15 |

### Problems with Current Approach

1. **Menu changes require code deployment** across 3 repos (userauth + com-services + frontend)
2. **16 routesConfig files** duplicated between tzk-userauth and tzk-com-services
3. **JSON blobs in DB** (pos_routes_config.routes_config) - not queryable, not relational
4. **Subscription→module mapping buried inside JS** plan files, not independently manageable
5. **Role exclusions hardcoded** in modules.js - adding a new role requires code change
6. **Frontend has 1889-line fallback** routesConfig.js that must stay in sync
7. **No admin UI** to manage menus, modules, or permissions without developer intervention
8. **Icons hardcoded** in routesIcons.js - adding new menu icon requires frontend deploy

---

## Target State: Fully DB-Driven System

### Design Principles
1. **Single source of truth**: All menu/module/permission data lives in DB only
2. **No hardcoded menus**: Zero JS files defining menu structures
3. **Admin-manageable**: Super admin can add/modify/reorder menus, modules, permissions via UI
4. **Backward compatible**: Existing role/module tables (pos_roles_modules, etc.) continue working
5. **Cached**: Frontend fetches once on login, caches in Redux/sessionStorage
6. **Hierarchical**: Support unlimited nesting (menu → submenu → sub-submenu)

### New Architecture

```
                        ┌─────────────────────────────┐
                        │     SUPER ADMIN UI          │
                        │  (Menu Builder / Module Mgr)│
                        └─────────────┬───────────────┘
                                      │ CRUD APIs
                                      ▼
┌──────────┐    ┌──────────┐    ┌─────────────────────┐
│ Frontend │───→│ Gateway  │───→│   tzk-com-services  │
│ (React)  │    │ (proxy)  │    │                     │
│          │    │          │    │ GET /navigation     │
│ Redux ←──│────│──────────│────│   /bootstrap        │
│ store    │    │          │    │                     │
│          │    │          │    │ Queries:            │
│ Renders  │    │          │    │ sa_menu_items       │
│ sidebar  │    │          │    │ sa_menu_permissions │
│ from     │    │          │    │ sa_subscription_    │
│ Redux    │    │          │    │   modules           │
└──────────┘    └──────────┘    └─────────────────────┘
```

---

## Database Migration

### New Tables

#### 1. `sa_menu_items` - Master menu definition (replaces all routesConfig/*.js files)

```sql
CREATE TABLE `sa_menu_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `parent_id` INT DEFAULT NULL,
  `menu_key` VARCHAR(100) NOT NULL COMMENT 'Unique key e.g. dashboard, sales, inventory_stocks',
  `message_id` VARCHAR(100) NOT NULL COMMENT 'Display label / i18n key e.g. Dashboard, Sales',
  `menu_type` ENUM('group','collapse','item') NOT NULL DEFAULT 'item',
  `icon_name` VARCHAR(100) DEFAULT NULL COMMENT 'Icon identifier e.g. dashboardIcon, salesIcon',
  `url` VARCHAR(255) DEFAULT NULL COMMENT 'Route path e.g. /common/home, /sales/orders',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT 'Display order within parent',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_menu_key` (`menu_key`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_sort` (`parent_id`, `sort_order`),
  CONSTRAINT `fk_menu_parent` FOREIGN KEY (`parent_id`) REFERENCES `sa_menu_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### 2. `sa_menu_company_type` - Which menus appear for which company types

```sql
CREATE TABLE `sa_menu_company_type` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `menu_id` INT NOT NULL,
  `company_type_id` INT NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_menu_company` (`menu_id`, `company_type_id`),
  KEY `idx_company_type` (`company_type_id`),
  CONSTRAINT `fk_mct_menu` FOREIGN KEY (`menu_id`) REFERENCES `sa_menu_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mct_company_type` FOREIGN KEY (`company_type_id`) REFERENCES `pos_company_types` (`company_type_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### 3. `sa_menu_subscription` - Which menus are available per subscription plan

```sql
CREATE TABLE `sa_menu_subscription` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `menu_id` INT NOT NULL,
  `company_type_id` INT NOT NULL,
  `subscription_tier` INT NOT NULL COMMENT '1=Basic, 2=Standard, 3=Pro, 4=Enterprise (matches subscription_type)',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_menu_sub` (`menu_id`, `company_type_id`, `subscription_tier`),
  KEY `idx_company_sub` (`company_type_id`, `subscription_tier`),
  CONSTRAINT `fk_ms_menu` FOREIGN KEY (`menu_id`) REFERENCES `sa_menu_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ms_company_type` FOREIGN KEY (`company_type_id`) REFERENCES `pos_company_types` (`company_type_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### 4. `sa_menu_role_access` - Which menus are visible per role (replaces modules.js exclusions and routesConfig role filtering)

```sql
CREATE TABLE `sa_menu_role_access` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `menu_id` INT NOT NULL,
  `company_type_id` INT NOT NULL,
  `role_name` VARCHAR(100) NOT NULL COMMENT 'e.g. Administrator, Employee, Manager',
  `is_visible` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=show, 0=hide',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_menu_role` (`menu_id`, `company_type_id`, `role_name`),
  KEY `idx_role_lookup` (`company_type_id`, `role_name`),
  CONSTRAINT `fk_mra_menu` FOREIGN KEY (`menu_id`) REFERENCES `sa_menu_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mra_company_type` FOREIGN KEY (`company_type_id`) REFERENCES `pos_company_types` (`company_type_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### 5. `sa_user_rights_master` - Master list of all possible user rights (replaces userRightsConfig.js)

```sql
CREATE TABLE `sa_user_rights_master` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `menu_id` INT DEFAULT NULL COMMENT 'Links right to a menu item',
  `right_key` VARCHAR(100) NOT NULL COMMENT 'e.g. ContactAdd, SalaryStructure, StockView',
  `right_label` VARCHAR(255) NOT NULL COMMENT 'Display name',
  `right_group` VARCHAR(100) NOT NULL COMMENT 'Grouping e.g. Contacts, Salary, Inventory',
  `company_type_id` INT NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_right_key_company` (`right_key`, `company_type_id`),
  KEY `idx_menu` (`menu_id`),
  CONSTRAINT `fk_urm_menu` FOREIGN KEY (`menu_id`) REFERENCES `sa_menu_items` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_urm_company_type` FOREIGN KEY (`company_type_id`) REFERENCES `pos_company_types` (`company_type_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

#### 6. `sa_role_rights_default` - Default right values per role (replaces pos_routes_config.user_rights JSON)

```sql
CREATE TABLE `sa_role_rights_default` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `right_id` INT NOT NULL,
  `company_type_id` INT NOT NULL,
  `role_name` VARCHAR(100) NOT NULL,
  `default_value` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=granted, 0=denied',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_right_role` (`right_id`, `company_type_id`, `role_name`),
  CONSTRAINT `fk_rrd_right` FOREIGN KEY (`right_id`) REFERENCES `sa_user_rights_master` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rrd_company_type` FOREIGN KEY (`company_type_id`) REFERENCES `pos_company_types` (`company_type_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### Tables NOT Changed (keep working as-is)

| Table | Reason |
|-------|--------|
| `pos_modules` | Per-company module instances - still needed for company-level toggling |
| `pos_sub_modules` | Per-company sub-module instances |
| `pos_roles` | Per-company role definitions |
| `pos_roles_modules` | Per-company role↔module access (used for per-company overrides) |
| `pos_roles_sub_modules` | Per-company role↔sub-module access |
| `pos_user_roles` | User↔role assignments |
| `pos_user_roles_location` | Location-based access |
| `pos_rights_config` | Per-company custom rights overrides (falls back to sa_role_rights_default) |
| `pos_subscription` | Company subscription status |
| `pos_favourite_menus` | User bookmarks |

### Migration Relationship Diagram

```
sa_menu_items (master menu tree)
    │
    ├──→ sa_menu_company_type (which company types see this menu)
    │        └── FK → pos_company_types
    │
    ├──→ sa_menu_subscription (which subscription tiers include this menu)
    │        └── FK → pos_company_types
    │
    ├──→ sa_menu_role_access (which roles can see this menu)
    │        └── FK → pos_company_types
    │
    └──→ sa_user_rights_master (granular permissions linked to menu)
             │
             └──→ sa_role_rights_default (default permission values per role)

Existing tables (per-company overrides):
    pos_roles_modules (company-level module toggle)
    pos_rights_config (company-level rights override)
```

---

## Implementation Plan

### Phase 1: DB Schema + Data Migration (Backend)

**Repo: tzk-com-services**

#### Step 1.1: Create migration SQL
- Create all 6 new `sa_*` tables
- Populate `sa_menu_items` by parsing existing routesConfig/*.js files
- Populate `sa_menu_company_type` from the company_type→config mappings in routesConfig/index.js
- Populate `sa_menu_subscription` from *Subscriptions.js module_name arrays
- Populate `sa_menu_role_access` from modules.js exclusion lists
- Populate `sa_user_rights_master` from userRightsConfig.js
- Populate `sa_role_rights_default` from pos_routes_config.user_rights JSON

#### Step 1.2: Build seed/import script
- `src/api/superadmin/seedMenus.service.js` - Script to extract data from existing JS files and insert into new tables
- Run once to bootstrap all data

### Phase 2: Navigation Bootstrap API (Backend)

**Repo: tzk-com-services**

#### Step 2.1: New endpoint `GET /comservice/api/navigation/bootstrap`

**Request**: No body needed (uses req.user from JWT)
- `req.user.company_type` - company type ID
- `req.user.subscription_type` - subscription tier
- `req.user.role_name` - user role
- `req.user.company_id` - for company-level overrides

**Response**:
```json
{
  "menus": [
    {
      "id": 1,
      "menu_key": "dashboard",
      "message_id": "Dashboard",
      "menu_type": "item",
      "icon_name": "dashboardIcon",
      "url": "/common/home",
      "children": []
    },
    {
      "id": 10,
      "menu_key": "sales",
      "message_id": "Sales",
      "menu_type": "collapse",
      "icon_name": "salesIcon",
      "url": null,
      "children": [
        {
          "id": 11,
          "menu_key": "sales_orders",
          "message_id": "Sales Orders",
          "menu_type": "item",
          "icon_name": null,
          "url": "/sales/orders",
          "children": []
        }
      ]
    }
  ],
  "userRights": {
    "ContactAdd": true,
    "SalaryStructure": false,
    "StockView": true
  },
  "allowedRoutes": ["/common/home", "/sales/orders", "/sales/tracking", ...]
}
```

**SQL Logic** (single optimized query):
```sql
SELECT mi.*
FROM sa_menu_items mi
-- Must be assigned to this company type
INNER JOIN sa_menu_company_type mct
  ON mct.menu_id = mi.id AND mct.company_type_id = ? AND mct.is_active = 1
-- Must be in subscription tier (or higher tier includes lower)
INNER JOIN sa_menu_subscription ms
  ON ms.menu_id = mi.id AND ms.company_type_id = ? AND ms.subscription_tier <= ?
-- Must be visible for this role
LEFT JOIN sa_menu_role_access mra
  ON mra.menu_id = mi.id AND mra.company_type_id = ? AND mra.role_name = ?
WHERE mi.is_active = 1
  AND (mra.id IS NULL OR mra.is_visible = 1)
  -- Also check company-level module toggle
  AND (
    NOT EXISTS (SELECT 1 FROM pos_modules pm WHERE pm.company_id = ? AND pm.module_name = mi.message_id)
    OR EXISTS (
      SELECT 1 FROM pos_modules pm
      INNER JOIN pos_roles_modules prm ON prm.module_id = pm.module_id AND prm.deleted = 0
      INNER JOIN pos_roles pr ON pr.role_id = prm.role_id AND pr.role_name = ?
      WHERE pm.company_id = ? AND pm.module_name = mi.message_id
    )
  )
ORDER BY mi.parent_id, mi.sort_order;
```

Then build tree in application code and extract `allowedRoutes` from all `url` values.

#### Step 2.2: User rights query
```sql
SELECT urm.right_key,
  COALESCE(prc_override.value, rrd.default_value, 1) AS granted
FROM sa_user_rights_master urm
LEFT JOIN sa_role_rights_default rrd
  ON rrd.right_id = urm.id AND rrd.company_type_id = ? AND rrd.role_name = ?
LEFT JOIN (
  -- Company-level override from pos_rights_config JSON (parsed)
  -- This would be a JSON_EXTRACT or application-level merge
) prc_override ON ...
WHERE urm.company_type_id = ? AND urm.is_active = 1;
```

#### Step 2.3: Update login response in tzk-userauth
- Instead of building modules from hardcoded routesConfig files, call com-services `/navigation/bootstrap` internally OR query same DB tables
- Return `modules` and `child_modules` from DB instead of JS files
- Keep response shape identical for backward compatibility

### Phase 3: Frontend Changes (tzk-tazk-ui)

#### Step 3.1: Replace dual menu system with single API call

**File: `src/@crema/core/AppLayout/components/VerticalNav/index.js`**

Current (remove):
```javascript
// REMOVE: feature gate + dual system
let newRoutesAllowed = [5, 7, 2, 9, 10, 3, 11, 4, 12, 6, 8];
if(newRoutesAllowed.includes(storage.company_type)){
  routesConfig = routesConfigModified;
} else {
  routesConfig = routesConfigOld;
}
```

New (replace with):
```javascript
// Single source: always from DB
useEffect(() => {
  dispatch(getNavigationBootstrapAction());
}, []);

const { menus, userRights, allowedRoutes } = useSelector(
  state => state.navigation
);
```

#### Step 3.2: New Redux slice for navigation

**New file: `src/redux/actions/navigation_actions.js`**
```javascript
export const getNavigationBootstrapAction = () => async (dispatch) => {
  const res = await NavigationService.getBootstrap();
  dispatch({ type: NAVIGATION_BOOTSTRAP, payload: res.data });
};
```

**New file: `src/services/navigation_services.js`**
```javascript
export default {
  getBootstrap() {
    return http.get('/comservice/api/navigation/bootstrap');
  }
};
```

**New file: `src/redux/reducers/navigation_reducers.js`**
```javascript
const initialState = {
  menus: [],
  userRights: {},
  allowedRoutes: [],
  loaded: false,
};

export default function(state = initialState, { type, payload }) {
  switch(type) {
    case NAVIGATION_BOOTSTRAP:
      return { ...state, ...payload, loaded: true };
    default:
      return state;
  }
}
```

#### Step 3.3: Update AppContentView route protection

**File: `src/@crema/core/AppContentView/index.js`**

Replace `routesConfigFromDB[0].allowedRoutes` with `navigation.allowedRoutes` from new Redux slice.

#### Step 3.4: Update session/login cookie handling

**File: `src/pages/common/login/cookies.js`**

Remove dependency on `modules` and `child_modules` from login response for menu rendering. Keep them only for backward compatibility if other features use them.

#### Step 3.5: Delete hardcoded files (after migration verified)

Files to delete from `tzk-tazk-ui`:
- `src/pages/routesConfig.js` (1889 lines)
- `src/utils/menu_list.js`

Files to keep (still needed):
- `src/pages/routesIcons.js` (icon mapping - can't avoid this unless icons are served as URLs)

#### Step 3.6: Update VerticalNav menu rendering

Remove all hardcoded role/company_type filters:
```javascript
// REMOVE these blocks:
if (storage.role_name === 'Administrator') { ... }
if (storage.role_name === 'Manager') { ... }
if (storage.role_name === 'Front Desk') { ... }
// Menu already filtered by backend
```

Remove module-based filtering (already done server-side):
```javascript
// REMOVE:
const filtered = newRoutesConfig[0].children.filter(r => {
  if(getModules.some(m => r.messageId === m.module_name)) return true;
  ...
});
```

### Phase 4: Super Admin Management UI

#### Step 4.1: Menu Builder page (new)
- Tree view of `sa_menu_items`
- Drag-and-drop reordering (updates `sort_order`)
- Add/edit/delete menu items
- Toggle company type visibility (checkboxes → `sa_menu_company_type`)
- Toggle subscription tier availability (checkboxes → `sa_menu_subscription`)
- Toggle role visibility (checkboxes → `sa_menu_role_access`)

#### Step 4.2: CRUD APIs for super admin

**Repo: tzk-com-services**

```
POST   /comservice/api/superadmin/menu                    - Create menu item
PUT    /comservice/api/superadmin/menu/:id                 - Update menu item
DELETE /comservice/api/superadmin/menu/:id                 - Delete menu item
PUT    /comservice/api/superadmin/menu/reorder             - Bulk reorder
POST   /comservice/api/superadmin/menu/:id/company-types   - Set company type visibility
POST   /comservice/api/superadmin/menu/:id/subscriptions   - Set subscription tier access
POST   /comservice/api/superadmin/menu/:id/roles           - Set role visibility
GET    /comservice/api/superadmin/menus                    - Get full menu tree (admin view)
GET    /comservice/api/superadmin/rights                   - Get all rights definitions
POST   /comservice/api/superadmin/rights                   - Create right definition
PUT    /comservice/api/superadmin/rights/:id               - Update right
POST   /comservice/api/superadmin/rights/:id/role-defaults - Set default role values
```

### Phase 5: Cleanup

#### Step 5.1: Remove hardcoded files from tzk-com-services
- `src/api/userRole/routesConfig/*.js` (16 files) - replaced by sa_menu_items
- `src/api/userRole/routesConfig/modules.js` - replaced by sa_menu_role_access
- `src/api/userRole/routesConfig/userRightsConfig.js` - replaced by sa_user_rights_master
- `src/api/subscription/*Subscriptions.js` module_name arrays - replaced by sa_menu_subscription

#### Step 5.2: Remove hardcoded files from tzk-userauth
- `src/api/routesConfig/*.js` (11 files) - call com-services API instead
- Simplify login model to not build module trees from JS files

#### Step 5.3: Deprecate old endpoints
- `POST /userRole/getRoutesConfig` → redirect to `/navigation/bootstrap`
- `POST /userRole/insertRoutesConfig` → redirect to super admin CRUD

---

## Migration SQL (Complete)

```sql
-- ============================================================
-- DYNAMIC MENU SYSTEM MIGRATION
-- Run against: main application database
-- ============================================================

-- 1. Master menu items
CREATE TABLE IF NOT EXISTS `sa_menu_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `parent_id` INT DEFAULT NULL,
  `menu_key` VARCHAR(100) NOT NULL,
  `message_id` VARCHAR(100) NOT NULL,
  `menu_type` ENUM('group','collapse','item') NOT NULL DEFAULT 'item',
  `icon_name` VARCHAR(100) DEFAULT NULL,
  `url` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_menu_key` (`menu_key`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_sort` (`parent_id`, `sort_order`),
  CONSTRAINT `fk_menu_parent` FOREIGN KEY (`parent_id`) REFERENCES `sa_menu_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Menu ↔ Company Type mapping
CREATE TABLE IF NOT EXISTS `sa_menu_company_type` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `menu_id` INT NOT NULL,
  `company_type_id` INT NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_menu_company` (`menu_id`, `company_type_id`),
  KEY `idx_company_type` (`company_type_id`),
  CONSTRAINT `fk_mct_menu` FOREIGN KEY (`menu_id`) REFERENCES `sa_menu_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mct_company_type` FOREIGN KEY (`company_type_id`) REFERENCES `pos_company_types` (`company_type_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Menu ↔ Subscription Tier mapping
CREATE TABLE IF NOT EXISTS `sa_menu_subscription` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `menu_id` INT NOT NULL,
  `company_type_id` INT NOT NULL,
  `subscription_tier` INT NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_menu_sub` (`menu_id`, `company_type_id`, `subscription_tier`),
  KEY `idx_company_sub` (`company_type_id`, `subscription_tier`),
  CONSTRAINT `fk_ms_menu` FOREIGN KEY (`menu_id`) REFERENCES `sa_menu_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ms_company_type` FOREIGN KEY (`company_type_id`) REFERENCES `pos_company_types` (`company_type_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Menu ↔ Role visibility
CREATE TABLE IF NOT EXISTS `sa_menu_role_access` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `menu_id` INT NOT NULL,
  `company_type_id` INT NOT NULL,
  `role_name` VARCHAR(100) NOT NULL,
  `is_visible` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_menu_role` (`menu_id`, `company_type_id`, `role_name`),
  KEY `idx_role_lookup` (`company_type_id`, `role_name`),
  CONSTRAINT `fk_mra_menu` FOREIGN KEY (`menu_id`) REFERENCES `sa_menu_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mra_company_type` FOREIGN KEY (`company_type_id`) REFERENCES `pos_company_types` (`company_type_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 5. User rights master definitions
CREATE TABLE IF NOT EXISTS `sa_user_rights_master` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `menu_id` INT DEFAULT NULL,
  `right_key` VARCHAR(100) NOT NULL,
  `right_label` VARCHAR(255) NOT NULL,
  `right_group` VARCHAR(100) NOT NULL,
  `company_type_id` INT NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_right_key_company` (`right_key`, `company_type_id`),
  KEY `idx_menu` (`menu_id`),
  CONSTRAINT `fk_urm_menu` FOREIGN KEY (`menu_id`) REFERENCES `sa_menu_items` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_urm_company_type` FOREIGN KEY (`company_type_id`) REFERENCES `pos_company_types` (`company_type_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 6. Default right values per role
CREATE TABLE IF NOT EXISTS `sa_role_rights_default` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `right_id` INT NOT NULL,
  `company_type_id` INT NOT NULL,
  `role_name` VARCHAR(100) NOT NULL,
  `default_value` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_right_role` (`right_id`, `company_type_id`, `role_name`),
  CONSTRAINT `fk_rrd_right` FOREIGN KEY (`right_id`) REFERENCES `sa_user_rights_master` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rrd_company_type` FOREIGN KEY (`company_type_id`) REFERENCES `pos_company_types` (`company_type_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

---

## Rollout Strategy

### Step 1: Run migration, seed data (no user impact)
### Step 2: Deploy new `/navigation/bootstrap` API alongside existing endpoints
### Step 3: Frontend: switch to new API behind feature flag (test with one company type)
### Step 4: Validate all company types work correctly
### Step 5: Remove feature gate, use new API for all company types
### Step 6: Build super admin UI for ongoing management
### Step 7: Deprecate and remove old hardcoded files from all 3 repos

---

## Files to Create/Modify Summary

### tzk-com-services (Backend)
| Action | File | Purpose |
|--------|------|---------|
| CREATE | `migrations/dynamic_menu_system.sql` | DB migration |
| CREATE | `src/api/navigation/navigation.routes.js` | Bootstrap API routes |
| CREATE | `src/api/navigation/navigation.controller.js` | Bootstrap handler |
| CREATE | `src/api/navigation/navigation.model.js` | DB queries + tree building |
| CREATE | `src/api/navigation/navigation.sql.js` | SQL queries |
| CREATE | `src/api/superadmin/menu.routes.js` | CRUD routes for menu mgmt |
| CREATE | `src/api/superadmin/menu.controller.js` | CRUD handlers |
| CREATE | `src/api/superadmin/menu.model.js` | CRUD logic |
| CREATE | `src/api/superadmin/menu.sql.js` | CRUD SQL |
| CREATE | `src/api/superadmin/seedMenus.service.js` | One-time data migration script |
| MODIFY | `src/routes.js` | Register new routes |

### tzk-userauth (Auth)
| Action | File | Purpose |
|--------|------|---------|
| MODIFY | `src/api/user/user.model.js` | Replace hardcoded module building with DB query or API call |

### tzk-tazk-ui (Frontend)
| Action | File | Purpose |
|--------|------|---------|
| CREATE | `src/services/navigation_services.js` | Bootstrap API call |
| CREATE | `src/redux/actions/navigation_actions.js` | Redux actions |
| CREATE | `src/redux/reducers/navigation_reducers.js` | Redux reducer |
| MODIFY | `src/@crema/core/AppLayout/components/VerticalNav/index.js` | Use new Redux slice, remove hardcoded filters |
| MODIFY | `src/@crema/core/AppContentView/index.js` | Use new allowedRoutes |
| MODIFY | `src/redux/reducers/index.js` | Register new reducer |
| DELETE | `src/pages/routesConfig.js` | No longer needed (after full migration) |
| DELETE | `src/utils/menu_list.js` | No longer needed |

### tzk-gat-way (Gateway)
| Action | File | Purpose |
|--------|------|---------|
| NONE | - | Gateway is just a proxy, no changes needed |
