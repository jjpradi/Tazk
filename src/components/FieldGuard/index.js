import React from 'react';
import { useFieldVisibility, useIsFieldVisible } from '../../hooks/useUserRights';

/**
 * FieldGuard: Conditionally renders children based on field visibility config.
 *
 * Usage:
 *   <FieldGuard menuKey="customers" fieldKey="phone_number">
 *     <TextField label="Phone" value={customer.phone} />
 *   </FieldGuard>
 *
 * With read-only support:
 *   <FieldGuard menuKey="customers" fieldKey="salary" renderReadOnly={(children) => <span>{value}</span>}>
 *     <TextField label="Salary" value={emp.salary} onChange={...} />
 *   </FieldGuard>
 */
const FieldGuard = ({ menuKey, fieldKey, children, fallback = null, renderReadOnly }) => {
  const { visible, editable } = useFieldVisibility(menuKey, fieldKey);

  if (!visible) return fallback;

  if (!editable && renderReadOnly) {
    return renderReadOnly(children);
  }

  return children;
};

/**
 * useFieldGuard: Hook version for programmatic field visibility checks.
 *
 * Usage:
 *   const { isVisible, isEditable, guardedColumns } = useFieldGuard('customers');
 *   const columns = guardedColumns(allColumns);
 */
export const useFieldGuard = (menuKey) => {
  const fieldVisibility = require('react-redux').useSelector(
    state => state.NavigationReducer.fieldVisibility
  );

  const menuFields = (fieldVisibility && fieldVisibility[menuKey]) || {};

  const isVisible = (fieldKey) => {
    if (!menuFields[fieldKey]) return true;
    return menuFields[fieldKey].visible !== false;
  };

  const isEditable = (fieldKey) => {
    if (!menuFields[fieldKey]) return true;
    return menuFields[fieldKey].editable !== false;
  };

  /**
   * Filter table columns based on field visibility.
   * Each column must have a `dataIndex` or `fieldKey` property.
   */
  const guardedColumns = (columns) => {
    return columns.filter(col => {
      const key = col.fieldKey || col.dataIndex || col.key;
      return key ? isVisible(key) : true;
    });
  };

  return { isVisible, isEditable, guardedColumns };
};

export default FieldGuard;
