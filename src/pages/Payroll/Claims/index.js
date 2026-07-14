import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import { approvedClaimsAction, getSearchApprovedClaimAction, getSearchClaimAction, setSearchApprovedClaimAction, setSearchClaimAction } from 'redux/actions/loan_actions';
import { maxBodyHeight, maxHeight, headerStyle, cellStyle } from 'utils/pageSize';
import CommonSearch from 'utils/commonSearch';
import context from '../../../context/CreateNewButtonContext';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Dialog, IconButton , Menu, Typography,Grid,FormControl,Button, TextField, TablePagination} from '@mui/material';
import { get_search_company_based_employee, set_search_company_based_employee ,getEmpbasecompanyFilterAction} from 'redux/actions/attendance_actions';
import CommonUserAutoComplete from 'utils/commonAutoCompleteForUser';
import CloseIcon from '@mui/icons-material/Close';
import { GET_EMP_BASECOMPANY_FILTER } from 'redux/actionTypes';
import { getDateFormat } from 'utils/getTimeFormat';
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterDateFns as AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { getsessionStorage } from 'pages/common/login/cookies';
import NewRequest from 'pages/Payroll/LeaveRequest/NewRequest';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ClaimsDetailPage from './ClaimsDetailPage'
import toMomentOrNull from 'utils/DateFixer';
import {
  getStickyTableOptions,
  stickyTableComponents,
} from 'utils/stickyTableLayout';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import apiCalls from 'utils/apiCalls';

const Claims = (props) => {
  const dispatch = useDispatch();
  const [searchString, setSearchString] = useState('')
  const [pageCount, setPageCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filteropen, setFilterOpen] = useState(false)
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [selectedAll, setSelectedAll] = useState(false);
  const [value, setValue] = useState([]);
  const [employee_id, setemployee_id] = useState([]);
  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');
  const [userSelectError, setUserSelectError] = useState('');
  const [fromDate, setFromDate] = useState(null); 
  const [toDate, setToDate] = useState(null); 
  const [openClaimsDialog, setOpenClaimsDialog] = useState(false);
  const [rowData,setRowData] = useState()
  const [openDetailsPage,setOpenDetailsPage] = useState()
  const [index,setIndex] = useState(0)

  const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setModalTypeHandler,
    commoncookie,
  } = useContext(context);

  const storage = getsessionStorage();

  
  const EmployeeRole = storage.role_name === "Employee"
  const EmployeeId = storage.employee_id


  const { LoanReducer: { approvedClaims }, attendanceReducer: { searchCompanyBasedEmployeeFilter, getCompanyBasedEmployeeFilter }, rbacReducer: { menuAccess } } = useSelector(state => state)

  const selectedRole = storage.role_name
  useEffect(() => {
    if (!selectedRole) return;
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
  }, [selectedRole, dispatch]);

  const claimCreate = storage.company_type === 5 ? UserRightsAuthorization(menuAccess[selectedRole], 'claims', 'can_create') : true;
  // console.log("claimCreate", claimCreate, selectedRole)

  const handlePageChange = async (page) => {
    setPageCount(page);
}

const handlePageSizeChange = async (size) => {
  setPageCount(0);
  setPageSize(size);
};

