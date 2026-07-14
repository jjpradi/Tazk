import MaterialTable, { MTableToolbar } from "utils/SafeMaterialTable"
import { Box, Card, Dialog, DialogContent, IconButton, Tooltip } from "@mui/material"
import CreateNewButtonContext from "context/CreateNewButtonContext"
import { titleURL } from "http-common"
import { useContext, useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import { useDispatch, useSelector } from "react-redux"
import { getAllLeadsAction, getLeadsAction, getLeadsSearchAction, setLeadsSearchAction } from "redux/actions/leadManagement_actions"
import CommonSearch from "utils/commonSearch"
import { maxBodyHeight, headerStyle, cellStyle } from "utils/pageSize"
import AddIcon from '@mui/icons-material/Add';
import LeadForm from "./leadForm"
import VisibilityIcon from '@mui/icons-material/Visibility';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import LeadDetails from "./leadDetails"
import moment from 'moment';
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import CloseIcon from '@mui/icons-material/Close'
import LeadsFilter from "./LeadsFilter"
import { restrictNewCreationBasedOnPlanAction } from "redux/actions/subscription_action"
import { useNavigate } from "react-router-dom"


function LeadManagement(props){

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const {setModalTypeHandler, setLoaderStatusHandler} = useContext(CreateNewButtonContext)
    const {
        leadManagementReducers: {getLeads},
        SubscriptionReducer: {restrictUserLocationCreation}
    } = useSelector(state => state)
    
    const[pagination, setPagination] = useState({
        pageCount: 0,
        numPerPage: 20,
        searchString: ''
    })
    const [filterDetails, setFilterDetails] = useState({
        fromDate : '',
        toDate : ''
    })

    const[open, setOpen] = useState('list')
    const[rowData, setRowData] = useState([])
    const [filterOpen, setFilterOpen] = useState(false)


    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(restrictNewCreationBasedOnPlanAction())
            if (props?.data) {
                const payload = {
                    details: props?.data,
                    pageCount: pagination.pageCount,
                    numPerPage: pagination.numPerPage,
                    searchString: pagination.searchString
                };
                dispatch(getLeadsAction(payload, setModalTypeHandler, setLoaderStatusHandler));
            } 
            else if (props?.customer) {
                const payload = {
                    customer_id : props.customer[0]?.customer_id,
                    pageCount: pagination.pageCount,
                    numPerPage: pagination.numPerPage,
                    searchString: pagination.searchString
                };
                dispatch(getLeadsAction(payload, setModalTypeHandler, setLoaderStatusHandler));
            }
            else {
                if (open === 'list') {
                    const payload = {
                        pageCount: pagination.pageCount,
                        numPerPage: pagination.numPerPage,
                        searchString: pagination.searchString,
                        fromDate : filterDetails.fromDate,
                        toDate : filterDetails.toDate
                    };
                    dispatch(getLeadsAction(payload, setModalTypeHandler, setLoaderStatusHandler));
                }
            }
        }, 1000);
    
        return () => clearTimeout(timer); 
    }, [pagination.pageCount, pagination.numPerPage, open, props?.data,props?.customer]);
    

    const handlePageChange = (page) => {
        setPagination({...pagination, pageCount: page})
    }

    const handlePageSizeChange = (pageSize) => {
        setPagination({...pagination, numPerPage: pageSize})
    }

    const requestSearch = (event) => {
        const val = event.target.value
        setPagination({...pagination, searchString: val})

        dispatch(setLeadsSearchAction({data: [], numRows: 0}))

        if(props?.data){
            const payload = {
                pageCount: 0,
                numPerPage: pagination.numPerPage,
                searchString: val,
                details:props?.data
            }
            dispatch(getLeadsSearchAction(payload, setModalTypeHandler, setLoaderStatusHandler))
        }
        else{

            const payload = {
                pageCount: 0,
                numPerPage: pagination.numPerPage,
                searchString: val,
                fromDate : filterDetails.fromDate,
                toDate : filterDetails.toDate
            }
            dispatch(getLeadsSearchAction(payload, setModalTypeHandler, setLoaderStatusHandler))
        }
    }

    const cancelSearch = () => {
        setPagination({...pagination, searchString: ''})
        dispatch(setLeadsSearchAction({data: [], numRows: 0}))

        if(props?.data){
            const payload = {
                pageCount: pagination.pageCount,
                numPerPage: pagination.numPerPage,
                searchString: '',
                details:props?.data
            }
            dispatch(getLeadsSearchAction(payload, setModalTypeHandler, setLoaderStatusHandler))
        }
        else{

            const payload = {
                pageCount: pagination.pageCount,
                numPerPage: pagination.numPerPage,
                searchString: '',
                fromDate : filterDetails.fromDate,
                toDate : filterDetails.toDate
            }
            dispatch(getLeadsSearchAction(payload, setModalTypeHandler, setLoaderStatusHandler))
        }
    }

    const handleOpen = () => {
        setOpen('form')
    }

    const handleClose = () => {
        setOpen('list')
    }

    const handleLeadDetail = (data) => {
        setOpen('detail')
        setRowData(data)
        dispatch(getAllLeadsAction())
    }

    const handleConvertToDeal = (lead) => {
        const leadId = lead?.lead_id
        if (!leadId) return

        const query = new URLSearchParams()
        query.set('next', '/crm/deals')
        navigate(`/crm/leads/${encodeURIComponent(String(leadId))}/convert?${query.toString()}`)
    }

    const columns = [
        {
            field : 'createdAt',
            title : 'Date',
            render:(rowData)=>{
                
                {console.log(moment(rowData.createdAt).format('yyyy-MM-DD'),'sadasdagwwd')}
                   return  <>{moment(rowData.createdAt).format('DD/MM/yyyy')}</>
                
            }
        },
        {
            field: 'lead_id',
            title: 'Lead Id'
        },
        {
            field: 'Lead Owner',
            title: 'Lead Owner'
        },
        {
            field: 'Lead Name',
            title: 'Lead Name'
        },
        {
            field: 'Lead Description',
            title: 'Lead Description',
            render : (rowData) => {
                return rowData['Lead Description'] === null ? '-' : rowData['Lead Description']
            }
        },
        {
            field: 'Lead Source',
            title: 'Lead Source'
        },
        {
            field: 'Lead Status',
            title: 'Lead Stage',
            render: (rowData) => rowData?.['Lead Stage'] || rowData?.['Lead Status'] || '-'
        },
        {
            field: 'company_name',
            title: 'Company Name'
        },
        ...( !props?.data && !props?.customer ? [{
            field: 'action',
            title: 'Action',
            render: (rowData) => (
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Tooltip title='View'>
                        <IconButton onClick={() => handleLeadDetail(rowData)}>
                            <VisibilityIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title='Convert to Deal'>
                        <span>
                            <IconButton onClick={() => handleConvertToDeal(rowData)} disabled={!rowData?.lead_id}>
                                <AltRouteIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
            )
        }] : [] )
    
    ]

    const tableData = Array.isArray(getLeads?.data) ? getLeads.data : []
    const tableTotalCount = Number.isFinite(Number(getLeads?.numCount))
        ? Number(getLeads.numCount)
        : 0

    const handleFilterDialogOpen = () => {
        setFilterOpen(true)
    }

    const handleFilterDialogClose = () => {
        setFilterOpen(false)
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

    const handleCancel = () => {
        setFilterDetails((prev) => ({...prev, fromDate : '', toDate : ''}))
        let data = {
            searchString : pagination.searchString,
            pageCount : pagination.pageCount,
            numPerPage : pagination.numPerPage,
            fromDate : '',
            toDate : ''
        }
        dispatch(getLeadsAction(data))
        handleFilterDialogClose()
    }

    const handleApply = () => {
        let data = {
            searchString : pagination.searchString,
            pageCount : pagination.pageCount,
            numPerPage : pagination.numPerPage,
            fromDate : filterDetails.fromDate,
            toDate : filterDetails.toDate
        }
        dispatch(getLeadsAction(data))
        handleFilterDialogClose()
    }

    return(
        <>
        <Helmet>
            <meta charSet="utf-8" />
            <title>{titleURL} | Leads</title>
        </Helmet>

        {
            open === 'list' &&
            <Card>
            <MaterialTable
                totalCount={tableTotalCount}
                columns={columns}
                data={tableData}
                options={{
                    filtering: false,
                    actionsColumnIndex: -1,
                    paging: true,
                    pageSize: pagination.numPerPage,
                    pageSizeOptions: [20, 50, 100],
                    search: false,
                    maxBodyHeight: maxBodyHeight,
                    minBodyHeight: maxBodyHeight,
                    overflowY:'visible',
                    headerStyle,
                    cellStyle
                }}
                page={pagination.pageCount}
                onPageChange={(page) => handlePageChange(page)}
                onRowsPerPageChange={(size) => handlePageSizeChange(size)}
                components={{
                    Toolbar: (props) => (
                        <div>
                            <div style={{display: 'flex', width: '100%', alignItems: 'center'}}>
                                <div style={{width: '100%'}}>
                                    <MTableToolbar {...props} />
                                </div>

                                <div>
                                    <CommonSearch 
                                        searchVal={pagination.searchString}
                                        requestSearch={requestSearch}
                                        cancelSearch={cancelSearch}
                                    />
                                </div>
                            </div>
                        </div>
                    )
                }}
                actions={[
                    !(props?.type === 'accountDetails' || props?.type === 'customerDetails') &&
                    restrictUserLocationCreation.create_leads !== "disable" && {
                        icon: () => <AddIcon />,
                        tooltip: 'Add Lead',
                        isFreeAction: true,
                        onClick: handleOpen
                    },
                    props?.type === 'accoountDetails' || props.type === 'customerDetails' ? '' : {
                        icon : () => <FilterAltIcon />,
                        tooltip : 'Filter',
                        isFreeAction : true,
                        onClick : handleFilterDialogOpen
                    }
                ]}
                title='Leads'
            >
            </MaterialTable>
            </Card>
        }

        {
            open === 'form' && <LeadForm type='new' handleClose={handleClose} />
        }

        {
            open === 'detail' && <LeadDetails data={getLeads.data} index={rowData?.lead_id} handleClose={handleClose}  />
        }

        {
            filterOpen && 
            <Dialog open = {filterOpen}>
                <DialogContent sx={{ p : 5, width : '400px' }}>
                    <Box sx={{ display : 'flex', justifyContent : 'flex-end' }}>
                        <IconButton onClick={() => handleFilterDialogClose()}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <LeadsFilter 
                        fromDate = {filterDetails.fromDate}
                        toDate = {filterDetails.toDate}
                        handleDateChange = {handleDateChange}
                        handleCancel = {handleCancel}
                        handleApply = {handleApply}
                    />
                </DialogContent>
            </Dialog>
        }

        </>
    )

}

export default LeadManagement

