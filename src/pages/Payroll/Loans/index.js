import React, { useContext, useEffect, useState } from 'react'
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import { Typography, Grid, Chip, TextField, InputAdornment, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Card, IconButton } from '@mui/material';
import LoanPopup from './indexpopup';
import { employeeLoansAction, filterDataAction, listLoanLedgerDetails, loanDetailsAction, searchLoanAction, setsearchLoanAction, updateLoanStatusAction } from 'redux/actions/loan_actions';
import { useDispatch, useSelector } from 'react-redux';
import apiCalls from 'utils/apiCalls';
import context from '../../../../src/context/CreateNewButtonContext';
import Cookies from 'universal-cookie';
import { getLoginRoleAction } from 'redux/actions/userRole_actions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FilterLoan from './Filterloan';
import { maxBodyHeight, maxHeight, pageSize, headerStyle, cellStyle } from 'utils/pageSize';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import PaymentsIcon from '@mui/icons-material/Payments';
import { clientwebsocket, titleURL } from '../../../http-common'
import { getsessionStorage } from 'pages/common/login/cookies';
import { commonDateFormat, getDateFormat } from 'utils/getTimeFormat';
import CommonSearch from 'utils/commonSearch';
import UserRoleReducer from 'redux/reducers/userRole_reducers';
import { Link, Navigate } from 'react-router-dom';
import Loanpayments from './Loanpayments';
import { TrainOutlined } from '@mui/icons-material';
import notificationType from '../../../firebase/notify_type';
import { CreateNotificationAction } from 'redux/actions/notification_actions';
import { sendNtfy } from '../../../firebase/firebase.service';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import { Helmet } from 'react-helmet-async';
import CommonToolTip from 'components/ToolTip';
import { roleType } from 'utils/roleType';
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LoanDetails from './loanDetails';
import AddIcon from '@mui/icons-material/Add';
import NewRequest from 'pages/Payroll/LeaveRequest/NewRequest';
import { get_search_company_based_employee, set_search_company_based_employee ,getEmpbasecompanyFilterAction} from 'redux/actions/attendance_actions';
import { GET_EMP_BASECOMPANY_FILTER } from 'redux/actionTypes';
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import { roleTypeWithOutEmployee } from '../../../utils/roleType';
import {
  getStickyTableOptions,
  stickyTableComponents,
} from 'utils/stickyTableLayout';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const Loans = (props) => {
  // console.log("props.purpose",props.purpose === 'employee')
  const [open, setOpen] = useState(false)
  const [openpayment, setOpenPayment] = useState(false)
  const [pages, setPages] = useState(0)
  const [pageSize, setPageSize] = useState(props.purpose === 'employee' ? 5 : 20)
  const [admin, setAdmin] = useState(false)
  const [filteropen, setFilterOpen] = useState(false);
  const [selectedAll, setSelectedAll] = useState(false);
  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');
  const [value, setValue] = useState([]);
  const date = new Date();
  const firstDay = getDateFormat(new Date(date.getFullYear(), date.getMonth(), 1));
  const lastDay = getDateFormat(new Date());
  const [searchVal, setSearchVal] = useState('')
 
  const [empNames, setEmpName] = useState([]);
  const [rowdata, setRowdata] = useState();
  const [rowdataempname, setRowdataEmpName] = useState();
  const [isApiFinished, setIsApiFinished] = useState(false);
  const [reasonDialog, setReasonDialog] = useState(false);
  const [rowDataId, setRowDataId] = useState({})
  const [formErrors, setFormErrors] = useState({
    reason: ''
  })
  const [formValues, setFormValues] = useState({
    reason: ''
  })

  const [viewLedgerDetailsDialog, setViewLedgerDetailsDialog] = useState(false)
  const [openDetailsPage, setOpenDetailsPage] = useState(false)
  const [openNewRequestDialog, setOpenNewRequestDialog] = useState(false);
  const storage = getsessionStorage()
  const {
    commoncookie,
    headerLocationId,
  } = useContext(context);
  // console.log("commoncookie",commoncookie)


  const [filteredValue, setFilteredValue] = useState({
    tenure: '',
    frmdate: '', //firstDay,
    todate: '', //lastDay,
    emp_name: '',
    status: '',
    numPerPage: pageSize,
    pageCount: pages,
    searchString: searchVal,
    employeeId: props.purpose === 'employee' ? props?.employee_id : null,
    headerLocationId: headerLocationId,
    type: 'approved'
  });
  const loanStatus = {
    New: 'primary',
    Open: 'secondary',
    'Waiting for Approval': 'warning',
    'Approved': 'success',
    Completed: 'success',
  };
  const approveStatus = {
    'Waiting for Approval': 'success',
    'Approved': 'secondary',
    'issued': 'secondary'
  }
  const [requiredFields] = useState([

    'reason',
  ]);

  const dispatch = useDispatch()
  const Onclose = () => {
    setOpen(false);
    setSearchVal('')
  }
  const CloseLoanPayment = () => {
    setOpenPayment(false)
    setSearchVal('')
  }
  const ViewLedgerDetails = (rowData) => {

    setViewLedgerDetailsDialog(true)

    let data = {
      entity: rowData.loan_number
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listLoanLedgerDetails(
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
      )),
    )

  }
  const CloseLedgerDetails = () => {
    setViewLedgerDetailsDialog(false)
  }
  const {
    commoncookie: currentEmpId,
    setModalTypeHandler,
    setLoaderStatusHandler, } = useContext(context);

  const { LoanReducer: { loansdetail, searchloandata, loanLedgerDetails, employeeLoans, searchloandataCount}, UserRoleReducer:{ loginRole, userRole}
   ,attendanceReducer: { searchCompanyBasedEmployeeFilter,getCompanyBasedEmployeeFilter }, rbacReducer: { menuAccess } } = useSelector(state => state)
  console.log("searchloandata",searchloandata.numRows)
  useEffect(() => {
    if (roleTypeWithOutEmployee.includes(storage.role_name)) {
      setAdmin(true)
    }
  }, [open])

  const selectedRole = storage.role_name

  useEffect(() => {
    if (!selectedRole) return;
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
  }, [selectedRole, dispatch]);

  const loanCreate = storage.company_type === 5 ? UserRightsAuthorization(menuAccess[selectedRole], 'loans', 'can_create') : true;
  const loanDetailsView = storage.company_type === 5 ? UserRightsAuthorization(menuAccess[selectedRole], 'loans', 'can_view') : true;

   useEffect(() => {
    if(filteropen){
        let data1 = {
        searchString:""
      }
      dispatch(getEmpbasecompanyFilterAction(data1,(res)=>{
        dispatch({
          type: GET_EMP_BASECOMPANY_FILTER,
          payload: res,
        });
      }))
    }
    
    }, [filteropen]);

  useEffect(() => {
    if(props.purpose !== 'employee'){
      const cookies = new Cookies();
      let storage = getsessionStorage()
      let emp_id = storage?.employee_id || '';
      if (roleType.includes(storage.role_name)) {
        setAdmin(true)
      }

      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(searchLoanAction(
          filteredValue,
          setModalTypeHandler,
          setLoaderStatusHandler,
        )),
        //dispatch(loanDetailsAction(filteredValue)),
      ).finally(() => setIsApiFinished(true));
      // if(!loginRole.length){
      //   dispatch(
      //     getLoginRoleAction(emp_id, (role_name) => {
      //       if (roleType.includes(role_name)) {
      //         setAdmin(true)
      //       }
      //     })
      //   )
      // }
    }
  }, [open])

  
  
  useEffect(() => {
      let data = {
        page: props.page,
        pageSize: props.pageSize
      }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(employeeLoansAction(props.personId, data))
      )
    

  }, [props.personId, props.purpose]);


  useEffect(() => {
    if (loansdetail.length > 0) {
      let emp_Names = loansdetail?.map((v) => {
        return { name: v?.emp_name }
      })
      setEmpName(emp_Names)
    }
  }, [loansdetail?.length])

  useEffect(() => {
    const body =
    {
      ...filteredValue,
    }
    if(!filteredValue.frmdate){
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(searchLoanAction(
          body,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ))
      );
    }
    else{
      // ApplyButton()
      dispatch(filterDataAction(body))
    }
  }, [filteredValue.numPerPage, filteredValue.pageCount])

  useEffect(() => {

    return () => {
      dispatch({ type: 'LOAN_CLEAR_STATE' }); 
    };
  }, [dispatch]);


  const handleApproval = (rowData) => {
    const approvedBy = storage?.first_name + (storage?.last_name ? ' ' + storage.last_name : '')
    setRowdataEmpName(rowData)
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(updateLoanStatusAction(rowData.id, { type: 'approve', Approvedby: approvedBy, outstanding: rowData }, setModalTypeHandler, setLoaderStatusHandler, () => {}, (response) => {
        if(response === 200){
      // await this.props.getLoanListAction(data, context.setLoaderStatusHandler, context.setModalStatusHandler),
     dispatch(searchLoanAction( filteredValue, () => {}))

        }
      }))
        // .then(() => {
        //   dispatch(searchLoanAction(
        //     filteredValue,
        //     setModalTypeHandler,
        //     setLoaderStatusHandler,
        //   ))
        // }),
    ).finally(() => setIsApiFinished(true))


  };
  const handleReasonClose = () => {
    setReasonDialog(false)
    setFormValues({ reason: '' })
    setFormErrors({ reason: '' })
  }

  const handleOpenReasonDialog = (rowData) => {
    setReasonDialog(true)
    setRowDataId(rowData)
    // setRowdataEmpName(rowData)
    // dispatch(updateLoanStatusAction(rowData.id, { type: 'reject', Rejectedby: empNames, outstanding: rowData })),
    //   //dispatch(loanDetailsAction(filteredValue))
    //   dispatch(searchLoanAction(
    //     filteredValue,
    //     setModalTypeHandler,
    //     setLoaderStatusHandler,
    //   ))

  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const handleRejectSubmit = async (event) => {
    event.preventDefault();
    const canceledBy = storage?.first_name + (storage?.last_name ? ' ' + storage.last_name : '')
    let isValid = true;
    let formErrorsObj = { ...formErrors };
    await Object.keys(formValues).map((key, s) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      }
      return null;
    });
    await setFormErrors(formErrorsObj);
    if (isValid) {
      setRowdataEmpName(rowDataId)
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(updateLoanStatusAction(rowDataId.id, { type: 'Rejected', Rejectedby: canceledBy, reason: formValues.reason }, setModalTypeHandler, setLoaderStatusHandler, () => {}, (response) => {
          if(response === 200){
        // await this.props.getLoanListAction(data, context.setLoaderStatusHandler, context.setModalStatusHandler),
       dispatch(searchLoanAction( filteredValue, () => {}))
  
          }
        })
        )
      ),
        //dispatch(loanDetailsAction(filteredValue))
        dispatch(searchLoanAction(
          filteredValue,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ))
      handleReasonClose()


      //notification part


    }
  }

  const handleReasonChange = (e) => {
    let { name, value } = e.target;
    setStateHandler(name, value);
  }

  const setStateHandler = async (name, value) => {
    let formObj = {};
    formObj = {
      ...formValues,
      [name]: value === '' ? null : value,
    };
    await setFormValues(formObj);
    validationHandler(name, value);
  }
  const validationHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;

    if (name === 'reason') {
      if (value.length > 0) {
        setFormErrors({
          ...formErrors,
          ['reason']: '',
        });
      }
      if (value.length === 0 || null) {
        setFormErrors({
          ...formErrors,
          ['reason']: 'Reason is Required!',
        });
      }
    }
  };

  const handleCloseNewRequestDialog = () => {
    setOpenNewRequestDialog(false);
  };


  const handleClose = () => {
    setFilteredValue({ ...filteredValue, frmdate: "", todate: "", status: "" })
    //  setFilterOpen(false)
    dispatch(searchLoanAction(
          filteredValue,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ))
    setFilterOpen(false)
    setSearchVal('')
    setValue([]);
  }
  const handleOpen = (data) => {
    setFilterOpen(data)
  }
  const ApplyButton = () => {
       const EmployeeRole = storage.role_name === "Employee"
       const EmployeeId = storage.employee_id
     let employees = null
      if(value.length > 0) {
          employees = value.map((d) => d.employee_id)
        }
    const body = {
      tenure: "",
      frmdate: filteredValue.frmdate,
      todate: filteredValue.todate,
      emp_name: filteredValue.emp_name,
      status: filteredValue.status,
      numPerPage: pageSize,
      pageCount: 0,
      headerLocationId: headerLocationId,   
      employeeId: EmployeeRole ? [EmployeeId] : employees, 
      type: 'approved',
    }
    setSearchVal('')
    setFilteredValue({...filteredValue, pageCount : 0})
    setPages(0)
    dispatch(filterDataAction(body))
    setFilterOpen(false)
  }

  const Rowdata = (rowData) => {
    setRowdataEmpName(rowData)
    // setOpenPayment(true)
  }

  // useEffect(() => {
  //   dispatch( setsearchLoanAction({data:[], numRows:0}));
  //   clientwebsocket.socket.onmessage = async (message) => {
  //     let { event } = JSON.parse(message.data)
  //     if (event === 'LoanStatus') {
  //       // apiCalls(
  //         setModalTypeHandler,
  //         setLoaderStatusHandler,
  //         dispatch(loanDetailsAction(filteredValue))
  //       // )
  //     }
  //   }
  // }
  // )

