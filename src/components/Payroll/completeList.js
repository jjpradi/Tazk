import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {Card, Grid, InputAdornment, TextField, Typography} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {completeListAction, getSearchPayrollCompleteListAction, setSearchPayrollCompleteListAction} from 'redux/actions/payrollDashboard_actions';
import context from 'context/CreateNewButtonContext';
import {dasboardPageSize, formatDate12Hr} from 'utils/pageSize';
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

function CompleteList(props) {
  const dispatch = useDispatch();
  const {
    setLoaderStatusHandler,
    setModalTypeHandler,
    commoncookie,
    headerLocationId,
    setModalStatusHandler,
  } = useContext(context);
  const [searchVal, setSearchVal] = useState('');
  const [isApiFinished, setIsApiFinished] = useState(false);
  const [pollTimer, setPollTimer] = useState(null)

  const {
    PayrolldashboardReducers: {completeList,search_payroll_completeList},
  } = useSelector((state) => state);
  const [open, setOpen] = useState(true)
  useEffect(() => {
    if(props.mode === 'edit'){
        setOpen(false)
    }
    else{
        setOpen(true)
    }
  },[props.mode])

  useEffect(() => {
    if (props.type === 'DASHBOARD') {
      if (props.inView && props.isEnabled) {
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(
            completeListAction(setLoaderStatusHandler, setModalTypeHandler),
          ),
        ).finally(() => setIsApiFinished(true));
      }
    } else {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          completeListAction(setLoaderStatusHandler, setModalTypeHandler),
        ),
      ).finally(() => setIsApiFinished(true)); 
    }

  }, [props.inView , props.isEnabled]);

  useEffect(() => {
    if (props.inViewport === true) {
      setTimeout(() => {
        const timer = setInterval(() => pollData(), props.DASHBOARD_API_POLL_TIMING);
        if (props.inViewport === false) {
          clearTimeout(timer);
        }
        dispatch(setDashboardPollingTimerIdsAction(timer));
        setPollTimer(timer );
      }, props.DASHBOARD_API_POLL_TIMING);

    } else {
      clearTimeout(pollTimer);
    }

    return () => clearTimeout(pollTimer);
    
  }, [props.inViewport]);

  const pollData = () => {
    props.pollServer(
      dispatch(
        completeListAction(setLoaderStatusHandler, setModalTypeHandler),
      ),
    );
  }

  const requestSearch = (e) => {
    let val = e.target.value;
    setSearchVal(val);

    if (val.trim() !== '') {
      dispatch(setSearchPayrollCompleteListAction([]));
    }
    const body = {
      searchString: val,
      employeeId: commoncookie,
      locationId: headerLocationId,
    };
    dispatch(
      getSearchPayrollCompleteListAction(
        body,
        setModalStatusHandler,
        setLoaderStatusHandler,
      ),
    );
  };

  const cancelSearch = (e) => {
    setSearchVal('');
    dispatch(setSearchPayrollCompleteListAction({ data: [] }));
  };

  return (
    // </div>
    <Card 
    ref={(el) => {
      props.ref1(el)
      props.isVisibleRef.current = el
    }}
    sx={{width: '100%',height:'430px' , overflow:'auto'}}>
      <MaterialTable
      style={{ height: '430px' }}
            components={{
              Toolbar: (props) => (
                <>
                  <div style={{display: 'flex', width: '100%', alignItems: 'center'}}>
                    <div style={{width: '100%'}}>
                      <MTableToolbar {...props} />
                    </div>
                    <Grid>
                      {/* <CommonSearch
                        searchVal={searchVal}
                        cancelSearch={cancelSearch}
                        requestSearch={requestSearch}
                      /> */}
                      {/* <TextField
                        autoFocus={search_payroll_completeList ? false : true}
                        fullWidth
                        sx={{
                          borderRadius: '8px',
                          '& .MuiOutlinedInput-root': {
                            height: '42px',
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <SearchIcon />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position='end'>
                              <ClearIcon
                                onClick={cancelSearch}
                                sx={{cursor: 'pointer'}}
                              />
                            </InputAdornment>
                          ),
                        }}
                        placeholder='Search'
                        value={searchVal}
                        onChange={requestSearch}
                      /> */}
                    </Grid>
                  </div>
                </>
              ),
            }}
              options={{
                showEmptyDataSourceMessage: isApiFinished,
              headerStyle,
              cellStyle,
              pageSize: dasboardPageSize,
              pageSizeOptions: [20, 50, 100],
              exportButton: true,
              search : false , 
              paging: false,
              exportMenu: [
                {
                  label: 'Export PDF',
                  exportFunc: (cols, datas) =>
                    ExportPdf(cols, datas, 'Complete List'),

                  },
                  {
                    label: 'Export CSV',
                    exportFunc: (cols, datas) =>
                      ExportCsv(cols, datas, 'Complete List'),
                  },
                ],
              }}
              actions={[
                {                                            
                    icon: () => props.isEnabled ?  <props.VisibilityOffIcon /> : <props.VisibilityIcon />,
                    // tooltip: 'Close',
                    isFreeAction: true,
                    hidden : open,
                    // onClick: (event) => alert("You want to add a new row")
                    onClick : () => props.setCardClose()
                }
            ]}
              columns={[
                {
                  field: 'first_name',
                  title: 'Name',
                },
                {
                  field: 'start_time',
                  title: 'Start Time',
                  render: (rowData) => 
                  <div>
                  {rowData.start_time
                    ? formatDate12Hr(rowData.start_time)
                    : ''}
                </div>
                },
                {
                  field: 'end_time',
                  title: 'End Time',
                  render: (rowData) => 
                  <div>
                  {rowData.end_time
                    ? formatDate12Hr(rowData.end_time)
                    : ''}
                </div>
                },
                {
                  field: 'status',
                  title: 'Status',
                },
              ]}
              data={search_payroll_completeList?.length ? search_payroll_completeList : completeList}
            title={
              <Typography
                variant='h6'
                align='left'
                style={{paddingTop: '10px', paddingBottom: '10px'}}
              >
                Complete List
              </Typography>
            }
            />
    </Card>
  );
}
export default useCommonRef(CompleteList);

