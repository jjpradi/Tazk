import React, {useContext, useEffect, useState} from 'react';
import {Button, Grid, TextField,Select,MenuItem, Paper} from '@mui/material';
import Typography from '@mui/material/Typography';
import {connect, useDispatch, useSelector} from 'react-redux';
import {
  createFuelPriceAction,
  getTravelDetailsAction,
  getFuelPriceListAction,
  getSalesManListAction,
  deleteFuelPriceListAction,
  getAllowanceListAction,
  updateFuelPriceAction,
} from 'redux/actions/fuelAllowance_actions';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import MaterialTable, { MTablePagination, MTableToolbar } from 'utils/SafeMaterialTable';
import moment from 'moment';
import _ from 'lodash';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import AddIcon from '@mui/icons-material/Add';
import { AddAPhoto } from '@mui/icons-material';
import { titleURL } from 'http-common';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { getsessionStorage } from 'pages/common/login/cookies';
import FuelAllowanceForm from './fuelAllowance';
import CommonSearch from 'utils/commonSearch';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
// import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../utils/stickyTableLayout';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

export default function FuelAllowance() {
  const storage = getsessionStorage()
  const [fuelDetails, setFuelDetails] = useState([]);
  const [selectedRow, setSelectedRow] = useState();
  const [open, setOpen] = useState(false);
  const [mileageDetails, setMileageDetails] = useState([]);
  const [fuelType, setFuelType] = useState(['petrol', 'disel', 'gas']);
  const [currentPage, setCurrentPage] = useState(0);
  const [ searchVal, setSearchVal ] = useState('');
  const [ pageNumber, setPageCount ] = useState(0);
  const [ numPerPage, setNumPerPage ] = useState(20);
  const [ filteredData, setFilteredData ] = useState(fuelDetails);
  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(
    CreateNewButtonContext,
  );

  useEffect(() => {
  }, [currentPage]);

  const dispatch = useDispatch();
  const {
    fuelAllowanceReducer: {fuelPriceList, salesManList, travelDetails},
    roleReducer : {user_rights}, rbacReducer: { menuAccess }
  } = useSelector((state) => state);
  useEffect(() => {
    const data ={
      searchstring : searchVal,
      numPerPage,
      pageNumber : pageNumber + 1
    }
    const payload = {
    searchString: ''
  };
    apiCalls(
      setModalTypeHandler, 
      setLoaderStatusHandler,
      dispatch(
        getFuelPriceListAction(data),
      ),
      dispatch(
        getSalesManListAction(payload),
      ),
      // dispatch(getUserRightsByRoleIdAction())
    );
  }, [numPerPage, pageNumber]);

  useEffect(() => {
    setFuelDetails(fuelPriceList);
  }, [fuelPriceList]);

  useEffect(() => {
    setMileageDetails(travelDetails);
  }, [travelDetails]);


  const selectedRole = storage.role_name
  useEffect(() => {
    if (!selectedRole) return;
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
  }, [selectedRole, dispatch]);

  const FuelAllowanceAddRights = UserRightsAuthorization(menuAccess[selectedRole], 'sales_man__fuel_allowance', 'can_create') 
  

  const handleSubmit = (MDetails, SRow) => {
    const tempObj = {
      allowance: MDetails.map(
        ({
          date,
          empId,
          bike,
          kmTraveled,
          mileage,
          allowance,
          attendanceIdList,
        }) => ({
          date,
          empId,
          bike,
          kmTraveled,
          mileage,
          allowance,
          attendanceIdList,
        }),
      ),
      fuelPrice: {
        date: moment(SRow.date).format('YYYY-MM-DD'),
        fuelType: SRow.fuelType,
        fuelPrice: SRow.fuelPrice,
      },
    };


    if (SRow.id) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          updateFuelPriceAction(
            SRow.id,
            tempObj,
            setModalTypeHandler,
            setLoaderStatusHandler,
            response => {
              if(response.status === 200 && response.data.message !== "Bike or mileage can't be empty"){
                setOpen(!open);
              }
            }
          ),
        )
      );
    } else {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          createFuelPriceAction(
            tempObj,
            setModalTypeHandler,
            setLoaderStatusHandler,
            response => {
            if(response.status === 200 && response.data.message !== "Bike or mileage can't be empty"){
              setOpen(!open);
            }
          }
          ),
        )
      );
    }

    
  };

  const handleAddClick = () => {
    setOpen(true);
  };

  const handleCloseFuelForm = () => {
    setOpen(false);
  };

  const requestSearch = (e) => {
    const value = e.target.value;
    setSearchVal(value);
    setPageCount(0);

    const data = {
      searchstring: value,
      numPerPage,
      pageNumber: pageNumber + 1
    };

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getFuelPriceListAction(data))
    );
  };


  const cancelSearch = () => {
    setSearchVal('');
    setPageCount(0);

    const data = {
      searchstring: '',
      numPerPage,
      pageNumber: pageNumber + 1
    };

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getFuelPriceListAction(data))
    );
  };

  const handleChangePage = (event, newPage) => {
    setPageCount(newPage);
  };

  const handleChangeRowsPerPage = (newPageSize) => {
    setNumPerPage(newPageSize);
    setPageCount(0);
  };


  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title> {titleURL} | Fuel Allowance </title>
      </Helmet>
      {/* <Grid container spacing={3}>
        {!open ? (
          <Grid size={{ sm: 12, md: 12, lg: 12 }} xx={12}>
            <MaterialTable
             style={{height:'87vh',overflow:'hidden'}}
             editable={
              storage?.role_name !== "Salesman"
                ? {
                    onRowAdd: (newRow) =>
                      new Promise((resolve, reject) => {
                        setFuelDetails([...fuelDetails, newRow]);
                        setTimeout(() => resolve(), 500);
                      }),
            
                    onRowUpdate: (newRow, oldRow) =>
                      new Promise((resolve, reject) => {
                        if (oldRow.id) {
                          const updatedData = [...fuelDetails];
                          updatedData[
                            updatedData.findIndex((x) => x.id === oldRow.id)
                          ] = newRow;
                          setFuelDetails(updatedData);
                          setTimeout(() => resolve(), 500);
                        } else {
                          const updatedData = [...fuelDetails];
                          updatedData[oldRow.tableData.id] = newRow;
                          setFuelDetails(updatedData);
                          setTimeout(() => resolve(), 500);
                        }
                      }),
            
                    onRowDelete: (oldData) =>
                      new Promise((resolve, reject) => {
                        setTimeout(() => {
                          if (oldData.id) {
                            dispatch(
                              deleteFuelPriceListAction(
                                oldData.id,
                                setModalTypeHandler,
                                setLoaderStatusHandler,
                              )
                            );
                            resolve();
                          } else {
                            const dataDelete = [...fuelDetails];
                            const index = oldData.tableData.id;
                            dataDelete.splice(index, 1);
                            setFuelDetails([...dataDelete]);
                            resolve();
                          }
                        }, 1000);
                      }),
                  }
                : undefined
            }
            
              actions={[
                (rowData) => ({
                  icon: () => (
                    <div style={{display: 'flex' , fontSize:cellStyle.fontSize,fontWeight:cellStyle.fontWeight}}>
                      <Typography color='primary'>
                        {rowData.id ? 'View' : 'Generate'}
                      </Typography>
                    </div>
                  ),
                  onClick: (event, rowData) => {
                    setOpen(true);
                    setSelectedRow(rowData);

                    const tempObj = {
                      date: moment(rowData.date).format('YYYY-MM-DD'),
                      fuelPrice: rowData.fuelPrice,
                      fuelType: rowData.fuelType,
                    };
                    if (rowData.id) {
                      apiCalls(
                        setModalTypeHandler,
                        setLoaderStatusHandler,
                        dispatch(getAllowanceListAction(rowData.id)),
                      );
                    } else {
                      apiCalls(
                        setModalTypeHandler,
                        setLoaderStatusHandler,
                        dispatch(getTravelDetailsAction(tempObj)),
                      );
                    }
                  },
                  tooltip: 'Match',
                  isFreeAction: false,
                }),
              ]}
              onPageChange={async (page) => {
                await setCurrentPage(page);
              }}
              options={{
                
                                headerStyle,
                cellStyle,
                search: false,
                exportButton: true,
                filtering: false,
                actionsColumnIndex: -1,
                pageSize: 20,
                maxBodyHeight: maxBodyHeight,
                pageSizeOptions: [20, 50, 100],
                initialPage: currentPage,
              }}

              icons={{
                
                Add: () => <AddIcon style={{ color: "black" }} />,
                
              }}
              columns={[
                {
                  title: 'Date',
                  field: 'date',
                  type: 'date', 
                  editComponent: ({ value, onChange }) => (
                    <LocalizationProvider dateAdapter={DateAdapter}>
                      <DatePicker
                        value={moment(value, 'YYYY-MM-DD')}
                        onChange={(newValue) => {
                          onChange(moment(newValue).format('YYYY-MM-DD'));
                        }}
                        renderInput={(params) => <TextField {...params} variant="standard" fullWidth />}
                      />
                    </LocalizationProvider>
                  ),
                },
                {
                  title: 'Fuel Type',
                  field: 'fuelType',
                  validate: (rowData) => Boolean(rowData.fuelType),
                  editComponent: ({value, onChange, rowData}) => (
                    <Select
                      value={value}
                      label='Choose fuel'
                      fullWidth='true'
                      variant='standard'
                      onChange={(event) => {
                        onChange(event.target.value);
                      }}
                      MenuProps={{
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left',
                        },
                        getContentAnchorEl: null,
                      }}
                    >
                      {fuelType.map((item) => (
                        <MenuItem key={item} value={item}>
                          {item}
                        </MenuItem>
                      ))}
                    </Select>
                  ),
                },
                {
                  title: 'Price per litre',
                  field: 'fuelPrice',
                  type: 'numeric',
                  render: (rowData) => rowData.fuelPrice.toFixed(2),
                  headerStyle: {
                    // display:'flex',
                    // justifyContent:'center',
                    textAlign: 'center',
                    padding: '0px',
                  },
                  cellStyle: {
                    textAlign: 'right',
                    // paddingRight: '120px',
                    fontSize:cellStyle.fontSize,
                    fontWeight:cellStyle.fontWeight
                  },
                  validate: (rowData) => Boolean(rowData.fuelPrice > 1),
                },
              ]}
              title={
                <Typography
                  variant='h6'
                  align='left'
                  style={{paddingTop: '10px', paddingBottom: '10px'}}
                >
                  Fuel Price
                </Typography>
              }
              data={fuelDetails}
            />
          </Grid>
        ) : (
          <Grid size={{ sm: 12, md: 12, lg: 12 }} xx={12}>
            <MaterialTable
              actions={[]}
              editable={{
                onRowAdd: (newRow) =>
                  new Promise((resolve, reject) => {
                    setMileageDetails([...mileageDetails, newRow]);

                    setTimeout(() => resolve(), 500);
                  }),

                onRowUpdate: (newRow, oldRow) =>
                  new Promise((resolve, reject) => {
                    console.log("Old Row:", oldRow);
                    console.log("New Row:", newRow);
                    const updatedData = [...mileageDetails];
                    updatedData[oldRow.tableData.id] = newRow;
                    setMileageDetails(updatedData);
                    setTimeout(() => resolve(), 500);
                  }),
                onRowDelete: (oldData) =>
                  new Promise((resolve, reject) => {
                    setTimeout(() => {
                      const dataDelete = [...mileageDetails];
                      const index = oldData.tableData.id;
                      dataDelete.splice(index, 1);
                      setMileageDetails([...dataDelete]);
                      resolve();
                    }, 1000);
                  }),
              }}
              options={{
                toolbar:{
                  onRowAdd:<AddIcon/>
                },
                
                headerStyle,
                cellStyle,
                search: false,
                exportButton: true,
                filtering: false,
                actionsColumnIndex: -1,
                maxBodyHeight: maxBodyHeight,
                pageSizeOptions: [20, 50, 100],
                pageSize: 2,
              }}
              columns={[
                {
                  title: 'Date',
                  field: 'date',
                  // type: 'date', 
                  editComponent: ({value, onChange, rowData}) => (
                    <LocalizationProvider dateAdapter={DateAdapter}>
                      <DatePicker
                        value={moment(value, 'DD-MM-YYYY')}
                        onChange={(newValue) => {
                          onChange(moment(newValue).format('DD-MM-YYYY'));
                        }}
                        renderInput={(params) => <TextField {...params} variant="standard" fullWidth />}
                      />
                    </LocalizationProvider>
                  ),
                },
                {
                  title: 'Name',
                  field: 'salesManName',
                  validate: (rowData) => Boolean(rowData.salesManName),
                  editComponent: ({
                    value,
                    onChange,
                    rowData,
                    onRowDataChange,
                  }) => (
                    <Select
                      value={value}
                      label="Choose Name"
                      fullWidth
                      onChange={(event) => {
                        const selectedValue = event.target.value.trim();
                        // console.log("selectedValue",selectedValue)
                        const selectedItem = salesManList.find((item) => {
                          const formattedName = item.last_name ? `${item.first_name} ${item.last_name}` : item.first_name;
                          return formattedName === selectedValue;
                        });

                        if (selectedItem) {
                          onChange(selectedValue);
                          const updatedRow = {
                            ...rowData,
                            bike: selectedItem.bike_name,
                            mileage: selectedItem.mileage === null ? '' : parseInt(selectedItem.mileage, 10),
                            attendanceIdList: [],
                            salesManName: selectedValue,
                            empId: parseInt(selectedItem.empId, 10),
                          };
                          onRowDataChange(updatedRow);
                        }
                      }}
                    >
                      {salesManList.map((item) => (
                        <MenuItem
                          style={{ textTransform: "capitalize" }}
                          key={item.id}
                          value={item.last_name ? `${item.first_name} ${item.last_name}` : item.first_name}
                        >
                          {item.last_name ? `${item.first_name} ${item.last_name}` : item.first_name}
                        </MenuItem>
                      ))}
                    </Select>

                  ),
                },
                {
                  title: 'Employee Id',
                  field: 'empId',
                  editable: 'never',
                  hidden: true,
                },
                {
                  title: 'Bike',
                  field: 'bike',
                  editable: 'never',
                  initialEditValue: selectedRow.bike_name,
                },
                {
                  title: 'Mileage',
                  field: 'mileage',
                  editable: 'never',
                  initialEditValue: selectedRow.mileage,
                },
                {
                  title: 'Fuel price',
                  field: 'fuelPrice',
                  editable: 'never',
                  initialEditValue: parseInt(selectedRow.fuelPrice),
                },
                {
                  title: 'Fuel Type',
                  field: 'fuelType',
                  editable: 'never',
                  initialEditValue: selectedRow.fuelType,
                },
                {
                  title: 'Km traveled',
                  field: 'kmTraveled',
                  type: 'numeric',
                  headerStyle: {
                    textAlign: 'right',
                    padding: '0px',
                  },
                  cellStyle: {
                    textAlign: 'right',
                    fontSize:cellStyle.fontSize,
                    fontWeight:cellStyle.fontWeight
                  },
                  validate: (rowData) => Boolean(rowData.kmTraveled),
                  editComponent: (props) => (
                    <TextField
                      type="number"
                      value={props.value || ''}
                      onChange={(e) => {
                        const km = parseFloat(e.target.value) || 0;
                        const fuelPrice = parseFloat(props.rowData.fuelPrice) || 0;
                        const allowance = km * fuelPrice;

                        props.onRowDataChange({
                          ...props.rowData,
                          kmTraveled: km,
                          allowance: parseFloat(allowance.toFixed(2)),
                        });
                      }}
                      style={{ width: '100%' }}
                    />
                  )
                },

                {
                  title: 'Allowance',
                  field: 'allowance',
                  type: 'numeric',
                  validate: (rowData) => Boolean(rowData.allowance),
                  render: (rowData) =>
                    rowData.allowance ? rowData.allowance.toFixed(2) : '0.00',
                  headerStyle: {
                    textAlign: 'right',
                    padding: '0px',
                  },
                  cellStyle: {
                    textAlign: 'right',
                    fontSize:cellStyle.fontSize,
                    fontWeight:cellStyle.fontWeight
                  },
                },
              ]}
              title={
                <Typography
                  variant='h6'
                  align='left'
                  style={{paddingTop: '10px', paddingBottom: '10px'}}
                >
                  Mileage
                </Typography>
              }
              data={mileageDetails}
            />
            <Grid
              style={{
                marginTop: '20px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <Button
                variant='outlined'
                onClick={() => {
                  setOpen(false);
                }}
              >
                Close
              </Button>
              <Button
                variant='contained'
                disabled={mileageDetails.length <= 0}
                onClick={() => {
                  handleSubmit(mileageDetails, selectedRow);
                }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        )}
      </Grid> */}
      <Grid container style={{  padding: 2, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
        <Grid
          style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
          size={12}>
          {/* <Paper style={{ flex: 1, display: 'flex', flexDirection: 'column' }}> */}
                  <MaterialTable
                   style={{height: 'calc(100vh - 80px)'}}
                    title=""
                    columns={[
                      {
                        title: 'Date',
                        field: 'date',
                        render: rowData => {
                          const dateObj = new Date(rowData.date);
                          return dateObj.toLocaleDateString('en-GB');
                        }
                      },
                      {
                        title: 'Fuel Type',
                        field: 'fuelType'
                      },
                      {
                        title: 'Type',
                        field: 'type',
                        render: rowData => rowData.type === 0 ? 'Automatic' : 'Manual'
                      }
                    ]}
                    data={fuelDetails.data || []}
                    options={getStickyTableOptions({
                      headerStyle: {
                        fontWeight: 'bold',
                      },
                       bodyOffset: 200,
                      options:{  // search: false,
                      paging: true,
                      // maxBodyHeight: '77vh',
                      pageSize: numPerPage,
                       tableLayout: "auto",
                       toolbar: true,
                      pageSizeOptions: [20, 50, 100],
                      }
                    })}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                     components={{
                      ...stickyTableComponents,
                      // Pagination: (props) => (
                      //                           <div
                      //                           style={{
                      //                             display: "flex",
                      //                             justifyContent: "flex-end",
                      //                             alignItems: "center",
                      //                              padding: "8px 16px",
                      //                              }}>
                      //                               <MTablePagination
                      //                               {...props}
                      //                               count={countSchemesReceivables} 
                      //                               page={page}
                      //                               onPageChange={(event, page) => handlePageChange(page)}
                      //                               onRowsPerPageChange={(event) => handlePageSizeChange(Number(event.target.value))}/>
                      //                               </div>),
                      Toolbar: props => (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '16px 24px'
                        }}>
                          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Fuel Allowance</div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CommonSearch
                              searchVal={searchVal}
                              cancelSearch={cancelSearch}
                              requestSearch={requestSearch}
                            />
                            {FuelAllowanceAddRights && (<AddIcon
                              onClick={handleAddClick}
                              style={{ color: 'black', cursor: 'pointer' }}
                            />)}
                          </div>
                        </div>
                      ),
                    }}
                  />
                {/* </Paper> */}
              </Grid>
            </Grid>
      <FuelAllowanceForm open={open} onClose={handleCloseFuelForm} />
    </>
  );
}

