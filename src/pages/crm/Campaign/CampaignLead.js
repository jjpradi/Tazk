import React, { useEffect, useState } from 'react'
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import { useDispatch, useSelector } from 'react-redux'
import { maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize'
import CommonSearch from 'utils/commonSearch'
import { getCampaignLeadAction } from 'redux/actions/campaign_actions'
import { Card } from '@mui/material'
import moment from 'moment'

const CampaignLead = (props) => {

    const dispatch = useDispatch()

    const {
        CampaignReducers : { campaignLeadsList, campaignLeadsListCount }
    } = useSelector((state) => state)

    const [paginateData, setPaginateData] = useState({
        searchString : '',
        pageCount : 0,
        pageSize : 5
    })

    useEffect(() => {
        if(props.data.campaign_id) {
            const payload = {
                searchString : paginateData.searchString,
                pageCount : paginateData.pageCount,
                numPerPage : paginateData.pageSize
            }
            dispatch(getCampaignLeadAction(props.data.campaign_id, payload))
        }
    }, [props?.data, paginateData.pageCount, paginateData.pageSize])

    const handlePageChange = (page) => {
        setPaginateData({...paginateData, pageCount : page})
    }

    const handlePageSizeChange = (size) => {
        setPaginateData({...paginateData, pageSize : size})
    }

    const columnCampaignLeads = [
        {
            field : 'updatedAt',
            title : 'Date',
            render : (rowData) => {
                return moment(rowData.updatedAt).format('DD/MM/yyyy')
            }
        },
        {
            field : 'Lead Owner',
            title : 'Lead Owner'
        },
        {
            field : 'Lead Name',
            title : 'Lead Name'
        },
        {
            field : 'Lead Description',
            title : 'Lead Description',
            render : (rowData) => {
                return rowData['Lead Description'] === null ? '-' : rowData['Lead Description']
            }
        },
        {
            field : 'Lead Source',
            title : 'Lead Source'
        },
        {
            field : 'Lead Status',
            title : 'Lead Stage',
            render: (rowData) => rowData?.['Lead Stage'] || rowData?.['Lead Status'] || '-'
        }
    ]

  return (
    <>
        <Card>
            <MaterialTable
                totalCount = {campaignLeadsListCount}
                columns = {columnCampaignLeads}
                data = {campaignLeadsList}
                options = {{
                    filtering : false,
                    actionsColumnIndex : -1,
                    paging : true,
                    pageSize : paginateData.pageSize,
                    pageSizeOptions : [5, 10, 15],
                    search : false,
                    maxBodyHeight : maxBodyHeight,
                    headerStyle,
                    cellStyle
                }}
                page = {paginateData.pageCount}
                onPageChange = {(page) => handlePageChange(page)}
                onRowsPerPageChange = {(size) => handlePageSizeChange(size)}
                title = 'Leads'
            >
            </MaterialTable>
        </Card>
    </>
  )
}

export default CampaignLead

