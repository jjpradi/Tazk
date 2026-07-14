import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  Typography,
  Grid,
  Divider,
  Card,
  IconButton,

} from '@mui/material';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {
  maxBodyHeight,
  maxHeight,
  pageSize,
  headerStyle,
  cellStyle,
} from 'utils/pageSize';
import {
  attendancePolicyAction,
  leavePolicyAction
} from 'redux/actions/shifts.actions';
import {useDispatch, useSelector} from 'react-redux';
import AddAttendancePolicy from './addAttendancePolicy';
import EditIcon from '@mui/icons-material/Edit';
import LeavePolicy from './leavePolicy';
import { getsessionStorage } from 'pages/common/login/cookies';
import { restrictNewCreationBasedOnPlanAction } from 'redux/actions/subscription_action';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';

export default function ViewLeavePolicy() {
  const [newPolicy, setNewPolicy] = useState(false);
  const [mode, setMode] = useState('add')
  const [editRowData, setEditRowData] = useState([])
 
  const dispatch = useDispatch();
  const storage = getsessionStorage()
  const deleteId = useRef(null);

  const {
    ShiftsReducer: {leavePolicyList},
    SubscriptionReducer: {restrictUserLocationCreation},
    rbacReducer: {menuAccess}
  } = useSelector((state) => state);

  useEffect(()=>{
    const payload = {
        type: 'Get'
    }
    dispatch(leavePolicyAction(payload)),
    dispatch(restrictNewCreationBasedOnPlanAction())

  },[])
console.log("daaef",leavePolicyList);
const selectedRole = storage.role_name

const handleClose = () =>{
    setNewPolicy(false)
    setMode('add')
}

const handleEditClick = (rowData) => {
  setMode('edit')
  setNewPolicy(true);
  setEditRowData(rowData)
  console.log('Edit clicked', rowData);
};
console.log("trefase",editRowData);
const leavePolicyCreate = storage.company_type === 5 ? UserRightsAuthorization(menuAccess[selectedRole], 'config__leave_policy', 'can_create') : true;
const leavePolicyEdit = storage.company_type === 5 ? UserRightsAuthorization(menuAccess[selectedRole], 'config__leave_policy', 'can_edit') : true;
  return (
    <>
      {!newPolicy ? (
        <Card
          sx={{
            boxShadow: 'none',
            border: 'none',
            '& .MuiTablePagination-root': {
              borderTop: 'none',
            },
          }}
        >
          <MaterialTable
            options={{
              maxBodyHeight: maxBodyHeight,
              headerStyle,
              cellStyle,
              search: false,
              paging: false,
            //   pageSize: searchData.pageSize,
            //   pageSizeOptions: [20, 50, 100],
              // actionsColumnIndex: -1,
            }}
            // page={searchData.page}
            // onPageChange={(page) => handlePageChange(page)}
            // onRowsPerPageChange={(size) =>handlePageSizeChange(size)}
            actions={[
             ...(leavePolicyCreate
               ? [
              {
                icon: 'add',
                tooltip: 'add',
                isFreeAction: true,
                onClick: () => setNewPolicy(true),
              },
              ]
    : []),
]}
              // (rowData) => ({ 
              //   icon: () => (
              //     <EditIcon/>
              //   ),
              //   tooltip:  rowData.salary_process_count > 0 ? '' : 'Edit' ,
              //   disabled : rowData.salary_process_count > 0 ? true : false,
              //   onClick: (event, rowData) => {
              //     this.handleClickOpenEdit(rowData); 
              //     // <ScheduleShift rowData={rowData}/>
              //   },
              // }),
    
            columns={[
              {
                title: 'Policy Name',
                field: 'leave_policy_name',
              },
              {
                    title: 'Employee Category',
                    field: 'category_name',
                  },
              {
                title: 'Weekly Leave',
                field: 'no_of_leave_per_week',
              },
              {
                title: 'Compensation Off',
                field: 'combo_off',
              },
              {
                title: 'Off Day 1',
                field: 'off_day1',
              },
              {
                title: 'Off Day 2',
                field: 'off_day2',
              },
              // {
              //   title: 'PL Max Limit',
              //   field: 'privilegeLeaveMaxLimit',
              // },
              {
                title: 'Actions',
                field: 'actions',
                render: (rowData) => 
                   leavePolicyEdit ? (
                  <IconButton onClick={() => handleEditClick(rowData)}>
                    <EditIcon />
                  </IconButton>
                ) : null
              }
            ]}
            data={leavePolicyList}
            title={
              <Typography
                className='page-title'
              >
                Leave Policy
              </Typography>
            }
          />
        </Card>
      ) : <LeavePolicy 
      close={handleClose} 
      open={newPolicy}
      editRowData={editRowData}
      mode = {mode}
      /> }
    </>
  );
}

