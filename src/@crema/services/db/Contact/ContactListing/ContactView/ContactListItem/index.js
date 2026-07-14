import React, { useEffect, useState } from 'react';
import ListItem from '@mui/material/ListItem';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import AppsStarredIcon from '@crema/core/AppsStarredIcon';
import { Fonts } from 'shared/constants/AppEnums';
import ItemMenu from '../ItemMenu';
import { blue } from '@mui/material/colors';

import { styled } from '@mui/material/styles';
import { Button, Grid, List, Typography, alpha } from '@mui/material';
import { getsessionStorage } from 'pages/common/login/cookies';
import ContactNotificationDialog from './ContactNotificationDialog'
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { followUserAction, getUpdatedFollowersList, sendFollowRequestAction } from 'redux/actions/customer_actions';
import { useDispatch, useSelector } from 'react-redux';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonAddedIcon from '@mui/icons-material/PersonAddDisabled';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CommonToolTip from 'components/ToolTip';
import { clientwebsocket } from 'http-common';
import { useCustomFetch } from 'utils/useCustomFetch';
import { listenabledntfyAction, updatedNtfyAction } from 'redux/actions/notification_actions';
import apiCalls from 'utils/apiCalls';
import { roleType, roleTypeForRights } from 'utils/roleType';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { formatName } from 'utils/nameFormatter';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const boxStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  marginLeft: 'auto',
  
};


const ContactListItemWrapper = styled(ListItem)(({ theme }) => {
  return {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 14,
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 5,
    paddingRight: 1,
    cursor: 'pointer',
    overflow: 'hidden',
    '&.rootCheck': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      boxShadow: `0 3px 5px 0 ${alpha(theme.palette.common.black, 0.08)}`,
    },
    '& .conActionHoverHideRoot': {
      transition: 'all 0.4s ease',
    },
    '&:hover': {
      '& .conActionHoverRoot': {
        opacity: 1,
        visibility: 'visible',
        right: 0,
      },
      '& .conActionHoverHideRoot': {
        opacity: 0,
        visibility: 'hidden',
      },
      '& .contactViewInfo': {
        [theme.breakpoints.up('sm')]: {
          width: 'calc(100% - 114px)',
        },
      },
    },
  };
});



