import MaterialTable, { MTableToolbar } from "utils/SafeMaterialTable"
import moment from "moment"
import PropTypes from "prop-types"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getLeadStatusChangeHistoryAction } from "redux/actions/leadManagement_actions"
import { maxBodyHeight, headerStyle, cellStyle } from "utils/pageSize"

function LeadStatusHistoryCard(props){

    const dispatch = useDispatch()
    const {
        leadManagementReducers: {getLeadStatusHistory}
    } = useSelector(state => state)

    const[pagination, setPagination] = useState({
        pageCount: 0,
        numPerPage: 5,
    })

    useEffect(() => { (async () => {
        if(props.data.lead_id){
            let payload = {
                pageCount: pagination.pageCount,
                numPerPage: pagination.numPerPage,
                lead_id: props.data.lead_id
            }
            await dispatch(getLeadStatusChangeHistoryAction(payload))
        }
    })();
}, [dispatch, pagination, props.data.lead_id])
    
    console.log(getLeadStatusHistory)

    const handlePageChange = (page) => {
        setPagination({...pagination, pageCount: page})
    }

    const handlePageSizeChange = (size) => {
        setPagination({...pagination, numPerPage: size})
    }

    const columns = [
        {
            field: 'message',
            title: 'Stage'
        },
       {
            field: 'createdAt',
            title: 'Modified Time',
            render : (rowData) => {
                return moment(rowData.createdAt).format('DD/MM/YYYY hh:mm A')
            }
       } ,
       {
            field: 'first_name',
            title: 'Modified By',
            render: (rowData) => {
                if(rowData.last_name === null || rowData.last_name === ""){
                    return rowData.first_name
                }
                else{
                    return `${rowData.first_name} ${rowData.last_name}`
                }
            }
       }
    ]

    return(
        <MaterialTable
            totalCount={getLeadStatusHistory.numCount}
            data={getLeadStatusHistory.data}
            columns={columns}
            options={{
                filtering: false,
                actionsColumnIndex: -1,
                paging: true,
                pageSize: pagination.numPerPage,
                pageSizeOptions: [5, 10, 20],
                search: false,
                maxBodyHeight: maxBodyHeight,
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
                        </div>
                    </div>
                )
            }}
            title='Lead Stage History'
        ></MaterialTable>
    )

}

LeadStatusHistoryCard.propTypes = {
    data: PropTypes.array
}

export default LeadStatusHistoryCard

