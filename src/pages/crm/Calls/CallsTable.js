import React, { useContext, useEffect, useState } from 'react'
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import { Card, Link } from '@mui/material'
import { formatTime12Hour, maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize'
import CommonSearch from 'utils/commonSearch'
import AddIcon from '@mui/icons-material/Add'
import CallsForm from './CallsForm'
import { useDispatch, useSelector } from 'react-redux'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { getSearchCallsAction, ListCalls, setSearchCallsAction } from 'redux/actions/calls_actions'
import moment from 'moment'
import LeadDetails from 'pages/crm/leadManagement/leadDetails'
import { getLeadsAction } from 'redux/actions/leadManagement_actions'

const CallsTable = () => {

    const dispatch = useDispatch()

    const [open,setOpen]= useState('list')
    const [data,setData] = useState([])

    const { 
        setModalTypeHandler, 
        setLoaderStatusHandler, 
    } = useContext(CreateNewButtonContext)

    const {
        CallsReducers : { callsList, callsListCount },
        leadManagementReducers: {getLeads}

    } = useSelector((state) => state)

    const [paginateData, setPaginateData] = useState({
        searchString : "",
        pageCount : 0,
        pageSize : 20
    })

    const [showForm, setShowForm] = useState(false)

    const handleDetail =(rowData)=>{
        const payload = {
            pageCount: 0    ,
            numPerPage: 10,
            searchString: '',
            fromDate: '',
            toDate: ''
        };
        dispatch(getLeadsAction(payload, setModalTypeHandler, setLoaderStatusHandler));
        setData(rowData)
        setOpen('detail')
    }

    const columnCalls = [
        {
            field : 'lead_id',
            title : 'Lead Id',
            render :(rowData)=>{
                return(
                    <Link
                        onClick={()=>{
                            handleDetail(rowData)
                        }} 

                        style={{
                            textDecoration : 'underline',
                            cursor : 'pointer',
                            color : 'blue',
                            display : 'inline-block',
                            padding : '5px'

                        }}
                    >
                        {rowData.call_to}
                    </Link>
                )
            }
        },
        {
            field : 'callTo_leadName',
            title : 'Lead Name',
        },
        {
            field : 'subject',
            title : 'Subject'
        },
        {
            field : 'remarks',
            title : 'Remarks',
            render : (rowData) => {
                return rowData.remarks === null ? '-' : rowData.remarks
            }
        },
        {
            field : 'call_type',
            title : 'Call Type',
            render : (rowData) => {
                return rowData.call_type === null ? '-' : rowData.call_type
            }
        },
        {
            field : 'call_status',
            title : 'Call Status'
        },
        {
            field : 'call_startTime',
            title : 'Call Start Time',
            render : (rowData) => {
                const [date, time] = `${rowData.call_startTime}`.split(' ')
                const formattedDate = moment(date).format('DD/MM/YYYY')
                const formattedTime = formatTime12Hour(time)
                return `${formattedDate} ${formattedTime}`
            }
        },
        {
            field : 'call_duration',
            title : 'Call Duration',
            render : (rowData) => {
                return rowData.call_duration === null ? '-' : rowData.call_duration
            }
        },
        {
            field : 'voice_record',
            title : 'Voice Recording',
            render : (rowData) => {
                return rowData.voice_record === null ? '-' : rowData.voice_record
            }
        },
        {
            field : 'call_purpose',
            title : 'Call Purpose',
            render : (rowData) => {
                return rowData.call_purpose === null ? '-' : rowData.call_purpose
            }
        },
        {
            field : 'call_agenda',
            title : 'Call Agenda',
            render : (rowData) => {
                return rowData.call_agenda === null ? '-' : rowData.call_agenda
            }
        },
        {
            field : 'call_result',
            title : 'Call Result',
            render : (rowData) => {
                return rowData.call_result === null ? '-' : rowData.call_result
            }
        },
        {
            field : 'description',
            title : 'Description',
            render : (rowData) => {
                return rowData.description === null ? '-' : rowData.description
            }
        },
    ]
    
    useEffect(() => {
        const payload = {
            searchString : paginateData.searchString,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }
        dispatch(
            ListCalls(payload)
        )
    }, [paginateData.pageCount, paginateData.pageSize])
    

    const handleOpen = () => {
        setShowForm(true)
    }

    const handleClose = () => {
        setShowForm(false)
        const payload = {
            searchString : paginateData.searchString,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }
        dispatch(
            ListCalls(payload)
        )
        setOpen('list')
    }

    const handlePageChange = (page) => {
        setPaginateData({...paginateData, pageCount : page})
    }

    const handlePageSizeChange = (size) => {
        setPaginateData({...paginateData, pageSize : size})
    }

    const cancelSearch = () => {
        setPaginateData({...paginateData, searchString : ''})

        dispatch(setSearchCallsAction({data : [], numRows : 0}))

        const payload = {
            searchString : '',
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }
        dispatch(
            ListCalls(
                payload,
                setModalTypeHandler,
                setLoaderStatusHandler
            )
        )
    }

    const requestSearch = (e) => {
       const val = e.target.value
       
       setPaginateData({...paginateData, searchString : val})

       dispatch(setSearchCallsAction({data : [], numRows : 0}))

       const payload = {
         searchString : val,
         pageCount : 0,
         numPerPage : paginateData.pageSize
       }
       dispatch(
            getSearchCallsAction(
                payload,
                setModalTypeHandler,
                setLoaderStatusHandler
            )
       )
    }


  return (
    <>
        {
            (showForm === false && open == 'list') && 

            <Card>
                <MaterialTable
                    totalCount = {callsListCount}
                    columns = {columnCalls}
                    data = {callsList}
                    options = {{
                        filtering : false,
                        actionsColumnIndex : -1,
                        paging : true,
                        pageSize : paginateData.pageSize,
                        pageSizeOptions : [20, 50, 100],
                        search : false,
                        maxBodyHeight : maxBodyHeight,
                        minBodyHeight: maxBodyHeight,
                        overflowY:'visible',
                        headerStyle,
                        cellStyle
                    }}
                    page = {paginateData.pageCount}
                    onPageChange = {(page) => handlePageChange(page)}
                    onRowsPerPageChange = {(size) => handlePageSizeChange(size)}
                    components = {{
                        Toolbar : (props) => (
                            <div>
                                <div
                                    style = {{
                                        display : 'flex',
                                        width : '100%',
                                        alignItems : 'center'
                                    }}
                                >  
                                    <div style = {{width : '100%'}}>
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
                        )
                    }}
                    actions = {[
                        {
                            icon : () => <AddIcon />,
                            tooltip : 'Add',
                            isFreeAction : true,
                            onClick : handleOpen
                        }
                    ]}
                    title = 'Calls'
                >
                </MaterialTable>
            </Card>
        }
        {
            showForm && 
            <CallsForm 
                showForm = {showForm}
                handleClose = {handleClose}
            />
        }

        {
            open === 'detail'  && <LeadDetails data={getLeads.data} index={data.call_to} handleClose={handleClose}  />
        }
        
    </>
  )
}

export default CallsTable
