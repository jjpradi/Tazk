import React, { useEffect, useState } from 'react'
import MaterialTable from 'utils/SafeMaterialTable'
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, Fade, Grid, IconButton, TextField, Tooltip, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { createRenewalsLovAction, DeleteRenewalsInitialLovAction, GetRenewalsInitialLovAction } from 'redux/actions/renewals_actions'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import PropTypes from 'prop-types'

const lovRenewals = (props) => {

    const dispatch = useDispatch()

    const [selectedAll, setSelectedAll] = useState(false)
    const [data, setData] = useState([])
    const [selectedRows, setSelectedRows] = useState([])
    const [rowData, setRowData] = useState([])
    const [dialogOpen, setDialogOpen] = useState(false)

    const [values, setValues] = useState({
        renewalsName : ''
    })

    const {
        RenewalsReducers : { initialRenewalsLov }
    } = useSelector((state) => state)

    useEffect(() => {
        dispatch(GetRenewalsInitialLovAction((response) => {
            if(response?.length > 0) {
                setData(response)
            }
        }))
    }, [])

    useEffect(() => {
        let filter = data.filter(id => id.isDeleted == 0)
        setSelectedRows(filter?.map(d => d.type_id))
    }, [data])

    const handleSelectRows = (event, id) => {
        const selectedIndex = selectedRows.indexOf(id)
        let newSelectedRows = []

        if(selectedIndex === -1) {
            newSelectedRows = newSelectedRows.concat(selectedRows, id)
        }
        else if(selectedIndex > 0) {
            newSelectedRows = newSelectedRows.concat(
                selectedRows.slice(0, selectedIndex),
                selectedRows.slice(selectedIndex + 1)
            )
        }

        const renewalsData = Array.isArray(initialRenewalsLov) ? initialRenewalsLov : []
        const deleteId = initialRenewalsLov.filter((d) => !newSelectedRows.includes(d.type_id))
        const addTypes = renewalsData?.filter((d) => newSelectedRows.includes(d.type_id))
        const ids = deleteId?.map((d) => d.type_id)
        const types = addTypes?.map((d) => d.renewal_types)
        props.handleRenewals(newSelectedRows, ids)
        setSelectedRows(newSelectedRows)
        setSelectedAll(newSelectedRows.length === renewalsData?.length)
    }

    const handleChange = (name, value) => {
        setValues({...values, [name] : value})
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        await dispatch(createRenewalsLovAction({ type : values.renewalsName }))
        dispatch(GetRenewalsInitialLovAction((response) => {
            if(response.length > 0) {
                setData(response)
            }
        }))
        setValues({ renewalsName : '' })
    }

    const renderCheckBox = (rowData) => {
        const isChecked = selectedRows.includes(rowData.type_id)
        return (
            <Checkbox 
                checked = {isChecked}
                onChange = {(e) => handleSelectRows(e, rowData.type_id)}
            />
        )
    }

    const handleDeleteDialogOpen = (rowData) => {
        setRowData(rowData)
        setDialogOpen(true)
    }

    const handleDialogClose = () => {
        setDialogOpen(false)
    }

    const handleDelete = async () => {
        setDialogOpen(false)
        await dispatch(DeleteRenewalsInitialLovAction(rowData.type_id))
        dispatch(GetRenewalsInitialLovAction((response) => {
            if(response.length > 0) {
                setData(response)
            }
        }))
    }

    const handleSelectAll = () => {
        if(!selectedAll) {
            const allIds = initialRenewalsLov.map((row) => row.type_id)
            setSelectedRows(allIds)
            props.handleRenewals(initialRenewalsLov.map((row) => row.renewal_types), [])
        }
        else {
            setSelectedRows([])
            props.handleRenewals([], initialRenewalsLov.map((row) => row.type_id))
        }
        setSelectedAll(!selectedAll)
    }

    const columnsRenewals = [
        {
            field : 'renewal_types',
            title : 'Name',
            width : '90%',
            render : (rowData) => {
                if(rowData.id === 'new') {
                    return (
                        <div style={{ display : 'flex', alignItems : 'center', width : '100%' }}>
                            <TextField 
                                fullWidth
                                label = 'Renewals'
                                variant = 'outlined'
                                value = {values.renewalsName}
                                onChange = {(e) => handleChange('renewalsName', e.target.value)}
                                onKeyPress = {(e) => {
                                    if(e.key === 'Enter') {
                                        handleSubmit(e)
                                    }
                                }}
                            />
                        </div>
                    )
                }
                return rowData.renewal_types
            }
        },
        {
            title : 'Action',
            width : '5%',
            render : (rowData) => (
                <Grid container justifyContent='flex-end'>
                    {
                        rowData.createdBy !== null && rowData.createdBy !== 0 && rowData.id !== 'new' ? (
                            <>
                                <Tooltip
                                    title = 'Delete'
                                    TransitionComponent = {Fade}
                                    TransitionProps = {{ timeout : 600 }}
                                    placement = 'top'
                                >
                                    <IconButton onClick = {() => handleDeleteDialogOpen(rowData)}>
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
                    checked = {selectedAll}
                    onChange = {handleSelectAll}
                    inputProps = {{ 'aria-label' : 'select all renewals' }}
                />
            ),
            render : (rowData) => {
                if(rowData.id !== 'new') {
                    return renderCheckBox(rowData)
                }
                return (
                    <IconButton onClick={handleSubmit} disabled={!values.renewalsName}>
                        <AddIcon />
                    </IconButton>
                )
            }
        }
    ]

  return (
    <>
        <MaterialTable
            title = 'Renewals'
            columns = {columnsRenewals}
            data = {[
                { id : 'new', Renewals : 'New Renewals' },
                ...(Array.isArray(initialRenewalsLov) ? initialRenewalsLov : [])
            ]}
            options = {{
                filtering : false,
                actionsColumnIndex : -1,
                paging : false,
                search : false,
                maxBodyHeight : 'calc(100vh - 230px)',
                minBodyHeight : 'calc(100vh - 230px)'
            }}
            components = {{
                Toolbar : (props) => (
                    <div>
                        <div style={{ display : 'flex', justifyContent : 'space-between', alignItems : 'center', padding : '8px 16px' }}>
                            <Typography variant='h6' component='div'>
                                {props.title}
                            </Typography>
                        </div>
                    </div>
                )
            }}
        />

        <Dialog open = {dialogOpen}>
            <DialogContent style={{ width : 500 }}>
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
                        color = 'primary'
                        onClick = {handleDelete}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    </>
  )
}

lovRenewals.propTypes = {
    handleRenewals : PropTypes.func
}

export default lovRenewals
