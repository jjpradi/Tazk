import React, {useEffect, useRef, useState} from 'react';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import {Box, Button, Modal, Typography, IconButton, Grid, Tooltip} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getsessionStorage } from 'pages/common/login/cookies';
import { Cropper } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { useDispatch } from 'react-redux';
import { InvalidFileUploadError } from '../../redux/actions/load';
import { base_url } from 'http-common';
import AddIcon from '@mui/icons-material/Add';

const ProductAttachment = (props) => {
    const { previews, setPreviews, handleImageDelete, status, type, imageKeys, setImageKeys } = props

    const dispatch = useDispatch()

    const [files, setFiles] = useState([])
    const [tempFiles, setTempFiles] = useState([])
    const [croppedFiles, setCroppedFiles] = useState([])
    const storage = getsessionStorage()
    const [open, setOpen] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)
    const [cropDialogOpen, setCropDialogOpen] = useState(false)
    const [imageToCrop, setImageToCrop] = useState([])
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const cropperRef = useRef(null)
    const [fileName, setFileName] = useState('')
    const [imageFit, setImageFit] = useState(false)
    const [imageKey, setImageKey] = useState(0)

    let rolename = storage?.role_name || ''

    useEffect(() => {
        setImageFit(false)
        setImageKey((prevKey) => prevKey + 1)
    }, [imageToCrop, currentImageIndex])

    // const handleImageZoom = () => {
    //     if(cropperRef.current && cropperRef.current.cropper) {
    //         const cropper = cropperRef.current.cropper
    //         const cropBoxData = cropper.getCropBoxData()
    //         const imageData = cropper.getImageData()

    //         const tolerance = 0.2

    //         const fitImage = cropBoxData.left + tolerance >= imageData.left &&
    //                          cropBoxData.top + tolerance >= imageData.top &&
    //                          cropBoxData.left + cropBoxData.width - tolerance <= imageData.left + imageData.width &&
    //                          cropBoxData.top + cropBoxData.height - tolerance <= imageData.top + imageData.height
    //         setImageFit(fitImage)
    //     }
    // }
    
    const handleFileChange = (e) => {
        if(Array.from(e.target.files).filter(file => file.type.startsWith('image/'))?.length > 0) {
            const selectedFiles = Array.from(e.target.files).filter(file => file.type.startsWith('image/'))
            setFileName(selectedFiles)
            setTempFiles([...selectedFiles])
            setFiles([...files, ...selectedFiles])
        
            selectedFiles.forEach((file) => {
                const reader = new FileReader()
                reader.onload = () => {
                    if(type === 'Product') {
                        setImageToCrop((prev) => [...prev, reader.result])
                        if(!cropDialogOpen) {
                            setCurrentImageIndex(imageToCrop?.length)
                            setCropDialogOpen(true)
                        }
                        else {
                            setPreviews((prev) => {
                                const updatedPreviews = Array.isArray(prev) ? [...prev, reader.result] : [reader.result];
                                return updatedPreviews
                            })
                        }
                    }
                    else {
                        setPreviews((prevPreviews) => {
                            const updatedPreviews = Array.isArray(prevPreviews) ? prevPreviews : []
    
                            return [...updatedPreviews, reader.result]
                        })
                    }
                }
                reader.readAsDataURL(file)
            })
        }
        else {
            InvalidFileUploadError(dispatch)
        }
    }
  
    const handleDrop = (e) => {
        e.preventDefault()
        if(Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))?.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
            setFileName(droppedFiles)
            setTempFiles([...droppedFiles])
            setFiles([...files, ...droppedFiles])
    
            droppedFiles.forEach((file) => {
                const reader = new FileReader()
                reader.onload = () => {
                    if(type === 'Product'){
                        setImageToCrop((prev) => [...prev, reader.result])
                        if(!cropDialogOpen) {
                            setCurrentImageIndex(imageToCrop?.length)
                            setCropDialogOpen(true)
                        }
                    }
                    else{
                        setPreviews((prevPreviews) => [...(prevPreviews || []), reader.result])
                    }
                }
                reader.readAsDataURL(file)
            })
        }
        else {
            InvalidFileUploadError(dispatch)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    const handleDelete = (fileIndex) => {
        const updatedFiles = [...files]
        if(fileIndex - previews.filter(e => e.startsWith("https://"))?.length >= 0){
            updatedFiles.splice(fileIndex - previews.filter(e => e.startsWith("https://"))?.length, 1)
            setFiles(updatedFiles)
            setCurrentImageIndex(updatedFiles?.length)
        }

        const updatedCroppedFiles = [...croppedFiles]
        if(fileIndex - previews.filter(e => e.startsWith("https://"))?.length >= 0){
            updatedCroppedFiles.splice(fileIndex - previews.filter(e => e.startsWith("https://"))?.length, 1)
            setCroppedFiles(updatedCroppedFiles)
        }

        const updatedPreviews = [...previews]
        updatedPreviews.splice(fileIndex, 1)
        if(type === 'Product') {
            if(imageKeys){
                const updatedImageKeys = [...imageKeys]
                updatedImageKeys.splice(fileIndex, 1)
                setPreviews((prev) => ({...prev, pic_filename : updatedPreviews}))
                setImageKeys([...updatedImageKeys])
            }
            else{
                setPreviews((prev) => ({...prev, pic_filename : updatedPreviews}))
            }
        }
        else {
            setPreviews(updatedPreviews)
        }

        if(handleImageDelete) {
            handleImageDelete(fileIndex, type)
        }
    }

    const handleOpen = (preview) => {
        setSelectedImage(preview)
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        setSelectedImage(null)
    }

    const handleCropImage = async () => {
        if(cropperRef.current && cropperRef.current.cropper) {
            const croppedImage = cropperRef.current.cropper.getCroppedCanvas().toDataURL()
            const croppedImageBlob = await (await fetch(croppedImage)).blob()
            const currentFile = tempFiles[currentImageIndex]            
            const fileName = currentFile.name
            const croppedImageFile = new File([croppedImageBlob], fileName, {
                type : croppedImageBlob.type
            })
            
            Object.assign(croppedImageFile, {
                path : `./${fileName}`,
                relativePath : `./${fileName}`
            })
            
            setCroppedFiles([...croppedFiles, croppedImageFile])

            if(type === 'Product') {
                setPreviews((prev) => {
                    const updatedPreviews = Array.isArray(prev.pic_filename) ? [...prev.pic_filename, croppedImage] : [croppedImage]
                    return {...prev, pic_filename : updatedPreviews}
                })
            }
            else {
                setPreviews((prev) => {
                    const updatedPreviews = Array.isArray(prev) ? [...prev, croppedImage] : [croppedImage]
                    return [...updatedPreviews]
                })
            }

            if (currentImageIndex < imageToCrop?.length - 1) {
                setCurrentImageIndex((prevIndex) => prevIndex + 1)
            } 
            else {
                setCropDialogOpen(false)
                setCurrentImageIndex(0)
                setImageToCrop([])
            }
        }
    }

    const handleCancelCrop = () => {
        if (currentImageIndex < imageToCrop?.length - 1) {
            setCurrentImageIndex((prevIndex) => prevIndex + 1)
        } 
        else {
            setCropDialogOpen(false)
            setCurrentImageIndex(0)
            setImageToCrop([])
        }
    }

    console.log(previews, 'previews')

  return (
      <>
          {
              rolename !== 'Employee' ?
              <>
                  <label htmlFor = { 'file-input' } style={{ fontSize : '12px', fontWeight : 600 }}>
                      {'Product Images'}  
                  </label>
                  <div
                      onDrop = {handleDrop}
                      onDragOver = {handleDragOver}
                      style = {{ 
                          border : '2px dashed #ccc', 
                          padding : '20px',
                          textAlign : 'center', 
                          
                      }}
                  >
                      <div 
                          style = {{ 
                              marginLeft : previews?.length > 0 ? '30px' : '0px', 
                              alignItems : 'center', 
                              justifyContent : 'center',
                              display : 'flex', 
                              flexWrap : 'wrap', 
                              gap : '20px' 
                          }}
                      >
                      {
                          previews?.length < 6 &&
                          <Box
                              sx={{
                                  position : 'relative',
                                  width : 120,
                                  height : 120,
                                  border : '2px dashed #ccc',
                                  borderRadius : '10px',
                                  display : 'flex',
                                  alignItems : 'center',
                                  justifyContent : 'center',
                                  overflow : 'hidden',
                                  order : 1
                              }}
                          >
                              <input
                                  type = 'file'
                                  id = {'file-input'}
                                  style = {{ display: 'none' }}
                                  onChange = {handleFileChange}
                                  multiple
                              />

                              <label htmlFor = {'file-input'}>
                                  <IconButton component='span'>
                                      <AddIcon sx={{ fontSize: 35 }} />
                                  </IconButton>
                              </label>
                          </Box>
                      }
                  
                      <div>
                          {
                              previews !== null && previews?.length > 0 ? (
                              <div>
                                  {
                                      Array.isArray(previews) && previews.map((preview, index) => {
                                          const file = croppedFiles[index]
                                          const fileName = file ? file.name : 'Unknown'
                                          const fileSize = file ? (file.size / 1024).toFixed(2) + ' KB' : 'Unknown'
                                          return (
                                              <>
                                                  <Box
                                                      sx = {{
                                                          position : 'relative',
                                                          display : 'inline-flex',
                                                          flexDirection : 'column',
                                                          borderRadius : 2,
                                                          marginBottom : 8,
                                                          marginRight : 8,
                                                          padding : 1,
                                                          height : 120,
                                                          width : 120,
                                                          boxSizing : 'border-box',
                                                          '&:hover .delete-icon' : {
                                                              visibility : 'visible',
                                                              opacity: 1
                                                          }
                                                      }}
                                                  >  
                                                      {
                                                          <Box 
                                                              className = "delete-icon"
                                                              sx = {{ 
                                                                  display : 'flex',
                                                                  justifyContent : 'center',
                                                                  alignItems : 'center', 
                                                                  position : 'absolute',
                                                                  top : '4',
                                                                  right : '4', 
                                                                  cursor : 'pointer',
                                                                  visibility : 'hidden', 
                                                                  opacity : 0, 
                                                                  transition : 'opacity 0.2s ease-in-out',
                                                                  width : '30px',
                                                                  height : '30px',
                                                                  borderRadius : '50%',
                                                                  backgroundColor : 'background.default',
                                                              }}
                                                          >
          
                                                              <DeleteOutlineOutlinedIcon
                                                                  sx = {{
                                                                      color : 'text.error',
                                                                      fontSize : '1.2rem', 
                                                                      '&:hover' : { color: 'text.error' }
                                                                  }}
                                                                  onClick = {(e) => {handleDelete(index)}} 
                                                              />
                                                          </Box>
                                                      }
                                                      { 
                                                          preview?.startsWith("data:application/pdf") ? 
                                                          <object
                                                              data = {preview}
                                                              type = 'application/pdf'
                                                              width = '100%'
                                                              height = '100%'
                                                              style = {{ borderRadius : 10 }}
                                                          >
                                                              PDF cannot be displayed.
                                                          </object> :
                                                          <img 
                                                              key = {index} 
                                                              src = {preview.startsWith('https://') ? preview : preview} 
                                                              alt = {`File Preview ${index + 1}`} 
                                                              style = {{ maxWidth: '100px', cursor : 'pointer', maxHeight : '100px' }} 
                                                              onClick = {() => handleOpen(preview)} 
                                                          />
                                                      }
                                                      <Box 
                                                          sx={{ 
                                                              width : '100px', 
                                                              display : 'flex', 
                                                              flexDirection : 'column', 
                                                              textAlign: 'left', 
                                                          }}
                                                      >
                                                          {
                                                              status !== 'Edit Product' &&
                                                              <>
                                                                  <Typography variant = "caption" sx={{ fontSize : '0.65rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                      {fileName} 
                                                                  </Typography>
                                                                  <Typography variant = "caption" sx={{ fontSize : '0.65rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                      {fileSize}
                                                                  </Typography>
                                                              </>
                                                          }
                                                      </Box>
                                                  </Box>
                                              </>
                                          )})
                                      } 
                              </div>
                              ) :
                              (
                                   ''
                              )
                          }
                      </div>
                      </div>
                  </div>
              </> :
              <>
                  <label htmlFor={'file-input'}> Attachment </label>
                  <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      style={{border: '2px ridge #ccc', padding: '20px', textAlign: 'left', borderRadius: '5px'}}
                  >
                      {
                          previews !== null && previews?.length > 0 && (
                              previews.map((preview, index) => (
                              <>
                                  <Box
                                      sx={{
                                          position : 'relative',
                                          display : 'inline-flex',
                                          borderRadius : 2,
                                          marginBottom : 8,
                                          marginRight : 8,
                                          width : 100,
                                          height : 100,
                                          padding : 1,
                                          boxSizing : 'border-box',
                                          '& img' : { display : 'block', width : 250, objectFit : 'cover', height : '100%' }
                                  }}
                                  >
                                      <img 
                                          key = {index} 
                                          src = {preview} 
                                          alt = {`File Preview ${index + 1}`} 
                                          style = {{ maxWidth: '100px' }} 
                                          onClick = {() => handleOpen(preview)}
                                      />
                                  </Box>
                              </>
                              ))
                          )
                      }
                  </div>
              </>
          }
          <Modal
              open = {open}
              onClose = {handleClose}
              aria-labelledby = "image-modal-title"
              aria-describedby = "image-modal-description"
          >
              <Box
                  sx = {{
                      position : 'absolute',
                      top : '50%',
                      left : '50%',
                      transform : 'translate(-50%, -50%)',
                      bgcolor : 'background.paper',
                      boxShadow : 24,
                      alignContent : 'center',
                      p : 4,
                      maxWidth : '700px',
                      width : '90vw',
                      maxHeight : '720px',
                      height : '110vh'
                  }}
              >
                  <Tooltip title = 'Close' >
                      <IconButton
                          onClick = {handleClose}
                          sx = {{
                              position : 'absolute',
                              top : 0,
                              right : 0,
                              color : 'black'
                          }}
                      >
                          <CloseIcon />
                      </IconButton>
                  </Tooltip>
              {
                  selectedImage?.startsWith("data:application/pdf") ? (
                      <object
                          data = {selectedImage}
                          type = 'application/pdf'
                          width = '100%'
                          height = '600px'
                          style = {{ borderRadius: 10 }}
                      >
                          PDF cannot be displayed.
                      </object>
                  ) : (
                      <img
                          src = {selectedImage?.startsWith('/') ? `${base_url}${selectedImage}` : selectedImage}
                          alt = "Selected Preview"
                          style={{ 
                              width : '100%', 
                              height : '100%', 
                              objectFit : 'contain', 
                              maxWidth : '650px', 
                              maxHeight : '650px', 
                              marginLeft : '10px', 
                              marginTop : '10px' 
                          }}
                      />
                  )
              }
              </Box>
          </Modal>
          <Modal
              open = {cropDialogOpen}
              aria-labelledby = "crop-modal-title"
          >
              <Box
                  sx = {{
                      position : 'absolute',
                      top : '50%',
                      left : '50%',
                      transform : 'translate(-50%, -50%)',
                      bgcolor : 'background.paper',
                      padding : 2,
                      boxShadow : 24,
                      maxWidth : '725px',
                      width : '90vw',
                      maxHeight : '725px',
                      height : '110vh',
                      display : 'flex',
                      flexDirection : 'column',
                      justifyContent : 'space-between',
                  }}
              >
                  <Typography variant='h6' align='left'>Crop Images</Typography>
                  {
                      imageToCrop?.length > 0 && (
                          <Cropper 
                              ref = {cropperRef}
                              src = {imageToCrop[currentImageIndex]}
                              style = {{ height : '100%', width : '100%', margin : 'auto', maxWidth : '650px', maxHeight : '650px'  }}
                              guides = {false}
                              dragMode = 'move'
                              cropBoxResizable = {true}
                              cropBoxMovable = {true}
                              cropBoxEditable = {true}
                              minCropBoxWidth = {750}
                              minCropBoxHeight = {750}
                              responsive = {true}
                              background = {false}
                              autoCropArea = {1}
                              // zoom = {handleImageZoom}
                              // cropmove = {handleImageZoom}
                          />
                      )
                  }
                  <Box>
                      <Grid container justifyContent='flex-end' spacing={2} sx={{ marginTop : '1px' }}>
                          <Grid>
                              <Button
                                  variant = 'contained'
                                  color = 'error'
                                  onClick = {handleCancelCrop}
                                  sty
                              >
                                  Cancel
                              </Button>
                          </Grid>

                          <Grid>
                              <Button
                                  variant = 'contained'
                                  color = 'primary'
                                  onClick = {handleCropImage}
                                  // disabled = {!imageFit || !imageToCrop}
                              >
                                  Crop Image
                              </Button>
                          </Grid>
                      </Grid>
                  </Box>
              </Box>
          </Modal>
      </>
  );
};


export default ProductAttachment;