import MaterialTable from "utils/SafeMaterialTable";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import CommonSearch from "utils/commonSearch";
import { useDispatch, useSelector } from "react-redux";
import { useContext, useEffect, useState } from "react";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import { deleteCreditDaysLovAction, getCreditDaysLovAction, getCreditDaysLovSearchAction, setCreditDaysLovSearchAction } from "redux/actions/termsConditions_actions";
import DeleteIcon from '@mui/icons-material/Delete';
import CreditDaysForm from "./CreditDaysForm";
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize';

function CreditDays(){

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
        TermsConditionsReducers : { creditDaysLov }
    } = useSelector((state) => state)
    
    useEffect(() => {
        dispatch(getCreditDaysLovAction({ searchString : searchString }))
    }, [])

    const handleOpen = () => {
        setShowForm(true)
    }

    const handleClose = () => {
        setDialogOpen(false)
        setShowForm(false)
        dispatch(getCreditDaysLovAction({ searchString : searchString }))
    }

    const handleDeleteOpen = (rowData) => {
        setRowData(rowData)
        setDialogOpen(true)
    }

    const handleDelete = async () => {
        setDialogOpen(false)
        await dispatch(deleteCreditDaysLovAction(rowData.id))
        dispatch(getCreditDaysLovAction({ searchString : searchString }))
    }

    const cancelSearch = () => {
        setSearchString('')
        dispatch(setCreditDaysLovSearchAction([]))
        dispatch(getCreditDaysLovAction({ searchString : '' },
            setModalTypeHandler,
            setLoaderStatusHandler
        ))
    }

    const requestSearch = (e) => {
        const val = e.target.value
        setSearchString(val)
        dispatch(setCreditDaysLovSearchAction([]))
        dispatch(getCreditDaysLovSearchAction({ searchString : val },
            setModalTypeHandler,
            setLoaderStatusHandler
        ))
    }

    const columns = [
        {
            field: 'credit_days_value',
            title: 'Days',
            render: (rowData) => {
                if(rowData.credit_days_value === 5){
                    let now = new Date();
                    let todayDate = new Date().getDate() - 1;
                    let numOfDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
                    let remainingDays = numOfDaysInMonth - todayDate
                    return remainingDays;
                }
                else if(rowData.credit_days_value === 6){
                    let now = new Date();
                    let todayDate = new Date().getDate() - 1;
                    let numOfDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
                    let nextMonthTotalDays = new Date(now.getFullYear(), now.getMonth() + 2, 0).getDate()
                    let remainingDays = nextMonthTotalDays + numOfDaysInMonth - todayDate
                    return remainingDays;
                }
                else{
                    return rowData.credit_days_value
                }
            }
        },
        {
            field : 'credit_days_name',
            title : 'Name',
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
                title = 'Credit Days'
                data = {creditDaysLov}
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
                <CreditDaysForm handleClose = {handleClose} />
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

export default CreditDays
