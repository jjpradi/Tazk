import React, { useContext, useEffect, useState } from 'react';
import {
    Container,
    Grid,
    MenuItem,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
    Box,
    alpha,
    Typography,
    IconButton,
    Dialog,
    DialogContent,
    Button,
    TextField,
    Card,
} from '@mui/material';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import AddCardIcon from '@mui/icons-material/AddCard';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import SchoolIcon from '@mui/icons-material/School';
import CardTravelIcon from '@mui/icons-material/CardTravel';
import InfoIcon from '@mui/icons-material/Info';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import { useDispatch, useSelector } from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseIcon from '@mui/icons-material/Close';
import { maxBodyHeight, maxHeight, pageSize, headerStyle, cellStyle } from 'utils/pageSize';
import { employeeVerificationDetailsAction, getEmpbasecompanyAction, getEmpbasecompanyFilterAction, get_search_company_based_employee, set_search_company_based_employee } from 'redux/actions/attendance_actions';
import {
    completedIndexValue,
    employeeDetailAction,
} from 'redux/actions/userCreation_actions';
import StepperDesign from '../../../components/employeeVerification/stepper';
import EmployeeDetails from '../../../components/employeeVerification/employeeDetails';
import Documents from 'components/employeeVerification/documents';
import { AppAnimate } from '../../../@crema';
import CommonUserAutoCompleteForSingleUser from 'utils/commonAutoCompleteForSingleUser';
import { EMPLOYEE_VERIFICATION_DETAILS, GET_EMP_BASECOMPANY_FILTER } from 'redux/actionTypes';
import EmployeeVerification from './test';
import {
  getStickyTableOptions,
  stickyTableComponents,
} from 'utils/stickyTableLayout';


