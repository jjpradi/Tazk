import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  Button,
  TextField,
  Typography,
  Grid,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Autocomplete,
  TablePagination
} from '@mui/material';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {
  maxBodyHeight,
  maxHeight,
  pageSize,
  headerStyle,
  cellStyle,
  font14_500,
} from 'utils/pageSize';
import {useDispatch, useSelector} from 'react-redux';
import context from '../../../context/CreateNewButtonContext';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import CommonSearch from 'utils/commonSearch';
import apiCalls from 'utils/apiCalls';

import {RequestConfigNew} from './requestConfigCreation';
import {
  deleteConfig,
  getConfigById,
  getRequestConfig,
  setSearchRequestConfigState,
} from 'redux/actions/requestConfig';
import {
  getStickyTableOptions,
  stickyTableComponents,
} from 'utils/stickyTableLayout';
import { MTablePagination } from '@material-table/core';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

export default function RequestConfig({rowData}) {
  const [newRequestConfig, setNewRequestConfig] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editData, setEditData] = useState([]);
  const [requestType, setRequestType] = useState('')
  const dispatch = useDispatch();
  const storage = getsessionStorage();
  const selectedRole = storage?.role_name;

  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);

  const {
    RequestConfigReducer: {requestConfigSearch, requestCount},  rbacReducer: { menuAccess }
  } = useSelector((state) => state);

  const [deleteRow, setDeleteRow] = useState();

  const [status, setStatus] = useState('');

  const [searchData, setSearchData] = useState({
    page: 0,
    pageSize: 20,
    searchVal: '',
    searchPageData: [],
  });

  useEffect(() => {
    const data = {
      pageCount: searchData.page,
      numPerPage: searchData.pageSize,
      searchString: searchData.searchVal,
    };
    dispatch(
      getRequestConfig(setModalTypeHandler, setLoaderStatusHandler, data),
    );
  }, [searchData.page, searchData.pageSize]);

  const handlePageSizeChange = async (size) => {
    setSearchData({...searchData, pageSize: size});
  };

  const handlePageChange = async (page) => {
    setSearchData({...searchData, page: page});
  };

  const searchDebounceRef = useRef(null);

  const requestSearch = (e) => {
    // const context = props.context;
    let val = e.target.value;
    setSearchData({...searchData, searchVal: val});

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

      searchDebounceRef.current = setTimeout(() => {
        dispatch(setSearchRequestConfigState({ data: [], numRows: 0 }));

        const data = {
          searchString: val,
          pageCount: 0,
          numPerPage: searchData.pageSize,
        };

        dispatch(
          getRequestConfig(setModalTypeHandler, setLoaderStatusHandler, data)
        );
      }, 500); 
    };

  const cancelSearch = (e) => {
    setSearchData({...searchData, searchPageData: [], page: 0, searchVal: ''});
    dispatch(setSearchRequestConfigState({data: [], numRows: 0}));

    const data = {
      pageCount: searchData.page || 0,
      numPerPage: searchData.pageSize,
      searchString: '',
    };

    dispatch(
      getRequestConfig(setModalTypeHandler, setLoaderStatusHandler, data),
    );
  };
  //   const handleDelete = (id) => {
  //     apiCalls(
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //       dispatch(
  //         deleteConfig(
  //           deleteRow,
  //         ),
  //       )
  //     );

  //     handleClose();
  //   };

  const handleEdit = (id) => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        getConfigById(id, (response) => {
          // console.log("response",response)
          setEditData(response);
          setRequestType(response.request_type_ids[0].request_type_name)
        }),
      ),
    );
  };

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = (id) => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        deleteConfig(
          deleteRow,
        ),
      )
    );

    handleClose();
  };

  const transformData = (data) => {
    return data.map((item) => {
      const approvers = item.approver
        .map((a) => a.employee_name)
        .filter((name) => name)
        let request_type = item.request_type_ids
        .map((a) => a.request_type_name)
        .filter((name) => name);

        const formattedRequestTypes = [];
// console.log("request_type",request_type)
        if (request_type.includes("Leave") && request_type.includes("Permission") && request_type.includes("Permission Half Day")) {
          formattedRequestTypes.push(...request_type ,"Leave & Permission");
        } else {
          
          formattedRequestTypes.push(...request_type);
        }
        // console.log("formattedRequestTypes",formattedRequestTypes)
        const filteredRequestTypes = formattedRequestTypes.filter(
          (type) => type !== "Permission" && type !== "Permission Half Day" && type !== "Leave"
        );
        // console.log("filteredRequestTypes",filteredRequestTypes)
      const verifiers = item.verifier
        .map((v) => v.employee_name)
        .filter((name) => name)
        .join(', ');

        const approversName = approvers.length > 3
        ? `${approvers[0]} + ${approvers.length - 1}`
        : approvers.join(', ');

        const request_typeName = filteredRequestTypes.length > 3
        ? `${filteredRequestTypes[0]} + ${filteredRequestTypes.length - 1}`
        : filteredRequestTypes.join(', ');

      return {
        ...item,
        approversName: approversName,
        verifiersName: verifiers,
        request_typeName: request_typeName
      };
    });
  };

  const transformedData = transformData(requestConfigSearch || []);

  // console.log('Transformed Data:', transformedData);
