import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import { Box, Button, Card, Chip, Grid, Pagination, withStyles,TablePagination } from '@mui/material';
import CommonToolTip from 'components/ToolTip';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {   getWhatsappLogsAction } from 'redux/actions/userCreation_actions';
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
import { getStickyTableOptions, stickyTableComponents } from 'utils/stickyTableLayout';
import { MTablePagination } from '@material-table/core';
import { getRejectedRequestAction } from 'redux/actions/superAdmin_action';

function WhatsappLogs() {
    const value = 0
    const dispatch = useDispatch();
    const { UserCreationReducer: {getWhatsappLogs, getWhatsappLogsCount } } = useSelector(state => state)
    const [open, setOpen] = useState(false)
    const [rowData, setRowData] = useState({})
    const [openApprove, setOpenApprove] = useState(false)
    const [isApiFinished, setIsAiFinished] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [searchString, setSearchString] = useState('')
    console.log('RegisteredUserGR',getWhatsappLogs);
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

        dispatch(getWhatsappLogsAction())
    }, []);


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
    
    const handlePageSizeChange = async (size) => {
        setPageSize(size);
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
            numPerPage: 20
        }
        dispatch(getRejectedRequestAction(
            body,
            commoncookie,
            setModalTypeHandler,
            setLoaderStatusHandler,
        ))
    }

    return (
        <div>
                 {/* <Card sx={{width: '100%'}}> */}
                 <MaterialTable
                    // totalCount= { RejectedRequestsCount }
                    style={{ height: 'calc(100vh - 80px)', overflow: 'hidden' }}

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
                                {/* <CommonSearch
                                  searchVal={searchString}
                                  cancelSearch={cancelSearch}
                                  requestSearch={requestSearch}
                                />                           */}
                              </Box>
                            </Box>
                        ),
                        Pagination: (props) => (
                            <div 
                            style={{
                                display:"flex",
                                justifyContent:"flex-end",
                                alignItems:"center",
                                padding: "8px 16px",
                            }}>
                                <TablePagination 
                                component="div"
                                count={getWhatsappLogsCount || 0}
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
                        bodyOffset: 200,
                     options:{
                        pageSizeOptions: [20, 50, 100],
                        showEmptyDataSourceMessage: isApiFinished,
                        // maxBodyHeight: maxBodyHeight,
                        pageSize: pageSize,
                        search: false,
                        tableLayout: "auto",
                        toolbar: true,
                     }
                     })}
                    //  onPageChange={handlePageChange}
                    //  onRowsPerPageChange={handlePageSizeChange}
                     columns={[
                         { title: 'Company Id', field: 'company_id' },
                        { title: 'Title', field: 'content' },
                        //  {title: 'Created By', field: 'created_by'},
                        { title: 'Sent At', field: 'created_at' },
                        {title:'Environment', field: '-'},
                        {title: 'Delivered At', field: '-'}

                     ]}
                     data={getWhatsappLogs}
                     title="Whatsapp Logs"
                 />
                
                 {/* </Card> */}
        </div>
    )
}

export default WhatsappLogs;
