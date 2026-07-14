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
  attendancePolicyAction
} from 'redux/actions/shifts.actions';
import {useDispatch, useSelector} from 'react-redux';
import AddAttendancePolicy from './addAttendancePolicy';
import EditIcon from '@mui/icons-material/Edit';
import { getsessionStorage } from 'pages/common/login/cookies';
import { restrictNewCreationBasedOnPlanAction } from 'redux/actions/subscription_action';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';

export default function ViewAttPolicy() {
  const [newPolicy, setNewPolicy] = useState(false);
  const [mode, setMode] = useState('add')
  const [editRowData, setEditRowData] = useState([])
 
  const dispatch = useDispatch();
  const storage = getsessionStorage()
  const deleteId = useRef(null);

  const {
    ShiftsReducer: {attendancePolicyList},
    SubscriptionReducer: {restrictUserLocationCreation},
    rbacReducer: {menuAccess}
  } = useSelector((state) => state);

    const selectedRole = storage.role_name

  useEffect(()=>{
    const payload = {
        type: 'Get'
    }
    dispatch(attendancePolicyAction(payload)),
    dispatch(restrictNewCreationBasedOnPlanAction())

  },[])
console.log("daaef",attendancePolicyList,restrictUserLocationCreation);

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
// console.log("trefase",editRowData);

const commonCellStyle = {
  fontFamily: "poppins",
  fontSize: "11px",
  fontWeight: "400",
  color: 'rgba(0, 0, 0, 0.7)',
};

const policyCreate = storage.company_type === 5 ? UserRightsAuthorization(menuAccess[selectedRole], 'config__attendance_policy', 'can_create') : true;
const policyEdit = storage.company_type === 5 ? UserRightsAuthorization(menuAccess[selectedRole], 'config__attendance_policy', 'can_edit') : true;
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
              ...(policyCreate ? [{
              icon: 'add',
              tooltip: 'Add Attendance Policy',
              isFreeAction: true,
              onClick: () => setNewPolicy(true),
            }] : [])
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
            ]}
            columns={[
              {
                title: 'Policy Name',
                field: 'policy_name',
              },
              {
                title: 'Employee Category',
                field: 'category_name',
              },
              {
                title: 'Permission Duration',
                field: 'permission_duration',
              },
              {
                title: 'Permission Count',
                field: 'permission_count',
              },
              {
                title: 'Calculate Late Days',
                field: 'calculate_latedays',
              },
              {
                title: 'Calculate Leave',
                field: 'calculate_leave',
              },
              {
                title: 'Late Halfday Leave',
                field: 'mark_halfday_leave',
              },
              {
                title: 'Mark Halfday Leave',
                field: 'calculate_halfday',
              },
              {
                title: 'Actions',
                field: 'actions',
                render: (rowData) => (
                policyEdit ? (
                  <IconButton onClick={() => handleEditClick(rowData)}>
                    <EditIcon />
                  </IconButton>
                  ) : null
                ),
              }
            ]}
            style={{
              boxShadow: 'none',
              border: 'none',
            }}
            data={attendancePolicyList}
            title={
              <Typography
                className='page-title'
              >
                Attendance Policy
              </Typography>
            }
          />
        </Card>
      ) : <AddAttendancePolicy 
      close={handleClose} 
      open={newPolicy}
      editRowData={editRowData}
      mode = {mode}
      /> }
    </>
  );
}

