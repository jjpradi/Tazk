import React, {useEffect, useState} from 'react';
import UploadClassic from './UploadClassic';
import {Box, Grid} from '@mui/material';
import {AppList, AppGrid} from '../../@crema';
import {useDropzone} from 'react-dropzone';
import FileRow from './FileRow';
import UploadModern from './UploadModern';
import PreviewThumb from './PreviewThumb';
import {TiFolderOpen} from 'react-icons/ti';
import {useThemeContext} from '../../@crema/utility/AppContextProvider/ThemeContextProvider';
import {Button} from '@mui/material';

const Previews = ({
  setUploadedFiles,
  uploadedFiles,
  upload,
  MAX_SIZE = 2000000,
  acceptedFileFormat = '.png,.jpeg,.jpg',
  fileType = 'PHOTO',
  maxFiles = 1,
}) => {
  const { theme } = useThemeContext();
  
  console.log('uploadedFiles', uploadedFiles);

  function maxSizeValidator(file) {
    if (file.size > MAX_SIZE) {
      return {
        code: 'size-too-large',
        customError: 'yes',
        message: `File should be less than ${Math.floor(MAX_SIZE / 1000000)}MB`,
      };
    }

    return null;
  }

  const dropzone = useDropzone({
    accept: acceptedFileFormat,
    maxSize: MAX_SIZE,
    maxFiles,
    validator: maxSizeValidator,
    onDrop: (acceptedFiles) => {
      setUploadedFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      );
    },
  });
  useEffect(() => {
    setUploadedFiles(dropzone.acceptedFiles);
  }, [dropzone.acceptedFiles]);

  const onDeleteUploadFile = (file) => {
    dropzone.acceptedFiles.splice(dropzone.acceptedFiles.indexOf(file), 1);
    setUploadedFiles([...dropzone.acceptedFiles]);
  };

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
    <section className='container' style={{cursor: 'pointer'}}>
      {/* <UploadModern
        uploadText='Drag n drop some files here, or click to select files'
        setUploadedFiles={setUploadedFiles}
        dropzone={dropzone}
      /> */}
      {/* //// */}
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
            p: 1,
            textAlign: 'center',
            height: 300,
            mb: 1,
            color: 'text.secondary',
            backgroundColor: 'background.default',
          }}
        >
          <input {...dropzone.getInputProps()} />
          {/* <TiFolderOpen
            style={{
              fontSize: 40,
              marginBottom: 4,
              color: theme.palette.primary.main,
            }}
          /> */}

          <div style={{height: 250}}>
            {uploadedFiles.length > 0 ? (
              fileType === 'PHOTO' ? (
                <AppGrid
                  sx={{
                    maxWidth: 500,
                  }}
                  data={uploadedFiles}
                  column={6}
                  itemPadding={2}
                  renderRow={(file, index) => (
                    <PreviewThumb
                      file={file}
                      onDeleteUploadFile={onDeleteUploadFile}
                      key={index + file.path}
                    />
                  )}
                />
              ) : (
                <AppList
                  data={uploadedFiles}
                  renderRow={(file, index) => (
                    <FileRow
                      key={index + file.path}
                      file={file}
                      onDeleteUploadFile={onDeleteUploadFile}
                    />
                  )}
                />
              )
            ) : (
              <div style={{paddingTop: 50}}>
                <p>Drag n drop some files here, or click to select files</p>
                <p>{`Supported formats ${acceptedFileFormat
                  .split(',')
                  .join(' ')}`}</p>
                {dropzone.fileRejections.length > 0 ? (
                  <>
                    <h4>Rejected files</h4>
                    <ul>{fileRejectionItems}</ul>
                  </>
                ) : (
                  ''
                )}
              </div>
            )}
          </div>
          <div>
            <Button variant='outlined'>Browse Files...</Button>
          </div>
        </Box>
        {upload && <p style={{color: 'crimson'}}>File Required</p>}
      </Box>
      {/* //// */}
    </section>
  );
};

export default Previews;
