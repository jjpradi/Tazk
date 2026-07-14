import{ Grid, Tooltip, Fade, IconButton, Card, Dialog, DialogContent, DialogContentText, DialogActions, Button, Pagination,TablePagination } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { deleteAssetsDynamicPropAction, deleteLeadsDynamicPropAction, getAllDynamicProp, getSearchDynamicPropAction, setSearchDynamicPropListAction } from 'redux/actions/asset_actions';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import { useContext, useEffect, useState } from 'react';
import CommonSearch from 'utils/commonSearch';
import AddIcon from '@mui/icons-material/Add';
import NewDynamicProperties from './DynamicProp';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { getsessionStorage } from 'pages/common/login/cookies';
import { headerStyle, cellStyle } from 'utils/pageSize';
import moment from 'moment';
import { getStickyTableOptions, stickyTableComponents } from 'utils/stickyTableLayout';
import { MTablePagination } from '@material-table/core';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

function DynamicProperty(){

    const dispatch = useDispatch()
    const storage = getsessionStorage()
    const selectedRole = storage?.role_name

    const{
        AssetReducers: {
            getDynamicProp
        },
        rbacReducer: { menuAccess = {} }
    } = useSelector((state) => state)

    const[pagination, setPagination] = useState({
        searchString: '',
        pageCount: 0,
        numPerPage: 20

    })

    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(
        CreateNewButtonContext,
      );

    const[tableData, setTableData] = useState([])
    const[formOpen, setFormOpen] = useState(false)
    const[formType, setFormType] = useState('new')
    const[editData, setEditData] = useState([])
    const[dialogOpen, setDialogOpen] = useState(false)

    useEffect(() => { (async () => {
        const data = await getDynamicProp?.data
        const FinalData = []
        if(data?.length > 0){
            const finalData = await data.map((prop) => ({
                ...prop,
                options: JSON.parse(prop.options)
            }))
            FinalData.push(finalData)
        }
        setTableData(...FinalData)
    })();
}, [getDynamicProp])

    useEffect(() => {
        dispatch(getAllDynamicProp(pagination))
    }, [pagination.pageCount, pagination.numPerPage])
    const dynamicPropCreate = UserRightsAuthorization(menuAccess[selectedRole],'config__custom_fields','can_create')
    const dynamicPropEdit = UserRightsAuthorization(menuAccess[selectedRole],'config__custom_fields','can_edit')
    const dynamicPropDelete = UserRightsAuthorization(menuAccess[selectedRole],'config__custom_fields','can_delete')

    const assetColumns = [
        {
            field: 'asset_type',
            title: 'Asset Type'
        },
        {
            field: 'labelName',
            title: 'Name'
        },
        {
            field: 'inputType',
            title: 'Type'
        },
        {
            field: 'createdAt',
            title: 'Created On',
            render: (rowData) => {
                return moment(rowData.createdAt).format('DD/MM/YYYY')
            }

        },
        {
            title: 'Actions',
            render: (rowData) => (
                
                <Grid container>
                    <Grid>
                    {dynamicPropEdit && (
                        <Tooltip title='Edit'
                                TransitionComponent={Fade}
                                TransitionProps={{timeout: 600}}
                                placement='top'
                        >
                            <IconButton onClick={() => handleEdit(rowData)}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    )}

                    </Grid>
                    <Grid>
                        {dynamicPropDelete && (
                        <Tooltip title='Delete'
                                TransitionComponent={Fade}
                                TransitionProps={{timeout: 600}}
                                placement='top'
                        >
                            <IconButton onClick={() => handleDeleteDialogOpen(rowData)}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                        )}
                    </Grid>
                </Grid>
                
            )
        }
    ]

    const leadsColumns = [
        {
            field: 'labelName',
            title: 'Name'
        },
        {
            field: 'inputType',
            title: 'Type'
        },
        {
            field: 'createdAt',
            title: 'Created On',
            render: (rowData) => {
                return moment(rowData.createdAt).format('DD/MM/YYYY')
            }

        },
        {
            title: 'Actions',
            render: (rowData) => (
                
                <Grid container>
                    <Grid>
                        <Tooltip title='Edit'
                                TransitionComponent={Fade}
                                TransitionProps={{timeout: 600}}
                                placement='top'
                        >
                            <IconButton onClick={() => handleEdit(rowData)}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                    <Grid>
                        <Tooltip title='Delete'
                                TransitionComponent={Fade}
                                TransitionProps={{timeout: 600}}
                                placement='top'
                        >
                            <IconButton onClick={() => handleDeleteDialogOpen(rowData)}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
                
            )
        }
    ]

    const handleAssetsDynamicPropDelete = async () => {
        setDialogOpen(false)
        await dispatch(deleteAssetsDynamicPropAction(tableData.component_id))
        dispatch(getAllDynamicProp(pagination))
    }

    const handleLeadsDynamicPropDelete = async () => {
        setDialogOpen(false)
        await dispatch(deleteLeadsDynamicPropAction(tableData.component_id))
        dispatch(getAllDynamicProp(pagination))
    }

    const handleEdit = (editData) => {
        setEditData(editData)
        setFormType('edit')
        setFormOpen(true)
    }

    const handlePageChange = (page) => {
        setPagination({
            ...pagination,
            pageCount: page
        })
    }

    const handlePageSizeChange = (size) => {
        setPagination({
            ...pagination,
            numPerPage: size
        })
    }

    const handleOpen = () => {
        setFormOpen(true)
        setFormType('new')
    }

    const handleClose = () => {
        setFormOpen(false)
        setEditData([])
        dispatch(getAllDynamicProp(pagination))
    }

    const cancelSearch = () => {
        setPagination({...pagination, searchString: ''})

        dispatch(setSearchDynamicPropListAction({data: [], numCount: 0}))

        let payload = {
            searchString: '',
            pageCount: pagination.pageCount,
            numPerPage: pagination.numPerPage
        }

        dispatch(getSearchDynamicPropAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    }

    const requestSearch = (e) => {
        const val = e.target.value
        
        setPagination({...pagination, searchString: val})
        dispatch(setSearchDynamicPropListAction({data: [], numCount: 0}))

        let payload = {
            searchString: val,
            pageCount: 0,
            numPerPage: pagination.numPerPage
        }

        dispatch(getSearchDynamicPropAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    }

    const handleDeleteDialogOpen = (rowData) => {
        setTableData(rowData)
        setDialogOpen(true)
    }

    const handleDialogClose = () => {
        setDialogOpen(false)
        setFormOpen(false)
        dispatch(getAllDynamicProp(pagination))
    }

    return(
        <>
                <Card sx={{width: '100%'}}>
                <MaterialTable
                    style={{height: 'calc(100vh - 80px)'}}
                    totalCount={getDynamicProp?.numCount}
                    components={{
                        ...stickyTableComponents,
                        Toolbar: (props) => (
                        <div>
                            <div style={{display: 'flex', width: '100%', alignItems: 'center'}}>
                                <div style={{width: '100%'}}>
                                    <MTableToolbar {...props} />
                                </div>

                                <div>
                                    <CommonSearch
                                        searchVal={pagination.searchString}
                                        cancelSearch={cancelSearch}
                                        requestSearch={requestSearch}
                                    />
                                </div>
                            </div>
                        </div>
                    ),
                    Pagination: (props) => (
                        <div style={{
                             display: "flex",
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                    padding: "8px 16px",
                        }}>
                            <TablePagination 
                            {...props}
                        count = {getDynamicProp?.numCount || 0}
                    page={pagination.pageCount}
                    rowsPerPage={pagination.numPerPage || 20}
                     onPageChange={(event, page) => handlePageChange(page)}
                    onRowsPerPageChange={(event) =>
                         handlePageSizeChange(parseInt(event.target.value,10))
                        }       
                        labelRowsPerPage ="Rows per page:"
                            />
                        </div>
                    ),
                }}
                options={getStickyTableOptions({
                    bodyOffset: 210,
                    headerStyle,
                     options:{
                        cellStyle,
                        tableLayout: 'auto',
                        toolbar: true,
                        pageSizeOptions: [20, 30, 50],
                        filtering: false,
                        pageSize: pagination.numPerPage,
                        actionsColumnIndex: -1,
                        paging: true,
                        search: false,
                        // maxBodyHeight : '83vh',
                        // minBodyHeight : '83vh'
                     }
                    })}
                    title='Custom Fields'
                    columns={storage.company_type === 9 ? assetColumns : leadsColumns} 
                    data={tableData}
                    actions={[
                        ...(dynamicPropCreate ? [ {
                            icon: () => <AddIcon />,
                            tooltip: 'Add',
                            isFreeAction: true,
                            onClick: () => handleOpen(),
                        }, ] : []),
                    ]}
                />
</Card>
                <Dialog open = {dialogOpen}>
                    <DialogContent style = {{ width : 500 }}>
                        <DialogContentText>
                            Are you sure want to delete ?
                        </DialogContentText>

                        <DialogActions>
                            <Button
                                variant = 'contained'
                                color = 'error'
                                onClick = {handleDialogClose}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant = 'contained'
                                color = 'error'
                                onClick = {storage.company_type === 9 ? handleAssetsDynamicPropDelete : handleLeadsDynamicPropDelete}
                            >
                                Delete
                            </Button>
                        </DialogActions>
                    </DialogContent>
                </Dialog>

                <Dialog open={formOpen}>
                    <NewDynamicProperties type='assets' formType={formType} editData={editData} handleClose={handleClose}/>
                </Dialog>
        </>
    )

}

export default DynamicProperty
