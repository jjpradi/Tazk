import React, { useState, useEffect, useContext } from 'react';
import { Grid, TextField, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, Button, Typography, Checkbox, Fade } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { createAssetGroup, deleteAssetGroup, deleteInitialAssetGroupAction, getAssetGroupIdAction, getInitialAssetGroupAction, setSearchAssetGroupAction, setSearchAssetGroupListAction } from 'redux/actions/asset_actions';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MaterialTable from 'utils/SafeMaterialTable';
import CommonSearch from 'utils/commonSearch';
import CreateNewButtonContext from 'context/CreateNewButtonContext';

const LovGroup = ({ handleGroup }) => {
  const dispatch = useDispatch();
  const { AssetReducers: { getInitialAssetGroup } } = useSelector((state) => state);
  console.log(getInitialAssetGroup, 'getInitialAssetGroup')
  const [pagination, setPagination] = useState({ searchString: '' });
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ groupName: '' });
  const [rowData, setRowData] = useState(null);
  const [data, SetData] = useState([]);

  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  useEffect(() => {
    // dispatch(getInitialAssetGroupAction(pagination));
    dispatch(getInitialAssetGroupAction(pagination, (response) => {
      console.log(response, 'response')
      if (response?.length > 0) {
        SetData(response)
      }
    }));
  }, [dispatch, pagination]);

  useEffect(() => {
    let filter = data.filter(id => id.isDeleted == 0);
    console.log(filter, data, pagination, values, 'filllterrr')
    setSelectedRows(filter?.map(v => v.id))
  }, [data])

  const handleSelectAllClick = () => {
    if (!selectAll) {
      const allIds = getInitialAssetGroup?.data.map((row) => row.id);
      setSelectedRows(allIds);
      handleGroup(getInitialAssetGroup?.data.map((row) => row.asset_group), [])
    } else {
      setSelectedRows([]);
      handleGroup([], getInitialAssetGroup?.data.map((row) => row.id));
    }
    setSelectAll(!selectAll);
  };

  const cancelSearch = () => {
    setPagination({ ...pagination, searchString: '' });
    dispatch(setSearchAssetGroupAction({ data: [], numCount: 0 }));
    dispatch(setSearchAssetGroupListAction({ searchString: '' }, setModalTypeHandler, setLoaderStatusHandler));
  };

  const requestSearch = (e) => {
    const val = e.target.value;
    setPagination({ ...pagination, searchString: val });
    dispatch(setSearchAssetGroupAction({ data: [], numCount: 0 }));
    dispatch(setSearchAssetGroupListAction({ searchString: val }, setModalTypeHandler, setLoaderStatusHandler));
  };

  const handleChange = (val, name) => {
    setValues({ ...values, [name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createAssetGroup(values, () => {
      dispatch(getInitialAssetGroupAction(pagination));
      setPagination({ searchString: '' });
    }));
    setValues({ groupName: '' })
  };

  const handleDeleteOpen = (rowData) => {
    setRowData(rowData);
    setOpen(true);
  };

  const handleDelete = async () => {
    setOpen(false);
    await dispatch(deleteInitialAssetGroupAction(rowData?.asset_group_id));
    await dispatch(getInitialAssetGroupAction(pagination, (response) => {
      if (response?.length > 0) {
        SetData(response)
      }
    }));
  };

  const renderCheckbox = (rowData) => {
    const isChecked = selectedRows.includes(rowData.id);
    return <Checkbox checked={isChecked} onChange={(e) => handleSelectRow(e, rowData.id)} />;
  };

  const handleSelectRow = (event, id) => {
    const selectedIndex = selectedRows.indexOf(id);
    let newSelectedRows = [];

    if (selectedIndex === -1) {
      newSelectedRows = newSelectedRows.concat(selectedRows, id);
    } else if (selectedIndex > 0) {
      newSelectedRows = newSelectedRows.concat(selectedRows.slice(0, selectedIndex), selectedRows.slice(selectedIndex + 1));
    }
    const assetGroupData = Array.isArray(getInitialAssetGroup) ? getInitialAssetGroup : [];
    const deleteId = getInitialAssetGroup?.data?.filter((v) => !newSelectedRows.includes(v.id));
    const addGroup = assetGroupData?.filter((v) => newSelectedRows.includes(v.id));
    const ids = deleteId?.map((v) => v.id);
    const names = addGroup?.map((v) => v.asset_group);
    handleGroup(newSelectedRows, ids);
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === assetGroupData?.length);
    console.log(assetGroupData?.filter((v) => newSelectedRows.includes(v.id)), assetGroupData, getInitialAssetGroup, getInitialAssetGroup?.data?.filter((v) => !newSelectedRows.includes(v.id)), 'addcattttt');
    console.log(id, selectedRows, newSelectedRows, deleteId, addGroup, ids, names, 'addcattttt1')
  };

  const columns = [
    {
      field: 'asset_group',
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
                value={values.groupName}
                onChange={(e) => handleChange(e.target.value, 'groupName')}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit(e);
                  }
                }}
              />
            </div>
          );
        }
        return rowData.asset_group;
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
          <IconButton onClick={handleSubmit} disabled={!values.groupName}>
            <AddIcon />
          </IconButton>
        );
      },
    }
  ];

  return (
    <>
      <MaterialTable
        columns={columns}
        title="Asset Group"
        // data={getInitialAssetGroup?.data}
        data={[
          { id: 'new', Group: 'New Group' },
          ...(Array.isArray(getInitialAssetGroup?.data) ? getInitialAssetGroup.data : [])
        ]}
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
            <div style={{ padding: '8px 16px' }}>
              <Grid container justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{props.title}</Typography>
                {/* <IconButton onClick={() => setOpen(true)}>
                                    <AddIcon />
                                </IconButton> */}
              </Grid>
              {/* <CommonSearch
                                searchVal={pagination.searchString}
                                cancelSearch={cancelSearch}
                                requestSearch={requestSearch}
                            /> */}
            </div>
          ),
        }}
      />
      <Dialog open={open}>
        <Grid container>
          <Grid
            size={{
              lg: 6,
              md: 6
            }}>
            <DialogContent style={{ width: 500 }}>
              <DialogContentText id="lovgroup-dialog-description" sx={{ color: 'warning.main' }}>
                Are you sure you want to delete?
              </DialogContentText>
            </DialogContent>
          </Grid>
        </Grid>
        <DialogActions>
          <Button variant="contained" color="error" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LovGroup;

