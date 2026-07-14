import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';

import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import DescriptionIcon from '@mui/icons-material/Description';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';

export default function AttachmentMenu({anchorEl, setAnchorEl, uploadType, setUploadType, dialogOpen, setDialogOpen}) {
  const open = Boolean(anchorEl);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSetUploadType = (type) => {
    setUploadType(type)
    setDialogOpen(true)
  }


  return (
    <React.Fragment>
      <Menu
        anchorEl={anchorEl}
        id='account-menu'
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            borderRadius: 40,
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '& .MuiMenuItem-root': {
              margin: '0.5rem 0rem',
              padding: '10px 15px',
              fontSize: '1rem',
            },
          },
        }}
        transformOrigin={{horizontal: 'left', vertical: 'bottom'}}
        anchorOrigin={{horizontal: 'left', vertical: 'top'}}
      >
        <MenuItem onClick={() => handleSetUploadType('PHOTO')}>
          <ListItemIcon>
            <PhotoLibraryIcon fontSize='small' style={{color: '#0A8FDC'}} />
          </ListItemIcon>
          Photo
        </MenuItem>
        <MenuItem onClick={() => handleSetUploadType('DOCUMENT')}>
          <ListItemIcon>
            <DescriptionIcon fontSize='small' style={{color: '#0A8FDC'}} />
          </ListItemIcon>
          Documents
        </MenuItem>
        <MenuItem onClick={() => handleSetUploadType('CONTACT')}>
          <ListItemIcon>
            <ContactPhoneIcon fontSize='small' style={{color: '#0A8FDC'}} />
          </ListItemIcon>
          Contact
        </MenuItem>
        <MenuItem onClick={() => handleSetUploadType('LOCATION')}>
          <ListItemIcon>
            <LocationOnIcon fontSize='small' style={{color: '#0A8FDC'}} />
          </ListItemIcon>
          Location
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
