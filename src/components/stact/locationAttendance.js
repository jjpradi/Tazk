import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {Card, Typography} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  getSearchPayrollLateLoginAction,
  lateLoginAction,
  locationWiseAttendanceAction,
  setSearchPayrollLateLoginAction,
} from 'redux/actions/payrollDashboard_actions';
import context from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {
  headerStyle,
  cellStyle,
} from 'utils/pageSize';
import useCommonRef from 'pages/common/home/useCommonRef';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import LocationWiseCommonDialog from 'components/Payroll/locationWiseCommonDialog';

function LocationAttendance(props) {
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
    PayrolldashboardReducers: {lateLogin,search_payroll_lateLogin,checkinOut_details,employeeCheckinOutDetails, locationWiseAttendance},
  } = useSelector((state) => state);
  const [open, setOpen] = useState(true)
  const [isApiFinished, setIsApiFinished] = useState(false)
  const [pollTimer, setPollTimer] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [rowData, setRowData] = useState()
  const [columnType, setColumnType] = useState()
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

  const requestSearch = (e) => {
    let val = e.target.value;
    setSearchVal(val);
      dispatch(setSearchPayrollLateLoginAction([]));
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

  const handleRowClick = (rowData, type) => {
    console.log('rowData',rowData);
    setDialogOpen(true)
    setRowData(rowData)
    setColumnType(type)
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
    sx={{width: '100%',height:'100%' , overflow:'auto'}}>
    <MaterialTable
      style={{ height: '100%' }}
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
        paging:false,
        exportButton: false,
          search: false,
          maxBodyHeight: '430px',
      }}
      actions={[
        {                                            
            icon: () => props.isEnabled ?  <props.VisibilityOffIcon /> : <props.VisibilityIcon />,
            isFreeAction: true,
            hidden : open,
            onClick : () => props.setCardClose()
        }
      ]}
      columns={[
        {
          field: 'location_name',
          title: 'Location',
          headerStyle: {
            fontFamily: "poppins",
            fontSize: "12px",
            fontWeight: "600",
            color: 'rgba(0, 0, 0, 0.7)'
          },
          cellStyle:{textTransform:"capitalize",commonCellStyle},
          render:(rowData) =>
          rowData.location_name ? rowData.location_name : '-',
        },
        {
          field: 'checkincount',
          title: 'Present',
          headerStyle: {
            fontFamily: "poppins",
            fontSize: "12px",
            fontWeight: "600",
            color: 'rgba(0, 0, 0, 0.7)'
          },
          cellStyle: commonCellStyle,
          render: (rowData) => (
            <div
              style={{cursor: rowData.checkincount && 'pointer', textDecoration: rowData.checkincount && 'underline'}}
              onClick={() => {
                handleRowClick(rowData, 'Present');
              }}
            >
              {rowData.checkincount ? rowData.checkincount : '-'}
            </div>
          )
        },
        {
          field: 'notcheckIn',
          title: 'Absent',
          headerStyle: {
            fontFamily: "poppins",
            fontSize: "12px",
            fontWeight: "600",
            color: 'rgba(0, 0, 0, 0.7)'
          },
          cellStyle: commonCellStyle,
          render: (rowData) => (
            <div
              style={{cursor: rowData.notcheckIn && 'pointer', textDecoration: rowData.notcheckIn && 'underline'}}
              onClick={() => {
                handleRowClick(rowData, 'Absent');
              }}
            >
              {rowData.notcheckIn ? rowData.notcheckIn : '-'}
            </div>
          )
        },
        {
          field: 'lateCheckIn',
          title: 'Late In',
          headerStyle: {
            fontFamily: "poppins",
            fontSize: "12px",
            fontWeight: "600",
            color: 'rgba(0, 0, 0, 0.7)'
          },
          cellStyle: commonCellStyle,
          render: (rowData) => (
            <div
              style={{cursor: rowData.lateCheckIn && 'pointer', textDecoration: rowData.lateCheckIn && 'underline'}}
              onClick={() => {
                handleRowClick(rowData, 'LateCheckIn');
              }}
            >
              {rowData.lateCheckIn ? rowData.lateCheckIn : '-'}
            </div>
          )
        },
        {
          field: 'earlyCheckOut',
          title: 'Early Out',
          headerStyle: {
            fontFamily: "poppins",
            fontSize: "12px",
            fontWeight: "600",
            color: 'rgba(0, 0, 0, 0.7)'
          },
          cellStyle: commonCellStyle,
          render: (rowData) => (
            <div
              style={{cursor: rowData.earlyCheckOut && 'pointer', textDecoration: rowData.earlyCheckOut && 'underline'}}
              onClick={() => {
                handleRowClick(rowData, 'EarlyCheckOut');
              }}
            >
              {rowData.earlyCheckOut ? rowData.earlyCheckOut : '-'}
            </div>
          )
        },
      ]}
      data={props.purpose === 'employee' ? employeeCheckinOutDetails :search_payroll_lateLogin?.length > 0 || searchVal.length > 0 ? search_payroll_lateLogin : props?.data[0]?.data || []}
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
          Location Wise Attendance
        </Typography>
      }
    />
    {
      dialogOpen === true ?
        <LocationWiseCommonDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} rowData={rowData} columnType={columnType}/>
      :
      ''
    }
    </Card>
    </>
  );
}
export default useCommonRef(LocationAttendance);

