/**
 * Filter MaterialTable columns based on field visibility from Redux store.
 *
 * Usage in class components (via mapStateToProps):
 *   import { filterColumns } from '../../components/FieldGuard/filterColumns';
 *
 *   // In mapStateToProps:
 *   fieldVisibility: state.NavigationReducer.fieldVisibility,
 *
 *   // In render:
 *   const columns = filterColumns(allColumns, this.props.fieldVisibility, 'customers');
 *
 * Each column's `field` property is matched against the visibility config.
 */
export const filterColumns = (columns, fieldVisibility, menuKey) => {
  if (!fieldVisibility || !fieldVisibility[menuKey]) return columns;
  const menuFields = fieldVisibility[menuKey];
  return columns.filter(col => {
    const key = col.fieldKey || col.field;
    if (!key || !menuFields[key]) return true;
    return menuFields[key].visible !== false;
  });
};

/**
 * Check if a specific field is editable.
 */
export const isFieldEditable = (fieldVisibility, menuKey, fieldKey) => {
  if (!fieldVisibility || !fieldVisibility[menuKey] || !fieldVisibility[menuKey][fieldKey]) return true;
  return fieldVisibility[menuKey][fieldKey].editable !== false;
};

/**
 * Check if a specific field is visible.
 */
export const isFieldVisible = (fieldVisibility, menuKey, fieldKey) => {
  if (!fieldVisibility || !fieldVisibility[menuKey] || !fieldVisibility[menuKey][fieldKey]) return true;
  return fieldVisibility[menuKey][fieldKey].visible !== false;
};
