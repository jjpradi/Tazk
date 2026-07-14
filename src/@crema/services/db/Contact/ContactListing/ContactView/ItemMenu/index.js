import React from 'react';
import IntlMessages from '@crema/utility/IntlMessages';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import StarIcon from '@mui/icons-material/Star';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AppTooltip from '@crema/core/AppTooltip';
import Box from '@mui/material/Box';


import {styled} from '@mui/material/styles';
import { Tooltip } from '@mui/material';
import { getsessionStorage } from 'pages/common/login/cookies';
import { useSelector } from 'react-redux';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const ContactActionHoverWrapper = styled('div')(() => {
  return {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: -30,
    top: '50%',
    zIndex: 1,
    transform: 'translateY(-50%)',
    transition: 'all 0.4s ease',
    opacity: 0,
    visibility: 'hidden',
  };
});

const ItemMenu = (props) => {
  const {
    onSelectContactsForDelete,
    contact,
    onChangeStarred,
    onOpenEditContact,
    type,
    SetStaredDel
  } = props;
  let storage = getsessionStorage()
  const {
      rbacReducer: {menuAccess}
    } = useSelector((state) => state);
  const onDeleteContact = (e) => {
    if(type === 4){
      onSelectContactsForDelete(contact.customer_id === null ? [contact.supplier_id] : [contact.customer_id])
      SetStaredDel(contact.customer_id === null ? 1 : 0)
      e.stopPropagation();
    } else if(type === 5) {
      onSelectContactsForDelete(contact.person_id)
      e.stopPropagation()
    }
    else if(type === 2){
      // console.log(contact,'contact65765',type)
       onSelectContactsForDelete([contact.id],(contact.payable[0].due_amount === null || contact.payable[0].due_amount === 0 ) ? false :  true );
      e.stopPropagation();
    }
    else if(type === 3){
      onSelectContactsForDelete(contact.person_id);
      e.stopPropagation();
    }
    else{
      onSelectContactsForDelete([contact.id]);
      e.stopPropagation();
  }
  };

  const onChangeStarredStatus = (e) => {
    onChangeStarred(!contact.isStarred, contact);
    e.stopPropagation();
  };

  const onClickEditOption = (e) => {

    console.log(contact,'conatccc44444',props.type)
    if(storage.company_type === 10) return 
    onOpenEditContact(contact);
    e.stopPropagation();
  };

  const selectedRole = storage.role_name
  const customerEdit = UserRightsAuthorization(menuAccess[selectedRole], 'contact__customer', 'can_edit')
  const vendorEdit = UserRightsAuthorization(menuAccess[selectedRole], 'contact__vendor', 'can_edit')

  const customerDelete = UserRightsAuthorization(menuAccess[selectedRole], 'contact__customer', 'can_delete')
  const vendorDelete = UserRightsAuthorization(menuAccess[selectedRole], 'contact__vendor', 'can_delete')

  const contactEdit = type === 1 ? customerEdit : type === 2 ? vendorEdit : ''
  const contactDelete = type === 1 ? customerDelete : type === 2 ? vendorDelete : ''

  return (
    <Box
      component='span'
      sx={{
        display: 'flex',
        alignItems: 'center',
        marginLeft: 'auto',
        position: 'relative',
      }}
    >
      <span className='conActionHoverHideRoot'>
        <AppTooltip title={<IntlMessages id='common.more' />}>
          <IconButton
            sx={{
              color: (theme) => theme.palette.text.disabled,
              padding: 2,
              '& .MuiSvgIcon-root': {
                fontSize: 22,
              },
            }}
            size='large'
          >
            <MoreVertIcon />
          </IconButton>
        </AppTooltip>
      </span>

      <ContactActionHoverWrapper className='conActionHoverRoot'>
        {/* <IconButton
          sx={{
            color: (theme) => theme.palette.warning.main,
            padding: 2,
            '& .MuiSvgIcon-root': {
              fontSize: 22,
            },
          }}
          onClick={onChangeStarredStatus}
          size='large'
        >
          {contact.isStarred ? <StarBorderIcon /> : <StarIcon />}
        </IconButton> */}
        { (storage.company_type === 10 && props.type === 0)  ? '' : contactEdit && <Tooltip title = 'Edit'>
        <IconButton
          sx={{
            color: (theme) => theme.palette.text.disabled,
            padding: 2,
            '& .MuiSvgIcon-root': {
              fontSize: 22,
            },
          }}
          onClick={onClickEditOption}
          size='large'
        >
          <EditOutlinedIcon />
        </IconButton>
        </Tooltip> }
        {
          contactDelete &&
          <Tooltip title = 'Delete'>
          <IconButton
            sx={{
              color: (theme) => theme.palette.text.disabled,
              padding: 2,
              '& .MuiSvgIcon-root': {
                fontSize: 22,
              },
            }}
            onClick={onDeleteContact}
            size='large'
          >
            <DeleteOutlinedIcon />
          </IconButton>
          </Tooltip>
        }
      </ContactActionHoverWrapper>
    </Box>
  );
};

export default ItemMenu;

ItemMenu.propTypes = {
  onSelectContactsForDelete: PropTypes.func,
  contact: PropTypes.object.isRequired,
  onChangeStarred: PropTypes.func,
  onOpenEditContact: PropTypes.func,
};