const allowedCompanyTypes = [2, 3, 9];

const approvalCreate = allowedCompanyTypes.includes(storage?.company_type) ? UserRightsAuthorization(menuAccess?.[selectedRole], 'config__approvals', 'can_create') : true;
const approvalEdit = allowedCompanyTypes.includes(storage?.company_type) ? UserRightsAuthorization(menuAccess?.[selectedRole], 'config__approvals', 'can_edit') : true;
const approvalDelete = allowedCompanyTypes.includes(storage?.company_type) ? UserRightsAuthorization(menuAccess?.[selectedRole], 'config__approvals', 'can_delete') : true;

  return (
    <>
      {!newRequestConfig ? (
        <Card sx={{width: '100%'}}>
          <MaterialTable
          style={{height: 'calc(100vh - 80px)',overflow: 'hidden',}}
            totalCount={requestCount}
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

                    <CommonSearch
                      searchVal={searchData.searchVal}
                      cancelSearch={cancelSearch}
                      requestSearch={requestSearch}
                    />
                  </div>
                </>
              ),
              Pagination: (props) => (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    // borderTop: 'none',
                    // boxShadow: 'none',
                    padding: '8px 16px',
                    alignItems:"center",
                    // borderBottom: 'none',
                  }}
                >
                  <MTablePagination
                    {...props}
                    // count={}
                    page={searchData.page}
                    rowsPerPage={pageSize || 20}
                    onPageChange={(event, newPage) => handlePageChange(newPage)}
                    onRowsPerPageChange={(event) => 
                      handlePageSizeChange(parseInt(event.target.value, 10))
                    }
                    labelRowsPerPage="Rows per page:"
                    // style={{
                    //   borderTop: 'none',
                    //   borderBottom: 'none',
                    //   boxShadow: 'none',
                    //   width: 'auto',
                    // }}
                  />
                </div>
              ),
            }}
            // page={searchData.page}
            // rowsPerPage={numPerPage}
            // onPageChange={(page) => {
            //   handlePageChange(page);
            // }}
            // onRowsPerPageChange={(size) => {
            //   handlePageSizeChange(size);
            // }}
            options={getStickyTableOptions({
            bodyOffset: 210,
            headerStyle,
            options: {
              // showEmptyDataSourceMessage: 
              filtering: false,
              actionsColumnIndex: -1,
              paging: true,
              pageSize: pageSize,
              pageSizeOptions: [20, 50, 100],
              search: false,
              // maxBodyHeight: maxBodyHeight,
              // minBodyHeight: maxBodyHeight,
              cellStyle,
              tableLayout: 'auto',
              toolbar: true,
            },
          })}
            actions={[
               ...(approvalCreate
                ? [{
                  icon: 'add',
                  tooltip: 'New Request Config',
                  isFreeAction: true,
                  onClick: (event, rowData) => {
                      setNewRequestConfig(true), 
                      setEditData({})
                  },
                }]
                : []),
              ...(approvalEdit
              ? [rowData => ({
                icon: () => <EditIcon />,
                tooltip: 'Edit Request Config',
                onClick: (event, rowData) => {
                  // console.log("asdasd",rowData)
                  handleEdit(rowData.id);
                  setNewRequestConfig(true);
                  // setEditData(rowData);
                  setStatus('edit');
                },
              })]
              : []),
               ...(approvalDelete
                ? [rowData => ({
                  icon: () => <DeleteIcon />,
                  tooltip: 'Delete Request Config',
                  onClick: (event, rowData) => {

                    setDeleteRow(rowData.id);
                    handleClickOpen();

                  },
                })]
                : []),
            ]}
            columns={[
              {
                title: 'Department Name',
                field: 'department_name',
              },
              {
                title: 'Request Type',
                field: 'request_typeName',
              },
             
              {
                title: 'Approver',
                field: 'approversName',
              },
              {
                title: 'Verifier',
                field: 'verifiersName',
              },
            ]}
            data={transformedData}
            title={
              <Typography
                className='page-title'
                style={{paddingTop: '10px', paddingBottom: '10px'}}
              >
                Approvalss
              </Typography>
            }
          />

        <Grid>
            <Grid>
              <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{'Delete Alert'}</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Are you sure you want to Delete this?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button variant='contained' color='error' onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button variant='contained' onClick={handleDelete} autoFocus>
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>
            </Grid>
          </Grid> 
        </Card>
      ) : (
        <RequestConfigNew
          editData={editData}
          handleClose={() => {
            setNewRequestConfig(false);
            setEditData({});
            setStatus('');
            setRequestType('')
          }}
          status={status}
          newRequestConfig={newRequestConfig}
          requestConfig={transformedData}
          rowData={rowData}
          requestType={requestType}
        />
      )}
    </>
  );
}

