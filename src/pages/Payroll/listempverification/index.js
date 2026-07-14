import React, { useContext, useEffect, useState } from 'react'
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import { Typography, Grid, Chip, TextField, InputAdornment, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Card, FormHelperText, } from '@mui/material';
import LoanPopup from 'pages/Payroll/Loans/indexpopup';
import { filterDataAction, listLoanLedgerDetails, loanDetailsAction, searchLoanAction, setsearchLoanAction, updateLoanStatusAction } from 'redux/actions/loan_actions';
import { useDispatch, useSelector } from 'react-redux';
import apiCalls from 'utils/apiCalls';
import context from '../../../../src/context/CreateNewButtonContext';
import Cookies from 'universal-cookie';
import { getLoginRoleAction } from 'redux/actions/userRole_actions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FilterEmployee from './Filteremployee';
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
import Loanpayments from 'pages/Payroll/Loans/Loanpayments';
import { TrainOutlined } from '@mui/icons-material';
import notificationType from '../../../firebase/notify_type';
import { CreateNotificationAction } from 'redux/actions/notification_actions';
import { sendNtfy } from '../../../firebase/firebase.service';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import { Helmet } from 'react-helmet-async';
import CommonToolTip from 'components/ToolTip';
import { roleType } from 'utils/roleType';
import { ListVerificationDetail } from 'redux/actions/userCreation_actions';
import { getEmpbasecompanyAction } from 'redux/actions/attendance_actions';
import MediaViewer from '@crema/core/AppMedialViewer';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import Box from '@mui/material/Box';
import DownloadS3FileWrapper from 'components/downloadFileFromS3';
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import EmployeeVerification from 'pages/Payroll/empverification/test';


