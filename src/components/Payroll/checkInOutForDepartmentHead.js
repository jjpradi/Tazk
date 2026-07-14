import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import { Button, ButtonGroup, Card, Grid, InputAdornment, TextField, Typography,Tab, Tabs, } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCheckedInAndOutAction
} from 'redux/actions/payrollDashboard_actions';
import context from 'context/CreateNewButtonContext';
import NoRecordFound from 'components/Layout/NoRecordFound';
import { Time12Hr, dasboardPageSize, formatDate12Hr } from 'utils/pageSize';
import apiCalls from 'utils/apiCalls';
import {
  maxBodyHeight,
  maxHeight,
  pageSize,
  headerStyle,
  cellStyle,
} from 'utils/pageSize';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import CommonSearch from 'utils/commonSearch';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import NotCheckedIn from './notCheckedIn';

function CheckedInOutForDepartmentHead(props) {
  const dispatch = useDispatch();
  const [searchVal, setSearchVal] = useState('');
  const [open, setOpen] = useState(true);
  const [pollTimer, setPollTimer] = useState(null);
  const [isApiFinished, setIsApiFinished] = useState(false);
  const [type, setType] = useState('1');
  const {
    PayrolldashboardReducers: { getCheckedInAndOut}
  } = useSelector((state) => state);

  console.log("getCheckedInAndOut",getCheckedInAndOut)

  const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setModalTypeHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);

  useEffect(() => {
    if (props.mode === 'edit') {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [props.mode]);

  useEffect(() => {
    
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getCheckedInAndOutAction()),
 
    ).finally(() => setIsApiFinished(true));
  }, [props.inView, props.isEnabled, headerLocationId]);

  useEffect(() => {
    if (props.inViewport === true) {
      const timer = setInterval(() => pollData(), props.DASHBOARD_API_POLL_TIMING);
      dispatch(setDashboardPollingTimerIdsAction(timer));
      setPollTimer(timer);
    } else {
      clearTimeout(pollTimer);
    }

    return () => clearTimeout(pollTimer);
  }, [props.inViewport]);

  const pollData = () => {
  
    props.pollServer(
      dispatch(getCheckedInAndOutAction()),
      
    );
  };

  


  const handleTabChange = (event, newValue) => {
    setType(newValue);
  
  };

  const getColumns = () => {
    if (type === '1') {
      return [
        {
          field: 'shift_name',
          title: 'Shift Name',
          render: (rowData) => (
            <div className='dashboard-chart-content' style={{ textTransform: 'capitalize' }}>
              {rowData.shift_name ? rowData.shift_name : '-'}
            </div>
          ),
        },
        {
          field: 'full_name',
          title: 'Name',
          render: (rowData) => (
            <div className='dashboard-chart-content' style={{ textTransform: 'capitalize' }}>
              {rowData.full_name ? rowData.full_name : '-'}
            </div>
          ),
        },
        {
          field: 'startDate',
          title: 'CheckIn',
          render: (rowData) => (
            <div className='dashboard-chart-content'>
              {rowData.startDate ? Time12Hr(rowData.startDate) : '-'}
            </div>
          ),
        },
        {
          field: 'location_name',
          title: 'Location Name',
          render: (rowData) => ( <div className='dashboard-chart-content'> {rowData.location_name ? rowData.location_name : '-'} </div>),
        },
      ];
    } else {
      return [
        {
          field: 'shift_name',
          title: 'Shift Name',
          render: (rowData) => (
            <div className='dashboard-chart-content' style={{ textTransform: 'capitalize' }}>
              {rowData.shift_name ? rowData.shift_name : '-'}
            </div>
          ),
        },
        {
          field: 'full_name',
          title: 'Name',
          render: (rowData) => (
            <div className='dashboard-chart-content' style={{ textTransform: 'capitalize' }}>
              {rowData.full_name ? rowData.full_name : '-'}
            </div>
          ),
        },
        {
          field: 'startDate',
          title: 'CheckOut',
          render: (rowData) => (
            <div className='dashboard-chart-content'>
              {rowData.startDate ? Time12Hr(rowData.endDate) : '-'}
            </div>
          ),
        },
        {
          field: 'location_name',
          title: 'Location Name',
          render: (rowData) => ( <div className='dashboard-chart-content'> {rowData.location_name ? rowData.location_name : '-'} </div>),
        },
      ];
    }
  };

  const getData = () => {
    if (type === '1') {
      return getCheckedInAndOut.checkInResult
    } else {
      return getCheckedInAndOut.checkOutResult
    }
  };


  return (
    <>
      <Card
        ref={(el) => {
          props.ref1(el);
          props.isVisibleRef.current = el;
        }}
       
      >
        <Tabs
          value={type}
          onChange={handleTabChange}
          indicatorColor='primary'
          textColor='primary'
          variant='fullWidth'
          aria-label='Tabs'
        >
          <Tab
            label={`In (${getCheckedInAndOut.checkInCount || 0})`}
            value='1'
            sx={{
              textTransform: 'none',
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(0, 0, 0, 0.7)',
            }}
          />
          <Tab
            label={`Out (${getCheckedInAndOut.checkOutCount || 0})`}
            value='2'
            sx={{
              textTransform: 'none',
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(0, 0, 0, 0.7)',
            }}
          />
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
          options={{
            showEmptyDataSourceMessage: isApiFinished,
            headerStyle,
            cellStyle,
            paging: true,
            exportButton: true,
  
            search: false,
            maxBodyHeight: '210px',
            minBodyHeight: '260px',
            exportMenu: [
              {
                label: 'Export PDF',
                exportFunc: (cols, datas) =>
                  ExportPdf(cols, datas, 'CheckedIn List'),
              },
              {
                label: 'Export CSV',
                exportFunc: (cols, datas) =>
                  ExportCsv(cols, datas, 'CheckedIn List'),
              },
            ],
          }}
          actions={[
            {
              icon: () =>
                props.isEnabled ? (
                  <props.VisibilityOffIcon />
                ) : (
                  <props.VisibilityIcon />
                ),
              isFreeAction: true,
              hidden: open,
              onClick: () => props.setCardClose(),
            },
          ]}
        
          columns={getColumns()}
         
          data={getData()}
         
          {...(type === '1' && getCheckedInAndOut.checkInCount === 0 && <NoRecordFound />)}
          {...(type === '2' && getCheckedInAndOut.checkOutCount === 0 && <NoRecordFound />)}
        />
      </Card>
    </>
  );
}

export default useCommonRef(CheckedInOutForDepartmentHead);

