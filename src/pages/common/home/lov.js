import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Card,
  Grid,
  Typography,
  IconButton,
  Dialog,
  Tooltip,
  Fade,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  TextField,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import CommonSearch from 'utils/commonSearch';
import AddIcon from '@mui/icons-material/Add';
import Checkbox from '@mui/material/Checkbox';
import DeleteIcon from '@mui/icons-material/Delete'
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  listDepartment,
  addDepartmentAction,
  deleteDepartmentAction,
  listEmployeeCategoryAction,
  setSearchDepartmentList,
  getSearchDepartmentList,
  lovDataUpdate,
  LovInitialUpdateAction,
  deleteDepartmentLovAction,
} from 'redux/actions/shifts.actions';
import LovCategory from './lovCategory';
import LovDesignation from './lovDesignation';
import { ErrorAlert } from 'redux/actions/load';
import { getsessionStorage } from 'pages/common/login/cookies';
import LovSource from './lovSource';
import LovStatus from './lovStatus';
import LovType from './lovtype';
import LovGroup from './LovGroup';
import LovCompliances from './lovcompliances ';
import LovRenewals from './lovRenewals';

export default function Lov({ handleNext, handleBack, pageType, handleSubmitLov, assetHandleSubmit }) {
  const dispatch = useDispatch();
  const storage = getsessionStorage();
  const [departments, SetDepartments] = useState(false);
  const [data, SetData] = useState([]);
  const [open, setOpen] = useState(false);
  const [rowData, setRowData] = useState();
  const [search, setSearch] = useState({ searchString: '' });
  const [toolbarHeight, setToolbarHeight] = useState(70);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [selectedRows, setSelectedRows] = useState([]);
  const [deletedRows, setDeletedRows] = useState([]);
  const [addDesignationId, setAddDesignationId] = useState([]);
  const [addDepartment, setAddDepartment] = useState([]);
  const [deleteDesiId, setDeleteDesiId] = useState([]);
  const [addCategoryId, setAddCategoryId] = useState([]);
  const [deleteCatId, setDeleteCatId] = useState([]);
  const [addGroupId, setAddGroupId] = useState([]);
  const [deleteGrpId, setDeleteGrpId] = useState([]);
  const [addSourceId, setAddSourceId] = useState([]);
  const [deletesourceId, setDeletesourceId] = useState([]);
  const [addStatusId, setAddStatusId] = useState([]);
  const [deleteStatusId, setDeleteStatusId] = useState([]);
  const [addTypeId, setAddTypeId] = useState([]);
  const [deleteTypeId, setDeleteTypeId] = useState([]);
  const [addComplianceId, setAddComplianceId] = useState([]);
  const [deleteComplianceId, setDeleteComplianceId] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [addRenewalsId, setAddRenewalsId] = useState([])
  const [deleteRenewalsId, setDeleteRenewalsId] = useState([])

  const resizeWindow = () => {
    const dynamicToolbarHeight_val =
      document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70;
    setToolbarHeight(dynamicToolbarHeight_val);
    setWindowHeight(window.innerHeight);
  };

  const { ShiftsReducer: { lovData, list_department, employeeCategoryList } } = useSelector(state => (state));

  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  useEffect(() => {
    resizeWindow();
    window.addEventListener('resize', resizeWindow);
    return () => window.removeEventListener('resize', resizeWindow);
  }, []);

  useEffect(() => {
    let body = {
      pageType: 'detailpage'
    }
    if (!departments && !open) {
      dispatch(listDepartment(body, (response) => {
        if (response?.length > 0) {
          SetData(response)
        }
      }));
    }
  }, [departments, open]);

  useEffect(() => {
    const data = { addDepartment, addDesignationId, addCategoryId, addGroupId, addTypeId, addSourceId, addStatusId, deleteDesiId, deleteCatId, deletedRows, deleteGrpId, deleteTypeId, deletesourceId, deleteStatusId, addRenewalsId, deleteRenewalsId, addComplianceId, deleteComplianceId }
    dispatch(lovDataUpdate(data))
  }, [addDepartment, addDesignationId, addCategoryId, addGroupId, addTypeId, addSourceId, addStatusId, deleteDesiId, deleteCatId, deletedRows, deleteGrpId, deleteTypeId, deletesourceId, deleteStatusId, addRenewalsId, deleteRenewalsId, addComplianceId, deleteComplianceId])

  let filter = data.filter(id => id.isDeleted == 0);

  useEffect(() => {
    setSelectedRows(filter?.map(v => v.id))
  }, [data])

  const handleClose = () => {
    SetDepartments(false);
  };

  const handlePgNext = async () => {
    console.log('pgnextsubmit')
    dispatch(LovInitialUpdateAction(lovData))
    if (storage?.company_type === 9 || storage?.company_type === 11 || storage?.company_type === 3) {
      assetHandleSubmit()
    } else {
      setTimeout(() => {
        handleNext()
      }, 1000)
    }
  };

  const handlePgSubmit = async () => {
    console.log('pgsubmit')
    dispatch(LovInitialUpdateAction(lovData))
    handleSubmitLov()
  };


  const cancelSearch = () => {
    setSearch({ searchString: '' });
    dispatch(setSearchDepartmentList({ data: [], numCount: 0 }));

    const payload = { searchString: '' };
    dispatch(getSearchDepartmentList(payload, (response) => {
      SetData(response.data);
    }, setModalTypeHandler, setLoaderStatusHandler));
  };

  const requestSearch = (e) => {
    const val = e.target.value;
    setSearch({ searchString: val });
    dispatch(setSearchDepartmentList({ data: [], numCount: 0 }));

    const payload = { searchString: val };
    dispatch(getSearchDepartmentList(payload, (response) => {
      SetData(response.data);
    }, setModalTypeHandler, setLoaderStatusHandler));
  };

  const handleSelectRow = (event, rowData) => {
    const selectedIndex = selectedRows.indexOf(rowData.id);
    let newSelectedRows = [...selectedRows];

    if (event.target.checked) {
      if (selectedIndex === -1) {
        newSelectedRows.push(rowData.id);
      }
    } else {
      if (rowData.isDeleted === 0) {
        newSelectedRows = newSelectedRows.filter(id => id !== rowData.id);
      } else {
        if (selectedIndex !== -1) {
          newSelectedRows.splice(selectedIndex, 1);
        }
      }
    }

    const addDepartment = data
      .filter((v) => newSelectedRows.includes(v.id))
      .map(v => v.department);

    const deleteId = data
      .filter((v) => !newSelectedRows.includes(v.id))
      .map(v => v.id);

    setDeletedRows(deleteId);
    setAddDepartment(addDepartment);
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === data.length);
  };


  const handleDeleteOpen = (rowData) => {
    setRowData(rowData)
    setOpen(true)
  }

  const handleDelete = async () => {
    setOpen(false);
    const type = 'Department'
    await dispatch(deleteDepartmentLovAction(rowData.id, type));
    let body = {
      pageType: 'detailpage'
    }
    await dispatch(listDepartment(body, (response) => {
      if (response?.length > 0) {
        SetData(response)
      }
    }));
  }

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const allRowIds = data.map(row => row.id);
      const allDepartmentNames = data.map(row => row.department);

      setSelectedRows(allRowIds);
      setAddDepartment(allDepartmentNames);
      setDeletedRows([]);
      setSelectAll(true);
    } else {
      setSelectedRows([]);
      setAddDepartment([]);
      setDeletedRows(data.map(row => row.id));
      setSelectAll(false);
    }
  };

  const [values, setValues] = useState({
    Department: ''
  })

  const handleChange = (val, name) => {
    setValues({ ...values, [name]: val })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await dispatch(addDepartmentAction(values))
    let body = {
      pageType: 'detailpage'
    }
    dispatch(listDepartment(body, (response) => {
      if (response?.length > 0) {
        SetData(response)
      }
    }));
    setValues({ Department: '' })
  }

  const renderCheckbox = (rowData) => {
    const isChecked = selectedRows.includes(rowData.id);

    return (
      <Checkbox
        checked={isChecked}
        onChange={(event) => handleSelectRow(event, rowData)}
      />
    );
  };

  const column = [
    {
      field: 'department',
      title: 'Name',
      width: '90%',
      render: (rowData) => {
        if (rowData.id === 'new') {
          return (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <TextField
                fullWidth
                label='Department'
                variant="outlined"
                value={values.Department}
                onChange={(e) => handleChange(e.target.value, 'Department')}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit(e);
                  }
                }}
              />
            </div>
          );
        }
        return rowData.department;
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
          inputProps={{ 'aria-label': 'select all designations' }}
        />
      ),
      render: (rowData) => {
        if (rowData.id !== 'new') {
          return renderCheckbox(rowData);
        }
        return (
          <IconButton onClick={handleSubmit} disabled={!values.Department}>
            <AddIcon />
          </IconButton>
        );
      },
    }
  ];

  const handleDesignation = (data, deleteId) => {
    setAddDesignationId(data)
    setDeleteDesiId(deleteId)
  }

  const handleCategory = (data, deleteId) => {
    const updatedData = data.includes("Confirmed Employees") ? data : [...data, "Confirmed Employees"];
    setAddCategoryId(updatedData)
    const filteredDeleteId = deleteId.filter(id => id !== 1);
    setDeleteCatId(filteredDeleteId)
  }

  const handleGroup = (data, deleteId) => {
    setAddGroupId(data)
    setDeleteGrpId(deleteId)
  }

  const handleSource = (data, deleteId) => {
    setAddSourceId(data)
    setDeletesourceId(deleteId)
  }

  const handleStatus = (data, deleteId) => {
    setAddStatusId(data)
    setDeleteStatusId(deleteId)
  }

  const handleType = (data, deleteId) => {
    setAddTypeId(data)
    setDeleteTypeId(deleteId)
  }

  const handleCompliances = (data, deleteId) => {
    setAddComplianceId(data)
    setDeleteComplianceId(deleteId)
  }

  const handleRenewals = (data, deleteId) => {
    setAddRenewalsId(data)
    setDeleteRenewalsId(deleteId)
  }

  console.log(addDesignationId, addDepartment, addCategoryId, addGroupId, addTypeId, addSourceId, addStatusId, deleteStatusId, 'desiid')
  return (
    <>
      <style>
        {`
          /* Customize scrollbar width */
          ::-webkit-scrollbar {
            width: 10px;
            height: 4px;
          }
          /* Customize scrollbar track */
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          /* Customize scrollbar thumb */
          ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
          }
          /* Customize scrollbar thumb on hover */
          ::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
          .MuiTableCell-head {
            text-align: right !important;
          }
        `}
      </style>
      <Card>
        <Grid container spacing={2} style={{ height: '100%' }}>
          <Grid
            style={{ height: '100%' }}
            size={{
              lg: 4,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <MaterialTable
              columns={column}
              title={'Department'}
              data={[{ id: 'new', Department: 'New Department' }, ...data]}
              options={{
                filtering: false,
                actionsColumnIndex: -1,
                paging: false,
                search: false,
                maxBodyHeight: 'calc(100vh - 230px)',
                minBodyHeight: 'calc(100vh - 230px)',
                overflowX: 'hidden',
              }}
              components={{
                Toolbar: (props) => (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
                      <Typography variant="h6" component="div">
                        {props.title}
                      </Typography>
                    </div>
                  </div>
                ),
              }}
            />
          </Grid>

          {(storage?.company_type === 5 || storage?.company_type === 4) && <>
            <Grid
              style={{ height: '100%' }}
              size={{
                lg: 4,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <LovCategory handleCategory={handleCategory} />
            </Grid>

            <Grid
              style={{ height: '100%' }}
              size={{
                lg: 4,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <LovDesignation handleDesignation={handleDesignation} />
            </Grid>
          </>}
          {(storage?.company_type === 11 || storage?.company_type === 3) && <>
            <Grid
              style={{ height: '100%' }}
              size={{
                lg: 4,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <LovCategory handleCategory={handleCategory} />
            </Grid>

            <Grid
              style={{ height: '100%' }}
              size={{
                lg: 4,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <LovDesignation handleDesignation={handleDesignation} />
            </Grid>
          </>}
          {storage?.company_type === 10 && <>
            <Grid
              style={{ height: '100%' }}
              size={{
                lg: 4,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <LovSource handleSource={handleSource} />
            </Grid>

            <Grid
              style={{ height: '100%' }}
              size={{
                lg: 4,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <LovStatus handleStatus={handleStatus} />
            </Grid>
          </>}
          {storage?.company_type === 9 && <>
            <Grid
              style={{ height: '100%' }}
              size={{
                lg: 4,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <LovGroup handleGroup={handleGroup} />
            </Grid>

            <Grid
              style={{ height: '100%' }}
              size={{
                lg: 4,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <LovType handleType={handleType} />
            </Grid>

            <Grid
              style={{ height: '100%' }}
              size={{
                lg: 4,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <LovCompliances handleCompliances={handleCompliances} />
            </Grid>

            <Grid
              style={{ height: '100%' }}
              size={{
                lg: 4,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <LovRenewals handleRenewals = {handleRenewals} />
            </Grid>
          </>}
        </Grid>
      </Card>
      {storage?.company_type === 10 || storage?.company_type === 4 || storage?.company_type === 3 || storage?.company_type === 11 ? <Grid
        display='flex'
        justifyContent='end'
        margin='10px'
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <Box display='flex' margin='5px'>
        {storage?.company_type !== 10 && <Button
              style={{ marginRight: '10px' }}
              variant="contained"
              onClick={handleBack}
              color='secondary'
            >
              Back
            </Button>}
          <Button variant="contained" onClick={handlePgSubmit}>
            Submit
          </Button>
        </Box>
      </Grid> :
        <Grid
          display='flex'
          justifyContent='end'
          margin='10px'
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Box display='flex' margin='5px'>
            <Button
              style={{ marginRight: '10px' }}
              variant="contained"
              onClick={handleBack}
              color='secondary'
            >
              Back
            </Button>
            <Button variant="contained" onClick={handlePgNext}>
              {storage?.company_type === 9 ? 'Submit' : 'Next'}
            </Button>
          </Box>
        </Grid>}
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
          <Button variant='contained' color='primary' onClick={() => handleDelete()}>Delete</Button>
        </DialogActions>

      </Dialog>
    </>
  );
}

