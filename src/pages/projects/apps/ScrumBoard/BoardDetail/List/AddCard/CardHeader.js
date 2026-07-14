import React from 'react';
import Box from '@mui/material/Box';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import IntlMessages from '@crema/utility/IntlMessages';
import {useDropzone} from 'react-dropzone';
import PropTypes from 'prop-types';
import {Fonts} from '../../../../../../../shared/constants/AppEnums';
import IconButton from '@mui/material/IconButton';
import {Divider, Typography} from '@mui/material';
import {IssueTypeIcon} from 'pages/projects/CommenData';


const CardHeader = (props) => {
  const {onClickDeleteIcon, onCloseAddCard, onAddAttachments,taskDataForEdit} = props;
  const {getRootProps, getInputProps} = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      const files = acceptedFiles.map((file) => {
        return {
          id: Math.floor(Math.random() * 10000),
          file,
          preview: URL.createObjectURL(file),
        };
      });
      onAddAttachments(files);
    },
  });

  return (
    <Box
      sx={{
        py: 2,
        px: {xs: 5, lg: 8, xl: 10},
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>

        <IssueTypeIcon type={taskDataForEdit?.issue_type || 'task'} />
        <Typography fontSize='13px' fontWeight={600} color='rgba(0, 0, 0, 0.7)'>
          {taskDataForEdit?.task_id == null ? 'New Task' : [
            taskDataForEdit?.epic_key
            ? `${taskDataForEdit.epic_key}/` : '',
            taskDataForEdit?.story_key_id != null &&
            taskDataForEdit?.story_key_id !== ''
            ? `${taskDataForEdit.story_key_id}-story/` : '',
            taskDataForEdit?.parent_task_key
            ? `${taskDataForEdit.parent_task_key}/-P`: '',
            taskDataForEdit?.task_id ?? '',
          ].filter(Boolean).join(' ')}
          </Typography>
      </Box>
      <Box
        sx={{
          pl: 2,
          mr: {xs: -2, lg: -3, xl: -4},
          display: 'flex',  
          alignItems: 'center',
        }}
      >
        <IconButton
          onClick={() => onCloseAddCard()}
          sx={{
            color: (theme) => theme.palette.text.secondary,
          }}
        >
          <CloseOutlinedIcon />
        </IconButton>
      </Box>
      {/* <Box
        sx={{
          pl: 2,
          mr: {xs: -2, lg: -3, xl: -4},
          display: 'flex',
          alignItems: 'center',
        }}
      > */}
      {/* <Box {...getRootProps({className: 'dropzone'})}>
          <input {...getInputProps()} />
          <IconButton>
            <AttachFileIcon />
          </IconButton>
        </Box> */}
      {/* <Box>
          <IconButton
            onClick={onClickDeleteIcon}
            sx={{
              color: (theme) => theme.palette.text.secondary,
            }}
          >
            <DeleteOutlinedIcon />
          </IconButton>
        </Box> */}
      {/* <Box>
          <IconButton
            onClick={() => onCloseAddCard()}
            sx={{
              color: (theme) => theme.palette.text.secondary,
            }}
          >
            <CloseOutlinedIcon />
          </IconButton>
        </Box>
      </Box> */}
    </Box>
  );
};

export default CardHeader;

CardHeader.propTypes = {
  onClickDeleteIcon: PropTypes.func,
  onAddAttachments: PropTypes.func,
  onCloseAddCard: PropTypes.func,
};
