import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  Button,
  TextField,
  Typography,
  Grid,
  Divider,
  Card,
  IconButton,
  Checkbox,
  FormControlLabel,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  FormHelperText,
  RadioGroup,
  Radio,
  OutlinedInput,
  Box,
  Chip,
  Stack,
  FormLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import CloseIcon from '@mui/icons-material/Close';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {
  maxBodyHeight,
  maxHeight,
  pageSize,
  headerStyle,
  cellStyle,
  font14_500,
} from 'utils/pageSize';
import {
  listSelectUserAction,
  createShiftscheduleAction,
  listScheduleAction,
  updateShiftscheduleAction,
  shiftListPaginationAction,
  deleteShiftScheduleAction,
  getSearchShiftlistAction,
  listDepartment,
  shiftScheduleFilterAction,
  shiftListAction
} from 'redux/actions/shifts.actions';
import {useDispatch, useSelector} from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import CancelIcon from '@mui/icons-material/Cancel';
import {get_searchUserRoleAction, getUserRightsByRoleIdAction} from 'redux/actions/role_actions';
import moment from 'moment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { getDeptBaseEmpFilterAction } from 'redux/actions/attendance_actions';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const select_type = [
  {value: 1, name: 'User Wise'},
  {value: 2, name: 'Role Wise'},
  {value: 3, name: 'Location Wise'},
];
import {capitalize} from 'lodash';
import {getDeptBaseEmpAction, getEmpbasecompanyAction} from 'redux/actions/attendance_actions';
import CommonToolTip from 'components/ToolTip';
import {listStockLocationAction} from 'redux/actions/stock_Location_actions';
import AlertDialog from 'pages/common/Dialog';
import { commonDateFormat } from 'utils/getTimeFormat';
import InfoDialog from './dialog';
import ScheduleShift from './newSchedule';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import {
  getStickyTableOptions,
  stickyTableComponents,
} from 'utils/stickyTableLayout';
import ShiftService from 'services/shifts.services';
import { GET_SCHEDULE_DETAILS } from 'redux/actionTypes';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const headerStyleObj = {
  fontFamily: "Poppins, sans-serif",
  fontSize: "12px",
  fontWeight: 600,
  color: 'rgba(0, 0, 0, 0.7)',
};

