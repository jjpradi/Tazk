import React, {useState, useEffect, useRef} from 'react';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
import _ from 'lodash';
// import {formLabelsTheme} from "./Asterisk";
import {
  Button,
  TextField,
  InputLabel,
  FormHelperText,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {getTrimmedData} from './trimFunction/index';

function NewDiscountType(props) {
  const [formValues, setFormValues] = useState({
    discount_name: '',
    discount_percentage: '',
  });
  const [formErrors, setFormErrors] = useState({
    discount_name: null,
    discount_percentage: null,
  });
  const [requiredFields] = useState(['discount_name', 'discount_percentage']);
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
  const formErrorsObj = {};

  Object.keys(formValues).forEach((key) => {
    const value = formValues[key];
    if (
      requiredFields.includes(key) &&
      (value === null || value === '' || value === 'null')
    ) {
      isValid = false;
      formErrorsObj[key] = capitalize(key) + ' is Required!';
    } else if (regex[key]) {
      if (!regex[key].test(value)) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Invalid!';
      } else {
        formErrorsObj[key] = null;
      }
    } else {
      formErrorsObj[key] = null;
    }
  });

  setFormErrors(formErrorsObj);

  if (isValid) {
    props.handleSubmit(formValues);
  }
};


const edits = () => {
  if (
    props.edit_id_data &&
    typeof props.edit_id_data === 'object' &&
    !Array.isArray(props.edit_id_data)
  ) {
    setFormValues(props.edit_id_data);
    setInitialState(props.edit_id_data);
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
        Discount Type
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
            lg: 6,
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
            placeholder=' Enter Discount name'
            label='Discount name'
            name='discount_name'
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='standard'
            value={
              formValues.discount_name === null ? '' : formValues.discount_name
            }
            error={formErrors.discount_name === null ? false : true}
            helperText={
              formErrors.discount_name === null ? '' : 'Discount name is Required!'
            }
          />
        </Grid>

        <Grid
          size={{
            lg: 6,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
             onChange={(e) => {
              let value = parseFloat(e.target.value);
              if (isNaN(value)) {
                handleChange({
                  target: {
                    name: 'discount_percentage',
                    value: '',
                  },
                });
                return;
              }
              if (value > 100) value = 100;
              if (value <= 0) {
                // Disallow 0 or negative values
                value = '';
              }
              handleChange({
                target: {
                  name: 'discount_percentage',
                  value
                },
              });
            }}
            onBlur={handleChange}
            required={true}
            style={{}}
            fullWidth={true}
            onWheel={ (e) => e.target.blur()}
            placeholder=' Enter Percentage'
            label='Percentage'
            name='discount_percentage'
            color='primary'
            multiline={false}
            // type="number"
            type='number'
            regex=''
            variant='standard'
            value={
              formValues.discount_percentage === null
                ? ''
                : formValues.discount_percentage
            }
            error={formErrors.discount_percentage === null ? false : true}
            helperText={
              formErrors.discount_percentage === null
                ? ''
                :'Percentage is Required!'
            }
          />
        </Grid>

        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid
            spacing={2}
            // lg={12}
            // md={12}
            // sm={12}
            // xs={12}
            //
            container
            justifyContent={'flex-end'}
          >
            <Grid>
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

            <Grid>
              <Button
                onClick={handleSubmit}
                style={{}}
                name='SUBMIT'
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
      </Grid>
      <CancelDialog
        handle={cancel}
        delete={dialog}
        close={props.handleClose}
      ></CancelDialog>
    </>
  );
}

export default NewDiscountType;
