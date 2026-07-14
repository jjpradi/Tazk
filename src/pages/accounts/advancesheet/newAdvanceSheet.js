import {Button, Dialog, Grid, TextField, Typography, Autocomplete, FormControl, InputLabel, Select, MenuItem} from '@mui/material';
import {useFormik, Form, FormikProvider} from 'formik';
import * as Yup from 'yup';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  createAdvanceSheet,
  listAdvancesheetAction,
} from 'redux/actions/advancesheet_actions';
import { listCustomerAction } from 'redux/actions/customer_actions';
import { listVendorIdAndNameAction } from 'redux/actions/vendor_actions';
import context from '../../../context/CreateNewButtonContext';

export default function NewAdvanceSheet(props) {
  const dispatch = useDispatch();
  const {handleClose} = props;

  const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setselectData,
    selectData,
    setModalTypeHandler,
    commoncookie,
    headerLocationId,
    usertype,
  } = useContext(context);

  const { customerReducer: { customer }, vendorReducer: { vendorIdAndName: vendor } } = useSelector((state) => state);

  const [partyType, setPartyType] = useState('');
  const [selectedParty, setSelectedParty] = useState(null);

  useEffect(() => {
    if (!customer.length) {
      dispatch(listCustomerAction());
    }
    if (!vendor.length) {
      dispatch(listVendorIdAndNameAction());
    }
  }, [dispatch, customer.length, vendor.length]);

  const advanceSheetSchema = Yup.object().shape({
    name: Yup.string()
      .min(1, 'Too Short!')
      .max(50, 'Too Long!')
      .required('User Name is required'),
    loanAmount: Yup.string('Enter your Loan Amount').required(
      'Loan Amount is required',
    ),
    partyType: Yup.string().required('Party Type is required'),
    partyId: Yup.mixed().when('partyType', {
      is: (val) => val,
      then: Yup.mixed().required('Party selection is required'),
    }),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      officeName: '',
      loanAmount: '',
      reason: '',
      partyType: '',
      partyId: null,
    },

    validationSchema: advanceSheetSchema,

    onSubmit: () => {
      let values = {...formik.values};
      let data = {
        name: values.name,
        office_name: values.officeName,
        loan_amount: values.loanAmount,
        reason: values.reason,
        party_type: values.partyType,
        party_id: values.partyId,
      };

      dispatch(createAdvanceSheet(data));
      dispatch(
        listAdvancesheetAction(setModalTypeHandler, setLoaderStatusHandler),
      ),
        handleClose();
    },
  });

  const {errors, touched, handleSubmit, getFieldProps, setFieldValue, values} =
    formik;
  return (
    <FormikProvider value={formik}>
      <Form autoComplete='off' noValidate onSubmit={formik.handleSubmit}>
        <Grid
          container
          spacing={3}
          display='flex'
          flexDirection='row'
          alignItems='center'
        >
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Typography variant='h6' pt='10px'>
              New Advance Sheet
            </Typography>
          </Grid>
          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 4,
              xs: 12
            }}>
            <TextField
              name='name'
              label='Name'
              placeholder='Name'
              fullWidth
              size='medium'
              {...getFieldProps('name')}
              error={Boolean(touched.name && errors.name)}
              helperText={touched.name && errors.name}
            />
          </Grid>
          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 4,
              xs: 12
            }}>
            <TextField
              name='officeName'
              label='Office Name'
              placeholder='Office Name'
              fullWidth
              size='medium'
              {...getFieldProps('officeName')}
              //   error={Boolean(touched.officeName && errors.officeName)}
              //   helperText={touched.officeName && errors.officeName}
            />
          </Grid>
          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 4,
              xs: 12
            }}>
            <TextField
              name='loanAmount'
              label='Loan Amount'
              placeholder='Loan Amount'
              fullWidth
              size='medium'
              {...getFieldProps('loanAmount')}
              error={Boolean(touched.loanAmount && errors.loanAmount)}
              helperText={touched.loanAmount && errors.loanAmount}
            />
          </Grid>
          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 4,
              xs: 12
            }}>
            <TextField
              name='reason'
              label='Reason'
              placeholder='Reason'
              fullWidth
              size='medium'
              {...getFieldProps('reason')}
              //   error={Boolean(touched.reason && errors.reason)}
              //   helperText={touched.reason && errors.reason}
            />
          </Grid>
          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 4,
              xs: 12
            }}>
            <FormControl fullWidth error={Boolean(touched.partyType && errors.partyType)}>
              <InputLabel>Party Type</InputLabel>
              <Select
                {...getFieldProps('partyType')}
                label="Party Type"
                onChange={(e) => {
                  setFieldValue('partyType', e.target.value);
                  setFieldValue('partyId', null);
                  setPartyType(e.target.value);
                  setSelectedParty(null);
                }}
              >
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="supplier">Supplier</MenuItem>
              </Select>
              {touched.partyType && errors.partyType && (
                <Typography variant="caption" color="error">
                  {errors.partyType}
                </Typography>
              )}
            </FormControl>
          </Grid>
          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 4,
              xs: 12
            }}>
            <Autocomplete
              disabled={!values.partyType}
              value={selectedParty}
              options={
                values.partyType === 'customer'
                  ? customer.filter(c => c.company_name && c.customer_id)
                  : values.partyType === 'supplier'
                  ? vendor.filter(v => v.company_name && v.supplier_id)
                  : []
              }
              getOptionLabel={(option) => option?.company_name || ''}
              onChange={(e, value) => {
                setSelectedParty(value);
                setFieldValue('partyId', value ? (values.partyType === 'customer' ? value.customer_id : value.supplier_id) : null);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={values.partyType === 'customer' ? 'Select Customer' : values.partyType === 'supplier' ? 'Select Supplier' : 'Select Party'}
                  error={Boolean(touched.partyId && errors.partyId)}
                  helperText={touched.partyId && errors.partyId}
                  required
                />
              )}
            />
          </Grid>
          <Grid
            spacing={7}
            container={true}
            direction='row'
            display='flex'
            justifyContent='flex-end'
            paddingTop='25px'
          >
            <Grid>
              <Button
                onClick={() => handleClose()}
                style={{}}
                name='Cancel'
                variant='contained'
                color='secondary'
                size='medium'
                text='button'
                fullWidth={false}
                type='cancel'
              >
                Cancel
              </Button>
            </Grid>

            <Grid>
              <Button
                onClick={handleSubmit}
                style={{}}
                name='Submit'
                variant='contained'
                color='primary'
                size='medium'
                text='button'
                fullWidth={false}
                type='submit'
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Form>
    </FormikProvider>
  );
}