const handleCloseClaimsDialog = () => {
  setOpenClaimsDialog(false);
};
  // useEffect(() => {
  //   const fetchApprovedClaims = async () => {
  //     try {
  //       await dispatch(approvedClaimsAction());
  //     } catch (error) {
  //       console.error("Error fetching approved claims:", error);
  //     } 
  //   };
  //   fetchApprovedClaims();
  // }, [dispatch]);

  useEffect(() => {
    let data1 = {
      searchString:""
    }
    dispatch(getEmpbasecompanyFilterAction(data1,(res)=>{
      dispatch({
        type: GET_EMP_BASECOMPANY_FILTER,
        payload: res,
      });
    }))
  }, [dispatch]);


  useEffect(() => {
    const fetchClaimsData = () => {
      const data = {
        pageCount: pageCount,
        numPerPage: pageSize,
        searchString: searchString,
        employee_id: employee_id.length > 0 ? employee_id : null,
        fromDate: fromDate ? getDateFormat(fromDate) : null, 
        toDate: toDate ? getDateFormat(toDate) : null
      };

      dispatch(approvedClaimsAction(
        data,
        commoncookie,
        setModalTypeHandler,
        setLoaderStatusHandler
      ));
    };

    fetchClaimsData();
  }, [pageCount, pageSize, searchString]);


  const cancelSearch = () => {
    setSearchString('');
    setPageCount(0);
    setEmployeeFilter('');
    setemployee_id([]);
    setFromDate(null);
    setToDate(null);
    dispatch(setSearchApprovedClaimAction());
    const body = {
      searchString: '',
      pageCount: 0,
      numPerPage: pageSize,
    };
    dispatch(
      getSearchApprovedClaimAction(
        body,
        commoncookie,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
  };

        const requestSearch = (e) => {
          let val = e.target.value;
          setPageCount(0);
          setSearchString(val)
          setEmployeeFilter(''); 

          dispatch(setSearchApprovedClaimAction())
          const body = {
            searchString: val,
            pageCount: 0,
            numPerPage: pageSize,
          };
          dispatch(getSearchApprovedClaimAction(
              body,
              commoncookie,
              setModalTypeHandler,
              setLoaderStatusHandler,
          ))
        }

  
        const handleOpen = (data) => {
          setFilterOpen(data)
        }

        const applyFilter = () => {
          setPageCount(0);
          setSearchString('');
        setFilterOpen(false)
        let employees = null
        if(value.length > 0) {
          employees = value.map((d) => d.employee_id)
          setemployee_id(employees)
        }
        const filterPayload = {
          pageCount: 0,
          numPerPage: pageSize,
          searchString:'',
          employee_id: EmployeeRole ? [EmployeeId] : employees,
          fromDate: fromDate ? getDateFormat(fromDate) : null, 
          toDate: toDate ? getDateFormat(toDate) : null,
        };
        dispatch(approvedClaimsAction(
          filterPayload,
          commoncookie,
          setModalTypeHandler,
          setLoaderStatusHandler
        ));
      }

      const handleClear = () => {
        setPageCount(0);
        setSearchString('');
        setFromDate(null);
        setToDate(null);
        setValue([]);
        setemployee_id([]);
        setFilterOpen(false);
        dispatch(approvedClaimsAction({
          pageCount: 0,
          numPerPage: pageSize,
          searchString:'',
          employee_id: undefined,
          fromDate: null,
          toDate: null
        }));
      };

      const requestSearchEmployeeFilter = (val) => {

        setSearchValEmployeeFilter(val);
        dispatch(set_search_company_based_employee([]));
      
        if (!val) {
          return
        }
      
        let data = {
          searchString: val
        }
        dispatch(
          get_search_company_based_employee(
            data,
            setModalTypeHandler,
            setLoaderStatusHandler,
          ),
        );
      
      };

        const handleChangeEmployeeName =(val)=>{
          setValue(val)
          if(val?.length > 0){
            setUserSelectError('');
          }
        }
        
  const AdminRole = storage.role_name !== "Employee"

  useEffect(()=>{
    if(index === 0){
      return 
    }
    setRowData(approvedClaims.data[index])
  },[index])

  return (
    <div>
      {!openDetailsPage &&
      <MaterialTable
        title={<Typography className='page-title'>Claims</Typography>}
        components={{
          ...stickyTableComponents,
          Toolbar: (props) => (
            <div>
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
                  <Grid
                    display='flex'
                    justifyContent='flex-end'
                    alignItems='center'
                    size={{
                      lg: 4,
                      md: 4,
                      sm: 4,
                      xs: 12
                    }}>
                    <CommonSearch
                      searchVal={searchString}
                      cancelSearch={cancelSearch}
                      requestSearch={requestSearch}
                    />
                   
                    {/* <IconButton
                      onClick={() => {
                        setFilterOpen(true);
                      }}
                    >
                      <FilterAltIcon />
                    </IconButton> */}
                  </Grid>

                </div>
              </div>
            </div>
          ),
          Pagination: () => (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                padding: '8px 16px',
              }}
            >
              <TablePagination
                component='div'
                count={approvedClaims?.numRows || 0}
                page={pageCount}
                rowsPerPage={pageSize}
                rowsPerPageOptions={[20, 50, 100]}
                onPageChange={(event, newPage) => handlePageChange(newPage)}
                onRowsPerPageChange={(event) =>
                  handlePageSizeChange(parseInt(event.target.value, 10))
                }
                labelRowsPerPage='Rows per page:'
              />
            </div>
          ),
        }}
        page={pageCount}
        onPageChange={(page) => handlePageChange(page)}
        onRowsPerPageChange={(size) => handlePageSizeChange(size)}
        actions={[
          claimCreate && {
              icon: 'add',
              tooltip: 'Add',
              isFreeAction: true,
              iconProps: {
                style: { marginTop: 5 },
              },
              onClick: () => setOpenClaimsDialog(true),
            },
          {
            icon: () => (
              <div >
                <IconButton
                      onClick={() => {
                        setFilterOpen(true);
                      }}
                    >
                      <FilterAltIcon />
                    </IconButton> 
              </div>
            ),
            tooltip: 'Filter',
            isFreeAction: true,
          },
        ]}
        columns={[
          {
            title: 'Claim Number', 
            field: 'claim_number',
          },

          {
            title: 'Emp Code',
            field: 'employeeId',
          },

          {
            title: 'Employee',
            field: 'full_name',
          },

          {
            title: 'Bill Date',
            field: 'bill_date',
            render: rowData => moment(rowData.bill_date).format('DD/MM/YYYY')
          },

          {
            title: 'Bill Amount',
            field: 'bill_amount',
            cellStyle: { textAlign: 'right', fontSize: cellStyle.fontSize, paddingRight: '50px' },
          },

          {
            title: 'Requested Claim Amount',
            field: 'claim_amount',
            cellStyle: { textAlign: 'right', fontSize: cellStyle.fontSize, paddingRight: '50px' },
          },
          {
                title: '',
                field: 'Payment',
                // hidden: storage.role_name === 'employee',
                render: (rowData) => (
                  <IconButton onClick={() => { setRowData(rowData); setOpenDetailsPage(true); }}>
                    <VisibilityIcon />
                  </IconButton>
                ),
          },
        ]}
        data={approvedClaims.data || []}
        totalCount={approvedClaims.numRows || 0}
        options={getStickyTableOptions({
          bodyOffset: 210,
          headerStyle,
          options: {
            search: false,
            pageSize: pageSize,
            paging: true,
            pageSizeOptions: [20, 50, 100],
            maxBodyHeight: maxBodyHeight,
            minBodyHeight: maxBodyHeight,
            cellStyle: cellStyle,
            tableLayout: 'auto',
            toolbar: true,
          },
        })}
      />
      }
      {
        openDetailsPage && (
          <>
            <ClaimsDetailPage
              handleClose = {()=> setOpenDetailsPage(false)}
              rowData = {rowData}
              data = {approvedClaims.data}
              setIndex ={setIndex}
            />
          </>
        )
      }
      {filteropen === true && (
                    <Dialog
                      open={filteropen}
                      onClose={() => setFilterOpen(false)}
                    >
                      <div style={{display: 'flex', justifyContent: 'end'}}>
                        <IconButton onClick={() => setFilterOpen(false)}>
                          <CloseIcon />
                        </IconButton>
                      </div>

                      <Grid container gap={2} padding='20px'>
                        <Grid container spacing={2} size={12}>
                          {AdminRole &&
                            <Grid size={12}>
                              <FormControl fullWidth variant='filled'>
                                <CommonUserAutoComplete
                                  searchVal={searchValEmployeeFilter}
                                  requestSearch={requestSearchEmployeeFilter}
                                  cancelSearch={cancelSearch}
                                  value={value}
                                  setValue={handleChangeEmployeeName}
                                  type={getCompanyBasedEmployeeFilter}
                                  searchType={searchCompanyBasedEmployeeFilter}
                                  selectedAll={selectedAll}
                                  setSelectedAll={setSelectedAll}
                                />
                              </FormControl>
                            </Grid>
                          }

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
                                value={toMomentOrNull(fromDate)}
                                format='DD/MM/YYYY'
                                disableFuture
                                onChange={(date) => setFromDate(date)}
                                views={['year', 'month', 'day']}
                                slotProps={{ textField: { variant: 'filled', fullWidth: true } }}
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
                                value={toMomentOrNull(toDate)}
                                format='DD/MM/YYYY'
                                disableFuture
                                onChange={(date) => setToDate(date)}
                                views={['year', 'month', 'day']}
                                slotProps={{ textField: { variant: 'filled', fullWidth: true } }}
                              />
                            </LocalizationProvider>
                          </Grid>

                          <Grid
                            container
                            spacing={2}
                            justifyContent='center'
                            alignItems='center'
                            gap={2}
                            style={{marginTop: '20px'}}
                            size={12}>
                            <Grid
                              size={{
                                sm: 3,
                                xs: 12
                              }}>
                              <Button
                                fullWidth
                                onClick={handleClear}
                                variant='contained'
                                color='warning'
                              >
                                Clear
                              </Button>
                            </Grid>
                            <Grid
                              size={{
                                sm: 3,
                                xs: 12
                              }}>
                              <Button
                                fullWidth
                                onClick={applyFilter}
                                variant='contained'
                              >
                                Apply
                              </Button>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Dialog>
                  )}
      {openClaimsDialog && (
<NewRequest
page={"CLAIMS"}
open={openClaimsDialog}
handleClose={handleCloseClaimsDialog}
buttonType={'5'}
tabType={'5'}
/>
)}
    </div>
  );
};

export default Claims;

