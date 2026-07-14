import React from 'react';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';

import IntlMessages from '@crema/utility/IntlMessages';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import {Fonts} from '../../../../../shared/constants/AppEnums';
import {grey} from '@mui/material/colors';
import {roleType} from 'utils/roleType';
import {getsessionStorage} from 'pages/common/login/cookies';

const storage = getsessionStorage();
const isAdmin = roleType.includes(storage?.role_name);
const AddBoardButton = ({onAddButtonClick}) => {
  return (
    <Grid
      size={{
        xs: 12,
        sm: 6,
        md: 2.4,
        lg: 2.4
      }}>
      <Box
        sx={{
          borderRadius: '10px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 5,
          paddingTop: 4,
          textAlign: 'center',
          backgroundColor: (theme) => theme.palette.background.paper,
          height: 100,
          // width:150,
          border: '2px dashed',
          borderColor: grey[600],
        }}
        onClick={() => onAddButtonClick()}
      >
        <Avatar
          sx={{
            backgroundColor: 'grey.500',
            width: 30,
            height: 30,
            marginBottom: 0.25,
          }}
        >
          <AddIcon
            sx={{
              fontSize: 12,
            }}
          />
        </Avatar>
        <Box
          component='p'
          sx={{
            fontWeight: Fonts.MEDIUM,
            fontSize: 14,
          }}
        >
          <IntlMessages id='scrumboard.addNewProject' />
        </Box>
      </Box>
    </Grid>
  );
};

export default AddBoardButton;

AddBoardButton.propTypes = {
  onAddButtonClick: PropTypes.func,
};
