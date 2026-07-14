import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {Card, Grid, InputAdornment, TextField, Typography} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  getSearchPayrollNotCheckinAction,
  notCheckedInAction,
  setSearchPayrollNotCheckinAction,
} from 'redux/actions/payrollDashboard_actions';
import context from 'context/CreateNewButtonContext';
import {dasboardPageSize} from 'utils/pageSize';
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
import NoRecordFound from 'components/Layout/NoRecordFound';
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import CommonSearch from 'utils/commonSearch';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import { capitalize } from 'lodash';

function NotCheckedIn(props) {
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
    PayrolldashboardReducers: {notCheckedIn, search_payroll_notCheckin} = {
    notCheckedIn: [],
    search_payroll_notCheckin: [],
  },
   } =useSelector((state) => state);
   console.log(notCheckedIn,'notcheckedin');
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
    // dispatch(setSearchPayrollNotCheckinAction({data: []}));
    if (props.type === 'DASHBOARD') {
      if (props.inView && props.isEnabled) {
        const body = {
          locationId: headerLocationId,
        };
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(
            notCheckedInAction(body, setLoaderStatusHandler, setModalTypeHandler),
          ),
        ).finally(() => setIsApiFinished(true));
      }
    } else {
      const body = {
        locationId: headerLocationId,
      };
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          notCheckedInAction(body, setLoaderStatusHandler, setModalTypeHandler),
        ),
      ).finally(() => setIsApiFinished(true));
    }
  }, [props.inView,props.isEnabled, headerLocationId]);

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
    const body = {
      locationId: headerLocationId,
    };
    props.pollServer(
      dispatch(
        notCheckedInAction(body, setLoaderStatusHandler, setModalTypeHandler),
      )
    );
  }

  const requestSearch = (e) => {
    let val = e.target.value;
    setSearchVal(val);
    

    // if (val.trim() !== '') {
      dispatch(setSearchPayrollNotCheckinAction({data: []}));
    // }
    const body = {
      searchString: val,
      employeeId: commoncookie,
      locationId: headerLocationId,
    };
    dispatch(
      getSearchPayrollNotCheckinAction(
        body,
        setModalStatusHandler,
        setLoaderStatusHandler,
      ),
    );
  };

  const cancelSearch = (e) => {
    setSearchVal('');
    dispatch(setSearchPayrollNotCheckinAction({data: []}));
  };

  return (
<Card   
ref={(el) => {
  props.ref1(el)
  props.isVisibleRef.current = el
}}
sx={{width: '100%',height:'100%' , overflow:'auto'}}>
<MaterialTable
        style={{ width: '100%', height: '100%', overflow: 'auto' }}
      components={{
        Toolbar: (props) => (
          <>
            <div style={{display: 'flex', width: '100%', alignItems: 'center'}}>
              <div style={{width: '100%'}}>
                <MTableToolbar {...props} />
              </div>
              <Grid>
            
              </Grid>
            </div>
          </>
        ),
      }}
        options={{
          showEmptyDataSourceMessage: isApiFinished,
        headerStyle,
          cellStyle,
          // maxBodyHeight: '100vh',
        pageSize: dasboardPageSize,
        pageSizeOptions: [20, 50, 100],
        exportButton: true,
        search: false,
        paging: false,
        exportMenu: [
          {
            label: 'Export PDF',
            exportFunc: (cols, datas) =>
              ExportPdf(cols, datas, 'Not CheckedIn'),
          },
          {
            label: 'Export CSV',
            exportFunc: (cols, datas) =>
              ExportCsv(cols, datas, 'Not CheckedIn List'),
          },
          ],
          stickyHeader: true, // Set stickyHeader property to true to make headers static

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
          field: 'shift_name',
          title: 'Shift Name',
          render:(rowData) =>
          <div style={{textTransform:"capitalize"}}>
          {rowData.shift_name ? rowData.shift_name : '-'}
          </div>
        },
        {
          field: 'full_name',
          title: 'Name',
          render:(rowData) =>
          <div style={{textTransform:"capitalize"}}>
          {/* {rowData.first_name+' '+rowData.last_name ? rowData.first_name+' '+rowData.last_name : '-'} */}
          {/* {rowData.first_name ? rowData.first_name + (rowData.last_name !== null && rowData.last_name !== undefined ? ' ' + rowData.last_name : '') : '-'} */}
          {rowData.full_name ? rowData.full_name : '-'}
          </div>
        },
        // {
        //   field: 'location_name',
        //   title: 'Location Name',
        // },
        {
          field: 'status',
          title: 'Status',
          render:(rowData) =>
          rowData.status ? rowData.status : '-',}
      ]}
      data={
        search_payroll_notCheckin?.length > 0 || searchVal.length > 0 ? search_payroll_notCheckin : notCheckedIn
      }
      title={
        <Typography
          variant='h6'
          align='left'
          style={{paddingTop: '10px', paddingBottom: '10px'}}
        >
          Not Checked In
        </Typography>
      }
      {...(notCheckedIn.length === 0 ? <NoRecordFound /> : notCheckedIn)}
    />
</Card>
  );
}
export default useCommonRef(NotCheckedIn);

