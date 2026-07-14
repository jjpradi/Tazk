import { useNavigate } from "react-router-dom";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetDeletedDetails, getSearchDeleteListAction, setSearchDeleteListAction } from "redux/actions/deletedLogDetailsAction";
import CommonSearch from "utils/commonSearch";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Card, Dialog, DialogContent, Fade, IconButton, Tooltip, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Helmet } from "react-helmet-async";
import { titleURL } from "http-common";
import DeletedLogFilter from "./DeletedLogFilter";
import { get_search_company_based_employee, getEmpbasecompanyFilterAction, set_search_company_based_employee } from "redux/actions/attendance_actions";


function DeletedLoggedDetails () {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filterDetails, setFilterDetails] = useState({
    fromDate : '',
    toDate : '',
    searchVal : '',
    selectedUser : []
  })

  const {
    DeleteLogReducer : {DetailList, deleteList, deleteListCount},
    attendanceReducer : {getCompanyBasedEmployeeFilter, searchCompanyBasedEmployeeFilter}
  } = useSelector((state) => state)

  const [paginateData,setPaginateData]=useState({
    searchString:"",
    pageCount:0,
    pageSize : 20
  })

  useEffect(()=>{
    const payload = {
      numPerPage: paginateData.pageSize,
      pageCount: paginateData.pageCount,
      searchString: paginateData.searchString,
      fromDate : filterDetails.fromDate,
      toDate : filterDetails.toDate,
      searchVal : filterDetails.searchVal,
      selectedUser : filterDetails.selectedUser
    }
    dispatch(GetDeletedDetails(payload))
  },[paginateData.pageSize,paginateData.pageCount])

  useEffect(() => {
    const data = {
        searchString : ''
    }
    dispatch(getEmpbasecompanyFilterAction(data))
  }, [])

  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(
    CreateNewButtonContext,
  );
