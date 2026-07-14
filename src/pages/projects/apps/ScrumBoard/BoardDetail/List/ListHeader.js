import React, {useState} from 'react';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import {Fonts} from '../../../../../../shared/constants/AppEnums';
import IntlMessages from '@crema/utility/IntlMessages';
import AppConfirmDialog from '@crema/core/AppConfirmDialog';
import IconButton from '@mui/material/IconButton';


const ListHeader = (props) => {
 
  const {name, id, onDelete, updateTitle,task_id, task_count,taskDataForEdit,cards, totalCount} = props;
  const loadedCount = Array.isArray(cards) ? cards.length : 0;
  const displayCount = typeof totalCount === 'number' ? totalCount : loadedCount;

  const [isEditListName, setEditListName] = useState(false);

  const [editedListName, setEditedListName] = useState('');

  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const onDeleteBoardList = () => {
    // onDelete(id);
    setDeleteDialogOpen(false);
  };

  const onEditButtonClick = () => {
    setEditedListName(name);
    setEditListName(!isEditListName);
  };

  const onEditListName = () => {
    if (editedListName !== '') {
      // updateTitle(editedListName);
      setEditListName(false);
    }
  };

  // const getTotalTasksCount = () => {
  //   return 10;
  // };

  // const totalTasksCount = getTotalTasksCount();

  return (
    // <Card
    //   sx={{
    //     py: 1.75,
    //     px: 6,
    //     mb: 2,
    //     minHeight: 56,
    //     display: 'flex',
    //     alignItems: 'center',
    //     border: '2px solid black',
    //     borderRadius: 16
    //   }}
    // >
    // </Card>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 15,
        fontWeight: Fonts.MEDIUM,
        width: '100%',
        height: 'auto',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        borderRadius: '5px',
        // backgroundColor: '#FFF',
        backgroundColor: '#B0BEC5',
        color: '#111827',
        minHeight: 56,
        py: 1.75,
        px: 6,
        mb: 2,
      }}
    >
      <span>{name} - {displayCount}</span>
    </Box>
  );
  
};

export default ListHeader;

ListHeader.propTypes = {
  boardId: PropTypes.string.isRequired,
  name: PropTypes.string,
  // task_id : propTypes.number,
  id: PropTypes.number,
  onDelete: PropTypes.func,
  updateTitle: PropTypes.func,
  // taskDataForEdit: PropTypes.number.isRequired, 
};
