import MaterialTable from 'utils/SafeMaterialTable';
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTop10OutstandingReportAction } from 'redux/actions/salesMan_action';
import apiCalls from 'utils/apiCalls';
import { cellStyle, dasboardPageSize, headerStyle } from 'utils/pageSize';
import CreateNewButtonContext from '../../../../context/CreateNewButtonContext';
import useCommonRef from '../../../../pages/common/home/useCommonRef'
import CloseIcon from '@mui/icons-material/Close';
import { Card, Grid, IconButton } from '@mui/material';
import { commonDateFormat } from 'utils/getTimeFormat';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';

function TopTenOutstandingCard(props) {
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
  } = useContext(CreateNewButtonContext);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(true)
  const [pollTimer, setPollTimer] = useState(null)

  const {
    salesManReducer: { top10OutstandingReport },
  } = useSelector((state) => state);

  // useEffect(() => {
  //   if(props.mode === 'edit'){
  //       setOpen(false)
  //   }
  //   else{
  //       setOpen(true)
  //   }
  // },[props.mode])

  // useEffect(() => {
  //   if(props.inView && props.isEnabled){
  //     apiCalls(
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //       dispatch(
  //         getTop10OutstandingReportAction(
  //           commoncookie,
  //           setModalTypeHandler,
  //           setLoaderStatusHandler,
  //         ),
  //       )
  //     );
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
  //     dispatch(
  //       getTop10OutstandingReportAction(
  //         commoncookie,
  //         setModalTypeHandler,
  //         setLoaderStatusHandler,
  //       ),
  //     )
  //   );
  // }


  return (
    <Card
      ref={(el) => {
        props.ref1(el)
        props.isVisibleRef.current = el
      }}
      sx={{ height: '100%' }}
    >
      {/* <Grid container bgcolor='white'>
          <Grid size={{ xs: 10, sm: 11, md: 11, lg: 11.5 }}></Grid>
          <Grid size={{ xs: 2, sm: 1, md: 1, lg: 0.5 }}> 
              {
                  props.mode === 'edit' ?
                  <IconButton
                      aria-label='view code'
                      onClick={() => props.setTopTenOutstandingCardClose(true)}
                      size='large'
                      >
                      <CloseIcon />
                  </IconButton>
                  :
                  ''
              }
          </Grid>
      </Grid> */}
<div style={{ maxHeight: 390, overflowY: 'auto' }}>
      <MaterialTable
        style={{
          height: '100%', overflowY:'visible',
          '&::-webkit-scrollbar': {
            width: 10,
          }, 
          '&::-webkit-scrollbar-track': {
            backgroundColor: "#E0E0E0",
          },
           '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#B2B2B2',
            borderRadius: 1
          }, 
          '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover': {
            background: '#999',
          },
        }}
        options={{
          search: false,
          headerStyle: {
            fontSize: headerStyle.fontSize,

          },
          cellStyle: {
            fontSize: cellStyle.fontSize
          },
          exportButton: false,
          filtering: false,
          actionsColumnIndex: -1,
          pageSize: dasboardPageSize,
          paging: false,
          // exportMenu: [
          //   {
          //     label: 'Export PDF',
          //     exportFunc: (cols, datas) => ExportPdf(cols, datas, 'Contra'),
          //   },
          //   {
          //     label: 'Export CSV',
          //     exportFunc: (cols, datas) => ExportCsv(cols, datas, 'Contra'),
          //   },
          // ],
        }}
        actions={[
          {
            icon: () => props.isEnabled ? <props.VisibilityOffIcon /> : <props.VisibilityIcon />,
            // tooltip: 'Close',
            isFreeAction: true,
            hidden: open,
            // onClick: (event) => alert("You want to add a new row")
            onClick: () => props.setCardClose()
          }
        ]}
        columns={[
          {
            title: 'Customer Name',
            field: 'company_name',
          },
          {
            title: 'Invoice Number',
            field: 'invoice_number',
          },
          {
            title: 'Invoice Date',
            field: 'invoice_date',
            render: (r) => (
              commonDateFormat(r.invoice_date)
            )
          },
          {
            title: 'Invoice Amount',
            field: 'total',
            render: (rowData) => (rowData.total.toFixed(2)),

          },
          {
            title: 'Due Amount',
            field: 'due_amount',
            render: (rowData) => (rowData.due_amount.toFixed(2)),

          },
          {
            title: 'Due Days',
            field: 'due_days',
          },
        ]}
        data={props?.data[0]?.data || []}
        title={<h3 style={{ fontSize: "12px", fontWeight: 600 }}>Top 10 Outstandings</h3>}
      />
      </div>
    </Card>
  );
}
export default useCommonRef(TopTenOutstandingCard)

