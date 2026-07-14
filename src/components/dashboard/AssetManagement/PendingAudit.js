import MaterialTable, { MTableToolbar } from "utils/SafeMaterialTable"
import { Card, Chip, Typography } from "@mui/material"
import { useEffect, useState } from "react"

import { useDispatch, useSelector } from "react-redux"
import { getAuditCheckList } from "redux/actions/audit_actions"
import { cellStyle, headerStyle } from "utils/pageSize"
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import moment from "moment"
import useCommonRef from "pages/common/home/useCommonRef"
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

function Audit(props){

    const dispatch = useDispatch()
    const {
        Audits: {
            auditCheckList
        }
    } = useSelector((state) => state)
  const [open, setOpen] = useState(true)

    const[pagination, setPagination] = useState({
        searchString: '',
        pageCount: 0,
        numPerPage: 5
    })

    const auditStatus = {
        Pending: 'warning',
        Done: 'success'
    }

    const columns = [
        {
            field: 'name',
            title: 'Asset Name',
        },
        {
            field: 'first_name',
            title: 'Assigned To',
            render: (rowData) => {
                if(rowData.first_name !== null) {
                const fullName = rowData.last_name ? `${rowData.first_name} ${rowData.last_name}` : rowData.first_name
                return fullName
                }
                else {
                    return '-'
                }
            }
        },
        {
            field: 'audit_date',
            title: 'Audit Date',
            render : (rowData) => {
                return moment(rowData.audit_date).format('DD/MM/YYYY')
            }
        },
        {
            field: 'status',
            title: 'Status',
            render: (rowData) => {
                return(
                    <Chip
                        label={rowData.status}
                        size='small'
                        color={auditStatus[rowData.status]}
                        style={{fontSize: cellStyle.fontSize, fontWeight: cellStyle.fontWeight}}
                    />
                )
            }
        },
        {
            field: 'repeat',
            title: 'Repeat',
            render: (rowData) => {
                if(rowData.repeat === 1){
                    return(
                        <DoneIcon sx={{color:'green'}} />
                    )
                }
                else{
                    return(
                        <CloseIcon sx={{color:'red'}} />
                    )
                }
            }
        },
        {
            field: 'repeat_duration',
            title: 'Repeat Duration',
            render: (rowData) => {
                const duration = rowData.repeat_duration ? rowData.repeat_duration : '-'
                return duration
            }
        }
    ]

    // useEffect(() => {

    //   const assetpayload ={
    //     searchString: pagination.searchString,
    //     pageCount: pagination.pageCount,
    //     numPerPage: pagination.numPerPage,
    //     asset_id: 'dashboard'
    // }

    //     dispatch(getAuditCheckList(assetpayload))
    // }, [pagination.numPerPage, pagination.pageCount])

    const handlePageSizeChange = (size) => {
        setPagination({
            ...pagination,
            numPerPage: size
        })
    }

    const handlePageChange = (page) => {
        setPagination({
            ...pagination,
            pageCount: page
        })
    }

    useEffect(() => {
        if(props?.mode === 'edit'){
            setOpen(false)
        }
        else{
            setOpen(true)
        }
      },[props?.mode])



    return (
        // <Card
        // ref={(el)=>{
        //     props.ref1(el)
        //     props.isVisibleRef.current = el
        // }}
        // >
        // </Card>
        <>
            <style>
                {`
                    ::-webkit-scrollbar-button {
                        display: none
                    }
                    ::-webkit-scrollbar {
                        width: 10px
                    }
                    ::-webkit-scrollbar-thumb {
                        background-color: #888;
                        border-radius: 10px
                    }
                    ::-webkit-scrollbar-thumb:hover {
                        background-color: #555
                    }
                `}
            </style>
            <MaterialTable
                title = {
                    <Typography
                        variant = 'h6'
                        style = {{ 
                            padding : '5px', 
                            paddingBottom : props.mode === 'edit' ? '23px' : '20px' 
                        }}
                    >
                        AUDITS
                    </Typography>
                }
                columns={columns}
                data={props?.data || []}
                options={{
                    filtering: false,
                    actionsColumnIndex: -1,
                    paging: false,
                    search: false,
                    maxBodyHeight : '330px',
                    minBodyHeight : '330px',
                    fixedColumns : true,
                    headerStyle : {
                        fontSize : headerStyle.fontSize,
                        position : 'sticky',
                        top : 0
                    }
                }}
                components={{Toolbar: (props) => (
                    <div>
                        <div style={{display: 'flex', width: '100%', alignItems: 'center'}}>
                            <div style={{width: '100%'}}>
                                <MTableToolbar {...props}/>
                            </div>

                           
                        </div>
                    </div>
                )}}

                actions={[
                    {
                        icon:()=>props.isEnabled ? <VisibilityOffIcon/> : <VisibilityIcon />,
                        isFreeAction:true,
                        hidden:open,
                        onClick:()=>props.setCardClose()
                    }
                ]}
              
            />
        </>
    );

}

export default useCommonRef(Audit)
