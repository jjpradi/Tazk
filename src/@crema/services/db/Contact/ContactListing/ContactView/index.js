import ContactListItem from './ContactListItem';
import Box from '@mui/material/Box';
import ContactGridItem from './ContactGridItem';
import React from 'react';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import AppList from '@crema/core/AppList';
import AppGrid from '@crema/core/AppGrid';
import ListEmptyResult from '@crema/core/AppList/ListEmptyResult';
import IntlMessages from '@crema/utility/IntlMessages';
import ContactListSkeleton from '@crema/core/AppSkeleton/ContactListSkeleton';
import ContactListItemMobile from './ContactListItem/ContactListItemMobile';

const ContactView = (props) => {
  const {
    list,
    pageView,
    loading,
    handleAddContactOpen,
    onChangeStarred,
    onChangeCheckedContacts,
    checkedContacts,
    onSelectContactsForDelete,
    onOpenEditContact,
    onViewContactDetail,
    type,
    SetStaredDel,
    tabledata,
    isApiFinished
  } = props;
  const labelList = useSelector(({contactApp}) => contactApp.labelList);
  return (
    <div style={{paddingBottom: '70px'}}>
      {pageView === 'list' ? (
        <>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <AppList
              data={list}
              animation='transition.slideUpIn'
              sx={{
                pt: 0,
                pb: 0,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
              ListEmptyComponent={
                <ListEmptyResult
                  actionKey="createContact"
                  loading={loading}
                  actionTitle={<IntlMessages id='contactApp.createContact' />}
                  onClick={handleAddContactOpen}
                  placeholder={<ContactListSkeleton />}
                  isApiFinished= {isApiFinished}
                />
              }
              renderRow={(contact) => (
                <ContactListItem
                  key={contact.id}
                  contact={contact}
                  labelList={labelList}
                  onChangeCheckedContacts={onChangeCheckedContacts}
                  checkedContacts={checkedContacts}
                  onSelectContactsForDelete={onSelectContactsForDelete}
                  onChangeStarred={onChangeStarred}
                  onViewContactDetail={onViewContactDetail}
                  onOpenEditContact={onOpenEditContact}
                  type ={type }
                  SetStaredDel={SetStaredDel}
                  list={list}
                />
              )}
            />
          </Box>

          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <AppList
              data={list}
              animation='transition.slideUpIn'
              sx={{
                pt: 0,
                pb: 0,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
              ListEmptyComponent={
                <ListEmptyResult
                  loading={loading}
                  actionKey="createContact"
                  actionTitle={<IntlMessages id='contactApp.createContact' />}
                  onClick={handleAddContactOpen}
                  placeholder={<ContactListSkeleton />}
                  isApiFinished= {isApiFinished}
                />
              }
              renderRow={(contact) => (
                <ContactListItemMobile
                  key={contact.id}
                  contact={contact}
                  checkedContacts={checkedContacts}
                  labelList={labelList}
                  onChangeStarred={onChangeStarred}
                  onViewContactDetail={onViewContactDetail}
                  onOpenEditContact={onOpenEditContact}
                  type ={type}
                  SetStaredDel={SetStaredDel}
                />
              )}
            />
          </Box>
        </>
      ) : (
        <Box
          sx={{
            px: 2.5,
            pt: 0.5,
            pb: 3,
            overflowY: 'scroll',
            paddingBottom: "40px"
          }}
        >
          <AppGrid
            itemPadding={8}
            responsive={{
              xs: 1,
              sm: 2,
              md: 3,
              lg: 4,
              xl: 4,
            }}
            data={list}
            renderRow={(contact) => (
              <ContactGridItem
                key={contact.id}
                contact={contact}
                labelList={labelList}
                onChangeCheckedContacts={onChangeCheckedContacts}
                checkedContacts={checkedContacts}
                onChangeStarred={onChangeStarred}
                onSelectContactsForDelete={onSelectContactsForDelete}
                onViewContactDetail={onViewContactDetail}
                onOpenEditContact={onOpenEditContact}
                type ={type}
                SetStaredDel={SetStaredDel}
              />
            )}
          />
        </Box>
      )}
    </div>
  );
};

export default ContactView;

ContactView.propTypes = {
  list: PropTypes.array,
  pageView: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  handleAddContactOpen: PropTypes.func,
  checkedContacts: PropTypes.array,
  onChangeCheckedContacts: PropTypes.func,
  onChangeStarred: PropTypes.func,
  onSelectContactsForDelete: PropTypes.func,
  onOpenEditContact: PropTypes.func,
  onViewContactDetail: PropTypes.func,
  type:PropTypes.number
};
