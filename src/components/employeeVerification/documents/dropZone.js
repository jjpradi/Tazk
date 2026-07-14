import React from 'react';
import {Box, Typography} from '@mui/material';
import {useDropzone} from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageViewDialog from './imageDialog';

const MAX_SIZE = 200000000;
const ACCEPT_FILE = '.png,.jpg,.pdf,.xlsx,.xls';

function maxSizeValidator(file) {
  if (file.size > MAX_SIZE) {
    return {
      code: 'size-too-large',
      customError: 'yes',
      message: `File should be less than 2MB`,
    };
  }

  return null;
}

const DropZone = ({
  onDrop,
  setUpload,
  upload,
  file,
  setFile,
  setDocType,
  setPreview,
  preview,
  handleVerification,
  isVerified,
  getFieldProps,
}) => {
  const {getRootProps, getInputProps} = useDropzone({
    accept: ACCEPT_FILE,
    maxFiles: 1,
    validator: maxSizeValidator,
    onDrop: (acceptedFiles) => {
      !preview && setUpload(acceptedFiles[0].name);
      setDocType(acceptedFiles[0].type.split('/')[0]);
      setFile(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      );
      onDrop(acceptedFiles);
    },
  });

  // const onDeleteUploadFile = (file) => {
  //   DropZone.acceptedFiles.splice(DropZone.acceptedFiles.indexOf(file), 1);
  //   setFile([...DropZone.acceptedFiles]);
  // };

  return (
    <Box
      {...getRootProps({
        className: 'dropzone',
      })}
      sx={{
        padding: 4,
        borderRadius: 4,
        cursor: 'pointer',
        textAlign: 'center',
        border: '1px dashed',
        borderColor: 'grey.400',
        transition: 'transform 0.3s ease-in-out', // Smooth transition for transform
        ':hover': {
          transform: 'scale(0.99)', // Scales down the card to 95% of its size on hover
        },
      }}
    >
      <CloudUploadIcon
        sx={{
          fontSize: 38,
          color: 'text.secondary',
        }}
      />
      {upload ? (
        <>
          <Typography color='text.secondary'>File uploaded:</Typography>
          <Typography fontSize={16} color='primary.main'>
            {upload}
          </Typography>
        </>
      ) : (
        <>
          <Typography color='text.secondary'>
            {'Drop your file here (max size 300KB)'}
          </Typography>
          <Typography fontSize={16} color='primary.main'>
            Click to browse
          </Typography>
        </>
      )}
      <input {...getInputProps()} placeholder='Click to browse' />

      {preview ? (
        <ImageViewDialog
          open={preview}
          handleClose={() => setPreview(false)}
          img={file}
          type='preview'
          handleVerification={handleVerification}
          isVerified={isVerified}
          getFieldProps={getFieldProps}
        />
      ) : null}
    </Box>
  );
};

export default DropZone;
