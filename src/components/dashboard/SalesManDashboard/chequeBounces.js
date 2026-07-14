import MaterialTable, { MTablePagination, MTableToolbar } from 'utils/SafeMaterialTable';
import { Autocomplete, Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, InputAdornment, Menu, MenuItem, Select, TablePagination, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import { getAllChequeStatusAction, getChequeBounceAction, getChequeBounceByIdAction, get_searchChequebounceAction, set_searchCheqbounceAction, updateChequeStatusAction } from 'redux/actions/salesMan_action';
import apiCalls from 'utils/apiCalls';
import { Helmet } from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize, headerStyle, cellStyle, dasboardPageSize } from 'utils/pageSize';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { searchSchemesAction, set_searchSchemesAction } from 'redux/actions/schemes_actions';
import { useInView } from 'react-intersection-observer';
import CommonSearch from 'utils/commonSearch';
import { titleURL } from 'http-common';
import { useLocation } from 'react-router-dom';
import ChequeBounceLandingPage from "components/dashboard/SalesManDashboard/chequeBounceLandingPage";
import { useCustomFetch } from 'utils/useCustomFetch';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import FilterListIcon from '@mui/icons-material/FilterList';
import MenuIcon from '@mui/icons-material/Menu';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { getEmpbasecompanyAction } from 'redux/actions/attendance_actions';
import { getReceiptDetailsBasedOnChequeAction } from 'redux/actions/sales_actions';
import ReceiptPayments from 'components/ReceiptPayments/ReceiptPayments';
import PayInOutDialog from 'pages/accounts/BankReconciliation/payInOutDialog';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import toMomentOrNull from 'utils/DateFixer';
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../utils/stickyTableLayout';
import { ExportCsv } from '@material-table/exporters';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';

export default function ChequeBounces(props) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler, commoncookie,
    headerLocationId } = useContext(context);
  const { pathname } = useLocation()
  const theme = useTheme()
  const storage = getsessionStorage()
  const selectedRole = storage.role_name
  const isLargerScreen = useMediaQuery(theme.breakpoints.up('lg'))
  //  const [searchVal,setsearchVal] = useState('');
  const [paginationData, setPaginationData] = useState({
    headerupdate: 'null',
    currentPage: 0,
    page: 0,
    pageSizes: 20,
    searchVal: '',
    searchPageData: [],
    searchData: []
  })
   const [openAlert, setOpenAlert] = useState(false);
  const [rowData, setRowData] = useState({})
  const [click, setClick] = useState(false)
  const [newopen, setNewOpen] = useState(false)
  const customFetch = useCustomFetch()
  const { ref, inView, entry } = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  const [isApiFinished, setIsApiFinished] = useState(false)

  const {
    salesManReducer: { chequeBounce, chequeBounceCount, searchChequebouncedata, searchChequebouncedataCount, getAllChequeStatus }, UserCreationReducer: { all_user_location },
    attendanceReducer : {get_empbasecompany},
    salesReducer: { receiptByCheque },
    rbacReducer: { menuAccess }
  } = useSelector((state) => state);

  const { headerupdate, currentPage, page, pageSizes, searchVal, searchPageData, searchData
  } = paginationData

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [selectedStatus, setSelectedStatus] = React.useState('');
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState(null);
  const [statusHovered, setStatusHovered] = useState(false)
  const [statusAnchorEl, setStatusAnchorEl] = useState(null)
  const [filterStatus, setFilterStatus] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [remarks, setRemarks] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [bouncedReason, setBouncedReason] = useState(null)
  const [bounceBankCharges, setBounceBankCharges] = useState(null)
  const [chequeBounceConfirm, setChequeBounceConfirm] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [selectedCheque, setSelectedCheque] = useState([])
  const [selectedChequeStatus, setSelectedChequeStatus] = useState(null)
  const [selectedChequeId, setSelectedChequeId] = useState([])
  const [rePresentConfirmation, setRePresentConfirmation] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [payInOpen, setPayInOpen] = useState(false)
  const [chequeDetailOpenForSmallerScreen, setChequeDetailOpenForSmallerScreen] = useState(false);
  const [rowDataIndex, setRowDataIndex] = useState(null)
  const [open, setopen] = useState(false)
  const bounceReasons = ['Insufficient Balance', 'Signature Mismatch', 'Others']
  const [prevSelectedCount, setPrevSelectedCount] = useState(0);
  const [chipData, setChipData] = useState({
  "All": { total_count: 0, total_amount: 0 },
  Bounced: { total_count: 0, total_amount: 0 },
  Cleared: { total_count: 0, total_amount: 0 },
  'Not Presented': { total_count: 0, total_amount: 0 },
  Presented: { total_count: 0, total_amount: 0 },
  'Re-Presented': { total_count: 0, total_amount: 0 },
  'Due Today': { total_count: 0, total_amount: 0 },
  'Post Dated': {total_count: 0, total_amount: 0 },
  'Expired': {total_count: 0, total_amount: 0 }
});
  const [dateError, setDateError] = useState('');
  const [selectedChip, setSelectedChip] = useState("All");


