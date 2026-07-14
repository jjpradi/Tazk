import React, { useEffect, useState } from 'react';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { Box, Button, Modal, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getsessionStorage } from 'pages/common/login/cookies';
import * as XLSX from 'xlsx-js-style';
import { useDispatch } from 'react-redux';
import { OpenalertActions } from '../../../redux/actions/alert_actions';

const AttachmentField = (props) => {
  const dispatch = useDispatch();

  const {
    previews,
    setPreviews,
    warranty,
    insurance,
    asset,
    serviceDue,
    handleImageDelete,
    status,
    type,
    handleChange,
    contactUpload,
    bankUpload,
    required,
    inputId
  } = props;

  const fileInputId =
    inputId ||
    (warranty || asset === 'Warranty'
      ? 'file-warrant'
      : insurance || asset === 'Insurance'
      ? 'file-insurance'
      : serviceDue || asset === 'Service Due'
      ? 'file-serviceDue'
      : 'file-input');

  const [files, setFiles] = useState([]);
  const storage = getsessionStorage();
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fileName, setFileName] = useState('');
  let rolename = storage?.role_name || '';

  useEffect(() => {
    if (files.length > 0) {
      setFileName(files[files.length - 1]);
    }
  }, [files]);

  const getPreviewSrc = (preview) => {
    if (typeof preview === 'string') return preview.trim();
    if (preview && typeof preview === 'object') {
      return (
        preview.img_url ||
        preview.url ||
        preview.preview ||
        preview.path ||
        ''
      ).trim();
    }
    return '';
  };

  const hasValidPreview = (preview) => {
    const src = getPreviewSrc(preview);
    return !!src && src !== 'null' && src !== 'undefined';
  };

  const isPdfPreview = (preview) => {
    const src = getPreviewSrc(preview);
    return typeof src === 'string' && src.startsWith('data:application/pdf');
  };

  const getPreviewList = () => {
    if (Array.isArray(previews)) return previews;
    if (!previews || typeof previews !== 'object') return [];

    if (asset === 'Asset') return previews.Image || [];
    if (asset === 'Insurance') return previews['Insurance Document'] || [];
    if (asset === 'Warranty') return previews['Warranty Document'] || [];
    if (asset === 'Service Due') return previews['ServiceDue Document'] || [];
    if (asset === 'ServiceDue') return previews.filePreviews || [];
    if (asset === 'Audit') return previews.imagePreviews || [];
    if (asset === 'Renewals') return previews.renewalsFilePreviews || [];
    if (asset === 'assetWarranty') return previews.warrantyFilePreviews || [];
    if (asset === 'Compliances') return previews.compliancesFilePreviews || [];
    if (asset === 'Leads' || asset === 'Accounts') return previews[props?.labelName] || [];

    return [];
  };

  const previewList = getPreviewList();

  const visiblePreviewList = previewList
    .map((preview, index) => ({
      preview,
      index,
      previewSrc: getPreviewSrc(preview)
    }))
    .filter(({ preview }) => hasValidPreview(preview));


  const processFile = (file) => {
    setFiles((prevFiles) => [...prevFiles, file]);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;

      if (asset === 'Asset') {
        setPreviews((prev) => {
          const updatedPreviews = Array.isArray(prev.Image) ? prev.Image : [];
          const updatedAssetImages = Array.isArray(prev.assetImages) ? prev.assetImages : [];
          return {
            ...prev,
            Image: [...updatedPreviews, result],
            assetImages: [...updatedAssetImages, file]
          };
        });
      } else if (asset === 'Insurance') {
        setPreviews((prev) => {
          const updatedPreviews = Array.isArray(prev['Insurance Document']) ? prev['Insurance Document'] : [];
          const updatedInsuranceFiles = Array.isArray(prev.insuranceFiles) ? prev.insuranceFiles : [];
          return {
            ...prev,
            ['Insurance Document']: [...updatedPreviews, result],
            insuranceFiles: [...updatedInsuranceFiles, file]
          };
        });
      } else if (asset === 'Warranty') {
        setPreviews((prev) => {
          const updatedPreviews = Array.isArray(prev['Warranty Document']) ? prev['Warranty Document'] : [];
          const updatedWarrantyFiles = Array.isArray(prev.warrantyFiles) ? prev.warrantyFiles : [];
          return {
            ...prev,
            ['Warranty Document']: [...updatedPreviews, result],
            warrantyFiles: [...updatedWarrantyFiles, file]
          };
        });
      } else if (asset === 'Service Due') {
        setPreviews((prev) => {
          const updatedPreviews = Array.isArray(prev['ServiceDue Document']) ? prev['ServiceDue Document'] : [];
          const updatedServiceDueFiles = Array.isArray(prev.serviceDueFiles) ? prev.serviceDueFiles : [];
          return {
            ...prev,
            ['ServiceDue Document']: [...updatedPreviews, result],
            serviceDueFiles: [...updatedServiceDueFiles, file]
          };
        });
      } else if (asset === 'Audit') {
        setPreviews((prev) => {
          const updatedPreviews = Array.isArray(prev.imagePreviews) ? prev.imagePreviews : [];
          const updatedAuditImages = Array.isArray(prev.auditImages) ? prev.auditImages : [];
          return {
            ...prev,
            imagePreviews: [...updatedPreviews, result],
            auditImages: [...updatedAuditImages, file]
          };
        });
      } else if (asset === 'Renewals') {
        setPreviews((prev) => {
          const updatedPreviews = Array.isArray(prev.renewalsFilePreviews) ? prev.renewalsFilePreviews : [];
          const updatedRenewalsFiles = Array.isArray(prev.renewalsFiles) ? prev.renewalsFiles : [];
          return {
            ...prev,
            renewalsFilePreviews: [...updatedPreviews, result],
            renewalsFiles: [...updatedRenewalsFiles, file]
          };
        });
      } else if (asset === 'assetWarranty') {
        setPreviews((prev) => {
          const updatedPreviews = Array.isArray(prev.warrantyFilePreviews) ? prev.warrantyFilePreviews : [];
          const updatedRenewalsFiles = Array.isArray(prev.warrantyFiles) ? prev.warrantyFiles : [];
          return {
            ...prev,
            warrantyFilePreviews: [...updatedPreviews, result],
            warrantyFiles: [...updatedRenewalsFiles, file]
          };
        });
      } else if (asset === 'Compliances') {
        setPreviews((prev) => {
          const updatedPreviews = Array.isArray(prev.compliancesFilePreviews) ? prev.compliancesFilePreviews : [];
          const updatedCompliancesFiles = Array.isArray(prev.compliancesFiles) ? prev.compliancesFiles : [];
          return {
            ...prev,
            compliancesFilePreviews: [...updatedPreviews, result],
            compliancesFiles: [...updatedCompliancesFiles, file]
          };
        });
      } else if (type === 'service') {
        setPreviews((prevPreviews) => {
          const updatedPreviews = Array.isArray(prevPreviews) ? prevPreviews : [];
          const updatedPreviewsWithImageUrl = [...updatedPreviews, { img_url: result }];

          let event = {
            target: {
              name: 'attachment',
              value: updatedPreviewsWithImageUrl
            }
          };

          handleChange(event);
          return updatedPreviewsWithImageUrl;
        });
      } else if (asset === 'Leads' || asset === 'Accounts') {
        setPreviews((prev) => {
          const updatedPreviews = Array.isArray(prev[props?.labelName]) ? prev[props?.labelName] : [];
          return { ...prev, [props?.labelName]: [...updatedPreviews, result] };
        });
      } else if (asset === 'journalEntry') {
        setPreviews((prev) => [...prev, result]);
      } else {
        if (contactUpload || bankUpload) {
          handleChange({ target: { files: [file] } });
        }
        setPreviews((prev) => {
          const updated = Array.isArray(prev) ? prev : [];
          return [...updated, result];
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    selectedFiles.forEach((file) => {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const isExcel = fileExtension === 'xlsx' || fileExtension === 'xls';

      if (type === 'collectDefect' && !['jpeg', 'jpg', 'png'].includes(fileExtension)) {
        dispatch(
          OpenalertActions({
            msg: 'Incorrect file format! Please upload jpeg or jpg or png formats.',
            severity: 'warning'
          })
        );
        return;
      }

      if (isExcel) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

            const hasData = jsonData.some((row) =>
              Object.values(row).some((cell) => cell !== null && cell !== '')
            );

            if (!hasData) {
              alert(`File appears to be empty. Please upload a valid file.`);
              return;
            }

            processFile(file);
          } catch (err) {
            console.error('Error parsing Excel file:', err);
            alert(`Could not parse the file: ${file.name}`);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        processFile(file);
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles([...files, ...droppedFiles]);

    droppedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (asset === 'Asset') {
          setPreviews((prev) => ({
            ...prev,
            Image: [...(prev.Image || []), reader.result],
            assetImages: [...(prev.assetImages || []), file]
          }));
        } else if (asset === 'Audit') {
          setPreviews((prev) => ({
            ...prev,
            imagePreviews: [...(prev.imagePreviews || []), reader.result],
            auditImages: [...(prev.auditImages || []), file]
          }));
        } else if (asset === 'Insurance') {
          setPreviews((prev) => ({
            ...prev,
            ['Insurance Document']: [...(prev['Insurance Document'] || []), reader.result],
            insuranceFiles: [...(prev.insuranceFiles || []), file]
          }));
        } else if (asset === 'Warranty') {
          setPreviews((prev) => ({
            ...prev,
            ['Warranty Document']: [...(prev['Warranty Document'] || []), reader.result],
            warrantyFiles: [...(prev.warrantyFiles || []), file]
          }));
        } else if (asset === 'Service Due') {
          setPreviews((prev) => ({
            ...prev,
            ['ServiceDue Document']: [...(prev['ServiceDue Document'] || []), reader.result],
            serviceDueFiles: [...(prev.serviceDueFiles || []), file]
          }));
        } else if (asset === 'ServiceDue') {
          setPreviews((prev) => ({
            ...prev,
            filePreviews: [...(prev.filePreviews || []), reader.result],
            serviceDueFiles: [...(prev.serviceDueFiles || []), file]
          }));
        } else if (asset === 'Renewals') {
          setPreviews((prev) => ({
            ...prev,
            renewalsFilePreviews: [...(prev.renewalsFilePreviews || []), reader.result],
            renewalsFiles: [...(prev.renewalsFiles || []), file]
          }));
        } else if (asset === 'assetWarranty') {
          setPreviews((prev) => ({
            ...prev,
            warrantyFilePreviews: [...(prev.warrantyFilePreviews || []), reader.result],
            warrantyFiles: [...(prev.warrantyFiles || []), file]
          }));
        } else if (asset === 'Compliances') {
          setPreviews((prev) => ({
            ...prev,
            compliancesFilePreviews: [...(prev.compliancesFilePreviews || []), reader.result],
            compliancesFiles: [...(prev.compliancesFiles || []), file]
          }));
        } else {
          setPreviews((prevPreviews) => [...prevPreviews, reader.result]);
        }
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

    const previewList = getPreviewList();
    const updatedPreviews = [...previewList];
    updatedPreviews.splice(fileIndex, 1);

    if (asset === 'Asset') {
      setPreviews((prev) => ({ ...prev, Image: updatedPreviews, assetImages: updatedFiles }));
    } else if (asset === 'Insurance') {
      setPreviews((prev) => ({
        ...prev,
        ['Insurance Document']: updatedPreviews,
        insuranceFiles: updatedFiles
      }));
    } else if (asset === 'Warranty') {
      setPreviews((prev) => ({
        ...prev,
        ['Warranty Document']: updatedPreviews,
        warrantyFiles: updatedFiles
      }));
    } else if (asset === 'Service Due') {
      setPreviews((prev) => ({
        ...prev,
        ['ServiceDue Document']: updatedPreviews,
        serviceDueFiles: updatedFiles
      }));
    } else if (asset === 'Audit') {
      setPreviews((prev) => ({ ...prev, imagePreviews: updatedPreviews, auditImages: updatedFiles }));
    } else if (asset === 'ServiceDue') {
      setPreviews((prev) => ({ ...prev, filePreviews: updatedPreviews, serviceDueFiles: updatedFiles }));
    } else if (asset === 'Renewals') {
      setPreviews((prev) => {
        const existingKeys = Array.isArray(prev.existingImageKey) ? prev.existingImageKey : [];
        const prevFiles = Array.isArray(prev.renewalsFiles) ? prev.renewalsFiles : [];
        const prevPrev = Array.isArray(prev.renewalsFilePreviews) ? prev.renewalsFilePreviews : [];

        const nextPreviews = [...prevPrev];
        nextPreviews.splice(fileIndex, 1);

        let nextExistingKeys = existingKeys;
        let nextFiles = prevFiles;

        if (fileIndex < existingKeys.length) {
          // deleted preview belongs to an already-saved image
          nextExistingKeys = [...existingKeys];
          nextExistingKeys.splice(fileIndex, 1);
        } else {
          // deleted preview belongs to a freshly uploaded file
          const newFileIdx = fileIndex - existingKeys.length;
          nextFiles = [...prevFiles];
          nextFiles.splice(newFileIdx, 1);
        }

        return {
          ...prev,
          renewalsFilePreviews: nextPreviews,
          renewalsFiles: nextFiles,
          existingImageKey: nextExistingKeys,
        };
      });
    } else if (asset === 'assetWarranty') {
      setPreviews((prev) => ({
        ...prev,
        warrantyFilePreviews: updatedPreviews,
        warrantyFiles: updatedFiles
      }));
    } else if (asset === 'Compliances') {
      setPreviews((prev) => ({
        ...prev,
        compliancesFilePreviews: updatedPreviews,
        compliancesFiles: updatedFiles
      }));
    } else if (asset === 'Leads' || asset === 'Accounts') {
      setPreviews((prev) => ({
        ...prev,
        [props?.labelName]: updatedPreviews
      }));
    } else {
      setPreviews(updatedPreviews);
    }

    if (handleImageDelete) {
      handleImageDelete(fileIndex, asset);
    }
  };

  const handleOpen = (preview) => {
    setSelectedImage(preview);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
  };

  const selectedImageSrc = getPreviewSrc(selectedImage);

  return (
    <>
      {rolename !== 'Employee' ? (
        <>
          <label htmlFor={fileInputId}>
            {(warranty || asset === 'Warranty'
              ? 'Support Document'
              : insurance || asset === 'Insurance'
              ? 'Support Document'
              : asset === 'Asset'
              ? 'Asset Photos'
              : asset === 'Service Due'
              ? 'Support Document'
              : 'Attachment')}
            {required && <span style={{ color: '#d32f2f' }}> *</span>}
          </label>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center' }}
          >
            <input
              type='file'
              id={fileInputId}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              multiple
              disabled={status === 6}
            />

            <label htmlFor={fileInputId}>
              <Button component='span' variant='contained' color='primary' disabled={status === 6}>
                Choose Files
              </Button>
            </label>

            <div>
              {props.type !== 'excel' && visiblePreviewList.length > 0 ? (
                <div>
                  {rolename !== 'Employee' && <p>Previews:</p>}

                    {visiblePreviewList.map(({ preview, index, previewSrc }) => {
                    // const previewSrc = getPreviewSrc(preview);

                    return (
                      <Box
                        key={index}
                        sx={{
                          position: 'relative',
                          display: 'inline-flex',
                          borderRadius: 2,
                          marginBottom: 8,
                          marginRight: 8,
                          padding: 1,
                          height: 140,
                          width: 140,
                          boxSizing: 'border-box',
                          '.delete-icon': {
                            visibility: 'visible',
                            opacity: 1
                          }
                        }}
                      >
                        {status !== 6 ? (
                          <Box
                            className='delete-icon'
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              position: 'absolute',
                              top: '4',
                              right: '4',
                              cursor: 'pointer',
                              visibility: 'hidden',
                              opacity: 0,
                              transition: 'opacity 0.2s ease-in-out'
                            }}
                          >
                            <DeleteOutlineOutlinedIcon
                              sx={{
                                fontSize: '1rem',
                                color: 'warning.main',
                                '&:hover': { color: 'warning.main' }
                              }}
                              onClick={() => handleDelete(index)}
                            />
                          </Box>
                        ) : (
                          ''
                        )}

                        {isPdfPreview(preview) ? (
                          <object
                            data={previewSrc}
                            type='application/pdf'
                            width='100%'
                            height='100%'
                            style={{ borderRadius: 10 }}
                          >
                            PDF cannot be displayed.
                          </object>
                        ) : (
                          <img
                            src={previewSrc}
                            alt={`File Preview ${index + 1}`}
                            style={{ maxWidth: '100px', maxHeight: '100px' }}
                            onClick={() => handleOpen(preview)}
                          />
                        )}
                      </Box>
                    );
                  })}
                </div>
              ) : props.type === 'excel' ? (
                <Typography>{fileName?.name}</Typography>
              ) : (
                <p>Drop Files to Attach or Browse</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <label htmlFor={fileInputId}>
            Attachment
            {required && <span style={{ color: '#d32f2f' }}> *</span>}
          </label>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{ border: '2px ridge #ccc', padding: '20px', textAlign: 'left', borderRadius: '5px' }}
          >
            {visiblePreviewList.length > 0 &&
  visiblePreviewList.map(({ preview, index, previewSrc }) => {
    return (

                  <Box
                    key={index}
                    sx={{
                      position: 'relative',
                      display: 'inline-flex',
                      borderRadius: 2,
                      marginBottom: 8,
                      marginRight: 8,
                      width: 100,
                      height: 100,
                      padding: 1,
                      boxSizing: 'border-box',
                      '& img': {
                        display: 'block',
                        width: 250,
                        objectFit: 'cover',
                        height: '100%'
                      }
                    }}
                  >
                    <img
                      src={previewSrc}
                      alt={`File Preview ${index + 1}`}
                      style={{ maxWidth: '100px' }}
                      onClick={() => handleOpen(preview)}
                    />
                  </Box>
                );
              })}
          </div>
        </>
      )}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='image-modal-title'
        aria-describedby='image-modal-description'
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            height: '70%',
            width: '60%',
            bgcolor: 'background.paper',
            boxShadow: 24,
            alignContent: 'center',
            p: 4
          }}
        >
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'black'
            }}
          >
            <CloseIcon />
          </IconButton>

          {selectedImageSrc ? (
  isPdfPreview(selectedImage) ? (
    <object
      data={selectedImageSrc}
      type='application/pdf'
      width='100%'
      height='600px'
      style={{ borderRadius: 10 }}
    >
      PDF cannot be displayed.
    </object>
  ) : (
    <img
      src={selectedImageSrc}
      alt='Selected Preview'
      style={{ width: '100%', objectFit: 'contain', maxWidth: '60vw', maxHeight: '60vh' }}
    />
  )
) : (
  <Typography>No preview available</Typography>
)}

        </Box>
      </Modal>
    </>
  );
};

export default AttachmentField;
