import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import { Button, Card, Chip, Grid, Pagination } from '@mui/material';
import {withStyles} from 'tss-react/mui';
import CommonToolTip from 'components/ToolTip';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRegisterRequestAction, getRegisterRequestState, set_registerRequestAction, updateUserGrAction } from 'redux/actions/userCreation_actions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import apiCalls from 'utils/apiCalls';
import PanoramaIcon from '@mui/icons-material/Panorama';
import { websocketEvents} from '../../../http-common'
import EditIcon from '@mui/icons-material/Edit';
import RequestEditAndApprove from '../../superAdmin/SuperAdmin/requestEditAndApprove';
import context from '../../../context/CreateNewButtonContext'
import { maxBodyHeight, pageSize, headerStyle, cellStyle } from 'utils/pageSize';
import CommonSearch from 'utils/commonSearch';
import { commonDateFormat } from 'utils/getTimeFormat';
import { getStickyTableOptions, stickyTableComponents } from 'utils/stickyTableLayout';
import { Box, height } from '@mui/system';
import { MTablePagination } from '@material-table/core';

const headerStyleObj = {
  fontFamily: "Poppins, sans-serif",
  fontSize: "12px",
  fontWeight: 600,
  color: 'rgba(0, 0, 0, 0.7)',
};

function GrowRetailRequestAndApproval() {
    const value = 1
    const dispatch = useDispatch();
    const { UserCreationReducer: { RegisteredUserGR, RegisteredUserGRCount } } = useSelector(state => state)
    const [open,setOpen] = useState(false)
    const [rowData, setRowData] = useState({})
    const [openApprove, setOpenApprove] = useState(false)
    const [isApiFinished, setIsAiFinished] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [pageSize, setPageSize] = useState(20)
    const [searchString, setSearchString] = useState('')
    const {
        setLoaderStatusHandler,
        setModalStatusHandler,
        setselectData,
        selectData,
        setModalTypeHandler,
        commoncookie,
        headerLocationId,usertype
    } = useContext(context);
    
    console.log('showEmptyDataSourceMessage',isApiFinished);
    const approveStatus = {
        '0': 'warning',
        'Approved': 'success',
        // 'Rejected': 'warning'
    };
    // console.log('RegisteredUserGR',RegisteredUserGR);

    // useEffect(() => {
    //     // Add an event listener for 'retailshop' event
    //     websocketEvents.addListener({
    //         eventName: 'retailshop',
    //         callbackFun: newGRuserRegistered,
    //     });
    
    //     // Make API call and dispatch action to handle registration request

    //         let data = {
    //             value : value,
    //             pageCount : 0,
    //             numPerPage : pageSize
    //         }
        
    //         dispatch(getRegisterRequestAction(
    //             data,
    //             setModalTypeHandler,
    //             setLoaderStatusHandler))
    //             // .then(() => {
    //             //     if (RegisteredUserGR.length) {
    //             //         setIsAiFinished(false)
    //             //     } else {
    //             //         setIsAiFinished(true)
    //             //     }
    //             // });
    
    //     // Cleanup function to remove registration request data when component unmounts
    //     return () => {
    //         dispatch(set_registerRequestAction([]));
    //     };
    // }, []);

    useEffect(() => {
        // Add an event listener for 'retailshop' event
        websocketEvents.addListener({
            eventName: 'retailshop',
            callbackFun: newGRuserRegistered,
        });
    
        // Make API call and dispatch action to handle registration request

            let data = {
                value : value,
                pageCount : pageCount,
                numPerPage : pageSize,
                searchString: searchString
            }

                dispatch(getRegisterRequestAction(
                    data,
                    commoncookie,
                    setModalTypeHandler,
                    setLoaderStatusHandler
                ));
            
                // .then(() => {
                //     if (RegisteredUserGR?.length) {
                //         setIsAiFinished(false)
                //     } else {
                //         setIsAiFinished(true)
                //     }
                // });
    
        // Cleanup function to remove registration request data when component unmounts
        return () => {
            dispatch(set_registerRequestAction([]));
        };
    }, [pageCount,pageSize]);
    
    console.log('isApiFinished',isApiFinished);
    function newGRuserRegistered() {
        let data = {
            value : value,
            pageCount : 0,
            numPerPage : pageSize
        }
        dispatch(getRegisterRequestAction(data))
    }

    // const handleApproval = (id,phone_number) => {
    //     dispatch(updateUserGrAction(id, { type: 'Approve',number: phone_number }))
    //     dispatch(getRegisterRequestAction(value))
    // }
    const handleOpenApprove = (data) => {
        console.log('FFFF', data);
        setRowData(data);
        setOpenApprove(true);
            
}
   
    const handleOpenEdit = (data) => {
        setRowData(data);
        setOpenApprove(true);
            
}
   

    // const handleReject = (id,phone_number) => {
    //     dispatch(updateUserGrAction(id, { type: 'Reject',number: phone_number }))
    //     dispatch(getRegisterRequestAction(value))
    // }

    const handleImages = () => {
        setOpen(true)
    }

    const handlePageChange = async (page) => {
        setPageCount(page);
    }

    const cancelSearch = () => {
        setSearchString('')
        const body = {
            value : value,
            searchString: '',
            pageCount: pageCount,
            numPerPage: pageSize
        }
        dispatch(getRegisterRequestAction(
            body,
            setModalTypeHandler,
            setLoaderStatusHandler,
        ))
    }

    const requestSearch = (e) => {
        let val = e.target.value;
        setSearchString(val)

        dispatch(getRegisterRequestState({ data: [], numRows: 0 }))
        //  }
        const body = {
            value : value,
            searchString: val,
            pageCount: 0,
            numPerPage: 20
        }
        dispatch(getRegisterRequestAction(
            body,
            setModalTypeHandler,
            setLoaderStatusHandler,
        ))
    }
    
    const handlePageSizeChange = async (size) => {
        setPageSize(size);
    };

    return (
        <>
            {!openApprove && (<Card sx={{width: '100%'}}>
            <MaterialTable
                totalCount= { RegisteredUserGRCount }
                style={{height: 'calc(100vh - 80px)', overflow: 'hidden',}}
                components={{
                    ...stickyTableComponents,
                    Toolbar: (props) => (
                        <Box
                          sx={{
                            display: 'flex',
                            width: '100%',
                            alignItems: 'center',
                          }}
                        >
                          <Box sx={{ width: '100%' }}>
                            <MTableToolbar {...props} />
                          </Box>
                          <Box>
                            <CommonSearch
                              searchVal={searchString}
                              cancelSearch={cancelSearch}
                              requestSearch={requestSearch}
                            />                          
                          </Box>
                        </Box>
                    ),
                    Pagination: (props) => (
                        <div style={{
                            display:"flex",
                            justifyContent:"flex-end",
                            alignItems: "center",
                            padding: "8px 16px",
                        }}>
                            <MTablePagination 
                            {...props}
                            count={RegisteredUserGRCount || 0}
                            page={pageCount}
                            rowsPerPage={pageSize || 20}
                            onPageChange={(event, newPage) => handlePageChange(newPage)}
                            onRowsPerPageChange={(event) => 
                                handlePageSizeChange(parseInt(event.target.value, 10))
                            }
                            labelRowsPerPage="Rows per page: "
                            />
                        </div>
                    ),
                  }}
                  options={getStickyTableOptions({
                     bodyOffset: 250,
                     headerStyle,
                 
                options: {
                    showEmptyDataSourceMessage: isApiFinished,
                    cellStyle,
                    tableLayout: 'auto',
                    toolbar,
                    search: false,
                    exportButton: true,
                    filtering: false,
                    paging: true,
                    pageSize: pageSize,    
                    pageSizeOptions: [20, 50, 100],
                    actionsColumnIndex: -1,
                    // toolbar: true,
                    // showEmptyDataSourceMessage: isApiFinished,
                    // maxBodyHeight: maxBodyHeight,
                    
                    // search: false,
                    // headerStyle,
                    // cellStyle,
                    // paging: true,
                
            }
                  })}
                
                // onPageChange={handlePageChange}
                // onRowsPerPageChange={handlePageSizeChange}
                // page={pageCount}
                columns={[
                    // { title: 'Company Id', field: 'company_id' },
                    {
                        title: 'Company Name',
                        field: 'company_name',
                        headerStyle: headerStyleObj,
                    },
                    {
                        title: 'Created At',
                        field: 'createdAt',
                        headerStyle: {
                            fontFamily: "poppins",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: 'rgba(0, 0, 0, 0.7)'
                        },
                        render: rowData => commonDateFormat(rowData.createdAt)
                    },
                    {
                        title: 'Latitude',
                        field: 'latitude',
                        headerStyle: {
                            fontFamily: "poppins",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: 'rgba(0, 0, 0, 0.7)'
                        }
                    },
                    {
                        title: 'longitude', field: 'longitude',
                        headerStyle: {
                            fontFamily: "poppins",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: 'rgba(0, 0, 0, 0.7)'
                        },
                    },
                    // { title: 'Shop Type', field: 'shop_type' },
                    {
                        title: 'First Name', field: 'first_name',
                        headerStyle: {
                            fontFamily: "poppins",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: 'rgba(0, 0, 0, 0.7)'
                        },
                    },
                    {
                        title: 'Phone Number', field: 'phone_number',
                        headerStyle: {
                            fontFamily: "poppins",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: 'rgba(0, 0, 0, 0.7)'
                        },
                    },
                    {
                        title: 'E-mail', field: 'email',
                        headerStyle: {
                            fontFamily: "poppins",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: 'rgba(0, 0, 0, 0.7)'
                        },
                    },
                    {
                        title: 'Expiry Date',
                        field: 'expiryDate',
                        headerStyle: {
                            fontFamily: "poppins",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: 'rgba(0, 0, 0, 0.7)'
                        },
                        render: rowData => rowData.isApproved !== "0" ? commonDateFormat(rowData.expiryDate) : null
                    },
                    {
                        title: 'Days Left',
                        field: 'sRemainingDays',
                        headerStyle: {
                            fontFamily: "poppins",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: 'rgba(0, 0, 0, 0.7)'
                        },
                        render: rowData => rowData.isApproved !== "0" ? rowData.sRemainingDays : null
                    },
                    {
                        title: 'Status',
                        field: 'isApproved',
                        headerStyle: {
                            fontFamily: "poppins",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: 'rgba(0, 0, 0, 0.7)'
                        },
                        render: (rowData) => (
                            <Chip
                                // variant='outlined'
                                size='small'
                                label={rowData.isApproved === "0" ? "Pending for approval" : rowData.isApproved}
                                color={approveStatus[rowData.isApproved]}
                            />
                        ),
                    },
                    {
                        title: 'Approval',
                        field: 'Approval',
                        headerStyle: {
                            fontFamily: "poppins",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: 'rgba(0, 0, 0, 0.7)'
                        },
                        render: rowData => (
                            <>
                                {rowData.isApproved === "0" ?
                                    <CommonToolTip title='Approve'>
                                        <CheckCircleIcon

                                            color='success'
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handleOpenApprove(rowData)}
                                        />
                                    </CommonToolTip> : <CommonToolTip title={rowData.isApproved === 'Rejected' ? '' : 'Edit'}>
                                        <EditIcon

                                            color={rowData.isApproved === 'Rejected' ? 'disabled' : ''}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => rowData.isApproved === 'Rejected' ? null : handleOpenEdit(rowData)}
                                            disabled
                                        />
                                    </CommonToolTip>}
                            </>
                        ),
                    },
                ]}
                data={RegisteredUserGR}
                title="Request and Approval"
            />
            </Card>
            )}
        <Grid>
                {openApprove && (
                    <RequestEditAndApprove
                        rowData={rowData}
                        closeDialog={() => setOpenApprove(false)}
                        value={value}
                    />
                )}
            </Grid>
            </>
    )
}

export default GrowRetailRequestAndApproval;
