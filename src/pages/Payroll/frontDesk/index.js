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
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  FormControl,
  Switch
} from '@mui/material';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import {
  maxBodyHeight,
  pageSize,
  headerStyle,
  cellStyle,
} from 'utils/pageSize';
import { useDispatch, useSelector } from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import moment from 'moment'
import CommonSearch from 'utils/commonSearch';
import { createFrontDeskAction, getAllFrontDeskAction, sendMailForgetPasswordAction, updateFrontDeskUserAction, updatePasswordAction, verifyOtpAction } from 'redux/actions/requestConfig';
import { MoreVert, Visibility, VisibilityOff } from '@mui/icons-material';
import { stockLocationPaginationAction } from 'redux/actions/stock_Location_actions';
import { changepasswordAction, userCreationPaginationAction } from 'redux/actions/userCreation_actions';
import ResetDialog from 'pages/sales/vendorPriceList/ResetDialog';
import { getUserRightsByRoleIdAction, userRightsForFrontDeskAction } from 'redux/actions/role_actions';
import { getStickyTableOptions, stickyTableComponents } from 'utils/stickyTableLayout';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';


const commonCellStyle = {
  fontFamily: "poppins",
  fontSize: "11px",
  fontWeight: "400",
  color: 'rgba(0, 0, 0, 0.7)',
};


