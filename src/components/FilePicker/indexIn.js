import React, {useEffect, useState} from 'react';
import UploadClassic from './UploadClassic';
import Box from '@mui/material/Box';
import {AppList, AppGrid} from '../../@crema';
import {useDropzone} from 'react-dropzone';
import PreviewThumb from './PreviewThumb';

import {useThemeContext} from '../../@crema/utility/AppContextProvider/ThemeContextProvider';
import {Button} from '@mui/material';

const MAX_SIZE = 2000000;


const Previews = ({setUploadedFiles, uploadedFiles,upload,amount}) => {
  const {theme} = useThemeContext();
  // let amount = 7000;
  const dropzone = useDropzone({
    accept: '.png,.jpeg,.jpg',
    maxSize: MAX_SIZE,
    maxFiles: 1,
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

  function maxSizeValidator(file) {
    if (file.size > MAX_SIZE) {
      return {
        code: 'size-too-large',
        customError: 'yes',
        message: `File should be less than 2MB`,
      };
    }
    // if (amount <= 5000 && uploadedFiles.length < 1) {
    //   return {
    //     code: 'amount-less',
    //     customError: 'yes',
    //     message: `If amount is 5000 above,Upload file Required`,
    //   };
    // }
  
    return null;
  }

  
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
            height: 234,
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
          <div style={{height:180 , paddingLeft:40}}>
            {uploadedFiles.length > 0 ? (
              <AppGrid
                sx={{
                  maxWidth: 500,
                }}
                data={uploadedFiles}
                column={4}
                itemPadding={5}
                renderRow={(file, index) => (
                  <PreviewThumb
                    file={file}
                    onDeleteUploadFile={onDeleteUploadFile}
                    key={index + file.path}
                  />
                )}
              />
            ) : (
              <div style={{paddingTop:20}}>
                <p>Drag n drop some files here, or click to select files</p>
                <p>Supported formats .png .jpeg .jpg</p>
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
            <Button variant='contained'>Browse Files</Button>
          </div>

        </Box>
        {amount >= 5000 && uploadedFiles.length < 1 && <p style={{color:"crimson"}}>File Required</p>}
      </Box>
      {/* //// */}
    </section>
  );
};

export default Previews;
