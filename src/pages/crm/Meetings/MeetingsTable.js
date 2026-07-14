import React, { useContext, useEffect, useState } from 'react'
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import { Card, Link } from '@mui/material'
import { formatTime12Hour, maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize'
import CommonSearch from 'utils/commonSearch'
import AddIcon from '@mui/icons-material/Add'
import MeetingsForm from '././MeetingsForm'
import { useDispatch, useSelector } from 'react-redux'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { getSearchMeetingsAction, ListMeetings, setSearchMeetingsAction } from 'redux/actions/meetings_actions'
import DoneIcon from '@mui/icons-material/Done'
import CloseIcon from '@mui/icons-material/Close'
import moment from 'moment'
import LeadDetails from 'pages/crm/leadManagement/leadDetails'
import { getLeadsAction } from 'redux/actions/leadManagement_actions'

const MeetingsTable = () => {

    const dispatch = useDispatch()

    const [open,setOpen] = useState('list')
    const [data,setData] = useState([]) 

    const {
        setModalTypeHandler,
        setLoaderStatusHandler,
    } = useContext(CreateNewButtonContext)

    const {
        MeetingsReducers : { meetingsList, meetingsListCount },
        leadManagementReducers: {getLeads}

    } = useSelector((state) => state)

    const [paginateData, setPaginateData] = useState({
        searchString : "",
        pageCount : 0,
        pageSize : 20
    })

    const [showForm, setShowForm] = useState(false)

    const handelDetail = (rowData)=>{
        const payload = {
            pageCount: 0,
            numPerPage: 10,
            searchString: '',
            fromDate: '',
            toDate: '',
            meeting:'1'
        };
        dispatch(getLeadsAction(payload, setModalTypeHandler, setLoaderStatusHandler));
        setData(rowData)
        
            setOpen('detail')
       
        
    }

    const columnMeetings = [
        {
            field : 'lead_id',
            title : 'Lead Id',
            render : (rowData)=>{
                return (
                    <Link
                        onClick = {()=>{
                            handelDetail(rowData)
                        }}

                        style={{
                            cursor : 'pointer',
                            textDecoration : 'underline',
                            color : 'blue',
                            display : 'inline-block',
                            padding : '5px'
                        }}
                    >
                    {rowData.lead_id}
                    </Link>
                )
            }
        },  
        {
            field : 'name',
            title : 'Meeting Name'
        },
        {
            field : 'subject',
            title : 'Meeting Subject'
        },
        {
            field : 'from_dateTime',
            title : 'Meeting From',
            render : (rowData) => {
                const [date, time] = `${rowData.from_dateTime}`.split(' ')
                const formattedDate = moment(date).format('DD/MM/YYYY')
                const formattedTime = formatTime12Hour(time)
                return `${formattedDate} ${formattedTime}`
            }
        },
        {
            field : 'to_dateTime',
            title : 'Meeting To',
            render : (rowData) => {
                const [date, time] = `${rowData.to_dateTime}`.split(' ')
                const formattedDate = moment(date).format('DD/MM/YYYY')
                const formattedTime = formatTime12Hour(time)
                return `${formattedDate} ${formattedTime}`
            }
        },
        {
            field : 'host_firstName',
            title : 'Meeting Host',
            render : (rowData) => {
                const fullName = rowData.host_lastName ? `${rowData.host_firstName} ${rowData.host_lastName}` : rowData.host_firstName
                return fullName
            }
        },
        {
            field : 'participants',
            title : 'Meeting Participants',
        },
        {
            field : 'relatedTo',
            title : 'Related To'
        },
        {
            field : 'meetingLead_name',
            title : 'Lead Name',
        },
        {
            field : 'description',
            title : 'Description'
        },
        {
            field : 'repeat',
            title : 'Repeat',
            render : (rowData) => {
                if(rowData.repeat === 1) {
                    return (
                        <DoneIcon sx={{color : 'green'}} />
                    )
                }
                else {
                    return (
                        <CloseIcon sx={{color : 'red'}} />
                    )
                }
            }
        },
        {
            field : 'repeatDate',
            title : 'Repeat Date',
            render : (rowData) => {
                if(rowData.repeatDate !== null) {
                    const [date, time] = `${rowData.repeatDate}`.split(' ')
                    const formattedDate = moment(date).format('DD/MM/YYYY')
                    const formattedTime = formatTime12Hour(time)
                    return `${formattedDate} ${formattedTime}`
                }
                else {
                    return '-'
                }
            }
        },
        {
            field : 'duration',
            title : 'Repeat Duration',
            render : (rowData) => {
                if(rowData.duration !== null) {
                    return rowData.duration
                }
                else {
                    return '-'
                }
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
            ListMeetings(payload)
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
            ListMeetings(payload)
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

        dispatch(setSearchMeetingsAction({data : [], numRows : 0}))

        const payload = {
            searchString : '',
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }
        dispatch(
            ListMeetings(
                payload,
                setModalTypeHandler,
                setLoaderStatusHandler
            )
        )
    }

    const requestSearch = (e) => {
        const val = e.target.value

        setPaginateData({...paginateData, searchString : val})

        dispatch(setSearchMeetingsAction({data : [], numRows : 0}))

        const payload = {
            searchString : val,
            pageCount : 0,
            numPerPage : paginateData.pageSize
        }
        dispatch(
            getSearchMeetingsAction(
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
                    totalCount = {meetingsListCount}
                    columns = {columnMeetings}
                    data = {meetingsList}
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
                    title = 'Meetings'
                >
                </MaterialTable>
            </Card>
        }
        {
            showForm &&
            <MeetingsForm 
                type = 'create'
                showForm = {showForm}
                handleClose = {handleClose}
            />
        }
        {
            open == 'detail' && 
            
            <LeadDetails data={getLeads?.data} index ={data.lead_id} handleClose={handleClose} page={'meeting'}/>
        }
    </>
  )
}

export default MeetingsTable
