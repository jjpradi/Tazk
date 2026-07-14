import {TextField, Grid} from '@mui/material';
import React, {useEffect, useState, useContext} from 'react';
import Button from '@mui/material/Button';
import {updateCustomerAction} from '../../../redux/actions/customer_actions';
import {useDispatch} from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import IconButton from '@mui/material/IconButton';
import {phoneValidation} from '../../regexFunction/index';
import apiCalls from 'utils/apiCalls';

const EditCustomer = ({one, setone, setEditCust}) => {
  const [form, setForm] = useState({});
  const [formErrors, setFormErrors] = useState({
    first_name: false,
    phone_number: false,
    address: false,
    city: false,
    state: false,
    zip: false,
    country: false,
  });
  const [requiredFields] = useState([
    'first_name',
    'phone_number',
    'address',
    'city',
    'state',
    'zip',
    'country',
  ]);
  const [validRegex, setValidRegex] = useState(false);
  const dispatch = useDispatch();
  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(context);

  useEffect(() => {
    setForm(one);
    setValidRegex(true);
  }, [one]);

  const handleSubmit = async () => {
    const {
      first_name,
      customer_id,
      phone_number,
      email,
      address,
      city,
      state,
      zip,
      country,
      person_id,
    } = form;

    const data = {
      
      pos_people: {
        first_name,
        phone_number,
        email,
        address,
        city,
        state,
        zip,
        country,
        person_id,
      },
    };
    // if(editCust !== true){
    //     setValidRegex(true)
    // }

    let isValid = true;
    let formErrorsObj = {...formErrors};
    await Object.keys(form).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (form[key] === null || form[key] === '')
      ) {
        isValid = false;
        formErrorsObj[key] = true;
      }
      return null;
    });
    if (validRegex !== true) {
      isValid = false;
      formErrorsObj.phone_number = true;
      // setFormErrors({...formErrors , phone_number : true})
    }
    await setFormErrors(formErrorsObj);

    if (isValid) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          updateCustomerAction(
            customer_id,
            data,
            setModalTypeHandler,
            setLoaderStatusHandler,
          ),
        )
      );
      setone(form);
      setEditCust(false);
    }
  };

  const handleChange = (e) => {
    const {value, name} = e.target;
    setForm((p) => ({...p, [name]: value}));
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
        [name]: true,
      });
    } else if (name === 'phone_number') {
      if (phoneValidation(value) !== true) {
        setValidRegex(false);
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
        setValidRegex(true);
      }
    } else {
      setFormErrors({
        ...formErrors,
        [name]: false,
      });
    }
  };

  return (
    <Grid container spacing={5}>
      <Grid>
        <TextField
          size='small'
          onChange={handleChange}
          onBlur={handleChange}
          //form.first_name ? form.first_name : 
          value={form.first_name}
          name='first_name'
         // form.first_name ? 'Company Name' : 
          label={'First Name'}
          variant='outlined'
          error={formErrors.first_name}
        />
      </Grid>
      <Grid>
        <TextField
          size='small'
          onChange={handleChange}
          onBlur={handleChange}
          value={form.address}
          name='address'
          label='Address'
          variant='outlined'
          error={formErrors.address}
        />
      </Grid>
      <Grid>
        <TextField
          size='small'
          onChange={handleChange}
          onBlur={handleChange}
          value={form.city}
          name='city'
          label='City'
          variant='outlined'
          error={formErrors.city}
        />
      </Grid>
      <Grid>
        <TextField
          size='small'
          onChange={handleChange}
          onBlur={handleChange}
          value={form.state}
          name='state'
          label='State'
          variant='outlined'
          error={formErrors.state}
        />
      </Grid>
      <Grid>
        <TextField
          size='small'
          onChange={handleChange}
          onBlur={handleChange}
          value={form.country}
          name='country'
          label='Country'
          variant='outlined'
          error={formErrors.country}
        />
      </Grid>
      <Grid>
        <TextField
          size='small'
          onChange={handleChange}
          onBlur={handleChange}
          value={form.zip}
          name='zip'
          label='Zip'
          variant='outlined'
          error={formErrors.zip}
        />
      </Grid>
      <Grid>
        <TextField
          size='small'
          onChange={handleChange}
          onBlur={handleChange}
          value={form.phone_number}
          name='phone_number'
          sx={{m: '0 8px 0 0'}}
          label='Phone Number'
          variant='outlined'
          error={formErrors.phone_number}
        />
      </Grid>
      <Grid>
        <div>
          <IconButton onClick={() => setEditCust(false)}>
            <HighlightOffIcon
              color='error'
              onClick={() => setValidRegex(true)}
            />
          </IconButton>

          <IconButton onClick={handleSubmit}>
            <CheckCircleOutlineIcon color='success' />
          </IconButton>
        </div>
      </Grid>
    </Grid>
  );
};

export default EditCustomer;
