import MaterialTable from "utils/SafeMaterialTable";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import CommonSearch from "utils/commonSearch";
import { useDispatch, useSelector } from "react-redux";
import { useContext, useEffect, useState } from "react";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import { deletePaymentTermsAction, getPaymentTermsAction, getPaymentTermsSearchAction, setPaymentTermsSearchAction } from "redux/actions/termsConditions_actions";
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentTermsForm from "./PaymentTermsForm";
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize';

const PaymentTerms = () => {

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
        TermsConditionsReducers : { getPaymentTerms }
    } = useSelector((state) => state)
    
    useEffect(() => {
        dispatch(getPaymentTermsAction({ searchString : searchString }))
    }, [])

    const handleOpen = () => {
        setShowForm(true)
    }

    const handleClose = () => {
        setDialogOpen(false)
        setShowForm(false)
        dispatch(getPaymentTermsAction({ searchString : searchString }))
    }

    const handleDeleteOpen = (rowData) => {
        setRowData(rowData)
        setDialogOpen(true)
    }

    const handleDelete = async () => {
        setDialogOpen(false)
        await dispatch(deletePaymentTermsAction(rowData.id))
        dispatch(getPaymentTermsAction({ searchString : searchString }))
    }

    const cancelSearch = () => {
        setSearchString('')
        dispatch(setPaymentTermsSearchAction([]))
        dispatch(getPaymentTermsAction({ searchString : '' },
            setModalTypeHandler,
            setLoaderStatusHandler
        ))
    }

    const requestSearch = (e) => {
        const val = e.target.value
        setSearchString(val)
        dispatch(setPaymentTermsSearchAction([]))
        dispatch(getPaymentTermsSearchAction({ searchString : val },
            setModalTypeHandler,
            setLoaderStatusHandler
        ))
    }

    const columns = [
        {
            field : 'name',
            title : 'Terms',
            render : (rowData) => (
                <div>
                    {
                       
                        Array.isArray(rowData.payment_terms) ? (
                            rowData.payment_terms.map((term) => (
                                <div>{term}</div>
                            ))
                        ) : (
                            <div>
                                {rowData.payment_terms}
                            </div>
                        )
                    }
                </div>
            )
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
                title = 'Payment Terms'
                data = {getPaymentTerms}
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
                <PaymentTermsForm handleClose = {handleClose} />
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


export default PaymentTerms
