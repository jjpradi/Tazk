import React, {useState} from 'react';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import {Box, Button, Typography} from '@mui/material';
import { getsessionStorage } from 'pages/common/login/cookies';

const CommentAttachment = ({ commentAttachment, setCommentAttachment, status, children }) => {

  const [files, setFiles] = useState([]);
  const storage = getsessionStorage();
  let rolename = storage?.role_name || '';
  console.log('rolename',files)
  // const handleFileChange = (e) => {
  //   const selectedFiles = Array.from(e.target.files);
  //   setFiles([...files, ...selectedFiles]);

  //   selectedFiles.forEach((file) => {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       setCommentAttachment((prevPreviews) => [...prevPreviews, reader.result]);
  //     };
  //     reader.readAsDataURL(file);
  //   });
  // };
console.log("thisPage");
  const handleFileChanges = (e) => {
    console.log("hereee");
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    // console.log("vbgg",Array.from(e.target.files));
  
    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setCommentAttachment((prevPreviews) => {
          // Check if prevPreviews is already an array
          const updatedPreviews = Array.isArray(prevPreviews) ? prevPreviews : [];
          return [...updatedPreviews, reader.result];
        });
      };
      reader.readAsDataURL(file);
    });
  };
  

  const handleDrop = (e) => {
    e.preventDefault();
    if (status === 6) return;
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);

    droppedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setCommentAttachment((prevPreviews) => [...prevPreviews, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDelete = (fileIndex) => {
    const updatedFiles = [...files];
    updatedFiles.splice(fileIndex, 1);
    setFiles(updatedFiles);

    const updatedPreviews = [...commentAttachment];
    updatedPreviews.splice(fileIndex, 1);
    setCommentAttachment(updatedPreviews);
  };

  console.log('asfeetff', commentAttachment)

  const fileInputId = rolename !== 'Employee' ? 'file-input1' : 'file-input';

  return (
    <Box
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      sx={{
        position: 'relative',
        width: '100%',
        border: '2px dashed #c7c7c7',
        borderRadius: 2,
        p: 2,
        backgroundColor: '#fafafa',
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
        <input
          type='file'
          id={fileInputId}
          style={{display: 'none'}}
          onChange={handleFileChanges}
          disabled={status===6}
          multiple
        />
        <label htmlFor={fileInputId}>
          <Button component='span' variant='contained' color='primary' disabled={status===6}>
            Upload
          </Button>
        </label>
        <Typography variant='body2' color='text.secondary'>
          Drag & drop images here or click Upload
        </Typography>
      </Box>

      <Box sx={{mb: 2}}>
        {children}
      </Box>

      {commentAttachment !== null && commentAttachment?.length > 0 ? (
        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
          {commentAttachment.map((preview, index) => (
            <Box
              key={preview}
              sx={{
                position: 'relative',
                display: 'inline-flex',
                borderRadius: 2,
                width: 100,
                height: 100,
                p: 1,
                boxSizing: 'border-box',
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                '& img': {
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 6,
                },
              }}
            >
              {rolename !== 'Employee' ? (
                <Box sx={{position: 'absolute', top: -8, right: -8}}>
                  <DeleteOutlineOutlinedIcon
                    sx={{
                      color: 'text.secondary',
                      borderRadius: '50%',
                      padding: 0.5,
                      backgroundColor: '#fff',
                      boxShadow: 1,
                      '&:hover, &:focus': {
                        color: 'warning.main',
                        backgroundColor: 'primary.contrastText',
                      },
                    }}
                    onClick={(e) => {
                      handleDelete(index);
                    }}
                  />
                </Box>
              ) : null}
              <img src={preview} alt={`File Preview ${index + 1}`} />
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
};

export default CommentAttachment;
