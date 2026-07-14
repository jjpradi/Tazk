import MaterialTable, { MTableToolbar } from "utils/SafeMaterialTable"
import { Autocomplete, Button, Card, Chip, Dialog, DialogActions, DialogContent, Grid, IconButton, TextField, TablePagination, Tooltip, DialogContentText, DialogTitle } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import CommonSearch from "utils/commonSearch"
import AddIcon from '@mui/icons-material/Add'
import AuditCheckListCreationForm from "./AuditCheckListCreation"
import { useDispatch, useSelector } from "react-redux"
import { getAuditCheckList, getAuditCheckListSearchAction, setAuditCheckListSearchAction ,deleteAuditAction } from "redux/actions/audit_actions"
import CreateNewButtonContext from "context/CreateNewButtonContext"
import { headerStyle, cellStyle, maxBodyHeight } from "utils/pageSize"
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import moment from "moment"
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import EditIcon from "@mui/icons-material/Edit"
import  DeleteIcon from "@mui/icons-material/Delete"
import { getAllAssetAction } from "redux/actions/asset_actions";
import { getEmpbasecompanyFilterAction } from "redux/actions/attendance_actions"


function Audit(){
    const storage = getsessionStorage();
    const dispatch = useDispatch()
    const {
        Audits: {auditCheckList }, 
        rbacReducer: { menuAccess } ,
        AssetReducers: {getAssetName},
        attendanceReducer: { getCompanyBasedEmployeeFilter}
    } = useSelector((state) => state)

    const[dialogOpen, setDialogOpen] = useState(false)
    const[filterOpen , setFilterOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)
    const [dialogConfirm, setDialogConfirm] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editData, setEditData] = useState(null)
    const [formtype, setFormtype] = useState(null)
    const [showDetails, setShowDetails] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const[pagination, setPagination] = useState({
        searchString: '',
        pageCount: 0,
        numPerPage: 20
    })
    const {setModalTypeHandler, setLoaderStatusHandler} = useContext(CreateNewButtonContext)
    const auditStatus = {
        Pending: 'warning',
        Done: 'success'
    }

    const priorityOptions = [
        {id:1,priority : 'LOW'},
        {id:2,priority : 'MEDIUM'},
        {id:3,priority : 'HIGH'},
    ]

    const [errors,setErrors] = useState();

    const selectedRole = storage?.role_name
            useEffect(() => {
              if (!selectedRole) return;
              apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
            }, [selectedRole, dispatch]);
    
    const auditCreate =UserRightsAuthorization(menuAccess[selectedRole], 'audits', 'can_create') 
    const auditEdit = UserRightsAuthorization(menuAccess[selectedRole], 'audits', 'can_edit')
    const auditDelete = UserRightsAuthorization(menuAccess[selectedRole], 'audits', 'can_delete')
  
    const columns = [
        {
            field: 'name',
            title: 'Asset Name',
            render : (rowData) => {
                return `${rowData.name} - ${rowData.code}`
            }
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
                console.log(rowData , "sdfghgfds")
                return moment.utc(rowData.audit_date).format('DD/MM/YYYY')
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
            field : 'priority',
            title : 'Priority',
        },
        {
            field: 'repeat_duration',
            title: 'Repeat Duration',
            render: (rowData) => {
                const duration = rowData.repeat_duration ? rowData.repeat_duration : '-'
                return duration
            }
        },
        {
            field: 'action',
            title: 'Actions',
            render: (rowData) => {
                return(
                    <div style ={{display: 'flex'}}>
                        {
                        auditEdit &&
                        <Tooltip title="Edit">
                            <IconButton
                            disabled = {(rowData?.status).toLowerCase() === 'done'}
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditData(rowData)
                                editOpen()
                            }}
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                         }
                         {
                            auditDelete &&
                         
                        <Tooltip title="Delete">
                            <IconButton
                            onClick={(e) => {
                                e.stopPropagation()
                                setDeleteId(rowData?.checkList_id)
                                setDialogConfirm(true)
                            }}
                            >
                                <DeleteIcon/>
                            </IconButton>
                        </Tooltip>
                        }
                    </div>
                )
            }
        }
    ]

    const [filterValues,setFilterValues] = useState({
        priority :  null,
        assetName: null,
        assignTo: null,
    })

    
    const handleChange = (name, value) => {
    const newValue = value || null    
    const updatedValues = {
        ...filterValues,
        [name]: newValue
    };

    setFilterValues(updatedValues);

    setErrors({
        priority: updatedValues.priority ? null : "Priority is required!",
        serviceType: updatedValues.serviceType ? null : "Service Type is required!"
    });
};

