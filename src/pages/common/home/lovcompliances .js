import {useEffect, useState} from 'react';
import MaterialTable from 'utils/SafeMaterialTable';
import { Grid, TextField, IconButton, Tooltip, Dialog, Fade, Button, DialogContentText, DialogContent, DialogActions, Typography, Checkbox} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {useDispatch, useSelector} from 'react-redux';
import { addComplianceAction, deleteCompliancesForInitialLovAction, getCompliancesForInitialLovAction } from 'redux/actions/compliances_actions';

function LovCompliances({handleCompliances}) {

    const dispatch = useDispatch()
    
    const [rowData, setRowData] = useState([])
    const [selectAll, setSelectAll] = useState(false)
    const [selectedRows, setSelectedRows] = useState([])
    const [open, setOpen] = useState(false)
    const [data, setData] = useState([])

    const [values, setValues] = useState({
        compliance_name: '',
    })

    const {
        compliancesReducers : { getCompliancesForInitialLov }
    } = useSelector((state) => state)

    useEffect(() => {
        dispatch(getCompliancesForInitialLovAction((response) => {
            if(response.length > 0) {
                setData(response)
            }
        }))
    }, [])

    useEffect(() => {
        let filterData = data.filter(id => id.isDeleted ==0)
        setSelectedRows(filterData?.map(d => d.compliance_id))
    }, [data])

    const handleDelete = async () => {
        setOpen(false)
        await dispatch(deleteCompliancesForInitialLovAction(rowData.compliance_id))
        dispatch(getCompliancesForInitialLovAction((response) => {
            if (response?.length > 0) {
                setData(response)
            }
        }))
    }

    const handleDeleteOpen = (rowdata) => {
        setRowData(rowdata)
        setOpen(true)
    };

    const handleChange = (val, name) => {
        setValues({...values, [name]: val})
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        await dispatch(addComplianceAction({name : values.compliance_name}))
        dispatch(getCompliancesForInitialLovAction((response) => {
            if(response.length > 0) {
                setData(response)
            }
        }))
        setValues({ compliance_name: '' })
    };

    const handleSelectAllClick = () => {
        if (!selectAll) {
            const allIds = getCompliancesForInitialLov?.map((row) => row.compliance_id)
            setSelectedRows(allIds)
            handleCompliances(getCompliancesForInitialLov?.map((row) => row.compliance_name), [])
        } 
        else {
            setSelectedRows([])
            handleCompliances([], getCompliancesForInitialLov?.map((row) => row.compliance_id))
        }
        setSelectAll(!selectAll)
    };

    const renderCheckbox = (rowData) => {
        const isChecked = selectedRows.includes(rowData.compliance_id)
        return (
            <Checkbox
                checked = {isChecked}
                onChange = {(e) => handleSelectRow(e, rowData.compliance_id)}
            />
        )
    }

    const handleSelectRow = (event, id) => {
        const selectedIndex = selectedRows.indexOf(id)
        let newSelectedRows = []

        if (selectedIndex === -1) {
            newSelectedRows = newSelectedRows.concat(selectedRows, id);
        } 
        else if (selectedIndex > 0) {
            newSelectedRows = newSelectedRows.concat(
                selectedRows.slice(0, selectedIndex),
                selectedRows.slice(selectedIndex + 1)
            )
        }

        const complianceData = Array.isArray(getCompliancesForInitialLov) ? getCompliancesForInitialLov : []
        const deleteId = getCompliancesForInitialLov?.filter((v) => !newSelectedRows.includes(v.compliance_id))
        const addType = complianceData?.filter((v) => newSelectedRows.includes(v.compliance_id))
        const ids = deleteId?.map((v) => v.compliance_id)
        const names = addType?.map((v) => v.compliance_name)
        handleCompliances(newSelectedRows, ids)
        setSelectedRows(newSelectedRows)
        setSelectAll(newSelectedRows.length === complianceData?.length)
    };

    const columns = [
        {
            field : 'compliance_name',
            title : 'Name',
            width : '90%',
            render : (rowData) => {
                if (rowData.id === 'new') {
                    return (
                        <div style={{ display : 'flex', alignItems : 'center', width : '100%' }}>
                            <TextField
                                fullWidth
                                label = 'Type'
                                variant = 'outlined'
                                value = {values.compliance_name}
                                onChange = {(e) =>handleChange(e.target.value, 'compliance_name')}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSubmit(e)
                                    }
                                }}
                            />
                        </div>
                    )
                }
                return rowData.compliance_name
            }
        },
        {
            title : 'Action',
            render : (rowData) => (
                <Grid container justifyContent='flex-end'>
                    {
                        rowData.createdBy !== null && rowData.createdBy !== 0 && rowData.id !== 'new' ? (
                            <>
                                <Tooltip
                                    title='Delete'
                                    TransitionComponent={Fade}
                                    TransitionProps={{timeout: 600}}
                                    placement='top'
                                >
                                    <IconButton onClick = {() => handleDeleteOpen(rowData)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </>
                        ) : null
                    }
                </Grid>
            )
        },
        {
            field : 'select',
            width : '5%',
            title : (
                <Checkbox
                    checked = {selectAll}
                    onChange = {handleSelectAllClick}
                    inputProps = {{ 'aria-label': 'select all groups' }}
                />
            ),
            render : (rowData) => {
                if (rowData.id !== 'new') {
                    return renderCheckbox(rowData)
                }
                return (
                    <IconButton onClick={handleSubmit} disabled={!values.compliance_name}>
                        <AddIcon />
                    </IconButton>
                )
            }
        }
    ]

    return (
        <>
            <MaterialTable
                title = 'Compliances'
                data = {[
                    { id: 'new', Type: 'New Type' },
                    ...(Array.isArray(getCompliancesForInitialLov) ? getCompliancesForInitialLov : []),
                ]}
                columns = {columns}
                options = {{
                    filtering : false,
                    actionsColumnIndex : -1,
                    paging : false,
                    search : false,
                    maxBodyHeight : 'calc(100vh - 230px)',
                    minBodyHeight : 'calc(100vh - 230px)',
                    overflowX : 'hidden'
                }}
                components = {{
                    Toolbar : (props) => {
                        return (
                            <div>
                                <div style={{ display: 'flex', justifyContent : 'space-between', alignItems : 'center', padding : '8px 16px' }}>
                                    <Typography variant='h6' component='div'>
                                        {props.title}
                                    </Typography>
                                </div>
                            </div>
                        )
                    }
                }}
            />

            <Dialog open = {open === true}>
                <DialogContent style={{ width : 500 }}>
                    <DialogContentText>
                        Are you sure you want to delete ?
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button
                        variant = 'contained'
                        color = 'error'
                        onClick = {() => setOpen(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant = 'contained'
                        color = 'primary'
                        onClick = {handleDelete}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default LovCompliances;

