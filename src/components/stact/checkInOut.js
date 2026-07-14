import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import { Card, IconButton, Tab, Tabs } from '@mui/material';
import React, { useState } from 'react';
import NoRecordFound from 'components/Layout/NoRecordFound';
import useCommonRef from 'pages/common/home/useCommonRef';
import {
  maxBodyHeight,
  maxHeight,
  pageSize,
  headerStyle,
  cellStyle,
} from 'utils/pageSize';
import moment from 'moment';

function CheckInOut(props) {
  const data = props.data
  const [type, setType] = useState('1');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const handleTabChange = (event, newValue) => {
    setType(newValue);
    setPage(0);
  };

  const getColumns = [
    { field: 'shift_name', title: 'Shift Name' },
    { field: 'full_name', title: 'Name' },
    { field: 'status', title: 'Status' },
    { field: 'location_code', title: 'Location Name' }
  ];

  const getData = () => {
    const selectedData = type === '1' ? (data?.[0]?.checkIn || []) : (data?.[0]?.notCheckIn || []);
    // console.log(selectedData,"selectedData");
    
    // return selectedData.slice(page * pageSize, (page + 1) * pageSize);
    return selectedData
  };
console.log(props,"getData()");

  return (
    <div
    ref={(el) => {
      props.ref1(el)
      props.isVisibleRef.current = el
  }}
  >
    <Card >
   
    {props.mode === 'edit' && (
      <IconButton
        aria-label='view code'
        onClick={() => props.setCardClose()}
        size='large'
        sx={{
          position: 'absolute',
          top: 8,
          right: 5,
        }}
      >
        {props.isEnabled ? <props.VisibilityOffIcon /> : <props.VisibilityIcon />}
      </IconButton>
    )}
 
      
      <Tabs value={type} onChange={handleTabChange} indicatorColor='primary' textColor='primary' variant='fullWidth'
          aria-label='Tabs'>
        <Tab label={`Checked In (${data?.[0]?.checkIn?.length || 0})`} value='1' sx={{
              textTransform: 'none',
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(0, 0, 0, 0.7)',
            }}/>
        <Tab label={`Not Checked In (${data?.[0]?.notCheckIn?.length || 0})`} value='2' sx={{
              textTransform: 'none',
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(0, 0, 0, 0.7)',
            }}/>
      </Tabs>

      <MaterialTable
      style={{width: '100%', height: '100%', overflow: 'hidden'}}
      components={{
        Toolbar: (props) => (
          <>
            <div
              style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{width: '100%'}}>
                <MTableToolbar {...props} />
              </div>
            </div>
          </>
        ),
      }}
        title=''
        columns={getColumns}
        data={getData()}
        options={{
            headerStyle,
            cellStyle,
            search: false,
            maxBodyHeight: '223px',
            minBodyHeight: '223px',
          paging: true,
          pageSize: pageSize,
          pageSizeOptions: [10, 20, 50],
          exportButton: true,
          
        }}
        
        onChangePage={(newPage) => setPage(newPage)}
        onChangeRowsPerPage={(newPageSize) => setPageSize(newPageSize)}
        
      />

    </Card>
    </div>
  );
}

export default useCommonRef(CheckInOut);

