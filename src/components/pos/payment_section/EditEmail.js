import {TextField, Grid} from '@mui/material';
import React, {useEffect, useState, useContext} from 'react';
import Button from '@mui/material/Button';
import {updateCustomerAction} from '../../../redux/actions/customer_actions';
import {useDispatch} from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import IconButton from '@mui/material/IconButton';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {emailValidation} from '../../regexFunction/index';
import apiCalls from 'utils/apiCalls';

const EditEmail = ({one, setone, setEditEmail}) => {
  const [form, setForm] = useState({});
  const [formErrors, setFormErrors] = useState({email: false});
  const [requiredFields] = useState(['email']);
  const [validRegex, setValidRegex] = useState(false);
  const dispatch = useDispatch();
  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(context);

  useEffect(() => {
    setForm(one);
    setValidRegex(true);
  }, [one]);

  const handleSubmit = async () => {
    const {company_name, customer_id, email, person_id} = form;

    const data = {
      company_name,
      pos_people: {
        email,
        person_id,
      },
    };

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
      // else if(validRegex !== true){
      //     isValid = false
      //     formErrorsObj[key] = true;
      // }
      return null;
    });

    if (validRegex !== true) {
      isValid = false;
      formErrorsObj.email = true;
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
      setEditEmail(false);
    }
  };

  // const capitalize = (s) => {
  //     if (typeof s !== "string") return "";
  //     return s.charAt(0).toUpperCase() + s.slice(1);
  // };

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
    } else if (name === 'email') {
      if (emailValidation(value) !== true) {
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
    <div>
      <TextField
        size='small'
        onChange={handleChange}
        onBlur={handleChange}
        value={form.email}
        name='email'
        sx={{m: '0 8px 8px 0'}}
        label='Email'
        variant='outlined'
        error={formErrors.email}
      />

      <div style={{display: 'flex'}}>
        <div style={{marginLeft: 'auto'}}>
          <IconButton onClick={() => setEditEmail(false)}>
            <HighlightOffIcon
              color='error'
              onClick={() => setValidRegex(true)}
            />
          </IconButton>

          <IconButton onClick={handleSubmit}>
            <CheckCircleOutlineIcon color='success' />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default EditEmail;
