import MaterialTable, { MTableToolbar } from "@material-table/core";
import { Autocomplete, Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, TextField, Tooltip } from "@mui/material";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add'
import { useContext, useEffect, useState } from "react";
import CommonSearch from "utils/commonSearch";
import { getSearchCompliancesAction, setSearchCompliancesAction } from "redux/actions/compliances_actions";
import CustomRenewalsNewForm from "./CustomRenewalsNewForm"
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteCustomRenewalsAction, getAllCustomRenewalsAction } from "redux/actions/renewals_actions";
import { useDispatch, useSelector } from "react-redux";
import { Grid } from "@mui/system";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import CloseIcon from '@mui/icons-material/Close';
import toMomentOrNull from 'utils/DateFixer'
import moment from "moment";
import CustomRenewalDetails from "./CustomRenewalDetails";
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { getSearchCustomRenewalsAction ,setSearchCustomRenewalsAction} from "../../../redux/actions/renewals_actions";


export default function CustomRenewalsTable() {
    const storage = getsessionStorage();
    const dispatch = useDispatch()
    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(
        CreateNewButtonContext
    )
    const [paginateData, setPaginateData] = useState({
        searchString: '',
        pageCount: 0,
        pageSize: 20
    })
    
    const [showForm, setShowForm] = useState(false)
    const [editData, setEditData] = useState(null)
    const [formtype, setFormtype] = useState(null)
    const [deleteId,setDeleteId] = useState(null)
    const [dialogConfirm,setDialogConfirm] = useState(false)
    const [filterOpen,setFilterOpen] = useState()
    const [showDetails, setShowDetails] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const currentMonth = moment().startOf('month')
    const firstDataOfMonth = currentMonth.format('YYYY-MM-DD')
    const lastDataOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD')

    const [formValues, setFormValues] = useState({
        startDate: firstDataOfMonth,
        endDate: lastDataOfMonth,
        frequency: null
    })

    const [formErrors, setFormErrors] = useState({
        startDate: null,
        endDate: null,
    });

    const frequency = [
        { id: 1, frequency: 'MONTHLY' },
        { id: 2, frequency: 'QUARTERLY' },
        { id: 3, frequency: 'HALF YEARLY' },
        { id: 4, frequency: 'YEARLY' },
    ]

    const { RenewalsReducers : { allCustomRenewals },rbacReducer: { menuAccess }  } = useSelector((state) => state)
    console.log(allCustomRenewals ,"dgfdsgfd");
    
    const handleClear = async() => {

        const currentMonth = moment().startOf('month');
        const firstDateOfMonth = currentMonth.format('YYYY-MM-DD');
        const lastDateOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD');

        const payload = {
            searchString: paginateData.searchString,
            pageCount: paginateData.pageCount,
            numPerPage: paginateData.pageSize,
            startDate: firstDateOfMonth,
            endDate: lastDateOfMonth,

        }

        setFormValues({ ...formValues, startDate: firstDateOfMonth, endDate: lastDateOfMonth, frequency: null })
        setFormErrors({ startDate: null, endDate: null })
        await dispatch(getAllCustomRenewalsAction(payload))
        setFilterOpen(false)
    }

    const handleChange = (name, value) => {
        const newValue = value || null

        const updatedValues = {
            ...formValues,
            [name]: newValue
        }
        setFormValues(updatedValues)

        setFormErrors((prev) => ({
            ...prev,
            [name]: !newValue ? `${name} is required` : null
        }))
    }
const handleSubmit = () => {
    let newError = {}

    if (!formValues.startDate) {
        newError.startDate = "Start date is required"
    }
    if (!formValues.endDate) {
        newError.endDate = "End date is required"
    }
    if (!formValues.frequency) {
        newError.frequency = "Frequency is required"
    }
    setFormErrors(newError)

    if (Object.keys(newError).length > 0) return

    const payload = {
        searchString: paginateData.searchString,
        pageCount: paginateData.pageCount,
        numPerPage: paginateData.pageSize,
        startDate: formValues.startDate,
        endDate: formValues.endDate,
        frequency:  formValues.frequency?.id
    }

    dispatch(getAllCustomRenewalsAction(payload))
    setFilterOpen(false)
}
    useEffect(() => {
     const payload = {
            searchString: paginateData.searchString,
            pageCount: paginateData.pageCount,
            numPerPage: paginateData.pageSize,
        }
        dispatch(getAllCustomRenewalsAction(payload))
    }, [])

    const requestSearch = (e) => {
        const val = e.target.value
        setPaginateData({ ...paginateData, searchString: val })

        dispatch(setSearchCustomRenewalsAction({ data: [], numRows: 0 }))

        const payload = {
            searchString: val,
            pageCount: 0,
            numPerPage: paginateData.pageSize
        }
        dispatch(getSearchCustomRenewalsAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    }
    const cancelSearch = () => {
        setPaginateData({ ...paginateData, searchString: '' })

        dispatch(setSearchCustomRenewalsAction({ data: [], numRows: 0 }))

        const payload = {
            searchString: '',
            pageCount: paginateData.pageCount,
            numPerPage: paginateData.pageSize
        }
        dispatch(getSearchCustomRenewalsAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    }

    const handleClose = () => {
        setShowForm(false)
        setShowDetails(false)
        const payload = {
           searchString: paginateData.searchString,
            pageCount: paginateData.pageCount,
            numPerPage: paginateData.pageSize,
        }
        dispatch(getAllCustomRenewalsAction(payload))
    }

    const handleOpen = () => {
        setEditData(null)
        setSelectedRow(null)
        setShowDetails(false)
        setShowForm(true)
        setFormtype("new")
    }

    const editOpen = (rowData) => {
        setSelectedRow(null)
        setShowDetails(false)
        setEditData(rowData)
        setShowForm(true)
        setFormtype("edit")
    }

    const handleDelete = async () => {
        await dispatch(deleteCustomRenewalsAction(deleteId))
        setDialogConfirm(false)
        handleClose()
    }

    
    const selectedRole = storage?.role_name
                useEffect(() => {
                  if (!selectedRole) return;
                  apiCalls(
                    setModalTypeHandler,
                    setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
                }, [selectedRole, dispatch]);
        
    const alertCreate =UserRightsAuthorization(menuAccess[selectedRole], 'renewals__custom_renewals', 'can_create') 
    const alertEdit =UserRightsAuthorization(menuAccess[selectedRole], 'renewals__custom_renewals', 'can_edit') 
    const alertDelete =UserRightsAuthorization(menuAccess[selectedRole], 'renewals__custom_renewals', 'can_delete') 
      

    const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "0000-00-00" || dateStr === "null") return "-";
    const date = new Date(dateStr);
    if (isNaN(date)) return "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
    };

    const columns = [
        {
            field : 'asset_name',
            title : 'Asset Name'
        },
        {
            field : 'renewal_type',
            title : 'Renewal Type'
        },
        {
            field : 'startDate',
            title : 'Start Date',
            render : (rowData) => formatDate(rowData.startDate)
        },
        {
            field : 'endDate',
            title : 'End Date',
            render : (rowData) => formatDate(rowData.endDate)
        },
        {
            field : 'image',
            title : 'Attachment',
            render: (rowData) => {
                const imageUrl = rowData?.image?.[0]?.imageUrl;

                return imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="Attachment"
                        style={{ width: 60, height: 60, objectFit: 'cover' }}
                    />
                ) : (
                    '-'
                );
            }
        },
        {
            field: 'action',
            title: 'Action',
            render: (rowData) => {
                return (
                    <div style={{ display: "flex" }}>
                       {
                        alertEdit && 
                        <Tooltip title="Edit">
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    editOpen()
                                    setEditData(rowData)
                                }}
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                       } 
                       {
                        alertDelete && 
                        <Tooltip title="Delete">
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteId(rowData.id)
                                    setDialogConfirm(true)
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                       }
                        
                    </div>
                )
            }
        }
    ]

 


    return (
        <>
            {
                !showForm && !showDetails && (
                <MaterialTable
                    title="Custom Renewals"
                    columns={columns}
                    data={allCustomRenewals?.data || []}
                    onRowClick={(event, rowData) => {
                        setSelectedRow(rowData);
                        setShowDetails(true);
                    }}
                    options={{
                        filtering: false,
                        actionsColumnIndex: -1,
                        paging: true,
                        pageSize: paginateData.pageSize,
                        pageSizeOptions: [20, 50, 100],
                        search: false,
                        maxBodyHeight: 'calc(100vh - 190px)',
                        minBodyHeight: 'calc(100vh - 190px)',
                        fixedHeader: true,
                    }}
                    actions={[
                       alertCreate ? {
                            icon: () => <AddIcon />,
                            tooltip: 'Add',
                            isFreeAction: true,
                            onClick: handleOpen
                        } : null,
                        {
                            icon: () => (
                                <div style={{ display: 'flex' }}>
                                    <IconButton onClick={() => setFilterOpen(true)}>
                                        <FilterAltIcon />
                                    </IconButton>
                                </div>
                            ),
                            tooltip: 'Filter',
                            isFreeAction: true,
                        },
                    ]}

                    components={{
                        Toolbar: (props) => (
                            <div>
                                <div
                                    style={{
                                        display: 'flex',
                                        width: '100%',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div style={{ width: '100%' }}>
                                        <MTableToolbar {...props} />
                                    </div>

                                    <div>
                                        <CommonSearch
                                            searchVal={paginateData.searchString}
                                            cancelSearch={cancelSearch}
                                            requestSearch={requestSearch}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    }}

                />
                )
            }
            {
                showForm && (
                    <CustomRenewalsNewForm
                        type={formtype}
                        rowData={formtype === "edit" ? editData : undefined}
                        handleClose={handleClose}
                    />
                )
            }
            {
                showDetails && (
                    
                    <CustomRenewalDetails
                        data={selectedRow}
                        handleClose={handleClose}
                        handleEdit={editOpen}
                        user_rights={menuAccess}
                    />
                )
            }

            <Dialog
                open={dialogConfirm}
                onClose={() => setDialogConfirm(false)}
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

            <Dialog open={filterOpen} maxWidth="xs">
                <Card sx={{ pt: 3, p: 5 }}>

                    <div style={{ display: 'flex', justifyContent: 'end', marginBottom: '10px' }}>
                        <IconButton aria-label="close" onClick={() => setFilterOpen(false)}>
                            <CloseIcon />

                        </IconButton>
                    </div>

                    <Grid container spacing={3}>
                        <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <LocalizationProvider dateAdapter={DateAdapter}>
                                <DatePicker
                                    label='From Date'
                                    value={toMomentOrNull(formValues.startDate || null)}
                                    onChange={(date) =>
                                        handleChange('startDate', moment(date).format('YYYY-MM-DD'))
                                    }
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            variant: 'filled',
                                            error: Boolean(formErrors.endDate),
                                            helperText: formErrors.endDate
                                        }
                                    }}
                                     />
                            </LocalizationProvider>
                        </Grid>
                        <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <LocalizationProvider dateAdapter={DateAdapter}>
                                <DatePicker
                                    label='To Date'
                                    value={toMomentOrNull(formValues.endDate || null)}
                                    onChange={(date) =>
                                        handleChange('endDate', moment(date).format('YYYY-MM-DD'))
                                    }
                                    slotProps={{
                                        textField: { fullWidth: true, variant: 'filled' }, 
                                        error: Boolean(formErrors.endDate),
                                        helperText: formErrors.endDate
                                    }}

                            
                                />
                            </LocalizationProvider>
                        </Grid>

                        <Grid
                            size={{
                                lg: 6,
                                md: 6,
                                sm: 6,
                                xs: 12
                            }}>
                            <Autocomplete
                                options={frequency || []}
                                getOptionLabel={(option) =>
                                    option.frequency
                                }
                                value={formValues.frequency || null}
                                onChange={(e, newValue) => handleChange('frequency', newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        label={'Frequency'}
                                        variant='filled'
                                        error={Boolean(formErrors.frequency)}
                                        helperText={formErrors.frequency || ''}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <Grid container justifyContent='flex-end' spacing={2} mb={2}>
                                <Grid>
                                    <Button
                                        variant='contained'
                                        color='error'
                                        onClick={handleClear}
                                    >
                                        Clear
                                    </Button>
                                </Grid>

                                <Grid>
                                    <Button
                                        variant='contained'
                                        color='primary'
                                        onClick={handleSubmit}
                                    >
                                        Apply
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Card>
            </Dialog>



        </>
    )
}
