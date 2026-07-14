import React from 'react';
import Checkbox from '@mui/material/Checkbox';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';

const CheckBox = ({checkedContacts, setCheckedContacts}) => {
  const contactList = useSelector(({contactApp}) => contactApp.contactList);

  // const onHandleMasterCheckbox = (event) => {
  //   if (event.target.checked) {
  //     const contactIds = contactList.map((contact) => contact.id);
  //     setCheckedContacts(contactIds);
  //   } else {
  //     setCheckedContacts([]);
  //   }
  // };

  const{ customerReducer: { customer_paginate }}  = useSelector((state) => state); 
  const onHandleMasterCheckbox = (event) => {
    if (event.target.checked) {
      let cus_Id =  customer_paginate.map((v)=>v.id)
      setCheckedContacts(cus_Id);
    } else {
      setCheckedContacts([]);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      
      <Checkbox
        sx={{
          color: (theme) => theme.palette.text.disabled,
        }}
        color='primary'
        checked={
          customer_paginate.length > 0 &&
          checkedContacts.length === customer_paginate.length
        }
        onChange={onHandleMasterCheckbox}
      />
      
    </Box>
  );
};

export default CheckBox;

CheckBox.propTypes = {
  checkedContacts: PropTypes.array.isRequired,
  setCheckedContacts: PropTypes.func,
  contact: PropTypes.object.isRequired,
  type: PropTypes.number
};
