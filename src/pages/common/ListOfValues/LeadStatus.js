import MaterialTable from "utils/SafeMaterialTable";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteLeadStatus, getLeadManagementStatusAction, getSearchStatusAction, reorderLeadStatusesAction, setSearchStatusAction, updateLeadStageNameAction } from "redux/actions/leadManagement_actions";
import AddIcon from '@mui/icons-material/Add';
import CommonSearch from "utils/commonSearch";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import NewSource from "pages/crm/leadManagement/NewSource";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize';

function LeadStatus(){

    const dispatch = useDispatch()
    const {
        leadManagementReducers: {leadManagementStatus}
    } = useSelector(state => state)
    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext)

    const [rowData, setRowData] = useState([])
    const [confimationDialogOpen, setConfirmationDialogOpen] = useState(false)
    const [addFormOpen, setAddFormOpen] = useState(false)
    const [searchString, setSearchString] = useState('')
    const [editingStatusId, setEditingStatusId] = useState(null)
    const [editingStatusName, setEditingStatusName] = useState('')

    useEffect(() => {
        dispatch(getLeadManagementStatusAction())
    }, [])

    const handleClose = () => {
        setConfirmationDialogOpen(false)
        setAddFormOpen(false)
        setSearchString('')
        setEditingStatusId(null)
        setEditingStatusName('')
    }

    const handleDelete = async() => {
        await dispatch(deleteLeadStatus(rowData.status_id))
        handleClose()
    }

    const requestSearch = (event) => {
        const val = event.target.value
        setSearchString(val)

        let payload = {
            searchString: val
        }
        dispatch(setSearchStatusAction([]))
        dispatch(getSearchStatusAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    }

    const cancelSearch = () => {
        setSearchString('')

        let payload = {
            searchString: ''
        }
        dispatch(setSearchStatusAction([]))
        dispatch(getSearchStatusAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    }

    const handleStartEdit = (data) => {
        setEditingStatusId(data.status_id)
        setEditingStatusName(data.status_name || '')
    }

    const handleCancelEdit = () => {
        setEditingStatusId(null)
        setEditingStatusName('')
    }

    const handleSaveEdit = async(statusId) => {
        const updatedName = String(editingStatusName || '').trim()
        if(!updatedName){
            return
        }
        const response = await dispatch(updateLeadStageNameAction(statusId, updatedName))
        if(response === 'API_FINISHED_SUCCESS'){
            handleCancelEdit()
        }
    }

    const handleMoveStage = async(rowData, direction) => {
        if(searchString.trim() !== '') return
        const currentRows = Array.isArray(leadManagementStatus) ? [...leadManagementStatus] : []
        const currentIndex = currentRows.findIndex((item) => item.status_id === rowData.status_id)
        if(currentIndex < 0) return

        const targetIndex = currentIndex + direction
        if(targetIndex < 0 || targetIndex >= currentRows.length) return

        ;[currentRows[currentIndex], currentRows[targetIndex]] = [currentRows[targetIndex], currentRows[currentIndex]]
        const orderedIds = currentRows.map((row) => row.status_id)
        await dispatch(reorderLeadStatusesAction(orderedIds))
    }

    return(
        <>
        <style>
            {`
            /* Remove border under 'No records to display' */
            .MuiTableBody-root .MuiTableRow-root td {
                border-bottom: none !important;
            }
            `}
        </style>
            <MaterialTable
                data={leadManagementStatus}
                columns={[
                    {
                        field: 'status_name',
                        title: 'Name',
                        render: (rowData) => {
                            const isEditing = editingStatusId === rowData.status_id
                            if(isEditing){
                                return (
                                    <TextField
                                        fullWidth
                                        value={editingStatusName}
                                        onChange={(event) => setEditingStatusName(event.target.value)}
                                        size="small"
                                        variant="outlined"
                                    />
                                )
                            }
                            return rowData.status_name
                        }
                    },
                    {
                        field: 'action',
                        title: 'Action',
                        render: (rowData) => (
                            <>
                                {
                                    editingStatusId === rowData.status_id ? (
                                        <>
                                            <IconButton onClick={() => handleSaveEdit(rowData.status_id)}>
                                                <SaveIcon />
                                            </IconButton>
                                            <IconButton onClick={handleCancelEdit}>
                                                <CloseIcon />
                                            </IconButton>
                                        </>
                                    ) : (
                                        <IconButton onClick={() => handleStartEdit(rowData)}>
                                            <EditIcon />
                                        </IconButton>
                                    )
                                }
                                <IconButton onClick={() => {
                                    setRowData(rowData)
                                    setConfirmationDialogOpen(true)
                                }}>
                                    <DeleteIcon />
                                </IconButton>
                                <Tooltip title={searchString.trim() !== '' ? 'Clear search to reorder' : 'Move up'}>
                                    <span>
                                        <IconButton
                                            disabled={searchString.trim() !== '' || leadManagementStatus.findIndex((item) => item.status_id === rowData.status_id) === 0}
                                            onClick={() => handleMoveStage(rowData, -1)}
                                        >
                                            <ArrowUpwardIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title={searchString.trim() !== '' ? 'Clear search to reorder' : 'Move down'}>
                                    <span>
                                        <IconButton
                                            disabled={searchString.trim() !== '' || leadManagementStatus.findIndex((item) => item.status_id === rowData.status_id) === leadManagementStatus.length - 1}
                                            onClick={() => handleMoveStage(rowData, 1)}
                                        >
                                            <ArrowDownwardIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </>
                        )
                    }
                ]}
                title = 'Lead Stage'
                options={{
                    headerStyle,
                    cellStyle,
                    filtering:false,
                    actionsColumnIndex : -1,
                    paging : false,
                    search : false,
                    maxBodyHeight,
                    minBodyHeight: maxBodyHeight,
                    overflowX: 'hidden'
                }}
                components={{
                    Toolbar: (props) => {
                        return(
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
                                    <Typography variant='h6' component='div'>
                                        {props.title}
                                    </Typography>

                                    <IconButton onClick={() => setAddFormOpen(true)}>
                                        <AddIcon />
                                    </IconButton>
                                </div>

                                <div style={{ padding: '8px 16px' }}>
                                    <CommonSearch
                                        searchVal={searchString}
                                        cancelSearch={cancelSearch}
                                        requestSearch={requestSearch}
                                    />
                                </div>
                            </div>
                        )
                    }
                }}
            />

            <Dialog open={confimationDialogOpen}>
                <DialogContent>
                    <DialogContentText>Are you sure want to delete ?</DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button variant='contained' color='error' onClick={() => handleClose()}>Cancel</Button>
                    <Button variant='contained' onClick={() => handleDelete()}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={addFormOpen}>
                <NewSource type='Lead Stage' closeDialog={handleClose} />
            </Dialog>
        </>
    )

}

export default LeadStatus

