import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  ListItem,
  ListItemAvatar,
  Typography,
  alpha,
} from '@mui/material';
import AppScrollbar from '@crema/core/AppScrollbar';
import ContactList from '../../../ChatSideBar/ChatTabs/ContactList';
import AppList from '@crema/core/AppList';
import ListEmptyResult from '@crema/core/AppList/ListEmptyResult';
import {useIntl} from 'react-intl';
import ChatListSkeleton from '@crema/core/AppSkeleton/ChatListSkeleton';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

export default function ViewContact({
  contactList,
  showContact,
  setShowContact,
}) {
  const {messages} = useIntl();

  return (
    <Dialog open={showContact} onClose={() => setShowContact(false)}>
      <DialogTitle>{'View Contact'}</DialogTitle>
      <DialogContent style={{width: '30vw'}}>
        <Grid
          style={{height: '50vh'}}
          size={{
            lg: 4,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <AppScrollbar
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100% - 70px)',
            }}
          >
            <AppList
              containerStyle={{
                display: 'flex',
                flexDirection: 'column',
              }}
              data={contactList}
              ListEmptyComponent={
                <ListEmptyResult
                  content={messages['chatApp.noUserFound']}
                  loading={false}
                  placeholder={<ChatListSkeleton />}
                />
              }
              renderRow={(item, index) => (
                <ContactItem
                  listStyle='px-0'
                  key={'connection-item-' + item.employee_id}
                  item={item}
                  isLastItem={contactList.length - 1 === index}
                />
              )}
            />
          </AppScrollbar>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowContact(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

const ContactItem = (props) => {
  const {item, isLastItem} = props;
  return (
    <>
      <ListItem
        sx={{
          display: 'flex',
          pl: 5,
          pr: 5,
          cursor: 'pointer',
        }}
        button={false}
      >
        <div>
          <ListItemAvatar
            sx={{
              minWidth: 0,
              position: 'relative',
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
              }}
              src={item.image}
            />
          </ListItemAvatar>
        </div>
        <Box
          sx={{
            fontSize: 14,
            pl: 3.5,
            width: 'calc(100% - 36px)',
          }}
        >
          <Box
            sx={{
              display: 'block',
              mb: 0.5,
            }}
          >
            {item.name}
          </Box>
        </Box>
      </ListItem>
      <Box
        sx={{
          pl: 5,
          pr: 5,
          color: 'text.secondary',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        <EmailIcon sx={{fontSize: '1.2rem'}} /> {item.email}
      </Box>
      <Box
        sx={{
          pl: 5,
          pr: 5,
          color: 'text.secondary',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        <PhoneIcon sx={{fontSize: '1.2rem'}} /> {item.phone}
      </Box>
      {!isLastItem && (
        <div style={{padding: '15px 0px'}}>
          {' '}
          <Divider />
        </div>
      )}
    </>
  );
};
