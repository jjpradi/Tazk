import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Card,
  Grid,
  Dialog,
  Typography,
  IconButton,
  DialogContent,
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
import DeleteIcon from '@mui/icons-material/Delete'
import { useDispatch, useSelector } from 'react-redux';
import { addCategoryAction, deleteCategoryAction, deleteCategoryLovAction, getSearchCategoryList, listEmployeeCategoryAction, setSearchCategoryList } from 'redux/actions/shifts.actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import CategoryForm from 'pages/common/ListOfValues/CategoryForm';
import AddIcon from '@mui/icons-material/Add';

export default function LovCategory({ handleCategory }) {
  const dispatch = useDispatch();
  const [categories, SetCategories] = useState(false);
  const [search, setSearch] = useState({ searchString: '' });
  const [open, setOpen] = useState(false);
  const [data, SetData] = useState([]);
  const [rowData, setRowData] = useState();
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
console.log(selectAll,selectedRows,rowData,data,'checkbox')
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const { ShiftsReducer: { employeeCategoryList } } = useSelector((state) => state);

  useEffect(() => {
    if (!categories) {
      const data = { type: 'LIST_CATEGORY', pageType: 'detailpage' };
      dispatch(
        listEmployeeCategoryAction(data, async (response) => {
          if (response?.length > 0) {
            SetData(response)
          }
        })
      );
    }
  }, [categories]);

  useEffect(() => {
    let filter = data.filter(id => id.isDeleted == 0);
    setSelectedRows(filter?.map(v => v.id))
  }, [data])

  const handleDeleteOpen = (rowData) => {
    setRowData(rowData)
    setOpen(true)
  }

  const handleDelete = async () => {
    setOpen(false);
    await dispatch(deleteCategoryLovAction(rowData.id));
    const data = { type: 'LIST_CATEGORY', pageType: 'detailpage' };
    await dispatch(listEmployeeCategoryAction(data, async (response) => {
      await response;
    })
    );
  }

  const handleSelectAllClick = () => {
    if (!selectAll) {
      const allIds = employeeCategoryList.map((row) => row.id);
      setSelectedRows(allIds);
      handleCategory(employeeCategoryList.map((row) => row.category_name), []);
    } else {
      setSelectedRows([]);
      handleCategory([], employeeCategoryList.map((row) => row.id));
    }
    setSelectAll(!selectAll);
  };

  const handleClose = () => {
    SetCategories(false);
  };

  const [values, setValues] = useState({
    Category: ''
  })

  const handleChange = (val, name) => {
    setValues({ ...values, [name]: val })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await dispatch(addCategoryAction(values))
    const data = { type: 'LIST_CATEGORY', pageType: 'detailpage' };
    dispatch(
      listEmployeeCategoryAction(data, async (response) => {
        await response;
      })
    );
    setValues({ Category: '' })
  }
  const renderCheckbox = (rowData) => {
    const isChecked = selectedRows.includes(rowData.id)
    return (
      <Checkbox
        checked={isChecked}
        onChange={(event) => handleSelectRow(event, rowData.id)}
        disabled={rowData?.category_name == "Confirmed Employees"
        }
      />
    );
  }

  const column = [
    {
      field: 'category_name',
      title: 'Name',
      width: '80%',
      render: (rowData) => {
        if (rowData.id === 'new') {
          return (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <TextField
                fullWidth
                label='Category'
                variant="outlined"
                value={values.Category}
                onChange={(e) => handleChange(e.target.value, 'Category')}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit(e);
                  }
                }}
              />
            </div>
          );
        }
        return rowData.category_name;
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
      width: 100,
      title: (<Checkbox
        checked={selectAll}
        onChange={handleSelectAllClick}
        inputProps={{ 'aria-label': 'select all categories' }}
      />),
      render: (rowData) => {
        if (rowData.id !== 'new') {
          return renderCheckbox(rowData);
        }
        return (
          <IconButton onClick={handleSubmit} disabled={!values.Category}>
            <AddIcon />
          </IconButton>
        );
      },
    },
  ];

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

    const deleteId = employeeCategoryList.filter((v) => !newSelectedRows.includes(v.id));
    const addCategory = employeeCategoryList.filter((v) => newSelectedRows.includes(v.id));
    const ids = deleteId?.map((v) => v.id);
    const names = addCategory?.map((v) => v.category_name);

    handleCategory(names, ids);
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === employeeCategoryList.length);
  };

  const cancelSearch = () => {
    setSearch({ searchString: '' });
    dispatch(setSearchCategoryList({ data: [], numCount: 0 }));

    const payload = { searchString: '', type: 'LIST_CATEGORY' };

    dispatch(getSearchCategoryList(payload, setModalTypeHandler, setLoaderStatusHandler));
  };

  const requestSearch = (e) => {
    const val = e.target.value;
    setSearch({ searchString: val });
    dispatch(setSearchCategoryList({ data: [], numCount: 0 }));

    const payload = { searchString: val, type: 'LIST_CATEGORY' };

    dispatch(getSearchCategoryList(payload, setModalTypeHandler, setLoaderStatusHandler));
  };

  return (
    <>
      <MaterialTable
        columns={column}
        title={'Category'}
        data={[{ id: 'new', Category: 'New Category' }, ...employeeCategoryList]}
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
                <CommonSearch
                  searchVal={search.searchString}
                  cancelSearch={cancelSearch}
                  requestSearch={requestSearch}
                />
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
            <DialogContent style={{ width: 500 }}>
              <DialogContentText
                id='alert-dialog-description'
                sx={{ color: 'warning.main' }}
              >
                Are you sure you want to delete ?
              </DialogContentText>
            </DialogContent>
          </Grid>

        </Grid>
        <DialogActions>
          <Button variant='contained' color='error' onClick={() => setOpen(false)}>cancel</Button>
          <Button variant='contained' color='primary' onClick={() => handleDelete(rowData)}>Delete</Button>
        </DialogActions>

      </Dialog>
    </>
  );
}

