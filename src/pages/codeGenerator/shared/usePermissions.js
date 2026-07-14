import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';

// Menu key seeded for this module — see
// tzk-superadmin/migrations/2026-04-26_codes_menu.sql.
const MENU_KEY = 'point_of_sale__codes';

/**
 * Read RBAC flags for the current user against the Codes menu item.
 *
 * Pattern matches existing app convention (e.g. src/pages/sales/payments/index.js):
 *   - role_name read from sessionStorage
 *   - getMenuAccessAction(roleName) dispatched on first read
 *   - menuAccess in rbacReducer is keyed by roleName (string), not role_id
 */
export default function useCodePermissions() {
  const dispatch = useDispatch();
  const storage = getsessionStorage() || {};
  const roleName = storage.role_name || null;

  const menuAccess = useSelector((s) => s?.rbacReducer?.menuAccess || {});
  const accessRows = roleName ? menuAccess[roleName] : null;

  // Lazy-load this role's rights into rbacReducer.menuAccess if not present.
  useEffect(() => {
    if (roleName && !menuAccess[roleName]) {
      dispatch(getMenuAccessAction(roleName));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleName]);

  return useMemo(() => {
    // Until rights load, allow the UI (BE still enforces) so the page is
    // never bricked at first render.
    if (!accessRows) {
      return { canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true, loaded: false };
    }
    return {
      canView:   UserRightsAuthorization(accessRows, MENU_KEY, 'can_view'),
      canCreate: UserRightsAuthorization(accessRows, MENU_KEY, 'can_create'),
      canEdit:   UserRightsAuthorization(accessRows, MENU_KEY, 'can_edit'),
      canDelete: UserRightsAuthorization(accessRows, MENU_KEY, 'can_delete'),
      canExport: UserRightsAuthorization(accessRows, MENU_KEY, 'can_export'),
      loaded:    true,
    };
  }, [accessRows]);
}
