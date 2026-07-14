import React, { useContext, useEffect, useState } from 'react'
import MaterialTable from 'utils/SafeMaterialTable'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CommonSearch from 'utils/commonSearch'
import TermsConditionForm from './TermsConditionForm'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit';
import { useDispatch, useSelector } from 'react-redux'
import { DeleteTermsConditionsAction, getSearchTermsConditionsAction, ListTermsAndConditionsAction, setSearchTermsConditionsAction } from 'redux/actions/termsConditions_actions'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize'

const TermsAndCondition = () => {

    const dispatch = useDispatch()

    const {
        setModalTypeHandler,
        setLoaderStatusHandler
    } = useContext(CreateNewButtonContext)

    const [showForm, setShowForm] = useState(false)
    const [rowData, setRowData] = useState([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [searchString, setSearchString] = useState('')
    const [isEditMode, setIsEditMode] = useState(false)

    const {
        TermsConditionsReducers : { termsAndConditionsList }
    } = useSelector((state) => state)

    useEffect(() => {
        dispatch(ListTermsAndConditionsAction({ searchString : searchString }))
    }, [])

    const handleOpen = () => {
        setShowForm(true)
        setIsEditMode(false);
        setRowData(null)
    }

    const handleClose = () => {
        setDialogOpen(false)
        setShowForm(false)
        dispatch(ListTermsAndConditionsAction({ searchString : searchString }))
    }

    const handleDeleteOpen = (rowData) => {
        setRowData(rowData)
        setDialogOpen(true)
    }
    const handleEditOpen = (rowData) => {
        setRowData(rowData)
        setIsEditMode(true)
        setShowForm(true)
    }

    const handleDelete = async () => {
        setDialogOpen(false)
        console.log("rowData",rowData)
        await dispatch(DeleteTermsConditionsAction(rowData.terms_id,rowData.invoice_types))
        dispatch(ListTermsAndConditionsAction({ searchString : searchString }))
    }

    const cancelSearch = () => {
        setSearchString('')
        dispatch(setSearchTermsConditionsAction([]))
        dispatch(ListTermsAndConditionsAction({ searchString : '' },
            setModalTypeHandler,
            setLoaderStatusHandler
        ))
    }

    const requestSearch = (e) => {
        const val = e.target.value
        setSearchString(val)
        dispatch(setSearchTermsConditionsAction([]))
        dispatch(getSearchTermsConditionsAction({ searchString : val },
            setModalTypeHandler,
            setLoaderStatusHandler
        ))
    }

    const termsColumns = [
        {
            field : 'invoice_types',
            title : 'Invoice Type',
        },
        {
            field : 'terms_conditions',
            title : 'Terms & Conditions',
            render : (rowData) => (
                <div>
                    {
                        Array.isArray(rowData.terms_conditions) ? (
                            rowData.terms_conditions.map((term) => (
                                <div>{term}</div>
                            ))
                        ) : (
                            <div>
                                {rowData.terms_conditions}
                            </div>
                        )
                    }
                </div>
            )
        },
        {
            title : 'Action',
            render : (rowData) => (
                <>
                <IconButton onClick={() => handleDeleteOpen(rowData)}>
                    <DeleteIcon />
                </IconButton>
                <IconButton onClick={() => handleEditOpen(rowData)}>
                    <EditIcon />
                </IconButton>
                </>
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
            columns = {termsColumns}
            title = 'Terms & Conditions'
            data = {termsAndConditionsList}
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
                Toolbar : (props) => (
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

                            <IconButton onClick={handleOpen}>
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
            }}
        />

        <Dialog open = {showForm}>
            <TermsConditionForm handleClose = {handleClose} key={isEditMode ? `edit-${rowData?.id}` : 'create'} editData={isEditMode ? rowData : null}/>
        </Dialog>

        <Dialog open = {dialogOpen}>
            <DialogContent style={{ width : 500 }}>
                <DialogContentText>
                    Are you sure you want to delete ?
                </DialogContentText>

                <DialogActions>
                    <Button 
                        variant = 'contained' 
                        color = 'error'
                        onClick = {handleClose}
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

export default TermsAndCondition
