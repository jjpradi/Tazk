import React from 'react';
import {Box} from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PropsTypes from 'prop-types';

const PreviewThumb = ({file, onDeleteUploadFile}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        borderRadius: 2,
        marginBottom: 8,
        marginRight: 8,
        width: 100,
        height: 100,
        padding: 1,
        // backgroundColor: 'red',
        boxSizing: 'border-box',
        '& img': {
          display: 'block',
          width: 250,
          objectFit: 'cover',
          height: '100%',
        },
      }}
    >
      <Box
        sx={{
          display:'flex',
          justifyContent:'center',
          alignItems:'center'
        }}
      >
        <DeleteOutlineOutlinedIcon
          sx={{
            color: 'text.secondary',
            borderRadius: '50%',
            padding: 1,
            '&:hover, &:focus': {
              color: 'warning.main',
              backgroundColor: 'primary.contrastText',
            },
          }}
          onClick={(e) => {
            onDeleteUploadFile(file);
            e.stopPropagation();
          }}
        />
      </Box>
      <img alt='preview'  style={{maxHeight:215,maxWidth:240}} src={file.preview} />
    </Box>
  );
};

export default PreviewThumb;
PreviewThumb.propTypes = {
  file: PropsTypes.object,
  onDeleteUploadFile: PropsTypes.func,
};