const requestSearch = (e) => {
    let val = '';
    
    if (e && e.target && e.target.value !== undefined) {
      if (typeof e.preventDefault === 'function') {
        e.preventDefault();
        e.stopPropagation();
      }
      val = e.target.value;
    } else if (typeof e === 'string') {
      val = e;
    }

    setSearchVal(val);
    setFilteredValue({ ...filteredValue, pageCount: 0 });
    setPages(0);
    
    dispatch(setsearchLoanAction({ data: [], numRows: 0 }));

    const body = {
      searchString: val,
      employeeId: props.purpose === 'employee' ? props?.employee_id : null,
      headerLocationId: headerLocationId,
      tenure: "",
      frmdate: filteredValue.frmdate,
      todate: filteredValue.todate,
      emp_name: filteredValue.emp_name,
      status: filteredValue.status,
      type: 'approved',
      numPerPage: pageSize,
      pageCount: 0,
    };

    dispatch(searchLoanAction(
      body,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ));
  };
  
  const cancelSearch = () => {
    //dispatch( setsearchLoanAction({data:[], numRows:0}));
    setSearchVal('')
    setFilteredValue({...filteredValue, pageCount : 0})
    setPages(0)
    // const body = {
    //   searchString:"",
    //   employeeId:commoncookie,
    //   headerLocationId:headerLocationId
    // }
    dispatch(searchLoanAction(
      filteredValue,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ))
  }
  ////
  const handlePageChange = async (page) => {
    setPages(page)
    setFilteredValue({...filteredValue, pageCount : page})
    // const body =
    // {
    //   ...filteredValue,
    //   pageCount: page
    // }
    // apiCalls(
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    //   dispatch(searchLoanAction(
    //     body,
    //     setModalTypeHandler,
    //     setLoaderStatusHandler,
    //   ))
    // );
  };

  const handlePageSizeChange = async (size) => {
    setFilteredValue({...filteredValue, pageCount : 0})
    setPages(0)
    setPageSize(size)
    setFilteredValue({...filteredValue, numPerPage : size})
    // const body =
    // {
    //   ...filteredValue,
    //   // numPerPage: size
    // }
    // apiCalls(
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    //   dispatch(searchLoanAction(
    //     body,
    //     setModalTypeHandler,
    //     setLoaderStatusHandler,
    //   ))
    // );
  };

  const handleChangeEmployeeName = (val) => {
    setValue(val)
  }

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

  const commonCellStyle = {
    fontFamily: "poppins",
    fontSize: "11px",
    fontWeight: "400",
    color: 'rgba(0, 0, 0, 0.7)',
  };
  
  const comp = props.purpose === 'employee' ? null : <CommonSearch searchVal={searchVal}   cancelSearch={cancelSearch}   requestSearch={requestSearch}/>

  const employeeBodyHeight = props.purpose === 'employee' ? '320px' : null;
  
  return (
    <>
     <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Loans </title>
      </Helmet>

   {openpayment === false && open === false && admin === true && !openDetailsPage &&
  <MaterialTable
  totalCount={props?.purpose === 'employee' ? employeeLoans?.count : searchloandata.numRows}
  style={{height: 'auto', marginBottom:'24px',   boxShadow: '0px 4px 12px rgba(0,0,0,0.15)'}}
  components={{
    ...stickyTableComponents,
    Toolbar: (props) => (
      <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
        <div style={{ width: '100%' }}>
          <MTableToolbar {...props} />
        </div>
        <div>{comp}</div>
      </div>
    )
  }}
        actions={[(props.purpose !== 'employee' &&
          {
            icon: () => <FilterAltIcon />,
            tooltip: 'Filter',
            isFreeAction: true,
            onClick: () => handleOpen(true)
          }),
  ]}
  onPageChange={(page) => {
    props.purpose === 'employee' ? props.handlePageChangeLoan(page) : handlePageChange(page);
  }}
  onRowsPerPageChange={(size) => {
    props.purpose === 'employee' ? props.handlePageSizeChangeLoan(size) : handlePageSizeChange(size);
  }}
  options={getStickyTableOptions({
    bodyOffset: props.purpose === 'employee' ? 430 : 210,
    headerStyle,
    options: {
      showEmptyDataSourceMessage: props.purpose === 'employee' ? props.loansApiFinished : searchloandata?.data?.length === 0 && isApiFinished ? true : false,
      cellStyle,
      tableLayout: 'auto',
      paging: true,
      pageSize: pageSize,
      pageSizeOptions: props.purpose === 'employee' ? [5,10,20] :  [20, 50, 100],
      maxBodyHeight: employeeBodyHeight || maxBodyHeight,
      minBodyHeight: 'auto',
      overflowY:'visible',
      toolbar: true,
    },
  })}
  page={props.purpose === 'employee' ? props.page : props.page}
  columns={[
    {
      title: 'Date',
      field: 'date',
      cellStyle: commonCellStyle,
      render: (r) => commonDateFormat(r.date)
    },
    {
      title: 'Loan Number',
      field: 'loan_number',
      cellStyle: commonCellStyle,
      render: (rowData) => (
        <>
          {props.purpose === 'employee' ? (
            <>
              {rowData.status === 'Approved' ?
                <div
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={(event) => {
                    ViewLedgerDetails(rowData)
                    event.stopPropagation();
                  }}
                >
                  <Typography variant='h5' sx={{ fontWeight: 'bold' }}> {rowData.loan_number} </Typography>
                </div> : <div> <Typography variant='h5'> {rowData.loan_number} </Typography> </div>
              }
            </>
          ) : (
            rowData.loan_number
          )}
        </>
      ),
    },
    {
      title: 'Employee',
      field: 'full_name',
      hidden: props.purpose === 'employee'
    },
    {
      title: 'Reason for Loan',
      field: 'Reason',
      render: rowData => capitalize(rowData.Reason),
    },
    {
      title: 'Payment Method',
      field: 'Repayment_method',
      render: rowData => {
        if(rowData.Repayment_method === 'AUTO_DEDUCTION_FROM_SALARY'){
          return 'Auto Deduction From Salary';
        } else {
          return 'Manual Repayment';
        }
      }
    },
    {
      title: 'Requested Amount',
      field: 'Required_Amount',
      cellStyle: { textAlign: 'right', fontSize: cellStyle.fontSize, paddingRight: '50px'},
    },
    {
      title: 'Outstanding',
      field: 'outStanding',
      render: (rowData) => rowData.status !== "Rejected" ? rowData.outStanding : '',
      cellStyle: { textAlign: 'right', fontSize: cellStyle.fontSize, paddingRight: '50px' },
    },
    {
      title: 'Total Deduction',
      field: 'total_deduction',
      cellStyle: { textAlign: 'right', fontSize: cellStyle.fontSize, paddingRight: '50px' },
    },
    {
      title: 'Tenure',
      field: 'tenure',
    },
    {
      title: 'Status',
      field: 'status',
      render: (rowData) => {
        let label = '';
        let color = '';
        if (rowData.outStanding !== null && rowData.write_off_by !== null && rowData.status === 'Approved') {
          label = 'Written off';
          color = loanStatus['Closed'];
        } else if (rowData.outStanding === 0 && rowData.write_off_by === null && rowData.status === 'Approved') {
          label = 'Closed';
          color = loanStatus['Closed'];
        } else if (rowData.outStanding !== null && rowData.write_off_by === null && rowData.status === 'Approved') {
          label = 'Active';
          color = loanStatus['Approved'];
        }
        return (
          <Chip size='small' label={label} color={color} sx={{ fontSize: '11px' }} />
        );
      },
    },
    {
      title: '',
      field: 'Payment',
      hidden: props.purpose === 'employee' || !loanDetailsView,
      render: (rowData) => (
        <IconButton
          onClick={() => {
            Rowdata(rowData);
            setOpenDetailsPage(true);
          }}
        >
          <VisibilityIcon />
        </IconButton>
      ),
    }
  ]}
  data={props.purpose === 'employee' ? 
    (employeeLoans?.data?.filter(loan => loan.status === 'Approved') || []) : 
    (searchloandata?.length > 0 ? searchloandata : searchloandata?.data)
  }
  title={<Typography className='page-title'>Loans</Typography>}
/>
 
      }

      {openpayment === false && open === false && admin === false && <MaterialTable
        totalCount={ props.purpose === 'employee' ? employeeLoans?.count : searchloandata?.numRows}
        // style={{height:'70vh',overflow:'auto'}}
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
                <div style={{ width: '100%' }}>
                  <MTableToolbar {...props} />
                </div>
                <div>
              {props.purpose === 'employee' 
                ? (
                  <>
                    <CommonSearch
                      searchVal={searchVal}
                      cancelSearch={cancelSearch}
                      requestSearch={requestSearch}
                    />
                  </>
                ) 
                : (
                  <CommonSearch
                    searchVal={searchVal}
                    cancelSearch={cancelSearch}
                    requestSearch={requestSearch}
                  />
                )}
            </div>
                {/* <div> */}
                {/* {props.purpose === 'employee' ? <> AAAA </> : 
                    // <CommonSearch
                    //   searchVal={searchVal}
                    //   cancelSearch={cancelSearch}
                    //   requestSearch={requestSearch}
                    //   /> 
                    <> BBBB </> 
                  }
                </div> */}
              </div>
            </>
          )
        }}
        onPageChange={(page) => { props.purpose === 'employee' ? props.handlePageChangeLoan(page) : handlePageChange(page) }}
        onRowsPerPageChange={(size) => { props.purpose === 'employee' ? props.handlePageSizeChangeLoan(size) : handlePageSizeChange(size) }}
        actions={[
          loanCreate && {
            icon: 'add',
            tooltip: 'Add',
            isFreeAction: true,
            iconProps: {
              style: { marginTop: 5 },
            },
            onClick: () =>
              setOpenNewRequestDialog(true),
          },
                    {
            icon: () => (
              <div >
                {props.purpose === 'employee' ? '' :
                  <FilterLoan
                    open={filteropen}
                    handleClose={handleClose}
                    handleOpen={handleOpen}
                    filteredValue={filteredValue}
                    setFilteredValue={setFilteredValue}
                    ApplyButton={ApplyButton}
                    empNames={empNames}
                    selectedAll={selectedAll}
                    setSelectedAll={setSelectedAll}
                  />
                }
              </div>
            ),
            tooltip: 'Filter',
            isFreeAction: true,
          },
        ]}
        options={getStickyTableOptions({
          bodyOffset: props.purpose === 'employee' ? 430 : 210,
          headerStyle,
          options: {
            showEmptyDataSourceMessage: props.purpose === 'employee' ? props.loansApiFinished : searchloandata?.data?.length === 0 && isApiFinished ? true : false,
            cellStyle,
            tableLayout: 'auto',
            paging: (props.purpose === 'employee' && employeeLoans.length === 0) ? false : true,
            pageSize: pageSize,
            pageCount: pages,
            overflowY:'visible',
            exportMenu: props.purpose === 'employee' ? [
              {
                label: 'Export PDF',
                exportFunc: (cols, datas) =>
                  ExportPdf(cols, datas, 'Late Login List'),
              },
              {
                label: 'Export CSV',
                exportFunc: (cols, datas) =>
                  ExportCsv(cols, datas, 'Late Login List'),
              },
            ] : [],
            toolbar: true,
          },
        })}
        page={ props.purpose === 'employee' ? props.page : pages}
          columns={[
          // {
          //   title: 'Emp id',
          //   field: 'emp_id',
            // },
            {
              title: 'Date',
              field: 'date',
              render: (r) => (
                commonDateFormat(r.date)
              )
            },
          {
            title: 'Loan Number',
            field: 'loan_number',
            render: (rowData) => (<>
              {rowData.status === 'Approved' ?
                <div
                  style={{
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                  onClick={(event) => {
                    ViewLedgerDetails(rowData);
                    event.stopPropagation();

                  }}
                > {rowData.loan_number}
                </div> : <div> {rowData.loan_number} </div>
              }
            </>
            ),
          },
          {
            title: 'Employee',
            field: 'full_name',
            render: rowData => capitalize(rowData.full_name),
            hidden: props.purpose === 'employee'
          },
          {
            title: 'Detail',
            field: 'Reason',
            render: rowData => capitalize(rowData.Reason),
          },
          {
            title: 'Method',
            field: 'Repayment_method',
            render: rowData => {
              if(rowData.Repayment_method === 'AUTO_DEDUCTION_FROM_SALARY'){
                return 'Auto Deduction From Salary'
              }else{
                return 'Manual Repayment'
              }
            }
          },
          {
            title: 'Requested',
            field: 'Required_Amount',
            cellStyle: { textAlign: 'right', fontSize: cellStyle.fontSize, paddingRight: '50px' },
          },
          {
            title: 'Tenure',
            field: 'tenure',
          },
          {
            title: 'Outstanding',
            field: 'outStanding',
            render: (rowData) => rowData.status !== "Rejected" ? rowData.outStanding : '',
            cellStyle: { textAlign: 'right', fontSize: cellStyle.fontSize, paddingRight: '50px' },
          },
          // {
          //   title: 'Due',
          //   field: 'Due',
          // },
          {
            title: 'Status',
            field: 'status',
            render: (rowData) => {
              const label = rowData.outStanding === 0 ? rowData.write_off_by === null ? 'Closed' : 'Overwritten' :  rowData.status;
              const color = rowData.outStanding === 0 ? loanStatus['Closed'] : loanStatus[rowData.status];
              return (
                <Chip
                  size='small'
                  label={label}
                  color={color}
                  sx={{ fontSize: '11px' }}
                />
              );
            },
          },
            {
              title: 'Payment',
              field: 'Payment',
              render: (rowData) => (
                <>
                  {storage.employee_id === rowData.emp_id && (
                  rowData.status === 'Approved' && rowData.Repayment_method === 'AUTO_DEDUCTION_FROM_SALARY' ?
                    <Tooltip title='payment'>
                      <div aria-disabled={rowData.outStanding <= 0 ? true : false} onClick={() => { Rowdata(rowData) }}>
                        <PaymentsIcon color='success' />
                      </div></Tooltip> :
                    <Tooltip title='Cannot make payment'>
                      <div>
                        <PaymentsIcon color='warning' />
                      </div>
                    </Tooltip>        
                  )}
                </>
              ),
            },
        ]}
        data={props.purpose === 'employee' ? employeeLoans.data : searchloandata?.length > 0 ? searchloandata : searchloandata?.data}
        // data={ props.purpose === 'employee' ? employeeLoans.data : searchloandata?.data }
        title={<Typography variant='h6'>Loans</Typography>}
      />
      }
      {open === true && (
        <LoanPopup Onclose={Onclose} />
      )}

      {/* ////loanProvidePage//// */}

      {openpayment === true && (
        <Loanpayments close={CloseLoanPayment} rowdata={rowdataempname} filteredValue={filteredValue} />
      )}

      {reasonDialog === true &&
        <Dialog
          maxWidth='sm'
          open={reasonDialog}
          onClose={handleReasonClose}
          fullWidth
          maxHeight='sm'

        >
          {/* <DialogTitle id="index-dialog-title">
           {"Use Google's location service?"}
         </DialogTitle> */}
          <DialogContent>
            <DialogContentText sx={{ fontWeight: headerStyle.fontWeight }} id="index-dialog-description">
              Reason is required to reject a loan request!
            </DialogContentText>
            <Grid sx={{ padding: '20px 0px 0px 0px' }}>
              <TextField
                onChange={handleReasonChange}
                name='reason'
                required
                fullWidth={true}
                multiline={true}
                placeholder='Reason'
                label='Reason'
                value={formValues.reason === '' ? '' : formValues.reason}
                error={formErrors.reason === '' ? false : true}
                helperText={formErrors.reason === '' ? '' : 'Reason is Required!'}
              >

              </TextField>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button color='warning' variant='contained' onClick={handleReasonClose}>Close</Button>
            <Button variant='contained' onClick={handleRejectSubmit} autoFocus>
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      }

      {viewLedgerDetailsDialog === true &&
        <Dialog
          maxWidth='md'
          open={viewLedgerDetailsDialog}
          onClose={CloseLedgerDetails}
          fullWidth
          maxHeight='md'

        >
          {/* <DialogTitle id="index-dialog-title-2">
           {"Use Google's location service?"}
         </DialogTitle> */}
          <DialogContent>
            <Grid sx={{ padding: '20px 0px 0px 0px' }}>
              <MaterialTable
                options={{
                    headerStyle,
                    maxBodyHeight: '500px',
                  minBodyHeight: '400px',
                  cellStyle,
                  paging: false,
                  search: false,
                    overflowY:'visible',
                
                }}
                columns={[
                  { title: 'Transaction Date', field: 'transactionDate' },
                  { title: 'Amount', field: 'amount' },
                  // { title: 'description', field: 'description' },
                  { title: 'Location Name', field: 'location_name' },
                  { title: 'Note', field: 'note' },
                  { title: 'Payment Type',render: rowData => {
                    const descriptionParts = rowData.description.split('-');
                    const paymentType = descriptionParts[1].trim();
                    return paymentType} },
                ]}
                data={loanLedgerDetails}
                title="Ledger Details"
              />
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button color='warning' onClick={CloseLedgerDetails}>Close</Button>
          </DialogActions>
        </Dialog>
      }

      {openDetailsPage && (
        <LoanDetails 
          handleClose={async() => {
            setOpenDetailsPage(false);
            setSearchVal('')
          }}
          clickedLoanId={rowdataempname.id}
          filteredValue={filteredValue}
        />
      )}

      {openNewRequestDialog && (
        <NewRequest
          page={"loan"}
          open={openNewRequestDialog}
          handleClose={handleCloseNewRequestDialog}
          buttonType={'3'}
          tabType={'3'}
        />
      )}

      {props.purpose !== 'employee' && (
        <FilterLoan
          showIcon={false} 
          open={filteropen}
          handleClose={handleClose}
          handleOpen={handleOpen}
          filteredValue={filteredValue}
          setFilteredValue={setFilteredValue}
          ApplyButton={ApplyButton}
          empNames={empNames}
          searchVal={searchValEmployeeFilter}
          requestSearch={requestSearchEmployeeFilter}
          value={value}
          setValue={handleChangeEmployeeName}
          type={getCompanyBasedEmployeeFilter}
          searchType={searchCompanyBasedEmployeeFilter}
          selectedAll={selectedAll}
          setSelectedAll={setSelectedAll}
        />
      )}

    </>
  )
}

export default Loans
