import React from 'react';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import CommonSearch from 'utils/commonSearch';

const GlobalMaterialTable = ({ 
  columns, 
  data, 
  totalCount, 
  searchVal, 
  cancelSearch, 
  requestSearch, 
  ...rest 
}) => {
  const safeData = Array.isArray(data) || typeof data === 'function' ? data : [];

  return (
    <MaterialTable
      columns={columns}
      data={safeData}
      totalCount={totalCount}
      components={{
        Toolbar: (props) => (
          <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
            <div style={{ width: '100%' }}>
              <MTableToolbar {...props} />
            </div>
            <div>
              <CommonSearch
                searchVal={searchVal}
                cancelSearch={cancelSearch}
                requestSearch={requestSearch}
              />
            </div>
          </div>
        ),
      }}
      {...rest} // Allows passing additional props like options, actions, etc.
    />
  );
};

export default GlobalMaterialTable;
