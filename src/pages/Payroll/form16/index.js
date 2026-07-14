import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Helmet } from 'react-helmet-async';
import { titleURL } from '../../../http-common';
import apiCalls from 'utils/apiCalls';
import Context from '../../../context/CreateNewButtonContext';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CommonSearch from 'utils/commonSearch';
import Form16Dialog from './form16dialog';
import { useCustomFetch } from 'utils/useCustomFetch';
import API_URLS from 'utils/customFetchApiUrls';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getsessionStorage } from 'pages/common/login/cookies';


export default function Form16(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false)
  const [data, setData] = useState()
  const [rowdata, setRowdata] = useState()
  //   const {open, handleClose, paySlipData , company_logo} = props;
  const customFetch = useCustomFetch()
  const { setLoaderStatusHandler, setModalTypeHandler } = useContext(Context);
  const [base64logo, setbase64logo] = useState("")
  const { appConfigReducer: app_config_data, CompanyReducers: { signature }, rbacReducer: { menuAccess }, } = useSelector((s) => s);

  useEffect(() => { (async () => {
    const getform16 = async () => {
      const response = await customFetch(
        API_URLS.GET_FORM16,
        'GET'
      );
      const Data = response?.data;
      if(Data?.length){
      setData(Data)}
    }
    getform16()
  })();
},[])
 const storage = getsessionStorage();

 const selectedRole = storage.role_name
  useEffect(() => {
    if (!selectedRole) return;
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
  }, [selectedRole, dispatch]);

  const form16View = storage.company_type === 5 ? UserRightsAuthorization(menuAccess[selectedRole], 'tds__form16', 'can_view') : true;
  const form16Export = storage.company_type === 5 ? UserRightsAuthorization(menuAccess[selectedRole], 'tds__form16', 'can_export') : true;
  const form16Approve = storage.company_type === 5 ? UserRightsAuthorization(menuAccess[selectedRole], 'tds__form16', 'can_approve') : true;
  // console.log("claimCreate", claimCreate, selectedRole)


  const handleclose = () => {
    setOpen(false)
  }
  const currentDate = new Date();

  const yyyy = currentDate.getFullYear();
  let mm = currentDate.getMonth() + 1; // Months start at 0!
  let dd = currentDate.getDate();

  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;

  const formattedToday = dd + '/' + mm + '/' + yyyy;

  const columns = [
    { field: 'fullName', headerName: 'Name', width: 200 },
    {
      field: 'financial_year',
      headerName: 'FY',
      width: 150,
      renderCell: (params) => `${params.row.start_year} - ${params.row.end_year}`,
    },
    { field: 'tax_on_total_income', headerName: 'Tax On Total Income', width: 180 },
    { field: 'AnnualTax', headerName: 'Monthly Tax', width: 150 },
    { field: 'total_deductions', headerName: 'Total Deduction', width: 160 },
    { field: 'status', headerName: 'Status', width: 140 },
    ...(form16View ? [{
      field: 'actions',
      headerName: 'Action',
      width: 100,
      renderCell: (params) => (
        <Tooltip title='View Form16'>
          <IconButton
            size='small'
            onClick={() => {
              setOpen(true);
              setRowdata(params.row);
            }}
            sx={{
              color: '#1976d2',
              bgcolor: '#e3f2fd',
              '&:hover': { bgcolor: '#bbdefb' },
            }}
          >
            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      ),
    }] : []),
  ];

  const dataWithId = data?.length ? data.map((row, index) => ({ ...row, id: index })) : [];

  const [searchVal, setSearchVal] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFilteredData(dataWithId);
  }, [data]);

  const requestSearch = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    if (!val) {
      setFilteredData(dataWithId);
      return;
    }
    const lower = val.toLowerCase();
    setFilteredData(
      dataWithId.filter((row) =>
        Object.values(row).some((v) => String(v).toLowerCase().includes(lower))
      )
    );
  };

  const cancelSearch = () => {
    setSearchVal('');
    setFilteredData(dataWithId);
  };

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Form16 List</title>
      </Helmet>

      {!open ? (
        <Card
          sx={{
            width: '100%',
            height: 'calc(100vh - 75px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header Row */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1,
              borderBottom: '1px solid #eee',
              flexShrink: 0,
            }}
          >
            <Typography sx={{ fontWeight: 600, fontSize: '15px', whiteSpace: 'nowrap' }}>
              Form16 List
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CommonSearch
                searchVal={searchVal}
                cancelSearch={cancelSearch}
                requestSearch={requestSearch}
              />
              <Tooltip title='Close'>
                <IconButton size='small' onClick={() => navigate('/report')}>
                  <CloseIcon sx={{ fontSize: 22 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Table */}
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <DataGrid
              rows={filteredData}
              columns={columns}
              pageSizeOptions={[20, 50, 100]}
              density='compact'
              disableRowSelectionOnClick
              disableExtendRowFullWidth
              initialState={{
                pagination: { paginationModel: { pageSize: 20 } },
              }}
              sx={{
                height: '100%',
                border: 0,
                '& .MuiDataGrid-main': { overflow: 'hidden' },
                '& .MuiDataGrid-virtualScroller': { overflowY: 'auto' },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#F4F7FE',
                  fontSize: 12,
                  fontWeight: 700,
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#f5faf8',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f0f0f0',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '1px solid #eee',
                },
              }}
            />
          </Box>
        </Card>
      ) : (
        <Form16Dialog open={open} handleClose={handleclose} rowdata={rowdata} form16Approve={form16Approve} form16Export={form16Export} />
      )}
    </>
  );
}

// Form16.propTypes = {
//   open: PropTypes.bool,
//   handleClose: PropTypes.func,
//   paySlipData: PropTypes.object,
// };

