import React from 'react';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import {TiFolderOpen} from 'react-icons/ti';
import {useThemeContext} from '../../@crema/utility/AppContextProvider/ThemeContextProvider';
import {Button} from '@mui/material';

const UploadModern = ({uploadText, dropzone}) => {
  const {theme} = useThemeContext();

  const fileRejectionItems = dropzone.fileRejections.map(({file, errors}) => (
    <li key={file.path}>
      {file.path} - {(file.size / 1000000).toFixed(2)} MB
      <ul>
        {errors.map((e) => {
          if (e.customError) {
            return (
              <li key={e.code} style={{color: 'red'}}>
                {e.message}
              </li>
            );
          }
          return null;
        })}
      </ul>
    </li>
  ));

  return (
    <Box
      sx={{
        position: 'relative',
        '& ul': {
          listStyle: 'none',
          padding: 0,
        },
      }}
    >
      <Box
        {...dropzone.getRootProps({className: 'dropzone'})}
        sx={{
          cursor: 'pointer',
          border: (theme) => `dashed 2px ${theme.palette.divider}`,
          borderRadius: 2.5,
          p: 5,
          textAlign: 'center',
          mb: 4,
          color: 'text.secondary',
          backgroundColor: 'background.default',
        }}
      >
        <input {...dropzone.getInputProps()} />
        <TiFolderOpen
          style={{
            fontSize: 40,
            marginBottom: 4,
            color: theme.palette.primary.main,
          }}
        />
        <p>{uploadText}</p>
        <p>Supported formats .png .jpeg .jpg</p>
        {dropzone.fileRejections.length > 0 ? (
          <>
            <h4>Rejected files</h4>
            <ul>{fileRejectionItems}</ul>
          </>
        ) : (
          ''
        )}
        <Button variant='contained'>Browse Files</Button>
      </Box>
    </Box>
  );
};

export default UploadModern;

UploadModern.propTypes = {
  uploadText: PropTypes.string,
  dropzone: PropTypes.object,
};
