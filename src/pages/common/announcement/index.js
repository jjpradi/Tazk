import MaterialTable from 'utils/SafeMaterialTable';
import { Chip, Grid, DialogContent, DialogContentText, DialogActions, Button, Dialog ,Typography} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { maxBodyHeight, maxHeight, pageSize, headerStyle, cellStyle } from 'utils/pageSize';
import FormCreation from './formCreation';
import { useDispatch, useSelector } from 'react-redux';
import {getAnnouncements, updateAnnouncement, updateAnnouncementInActive} from 'redux/actions/payrollDashboard_actions';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';
import { commonDateFormat } from 'utils/getTimeFormat';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getsessionStorage } from 'pages/common/login/cookies';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';

export default function Announcement(days) {
  const dispatch = useDispatch();
  const storage = getsessionStorage()
  const [openForm, setOpenForm] = useState(false);
  const [rowDataToDelete, setRowDataToDelete] = useState(null);
  const [dialog, setDialog] = useState(false)
  const [editAnnouncement, setEditAnnouncement] = useState({})
  const [mode, setMode] = useState('');
  const [searchData, setSearchData] = useState({
    page: 0,
    pageSize: 20,
  }
)

  const CalculateDateDiff = (days) => {
    // Get today's date
    const today = moment();

    // Add 45 days to today's date
    const futureDate = today.clone().add(days, 'days');

    // Format the future date as desired (optional)
    const formattedDate = futureDate.format('YYYY-MM-DD');

    return formattedDate;
  };



  // console.log('formattedDate', CalculateDateDiff());


  const selectedRole = storage.role_name
  useEffect(() => {
    dispatch(getAnnouncements());
    // dispatch(getUserRightsByRoleIdAction())
    dispatch(getMenuAccessAction(selectedRole))
  }, [searchData.page,searchData.pageSize]);


  const {
    PayrolldashboardReducers: { announcements_list },
    roleReducer: {user_rights},
    rbacReducer: {menuAccess}
  } = useSelector((state) => state);


  const handleOpenForm = () => {
    setOpenForm(true);
    setMode('add')
  };
  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleDialogClose = () => {
    setDialog(false)
}

const handleInactive = (rowData) => {
  if (rowData.isActive === 1) {
  dispatch(updateAnnouncementInActive(rowData.id));
  }
  setDialog(false)
}
const handleDelete = (rowData) => {
  setRowDataToDelete(rowData);
  setDialog(true);
};

  const handleEditForm = (rowData) => {
    console.log('editAnnouncement', editAnnouncement);
    console.log('DFDFDF', rowData);
    setEditAnnouncement(rowData)
    setMode('edit')
    setOpenForm(true);
  }

  const announcementCreate = UserRightsAuthorization(menuAccess[selectedRole], 'announcement', 'can_create');
  const announcementEdit = UserRightsAuthorization(menuAccess[selectedRole], 'announcement', 'can_edit');
  const announcementDelete = UserRightsAuthorization(menuAccess[selectedRole], 'announcement', 'can_delete');

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title> {titleURL} | Announcements </title>
      </Helmet>
      <style>
        {`
          /* Remove border under 'No records to display' */
          .MuiTableBody-root .MuiTableRow-root td {
            border-bottom: none !important;
          }
        `}
      </style>
 
    <Grid>
      {!openForm ? (
        <Grid>
          <MaterialTable
            options={{
              headerStyle,
              cellStyle,
              exportButton: true,
              filtering: false,
              actionsColumnIndex: -1,
              maxBodyHeight:`calc(${maxHeight} - 50px)`,
              minBodyHeight:`calc(${maxHeight} - 50px)`,
              overflowY:'visible',
              paging:false,
              search: false,
            }}
            actions={[
              ...(announcementCreate ? [{
                icon: 'add',
                tooltip: 'Add',
                isFreeAction: true,
                onClick: () => handleOpenForm(),
              }] : []),

              ...(announcementDelete ? [(rowData) => ({
                icon: () => (
                  <Chip
                    label={'Delete'}
                    disabled={rowData.isActive === 0}
                    color={rowData.isActive === 0 ? 'default' : 'primary'}
                  />
                ),
                tooltip: 'InActive',
                onClick: () => handleDelete(rowData)
              })] : []),

              ...(announcementEdit ? [(rowData) => ({
                icon: () => (
                  <Chip
                    label={'Edit'}
                  // disabled={rowData.isActive === 0}
                  // color={rowData.isActive === 0 ? 'default' : 'primary'}
                  />
                ),
                tooltip: 'Edit',
                onClick: () => { handleEditForm(rowData) },
              })] : []),
            ]}
            columns={[
              {
                title: 'Department',
                field: 'department',
                render: (rowData) => rowData.department.join(',     ')
              },
              {
                title: 'Location',
                field: 'location_name',
                render: (rowData) => rowData.location_name.join(', '),
              },
              {
                title: 'Users',
                field: 'user_name',
                render: (rowData) => {
                  if (rowData.user_name.length <= 2) {
                    return rowData.user_name.join(', ');
                  } else {
                    return rowData.user_name.slice(0, 2).join(', ') + ` +${rowData.user_name.length - 2}`;
                  }
                }
              },
              
              { title: 'Expiry', 
                field: 'expiry', 
              render: (rowData) => `${rowData.expiry} days` },

              { 
                title: 'Expiry Date', 
                field: 'expiry_date',
                render: rowData => rowData.expiry_date ? commonDateFormat(rowData.expiry_date) : ''
              },

              { title: 'Announcement', 
                field: 'announcement',
              },

              { title: 'Status', 
                field: 'isActive', 
                render: (rowData) => rowData.isActive === 1 ? 'Active' : 'Inactive' },
            ]}
            data={announcements_list}
            title={<Typography className='page-title'>Announcements</Typography>}
          />
        </Grid>
      ) : (
        <FormCreation
          handleCloseForm={handleCloseForm}
          editData={editAnnouncement}
          mode={mode}
        />
      )}
    </Grid>

  
      <Dialog
        open={dialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="index-dialog-description">
            Are you sure you want to delete ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleInactive(rowDataToDelete)}>Delete</Button>
          <Button onClick={handleDialogClose} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

