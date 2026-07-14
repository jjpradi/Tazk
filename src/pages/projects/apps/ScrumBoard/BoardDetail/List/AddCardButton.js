import React, { useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import AddIcon from '@mui/icons-material/Add';
import Card from '@mui/material/Card';
import PropTypes from 'prop-types';
import {grey} from '@mui/material/colors';
import {Fonts} from '../../../../../../shared/constants/AppEnums';
import IntlMessages from '@crema/utility/IntlMessages';
import {getsessionStorage} from 'pages/common/login/cookies';
import {roleType} from 'utils/roleType';
import {Divider, useTheme} from '@mui/material';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { useSelector , useDispatch} from 'react-redux';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';


const AddCardButton = (props) => {
  const dispatch = useDispatch();
  const storage = getsessionStorage();
  const theme = useTheme();
  if (props?.showAddCard === false) {
    return null;
  }
  return (
    <>
      {props?.rights && String(props.laneId) !== '6' ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 2,
            px: 6,
            cursor: 'pointer',
            minWidth: 390,
            borderRadius: '5px',
            backgroundColor: '#FFF',
            fontSize: 15,
          }}
          onClick={props.onClick}
        >
          <Avatar
            sx={{
              backgroundColor: 'grey.100',
              border: `1px dashed ${grey[400]}`,
            }}
          >
            <AddIcon
              sx={{
                fontWeight: Fonts.LIGHT,
                color: 'grey.500',
              }}
            />
          </Avatar>
          <Box
            sx={{
              ml: 3.5,
              fontWeight: Fonts.REGULAR,
            }}
          >
            <IntlMessages id='scrumboard.addACard' />
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 6,
            px: 6,
            cursor: 'pointer',
            minWidth: 390,
            borderRadius: '16px',
            backgroundColor: theme.palette.background.default,
            fontSize: 15,
          }}
        >
          <Divider />
        </Box>
      )}
    </>
  );
};

export default AddCardButton;

AddCardButton.propTypes = {
  onClick: PropTypes.func,
  laneId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  rights:PropTypes.bool,
  showAddCard: PropTypes.bool,
};
