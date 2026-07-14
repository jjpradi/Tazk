import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  Button,
  TextField,
  Typography,
  Grid,
Card,
} from '@mui/material';
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import CloseIcon from '@mui/icons-material/Close';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {
  maxBodyHeight,
  maxHeight,
  pageSize,
  headerStyle,
  cellStyle,
  font14_500,
} from 'utils/pageSize';
import {useDispatch, useSelector} from 'react-redux';
import context from '../../../context/CreateNewButtonContext';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {createOffersAction, getOffersAction} from 'redux/actions/offers';
import UnSavedChangesWarning from 'pages/common/unChangeswarning';

import CancelDialog from 'components/CancelDialog';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;


function NewOffer(props) {
  const textRef = useRef(null);
  const {declaredHolidays} = props;
  const [formValues, setFormValues] = useState({
    offerType: null,
    offerTitle: null,
    offerDescription: null,
  });
  const [formErrors, setFormErrors] = useState({
    offerType: null,
    offerTitle: null,
    offerDescription: null,
  });
  const [requiredFields] = useState([]);
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);
  const dispatch = useDispatch();
  const [regex] = useState({});
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [dialog, setDialog] = useState(false);
  const [initialState, setInitialState] = useState({});
  const [form, setForm] = useState(false);
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempedits = useRef(null);

  const {
    OfferReducer: {getOfferDetails},
  } = useSelector((state) => state);

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
    if (name !== '') {
      setStateHandler(name, value);
    }
  };

  useEffect(() => {
    if (props.editData && Object.keys(props.editData).length > 0) {
      setFormValues({
        offerType: props.editData.offerType || null,
        offerTitle: props.editData.offerTitle || null,
        offerDescription: props.editData.offerDescription || null,
      });
    }
  }, [getOfferDetails]);

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

    const tempData = {
      offerType: formValues.offerType,
      offerTitle: formValues.offerTitle,
      offerDescription: formValues.offerDescription,
    };

    // alert("Is Form Valid - " + isValid);

    // API call..
    if (isValid) {
      if (Object.keys(props.editData).length > 0) {
        console.log('sadfsdff');
      } else {
        dispatch(
          createOffersAction(
            tempData,
            setModalTypeHandler,
            setLoaderStatusHandler,

            (response) => {
              if (response === 200) {
                dispatch(
                  getOffersAction(
                    setModalTypeHandler,
                    setLoaderStatusHandler,
                    (response) => {
                      if (response === 200) {
                        console.log('success');
                      }
                    },
                  ),
                );
                props.handleClose(false);
              }
            },
          ),
        );
      }
    }
  };

  return (
    <>
      {Prompt}
      <Typography variant='h6' align='left' style={{paddingBottom: '20px'}}>
        {props.statue === 'edit' ? 'Edit Offer' : 'Offer'}
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
            lg: 4,
            md: 4,
            sm: 12,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            fullWidth
            // required={true}
            style={{}}
            placeholder='Offer Type'
            label='Offer Type'
            name='offerType'
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='filled'
            value={formValues.offerType === null ? '' : formValues.offerType}
            error={formErrors.offerType === null ? false : true}
            helperText={
              formErrors.offerType === null ? '' : formErrors.offerType
            }
          />
        </Grid>
        <Grid
          size={{
            lg: 4,
            md: 4,
            sm: 12,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            fullWidth
            // required={true}
            style={{}}
            placeholder='Offer Title'
            label='Offer Title'
            name='offerTitle'
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='filled'
            value={formValues.offerTitle === null ? '' : formValues.offerTitle}
            error={formErrors.offerTitle === null ? false : true}
            helperText={
              formErrors.offerTitle === null ? '' : formErrors.offerTitle
            }
          />
        </Grid>
        <Grid
          size={{
            lg: 4,
            md: 4,
            sm: 12,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            onBlur={handleChange}
            fullWidth
            // required={true}
            style={{}}
            placeholder='Offer Description'
            label='Offer Description'
            name='offerDescription'
            color='primary'
            multiline={false}
            type='text'
            regex=''
            variant='filled'
            value={
              formValues.offerDescription === null
                ? ''
                : formValues.offerDescription
            }
            error={formErrors.offerDescription === null ? false : true}
            helperText={
              formErrors.offerDescription === null
                ? ''
                : formErrors.offerDescription
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
                  cancel
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

export default function Offers({
  rowData,
  handleClose,
  pageCount,
  numPerPage,
  searchString,
}) {
  const [newOffer, setNewOffer] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const dispatch = useDispatch();

  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);

  const {
    OfferReducer: {getOfferDetails},
  } = useSelector((state) => state);

  useEffect(() => {
    dispatch(
      getOffersAction(
        setModalTypeHandler,
        setLoaderStatusHandler,
        (response) => {
          if (response === 200) {
            console.log('success');
          }
        },
      ),
    );
  }, []);

  // const handleScheduleDelete = () => {
  //   dispatch(
  //     deleteShiftScheduleAction(
  //       deleteId.current,
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //     ),
  //   );
  //   setDeleteOpen(false)
  // };

  return (
    <>
      {!newOffer ? (
        <Card>
          <MaterialTable
            components={{
              Toolbar: (props) => (
                <>
                  <div
                    style={{
                      display: 'flex',
                      width: '100%',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{width: '100%'}}>
                      <MTableToolbar {...props} />
                    </div>
                  </div>
                </>
              ),
            }}
            options={{
              // showEmptyDataSourceMessage: this.state.isApiFinished,
              maxBodyHeight: maxHeight,
              headerStyle,
              cellStyle,
              search: false,
              paging: false,
              actionsColumnIndex: -1,
              minBodyHeight: '900px',
            }}
            actions={[
              {
                icon: 'add',
                tooltip: 'New Offer',
                isFreeAction: true,
                onClick: (event, rowData) => setNewOffer(true),
              },

              (rowData) => ({
                icon: () => <EditIcon />,
                tooltip: 'Edit Offer',
                onClick: (event, rowData) => {
                  // setNewOffer(true);
                  // setEditData(rowData);
                },
              }),
              (rowData) => ({
                icon: () => <DeleteIcon />,
                tooltip: 'Delete Offer',
                onClick: (event, rowData) => {
                  setDeleteOpen(true);
                },
              }),
            ]}
            columns={[
              {
                title: 'Offer Type',
                field: 'offerType',
              },
              {
                title: 'Offer Title',
                field: 'offerTitle',
              },
              {
                title: 'Offer Description',
                field: 'offerDescription',
              },
            ]}
            data={getOfferDetails || []}
            title={
              <Typography
                variant='h6'
                align='left'
                style={{paddingTop: '10px', paddingBottom: '10px'}}
              >
                Offers
              </Typography>
            }
          />
        </Card>
      ) : (
        <NewOffer
          editData={editData}
          handleClose={() => {
            setEditData({});
            setNewOffer(false);
          }}
          OfferDetails={getOfferDetails}
          rowData={rowData}
        />
      )}
    </>
  );
}

