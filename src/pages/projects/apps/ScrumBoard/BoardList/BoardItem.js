import React, { useState } from 'react';
import ListAltIcon from '@mui/icons-material/ListAlt';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import {Fonts} from '../../../../../shared/constants/AppEnums';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Menu, MenuItem,ClickAwayListener, Tooltip} from '@mui/material';
import {roleType} from 'utils/roleType';
import {getsessionStorage} from 'pages/common/login/cookies';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FmdBadIcon from '@mui/icons-material/FmdBad';
import NearMeIcon from '@mui/icons-material/NearMe';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { useSelector } from 'react-redux';




const BoardItem = ({
  board,
  onEditButtonClick,
  onViewBoardDetail,
  onDeleteButtonClick,

}) => {
  const storage = getsessionStorage();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const {roleReducer: {user_rights}} = useSelector((state) => state);

  const handleClose = (event) => {
    event.stopPropagation();
    setDeleteDialog(false);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    onDeleteButtonClick(board.id);
    setDeleteDialog(false);
  };

  const handleMenuOpen = (event) => {
    event.stopPropagation(); 
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
  };
  
  const handleBoxClick = () => {
    if (roleType.includes(storage.role_name)) {
      if (storage.role_name === 'Administrator') {
        onEditButtonClick(board.id); 
      } else {
        onViewBoardDetail(board.id);
      }
    }
  };

  const isEmployee = storage.role_name === 'employee';
  const editProject = getRoleAuthorization(user_rights, 'EditProject');
  const deleteProject = getRoleAuthorization(user_rights, 'DeleteProject');

  const commonTooltipStyle = {
    tooltip: {
      sx: {
        backgroundColor: 'white',
        color: 'black',
        fontSize: 12,
        border: '1px solid #dadde9',
      },
    },
    arrow: {
      sx: {
        color: 'white',
      },
    },
  };

  function truncateText(text, maxLength = 20) {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  }

  return (
    <Grid
      key={board.id}
      size={{
        xs: 12,
        sm: 6,
        md: 2.4,
        lg: 2.4
      }}>
      <Box
        // onClick ={handleBoxClick}
        onClick={() => {
          //   if (!roleType.includes(storage.role_name)) {
          onViewBoardDetail(board.id, board.boardType);
          //   }
        }}
        sx={{
          backgroundColor: (theme) => theme.palette.primary.main,
          color: (theme) => theme.palette.primary.contrastText,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: 5,
          textAlign: 'center',
          height: 100,
          // width:150,
          borderRadius: '10px',
          transition: 'transform 0.3s ease-in-out',
          position: 'relative',
          // ':hover': {
          //   transform: 'scale(1.07)',
          //   boxShadow: `0 8px 16px 0 grey`,
          // },
        }}
        key={board.id}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {board.project_type === 1 && board.time_tracking === 1 && (
            <Tooltip
              title='Time Tracking Enabled'
              arrow
              componentsProps={commonTooltipStyle}
            >
              <AccessTimeIcon fontSize='small' />
            </Tooltip>
          )}
          {board.project_type === 2 && (
            <>
              {board.time_tracking === 1 && (
                <Tooltip
                  title='Time Tracking Enabled'
                  arrow
                  componentsProps={commonTooltipStyle}
                >
                  <AccessTimeIcon fontSize='small' />
                </Tooltip>
              )}
              {board.location_restriction === 1 && (
                <Tooltip
                  title='Location Restriction Enabled'
                  arrow
                  componentsProps={commonTooltipStyle}
                >
                  <LocationOnIcon fontSize='small' />
                </Tooltip>
              )}
            </>
          )}
          {board.project_type === 3 && (
            <>
              {board.time_tracking === 1 && (
                <Tooltip
                  title='Time Tracking Enabled'
                  arrow
                  componentsProps={commonTooltipStyle}
                >
                  <AccessTimeIcon fontSize='small' />
                </Tooltip>
              )}
              {board.location_restriction === 1 && (
                <Tooltip
                  title='Location Restriction Enabled'
                  arrow
                  componentsProps={commonTooltipStyle}
                >
                  <LocationOnIcon fontSize='small' />
                </Tooltip>
              )}
            </>
          )}
          {board.project_type === 4 && (
            <>
              {board.time_tracking === 1 && (
                <Tooltip
                  title='Time Tracking Enabled'
                  arrow
                  componentsProps={commonTooltipStyle}
                >
                  <AccessTimeIcon fontSize='small' />
                </Tooltip>
              )}
              {board.live_location === 1 && (
                <Tooltip
                  title='Live Location Enabled'
                  arrow
                  componentsProps={commonTooltipStyle}
                >
                  <NearMeIcon fontSize='small' />
                </Tooltip>
              )}
            </>
          )}
        </Box>

        <Box
          component='p'
          sx={{
            mx: 2,
            fontWeight: Fonts.MEDIUM,
            fontSize: 13,
            textTransform: 'capitalize',
          }}
        >
          {truncateText(board.project_name)}
          <b />
          <Box
            component='p'
            sx={{
              mx: 2,
              fontWeight: Fonts.MEDIUM,
              fontSize: 11,
              textTransform: 'capitalize',
            }}
          >
            {(() => {
              switch (board.project_type) {
                case 1:
                  return 'Regular Location';
                case 2:
                  return 'Single Location';
                case 3:
                  return 'Multi Location';
                case 4:
                  return 'Live Location';
              }
            })()}
          </Box>
        </Box>

        <Box
          sx={{
            marginBottom: 3,
          }}
        >
          {/* <IconButton title='View' onClick={() => onViewBoardDetail(board.id)}>
            <ListAltIcon
              sx={{
                fontSize: 20,
                color: 'primary.contrastText',
              }}
            />
          </IconButton> */}
          {roleType.includes(storage.role_name) && (
            <>
              {/* <IconButton
                title='Edit'
                onClick={() => onEditButtonClick(board.id)}
              >
                <EditIcon
                  sx={{
                    fontSize: 40,
                    color: 'primary.contrastText',
                  }}
                />
              </IconButton> */}

              {board.total_count === 0 && (
                <>
                  <Dialog open={deleteDialog} onClose={handleClose}>
                    <DialogTitle>{'Delete Alert'}</DialogTitle>
                    <DialogContent>
                      <DialogContentText>
                        Are you sure you want to delete this project?
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        variant='contained'
                        color='error'
                        onClick={handleClose}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant='contained'
                        onClick={handleDelete}
                        autoFocus
                      >
                        Delete
                      </Button>
                    </DialogActions>
                  </Dialog>
                </>
              )}
            </>
          )}
         {!isEmployee && 
          (editProject || 
            (board.total_count === 0 && deleteProject)) && (
            <IconButton
              title='More'
              onClick={handleMenuOpen}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
              }}
            >
              <MoreVertIcon
                sx={{
                  fontSize: 20,
                  color: 'primary.contrastText',
                }}
              />
            </IconButton>
          )}
          
          {editProject|| 
          (board.total_count === 0 && deleteProject) ? (
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            getContentAnchorEl={null}
            PaperProps={{
              style: {
                maxHeight: 200,
                width: 80,
              },
            }}
          >
            {editProject && (
              <MenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  onEditButtonClick(board.id);
                  handleMenuClose();
                }}
              >
                Edit
              </MenuItem>
            )}
            {board.total_count === 0 && deleteProject && (
              <MenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  setDeleteDialog(true);
                  handleMenuClose();
                }}
              >
                Delete
              </MenuItem>
            )}
          </Menu>
          ) : null}
        </Box>

        {/* <Box component='span' onClick={(event) => event.stopPropagation()} /> */}
      </Box>
    </Grid>
  );
};

export default BoardItem;

BoardItem.propTypes = {
  board: PropTypes.object.isRequired,
  onEditButtonClick: PropTypes.func.isRequired,
  onViewBoardDetail: PropTypes.func,
  onDeleteButtonClick: PropTypes.func.isRequired,
  members: PropTypes.array,
};