const requestSearch = (e) => {
    const val = e.target.value

    setPaginateData({...paginateData,
      searchString: val})

      dispatch(setSearchDeleteListAction({data:[], numRows:0}));
      const payload = {
        searchString : val,
        pageCount : 0,
        numPerPage : paginateData.pageSize,
        fromDate : filterDetails.fromDate,
        toDate : filterDetails.toDate,
        searchVal : filterDetails.searchVal,
        selectedUser : filterDetails.selectedUser
    }
    dispatch(getSearchDeleteListAction(
      payload,
      setModalTypeHandler,
      setLoaderStatusHandler
    )
    )
  }
  const cancelSearch = () => {

    setPaginateData({...paginateData,
      searchString: ''})

      dispatch(setSearchDeleteListAction({data:[], numRows:0}));
      const payload = {
        searchString : '',
        pageCount : paginateData.pageCount,
        numPerPage : paginateData.pageSize,
        fromDate : filterDetails.fromDate,
        toDate : filterDetails.toDate,
        searchVal : filterDetails.searchVal,
        selectedUser : filterDetails.selectedUser
    }
    dispatch(GetDeletedDetails(
      payload,
      setModalTypeHandler,
      setLoaderStatusHandler
    )
    )
  }

  const handlePageChange = (page) => {
    setPaginateData({...paginateData,
      pageCount: page})
  }

  const handlePageSizeChange = (size) => {
    setPaginateData({...paginateData,
      pageSize: size})
  }

  const handleFilterDialogOpen = () => {
    setDialogOpen(true)
  }

  const handleFilterDialogClose = () => {
    setDialogOpen(false)
  }

  const handleDateChange = (name, value) => {
    const date = value ? moment(value).format('YYYY-MM-DD') : null
    if(name === 'fromDate') {
        setFilterDetails({...filterDetails, fromDate : date})
    }
    else if(name === 'toDate') {
        setFilterDetails({...filterDetails, toDate : date})
    }
  }

  const setSearchValEmployeeFilter = (val) => {
    setFilterDetails({...filterDetails, searchVal : val})
  }

  const requestSearchUser = (val) => {
    setFilterDetails({...filterDetails, searchVal : val})
    dispatch(set_search_company_based_employee([]))

    let data = {
        searchString : val
    }
    dispatch(get_search_company_based_employee(data, setModalTypeHandler, setLoaderStatusHandler))
  }

  const setSearchValue = (val) => {
    setFilterDetails({...filterDetails, selectedUser : val})
  }

  const handleCancel = () => {
    setFilterDetails((prev) => ({...prev, fromDate : '', toDate : '', searchVal : null, selectedUser : []}))
    let data = {
        searchString : paginateData.searchString,
        pageCount : paginateData.pageCount,
        numPerPage : paginateData.pageSize,
        fromDate : '',
        toDate : '',
        searchVal : null,
        selectedUser : []
    }
    dispatch(GetDeletedDetails(data))
    handleFilterDialogClose()
  }

  const handleApply = () => {
    let data = {
        searchString : paginateData.searchString,
        pageCount : paginateData.pageCount,
        numPerPage : paginateData.pageSize,
        fromDate : filterDetails.fromDate,
        toDate : filterDetails.toDate,
        searchVal : filterDetails.searchVal,
        selectedUser : Array.isArray(filterDetails.selectedUser) ? filterDetails.selectedUser : [filterDetails.selectedUser]
    }
    dispatch(GetDeletedDetails(data))
    handleFilterDialogClose()
  }

  const columns = [
    {
      field: 'recordIdentifier', headerName: 'Reference Number / Name', width: 300,
      renderCell: (params) => params.value || 'No Records for older entries',
    },
    {
      field: 'type', headerName: 'Type', width: 280,
      renderCell: (params) => params.value || 'No Records for older entries',
    },
    {
      field: 'record_created', headerName: 'Record Created At', width: 220,
      renderCell: (params) => params.value ? moment(params.value).format('DD/MM/YYYY hh:mm A') : 'No Records for older entries',
    },
    {
      field: 'deletedAt', headerName: 'Record Deleted At', width: 220,
      renderCell: (params) => params.value ? moment(params.value).format('DD/MM/YYYY hh:mm A') : '-',
    },
    { field: 'deletedByFullName', headerName: 'Deleted By', flex: 1, minWidth: 200 },
  ];

  const dataWithId = deleteList?.length ? deleteList.map((row, index) => ({ ...row, id: index })) : [];

    return(
      <>
        <Helmet>
          <meta charSet='utf-8' />
          <title> {titleURL} | Deleted Logged Details</title>
        </Helmet>

        {/* Filter Dialog */}
        {dialogOpen && (
          <Dialog open={dialogOpen} fullWidth maxWidth="xs">
            <DialogContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <Tooltip title='Close' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='left'>
                  <IconButton onClick={() => handleFilterDialogClose()}>
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <DeletedLogFilter
                fromDate={filterDetails.fromDate}
                toDate={filterDetails.toDate}
                handleDateChange={handleDateChange}
                searchVal={filterDetails.searchVal}
                setSearchValEmployeeFilter={setSearchValEmployeeFilter}
                requestSearch={requestSearchUser}
                value={filterDetails.selectedUser}
                setValue={setSearchValue}
                getCompanyBasedEmployeeFilter={getCompanyBasedEmployeeFilter}
                searchCompanyBasedEmployeeFilter={searchCompanyBasedEmployeeFilter}
                roleName={'EMPLOYEE_FILTER'}
                handleCancel={handleCancel}
                handleApply={handleApply}
              />
            </DialogContent>
          </Dialog>
        )}

        <Card
          sx={{
            width: '100%',
            height: 'calc(100vh - 75px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header Row */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1,
              borderBottom: '1px solid #eee',
              flexShrink: 0,
            }}
          >
            <Typography sx={{ fontWeight: 600, fontSize: '15px', whiteSpace: 'nowrap' }}>
              Deleted Logged Details
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CommonSearch
                searchVal={paginateData.searchString}
                cancelSearch={cancelSearch}
                requestSearch={requestSearch}
              />
              <Tooltip title='Filter' TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement='top'>
                <IconButton size='small' onClick={handleFilterDialogOpen}>
                  <FilterAltIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title='Close'>
                <IconButton size='small' onClick={() => navigate(-1)}>
                  <CloseIcon sx={{ fontSize: 22 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Table */}
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <DataGrid
              rows={dataWithId}
              columns={columns}
              pageSizeOptions={[20, 50, 100]}
              paginationMode='server'
              density='compact'
              disableRowSelectionOnClick
              disableExtendRowFullWidth
              rowCount={deleteListCount || 0}
              paginationModel={{ page: paginateData.pageCount, pageSize: paginateData.pageSize }}
              onPaginationModelChange={(model) => {
                if (model.page !== paginateData.pageCount) handlePageChange(model.page);
                if (model.pageSize !== paginateData.pageSize) handlePageSizeChange(model.pageSize);
              }}
              sx={{
                height: '100%',
                border: 0,
                '& .MuiDataGrid-main': { overflow: 'hidden' },
                '& .MuiDataGrid-virtualScroller': { overflowY: 'auto' },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#F4F7FE',
                  fontSize: 12,
                  fontWeight: 700,
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#f5faf8',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f0f0f0',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '1px solid #eee',
                },
              }}
            />
          </Box>
        </Card>
      </>
    )
}

export default DeletedLoggedDetails;
