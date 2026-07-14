import React, {useState, useEffect, useContext, useRef} from 'react';
import context from '../context/CreateNewButtonContext';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
// import {formLabelsTheme} from "./Asterisk";
import {
  Button,
  TextField,
  Typography,
  Grid,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  FormHelperText,
} from '@mui/material';
import Link from '@mui/material/Link';
import {getTrimmedData} from './trimFunction/index';
import { listTaxCodesAction } from 'redux/actions/taxcodes_actions';
import { listTaxCategoryAction } from 'redux/actions/tax_Category_actions';
import { listTaxJurisdictionAction } from 'redux/actions/tax_Jurisdiction_actions';
import { useDispatch, useSelector } from 'react-redux';
import TaxCodes from 'pages/sales/taxCodes';
import TaxJurisdiction from 'pages/sales/taxJurisdiction';
import TaxCategory from 'pages/sales/taxCategory';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';

function NewTaxRate(props) {
  const [formValues, setFormValues] = useState({
    rate_tax_code_id: null,
    rate_tax_category_id: null,
    rate_jurisdiction_id: null,
    tax_rate: null,
  });
  const [formErrors, setFormErrors] = useState({
    rate_tax_code_id: null,
    rate_tax_category_id: null,
    rate_jurisdiction_id: null,
    tax_rate: null,
  });
  const [requiredFields] = useState([
    'rate_tax_code_id',
    'rate_tax_category_id',
    'rate_jurisdiction_id',
    'tax_rate',
  ]);
  const [openCategory, setOpenCategory] = React.useState(false);
  const [openCodes, setOpenCodes] = React.useState(false);
  const [openJurisdiction, setOpenJurisdiction] = React.useState(false);
  const [regex] = useState({});
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const [taxCodeOpen, setTaxCodeOpen] = useState(false);
  const [taxCategoryOpen, setTaxCategoryOpen] = useState(false);
  const [taxJurisdictionOpen, setTaxJurisdictionOpen] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const {selectData, setselectData} = useContext(context);
  const { taxCodeReducer: { taxcodes }, taxCategoryReducer: { taxcategory }, taxjurisdictionReducer: { taxjurisdiction } } = useSelector((state) => state);
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const temptaxedits = useRef(null);
  const tempedits = useRef(null);
  const temptaxcode = useRef(null);
  const tempselecttax = useRef(null);
  const dispatch = useDispatch();

  const initsform = () => {
    setInitialState(formValues);

    dispatch(listTaxCodesAction());
    dispatch(listTaxCategoryAction());
    dispatch(listTaxJurisdictionAction());

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
    setOpenCategory(false);
    setOpenCodes(false);
    setOpenJurisdiction(false);
    let {name, value} = e.target;

    setStateHandler(name, value);
  };

  const cancel = () => {
    setDialog(false);
  };

  const validClose = (props) => {
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
      (value === null || value === 'null' || value === '' || value === false)
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

  const handleSubmitt = async (event) => {
    event.preventDefault();

    let isValid = true;
    let formErrorsObj = {...formErrors};
    await Object.keys(formValues).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '' || formValues[key] == undefined)
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      } else if (regex[key]) {
        if (!regex[key].test(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Invalid!';
        }
      }
      return null;
    });
    await setFormErrors(formErrorsObj);

    //   alert("Is Form Valid - " + isValid);
    if (isValid) {
      props.handleSubmit(getTrimmedData(formValues));
    }
    else{
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
    // API call..
  };

  const edits = () => {
    if (props.edit_id_data[0] && props.status === 'edit') {
      const {
        rate_tax_code_id,
        rate_tax_category_id,
        rate_jurisdiction_id,
        tax_rate,
        tax_rate_id,
      } = props.edit_id_data[0];
      setFormValues({
        rate_tax_code_id,
        rate_tax_category_id,
        rate_jurisdiction_id,
        tax_rate,
        tax_rate_id,
      });
      setInitialState({
        rate_tax_code_id,
        rate_tax_category_id,
        rate_jurisdiction_id,
        tax_rate,
        tax_rate_id,
      });
    }
  };
  tempedits.current = edits;
  useEffect(() => {
    tempedits.current();
  }, [props.edit_id_data]);

  //taxcategory

  const taxedits = () => {
    if (selectData.taxcategory === true) {
      const filter = [...props.taxcategory];
      const popca = filter.pop();
      setFormValues({
        ...formValues,
        rate_tax_category_id: popca.tax_category_id,
      });
      setFormErrors({...formErrors, rate_tax_category_id: false});
      setselectData('taxcategory', false);
    }
    if (selectData.taxcategory === 'update') {
      setOpenCategory(true);
      setselectData('taxcategory', false);
    }
  };
  temptaxedits.current = taxedits;
  useEffect(() => {
    // if(props.status !== 'edit'){
    temptaxedits.current();
    // }
  }, [selectData.taxcategory]);

  //taxcodes

  const taxcode = () => {
    if (selectData.taxcodes === true) {
      const filter = [...props.taxcodes];
      const popc = filter.pop();
      setFormValues({...formValues, rate_tax_code_id: popc.tax_code_id});
      setFormErrors({...formErrors, rate_tax_code_id: false});
      setselectData('taxcodes', false);
    }
    if (selectData.taxcodes === 'update') {
      setOpenCodes(true);
      setselectData('taxcodes', false);
    }
  };

  temptaxcode.current = taxcode;
  useEffect(() => {
    // if(props.status !== 'edit'){
    temptaxcode.current();
    // }
    // if (selectData.taxcodes) {
    //   const filter = [...props.taxcodes]
    //   const popc = filter.pop()
    //   setFormValues({ ...formValues, rate_tax_code_id: popc.tax_code_id })
    //   setFormErrors({ ...formErrors, rate_tax_code_id: false })
    //   setselectData('taxcodes', false)
    // }
    //  temptaxcode.current();
  }, [selectData.taxcodes]);

  //taxjurisdiction

  const selecttax = () => {
    if (selectData.taxjurisdiction === true) {
      const filter = [...props.taxjurisdiction];
      const popj = filter.pop();
      setFormValues({
        ...formValues,
        rate_jurisdiction_id: popj.jurisdiction_id,
      });
      setFormErrors({...formErrors, rate_jurisdiction_id: false});
      setselectData('taxjurisdiction', false);
    }
    if (selectData.taxjurisdiction === 'update') {
      setOpenJurisdiction(true);
      setselectData('taxjurisdiction', false);
    }
  };
  tempselecttax.current = selecttax;
  useEffect(() => {
    // if(props.status !== 'edit'){
    tempselecttax.current();
    // }
  }, [selectData.taxjurisdiction]);

  //taxcodes

  const handleCloseCodes = () => {
    setOpenCodes(false);
  };

  const handleOpenCodes = () => {
    setOpenCodes(true);
  };

  //taxcategory

  const handleCloseCategory = () => {
    setOpenCategory(false);
  };

  const handleOpenCategory = () => {
    setOpenCategory(true);
  };

  //taxjurisdiction

  const handleCloseJurisdiction = () => {
    setOpenJurisdiction(false);
  };

  const handleOpenJurisdiction = () => {
    setOpenJurisdiction(true);
  };

  console.log(formValues.rate_jurisdiction_id,formErrors.rate_tax_code_id,'jurisdicationnnn')

  return (
    <>
      {Prompt}
      <Typography variant='h6' align='left' style={{ paddingTop: '20px',paddingLeft: '10px'}}>
        {props.status === 'edit' ? "Update Tax Rates" : "New Tax Rates"}
      </Typography>
      {!taxCodeOpen && !taxCategoryOpen && !taxJurisdictionOpen && <Grid
        // spacing={3}
        // lg={12}
        // md={12}
        // sm={12}
        // xs={12}
        // style={{paddingTop: '20px'}}
        container
        direction='row'
        //
      >
       <Grid
         style={{paddingLeft: '10px', padding: '10px'}}
         size={{
           lg: 12,
           md: 12,
           sm: 12,
           xs: 12
         }}>
        <Grid container spacing={3}>
        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <FormControl
            required={true}
            error={formErrors.rate_tax_code_id}
            component='fieldset'
            fullWidth={true}
            variant='filled'
          >
            <InputLabel>Rate Tax Code</InputLabel>
            <Select
              style={{}}
              open={openCodes}
              onClose={handleCloseCodes}
              onOpen={handleOpenCodes}
              name='rate_tax_code_id'
              label='Rate Tax Code'
              items={[
                {label: 'Select one', value: ''},
                {label: 'option 1', value: 'one'},
                {label: 'option 2', value: 'two'},
              ]}
              addnew='true'
              required={true}
              value={formValues.rate_tax_code_id || ''} //=== null ? "" : formValues.rate_tax_code_id</FormControl>
              onChange={handleChange}
            >
              {taxcodes
                ?.filter((d) => d.tax_code)
                .map((d) => (
                  <MenuItem value={d.tax_code_id} key={d.tax_code_id}>
                    {d.tax_code}
                  </MenuItem>
                ))}
              <MenuItem>
                <Link
                  // style={{backgroundColor:'white' }}
                  onClick={() => {
                    props.setModalStatusHandler(true);
                    props.setModalTypeHandler('NewTaxCode');
                  }}
                >
                  Create & Edit
                </Link>
              </MenuItem>
            </Select>
            <FormHelperText>{formErrors.rate_tax_code_id === null || !formErrors.rate_tax_code_id ? '' : 'Rate Tax Code is Required!'}</FormHelperText>
          </FormControl>
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <FormControl
            required={true}
            error={formErrors.rate_tax_category_id}
            component='fieldset'
            fullWidth={true}
            variant='filled'
          >
            <InputLabel>Rate Tax Category</InputLabel>
            <Select
              style={{}}
              open={openCategory}
              onClose={handleCloseCategory}
              onOpen={handleOpenCategory}
              name='rate_tax_category_id'
              label='Rate Tax Category'
              items={[
                {label: 'Select one', value: ''},
                {label: 'option 1', value: 'one'},
                {label: 'option 2', value: 'two'},
              ]}
              addnew='true'
              required={true}
              value={formValues.rate_tax_category_id || ''} //=== null ? "" : formValues.rate_tax_category_id
              onChange={handleChange}
            >
              {taxcategory
                ?.filter((d) => d.tax_category)
                .map((d) => (
                  <MenuItem value={d.tax_category_id} key={d.tax_category_id}>
                    {d.tax_category}
                  </MenuItem>
                ))}
              <MenuItem>
                <Link
                  style={{}}
                  onClick={() => {
                    props.setModalStatusHandler(true);
                    props.setModalTypeHandler('NewTaxCategory');
                  }}
                >
                  Create & Edit
                </Link>
              </MenuItem>
              {/* <MenuItem value=''>
      Select one
    </MenuItem>
    <MenuItem value='one'>
      option 1
    </MenuItem>
    <MenuItem value='two'>
      option 2
    </MenuItem>
    <a style={{"textDecoration": "none", "paddingLeft": 15}}
      href='abc'>
      Create New
    </a> */}
            </Select>
            <FormHelperText>{formErrors.rate_tax_category_id === null || !formErrors.rate_tax_category_id  ? '' : 'Rate Tax Category is Required!'}</FormHelperText>
          </FormControl>
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <FormControl
            required={true}
            error={formErrors.rate_jurisdiction_id}
            component='fieldset'
            fullWidth={true}
            variant='filled'
          >
            <InputLabel>Rate Jurisdiction</InputLabel>
            <Select
              style={{}}
              open={openJurisdiction}
              onClose={handleCloseJurisdiction}
              onOpen={handleOpenJurisdiction}
              name='rate_jurisdiction_id'
              label='Rate Jurisdiction'
              items={[
                {label: 'Select one', value: ''},
                {label: 'option 1', value: 'one'},
                {label: 'option 2', value: 'two'},
              ]}
              addnew='true'
              required={true}
              value={formValues.rate_jurisdiction_id || ''} //=== null ? "" : formValues.rate_jurisdiction_id
              onChange={handleChange}
            >
              {taxjurisdiction
                ?.filter((d) => d.jurisdiction_name)
                .map((d) => (
                  <MenuItem value={d.jurisdiction_id} key={d.jurisdiction_id}>
                    {d.jurisdiction_name}
                  </MenuItem>
                ))}
              <MenuItem>
                <Link
                  style={{}}
                  onClick={() => {
                    props.setModalStatusHandler(true);
                    props.setModalTypeHandler('NewTaxJurisdiction');
                  }}
                >
                  Create & Edit
                </Link>
              </MenuItem>
              {/* <MenuItem value=''>
      Select one
    </MenuItem>
    <MenuItem value='one'>
      option 1
    </MenuItem>
    <MenuItem value='two'>
      option 2
    </MenuItem>
    <a style={{"textDecoration": "none", "paddingLeft": 15}}
      href='abc'>
      Create New
    </a> */}
            </Select>
            <FormHelperText>{formErrors.rate_jurisdiction_id === null ? '' : 'Rate Jurisdiction is Required!'}</FormHelperText>
          </FormControl>
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
            onWheel={ (e) => e.target.blur()}
            style={{}}
            fullWidth={true}
            placeholder='Enter Tax Rate'
            label='Tax Rate'
            name='tax_rate'
            value={formValues.tax_rate === null ? '' : formValues.tax_rate}
            color='primary'
            multiline={false}
            type='number'
            regex={null}
            variant='filled'
            error={formErrors.tax_rate === null ? false : true}
            helperText={formErrors.tax_rate === null ? '' : 'Tax Rate is Required!'}
          />
        </Grid>
        </Grid>
        </Grid>

        <Grid
          size={{
            lg: 2,
            md: 2,
            sm: 2,
            xs: 2
          }}></Grid>

        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid
            spacing={7}
            // lg={12}
            // md={12}
            // sm={12}
            // xs={12}
            //
            container
            direction='row'
            display='flex'
            justifyContent='flex-end'
            paddingTop='25px'
          >
            <Grid>
              {form === false ? (
                <Button
                  // onClick={() => props.handleClose()}
                  onClick={() => {
                     props.handleClose()
                    props.setModalTypeHandler('');

                  }}
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
                  onClick={() => {
                    validClose()
                    props.setModalTypeHandler('');

                  }}
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
                onClick={(e) => handleSubmitt(e)}
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
      </Grid>}
      <CancelDialog
        handle={cancel}
        delete={dialog}
        close={props.handleClose}
      ></CancelDialog>
    </>
  );
}

export default NewTaxRate;
