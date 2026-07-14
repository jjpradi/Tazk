import MaterialTable from 'utils/SafeMaterialTable';
import {Grid, IconButton, Typography} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import {getChequeBounceAction} from 'redux/actions/salesMan_action';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { dasboardPageSize, headerStyle, maxBodyHeight, maxHeight, pageSize } from 'utils/pageSize';
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import { Card } from '@mui/material';
import { commonDateFormat } from 'utils/getTimeFormat';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import { titleURL } from 'http-common';

function ChequeBouncesCard(props) {
  const dispatch = useDispatch();
  const {setModalTypeHandler, setLoaderStatusHandler,commoncookie,
    headerLocationId} = useContext(context);  
  const [open, setOpen] = useState(true)
  const [pollTimer, setPollTimer] = useState(null)
  const [paginationData, setPaginationData] = useState({
    currentPage:0,
    page: 0,
    pageSizes: 5,
    searchVal: '',
    searchPageData: [],
    searchData: []
    })

    const {headerupdate, currentPage, page, pageSizes, searchVal, searchPageData,searchData
    } = paginationData

  const {
    salesManReducer: {chequeBounce,chequeBounceCount},
  } = useSelector((state) => state);

  useEffect(() => {
    if(props.mode === 'edit'){
        setOpen(false)
    }
    else{
        setOpen(true)
    }
  },[props.mode])

  // useEffect(() => {
  //   if(props.inView && props.isEnabled ){
  //     const data = {pageCount: page || 0, numPerPage:  pageSizes, searchString: ''}
  //     apiCalls(
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //       dispatch(
  //         getChequeBounceAction(commoncookie,headerLocationId,data),
  //       )
  //     );
  //   }
  // }, [props.inView , props.isEnabled ]);

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
  //   const data = {pageCount: page || 0, numPerPage:  pageSizes, searchString: ''}
  //   props.pollServer(
  //     dispatch(
  //       getChequeBounceAction(commoncookie,headerLocationId,data),
  //     )
  //   );
  // }

  const handlePageChange = async (page) => {
    // if (searchVal) {
    //   setPaginationData({...paginationData, page: page});
    //   let pageChangeData = searchPageData?.slice(
    //     (0 +  pageSizes) * page,
    //     pageSizes * (page + 1),
    //   );
    //   return setPaginationData({...paginationData, searchData: pageChangeData});
    // }

    setPaginationData({...paginationData, page: page});

    const data = {pageCount: page || 0, numPerPage:  pageSizes, searchString: searchVal}

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        getChequeBounceAction(
          commoncookie,
          headerLocationId,
          data
        ),
      )
    );
  }

  const handlePageSizeChange = async (size) => {
    // if (searchVal) {
    //   setPaginationData({...paginationData, pageSizes: size});
    //   let pageChangeData = this.state.searchPageData?.slice(
    //     (0 + size) * page,
    //     size * (page + 1),
    //   );
    //   return setPaginationData({...paginationData, searchData: pageChangeData});
    // }

    setPaginationData({...paginationData, pageSizes: size});

    const data = {pageCount: page || 0, numPerPage:  size, searchString: searchVal}

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        getChequeBounceAction(
          commoncookie,
          headerLocationId,
          data
        ),
      )
    );
  };
  return (
    // <div ref={props.ref1} style={{width : '100%'}}>
    <div 
    ref={(el) => {
      props.ref1(el)
        props.isVisibleRef.current = el
        
    }}
    style={{height:'100%'}}>
      {/* <Grid container bgcolor='white'>
          <Grid size={{ xs: 10, sm: 11, md: 11, lg: 11.5 }}></Grid>
          <Grid size={{ xs: 2, sm: 1, md: 1, lg: 0.5 }}> 
              {
                  props.mode === 'edit' ?
                  <IconButton
                      aria-label='view code'
                      onClick={() => props.setChequeBouncesCardClose(true)}
                      size='large'
                      >
                      <CloseIcon />
                  </IconButton>
                  :
                  ''
              }
          </Grid>
        </Grid> */}
      <Helmet>
                 <meta charSet="utf-8" />
                 <title> {titleURL} | DashBoard </title>
       </Helmet>
      <MaterialTable
        // style={{height: '100%',overflow:'auto'}}
        options={{
          search: false,
          headerStyle: {
            fontSize: headerStyle.fontSize,
            position : 'sticky',
            top : 0,
          },
          maxBodyHeight: '325px',
          minBodyHeight : '325px',
          fixedColumns : true,

    //       cellStyle:{
    //         fontSize: 12,
    // fontWeight:500,
    //       },
          paging:false,
          exportButton: false,
          filtering: false,
          // maxBodyHeight: '410px',
        pageSize: dasboardPageSize,
        pageSizeOptions: [5],
        actionsColumnIndex: -1,
        // search: false
        }}

        page={page}
      onPageChange={(page) => handlePageChange(page)}
      onRowsPerPageChange={(size) => handlePageSizeChange(size)}
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
          {title: 'Customer', field: 'company_name'},
          {
            title: 'Cheque Date',
            field: 'date',
            render: (r) => (
              commonDateFormat(r.date)
            )
          },
          {title: 'Cheque Amount', field: 'amount'},
          {title: 'Bounce Reason', field: 'description'},
        ]}
        data={props?.data[0]?.data || []}
        title={ <Typography
          variant='h6'
          align='left'
          style={{padding : '5px', paddingBottom : '20px'}}
        >
        Cheque Bounces
        </Typography>}
      />
    </div>
  );
}
export default useCommonRef(ChequeBouncesCard)

