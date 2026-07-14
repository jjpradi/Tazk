import React, { useContext, useEffect, useState } from 'react'
import MaterialTable from 'utils/SafeMaterialTable'
import { useDispatch, useSelector } from 'react-redux'
import { DeleteUnitsLovAction, getSearchUnitsLovAction, GetUnitsLovAction, setSearchUnitsLovAction } from 'redux/actions/termsConditions_actions'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import CommonSearch from 'utils/commonSearch'
import ProductUnitsForm from './ProductUnitsForm'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize'

const ProductUnits = () => {

    const dispatch = useDispatch()

    const [formOpen, setFormOpen] = useState(false)
    const [searchString, setSearchString] = useState('')
    const [rowData, setRowData] = useState([])
    const [dialogOpen, setDialogOpen] = useState(false)

    const {
        setModalTypeHandler,
        setLoaderStatusHandler
    } = useContext(CreateNewButtonContext)

    const {
        TermsConditionsReducers : { getUnitsLov }
    } = useSelector((state) => state)

    useEffect(() => {
        dispatch(GetUnitsLovAction({ searchString : searchString }))
    }, [])

    const handleFormOpen = () => {
        setFormOpen(true)
    }

    const handleDialogClose = () => {
        setDialogOpen(false)
        setFormOpen(false)
        dispatch(GetUnitsLovAction({ searchString : searchString }))
    }

    const cancelSearch = () => {
        setSearchString('')
        dispatch(setSearchUnitsLovAction([]))
        dispatch(GetUnitsLovAction({ searchString : '' },
            setModalTypeHandler,
            setLoaderStatusHandler
        ))
    }

    const requestSearch = (e) => {
        const val = e.target.value
        setSearchString(val)
        dispatch(setSearchUnitsLovAction([]))
        dispatch(getSearchUnitsLovAction({ searchString : val },
            setModalTypeHandler,
            setLoaderStatusHandler
        ))
    }

    const handleDeleteDialogOpen = (rowData) => {
        setRowData(rowData)
        setDialogOpen(true)
    }

    const handleDelete = async() => {
        setDialogOpen(false)
        await dispatch(DeleteUnitsLovAction(rowData.id))
        dispatch(GetUnitsLovAction({ searchString : searchString }))
    }

    const columnsUnitsLov = [
        {
            field : 'unit',
            title : 'Unit'
        },
        {
            field : 'unit_code',
            title : 'Description',
        },
        {
            field : 'action',
            title : 'Action',
            render : (rowData) => (
                <IconButton onClick={() => handleDeleteDialogOpen(rowData)}>
                    <DeleteIcon />
                </IconButton>
            )
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
            title = 'Units & Code'
            columns = {columnsUnitsLov}
            data = {getUnitsLov}
            options = {{
                headerStyle,
                cellStyle,
                filtering : false,
                actionsColumnIndex : -1,
                paging : false,
                search : false,
                overflowX : 'hidden',
                maxBodyHeight,
                minBodyHeight : maxBodyHeight
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

        <Dialog open = {formOpen}>
            <ProductUnitsForm handleDialogClose = {handleDialogClose} />
        </Dialog>

        <Dialog open = {dialogOpen}>
            <DialogContent style={{ width : 500 }}>
                <DialogContentText>
                    Are you sure wantn to delete ?
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
    </>
  )
}

export default ProductUnits
