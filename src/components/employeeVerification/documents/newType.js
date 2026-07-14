import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Box, // Import Box from MUI
} from '@mui/material';
import {Form, FormikProvider, useFormik} from 'formik';
import * as Yup from 'yup';
import {useDispatch} from 'react-redux';
import {createNewTypeAction} from 'redux/actions/userCreation_actions';

function NewType(props) {
  const {open, handleClose, userId, index} = props;
  const dispatch = useDispatch();

  const reasonSchema = Yup.object().shape({
    name: Yup.string().required('Remark is required'),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
    },

    validationSchema: reasonSchema,

    onSubmit: (values) => {
      let payload = {
        type: index,
        name: values.name,
      };

      dispatch(createNewTypeAction(payload, () => {}));
      handleClose();
      formik.resetForm();
    },
  });

  const {errors, touched, getFieldProps, handleSubmit} = formik;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm'>
      <DialogTitle>Add New Type</DialogTitle>
      <FormikProvider value={formik}>
        <Form autoComplete='off' noValidate onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3} sx={{p: '10px'}}>
              <Grid
                size={{
                  md: 12,
                  xs: 12
                }}>
                <TextField
                  required
                  fullWidth
                  label='Name'
                  name='name'
                  {...getFieldProps('name')}
                  error={Boolean(touched.name && errors.name)}
                  helperText={touched.name && errors.name}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </DialogActions>
        </Form>
      </FormikProvider>
    </Dialog>
  );
}

export default NewType;
