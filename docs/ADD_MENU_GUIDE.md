# How to Add a New Menu / Submenu

A step-by-step guide for developers to add a new menu item in a running application.

---

## Step 1: Create the Page Component

Create your page file under `src/pages/` following the existing folder structure.

**Example:** `src/pages/sales/proformaInvoice/index.js`

```jsx
import React from 'react';

const ProformaInvoice = () => {
  return (
    <div>
      <h2>Proforma Invoice</h2>
      {/* Your page content */}
    </div>
  );
};

export default ProformaInvoice;
```

---

## Step 2: Add Lazy Import in `allRoutes.js`

Open `src/pages/allRoutes.js` and add a `React.lazy()` import at the top (around lines 15–300) alongside the other lazy imports.

```js
const ProformaInvoice = React.lazy(() => import('../pages/sales/proformaInvoice'));
```

---

## Step 3: Add Route Entry in the ROUTES Array

In the same `allRoutes.js` file, find the `ROUTES` array (starts around line 538) and add a route object.

```js
{
  path: '/sales/proformaInvoice',
  key: 'Proforma Invoice',
  parentName: 'Sales',
  exact: true,
  element: <ProformaInvoice />,
},
```

**Route object properties:**

| Property     | Purpose                                                    |
| ------------ | ---------------------------------------------------------- |
| `path`       | URL path — must exactly match the `url` set in the menu item (Step 5) |
| `key`        | Display name / identifier                                  |
| `parentName` | Parent module name (used for route filtering if enabled)   |
| `exact`      | Always set to `true`                                       |
| `element`    | The lazy-loaded JSX component                              |

---

## Step 4: Add Menu Item via Superadmin UI

1. Login as **Superadmin**
2. Navigate to **Menu Management**
3. Click **Add Menu Item** (or Add Submenu under an existing parent)
4. Fill in:
   - **Title / messageId** — e.g. `sidebar.sales.proformaInvoice`
   - **Type** — `item` (leaf menu) or `collapse` (has children)
   - **URL** — `/sales/proformaInvoice` (must exactly match the `path` in Step 3)
   - **Icon** — MUI icon name, e.g. `ReceiptLongOutlined`
   - **Parent** — select the parent group/collapse (e.g. Sales)
   - **Order** — display position among siblings

> **Critical:** The `url` in the menu item and the `path` in the ROUTES array must be an exact match. A mismatch will cause the sidebar link to navigate to a blank page.

---

## Step 5: Assign to Company Types

In the same Superadmin Menu Management screen:

- Select which **company types** (e.g. Sales, Manufacturing, Service) should see this menu item
- This maps to the `sa_menu_company_type` table
- If not assigned to a company type, companies of that type will never see the menu

---

## Step 6: Assign to Subscription Tiers

Assign the menu item to the relevant **subscription plans**:

- e.g. Free, Basic, Standard, Premium
- This maps to the `sa_menu_subscription` table
- Companies on a plan that doesn't include this menu won't see it

---

## Step 7: Set Role Access

Configure which **roles** can access this menu:

- By default all roles can see the menu
- You can **exclude** specific roles (e.g. hide from Salesman role)
- This maps to the `sa_menu_role_access` table
- There is a 3-tier permission system:
  - **L1** — `sa_role_menu_access` (superadmin-level role defaults)
  - **L2** — `pos_company_role_menu_access` (company-level overrides)
  - **L3** — `pos_user_menu_access` (user-level overrides)
- Each level uses `COALESCE` — the most specific level wins

---

## Step 8: Test

1. Restart the frontend dev server (`npm run dev` or `vite`)
2. Login with a user whose company type, subscription, and role should have access
3. The new menu item should appear in the **sidebar**
4. Clicking it should navigate to your page component

**Troubleshooting:**

| Problem                        | Cause                                                       |
| ------------------------------ | ----------------------------------------------------------- |
| Menu not visible in sidebar    | Company type, subscription, or role access not assigned      |
| Clicking menu shows blank page | `url` in menu item doesn't match `path` in ROUTES array     |
| Page loads but shows nothing   | Component not exporting default, or import path is wrong     |
| 404 or route not found         | Lazy import or ROUTES entry missing in `allRoutes.js`        |

---

## How It Works Under the Hood

```
allRoutes.js (ROUTES array)          Superadmin UI
        |                                  |
        v                                  v
  Frontend routing              sa_menu_items (DB)
  (React Router v6)             sa_menu_company_type
                                sa_menu_subscription
                                sa_menu_role_access
                                        |
                                        v
                              /navigation/bootstrap API
                              (called on login, cached 15 min in Redis)
                                        |
                                        v
                                Redux store (menus)
                                        |
                                        v
                                Sidebar renders menu tree
                                        |
                                        v
                              User clicks menu item
                                        |
                                        v
                              React Router matches path
                              from ROUTES array → renders component
```

---

## Quick Reference

| What                | Where                                            |
| ------------------- | ------------------------------------------------ |
| Page components     | `src/pages/<module>/<feature>/index.js`           |
| Route registration  | `src/pages/allRoutes.js`                          |
| Menu seed configs   | `tzk-com-services/src/api/userRole/routesConfig/` |
| Menu seed script    | `tzk-com-services/src/api/navigation/seedMenus.js`|
| Bootstrap API       | `tzk-com-services/src/api/navigation/bootstrap`   |
| Menu DB tables      | `sa_menu_items`, `sa_menu_company_type`, `sa_menu_subscription`, `sa_menu_role_access` |
