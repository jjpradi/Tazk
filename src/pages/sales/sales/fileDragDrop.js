import React, {useContext, useEffect} from 'react';
import {Box} from '@mui/material';
import {useDropzone} from 'react-dropzone';
import {useThemeContext} from '../../../@crema/utility/AppContextProvider/ThemeContextProvider';
import {Button} from '@mui/material';
import { FailLoad, ListLoad } from 'redux/actions/load';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
const MAX_SIZE = 200000000;
const ACCEPT_FILE = '.xlsx,.xls';

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

const FileDragDrop = ({
  setUploadedFiles,
  uploadedFiles,
  encodeImageFileAsURL
}) => {
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const {theme} = useThemeContext();

  const dropzone = useDropzone({
    accept: ACCEPT_FILE,
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

  // console.log("dropzone",dropzone)

  useEffect(() => { (async () => {
    const processFile = async () => {
      setUploadedFiles(dropzone.acceptedFiles);
  
      if (dropzone.acceptedFiles.length) {
        ListLoad(setModalTypeHandler, setLoaderStatusHandler);
  
        try {
          await encodeImageFileAsURL({ target: { files: dropzone.acceptedFiles } });
        } catch (error) {
          console.error("Upload failed:", error);
        }
  
        FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      }
    };
  
    processFile();
  })();
}, [dropzone.acceptedFiles]);

  useEffect(() => {
    return () => {
        dropzone.acceptedFiles.length = 0
    }
  },[])

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
          <input
            {...dropzone.getInputProps()}
          />
          <div style={{height: 250}}>
          {uploadedFiles.length > 0 ? '' : (
            <div style={{paddingTop:50}}>
              <p>Drag n drop some files here, or click to select files</p>
              <p>{`Supported formats ${ACCEPT_FILE}`}</p>
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
            <Button variant='contained'>Browse Files...</Button>
          </div>
        </Box>
      </Box>
    </section>
  );
};

export default FileDragDrop;
