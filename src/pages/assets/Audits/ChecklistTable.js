import MaterialTable, { MTableToolbar } from "utils/SafeMaterialTable";
import { Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton, TablePagination, Tooltip } from "@mui/material";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteChecklistAction, getAllCheckListTemplateAction, getgetAllCheckListTemplateAction, setgetAllCheckListTemplateAction } from "redux/actions/audit_actions";
import { getAssetGroupIdAction, getAssetTypeIdAction } from "redux/actions/asset_actions";
import CommonSearch from "utils/commonSearch";
import { formatTime12Hour, maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize'
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Checklist from "./Checklist";
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';

const ChecklistTable = ()=>{
    const { 
        setModalTypeHandler, 
        setLoaderStatusHandler 
    } = useContext(CreateNewButtonContext)
    
    const storage = getsessionStorage()

    const {
          Audits: { getAllChecklistTemlate },
          rbacReducer: { menuAccess },
          AssetReducers: { getAssetGroup, getAssetType }
    } = useSelector((state) => state)
    
    const dispatch =  useDispatch()

    const [paginateData, setPaginateData] = useState({
        searchString : "",
        pageCount : 0,
        pageSize :  20
    })

    const [formOpen,setFormOpen] = useState(false)
    const [formType, setFormType] = useState('new')
    const [editData, setEditData] = useState(null)
    const [deleteId, setDeleteId] = useState(null)
    const [dialogConfirm, setDialogConfirm] = useState(false)

  const selectedRole = storage?.role_name
        useEffect(() => {
          if (!selectedRole) return;
          apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
        }, [selectedRole, dispatch]);

  const checkListCreate = UserRightsAuthorization(menuAccess[selectedRole], 'audit_checklist', 'can_create')
  const checkListEdit = UserRightsAuthorization(menuAccess[selectedRole], 'audit_checklist', 'can_edit')
  const checkListDelete = UserRightsAuthorization(menuAccess[selectedRole], 'audit_checklist', 'can_delete')


    
    const groupNameById = (id) => (getAssetGroup?.data || []).find((g) => Number(g?.asset_group_id) === Number(id))?.asset_group || id || '-'
    const typeNameById = (id) => (getAssetType?.data || []).find((t) => Number(t?.asset_type_id) === Number(id))?.asset_type || id || '-'

    const columns = [
        {
            field: 'checklist_name',
            title: 'Checklist Name'
        },
        {
            field: 'asset_group_id',
            title: 'Asset Group',
            render: (rowData) => groupNameById(rowData.asset_group_id)
        },
        {
            field: 'asset_type_id',
            title: 'Asset Type',
            render: (rowData) => typeNameById(rowData.asset_type_id)
        },
        {
            field: 'imageCount',
            title: 'No Of Attachments Allowed'
        },
        {
            field: 'required',
            title: 'Attachments Required',
            render: (rowData) => rowData.required === 1 ? 'Yes' : 'No'
        },
        {
            field: 'self_audit_questions',
            title: 'Audit Messages',
            render: (rowData) => {
                try {
                    const questions = JSON.parse(rowData.self_audit_questions || '[]');
                    return questions.length;
                } catch (err) {
                    return 0;
                }
            }
        },
        {
            field: 'action',
            title: 'Action',
            sorting: false,
            render: (rowData) => (
                <div style={{ display: 'flex' }}>
                    {checkListEdit && (
                        <Tooltip title='Edit'>
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditOpen(rowData);
                                }}
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    {checkListDelete && (
                        <Tooltip title='Delete'>
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteId(rowData.id);
                                    setDialogConfirm(true);
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </div>
            )
        }
    ]


    
    // const handlePageChange = (page) => {
    //     setPaginateData({...paginateData, pageCount : page})
    // }


    // const handlePageSizeChange = (size) => {
    //     setPaginateData({...paginateData, pageSize : size})
    // }
    const handlePageChange = (newPage) => {
        setPaginateData((prev) => ({
            ...prev,
            pageCount: newPage,
        }))
    }

    const handlePageSizeChange = (newSize) => {
        setPaginateData((prev) => ({
            ...prev,
            pageSize: newSize,
            pageCount:0,
        }))
    }

        const cancelSearch = () => {
        setPaginateData({...paginateData, searchString : ''})

        dispatch(setgetAllCheckListTemplateAction({data : [], numRows : 0}))

        const payload = {
            searchString : '',
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }

        dispatch(getAllCheckListTemplateAction
            (payload, setModalTypeHandler, setLoaderStatusHandler)
        )
       
    }

    const requestSearch = (e) => {
        const val = e.target.value
        setPaginateData({...paginateData, searchString : val})

        dispatch(setgetAllCheckListTemplateAction({data : [], numRows : 0}))

        const payload = {
            searchString : val,
            pageCount : 0,
            numPerPage : paginateData.pageSize
        }

        dispatch(getgetAllCheckListTemplateAction
            (payload, setModalTypeHandler, setLoaderStatusHandler))
        
    }

    useEffect(() => {
        dispatch(getAssetGroupIdAction())
        dispatch(getAssetTypeIdAction())
    }, [])

    useEffect(() => {
        const payload = {
            numPerPage: paginateData.pageSize,
            pageCount: paginateData.pageCount,
            searchString: paginateData.searchString
        }
        dispatch(getAllCheckListTemplateAction(payload))
    }, [paginateData.pageCount, paginateData.pageSize])

    const handleClose = () => {
        setFormOpen(false)
        setFormType('new')
        setEditData(null)
        const payload = {
            numPerPage : paginateData.pageSize,
            pageCount : 0,
            searchString : ""
        }
        dispatch(getAssetTypeIdAction())
        dispatch(getAllCheckListTemplateAction(payload))
    }

    const handleAddOpen = () => {
        setEditData(null)
        setFormType('new')
        setFormOpen(true)
    }

    const handleEditOpen = (rowData) => {
        setEditData(rowData)
        setFormType('edit')
        setFormOpen(true)
    }

    const handleDelete = async () => {
        await dispatch(deleteChecklistAction(deleteId, (res) => {
            if (res?.status === 200) {
                const payload = {
                    numPerPage: paginateData.pageSize,
                    pageCount: paginateData.pageCount,
                    searchString: paginateData.searchString
                }
                dispatch(getAllCheckListTemplateAction(payload))
            }
        }))
        setDialogConfirm(false)
        setDeleteId(null)
    }

    return (
        <div>
            { !formOpen ?
            <Card sx={{ width: '100%', height: '100%'}}>
                <MaterialTable
                    totalCount = {getAllChecklistTemlate.numRows}
                    columns = {columns}
                    data = {getAllChecklistTemlate.data}
                    options = {{
                        headerStyle,
                        cellStyle,
                        filtering : false,
                        actionsColumnIndex : -1,
                        paging : true,
                        pageSize : paginateData.pageSize,
                        pageSizeOptions :  [20, 50, 100],
                        search : false,
                        maxBodyHeight : maxBodyHeight,
                        minBodyHeight: maxBodyHeight,
                        // overflowY:'visible'
                    }}
                    page = {paginateData.pageCount}
                    onPageChange = {(page) => handlePageChange(page)}
                    onRowsPerPageChange = {(size) => handlePageSizeChange(size)}
                    components = {{
                        Toolbar : (props) => (
                            <div>
                                <div
                                    style={{
                                        display : 'flex',
                                        width : '100%',
                                        alignItems : 'center'
                                    }}
                                >
                                    <div style={{width : '100%'}}>
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
                                                     {...props} 
                                                     component="div"
                                                     count={getAllChecklistTemlate.numRows || 0}
                                                     page={paginateData.pageCount || 0}
                                                     rowsPerPage={paginateData.pageSize || 20}
                                                     onPageChange={(event, newPage) => handlePageChange(newPage)}                                  
                                                     rowsPerPageOptions={[20, 50, 100]}
                                                  
                                                     onRowsPerPageChange={(event) =>
                                                                         handlePageSizeChange(parseInt(event.target.value, 10))
                                                                        }
                                                     labelRowsPerPage="Rows per page:"
                                                    />
                                         </div>
                                 ),
                    }}
                        actions={
                            checkListCreate
                                ? [
                                    {
                                        icon: () => <AddIcon />,
                                        tooltip: 'Add',
                                        isFreeAction: true,
                                        onClick: handleAddOpen,
                                    },
                                ]
                                : []
                        }
                    title = 'Checklist Templates'
                >

                </MaterialTable>
                </Card>
            : <Checklist
                type={formType}
                rowData={formType === 'edit' ? editData : undefined}
                handleClose={handleClose}
            />
            }

            <Dialog
                open={dialogConfirm}
                onClose={() => setDialogConfirm(false)}
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
            >
                <DialogTitle id='alert-dialog-title'>{'Delete ?'}</DialogTitle>
                <Grid container>
                    <Grid size={{ lg: 6, md: 6 }}>
                        <DialogContent style={{ width: 500 }}>
                            <DialogContentText
                                id='alert-dialog-description'
                                sx={{ color: 'warning.main' }}
                            >
                                Are you sure you want to delete ?
                            </DialogContentText>
                        </DialogContent>
                    </Grid>
                </Grid>
                <DialogActions>
                    <Button onClick={() => setDialogConfirm(false)} color='secondary'>
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color='primary' autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default ChecklistTable;
