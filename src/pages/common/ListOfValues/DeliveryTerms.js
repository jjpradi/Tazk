import MaterialTable from "utils/SafeMaterialTable";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import CommonSearch from "utils/commonSearch";
import { useDispatch, useSelector } from "react-redux";
import { useContext, useEffect, useState } from "react";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import { deleteDeliveryTermsAction, getDeliveryTermsAction, getDeliveryTermsSearchAction, setDeliveryTermsSearchAction } from "redux/actions/termsConditions_actions";
import DeleteIcon from '@mui/icons-material/Delete';
import DeliveryTermsForm from './DeliveryTermsForm'
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize'

const DeliveryTerms = () => {

    const dispatch = useDispatch()
    
    const {
        setModalTypeHandler,
        setLoaderStatusHandler
    } = useContext(CreateNewButtonContext)

    const [showForm, setShowForm] = useState(false)
    const [rowData, setRowData] = useState([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [searchString, setSearchString] = useState('')

    const {
        TermsConditionsReducers : { getDeliveryTerms }
    } = useSelector((state) => state)
    
    useEffect(() => {
        dispatch(getDeliveryTermsAction({ searchString : searchString }))
    }, [])

    const handleOpen = () => {
        setShowForm(true)
    }

    const handleClose = () => {
        setDialogOpen(false)
        setShowForm(false)
        dispatch(getDeliveryTermsAction({ searchString : searchString }))
    }

    const handleDeleteOpen = (rowData) => {
        setRowData(rowData)
        setDialogOpen(true)
    }

    const handleDelete = async () => {
        setDialogOpen(false)
        await dispatch(deleteDeliveryTermsAction(rowData.id))
        dispatch(getDeliveryTermsAction({ searchString : searchString }))
    }

    const cancelSearch = () => {
        setSearchString('')
        dispatch(setDeliveryTermsSearchAction([]))
        dispatch(getDeliveryTermsAction({ searchString : '' },
            setModalTypeHandler,
            setLoaderStatusHandler
        ))
    }

    const requestSearch = (e) => {
        const val = e.target.value
        setSearchString(val)
        dispatch(setDeliveryTermsSearchAction([]))
        dispatch(getDeliveryTermsSearchAction({ searchString : val },
            setModalTypeHandler,
            setLoaderStatusHandler
        ))
    }

    const columns = [
        {
            field : 'delivery_terms',
            title : 'Terms',
        },
        {
            title : 'Action',
            render : (rowData) => (
                <IconButton onClick={() => handleDeleteOpen(rowData)}>
                    <DeleteIcon />
                </IconButton>
            )
        }
    ]

    return(
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
                columns = {columns}
                title = 'Delivery Terms'
                data = {getDeliveryTerms}
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
                <DeliveryTermsForm handleClose = {handleClose} />
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


export default DeliveryTerms
