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
import {CreateNotificationAction} from 'redux/actions/notification_actions';
import {sendNtfy} from 'firebase/firebase.service';
import {getTokenByEmpId} from 'redux/actions/userRole_actions';
import notificationType from 'firebase/notify_type';
import {getDateTimeFormat} from 'utils/getTimeFormat';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {cancelLeaveRequestAction} from 'redux/actions/leaveRequest_actions';
import {useDispatch} from 'react-redux';
import Draggable from 'react-draggable';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import {updateRelievingDateAction} from 'redux/actions/userCreation_actions';
import moment from 'moment';
import {get_searchContactsActionFinal} from 'redux/actions/customer_actions';
// import {propTypes} from 'velocity-react/velocity-component';
import {propTypes} from 'prop-types';
import { ReleiveAlert } from 'redux/actions/load';
import toMomentOrNull from 'utils/DateFixer';

// function PaperComponent(props) {
//   return (
//     <Draggable
//       handle='#draggable-dialog-title'
//       cancel={'[class*="MuiDialogContent-root"]'}
//     >
//       <Paper {...props} />
//     </Draggable>
//   );
// }

function RelieveDialog(props) {
  const dispatch = useDispatch();
  const storage = getsessionStorage();

  const {open, handleClose, employee_id, person_id, handle, relieving_date} = props;
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const reasonSchema = Yup.object().shape({
    relievingDate: Yup.date()
      .typeError('Invalid!')
      .required('Date is Required!'),
  });

  const formik = useFormik({
    initialValues: {
      relievingDate: relieving_date || '',
    },

    validationSchema: reasonSchema,

    onSubmit: () => {
      let values = {...formik.values};

      let body = {
        relievingDate: moment(values.relievingDate).format('YYYY-MM-DD'),
        employee_id,
        person_id,
      };

      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          updateRelievingDateAction(body, (response) => {
            if (response === 'SUCCESS' || response === 'UPDATED') {
              const body = {
                searchString: '',
                type_details: 'employee',
                type: 3,
                pageCount: 0,
                numPerPage: 15,
              };
              apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(
                  get_searchContactsActionFinal(
                    body,
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                  ),
                ),
              );
              // handle();
            } else if(response === 'NOT PROCESSED'){
             ReleiveAlert(dispatch)
            }
          }),
        ),
      );
    },
  });

  const {errors, touched, getFieldProps, setFieldValue, handleSubmit, values} =
    formik;

  return (
    <Dialog
      open={open}
      onClose={() => handleClose(false)}
      // PaperComponent={PaperComponent}
      maxWidth='sm'
      maxHeight='sm'
      fullWidth
      // aria-labelledby='draggable-dialog-title'
    >
      <DialogTitle style={{cursor: 'move'}}>
        <Typography>{'Relieving Date'}</Typography>
      </DialogTitle>
      <DialogContent>
        <FormikProvider value={formik}>
          <Form autoComplete='off' noValidate onSubmit={formik.handleSubmit}>
            <Box width='100%' sx={{p: '10px'}}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  disabled={relieving_date ? true : false}
                  value={toMomentOrNull(values.relievingDate)}
                  format='DD/MM/YYYY'
                  onChange={(newValue) =>
                    setFieldValue('relievingDate', newValue)
                  }
                  slotProps={{ textField: { fullWidth: true, required: true, error: touched[`relievingDate`] &&
                        Boolean(errors[`relievingDate`]), helperText: touched[`relievingDate`] && errors[`relievingDate`], variant: 'filled' } }}
                />
              </LocalizationProvider>
            </Box>
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions>
        <Button color='secondary' onClick={() => handleClose(false)}>
          {'Close'}
        </Button>
        <Button disabled={relieving_date ? true : false} onClick={() => { handleSubmit(); handleClose(true); }}>{'Submit'}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default RelieveDialog;

RelieveDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  employee_id: PropTypes.number,
  person_id: PropTypes.number,
  handle: PropTypes.func,
};
