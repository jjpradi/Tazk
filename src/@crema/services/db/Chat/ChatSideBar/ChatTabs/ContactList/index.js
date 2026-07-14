import React from 'react';
import ContactItem from './ContactItem';
import PropTypes from 'prop-types';
import AppList from '@crema/core/AppList';
import ListEmptyResult from '@crema/core/AppList/ListEmptyResult';
import ChatListSkeleton from '@crema/core/AppSkeleton/ChatListSkeleton';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

const ContactList = ({
  employeeList,
  loading,
  storage,
  action = 'VIEW_CONTACT',
  selectedContact = [],
  setSelectedContact = () => {},
}) => {
  const {messages} = useIntl();
  const {
    chatReducer: {selectedUser},
  } = useSelector((state) => state);

  const handleChecked = (e, item) => {
    e.stopPropagation();
    if (e.target.checked) {
      setSelectedContact([...selectedContact, item]);
    } else {
      setSelectedContact(
        selectedContact.filter((i) => i.employee_id !== item.employee_id),
      );
    }
  };
  return (
    <AppList
      containerStyle={{
        display: 'flex',
        flexDirection: 'column',
      }}
      data={employeeList}
      ListEmptyComponent={
        <ListEmptyResult
          content={messages['chatApp.noUserFound']}
          loading={loading}
          placeholder={<ChatListSkeleton />}
        />
      }
      renderRow={(item) => (
        <ContactItem
          listStyle='px-0'
          key={'connection-item-' + item.employee_id}
          item={item}
          selectedUser={selectedUser}
          action={action}
          handleChecked={handleChecked}
        />
      )}
    />
  );
};

export default ContactList;