const handleClear = async()=>{

         const payload = {
            searchString : pagination.searchString,
            pageCount : 0,
            numPerPage : pagination.numPerPage,
            priority :  null,
            assetName: null, 
            assignTo: null
        }

        
        await dispatch(getAuditCheckList
            (payload, setModalTypeHandler, setLoaderStatusHandler))
            
            setFilterOpen(false)
            setFilterValues(({...filterValues,priority : null , assetName : null , assignTo : null}))
}

    const handleDelete = async () => {
        await dispatch(deleteAuditAction(deleteId))
        setDialogConfirm(false)
        setDeleteId(null)
        handleClear()
    }

const handleSubmit = ()=>{

        const payload = {
            searchString : pagination.searchString,
            pageCount : pagination.pageCount,
            numPerPage : pagination.numPerPage,
            priority :  filterValues.priority?.priority,
            assetName :  filterValues.assetName?.asset_id,
            assignTo :  filterValues.assignTo,
        }

        dispatch(getAuditCheckList
                (payload, setModalTypeHandler, setLoaderStatusHandler))

        setFilterOpen(false)
}

    

    useEffect(() => {
        dispatch(getAuditCheckList(pagination))
    }, [pagination.numPerPage, pagination.pageCount, dialogOpen])

    useEffect(() => {
        if (filterOpen) {
            const data = {
                searchString: ''
            }
            dispatch(getAllAssetAction())
            dispatch(getEmpbasecompanyFilterAction(data))
        }
    }, [filterOpen])

    const handlePageSizeChange = (size) => {
        setPagination({
            ...pagination,
            numPerPage: size,
            pageCount: 0
        })
    }

    const handlePageChange = (page) => {
        setPagination((prev) => ({
            ...prev,
            pageCount: page
        }))
    }

    const handleOpen = () => {
        setEditData(null)
        setShowDetails(false)
        setShowForm(true)
        setFormtype("new")
    }

    const handleClose = () => {
        // setDialogOpen(close)
        setShowForm(false)
        setShowDetails(false)
         const payload = {
            searchString : pagination.searchString,
            pageCount : pagination.pageCount,
            numPerPage : pagination.numPerPage,
         }
         dispatch(getAuditCheckList(payload))

    }

      const editOpen = () => {
        setShowDetails(false)
        setShowForm(true)
        setFormtype("edit")
    }

    const requestSearch = (e) => {
        const val = e.target.value
        setPagination({
            ...pagination,
            searchString: val
        })
        dispatch(setAuditCheckListSearchAction({data: [], numRows: 0}))
        const payload = {
            searchString: val,
            pageCount: 0,
            numPerPage: pagination.numPerPage
        }
        dispatch(getAuditCheckListSearchAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    }

    const cancelSearch = () => {
        setPagination({
            ...pagination,
            searchString: ''
        })
        dispatch(setAuditCheckListSearchAction({data: [], numRows: 0}))
        const payload = {
            searchString: '',
            pageCount: pagination.pageCount,
            numPerPage: pagination.numPerPage
        }
        dispatch(getAuditCheckListSearchAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    }

    return (
        <>
            {
                // dialogOpen === false  &&  dialogConfirm === false && 
                !showForm &&  (
                    <div>
                        <MaterialTable
                            // style={{height: 'calc(100vh - 80px)',overflow:'hidden'}}
                            title='Audits'
                            columns={columns}
                            data={auditCheckList.data}
                            options={{
                                headerStyle,
                                cellStyle,
                                pageSizeOptions: [20, 50, 100],
                                filtering: false,
                                pageSize: pagination.numPerPage,
                                actionsColumnIndex: -1,
                                paging: true,
                                search: false,
                                maxBodyHeight: maxBodyHeight,
                                minBodyHeight: maxBodyHeight,
                            //    overflowY:'visible'
                            }}
                             actions={[
                                auditCreate ? {
                                    icon: () => <AddIcon />,
                                    tooltip: 'Add Checklist',
                                    isFreeAction: true,
                                    onClick: handleOpen
                                } : null,
                                {
                                    icon : () => <FilterAltIcon />,
                                    tooltip : 'Filter',
                                    isFreeAction : true,
                                    onClick : ()=> setFilterOpen(true)
                                },

                            ]}
                            totalCount={auditCheckList.numRows}
                            page={pagination.pageCount}
                            onPageChange={(page) => handlePageChange(page)}
                            onRowsPerPageChange={(size) => handlePageSizeChange(size)}
                            components={{Toolbar: (props) => (
                                <div>
                                    <div style={{display: 'flex', width: '100%', alignItems: 'center'}}>
                                        <div style={{width: '100%'}}>
                                            <MTableToolbar {...props}/>
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
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            alignItems: "center",
                                            padding: "8px 16px",
                                        }}
                                    >
                                        <TablePagination
                                            component="div"
                                            count={auditCheckList?.numRows || 0}
                                            page={pagination.pageCount}
                                            rowsPerPage={pagination.numPerPage}
                                            rowsPerPageOptions={[20, 50, 100]}
                                            onPageChange={(event, newPage) => handlePageChange(newPage)}
                                            onRowsPerPageChange={(event) =>
                                                handlePageSizeChange(parseInt(event.target.value, 10))
                                            }
                                            labelRowsPerPage="Rows per page:"
                                        />
                                    </div>
                                ),
                        }}
                           
                        />

                        
               <Dialog
                maxWidth="xs"
                fullWidth
                open={filterOpen}
                >
                <DialogContent sx={{ padding: 5 }}>
                <Grid
                container
                display={'flex'}
                justifyContent={'flex-end'}
                >
                <IconButton aria-label='close' onClick={() => setFilterOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Grid>
                    <Grid container spacing={2}>
                    <Grid size={12}>
                        <Autocomplete
                        fullWidth
                        options={priorityOptions || []}
                        getOptionLabel={(option) => option.priority || ''}
                        value={filterValues.priority || null}
                        onChange={(event, value) =>
                            handleChange('priority', value)
                        }
                        renderInput={(params) => (
                            <TextField
                            {...params}
                            label="Priority"
                            variant="filled"
                            />
                        )}
                        />
                    </Grid>
                    {/* Asset Name */}
                    <Grid size={12}>
                        <Autocomplete
                            fullWidth
                            options={getAssetName || []}
                            getOptionLabel={(option) => option ? `${option.Name} - ${option.Code}` : ''}
                            value={filterValues.assetName || null}
                            onChange={(event, value) => handleChange('assetName', value)}
                            isOptionEqualToValue={(option, value) => option?.asset_id === value?.asset_id}
                            renderInput={(params) => (
                                <TextField {...params} label="Asset Name" variant="filled" />
                            )}
                        />
                    </Grid>

                    {/* Assigned To */}
                    <Grid size={12}>
                        <Autocomplete
                            fullWidth
                            options={getCompanyBasedEmployeeFilter || []}
                            getOptionLabel={(option) => option?.full_name || ''}
                            value={filterValues.assignTo
                                ? getCompanyBasedEmployeeFilter.find((u) => String(u.employee_id) === String(filterValues.assignTo)) || null
                                : null}
                            onChange={(event, value) => handleChange('assignTo', value?.employee_id ?? null)}
                            isOptionEqualToValue={(option, value) => String(option?.employee_id) === String(value?.employee_id)}
                            renderInput={(params) => (
                                <TextField {...params} label="Assigned To" variant="filled" />
                            )}
                        />
                    </Grid>

                    
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button variant='contained' color='error' onClick={handleClear}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>Apply</Button>
                </DialogActions>
                </Dialog>

                    </div>
                )
            }
            {
                (showForm || showDetails) && (
                    <AuditCheckListCreationForm 
                    type={showDetails ? "detail" : formtype}
                    assetData={showDetails ? selectedRow : undefined}
                    rowData={showDetails ? undefined : (formtype === "edit" ? editData : undefined)}
                        handleClose = {handleClose}
                    />
                )
            }

            <Dialog
                open={dialogConfirm}
                onClose={!dialogConfirm}
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
            >
                <DialogTitle id='alert-dialog-title'>{'Delete ?'}</DialogTitle>
                <Grid container>
                    <Grid
                        size={{
                            lg: 6,
                            md: 6
                        }}>
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
                    <Button
                        onClick={handleDelete}
                        color='primary'
                        autoFocus
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            
        </>
    );

}

export default Audit
