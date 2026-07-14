import React, { useState, useEffect, useContext } from 'react';
import {
  Grid,
  Typography,
  IconButton,
  DialogContent,
  Dialog,
  DialogContentText,
  DialogActions,
  Button,
  Checkbox,
  TextField,
  Tooltip,
  Fade,
} from '@mui/material';
import MaterialTable from 'utils/SafeMaterialTable';
import CommonSearch from 'utils/commonSearch';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import { addDesignationAction, deleteDesignationAction, deleteDesignationLovAction, designationAction, getSearchDesignation, setSearchDesignation } from 'redux/actions/userCreation_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import DeleteIcon from '@mui/icons-material/Delete'

export default function LovDesignation({ handleDesignation}) {
  const dispatch = useDispatch();
  const [designationlist, SetDesignationList] = useState(false);
  const [search, setSearch] = useState({ searchString: '' });
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [open, setOpen] = useState(false);
  const [rowData,setRowData]=useState();
  const [newDesignation, setNewDesignation] = useState('');
  const [desiData, SetDesiData] = useState([]);
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const { UserRoleReducer: { designation } } = useSelector((state) => state);

  useEffect(() => {
    let body = {
      pageType: 'detailpage',
    };
    dispatch(designationAction(body, (response) => {
      if (response?.length > 0) {
        SetDesiData(response)
      }
    }));
  }, [designationlist]);

  useEffect(()=>{
  let filter = desiData.filter(id => id.isDeleted == 0);
    setSelectedRows(filter?.map(v=>v.id))
  },[desiData])
  
  const handleSelectRow = (event, id) => {
    const selectedIndex = selectedRows.indexOf(id);
    let newSelectedRows = [];

    if (selectedIndex === -1) {
      newSelectedRows = newSelectedRows.concat(selectedRows, id);
    } else if (selectedIndex === 0) {
      newSelectedRows = newSelectedRows.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelectedRows = newSelectedRows.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelectedRows = newSelectedRows.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1)
      );
    }

    const deleteId = designation.filter((v) => !newSelectedRows.includes(v.id));
    const ids = deleteId?.map((v) => v.id);
    const addDesignation = designation.filter((v) => newSelectedRows.includes(v.id));
    const names = addDesignation?.map((v) => v.designation);
    handleDesignation(names, ids);
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === designation.length);
  };

  const handleSelectAllClick = () => {
    if (!selectAll) {
      const allIds = designation.map((row) => row.id);
      setSelectedRows(allIds);
      handleDesignation(designation.map((row) => row.designation), [])
    } else {
      setSelectedRows([]);
      handleDesignation([], designation.map((row) => row.id));
    }
    setSelectAll(!selectAll);
  };

  const cancelSearch = () => {
    setSearch({ searchString: '' });
    dispatch(setSearchDesignation({ data: [], numCount: 0 }));

    const payload = {
      searchString: '',
    };

    dispatch(getSearchDesignation(payload, setModalTypeHandler, setLoaderStatusHandler));
  };

  const requestSearch = (e) => {
    const val = e.target.value;
    setSearch({ searchString: val });
    dispatch(setSearchDesignation({ data: [], numCount: 0 }));

    const payload = {
      searchString: val,
    };

    dispatch(getSearchDesignation(payload, setModalTypeHandler, setLoaderStatusHandler));
  };

  const [values, setValues] = useState({
    Designation: ''
  })

  const handleChange = (val, name) => {
    setValues({ ...values, [name]: val })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await dispatch(addDesignationAction(values))
    dispatch(designationAction())
    setValues({ Designation: '' })
  }

  const handleDeleteOpen = (rowData)=>{
    setRowData(rowData)
    setOpen(true)
}

const handleDelete = async()=>{
    setOpen(false);
    await dispatch(deleteDesignationLovAction(rowData.id));
}

const renderCheckbox = (rowData) => {
  const isChecked = selectedRows.includes(rowData.id);
    return (
      <Checkbox
        checked={isChecked}
        onChange={(event) => handleSelectRow(event, rowData.id)}
      />
    );
  }

  return (
    <>
      <MaterialTable
        columns={[
          {
            field: 'designation',
            title: 'Name',
            width: '80%',
            render: (rowData) => {
              if (rowData.id === 'new') {
                return (
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <TextField
                      fullWidth
                      label='Designation'
                      variant="outlined"
                      value={values.Designation}
                      onChange={(e) => handleChange(e.target.value, 'Designation')}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmit(e);
                        }
                      }}
                    />
                  </div>
                );
              }
              return rowData.designation;
            },
          },
          {
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
            field: 'Select',
            width: '20%',
            title: (
              <Checkbox
                checked={selectAll}
                onChange={handleSelectAllClick}
                inputProps={{ 'aria-label': 'select all designations' }}
              />
            ),
            render: (rowData) => {
              if (rowData.id !== 'new') {
                return renderCheckbox(rowData);
              }
              return (
                <IconButton onClick={handleSubmit} disabled={!values.Designation}>
                  <AddIcon />
                </IconButton>
              );
            },
          },
        ]}
        title={'Designation'}
        data={[{ id: 'new', designation: 'New Designation' }, ...designation]}
        options={{
          filtering: false,
          actionsColumnIndex: -1,
          paging: false,
          search: false,
          maxBodyHeight: 'calc(100vh - 230px)',
          minBodyHeight: 'calc(100vh - 230px)',
        }}
        components={{
          Toolbar: (props) => (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
                <Typography variant="h6" component="div">
                  {props.title}
                </Typography>
              </div>
              {/* <div style={{ padding: '8px 16px' }}>
                <CommonSearch searchVal={search.searchString} cancelSearch={cancelSearch} requestSearch={requestSearch} />
              </div> */}
            </div>
          ),
        }}
      />
      <Dialog open={open === true}>
                
                <Grid container >
                    <Grid
                      size={{
                        lg: 6,
                        md: 6
                      }}>
                    <DialogContent style={{width: 500}}>
          <DialogContentText
            id='alert-dialog-description'
            sx={{color: 'warning.main'}}
          >
            Are you sure you want to delete ?
          </DialogContentText>
        </DialogContent>
                        </Grid>
                       
                </Grid>
                <DialogActions>
                        <Button variant='contained' color='error' onClick={()=>setOpen(false)}>cancel</Button>
                        <Button variant='contained' color='primary' onClick={()=> handleDelete(rowData) }>Delete</Button>
                        </DialogActions>
          
        </Dialog>
    </>
  );
}

