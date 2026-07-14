import React, {useState, useEffect, useRef} from 'react';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
import {formLabelsTheme} from './Asterisk';
import {
  Button,
  Switch,
  TextField,
  Typography,
  Grid,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  FormHelperText,
  Link,
} from '@mui/material';
import {getTrimmedData} from './trimFunction/index';

function NewTrans(props) {
  const [formValues, setFormValues] = useState({
    paymentName: null,
    paymentType: null,
    shortCode: null,
    bankName: null,
    accountNumber: null,
    accountType: null,
  });
  const [formErrors, setFormErrors] = useState({
    paymentName: null,
    paymentType: null,
    shortCode: null,
    bankName: null,
    accountNumber: null,
    accountType: null,
  });
  const [requiredFields] = useState([
    'paymentName',
    'paymentType',
    'shortCode',
    'bankName',
    'accountNumber',
    'accountType',
  ]);
  const [regex] = useState({});
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempedits = useRef(null);

  const initsform = () => {
    setInitialState(formValues);
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, []);

  const inits = () => {
    if (JSON.stringify(initialState) !== JSON.stringify(formValues)) {
      setDirty();
      setForm(true);
    } else {
      setPristine();
      setForm(false);
    }
  };
  tempinits.current = inits;
  useEffect(() => {
    tempinits.current();
  }, [formValues, initialState]);

  const handleChange = async (e) => {
    let {name, value} = e.target;

    setStateHandler(name, value);
  };

  const cancel = () => {
    setDialog(false);
  };

  const validClose = () => {
    setDialog(true);
  };

  const setStateHandler = async (name, value) => {
    let formObj = {};

    formObj = {
      ...formValues,
      [name]: value === '' ? null : value,
    };

    await setFormValues(formObj);
    validationHandler(name, value);
  };

  const validationHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;

    if (
      requiredFields.includes(name) &&
      (value === null ||
        value === 'null' ||
        value === '' ||
        value === false ||
        (Object.keys(value) && value.value === null))
    ) {
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name) + ' is Required!',
      });
    } else if (regex[name]) {
      if (!regex[name].test(value)) {
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Invalid!',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      }
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;
    let formErrorsObj = {...formErrors};
    await Object.keys(formValues).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + 'is Required!';
      } else if (regex[key]) {
        if (!regex[key].test(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + 'is Invalid!';
        }
      }
      return null;
    });
    await setFormErrors(formErrorsObj);

    // alert("Is Form Valid - " + isValid);

    // API call..
    if (isValid) props.handleSubmit(getTrimmedData(formValues));
  };

  const edits = () => {
    if (props.edit_id_data[0] && props.status === 'edit') {
      setFormValues(props.edit_id_data[0]);
      setInitialState(props.edit_id_data[0]);
    }
  };
  tempedits.current = edits;
  useEffect(() => {
    tempedits.current();
  }, [props.edit_id_data]);

  return (
    <>
      {Prompt}
      <Typography variant='h5' align='left' style={{}}>
        PaymentMethod
      </Typography>
      <Grid
        spacing={3}
        // lg={12}
        // md={12}
        // sm={12}
        // xs={12}
        container
        direction='row'
        //
      >
        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder=' Enter Payment Name'
            label='Payment Name'
            name='paymentName'
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='standard'
            value={
              formValues.paymentName === null ? '' : formValues.paymentName
            }
            error={formErrors.paymentName === null ? false : true}
            helperText={
              formErrors.paymentName === null ? '' : formErrors.paymentName
            }
          />
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder=' Enter Payment Type'
            label='Payment Type'
            name='paymentType'
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='standard'
            value={
              formValues.paymentType === null ? '' : formValues.paymentType
            }
            error={formErrors.paymentType === null ? false : true}
            helperText={
              formErrors.paymentType === null ? '' : formErrors.paymentType
            }
          />
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder=' Enter Short Code'
            label='Short Code'
            name='shortCode'
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='standard'
            value={formValues.shortCode === null ? '' : formValues.shortCode}
            error={formErrors.shortCode === null ? false : true}
            helperText={
              formErrors.shortCode === null ? '' : formErrors.shortCode
            }
          />
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder=' Enter Bank Name'
            label='Bank Name'
            name='bankName'
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='standard'
            value={formValues.bankName === null ? '' : formValues.bankName}
            error={formErrors.bankName === null ? false : true}
            helperText={formErrors.bankName === null ? '' : formErrors.bankName}
          />
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            placeholder=' Enter Account Number'
            label='Account Number'
            name='accountNumber'
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='standard'
            value={
              formValues.accountNumber === null ? '' : formValues.accountNumber
            }
            error={formErrors.accountNumber === null ? false : true}
            helperText={
              formErrors.accountNumber === null ? '' : formErrors.accountNumber
            }
          />
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <FormControl required={true} component='fieldset' fullWidth={true}>
            <InputLabel>Account Type</InputLabel>
            <Select
              style={{}}
              name='accountType'
              label='Account Type'
              items={[
                {label: 'Select one', value: ''},
                {label: 'one', value: 'one'},
                {label: 'two', value: 'two'},
              ]}
              required={false}
              onChange={handleChange}
              //defalutValue=''
              value={
                formValues.accountType === null ? '' : formValues.accountType
              }
            >
              <MenuItem value=''>Select one</MenuItem>
              <MenuItem value={'one'}>option 1</MenuItem>
              <MenuItem value={'two'}>option 2</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid
          spacing={0}
          // lg={12}
          // md={12}
          // sm={12}
          // xs={12}
          container
          direction='row'
          //
        >
          <Grid
            size={{
              lg: 2,
              md: 3,
              sm: 6,
              xs: 6
            }}>
            {form === false ? (
              <Button
                onClick={() => props.handleClose()}
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
            ) : (
              <Button
                onClick={() => validClose()}
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
            )}
          </Grid>

          <Grid
            size={{
              lg: 2,
              md: 3,
              sm: 6,
              xs: 6
            }}>
            <Button
              onClick={handleSubmit}
              name='Submit'
              size='medium'
              text='button'
              color='primary'
              style={{}}
              variant='contained'
              fullWidth={false}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <CancelDialog
        handle={cancel}
        delete={dialog}
        close={props.handleClose}
      ></CancelDialog>
    </>
  );
}

export default NewTrans;
