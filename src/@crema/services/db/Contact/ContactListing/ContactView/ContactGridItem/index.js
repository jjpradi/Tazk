import React, {useState, useEffect} from 'react';
import {Card} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import IntlMessages from '@crema/utility/IntlMessages';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import {Fonts} from 'shared/constants/AppEnums';
import ItemMenu from '../ItemMenu';

import {styled} from '@mui/material/styles';
import { getsessionStorage } from 'pages/common/login/cookies';
import { roleType } from 'utils/roleType';
import { formatName } from 'utils/nameFormatter';

const avatarColors = [
  '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', '#f57c00',
  '#0097a7', '#5d4037', '#455a64', '#c2185b', '#00796b'
];

const getAvatarColor = (name) => {
  if (!name) return avatarColors[0];
  const charCode = name.charAt(0).toUpperCase().charCodeAt(0);
  return avatarColors[charCode % avatarColors.length];
};

const GridCard = styled(Card)(({theme}) => {
  return {
    borderRadius: theme.cardRadius,
    border: `solid 1px ${theme.palette.grey[300]}`,
    position: 'relative',
    padding: 16,
    cursor: 'pointer',
    height: '100%',
    transition: 'box-shadow 0.2s ease',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      '& .conActionHoverRoot': {
        opacity: 1,
        visibility: 'visible',
        right: 0,
      },
      '& .conActionHoverHideRoot': {
        opacity: 0,
        visibility: 'hidden',
      },
    },
  };
});

const ContactGridItem = (props) => {
  const {
    contact,
    onChangeCheckedContacts,
    checkedContacts,
    onChangeStarred,
    onSelectContactsForDelete,
    onOpenEditContact,
    onViewContactDetail,
    type,
    SetStaredDel,
  } = props;
  let storage = getsessionStorage()
  let restrict = storage.role_name

 const [itemmenu, setItemMenu] = useState(true);
    useEffect(()=>{

      if(type === 3){
        setItemMenu(false)
      }
      if( type === 4){

          setItemMenu(contact.employee_id === null ? true :false)

      }

    },[type])

  const displayName = formatName(contact?.company_name || contact.first_name || '');
  const initials = displayName ? displayName.charAt(0).toUpperCase() : '?';

  return (
    <GridCard
      className='card-hover'
      onClick={() => (roleType.includes(restrict)) && onViewContactDetail(contact)}
    >
      {/* Top row: Avatar + Name + Menu */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: getAvatarColor(displayName),
            fontSize: 16,
            fontWeight: 600,
            mr: 1.5,
          }}
          src={contact.image || undefined}
        >
          {!contact.image && initials}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            component='p'
            sx={{
              fontWeight: Fonts.SEMI_BOLD,
              fontSize: 14,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayName}
          </Box>
          {contact.employee_code && (
            <Box
              component='p'
              sx={{
                fontSize: 12,
                color: 'text.secondary',
              }}
            >
              {contact.employee_code}
            </Box>
          )}
        </Box>
        {itemmenu && (
          <Box onClick={(event) => event.stopPropagation()}>
            <ItemMenu
              contact={contact}
              onChangeStarred={onChangeStarred}
              onOpenEditContact={onOpenEditContact}
              onSelectContactsForDelete={onSelectContactsForDelete}
              type={type}
              SetStaredDel={SetStaredDel}
            />
          </Box>
        )}
      </Box>

      {/* Email */}
      {contact.email && (
        <Box
          component='p'
          sx={{
            fontSize: 13,
            color: 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 1.5,
          }}
        >
          {contact.email}
        </Box>
      )}

      {/* Divider + Details */}
      <Box
        sx={{
          pt: 1.5,
          fontSize: 13,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ py: 0.5, display: 'flex', alignItems: 'center' }}>
          <BusinessIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Box sx={{ ml: 1.5 }} component='p'>
            {contact.area ? (
              contact.area
            ) : (
              <IntlMessages id='common.na' />
            )}
          </Box>
        </Box>
        <Box sx={{ pt: 0.5, display: 'flex', alignItems: 'center' }}>
          <PhoneOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Box sx={{ ml: 1.5 }} component='p'>
            {contact.phone_number}
          </Box>
        </Box>
      </Box>
    </GridCard>
  );
};

export default ContactGridItem;

ContactGridItem.propTypes = {
  contact: PropTypes.object.isRequired,
  onChangeCheckedContacts: PropTypes.func,
  checkedContacts: PropTypes.array,
  onChangeStarred: PropTypes.func,
  onSelectContactsForDelete: PropTypes.func,
  onOpenEditContact: PropTypes.func,
  onViewContactDetail: PropTypes.func,
};
