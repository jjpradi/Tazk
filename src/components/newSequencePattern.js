import {
  Grid,
  Card,
  Button,
  Typography,
  CardContent,
  TextField,
  Select,
  MenuItem,
  Autocomplete,
  OutlinedInput,
  ListItemText,
  InputLabel,
  FormControl,
} from '@mui/material';
import React, {useEffect, useState, useContext, useRef} from 'react';
import MaterialTable from 'utils/SafeMaterialTable';
import {allListStockLocation} from '../redux/actions/stock_Location_actions';
import {
  getVouchertypeAction,
  insertInvoicetypeAction,
  getallInvoicetypeAction,
} from 'redux/actions/pos_creations_actions';
import {createSequenceDataAction} from '../redux/actions/sequencePattern_actions';
import {useDispatch, useSelector} from 'react-redux';
import context from '../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import Checkbox from '@mui/material/Checkbox';
import CreateNewButtonContext from '../context/CreateNewButtonContext';

const rootSx = {
  display: 'flex',
  justifyContent: 'center',
};

const widthSx = {
  width: '100%',
};

const headSx = {
  display: 'flex',
};

function NewSequencePattern(props) {
  const [add_click, setAdd_click] = useState(false);
  const [location_id, setLocation_id] = useState();
  const [sequencePattern, setSequencePattern] = useState([]);
  const [sequencePatternDetails, setSequencePatternDetails] = useState([]);

  const [sequenceType, setSequenceType] = React.useState([]);
  const [regex] = useState({});

  const [formErrors, setFormErrors] = useState({
    sequence_type: null,
    separator: null,
    short_code: null,
    current_seq: null,
    location_id: null,
    pattern: '',
  });



  const [requiredFields] = useState([
    'sequence_name',
    'short_code',
    'current_seq',
    'pattern',
    'location_name',
    'sequence_type',
  ]);

  const [formValues, setFormValues] = useState({
    sequence_type: null,
    separator: null,
    short_code: null,
    current_seq: null,
    location_name:null,
    location_id: null,
    pattern: null,
    user_pattern:'',
  });

  // const [value, setValue] = React.useState('');

  const [disable, setDisable] = React.useState(false);

  const [tabData, setTabData] = useState([]);

  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const dispatch = useDispatch();

  const {
    posSaleReducer: {saleComparison},
    stockLocationReducer: {allliststocklocation},
    sequencePatternReducer: {updateSequenceDataAction, create_sequence_data},
    posCreationReducer: {get_voucher, post_voucher, getall_invoices},
  } = useSelector((state) => state);

  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        allListStockLocation(setModalTypeHandler, setLoaderStatusHandler),
      ),

      dispatch(
        getVouchertypeAction(setModalTypeHandler, setLoaderStatusHandler),
      ),
    );
  }, []);

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

  const setStateHandler = async (name, value) => {
    let formObj = {};
    formObj = {
      ...formValues,
      [name]: value === '' ? null : value,
    };

    await setFormValues(formObj);
    validationHandler(name, value);

  };

  const handleChange = (e) => {
    let {name, value} = e.target;
    setStateHandler(name, value);
  };

  const handleTabdata = async (event) => {
    let isValid = true;
    let formErrorsObj = {...formErrors};
    let formval ={
      ...formValues,
      current_seq:0,
      pattern:`{LS+CS}`
     
    }
    setFormValues(
      formval
      
    )

    await Object.keys(formValues).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
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

    if (isValid) {
      //  formValues.date = moment(formValues.date, "year", "month", "day").format( "yyyy-MM-DD")
      // formValues.date = yyyymmdd_ddmmyyyy(formValues.date)
      // formValues.date = formValues.date  // || getDateFormat(new Date())
      setTabData([...tabData, formValues]);
      setFormValues({
        sequence_type: '',
        separator: '',
        short_code: '',
        current_seq: '',
        location_id: '',
        pattern: '',
      });
    }
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

    // alert("Is Form Valid - " + isValid);

    if (isValid) {
      const data = formValues;

      var result = sequencePattern.map((item) => ({
        locationId: item.locationId,
        sequence_type: item.sequence_type,
      }));

      data.sequenceChild = result;

      if (sequencePattern.length > 0) {
        dispatch(createSequenceDataAction(headerLocationId, data));
        handleClose();
      } else {
        alert('dkdkd');
      }
    }
  };

  // const handleTabdata = async (event) => {
  //   let isValid = true;
  //   let formErrorsObj = {...formErrors};
  //   await Object.keys(formValues).map((key, i) => {
  //     if (
  //       requiredFields.includes(key) &&
  //       (formValues[key] === null || formValues[key] === '')
  //     ) {
  //       isValid = false;
  //       formErrorsObj[key] = capitalize(key) + ' is Required!';
  //     }

  //     else if (regex[key]) {
  //       if (!regex[key].test(formValues[key])) {
  //         isValid = false;
  //         formErrorsObj[key] = capitalize(key) + ' is Invalid!';
  //       }
  //     }
  //     return null;
  //   });
  //   await setFormErrors(formErrorsObj);

  //   if (isValid) {

  //     //  formValues.date = moment(formValues.date, "year", "month", "day").format( "yyyy-MM-DD")
  //     // formValues.date = yyyymmdd_ddmmyyyy(formValues.date)
  //     // formValues.date = formValues.date  // || getDateFormat(new Date())
  //     setTabData([...tabData, formValues]);
  //     setFormValues({
  //       sequence_type:'',
  //       short_code:'',
  //       current_seq:'',
  //       location_id:'',
  //       pattern:''
  //     });
  //   }
  // };


  const {handleClose} = props;

  return (
    <Grid container sx={rootSx}>
      <Card sx={rootSx}>
        <CardContent sx={widthSx}>
          <div style={headSx}>
            <Typography
              variant='h6'
              align='left'
              style={{paddingBottom: '20px'}}
            >
              {' '}
              New Sequence Pattern
            </Typography>
          </div>
          <Grid
            style={{
              alignItems: 'flex-end',
              backgroundColor: '#FDFEFE',
              margin: 0,
            }}
            spacing={4}
            sx={widthSx}
            container
            direction='row'
          >
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <FormControl fullWidth>
                <InputLabel id='demo-multiple-chip-label'>
                  Enter SequenceType
                </InputLabel>
                <Select
                  fullWidth
                  labelId='demo-multiple-chip-label'
                  id='demo-multiple-chip'
                  label='Enter SequenceType'
                  variant='outlined'

                  name='sequence_type'
                  regex=''
                  required={true}
                  onChange={handleChange}
                >
                  {get_voucher.length > 0 ? (
                    get_voucher.map((item) => {
                      return (
                        <MenuItem key={item.id} value={item.title}>
                          {item.title}
                        </MenuItem>
                      );
                    })
                  ) : (
                    <MenuItem value={'null'}></MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid
              size={{
                lg: 2,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <FormControl fullWidth>
                <InputLabel id='demo-multiple-chip-label'>
                  Enter Separator
                </InputLabel>

                <Select
                  labelId='demo-multiple-chip-label'
                  id='demo-multiple-chip'
                  label='Enter Separator'
                  variant='outlined'
                  name='separator'
                  regex=''
                  required={true}
                  fullWidth
                  onChange={handleChange}
                >
                  <MenuItem value={'-'}>-</MenuItem>
                  <MenuItem value={'/'}>/</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid
              size={{
                lg: 2,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <TextField
                placeholder='Enter Short Code'
                label='ShortCode'
                name='short_code'
                regex=''
                required={true}
                fullWidth={true}
                onChange={handleChange}
                color='primary'
                multiline={false}
                type='text'
                value={
                  formValues.short_code === null ? '' : formValues.short_code
                }
                error={formErrors.short_code === null ? false : true}
                helperText={
                  formErrors.short_code === null ? '' : formErrors.short_code
                }
              />
            </Grid>
            <Grid
              size={{
                lg: 2,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <TextField
                placeholder='Enter Current Sequence'
                label='Current Sequence'
                name='current_seq'
                regex=''
                required={true}
                fullWidth={true}
                // onChange={handleChange}
                color='primary'
                multiline={false}
                type='text'
                disabled={true}
                value={'0'}
                
                // value={
                //   formValues.current_seq === null ? '' : formValues.current_seq
                // }
                // error={formErrors.current_seq === null ? false : true}
                // helperText={
                //   formErrors.current_seq === null ? '' : formErrors.current_seq
                // }
              />
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <FormControl fullWidth>
                <InputLabel id='demo-multiple-chip-label'>
                  Choose Location
                </InputLabel>
                <Select
                  fullWidth
                  labelId='demo-multiple-chip-label'
                  id='demo-multiple-chip'
                  name='location_name'
                  variant='outlined'
                  label='Choose Location'
                  regex=''
                  required={true}
                  onChange={handleChange}
                 
                >
                  {allliststocklocation.length > 0 ? (
                    allliststocklocation.map((item) => {
                      return (
                        <MenuItem
                          key={item.location_id}
                          value={item.location_id}
                        >
                          {item.location_name}
                        </MenuItem>
                      );
                    })
                  ) : (
                    <MenuItem value={'null'}></MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 6,
                xs: 12
              }}>
              <TextField
                placeholder='Enter Pattern'
                label='Pattern'
                name='user_pattern'
                regex=''
                required={true}
                fullWidth={true}
                onChange={handleChange}
                color='primary'
                multiline={false}
                type='text'
                value={`${formValues.short_code}${formValues.separator}${formValues.location_id}${formValues.separator}${formValues.current_seq}`}
                disabled={true}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 12,
                md: 12,
                lg: 12
              }}>
              <Grid sx={{display: 'flex', justifyContent: 'center'}}>
                <Button
                  onClick={handleTabdata}
                  name='add'
                  size='medium'
                  text='button'
                  color='primary'
                  style={{}}
                  variant='contained'
                  fullWidth={false}
                >
                  Add Items
                </Button>
              </Grid>
            </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <MaterialTable
                columns={[
                  {
                    // field: 'sequence_type',
                    title: 'Sequence Type',
                  },
                  {
                    title: 'Short Code',
                    // field: 'short_code',
                  },
                  {
                    title: 'Current Sequence',
                    // field: 'current_seq',
                  },
                  {
                    title: 'Location Name',
                    // field: 'location_name',
                  },
                  {
                    title: 'Pattern',
                    // field: 'pattern',
                  },
                ]}
                data={tabData}
                title={
                  <Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                  Sequence  Pattern Record</Typography>}
              />
              {/* <MaterialTable
                editable={{
                  onRowAdd: (newData, oldRow) =>
                    new Promise((resolve, reject) => {

                      setSequencePattern([...sequencePattern, newData]);

                      setTimeout(() => resolve(), 500);
                    }),
                  onRowUpdate: (newRow, oldRow) =>
                    new Promise((resolve, reject) => {
                      if (oldRow.id) {
                        const updatedData = [...sequencePattern];
                        updatedData[
                          updatedData.findIndex((x) => x.id === oldRow.id)
                        ] = newRow;
                        setSequencePattern(updatedData);
                        setTimeout(() => resolve(), 500);
                      } else {
                        const updatedData = [...sequencePattern];
                        updatedData[oldRow.tableData.id] = newRow;
                        setSequencePattern(updatedData);
                        setTimeout(() => resolve(), 500);
                      }
                    }),

                  onRowDelete: (oldData) =>
                    new Promise((resolve, reject) => {
                      setTimeout(() => {
                        const dataDelete = [...sequencePattern];
                        const index = oldData.tableData.id;
                        dataDelete.splice(index, 1);
                        setSequencePattern([...dataDelete]);

                        resolve();
                      }, 1000);
                    }),
                }}
                options={{
                  headerStyle: {
                    fontSize: 15,
                  },

                  exportButton: true,
                  filtering: false,
                  actionsColumnIndex: -1,
                  maxBodyHeight: maxBodyHeight,
                  pageSize: 20,
                  pageSizeOptions: [20, 50, 100],
                  exportMenu: [
                    {
                      label: 'Export PDF',
                      exportFunc: (cols, datas) => {},
                    },
                    {
                      label: 'Export CSV',
                      exportFunc: (cols, datas) => {},
                    },
                  ],
                }}
                columns={[
                  {
                    field: 'location_name',
                    title: 'Location Name',
                    editComponent: ({
                      value,
                      onChange,
                      rowData,
                      onRowDataChange,
                    }) => (
                      <Select
                        value={value}
                        label='Location Name'
                        fullWidth='true'
                        variant='standard'
                        name='location_name'
                        required={true}
                        
                        onChange={(event) => {
                          // onChange(event.target.value);
                          const loop = allliststocklocation?.find(
                            (item, i) =>
                              event.target.value == item.location_name,
                          );

                          rowData.location_name = event.target.value;
                          rowData.locationId = loop.location_id;

                          onRowDataChange(rowData);
                        }}
                      >
                        {allliststocklocation.map((item) => (
                          <MenuItem
                            key={item.location_id}
                            value={item.location_name}
                            data-locationid={'kkk'}
                          >
                            {item.location_name}
                          </MenuItem>
                        ))}
                      </Select>
                    ),
                  },
                  {
                    field: 'sequence_type',
                    title: 'Sequence Type',

                    editComponent: ({value, onChange, rowData}) => (
                      <Select
                        fullWidth
                        value={value}
                        label='sequence_type'
                        variant='standard'
                        name='sequence_type'
                        required={true}
                        
                        onChange={(e) => {
                          onChange(e.target.value);
                        }}
                      >
                        <MenuItem value={'PO'}>PO</MenuItem>
                        <MenuItem value={'SO'}>SO</MenuItem>
                      </Select>
                    ),
                  },
                ]}
                data={sequencePattern}
                title={
                  <Typography
                    variant='h6'
                    align='left'
                    style={{paddingTop: '10px', paddingBottom: '10px'}}
                  >
                    Sequence Type
                  </Typography>
                }
              /> */}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Grid
        spacing={7}
        container={true}
        direction='row'
        gap='20px'
        display='flex'
        justifyContent='flex-end'
        paddingTop='20px'
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
            disabled={sequencePattern.length > 0 ? false : true}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default NewSequencePattern;