const ContactListItem = ({ 
  contact,
  labelList,
  onChangeCheckedContacts,
  checkedContacts,
  onChangeStarred,
  onSelectContactsForDelete,
  onViewContactDetail,
  onOpenEditContact,
  type,
  SetStaredDel,
  list
}) => {
  const onGetLabelColor = (labelId) => {
    if (labelId) {
      return (
        labelList.length > 0 &&
        labelList.find((label) => label.id === labelId).color
      );
    }
  };
  const [itemmenu, setItemMenu] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [followStatus, setFollowStatus] = useState([]);
  const dispatch = useDispatch();
  let storage = getsessionStorage()
  let person = storage.person_id
  const selectedRole = storage.role_name
  const { customerReducer: { follow_list } } = useSelector((state) => state);
  const {roleReducer:{user_rights}, rbacReducer: {menuAccess}}=useSelector((state) => state);
  let flw_sts = storage.follow_status

  const tooltipFunc = () => {
    if (followListStatus.length && followListStatus.includes(contact.person_id)) {
      return 'Following';
    } else if (storage.your_requests.length && storage.your_requests.includes(contact.person_id)) {
      return 'Pending';
    } else {
      return 'Follow';
    }
  }
  
  let followListStatus = follow_list.filter(f => f.person_id === person)[0]?.followed_status || []
  useEffect(() => {

    if (type === 3) {
      setItemMenu(false)
    }
    if (type === 4) {

      setItemMenu(contact.employee_id === null ? true : false)

    }

  }, [type])
  
//   useEffect(() => {
//      dispatch(getUserRightsByRoleIdAction());
// }, []);
  function handleButtonClick(person_id,e, status) {
    let storage = JSON.parse(sessionStorage.getItem('login')) || {};
    const isFollowing = Array.isArray(storage.follow_status) && storage.follow_status.includes(person_id);
    let role_name = storage.role_name

    if (roleType.includes(role_name)) {
      // If the user is an Administrator, they can follow immediately
      if (isFollowing) {
        let data = {
          receiver_id: person,
          senderId: contact.person_id,
          filtered: [],
        };
        dispatch(updatedNtfyAction(data));
        storage.follow_status = storage.follow_status.filter(id => id !== person_id);
      } else {
        if (!Array.isArray(storage.follow_status)) {
          storage.follow_status = [];
        }
        storage.follow_status.push(person_id);
      }

      sessionStorage.setItem('login', JSON.stringify(storage));
      dispatch(followUserAction({ person_id: person, follow_status: storage.follow_status }));

      let trueKeys = ['absent','present','lateLogin','earlyCheckOut','earlyIn'];

      let data = {
        receiver_id: person,
        senderId: contact.person_id,
        filtered: trueKeys,
      };
      dispatch(updatedNtfyAction(data));
    } else {
      // If the user is not an Administrator

      // Handle different status scenarios
      if (status === 'Follow') {
        // Add person_id to your_requests
        if (!Array.isArray(storage.your_requests)) {
          storage.your_requests = [];
        }
        storage.your_requests.push(person_id);
        dispatch(followUserAction({ person_id: person, your_requests: storage.your_requests }));
      } else if (status === 'Requested') {
        // Remove person_id from your_requests if it exists
        if ( (Array.isArray(storage.your_requests) ) && (Array.isArray(storage.follow_status))) {
          storage.your_requests = storage.your_requests.filter(id => id !== person_id);
          storage.follow_status = storage.follow_status.filter(id => id !== person_id);
          dispatch(followUserAction({ person_id: person, unfollow_requests: storage.your_requests, unfollow_follow_requests  : storage.follow_status  }));
        }
      } else if (status === 'Following') {
        // Remove person_id from follow_status if it exists
        if (Array.isArray(storage.follow_status)) {
          storage.follow_status = storage.follow_status.filter(id => id !== person_id);
          dispatch(followUserAction({ person_id: person, follow_status: storage.follow_status }));
        }
      }
      // Update sessionStorage
      sessionStorage.setItem('login', JSON.stringify(storage));

      if (status === 'Follow' || status === 'Requested' || status === 'Following') {
        let sendData = {
          sendreq: person,
          receive_req: person_id,
          status: 'Pending',
          is_deleted: 0,
          update: status
        }
        dispatch(sendFollowRequestAction(sendData));
      }

    }
    e.stopPropagation()
  }


  const handleDialogOpen = (e) => {
    let data = {
      receiver_id: person,
      senderId: contact.person_id,
    };
    dispatch(listenabledntfyAction(data, () => {
      setDialogOpen(true);
    }))

    e.stopPropagation()
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const restrict = storage.role_name
  const role_name = storage.role_name

  // console.log(contact, 'contactWeb')
  
  const viewContactDetails = getRoleAuthorization(user_rights,'contactDetailView')
  const canShowPhone = storage.company_type === 5 ? getRoleAuthorization(user_rights, 'Show MobileNumber') : true;
  const staredCreate = storage.company_type !== 5 ? UserRightsAuthorization(menuAccess[selectedRole], 'contact__starred', 'can_create') : true
  const viewcontact = storage.company_type !== 5 ? UserRightsAuthorization(menuAccess[selectedRole], 'contact__employee', 'can_view') : true

  const getColumnsByCompanyType = (companyType, type) => {
    if(companyType === 12) {
    type = 5
    }
    const starred = [ { key: 'starred', label: '', width: 1 } ];
    const name = [
      { key: 'company_name', label: 'Name', width: 2 },
    ];
    const phone = canShowPhone ? [{ key: 'phone_number', label: 'Contact', width: 2 }] : [];


    // case: type === 3
    if (type === 3) {
      return [
        ...starred,
         { key: 'employee_code', label: 'Code', width: 1 },
        ...name,
        ...phone,
        { key: 'role_name', label: 'Role', width: 2 },
        { key: 'department', label: 'Department', width: 2 },
        { key: 'designation', label: 'Designation', width: 2 },
        { key: 'category_name', label: 'Category', width: 2 },
        { key: 'action', label: '', width: 1 },
      ];
    }

    // case: company_type === 3 and type === 1 or 2
    if (companyType === 3 && (type === 1 || type === 2)) {
      return [
        ...starred,
        ...name,
        { key: 'primary_contact_person', label: 'Contact Person', width: 2 },
        ...phone,
        { key: 'area', label: 'Area', width: 2 },
      ];
    }

    if (companyType === 2 && (type === 0)) {
      return [
        ...starred,
        ...name,
        ...phone,
        { key: 'email', label: 'Email', width: 2 },
        { key: 'area', label: 'Area', width: 2 },
      ];
    }

    if (companyType === 2 && ( type === 1 || type === 2)) {
      return [
        ...starred,
        ...name,
        { key: 'primary_contact_person', label: 'Contact Person', width: 2 },
        ...phone,
        { key: 'area', label: 'Area', width: 2 },
      ];
    }

    // Base fields for most company types
    const base = [
      ...starred,
       { key: 'employee_code', label: 'Code', width: 1 },
      ...name,
      ...phone,
    ];

    // Additional fields
    const extraByCompany = {
      12: [ { key: 'client_code', label: 'Client Code', width: 2 } ],
      5: [
        { key: 'role_name', label: 'Role', width: 2 },
        { key: 'department', label: 'Department', width: 2 },
        { key: 'designation', label: 'Designation', width: 2 },
        { key: 'category_name', label: 'Category', width: 2 },
      ],
      3: [
        { key: 'role_name', label: 'Role', width: 2 },
      ],
      10: [ { key: 'designation', label: 'Designation', width: 2 } ],
      2: type !== 2 && type !== 3 ? [ { key: 'designation', label: 'Designation', width: 2 } ] : [],
    };

    return [ ...base, ...(extraByCompany[ companyType ] || []) ];
  };


  const renderColumn = (key) => {
    switch (key) {
      case 'starred':
        return (
          <Box onClick={(e) => e.stopPropagation()}>
            <AppsStarredIcon item={contact} onChange={onChangeStarred} staredCreate={staredCreate} />
          </Box>
        );
      case 'company_name':
        return  formatName(contact.company_name
          ? contact.company_name
          : `${contact.first_name || ''}${contact.first_name && contact.last_name ? ' ' + contact.last_name : ''}`);
      case 'email':
        return contact.email;
      case 'phone_number':
        return contact.phone_number;
      case 'role_name':
        return contact.role_name;
      case 'department':
        return contact.Departments_name?.length > 1 ? `${contact.Departments_name[ 0 ].department}, ...` : contact.Departments_name?.[ 0 ]?.department;
      case 'designation':
        return contact.designation;
      case 'category_name':
        return contact.category_name;
      case 'client_code':
        return contact.client_code;
      case 'primary_contact_person':
        return contact.first_name;
      case 'area':
        return contact.area;
      case 'employee_code':
        return contact.employee_code;
      case 'action':
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 1,
            }}
          >
            {/* Follow / Unfollow button (only for type === 3) */}
            {type === 3 && contact.person_id !== person && roleType.includes(role_name) && storage.company_type !== 12 && (
              <CommonToolTip title={!flw_sts.includes(contact.person_id) ? 'Follow' : 'UnFollow'}>
                <IconButton
                  sx={{
                    backgroundColor: flw_sts.includes(contact.person_id) ? '#4CAF50' : '#45A049',
                    color: flw_sts.includes(contact.person_id) ? '#fff' : '#000',
                    '&:hover': {
                      backgroundColor: flw_sts.includes(contact.person_id) ? '#45A049' : '#4CAF50',
                    },
                  }}
                  onClick={(e) => handleButtonClick(contact.person_id, e)}
                >
                  {flw_sts.includes(contact.person_id) ? (
                    <PersonAddedIcon sx={{ fontSize: 15 }} />
                  ) : (
                    <PersonAddIcon sx={{ fontSize: 15 }} />
                  )}
                </IconButton>
              </CommonToolTip>
            )}

            {/* ItemMenu (only if allowed by role) */}
            {roleType.includes(restrict) && itemmenu && (
              <ItemMenu
                contact={contact}
                onChangeStarred={onChangeStarred}
                onOpenEditContact={onOpenEditContact}
                onSelectContactsForDelete={onSelectContactsForDelete}
                type={type}
                SetStaredDel={SetStaredDel}
              />
            )}
          </Box>
        );

      default:
        return '';
    }
  };
  const columns = getColumnsByCompanyType(storage.company_type, type);
  const columnCount = columns.length;
  const getGridTemplateColumns = (columns) => {
    const STARRED_WIDTH = 40;
    const ACTION_WIDTH = 50;

    const totalRelativeWidth = columns
      .filter((col) => col.key !== 'starred' && col.key !== 'action')
      .reduce((acc, col) => acc + col.width, 0);

    return columns
      .map((col) => {
        if (col.key === 'starred') return `${STARRED_WIDTH}px`;
        if (col.key === 'action') return `${ACTION_WIDTH}px`;
        const percent = (col.width / totalRelativeWidth) * 100;
        return `minmax(80px, ${percent.toFixed(2)}%)`;
      })
      .join(' ');
  };

  const getAlignment = (key) => {
  switch (key) {
    case "starred":
      return { textAlign: "left", justifyContent: "flex-start", pl: 0.5 };
    case "action":
      return { textAlign: "right", justifyContent: "flex-end", pr: 0.5 };
    default:
      return { textAlign: "left", justifyContent: "flex-start" };
  }
};

  return (
    <>
      <ContactListItemWrapper
        dense
        button
        key={contact.id}
        className={clsx('item-hover', {
          rootCheck: checkedContacts.includes(contact.id),
        })}
        onClick={(e) => {
 
          if (storage.company_type === 5 && !viewcontact) {
            return;
          }
 
          const isRestrictedRole = roleTypeForRights.includes(restrict);
 
          if (isRestrictedRole && type !== 4) {
            onViewContactDetail(contact);
          } else if (type === 3) {
            handleButtonClick(contact.person_id, e);
          }
        }}

      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: getGridTemplateColumns(columns),
            gap: 2,
            px: 2,
            py: 1,
            width: '100%',
          }}
        >
          {columns.map((col) => {
  const alignment = getAlignment(col.key); 

  return (
    <Box
      key={col.key}
      sx={{
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: alignment.justifyContent,
        textAlign: alignment.textAlign,
        pl: alignment.pl || 0,
        pr: alignment.pr || 0,
      }}
    >
      <Typography
        component="div"
        noWrap
        sx={{
          fontSize: "11px",
          fontFamily: "poppins",
          fontWeight: 400,
          color: "rgba(0, 0, 0, 0.7)",
        }}
      >
        {renderColumn(col.key)}
      </Typography>
    </Box>
  );
})}

</Box>

      </ContactListItemWrapper>
      {type === 3 && dialogOpen &&  <ContactNotificationDialog open={dialogOpen} onClose={handleDialogClose} person_id={contact.person_id} />}
    </>
  );
};

export default ContactListItem;

ContactListItem.propTypes = {
  contact: PropTypes.object.isRequired,
  labelList: PropTypes.array,
  onChangeCheckedContacts: PropTypes.func,
  checkedContacts: PropTypes.array,
  onChangeStarred: PropTypes.func,
  onSelectContactsForDelete: PropTypes.func,
  onViewContactDetail: PropTypes.func,
  onOpenEditContact: PropTypes.func,
};
