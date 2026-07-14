import React, { useContext, useEffect, useState } from 'react'
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import AddIcon from '@mui/icons-material/Add';
import AlertsForm from './Form';
import { useDispatch, useSelector } from 'react-redux';
import { ListAlerts, getSearchAlertsAction, setSearchAlertsListAction } from 'redux/actions/asst_alerts_actions';
import { formatTime12Hour, maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize';
import CommonSearch from 'utils/commonSearch';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import { Card,TablePagination } from '@mui/material';
import moment from 'moment';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';


const AlertsTable = (props) => {
    const storage = getsessionStorage();
    const dispatch = useDispatch()

    const [showForm, setShowForm] = useState(false)

    const [paginateData, setPaginateData] = useState({
        searchString : "",
        pageCount : 0,
        pageSize : 20
    })

    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(
        CreateNewButtonContext
    )

    const columnAlert = [
        {
            field : 'renewal_types',
            title : 'Renewal Type'
        },
        {
            field :'asset_name',
            title :'Asset Name',
            render : (rowData) => {
                return rowData.asset_name ? `${rowData.asset_name}` : '-'
            }
        },
        {
            field :'due_title',
            title :'Title'
        },
        {
            field : 'alerts_before',
            title : 'Alerts Before',
            render : (rowData) => {
                return rowData.alerts_before ? `${rowData.alerts_before} Days` : '-'
            }
        },
        {
            field : 'repeat',
            title : 'Repeat',
            render : (rowData) => {
                if(rowData.repeat === 1) {
                    return <DoneIcon sx={{ color:'green' }} />
                }
                else {
                    return <CloseIcon sx={{color:'red'}} />
                }
            }
        },
        {
            field : 'repeat_days',
            title : 'Days',
            render : (rowData) => {
                if(rowData.repeat_days) {
                    return `${rowData.repeat_days} Days Once`
                }
                else {
                    return '-'
                }
            }
        },
        {
            field : 'time',
            title : 'Time',
            render : (rowData) => {
                if(rowData.time) {
                    const formmattedTime = formatTime12Hour(rowData.time)
                    return formmattedTime
                }
                else {
                    return '-'
                }
            }
        },
        {
            field : 'alert_email',
            title : 'EMAIL',
            render : (rowData) => {
                if(rowData.alert_email === 1) {
                    return <DoneIcon sx={{ color : 'green' }} />
                }
                else {
                    return <CloseIcon sx={{ color : 'red' }} />
                }
            }
        },
        {
            field : 'alert_sms',
            title : 'SMS',
            render : (rowData) => {
                if(rowData.alert_sms === 1) {
                    return <DoneIcon sx={{ color : 'green' }} />
                }
                else {
                    return <CloseIcon sx={{ color : 'red' }} />
                }
            }
        }
    ]

    const {
        AlertsReducers : { alertsList, alertListCount } , rbacReducer: { menuAccess = {} }
    } = useSelector((state) => state)

    useEffect(() => {
        const payload = {
            searchString : paginateData.searchString,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }
        dispatch(ListAlerts(payload))
    },[paginateData.pageCount,paginateData.pageSize])


    const handleOpen = () => {
        setShowForm(true)
    }

    const handleCancel = () => {
        setShowForm(false)
        const payload = {
            searchString : paginateData.searchString,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }
        dispatch(ListAlerts(payload))
    }

    // const handlePageChange = (page) => {
    //     setPaginateData({...paginateData, pageCount: page})
    // }

    // const handlePageSizeChange = (size) => {
    //     setPaginateData({...paginateData, pageSize: size})
    // }
    const handlePageChange = (newPage) => {
        setPaginateData((prev) => ({
            ...prev,
            pageCount: newPage,
        }))
    }

    const handlePageSizeChange = (newSize) => {
        setPaginateData((prev) => ({
            ...prev,
            pageSize: newSize,
            pageCount:0,
        }))
    }
    const requestSearch = (e) => {
        const val = e.target.value

        setPaginateData({...paginateData, searchString: val})

        dispatch(setSearchAlertsListAction({data:[], numRows:0}));
        const payload = {
            searchString : val,
            pageCount : 0,
            numPerPage : paginateData.pageSize
        }
        dispatch(
            getSearchAlertsAction(
                payload,
                setModalTypeHandler,
                setLoaderStatusHandler
            )
        )
    }

    const cancelSearch = () => {

        setPaginateData({...paginateData, searchString: ''})

        dispatch(setSearchAlertsListAction({data:[], numRows:0}));
        const payload = {
            searchString : '',
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }
        dispatch(
            getSearchAlertsAction(
                payload,
                setModalTypeHandler,
                setLoaderStatusHandler
            )
        )
    }

     const selectedRole = storage?.role_name
                useEffect(() => {
                  if (!selectedRole) return;
                  apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
                }, [selectedRole, dispatch]);
        
    const alertCreate =UserRightsAuthorization(menuAccess[selectedRole], 'alerts', 'can_create') 
       

  return (
        <>
            {
                showForm === false && 
                    <Card>
                        <MaterialTable
                            style={{height: 'calc(100vh - 100px)',overflow:'hidden'}} 
                            totalCount = {alertListCount || 0}
                            columns = {columnAlert}
                            data = {alertsList || []}
                            options = {{
                                headerStyle,
                                cellStyle,
                                filtering : false,
                                actionsColumnIndex : -1,
                                paging : true,
                                pageSize : paginateData.pageSize,
                                pageSizeOptions : [20, 50, 100],
                                search : false,
                                maxBodyHeight : maxBodyHeight,
                                minBodyHeight: maxBodyHeight,
                                // overflowY:'visible'
                            }}
                            //  page = {paginateData.pageCount}
                            //  onPageChange = {(page) => handlePageChange(page)}
                            // onRowsPerPageChange = {(size) => handlePageSizeChange(size)}
                            components = {{
                                Toolbar : (props) => (
                                    <div>
                                        <div
                                            style = {{
                                                display : 'flex',
                                                width : '100%',
                                                alignItems : 'center',
                                            }}
                                        >
                                            <div style={{ width : '100%' }}>
                                                <MTableToolbar {...props} />
                                            </div>

                                            <div>
                                                <CommonSearch
                                                searchVal = {paginateData.searchString}
                                                cancelSearch = {cancelSearch}
                                                requestSearch = {requestSearch}
                                                /> 
                                            </div>
                                        </div>
                    
                                    </div>
                                ),
                                Pagination: (props) => (
                                            <div
                                                 style={{
                                                     display: "flex",
                                                     justifyContent: "flex-end",
                                                     alignItems: "center",
                                                     padding: "8px 16px",
                                                      }}
                                              >
                                              <TablePagination
                                                     {...props} 
                                                     component="div"
                                                     count={alertListCount || 0}
                                                     page={paginateData.pageCount || 0}
                                                     rowsPerPage={paginateData.pageSize || 20}
                                                     onPageChange={(event, newPage) => handlePageChange(newPage)}                                  
                                                     rowsPerPageOptions={[20, 50, 100]}
                          
                                                     onRowsPerPageChange={(event) =>
                                                       handlePageSizeChange(parseInt(event.target.value, 10))
                                                              }
                                                      labelRowsPerPage="Rows per page:"
                                                            />
                                            </div>
                                     ),
                            }}
                            actions = {[
                                alertCreate ? {
                                    icon : () => <AddIcon />,
                                    tooltip : 'Add',
                                    isFreeAction : true, 
                                    onClick : handleOpen,
                                } : null
                            ]}
                            title = 'Alerts' 
                        >
                        </MaterialTable> 
                    </Card>
            }

            {
                showForm && 
                <AlertsForm 
                    showForm = {showForm}  
                    handleCancel = {handleCancel} 
                />
            }
            
        </>
  )
}

export default AlertsTable
