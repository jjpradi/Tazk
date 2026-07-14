import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import { Card, IconButton, Tooltip } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSearchCampaignAction, ListCampaignAction, setSearchCampaignAction } from 'redux/actions/campaign_actions'
import CommonSearch from 'utils/commonSearch'
import { maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize'
import AddIcon from '@mui/icons-material/Add'
import CampaignForm from './CampaignForm'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CampaignDetails from './CampaignDetails'

const CampaignTable = (props) => {

    const dispatch = useDispatch()

    const {
        setModalTypeHandler,
        setLoaderStatusHandler,
    } = useContext(CreateNewButtonContext)

    const {
        CampaignReducers : { campaignList, campaignListCount }
    } = useSelector((state) => state)

    const [paginateData, setPaginateData] = useState({
        searchString : '',
        pageCount : 0,
        pageSize : 20
    })

    const [showForm, setShowForm] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [rowData, setRowData] = useState([])

    useEffect(() => {
        const payload = {
            searchString : paginateData.searchString,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }
        dispatch(ListCampaignAction(payload))
    }, [paginateData.pageCount, paginateData.pageSize])

    const handleOpen = () => {
        setShowForm(true)
    }

    const handleClose = () => {
        setShowForm(false)
        setShowDetails(false)
        const payload = {
            searchString : paginateData.searchString,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }
        dispatch(ListCampaignAction(payload))
    }

    const handleDetailsOpen = (data) => {
        setShowDetails(true)
        setRowData(data)
    }

    const handlePageChange = (page) => {
        setPaginateData({...paginateData, pageCount : page})
    }

    const handlePageSizeChange = (size) => {
        setPaginateData({...paginateData, pageSize : size})
    }

    const cancelSearch = () => {
        setPaginateData({...paginateData, searchString : ''})

        dispatch(setSearchCampaignAction({data : [], numRows : 0}))

        const payload = {
            searchString : '',
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }
        dispatch(
            ListCampaignAction(
                payload,
                setModalTypeHandler,
                setLoaderStatusHandler
            )
        )
    }

    const requestSearch = (e) => {
        const val = e.target.value

        setPaginateData({...paginateData, searchString : val})

        dispatch(setSearchCampaignAction({data : [], numRows : 0}))

        const payload = {
            searchString : val,
            pageCount : 0,
            numPerPage : paginateData.pageSize
        }
        dispatch(
            getSearchCampaignAction(
                payload,
                setModalTypeHandler,
                setLoaderStatusHandler
            )
        )
    }

    const columnCampaign = [
        {
            field : 'campaign_ownerFirstName',
            title : 'Campaign Owner',
            render : (rowData) => {
                const fullName = rowData.campaign_ownerLastName ? `${rowData.campaign_ownerFirstName} ${rowData.campaign_ownerLastName}` : rowData.campaign_ownerFirstName
                return fullName
            }
        },
        {
            field : 'campaign_name',
            title : 'Campaign Name'
        },
        {
            field : 'campaign_type',
            title : 'Campaign Type'
        },
        {
            field : 'campaign_status',
            title : 'Campaign Status'
        },
        ...(rowData ? [
        {
            field : 'action',
            title : 'Action',
            render : (rowData) => (
                <Tooltip title = 'View'>
                    <IconButton onClick={() => handleDetailsOpen(rowData)}>
                        <VisibilityIcon />
                    </IconButton>
                </Tooltip>
            )
        }] : [])
    ]

  return (
    <>
        {
            showForm === false && showDetails === false &&

            <Card>
                <MaterialTable
                    totalCount = {campaignListCount}
                    columns = {columnCampaign}
                    data = {campaignList}
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
                                    <div style = {{ width : '100%' }}>
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
                    title = 'Campaign'
                >
                </MaterialTable>
            </Card>
        }
        {
            showForm && 
            <CampaignForm 
                type = 'create'
                showForm = {showForm}
                handleClose = {handleClose}
            />
        }

        {
            showDetails &&
            <CampaignDetails 
                data = {campaignList}
                index = {rowData.campaign_id}
                handleClose = {handleClose}
            />
        }
    </>
  )
}

export default CampaignTable
