import React, { useState, useEffect, useRef, useContext } from 'react';
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
} from '@mui/material';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import {
  maxBodyHeight,
  maxHeight,
  pageSize,
  headerStyle,
  cellStyle,
  font14_500,
} from 'utils/pageSize';
import { useDispatch, useSelector } from 'react-redux';
import context from '../../../context/CreateNewButtonContext';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';


import { CreateDepartmentHead, ListDepartmentHead, ListDepartmentHeadById, deleteDepartmentHead, getDeptBaseEmpFilterAction, getRoleNameBasedOnEmployee, getSearchDepartmentHeadAction, get_search_department_based_employee_for_department_head, setSearchDepartmentHeadState, set_search_department_based_employee_for_department_head, updateDepartmentHead } from 'redux/actions/departmentHead';
import CommonSearch from 'utils/commonSearch';
import apiCalls from 'utils/apiCalls';

import { DepartmentHeadNew } from './departmentHeadCreation';
import { getStickyTableOptions, stickyTableComponents } from 'utils/stickyTableLayout';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';


const commonCellStyle = {
  fontFamily: "poppins",
  fontSize: "11px",
  fontWeight: "400",
  color: 'rgba(0, 0, 0, 0.7)',
};


export default function DepartmentHead({ rowData }) {
  const storage = getsessionStorage()
  const selectedRole = storage.role_name
  const [newDepartmentHead, setNewDepartmentHead] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editData, setEditData] = useState([]);
  const dispatch = useDispatch();

  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);

  const {
    DepartmentHeadReducer: { departmentHeadList, departmentHeadgetbyid, getRoleName, getDepartmentBasedEmployeeFilter, getDepartmentHeadSearch
      , getDepartmentHeadCount, searchDepartmentBasedEmployee
    },
    rbacReducer: {menuAccess}
  } = useSelector((state) => state);



  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [deleteRow, setDeleteRow] = useState();

  const [status, setStatus] = useState('');



  const [searchData, setSearchData] = useState({
    page: 0,
    pageSize: 20,
    searchVal: '',
    searchPageData: []
  })

  useEffect(() => {

    const data = {
      pageCount: searchData.page,
      numPerPage: searchData.pageSize,
      searchString: searchData.searchVal
    }
    dispatch(
      ListDepartmentHead(
        setModalTypeHandler,
        setLoaderStatusHandler, data),
    );
  }, [searchData.page, searchData.pageSize]);


  const handlePageSizeChange = async (size) => {
    setSearchData({ ...searchData, pageSize: size });
  }


  const handlePageChange = async (page) => {
    setSearchData({ ...searchData, page: page });
  }


  const requestSearch = (e) => {
    // const context = props.context;
    let val = e.target.value;
    setSearchData({ ...searchData, searchVal: val });

    // if(val.trim() !== ''){
    dispatch(setSearchDepartmentHeadState({ data: [], numRows: 0 }))
    // }
    const data = {
      searchString: val,
      pageCount: 0,
      numPerPage: searchData.pageSize
    }
    dispatch(
      getSearchDepartmentHeadAction(data,
        setModalTypeHandler,
        setLoaderStatusHandler),
    );
  };

  const cancelSearch = (e) => {
    setSearchData({ ...searchData, searchPageData: [], page: 0, searchVal: '' });
    dispatch(setSearchDepartmentHeadState({ data: [], numRows: 0 }))

    const data = {
      pageCount: searchData.page || 0,
      numPerPage: searchData.pageSize,
      searchString: ''
    }

    dispatch(
      getSearchDepartmentHeadAction(data,
        setModalTypeHandler,
        setLoaderStatusHandler),
    );
  };
  const handleDelete = (id) => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        deleteDepartmentHead(
          deleteRow,
        ),
      )
    );

    handleClose();
  };


  const handleEdit = (id) => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        ListDepartmentHeadById(
          id, (response) => {
            setEditData(response[0])

          }
        ),
      )
    );
  }


  const depHeadCreate = UserRightsAuthorization(menuAccess[selectedRole], 'info__dept_head', 'can_create')
  const depHeadEdit = UserRightsAuthorization(menuAccess[selectedRole], 'info__dept_head', 'can_edit')
  const depHeadDelete = UserRightsAuthorization(menuAccess[selectedRole], 'info__dept_head', 'can_delete')


  return (
    <>
      {!newDepartmentHead ? (
        <Card>
          <MaterialTable
            totalCount={getDepartmentHeadCount}
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

                    <CommonSearch
                      searchVal={searchData.searchVal}
                      cancelSearch={cancelSearch}
                      requestSearch={requestSearch}
                    />
                  </div>


                </>
              ),
            }}
            page={searchData.page}
            onPageChange={(page) => { handlePageChange(page) }}
            onRowsPerPageChange={(size) => { handlePageSizeChange(size) }}
            options={getStickyTableOptions({
              bodyOffset:200,
              headerStyle,
              options:{
                // showEmptyDataSourceMessage: this.state.isApiFinished,
                toolbar:true,
                cellStyle,
                paging: true,
                pageSize: pageSize,
                pageSizeOptions: [20, 50, 100],
                actionsColumnIndex: -1,
                search: false,
              }
            })}

            actions={[
              depHeadCreate && {
                icon: 'add',
                tooltip: 'New Department Head',
                isFreeAction: true,
                onClick: (event, rowData) => {
                  setNewDepartmentHead(true), setEditData({})
                }
              },

              ...(depHeadEdit ? [(rowData) => ({
                icon: () => <EditIcon />,
                tooltip: 'Edit Department Head',
                onClick: (event, rowData) => {
                  handleEdit(rowData.id)
                  setNewDepartmentHead(true);
                  // setEditData(rowData);
                  setStatus('edit')
                },
              })] : []),
              ...(depHeadDelete ? [(rowData) => ({
                icon: () => <DeleteIcon />,
                tooltip: 'Delete Department Head',
                onClick: (event, rowData) => {

                  setDeleteRow(rowData.id);
                  handleClickOpen();

                },
              })] : []),
            ]}
            columns={[
              {
                title: 'Department Name',
                field: 'name',
              },
              {
                title: 'Department Head',
                field: 'employeeName',
              },
              {
                title: 'Role Name',
                field: 'role_name',
              },
            ]}
            data={getDepartmentHeadSearch || []}
            title={
              <Typography
              className='page-title'
              variant='h6'
              align='left'
              style={{ paddingTop: '10px', paddingBottom: '10px' }}
              >
                Department Heads
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
        <DepartmentHeadNew
          editData={editData}
          handleClose={() => {
            setNewDepartmentHead(false);
            setEditData({})
            setStatus('')

          }}
          status={status}
          newDepartmentHead={newDepartmentHead}
          getDepartmentHead={getDepartmentHeadSearch}
          rowData={rowData}
        />
      )}
    </>
  );
}

