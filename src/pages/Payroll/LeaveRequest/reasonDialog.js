import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import {useFormik, Form, FormikProvider} from 'formik';
import * as Yup from 'yup';
import React, {useContext} from 'react';
import {getsessionStorage} from 'pages/common/login/cookies';
import {
  CreateNotificationAction,
  getNotificationTokenAction,
} from 'redux/actions/notification_actions';
import {sendNtfy} from 'firebase/firebase.service';
import {getTokenByEmpId} from 'redux/actions/userRole_actions';
import notificationType from 'firebase/notify_type';
import {getDateTimeFormat} from 'utils/getTimeFormat';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {cancelLeaveRequestAction, cancelPosRequestAction} from 'redux/actions/leaveRequest_actions';
import {useDispatch} from 'react-redux';
import Draggable from 'react-draggable';
import { roleType, roleTypeWithOutEmployee } from 'utils/roleType';
import { idID } from '@mui/material/locale';

function PaperComponent(props) {
  const nodeRef = React.useRef(null);
  return (
    <Draggable
      nodeRef={nodeRef}
      handle='#draggable-dialog-title'
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper ref={nodeRef} {...props} />
    </Draggable>
  );
}

function ReasonDialog(props) {
  const dispatch = useDispatch();
  const storage = getsessionStorage();

  const {open, handleClose, data} = props;
 
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const reasonSchema = Yup.object().shape({
    reason_for_rejection: Yup.string()
      .min(2, 'Too Short!')
      .max(500, 'Too Long!')
      .required('Reason is required'),
  });

  const formik = useFormik({
    initialValues: {
      reason_for_rejection: '',
    },

    validationSchema: reasonSchema,

    onSubmit: () => {
      let values = {...formik.values};

      let payloadData = data;
      data.reason_for_rejection = values.reason_for_rejection;
      
      handleCancel(payloadData);
    },
  });

  const handleCancel = async (data) => {
    
    if(storage.company_type == 5){
    const cancelledBy = {
      cancelledBy: storage?.first_name,
      reason_for_rejection: data.reason_for_rejection,
      rejectedById:storage?.employee_id,
      request_type : data.correction_type === 1 ? 3 : (data?.request_type == 1 ? 1 : (data?.request_type == 2 ? 2 : 4) ),
      key : "ApprovalPage"
    };

    const leaveId =
      roleTypeWithOutEmployee.includes(storage?.role_name) ? data?.leaveId : data;

    if (leaveId !== '') {
      if (data.correction_type === 1) {
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(
            cancelLeaveRequestAction(
              commoncookie,
              leaveId,
              cancelledBy,
              responseAtt,
            ),
          ),
        );
        handleClose(false);
      } else {
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(
            cancelLeaveRequestAction(
              commoncookie,
              leaveId,
              cancelledBy,
              response,
            ),
          ),
        );
        handleClose(false);
      }
    }
  }
  if(storage.company_type == 2){
    const cancelledBy = {
      cancelledBy: storage?.first_name,
      reason_for_rejection: data.reason_for_rejection,
      rejectedById:storage?.employee_id,
      request_type : data?.request_type,
      posId : data.pos_id
    };

    const id =
      roleTypeWithOutEmployee.includes(storage?.role_name) ? data?.id : data;

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        cancelPosRequestAction(
          commoncookie,
          id,
          cancelledBy,
          responseAtt,
        ),
      ),
    );
    handleClose(false);
  }
  };

  const response = () => {
    console.log("asfafsfsfsf")
    // let emp_id = this.storage?.employee_id || '';
    let employee_id = data?.employee_id;
    let type = data?.request_type == 1 ? 'Leave Rejection' : data?.request_type == 2 ? 'Permission Rejection' : 'Leave Rejection';
    const fromDateOnly = data.fromDate.split('T')[0];
    const toDateOnly = data.toDate.split('T')[0];
    let data1 = {
      type,
      employee_id,
      keyForNotifications: 'Verifier',
      deniedBy:storage?.first_name,
      deniedReason : data.reason_for_rejection,
      date_range : fromDateOnly,
      date_range_to : toDateOnly
    };

    dispatch(
      getNotificationTokenAction(data1, (res) => {
        if (res?.status === 200) {
          dispatch(
            CreateNotificationAction({
              content_body: res?.data.body,
              title: res?.data?.title,
              time: getDateTimeFormat(new Date()),
              active: '1',
              receiver: employee_id,
              type : type,
              type_id : res?.data?.id
            }),
          );
        }
      }),
    );

    // let storage = getsessionStorage();
    // let emp_id = storage?.employee_id || '';
    // let EmpId = data?.employee_id
    // dispatch(
    //   getTokenByEmpId(EmpId, (token, content) => {
    //     let notify_type = notificationType('Leave Rejection');
    //     let notify_content = content?.filter(
    //       (m) => m.notification_type === notify_type,
    //     );
    //     if (notify_content.length) {
    //       let content_body = notify_content[0].body_msg;
    //       sendNtfy(token, notify_content[0]?.title, content_body);
    //       dispatch(
    //         CreateNotificationAction({
    //           content_body: content_body,
    //           title: notify_content[0]?.title,
    //           time: getDateTimeFormat(new Date()),
    //           active: '1',
    //           receiver : EmpId
    //         }),
    //       );
    //     }
    //   }),
    // );
  };

  const responseAtt = () => {

    let employee_id = data?.employee_id;
    let type = 'Attendance Correction Rejection';
    let data1 = {
      type,
      employee_id,
      keyForNotifications: 'Verifier',
      attDeniedBy:storage?.first_name,
      attDeniedReason : data.reason_for_rejection
    };

    dispatch(
      getNotificationTokenAction(data1, (res) => {
        if (res?.status === 200) {
          dispatch(
            CreateNotificationAction({
              content_body: res?.data.body,
              title: res?.data?.title,
              time: getDateTimeFormat(new Date()),
              active: '1',
              receiver: employee_id,
            }),
          );
        }
      }),
    );
    // let storage = getsessionStorage();
    // let emp_id = storage?.employee_id || '';
    // dispatch(
    //   getTokenByEmpId(emp_id, (token, content) => {
    //     let notify_type = notificationType('Attendance Correction Rejection');
    //     let notify_content = content?.filter(
    //       (m) => m.notification_type === notify_type,
    //     );
    //     if (notify_content.length) {
    //       let content_body = notify_content[0].body_msg;
    //       sendNtfy(token, notify_content[0]?.title, content_body);
    //       dispatch(
    //         CreateNotificationAction({
    //           content_body: content_body,
    //           title: notify_content[0]?.title,
    //           time: getDateTimeFormat(new Date()),
    //           active: '1',
    //         }),
    //       );
    //     }
    //   }),
    // );
  };

  const {errors, touched, getFieldProps, handleSubmit, values} = formik;

  return (
    <Dialog
      open={open}
      onClose={() => handleClose(false)}
      PaperComponent={PaperComponent}
      maxWidth='sm'
      maxHeight='sm'
      fullWidth
      aria-labelledby='draggable-dialog-title'
    >
      <DialogTitle style={{cursor: 'move'}} id='draggable-dialog-title'>
        <Typography>{'Reason'}</Typography>
      </DialogTitle>
      <DialogContent>
        <FormikProvider value={formik}>
          <Form autoComplete='off' noValidate onSubmit={formik.handleSubmit}>
            <Box width='100%' sx={{p: '10px'}}>
              <TextField
                required
                fullWidth
                label='Reason'
                name='reason_for_rejection'
                type='text'
                {...getFieldProps('reason_for_rejection')}
                error={Boolean(
                  touched.reason_for_rejection && errors.reason_for_rejection,
                )}
                helperText={
                  touched.reason_for_rejection && errors.reason_for_rejection
                }
              />
            </Box>
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions>
        <Button color='secondary' onClick={() => handleClose(false)}>
          {'Close'}
        </Button>
        <Button onClick={handleSubmit}>{'Submit'}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReasonDialog;

ReasonDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  handleCancel: PropTypes.func,
  data: PropTypes.object,
};
