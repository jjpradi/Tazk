import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {Box, Grid, Typography} from '@mui/material';
import FilePicker from 'components/FilePicker';
import {AppScrollbar, AppSearchBar} from '@crema';
import {useDispatch, useSelector} from 'react-redux';
// import ContactList from '../../../ChatSideBar/ChatTabs/ContactList';
import {useIntl} from 'react-intl';
import {listEmployeeAction} from 'redux/actions/message_actions';
import useGeoLocation from 'utils/useGeoLocation';
// import {OpenStreetMap} from '../MessageList/viewLocation';

const title = {
  PHOTO: 'Select Photos',
  DOCUMENT: 'Select Documents',
  CONTACT: 'Select Contacts',
  LOCATION: 'Share Location',
};

const okayButtonName = {
  PHOTO: 'Share Photos',
  DOCUMENT: 'Share Documents',
  CONTACT: 'Share Contacts',
  LOCATION: 'Share Location',
};

export default function AttachmentModal({
  anchorEl,
  setAnchorEl,
  clicked,
  uploadType,
  setUploadType,
  setUploadedFiles,
  uploadedFiles,
  attachmentDispatch,
  attachment,
  dialogOpen,
  setDialogOpen,
  attachmentFunctions,
}) {
  const dispatch = useDispatch();
  const locationData = useGeoLocation();

  const {
    messageReducer: {employeeList, chatListData},
    chatReducer: {selectedUser},
    common: {loading},
  } = useSelector((state) => state);

  React.useEffect(() => {
    if (uploadType === 'CONTACT') {
      !employeeList.length > 0 && dispatch(listEmployeeAction());
    }
  }, [uploadType]);

  const [keywords, setKeywords] = React.useState('');

  const searchListData = () => {
    const list = employeeList;
    if (keywords !== '') {
      return list.filter((item) =>
        item.first_name.toUpperCase().includes(keywords.toUpperCase()),
      );
    }
    return list;
  };

  const handleClose = () => {
    setDialogOpen(false);
    attachmentDispatch({type: 'RESET', payload: null});
  };

  const handleLocation = () => {
    if (navigator.geolocation) {
      // 'GeoLocation is Available!'
    } else {
      // 'Sorry Not available!'
    }

    // const locationData = location();

    if (locationData.loaded && !locationData.error) {
      attachmentDispatch({type: 'LOCATION', payload: locationData.coordinates});
    }

    if (navigator.geolocation) {
      navigator.permissions
        .query({name: 'geolocation'})
        .then(function (result) {
          if (result.state === 'granted') {
            // const locationData = location();
            attachmentDispatch({type: 'LOCATION', payload: locationData.coordinates});
            //If granted then you can directly call your function here
          } else if (result.state === 'prompt') {
            // 
          } else if (result.state === 'denied') {
            //If denied then you have to show instructions to enable location
          }
          result.onchange = function () {
            // 
          };
        });
    } else {
      alert('Sorry Not available!');
    }
  };

  const handelSubmit = () => {
    if(uploadType === 'LOCATION'){
      attachmentFunctions[uploadType](locationData.coordinates, uploadType);
    }else{
      attachmentFunctions[uploadType](attachment[uploadType], uploadType);
    }
    setDialogOpen(false);
    attachmentDispatch({type: 'RESET', payload: null});
  };

  const searchedListData = searchListData().filter(
    (i) => i.employee_id !== selectedUser.employee_id,
  );

  const MAX_SIZE = uploadType === 'PHOTO' ? 5000000 : 20000000;

  const acceptedFileFormat =
    uploadType === 'PHOTO' ? '.png,.jpeg,.jpg' : '.xlsx,.xls,.csv,.pdf,.txt';

  const {messages} = useIntl();

  return (
    <div>
      <Dialog open={dialogOpen} onClose={handleClose} >
        <DialogTitle style={{fontSize:'20px'}}>{title[uploadType]}</DialogTitle>
        <DialogContent style={{width: '30vw', }}>
          {/* photo and document */}
          {['PHOTO', 'DOCUMENT'].includes(uploadType) ? (
            <>
              <Grid
                size={{
                  lg: 6,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Box
                  p='30px'
                  display='flex'
                  justifyContent='center'
                  alignItems='center'
                  style={{
                    backgroundColor: '#F4F7FE',
                    width: '100%',
                    height: '80%',
                    borderRadius: '10px',
                  }}
                >
                  <FilePicker
                    setUploadedFiles={(data) => {
                      attachmentDispatch({type: uploadType, payload: data});
                    }}
                    uploadedFiles={
                      uploadType === 'PHOTO'
                        ? attachment.PHOTO
                        : attachment.DOCUMENT
                    }
                    MAX_SIZE={MAX_SIZE}
                    acceptedFileFormat={acceptedFileFormat}
                    fileType={uploadType}
                    maxFiles={1}
                  />
                </Box>
              </Grid>
              {/* <Typography sx={{paddingTop:'15px', textAlign:'center', color:'grey'}}>Note : Files will be removed after 1 month</Typography> */}
            </>
          ) : null}
          {/* contacts */}
          {uploadType === 'CONTACT' ? (
            <Grid
              style={{height: '50vh'}}
              size={{
                lg: 4,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <AppSearchBar
                sx={{
                  marginRight: 0,
                  width: '100%',
                  marginBottom: '20px',
                  '& .searchRoot': {
                    width: '100%',
                  },
                  '& .MuiInputBase-input': {
                    width: '100%',
                    '&:focus': {
                      width: '100%',
                    },
                  },
                }}
                iconPosition='right'
                overlap={false}
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder={messages['common.searchHere']}
              />
              <AppScrollbar
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: 'calc(100% - 70px)',
                }}
              >
                {/* <ContactList
                  employeeList={
                    searchedListData.length > 0 || keywords
                      ? searchedListData
                      : employeeList
                  }
                  loading={loading}
                  action='SEND_CONTACT'
                  setSelectedContact={(data) => {
                    attachmentDispatch({type: uploadType, payload: data});
                  }}
                  selectedContact={attachment.CONTACT}
                /> */}
              </AppScrollbar>
            </Grid>
          ) : null}

          {/* {uploadType === 'LOCATION' ? (
            <>
              <OpenStreetMap
                zoom={14}
                style={{height: '200px', width: 'calc(30vw - 50px)'}}
                location={{
                  lat: locationData.coordinates.lat,
                  lng: locationData.coordinates.lng,
                }}
              />
            </>
          ) : null} */}
        </DialogContent>
        <DialogActions style={{padding:'10px 10px'}}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handelSubmit} variant='contained'>
            {okayButtonName[uploadType]}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