// console.log("headerLocationId",headerLocationId)
  useEffect(() => { (async () => {
    dispatch(set_searchCheqbounceAction({ data: [], numRows: 0 }));
      // const data = { pageCount: page || 0, numPerPage: pageSizes, searchString: '', chequeStatus: filterStatus }
      let data = props.rowIndex ? { pageCount: page || 0, numPerPage: pageSizes, searchString: '', chequeStatus: filterStatus, customer_id: props?.rowIndex?.customer_ids, chip: selectedChip, } :
      { pageCount: page || 0, numPerPage: pageSizes, searchString: paginationData.searchVal, chequeStatus: filterStatus, chip: selectedChip }
     await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          getChequeBounceAction(
            commoncookie,
            headerLocationId,
            data,(response)=>{
          //    if (response && response.data.length) {
          //   handleDetailClick(response.data[0], !isLargerScreen, true);
          // }

          if (response && response.chipValues?.length > 0) {
            const updatedChipData = { ...chipData };

            response.chipValues.forEach((item) => {
              updatedChipData[item.status_name] = {
                total_count: item.total_count,
                total_amount: item.total_amount,
              };
            });

            setChipData(updatedChipData);
          }
        })
      )
      ).finally(() => setIsApiFinished(true));
  })();
}, [headerLocationId, page, pageSizes, filterStatus, selectedChip]);

  useEffect(() => {
    dispatch(getMenuAccessAction(selectedRole))
  }, [])

  useEffect(() => { (async () => {


    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      await dispatch(
        getAllChequeStatusAction(
        ),
      )
    )
  })();
}, []);

  useEffect(() => {
    let timer;
    if (chequeBounceConfirm) {
      setCountdown(5); // reset timer when dialog opens
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [chequeBounceConfirm]);

  const Dispatch1 = async() => {
    const data = { pageCount: page || 0, numPerPage: pageSizes, searchString: '' }

    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
       dispatch(
          getChequeBounceAction(
            commoncookie,
            headerLocationId,
            data,(response)=>{
            //  if(response && response.data.length){
            //   handleDetailClick(response.data[0], !isLargerScreen, true)
            //  }
            }
          ),
        ).finally((res) => setIsApiFinished(true))
      // dispatch(
      //   listSalesAction(
      //     commoncookie,
      //     headerLocationId,
      //     setModalTypeHandler,
      //     setLoaderStatusHandler,
      //   ),
      // ),
    );
  };

  // useEffect(() => {
  //   Dispatch1();
  // }, [page, pageSize]);

  // useEffect(() => {
  //   if (chequeBounce && chequeBounce?.length > 0) {
  //     handleDetailClick(chequeBounce[0])
  //   }
  // }, [chequeBounce])

  // useEffect(() => {
  //   const data = {pageCount: page || 0, numPerPage:  pageSizes, searchString: searchVal}

  //   apiCalls(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,
  //     dispatch(
  //       getChequeBounceAction(
  //         commoncookie,
  //         headerLocationId,
  //         data
  //       ),
  //     )
  //   );
  // }, [page, pageSizes])

  const handlePageChange = async (page) => {
    // if (searchVal) {
    //   setPaginationData({...paginationData, page: page});
    //   let pageChangeData = searchPageData?.slice(
    //     (0 +  pageSizes) * page,
    //     pageSizes * (page + 1),
    //   );
    //   return setPaginationData({...paginationData, searchData: pageChangeData});
    // }
    setPaginationData((prev) => ({
      ...prev,
      page: page,
    }));
    // setPaginationData({ ...paginationData, page: page });

    // const data = {pageCount: page || 0, numPerPage:  pageSizes, searchString: searchVal}

    // apiCalls(
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    //   dispatch(
    //     getChequeBounceAction(
    //       commoncookie,
    //       headerLocationId,
    //       data
    //     ),
    //   )
    // );
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

    setPaginationData((prev) => ({
              ...prev,
              pageSizes: size,
              page: 0, 
            }));

    // const data = {pageCount: page || 0, numPerPage:  size, searchString: searchVal}

    // apiCalls(
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    //   dispatch(
    //     getChequeBounceAction(
    //       commoncookie,
    //       headerLocationId,
    //       data
    //     ),
    //   )
    // );
  };

  const requestSearch = (e) => {
    let val = e.target.value;
    setPaginationData({ ...paginationData, searchVal: val, page: 0, currentPage: 0 })
    // if (val.trim() !== '') {
    if (val.length >= 3 || val.length === 0) {
    dispatch(set_searchCheqbounceAction({ data: [], numRows: 0 }))
    }
    // }
    const body = {
      searchString: val,
      employeeId: commoncookie,
      headerLocationId: headerLocationId,
      chip: selectedChip,
      pageCount: 0,
      numPerPage: pageSizes,
      chequeStatus: filterStatus
    }
    dispatch(get_searchChequebounceAction(
      body,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      async(response)=>{
        const res = await response
        // if (res && res.data.length) {
        //   handleDetailClick(res.data[0], !isLargerScreen, true);
        // }

        if (res && res.chipValues?.length > 0) {
          const updatedChipData = { ...chipData };

          res.chipValues.forEach((item) => {
            updatedChipData[item.status_name] = {
              total_count: item.total_count,
              total_amount: item.total_amount,
            };
          });

          setChipData(updatedChipData);
        }
      }
    ))
  }
  const cancelSearch = () => {
    dispatch(set_searchCheqbounceAction({ data: [], numRows: 0 }))
    setPaginationData({ ...paginationData, searchVal: '', page: 0 })
    const data = { pageCount: page || 0, numPerPage: pageSizes, searchString: '', chequeStatus: filterStatus, chip: selectedChip }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
          getChequeBounceAction(
            commoncookie,
            headerLocationId,
            data,(response)=>{
          //    if (response && response.data.length) {
          //   handleDetailClick(response.data[0], !isLargerScreen, true);
          // }

          if (response && response.chipValues?.length > 0) {
            const updatedChipData = { ...chipData };

            response.chipValues.forEach((item) => {
              updatedChipData[item.status_name] = {
                total_count: item.total_count,
                total_amount: item.total_amount,
              };
            });

            setChipData(updatedChipData);
          }
        }
          ),
        )
    );
  }


  const handleDetailClick = async (rowData, internalCall, initialCall) => {
    setRowData(rowData)
    // if(isLargerScreen || internalCall){
      let id = rowData?.id
      await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getChequeBounceByIdAction(id)),
      )
      // if(!initialCall){
      //   setChequeDetailOpenForSmallerScreen(true)
      // }
      // if(click){
      setopen(true)
      // }
    // }
    // else{
      const index = chequeBounce.findIndex(item => item?.id === rowData?.id)
      setRowDataIndex(index)
    //   setopen(true)
    // }
  }




  const handleEditClick = (event, rowData, type) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    if(type !== 'bulk'){
      setSelectedRow(rowData);
    }
    else{
      setSelectedRow(rowData[0])
    }
  };
  const handleStatusSelect = (statusObj) => {
     if (headerLocationId === 'null') {
      setOpenAlert(true)
      return
    }
    dispatch(getEmpbasecompanyAction())
    setSelectedStatus(statusObj.status_name);
    setSelectedStatusId(statusObj.id);
    setAnchorEl(null);
    setOpenConfirm(true);
    setFocus(true)
  };


  const handleConfirm = async (isBounceConfirmed) => {
    setPaginationData({ ...paginationData, searchVal: '', page: 0 })
    if(selectedCheque.length > 0){
      if (selectedCheque.length === 0 || selectedChequeId.length === 0) return;
    }
    else{
      if (!selectedRow || !selectedStatusId) return;
    }
    if((selectedStatusId === 4 || selectedStatusId === 6) && !isBounceConfirmed){
      setChequeBounceConfirm(true)
      return
    }

    if(selectedStatusId === 5){
      setOpenConfirm(false)
      setFocus(false)
      setRePresentConfirmation(true)
      dispatch(getReceiptDetailsBasedOnChequeAction({cheque_id: selectedRow.id}))
      return
    }

    let chequeId = null
    const data =
    {
      cheque_status: selectedStatusId,
      remarks: remarks,
    }
    if (selectedStatusId === 3 && !selectedDate) {
      setDateError('Date is required');
      return;
    } else {
      data.cleared_date = selectedDate
      setDateError('');
    }
    if(selectedStatusId === 2 || selectedStatusId === 5){
      data.presented_date = selectedDate
      data.cheque_presented_employee = selectedEmployee ? selectedEmployee.employee_id : null
    }
    // else if(selectedStatusId == 3){
    //   data.cleared_date = selectedDate
    // }
    else if(selectedStatusId === 4){
      data.bounced_date = selectedDate
      data.bounced_reason = bouncedReason
      data.bounce_charges = bounceBankCharges
    }
    else{
      data.presented_date = null
      data.remarks = null
      data.cheque_presented_employee = null
    }

    if(selectedCheque.length > 0){
      data.cheque_id = selectedChequeId
      chequeId = selectedChequeId[0]
    }
    else{
      chequeId = selectedRow.id
    }

    const data1 = { pageCount: page || 0, numPerPage: pageSizes, searchString: '', chequeStatus: filterStatus, chip: selectedChip }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      await dispatch(
        updateChequeStatusAction(selectedRow.id,headerLocationId, data)
      ),
     await dispatch(
        getChequeBounceAction(
          commoncookie,
          headerLocationId,
          data1,
          (response)=>{
          //    if (response && response.data.length) {
          //   handleDetailClick(response.data[0], !isLargerScreen, true);
          // }

          if (response && response.chipValues?.length > 0) {
            const updatedChipData = { ...chipData };

            response.chipValues.forEach((item) => {
              updatedChipData[item.status_name] = {
                total_count: item.total_count,
                total_amount: item.total_amount,
              };
            });

            setChipData(updatedChipData);
          }
        }),
      )
    );

    setOpenConfirm(false);
    setFocus(false)
    setSelectedRow(null);
    setSelectedStatus('');
    setSelectedStatusId(null);
    setSelectedDate(null)
    setSelectedEmployee(null)
    setRemarks(null)
    setChequeBounceConfirm(false)
    setBouncedReason(null)
    setBounceBankCharges(null)
    setSelectedCheque([])
    setSelectedChequeId([])
    setSelectedChequeStatus(null)
  };



  const handleCancel = (type) => {
    setOpenConfirm(false);
    setFocus(false);
    setSelectedRow(null);
    setSelectedStatus('');
    setSelectedDate(null)
    setSelectedEmployee(null)
    setRemarks(null)
    setChequeBounceConfirm(false)
    setBouncedReason(null)
    setBounceBankCharges(null)
    setSelectedCheque([])
    setSelectedChequeId([])
    setSelectedChequeStatus(null)
    setRePresentConfirmation(false)
    setReceiptOpen(false)
    setPayInOpen(false)
    if(type === 'receiptClose' || type === 'payInClose'){
       const data1 = { pageCount: page || 0, numPerPage: pageSizes, searchString: '', chequeStatus: filterStatus, chip: selectedChip }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          getChequeBounceAction(
            commoncookie,
            headerLocationId,
            data1,
            (response)=>{
              // if (response && response.data.length) {
              //   handleDetailClick(response.data[0], !isLargerScreen, true);
              // }

              if (response && response.chipValues?.length > 0) {
                const updatedChipData = { ...chipData };

                response.chipValues.forEach((item) => {
                  updatedChipData[item.status_name] = {
                    total_count: item.total_count,
                    total_amount: item.total_amount,
                  };
                });

                setChipData(updatedChipData);
              }
            }
          ),
        )
      )
    }
  };

  const handleStatusFilterClick = (event) => {
    setStatusAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setStatusHovered(false)
    setStatusAnchorEl(null)
  }

  const handleStatusFilter = (status) => {
    setStatusHovered(false)
    setStatusAnchorEl(null)
    setFilterStatus(status)
    setPaginationData((prev) => ({ ...prev, page: 0 }))
  }

  const dateLabel = (status) => {
    switch(status){
      case 'Presented':
        return 'Presented Date'

      case 'Cleared':
        return 'Cleared Date'

      case 'Bounced':
        return 'Bounced Date'

      case 'Re-Presented':
        return 'Re-Presented Date'
    }
  }

  const handleDateChange = (date) => {
    setSelectedDate(moment(date).format('YYYY-MM-DD'))
  }

  const chequesExport = UserRightsAuthorization(menuAccess[selectedRole], 'cash_bank__cheques', 'can_export')
  const chequesRepresentedReceiptsCreate = UserRightsAuthorization(menuAccess[selectedRole], 'sales__receipts', 'can_create')
  const chequesRepresentedPayInCreate = UserRightsAuthorization(menuAccess[selectedRole], 'payments__pay_in_pay_out', 'can_create')

  const getActionStatus = (status, type) => {
    switch(status){
      case 'Not Presented':
        return getAllChequeStatus.filter(status => ['Presented', 'Return To Customer'].includes(status.status_name))

      case 'Presented':
      case 'Re-Presented':
        return getAllChequeStatus.filter(status => ['Cleared', 'Bounced'].includes(status.status_name))

      case 'Cleared':
      case 'Return To Customer':
        return []

      case 'Bounced':
        return getAllChequeStatus.filter(status => (type === 'Receipts' && !chequesRepresentedReceiptsCreate) || (type === 'Pay In' && !chequesRepresentedPayInCreate) ? ['Return To Customer'].includes(status.status_name) : ['Re-Presented', 'Return To Customer'].includes(status.status_name))

      default:
        return ['Return To Customer']
    }
  }

  const handleSelectionChange = (rows) => {

    if (headerLocationId === 'null' && rows.length > prevSelectedCount) {
      setOpenAlert(true);

      setSelectedCheque([]);
      setSelectedChequeStatus(null);
      setSelectedChequeId([]);

      return;
    }

    setPrevSelectedCount(rows.length);

    if(rows.length === 0){
      setSelectedCheque([])
      setSelectedChequeStatus(null)
      setSelectedChequeId([])
      return
    }

    const status = rows[0].status_name
    const filteredCheques = rows.filter(r => r.status_name === status)
    setSelectedCheque(filteredCheques)
    setSelectedChequeStatus(status)
    setSelectedChequeId(filteredCheques.map(d => d.id))
  }

  useEffect(() => {
    if(rowDataIndex !== null){
      const indexedRowData = chequeBounce[rowDataIndex]
      handleDetailClick(indexedRowData, true)
    }
  }, [rowDataIndex])

  const StyledChip = ({ label, count, amount, color, isSelected, onClick }) => (
    <Box
      onClick={onClick}
      sx={{
        backgroundColor: color,
        color: '#fff',
        borderRadius: '6px',
        px: 1.2, 
        py: 0.3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1px',
        fontWeight: 500,
        boxShadow: isSelected ? 3 : 1,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        border: isSelected ? '1.5px solid #000' : '1.5px solid transparent',
        transform: isSelected ? 'scale(1.04)' : 'scale(1)',
        transition: 'all 0.2s ease-in-out',
        minWidth: 80,
        height: 36, 
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontSize: '0.62rem', 
          fontWeight: 600,
          lineHeight: 1.2,
          textAlign: 'center',
        }}
      >
        {label} {label !== 'All' && (count || 0)}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          fontSize: '0.65rem', 
          opacity: 0.9,
          textAlign: 'center',
        }}
      >
       {label !== 'All' && (`₹ ${amount?.toLocaleString() || 0}`)}
      </Typography>
    </Box>
  );







  return (
    <div ref={ref}>
      <Helmet>
        <meta charSet="utf-8" />
        <title> {titleURL} |  {pathname === "/accounts/cheques" ? "Cheque" : "Salesman Dashboard"}  </title>
      </Helmet>
      {
        !open &&
          <Grid container spacing={1}>
            <Grid size={12}>

            <div className="noBorder-wrapper">
              <MaterialTable
                // totalCount= {searchVal ? searchChequebouncedataCount : chequeBounceCount}
                totalCount={chequeBounceCount}
                style={{ height: 'calc(100vh - 80px)',overflow:'hidden' }}
                components={{
                  ...stickyTableComponents,
                  Pagination: (props) => (
                                    <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "flex-end",
                                      alignItems: "center",
                                       padding: "8px 16px",
                                       }}>
                                        <TablePagination
                                        {...props}
                                        count={chequeBounceCount} 
                        page={paginationData.page || 0}
                        rowsPerPage={paginationData.pageSizes || 20}
                        rowsPerPageOptions={[20, 50, 100]}
                        onPageChange={(event, newPage) => handlePageChange(newPage)}
                        onRowsPerPageChange={(event) =>
                          handlePageSizeChange(parseInt(event.target.value, 10))
                        }
                        labelRowsPerPage="Rows per page:" />
                                        </div>),
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
                        <div style={{ width: '100%' }}>
                          <MTableToolbar {...props} />
                        </div>

                      <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '24px', 
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 16,
                            }}
                          >
                            <StyledChip
                              label="All"
                              // count={chipData.All?.total_count}
                              // amount={chipData.All?.total_amount}
                              color="#1976d2"
                              isSelected={selectedChip === 'All'}
                              onClick={() => {
                                setSelectedChip('All')
                                setPaginationData((prev) => ({ ...prev, page: 0 }))
                                setFilterStatus(null)
                              }}
                            />
                            <StyledChip
                              label="Not Presented"
                              count={chipData['Not Presented']?.total_count}
                              amount={chipData['Not Presented']?.total_amount}
                              color="#1976d2"
                              isSelected={selectedChip === 'Not Presented'}
                              onClick={() => {
                                setSelectedChip('Not Presented')
                                setPaginationData((prev) => ({ ...prev, page: 0 }))
                                setFilterStatus(null)
                              }}
                            />
                            <StyledChip
                              label="Due Today"
                              count={chipData['Due Today']?.total_count}
                              amount={chipData['Due Today']?.total_amount}
                              color="#1976d4"
                              isSelected={selectedChip === 'Due Today'}
                              onClick={() => {
                                setSelectedChip('Due Today')
                                setPaginationData((prev) => ({ ...prev, page: 0 }))
                                setFilterStatus(null)
                              }}
                            />
                            <StyledChip
                              label="Post Dated"
                              count={chipData['Post Dated']?.total_count}
                              amount={chipData['Post Dated']?.total_amount}
                              color="#1976d6"
                              isSelected={selectedChip === 'Post Dated'}
                              onClick={() => {
                                setSelectedChip('Post Dated')
                                setPaginationData((prev) => ({ ...prev, page: 0 }))
                                setFilterStatus(null)
                              }}
                            />
                            {/* <StyledChip
                              label="Not Presented"
                              count={chipData['Not Presented']?.total_count}
                              amount={chipData['Not Presented']?.total_amount}
                              color="#1c5a98"
                              isSelected={selectedChip === 'Not Presented'}
                              onClick={() => setSelectedChip('Not Presented')}
                            />
                            <StyledChip
                              label="Presented"
                              count={chipData.Presented?.total_count}
                              amount={chipData.Presented?.total_amount}
                              color="#1976d2"
                              isSelected={selectedChip === 'Presented'}
                              onClick={() => setSelectedChip('Presented')}
                            />
                            <StyledChip
                              label="Re-Presented"
                              count={chipData['Re-Presented']?.total_count}
                              amount={chipData['Re-Presented']?.total_amount}
                              color="#0288d1"
                              isSelected={selectedChip === 'Re-Presented'}
                              onClick={() => setSelectedChip('Re-Presented')}
                            /> */}
                            <StyledChip
                              label="Expired"
                              count={chipData.Expired?.total_count}
                              amount={chipData.Expired?.total_amount}
                              color="#914f23"
                              isSelected={selectedChip === 'Expired'}
                              onClick={() => {
                                setSelectedChip('Expired')
                                setPaginationData((prev) => ({ ...prev, page: 0 }))
                                setFilterStatus(null)
                              }}
                            />
                            <StyledChip
                              label="Bounced"
                              count={chipData.Bounced?.total_count}
                              amount={chipData.Bounced?.total_amount}
                              color="#d32f2f"
                              isSelected={selectedChip === 'Bounced'}
                              onClick={() => {
                                setSelectedChip('Bounced')
                                setPaginationData((prev) => ({ ...prev, page: 0 }))
                                setFilterStatus(null)
                              }}
                            />
                            {/* <StyledChip
                              label="Cleared"
                              count={chipData.Cleared?.total_count}
                              amount={chipData.Cleared?.total_amount}
                              color="#2e7d32"
                              isSelected={selectedChip === 'Cleared'}
                              onClick={() => setSelectedChip('Cleared')}
                            /> */}
                          </div>

                          <div style={{ width: '250px' }}>
                          <CommonSearch
                            searchVal={searchVal}
                            cancelSearch={cancelSearch}
                            requestSearch={requestSearch}
                            focus = {focus}
                          />
                          {/* <TextField
                                      autoFocus={searchVal ? true : false}
                                      fullWidth
                                      sx={{
                                        borderRadius: '8px',
                                        pr: '10px',
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
                        </div>
                      </div>
                       </div>
                    </>
                  )
                }}
                onRowClick={(event, rowData) => {
                  if (headerLocationId === 'null') {
                    setOpenAlert(true);
                    return; 
                  }

                  // setClick(true);
                  handleDetailClick(rowData);
                }}
                page={paginationData.page}
                onPageChange={(page) => handlePageChange(page)}
                onRowsPerPageChange={(size) => handlePageSizeChange(size)}
                options={getStickyTableOptions({
                  headerStyle,
                  bodyOffset: 200,
                  cellStyle,
                  options:{
                    showEmptyDataSourceMessage: isApiFinished,
                  exportButton: chequesExport ? true : false,
                  filtering: false,
                  actionsColumnIndex: -1,
                  // maxBodyHeight: maxBodyHeight,
                  // minBodyHeight: maxBodyHeight,
                  pageSize: paginationData.pageSizes,
                  pageSizeOptions: [20, 50, 100],
                  totalCount: chequeBounceCount,
                  initialPage: currentPage,
                  tableLayout: "auto",
                  toolbar: true,
                  search: false,
                  overflowY: 'auto',
                  // rowStyle: (row) => ({
                  //   backgroundColor: rowData?.id === row.tableData?.id ? '#D5DEF9' : '#FFFFFF'
                  // }),
                  selection: !(selectedChip === 'Bounced' || selectedChip === 'Cleared'),
                  selectionProps: rowData => ({
                    disabled: (selectedChequeStatus && (rowData.status_name === 'Bounced' ? !selectedChequeId.includes(rowData.id) : rowData.status_name !== selectedChequeStatus)) 
                    // || rowData.status_name === 'Cleared'
                  }),
                  exportMenu: chequesExport ? [
                    {
                      label: 'Export CSV',
                      exportFunc: (cols, data) => {
                        const payloadData = props.rowIndex ? { pageCount: 0, numPerPage: chequeBounceCount, searchString: '', chequeStatus: filterStatus, customer_id: props?.rowIndex?.customer_ids, chip: selectedChip, } :
                          { pageCount: 0, numPerPage: chequeBounceCount, searchString: "", chequeStatus: filterStatus, chip: selectedChip }
                        apiCalls(
                          setModalTypeHandler,
                          setLoaderStatusHandler,
                          dispatch(
                            getChequeBounceAction(
                              commoncookie,
                              headerLocationId,
                              payloadData,(response)=>{
                                const columns = [
                                { title: 'ID', field: 'id'},
                                { title: 'Customer', field: 'company_name' },
                                { title: 'Location Name', field: 'location_name' },
                                { title: 'Receipt Date', field: 'entry_date'},
                                { title: 'Cheque Date', field: 'date'},
                                { title: 'Cheque Amount', field: 'amount', align: 'right', cellStyle: { textAlign: 'right' } },
                                { title: 'Cheque Number', field: 'cheque_number' },
                                { title: 'Invoice Number', field: 'invoice_number' },
                                { title: 'Status', field: 'status_name' },
                              ]
                              const exportData = response.data.map((d => {
                                const date = new Date(d.date);
                                return { ...d, date: date.toLocaleDateString('en-GB') }
                              }))
                                ExportCsv(columns, exportData, 'Cheque')
                          })
                        )
                        )
                      }
                    }
                  ] : []
                  }
                })}
                onSelectionChange={handleSelectionChange}
                columns={[
                  { title: 'Customer', field: 'company_name' },
                  {
                    title: 'Receipt Date',
                    field: 'entry_date',
                  },
                  {
                    title: 'Cheque Date',
                    field: 'date',
                    render: rowData => {
                      const date = new Date(rowData.date);
                      return date.toLocaleDateString('en-GB');
                    }
                  },
                  { title: 'Cheque Amount', field: 'amount', align: 'right', cellStyle: { textAlign: 'right' } },
                  { title: 'Cheque Number', field: 'cheque_number' },
                  { title: 'Invoice Number', field: 'invoice_number' },
                  { title: (
                    <Box
                      sx = {{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                      onMouseEnter = {() => setStatusHovered(true)}
                      onMouseLeave = {handleClose}
                    >
                      {'Status'}
                      {
                        statusHovered && (
                          <>
                            <IconButton
                              onClick={handleStatusFilterClick}
                              sx={{ ml: 1 }}
                            >
                              <FilterListIcon fontSize='small' />
                            </IconButton>

                            <Menu
                              anchorEl = {statusAnchorEl}
                              open = {Boolean(statusAnchorEl)}
                              onClose = {handleClose}
                              anchorOrigin = {{ vertical: 'bottom', horizontal: 'right' }}
                              transformOrigin = {{ vertical: 'top', horizontal: 'right' }}
                            >
                              <MenuItem selected={filterStatus === null} onClick={() => handleStatusFilter(null)}>All</MenuItem>
                              {
                                getAllChequeStatus.map(d => (
                                  <MenuItem key={d.id} selected={filterStatus === d.status_name}  onClick={() => handleStatusFilter(d.status_name)}>
                                    {d.status_name}
                                  </MenuItem>
                                ))
                              }
                            </Menu>
                          </>
                        )
                      }
                    </Box>
                  ), 
                    field: 'status_name' },
                  // {
                  //   title: 'Action',
                  //   field: 'actions',
                  //   render: (rowData) => (
                  //     <IconButton color="primary" disabled={rowData.status_name === 'Cleared'} onClick={(e) => handleEditClick(e, rowData)}>
                  //       <MenuIcon />
                  //     </IconButton>
                  //   )
                  // }
                  {
                    title: 'Action',
                    field: 'actions',
                    render: (rowData) => {

                      let iconColor = '#1976d2'; 
                      if (rowData.status_name === 'Cleared') iconColor = '#2e7d32'; 
                      else if (rowData.status_name === 'Bounced' || rowData.status_name === 'Return To Customer') iconColor = '#d32f2f'; 
                      // Bulk mode active
                      if (selectedCheque.length > 0) {
                        const isFirstSelected = selectedCheque[0].tableData.id === rowData.tableData.id;
                        if (isFirstSelected) {
                          return (
                            <IconButton
                              sx={{
                                color: iconColor,
                                opacity: 1, 
                                pointerEvents: rowData.status_name === 'Cleared' || rowData.status_name === 'Return To Customer' ? 'none' : 'auto', 
                              }}
                              onClick={(e) => handleEditClick(e, selectedCheque, 'bulk')}
                            >
                              <MenuIcon />
                            </IconButton>
                          );
                        }
                        return null; // Hide for other selected rows
                      }

                      //  || (rowData.status_name === 'Bounced' && rowData.receipt_id === null)

                      // Normal per-row action
                      return (
                        <IconButton
                          sx={{
                            color: iconColor,
                            opacity: 1, 
                            pointerEvents: rowData.status_name === 'Cleared' || rowData.status_name === 'Return To Customer' ? 'none' : 'auto', 
                          }}
                          onClick={(e) => handleEditClick(e, rowData)}
                        >
                          <MenuIcon />
                        </IconButton>
                      );
                    }
                  }

                ]}
                // data={searchChequebouncedata?.length > 0 || searchVal.length > 0 ? searchChequebouncedata : chequeBounce}
                data={chequeBounce}
                title={<Typography
                  variant='h6'
                  align='left'
                  style={{ paddingTop: '10px', paddingBottom: '10px' }}
                >
                  Cheques
                </Typography>}
              />
            </div>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                {/* {console.log(getActionStatus(selectedRow?.status_name), selectedRow, 'dfhjkdsf')} */}
                {
                // getAllChequeStatus
                //   ?.filter((status) => getActionStatus(selectedRow.status_name).includes(status.status_name))
                  getActionStatus(selectedRow?.status_name, selectedRow?.type)?.map((status) => (
                    <MenuItem
                      key={status.id}
                      onClick={() => handleStatusSelect(status)}
                    >
                      {status.status_name}
                    </MenuItem>

                  ))}
                  {/* <MenuItem
                    onClick={() => handleStatusSelect({ id: 6, status_name: 'Return to Customer' })}
                  >
                  Return to Customer
                  </MenuItem> */}
              </Menu>

              <LocationAlert open={openAlert} onClose={() => setOpenAlert(false)} />

              <Dialog open={openConfirm}>
                <DialogTitle>Confirm Status Change</DialogTitle>
                <DialogContent>
                  <Grid container spacing={3}>
                    <Grid size={12}>
                      <Typography variant='h6'>
                        {`Are you sure you want to change the status to "${selectedStatus}" ?`}
                      </Typography>
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,
                        md: 6
                      }}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label={dateLabel(selectedStatus)}
                          value={toMomentOrNull(selectedDate)}
                          minDate={selectedRow?.date ? dayjs(selectedRow.date) : undefined}
                          disableFuture
                          format="DD/MM/YYYY"
                          onChange={(date) => {
                            handleDateChange(date ? date.toDate() : null);
                            setDateError('');
                          }}
                          slotProps={{ textField: { fullWidth: true, required: selectedStatusId === 3, variant: "filled", onKeyDown: (e) => e.preventDefault(), error: !!dateError, helperText: dateError } }}
                        />
                      </LocalizationProvider>
                    </Grid>

                    {
                      (selectedStatus === 'Presented' || selectedStatus === 'Re-Presented') &&
                      <Grid
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <Autocomplete
                          value={selectedEmployee}
                          options={get_empbasecompany}
                          getOptionLabel={(option) => option.full_name}
                          onChange={(event, newValue) => setSelectedEmployee(newValue)}
                          renderInput={(params) => (
                            <TextField
                              { ...params }
                              label='Select Employee'
                              variant='filled'
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                    }

                    {
                      selectedStatus === 'Bounced' &&
                      <Grid
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <Autocomplete
                          value={bouncedReason}
                          options={bounceReasons}
                          onChange={(event, newValue) => setBouncedReason(newValue)}
                          renderInput={(params) => (
                            <TextField
                              { ...params }
                              label='Bounce Reason'
                              variant='filled'
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                    }

                    {
                      selectedStatus === 'Bounced' &&
                      <Grid
                        size={{
                          xs: 12,
                          md: 6
                        }}>
                        <TextField
                          value={bounceBankCharges}
                          variant='filled'
                          label='Bank Charges'
                          fullWidth
                          onChange={(event) => setBounceBankCharges(event.target.value)}
                        />
                      </Grid>
                    }

                    <Grid size={12}>
                      <TextField
                        value={remarks}
                        variant='filled'
                        label='Remarks'
                        multiline
                        fullWidth
                        onChange={(event) => setRemarks(event.target.value)}
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => handleCancel()} variant="contained" color="error">Cancel</Button>
                  <Button variant="contained" color="primary" onClick={() => handleConfirm(false)}>
                    OK
                  </Button>
                </DialogActions>
              </Dialog>

              <Dialog open={chequeBounceConfirm}>
                <DialogTitle>
                  {`${selectedStatusId === 4 ? 'Cheque Bounce Confirmation' : 'Cheque Return Confirmation'}`}
                </DialogTitle>
                
                <DialogContent>
                  <Typography variant='h6'>Are you sure you want to mark this cheque as {`${selectedStatusId === 4 ? 'bounced' : 'returned'}`}?</Typography>
                  <Typography variant='h6'>This action will revert the associated receipt/payment entries and cannot be undone.</Typography>
                </DialogContent>

                <DialogActions>
                  <Button onClick={() => handleCancel()} variant="contained" color="error">Cancel</Button>
                  <Button variant="contained" color="primary" onClick={() => handleConfirm(true)} disabled={countdown > 0}>OK {countdown > 0 && `(${countdown})`}</Button>
                </DialogActions>
              </Dialog>

              <Dialog open={rePresentConfirmation}>
                <DialogTitle>
                  Cheque Re-Present Confirmation
                </DialogTitle>

                <DialogContent>
                  <Typography variant='h6'>Are you sure you want to re-present this cheque?</Typography>
                  <Typography variant='h6'>
                    {
                      selectedRow ?
                        selectedRow.receipt_id ? 
                          'By confirming, the receipt entry form will open, and you will need to create the new receipt manually.'
                        : 'By confirming, the pay in form will open, and you will need to create the new pay in manually.'
                      : ''
                    }
                  </Typography>
                </DialogContent>

                <DialogActions>
                  <Grid container spacing={3} display='flex' justifyContent='flex-end'>
                    <Grid>
                      <Button variant='contained' color='error' onClick={() => handleCancel()}>Cancel</Button>
                    </Grid>
                    <Grid>
                      <Button variant='contained' onClick={() => {
                        setRePresentConfirmation(false)
                        if(selectedRow.receipt_id){
                          setReceiptOpen(true)
                        }
                        else{
                          setPayInOpen(true)
                        }
                      }}>OK</Button>
                    </Grid>
                  </Grid>
                </DialogActions>
              </Dialog>

              {
                receiptOpen &&
                  <ReceiptPayments
                    paymentOpen = {receiptOpen}
                    handleClose = {() => handleCancel('receiptClose')}
                    editData = {{...receiptByCheque, chequeData: selectedRow, representDate: selectedDate, selectedEmployee: selectedEmployee ? selectedEmployee.employee_id : null, remarks: remarks}}
                    type = 'CHEQUE_REPRESENT'
                    pageType = {''}
                    custType = {'CUSTOMER'}
                    responseType = {'cashIn'}
                    entryType = 'new'
                    sales_items = {[]}
                    selectedInvoice = {receiptByCheque?.receiptDetails[0].sale_id}
                    selectedCustomer = {{}}
                  />
              }

              {
                payInOpen &&
                <PayInOutDialog
                  open = {payInOpen}
                  handleClose={() => handleCancel('payInClose')}
                  type = 'CHEQUE_REPRESENT'
                  requestMode = {'1'}
                  paymentData = {{...receiptByCheque, chequeData: selectedRow, representDate: selectedDate, selectedEmployee: selectedEmployee ? selectedEmployee.employee_id : null, remarks: remarks}}
                />
              }

            </Grid>


            {/* {
              newopen === false && chequeBounce && chequeBounce?.length > 0 && isLargerScreen &&
              <Grid size={5}>
                <ChequeBounceLandingPage
                // handleDelete={handleDelete}
                // handleEdit={handleEdit}
                />
              </Grid>
            } */}

          </Grid>
      }
      {/* {
        chequeDetailOpenForSmallerScreen && isLargerScreen && */}
      {open && <Grid container spacing={3} sx={{ height: '90vh',overflowY: 'auto','&::-webkit-scrollbar': {display: 'none',},scrollbarWidth: 'none',}}>
        <Grid size={12} >
          <Grid container spacing={3} justifyContent='flex-end'>
            <Grid>
              <Button variant='contained' onClick={() =>{setClick(false); setopen(false); setChequeDetailOpenForSmallerScreen(false);}}>Back</Button>
            </Grid>

            <Grid>
              <IconButton onClick={() => setRowDataIndex(rowDataIndex - 1)} disabled={rowDataIndex === 0}>
                <ArrowBackIosIcon />
              </IconButton>
            </Grid>

            <Grid>
              <IconButton onClick={() => setRowDataIndex(rowDataIndex + 1)} disabled={rowDataIndex === chequeBounce   .length - 1}>
                <ArrowForwardIosIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={12}>
          <ChequeBounceLandingPage
            // handleDelete={handleDelete}
            // handleEdit={handleEdit}
          />
        </Grid>
      </Grid>}
      {/* } */}
    </div>
  );
}

