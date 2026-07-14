import React, { useState } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { useDispatch } from 'react-redux';
import { OpenalertActions } from '../../../redux/actions/alert_actions';

const ALLOWED_EXTENSIONS = ['pdf'];

const LoanImportField = ({ files, setFiles }) => {
  const dispatch = useDispatch();

  const isValidFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const valid = [];
    selectedFiles.forEach((file) => {
      if (!isValidFile(file)) {
        dispatch(OpenalertActions({ msg: `"${file.name}" is not allowed. Only PDF files are accepted.`, severity: 'warning' }));
      } else {
        valid.push(file);
      }
    });
    if (valid.length > 0) setFiles((prev) => [...prev, ...valid]);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const valid = [];
    droppedFiles.forEach((file) => {
      if (!isValidFile(file)) {
        dispatch(OpenalertActions({ msg: `"${file.name}" is not allowed. Only PDF files are accepted.`, severity: 'warning' }));
      } else {
        valid.push(file);
      }
    });
    if (valid.length > 0) setFiles((prev) => [...prev, ...valid]);
  };

  const handleDelete = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <label htmlFor="loan-import-input">Attachment</label>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center' }}
      >
        <input
          type="file"
          id="loan-import-input"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          multiple
          accept=".pdf"
        />
        <label htmlFor="loan-import-input">
          <Button component="span" variant="contained" color="primary">
            Choose Files
          </Button>
        </label>

        {files.length > 0 ? (
          <Box sx={{ mt: 1.5, textAlign: 'left' }}>
            {files.map((file, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                <InsertDriveFileOutlinedIcon sx={{ fontSize: 18, color: '#667085' }} />
                <Typography sx={{ fontSize: 13, flex: 1 }}>{file.name}</Typography>
                <IconButton size="small" onClick={() => handleDelete(index)}>
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        ) : (
          <p>Drop PDF files to Attach or Browse</p>
        )}
      </div>
    </>
  );
};

export default LoanImportField;
