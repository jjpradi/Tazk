import MaterialTable from "utils/SafeMaterialTable";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, Typography } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { useContext, useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import CommonSearch from "utils/commonSearch";
import { useDispatch, useSelector } from "react-redux";
import { deleteComplianceAction, getComplianceLovAction, getCompliancesLOVAction, setCompliancesLOVAction } from "redux/actions/compliances_actions";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import NewCompliance from "components/NewCompliance";
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize';


function Compliances(){

    const dispatch = useDispatch()
    const {
        compliancesReducers: {compliancesLov}
    } = useSelector(state => state)
    const {setModalTypeHandler, setLoaderStatusHandler} = useContext(CreateNewButtonContext)

    const [rowData, setRowData] = useState([])
    const [dialogConfirmation, setDialogConfirmation] = useState(false)
    const [addFormOpen, setAddFormOpen] = useState(false)
    const [searchString, setSearchString] = useState('')

    useEffect(() => {
        dispatch(getComplianceLovAction({searchString: searchString}))
    }, [])

    const requestSearch = (event) => {
        const val = event.target.value
        setSearchString(val)

        dispatch(setCompliancesLOVAction([]))

        dispatch(getCompliancesLOVAction({searchString: val}, setModalTypeHandler, setLoaderStatusHandler))
    }

    const cancelSearch = () => {
        setSearchString('')

        dispatch(setCompliancesLOVAction([]))

        dispatch(getCompliancesLOVAction({searchString: ''}, setModalTypeHandler, setLoaderStatusHandler))
    }

    const handleClose = () => {
        setDialogConfirmation(false)
        setAddFormOpen(false)
    }

    const handleDelete = () => {
        dispatch(deleteComplianceAction(rowData.compliance_id))
        setDialogConfirmation(false)
    }

    const columns = [
        {
            field: 'compliance_name',
            title: 'Name'
        },
        {
            field: 'action',
            title: 'Action',
            render: (rowData) => {
             const  isDisable = rowData.tableData.index < 5
              return  <IconButton  disabled ={isDisable}
              onClick={() => {   
                    setRowData(rowData)
                    setDialogConfirmation(true)
                }}>
                    <DeleteIcon />
                </IconButton>
            }
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
                title = 'Compliances'
                data = {compliancesLov}
                columns = {columns}
                options={{
                    headerStyle,
                    cellStyle,
                    filtering:false,
                    actionsColumnIndex : -1,
                    paging : false,
                    search : false,
                    maxBodyHeight,
                    minBodyHeight: maxBodyHeight,
                    overflowX: 'hidden'
                }}
                components={{
                    Toolbar: (props) => {
                        return(
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
                                    <Typography variant='h6' component='div'>
                                        {props.title}
                                    </Typography>

                                    <IconButton onClick={() => setAddFormOpen(true)}>
                                        <AddIcon />
                                    </IconButton>
                                </div>

                                <div style={{ padding: '8px 16px' }}>
                                    <CommonSearch
                                        searchVal={searchString}
                                        cancelSearch={cancelSearch}
                                        requestSearch={requestSearch}
                                    />
                                </div>
                            </div>
                        )
                    }
                }}
            />

            <Dialog open={dialogConfirmation}>
                <DialogContent>
                    <DialogContentText>Are you sure want to delete ?</DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button variant='contained' color='error' onClick={() => handleClose()}>Cancel</Button>
                    <Button variant='contained' onClick={() => handleDelete()}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={addFormOpen}>
                <NewCompliance closeDialog={handleClose} />
            </Dialog>
        </>
    )
}

export default Compliances