export default function EmployeeVerificationList() {

    const [pageSize, setPageSize] = useState(20)
    const [pages, setPages] = useState(0);
    const [openDetailsPage, setOpenDetailsPage] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterDetails, setFilterDetails] = useState({
        empCode: '',
        employeeName: '',
        department: ''
    });
    const dispatch = useDispatch();
    const {
        attendanceReducer: { get_empbasecompany, searchCompanyBasedEmployeeFilter, getCompanyBasedEmployeeFilter, allempVerificationDetail, employeeVerificationDetails},
    } = useSelector((state) => state);

    useEffect(() => {
        let data1 = {
            searchString: ""
        }
        dispatch(employeeVerificationDetailsAction(data1, (res) => {
            console.log("resss", res)
            dispatch({
                type: EMPLOYEE_VERIFICATION_DETAILS,
                payload: res,
            });
        }))
    }, [openDetailsPage]);


    const handlePageSizeChange = async (size) => {
        setPages(0)
        setPageSize(size)
    };

    const handlePageChange = async (page) => {
        setPages(page)
    };

    const handleIconClick = (rowData) => {
        setSelectedEmployee(rowData.employee_id);
        setOpenDetailsPage(true);
      };
      
      const commonCellStyle = {
        fontFamily: "poppins",
        fontSize: "11px",
        fontWeight: "400",
        color: 'rgba(0, 0, 0, 0.7)',
      };

      const handleFilterDialogOpen = () => {
        setFilterOpen(true)
      }

      const handleFilterDialogClose = () => {
        setFilterOpen(false)
      }

      const handleFilterChange = (field, value) => {
        setFilterDetails({...filterDetails, [field]: value})
      }

      const handleApplyFilter = () => {
        // Build search string from filters
        const searchParts = [];
        if (filterDetails.empCode) searchParts.push(filterDetails.empCode);
        if (filterDetails.employeeName) searchParts.push(filterDetails.employeeName);
        if (filterDetails.department) searchParts.push(filterDetails.department);
        
        const combinedSearchString = searchParts.join(' ');

        let data1 = {
            searchString: combinedSearchString
        }
        dispatch(employeeVerificationDetailsAction(data1, (res) => {
            console.log("resss", res)
            dispatch({
                type: EMPLOYEE_VERIFICATION_DETAILS,
                payload: res,
            });
        }))

        handleFilterDialogClose()
      }

      const handleClearFilter = () => {
        setFilterDetails({empCode: '', employeeName: '', department: ''})
        let data1 = {
            searchString: ""
        }
        dispatch(employeeVerificationDetailsAction(data1, (res) => {
            console.log("resss", res)
            dispatch({
                type: EMPLOYEE_VERIFICATION_DETAILS,
                payload: res,
            });
        }))
        handleFilterDialogClose()
      }

    return (
      <>
        <Helmet>
          <meta charSet='utf-8' />
          <title> {titleURL} | Employee Verification </title>
        </Helmet>

        {openDetailsPage === false && (
          <Card>
            <MaterialTable
             style={{height: 'calc(100vh - 80px)',overflow:'auto'}}
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
                      <div style={{ display: 'flex', gap: '8px', paddingRight: '16px' }}>
                        <Tooltip title='Filter'>
                          <IconButton onClick={handleFilterDialogOpen}>
                            <FilterAltIcon />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>
                  </>
                ),
              }}
              page={pages}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePageSizeChange}
              options={getStickyTableOptions({
                bodyOffset: 200,
                headerStyle,
                options: {
                  cellStyle,
                  paging: true,
                  search: false,
                  pageSize: pageSize,
                  pageCount: pages,
                  pageSizeOptions: [20, 50, 100],
                  tableLayout: 'auto',
                  toolbar: true,
                },
              })}
              columns={[
                {
                  title: 'Emp Code',
                  field: 'emp_code',
                },
                {
                  title: 'Employee',
                  field: 'employeeName',
                },
                {
                  title: 'Verified Count',
                  field: 'total_uploaded_documents',
                },
                {
                  title: 'Verification Date',
                  field: 'verification_date',
                },
                {
                  title: 'Last Verified Date',
                  field: 'verification_date'
                },
                {
                  title: 'Verified By',
                  field: 'verifiedByName'
                },
                {
                  title: 'View',
                  field: '',
                  render: (rowData) => (
                    <IconButton
                      Tooltip='View Details'
                      onClick={() => handleIconClick(rowData)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  ),
                },
              ]}
              data={employeeVerificationDetails}
              title={
                <Typography
                  className='page-title'
                >
                  Employee Verification
                </Typography>
              }
            />
          </Card>
        )}

        {openDetailsPage && (
          <EmployeeVerification
            employeeId={selectedEmployee}
            setOpenDetailsPage={setOpenDetailsPage}
            handleClose={() => {
              setOpenDetailsPage(false);
            }}
          />
        )}

        {filterOpen && 
          <Dialog open={filterOpen}>
            <DialogContent sx={{ p : 5, width : '300px' }}>
              <Box sx={{ display : 'flex', justifyContent : 'flex-end' }}>
                <IconButton onClick={handleFilterDialogClose}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={12}>
                  <TextField
                    fullWidth
                    label='E.Code'
                    variant='filled'
                    value={filterDetails.empCode}
                    onChange={(e) => handleFilterChange('empCode', e.target.value)}
                    placeholder='Search by Employee Code'
                  />
                </Grid>
                <Grid item xs={12} lg={12}>
                  <TextField
                    fullWidth
                    label='Employee Name'
                    variant='filled'
                    value={filterDetails.employeeName}
                    onChange={(e) => handleFilterChange('employeeName', e.target.value)}
                    placeholder='Search by Employee Name'
                  />
                </Grid>
                <Grid item xs={12} lg={12}>
                  <TextField
                    fullWidth
                    label='Department'
                    variant='filled'
                    value={filterDetails.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    placeholder='Search by Department'
                  />
                </Grid>
                <Grid item xs={12} lg={12} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant='contained'
                      color='error'
                      onClick={handleClearFilter}
                    >
                      Clear
                    </Button>
                    <Button
                      variant='contained'
                      onClick={handleApplyFilter}
                    >
                      Apply
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
          </Dialog>
        }
      </>
    );
}

