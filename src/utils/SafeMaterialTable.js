import React from 'react';
import MaterialTable, * as MaterialTableCore from '@material-table/core';

const isValidMaterialTableData = (data) => Array.isArray(data) || typeof data === 'function';
const isValidMaterialTableColumns = (columns) => Array.isArray(columns);

const SafeMaterialTable = React.forwardRef((props, ref) => {
  const safeProps = props || {};
  const safeData = isValidMaterialTableData(safeProps.data) ? safeProps.data : [];
  const safeColumns = isValidMaterialTableColumns(safeProps.columns)
    ? safeProps.columns.map((column, index) => ({
        ...column,
        // Ensure @material-table/core header keys like `head_${id}` remain unique.
        tableData: {
          ...(column?.tableData || {}),
          // Use a string id namespace to avoid collisions with internally injected columns.
          id: `col_${index}`,
        },
      }))
    : safeProps.columns;

  return <MaterialTable ref={ref} {...safeProps} data={safeData} columns={safeColumns} />;
});

SafeMaterialTable.displayName = 'SafeMaterialTable';

export const MTableToolbar = MaterialTableCore.MTableToolbar;
export const MTablePagination = MaterialTableCore.MTablePagination;
export const MTableAction = MaterialTableCore.MTableAction;
export const MTableBody = MaterialTableCore.MTableBody;
export const MTableHeader = MaterialTableCore.MTableHeader;
export const MTableBodyRow = MaterialTableCore.MTableBodyRow;

export default SafeMaterialTable;
