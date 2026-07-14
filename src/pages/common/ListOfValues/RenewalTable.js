import React, { useContext, useEffect, useState } from 'react'
import MaterialTable from 'utils/SafeMaterialTable'
import { useDispatch, useSelector } from 'react-redux'
import { deleteRenewalsLovAction, getRenewalsLovAction, getSearchRenewalsLovAction, setSearchRenewalsLovAction } from 'redux/actions/renewals_actions'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CommonSearch from 'utils/commonSearch'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import RenewalForm from './RenewalForm'
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize'

const RenewalTable = () => {

    const dispatch = useDispatch()

    const [formOpen, setFormOpen] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [rowData, setRowData] = useState([])
    const [searchString, setSearchString] = useState('')

    const {
        RenewalsReducers : { getRenewalsLov }
    } = useSelector((state) => state)

    const {
        setModalTypeHandler,
        setLoaderStatusHandler
    } = useContext(CreateNewButtonContext)

    useEffect(() => {
        dispatch(getRenewalsLovAction({ searchString :  searchString}))
    }, [])

    const handleDeleteDialogOpen = (rowData) => {
        setRowData(rowData)
        setDialogOpen(true)
    }

    const handleDialogClose = () => {
        setDialogOpen(false)
        setFormOpen(false)
        dispatch(getRenewalsLovAction({ searchString :  searchString}))
    }

    const handleDelete = async() => {
        setDialogOpen(false)
        await dispatch(deleteRenewalsLovAction(rowData.renewal_types, rowData.type_id))
        dispatch(getRenewalsLovAction({ searchString : searchString }))
    }

    const handleFormOpen = () => {
        setFormOpen(true)
    }

    const cancelSearch = () => {
        setSearchString('')
        dispatch(setSearchRenewalsLovAction([]))
        dispatch(getRenewalsLovAction({ searchString : '' }, setModalTypeHandler, setLoaderStatusHandler))
    }

    const requestSearch = (e) => {
        const val = e.target.value
        setSearchString(val)
        dispatch(setSearchRenewalsLovAction([]))
        dispatch(getSearchRenewalsLovAction({ searchString : val }, setModalTypeHandler, setLoaderStatusHandler))
    }

    const columnRenewalsLOV = [
        {
            field : 'renewal_types',
            title : 'Name' 
        },
        {
            field : 'action',
            title : 'Action',
            render : (rowData) => {
             const isDisable = rowData.tableData.index < 3
                return (
                    <IconButton 
                    disabled={isDisable}
                    onClick={() => handleDeleteDialogOpen(rowData)}>
                        <DeleteIcon />
                    </IconButton>
                )
            }
        }
    ]

  return (
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
            title = 'Renewals'
            columns = {columnRenewalsLOV}
            data = {getRenewalsLov}
            options = {{
                headerStyle,
                cellStyle,
                filtering : false,
                actionsColumnIndex : -1,
                paging : false,
                search : false,
                maxBodyHeight,
                minBodyHeight : maxBodyHeight,
                overflowX : 'hidden'
            }}
            components = {{
                Toolbar : (props) => {
                    return (
                        <div>
                            <div 
                                style = {{
                                    display : 'flex',
                                    justifyContent : 'space-between',
                                    alignItems : 'center',
                                    padding : '8px 16px'
                                }}
                            >
                                <Typography variant='h6' component='div'>
                                    {props.title}
                                </Typography>

                                <IconButton onClick={handleFormOpen}>
                                    <AddIcon />
                                </IconButton>
                            </div>

                            <div style={{ padding : '8px 16px' }}>
                                <CommonSearch 
                                    searchVal = {searchString}
                                    cancelSearch = {cancelSearch}
                                    requestSearch = {requestSearch}
                                />
                            </div>
                        </div>
                    )
                }
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
                        color = 'error'
                        onClick = {handleDelete}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </DialogContent>
        </Dialog>

        <Dialog open = {formOpen}>
            <RenewalForm closeDialog = {handleDialogClose} />
        </Dialog>
    </>
  )
}

export default RenewalTable