const ListEmployee = (props) => {
  const [open, setOpen] = useState(false)
  const [openpayment, setOpenPayment] = useState(false)
  const [pages, setPages] = useState(0)
  const [pageSize, setPageSize] = useState(props.purpose === 'employee' ? 10 : 20)
  const [admin, setAdmin] = useState(false)
  const [filteropen, setFilterOpen] = useState(false)
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
  const [Items, setItems] = useState({})

  const [index, setIndex] = useState(-1)

  const [viewLedgerDetailsDialog, setViewLedgerDetailsDialog] = useState(false)

  const storage = getsessionStorage()
  const {
    commoncookie,
    headerLocationId,
  } = useContext(context);


  const [filteredValue, setFilteredValue] = useState({
    tenure: '',
    frmdate: firstDay,
    todate: lastDay,
    emp_name: '',
    status: '',
    numPerPage: pageSize,
    pageCount: pages,
    searchString: searchVal,
    employeeId: commoncookie,
    headerLocationId: headerLocationId,
    employee_id: null
  });

  // const [viewer, setviewer] = useState(false)
  // const [docs, setDocs] = useState([])
  // const [requiredFields] = useState([

  //   'reason',
  // ]);
  const dispatch = useDispatch()

  const {
    commoncookie: currentEmpId,
    setModalTypeHandler,
    setLoaderStatusHandler, } = useContext(context);

  const { 
    UserCreationReducer: { list_verification },
    attendanceReducer: { get_empbasecompany },
  } = useSelector(state => state)

  useEffect(() => {
    // dispatch(listMigrationAction());
    if (!get_empbasecompany.length) {
      dispatch(getEmpbasecompanyAction())
    }
  }, [filteropen]);
 
  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const handleFilterClose = () => {
    // setFilteredValue({ ...filteredValue, frmdate: firstDay, todate: lastDay, status: "" })
    // //  setFilterOpen(false)
    // dispatch(filterDataAction({ ...filteredValue, frmdate: "", todate: "", status: "" }))
    setFilterOpen(false)
  }
  const handleFilterOpen = (data) => {
    setFilterOpen(data)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const ApplyButton = () => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(ListVerificationDetail(filteredValue.employee_id)))
    setFilterOpen(false)
  }

  const fileAccess = (data) => {

    if (data.type === 'image') {
      let fileUrl = [{
        fileAccessUrl: data.fileUrl,
        fileName: data.file_path
      }]
      let fileName = data.file_path
      var lastItem = fileName.split(".").pop();
      let msg_content = JSON.stringify([{ fileName, format: lastItem }])
      let item = {
        fileUrl,
        msg_content,
        msg_type: 'PHOTO',
        message_type: "PHOTO"
      }
      console.log('itemmmmmmmmmmm', item)
      setItems(item);
      setIndex(1)

    }
    console.log('dtaaaaaaa', data.type)
  }

  const onClose = () => {
    setIndex(-1);
  };
  // const viewchange = (data) => {
  //   console.log('dataaaa', data)
  //   let uris = data.fileUrl
  //   setDocs([{ uri: uris }])
  // }
  // useEffect(() => {
  //   if (docs.length > 0) {
  //     console.log('docsssss', docs.length)
  //     setviewer(true);
  //   }
  // }, [docs.length])
  // console.log('itemsssss', docs)

  // const docsss = [{
  //        uri:
  //         "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf"

  // }]
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title> {titleURL} | List Verification </title>
      </Helmet>
      {/* {viewer === true && 
        <DocViewer pluginRenderers={DocViewerRenderers} documents={docs} />}
        <FileViewer
        fileType={'xlsx'}
        filePath={"https://salesplaychat.s3.ap-southeast-1.amazonaws.com/KRA_report_-_Employees_7__57269867c07f2ca0d5df4de1d34f0529.xlsx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAZVIGG6ZKWLAPNT2K%2F20240318%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20240318T105423Z&X-Amz-Expires=86400&X-Amz-Signature=84a90bffc86ea5ebaab45106eac107e49d7d351da092c03f136a4d73c58d2f8b&X-Amz-SignedHeaders=host&x-id=GetObject"}
        />
        } */}
      {index === 1 &&
        <MediaViewer index={index} item={Items} onClose={onClose} />
      }

      {open ? (<EmployeeVerification handleVClose={handleClose} />) : (
      <MaterialTable
      style={{height:'89vh',overflow:'auto'}}
      components={{
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
              {/* <div>
                <CommonSearch
                  searchVal={searchVal}
                  cancelSearch={cancelSearch}
                  requestSearch={requestSearch}
                />
              </div> */}
            </div>
          </>
        )
      }}

      actions={[
        {
          icon: () => (
            <div >
              <FilterEmployee
                open={filteropen}
                handleClose={handleFilterClose}
                handleOpen={handleFilterOpen}
                filteredValue={filteredValue}
                setFilteredValue={setFilteredValue}
                ApplyButton={ApplyButton}
                empNames={empNames}
              />

            </div>
          ),
          tooltip: 'Filter',
          isFreeAction: true,
        },
        {
          icon: 'add',
          tooltip: 'add',
          isFreeAction: true,
          onClick: () => setOpen(true),
        },
      ]}
      options={{

        headerStyle,
        cellStyle,
        filtering: false,
        search: false,
        pageSize: pageSize,
        pageSizeOptions: [20,50,100],
        // paging: (props.purpose === 'employee' && employeeLoans.length === 0) ? false : true,
        // maxBodyHeight: props.purpose === 'employee' ? '430px' : 'auto',
        // pageSize: pageSize,
        // pageCount: pages,
        // pageSizeOptions: props.purpose === 'employee' ? [10, 20, 30] : [20, 50, 100],
      }}
      page={pages}
      columns={[
        // {
        //   title: 'Emp id',
        //   field: 'emp_id',
        // },
        {
          title: 'Date',
          field: 'date',
          render: (r) => (
            commonDateFormat(r.createdAt)
          )
        },
        {
          title: 'Verification Name',
          field: 'index_value',
          render: (r) => (
            r.index_value === 0 ? 'Identity Verification' : r.index_value === 1 ? 'Address Verification' :
              r.index_value === 2 ? 'Employeement Verification' : r.index_value === 3 ? 'Educational Qualification Check' :
                r.index_value === 4 ? 'Driving License Verification' : r.index_value === 5 ? 'Social Media Check' : r.index_value === 6 ? 'Criminal Record Check' : r.index_value === 7 ? 'Drug Test Check' :
                  r.index_value === 8 ? 'Family Background Verification' : r.index_value === 9 ? 'Current Residence Lat Long Check' : r.index_value === 10 ? 'Passport & Aadhar Verification' : ''
          )

        },
        {
          title: 'Name',
          field: 'document_type',
          render: (r) => (
            r.document_type === 'Yes' || r.document_type === 'No' ? '' : r.document_type
          )
        },

        {
          title: 'Type',
          field: 'document_name',
        },
        {
          title: 'Document',
          field: 'fileUrl',
          render: (rowData) => (
            <>
              {
                rowData.type === 'image' ?
                  <Tooltip title='Download' style={{ cursor: "pointer" }}>
                    <div onClick={() => { fileAccess(rowData) }}>
                      <PaymentsIcon color='success' />
                    </div>
                  </Tooltip> : rowData.type === 'application' ?

                    <Tooltip title='View' style={{ cursor: "pointer" }}>

                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'nowrap',
                          alignItems: 'center',
                        }}
                      >
                        <DescriptionOutlinedIcon sx={{ fontSize: '25px' }} />
                        <Box
                          sx={{
                            ml: 2,
                          }}
                        >
                          <Box component='span' sx={{ display: 'block', fontSize: '15px' }}>
                            {`${rowData.file_path.slice(0, 10)}...`}
                          </Box>
                          {/* <Box component='span' sx={{display: 'block'}}>
            {msg_content.size}
          </Box> */}
                        </Box>
                        <DownloadS3FileWrapper
                          link={rowData.fileUrl}
                          objectName={rowData.file_path}
                          style={{ padding: 1 }}
                          fileName={`${rowData.file_path.split('__')}.${rowData.file_path.split(".").pop()
                            }`}
                        >
                          {/* <DocViewer pluginRenderers={DocViewerRenderers} documents={[{'uri' : rowData.fileUrl}]} > */}
                          <IconButton>
                            <DownloadIcon sx={{ fontSize: '25px' }} />
                          </IconButton>
                          {/* </DocViewer> */}
                        </DownloadS3FileWrapper>
                      </Box>
                    </Tooltip> : ''
              }
            </>)
        }


      ]}
      data={list_verification || []}
      title={<Typography variant='h6'>List Verification</Typography>}
    />
      )}

      {/* {open === true && (
        <LoanPopup Onclose={Onclose} />
      )} */}

      {/* ////loanProvidePage//// */}

      {/* {openpayment === true && (
        <Loanpayments close={CloseLoanPayment} rowdata={rowdataempname} filteredValue={filteredValue} />
      )} */}

      {/* {reasonDialog === true &&
        <Dialog
          maxWidth='sm'
          open={reasonDialog}
          onClose={handleReasonClose}
          fullWidth
          maxHeight='sm'

        >
         
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
      } */}

      {/* {viewLedgerDetailsDialog === true &&
        <Dialog
          maxWidth='md'
          open={viewLedgerDetailsDialog}
          onClose={CloseLedgerDetails}
          fullWidth
          maxHeight='md'

        >
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
                    // console.log(paymentType,"trimm");
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
      } */}
    </>
  )
}

export default ListEmployee
