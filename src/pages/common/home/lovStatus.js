import MaterialTable from "utils/SafeMaterialTable";
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, Fade, Grid, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNewStatus, deleteInitialLeadStatusAction, deleteLeadStatus, getInitialStatusAction, getLeadManagementStatusAction, getSearchStatusAction, setSearchStatusAction } from "redux/actions/leadManagement_actions";
import AddIcon from '@mui/icons-material/Add';
import CommonSearch from "utils/commonSearch";
import DeleteIcon from '@mui/icons-material/Delete';
import NewSource from "pages/crm/leadManagement/NewSource";
import CreateNewButtonContext from "context/CreateNewButtonContext";

function LovStatus({handleStatus}){

    const dispatch = useDispatch()
    const {
        leadManagementReducers: {leadManagementStatus, leadInitialStatus}
    } = useSelector(state => state)
    console.log(leadManagementStatus, leadInitialStatus,'leadManagementStatus')
    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext)

    const [rowData, setRowData] = useState([])
    const [confimationDialogOpen, setConfirmationDialogOpen] = useState(false)
    const [addFormOpen, setAddFormOpen] = useState(false)
    const [searchString, setSearchString] = useState('')
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [values, setValues] = useState({ statusName: '' });
    const [initialVal, setInitialVal] = useState([]);

    useEffect(() => {
        // dispatch(getInitialStatusAction())
        dispatch(getInitialStatusAction((response) => {
            if (response?.length > 0) {
              setInitialVal(response)
            }
          }));
    }, [])
    
    useEffect(() => {
        let filter = initialVal.filter(status_id => status_id.isDeleted == 0);
        console.log(filter, initialVal, values, 'filllterrr')
        setSelectedRows(filter?.map(v => v.status_id))
      }, [initialVal])

    const handleClose = () => {
        setConfirmationDialogOpen(false)
        setAddFormOpen(false)
        setSearchString('')
    }

    const handleDelete = async() => {
        await dispatch(deleteInitialLeadStatusAction(rowData.status_id))
        handleClose()
        await dispatch(getInitialStatusAction())
    }

    const requestSearch = (event) => {
        const val = event.target.value
        setSearchString(val)

        let payload = {
            searchString: val
        }
        dispatch(setSearchStatusAction([]))
        dispatch(getSearchStatusAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    }

    
  const handleSelectRow = (event, status_id) => {
    const selectedIndex = selectedRows.indexOf(status_id);
    let newSelectedRows = [];

    if (selectedIndex === -1) {
      newSelectedRows = newSelectedRows.concat(selectedRows, status_id);
    } else if (selectedIndex > 0) {
      newSelectedRows = newSelectedRows.concat(selectedRows.slice(0, selectedIndex), selectedRows.slice(selectedIndex + 1));
    }
    const deleteId = leadInitialStatus?.filter((v) => !newSelectedRows.includes(v.status_id));
    const addStatus = leadInitialStatus?.filter((v) => newSelectedRows.includes(v.status_id));
    const ids = deleteId?.map((v) => v.status_id);
    const names = addStatus?.map((v) => v.status_name);
    handleStatus(newSelectedRows, ids);
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === leadInitialStatus?.length);
    console.log(leadInitialStatus?.filter((v) => newSelectedRows.includes(v.status_id)), leadInitialStatus, leadInitialStatus, leadInitialStatus?.filter((v) => !newSelectedRows.includes(v.status_id)), 'addcattttt');
    console.log(status_id, selectedRows, newSelectedRows, deleteId, addStatus, ids, names, 'addcattttt1')
  };

    const renderCheckbox = (rowData) => {
        const isChecked = selectedRows.includes(rowData.status_id);
        return <Checkbox checked={isChecked} onChange={(e) => handleSelectRow(e, rowData.status_id)} />;
      };
    
  const handleSelectAllClick = () => {
    if (!selectAll) {
      const allIds = leadInitialStatus.map((row) => row.status_id);
      setSelectedRows(allIds);
      handleStatus(leadInitialStatus.map((row) => row.status_name), [])
    } else {
      setSelectedRows([]);
      handleStatus([], leadInitialStatus.map((row) => row.status_id));
    }
    setSelectAll(!selectAll);
  };

  const handleDeleteOpen = (rowData) => {
    setRowData(rowData);
    setConfirmationDialogOpen(true);
  };
    
  const handleChange = (val, name) => {
    setValues({ ...values, [name]: val });
  };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValues({ statusName: '' })
        await dispatch(addNewStatus({ statusName: values.statusName }))
        await dispatch(getInitialStatusAction())
    };

    const cancelSearch = () => {
        setSearchString('')

        let payload = {
            searchString: ''
        }
        dispatch(setSearchStatusAction([]))
        dispatch(getSearchStatusAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    }

    return(
        <>
            <MaterialTable
                // data={leadManagementStatus}
                data = {[{id: 'new', Group: 'New Status' }, ...leadInitialStatus]}
                columns={[
                    {
                        field: 'status_name',
                        title: 'Name',
                        width: '90%',
                        render: (rowData) => {
                            if (rowData.id === 'new') {
                                return (
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <TextField
                                            fullWidth
                                            label='Group'
                                            variant="outlined"
                                            value={values.statusName}
                                            onChange={(e) => handleChange(e.target.value, 'statusName')}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSubmit(e);
                                                }
                                            }}
                                        />
                                    </div>
                                );
                            }
                            return rowData.status_name;
                        },
                    },
                    {
                        field: 'action',
                        title: 'Action',
                        width: '5%',
                        render: (rowData) => (
                            <Grid container justifyContent="flex-end">
                                {rowData.createdBy !== null && rowData.createdBy !== 0 && rowData.id !== 'new' ? (
                                    <>
                                        <Tooltip
                                            title='Delete'
                                            TransitionComponent={Fade}
                                            TransitionProps={{ timeout: 600 }}
                                            placement='top'
                                        />
                                        <IconButton onClick={() => { handleDeleteOpen(rowData) }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </>
                                ) : null}
                            </Grid>
                        ),
                    },
                    {
                        field: 'select',
                        width: '5%',
                        title: (
                          <Checkbox
                            checked={selectAll}
                            onChange={handleSelectAllClick}
                            inputProps={{ 'aria-label': 'select all groups' }}
                          />
                        ),
                        render: (rowData) => {
                          if (rowData.id !== 'new') {
                            return renderCheckbox(rowData);
                          }
                          return (
                            <IconButton onClick={handleSubmit} disabled={!values.statusName}>
                              <AddIcon />
                            </IconButton>
                          );
                        },
                      }
                ]}
                title = 'Lead Stage'
                options={{
                    filtering:false,
                    actionsColumnIndex : -1,
                    paging : false,
                    search : false,
                    maxBodyHeight: 'calc(100vh - 230px)',
                    minBodyHeight: 'calc(100vh - 230px)',
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

                                    {/* <IconButton onClick={() => setAddFormOpen(true)}>
                                        <AddIcon />
                                    </IconButton> */}
                                </div>

                                {/* <div style={{ padding: '8px 16px' }}>
                                    <CommonSearch
                                        searchVal={searchString}
                                        cancelSearch={cancelSearch}
                                        requestSearch={requestSearch}
                                    />
                                </div> */}
                            </div>
                        )
                    }
                }}
            />

            <Dialog open={confimationDialogOpen}>
                <DialogContent>
                    <DialogContentText>Are you sure want to delete ?</DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button variant='contained' color='error' onClick={() => handleClose()}>Cancel</Button>
                    <Button variant='contained' onClick={() => handleDelete()}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={addFormOpen}>
                <NewSource type='Lead Stage' closeDialog={handleClose} />
            </Dialog>
        </>
    )

}

export default LovStatus

