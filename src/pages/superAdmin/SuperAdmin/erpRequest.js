import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import { Box, Button, Card, Chip, Grid } from '@mui/material';
import {withStyles} from 'tss-react/mui';
import CommonToolTip from 'components/ToolTip';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRegisterRequestAction, getRegisterRequestState, set_registerRequestAction, updateUserGrAction } from 'redux/actions/userCreation_actions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import apiCalls from 'utils/apiCalls';
import PanoramaIcon from '@mui/icons-material/Panorama';
import ImageDialog from './imageDialog';
import { websocketEvents} from '../../../http-common'
import EditIcon from '@mui/icons-material/Edit';
import RequestEditAndApprove from './requestEditAndApprove';
import context from '../../../context/CreateNewButtonContext'
import moment from 'moment';
import { commonDateFormat } from 'utils/getTimeFormat';
import CommonSearch from 'utils/commonSearch';
import { maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize';
import { MTablePagination } from '@material-table/core';
import { getStickyTableOptions, stickyTableComponents } from 'utils/stickyTableLayout';
import { color, maxWidth, minWidth, width } from '@mui/system';

function ErpRequestAndApproval() {
    const value = 0
    const dispatch = useDispatch();
    const { UserCreationReducer: { RegisteredUserGR, RegisteredUserGRCount } } = useSelector(state => state)
    const [open, setOpen] = useState(false)
    const [rowData, setRowData] = useState({})
    const [openApprove, setOpenApprove] = useState(false)
    const [isApiFinished, setIsAiFinished] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [pageSize, setPageSize] = useState(20)
    const [searchString, setSearchString] = useState('')
    // console.log('RegisteredUserGR',RegisteredUserGR);
    const {
        setLoaderStatusHandler,
        setModalStatusHandler,
        setselectData,
        selectData,
        setModalTypeHandler,
        commoncookie,
        headerLocationId,usertype
      } = useContext(context);
    const approveStatus = {
        '0': 'warning',
        'Approved': 'success',
        // 'Rejected': 'warning'
    };

    
    // //     // Add an event listener for 'retailshop' event
    // //     websocketEvents.addListener({
    // //         eventName: 'retailshop',
    // //         callbackFun: newGRuserRegistered,
    // //     });
    
    // //     // Make API call and dispatch action to handle registration request

    //         let data = {
    //             value : value,
    //             pageCount : 0,
    //             numPerPage : pageSize
    //         }

    //         dispatch(getRegisterRequestAction(
    //             data,
    //             setModalTypeHandler,
    //             setLoaderStatusHandler))
    //        .then(() => {
    //         if (RegisteredUserGR?.length) {
    //             setIsAiFinished(false)
    //         } else {
    //             setIsAiFinished(true)
    //         }
    //     });
    
    // //     // Cleanup function to remove registration request data when component unmounts
    // //     return () => {
    // //         console.log('erer');
    // //         dispatch(set_registerRequestAction([]));
    // //     };
    // }, []);

    useEffect(() => {
        //Add an event listener for 'retailshop' event
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
            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
            dispatch(getRegisterRequestAction(
                data, commoncookie, setModalTypeHandler, setLoaderStatusHandler)))
        //    .then(() => {
        //     if (RegisteredUserGR?.length) {
        //         setIsAiFinished(false)
        //     } else {
        //         setIsAiFinished(true)
        //     }
        // });
    
        // Cleanup function to remove registration request data when component unmounts
        // return () => {
        //     console.log('erer');
        //     dispatch(set_registerRequestAction([]));
        // };
    }, [pageCount,pageSize]);

    function newGRuserRegistered() {
        let data = {
            value : value,
            pageCount : 0,
            numPerPage : pageSize
        }
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
        dispatch(getRegisterRequestAction(
            data, commoncookie, setModalTypeHandler, setLoaderStatusHandler)))
    }


    const handleOpenApprove = (data) => {
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
    
    // const handlePageSizeChange = async (size) => {
    //     setPageSize(size);
    // };
    const handlePageSizeChange = (newSize) => {
        setRowData((prev) => ({
            ...prev,
            pageSize: newSize,
            page: 0,
        }));
    };

    const changeDateFormatDDMMYYYY = (date) => {
        return moment(date).format('DD-MM-YYYY')
    }
    const cancelSearch = () => {
        setSearchString('')
        const body = {
            value : value,
            searchString: '',
            pageCount: pageCount,
            numPerPage: pageSize
        }
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
        dispatch(getRegisterRequestAction(
            body,
            commoncookie,
            setModalTypeHandler,
            setLoaderStatusHandler,
        )))
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
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
        dispatch(getRegisterRequestAction(
            body,
            commoncookie,
            setModalTypeHandler,
            setLoaderStatusHandler,
        )))
    }

    let filteredData = RegisteredUserGR?.filter(user => user.company_type !== 'Grow Retail');
    return (
        <>
            {!openApprove && (
                 <Card sx={{width: '100%'}}>
                 <MaterialTable
                    //  style={{height:'87vh',overflow:'auto'}}
                    totalCount= { RegisteredUserGRCount }
                        style={{ height: 'calc(100vh - 80px)', overflow: 'hidden', }}
                    components={{
                        ...stickyTableComponents,
                        Toolbar: (props) => (
                          <Box 
                           sx={{
                                display: 'flex',
                                width: '100%',
                                alignItems: 'center',
                              }}>
                            {/* <span style={{ paddingLeft: "100px" }}> */}
                        
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
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                    padding: "8px 16px",
                                }}
                            >
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
                                actionsColumnIndex: -1,
                                pageSize: pageSize,
                                pageSizeOptions: [20, 50, 100],
                                paging: true,
                                // exportMenu: [{
                                //     label: 'Export to Excel',
                                //     exportFunc: (cols, datas) => 
                                //         handleExport()
                                // }]
                            }
                        })}
                    
                    
                     columns={[
                         // { title: 'Company Id', field: 'company_id' },
                         { title: 'Company Name', field: 'company_name' },
                         { title: 'Category', field: 'company_type' },
                         { 
                            title: 'Created At', field: 'createdAt',
                            render: rowData => commonDateFormat(rowData.createdAt)
                         },
                         { title: 'Latitude', field: 'latitude' },
                         { title: 'longitute', field: 'longitude' },
                         // { title: 'Shop Type', field: 'shop_type' },
                         { title: 'First Name', field: 'first_name' },
                         { title: 'Phone Number', field: 'phone_number' },
                         { title: 'E-mail', field: 'email' },
                         { title: 'Expiry Date',
                           field: 'expiryDate',
                           render: rowData => rowData.isApproved !== "0" ? commonDateFormat(rowData.expiryDate) : null
                           },
                         { title: 'Days Left',
                           field: 'sRemainingDays',
                           render: rowData => rowData.isApproved !== "0" ? rowData.sRemainingDays : null
                        },
                    //      { title: 'Shop Images', field: 'images',
                    //  render: rowData => (
                    //      <ImageDialog 
                    //      rowData={rowData}
                    //      onClick={handleImages}
                    //      style={{ cursor: "pointer" }}
                    //      />
                    //  )
                    //      },
                         {
                             title: 'Status',
                             field: 'isApproved',
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
                     data={filteredData}
                     title="ERP Request and Approval"
                 />
                
                 </Card>
       )}
            <Grid>
                {openApprove && (
                    <RequestEditAndApprove
                        rowData={rowData}
                        closeDialog={() => setOpenApprove(false)}
                        value = {value}
                    />
                )}
            </Grid>
        </>
    )
}

export default ErpRequestAndApproval;