export default function FrontDesk({ rowData }) {
  const textRef = useRef(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [changeDialogOpen, setChangeDialogOpen] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [dialogUserName, setDialogUserName] = useState('');
  const [resetconfirm, setResetConfirm] = useState(false);
  const [otpFieldEnabled, setOtpFieldEnabled] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("Generate OTP");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reset, setReset] = useState(false);
  const [reset_id, setReset_id] = useState()
  const [searchVal, setSearchVal] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [registerStatus, setRegisterStatus] = useState(false);
  const [deRegisterStatus, setDeRegisterStatus] = useState(false);
  const [editDialogoOpen, setEditDialogoOpen] = useState(false);
  const [selectedEmpForEdit, setSelectedEmpForEdit] = useState('');
  const [dialogMode, setDialogMode] = useState('create');
  const [formValues, setFormValues] = useState({
    userName: '',
    person_id: '',
    otp: '',
    newPassword: '',
    confirmNewPassword: '',
    currentPasswordForChange: '',
    newPasswordForChange: '',
    confirmNewPasswordForChange: '',
    empIdForPasswordChange: '',
    frontDesk_newUserName: '',
    frontDesk_newPassword: '',
    frontDesk_location: '',
    register: []
  });

  const [dialogformErrors, setDialogformErrors] = useState({
    userName: '',
    person_id: '',
    otp: '',
    newPassword: '',
    confirmNewPassword: '',
    frontDesk_newUserName: '',
    frontDesk_newPassword: '',
    currentPasswordForChange: '',
    newPasswordForChange: '',
    confirmNewPasswordForChange: '',
    frontDesk_location: '',
    register: ''
  });


  const [passwordVisibility, setPasswordVisibility] = useState({
    newPassword: false,
    confirmNewPassword: false,
    frontDesk_newPassword: false,
    currentPasswordForChange: false,
    newPasswordForChange: false,
    confirmNewPasswordForChange: false
  });

  const dispatch = useDispatch();
  const storage = getsessionStorage()
  const selectedRole = storage.role_name

  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);

  const {
    RequestConfigReducer: { getAllFrontDeskCount, getAllFrontDesk }, appConfigReducer: { getprefix_data, app_config_data, appConfigWithCompanyInfo }, stockLocationReducer: { search_location_data }, PayrolldashboardReducers: { activedeviceslist },
    roleReducer: { frontDeskUserRights },
    rbacReducer: {menuAccess}
  } = useSelector((state) => state);

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
      searchString: searchVal
    }
    dispatch(
      getAllFrontDeskAction(data),
    );
    dispatch(userRightsForFrontDeskAction())
  }, [dispatch, searchData.page, searchData.pageSize]);

  useEffect(() => {
    updateRegisterWithRights(frontDeskUserRights);
  }, [frontDeskUserRights]);

  useEffect(() => {
    const body = {
      pageCount: 0,
      numPerPage: 20,
      searchString: '',
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    dispatch(stockLocationPaginationAction(body))
  }, []);

  const updateRegisterWithRights = (frontDeskUserRights) => {
    if (frontDeskUserRights && Array.isArray(frontDeskUserRights)) {
      const transformedRights = frontDeskUserRights.map((item) => ({
        type: item.type,
        parent: item.parent,
        right_name: item.right_name,
        value: item.value,
      }));

      setFormValues((prevValues) => ({
        ...prevValues,
        register: transformedRights,
      }));

      return transformedRights;
    }
    return [];
  };


  const handlePageSizeChange = async (size) => {
    setSearchData({ ...searchData, pageSize: size });
  }

  const resetDialog = (id) => {
    setReset(true);
    setReset_id(id)
  }

  const resetClose = () => {
    //  this.setState({open: false, dialog: false, reset: false});
    setReset(false)
  };

  const handlePageChange = async (page) => {
    setSearchData({ ...searchData, page: page });
  }

  const handleOpenMenu = (event, rowId) => {
    setAnchorEl(event.currentTarget);
    setMenuRowId(rowId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuRowId(null);
  };

  const handleEditOpen = (empId) => {
    const selectedEmployee = getAllFrontDesk.find(emp => emp.employee_id === empId);

    if (selectedEmployee) {

      const userRights = Array.isArray(selectedEmployee.user_rights)
        ? selectedEmployee.user_rights
        : (typeof selectedEmployee.user_rights === "string"
          ? JSON.parse(selectedEmployee.user_rights)
          : []);

      const registerRight = userRights.find(right =>
        right.right_name === "FaceRegister" || right.right_name === "offlineRegister"
      );
      const deRegisterRight = userRights.find(right =>
        right.right_name === "Deregister" || right.right_name === "offlineDeregister"
      );

      setRegisterStatus(registerRight ? registerRight.value : false);
      setDeRegisterStatus(deRegisterRight ? deRegisterRight.value : false);
      const usernameWithoutPrefix = selectedEmployee.username.split('.').pop();

      setFormValues({
        frontDesk_newUserName: usernameWithoutPrefix,
        frontDesk_newPassword: '',
        frontDesk_location: selectedEmployee.location_id,
        empIdForPasswordChange: empId
      });

    }
    setOpenDialog(true);
    setDialogMode('edit');
  };

  const requestSearch = (e) => {
    let val = e.target.value
    setSearchVal(val)
    let searchKeywords = val

    const searchSplit = searchKeywords.trim().split(/\s+/);

    const matchedRecords = getAllFrontDesk.filter((record) => {
      const recordValues = flattenObjectValues(record).join(" ").toLowerCase();

      const allKeywordsPresent = searchSplit.every((keyword) =>
        recordValues.includes(keyword.toLowerCase())
      );

      return allKeywordsPresent;
    });

    setFilteredData(matchedRecords)
  };

  const flattenObjectValues = (obj) => {
    const values = [];

    function flatten(value) {
      if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(flatten);
        } else {
          Object.values(value).forEach(flatten);
        }
      } else if (value !== null && value !== undefined) {
        let val = value.toString();
        values.push(val);
      }
    }

    flatten(obj);
    return values;
  };

  const cancelSearch = (e) => {
    setSearchVal('')
    setFilteredData(getAllFrontDesk);
  };

  const onShowNewPassword = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleCloseChangeDialog = () => {
    setDialogformErrors({});
    setFormValues(prevValues => ({
      ...prevValues,
      currentPasswordForChange: '',
      newPasswordForChange: '',
      confirmNewPasswordForChange: ''
    }));
    setChangeDialogOpen(false);
  };

  const handleOtpChange = (e) => {
    let { name, value } = e.target;
    setDialogformErrors((prevErrors) => ({
      ...prevErrors,
      otp: value ? '' : prevErrors.otp,
    }));
    setFormValues((prevValues) => ({
      ...prevValues,
      otp: value,
    }));
  };

  const handleGenerateOtp = async () => {

    const companyEmail = app_config_data.find(item => item.key_name === "company.email")?.value;

    try {
      setLoading(true);
      const data = { companyMail: companyEmail, person_id: formValues.person_id };
      const response = await dispatch(sendMailForgetPasswordAction(data, setLoaderStatusHandler));
      if (response && response.message === "mail sent") {
        setOtpFieldEnabled(true);
        setButtonLabel("Verify OTP");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };


  const handleVerifyOtp = async () => {
    const errors = {};

    if (!formValues.otp) {
      errors.otp = 'OTP is required';
    }

    setDialogformErrors(errors);
    setIsSubmitting(true);

    if (Object.keys(errors).length > 0) return;

    try {
      const data = {
        otp: formValues.otp,
        username: dialogUserName,
      };

      const response = await dispatch(verifyOtpAction(data));

      if (response && response.message === "otp verified") {
        setOtpVerified(true);
        setButtonLabel("Reset Password");
      }
    } catch (error) {
      console.error("OTP verification failed. Please try again.");
    }
  };

  const handleUpdatePassword = async () => {

    const errors = {};

    if (!formValues.newPassword) {
      errors.newPassword = 'Password is required.';
    } else if (formValues.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters long.';
    } else if (/\s/.test(formValues.newPassword)) {
      errors.newPassword = 'Password must not contain spaces.';
    }

    if (!formValues.confirmNewPassword) {
      errors.confirmNewPassword = 'Password is required.';
    }

    if (formValues.newPassword && formValues.confirmNewPassword && formValues.newPassword !== formValues.confirmNewPassword) {
      errors.confirmNewPassword = 'Passwords must match.';
    }

    setDialogformErrors(errors);
    setIsSubmitting(true);

    if (Object.keys(errors).length > 0) return;

    try {
      const data = {
        otp: formValues.otp,
        username: formValues.userName,
        password: formValues.confirmNewPassword
      };

      const response = await dispatch(updatePasswordAction(data));

      if (response && response.message === "password updated") {
        setFormValues(prevValues => ({
          ...prevValues,
          newPassword: '',
          confirmNewPassword: '',

        }));

        setOtpVerified(false);
        setOtpFieldEnabled(false);
        setButtonLabel("Generate OTP");
        handleCloseDialog();
      } else {
        console.error("Password update failed");
      }
    } catch (error) {
      console.error("OTP verification failed. Please try again.");
    }
  };

  const handleCreateUserSubmit = async () => {
    const errors = {};

    if (!formValues.frontDesk_newUserName) {
      errors.frontDesk_newUserName = 'Username is required';
    }
    if (dialogMode === 'create') {
      if (!formValues.frontDesk_newPassword) {
        errors.frontDesk_newPassword = 'Password is required.';
      } else if (formValues.frontDesk_newPassword.length < 6) {
        errors.frontDesk_newPassword = 'Password must be at least 6 characters long.';
      } else if (/\s/.test(formValues.frontDesk_newPassword)) {
        errors.frontDesk_newPassword = 'Password must not contain spaces.';
      }
    }
    if (!formValues.frontDesk_location) {
      errors.frontDesk_location = 'Location is required';
    }

    setDialogformErrors(errors);
    setIsSubmitting(true);

    if (Object.keys(errors).length > 0) return;

    const transformedRights =
      formValues.register || updateRegisterWithRights(frontDeskUserRights);

    let updatedRegister = (formValues.register || []).map((right) => {

      if (registerStatus === true && (right.right_name === "FaceRegister" || right.right_name === "offlineRegister")) {
        return { ...right, value: true };
      } else if (registerStatus === false && (right.right_name === "FaceRegister" || right.right_name === "offlineRegister")) {
        return { ...right, value: false };
      } else if (deRegisterStatus === true && (right.right_name === "Deregister" || right.right_name === "offlineDeregister")) {
        return { ...right, value: true };
      } else if (deRegisterStatus === false && (right.right_name === "Deregister" || right.right_name === "offlineDeregister")) {
        return { ...right, value: false };
      }

      return right;
    });

    const updatedRegisterForEdit = (() => {
      const selectedEmployee = getAllFrontDesk.find(
        (employee) => employee.employee_id === formValues.empIdForPasswordChange
      );

      if (!selectedEmployee || !selectedEmployee.user_rights || selectedEmployee.user_rights.length === 0) {

        return (transformedRights || []).map((right) => {

          if (registerStatus === true && (right.right_name === "FaceRegister" || right.right_name === "offlineRegister")) {
            return { ...right, value: true };
          } else if (registerStatus === false && (right.right_name === "FaceRegister" || right.right_name === "offlineRegister")) {
            return { ...right, value: false };
          } else if (deRegisterStatus === true && (right.right_name === "Deregister" || right.right_name === "offlineDeregister")) {
            return { ...right, value: true };
          } else if (deRegisterStatus === false && (right.right_name === "Deregister" || right.right_name === "offlineDeregister")) {
            return { ...right, value: false };
          }

          return right;
        });
      }

      return selectedEmployee.user_rights.map((right) => {
        if (registerStatus === true && (right.right_name === "FaceRegister" || right.right_name === "offlineRegister")) {
          return { ...right, value: true };
        } else if (registerStatus === false && (right.right_name === "FaceRegister" || right.right_name === "offlineRegister")) {
          return { ...right, value: false };
        } else if (deRegisterStatus === true && (right.right_name === "Deregister" || right.right_name === "offlineDeregister")) {
          return { ...right, value: true };
        } else if (deRegisterStatus === false && (right.right_name === "Deregister" || right.right_name === "offlineDeregister")) {
          return { ...right, value: false };
        }

        return right;
      });
    })();

    try {
      let response;

      if (dialogMode === 'create') {
        const data = {
          designation: "Front Office Executive",
          username: `${getprefix_data[0]?.value}.${formValues.frontDesk_newUserName}`,
          password: formValues.frontDesk_newPassword,
          role_name: "Front Desk",
          attendance_restrictions: 0,
          employeeId: null,
          token: "",
          category_id: 0,
          enableLiveLocation: 0,
          work_from_home: 0,
          selfie_attendance: 0,
          face_attendance: 0,
          manual_attendance: 0,
          attendance_via_app: 1,
          app_access: true,
          location_id: formValues.frontDesk_location,
          user_rights: updatedRegister,
        };

        response = await dispatch(createFrontDeskAction(data));

      } else if (dialogMode === 'edit') {
        const data = {
          username: `${getprefix_data[0]?.value}.${formValues.frontDesk_newUserName}`,
          location: formValues.frontDesk_location,
          employee_id: formValues.empIdForPasswordChange,
          userRights: updatedRegisterForEdit,
        };

        response = await dispatch(updateFrontDeskUserAction(data));
      }

      if (response && response.message === "Front Desk User Created Successfully" || response.message === "Updated successfully") {

        setOpenDialog(false);
        setFormValues(prevValues => ({
          ...prevValues,
          frontDesk_newUserName: '',
          frontDesk_newPassword: '',
          frontDesk_location: '',
        }));
        setRegisterStatus(false);
        setDeRegisterStatus(false);
        const data = {
          pageCount: searchData.page,
          numPerPage: searchData.pageSize,
          searchString: searchVal
        }
        dispatch(
          getAllFrontDeskAction(data),
        );
        const body = {
          pageCount: 'numPerPage',
          searchString: '',
          employeeId: commoncookie,
          headerLocationId: headerLocationId
        }
        dispatch(userCreationPaginationAction(body, (response) => {

          const adminUser = response.data.find(user => user.role_name === "Administrator");
          const frontDesk = response.data.find(user => user.role_name === "Front Desk");

          setFormValues(prevValues => ({
            ...prevValues,
            superAdmin_userName: adminUser?.username,
            superAdmin_password: adminUser?.password,
            superAdmin_personId: adminUser?.person_id,
            frontDesk_userName: frontDesk?.username,
            frontDesk_password: frontDesk?.password,
            frontDesk_personId: frontDesk?.person_id,
          }));
        }))
      } else {
        setOpenDialog(false);
        console.error(dialogMode === 'create' ? "User creation failed" : "User update failed");
      }

    } catch (error) {
      console.error(dialogMode === 'create' ? "User creation failed. Please try again." : "User update failed. Please try again.");
    }
  };

  const setStateHandler = async (name, value) => {
    let formObj = {};

    formObj = {
      ...formValues,
      [name]: value === '' ? '' : value,
    };

    await setFormValues(formObj);
  };

  const handleCloseCreate = (e) => {
    setDialogformErrors({});
    setFormValues((prev) => ({
      ...prev,
      frontDesk_newUserName: '',
      frontDesk_newPassword: '',
      frontDesk_location: ''
    }));
    setRegisterStatus(false);
    setDeRegisterStatus(false);
    setOpenDialog(false);
  };

  const handleChangePassword = async () => {
    const errors = {};

    if (!formValues.currentPasswordForChange) {
      errors.currentPasswordForChange = 'Password is required.';
    }
    if (!formValues.newPasswordForChange) {
      errors.newPasswordForChange = 'Password is required.';
    } else if (formValues.newPasswordForChange.length < 6) {
      errors.newPasswordForChange = 'Password must be at least 6 characters long.';
    } else if (/\s/.test(formValues.newPasswordForChange)) {
      errors.newPasswordForChange = 'Password must not contain spaces.';
    }
    if (!formValues.confirmNewPasswordForChange) {
      errors.confirmNewPasswordForChange = 'Password is required.';
    }

    if (formValues.newPasswordForChange && formValues.confirmNewPasswordForChange && formValues.newPasswordForChange !== formValues.confirmNewPasswordForChange) {
      errors.confirmNewPasswordForChange = 'Passwords must match.';
    }

    setDialogformErrors(errors);
    setIsSubmitting(true);

    if (Object.keys(errors).length > 0) return;

    try {
      const data = {
        employee_id: formValues.empIdForPasswordChange,
        oldPassword: formValues.currentPasswordForChange,
        newPassword: formValues.confirmNewPasswordForChange
      };

      const response = await dispatch(changepasswordAction(data));

      if (response && response.affectedRows > 0) {
        setFormValues(prevValues => ({
          ...prevValues,
          currentPasswordForChange: '',
          newPasswordForChange: '',
          confirmNewPasswordForChange: ''
        }));
        setChangeDialogOpen(false);
      }

    } catch (error) {
      console.error("ERROR");
    }
  };

  const handleOpenCreate = () => {
    setOpenDialog(true);
    setDialogMode('create');
  };

  const handleNewPasswordChange = (event) => {
    const { name, value } = event.target;
    setDialogformErrors((prevErrors) => ({
      ...prevErrors,
      newPassword: value ? '' : prevErrors.newPassword,
    }));
    setFormValues((prevValues) => ({
      ...prevValues,
      newPassword: value,
    }));
  };

  const handleConfirmPasswordChange = (event) => {
    const { name, value } = event.target;
    setDialogformErrors((prevErrors) => ({
      ...prevErrors,
      confirmNewPassword: value ? '' : prevErrors.confirmNewPassword,
    }));
    setFormValues((prevValues) => ({
      ...prevValues,
      confirmNewPassword: value,
    }));
  };

  const handleCloseDialog = (e) => {
    setDialogformErrors({});
    setFormValues(prevValues => ({
      ...prevValues,
      otp: '',
      newPassword: '',
      confirmNewPassword: ''
    }));
    setOtpVerified(false);
    setOtpFieldEnabled(false);
    setButtonLabel("Generate OTP");
    setPasswordDialogOpen(false);
    setDialogMode('create');
  };

  const handleChange = async (e) => {
    let { name, value } = e.target;
    setStateHandler(name, value);

    setDialogformErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value ? '' : prevErrors[name]
    }));
  };

  const handleToggleChange = (event) => {
    const newStatus = event.target.checked;
    setRegisterStatus(newStatus);
  };

  const handleToggleChangeForDeregister = (event) => {
    const newStatus = event.target.checked;
    setDeRegisterStatus(newStatus);
  };

  const frontDeskCreate = UserRightsAuthorization(menuAccess[selectedRole], 'info__front_desk', 'can_create')
  const frontDeskEdit = UserRightsAuthorization(menuAccess[selectedRole], 'info__front_desk', 'can_edit')

  console.log('formgotpass',formValues)

  return (
    <>
      <Card>
        <MaterialTable
          totalCount={getAllFrontDeskCount}
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
                    searchVal={searchVal}
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
            headerStyle,
            bodyOffset:200,
            options:{
              toolbar: true,
              cellStyle,
              paging: true,
              pageSize: pageSize,
              pageSizeOptions: [20, 50, 100],
              actionsColumnIndex: -1,
              search: false,
            }
          })}
          

          actions={[
            frontDeskCreate && {
              icon: 'add',
              tooltip: 'Create Front Desk',
              isFreeAction: true,
              onClick: (handleOpenCreate)
            },
            (rowData) => ({
              icon: () => {
                const [anchorEl, setAnchorEl] = useState(null);

                const handleOpenMenu = (event) => {
                  setAnchorEl(event.currentTarget);
                };

                const handleCloseMenu = () => {
                  setAnchorEl(null);
                };

                const handleChangePassword = (employeeId) => {
                  setFormValues((prevValues) => ({
                    ...prevValues,
                    userName: dialogUserName,
                    empIdForPasswordChange: employeeId,
                  }));
                  setChangeDialogOpen(true);
                  handleCloseMenu();
                };

                const handleForgotPassword = (username, personId) => {
                  setFormValues((prevValues) => ({
                    ...prevValues,
                    userName: username,
                    person_id: personId,
                  }));
                  setDialogUserName(username);
                  setPasswordDialogOpen(true);
                  handleCloseMenu();
                };

                return (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button
                      style={{
                        color: rowData.device_id ? 'white' : '#888',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        marginRight: '8px',
                        backgroundColor: rowData.device_id ? '#1976d2' : '#ccc',
                        boxShadow: 'none',
                        outline: 'none',
                      }}
                      onClick={() => resetDialog(rowData.employee_id)}
                      disabled={!rowData.device_id}
                      disableRipple
                      onMouseEnter={(e) => (e.target.style.boxShadow = 'none')}
                      onMouseLeave={(e) => (e.target.style.boxShadow = 'none')}
                    >
                      Deregister
                    </button>
                    <IconButton
                      onClick={handleOpenMenu}
                      style={{
                        boxShadow: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                      }}
                      disableRipple
                      disableFocusRipple
                    >
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleCloseMenu}
                      MenuListProps={{
                        disablePadding: true,
                        style: {
                          boxShadow: 'none',
                        },
                      }}
                    >
                      {frontDeskEdit && <MenuItem onClick={() => handleEditOpen(rowData.employee_id)}>Edit</MenuItem>}
                      <MenuItem onClick={() => handleChangePassword(rowData.employee_id, rowData.username)}>Change Password</MenuItem>
                      <MenuItem onClick={() => handleForgotPassword(rowData.username, rowData.person_id)}>Forgot Password</MenuItem>
                    </Menu>
                  </div>

                );
              },
            }),
          ]}
          columns={[
            {
              title: 'User Name',
              field: 'username',
            },
            {
              title: 'Location',
              field: 'location_name',
            },
            {
              title: 'Device Id',
              field: 'device_id',
            },
            {
              title: 'Last Active',
              field: 'last_active_date',
              render: (rowData) => rowData.last_active_date ? moment(rowData.last_active_date).format('DD-MM-YYYY') : '-',
            },
          ]}
          data={searchVal ? filteredData : getAllFrontDesk}
          title={
            <Typography
              className='page-title'
              variant='h6'
              align='left'
              style={{ paddingTop: '10px', paddingBottom: '10px' }}
            >
              Front Desk
            </Typography>
          }
        />

        <Grid>
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth>
            <DialogTitle>
              {dialogMode === 'create' ? 'Create Front Desk' : 'Edit Front Desk'}
            </DialogTitle>
            <br />
            <DialogContent>
              <Grid container spacing={2} direction="row">
                <Grid
                  style={{ marginBottom: '16px' }}
                  size={{
                    xs: 12,
                    md: 6
                  }}>
                  <TextField
                    inputRef={textRef}
                    fullWidth={true}
                    name='frontDesk_newUserName'
                    label='User Name'
                    autoComplete='off'
                    placeholder='User Name'
                    type='text'
                    value={
                      formValues.frontDesk_newUserName ? formValues.frontDesk_newUserName.includes('.') ? formValues.frontDesk_newUserName.split('.')[1] || '' : formValues.frontDesk_newUserName : ''
                    }
                    error={isSubmitting && !!dialogformErrors.frontDesk_newUserName}
                    helperText={isSubmitting && dialogformErrors.frontDesk_newUserName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {getprefix_data[0]?.value + "."}
                        </InputAdornment>
                      ),
                    }}
                    variant='filled'
                    required
                    onChange={handleChange}
                    onBlur={handleChange}
                  />
                </Grid>
                <Grid
                  style={{ marginBottom: '16px' }}
                  size={{
                    xs: 12,
                    md: 6
                  }}>
                  <TextField
                    onChange={handleChange}
                    onBlur={handleChange}
                    style={{}}
                    fullWidth={true}
                    placeholder='Password'
                    autoComplete="new-password"
                    label='Password'
                    name='frontDesk_newPassword'
                    value={
                      dialogMode === 'edit'
                        ? '*******'
                        : formValues.frontDesk_newPassword || ""
                    }
                    color='primary'
                    type={passwordVisibility.frontDesk_newPassword ? 'text' : 'password'}
                    required={dialogMode !== 'edit'}
                    regex=''
                    variant='filled'
                    disabled={dialogMode === 'edit'}
                    error={dialogMode !== 'edit' && isSubmitting && !!dialogformErrors.frontDesk_newPassword}
                    helperText={dialogMode !== 'edit' && isSubmitting && dialogformErrors.frontDesk_newPassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => onShowNewPassword('frontDesk_newPassword')}
                            edge="end"
                          >
                            {passwordVisibility.frontDesk_newPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
              <Grid
                style={{ marginBottom: '16px' }}
                size={{
                  xs: 12,
                  md: 6
                }}>
                <TextField
                  select
                  fullWidth={true}
                  name="frontDesk_location"
                  label="Location"
                  value={formValues.frontDesk_location || ""}
                  onChange={handleChange}
                  onBlur={handleChange}
                  variant="filled"
                  required
                  error={isSubmitting && !!dialogformErrors.frontDesk_location}
                  helperText={isSubmitting && dialogformErrors.frontDesk_location}
                >
                  {search_location_data.map((role, index) => (
                    <MenuItem key={index} value={role.location_id}>
                      {role.location_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid container spacing={2} direction="row">
                <Grid
                  style={{ marginBottom: '16px' }}
                  size={{
                    xs: 12,
                    md: 6
                  }}>
                  <FormControl
                    required={true}
                    component='fieldset'
                    fullWidth={true}
                  >
                    <Grid container alignItems="center" direction="row" wrap="nowrap">
                      <Grid>
                        <Switch
                          style={{}}
                          name='registerStatus'
                          size='medium'
                          color='primary'
                          onChange={handleToggleChange}
                          checked={registerStatus}
                        />

                      </Grid>
                      <Grid>
                        <Typography variant="body1" style={{ marginLeft: 8 }}>
                          Register
                        </Typography>
                      </Grid>
                    </Grid>
                  </FormControl>
                </Grid>
                <Grid
                  style={{ marginBottom: '16px' }}
                  size={{
                    xs: 12,
                    md: 6
                  }}>
                  <FormControl
                    required={true}
                    component='fieldset'
                    fullWidth={true}
                  >
                    <Grid container alignItems="center" direction="row" wrap="nowrap">
                      <Grid>
                        <Switch
                          style={{}}
                          name='registerStatus'
                          size='medium'
                          color='primary'
                          onChange={handleToggleChangeForDeregister}
                          checked={deRegisterStatus}
                        />

                      </Grid>
                      <Grid>
                        <Typography variant="body1" style={{ marginLeft: 8 }}>
                          De Register
                        </Typography>
                      </Grid>
                    </Grid>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button variant='contained' onClick={handleCloseCreate} color="error">
                Cancel
              </Button>
              <Button variant='contained' onClick={handleCreateUserSubmit} color="primary">
                {dialogMode === 'create' ? 'Create' : 'Update'}
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>


        <Grid>
          <Dialog
            open={changeDialogOpen}
            onClose={(event, reason) => {
              if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                handleCloseDialog();
              }
            }}
            maxWidth="sm"
            fullWidth
            sx={{
              '& .MuiDialog-paper': {
                overflow: 'hidden',
              },
            }}
          >
            <DialogTitle>Change Password</DialogTitle>
            <br />
            <DialogContent>
              <Grid container spacing={2} direction="row">
                <Grid
                  style={{ marginBottom: '16px' }}
                  size={{
                    xs: 12,
                    md: 6
                  }}>
                  <TextField
                    onChange={handleChange}
                    onBlur={handleChange}
                    required={true}
                    style={{}}
                    fullWidth={true}
                    placeholder='Current Password'
                    label='Current Password'
                    name='currentPasswordForChange'
                    type={passwordVisibility.currentPasswordForChange ? 'text' : 'password'}
                    value={
                      formValues.currentPasswordForChange === null ? '' : formValues.currentPasswordForChange
                    }
                    color='primary'
                    variant='filled'
                    error={isSubmitting && !!dialogformErrors.currentPasswordForChange}
                    helperText={isSubmitting && dialogformErrors.currentPasswordForChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            aria-label='toggle password visibility'
                            onClick={() => onShowNewPassword('currentPasswordForChange')}
                            edge='end'
                          >
                            {passwordVisibility.currentPasswordForChange ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid
                  style={{ marginBottom: '16px' }}
                  size={{
                    xs: 12,
                    md: 6
                  }}>
                  <TextField
                    onChange={handleChange}
                    onBlur={handleChange}
                    required={true}
                    style={{}}
                    fullWidth={true}
                    placeholder='New Password'
                    label='New Password'
                    name='newPasswordForChange'
                    type={passwordVisibility.newPasswordForChange ? 'text' : 'password'}
                    value={
                      formValues.newPasswordForChange === null ? '' : formValues.newPasswordForChange
                    }
                    color='primary'
                    variant='filled'
                    error={isSubmitting && !!dialogformErrors.newPasswordForChange}
                    helperText={isSubmitting && dialogformErrors.newPasswordForChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            aria-label='toggle password visibility'
                            onClick={() => onShowNewPassword('newPasswordForChange')}
                            edge='end'
                          >
                            {passwordVisibility.newPasswordForChange ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid
                  style={{ marginBottom: '16px' }}
                  size={{
                    xs: 12,
                    md: 6
                  }}>
                  <TextField
                    onChange={handleChange}
                    onBlur={handleChange}
                    required={true}
                    style={{}}
                    fullWidth={true}
                    placeholder='Retype New Password'
                    label='Retype New Password'
                    name='confirmNewPasswordForChange'
                    type={passwordVisibility.confirmNewPasswordForChange ? 'text' : 'password'}
                    value={
                      formValues.confirmNewPasswordForChange === null ? '' : formValues.confirmNewPasswordForChange
                    }
                    color='primary'
                    variant='filled'
                    error={isSubmitting && !!dialogformErrors.confirmNewPasswordForChange}
                    helperText={isSubmitting && dialogformErrors.confirmNewPasswordForChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            aria-label='toggle password visibility'
                            onClick={() => onShowNewPassword('confirmNewPasswordForChange')}
                            edge='end'
                          >
                            {passwordVisibility.confirmNewPasswordForChange ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button variant='contained' onClick={handleCloseChangeDialog} color="error">
                Cancel
              </Button>
              <Button variant='contained' onClick={handleChangePassword} color="primary">
                Change
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>

        <Grid>
          <Dialog
            open={passwordDialogOpen}
            onClose={(event, reason) => {
              if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                handleCloseDialog();
              }
            }}
            maxWidth="sm"
            fullWidth
            sx={{
              '& .MuiDialog-paper': {
                overflow: 'hidden',
              },
            }}
          >
            <DialogTitle>Forgot Password</DialogTitle>
            <br />
            <DialogContent>
              <Grid container spacing={2} direction="row">
                <Grid
                  style={{ marginBottom: '16px' }}
                  size={{
                    xs: 12,
                    md: 6
                  }}>
                  <TextField
                    label="Username"
                    variant="outlined"
                    value={dialogUserName}
                    fullWidth
                  />
                </Grid>
                <Grid
                  style={{ marginBottom: '16px' }}
                  size={{
                    xs: 12,
                    md: 6
                  }}>
                  <TextField
                    label="OTP"
                    variant="outlined"
                    value={formValues.otp}
                    onChange={handleOtpChange}
                    fullWidth
                    required
                    disabled={!otpFieldEnabled}
                    sx={{
                      '& .MuiInputBase-root': {
                        backgroundColor: otpFieldEnabled ? 'white' : 'rgba(0,0,0,0.1)',
                        opacity: otpFieldEnabled ? 1 : 0.6,
                      }
                    }}
                    error={isSubmitting && !!dialogformErrors.otp}
                    helperText={isSubmitting && dialogformErrors.otp ? dialogformErrors.otp : ''}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} direction="row">
                <Grid
                  size={{
                    xs: 12,
                    md: 6
                  }}>
                  <TextField
                    label="New Password"
                    name="newPassword"
                    variant="outlined"
                    type={passwordVisibility.newPassword ? 'text' : 'password'}
                    value={formValues.newPassword}
                    onChange={handleNewPasswordChange}
                    fullWidth
                    required
                    disabled={!otpVerified}
                    error={isSubmitting && !!dialogformErrors.newPassword}
                    helperText={isSubmitting && dialogformErrors.newPassword ? dialogformErrors.newPassword : ''}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            aria-label='toggle password visibility'
                            onClick={() => onShowNewPassword('newPassword')}
                            disabled={!otpVerified}
                            edge='end'
                          >
                            {passwordVisibility.newPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        backgroundColor: otpVerified ? 'white' : 'rgba(0,0,0,0.1)',
                        opacity: otpVerified ? 1 : 0.6,
                      }
                    }}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 6,
                    md: 6
                  }}>
                  <TextField
                    label="Re-type New Password"
                    name="confirmNewPassword"
                    variant="outlined"
                    type={passwordVisibility.confirmNewPassword ? 'text' : 'password'}
                    value={formValues.confirmNewPassword}
                    onChange={handleConfirmPasswordChange}
                    fullWidth
                    required
                    disabled={!otpVerified}
                    error={isSubmitting && !!dialogformErrors.confirmNewPassword}
                    helperText={isSubmitting && dialogformErrors.confirmNewPassword ? dialogformErrors.confirmNewPassword : ''}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            aria-label='toggle password visibility'
                            onClick={() => onShowNewPassword('confirmNewPassword')}
                            disabled={!otpVerified}
                            edge='end'
                          >
                            {passwordVisibility.confirmNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        backgroundColor: otpVerified ? 'white' : 'rgba(0,0,0,0.1)',
                        opacity: otpVerified ? 1 : 0.6,
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button variant='contained' onClick={handleCloseDialog} color="error">
                Cancel
              </Button>
              {loading ? (
                <CircularProgress />
              ) : (
                <Button variant='contained' onClick={() => {
                  if (buttonLabel === "Generate OTP") {
                    handleGenerateOtp();
                  } else if (buttonLabel === "Verify OTP") {
                    handleVerifyOtp();
                  } else if (buttonLabel === "Reset Password") {
                    handleUpdatePassword();
                  }
                }}
                  color="primary">
                  {buttonLabel}
                </Button>
              )}
            </DialogActions>
          </Dialog>
        </Grid>

        <ResetDialog
          reset={reset}
          handleClose={resetClose}
          id={reset_id}
          setResetConfirm={setResetConfirm}
        />
      </Card>
    </>
  );
}

