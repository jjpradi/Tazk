import React, {useContext, useEffect, useState} from 'react';
import {
  Box,
  FormControlLabel,
  FormGroup,
  Grid,
  Switch,
  Typography,
} from '@mui/material';
import IntlMessages from '@crema/utility/IntlMessages';
import {Fonts} from '../../../../../shared/constants/AppEnums';
import {Formik} from 'formik';
import * as yup from 'yup';
import {changepasswordAction} from 'redux/actions/userCreation_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {useSelector, useDispatch} from 'react-redux';
import {ENABLE_NEW_ROUTES} from 'redux/actionTypes';
import { getsessionStorage } from 'pages/common/login/cookies';

const NewRoutes = () => {
  const [formValues, setFormValues] = useState({
    newRoutes: false,
  });

  // const {
  //   UserRoleReducer: {
  //     enableNewRoutes,
  //  }
  // }= useSelector(state => state)

  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const dispatch = useDispatch();
  let storage = getsessionStorage();
  useEffect(() => {
    setFormValues({
      ...formValues,
      newRoutes: storage?.enableNewRoutes ?? false,
    });
  }, []);

  const handleChecked1 = async (e) => {
    const {checked} = e.target;
    setFormValues({...formValues, newRoutes: checked});

    const storage = sessionStorage.getItem('login');
    const cookieData = JSON.parse(storage);
    cookieData.enableNewRoutes = checked;
    sessionStorage.setItem('login', JSON.stringify(cookieData));
  };
  return (
    <Box
      sx={{
        position: 'relative',
        maxWidth: 550,
      }}
    >
      <Typography
   component='h3'
   sx={{
     fontSize: 16,
     fontWeight: Fonts.BOLD,
     mb: {xs: 3, lg: 5},
   }}
 >
   New Menu Structure
 </Typography>
      <Grid
        size={{
          lg: 4,
          md: 4,
          sm: 6,
          xs: 12
        }}>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={formValues.newRoutes}
                onChange={handleChecked1}
                name='allow_denomination'
              />
            }
            label='Enable New Routes ?'
          />
        </FormGroup>
      </Grid>
    </Box>
  );
};

export default NewRoutes;
