/**
 * Recursively searches the NavigationReducer.menus tree for a menu item
 * matching the given menuKey (stored as `id` in the bootstrap response).
 *
 * @param {Array} menus - The menus array from NavigationReducer
 * @param {string} menuKey - The menu_key value to search for (e.g. 'settings', 'configuration')
 * @returns {Object|null} The matching menu item, or null if not found
 */
export function findMenuByKey(menus, menuKey) {
  for (const item of menus) {
    if (item.id === menuKey) return item;
    if (item.children) {
      const found = findMenuByKey(item.children, menuKey);
      if (found) return found;
    }
  }
  return null;
}
