import React, { useEffect, useState } from 'react';
import UploadFile from '../../../src/components/Dragfile/uploadFile';
import Box from '@mui/material/Box';
import { useDropzone } from 'react-dropzone';
import PreviewThumb from './PreviewThumb';
import { AppGrid } from '@crema';

const DialogProgrammatically = ({uploadedFiles, setUploadedFiles, upload}) => {
  const dropzone = useDropzone({
    accept: {
      'image/png': ['.png', '.jpg', '.jpeg'],
    },
    
  });
  const { fileRejections, acceptedFiles } = dropzone;

  useEffect(() => {
    setUploadedFiles(dropzone.acceptedFiles);
  }, [acceptedFiles]);

  const onDeleteUploadFile = (file) => {
    acceptedFiles.splice(acceptedFiles.indexOf(file), 1);
    setUploadedFiles([...acceptedFiles]);
  };

  return (
    <section className="container" style={{ cursor: 'pointer' }}>
    <UploadFile
      uploadText="Drag n drop some files here, or click to select files"
      setUploadedFiles={setUploadedFiles}
      dropzone={dropzone}
    />

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
          {upload && <p style={{color:"crimson"}}>File Required</p>}

  </section>
  );
};
export default DialogProgrammatically;