export default function ScheduleList({
  rowData,
  handleClose,
  pageCount,
  numPerPage,
  searchString,
}) {
  const storge = getsessionStorage()
  const selectedRole = storge.role_name
  const [newSchedule, setNewSchedule] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState('');
  const [appliedShift, setAppliedShift] = useState('');
  const [page,setPage] = useState(pageCount ?? 0);
  const [pageSize,setPageSize] = useState(numPerPage ?? 20);
  const tableRef = useRef(null);
  const skipFilterRefreshRef = useRef(true);
  const dispatch = useDispatch();
  const deleteId = useRef(null);
  const [searchData, setSearchData] = useState({
    page: 0,
    pageSize: 20,
  }
)
const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);

  const {
    ShiftsReducer: {userwiseselect, getschedule, shiftScheduleFilter, getShiftList},
    roleReducer: {shift_role,user_rights},
    attendanceReducer: {get_empbasecompany, getDeptBaseEmp},
    stockLocationReducer: {stocklocation},
    rbacReducer: { menuAccess }
  } = useSelector((state) => state);

  const schedulelist = getschedule?.schedulelist || [];
  const scheduleTotalCount =
    getschedule?.schedulelistNumRows ??
    getschedule?.numRows ??
    getschedule?.totalCount ??
    0;

  useEffect(() => {
    // dispatch(getUserRightsByRoleIdAction())
    dispatch(getMenuAccessAction(selectedRole))
  },[])

  useEffect(()=>{
    const data ={
      searchString :''
     }
    dispatch(shiftListAction())
    dispatch(
      listDepartment(data,(response) => {
        if (response.length) {
          let allDept = response.map((d) => d.department);
          let data = {
            department: allDept,
            searchString: ''
          };
          dispatch(getDeptBaseEmpFilterAction(data));
        }
      }),
    );
  },[])

  useEffect(() => {
    if (skipFilterRefreshRef.current) {
      skipFilterRefreshRef.current = false;
      return;
    }

    tableRef.current?.onQueryChange({
      page: 0,
      pageSize,
    });
  }, [appliedShift])

  const handleScheduleDelete = () => {
    console.log(deleteId.current,'deleteiddd')
    dispatch(
      deleteShiftScheduleAction(
        deleteId.current,
        setModalTypeHandler,
        setLoaderStatusHandler,
        (response) =>{
          if(response.status === 200){
            tableRef.current?.onQueryChange()
          }
        }
      ),
    );
    setDeleteOpen(false)
  };

  const handleChange = (event) => {
    setSelectedShift(event.target.value);
    // You can add any additional logic or state updates here
  };

  const uniqueShiftNames = Array.from(new Set(getShiftList.map((schedule) => schedule.shift_name)));

  const applyFilter = () => {
    setPage(0)
    setAppliedShift(selectedShift)
    setFilterOpen(false)
  }

  const handleClear = () => {
    setSelectedShift('');
    setSearchData({
      page: 0,
      pageSize: 20,
    });
    setPage(0);
    setPageSize(20);
    setAppliedShift('');
    setFilterOpen(false);
  };

  const handlePageSizeChange = async (size) => {
    setPage(0)
    setPageSize(size)
  }
  const handlePageChange = async (page) => {
    setPage(page)
  }
 
  const scheduleCreate = UserRightsAuthorization(menuAccess[selectedRole], 'shifts__schedule_shift', 'can_create')
  const scheduleEdit = UserRightsAuthorization(menuAccess[selectedRole], 'shifts__schedule_shift', 'can_edit')
  const scheduleDelete = UserRightsAuthorization(menuAccess[selectedRole], 'shifts__schedule_shift', 'can_delete')

  return (
    <>
      {filterOpen === true && <Dialog open={filterOpen}  onClose={()=> setFilterOpen(false)}>
      <div style={{display: 'flex', justifyContent: 'end'}}>
            <IconButton
              onClick={() => setFilterOpen(false)}
            >
              <CloseIcon />
            </IconButton>
            </div>
      <Grid container gap={2} padding='20px'>
      <Grid
        width='150px'
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <FormControl variant='filled' component='fieldset' fullWidth={true}>
          <InputLabel>Shift Name</InputLabel>
          <Select
            style={{ textAlign: 'left' }}
            name='emp_id'
            label='Shift Name'
            onChange={handleChange}
            fullWidth={true}
            value={selectedShift}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 200,
                  overflowY: 'auto',
                },
              },
            }}
          >
            {uniqueShiftNames.map((shiftName, index) => (
              <MenuItem value={shiftName} key={index}>
                {shiftName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
                  <Grid container style={{ display: 'flex', justifyContent: 'center' }} gap={2}>
              <Grid
                marginTop='20px'
                size={{
                  lg: 5,
                  md: 5,
                  sm: 5,
                  xs: 5
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
                marginTop='20px'
                size={{
                  lg: 5,
                  md: 5,
                  sm: 5,
                  xs: 5
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
      </Dialog>}
      {!newSchedule ? (
        <Card>
          {/* <Grid
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 10px',
              alignItems: 'center',
            }}
          >
            <Typography variant='h6'>
              {' '}
              Shift Name : {rowData?.shift_name || ''}
            </Typography>
            <Button
              variant='contained'
              color='warning'
              onClick={() => {
                handleClose();
              }}
            >
              Back
            </Button>
          </Grid> */}
          <MaterialTable
          tableRef={tableRef}
          totalCount={scheduleTotalCount}
            components={{
              ...stickyTableComponents,
              Toolbar: (props) => (
                <>
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
                    <CommonToolTip title="Filter">
                  <IconButton onClick={() => {setFilterOpen(true)}}>
                    <FilterAltIcon style={{ color: 'gray' }} />
                  </IconButton>
                </CommonToolTip>
                  </div>
                </>
              ),
              
            }}
            options={getStickyTableOptions({
              bodyOffset: 200,
              headerStyle,
              options: {
                cellStyle,
                paging: true,
                pageSize: pageSize,
                pageSizeOptions: [20, 50, 100],
                actionsColumnIndex: -1,
                toolbar: true,
              },
            })}
            data={(query) =>
              new Promise((resolve) => {
                const nextPage = query.page ?? 0;
                const nextPageSize = query.pageSize ?? 20;
                const payload = {
                  pageCount: nextPage,
                  numPerPage: nextPageSize,
                  shift_name: appliedShift,
                };

                setPage(nextPage);
                setPageSize(nextPageSize);

                ShiftService.getscheduledetails(rowData?.id ?? null, payload)
                  .then((res) => {
                    const responseData = res?.data || {};
                    const totalCount =
                      responseData?.schedulelistNumRows ??
                      responseData?.numRows ??
                      responseData?.totalCount ??
                      0;

                    dispatch({
                      type: GET_SCHEDULE_DETAILS,
                      payload: responseData,
                    });

                    resolve({
                      data: responseData?.schedulelist || [],
                      page: nextPage,
                      totalCount,
                    });
                  })
                  .catch(() => {
                    resolve({
                      data: [],
                      page: 0,
                      totalCount: 0,
                    });
                  });
              })
            }
            actions={[
              ...(scheduleCreate  ? [{
                icon: 'add',
                tooltip: 'Add Shift',
                isFreeAction: true,
                onClick: (event, rowData) => setNewSchedule(true),   
              }] : []),

              ...(scheduleEdit ? [(rowData) => ({
                icon: () => 
                <EditIcon />,
                tooltip: 'Edit',
                onClick: (event, rowData) => {
                  setNewSchedule(true);
                  setEditData(rowData);
                },
              })] : []),
              ...(scheduleDelete ? [(sch_rowData) => ({
                icon: () => <DeleteIcon />,
                tooltip: 'Delete Shift',
                onClick: (event, sch_rowData) => {
                  deleteId.current = {
                    schedule_id : sch_rowData.id,
                    shift_id : sch_rowData.shift_id,
                    startDate : sch_rowData.startDate,
                    endDate : sch_rowData.endDate
                   };
                  setDeleteOpen(true);
                 },
              })] : []),
            ]}
            // page={this.state.page}
            // onPageChange={(page) => this.handlePageChange(page)}
            // onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}
            columns={[
              // {title: 'Schedule Id', field: 'id'},
              {
                title: 'Shift Name',
                field: 'shift_name',
                headerStyle: headerStyleObj,
              },
              {
                title: 'Shift Code',
                field: 'shift_short_code',
                headerStyle: {
                  fontFamily: "poppins",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: 'rgba(0, 0, 0, 0.7)'
                },
              },
              {
                title: 'Date Range',
                field: 'month_date_wise',
                headerStyle: {
                  fontFamily: "poppins",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: 'rgba(0, 0, 0, 0.7)'
                },
                render: (rowData) =>(<div className='table-content'>{
                  rowData.month_date_wise === 'MONTH_WISE'
                    ? 'Whole month'
                    : 'Between Dates'}</div>)
              },
              {
                title: 'Start Date',
                field: 'startDate',
                headerStyle: {
                  fontFamily: "poppins",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: 'rgba(0, 0, 0, 0.7)'
                },
                render: (rowData) => (<div className='table-content'>{commonDateFormat(rowData.startDate?.slice(0, 10)) || ''}</div>)
              },
              {
                title: 'End Date',
                field: 'endDate',
                headerStyle: {
                  fontFamily: "poppins",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: 'rgba(0, 0, 0, 0.7)'
                },
                render: (rowData) => (<div className='table-content'>{commonDateFormat(rowData.endDate?.slice(0, 10)) || ''}</div>)
              },
              {
                title: 'Shift Created',
                field: 'createdAt',
                headerStyle: {
                  fontFamily: "poppins",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: 'rgba(0, 0, 0, 0.7)'
                },
                render: (rowData) => (<div className='table-content'>{commonDateFormat(rowData.createdAt?.slice(0, 10)) || ''}</div>)
              },
            ]}
            title={
              <Typography
                className='page-title'
              >
                Schedule List
              </Typography>
            }
          />
        </Card>
      ) : (
        <ScheduleShift
          editData={editData}
          employeeList={getschedule.employeelist || []}
          rowData={rowData}
          handleClose={() => {
            setNewSchedule(false);
            setEditData({});
            }}
            selectedShift={selectedShift}
            pageCount= {page}
            numPerPage = {pageSize}
        />
      )}
      <AlertDialog
        delete={deleteOpen}
        handleClose={() => setDeleteOpen(false)}
        handleDelete={handleScheduleDelete}
        id={deleteId.current}
      />
    </>
  );
}

