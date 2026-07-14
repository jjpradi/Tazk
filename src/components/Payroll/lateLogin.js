import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {Card, Grid, InputAdornment, TextField, Typography} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  getSearchPayrollLateLoginAction,
  lateLoginAction,
  lateLoginEarlyCheckoutAction,
  setSearchPayrollLateLoginAction,
} from 'redux/actions/payrollDashboard_actions';
import context from 'context/CreateNewButtonContext';
import {Duration, Time12Hr, dasboardPageSize, formatDate12Hr, formatTime12Hour} from 'utils/pageSize';
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
import { getsessionStorage } from 'pages/common/login/cookies';
import moment from 'moment';
import { commonDateFormat } from 'utils/getTimeFormat';

function LateLogin(props) {
  const dispatch = useDispatch();
  const {
    setLoaderStatusHandler,
    setModalTypeHandler,
    commoncookie,
    headerLocationId,
    setModalStatusHandler,
  } = useContext(context);
  const [searchVal, setSearchVal] = useState('');

  const {
    PayrolldashboardReducers: {lateLogin,search_payroll_lateLogin,checkinOut_details,employeeCheckinOutDetails},
  } = useSelector((state) => state);
  const [open, setOpen] = useState(true)
  const [isApiFinished, setIsApiFinished] = useState(false)
  const [pollTimer, setPollTimer] = useState(null)
  const storage = getsessionStorage();
  let emp_id = storage?.employee_id || '';

  useEffect(() => {
    if(props.mode === 'edit'){
        setOpen(false)
    }
    else{
        setOpen(true)
    }
  },[props.mode])


  // useEffect(() => {    
  //   if(props.purpose !== 'employee'){
  //     dispatch(setSearchPayrollLateLoginAction({ data: [] }));
  //     if (props.type === 'DASHBOARD') {
  //       if (props.inView && props.isEnabled) {
  //         apiCalls(
  //           setModalTypeHandler,
  //           setLoaderStatusHandler,
  //           // dispatch(lateLoginAction(setLoaderStatusHandler, setModalTypeHandler)),
  //           dispatch(lateLoginEarlyCheckoutAction())
  //           ).finally(() => setIsApiFinished(true));
  //       }
  //     } else {
  //       apiCalls(
  //         setModalTypeHandler,
  //         setLoaderStatusHandler,
  //         // dispatch(lateLoginAction(setLoaderStatusHandler, setModalTypeHandler)),
  //         dispatch(lateLoginEarlyCheckoutAction())
  //         ).finally(() => setIsApiFinished(true));
  //     }
  //   }

  // }, [props.inView , props.isEnabled]);

  // useEffect(() => {
  //   if (props.inViewport === true) {
  //     setTimeout(() => {
  //       const timer = setInterval(() => pollData(), props.DASHBOARD_API_POLL_TIMING);
  //       if (props.inViewport === false) {
  //         clearTimeout(timer);
  //       }
  //       dispatch(setDashboardPollingTimerIdsAction(timer));
  //       setPollTimer(timer );
  //     }, props.DASHBOARD_API_POLL_TIMING);

  //   } else {
  //     clearTimeout(pollTimer);
  //   }

  //   return () => clearTimeout(pollTimer);
    
  // }, [props.inViewport]);

  // const pollData = () => {
  //   props.pollServer(
  //     dispatch(lateLoginAction(setLoaderStatusHandler, setModalTypeHandler)),
  //   );
  // }

  const requestSearch = (e) => {
    let val = e.target.value;
    setSearchVal(val);

    // if (val.trim() !== '') {
      dispatch(setSearchPayrollLateLoginAction([]));
    // }
    const body = {
      searchString: val,
      employeeId: commoncookie,
      locationId: headerLocationId,
    };
    dispatch(
      getSearchPayrollLateLoginAction(
        body,
        setModalStatusHandler,
        setLoaderStatusHandler,
      ),
    );
  };

  const cancelSearch = (e) => {
    setSearchVal('');
    dispatch(setSearchPayrollLateLoginAction({data: []}));
  };

  const commonCellStyle = {
    fontFamily: "poppins",
    fontSize: "11px",
    fontWeight: "400",
    color: 'rgba(0, 0, 0, 0.7)',
  };

  return (
    <>
    <style>
        {`
            ::-webkit-scrollbar-button {
                display : none
            }
            ::-webkit-scrollbar {
                width : 10px
            }
            ::-webkit-scrollbar-thumb {
                background-color : #888
                border-radius : 10px
            }
            ::-webkit-scrollbar-thumb:hover {
                background-color : #555
            }
        `}
      </style>
    <Card 
    ref={(el) => {
      props.ref1(el)
      props.isVisibleRef.current = el
    }}
    sx={{width: '100%', height:'100%', overflow:'auto', maxHeight: '600px'}}>
      {/* height:'100%',  overflow:'auto' */}
    <MaterialTable
        // style={{ height: '115%' }}
        totalCount={employeeCheckinOutDetails?.count}
        page={props.page}
        onPageChange={(page) => props.handlePageChange(page)}
        onRowsPerPageChange={(size) => props.handlePageSizeChange(size)}
      components={{
        Toolbar: (props) => (
          <>
            <div style={{display: 'flex', width: '100%', alignItems: 'center'}}>
              <div style={{width: '100%'}}>
                <MTableToolbar {...props} />
              </div>
            </div>
          </>
        ),
      }}
        options={{
          showEmptyDataSourceMessage: props.purpose === 'employee' ? props.lateLoginApiFinished : isApiFinished,
        headerStyle,
        cellStyle,
          paging: props.purpose === 'employee' ? true : false,
          search: false,
          maxBodyHeight: '430px',
          exportButton: false,
        //   exportMenu: props.purpose === 'employee' ? [
        //     {
        //       label: 'Export PDF',
        //       exportFunc: (cols, datas) =>
        //         ExportPdf(cols, datas, 'Late Login List'),
        //     },
        //     {
        //       label: 'Export CSV',
        //       exportFunc: (cols, datas) =>
        //         ExportCsv(cols, datas, 'Late Login List'),
        //     },
        // ] : [
        //   {
        //     label: 'Export PDF',
        //     exportFunc: (cols, datas) =>
        //       ExportPdf(cols, datas, 'Late Login List'),
        //   },
        //   {
        //     label: 'Export CSV',
        //     exportFunc: (cols, datas) =>
        //       ExportCsv(cols, datas, 'Late Login List'),
        //   },
        // ],
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
          field: 'start_time',
          title: 'Date',
          headerStyle: {
            fontFamily: "poppins",
            fontSize: "12px",
            fontWeight: "600",
            color: 'rgba(0, 0, 0, 0.7)'
          },
          cellStyle: commonCellStyle,
          hidden: props.type === 'DASHBOARD' ? true : false,
          render: (rowData) => 
          <div>
          {rowData.start_time
            ? commonDateFormat(rowData.start_time)
            : '-'}
        </div>
        },
        {
          field: 'shift_name',
          title: 'Shift Name',
          cellStyle: commonCellStyle,
          render:(rowData) =>
           
            rowData.shift_name ? rowData.shift_name : '-',
          
        },
        {
          field: 'full_name',
          title: 'Name',
          headerStyle: {
            fontFamily: "poppins",
            fontSize: "12px",
            fontWeight: "600",
            color: 'rgba(0, 0, 0, 0.7)'
          },
          cellStyle:{textTransform:"capitalize", commonCellStyle},
          render:(rowData) =>
            // rowData.first_name ? rowData.first_name + (rowData.last_name && rowData.last_name.length > 0 ? ' ' + rowData.last_name : '') : '-',
            rowData.full_name ? rowData.full_name : '-',
            hidden: props.purpose === 'employee'
        },
      
        // {
        //   field: 'duration',
        //   title: 'Late Duration',
        //   render: (rowData) => 
        //   <div>
        //   {rowData.duration
        //     ? Duration(rowData.duration)
        //     : '-'}
        // </div>
        // },
        {
          field: 'start_time',
          title: 'Check-In Time',
          headerStyle: {
            fontFamily: "poppins",
            fontSize: "12px",
            fontWeight: "600",
            color: 'rgba(0, 0, 0, 0.7)'
          },
          cellStyle: commonCellStyle,
          render: (rowData) => 
          <div>
          {rowData?.start_time
            ? Time12Hr(rowData?.start_time)
            : '-'}
        </div>
        },
        {
          field: 'duration',
          title: 'Late Duration',
          headerStyle: {
            fontFamily: "poppins",
            fontSize: "12px",
            fontWeight: "600",
            color: 'rgba(0, 0, 0, 0.7)'
          },
          cellStyle: commonCellStyle,
          render: (rowData) => 
          <div>
          {rowData.Startduration
            ? Duration(rowData.Startduration)
            : rowData.late_login_duration ?  Duration(rowData.late_login_duration) : '-'}
        </div>
        },
        {
          field: 'end_time',
          title: 'CheckOut Time',
          headerStyle: {
            fontFamily: "poppins",
            fontSize: "12px",
            fontWeight: "600",
            color: 'rgba(0, 0, 0, 0.7)'
          },
          cellStyle: commonCellStyle,
          render: (rowData) => 
          <div>
          {rowData.end_time
            ? Time12Hr(rowData.end_time)
            : '-'}
        </div>
        },
        {
          field: 'early_logout_duration',
          title: 'Early Duration',
          headerStyle: {
            fontFamily: "poppins",
            fontSize: "12px",
            fontWeight: "600",
            color: 'rgba(0, 0, 0, 0.7)'
          },
          cellStyle: commonCellStyle,
          render: (rowData) => 
          <div>
          {rowData.Endduration
            ? Duration(rowData.Endduration)
            : rowData.early_logout_duration
            ?   Duration(rowData.early_logout_duration
            ) : '-'}
        </div>
        },
      ]}
      data={props.purpose === 'employee' ? employeeCheckinOutDetails?.data :checkinOut_details?.length > 0 || searchVal.length > 0 ? checkinOut_details : props?.data[0]?.lateInEarlyOutDuration || []}
      title={ 
        <Typography
          className='dashboard-card-title'
          variant='h6'
          align='left'
          style={{
            padding : '5px', 
            paddingBottom : props.mode === 'edit' ? '23px' : '20px'
          }}
        >
          Late Login & Early Checkout
        </Typography>
      }
    />
    </Card>
    </>
  );
}
export default useCommonRef(LateLogin);

