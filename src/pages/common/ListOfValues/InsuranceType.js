import React, { useContext, useEffect, useState } from 'react'
import MaterialTable from 'utils/SafeMaterialTable'
import { useDispatch, useSelector } from 'react-redux'
import { deleteRenewalsLovAction } from 'redux/actions/renewals_actions'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CommonSearch from 'utils/commonSearch'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import ServiceTypeForm from './ServiceTypeForm'
import { getSearchserviceTypeLovAction, GetServiceTypeAction, setSearchServiceTypeLovAction } from 'redux/actions/serviceDue_actions'
import { deleteInsuranceLovAction, getInsuranceLovAction, getSearchInsuranLovceAction, setSearchInsuranceLovAction } from '../../../redux/actions/insurance_actions'
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize'

const InsuranceType = () => {

    const dispatch = useDispatch()

    const [formOpen, setFormOpen] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [rowData, setRowData] = useState([])
    const [searchString, setSearchString] = useState('')

    const {
        InsuranceReducers : { getInsuranceLov }
    } = useSelector((state) => state)
console.log(getInsuranceLov , "fdeferer");

    const {
        setModalTypeHandler,
        setLoaderStatusHandler
    } = useContext(CreateNewButtonContext)

    useEffect(() => {
        dispatch(getInsuranceLovAction({ searchString :  searchString}))
    }, [])

    const handleDeleteDialogOpen = (rowData) => {
         console.log(rowData , "dsfsdfsd")
        setRowData(rowData)
        setDialogOpen(true)
    }

    const handleDialogClose = () => {
        setDialogOpen(false)
        setFormOpen(false)
        dispatch(getInsuranceLovAction({ searchString :  searchString}))
    }

    const handleDelete = async() => {
        console.log("rowData.insurance_types, rowData.type_id",rowData)
        setDialogOpen(false)
        await dispatch(deleteInsuranceLovAction(rowData.insurance_type, rowData.id))
        dispatch(getInsuranceLovAction({ searchString : searchString }))
    }

    const handleFormOpen = () => {
        setFormOpen(true)
    }

    const cancelSearch = () => {
        setSearchString('')
        dispatch(setSearchInsuranceLovAction([]))
        dispatch(getInsuranceLovAction({ searchString : '' }, setModalTypeHandler, setLoaderStatusHandler))
    }

    const requestSearch = (e) => {
        const val = e.target.value
        setSearchString(val)
        dispatch(setSearchInsuranceLovAction([]))
        dispatch(getSearchInsuranLovceAction({ searchString : val }, setModalTypeHandler, setLoaderStatusHandler))
    }

    const columnServiceTypeLOV = [
        {
            field : 'insurance_type',
            title : 'Name' 
        },
        {
            field: 'action',
            title: 'Action',
            render: (rowData) => {
                  const isDisabled = rowData.tableData.index < 6;
                return (
                    <IconButton 
                    disabled={isDisabled}
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
            title = 'Insurance Type'
            columns = {columnServiceTypeLOV}
            data = {getInsuranceLov}
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

                                <IconButton  onClick={handleFormOpen}>
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
            <ServiceTypeForm closeDialog = {handleDialogClose} />
        </Dialog>
    </>
  )
}

export default InsuranceType
