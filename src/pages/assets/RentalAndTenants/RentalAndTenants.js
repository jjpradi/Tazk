import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {Autocomplete, Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton, TextField, Tooltip, Typography, TablePagination} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import CommonSearch from 'utils/commonSearch';
import {maxBodyHeight, headerStyle, cellStyle} from 'utils/pageSize';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {useDispatch, useSelector} from 'react-redux';
import {
  rentalAndTenantsAction,
  getRentalAndTenantsAction,
  setRentalAndTenantsAction,
  getAllAssetAction,
  deleteRentalTenantAction,
} from 'redux/actions/asset_actions';
import moment from 'moment';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import RentalAndTenantForm from './RentalAndTenantForm';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import toMomentOrNull from 'utils/DateFixer';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const RentalAndTenants = () => {
  const dispatch = useDispatch();
  const storage = getsessionStorage();
  const selectedRole = storage?.role_name;


  const {
    AssetReducers: {getRentalAndTenants, getAssetName},
    rbacReducer: { menuAccess = {} },
  } = useSelector((state) => state);

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const [open, setOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formType, setFormType] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [dialogConfirm, setDialogConfirm] = useState(false);

      const currentMonth = moment().startOf('month');
    const firstDateOfMonth = currentMonth.format('YYYY-MM-DD');
    const lastDateOfMonth = currentMonth.endOf('month').format('YYYY-MM-DD');

    const typeOptions = [
      {id: 1, type: 'Rental'},
      {id: 2, type: 'Tenant'},
    ];

    const [formValues,setFormValues] =  useState({
      startDate : null,
      endDate : null,
      type : null,
      assetName : null,
      name : '',
    })

    const [formErrors, setFormErrors] = useState({
    startDate : null,
    endDate : null,
    });

  const [paginateData, setPaginateData] = useState({
    searchString: '',
    pageCount: 0,
    pageSize: 20,
  });

  const fetchRentalAndTenants = async (overrides = {}) => {
    const payload = {
      searchString: paginateData.searchString,
      pageCount: paginateData.pageCount,
      numPerPage: paginateData.pageSize,
      startDate: formValues.startDate || "",
      endDate: formValues.endDate || "",
      type: formValues.type?.type || "",
      assetName: formValues.assetName?.asset_id || "",
      name: formValues.name || "",
      ...overrides,
    };

    await dispatch(
      rentalAndTenantsAction(
        payload,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
  };

  const handlePageChange = (page) => {
    setPaginateData((prev) => ({
      ...prev, 
      pageCount: page
    }));
  };

  const handleSizeChange = (size) => {
    setPaginateData((prev) => ({
      ...prev, 
      pageSize: size,
      pageCount: 0,
    }));
  };

  const columns = [
    {
      field: 'type',
      title: 'Type',
    },
    {
      field: 'name',
      title: 'Name',
    },
    {
      field: 'phone',
      title: 'Phone',
    },
    {
      field: 'email',
      title: 'Email',
    },
    {
      field: 'asset_name',
      title: 'Asset',
    },
    {
      field: 'location',
      title: 'Location',
    },
    {
      field: 'monthly_rent',
      title: 'Monthly Rent',
    },
    {
      field: 'security_deposit',
      title: 'Security Deposit',
    },
    {
      field: 'startDate',
      title: 'Start Date',
      render : (data)=>{
        return moment(data.startDate,'YYYY-MM-DD').format('DD/MM/YYYY')
      }
    },
    {
      field: 'endDate',
      title: 'End Date',
      render : (data)=>{
        return moment(data.endDate,'YYYY-MM-DD').format('DD/MM/YYYY')
      }
    },
    
    {
      field: 'billing_cycle',
      title: 'Billing Cycle',
    },
    {
      field: 'billing_day_of_month',
      title: 'Billing Day of Month',
    }
  ];

  const cancelSearch = () => {
    setPaginateData({...paginateData, searchString: ''});

    dispatch(
      setRentalAndTenantsAction({
        data: [],
        numRows: 0,
      }),
    );

    fetchRentalAndTenants({searchString: ''});
  };

  const requestSearch = (e) => {
    const val = e.target.value;

    setPaginateData({...paginateData, searchString: val});

    dispatch(
      setRentalAndTenantsAction({
        data: [],
        numRows: 0,
      }),
    );

    dispatch(
      getRentalAndTenantsAction(
        {
          searchString: val,
          pageCount: 0,
          numPerPage: paginateData.pageSize,
          startDate: formValues.startDate,
          endDate: formValues.endDate,
          type: formValues.type?.type || '',
          assetName: formValues.assetName?.asset_id || '',
          name: formValues.name || '',
        },
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
  };

  const handleOpen = () => {
    setEditData(null);
    setFormType('create');
    setOpen(true);
  };

  const handleFormClose = () => {
    setOpen(false);
    setEditData(null);
    setFormType(null);
  };


  useEffect(() => {
    fetchRentalAndTenants();
  }, [paginateData.pageCount, paginateData.pageSize]);

  const handleChange = (name, value) => {
    const formattedValue = value ? moment(value).format('YYYY-MM-DD') : null;

    setFormValues((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [name]: null,
    }));
  }

  useEffect(() => {
    dispatch(getMenuAccessAction(selectedRole));
  }, [dispatch]);

  useEffect(() => {
    if (filterOpen) {
      dispatch(getAllAssetAction())
    }
  }, [filterOpen]);

  const handleSubmit = async () => {
    let isValid = true
    let formErrorObj = { startDate: null, endDate: null }

    if (formValues.startDate && !formValues.endDate) {
      isValid = false
      formErrorObj.endDate = "End Date is Required"
    }

    if (formValues.endDate && !formValues.startDate) {
      isValid = false
      formErrorObj.startDate = "Start Date is Required"
    }

    setFormErrors(formErrorObj)

    if (!isValid) return;

    const formattedStartDate = formValues.startDate ? moment(formValues.startDate).format('YYYY-MM-DD') : ''
    const formattedEndDate = formValues.endDate ? moment(formValues.endDate).format('YYYY-MM-DD') : ''

    await dispatch(
      rentalAndTenantsAction({
        searchString: '',
        pageCount: 0,
        numPerPage: paginateData.pageSize,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        type: formValues.type?.type || '',
        assetName: formValues.assetName?.asset_id || '',
        name: formValues.name || '',
      })
    );

    setPaginateData((prev) => ({ ...prev, pageCount: 0 }))
    setFilterOpen(false)
  };
  
    const handleClear = async()=>{
    setFormValues({
      startDate: null,
      endDate: null,
      type: null,
      assetName: null,
      name: '',
    })
    setFormErrors({ startDate: null, endDate: null })
    await fetchRentalAndTenants({ startDate: '', endDate: '', type: '', assetName: '', name: '' })
    setPaginateData((prev) => ({...prev, pageCount: 0}));
    setFilterOpen(false)
    }
  const rentalAndTenantsCreate = UserRightsAuthorization(menuAccess[selectedRole],'rental_and_tenants','can_create');
  const rentalAndTenantsEdit = UserRightsAuthorization(menuAccess[selectedRole],'rental_and_tenants','can_edit');
  const rentalAndTenantsDelete = UserRightsAuthorization(menuAccess[selectedRole],'rental_and_tenants','can_delete');

  const handleEditClick = (rowData) => {
    setEditData(rowData);
    setFormType('edit');
    setOpen(true);
  };

  const handleDeleteClick = (rowData) => {
    setDeleteId(rowData.id);
    setDeleteRecord(rowData);
    setDialogConfirm(true);
  };

  const handleDeleteCancel = () => {
    setDialogConfirm(false);
    setDeleteId(null);
    setDeleteRecord(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await dispatch(deleteRentalTenantAction(deleteId));
    setDialogConfirm(false);
    setDeleteId(null);
    setDeleteRecord(null);
    await fetchRentalAndTenants();
  };

  const actionColumn = {
    field: 'action',
    title: 'Action',
    render: (rowData) => (
      <div style={{display: 'flex'}}>
        {rentalAndTenantsEdit && (
          <Tooltip title='Edit'>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(rowData);
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
        {rentalAndTenantsDelete && (
          <Tooltip title='Delete'>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(rowData);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
    ),
  };

  const tableColumns = (rentalAndTenantsEdit || rentalAndTenantsDelete) ? [...columns, actionColumn] : columns;

  return (
    <div>
      {!open && (
        <Card>
          <MaterialTable
            style={{height: 'calc(100vh - 100px)', overflow:'hidden'}}
            columns={tableColumns}
            data={getRentalAndTenants.data || []}
            title={'Rental / Tenants'}
            totalCount={getRentalAndTenants.numRows}
            options={{
              headerStyle,
              cellStyle,
              actionsColumnIndex: -1,
              filtering: false,
              search: false,
              paging: true,
              pageSize: paginateData.pageSize,
              pageSizeOptions: [20, 50, 100],
              maxBodyHeight: maxBodyHeight,
              minBodyHeight: maxBodyHeight,
              // overflowY: 'visible',
            }}
            page={paginateData.pageCount}
            onPageChange={(page) => {
              handlePageChange(page);
            }}
            onRowsPerPageChange={(size) => {
              handleSizeChange(size);
            }}
            components={{
              Toolbar: (props) => (
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                  }}
                >
                  <div style={{width: '100%'}}>
                    <MTableToolbar {...props} />
                  </div>
                  <div>
                    <CommonSearch
                      searchVal={paginateData.searchString}
                      cancelSearch={cancelSearch}
                      requestSearch={requestSearch}
                    />
                  </div>
                </div>
              ),
              Pagination: (props) => (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    padding: "8px 16px",
                  }}
                >
                  <TablePagination
                    component="div"
                    count={getRentalAndTenants?.numRows || 0}
                    page={paginateData.pageCount}
                    rowsPerPage={paginateData.pageSize}
                    rowsPerPageOptions={[20, 50, 100]}
                    onPageChange={(event, newPage) => handlePageChange(newPage)}
                    onRowsPerPageChange={(event) =>
                      handleSizeChange(parseInt(event.target.value, 10))
                    }
                    labelRowsPerPage="Rows per page:"
                  />
                </div>
              ),
            }}
            actions={[
              ...(rentalAndTenantsCreate
                 ? [
              {
                icon: () => <AddIcon />,
                tooltip: 'Create',
                isFreeAction: true,
                onClick: () => handleOpen(),
              }, ] : []),
              {
                icon: () => (
                    <div style={{ display: 'flex' }}>
                        <IconButton onClick={()=> setFilterOpen(true)}>
                            <FilterAltIcon/>
                        </IconButton>
                    </div>
                ),
                tooltip: 'Filter',
                isFreeAction: true,
                },
            ]}
          />
        </Card>
      )}
      {open && <RentalAndTenantForm
        type={formType}
        rowData={formType === 'edit' ? editData : null}
        handleClose = {handleFormClose}
        onSuccess = {async () => {
          handleFormClose();
          setPaginateData((prev) => ({...prev, pageCount: 0}));
          await fetchRentalAndTenants({pageCount: 0});
        }}
      />}
      <Dialog
        open={dialogConfirm}
        onClose={handleDeleteCancel}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{'Delete Rental / Tenant?'}</DialogTitle>
        <DialogContent style={{width: 400}}>
          <DialogContentText
            id='alert-dialog-description'
            sx={{color: 'warning.main'}}
          >
            {deleteRecord?.name
              ? `Are you sure you want to delete "${deleteRecord.name}" (${deleteRecord.type || ''})?`
              : 'Are you sure you want to delete this record?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color='primary' autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} maxWidth="xs">
        <Card sx={{pt: 3,p : 5}}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <IconButton aria-label='close' onClick={() => setFilterOpen(false)}>
                <CloseIcon />
              </IconButton>
            </div>
            <Grid container spacing={3}>
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <LocalizationProvider dateAdapter={DateAdapter}>
                        <DatePicker
                            label='From Date'
                            value={toMomentOrNull(formValues.startDate)}
                            onChange={(date) =>
                            handleChange('startDate',date)
                            }
                            slotProps={{ textField: { fullWidth: true, variant: 'filled', error: formErrors.startDate !== null, helperText: formErrors.startDate || ''} }}
                        />
                    </LocalizationProvider>
            </Grid>
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <LocalizationProvider dateAdapter={DateAdapter}>
                        <DatePicker
                            label='To Date'
                            value={toMomentOrNull(formValues.endDate)}
                            onChange={(date) =>
                            handleChange('endDate', date)
                            }
                            slotProps={{ textField: { fullWidth: true, variant: 'filled', error: formErrors.endDate !== null, helperText: formErrors.endDate || ''} }}
                        />
                    </LocalizationProvider>
            </Grid>
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Autocomplete
                    options={typeOptions}
                    getOptionLabel={(option) => option.type || ''}
                    value={formValues.type || null}
                    onChange={(e, newValue) =>
                      setFormValues((prev) => ({...prev, type: newValue}))
                    }
                    renderInput={(params) => (
                      <TextField {...params} fullWidth label='Type' variant='filled' />
                    )}
                />
            </Grid>
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Autocomplete
                    fullWidth
                    options={getAssetName || []}
                    getOptionLabel={(option) => option ? `${option.Name} - ${option.Code}` : ''}
                    value={formValues.assetName || null}
                    onChange={(event, value) =>
                      setFormValues((prev) => ({...prev, assetName: value}))
                    }
                    isOptionEqualToValue={(option, value) => option?.asset_id === value?.asset_id}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth label='Asset Name' variant='filled' />
                    )}
                />
            </Grid>
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <TextField
                    fullWidth
                    label='Name'
                    variant='filled'
                    value={formValues.name}
                    onChange={(e) =>
                      setFormValues((prev) => ({...prev, name: e.target.value}))
                    }
                />
            </Grid>
              {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                <TextField
                label = {'BIlling Cycle'}
                fullWidth
                name='billing_cycle'
                variant='filled'
                required
                onChange={(e) => handleChange('billing_cycle', e.target.value)}
                value={formValues.billing_cycle}
                error={formErrors.billing_cycle !== null}
                helperText={formErrors.billing_cycle}
                />
            </Grid> */}
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
                                            <Grid container justifyContent='flex-end' spacing={2} mb={2}>
                                              <Grid>
                                                <Button
                                                  variant='contained'
                                                  color='error'
                                                  onClick={handleClear}
                                                >
                                                  Clear
                                                </Button>
                                              </Grid>
                                
                                              <Grid>
                                                <Button
                                                  variant='contained'
                                                  color='primary'
                                                  onClick={handleSubmit}
                                                >
                                                  Apply
                                                </Button>
                                              </Grid>
                                            </Grid>
                                          </Grid>
                                          </Grid>
        </Card>
      </Dialog>
    </div>
  );
};

export default RentalAndTenants;

