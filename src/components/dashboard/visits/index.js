import { Grid, Card, Typography, IconButton } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useDispatch, useSelector } from 'react-redux';
import { visitsReportAction } from '../../../redux/actions/visitsReport_action';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import NoRecordFound from 'components/Layout/NoRecordFound';
import { useInView } from 'react-intersection-observer';
import apiCalls from 'utils/apiCalls';
import { cellStyle, headerStyle } from 'utils/pageSize';
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import { commonDateFormat } from 'utils/getTimeFormat';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import MaterialTable from 'utils/SafeMaterialTable';
import moment from 'moment';

const VisitsReport = (props) => {
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext)
  const { visitsReports } = useSelector(state => state.VisitsReport)
  const [pollTimer, setPollTimer] = useState(null)
  const [open, setOpen] = useState(true)
  const [data, setData] = useState([])

  const dispatch = useDispatch();

  const { ref, inView, entry } = useInView({
    threshold: 0,
    triggerOnce: true,
  });



  useEffect(() => {
    let data = { customer_id: props?.rowIndex?.customer_ids?.split(",").map(id => Number(id)) };
    console.log('resdddddd', data?.customer_id)
    if (props.type === 'salesmanVisits') {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        headerLocationId,
        dispatch(visitsReportAction(commoncookie,headerLocationId, data,setModalTypeHandler, setLoaderStatusHandler, (response) => {
          if(response.status === 200) {
            setData(response.data)
          }
        }))
      );
    }
    else {
      setData(props?.data?.[0]?.data)
    }
  }, [])

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
  //     dispatch(visitsReportAction(commoncookie,headerLocationId,setModalTypeHandler, setLoaderStatusHandler))
  //   );
  // }

  useEffect(() => {
      if(props.mode === 'edit'){
          setOpen(false)
      }
      else{
          setOpen(true)
      }
    },[props.mode])

  const columns = [
    {
      title : 'Company Name',
      field : 'company_name'
    },
    {
      title : 'Zero Sale Date',
      field : 'sale_date',
      render : (rowData) => {
        return commonDateFormat(rowData.sale_date)
      }
    },
    {
      title : 'Sale Days',
      field : 'sale_days',
    },
 

    {
      title: 'Last Visited Date',
      field: 'attendance_date',
      render: rowData =>
        rowData.attendance_date
          ? moment(rowData.attendance_date, moment.ISO_8601, true).isValid()
            ? moment(rowData.attendance_date).format('DD/MM/YYYY')
            : 'Invalid Date'
          : '', // Or any placeholder like '-'
    },
    
    {
      title : 'Last Visited Days',
      field : 'attendance_days',
    }
  ]


  return (
    <div 
    ref={(el) => {
      props.ref1(el)
      props.isVisibleRef.current = el
      }}
      style={{height:'100%'}}

    >
      <MaterialTable
        columns = {columns}
        data = {data}
        title = { 
          <Typography
            variant='h6'
            align='left'
            style={{padding : '5px', paddingBottom : '20px'}}
          >
            VISITS REPORT
          </Typography>
        }
        options = {{
          search : false,
          maxBodyHeight : '326px',
          minBodyHeight : '326px',
          fixedColumns : true,
          paging : false,
          exportButton : false,
          filtering : false,
          actionsColumnIndex : -1,
          headerStyle : {
            ...headerStyle,
            position : 'sticky',
            top : 0
          },
          cellStyle : cellStyle
        }}
        actions = {[
          {                                            
            icon: () => props.isEnabled ?  <props.VisibilityOffIcon /> : <props.VisibilityIcon />,
              isFreeAction: true,
              hidden : open,
              onClick : () => props.setCardClose()
          }
        ]}
      />
    </div>
  );
};
export default useCommonRef(VisitsReport);

