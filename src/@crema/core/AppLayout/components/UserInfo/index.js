import React, { useContext, useEffect, useState } from 'react';
import {orange} from '@mui/material/colors';
import {useAuthMethod, useAuthUser} from '../../../../utility/AuthHooks';
import {Box} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {Fonts} from '../../../../../shared/constants/AppEnums';
import {useNavigate} from 'react-router-dom';
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';
import { base_url, clientwebsocket } from '../../../../../http-common';
import { getsessionStorage } from 'pages/common/login/cookies';
import context  from '../../../../../context/CreateNewButtonContext'
import DB from '../../../../../db';
import { useDispatch, useSelector } from 'react-redux';
import { listUserByid } from 'redux/actions/userCreation_actions';
import socketManager from 'utils/socketManager';

const UserInfo = ({color}) => {
  const [num, setNum] = useState(0)
  const {logout} = useAuthMethod();
  const {user} = useAuthUser();
  const navigate = useNavigate();
  const userCreation = useSelector(
    (state) => state.UserCreationReducer.user_by_id,
  );
  // const cookies = new Cookies();
  const storage = getsessionStorage()
  const latestUserData = Array.isArray(userCreation)
    ? userCreation[0] || {}
    : userCreation || {};
  let {first_name , last_name, role_name} = storage
  const headerFirstName = latestUserData.first_name || first_name;
  const headerLastName = latestUserData.last_name || last_name;
  const headerRoleName = latestUserData.role_name || role_name;
  const isEmployeeRole = String(headerRoleName || role_name || '').toLowerCase().includes('employee');
  const avatarSrc =
    latestUserData.image ||
    latestUserData.user_img_url ||
    latestUserData.image_url ||
    storage?.user_img_url ||
    storage?.image ||
    storage?.image_url ||
    '';
  let empName = last_name  ? `${first_name} ${last_name}` : first_name
  empName = headerLastName ? `${headerFirstName} ${headerLastName}` : headerFirstName;

  // const userData = sessionStorage.getItem('login')
  // let jsonData = JSON.parse(userData);
  // let name = jsonData["first_name"];

  // useEffect(() => {
  //   let val = num + 1
  //   setNum(val)
  // }, [name]);
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
    setHeaderLocationIdHandeler,
  } = useContext(context);  

  // const {
  //   commoncookie,
  //   setModalTypeHandler,
  //   setLoaderStatusHandler,
  //   headerLocationId,
  // } = useContext(CreateNewButtonContext);

  useEffect(() => {
    storage?.company_type !== 13 && dispatch(listUserByid(commoncookie, setModalTypeHandler, setLoaderStatusHandler));
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const setEmpty = () => {
    var db = new DB('pos_session');
    db.dbDestroy();
    setHeaderLocationIdHandeler("null")
  };



  const getUserAvatar = () => {
    if (headerFirstName) {
      return headerFirstName.charAt(0).toUpperCase();
    }
    if (user.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
  };

 

  const goToActivity = () => {
    console.log('navigate')
    navigate('/common/activity');
  };

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          py: 1.5,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        className='user-info-view'
      >
        <Box sx={{py: 0.5}}>
          {avatarSrc ? (
             <Avatar
              sx={{
                height: 30,
                width: 30,
                fontSize: 30,
                backgroundColor: orange[500],
              }}
              src={avatarSrc}
            />
          ) : (
            <Avatar
              sx={{
                height: 30,
                width: 30,
                fontSize: 30,
                backgroundColor: orange[500],
              }}
            >
              {getUserAvatar()}
            </Avatar>
          )}
        </Box>
        <Box
          sx={{
            width: {xs: 'calc(100% - 62px)', xl: 'calc(100% - 72px)'},
            ml: 4,
            color: color,
          }}
          className='user-info'
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box
              sx={{
                mb: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '13px',
                fontWeight: 'bold',
                color: 'inherit',
                textTransform: 'capitalize',
              }}
              component='span'
            >
     
              {empName ? empName : 'Admin User '}
            </Box>
            <Box
              sx={{
                ml: 3,
                color: 'inherit',
                display: 'flex',
              }}
            >
              <ExpandMoreIcon />
            </Box>
          </Box>
          <Box
           sx={{
            mt: -0.5,
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'inherit',
           fontSize: '13px',
          }}
          >
            {headerRoleName ? headerRoleName : "System Manager"}
          </Box>
        </Box>
      </Box>
      <Menu
        id='simple-menu'
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
       <MenuItem
          onClick={() => {
            // handleClose();
            navigate('/common/myaccount');
          }}
        >
          My account
        </MenuItem> 
        <MenuItem onClick={goToActivity}>
        
        Activity
        
        </MenuItem>
        <MenuItem onClick={() => {
            setEmpty()
            logout();
        }
        }>Logout</MenuItem>
  

      </Menu>
    </>
  );
};

export default UserInfo;

UserInfo.propTypes = {
  color: PropTypes.string,
};
