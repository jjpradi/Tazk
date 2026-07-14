import Avatar from '@mui/material/Avatar';
import { Alert, Box, Button, Card, Dialog, Grid, Typography } from '@mui/material';
import AvatarViewWrapper from 'utils/imgUpload';
import EditIcon from '@mui/icons-material/Edit';
import { useDropzone } from 'react-dropzone';
import React, { useContext, useEffect, useState } from 'react';
import context from '../../../../src/context/CreateNewButtonContext';
import { useDispatch, useSelector } from 'react-redux';
import { getsessionStorage } from 'pages/common/login/cookies';
import { uploadSignature } from 'redux/actions/company_actions';
import apiCalls from 'utils/apiCalls';
import DeleteIcon from '@mui/icons-material/Delete'
import ImageCrop from 'pages/assets/Assets/CropImage';


export default function Signature({ setForm }) {
    const [image, setImage] = useState(null)
    const [isEnabled, setIsEnabled] = useState(false);
    const [imageStatus, setImageStatus] = useState(true);
    const [fileSizeError, setFileSizeError] = useState('');
    const [cropImageModal, setCropImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(context);
    const dispatch = useDispatch();
    const storage1 = getsessionStorage()
    const {
        appConfigReducer: { app_config_data, appConfigWithCompanyInfo }, CompanyReducers: { signature }
    } = useSelector((state) => state);

    console.log('signature',signature)

    const {getRootProps, getInputProps} = useDropzone({ 
        accept: 'image/jpeg , image/png , image/jpg',
        onDrop: (acceptedFiles) => {
            if (acceptedFiles[0] instanceof Blob) {

                const file = acceptedFiles[0];
                const fileSizeInKB = file.size / 1024; // Convert bytes to KB
                if (fileSizeInKB > 256) {
                    setFileSizeError('File size should not exceed 256KB.');
                    return;
                }
                setFileSizeError('');

                var reader = new FileReader();
                reader.onloadend = function () {
                    // setImage(reader.result);
                    // setImageStatus(false);
                    setSelectedImage(reader.result)
                    setCropImageModal(true)
                };
                reader.onload = function (event) {
                    const img = new Image();
                    img.onload = function () {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        const jpegUrl = canvas.toDataURL('image/jpeg');
                        setImage(jpegUrl);
                    };
            
                    img.src = event.target.result;
                };
                reader.readAsDataURL(acceptedFiles[0]);
            }
        },
    });  

    console.log('asdasdw', fileSizeError)

    const handesetSaveTrue = () => {
        setIsEnabled(true)
    }

    const handledelete = () => {
        setImage(null);
        setImageStatus(false);
        setIsEnabled(true);
      }

    const handleImage = () => {

        let data = {
            companyId: storage1?.company_id,
            image: image,
        }

        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(uploadSignature(data, () => { }))
        )

        setIsEnabled(false)
        setForm(true)
    }


    useEffect(() => {
        
        if (image !== null) {
            setIsEnabled(true)      
        }

    }, [image, imageStatus])

    return (
        <Card
            style={{
                width: '100%',
                height: '100%',
                borderRadius: '50px',
                backgroundColor: '#f5f5f5',
            }}
        >
            <Grid
                container
                display='flex'
                flexDirection='row'
                alignItems='center'
                spacing={2}
                p={3}
            >
                <Grid size={12}>
                    <Typography sx={{fontSize: '14px'}}>Signature</Typography>
                </Grid>

                <Grid
                    onClick={() => {
                        handesetSaveTrue;
                    }}
                    sx={{minHeight: 19, display: 'flex', justifyContent: 'center'}}
                    size={12}>
                    <AvatarViewWrapper {...getRootProps({className: 'dropzone'})}>
                        <input {...getInputProps()} />
                        <label htmlFor='icon-button-file'>
                        {/* <Avatar
                            sx={{
                                width: { xs: 300, sm: 250, md: 250, lg: 240 },
                                height: { xs: 120, sm: 120, md: 120, lg: 120 },
                                cursor: 'pointer',
                                variant:'square'
                            }}
                            src={imageStatus ? signature[0]?.image : image}
                            variant='square'
                        /> */}
                        <img
                          style={{
                            width: '250px',
                            height: '120px',
                            objectFit: 'contain', // This works only if you set this property on the Box
                          }}
                          src={imageStatus ? signature[0]?.image : image}
                         
                          // variant="square"
                        />
                        <Box className='edit-icon'>
                            <EditIcon />
                        </Box>
                        {(image !== null || imageStatus) &&  (
                        <Box className="delete-icon" onClick={(e) => {e.stopPropagation(); handledelete(); 

}}
>
                              <DeleteIcon/>
                            </Box>
                        )}
                        </label>
                    </AvatarViewWrapper>
                    
                    <Dialog open={cropImageModal} >
                                <ImageCrop
                                selectedImage={selectedImage}
                                onClose={()=> setCropImageModal(false)}
                                  onSubmit={(val)=> {
                                    setImageStatus(false)
                                    setImage(val)
                                    setCropImageModal(false)
                                  }}
                                />
                            </Dialog>
                </Grid>

                <Grid sx={{display: 'flex', justifyContent: 'center'}} size={12}>
                    { fileSizeError ?
                        <Alert severity='error'>
                            <Typography sx={{fontSize: '12px'}}>
                                {fileSizeError}
                            </Typography>
                        </Alert>
                        :
                        <Alert severity='info'>
                            <Typography sx={{fontSize: '12px'}}>
                                File size should not exceed 256KB.
                            </Typography>
                        </Alert>
                    }
                </Grid>

                {isEnabled ? (
                    <Grid sx={{display: 'flex', justifyContent: 'flex-end'}} size={12}>
                        <Button
                        variant='outlined'
                        sx={{
                            height: '2rem',
                            ':hover': {
                            bgcolor: '#0A8FDC',
                            color: 'white',
                            },
                        }}
                        onClick={handleImage}
                        >
                        {'Save'}
                        </Button>
                    </Grid>
                    ) : (
                    <></>
                )}
                
            </Grid>
        </Card>
    );
}
