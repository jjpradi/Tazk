import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import { Button, Card, Chip, Grid, TablePagination } from '@mui/material';
import {withStyles} from 'tss-react/mui';
import CommonToolTip from 'components/ToolTip';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { headerStyle, cellStyle } from 'utils/pageSize';
import { getRejectedRequestAction } from 'redux/actions/superAdmin_action';
import {
  getStickyTableOptions,
  stickyTableComponents,
} from 'utils/stickyTableLayout';
function RejectedRequest() {
    const value = 0
    const dispatch = useDispatch();
    const { UserCreationReducer: { RejectedRequests, RejectedRequestsCount } } = useSelector(state => state)
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



    useEffect(() => {
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

            dispatch(getRejectedRequestAction(
                data,
                commoncookie,
                setModalTypeHandler,
                setLoaderStatusHandler))
        // return () => {
        //     console.log('erer');
        //     dispatch(set_registerRequestAction([]));
        // };
    }, [pageCount,pageSize, searchString]);

    function newGRuserRegistered() {
        let data = {
            value : value,
            pageCount : 0,
            numPerPage : pageSize
        }
        dispatch(getRejectedRequestAction(
            data,
            commoncookie,
            setModalTypeHandler,
            setLoaderStatusHandler))
    }


    const handleImages = () => {
        setOpen(true)
    }

    const handlePageChange = async (page) => {
        setPageCount(page);
    }
    
    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setPageCount(0)
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
        dispatch(getRejectedRequestAction(
            body,
            commoncookie,
            setModalTypeHandler,
            setLoaderStatusHandler,
        ))
    }

    const requestSearch = (e) => {
        let val = e.target.value;
        setSearchString(val)

        dispatch(getRejectedRequestAction({ data: [], numRows: 0 }))
        //  }
        const body = {
            value : value,
            searchString: val,
            pageCount: 0,
            numPerPage: pageSize
        }
        dispatch(getRejectedRequestAction(
            body,
            commoncookie,
            setModalTypeHandler,
            setLoaderStatusHandler,
        ))
    }

    return (
        <div  style={{
      padding: '0 10px',
      height: '90vh',
      overflowY: 'auto',
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',  
    }}
    className="hide-scrollbar"
  >
    <style>
      {`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}
    </style>
                 <MaterialTable
                    style={{height: 'calc(100vh - 90px)',overflow:'hidden'}}
                    totalCount= { RejectedRequestsCount }
                    components={{
                        ...stickyTableComponents,
                        Toolbar: (props) => (
                          <div>
                            {/* <span style={{ paddingLeft: "100px" }}> */}
                            <div
                              style={{
                                display: 'flex',
                                width: '100%',
                                alignItems: 'center',
                              }}
                            >
                              <div style={{ width: '100%' }}>
                                <MTableToolbar {...props} />
                              </div>
                              <div>
                                <CommonSearch
                                  searchVal={searchString}
                                  cancelSearch={cancelSearch}
                                  requestSearch={requestSearch}
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
                                    component="div"
                                    count={RejectedRequestsCount || 0}
                                    page={pageCount}
                                    rowsPerPage={pageSize}
                                    rowsPerPageOptions={[20, 50, 100]}
                                    onPageChange={(event, newPage) => handlePageChange(newPage)}
                                    onRowsPerPageChange={(event) =>
                                        handlePageSizeChange(parseInt(event.target.value, 10))
                                    }
                                    labelRowsPerPage="Rows per page:"
                                />
                            </div>
                        ),
                      }}
                     options={getStickyTableOptions({
                         bodyOffset: 220,
                         headerStyle,
                         cellStyle,
                         options:{
                             pageSizeOptions: [20, 50, 100],
                             tableLayout: "auto",
                             toolbar: true,
                             showEmptyDataSourceMessage: isApiFinished,
                              // maxBodyHeight: maxBodyHeight,
                             pageSize: pageSize,
                             search: false,
                            },
                     })}
                     onPageChange={handlePageChange}
                     onRowsPerPageChange={handlePageSizeChange}
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
                         {
                             title: 'Status',
                             field: 'isApproved',
                         },
                     ]}
                     data={RejectedRequests}
                     title="Rejected Request"
                 />

        </div>
    )
}

export default RejectedRequest;
